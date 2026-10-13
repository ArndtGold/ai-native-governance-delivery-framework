import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DecisionEntry } from '../src/mcp/DecisionEntry';
import type { CockpitBridge } from '../src/mcp/transport';
import { decisionReceipt, decisionView } from './decision-fixtures';
import type { DecisionSubmission } from '../src/mcp/decision-bootstrap';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function fixture(locale: 'en' | 'de' = 'en') {
  const app = { connect: vi.fn(async () => {}), getHostContext: () => ({}), getHostCapabilities: vi.fn<() => { serverTools: object; message?: { text: object }; updateModelContext?: object }>(() => ({ serverTools: {} })),
    callServerTool: vi.fn(), updateModelContext: vi.fn(async () => ({})), sendMessage: vi.fn(async () => ({})),
    ontoolresult: (_result: unknown) => {}, onhostcontextchanged: () => {}, onteardown: async () => ({}) };
  const operation = vi.fn(async () => ({ state: 'available', data: { closed: true } }));
  const bridge = { app, operation, request: (callback: () => Promise<unknown>) => callback(), session: '' } as unknown as CockpitBridge;
  const view = decisionView(locale);
  return { app, operation, bridge, view };
}

function approvedContinuation(f: ReturnType<typeof fixture>) {
  f.app.getHostCapabilities.mockReturnValue({ serverTools: {}, message: { text: {} }, updateModelContext: {} });
  const revision = crypto.randomUUID(), nextOperation = { type: 'prepare_gate_artifact', operation_key: 'artefact.author', actor: 'agent', effect: 'preparation', gate: 'TP' };
  f.app.callServerTool.mockImplementation(async ({ name, arguments: args }: { name: string; arguments: Record<string, unknown> }) => ({ structuredContent:
    name === 'agdf_decision_action' ? { outcome: 'accepted', receipt: decisionReceipt(f.view, args as unknown as DecisionSubmission), current: { available: true, status: 'open', revision_id: revision, next_operation: nextOperation } }
    : args.operation === 'presentation-document' ? { outcome: 'inspect_result', report: { available: true, target_id: f.view.target.target_id,
      run_id: f.view.binding.run_id, gate: f.view.binding.gate, revision_id: f.view.binding.expected_revision_id,
      presentation_id: f.view.binding.presentation_id, content_digest: f.view.document_digest, content: '# Exact approved snapshot', complete: true, next_cursor: null } }
    : { outcome: 'inspect_result', report: { binding: { target_id: f.view.target.target_id, run_id: f.view.binding.run_id, expected_revision_id: revision }, current: { status: 'open', next_operation: nextOperation } } } }));
}

it('retires only after the host confirms handoff, keeps the saved receipt, and does not close twice on teardown', async () => {
  const f = fixture(); approvedContinuation(f);
  let admit!: () => void;
  f.app.sendMessage.mockImplementation(() => new Promise(resolve => { admit = () => resolve({}); }));
  render(<DecisionEntry bridge={f.bridge}/>);
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  fireEvent.click(screen.getByRole('button', { name: f.view.labels.approve }));
  await screen.findByText(f.view.labels.nextWaiting);
  expect(f.operation).not.toHaveBeenCalled();
  expect(f.bridge.session).toBe(f.view.read_session_id);
  await act(async () => { admit(); });
  await screen.findByText(f.view.labels.nextRequested);
  expect(f.operation).toHaveBeenCalledExactlyOnceWith({ operation: 'close' }, undefined, f.view.read_session_id);
  expect(f.bridge.session).toBe('');
  expect(screen.getByText(f.view.labels.confirmed)).toBeTruthy();
  expect(screen.queryByRole('button', { name: f.view.labels.approve })).toBeNull();
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  expect(f.bridge.session).toBe(''); // An old bootstrap cannot resurrect the session.
  await act(async () => { await f.app.onteardown(); });
  expect(f.operation).toHaveBeenCalledTimes(1);
});

