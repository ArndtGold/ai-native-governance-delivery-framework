import * as fs from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { withControlReadView } from './fs.js';

export const READ_LIMITS = Object.freeze({ files: 20_000, total: 256 * 1024 ** 2, file: 32 * 1024 ** 2,
  preview: 2 * 1024 ** 2, response: 8 * 1024 ** 2, timeout: 10_000 });
export class ControlReadError extends Error {
  constructor(code) { super(code); this.code = code; }
}
export const fail = code => { throw new ControlReadError(code); };
const hash = value => createHash('sha256').update(value).digest('hex');
const keyOf = value => resolve(value instanceof URL ? fileURLToPath(value) : String(value));
const identity = s => `${s.dev}:${s.ino}:${s.mode}`;
const signature = s => `${identity(s)}:${s.size}:${s.mtimeNs}:${s.ctimeNs}`;

// Both broad and dependency captures use the same bounded descriptor read.
function capturedFile(path, before, deadline, verifyAncestors, checkpoint) {
  const check = () => { if (Date.now() > deadline) fail('timeout'); };
  verifyAncestors(path);
  let fd;
  try {
    fd = fs.openSync(path, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
    const opened = fs.fstatSync(fd, { bigint: true });
    if (signature(before) !== signature(opened) || !opened.isFile()) fail('source_changed');
    const bytes = Buffer.alloc(Number(opened.size));
    let offset = 0;
    while (offset < bytes.length) {
      check(); const read = fs.readSync(fd, bytes, offset, Math.min(64 * 1024, bytes.length - offset), offset);
      if (!read) fail('source_changed'); offset += read;
    }
    const extra = Buffer.alloc(1);
    if (fs.readSync(fd, extra, 0, 1, offset) || signature(opened) !== signature(fs.fstatSync(fd, { bigint: true }))) fail('source_changed');
    checkpoint?.('file_read', path);
    const after = fs.lstatSync(path, { bigint: true });
    verifyAncestors(path);
    if (signature(opened) !== signature(after)) fail('source_changed');
    return { stats: opened, kind: 'file', bytes, digest: hash(bytes), signature: signature(opened) };
  } finally { if (fd !== undefined) fs.closeSync(fd); }
}

// Bounded synchronous reads execute only inside the dedicated read worker in the service.
function collect(root, limits, deadline, checkpoint) {
  const control = join(root, '.agdf', 'control'), entries = new Map();
  let total = 0, files = 0, nodes = 0;
  const check = () => { if (Date.now() > deadline) fail('timeout'); };
  function directory(path, anchor = false) {
    check();
    const stats = fs.lstatSync(path, { bigint: true });
    if (!stats.isDirectory() || stats.isSymbolicLink()) fail('resource_denied');
    const record = { stats, kind: 'directory', signature: anchor ? identity(stats) : signature(stats), children: [] };
    entries.set(path, record);
    return record;
  }
  const rootEntry = directory(root, true);
  const agdf = join(root, '.agdf');
  const absent = path => {
    try { fs.lstatSync(path); return false; }
    catch (error) { if (error.code === 'ENOENT') return true; throw error; }
  };
  if (absent(agdf)) { rootEntry.children = []; return { entries, total, files, absent: true }; }
  const agdfEntry = directory(agdf, true); rootEntry.children = ['.agdf'];
  if (absent(control)) return { entries, total, files, absent: true };
  agdfEntry.children = ['control'];
  function verifyAncestors(path) {
    if (path === root) return;
    for (let cursor = dirname(path); ; cursor = dirname(cursor)) {
      const before = entries.get(cursor);
      const now = fs.lstatSync(cursor, { bigint: true });
      if (!before || now.isSymbolicLink() || !now.isDirectory() || identity(now) !== identity(before.stats)) fail('source_changed');
      if (cursor === root) break;
    }
  }
  function walk(path, depth = 0) {
    if (depth > 128 || ++nodes > limits.files * 2 + 16) fail('resource_limit');
    const record = directory(path);
    record.children = fs.readdirSync(path).sort();
    for (const name of record.children) {
      check(); const child = join(path, name), before = fs.lstatSync(child, { bigint: true });
      if (before.isSymbolicLink()) fail('resource_denied');
      if (before.isDirectory()) { walk(child, depth + 1); continue; }
      if (!before.isFile()) fail('resource_denied');
      if (++files > limits.files || before.size > BigInt(limits.file) || total + Number(before.size) > limits.total) fail('resource_limit');
      const entry = capturedFile(child, before, deadline, verifyAncestors, checkpoint);
      entries.set(child, entry); total += entry.bytes.length;
    }
    if (signature(record.stats) !== signature(fs.lstatSync(path, { bigint: true }))) fail('source_changed');
  }
  walk(control);
  return { entries, total, files, absent: false };
}

function fingerprint(root, capture) {
  return hash(JSON.stringify([...capture.entries].map(([path, e]) => [relative(root, path), e.signature, e.digest ?? e.children])));
}
function observation(root, limits, deadline, checkpoint) {
  try { return collect(root, limits, deadline, checkpoint); }
  catch (error) {
    if (error instanceof ControlReadError) throw error;
    if (['ENOENT', 'ENOTDIR', 'ELOOP'].includes(error.code)) fail('source_changed');
    fail('read_failed');
  }
}
function statCopy(entry, bigint = false) {
  const s = entry.stats;
  const result = {};
  for (const key of ['dev', 'ino', 'mode', 'nlink', 'uid', 'gid', 'rdev', 'size', 'blksize', 'blocks', 'atimeMs', 'mtimeMs', 'ctimeMs', 'birthtimeMs'])
    result[key] = bigint ? s[key] : Number(s[key]);
  for (const key of ['atime', 'mtime', 'ctime', 'birthtime']) result[key] = new Date(Number(s[key + 'Ms']));
  if (bigint) for (const key of ['atimeNs', 'mtimeNs', 'ctimeNs', 'birthtimeNs']) result[key] = s[key];
  for (const name of ['File', 'Directory', 'SymbolicLink', 'BlockDevice', 'CharacterDevice', 'FIFO', 'Socket'])
    result['is' + name] = () => name.toLowerCase() === entry.kind;
  return result;
}

export function captureControl(rootInput, options = {}) {
  const root = fs.realpathSync(resolve(rootInput));
  if (!fs.lstatSync(resolve(rootInput)).isDirectory() || fs.lstatSync(resolve(rootInput)).isSymbolicLink()) fail('resource_denied');
  const limits = { ...READ_LIMITS, ...options.limits }, deadline = Date.now() + limits.timeout;
  let capture, digest, lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      capture = observation(root, limits, deadline, options.checkpoint);
      options.checkpoint?.('captured', root);
      digest = fingerprint(root, capture);
      if (digest !== fingerprint(root, observation(root, limits, deadline))) fail('source_changed');
      lastError = null; break;
    } catch (error) { lastError = error; if (error.code !== 'source_changed') throw error; }
  }
  if (lastError) throw lastError;
  const entries = capture.entries, control = join(root, '.agdf', 'control'), decoded = new Map();
  let violated = false;
  function allowed(path) {
    if (path === root || path === join(root, '.agdf') || path === control || path.startsWith(control + sep)) return;
    violated = true; fail('resource_denied');
  }
  function get(input) {
    const path = keyOf(input); allowed(path);
    const entry = entries.get(path);
    if (!entry) throw Object.assign(new Error('Captured entry absent'), { code: 'ENOENT' });
    return { path, entry };
  }
  const snapshotId = randomUUID(), capturedAt = new Date().toISOString();
  const view = {
    root, snapshot_id: snapshotId, observed_as_of: capturedAt, digest,
    control_absent: capture.absent, file_count: capture.files, byte_count: capture.total,
    assertBoundary: () => { if (violated) fail('resource_denied'); },
    existsSync(input) { const path = keyOf(input); allowed(path); return entries.has(path); },
    readFileSync(input, encoding) {
      const { entry } = get(input); if (entry.kind !== 'file') throw Object.assign(Error('Is directory'), { code: 'EISDIR' });
      const format = typeof encoding === 'object' ? encoding.encoding : encoding;
      if (!format) return Buffer.from(entry.bytes);
      let formats = decoded.get(entry);
      if (!formats) { formats = new Map(); decoded.set(entry, formats); }
      if (!formats.has(format)) formats.set(format, entry.bytes.toString(format));
      return formats.get(format);
    },
    statSync(input, options) { return statCopy(get(input).entry, options?.bigint); },
    lstatSync(input, options) { return statCopy(get(input).entry, options?.bigint); },
    realpathSync(input) { return get(input).path; },
    readdirSync(input, options) {
      const { path, entry } = get(input); if (entry.kind !== 'directory') throw Object.assign(Error('Not directory'), { code: 'ENOTDIR' });
      return entry.children.map(name => options?.withFileTypes
        ? { name, parentPath: path, ...statCopy(entries.get(join(path, name))) } : name);
    },
    revalidate() {
      if (fingerprint(root, observation(root, limits, Date.now() + limits.timeout)) !== digest) fail('source_changed');
      return true;
    },
  };
  return Object.freeze(view);
}

