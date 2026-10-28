// Run assignment per session (SDD-06, AC-004; chat-run navigation SDD-01 to SDD-04): the chat's run
// (named in a main-loop turn or changed in this session, the later wins) unless the user browses,
// else the remembered selection for this project, else none. Display only; it binds no AGDF delivery.

// A run state without `updated_at` sorts last and never counts as changed in this session.
const changedAt = run => (run.updatedAt ? Date.parse(run.updatedAt) : -Infinity);
const newestFirst = (left, right) => changedAt(right) - changedAt(left) || left.id.localeCompare(right.id);

// Only an active run is open. A superseded or abandoned run is closed like a completed one, but it
// is never assigned: it has no fertig state to show.
const ASSIGNABLE = new Set(['active', 'completed']);
export const openRuns = runs => runs.filter(run => run.lifecycle === 'active').sort(newestFirst);

// A run id is made of these characters; a mention counts only as a whole token. A dot ends a mention
// unless an id character follows it, so a sentence may end with a run id (chat-run navigation SDD-01).
const ID_CHAR = /[a-z0-9_-]/iu;
const MENTION_WINDOW = 65_536;
const bounded = (text, at, end) => !(at > 0 && (ID_CHAR.test(text[at - 1]) || text[at - 1] === '.'))
  && !(end < text.length && (ID_CHAR.test(text[end]) || text[end] === '.' && ID_CHAR.test(text[end + 1] ?? '')));

// The id of `ids` that a text names last as a whole token, or null; a long text is read from its end,
// with the character before that window still bounding a mention (CR-F08).
export function namedRun(text, ids) {
  if (typeof text !== 'string' || !text) return null;
  const from = Math.max(0, text.length - MENTION_WINDOW);
  let named = null;
  let namedEnd = -1;
  for (const id of ids) {
    if (!id) continue;
    for (let at = text.indexOf(id, from); at >= 0; at = text.indexOf(id, at + 1)) {
      const end = at + id.length;
      if (end > namedEnd && bounded(text, at, end)) { named = id; namedEnd = end; }
    }
  }
  return named;
}

// runs: parsed runs of the project; sessionStartedAt: host time (ms) at session.start;
// selection: remembered run id or null; mention: { runId, at } of the last open run a main-loop turn
// named, or null; isBrowsing: the user browsed away from the chat's run since the last main-loop turn.
// Returns { run, origin, open, dropSelection, chatRunId }.
// The chat's run is the later of the mention and the newest change in this session (chat-run
// navigation SDD-02, SDD-03); it is shown unless the user browses to a remembered selection. A run
// completed during this session stays assigned, so its fertig state remains visible.
export function assignRun({ runs, sessionStartedAt, selection = null, mention = null, isBrowsing = false }) {
  const open = openRuns(runs);
  const changed = runs.filter(run => ASSIGNABLE.has(run.lifecycle) && changedAt(run) >= sessionStartedAt).sort(newestFirst);
  const selected = selection ? open.find(run => run.id === selection) ?? null : null;
  const dropSelection = Boolean(selection) && !selected;
  const named = mention ? open.find(run => run.id === mention.runId) ?? null : null;
  const chat = named && (!changed.length || mention.at >= changedAt(changed[0])) ? { run: named, origin: 'named' }
    : changed.length ? { run: changed[0], origin: 'session' } : null;
  const chatRunId = chat?.run.id ?? null;
  if (chat && !(isBrowsing && selected)) return { run: chat.run, origin: chat.origin, open, dropSelection, chatRunId };
  if (selected) return { run: selected, origin: 'selected', open, dropSelection, chatRunId };
  return { run: null, origin: 'none', open, dropSelection, chatRunId };
}

// Steps through the open runs from the shown one (offset -1 or 1) for an explicit selection.
export function stepSelection(open, currentId, offset) {
  if (!open.length) return null;
  const at = open.findIndex(run => run.id === currentId);
  const from = at < 0 ? (offset > 0 ? -1 : 0) : at;
  return open[(from + offset + open.length) % open.length].id;
}
