import { useState, useSyncExternalStore } from 'react';
import { figureSvg, observeFigure, type FigureObservation } from '../../../plugins/agdf/host-templates/claude/companion/figure.mjs';
import { hasExpiredSession, type ReadingState } from './state';
import { observedAssessment } from './presentation';

const motionQuery = '(prefers-reduced-motion: reduce)';
function subscribeToMotion(update: () => void) {
  const media = window.matchMedia?.(motionQuery);
  media?.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  return () => {
    media?.removeEventListener('change', update);
    document.removeEventListener('visibilitychange', update);
  };
}

const prefersStill = () => document.hidden || (window.matchMedia?.(motionQuery).matches ?? false);

export function useReducedFigureMotion() {
  return useSyncExternalStore(subscribeToMotion, prefersStill, () => true);
}

export function RunFigure({ state, enabled, visible = true, companion = false, motion = true }: { state: ReadingState; enabled: boolean; visible?: boolean; companion?: boolean; motion?: boolean }) {
  const reduced = useReducedFigureMotion();
  const [previous, setPrevious] = useState<FigureObservation | null>(null);
  const { detail, route, requestedRoute } = state;
  const runId = detail?.data?.run_id;
  const selected = runId && route.view !== 'overview' && route.runId === runId
    && (!requestedRoute || requestedRoute.view !== 'overview' && requestedRoute.runId === runId)
    && detail.target.target_id === state.scope?.target.target_id;
  // A background read keeps the same pose until it returns. A failed read switches to a still pose.
  const confirmed = enabled && !hasExpiredSession(state) && !!detail?.data && detail.state === 'available' && !state.problem
    && (!state.stale || state.refreshing) && observedAssessment(detail.data, true) !== 'unconfirmed';
  const current = confirmed && visible && motion && !reduced && detail?.state === 'available' && !state.problem
    && (state.phase === 'ready' || state.phase === 'loading' && !!requestedRoute)
    && (!state.stale || state.refreshing);
  const scope = selected ? JSON.stringify([detail.target.target_id, runId]) : null;
  const supported = ['laeuft', 'baut', 'wartet', 'blockiert', 'fertig', 'bereit'];
  const figure = detail?.data?.figure;
  const pending = companion && (figure?.reason?.key === 'working' || figure?.reason?.key === 'building');
  const supplied = (confirmed || companion && selected && state.stale) && figure && supported.includes(figure.mood)
    && (!companion || !!detail?.data?.companion) && !pending ? figure : undefined;
  const observation = observeFigure(previous, { scope, figure: supplied ?? { mood: 'bereit', reason: { key: 'unconfirmed' } }, current: current && !!supplied });
  if (observation !== previous) setPrevious(observation);
  const idle = companion && route.view === 'overview';
  if (!observation && !idle) return null;

  const workGate = !companion && selected && confirmed && !state.stale && detail?.data?.evaluation?.current_gate === 'TP' ? 'TP' : undefined;
  const idleReady = idle && enabled && state.phase === 'ready' && !state.stale && !state.problem;
  const animateIdle = idleReady && visible && motion && !reduced;
  const animateRun = current && (Boolean(supplied) || pending);
  const svg = figureSvg(observation?.mood ?? 'bereit', {
    ...observation, workGate, smile: idleReady || confirmed && pending, still: !animateIdle && !animateRun,
  });
  return <img className="run-figure" alt="" width={64} height={45}
    src={`data:image/svg+xml,${encodeURIComponent(svg)}`}/>;
}
