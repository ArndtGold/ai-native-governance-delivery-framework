import type { CockpitBridge } from './transport';
import { useEffect, useState } from 'react';
import type { SdkTrace } from './sdk-trace';

// Diagnostics have no model-context writer. Production context writes use the
// session-bound handoff controller and the exclusive Core publication owner.
export function HostProbe({ bridge, trace, onClose }: { bridge: CockpitBridge; trace?: SdkTrace; onClose?: () => Promise<void> }) {
  const [snapshot, setSnapshot] = useState('');
  const [recording, setRecording] = useState(false);
  const [teardown, setTeardown] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const requestTeardown = async () => {
    if (!onClose) return;
    setTeardown('sending');
    try { await onClose(); setTeardown('sent'); }
    catch { setTeardown('failed'); }
  };
  useEffect(() => recording ? trace?.subscribe(() => setSnapshot(trace.snapshot())) : undefined, [trace, recording]);
  return <details className="host-probe"><summary>Host-Verbindung prüfen</summary>
    <pre>{JSON.stringify({ host: bridge.app.getHostVersion(), capabilities: bridge.app.getHostCapabilities(),
      display: bridge.app.getHostContext()?.displayMode }, null, 2)}</pre>
    <p>Gemeldete Host-Fähigkeiten. Eine erfolgreiche Kontextübergabe wird erst nach ihrer tatsächlichen Bestätigung angezeigt.</p>
    {trace && <>
      <p>SDK-Diagnose: Der begrenzte Puffer enthält die Nachrichten dieser Ansicht, einschließlich gelesener Quellen. Aufzeichnung gibt sie an die Host-Diagnose aus. Sie ist keine Freigabe und bestätigt keinen erfolgreichen Export.</p>
      <button type="button" disabled={recording} onClick={() => { trace.start(); setRecording(true); setSnapshot(trace.snapshot()); }}>SDK-Nachweis aufzeichnen</button>
      <p>Die eigene Kontextbereinigung und das Sitzungsende werden zuerst bestätigt. Erst danach bittet der öffentliche SDK-Aufruf den Host, diese Ansicht auszublenden.</p>
      <button type="button" disabled={!onClose || !recording || teardown !== 'idle'} onClick={() => void requestTeardown()}>Sitzung beenden und Host schließen lassen</button>
      {teardown !== 'idle' && <p role="status">{teardown === 'sending' ? 'Anforderung wird gesendet …' : teardown === 'sent'
        ? 'Bereinigung bestätigt und Host-Anfrage gesendet. Die Host-Darstellung kann bestehen bleiben.'
        : 'Schließvorgang nicht vollständig bestätigt. Keine automatische Wiederholung.'}</p>}
      {snapshot && <pre aria-label="SDK-Nachrichten dieser Ansicht" style={{ maxHeight: '24rem' }}>{snapshot}</pre>}
    </>}
  </details>;
}
