import { type ReactNode, type RefObject } from 'react';
import { COCKPIT_WORK_SECTIONS, projectCockpitList } from '../../../core/lib/control-inspect/cockpit-list.js';
import { Overview, type WorkView } from '../Overview';
import { hasExpiredSession, type ReadingState } from '../state';
import { ReadState, ReadingFeedback, readingStatus } from '../feedback';
import { BrandHeader } from '../BrandHeader';
import { RefreshControl } from '../RefreshControl';
import { Icon } from './Icon';
import { WorkStep } from '../WorkStep';
import { detailHasMismatch } from '../RunDetail';
import { SourceInfo } from '../SourceInfo';
import { WorkStandLabel } from '../WorkStandLabel';
import { RunFigure } from '../RunFigure';
import { OverviewFigure } from '../OverviewFigure';
import { DocumentView } from '../DocumentView';
import type { Resource, PlannedDocument, Envelope, WorkEntry } from '../types';
import type { ArchiveLoader } from '../ArchiveDetail';
import type { CockpitHost } from '../host-label';

export function CompactCockpit({ state, headingRef, enabled, visible = true, initialRunId, onSelect, onReload, onOverview, onRuns, onExpand, onOpen, onBack, onAbout, view, onViewChange, returnNotice, draftCheck, loadArchive, loadPlanned, sourceEntry, host }: {
  state: ReadingState; headingRef: RefObject<HTMLHeadingElement | null>; enabled: boolean; visible?: boolean;
  initialRunId?: string; view: WorkView; onViewChange: (view: WorkView) => void; returnNotice?: string | null;
  onSelect: (id: string) => void; onReload: () => void; onOverview: () => void; onRuns?: () => void; onExpand?: () => void;
  onOpen?: (resource: Resource, origin?: string) => void; onBack?: () => void; draftCheck?: ReactNode; loadArchive?: ArchiveLoader; loadPlanned?: (rowId: string, signal: AbortSignal) => Promise<Envelope<PlannedDocument>>;
  sourceEntry?: WorkEntry; onAbout: () => void; host?: CockpitHost;
}) {
  const data = state.detail?.data;
  const selected = data ? { run_id: data.run_id, title: data.title ?? data.run_id } : null;
  const expired = hasExpiredSession(state);
  const status = readingStatus(state);
  const busy = state.phase === 'loading', usable = !expired && enabled && !busy && !state.stale && !state.problem && state.phase === 'ready' && !!state.scope?.data;
  const mismatch = detailHasMismatch(data);
  const current = usable && state.detail?.state === 'available' && !mismatch;
  const target = state.scope?.target.display_path;
  return <section className="compact-cockpit agdf-surface" aria-label="AGDF Cockpit" aria-busy={busy || state.refreshing}>
    <BrandHeader host={host} variant="card" projectPath={target} contextTitle={state.route.view === 'document' ? selected?.title : undefined} headingRef={headingRef}>
      <button type="button" className="run-technical-toggle" aria-label="Über das Cockpit" title="Über das Cockpit" onClick={onAbout}><Icon name="info"/></button>
      <RefreshControl state={state} enabled={enabled} onReload={onReload}/>
    </BrandHeader>
    {state.route.view !== 'overview' && <nav className="compact-actions compact-navigation" aria-label="Bestandsquelle"><button onClick={onOverview} disabled={expired || busy}><Icon name="back"/>Alle Vorhaben</button>{state.route.view === 'detail' && data && <RunFigure state={state} enabled={enabled} visible={visible}/>}</nav>}
    {state.route.view === 'overview' && state.inventory?.data && <><div className="compact-overview-heading"><div><h2>Arbeit am Projekt</h2><p className="overview-repository"><span>Repository</span> <code>{target ?? 'Noch nicht verfügbar'}</code></p></div><OverviewFigure visible={visible}/></div>{returnNotice && <p role="status">{returnNotice}</p>}<Overview compact loadPlanned={loadPlanned} loadArchive={loadArchive} result={state.inventory} onSelect={onSelect} current={usable} view={view} onViewChange={onViewChange}/></>}
    {!enabled && <ReadState state="blocked" code="session_invalid"/>}
    <ReadingFeedback state={state} backlogHintsInView={state.route.view === 'overview' && !!state.inventory?.data}/>
    <div className={busy ? 'previous-content' : undefined}>
      {state.route.view === 'document' && state.document ? <div className="compact-document">
        <button className="text-link" onClick={onBack} disabled={!usable}>Zurück zur Statuskarte</button>
        <DocumentView result={state.document} detail={state.detail ?? undefined} current={!state.stale && !state.problem && state.phase === 'ready'} runTitle={selected?.title} onOpen={id => { const resource = data?.resources.find(r => r.resource_id === id); if (resource) onOpen?.(resource); }}/>
      </div> : selected && data ? <div className="compact-run">
        <div className="compact-run-summary">
        <WorkStandLabel data={data} current={current} stale={state.stale && !state.refreshing && state.phase !== 'loading'} reopen={expired || state.problem === 'session_invalid' || state.scope?.code === 'session_invalid'}/>
        <h2>{selected.title}</h2>
        {state.detail?.code && <ReadState state={state.detail.state} code={state.detail.code}/>}
        {mismatch && <ReadState state="partial" code="persisted_mismatch"/>}
        </div><div className="compact-run-followup">
        <WorkStep data={data} compact condensed onOpen={onOpen} sourceDisabled={!usable} current={current}
          compactDetails={<>{draftCheck}
            <details className="compact-identity"><summary>Ziel und Run-ID · Originalangaben</summary><code className="compact-run-id">{data.run_id}</code>
              {data.objective && data.objective !== selected.title && <p className="compact-goal">{data.objective}</p>}
            </details>
          </>}>
        <div className="compact-actions"><button className="text-link" disabled={!usable || !onExpand} onClick={onExpand}>Vorhaben öffnen <Icon name="expand"/></button></div>
        </WorkStep>{state.detail && <SourceInfo result={state.detail} current={current} entry={sourceEntry}/>}</div>
      </div> : null}
    </div>
    <div className="compact-footnote">{status.previous && <span>Vorheriger Datenstand bleibt sichtbar.</span>}{state.scope?.observed_as_of && <time dateTime={state.scope.observed_as_of}>Stand {new Date(state.scope.observed_as_of).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}</time>}</div>
  </section>;
}
