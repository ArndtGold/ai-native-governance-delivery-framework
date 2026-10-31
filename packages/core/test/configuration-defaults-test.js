import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import * as nativeFs from 'node:fs';
import { withControlReadView } from '../lib/control-read/fs.js';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resources, resolveArtifactPresentationLanguages } from '../lib/resources/context.js';
import { resolveConfiguration, assertConfigurationCurrent, readPluginDefaults } from '../lib/resources/configuration.js';
import { pathToFileURL } from 'node:url';
import { resolveMcpInput } from '../lib/mcp-input-resolution.js';
import { CONTROL_INSPECT_FUNCTION_DEFINITION } from '../lib/control-inspect/contract.js';
import { withInputResolution, currentInputResolution, validInputResolution } from '../lib/control-state/input-resolution.js';
import { inspectControlConfiguration } from '../lib/control-state/control-configuration.js';
import { languageConfigContent, resolveLanguagePreference } from '../lib/resources/language-preference.js';

const roots = [mkdtempSync(join(tmpdir(), 'agdf-defaults-a-')), mkdtempSync(join(tmpdir(), 'agdf-defaults-b-'))].map(root => realpathSync(root));
const config = { artifact_language: 'en', chat_language: 'de', runtime_language: 'en' };
const path = root => join(root, '.agdf/control/config.json');
const put = (root, value) => { mkdirSync(join(root, '.agdf/control'), { recursive: true }); writeFileSync(path(root), typeof value === 'string' ? value : JSON.stringify(value)); };
try {
  const [a, b] = roots;
  for (const root of roots) execFileSync('git', ['init', '-q', root]);
  const shipped = { chat_language: 'en', artifact_language: 'en', presentation_route: 'markdown', gate_check_variant: null };
  const generated = join(a, 'resources/');
  const meta = join(generated, 'plugins/agdf/meta'); mkdirSync(meta, { recursive: true });
  const defaultsPath = join(meta, 'agdf-defaults.json'), schemaPath = join(meta, 'agdf-defaults.schema.json');
  writeFileSync(schemaPath, JSON.stringify(resources.defaults.schema));
  for (const invalid of [{ schema_version: 2, preferences: shipped }, { schema_version: 1, preferences: { ...shipped, extra: true } },
    { schema_version: 1, preferences: { chat_language: 'en' } }, '{']) {
    writeFileSync(defaultsPath, typeof invalid === 'string' ? invalid : JSON.stringify(invalid));
    assert.throws(() => readPluginDefaults(pathToFileURL(generated)), /runtime_resources_unavailable/);
  }
  writeFileSync(defaultsPath, JSON.stringify(resources.defaults.document));
  assert.deepEqual(readPluginDefaults(pathToFileURL(generated)).document.preferences, shipped);
  assert.deepEqual(resolveConfiguration(a, resources.defaults).values, shipped);
  const changedResources = { ...resources, defaults: { ...resources.defaults, document: { ...resources.defaults.document,
    preferences: { ...shipped, artifact_language: 'fr', chat_language: 'de' } } } };
  const setupFallback = resolveLanguagePreference(undefined, { LANG: 'C' }, changedResources);
  assert.equal(setupFallback.artifact_language, 'fr'); assert.equal(setupFallback.chat_language, 'de');
  assert.equal(resolveLanguagePreference('en', { LANG: 'C' }, changedResources).artifact_language, 'en');
  assert.equal(resolveLanguagePreference(undefined, { LANG: 'de_DE.UTF-8' }, changedResources).artifact_language, 'de');
  assert.equal(inspectControlConfiguration(a).state, 'inactive');
  put(a, config); put(b, { ...config, chat_language: 'fr', presentation_route: 'fallback' });
  const before = readFileSync(path(a));
  assert.equal(resolveConfiguration(a, resources.defaults).values.chat_language, 'de');
  assert.equal(resolveConfiguration(a, resources.defaults, { chat_language: 'fr-CA' }).values.chat_language, 'fr-ca');
  assert.equal(resolveConfiguration(b, resources.defaults).values.chat_language, 'fr');
  assert.equal(resolveConfiguration(a, resources.defaults).sources.presentation_route.kind, 'plugin');
  assert.equal(resolveConfiguration(a, resources.defaults).sources.chat_language.kind, 'project');
  assert.deepEqual(readFileSync(path(a)), before);
  assert.equal(resolveArtifactPresentationLanguages(a, 'xx').presentation_language, 'en');
  assert.equal(resolveArtifactPresentationLanguages(a, 'de').artifact_language, 'en');
  put(a, { ...config, presentation_route: 'automatic', gate_check_variant: 'status-card', extension: { keep: true } });
  assert.equal(resolveConfiguration(a, resources.defaults).values.presentation_route, 'automatic');
  assert.equal(resolveConfiguration(a, resources.defaults, { presentation_route: 'markdown' }).values.presentation_route, 'markdown');
  const retained = JSON.parse(languageConfigContent({ ...config, chat_language: 'fr' }, JSON.parse(readFileSync(path(a)))));
  assert.equal(retained.presentation_route, 'automatic'); assert.deepEqual(retained.extension, { keep: true });
  const snapshot = resolveConfiguration(a, resources.defaults); assertConfigurationCurrent(snapshot);
  put(a, config); assert.throws(() => assertConfigurationCurrent(snapshot), /snapshot_stale/);
  assert.equal(resolveConfiguration(a, resources.defaults).values.presentation_route, 'markdown');
  for (const bad of ['{', [], { chat_language: 'de' }, { ...config, chat_language: 'bad_tag' }, { ...config, runtime_language: 'bad_tag' }, { ...config, presentation_route: null }, { ...config, gate_check_variant: 'approve' }]) {
    put(a, bad); const bytes = readFileSync(path(a));
    assert.throws(() => resolveConfiguration(a, resources.defaults, { chat_language: 'en' }), error => error.code === 'configuration_invalid' && error.diagnostic.source.kind === 'project');
    assert.deepEqual(readFileSync(path(a)), bytes);
  }
  put(a, { chat_language: 'de' }); assert.equal(inspectControlConfiguration(a).active, false);
  put(a, config);
  assert.throws(() => resolveConfiguration(a, resources.defaults, { presentation_route: 'approve' }), /configuration_invalid/);
  put(a, { ...config, extension: 'x'.repeat(65536) });
  let configReads = 0;
  const view = { ...nativeFs, lstatKindSync(path) { const s = nativeFs.lstatSync(path); return s.isSymbolicLink() ? 'symlink' : s.isDirectory() ? 'directory' : 'file'; },
    readFileSync(file, ...args) { if (file === path(a)) configReads++; return nativeFs.readFileSync(file, ...args); } };
  assert.throws(() => withControlReadView(view, () => resolveConfiguration(a, resources.defaults)), /configuration_invalid/);
  assert.equal(configReads, 0, 'an oversized project config is rejected before allocating its file bytes');
  assert.throws(() => withControlReadView(view, () => assertConfigurationCurrent(snapshot)), /snapshot_stale/);
  assert.equal(configReads, 0, 'pre-effect revalidation also refuses an oversized replacement before reading');
  put(a, config);
  const complete = root => ({ operation: 'project-state', primary_target: root, target_source: 'explicit_target' });
  const select = (root, executionContext) => resolveMcpInput(CONTROL_INSPECT_FUNCTION_DEFINITION, complete(root), { defaults: resources.defaults, executionContext });
  for (const executionContext of [undefined, { source: 'process', invocation_id: 'x', working_directory: a },
    { source: 'task_execution', working_directory: a }, { source: 'task_execution', invocation_id: 'x', working_directory: 'relative' }])
    assert.throws(() => select(a, executionContext), /working_directory_required/);
  const privateContext = root => ({ source: 'task_execution', invocation_id: root, working_directory: root });
  assert.throws(() => resolveMcpInput(CONTROL_INSPECT_FUNCTION_DEFINITION, complete(a), { defaults: resources.defaults,
    executionContext: privateContext(a), runtimeRoots: [a] }), /working_directory_required/);
  const selections = [select(a, privateContext(a)), select(b, privateContext(b))];
  put(a, { ...config, gate_check_variant: 'status-card' });
  const gate = { ...complete(a), operation: 'gate-check', working_directory: a };
  assert.equal(resolveMcpInput(CONTROL_INSPECT_FUNCTION_DEFINITION, gate, { defaults: resources.defaults }).arguments.variant, 'status-card');
  assert.equal(resolveMcpInput(CONTROL_INSPECT_FUNCTION_DEFINITION, { ...gate, variant: 'approval-envelope' }, { defaults: resources.defaults }).arguments.variant, 'approval-envelope');
  assert.equal(resolveMcpInput(CONTROL_INSPECT_FUNCTION_DEFINITION, { ...complete(a), working_directory: a }, { defaults: resources.defaults }).arguments.variant, undefined);
  await Promise.all(selections.map((selected, i) => withInputResolution(selected.resolution, async () => {
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(currentInputResolution().configuration.root, roots[i]);
    assert.equal(currentInputResolution().configuration.values.chat_language, i ? 'fr' : 'de');
    assert.equal(selected.arguments.working_directory, roots[i]);
  })));
  assert.equal(currentInputResolution(), null);
  assert.equal(validInputResolution(selections[0].resolution), true);
  for (const corrupt of [{ ...selections[0].resolution, schema_version: 2 }, { ...selections[0].resolution, fields: { assurance: 'human_approved' } },
    { ...selections[0].resolution, configuration: { ...selections[0].resolution.configuration,
      values: { ...selections[0].resolution.configuration.values, artifact_language: '' } } },
    { ...selections[0].resolution, configuration: { ...selections[0].resolution.configuration, values: { ...shipped, hidden: true } } }])
    assert.equal(validInputResolution(corrupt), false);
  console.log('configuration-defaults: passed (precedence, errors, activation, language, isolation, preservation, snapshot)');
} finally { roots.forEach(root => rmSync(root, { recursive: true, force: true })); }
