// Shared representation, not a file owner or replay ledger. Existing operation
// families alone validate, persist and recover their versioned records.
import { AsyncLocalStorage } from 'node:async_hooks';
import { isAbsolute } from 'node:path';
import { canonicalJson, exactObject, DIGEST_PATTERN } from './approval-command-contract.js';
import { runCommandRequestDigest } from './run-command-schema.js';
import { canonicalizeLanguageTag } from '../interaction-presentation.js';

const context = new AsyncLocalStorage();
const FORMAT = 'resolved/1';
const paths = ['presentation_language', 'working_directory', 'schema_version', 'assurance', 'variant', 'command.payload.route'];
const preferenceKeys = ['chat_language', 'artifact_language', 'presentation_route', 'gate_check_variant'];
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const hash = value => typeof value === 'string' && DIGEST_PATTERN.test(value);
const tag = value => typeof value === 'string' && value.length > 0 && value.length <= 64 && canonicalizeLanguageTag(value) === value;
const get = (value, path) => path.split('.').reduce((v, key) => v?.[key], value);
function set(value, path, selected) {
  const keys = path.split('.'); let parent = value;
  for (const key of keys.slice(0, -1)) parent = parent[key];
  parent[keys.at(-1)] = selected;
}
export const currentInputResolution = () => context.getStore()?.resolution ?? null;
export const isOriginalInputResolution = () => context.getStore()?.original === true;
export const withInputResolution = (resolution, action, original = false) => context.run({ resolution: resolution ?? null, original }, action);
export function createInputResolution(original, effective, configuration) {
  return { schema_version: 1, logical_digest: runCommandRequestDigest(original), effective_digest: runCommandRequestDigest(effective),
    operation_id: original.operation_id ?? null, kind: original.command?.kind ?? null,
    fields: Object.fromEntries(paths.filter(path => get(original, path) === undefined && get(effective, path) !== undefined).map(path => [path, get(effective, path)])), configuration };
}
export function validInputResolution(value) {
  if (!exactObject(value, ['schema_version', 'logical_digest', 'effective_digest', 'operation_id', 'kind', 'fields', 'configuration']) || value.schema_version !== 1
    || !(value.operation_id === null || typeof value.operation_id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u.test(value.operation_id))
    || !(value.kind === null || typeof value.kind === 'string' && /^[a-z_]+\.[a-z_]+$/u.test(value.kind) && value.kind.length <= 64)
    || !hash(value.logical_digest) || !hash(value.effective_digest) || !plain(value.fields) || !plain(value.configuration)
    || Buffer.byteLength(canonicalJson(value)) > 8192 || Object.keys(value.fields).some(key => !paths.includes(key))) return false;
  const f = value.fields, c = value.configuration;
  if (Object.hasOwn(f, 'presentation_language') && !tag(f.presentation_language)
    || Object.hasOwn(f, 'working_directory') && (typeof f.working_directory !== 'string' || !isAbsolute(f.working_directory) || f.working_directory.length > 4096)
    || Object.hasOwn(f, 'schema_version') && f.schema_version !== '1'
    || Object.hasOwn(f, 'assurance') && f.assurance !== 'cooperative_local'
    || Object.hasOwn(f, 'variant') && !['status-card', 'approval-envelope'].includes(f.variant)
    || Object.hasOwn(f, 'command.payload.route') && !['markdown', 'automatic', 'fallback'].includes(f['command.payload.route'])) return false;
  if (!exactObject(c, ['root', 'control', 'config_digest', 'values', 'sources', 'defaults_digest'])
    || !(c.root === null || typeof c.root === 'string' && isAbsolute(c.root) && c.root.length <= 4096) || !['inactive', 'active'].includes(c.control)
    || !(c.config_digest === null || hash(c.config_digest)) || !hash(c.defaults_digest)
    || !exactObject(c.values, preferenceKeys) || !exactObject(c.sources, preferenceKeys)
    || !tag(c.values.chat_language) || !tag(c.values.artifact_language)
    || !['markdown', 'automatic', 'fallback'].includes(c.values.presentation_route)
    || ![null, 'status-card', 'approval-envelope'].includes(c.values.gate_check_variant)) return false;
  if (c.control === 'active' && (c.root === null || c.config_digest === null)
    || c.control === 'inactive' && c.config_digest !== null
    || Object.hasOwn(f, 'presentation_language') && f.presentation_language !== c.values.chat_language
    || Object.hasOwn(f, 'variant') && f.variant !== c.values.gate_check_variant
    || Object.hasOwn(f, 'command.payload.route') && f['command.payload.route'] !== c.values.presentation_route) return false;
  return preferenceKeys.every(key => {
    const source = c.sources[key];
    return exactObject(source, ['kind']) && source.kind === 'explicit'
      || exactObject(source, ['kind', 'path', 'digest']) && (source.kind === 'plugin' && source.path === 'meta/agdf-defaults.json'
        && source.digest === c.defaults_digest || source.kind === 'project' && source.path === '.agdf/control/config.json'
        && c.control === 'active' && source.digest === c.config_digest) && hash(source.digest);
  });
}
export function restoreResolvedInput(original, resolution) {
  if (!validInputResolution(resolution) || runCommandRequestDigest(original) !== resolution.logical_digest) throw Error('AGDF_OPERATION_PAYLOAD_CONFLICT');
  const effective = structuredClone(original);
  for (const [path, value] of Object.entries(resolution.fields)) set(effective, path, value);
  if (runCommandRequestDigest(effective) !== resolution.effective_digest) throw Error('AGDF_OPERATION_PAYLOAD_CONFLICT');
  return effective;
}
export function bindInputResolution(record) {
  const resolution = currentInputResolution();
  // Dispatch/read inputs have no typed command UUID or command digest. Their
  // per-call preferences may flow to rendering, never into a family receipt.
  if (!resolution?.kind || !resolution.operation_id) return record;
  if (!validInputResolution(resolution)) throw Error('input_resolution_invalid');
  return { ...record, schema_version: FORMAT, input_resolution: { ...resolution, record_version: record.schema_version } };
}
export function resolutionRecord(record) {
  if (record?.schema_version !== FORMAT) return record;
  const { input_resolution: extension, ...body } = record;
  if (!plain(extension)) return null;
  const { record_version, ...resolution } = extension;
  if (!['string', 'number'].includes(typeof record_version) || !validInputResolution(resolution)) return null;
  // Pending journals retain the owning family's digest (approval/revision have
  // their own domain digest). The committed receipt binds the full command and
  // journal recovery cross-checks both retained resolutions below that owner.
  const storedDigest = Object.hasOwn(body, 'old_run_digest') || body.kind === 'lifecycle_close.record'
    ? undefined : body.command_digest ?? body.operation?.request_digest ?? body.request_digest;
  if (storedDigest !== undefined && storedDigest !== resolution.effective_digest) return null;
  return { ...body, schema_version: record_version };
}
export const resolutionRecordVersion = record => resolutionRecord(record)?.schema_version;
export function recordedInputResolution(record) {
  if (record?.schema_version !== FORMAT || !resolutionRecord(record)) return null;
  const { record_version, ...resolution } = record.input_resolution;
  return resolution;
}
