import * as fs from 'node:fs';
import { join } from 'node:path';
import { ReadWorkerPool } from '../lib/control-read/cockpit-pool.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCockpitSessionService } from '../lib/control-inspect/cockpit-session.js';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';
import { parseCockpitArguments, COCKPIT_LIMITS, COCKPIT_RENDER_DEFINITION } from '../lib/control-inspect/cockpit-contract.js';
import { fixture, treeBytes } from './control-cockpit-fixtures.js';
import { createCompanionJournal, journalPath, JOURNAL_LIMIT_BYTES } from '../lib/companion/journal.js';
import { COMPANION_EVENTS_READ_LIMIT } from '../lib/companion/read-companion-events.js';
import { observeCodexActivity } from '../lib/companion/codex-activity.js';
import { tmpdir } from 'node:os';
import { createRun } from '../lib/control-state/run-state-repository.js';

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
    assert.deepEqual({...snapshot.data,entries:snapshot.data.entries.map(({row_id,...row})=>row)},{...direct.data,entries:direct.data.entries.map(({row_id,...row})=>row)});
    const detail = await call({ operation: 'run', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a' });
    const resource = detail.data.run.resources.find(r => r.type === 'UR');
    const args = { operation: 'document', snapshot_id: detail.snapshot_id, run_id: 'fixture-a', resource_id: resource.resource_id };
    const preview = await call({ ...args, operation: 'preview' });
    assert.equal(preview.state, 'available'); assert.match(preview.data.content, /Fixture document/);
    assert.equal(preview.snapshot_id, detail.snapshot_id);
    assert.equal((await call({ ...args, operation: 'preview', run_id: 'fixture-completed' })).code, 'resource_denied');
    assert.equal((await call({ ...args, operation: 'preview', resource_id: '00000000-0000-4000-8000-000000000000' })).code, 'resource_denied');
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
    { type: 'string', pattern: '^[a-z0-9][a-z0-9._-]{0,127}$' });
  assert.deepEqual(parseCockpitArguments({ run_id: 'fixture-a' }, true), { run_id: 'fixture-a' });
  assert.deepEqual(parseCockpitArguments({ view: 'companion', run_id: 'fixture-a' }, true), { view: 'companion', run_id: 'fixture-a' });
  assert.throws(() => parseCockpitArguments({ view: 'overview' }, true), /resource_denied/);
  assert.deepEqual(parseCockpitArguments({ run_id: 'a'.repeat(128) }, true), { run_id: 'a'.repeat(128) });
  for (const value of [{ run_id: '' }, { run_id: undefined }, { run_id: 12 }, { run_id: '../foreign' },
    { run_id: 'ünicode' }, { run_id: 'a'.repeat(129) }, { run_id: 'fixture-a', path: '/tmp' },
    { run_id: 'fixture-a', approval: 'TP' }, { run_id: 'https://external.invalid' }]) {
    assert.throws(() => parseCockpitArguments(value, true), /resource_denied/);
  }
});