it('retains an unconfirmed handoff without closing or resubmitting the saved decision', async () => {
  const f = fixture(); approvedContinuation(f); f.app.sendMessage.mockResolvedValue({ isError: true });
  render(<DecisionEntry bridge={f.bridge}/>);
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  fireEvent.click(screen.getByRole('button', { name: f.view.labels.approve }));
  await screen.findByText(f.view.labels.nextUnavailable);
  expect(f.operation).not.toHaveBeenCalled();
  expect(f.app.callServerTool.mock.calls.filter(([c]) => c.name === 'agdf_decision_action')).toHaveLength(1);
});

it('keeps handoff success distinct from an unconfirmed session close', async () => {
  const f = fixture(); approvedContinuation(f); f.operation.mockRejectedValue(Error('close_ack_lost'));
  render(<DecisionEntry bridge={f.bridge}/>);
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  fireEvent.click(screen.getByRole('button', { name: f.view.labels.approve }));
  await screen.findByText(f.view.labels.nextRequested);
  await screen.findByText(f.view.labels.closeUnavailable);
  expect(screen.queryByText(f.view.labels.nextUnavailable)).toBeNull();
  expect(f.operation).toHaveBeenCalledTimes(1);
});

it('reads the exact historical presentation without restoring the closed decision session', async () => {
  const f = fixture(); approvedContinuation(f);
  (f.app as unknown as { requestDisplayMode: () => Promise<object> }).requestDisplayMode = async () => ({ mode: 'fullscreen' });
  f.app.getHostContext = () => ({ availableDisplayModes: ['fullscreen'] });
  render(<DecisionEntry bridge={f.bridge}/>);
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  fireEvent.click(screen.getByRole('button', { name: f.view.labels.approve }));
  await screen.findByText(f.view.labels.nextRequested);
  fireEvent.click(screen.getByRole('button', { name: f.view.labels.openDocument }));
  await screen.findByRole('heading', { name: 'Exact approved snapshot' });
  const call = f.app.callServerTool.mock.calls.find(([c]) => c.arguments.operation === 'presentation-document')![0];
  expect(call.arguments).toMatchObject({ target_id: f.view.target.target_id, run_id: f.view.binding.run_id,
    presentation_id: f.view.binding.presentation_id, expected_revision_id: f.view.binding.expected_revision_id });
  expect(f.operation).toHaveBeenCalledTimes(1); expect(f.bridge.session).toBe('');
});

it('does not retire a replacement when the old completed view close finishes late', async () => {
  const f = fixture(); approvedContinuation(f);
  let finish!: () => void;
  f.operation.mockImplementationOnce(() => new Promise(resolve => { finish = () => resolve({ state: 'available', data: { closed: true } }); }));
  render(<DecisionEntry bridge={f.bridge}/>);
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  fireEvent.click(screen.getByRole('button', { name: f.view.labels.approve })); await screen.findByText(f.view.labels.nextWaiting);
  const replacement = { ...f.view, session_id: crypto.randomUUID(), read_session_id: crypto.randomUUID(), generation: 2 };
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: replacement } }); finish(); });
  expect(f.bridge.session).toBe(replacement.read_session_id);
  expect(screen.getByRole('button', { name: f.view.labels.approve })).toBeTruthy();
  expect(f.operation).toHaveBeenCalledExactlyOnceWith({ operation: 'close' }, undefined, f.view.read_session_id);
});

it.each(['foreign', 'partial', 'repeated_cursor'] as const)('rejects %s historical document reads without reopening the retired view', async mode => {
  const f = fixture(); approvedContinuation(f);
  const original = f.app.callServerTool.getMockImplementation()!;
  f.app.callServerTool.mockImplementation(async input => {
    const result = await original(input);
    if (input.arguments.operation === 'presentation-document') {
      const report = result.structuredContent.report as Record<string, unknown>;
      if (mode === 'foreign') report.presentation_id = crypto.randomUUID();
      else { report.complete = false; report.next_cursor = mode === 'partial' ? null : 'same-cursor'; }
    }
    return result;
  });
  render(<DecisionEntry bridge={f.bridge}/>);
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  fireEvent.click(screen.getByRole('button', { name: f.view.labels.approve })); await screen.findByText(f.view.labels.nextRequested);
  fireEvent.click(screen.getByRole('button', { name: f.view.labels.openDocument }));
  await screen.findByText(f.view.labels.docUnavailable);
  expect(f.operation).toHaveBeenCalledTimes(1); expect(f.bridge.session).toBe('');
  expect(screen.queryByRole('heading', { name: 'Exact approved snapshot' })).toBeNull();
});

