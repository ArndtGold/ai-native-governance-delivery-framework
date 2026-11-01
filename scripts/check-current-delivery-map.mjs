// CI validates the current model in disposable control. Historical repository
// Runs are preserved and must not become migration inputs or synthetic approvals.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { currentFixture, currentRun } from '../packages/core/test/fixtures/current-run.js';
import { clarifiedUr } from '../packages/core/test/planned-fixtures.js';
const cleanups = [], lifecycle = { after: callback => cleanups.push(callback) };
try {
  const f = currentFixture(lifecycle), first = currentRun(f, 'Current delivery map'), second = currentRun(f, 'Independent current requirement');
  assert.equal(first.step('ur', clarifiedUr, { title: 'Current delivery map' }).outcome, 'accepted');
  assert.equal(first.approve('UR').outcome, 'accepted');
  for (const args of [['--run', first.id], ['--all-active']]) {
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('../packages/cli/bin/create-agdf.js', import.meta.url)), 'delivery-map', '--dir', f.root, '--json', ...args], { encoding: 'utf8' });
    assert.ifError(result.error); assert.equal(result.status, 0, result.stdout + result.stderr);
    const report = JSON.parse(result.stdout);
    assert(!JSON.stringify(report).includes('MASTER_BACKLOG.md'));
    if (args[0] === '--all-active') assert.equal(report.runs.length, 2);
  }
  console.log('Current single/all-active delivery map passed in a disposable typed store.');
} finally { for (const cleanup of cleanups.reverse()) cleanup(); }