test('Companion opening prefers the active Chat Run, then a decision, then the newest active Run', async () => {
  const f = fixture(), service = createCockpitSessionService(f.root);
  const working = 'fixture-zz-working', older = 'fixture-00-older';
  try {
    createRun(f.root, older, undefined, { prepare: text => text.replace(/^- updated_at: .+$/m, '- updated_at: 2000-01-01T00:00:00.000Z') });
    createRun(f.root, working);
    const before = treeBytes(f.root);
    async function open(input) {
      const rendered = await service.render(input);
      assert.equal(rendered.authorizes, false);
      const meta = rendered._meta.agdf_cockpit;
      assert.equal(rendered.display.run_id, meta.initial_run_id ?? null);
      const snapshot = await service.read({ operation: 'snapshot', session_id: meta.session_id,
        ...(meta.initial_run_id ? { run_id: meta.initial_run_id } : {}) });
      const presentation = meta.companion_empty ? { status: 'Kein aktiver Run' } : undefined;
      const ack = await service.read({ operation: 'display_ack', session_id: meta.session_id, snapshot_id: snapshot.snapshot_id,
        ...(presentation && { presentation }) });
      assert.equal(ack.data.display.state, 'ui_reported_visible');
      assert.deepEqual(ack.data.display.presentation, presentation);
      await service.read({ operation: 'close', session_id: meta.session_id });
      return meta;
    }
    assert.equal((await open({ view: 'companion', run_id: working })).initial_run_id, working);
    const fallback = await open({ view: 'companion', run_id: 'fixture-completed' });
    assert.equal(fallback.initial_run_id, 'fixture-a');
    assert.equal(fallback.companion_fallback, true);
    assert.equal((await open({ run_id: 'fixture-completed' })).initial_run_id, 'fixture-completed');
    assert.equal((await open({})).companion_empty, undefined);
    assert.deepEqual(treeBytes(f.root), before);
    fs.rmSync(join(f.root, '.agdf/control/runs/fixture-a'), { recursive: true });
    assert.equal((await open({ view: 'companion' })).initial_run_id, working);
    fs.rmSync(join(f.root, '.agdf/control/runs', working), { recursive: true });
    fs.rmSync(join(f.root, '.agdf/control/runs', older), { recursive: true });
    const empty = await open({ view: 'companion' });
    assert.equal(empty.initial_run_id, undefined);
    assert.equal(empty.companion_empty, true);
  } finally { await service.close(); f.close(); }
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
    assert.equal((await service.read({ operation: 'snapshot', session_id })).state, 'available');
    const empty = await service.render(); assert.equal(empty._meta.agdf_cockpit.initial_run_id, undefined);
    await assert.rejects(service.render({ run_id: 'bad/path' }), /resource_denied/);
    assert.deepEqual(treeBytes(f.root), before);
  } finally { await service.close(); f.close(); }
});
test('Cockpit display receipt is scoped to the opening view and its current snapshot', async () => {
  const f = fixture(), before = treeBytes(f.root), service = createCockpitSessionService(f.root);
  try {
    const render = await service.render({ run_id: 'fixture-a' });
    const session_id = render._meta.agdf_cockpit.session_id;
    const status = render.next_calls[0].arguments;
    assert.deepEqual((await service.read(status)).data.display, { state: 'pending', run_id: 'fixture-a' });
    const presentation = { status: 'Ich warte auf deine Freigabe', gate: 'UR', gate_state: 'current' };
    const ack = (snapshot_id, shown = presentation) => service.read({ operation: 'display_ack', session_id, snapshot_id, presentation: shown });
    const other = await service.render({ run_id: 'fixture-completed' });
    const otherId = other._meta.agdf_cockpit.session_id;
    const foreign = await service.read({ operation: 'snapshot', session_id: otherId, run_id: 'fixture-completed' });
    assert.equal((await ack(foreign.snapshot_id)).code, 'resource_denied');
    const overview = await service.read({ operation: 'snapshot', session_id });
    assert.equal((await ack(overview.snapshot_id)).code, 'resource_denied');
    const opening = await service.read({ operation: 'snapshot', session_id, run_id: 'fixture-a' });
    const refreshed = await service.read({ operation: 'snapshot', session_id, run_id: 'fixture-a' });
    assert.equal((await ack(opening.snapshot_id)).code, 'resource_denied');
    assert.equal((await ack(refreshed.snapshot_id, { ...presentation, title: 'Falscher Run' })).code, 'resource_denied');
    assert.equal((await ack(refreshed.snapshot_id, { status: 'Abgeschlossen', gate: 'UR' })).code, 'resource_denied');
    const confirmed = (await ack(refreshed.snapshot_id)).data.display;
    assert.equal(confirmed.state, 'ui_reported_visible');
    assert.equal(confirmed.run_id, 'fixture-a');
    assert.deepEqual(confirmed.presentation, { ...presentation, title: refreshed.data.run.title });
    assert.deepEqual((await ack(refreshed.snapshot_id, { status: 'Abgeschlossen' })).data.display, confirmed);
    assert.deepEqual((await service.read(status)).data.display, confirmed);
    assert.equal((await service.read(other.next_calls[0].arguments)).data.display.state, 'pending');
    await service.read({ operation: 'close', session_id });
    assert.equal((await service.read(status)).code, 'session_expired');
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
    assert.equal((await queued).state, 'available'); assert.notEqual(pool.worker, worker);
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
    assert.equal((await service.read({ operation: 'snapshot', session_id })).state, 'available');
    fs.appendFileSync(tail, 'x');
    const overview = await service.read({ operation: 'snapshot', session_id });
    assert.equal(overview.state, 'available'); assert.equal(overview.data.kind, 'work'); assert.equal(overview.data.entries.length, 2);
    assert.ok(overview.data.byte_count < COCKPIT_LIMITS.capture);
    assert.equal(createCockpitReader(f.root).snapshot().state, 'available');
    const browserPool = new ReadWorkerPool(f.root);
    try {
      assert.equal((await browserPool.request({ operation: 'snapshot' })).state, 'available');
      assert.equal(browserPool.worker.resourceLimits.maxOldGenerationSizeMb, 768);
    } finally { await browserPool.close(); }
  } finally { await service.close(); f.close(); }
});

