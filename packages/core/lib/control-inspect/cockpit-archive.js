// Cockpit reads only this current archive format. Old control parsers stay offline.
import { createHash } from 'node:crypto';
import { join, posix } from 'node:path';
import { existsSync, readFileSync } from '../control-read/fs.js';
import { fail, READ_LIMITS } from '../control-read/snapshot.js';
export const ARCHIVE_INDEX = '.agdf/control/archive/INDEX.json';
export const ARCHIVE_SCHEMA = 'cockpit-archive/1';
const hash = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const safe = path => typeof path === 'string' && path.length < 4096 && !/[\\\u0000-\u001f:]/u.test(path)
  && !path.startsWith('/') && path.split('/').every(p => p && p !== '.' && p !== '..');
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.length <= 8192;
export function readCockpitArchive(root) {
  if (!existsSync(join(root, ARCHIVE_INDEX))) return null;
  const bytes = readFileSync(join(root, ARCHIVE_INDEX));
  let index; try { index = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { fail('archive_invalid'); }
  validateCockpitArchive(index);
  return { ...index, digest: hash(bytes) };
}
export function validateCockpitArchive(index) {
  if (!plain(index) || index.schema !== ARCHIVE_SCHEMA || index.authorizes !== false || !/^sha256:[a-f0-9]{64}$/u.test(index.source_digest)
    || !Array.isArray(index.entries) || index.entries.length > 4096) fail('archive_invalid');
  if (Buffer.byteLength(JSON.stringify(index)) > READ_LIMITS.file) fail('resource_limit');
  const keys = new Set(), paths = new Set(); let files = 0;
  for (const run of index.entries) {
    if (!plain(run) || !text(run.id) || keys.has(run.id) || !text(run.title) || !['run', 'artefacts', 'project'].includes(run.entry_kind) || ![run.recorded_lifecycle, run.recorded_gate, run.source_control_version].every(v => v === null || text(v))
      || !Array.isArray(run.recorded_approvals) || run.recorded_approvals.length > 64 || !run.recorded_approvals.every(a => plain(a) && ['gate', 'status', 'evidence'].every(k => text(a[k])))
      || !Array.isArray(run.documents) || run.documents.length > READ_LIMITS.files) fail('archive_invalid');
    keys.add(run.id);
    for (const doc of run.documents) {
      if (!plain(doc) || !safe(doc.path) || !doc.path.startsWith('.agdf/control/archive/source/') || (!text(doc.original_path) || !doc.original_path.startsWith('.agdf/control/'))
        || paths.has(doc.path) || !/^sha256:[a-f0-9]{64}$/u.test(doc.digest) || !Number.isSafeInteger(doc.bytes) || doc.bytes < 0) fail('archive_invalid');
      paths.add(doc.path); if (++files > READ_LIMITS.files) fail('resource_limit');
    }
  }
  return index;
}
export function archiveRows(index) {
  return index ? index.entries.map(run => ({ kind: 'archive', identity: `archive/${run.id}`, section: 'archive', key: run.id,
    original_key: run.id, title: run.title, stored_status: `Archiviert · damaliger Stand: ${run.recorded_lifecycle ?? 'Unbekannt'}`,
    scope: 'Altbestandsarchiv · nur lesen', priority: null, stored_next_step: 'Archiv ansehen',
    source_links: ARCHIVE_INDEX, current_spec: null, source: { path: ARCHIVE_INDEX, digest: index.digest },
    coverage: 'archived', actions: ['read_archive'], handoff_ready: false, selectable: true, authorizes: false })) : [];
}
export function readArchiveDocument(root, doc) {
  const bytes = readFileSync(join(root, doc.path));
  if (bytes.length !== doc.bytes || hash(bytes) !== doc.digest) fail('source_changed');
  if (bytes.length > READ_LIMITS.preview || !['md', 'json', 'txt', 'log', 'patch'].includes(posix.extname(doc.path).slice(1).toLowerCase()))
    return { available: false, reason: 'document_unsupported', path: doc.original_path, digest: doc.digest, bytes: doc.bytes };
  let content; try { content = new TextDecoder('utf-8', { fatal: true }).decode(bytes); if (content.includes('\0')) throw Error(); }
  catch { return { available: false, reason: 'document_unsupported', path: doc.original_path, digest: doc.digest, bytes: doc.bytes }; }
  return { available: true, path: doc.original_path, digest: doc.digest, bytes: doc.bytes, content };
}
