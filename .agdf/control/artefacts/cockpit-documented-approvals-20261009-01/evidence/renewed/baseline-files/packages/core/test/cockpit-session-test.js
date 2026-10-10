import * as fs from 'node:fs';
import { join } from 'node:path';
import { ReadWorkerPool } from '../lib/control-read/cockpit-pool.js';
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
    const snapshot = await call({ operation: 'snapshot', run_id: 'fixture-a' });
    const detail = snapshot.data.run;
    const resource = detail.resources.find(r => r.type === 'UR');
    const unchecked = { snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a', revision_id: detail.revision_id,
      resource_id: resource.resource_id, graph_ids: [], excluded_ids: [], generation: 1 };
    assert.equal((await call({ operation: 'prepare_context', ...unchecked })).code, 'resource_denied');
    const document = await call({ operation: 'document', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a', resource_id: resource.resource_id });
    const context = await call({ operation: 'context', snapshot_id: document.snapshot_id, run_id: 'fixture-a' });
    assert.equal(context.state, 'empty'); assert.equal(context.data.kind, 'context');
    assert.notEqual(document.snapshot_id, snapshot.snapshot_id); assert.notEqual(context.snapshot_id, document.snapshot_id);
    const selectors = { ...unchecked, snapshot_id: context.snapshot_id, revision_id: context.data.run.revision_id,
      resource_id: context.data.document.resource.resource_id };
    assert.equal((await call({ operation: 'prepare_context', ...selectors, content: 'forged' })).code, 'resource_denied');
    assert.equal((await call({ operation: 'prepare_context', ...selectors, run_id: 'fixture-completed' })).code, 'resource_denied');
    const prepared = await call({ operation: 'prepare_context', ...selectors });
    assert.equal(prepared.state, 'available'); assert.equal(prepared.data.packet.artefact.content, document.data.document.content);
    assert.deepEqual(prepared.data.packet.artefact, context.data.document);
    const packet = prepared.data.packet, validate = { operation: 'validate_context', context_id: packet.context_id, generation: packet.generation };
    assert.equal((await call(validate)).data.current, true);
    const release = await call({ operation: 'invalidate_context' });
    assert.equal(release.data.invalidated, true); assert.equal(release.data.host_publication_required, true);
    assert.equal((await call(validate)).code, 'context_superseded');
    assert.equal((await call({ operation: 'prepare_context', ...selectors, generation: 2 })).code, 'busy');
    assert.equal((await call({ operation: 'complete_context_invalidation', invalidation_id: release.data.invalidation_id })).data.completed, true);
    const newer = await call({ operation: 'prepare_context', ...selectors, generation: 2 });
    await service.render();
    assert.equal((await call({ ...validate, context_id: newer.data.packet.context_id, generation: 2 })).data.current, true);
    await call({ operation: 'close' });
    assert.equal((await call(validate)).code, 'session_expired');
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
    assert.deepEqual(snapshot.data, direct.data);
    const detail = await call({ operation: 'run', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a' });
    const resource = detail.data.run.resources.find(r => r.type === 'UR');
    const args = { operation: 'document', snapshot_id: detail.snapshot_id, run_id: 'fixture-a', resource_id: resource.resource_id };
    assert.equal((await call({ ...args, run_id: 'fixture-completed' })).code, 'resource_denied');
    assert.equal((await call({ operation: 'freshness', snapshot_id: detail.snapshot_id })).data.unchanged, true);
    const document = await call(args); assert.match(document.data.document.content, /Fixture document/); assert.equal(document.authorizes, false);
    assert.equal((await call({ ...args, run_id: 'fixture-completed' })).code, 'resource_denied');
    assert.deepEqual(treeBytes(f.root), before);
  } finally { await service.close(); f.close(); }
});
test('SCN-022/036/047: render retains independent sessions; strict selectors and scoped close release only one worker', async () => {
  const f = fixture(); let closed = 0;
  const service = createCockpitSessionService(f.root, { poolFactory: () => ({ close: async () => { closed += 1; }, request: async () => ({ data: null }) }) });
  try {
    const first = (await service.render())._meta.agdf_cockpit.session_id;
    const second = (await service.render())._meta.agdf_cockpit.session_id;
    assert.equal(closed, 0);
    assert.equal((await service.read({ operation: 'snapshot', session_id: first })).code, undefined);
    assert.equal((await service.read({ operation: 'snapshot', session_id: second, path: '/tmp' })).code, 'resource_denied');
    await service.read({ operation: 'close', session_id: second }); assert.equal(closed, 1);
    assert.equal((await service.read({ operation: 'snapshot', session_id: first })).code, undefined);
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
    return input.operation === 'snapshot' ? reader.snapshot(input.input.run_id) : reader.run(input.selector, input.snapshot);
  } }) });
  try {
    const opened = await service.render({ run_id: 'fixture-a' });
    assert.equal(opened._meta.agdf_cockpit.initial_run_id, 'fixture-a');
    assert.equal(opened._meta.agdf_cockpit.render_generation, 1);
    assert.equal(opened.authorizes, false); assert.equal(opened.snapshot_id, undefined); assert.deepEqual(requests, []);
    const session_id = opened._meta.agdf_cockpit.session_id;
    const snapshot = await service.read({ operation: 'snapshot', session_id, run_id: 'fixture-a' });
    assert.equal(snapshot.data.kind, 'run'); assert.equal(snapshot.data.run.run_id, 'fixture-a');
    assert.deepEqual(requests, ['snapshot']);
    const unknown = await service.render({ run_id: 'unknown-run' });
    assert.equal(unknown._meta.agdf_cockpit.initial_run_id, 'unknown-run');
    assert.equal(unknown._meta.agdf_cockpit.render_generation, 2);
    assert.equal((await service.read({ operation: 'snapshot', session_id })).state, 'empty');
    const empty = await service.render(); assert.equal(empty._meta.agdf_cockpit.initial_run_id, undefined);
    await assert.rejects(service.render({ run_id: 'bad/path' }), /resource_denied/);
    assert.deepEqual(treeBytes(f.root), before);
  } finally { await service.close(); f.close(); }
});
test('SCN-047/049: concurrent renders retain four independent slots and shutdown cannot reopen', async () => {
  const f = fixture(); let created = 0;
  const service = createCockpitSessionService(f.root, { poolFactory: () => { created += 1; return { close: async () => {}, request: async () => ({ data: null }) }; } });
  try {
    const results = await Promise.all(Array.from({ length: 6 }, () => service.render()));
    const ids = results.filter(r => r._meta).map(r => r._meta.agdf_cockpit.session_id);
    assert.equal(new Set(ids).size, 4); assert.equal(created, 4);
    assert.deepEqual(results.slice(4).map(r => r.code), ['resource_limit', 'resource_limit']);
    for (const id of ids) assert.equal((await service.read({ operation: 'snapshot', session_id: id })).code, undefined);
    await service.close(); assert.equal((await service.render()).code, 'session_expired'); assert.equal(created, 4);
    for (const id of ids) assert.equal((await service.read({ operation: 'snapshot', session_id: id })).code, 'session_expired');
  } finally { await service.close(); f.close(); }
});

