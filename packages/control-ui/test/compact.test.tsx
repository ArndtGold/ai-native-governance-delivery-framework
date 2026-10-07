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
async function readySelection(){const select=await screen.findByRole('combobox',{name:'Vorhaben auswählen'});await waitFor(()=>expect((select as HTMLSelectElement).disabled).toBe(false));return select;}
async function tick(){await act(async()=>{await vi.advanceTimersByTimeAsync(5000);});}
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();vi.unstubAllGlobals();});
describe('compact MCP entry using the shared scoped reading state',()=>{
 it('searches a large stored backlog without selecting a result; inspected Run replaces discovery controls',async()=>{
  const many=backlog([pointer('run-a','Deliver cockpit'),...Array.from({length:12},(_,i)=>pointer(`other-${i}`,`Other project ${i}`))]);
  const read=vi.fn(async(path:string)=>named(path)?detail:many) as unknown as ReadTransport;
  render(<App compact transport={read}/>);const select=await readySelection();
  fireEvent.change(screen.getByRole('searchbox',{name:'Vorhaben suchen'}),{target:{value:'other-7'}});
  expect(screen.getAllByRole('option')).toHaveLength(2);expect((select as HTMLSelectElement).value).toBe('');expect(read).toHaveBeenCalledTimes(1);
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:''}});fireEvent.change(select,{target:{value:'run-a'}});
  await screen.findByText('Freigegebenen Umfang umsetzen.');expect(screen.queryByRole('searchbox')).toBeNull();expect(screen.queryByRole('combobox')).toBeNull();
  expect(screen.getByRole('heading',{name:'Deliver cockpit'})).toBeTruthy();expect(read).toHaveBeenCalledTimes(2);
 });
 it('partial pointer diagnostics start closed and malformed stored rows cannot be opened',async()=>{
  const bad={...pointer('invalid-run','Broken pointer'),selectable:false};
  const partial={...inventory,data:{...inventory.data!,entries:[...inventory.data!.entries,bad],diagnostics:[{code:'malformed_pointer',message:'Broken stored row.'}]}};
  const read=vi.fn(async()=>partial) as unknown as ReadTransport;render(<App compact transport={read}/>);await readySelection();
  expect(screen.getByText('Backlog-Hinweise · 1').closest('details')?.open).toBe(false);
  expect((screen.getByRole('option',{name:/Broken pointer/}) as HTMLOptionElement).disabled).toBe(true);
  expect(screen.getByText('Broken stored row.')).toBeTruthy();expect(read).toHaveBeenCalledTimes(1);
 });
 it('summary and details remain in the expanded reader without resetting or re-reading the Run',async()=>{
  const read=vi.fn(async(path:string)=>named(path)?detail:inventory) as unknown as ReadTransport;
  render(<BrowserEntry initialCompact transport={read}/>);fireEvent.change(await readySelection(),{target:{value:'run-a'}});
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
  expect((select as HTMLSelectElement).value).toBe('');expect(read).toHaveBeenCalledTimes(1);expect(screen.queryByText('Freigegebenen Umfang umsetzen.')).toBeNull();
  fireEvent.change(select,{target:{value:'run-a'}});await screen.findByText('Freigegebenen Umfang umsetzen.');
  expect(screen.getByText('Host context still unverified')).toBeTruthy();expect(screen.getByText('Zuletzt als „In Arbeit“ gespeichert.')).toBeTruthy();
  expect(screen.getByText('Umsetzungs- und Prüfplan · freigegeben',{exact:true})).toBeTruthy();expect(screen.queryByText('QA',{exact:true})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Run ansehen'}));expect(expand).toHaveBeenCalledTimes(1);
  view.rerender(<App transport={read} onExpand={expand}/>);expect(screen.getByRole('heading',{name:'Deliver cockpit'})).toBeTruthy();expect(read).toHaveBeenCalledTimes(2);
 });
 it('failed reload retains stale sources and prevents expansion as fresh',async()=>{
  let fail=false;const read=vi.fn(async(path:string)=>{if(fail)throw Error('read_failed');return named(path)?detail:inventory;}) as unknown as ReadTransport;
  render(<App compact transport={read} onExpand={vi.fn()}/>);fireEvent.change(await readySelection(),{target:{value:'run-a'}});
  await screen.findByText('Freigegebenen Umfang umsetzen.');fail=true;fireEvent.click(screen.getByRole('button',{name:'Neu laden'}));
  await screen.findByText('Die Daten konnten nicht gelesen werden. Quelle oder lokalen Dienst prüfen und wiederholen.');
  expect((screen.getByRole('button',{name:'Run ansehen'}) as HTMLButtonElement).disabled).toBe(true);expect(screen.getByText('Host context still unverified')).toBeTruthy();expect(screen.queryByRole('button',{name:/Approval/})).toBeNull();
 });
 it('refreshes a changed gate coherently through one named capture and retains keyboard focus',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let updated=false;const next=advanced();
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?changed:named(path)?updated?next:detail:inventory) as unknown as ReadTransport;
  render(<App compact transport={read} onExpand={vi.fn()}/>);fireEvent.change(await readySelection(),{target:{value:'run-a'}});
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
  render(<App compact transport={read} onExpand={vi.fn()}/>);fireEvent.change(await readySelection(),{target:{value:'run-a'}});await screen.findByText('Freigegebenen Umfang umsetzen.');fail=true;await tick();
  await screen.findByText('Die Daten konnten nicht gelesen werden. Quelle oder lokalen Dienst prüfen und wiederholen.');expect((screen.getByRole('button',{name:'Run ansehen'}) as HTMLButtonElement).disabled).toBe(true);
  const count=vi.mocked(read).mock.calls.length;await tick();expect(read).toHaveBeenCalledTimes(count);fail=false;fireEvent.click(screen.getByRole('button',{name:'Neu laden'}));await screen.findByText('Weiterarbeit offen');
 });
 it('discards obsolete freshness after deliberate navigation to another Run',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let finish!:(value:typeof changed)=>void;
  const two=backlog([pointer('run-a','Deliver cockpit'),pointer('run-b','Second run')]);
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?new Promise<typeof changed>(resolve=>{finish=resolve;}):path.startsWith('/api/runs/run-b')?runScope(runData('run-b','Second run'),'second-snapshot'):named(path)?detail:two) as unknown as ReadTransport;
  render(<App compact transport={read}/>);fireEvent.change(await readySelection(),{target:{value:'run-a'}});await screen.findByText('Freigegebenen Umfang umsetzen.');await tick();
  fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));fireEvent.change(await readySelection(),{target:{value:'run-b'}});await screen.findByRole('heading',{name:'Second run'});
  await act(async()=>finish(changed));expect(screen.queryByText(/Veraltet/)).toBeNull();expect(screen.getByRole('heading',{name:'Second run'})).toBeTruthy();
  expect(vi.mocked(read).mock.calls.filter(c=>c[0]==='/api/snapshot')).toHaveLength(2);
 });
 it('confirmed selected Run removal returns to stored backlog without selecting a replacement',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let removed=false;
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?changed:named(path)?removed?{...backlog([pointer('run-b')]),snapshot_id:'removed-snapshot',data:{...backlog([pointer('run-b')]).data!,removed_run_id:'run-a'}}:detail:inventory) as unknown as ReadTransport;
  render(<App compact transport={read}/>);fireEvent.change(await readySelection(),{target:{value:'run-a'}});await screen.findByText('Freigegebenen Umfang umsetzen.');removed=true;await tick();
  expect((await readySelection() as HTMLSelectElement).value).toBe('');expect(screen.queryByText('Freigegebenen Umfang umsetzen.')).toBeNull();expect(vi.mocked(read).mock.calls.some(c=>c[0].startsWith('/api/runs/run-b'))).toBe(false);
 });
 it('explicit navigation supersedes a pending background capture without mixing source views',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let finish!:(value:typeof detail)=>void;
  const two=backlog([pointer('run-a'),pointer('run-b','Second run')]);
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?changed:path==='/api/snapshot?run_id=run-a'?new Promise<typeof detail>(resolve=>{finish=resolve;}):path.startsWith('/api/runs/run-b')?runScope(runData('run-b','Second run'),'second-snapshot'):named(path)?detail:two) as unknown as ReadTransport;
  render(<App compact transport={read}/>);fireEvent.change(await readySelection(),{target:{value:'run-a'}});await screen.findByText('Freigegebenen Umfang umsetzen.');await tick();await screen.findByText('Kontrolldaten werden gelesen … Vorheriger Datenstand bleibt sichtbar.');
  fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));fireEvent.change(await readySelection(),{target:{value:'run-b'}});await screen.findByRole('heading',{name:'Second run'});
  await act(async()=>finish(advanced()));expect(screen.getByRole('heading',{name:'Second run'})).toBeTruthy();expect(screen.queryByText('Qualität prüfen.')).toBeNull();expect(screen.queryByText(/Kontrolldaten werden gelesen/)).toBeNull();
 });
});
it('stale Run remains identified with one warning and unconfirmed assessment until explicit reload',async()=>{
 const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?changed:detail) as unknown as ReadTransport;
 render(<App initialRunId="run-a" transport={read}/>);await screen.findByText('Weiterarbeit offen');
 expect(screen.getByText('Ziel und Run-ID · Originalangaben').closest('details')?.open).toBe(false);expect(screen.getByText('Nachweise und offene Punkte · 1').closest('details')?.open).toBe(false);
 await act(async()=>{});await act(async()=>document.dispatchEvent(new Event('visibilitychange')));await screen.findByText('Aktuelle Voraussetzungen nicht bestätigt');
 expect(screen.queryByText('Weiterarbeit offen')).toBeNull();expect(screen.queryByText(/Angefragter Run:/)).toBeNull();
 expect(screen.getAllByText('Die Quelldaten haben sich geändert. Angezeigte Inhalte gehören zum vorherigen Datenstand. Bewusst neu laden.')).toHaveLength(1);expect(document.querySelector('footer')?.textContent).toContain('Veraltet');
 fireEvent.click(screen.getByRole('button',{name:'Daten aktualisieren'}));await screen.findByText('Weiterarbeit offen');expect(document.querySelector('footer')?.textContent).toContain('Verfügbar');
});
it('inventory failure is visible directly without false empty counts or usable overview action',async()=>{
 const read=vi.fn(async()=>({...fixtureMeta,state:'error',code:'timeout',data:null,retryable:true})) as unknown as ReadTransport;
 render(<App compact transport={read} onExpand={vi.fn()}/>);await screen.findByText('Das Lesen hat das Zeitlimit erreicht. Quelle und Umfang prüfen, dann wiederholen.');
 expect(screen.queryByText(/Backlog-Hinweise/)).toBeNull();expect(screen.queryByText(/0 Backlog-Einträge/)).toBeNull();expect(screen.queryByRole('button',{name:'Vorhaben-Übersicht'})).toBeNull();
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
