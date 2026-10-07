import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { createCockpitSessionService } from '../lib/control-inspect/cockpit-session.js';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';
import { COCKPIT_LIMITS } from '../lib/control-inspect/cockpit-contract.js';
import { fixture, treeBytes } from './control-cockpit-fixtures.js';
import { replaceFirstScalar } from '../lib/control-state/run-state-edits.js';
import { sealRunState } from '../lib/control-state/run-seal.js';

const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
function controlled(options = {}) {
  const f = fixture(), pools = [];
  const service = createCockpitSessionService(f.root, { ...options, poolFactory: () => {
    const reader = createCockpitReader(f.root);
    const pool = { pause: null, fail: null, closes: 0, async close() { this.closes++; }, async request({ operation, selector, snapshot, input }) {
      if (this.fail === operation) throw Object.assign(Error('worker lost'), { code: 'read_failed' });
      if (operation === 'prepare_context' && this.pause) await this.pause.promise;
      return operation === 'snapshot' ? reader.snapshot() : operation === 'run' ? reader.run(selector, snapshot)
        : operation === 'document' ? reader.document(selector, snapshot) : operation === 'context' ? reader.context(selector, snapshot)
        : operation === 'prepare_context' ? reader.prepareContext(input) : operation === 'validate_context' ? reader.validateContext(input.context_id, input.generation)
        : operation === 'invalidate_context' ? reader.invalidateContext() : reader.freshness(snapshot);
    } };
    pools.push(pool); return pool;
  } });
  return { f, service, pools };
}
async function view(service) {
  const id = (await service.render())._meta.agdf_cockpit.session_id;
  const call = input => service.read({ session_id: id, ...input });
  const snapshot = await call({ operation: 'snapshot' });
  const detail = await call({ operation: 'run', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a' });
  const resource = detail.data.resources.find(r => r.type === 'UR');
  const documentArgs = { operation: 'document', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a', resource_id: resource.resource_id };
  const document = await call(documentArgs);
  const prepare = { operation: 'prepare_context', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a', revision_id: detail.data.revision_id,
    resource_id: resource.resource_id, graph_ids: [], excluded_ids: [], generation: 1 };
  return { id, call, snapshot, document, documentArgs, prepare };
}

test('SCN-050/052/053/054: deferred reservation excludes another publisher while independent equal-Run sources stay readable', async () => {
  const { f, service, pools } = controlled(), before = treeBytes(f.root);
  try {
    const a = await view(service), b = await view(service);
    pools[0].pause = deferred();
    const pending = a.call(a.prepare);
    assert.equal((await b.call(b.prepare)).code, 'busy');
    assert.equal((await b.call(b.documentArgs)).data.content, b.document.data.content);
    assert.equal((await b.call({ operation: 'invalidate_context' })).data.host_publication_required, false);
    pools[0].pause.resolve(); const packet = (await pending).data.packet;
    assert.equal((await b.call({ operation: 'validate_context', context_id: packet.context_id, generation: 1 })).code, 'resource_denied');
    assert.equal((await a.call({ operation: 'validate_context', context_id: randomUUID(), generation: 1 })).code, 'resource_denied');
    assert.equal((await a.call({ operation: 'validate_context', context_id: packet.context_id, generation: 1 })).data.current, true);
    const release = (await a.call({ operation: 'invalidate_context' })).data;
    assert.equal(release.host_publication_required, true); assert.match(release.invalidation_id, /^[a-f0-9-]{36}$/);
    assert.equal((await a.call({ operation: 'invalidate_context' })).data.invalidation_id, release.invalidation_id);
    assert.equal((await b.call(b.prepare)).code, 'busy');
    assert.equal((await b.call({ operation: 'complete_context_invalidation', invalidation_id: release.invalidation_id })).code, 'resource_denied');
    assert.equal((await a.call({ operation: 'complete_context_invalidation', invalidation_id: randomUUID() })).code, 'resource_denied');
    assert.equal((await a.call({ operation: 'complete_context_invalidation', invalidation_id: release.invalidation_id })).data.completed, true);
    const next = (await b.call(b.prepare)).data.packet;
    // An old completion receipt is idempotent, not permission to clear B.
    assert.equal((await a.call({ operation: 'complete_context_invalidation', invalidation_id: release.invalidation_id })).data.completed, true);
    assert.equal((await a.call({ operation: 'invalidate_context' })).data.host_publication_required, false);
    assert.equal((await b.call({ operation: 'validate_context', context_id: next.context_id, generation: 1 })).data.current, true);
    assert.deepEqual(treeBytes(f.root), before);
  } finally { await service.close(); f.close(); }
});

test('SCN-052: a rejected never-returned preparation releases its reservation; successful ownership cannot be replaced without release', async () => {
  const { f, service } = controlled();
  try {
    const a = await view(service), b = await view(service);
    assert.equal((await a.call({ ...a.prepare, revision_id: randomUUID() })).code, 'resource_denied');
    const packet = (await b.call(b.prepare)).data.packet;
    assert.equal((await b.call({ ...b.prepare, generation: 2 })).code, 'busy');
    assert.equal((await b.call({ operation: 'validate_context', context_id: packet.context_id, generation: 1 })).data.current, true);
  } finally { await service.close(); f.close(); }
});

test('SCN-050: equal Run/source bytes do not make graph, snapshot or artefact selectors transferable between views', async () => {
  const { f, service } = controlled();
  try {
    fs.writeFileSync(join(f.root, '.agdf/control/CONTEXT_GRAPH.md'), '### CG-A\nOriginal graph β\n');
    const source = fs.readFileSync(f.runPath, 'utf8');
    fs.writeFileSync(f.runPath, sealRunState(f.root, replaceFirstScalar(source, 'context_graph_refs', 'CG-A')
      ?? `${source}\n## Context Graph Impact\n\n- context_graph_refs: CG-A\n`));
    const before = treeBytes(f.root), a = await view(service), b = await view(service);
    const graphA = (await a.call({ operation: 'context', snapshot_id: a.snapshot.snapshot_id, run_id: 'fixture-a' })).data.references[0];
    const graphB = (await b.call({ operation: 'context', snapshot_id: b.snapshot.snapshot_id, run_id: 'fixture-a' })).data.references[0];
    assert.equal(graphA.content, graphB.content); assert.notEqual(graphA.resource_id, graphB.resource_id);
    assert.equal((await b.call({ operation: 'context', snapshot_id: a.snapshot.snapshot_id, run_id: 'fixture-a' })).code, 'resource_denied');
    assert.equal((await b.call({ ...b.prepare, resource_id: a.prepare.resource_id })).code, 'resource_denied');
    assert.equal((await b.call({ ...b.prepare, graph_ids: [graphA.resource_id] })).code, 'resource_denied');
    const packet = (await a.call({ ...a.prepare, graph_ids: [graphA.resource_id] })).data.packet;
    assert.equal(packet.graph_nodes[0].content, graphA.content);
    const release = (await a.call({ operation: 'invalidate_context' })).data.invalidation_id;
    await a.call({ operation: 'complete_context_invalidation', invalidation_id: release });
    assert.equal((await b.call({ ...b.prepare, graph_ids: [graphB.resource_id] })).data.packet.graph_nodes[0].content, graphB.content);
    assert.deepEqual(treeBytes(f.root), before);
  } finally { await service.close(); f.close(); }
});

test('SCN-053/054: nonowner refresh/close preserve the packet; only the newest single receipt can be retried', async () => {
  const { f, service } = controlled();
  try {
    const a = await view(service), b = await view(service);
    const first = (await a.call(a.prepare)).data.packet;
    await b.call({ operation: 'snapshot' }); await b.call({ operation: 'close' });
    assert.equal((await a.call({ operation: 'validate_context', context_id: first.context_id, generation: 1 })).data.current, true);
    const one = (await a.call({ operation: 'invalidate_context' })).data.invalidation_id;
    await a.call({ operation: 'complete_context_invalidation', invalidation_id: one });
    assert.equal((await a.call({ operation: 'invalidate_context' })).data.host_publication_required, false);
    const second = (await a.call({ ...a.prepare, generation: 2 })).data.packet;
    const two = (await a.call({ operation: 'invalidate_context' })).data.invalidation_id;
    assert.notEqual(two, one);
    // Old receipt replay cannot acknowledge the new pending release.
    assert.equal((await a.call({ operation: 'complete_context_invalidation', invalidation_id: one })).data.completed, true);
    const c = await view(service); assert.equal((await c.call(c.prepare)).code, 'busy');
    await a.call({ operation: 'complete_context_invalidation', invalidation_id: two });
    assert.equal((await a.call({ operation: 'complete_context_invalidation', invalidation_id: one })).code, 'resource_denied');
    assert.equal((await c.call(c.prepare)).state, 'available');
    assert.equal((await a.call({ operation: 'validate_context', context_id: second.context_id, generation: 2 })).code, 'resource_denied');
  } finally { await service.close(); f.close(); }
});

for (const loss of ['close', 'idle', 'lifetime', 'worker']) test(`SCN-048/055/056: ${loss} owner loss quarantines publication without disabling other reading slots`, async () => {
  let clock = 0;
  const { f, service, pools } = controlled({ now: () => clock });
  try {
    const a = await view(service);
    if (loss === 'lifetime') clock = 10 * 60_000;
    const b = await view(service);
    await a.call(a.prepare);
    if (loss === 'close') await a.call({ operation: 'close' });
    else if (loss === 'worker') {
      pools[0].fail = 'freshness';
      assert.equal((await a.call({ operation: 'freshness', snapshot_id: a.snapshot.snapshot_id })).code, 'read_failed');
    } else if (loss === 'idle') {
      clock = COCKPIT_LIMITS.idle - 1;
      await b.call(b.documentArgs);
      // Foreign context validation does not renew A.
      assert.equal((await a.call({ operation: 'validate_context', context_id: randomUUID(), generation: 1 })).code, 'resource_denied');
      clock++;
      assert.equal((await a.call({ operation: 'freshness', snapshot_id: a.snapshot.snapshot_id })).code, 'session_expired');
    } else {
      for (clock = 10 * 60_000; clock < COCKPIT_LIMITS.lifetime; clock += 10 * 60_000) {
        await a.call({ operation: 'freshness', snapshot_id: a.snapshot.snapshot_id });
        await b.call(b.documentArgs);
      }
      assert.equal((await a.call({ operation: 'freshness', snapshot_id: a.snapshot.snapshot_id })).code, 'session_expired');
    }
    assert.equal((await b.call(b.prepare)).code, 'context_cleanup_uncertain');
    assert.equal((await b.call(b.documentArgs)).data.content, b.document.data.content);
    const c = await view(service);
    assert.equal((await c.call(c.prepare)).code, 'context_cleanup_uncertain');
    assert.equal((await c.call(c.documentArgs)).state, 'available');
    if (loss === 'worker') assert.equal((await a.call({ operation: 'invalidate_context' })).code, 'context_cleanup_uncertain');
    else assert.equal(pools[0].closes, 1);
  } finally { await service.close(); f.close(); }
});

test('SCN-054/055/056: failed begin grants no release; active owner can complete its same pending token after worker loss', async () => {
  const { f, service, pools } = controlled();
  try {
    const a = await view(service), b = await view(service); await a.call(a.prepare);
    pools[0].fail = 'invalidate_context';
    assert.equal((await a.call({ operation: 'invalidate_context' })).code, 'read_failed');
    assert.equal((await a.call({ operation: 'freshness', snapshot_id: a.snapshot.snapshot_id })).code, 'resource_denied');
    assert.equal((await b.call(b.prepare)).code, 'context_cleanup_uncertain');
    const pending = (await a.call({ operation: 'invalidate_context' })).data;
    assert.equal(pending.host_publication_required, true);
    assert.equal((await a.call({ operation: 'complete_context_invalidation', invalidation_id: pending.invalidation_id })).data.completed, true);
    assert.equal((await b.call(b.prepare)).state, 'available');
  } finally { await service.close(); f.close(); }
});

test('SCN-049/052: invalidate or shutdown during deferred preparation cannot return a newly usable packet', async () => {
  for (const action of ['invalidate', 'shutdown']) {
    const { f, service, pools } = controlled();
    try {
      const a = await view(service), b = await view(service);
      pools[0].pause = deferred(); const pending = a.call(a.prepare);
      if (action === 'shutdown') await service.close();
      else assert.equal((await a.call({ operation: 'invalidate_context' })).data.host_publication_required, false);
      pools[0].pause.resolve();
      assert.equal((await pending).data, null);
      assert.equal((await b.call(b.prepare)).state, action === 'shutdown' ? 'blocked' : 'available');
    } finally { await service.close(); f.close(); }
  }
});
