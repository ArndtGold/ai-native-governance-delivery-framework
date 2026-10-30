// Pure transport projection. Domain outcomes, receipts and eligibility stay with
// their existing owners. No IO, SDK, private reader or mutable registry lives here.
export const TOOL_ERROR_CONTRACT = 'agdf-tool-result/1';
export const TOOL_RESULT_META = 'agdf/tool-result';
const fields = ['schema_version', 'failed', 'code', 'category', 'effect_state', 'action', 'message', 'authorizes'];
const actions = {
  correct_input: ['input', ['invalid_input', 'dispatch_input_invalid', 'inspect_input_invalid', 'command_schema_invalid', 'decision_schema_invalid', 'operation_source_invalid', 'material_binding_invalid', 'material_binding_mismatch', 'material_part_invalid', 'material_part_conflict', 'material_part_offset_invalid', 'material_incomplete', 'authoring_binding_stale_or_invalid', 'authoring_cursor_stale_or_invalid']],
  confirm_target: ['binding', ['target_unresolved', 'target_binding_mismatch', 'no_reliable_target', 'explicit_target_required', 'target_invalid']],
  refresh_binding: ['binding', ['stale_revision', 'revision_mismatch', 'operation_binding_stale_or_invalid', 'artifact_revision_stale', 'decision_binding_changed', 'decision_binding_invalid', 'presentation_state_changed', 'presentation_version_decided', 'presentation_not_found', 'presentation_missing', 'operation_source_changed', 'session_expired', 'source_changed', 'snapshot_stale', 'run_missing', 'invalid_run', 'document_missing', 'recovery_binding_invalid', 'run_path_invalid', 'confirmed_git_project_required', 'AGDF_CANONICAL_SCAFFOLD_REQUIRED', 'AGDF_CANONICAL_INIT_CONFLICT', 'AGDF_CANONICAL_INIT_PARTIAL_UNOWNED', 'AGDF_CANONICAL_INIT_ORIGINAL_OPERATION_REQUIRED', 'AGDF_CANONICAL_INIT_PLAN_DRIFT', 'AGDF_CANONICAL_INIT_TARGET_DRIFT']],
  obtain_authority: ['permission', ['resource_denied', 'host_ui_unsupported', 'app_only_mediation_not_qualified', 'approval_required', 'confirmation_required', 'command_group_disabled', 'permission_denied', 'closeout_not_ready']],
  inspect_operation: ['uncertain', ['effect_unknown', 'recovery_required', 'original_operation_unconfirmed', 'operation_payload_conflict', 'another_pending_operation', 'decision_pending', 'decision_result_unknown', 'dispatch_timeout', 'dispatch_worker_termination_unconfirmed', 'generation_connection_lost', 'generation_response_unknown', 'generation_result_limit', 'command_result_budget_exceeded']],
  retry_after_prerequisite: ['runtime', ['dispatch_busy', 'busy', 'dispatch_cancelled', 'cancelled', 'resource_limit', 'timeout', 'dispatch_output_too_large', 'inspect_output_too_large', 'lifecycle_ineligible', 'generation_unavailable', 'generation_capacity_protected', 'generation_input_limit', 'connection_closed', 'connection_control_unavailable', 'generation_route_capacity', 'generation_replacement_busy', 'connection_control_capacity', 'read_unavailable', 'read_failed', 'diagnostic_cursor_invalid', 'material_transfer_expired', 'material_resource_limit', 'material_state_unavailable', 'delivery_state_unavailable', 'delivery_already_selected', 'decision_display_unconfirmed']],
  repair_runtime: ['runtime', ['runtime_version_mismatch', 'runtime_provenance_invalid']],
  stop: ['unknown', ['dispatch_worker_failed', 'generation_runtime_failed', 'tool_result_invalid', 'unclassified_tool_failure', 'generation_manifest_incompatible']],
};
const causes = new Map(Object.entries(actions).flatMap(([action, [category, codes]]) => codes.map(code => [code, { action, category }])));
const commandNames = new Set(['agdf_project', 'agdf_run', 'agdf_prepare', 'agdf_record', 'agdf_approve', 'agdf_revise', 'agdf_closeout', 'agdf_decision_action']);
export const isEphemeralControlCommand = (name, input = {}) => commandNames.has(name)
  && ['presentation.deliver', 'material.stage'].includes(input.command?.kind);
