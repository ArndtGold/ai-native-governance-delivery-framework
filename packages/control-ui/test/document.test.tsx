import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DocumentView } from '../src/DocumentView';
import { sourceSummary } from '../src/presentation';
import type { Envelope, Detail, DocumentData } from '../src/types';
const resource = { resource_id:'source', run_id:'run-a', type:'UR', path:'UR.md', registered_reference:'UR.md', status:'registered' };
const base = { schema_version:'1' as const, target:{target_id:'target',display_path:'/fixture'},snapshot_id:'snapshot',observed_as_of:'2026-10-07T10:00:00Z',source_digest:'digest',state:'available' as const,code:null,retryable:false };
const content = '# Requirements\n\nStatus: draft\nGate approval: open\n\n## Goal\nAn English source.\n\n## AGDF Approval Summary (de; source=en)\n\nKunden können ihre Unterlagen schneller zuordnen.\n\nQuellen und fehlende Angaben bleiben sichtbar.\n\nNicht Teil der Kurzfassung.\n';
const result:Envelope<DocumentData> = {...base,data:{resource,format:'markdown',content,links:{}}};
const detail:Envelope<Detail> = {...base,data:{run_id:'run-a',revision_id:'revision',lifecycle:'active',resources:[resource],persisted:{current_gate:'CD+Tests',next_allowed_action:'Implement',decision:'in_progress',artefacts:[{type:'UR',path:'UR.md',status:'approved'}]},evaluation:{status:'open',current_gate:'CD+Tests',next_allowed_action:'Implement',next_action_de:'Umsetzen.',blocking_reason:'none',missing_approval:'none',doctor_status:'warn',quality_outlook:'',git_evidence:'unavailable',diagnostics:[],approvals:[{gate:'UR',status:'approved',evidence:'Receipt'}],missing_evidence:[],control_assessment:{state:'open',authorizes:false}}}};
afterEach(cleanup);
it('puts authored German orientation and separate saved/Core facts before closed exact originals',()=>{
  render(<DocumentView result={result} detail={detail} onOpen={vi.fn()}/>);
  expect(within(screen.getByRole('region',{name:'Einordnung des Dokuments'})).getByText('Kunden können ihre Unterlagen schneller zuordnen.')).toBeTruthy();
  expect(screen.getByText('Als freigegeben gespeichert')).toBeTruthy(); expect(screen.getByText('Freigabe dieser Fassung nicht bestätigt')).toBeTruthy(); expect(screen.getByText('Weiterarbeit offen')).toBeTruthy();
  expect(screen.getByText('Umsetzung und Prüfung')).toBeTruthy();
  expect(screen.getByRole('heading',{name:'Requirements'}).closest('details')?.open).toBe(false);
  expect(screen.getByText('Quellenangaben').closest('details')?.open).toBe(false);
  fireEvent.click(screen.getByText('Originaldokument lesen',{exact:true}));
  expect(screen.getByRole('heading',{name:'Requirements'})).toBeTruthy();
  expect(screen.getByText(/Status: draft/).textContent).toContain('Gate approval: open');
  expect(screen.getAllByText('Kunden können ihre Unterlagen schneller zuordnen.')).toHaveLength(2);
});
it('stale and persisted mismatch retain a dated document fact and cannot confirm current work',()=>{
  const {unmount}=render(<DocumentView result={result} detail={detail} current={false} onOpen={vi.fn()}/>);
  expect(screen.getByText('Zuletzt gespeicherter Dokumentstand')).toBeTruthy();
  expect(screen.getByText('Aktuelle Voraussetzungen nicht bestätigt')).toBeTruthy();
  expect(screen.queryByText('Weiterarbeit offen')).toBeNull();unmount();
  render(<DocumentView result={result} detail={{...detail,data:{...detail.data!,persisted:{...detail.data!.persisted!,current_gate:'TP'}}}} onOpen={vi.fn()}/>);
  expect(screen.getByText('Aktuelle Voraussetzungen nicht bestätigt')).toBeTruthy();
});
it.each(['target','snapshot','run','resource','path','status'])('does not transfer facts from a foreign %s binding',kind=>{
  const other:Envelope<Detail>=structuredClone(detail);
  if(kind==='target')other.target.target_id='other';
  if(kind==='snapshot')other.snapshot_id='other';
  if(kind==='run')other.data!.run_id='other';
  if(kind==='resource')other.data!.resources[0].resource_id='other';
  if(kind==='path')other.data!.resources[0].registered_reference='other';
  if(kind==='status')other.data!.resources[0].status='blocked';
  render(<DocumentView result={result} detail={other} onOpen={vi.fn()}/>);
  expect(screen.getByText('Nicht bestätigt')).toBeTruthy();
  expect(screen.getByText('Aktuelle Voraussetzungen nicht bestätigt')).toBeTruthy();
  expect(screen.queryByText('Freigegeben')).toBeNull();expect(screen.queryByText('Weiterarbeit offen')).toBeNull();
});
it('does not infer an artefact status from a gate approval or from original text',()=>{
  render(<DocumentView result={result} detail={{...detail,data:{...detail.data!,persisted:{...detail.data!.persisted!,artefacts:[{type:'UR',path:'other.md',status:'approved'}]}}}} onOpen={vi.fn()}/>);
  expect(screen.getByText('Nicht bestätigt')).toBeTruthy();expect(screen.queryByText('Freigegeben')).toBeNull();
});
it('incomplete legacy artefact metadata leaves the document status unknown without breaking the reader',()=>{
  render(<DocumentView result={result} detail={{...detail,data:{...detail.data!,persisted:{...detail.data!.persisted!,artefacts:null as unknown as unknown[]}}}} onOpen={vi.fn()}/>);
  expect(screen.getByText('Nicht bestätigt')).toBeTruthy();expect(screen.getByText('Weiterarbeit offen')).toBeTruthy();
});
it('missing documents and absent summaries remain explicitly unavailable',()=>{
  const {unmount}=render(<DocumentView result={{...result,state:'missing',code:'document_missing',data:{resource}}} detail={detail} onOpen={vi.fn()}/>);
  expect(screen.getByText('Aktuelle Voraussetzungen nicht bestätigt')).toBeTruthy();
  expect(screen.queryByText('Originaldokument lesen',{exact:true})).toBeNull();unmount();
  render(<DocumentView result={{...result,data:{...result.data!,content:'# English only\n\nDo not invent a German summary.'}}} onOpen={vi.fn()}/>);
  expect(screen.getByText('Eine deutschsprachige Kurzfassung ist in dieser Quelle nicht verfügbar.')).toBeTruthy();
});
it('ignores fenced, ambiguous and oversized summary declarations',()=>{
  expect(sourceSummary('```md\n## AGDF Approval Summary (de; source=en)\n\nExample\n```')).toBeNull();
  expect(sourceSummary(content+'\n## AGDF Approval Summary (de; source=en)\n\nConflicting.')).toBeNull();
  expect(sourceSummary('## AGDF Approval Summary (de; source=en)\n\n'+'x'.repeat(1201))).toBeNull();
});
