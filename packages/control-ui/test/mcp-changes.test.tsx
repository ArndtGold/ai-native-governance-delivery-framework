import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
const callServerTool = vi.hoisted(() => vi.fn());
vi.mock('@modelcontextprotocol/ext-apps', () => ({ App: class {
  getHostCapabilities() { return { serverTools: true }; }
  callServerTool = callServerTool;
} }));
import { CockpitBridge } from '../src/mcp/transport';
import { App } from '../src/App';
import { fixtureMeta, runData, runScope } from './scoped-fixtures';

afterEach(() => { cleanup(); callServerTool.mockReset(); });
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

it.each([
  ['session_expired', 'Sitzung abgelaufen'],
  ['read_failed', 'Aktualisierung fehlgeschlagen'],
])('renders a background MCP %s with the last run data', async (code, heading) => {
  const bridge = new CockpitBridge(); bridge.session = '00000000-0000-0000-0000-000000000001';
  const failure = { schema_version: '2', target: null, snapshot_id: null, observed_as_of: null,
    source_digest: null, state: 'blocked', code, retryable: code !== 'session_expired', data: null, authorizes: false };
  callServerTool.mockImplementation(async ({ arguments: { operation } }) => {
    if (operation === 'snapshot') return { structuredContent: runScope(runData('run-a', 'Observed run')) };
    if (operation === 'freshness') return { isError: true, structuredContent: failure, content: [{ type: 'text', text: JSON.stringify(failure) }] };
    return { structuredContent: { ...fixtureMeta, snapshot_id: 'run-snapshot', data: { changed: false } } };
  });

  render(<App compact transport={bridge.read} initialRunId="run-a"/>);
  await screen.findByRole('heading', { name: 'Observed run' });
  fireEvent(document, new Event('visibilitychange'));

  await screen.findByText(heading, { selector: '.notice strong' });
  expect(screen.getByRole('heading', { name: 'Observed run' })).toBeTruthy();
  const retry = screen.queryByRole('button', { name: 'Aktualisierung fehlgeschlagen · Wiederholen' });
  if (code === 'session_expired') {
    expect(retry).toBeNull();
    expect(screen.getByText(/Angezeigte Inhalte gehören zum vorherigen Datenstand/)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Sitzung abgelaufen' }) as HTMLButtonElement).disabled).toBe(true);
  } else expect(retry).toBeTruthy();
});
