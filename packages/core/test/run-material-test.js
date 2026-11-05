import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, realpathSync, readFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initializeCurrentControl } from './fixtures/current-init.js';
import { currentFixture, currentRun } from './fixtures/current-run.js';
import { pendingRunStepPath } from '../lib/control-state/run-step-pending.js';
import { generatedFilesForTarget } from '../../cli/lib/scaffold/plan.js';
import { canonicalInitPlan } from '../lib/resources/canonical-init-plan.js';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { createRunMaterialStore, MATERIAL_LIMITS } from '../lib/control-state/run-material.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { readPendingRunStepJournal } from '../lib/control-state/run-step-transaction.js';
import { canonicalJson, digest } from '../lib/control-state/approval-command-contract.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { validateRunCommandResult, commandGroupDefinition, operationContract } from '../lib/control-state/run-command-contract.js';
import { withUxSourceDecision } from '../lib/control-inspect/material-recording-calls.js';
import { inspectAuthoringInputs } from '../lib/control-inspect/authoring-inputs.js';
import { createCoreServices } from '../lib/index.js';
import { validateRunCommand, schemaDiagnostics } from '../lib/control-state/run-command-contract.js';
import { continueDeliveryCall, preparedCommandCall } from '../lib/control-state/prepared-control-calls.js';
import { SKILL_DISPATCH_FUNCTION_DEFINITION } from '../lib/skill-dispatch/contract.js';
import { CONTROL_INSPECT_FUNCTION_DEFINITION } from '../lib/control-inspect/contract.js';
import { clarifiedUr } from './planned-fixtures.js';

test('put atomically seals bounded UTF-8, replays exact bytes and never publishes canonical state', () => fixture(({ store, bound, path }) => {
  const before = readFileSync(path, 'utf8');
  const input = { ...bound(), command: { kind: 'material.stage', payload: { action: 'put', files: [
    { slot: 'UR', content: '# Bedarf\nÄnderung 😀\n' }, { slot: 'EVIDENCE', content: '' }] } } };
  const first = store.stage(input);
  assert.equal(first.outcome, 'accepted', JSON.stringify(first));
  assert.ok(first.family_result.files.every(f => f.sealed && f.reference));
  assert.equal(first.family_result.files[0].bytes, Buffer.byteLength(input.command.payload.files[0].content));
  assert.deepEqual(store.stage(input).family_result.files, first.family_result.files, 'Exact replay retains material identities.');
  assert.equal(store.stage({ ...input, command: { kind: 'material.stage', payload: { action: 'put', files: [{ slot: 'UR', content: 'changed' }] } } }).reason, 'operation_payload_conflict');
  assert.deepEqual(validateRunCommandResult(first), []);
  assert.equal(readFileSync(path, 'utf8'), before);
}));

test('put validates every UTF-8 file before allocating, and keeps existing scope/resource guards', () => fixture(({ store, bound }) => {
  const put = files => store.stage({ ...bound(), command: { kind: 'material.stage', payload: { action: 'put', files } } });
  for (const content of ['😀'.repeat(MATERIAL_LIMITS.inline / 4 + 1), '\ud800']) {
    assert.equal(put([{ slot: 'UR', content: 'valid' }, { slot: 'EVIDENCE', content }]).reason, 'material_text_invalid');
    assert.deepEqual(store.inspectOwnership(), { sets: 0, bytes: 0 });
  }
  const stale = { ...bound(), expected_revision_id: randomUUID(), command: { kind: 'material.stage', payload: { action: 'put', files: [{ slot: 'UR', content: 'stale' }] } } };
  assert.equal(store.stage(stale).reason, 'stale_revision');
  assert.equal(put([{ slot: 'UR', content: '\u0001'.repeat(12000) }]).reason, 'command_schema_invalid', 'The 64 KiB encoded JSON request bound remains enforced.');
  assert.deepEqual(store.inspectOwnership(), { sets: 0, bytes: 0 });
  assert.equal(put([{ slot: 'UR', content: '😀'.repeat(MATERIAL_LIMITS.inline / 4) }]).outcome, 'accepted');
  assert.equal(MATERIAL_LIMITS.part, 16384, 'Multipart piece size is unchanged.');
}));

