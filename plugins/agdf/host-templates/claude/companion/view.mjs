// Panel view model and terminal text (AC-002, AC-005, AC-006, AC-010): turns a snapshot, the
// session's assignment and the user's choices into localized, display-ready fields. Read-only and
// host-independent; the adapter draws it on desktop or as text in the terminal.

import { assignRun } from './assignment.mjs';
import { FIGURE_TEXT, INVITE_TEXT } from './figure.mjs';
import { condensedGateBar, gateBar, gateMarks } from './gate-bar.mjs';
import { gateRationale, gateTitle, label } from './localization.mjs';
import { displayState, runState } from './state.mjs';
import { isStructured, READ_FAILURE_REASONS } from './run-state.mjs';
import { eventText, latestReview, PANE_EVENTS, shortDigest, shortRunId } from './events.mjs';

const two = value => String(value).padStart(2, '0');
// Preview lines the terminal text shows beneath the material line.
export const TERMINAL_PREVIEW_LINES = 3;
// Last part of a project root in either path form ("C:\Work\app\" → "app").
const folderName = root => String(root ?? '').replace(/[\\/]+$/u, '').split(/[\\/]/u).pop() || String(root ?? '');
// Host-local wall-clock time, HH:MM.
export const clockText = ms => { const at = new Date(ms); return `${two(at.getHours())}:${two(at.getMinutes())}`; };

// The name a person reads for the shown run: its stable title, else the catalog's "new run". The run
// id never names a run; it stays a reference line at the panel's end.
export const runName = (run, t) => run.title || t('fields.newRun');
// A listed run needs a name that tells it from its neighbours, so an untitled one adds its short id.
export const listedRunName = (run, t) => run.title || `${t('fields.newRun')} · ${shortRunId(run.id)}`;

// Whose move it is (owner request of 2026-11-11): read from the figure state Core derived, so the
// block never decides anything itself. `tone` is you (an approval or decision is yours), claude (the
// agent works on the gate) or halt (the run is blocked). A state that concerns no gate work has no such
// block, and neither has the terminal's turn overlay: its reason already says that Claude works.
export function turnOf(state, run, t, gateName) {
  const { key, gate, decision } = state.reason;
  const at = gate ?? run.gate;
  if (!at) return null;
  if (key === 'waitingApproval') {
    return { tone: 'you', who: t('turn.you'), what: t('turn.approve', { gate: gateName(at) }),
      how: run.missing && run.missing !== 'none' ? t('turn.inChat', { approval: run.missing }) : null, gate: at };
  }
  if (key === 'waitingDecision') return { tone: 'you', who: t('turn.you'), what: t('turn.decide', { gate: gateName(at) }), how: null, gate: at };
  if (key === 'blocked') {
    return { tone: 'halt', who: t('turn.blocked'), what: t('reasons.blocked', { gate: gateName(at), decision: run.blockingText || decision || '' }), how: null, gate: at };
  }
  return key === 'working' || key === 'building' ? { tone: 'claude', who: t('turn.claude'), what: gateName(at), how: null, gate: at } : null;
}

// About two pane lines of the goal, cut at a word, so the block that asks for a move stays in sight.
const GOAL_LINES = 2;
export function goalLine(goal, columns) {
  const room = Math.max(40, (Number.isFinite(columns) ? columns : 60) * GOAL_LINES);
  if (goal.length <= room) return goal;
  const cut = goal.slice(0, room - 1), at = cut.lastIndexOf(' ');
  return `${(at > room / 2 ? cut.slice(0, at) : cut).replace(/[\s,;:.–-]+$/u, '')}…`;
}

// The delivery path and the position on it, e.g. "Strukturierte Lieferung · Schritt 2 von 8". Before
// the path is decided only that is said; a path that names no current entry gives no position.
export function routeLine(run, marks, t) {
  const key = isStructured(run.route) ? 'structured' : run.route === 'quick_task' || run.route === 'verified_change' ? run.route
    : (run.route === 'undecided' || run.route == null) && run.evaluated && run.lifecycle === 'active' ? 'undecided' : null;
  if (!key) return null;
  const at = marks.findIndex(({ mark }) => mark === 'current');
  return key === 'undecided' || at < 0 ? t(`routes.${key}`) : `${t(`routes.${key}`)} · ${t('fields.step', { position: at + 1, count: marks.length })}`;
}

