import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, readdirSync, symlinkSync } from 'node:fs';
import { symlinkOrSkip } from './control-cockpit-fixtures.js';
import { join } from 'node:path';
import { plannedFixture, completeUr } from './planned-fixtures.js';
import { mutatePlannedUr, inspectPlannedEntry, plannedEntryPath, planningId, parsePlannedUr, recoverPlannedMutation } from '../lib/control-state/planned-entry.js';
import { inspectMutationClaims } from '../lib/control-state/control-layout.js';

const createInput = (content = completeUr) => ({ kind: 'planned_ur.create', operation_id: randomUUID(), expected_digest: null, content });
function created(t) {
  const root = plannedFixture(t, []), input = createInput();
  const result = mutatePlannedUr(root, input);
  return { root, input, result, id: result.entry.plan_id };
}

test('SCN-004/006: canonical source owns title/priority; incomplete draft saves without a Run or approval', t => {
  const { root, result, id } = created(t);
  assert.equal(result.entry.title, 'Independent work');
  assert.equal(result.entry.priority, 'normal');
  assert.equal(result.entry.readiness.ready, false, 'new planning cannot use legacy clarification-marker absence');
  assert.equal(result.entry.authorizes, false);
  assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), []);
  const source = readFileSync(join(root, `${plannedEntryPath(id)}/UR.md`), 'utf8');
  for (const field of ['Planning schema', 'Planning id', 'Planning priority']) assert.equal(source.match(new RegExp(`^${field}:`, 'gm')).length, 1);
  assert.ok(!source.includes('Approval: UR received'));
  assert.equal(inspectMutationClaims(root).length, 0);
});

test('SCN-005/007: source-bound replacement, original UUID replay and conflicting inputs', t => {
  const { root, input, result, id } = created(t);
  assert.equal(mutatePlannedUr(root, input).outcome, 'already_applied');
  assert.throws(() => mutatePlannedUr(root, { ...input, content: completeUr + 'Changed intent.\n' }), /PAYLOAD_CONFLICT/);
  const replacement = { kind: 'planned_ur.replace', operation_id: randomUUID(), plan_id: id, expected_digest: result.entry.digest,
    content: result.entry.content.replace('Planning priority: normal', 'Planning priority: high') };
  const changed = mutatePlannedUr(root, replacement);
  assert.equal(changed.entry.priority, 'high');
  assert.equal(mutatePlannedUr(root, replacement).outcome, 'already_applied');
  assert.throws(() => mutatePlannedUr(root, { ...replacement, operation_id: randomUUID() }), /SOURCE_STALE/);
  assert.equal(inspectPlannedEntry(root, id).digest, changed.entry.digest);
});

test('SCN-008/009: malformed metadata, unsafe identity, NUL/Unicode and source limits reject', t => {
  const { root, result, id } = created(t);
  for (const content of [result.entry.content.replace('Planning priority: normal', 'Planning priority: urgent'),
    result.entry.content.replace('Planning schema:', 'Planning schema: wrong\nPlanning schema:'),
    result.entry.content.replace(`Planning id: ${id}`, 'Planning id: other'), result.entry.content.replace('# UR: Independent work', '# UR: '),
    result.entry.content + '\0', result.entry.content + '\ud800', result.entry.content + 'a'.repeat(131072)]) {
    assert.throws(() => mutatePlannedUr(root, { kind: 'planned_ur.replace', operation_id: randomUUID(), plan_id: id, expected_digest: result.entry.digest, content }));
  }
  for (const value of ['../escape', '.', 'a/b', 'C:bad', 'A', 'x'.repeat(129)]) assert.throws(() => plannedEntryPath(value), /ID_INVALID/);
  const outside = join(root, 'foreign'); writeFileSync(outside, result.entry.content);
  const link = join(root, '.agdf/control/planned/foreign');
  if (symlinkOrSkip(root, link, undefined, process.platform === 'win32' ? 'junction' : 'dir'))
    assert.throws(() => inspectPlannedEntry(root, 'foreign'), /PATH_INVALID/);
  assert.equal(readFileSync(outside, 'utf8'), result.entry.content);
});

for (const phase of ['create_intent', 'create_source', 'create_staged', 'create_committed']) {
  test(`SCN-005: creation ${phase} interruption replays the exact original effect`, t => {
    const root = plannedFixture(t, []), input = createInput(), id = planningId(input.operation_id);
    assert.throws(() => mutatePlannedUr(root, input, { checkpoint(stage) { if (stage === phase) throw Error('injected_fault'); } }), /RECOVERY_REQUIRED/);
    assert.equal(inspectMutationClaims(root).length, 1);
    const recovered = mutatePlannedUr(root, input);
    assert.equal(recovered.entry.plan_id, id);
    assert.equal(inspectMutationClaims(root).length, 0);
    assert.equal(readdirSync(join(root, '.agdf/control/planned')).filter(name => name === id).length, 1);
  });
}

for (const phase of ['replace_intent', 'replace_committed', 'replace_receipt', 'replace_retired']) {
  test(`SCN-005: replacement ${phase} interruption has a recoverable single source commit`, t => {
    const { root, result, id } = created(t);
    const input = { kind: 'planned_ur.replace', operation_id: randomUUID(), plan_id: id, expected_digest: result.entry.digest,
      content: result.entry.content.replace('Planning priority: normal', 'Planning priority: low') };
    assert.throws(() => mutatePlannedUr(root, input, { checkpoint(stage) { if (stage === phase) throw Error('injected_fault'); } }), /RECOVERY_REQUIRED/);
    const recovered = mutatePlannedUr(root, input);
    assert.equal(recovered.entry.priority, 'low');
    assert.equal(inspectMutationClaims(root).length, 0);
    assert.equal(existsSync(join(root, `${plannedEntryPath(id)}/MUTATION_PENDING.json`)), false);
  });
}

test('SCN-005: foreign pending bytes and original-UUID payload conflict are preserved', t => {
  const { root, result, id } = created(t);
  const input = { kind: 'planned_ur.replace', operation_id: randomUUID(), plan_id: id, expected_digest: result.entry.digest,
    content: result.entry.content.replace('Planning priority: normal', 'Planning priority: low') };
  assert.throws(() => mutatePlannedUr(root, input, { checkpoint(stage) { if (stage === 'replace_committed') throw Error('fault'); } }));
  assert.throws(() => mutatePlannedUr(root, { ...input, content: input.content + '\nOther input.\n' }), /PAYLOAD_CONFLICT/);
  const path = join(root, `${plannedEntryPath(id)}/UR.md`);
  const foreign = input.content + '\nForeign concurrent edit.\n'; writeFileSync(path, foreign);
  assert.throws(() => recoverPlannedMutation(root, id, input.operation_id), /RECOVERY_REQUIRED/);
  assert.equal(readFileSync(path, 'utf8'), foreign);
  assert.equal(inspectMutationClaims(root).length, 1);
  assert.equal(parsePlannedUr(foreign, id).priority, 'low');
});
