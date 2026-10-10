import { expect, it, vi } from 'vitest';
const callServerTool = vi.hoisted(() => vi.fn());
vi.mock('@modelcontextprotocol/ext-apps', () => ({ App: class {
  getHostCapabilities() { return { serverTools: true }; }
  callServerTool = callServerTool;
} }));
import { CockpitBridge } from '../src/mcp/transport';
import { fixtureMeta } from './scoped-fixtures';
it('MCP change wait forwards only bound session/snapshot and cancellation; it does not replace source registrations', async () => {
  const bridge = new CockpitBridge(); bridge.session = '00000000-0000-0000-0000-000000000001';
  callServerTool.mockResolvedValue({ structuredContent: { ...fixtureMeta, data: { changed: true }, authorizes: false } });
  const controller = new AbortController();
  const result = await bridge.read.waitForChanges!('snapshot', controller.signal, 'target');
  expect(result.data?.changed).toBe(true);
  expect(callServerTool).toHaveBeenCalledWith({ name: 'agdf_cockpit_read', arguments: {
    operation: 'changes', snapshot_id: 'snapshot', session_id: bridge.session,
  } }, { timeout: 10000, signal: controller.signal });
  callServerTool.mockResolvedValue({ structuredContent: { ...fixtureMeta, data: { changed: 'forged' } } });
  await expect(bridge.read.waitForChanges!('snapshot', controller.signal, 'target')).rejects.toThrow('dto_invalid');
});
