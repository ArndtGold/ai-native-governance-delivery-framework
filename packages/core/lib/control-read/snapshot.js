import * as fs from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';

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
      verifyAncestors(child);
      let fd;
      try {
        fd = fs.openSync(child, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
        const opened = fs.fstatSync(fd, { bigint: true });
        if (signature(before) !== signature(opened) || !opened.isFile()) fail('source_changed');
        // Never read a growing file into an unbounded buffer.
        const bytes = Buffer.alloc(Number(opened.size));
        let offset = 0;
        while (offset < bytes.length) {
          check(); const read = fs.readSync(fd, bytes, offset, Math.min(64 * 1024, bytes.length - offset), offset);
          if (!read) fail('source_changed'); offset += read;
        }
        const extra = Buffer.alloc(1);
        if (fs.readSync(fd, extra, 0, 1, offset) || signature(opened) !== signature(fs.fstatSync(fd, { bigint: true }))) fail('source_changed');
        checkpoint?.('file_read', child);
        const after = fs.lstatSync(child, { bigint: true });
        verifyAncestors(child);
        if (signature(opened) !== signature(after)) fail('source_changed');
        entries.set(child, { stats: opened, kind: 'file', bytes, digest: hash(bytes), signature: signature(opened) });
        total += bytes.length;
      } finally { if (fd !== undefined) fs.closeSync(fd); }
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
