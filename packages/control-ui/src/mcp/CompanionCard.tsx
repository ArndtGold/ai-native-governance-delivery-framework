import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { BUILD_MARK, gateMarks } from '../../../../plugins/agdf/host-templates/claude/companion/gate-bar.mjs';
import { matchesActivity } from '../../../core/lib/companion/activity.js';
import { activityOf, eventTimeText } from '../../../../plugins/agdf/host-templates/claude/companion/view.mjs';
import { EVENT_KINDS, eventText, historyEvents } from '../../../../plugins/agdf/host-templates/claude/companion/events.mjs';
import { companionLabels, gateTitle, label } from '../../../../plugins/agdf/host-templates/claude/companion/localization.mjs';
import registry from '../../../../plugins/agdf/meta/agdf-interaction-locales.json';
import { RunFigure, useReducedFigureMotion } from '../RunFigure';
import { gateName, phaseName } from '../presentation';
import { ReadState, readingStatus } from '../feedback';
import { refreshUnavailable } from '../RefreshControl';
import { hasExpiredSession, type ReadingState } from '../state';
import type { CompanionObservation, Detail, Resource } from '../types';

import { companionDecision, companionSource } from '../companion-source';
import { Icon } from './Icon';
import { CompanionGatePath, CompanionProgress } from './CompanionProgress';
import { CompanionContinuationAction } from './CompanionContinuationAction';
import type { CompanionContinuation } from './companion-continuation';

const eventGateTitle = (gate: string) => gateTitle(registry, 'de', gate);
const gateRationales = registry.locales.de.gateRationale;
type PurposeGate = keyof typeof gateRationales;
const purposeHeadings: Record<PurposeGate, string> = {
  UR: 'Warum klären wir den Auftrag?',
  'Brownfield Review': 'Warum prüfen wir den Bestand?',
  'Mode/Slice Decision': 'Warum legen wir den Umfang dieser Lieferung fest?',
  PRD: 'Warum halten wir die Produktanforderungen fest?',
  SD: 'Warum entwerfen wir die technische Lösung?',
  TP: 'Warum planen wir die Umsetzung und die Tests?',
  'Brownfield Analysis': 'Warum untersuchen wir den bestehenden Code im Detail?',
  'CD+Tests': 'Warum testen wir schon während der Umsetzung?',
  CR: 'Warum prüfen wir die Änderungen im Code-Review?',
  QA: 'Warum prüfen wir die Qualitätsnachweise?',
  UAT: 'Warum braucht es deine Abnahme?',
  OR: 'Warum erstellen wir einen Lieferbericht?',
};
function hasPurpose(gate: string | undefined): gate is PurposeGate {
  return gate !== undefined && Object.hasOwn(purposeHeadings, gate);
}
const purposeTexts = {
  ...gateRationales,
  'Brownfield Review': 'Wir klären, welche bestehenden Systeme betroffen sind, wer dafür verantwortlich ist und welche Regeln dort gelten. So können wir Vorhandenes wiederverwenden und vermeiden, dass Änderungen bestehende Abläufe stören.',
};
const labels = companionLabels(registry);
const companionLabel = (path: string, params?: Record<string, string>) => label(labels, 'de', path, params);

