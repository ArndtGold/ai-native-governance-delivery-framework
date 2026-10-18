import type { CockpitBridge } from './transport';
import { useEffect, useState } from 'react';
import type { SdkTrace } from './sdk-trace';

// Diagnostics have no model-context writer. Production context writes use the
// session-bound handoff controller and the exclusive Core publication owner.
export function HostProbe({ bridge, trace }: { bridge: CockpitBridge; trace?: SdkTrace }) {
  const [snapshot, setSnapshot] = useState('');
  const [recording, setRecording] = useState(false);
  const [teardown, setTeardown] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const requestTeardown = async () => {
    setTeardown('sending');
    try { await bridge.app.requestTeardown(); setTeardown('sent'); }
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
      <p>Der öffentliche SDK-Aufruf bittet den Host, diese Ansicht zu beenden. Erst ein empfangener Teardown mit abgeschlossener Bereinigung bestätigt das Beenden.</p>
      <button type="button" disabled={!recording || teardown !== 'idle'} onClick={() => void requestTeardown()}>Beenden beim Host anfordern</button>
      {teardown !== 'idle' && <p role="status">{teardown === 'sending' ? 'Anforderung wird gesendet …' : teardown === 'sent'
        ? 'Anforderung gesendet. Das Beenden durch den Host ist damit noch nicht bestätigt.'
        : 'Anforderung konnte nicht gesendet werden. Keine automatische Wiederholung.'}</p>}
      {snapshot && <pre aria-label="SDK-Nachrichten dieser Ansicht" style={{ maxHeight: '24rem' }}>{snapshot}</pre>}
    </>}
  </details>;
}
