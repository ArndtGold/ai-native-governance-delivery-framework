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

export function RunFigure({ state, enabled, visible = true }: { state: ReadingState; enabled: boolean; visible?: boolean }) {
  const reduced = useSyncExternalStore(subscribeToMotion, prefersStill, () => true);
  const [previous, setPrevious] = useState<FigureObservation | null>(null);
  const { detail, route, requestedRoute } = state;
  const runId = detail?.data?.run_id;
  const selected = runId && route.view !== 'overview' && route.runId === runId
    && (!requestedRoute || requestedRoute.view !== 'overview' && requestedRoute.runId === runId)
    && detail.target.target_id === state.scope?.target.target_id;
  // A background read keeps the same pose until it returns. A failed read switches to a still pose.
  const confirmed = enabled && !hasExpiredSession(state) && !!detail?.data && detail.state === 'available' && !state.problem
    && (!state.stale || state.refreshing) && observedAssessment(detail.data, true) !== 'unconfirmed';
  const current = confirmed && visible && !reduced && detail?.state === 'available' && !state.problem
    && (state.phase === 'ready' || state.phase === 'loading' && !!requestedRoute)
    && (!state.stale || state.refreshing);
  const scope = selected ? JSON.stringify([detail.target.target_id, runId]) : null;
  const supported = ['laeuft', 'baut', 'wartet', 'blockiert', 'fertig', 'bereit'];
  const supplied = confirmed && detail?.data?.figure && supported.includes(detail.data.figure.mood) ? detail.data.figure : undefined;
  const observation = observeFigure(previous, { scope, figure: supplied ?? { mood: 'bereit', reason: { key: 'unconfirmed' } }, current: current && !!supplied });
  if (observation !== previous) setPrevious(observation);
  if (!observation) return null;

  const svg = figureSvg(observation.mood, { ...observation, still: !current || !supplied });
  return <img className="run-figure" alt="" width={64} height={45}
    src={`data:image/svg+xml,${encodeURIComponent(svg)}`}/>;
}
