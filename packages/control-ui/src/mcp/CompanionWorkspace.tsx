import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { DocumentView, OriginalDocumentDownload } from '../DocumentView';
import { documentName } from '../presentation';
import type { CompanionReader } from '../useCompanionReader';
import { Icon } from './Icon';

export type CompanionConstraints = { height?: number; maxHeight?: number; displayMode?: string };
const positive = (value: number | undefined) => typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
const READER_INLINE_OPEN_WIDTH = 850;
const READER_INLINE_HIDE_WIDTH = 763;
const READER_PANEL_HIDE_WIDTH = 523;
const READER_FULL_OPACITY_WIDTH = 800;

function ApprovalNotice({ confirmed }: { confirmed: boolean }) {
  const [phase, setPhase] = useState<'waiting' | 'visible' | 'expired'>('waiting');
  useEffect(() => {
    if (confirmed) setPhase(previous => previous === 'waiting' ? 'visible' : previous);
  }, [confirmed]);
  useEffect(() => {
    if (phase !== 'visible') return;
    const timer = window.setTimeout(() => setPhase('expired'), 5_000);
    return () => window.clearTimeout(timer);
  }, [phase]);
  return <span className="companion-approval-notice" role="status">{phase === 'visible' && 'Deine Abnahme ist erfasst.'}</span>;
}

