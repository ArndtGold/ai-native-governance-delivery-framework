import { validateRunPresentationEnvelope, PRESENTATION_ID_PATTERN as UUID, PRESENTATION_RECOVERY as recovery } from "./run-presentation-envelope.js";
export { validateRunPresentationEnvelope } from "./run-presentation-envelope.js";
import { randomUUID } from "node:crypto";
import { closeSync, constants, fstatSync, fsyncSync, lstatSync, mkdirSync, existsSync, openSync, opendirSync, readSync, writeFileSync } from "node:fs";
import { fsyncDirectory } from "./run-state-writer.js";
import { dirname, join } from "node:path";
import { TextDecoder } from 'node:util';
import { runPath } from "./run-state-reader.js";
import { readRun, rejected, endedRunRejection } from "./run-state-edits.js";
import { APPROVAL_GATES, runSealState } from "./run-seal.js";
import { hash } from "./run-presentation-render.js";
import { resolveControlCommandTarget } from './approval-command-contract.js';
import { REVISION_ID_PATTERN } from './run-identity.js';
import { prepareRunContentState } from '../control-evaluation/run-state.js';
import { previewForState } from './preview-review.js';
import { previewSnapshotBinding, publishPreviewSnapshot, readPreviewSnapshot, validateCurrentPreviewRecord } from './preview-snapshot.js';

// JSON Schema uses the pattern without RegExp flags.
const DISCOVERABLE_UUID = new RegExp(REVISION_ID_PATTERN.source, 'u');

export { renderReviewableApproval } from "./run-presentation-render.js";

function directory(path) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error("presentation_path_invalid");
  return stat;
}

function checkedRunDirectory(root, runId) {
  const path = dirname(runPath(root, runId));
  for (const dir of [root, join(root, ".agdf"), join(root, ".agdf", "control"), join(root, ".agdf", "control", "runs"), path]) directory(dir);
  const state = lstatSync(join(path, "RUN_STATE.md"));
  if (state.isSymbolicLink() || !state.isFile()) throw new Error("presentation_path_invalid");
  return path;
}

function binding(root, { runId, gate, revisionId, language, presentationId }, evaluateGateCheck) {
  checkedRunDirectory(root, runId);
  const run = readRun(root, runId);
  if (run.rejection) throw new Error(run.rejection.reason);
  if (run.meta.revision_id !== revisionId) throw new Error("stale_revision");
  const seal = runSealState(root, run.content);
  if (seal.status !== "valid") throw new Error("presentation_state_changed");
  const report = evaluateGateCheck(root, { runId, ...(language ? { presentationLanguage: language } : {}) });
  const artefactPresentation = report.approval_presentation;
  let text = artefactPresentation?.markdown;
  if (report.status !== "open" && report.blocking_reason && report.blocking_reason !== "none") {
    const error = new Error(report.blocking_reason);
    error.recovery = [report.next_allowed_action, ...(report.prd_readiness?.open_decisions ?? [])].filter(Boolean).join("\n\n");
    throw error;
  }
  if (report.status === "open" && report.current_gate === gate && report.missing_approval === `Approval: ${gate}`
      && !text && report.presentation_diagnostics?.approval_presentation_errors?.length) {
    const code = report.presentation_diagnostics.approval_presentation_errors[0];
    const error = new Error(code);
    error.recovery = report.presentation_diagnostics.approval_presentation_recovery
      ?? report.status_presentation?.markdown
      ?? recovery;
    throw error;
  }
  if (report.status !== "open" || report.current_gate !== gate || report.missing_approval !== `Approval: ${gate}`
      || report.approval_presentation?.revision_id !== revisionId || !text) throw new Error("approval_presentation_unavailable");
  const preview = gate === 'PRD' ? previewForState(root, prepareRunContentState(root, run.content, run.path)) : null;
  if (preview) {
    const path = join(root, '.agdf', 'control', 'runs', runId, 'presentations', `${presentationId}.preview.html`);
    if (/[<>\r\n]/u.test(path)) throw Error('preview_path_unsafe');
    const german = language?.startsWith('de');
    text += `\n\n[${german ? 'Geprüfte Vorschau öffnen' : 'Open checked preview'} · ${preview.descriptor.version}](<${path}>)`;
  }
  return { run_id: runId, gate, revision_id: revisionId, content_digest: seal.actual.content_seal,
    artefact_digest: artefactPresentation.artefact_digest,
    summary_digest: artefactPresentation.summary_digest,
    presentation_language: report.approval_presentation.presentation_language, presentation_digest: hash(text), text,
    document_content: text,
    summary: artefactPresentation.summary_markdown,
    companion_text: artefactPresentation.companion_markdown,
    document_language: artefactPresentation.document_language,
    document_digest: hash(text),
    document_bytes: Buffer.byteLength(text, 'utf8'),
    ...(preview ? { preview_review: previewSnapshotBinding(preview, runId, presentationId), preview_content: preview } : {}),
    ...(artefactPresentation.qa_acceptance ? { qa_acceptance: artefactPresentation.qa_acceptance } : {}) };
}

