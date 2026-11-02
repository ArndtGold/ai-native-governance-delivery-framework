import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, realpathSync, readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { clarifiedUr } from '../../core/test/planned-fixtures.js';
import { parseRunState } from '../../core/lib/control-state/run-state-parser.js';
import { prepareLocalMarketplace, inspectPlanningMarketplace } from '../lib/installers/local-marketplace.js';
import { generatedRoot } from '../lib/cli/runtime-context.js';
import { parseArgs } from '../lib/cli/parse-args.js';
import { validateCommandOptions } from '../lib/cli/command-registry.js';
import { installCodexGlobalPlugin } from '../lib/host-adapters/codex/plugin.js';
import { pluginDefinition } from '../lib/cli/runtime-context.js';
const cli = fileURLToPath(new URL('../bin/create-agdf.js', import.meta.url));
test('SCN-003/025/027: actual CLI initializes backlog-free v4, saves/refines/hands off once and derives inventory', t => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-planned-cli-'))); t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q', root]);
  const invoke = (command, ...argv) => {
    const r = spawnSync(process.execPath, [cli, command, '--dir', root, '--json', '--language', 'en', ...argv], { encoding: 'utf8', cwd: root });
    assert.equal(r.status, 0, r.stdout + r.stderr); return JSON.parse(r.stdout);
  };
  invoke('init'); assert.equal(existsSync(join(root, '.agdf/control/MASTER_BACKLOG.md')), false);
  const source = join(root, 'need.md'); writeFileSync(source, clarifiedUr);
  const saved = invoke('planned', '--action', 'create', '--evidence', source, '--priority', 'high', '--operation', randomUUID());
  assert.equal(saved.outcome, 'accepted'); const entry = saved.family_result.entry;
  assert.equal(invoke('planned', '--action', 'inspect', '--plan-id', entry.plan_id).priority, 'high');
  const changed = entry.content.replace('Planning priority: high', 'Planning priority: low'); writeFileSync(source, changed);
  const refined = invoke('planned', '--action', 'replace', '--evidence', source, '--plan-id', entry.plan_id, '--source-digest', entry.digest, '--operation', randomUUID());
  assert.equal(refined.family_result.entry.priority, 'low');
  const start = invoke('planned', '--action', 'start', '--plan-id', entry.plan_id, '--source-digest', refined.family_result.entry.digest, '--operation', randomUUID());
  const again = invoke('planned', '--action', 'start', '--plan-id', entry.plan_id, '--source-digest', refined.family_result.entry.digest, '--operation', randomUUID());
  assert.equal(start.family_result.run_id, again.family_result.run_id);
  const run = readFileSync(join(root, `.agdf/control/runs/${start.family_result.run_id}/RUN_STATE.md`), 'utf8');
  assert.equal(parseRunState(run).meta.control_state_version, '4'); assert.doesNotMatch(run, /^## Approvals$/mu);
  const inventory = invoke('inventory'); assert.equal(inventory.counts.runs, 1); assert.equal(inventory.counts.planned, 0); assert.equal(inventory.planning_references.length, 1);
});
test('SCN-014/030: optional package publishes through the existing selector without a runtime; Core stays separately selected', t => {
  const dataRoot = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-planning-package-'))); t.after(() => rmSync(dataRoot, { recursive: true, force: true }));
  const optional = prepareLocalMarketplace({ dataRoot, packageSelection: 'planning' });
  assert.equal(inspectPlanningMarketplace(optional.root).source_digest, optional.sourceDigest);
  assert.equal(prepareLocalMarketplace({ dataRoot, packageSelection: 'planning' }).root, optional.root);
  for (const path of ['runtime', 'mcp', 'mcp.json', 'hooks', 'control']) assert.equal(existsSync(join(optional.pluginRoot, path)), false);
  assert.equal(existsSync(join(generatedRoot, 'plugins/agdf/runtime/runtime-manifest.json')), true);
  assert.throws(() => prepareLocalMarketplace({ packageSelection: '../arbitrary' }), /PACKAGE_SELECTION_INVALID/u);
  const parsed = parseArgs(['codex', '--package', 'planning', '--plugin-only']); validateCommandOptions(parsed.options ?? parsed);
  assert.throws(() => validateCommandOptions((parseArgs(['codex', '--package', 'planning', '--with-mcp'])).options), /optional|plugin-only/iu);
});

test('SCN-025/027: planning CLI rejects irrelevant, duplicate and mixed action fields', () => {
  for (const argv of [
    ['planned', '--action', 'list', '--force'], ['planned', '--action', 'list', '--source-digest', 'x'],
    ['planned', '--action', 'list', '--action', 'inspect'], ['planned', '--action', 'list', '--with-mcp'],
    ['layout-migrate', '--action', 'preview', '--plan-id', 'invented'], ['layout-migrate', '--action', 'apply', '--pending-digest', 'x'],
  ]) assert.throws(() => parseArgs([...argv, '--dir', '/tmp/project']), /unique fields|Unknown command/u);
});

for (const marketplace of ['agdf', 'agdf-repo']) test(`SCN-014/030: optional installer verifies compatible ${marketplace} Core, changes only its own catalog and reports restart boundary`, t => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-planning-adapter-'))); t.after(() => rmSync(root, { recursive: true, force: true }));
  const core = join(root, `plugins/cache/${marketplace}/agdf/0.20.2/meta`); mkdirSync(core, { recursive: true });
  const metadata = join(core, 'agdf-plugin.definition.json'), content = JSON.stringify({ planning: pluginDefinition.planning }); writeFileSync(metadata, content);
  const candidate = prepareLocalMarketplace({ dataRoot: join(root, 'data'), packageSelection: 'planning' });
  let added = false; const calls = [];
  const exec = (_executable, args) => {
    calls.push(args.join(' '));
    if (args.join(' ') === 'plugin list') return `agdf@${marketplace} 0.20.2\n${added ? `agdf-planning@agdf-planning ${candidate.codexInstallVersion}` : ''}`;
    if (args.join(' ') === 'plugin marketplace list --json') return '{"marketplaces":[]}';
    if (args.join(' ') === 'plugin add agdf-planning@agdf-planning --json') added = true;
    return '';
  };
  const result = installCodexGlobalPlugin({ packageSelection: 'planning', env: { CODEX_HOME: root }, prepare: () => candidate, exec });
  assert.equal(result.verificationStatus, 'configured_pending_restart'); assert.equal(result.runtimeDigest, null);
  assert.equal(readFileSync(metadata, 'utf8'), content);
  assert.ok(calls.filter(line => !line.endsWith('list') && !line.includes('marketplace list')).every(line => line.includes('agdf-planning')));
  writeFileSync(metadata, '{}'); const before = calls.length;
  assert.throws(() => installCodexGlobalPlugin({ packageSelection: 'planning', env: { CODEX_HOME: root }, prepare: () => assert.fail('must not publish without compatible Core'), exec }), /COMPATIBLE_CORE_REQUIRED/u);
  assert.deepEqual(calls.slice(before), ['plugin list']);
  writeFileSync(metadata, content);
  assert.throws(() => installCodexGlobalPlugin({ packageSelection: 'planning', env: { CODEX_HOME: root }, prepare: () => candidate,
    exec: (executable, args) => { if (args.join(' ') === 'plugin add agdf-planning@agdf-planning --json') throw Error('injected native failure'); return exec(executable, args); } }),
  error => error.message.includes('injected native failure') && error.recovery.some(row => row.args.join(' ') === 'plugin marketplace remove agdf-planning --json'));
});
