import { useEffect, useRef, useState, useMemo } from 'react';
import { App } from '../App';
import { CockpitBridge } from './transport';
import { applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps';
import { readRenderBootstrap, type RenderBootstrap } from './bootstrap';
import { HandoffController } from './handoff';
import { createHandoffPort } from './handoff-port';

export function EmbeddedEntry({ bridge }: { bridge: CockpitBridge }) {
  const [bootstrap, setBootstrap] = useState<RenderBootstrap | null>(null);
  const current = useRef<RenderBootstrap | null>(null);
  const [ready, setReady] = useState(false), [expanded, setExpanded] = useState(false), [problem, setProblem] = useState('');
  const handoff = useMemo(() => new HandoffController(createHandoffPort(bridge)), [bridge]);
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
      if (!next || current.current && (next.generation <= current.current.generation || next.targetId !== current.current.targetId)) return;
      void handoffRef.current.invalidate();
      current.current = next; bridge.session = next.sessionId;
      setBootstrap(next); setProblem('');
      update();
    };
    bridge.app.onhostcontextchanged = update;
    bridge.app.onteardown = async () => {
      alive = false;
      try { await handoffRef.current.invalidate(); await bridge.operation({ operation: 'close' }); } catch { /* Process/host loss may prevent acknowledgement. */ }
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
    {ready && bootstrap ? <App key={bootstrap.sessionId} transport={bridge.read} initialRunId={bootstrap.initialRunId} compact={!expanded} handoff={handoff} onExpand={() => void open()}/> : <section className="mcp-connecting" aria-label="AGDF Cockpit"><h1>AGDF Cockpit</h1><p role="status">Verbindung zum lokalen Projekt wird hergestellt …</p></section>}
    {problem && <p role="alert">{problem}</p>}
    {expanded && <details className="host-probe"><summary>Host-Verbindung prüfen</summary><pre>{JSON.stringify({ host: bridge.app.getHostVersion(), capabilities: bridge.app.getHostCapabilities(), display: bridge.app.getHostContext()?.displayMode }, null, 2)}</pre></details>}
  </div>;
}