const commandOutcomes = new Set(['accepted', 'already_applied', 'rejected', 'recovery_required', 'effect_unknown']);
const dispatchOutcomes = new Set(['invalid_input', 'target_unresolved', 'control_result', 'skill_continuation', 'intake_continuation', 'evaluator_error']);
const inspectOutcomes = new Set(['invalid_input', 'target_unresolved', 'inspect_result', 'evaluator_error']);
const exactReads = new Set(['presentation-document', 'presentation-preview', 'operation-contract', 'runtime-generations', 'authoring-inputs', 'project-state']);
const reportReads = new Set(['doctor', 'gate-check', 'delivery-map', 'artifact-readiness', 'operation-status', 'native-qualification', 'contract', 'inventory']);
const readStates = new Set(['available', 'empty', 'partial', 'invalid', 'missing', 'unsupported', 'blocked', 'stale', 'error']);
const safeFields = new Set(['arguments', 'working_directory', 'primary_target', 'target_source', 'presentation_language', 'skill_id', 'run_id', 'expected_revision_id', 'operation_id', 'command', 'module', 'gate', 'cursor', 'operation', 'all_active', 'variant']);
const plain = value => !!value && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const invalid = () => { throw Object.assign(new Error('tool_result_invalid'), { code: 'tool_result_invalid', facts: { code: 'tool_result_invalid', dispatch: 'unknown' } }); };
const textBytes = value => new TextEncoder().encode(JSON.stringify(value)).length;

export function knownExecutionCode(code) { return causes.has(code) ? code : 'dispatch_worker_failed'; }
export function validExecutionFacts(value) {
  return plain(value) && Object.keys(value).every(key => ['code', 'dispatch', 'field', 'cause_code', 'worker_phase'].includes(key))
    && causes.has(value.code) && ['not_dispatched', 'unknown'].includes(value.dispatch)
    && (value.field === undefined || safeFields.has(value.field))
    && (value.cause_code === undefined || value.code === 'dispatch_worker_termination_unconfirmed' && causes.has(value.cause_code))
    && (value.worker_phase === undefined || value.code === 'dispatch_worker_termination_unconfirmed'
      && ['worker_start', 'runtime_provenance', 'operation', 'result'].includes(value.worker_phase));
}
export function executionFacts(error, { phase = 'execute' } = {}) {
  // Callers must establish the phase. An arbitrary exception's message/code is
  // not a typed cause or evidence that a command did not execute.
  const facts = validExecutionFacts(error?.facts) ? error.facts : null;
  if (facts) return { ...facts };
  return { code: 'dispatch_worker_failed', dispatch: phase === 'parse' || phase === 'setup' ? 'not_dispatched' : 'unknown' };
}

