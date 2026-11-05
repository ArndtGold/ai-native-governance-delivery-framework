import { runEvidencePath } from './run-identity.js';
import { resolveMcpInput } from '../mcp-input-resolution.js';
import { resources } from '../resources/context.js';
import { continueDeliveryCall, preparedCommandCall, originalOperationCall } from './prepared-control-calls.js';
import { commandGroupDefinition } from './run-command-schema.js';
import { inspectRunInputResolution } from './run-input-resolution.js';

import { resolutionRecordVersion, currentInputResolution, isOriginalInputResolution, withInputResolution } from './input-resolution.js';
import { assertInputConfigurationCurrent } from '../resources/configuration.js';
import { initializeCanonicalProject, inspectCanonicalProject } from './canonical-initialization.js';
import { assertProjectGitRoot, inspectProjectState, projectOperationStatusCall } from '../control-inspect/project-state.js';
import { canonicalInitPlan } from '../resources/canonical-init-plan.js';

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
import { pendingRunStepPath } from './run-step-pending.js';
import { readPendingRunStepJournal, recoverPendingRunStepLocked, pendingRunStepConflictIds, withRunStepRecoveryLock } from './run-step-transaction.js';
import { previewSourceRevision, applySourceRevision, recoverSourceRevision, reopenPrdRevision } from './run-revision.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';
import { parseRunState } from './run-state-parser.js';
import { existsSync } from 'node:fs';
import { createRunCommand, creationRunId } from './run-create-command.js';
import { assertCanonicalRunStore } from './run-store-inspection.js';
import { grantedMaterial } from './run-material.js';
import { ownedRecordingGitObservation } from './run-verified-change.js';
import { withControlRecovery } from './control-layout.js';
import { PLANNING_COMMAND_KINDS } from './run-command-schema.js';
import { inspectPlannedOperation, replayPlannedUr, mutatePlannedUr, planningId } from './planned-entry.js';
import { createRunFromPlanned } from './planned-handoff.js';

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
  return withRunStepRecoveryLock(root, input.run_id, () => withControlRecovery(root, { resource: `run:${input.run_id}`, operation_id: input.operation_id,
    proveOutcome: result => result.outcome === 'recovered' && !existsSync(pendingRunStepPath(root, input.run_id))
      && runSealState(root, readFileSync(path, 'utf8')).status === 'valid' }, () => {
    const perform = () => {
    const other = pendingRunStepConflictIds(root, input.run_id).find(id => id !== input.run_id);
    if (other) return { outcome: 'recovery_required', reason: 'another_pending_operation', pending_run_id: other };
    if (!existsSync(pendingRunStepPath(root, input.run_id))) {
      const observed = safeOperationStatus(root, input);
      return observed.status === 'recorded' && observed.family === payload.original_kind
        ? { outcome: 'recovered', status: 'already_completed', historical_effect: true, receipt: observed.receipt }
        : { outcome: 'recovery_required', reason: 'original_operation_unconfirmed' };
    }
    const pending = readPendingRunStepJournal(root, input.run_id);
    if (resolutionRecordVersion(pending) !== 7 || pending.kind !== payload.original_kind || pending.operation_id !== input.operation_id
      || pending.target_id !== input.target_id || digest(canonicalJson(pending)) !== payload.pending_digest
      || ![pending.old_revision_id, pending.next_revision_id].includes(input.expected_revision_id)
      || payload.recovery_revision_id !== input.expected_revision_id) return { outcome: 'rejected', reason: 'recovery_binding_invalid' };
    const statePath = `.agdf/control/runs/${input.run_id}/RUN_STATE.md`;
    if (hasSymlinkComponent(root, statePath) || containedRegularFile(root, statePath).status !== 'valid') return { outcome: 'rejected', reason: 'run_path_invalid' };
    const raw = readFileSync(path, 'utf8');
    const parsed = parseRunState(raw, input.run_id);
    if (!parsed.valid || parsed.meta.revision_id !== input.expected_revision_id) return { outcome: 'rejected', reason: 'stale_revision' };
    return { outcome: 'recovered', ...recoverPendingRunStepLocked(root, input.run_id) };
    };
    return perform();
  }));
}

