// Read-only run-view command (TP T-003, SCN-002): the JSON printed by the spawned surface-local
// validator equals the status card fields of the unchanged gate-check for every fixture F01 to F13,
// including completed runs, an unsupported layout and a doctor block, and writes nothing.
import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCompanionFixtures } from '../../core/test/fixtures/companion-fixtures.js';
import { evaluateGateCheck } from '../../core/lib/control-evaluation/gate-check.js';

const validator = fileURLToPath(new URL('../bin/agdf-validator.js', import.meta.url));
const runView = (root, args) => spawnSync(process.execPath, [validator, 'run-view', '--dir', root, '--json', ...args], { encoding: 'utf8' });
function controlDigest(root) {
  const hash = createHash('sha256');
  const walk = dir => { for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (lstatSync(path).isDirectory()) walk(path); else hash.update(relative(root, path)).update(readFileSync(path));
  } };
  walk(join(root, '.agdf', 'control'));
  return hash.digest('hex');
}
const cardFields = card => ({
  status: card.status, current_gate: card.current_gate, path: card.breadcrumb.map(({ gate, status }) => ({ gate, status })),
  missing_approval: card.missing_approval, blocking_reason: card.blocking_condition, next_step: card.next_step,
});
const entryFields = entry => ({
  status: entry.status, current_gate: entry.current_gate, path: entry.path,
  missing_approval: entry.missing_approval, blocking_reason: entry.blocking_reason, next_step: entry.next_step,
});

test('SCN-002: the spawned run-view command with --run equals the status card for F01 to F13 and writes nothing', t => {
  for (const fx of buildCompanionFixtures(t)) {
    const before = controlDigest(fx.root);
    for (const language of ['en', 'de']) {
      const ran = runView(fx.root, ['--language', language, '--run', fx.runId]);
      const view = JSON.parse(ran.stdout);
      assert.equal(view.schema_version, 'run-view/1', `${fx.id}: versioned output`);
      assert.equal(ran.status, view.store.status === 'ok' ? 0 : 2, `${fx.id}: exit code follows the store status`);
      const entry = view.runs.find(run => run.run_id === fx.runId);
      assert.ok(entry?.evaluated, `${fx.id} ${language}: the requested run is evaluated`);
      const report = evaluateGateCheck(fx.root, { runId: fx.runId, ignoreRunIdEnv: true, presentationLanguage: language });
      assert.deepEqual(entryFields(entry), cardFields(report.status_card), `${fx.id} ${fx.name} (${language})`);
    }
    assert.equal(controlDigest(fx.root), before, `${fx.id}: run-view writes nothing under .agdf/control`);
  }
});

test('SCN-002: store diagnosis and usage errors keep their exit codes', t => {
  const [unsupported] = buildCompanionFixtures(t, ['F09']);
  const ran = runView(unsupported.root, []);
  assert.equal(ran.status, 2, 'an unsupported layout is an unavailable store');
  assert.deepEqual(JSON.parse(ran.stdout).store, { status: 'unavailable', reason: 'control_layout_unsupported', run_folders: 1 });
  const relativeDir = spawnSync(process.execPath, [validator, 'run-view', '--dir', 'relative/path', '--json'], { encoding: 'utf8' });
  assert.equal(relativeDir.status, 1, 'a relative --dir is a usage error');
  const repeated = runView(unsupported.root, ['--json']);
  assert.equal(repeated.status, 1, 'only --run may repeat');
  // CR finding C3: a malformed run id is a usage error without output, never an evaluated run.
  for (const id of ['../../etc', 'Upper-Case', '', '-leading']) {
    const malformed = runView(unsupported.root, ['--run', id]);
    assert.equal(malformed.status, 1, `--run ${JSON.stringify(id)} is a usage error`);
    assert.equal(malformed.stdout, '', `--run ${JSON.stringify(id)} prints no run view`);
  }
});

test('CIR-05: without --language an unresolvable configuration never hides the store or run state', t => {
  const [unsupported, current] = buildCompanionFixtures(t, ['F09', 'F02']);
  const layout = runView(unsupported.root, []);
  assert.equal(layout.status, 2, 'an unsupported layout still yields its store diagnosis');
  assert.deepEqual(JSON.parse(layout.stdout).store, { status: 'unavailable', reason: 'control_layout_unsupported', run_folders: 1 });
  const configPath = join(current.root, '.agdf', 'control', 'config.json');
  writeFileSync(configPath, JSON.stringify({ ...JSON.parse(readFileSync(configPath, 'utf8')), chat_language: 'not a tag!' }, null, 2));
  const invalid = runView(current.root, ['--run', current.runId]);
  const entry = JSON.parse(invalid.stdout).runs.find(run => run.run_id === current.runId);
  assert.deepEqual([entry.evaluated, entry.evaluation_error, entry.figure.mood], [false, 'control_invalid', 'blockiert'],
    'an invalid configuration shows as a blocked, unreadable run, never as a normal run in a default language');
});
