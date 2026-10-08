import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { captureControl } from '../lib/control-read/snapshot.js';
import { withControlReadView, readFileSync, existsSync, memoizeControlRead } from '../lib/control-read/fs.js';
import { fixture } from './control-cockpit-fixtures.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { readRunState } from '../lib/control-evaluation/run-state.js';
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