export function validateToolDomain(name, result) {
  if (!plain(result) || result.schema_version !== '1' || result._meta !== undefined && !plain(result._meta)) invalid();
  if (name === 'agdf_dispatch' || name === 'agdf_inspect') {
    const outcomes = name === 'agdf_dispatch' ? dispatchOutcomes : inspectOutcomes;
    if (result.contract_version !== 1 || !plain(result.runtime) || !plain(result.timing)
      || !['wrapper_ms', 'input_ms', 'target_ms', 'control_ms', 'render_ms', 'total_ms'].every(key => Number.isFinite(result.timing[key]) && result.timing[key] >= 0
        || name === 'agdf_inspect' && result.timing.measurement_state === 'unavailable' && result.timing.unavailable_reason === 'operation_did_not_complete' && result.timing[key] === null)) invalid();
    if (!outcomes.has(result.outcome) || result.authorizes !== false || typeof result.terminal !== 'boolean'
      || !Array.isArray(result.diagnostics) || !result.diagnostics.every(plain)) invalid();
    if (name === 'agdf_dispatch' && ['skill', 'control', 'continuation'].some(key => result[key] !== null && !plain(result[key]))) invalid();
    if (name === 'agdf_inspect' && result.outcome === 'inspect_result' && !plain(result.report)) invalid();
    if (!plain(result.host_action) || typeof result.host_action.mode !== 'string' || typeof result.host_action.source !== 'string'
      || result.host_action.allow_surrounding_text !== undefined && typeof result.host_action.allow_surrounding_text !== 'boolean'
      || result.host_action.may_request_run_or_evidence !== undefined && typeof result.host_action.may_request_run_or_evidence !== 'boolean'
      || !(result.recovery === null || plain(result.recovery))
      || !(result.target === null || plain(result.target)) || !(result.presentation === null || plain(result.presentation))) invalid();
    if (name === 'agdf_inspect' && (!(result.operation === null || typeof result.operation === 'string')
      || !(result.report === null || plain(result.report))
      || result.outcome !== 'inspect_result' && result.report !== null
      || result.outcome === 'inspect_result' && result.terminal !== false)) invalid();
    if (['invalid_input', 'target_unresolved', 'evaluator_error'].includes(result.outcome)
      && (result.terminal !== true || !['transmit_presentation_verbatim_and_stop', 'transmit_recovery_verbatim_and_stop'].includes(result.host_action.mode)
        || typeof result.host_action.allow_surrounding_text !== 'boolean' || typeof result.host_action.may_request_run_or_evidence !== 'boolean'
        || typeof result.recovery?.action !== 'string' || !result.recovery.action
        || typeof result.host_action.text !== 'string' || !result.host_action.text)) invalid();
  } else if (commandNames.has(name)) {
    if (!commandOutcomes.has(result.outcome) || result.authorizes !== false) invalid();
    if (['accepted', 'already_applied'].includes(result.outcome) ? !(result.receipt === null || plain(result.receipt)) : typeof result.reason !== 'string' || !result.reason) invalid();
  } else if (name === 'agdf_decision_view') {
    if (!['accepted', 'rejected'].includes(result.outcome) || result.authorizes !== false
      || result.outcome === 'rejected' && typeof result.reason !== 'string') invalid();
  } else if (name === 'agdf_cockpit' || name === 'agdf_cockpit_read') {
    if (name === 'agdf_cockpit' && result.state === undefined && result.outcome === undefined) {
      const view = result._meta?.agdf_cockpit;
      if (result.authorizes !== false || !plain(result.target) || typeof result.target.target_id !== 'string'
        || typeof result.target.display_path !== 'string' || !plain(view) || !plain(view.target)
        || view.target.target_id !== result.target.target_id || view.target.display_path !== result.target.display_path
        || typeof view.session_id !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/iu.test(view.session_id)
        || !Number.isSafeInteger(view.render_generation) || view.render_generation < 1) invalid();
    } else if (name === 'agdf_cockpit_read' && result.state === 'available' && result.target === undefined && result.code === undefined) {
      // Decision-session close and preview have existing minimal shapes,
      // distinct from a Cockpit reader DTO with target/snapshot fields.
      const preview = result.data?.preview;
      const closed = plain(result.data) && Object.keys(result.data).join() === 'closed' && result.data.closed === true;
      const rendered = plain(result.data) && Object.keys(result.data).join() === 'preview' && plain(preview)
        && typeof preview.resource_id === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/iu.test(preview.resource_id)
        && typeof preview.content === 'string' && /^sha256:[0-9a-f]{64}$/u.test(preview.content_digest)
        && typeof preview.version === 'string' && preview.version.length > 0;
      const display = plain(result.data) && ['preview', 'ui_primary'].includes(result.data.delivery_state)
        && ['confirmed', 'unconfirmed'].includes(result.data.display) && /^sha256:[a-f0-9]{64}$/.test(result.data.document_digest)
        && Array.isArray(result.data.enabled_actions) && result.data.enabled_actions.every(a => a === 'approve');
      if (result.authorizes !== false || !closed && !rendered && !display
        || Object.keys(result).some(key => !['schema_version', 'state', 'data', 'authorizes', '_meta'].includes(key))) invalid();
    } else if (result.outcome === 'rejected') { if (result.authorizes !== false || typeof result.reason !== 'string') invalid(); }
    else if (!readStates.has(result.state) || !(result.code === null || typeof result.code === 'string')
      || typeof result.retryable !== 'boolean' || !Object.hasOwn(result, 'data')
      || !(result.target === null || plain(result.target)) || !Object.hasOwn(result, 'snapshot_id')) invalid();
  } else invalid();
  return result;
}

function isFailure(name, input, result) {
  if (name === 'agdf_dispatch') return ['invalid_input', 'target_unresolved', 'evaluator_error'].includes(result.outcome);
  if (name === 'agdf_inspect') {
    if (result.outcome !== 'inspect_result') return true;
    if (exactReads.has(input.operation)) return result.report.available !== true;
    if (reportReads.has(input.operation)) return result.report.available === false;
    invalid();
  }
  if (commandNames.has(name)) return !['accepted', 'already_applied'].includes(result.outcome);
  if (result.outcome === 'rejected') return true;
  // Freshness/changes legitimately report a stale snapshot. Nested run/resource
  // states are never considered: only failure of this requested operation is.
  if (['freshness', 'changes'].includes(input.operation) && result.state === 'stale') return false;
  return ['invalid', 'missing', 'unsupported', 'blocked', 'stale', 'error'].includes(result.state);
}