// Evidence of a prepared presentation, NOT a signature or proof of human visibility.
export function prepareRunPresentation(root, input, { evaluateGateCheck, checkpoint = () => {} }) {
  const { runId, gate, operationId, requestDigest } = input;
  if (!APPROVAL_GATES.includes(gate)) return rejected(runId, "gate_invalid");
  if (operationId !== undefined && (!UUID.test(operationId) || !/^sha256:[0-9a-f]{64}$/u.test(requestDigest ?? ""))) return rejected(runId, "operation_binding_invalid");
  try {
    const presentationId = operationId ?? randomUUID();
    input = { ...input, presentationId };
    if (operationId) {
      const dir = join(checkedRunDirectory(root, runId), "presentations");
      const path = join(dir, `${operationId}.json`);
      if (existsSync(path)) {
        const previous = validateRunPresentationRecord(root, { runId, gate, revisionId: input.revisionId, presentationId: operationId });
        if (previous.reason || previous.record.operation_id !== operationId || previous.record.request_digest !== requestDigest) return rejected(runId, "operation_payload_conflict");
        let text = null, summary = null, companion = null;
        try { const current = binding(root, input, evaluateGateCheck); if (current.presentation_digest === previous.record.presentation_digest) { text = current.text; summary = current.summary; companion = current.companion_text; } } catch {}
        return Object.freeze({ ...previous.record, schema_version: "1", outcome: "already_prepared", record_digest: previous.digest,
          text, summary, companion_text: companion, historical_effect: true, next_action: text ? "Show the exact current text before waiting for a new deliberate reply." : "Observe current control; this historical preparation cannot authorize a current decision." });
      }
    }
    const current = readRun(root, runId), ended = current.rejection ? null : endedRunRejection(runId, current.content);
    if (ended) return ended;
    const prepared = binding(root, input, evaluateGateCheck);
    const dir = join(checkedRunDirectory(root, runId), "presentations");
    try { mkdirSync(dir); } catch (error) { if (error.code !== "EEXIST") throw error; }
    const identity = directory(dir);
    const { text, summary, companion_text: companion, document_content: documentContent, preview_content: previewContent, ...bindingRecord } = prepared;
    const record = { schema_version: 6, presentation_id: presentationId, ...(operationId ? { operation_id: operationId, request_digest: requestDigest } : {}), created_at: new Date().toISOString(), ...bindingRecord };
    if (typeof documentContent !== 'string' || record.document_bytes > 131072) throw Error('presentation_document_invalid');
    // A contained snapshot belongs to the existing presentation owner. It never
    // substitutes a later mutable artefact or exposes a caller-selected path.
    let documentFd;
    try { documentFd = openSync(join(dir, `${presentationId}.document`), 'wx', 0o600); }
    catch (error) {
      // A interrupted preparation may have published only its exact snapshot.
      // Under the existing Run lock, the same UUID may resume from those bytes;
      // incomplete, altered or symlinked files remain untouched and reject.
      if (error.code !== 'EEXIST' || !operationId) throw error;
      readDocumentSnapshot(root, record);
    }
    if (documentFd !== undefined) {
      try { writeFileSync(documentFd, documentContent); fsyncSync(documentFd); } finally { closeSync(documentFd); }
    }
    fsyncDirectory(dir);
    checkpoint('presentation_document_published');
    publishPreviewSnapshot(root, record, previewContent, { resume: Boolean(operationId), checkpoint });
    fsyncDirectory(dir);
    const body = JSON.stringify(record);
    const envelope = JSON.stringify({ record, digest: hash(body) }, null, 2) + "\n";
    const fd = openSync(join(dir, `${presentationId}.json`), "wx", 0o600);
    try { writeFileSync(fd, envelope); fsyncSync(fd); } finally { closeSync(fd); }
    fsyncDirectory(dir);
    const after = directory(dir);
    if (after.dev !== identity.dev || after.ino !== identity.ino) throw new Error("presentation_path_invalid");
    const fresh = binding(root, input, evaluateGateCheck);
    if (JSON.stringify(fresh) !== JSON.stringify(prepared)) throw new Error("presentation_state_changed");
    return Object.freeze({ ...record, schema_version: "1", outcome: "prepared", text, summary, companion_text: companion, record_digest: hash(body),
      next_action: "Show text verbatim before waiting for a deliberate response. Pass this presentation_id to run-approve only for that response." });
  } catch (error) {
    return rejected(runId, error.code ?? error.message, { recovery: error.recovery ?? recovery });
  }
}

