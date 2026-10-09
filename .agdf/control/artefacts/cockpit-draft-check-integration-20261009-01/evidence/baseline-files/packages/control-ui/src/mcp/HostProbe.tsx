import type { CockpitBridge } from './transport';

// Metadata-only diagnostics. Production context writes use the session-bound
// handoff controller and the exclusive Core publication owner.
export function HostProbe({ bridge }: { bridge: CockpitBridge }) {
  return <details className="host-probe"><summary>Host-Verbindung prüfen</summary>
    <pre>{JSON.stringify({ host: bridge.app.getHostVersion(), capabilities: bridge.app.getHostCapabilities(),
      display: bridge.app.getHostContext()?.displayMode }, null, 2)}</pre>
    <p>Gemeldete Host-Fähigkeiten. Eine erfolgreiche Kontextübergabe wird erst nach ihrer tatsächlichen Bestätigung angezeigt.</p>
  </details>;
}
