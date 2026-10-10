import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import { EmbeddedEntry } from '../src/mcp/EmbeddedEntry';
import { CockpitBridge } from '../src/mcp/transport';
import { readRenderBootstrap } from '../src/mcp/bootstrap';
import type { ReadTransport } from '../src/api';
import { backlog, pointer, runData, fixtureMeta } from './scoped-fixtures';
const target=fixtureMeta.target;
const inventory=backlog();
const detail=(id:string)=>({...fixtureMeta,snapshot_id:'run-snapshot',data:{kind:'run' as const,run:runData(id)}});
const transport=()=>vi.fn(async(path:string)=>path.startsWith('/api/snapshot?run_id=')?detail(path.split('run_id=')[1]):path.startsWith('/api/runs/')?detail(path.slice(10).split('?')[0]):inventory) as unknown as ReadTransport;
const sessionA='00000000-0000-4000-8000-000000000001',sessionB='00000000-0000-4000-8000-000000000002';
const bootstrap=(session_id=sessionA,render_generation=1,initial_run_id:string|undefined='run-a')=>({structuredContent:{schema_version:'1',authorizes:false,target},_meta:{agdf_cockpit:{session_id,render_generation,initial_run_id,target}}});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
for (const compact of [true, false]) for (const stage of ['snapshot-throw', 'snapshot-envelope', 'snapshot-blocked', 'snapshot-limit']) {
  it(`initial Run survives a transient ${stage} failure and retry in ${compact ? 'compact' : 'expanded'} view`, async () => {
    let failed = false;
    const read = vi.fn(async (path:string) => {
      if (!failed && path === '/api/snapshot?run_id=run-a') {
        failed = true;
        if(stage==='snapshot-throw')throw Error('read_failed');
        return {...fixtureMeta,snapshot_id:null,data:null,code:stage==='snapshot-limit'?'resource_limit':'read_failed',state:stage==='snapshot-blocked'?'blocked':'error',retryable:true};
      }
      return detail('run-a');
    }) as unknown as ReadTransport;
    render(<App compact={compact} initialRunId="run-a" transport={read}/>);
    await screen.findByText(stage==='snapshot-limit'?'Ein Ressourcenlimit wurde erreicht. Dateigröße und Umfang außerhalb des Cockpits prüfen.':'Die Daten konnten nicht gelesen werden. Quelle oder lokalen Dienst prüfen und wiederholen.');
    expect(screen.getByText('run-a',{selector:'code'})).toBeTruthy(); expect(screen.queryByRole('combobox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: compact ? stage === 'snapshot-throw' ? 'Lesefehler · Wiederholen' : 'Neu laden' : 'Wiederholen' }));
    await screen.findByRole('heading', { name: 'run-a', level: compact ? 2 : 1 });
    expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot?run_id=run-a','/api/snapshot?run_id=run-a']);
  });
}
for (const compact of [true, false]) for (const initialFailure of [true, false]) {
  it(`expired session requires reopening without retrying in ${compact ? 'compact' : 'expanded'} view (${initialFailure ? 'initial' : 'retained'})`, async () => {
    let expired = initialFailure;
    const read = vi.fn(async () => expired ? { ...fixtureMeta, snapshot_id:null, state:'blocked', code:'session_expired', data:null, retryable:false } : detail('run-a')) as unknown as ReadTransport;
    render(<App compact={compact} initialRunId="run-a" transport={read}/>);
    if (!initialFailure) {
      await screen.findByRole('heading', { name:'run-a', level:compact ? 2 : 1 });
      expired = true; fireEvent.click(screen.getByRole('button', { name:'Neu laden' }));
    }
    await screen.findByText('Die MCP-Sitzung ist abgelaufen. Öffne das Cockpit im Chat erneut für diesen Run. Angezeigte Inhalte gehören zum vorherigen Datenstand.');
    expect(screen.queryByRole('button', { name:'Wiederholen' })).toBeNull();
    const reload = screen.getByRole('button', { name:'Sitzung abgelaufen' });
    expect((reload as HTMLButtonElement).disabled).toBe(true);
    const count = vi.mocked(read).mock.calls.length; fireEvent.click(reload);
    expect(vi.mocked(read).mock.calls.length).toBe(count);
    if (!initialFailure) expect(screen.getByRole('heading', { name:'run-a', level:compact ? 2 : 1 })).toBeTruthy();
  });
}
it('a validated initial Run hides discovery; explicitly returning to backlog enables search with a separate read',async()=>{
  const many=backlog([pointer('run-a'),...Array.from({length:12},(_,i)=>pointer(`other-${i}`,`Other ${i}`))]);
  const read=vi.fn(async(path:string)=>path==='/api/snapshot'?many:path.startsWith('/api/runs/')?detail(path.slice(10).split('?')[0]):detail('run-a')) as unknown as ReadTransport;
  render(<App compact initialRunId="run-a" transport={read}/>);
  await screen.findByRole('heading',{name:'run-a'});
  expect(screen.queryByRole('searchbox')).toBeNull();expect(screen.queryByRole('combobox')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));
  const search=await screen.findByRole('searchbox',{name:'Vorhaben suchen'});
  expect(screen.queryByRole('combobox')).toBeNull();
  fireEvent.change(search,{target:{value:'other-7'}});
  expect(document.querySelectorAll('.undertaking-list > li')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button',{name:'Other 7'}));
  await screen.findByRole('heading',{name:'other-7'});
  expect(screen.queryByRole('combobox')).toBeNull();
  expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot?run_id=run-a','/api/snapshot','/api/runs/other-7?snapshot=snapshot']);
});
it('a formerly inspected initial Run returns to confirmed removal backlog without choosing another',async()=>{
  let removed=false;
  const read=vi.fn(async()=>removed?{...inventory,snapshot_id:'next',data:{...backlog([pointer('run-b')]).data!,removed_run_id:'run-a'}}:detail('run-a')) as unknown as ReadTransport;
  render(<App compact initialRunId="run-a" transport={read}/>);
  await screen.findByRole('heading',{name:'run-a'});expect(screen.queryByRole('combobox')).toBeNull();
  removed=true;fireEvent.click(screen.getByRole('button',{name:'Neu laden'}));
  await screen.findByText(/nicht mehr vorhanden. Kein anderer Run/);
  await waitFor(()=>expect((screen.getByRole('button',{name:'run-b'}) as HTMLButtonElement).disabled).toBe(false));
  expect(screen.queryByRole('combobox')).toBeNull();
  expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot?run_id=run-a','/api/snapshot?run_id=run-a']);
});
it('SCN-039/043: named opening uses one exact request and resizing or prop changes preserve manual selection',async()=>{
  const read=transport();const view=render(<App compact initialRunId="run-a" transport={read}/>);
  await screen.findByRole('heading',{name:'run-a'});
  expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot?run_id=run-a']);
  fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));
  const row=await screen.findByRole('button',{name:'run-b'});
  fireEvent.click(row);await screen.findByRole('heading',{name:'run-b'});
  view.rerender(<App initialRunId="run-a" transport={read}/>);
  expect(screen.getByRole('heading',{name:'run-b',level:1})).toBeTruthy();expect(screen.getByText('run-b',{selector:'code'})).toBeTruthy();
  expect(vi.mocked(read).mock.calls.filter(c=>c[0].startsWith('/api/snapshot'))).toHaveLength(2);
});
it('SCN-040: an unknown initial ID stays identified without discovery or an alternate Run',async()=>{
  const read=vi.fn(async()=>({...fixtureMeta,state:'missing',code:'run_missing',data:{kind:'run',requested_run_id:'missing-run',run:null}})) as unknown as ReadTransport;
  render(<App compact initialRunId="missing-run" transport={read}/>);
  await screen.findByText('missing-run',{selector:'code'});expect(screen.queryByRole('combobox')).toBeNull();
  expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot?run_id=missing-run']);
});
it('SCN-040: an invalid Run retains diagnostic identity; unavailable reads retain the requested identity',async()=>{
  const read=vi.fn(async()=>({...fixtureMeta,state:'invalid',code:'invalid_run',data:{kind:'run',requested_run_id:'run-a',run:{run_id:'run-a',revision_id:null,lifecycle:null,resources:[],diagnostics:[{code:'invalid_run'}]}}})) as unknown as ReadTransport;
  const view=render(<App compact initialRunId="run-a" transport={read}/>);
  await screen.findByRole('heading',{name:'run-a'});expect(screen.queryByRole('combobox')).toBeNull();
  expect(screen.getAllByText(/Dieser Run ist ungültig/).length).toBeGreaterThan(0);view.unmount();
  const unavailable=vi.fn(async()=>({...fixtureMeta,state:'blocked',code:'resource_denied',data:null})) as unknown as ReadTransport;
  render(<App compact initialRunId="run-a" transport={unavailable}/>);
  await screen.findByText(/Daten noch nicht lesbar. Kein anderer Run/);expect(screen.getByText('run-a',{selector:'code'})).toBeTruthy();
  expect(vi.mocked(unavailable).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot?run_id=run-a']);
});
it('SCN-042/043: delayed initial read cannot replace a new manual binding after cancellation',async()=>{
  let finish!: (value:ReturnType<typeof detail>)=>void;
  const read=vi.fn(async(path:string)=>path==='/api/snapshot?run_id=run-a'?new Promise<ReturnType<typeof detail>>(resolve=>{finish=resolve;}):detail('run-b')) as unknown as ReadTransport;
  const view=render(<App compact initialRunId="run-a" transport={read}/>);
  await act(async()=>{});view.unmount();expect(vi.mocked(read).mock.calls[0][1].aborted).toBe(true);
  render(<App compact initialRunId="run-b" transport={read}/>);await screen.findByRole('heading',{name:'run-b'});
  await act(async()=>finish(detail('run-a')));expect(screen.queryByRole('heading',{name:'run-a'})).toBeNull();
});
it('SCN-042: scoped bootstrap validates identity and malformed selectors',()=>{
  expect(readRenderBootstrap(bootstrap())?.initialRunId).toBe('run-a');
  expect(readRenderBootstrap({structuredContent:{...inventory,authorizes:false}})).toBeNull();
  const bad=bootstrap();bad._meta.agdf_cockpit.target={target_id:'foreign',display_path:'/foreign'};
  expect(readRenderBootstrap(bad)).toBeNull();expect(readRenderBootstrap(bootstrap(sessionA,1,'../foreign'))).toBeNull();
  expect(readRenderBootstrap(bootstrap(sessionA,0))).toBeNull();
});
it('a fresh host render reopens an expired session with the same explicit Run and no automatic message', async () => {
  let expired = true;
  const read = vi.fn(async (path:string) => expired ? { ...inventory, snapshot_id:null, state:'blocked', code:'session_expired', retryable:false, data:null }
    : path.startsWith('/api/snapshot?run_id=') ? detail('run-a') : inventory) as unknown as ReadTransport;
  const app = { getHostVersion:()=>({name:'test-host',version:'fixture'}), connect:vi.fn(async()=>{}), getHostCapabilities:()=>({serverTools:{}}), getHostContext:()=>({displayMode:'inline'}),
    updateModelContext:vi.fn(), sendMessage:vi.fn(), ontoolresult:(_:unknown)=>{}, onhostcontextchanged:()=>{} };
  const bridge = { app, read, readForSession:()=>read, operation:vi.fn(async()=>({})), session:'' } as unknown as CockpitBridge;
  render(<EmbeddedEntry bridge={bridge}/>);
  await act(async()=>app.ontoolresult(bootstrap()));
  await screen.findByText(/Die MCP-Sitzung ist abgelaufen/);
  expect((screen.getByRole('button',{name:'Sitzung abgelaufen'}) as HTMLButtonElement).disabled).toBe(true);
  expired = false;
  await act(async()=>app.ontoolresult(bootstrap(sessionB,2,'run-a')));
  await screen.findByRole('heading',{name:'run-a',level:2});
  expect(bridge.session).toBe(sessionB);
  expect((screen.getByRole('button',{name:'Neu laden'}) as HTMLButtonElement).disabled).toBe(false);
  expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot?run_id=run-a','/api/snapshot?run_id=run-a']);
  expect(app.updateModelContext).not.toHaveBeenCalled(); expect(app.sendMessage).not.toHaveBeenCalled();
});
it('SCN-042/043: new render remounts/cancels old reader, stale render is ignored, host mode preserves the reader and publishes nothing',async()=>{
  let finish!: (value:ReturnType<typeof detail>)=>void;
  const evaluatedB=detail('run-b');
  const read=vi.fn(async(path:string)=>path==='/api/snapshot?run_id=run-a'?new Promise<ReturnType<typeof detail>>(resolve=>{finish=resolve;}):evaluatedB) as unknown as ReadTransport;
  let mode='inline';
  const app={getHostVersion:()=>({name:'test-host',version:'fixture'}),connect:vi.fn(async()=>{}),getHostCapabilities:()=>({serverTools:{}}),getHostContext:()=>({displayMode:mode,availableDisplayModes:['fullscreen']}),requestDisplayMode:vi.fn(async()=>({mode:'fullscreen'})),updateModelContext:vi.fn(),sendMessage:vi.fn(),ontoolresult: (_:unknown)=>{},onhostcontextchanged:()=>{}};
  const bridge={app,read,readForSession:()=>read,operation:vi.fn(async()=>({})),session:''} as unknown as CockpitBridge;
  render(<EmbeddedEntry bridge={bridge}/>);
  await act(async()=>{app.ontoolresult(bootstrap());});
  expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot?run_id=run-a']);
  await act(async()=>{app.ontoolresult(bootstrap(sessionB,2,'run-b'));});
  await screen.findByRole('heading',{name:'run-b'});expect(vi.mocked(read).mock.calls[0][1].aborted).toBe(true);
  await act(async()=>{app.ontoolresult(bootstrap());finish(detail('run-a'));});
  expect(screen.queryByRole('combobox')).toBeNull();expect(screen.getByRole('button',{name:'Alle Vorhaben'})).toBeTruthy();expect(bridge.session).toBe(sessionB);
  const count=vi.mocked(read).mock.calls.length;
  await act(async()=>{mode='fullscreen';app.onhostcontextchanged();});
  expect(screen.getByRole('heading',{name:'run-b',level:1})).toBeTruthy();expect(vi.mocked(read).mock.calls.length).toBe(count);
  fireEvent.click(screen.getByRole('button',{name:'Zusammenfassung'}));
  expect(screen.getByRole('heading',{name:'run-b',level:1})).toBeTruthy();
  expect(screen.getByRole('button',{name:'Zusammenfassung'}).getAttribute('aria-pressed')).toBe('true');
  expect(screen.queryByRole('button',{name:'Run ansehen'})).toBeNull();
  expect(screen.queryByRole('heading',{name:'Dokumente'})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Details'}));
  expect(screen.getByRole('heading',{name:'Dokumente'})).toBeTruthy();
  expect(app.requestDisplayMode).not.toHaveBeenCalled();
  expect(vi.mocked(read).mock.calls.length).toBe(count);
  await act(async()=>{mode='inline';app.onhostcontextchanged();});
  expect(screen.queryByRole('group',{name:'Ansicht'})).toBeNull();
  expect(screen.getByRole('heading',{name:'AGDF Cockpit',level:1})).toBe(document.activeElement);
  expect(screen.getByRole('button',{name:'Run ansehen'})).toBeTruthy();

  expect(app.updateModelContext).not.toHaveBeenCalled();expect(app.sendMessage).not.toHaveBeenCalled();
});
it('SCN-042: a delayed server reply from the previous session cannot populate the current transport',async()=>{
  const bridge=new CockpitBridge();let finish!: (value:object)=>void;
  vi.spyOn(bridge.app,'getHostCapabilities').mockReturnValue({serverTools:{}});
  vi.spyOn(bridge.app,'callServerTool').mockImplementation(()=>new Promise(resolve=>{finish=resolve;}) as never);
  bridge.session=sessionA;
  const old=bridge.operation({operation:'snapshot'});bridge.session=sessionB;
  finish({structuredContent:{authorizes:false}});await expect(old).rejects.toThrow('session_invalid');
});
it('SCN-042/057: immutable reading and old cleanup still use their own session after a new bootstrap',async()=>{
  const bridge=new CockpitBridge();
  vi.spyOn(bridge.app,'getHostCapabilities').mockReturnValue({serverTools:{}});
  const call=vi.spyOn(bridge.app,'callServerTool').mockResolvedValue({structuredContent:inventory} as never);
  bridge.session=sessionA;
  const oldRead=bridge.readForSession(sessionA);
  bridge.session=sessionB;
  await oldRead('/api/snapshot',new AbortController().signal);
  expect(call.mock.calls[0][0].arguments?.session_id).toBe(sessionA);
  await bridge.operation({operation:'close'},undefined,sessionA);
  expect(call.mock.calls[1][0].arguments?.session_id).toBe(sessionA);
  expect(bridge.session).toBe(sessionB);
});
it('SCN-047: capacity feedback preserves the current requested Run and never sends context',async()=>{
  const read=transport();
  const operation=vi.fn(async()=>({}));
  const app={getHostVersion:()=>({name:'test-host',version:'fixture'}),connect:vi.fn(async()=>{}),getHostCapabilities:()=>({serverTools:{}}),getHostContext:()=>({displayMode:'inline'}),updateModelContext:vi.fn(),sendMessage:vi.fn(),ontoolresult:(_:unknown)=>{},onhostcontextchanged:()=>{}};
  const bridge={app,read,readForSession:()=>read,operation,session:''} as unknown as CockpitBridge;
  render(<EmbeddedEntry bridge={bridge}/>);
  await act(async()=>app.ontoolresult(bootstrap()));
  await screen.findByRole('heading',{name:'run-a',level:2});
  await act(async()=>app.ontoolresult({structuredContent:{...inventory,state:'blocked',code:'resource_limit',data:null}}));
  expect(screen.getByRole('alert').textContent).toContain('Vier Cockpit-Ansichten');
  expect(screen.getByRole('heading',{name:'run-a',level:2})).toBeTruthy();
  expect(bridge.session).toBe(sessionA);expect(operation).not.toHaveBeenCalled();
  expect(app.updateModelContext).not.toHaveBeenCalled();expect(app.sendMessage).not.toHaveBeenCalled();
});