// Record one existing Core operation, then replay it from its frozen dependencies.
// Callers never supply a path allowlist or substitute missing policy inputs.
export function captureControlScope(rootInput, project, options = {}) {
  const input = resolve(rootInput), root = fs.realpathSync(input);
  if (!fs.lstatSync(input).isDirectory() || fs.lstatSync(input).isSymbolicLink()) fail('resource_denied');
  const control = join(root, '.agdf', 'control'), limits = { ...READ_LIMITS, ...options.limits };
  const deadline = Date.now() + limits.timeout, entries = new Map();
  let total = 0, files = 0, frozen = false, building = true, fatal = null, sourceDigest = null;
  const absentError = code => Object.assign(Error('Observed entry absent'), { code });
  const guard = work => {
    if (fatal) throw fatal;
    try { return work(); }
    catch (error) {
      if (!['ENOENT', 'ENOTDIR', 'EISDIR', 'EINVAL'].includes(error.code)) {
        fatal = error instanceof ControlReadError ? error
          : new ControlReadError(['EACCES', 'EPERM', 'ELOOP'].includes(error.code) ? 'resource_denied' : 'read_failed');
        throw fatal;
      }
      throw error;
    }
  };
  function check() { if (building && Date.now() > deadline) fail('timeout'); }
  function pathOf(value) {
    check(); const path = keyOf(value);
    if (path !== root && path !== join(root, '.agdf') && path !== control && !path.startsWith(control + sep)) fail('resource_denied');
    if (relative(control, path).split(sep).length > 128) fail('resource_limit');
    return path;
  }
  function verifyAncestors(path) {
    if (path === root) return;
    for (let cursor = dirname(path); ; cursor = dirname(cursor)) {
      const before = entries.get(cursor), now = fs.lstatSync(cursor, { bigint: true });
      if (!before || before.kind !== 'directory' || now.isSymbolicLink() || !now.isDirectory()
        || identity(now) !== identity(before.stats)) fail('source_changed');
      if (cursor === root) break;
    }
  }
  function observe(path, optional = false) {
    if (entries.has(path)) {
      const entry = entries.get(path);
      if (entry.kind === 'denied' && !optional) fail('resource_denied');
      return entry;
    }
    // Descendants of an observed denied ancestor were intentionally not traversed.
    // Replay may return that same denial without introducing a new dependency.
    if (optional) for (let ancestor = dirname(path); ancestor.startsWith(root); ancestor = dirname(ancestor)) {
      const denied = entries.get(ancestor);
      if (denied?.kind === 'denied') return denied;
      if (ancestor === root) break;
    }
    if (frozen) fail('source_changed');
    if (entries.size >= limits.files * 2 + 16) fail('resource_limit');
    if (path !== root) {
      const parent = observe(dirname(path), optional);
      // An optional source may report a denied ancestor, but never traverse it.
      if (parent.kind === 'denied') return parent;
      if (parent.kind === 'directory') verifyAncestors(path);
    }
    let stats;
    try { stats = fs.lstatSync(path, { bigint: true }); }
    catch (error) {
      if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error;
      const record = { kind: 'absent', code: error.code };
      entries.set(path, record); options.checkpoint?.('dependency', path);
      return record;
    }
    if (stats.isSymbolicLink() || !stats.isDirectory() && !stats.isFile()) {
      if (!optional) fail('resource_denied');
      const entry = { stats, kind: 'denied', signature: signature(stats) };
      entries.set(path, entry); options.checkpoint?.('dependency', path);
      return entry;
    }
    const record = { stats, kind: stats.isDirectory() ? 'directory' : 'file',
      signature: stats.isDirectory() ? identity(stats) : signature(stats) };
    entries.set(path, record); options.checkpoint?.('dependency', path);
    return record;
  }
  function get(value) {
    const path = pathOf(value), entry = observe(path);
    if (entry.kind === 'absent') throw absentError(entry.code);
    return { path, entry };
  }
  const methods = {
    readOptionalFileSync(value, maximum = limits.preview) {
      const path = pathOf(value), entry = observe(path, true);
      if (entry.kind === 'denied') return { code: 'resource_denied', bytes: null };
      if (entry.kind === 'absent') return { code: 'document_missing', bytes: null };
      if (entry.kind !== 'file') return { code: 'document_unsupported', bytes: null };
      if (entry.stats.size > BigInt(maximum)) return { code: 'resource_limit', bytes: null };
      return { code: null, bytes: methods.readFileSync(path) };
    },
    existsSync(value) { return observe(pathOf(value)).kind !== 'absent'; },
    readFileSync(value, encoding) {
      const { path, entry } = get(value);
      if (entry.kind !== 'file') throw absentError('EISDIR');
      if (!entry.bytes) {
        if (frozen) fail('source_changed');
        if (files + 1 > limits.files || entry.stats.size > BigInt(limits.file)
          || total + Number(entry.stats.size) > limits.total) fail('resource_limit');
        Object.assign(entry, capturedFile(path, entry.stats, deadline, verifyAncestors, options.checkpoint));
        files++; total += entry.bytes.length;
      }
      const format = typeof encoding === 'object' ? encoding?.encoding : encoding;
      return format ? entry.bytes.toString(format) : Buffer.from(entry.bytes);
    },
    statSync(value, opts) {
      const { entry } = get(value);
      if (entry.kind === 'directory' && !entry.statObserved) {
        if (frozen) fail('source_changed');
        entry.statObserved = true; entry.signature = signature(entry.stats);
      }
      return statCopy(entry, opts?.bigint);
    },
    lstatSync(value, opts) { return methods.statSync(value, opts); },
    realpathSync(value) { return get(value).path; },
    readdirSync(value, opts) {
      const { path, entry } = get(value);
      if (entry.kind !== 'directory') throw absentError('ENOTDIR');
      if (!entry.children) {
        if (frozen) fail('source_changed');
        verifyAncestors(path);
        entry.children = fs.readdirSync(path).sort();
        if (entry.children.length > limits.files * 2 + 16) fail('resource_limit');
        options.checkpoint?.('directory_read', path);
        if (identity(fs.lstatSync(path, { bigint: true })) !== identity(entry.stats)) fail('source_changed');
        verifyAncestors(path);
      }
      return entry.children.map(name => opts?.withFileTypes
        ? { name, parentPath: path, ...statCopy(get(join(path, name)).entry) } : name);
    },
  };
  function revalidate(until = Date.now() + limits.timeout) {
    return guard(() => {
      for (const [path, entry] of entries) {
        if (Date.now() > until) fail('timeout');
        let now;
        try { now = fs.lstatSync(path, { bigint: true }); }
        catch (error) {
          if (entry.kind === 'absent' && error.code === entry.code) continue;
          if (['ENOENT', 'ENOTDIR'].includes(error.code)) fail('source_changed');
          throw error;
        }
        if (entry.kind === 'denied') {
          if (signature(now) !== entry.signature || (!now.isSymbolicLink() && (now.isFile() || now.isDirectory()))) fail('source_changed');
          continue;
        }
        if (entry.kind === 'absent' || now.isSymbolicLink()
          || (entry.kind === 'directory' && !now.isDirectory()) || (entry.kind === 'file' && !now.isFile())) fail('source_changed');
        const current = entry.kind === 'directory' && !entry.statObserved ? identity(now) : signature(now);
        if (entry.signature !== current) fail('source_changed');
        if (entry.children) {
          verifyAncestors(path);
          if (JSON.stringify(fs.readdirSync(path).sort()) !== JSON.stringify(entry.children)
            || identity(fs.lstatSync(path, { bigint: true })) !== identity(entry.stats)) fail('source_changed');
        }
        if (entry.bytes && capturedFile(path, entry.stats, until, verifyAncestors).digest !== entry.digest) fail('source_changed');
      }
      // Check containment anchors again after child/absence observations.
      for (const [path, entry] of entries) {
        if (Date.now() > until) fail('timeout');
        if (entry.kind === 'directory') {
          const now = fs.lstatSync(path, { bigint: true });
          if (!now.isDirectory() || now.isSymbolicLink() || identity(now) !== identity(entry.stats)) fail('source_changed');
        }
      }
      return true;
    });
  }
  function makeView() {
    const view = { root, snapshot_id: randomUUID(), observed_as_of: new Date().toISOString(),
      get digest() { return sourceDigest; },
      get control_absent() { return guard(() => observe(control).kind === 'absent'); },
      get file_count() { return files; }, get byte_count() { return total; },
      // Private dependency inventory for change hints; never an API filesystem selector.
      get dependencies() { return [...entries].flatMap(([path, entry]) =>
        entry.kind === 'directory' ? entry.children || entry.statObserved ? [{ path, directory: true }] : [] : [{ path, directory: false }]); },
      assertBoundary() { if (fatal) throw fatal; }, revalidate,
    };
    for (const [name, method] of Object.entries(methods)) view[name] = (...args) => guard(() => method(...args));
    return Object.freeze(view);
  }
  const recording = makeView();
  const recorded = withControlReadView(recording, () => project(recording));
  if (recorded?.then) fail('read_failed');
  recording.assertBoundary(); options.checkpoint?.('captured', root);
  frozen = true; revalidate(deadline);
  sourceDigest = hash(JSON.stringify([...entries].sort(([a], [b]) => a.localeCompare(b))
    .map(([path, entry]) => [relative(root, path), entry.kind, entry.signature ?? entry.code, entry.digest ?? null, entry.children ?? null])));
  // New view identity also gives the replay a fresh memo cache in the FS seam.
  const view = makeView(); options.checkpoint?.('replay', root);
  const data = withControlReadView(view, () => project(view));
  if (data?.then) fail('read_failed');
  view.assertBoundary(); options.checkpoint?.('published', root); revalidate(deadline);
  building = false;
  return Object.freeze({ view, data });
}
