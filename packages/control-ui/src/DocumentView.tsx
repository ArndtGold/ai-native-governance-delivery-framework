import Markdown from 'react-markdown';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import remarkGfm from 'remark-gfm';
import type { Envelope, DocumentData, Detail } from './types';
import { ReadState, label } from './feedback';
import { documentPurpose, phaseName, observedAssessment, sourceSummary } from './presentation';
import { documentPresentation, DocumentStateLabel } from './document-state';
import { sameJson } from './api';
function ReaderTable({ children }: { children?: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const table = useRef<HTMLTableElement>(null);
  const [edge, setEdge] = useState<'fits' | 'more' | 'end'>('fits');
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element || !table.current) return;
    const measure = () => {
      const limit = element.scrollWidth - element.clientWidth;
      setEdge(limit <= 1 ? 'fits' : element.scrollLeft < limit - 1 ? 'more' : 'end');
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);
    observer?.observe(table.current);
    element.addEventListener('scroll', measure, { passive: true });
    return () => { observer?.disconnect(); element.removeEventListener('scroll', measure); };
  }, []);
  const scrollable = edge !== 'fits';
  return <div className="reader-table-frame" data-edge={edge}>
    <div className="table-scroll" ref={viewport} tabIndex={scrollable ? 0 : undefined}
      role={scrollable ? 'region' : undefined} aria-label={scrollable ? 'Horizontal scrollbare Tabelle' : undefined}>
      <table ref={table}>{children}</table>
    </div>
  </div>;
}

export function PassiveMarkdown({ content, links, onOpen, preserveHtmlText = false, readerTables = false }: { content: string; links: Record<string, string>; onOpen: (id: string) => void; preserveHtmlText?: boolean; readerTables?: boolean }) {
  return <Markdown remarkPlugins={[remarkGfm]} skipHtml={!preserveHtmlText} components={{
    table: readerTables ? ReaderTable : 'table',
    a: ({ href, children }) => href && Object.hasOwn(links, href) ? <button className="text-link" onClick={() => onOpen(links[href])}>{children}</button> : <span>{children}{href ? <span className="muted"> ({href})</span> : null}</span>,
    img: ({ alt }) => <span className="muted">[Bild: {alt || 'ohne Beschreibung'}]</span>,
    input: ({ checked }) => <span>{checked ? '☑' : '☐'}</span>,
  }}>{content}</Markdown>;
}
function hasRegisteredDocumentBinding(result: Envelope<DocumentData>, detail?: Envelope<Detail>) {
  const data = result.data;
  return !!data && !!detail?.data && !!result.snapshot_id && result.snapshot_id === detail.snapshot_id
    && result.target.target_id === detail.target.target_id && data.resource.run_id === detail.data.run_id
    && data.resource.status === 'registered' && detail.data.resources.some(r => r.resource_id === data.resource.resource_id
      && r.run_id === data.resource.run_id && r.type === data.resource.type && r.registered_reference === data.resource.registered_reference && r.status === 'registered');
}

const metadataLabels: Record<string, string> = {
  Status: 'Status', Gate: 'Gate', 'Gate approval': 'Gate-Freigabe', 'Based on': 'Grundlage',
  Date: 'Datum', Owner: 'Verantwortlich', 'Traceability contract': 'Nachverfolgbarkeit',
  'Requirements clarification': 'Anforderungsklärung', 'Preview requirement': 'Vorschauanforderung',
  'Design Decisions contract': 'Nachweis der Designentscheidungen',
  'Planning Decisions contract': 'Nachweis der Planungsentscheidungen',
  Type: 'Typ', 'Report mode': 'Berichtsmodus',
};

