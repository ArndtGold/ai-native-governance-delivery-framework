import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCockpitSessionService } from '../lib/control-inspect/cockpit-session.js';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';
import { parseCockpitArguments, COCKPIT_LIMITS, COCKPIT_RENDER_DEFINITION } from '../lib/control-inspect/cockpit-contract.js';
import { fixture, treeBytes } from './control-cockpit-fixtures.js';

test('SCN-011/013/020/022/025: production worker packet operations bind inspected source and expire with their session', async () => {
  const f = fixture(), before = treeBytes(f.root), service = createCockpitSessionService(f.root);
  try {
    const session = (await service.render())._meta.agdf_cockpit.session_id;
    const call = input => service.read({ session_id: session, ...input });
    const snapshot = await call({ operation: 'snapshot' });
    const detail = await call({ operation: 'run', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a' });
    const resource = detail.data.resources.find(r => r.type === 'UR');
    const selectors = { snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a', revision_id: detail.data.revision_id,
      resource_id: resource.resource_id, graph_ids: [], excluded_ids: [], generation: 1 };
    assert.equal((await call({ operation: 'prepare_context', ...selectors })).code, 'resource_denied');
    const document = await call({ operation: 'document', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a', resource_id: resource.resource_id });
    assert.equal((await call({ operation: 'context', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a' })).state, 'empty');
    assert.equal((await call({ operation: 'prepare_context', ...selectors, content: 'forged' })).code, 'resource_denied');
    assert.equal((await call({ operation: 'prepare_context', ...selectors, run_id: 'fixture-completed' })).code, 'resource_denied');
    const prepared = await call({ operation: 'prepare_context', ...selectors });
    assert.equal(prepared.state, 'available'); assert.deepEqual(prepared.data.packet.artefact, document.data);
    const packet = prepared.data.packet, validate = { operation: 'validate_context', context_id: packet.context_id, generation: packet.generation };
    assert.equal((await call(validate)).data.current, true);
    assert.equal((await call({ operation: 'invalidate_context' })).data.invalidated, true);
    assert.equal((await call(validate)).code, 'context_superseded');
    const newer = await call({ operation: 'prepare_context', ...selectors, generation: 2 });
    await service.render();
    assert.equal((await call({ ...validate, context_id: newer.data.packet.context_id, generation: 2 })).code, 'session_expired');
    assert.deepEqual(treeBytes(f.root), before);
  } finally { await service.close(); f.close(); }
});

test('SCN-003/026/027: shared production worker reads same immutable source, no write and cross-run document denial', async () => {
  const f = fixture(), before = treeBytes(f.root), service = createCockpitSessionService(f.root);
  try {
    const session = (await service.render())._meta.agdf_cockpit.session_id;
    const call = input => service.read({ session_id: session, ...input });
    const snapshot = await call({ operation: 'snapshot' });
    const direct = createCockpitReader(f.root).snapshot();
    assert.deepEqual(snapshot.data.runs, direct.data.runs);
    const detail = await call({ operation: 'run', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a' });
    const resource = detail.data.resources.find(r => r.type === 'UR');
    const args = { operation: 'document', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a', resource_id: resource.resource_id };
    const document = await call(args); assert.match(document.data.content, /Fixture document/); assert.equal(document.authorizes, false);
    assert.equal((await call({ ...args, run_id: 'fixture-completed' })).code, 'resource_denied');
    assert.deepEqual(treeBytes(f.root), before);
  } finally { await service.close(); f.close(); }
});
test('SCN-022/036: render supersedes session, strict selectors and close release its worker', async () => {
  const f = fixture(); let closed = 0;
  const service = createCockpitSessionService(f.root, { poolFactory: () => ({ close: async () => { closed += 1; }, request: async () => ({ data: null }) }) });
  try {
    const first = (await service.render())._meta.agdf_cockpit.session_id;
    const second = (await service.render())._meta.agdf_cockpit.session_id;
    assert.equal(closed, 1);
    const expired = await service.read({ operation: 'snapshot', session_id: first });
    assert.equal(expired.code, 'session_expired'); assert.equal(expired.retryable, false);
    assert.equal((await service.read({ operation: 'snapshot', session_id: second, path: '/tmp' })).code, 'resource_denied');
    await service.read({ operation: 'close', session_id: second }); assert.equal(closed, 2);
    assert.equal((await service.read({ operation: 'snapshot', session_id: second })).code, 'session_expired');
  } finally { await service.close(); f.close(); }
});
test('SCN-022: fake clock proves idle and absolute session expiry without prolonged waits', async () => {
  const f = fixture(); let time = 0, closed = 0;
  const service = createCockpitSessionService(f.root, { now: () => time, poolFactory: () => ({ close: async () => { closed += 1; }, request: async () => ({ data: null }) }) });
  try {
    const a = (await service.render())._meta.agdf_cockpit.session_id;
    time = COCKPIT_LIMITS.idle;
    assert.equal((await service.read({ operation: 'snapshot', session_id: a })).code, 'session_expired');
    const b = (await service.render())._meta.agdf_cockpit.session_id;
    for (let elapsed = 10 * 60_000; elapsed < COCKPIT_LIMITS.lifetime; elapsed += 10 * 60_000) {
      time = COCKPIT_LIMITS.idle + elapsed;
      assert.equal((await service.read({ operation: 'snapshot', session_id: b })).code, undefined);
    }
    time = COCKPIT_LIMITS.idle + COCKPIT_LIMITS.lifetime;
    assert.equal((await service.read({ operation: 'snapshot', session_id: b })).code, 'session_expired'); assert.equal(closed, 2);
  } finally { await service.close(); f.close(); }
});
test('SCN-036: shared wire parser rejects extra fields, unknown/malformed selectors and forged target inputs', () => {
  const session_id = '00000000-0000-4000-8000-000000000001';
  assert.deepEqual(parseCockpitArguments({}, true), {});
  for (const value of [{}, { operation: 'approve', session_id }, { operation: 'snapshot', session_id, target: '/tmp' },
    { operation: 'snapshot', session_id: 'forged' }, { operation: 'run', session_id, snapshot_id: session_id, run_id: '../foreign' }]) {
    assert.throws(() => parseCockpitArguments(value), /resource_denied/);
  }
  assert.throws(() => parseCockpitArguments({ approval: 'TP' }, true), /resource_denied/);
  assert.deepEqual(parseCockpitArguments({ operation: 'snapshot', session_id }), { operation: 'snapshot', session_id });
});
test('SCN-039/041: optional render ID uses the same bounded strict Run schema, preserving empty overview', () => {
  assert.deepEqual(COCKPIT_RENDER_DEFINITION.inputSchema.properties.run_id,
    { type: 'string', pattern: '^[A-Za-z0-9_-]{1,128}$' });
  assert.deepEqual(parseCockpitArguments({ run_id: 'fixture-a' }, true), { run_id: 'fixture-a' });
  assert.deepEqual(parseCockpitArguments({ run_id: 'a'.repeat(128) }, true), { run_id: 'a'.repeat(128) });
  for (const value of [{ run_id: '' }, { run_id: undefined }, { run_id: 12 }, { run_id: '../foreign' },
    { run_id: 'ünicode' }, { run_id: 'a'.repeat(129) }, { run_id: 'fixture-a', path: '/tmp' },
    { run_id: 'fixture-a', approval: 'TP' }, { run_id: 'https://external.invalid' }]) {
    assert.throws(() => parseCockpitArguments(value, true), /resource_denied/);
  }
});
test('SCN-039/042/046: render carries requested focus without eager capture; ordinary checked reads remain scoped and no-write', async () => {
  const f = fixture(), before = treeBytes(f.root), requests = [];
  const reader = createCockpitReader(f.root);
  const service = createCockpitSessionService(f.root, { poolFactory: () => ({ close: async () => {}, request: async input => {
    requests.push(input.operation);
    return input.operation === 'snapshot' ? reader.snapshot() : reader.run(input.selector, input.snapshot);
  } }) });
  try {
    const opened = await service.render({ run_id: 'fixture-a' });
    assert.equal(opened._meta.agdf_cockpit.initial_run_id, 'fixture-a');
    assert.equal(opened._meta.agdf_cockpit.render_generation, 1);
    assert.equal(opened.authorizes, false); assert.equal(opened.snapshot_id, undefined); assert.deepEqual(requests, []);
    const session_id = opened._meta.agdf_cockpit.session_id;
    const snapshot = await service.read({ operation: 'snapshot', session_id });
    assert.ok(snapshot.data.runs.some(r => r.run_id === 'fixture-a'));
    const detail = await service.read({ operation: 'run', session_id, snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a' });
    assert.equal(detail.data.run_id, 'fixture-a'); assert.deepEqual(requests, ['snapshot', 'run']);
    const unknown = await service.render({ run_id: 'unknown-run' });
    assert.equal(unknown._meta.agdf_cockpit.initial_run_id, 'unknown-run');
    assert.equal(unknown._meta.agdf_cockpit.render_generation, 2);
    assert.equal((await service.read({ operation: 'snapshot', session_id })).code, 'session_expired');
    const empty = await service.render(); assert.equal(empty._meta.agdf_cockpit.initial_run_id, undefined);
    await assert.rejects(service.render({ run_id: 'bad/path' }), /resource_denied/);
    assert.deepEqual(treeBytes(f.root), before);
  } finally { await service.close(); f.close(); }
});
test('SCN-022: concurrent renders retain one session and closing during a pending render cannot reopen it', async () => {
  const f = fixture(); let created = 0;
  const service = createCockpitSessionService(f.root, { poolFactory: () => { created += 1; return { close: async () => {}, request: async () => ({ data: null }) }; } });
  try {
    const first = service.render(), second = service.render();
    assert.equal((await first).code, 'session_expired');
    assert.ok((await second)._meta.agdf_cockpit.session_id); assert.equal(created, 1);
    const pending = service.render(); await service.close();
    assert.equal((await pending).code, 'session_expired'); assert.equal(created, 1);
  } finally { await service.close(); f.close(); }
});
