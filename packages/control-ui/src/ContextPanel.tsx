import { useEffect, useState, useSyncExternalStore } from 'react';
import type { ReadTransport } from './api';
import type { Envelope, GraphData, Detail, DocumentData } from './types';
import { PassiveMarkdown } from './DocumentView';
import type { HandoffController, HandoffState } from './mcp/handoff';

const idle: HandoffState = { phase: 'idle' };
const inertSubscribe = () => () => {};
export function ContextPanel({ read, detail, document, disabled, handoff }: {
  read: ReadTransport; detail: Envelope<Detail>; document?: Envelope<DocumentData> | null; disabled: boolean; handoff?: HandoffController;
}) {
  const [expanded, setExpanded] = useState(false), [graph, setGraph] = useState<Envelope<GraphData> | null>(null);
  const [problem, setProblem] = useState(''), [selected, setSelected] = useState<string[]>([]), [excluded, setExcluded] = useState<string[]>([]);
  const state = useSyncExternalStore(handoff?.subscribe ?? inertSubscribe, handoff?.snapshot ?? (() => idle));
  const runId = detail.data?.run_id;
  useEffect(() => {
    if (!expanded || disabled || !runId || !detail.snapshot_id) return;
    const controller = new AbortController(); setGraph(null); setProblem('');
    void read<GraphData>(`/api/context/${runId}?snapshot=${detail.snapshot_id}`, controller.signal,
      { target: detail.target.target_id, snapshot: detail.snapshot_id }).then(value => {
      if (controller.signal.aborted) return;
      if (value.data && (value.data.run_id !== runId || value.data.references.some(r => r.run_id !== runId))) throw Error('dto_invalid');
      if (!value.data) throw Error(value.code ?? 'read_failed');
      setGraph(value);
    }).catch(error => { if (!controller.signal.aborted) setProblem(error instanceof Error ? error.message : 'read_failed'); });
    return () => controller.abort();
  }, [expanded, disabled, runId, detail.snapshot_id, detail.target.target_id, read]);
  useEffect(() => () => { void handoff?.invalidate(); }, [handoff]);
  const references = graph?.data?.references ?? [];
  const unavailable = references.filter(ref => ref.state !== 'available');
  const busy = ['preparing', 'sending', 'invalidating'].includes(state.phase);
  const canPrepare = !!handoff?.support().context && !!graph?.data && !problem && !disabled && !busy && state.phase !== 'uncertain'
    && document?.state === 'available' && !!detail.data?.revision_id && unavailable.every(ref => excluded.includes(ref.resource_id));
  const toggle = (id: string, checked: boolean, available: boolean) => {
    void handoff?.invalidate();
    const setter = available ? setSelected : setExcluded;
    setter(previous => checked ? [...previous, id] : previous.filter(value => value !== id));
  };
  const prepare = () => {
    if (!canPrepare || !handoff || !runId || !document?.data || !detail.snapshot_id || !detail.data?.revision_id) return;
    void handoff.prepare({ target: detail.target.target_id, snapshot_id: detail.snapshot_id, run_id: runId,
      revision_id: detail.data.revision_id, resource_id: document.data.resource.resource_id, graph_ids: selected, excluded_ids: excluded });
  };
  return <section className="context-panel agdf-surface" aria-label="Verknüpfter Kontext">
    <button className="context-toggle" aria-expanded={expanded} disabled={disabled} onClick={() => setExpanded(!expanded)}>Verknüpfter Kontext {expanded ? 'ausblenden' : 'ansehen'}</button>
    {expanded && <div>
      <p className="muted">Explizit im Vorhaben gepflegte Zusammenhänge. Quellen werden als Text gelesen.</p>
      {problem ? <p role="alert">Kontext konnte nicht gelesen werden · {problem}. Datenstand neu laden.</p> : !graph ? <p role="status">Verweise werden gelesen …</p> : !references.length ? <p>Für dieses Vorhaben sind keine Knoten referenziert.</p> : <ul className="context-references">{references.map(ref => <li key={ref.resource_id}>
        <div className="context-reference-heading"><strong>{ref.node_id ?? ref.origin}</strong>
          {handoff && document?.state === 'available' && <label><input type="checkbox" disabled={disabled || busy || state.phase === 'uncertain' || ref.state === 'available' && selected.length >= 16 && !selected.includes(ref.resource_id)}
            checked={(ref.state === 'available' ? selected : excluded).includes(ref.resource_id)} onChange={event => toggle(ref.resource_id, event.target.checked, ref.state === 'available')}/>
            {ref.state === 'available' ? 'In Kontext aufnehmen' : 'Bewusst ausschließen'}</label>}</div>
        {ref.state === 'available' ? <details><summary>Quelle lesen</summary><code>{ref.path}#{ref.node_id}</code><article className="document agdf-surface"><PassiveMarkdown content={ref.content!} links={{}} onOpen={() => {}}/></article><small>SHA-256 {ref.content_digest}</small></details>
          : <p className="context-unavailable">{referenceProblem(ref.code)} <code>{ref.origin}</code></p>}
      </li>)}</ul>}
      {handoff ? document?.state !== 'available' ? <p className="muted">Öffne ein Dokument, um seine Quelle mit ausgewählten Knoten an Codex zu übergeben.</p> : <div className="context-handoff">
        <p>Übergabe: <strong>{document.data?.resource.type}</strong> · {selected.length} von höchstens 16 Knoten. Ausgelassene und nicht verfügbare Verweise werden im Paket offengelegt.</p>
        {!!unavailable.length && !unavailable.every(ref => excluded.includes(ref.resource_id)) && <p>Entscheide zunächst bei jedem nicht verfügbaren Verweis, ob du ihn ausschließen möchtest.</p>}
        {!handoff.support().context && <p>Dieser Host bietet keine bestätigte Kontextübergabe. Die Quellen bleiben lesbar.</p>}
        {!handoff.support().question && <p>Dieser Host bietet kein bestätigtes Senden von Fragen aus der App.</p>}
        <div className="context-actions"><button disabled={!canPrepare} onClick={prepare}>Kontext übergeben</button><button disabled={disabled || state.phase !== 'accepted' || !handoff.support().question} onClick={() => void handoff.sendQuestion()}>Frage zu diesen Quellen senden</button></div>
        <p role="status">{handoffMessage(state)}</p>
        {state.packet && <details><summary>Übergebenes Paket prüfen</summary><p><code>{state.packet.context_id}</code> · Beobachtet {state.packet.observed_as_of}</p><pre>{JSON.stringify(state.packet, null, 2)}</pre></details>}
        {state.phase === 'uncertain' && <button disabled={disabled} onClick={() => void handoff.invalidate()}>Kontextentwertung erneut bestätigen</button>}
      </div> : <p className="muted">Die Kontextübergabe steht in der eingebetteten MCP-App zur Verfügung.</p>}
    </div>}
  </section>;
}
function referenceProblem(code: string | null) {
  return ({ graph_file_reference: 'Nur die Graph-Datei ist referenziert; kein Knoten ausgewählt.', reference_unresolved: 'Verweis nicht auflösbar.', graph_missing: 'Graph-Datei fehlt.', node_missing: 'Knoten fehlt.', node_ambiguous: 'Knoten-ID ist mehrfach vorhanden.', graph_unsupported: 'Graph-Text nicht lesbar.', resource_denied: 'Quelle nicht zugänglich.', resource_limit: 'Quelle überschreitet die Lesegrenze.' } as Record<string, string>)[code ?? ''] ?? 'Verweis nicht unterstützt.';
}
function handoffMessage(state: HandoffState) {
  if (state.code === 'message_rejected') return 'Der Host hat die Frage abgelehnt. Sie wird nicht automatisch erneut gesendet.';
  if (state.code?.startsWith('context_limit')) return `Das vollständige Kontextpaket überschreitet die Grenze von 64 KiB. Wähle weniger Knoten oder ein kleineres Dokument. Größe/Grenze in Bytes: ${state.code.split(':')[1] ?? 'nicht verfügbar'}.`;
  const messages = { idle: 'Noch kein Kontext übergeben. Die Frage wird separat gesendet.', preparing: 'Quellen werden geprüft und Kontext wird übergeben …', accepted: 'Kontext vom Host bestätigt. Die Frage wurde noch nicht gesendet.', sending: 'Quellen werden erneut geprüft; Frage wird gesendet …', question: 'Frage vom Host angenommen. Die Antwort ist noch nicht geprüft.', invalidating: 'Vorheriger Kontext wird entwertet …', error: 'Quellenprüfung fehlgeschlagen. Kein neuer Kontext bestätigt.', uncertain: 'Bestätigung fehlt. Zustellung kann unklar sein; keine automatische Wiederholung.' };
  return messages[state.phase] + (state.code ? ` (${state.code})` : '');
}
