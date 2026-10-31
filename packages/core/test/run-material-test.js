import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, realpathSync, readFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initializeCanonicalControl } from '../../cli/lib/scaffold/canonical-init.js';
import { generatedFilesForTarget } from '../../cli/lib/scaffold/plan.js';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { createRunMaterialStore, MATERIAL_LIMITS } from '../lib/control-state/run-material.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { readPendingRunStepJournal } from '../lib/control-state/run-step-transaction.js';
import { canonicalJson, digest } from '../lib/control-state/approval-command-contract.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { validateRunCommandResult } from '../lib/control-state/run-command-contract.js';
import { inspectAuthoringInputs } from '../lib/control-inspect/authoring-inputs.js';

function fixture(work) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-material-')));
  const store = createRunMaterialStore();
  try {
    execFileSync('git', ['init', '-q', root]);
    initializeCanonicalControl(root, generatedFilesForTarget('init', root, false, 'en'));
    const path = createRun(root, 'material');
    const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target',
      primary_target: root, target_id: resolveControlCommandTarget(root).target_id, run_id: 'material',
      expected_revision_id: readFileSync(path, 'utf8').match(/^- revision_id: (.+)$/m)[1], operation_id: randomUUID(), assurance: 'cooperative_local' });
    const call = payload => store.stage({ ...bound(), command: { kind: 'material.stage', payload } });
    work({ root, path, bound, store, call });
  } finally { store.close(); rmSync(root, { recursive: true, force: true }); }
}

test('private multipart material records through the existing UR writer; restaging identity survives response loss', () => fixture(({ root, path, bound, store, call }) => {
  const text = '# UR: Exact material\n\n## Problem\nThe original outcome is unavailable.\n\n## Goal\nDeliver the bounded outcome.\n\n## Scope\nOnly this change.\n\n## Non-Goals\nOther work is excluded.\n\n## Acceptance Signals\nThe change is observable.\n\n## Risks And Unknowns\nNo material unknowns.\n';
  const bytes = Buffer.from(text), before = readFileSync(path, 'utf8');
  const start = call({ action: 'begin', files: [{ slot: 'UR', bytes: bytes.length }] });
  assert.deepEqual(validateRunCommandResult(start), []);
  const id = start.family_result.transfer_id;
  assert.equal(call({ action: 'seal', transfer_id: id }).reason, 'material_incomplete');
  const part = { action: 'append', transfer_id: id, file: 0, offset: 0, data: bytes.toString('base64') };
  assert.equal(call(part).outcome, 'accepted');
  assert.equal(call(part).family_result.replayed, true);
  assert.equal(call({ ...part, data: Buffer.alloc(bytes.length, 65).toString('base64') }).reason, 'material_part_conflict');
  const sealed = call({ action: 'seal', transfer_id: id }).family_result.files[0].reference;
  assert.equal(readFileSync(path, 'utf8'), before);
  assert.equal(existsSync(join(root, '.agdf/control/artefacts/material/UR.md')), false);
  const input = { ...bound(), command: { kind: 'step.record', payload: { step: 'ur', title: 'Exact material', source: sealed } } };
  const service = createRunCommandService({ packageVersion: '0.20.2', materialGrants: store.grants(input),
    checkpoint: phase => { if (phase === 'before_result') throw Error('lost_response'); } });
  const lost = service('agdf_record', input);
  assert.equal(lost.outcome, 'effect_unknown', JSON.stringify(lost));
  assert.equal(lost.reason, 'lost_response', JSON.stringify(lost));
  assert.equal(readFileSync(join(root, '.agdf/control/artefacts/material/UR.md'), 'utf8'), text);
  assert.equal(runSealState(root, readFileSync(path, 'utf8')).status, 'valid');
  let cursor, sourceText = '', pages = 0;
  do {
    const page = inspectAuthoringInputs(root, { ...bound(), ...(cursor ? { cursor } : {}) });
    assert.equal(page.available, true, JSON.stringify(page));
    assert.ok(page.documents.some(d => d.role === 'template' && d.source === 'version_matched_plugin'));
    if (page.chunk?.role === 'source' && page.chunk.type === 'UR') sourceText += page.chunk.content;
    cursor = page.next_cursor; pages++;
  } while (cursor);
  assert.ok(pages >= 2);
  assert.equal(sourceText, text, 'authoring source retrieval is complete without local file discovery');
  const revised = text + '\nAn explicitly permitted unapproved draft clarification.\n';
  const beginRevision = call({ action: 'begin', files: [{ slot: 'UR', bytes: Buffer.byteLength(revised) }] }).family_result.transfer_id;
  assert.equal(call({ action: 'append', transfer_id: beginRevision, file: 0, offset: 0, data: Buffer.from(revised).toString('base64') }).outcome, 'accepted');
  const revisedRef = call({ action: 'seal', transfer_id: beginRevision }).family_result.files[0].reference;
  const reviseInput = { ...bound(), command: { kind: 'ur_draft.replace', payload: { title: 'Exact material clarified', source: revisedRef } } };
  const revisedResult = createRunCommandService({ packageVersion: '0.20.2', materialGrants: store.grants(reviseInput) })('agdf_revise', reviseInput);
  assert.equal(revisedResult.outcome, 'accepted', JSON.stringify(revisedResult));
  assert.equal(revisedResult.receipt.kind, 'ur_draft.replace');
  assert.equal(readFileSync(join(root, '.agdf/control/artefacts/material/UR.md'), 'utf8'), revised);
  assert.equal(runSealState(root, readFileSync(path, 'utf8')).status, 'valid');
  store.close();
  const replay = createRunCommandService({ packageVersion: '0.20.2' })('agdf_record', input);
  assert.equal(replay.outcome, 'already_applied', JSON.stringify(replay));
  assert.equal(replay.receipt.operation_id, input.operation_id);
  const restaged = { ...input, command: { ...input.command, payload: { ...input.command.payload, source: { ...sealed, material_id: randomUUID() } } } };
  assert.equal(createRunCommandService()('agdf_record', restaged).outcome, 'already_applied', 'a disposable transfer identity is not canonical write identity');
  const conflict = { ...restaged, command: { ...restaged.command, payload: { ...restaged.command.payload, title: 'Changed write intent' } } };
  assert.equal(createRunCommandService()('agdf_record', conflict).reason, 'operation_payload_conflict');
}));

