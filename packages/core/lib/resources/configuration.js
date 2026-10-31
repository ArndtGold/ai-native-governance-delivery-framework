import { readFileSync, existsSync, statSync } from '../control-read/fs.js';
import { join } from 'node:path';
import { canonicalizeLanguageTag } from '../interaction-presentation.js';
import { schemaDiagnostics, RUN_COMMAND_DESCRIPTORS } from '../control-state/run-command-schema.js';
import { GATE_CHECK_VARIANTS } from '../control-inspect/selection.js';
import { digest } from '../control-state/approval-command-contract.js';
import { containedRegularFile, hasSymlinkComponent } from '../control-state/contained-file.js';
import { currentInputResolution, isOriginalInputResolution } from '../control-state/input-resolution.js';

export const PREFERENCE_KEYS = Object.freeze(['chat_language', 'artifact_language', 'presentation_route', 'gate_check_variant']);
export const CONFIGURATION_PATH = '.agdf/control/config.json';
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
export function configurationError(source, field, action = 'Correct the named configuration field and retry the original operation safely.') {
  return Object.assign(Error('configuration_invalid'), { code: 'configuration_invalid', facts: { code: 'configuration_invalid', dispatch: 'not_dispatched' },
    diagnostic: { code: 'configuration_invalid', source, field, action } });
}
export function readPluginDefaults(generatedURL) {
  try {
    const bytes = readFileSync(new URL('plugins/agdf/meta/agdf-defaults.json', generatedURL), 'utf8');
    const schema = JSON.parse(readFileSync(new URL('plugins/agdf/meta/agdf-defaults.schema.json', generatedURL), 'utf8'));
    const document = JSON.parse(bytes);
    if (schemaDiagnostics(document, schema).length || !PREFERENCE_KEYS.every(key => Object.hasOwn(schema.properties.preferences.properties, key))) throw Error();
    const fields = schema.properties.preferences.properties;
    if (JSON.stringify(fields.presentation_route.enum.slice().sort()) !== JSON.stringify(RUN_COMMAND_DESCRIPTORS['presentation.deliver'].payload_schema.properties.route.enum.slice().sort())
      || JSON.stringify(fields.gate_check_variant.enum) !== JSON.stringify([null, ...GATE_CHECK_VARIANTS])) throw Error();
    for (const key of ['chat_language', 'artifact_language']) if (!canonicalizeLanguageTag(document.preferences[key])) throw Error();
    return { document, schema, digest: digest(bytes) };
  } catch { throw Error('runtime_resources_unavailable'); }
}
export function resolveConfiguration(root, defaults, explicit = {}) {
  const bound = currentInputResolution()?.configuration;
  if (bound && bound.root === (root ?? null) && Object.keys(explicit).length === 0) return bound;
  const source = { kind: 'plugin', path: 'meta/agdf-defaults.json', digest: defaults.digest };
  let project = {}, configDigest = null, control = 'inactive';
  if (root && existsSync(join(root, CONFIGURATION_PATH))) {
    const projectSource = { kind: 'project', path: CONFIGURATION_PATH };
    if (hasSymlinkComponent(root, CONFIGURATION_PATH) || containedRegularFile(root, CONFIGURATION_PATH).status !== 'valid') throw configurationError(projectSource, 'config', 'Use a regular contained project configuration file.');
    let bytes;
    try {
      if (statSync(join(root, CONFIGURATION_PATH)).size > 65536) throw Error();
      bytes = readFileSync(join(root, CONFIGURATION_PATH));
      if (bytes.length > 65536) throw Error();
      project = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    } catch { throw configurationError(projectSource, 'config', 'Correct the project configuration JSON; no operation was dispatched.'); }
    if (!plain(project))
      throw configurationError(projectSource, 'config', 'Restore the existing required language fields; defaults do not initialize project control.');
    for (const key of ['chat_language', 'artifact_language', 'runtime_language'])
      if (typeof project[key] !== 'string' || !project[key].trim()) throw configurationError(projectSource, key, 'Restore the named required language field; defaults do not initialize project control.');
    configDigest = digest(bytes); control = 'active';
    if (!canonicalizeLanguageTag(project.runtime_language)) throw configurationError({ ...projectSource, digest: configDigest }, 'runtime_language');
    for (const key of PREFERENCE_KEYS) if (Object.hasOwn(project, key)) {
      if (schemaDiagnostics(project[key], defaults.schema.properties.preferences.properties[key]).length
        || key.endsWith('_language') && !canonicalizeLanguageTag(project[key])) throw configurationError({ ...projectSource, digest: configDigest }, key);
    }
  }
  const values = {}, sources = {};
  for (const key of PREFERENCE_KEYS) {
    let value;
    if (Object.hasOwn(explicit, key)) {
      value = explicit[key]; sources[key] = { kind: 'explicit' };
      if (schemaDiagnostics(value, defaults.schema.properties.preferences.properties[key]).length) throw configurationError(sources[key], key, 'Correct the explicit value; an invalid value is never defaulted.');
    } else if (Object.hasOwn(project, key)) { value = project[key]; sources[key] = { kind: 'project', path: CONFIGURATION_PATH, digest: configDigest }; }
    else { value = defaults.document.preferences[key]; sources[key] = source; }
    values[key] = key.endsWith('_language') ? canonicalizeLanguageTag(value) : value;
    if (key.endsWith('_language') && !values[key]) throw configurationError(sources[key], key);
  }
  return Object.freeze({ root: root ?? null, control, config_digest: configDigest, values: Object.freeze(values), sources: Object.freeze(sources),
    defaults_digest: defaults.digest });
}
export function assertConfigurationCurrent(snapshot) {
  if (!snapshot?.root) return;
  const path = join(snapshot.root, CONFIGURATION_PATH);
  try {
    if (existsSync(path) && statSync(path).size > 65536) throw Error();
    const current = existsSync(path) ? digest(readFileSync(path)) : null;
    if (current === snapshot.config_digest && (!existsSync(path) || !hasSymlinkComponent(snapshot.root, CONFIGURATION_PATH))) return;
  } catch { /* Changed/unreadable configuration cannot select new values mid-effect. */ }
  throw Object.assign(Error('snapshot_stale'), { facts: { code: 'snapshot_stale', dispatch: 'not_dispatched' } });
}
export function assertInputConfigurationCurrent(root) {
  const snapshot = currentInputResolution()?.configuration;
  if (snapshot?.root && snapshot.root !== root) throw Error('target_binding_mismatch');
  if (snapshot && !isOriginalInputResolution()) assertConfigurationCurrent(snapshot);
}
export function effectiveConfiguration(snapshot, binding = 'current') {
  return { binding, values: snapshot.values, sources: snapshot.sources, constants: 'contract_owned', authorizes: false };
}
