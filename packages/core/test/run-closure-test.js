import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { currentFixture, currentRun } from './fixtures/current-run.js';
import { treeBytes } from './control-cockpit-fixtures.js';
import { readRunOperations, runClosure } from '../lib/control-state/run-operations.js';
import { readPendingRunStepJournal } from '../lib/control-state/run-step-transaction.js';
import { closureOperationId } from '../lib/control-state/run-closure.js';
import { canonicalJson, digest } from '../lib/control-state/approval-command-contract.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { resolutionRecord } from '../lib/control-state/input-resolution.js';
const accepted = value => { assert.equal(value.outcome, 'accepted', JSON.stringify(value)); return value; };
function fixture(t) { const f = currentFixture(t); return { f, runs: ['First', 'Successor', 'Independent'].map(title => currentRun(f, title)) }; }
const entry = run => ({ run_id: run.id, outcome: 'abandoned', reason: 'Synthetic deliberate scope withdrawal' });
const preview = (f, entries) => accepted(f.call('closure.preview', { entries })).family_result;
const apply = (f, p, confirmation = p.confirmation_phrase) => f.call('closure.apply', { preview_id: p.preview_id, confirmation });
test('current closure preview reports derived facts and applies only the exact deliberately confirmed entries', t => {
  const { f, runs: [first, successor, independent] } = fixture(t), untouched = independent.content();
  const p = preview(f, [{ ...entry(first), outcome: 'superseded', successor_run: successor.id }, entry(successor)]);
  assert.equal(p.entries[0].facts.current_gate, 'UR'); assert.equal(p.entries[0].facts.title, 'First');
  assert.equal(first.state().meta.lifecycle, 'active'); const before = treeBytes(f.root);
  assert.equal(apply(f, p, 'Approval: UR').outcome, 'rejected'); assert.deepEqual(treeBytes(f.root), before);
  const applied = accepted(apply(f, p)).family_result; assert.equal(applied.closed_count, 2);
  assert.deepEqual(applied.results.map(row => row.result), ['closed', 'closed']);
  assert(applied.results.every(row => !Object.hasOwn(row, 'backlog'))); assert.doesNotMatch(applied.text, /backlog/iu);
  assert.equal(first.state().meta.lifecycle, 'superseded'); assert.equal(successor.state().meta.lifecycle, 'abandoned');
  const closure = runClosure(first.content()); assert.equal(closure.successor.value, successor.id);
  assert.equal(runSealState(f.root, first.content()).status, 'valid');
  const after = treeBytes(f.root), again = accepted(apply(f, p)).family_result;
  assert(again.results.every(row => row.result === 'already_closed')); assert.deepEqual(treeBytes(f.root), after);
  assert.equal(independent.content(), untouched);
  assert.equal(readRunOperations(first.content()).receipts.filter(row => row.kind === 'lifecycle_close.record').length, 1);
});
test('current closure rejects duplicate, unknown, self, mixed and unbounded entries without persisting a preview', t => {
  const { f, runs: [run] } = fixture(t);
  for (const entries of [[entry(run), entry(run)], [{ ...entry(run), outcome: 'completed' }], [{ ...entry(run), reason: '' }],
    [{ ...entry(run), outcome: 'superseded', successor_run: run.id }], [{ ...entry(run), outcome: 'superseded', successor_run: 'missing' }],
    [{ ...entry(run), outcome: 'superseded', successor_run: run.id, successor_reference: 'PR #1' }], [{ ...entry(run), reason: 'x'.repeat(1025) }], []]) {
    const before = treeBytes(f.root), result = createRunCommandService()('agdf_closeout', f.request('closure.preview', { entries }));
    assert.equal(result.outcome, 'rejected', JSON.stringify(result)); assert.deepEqual(treeBytes(f.root), before);
  }
});
test('changed and corrupt sources are reported per entry and do not block an unchanged independent selected Run', t => {
  const { f, runs: [first, second, independent] } = fixture(t), p = preview(f, [entry(first), entry(second)]);
  accepted(first.step('ur', '# UR\n\n## Goal\nChanged after preview.\n', { title: 'Changed scope' }));
  const before = first.content(), unrelated = independent.content();
  const result = accepted(apply(f, p)).family_result;
  assert.equal(result.results[0].result, 'not_closed'); assert.equal(result.results[0].reason, 'changed_since_preview');
  assert.equal(result.results[1].result, 'closed'); assert.equal(first.content(), before); assert.equal(independent.content(), unrelated);
  const broken = first.content().replace(/^- owner:.*$/mu, '- owner: Foreign owner'); writeFileSync(first.path, broken);
  const declined = preview(f, [entry(first)]); assert.equal(declined.entries[0].closable, false); assert.equal(first.content(), broken);
});
for (const phase of ['intent', 'run_before_rename', 'run_after_rename']) test(`current closure: real SIGKILL at ${phase} retains original recovery and one effect`, t => {
  const { f, runs: [first, second, independent] } = fixture(t), untouched = independent.content(), secondBefore = second.content();
  const p = preview(f, [entry(first), entry(second)]), input = f.request('closure.apply', { preview_id: p.preview_id, confirmation: p.confirmation_phrase });
  const owner = new URL('../lib/control-state/run-command-service.js', import.meta.url).href;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', `import {createRunCommandService} from ${JSON.stringify(owner)};
    createRunCommandService({packageVersion:'0.20.2',checkpoint(point){if(point===process.argv[2]){process.stdout.write('AGDF_KILL_CHECKPOINT');process.kill(process.pid,'SIGKILL')}}})('agdf_closeout',JSON.parse(process.argv[1]));`, JSON.stringify(input), phase], { encoding: 'utf8', timeout: 20000 });
  assert.equal(child.error, undefined); assert.equal(child.stdout, 'AGDF_KILL_CHECKPOINT'); assert.equal(child.stderr, '');
  if (process.platform === 'win32') assert(child.signal === 'SIGKILL' || child.status !== null && child.status !== 0); else assert.equal(child.signal, 'SIGKILL');
  assert.equal(second.content(), secondBefore); assert.equal(independent.content(), untouched);
  const pending = readPendingRunStepJournal(f.root, first.id); assert.equal(resolutionRecord(pending).schema_version, 7);
  assert.equal(Object.hasOwn(pending, 'backlog'), false);
  const observed = f.execute(input); assert.equal(observed.reason, 'closure_recovery_pending');
  const recovery = f.request('operation.recover', { original_kind: 'lifecycle_close.record', pending_digest: digest(canonicalJson(pending)), recovery_revision_id: first.binding().expected_revision_id },
    { ...first.binding(), operation_id: closureOperationId(p.preview_id, first.id) });
  accepted(f.execute(recovery));
  const completed = accepted(f.execute(input)).family_result; assert(completed.results.every(row => ['closed', 'already_closed'].includes(row.result)));
  assert.equal(first.state().meta.lifecycle, 'abandoned'); assert.equal(second.state().meta.lifecycle, 'abandoned');
  assert.equal(readRunOperations(first.content()).receipts.filter(row => row.kind === 'lifecycle_close.record').length, 1);
  assert.equal(independent.content(), untouched); assert.equal(runSealState(f.root, first.content()).status, 'valid');
});