function splitArtifactMetadata(content: string, type: string) {
  // Only the complete template block immediately after the title belongs in the details.
  const heading = /^(?:\uFEFF)?(?:[ \t]*\r?\n)*# [^\r\n]+\r?\n[ \t]*\r?\n/u.exec(content);
  if (!heading) return;
  const rest = content.slice(heading[0].length);
  const separator = /\r?\n[ \t]*\r?\n/u.exec(rest);
  if (!separator) return;
  const fields = new Map<string, string>();
  for (const line of rest.slice(0, separator.index).split(/\r?\n/u)) {
    const field = /^([A-Za-z ]+):[ \t]*(.*)$/u.exec(line);
    if (!field || !Object.hasOwn(metadataLabels, field[1]) || fields.has(field[1])) return;
    fields.set(field[1], field[2].trim());
  }
  if (fields.get('Gate') !== type) return;
  return { content: heading[0] + rest.slice(separator.index + separator[0].length), fields };
}

export function OriginalDocumentDownload({ result, detail, current, className = 'document-download', children }: {
  result: Envelope<DocumentData>; detail?: Envelope<Detail>; current: boolean; className?: string; children?: ReactNode;
}) {
  const data = result.data;
  if (!current || result.state !== 'available' || data?.content === undefined || !hasRegisteredDocumentBinding(result, detail)) return null;
  const label = 'Originaldatei herunterladen';
  const filename = (data.resource.registered_reference.split('/').pop() || 'dokument.md').replace(/[^a-zA-Z0-9._-]/g, '_');
  return <a className={className} download={filename} href={`data:text/plain;charset=utf-8,${encodeURIComponent(data.content)}`}
    aria-label={label} title={children == null ? label : undefined}>{children ?? label}</a>;
}

