import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { gateMarks } from '../../../../plugins/agdf/host-templates/claude/companion/gate-bar.mjs';
import registry from '../../../../plugins/agdf/meta/agdf-interaction-locales.json';
import { RunFigure, useReducedFigureMotion } from '../RunFigure';
import { observedAssessment, phaseName } from '../presentation';
import { ReadState, readingStatus } from '../feedback';
import { refreshUnavailable } from '../RefreshControl';
import { hasExpiredSession, type ReadingState } from '../state';
import type { Detail, Resource } from '../types';

const gateGlyph = { done: '✓', current: '●', open: '○' };
const gateMarkLabel = { done: 'Erledigt', current: 'Aktuell', open: 'Offen' };
const gateRationales: Readonly<Record<string, string>> = registry.locales.de.gateRationale;

function sourceFor(data: Detail, blocked: boolean, waiting: boolean) {
  if (waiting) {
    const draft = data.document_states?.find(row => row.type === data.evaluation?.current_gate && row.version_kind === 'draft'
      && row.source_state === 'available' && row.run_id === data.run_id && row.revision_id === data.revision_id);
    if (draft?.content_digest) return { resourceId: draft.resource_id, digest: draft.content_digest };
  }
  if (blocked && data.companion?.finding) {
    const finding = data.companion.finding;
    return { resourceId: finding.resource_id, digest: finding.content_digest };
  }
  return null;
}

export function companionDecision(data: Detail, current: boolean) {
  const assessment = observedAssessment(data, current);
  const evaluation = data.evaluation;
  const gate = evaluation?.current_gate;
  // The reader's assessment blocks delivery until approval; the same Core report
  // can identify that as a ready human decision rather than a delivery problem.
  const waiting = !!gate && assessment !== 'unconfirmed' && evaluation?.status === 'open'
    && evaluation.blocking_reason === 'none' && evaluation.missing_approval === `Approval: ${gate}`;
  const human = waiting || assessment === 'open' && (evaluation?.next_operation?.actor === 'human' || data.figure?.reason?.key === 'waitingDecision');
  return { assessment, waiting, human };
}

export function CompanionCard({ state, data, current, visible, enabled, motion, mismatch, sourcePending, onOpen }: {
  state: ReadingState; data: Detail; current: boolean; visible: boolean; enabled: boolean; motion: boolean; mismatch: boolean;
  sourcePending: boolean; onOpen: (resource: Resource, digest: string) => void;
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
  const status = expired ? 'Sitzung abgelaufen' : previous ? 'Zuletzt beobachteter Stand' : blocked ? 'Blockiert'
    : human ? 'Entscheidung offen' : completed ? 'Abgeschlossen' : pending ? 'Schritt steht an'
    : assessment === 'ended' ? 'Beendet' : 'Stand nicht bestätigt';
  const tone = previous || expired ? 'previous' : blocked ? 'blocked' : human ? 'decision' : completed ? 'completed' : undefined;
  const source = sourceFor(data, blocked, waiting);
  const resource = data.resources.find(item => item.resource_id === source?.resourceId && item.status === 'registered' && item.run_id === data.run_id);
  const marks = companion && assessment !== 'unconfirmed' ? gateMarks({ path: companion.path, gate, route: companion.route, lifecycle: data.lifecycle }) : [];
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

  return <article className="compact-run companion-card" data-tone={tone} aria-label="Companion-Statuskarte">
    <div className="companion-figure-block">
      <RunFigure state={state} enabled={enabled} visible={visible} motion={motion} companion/>
      <p className="companion-signal" role="status">{status}</p>
    </div>
    <h2 tabIndex={-1} data-focus-id="companion-run-heading">{title}</h2>
    {goal && <div className="companion-goal"><strong>Ziel</strong><p ref={goalPreview}>{goal}</p></div>}
    {state.detail?.code && <ReadState state={state.detail.state} code={state.detail.code}/>}
    {mismatch && <ReadState state="partial" code="persisted_mismatch"/>}
    {(blocked || human || pending) && <div className="companion-turn">
      <strong>{previous || expired ? 'Zuletzt beobachteter Schritt' : human ? 'Du bist dran' : blocked ? 'Klärung nötig'
        : evaluation?.next_operation?.actor === 'agent' ? 'Codex ist als Nächstes dran' : 'Als Nächstes'}</strong>
      {reason && <p>{reason}</p>}
      {approval && <p className="compact-muted">Wenn der Entwurf passt, antworte im Chat mit <code>{approval}</code>.</p>}
      {blocked && companion?.next_text && companion.next_text !== reason && <p>{companion.next_text}</p>}
      {resource && source && current && <button type="button" className="primary companion-source" aria-disabled={sourcePending || undefined} data-focus-id={`companion:${resource.resource_id}`}
        onClick={() => { if (!sourcePending) onOpen(resource, source.digest); }}>{blocked ? 'Befund öffnen' : `${resource.type}-Entwurf öffnen`}</button>}
      {current && !resource && (waiting || blocked) && <p className="compact-muted">{waiting ? 'Der registrierte Entwurf ist nicht verfügbar.' : 'Kein passender registrierter Befund verfügbar.'}</p>}
    </div>}
    {marks.length > 0 && <ol className="companion-gates" aria-label="Gate-Fortschritt">
      {marks.map(({ gate: name, mark }) => <li key={name} data-mark={mark} aria-current={mark === 'current' && !previous ? 'step' : undefined}>
        <span aria-hidden="true">{gateGlyph[mark]}</span> <span aria-label={`${name}, ${gateMarkLabel[mark]}`}>{name}</span>
      </li>)}
    </ol>}
    {(goal && goalClipped || rationale || approvalStep) && <details className="companion-details"><summary>ⓘ Details</summary>
      <dl>
        {goal && goalClipped && <><dt>Ziel</dt><dd className="companion-full-goal">{goal}</dd></>}
        {rationale && <><dt>Wozu dieses Gate da ist</dt><dd>{rationale}</dd></>}
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
      <button ref={trigger} className="companion-menu-trigger" type="button" aria-haspopup="menu" aria-expanded={!!openAt}
        aria-controls={openAt ? menuId : undefined} onClick={() => openAt ? close() : setOpenAt('first')}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const edge = event.key === 'ArrowDown' ? 'first' : 'last';
            if (openAt) items().at(edge === 'first' ? 0 : -1)?.focus();
            else setOpenAt(edge);
          }
        }}>AGDF Companion <span className="companion-menu-chevron" aria-hidden="true"/></button>
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
