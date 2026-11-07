// Regression cases for the observed companion divergence (TP T-001; SCN-003 and the companion part
// of SCN-004). They FAILED on the unchanged companion (baseline main 53e8e900) and pass since the
// companion reads the shared Core run view (T-004, T-006). The assertions are those of T-001; T-006
// changed only the setup: the companion reads through a host process adapter that spawns the real
// read-only `run-view` command. SCN-020 adds the doctor block. Part of `test:claude-companion`.
import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildCompanionFixtures } from '../../core/test/fixtures/companion-fixtures.js';
import { evaluateGateCheck } from '../../core/lib/control-evaluation/gate-check.js';
import { localizeBlockingCondition } from '../../core/lib/interaction-presentation.js';

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));
const companionDir = join(repoRoot, 'plugins', 'agdf', 'host-templates', 'claude', 'companion');
const companion = name => import(pathToFileURL(join(companionDir, name)).href);
const { readSnapshot } = await companion('run-state.mjs');
const { buildPanelView } = await companion('view.mjs');
const { companionLabels } = await companion('localization.mjs');
const registry = JSON.parse(readFileSync(join(repoRoot, 'plugins', 'agdf', 'meta', 'agdf-interaction-locales.json'), 'utf8'));
const labels = companionLabels(registry);
// The host's `$.process` for this repository: the plugin runtime entry the companion names maps to the
// repository's validator, which carries the same command parser and handler.
const PLUGIN_ROOT = 'PLUGIN_ROOT';
const validator = fileURLToPath(new URL('../bin/agdf-validator.js', import.meta.url));
const processes = {
  run: (argv, { timeoutMs }) => new Promise((resolve, reject) => {
    assert.deepEqual(argv.slice(0, 3), ['node', `${PLUGIN_ROOT}/runtime/agdf-local.js`, 'run-view']);
    const child = spawn(process.execPath, [validator, ...argv.slice(2)], { timeout: timeoutMs });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', exitCode => resolve({ exitCode, stdout, stderr }));
  }),
};
const read = (fx, language = 'en') => readSnapshot(processes, { pluginRoot: PLUGIN_ROOT, root: fx.root, language, now: Date.now() });
const card = fx => evaluateGateCheck(fx.root, { runId: fx.runId, ignoreRunIdEnv: true, presentationLanguage: 'en' });

test('F01 open UR without artefact: the companion shows the status card missing approval and next step', async t => {
  const [fx] = buildCompanionFixtures(t, ['F01']);
  const report = card(fx);
  const snapshot = await read(fx);
  const run = snapshot.runs.find(entry => entry.id === fx.runId);
  assert.ok(run, 'the open run is readable');
  assert.deepEqual({ gate: run.gate, missing: run.missing, next: run.next },
    { gate: report.current_gate, missing: report.status_card.missing_approval, next: report.status_card.next_step },
    'companion and status card disagree for the same run');
});

test('F08 legacy v2 only: the unreadable reason is the MCP reason code', async t => {
  const [fx] = buildCompanionFixtures(t, ['F08']);
  const snapshot = await read(fx);
  assert.deepEqual(snapshot.unreadable.map(entry => entry.reason), ['run_version_unsupported']);
});

test('F08 legacy v2 only: the companion names the count instead of "no open runs"', async t => {
  const [fx] = buildCompanionFixtures(t, ['F08']);
  const snapshot = await read(fx);
  const view = buildPanelView({ snapshot, sessionStartedAt: 0, registry, labels, locale: 'en', columns: 60 });
  assert.notEqual(view.message, labels.locales.en.messages.noOpenRuns, 'a legacy-only store is not reported as having no open runs');
  assert.match(String(view.message), /\b1\b/u, 'the diagnosis names the number of unreadable runs');
});

test('SCN-004 F09 unsupported layout: the real run view gives the companion count and reason (T-004, T-013 finding F2)', async t => {
  const [fx] = buildCompanionFixtures(t, ['F09']);
  for (const [locale, text] of [['de', '1 Runs nicht lesbar: Aufbau des Kontrollordners nicht unterstützt'], ['en', '1 runs not readable: control folder layout not supported']]) {
    const snapshot = await read(fx, locale);
    assert.deepEqual([snapshot.status, snapshot.reason, snapshot.runFolders], ['unavailable', 'control_layout_unsupported', 1]);
    const view = buildPanelView({ snapshot, sessionStartedAt: 0, registry, labels, locale, columns: 60 });
    assert.equal(view.message, text, `${locale}: count and reason from the spawned run-view command`);
  }
});

test('SCN-020 F13 doctor block: the companion shows blocked with the status card blocking text', async t => {
  const [fx] = buildCompanionFixtures(t, ['F13']);
  const report = card(fx);
  assert.equal(report.status, 'blocked', 'the fixture is a doctor block on the status card');
  for (const locale of ['en', 'de']) {
    const snapshot = await read(fx, locale);
    const run = snapshot.runs.find(entry => entry.id === fx.runId);
    assert.ok(run, `${locale}: the blocked run is readable`);
    assert.equal(run.figure.mood, 'blockiert');
    const view = buildPanelView({ snapshot, sessionStartedAt: 0, selection: fx.runId, registry, labels, locale, columns: 60 });
    assert.equal(view.stateLabel, labels.locales[locale].states.blockiert);
    const text = localizeBlockingCondition(report.status_card.blocking_condition, { registry, requestedLocale: locale });
    assert.ok(text && String(view.reason).endsWith(text), `${locale}: ${view.reason} ends with the status card text ${text}`);
  }
});