// Fixed permission groups; adapters share this service. Test seams are private.
function proposalInput(root, input, grants) {
  const reference = input.command.payload.proposal;
  if (!reference.material_id) return { reference };
  const canonical = { path: runEvidencePath(input.run_id, `EVIDENCE-${reference.digest.slice(7)}.json`), digest: reference.digest };
  const observed = safeOperationStatus(root, input);
  if (observed.status === 'recorded' || input.command.kind === 'source_revision.recover' && observed.status === 'committed_recovery_required') return { reference: canonical };
  const material = grantedMaterial(input, reference, grants);
  if (material.slot !== 'EVIDENCE') throw Error('material_binding_invalid');
  return { reference: canonical, material: { path: canonical.path, digest: canonical.digest, content: material.content } };
}
export function createRunCommandService({ packageVersion = '0.14.5', enabledGroups = Object.keys(RUN_COMMAND_GROUPS), checkpoint = () => {}, runtimeControl, materialGrants = [], gitObservation, initializationProducer, inputDefaults = resources.defaults } = {}) {
  if (!Array.isArray(enabledGroups) || new Set(enabledGroups).size !== enabledGroups.length) throw Error('command_group_unsupported');
  const enabled = new Set(enabledGroups);
  if ([...enabled].some(group => !Object.hasOwn(RUN_COMMAND_GROUPS, group))) throw Error('command_group_unsupported');
  return function executeRunCommand(group, input) {
    // CLI and MCP enter the same normalization/replay seam, even when the CLI
    // supplied every field explicitly. A family never stores an unwrapped record.
    if (!currentInputResolution()) {
      try {
        const selected = resolveMcpInput(commandGroupDefinition(group), input, {
          defaults: inputDefaults, lookupOriginal: inspectRunInputResolution,
        });
        return withInputResolution(selected.resolution, () => executeRunCommand(group, selected.arguments), selected.original);
      } catch (error) { return { schema_version: '1', outcome: 'rejected', reason: error.code ?? error.message,
        dispatch: 'not_dispatched', authorizes: false }; }
    }
    return withLiveControlReads(() => {
      const diagnostics = validateRunCommand(group, input);
      if (diagnostics.length) return { schema_version: '1', outcome: 'rejected', reason: 'command_schema_invalid', diagnostics, authorizes: false };
      const requestDigest = runCommandRequestDigest(input);
      const selectedInput = input.command.kind === 'run.create' ? { ...input, run_id: creationRunId(input.operation_id), expected_revision_id: null } : input;
      const scoped = TARGET_SCOPED_COMMAND_KINDS.includes(input.command.kind);
      const planning = PLANNING_COMMAND_KINDS.includes(input.command.kind);
      let root, dispatched = false;
      const result = (outcome, reason, family = {}, extra = {}) => {
        const status = root && !scoped && !planning ? safeOperationStatus(root, selectedInput) : null;
        const receipt = family.receipt ?? status?.receipt ?? null;
        const response = { schema_version: '1', outcome, reason: reason ?? null, operation_id: input.operation_id,
          request_digest: requestDigest, binding: planning ? { target_id: input.target_id, planning: input.planning, kind: input.command.kind }
            : input.command.kind === 'project.initialize' ? { target_id: input.target_id, kind: 'project.initialize' } : { target_id: input.target_id, run_id: selectedInput.run_id ?? null, expected_revision_id: selectedInput.expected_revision_id ?? null, kind: input.command.kind },
          effect: receipt?.effect ?? null, receipt, historical_effect: Boolean(family.historical_effect || outcome === 'already_applied'),
          current: planning ? family.run_id && root ? observeCurrentRunCommand(root, { ...selectedInput, run_id: family.run_id }, gitObservation)
            : family.entry ? { available: true, planning: { plan_id: family.entry.plan_id, digest: family.entry.digest }, readiness: family.entry.readiness }
              : { available: false, reason: 'planning_scoped_command' }
            : scoped ? { available: false, reason: 'target_scoped_command' } : root ? input.command.kind === 'project.initialize' ? { available: true, setup: inspectCanonicalProject(root, { operationId: input.operation_id }) } : observeCurrentRunCommand(root, selectedInput, gitObservation) : { available: false, reason: 'target_unavailable' },
          assurance: COOPERATIVE_ASSURANCE, authorizes: false,
          recovery: ['effect_unknown', 'recovery_required'].includes(outcome) ? input.command.kind === 'project.initialize'
            ? 'Inspect the supplied project.initialize/original-UUID status call without Run/revision. Preserve the exact saved original request; never create another setup or Run to escape uncertainty.'
            : 'Inspect operation-status with the original UUID and preserve the exact original payload. Do not infer absence or create another decision.' : null,
          ...(['effect_unknown', 'recovery_required'].includes(outcome) && input.command.kind === 'project.initialize' ? { next_calls: [projectOperationStatusCall(input)] } : {}),
          // The envelope already carries this exact receipt; the family copy only doubled the response.
          family_result: family.receipt && receipt && canonicalJson(family.receipt) === canonicalJson(receipt)
            ? (({ receipt: _receipt, ...rest }) => rest)(family) : family, ...extra };
        response.operation_status_call = originalOperationCall(input);
        if (['accepted', 'already_applied'].includes(outcome)) {
          const common = { presentation_language: input.presentation_language, working_directory: input.working_directory,
            primary_target: input.primary_target, target_source: input.target_source, target_id: input.target_id };
          const inspect = argumentsValue => ({ tool: 'agdf_inspect', arguments: { ...common, ...argumentsValue } });
          if (input.command.kind === 'planned_ur.create' && family.entry) response.next_calls = [
            inspect({ operation: 'planned-inventory' }), inspect({ operation: 'planned-entry', planning: {
              plan_id: family.entry.plan_id, expected_digest: family.entry.digest } })];
          if (['run.create', 'run.create_from_planned'].includes(input.command.kind) && response.current.available) {
            const run_id = family.run_id ?? selectedInput.run_id;
            response.next_calls = [inspect({ operation: 'inventory' }), inspect({ operation: 'gate-check', run_id }),
              inspect({ operation: 'delivery-map', run_id }), inspect({ operation: 'operation-contract',
                module: 'agdf_prepare/presentation.prepare', run_id, expected_revision_id: response.current.revision_id, gate: 'UR' })];
          }
          if (input.command.kind === 'presentation.prepare' && family.presentation_id && family.revision_id)
            response.next_calls = response.current.lifecycle === 'active' && response.current.revision_id === family.revision_id
              ? [preparedCommandCall('agdf_prepare', 'presentation.deliver', { ...input, expected_revision_id: family.revision_id },
                { gate: family.gate, presentationId: family.presentation_id }).call]
              : [inspect({ operation: 'presentation-document', run_id: input.run_id,
                expected_revision_id: family.revision_id, gate: family.gate, presentation_id: family.presentation_id })];
          if (!response.historical_effect && response.current.available && response.current.lifecycle === 'active'
              && ['run.create', 'run.create_from_planned', 'step.record', 'artefact.record', 'ur_draft.replace', 'approval.record'].includes(input.command.kind))
            response.next_calls = [continueDeliveryCall({ ...input, primary_target: root }, response.current.run_id ?? family.run_id ?? selectedInput.run_id)];
        }
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
        if (planning) {
          if (kind === 'planned_ur.create' && (input.planning.plan_id !== planningId(input.operation_id) || input.planning.expected_digest !== null))
            return result('rejected', 'planning_identity_mismatch', {}, { dispatch: 'not_dispatched',
              diagnostics: [{ code: 'planning_identity_mismatch', field: 'planning', expected_plan_id: planningId(input.operation_id), expected_digest: null }],
              recovery: 'Reserve the create UUID before staging. Restage the UR with planning.plan_id = plan-<this planned_ur.create operation_id> and expected_digest = null; use that same scope for material and create. No operation was dispatched.' });
          if (kind === 'planned_material.stage') return result('rejected', 'material_state_unavailable', {}, { dispatch: 'not_dispatched' });
          if (kind === 'run.create_from_planned') {
            if (input.planning.expected_digest === null) return result('rejected', 'planning_source_required', {}, { dispatch: 'not_dispatched' });
            checkpoint('before_dispatch'); dispatched = true;
            const family = createRunFromPlanned(root, { ...input.planning, operation_id: input.operation_id, target_id: input.target_id,
              request_digest: requestDigest, presentation_language: input.presentation_language, title: payload.title }, { packageVersion, checkpoint });
            checkpoint('before_result');
            return result(family.outcome === 'accepted' ? 'accepted' : 'already_applied', null, family);
          }
          const previous = inspectPlannedOperation(root, input.planning.plan_id, input.operation_id);
          if (previous.receipt) {
            if (previous.receipt.kind !== kind || previous.receipt.request_digest !== requestDigest) return result('rejected', 'operation_payload_conflict');
            const family = replayPlannedUr(root, { plan_id: input.planning.plan_id, operation_id: input.operation_id, request_digest: requestDigest });
            return result('already_applied', null, family);
          }
          const material = grantedMaterial(input, payload.source, materialGrants);
          if (material.slot !== 'UR') return result('rejected', 'material_slot_mismatch');
          checkpoint('before_dispatch'); dispatched = true;
          const family = mutatePlannedUr(root, { kind, ...input.planning, operation_id: input.operation_id, request_digest: requestDigest,
            content: material.content, ...(kind === 'planned_ur.create' ? { priority: payload.priority } : {}) }, { checkpoint });
          checkpoint('before_result');
          return result(family.outcome, null, family);
        }
        if (kind === 'project.initialize') {
          const gitIdentity = canonicalJson(assertProjectGitRoot(root, gitObservation));
          const state = inspectCanonicalProject(root, { operationId: input.operation_id });
          if (state.receipt?.operation.operation_id === input.operation_id && state.receipt.operation.request_digest !== requestDigest)
            return result('rejected', 'operation_payload_conflict', {}, { dispatch: 'not_dispatched' });
          if (state.operation_status === 'recorded' && state.status !== 'pending') {
            const continuation = inspectProjectState(root, input, gitObservation);
            return result('already_applied', null, {
              receipt: state.receipt, historical_effect: true, status: 'unchanged', created_run: false,
              created_gate_approval: false, next_calls: continuation.next_calls,
              ...(continuation.recovery_only ? { recovery_only: continuation.recovery_only } : {}) });
          }
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
          const continuation = inspectProjectState(root, input, gitObservation);
          return result(family.historical_effect ? 'already_applied' : 'accepted', null,
            { ...family, next_calls: continuation.next_calls,
              ...(continuation.recovery_only ? { recovery_only: continuation.recovery_only } : {}) });
        }
        if (kind === 'run.create') {
          // Preflight only; the writer repeats validation before publication.
          assertCanonicalRunStore(root, { historicalRead: isOriginalInputResolution() });
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
          const record = kind === 'artefact.record' ? { step: 'artefact', gate: payload.gate, material: payload.material, reviewer: payload.reviewer, reviewed: payload.reviewed, updateDraft: payload.update_draft }
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
        if (planning && /RECOVERY_REQUIRED|ADMISSION_UNKNOWN/u.test(error.message)) return result('recovery_required', error.message, {}, { dispatch: dispatched ? 'unknown' : 'not_dispatched' });
        if (planning && error.message === 'AGDF_PLANNED_METADATA_INVALID')
          return result('rejected', error.message, {}, { dispatch: 'not_dispatched',
            diagnostics: [{ code: error.message, field: 'source' }],
            recovery: input.command.kind === 'planned_ur.create'
              ? 'Restage the canonical UR without Planning schema, Planning id or Planning priority lines. The create writer adds those fields from the request. Keep the reserved create UUID and planning scope; no operation was dispatched.'
              : 'Restage the full selected canonical UR with exactly one Planning schema: planned-ur-v1, Planning id matching the selected plan_id, and Planning priority: high, normal or low before the first section. Preserve the selected plan_id and expected_digest; no operation was dispatched.' });
        if (planning && /^AGDF_(?:PLANNED_(?:SOURCE_STALE|UR_NOT_READY|TITLE_INVALID|CONTENT_INVALID|METADATA_INVALID|OPERATION_INVALID|ID_INVALID|COLLISION|HANDOFF_INPUT_INVALID|ALREADY_TRANSFERRED|ORIGIN_UNCONFIRMED)|CONTROL_LAYOUT_MIGRATION_REQUIRED)/u.test(error.message))
          return result('rejected', error.message, {}, { dispatch: 'not_dispatched', ...(error.readiness ? { readiness: error.readiness } : {}) });
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