export function CompanionCard({ state, data, observation, current, confirmedGate, visible, enabled, motion, mismatch, sourcePending, sourceInReader, canOfferApproval, showWidthHint, onOpen, onReload, continuation }: {
  state: ReadingState; data: Detail; observation?: CompanionObservation; current: boolean; confirmedGate: boolean; visible: boolean; enabled: boolean; motion: boolean; mismatch: boolean;
  sourcePending: boolean; sourceInReader: boolean; canOfferApproval: boolean; showWidthHint?: boolean; onOpen: (resource: Resource, digest: string) => void;
  onReload: () => void; continuation?: CompanionContinuation;
}) {
  const evaluation = data.evaluation;
  const companion = data.companion;
  const { assessment, waiting, human } = companionDecision(data, !mismatch && state.detail?.state === 'available');
  const gate = evaluation?.current_gate;
  const differentNextStep = confirmedGate && mismatch;
  const completed = assessment === 'completed' && evaluation?.completion?.fulfilled === true;
  const expired = hasExpiredSession(state);
  const previous = readingStatus(state).previous;
  const blocked = assessment === 'blocked' && !waiting;
  const pending = assessment === 'open' && !human;
  const [, setActivityTime] = useState(0);
  const activity = observation?.activity;
  // A retained or expired reading no longer refreshes its events, so it shows none.
  const eventHistory = !state.requestedRoute && !previous && !expired
    && observation?.run_id === data.run_id && observation.revision_id === data.revision_id ? observation.events : undefined;
  // The Claude companion's rules pick the lines (run run-71aa7dbb, SD SDD-006): a recorded approval or
  // completion only once this run detail confirms it, a still-uncertain outcome kept beyond the newest.
  const events = eventHistory?.state === 'available' && Array.isArray(eventHistory.items)
    ? historyEvents(eventHistory.items.filter(event => typeof event?.id === 'string' && EVENT_KINDS.includes(event.kind)
      && (event.at === null || typeof event.at === 'string' && Number.isFinite(Date.parse(event.at)))
      && (event.gate === null || typeof event.gate === 'string') && (event.reason === null || typeof event.reason === 'string')),
    [{ id: data.run_id, lifecycle: data.lifecycle, path: companion?.path ?? [], updatedAt: data.last_activity ?? '' }]) : [];
  const active = current && visible !== false && !state.refreshing && !previous && !expired && pending
    && evaluation?.next_operation?.actor === 'agent' && matchesActivity(activity, {
      target_id: state.scope?.target.target_id, run_id: data.run_id, revision_id: data.revision_id ?? undefined, gate,
    }, Date.now());
  const activeUntil = active ? activity?.expires_at : undefined;
  useEffect(() => {
    if (activeUntil === undefined) return;
    const timer = setTimeout(() => setActivityTime(Date.now()), Math.max(0, activeUntil - Date.now()));
    return () => clearTimeout(timer);
  }, [activeUntil]);
  const work = active && gate ? activityOf({ reason: { key: 'working', gate } }, { gate }, true, companionLabel, phaseName) : null;
  const unknown = observation?.liveness === 'unknown' && current && visible !== false && !state.refreshing;
  const marks = companion && (assessment !== 'unconfirmed' || differentNextStep) ? gateMarks({ path: companion.path, gate, route: companion.route, lifecycle: data.lifecycle }) : [];
  const gateMark = completed ? marks.filter(mark => mark.mark === 'done').at(-1)
    : marks.find(mark => mark.mark === 'current' && (mark.gate === BUILD_MARK || mark.gate === gate));
  const observedGate = confirmedGate || ((previous || expired) && !mismatch)
    ? gateMark?.gate ?? gate
    : undefined;
  const displayedPhase = observedGate ? gateName(observedGate) : undefined;
  const status = displayedPhase && (previous || expired)
    ? `Zuletzt war das Vorhaben in der Phase „${displayedPhase}“.`
    : completed ? 'Das Vorhaben ist abgeschlossen.'
    : displayedPhase ? `Das Vorhaben ist in der Phase „${displayedPhase}“.`
    : expired ? 'Die Sitzung ist abgelaufen.' : 'Der aktuelle Stand konnte nicht bestätigt werden.';
  const tone = previous || expired ? 'previous' : blocked ? 'blocked' : human ? 'decision' : completed ? 'completed' : work ? 'working' : undefined;
  const source = companionSource(data, state.scope?.target.target_id ?? '', !mismatch && state.detail?.state === 'available');
  const resource = source?.resource;
  const widthHintId = useId();
  const stepId = useId();
  const showSourceHint = current && !blocked && showWidthHint && !!resource && !sourceInReader;
  const displayGate = confirmedGate && !previous ? gateMark : undefined;
  const currentStep = displayGate?.mark === 'current' && companion?.route !== 'undecided'
    ? marks.indexOf(displayGate) + 1 : 0;
  const nextStep = companion?.next_text || evaluation?.next_action_de;
  const review = waiting && !!resource;
  const acceptance = waiting && gate === 'UAT';
  const reason = differentNextStep ? evaluation?.next_action_de || evaluation?.next_allowed_action
    : acceptance ? resource ? 'Prüfe das gelieferte Ergebnis und die offenen Punkte. Entscheide dann, ob du das Ergebnis abnimmst.'
      : 'Die aktuelle Abnahmeunterlage ist noch nicht verfügbar.'
    : review ? 'Lies den Entwurf und prüfe, ob er zu deinem Auftrag passt.' : blocked
    ? companion?.blocking_text || 'Die Kontrollauswertung meldet ein Hindernis.'
    : nextStep;
  const turnText = work?.turn.what || reason;
  const separateNextStep = work && reason !== turnText ? reason : null;
  const offerApproval = waiting && canOfferApproval && (!acceptance || !!resource);
  const approval = current && offerApproval ? evaluation?.missing_approval : null;
  const title = data.title ?? data.run_id;
  const displayGoal = companion?.goal ?? data.objective;
  const goal = displayGoal && displayGoal !== title ? displayGoal : null;
  const goalPreview = useRef<HTMLParagraphElement>(null);
  const [goalClipped, setGoalClipped] = useState(false);
  useLayoutEffect(() => {
    const preview = goalPreview.current;
    if (!preview) return;
    const measure = () => setGoalClipped(preview.scrollHeight > preview.clientHeight + 1);
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(preview);
    return () => observer?.disconnect();
  }, [goal]);
  const purposeGate = (human || pending) && hasPurpose(gate) ? gate : null;
  const snapshotId = state.scope?.snapshot_id;
  const action = current && visible && snapshotId && data.revision_id && data.lifecycle === 'active'
    && (offerApproval || (pending && evaluation?.next_operation?.actor === 'agent'));

  return <article className="compact-run companion-card" data-tone={tone} aria-label="Companion-Statuskarte"
    data-display-gate={displayGate?.gate} data-display-gate-state={displayGate?.mark}>
    <div className="companion-figure-block">
      <RunFigure state={state} enabled={enabled} visible={visible} motion={motion} companion/>
      <p className="companion-signal" role={!human || previous || expired ? 'status' : undefined}>{status}</p>
    </div>
    <h2 tabIndex={-1} data-focus-id="companion-run-heading">{title}</h2>
    {goal && <p className="companion-goal" ref={goalPreview}>{goal}</p>}
    {(blocked || human || pending || reason || resource) && <div className="companion-turn">
      <strong role={human && !previous && !expired ? 'status' : undefined}>{previous || expired ? 'Zuletzt beobachteter Schritt' : human ? 'Du bist dran' : blocked ? 'Klärung nötig'
        : work ? work.turn.who : evaluation?.next_operation?.actor === 'agent' ? 'Codex ist als Nächstes dran' : 'Als Nächstes'}</strong>
      {turnText && <p id={reason && !separateNextStep ? stepId : undefined}>{turnText}</p>}
      {blocked && companion?.next_text && companion.next_text !== reason && <p>{companion.next_text}</p>}
      {resource && source && !expired && !sourceInReader &&
        <button type="button" className="companion-source" aria-disabled={!current || sourcePending || undefined}
          aria-describedby={showSourceHint ? widthHintId : undefined} data-focus-id={`companion:${resource.resource_id}`}
          onClick={() => { if (current && !sourcePending) onOpen(resource, source.digest); }}>{resource.type === 'OR' ? 'Lieferbericht öffnen' : blocked ? 'Befund öffnen' : acceptance ? 'Abnahmeunterlage öffnen' : `${resource.type}-Entwurf öffnen`}</button>}
      {current && !resource && !acceptance && (waiting || blocked) && <p className="compact-muted">{waiting ? 'Der registrierte Entwurf ist nicht verfügbar.' : 'Kein passender registrierter Befund verfügbar.'}</p>}
      {approval && <p className="compact-muted">{acceptance ? 'Wenn du das Ergebnis abnimmst, antworte im Chat mit ' : 'Wenn der Entwurf passt, antworte im Chat mit '}<code>{approval}</code>.</p>}
      {action && continuation && snapshotId && data.revision_id && <CompanionContinuationAction
        key={snapshotId} port={continuation} approval={waiting}
        stepId={reason ? stepId : undefined} onReload={onReload}
        selection={{ snapshot_id: snapshotId, run_id: data.run_id, revision_id: data.revision_id }} />}
    </div>}
    {state.detail?.code && <ReadState state={state.detail.state} code={state.detail.code}/>}
    {mismatch && !differentNextStep && <ReadState state="partial" code="persisted_mismatch"/>}
    {marks.length > 0 && <div className="companion-progress">
      {currentStep > 0 && <p className="companion-pit-stop">Boxenstopp {currentStep} von {marks.length}</p>}
      <CompanionProgress marks={marks} previous={!confirmedGate}/>
    </div>}
    {separateNextStep && <div className="companion-next-step">
      <strong>Nächster Schritt</strong>
      <p id={stepId}>{separateNextStep}</p>
    </div>}
    {(differentNextStep || goal && goalClipped || purposeGate || unknown || showSourceHint || marks.length > 0) && <details className="companion-details"><summary>ⓘ Details</summary>
      <dl>
        {differentNextStep && <><dt>Nächster Schritt</dt><dd>Die Karte zeigt den aktuell ermittelten nächsten Schritt. Der gespeicherte Schritt weicht davon ab.</dd></>}
        {unknown && <><dt>Codex-Aktivität</dt><dd>Ob Codex gerade an diesem Run arbeitet, ist unklar.</dd></>}
        {purposeGate && <><dt>{purposeHeadings[purposeGate]}</dt><dd>{purposeTexts[purposeGate]}</dd></>}
        {showSourceHint && <><dt>{acceptance ? 'Abnahmeunterlage' : 'Entwurfsansicht'}</dt><dd id={widthHintId}>In einer breiteren Ansicht öffnet sich {acceptance ? 'die Abnahmeunterlage' : 'der Entwurf'} automatisch daneben.</dd></>}
        {goal && goalClipped && <><dt>Ziel</dt><dd className="companion-full-goal">{goal}</dd></>}
        {marks.length > 0 && <><dt>Vollständige Gate-Reihenfolge</dt><dd><CompanionGatePath marks={marks} previous={!confirmedGate}/></dd></>}
      </dl>
    </details>}
    {(events.length > 0 || eventHistory?.state === 'unavailable') && <section className="companion-events" aria-label={companionLabel('fields.events')}>
      <h3>{companionLabel('fields.events')}</h3>
      {eventHistory?.state === 'unavailable' ? <p>{companionLabel('messages.eventsUnavailable')}</p> : <ul>{events.map(event => <li key={event.id}>
        {event.at && <><time dateTime={event.at}>{eventTimeText(event.at, { locale: 'de' })}</time>{' '}</>}
        {eventText(event, companionLabel, { gateTitle: eventGateTitle, shownRunId: data.run_id })}
      </li>)}</ul>}
    </section>}
  </article>;
}

