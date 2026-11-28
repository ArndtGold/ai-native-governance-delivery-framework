import { createHash } from 'node:crypto';
import { constants, closeSync, fstatSync, lstatSync, openSync, readdirSync, readSync, realpathSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { atomicWrite, withOwnedFileLockWait } from '../owned-file-lock.js';

const file = 'mcp/executable-boot-boundary.json';
const owner = 'create-agdf:mcp-runtime';
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/u;
const digest = /^[a-f0-9]{64}$/u;
const keyPattern = /^mcp\/generations\/[a-f0-9]{64}\/(?:[0-9]+\.[0-9]+\.[0-9]+(?:[-+][A-Za-z0-9.-]+)?\/\.agdf-executable-claims\/[a-f0-9-]{36}\.json|\.agdf-publication\.lock(?:\.[a-f0-9-]{36}\.pending|\.reclaim)?)$/u;
const maxEntries = 32768;
const maxBytes = 12 * 1024 * 1024;
const stampOf = stat => `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeNs}:${stat.ctimeNs}`;
const stampPattern = /^\d+:\d+:\d+:-?\d+:-?\d+$/u;

// The MCP launcher imports this module, and bootstrap must not load Run-state modules
// (plugin-mcp-runtime-test). Names are slash-separated on every host; an absent
// component is safe, a link or an unreadable component is not.
function linkedPath(root, name) {
  const parts = typeof name === 'string' && !name.includes('\\') ? name.split('/') : [''];
  if (parts.some(part => !part || part === '.' || part === '..')) return true;
  let cursor = root;
  for (const part of parts) {
    cursor = join(cursor, part);
    try { if (lstatSync(cursor).isSymbolicLink()) return true; }
    catch (error) { return error.code !== 'ENOENT'; }
  }
  return false;
}

function read(root, name, limit, observe) {
  if (!isAbsolute(root) || lstatSync(root).isSymbolicLink() || realpathSync(root) !== resolve(root)) throw Error('executable_boundary_path_invalid');
  if (linkedPath(root, name)) throw Error('executable_boundary_path_invalid');
  const path = join(root, name);
  let fd;
  try {
    fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
    const stat = fstatSync(fd, { bigint: true }), named = lstatSync(path, { bigint: true });
    if (!stat.isFile() || named.isSymbolicLink() || stat.dev !== named.dev || stat.ino !== named.ino || stat.size > BigInt(limit))
      throw Error('executable_boundary_file_invalid');
    const bytes = Buffer.alloc(Number(stat.size) + 1);
    let offset = 0, count;
    while (offset < bytes.length && (count = readSync(fd, bytes, offset, bytes.length - offset, null)) > 0) offset += count;
    const after = fstatSync(fd, { bigint: true });
    if (BigInt(offset) !== stat.size || stat.size !== after.size || stat.mtimeNs !== after.mtimeNs || stat.ctimeNs !== after.ctimeNs)
      throw Error('executable_boundary_file_changed');
    observe?.(stampOf(after));
    return bytes.subarray(0, offset).toString('utf8');
  } finally { if (fd !== undefined) closeSync(fd); }
}

function load(dataRoot) {
  let text;
  try { text = read(dataRoot, file, maxBytes); }
  catch (error) { if (error.code === 'ENOENT') return new Map(); throw error; }
  const value = JSON.parse(text);
  if (![1, 2].includes(value?.schema_version) || value.owner !== owner || !Array.isArray(value.claims) || value.claims.length > maxEntries)
    throw Error('executable_boundary_invalid');
  const rows = new Map();
  for (const row of value.claims) {
    if (!Array.isArray(row) || row.length !== (value.schema_version === 1 ? 3 : 5)
      || !keyPattern.test(row[0]) || !digest.test(row[1]) || !uuid.test(row[2]) || rows.has(row[0])
      || value.schema_version === 2 && (typeof row[3] !== 'string' || row[3].length > 512 || !stampPattern.test(row[3])
        || ![null, 'codex-shared-v1'].includes(row[4])))
      throw Error('executable_boundary_invalid');
    rows.set(row[0], row);
  }
  return rows;
}

export const isExecutablePublicationEntry = name => /^\.agdf-publication\.lock(?:\.[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}\.pending|\.reclaim)?$/u.test(name);
const recordPath = (root, name) => isExecutablePublicationEntry(name) ? join(root, name) : join(root, '.agdf-executable-claims', name);

function claim(dataRoot, root, name) {
  if (isExecutablePublicationEntry(name)) {
    const key = relative(dataRoot, join(root, name)).replaceAll('\\', '/');
    if (!keyPattern.test(key)) throw Error('executable_publication_invalid');
    let stamp;
    const text = read(dataRoot, key, 4096, value => { stamp = value; });
    if (name.endsWith('.reclaim')) {
      if (text !== '') throw Error('executable_publication_invalid');
    } else {
      const value = JSON.parse(text);
      if (value?.schema_version !== 1 || !Number.isSafeInteger(value.pid) || value.pid < 1 || !uuid.test(value.token)
        || typeof value.started_at !== 'string' || !Number.isFinite(Date.parse(value.started_at))
        || name.endsWith('.pending') && name !== `.agdf-publication.lock.${value.token}.pending`) throw Error('executable_publication_invalid');
    }
    return { key, hash: createHash('sha256').update(text).digest('hex'), bootId: null, stamp };
  }
  if (!uuid.test(name.slice(0, -5)) || !name.endsWith('.json')) throw Error('executable_claim_invalid');
  const key = relative(dataRoot, join(root, '.agdf-executable-claims', name)).replaceAll('\\', '/');
  if (!keyPattern.test(key)) throw Error('executable_claim_invalid');
  let stamp;
  const text = read(dataRoot, key, 4096, value => { stamp = value; }), value = JSON.parse(text);
  const compatible = value?.schema_version === 2 && value.admission_protocol === 'codex-shared-v1';
  if (![1, 2].includes(value?.schema_version) || value.owner !== owner || value.root !== root
    || value.token !== name.slice(0, -5) || !uuid.test(value.owner_epoch) || !Number.isSafeInteger(value.generation) || value.generation < 1
    || ![value.server_digest, value.dispatcher_digest, value.sdk_digest].every(item => typeof item === 'string' && digest.test(item))
    || value.schema_version === 2 && !uuid.test(value.boot_id) && !(compatible && value.boot_id === null)) throw Error('executable_claim_invalid');
  return { key, hash: createHash('sha256').update(text).digest('hex'), bootId: value.schema_version === 2 ? value.boot_id : null, compatible, stamp };
}

// This is execution-lifetime evidence, separate from immutable package retention.
// Only a different OS boot proves that an observed executable cannot still run.
// No clock, PID guess, lost hook or timeout supplies that proof.
export function createExecutableBootBoundary(dataRoot, bootId) {
  let rows, checkpointStamp;
  const cache = new Map();
  const refresh = () => {
    try {
      if (!uuid.test(bootId)) throw Error();
      let stamp;
      try {
        const stat = lstatSync(join(dataRoot, file), { bigint: true });
        if (!stat.isFile() || stat.isSymbolicLink()) throw Error();
        stamp = stampOf(stat);
      } catch (error) { if (error.code !== 'ENOENT') throw error; stamp = 'absent'; }
      if (stamp !== checkpointStamp) { rows = load(dataRoot); checkpointStamp = stamp; cache.clear(); }
    } catch { rows = null; checkpointStamp = undefined; cache.clear(); }
  };
  refresh();
  const inspect = (root, name) => {
    try {
      const path = recordPath(root, name), stat = lstatSync(path, { bigint: true });
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 4096n) return 'unknown';
      const stamp = stampOf(stat);
      if (cache.get(path)?.stamp === stamp) return cache.get(path).state;
      const key = relative(dataRoot, path).replaceAll('\\', '/'), saved = rows?.get(key);
      // Nanosecond file metadata only validates the exact bytes already hashed
      // by the checkpoint. It is never an age, expiry or process-liveness test.
      if (saved?.[3] === stamp && uuid.test(bootId)) {
        const state = saved[4] === 'codex-shared-v1' ? 'compatible' : saved[2] === bootId ? 'same_boot' : 'ended';
        cache.set(path, { stamp, state }); return state;
      }
      const actual = claim(dataRoot, root, name), recorded = rows?.get(actual.key);
      const observedBoot = actual.bootId ?? (recorded?.[1] === actual.hash ? recorded[2] : null);
      const state = actual.compatible ? 'compatible'
        : rows && observedBoot && uuid.test(bootId) ? observedBoot === bootId ? 'same_boot' : 'ended' : 'unknown';
      cache.set(path, { stamp: actual.stamp, state });
      return state;
    } catch { return 'unknown'; }
  };
  return Object.assign(inspect, { refresh });
}

