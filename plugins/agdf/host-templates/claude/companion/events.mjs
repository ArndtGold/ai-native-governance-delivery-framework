// Companion events (companion core SDD-007, decision P1): reads the MCP server's journal of final AGDF
// tool results (`companion-event/1`, written below the plugin data root) and turns the events of the
// current project root into toasts and pane entries. The journal is a notification channel only: the
// run view stays the source of every run state, and the companion never invents an event. It imports
// no Core module; the format is the versioned journal format of SDD-009.

export const EVENT_POLL_MS = 2_000;
export const EVENT_SCHEMA = 'companion-event/1';
export const JOURNAL_FILE = 'events.jsonl';
// The writer's one rotation file; read only when the cursor left the current file (CR finding B6).
export const JOURNAL_ROTATED_FILE = 'events.1.jsonl';
// The writer bounds the journal to 256 KiB; a larger file is not read (bounded read).
export const JOURNAL_READ_LIMIT = 512 * 1024;
export const EVENT_KINDS = Object.freeze(['approval_requested', 'approval_recorded', 'write_rejected', 'effect_unknown',
  'recovery_required', 'run_completed', 'material_staged', 'document_recorded']);
// Decision P1: these interrupt as a toast; approval recorded and write rejected stay in the pane.
export const TOAST_KINDS = Object.freeze(['approval_requested', 'effect_unknown', 'recovery_required', 'run_completed']);
// Durable facts are confirmed against the run view before they are shown as final (SD 2, CR finding B4).
export const CONFIRMED_KINDS = Object.freeze(['approval_recorded', 'run_completed']);
// Uncertain outcomes stay in the pane past the next turn until the run state recorded a later
// operation (PRD state transition "effect unknown or recovery required", CR finding B7).
export const STICKY_KINDS = Object.freeze(['effect_unknown', 'recovery_required']);
export const PANE_EVENTS = 5;

export const journalDirectory = dataDir => `${dataDir}/companion`;

// Whether the run view confirms an event's durable fact: the run completed, or the approved gate is
// fulfilled on its path. Other kinds need no confirmation. `runs` are the companion's runs.
export function isConfirmed(event, runs = []) {
  if (!CONFIRMED_KINDS.includes(event.kind)) return true;
  const run = runs.find(item => item.id === event.run_id);
  if (!run) return false;
  if (event.kind === 'run_completed') return run.lifecycle === 'completed';
  return (run.path ?? []).some(step => step.gate === event.gate && step.status === 'fulfilled');
}

// Whether an uncertain outcome still stands: its run recorded no later operation in the run view.
export function isStillUncertain(event, runs = []) {
  if (!STICKY_KINDS.includes(event.kind)) return false;
  const run = runs.find(item => item.id === event.run_id);
  return !run?.updatedAt || run.updatedAt <= event.at;
}

// One journal text as its valid events in file order; interleaved, cut or foreign lines are skipped.
export function parseJournal(text) {
  const events = [];
  for (const line of String(text ?? '').split('\n')) {
    if (!line.trim()) continue;
    try {
      const value = JSON.parse(line);
      if (value?.schema_version === EVENT_SCHEMA && EVENT_KINDS.includes(value.kind) && typeof value.id === 'string' && typeof value.at === 'string') events.push(value);
    } catch { /* an interleaved or cut line */ }
  }
  return events;
}

// Roots compare after normalizing separators and a trailing separator, and case for a drive path.
export function normalizeRoot(root) {
  const text = String(root ?? '').replaceAll('\\', '/').replace(/\/+$/u, '');
  // Windows roots (drive letter or UNC) compare without case, like Core's sameRoot on win32 (CR finding CIR-04).
  return /^(?:[a-z]:(?:\/|$)|\/\/)/iu.test(text) ? text.toLowerCase() : text;
}
export const sameRoot = (left, right) => Boolean(left) && Boolean(right) && normalizeRoot(left) === normalizeRoot(right);

// The events of `root` after the cursor ({ id, at } of the last event seen in the file). Without a
// cursor the read is a baseline: nothing is fresh. A cursor that left the file (rotation) falls back
// to the event time.
export function unseenEvents(events, { root, cursor }) {
  const last = events.at(-1);
  const next = last ? { id: last.id, at: last.at } : cursor;
  if (!cursor) return { fresh: [], cursor: next };
  const at = events.findIndex(event => event.id === cursor.id);
  const after = at >= 0 ? events.slice(at + 1) : events.filter(event => event.at > cursor.at);
  return { fresh: after.filter(event => sameRoot(event.root, root)), cursor: next };
}

// A run id as people read it: a generated `run-<uuid>` id keeps its first block, a chosen id stays whole.
export const shortRunId = id => String(id ?? '').replace(/^(run-[0-9a-f]{8})(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/u, '$1');

// The name an event line gives its run, or null for the run the panel shows: the panel already names
// that run, so its events carry no second id (owner request of 2026-11-06, T-013). Another run is
// named by its objective from the run view, else by its short id. `naming` is { shownRunId, runs }.
export function eventRunLabel(runId, { shownRunId = null, runs = [] } = {}) {
  if (!runId || runId === shownRunId) return null;
  const objective = runs.find(item => item.id === runId)?.objective;
  return typeof objective === 'string' && objective.trim() ? objective.trim() : shortRunId(runId);
}

// An event text with the name of a run other than the shown one after it, so a cut line keeps the event.
export function namedEventText(text, runId, t, naming = {}) {
  const run = eventRunLabel(runId, naming);
  return run ? t('events.ofRun', { text, run }) : text;
}

// The text of one event; gate titles and reasons come localized from the caller.
export function eventText(event, t, { gateTitle = gate => gate, shownRunId = null, runs = [] } = {}) {
  const text = t(`events.${event.kind}`, { gate: event.gate ? gateTitle(event.gate) : '', reason: event.reason ?? '' });
  return namedEventText(text, event.run_id, t, { shownRunId, runs });
}

const shortDigest = digest => (typeof digest === 'string' ? `${digest.slice(0, 15)}…` : '–');

// The review facts of the newest staging or recording event: summary, source match and the bounded
// preview (decision P2). Unknown values stay unavailable, never guessed.
export function latestReview(events, t) {
  const event = events.find(item => Array.isArray(item.review) && item.review.length);
  if (!event) return null;
  const fact = event.review[0];
  return {
    summary: t('review.summary', { slot: fact.slot ?? event.gate ?? '', bytes: fact.bytes ?? '–', digest: shortDigest(fact.digest) }),
    match: t(`review.${['match', 'mismatch', 'not_determinable'].includes(fact.source_match) ? fact.source_match : 'unavailable'}`),
    preview: typeof fact.preview === 'string' ? fact.preview : null,
    truncated: fact.truncated === true ? t('review.truncated') : null,
  };
}

export { shortDigest };
