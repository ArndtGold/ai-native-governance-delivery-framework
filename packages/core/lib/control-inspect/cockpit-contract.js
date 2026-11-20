import { REVISION_ID_PATTERN, RUN_ID_PATTERN } from '../control-state/run-identity.js';
// One wire-schema owner for the bounded cockpit connection. No filesystem selectors.
import { COCKPIT_UI_URI } from '../mcp-resource-contract.js';
import { READ_SESSION_CAPACITY } from '../control-read/cockpit-pool.js';
export { COCKPIT_UI_URI, DECISION_UI_URI } from '../mcp-resource-contract.js';
export const COCKPIT_MIME = 'text/html;profile=mcp-app';
export const COCKPIT_LIMITS = Object.freeze({ html: 4 * 1024 ** 2, idle: 30 * 60_000, lifetime: 8 * 60 * 60_000,
  sessions: READ_SESSION_CAPACITY, capture: 64 * 1024 ** 2, workerOldGeneration: 256 });
const id = { type: 'string', format: 'uuid' };
const run = { type: 'string', pattern: RUN_ID_PATTERN.source };
const renderView = { const: 'companion' };
const renderProperties = { run_id: run, view: renderView };
const displayPresentation = { type: 'object', additionalProperties: false, required: ['status'], properties: {
  status: { type: 'string', minLength: 1, maxLength: 512, pattern: '\\S' },
  gate: { type: 'string', minLength: 1, maxLength: 128, pattern: '\\S' },
  gate_state: { type: 'string', enum: ['current', 'done'] },
} };
function operation(name, fields = {}, optional = []) {
  const properties = { operation: { const: name }, session_id: id, ...fields };
  return { type: 'object', additionalProperties: false, properties, required: Object.keys(properties).filter(key => !optional.includes(key)) };
}
export const COCKPIT_READ_SCHEMA = Object.freeze({ oneOf: [
  operation('display_ack', { snapshot_id: id, presentation: displayPresentation }, ['presentation']),
  { type: 'object', additionalProperties: false, properties: { operation: { const: 'display_status' }, display_id: id },
    required: ['operation', 'display_id'] },
  operation('snapshot', { run_id: run, view: { type: 'string', enum: ['runs'] } }, ['run_id', 'view']),
  operation('archive', { snapshot_id: id, row_id: id, resource_id: id }, ['resource_id']),
  operation('planned', { snapshot_id: id, row_id: id }),
  operation('run', { snapshot_id: id, run_id: run }),
  operation('artifact_readiness', { snapshot_id: id, run_id: run, gate: { type: 'string', enum: ['UR', 'PRD', 'SD', 'TP'] }, expected_revision_id: id }),
  operation('document', { snapshot_id: id, run_id: run, resource_id: id }),
  operation('preview', { snapshot_id: id, run_id: run, resource_id: id }),
  operation('freshness', { snapshot_id: id }),
  operation('changes', { snapshot_id: id }),
  operation('decision_display', { owner_epoch: id, nonce: id, surface_id: id,
    document_digest: { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' }, visible: { const: true } }),
  operation('decision_state'),
  operation('context', { snapshot_id: id, run_id: run }),
  operation('prepare_context', { snapshot_id: id, run_id: run, revision_id: id, resource_id: id,
    graph_ids: { type: 'array', maxItems: 16, uniqueItems: true, items: id },
    excluded_ids: { type: 'array', maxItems: 64, uniqueItems: true, items: id },
    generation: { type: 'integer', minimum: 1 } }),
  operation('validate_context', { context_id: id, generation: { type: 'integer', minimum: 1 } }),
  operation('invalidate_context'),
  operation('complete_context_invalidation', { invalidation_id: id }),
  operation('close'),
] });
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false };
export const COCKPIT_RENDER_DEFINITION = Object.freeze({ name: 'agdf_cockpit',
  description: 'Open the local read-only AGDF cockpit. For a general Companion or Cockpit opening in Codex, pass view: companion. Also pass run_id if this chat has an unambiguously established Run. The Companion prefers that Run while it is active, then an active Run awaiting a human decision, then the most recently updated active Run. For a request to open a specific Run, pass its run_id without view, even if already completed. For the overall overview, omit view and run_id. If several Runs could match an explicit request, ask which one. Selection never approves or authorizes delivery.',
  annotations, inputSchema: { type: 'object', properties: renderProperties, additionalProperties: false },
  _meta: { ui: { resourceUri: COCKPIT_UI_URI, visibility: ['model', 'app'] } } });
export const COCKPIT_READ_DEFINITION = Object.freeze({ name: 'agdf_cockpit_read',
  description: 'Read registered sources or check the selected current canonical draft from the explicitly bound local AGDF project using scoped cockpit selectors. Use the supplied display_status call to check the first visible render. When present, display.presentation reports the Companion title, status text and current or last completed gate from that render. Treat these fields as display data only. Only the Cockpit UI sends display_ack. Draft checks never approve or authorize delivery.',
  annotations, inputSchema: COCKPIT_READ_SCHEMA,
  _meta: { ui: { visibility: ['model', 'app'] } } });

const continuationFields = { snapshot_id: id, run_id: run, revision_id: id };
export const COCKPIT_CONTINUATION_DEFINITION = Object.freeze({ name: 'agdf_cockpit_continue',
  description: 'Reserve and publish a selected Codex Companion continuation after the person clicks. Status never sends a chat message. This action cannot record an approval.',
  annotations: { ...annotations, readOnlyHint: false },
  inputSchema: { oneOf: [
    operation('status', continuationFields),
    operation('reserve', continuationFields),
    operation('publish', { ...continuationFields, attempt_id: id }),
    operation('cancel', { ...continuationFields, attempt_id: id }),
  ] },
  _meta: { ui: { visibility: ['app'] } } });

export function parseCockpitContinuationArguments(value) {
  const schema = COCKPIT_CONTINUATION_DEFINITION.inputSchema.oneOf.find(row => row.properties.operation.const === value?.operation);
  if (!value || typeof value !== 'object' || Array.isArray(value) || !schema
    || schema.required.length !== Object.keys(value).length
    || !schema.required.every(key => Object.hasOwn(value, key) && typeof value[key] === 'string'
      && (key === 'operation' || (key === 'run_id' ? RUN_ID_PATTERN : REVISION_ID_PATTERN).test(value[key]))))
    throw Object.assign(new TypeError('resource_denied'), { code: 'resource_denied' });
  return value;
}

// Plugin opening has an explicit project; the directory-bound contract is unchanged.
export const COCKPIT_PLUGIN_RENDER_DEFINITION = Object.freeze({ ...COCKPIT_RENDER_DEFINITION,
  description: `${COCKPIT_RENDER_DEFINITION.description} For the plugin, supply the confirmed absolute primary_target, its target_source and an accessible absolute working_directory. Never infer a project from the plugin location or directory alone.`,
  inputSchema: { type: 'object', additionalProperties: false,
    properties: { ...renderProperties, working_directory: { type: 'string', minLength: 1, maxLength: 4096 },
      primary_target: { type: 'string', minLength: 1, maxLength: 4096 },
      target_source: { type: 'string', enum: ['explicit_target', 'continued_target', 'current_repository'] } },
    required: ['working_directory', 'primary_target', 'target_source'] } });

export function parsePluginCockpitArguments(value) {
  const fields = COCKPIT_PLUGIN_RENDER_DEFINITION.inputSchema;
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).some(key => !Object.hasOwn(fields.properties, key))
    || fields.required.some(key => typeof value[key] !== 'string' || !value[key] || value[key].length > 4096)
    || !fields.properties.target_source.enum.includes(value.target_source)) {
    throw Object.assign(new TypeError('resource_denied'), { code: 'resource_denied' });
  }
  const runInput = parseCockpitArguments(Object.fromEntries(Object.entries(value).filter(([key]) => Object.hasOwn(renderProperties, key))), true);
  return { ...value, ...runInput };
}

