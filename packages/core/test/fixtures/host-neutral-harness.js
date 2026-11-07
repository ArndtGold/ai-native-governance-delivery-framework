// A host-neutral consumer of the companion core (TP T-011; SD SDD-001, SDD-004, SDD-009): it renders
// the run view, the figure state and the journal events from Core's companion exports and the
// versioned formats alone. It imports no host adapter, no Claude module and no MCP operation.
import { readRunView } from '../../lib/companion/run-view.js';
import { deriveFigureState } from '../../lib/companion/figure-state.js';
import { parseEventLines, sameRoot } from '../../lib/companion/events.js';

const MARK = Object.freeze({ fulfilled: 'done', current: 'current', blocked: 'current', open: 'open' });

// One readable run as a host would draw it.
export function renderRun(entry) {
  const figure = deriveFigureState(entry);
  return {
    id: entry.run_id,
    lifecycle: entry.lifecycle,
    status: entry.status ?? null,
    gate: entry.current_gate ?? null,
    path: (entry.path ?? []).map(({ gate, status }) => `${gate}:${MARK[status] ?? 'open'}`),
    missing: entry.missing_approval ?? 'none',
    next: entry.next_step_text ?? '',
    blocking: entry.blocking_text ?? '',
    mood: figure.mood,
    reason: figure.reason,
    drift: (entry.drift ?? []).map(item => `${item.document}:${item.recorded_digest}->${item.current_digest}`),
  };
}

export function renderView(view) {
  return {
    schema: view.schema_version,
    store: view.store.status,
    runs: view.runs.filter(entry => entry.valid !== false && entry.listed !== false).map(renderRun),
    unreadable: view.diagnosis.unreadable.map(row => `${row.run_id}:${row.reason}`),
  };
}

// The journal events of one project root, in file order.
export const renderEvents = (journalText, root) => parseEventLines(journalText).filter(event => sameRoot(event.root, root, { win32: /^[a-z]:[\\/]/iu.test(root) }))
  .map(event => ({ kind: event.kind, run: event.run_id, gate: event.gate, review: event.review?.[0]?.source_match ?? null }));

export function renderProject(root, { language = 'en', runIds = [], journalText = '' } = {}) {
  const view = readRunView(root, { language, runIds });
  return { view, rendered: renderView(view), events: renderEvents(journalText, root) };
}
