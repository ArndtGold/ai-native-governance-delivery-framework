// Companion events (SD SDD-005, SDD-009): the pure mapping from the final result of an AGDF MCP tool
// call to zero or one event of schema `companion-event/1`, and the reader of the versioned journal
// format. Events come from real MCP outcomes, never from host hooks, so the agent cannot shape them.
// Read-only tools produce none. Review facts (SDD-008) are computed by the runtime and handed in.
// Host-neutral: no Node built-in, no host API.
import { COMMAND_TOOL_NAMES, TOOL_RESULT_META } from '../mcp-tool-errors.js';
import { RUN_STEP_SLOTS } from '../control-state/run-identity.js';

export const COMPANION_EVENT_SCHEMA = 'companion-event/1';
export const EVENT_KINDS = Object.freeze(['approval_requested', 'approval_recorded', 'write_rejected', 'effect_unknown',
  'recovery_required', 'run_completed', 'material_staged', 'document_recorded']);
// Decision P1: these kinds interrupt as a toast, together with a digest mismatch (a drift warning of
// the run view); approval recorded and write rejected appear in the pane only.
export const TOAST_KINDS = Object.freeze(['approval_requested', 'effect_unknown', 'recovery_required', 'run_completed']);
// Decision P2: at most 40 lines or 4 KiB, whichever is smaller.
export const PREVIEW_LIMITS = Object.freeze({ lines: 40, bytes: 4096 });
export const SOURCE_MATCHES = Object.freeze(['match', 'mismatch', 'not_determinable', 'unavailable']);

// The tool-result descriptor key and the command tools come from the MCP tool-error contract, and the
// slot of a recorded step from the run identity owner; all three modules are pure (CR finding CIR-04).
export const TOOL_RESULT_META_KEY = TOOL_RESULT_META;
const COMMAND_TOOLS = new Set(COMMAND_TOOL_NAMES);
const TEXT_LIMIT = 256;
const encoder = new TextEncoder();
const bounded = value => (typeof value === 'string' && value.length ? value.slice(0, TEXT_LIMIT) : null);

// The bounded preview of a text: cut after the 40th line break unless the text ends there, then to
// at most 4096 UTF-8 bytes on a character boundary. Exactly 40 lines or 4096 bytes stay whole.
export function reviewPreview(text) {
  const value = String(text ?? '');
  let preview = value;
  let at = -1;
  for (let line = 0; line < PREVIEW_LIMITS.lines; line += 1) {
    at = value.indexOf('\n', at + 1);
    if (at < 0) break;
  }
  if (at >= 0 && at < value.length - 1) preview = value.slice(0, at + 1);
  if (encoder.encode(preview).length > PREVIEW_LIMITS.bytes) {
    let size = 0;
    let cut = 0;
    for (const char of preview) {
      const width = encoder.encode(char).length;
      if (size + width > PREVIEW_LIMITS.bytes) break;
      size += width;
      cut += char.length;
    }
    preview = preview.slice(0, cut);
  }
  return { text: preview, truncated: preview.length < value.length, bytes: encoder.encode(value).length };
}

// One review fact: what the runtime saw of recorded or staged material. Unknown values stay null
// ("unavailable"), never guessed (PRD AC-007).
export function reviewFact({ slot = null, source, path = null, digest = null, text = null, sourceMatch }) {
  const preview = typeof text === 'string' ? reviewPreview(text) : null;
  return {
    slot: bounded(slot),
    source: source === 'path' ? 'path' : 'staged',
    path: bounded(path),
    digest: /^sha256:[a-f0-9]{64}$/u.test(digest ?? '') ? digest : null,
    bytes: preview?.bytes ?? null,
    preview: preview?.text ?? null,
    truncated: preview?.truncated ?? null,
    source_match: SOURCE_MATCHES.includes(sourceMatch) ? sourceMatch : 'unavailable',
  };
}

