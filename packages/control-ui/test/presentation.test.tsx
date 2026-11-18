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
function chooseArea(name:string){fireEvent.click(screen.getByRole('combobox',{name:'Bestandsbereich'}));fireEvent.click(screen.getByRole('option',{name}));}
it('filters lifecycle and combines it with search without opening a Run',()=>{
  const select=vi.fn();const first={...pointer('run-a','Erstes Vorhaben'),lifecycle:'active' as const};
  const second={...pointer('run-b','Zweites Vorhaben'),section:'completed',lifecycle:'completed' as const};
  render(<Overview result={backlog([first,second])} onSelect={select}/>);
  fireEvent.click(screen.getByRole('combobox',{name:'Lifecycle'}));
  fireEvent.click(screen.getByRole('option',{name:'Abgeschlossen'}));
  expect(screen.getByRole('button',{name:'Zweites Vorhaben'})).toBeTruthy();
  expect(screen.queryByRole('button',{name:'Erstes Vorhaben'})).toBeNull();
  expect(document.querySelectorAll('.undertaking-list > li')).toHaveLength(1);
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'Erstes'}});
  expect(screen.getByText('Keine Runs für diesen Lifecycle und diese Suche.')).toBeTruthy();
  expect(select).not.toHaveBeenCalled();
});
it('offers every lifecycle, filters unknown explicitly, and hides lifecycle for other areas',()=>{
  const rows = [
    {...pointer('a','Aktives Werk'),lifecycle:'active' as const},
    {...pointer('b','Abgeschlossenes Werk'),section:'completed',lifecycle:'completed' as const},
    {...pointer('c','Abgelöstes Werk'),section:'completed',lifecycle:'superseded' as const},
    {...pointer('d','Abgebrochenes Werk'),section:'completed',lifecycle:'abandoned' as const},
    {...pointer('e','Unbekanntes Werk'),lifecycle:null},
    {...pointer('p','Plan'),section:'planned'}, {...pointer('z','Archiv'),section:'archive'},
  ];
  render(<Overview result={backlog(rows)} onSelect={vi.fn()}/>);
  for(const [label,title] of [['Aktiv','Aktives Werk'],['Abgeschlossen','Abgeschlossenes Werk'],['Abgelöst','Abgelöstes Werk'],['Abgebrochen','Abgebrochenes Werk'],['Unbekannt','Unbekanntes Werk']]) {
    fireEvent.click(screen.getByRole('combobox',{name:'Lifecycle'}));
    fireEvent.click(screen.getByRole('option',{name:label}));
    expect(document.querySelectorAll('.undertaking-list > li')).toHaveLength(1);
    expect(screen.getByRole('button',{name:title})).toBeTruthy();
  }
  chooseArea('Geplant 1 Vorhaben');expect(screen.queryByRole('combobox',{name:'Lifecycle'})).toBeNull();
  chooseArea('Archiv 1 Vorhaben');expect(screen.queryByRole('combobox',{name:'Lifecycle'})).toBeNull();
  chooseArea('Runs 5 Vorhaben');expect(screen.getByRole('combobox',{name:'Lifecycle'}).textContent).toContain('Alle');
});
it('the list leads with the stored title and next step, labels pointer facts, and checks current control only on deliberate selection',()=>{
  const select=vi.fn();render(<Overview result={inventory} onSelect={select}/>);
  expect(screen.getByText('Awaiting TP')).toBeTruthy();
  expect(screen.getByText('Zuletzt beobachteter Stand')).toBeTruthy();
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
  for (const counts of [{ 'active': 0 }, { 'active': 2 }, {}, { 'active': 1.5 }, { 'active': 1, Unknown: 0 }]) {
    expect(()=>validateData('/api/snapshot',{...inventory,data:{...inventory.data!,counts}})).toThrow('dto_invalid');
    expect(()=>validateData('/api/backlog-titles?snapshot=previous&rows=row',{...inventory,data:{...inventory.data!,counts}})).toThrow('dto_invalid');
  }
  expect(()=>validateData('/api/snapshot',inventory)).not.toThrow();
});
it('run detail makes evidence readable, preserves mismatch warnings and keeps original controls behind disclosure',()=>{
  const resource={resource_id:'source',run_id:run.run_id,type:'UR',path:'UR.md',registered_reference:'UR.md',status:'registered'};
  const data:Detail={...run,resources:[resource],persisted:{current_gate:'SD',next_allowed_action:'old source action',decision:'in_progress',artefacts:[]},evaluation:{status:'open',current_gate:'TP',blocking_reason:'none',missing_approval:'Approval: TP',next_allowed_action:'Plan the work',next_action_de:'Die Umsetzung planen.',doctor_status:'pass',quality_outlook:'',git_evidence:'unavailable',diagnostics:[],approvals:[],missing_evidence:[{missing_evidence:'Abstimmung der Unterlagen fehlt.'}]}};
  const open=vi.fn();const view=render(<RunDetail result={{...inventory,data}} onOpen={open}/>);
  expect(screen.getByText('Aktuelle Voraussetzungen nicht bestätigt')).toBeTruthy();
  expect(screen.getByText(/Die gespeicherte Angabe weicht/).closest('details')).toBeNull();
  view.rerender(<RunDetail result={{...inventory,data}} onOpen={open} technicalView/>);
  expect(screen.getByText('Abstimmung der Unterlagen fehlt.')).toBeTruthy();
  expect(screen.getByText('Kontrollstatus und Quellen').closest('details')?.hasAttribute('open')).toBe(false);
  expect((screen.getByRole('button',{name:'Aktuelle Fassung ansehen: Anforderungen'}) as HTMLButtonElement).disabled).toBe(true);
  const consistent={...data,persisted:{...data.persisted!,current_gate:'TP',next_allowed_action:'Plan the work'}};
  view.rerender(<RunDetail result={{...inventory,data:consistent}} onOpen={open} technicalView/>);
  fireEvent.click(screen.getByRole('button',{name:'Aktuelle Fassung ansehen: Anforderungen'}));expect(open).toHaveBeenCalledWith(resource,'document:source');
});
it('the document keeps exact source content and adds its undertaking and purpose',()=>{
  const resource={resource_id:'source',run_id:run.run_id,type:'UR',path:'UR.md',registered_reference:'UR.md',status:'registered'};
  render(<DocumentView result={{...inventory,data:{resource,format:'markdown',content:'# Original 日本語\n\nUnveränderter Inhalt.',links:{}}}} runTitle={run.title} onOpen={vi.fn()}/>);
  expect(screen.getByText(run.title)).toBeTruthy();expect(screen.getByText('Beschreibt das Ziel und den vereinbarten Umfang des Vorhabens.')).toBeTruthy();
  expect(screen.getByRole('heading',{name:'Original 日本語'}).closest('details')?.open).toBe(false);
  fireEvent.click(screen.getByText('Originaldokument lesen',{exact:true}));
  expect(screen.getByRole('heading',{name:'Original 日本語'})).toBeTruthy();expect(screen.getByText('Unveränderter Inhalt.')).toBeTruthy();
});

