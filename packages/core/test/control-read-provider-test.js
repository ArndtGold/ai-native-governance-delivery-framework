import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { captureControl } from '../lib/control-read/snapshot.js';
import { withControlReadView, readFileSync, existsSync, memoizeControlRead } from '../lib/control-read/fs.js';
import { fixture } from './control-cockpit-fixtures.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { evaluateQaFollowUp } from '../lib/control-evaluation/qa-follow-up.js';
import { readRunState } from '../lib/control-evaluation/run-state.js';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';
import { withOwnedFileLock } from '../lib/control-state/run-state-writer.js';

test('SCN-034/035: another presentation lock does not invalidate an unchanged document capture', () => {
  for (const lockedRun of ['fixture-a', 'fixture-completed']) {
    const f = fixture();
    try {
      let inject = false, applied = false;
      const reader = createCockpitReader(f.root, { checkpoint(stage) {
        if (stage === 'captured' && inject && !applied) {
          applied = true;
          withOwnedFileLock(join(f.root, '.agdf/control/runs', lockedRun, 'RUN_STATE.md'), () => {});
        }
      } });
      const before = fs.readFileSync(f.runPath, 'utf8');
      const snapshot = reader.snapshot('fixture-a'); assert.equal(snapshot.state, 'available');
      const resource = snapshot.data.run.resources.find(row => row.type === 'UR'); assert.ok(resource);
      inject = true;
      const document = reader.document(resource.resource_id, snapshot.snapshot_id, 'fixture-a');
      assert.ok(applied); assert.equal(document.state, 'available', JSON.stringify(document));
      assert.equal(document.data.document.content, fs.readFileSync(join(f.root, f.documentPath), 'utf8'));
      assert.equal(fs.readFileSync(f.runPath, 'utf8'), before);
      fs.writeFileSync(join(f.root, f.documentPath), 'real source change');
      assert.throws(() => reader.freshness(document.snapshot_id), /source_changed/);
    } finally { f.close(); }
  }
});
test('SCN-019: async contexts isolate two targets and restore live behavior', async () => {
  const a = fixture(), b = fixture(); try {
    fs.writeFileSync(join(b.root, b.documentPath), 'target b'); const av = captureControl(a.root), bv = captureControl(b.root);
    fs.writeFileSync(join(a.root, a.documentPath), 'live edited');
    const values = await Promise.all([withControlReadView(av, async () => { await Promise.resolve(); return readFileSync(join(a.root, a.documentPath), 'utf8'); }), withControlReadView(bv, async () => { await Promise.resolve(); return readFileSync(join(b.root, b.documentPath), 'utf8'); })]);
    assert.match(values[0], /Fixture document/); assert.equal(values[1], 'target b'); assert.equal(readFileSync(join(a.root, a.documentPath), 'utf8'), 'live edited');
    assert.throws(() => withControlReadView(av, () => { try { existsSync(join(a.root, 'secret')); } catch {} return 'caught'; }), /resource_denied/, 'a swallowed boundary exception must still invalidate evaluation');
    assert.throws(() => withControlReadView(av, () => { try { existsSync(join(a.root, 'secret')); } catch {} return 'caught'; }), /resource_denied/, 'denied observations cannot be memoized into a later successful scope');
    for (let attempt = 0; attempt < 2; attempt++) assert.throws(() => withControlReadView(av, () => memoizeControlRead('denied-observation', () => { try { existsSync(join(a.root, 'secret')); } catch {} return 'caught'; })), /resource_denied/);
    assert.throws(() => withControlReadView(av, () => { throw Error('exit'); }), /exit/); assert.equal(readFileSync(join(a.root, a.documentPath), 'utf8'), 'live edited');
  } finally { a.close(); b.close(); }
});
test('SCN-004: captured evaluator, original target and live-default parity', () => {
  const f = fixture(); try {
    const expected = evaluateGateCheck(f.root, { runId: 'fixture-a', ignoreRunIdEnv: true, presentationLanguage: 'de' });
    const view = captureControl(f.root); const actual = withControlReadView(view, () => evaluateGateCheck(f.root, { runId: 'fixture-a', ignoreRunIdEnv: true, presentationLanguage: 'de' }));
    for (const key of ['status', 'current_gate', 'blocking_reason', 'missing_approval', 'allowed', 'forbidden', 'next_allowed_action', 'doctor_status', 'doctor_summary']) assert.deepEqual(actual[key], expected[key], key);
    assert.deepEqual(withControlReadView(view, () => resolveControlCommandTarget(f.root)), resolveControlCommandTarget(f.root));
    const before = withControlReadView(view, () => readRunState(f.root, { runId: 'fixture-a', ignoreRunIdEnv: true }));
    fs.writeFileSync(join(f.root, f.documentPath), 'external change during evaluation');
    const captured = withControlReadView(view, () => evaluateGateCheck(f.root, { runId: 'fixture-a', ignoreRunIdEnv: true, presentationLanguage: 'de' }));
    for (const key of ['status', 'current_gate', 'blocking_reason', 'doctor_status']) assert.deepEqual(captured[key], actual[key]);
    const after = withControlReadView(view, () => readRunState(f.root, { runId: 'fixture-a', ignoreRunIdEnv: true }));
    assert.deepEqual([...after.approvals], [...before.approvals]); assert.throws(() => view.revalidate(), /source_changed/);
  } finally { f.close(); }
});

test('QA follow-up reads trusted contract resources without widening captured control scope', () => {
  const f = fixture(); try {
    const prefix = '.agdf/control/artefacts/fixture-a/';
    const qa = join(f.root, prefix, 'QA_REPORT.md');
    fs.writeFileSync(qa, '- decision: revise\n\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n| F-01 | implementation_gap | CD+Tests | open | Approved assertion fails | Correct the approved implementation and refresh evidence |\n');
    fs.writeFileSync(join(f.root,prefix,'CR.md'), '- decision: pass\n');
    const state = { approvals:new Map(['UR','PRD','SD','TP'].map(g=>[g,{status:'approved'}])), artefacts:new Map(['UR','PRD','SD','TP'].map(g=>[g,{status:'approved',path:prefix+g+'.md'}])) };
    for(const step of ['Brownfield Analysis','CD+Tests','CR'])state.artefacts.set(step,{status:'done',path:step==='CR'?prefix+'CR.md':''});
    state.artefacts.set('QA',{status:'revise',path:prefix+'QA_REPORT.md'});
    const expected = evaluateQaFollowUp(f.root,state,'fixture-a');
    assert.equal(expected.kind,'implementation');
    const view = captureControl(f.root);
    assert.deepEqual(withControlReadView(view,()=>evaluateQaFollowUp(f.root,state,'fixture-a')),expected);
    fs.writeFileSync(qa, '- decision: pass\n');
    assert.deepEqual(withControlReadView(view,()=>evaluateQaFollowUp(f.root,state,'fixture-a')),expected,'captured report bytes remain authoritative');
    assert.equal(evaluateQaFollowUp(f.root,state,'fixture-a').kind,'blocked','live contradictory QA decision cannot continue');
    assert.throws(()=>withControlReadView(view,()=>readFileSync(join(f.root,'secret'),'utf8')),/resource_denied/,'trusted contract access must not widen data reads');
  } finally {f.close();}
});
