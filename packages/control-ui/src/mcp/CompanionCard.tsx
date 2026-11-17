import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { gateMarks } from '../../../../plugins/agdf/host-templates/claude/companion/gate-bar.mjs';
import { matchesActivity } from '../../../core/lib/companion/activity.js';
import { activityLabel, activityOf } from '../../../../plugins/agdf/host-templates/claude/companion/view.mjs';
import { companionLabels, label } from '../../../../plugins/agdf/host-templates/claude/companion/localization.mjs';
import registry from '../../../../plugins/agdf/meta/agdf-interaction-locales.json';
import { RunFigure, useReducedFigureMotion } from '../RunFigure';
import { phaseName } from '../presentation';
import { ReadState, readingStatus } from '../feedback';
import { refreshUnavailable } from '../RefreshControl';
import { hasExpiredSession, type ReadingState } from '../state';
import type { CompanionActivity, Detail, Resource } from '../types';

import { companionDecision, companionSource } from '../companion-source';
import { Icon } from './Icon';
import { CompanionProgress } from './CompanionProgress';

const gateRationales: Readonly<Record<string, string>> = registry.locales.de.gateRationale;
const labels = companionLabels(registry);
const companionLabel = (path: string, params?: Record<string, string>) => label(labels, 'de', path, params);

export function CompanionCard({ state, data, activity, current, visible, enabled, motion, mismatch, sourcePending, sourceShown, showWidthHint, onOpen }: {
  state: ReadingState; data: Detail; activity?: CompanionActivity; current: boolean; visible: boolean; enabled: boolean; motion: boolean; mismatch: boolean;
  sourcePending: boolean; sourceShown?: boolean; showWidthHint?: boolean; onOpen: (resource: Resource, digest: string) => void;
}) {
  const evaluation = data.evaluation;
  const companion = data.companion;
  const { assessment, waiting, human } = companionDecision(data, !mismatch && state.detail?.state === 'available');
  const gate = evaluation?.current_gate;
  const completed = assessment === 'completed' && evaluation?.completion?.fulfilled === true;
  const expired = hasExpiredSession(state);
  const previous = readingStatus(state).previous;
  const blocked = assessment === 'blocked' && !waiting;
  const pending = assessment === 'open' && !human;
  const [, setActivityTime] = useState(0);
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
  const status = expired ? 'Sitzung abgelaufen' : previous ? 'Zuletzt beobachteter Stand' : blocked ? 'Blockiert'
    : waiting ? companionLabel('waitingCaptions.waitingApproval')
    : human ? companionLabel('waitingCaptions.waitingDecision') : completed ? 'Abgeschlossen'
    : work ? work.label : pending && gate ? activityLabel(gate, false, companionLabel, phaseName) : pending ? 'Schritt steht an'
    : assessment === 'ended' ? 'Beendet' : 'Stand nicht bestätigt';
  const tone = previous || expired ? 'previous' : blocked ? 'blocked' : human ? 'decision' : completed ? 'completed' : work ? 'working' : undefined;
  const source = companionSource(data, state.scope?.target.target_id ?? '', !mismatch && state.detail?.state === 'available');
  const resource = source?.resource;
  const widthHintId = useId();
  const showSourceHint = current && !blocked && showWidthHint;
  const marks = companion && assessment !== 'unconfirmed' ? gateMarks({ path: companion.path, gate, route: companion.route, lifecycle: data.lifecycle }) : [];
  const displayGate = current && !previous
    ? marks.find(mark => mark.mark === 'current') ?? (completed ? marks.filter(mark => mark.mark === 'done').at(-1) : undefined)
    : undefined;
  const currentStep = current && !previous && companion?.route !== 'undecided'
    ? marks.findIndex(({ mark }) => mark === 'current') + 1 : 0;
  const reason = waiting ? `${phaseName(gate)} zur Entscheidung lesen.` : blocked
    ? companion?.blocking_text || 'Die Kontrollauswertung meldet ein Hindernis.'
    : companion?.next_text || evaluation?.next_action_de;
  const approval = current && waiting ? evaluation?.missing_approval : null;
  const title = data.title ?? data.run_id;
  const goal = data.objective && data.objective !== title ? data.objective : null;
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
  const rationale = gate && (human || pending) && Object.hasOwn(gateRationales, gate) ? gateRationales[gate] : null;
  const nextStep = companion?.next_text || evaluation?.next_action_de;
  const approvalStep = waiting && nextStep && nextStep !== reason ? nextStep : null;

  return <article className="compact-run companion-card" data-tone={tone} aria-label="Companion-Statuskarte"
    data-display-gate={displayGate?.gate} data-display-gate-state={displayGate?.mark}>
    <div className="companion-figure-block">
      <RunFigure state={state} enabled={enabled} visible={visible} motion={motion} companion/>
      <p className="companion-signal" role={!human || previous || expired ? 'status' : undefined}>{status}</p>
    </div>
    <h2 tabIndex={-1} data-focus-id="companion-run-heading">{title}</h2>
    {currentStep > 0 && <p className="companion-pit-stop">Boxenstopp {currentStep} von {marks.length}</p>}
    {goal && <div className="companion-goal"><strong>Ziel</strong><p ref={goalPreview}>{goal}</p></div>}
    {state.detail?.code && <ReadState state={state.detail.state} code={state.detail.code}/>}
    {mismatch && <ReadState state="partial" code="persisted_mismatch"/>}
    {(blocked || human || pending) && <div className="companion-turn">
      <strong role={human && !previous && !expired ? 'status' : undefined}>{previous || expired ? 'Zuletzt beobachteter Schritt' : human ? 'Du bist dran' : blocked ? 'Klärung nötig'
        : work ? work.turn.who : evaluation?.next_operation?.actor === 'agent' ? 'Codex ist als Nächstes dran' : 'Als Nächstes'}</strong>
      {work ? <p>{work.turn.what}</p> : reason && <p>{reason}</p>}
      {approval && <p className="compact-muted">Wenn der Entwurf passt, antworte im Chat mit <code>{approval}</code>.</p>}
      {blocked && companion?.next_text && companion.next_text !== reason && <p>{companion.next_text}</p>}
      {resource && source && !expired && !sourceShown && <>
        <button type="button" className="companion-source" aria-disabled={!current || sourcePending || undefined}
          aria-describedby={showSourceHint ? widthHintId : undefined} data-focus-id={`companion:${resource.resource_id}`}
          onClick={() => { if (current && !sourcePending) onOpen(resource, source.digest); }}>{blocked ? 'Befund öffnen' : `${resource.type}-Entwurf öffnen`}</button>
        {showSourceHint && <p className="companion-source-hint" id={widthHintId}>In einer breiteren Ansicht öffnet sich der Entwurf automatisch daneben.</p>}
      </>}
      {current && !resource && (waiting || blocked) && <p className="compact-muted">{waiting ? 'Der registrierte Entwurf ist nicht verfügbar.' : 'Kein passender registrierter Befund verfügbar.'}</p>}
    </div>}
    {marks.length > 0 && <CompanionProgress marks={marks} previous={previous}/>}
    {(goal && goalClipped || rationale || approvalStep) && <details className="companion-details"><summary>ⓘ Details</summary>
      <dl>
        {rationale && <><dt>Wozu dieses Gate da ist</dt><dd>{rationale}</dd></>}
        {goal && goalClipped && <><dt>Ziel</dt><dd className="companion-full-goal">{goal}</dd></>}
        {approvalStep && <><dt>Nächster Schritt</dt><dd>{approvalStep}</dd></>}
      </dl>
    </details>}
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