test('Core returns bound staging/recording forms and a schema-valid continuation without invented author inputs', () => fixture(({ root, path, bound }) => {
  const services = createCoreServices(), input = { ...bound(), command: { kind: 'material.stage', payload: {
    action: 'put', files: [{ slot: 'UR', content: clarifiedUr }] } } };
  try {
    const before = readFileSync(path, 'utf8'), staged = services.material.stage(input);
    assert.equal(staged.outcome, 'accepted', JSON.stringify(staged));
    const form = staged.recording_calls[0];
    assert.equal(form.state, 'requires_author_input');
    assert.deepEqual(form.required_inputs, ['/command/payload/title']);
    assert.notEqual(form.call.arguments.operation_id, input.operation_id);
    assert.equal(form.call.arguments.expected_revision_id, input.expected_revision_id);
    assert.equal(readFileSync(path, 'utf8'), before);
    form.call.arguments.command.payload.title = 'Synthetic bounded need';
    assert.deepEqual(validateRunCommand(form.call.tool, form.call.arguments), []);
    const recorded = createRunCommandService({ materialGrants: services.material.grants(form.call.arguments) })(form.call.tool, form.call.arguments);
    assert.equal(recorded.outcome, 'accepted', JSON.stringify(recorded));
    const next = recorded.next_calls[0];
    assert.equal(next.tool, 'agdf_dispatch');
    assert.equal(next.arguments.expected_revision_id, undefined);
    assert.equal(next.arguments.intake, undefined);
    assert.equal(next.arguments.continue_delivery, true);
    assert.deepEqual(schemaDiagnostics(next.arguments, SKILL_DISPATCH_FUNCTION_DEFINITION.inputSchema), []);
    assert.equal(JSON.stringify(next), JSON.stringify(continueDeliveryCall(input)));
    const replay = services.command(form.call.tool, form.call.arguments);
    assert.equal(replay.outcome, 'already_applied');
    assert.equal(replay.next_calls, undefined, 'A historical replay does not generate fresh authoring intent.');
  } finally { services.material.close(); }
}));

test('prepared forms withhold review/approval and keep each command UUID distinct', () => fixture(({ bound }) => {
  const input = bound(), material = { material_id: randomUUID(), digest: digest('authored source') };
  const record = preparedCommandCall('agdf_record', 'artefact.record', input,
    { gate: 'SD', material, recording: { available: true, update_draft: true } });
  assert.deepEqual(record.required_inputs, ['/command/payload/reviewer', '/command/payload/reviewed']);
  assert.equal(record.call.arguments.command.payload.reviewed, undefined);
  assert.equal(record.call.arguments.command.payload.update_draft, true);
  const prepare = preparedCommandCall('agdf_prepare', 'presentation.prepare', input, { gate: 'SD' });
  assert.equal(prepare.state, 'ready');
  assert.deepEqual(validateRunCommand(prepare.call.tool, prepare.call.arguments), []);
  const approval = preparedCommandCall('agdf_approve', 'approval.record', input, { gate: 'SD', presentationId: randomUUID() });
  assert.deepEqual(approval.required_inputs, ['/command/payload/response']);
  assert.equal(approval.call.arguments.command.payload.response, undefined);
  assert.deepEqual(schemaDiagnostics(approval.contract_call.arguments, CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema), []);
  assert.equal(approval.contract_call.arguments.expected_revision_id, input.expected_revision_id);
  assert.equal(new Set([input.operation_id, record.call.arguments.operation_id, prepare.call.arguments.operation_id,
    approval.call.arguments.operation_id]).size, 4);
  const staging = preparedCommandCall('agdf_record', 'material.stage', input, { gate: 'SD' });
  assert.equal(staging.content_contract.max_utf8_bytes_per_file, MATERIAL_LIMITS.inline);
  assert.deepEqual(schemaDiagnostics(staging.content_contract.larger_source_call.arguments, CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema), []);
}));

test('private material does not advertise a future-gate writer or choose between ambiguous sources', () => fixture(({ bound }) => {
  const services = createCoreServices();
  try {
    for (const files of [[{ slot: 'SD', content: 'Not the current authoring gate' }],
      [{ slot: 'UR', content: 'First candidate' }, { slot: 'UR', content: 'Second candidate' }]]) {
      const result = services.material.stage({ ...bound(), command: { kind: 'material.stage', payload: { action: 'put', files } } });
      assert.equal(result.outcome, 'accepted');
      assert.equal(result.recording_calls, undefined);
    }
  } finally { services.material.close(); }
}));

