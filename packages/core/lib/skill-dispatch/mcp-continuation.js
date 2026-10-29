import { readRunState } from '../control-evaluation/run-state.js';
import { inspectArtefactRecordingMode } from '../control-state/run-artefact-recording.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';

// Transport guidance over existing routes; code, tests and Git remain external.
export function mcpControlContinuation(input, result, availableGroups = []) {
  if (result.terminal || !result.continuation || !result.target?.governance_target) return result;
  const continuation = result.continuation, root = result.target.governance_target;
  const run = continuation.run_id ?? result.control?.run_id, revision = continuation.revision_id ?? result.control?.revision_id;
  const targetId = resolveControlCommandTarget(root).target_id;
  const common = { presentation_language: input.presentationLanguage, working_directory: input.workingDirectory,
    primary_target: root, target_source: input.targetSource };
  const bound = { ...common, run_id: run, expected_revision_id: revision };
  const inspect = (operation, extra = {}, bind = true) => ({ tool: 'agdf_inspect', arguments: { operation, ...(bind ? bound : common), ...extra } });
  const { steps, template_path, artifact_path, ...retained } = continuation;
  let recording;
  if (['prd_definition', 'sd_definition', 'tp_definition'].includes(continuation.phase))
    recording = inspectArtefactRecordingMode(readRunState(root, { runId: run, ignoreRunIdEnv: true }), result.control.current_gate);
  let nextCalls, requiredGroups = [], instruction = continuation.instruction ?? '';
  if (continuation.phase === 'run_missing' || continuation.phase === 'resolve_delivery_run') {
    requiredGroups = ['agdf_run'];
    nextCalls = [inspect('operation-contract', { module: 'agdf_run/run.create' }, false)];
    instruction = continuation.phase === 'resolve_delivery_run'
      ? instruction.replace('choose an unused run_id and redispatch with intake: true and intake_mode: new', 'call agdf_run/run.create with a new original operation UUID and semantic title; resume its returned Run/revision')
      : 'Create independent work via agdf_run/run.create with the requested semantic title and one original UUID. Resume returned Run/revision. No validator or user ID question.';
  } else if (run && revision) {
    const phase = continuation.phase;
    const kind = phase === 'presentation_required' ? 'presentation.prepare'
      : phase === 'compact_closeout' || phase === 'closeout' ? 'closeout.record'
      : phase === 'ur_definition' && continuation.draft_registered ? 'ur_draft.replace'
      : ['prd_definition', 'sd_definition', 'tp_definition', 'required_gate_artifact'].includes(phase) ? 'artefact.record'
      : phase === 'verified_change_record' || phase === 'compact_implementation' && continuation.mode === 'verified_change' ? 'verified_change.record' : 'step.record';
    const group = kind === 'presentation.prepare' ? 'agdf_prepare' : kind === 'closeout.record' ? 'agdf_closeout'
      : kind === 'ur_draft.replace' ? 'agdf_revise' : 'agdf_record';
    requiredGroups = kind === 'presentation.prepare' ? [group] : [group, 'agdf_record'];
    nextCalls = [inspect('authoring-inputs'), inspect('operation-contract', { module: `${group}/${kind}` })];
    instruction = phase === 'presentation_required'
      ? 'Prepare this gate via agdf_prepare/presentation.prepare, then presentation.deliver: default markdown, optional non-primary decision-view. Forward selected text once. Wait for a NEW deliberate response; earlier replies cannot approve it.'
      : `${instruction} Typed MCP: read every authoring-inputs page for current templates/sources. Stage UTF-8 via agdf_record/material.stage: begin, parts <=16 KiB, seal. Use returned references with ${group}/${kind}; operation-contract supplies fields. Attest mappings only after source review. All four modes: control uses MCP; editing/tests/Git stay external. Redispatch this Run/returned revision. No run-update or local validator when these groups are available.`;
    if (continuation.mode === 'verified_change') instruction = instruction.replace(/through the existing record\/run-update owner/gu, 'through verified_change.record phase execution')
      .replace(/Complete the linked Verified Change Mini-Closeout.*?Git-aware CLI evaluation\./u, 'Stage the linked Verified Change Mini-Closeout and use closeout.record with its exact confirmation; the Core checks actual Git observations.');
  }
  const missing = [...new Set(requiredGroups)].filter(group => !availableGroups.includes(group));
  if (missing.length) return { ...result, presentation: continuation.phase === 'presentation_required' ? null : result.presentation,
    continuation: { ...continuation, control_transport: 'cli_fallback', missing_mcp_groups: missing,
      transport_reason: 'required_mcp_group_unavailable' } };
  return { ...result, presentation: continuation.phase === 'presentation_required' ? null : result.presentation,
    continuation: { ...retained, instruction, control_transport: 'typed_mcp', external_execution: ['source edits', 'actual tests', 'Git operations'],
      ...(recording ? { recording, instruction: instruction + ' ' + recording.instruction } : {}),
      ...(nextCalls ? { next_calls: nextCalls } : {}) } };
}
