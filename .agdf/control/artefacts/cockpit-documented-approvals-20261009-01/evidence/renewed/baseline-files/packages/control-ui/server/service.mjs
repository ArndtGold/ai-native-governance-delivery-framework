import { createServer } from 'node:http';
import * as fs from 'node:fs';
import { join, relative, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { ReadWorkerPool } from './pool.mjs';
import { READ_LIMITS } from '../../core/lib/control-read/snapshot.js';
import { resolveControlCommandTarget } from '../../core/lib/control-state/approval-command-contract.js';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2' };
export const SECURITY_HEADERS = Object.freeze({
  'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src data:; font-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'",
});
function assets(root) {
  const result = new Map(), directories = new Map();
  // Capture built trusted assets once; subsequent HTTP requests have no filesystem selector.
  function visit(path) {
    const before = fs.lstatSync(path, { bigint: true });
    if (before.isSymbolicLink()) throw Error('asset_boundary_invalid');
    if (before.isDirectory()) {
      directories.set(path, before);
      for (const name of fs.readdirSync(path)) visit(join(path, name));
      const after = fs.lstatSync(path, { bigint: true });
      if (before.dev !== after.dev || before.ino !== after.ino || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs) throw Error('asset_boundary_invalid');
      return;
    }
    if (!before.isFile() || before.size > BigInt(READ_LIMITS.response)) throw Error('asset_boundary_invalid');
    const fd = fs.openSync(path, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
    try {
      const opened = fs.fstatSync(fd, { bigint: true });
      const equal = (a, b) => ['dev', 'ino', 'size', 'mtimeNs', 'ctimeNs'].every(key => a[key] === b[key]);
      if (!equal(before, opened)) throw Error('asset_boundary_invalid');
      const bytes = Buffer.alloc(Number(opened.size));
      let offset = 0;
      while (offset < bytes.length) {
        const count = fs.readSync(fd, bytes, offset, bytes.length - offset, offset);
        if (!count) throw Error('asset_boundary_invalid');
        offset += count;
      }
      if (fs.readSync(fd, Buffer.alloc(1), 0, 1, offset)) throw Error('asset_boundary_invalid');
      if (!equal(opened, fs.fstatSync(fd, { bigint: true })) || !equal(opened, fs.lstatSync(path, { bigint: true }))) throw Error('asset_boundary_invalid');
      for (let parent = dirname(path); ; parent = dirname(parent)) {
        const now = fs.lstatSync(parent, { bigint: true }), captured = directories.get(parent);
        if (!captured || now.isSymbolicLink() || now.dev !== captured.dev || now.ino !== captured.ino || fs.realpathSync(parent) !== parent) throw Error('asset_boundary_invalid');
        if (parent === root) break;
      }
      const key = '/' + relative(root, path).split(sep).join('/');
      const extension = key.slice(key.lastIndexOf('.'));
      if (MIME[extension]) result.set(key === '/index.html' ? '/' : key, { bytes, mime: MIME[extension] });
    } finally { fs.closeSync(fd); }
  }
  visit(root); if (!result.has('/')) throw Error('build_required'); return result;
}
export async function startControlServer({ dir, port = 0, dist = fileURLToPath(new URL('../dist/', import.meta.url)), poolOptions } = {}) {
  if (typeof dir !== 'string' || !dir.trim()) throw Error('explicit_target_required');
  const root = fs.realpathSync(resolve(dir));
  if (!fs.statSync(root).isDirectory() || fs.lstatSync(resolve(dir)).isSymbolicLink()) throw Error('target_invalid');
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error('port_invalid');
  if (fs.lstatSync(resolve(dist)).isSymbolicLink()) throw Error('asset_boundary_invalid');
  const staticAssets = assets(fs.realpathSync(dist));
  const target = { target_id: resolveControlCommandTarget(root).target_id, display_path: root };
  const secret = randomBytes(32).toString('hex'), secretBytes = Buffer.from(secret);
  const pool = new ReadWorkerPool(root, poolOptions);
  let origin;
  const error = code => ({ schema_version: '1', target, snapshot_id: null, observed_as_of: null, source_digest: null,
    state: code === 'source_changed' ? 'stale' : code === 'resource_denied' || code === 'session_invalid' ? 'blocked' : 'error',
    code, retryable: ['source_changed', 'read_failed', 'busy', 'timeout', 'resource_limit'].includes(code), data: null });
  const server = createServer({ maxHeaderSize: 8192 }, async (req, res) => {
    const send = (status, body, mime = 'application/json; charset=utf-8') => {
      const bytes = Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body));
      if (bytes.length > READ_LIMITS.response) return send(413, error('resource_limit'));
      if (!res.destroyed) { res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': mime }); res.end(bytes); }
    };
    const host = req.headers.host;
    if (host !== new URL(origin).host || req.headers.origin && req.headers.origin !== origin
        || req.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(req.headers['sec-fetch-site'])
        || req.method !== 'GET') return send(403, error('resource_denied'));
    if (req.url?.length > 2048 || !req.url?.startsWith('/') || /[%\\\0]/.test(req.url) || /(?:^|\/)\.{1,2}(?:\/|\?|$)/.test(req.url)) return send(403, error('resource_denied'));
    const api = req.url.startsWith('/api/');
    if (!api) {
      const asset = staticAssets.get(req.url);
      return asset ? send(200, asset.bytes, asset.mime) : send(404, error('resource_denied'));
    }
    const supplied = req.headers['x-agdf-session'];
    if (typeof supplied !== 'string' || !/^[a-f0-9]{64}$/.test(supplied) || !timingSafeEqual(Buffer.from(supplied), secretBytes)) return send(401, error('session_invalid'));
    const url = new URL(req.url, origin);
    if (/[%.]/.test(url.pathname.slice(5))) return send(403, error('resource_denied'));
    let operation, selector;
    if (url.pathname === '/api/snapshot') operation = 'snapshot';
    else if (url.pathname === '/api/backlog-titles') operation = 'backlog_titles';
    else if (url.pathname === '/api/freshness') operation = 'freshness';
    else if (url.pathname === '/api/changes') operation = 'changes';
    else if (/^\/api\/runs\/[A-Za-z0-9_-]{1,128}$/.test(url.pathname)) { operation = 'run'; selector = url.pathname.slice(10); }
    else if (/^\/api\/context\/[A-Za-z0-9_-]{1,128}$/.test(url.pathname)) { operation = 'context'; selector = url.pathname.slice(13); }
    else if (/^\/api\/draft-check\/[A-Za-z0-9_-]{1,128}$/.test(url.pathname)) { operation = 'artifact_readiness'; selector = url.pathname.slice(17); }
    else if (/^\/api\/documents\/[a-f0-9-]{36}$/.test(url.pathname)) { operation = 'document'; selector = url.pathname.slice(15); }
    else return send(403, error('resource_denied'));
    const params = [...url.searchParams.keys()];
    const rowIds = url.searchParams.get('rows')?.split(',');
    const titleParams = operation === 'backlog_titles' && params.length === 2 && new Set(params).size === 2
      && params.includes('snapshot') && params.includes('rows') && /^[a-f0-9-]{36}$/.test(url.searchParams.get('snapshot') ?? '')
      && rowIds?.length >= 1 && rowIds.length <= 12 && new Set(rowIds).size === rowIds.length
      && rowIds.every(id => /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id));
    const draftParams = operation === 'artifact_readiness' && params.length === 3 && new Set(params).size === 3
      && ['snapshot', 'gate', 'expected_revision'].every(key => params.includes(key))
      && ['UR', 'PRD', 'SD', 'TP'].includes(url.searchParams.get('gate'))
      && ['snapshot', 'expected_revision'].every(key => /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(url.searchParams.get(key) ?? ''));
    if (operation === 'artifact_readiness' ? !draftParams : operation === 'backlog_titles' ? !titleParams : operation === 'snapshot' ? params.length > 1 || params.length === 1 && (params[0] !== 'run_id'
        || !/^[A-Za-z0-9_-]{1,128}$/.test(url.searchParams.get('run_id') ?? '')) : params.length !== 1 || params[0] !== 'snapshot'
      || !/^[a-f0-9-]{36}$/.test(url.searchParams.get('snapshot') ?? '')) return send(403, error('resource_denied'));
    const cancellation = new AbortController();
    res.once('close', () => { if (!res.writableEnded) cancellation.abort(); });
    try {
      const result = operation === 'changes' ? await pool.waitForChange(url.searchParams.get('snapshot'), cancellation.signal) : await pool.request({ operation, selector, snapshot: url.searchParams.get('snapshot'),
        input: operation === 'artifact_readiness' ? { run_id: selector, gate: url.searchParams.get('gate'), expected_revision_id: url.searchParams.get('expected_revision') }
          : operation === 'backlog_titles' ? { row_ids: rowIds } : operation === 'snapshot' && url.searchParams.has('run_id') ? { run_id: url.searchParams.get('run_id') } : undefined }, cancellation.signal);
      send(200, result);
    } catch (e) { send(e.code === 'busy' ? 429 : e.code === 'timeout' ? 504 : 409, error(['resource_denied', 'source_changed', 'read_failed', 'resource_limit', 'busy', 'timeout', 'cancelled'].includes(e.code) ? e.code : 'read_failed')); }
  });
  server.requestTimeout = 15_000; server.headersTimeout = 10_000;
  try {
    await new Promise((resolveListen, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolveListen); });
  } catch (e) { await pool.close(); throw e; }
  origin = `http://127.0.0.1:${server.address().port}`;
  return { origin, root, secret, startupURL: origin + '/#' + secret, pool,
    async close() { server.closeAllConnections(); await Promise.all([pool.close(), new Promise(resolveClose => server.close(resolveClose))]); } };
}