function fixture(work, { layout } = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-material-')));
  const store = createRunMaterialStore();
  try {
    execFileSync('git', ['init', '-q', root]);
    initializeCurrentControl(root, 'en');
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
  assert.equal(existsSync(join(root, '.agdf/control/runs/material/documents/UR.md')), false);
  const input = { ...bound(), command: { kind: 'step.record', payload: { step: 'ur', title: 'Exact material', source: sealed } } };
  const service = createRunCommandService({ packageVersion: '0.20.2', materialGrants: store.grants(input),
    checkpoint: phase => { if (phase === 'before_result') throw Error('lost_response'); } });
  const lost = service('agdf_record', input);
  assert.equal(lost.outcome, 'effect_unknown', JSON.stringify(lost));
  assert.equal(lost.reason, 'lost_response', JSON.stringify(lost));
  assert.equal(readFileSync(join(root, '.agdf/control/runs/material/documents/UR.md'), 'utf8'), text);
  assert.equal(runSealState(root, readFileSync(path, 'utf8')).status, 'valid');
  let cursor, sourceText = '', pages = 0;
  do {
    const page = inspectAuthoringInputs(root, { ...bound(), ...(cursor ? { cursor } : {}) });
    assert.equal(page.available, true, JSON.stringify(page));
    assert.match(page.material_transport.instructions, /report\.chunk\.content/u);
    assert.match(page.material_transport.instructions, /report\.documents is metadata only/u);
    assert.ok(page.documents.some(d => d.role === 'template' && d.source === 'version_matched_plugin'));
    if (page.chunk?.role === 'source' && page.chunk.type === 'UR') sourceText += page.chunk.content;
    // Only the first page carries the full writer contract; later pages name the same one.
    if (pages === 0) { assert.equal(page.formats.kind, 'ur_draft.replace'); assert.ok(page.formats.payload_schema && page.formats.result_schema); }
    else assert.deepEqual(page.formats, { schema_version: '1', available: true, group: 'agdf_revise', kind: 'ur_draft.replace',
      omitted: 'identical to the first page of this manifest' });
    cursor = page.next_cursor; pages++;
  } while (cursor);
  assert.ok(pages >= 2);
  const bundled = inspectAuthoringInputs(root, { ...bound(), bundle: true });
  assert.equal(bundled.available, true);
  assert.match(bundled.material_transport.instructions, /response\.structuredContent\.report/u);
  assert.match(bundled.material_transport.instructions, /report\.documents\[\]\.content/u);
  assert.equal(bundled.complete, true, 'Small source documents share one bounded page.');
  assert.ok(bundled.documents.length >= 2);
  assert.equal(bundled.documents.filter(c => c.role === 'source' && c.type === 'UR').map(c => c.content).join(''), text);
  assert.ok(Buffer.byteLength(JSON.stringify({documents:bundled.documents,fragments:bundled.fragments})) <= bundled.page_bytes_limit);
  assert.equal(bundled.formats.schema, undefined, 'No duplicate envelope/result schema in bundled authoring help.');
  assert.ok(bundled.formats.payload_schema);
  const wrongCursor = inspectAuthoringInputs(root, { ...bound(), bundle: true, cursor: `${inspectAuthoringInputs(root, bound()).manifest_digest.slice(7)}:1` });
  assert.equal(wrongCursor.reason, 'authoring_cursor_stale_or_invalid');

  assert.equal(sourceText, text, 'authoring source retrieval is complete without local file discovery');
  const revised = text + '\nAn explicitly permitted unapproved draft clarification.\n';
  const beginRevision = call({ action: 'begin', files: [{ slot: 'UR', bytes: Buffer.byteLength(revised) }] }).family_result.transfer_id;
  assert.equal(call({ action: 'append', transfer_id: beginRevision, file: 0, offset: 0, data: Buffer.from(revised).toString('base64') }).outcome, 'accepted');
  const revisedRef = call({ action: 'seal', transfer_id: beginRevision }).family_result.files[0].reference;
  const reviseInput = { ...bound(), command: { kind: 'ur_draft.replace', payload: { title: 'Exact material clarified', source: revisedRef } } };
  const revisedResult = createRunCommandService({ packageVersion: '0.20.2', materialGrants: store.grants(reviseInput) })('agdf_revise', reviseInput);
  assert.equal(revisedResult.outcome, 'accepted', JSON.stringify(revisedResult));
  assert.equal(revisedResult.receipt.kind, 'ur_draft.replace');
  assert.equal(Object.hasOwn(revisedResult.family_result, 'receipt'), false, 'the receipt is returned once, in the envelope');
  assert.equal(revisedResult.family_result.operation_id, reviseInput.operation_id, 'the family result keeps its own fields');
  assert.deepEqual(validateRunCommandResult(revisedResult), []);
  assert.equal(readFileSync(join(root, '.agdf/control/runs/material/documents/UR.md'), 'utf8'), revised);
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
  assert.equal(existsSync(join(root, '.agdf/control/runs/material/documents/UR.md')), false);
  assert.equal(call({ action: 'begin', files: [{ slot: 'UR', bytes: 131073 }] }).reason, 'command_schema_invalid');
}));

