import type { ReactNode } from 'react';
import type { Detail, Resource } from './types';
import { documentName } from './presentation';
import { documentPresentation, DocumentStateLabel } from './document-state';
const gates = new Set(['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT']);

export interface DraftRowStatus { resourceId: string; content: ReactNode }

export function draftCheckResource(data: Detail | null | undefined) {
  const source = data?.draft_check?.source;
  const evaluation = data?.evaluation;
  const persisted = data?.persisted;
  if (!data || !source?.available || !evaluation || evaluation.current_gate !== source.gate
    || persisted && (persisted.current_gate !== evaluation.current_gate || persisted.next_allowed_action !== evaluation.next_allowed_action)) return;
  return data.resources.find(resource => resource.run_id === source.run_id && resource.type === source.gate
    && resource.path === source.artifact_path && resource.status === 'registered'
    && data.document_states?.some(row => row.resource_id === resource.resource_id
      && row.version_kind === 'draft' && row.source_state === 'available'));
}

export function RunDocuments({ data, onOpen, sourceDisabled = false, current = true, draftStatus }: {
  data: Detail; onOpen?: (resource: Resource, origin?: string) => void; sourceDisabled?: boolean; current?: boolean; draftStatus?: DraftRowStatus;
}) {
  const seen = new Set<string>();
  const rows = data.resources.filter(r => {
    const key = `${r.type}:${r.registered_reference}`;
    if (r.run_id !== data.run_id || !gates.has(r.type) || seen.has(key)) return false;
    seen.add(key); return true;
  });
  return <section className="run-documents" aria-label="Dokumente">
    <h3>Dokumente · {rows.length}</h3>
    {rows.length === 0 ? <p className="muted">Keine Dokumente registriert.</p> : <>
      <div className="run-documents-columns" aria-hidden="true"><span>Dokument</span><span>Dokument ansehen</span></div>
      <ul className="run-documents-list">
        {rows.map(r => {
          const state = data.document_states?.find(s => s.resource_id === r.resource_id);
          const recordedApproval = data.evaluation?.approvals.some(a => a.gate === r.type && a.status === 'approved');
          const p = documentPresentation(state, r.type, current, recordedApproval);
          const readable = r.status === 'registered' && (!state || state.source_state === 'available');
          const status = draftStatus?.resourceId === r.resource_id ? draftStatus.content : null;
          const multiple = rows.filter(x => x.type === r.type).length > 1;
          return <li className="run-document-row" key={`${r.run_id}:${r.type}:${r.registered_reference}`}>
            <div className="run-document-name"><strong>{documentName(r.type)}</strong>
              {!status && <DocumentStateLabel state={state} type={r.type} current={current} recordedApproval={recordedApproval}/>}
              {multiple && <span className="run-document-reference">{r.registered_reference}</span>}
            </div>
            <div className="run-document-action">{status}{readable && onOpen
              ? <button className="text-link" data-focus-id={`document:${r.resource_id}`} disabled={sourceDisabled || !!status && !current}
                aria-label={`${p.action}: ${documentName(r.type)}${multiple ? ` · ${r.registered_reference}` : ''}`}
                onClick={() => onOpen(r, `document:${r.resource_id}`)}>{p.action}</button>
              : <span className="muted">Dokument nicht verfügbar.</span>}</div>
          </li>;
        })}
      </ul>
    </>}
  </section>;
}
