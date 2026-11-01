import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { currentFixture } from '../../core/test/fixtures/current-run.js';
import { treeBytes } from '../../core/test/control-cockpit-fixtures.js';
const cli = resolve(import.meta.dirname, '../bin/create-agdf.js'), validator = resolve(import.meta.dirname, '../bin/agdf-validator.js');
test('current CLI closure grammar, exact confirmation, multi-Run results, identity and replay share the canonical owner', t => {
  const f = currentFixture(t);
  for (const [name, value] of [['user.name', 'Synthetic CLI Owner'], ['user.email', 'cli-owner@example.invalid']]) execFileSync('git', ['-C', f.root, 'config', name, value]);
  const call = (bin, command, ...args) => { const result = spawnSync(process.execPath, [bin, command, '--dir', f.root, '--language', 'en', '--json', ...args], { encoding: 'utf8' });
    let value; try { value = JSON.parse(result.stdout); } catch {} return { ...result, value }; };
  const accepted = result => { assert.equal(result.status, 0, result.stdout + result.stderr); assert.equal(result.value.outcome, 'accepted'); return result.value.family_result; };
  const [first, second, independent] = ['First', 'Second', 'Independent'].map(title => accepted(call(cli, 'run-create', '--title', title)).run_id);
  for (const args of [[], ['--action', 'close'], ['--action', 'preview'], ['--action', 'preview', '--run', first, '--outcome', 'abandoned'],
    ['--action', 'preview', '--run', first, '--outcome', 'superseded', '--reason', 'x', '--successor-run', second, '--successor-ref', 'PR'],
    ['--action', 'preview', '--run', first, '--outcome', 'abandoned', '--reason', 'x', '--reason', 'y'],
    ['--action', 'apply', '--preview-id', 'abcd1234'], ['--action', 'apply', '--preview-id', 'abcd1234', '--confirmation', 'Close runs: abcd1234', '--run', first]]) {
    const before = treeBytes(f.root), result = call(cli, 'run-close', ...args);
    assert.notEqual(result.status, 0, JSON.stringify(args)); assert.deepEqual(treeBytes(f.root), before);
  }
  const preview = accepted(call(cli, 'run-close', '--action', 'preview', '--run', first, '--outcome', 'superseded', '--reason', 'Replaced by second', '--successor-run', second));
  assert.match(preview.text, /A closed run is final/u); assert.equal(preview.confirmation_phrase, 'Close runs: ' + preview.preview_id);
  assert.equal(preview.entries[0].facts.current_gate, 'UR');
  const file = join(f.root, 'closure-input.json'); writeFileSync(file, JSON.stringify({ entries: [{ run_id: second, outcome: 'abandoned', reason: 'Synthetic scope dropped' }] }));
  const multiple = accepted(call(validator, 'run-close', '--action', 'preview', '--closure-file', file));
  const before = treeBytes(f.root), wrong = call(validator, 'run-close', '--action', 'apply', '--preview-id', multiple.preview_id, '--confirmation', preview.confirmation_phrase);
  assert.notEqual(wrong.status, 0); assert.equal(wrong.value.reason, 'confirmation_other_preview'); assert.deepEqual(treeBytes(f.root), before);
  const applied = accepted(call(validator, 'run-close', '--action', 'apply', '--preview-id', multiple.preview_id, '--confirmation', multiple.confirmation_phrase));
  assert.equal(applied.closed_count, 1); assert.equal(applied.confirmed_by.name, 'Synthetic CLI Owner');
  const repeated = accepted(call(cli, 'run-close', '--action', 'apply', '--preview-id', multiple.preview_id, '--confirmation', multiple.confirmation_phrase));
  assert.equal(repeated.results[0].result, 'already_closed');
  accepted(call(cli, 'run-close', '--action', 'apply', '--preview-id', preview.preview_id, '--confirmation', preview.confirmation_phrase));
  assert.match(readFileSync(join(f.root, '.agdf/control/runs', first, 'RUN_STATE.md'), 'utf8'), /^- lifecycle: superseded$/mu);
  const all = call(cli, 'doctor', '--all-active').value; assert.deepEqual(all.runs.map(row => row.run_id), [independent]);
});