export function CompanionWorkspace({ reader, children, footer, onWidth, constraints, onLink, onClose, onReload }: {
  reader: CompanionReader; children: ReactNode; footer: ReactNode; onWidth: (wide: boolean) => void;
  constraints?: CompanionConstraints; onLink: (id: string) => void; onClose: () => void; onReload: () => void;
}) {
  const root = useRef<HTMLDivElement>(null), column = useRef<HTMLDivElement>(null);
  const readerPanel = useRef<HTMLElement>(null);
  const [wide, setWide] = useState(false), [height, setHeight] = useState(760);
  const measuredWide = useRef(false), focusWasInReader = useRef(false);
  const splitRun = useRef<string | null>(null);
  const { open: readerOpen, retained, run: readerRun, savePosition, standalone } = reader;
  const wasOpen = useRef(false);
  const returnTarget = useRef<HTMLElement | null>(null);
  const focusedSource = useRef<{ element: HTMLElement; heading: HTMLElement | null } | null>(null);
  const switchFocusRun = useRef<string | null>(null);
  const retryButton = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const entry = element.closest('.mcp-entry');
    const measure = () => {
      const rect = element.getBoundingClientRect();
      const shell = element.closest('.compact-cockpit')!;
      const top = rect.top - shell.getBoundingClientRect().top;
      const shellStyle = getComputedStyle(shell);
      // The side panel can cap the closed card. Measure the host region so
      // there is still enough room to detect when the split view fits.
      const entryStyle = entry && getComputedStyle(entry);
      const available = entry ? entry.clientWidth - (parseFloat(entryStyle!.paddingLeft) || 0)
        - (parseFloat(entryStyle!.paddingRight) || 0) : rect.width;
      if (!retained || splitRun.current !== readerRun) splitRun.current = null;
      const expandedPanel = constraints?.displayMode === 'fullscreen' || constraints?.displayMode === 'pip';
      const hideWidth = expandedPanel ? READER_PANEL_HIDE_WIDTH : READER_INLINE_HIDE_WIDTH;
      // The side panel reveals the first draft as soon as there is room for a
      // preview. A manually opened standalone Reader keeps its full width.
      const returningToSplit = splitRun.current !== null && !standalone;
      const canReveal = !standalone && (expandedPanel || returningToSplit);
      const nextWide = canReveal ? available > hideWidth : available >= READER_INLINE_OPEN_WIDTH;
      if (nextWide && readerOpen) splitRun.current = readerRun;
      if (measuredWide.current && !nextWide) {
        savePosition();
        focusWasInReader.current = !!readerPanel.current?.contains(document.activeElement);
      }
      measuredWide.current = nextWide;
      const opacity = (available - hideWidth) / (READER_FULL_OPACITY_WIDTH - hideWidth);
      element.style.setProperty('--companion-reader-opacity', String(Math.max(0, Math.min(1, opacity))));
      setWide(nextWide);
      onWidth(nextWide);
      const padding = (parseFloat(shellStyle.paddingBottom) || 0) + (parseFloat(shellStyle.borderBottomWidth) || 0);
      const fixed = positive(constraints?.height), maximum = positive(constraints?.maxHeight);
      const fullscreen = constraints?.displayMode === 'fullscreen';
      let budget = fixed ?? (fullscreen ? window.innerHeight : 760);
      if (maximum) budget = Math.min(budget, maximum);
      if (fullscreen || constraints?.displayMode === 'pip') {
        const messages = entry ? [...entry.children].filter(child => child !== shell).reduce((total, child) => {
          const style = getComputedStyle(child);
          if (style.display === 'none' || style.position === 'fixed' || style.position === 'absolute') return total;
          return total + child.getBoundingClientRect().height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
        }, 0) : 0;
        budget = Math.min(budget, window.innerHeight - shell.getBoundingClientRect().top - messages);
      }
      setHeight(Math.max(1, budget - top - padding));
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element); observer?.observe(element.closest('.compact-cockpit')!);
    if (entry) observer?.observe(entry);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [onWidth, readerOpen, retained, readerRun, savePosition, standalone, constraints?.height, constraints?.maxHeight, constraints?.displayMode]);
  useLayoutEffect(() => {
    const removed = focusedSource.current;
    if (removed && !removed.element.isConnected) {
      focusedSource.current = null;
      const active = document.activeElement;
      // Repair only a source action we actually observed focused in this Run.
      // A surviving control (including deliberate reader focus) always wins.
      if (reader.sourceInReader && removed.heading?.isConnected && column.current?.contains(removed.heading)
        && (!active || active === document.body || !active.isConnected)) {
        removed.heading.focus({ preventScroll: true });
      }
    }
    if (!wide && reader.open && column.current?.contains(document.activeElement)) reader.readerHeading.current?.focus({ preventScroll: true });
    if (wasOpen.current && !reader.open && (!reader.retained || focusWasInReader.current)
      || returnTarget.current && !returnTarget.current.isConnected && document.activeElement === document.body) {
      returnTarget.current = column.current?.querySelector<HTMLElement>('.companion-source') ?? column.current?.querySelector<HTMLElement>('[data-focus-id="companion-run-heading"]') ?? null;
      returnTarget.current?.focus({ preventScroll: true });
    }
    focusWasInReader.current = false;
    wasOpen.current = reader.open;
  }, [wide, reader.open, reader.retained, reader.sourceInReader, reader.readerHeading, children]);
  useLayoutEffect(() => {
    const run = switchFocusRun.current;
    if (!run) return;
    if (!reader.open || reader.run !== run) { switchFocusRun.current = null; return; }
    if (reader.loading) return;
    switchFocusRun.current = null;
    const active = document.activeElement;
    if (reader.problem && (!active || active === document.body || !active.isConnected)) {
      const retry = retryButton.current;
      (retry && !retry.disabled ? retry : reader.readerHeading.current)?.focus({ preventScroll: true });
    }
  }, [reader.open, reader.run, reader.loading, reader.problem, reader.readerHeading]);
  const shown = reader.capture;
  const shownDocument = shown?.document.data;
  const documentType = shownDocument?.resource.type ?? reader.source?.type;
  const typeLabel = documentType ? documentName(documentType) : 'Dokument';
  const isDraft = shownDocument ? shownDocument.document_state?.version_kind === 'draft' : reader.source?.draft;
  const recheck = () => { reader.retry(); onReload(); };
  const offered = reader.offered;
  const openCurrent = offered && <button type="button" disabled={!reader.canOpen} onClick={event => {
    switchFocusRun.current = document.activeElement === event.currentTarget ? reader.run : null;
    void reader.openSource(offered);
  }}>Aktuelle Fassung öffnen</button>;
  const sessionMessage = reader.expired ? 'Die Sitzung ist abgelaufen.' : reader.sessionInvalid ? 'Die Sitzung ist ungültig.' : null;
  const reopen = sessionMessage && `${sessionMessage} Öffne den Begleiter im Chat erneut.`;
  const readerLabel = documentType === 'UAT Presentation' || documentType === 'OR' ? typeLabel : 'Entwurf';
  const closeLabel = wide ? `${readerLabel} schließen` : 'Zurück zum Companion';
  const closeButton = <button key="reader-close" type="button" className="companion-reader-action" aria-label={closeLabel} title={closeLabel} onClick={onClose}>
    <Icon name={wide ? 'close' : 'back'}/>
  </button>;
  return <div ref={root} className="companion-workspace" data-display-mode={constraints?.displayMode} data-wide={wide} data-reading={reader.open} style={{ height }}
    onFocusCapture={event => {
      const element = event.target.closest<HTMLElement>('.companion-source');
      focusedSource.current = element && column.current?.contains(element)
        ? { element, heading: column.current.querySelector<HTMLElement>('[data-focus-id="companion-run-heading"]') } : null;
    }}
    onBlurCapture={event => {
      if (event.relatedTarget instanceof HTMLElement && event.relatedTarget.isConnected) focusedSource.current = null;
    }}>
    {reader.retained && <section ref={readerPanel} className="companion-reader" aria-label={`${readerLabel} lesen`} aria-busy={reader.loading} hidden={!reader.open}>
      <header className="companion-reader-header">
        {!wide && closeButton}
        <h2 ref={reader.readerHeading} tabIndex={-1} data-focus-id="companion-reader-heading"
          aria-label={isDraft ? `${typeLabel} · Entwurf` : typeLabel}>
          <Icon name="document"/>
          <span>{typeLabel}{isDraft && <span className="reader-draft-label"><span className="reader-label-divider"> · </span>Entwurf</span>}</span>
        </h2>
        {shown && <OriginalDocumentDownload className="companion-reader-action" result={shown.document} detail={shown.detail} current={reader.current}>
          <Icon name="download"/>
          <span className="companion-reader-download-hint" aria-hidden="true">Download</span>
        </OriginalDocumentDownload>}
        {wide && closeButton}
        {reader.shownSource?.decision && <ApprovalNotice key={reader.shownSource.decision} confirmed={reader.open && reader.decisionClosed}/>}
      </header>
      {reader.failedSwitch ? <div className="companion-reader-notice" role="status">
          Run „{reader.failedSwitch.requested}“ konnte nicht geöffnet werden. Geöffnet bleibt „{reader.failedSwitch.retained}“.{' '}
          {reopen ?? <button type="button" disabled={!reader.canReload} onClick={onReload}>Wechsel erneut versuchen</button>}
        </div>
        : reopen ? <p className="companion-reader-notice" role="status">{reopen}</p>
        : reader.loading ? <p className="companion-reader-notice" role="status">{reader.source?.draft ? 'Entwurf wird geladen …' : 'Quelle wird gelesen …'}</p>
        : reader.problem ? <div className="companion-reader-notice" role="alert">{reader.problem}
          <button ref={retryButton} type="button" disabled={!reader.canReload} onClick={recheck}>Erneut prüfen</button>
          {reader.pendingDecision && openCurrent}
        </div>
        : reader.pendingDecision ? <div className="companion-reader-notice" role="status">Neue Fassung verfügbar.{openCurrent}</div>
        : shown && !reader.decisionClosed && !reader.current && !reader.checking ? <div className="companion-reader-notice" role="status">Aktueller Stand nicht bestätigt.
          <button type="button" disabled={!reader.canReload} onClick={recheck}>Erneut prüfen</button>
        </div> : null}
      <div className="companion-reader-scroll" ref={reader.viewport} onScroll={reader.savePosition} tabIndex={0} aria-label="Dokumentinhalt">
        {shown && <DocumentView companion result={shown.document} detail={shown.detail} current={reader.current}
          navigationEnabled={reader.current} onOpen={onLink}/>}
      </div>
      {!wide && offered?.resource.type === 'OR' && reader.shownSource?.key !== offered.key &&
        <button type="button" className="companion-source" disabled={!reader.canOpen} onClick={() => void reader.openSource(offered)}>Lieferbericht öffnen</button>}
    </section>}
    <div className="companion-column" ref={column} hidden={!wide && reader.open}>
      <div className="companion-column-scroll">{children}</div>
      {footer}
    </div>
  </div>;
}
