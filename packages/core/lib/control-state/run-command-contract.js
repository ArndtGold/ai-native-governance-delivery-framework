import { UR_AUTHORING_FORMAT } from '../control-evaluation/ur-readiness.js';
import { PRD_DECISION_FORMAT } from '../control-evaluation/prd-readiness.js';
import { SD_DECISION_FORMAT } from '../control-evaluation/sd-readiness.js';
import { DIGEST_PATTERN, COOPERATIVE_ASSURANCE, canonicalJson, digest } from './approval-command-contract.js';
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
// Canonical help is shared by expanded Core validation and operation help.
const fieldHelp = Object.freeze({
  schema_version: 'Contract version 1.',
  presentation_language: 'Response BCP 47 language, e.g. de.',
  working_directory: 'Absolute task directory for target resolution.',
  target_source: 'Human task basis for this target; cwd alone is not authority.',
  primary_target: 'Confirmed absolute target from resolution.',
  target_id: 'Exact hash from current MCP target inspection; never guess.',
  run_id: 'Scope-matching Run from inspection; recency is not authority.',
  expected_revision_id: 'Current inspected revision; recovery retains original binding.',
  operation_id: 'New command UUID; after handoff reuse original UUID/exact payload.',
  assurance: 'Cooperative intent, not human proof or approval.',
  command: 'Kind/payload; nested help: operation-contract.',
  path: 'Contained Run-local source path; read the actual file before recording.',
  digest: 'Canonical SHA-256 of the exact source bytes; never guess or reseal unrelated edits.',
  gate: 'Exact gate named by current control, not permission to advance it.',
  presentation_id: 'Immutable current presentation id from MCP inspection or preparation.',
  response: 'Forward the new deliberate human reply for this exact presentation.',
  confirmation: 'Exact concrete confirmation required by this operation contract.',
  source_gate: 'Earliest actually changed approved source, determined from the reviewed proposal.',
  preview_digest: 'Exact preview digest returned for the same reviewed proposal and binding.',
  recovery_revision_id: 'Revision allowed by the original pending operation recovery contract.',
  pending_digest: 'Exact pending operation digest from authoritative operation-status.',
  original_kind: 'Original operation kind in this fixed permission group; preserve its identity.',
});
function describeFields(schema) {
  const value = { ...schema };
  if (value.properties) value.properties = Object.fromEntries(Object.entries(value.properties).map(([key, child]) =>
    [key, { ...describeFields(child), ...(fieldHelp[key] ? { description: fieldHelp[key] } : {}) }]));
  for (const key of ['oneOf', 'anyOf', 'allOf']) if (value[key]) value[key] = value[key].map(describeFields);
  return value;
}
function commandSchema(group) {
  return { oneOf: RUN_COMMAND_GROUPS[group].map(kind => strictObject({ kind: { const: kind },
    payload: { ...payloadSchema(group, kind), description: RUN_COMMAND_DESCRIPTORS[kind].effects.join('; ') } })) };
}
export function commandGroupSchema(group) {
  if (!RUN_COMMAND_GROUPS[group]) throw Error('command_group_unsupported');
  return describeFields(strictObject({ ...envelope, command: commandSchema(group) }));
}
// Repeated immutable schema nodes become deterministic local references. Only
// schema positions are traversed: a properties map is never itself a schema.
export function compactCommandSchema(expanded) {
  const visit = (node, transform, depth = 0) => {
    const copy = { ...node };
    if (copy.properties) copy.properties = Object.fromEntries(Object.entries(copy.properties).map(([key, child]) =>
      [key, visit(child, transform, depth + 1)]));
    for (const key of ['oneOf', 'anyOf', 'allOf']) if (copy[key]) copy[key] = copy[key].map(child => visit(child, transform, depth + 1));
    if (copy.items) copy.items = visit(copy.items, transform, depth + 1);
    return transform(copy, depth);
  };
  // Discovery keeps direct envelope and per-operation payload meaning; nested
  // field detail remains in the expanded operation-contract from this owner.
  const discovery = visit(expanded, (node, depth) => {
    if (depth > 1) delete node.description;
    return node;
  });
  // Restore every payload's concise meaning explicitly, without phrase policy.
  discovery.properties.command.oneOf.forEach((row, i) => { row.properties.payload.description = expanded.properties.command.oneOf[i].properties.payload.description; });
  const counts = new Map();
  visit(discovery, node => { const { description, ...base } = node; const key = JSON.stringify(base); counts.set(key, (counts.get(key) ?? 0) + 1); return node; });
  const definitions = {}, names = new Map();
  const factor = (node, depth = 0, defining = false) => {
    const { description, ...base } = node;
    const key = JSON.stringify(base);
    if (!defining && depth > 0 && (counts.get(key) ?? 0) > 1 && key.length >= 48) {
      if (!names.has(key)) {
        const name = `s${names.size}`; names.set(key, name);
        definitions[name] = factor(base, depth, true);
      }
      return { $ref: `#/$defs/${names.get(key)}`, ...(description ? { description } : {}) };
    }
    const copy = { ...node };
    if (copy.properties) copy.properties = Object.fromEntries(Object.entries(copy.properties).map(([name, child]) => [name, factor(child, depth + 1)]));
    for (const name of ['oneOf', 'anyOf', 'allOf']) if (copy[name]) copy[name] = copy[name].map(child => factor(child, depth + 1));
    if (copy.items) copy.items = factor(copy.items, depth + 1);
    return copy;
  };
  const projected = factor(discovery);
  if (names.size) projected.$defs = definitions;
  return projected;
}
const openObject = { type: 'object', additionalProperties: true };
const nullableObject = { ...openObject, type: ['object', 'null'] };
const nullableString = { type: ['string', 'null'] };
const resultProperties = {
  schema_version: { const: '1' }, outcome: enumeration(['accepted', 'already_applied', 'rejected', 'recovery_required', 'effect_unknown']), authorizes: { const: false },
  reason: { ...nullableString, minLength: 1 }, operation_id: { ...identity, type: ['string', 'null'] }, request_digest: { ...hash, type: ['string', 'null'] },
  binding: { ...nullableObject, properties: { target_id: hash, run_id: envelope.run_id, expected_revision_id: identity, kind: string() }, required: ['target_id', 'run_id', 'expected_revision_id', 'kind'] },
  receipt: nullableObject, effect: nullableObject,
  current: { ...nullableObject, properties: { available: { type: 'boolean' }, revision: { type: 'integer' }, revision_id: identity }, required: ['available'] },
  assurance: { ...openObject, properties: Object.fromEntries(Object.entries(COOPERATIVE_ASSURANCE).map(([key, value]) => [key, { const: value }])), required: Object.keys(COOPERATIVE_ASSURANCE) }, family_result: openObject,
  historical_effect: { type: 'boolean' }, dispatch: enumeration(['not_dispatched', 'unknown']), recovery: nullableString,
  diagnostics: { type: 'array', items: openObject },
  presentation_delivery: { ...openObject, properties: { mode: enumeration(['native_plus_chat', 'full_chat']), display: enumeration(['confirmed', 'unconfirmed']),
    text: { type: 'string' }, presentation_id: identity, revision_id: identity, document_digest: hash, document_language: nullableString, authorizes: { const: false } },
    required: ['mode', 'display', 'text', 'presentation_id', 'revision_id', 'document_digest', 'document_language', 'authorizes'] },
  app_capability: { type: 'string' }, app_reason: { type: 'string' }, app_display: { type: 'string' },
};
const resultVariants = [
  { properties: { outcome: enumeration(['accepted', 'already_applied']), operation_id: { type: 'string' }, request_digest: { type: 'string' }, binding: { type: 'object' }, current: { type: 'object' } }, required: ['operation_id', 'request_digest', 'binding', 'receipt', 'effect', 'current', 'assurance', 'historical_effect', 'recovery', 'reason', 'family_result'] },
  { properties: { outcome: enumeration(['rejected', 'recovery_required', 'effect_unknown']), reason: { type: 'string', minLength: 1 } }, required: ['reason'] },
];
export const RUN_COMMAND_RESULT_SCHEMA = freeze({ type: 'object', additionalProperties: true, properties: resultProperties,
  required: ['schema_version', 'outcome', 'authorizes'], oneOf: resultVariants,
  allOf: [{ oneOf: [
    { properties: { outcome: enumeration(['accepted', 'already_applied', 'rejected']) } },
    { properties: { outcome: enumeration(['recovery_required', 'effect_unknown']), recovery: { type: 'string', minLength: 1 } }, required: ['operation_id', 'recovery'] },
  ] }] });
