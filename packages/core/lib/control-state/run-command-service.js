import { resolutionRecordVersion, currentInputResolution } from './input-resolution.js';
import { assertInputConfigurationCurrent } from '../resources/configuration.js';
import { initializeCanonicalProject, inspectCanonicalProject } from './canonical-initialization.js';
import { assertProjectGitRoot, inspectProjectState, projectOperationStatusCall } from '../control-inspect/project-state.js';
import { canonicalInitPlan } from '../resources/canonical-init-plan.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { resolveTaskTarget } from '../task-target-resolution.js';
import { withLiveControlReads } from '../control-read/fs.js';
import { evaluateGateCheck } from '../control-evaluation/gate-check.js';
import { policyForRunContent } from '../control-evaluation/run-step-policy.js';
import { RUN_COMMAND_GROUPS, RUN_COMMAND_LIMITS, TARGET_SCOPED_COMMAND_KINDS, runCommandRequestDigest, validateRunCommand } from './run-command-contract.js';
import { previewRunClosure, applyRunClosure } from './run-closure.js';
import { COOPERATIVE_ASSURANCE, canonicalJson, digest, resolveControlCommandTarget } from './approval-command-contract.js';
import { readRun } from './run-state-edits.js';
import { runSealState } from './run-seal.js';
import { runPath } from './run-state-reader.js';
import { withOwnedFileLock } from './run-state-writer.js';
import { assertRunOperationIdentity } from './run-operation-identity.js';
import { prepareRunPresentation } from './run-presentation.js';
import { executeApprovalCommand } from './approval-command.js';
import { recordRunStep, recordRunPresentationDecision } from './run-steps.js';
import { inspectRunOperation } from './run-operation-status.js';
import { readOperationSource } from './run-operation-proof.js';
import { pendingRunStepIds, pendingRunStepPath } from './run-step-pending.js';
import { readPendingRunStepJournal, recoverPendingRunStepLocked, pendingRunStepConflictIds, withRunStepRecoveryLock } from './run-step-transaction.js';
import { previewSourceRevision, applySourceRevision, recoverSourceRevision, reopenPrdRevision } from './run-revision.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';
import { parseRunState } from './run-state-parser.js';
import { existsSync } from 'node:fs';
import { createRunCommand, creationRunId } from './run-create-command.js';
import { assertCanonicalRunStore } from './run-store-inspection.js';
import { grantedMaterial } from './run-material.js';
import { ownedRecordingGitObservation } from './run-verified-change.js';

function safeOperationStatus(root, input) {
  try { return inspectRunOperation(root, { runId: input.run_id ?? creationRunId(input.operation_id), operationId: input.operation_id, targetId: input.target_id }); }
  catch { return { status: 'unknown', reason: 'operation_observation_unavailable' }; }
}

function assertCommandRunPath(root, input) {
  const relative = `.agdf/control/runs/${input.run_id}/RUN_STATE.md`;
  if (hasSymlinkComponent(root, relative) || containedRegularFile(root, relative).status !== 'valid') throw Error('run_path_invalid');
}

export function observeCurrentRunCommand(root, input, gitObservation) {
  try {
    const run = readRun(root, input.run_id);
    if (run.rejection) return { available: false, reason: run.rejection.reason };
    if (runSealState(root, run.content).status !== 'valid') return { available: false, reason: 'seal_invalid' };
    const report = evaluateGateCheck(root, { runId: input.run_id, presentationLanguage: input.presentation_language }, gitObservation);
    return { available: true, revision: Number(run.meta.revision), revision_id: run.meta.revision_id, lifecycle: run.meta.lifecycle,
      gate: report.current_gate, status: report.status, missing_approval: report.missing_approval,
      blocking_reason: report.blocking_reason ?? null, next_operation: report.next_operation, completion: report.completion };
  } catch { return { available: false, reason: 'current_observation_unavailable' }; }
}

