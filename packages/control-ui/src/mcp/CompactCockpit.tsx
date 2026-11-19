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
import { CompanionWorkspace, type CompanionConstraints } from './CompanionWorkspace';
import type { CompanionReader } from '../useCompanionReader';
import { CompanionCard, CompanionMenu } from './CompanionCard';
import type { CompanionActivity, Resource, PlannedDocument, Envelope, WorkEntry } from '../types';
import type { ArchiveLoader } from '../ArchiveDetail';
import type { CockpitHost } from '../host-label';

export function CompactCockpit({ observationNotice, state, headingRef, enabled, visible = true, onSelect, onReload, onOverview, onExpand, onOpen, onOpenCompanion, onBack, onAbout, view, onViewChange, returnNotice, draftCheck, sourcePending, loadArchive, loadPlanned, sourceEntry, host, activity, activityUnknown, motion, onToggleMotion, sound, onToggleSound, activeRunCount, runIndex, onStepRun, onReturnToChatRun, reader, onReaderWidth, companionConstraints, onReaderLink, onReaderClose, companionEmpty }: {
  reader: CompanionReader; onReaderWidth: (wide: boolean) => void; companionConstraints?: CompanionConstraints; onReaderLink: (id: string) => void; onReaderClose: () => void;
  observationNotice?: ReactNode; state: ReadingState; headingRef: RefObject<HTMLHeadingElement | null>; enabled: boolean; visible?: boolean;
  view: WorkView; onViewChange: (view: WorkView) => void; returnNotice?: string | null;
  onSelect: (id: string) => void; onReload: () => void; onOverview: () => void; onRuns?: () => void; onExpand?: () => void;
  onOpen?: (resource: Resource, origin?: string) => void; onBack?: () => void; draftCheck?: ReactNode; loadArchive?: ArchiveLoader; loadPlanned?: (rowId: string, signal: AbortSignal) => Promise<Envelope<PlannedDocument>>;
  onOpenCompanion: (resource: Resource, digest: string) => void; sourcePending: boolean; motion: boolean; onToggleMotion: () => void;
  sound: boolean; onToggleSound: () => void;
  activeRunCount: number; runIndex: number; onStepRun: (offset: -1 | 1) => void; onReturnToChatRun?: () => void;
  sourceEntry?: WorkEntry; onAbout: () => void; host?: CockpitHost; activity?: CompanionActivity; activityUnknown?: boolean; companionEmpty?: boolean;
}) {
  const data = state.detail?.data;
  const selected = data ? { run_id: data.run_id, title: data.title ?? data.run_id } : null;
  const expired = hasExpiredSession(state);
  const status = readingStatus(state);
  const busy = state.phase === 'loading', usable = !expired && enabled && !busy && !state.stale && !state.problem && state.phase === 'ready' && !!state.scope?.data;
  const mismatch = detailHasMismatch(data);
  const current = usable && state.detail?.state === 'available' && !mismatch;
  const companionRun = host === 'codex' && state.route.view === 'detail' && !!data;
  const noActiveRun = host === 'codex' && companionEmpty && state.route.view === 'overview' && state.phase === 'ready'
    && (state.scope?.code === 'control_absent' || state.inventory?.data?.kind === 'work'
      && !state.inventory.data.entries.some(row => row.kind === 'run' && row.lifecycle === 'active' && row.selectable));
  const companionView = companionRun || noActiveRun;
  const canBrowse = usable && !state.refreshing && !state.requestedRoute;
  const target = state.scope?.target.display_path;
  const content = <div className={busy ? 'previous-content' : undefined}>
      {noActiveRun ? <div className="compact-run companion-card"><div className="companion-figure-block">
        <RunFigure state={state} enabled={enabled} visible={visible} companion motion={motion}/>
        <h2 className="companion-signal">Kein aktiver Run</h2>
      </div></div> : state.route.view === 'document' && state.document ? <div className="compact-document">
        <button className="text-link" onClick={onBack} disabled={host === 'codex' ? !enabled || busy || expired : !usable}>Zurück zur Statuskarte</button>
        <DocumentView result={state.document} detail={state.detail ?? undefined} current={!state.stale && !state.problem && state.phase === 'ready'} runTitle={selected?.title} onOpen={id => { const resource = data?.resources.find(r => r.resource_id === id); if (resource) onOpen?.(resource); }}/>
      </div> : companionRun && data ? <CompanionCard key={data.run_id} state={state} data={data} activity={activity} activityUnknown={activityUnknown} current={current} visible={visible}
        enabled={enabled} motion={motion} mismatch={mismatch} sourcePending={sourcePending} sourceShown={reader.sourceShown} showWidthHint={reader.showWidthHint}
        onOpen={onOpenCompanion}/> : selected && data ? <div className="compact-run">
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
    </div>;
  const footer = <footer className={`compact-footnote${companionView ? ' companion-footer' : ''}`}>
      {companionView && <CompanionMenu key={data?.run_id ?? 'idle'} state={state} enabled={enabled} motion={motion} onToggleMotion={onToggleMotion}
        sound={sound} onToggleSound={onToggleSound} onReload={onReload}
        onReturnToChatRun={!expired && enabled && !busy && !state.refreshing ? onReturnToChatRun : undefined}/>}
      {companionRun && runIndex >= 0 && activeRunCount > 1 && <nav className="companion-run-navigation" aria-label="Aktive Runs">
        <button type="button" aria-label="Vorheriger Run" title="Vorheriger Run" data-focus-id="companion-previous-run"
          aria-disabled={!canBrowse} onClick={() => { if (canBrowse) onStepRun(-1); }}><Icon name="back"/></button>
        <span className="companion-run-counter" aria-live="polite">
          <span>{runIndex + 1} von {activeRunCount}</span>
          <span className="companion-run-caption">aktive Runs</span>
        </span>
        <button type="button" aria-label="Nächster Run" title="Nächster Run" data-focus-id="companion-next-run"
          aria-disabled={!canBrowse} onClick={() => { if (canBrowse) onStepRun(1); }}><Icon name="next"/></button>
      </nav>}
      {status.previous && !companionRun && <span>Vorheriger Datenstand bleibt sichtbar.</span>}
      {state.scope?.observed_as_of && <time dateTime={state.scope.observed_as_of}>{status.previous && companionRun ? 'Zuletzt gelesen' : 'Stand'} {new Date(state.scope.observed_as_of).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}</time>}
    </footer>;
  return <section className={`compact-cockpit agdf-surface${companionView ? ' compact-cockpit--companion' : ''}`} aria-label="AGDF Cockpit" aria-busy={busy || state.refreshing}>
    <BrandHeader host={host} variant="card" projectPath={target} title={companionView ? 'AGDF Companion für Codex' : undefined}
      contextTitle={state.route.view === 'document' ? selected?.title : undefined} headingRef={headingRef}>
      <button type="button" className="run-technical-toggle" aria-label="Über das Cockpit" aria-haspopup="dialog" title="Über das Cockpit" onClick={onAbout}><Icon name="info"/></button>
      {!companionView && <RefreshControl state={state} enabled={enabled} onReload={onReload}/>}
    </BrandHeader>
    {!companionRun && state.route.view !== 'overview' && <nav className="compact-actions compact-navigation" aria-label="Bestandsquelle">
      <button onClick={onOverview} disabled={expired || busy}><Icon name="back"/>Alle Vorhaben</button>
      {state.route.view === 'detail' && data && <RunFigure state={state} enabled={enabled} visible={visible}/>}
    </nav>}
    {!noActiveRun && state.route.view === 'overview' && state.inventory?.data && <><div className="compact-overview-heading"><div><h2>Arbeit am Projekt</h2><p className="overview-repository"><span>Repository</span> <code>{target ?? 'Noch nicht verfügbar'}</code></p></div><OverviewFigure visible={visible}/></div>{returnNotice && <p role="status">{returnNotice}</p>}<Overview compact loadPlanned={loadPlanned} loadArchive={loadArchive} result={state.inventory} onSelect={onSelect} current={usable} view={view} onViewChange={onViewChange}/></>}
    {!enabled && <ReadState state="blocked" code="session_invalid"/>}
    <ReadingFeedback state={state} backlogHintsInView={state.route.view === 'overview' && !!state.inventory?.data}/>
    {observationNotice}
    {companionView ? <CompanionWorkspace reader={reader} onWidth={onReaderWidth} constraints={companionConstraints} onLink={onReaderLink} onClose={onReaderClose} onReload={onReload} footer={footer}>{content}</CompanionWorkspace> : <>{content}{footer}</>}

  </section>;
}