// The slot (gate or step) a command names, for the event's gate field.
export function commandGate(command = {}) {
  const payload = command.payload ?? {};
  if (command.kind === 'closeout.record') return 'OR';
  if (command.kind === 'step.record') return payload.internal_step ?? RUN_STEP_SLOTS[payload.step] ?? null;
  if (command.kind === 'operation.recover') return null;
  return typeof payload.gate === 'string' ? payload.gate : null;
}

function successKind(command) {
  const kind = command?.kind;
  if (kind === 'presentation.deliver') return 'approval_requested';
  if (kind === 'approval.record') return 'approval_recorded';
  if (kind === 'closeout.record') return 'run_completed';
  if (kind === 'material.stage' && command.payload?.action === 'seal') return 'material_staged';
  if (kind === 'step.record' || kind === 'artefact.record') return 'document_recorded';
  return null;
}

// The event kind of one final command result, or null for a read, a replay or an outcome outside
// the eight kinds. A failure is classified by the projected descriptor's effect state first, so a
// thrown failure of unknown effect is never reported as rejected.
export function eventKind(toolName, input, result) {
  if (!COMMAND_TOOLS.has(toolName) || !result || typeof result !== 'object') return null;
  const descriptor = result._meta?.[TOOL_RESULT_META_KEY] ?? null;
  if (result.outcome === 'accepted') return successKind(input?.command);
  if (result.outcome === 'already_applied') return null;
  if (result.outcome === 'recovery_required') return 'recovery_required';
  if (result.outcome === 'effect_unknown' || descriptor?.effect_state === 'unknown') return 'effect_unknown';
  if (descriptor?.failed || result.outcome === 'rejected') return 'write_rejected';
  return null;
}

// The event of one final tool result: { schema_version, id, at, root, run_id, gate, kind, outcome,
// reason, operation_id, review } or null. `id`, `at` and `root` come from the writer; `review` holds
// the runtime's review facts for staged or recorded material.
export function deriveEvent(toolName, input, result, { id, at, root = null, review = null } = {}) {
  const kind = eventKind(toolName, input, result);
  if (!kind) return null;
  const descriptor = result._meta?.[TOOL_RESULT_META_KEY] ?? null;
  const facts = Array.isArray(review) && review.length && ['material_staged', 'document_recorded'].includes(kind) ? review.slice(0, 4) : null;
  return {
    schema_version: COMPANION_EVENT_SCHEMA,
    id: bounded(id),
    at: bounded(at),
    root: typeof root === 'string' && root.length ? root : bounded(input?.primary_target) ?? bounded(input?.working_directory),
    run_id: bounded(input?.run_id) ?? bounded(result.run_id),
    gate: kind === 'material_staged' ? facts?.[0]?.slot ?? null : commandGate(input?.command),
    kind,
    outcome: bounded(result.outcome) ?? (descriptor?.failed ? 'failed' : null),
    reason: descriptor?.failed ? bounded(descriptor.code) ?? bounded(result.reason) : null,
    operation_id: bounded(input?.operation_id),
    review: facts,
  };
}

// A journal line is an event when it parses and carries the schema, a known kind and an id.
export function validEvent(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && value.schema_version === COMPANION_EVENT_SCHEMA
    && EVENT_KINDS.includes(value.kind) && typeof value.id === 'string' && typeof value.at === 'string';
}

// The events of a journal text in file order; malformed or foreign lines are skipped, since several
// MCP servers may interleave lines (SDD-006).
export function parseEventLines(text) {
  const events = [];
  for (const line of String(text ?? '').split('\n')) {
    if (!line.trim()) continue;
    try {
      const value = JSON.parse(line);
      if (validEvent(value)) events.push(value);
    } catch { /* an interleaved or cut line */ }
  }
  return events;
}

// Roots compare after normalizing separators, a trailing separator and, on win32, case (SD 5).
export function sameRoot(left, right, { win32 = false } = {}) {
  const normal = value => {
    const text = String(value ?? '').replaceAll('\\', '/').replace(/\/+$/u, '');
    return win32 ? text.toLowerCase() : text;
  };
  return Boolean(left) && Boolean(right) && normal(left) === normal(right);
}
