import { validateRunPresentationEnvelope, PRESENTATION_ID_PATTERN as UUID, PRESENTATION_RECOVERY as recovery } from "./run-presentation-envelope.js";
export { validateRunPresentationEnvelope } from "./run-presentation-envelope.js";
import { randomUUID } from "node:crypto";
import { closeSync, constants, fstatSync, fsyncSync, lstatSync, mkdirSync, existsSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { fsyncDirectory } from "./run-state-writer.js";
import { dirname, join } from "node:path";
import { TextDecoder } from 'node:util';
import { runPath } from "./run-state-reader.js";
import { readRun, rejected } from "./run-state-edits.js";
import { APPROVAL_GATES, runSealState } from "./run-seal.js";
import { hash } from "./run-presentation-render.js";
import { resolveControlCommandTarget } from './approval-command-contract.js';
import { prepareRunContentState } from '../control-evaluation/run-state.js';
import { previewForState } from './preview-review.js';
import { previewSnapshotBinding, publishPreviewSnapshot, readPreviewSnapshot, validateCurrentPreviewRecord } from './preview-snapshot.js';

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
    document_content: artefactPresentation.document_content,
    summary: artefactPresentation.summary_markdown,
    companion_text: artefactPresentation.companion_markdown,
    document_language: artefactPresentation.document_language,
    document_digest: hash(artefactPresentation.document_content),
    document_bytes: Buffer.byteLength(artefactPresentation.document_content, 'utf8'),
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
    const prepared = binding(root, input, evaluateGateCheck);
    const dir = join(checkedRunDirectory(root, runId), "presentations");
    try { mkdirSync(dir); } catch (error) { if (error.code !== "EEXIST") throw error; }
    const identity = directory(dir);
    const { text, summary, companion_text: companion, document_content: documentContent, preview_content: previewContent, ...bindingRecord } = prepared;
    const record = { schema_version: prepared.preview_review ? 5 : prepared.qa_acceptance ? 4 : 3, presentation_id: presentationId, ...(operationId ? { operation_id: operationId, request_digest: requestDigest } : {}), created_at: new Date().toISOString(), ...bindingRecord };
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

export function validateRunPresentationRecord(root, { runId, gate, revisionId, presentationId }) {
  if (!UUID.test(presentationId ?? "")) return { reason: "presentation_required", recovery };
  try {
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
      envelope = JSON.parse(readFileSync(fd, "utf8"));
    } finally { closeSync(fd); }
    return validateRunPresentationEnvelope(envelope, { runId, gate, revisionId, presentationId });
  } catch (error) {
    return { reason: error.code === "ENOENT" ? "presentation_missing" : error.message, recovery: error.recovery ?? recovery };
  }
}

export function validateRunPresentation(root, input, { evaluateGateCheck }) {
  const envelope = validateRunPresentationRecord(root, input);
  if (envelope.reason) return envelope;
  try {
    if ([3, 4, 5].includes(envelope.record.schema_version)) readDocumentSnapshot(root, envelope.record);
    if (envelope.record.schema_version === 5) validateCurrentPreviewRecord(root, envelope.record);
    const fresh = binding(root, { ...input, language: envelope.record.presentation_language }, evaluateGateCheck);
    if (Object.entries(fresh).some(([key, value]) => !['text', 'summary', 'companion_text', 'document_content', 'preview_content'].includes(key)
      && ([3, 4, 5].includes(envelope.record.schema_version) || !['document_digest', 'document_bytes', 'document_language'].includes(key))
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
    bytes = readFileSync(fd);
  } finally { closeSync(fd); }
  if (bytes.length !== record.document_bytes || hash(bytes) !== record.document_digest) throw Error('presentation_document_digest_mismatch');
  return bytes;
}

export function readPresentationDocument(root, { runId, gate, revisionId, presentationId, targetId, cursor }) {
  const fail = reason => ({ available: false, reason, authorizes: false });
  try {
    if (resolveControlCommandTarget(root).target_id !== targetId) return fail('target_binding_mismatch');
    const checked = validateRunPresentationRecord(root, { runId, gate, revisionId, presentationId });
    if (checked.reason) return fail(checked.reason);
    const record = checked.record;
    if (![3, 4, 5].includes(record.schema_version)) return fail('presentation_document_snapshot_unavailable');
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
    if (checked.record.schema_version !== 5) return fail('preview_unavailable');
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
