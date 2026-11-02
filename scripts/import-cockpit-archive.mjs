#!/usr/bin/env node
// Offline, one-time importer. Never loaded by Core, MCP or the installer.
import * as fs from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { fsyncDirectory as sync } from '../packages/core/lib/owned-file-lock.js';
import { resolveLanguagePreference } from '../packages/core/lib/resources/language-preference.js';
import { canonicalizeLanguageTag } from '../packages/core/lib/interaction-presentation.js';
import { canonicalInitPlan } from '../packages/core/lib/resources/canonical-init-plan.js';
import { ARCHIVE_SCHEMA, readCockpitArchive, validateCockpitArchive } from '../packages/core/lib/control-inspect/cockpit-archive.js';
const sha = value => 'sha256:' + createHash('sha256').update(value).digest('hex');
const fail = code => { throw Error(code); };
const JOURNAL = '.agdf/ARCHIVE_IMPORT_PENDING.json';
const present = path => { try { fs.lstatSync(path); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } };
const signature = s => [s.dev, s.ino, s.size, s.mtimeNs, process.platform === 'win32' ? '' : s.ctimeNs].join(':');
const identity = path => { const s = fs.lstatSync(path); if (s.isSymbolicLink() || !s.isDirectory()) fail('unsafe_directory'); return `${s.dev}:${s.ino}`; };
function ancestors(path) {
  for (let p = resolve(path);; p = dirname(p)) { if (fs.lstatSync(p).isSymbolicLink()) fail('symlink_denied'); if (p === dirname(p)) break; }
}
function file(path, expected, destination, capture = false) {
  ancestors(dirname(path));
  const before = fs.lstatSync(path, { bigint: true });
  if (!before.isFile() || before.isSymbolicLink() || before.size > 256n * 1024n ** 2n) fail('unsafe_file');
  const input = fs.openSync(path, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0)); let output;
  try {
    if (signature(before) !== signature(fs.fstatSync(input, { bigint: true }))) fail('source_changed');
    if (destination) { fs.mkdirSync(dirname(destination), { recursive: true }); output = fs.openSync(destination, 'wx', 0o600); }
    const buffer = Buffer.alloc(65536), digest = createHash('sha256'), chunks = []; let length = 0, n;
    while ((n = fs.readSync(input, buffer))) { length += n; digest.update(buffer.subarray(0, n)); if (capture) chunks.push(Buffer.from(buffer.subarray(0, n))); if (output !== undefined) fs.writeFileSync(output, buffer.subarray(0, n)); }
    const result = { bytes: length, digest: 'sha256:' + digest.digest('hex') };
    ancestors(dirname(path));
    if (signature(before) !== signature(fs.fstatSync(input, { bigint: true })) || signature(before) !== signature(fs.lstatSync(path, { bigint: true }))
      || expected && (expected.digest !== result.digest || expected.bytes !== result.bytes)) fail('source_changed');
    if (output !== undefined) fs.fsyncSync(output);
    return capture ? { ...result, content: Buffer.concat(chunks) } : result;
  } finally { fs.closeSync(input); if (output !== undefined) fs.closeSync(output); }
}
function scan(control) {
  identity(control); const files = [], directories = []; let total = 0;
  function visit(path, depth = 0) {
    if (depth > 128 || files.length + directories.length > 40000) fail('resource_limit');
    const before = fs.lstatSync(path, { bigint: true }); identity(path); directories.push(relative(control, path).split(sep).join('/'));
    for (const name of fs.readdirSync(path).sort()) {
      const child = join(path, name), s = fs.lstatSync(child);
      if (s.isSymbolicLink()) fail('symlink_denied');
      if (s.isDirectory()) visit(child, depth + 1);
      else {
        if (files.length >= 20000 || total + s.size > 4 * 1024 ** 3) fail('resource_limit');
        const row = { path: relative(control, child).split(sep).join('/'), ...file(child) }; files.push(row); total += row.bytes;
      }
    }
    if (signature(before) !== signature(fs.lstatSync(path, { bigint: true }))) fail('source_changed');
  }
  visit(control);
  const bytes = files.reduce((sum, f) => sum + f.bytes, 0);
  if (bytes > 4 * 1024 ** 3 || files.length > 20000) fail('resource_limit');
  return { files, directories, bytes, digest: sha(JSON.stringify({ files, directories })) };
}
const scalar = (text, field) => { const rows = [...text.matchAll(new RegExp(`^- ${field}: ([^\\n]*)$`, 'gmu'))]; return rows.length === 1 && rows[0][1].length <= 8192 ? rows[0][1].trim() : null; };
function summary(id, state, documents, hasRunState) {
  const objective = state.match(/^## Objective\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/mu)?.[1]?.trim();
  const approvals = state.match(/^## Approvals\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/mu)?.[1] ?? '';
  return { id, entry_kind: id === '_project' ? 'project' : hasRunState ? 'run' : 'artefacts', title: objective?.split('\n')[0]?.slice(0, 1024) || (id === '_project' ? 'Gemeinsamer Altbestand' : id), recorded_lifecycle: scalar(state, 'lifecycle'),
    recorded_gate: scalar(state, 'current_gate'), source_control_version: scalar(state, 'control_state_version'),
    recorded_approvals: approvals.split('\n').filter(l => /^\|\s*(UR|PRD|SD|TP|QA|UAT)\s*\|/u.test(l)).map(l => {
      const [gate, status, ...evidence] = l.split('|').slice(1, -1).map(v => v.trim()); return { gate, status, evidence: evidence.join(' | ').slice(0, 8192) };
    }), documents };
}
function archivePath(path) {
  return archiveRelativePath(path).split('/').map(part => encodeURIComponent(part)).join('/');
}
function archiveRelativePath(path) {
  let match = path.match(/^artefacts\/([a-z0-9][a-z0-9._-]{0,127})\/(.+)$/u);
  if (match) return `runs/${match[1]}/documents/${match[2]}`;
  match = path.match(/^runs\/([a-z0-9][a-z0-9._-]{0,127})\/(.+)$/u);
  return match ? `runs/${match[1]}/control/${match[2]}` : `shared/${path}`;
}
function indexFor(control, snapshot) {
  const grouped = new Map();
  for (const f of snapshot.files) {
    const id = f.path.match(/^(?:runs|artefacts)\/([a-z0-9][a-z0-9._-]{0,127})\//u)?.[1] ?? '_project';
    if (!grouped.has(id)) grouped.set(id, []);
    grouped.get(id).push({ original_path: `.agdf/control/${f.path}`, path: `.agdf/control/archive/source/${archivePath(f.path)}`, digest: f.digest, bytes: f.bytes });
  }
  const entries = [...grouped].map(([id, documents]) => {
    const source = snapshot.files.find(f => f.path === `runs/${id}/RUN_STATE.md`);
    let text = '';
    if (source && source.bytes <= 2 * 1024 ** 2) { const observed = file(join(control, source.path), source, undefined, true); try { text = new TextDecoder('utf-8', { fatal: true }).decode(observed.content); } catch { /* Preserve unparseable source bytes; report unknown historical facts. */ } }
    return summary(id, text, documents, !!source);
  });
  return validateCockpitArchive({ schema: ARCHIVE_SCHEMA, authorizes: false, source_digest: snapshot.digest, archived_at: new Date().toISOString(), entries });
}
function write(path, content) { fs.mkdirSync(dirname(path), { recursive: true }); const fd = fs.openSync(path, 'wx', 0o600); try { fs.writeFileSync(fd, content); fs.fsyncSync(fd); } finally { fs.closeSync(fd); } }

function resume(root, expected, checkpoint) {
  const journalPath = join(root, JOURNAL), observed = file(journalPath, undefined, undefined, true);
  let journal; try { journal = JSON.parse(observed.content.toString('utf8')); } catch { fail('journal_invalid'); }
  if (journal.schema !== 'cockpit-archive-import/1' || journal.root !== root || journal.root_identity !== identity(root)
    || journal.expected !== expected || !/^\.agdf\/\.archive-stage-[a-f0-9-]{36}$/u.test(journal.stage)
    || journal.backup !== `.agdf/backups/control-${expected.slice(7)}`) fail('journal_invalid');
  const backup = join(root, journal.backup), stage = join(root, journal.stage), control = join(root, '.agdf/control');
  ancestors(join(root, '.agdf')); ancestors(stage); ancestors(dirname(backup));
  if (!present(backup)) {
    if (scan(control).digest !== expected || scan(join(stage, 'control')).digest !== journal.stage_digest) fail('source_changed');
    fs.renameSync(control, backup); sync(dirname(control)); sync(dirname(backup)); checkpoint?.('after_backup');
  }
  if (scan(backup).digest !== expected) fail('backup_changed');
  if (!present(control)) {
    if (scan(join(stage, 'control')).digest !== journal.stage_digest) fail('stage_changed');
    fs.renameSync(join(stage, 'control'), control); sync(dirname(control)); checkpoint?.('after_publish');
  } else if (scan(control).digest !== journal.stage_digest) fail('published_control_changed');
  fs.unlinkSync(journalPath); sync(dirname(journalPath));
  try { fs.rmdirSync(stage); } catch { /* Unknown stage siblings remain untouched after confirmed publication. */ }
  return { status: 'archived', source_digest: expected, backup: journal.backup, active_runs_created: 0, approvals_created: 0 };
}
export function importCockpitArchive(directory, { apply = false, expected, resume: resumeRequested = false, checkpoint } = {}) {
  ancestors(resolve(directory)); const root = fs.realpathSync(directory); identity(root);
  const control = join(root, '.agdf/control'), journal = join(root, JOURNAL);
  if (present(journal)) { if (!apply || !resumeRequested || !expected) fail('resume_required'); return resume(root, expected, checkpoint); }
  if (resumeRequested) fail('no_pending_import');
  const beforeIdentity = identity(control), snapshot = scan(control);
  let config; try { const source = snapshot.files.find(f => f.path === 'config.json'); config = source && source.bytes <= 2 * 1024 ** 2 ? JSON.parse(file(join(control, source.path), source, undefined, true).content.toString('utf8')) : {}; } catch (error) { if (error.message === 'source_changed') throw error; config = {}; }
  if (!config || typeof config !== 'object' || Array.isArray(config)) config = {};
  if (config.control_layout === 'run-folders-v1') {
    const archived = readCockpitArchive(root);
    if (!archived || expected && expected !== archived.source_digest) fail('already_current_no_import');
    for (const run of archived.entries) for (const doc of run.documents) file(join(root, doc.path), doc);
    return { status: 'already_archived', source_digest: archived.source_digest, archived_entries: archived.entries.length, active_runs_created: 0, approvals_created: 0 };
  }
  const index = indexFor(control, snapshot);
  // Artefact copies and recorded history are inert evidence, never live lock owners.
  const blockers = snapshot.files.filter(f => /^maintenance\/(?:admission|recovery)\//u.test(f.path) || !f.path.startsWith('artefacts/') && !/^runs\/[^/]+\/(?:history|presentations)\//u.test(f.path) && /(?:^|\/)(?:[^/]*\.lock|RUN_STEP_PENDING\.json|MUTATION_PENDING\.json|HANDOFF_PENDING\.json)$/u.test(f.path)).map(f => f.path);
  const plan = { status: 'preview', source_digest: snapshot.digest, file_count: snapshot.files.length, byte_count: snapshot.bytes,
    archived_entries: index.entries.length, active_runs_created: 0, approvals_created: 0, blockers,
    backup: `.agdf/backups/control-${snapshot.digest.slice(7)}` };
  if (!apply) { if (scan(control).digest !== snapshot.digest) fail('source_changed'); return plan; }
  if (expected !== snapshot.digest) fail('preview_digest_required_or_stale');
  if (blockers.length) fail('pending_operations_or_locks');
  const backup = join(root, plan.backup); ancestors(dirname(control));
  fs.mkdirSync(dirname(backup), { recursive: true }); ancestors(dirname(backup));
  if (present(backup)) fail('backup_already_exists');
  const stage = join(root, '.agdf', `.archive-stage-${randomUUID()}`); fs.mkdirSync(stage, { mode: 0o700 });
  // Retain any interrupted stage for inspection; never delete uncertain/foreign bytes.
  const language = resolveLanguagePreference(config.artifact_language ?? 'en');
  const chat = canonicalizeLanguageTag(config.chat_language); if (chat) language.chat_language = chat;
  const seeds = canonicalInitPlan(language);
  for (const seed of seeds) write(join(stage, seed.path.replace(/^\.agdf\//u, '')), seed.content);
  fs.mkdirSync(join(stage, 'control/runs'), { recursive: true }); fs.mkdirSync(join(stage, 'control/planned'), { recursive: true });
  for (const directory of snapshot.directories) fs.mkdirSync(join(stage, 'control/archive/source', archivePath(directory + '/.directory').replace(/\/\.directory$/u, '')), { recursive: true });
  for (const f of snapshot.files) file(join(control, f.path), f, join(stage, 'control/archive/source', archivePath(f.path)));
  const indexText = JSON.stringify(index) + '\n';
  write(join(stage, 'control/archive/INDEX.json'), indexText);
  const staged = scan(join(stage, 'control')), stageDigest = staged.digest;
  const expectedFiles = new Map([...snapshot.files.map(f => [`archive/source/${archivePath(f.path)}`, { digest: f.digest, bytes: f.bytes }]),
    ...seeds.map(seed => [seed.path.replace(/^\.agdf\/control\//u, ''), { digest: sha(seed.content), bytes: Buffer.byteLength(seed.content) }]),
    ['archive/INDEX.json', { digest: sha(indexText), bytes: Buffer.byteLength(indexText) }]]);
  if (staged.files.length !== expectedFiles.size || staged.files.some(f => { const expected = expectedFiles.get(f.path);
    return !expected || f.digest !== expected.digest || f.bytes !== expected.bytes; })) fail('stage_changed');
  // Persist directory entries as well as file data before publishing the tree.
  for (const directory of [...staged.directories].reverse()) sync(join(stage, 'control', directory));
  sync(stage); sync(dirname(stage));
  checkpoint?.('before_commit');
  if (identity(control) !== beforeIdentity || scan(control).digest !== snapshot.digest) fail('source_changed');
  write(journal, JSON.stringify({ schema: 'cockpit-archive-import/1', root, root_identity: identity(root), expected,
    stage: relative(root, stage).split(sep).join('/'), backup: plan.backup, stage_digest: stageDigest }) + '\n'); sync(dirname(journal));
  return { ...resume(root, expected, checkpoint), archived_entries: index.entries.length, file_count: snapshot.files.length };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2), allowed = new Set(['--dir', '--apply', '--expect', '--resume']);
    if (args.length === 1 && args[0] === '--help') { console.log('Usage: node scripts/import-cockpit-archive.mjs --dir PROJECT [--apply --expect sha256:DIGEST] [--resume]'); process.exit(0); }
    const options = {}, seen = new Set(); let dir;
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]; if (!allowed.has(arg)) fail('unknown_argument'); if (seen.has(arg)) fail('duplicate_argument'); seen.add(arg);
      if (arg === '--dir' || arg === '--expect') { const value = args[++i]; if (!value || value.startsWith('--')) fail('argument_value_required'); if (arg === '--dir') dir = value; else options.expected = value; }
      else if (arg === '--apply') options.apply = true; else options.resume = true;
    }
    if (!dir) fail('explicit_directory_required');
    console.log(JSON.stringify(importCockpitArchive(dir, options), null, 2));
  } catch (error) { console.error(JSON.stringify({ status: 'refused', reason: error.code ?? error.message })); process.exitCode = 1; }
}