it('coalesces page disposal, SDK teardown and React unmount; late results cannot restore a retired view', async () => {
  const f = fixture();
  let release!: () => void;
  f.operation.mockImplementation(() => new Promise(resolve => { release = () => resolve({ state: 'available', data: { closed: true } }); }));
  const rendered = render(<DecisionEntry bridge={f.bridge}/>);
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  let teardown!: Promise<unknown>;
  act(() => {
    window.dispatchEvent(new Event('pagehide'));
    window.dispatchEvent(new Event('pagehide'));
    teardown = f.app.onteardown();
    f.app.ontoolresult({ _meta: { agdf_decision: { ...f.view, generation: 2 } } });
  });
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(f.bridge.session).toBe('');
  rendered.unmount();
  expect(f.operation).toHaveBeenCalledExactlyOnceWith({ operation: 'close' }, undefined, f.view.read_session_id);
  release();
  await expect(teardown).resolves.toEqual({});
});

it.each(['en', 'de'] as const)('uses readable %s Chat text with internal context after a bound approval', async locale => {
  const f = fixture(locale); f.app.getHostCapabilities.mockReturnValue({ serverTools: {}, message: { text: {} }, updateModelContext: {} });
  const revision = crypto.randomUUID(), nextOperation = { type: 'author_gate_artifact', operation_key: 'artefact.author', actor: 'agent', effect: 'preparation', gate: 'TP' };
  f.app.callServerTool.mockImplementation(async ({ name, arguments: args }: { name: string; arguments: Record<string, unknown> }) => ({ structuredContent:
    name === 'agdf_decision_action' ? { outcome: 'accepted', receipt: decisionReceipt(f.view, args as unknown as DecisionSubmission), current: { available: true, status: 'open', revision_id: revision, next_operation: nextOperation } }
    : { outcome: 'inspect_result', report: { binding: { target_id: f.view.target.target_id, run_id: f.view.binding.run_id, expected_revision_id: revision }, current: { status: 'open', next_operation: nextOperation } } } }));
  render(<DecisionEntry bridge={f.bridge}/>);
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  fireEvent.click(screen.getByRole('button', { name: f.view.labels.approve }));
  await screen.findByText(f.view.labels.nextRequested);
  const sent = f.app.sendMessage.mock.calls[0] as unknown as [{ content: { text: string }[] }];
  expect(sent[0].content[0].text).toMatch(locale === 'de' ? /freigegeben\. Weiter mit/ : /approved\. Continue with/);
  expect(sent[0].content[0].text).not.toMatch(/Approval:|Redispatch|synthetic|revision|sha256/);
  expect(JSON.stringify(f.app.updateModelContext.mock.calls)).not.toContain(f.view.read_session_id);
});

