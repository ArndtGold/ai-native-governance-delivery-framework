import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Envelope, DocumentData } from './types';
import { ReadState } from './feedback';
import { documentPurpose } from './presentation';
export function PassiveMarkdown({ content, links, onOpen }: { content: string; links: Record<string, string>; onOpen: (id: string) => void }) {
  return <Markdown remarkPlugins={[remarkGfm]} skipHtml components={{
    a: ({ href, children }) => href && Object.hasOwn(links, href) ? <button className="text-link" onClick={() => onOpen(links[href])}>{children}</button> : <span>{children}{href ? <span className="muted"> ({href})</span> : null}</span>,
    img: ({ alt }) => <span className="muted">[Bild: {alt || 'ohne Beschreibung'}]</span>,
    input: ({ checked }) => <span>{checked ? '☑' : '☐'}</span>,
  }}>{content}</Markdown>;
}
export function DocumentView({ result, onOpen, runTitle }: { result: Envelope<DocumentData>; onOpen: (id: string) => void; runTitle?: string }) {
  const data = result.data;
  return <>
    <div className="document-context">{runTitle && <p>Quelle zum Vorhaben <strong>{runTitle}</strong></p>}<p className="muted">{documentPurpose(data?.resource.type)}</p></div>
    <div className="document-meta"><span>{data?.resource.type ?? 'Dokument'}</span><code>{data?.resource.registered_reference}</code></div>
    {result.state !== 'available' ? <ReadState state={result.state} code={result.code}/> : data?.content !== undefined
      ? <article className="document agdf-surface">{data.format === 'markdown' ? <PassiveMarkdown content={data.content} links={data.links ?? {}} onOpen={onOpen}/> : <pre>{data.content}</pre>}</article>
      : <ReadState state="error" code="dto_invalid"/>}
  </>;
}