test('128 KiB Unicode handoff is bounded and bad sizes/offsets/slots do not publish', () => fixture(({ root, bound, store, call }) => {
  const bytes = Buffer.from('😀'.repeat(MATERIAL_LIMITS.file / 4));
  const start = call({ action: 'begin', files: [{ slot: 'EVIDENCE', bytes: bytes.length }] });
  const id = start.family_result.transfer_id;
  assert.equal(call({ action: 'append', transfer_id: id, file: 0, offset: 1, data: bytes.subarray(0, 1).toString('base64') }).reason, 'material_part_offset_invalid');
  for (let offset = 0; offset < bytes.length; offset += 16381) assert.equal(call({ action: 'append', transfer_id: id, file: 0, offset,
    data: bytes.subarray(offset, offset + 16381).toString('base64') }).outcome, 'accepted');
  const ref = call({ action: 'seal', transfer_id: id }).family_result.files[0].reference;
  const wrong = { ...bound(), command: { kind: 'step.record', payload: { step: 'ur', title: 'Wrong slot', source: ref } } };
  const denied = createRunCommandService({ materialGrants: store.grants(wrong) })('agdf_record', wrong);
  assert.equal(denied.reason, 'material_slot_mismatch');
  assert.equal(existsSync(join(root, '.agdf/control/artefacts/material/UR.md')), false);
  assert.equal(call({ action: 'begin', files: [{ slot: 'UR', bytes: 131073 }] }).reason, 'command_schema_invalid');
}));

test('invalid UTF-8, stale revision, capacity, idle expiry and absolute expiry never publish material', () => fixture(({ root, path, bound, call }) => {
  const before = readFileSync(path, 'utf8');
  const id = call({ action: 'begin', files: [{ slot: 'EVIDENCE', bytes: 2 }] }).family_result.transfer_id;
  assert.equal(call({ action: 'append', transfer_id: id, file: 0, offset: 0, data: Buffer.from([0xc3, 0x28]).toString('base64') }).outcome, 'accepted');
  assert.equal(call({ action: 'seal', transfer_id: id }).outcome, 'rejected');
  let tick = 0;
  const clocked = createRunMaterialStore({ now: () => tick });
  const stage = payload => clocked.stage({ ...bound(), command: { kind: 'material.stage', payload } });
  try {
    const begin = { action: 'begin', files: [{ slot: 'UR', bytes: 0 }] };
    const first = stage(begin).family_result.transfer_id;
    const stale = clocked.stage({ ...bound(), expected_revision_id: randomUUID(), command: { kind: 'material.stage', payload: { action: 'status', transfer_id: first } } });
    assert.equal(stale.reason, 'stale_revision');
    for (let i = 1; i < 4; i++) assert.equal(stage(begin).outcome, 'accepted');
    assert.equal(stage(begin).reason, 'material_resource_limit');
    tick = 120001;
    assert.equal(stage({ action: 'status', transfer_id: first }).reason, 'material_transfer_expired');
    assert.equal(clocked.inspectOwnership().sets, 0);
    const alive = stage(begin).family_result.transfer_id;
    for (let i = 0; i < 9; i++) { tick += 60000; assert.equal(stage({ action: 'status', transfer_id: alive }).outcome, 'accepted'); }
    tick += 60000;
    assert.equal(stage({ action: 'status', transfer_id: alive }).reason, 'material_transfer_expired', 'activity cannot extend the absolute ten-minute bound');
    clocked.close(); assert.equal(stage(begin).reason, 'material_transfer_expired');
  } finally { clocked.close(); }
  assert.equal(readFileSync(path, 'utf8'), before);
  assert.equal(existsSync(join(root, '.agdf/control/artefacts/material/UR.md')), false);
}));