function readPresentationEnvelope(root, runId, presentationId) {
    const dir = join(checkedRunDirectory(root, runId), "presentations");
    directory(dir);
    const path = join(dir, `${presentationId}.json`);
    const stat = lstatSync(path);
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 262144) throw new Error("presentation_path_invalid");
    const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    let envelope;
    try {
      const actual = fstatSync(fd);
      if (!actual.isFile() || actual.dev !== stat.dev || actual.ino !== stat.ino || actual.size > 262144) throw new Error("presentation_path_invalid");
      envelope = JSON.parse(readBoundedSnapshot(fd, actual, 262144).toString('utf8'));
    } finally { closeSync(fd); }
    return envelope;
}

export function validateRunPresentationRecord(root, { runId, gate, revisionId, presentationId }) {
  if (!UUID.test(presentationId ?? "")) return { reason: "presentation_required", recovery };
  try {
    return validateRunPresentationEnvelope(readPresentationEnvelope(root, runId, presentationId), { runId, gate, revisionId, presentationId });
  } catch (error) {
    return { reason: error.code === "ENOENT" ? "presentation_missing" : error.message, recovery: error.recovery ?? recovery };
  }
}

export const PRESENTATION_CATALOG_LIMITS = Object.freeze({ page_candidates: 16, record_files: 256, record_bytes: 1048576, directory_entries: 1024 });

