import type { ReactNode } from 'react';
import type { Envelope, Detail, Resource, WorkEntry } from './types';
import { WorkStep } from './WorkStep';
import { RunDocuments } from './RunDocuments';
import { FlowEvidence } from './FlowEvidence';
import { SourcePreview } from './SourcePreview';
import { SourceInfo } from './SourceInfo';
import type { ReadTransport } from './api';
import { ReadState, label } from './feedback';
import { documentName, documentPurpose, observedAssessment, reportFindingsLabel } from './presentation';

const authoringGates = new Set(['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT']);
export function focusSituation(data: Detail, current: boolean) {
  const e = data.evaluation;
  const state = observedAssessment(data, current);
  if (!e || state === 'unconfirmed') return { kind: 'unconfirmed' as const, gate: null };
  if (state === 'ended') return { kind: 'ended' as const, gate: null };
  if (state === 'completed' && e.completion?.fulfilled === true) return { kind: 'completed' as const, gate: null };
  const gate = e.current_gate;
  const waiting = state === 'blocked' && e.blocking_reason === 'none' && e.missing_approval === `Approval: ${gate}`;
  const revision = state === 'blocked' && e.blocking_reason === 'presentation_version_decided';
  const clarify = gate === 'UR' && state === 'blocked' && e.blocking_reason === 'AGDF_UR_REQUIREMENTS_INCOMPLETE';
  if (authoringGates.has(gate) && (state === 'open' || waiting || revision || clarify))
    return { kind: waiting ? 'approval' as const : revision ? 'revision' as const : clarify ? 'clarification' as const : 'authoring' as const, gate };
  if (state === 'blocked') return { kind: 'blocked' as const, gate: null };
  if (state === 'open' && gate === 'CD+Tests') return { kind: 'building' as const, gate: null };
  return { kind: 'other' as const, gate: null };
}
export function detailHasMismatch(data: Detail | null | undefined) {
  const e = data?.evaluation, p = data?.persisted;
  // An ended Run stores "none, run ended" while Core names its outcome; that is no mismatch.
  const ended = e?.control_assessment?.state === 'ended' && !!data?.closure;
  return !!(e && p && (p.current_gate !== e.current_gate || !ended && p.next_allowed_action !== e.next_allowed_action));
}
export function RunDetail({ result, onOpen, summaryOnly = false, current = true, draftCheck, read, technicalContext, technicalView = false, onBackFromTechnical, sourceEntry }: { result: Envelope<Detail>; onOpen: (resource: Resource, origin?: string) => void; summaryOnly?: boolean; current?: boolean; draftCheck?: ReactNode; read?: ReadTransport; technicalContext?: ReactNode; technicalView?: boolean; onBackFromTechnical?: () => void; sourceEntry?: WorkEntry }) {
  const data = result.data, e = data?.evaluation, p = data?.persisted;
  const ended = e?.control_assessment?.state === 'ended' && !!data?.closure;
  const mismatch = detailHasMismatch(data);
  // Retain the document row during refresh while its source controls are disabled.
  const situation = data ? focusSituation(data, result.state === 'available' && !mismatch) : null;
  const completionUnconfirmed = e?.control_assessment?.state === 'completed' && e.completion?.fulfilled !== true;
  const detailCurrent = current && result.state === 'available' && !mismatch && !completionUnconfirmed;
  const observedGate = situation?.gate ?? null;
  const draftSource = data?.draft_check?.source;
  const focusGate = current || draftSource?.available && draftSource.gate === observedGate ? observedGate : null;
  const otherDocuments = data?.resources.some(r => r.run_id === data.run_id && ['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'].includes(r.type) && r.type !== focusGate);
  const draftInFocus = !!focusGate && draftSource?.gate === focusGate;
  const checkedResource = draftInFocus && data?.resources.find(r => r.run_id === data.run_id && r.type === focusGate
    && r.path === draftSource.artifact_path && r.status === 'registered');
  const completionSources = data?.resources.filter(r => r.run_id === data.run_id && ['OR', 'QA', 'UAT'].includes(r.type)) ?? [];
  const readableCompletionSources = completionSources.filter(r => {
    const state = data?.document_states?.find(item => item.resource_id === r.resource_id);
    return r.status === 'registered' && (!state || state.source_state === 'available');
  });
  const workSummary = data?.work_summary && !ended && (data.work_summary.display_action !== e?.next_allowed_action || data.work_summary.open_obligation_count > 0 || data.work_summary.limitations.length > 0)
    ? <section className="work-summary panel agdf-surface" aria-label="Offene Aufgabe"><h2>{data.work_summary.phase} · Offene Aufgabe und nächster Schritt</h2>
      <p>{data.work_summary.display_action}</p>{data.work_summary.open_obligation_count > 0 && <p>{reportFindingsLabel(data.work_summary.open_obligation_count)} in den registrierten Berichten.</p>}
      {!!data.work_summary.limitations.length && <p className="muted">Quellenbezug eingeschränkt: {data.work_summary.limitations.join(' · ')}</p>}
    </section> : null;
  const evidence = data?.evaluation && <section className="panel agdf-surface run-detail-evidence" aria-label="Nachweise"><h2>Nachweise</h2>
    <WorkStep data={data} onOpen={onOpen} evidenceOnly current={current && result.state === 'available' && !mismatch}/>
    {data.evidence_applicability && <details><summary>Zuordnung der Nachweise</summary><FlowEvidence data={data} onOpen={onOpen} current={current && result.state === 'available'}/></details>}
  </section>;
  const technical = <section className="run-technical-view" aria-label="Technische Details"><button type="button" className="text-link" onClick={onBackFromTechnical}>Zurück zum Vorhaben</button><h2>Technische Details</h2>
    <div className="context-line"><code>{data?.run_id}</code></div>{data?.objective && <p className="objective">{data.objective}</p>}
    {evidence}
    {data && (!focusGate || otherDocuments) && <section className="panel agdf-surface run-detail-documents" aria-label="Dokumente"><h2>{focusGate ? 'Weitere Dokumente' : 'Dokumente'}</h2>
      <RunDocuments data={data} onOpen={onOpen} current={current && result.state === 'available' && !mismatch} sourceDisabled={!current || result.state !== 'available' || mismatch} heading={false} excludeType={focusGate ?? undefined}/>
    </section>}
    {!draftInFocus && draftCheck}
    {e && <details className="control-details"><summary>Kontrollstatus und Quellen</summary><div className="detail-columns"><section className="panel agdf-surface"><div className="eyebrow">Bestehende Core-Auswertung</div><h2>{current ? 'Aktueller Kontrollstatus' : 'Zuletzt beobachteter Kontrollstatus'}</h2><dl className="status-fields">
      <dt>Gate</dt><dd>{e.current_gate}</dd><dt>Auswertung</dt><dd>{label(e.status)}</dd><dt>Blocker</dt><dd>{label(e.blocking_reason)}</dd><dt>Fehlende Freigabe</dt><dd>{label(e.missing_approval)}</dd><dt>Kontrollprüfung</dt><dd>{label(e.doctor_status)}</dd></dl>
      <h3>Nächste erlaubte Aktion · Information</h3>{e.status === 'not_evaluated'
        ? <p>Im Cockpit nicht ausgewertet: Die Kontrollauswertung braucht registrierte Quellen außerhalb von <code>.agdf/control</code>. Den aktuellen Stand im bestehenden AGDF-Ablauf prüfen.</p>
        : <><p>{e.next_action_de ?? 'Keine deutsche Zuordnung verfügbar. Originalangabe der Core-Auswertung:'}</p>{!e.next_action_de && <p className="source-text">{e.next_allowed_action}</p>}</>}
      <p className="muted">Git-basierte Nachweise sind in dieser Leseschnittstelle nicht verfügbar. Entscheidungen erfolgen im bestehenden AGDF-Ablauf.</p>
    </section><section className="panel agdf-surface"><div className="eyebrow">Gespeicherte Angaben · Quelle</div><h2>Run-Dokument</h2><dl className="status-fields"><dt>Gate-Angabe</dt><dd>{p?.current_gate || 'Nicht verfügbar'}</dd><dt>Entscheidungsangabe</dt><dd>{label(p?.decision)}</dd><dt>Run-Revision</dt><dd><code>{data?.revision_id}</code></dd></dl>
      <p className="source-text">{p?.next_allowed_action}</p>
      <h3>Gespeicherte Freigaben</h3><ul className="approval-list">{e.approvals.map(row => <li key={row.gate}><strong>{row.gate}</strong><span>{label(row.status)}</span><small>{row.evidence}</small></li>)}</ul>
    </section></div>{!!e.missing_evidence.length && <section className="panel agdf-surface"><h2>Fehlende Nachweise · Originalangaben</h2><pre>{JSON.stringify(e.missing_evidence, null, 2)}</pre></section>}</details>}
    <details className="control-details"><summary>Weitere registrierte Quellen</summary><div className="resources">{data?.resources.map(r => <button key={r.resource_id} data-focus-id={r.resource_id} onClick={() => onOpen(r)}><strong>{documentName(r.type)}</strong><span>{documentPurpose(r.type)}</span><small>{r.type} · {r.registered_reference}</small><span aria-hidden="true">↗</span></button>)}</div>{!data?.resources.length && <p>Keine registrierten Ressourcen verfügbar.</p>}</details>
    {!!(e?.diagnostics.length || data?.diagnostics?.length) && <section className="panel agdf-surface"><h2>Diagnosen · Originalangaben</h2>{(e?.diagnostics ?? data?.diagnostics ?? []).map((d, i) => <details key={i}><summary>{d.code}</summary><p>{d.message}</p><code>{d.path}</code><p>{d.next_step}</p></details>)}</section>}
    {technicalContext}
    </section>;
  if (technicalView && !summaryOnly) return technical;
  return <>
    {result.code && <ReadState code={result.code} state={result.state}/>}
    {mismatch && <ReadState state="partial" code="persisted_mismatch"/>}
    {data && <WorkStep data={data} onOpen={onOpen} condensed showGate={!summaryOnly} gateContent={!summaryOnly && focusGate && <SourcePreview compactSummary clarification={situation?.kind === 'clarification'} result={result} gate={focusGate} read={read} current={detailCurrent}/>} current={detailCurrent}>
      {!summaryOnly && focusGate && <div className="run-primary-action">
        <RunDocuments data={data} onOpen={onOpen} current={current && result.state === 'available' && !mismatch} sourceDisabled={!current || result.state !== 'available' || mismatch} heading={false} onlyType={focusGate} featured draftStatus={checkedResource ? { resourceId: checkedResource.resource_id, content: draftCheck } : undefined}/>
        {draftInFocus && !checkedResource && draftCheck}
      </div>}
    </WorkStep>}
    {!summaryOnly && workSummary}
    {!summaryOnly && focusGate && !!e?.missing_evidence.length && <section className="run-open-findings" aria-label="Offene Nachweise"><h2>Offene Nachweise</h2><ul>{e.missing_evidence.map((item, i) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      const description = typeof row.missing_evidence === 'string' ? row.missing_evidence : typeof item === 'string' ? item : 'Nachweis ohne lesbare Kurzbeschreibung';
      return <li key={i}>{description}{typeof row.required_next_step === 'string' && <p>{row.required_next_step}</p>}</li>;
    })}</ul></section>}
    {!summaryOnly && situation?.kind === 'completed' && detailCurrent && data && <section className="completion-sources" aria-label="Abschlussquellen"><h2>Abschlussquellen</h2>
      {readableCompletionSources.length
        ? <ul>{readableCompletionSources.map(r => <li key={r.resource_id}><button className="text-link" onClick={() => onOpen(r)}>{documentName(r.type)} öffnen</button></li>)}</ul>
        : <p>{completionSources.length ? 'Registrierte Abschlussquellen sind nicht verfügbar.' : 'Keine Abschlussquellen registriert.'}</p>}
      {readableCompletionSources.length > 0 && readableCompletionSources.length < completionSources.length && <p>Weitere registrierte Abschlussquellen sind nicht verfügbar.</p>}
    </section>}
    {data && <SourceInfo result={result} entry={sourceEntry} current={detailCurrent}/>}

  </>;
}