test('a rejected append names its concrete cause and keeps the stable reason', () => fixture(({ call }) => {
  const text = Buffer.from('# Evidence\nÄnderung geprüft.\n');
  const id = call({ action: 'begin', files: [{ slot: 'EVIDENCE', bytes: text.length }] }).family_result.transfer_id;
  const append = (part) => call({ action: 'append', transfer_id: id, file: 0, offset: 0, data: text.toString('base64'), ...part });
  const cases = [
    [{ data: text.toString('utf8') }, 'material_part_invalid', 'data_not_base64'],
    [{ data: text.toString('base64').replace(/=+$/u, '') }, 'material_part_invalid', 'data_not_base64'],
    [{ data: `${text.toString('base64').slice(0, 8)}\n${text.toString('base64').slice(8)}` }, 'material_part_invalid', 'data_not_base64'],
    [{ data: '' }, 'material_part_invalid', 'data_empty'],
    [{ file: 1 }, 'material_part_invalid', 'file_index_unknown'],
    [{ data: Buffer.concat([text, Buffer.from('x')]).toString('base64') }, 'material_part_invalid', 'part_exceeds_file'],
    [{ offset: 3, data: Buffer.from('x').toString('base64') }, 'material_part_offset_invalid', 'offset_not_next'],
  ];
  for (const [part, reason, code] of cases) {
    const rejected = append(part);
    assert.equal(rejected.outcome, 'rejected', code);
    assert.equal(rejected.reason, reason, code);
    assert.equal(rejected.diagnostics[0].code, code);
    assert.equal(typeof rejected.recovery, 'string');
    assert.deepEqual(validateRunCommandResult(rejected), [], code);
  }
  assert.match(append({ data: text.toString('utf8') }).recovery, /base64/u);
  assert.deepEqual(append({ data: Buffer.concat([text, Buffer.from('x')]).toString('base64') }).diagnostics[0],
    { code: 'part_exceeds_file', offset: 0, decoded_bytes: text.length + 1, declared_bytes: text.length });
  assert.deepEqual(append({ offset: 3, data: Buffer.from('x').toString('base64') }).diagnostics[0],
    { code: 'offset_not_next', offset: 3, received: 0, sealed: false });
  const incomplete = call({ action: 'seal', transfer_id: id });
  assert.equal(incomplete.reason, 'material_incomplete');
  assert.deepEqual(incomplete.diagnostics, [{ code: 'file_incomplete', files: [{ received: 0, bytes: text.length }] }]);
  assert.equal(append({}).outcome, 'accepted', 'the transfer stays usable after rejected parts');
  assert.equal(call({ action: 'seal', transfer_id: id }).family_result.files[0].sealed, true);
}));