test('plugin views bind two projects once, share capacity, and keep failure identity', async () => {
  const first = fixture(), second = fixture();
  for (const f of [first, second]) {
    fs.mkdirSync(join(f.root, '.git'),{recursive:true});
    fs.writeFileSync(join(f.root, '.git/HEAD'), 'ref: refs/heads/main\n');
  }
  const created = [], service = createCockpitSessionService(undefined, { pluginMode: true,
    poolFactory: root => { created.push(root); return { close: async () => {},
      request: async () => { throw Error('unavailable'); } }; } });
  const open = f => service.render({ working_directory: f.root, primary_target: f.root, target_source: 'explicit_target' });
  try {
    await assert.rejects(service.render({}), /resource_denied/);
    const denied = await service.render({ working_directory: first.root, primary_target: 'relative', target_source: 'explicit_target' });
    assert.equal(denied.code, 'resource_denied'); assert.equal(denied.target, null); assert.equal(created.length, 0);
    const missingRun = await service.render({ working_directory: first.root, primary_target: first.root,
      target_source: 'explicit_target', run_id: 'missing-run' });
    assert.equal(missingRun.code, 'run_missing'); assert.equal(missingRun.data.requested_run_id, 'missing-run');
    assert.equal(created.length, 0, 'unknown explicit Run allocates no worker');
    const a = await open(first), b = await open(second);
    assert.equal(a.target.display_path, first.root); assert.equal(b.target.display_path, second.root);
    assert.notEqual(a.target.target_id, b.target.target_id);
    const aid = a._meta.agdf_cockpit.session_id, bid = b._meta.agdf_cockpit.session_id;
    const failure = await service.read({ operation: 'snapshot', session_id: aid });
    assert.equal(failure.target.display_path, first.root); assert.equal(failure.code, 'read_failed');
    assert.equal((await service.read({ operation: 'snapshot', session_id: bid, primary_target: first.root })).code, 'resource_denied');
    await open(first); await open(second);
    assert.equal((await open(first)).code, 'resource_limit'); assert.equal(created.length, 4);
    await service.read({ operation: 'close', session_id: aid });
    assert.equal((await open(second)).target.display_path, second.root);
    assert.equal((await service.read({ operation: 'snapshot', session_id: aid })).code, 'session_expired');
  } finally { await service.close(); first.close(); second.close(); }
});