export function describeToolResult(name, input, result, pack, facts) {
  validateToolDomain(name, result);
  const failed = isFailure(name, input, result);
  const descriptor = { schema_version: '1', failed, code: null, category: null, effect_state: null, action: null, message: null, authorizes: false };
  if (!failed) return descriptor;
  const candidate = result.reason ?? result.code ?? result.diagnostics?.[0]?.code ?? result.report?.reason ?? result.target?.reason_code ?? result.outcome;
  let code = causes.has(candidate) ? candidate : result.outcome === 'target_unresolved' ? 'target_unresolved'
    : result.outcome === 'invalid_input' ? 'invalid_input' : result.report?.available === false ? 'read_unavailable' : 'unclassified_tool_failure';
  const canonicalWrite = commandNames.has(name) && !isEphemeralControlCommand(name, input);
  const uncertain = canonicalWrite && ['effect_unknown', 'recovery_required'].includes(result.outcome);
  if (['agdf_inspect', 'agdf_cockpit_read', 'agdf_decision_view'].includes(name) && causes.get(code).action === 'inspect_operation') code = 'read_unavailable';
  let { action, category } = causes.get(code);
  if (uncertain) { action = 'inspect_operation'; category = 'uncertain'; }
  const effect = validExecutionFacts(facts) ? facts.dispatch : result.dispatch === 'not_dispatched' ? 'not_dispatched'
    : commandNames.has(name) ? (uncertain ? 'unknown' : 'owner_reported') : 'owner_reported';
  // A cancelled/disconnected write cannot be offered a blind retry.
  if (canonicalWrite && effect === 'unknown') { action = 'inspect_operation'; category = 'uncertain'; }
  const copy = pack?.mcpErrors;
  if (!copy?.actions?.[action] || !copy?.effects?.[effect]) invalid();
  const field = safeFields.has(facts?.field) ? facts.field : safeFields.has(result.diagnostics?.[0]?.field) ? result.diagnostics[0].field : null;
  const ownerAction = !facts && result.outcome === 'invalid_input'
    && typeof result.recovery?.action === 'string' && result.recovery.action.length <= 700
    && !/[\0\x01-\x08]/u.test(result.recovery.action) ? result.recovery.action : null;
  const workerDetails = validExecutionFacts(facts)
    ? [facts.cause_code && `cause_code=${facts.cause_code}`, facts.worker_phase && `worker_phase=${facts.worker_phase}`].filter(Boolean) : [];
  const message = `${copy.failure} ${code}${field ? ` (${field})` : ''}${workerDetails.length ? ` (${workerDetails.join(', ')})` : ''}. ${copy.effects[effect]} ${ownerAction ?? (action === causes.get(code).action ? copy.causes?.[code] : null) ?? copy.actions[action]}`;
  return { ...descriptor, code, category, effect_state: effect, action, message };
}

export function validateToolDescriptor(value) {
  if (!plain(value) || Object.keys(value).sort().join() !== [...fields].sort().join() || value.schema_version !== '1'
    || typeof value.failed !== 'boolean' || value.authorizes !== false || textBytes(value) > 4096) invalid();
  if (!value.failed) {
    if (['code', 'category', 'effect_state', 'action', 'message'].some(key => value[key] !== null)) invalid();
  } else if (!causes.has(value.code) || !['input', 'binding', 'permission', 'runtime', 'uncertain', 'unknown'].includes(value.category)
    || !['not_dispatched', 'owner_reported', 'unknown'].includes(value.effect_state) || !Object.hasOwn(actions, value.action)
    || typeof value.message !== 'string' || !value.message.trim() || value.message.length > 1200) invalid();
  const expected = causes.get(value.code);
  if (value.failed && !(value.action === expected.action && value.category === expected.category)
    && !(value.action === 'inspect_operation' && value.category === 'uncertain' && value.effect_state === 'unknown')) invalid();
  return value;
}

export function projectToolResult(name, input, result, pack, facts) {
  const descriptor = validateToolDescriptor(describeToolResult(name, input, result, pack, facts));
  return { ...result, _meta: { ...result._meta, [TOOL_RESULT_META]: descriptor } };
}
export function consumeToolResult(name, result) {
  validateToolDomain(name, result);
  const descriptor = validateToolDescriptor(result._meta?.[TOOL_RESULT_META]);
  if ((!descriptor.failed && (commandNames.has(name) && !['accepted', 'already_applied'].includes(result.outcome)
    || ['agdf_dispatch', 'agdf_inspect'].includes(name) && ['invalid_input', 'target_unresolved', 'evaluator_error'].includes(result.outcome)))
    || descriptor.failed && (commandNames.has(name) && ['accepted', 'already_applied'].includes(result.outcome)
    || name === 'agdf_dispatch' && ['control_result', 'skill_continuation', 'intake_continuation'].includes(result.outcome))) invalid();
  if (['agdf_cockpit', 'agdf_cockpit_read'].includes(name) && !result.outcome
    && (descriptor.failed && ['available', 'empty', 'partial'].includes(result.state)
      || !descriptor.failed && ['invalid', 'missing', 'unsupported', 'blocked', 'error'].includes(result.state))) invalid();
  if (name === 'agdf_inspect' && result.outcome === 'inspect_result' && exactReads.has(result.operation)
    && descriptor.failed === (result.report.available === true)) invalid();
  const { [TOOL_RESULT_META]: _private, ...metadata } = result._meta;
  const { _meta, ...domain } = result;
  return { domain, metadata, descriptor };
}