test('the material contract states the encoding and the time bounds', () => {
  const contract = operationContract('agdf_record', 'material.stage');
  assert.equal(contract.material_transport.idle_ms, MATERIAL_LIMITS.idle);
  assert.equal(contract.material_transport.lifetime_ms, MATERIAL_LIMITS.lifetime);
  assert.equal(contract.material_transport.part_bytes, MATERIAL_LIMITS.part);
  assert.match(contract.material_transport.encoding, /base64/u);
  assert.equal(MATERIAL_LIMITS.idle, 120000, 'the existing two-minute idle protection is retained');
  assert.equal(MATERIAL_LIMITS.lifetime, 600000, 'the existing ten-minute absolute lifetime is retained');
  const data = contract.payload_schema.oneOf.find((row) => row.properties.action.const === 'append').properties.data;
  assert.equal(data.contentEncoding, 'base64');
  assert.match(data.description, /base64/u);
  const tool = commandGroupDefinition('agdf_record');
  assert.match(tool.description, /base64/u);
  assert.match(JSON.stringify(tool.inputSchema), /"contentEncoding":"base64"/u, 'the visible MCP schema keeps the encoding');
});

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
    tick = MATERIAL_LIMITS.idle + 1;
    const expired = stage({ action: 'status', transfer_id: first });
    assert.equal(expired.reason, 'material_transfer_expired');
    assert.deepEqual(expired.diagnostics, [{ code: 'transfer_expired', idle_ms: MATERIAL_LIMITS.idle, lifetime_ms: MATERIAL_LIMITS.lifetime }]);
    assert.match(expired.recovery, /begin a new transfer/u);
    assert.deepEqual(validateRunCommandResult(expired), []);
    assert.equal(clocked.inspectOwnership().sets, 0);
    const alive = stage(begin).family_result.transfer_id, created = tick, step = MATERIAL_LIMITS.idle - 60000;
    while (tick + step < created + MATERIAL_LIMITS.lifetime) { tick += step; assert.equal(stage({ action: 'status', transfer_id: alive }).outcome, 'accepted'); }
    tick += step;
    assert.equal(stage({ action: 'status', transfer_id: alive }).reason, 'material_transfer_expired', 'activity cannot extend the absolute lifetime bound');
    clocked.close(); assert.equal(stage(begin).reason, 'material_transfer_expired');
  } finally { clocked.close(); }
  assert.equal(readFileSync(path, 'utf8'), before);
  assert.equal(existsSync(join(root, '.agdf/control/runs/material/documents/UR.md')), false);
}));