// Discovery is an observation of existing prepared records, never evidence of human
// visibility. Reuse this owner's contained envelope/snapshot readers; no index/cache.
export function readPresentationCatalog(root, { runId, revisionId, targetId, gate, cursor, workingDirectory, targetSource, primaryTarget, language }) {
  const limits = PRESENTATION_CATALOG_LIMITS;
  const base = { schema_version: '1', authorizes: false, binding: { target_id: targetId, run_id: runId, expected_revision_id: revisionId },
    requested_gate: gate ?? null, limits, candidates: [], complete_scan: false, page_complete: false, next_cursor: null };
  const fail = reason => ({ ...base, state: 'unavailable', reason, next_action: reason.includes('cursor') || reason.includes('changed')
    ? 'Refresh the run binding; restart without a catalog cursor. Preserve exact original document bindings.'
    : 'The catalog cannot establish absence or uniqueness. Use an exact known binding or ask the owner to restore availability; never select by recency.' });
  try {
    if (resolveControlCommandTarget(root).target_id !== targetId) return fail('target_binding_mismatch');
    const runDir = checkedRunDirectory(root, runId), run = readRun(root, runId);
    if (run.rejection || run.meta.revision_id !== revisionId || runSealState(root, run.content).status !== 'valid') return fail('operation_binding_stale_or_invalid');
    const path = join(runDir, 'presentations');
    const identity = stat => [stat.dev, stat.ino, stat.size, stat.mtimeMs, stat.ctimeMs].join(':');
    const parents = [root, join(root, '.agdf'), join(root, '.agdf/control'), join(root, '.agdf/control/runs'), runDir];
    const beforeParents = parents.map(p => identity(directory(p)));
    let before;
    try { before = identity(directory(path)); }
    catch (error) {
      if (error.code !== 'ENOENT' || cursor !== undefined) return fail('presentation_catalog_unavailable');
      if (readRun(root, runId).content !== run.content || parents.some((p, i) => identity(directory(p)) !== beforeParents[i]) || existsSync(path)) return fail('presentation_catalog_changed');
      return { ...base, state: 'none', reason: null, complete_scan: true, page_complete: true, total_candidates: 0, next_action: 'Report no prepared document. Preparation is separate; do not prepare during this read.' };
    }
    const ids = [], dir = opendirSync(path);
    let entries = 0, entry;
    try {
      while ((entry = dir.readSync())) {
        if (++entries > limits.directory_entries) return fail('presentation_catalog_directory_limit');
        if (!entry.name.endsWith('.json') || !UUID.test(entry.name.slice(0, -5))) continue;
        ids.push(entry.name.slice(0, -5));
        if (ids.length > limits.record_files) return fail('presentation_catalog_record_limit');
      }
    } finally { dir.closeSync(); }
    ids.sort();
    const candidates = [], records = [], observedFiles = [];
    let recordBytes = 0;
    for (const id of ids) {
      const stat = lstatSync(join(path, `${id}.json`));
      recordBytes += stat.size;
      if (recordBytes > limits.record_bytes) return fail('presentation_catalog_byte_limit');
      const envelope = readPresentationEnvelope(root, runId, id), record = envelope?.record;
      if (!record || !APPROVAL_GATES.includes(record.gate) || !DISCOVERABLE_UUID.test(id)
        || !DISCOVERABLE_UUID.test(record.revision_id ?? '')) return fail('presentation_binding_invalid');
      const checked = validateRunPresentationEnvelope(envelope, { runId, gate: record.gate, revisionId: record.revision_id, presentationId: id });
      if (checked.reason) return fail(checked.reason);
      // Old records without snapshots cannot establish a complete readable catalog.
      if (![3, 4, 5, 6].includes(record.schema_version)) return fail('presentation_document_snapshot_unavailable');
      const documentPath = join(path, `${id}.document`), documentStat = lstatSync(documentPath);
      new TextDecoder('utf-8', { fatal: true }).decode(readDocumentSnapshot(root, record));
      observedFiles.push([join(path, `${id}.json`), identity(stat)], [documentPath, identity(documentStat)]);
      if (identity(lstatSync(join(path, `${id}.json`))) !== identity(stat)) return fail('presentation_catalog_changed');
      records.push([id, checked.digest]);
      if (gate !== undefined && record.gate !== gate) continue;
      candidates.push({ presentation_id: id, gate: record.gate, original_revision_id: record.revision_id,
        prepared_status: 'prepared', applicability: record.revision_id === revisionId ? 'current' : 'historical',
        content_digest: record.document_digest, document_language: record.document_language, total_bytes: record.document_bytes,
        read_arguments: { operation: 'presentation-document', presentation_language: language, working_directory: workingDirectory,
          target_source: targetSource, primary_target: primaryTarget, target_id: targetId, run_id: runId, gate: record.gate,
          expected_revision_id: record.revision_id, presentation_id: id } });
    }
    const prefix = `${hash(JSON.stringify(['agdf-presentation-catalog/1', targetId, runId, revisionId, 'agdf_prepare/presentation.prepare', gate ?? null, records])).slice(7)}:`;
    if (cursor !== undefined && (typeof cursor !== 'string' || !cursor.startsWith(prefix) || !/^(0|[1-9][0-9]{0,6})$/u.test(cursor.slice(prefix.length)))) return fail('presentation_catalog_cursor_invalid');
    const offset = cursor === undefined ? 0 : Number(cursor.slice(prefix.length));
    if (offset % limits.page_candidates !== 0 || offset >= candidates.length && (offset !== 0 || cursor !== undefined)) return fail('presentation_catalog_cursor_invalid');
    const fresh = readRun(root, runId);
    if (fresh.rejection || fresh.content !== run.content || observedFiles.some(([p, stat]) => identity(lstatSync(p)) !== stat) || identity(directory(path)) !== before
      || parents.some((p, i) => identity(directory(p)) !== beforeParents[i])) return fail('presentation_catalog_changed');
    const end = Math.min(offset + limits.page_candidates, candidates.length);
    return { ...base, state: candidates.length === 0 ? 'none' : candidates.length === 1 ? 'unique' : 'ambiguous', reason: null,
      complete_scan: true, page_complete: end === candidates.length, total_candidates: candidates.length,
      candidates: candidates.slice(offset, end), next_cursor: end < candidates.length ? `${prefix}${end}` : null,
      next_action: candidates.length === 0 ? 'Report no prepared document; never create a replacement.' : candidates.length === 1
        ? 'Use exact read_arguments; follow every document next_cursor.'
        : 'Ask for record selection. Use next_cursor for more candidates; a partial page never proves uniqueness.' };
  } catch { return fail('presentation_catalog_unavailable'); }
}

