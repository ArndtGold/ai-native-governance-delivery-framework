// Run assignment per session (SDD-06, AC-004): the run changed in this session (most recent wins),
// else the remembered selection for this project, else none. Display only; it binds no AGDF delivery.

// A run state without `updated_at` sorts last and never counts as changed in this session.
const changedAt = run => (run.updatedAt ? Date.parse(run.updatedAt) : -Infinity);
const newestFirst = (left, right) => changedAt(right) - changedAt(left) || left.id.localeCompare(right.id);

// Only an active run is open. A superseded or abandoned run is closed like a completed one, but it
// is never assigned: it has no fertig state to show.
const ASSIGNABLE = new Set(['active', 'completed']);
export const openRuns = runs => runs.filter(run => run.lifecycle === 'active').sort(newestFirst);

// runs: parsed runs of the project; sessionStartedAt: host time (ms) at session.start;
// selection: remembered run id or null. Returns { run, origin, open, dropSelection }.
// A run completed during this session stays assigned, so its fertig state remains visible.
export function assignRun({ runs, sessionStartedAt, selection = null }) {
  const open = openRuns(runs);
  const changed = runs.filter(run => ASSIGNABLE.has(run.lifecycle) && changedAt(run) >= sessionStartedAt).sort(newestFirst);
  const selected = selection ? open.find(run => run.id === selection) ?? null : null;
  const dropSelection = Boolean(selection) && !selected;
  if (changed.length) return { run: changed[0], origin: 'session', open, dropSelection };
  if (selected) return { run: selected, origin: 'selected', open, dropSelection };
  return { run: null, origin: 'none', open, dropSelection };
}

// Steps through the open runs from the shown one (offset -1 or 1) for an explicit selection.
export function stepSelection(open, currentId, offset) {
  if (!open.length) return null;
  const at = open.findIndex(run => run.id === currentId);
  const from = at < 0 ? (offset > 0 ? -1 : 0) : at;
  return open[(from + offset + open.length) % open.length].id;
}
