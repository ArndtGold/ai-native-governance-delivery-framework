import { UR_AUTHORING_FORMAT } from '../control-evaluation/ur-readiness.js';
import { PRD_DECISION_FORMAT } from '../control-evaluation/prd-readiness.js';
import { SD_DECISION_FORMAT } from '../control-evaluation/sd-readiness.js';
import { DIGEST_PATTERN, canonicalJson, digest } from './approval-command-contract.js';
import { RUN_ID_PATTERN, REVISION_ID_PATTERN, APPROVAL_GATES } from './run-identity.js';
import { TASK_TARGET_SOURCES } from '../task-target-resolution.js';
import { PRESENTATION_LANGUAGE_TAG_PATTERN_SOURCE } from '../interaction-presentation.js';
import { ACCEPTANCE_CRITERIA_FORMAT, TP_AUTHORING_FORMAT } from '../control-evaluation/traceability-readiness.js';
import { UX_DECISION_FORMAT } from '../control-evaluation/definition-sources.js';
import { REVIEWED_REQUEST_FORMAT, REVISION_PROPOSAL_FORMAT } from './recording-formats.js';
import { relationshipForGate } from '../control-evaluation/delivery-relationships.js';
import { PREVIEW_REVIEW_FORMAT } from './preview-review.js';

export const RUN_COMMAND_VERSION = '1';
export const RUN_COMMAND_LIMITS = Object.freeze({ input_bytes: 65536, result_bytes: 1048576, definition_bytes: 8192, aggregate_definition_bytes: 24576 });
const string = (maxLength = 4096) => ({ type: 'string', minLength: 1, maxLength });
const identity = { type: 'string', pattern: REVISION_ID_PATTERN.source };
const hash = { type: 'string', pattern: DIGEST_PATTERN.source };
const enumeration = values => ({ enum: [...values] });
export const strictObject = (properties, required = Object.keys(properties)) => ({ type: 'object', additionalProperties: false, properties, required });
const source = strictObject({ path: string(), digest: hash });
const recoveryGroups = Object.freeze({ 'step.record': 'agdf_record', 'artefact.record': 'agdf_record',
  'presentation_decision.record': 'agdf_record', 'prd_revision.reopen': 'agdf_revise', 'closeout.record': 'agdf_closeout' });
const recovery = strictObject({ original_kind: enumeration(Object.keys(recoveryGroups)), pending_digest: hash, recovery_revision_id: identity });
const recordStep = { oneOf: [
  strictObject({ step: { const: 'ur' }, source, title: string(1024) }),
  strictObject({ step: { const: 'route' }, source, reason: string(8192), route: enumeration(['quick_task', 'structured_slice', 'structured_delivery']) }),
  strictObject({ step: { const: 'review' }, source, decision: enumeration(['pass', 'revise', 'block']) }),
  strictObject({ step: { const: 'evidence' }, source, reason: string(8192), covers: string(1024) }),
  { oneOf: [strictObject({ step: { const: 'internal' }, source,
    internal_step: { const: 'UX Intent Definition' }, decision: enumeration(['ready', 'blocked', 'not_applicable']), reason: string(8192), covers: string(1024),
  }, ['step', 'source', 'internal_step', 'decision']), strictObject({ step: { const: 'internal' }, source,
    internal_step: enumeration(['Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR']),
    decision: enumeration(['pass', 'revise', 'block', 'not_applicable']), reason: string(8192), covers: string(1024),
  }, ['step', 'source', 'internal_step', 'decision'])] },
] };

