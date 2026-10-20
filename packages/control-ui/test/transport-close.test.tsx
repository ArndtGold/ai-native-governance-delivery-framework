import { afterEach, expect, it, vi } from 'vitest';
const callServerTool = vi.hoisted(() => vi.fn());
vi.mock('@modelcontextprotocol/ext-apps', () => ({ App: class {
  getHostCapabilities() { return { serverTools: true }; }
  callServerTool = callServerTool;
} }));
import { CockpitBridge } from '../src/mcp/transport';

afterEach(() => { callServerTool.mockReset(); vi.useRealTimers(); });
const session = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const closed = { structuredContent: { state: 'available', data: { closed: true } } };

it('dispatches an undecided session close despite eight pending reads, without releasing read admission', async () => {
  const bridge = new CockpitBridge();
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  const reads = Array.from({ length: 8 }, () => bridge.request(() => held));
  callServerTool.mockResolvedValue(closed);
  try {
    await expect(bridge.operation({ operation: 'close' }, undefined, session(1))).resolves.toEqual(closed.structuredContent);
    expect(callServerTool).toHaveBeenCalledExactlyOnceWith({ name: 'agdf_cockpit_read', arguments: {
      operation: 'close', session_id: session(1),
    } }, { timeout: 10000, signal: undefined });
    await expect(bridge.request(async () => 'extra')).rejects.toThrow('busy');
  } finally { release(); await Promise.all(reads); }
});

it('coalesces simultaneous teardown signals only for their identical session', async () => {
  const bridge = new CockpitBridge();
  let release!: () => void;
  const held = new Promise(resolve => { release = () => resolve(closed); });
  callServerTool.mockImplementation(() => held);
  const first = bridge.operation({ operation: 'close' }, undefined, session(1));
  const duplicate = bridge.operation({ operation: 'close' }, undefined, session(1));
  try { expect(callServerTool).toHaveBeenCalledTimes(1); }
  finally { release(); await Promise.all([first, duplicate]); }
  callServerTool.mockResolvedValue(closed);
  await bridge.operation({ operation: 'close' }, undefined, session(2));
  expect(callServerTool).toHaveBeenLastCalledWith({ name: 'agdf_cockpit_read', arguments: {
    operation: 'close', session_id: session(2),
  } }, { timeout: 10000, signal: undefined });
});

it('keeps lifecycle admission bounded and does not extend its ten-second acknowledgement deadline', async () => {
  vi.useFakeTimers();
  const bridge = new CockpitBridge();
  callServerTool.mockImplementation(() => new Promise(() => {}));
  const closes = Array.from({ length: 8 }, (_, n) => bridge.operation({ operation: 'close' }, undefined, session(n + 1)).catch(error => error.message));
  await expect(bridge.operation({ operation: 'close' }, undefined, session(9))).rejects.toThrow('busy');
  expect(callServerTool).toHaveBeenCalledTimes(8);
  await vi.advanceTimersByTimeAsync(10000);
  expect(await Promise.all(closes)).toEqual(Array(8).fill('timeout'));
  callServerTool.mockResolvedValue(closed);
  await expect(bridge.operation({ operation: 'close' }, undefined, session(9))).resolves.toEqual(closed.structuredContent);
});

it('never retargets a late explicit close or treats an unconfirmed reply as closure', async () => {
  const bridge = new CockpitBridge(); bridge.session = session(1);
  let release!: () => void;
  callServerTool.mockImplementation(() => new Promise(resolve => { release = () => resolve(closed); }));
  const oldClose = bridge.operation({ operation: 'close' }, undefined, session(1));
  bridge.session = session(2);
  release(); await oldClose;
  expect(bridge.session).toBe(session(2));
  callServerTool.mockResolvedValue({ isError: true });
  await expect(bridge.operation({ operation: 'close' }, undefined, session(2))).rejects.toThrow('read_failed');
  await expect(bridge.operation({ operation: 'close', run_id: 'foreign' }, undefined, session(2))).rejects.toThrow('resource_denied');
  expect(callServerTool).toHaveBeenCalledTimes(2);
});


it('preserves only checked negative DTOs under isError and retains binding/session validation', async () => {
  const bridge = new CockpitBridge(); bridge.session = session(1);
  const value = { schema_version: '1', target: { target_id: 'target', display_path: '/fixture' }, snapshot_id: null,
    observed_as_of: null, source_digest: null, state: 'blocked', code: 'source_changed', retryable: true, data: null };
  callServerTool.mockResolvedValue({ isError: true, structuredContent: value });
  await expect(bridge.read('/api/snapshot', new AbortController().signal)).resolves.toEqual(value);
  callServerTool.mockResolvedValue({ isError: true, structuredContent: { ...value, state: 'available', data: { closed: true } } });
  await expect(bridge.operation({ operation: 'close' })).rejects.toThrow('read_failed');
  callServerTool.mockResolvedValue({ isError: true, structuredContent: { ...value, schema_version: 'forged' } });
  await expect(bridge.operation({ operation: 'snapshot' })).rejects.toThrow('dto_invalid');
  callServerTool.mockResolvedValue({ isError: true, structuredContent: value });
  await expect(bridge.read('/api/snapshot', new AbortController().signal, { target: 'other', snapshot: 'old' })).rejects.toThrow('dto_invalid');
  let release!: () => void;
  callServerTool.mockImplementation(() => new Promise(resolve => { release = () => resolve({ isError: true, structuredContent: value }); }));
  const old = bridge.operation({ operation: 'snapshot' }); bridge.session = session(2); release();
  await expect(old).rejects.toThrow('session_invalid');
});

it('retains the existing expired-session close acknowledgement without accepting error-flagged success', async () => {
  const bridge = new CockpitBridge(); bridge.session = session(1);
  const negative = { schema_version: '1', outcome: 'rejected', reason: 'session_expired', authorizes: false };
  callServerTool.mockResolvedValue({ isError: true, structuredContent: negative });
  await expect(bridge.operation({ operation: 'close' })).resolves.toEqual(negative);
  await expect(bridge.operation({ operation: 'snapshot' })).rejects.toThrow('session_expired');
});
