import { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { App, type CompanionDisplay } from '../App';
import type { CompanionConstraints } from './CompanionWorkspace';
import { flushSync } from 'react-dom';
import { CockpitBridge } from './transport';
import { applyDocumentTheme, applyHostStyleVariables, PostMessageTransport } from '@modelcontextprotocol/ext-apps';
import { SdkTrace, lifecycleConsole } from './sdk-trace';
import { readRenderBootstrap, type RenderBootstrap } from './bootstrap';
import { HandoffController } from './handoff';
import { createHandoffPort } from './handoff-port';
import { HostProbe } from './HostProbe';
import { createViewCloser } from './view-close';
import { useReviewView } from './review-view';
import type { CockpitCheckpoint } from '../App';
import { cockpitHostFromName, type CockpitHost } from '../host-label';
import { createCompanionContinuation } from './companion-continuation';

export function EmbeddedEntry({ bridge, diagnostics = false }: { bridge: CockpitBridge; diagnostics?: boolean }) {
  const trace = useMemo(() => {
    if (!diagnostics) return undefined;
    const logLifecycle = lifecycleConsole(row => console.warn('AGDF_SDK_TRACE ' + row));
    return new SdkTrace(row => {
      // The recorder emits only after deliberate opt-in and remains bounded.
      logLifecycle(row);
      if (bridge.app.getHostCapabilities()?.logging) void bridge.app.sendLog({ level: 'info', logger: 'agdf.sdk.trace', data: row }).catch(() => {});
    });
  }, [bridge, diagnostics]);
  const [bootstrap, setBootstrap] = useState<RenderBootstrap | null>(null);
  const current = useRef<RenderBootstrap | null>(null);
  const [ready, setReady] = useState(false), [expanded, setExpanded] = useState(false), [problem, setProblem] = useState('');
  const [cockpitHost, setCockpitHost] = useState<CockpitHost>('unknown');
  const [companionConstraints, setCompanionConstraints] = useState<CompanionConstraints>({});
  const [expansionProblem, setExpansionProblem] = useState('');
  const expansionAttempt = useRef(0);
  const review = useReviewView(bridge);
  const checkpoint = useRef<CockpitCheckpoint | null>(null);
  const terminal = useRef<HTMLElement>(null);
  const [closeState, setCloseState] = useState<'open' | 'closing' | 'closed' | 'blocked'>('open');
  useLayoutEffect(() => {
    if (ready && closeState === 'open') return bridge.app.setupSizeChangedNotifications();
  }, [bridge, ready, closeState]);
  const handoff = useMemo(() => new HandoffController(createHandoffPort(bridge, bootstrap?.sessionId ?? '')), [bridge, bootstrap?.sessionId]);
  const transport = useMemo(() => bridge.readForSession(bootstrap?.sessionId ?? ''), [bridge, bootstrap?.sessionId]);
  const continuation = useMemo(() => bootstrap?.continuation
    ? createCompanionContinuation(bridge, bootstrap.sessionId, bootstrap.targetId) : undefined, [bridge, bootstrap]);
  const reportDisplay = useCallback(async (snapshotId: string, signal: AbortSignal, presentation?: CompanionDisplay) => {
    if (!bootstrap || current.current?.sessionId !== bootstrap.sessionId) return false;
    const result = await bridge.operation({ operation: 'display_ack', snapshot_id: snapshotId,
      ...(presentation && { presentation }) }, signal, bootstrap.sessionId) as {
      state?: string; data?: { display?: { state?: string } };
    };
    return result.state === 'available' && result.data?.display?.state === 'ui_reported_visible';
  }, [bridge, bootstrap]);
  const handoffRef = useRef(handoff); handoffRef.current = handoff;
  const closer = useMemo(() => createViewCloser(bridge, handoff, bootstrap?.sessionId ?? '', bootstrap?.targetId ?? ''), [bridge, handoff, bootstrap?.sessionId, bootstrap?.targetId]);
  const closerRef = useRef(closer); closerRef.current = closer;
  useEffect(() => {
    let connected = false, alive = true;
    const update = () => {
      if (!alive) return;
      setReady(connected && !!bridge.session && !!bridge.app.getHostCapabilities()?.serverTools);
      if (connected) setCockpitHost(cockpitHostFromName(bridge.app.getHostVersion()?.name, current.current?.integrationSurface));
      const host = bridge.app.getHostContext();
      if (host?.theme) applyDocumentTheme(host.theme);
      if (host?.styles?.variables) applyHostStyleVariables(host.styles.variables);
      setCompanionConstraints({ ...host?.containerDimensions, displayMode: host?.displayMode });
      const isExpanded = host?.displayMode === 'fullscreen' || host?.displayMode === 'pip';
      setExpanded(isExpanded);
      if (isExpanded) {
        expansionAttempt.current++;
        setExpansionProblem('');
      }
      review.observe();
    };
    bridge.app.ontoolresult = result => {
      if (!alive) return;
      const next = readRenderBootstrap(result);
      if (!next) {
        const content = result.structuredContent as { code?: string } | undefined;
        if (content?.code === 'resource_limit') setProblem('Vier Cockpit-Ansichten sind bereits offen oder werden aufgeräumt. Schließe eine ungenutzte Ansicht und öffne dann erneut.');
        return;
      }
      const previous = current.current;
      if (previous && next.targetId !== previous.targetId) return;
      if (previous && next.generation <= previous.generation) {
        if (next.sessionId !== previous.sessionId) void bridge.operation({ operation: 'close' }, undefined, next.sessionId).catch(() => {});
        return;
      }
      if (previous && next.sessionId !== previous.sessionId) {
        const oldHandoff = handoffRef.current;
        void oldHandoff.invalidate().finally(() => bridge.operation({ operation: 'close' }, undefined, previous.sessionId)).catch(() => {});
      }
      current.current = next; bridge.session = next.sessionId;
      expansionAttempt.current++;
      setExpansionProblem('');
      setBootstrap(next); setProblem(''); setCloseState('open');
      update();
    };
    bridge.app.onhostcontextchanged = update;
    bridge.app.onteardown = async () => {
      alive = false;
      const view = current.current;
      if (view?.sessionId) {
        // Tool results can arrive immediately before teardown, before React has
        // rendered their binding. Such a view has not published context yet.
        const owner = closerRef.current.session === view.sessionId ? closerRef.current
          : createViewCloser(bridge, new HandoffController(createHandoffPort(bridge, view.sessionId)), view.sessionId, view.targetId);
        await owner.close(true).catch(() => {});
      }
      return {};
    };
    const hostTransport = new PostMessageTransport(window.parent, window.parent);
    void bridge.app.connect(trace ? trace.wrap(hostTransport) : hostTransport, { timeout: 10_000 }).then(() => { connected = true; update(); }).catch(() => { if (alive) setProblem('Die Codex-Anbindung konnte nicht bestätigt werden.'); });
    return () => { alive = false; };
  }, [bridge, trace, review.observe]);
  const closeFromApp = async () => {
    const session = bootstrap?.sessionId;
    if (!session || current.current?.sessionId !== session) throw Error('session_changed');
    setCloseState('closing');
    try {
      await closer.close();
      if (current.current?.sessionId !== session) throw Error('session_changed');
      // Commit the compact terminal DOM before the Host moves it inline.
      flushSync(() => setCloseState('closed'));
    } catch (error) {
      if (current.current?.sessionId === session) setCloseState('blocked');
      throw error;
    }
    // Settle the public display-mode transition while the Host connection is
    // still live. Teardown may stop further context notifications entirely.
    try {
      if (bridge.app.getHostContext()?.availableDisplayModes?.includes('inline')) {
        const result = await bridge.app.requestDisplayMode({ mode: 'inline' }, { timeout: 10_000 });
        if (result.mode !== 'inline') throw Error('inline_mode_unconfirmed');
        review.observe();
      }
      if (terminal.current) {
        const box = terminal.current.getBoundingClientRect();
        await bridge.app.sendSizeChanged({ width: Math.ceil(box.width), height: Math.ceil(box.height) });
      }
      await bridge.app.requestTeardown();
    } catch (error) {
      setProblem('Sitzung und Kontext sind bereinigt. Die kompakte Host-Darstellung wurde nicht vollständig bestätigt. Keine automatische Wiederholung.');
      throw error;
    }
  };
  const open = async () => {
    const attempt = ++expansionAttempt.current;
    const modes = bridge.app.getHostContext()?.availableDisplayModes ?? [];
    const mode = modes.includes('fullscreen') ? 'fullscreen' : modes.includes('pip') ? 'pip' : null;
    if (!mode) {
      setExpansionProblem('Hier steht nur die kompakte Karte zur Verfügung. Du kannst darin weiterlesen.');
      return;
    }
    try {
      const result = await bridge.request(() => bridge.app.requestDisplayMode({ mode }, { timeout: 10_000 }));
      if (attempt !== expansionAttempt.current) return;
      if (result.mode !== 'fullscreen' && result.mode !== 'pip') throw Error();
      setExpanded(true);
      setExpansionProblem('');
    } catch {
      if (attempt === expansionAttempt.current) {
        setExpansionProblem('Die größere Ansicht wurde nicht bestätigt. Du kannst in der kompakten Karte weiterlesen.');
      }
    }
  };
  const returnToCompact = async () => {
    if (!bridge.app.getHostContext()?.availableDisplayModes?.includes('inline')) return;
    const attempt = ++expansionAttempt.current;
    try {
      const result = await bridge.request(() => bridge.app.requestDisplayMode({ mode: 'inline' }, { timeout: 10_000 }));
      if (attempt === expansionAttempt.current && result.mode === 'inline') setExpanded(false);
    } catch { /* The expanded reader can still return to the inspected Run. */ }
  };
  const visibleProblem = problem || expansionProblem;
  return <div className="mcp-entry" data-terminal={closeState !== 'open' ? 'true' : undefined}>
    {closeState !== 'open' ? <section className="mcp-terminal" ref={terminal} aria-label="Cockpit-Sitzung schließen"><h1>AGDF Cockpit</h1><p role="status">{closeState === 'closing'
      ? 'Kontext wird entwertet und die Sitzung wird geschlossen …' : closeState === 'closed'
        ? 'Kontextbereinigung und Sitzungsende sind bestätigt. Der Host kann diese Karte weiter anzeigen.'
        : 'Die Bereinigung ist nicht bestätigt. Die Ansicht bleibt gesperrt; der Host wurde nicht um das Ausblenden gebeten.'}</p></section>
      : ready && bootstrap ? <App key={`app:${bootstrap.sessionId}`} transport={transport} continuation={cockpitHost === 'codex' ? continuation : undefined} initialRunId={bootstrap.initialRunId} companionEmpty={bootstrap.companionEmpty} companionFallback={bootstrap.companionFallback} provenance={bootstrap.provenance} host={cockpitHost} companionConstraints={companionConstraints} compact={cockpitHost === 'codex' ? !expanded : review.role === 'card'} handoff={handoff} review={cockpitHost === 'codex' ? undefined : review} checkpoint={checkpoint} onExpand={() => { if (cockpitHost === 'codex') void open(); else void review.show('reader'); }} onReturnToCompact={returnToCompact} onDisplay={bootstrap.displayAck ? reportDisplay : undefined}/> : <section className="mcp-connecting" aria-label="AGDF Cockpit"><h1>AGDF Cockpit</h1><p role="status">Verbindung zum lokalen Projekt wird hergestellt …</p></section>}
    {visibleProblem && <p role="alert">{visibleProblem}</p>}
    {trace && closeState === 'open' && expanded && <HostProbe key={`probe:${bootstrap?.sessionId}`} bridge={bridge} trace={trace} onClose={closeFromApp}/>}
  </div>;
}