export function validateRunPresentation(root, input, { evaluateGateCheck }) {
  const envelope = validateRunPresentationRecord(root, input);
  if (envelope.reason) return envelope;
  try {
    if ([3, 4, 5, 6].includes(envelope.record.schema_version)) readDocumentSnapshot(root, envelope.record);
    if ([5, 6].includes(envelope.record.schema_version) && envelope.record.preview_review) validateCurrentPreviewRecord(root, envelope.record);
    const fresh = binding(root, { ...input, language: envelope.record.presentation_language }, evaluateGateCheck);
    if (Object.entries(fresh).some(([key, value]) => !['text', 'summary', 'companion_text', 'document_content', 'preview_content'].includes(key)
      // Old snapshots keep their immutable bytes. A renderer upgrade cannot
      // regenerate their language/document hashes; source/seal/summary and the
      // retained envelope/snapshot remain checked by their original format.
      && !(envelope.record.schema_version < 6 && ['presentation_digest', 'document_digest', 'document_bytes', 'document_language'].includes(key))
      && ([3, 4, 5, 6].includes(envelope.record.schema_version) || !['document_digest', 'document_bytes', 'document_language'].includes(key))
      && (['qa_acceptance', 'preview_review'].includes(key) ? JSON.stringify(envelope.record[key]) !== JSON.stringify(value) : envelope.record[key] !== value))) throw new Error("presentation_state_changed");
    return { presentationId: envelope.presentationId, digest: envelope.digest };
  } catch (error) {
    return { reason: error.code === "ENOENT" ? "presentation_missing" : error.message, recovery: error.recovery ?? recovery };
  }
}

function readDocumentSnapshot(root, record) {
  const dir = join(checkedRunDirectory(root, record.run_id), 'presentations'); directory(dir);
  const path = join(dir, `${record.presentation_id}.document`), stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isFile() || stat.size !== record.document_bytes) throw Error('presentation_document_invalid');
  const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  let bytes;
  try {
    const actual = fstatSync(fd);
    if (!actual.isFile() || actual.ino !== stat.ino || actual.dev !== stat.dev || actual.size !== record.document_bytes) throw Error('presentation_document_invalid');
    bytes = readBoundedSnapshot(fd, actual, 131072);
  } finally { closeSync(fd); }
  if (bytes.length !== record.document_bytes || hash(bytes) !== record.document_digest) throw Error('presentation_document_digest_mismatch');
  return bytes;
}

function readBoundedSnapshot(fd, before, maximum) {
  if (before.size > maximum) throw Error('presentation_path_invalid');
  const bytes = Buffer.alloc(before.size + 1);
  let size = 0, count;
  while (size < bytes.length && (count = readSync(fd, bytes, size, bytes.length - size, size)) > 0) size += count;
  const after = fstatSync(fd);
  if (size !== before.size || after.size !== before.size || after.mtimeMs !== before.mtimeMs || after.ctimeMs !== before.ctimeMs) throw Error('presentation_state_changed');
  return bytes.subarray(0, size);
}