export function DocumentView({ result, onOpen, runTitle, detail, current = true, simple = false, companion = false, navigationEnabled = true }: { result: Envelope<DocumentData>; onOpen: (id: string) => void; runTitle?: string; detail?: Envelope<Detail>; current?: boolean; simple?: boolean; companion?: boolean; navigationEnabled?: boolean }) {
  const data = result.data;
  const bound = hasRegisteredDocumentBinding(result, detail);
  const artefacts = Array.isArray(detail?.data?.persisted?.artefacts) ? detail.data.persisted.artefacts : [];
  const row = bound ? artefacts.find((v): v is { type: string; path: string; status: string } => {
    if (!v || typeof v !== 'object') return false;
    const r = v as Record<string, unknown>;
    return r.type === data?.resource.type && typeof r.path === 'string' && typeof r.status === 'string'
      && r.path.replace(/^`|`$/g, '').trim() === data?.resource.registered_reference;
  }) : undefined;
  const readable = result.state === 'available' && data?.content !== undefined;
  const confirmed = bound && current && readable && detail?.state === 'available';
  const state = bound && data?.document_state && data.content_digest === data.document_state.content_digest
    && sameJson(data.document_state, detail?.data?.document_states?.find(s => s.resource_id === data.resource.resource_id)) ? data.document_state : undefined;
  const approval = state?.recorded_approval ?? (bound ? detail?.data?.evaluation?.approvals.find(a => a.gate === data?.resource.type && a.status === 'approved') : undefined);
  const presentation = documentPresentation(state, data?.resource.type ?? '', !!confirmed, !!approval);
  const assessment = bound && detail?.data ? observedAssessment(detail.data, !!confirmed) : 'unconfirmed';
  const assessmentName = assessment === 'open' ? 'Weiterarbeit offen' : assessment === 'blocked' ? 'Vor der Weiterarbeit klären'
    : assessment === 'completed' ? 'Vorhaben abgeschlossen'
    : assessment === 'ended' && detail?.data?.closure ? `Vorhaben beendet · ${label(detail.data.closure.outcome)}` : 'Aktuelle Voraussetzungen nicht bestätigt';
  const summary = readable && data?.format === 'markdown' ? sourceSummary(data.content!) : null;
  const check = confirmed ? state?.check : undefined;
  const checkStatus = check?.display.state === 'passed' ? 'Formale Prüfung bestanden' : check?.display.state === 'corrections_required' ? 'Korrekturen erforderlich'
    : check?.display.state === 'unchecked' ? 'Noch nicht geprüft' : 'Prüfung nicht verfügbar';
  const checkResult = check?.result && <details><summary>Originalbefunde</summary><pre>{JSON.stringify(check.result, null, 2)}</pre></details>;
  const checkDetails = check && <details className="document-provenance" aria-label="Prüfdetails"><summary>Prüfdetails</summary>
      <p>Die formale Prüfung prüft die vorhandenen Autorenregeln. Sie ersetzt weder die inhaltliche Prüfung noch eine Freigabe.</p>
      <dl className="document-source-fields"><dt>Prüfstand</dt><dd>{checkStatus}</dd>
        <dt>Gate</dt><dd>{check.source.gate}</dd><dt>Revision</dt><dd><code>{check.source.revision_id}</code></dd>
        <dt>Quelle</dt><dd><code>{check.source.artifact_path ?? 'Nicht verfügbar'}</code></dd><dt>SHA-256</dt><dd><code>{check.source.artifact_digest ?? 'Nicht verfügbar'}</code></dd>
        <dt>Beobachtet</dt><dd>{result.observed_as_of ?? 'Nicht verfügbar'}</dd></dl>
      {check.source.reason && <p>Originalgrund: <code>{check.source.reason}</code></p>}
      {checkResult}
    </details>;
  const revision = detail?.data?.revision_id;
  const sourceFields = <>
    <dt>Beobachtete Run-Revision</dt><dd><code>{revision ?? 'Nicht verfügbar'}</code></dd>
    <dt>Beobachtet</dt><dd>{result.observed_as_of ?? 'Nicht verfügbar'}</dd>
    {!companion && <><dt>Dokumenttyp</dt><dd>{data?.resource.type ?? 'Dokument'}</dd></>}
    <dt>Registrierte Quelle</dt><dd><code>{data?.resource.registered_reference}</code></dd>
    {data?.content_digest && <><dt>Quellenfingerabdruck</dt><dd><code>{data.content_digest}</code></dd></>}
  </>;
  const sourceDetails = <details className="document-provenance"><summary>Quellenangaben</summary><dl className="document-source-fields">{sourceFields}</dl></details>;
  const findings = check?.display.findings;
  const showBadge = !companion && !(confirmed && state?.state === 'draft_checked');
  if (simple || companion) {
    const artifact = companion && bound && readable && data?.format === 'markdown' ? splitArtifactMetadata(data.content!, data.resource.type) : undefined;
    const links = navigationEnabled ? data?.links ?? {} : {};
    const checkSource = check?.source;
    const checkedDigest = checkSource?.artifact_digest;
    const checkFields = checkSource && Object.entries({
      'Geprüftes Gate': checkSource.gate !== data?.resource.type && checkSource.gate,
      'Geprüfte Run-Revision': checkSource.revision_id !== revision && checkSource.revision_id,
      'Geprüfte Quelle': checkSource.artifact_path !== data?.resource.path
        && checkSource.artifact_path !== data?.resource.registered_reference && checkSource.artifact_path,
      'SHA-256 der Prüfung': checkedDigest?.replace(/^sha256:/u, '') !== data?.content_digest?.replace(/^sha256:/u, '') && checkedDigest,
      Originalgrund: checkSource.reason,
    }).filter(([, value]) => value);
    return <>
      {(showBadge || !!findings?.length) && <div className="document-state-context">
        {showBadge && <DocumentStateLabel state={state} type={data?.resource.type ?? ''} current={!!confirmed} recordedApproval={!!approval}/>}
        {!!findings?.length && <ul aria-label="Aktuelle Korrekturen">{findings.map((finding, i) => <li key={`${finding.code}:${i}`}>{finding.message ?? finding.code}</li>)}</ul>}
      </div>}
      {result.state !== 'available' ? <ReadState state={result.state} code={result.code}/> : data?.content !== undefined
        ? <article className="document document-original-text" aria-label="Originaldokument">{data.format === 'markdown'
          ? <PassiveMarkdown content={artifact?.content ?? data.content} links={links} onOpen={onOpen} preserveHtmlText readerTables={companion}/>
          : <pre>{data.content}</pre>}</article>
        : <ReadState state="error" code="dto_invalid"/>}
      {companion ? <details className="document-provenance companion-document-details">
        <summary>Dokumentdetails</summary>
        <h3>Quelle</h3>
        <dl className="document-source-fields">{sourceFields}</dl>
        {artifact && <>
          <h3>Angaben im Dokument</h3>
          <dl className="document-source-fields">
            {[...artifact.fields].filter(([, value]) => value).map(([key, value]) =>
              <div key={key}><dt>{metadataLabels[key]}</dt><dd><PassiveMarkdown content={value} links={links} onOpen={onOpen} preserveHtmlText/></dd></div>)}
          </dl>
        </>}
        {checkSource && <>
          <h3>Prüfstand</h3>
          <p>{checkStatus}</p>
          {!!checkFields?.length && <dl className="document-source-fields">
            {checkFields.map(([key, value]) => <div key={key}><dt>{key}</dt><dd><code>{value}</code></dd></div>)}
          </dl>}
          {checkResult}
        </>}
      </details> : <>
        <OriginalDocumentDownload result={result} detail={detail} current={current}/>
        {checkDetails}
        {sourceDetails}
      </>}
    </>;
  }
  return <>
    <section className="document-context" aria-label="Einordnung des Dokuments">
      {runTitle && <p>Zum Vorhaben <strong>{runTitle}</strong></p>}
      <h2>Worum es hier geht</h2>
      <div className="document-state-context"><DocumentStateLabel state={state} type={data?.resource.type ?? ''} current={!!confirmed} recordedApproval={!!approval}/>
        <p>{presentation.explanation}</p>
        {confirmed && state?.check?.display.findings?.length ? <ul aria-label="Aktuelle Korrekturen">{state.check.display.findings.map((finding, i) => <li key={`${finding.code}:${i}`}>{finding.message ?? finding.code}</li>)}</ul> : null}
        {approval && <><h3>Dokumentierte Freigabe</h3><p className="source-text">{approval.evidence.trim() || 'Kein Originalnachweis verfügbar.'}</p></>}
        {approval && <p className="muted">Freigabezeitpunkt, freigebende Person und Grundlage sind nicht als bestätigte strukturierte Angaben verfügbar.{state?.state !== 'approved' && ' Die genaue freigegebene Fassung ist nicht bestätigt.'}</p>}
      </div>
      {summary ? <><div className="document-summary"><PassiveMarkdown content={summary} links={data?.links ?? {}} onOpen={onOpen}/></div><p className="muted document-summary-origin">Aus der deutschsprachigen Zusammenfassung dieser Quelle.</p></>
        : <><p>{documentPurpose(data?.resource.type)}</p><p className="muted">Eine deutschsprachige Kurzfassung ist in dieser Quelle nicht verfügbar.</p></>}
      <dl className="document-control">
        <div><dt>{confirmed ? 'Gespeicherter Dokumentstand' : 'Zuletzt gespeicherter Dokumentstand'}</dt><dd>{row ? row.status === 'approved' ? 'Als freigegeben gespeichert' : row.status === 'draft' ? 'Entwurf' : label(row.status) : 'Nicht bestätigt'}</dd></div>
        <div><dt>Aktuelle Kontrollauswertung</dt><dd>{assessmentName}</dd></div>
        {confirmed && detail?.data?.evaluation && <div><dt>Aktueller Arbeitsschritt</dt><dd>{phaseName(detail.data.evaluation.current_gate)}</dd></div>}
      </dl>
      <p className="muted document-status-note">Statusangaben im Original werden unverändert gezeigt. Maßgeblich für den gespeicherten Stand ist der Run-Stand; für die Weiterarbeit die aktuelle Kontrollauswertung. Eine gespeicherte Freigabe ersetzt diese Prüfung nicht.</p>
    </section>
    {checkDetails}
    {sourceDetails}
    {result.state !== 'available' ? <ReadState state={result.state} code={result.code}/> : data?.content !== undefined
      ? <details className="document-original"><summary>Originaldokument lesen</summary><article className="document agdf-surface">{data.format === 'markdown' ? <PassiveMarkdown content={data.content} links={data.links ?? {}} onOpen={onOpen}/> : <pre>{data.content}</pre>}</article></details>
      : <ReadState state="error" code="dto_invalid"/>}
  </>;
}