function boundedRecover(root, input) {
  const payload = input.command.payload, path = runPath(root, input.run_id);
  assertCommandRunPath(root, input);
  return withRunStepRecoveryLock(root, input.run_id, () => {
    const other = pendingRunStepConflictIds(root, input.run_id).find(id => id !== input.run_id);
    if (other) return { outcome: 'recovery_required', reason: 'another_pending_operation', pending_run_id: other };
    if (!existsSync(pendingRunStepPath(root, input.run_id))) {
      const observed = safeOperationStatus(root, input);
      return observed.status === 'recorded' && observed.family === payload.original_kind
        ? { outcome: 'recovered', status: 'already_completed', historical_effect: true, receipt: observed.receipt }
        : { outcome: 'recovery_required', reason: 'original_operation_unconfirmed' };
    }
    const pending = readPendingRunStepJournal(root, input.run_id);
    if (![3, 4].includes(resolutionRecordVersion(pending)) || pending.kind !== payload.original_kind || pending.operation_id !== input.operation_id
      || pending.target_id !== input.target_id || digest(canonicalJson(pending)) !== payload.pending_digest
      || ![pending.old_revision_id, pending.next_revision_id].includes(input.expected_revision_id)
      || payload.recovery_revision_id !== input.expected_revision_id) return { outcome: 'rejected', reason: 'recovery_binding_invalid' };
    const statePath = `.agdf/control/runs/${input.run_id}/RUN_STATE.md`;
    if (hasSymlinkComponent(root, statePath) || containedRegularFile(root, statePath).status !== 'valid') return { outcome: 'rejected', reason: 'run_path_invalid' };
    const raw = readFileSync(path, 'utf8');
    const parsed = parseRunState(raw, input.run_id);
    if (!parsed.valid || parsed.meta.revision_id !== input.expected_revision_id) return { outcome: 'rejected', reason: 'stale_revision' };
    return { outcome: 'recovered', ...recoverPendingRunStepLocked(root, input.run_id) };
  });
}

