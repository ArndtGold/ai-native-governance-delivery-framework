// A terminal frontend for Codex JSONL, not a model message or approval recorder.
import { createHash } from 'node:crypto';
import { isAbsolute } from 'node:path';
import { realpathSync } from 'node:fs';
import { validateRunPresentationRecord } from '#agdf-core/control-state/run-presentation.js';
import { resolutionRecordVersion } from '#agdf-core/control-state/input-resolution.js';
import { resolveControlCommandTarget, canonicalJson } from '#agdf-core/control-state/approval-command-contract.js';
import { RUN_ID_PATTERN, REVISION_ID_PATTERN, APPROVAL_GATES } from '#agdf-core/control-state/run-identity.js';
import { pluginDefinition } from '../runtime/control-context.js';

const fail = code => { throw Error(`document_delivery_${code}`); };
const hash = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const digestPattern = /^[a-f0-9]{64}$/u;
const LIMITS = Object.freeze({ frame: 4 * 1024 ** 2, stream: 64 * 1024 ** 2, events: 10000, document: 131072 });

export function validateDocumentSelection(options) {
  if (!isAbsolute(options.dir ?? '') || !RUN_ID_PATTERN.test(options.runId ?? '')
    || !REVISION_ID_PATTERN.test(options.revisionId ?? '') || !REVISION_ID_PATTERN.test(options.presentationId ?? '')
    || !APPROVAL_GATES.includes(options.gate)) fail('selection_required');
  if (options.documentServer !== undefined && (typeof options.documentServer !== 'string'
    || !/^[A-Za-z0-9_.-]{1,128}$/u.test(options.documentServer))) fail('server_invalid');
}

function binding(options) {
  validateDocumentSelection(options);
  const root = realpathSync(options.dir);
  const targetId = resolveControlCommandTarget(root).target_id;
  if (!targetId) fail('target_unavailable');
  // Canonical envelope reader validates paths, links, identity and record digest.
  // It does not read the document snapshot. Output bytes must come from MCP.
  const checked = validateRunPresentationRecord(root, options);
  if (checked.reason || resolutionRecordVersion(checked.record) !== 7) fail('presentation_unavailable');
  return { root, targetId, checked };
}

function domainFor(item) {
  const result = item.result;
  if (result?.isError || result?.is_error || item.error || item.status !== 'completed') fail('tool_failed');
  const snake = result?.structured_content, camel = result?.structuredContent;
  if (snake && camel && canonicalJson(snake) !== canonicalJson(camel)) fail('conflicting_channels');
  const domain = snake ?? camel;
  if (!domain || typeof domain !== 'object') fail('structured_result_required');
  if (!Array.isArray(result.content) || result.content.length !== 1 || result.content[0]?.type !== 'text') fail('text_result_required');
  let text;
  try { text = JSON.parse(result.content[0].text); } catch { fail('text_result_invalid'); }
  if (canonicalJson(text) !== canonicalJson(domain)) fail('conflicting_channels');
  return domain;
}

