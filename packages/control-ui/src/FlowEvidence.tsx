import registry from '../../../plugins/agdf/meta/agdf-interaction-locales.json';
import type { Detail, EvidenceAssociation, Resource } from './types';
import { documentName } from './presentation';
export function FlowEvidence({ data, onOpen, current = true }: { data: Detail; onOpen: (resource: Resource) => void; current?: boolean }) {
  const groups = data.evidence_applicability, e = data.evaluation;
  const language = document.documentElement.lang.toLowerCase().split('-')[0];
  const l = registry.locales[language === 'en' ? 'en' : 'de'].flowEvidence;
  if (!groups) return null;
  const entries = (rows: EvidenceAssociation[]) => <ul>{rows.map((row, i) => {
    const source = row.available === true ? data.resources.find(r => r.run_id === data.run_id && r.path === row.path && r.status === 'registered') : undefined;
    return <li key={`${row.path}:${i}`}><strong>{language === 'en' ? row.step ?? l.title : documentName(row.step ?? undefined)}</strong>
      <p><code>{row.path}</code></p><p className="muted"><code>{row.reason}</code></p>
      {source ? <button type="button" className="text-link" onClick={() => onOpen(source)}>{l.open}</button> : <p className="muted">{l.unavailable}</p>}
    </li>;
  })}</ul>;
  return <section className="panel agdf-surface flow-evidence" aria-label={l.title}>
    <h2>{l.title}</h2>
    {!current && <p role="status">{l.retainedDescription}</p>}
    {current && e?.completion?.fulfilled === true && <p>{l.completed}</p>}
    {current && e?.completion?.status === 'unconfirmed' && <p role="status">{l.unconfirmedDescription}</p>}
    {e?.next_operation && <p>{l.next}: {e.next_operation.actor === 'human' ? l.human : l.agent} · <code>{e.next_operation.operation_key}</code></p>}
    <h3>{l.current} · {groups.current.length}</h3><p>{l.currentDescription}</p>
    {groups.current.length ? entries(groups.current) : <p>{l.emptyDescription}</p>}
    {(['superseded', 'applicability_unknown'] as const).map(group => <details key={group}><summary>{l[group]} · {groups[group].length}</summary>
      <p>{group === 'superseded' ? l.historyDescription : l.unknownDescription}</p>{entries(groups[group])}</details>)}
  </section>;
}
