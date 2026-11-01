import { resolveMcpInput } from '#agdf-core/mcp-input-resolution.js';
import { withInputResolution } from '#agdf-core/control-state/input-resolution.js';
import { commandGroupDefinition } from '#agdf-core/control-state/run-command-schema.js';
import { inspectRunInputResolution } from '#agdf-core/control-state/run-input-resolution.js';
import { randomUUID } from 'node:crypto';
import { openSync, closeSync, constants, fstatSync, lstatSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCoreServices } from '#agdf-core';
import { createRunMaterialStore } from '#agdf-core/control-state/run-material.js';
import { resolveControlCommandTarget, digest } from '#agdf-core/control-state/approval-command-contract.js';
import { canonicalRunText, artefactFileDigest } from '#agdf-core/control-state/run-seal.js';
import { inspectRunOperation } from '#agdf-core/control-state/run-operation-status.js';
import { inspectSourceRevision } from '#agdf-core/control-state/run-revision.js';
import { runDocumentPath } from '#agdf-core/control-state/run-identity.js';
import { resources } from '../runtime/control-context.js';
import { cliGitObservation } from '../control-evaluation/git-observation.js';

function sourceText(options, limit = 131072) {
  const supplied = options.stepFields?.evidence;
  if (!supplied) throw Error('A bounded source file is required: --evidence <path>.');
  const path = resolve(options.workingDirectory, supplied), before = lstatSync(path);
  if (!before.isFile() || before.isSymbolicLink() || before.size > limit) throw Error('source_invalid');
  const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const stat = fstatSync(fd), bytes = readFileSync(fd);
    if (stat.ino !== before.ino || stat.dev !== before.dev || stat.size !== before.size || bytes.length > limit) throw Error('source_changed');
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } finally { closeSync(fd); }
}
export function executeRunAlias(options, io = console) {
  const store = createRunMaterialStore();
  try {
    const target = resolveControlCommandTarget(options.dir), fields = options.stepFields ?? {};
    const input = { working_directory: options.workingDirectory, primary_target: target.root,
      target_source: options.dirExplicit ? 'explicit_target' : 'current_repository', target_id: target.target_id,
      operation_id: options.operationId ?? randomUUID(), ...(options.assurance !== undefined ? { assurance: options.assurance } : {}), ...(options.languageExplicit ? { presentation_language: options.language.chat_language } : {}),
      ...(options.runId ? { run_id: options.runId, expected_revision_id: options.revisionId } : {}) };
    const services = grants => createCoreServices({ resources, observers: { gitObservation: cliGitObservation, materialGrants: grants } });
    const normalize = (group, original, action) => {
      const selected = resolveMcpInput(commandGroupDefinition(group), original, { defaults: resources.defaults, lookupOriginal: inspectRunInputResolution });
      return withInputResolution(selected.resolution, () => action(selected.arguments), selected.original);
    };
    const emit = result => { io.log(JSON.stringify(result, null, 2)); return ['accepted', 'already_applied', 'preview', 'historical'].includes(result.outcome) ? 0 : 2; };
    const material = (slot, content) => {
      // The Core digest binds canonical content, not an expiring transfer UUID.
      // A recorded original operation needs no new transfer or stale admission;
      // the Core still checks its exact logical request before acknowledging it.
      const observed = options.runId ? inspectRunOperation(target.root, { runId: options.runId, operationId: input.operation_id, targetId: input.target_id }) : null;
      if (observed?.status === 'recorded') return { material_id: randomUUID(), digest: digest(canonicalRunText(content)) };
      const bytes = Buffer.from(content), stage = payload => normalize('agdf_record', { ...input,
        operation_id: randomUUID(), command: { kind: 'material.stage', payload } }, value => store.stage(value));
      const started = stage({ action: 'begin', files: [{ slot, bytes: bytes.length }] });
      if (started.outcome !== 'accepted') throw Object.assign(Error(started.reason ?? 'material_unavailable'), { result: started });
      const transfer_id = started.family_result.transfer_id;
      for (let offset = 0; offset < bytes.length; offset += 16384) {
        const part = stage({ action: 'append', transfer_id, file: 0, offset, data: bytes.subarray(offset, offset + 16384).toString('base64') });
        if (part.outcome !== 'accepted') throw Object.assign(Error(part.reason ?? 'material_unavailable'), { result: part });
      }
      const sealed = stage({ action: 'seal', transfer_id });
      if (sealed.outcome !== 'accepted') throw Object.assign(Error(sealed.reason ?? 'material_unavailable'), { result: sealed });
      return sealed.family_result.files[0].reference;
    };
    let group, command;
    if (options.target === 'run-create') { group = 'agdf_run'; command = { kind: 'run.create', payload: { title: fields.title } }; }
    else if (options.target === 'run-present') { group = 'agdf_prepare'; command = { kind: 'presentation.prepare', payload: { gate: options.gate } }; }
    else if (options.target === 'run-approve') { group = 'agdf_approve'; command = { kind: 'approval.record', payload: { gate: options.gate, presentation_id: options.presentationId, response: options.response } }; }
    else if (options.target === 'run-step') {
      const step = options.runStep, slot = step === 'artefact' ? options.gate : ({ ur: 'UR', route: 'Brownfield Review', review: 'CR', evidence: 'EVIDENCE', closeout: 'OR' })[step];
      if (!slot) throw Error('step_invalid');
      const source = material(slot, sourceText(options));
      if (step === 'artefact') { group = 'agdf_record'; command = { kind: 'artefact.record', payload: { gate: options.gate, material: source,
        reviewer: fields.reviewer, reviewed: fields.reviewed === 'true', update_draft: fields.updateDraft === 'true' } }; }
      else if (step === 'closeout') { group = 'agdf_closeout'; command = { kind: 'closeout.record', payload: { or: source, confirmation: options.closureConfirmation } }; }
      else { group = 'agdf_record'; command = { kind: 'step.record', payload: { step, source,
        ...(step === 'ur' ? { title: fields.title } : step === 'route' ? { reason: fields.reason, route: fields.route }
          : step === 'review' ? { decision: fields.decision } : { reason: fields.reason, covers: fields.covers }) } }; }
    } else if (options.target === 'run-revise') {
      group = 'agdf_revise';
      if (options.revisionMode === 'inspect') return emit(inspectSourceRevision(target.root, { runId: options.runId, operationId: input.operation_id, revisionId: options.revisionId }));
      if (options.revisionMode) command = { kind: `source_revision.${options.revisionMode}`, payload: {
        source_gate: options.sourceGate, proposal: material('EVIDENCE', sourceText(options)),
        ...(options.revisionMode === 'apply' ? { preview_digest: options.previewDigest, confirmation: options.closureConfirmation }
          : options.revisionMode === 'recover' ? { recovery_revision_id: options.revisionId, pending_digest: options.pendingDigest } : {}) } };
      else { const path = runDocumentPath(options.runId, 'PRD.md'); command = { kind: 'prd_revision.reopen', payload: {
        prd: { path, digest: artefactFileDigest(target.root, path) }, confirmation: options.closureConfirmation } }; }
    } else if (options.target === 'run-close') {
      delete input.run_id; delete input.expected_revision_id;
      group = 'agdf_closeout';
      const entries = options.closureFile ? JSON.parse(sourceText({ ...options, stepFields: { evidence: options.closureFile } }, 65536)).entries
        : [{ run_id: options.runId, outcome: options.closureOutcome, reason: fields.reason,
          ...(options.successorRun ? { successor_run: options.successorRun } : options.successorReference ? { successor_reference: options.successorReference } : {}) }];
      command = { kind: `closure.${options.recoveryAction}`, payload: options.recoveryAction === 'apply'
        ? { preview_id: options.recoveryPreviewId, confirmation: options.closureConfirmation } : { entries } };
    } else throw Error('command_unsupported');
    const bound = { ...input, command };
    return emit(normalize(group, bound, value => services(store.grants(value)).command(group, value)));
  } catch (error) { if (error.result) io.log(JSON.stringify(error.result, null, 2)); else io.error(error.code ?? error.message); return 2; }
  finally { store.close(); }
}
