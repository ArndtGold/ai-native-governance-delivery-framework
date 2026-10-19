import { it, expect, vi } from 'vitest';
import { createViewCloser } from '../src/mcp/view-close';
import type { CockpitBridge } from '../src/mcp/transport';
import type { HandoffController } from '../src/mcp/handoff';

function fixture(phase = 'idle') {
  const events: string[] = [];
  const envelope = (closed: boolean) => ({ schema_version: '1', target: { target_id: 'target', display_path: '/fixture' },
    snapshot_id: null, source_digest: null, observed_as_of: null, state: 'available', retryable: false, code: null, data: { closed } });
  const handoff = { invalidate: vi.fn(async () => { events.push('invalidate'); }), snapshot: () => ({ phase }) };
  const bridge = { session: 'other-view', operation: vi.fn(async () => { events.push('close'); return envelope(true); }) };
  return { events, handoff, bridge, envelope, closer: createViewCloser(bridge as unknown as CockpitBridge, handoff as unknown as HandoffController, 'original-view', 'target') };
}
it('joins explicit and Host shutdown on the original view, waiting for confirmed release', async () => {
  const f = fixture(); let release!: () => void;
  f.handoff.invalidate.mockImplementation(async () => { f.events.push('invalidate'); await new Promise<void>(resolve => { release = resolve; }); });
  const a = f.closer.close(), b = f.closer.close(), c = f.closer.close(true);
  expect(f.bridge.operation).not.toHaveBeenCalled(); release(); await Promise.all([a, b, c]);
  expect(f.events).toEqual(['invalidate', 'close']);
  expect(f.bridge.operation).toHaveBeenCalledExactlyOnceWith({ operation: 'close' }, undefined, 'original-view');
  await f.closer.close(true); expect(f.bridge.operation).toHaveBeenCalledTimes(1);
});
it('refuses explicit closure on uncertain context release, including repeat attempts', async () => {
  const f = fixture('uncertain');
  await expect(f.closer.close()).rejects.toThrow('context_cleanup_uncertain');
  await expect(f.closer.close()).rejects.toThrow('context_cleanup_uncertain');
  expect(f.handoff.invalidate).toHaveBeenCalledTimes(1); expect(f.bridge.operation).not.toHaveBeenCalled();
});
it('preserves forced Host owner-loss retirement without falsely confirming clean release', async () => {
  const f = fixture('uncertain');
  const result = await Promise.allSettled([f.closer.close(), f.closer.close(true), f.closer.close(true)]);
  expect(result.every(value => value.status === 'rejected')).toBe(true);
  expect(f.bridge.operation).toHaveBeenCalledTimes(1);
  await expect(f.closer.close()).rejects.toThrow('context_cleanup_uncertain');
});
it('rejects an unconfirmed Core close and never repeats that ambiguous operation', async () => {
  const f = fixture(); f.bridge.operation.mockResolvedValue(f.envelope(false));
  await expect(f.closer.close()).rejects.toThrow('session_close_unconfirmed');
  await expect(f.closer.close(true)).rejects.toThrow('session_close_unconfirmed');
  expect(f.bridge.operation).toHaveBeenCalledTimes(1);
});
it('does not accept a retirement acknowledgement for a different target', async () => {
  const f = fixture(); f.bridge.operation.mockResolvedValue({ ...f.envelope(true), target: { target_id: 'foreign', display_path: '/other' } });
  await expect(f.closer.close()).rejects.toThrow('dto_invalid');
});
