// One wire-schema owner for the bounded cockpit connection. No filesystem selectors.
import { COCKPIT_UI_URI } from '../mcp-resource-contract.js';
import { READ_SESSION_CAPACITY } from '../control-read/cockpit-pool.js';
export { COCKPIT_UI_URI, DECISION_UI_URI } from '../mcp-resource-contract.js';
export const COCKPIT_MIME = 'text/html;profile=mcp-app';
export const COCKPIT_LIMITS = Object.freeze({ html: 4 * 1024 ** 2, idle: 30 * 60_000, lifetime: 8 * 60 * 60_000,
  sessions: READ_SESSION_CAPACITY, capture: 64 * 1024 ** 2, workerOldGeneration: 256 });
const id = { type: 'string', format: 'uuid' };
const run = { type: 'string', pattern: '^[A-Za-z0-9_-]{1,128}$' };
function operation(name, fields = {}, optional = []) {
  const properties = { operation: { const: name }, session_id: id, ...fields };
  return { type: 'object', additionalProperties: false, properties, required: Object.keys(properties).filter(key => !optional.includes(key)) };
}
export const COCKPIT_READ_SCHEMA = Object.freeze({ oneOf: [
  operation('snapshot', { run_id: run }, ['run_id']),
  operation('backlog_titles', { snapshot_id: id, row_ids: { type: 'array', minItems: 1, maxItems: 12, uniqueItems: true, items: id } }),
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
  description: 'Open the local read-only AGDF cockpit. When the user opens the cockpit for a Run explicitly identified in the request or already unambiguously established with the user in this conversation, you must pass its run_id, even if the latest request only says to open the cockpit. Omit run_id only when the user explicitly requests the overall overview or no unambiguous conversation Run exists. If several Runs could be intended, ask which to view. Never infer a Run from directory, recency or inventory. The optional schema preserves overview access; it does not make passing an established conversation Run optional. Selection and context never approve or authorize delivery.',
  annotations, inputSchema: { type: 'object', properties: { run_id: run }, additionalProperties: false },
  _meta: { ui: { resourceUri: COCKPIT_UI_URI, visibility: ['model', 'app'] } } });
export const COCKPIT_READ_DEFINITION = Object.freeze({ name: 'agdf_cockpit_read',
  description: 'Read registered sources or check the selected current canonical draft from the explicitly bound local AGDF project using scoped cockpit selectors. Draft checks are read-only authoring checks and never approve or authorize delivery.',
  annotations, inputSchema: COCKPIT_READ_SCHEMA,
  _meta: { ui: { visibility: ['model', 'app'] } } });

// Plugin opening has an explicit project; the directory-bound contract is unchanged.
export const COCKPIT_PLUGIN_RENDER_DEFINITION = Object.freeze({ ...COCKPIT_RENDER_DEFINITION,
  description: `${COCKPIT_RENDER_DEFINITION.description} For the plugin, supply the confirmed absolute primary_target, its target_source and an accessible absolute working_directory. Never infer a project from the plugin location or directory alone.`,
  inputSchema: { type: 'object', additionalProperties: false,
    properties: { run_id: run, working_directory: { type: 'string', minLength: 1, maxLength: 4096 },
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
  const runInput = parseCockpitArguments(Object.hasOwn(value, 'run_id') ? { run_id: value.run_id } : {}, true);
  return { ...value, ...runInput };
}

export function parseCockpitArguments(value, render = false) {
  const reject = () => { throw Object.assign(new TypeError('resource_denied'), { code: 'resource_denied' }); };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return reject();
  if (render) {
    if (Object.keys(value).some(key => key !== 'run_id')) return reject();
    if (!Object.hasOwn(value, 'run_id')) return {};
    if (typeof value.run_id !== 'string' || !new RegExp(run.pattern).test(value.run_id)) return reject();
    return { run_id: value.run_id };
  }
  const branch = COCKPIT_READ_SCHEMA.oneOf.find(row => row.properties.operation.const === value.operation);
  if (!branch || Object.keys(value).some(key => !Object.hasOwn(branch.properties, key)) || branch.required.some(key => !Object.hasOwn(value, key))) return reject();
  const valid = (item, rule) => {
    if (rule.const !== undefined) return item === rule.const;
    if (rule.type === 'string') return typeof item === 'string'
      && (!rule.format || /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(item))
      && (!rule.pattern || new RegExp(rule.pattern).test(item)) && (!rule.enum || rule.enum.includes(item));
    if (rule.type === 'integer') return Number.isSafeInteger(item) && item >= rule.minimum;
    if (rule.type === 'array') return Array.isArray(item) && item.length >= (rule.minItems ?? 0) && item.length <= rule.maxItems
      && new Set(item).size === item.length && item.every(entry => valid(entry, rule.items));
    return false;
  };
  if (Object.keys(value).some(key => !valid(value[key], branch.properties[key]))) return reject();
  return { ...value };
}
