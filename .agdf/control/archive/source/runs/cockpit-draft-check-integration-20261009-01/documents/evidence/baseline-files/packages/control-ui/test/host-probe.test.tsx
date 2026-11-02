import { afterEach, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { HostProbe } from '../src/mcp/HostProbe';
import type { CockpitBridge } from '../src/mcp/transport';
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