// Fixed permission groups; adapters share this service. Test seams are private.
function proposalInput(root, input, grants) {
  const reference = input.command.payload.proposal;
  if (!reference.material_id) return { reference };
  const canonical = { path: `.agdf/control/artefacts/${input.run_id}/EVIDENCE-${reference.digest.slice(7)}.json`, digest: reference.digest };
  const observed = safeOperationStatus(root, input);
  if (observed.status === 'recorded' || input.command.kind === 'source_revision.recover' && observed.status === 'committed_recovery_required') return { reference: canonical };
  const material = grantedMaterial(input, reference, grants);
  if (material.slot !== 'EVIDENCE') throw Error('material_binding_invalid');
  return { reference: canonical, material: { path: canonical.path, digest: canonical.digest, content: material.content } };
}
export function createRunCommandService({ packageVersion = '0.14.5', enabledGroups = Object.keys(RUN_COMMAND_GROUPS), checkpoint = () => {}, runtimeControl, materialGrants = [], gitObservation, initializationProducer } = {}) {
  if (!Array.isArray(enabledGroups) || new Set(enabledGroups).size !== enabledGroups.length) throw Error('command_group_unsupported');
  const enabled = new Set(enabledGroups);
  if ([...enabled].some(group => !Object.hasOwn(RUN_COMMAND_GROUPS, group))) throw Error('command_group_unsupported');
  return function executeRunCommand(group, input) {
    return withLiveControlReads(() => {
      const diagnostics = validateRunCommand(group, input);
      if (diagnostics.length) return { schema_version: '1', outcome: 'rejected', reason: 'command_schema_invalid', diagnostics, authorizes: false };
      const requestDigest = runCommandRequestDigest(input);
      const selectedInput = input.command.kind === 'run.create' ? { ...input, run_id: creationRunId(input.operation_id), expected_revision_id: null } : input;
      const scoped = TARGET_SCOPED_COMMAND_KINDS.includes(input.command.kind);
      let root, dispatched = false;
      const result = (outcome, reason, family = {}, extra = {}) => {
        const status = root && !scoped ? safeOperationStatus(root, selectedInput) : null;
        const receipt = family.receipt ?? status?.receipt ?? null;
        const response = { schema_version: '1', outcome, reason: reason ?? null, operation_id: input.operation_id,
          request_digest: requestDigest, binding: input.command.kind === 'project.initialize' ? { target_id: input.target_id, kind: 'project.initialize' } : { target_id: input.target_id, run_id: selectedInput.run_id ?? null, expected_revision_id: selectedInput.expected_revision_id ?? null, kind: input.command.kind },
          effect: receipt?.effect ?? null, receipt, historical_effect: Boolean(family.historical_effect || outcome === 'already_applied'),
          current: scoped ? { available: false, reason: 'target_scoped_command' } : root ? input.command.kind === 'project.initialize' ? { available: true, setup: inspectCanonicalProject(root, { operationId: input.operation_id }) } : observeCurrentRunCommand(root, selectedInput, gitObservation) : { available: false, reason: 'target_unavailable' },
          assurance: COOPERATIVE_ASSURANCE, authorizes: false,
          recovery: ['effect_unknown', 'recovery_required'].includes(outcome) ? input.command.kind === 'project.initialize'
            ? 'Inspect the supplied project.initialize/original-UUID status call without Run/revision. Preserve the exact saved original request; never create another setup or Run to escape uncertainty.'
            : 'Inspect operation-status with the original UUID and preserve the exact original payload. Do not infer absence or create another decision.' : null,
          ...(['effect_unknown', 'recovery_required'].includes(outcome) && input.command.kind === 'project.initialize' ? { next_calls: [projectOperationStatusCall(input)] } : {}),
          family_result: family, ...extra };
        if (Buffer.byteLength(JSON.stringify(response)) > (input.command.kind === 'project.initialize' ? 16384 : RUN_COMMAND_LIMITS.result_bytes)) return { schema_version: '1', outcome: dispatched ? 'effect_unknown' : 'rejected',
          reason: 'command_result_budget_exceeded', operation_id: input.operation_id, binding: response.binding, authorizes: false,
          recovery: 'Inspect operation-status with the original UUID. A lost response does not prove non-execution.' };
        return response;
      };
      if (!enabled.has(group)) return result('rejected', 'command_group_disabled', {}, { dispatch: 'not_dispatched' });
      try {
        const target = resolveTaskTarget({ workingDirectory: input.working_directory, targetSource: input.target_source, primaryTarget: input.primary_target });
        if (target.resolution_state !== 'resolved') return result('rejected', target.reason_code, {}, { dispatch: 'not_dispatched' });
        root = target.governance_target;
        if (resolveControlCommandTarget(root).target_id !== input.target_id) return result('rejected', 'target_binding_mismatch', {}, { dispatch: 'not_dispatched' });
        const payload = input.command.payload, kind = input.command.kind;
        if (kind === 'presentation.deliver') return result('rejected', 'connection_control_unavailable', {}, { dispatch: 'not_dispatched' });
        const context = { kind: kind === 'verified_change.record' ? 'step.record' : kind, operation_id: input.operation_id, target_id: input.target_id, request_digest: requestDigest };
        const policy = (target, text, path, preparation = {}) => policyForRunContent(target, text, path, {
          ...preparation, gitObservation: ownedRecordingGitObservation(gitObservation, input.run_id) });
        const bound = { runId: input.run_id, revisionId: input.expected_revision_id, operationId: input.operation_id };
        if (kind === 'project.initialize') {
          const gitIdentity = canonicalJson(assertProjectGitRoot(root, gitObservation));
          const state = inspectCanonicalProject(root, { operationId: input.operation_id });
          if (state.receipt?.operation.operation_id === input.operation_id && state.receipt.operation.request_digest !== requestDigest)
            return result('rejected', 'operation_payload_conflict', {}, { dispatch: 'not_dispatched' });
          if (state.operation_status === 'recorded' && state.status !== 'pending') return result('already_applied', null, {
            receipt: state.receipt, historical_effect: true, status: 'unchanged', created_run: false,
            created_gate_approval: false, next_calls: inspectProjectState(root, input, gitObservation).next_calls });
          if (state.status === 'blocked') return result('rejected', state.reason, {}, { dispatch: 'not_dispatched' });
          canonicalInitPlan(payload.language); // Resource/plan failures are known before dispatch.
          if (state.operation?.operation_id === input.operation_id && state.operation.request_digest !== requestDigest)
            return result('rejected', 'operation_payload_conflict', {}, { dispatch: 'not_dispatched' });
          checkpoint('before_dispatch'); dispatched = true;
          const family = initializeCanonicalProject(root, { operationId: input.operation_id, requestDigest,
            targetId: input.target_id, language: payload.language, producer: `canonical-init/2:${packageVersion}:${initializationProducer ?? 'direct-core'}` }, {
              beforePublish: () => {
                checkpoint('project_before_publish');
                if (canonicalJson(assertProjectGitRoot(root, gitObservation)) !== gitIdentity) throw Error('project_git_identity_changed');
              },
              beforeProspectiveReceipt: () => checkpoint('project_before_prospective_receipt'), afterProspectiveReceipt: () => checkpoint('project_after_prospective_receipt'),
              afterPublish: () => checkpoint('project_after_publish'), afterReceipt: () => checkpoint('project_after_receipt'),
              beforeMarkerCleanup: () => checkpoint('project_before_marker_cleanup') });
          checkpoint('before_result');
          return result(family.historical_effect ? 'already_applied' : 'accepted', null,
            { ...family, next_calls: inspectProjectState(root, input, gitObservation).next_calls });
        }
        if (kind === 'run.create') {
          // Preflight only; the writer repeats validation before publication.
          assertCanonicalRunStore(root);
          checkpoint('before_dispatch'); dispatched = true;
          const family = createRunCommand(root, input, { requestDigest, packageVersion, checkpoint });
          checkpoint('before_result');
          return result(family.outcome === 'already_applied' ? 'already_applied' : 'accepted', null, family);
        }
        if (!scoped) assertCommandRunPath(root, input);
        let family;
        if (kind === 'runtime_generation.replace') {
          const current = observeCurrentRunCommand(root, input);
          if (!current.available || current.revision_id !== input.expected_revision_id) return result('rejected', 'stale_revision');
          if (current.lifecycle !== 'active') return result('rejected', 'lifecycle_ineligible');
          if (payload.confirmation !== `Replace owned runtime: ${payload.candidate.digest}`) return result('rejected', 'confirmation_required');
          if (!runtimeControl) return result('rejected', 'connection_control_unavailable', {}, { dispatch: 'not_dispatched' });
          const source = readOperationSource(root, input.run_id, payload.candidate);
          const candidate = JSON.parse(source.content);
          // The shared Core validates the current binding and contained manifest;
          // only the serving facade owns an actual process handle. No Run write.
          return Promise.resolve(runtimeControl.replace({ input, candidate, requestDigest, resolution: currentInputResolution(),
            revalidate: () => {
              assertInputConfigurationCurrent(root);
              source.validate(); const fresh = observeCurrentRunCommand(root, input);
              if (!fresh.available || fresh.revision_id !== input.expected_revision_id) throw Error('stale_revision');
            } })).then(family => result(family.outcome, family.reason, family, { runtime_control: true }),
              error => result('effect_unknown', error.message, {}, { runtime_control: true }));
        }
        checkpoint('before_dispatch'); dispatched = true;
        if (kind === 'presentation.prepare') {
          family = withOwnedFileLock(runPath(root, input.run_id), () => {
            const run = readRun(root, input.run_id); if (run.rejection) return run.rejection;
            assertRunOperationIdentity(root, run, input.operation_id, kind);
            return prepareRunPresentation(root, { ...bound, gate: payload.gate, language: input.presentation_language, requestDigest }, { evaluateGateCheck, checkpoint });
          });
        } else if (kind === 'approval.record') {
          family = executeApprovalCommand(root, { schema_version: '1', action: 'record_gate_approval', target_id: input.target_id,
            run_id: input.run_id, expected_revision_id: input.expected_revision_id, operation_id: input.operation_id,
            assurance: input.assurance, gate: payload.gate, presentation_id: payload.presentation_id, response: payload.response }, { evaluateGateCheck, packageVersion, checkpoint, commandContext: context });
        } else if (kind === 'presentation_decision.record') {
          family = recordRunPresentationDecision(root, { ...bound, gate: payload.gate, presentationId: payload.presentation_id,
            action: payload.action, comment: payload.comment, requestDigest }, { evaluateGateCheck, packageVersion, afterWrite: checkpoint });
        } else if (['step.record', 'artefact.record', 'ur_draft.replace', 'verified_change.record'].includes(kind)) {
          const record = kind === 'artefact.record' ? { step: 'artefact', gate: payload.gate, evidence: payload.reviewed_request?.path, sourceBinding: payload.reviewed_request,
              ...(payload.material ? { material: payload.material, reviewer: payload.reviewer, reviewed: payload.reviewed, updateDraft: payload.update_draft } : {}) }
            : { step: kind === 'ur_draft.replace' ? 'ur' : kind === 'verified_change.record' ? 'verified_change' : payload.step,
              phase: payload.phase, sourceBinding: payload.source, evidence: payload.source.path, title: payload.title,
              route: payload.route, reason: payload.reason, decision: payload.decision, covers: payload.covers, internalStep: payload.internal_step };
          family = recordRunStep(root, { ...bound, ...record }, { policy, packageVersion, operationContext: context, afterWrite: checkpoint,
            resolveMaterial: reference => grantedMaterial(input, reference, materialGrants), gitObservation });
        } else if (kind === 'operation.recover') family = boundedRecover(root, input);
        else if (kind === 'source_revision.preview' || kind === 'source_revision.apply') {
          const proposal = proposalInput(root, input, materialGrants);
          const revised = { ...bound, sourceGate: payload.source_gate, evidence: proposal.reference.path, previewDigest: payload.preview_digest,
            proposalBinding: proposal.reference, proposalMaterial: proposal.material, confirmation: payload.confirmation, commandContext: context, packageVersion };
          family = kind.endsWith('.apply') ? applySourceRevision(root, revised, { afterWrite: checkpoint }) : previewSourceRevision(root, revised);
        } else if (kind === 'source_revision.recover') {
          const proposal = proposalInput(root, input, materialGrants);
          family = recoverSourceRevision(root, { ...bound, proposalBinding: proposal.reference, proposalMaterial: proposal.material, evidence: proposal.reference.path, sourceGate: payload.source_gate,
            recoveryRevisionId: payload.recovery_revision_id, pendingDigest: payload.pending_digest });
        } else if (kind === 'prd_revision.reopen') {
          family = reopenPrdRevision(root, { ...bound, prdBinding: payload.prd, confirmation: payload.confirmation, commandContext: context, packageVersion }, { afterWrite: checkpoint });
        } else if (kind === 'closure.preview') family = previewRunClosure(root, { entries: payload.entries, language: input.presentation_language });
        else if (kind === 'closure.apply') {
          family = applyRunClosure(root, { previewId: payload.preview_id, confirmation: payload.confirmation, language: input.presentation_language }, { packageVersion, afterWrite: checkpoint });
        } else if (kind === 'closeout.record') {
          family = recordRunStep(root, { ...bound, step: 'closeout', sourceBinding: payload.or, confirmation: payload.confirmation },
            { policy, packageVersion, operationContext: context, afterWrite: checkpoint,
              resolveMaterial: reference => grantedMaterial(input, reference, materialGrants), gitObservation });
        }
        checkpoint('before_result');
        const accepted = ['prepared', 'recorded', 'accepted', 'preview', 'recovered', 'reopened', 'applied'].includes(family?.outcome);
        const repeated = ['already_applied', 'already_prepared', 'replayed'].includes(family?.outcome);
        const status = scoped ? null : safeOperationStatus(root, input);
        if (family?.outcome === 'rejected' && ['pending', 'unknown', 'committed_recovery_required'].includes(status?.status)) return result('effect_unknown', family.reason, family);
        return result(repeated ? 'already_applied' : accepted ? 'accepted' : family?.outcome === 'recovery_required' ? 'recovery_required' : 'rejected', family?.reason, family ?? {});
      } catch (error) {
        if (input.command.kind !== 'closure.apply' && error.facts?.code === 'snapshot_stale' && error.facts.dispatch === 'not_dispatched')
          return result('rejected', 'snapshot_stale', {}, { dispatch: 'not_dispatched' });
        if (!dispatched && input.command.kind === 'run.create' && error.code === 'AGDF_CANONICAL_SCAFFOLD_REQUIRED')
          return result('rejected', error.code, {}, { dispatch: 'not_dispatched', next_calls: [{ tool: 'agdf_inspect', arguments: {
            operation: 'project-state', primary_target: root, target_source: input.target_source,
            working_directory: input.working_directory, presentation_language: input.presentation_language } }] });
        if (error.message === 'AGDF_OPERATION_PAYLOAD_CONFLICT') return result('rejected', 'operation_payload_conflict');
        return result(dispatched ? 'effect_unknown' : 'rejected', error.message, {}, { dispatch: dispatched ? 'unknown' : 'not_dispatched' });
      }
    });
  };
}