// Launcher/installer maintenance only. Capturing a claim does not retire it or
// release any Run. Preserve its first observed boot across repeated captures.
export function checkpointExecutableBootBoundary(dataRoot, bootId) {
  if (!uuid.test(bootId)) return { state: 'unavailable' };
  if (linkedPath(dataRoot, 'mcp/generations') || linkedPath(dataRoot, file)) throw Error('executable_boundary_path_invalid');
  let generations;
  try { generations = readdirSync(join(dataRoot, 'mcp/generations')); }
  catch (error) { if (error.code === 'ENOENT') return { state: 'unchanged', captured: 0 }; throw error; }
  return withOwnedFileLockWait(join(dataRoot, file), () => {
    const prior = load(dataRoot), rows = [];
    let unknown = 0, seen = 0;
    const capture = (root, name) => {
      try {
        const actual = claim(dataRoot, root, name), old = prior.get(actual.key);
        rows.push([actual.key, actual.hash, actual.bootId ?? (old?.[1] === actual.hash ? old[2] : bootId),
          actual.stamp, actual.compatible ? 'codex-shared-v1' : null]);
      } catch { unknown++; }
    };
    if (generations.length > 512) throw Error('executable_boundary_capacity');
    for (const generation of generations) {
      if (!digest.test(generation)) throw Error('executable_boundary_path_invalid');
      const path = `mcp/generations/${generation}`;
      if (linkedPath(dataRoot, path)) throw Error('executable_boundary_path_invalid');
      const versions = readdirSync(join(dataRoot, path));
      if (versions.length > 32) throw Error('executable_boundary_capacity');
      for (const version of versions) {
        if (isExecutablePublicationEntry(version)) {
          if (++seen > maxEntries) throw Error('executable_boundary_capacity');
          capture(join(dataRoot, path), version);
          continue;
        }
        const root = join(dataRoot, path, version), claims = `${path}/${version}/.agdf-executable-claims`;
        if (linkedPath(dataRoot, claims)) throw Error('executable_boundary_path_invalid');
        let names;
        try { names = readdirSync(join(dataRoot, claims)); }
        catch (error) { if (error.code === 'ENOENT') continue; throw error; }
        if ((seen += names.length) > maxEntries) throw Error('executable_boundary_capacity');
        for (const name of names) capture(root, name);
      }
    }
    rows.sort((a, b) => a[0].localeCompare(b[0]));
    const content = JSON.stringify({ schema_version: 2, owner, claims: rows });
    if (Buffer.byteLength(content) > maxBytes) throw Error('executable_boundary_capacity');
    atomicWrite(join(dataRoot, file), content);
    return { state: 'checkpointed', captured: rows.length, unknown };
  }, { waitMs: 250 });
}