export function CompanionMenu({ state, enabled, motion, onToggleMotion, sound, onToggleSound, onReload, onReturnToChatRun }: {
  state: ReadingState; enabled: boolean; motion: boolean; onToggleMotion: () => void; onReload: () => void;
  sound: boolean; onToggleSound: () => void; onReturnToChatRun?: () => void;
}) {
  const control = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const infoHeading = useRef<HTMLHeadingElement>(null);
  const menuId = useId();
  const hintId = useId();
  const [openAt, setOpenAt] = useState<'first' | 'last' | null>(null);
  const [info, setInfo] = useState(false);
  const reduced = useReducedFigureMotion();
  const items = () => Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
  const close = () => {
    setOpenAt(null);
    trigger.current?.focus();
  };
  useLayoutEffect(() => {
    if (!openAt) return;
    items().at(openAt === 'first' ? 0 : -1)?.focus({ preventScroll: true });
  }, [openAt]);
  useEffect(() => {
    if (!openAt) return;
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !control.current?.contains(event.target)) setOpenAt(null);
    };
    document.addEventListener('pointerdown', dismissOutside);
    return () => document.removeEventListener('pointerdown', dismissOutside);
  }, [openAt]);
  const navigateMenu = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = items();
    const index = buttons.findIndex(button => button === event.target);
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === 'Tab') {
      close();
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const last = buttons.length - 1;
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? last
        : event.key === 'ArrowDown' ? (index + 1) % buttons.length : index <= 0 ? last : index - 1;
      buttons[next]?.focus();
    }
  };
  return <div className="companion-footer-controls">
    {info && !openAt && <section className="companion-info" aria-label="Information zum Companion">
      <h3 ref={infoHeading} tabIndex={-1}>Über den AGDF Companion</h3>
      <p>Die Figur aus AGDF 0.32.0 begleitet den ausgewählten Run. Die Karte zeigt seinen beobachteten Stand und öffnet die passende registrierte Quelle. Freigaben erfolgen im Chat.</p>
      <button type="button" className="text-link" onClick={() => { setInfo(false); close(); }}>Companion-Information schließen</button>
    </section>}
    <div ref={control} className="companion-menu" onBlur={event => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpenAt(null);
    }}>
      <button ref={trigger} className="companion-menu-trigger" type="button" aria-label="AGDF Companion" title="Companion-Menü" aria-haspopup="menu" aria-expanded={!!openAt}
        aria-controls={openAt ? menuId : undefined} onClick={() => openAt ? close() : setOpenAt('first')}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const edge = event.key === 'ArrowDown' ? 'first' : 'last';
            if (openAt) items().at(edge === 'first' ? 0 : -1)?.focus();
            else setOpenAt(edge);
          }
        }}>
        <span className="companion-menu-label">AGDF Companion <span className="companion-menu-chevron" aria-hidden="true"/></span>
        <Icon name="more"/>
      </button>
      {openAt && <div ref={menu} id={menuId} className="companion-menu-options" role="menu" aria-label="AGDF Companion" onKeyDown={navigateMenu}>
        {onReturnToChatRun && <button type="button" role="menuitem" tabIndex={-1} onClick={() => { close(); onReturnToChatRun(); }}>Zurück zum Chat-Run</button>}
        <button type="button" role="menuitemcheckbox" tabIndex={-1} aria-checked={motion} aria-describedby={reduced ? hintId : undefined}
          onClick={() => { onToggleMotion(); close(); }}><span className="companion-menu-mark" aria-hidden="true">{motion ? '✓' : ''}</span>Bewegung</button>
        {reduced && <small role="presentation" id={hintId}>Bewegung ist durch die Anzeigeeinstellung reduziert.</small>}
        <button type="button" role="menuitemcheckbox" tabIndex={-1} aria-checked={sound}
          onClick={() => { onToggleSound(); close(); }}><span className="companion-menu-mark" aria-hidden="true">{sound ? '✓' : ''}</span>Hinweiston</button>
        <button type="button" role="menuitem" tabIndex={-1} onClick={() => { close(); onReload(); }}
          disabled={refreshUnavailable(state, enabled)} title={readingStatus(state).action}>Neu lesen</button>
        <div className="companion-menu-divider" role="separator"/>
        <button type="button" role="menuitem" tabIndex={-1}
          onClick={() => { close(); setInfo(true); requestAnimationFrame(() => infoHeading.current?.focus()); }}>Über den Companion</button>
      </div>}
    </div>
  </div>;
}