// Async iterable input supports real stdin and byte-split stream regression tests.
export async function readCodexDocument(input, options) {
  const expected = binding(options), server = options.documentServer ?? 'agdf';
  const record = expected.checked.record, pages = new Map(), activeTools = new Map();
  const prefix = expected.checked.digest.slice(7) + ':';
  const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
  let pending = '', streamBytes = 0, events = 0, offset = 0, cursor, duplicates = 0, reads = 0, failedReads = 0;
  let threadId, started = false, completed = false, runtimeDigest;
  function event(line) {
    if (++events > LIMITS.events || Buffer.byteLength(line) > LIMITS.frame) fail('stream_limit');
    let value;
    try { value = JSON.parse(line); } catch { fail('json_invalid'); }
    if (completed) fail('events_after_completion');
    if (value.type === 'thread.started') {
      if (threadId || !REVISION_ID_PATTERN.test(value.thread_id ?? '')) fail('thread_invalid');
      threadId = value.thread_id; return;
    }
    if (value.type === 'turn.started') {
      if (!threadId || started) fail('turn_invalid');
      started = true; return;
    }
    if (!started) fail('turn_missing');
    if (value.type === 'turn.completed') {
      if (activeTools.size) fail('unfinished_tool');
      completed = true; return;
    }
    if (['turn.failed', 'error'].includes(value.type)) fail('turn_failed');
    if (!['item.started', 'item.updated', 'item.completed'].includes(value.type) || !value.item) fail('event_unsupported');
    const item = value.item;
    if (['error', 'command_execution', 'file_change', 'web_search'].includes(item.type)) fail('unexpected_action');
    if (item.type !== 'mcp_tool_call') {
      if (!['agent_message', 'reasoning', 'todo_list'].includes(item.type)) fail('item_unsupported');
      return;
    }
    if (item.server !== server || item.tool !== 'agdf_inspect') fail('unexpected_tool');
    if (typeof item.id !== 'string' || !item.id) fail('tool_id_invalid');
    if (value.type === 'item.started') {
      if (activeTools.has(item.id)) fail('tool_id_repeated');
      activeTools.set(item.id, true); return;
    }
    if (value.type !== 'item.completed') return;
    if (!activeTools.delete(item.id)) fail('tool_start_missing');
    const call = item.arguments;
    // Other read-only orientation calls cannot supply document bytes.
    if (call?.operation !== 'presentation-document') return;
    if (item.status === 'failed') { failedReads++; return; }
    const domain = domainFor(item), report = domain.report;
    if (domain.schema_version !== '1' || domain.outcome !== 'inspect_result'
      || domain.operation !== 'presentation-document' || domain.authorizes !== false
      || report?.available !== true || report.authorizes !== false) fail('document_result_invalid');
    const runtime = domain.runtime;
    if (runtime?.provenance_status !== 'matched' || runtime.expected_version !== pluginDefinition.version
      || !digestPattern.test(runtime.runtime_digest ?? '')) fail('runtime_unmatched');
    if (runtimeDigest && runtimeDigest !== runtime.runtime_digest) fail('runtime_changed');
    runtimeDigest = runtime.runtime_digest;
    if (!['explicit_target', 'continued_target', 'current_repository'].includes(call.target_source)
      || call.primary_target !== expected.root || domain.target?.resolution_state !== 'resolved'
      || domain.target.governance_target !== expected.root || domain.target.primary_target !== expected.root
      || domain.target.target_source !== call.target_source || domain.target.authorizes !== false) fail('target_mismatch');
    for (const [field, wanted] of Object.entries({ target_id: expected.targetId, run_id: options.runId,
      gate: options.gate, presentation_id: options.presentationId })) {
      if (call[field] !== wanted || report[field] !== wanted) fail('selection_mismatch');
    }
    if (call.expected_revision_id !== options.revisionId || report.revision_id !== options.revisionId
      || report.presentation_digest !== expected.checked.digest || report.content_digest !== record.document_digest
      || report.total_bytes !== record.document_bytes || report.presentation_language !== record.presentation_language
      || report.document_language !== record.document_language) fail('binding_mismatch');
    const start = report.byte_start, end = report.byte_end;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end <= start
      || end > record.document_bytes || end > LIMITS.document || typeof report.content !== 'string') fail('range_invalid');
    const bytes = Buffer.from(report.content, 'utf8');
    if (bytes.toString('utf8') !== report.content || bytes.length !== end - start) fail('utf8_invalid');
    if (call.cursor !== (start === 0 ? undefined : prefix + start)
      || report.complete !== (end === record.document_bytes)
      || report.next_cursor !== (end === record.document_bytes ? null : prefix + end)) fail('cursor_invalid');
    reads++;
    if (pages.has(start)) {
      const old = pages.get(start);
      if (old.end !== end || !old.bytes.equals(bytes)) fail('duplicate_conflict');
      duplicates++; return;
    }
    if (start !== offset || call.cursor !== cursor) fail('page_gap');
    pages.set(start, { end, bytes }); offset = end; cursor = report.next_cursor;
  }
  for await (const chunk of input) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    streamBytes += bytes.length;
    if (streamBytes > LIMITS.stream) fail('stream_limit');
    pending += decoder.decode(bytes, { stream: true });
    let newline;
    while ((newline = pending.indexOf('\n')) >= 0) {
      const line = pending.slice(0, newline); pending = pending.slice(newline + 1);
      if (!line.trim()) fail('empty_frame');
      event(line);
    }
    if (Buffer.byteLength(pending) > LIMITS.frame) fail('stream_limit');
  }
  pending += decoder.decode();
  if (pending) event(pending);
  if (!completed || offset !== record.document_bytes || cursor !== null) fail('incomplete');
  const document = Buffer.concat([...pages.values()].map(page => page.bytes));
  if (hash(document) !== record.document_digest) fail('digest_mismatch');
  const current = binding(options);
  if (current.root !== expected.root || current.targetId !== expected.targetId
    || current.checked.digest !== expected.checked.digest) fail('binding_changed');
  // Never interpret raw terminal controls from a frozen artefact. Reject, do not
  // sanitize bytes and then pretend the original digest was delivered.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]|\r(?!\n)/u.test(document.toString('utf8'))) fail('terminal_controls');
  return { document, receipt: { mode: 'verified_terminal', proof_scope: 'stdout_bytes_written',
    authorizes: false, thread_id: threadId, target_id: expected.targetId, run_id: options.runId,
    gate: options.gate, revision_id: options.revisionId, presentation_id: options.presentationId,
    presentation_digest: expected.checked.digest, content_digest: record.document_digest,
    bytes: document.length, pages: pages.size, reads, duplicate_reads: duplicates, failed_reads: failedReads,
    runtime_digest: runtimeDigest, turn_completed: true } };
}

