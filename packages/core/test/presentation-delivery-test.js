import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createSdDefinitionTestRun, syntheticSd } from '../../cli/scripts/fixtures/sd-definition.js';
import { createCoreServices } from '../lib/index.js';
import { createDecisionSessionService } from '../lib/control-inspect/decision-session.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { validateRunCommandResult } from '../lib/control-state/run-command-contract.js';
import { createPresentationDelivery } from '../lib/control-state/presentation-delivery.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-primary-delivery-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const f = createSdDefinitionTestRun(root, cli, 'primary', process.env, { typedApprovals: true });
  writeFileSync(f.file('SD.md'), syntheticSd()); assert.equal(f.recordSd().value.outcome, 'recorded');
  const before = readFileSync(f.state, 'utf8'), command = createCoreServices().command;
  const prepare = () => {
    const input = { schema_version: '1', presentation_language: 'de', working_directory: root, primary_target: root,
      target_source: 'explicit_target', target_id: resolveControlCommandTarget(root).target_id, run_id: f.runId,
      expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local',
      command: { kind: 'presentation.prepare', payload: { gate: 'SD' } } };
    const result = command('agdf_prepare', input); assert.equal(result.outcome, 'accepted', JSON.stringify(result));
    const deliver = route => ({ ...input, operation_id: randomUUID(), command: { kind: 'presentation.deliver',
      payload: { gate: 'SD', presentation_id: result.family_result.presentation_id, route } } });
    return { input, result, deliver };
  };
  const hostA = { surface: randomUUID() }, hostB = { surface: randomUUID() };
  const ordinary = createDecisionSessionService(), ordinaryPrepared = prepare();
  ordinary.remember(ordinaryPrepared.input, ordinaryPrepared.result);
  const plain = await ordinary.deliver(ordinaryPrepared.deliver('markdown'));
  assert.equal(plain.presentation_delivery.mode, 'full_markdown');
  assert.equal(plain.presentation_delivery.text, ordinaryPrepared.result.family_result.text);
  assert.equal(ordinary.inspectOwnership().views, 0, 'ordinary delivery never allocates an App view');
  await ordinary.close();
  const confirm = (service, view, host) => service.read({ operation: 'decision_display', session_id: view.read_session_id,
    owner_epoch: view.owner_epoch, nonce: view.display_nonce, surface_id: host.surface, document_digest: view.document_digest, visible: true }, undefined, host);
  for (const support of ['absent', 'foreign', 'confirmed']) {
    const p = prepare(), service = createDecisionSessionService({ surfaceBinding: host => support === 'absent' ? null : host.surface ?? null });
    try {
      const view = (await service.open(p.input, p.result, hostA))._meta.agdf_decision;
      assert.equal(view.summary, p.result.family_result.text); assert.equal(view.delivery_state, 'preview'); assert.deepEqual(view.enabled_actions, []);
      assert.equal((await confirm(service, view, hostB)).reason, 'decision_display_unconfirmed');
      if (support !== 'absent') assert.equal((await confirm(service, view, hostA)).state, 'available');
      const input = p.deliver('automatic'), delivered = await service.deliver(input, support === 'foreign' ? hostB : hostA);
      assert.deepEqual(validateRunCommandResult(delivered), [], JSON.stringify(delivered));
      assert.equal(delivered.presentation_delivery.mode, support === 'confirmed' ? 'ui_primary' : 'full_markdown');
      assert.equal(delivered.presentation_delivery.text, support === 'confirmed' ? p.result.family_result.companion_text : p.result.family_result.text);
      const replay = await service.deliver(input, hostA); assert.equal(replay.presentation_delivery.text, ''); assert.equal(replay.historical_effect, true);
      if (support === 'confirmed') {
        const state = await service.read({ operation: 'decision_state', session_id: view.read_session_id }, undefined, hostA);
        assert.equal(state.data.delivery_state, 'ui_primary'); assert.deepEqual(state.data.enabled_actions, []);
        assert.equal((await service.action({ session_id: view.session_id, operation_id: randomUUID(), presentation_id: view.binding.presentation_id,
          expected_revision_id: view.binding.expected_revision_id, action: 'approve' }, hostA)).reason, 'app_only_mediation_not_qualified');
        const fallback = await service.deliver(p.deliver('fallback'), hostA);
        assert.equal(fallback.presentation_delivery.mode, 'full_markdown'); assert.equal(fallback.presentation_delivery.text, p.result.family_result.text);
      }
      assert.equal((await confirm(service, view, hostA)).reason, 'session_expired', 'late display cannot restore a retired primary');
      assert.equal(readFileSync(f.state, 'utf8'), before, 'display/delivery/replay never decide a gate');
    } finally { await service.close(); }
  }
  const replacing = createDecisionSessionService({ surfaceBinding: host => host.surface });
  try {
    const older = prepare(), newer = prepare();
    const oldView = (await replacing.open(older.input, older.result, hostA))._meta.agdf_decision;
    await confirm(replacing, oldView, hostA);
    assert.equal((await replacing.deliver(older.deliver('automatic'), hostA)).presentation_delivery.mode,'ui_primary');
    const freshView = (await replacing.open(newer.input, newer.result, hostA))._meta.agdf_decision;
    const fresh = await replacing.deliver(newer.deliver('markdown'), hostA);
    assert.equal(fresh.presentation_delivery.mode,'full_markdown');
    for (const view of [oldView,freshView]) assert.equal((await replacing.read({operation:'decision_state',session_id:view.read_session_id},undefined,hostA)).reason,'session_expired',
      'new Markdown must retire the earlier primary even when it belongs to a different prepared ID');
  } finally { await replacing.close(); }
  const changing = createDecisionSessionService({ surfaceBinding: host => host.surface });
  const unchangedSd = readFileSync(f.file('SD.md'));
  try {
    const prepared = prepare(), view = (await changing.open(prepared.input, prepared.result, hostA))._meta.agdf_decision;
    await confirm(changing, view, hostA);
    writeFileSync(f.file('SD.md'), `${unchangedSd}\nA changed decision source must invalidate delivery.\n`);
    const stale = await changing.deliver(prepared.deliver('automatic'), hostA);
    assert.equal(stale.reason, 'presentation_binding_changed', 'unrecorded source edits invalidate the prepared decision before either primary route');
    assert.equal(stale.presentation_delivery, undefined, 'a stale decision must not be emitted as Markdown fallback');
    assert.equal((await changing.read({ operation: 'decision_state', session_id: view.read_session_id }, undefined, hostA)).reason,
      'session_expired', 'the stale preview loses its primary/action authority before rejection');
  } finally { writeFileSync(f.file('SD.md'), unchangedSd); await changing.close(); }
  const serial = createPresentationDelivery(), waiting = prepare(), competing = prepare();
  serial.remember(waiting.input,waiting.result); serial.remember(competing.input,competing.result);
  let finishRetirement;
  const retirement = new Promise(resolve => { finishRetirement=resolve; });
  serial.prepared({...waiting.input,operation_id:waiting.result.family_result.presentation_id}).view={retire:()=>retirement};
  const firstDelivery=serial.deliver(competing.deliver('markdown'));
  assert.equal((await serial.deliver(waiting.deliver('markdown'))).reason,'busy', 'different prepared IDs cannot select two primary deliveries concurrently for one Run');
  finishRetirement();
  assert.equal((await firstDelivery).presentation_delivery.mode,'full_markdown'); serial.close();
  let ticks = 0;
  const retained = createPresentationDelivery({ now: () => ticks }), actual = prepare();
  // Synthetic bookkeeping records exercise capacity; they are never delivered
  // as forged Core presentations or interpreted as human decisions.
  for(let i=0;i<64;i++) retained.remember(actual.input,{...actual.result,family_result:{...actual.result.family_result,presentation_id:randomUUID()}});
  retained.remember(actual.input,actual.result);
  assert.equal(retained.prepared({...actual.input,operation_id:actual.result.family_result.presentation_id}),null);
  ticks=31*60_000;
  retained.remember(actual.input,actual.result);
  assert.ok(retained.prepared({...actual.input,operation_id:actual.result.family_result.presentation_id}), 'expired delivery records must release their bounded capacity');
  retained.close();
  assert.equal(readFileSync(f.state,'utf8'),before);
  console.log('Exact Markdown, private display, unqualified actions, monotonic replay, cross-presentation retirement and expiry capacity passed; private host fixtures are not native qualification.');
} finally { rmSync(root, { recursive: true, force: true }); }
