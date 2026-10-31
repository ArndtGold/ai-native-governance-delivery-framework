import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { plannedFixture, clarifiedUr, completeUr } from './planned-fixtures.js';
import { mutatePlannedUr, inspectPlannedEntry, plannedEntryPath, plannedTextDigest, plannedRawDigest } from '../lib/control-state/planned-entry.js';
import { createRunFromPlanned } from '../lib/control-state/planned-handoff.js';
import { inspectPlannedOrigins } from '../lib/control-state/planned-origin.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { parseControlState, parseRunState } from '../lib/control-state/run-state-parser.js';
import { inspectMutationClaims } from '../lib/control-state/control-layout.js';
import { writeRun } from '../lib/control-state/run-state-writer.js';
import { readPlannedInventory } from '../lib/control-state/planned-inventory.js';

function fixture(t, content = clarifiedUr) {
  const root = plannedFixture(t, []);
  const entry = mutatePlannedUr(root, { kind: 'planned_ur.create', operation_id: randomUUID(), expected_digest: null, content }).entry;
  const input = { plan_id: entry.plan_id, expected_digest: entry.digest, target_id: resolveControlCommandTarget(root).target_id,
    operation_id: randomUUID(), request_digest: plannedTextDigest('exact selected handoff'), presentation_language: 'en' };
  return { root, entry, input };
}

test('SCN-015/018: explicit source-bound handoff registers unapproved UR and immutable origin in exactly one Run', t => {
  const { root, entry, input } = fixture(t);
  assert.equal(entry.readiness.ready, true, JSON.stringify(entry.readiness));
  const result = createRunFromPlanned(root, input), id = result.run_id;
  assert.equal(result.outcome, 'accepted');
  assert.equal(id, `run-${input.operation_id}`);
  const path = join(root, `.agdf/control/runs/${id}/RUN_STATE.md`), text = readFileSync(path, 'utf8');
  assert.equal(parseRunState(text, id).valid, true);
  assert.equal(runSealState(root, text).status, 'valid');
  const state = parseControlState(text, { userGates: ['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'] });
  assert.equal(state.approvals.get('UR').status, 'missing');
  assert.equal(state.artefacts.get('UR').status, 'draft');
  for (const name of ['UR.md', 'PLANNED_UR.md']) assert.equal(readFileSync(join(root, `.agdf/control/artefacts/${id}/${name}`), 'utf8'), entry.content);
  assert.equal(createRunFromPlanned(root, input).outcome, 'already_applied');
  const another = createRunFromPlanned(root, { ...input, operation_id: randomUUID() });
  assert.equal(another.run_id, id);
  assert.equal(another.outcome, 'already_transferred');
  assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), [id]);
  assert.equal(inspectPlannedOrigins(root, entry.plan_id).matches.length, 1);
  assert.throws(() => mutatePlannedUr(root, { kind: 'planned_ur.replace', operation_id: randomUUID(), plan_id: entry.plan_id,
    expected_digest: entry.digest, content: entry.content + '\nLater planning edit.\n' }), /ALREADY_TRANSFERRED/);
  assert.equal(inspectMutationClaims(root).length, 0);
});

test('SCN-016: incomplete and stale planning sources cannot create a Run', t => {
  const { root, input } = fixture(t, completeUr);
  assert.throws(() => createRunFromPlanned(root, input), /UR_NOT_READY/);
  assert.throws(() => createRunFromPlanned(root, { ...input, expected_digest: 'sha256:' + '0'.repeat(64) }), /SOURCE_STALE/);
  assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), []);
});

for (const phase of ['handoff_intent', 'handoff_output_UR.md', 'handoff_output_PLANNED_UR.md', 'handoff_output_PLANNED_ORIGIN.json',
  'handoff_before_run_publish', 'handoff_run_committed', 'handoff_entry_receipt', 'handoff_retired']) {
  test(`SCN-017: ${phase} interruption resumes the original handoff without another Run`, t => {
    const { root, entry, input } = fixture(t);
    assert.throws(() => createRunFromPlanned(root, input, { checkpoint(stage) { if (phase === stage) throw Error('fault'); } }), /RECOVERY_REQUIRED/);
    const result = createRunFromPlanned(root, input);
    assert.equal(result.run_id, `run-${input.operation_id}`);
    assert.equal(inspectPlannedOrigins(root, entry.plan_id).matches.length, 1);
    assert.equal(existsSync(join(root, `${plannedEntryPath(entry.plan_id)}/HANDOFF_PENDING.json`)), false);
    assert.equal(inspectMutationClaims(root).length, 0);
  });
}

