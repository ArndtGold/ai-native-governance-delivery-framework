import { useEffect, useRef, useState, useMemo } from 'react';
import { App } from '../App';
import { CockpitBridge } from './transport';
import { applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps';
import { readRenderBootstrap, type RenderBootstrap } from './bootstrap';
import { HandoffController } from './handoff';
import { createHandoffPort } from './handoff-port';
import { HostProbe } from './HostProbe';

export function EmbeddedEntry({ bridge }: { bridge: CockpitBridge }) {
  const [bootstrap, setBootstrap] = useState<RenderBootstrap | null>(null);
  const current = useRef<RenderBootstrap | null>(null);
  const [ready, setReady] = useState(false), [expanded, setExpanded] = useState(false), [problem, setProblem] = useState('');
  const handoff = useMemo(() => new HandoffController(createHandoffPort(bridge, bootstrap?.sessionId ?? '')), [bridge, bootstrap?.sessionId]);
  const transport = useMemo(() => bridge.readForSession(bootstrap?.sessionId ?? ''), [bridge, bootstrap?.sessionId]);
  const handoffRef = useRef(handoff); handoffRef.current = handoff;
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
      setBootstrap(next); setProblem('');
      update();
    };
    bridge.app.onhostcontextchanged = update;
    bridge.app.onteardown = async () => {
      alive = false;
      const session = current.current?.sessionId, controller = handoffRef.current;
      try { await controller.invalidate(); }
      finally { if (session) await bridge.operation({ operation: 'close' }, undefined, session).catch(() => {}); }
      return {};
    };
    void bridge.app.connect(undefined, { timeout: 10_000 }).then(() => { connected = true; update(); }).catch(() => { if (alive) setProblem('Die Codex-Anbindung konnte nicht bestätigt werden.'); });
    return () => { alive = false; };
  }, [bridge]);
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
  return <div className="mcp-entry">
    {ready && bootstrap ? <App key={bootstrap.sessionId} transport={transport} initialRunId={bootstrap.initialRunId} compact={!expanded} handoff={handoff} onExpand={() => void open()}/> : <section className="mcp-connecting" aria-label="AGDF Cockpit"><h1>AGDF Cockpit</h1><p role="status">Verbindung zum lokalen Projekt wird hergestellt …</p></section>}
    {problem && <p role="alert">{problem}</p>}
    {expanded && <HostProbe key={bootstrap?.sessionId} bridge={bridge}/>}
  </div>;
}
