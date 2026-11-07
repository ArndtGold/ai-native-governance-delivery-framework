import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmdirSync, unlinkSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { atomicWrite, fsyncDirectory, withOwnedFileLock } from '#agdf-core/owned-file-lock.js';
import { renameSyncWithRetry } from '#agdf-core/fs-swap.js';

const OWNER = 'agdf-prepared-calls-v1', DIRECTORY = 'prepared-calls';
const MARKER = 'owner.json', KEY = 'key', RECORD = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\.json$/u;
// Each live connection still has its original 256-entry Map. The shared
// journal accommodates four such producers without silently evicting live IDs.
const DIGEST = /^[0-9a-f]{64}$/u, LIMIT = 65_536, LIFETIME = 30 * 60_000, CAPACITY = 1024;
const MAX_NAMESPACES = 16, MAX_BYTES = 64 * 1024 * 1024;
const bad = () => { throw Error('runtime_provenance_invalid'); };
const sha = text => createHash('sha256').update(text).digest('hex');
const json = value => JSON.stringify(value);
function privatePath(path, directory = false) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || (directory ? !stat.isDirectory() : !stat.isFile() || stat.nlink !== 1)
      || realpathSync(path) !== resolve(path)
      || process.getuid && stat.uid !== process.getuid()
      || process.platform !== 'win32' && (stat.mode & 0o077)) bad();
  return stat;
}
function boundedRead(path, limit) {
  if (privatePath(path).size > limit) bad();
  return readFileSync(path);
}
function identityOf(identity) {
  if (!identity || Object.keys(identity).sort().join() !== 'dispatcher_digest,sdk_digest,server_digest,surface,version'
      || !['codex', 'claude', 'copilot', 'opencode'].includes(identity.surface)
      || typeof identity.version !== 'string' || !identity.version || identity.version.length > 128
      || !['server_digest', 'dispatcher_digest', 'sdk_digest'].every(key => DIGEST.test(identity[key] ?? ''))) bad();
  return { surface: identity.surface, version: identity.version, server_digest: identity.server_digest,
    dispatcher_digest: identity.dispatcher_digest, sdk_digest: identity.sdk_digest };
}
function assertOwner(root) {
  privatePath(root, true);
  if (boundedRead(join(root, MARKER), 256).toString() !== json({ schema_version: 1, owner: OWNER })) bad();
}
function readNamespace(root, namespace) {
  const dir = join(root, namespace); privatePath(dir, true);
  const identity = JSON.parse(boundedRead(join(dir, MARKER), 2048));
  if (identity.schema_version !== 1 || identity.owner !== OWNER || Object.keys(identity).sort().join() !== 'created,identity,owner,schema_version'
      || !Number.isSafeInteger(identity.created) || identity.created < 0
      || sha(json(identityOf(identity.identity))) !== namespace) bad();
  const key = boundedRead(join(dir, KEY), 32); if (key.length !== 32) bad();
  return { dir, key, created: identity.created };
}
const signature = (key, row) => createHmac('sha256', key).update(json(row)).digest('hex');
function readEntry(dir, name, key, namespace) {
  if (!RECORD.test(name)) bad();
  const record = JSON.parse(boundedRead(join(dir, name), 2 * LIMIT + 4096));
  const { mac, ...row } = record;
  if (!DIGEST.test(mac ?? '') || !timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(signature(key, row), 'hex'))
      || row.schema_version !== 1 || row.namespace !== namespace || name !== row.id + '.json'
      || !Number.isSafeInteger(row.created) || row.created < 0 || !['available', 'expired'].includes(row.state)) bad();
  const fields = row.state === 'available' ? 'created,id,namespace,schema_version,signature,state,value'
    : 'created,id,namespace,schema_version,state';
  if (Object.keys(row).sort().join() !== fields) bad();
  if (row.state === 'available' && (typeof row.value !== 'string' || Buffer.byteLength(row.value) > LIMIT
      || !DIGEST.test(row.signature ?? '') || sha(row.value) !== row.signature)) bad();
  return row;
}
function inspectRoot(publisherRoot) {
  assertPublisherRoot(publisherRoot);
  const root = join(publisherRoot, DIRECTORY);
  if (!existsSync(root)) return 'absent';
  assertOwner(root);
  const namespaces = readdirSync(root).filter(name => name !== MARKER);
  if (namespaces.length > MAX_NAMESPACES) bad();
  let bytes = privatePath(join(root, MARKER)).size;
  for (const namespace of namespaces) {
    if (namespace === MARKER) continue;
    if (!DIGEST.test(namespace)) bad();
    const { dir, key } = readNamespace(root, namespace);
    const names = readdirSync(dir);
    if (names.length > 2 * CAPACITY + 2) bad();
    let active = 0, expired = 0;
    for (const name of names) {
      bytes += privatePath(join(dir, name)).size;
      if ([MARKER, KEY].includes(name)) continue;
      const row = readEntry(dir, name, key, namespace);
      row.state === 'available' ? active++ : expired++;
    }
    if (active > CAPACITY || expired > CAPACITY) bad();
  }
  if (bytes > MAX_BYTES) bad();
  return 'owned';
}
export function inspectPreparedCallJournals(publisherRoot) {
  try { return inspectRoot(publisherRoot); } catch { return 'foreign'; }
}

