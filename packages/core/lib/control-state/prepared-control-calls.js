import { randomUUID } from 'node:crypto';
import { RUN_COMMAND_DESCRIPTORS, validateRunCommand } from './run-command-schema.js';

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

export function preparedCommandCall(group, kind, input, { gate, material, recording, presentationId } = {}) {
  if (!RUN_COMMAND_DESCRIPTORS[kind] || RUN_COMMAND_DESCRIPTORS[kind].group !== group) return undefined;
  let payload = {};
  if (kind === 'material.stage') {
    const slot = ({ 'Mode/Slice Decision': 'Brownfield Review', 'Verified Change Execution': 'Verified Change' })[gate] ?? gate ?? 'EVIDENCE';
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
  if (kind === 'step.record') payload = { ...(material ? { source: material } : {}),
    ...(gate === 'UR' ? { step: 'ur' } : ['Brownfield Review', 'Mode/Slice Decision'].includes(gate) ? { step: 'route' }
      : gate === 'UX Intent Definition' ? { step: 'internal', internal_step: gate }
        : ['Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR'].includes(gate) ? { step: 'internal', internal_step: gate } : {}) };
  const unbound = ['run.create', 'project.initialize'].includes(kind);
  const argumentsValue = { schema_version: '1', presentation_language: input.presentation_language,
    working_directory: input.working_directory, primary_target: input.primary_target, target_source: input.target_source,
    target_id: input.target_id, ...(!unbound ? { run_id: input.run_id, expected_revision_id: input.expected_revision_id } : {}),
    operation_id: randomUUID(), assurance: 'cooperative_local', command: { kind, payload } };
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
    } } : {}),
    ...(kind === 'approval.record' && gate ? { contract_call: { tool: 'agdf_inspect', arguments: {
      operation: 'operation-contract', module: 'agdf_approve/approval.record',
      presentation_language: input.presentation_language, working_directory: input.working_directory,
      primary_target: input.primary_target, target_source: input.target_source,
      run_id: input.run_id, expected_revision_id: input.expected_revision_id, gate,
    } }, response_contract: {
      approval_value: `Approval: ${gate}`, exact: true,
      instruction: 'Only a NEW deliberate reply for this presentation. Put the exact reply alone in response; simulation/reviewer explanation belongs outside response. Never prefix or suffix the approval formula. This value is a format, not a decision or permission. The complete approval form already binds the revision and presentation; fill response without another contract read. If explanatory schema help is needed, copy contract_call exactly; never omit or guess expected_revision_id.' } } : {}),
    instruction: 'Fill required_inputs from actual authored content, review or a NEW deliberate reply. Preserve the supplied binding and UUID. Retry an uncertain dispatch with the identical call; each new logical command already has its own supplied UUID; do not regenerate it or put IDs in inputs. This form is not permission or an approval.' };
}
