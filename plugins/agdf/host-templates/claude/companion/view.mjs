// Panel view model and terminal text (AC-002, AC-005, AC-006, AC-010): turns a snapshot, the
// session's assignment and the user's choices into localized, display-ready fields. Read-only and
// host-independent; the adapter draws it on desktop or as text in the terminal.

import { assignRun } from './assignment.mjs';
import { FIGURE_TEXT } from './figure.mjs';
import { gateBar, gateMarks } from './gate-bar.mjs';
import { gateTitle, label, localizeNextStep } from './localization.mjs';
import { displayState } from './state.mjs';

const two = value => String(value).padStart(2, '0');
// Last part of a project root in either path form ("C:\Work\app\" → "app").
const folderName = root => String(root ?? '').replace(/[\\/]+$/u, '').split(/[\\/]/u).pop() || String(root ?? '');
// Host-local wall-clock time, HH:MM.
export const clockText = ms => { const at = new Date(ms); return `${two(at.getHours())}:${two(at.getMinutes())}`; };

// input: { snapshot, sessionStartedAt, selection, isTurnActive, registry, labels, locale, columns,
// isObjectiveExpanded }. Display only: the adapter persists selection changes.
export function buildPanelView(input) {
  const { snapshot, registry, labels, locale } = input;
  const t = (path, params) => label(labels, locale, path, params);
  const base = { title: t('title'), locale, mood: 'neutral', stateLabel: t('states.neutral'),
    readAt: snapshot ? t('fields.lastRead', { time: clockText(snapshot.readAt) }) : null,
    stale: snapshot?.stale ? t('messages.stale', { time: clockText(snapshot.stale.failedAt), readAt: clockText(snapshot.readAt) }) : null,
    canRetry: true, openRuns: [] };
  const neutral = (message, extra = {}) => ({ ...base, message, ...extra });
  const unreadable = reason => neutral(t('messages.unreadable', { reason: t(`unreadable.${reason}`) }));

  if (!snapshot) return neutral(t('messages.reading'), { readAt: null });
  if (snapshot.status === 'failed') return unreadable('failed');
  if (snapshot.status === 'no_control') {
    return neutral(t('messages.noControl', { folder: folderName(snapshot.root) }), { hint: t('messages.noControlHint', { path: snapshot.root ?? '' }) });
  }

  const { run, origin, open } = assignRun({ runs: snapshot.runs, sessionStartedAt: input.sessionStartedAt, selection: input.selection });
  const openRuns = open.map(item => ({ id: item.id, objective: item.objective }));
  if (!run) {
    const broken = input.selection && snapshot.unreadable.find(item => item.id === input.selection);
    if (broken) return { ...unreadable(broken.reason), openRuns };
    if (!open.length) return neutral(t('messages.noOpenRuns'));
    return neutral(t('messages.noRunAssigned'), { hint: t('messages.noRunAssignedHint'), openRuns,
      openCount: t('fields.openRuns', { count: open.length }) });
  }

  const state = displayState(run, { isTurnActive: input.isTurnActive });
  if (state.mood === null) return { ...unreadable('unknownState'), runId: run.id, openRuns };
  const reasonParams = { gate: gateTitle(registry, locale, state.reason.gate), decision: t(`decisions.${state.reason.decision}`) };
  const position = open.findIndex(item => item.id === run.id);
  return {
    ...base,
    mood: state.mood,
    stateLabel: t(`states.${state.mood}`),
    reason: t(`reasons.${state.reason.key}`, reasonParams),
    gateBar: gateBar(gateMarks(run), input.columns),
    runId: run.id,
    objective: run.objective,
    isObjectiveExpanded: Boolean(input.isObjectiveExpanded),
    nextStep: run.lifecycle === 'completed' ? null : localizeNextStep(registry, locale, run.next).text,
    origin: t(`origin.${origin}`),
    originKind: origin,
    openRuns,
    openCount: position >= 0 ? t('fields.position', { position: position + 1, count: open.length }) : t('fields.openRuns', { count: open.length }),
  };
}

// Text fallback for surfaces without Svg: state, gate bar and next step on separate lines.
export function terminalText(view, { labels, locale }) {
  const t = path => label(labels, locale, path);
  const lines = [view.title, `${FIGURE_TEXT[view.mood]} ${view.stateLabel}${view.reason ? ` · ${view.reason}` : ''}`];
  if (view.message) lines.push(view.message);
  if (view.hint) lines.push(view.hint);
  if (view.gateBar) lines.push(view.gateBar);
  if (view.runId) lines.push(view.origin ? `${view.runId} · ${view.origin}` : view.runId);
  if (view.objective) lines.push(`${t('fields.objective')}: ${view.objective}`);
  if (view.nextStep) lines.push(`${t('fields.nextStep')}: ${view.nextStep}`);
  if (view.stale) lines.push(view.stale);
  if (view.readAt) lines.push(view.readAt);
  return lines.join('\n');
}
