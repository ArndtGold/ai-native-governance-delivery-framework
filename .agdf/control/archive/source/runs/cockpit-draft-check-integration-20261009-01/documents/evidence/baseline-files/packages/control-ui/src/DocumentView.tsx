import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Envelope, DocumentData, Detail } from './types';
import { ReadState, label } from './feedback';
import { documentPurpose, phaseName, observedAssessment, sourceSummary } from './presentation';
export function PassiveMarkdown({ content, links, onOpen }: { content: string; links: Record<string, string>; onOpen: (id: string) => void }) {
  return <Markdown remarkPlugins={[remarkGfm]} skipHtml components={{
    a: ({ href, children }) => href && Object.hasOwn(links, href) ? <button className="text-link" onClick={() => onOpen(links[href])}>{children}</button> : <span>{children}{href ? <span className="muted"> ({href})</span> : null}</span>,
    img: ({ alt }) => <span className="muted">[Bild: {alt || 'ohne Beschreibung'}]</span>,
    input: ({ checked }) => <span>{checked ? '☑' : '☐'}</span>,
  }}>{content}</Markdown>;
}
export function DocumentView({ result, onOpen, runTitle, detail, current = true }: { result: Envelope<DocumentData>; onOpen: (id: string) => void; runTitle?: string; detail?: Envelope<Detail>; current?: boolean }) {
  const data = result.data;
  const bound = !!data && !!detail?.data && !!result.snapshot_id && result.snapshot_id === detail.snapshot_id
    && result.target.target_id === detail.target.target_id && data.resource.run_id === detail.data.run_id
    && data.resource.status === 'registered' && detail.data.resources.some(r => r.resource_id === data.resource.resource_id
      && r.run_id === data.resource.run_id && r.type === data.resource.type && r.registered_reference === data.resource.registered_reference && r.status === 'registered');
  const artefacts = Array.isArray(detail?.data?.persisted?.artefacts) ? detail.data.persisted.artefacts : [];
  const row = bound ? artefacts.find((v): v is { type: string; path: string; status: string } => {
    if (!v || typeof v !== 'object') return false;
    const r = v as Record<string, unknown>;
    return r.type === data?.resource.type && typeof r.path === 'string' && typeof r.status === 'string'
      && r.path.replace(/^`|`$/g, '').trim() === data?.resource.registered_reference;
  }) : undefined;
  const readable = result.state === 'available' && data?.content !== undefined;
  const confirmed = bound && current && readable && detail?.state === 'available';
  const assessment = bound && detail?.data ? observedAssessment(detail.data, !!confirmed) : 'unconfirmed';
  const assessmentName = assessment === 'open' ? 'Weiterarbeit offen' : assessment === 'blocked' ? 'Vor der Weiterarbeit klären'
    : assessment === 'completed' ? 'Vorhaben abgeschlossen' : 'Aktuelle Voraussetzungen nicht bestätigt';
  const summary = readable && data?.format === 'markdown' ? sourceSummary(data.content!) : null;
  return <>
    <section className="document-context" aria-label="Einordnung des Dokuments">
      {runTitle && <p>Zum Vorhaben <strong>{runTitle}</strong></p>}
      <h2>Worum es hier geht</h2>
      {summary ? <><div className="document-summary"><PassiveMarkdown content={summary} links={data?.links ?? {}} onOpen={onOpen}/></div><p className="muted document-summary-origin">Aus der deutschsprachigen Zusammenfassung dieser Quelle.</p></>
        : <><p>{documentPurpose(data?.resource.type)}</p><p className="muted">Eine deutschsprachige Kurzfassung ist in dieser Quelle nicht verfügbar.</p></>}
      <dl className="document-control">
        <div><dt>{confirmed ? 'Gespeicherter Dokumentstand' : 'Zuletzt gespeicherter Dokumentstand'}</dt><dd>{row ? label(row.status) : 'Nicht bestätigt'}</dd></div>
        <div><dt>Aktuelle Kontrollauswertung</dt><dd>{assessmentName}</dd></div>
        {confirmed && detail?.data?.evaluation && <div><dt>Aktueller Arbeitsschritt</dt><dd>{phaseName(detail.data.evaluation.current_gate)}</dd></div>}
      </dl>
      <p className="muted document-status-note">Statusangaben im Original werden unverändert gezeigt. Maßgeblich für den gespeicherten Stand ist der Run-Stand; für die Weiterarbeit die aktuelle Kontrollauswertung. Eine gespeicherte Freigabe ersetzt diese Prüfung nicht.</p>
    </section>
    <details className="document-provenance"><summary>Quellenangaben</summary><dl className="document-source-fields"><dt>Dokumenttyp</dt><dd>{data?.resource.type ?? 'Dokument'}</dd><dt>Registrierte Quelle</dt><dd><code>{data?.resource.registered_reference}</code></dd>{data?.content_digest && <><dt>Quellenfingerabdruck</dt><dd><code>{data.content_digest}</code></dd></>}</dl></details>
    {result.state !== 'available' ? <ReadState state={result.state} code={result.code}/> : data?.content !== undefined
      ? <details className="document-original"><summary>Originaldokument lesen</summary><article className="document agdf-surface">{data.format === 'markdown' ? <PassiveMarkdown content={data.content} links={data.links ?? {}} onOpen={onOpen}/> : <pre>{data.content}</pre>}</article></details>
      : <ReadState state="error" code="dto_invalid"/>}
  </>;
}
