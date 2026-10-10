import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Overview } from '../src/Overview';
import { RunDetail } from '../src/RunDetail';
import { DocumentView } from '../src/DocumentView';
import { validateData } from '../src/api';
import type { Detail, Envelope, Inventory } from '../src/types';
const run={run_id:'machine-id',title:'Kunden schneller beraten',objective:'Unterlagen schneller zuordnen und vergleichen.',source_path:'run.md',valid:true,lifecycle:'active',revision_id:'revision',status:'open',current_gate:'TP',code:null,attention:{blocking_reason:'none',missing_approval:'Approval: TP',missing_evidence_count:2}};
import { backlog, pointer } from './scoped-fixtures';
const stored = {...pointer(run.run_id,run.title), stored_status:'Awaiting TP',stored_next_step:'Unterlagen zuordnen und vergleichen.'};
const inventory = backlog([stored]);
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('the list leads with the stored title and next step, labels pointer facts, and checks current control only on deliberate selection',()=>{
  const select=vi.fn();render(<Overview result={inventory} onSelect={select}/>);
  expect(screen.getByText('Gespeicherter Stand laut Backlog: Awaiting TP')).toBeTruthy();
  expect(screen.getByText('Nächster Schritt laut Backlog: Unterlagen zuordnen und vergleichen.')).toBeTruthy();
  expect(screen.queryByText('Freigabe ausstehend')).toBeNull();expect(screen.queryByText('2 offene Nachweise')).toBeNull();
  expect(screen.queryByRole('button',{name:run.run_id})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:run.title}));expect(select).toHaveBeenCalledWith(run.run_id);
  expect(screen.queryByRole('button',{name:'Aktuellen Stand prüfen'})).toBeNull();
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'machine-id'}});expect(screen.getByRole('button',{name:run.title})).toBeTruthy();
});
it('a malformed or duplicate stored pointer cannot claim a current assessment or be selected',()=>{
  render(<Overview result={{...inventory,state:'partial',code:'backlog_partial',data:{...inventory.data!,entries:[{...stored,selectable:false}],diagnostics:[{code:'duplicate_pointer'}]}}} onSelect={vi.fn()}/>);
  expect(screen.queryByText('Keine offenen Punkte ausgewiesen')).toBeNull();
  expect((screen.getByRole('button',{name:run.title}) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.queryByRole('button',{name:'Aktuellen Stand prüfen'})).toBeNull();
});
it('stored pointer fields are validated and the previous broad inventory DTO is rejected',()=>{
  expect(()=>validateData('/api/snapshot',inventory)).not.toThrow();
  for(const value of [undefined,12,null])expect(()=>validateData('/api/snapshot',{...inventory,data:{...inventory.data!,entries:[{...stored,stored_status:value}]}} as unknown as Envelope<unknown>)).toThrow('dto_invalid');
  expect(()=>validateData('/api/snapshot',{...inventory,data:{runs:[run],file_count:1,byte_count:1}} as unknown as Envelope<unknown>)).toThrow('dto_invalid');
});
it('SCN-016: read adapters reject contradictory section counts before presentation',()=>{
  for (const counts of [{ 'Active Backlog': 0 }, { 'Active Backlog': 2 }, {}, { 'Active Backlog': 1.5 }, { 'Active Backlog': 1, Unknown: 0 }]) {
    expect(()=>validateData('/api/snapshot',{...inventory,data:{...inventory.data!,counts}})).toThrow('dto_invalid');
    expect(()=>validateData('/api/backlog-titles?snapshot=previous&rows=row',{...inventory,data:{...inventory.data!,counts}})).toThrow('dto_invalid');
  }
  expect(()=>validateData('/api/snapshot',inventory)).not.toThrow();
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

it('three stored sections have independent counts and filtering, default to active, and never inspect a Run on switching',()=>{
  const planned={...pointer('later','Geplantes Vorhaben'),section:'Planned / Parking Lot'};
  const archived={...pointer('old','Abgeschlossenes Vorhaben'),section:'Completed / Superseded Pointers',stored_status:'Superseded',stored_next_step:'Durch ein neues Vorhaben abgelöst.'};
  const select=vi.fn();render(<Overview result={backlog([stored,planned,archived])} onSelect={select}/>);
  expect(screen.getByRole('button',{name:'Aktiv 1'}).getAttribute('aria-pressed')).toBe('true');
  expect(screen.queryByRole('button',{name:planned.title})).toBeNull();
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'kein Treffer'}});
  expect(screen.getByText('Keine gespeicherten Vorhaben für diese Suche.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Geplant 1'}));
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
  expect(screen.getByRole('button',{name:planned.title})).toBeTruthy();
  expect(screen.queryByRole('button',{name:stored.title})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Archiv 1'}));
  expect(screen.getByText('Ergebnis laut Backlog: Durch ein neues Vorhaben abgelöst.')).toBeTruthy();
  expect(select).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:archived.title}));expect(select).toHaveBeenCalledWith('old');
});
it('unreadable sections have unavailable counts; readable sections and bad rows remain explicitly distinct',()=>{
  const result=backlog([{...stored,selectable:false}]);
  result.state='partial';result.code='backlog_partial';
  result.data!.diagnostics=[{code:'backlog_row_malformed',section:'Active Backlog',key:stored.key},{code:'backlog_layout_missing',section:'Planned / Parking Lot'}];
  render(<Overview result={result} onSelect={vi.fn()}/>);
  expect(screen.getByRole('button',{name:'Aktiv 1 Eingeschränkt'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'Geplant Nicht verfügbar'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'Archiv 0'})).toBeTruthy();
  expect(screen.getByText('Teilweise verfügbar · Aktiv · 1 Lesehinweis')).toBeTruthy();
  expect(screen.getByText('Teilweise verfügbar · Aktiv · 1 Lesehinweis').closest('details')?.open).toBe(false);
  fireEvent.click(screen.getByRole('button',{name:'Geplant Nicht verfügbar'}));
  expect(screen.getByText(/Dieser Bereich ist nicht auswertbar/)).toBeTruthy();
  expect(screen.queryByText('In diesem Bereich sind keine Vorhaben gespeichert.')).toBeNull();
});
it('a source refresh updates counts without changing the chosen section or search, and originals start closed',()=>{
  const planned={...pointer('later','Geplantes Vorhaben'),section:'Planned / Parking Lot'};
  const {rerender}=render(<Overview result={backlog([stored,planned])} onSelect={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button',{name:'Geplant 1'}));
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'later'}});
  rerender(<Overview result={backlog([stored,planned,{...planned,key:'another',title:'Anderes Vorhaben'}])} onSelect={vi.fn()}/>);
  expect(screen.getByRole('button',{name:'Geplant 2'}).getAttribute('aria-pressed')).toBe('true');
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('later');
  expect(screen.getByText('Gespeicherte Angaben und Quellen').closest('details')?.open).toBe(false);
  expect(screen.queryByRole('button',{name:'Aktuellen Stand prüfen'})).toBeNull();
});
it('backlog diagnostics validate section and key before they reach the view',()=>{
  for(const diagnostic of [{code:'backlog_partial',section:{}},{code:'backlog_partial',key:7}])
    expect(()=>validateData('/api/snapshot',{...inventory,data:{...inventory.data!,diagnostics:[diagnostic]}} as unknown as Envelope<unknown>)).toThrow('dto_invalid');
  expect(()=>validateData('/api/snapshot',{...inventory,data:{...inventory.data!,diagnostics:[{code:'backlog_partial',section:'Active Backlog',key:null}]}})).not.toThrow();
});
it('known scope tags move behind disclosure while original titles and unknown bracketed titles are preserved',()=>{
  render(<Overview result={backlog([{...stored,title:'[framework-maintenance] Kunden schneller beraten'},pointer('other','[Budget] Prüfen')])} onSelect={vi.fn()}/>);
  expect(screen.getByRole('button',{name:'Kunden schneller beraten'})).toBeTruthy();
  expect(screen.getByText('[framework-maintenance] Kunden schneller beraten').closest('details')?.open).toBe(false);
  expect(screen.getByRole('button',{name:'[Budget] Prüfen'})).toBeTruthy();
});