// input: { snapshot, sessionStartedAt, selection, mention, isBrowsing, isTurnActive, registry, labels,
// locale, columns, isInfoExpanded, events, eventsAvailable }. Display only: the adapter persists
// selection changes. `events` are this root's journal events since the last main-loop turn, newest first.
export function buildPanelView(input) {
  const { snapshot, registry, labels, locale } = input;
  const t = (path, params) => label(labels, locale, path, params);
  const base = { title: t('title'), locale, mood: 'bereit', stateLabel: t('states.bereit'),
    readAt: snapshot ? t('fields.lastRead', { time: clockText(snapshot.readAt) }) : null,
    stale: snapshot?.stale ? t('messages.stale', { time: clockText(snapshot.stale.failedAt), readAt: clockText(snapshot.readAt) }) : null,
    canRetry: true, openRuns: [] };
  // Event lines name only runs other than the shown one (owner request of 2026-11-06, T-013).
  const events = shownRunId => eventFields(input, t, { shownRunId, runs: snapshot?.runs ?? [] });
  const neutral = (message, extra = {}) => ({ ...base, ...events(null), message, ...extra });
  const unreadable = reason => neutral(t('messages.unreadable', { reason: t(`unreadable.${reason}`) }));

  if (!snapshot) return neutral(t('messages.reading'), { readAt: null });
  if (snapshot.status === 'failed') {
    const reason = READ_FAILURE_REASONS.includes(snapshot.error) ? snapshot.error : 'unavailable';
    return neutral(t('messages.runViewUnavailable', { reason: t(`unreadable.${reason}`) }));
  }
  if (snapshot.status === 'unavailable') {
    // An unsupported store names how many run folders it holds and why none is readable (AC-002).
    const reason = snapshot.reason ?? 'read_failed';
    return snapshot.runFolders
      ? neutral(t('messages.unreadableRuns', { count: snapshot.runFolders, reasons: t(`unreadable.${reason}`) }))
      : unreadable(reason);
  }
  if (snapshot.status === 'no_control') {
    // A project without AGDF is invited to start, not told about a missing folder (owner request of
    // 2026-11-12): the figure holds the start sign, and the checked path and the finding sit behind the (i).
    return neutral(t('messages.notSetUp'), { hint: t('messages.notSetUpHint'), invite: true, idle: true,
      isInfoExpanded: Boolean(input.isInfoExpanded), info: [
        { label: t('fields.checkedFolder'), text: snapshot.root ?? '' },
        { label: t('fields.finding'), text: t('messages.noControl', { folder: folderName(snapshot.root) }) }] });
  }

  const { run, origin, open, chatRunId } = assignRun({ runs: snapshot.runs, sessionStartedAt: input.sessionStartedAt, selection: input.selection,
    mention: input.mention ?? null, isBrowsing: Boolean(input.isBrowsing) });
  // Unreadable runs stay visible as a count with their reasons beside the readable ones (AC-002, AC-003).
  const reasons = [...new Set(snapshot.unreadable.map(item => t(`unreadable.${item.reason}`)))].join(', ');
  const unreadableHint = snapshot.unreadable.length ? t('messages.unreadableRuns', { count: snapshot.unreadable.length, reasons }) : null;
  // Each open run carries its condensed gate bar for the list (owner request of 2026-10-28).
  const openRuns = open.map(item => ({ id: item.id, name: listedRunName(item, t), objective: item.objective, bar: condensedGateBar(gateMarks(item)) }));
  if (!run) {
    const broken = input.selection && snapshot.unreadable.find(item => item.id === input.selection);
    if (broken) return { ...unreadable(broken.reason), openRuns, chatRunId, unreadableHint };
    // A readable project without an assigned run idles: the figure blinks but shows no run state.
    if (!open.length) {
      if (unreadableHint) return neutral(unreadableHint, { idle: false });
      const runs = snapshot.runs ?? [];
      // "All done" only when every run completed; superseded or abandoned runs did not finish.
      if (!runs.length) return neutral(t('messages.noRunsYet'), { idle: true, hint: t('messages.noRunsYetHint') });
      if (runs.every(item => item.lifecycle === 'completed')) return neutral(t('messages.allRunsDone'), { idle: true, allDone: true, hint: t('messages.allRunsDoneHint') });
      return neutral(t('messages.noOpenRuns'), { idle: true });
    }
    return neutral(t('messages.noRunAssigned'), { idle: true, hint: t('messages.noRunAssignedHint'), openRuns, chatRunId, unreadableHint,
      openCount: t('fields.openRuns', { count: open.length }) });
  }

  const position = open.findIndex(item => item.id === run.id);
  const openCount = position >= 0 ? t('fields.position', { position: position + 1, count: open.length }) : t('fields.openRuns', { count: open.length });
  const state = input.showRunState ? runState(run) : displayState(run, { isTurnActive: input.isTurnActive });
  const reasonParams = { gate: gateTitle(registry, locale, state.reason.gate), decision: run.blockingText || state.reason.decision,
    reason: state.reason.reason ? t(`unreadable.${state.reason.reason}`) : '' };
  // A gate by its localized title with its short name, e.g. "Produktanforderungen (PRD)".
  const gateName = gate => { const title = gateTitle(registry, locale, gate); return title === gate ? gate : `${title} (${gate})`; };
  const marks = gateMarks(run);
  const name = runName(run, t);
  const turn = turnOf(state, run, t, gateName);
  // The goal in the display language; a goal that only repeats the name is not said twice.
  const goal = run.goal || run.objective;
  const objective = goal && goal !== name ? goal : '';
  // What the gate in question decides; a blocked run names its block instead.
  const rationale = turn && turn.tone !== 'halt' ? gateRationale(registry, locale, turn.gate) : null;
  // A completed run names no next step, unless it is blocked: then the step says what to do about it.
  const step = run.lifecycle === 'completed' && run.figure?.reason?.key !== 'blocked' ? null : run.nextText || null;
  // For an approval the turn block already says what to do and how, so the next step only repeats it.
  const stepRepeats = Boolean(step) && state.reason.key === 'waitingApproval' && Boolean(turn);
  // The goal stands under the run's name, before whose move it is: it is what an approval is measured
  // against (owner request of 2026-11-12). About two pane lines of it; the rest is behind the (i).
  const goalShown = objective ? goalLine(objective, input.columns) : '';
  // Details a person opens on purpose behind the (i): a goal that was cut, what the gate decides, and
  // a next step that only repeats the approval. Closed by default.
  const info = [
    objective && goalShown !== objective ? { label: t('fields.objective'), text: objective } : null,
    rationale ? { label: t('fields.gatePurpose'), text: rationale } : null,
    stepRepeats ? { label: t('fields.nextStep'), text: step } : null,
  ].filter(Boolean);
  return {
    ...base,
    ...events(run.id),
    ...(input.showRunState ? { figure: state } : {}),
    mood: state.mood,
    workGate: input.showRunState && run.evaluated && !snapshot.stale ? run.gate : undefined,
    stateLabel: t(`states.${state.mood}`),
    reason: t(`reasons.${state.reason.key}`, reasonParams),
    gateBar: gateBar(marks, input.columns),
    runId: run.id,
    name,
    route: routeLine(run, marks, t),
    turn,
    rationale,
    objective,
    goal: goalShown,
    info,
    isInfoExpanded: Boolean(input.isInfoExpanded),
    // The next step stays in sight where it says something the turn block does not.
    nextStep: stepRepeats ? null : step,
    unreadableHint,
    origin: t(`origin.${origin}`),
    originKind: origin,
    chatRunId,
    openRuns,
    openCount,
    drift: run.drift?.length ? run.drift.map(item => t('messages.drift', { document: item.document,
      recorded: shortDigest(item.recorded_digest), current: shortDigest(item.current_digest) })) : null,
  };
}