const spec = (group, payload, owner, effects, confirmation = 'authorized_recording') => ({ group, payload_schema: payload, owner, effects, confirmation });
const proposal = strictObject({ source_gate: enumeration(['UR', 'PRD', 'SD', 'TP']), proposal: source });
const apply = strictObject({ ...proposal.properties, preview_digest: hash, confirmation: string(8192) });
const closeout = strictObject({ or: source, confirmation: string(8192) });
const descriptors = {
  'runtime_generation.replace': spec('agdf_record', strictObject({ candidate: source, confirmation: string(256) }), 'owned-runtime-generation.replace', ['replace only the serving facade own runtime; no Run or gate write'], 'concrete_candidate_digest'),
  'presentation.prepare': spec('agdf_prepare', strictObject({ gate: enumeration(APPROVAL_GATES) }), 'run-presentation.prepareRunPresentation', ['create immutable exact presentation'], 'no_gate_approval'),
  'step.record': spec('agdf_record', recordStep, 'run-steps.recordRunStep', ['register bounded actual internal/evidence result; update Run/backlog']),
  'artefact.record': spec('agdf_record', strictObject({ gate: enumeration(['PRD', 'SD', 'TP', 'QA']), reviewed_request: source }), 'run-artefact-recording.prepareArtefactRecording', ['register reviewed source mapping; replace only unapproved draft']),
  'approval.record': spec('agdf_approve', strictObject({ gate: enumeration(APPROVAL_GATES), presentation_id: identity, response: string(8192) }), 'approval-command.executeApprovalCommand', ['record one exact deliberate gate reply'], 'new_deliberate_exact_reply'),
  'presentation_decision.record': spec('agdf_record', strictObject({ gate: enumeration(APPROVAL_GATES), presentation_id: identity,
    action: enumeration(['request_change', 'reject']), comment: { type: 'string', maxLength: 8192 } }),
    'run-steps.recordRunPresentationDecision', ['record one exact deliberate change request or rejection; no gate approval'], 'new_deliberate_bound_human_reply'),
  'source_revision.preview': spec('agdf_revise', proposal, 'run-revision.previewSourceRevision', ['read exact revision impact'], 'no_mutation'),
  'source_revision.apply': spec('agdf_revise', apply, 'run-revision.applySourceRevision', ['archive selected material; invalidate affected decisions; reopen earliest source'], 'exact_material_confirmation'),
  'source_revision.recover': spec('agdf_revise', strictObject({ proposal: source, source_gate: enumeration(['UR', 'PRD', 'SD', 'TP']), recovery_revision_id: identity, pending_digest: hash }), 'run-revision.recoverSourceRevision', ['recover original bounded source revision'], 'original_confirmed_effect'),
  'prd_revision.reopen': spec('agdf_revise', strictObject({ prd: source, confirmation: string(8192) }), 'run-revision.reopenPrdRevision', ['reopen existing early PRD boundary preserving history'], 'exact_material_confirmation'),
  'closeout.record': spec('agdf_closeout', closeout, 'run-steps.recordRunStep', ['publish exact OR; complete selected Run; synchronize selected backlog'], 'exact_material_confirmation'),
  'operation.recover': { ...spec(null, recovery, 'run-step-transaction.recoverPendingRunStep', ['recover original bounded owned outputs and selected backlog'], 'original_confirmed_effect'), groups: ['agdf_record', 'agdf_revise', 'agdf_closeout'] },
};
function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
export const RUN_COMMAND_DESCRIPTORS = freeze(descriptors);
export const RUN_COMMAND_GROUPS = freeze({
  agdf_prepare: ['presentation.prepare'], agdf_record: ['step.record', 'artefact.record', 'presentation_decision.record', 'runtime_generation.replace', 'operation.recover'],
  agdf_approve: ['approval.record'], agdf_revise: ['source_revision.preview', 'source_revision.apply', 'source_revision.recover', 'prd_revision.reopen', 'operation.recover'],
  agdf_closeout: ['closeout.record', 'operation.recover'],
});
const envelope = {
  schema_version: { const: RUN_COMMAND_VERSION }, presentation_language: { type: 'string', maxLength: 64, pattern: PRESENTATION_LANGUAGE_TAG_PATTERN_SOURCE },
  working_directory: string(), target_source: enumeration(TASK_TARGET_SOURCES), primary_target: string(), target_id: hash,
  run_id: { type: 'string', pattern: RUN_ID_PATTERN.source }, expected_revision_id: identity, operation_id: identity,
  assurance: { const: 'cooperative_local' },
};
function payloadSchema(group, kind) {
  return kind === 'operation.recover' ? strictObject({ ...recovery.properties,
    original_kind: enumeration(Object.keys(recoveryGroups).filter(original => recoveryGroups[original] === group)) })
    : RUN_COMMAND_DESCRIPTORS[kind].payload_schema;
}
export function commandGroupSchema(group) {
  const kinds = RUN_COMMAND_GROUPS[group]; if (!kinds) throw Error('command_group_unsupported');
  return strictObject({ ...envelope, command: { oneOf: kinds.map(kind => strictObject({ kind: { const: kind }, payload: payloadSchema(group, kind) })) } });
}
export function commandGroupDefinition(group) {
  const definition = { name: group,
    description: `${group}: ${RUN_COMMAND_GROUPS[group]?.join(', ')}. Exact target/Run/revision/UUID required. Cooperative caller intent only; tool permission never approves a gate. Inspect operation-contract before use; retry original UUID via operation-status after uncertainty. No VCS.`,
    annotations: { readOnlyHint: false, destructiveHint: group !== 'agdf_prepare', idempotentHint: false, openWorldHint: false }, inputSchema: commandGroupSchema(group) };
  if (Buffer.byteLength(JSON.stringify(definition)) > RUN_COMMAND_LIMITS.definition_bytes) throw Error('command_definition_budget_exceeded');
  return freeze(definition);
}
// A deliberately small schema interpreter over the same generated JSON Schema subset.
// No caller validator, accessor execution, coercion or default-expanded effect is allowed.
export function schemaDiagnostics(value, schema, path = '$') {
  const errors = [];
  if (schema.oneOf) return schema.oneOf.filter(choice => schemaDiagnostics(value, choice, path).length === 0).length === 1 ? [] : [{ path, code: 'one_of_invalid' }];
  if (Object.hasOwn(schema, 'const') && value !== schema.const) errors.push({ path, code: 'constant_invalid' });
  if (schema.enum && !schema.enum.includes(value)) errors.push({ path, code: 'enum_invalid' });
  if (schema.type === 'object') {
    if (value === null || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return [{ path, code: 'object_required' }];
    const keys = Reflect.ownKeys(value);
    for (const key of keys) {
      if (typeof key !== 'string' || !Object.hasOwn(schema.properties, key)) { errors.push({ path, code: 'unknown_field' }); continue; }
      const property = Object.getOwnPropertyDescriptor(value, key);
      if (!Object.hasOwn(property, 'value')) { errors.push({ path: `${path}.${key}`, code: 'accessor_forbidden' }); continue; }
      errors.push(...schemaDiagnostics(property.value, schema.properties[key], `${path}.${key}`));
    }
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) errors.push({ path: `${path}.${key}`, code: 'field_required' });
  }
  if (schema.type === 'string') {
    if (typeof value !== 'string') return [...errors, { path, code: 'string_required' }];
    if (schema.minLength !== undefined && value.length < schema.minLength || schema.maxLength !== undefined && value.length > schema.maxLength
      || schema.pattern && !(new RegExp(schema.pattern, 'u')).test(value)) errors.push({ path, code: 'string_invalid' });
  }
  return errors;
}
export function validateRunCommand(group, input) {
  if (!RUN_COMMAND_GROUPS[group]) return [{ path: '$', code: 'command_group_unsupported' }];
  const errors = schemaDiagnostics(input, commandGroupSchema(group));
  if (errors.length) return errors;
  if (Buffer.byteLength(canonicalJson(input)) > RUN_COMMAND_LIMITS.input_bytes) return [{ path: '$', code: 'command_input_budget_exceeded' }];
  const kind = input.command.kind;
  if (kind === 'operation.recover' && group !== recoveryGroups[input.command.payload.original_kind]) return [{ path: '$.command.payload.original_kind', code: 'command_group_effect_mismatch' }];
  return [];
}
export const runCommandRequestDigest = input => digest(`agdf-run-command/1\0${canonicalJson(input)}`);
export function operationContract(group, kind, { gate } = {}) {
  if (!RUN_COMMAND_GROUPS[group]?.includes(kind)) return { available: false, reason: 'command_group_unsupported' };
  return { schema_version: RUN_COMMAND_VERSION, available: true, group, kind, ...RUN_COMMAND_DESCRIPTORS[kind], payload_schema: payloadSchema(group, kind),
    schema: strictObject({ ...envelope, command: strictObject({ kind: { const: kind }, payload: payloadSchema(group, kind) }) }), retry_class: 'inspect_original_operation_after_dispatch', assurance: 'cooperative_local',
    reference_limits: { input_bytes: RUN_COMMAND_LIMITS.input_bytes, source_file_bytes: 131072, result_bytes: RUN_COMMAND_LIMITS.result_bytes },
    internal_result_formats: kind === 'step.record' ? { 'UX Intent Definition': UX_DECISION_FORMAT,
      reviews: { declaration: '- decision: pass | revise | block | not_applicable', result_scope: 'actual current owner report; no generated judgement or approval' } } : undefined,
    reviewed_request_format: kind === 'artefact.record' ? { ...REVIEWED_REQUEST_FORMAT, current_relationship: relationshipForGate(gate) ?? null,
      destination_status: gate === 'QA' ? 'pass | revise | block matching the actual QA report' : 'draft' } : undefined,
    proposal_format: kind.startsWith('source_revision.') ? REVISION_PROPOSAL_FORMAT : undefined,
    authorizes: false, authoring_format: kind === 'artefact.record' || kind === 'presentation.prepare' || kind === 'step.record'
      ? ({ UR: UR_AUTHORING_FORMAT, PRD: { decisions: PRD_DECISION_FORMAT, criteria: ACCEPTANCE_CRITERIA_FORMAT, preview_review: PREVIEW_REVIEW_FORMAT }, SD: SD_DECISION_FORMAT, TP: TP_AUTHORING_FORMAT }[gate] ?? null) : undefined,
    presentation_format: kind === 'presentation.prepare' || kind === 'artefact.record' ? {
      owner: 'run-presentation-render', compact_brief_fields: ['Goal/Ziel', 'Proposal/Vorschlag or Scope/Umfang', 'Changes/Änderungen', 'Risks/Risiken'],
      source: 'source-authored canonical artefact or validated localized AGDF Approval Summary; no adapter paraphrase',
      missing_fields: 'retain absence and the complete validated summary; do not fabricate a legacy brief',
      delivery: 'native_plus_chat only with qualified native approval and confirmed display on the current user surface; otherwise full_chat; forward one exact decision request. Mac display never proves iPad visibility.',
      remote_document: 'presentation-document; exact binding and every cursor; local file links do not prove iPad access',
      remote_preview: 'presentation-preview; exact binding and every cursor; render only through isolated supported access; unavailable access leaves the review open',
    } : undefined,
    confirmation_boundary: 'host permission, concrete human intent and Core eligibility are separate' };
}