// Recovery accepts only the sole current journal. Unsupported or redundant
// outputs remain untouched, even after the Run rename was committed.
for (const corrupt of [journal => journal.input_resolution.record_version = 6, journal => journal.backlog = { old: 'old', next: 'new' }]) {
  test('unsupported journal shape cannot publish foreign legacy output', t => {
    const f = currentFixture(t), run = currentRun(f);
    assert.equal(run.step('ur', '# UR\n\n## Goal\nKeep exact current material.\n', { title: 'Current material' }).outcome, 'accepted');
    const failed = currentFixture(t, { root: f.root, initialize: false, checkpoint(point) { if (point === 'run') throw Error('current_journal_interruption'); } });
    const input = failed.request('ur_draft.replace', { title: 'Current material replacement', source: failed.material(run.binding(), 'UR', '# UR\n\n## Goal\nKeep current replacement exact.\n') }, run.binding());
    assert.equal(failed.execute(input).outcome, 'effect_unknown');
    const path = pendingRunStepPath(f.root, run.id), journal = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(journal.input_resolution.record_version, 7); corrupt(journal); writeFileSync(path, JSON.stringify(journal));
    const before = readFileSync(path), state = run.content();
    const result = createRunCommandService()('agdf_revise', { ...input, expected_revision_id: run.binding().expected_revision_id,
      command: { kind: 'operation.recover', payload: { original_kind: 'ur_draft.replace', pending_digest: digest(canonicalJson(journal)), recovery_revision_id: run.binding().expected_revision_id } } });
    assert.notEqual(result.outcome, 'accepted'); assert.deepEqual(readFileSync(path), before); assert.equal(run.content(), state);
    assert.equal(existsSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md')), false);
  });
}

test('UX staging validation mirrors only the explicit canonical author declaration', () => fixture(({ bound }) => {
  const form = preparedCommandCall('agdf_record', 'step.record', bound(), { gate: 'UX Intent Definition', material: { material_id: randomUUID(), digest: digest('report') } });
  for (const content of ['# report\nDecision: ready\n', '- decision: ready\n- decision: blocked\n', '- decision: invented\n', '- decision: not_applicable\n']) {
    const checked = withUxSourceDecision(form, content);
    assert.equal(checked.form, undefined);assert.equal(checked.source_validation.recordable, false);
  }
  for (const decision of ['ready', 'blocked']) {
    const checked = withUxSourceDecision(form, `# report\n- decision: ${decision}\n`);
    assert.equal(checked.form.call.arguments.command.payload.decision, decision);
    assert.ok(!checked.form.required_inputs.includes('/command/payload/decision'));
    assert.equal(form.call.arguments.command.payload.decision, undefined);
    assert.equal(checked.source_validation.recordable, true);
  }
}));

test('bundled authoring bounds encoded JSON pages and reconstructs exact escaped UTF-8 sources', () => fixture(({ root, bound, store, call }) => {
  const text = clarifiedUr + '\n' + ('\u0001'.repeat(22000) + '😀'.repeat(1000) + '\n'), bytes = Buffer.from(text);
  const start = call({ action: 'begin', files: [{ slot: 'UR', bytes: bytes.length }] });
  assert.equal(start.outcome, 'accepted');
  for (let offset = 0; offset < bytes.length; offset += MATERIAL_LIMITS.part)
    assert.equal(call({ action: 'append', transfer_id: start.family_result.transfer_id, file: 0, offset, data: bytes.subarray(offset, offset + MATERIAL_LIMITS.part).toString('base64') }).outcome, 'accepted');
  const source = call({ action: 'seal', transfer_id: start.family_result.transfer_id }).family_result.files[0].reference;
  const input = { ...bound(), command: { kind: 'step.record', payload: { step: 'ur', title: 'Synthetic escaped source', source } } };
  assert.equal(createRunCommandService({ materialGrants: store.grants(input) })('agdf_record', input).outcome, 'accepted');
  let cursor, recovered = '', pages = 0;
  do {
    const report = inspectAuthoringInputs(root, { ...bound(), bundle: true, ...(cursor ? { cursor } : {}) });
    assert.equal(report.available, true, JSON.stringify(report));
    assert.ok(report.documents.every(d=>d.complete&&typeof d.content==='string'));
    assert.ok(report.fragments.every(d=>!d.complete&&typeof d.content==='string'));
    assert.ok(report.document_manifest.every(d=>d.content===undefined));
    assert.ok(Buffer.byteLength(JSON.stringify({documents:report.documents,fragments:report.fragments})) <= 49152);
    for (const chunk of [...report.documents,...report.fragments]) if (chunk.role === 'source' && chunk.type === 'UR') recovered += chunk.content;
    cursor = report.next_cursor;pages++;
  } while (cursor);
  assert.ok(pages > 1);assert.equal(recovered, text);
}));

test('an already bound incomplete UR is corrected directly with the current writer, without another intake', () => fixture(({ root, bound }) => {
  const services = createCoreServices();
  const stage = content => services.material.stage({ ...bound(), presentation_language: 'de', command: { kind: 'material.stage', payload: { action: 'put', files: [{ slot: 'UR', content }] } } });
  const record = staged => { const form = staged.recording_calls[0];form.call.arguments.command.payload.title = 'Synthetic clarification';return createRunCommandService({ materialGrants: services.material.grants(form.call.arguments) })(form.call.tool, form.call.arguments); };
  const dispatch = () => services.dispatch({ skillId: 'gate-check', runId: 'material', continueDelivery: true, surface: 'codex', presentationLanguage: 'de', workingDirectory: root, primaryTarget: root, targetSource: 'explicit_target', expectedVersion: services.resources.pluginDefinition.version, interactionLocales: services.resources.interactionLocales });
  try {
    assert.equal(record(stage(clarifiedUr)).outcome, 'accepted');
    const unready=dispatch();assert.equal(unready.continuation?.phase,'ur_definition',JSON.stringify(unready));assert.equal(unready.continuation.draft_registered,true);
    const authoring=inspectAuthoringInputs(root,{...bound(),presentation_language:'de',bundle:true});
    assert.equal(authoring.formats.kind,'ur_draft.replace');assert.ok(authoring.formats.authoring_format.sections.includes('Goal'));
    assert.deepEqual(authoring.approval_summary_format.required_fields,['- Ziel:']);
    const replacement=clarifiedUr+'\n## '+authoring.approval_summary_format.heading+'\n\n- Ziel: Ein Operator kann den freigegebenen Bedarf eindeutig prüfen und die nächste Planungsphase bewusst freigeben.\n';
    assert.equal(record(stage(replacement)).outcome,'accepted');
    const ready=dispatch();assert.equal(ready.continuation?.phase,'presentation_required',JSON.stringify(ready));
  } finally {services.material.close();}
}));