test('SCN-047/049: a retiring slot stays counted, late reads cannot revive it, allocation failure is contained', async () => {
  const f = fixture(); let finishRead, failAllocate = false; const closeCallbacks = [];
  const service = createCockpitSessionService(f.root, { poolFactory: () => {
    if (failAllocate) throw Error('failed allocation');
    return { close: () => new Promise(resolve => { closeCallbacks.push(resolve); }),
      request: () => new Promise(resolve => { finishRead = resolve; }) };
  } });
  try {
    const views = await Promise.all(Array.from({ length: 4 }, () => service.render()));
    const a = views[0]._meta.agdf_cockpit.session_id;
    const reading = service.read({ operation: 'snapshot', session_id: a });
    const closing = service.read({ operation: 'close', session_id: a });
    await Promise.resolve();
    assert.equal((await service.render()).code, 'resource_limit');
    finishRead({ state: 'available', data: {} });
    assert.equal((await reading).code, 'session_expired');
    closeCallbacks.shift()(); await closing;
    failAllocate = true; await assert.rejects(service.render(), /failed allocation/);
    failAllocate = false; assert.ok((await service.render())._meta);
    const shutdown = service.close(); await Promise.resolve();
    for (const finish of closeCallbacks.splice(0)) finish();
    await shutdown;
    assert.equal((await service.render()).code, 'session_expired');
  } finally { f.close(); }
});

test('SCN-048/050: rejected and foreign reads do not extend another view idle, own valid reads do', async () => {
  const f = fixture(); let time = 0;
  const service = createCockpitSessionService(f.root, { now: () => time, poolFactory: () => {
    const reader = createCockpitReader(f.root);
    return { close: async () => {}, request: async input => input.operation === 'snapshot' ? reader.snapshot(input.input.run_id) : reader.run(input.selector, input.snapshot) };
  } });
  try {
    const a = (await service.render())._meta.agdf_cockpit.session_id;
    const b = (await service.render())._meta.agdf_cockpit.session_id;
    const sa = await service.read({ operation: 'snapshot', session_id: a });
    let sb = await service.read({ operation: 'snapshot', session_id: b });
    time = COCKPIT_LIMITS.idle - 1;
    assert.equal((await service.read({ operation: 'run', session_id: a, snapshot_id: sb.snapshot_id, run_id: 'fixture-a' })).code, 'resource_denied');
    sb = await service.read({ operation: 'run', session_id: b, snapshot_id: sb.snapshot_id, run_id: 'fixture-a' });
    assert.equal(sb.state, 'available');
    time += 1;
    assert.equal((await service.read({ operation: 'run', session_id: a, snapshot_id: sa.snapshot_id, run_id: 'fixture-a' })).code, 'session_expired');
    assert.equal((await service.read({ operation: 'run', session_id: b, snapshot_id: sb.snapshot_id, run_id: 'fixture-a' })).state, 'available');
  } finally { await service.close(); f.close(); }
});

