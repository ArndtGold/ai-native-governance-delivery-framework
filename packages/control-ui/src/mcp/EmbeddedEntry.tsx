import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { App } from '../App';
import { flushSync } from 'react-dom';
import { CockpitBridge } from './transport';
import { applyDocumentTheme, applyHostStyleVariables, PostMessageTransport } from '@modelcontextprotocol/ext-apps';
import { SdkTrace, lifecycleConsole } from './sdk-trace';
import { readRenderBootstrap, type RenderBootstrap } from './bootstrap';
import { HandoffController } from './handoff';
import { createHandoffPort } from './handoff-port';
import { HostProbe } from './HostProbe';
import { createViewCloser } from './view-close';

export function EmbeddedEntry({ bridge }: { bridge: CockpitBridge }) {
  const trace = useMemo(() => {
    const logLifecycle = lifecycleConsole(row => console.warn('AGDF_SDK_TRACE ' + row));
    return new SdkTrace(row => {
    // Native Host logs retain warning output when the view is destroyed; the
    // recorder emits only after deliberate opt-in and remains bounded.
    logLifecycle(row);
    if (bridge.app.getHostCapabilities()?.logging) void bridge.app.sendLog({ level: 'info', logger: 'agdf.sdk.trace', data: row }).catch(() => {});
    });
  }, [bridge]);
  const [bootstrap, setBootstrap] = useState<RenderBootstrap | null>(null);
  const current = useRef<RenderBootstrap | null>(null);
  const [ready, setReady] = useState(false), [expanded, setExpanded] = useState(false), [problem, setProblem] = useState('');
  const terminal = useRef<HTMLElement>(null);
  const [closeState, setCloseState] = useState<'open' | 'closing' | 'closed' | 'blocked'>('open');
  useLayoutEffect(() => {
    if (ready && closeState === 'open') return bridge.app.setupSizeChangedNotifications();
  }, [bridge, ready, closeState]);
  const handoff = useMemo(() => new HandoffController(createHandoffPort(bridge, bootstrap?.sessionId ?? '')), [bridge, bootstrap?.sessionId]);
  const transport = useMemo(() => bridge.readForSession(bootstrap?.sessionId ?? ''), [bridge, bootstrap?.sessionId]);
  const handoffRef = useRef(handoff); handoffRef.current = handoff;
  const closer = useMemo(() => createViewCloser(bridge, handoff, bootstrap?.sessionId ?? '', bootstrap?.targetId ?? ''), [bridge, handoff, bootstrap?.sessionId, bootstrap?.targetId]);
  const closerRef = useRef(closer); closerRef.current = closer;
  useEffect(() => {
    let connected = false, alive = true;
    const update = () => {
      if (!alive) return;
      setReady(connected && !!bridge.session && !!bridge.app.getHostCapabilities()?.serverTools);
      const host = bridge.app.getHostContext();
      if (host?.theme) applyDocumentTheme(host.theme);
      if (host?.styles?.variables) applyHostStyleVariables(host.styles.variables);
      const mode = host?.displayMode;
      setExpanded(mode === 'fullscreen' || mode === 'pip');
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
    void bridge.app.connect(trace.wrap(new PostMessageTransport(window.parent, window.parent)), { timeout: 10_000 }).then(() => { connected = true; update(); }).catch(() => { if (alive) setProblem('Die Codex-Anbindung konnte nicht bestätigt werden.'); });
    return () => { alive = false; };
  }, [bridge, trace]);
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
        flushSync(() => setExpanded(false));
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
    try {
      const modes = bridge.app.getHostContext()?.availableDisplayModes ?? [];
      const mode = modes.includes('fullscreen') ? 'fullscreen' : modes.includes('pip') ? 'pip' : null;
      if (!mode) throw Error();
      const result = await bridge.request(() => bridge.app.requestDisplayMode({ mode }, { timeout: 10_000 }));
      if (result.mode !== 'fullscreen' && result.mode !== 'pip') throw Error();
      setExpanded(true);
    } catch { setProblem('Eine größere Ansicht wurde nicht bestätigt. Nutze den vorhandenen Browser-Weg.'); }
  };
  return <div className="mcp-entry" data-terminal={closeState !== 'open' ? 'true' : undefined}>
    {closeState !== 'open' ? <section className="mcp-terminal" ref={terminal} aria-label="Cockpit-Sitzung schließen"><h1>AGDF Cockpit</h1><p role="status">{closeState === 'closing'
      ? 'Kontext wird entwertet und die Sitzung wird geschlossen …' : closeState === 'closed'
        ? 'Kontextbereinigung und Sitzungsende sind bestätigt. Der Host kann diese Karte weiter anzeigen.'
        : 'Die Bereinigung ist nicht bestätigt. Die Ansicht bleibt gesperrt; der Host wurde nicht um das Ausblenden gebeten.'}</p></section>
      : ready && bootstrap ? <App key={`app:${bootstrap.sessionId}`} transport={transport} initialRunId={bootstrap.initialRunId} compact={!expanded} handoff={handoff} onExpand={() => void open()}/> : <section className="mcp-connecting" aria-label="AGDF Cockpit"><h1>AGDF Cockpit</h1><p role="status">Verbindung zum lokalen Projekt wird hergestellt …</p></section>}
    {problem && <p role="alert">{problem}</p>}
    {closeState === 'open' && expanded && <HostProbe key={`probe:${bootstrap?.sessionId}`} bridge={bridge} trace={trace} onClose={closeFromApp}/>}
  </div>;
}
