import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { startControlServer } from '../server/service.mjs';
import { ReadWorkerPool } from '../server/pool.mjs';
import { fixture, treeBytes } from '../../core/test/control-cockpit-fixtures.js';
import { READ_LIMITS } from '../../core/lib/control-read/snapshot.js';

function request(service, path, { headers = {}, method = 'GET' } = {}) {
  return new Promise((resolve, reject) => {
    const origin = new URL(service.origin);
    const req = http.request({ hostname: origin.hostname, port: origin.port, path, method, headers: { 'x-agdf-session': service.secret, ...headers } }, res => {
      const chunks = []; res.on('data', b => chunks.push(b)); res.on('end', () => { const bytes = Buffer.concat(chunks), text = bytes.toString(); resolve({ status: res.statusCode, headers: res.headers, bytes, text, body: res.headers['content-type'].includes('json') ? JSON.parse(text) : null }); });
    }); req.on('error', reject); req.end();
  });
}
test('SCN-020/022/032: loopback authenticated read journey, origin/method/selector boundaries, headers and unchanged tree', async () => {
  const f = fixture(), before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  try {
    const index = await request(service, '/'); assert.equal(index.status, 200); assert.match(index.headers['content-security-policy'], /frame-ancestors 'none'/); assert.equal(index.headers['referrer-policy'], 'no-referrer'); assert.equal(index.headers['cache-control'], 'no-store'); assert.doesNotMatch(index.text, new RegExp(service.secret));
    const card = await request(service, '/card.html'); assert.equal(card.status, 200);
    assert.match(card.text, /data-cockpit-view="compact"/); assert.match(card.text, /<script[^>]+type="module"/);
    assert.doesNotMatch(card.text, new RegExp(service.secret));
    assert.match(index.headers['content-security-policy'], /font-src 'self';/);
    assert.match(index.headers['content-security-policy'], /img-src data:;/);
    const cssPath = index.text.match(/href="([^"]+\.css)"/)[1];
    const css = await request(service, cssPath);
    const fonts = [...css.text.matchAll(/url\(([^)]+\.woff2)\)/g)].map(m => new URL(m[1].replace(/["']/g,''), service.origin + cssPath).pathname);
    assert.equal(fonts.length, 2, 'browser build must serve both local font faces');
    for (const path of fonts) {
      const font = await request(service, path);
      assert.equal(font.status, 200); assert.equal(font.headers['content-type'], 'font/woff2');
      assert.equal(font.bytes.subarray(0,4).toString(), 'wOF2');
    }
    assert.equal((await request(service, '/assets/unregistered.woff2')).status, 404);
    const s = (await request(service, '/api/snapshot')).body; assert.ok(s.snapshot_id);
    const d = (await request(service, '/api/runs/fixture-a?snapshot=' + s.snapshot_id)).body;
    assert.equal(s.data.kind, 'backlog'); assert.equal(d.data.kind, 'run');
    const resource = d.data.run.resources.find(r => r.type === 'UR');
    const doc = (await request(service, `/api/documents/${resource.resource_id}?snapshot=${d.snapshot_id}`)).body;
    assert.match(doc.data.document.content, /Fixture document/); assert.notEqual(doc.snapshot_id,d.snapshot_id);
    assert.equal((await request(service, '/api/freshness?snapshot=' + doc.snapshot_id)).body.data.unchanged, true);
    const context = (await request(service, '/api/context/fixture-a?snapshot=' + doc.snapshot_id)).body;
    assert.equal(context.state, 'empty'); assert.equal(context.data.context.run_id, 'fixture-a');
    assert.deepEqual(context.data.context.references, []); assert.notEqual(context.snapshot_id,doc.snapshot_id);
    for (const [path, options] of [
      ['/api/snapshot', { headers: { 'x-agdf-session': '' } }], ['/api/snapshot', { headers: { 'x-agdf-session': 'é'.repeat(64) } }],
      ['/api/snapshot', { headers: { Origin: 'https://foreign.invalid' } }], ['/api/snapshot', { headers: { Origin: 'null' } }],
      ['/api/snapshot', { headers: { Host: 'foreign.invalid' } }], ['/api/snapshot', { headers: { 'Sec-Fetch-Site': 'cross-site' } }],
      ['/api/snapshot', { method: 'OPTIONS' }], ['/api/snapshot', { method: 'POST' }], ['/api/approve', {}],
      ['/api/snapshot?dir=/private', {}], ['/api/snapshot?approval=TP', {}], ['/api/runs/../snapshot', {}],
      ['/api/prepare_context', {}], ['/api/context/fixture-a?snapshot=' + s.snapshot_id + '&content=forged', {}],
      ['/api/runs/%2e%2e', {}], ['/api/runs/%252e%252e', {}], ['/api/documents/unknown?snapshot=' + s.snapshot_id, {}],
      ['/.agdf/control/config.json', {}], ['/src/main.tsx', {}], ['/unknown', {}],
    ]) {
      const response = await request(service, path, options); assert.ok(response.status >= 400, path + JSON.stringify(options)); assert.doesNotMatch(response.text, /Fixture document/); assert.doesNotMatch(response.text, new RegExp(service.secret)); assert.equal(response.headers['access-control-allow-origin'], undefined);
    }
    assert.equal((await request(service, '/api/freshness?snapshot=' + context.snapshot_id, { headers: { Origin: service.origin } })).status, 200);
    assert.deepEqual(treeBytes(f.root), before);
    fs.writeFileSync(join(f.root, f.documentPath), 'external edit'); assert.equal((await request(service, '/api/freshness?snapshot=' + context.snapshot_id)).body.code, 'source_changed');
    const fresh = (await request(service, '/api/snapshot')).body; assert.notEqual(fresh.snapshot_id, s.snapshot_id); assert.equal((await request(service, `/api/runs/fixture-a?snapshot=${s.snapshot_id}`)).body.code, 'resource_denied');
    await assert.rejects(startControlServer({ dir: f.root, port: Number(new URL(service.origin).port) }), /EADDRINUSE/);
  } finally { await service.close(); f.close(); }
});
test('SCN-017/026: one active and one queued job, cancellation, deadline, and shutdown', async () => {
  const pool = new ReadWorkerPool('/private/tmp', { workerURL: new URL('./slow-worker.mjs', import.meta.url), timeout: 1500 });
  try {
    const first = pool.request({ operation: 'first' }), cancelled = new AbortController();
    const second = pool.request({ operation: 'second' }, cancelled.signal); const rejection = assert.rejects(second, /cancelled/);
    await assert.rejects(pool.request({ operation: 'third' }), /busy/); cancelled.abort(); await rejection;
    assert.deepEqual(await first, { operation: 'first' }); assert.deepEqual(await pool.request({ operation: 'recovered' }), { operation: 'recovered' });
    const active = new AbortController(), dropped = pool.request({ operation: 'dropped' }, active.signal), rejected = assert.rejects(dropped, /cancelled/);
    active.abort(); await rejected; assert.deepEqual(await pool.request({ operation: 'after-cancellation' }), { operation: 'after-cancellation' });
  } finally { await pool.close(); }
  await assert.rejects(pool.request({ operation: 'closed' }), /read_failed/);
  const timeoutPool = new ReadWorkerPool('/private/tmp', { workerURL: new URL('./slow-worker.mjs', import.meta.url), timeout: 1 });
  try { await assert.rejects(timeoutPool.request({ operation: 'timeout' }), /timeout/); } finally { await timeoutPool.close(); }
});
test('SCN-011/017: worker failure is bounded and retry succeeds without internal exception leakage', async () => {
  const f = fixture(), service = await startControlServer({ dir: f.root, poolOptions: { workerURL: new URL('./error-worker.mjs', import.meta.url) } });
  try {
    const failed = await request(service, '/api/snapshot'); assert.equal(failed.body.code, 'read_failed'); assert.equal(failed.body.retryable, true); assert.doesNotMatch(failed.text, /internal-error-must-not-leak/);
    service.pool.workerURL = new URL('../server/read-worker.mjs', import.meta.url);
    assert.ok((await request(service, '/api/snapshot')).body.snapshot_id);
  } finally { await service.close(); f.close(); }
});
test('SCN-022/025: startup needs explicit valid target, build and port; fresh process invalidates secret', async () => {
  await assert.rejects(startControlServer(), /explicit_target_required/);
  const f = fixture(); try {
    await assert.rejects(startControlServer({ dir: f.root, port: 'bad' }), /port_invalid/);
    await assert.rejects(startControlServer({ dir: join(f.root, 'absent') }), /ENOENT/);
    const dist = join(f.root, 'test-dist'); fs.mkdirSync(dist); fs.writeFileSync(join(dist, 'index.html'), '<!doctype html>');
    fs.symlinkSync(join(f.root, f.documentPath), join(dist, 'linked.js'));
    await assert.rejects(startControlServer({ dir: f.root, dist }), /asset_boundary_invalid/);
    const a = await startControlServer({ dir: f.root }); const secret = a.secret; await a.close();
    const b = await startControlServer({ dir: f.root }); try { assert.notEqual(b.secret, secret); assert.equal((await request(b, '/api/snapshot', { headers: { 'x-agdf-session': secret } })).status, 401); } finally { await b.close(); }
  } finally { f.close(); }
});
test('SCN-026: actual serialized response cap accepts exact byte limit and rejects one byte more', async () => {
  const f = fixture(), service = await startControlServer({ dir: f.root, poolOptions: { workerURL: new URL('./response-worker.mjs', import.meta.url) } });
  try {
    const overhead = Buffer.byteLength(JSON.stringify({ content: '' }));
    const path = n => `/api/runs/payload-${n}?snapshot=${'a'.repeat(36)}`;
    const exact = await request(service, path(READ_LIMITS.response - overhead)); assert.equal(exact.status, 200); assert.equal(Buffer.byteLength(exact.text), READ_LIMITS.response);
    const over = await request(service, path(READ_LIMITS.response - overhead + 1)); assert.equal(over.status, 413); assert.equal(over.body.code, 'resource_limit');
  } finally { await service.close(); f.close(); }
});