test('plugin production workers preserve cross-project data and one publication owner', async () => {
  const a = fixture(), b = fixture();
  for (const f of [a, b]) { fs.mkdirSync(join(f.root, '.git'),{recursive:true}); fs.writeFileSync(join(f.root, '.git/HEAD'), 'ref: refs/heads/main\n'); }
  fs.writeFileSync(join(b.root, b.documentPath), '# Other project document\n');
  const beforeA = treeBytes(a.root), beforeB = treeBytes(b.root);
  const service = createCockpitSessionService(undefined, { pluginMode: true });
  async function view(f) {
    const opened = await service.render({ primary_target: f.root, working_directory: f.root, target_source: 'continued_target', run_id: 'fixture-a' });
    const session_id = opened._meta.agdf_cockpit.session_id;
    const call = input => service.read({ ...input, session_id });
    const snapshot = await call({ operation: 'snapshot', run_id: 'fixture-a' });
    const resource = snapshot.data.run.resources.find(r => r.type === 'UR');
    const doc = await call({ operation: 'document', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a', resource_id: resource.resource_id });
    const context = await call({ operation: 'context', snapshot_id: doc.snapshot_id, run_id: 'fixture-a' });
    return { call, doc, selectors: { operation: 'prepare_context', snapshot_id: context.snapshot_id, run_id: 'fixture-a',
      revision_id: context.data.run.revision_id, resource_id: context.data.document.resource.resource_id, graph_ids: [], excluded_ids: [], generation: 1 } };
  }
  try {
    const x = await view(a), y = await view(b);
    assert.match(x.doc.data.document.content, /Fixture document/); assert.match(y.doc.data.document.content, /Other project/);
    assert.equal((await x.call(x.selectors)).state, 'available');
    assert.equal((await y.call(y.selectors)).code, 'busy');
    const invalidation = await x.call({ operation: 'invalidate_context' });
    assert.equal((await y.call(y.selectors)).code, 'busy');
    await x.call({ operation: 'complete_context_invalidation', invalidation_id: invalidation.data.invalidation_id });
    assert.equal((await y.call(y.selectors)).state, 'available');
    assert.deepEqual(treeBytes(a.root), beforeA); assert.deepEqual(treeBytes(b.root), beforeB);
  } finally { await service.close(); a.close(); b.close(); }
});


test('Codex freshness attaches current Companion activity or unknown liveness only to the selected Run', async () => {
  const f = fixture(), data = fs.mkdtempSync(join(tmpdir(), 'cockpit-companion-scope-'));
  const service = createCockpitSessionService(f.root, { integrationSurface: 'codex', companionDataRoot: data });
  try {
    const prepared = f.context.call('presentation.prepare', { gate: 'UR' }, f.binding());
    assert.equal(prepared.outcome, 'accepted');
    assert.equal(f.context.call('approval.record', { gate: 'UR', presentation_id: prepared.family_result.presentation_id, response: 'Approval: UR' }, f.binding()).outcome, 'accepted');
    const { run_id, expected_revision_id: revision_id } = f.binding();
    const gate = 'Brownfield Review';
    const { session_id } = (await service.render())._meta.agdf_cockpit;
    const call = input => service.read({ session_id, ...input });
    const run = await call({ operation: 'snapshot', run_id });
    assert.equal(run.data.run.evaluation.current_gate, gate);
    // SCN-004: without a sign of life of the Codex Companion hooks, activity is unknown, not idle.
    assert.equal(run.companion_observation.liveness, 'unknown');
    assert.equal(run.companion_observation.activity, undefined);
    assert.equal(run.companion_observation.run_id, run_id);
    assert.equal(run.companion_observation.revision_id, run.data.run.revision_id);
    assert.equal(observeCodexActivity(data, { session_id: 'chat-1', hook_event_name: 'SessionStart', source: 'startup' }), true);
    const resting = (await call({ operation: 'freshness', snapshot_id: run.snapshot_id })).companion_observation;
    assert.equal(resting.liveness, undefined);
    assert.equal(resting.activity, undefined);
    const observation = { session_id: 'chat-1', turn_id: 'turn-1', tool_use_id: 'tool-1',
      hook_event_name: 'PostToolUse', tool_name: 'mcp__agdf__agdf_dispatch',
      tool_input: { continue_delivery: true, run_id },
      tool_response: { structuredContent: {
        outcome: 'skill_continuation', terminal: false, authorizes: false,
        target: { resolution_state: 'resolved', governance_target: f.root },
        continuation: { phase: 'post_ur_review', run_id, revision_id, governance_target: f.root },
        control: { current_gate: gate, next_operation: { actor: 'agent' } },
      } },
    };
    assert.equal(observeCodexActivity(data, observation), true);
    const read = async snapshot_id => (await call({ operation: 'freshness', snapshot_id })).companion_observation?.activity;
    const active = await read(run.snapshot_id);
    assert.deepEqual(active, { target_id: run.target.target_id, run_id, revision_id, gate, expires_at: active?.expires_at });
    const other = await call({ operation: 'snapshot', run_id: 'fixture-completed' });
    assert.equal(other.companion_observation.liveness, undefined, 'a completed Run has no live activity status');
    assert.equal(other.companion_observation.activity, undefined, 'a completed Run has no activity');
    assert.equal(other.companion_observation.run_id, 'fixture-completed');
    assert.equal(await read(other.snapshot_id), undefined);
    assert.equal(await read(run.snapshot_id), undefined, 'an obsolete snapshot cannot attach evidence');
    const returned = await call({ operation: 'snapshot', run_id });
    assert.deepEqual(returned.companion_observation?.activity, active);
    assert.equal(observeCodexActivity(data, { ...observation, hook_event_name: 'Interrupt' }), true);
    assert.equal(await read(returned.snapshot_id), undefined);
    fs.writeFileSync(join(data, 'companion', 'codex-activity.json'), '{"broken"');
    const unreadable = (await call({ operation: 'freshness', snapshot_id: returned.snapshot_id })).companion_observation;
    assert.equal(unreadable.liveness, 'unknown', 'an unreadable store leaves activity unknown');
    assert.equal(unreadable.activity, undefined, 'an unreadable store attaches no activity');
  } finally {
    await service.close();
    fs.rmSync(data, { recursive: true, force: true });
    f.close();
  }
});

test('Codex updates selected Run events without invalidating the current snapshot or document', async t => {
  const f = fixture();
  const dataRoot = fs.mkdtempSync(join(tmpdir(), 'cockpit-companion-events-'));
  const service = createCockpitSessionService(f.root, { integrationSurface: 'codex', companionDataRoot: dataRoot });
  t.after(async () => {
    await service.close();
    f.close();
    fs.rmSync(dataRoot, { recursive: true, force: true });
  });
  const { _meta } = await service.render({ run_id: 'fixture-a' });
  const call = args => service.read({ session_id: _meta.agdf_cockpit.session_id, ...args });
  const snapshot = await call({ operation: 'snapshot', run_id: 'fixture-a' });
  const refresh = () => call({ operation: 'freshness', snapshot_id: snapshot.snapshot_id });
  assert.equal(snapshot.companion_observation.run_id, 'fixture-a');
  assert.equal(snapshot.companion_observation.revision_id, snapshot.data.run.revision_id);
  assert.deepEqual(snapshot.companion_observation.events, { state: 'available', items: [] });
  const journal = createCompanionJournal({ dataRoot, now: () => new Date('2026-11-16T11:13:00Z') });
  const record = (run_id, root = f.root) => journal.observe('agdf_approve', {
    primary_target: root, run_id, command: { kind: 'approval.record', payload: { gate: 'UR' } },
  }, { outcome: 'accepted' });
  assert.equal(record('fixture-a'), true);
  assert.equal(record('fixture-completed'), true);
  assert.equal(record('fixture-a', dataRoot), true);
  const refreshed = await refresh();
  assert.equal(refreshed.snapshot_id, snapshot.snapshot_id);
  assert.deepEqual(refreshed.companion_observation.events.items.map(({ run_id, kind, gate, at }) => ({ run_id, kind, gate, at })),
    [{ run_id: 'fixture-a', kind: 'approval_recorded', gate: 'UR', at: '2026-11-16T11:13:00.000Z' }]);
  // Run run-71aa7dbb (SDD-006): the card's rule for uncertain outcomes reads the run's newest receipt time.
  assert.ok(Number.isFinite(Date.parse(snapshot.data.run.last_activity)), 'the detail carries the newest receipt time');
  assert.equal(new Date(snapshot.data.run.last_activity).toISOString(), snapshot.data.run.last_activity);
  fs.copyFileSync(journalPath(dataRoot), join(dataRoot, 'companion', 'events.1.jsonl'));
  assert.equal((await refresh()).companion_observation.events.items.length, 1);
  const entries = Array.from({ length: 6 }, (_, index) => ({
    schema_version: 'companion-event/1', id: 'event-' + index, at: new Date(Date.UTC(2026, 10, 17, index)).toISOString(),
    kind: 'document_recorded', gate: 'UR', root: f.root, run_id: 'fixture-a',
  }));
  fs.appendFileSync(journalPath(dataRoot), ['incomplete', ...entries.map(event => JSON.stringify(event)), ''].join('\n'));
  // The whole history of the selected run (up to 32), newest first; the card picks its lines (SDD-006).
  const history = (await refresh()).companion_observation.events.items;
  assert.deepEqual(history.map(event => event.id).slice(0, 6), ['event-5', 'event-4', 'event-3', 'event-2', 'event-1', 'event-0']);
  assert.equal(history.length, 7, 'the earlier approval of the run stays in its history');
  assert.ok(history.every(event => event.run_id === 'fixture-a' && !('review' in event)), 'run-scoped items without review facts');
  fs.rmSync(journalPath(dataRoot));
  fs.mkdirSync(journalPath(dataRoot));
  const failure = await refresh();
  assert.equal(failure.data.unchanged, true);
  assert.deepEqual(failure.companion_observation.events, { state: 'unavailable', items: [] });
  const resource = snapshot.data.run.resources.find(row => row.type === 'UR');
  assert.equal((await call({ operation: 'document', snapshot_id: snapshot.snapshot_id,
    run_id: 'fixture-a', resource_id: resource.resource_id })).state, 'available');
});

test('Codex events tolerate a journal that concurrent writers pushed past the writer bound', async t => {
  const f = fixture();
  const dataRoot = fs.mkdtempSync(join(tmpdir(), 'cockpit-companion-bound-'));
  const service = createCockpitSessionService(f.root, { integrationSurface: 'codex', companionDataRoot: dataRoot });
  t.after(async () => {
    await service.close();
    f.close();
    fs.rmSync(dataRoot, { recursive: true, force: true });
  });
  const { _meta } = await service.render({ run_id: 'fixture-a' });
  const call = args => service.read({ session_id: _meta.agdf_cockpit.session_id, ...args });
  const snapshot = await call({ operation: 'snapshot', run_id: 'fixture-a' });
  const events = async () => (await call({ operation: 'freshness', snapshot_id: snapshot.snapshot_id })).companion_observation.events;
  const line = (id, hour) => `${JSON.stringify({ schema_version: 'companion-event/1', id, at: new Date(Date.UTC(2026, 10, 18, hour)).toISOString(),
    kind: 'document_recorded', gate: 'UR', root: f.root, run_id: 'fixture-a' })}\n`;
  // An unparseable filler line stands in for the other projects' events.
  const filler = bytes => `${'x'.repeat(bytes)}\n`;
  fs.mkdirSync(join(dataRoot, 'companion'));
  const rotated = join(dataRoot, 'companion', 'events.1.jsonl');
  fs.writeFileSync(rotated, filler(JOURNAL_LIMIT_BYTES) + line('rotated', 1));
  fs.writeFileSync(journalPath(dataRoot), filler(JOURNAL_LIMIT_BYTES) + line('current', 2));
  assert.deepEqual((await events()).items.map(item => item.id), ['current', 'rotated'],
    'both files above the writer bound but within the read headroom stay readable');
  fs.writeFileSync(rotated, filler(COMPANION_EVENTS_READ_LIMIT) + line('rotated', 1));
  const skipped = await events();
  assert.equal(skipped.state, 'available', 'an oversized rotation file does not hide the current history');
  assert.deepEqual(skipped.items.map(item => item.id), ['current'], 'an oversized rotation file is skipped');
  fs.writeFileSync(journalPath(dataRoot), filler(COMPANION_EVENTS_READ_LIMIT) + line('current', 2));
  assert.deepEqual(await events(), { state: 'unavailable', items: [] }, 'an oversized current file is unavailable');
});

test('Codex attaches no event history without a Companion data root', async t => {
  const f = fixture();
  const service = createCockpitSessionService(f.root, { integrationSurface: 'codex', companionDataRoot: '' });
  t.after(async () => {
    await service.close();
    f.close();
  });
  const { _meta } = await service.render({ run_id: 'fixture-a' });
  const call = args => service.read({ session_id: _meta.agdf_cockpit.session_id, ...args });
  const snapshot = await call({ operation: 'snapshot', run_id: 'fixture-a' });
  assert.equal(snapshot.companion_observation.run_id, 'fixture-a');
  assert.equal('events' in snapshot.companion_observation, false);
  const refreshed = await call({ operation: 'freshness', snapshot_id: snapshot.snapshot_id });
  assert.equal('events' in refreshed.companion_observation, false);
});
