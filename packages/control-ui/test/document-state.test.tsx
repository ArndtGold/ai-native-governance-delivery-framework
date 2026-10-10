import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { validateData, documentData } from '../src/api';
import { DocumentView } from '../src/DocumentView';
import { documentFixture, fixtureMeta } from './scoped-fixtures';
import type { DocumentState } from '../src/types';
afterEach(cleanup);
const scope = () => ({...fixtureMeta,data:{kind:'run',run:documentFixture()}});
it('SCN-010/011: accepts additive facts and old absence; rejects every foreign/malformed shape instead of old-server fallback', () => {
  const e=scope(); expect(()=>validateData('/api/runs/run-a',e)).not.toThrow();
  const old=structuredClone(e); delete old.data.run.document_states; expect(()=>validateData('/api/runs/run-a',old)).not.toThrow();
  for(const [key,value] of [['schema_version','2'],['authorizes',true],['resource_id','foreign'],['run_id','foreign'],['revision_id','00000000-0000-0000-0000-000000000002'],['type','QA'],['registered_reference','other.md'],['state','invented'],['version_kind','invented'],['source_state','invented'],['content_digest','partial'],['check',{}],['recorded_approval',{status:'approved',evidence:'foreign'}]] as const){
    const bad=structuredClone(e); Object.assign(bad.data.run.document_states![0],{[key]:value});
    expect(()=>validateData('/api/runs/run-a',bad),key).toThrow('dto_invalid');
  }
  for(const mutate of [(v:ReturnType<typeof scope>)=>v.data.run.document_states!.push(v.data.run.document_states![0]),
    (v:ReturnType<typeof scope>)=>v.data.run.document_states!.pop(),
    (v:ReturnType<typeof scope>)=>Object.assign(v.data.run.document_states![0],{state:'approved',version_kind:'draft'}),
    (v:ReturnType<typeof scope>)=>Object.assign(v.data.run.document_states![0],{source_state:'missing',state:'draft'})]){
    const bad=structuredClone(e);mutate(bad);expect(()=>validateData('/api/runs/run-a',bad)).toThrow('dto_invalid');
  }
});
it('SCN-011/016: document must carry the same description and raw digest; actual original approval stays passive and uncertain provenance explicit', () => {
  const run=documentFixture(), s=run.document_states![0]; s.state='approval_unconfirmed';s.version_kind='current';s.recorded_approval={status:'approved',evidence:'Original <script>bad()</script> sha256:partial'};
  run.evaluation!.approvals=[{gate:'UR',...s.recorded_approval}];
  const document={resource:run.resources[0],format:'markdown',content:'# Actual document\n',content_digest:s.content_digest!,links:{},document_state:s};
  const e={...fixtureMeta,data:{kind:'document',run,document}};
  expect(()=>validateData('/api/documents/UR',e)).not.toThrow();
  const omitted=structuredClone(e);Object.assign(omitted.data.run.document_states![0],{state:'draft',version_kind:'draft',recorded_approval:null});
  expect(()=>validateData('/api/runs/run-a',{...omitted,data:{kind:'run',run:omitted.data.run}})).toThrow('dto_invalid');
  expect(documentData(e.data.document)).toBe(true);
  const reordered=structuredClone(e);
  reordered.data.document.document_state=Object.fromEntries(Object.entries(reordered.data.document.document_state).reverse()) as DocumentState;
  expect(()=>validateData('/api/documents/UR',reordered)).not.toThrow();
  for(const mutate of [(v:typeof e)=>v.data.document.content_digest='b'.repeat(64),
    (v:typeof e)=>v.data.document.document_state.state='approved',
    (v:typeof e)=>v.data.document.document_state.resource_id='foreign']){
    const bad=structuredClone(e);mutate(bad);expect(()=>validateData('/api/documents/UR',bad)).toThrow('dto_invalid');
    expect(documentData(bad.data.document)).toBe(false);
  }
  render(<DocumentView result={{...fixtureMeta,data:document}} detail={{...fixtureMeta,data:run}} onOpen={vi.fn()}/>);
  expect(screen.getByText('Freigabe dieser Fassung nicht bestätigt')).toBeTruthy();
  expect(screen.getByText('Original <script>bad()</script> sha256:partial')).toBeTruthy();
  expect(globalThis.document.querySelector('script')).toBeNull();
  expect(screen.getByText(/Freigabezeitpunkt, freigebende Person und Grundlage/)).toBeTruthy();
});
it('SCN-009: serialized optional document descriptions accept the exact 256 KiB bound and reject one byte above', () => {
  const e=scope(),rows=e.data.run.document_states!,limit=256*1024;
  const size=()=>new TextEncoder().encode(JSON.stringify(rows)).length;
  rows[0].reason='';const spare=limit-size();rows[0].reason='x'.repeat(spare-1);
  expect(size()).toBe(limit-1);expect(()=>validateData('/api/runs/run-a',e)).not.toThrow();
  rows[0].reason+='x';expect(size()).toBe(limit);expect(()=>validateData('/api/runs/run-a',e)).not.toThrow();
  rows[0].reason+='x';expect(size()).toBe(limit+1);expect(()=>validateData('/api/runs/run-a',e)).toThrow('dto_invalid');
});
it('SCN-011/016: current check facts must agree across draft/row/reader and malformed handoff facts cannot pass the shared boundary', () => {
  const e=scope(),run=e.data.run,row=run.document_states![1];
  const source={run_id:run.run_id,gate:'PRD',revision_id:run.revision_id!,artifact_path:row.registered_reference,artifact_digest:'sha256:'+'a'.repeat(64),available:true,reason:null};
  const result={run_id:run.run_id,gate:'PRD',expected_revision_id:run.revision_id!,revision_id:run.revision_id!,artifact_path:row.registered_reference,artifact_digest:source.artifact_digest,
    ready:false,readiness_scope:'authoring_checks' as const,authorizes:false as const,semantic_review_required:true as const,registration_required:true as const,presentation_required:true as const,
    checks:[{name:'prd_readiness',ready:false}],diagnostics:[{code:'prd_readiness',message:'Actual owned decision'}],next_action:'Correct actual owned decision'};
  const display={state:'corrections_required' as const,reason:'prd_readiness',recovery:'authoring' as const,findings:result.diagnostics};
  run.draft_check={source,result,display};row.state='revision_required';row.check={source,result,display,content_digest:row.content_digest!};
  expect(()=>validateData('/api/runs/run-a',e)).not.toThrow();
  const document={resource:run.resources[1],format:'markdown',content:'# Current PRD\n',content_digest:row.content_digest!,links:{},document_state:row};
  expect(documentData(document)).toBe(true);
  render(<DocumentView result={{...fixtureMeta,data:document}} detail={{...fixtureMeta,data:run}} onOpen={vi.fn()}/>);
  expect(screen.getByRole('list',{name:'Aktuelle Korrekturen'}).textContent).toContain('Actual owned decision');
  for(const alter of [(v:typeof e)=>v.data.run.document_states![1].check!.content_digest='b'.repeat(64),
    (v:typeof e)=>v.data.run.document_states![1].check!.source.revision_id='00000000-0000-0000-0000-000000000002',
    (v:typeof e)=>{const checked=v.data.run.document_states![1].check!;v.data.run.document_states![1].check={...checked,display:{...checked.display,findings:[{code:'other',message:'Foreign finding'}]}};}]){
    const bad=structuredClone(e);alter(bad);expect(()=>validateData('/api/runs/run-a',bad)).toThrow('dto_invalid');
  }
  const invalid=structuredClone(document);invalid.document_state.check!.display.state='passed';
  expect(documentData(invalid)).toBe(false);
});
