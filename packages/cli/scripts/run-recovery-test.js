import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { currentFixture, currentRun } from '../../core/test/fixtures/current-run.js';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { treeBytes } from '../../core/test/control-cockpit-fixtures.js';
const cli = resolve(import.meta.dirname, '../bin/create-agdf.js');
// Administrative reset/reseal was removed. Original transaction recovery remains
// covered by run-step-transaction-test and approval/source-revision recovery.
for (const command of ['run-recovery', 'run-migrate', 'run-render-legacy', 'run-update']) test(`retired ${command} cannot rewrite unsupported original control`, t => {
  const f = currentFixture(t), run = currentRun(f);
  writeFileSync(run.path, run.content().replace('control_state_version: 4', 'control_state_version: 2'));
  writeFileSync(join(f.root, '.agdf/control/config.json'), '{\"control_layout\":\"master-backlog-v1\"}');
  const before = treeBytes(f.root);
  const result = spawnSync(process.execPath, [cli, command, '--dir', f.root], { encoding: 'utf8' });
  assert.notEqual(result.status, 0); assert.match(result.stderr, /unsupported|unknown|not supported/iu);
  assert.deepEqual(treeBytes(f.root), before);
});
