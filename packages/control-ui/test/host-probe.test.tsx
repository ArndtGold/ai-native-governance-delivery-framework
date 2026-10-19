import { afterEach, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { HostProbe } from '../src/mcp/HostProbe';
import type { CockpitBridge } from '../src/mcp/transport';
import { SdkTrace } from '../src/mcp/sdk-trace';
afterEach(cleanup);
it('SCN-014/053: metadata diagnostics expose no bypass around publication ownership',()=>{
  const app = { getHostVersion: () => ({name:'fixture',version:'fixture'}), getHostContext: () => ({displayMode:'fullscreen'}),
    getHostCapabilities: () => ({updateModelContext:{},message:{text:{}}}),
    updateModelContext: vi.fn(), sendMessage: vi.fn() };
  const bridge={app} as unknown as CockpitBridge;
  render(<HostProbe bridge={bridge}/>);
  fireEvent.click(screen.getByText('Host-Verbindung prüfen'));
  expect(screen.queryAllByRole('button',{hidden:true})).toHaveLength(0);
  expect(app.updateModelContext).not.toHaveBeenCalled(); expect(app.sendMessage).not.toHaveBeenCalled();
  expect(screen.getByText(/Gemeldete Host-Fähigkeiten/)).toBeTruthy();
});
it('requests public SDK teardown once after deliberate recording, without claiming host acceptance',async()=>{
  let finish!: () => void;
  const app={getHostVersion:()=>({name:'fixture',version:'fixture'}),getHostContext:()=>({displayMode:'fullscreen'}),
    getHostCapabilities:()=>({}),requestTeardown:vi.fn(),
    updateModelContext:vi.fn(),sendMessage:vi.fn()};
  const close=vi.fn(()=>new Promise<void>(resolve=>{finish=resolve;}));
  render(<HostProbe bridge={{app} as unknown as CockpitBridge} trace={new SdkTrace(vi.fn())} onClose={close}/>);
  const button=screen.getByRole('button',{name:'Sitzung beenden und Host schließen lassen',hidden:true}) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  fireEvent.click(button);expect(app.requestTeardown).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'SDK-Nachweis aufzeichnen',hidden:true}));
  fireEvent.click(button);fireEvent.click(button);
  expect(close).toHaveBeenCalledTimes(1);expect(app.requestTeardown).not.toHaveBeenCalled();expect(button.disabled).toBe(true);
  finish();await waitFor(()=>expect(screen.getByText(/Bereinigung bestätigt und Host-Anfrage gesendet/)).toBeTruthy());
  expect(button.disabled).toBe(true);expect(app.updateModelContext).not.toHaveBeenCalled();expect(app.sendMessage).not.toHaveBeenCalled();
});
it('shows a failed public SDK teardown send without retrying or claiming closure',async()=>{
  const app={getHostVersion:()=>({name:'fixture',version:'fixture'}),getHostContext:()=>({displayMode:'fullscreen'}),
    getHostCapabilities:()=>({}),requestTeardown:vi.fn().mockRejectedValue(Error('closed'))};
  const close=vi.fn().mockRejectedValue(Error('context_cleanup_uncertain'));
  render(<HostProbe bridge={{app} as unknown as CockpitBridge} trace={new SdkTrace(vi.fn())} onClose={close}/>);
  fireEvent.click(screen.getByRole('button',{name:'SDK-Nachweis aufzeichnen',hidden:true}));
  const button=screen.getByRole('button',{name:'Sitzung beenden und Host schließen lassen',hidden:true}) as HTMLButtonElement;
  fireEvent.click(button);await waitFor(()=>expect(screen.getByText(/Keine automatische Wiederholung/)).toBeTruthy());
  expect(close).toHaveBeenCalledTimes(1);expect(app.requestTeardown).not.toHaveBeenCalled();expect(button.disabled).toBe(true);
});
it('starts diagnostic output only through the explicit button without sending a message or model context',()=>{
  const emit=vi.fn(), trace=new SdkTrace(emit);
  trace.observe('out',{method:'ui/initialize'});
  const app={getHostVersion:()=>({name:'fixture',version:'fixture'}),getHostContext:()=>({displayMode:'fullscreen'}),
    getHostCapabilities:()=>({logging:{}}),updateModelContext:vi.fn(),sendMessage:vi.fn()};
  render(<HostProbe bridge={{app} as unknown as CockpitBridge} trace={trace}/>);
  fireEvent.click(screen.getByText('Host-Verbindung prüfen'));
  expect(emit).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'SDK-Nachweis aufzeichnen'}));
  expect(emit).toHaveBeenCalledTimes(1);
  expect(JSON.parse(screen.getByLabelText('SDK-Nachrichten dieser Ansicht').textContent!)).toMatchObject({authorizes:false,logging:true,truncated:false});
  expect(app.updateModelContext).not.toHaveBeenCalled(); expect(app.sendMessage).not.toHaveBeenCalled();
});