async function write(stream, data) {
  await new Promise((resolve, reject) => stream.write(data, error => error ? reject(error) : resolve()));
}

export function createCodexDocumentRequest(options) {
  const selected = binding(options), server = options.documentServer ?? 'agdf';
  const request = { operation: 'presentation-document', presentation_language: selected.checked.record.presentation_language,
    working_directory: selected.root, target_source: 'explicit_target', primary_target: selected.root,
    target_id: selected.targetId, run_id: options.runId, gate: options.gate,
    expected_revision_id: options.revisionId, presentation_id: options.presentationId };
  return `The verified AGDF render-document terminal frontend is explicitly configured for this request. It receives the original MCP frames and independently validates the selected canonical binding, every page and SHA256 before writing any text. This is a read-only request, never approval. Use only agdf_inspect from server ${JSON.stringify(server)}. Use the literal tool name already supplied in the code when it is available. Do not add ALL_TOOLS discovery or dynamic tools[variable], tools[match.name] or aliases. If the configured server exposes a different name, discover it separately and replace ONLY the literal name; never select a tool dynamically. The strict observer rejects dynamic dispatch. Preserve every selected value, including this historical revision even if a newer revision exists. Execute the complete bounded read loop in one Code Mode cell. Progress is in result.structuredContent.report, not at the structuredContent root. Print only progress metadata, not content or whole tool replies. Never repeat completed pages or infer a cursor.\n\n`
    + `const selected = ${JSON.stringify(request)};\nlet cursor;\nlet done = false;\nfor (let pageNumber = 0; pageNumber < 64; pageNumber++) {\n`
    + `  const result = await tools[${JSON.stringify('mcp__' + server + '__agdf_inspect')}](cursor === undefined ? selected : {...selected, cursor});\n`
    + `  const domain = result.structuredContent;\n  const page = domain?.report;\n`
    + `  if (domain?.outcome !== "inspect_result" || page?.available !== true) throw new Error("Document read failed");\n`
    + `  text({byte_end:page.byte_end, complete:page.complete, next_cursor:page.next_cursor});\n`
    + `  if (page.complete === true) { done = true; break; }\n`
    + `  if (typeof page.next_cursor !== "string" || page.next_cursor === cursor) throw new Error("Missing or repeated cursor");\n`
    + `  cursor = page.next_cursor;\n}\nif (!done) throw new Error("Document page limit exceeded");\n\n`
    + 'After successful completion say only that the pages were retrieved and the host will perform verified output. Do not claim that output or human approval already happened. The renderer receipt proves stdout bytes written only, not human visibility or approval.\n';
}

export async function renderCodexDocument(options, { input = process.stdin, output = process.stdout, errors = process.stderr } = {}) {
  if (options.documentRequest) { await write(output, createCodexDocumentRequest(options)); return 0; }
  if (input.isTTY) fail('jsonl_stdin_required');
  const { document, receipt } = await readCodexDocument(input, options);
  await write(output, document);
  await write(errors, 'AGDF_DOCUMENT_DELIVERY ' + JSON.stringify(receipt) + '\n');
  return 0;
}
