import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';
import { HandoffController, type HandoffPort, type ContextSelection } from '../src/mcp/handoff';
import { ContextPanel } from '../src/ContextPanel';
import type { ContextPacket, Envelope, Detail, DocumentData, GraphData } from '../src/types';
import type { ReadTransport } from '../src/api';
import { CockpitBridge } from '../src/mcp/transport';
import { createHandoffPort } from '../src/mcp/handoff-port';
const selection: ContextSelection={target:'target',snapshot_id:'snapshot',run_id:'run-a',revision_id:'revision',resource_id:'source',graph_ids:[],excluded_ids:[]};
const packet=(generation:number):ContextPacket=>({schema_version:'1',target:{target_id:'target',display_path:'/fixture'},snapshot_id:'snapshot',source_digest:'digest',observed_as_of:'2026-10-06T12:00:00Z',prepared_at:'2026-10-06T12:00:01Z',run_id:'run-a',revision_id:'revision',context_id:'context',generation,
  artefact:{resource:{resource_id:'source',run_id:'run-a',type:'UR',path:'source.md',registered_reference:'source.md',status:'registered'},format:'markdown',content:'# Evidence',content_digest:'hash',links:{}},graph_nodes:[],included:[],excluded:[],authorizes:false});
const defer=()=>{let resolve!:()=>void;const promise=new Promise<void>(r=>{resolve=r;});return{promise,resolve};};
function fixture() {
  const events:string[]=[];
  const port:HandoffPort={support:()=>({context:true,question:true}),prepare:vi.fn(async(_s,g)=>{events.push('prepare');return packet(g);}),validate:vi.fn(async()=>{events.push('validate');}),invalidate:vi.fn(async()=>{events.push('invalidate-server');return {host_publication_required:true,invalidation_id:'00000000-0000-4000-8000-000000000099'};}),completeInvalidation:vi.fn(async()=>{events.push('complete-server');}),publish:vi.fn(async(value)=>{events.push(value.kind?'invalidate-host':'publish');}),question:vi.fn(async(text)=>{events.push('question');expect(text).toContain('context');expect(text).toContain('run-a');expect(text).toContain('source.md');expect(text).not.toMatch(/Approval:|continue_delivery|implementiere/i);})};
  return{events,port,controller:new HandoffController(port)};
}
afterEach(()=>{cleanup();vi.restoreAllMocks();});
describe('bounded contextual handoff',()=>{
  it('SCN-015: preparation, validation and acknowledged context precede a separate deliberate question',async()=>{
    const{events,port,controller}=fixture();await controller.prepare(selection);
    expect(events).toEqual(['prepare','validate','publish']);expect(controller.state.phase).toBe('accepted');expect(port.question).not.toHaveBeenCalled();
    await controller.sendQuestion();expect(events.slice(-2)).toEqual(['validate','question']);expect(controller.state.phase).toBe('question');
    await controller.sendQuestion();expect(port.question).toHaveBeenCalledTimes(1);
  });
  it('SCN-018/019: obsolete publication is followed by serialized invalidation; pending invalidation blocks a new handoff',async()=>{
    const{events,port,controller}=fixture(),publishing=defer(),invalidating=defer();
    port.publish=vi.fn(async(value)=>{events.push(value.kind?'invalidate-host':'publish');await(value.kind?invalidating.promise:publishing.promise);});
    const a=controller.prepare(selection);await vi.waitFor(()=>expect(events).toContain('publish'));
    const invalidate=controller.invalidate();expect(controller.state.phase).toBe('invalidating');
    const b=controller.prepare(selection);expect(port.prepare).toHaveBeenCalledTimes(1);
    publishing.resolve();await a;await vi.waitFor(()=>expect(events).toContain('invalidate-host'));
    expect(controller.state.phase).toBe('invalidating');expect(port.question).not.toHaveBeenCalled();
    invalidating.resolve();await invalidate;await b;expect(events).toEqual(['prepare','validate','publish','invalidate-server','invalidate-host','complete-server','prepare','validate','publish']);
    expect(controller.state.packet?.generation).toBeGreaterThan(1);
  });
  it('SCN-018: a source switch during server preparation prevents the old packet from being published',async()=>{
    const{events,port,controller}=fixture(),pending=defer();port.prepare=vi.fn(async(_s,g)=>{await pending.promise;return packet(g);});
    const job=controller.prepare(selection),invalidate=controller.invalidate();pending.resolve();await job;await invalidate;
    expect(events).toEqual(['invalidate-server','invalidate-host','complete-server']);expect(controller.state.phase).toBe('idle');
  });
  it('SCN-019/021/023/055: lost host invalidation acknowledgement blocks retries and requires a new connection',async()=>{
    const{port,controller}=fixture();await controller.prepare(selection);
    port.publish=vi.fn().mockRejectedValueOnce(Error('timeout')).mockResolvedValue(undefined);
    await controller.invalidate();expect(controller.state.phase).toBe('uncertain');await controller.prepare(selection);expect(port.prepare).toHaveBeenCalledTimes(1);
    await controller.invalidate();expect(controller.state.phase).toBe('uncertain');expect(controller.state.recovery).toBe('fresh_connection');expect(port.publish).toHaveBeenCalledTimes(1);expect(port.completeInvalidation).not.toHaveBeenCalled();
  });
  it('SCN-021/023: rejected context never enables question; lost question acknowledgement never resends',async()=>{
    const{port,controller}=fixture();port.publish=vi.fn().mockRejectedValue(Error('context_unavailable'));
    await controller.prepare(selection);expect(controller.state.phase).toBe('uncertain');await controller.sendQuestion();expect(port.question).not.toHaveBeenCalled();
    port.publish=vi.fn().mockResolvedValue(undefined);await controller.invalidate();await controller.prepare(selection);
    port.question=vi.fn().mockRejectedValue(Error('timeout'));await controller.sendQuestion();expect(controller.state.phase).toBe('uncertain');await controller.sendQuestion();expect(port.question).toHaveBeenCalledTimes(1);
  });
  it('SCN-023: an explicit question rejection differs from an unknown delivery outcome and never retries',async()=>{
    const{port,controller}=fixture();await controller.prepare(selection);
    port.question=vi.fn().mockRejectedValue(Error('message_rejected'));
    await controller.sendQuestion();expect(controller.state.phase).toBe('error');expect(controller.state.code).toBe('message_rejected');
    await controller.sendQuestion();expect(port.question).toHaveBeenCalledTimes(1);
  });
  it('SCN-020: changed source at question time entitles no question and clears published context',async()=>{
    const{events,port,controller}=fixture();await controller.prepare(selection);port.validate=vi.fn().mockRejectedValue(Error('source_changed'));
    await controller.sendQuestion();expect(port.question).not.toHaveBeenCalled();expect(events.slice(-3)).toEqual(['invalidate-server','invalidate-host','complete-server']);expect(controller.state.phase).toBe('error');
  });
  it('SCN-021: unavailable host methods remain disabled without probing or sending',async()=>{
    const{port,controller}=fixture();port.support=()=>({context:false,question:false});
    await controller.prepare(selection);await controller.sendQuestion();expect(controller.state.code).toBe('context_unavailable');
    expect(port.prepare).not.toHaveBeenCalled();expect(port.publish).not.toHaveBeenCalled();expect(port.question).not.toHaveBeenCalled();
  });
  it('SCN-053/055: failed begin and nonowner cleanup never publish a host invalidation',async()=>{
    const {port,controller}=fixture();await controller.prepare(selection);port.publish=vi.fn();
    port.invalidate=vi.fn().mockRejectedValueOnce(Error('timeout')).mockResolvedValue({host_publication_required:false});
    await controller.invalidate();expect(controller.state.recovery).toBe('retry_begin');
    expect(port.publish).not.toHaveBeenCalled();expect(port.completeInvalidation).not.toHaveBeenCalled();
    await controller.invalidate();expect(controller.state.phase).toBe('idle');
    expect(port.publish).not.toHaveBeenCalled();expect(port.completeInvalidation).not.toHaveBeenCalled();
  });
  it('SCN-053/054: lost completion retries only the server completion after one acknowledged host invalidation',async()=>{
    const {events,port,controller}=fixture();await controller.prepare(selection);
    port.completeInvalidation=vi.fn().mockRejectedValueOnce(Error('timeout')).mockResolvedValue(undefined);
    await controller.invalidate();expect(controller.state.recovery).toBe('retry_completion');
    const hostUpdates=port.publish as ReturnType<typeof vi.fn>;
    expect(hostUpdates.mock.calls.filter(call=>call[0].kind)).toHaveLength(1);
    expect(port.invalidate).toHaveBeenCalledTimes(1);
    await controller.prepare(selection);expect(port.prepare).toHaveBeenCalledTimes(1);
    await controller.invalidate();expect(controller.state.phase).toBe('idle');
    expect(port.completeInvalidation).toHaveBeenCalledTimes(2);expect(port.completeInvalidation).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000000099');
    expect(hostUpdates.mock.calls.filter(call=>call[0].kind)).toHaveLength(1);expect(port.invalidate).toHaveBeenCalledTimes(1);
    expect(events.slice(-2)).toEqual(['invalidate-server','invalidate-host']);
  });
  it('SCN-053/058: host acknowledgement and matched completion both finish before the next publication',async()=>{
    const {events,port,controller}=fixture(), completing=defer();await controller.prepare(selection);
    port.completeInvalidation=vi.fn(async()=>{events.push('complete-start');await completing.promise;events.push('complete-ack');});
    const release=controller.invalidate();await vi.waitFor(()=>expect(events).toContain('complete-start'));
    const next=controller.prepare(selection);expect(port.prepare).toHaveBeenCalledTimes(1);expect(controller.state.phase).toBe('invalidating');
    completing.resolve();await release;await next;
    expect(events).toEqual(['prepare','validate','publish','invalidate-server','invalidate-host','complete-start','complete-ack','prepare','validate','publish']);
  });
  it('SCN-052/053/058: competing controller refusal and nonowner navigation leave accepted owner context intact',async()=>{
    const a=fixture(),b=fixture();await a.controller.prepare(selection);
    b.port.prepare=vi.fn().mockRejectedValue(Error('busy'));b.port.invalidate=vi.fn(async()=>({host_publication_required:false}));
    await b.controller.prepare(selection);expect(b.controller.state.code).toBe('busy');
    await b.controller.invalidate();expect(b.port.publish).not.toHaveBeenCalled();expect(b.port.completeInvalidation).not.toHaveBeenCalled();
    expect(a.controller.state.phase).toBe('accepted');await a.controller.sendQuestion();expect(a.port.question).toHaveBeenCalledTimes(1);
  });
  it('SCN-054/057: actual immutable adapter binds begin and completion to the old session and checks the exact receipt',async()=>{
    const id='00000000-0000-4000-8000-000000000099';
    const envelope=(data:unknown)=>({schema_version:'1',target:{target_id:'target',display_path:'/fixture'},snapshot_id:null,source_digest:null,observed_as_of:null,state:'available',code:null,retryable:false,data});
    const operation=vi.fn().mockResolvedValueOnce(envelope({invalidated:true,host_publication_required:true,invalidation_id:id}))
      .mockResolvedValueOnce(envelope({completed:true,invalidation_id:id})).mockResolvedValueOnce(envelope({completed:true,invalidation_id:'foreign'}))
      .mockResolvedValueOnce(envelope({invalidated:true,host_publication_required:false,invalidation_id:id}));
    const bridge={session:'old-session',operation} as unknown as CockpitBridge;
    const port=createHandoffPort(bridge);bridge.session='new-session';
    expect(await port.invalidate()).toEqual({host_publication_required:true,invalidation_id:id});await port.completeInvalidation(id);
    expect(operation).toHaveBeenNthCalledWith(1,{operation:'invalidate_context'},undefined,'old-session');
    expect(operation).toHaveBeenNthCalledWith(2,{operation:'complete_context_invalidation',invalidation_id:id},undefined,'old-session');
    await expect(port.completeInvalidation(id)).rejects.toThrow('dto_invalid');await expect(port.invalidate()).rejects.toThrow('dto_invalid');
  });
  it('SCN-011/013/025: actual handoff adapter checks the returned source/selection and disclosure before publication',async()=>{
    const source=packet(1);source.included=[{resource_id:selection.resource_id,path:'source.md'}];
    const response={schema_version:'1',target:source.target,snapshot_id:source.snapshot_id,source_digest:source.source_digest,
      observed_as_of:source.observed_as_of,state:'available',code:null,retryable:false,data:{packet:source}};
    const operation=vi.fn(async()=>response);
    const bridge={operation,request:async(action:()=>Promise<unknown>)=>action(),app:{getHostCapabilities:()=>({serverTools:{},updateModelContext:{},message:{text:{}}}),updateModelContext:vi.fn(async()=>({})),sendMessage:vi.fn(async()=>({isError:true}))}} as unknown as CockpitBridge;
    const port=createHandoffPort(bridge);expect(await port.prepare(selection,1)).toBe(source);
    expect(operation).toHaveBeenCalledWith({operation:'prepare_context',...Object.fromEntries(Object.entries(selection).filter(([key])=>key!=='target')),generation:1}, undefined, undefined);
    await expect(port.prepare({...selection,graph_ids:['foreign']},1)).rejects.toThrow('dto_invalid');
    source.artefact.resource.run_id='foreign';await expect(port.prepare(selection,1)).rejects.toThrow('dto_invalid');
    expect(bridge.app.updateModelContext).not.toHaveBeenCalled();expect(bridge.app.sendMessage).not.toHaveBeenCalled();
    await expect(port.question('deliberate test')).rejects.toThrow('message_rejected');
  });
  it('SCN-023: bridge bounds eight pending requests and a ten-second deadline, without retrying',async()=>{
    vi.useFakeTimers();try {
      const bridge=new CockpitBridge(), action=vi.fn(()=>new Promise<void>(()=>{}));
      const requests=Array.from({length:8},()=>bridge.request(action).catch(error=>error.message));
      await expect(bridge.request(action)).rejects.toThrow('busy');expect(action).toHaveBeenCalledTimes(8);
      await vi.advanceTimersByTimeAsync(9999);await expect(bridge.request(action)).rejects.toThrow('busy');
      await vi.advanceTimersByTimeAsync(1);expect(await Promise.all(requests)).toEqual(Array(8).fill('timeout'));
      await expect(bridge.request(async()=> 'recovered')).resolves.toBe('recovered');expect(action).toHaveBeenCalledTimes(8);
    } finally { vi.useRealTimers(); }
  });
  it('SCN-010/015/020: UI exposes unavailable exclusion and packet provenance, never sends merely from reading',async()=>{
    const{port,controller}=fixture();
    const envelope=<T,>(data:T):Envelope<T>=>({schema_version:'1',target:{target_id:'target',display_path:'/fixture'},snapshot_id:'snapshot',source_digest:'digest',observed_as_of:'now',state:'available',code:null,retryable:false,data});
    const detail=envelope<Detail>({run_id:'run-a',revision_id:'revision',lifecycle:'active',resources:[]});
    const document=envelope<DocumentData>(packet(1).artefact);
    const graph=envelope<GraphData>({run_id:'run-a',references:[{resource_id:'missing-node',run_id:'run-a',origin:'CG-MISSING',path:'.agdf/control/CONTEXT_GRAPH.md',node_id:'CG-MISSING',graph_digest:'digest',content_digest:null,content:null,state:'missing',code:'node_missing'}]});
    render(<ContextPanel read={vi.fn(async()=>graph) as ReadTransport} detail={detail} document={document} disabled={false} handoff={controller}/>);
    fireEvent.click(screen.getByRole('button',{name:'Verknüpfter Kontext ansehen'}));await screen.findAllByText('CG-MISSING');
    expect((screen.getByRole('button',{name:'Kontext übergeben'}) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('checkbox',{name:'Bewusst ausschließen'}));
    await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Kontext übergeben'}));});
    expect(port.prepare).toHaveBeenCalledWith({...selection,excluded_ids:['missing-node']},expect.any(Number));
    expect(port.question).not.toHaveBeenCalled();expect(screen.getByText(/Kontext vom Host bestätigt/)).toBeTruthy();
    await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Frage zu diesen Quellen senden'}));});expect(port.question).toHaveBeenCalledTimes(1);
  });
});
