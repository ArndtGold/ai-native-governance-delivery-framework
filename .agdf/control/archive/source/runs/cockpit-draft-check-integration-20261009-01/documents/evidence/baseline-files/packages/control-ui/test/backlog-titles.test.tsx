import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Overview } from '../src/Overview';
import { BacklogTitleCache } from '../src/useBacklogTitles';
import { backlog, pointer } from './scoped-fixtures';
import type { TitleObservation } from '../src/types';
const observation = (title = 'UR-Titel'): TitleObservation => ({state:'available',code:null,path:'.agdf/control/artefacts/a/UR.md',heading:'UR: '+title,title,content_digest:'a'.repeat(64),observed_as_of:'2026-10-07T08:00:00Z',backlog_digest:'backlog-digest'});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('SCN-084: last stored row leads independently in all areas; counts are independent of filtering', () => {
  const rows = ['Active Backlog','Planned / Parking Lot','Completed / Superseded Pointers'].flatMap(section => [1,2].map(n => ({...pointer(section+n,'Eintrag '+n),section})));
  render(<Overview result={backlog(rows)} onSelect={vi.fn()}/>);
  for (const name of ['Aktiv 2','Geplant 2','Archiv 2']) {
    fireEvent.click(screen.getByRole('button',{name}));
    expect(screen.getAllByRole('button',{name:/Eintrag/}).map(b => b.textContent)).toEqual(['Eintrag 2','Eintrag 1']);
    fireEvent.change(screen.getByRole('searchbox'),{target:{value:'Eintrag 1'}});
    expect(screen.getAllByRole('button',{name:/Eintrag/})).toHaveLength(1);
    expect(screen.getByRole('button',{name})).toBeTruthy();
  }
});
it('SCN-091: metadata cache enforces LRU, count and serialized UTF-8 byte bounds', () => {
  const cache = new BacklogTitleCache();
  for(let i=0;i<128;i++) cache.put(String(i),observation(String(i)));
  cache.get('0'); cache.put('new',observation()); expect(cache.get('0')).toBeTruthy(); expect(cache.get('1')).toBeUndefined(); expect(cache.count).toBe(128);
  for(let i=0;i<128;i++) cache.put('large'+i,observation('😀'.repeat(512)));
  expect(cache.byteLength).toBeLessThanOrEqual(256*1024); expect(cache.count).toBeLessThan(128);
  cache.clear(); expect(cache.count).toBe(0); expect(cache.byteLength).toBe(0);
});
it('SCN-093/094: intersection demand plus one neighbour only; supplementary UR never changes stored titles/search; bounded reads persist', async () => {
  const observers: {callback:IntersectionObserverCallback;targets:Element[]}[]=[];
  class Observer { targets:Element[]=[]; constructor(callback:IntersectionObserverCallback) { observers.push({callback,targets:this.targets}); } observe(target:Element) {this.targets.push(target);} disconnect() {} }
  vi.stubGlobal('IntersectionObserver',Observer);
  const rows=Array.from({length:20},(_,i)=>({...pointer('key'+i,'Backlog '+i),row_id:`00000000-0000-0000-0000-${String(i).padStart(12,'0')}`}));
  const initial=backlog(rows), load=vi.fn(async (ids:string[]) => ({...initial,snapshot_id:'new',data:{...initial.data!,entries:rows.map(row => ({...row,title_observation:ids.includes(row.row_id!) ? observation('Kundenberatung '+row.key) : undefined}))}}));
  const {rerender}=render(<Overview result={initial} onSelect={vi.fn()} loadTitles={load}/>);
  const last=observers.at(-1)!;
  last.callback([{target:last.targets[0],isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver);
  await waitFor(()=>expect(load).toHaveBeenCalledTimes(1));
  expect(load.mock.calls[0][0]).toEqual([rows[19].row_id,rows[18].row_id]);
  await waitFor(()=>expect(screen.getByText('UR: Kundenberatung key19')).toBeTruthy());
  expect(screen.getByRole('button',{name:'Backlog 19'})).toBeTruthy();
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'Kundenberatung'}});
  expect(screen.queryByRole('button',{name:/Backlog/})).toBeNull();
  expect(screen.getByText('Keine gespeicherten Vorhaben für diese Suche.')).toBeTruthy();
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'Backlog 19'}});
  expect(screen.getByRole('button',{name:'Backlog 19'})).toBeTruthy();
  rerender(<Overview result={initial} onSelect={vi.fn()} loadTitles={load} titlesEnabled={false} resetTitles/>);
  await waitFor(()=>expect(screen.queryByRole('button',{name:/Kundenberatung/})).toBeNull());
});
it('SCN-092: navigation/unmount aborts outstanding title request and discards late metadata', async () => {
  let cb:IntersectionObserverCallback=()=>{};
  class Observer {constructor(callback:IntersectionObserverCallback){cb=callback;} observe(){} disconnect(){} }
  vi.stubGlobal('IntersectionObserver',Observer);
  const initial=backlog([{...pointer('a'),row_id:'00000000-0000-0000-0000-000000000001'}]);
  const load=vi.fn((_ids:string[],signal:AbortSignal)=>new Promise<null>(resolve=>signal.addEventListener('abort',()=>resolve(null))));
  const {unmount,container}=render(<Overview result={initial} onSelect={vi.fn()} loadTitles={load}/>);
  cb([{target:container.querySelector('[data-backlog-row]')!,isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver);
  await waitFor(()=>expect(load).toHaveBeenCalledTimes(1)); unmount(); expect(load.mock.calls[0][1].aborted).toBe(true);
});
it('SCN-093: hidden document starts no batch, missing UR is attempted once until deliberate reset', async () => {
  let cb:IntersectionObserverCallback=()=>{};
  class Observer {constructor(callback:IntersectionObserverCallback){cb=callback;} observe(){} disconnect(){} }
  vi.stubGlobal('IntersectionObserver',Observer);
  const hidden=vi.spyOn(document,'hidden','get'); hidden.mockReturnValue(true);
  const initial=backlog([{...pointer('a'),row_id:'00000000-0000-0000-0000-000000000001'}]);
  const load=vi.fn(async()=>({...initial,data:{...initial.data!,entries:[{...initial.data!.entries[0],title_observation:{...observation(),state:'unavailable' as const,code:'document_missing',title:null,heading:null,content_digest:null}}]}}));
  const {container,rerender}=render(<Overview result={initial} onSelect={vi.fn()} loadTitles={load}/>);
  const intersect=()=>cb([{target:container.querySelector('[data-backlog-row]')!,isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver);
  intersect(); await new Promise(resolve=>setTimeout(resolve,100)); expect(load).not.toHaveBeenCalled();
  hidden.mockReturnValue(false); fireEvent(document,new Event('visibilitychange'));
  await waitFor(()=>expect(load).toHaveBeenCalledTimes(1));
  await waitFor(()=>expect(screen.getByText('Nicht verfügbar',{selector:'dd'})).toBeTruthy());
  intersect(); await new Promise(resolve=>setTimeout(resolve,150)); expect(load).toHaveBeenCalledTimes(1);
  rerender(<Overview result={initial} onSelect={vi.fn()} loadTitles={load} resetTitles/>);
  intersect(); await waitFor(()=>expect(load).toHaveBeenCalledTimes(2)); hidden.mockRestore();
});
it('SCN-096/100: MCP adapter sends opaque title selectors without context publication or a question', async () => {
  const { CockpitBridge } = await import('../src/mcp/transport');
  const bridge=new CockpitBridge(); bridge.session='00000000-0000-0000-0000-000000000099';
  vi.spyOn(bridge.app,'getHostCapabilities').mockReturnValue({serverTools:{}});
  const row_id='00000000-0000-0000-0000-000000000001';
  const value={...backlog([{...pointer('a'),row_id,title_observation:observation()}]),snapshot_id:'replacement'};
  const call=vi.spyOn(bridge.app,'callServerTool').mockResolvedValue({content:[],structuredContent:value});
  const publish=vi.spyOn(bridge.app,'updateModelContext'), question=vi.spyOn(bridge.app,'sendMessage');
  await bridge.read('/api/backlog-titles?snapshot=old&rows='+row_id,new AbortController().signal,{target:'target',snapshot:'old',replacement:true});
  expect(call.mock.calls[0][0]).toEqual({name:'agdf_cockpit_read',arguments:{operation:'backlog_titles',session_id:bridge.session,snapshot_id:'old',row_ids:[row_id]}});
  expect(publish).not.toHaveBeenCalled(); expect(question).not.toHaveBeenCalled(); vi.restoreAllMocks();
});
