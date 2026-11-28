import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CompanionContinuationAction } from '../src/mcp/CompanionContinuationAction';
import { createCompanionContinuation } from '../src/mcp/companion-continuation';
import type { CockpitBridge } from '../src/mcp/transport';

const session = crypto.randomUUID(), targetId = 'sha256:' + 'a'.repeat(64);
const selection = { snapshot_id: crypto.randomUUID(), run_id: 'selected-run', revision_id: crypto.randomUUID() };

function fixture(operationKey = 'review.code') {
  const identity = { attempt_id: crypto.randomUUID(), run_id: selection.run_id, revision_id: selection.revision_id,
    target: { target_id: targetId, display_path: '/disposable' }, operation_key: operationKey };
  let state = 'ready';
  const callServerTool = vi.fn(async ({ arguments: args }: { arguments: Record<string, unknown> }) => {
    let detail = {};
    if (args.operation === 'reserve' && state === 'ready') {
      state = 'pending';
      detail = { reserved: true, ...identity };
    } else if (args.operation === 'publish' && args.attempt_id === identity.attempt_id) {
      detail = { send: true, ...identity };
    } else if (args.operation === 'cancel' && args.attempt_id === identity.attempt_id) {
      state = 'ready';
    }
    return { structuredContent: { schema_version: '1', authorizes: false, state, ...detail } };
  });
  const app = { callServerTool, getHostCapabilities: () => ({ serverTools: {}, message: { text: {} }, updateModelContext: {} }),
    updateModelContext: vi.fn(async (_context: unknown) => ({})), sendMessage: vi.fn(async (_request: unknown) => ({})) };
  const bridge = { app, session, request: (action: () => Promise<unknown>) => action() } as unknown as CockpitBridge;
  const port = createCompanionContinuation(bridge, session, targetId);
  return { app, identity, port, setState: (value: string) => { state = value; } };
}

afterEach(cleanup);

it('binds the click to the selected Run and never sends it twice', async () => {
  const { app, identity, port } = fixture();
  let received!: () => void;
  app.sendMessage.mockImplementation(() => new Promise(resolve => { received = () => resolve({}); }));
  render(<CompanionContinuationAction port={port} selection={selection} approval={false}/>);
  const button = await screen.findByRole('button', { name: 'Run fortsetzen' });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(await screen.findByText('Die Bestätigung von Codex steht noch aus.')).toBeTruthy();
  expect(app.callServerTool.mock.calls.map(([call]) => call.arguments.operation)).toEqual(['status', 'reserve', 'publish']);
  expect(app.updateModelContext.mock.calls[0][0]).toMatchObject({ structuredContent: { agdf_companion_continuation: {
    operation_key: 'review.code', revision_id: selection.revision_id, call: { tool: 'agdf_dispatch',
      arguments: { run_id: selection.run_id, primary_target: '/disposable', continuation_attempt_id: identity.attempt_id } },
  } } });
  expect(app.sendMessage).toHaveBeenCalledTimes(1);
  expect(app.sendMessage.mock.invocationCallOrder[0]).toBeGreaterThan(app.callServerTool.mock.invocationCallOrder[2]);
  await act(async () => { received(); });
  expect(screen.queryByRole('button', { name: 'Run fortsetzen' })).toBeNull();
});

it.each([
  ['pending', 'Die Bestätigung von Codex steht noch aus.'],
  ['running', 'Codex arbeitet bereits an diesem Run.'],
])('reopening projects %s without a second start', async (state, sentence) => {
  const { app, port, setState } = fixture();
  setState(state);
  render(<CompanionContinuationAction port={port} selection={selection} approval={false}/>);
  expect(await screen.findByText(sentence)).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Run fortsetzen' })).toBeNull();
  expect(app.callServerTool.mock.calls.map(([call]) => call.arguments.operation)).toEqual(['status']);
  expect(app.sendMessage).not.toHaveBeenCalled();
});