// Synthetic compatibility proof: the actual material writer owns every receipt,
// output and seal; only the historical backlog field is added to its saved intent.
test('captured v4 material journal recovers its legacy output explicitly', () => fixture(({ root, path, bound, store, call }) => {
  const text = '# UR: Legacy recovery\n\n## Problem\nInterrupted delivery needs recovery.\n\n## Goal\nRecover captured output.\n\n## Scope\nOnly this fixture.\n\n## Non-Goals\nOther work.\n\n## Acceptance Signals\nThe captured bytes are restored.\n\n## Risks And Unknowns\nNone in the fixture.\n';
  const bytes = Buffer.from(text);
  const transfer_id = call({ action: 'begin', files: [{ slot: 'UR', bytes: bytes.length }] }).family_result.transfer_id;
  assert.equal(call({ action: 'append', transfer_id, file: 0, offset: 0, data: bytes.toString('base64') }).outcome, 'accepted');
  const reference = call({ action: 'seal', transfer_id }).family_result.files[0].reference;
  const initial = { ...bound(), command: { kind: 'step.record', payload: { step: 'ur', title: 'Legacy recovery', source: reference } } };
  assert.equal(createRunCommandService({ materialGrants: store.grants(initial) })('agdf_record', initial).outcome, 'accepted');
  const input = { ...bound(), command: { kind: 'ur_draft.replace', payload: { title: 'Legacy recovery revised', source: reference } } };
  const interrupted = createRunCommandService({ materialGrants: [{ ...reference, content: text, slot: 'UR', target_id: input.target_id, run_id: input.run_id, expected_revision_id: input.expected_revision_id }], checkpoint(point) { if (point === 'run') throw Error('fixture_interruption'); } })('agdf_revise', input);
  assert.equal(interrupted.outcome, 'effect_unknown', JSON.stringify(interrupted));
  const pending = readPendingRunStepJournal(root, input.run_id);
  assert.equal(pending.schema_version, 4);
  const legacy = join(root, '.agdf/control/MASTER_BACKLOG.md');
  pending.backlog = { old: '# Original legacy v4\n', next: '# Captured legacy v4\n' };
  writeFileSync(legacy, pending.backlog.old);
  writeFileSync(join(root, '.agdf/control/runs/material/RUN_STEP_PENDING.json'), JSON.stringify(pending));
  const service = createRunCommandService();
  const recovery = { ...input, expected_revision_id: bound().expected_revision_id, command: { kind: 'operation.recover', payload: {
    original_kind: 'ur_draft.replace', pending_digest: digest(canonicalJson(pending)), recovery_revision_id: bound().expected_revision_id } } };
  writeFileSync(legacy, 'Foreign edit\n');
  assert.equal(service('agdf_revise', recovery).outcome, 'effect_unknown', 'A committed receipt with conflicting captured output requires explicit recovery, not a fresh write.');
  assert.equal(readFileSync(legacy, 'utf8'), 'Foreign edit\n');
  writeFileSync(legacy, pending.backlog.old);
  const recovered = service('agdf_revise', recovery);
  assert.equal(recovered.outcome, 'accepted', JSON.stringify(recovered));
  assert.equal(readFileSync(legacy, 'utf8'), pending.backlog.next);
  assert.equal(readFileSync(join(root, '.agdf/control/artefacts/material/UR.md'), 'utf8'), text);
  assert.equal(runSealState(root, readFileSync(path, 'utf8')).status, 'valid');
  assert.equal(service('agdf_revise', input).outcome, 'already_applied');
}));
