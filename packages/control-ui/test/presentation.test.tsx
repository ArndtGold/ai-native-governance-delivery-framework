import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Overview } from '../src/Overview';
import { RunDetail } from '../src/RunDetail';
import { DocumentView } from '../src/DocumentView';
import { validateData } from '../src/api';
import type { Detail, Envelope, Inventory } from '../src/types';
const run={run_id:'machine-id',title:'Kunden schneller beraten',objective:'Unterlagen schneller zuordnen und vergleichen.',source_path:'run.md',valid:true,lifecycle:'active',revision_id:'revision',status:'open',current_gate:'TP',code:null,attention:{blocking_reason:'none',missing_approval:'Approval: TP',missing_evidence_count:2}};
const inventory:Envelope<Inventory>={schema_version:'1',target:{target_id:'target',display_path:'/fixture'},snapshot_id:'snapshot',observed_as_of:'2026-10-06T10:00:00Z',source_digest:'digest',state:'available',code:null,retryable:false,data:{runs:[run],file_count:1,byte_count:1}};
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('the list leads with the source title and goal, reports Core attention, and selects by unchanged identity',()=>{
  const select=vi.fn();render(<Overview result={inventory} onSelect={select}/>);
  expect(screen.getByText(run.objective)).toBeTruthy();expect(screen.getByText('Umsetzung planen')).toBeTruthy();
  expect(screen.getByText('Freigabe ausstehend')).toBeTruthy();expect(screen.getByText('2 offene Nachweise')).toBeTruthy();
  expect(screen.queryByRole('button',{name:run.run_id})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:run.title}));expect(select).toHaveBeenCalledWith(run.run_id);
  fireEvent.click(screen.getByRole('button',{name:'Schritt und Nachweise ansehen'}));expect(select).toHaveBeenLastCalledWith(run.run_id);
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'vergleichen'}});expect(screen.getByRole('button',{name:run.title})).toBeTruthy();
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'machine-id'}});expect(screen.getByRole('button',{name:run.title})).toBeTruthy();
});
it('missing projection data is unknown and an invalid source never claims that no open points exist',()=>{
  const {unmount}=render(<Overview result={{...inventory,data:{...inventory.data!,runs:[{...run,attention:undefined}]}}} onSelect={vi.fn()}/>);
  expect(screen.getByText('Offene Punkte im Detail prüfen')).toBeTruthy();expect(screen.queryByText('Keine offenen Punkte ausgewiesen')).toBeNull();unmount();
  render(<Overview result={{...inventory,data:{...inventory.data!,runs:[{...run,valid:false,code:'invalid_run'}]}}} onSelect={vi.fn()}/>);
  expect(screen.getAllByText('Quelle prüfen')).toHaveLength(3);expect(screen.queryByText('2 offene Nachweise')).toBeNull();
});
it('optional attention fields are validated while old snapshots remain readable',()=>{
  expect(()=>validateData('/api/snapshot',inventory)).not.toThrow();
  for(const count of [-1,1.5,'2'])expect(()=>validateData('/api/snapshot',{...inventory,data:{...inventory.data!,runs:[{...run,attention:{...run.attention,missing_evidence_count:count}}]}} as unknown as Envelope<unknown>)).toThrow('dto_invalid');
  expect(()=>validateData('/api/snapshot',{...inventory,data:{...inventory.data!,runs:[{...run,attention:undefined}]}})).not.toThrow();
});
it('run detail makes evidence readable, preserves mismatch warnings and keeps original controls behind disclosure',()=>{
  const resource={resource_id:'source',run_id:run.run_id,type:'UR',path:'UR.md',registered_reference:'UR.md',status:'registered'};
  const data:Detail={...run,resources:[resource],persisted:{current_gate:'SD',next_allowed_action:'old source action',decision:'in_progress',artefacts:[]},evaluation:{status:'open',current_gate:'TP',blocking_reason:'none',missing_approval:'Approval: TP',next_allowed_action:'Plan the work',next_action_de:'Die Umsetzung planen.',doctor_status:'pass',quality_outlook:'',git_evidence:'unavailable',diagnostics:[],approvals:[],missing_evidence:[{missing_evidence:'Abstimmung der Unterlagen fehlt.'}]}};
  const open=vi.fn();render(<RunDetail result={{...inventory,data}} onOpen={open}/>);
  expect(screen.getByText('Aktuelle Voraussetzungen nicht bestätigt')).toBeTruthy();expect(screen.getByText('Abstimmung der Unterlagen fehlt.')).toBeTruthy();
  expect(screen.getByText(/Die gespeicherte Angabe weicht/).closest('details')).toBeNull();
  expect(screen.getByText('Kontrollstatus und Quellen').closest('details')?.hasAttribute('open')).toBe(false);
  fireEvent.click(screen.getByRole('button',{name:/Anforderungen/}));expect(open).toHaveBeenCalledWith(resource);
});
it('the document keeps exact source content and adds its undertaking and purpose',()=>{
  const resource={resource_id:'source',run_id:run.run_id,type:'UR',path:'UR.md',registered_reference:'UR.md',status:'registered'};
  render(<DocumentView result={{...inventory,data:{resource,format:'markdown',content:'# Original 日本語\n\nUnveränderter Inhalt.',links:{}}}} runTitle={run.title} onOpen={vi.fn()}/>);
  expect(screen.getByText(run.title)).toBeTruthy();expect(screen.getByText('Beschreibt das Ziel und den vereinbarten Umfang des Vorhabens.')).toBeTruthy();
  expect(screen.getByRole('heading',{name:'Original 日本語'}).closest('details')?.open).toBe(false);
  fireEvent.click(screen.getByText('Originaldokument lesen',{exact:true}));
  expect(screen.getByRole('heading',{name:'Original 日本語'})).toBeTruthy();expect(screen.getByText('Unveränderter Inhalt.')).toBeTruthy();
});
