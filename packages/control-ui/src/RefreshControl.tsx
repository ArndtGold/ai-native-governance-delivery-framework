import type { ReadingState } from './state';
import { hasExpiredSession } from './state';
import { Icon } from './mcp/Icon';
import { readingStatus } from './feedback';
import './refresh.css';

export function refreshUnavailable(state: ReadingState, enabled: boolean) {
  return !enabled || hasExpiredSession(state) || readingStatus(state).busy;
}

export function RefreshControl({ state, enabled, onReload }: {
  state: ReadingState; enabled: boolean; onReload: () => void;
}) {
  const { busy, changed, action: description } = readingStatus(state);
  return <>
    <button type="button" className="refresh-control" data-refreshing={busy} onClick={onReload}
      disabled={refreshUnavailable(state, enabled)} aria-label={description} title={description}>
      <Icon name="reload"/>
      {changed && <span className="refresh-update-dot" aria-hidden="true"/>}
    </button>
    <span className="refresh-announcement" role="status">{busy || changed ? description : ''}</span>
  </>;
}