it.each(['missing_context', 'denied_context', 'retired_during_context'] as const)('does not send an unbound follow-up on %s or repeat the saved approval', async mode => {
  const f = fixture(); f.app.getHostCapabilities.mockReturnValue({ serverTools: {}, message: { text: {} }, ...(mode === 'missing_context' ? {} : { updateModelContext: {} }) });
  const revision = crypto.randomUUID(), nextOperation = { type: 'author_gate_artifact', operation_key: 'artefact.author', actor: 'agent', effect: 'preparation', gate: 'TP' };
  f.app.callServerTool.mockImplementation(async ({ name, arguments: args }: { name: string; arguments: Record<string, unknown> }) => ({ structuredContent:
    name === 'agdf_decision_action' ? { outcome: 'accepted', receipt: decisionReceipt(f.view, args as unknown as DecisionSubmission), current: { available: true, status: 'open', revision_id: revision, next_operation: nextOperation } }
    : { outcome: 'inspect_result', report: { binding: { target_id: f.view.target.target_id, run_id: f.view.binding.run_id, expected_revision_id: revision }, current: { status: 'open', next_operation: nextOperation } } } }));
  if (mode === 'denied_context') f.app.updateModelContext.mockRejectedValue(Error('host_context_denied'));
  if (mode === 'retired_during_context') f.app.updateModelContext.mockImplementation(async () => { await f.app.onteardown(); return {}; });
  render(<DecisionEntry bridge={f.bridge}/>);
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  fireEvent.click(screen.getByRole('button', { name: f.view.labels.approve }));
  await act(async () => {});
  expect(f.app.sendMessage).not.toHaveBeenCalled();
  expect(f.app.callServerTool.mock.calls.filter(([input]) => input.name === 'agdf_decision_action')).toHaveLength(1);
  if (mode === 'denied_context') await screen.findByText(f.view.labels.nextUnavailable);
});

it.each(['matched', 'foreign', 'stale', 'changed', 'human'] as const)('revalidates %s Core state before automatic post-approval continuation; mounting does not send work', async mode => {
  const f = fixture(); f.app.getHostCapabilities.mockReturnValue({ serverTools: {}, message: { text: {} }, updateModelContext: {} });
  const revision = crypto.randomUUID(), nextOperation = { type: 'author_gate_artifact', operation_key: 'artefact.author', actor: mode === 'human' ? 'human' : 'agent', effect: mode === 'human' ? 'decision' : 'preparation', gate: 'TP' };
  if (mode === 'human') { nextOperation.type = 'human_gate_decision'; nextOperation.operation_key = 'approval.record'; }
  f.app.callServerTool.mockImplementation(async ({ name, arguments: args }: { name: string; arguments: Record<string, unknown> }) => ({ structuredContent:
    name === 'agdf_decision_action' ? { outcome: 'accepted', receipt: decisionReceipt(f.view, args as unknown as DecisionSubmission),
      current: { available: true, status: 'open', revision_id: revision, next_operation: nextOperation } }
    : { outcome: 'inspect_result', report: { binding: { target_id: mode === 'foreign' ? 'sha256:' + 'b'.repeat(64) : f.view.target.target_id,
      run_id: f.view.binding.run_id, expected_revision_id: mode === 'stale' ? crypto.randomUUID() : revision },
      current: { status: 'open', next_operation: mode === 'changed' ? { ...nextOperation, gate: 'QA' } : nextOperation } } } }));
  render(<DecisionEntry bridge={f.bridge}/>);
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  expect(f.app.sendMessage).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: f.view.labels.approve })); await screen.findByText(f.view.labels.confirmed);
  expect(screen.queryByRole('button', { name: f.view.labels.nextStep })).toBeNull();
  await screen.findByText(['matched', 'human'].includes(mode) ? f.view.labels.nextRequested : f.view.labels.nextUnavailable);
  expect(f.app.callServerTool).toHaveBeenCalledTimes(2);
  expect(f.app.callServerTool.mock.calls[1][0].arguments.expected_revision_id).toBe(revision);
  if (['matched', 'human'].includes(mode)) {
    expect(f.app.sendMessage).toHaveBeenCalledTimes(1);
    const sent = f.app.sendMessage.mock.calls[0] as unknown as [{ content: { text: string }[] }];
    expect(sent[0].content[0].text).toContain('approved. Continue with');
    expect(sent[0].content[0].text).not.toContain(revision); expect(sent[0].content[0].text).not.toContain(f.view.target.display_path);
    const packet = f.app.updateModelContext.mock.calls[0] as unknown as [{ structuredContent: { agdf_continuation: Record<string, unknown> } }];
    expect(packet[0].structuredContent.agdf_continuation).toMatchObject({ authorizes: false, run_id: f.view.binding.run_id, expected_revision_id: revision, next_operation: nextOperation });
    expect(String(packet[0].structuredContent.agdf_continuation.instruction)).toContain('never execute a human next_operation automatically');
    expect(sent[0].content[0].text).not.toContain('Approval:');
  } else expect(f.app.sendMessage).not.toHaveBeenCalled();
});

