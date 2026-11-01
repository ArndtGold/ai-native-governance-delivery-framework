import { projectMcpInputSchema } from '../mcp-input-schema.js';
import { DIGEST_PATTERN, COOPERATIVE_ASSURANCE, canonicalJson, digest } from './approval-command-contract.js';
import { RUN_ID_PATTERN, REVISION_ID_PATTERN, APPROVAL_GATES } from './run-identity.js';
import { TASK_TARGET_SOURCES } from '../task-target-resolution.js';
import { PRESENTATION_LANGUAGE_TAG_PATTERN_SOURCE } from '../interaction-presentation.js';

// Canonical structural definitions and validators shared by protocol fronts and
// the full contract facade. Help/readiness evaluation is not a startup dependency.
export const RUN_COMMAND_VERSION = '1';
export const RUN_COMMAND_LIMITS = Object.freeze({ input_bytes: 65536, result_bytes: 1048576, definition_bytes: 8192, aggregate_definition_bytes: 24576 });
const string = (maxLength = 4096) => ({ type: 'string', minLength: 1, maxLength });
const identity = { type: 'string', pattern: REVISION_ID_PATTERN.source };
const hash = { type: 'string', pattern: DIGEST_PATTERN.source };
const enumeration = values => ({ enum: [...values] });
export const strictObject = (properties, required = Object.keys(properties)) => ({ type: 'object', additionalProperties: false, properties, required });
const source = strictObject({ path: string(), digest: hash });
export const MATERIAL_REFERENCE_SCHEMA = strictObject({ material_id: identity, digest: hash });
const materialSource = { oneOf: [source, MATERIAL_REFERENCE_SCHEMA] };
const materialSlot = enumeration(['UR', 'PRD', 'SD', 'TP', 'QA', 'OR', 'Verified Change', 'Brownfield Review', 'UX Intent Definition', 'Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR', 'EVIDENCE']);
const integer = maximum => ({ type: 'integer', minimum: 0, maximum });
const materialStage = { oneOf: [
  strictObject({ action: { const: 'begin' }, files: { type: 'array', minItems: 1, maxItems: 4, items: strictObject({ slot: materialSlot, bytes: integer(131072) }) } }),
  strictObject({ action: { const: 'append' }, transfer_id: identity, file: integer(3), offset: integer(131072), data: { type: 'string', maxLength: 21848 } }),
  strictObject({ action: enumeration(['seal', 'discard', 'status']), transfer_id: identity }),
] };
const recoveryGroups = Object.freeze({ 'step.record': 'agdf_record', 'artefact.record': 'agdf_record',
  'presentation_decision.record': 'agdf_record', 'ur_draft.replace': 'agdf_revise', 'prd_revision.reopen': 'agdf_revise', 'closeout.record': 'agdf_closeout', 'lifecycle_close.record': 'agdf_closeout' });
const recovery = strictObject({ original_kind: enumeration(Object.keys(recoveryGroups)), pending_digest: hash, recovery_revision_id: identity });
const recordStep = { oneOf: [
  strictObject({ step: { const: 'ur' }, source: materialSource, title: string(1024) }),
  strictObject({ step: { const: 'route' }, source: materialSource, reason: string(8192), route: enumeration(['quick_task', 'verified_change', 'structured_slice', 'structured_delivery']) }),
  strictObject({ step: { const: 'review' }, source: materialSource, decision: enumeration(['pass', 'revise', 'block']) }),
  strictObject({ step: { const: 'evidence' }, source: materialSource, reason: string(8192), covers: string(1024) }),
  { oneOf: [strictObject({ step: { const: 'internal' }, source: materialSource,
    internal_step: { const: 'UX Intent Definition' }, decision: enumeration(['ready', 'blocked', 'not_applicable']), reason: string(8192), covers: string(1024),
  }, ['step', 'source', 'internal_step', 'decision']), strictObject({ step: { const: 'internal' }, source: materialSource,
    internal_step: enumeration(['Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR']),
    decision: enumeration(['pass', 'revise', 'block', 'not_applicable']), reason: string(8192), covers: string(1024),
  }, ['step', 'source', 'internal_step', 'decision'])] },
] };

