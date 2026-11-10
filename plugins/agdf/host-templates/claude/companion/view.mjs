// Panel view model and terminal text (AC-002, AC-005, AC-006, AC-010): turns a snapshot, the
// session's assignment and the user's choices into localized, display-ready fields. Read-only and
// host-independent; the adapter draws it on desktop or as text in the terminal.

import { assignRun } from './assignment.mjs';
import { FIGURE_TEXT } from './figure.mjs';
import { condensedGateBar, gateBar, gateMarks } from './gate-bar.mjs';
import { gateTitle, label } from './localization.mjs';
import { displayState, runState } from './state.mjs';
import { READ_FAILURE_REASONS } from './run-state.mjs';
import { eventText, latestReview, PANE_EVENTS, shortDigest } from './events.mjs';

const two = value => String(value).padStart(2, '0');
// Preview lines the terminal text shows beneath the material line.
export const TERMINAL_PREVIEW_LINES = 3;
// Last part of a project root in either path form ("C:\Work\app\" → "app").
const folderName = root => String(root ?? '').replace(/[\\/]+$/u, '').split(/[\\/]/u).pop() || String(root ?? '');
// Host-local wall-clock time, HH:MM.
export const clockText = ms => { const at = new Date(ms); return `${two(at.getHours())}:${two(at.getMinutes())}`; };

// input: { snapshot, sessionStartedAt, selection, mention, isBrowsing, isTurnActive, registry, labels,
// locale, columns, isObjectiveExpanded, events, eventsAvailable }. Display only: the adapter persists
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
    return neutral(t('messages.noControl', { folder: folderName(snapshot.root) }), { hint: t('messages.noControlHint', { path: snapshot.root ?? '' }) });
  }

  const { run, origin, open, chatRunId } = assignRun({ runs: snapshot.runs, sessionStartedAt: input.sessionStartedAt, selection: input.selection,
    mention: input.mention ?? null, isBrowsing: Boolean(input.isBrowsing) });
  // Unreadable runs stay visible as a count with their reasons beside the readable ones (AC-002, AC-003).
  const reasons = [...new Set(snapshot.unreadable.map(item => t(`unreadable.${item.reason}`)))].join(', ');
  const unreadableHint = snapshot.unreadable.length ? t('messages.unreadableRuns', { count: snapshot.unreadable.length, reasons }) : null;
  // Each open run carries its condensed gate bar for the list (owner request of 2026-10-28).
  const openRuns = open.map(item => ({ id: item.id, objective: item.objective, bar: condensedGateBar(gateMarks(item)) }));
  if (!run) {
    const broken = input.selection && snapshot.unreadable.find(item => item.id === input.selection);
    if (broken) return { ...unreadable(broken.reason), openRuns, chatRunId, unreadableHint };
    if (!open.length) return neutral(unreadableHint ?? t('messages.noOpenRuns'));
    return neutral(t('messages.noRunAssigned'), { hint: t('messages.noRunAssignedHint'), openRuns, chatRunId, unreadableHint,
      openCount: t('fields.openRuns', { count: open.length }) });
  }

  const position = open.findIndex(item => item.id === run.id);
  const openCount = position >= 0 ? t('fields.position', { position: position + 1, count: open.length }) : t('fields.openRuns', { count: open.length });
  const state = input.showRunState ? runState(run) : displayState(run, { isTurnActive: input.isTurnActive });
  const reasonParams = { gate: gateTitle(registry, locale, state.reason.gate), decision: run.blockingText || state.reason.decision,
    reason: state.reason.reason ? t(`unreadable.${state.reason.reason}`) : '' };
  return {
    ...base,
    ...events(run.id),
    ...(input.showRunState ? { figure: state } : {}),
    mood: state.mood,
    workGate: input.showRunState && run.evaluated && !snapshot.stale ? run.gate : undefined,
    stateLabel: t(`states.${state.mood}`),
    reason: t(`reasons.${state.reason.key}`, reasonParams),
    gateBar: gateBar(gateMarks(run), input.columns),
    runId: run.id,
    objective: run.objective,
    isObjectiveExpanded: Boolean(input.isObjectiveExpanded),
    nextStep: run.lifecycle === 'completed' ? null : run.nextText || null,
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
  const lines = [view.title, `${FIGURE_TEXT[view.mood]} ${view.stateLabel}${view.reason ? ` · ${view.reason}` : ''}`];
  if (view.message) lines.push(view.message);
  if (view.hint) lines.push(view.hint);
  if (view.unreadableHint && view.unreadableHint !== view.message) lines.push(view.unreadableHint);
  if (view.gateBar) lines.push(view.gateBar);
  if (view.runId) lines.push(view.origin ? `${view.runId} · ${view.origin}` : view.runId);
  if (view.objective) lines.push(`${t('fields.objective')}: ${view.objective}`);
  if (view.nextStep) lines.push(`${t('fields.nextStep')}: ${view.nextStep}`);
  for (const warning of view.drift ?? []) lines.push(warning);
  if (view.events) lines.push(`${t('fields.events')}:`, ...view.events);
  if (view.review) {
    lines.push(`${t('fields.material')}: ${view.review.summary} · ${view.review.match}${view.review.truncated ? ` · ${view.review.truncated}` : ''}`);
    // The terminal shows the start of the preview too (PRD M1, AC-007; CR finding B10).
    if (view.review.preview) lines.push(...view.review.preview.split('\n').slice(0, TERMINAL_PREVIEW_LINES).map(line => `  ${line}`));
  }
  if (view.eventsHint) lines.push(view.eventsHint);
  if (view.stale) lines.push(view.stale);
  if (view.readAt) lines.push(view.readAt);
  return lines.join('\n');
}