test('SCN-048/050: actual independent workers retain private equal-Run sources, own close leaves the other readable', async () => {
  const f = fixture(), before = treeBytes(f.root), service = createCockpitSessionService(f.root);
  try {
    const ids = (await Promise.all([service.render(), service.render()])).map(r => r._meta.agdf_cockpit.session_id);
    const snapshots = await Promise.all(ids.map(session_id => service.read({ operation: 'snapshot', session_id })));
    const details = await Promise.all(ids.map((session_id, i) => service.read({ operation: 'run', session_id, snapshot_id: snapshots[i].snapshot_id, run_id: 'fixture-a' })));
    const args = i => ({ operation: 'document', session_id: ids[i], snapshot_id: details[i].snapshot_id,
      run_id: 'fixture-a', resource_id: details[i].data.run.resources.find(r => r.type === 'UR').resource_id });
    assert.notEqual(snapshots[0].snapshot_id, snapshots[1].snapshot_id);
    assert.equal((await service.read({ ...args(0), resource_id: args(1).resource_id })).code, 'resource_denied');
    const document = await service.read(args(1)); const content = document.data.document.content;
    await service.read({ operation: 'close', session_id: ids[0] });
    assert.equal((await service.read(args(0))).code, 'session_expired');
    const next = await service.read({ ...args(1), snapshot_id: document.snapshot_id, resource_id: document.data.document.resource.resource_id });
    assert.equal(next.data.document.content, content);
    assert.deepEqual(treeBytes(f.root), before);
  } finally { await service.close(); f.close(); }
});

test('SCN-049/051: production worker replacement waits for termination and cannot overwrite a queued job', async () => {
  const f = fixture(), pool = new ReadWorkerPool(f.root, { limits: { total: COCKPIT_LIMITS.capture }, maxOldGenerationSizeMb: 256 });
  let finish;
  try {
    const first = await pool.request({ operation: 'snapshot' });
    const worker = pool.worker;
    assert.equal(worker.resourceLimits.maxOldGenerationSizeMb, 256);
    const terminate = worker.terminate.bind(worker);
    worker.terminate = () => new Promise(resolve => { finish = async () => resolve(await terminate()); });
    const failed = pool.request({ operation: 'freshness', snapshot: first.snapshot_id });
    const rejected = assert.rejects(failed, error => error.code === 'read_failed');
    worker.emit('error', Error('controlled worker failure')); await rejected; await Promise.resolve();
    const queued = pool.request({ operation: 'snapshot' });
    await assert.rejects(pool.request({ operation: 'snapshot' }), error => error.code === 'busy');
    assert.equal(pool.worker, null); assert.ok(worker.threadId > 0);
    await finish();
    assert.equal((await queued).state, 'empty'); assert.notEqual(pool.worker, worker);
    assert.equal(worker.threadId, -1);
  } finally { if (finish && pool.retiring) await finish(); await pool.close(); f.close(); }
});

test('SCN-051/061: production MCP overview ignores unrelated 64 MiB tree boundary; worker budgets remain unchanged', async () => {
  const f = fixture(), service = createCockpitSessionService(f.root);
  const control = join(f.root, '.agdf/control');
  const bytes = path => fs.readdirSync(path).reduce((n, name) => {
    const p = join(path, name), stat = fs.statSync(p); return n + (stat.isDirectory() ? bytes(p) : stat.size);
  }, 0);
  try {
    const remaining = COCKPIT_LIMITS.capture - bytes(control);
    fs.writeFileSync(join(control, 'capture-boundary-a.txt'), Buffer.alloc(32 * 1024 ** 2, 97));
    const tail = join(control, 'capture-boundary-b.txt');
    fs.writeFileSync(tail, Buffer.alloc(remaining - 32 * 1024 ** 2, 98));
    assert.equal(bytes(control), COCKPIT_LIMITS.capture);
    const session_id = (await service.render())._meta.agdf_cockpit.session_id;
    assert.equal((await service.read({ operation: 'snapshot', session_id })).state, 'empty');
    fs.appendFileSync(tail, 'x');
    const overview = await service.read({ operation: 'snapshot', session_id });
    assert.equal(overview.state, 'empty'); assert.equal(overview.data.file_count, 1);
    assert.ok(overview.data.byte_count < COCKPIT_LIMITS.capture);
    assert.equal(createCockpitReader(f.root).snapshot().state, 'empty');
    const browserPool = new ReadWorkerPool(f.root);
    try {
      assert.equal((await browserPool.request({ operation: 'snapshot' })).state, 'empty');
      assert.equal(browserPool.worker.resourceLimits.maxOldGenerationSizeMb, 768);
    } finally { await browserPool.close(); }
  } finally { await service.close(); f.close(); }
});