it('preserves pending when the host response is lost and the card reopens', async () => {
  const { app, port } = fixture();
  app.sendMessage.mockRejectedValueOnce(Error('reply_lost_after_acceptance'));
  const opened = render(<CompanionContinuationAction port={port} selection={selection} approval={false}/>);
  fireEvent.click(await screen.findByRole('button', { name: 'Run fortsetzen' }));
  await act(async () => {});
  expect(app.sendMessage).toHaveBeenCalledTimes(1);
  opened.unmount();
  render(<CompanionContinuationAction port={port} selection={selection} approval={false}/>);
  expect(await screen.findByText('Die Bestätigung von Codex steht noch aus.')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Run fortsetzen' })).toBeNull();
  expect(app.sendMessage).toHaveBeenCalledTimes(1);
});

it('keeps the running notice through a failed poll and restores the action on confirmed readiness', async () => {
  const { app, port, setState } = fixture();
  // An earlier build also sent interrupt_requested; it no longer selects a separate state.
  const working = { schema_version: '1', authorizes: false, state: 'running', interrupt_requested: true };
  app.callServerTool.mockResolvedValueOnce({ structuredContent: working });
  vi.useFakeTimers();
  try {
    render(<CompanionContinuationAction port={port} selection={selection} approval={false}/>);
    await act(async () => {});
    expect(screen.getByText('Codex arbeitet bereits an diesem Run.')).toBeTruthy();
    expect(screen.queryByText(/Der Abbruch wurde angefordert/)).toBeNull();
    setState('unavailable');
    await act(async () => { await vi.advanceTimersByTimeAsync(2500); });
    expect(screen.getByText('Codex arbeitet bereits an diesem Run.')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
    setState('ready');
    await act(async () => { await vi.advanceTimersByTimeAsync(2500); });
    expect(screen.getByRole('button', { name: 'Run fortsetzen' })).toBeTruthy();
    expect(app.sendMessage).not.toHaveBeenCalled();
  } finally {
    cleanup();
    vi.useRealTimers();
  }
});

it('checks the existing handoff without publishing another request', async () => {
  const { app, port, setState } = fixture();
  setState('pending');
  render(<CompanionContinuationAction port={port} selection={selection} approval={false}/>);
  const check = await screen.findByRole('button', { name: 'Übergabe prüfen' });

  fireEvent.click(check);
  expect(await screen.findByText(/Der Begleiter hat den Status geprüft/)).toBeTruthy();
  setState('unavailable');
  fireEvent.click(check);
  expect(await screen.findByText(/Der Status ließ sich gerade nicht prüfen/)).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Erneut versuchen' })).toBeNull();

  setState('running');
  fireEvent.click(check);
  expect(await screen.findByText('Codex arbeitet bereits an diesem Run.')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Übergabe prüfen' })).toBeNull();
  expect(app.callServerTool.mock.calls.map(([call]) => call.arguments.operation)).toEqual(['status', 'status', 'status', 'status']);
  expect(app.sendMessage).not.toHaveBeenCalled();
});

it('shows a claimed Run on the next read while the host response is still open', async () => {
  const { app, port, setState } = fixture();
  let rejectReply!: (error: Error) => void;
  app.sendMessage.mockImplementation(() => new Promise((_, reject) => { rejectReply = reject; }));
  vi.useFakeTimers();
  try {
    render(<CompanionContinuationAction port={port} selection={selection} approval={false}/>);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: 'Run fortsetzen' }));
    await act(async () => {});
    expect(app.sendMessage).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Die Bestätigung von Codex steht noch aus.')).toBeTruthy();

    setState('running');
    await act(async () => { await vi.advanceTimersByTimeAsync(2500); });
    expect(screen.getByText('Codex arbeitet bereits an diesem Run.')).toBeTruthy();

    await act(async () => { rejectReply(Error('reply_lost_after_acceptance')); });
    expect(screen.getByText('Codex arbeitet bereits an diesem Run.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Run fortsetzen' })).toBeNull();
    expect(app.sendMessage).toHaveBeenCalledTimes(1);
  } finally {
    cleanup();
    vi.useRealTimers();
  }
});

it('requests the existing decision without supplying an approval', async () => {
  const { app, port } = fixture('approval.record');
  render(<CompanionContinuationAction port={port} selection={selection} approval/>);
  fireEvent.click(await screen.findByRole('button', { name: 'Freigabe prüfen' }));
  await act(async () => {});
  expect(app.sendMessage).toHaveBeenCalledTimes(1);
  const request = app.sendMessage.mock.calls[0][0];
  expect(request).toMatchObject({ role: 'user', content: [{ type: 'text', text: expect.stringContaining('aktuelle Entscheidung') }] });
  expect(JSON.stringify(request)).not.toContain('Approval:');
});

it('cancels a confirmed local reservation when context publication fails before the send permit', async () => {
  const { app, port } = fixture();
  app.updateModelContext.mockRejectedValueOnce(Error('context_denied'));
  await expect(port.start(selection, new AbortController().signal)).resolves.toBe('unavailable');
  expect(app.callServerTool.mock.calls.map(([call]) => call.arguments.operation)).toEqual(['reserve', 'cancel']);
  expect(app.sendMessage).not.toHaveBeenCalled();
});

it('offers a deliberate retry only after a new status read verifies the Run is ready', async () => {
  const { app, port } = fixture();
  app.updateModelContext.mockRejectedValueOnce(Error('context_denied'));
  vi.useFakeTimers();
  try {
    render(<CompanionContinuationAction port={port} selection={selection} approval={false}/>);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: 'Run fortsetzen' }));
    await act(async () => {});
    expect(screen.queryByRole('button', { name: 'Erneut versuchen' })).toBeNull();
    expect(app.sendMessage).not.toHaveBeenCalled();

    await act(async () => { await vi.advanceTimersByTimeAsync(2500); });
    const retry = screen.getByRole('button', { name: 'Erneut versuchen' });
    expect(app.sendMessage).not.toHaveBeenCalled();
    fireEvent.click(retry);
    await act(async () => {});
    expect(app.sendMessage).toHaveBeenCalledTimes(1);
  } finally {
    cleanup();
    vi.useRealTimers();
  }
});

it('keeps a stale action disabled until the user reloads the Run', async () => {
  const { app, port } = fixture();
  const onReload = vi.fn();
  vi.spyOn(port, 'start').mockResolvedValueOnce('stale');
  vi.useFakeTimers();
  try {
    render(<CompanionContinuationAction port={port} selection={selection} approval={false} onReload={onReload}/>);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: 'Run fortsetzen' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(2500); });
    expect(screen.queryByRole('button', { name: 'Run fortsetzen' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Run neu laden' }));
    expect(onReload).toHaveBeenCalledTimes(1);
    expect(app.sendMessage).not.toHaveBeenCalled();
  } finally {
    cleanup();
    vi.useRealTimers();
  }
});