export function readPresentationDocument(root, { runId, gate, revisionId, presentationId, targetId, cursor }) {
  const fail = reason => ({ available: false, reason, authorizes: false });
  try {
    if (resolveControlCommandTarget(root).target_id !== targetId) return fail('target_binding_mismatch');
    const checked = validateRunPresentationRecord(root, { runId, gate, revisionId, presentationId });
    if (checked.reason) return fail(checked.reason);
    const record = checked.record;
    if (![3, 4, 5, 6].includes(record.schema_version)) return fail('presentation_document_snapshot_unavailable');
    const bytes = readDocumentSnapshot(root, record);
    // Cursor is bound to this immutable record; offsets always end on UTF-8 boundaries.
    const prefix = `${checked.digest.slice(7)}:`;
    if (cursor !== undefined && (typeof cursor !== 'string' || !cursor.startsWith(prefix)
      || !/^(0|[1-9][0-9]*)$/u.test(cursor.slice(prefix.length)))) return fail('presentation_document_cursor_invalid');
    const start = cursor === undefined ? 0 : Number(cursor.slice(prefix.length));
    if (!Number.isSafeInteger(start) || start < 0 || start >= bytes.length || (bytes[start] & 0xc0) === 0x80) return fail('presentation_document_cursor_invalid');
    let end = Math.min(start + 32768, bytes.length);
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) --end;
    const content = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes.subarray(start, end));
    const currentRun = readRun(root, runId);
    const applicability = currentRun.rejection ? 'unknown'
      : currentRun.meta.revision_id !== record.revision_id ? 'historical'
      : runSealState(root, currentRun.content).status === 'valid' ? 'current' : 'unknown';
    return { available: true, target_id: targetId, run_id: runId, gate, revision_id: revisionId,
      presentation_id: presentationId, applicability, presentation_digest: checked.digest, content_digest: record.document_digest,
      presentation_language: record.presentation_language, document_language: record.document_language, content, byte_start: start, byte_end: end,
      total_bytes: bytes.length, complete: end === bytes.length, next_cursor: end === bytes.length ? null : `${prefix}${end}`,
      authorizes: false };
  } catch (error) { return fail(error.message?.startsWith('presentation_document_') ? error.message : 'presentation_document_unavailable'); }
}

// Same exact presentation selectors as the document reader; no path input.
// This returns untrusted illustrative HTML for an isolated viewer, never parent DOM.
export function readPresentationPreview(root, { runId, gate, revisionId, presentationId, targetId, cursor }) {
  const fail = reason => ({ available: false, reason, authorizes: false });
  try {
    if (resolveControlCommandTarget(root).target_id !== targetId) return fail('target_binding_mismatch');
    const checked = validateRunPresentationRecord(root, { runId, gate, revisionId, presentationId });
    if (checked.reason) return fail(checked.reason);
    if (!([5, 6].includes(checked.record.schema_version) && checked.record.preview_review)) return fail('preview_unavailable');
    const bytes = readPreviewSnapshot(root, checked.record), token = `${checked.digest.slice(7)}:`;
    if (cursor !== undefined && (typeof cursor !== 'string' || !cursor.startsWith(token) || !/^(0|[1-9][0-9]*)$/u.test(cursor.slice(token.length)))) return fail('preview_cursor_invalid');
    const start = cursor === undefined ? 0 : Number(cursor.slice(token.length));
    if (!Number.isSafeInteger(start) || start < 0 || start >= bytes.length || (bytes[start] & 0xc0) === 0x80) return fail('preview_cursor_invalid');
    let end = Math.min(start + 32768, bytes.length);
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) --end;
    const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(start, end));
    const run = readRun(root, runId);
    let applicability = run.rejection ? 'unknown' : run.meta.revision_id !== revisionId ? 'historical'
      : runSealState(root, run.content).status === 'valid' ? 'current' : 'unknown';
    if (applicability === 'current') {
      try { validateCurrentPreviewRecord(root, checked.record); } catch { applicability = 'stale'; }
    }
    return { available: true, target_id: targetId, run_id: runId, gate, revision_id: revisionId, presentation_id: presentationId,
      applicability, presentation_digest: checked.digest, content_digest: checked.record.preview_review.rendered_digest,
      version: checked.record.preview_review.descriptor.version, content, byte_start: start, byte_end: end, total_bytes: bytes.length,
      complete: end === bytes.length, next_cursor: end === bytes.length ? null : `${token}${end}`, format: 'isolated_html', authorizes: false };
  } catch (error) { return fail(error.message.startsWith('preview_') ? error.message : 'preview_unavailable'); }
}
