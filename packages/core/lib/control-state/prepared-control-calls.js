import { randomUUID } from 'node:crypto';
import { canonicalJson, digest } from './approval-command-contract.js';
import { RUN_COMMAND_DESCRIPTORS, validateRunCommand } from './run-command-schema.js';
import { closeoutConfirmation } from '../control-evaluation/closeout-readiness.js';
import { REPORT_DECISION_FORMAT } from '../control-evaluation/report-decision.js';
import { MATERIAL_LIMITS } from './material-limits.js';

// Call construction only. The existing command/dispatch owners still validate
// intent, current bindings, review, presentation and every actual mutation.
export function continueDeliveryCall(input, runId = input.run_id) {
  return { tool: 'agdf_dispatch', arguments: { presentation_language: input.presentation_language,
    working_directory: input.working_directory, primary_target: input.primary_target, target_source: input.target_source,
    skill_id: 'gate-check', run_id: runId, continue_delivery: true } };
}

// Observation of the original UUID, never a new write or refreshed revision.
export function originalOperationCall(input) {
  const kind = input.command?.kind;
  if (!input.run_id && !input.planning && !['project.initialize', 'run.create'].includes(kind)) return undefined;
  if (['material.stage', 'planned_material.stage', 'presentation.deliver'].includes(kind)) return undefined;
  return { tool: 'agdf_inspect', arguments: {
    presentation_language: input.presentation_language, working_directory: input.working_directory,
    primary_target: input.primary_target, target_source: input.target_source,
    operation: 'operation-status', module: input.planning || kind === 'project.initialize' ? `${kind}/${input.operation_id}` : input.operation_id,
    ...(input.planning ? { planning: input.planning } : input.run_id ? { run_id: input.run_id, expected_revision_id: input.expected_revision_id } : {}),
  } };
}

function compatible(schema, value) {
  if (schema.oneOf || schema.anyOf) return (schema.oneOf ?? schema.anyOf).some(row => compatible(row, value));
  if (schema.allOf) return schema.allOf.every(row => compatible(row, value));
  if (schema.additionalProperties === false && value && typeof value === 'object'
      && Object.keys(value).some(key => !Object.hasOwn(schema.properties ?? {}, key))) return false;
  return Object.entries(schema.properties ?? {}).every(([key, rule]) => value?.[key] === undefined
    || (!Object.hasOwn(rule, 'const') || value[key] === rule.const) && (!rule.enum || rule.enum.includes(value[key])));
}

function missing(schema, value, path) {
  if (schema.oneOf || schema.anyOf) {
    const variants = (schema.oneOf ?? schema.anyOf).filter(row => compatible(row, value));
    return variants.length === 1 ? missing(variants[0], value, path) : [path];
  }
  if (schema.allOf) return [...new Set(schema.allOf.flatMap(row => missing(row, value, path)))];
  if (schema.type === 'array' && Array.isArray(value)) return value.flatMap((row, i) => missing(schema.items, row, `${path}/${i}`));
  if (schema.type !== 'object') return [];
  return Object.entries(schema.properties ?? {}).flatMap(([key, rule]) => value?.[key] === undefined
    ? (schema.required ?? []).includes(key) ? [`${path}/${key}`] : [] : missing(rule, value[key], `${path}/${key}`));
}

// Authoring gates whose staged source uses another material slot. A Quick Task
// closes with its mandatory Code Review, so that report is the material it stages.
const MATERIAL_SLOT_BY_GATE = Object.freeze({ 'Mode/Slice Decision': 'Brownfield Review',
  'Verified Change Execution': 'Verified Change', 'Quick Task Execution': 'CR' });
const INTERNAL_STEPS = Object.freeze(['UX Intent Definition', 'Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR']);
// Reports whose recorded result Core reads with readReportDecision.
const DECISION_REPORT_SLOTS = new Set(['Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR']);

// Selects the one step.record variant an authoring gate records, so the form's
// required inputs name concrete fields instead of the ambiguous whole payload.
function recordingStep(gate) {
  if (gate === 'UR') return { step: 'ur' };
  if (['Brownfield Review', 'Mode/Slice Decision'].includes(gate)) return { step: 'route' };
  if (gate === 'Quick Task Execution') return { step: 'review' };
  if (INTERNAL_STEPS.includes(gate)) return { step: 'internal', internal_step: gate };
  return {};
}