function locked(publisherRoot, operation) {
  assertPublisherRoot(publisherRoot);
  const deadline = performance.now() + 5550;
  for (;;) {
    try { return withOwnedFileLock(join(publisherRoot, '.agdf-prepared-calls'), () => { assertPublisherRoot(publisherRoot); return operation(); }); }
    catch (error) {
      if (error?.message !== 'AGDF_RUN_WRITE_LOCKED') throw error;
      if (error.lock_owner_status !== 'live') bad();
      if (performance.now() >= deadline) throw Error('dispatch_busy');
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
    }
  }
}
function assertPublisherRoot(root) {
  const stat = lstatSync(root);
  if (!stat.isDirectory() || stat.isSymbolicLink() || realpathSync(root) !== root
      || process.getuid && stat.uid !== process.getuid()) bad();
}
function normalizedError(error) {
  if (['runtime_provenance_invalid', 'dispatch_busy'].includes(error?.message)) return error;
  return Error('prepared_call_store_unavailable');
}

// The publisher supplies the root and immutable producer identity. No tool
// argument can select this storage; constructing/discovering a server writes nothing.
export function createPreparedCallJournal({ publisherRoot, identity, now = Date.now,
  lifetimeMs = LIFETIME, maxEntries = CAPACITY, maxBytes = MAX_BYTES, checkpoint = () => {} } = {}) {
  const canonical = realpathSync(publisherRoot);
  if (canonical !== publisherRoot || lstatSync(canonical).isSymbolicLink()
      || !Number.isSafeInteger(lifetimeMs) || lifetimeMs <= 0 || lifetimeMs > LIFETIME
      || !Number.isSafeInteger(maxEntries) || maxEntries <= 0 || maxEntries > CAPACITY
      || !Number.isSafeInteger(maxBytes) || maxBytes <= 0 || maxBytes > MAX_BYTES) bad();
  assertPublisherRoot(canonical);
  identity = identityOf(identity);
  const namespace = sha(json(identity)), root = join(canonical, DIRECTORY), dir = join(root, namespace);
  const publish = (row, key) => atomicWrite(join(dir, row.id + '.json'), json({ ...row, mac: signature(key, row) }));
  function publishDirectory(target, contents, point) {
    const stage = join(canonical, '.agdf-prepared-stage-' + randomUUID());
    mkdirSync(stage, { mode: 0o700 }); const owned = lstatSync(stage);
    try {
      for (const [name, value] of Object.entries(contents)) atomicWrite(join(stage, name), value);
      checkpoint(point);
      if (existsSync(target)) bad();
      renameSyncWithRetry(stage, target); fsyncDirectory(dirname(target));
    } finally {
      if (existsSync(stage)) {
        const current = lstatSync(stage);
        // A hard-killed unconfirmed sibling stage is retained by lifecycle
        // inspection. Ordinary rollback removes only our same, unchanged inode
        // and the exact initialization bytes authored by this invocation.
        if (!current.isSymbolicLink() && current.dev === owned.dev && current.ino === owned.ino) {
          for (const [name, value] of Object.entries(contents)) {
            const file = join(stage, name);
            if (existsSync(file) && boundedRead(file, 4096).equals(Buffer.from(value))) unlinkSync(file);
          }
          if (!readdirSync(stage).length) rmdirSync(stage);
        }
      }
    }
  }
  function removeNamespace(target) {
    for (const name of readdirSync(target)) unlinkSync(join(target, name));
    rmdirSync(target);
  }
  function pruneNamespaces(time) {
    if (inspectRoot(canonical) !== 'owned') bad();
    for (const name of readdirSync(root).filter(name => name !== MARKER)) {
      const scope = readNamespace(root, name), rows = readdirSync(scope.dir).filter(file => ![MARKER, KEY].includes(file))
        .map(file => readEntry(scope.dir, file, scope.key, name));
      // Keep one further lifetime of signed tombstones. Never delete a live
      // call from another candidate merely to make room for the current one.
      const latest = Math.max(scope.created, ...rows.map(row => row.created));
      if (name !== namespace && time - latest >= 2 * LIFETIME) removeNamespace(scope.dir);
    }
  }
  function size() {
    return privatePath(join(root, MARKER)).size + readdirSync(root).filter(name => name !== MARKER).reduce((total, name) => {
      const target = join(root, name);
      return total + readdirSync(target).reduce((bytes, file) => bytes + privatePath(join(target, file)).size, 0);
    }, 0);
  }
  function open(create = false, reserveBytes = 0) {
    if (!existsSync(root)) {
      if (!create) return null;
      publishDirectory(root, { [MARKER]: json({ schema_version: 1, owner: OWNER }) }, 'root_staged');
    }
    assertOwner(root);
    if (!existsSync(dir)) {
      if (!create) return null;
      // Verifying and pruning every namespace is costly; it runs only when a new
      // namespace competes for the shared budget, not on every registration.
      pruneNamespaces(now());
      const marker = json({ schema_version: 1, owner: OWNER, identity, created: now() });
      if (readdirSync(root).length - 1 >= MAX_NAMESPACES || size() + Buffer.byteLength(marker) + 32 + reserveBytes > maxBytes) return null;
      publishDirectory(dir, { [MARKER]: marker, [KEY]: randomBytes(32) }, 'namespace_staged');
    }
    return readNamespace(root, namespace);
  }
  function entries(key) {
    const names = readdirSync(dir).filter(name => ![MARKER, KEY].includes(name));
    if (names.length > 2 * CAPACITY) bad();
    return names.map(name => readEntry(dir, name, key, namespace));
  }
  function expire(rows, key, time) {
    for (let index = 0; index < rows.length; index++) if (rows[index].state === 'available' && time - rows[index].created >= lifetimeMs) {
      const old = rows[index], row = { schema_version: 1, namespace, id: old.id, created: old.created, state: 'expired' };
      publish(row, key); rows[index] = row;
    }
    const expired = rows.filter(row => row.state === 'expired').sort((a, b) => b.created - a.created || a.id.localeCompare(b.id));
    for (const row of expired.slice(maxEntries)) { unlinkSync(join(dir, row.id + '.json')); rows.splice(rows.indexOf(row), 1); }
  }
  function run(create, operation, reserveBytes = 0) {
    try {
      // Absent reads do not create lock/marker directories during discovery.
      if (!create && !existsSync(root)) return { state: 'reference_unknown' };
      return locked(canonical, () => { const opened = open(create, reserveBytes); return opened ? operation(opened.key) : create ? null : { state: 'reference_unknown' }; });
    } catch (error) { throw normalizedError(error); }
  }
  return Object.freeze({
    register({ value, signature: digest, created }) {
      if (typeof value !== 'string' || Buffer.byteLength(value) > LIMIT || digest !== sha(value)
          || !Number.isSafeInteger(created) || created < 0) bad();
      const estimate = Buffer.byteLength(json({ schema_version: 1, namespace, id: '00000000-0000-4000-8000-000000000000', created,
        state: 'available', signature: digest, value, mac: '0'.repeat(64) }));
      return run(true, key => {
        const rows = entries(key), time = now(); expire(rows, key, time);
        const previous = rows.find(row => row.state === 'available' && row.signature === digest && row.value === value);
        if (previous) return { id: previous.id, created: previous.created };
        if (rows.filter(row => row.state === 'available').length >= maxEntries) return null;
        // Stale candidate namespaces are reclaimed only when the shared byte budget is reached.
        if (size() + estimate > maxBytes) pruneNamespaces(time);
        if (size() + estimate > maxBytes) return null;
        const row = { schema_version: 1, namespace, id: randomUUID(), created, state: 'available', signature: digest, value };
        publish(row, key); return { id: row.id, created: row.created };
      }, estimate);
    },
    load(id) {
      if (!RECORD.test(id + '.json')) return { state: 'reference_unknown' };
      return run(false, key => {
        const file = join(dir, id + '.json');
        if (!existsSync(file)) return { state: 'reference_unknown' };
        let row = readEntry(dir, id + '.json', key, namespace);
        if (row.state === 'available' && now() - row.created >= lifetimeMs) {
          const rows = entries(key); expire(rows, key, now()); row = rows.find(value => value.id === id);
        }
        return row?.state === 'available' ? { state: 'available', value: row.value, signature: row.signature, created: row.created }
          : { state: 'reference_expired' };
      });
    },
  });
}

// Called only after the plugin owner has retired its executable generations.
// Never adopts unknown records or follows a foreign/symlink entry for cleanup.
export function retirePreparedCallJournals(publisherRoot) {
  const root = join(publisherRoot, DIRECTORY);
  if (!existsSync(root)) return;
  locked(publisherRoot, () => {
    // The lifecycle owner removed generations before acquiring this lock. A
    // concurrent preparer can recreate it in that gap; retain every reference
    // if any new generation node is present, even before it is fully published.
    let generations;
    try { generations = lstatSync(join(publisherRoot, 'generations')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (generations) throw Error('AGDF_MCP_RUNTIME_RETAINED');
    if (inspectRoot(publisherRoot) !== 'owned') bad();
    for (const namespace of readdirSync(root).filter(name => name !== MARKER)) {
      const dir = join(root, namespace);
      for (const name of readdirSync(dir)) unlinkSync(join(dir, name));
      rmdirSync(dir);
    }
    // The owner marker goes last: an interrupted cleanup still leaves a
    // verifiable owned root instead of unmarked namespaces.
    unlinkSync(join(root, MARKER)); rmdirSync(root);
  });
}
