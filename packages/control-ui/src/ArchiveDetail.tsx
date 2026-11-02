import { useEffect, useRef, useState } from 'react';
import type { Envelope, ArchiveData } from './types';
export type ArchiveLoader = (rowId: string, resourceId: string | undefined, signal: AbortSignal) => Promise<Envelope<ArchiveData>>;
export function ArchiveDetail({ rowId, load, onClose }: { rowId: string; load: ArchiveLoader; onClose: () => void }) {
  const [data, setData] = useState<ArchiveData | null>(null), [problem, setProblem] = useState(''), [busy, setBusy] = useState(false);
  const pending = useRef<AbortController | null>(null), heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (data?.entry.id) heading.current?.focus(); }, [data?.entry.id]);
  const read = async (resourceId?: string) => {
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller; setBusy(true); setProblem('');
    // Never show a preceding document while a different one loads or fails.
    setData(previous => previous ? { ...previous, document: null } : null);
    try { const response = await load(rowId, resourceId, controller.signal);
      if (!controller.signal.aborted) { if (response.state !== 'available' || !response.data) throw Error(response.code ?? 'read_failed'); setData(response.data); }
    } catch (error) { if (!controller.signal.aborted) setProblem(error instanceof Error ? error.message : 'read_failed'); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  };
  useEffect(() => { setData(null); void read(); return () => pending.current?.abort(); }, [rowId, load]);
  return <article aria-label="Altbestandsarchiv" className="panel agdf-surface archive-detail">
    <h2 ref={heading} tabIndex={-1}>{data?.entry.title ?? 'Archiv wird geladen'}</h2>
    <p role="note">Archivierter Altbestand · Nur lesen · Keine aktuelle Freigabe</p>
    <button onClick={onClose}>Archiv schließen</button>
    {problem && <p role="alert">Archiv konnte nicht sicher gelesen werden: {problem}. Bestand neu laden.</p>}
    {data && <><dl><dt>Art des Archivbestands</dt><dd>{({ run: 'Alter Run', artefacts: 'Artefakte ohne Run-Zustand', project: 'Gemeinsamer Projektbestand' })[data.entry.entry_kind]}</dd><dt>Archivkennung</dt><dd>{data.entry.id}</dd><dt>Aufgezeichneter Status</dt><dd>{data.entry.recorded_lifecycle ?? 'Nicht angegeben'}</dd>
      <dt>Aufgezeichnetes Gate</dt><dd>{data.entry.recorded_gate ?? 'Nicht angegeben'}</dd></dl>
      <details><summary>Aufgezeichnete Freigaben (ohne heutige Gültigkeit)</summary><ul>{data.entry.recorded_approvals.map(a => <li key={a.gate}>{a.gate}: {a.status}<p>{a.evidence}</p></li>)}</ul></details>
      <label>Archivdokument<select aria-label="Archivdokument" disabled={busy} value={data.document?.resource_id ?? ''} onChange={e => { if (e.target.value) void read(e.target.value); }}>
        <option value="">Dokument auswählen</option>{data.entry.resources.map(r => <option key={r.resource_id} value={r.resource_id} disabled={r.bytes > 2097152}>
          {r.original_path}{r.bytes > 2097152 ? ' · Erhalten, zu groß für die Vorschau' : ''}</option>)}</select></label>
      {data.document && <section aria-label="Archivdokumentinhalt"><p><code>{data.document.path}</code></p>
        {data.document.available ? <pre style={{ whiteSpace: 'pre-wrap' }}>{data.document.content}</pre> : <p>Dokument erhalten, Vorschau nicht verfügbar: {data.document.reason}</p>}
        <p><code>{data.document.digest}</code></p></section>}</>}
  </article>;
}
