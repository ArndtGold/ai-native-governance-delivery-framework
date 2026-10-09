import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import { BrowserEntry } from '../src/BrowserEntry';
import type { ReadTransport } from '../src/api';
import type { Detail, Envelope, ReadingScope } from '../src/types';
import { backlog, pointer, runData, fixtureMeta, runScope } from './scoped-fixtures';
const inventory = {...backlog([pointer('run-a','Deliver cockpit')]),state:'partial' as const,code:'backlog_partial',data:{...backlog([pointer('run-a','Deliver cockpit')]).data!,diagnostics:[{code:'malformed_pointer',message:'Stored pointer incomplete.'}]}};
const data:Detail={...runData('run-a','Deliver cockpit'),revision_id:'rev',evaluation:{...runData('run-a').evaluation!,approvals:[{gate:'TP',status:'approved',evidence:'exact approval'},{gate:'QA',status:'missing',evidence:''}],missing_evidence:[{missing_evidence:'Host context still unverified'}]}};
const detail=runScope(data);
const changed={...fixtureMeta,snapshot_id:'run-snapshot',state:'stale' as const,code:'source_changed',data:null};
const named=(path:string)=>path.startsWith('/api/runs/')||path.startsWith('/api/snapshot?run_id=');
function advanced(){return runScope({...data,revision_id:'rev-2',persisted:{...data.persisted!,current_gate:'QA',next_allowed_action:'Check quality'},evaluation:{...data.evaluation!,current_gate:'QA',next_allowed_action:'Check quality',next_action_de:'Qualität prüfen.'}},'run-snapshot-2');}
async function readySelection(key='run-a'){await screen.findByRole('searchbox');let button:HTMLButtonElement|null=null;await waitFor(()=>{button=document.querySelector<HTMLButtonElement>(`button[data-focus-id="${key}"]`);expect(button).toBeTruthy();expect(button!.disabled).toBe(false);});return button!;}
async function tick(){await act(async()=>{await vi.advanceTimersByTimeAsync(5000);});}
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();vi.unstubAllGlobals();});
describe('compact MCP entry using the shared scoped reading state',()=>{
 it('searches a large stored backlog without selecting a result; inspected Run replaces discovery controls',async()=>{
  const many=backlog([pointer('run-a','Deliver cockpit'),...Array.from({length:12},(_,i)=>pointer(`other-${i}`,`Other project ${i}`))]);
  const read=vi.fn(async(path:string)=>named(path)?detail:many) as unknown as ReadTransport;
  render(<App compact transport={read}/>);await screen.findByRole('searchbox');
  expect(screen.getByRole('heading',{name:'Aktive Vorhaben im Repository'})).toBeTruthy();
  expect(document.querySelector('.compact-controls > p')?.textContent).toBe('fixture');
  expect(screen.getByText('13 Einträge · 3 angezeigt')).toBeTruthy();
  expect(document.querySelectorAll('.undertaking-list > li')).toHaveLength(3);
  expect(document.querySelector('.undertaking-list .row-step')?.textContent).toContain('Stored next step');
  expect(document.querySelector('.row-source dd')?.closest('details')?.open).toBe(false);
  fireEvent.change(screen.getByRole('searchbox',{name:'Vorhaben suchen'}),{target:{value:'other-7'}});
  expect(document.querySelectorAll('.undertaking-list > li')).toHaveLength(1);expect(screen.getByText('13 Einträge · 1 Treffer · 1 angezeigt')).toBeTruthy();expect(read).toHaveBeenCalledTimes(1);
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'run-a'}});fireEvent.click(await readySelection());
  await screen.findByText('Freigegebenen Umfang umsetzen.');expect(screen.queryByRole('searchbox')).toBeNull();expect(screen.queryByRole('combobox')).toBeNull();
  expect(screen.getByRole('heading',{name:'Deliver cockpit'})).toBeTruthy();expect(read).toHaveBeenCalledTimes(2);
 });
 it('partial pointer diagnostics start closed and malformed stored rows cannot be opened',async()=>{
  const bad={...pointer('invalid-run','Broken pointer'),selectable:false};
  const partial={...inventory,data:{...inventory.data!,entries:[...inventory.data!.entries,bad],counts:{...inventory.data!.counts,'Active Backlog':2},diagnostics:[{code:'malformed_pointer',message:'Broken stored row.'}]}};
  const read=vi.fn(async()=>partial) as unknown as ReadTransport;render(<App compact transport={read}/>);await readySelection();
  expect(screen.getByText('Backlog-Hinweise · Aktiv · 1').closest('details')?.open).toBe(false);
  expect((screen.getByRole('button',{name:/Broken pointer/}) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByText('Broken stored row.')).toBeTruthy();expect(read).toHaveBeenCalledTimes(1);
 });
 it('does not warn about active coverage when only another backlog area is unreadable',async()=>{
  const source=backlog([pointer('run-a')]);
  source.state='partial';source.code='backlog_partial';
  source.data!.diagnostics=[{code:'backlog_layout_missing',section:'Planned / Parking Lot'}];
  render(<App compact transport={vi.fn(async()=>source) as unknown as ReadTransport} onExpand={vi.fn()}/>);
  await readySelection();
  expect(screen.queryByText(/Backlog-Hinweise/)).toBeNull();
  expect(screen.queryByText(/Einige gespeicherte Vorhaben oder Tabellen/)).toBeNull();
  expect(screen.getByText('1 Eintrag · 1 angezeigt')).toBeTruthy();
  expect((screen.getByRole('button',{name:'Alle Vorhaben öffnen'}) as HTMLButtonElement).disabled).toBe(false);
 });
 it('summary and details remain in the expanded reader without resetting or re-reading the Run',async()=>{
  const read=vi.fn(async(path:string)=>named(path)?detail:inventory) as unknown as ReadTransport;
  render(<BrowserEntry initialCompact transport={read}/>);fireEvent.click(await readySelection('run-a'));
  await screen.findByText('Freigegebenen Umfang umsetzen.');fireEvent.click(screen.getByRole('button',{name:'Run ansehen'}));
  const heading=await screen.findByRole('heading',{name:'Deliver cockpit',level:1});expect(document.activeElement).toBe(heading);
  const summary=screen.getByRole('button',{name:'Zusammenfassung'});expect(summary.getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByRole('button',{name:'Alle Vorhaben'}).closest('nav')?.getAttribute('aria-label')).toBe('Vorhaben-Pfad');
  expect(screen.getByRole('button',{name:'Neu laden'}).closest('.cockpit-brand-header')).toBeTruthy();
  fireEvent.click(summary);expect(screen.queryByRole('button',{name:'Run ansehen'})).toBeNull();expect(screen.queryByRole('heading',{name:'Dokumente'})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Details'}));expect(screen.getByRole('heading',{name:'Dokumente'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'Details'}).getAttribute('aria-pressed')).toBe('true');
  expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot','/api/runs/run-a?snapshot=snapshot']);
 });
 it('default browser retains the full reader without selecting a Run',async()=>{
  const read=vi.fn(async()=>inventory) as unknown as ReadTransport;render(<BrowserEntry transport={read}/>);
  await screen.findByRole('button',{name:'Deliver cockpit'});expect(screen.getByRole('heading',{name:'Gespeicherte Vorhaben',level:1})).toBeTruthy();
  expect(screen.queryByRole('group',{name:'Ansicht'})).toBeNull();expect(screen.queryByRole('button',{name:'Dokument schließen'})).toBeNull();expect(read).toHaveBeenCalledTimes(1);
 });
 it('documents have no Run content switch; breadcrumb and close restore details and matching source focus',async()=>{
  const resource={resource_id:'source-a',run_id:'run-a',type:'UR',path:'UR.md',registered_reference:'UR.md',status:'registered'};
  const parent={...data,resources:[resource]},newSource={...resource,resource_id:'document-source'};
  const doc:Envelope<ReadingScope>={...fixtureMeta,snapshot_id:'document-snapshot',data:{kind:'document',run:{...parent,resources:[newSource]},document:{resource:newSource,format:'markdown',content:'# Original document\nExact source content',content_digest:'source-digest',links:{}}}};
  const read=vi.fn(async(path:string)=>path.startsWith('/api/documents/')?doc:runScope(parent)) as unknown as ReadTransport;
  render(<App initialRunId="run-a" transport={read}/>);await screen.findByRole('heading',{name:'Deliver cockpit',level:1});
  fireEvent.click(screen.getByRole('button',{name:'Details'}));
  for(const back of ['Deliver cockpit','Dokument schließen']){
   fireEvent.click(screen.getByRole('button',{name:/^Anforderungen Beschreibt/}));await screen.findByText('Originaldokument lesen',{exact:true});
   fireEvent.click(screen.getByText('Originaldokument lesen',{exact:true}));await screen.findByRole('heading',{name:'Original document'});
   expect(screen.queryByRole('group',{name:'Ansicht'})).toBeNull();expect(screen.getByRole('heading',{name:'Anforderungen',level:1})).toBeTruthy();
   fireEvent.click(screen.getByRole('button',{name:back}));await screen.findByRole('heading',{name:'Deliver cockpit',level:1});
   expect(screen.getByRole('button',{name:'Details'}).getAttribute('aria-pressed')).toBe('true');
   expect(screen.getByRole('button',{name:/^Anforderungen Beschreibt/})).toBe(document.activeElement);
  }
  expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot?run_id=run-a','/api/documents/source-a?snapshot=run-snapshot','/api/runs/run-a?snapshot=document-snapshot','/api/documents/source-a?snapshot=run-snapshot','/api/runs/run-a?snapshot=document-snapshot']);
 });
 it('reads before expansion and preserves the deliberately inspected Run on host expansion',async()=>{
  const read=vi.fn(async(path:string)=>named(path)?detail:inventory) as unknown as ReadTransport,expand=vi.fn();
  const view=render(<App compact transport={read} onExpand={expand}/>);const select=await readySelection();
  expect(screen.queryByRole('combobox')).toBeNull();expect(read).toHaveBeenCalledTimes(1);expect(screen.queryByText('Freigegebenen Umfang umsetzen.')).toBeNull();
  fireEvent.click(select);await screen.findByText('Freigegebenen Umfang umsetzen.');
  expect(screen.getByText('Host context still unverified')).toBeTruthy();expect(screen.getByText('Zuletzt als „In Arbeit“ gespeichert.')).toBeTruthy();
  expect(screen.getByText('Umsetzungs- und Prüfplan · freigegeben',{exact:true})).toBeTruthy();expect(screen.queryByText('QA',{exact:true})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Run ansehen'}));expect(expand).toHaveBeenCalledTimes(1);
  view.rerender(<App transport={read} onExpand={expand}/>);expect(screen.getByRole('heading',{name:'Deliver cockpit'})).toBeTruthy();expect(read).toHaveBeenCalledTimes(2);
 });
 it('failed reload retains stale sources and prevents expansion as fresh',async()=>{
  let fail=false;const read=vi.fn(async(path:string)=>{if(fail)throw Error('read_failed');return named(path)?detail:inventory;}) as unknown as ReadTransport;
  render(<App compact transport={read} onExpand={vi.fn()}/>);fireEvent.click(await readySelection('run-a'));
  await screen.findByText('Freigegebenen Umfang umsetzen.');fail=true;fireEvent.click(screen.getByRole('button',{name:'Neu laden'}));
  await screen.findByText('Die Daten konnten nicht gelesen werden. Quelle oder lokalen Dienst prüfen und wiederholen.');
  expect((screen.getByRole('button',{name:'Run ansehen'}) as HTMLButtonElement).disabled).toBe(true);expect(screen.getByText('Host context still unverified')).toBeTruthy();expect(screen.queryByRole('button',{name:/Approval/})).toBeNull();
 });
 it('refreshes a changed gate coherently through one named capture and retains keyboard focus',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let updated=false;const next=advanced();
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?changed:named(path)?updated?next:detail:inventory) as unknown as ReadTransport;
  render(<App compact transport={read} onExpand={vi.fn()}/>);fireEvent.click(await readySelection('run-a'));
  await screen.findByText('Freigegebenen Umfang umsetzen.');const reload=screen.getByRole('button',{name:'Neu laden'});reload.focus();updated=true;
  await tick();await screen.findByText('Qualität prüfen.');expect(document.activeElement).toBe(reload);expect(screen.queryByRole('combobox')).toBeNull();
  expect(screen.getByRole('heading',{name:'Qualitätsprüfung'})).toBeTruthy();expect(screen.queryByText(/Kontrolldaten werden gelesen/)).toBeNull();
  expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot','/api/runs/run-a?snapshot=snapshot','/api/freshness?snapshot=run-snapshot','/api/snapshot?run_id=run-a']);
 });
 it('pauses outside viewport and while hidden, and checks upon return',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let visibility!:IntersectionObserverCallback;const disconnect=vi.fn();
  vi.stubGlobal('IntersectionObserver',class{constructor(callback:IntersectionObserverCallback){visibility=callback;}observe(){}disconnect=disconnect;});
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?{...fixtureMeta,data:{unchanged:true}}:inventory) as unknown as ReadTransport;
  render(<App compact transport={read}/>);await readySelection();await tick();expect(read).toHaveBeenCalledTimes(1);
  await act(async()=>visibility([{isIntersecting:true,intersectionRatio:1} as IntersectionObserverEntry],{} as IntersectionObserver));expect(read).toHaveBeenCalledTimes(2);
  await act(async()=>visibility([{isIntersecting:false,intersectionRatio:0} as IntersectionObserverEntry],{} as IntersectionObserver));await tick();expect(read).toHaveBeenCalledTimes(2);
  vi.spyOn(document,'hidden','get').mockReturnValue(true);await act(async()=>visibility([{isIntersecting:true,intersectionRatio:1} as IntersectionObserverEntry],{} as IntersectionObserver));await tick();expect(read).toHaveBeenCalledTimes(2);
  vi.spyOn(document,'hidden','get').mockReturnValue(false);await act(async()=>document.dispatchEvent(new Event('visibilitychange')));expect(read).toHaveBeenCalledTimes(3);cleanup();expect(disconnect).toHaveBeenCalledTimes(1);
 });
 it('automatic read failure retains stale evidence and recovers only on explicit retry',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let fail=false;
  const read=vi.fn(async(path:string)=>{if(path.startsWith('/api/freshness'))return changed;if(fail)throw Error('read_failed');return named(path)?detail:inventory;}) as unknown as ReadTransport;
  render(<App compact transport={read} onExpand={vi.fn()}/>);fireEvent.click(await readySelection('run-a'));await screen.findByText('Freigegebenen Umfang umsetzen.');fail=true;await tick();
  await screen.findByText('Die Daten konnten nicht gelesen werden. Quelle oder lokalen Dienst prüfen und wiederholen.');expect((screen.getByRole('button',{name:'Run ansehen'}) as HTMLButtonElement).disabled).toBe(true);
  const count=vi.mocked(read).mock.calls.length;await tick();expect(read).toHaveBeenCalledTimes(count);fail=false;fireEvent.click(screen.getByRole('button',{name:'Aktualisierung fehlgeschlagen · Wiederholen'}));await screen.findByText('Weiterarbeit offen');
 });
 it('discards obsolete freshness after deliberate navigation to another Run',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let finish!:(value:typeof changed)=>void;
  const two=backlog([pointer('run-a','Deliver cockpit'),pointer('run-b','Second run')]);
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?new Promise<typeof changed>(resolve=>{finish=resolve;}):path.startsWith('/api/runs/run-b')?runScope(runData('run-b','Second run'),'second-snapshot'):named(path)?detail:two) as unknown as ReadTransport;
  render(<App compact transport={read}/>);fireEvent.click(await readySelection('run-a'));await screen.findByText('Freigegebenen Umfang umsetzen.');await tick();
  fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));fireEvent.click(await readySelection('run-b'));await screen.findByRole('heading',{name:'Second run'});
  await act(async()=>finish(changed));expect(screen.queryByText(/Veraltet/)).toBeNull();expect(screen.getByRole('heading',{name:'Second run'})).toBeTruthy();
  expect(vi.mocked(read).mock.calls.filter(c=>c[0]==='/api/snapshot')).toHaveLength(2);
 });
 it('confirmed selected Run removal returns to stored backlog without selecting a replacement',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let removed=false;
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?changed:named(path)?removed?{...backlog([pointer('run-b')]),snapshot_id:'removed-snapshot',data:{...backlog([pointer('run-b')]).data!,removed_run_id:'run-a'}}:detail:inventory) as unknown as ReadTransport;
  render(<App compact transport={read}/>);fireEvent.click(await readySelection('run-a'));await screen.findByText('Freigegebenen Umfang umsetzen.');removed=true;await tick();
  await readySelection('run-b');expect(screen.queryByRole('combobox')).toBeNull();expect(screen.queryByText('Freigegebenen Umfang umsetzen.')).toBeNull();expect(vi.mocked(read).mock.calls.some(c=>c[0].startsWith('/api/runs/run-b'))).toBe(false);
 });
 it('explicit navigation supersedes a pending background capture without mixing source views',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let finish!:(value:typeof detail)=>void;
  const two=backlog([pointer('run-a'),pointer('run-b','Second run')]);
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?changed:path==='/api/snapshot?run_id=run-a'?new Promise<typeof detail>(resolve=>{finish=resolve;}):path.startsWith('/api/runs/run-b')?runScope(runData('run-b','Second run'),'second-snapshot'):named(path)?detail:two) as unknown as ReadTransport;
  render(<App compact transport={read}/>);fireEvent.click(await readySelection('run-a'));await screen.findByText('Freigegebenen Umfang umsetzen.');await tick();await screen.findByRole('button', {name:'Stand wird aktualisiert …'});
  fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));fireEvent.click(await readySelection('run-b'));await screen.findByRole('heading',{name:'Second run'});
  await act(async()=>finish(advanced()));expect(screen.getByRole('heading',{name:'Second run'})).toBeTruthy();expect(screen.queryByText('Qualität prüfen.')).toBeNull();expect(screen.queryByText(/Kontrolldaten werden gelesen/)).toBeNull();
 });
});
it('expanded Run refreshes quietly and retains open evidence and its exact selection',async()=>{
 const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?changed:detail) as unknown as ReadTransport;
 render(<App initialRunId="run-a" transport={read}/>);await screen.findByText('Weiterarbeit offen');
 const evidence=screen.getByText('Nachweislücken im Run-Dokument · 1').closest('details')!;
 evidence.open=true;
 await act(async()=>document.dispatchEvent(new Event('visibilitychange')));
 await waitFor(()=>expect(vi.mocked(read).mock.calls.filter(c=>c[0]==='/api/snapshot?run_id=run-a')).toHaveLength(2));
 expect(screen.getByText('Nachweislücken im Run-Dokument · 1').closest('details')?.open).toBe(true);
 expect(screen.getByText('Weiterarbeit offen')).toBeTruthy();expect(screen.queryByText(/Angefragter Run:/)).toBeNull();
 expect(document.querySelector('footer')?.textContent).toContain('Verfügbar');
});
it('inventory failure is visible directly without false empty counts or usable overview action',async()=>{
 const read=vi.fn(async()=>({...fixtureMeta,state:'error',code:'timeout',data:null,retryable:true})) as unknown as ReadTransport;
 render(<App compact transport={read} onExpand={vi.fn()}/>);await screen.findByText('Das Lesen hat das Zeitlimit erreicht. Quelle und Umfang prüfen, dann wiederholen.');
 expect(screen.queryByText(/Backlog-Hinweise/)).toBeNull();expect(screen.queryByText(/0 Backlog-Einträge/)).toBeNull();expect(screen.queryByRole('button',{name:'Alle Vorhaben öffnen'})).toBeNull();
});
it('opens the exact registered Run State from an unconfirmed inline card and returns using its new parent',async()=>{
 const source={resource_id:'opaque-state',run_id:'run-a',type:'Run State',path:null,registered_reference:'.agdf/control/runs/run-a/RUN_STATE.md',status:'registered'};
 const observed={...data,resources:[source],evaluation:{...data.evaluation!,control_assessment:undefined}},newSource={...source,resource_id:'document-state'};
 const doc:Envelope<ReadingScope>={...fixtureMeta,snapshot_id:'document-snapshot',data:{kind:'document',run:{...observed,resources:[newSource]},document:{resource:newSource,format:'markdown',content:'# Exact Run State\n\nSaved source content.',content_digest:'source-digest',links:{}}}};
 const read=vi.fn(async(path:string)=>path.startsWith('/api/documents/')?doc:runScope(observed)) as unknown as ReadTransport;
 const expand=vi.fn();render(<App compact initialRunId="run-a" transport={read} onExpand={expand}/>);await screen.findByText('Aktuelle Voraussetzungen nicht bestätigt');
 fireEvent.click(screen.getByRole('button',{name:'Stand des Vorhabens öffnen'}));await screen.findByText('Originaldokument lesen',{exact:true});fireEvent.click(screen.getByText('Originaldokument lesen',{exact:true}));await screen.findByRole('heading',{name:'Exact Run State'});
 expect(expand).toHaveBeenCalledTimes(1);expect(vi.mocked(read).mock.calls.at(-1)?.[0]).toBe('/api/documents/opaque-state?snapshot=run-snapshot');expect(vi.mocked(read).mock.calls.at(-1)?.[2]).toEqual({target:'target',snapshot:'run-snapshot',replacement:true});
 fireEvent.click(screen.getByRole('button',{name:'Zurück zum Arbeitsstand'}));await screen.findByText('Aktuelle Voraussetzungen nicht bestätigt');expect(screen.queryByRole('combobox')).toBeNull();expect(screen.getByRole('heading',{name:'Deliver cockpit'})).toBeTruthy();
});
it('SCN-003/008/009: compact active preview and expanded projection share query/order, while other areas reset on return',async()=>{
 const active=Array.from({length:8},(_,i)=>pointer('active-'+i,'Gemeinsames Vorhaben '+i));
 const rows=[...active,{...pointer('later','Planned only'),section:'Planned / Parking Lot'},{...pointer('done','Archive only'),section:'Completed / Superseded Pointers'}];
 const read=vi.fn(async()=>backlog(rows)) as unknown as ReadTransport;
 const view=render(<App compact transport={read} onExpand={vi.fn()}/>);await screen.findByRole('searchbox');
 expect([...document.querySelectorAll('.undertaking-list .run-link')].map(b=>b.textContent)).toEqual(active.slice(5).reverse().map(r=>r.title));
 expect(screen.queryByRole('button',{name:'Planned only'})).toBeNull();expect(screen.queryByRole('button',{name:'Archive only'})).toBeNull();
 fireEvent.change(screen.getByRole('searchbox'),{target:{value:' Gemeinsames '}});
 expect(screen.getByText('8 Einträge · 8 Treffer · 3 angezeigt')).toBeTruthy();
 view.rerender(<App transport={read}/>);
 expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe(' Gemeinsames ');
 expect([...document.querySelectorAll('.undertaking-list .run-link')].map(b=>b.textContent)).toEqual(active.slice().reverse().map(r=>r.title));
 fireEvent.click(screen.getByRole('button',{name:'Geplant 1'}));expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
 fireEvent.change(screen.getByRole('searchbox'),{target:{value:'Planned'}});
 view.rerender(<App compact transport={read}/>);
 expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');expect(document.activeElement).toBe(screen.getByRole('heading',{name:'AGDF Cockpit'}));
 expect(screen.queryByRole('button',{name:'Planned only'})).toBeNull();expect(read).toHaveBeenCalledTimes(1);
});
it('SCN-020: exact row return focus; source addition hiding it in compact preview is not reported as removal',async()=>{
 let rows=[pointer('run-a','Selected undertaking')];
 const read=vi.fn(async(path:string)=>named(path)?detail:backlog(rows)) as unknown as ReadTransport;
 render(<App compact transport={read}/>);fireEvent.click(await readySelection());await screen.findByText('Freigegebenen Umfang umsetzen.');
 fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));await readySelection();expect(document.activeElement).toBe(screen.getByRole('button',{name:'Selected undertaking'}));
 fireEvent.click(await readySelection());await screen.findByText('Freigegebenen Umfang umsetzen.');
 rows=[...rows,...Array.from({length:5},(_,i)=>pointer('new'+i,'New '+i))];
 fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));
 await screen.findByText(/außerhalb des aktuellen Ausschnitts/);expect(document.activeElement).toBe(screen.getByRole('heading',{name:'Aktive Vorhaben im Repository'}));
 expect(screen.queryByText(/nicht mehr im Backlog/)).toBeNull();
 fireEvent.change(screen.getByRole('searchbox'),{target:{value:'run-a'}});await readySelection();
 expect(vi.mocked(read).mock.calls.filter(c=>c[0].startsWith('/api/runs/')).map(c=>c[0])).toEqual(['/api/runs/run-a?snapshot=snapshot','/api/runs/run-a?snapshot=snapshot']);
});
it('SCN-020: removed originating row has explicit removal feedback without a substitute selection',async()=>{
 let removed=false;
 const read=vi.fn(async(path:string)=>named(path)?detail:backlog([pointer(removed?'run-b':'run-a')])) as unknown as ReadTransport;
 render(<App compact transport={read}/>);fireEvent.click(await readySelection());await screen.findByText('Freigegebenen Umfang umsetzen.');removed=true;
 fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));await screen.findByText('Das zuvor geöffnete Vorhaben ist nicht mehr im Backlog enthalten.');
 expect(document.activeElement).toBe(screen.getByRole('heading',{name:'Aktive Vorhaben im Repository'}));expect(vi.mocked(read).mock.calls.some(c=>c[0].startsWith('/api/runs/run-b'))).toBe(false);
});
it('SCN-020: a valid run key matching a view control still restores the exact row focus',async()=>{
 const key='backlog-search';
 const read=vi.fn(async(path:string)=>named(path)?runScope(runData(key,'Selected run')):backlog([pointer(key,'Stored selected run')])) as unknown as ReadTransport;
 render(<App compact transport={read}/>);fireEvent.click(await readySelection(key));await screen.findByRole('heading',{name:'Selected run'});
 fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));await readySelection(key);
 expect(document.activeElement).toBe(screen.getByRole('button',{name:'Stored selected run'}));
 expect(document.activeElement).not.toBe(screen.getByRole('searchbox'));
});
it('SCN-004/015/016: compact unavailable count and partial no-match never claim exhaustive zero',async()=>{
 const source=backlog([pointer('bad')]);source.data!.entries[0].selectable=false;
 const view=render(<App compact transport={vi.fn(async()=>source) as unknown as ReadTransport}/>);await screen.findByRole('searchbox');
 fireEvent.change(screen.getByRole('searchbox'),{target:{value:'absent'}});expect(screen.getByText(/weitere Vorhaben können fehlen/)).toBeTruthy();
 view.unmount();const missing=backlog([]);missing.data!.diagnostics=[{code:'backlog_layout_missing',section:'Active Backlog'}];
 render(<App compact transport={vi.fn(async()=>missing) as unknown as ReadTransport}/>);
 await screen.findByText('Bereich nicht verfügbar · Anzahl nicht bestimmbar');expect(screen.queryByText(/0 Einträge/)).toBeNull();
});