const spec = (group, payload, owner, effects, confirmation = 'authorized_recording') => ({ group, payload_schema: payload, owner, effects, confirmation });
const proposal = strictObject({ source_gate: enumeration(['UR', 'PRD', 'SD', 'TP']), proposal: materialSource });
const apply = strictObject({ ...proposal.properties, preview_digest: hash, confirmation: string(8192) });
const closeout = strictObject({ or: materialSource, confirmation: string(8192) });
const runId = { type: 'string', pattern: RUN_ID_PATTERN.source };
// Closure decides over several Runs of one target, without a single Run binding.
const text = { type: 'string', minLength: 1 };
const closureEntry = strictObject({ run_id: runId, outcome: enumeration(['superseded', 'abandoned']), reason: text, successor_run: runId, successor_reference: text }, ['run_id', 'outcome', 'reason']);
export const TARGET_SCOPED_COMMAND_KINDS = Object.freeze(['closure.preview', 'closure.apply']);
const descriptors = {
  'project.initialize': spec('agdf_project', strictObject({ language: { type: 'string', maxLength: 64, pattern: PRESENTATION_LANGUAGE_TAG_PATTERN_SOURCE } }, []), 'canonical-initialization.initializeCanonicalProject', ['initialize fixed canonical project control; no Run or approval']),
  'ur_draft.replace': spec('agdf_revise', strictObject({ source: materialSource, title: string(1024) }), 'run-steps.recordRunStep', ['replace only current unapproved UR']),
  'verified_change.record': spec('agdf_record', strictObject({ phase: enumeration(['eligibility', 'execution']), source: materialSource }), 'run-steps.recordRunStep', ['record compact eligibility or actual execution; no VCS mutation']),
  'material.stage': spec('agdf_record', materialStage, 'run-material.createRunMaterialStore', ['bounded private transfer; no Run revision or approval']),
  'run.create': spec('agdf_run', strictObject({ title: { type: 'string', minLength: 1, maxLength: 1024, pattern: '^(?=.*\\S)[^\\u0000-\\u001f\\u007f\\u2028\\u2029|]+(?![\\s\\S])' } }), 'run-state-repository.createRun', ['create one unapproved Run; replay by original UUID']),
  'runtime_generation.replace': spec('agdf_record', strictObject({ candidate: source, confirmation: string(256) }), 'owned-runtime-generation.replace', ['replace only the serving facade own runtime; no Run or gate write'], 'concrete_candidate_digest'),
  'presentation.prepare': spec('agdf_prepare', strictObject({ gate: enumeration(APPROVAL_GATES) }), 'run-presentation.prepareRunPresentation', ['create immutable exact presentation'], 'no_gate_approval'),
  'presentation.deliver': spec('agdf_prepare', strictObject({ gate: enumeration(APPROVAL_GATES), presentation_id: identity,
    route: enumeration(['automatic', 'markdown', 'fallback']) }), 'decision-session', ['select one primary delivery; no gate effect'], 'no_gate_approval'),
  'step.record': spec('agdf_record', recordStep, 'run-steps.recordRunStep', ['register bounded actual internal/evidence result; update selected Run']),
  'artefact.record': spec('agdf_record', { oneOf: [strictObject({ gate: enumeration(['PRD', 'SD', 'TP', 'QA']), reviewed_request: source }),
    strictObject({ gate: enumeration(['PRD', 'SD', 'TP', 'QA']), material: MATERIAL_REFERENCE_SCHEMA, reviewer: string(1024), reviewed: { const: true }, update_draft: { type: 'boolean' } })] }, 'run-artefact-recording.prepareArtefactRecording', ['register reviewed source mapping; replace only unapproved draft']),
  'approval.record': spec('agdf_approve', strictObject({ gate: enumeration(APPROVAL_GATES), presentation_id: identity, response: string(8192) }), 'approval-command.executeApprovalCommand', ['record one exact deliberate gate reply'], 'new_deliberate_exact_reply'),
  'presentation_decision.record': spec('agdf_record', strictObject({ gate: enumeration(APPROVAL_GATES), presentation_id: identity,
    action: enumeration(['request_change', 'reject']), comment: { type: 'string', maxLength: 8192 } }),
    'run-steps.recordRunPresentationDecision', ['record one exact deliberate change request or rejection; no gate approval'], 'new_deliberate_bound_human_reply'),
  'source_revision.preview': spec('agdf_revise', proposal, 'run-revision.previewSourceRevision', ['read exact revision impact'], 'no_mutation'),
  'source_revision.apply': spec('agdf_revise', apply, 'run-revision.applySourceRevision', ['archive selected material; invalidate affected decisions; reopen earliest source'], 'exact_material_confirmation'),
  'source_revision.recover': spec('agdf_revise', strictObject({ proposal: materialSource, source_gate: enumeration(['UR', 'PRD', 'SD', 'TP']), recovery_revision_id: identity, pending_digest: hash }), 'run-revision.recoverSourceRevision', ['recover original bounded source revision'], 'original_confirmed_effect'),
  'prd_revision.reopen': spec('agdf_revise', strictObject({ prd: source, confirmation: string(8192) }), 'run-revision.reopenPrdRevision', ['reopen existing early PRD boundary preserving history'], 'exact_material_confirmation'),
  'closeout.record': spec('agdf_closeout', closeout, 'run-steps.recordRunStep', ['publish exact OR; complete selected Run'], 'exact_material_confirmation'),
  'closure.preview': spec('agdf_closeout', strictObject({ entries: { type: 'array', minItems: 1, maxItems: 64, items: closureEntry } }), 'run-closure.previewRunClosure', ['no run_id/revision; show text verbatim'], 'no_mutation'),
  'closure.apply': spec('agdf_closeout', strictObject({ preview_id: { type: 'string', pattern: '^[0-9a-f]{8}$' }, confirmation: string(256) }), 'run-closure.applyRunClosure', ["no run_id/revision; owner's verbatim reply; final"], 'exact_owner_phrase'),
  'operation.recover': { ...spec(null, recovery, 'run-step-transaction.recoverPendingRunStep', ['recover original bounded owned outputs, including captured legacy backlog only'], 'original_confirmed_effect'), groups: ['agdf_record', 'agdf_revise', 'agdf_closeout'] },
};
function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
export const RUN_COMMAND_DESCRIPTORS = freeze(descriptors);
export const RUN_COMMAND_GROUPS = freeze({
  agdf_project: ['project.initialize'],
  agdf_run: ['run.create'],
  agdf_prepare: ['presentation.prepare', 'presentation.deliver'], agdf_record: ['material.stage', 'verified_change.record', 'step.record', 'artefact.record', 'presentation_decision.record', 'runtime_generation.replace', 'operation.recover'],
  agdf_approve: ['approval.record'], agdf_revise: ['ur_draft.replace', 'source_revision.preview', 'source_revision.apply', 'source_revision.recover', 'prd_revision.reopen', 'operation.recover'],
  agdf_closeout: ['closeout.record', 'closure.preview', 'closure.apply', 'operation.recover'],
});
const envelope = {
  schema_version: { const: RUN_COMMAND_VERSION }, presentation_language: { type: 'string', maxLength: 64, pattern: PRESENTATION_LANGUAGE_TAG_PATTERN_SOURCE },
  working_directory: string(), target_source: enumeration(TASK_TARGET_SOURCES), primary_target: string(), target_id: hash,
  run_id: { type: 'string', pattern: RUN_ID_PATTERN.source }, expected_revision_id: identity, operation_id: identity,
  assurance: { const: 'cooperative_local' },
};
export function payloadSchema(group, kind) {
  return kind === 'operation.recover' ? strictObject({ ...recovery.properties,
    original_kind: enumeration(Object.keys(recoveryGroups).filter(original => recoveryGroups[original] === group)) })
    : RUN_COMMAND_DESCRIPTORS[kind].payload_schema;
}
// Canonical help is shared by expanded Core validation and operation help.
const fieldHelp = Object.freeze({
  schema_version: 'Contract v1.',
  presentation_language: 'Reply language (BCP 47).',
  working_directory: 'Absolute task directory.',
  target_source: 'Human target basis; cwd is no authority.',
  primary_target: 'Confirmed absolute target.',
  target_id: 'Exact hash from target inspection; never guess.',
  run_id: 'Run from inspection; recency is no authority.',
  expected_revision_id: 'Inspected revision; recovery keeps original.',
  operation_id: 'New UUID; retry with same UUID/payload.',
  assurance: 'Cooperative intent, not human proof.',
  command: 'Kind and payload; help: operation-contract.',
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
export function describeFields(schema) {
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
  const fields = { ...commandEnvelope(group), command: commandSchema(group) };
  const required = Object.keys(fields).filter(key => !RUN_COMMAND_GROUPS[group].some(kind => TARGET_SCOPED_COMMAND_KINDS.includes(kind)) || !['run_id', 'expected_revision_id'].includes(key));
  return describeFields(strictObject(fields, required));
}
export function commandEnvelope(group, kind) {
  if (!['agdf_run', 'agdf_project'].includes(group) && !TARGET_SCOPED_COMMAND_KINDS.includes(kind)) return envelope;
  const { run_id, expected_revision_id, ...creation } = envelope;
  return creation;
}
// Repeated immutable schema nodes become deterministic local references. Only
// schema positions are traversed: a properties map is never itself a schema.
function compactCommandValidationSchema(expanded) {
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
  let discovery = visit(expanded, (node, depth) => {
    if (depth > 1) delete node.description;
    return node;
  });
  // Concise direct envelope guidance. Detailed operation meaning stays in full help;
  // retain every constraint while avoiding repeated payload prose in discovery.
  const brief = { schema_version: 'Version one.', presentation_language: 'BCP47 locale.', working_directory: 'Context dir.', target_source: 'Target basis.',
    primary_target: 'Project dir.', target_id: 'Target hash.', run_id: 'Bound Run ID.', expected_revision_id: 'Current rev.',
    operation_id: 'Replay UUID.', assurance: 'Cooperative.', command: 'Typed input.' };
  for (const [key, description] of Object.entries(brief)) if (discovery.properties[key]) discovery.properties[key].description = description;
  // Self-describing envelope names retain their full field help on operation-contract.
  // Avoid repeating that prose in every tool; preserve every structural constraint.
  for (const key of ['schema_version', 'working_directory', 'primary_target', 'target_id', 'command'])
    if (discovery.properties[key]) delete discovery.properties[key].description;
  // Factor a closed object's common shape out of its mutually exclusive variants.
  // Every key remains declared at the closed parent; branch constraints/requirements
  // are preserved exactly, including rejection of foreign payload fields.
  discovery = visit(discovery, node => {
    const rows = node.oneOf;
    if (!rows || rows.length < 2 || rows.some(r => r.type !== 'object' || r.additionalProperties !== false
      || Object.keys(r).some(k => !['type', 'additionalProperties', 'properties', 'required', 'description'].includes(k)))) return node;
    const keys = Object.keys(rows[0].properties).sort(), required = JSON.stringify(rows[0].required);
    if (rows.some(r => JSON.stringify(Object.keys(r.properties).sort()) !== JSON.stringify(keys) || JSON.stringify(r.required) !== required)) return node;
    const common = keys.filter(k => rows.every(r => JSON.stringify(r.properties[k]) === JSON.stringify(rows[0].properties[k])));
    const varying = keys.filter(k => !common.includes(k));
    const { oneOf, ...rest } = node;
    return { ...rest, type: 'object', additionalProperties: false, required: rows[0].required,
      properties: Object.fromEntries(keys.map(k => [k, common.includes(k) ? rows[0].properties[k] : {}])),
      oneOf: rows.map(r => ({ properties: Object.fromEntries(varying.map(k => [k, r.properties[k]])) })) };
  });
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
// A type view is a derived superset, not a second validation owner. Exact per-kind
// restrictions remain below the required command property and still run in the SDK.
function commandTypeView(schema) {
  if (schema.oneOf || schema.anyOf) return mergeCommandTypes((schema.oneOf ?? schema.anyOf).map(commandTypeView));
  if (schema.properties) return { type: 'object', properties: Object.fromEntries(Object.entries(schema.properties)
    .map(([key, value]) => [key, commandTypeView(value)])) };
  if (schema.items) return { type: 'array', items: commandTypeView(schema.items) };
  const type = value => value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  if (Object.hasOwn(schema, 'const')) return { type: type(schema.const) };
  if (schema.enum) return mergeCommandTypes(schema.enum.map(value => ({ type: type(value) })));
  return { type: schema.type };
}
function mergeCommandTypes(rows) {
  if (rows.every(row => row.type === 'object' && row.properties)) {
    const keys = [...new Set(rows.flatMap(row => Object.keys(row.properties)))];
    return { type: 'object', properties: Object.fromEntries(keys.map(key => [key,
      mergeCommandTypes(rows.filter(row => row.properties[key]).map(row => row.properties[key]))])) };
  }
  const unique = [...new Map(rows.map(row => [JSON.stringify(row), row])).values()];
  return unique.length === 1 ? unique[0] : { anyOf: unique };
}
function mapCommandSchema(schema, transform) {
  const copy = { ...schema };
  if (copy.properties) copy.properties = Object.fromEntries(Object.entries(copy.properties)
    .map(([key, child]) => [key, mapCommandSchema(child, transform)]));
  for (const key of ['oneOf', 'anyOf', 'allOf']) if (copy[key]) copy[key] = copy[key].map(child => mapCommandSchema(child, transform));
  if (copy.items) copy.items = mapCommandSchema(copy.items, transform);
  return transform(copy);
}
function residualCommandConstraints(schema, view) {
  const copy = { ...schema };
  delete copy.description;
  if (copy.additionalProperties === false && view?.additionalProperties === false
    && JSON.stringify(Object.keys(copy.properties ?? {}).sort()) === JSON.stringify(Object.keys(view.properties ?? {}).sort())) delete copy.additionalProperties;
  if (copy.minProperties && view?.required?.length >= copy.minProperties) delete copy.minProperties;
  if (copy.type && copy.type === view?.type) delete copy.type;
  if (copy.properties) copy.properties = Object.fromEntries(Object.entries(copy.properties)
    .map(([key, child]) => [key, residualCommandConstraints(child, view?.properties?.[key])]));
  for (const key of ['oneOf', 'anyOf', 'allOf']) if (copy[key]) copy[key] = copy[key].map(child => residualCommandConstraints(child, view));
  // Empty properties still declare allowed keys in a closed object.
  if (copy.properties && copy.additionalProperties !== false) {
    copy.properties = Object.fromEntries(Object.entries(copy.properties).filter(([, child]) => Object.keys(child).length));
    if (!Object.keys(copy.properties).length) delete copy.properties;
  }
  if (copy.items) copy.items = residualCommandConstraints(copy.items, view?.items);
  if (copy.required) {
    copy.required = copy.required.filter(key => !view?.required?.includes(key));
    if (!copy.required.length) delete copy.required;
  }
  return copy;
}
function factorCommandConstraints(schema) {
  const counts = new Map();
  mapCommandSchema(schema, node => { const key = JSON.stringify(node); counts.set(key, (counts.get(key) ?? 0) + 1); return node; });
  const definitions = {}, names = new Map();
  const factor = (node, defining = false) => {
    const key = JSON.stringify(node);
    if (!defining && counts.get(key) > 1 && key.length > 40) {
      if (!names.has(key)) {
        const name = `s${names.size}`; names.set(key, name); definitions[name] = factor(node, true);
      }
      return { $ref: `#/$defs/${names.get(key)}` };
    }
    const copy = { ...node };
    if (copy.properties) copy.properties = Object.fromEntries(Object.entries(copy.properties).map(([name, child]) => [name, factor(child)]));
    for (const name of ['oneOf', 'anyOf', 'allOf']) if (copy[name]) copy[name] = copy[name].map(child => factor(child));
    if (copy.items) copy.items = factor(copy.items);
    return copy;
  };
  return { schema: factor(schema, true), definitions };
}
export function compactCommandSchema(expanded) {
  const full = mapCommandSchema(expanded, node => { delete node.description; return node; });
  let projected;
  const kinds = full.properties.command.oneOf.map(row => row.properties.kind.const);
  // These two existing groups contain nested unions that Codex otherwise renders
  // as unknown. Keep their possible payload fields visible; help supplies the
  // exact per-kind required fields, and the SDK enforces those original rules.
  if (kinds.includes('material.stage') || kinds.includes('source_revision.preview')) {
    const view = commandTypeView(full.properties.command);
    view.additionalProperties = false;
    view.properties.kind = { enum: kinds };
    view.required = ['kind', 'payload'];
    const first = compactCommandValidationSchema(full);
    const factored = first.properties.command;
    // Closed objects with every declared key required have an equivalent count
    // constraint. This applies only to hidden validation, never visible required flags.
    // Resolve the first compactor's refs before deriving residual constraints.
    const expand = node => {
      if (node.$ref) return expand(first.$defs[node.$ref.split('/').at(-1)]);
      return mapCommandSchema(node, value => value.$ref ? expand(value) : value);
    };
    const validation = factorCommandConstraints(residualCommandConstraints(mapCommandSchema(expand(factored), node => {
      if (node.additionalProperties === false && node.required?.length === Object.keys(node.properties ?? {}).length) {
        const { required, ...rest } = node; return { ...rest, minProperties: required.length };
      }
      return node;
    }), view));
    projected = { ...full, properties: { ...full.properties, command: view },
      dependentSchemas: { command: { properties: { command: validation.schema } } },
      ...(Object.keys(validation.definitions).length ? { $defs: validation.definitions } : {}) };
  } else {
    projected = compactCommandValidationSchema(expanded);
    projected.properties = Object.fromEntries(Object.entries(projected.properties).map(([key, schema]) => {
      const { description, ...value } = schema;
      return [key, { ...(full.properties[key].type ? { type: full.properties[key].type } : {}), ...value }];
    }));
  }
  // Equivalent UUID spelling and shorter local labels retain the fixed discovery
  // budget. Core keeps the expanded canonical pattern and complete field help.
  const uuid = '^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$';
  projected = JSON.parse(JSON.stringify(projected).replaceAll(REVISION_ID_PATTERN.source, uuid)
    .replace(/#\/\$defs\/s(\d+)/gu, '#/$defs/$1'));
  if (projected.$defs) projected.$defs = Object.fromEntries(Object.entries(projected.$defs).map(([key, value]) => [key.replace(/^s/u, ''), value]));
  return projected;
}
const openObject = { type: 'object', additionalProperties: true };
const nullableObject = { ...openObject, type: ['object', 'null'] };
const nullableString = { type: ['string', 'null'] };
const resultProperties = {
  schema_version: { const: '1' }, outcome: enumeration(['accepted', 'already_applied', 'rejected', 'recovery_required', 'effect_unknown']), authorizes: { const: false },
  reason: { ...nullableString, minLength: 1 }, operation_id: { ...identity, type: ['string', 'null'] }, request_digest: { ...hash, type: ['string', 'null'] },
  binding: { oneOf: [{ type: 'null' },
    strictObject({ target_id: hash, run_id: envelope.run_id, expected_revision_id: identity, kind: enumeration(Object.keys(descriptors).filter(k => k !== 'run.create')) }),
    strictObject({ target_id: hash, run_id: envelope.run_id, expected_revision_id: { type: 'null' }, kind: { const: 'run.create' } }),
    strictObject({ target_id: hash, kind: { const: 'project.initialize' } }),
    strictObject({ target_id: hash, run_id: { type: 'null' }, expected_revision_id: { type: 'null' }, kind: enumeration(TARGET_SCOPED_COMMAND_KINDS) })] },
  receipt: nullableObject, effect: nullableObject,
  current: { ...nullableObject, properties: { available: { type: 'boolean' }, revision: { type: 'integer' }, revision_id: identity }, required: ['available'] },
  assurance: { ...openObject, properties: Object.fromEntries(Object.entries(COOPERATIVE_ASSURANCE).map(([key, value]) => [key, { const: value }])), required: Object.keys(COOPERATIVE_ASSURANCE) }, family_result: openObject,
  historical_effect: { type: 'boolean' }, dispatch: enumeration(['not_dispatched', 'unknown']), recovery: nullableString,
  diagnostics: { type: 'array', items: openObject },
  presentation_delivery: { ...openObject, properties: { mode: enumeration(['native_plus_chat', 'full_chat', 'prepared', 'ui_primary', 'full_markdown']), display: enumeration(['confirmed', 'unconfirmed']),
    text: { type: 'string' }, presentation_id: identity, revision_id: identity, document_digest: hash, document_language: nullableString, authorizes: { const: false } },
    required: ['mode', 'text', 'presentation_id', 'document_digest', 'authorizes'],
    oneOf: [{ properties: { mode: enumeration(['native_plus_chat', 'full_chat']) }, required: ['display', 'revision_id', 'document_language'] },
      { properties: { mode: enumeration(['prepared', 'ui_primary', 'full_markdown']) } }] },
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
  const properties = Object.fromEntries(keys.map(key => [key, key === 'binding' ? { type: ['object', 'null'] } : key === 'outcome' ? { type: 'string' } : resultProperties[key]]));
  return { type: 'object', properties, required: RUN_COMMAND_RESULT_SCHEMA.required,
    oneOf: resultVariants.map(variant => ({ ...variant, properties: Object.fromEntries(Object.entries(variant.properties).filter(([key]) => keys.includes(key))), required: variant.required.filter(key => keys.includes(key)) })) };
}
export function validateRunCommandResult(value) { return schemaDiagnostics(value, RUN_COMMAND_RESULT_SCHEMA); }
export function commandGroupDefinition(group) {
  const definition = { name: group,
    description: {
      agdf_project: 'Initialize canonical project control; explicit setup only.',
      agdf_run: 'Create an unapproved Run; replay the original UUID.',
      agdf_prepare: 'Prepare/deliver a decision document; never approve.',
      agdf_record: 'Stage material or record evidence; read operation-contract.',
      agdf_approve: 'Record a deliberate reply to the exact presented gate.',
      agdf_revise: 'Preview revisions; confirm before applying them.',
      agdf_closeout: 'Record closeout or preview/apply Run closure.',
    }[group],
    annotations: { readOnlyHint: false, destructiveHint: group !== 'agdf_prepare', idempotentHint: false, openWorldHint: false },
    inputSchema: compactCommandSchema(projectMcpInputSchema(commandGroupSchema(group))), outputSchema: commandResultDiscoverySchema() };
  if (Buffer.byteLength(JSON.stringify(definition)) > RUN_COMMAND_LIMITS.definition_bytes) throw Error('command_definition_budget_exceeded');
  return freeze(definition);
}
// Discovery carries the orientation envelope; the producer always checks the full
// RUN_COMMAND_RESULT_SCHEMA before delivery. Complete result help is on demand.
function commandResultDiscoverySchema() {
  return { type: 'object', required: RUN_COMMAND_RESULT_SCHEMA.required,
    properties: Object.fromEntries(['schema_version', 'outcome', 'authorizes'].map(k => [k, resultProperties[k]])) };
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
  if (typeof value === 'number' && (schema.minimum !== undefined && value < schema.minimum || schema.maximum !== undefined && value > schema.maximum)) errors.push({ path, code: 'number_out_of_bounds' });
  if (schema.type === 'boolean' && typeof value !== 'boolean') errors.push({ path, code: 'boolean_required' });
  if (schema.type === 'array') {
    if (!Array.isArray(value)) return [...errors, { path, code: 'array_required' }];
    if (schema.minItems !== undefined && value.length < schema.minItems || schema.maxItems !== undefined && value.length > schema.maxItems) errors.push({ path, code: 'array_out_of_bounds' });
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
  if (group === 'agdf_closeout') {
    const scoped = TARGET_SCOPED_COMMAND_KINDS.includes(kind);
    return ['run_id', 'expected_revision_id'].filter(key => Object.hasOwn(input, key) === scoped)
      .map(key => ({ path: `$.${key}`, code: scoped ? 'field_forbidden' : 'field_required' }));
  }
  return [];
}
export const runCommandRequestDigest = input => {
  const identity = value => {
    if (!value || typeof value !== 'object') return value;
    if (!Array.isArray(value) && Object.keys(value).sort().join() === 'digest,material_id') return { digest: value.digest, material_identity: 'canonical_text' };
    return Array.isArray(value) ? value.map(identity) : Object.fromEntries(Object.entries(value).map(([k, v]) => [k, identity(v)]));
  };
  return digest(`agdf-run-command/1\0${canonicalJson(identity(input))}`);
};