it('runs include active and ended work, while planned and archive remain separate',()=>{
  const planned={...pointer('later','Geplantes Vorhaben'),section:'planned'};
  const ended={...pointer('old','Abgeschlossenes Vorhaben'),section:'completed',stored_status:'Superseded',stored_next_step:'Durch ein neues Vorhaben abgelöst.'};
  const archive={...pointer('imported','Archivierter Altbestand'),kind:'archive' as const,identity:'archive/imported',section:'archive'};
  const select=vi.fn();render(<Overview result={backlog([stored,planned,ended,archive])} onSelect={select}/>);
  expect(screen.getByRole('combobox',{name:'Bestandsbereich'}).textContent).toBe('Runs⌄');
  expect(screen.queryByRole('button',{name:planned.title})).toBeNull();
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'kein Treffer'}});
  expect(screen.getByText('Keine Vorhaben für diese Suche.')).toBeTruthy();
  chooseArea('Geplant 1 Vorhaben');
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
  expect(screen.getByRole('button',{name:planned.title})).toBeTruthy();
  expect(screen.queryByRole('button',{name:stored.title})).toBeNull();
  chooseArea('Archiv 1 Vorhaben');
  expect(screen.getByRole('button',{name:archive.title})).toBeTruthy();
  expect(screen.queryByRole('button',{name:ended.title})).toBeNull();
  expect(select).not.toHaveBeenCalled();
  chooseArea('Runs 2 Vorhaben');
  expect(screen.queryByRole('button',{name:archive.title})).toBeNull();
  expect(screen.getByRole('button',{name:ended.title})).toBeTruthy();
  expect(select).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:ended.title}));expect(select).toHaveBeenCalledWith('old');
});
it('unreadable sections have unavailable counts; readable sections and bad rows remain explicitly distinct',()=>{
  const result=backlog([{...stored,selectable:false}]);
  result.state='partial';result.code='backlog_partial';
  result.data!.diagnostics=[{code:'work_entry_invalid',section:'active',key:stored.key},{code:'work_section_unavailable',section:'planned'}];
  render(<Overview result={result} onSelect={vi.fn()}/>);
  fireEvent.click(screen.getByRole('combobox',{name:'Bestandsbereich'}));
  expect(screen.getByRole('option',{name:'Runs Mindestens 0 Vorhaben'}).getAttribute('aria-selected')).toBe('true');
  expect(screen.getByRole('option',{name:'Geplant Anzahl nicht verfügbar'})).toBeTruthy();
  expect(screen.getByRole('option',{name:'Archiv Keine Vorhaben'})).toBeTruthy();
  fireEvent.keyDown(screen.getByRole('combobox',{name:'Bestandsbereich'}),{key:'Escape'});
  expect(screen.getByText('Teilweise verfügbar · Runs · 1 Lesehinweis')).toBeTruthy();
  expect(screen.getByText('Teilweise verfügbar · Runs · 1 Lesehinweis').closest('details')?.open).toBe(false);
  chooseArea('Geplant Anzahl nicht verfügbar');
  expect(screen.getByText(/Dieser Bereich ist nicht auswertbar/)).toBeTruthy();
  expect(screen.queryByText('In diesem Bereich sind keine Vorhaben gespeichert.')).toBeNull();
});
it('a source refresh updates counts without changing the chosen section or search, and originals start closed',()=>{
  const planned={...pointer('later','Geplantes Vorhaben'),section:'planned'};
  const {rerender}=render(<Overview result={backlog([stored,planned])} onSelect={vi.fn()}/>);
  chooseArea('Geplant 1 Vorhaben');
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'later'}});
  rerender(<Overview result={backlog([stored,planned,{...planned,key:'another',title:'Anderes Vorhaben'}])} onSelect={vi.fn()}/>);
  expect(screen.getByRole('combobox',{name:'Bestandsbereich'}).textContent).toBe('Geplant⌄');
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('later');
  expect(screen.queryByText('Quellenangaben')).toBeNull();
  expect(screen.queryByRole('button',{name:'Aktuellen Stand prüfen'})).toBeNull();
});
it('backlog diagnostics validate section and key before they reach the view',()=>{
  for(const diagnostic of [{code:'backlog_partial',section:{}},{code:'backlog_partial',key:7}])
    expect(()=>validateData('/api/snapshot',{...inventory,data:{...inventory.data!,diagnostics:[diagnostic]}} as unknown as Envelope<unknown>)).toThrow('dto_invalid');
  expect(()=>validateData('/api/snapshot',{...inventory,data:{...inventory.data!,diagnostics:[{code:'backlog_partial',section:'active',key:null}]}})).not.toThrow();
});
it('known scope tags move behind disclosure while original titles and unknown bracketed titles are preserved',()=>{
  render(<Overview result={backlog([{...stored,title:'[framework-maintenance] Kunden schneller beraten'},pointer('other','[Budget] Prüfen')])} onSelect={vi.fn()}/>);
  expect(screen.getByRole('button',{name:'Kunden schneller beraten'})).toBeTruthy();
  expect(screen.queryByText('[framework-maintenance] Kunden schneller beraten')).toBeNull();
  expect(screen.getByRole('button',{name:'[Budget] Prüfen'})).toBeTruthy();
});
