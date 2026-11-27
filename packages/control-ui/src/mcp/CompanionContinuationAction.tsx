import { useEffect, useRef, useState } from 'react';
import type { CompanionContinuation, ContinuationSelection, ContinuationState } from './companion-continuation';

const checkMessage = {
  checking: 'Der Begleiter prüft die bestehende Übergabe.',
  pending: 'Der Begleiter hat den Status geprüft. Du musst gerade nichts tun.',
  unavailable: 'Der Status ließ sich gerade nicht prüfen. Der Begleiter versucht es weiter.',
};

export function CompanionContinuationAction({ port, selection, approval, stepId, onReload }: {
  port: CompanionContinuation; selection: ContinuationSelection; approval: boolean;
  stepId?: string; onReload?: () => void;
}) {
  const [state, setState] = useState<ContinuationState | 'starting' | null>(null);
  const [check, setCheck] = useState<'checking' | 'pending' | 'unavailable' | null>(null);
  const [retry, setRetry] = useState(false);
  const lifetime = useRef<AbortController | null>(null);
  const checkStatus = useRef<(() => void) | null>(null);
  const inFlight = useRef(false);
  const startCount = useRef(0);
  const { snapshot_id, run_id, revision_id } = selection;
  useEffect(() => {
    const controller = new AbortController();
    lifetime.current = controller;
    let timer: ReturnType<typeof setTimeout>;
    let reading = false;
    let checkRequested = false;
    const poll = async (manual = false) => {
      if (controller.signal.aborted) return;
      if (manual && !checkRequested) {
        checkRequested = true;
        setCheck('checking');
      }
      if (reading) return;
      clearTimeout(timer);
      if (!inFlight.current) {
        const count = startCount.current;
        reading = true;
        const status = await port.status({ snapshot_id, run_id, revision_id }, controller.signal);
        reading = false;
        if (!controller.signal.aborted && !inFlight.current && count === startCount.current) {
          setState(previous => previous === 'stale'
            || (status === 'unavailable' && (previous === 'pending' || previous === 'running' || previous === 'stopping' || previous === 'legacy' || previous === 'legacy_restart')) ? previous : status);
          if (checkRequested) {
            setCheck(status === 'pending' || status === 'unavailable' ? status : null);
            checkRequested = false;
          } else if (status === 'pending') {
            setCheck(previous => previous === 'unavailable' ? null : previous);
          }
          if (status === 'pending' || status === 'running' || status === 'stopping') setRetry(false);
        }
      }
      if (!controller.signal.aborted) timer = setTimeout(() => void poll(), 2500);
    };
    checkStatus.current = () => void poll(true);
    void poll();
    return () => { controller.abort(); clearTimeout(timer); lifetime.current = null; checkStatus.current = null; };
  }, [port, snapshot_id, run_id, revision_id]);

  const start = async () => {
    const signal = lifetime.current?.signal;
    if (!signal || signal.aborted || inFlight.current || state !== 'ready') return;
    inFlight.current = true;
    startCount.current++;
    setCheck(null);
    setRetry(false);
    setState('starting');
    try {
      const status = await port.start(selection, signal);
      if (!signal.aborted) {
        const failed = status === 'ready' || status === 'unavailable';
        setRetry(failed);
        setState(failed ? 'unavailable' : status);
      }
    } finally { inFlight.current = false; }
  };

  if (state === 'ready') return <button type="button" className="companion-source" aria-describedby={stepId} onClick={() => void start()}>
    {retry ? 'Erneut versuchen' : approval ? 'Freigabe prüfen' : 'Run fortsetzen'}
  </button>;
  if (state === 'starting') return <p role="status">Der Begleiter bereitet die Übergabe an Codex vor.</p>;
  if (state === 'running') return <p role="status">Codex arbeitet bereits an diesem Run.</p>;
  if (state === 'stopping') return <p role="status">Der Abbruch ist erfasst. Sobald der Auftrag vollständig beendet ist, kannst du den Run fortsetzen.</p>;
  if (state === 'legacy_restart') return <p role="status">Für den Wechsel zur neuen AGDF-Fassung ist ein vollständiger Neustart des Computers erforderlich. Damit lässt sich das Ende älterer Verbindungen sicher bestätigen. Ein Neustart von Codex allein genügt dafür nicht.</p>;
  if (state === 'legacy') return <p role="status">Der Abschluss einer älteren AGDF-Verbindung ist noch nicht bestätigt. Deshalb bleibt ein weiterer Start gesperrt.</p>;
  if (state === 'pending') return <>
    <p role="status"><span>Die Bestätigung von Codex steht noch aus.</span>{' '}
      {check ? checkMessage[check] : 'Der Begleiter prüft die Übergabe automatisch. Du musst gerade nichts tun.'}</p>
    <button type="button" className="companion-source" aria-disabled={check === 'checking' || undefined}
      onClick={() => { if (check !== 'checking') checkStatus.current?.(); }}>Übergabe prüfen</button>
  </>;
  if (state === 'stale' || state === 'unavailable') return <>
    <p role="status">{state === 'stale' ? 'Der Run hat sich geändert. Lade den aktuellen Stand.'
      : 'Die Fortsetzung ist gerade nicht verfügbar. Lade den Run neu, um den aktuellen Stand zu prüfen.'}</p>
    {onReload && <button type="button" className="companion-source" onClick={onReload}>Run neu laden</button>}
  </>;
  return null;
}