// A restaged OR may have a different material handle but the same command identity.
function stagedCloseoutOperationId(binding, reportDigest) {
  const hash = digest(`agdf-staged-closeout/1\0${canonicalJson([binding, reportDigest])}`).slice(7, 39);
  const variant = (8 | (Number.parseInt(hash[16], 16) & 3)).toString(16);
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-8${hash.slice(13, 16)}-${variant}${hash.slice(17, 20)}-${hash.slice(20)}`;
}

// `revision` continues an accepted source revision preview: apply keeps the
// preview's operation UUID, which the proposal binds, and its preview digest.
export function preparedCommandCall(group, kind, input, { gate, material, recording, presentationId, revision } = {}) {
  if (!RUN_COMMAND_DESCRIPTORS[kind] || RUN_COMMAND_DESCRIPTORS[kind].group !== group) return undefined;
  let payload = {}, slot;
  if (kind === 'material.stage') {
    slot = MATERIAL_SLOT_BY_GATE[gate] ?? gate ?? 'EVIDENCE';
    const roles = RUN_COMMAND_DESCRIPTORS[kind].payload_schema.oneOf.find(row => row.properties.action.const === 'put').properties.files.items.properties.slot.enum;
    if (!roles.includes(slot)) return undefined;
    payload = { action: 'put', files: [{ slot }] };
  }
  if (kind === 'artefact.record') payload = { ...(gate ? { gate } : {}), ...(material ? { material } : {}),
    ...(recording?.available ? { update_draft: recording.update_draft } : {}) };
  if (['presentation.prepare', 'presentation.deliver', 'approval.record'].includes(kind)) payload = {
    ...(gate ? { gate } : {}), ...(presentationId ? { presentation_id: presentationId } : {}),
    ...(kind === 'presentation.deliver' ? { route: 'automatic' } : {}) };
  if (kind === 'ur_draft.replace' && material) payload = { source: material };
  if (kind === 'step.record') payload = { ...(material ? { source: material } : {}), ...recordingStep(gate) };
  // The proposal reference stays an input: staged material rarely outlives the
  // person's confirmation, and restaging identical bytes keeps the same digest.
  if (kind === 'source_revision.apply' && revision) payload = { source_gate: revision.source_gate, preview_digest: revision.preview_digest };
  const unbound = ['run.create', 'project.initialize'].includes(kind);
  const binding = { schema_version: '1', presentation_language: input.presentation_language,
    working_directory: input.working_directory, primary_target: input.primary_target, target_source: input.target_source,
    target_id: input.target_id, ...(!unbound ? { run_id: input.run_id, expected_revision_id: input.expected_revision_id } : {}),
    assurance: 'cooperative_local' };
  const stagedCloseout = kind === 'closeout.record' && material;
  const operation_id = stagedCloseout ? stagedCloseoutOperationId(binding, material.digest) : revision?.operation_id ?? randomUUID();
  if (stagedCloseout) payload = { or: material,
    confirmation: closeoutConfirmation(binding.run_id, binding.expected_revision_id, operation_id, material.digest) };
  const argumentsValue = { ...binding, operation_id, command: { kind, payload } };
  const required = missing(RUN_COMMAND_DESCRIPTORS[kind].payload_schema, payload, '/command/payload');
  const valid = validateRunCommand(group, argumentsValue).length === 0;
  return { state: valid ? 'ready' : 'requires_author_input', call: { tool: group, arguments: argumentsValue },
    required_inputs: valid ? [] : required.length ? required : ['/command/payload'], authorizes: false,
    ...(kind === 'material.stage' ? { content_contract: {
      encoding: 'UTF-8', max_utf8_bytes_per_file: RUN_COMMAND_DESCRIPTORS[kind].payload_schema.oneOf[0].properties.files.items.properties.content.maxLength,
      instruction: 'put accepts text up to this UTF-8 limit within the 64 KiB whole JSON request bound; no client hashes or byte counts are needed. If either bound would be exceeded, retain the complete text and use the supplied larger_source_call for multipart; never truncate or shorten approved source to fit.',
      larger_source_call: { tool: 'agdf_inspect', arguments: { operation: 'operation-contract', module: `${group}/${kind}`,
        presentation_language: input.presentation_language, working_directory: input.working_directory,
        primary_target: input.primary_target, target_source: input.target_source,
        run_id: input.run_id, expected_revision_id: input.expected_revision_id } },
      // Staged material is private to the serving MCP process and short-lived,
      // so a recording that waits for a person must not stage first.
      retention: { idle_ms: MATERIAL_LIMITS.idle, lifetime_ms: MATERIAL_LIMITS.lifetime, scope: 'serving MCP server process',
        instruction: 'Stage only when every input of the following recording (for example reviewer and review confirmation) is already available. Staged material does not survive a reconnect or a pause beyond idle_ms. After expiry stage the identical bytes again: a form that takes the material reference as an input (closeout, source revision apply) is reused with the new reference, which keeps its UUID and any confirmation valid; otherwise use the recording form returned by the new staging.' },
      ...(DECISION_REPORT_SLOTS.has(slot) ? { report_decision: REPORT_DECISION_FORMAT } : {}),
    } } : {}),
    ...(kind === 'approval.record' && gate ? { contract_call: { tool: 'agdf_inspect', arguments: {
      operation: 'operation-contract', module: 'agdf_approve/approval.record',
      presentation_language: input.presentation_language, working_directory: input.working_directory,
      primary_target: input.primary_target, target_source: input.target_source,
      run_id: input.run_id, expected_revision_id: input.expected_revision_id, gate,
    } }, response_contract: {
      approval_value: `Approval: ${gate}`, exact: true,
      instruction: 'Only a NEW deliberate reply for this presentation. Put the exact reply alone in response; simulation/reviewer explanation belongs outside response. Never prefix or suffix the approval formula. This value is a format, not a decision or permission. The complete approval form already binds the revision and presentation; fill response without another contract read. If explanatory schema help is needed, copy contract_call exactly; never omit or guess expected_revision_id.' } } : {}),
    ...(kind === 'source_revision.apply' && revision ? { confirmation_contract: { confirmation_value: revision.confirmation_selector, exact: true,
      instruction: 'confirmation is only the person\'s NEW deliberate reply with exactly this text. proposal is the reference of the previewed proposal; if its staged material expired, stage the identical bytes again and use the new reference. This form keeps the previewed UUID and digest.' } } : {}),
    ...(stagedCloseout && valid ? { operation_status_call: originalOperationCall(argumentsValue) } : {}),
    instruction: stagedCloseout
      ? 'Invoke the supplied closeout separately. If its effect is uncertain, inspect the original operation first. If material expired and restaging is appropriate, stage the identical OR with the original binding and use the returned form for the same operation and digest.'
      : 'Fill required_inputs from actual authored content, review or a NEW deliberate reply. Preserve the supplied binding and UUID. Retry an uncertain dispatch with the identical call; each new logical command already has its own supplied UUID; do not regenerate it or put IDs in inputs. This form is not permission or an approval.' };
}
