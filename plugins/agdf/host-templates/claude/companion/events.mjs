// Companion events (companion core SDD-007, decision P1): turns the events of the current project
// root into toasts and pane entries. The events come from the run view, which reads the MCP server's
// journal through Core's single journal reader (run run-71aa7dbb, SD SDD-004); this module parses no
// journal line. The journal is a notification channel only: the run view stays the source of every
// run state, and the companion never invents an event. It imports no Core module.

// The journal file whose size and modification time tell the companion that new events may exist.
export const JOURNAL_FILE = 'events.jsonl';
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

// The run view's events of this root after the cursor ({ id, at } of the last event seen), in journal
// order. Without a cursor the read is a baseline: nothing is fresh. A cursor that left the history
// (rotation, history limit) falls back to the event time. A view read before the cursor's event (an
// overlapping read applied later) never moves the cursor back, so no event is announced twice.
export function unseenEvents(events, { cursor }) {
  const last = events.at(-1);
  if (!cursor) return { fresh: [], cursor: last ? { id: last.id, at: last.at } : cursor };
  const at = events.findIndex(event => event.id === cursor.id);
  const after = at >= 0 ? events.slice(at + 1) : events.filter(event => typeof event.at === 'string' && event.at > cursor.at);
  const older = at < 0 && !after.length && typeof cursor.at === 'string' && !(typeof last?.at === 'string' && last.at > cursor.at);
  return { fresh: after, cursor: last && !older ? { id: last.id, at: last.at } : cursor };
}

// The lines a history view of one run lists (Codex companion card, SD SDD-006): durable facts only
// once `runs` confirm them, every still-uncertain outcome up to `limit`, then the newest others.
// `events` are newest first; the result keeps that order.
export function historyEvents(events, runs = [], { limit = PANE_EVENTS } = {}) {
  const confirmed = events.filter(event => isConfirmed(event, runs));
  const pinned = confirmed.filter(event => isStillUncertain(event, runs)).slice(0, limit);
  const others = confirmed.filter(event => !pinned.includes(event)).slice(0, Math.max(0, limit - pinned.length));
  return confirmed.filter(event => pinned.includes(event) || others.includes(event));
}

// A run id as people read it: a generated `run-<uuid>` id keeps its first block, a chosen id stays whole.
export const shortRunId = id => String(id ?? '').replace(/^(run-[0-9a-f]{8})(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/u, '$1');

// The name an event line gives its run, or null for the run the panel shows: the panel already names
// that run, so its events carry no second id (owner request of 2026-11-06, T-013). Another run is
// named by its title from the run view, else by its objective, else by its short id. `naming` is
// { shownRunId, runs }.
export function eventRunLabel(runId, { shownRunId = null, runs = [] } = {}) {
  if (!runId || runId === shownRunId) return null;
  const run = runs.find(item => item.id === runId);
  const name = [run?.title, run?.objective].find(value => typeof value === 'string' && value.trim());
  return name ? name.trim() : shortRunId(runId);
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