// Essential envelope projection from the full model, not a second result owner.
export function commandResultSchema() {
  const keys = ['schema_version', 'outcome', 'authorizes', 'reason', 'operation_id', 'binding', 'receipt', 'recovery'];
  const properties = Object.fromEntries(keys.map(key => [key, key === 'binding' ? { type: resultProperties.binding.type } : key === 'outcome' ? { type: 'string' } : resultProperties[key]]));
  return { type: 'object', properties, required: RUN_COMMAND_RESULT_SCHEMA.required,
    oneOf: resultVariants.map(variant => ({ ...variant, properties: Object.fromEntries(Object.entries(variant.properties).filter(([key]) => keys.includes(key))), required: variant.required.filter(key => keys.includes(key)) })) };
}
export function validateRunCommandResult(value) { return schemaDiagnostics(value, RUN_COMMAND_RESULT_SCHEMA); }
export function commandGroupDefinition(group) {
  const definition = { name: group,
    description: `${group}: ${RUN_COMMAND_GROUPS[group]?.join(', ')}. Inspect operation-contract for payloads/bindings. Cooperative intent never approves a gate. After uncertainty inspect operation-status with original UUID/payload. No VCS.`,
    annotations: { readOnlyHint: false, destructiveHint: group !== 'agdf_prepare', idempotentHint: false, openWorldHint: false },
    inputSchema: compactCommandSchema(commandGroupSchema(group)), outputSchema: commandResultSchema() };
  if (Buffer.byteLength(JSON.stringify(definition)) > RUN_COMMAND_LIMITS.definition_bytes) throw Error('command_definition_budget_exceeded');
  return freeze(definition);
}
// A deliberately small schema interpreter over the same generated JSON Schema subset.
// No caller validator, accessor execution, coercion or default-expanded effect is allowed.
export function schemaDiagnostics(value, schema, path = '$') {
  const errors = [];
  if (schema.oneOf && schema.oneOf.filter(choice => schemaDiagnostics(value, choice, path).length === 0).length !== 1) errors.push({ path, code: 'one_of_invalid' });
  if (schema.allOf) for (const choice of schema.allOf) errors.push(...schemaDiagnostics(value, choice, path));
  if (Array.isArray(schema.type)) {
    const matches = schema.type.map(type => schemaDiagnostics(value, { ...schema, type }, path));
    return matches.some(result => result.length === 0) ? errors : [...errors, { path, code: 'type_invalid' }];
  }
  if (schema.type === 'null' && value !== null) errors.push({ path, code: 'null_required' });
  if (schema.type === 'integer' && !Number.isInteger(value)) errors.push({ path, code: 'integer_required' });
  if (schema.type === 'boolean' && typeof value !== 'boolean') errors.push({ path, code: 'boolean_required' });
  if (schema.type === 'array') {
    if (!Array.isArray(value)) return [...errors, { path, code: 'array_required' }];
    for (let i = 0; i < value.length; i++) {
      const field = Object.getOwnPropertyDescriptor(value, String(i));
      if (!field || !Object.hasOwn(field, 'value')) errors.push({ path, code: 'accessor_forbidden' });
      else if (schema.items) errors.push(...schemaDiagnostics(field.value, schema.items, `${path}[${i}]`));
    }
  }
  if (Object.hasOwn(schema, 'const') && value !== schema.const) errors.push({ path, code: 'constant_invalid' });
  if (schema.enum && !schema.enum.includes(value)) errors.push({ path, code: 'enum_invalid' });
  if (schema.type === 'object' || !schema.type && (schema.properties || schema.required) && value !== null && typeof value === 'object' && !Array.isArray(value)) {
    if (value === null || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return [{ path, code: 'object_required' }];
    const keys = Reflect.ownKeys(value);
    for (const key of keys) {
      if (typeof key !== 'string') { errors.push({ path, code: 'unknown_field' }); continue; }
      if (!Object.hasOwn(schema.properties ?? {}, key)) { if (schema.additionalProperties === false) errors.push({ path, code: 'unknown_field' }); continue; }
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
    schema: describeFields(strictObject({ ...envelope, command: strictObject({ kind: { const: kind }, payload: { ...payloadSchema(group, kind), description: RUN_COMMAND_DESCRIPTORS[kind].effects.join('; ') } }) })), result_schema: RUN_COMMAND_RESULT_SCHEMA, retry_class: 'inspect_original_operation_after_dispatch', assurance: 'cooperative_local',
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