// Pane entries of the journal (decision P1) and the review facts of the newest staging or recording
// (decision P2); without a readable journal the pane says so and invents nothing. `naming` is
// { shownRunId, runs }: the shown run's events name no run.
function eventFields(input, t, naming) {
  const events = (input.events ?? []).slice(0, PANE_EVENTS);
  const gate = value => gateTitle(input.registry, input.locale, value);
  return {
    events: events.length ? events.map(event => `${clockText(Date.parse(event.at))} ${eventText(event, t, { gateTitle: gate, ...naming })}`) : null,
    review: latestReview(events, t),
    eventsHint: input.eventsAvailable === false ? t('messages.eventsUnavailable') : null,
  };
}

// Text fallback for surfaces without Svg: state, gate bar and next step on separate lines.
export function terminalText(view, { labels, locale }) {
  const t = path => label(labels, locale, path);
  // The turn line says what the reason would; without one the reason stays beside the state.
  const lines = [view.title, `${view.invite ? INVITE_TEXT : FIGURE_TEXT[view.mood]} ${view.stateLabel}${view.reason && !view.turn ? ` · ${view.reason}` : ''}`];
  if (view.message) lines.push(view.message);
  if (view.hint) lines.push(view.hint);
  if (view.unreadableHint && view.unreadableHint !== view.message) lines.push(view.unreadableHint);
  if (view.name) lines.push(view.route ? `${view.name} · ${view.route}` : view.name);
  if (view.goal) lines.push(`${t('fields.objective')}: ${view.goal}`);
  if (view.turn) lines.push(`${view.turn.who}: ${view.turn.what}${view.turn.how ? ` · ${view.turn.how}` : ''}`);
  if (view.gateBar) lines.push(view.gateBar);
  if (view.nextStep) lines.push(`${t('fields.nextStep')}: ${view.nextStep}`);
  // The (i) details appear only once opened; its button is drawn beside this text.
  if (view.isInfoExpanded) for (const item of view.info ?? []) lines.push(`${item.label}: ${item.text}`);
  for (const warning of view.drift ?? []) lines.push(warning);
  if (view.events) lines.push(`${t('fields.events')}:`, ...view.events);
  if (view.review) {
    lines.push(`${t('fields.material')}: ${view.review.summary} · ${view.review.match}${view.review.truncated ? ` · ${view.review.truncated}` : ''}`);
    // The terminal shows the start of the preview too (PRD M1, AC-007; CR finding B10).
    if (view.review.preview) lines.push(...view.review.preview.split('\n').slice(0, TERMINAL_PREVIEW_LINES).map(line => `  ${line}`));
  }
  if (view.eventsHint) lines.push(view.eventsHint);
  // The run id is a reference, so it stands after what a person reads.
  if (view.runId) lines.push(view.origin ? `${view.runId} · ${view.origin}` : view.runId);
  if (view.stale) lines.push(view.stale);
  if (view.readAt) lines.push(view.readAt);
  return lines.join('\n');
}