test('SCN-017/019: committed Run origin remains authoritative when entry completion is missing', t => {
  const { root, entry, input } = fixture(t);
  const first = createRunFromPlanned(root, input);
  rmSync(join(root, `${plannedEntryPath(entry.plan_id)}/TRANSFER.json`));
  assert.equal(inspectPlannedOrigins(root, entry.plan_id).matches[0].run_id, first.run_id);
  assert.throws(() => mutatePlannedUr(root, { kind: 'planned_ur.replace', plan_id: entry.plan_id, operation_id: randomUUID(),
    expected_digest: entry.digest, content: entry.content + '\nUnexpected duplicate attempt.\n' }), /ALREADY_TRANSFERRED/);
  assert.equal(createRunFromPlanned(root, { ...input, operation_id: randomUUID() }).run_id, first.run_id);
});

test('SCN-017: foreign sibling outputs are preserved before any publication', t => {
  const { root, entry, input } = fixture(t);
  assert.throws(() => createRunFromPlanned(root, input, { checkpoint(stage) { if (stage === 'handoff_output_UR.md') throw Error('fault'); } }));
  const path = join(root, `.agdf/control/artefacts/run-${input.operation_id}/UR.md`);
  writeFileSync(path, 'Foreign bytes');
  assert.throws(() => createRunFromPlanned(root, input), /RECOVERY_REQUIRED/);
  assert.equal(readFileSync(path, 'utf8'), 'Foreign bytes');
  assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), []);
  assert.equal(inspectPlannedEntry(root, entry.plan_id).digest, entry.digest);
});

test('SCN-018/019: active UR may change while origin remains immutable; missing origin or missing Run plus transfer never permits another Run', t => {
  const { root, entry, input } = fixture(t), result = createRunFromPlanned(root, input);
  const path = join(root, `.agdf/control/runs/${result.run_id}/RUN_STATE.md`), before = readFileSync(path, 'utf8');
  const urPath = join(root, `.agdf/control/artefacts/${result.run_id}/UR.md`);
  writeFileSync(urPath, readFileSync(urPath, 'utf8') + '\nAn active UR clarification.\n');
  writeRun(path, before, parseRunState(before).meta.revision_id, { allowContentChange: true });
  assert.equal(inspectPlannedOrigins(root, entry.plan_id).matches[0].origin.planned.digest, entry.digest);
  const source = join(root, `.agdf/control/artefacts/${result.run_id}/PLANNED_ORIGIN.json`), origin = readFileSync(source, 'utf8');
  rmSync(source);
  assert.equal(inspectPlannedOrigins(root, entry.plan_id).complete, false);
  assert.throws(() => createRunFromPlanned(root, { ...input, operation_id: randomUUID() }), /ORIGIN_UNCONFIRMED/u);
  writeFileSync(source, origin);
  const runDirectory = join(root, `.agdf/control/runs/${result.run_id}`), moved = join(root, 'temporarily-missing-run');
  renameSync(runDirectory, moved);
  assert.equal(readPlannedInventory(root).entries[0].coverage, 'unconfirmed');
  assert.throws(() => createRunFromPlanned(root, { ...input, operation_id: randomUUID() }), /ORIGIN_UNCONFIRMED/u);
  renameSync(moved, runDirectory);
  const current = readFileSync(path, 'utf8'), snapshot = join(root, `.agdf/control/artefacts/${result.run_id}/PLANNED_UR.md`);
  writeFileSync(snapshot, 'Unrecorded origin mutation');
  assert.throws(() => writeRun(path, current, parseRunState(current).meta.revision_id, { allowContentChange: true }), /SEAL_INVALID|ORIGIN_IMMUTABLE/u);
  assert.equal(readFileSync(path, 'utf8'), current);
});

test('SCN-018: a manually authored BOM/CRLF planned UR has canonical identity and byte-exact immutable origin', t => {
  const { root, entry, input } = fixture(t), raw = '\uFEFF' + entry.content.replaceAll('\n', '\r\n');
  writeFileSync(join(root, entry.path), raw);
  const observed = inspectPlannedEntry(root, entry.plan_id);
  assert.equal(observed.digest, entry.digest); assert.equal(observed.raw_digest, plannedRawDigest(raw));
  const result = createRunFromPlanned(root, input);
  for (const name of ['UR.md', 'PLANNED_UR.md']) assert.equal(readFileSync(join(root, `.agdf/control/artefacts/${result.run_id}/${name}`), 'utf8'), raw);
  assert.equal(inspectPlannedOrigins(root, entry.plan_id).matches[0].origin.raw_digest, plannedRawDigest(raw));
});
