import { useEffect, useState } from 'react';
import type { ReadTransport } from './api';
import { sameJson, validateData, validateEnvelope } from './api';
import type { Detail, DocumentData, Envelope } from './types';
import { PassiveMarkdown } from './DocumentView';

type Preview = { key: string; content: string | null; format?: string; summary?: DocumentData['cockpit_summary']; message?: string };
// Only show a unique, explicitly named source section; never infer questions from other prose.
function explicitQuestions(content: string) {
  const lines = content.split(/\r?\n/), headings: { index: number; level: number }[] = [];
  let fence: string | null = null;
  lines.forEach((line, index) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) { if (!fence) fence = marker[1][0]; else if (fence === marker[1][0]) fence = null; return; }
    if (fence) return;
    const match = line.match(/^(#{2,6})\s+(?:Offene Fragen|Offene Punkte|Open Questions|Open Items)\s*#*\s*$/i);
    if (match) headings.push({ index, level: match[1].length });
  });
  if (headings.length !== 1) return null;
  const { index, level } = headings[0];
  const end = lines.findIndex((line, i) => i > index && new RegExp(`^#{1,${level}}\\s+`).test(line));
  const text = lines.slice(index + 1, end < 0 ? undefined : end).join('\n').trim();
  return text && text.length <= 1200 ? text : null;
}
export function SourcePreview({ result, gate, read, current, compactSummary = false, clarification = false }: { result: Envelope<Detail>; gate: string; read?: ReadTransport; current: boolean; compactSummary?: boolean; clarification?: boolean }) {
  const data = result.data;
  const candidates = data?.resources.filter(r => r.run_id === data.run_id && r.type === gate && r.status === 'registered') ?? [];
  const resource = candidates.length === 1 ? candidates[0] : undefined;
  const state = data?.document_states?.find(s => s.resource_id === resource?.resource_id);
  const key = JSON.stringify([result.target.target_id, result.snapshot_id, data?.run_id, data?.revision_id, resource?.resource_id, state?.content_digest, current]);
  const [preview, setPreview] = useState<Preview | null>(null);
  useEffect(() => {
    if (!current || !read || !resource || !result.snapshot_id || state && state.source_state !== 'available') return;
    const controller = new AbortController();
    const path = `/api/preview/${resource.resource_id}?snapshot=${result.snapshot_id}&run_id=${resource.run_id}`;
    const expected = { target: result.target.target_id, snapshot: result.snapshot_id };
    void (async () => {
      try {
        const value = await read<DocumentData>(path, controller.signal, expected);
        validateEnvelope(value, expected); validateData(path, value);
        const doc = value.data;
        const same = doc?.resource && ['resource_id','run_id','type','path','registered_reference','status'].every(k =>
          doc.resource[k as keyof typeof doc.resource] === resource[k as keyof typeof resource]);
        if (value.state !== 'available' || !same || typeof doc?.content !== 'string'
          || (state && (!sameJson(doc.document_state, state) || doc.content_digest !== state.content_digest))) throw Error('source_unavailable');
        if (!controller.signal.aborted) setPreview({ key, content: doc.content, format: doc.format, summary: doc.cockpit_summary });
      } catch { if (!controller.signal.aborted) setPreview({ key, content: null, message: 'Die Vorschau ist nicht verfügbar. Öffne die registrierte Quelle oder lade den Stand neu.' }); }
    })();
    return () => controller.abort();
  }, [key, read]);
  const shown = preview?.key === key ? preview : null;
  if (!current) return <p className="muted" role="status">Der Datenstand ist nicht aktuell. Lade ihn neu, um die Vorschau zu sehen.</p>;
  if (!resource) return <p className="muted">{candidates.length > 1 ? 'Mehrere Quellen sind registriert. Wähle die passende Fassung aus.' : 'Für diesen Schritt ist keine Quelle verfügbar.'}</p>;
  if (state && state.source_state !== 'available') return <p className="muted">Die registrierte Quelle ist nicht verfügbar.</p>;
  if (!read) return <p className="muted">Eine Vorschau ist hier nicht verfügbar.</p>;
  if (!shown) return <p className="muted" role="status">Vorschau wird geladen …</p>;
  if (shown.message) return <p className="muted" role="status">{shown.message}</p>;
  const content = shown.content ?? '';
  const summary = shown.summary;
  const excerpt = summary?.markdown ?? content.slice(0, 1600);
  if (compactSummary) {
    const short = summary?.items ?? [];
    const questions = clarification ? summary?.markdown.split(/\r?\n/).filter(line => /^[-*]\s+(?:Offene Punkte|Offene Fragen|Open questions|Open items):\s*\S/i.test(line)) : undefined;
    const explicit = clarification && shown.format === 'markdown' ? explicitQuestions(content) : null;
    const whole = shown.format === 'markdown' ? <PassiveMarkdown content={excerpt} links={{}} onOpen={() => {}}/> : <pre>{excerpt}</pre>;
    return <div className="run-gate-summary" aria-label="Zusammenfassung des Entwurfs">
      {clarification ? <section aria-label="Klärungspunkte"><h3>Klärungspunkte</h3>{questions?.length === 1 || explicit
        ? <PassiveMarkdown content={questions?.length === 1 ? questions[0] : explicit!} links={{}} onOpen={() => {}}/>
        : <p>Konkrete Klärungspunkte sind in dieser Vorschau nicht verfügbar. Sieh dir die aktuelle Fassung an.</p>}</section>
        : short.length > 0 && <ul>{short.map((item, i) => <li key={`${item.label}:${i}`}><strong>{item.label}:</strong> <PassiveMarkdown content={item.text} links={{}} onOpen={() => {}}/></li>)}</ul>}
      <details><summary>{short.length || clarification ? 'Mehr anzeigen' : 'Zusammenfassung'}</summary>{whole}
        {!summary && content.length > excerpt.length && <p className="muted">Auszug · für den vollständigen Inhalt die Fassung öffnen.</p>}
      </details>
    </div>;
  }
  return <div className="source-preview"><h3>Aus der aktuellen Fassung</h3>
    {shown.format === 'markdown' ? <div className="source-preview-text"><PassiveMarkdown content={excerpt} links={{}} onOpen={() => {}}/></div> : <pre>{excerpt}</pre>}
    {!summary && content.length > excerpt.length && <p className="muted">Auszug · für den vollständigen Inhalt die Fassung öffnen.</p>}
  </div>;
}