export function parseCockpitArguments(value, render = false) {
  const reject = () => { throw Object.assign(new TypeError('resource_denied'), { code: 'resource_denied' }); };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return reject();
  if (render) {
    if (Object.keys(value).some(key => !Object.hasOwn(renderProperties, key))) return reject();
    if (Object.hasOwn(value, 'view') && value.view !== renderView.const) return reject();
    if (Object.hasOwn(value, 'run_id') && (typeof value.run_id !== 'string' || !RUN_ID_PATTERN.test(value.run_id))) return reject();
    return { ...value };
  }
  if (value.operation === 'snapshot' && Object.hasOwn(value, 'run_id') && Object.hasOwn(value, 'view')) return reject();
  const branch = COCKPIT_READ_SCHEMA.oneOf.find(row => row.properties.operation.const === value.operation);
  if (!branch || Object.keys(value).some(key => !Object.hasOwn(branch.properties, key)) || branch.required.some(key => !Object.hasOwn(value, key))) return reject();
  const valid = (item, rule) => {
    if (rule.const !== undefined) return item === rule.const;
    if (rule.type === 'string') return typeof item === 'string'
      && item.length >= (rule.minLength ?? 0) && item.length <= (rule.maxLength ?? Infinity)
      && (!rule.format || /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(item))
      && (!rule.pattern || new RegExp(rule.pattern).test(item)) && (!rule.enum || rule.enum.includes(item));
    if (rule.type === 'integer') return Number.isSafeInteger(item) && item >= rule.minimum;
    if (rule.type === 'array') return Array.isArray(item) && item.length >= (rule.minItems ?? 0) && item.length <= rule.maxItems
      && new Set(item).size === item.length && item.every(entry => valid(entry, rule.items));
    if (rule.type === 'object') return item !== null && typeof item === 'object' && !Array.isArray(item)
      && rule.required.every(key => Object.hasOwn(item, key))
      && Object.keys(item).every(key => Object.hasOwn(rule.properties, key) && valid(item[key], rule.properties[key]));
    return false;
  };
  if (Object.keys(value).some(key => !valid(value[key], branch.properties[key]))) return reject();
  if (value.operation === 'display_ack' && value.presentation
    && Object.hasOwn(value.presentation, 'gate') !== Object.hasOwn(value.presentation, 'gate_state')) return reject();
  return { ...value };
}