it('does not retire a live view on ordinary visibility or display-mode changes', async () => {
  const f = fixture(); render(<DecisionEntry bridge={f.bridge}/>);
  await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  act(() => { document.dispatchEvent(new Event('visibilitychange')); f.app.onhostcontextchanged(); });
  expect(screen.getByRole('button', {name:f.view.labels.approve})).toBeTruthy();
  expect(f.operation).not.toHaveBeenCalled();
});

it.each(['teardown', 'replacement'] as const)('cancels a queued continuation on %s without resubmitting the saved approval', async mode => {
  const f = fixture(); f.app.getHostCapabilities.mockReturnValue({ serverTools: {}, message: { text: {} }, updateModelContext: {} });
  const revision = crypto.randomUUID(), nextOperation = { type: 'prepare_gate_artifact', operation_key: 'artefact.author', actor: 'agent', effect: 'preparation', gate: 'TP' };
  f.app.callServerTool.mockImplementation(async ({ name, arguments: args }: { name: string; arguments: Record<string, unknown> }) => ({ structuredContent:
    name === 'agdf_decision_action' ? { outcome: 'accepted', receipt: decisionReceipt(f.view, args as unknown as DecisionSubmission),
      current: { available: true, status: 'open', revision_id: revision, next_operation: nextOperation } }
    : { outcome: 'inspect_result', report: { binding: { target_id: f.view.target.target_id, run_id: f.view.binding.run_id, expected_revision_id: revision },
      current: { status: 'open', next_operation: nextOperation } } } }));
  let signal!: AbortSignal, timeout!: number;
  f.app.sendMessage.mockImplementation((...args: unknown[]) => new Promise((_, reject) => {
    const options = args[1] as { signal: AbortSignal; timeout: number }; signal = options.signal; timeout = options.timeout;
    signal.addEventListener('abort', () => reject(Error('view_retired')), { once: true });
  }));
  render(<DecisionEntry bridge={f.bridge}/>); await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: f.view } }); });
  fireEvent.click(screen.getByRole('button', { name: f.view.labels.approve })); await screen.findByText(f.view.labels.nextWaiting);
  await act(async () => {}); expect(f.app.sendMessage).toHaveBeenCalledTimes(1); expect(timeout).toBeGreaterThan(10_000);
  if (mode === 'teardown') await act(async () => { await f.app.onteardown(); });
  else await act(async () => { f.app.ontoolresult({ _meta: { agdf_decision: { ...f.view, session_id: crypto.randomUUID(), generation: 2 } } }); });
  expect(signal.aborted).toBe(true); expect(f.app.sendMessage).toHaveBeenCalledTimes(1);
  expect(f.app.callServerTool.mock.calls.filter(([input]) => input.name === 'agdf_decision_action')).toHaveLength(1);
});

it('removes the old lifecycle listener on unmount and closes a newly mounted view independently', async () => {
  const first = fixture(), second = fixture();
  const rendered = render(<DecisionEntry bridge={first.bridge}/>);
  await act(async () => { first.app.ontoolresult({ _meta: { agdf_decision: first.view } }); });
  rendered.unmount();
  second.view.read_session_id = crypto.randomUUID();
  render(<DecisionEntry bridge={second.bridge}/>);
  await act(async () => { second.app.ontoolresult({ _meta: { agdf_decision: second.view } }); });
  act(() => { window.dispatchEvent(new Event('pagehide')); });
  expect(first.operation).toHaveBeenCalledTimes(1);
  expect(second.operation).toHaveBeenCalledExactlyOnceWith({ operation: 'close' }, undefined, second.view.read_session_id);
});
