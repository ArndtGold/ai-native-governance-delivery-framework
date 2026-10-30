import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DecisionCard, type DecisionPort } from '../src/mcp/DecisionCard';
import { matchedDecisionReceipt, readDecisionBootstrap, type DecisionSubmission } from '../src/mcp/decision-bootstrap';
import { decisionReceipt, decisionView } from './decision-fixtures';
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
it('renders the exact prepared Markdown once; preview has no action and unqualified primary has a disabled action', () => {
  const view = decisionView('en'), p = port();
  view.summary = '# One prepared decision\n\nExact source summary.\n\nReply Approval: SD.';
  view.delivery_state = 'preview'; view.enabled_actions = [];
  const mounted = render(<DecisionCard view={view} port={p}/>);
  expect(screen.getAllByText('Exact source summary.')).toHaveLength(1);
  expect(screen.queryByRole('button', { name: view.labels.approve })).toBeNull();
  expect(p.submit).not.toHaveBeenCalled();
  mounted.rerender(<DecisionCard view={{ ...view, delivery_state: 'ui_primary', capability: 'not_qualified' }} port={p}/>);
  expect(screen.getAllByText('Exact source summary.')).toHaveLength(1);
  expect((screen.getByRole('button', { name: view.labels.approve }) as HTMLButtonElement).disabled).toBe(true);
  mounted.rerender(<DecisionCard view={{ ...view, delivery_state: 'retired' }} port={p}/>);
  expect(screen.queryByText('Exact source summary.')).toBeNull();
  expect(screen.queryByRole('button', { name: view.labels.approve })).toBeNull();
});
it('a receipt-confirmed new primary becomes passive and opens its document only as history', async () => {
  const view = decisionView('en'), p = port(); view.delivery_state = 'ui_primary';
  view.summary = '# One current decision\n\nUnique summary before the actual decision.\n\nReply Approval: SD.';
  p.saved = vi.fn(); p.pending = vi.fn();
  p.submit = vi.fn(async input => ({ outcome: 'accepted', receipt: decisionReceipt(view, input), current: { available: true } }));
  render(<DecisionCard view={view} port={p}/>);
  fireEvent.click(screen.getByRole('button', { name: view.labels.approve }));
  await waitFor(() => expect(p.saved).toHaveBeenCalledTimes(1));
  expect(p.pending).toHaveBeenCalledWith(true);
  expect(screen.queryByText('Unique summary before the actual decision.')).toBeNull();
  expect(screen.queryByRole('button', { name: view.labels.approve })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: view.labels.openDocument }));
  await waitFor(() => expect(screen.getByRole('heading', { name: /Historical version/ })).toBeTruthy());
});
function port(): DecisionPort {
  return { submit: vi.fn(async () => ({ outcome: 'effect_unknown' })), document: vi.fn(async () => '# Exact presented document\n\nReadable complete content.'),
    inspect: vi.fn(async () => ({ status: 'absent' })), expand: vi.fn(async () => {}) };
}
describe.each(['en', 'de'] as const)('Decision card %s', locale => {
  it('shows every accepted-deviation risk before its single deliberate action', async () => {
    const view = decisionView(locale), p = port();
    view.binding.gate = 'QA';
    view.labels = { ...view.labels, approve: view.labels.approveWithDeviations, confirmed: view.labels.confirmedWithDeviations };
    view.decision_heading = view.labels.deviationAcceptanceIntro;
    view.decision_brief = 'QA remains revise.\n\n- MISSING-NATIVE: Native closure is not observed.\n  Consequence: Reader remains until expiry.\n  Follow-up: Observe closure.\n  Owner: Runtime evidence owner.';
    p.submit = vi.fn(async input => ({ outcome: 'accepted', receipt: { ...decisionReceipt(view, input), schema_version: '3' }, current: { available: true } }));
    render(<DecisionCard view={view} port={p}/>);
    expect(screen.getByText(/Native closure is not observed/).closest('details')).toBeNull();
    expect(screen.getByText(/Reader remains until expiry/)).toBeTruthy();
    const button = screen.getByRole('button', { name: view.labels.approveWithDeviations });
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: view.labels.reject })).toBeNull();
    fireEvent.click(button);
    expect(p.submit).toHaveBeenCalledTimes(1);
    expect(vi.mocked(p.submit).mock.calls[0][0].action).toBe('approve');
    await screen.findByText(view.labels.confirmedWithDeviations);
  });
  it('shows the complete verified archived comparison without turning it into a decision or current document', () => {
    const view = decisionView(locale), p = port();
    view.comparison = { state: 'available', previous_revision_id: crypto.randomUUID(), previous_digest: 'sha256:' + 'b'.repeat(64),
      current_digest: view.document_digest!, unchanged: false, previous_text: '# Archived source\n\nComplete previous version.\n\n<script>untrusted</script>' };
    expect(readDecisionBootstrap({ _meta: { agdf_decision: view } })).toBeTruthy();
    render(<DecisionCard view={view} port={p}/>);
    expect(screen.getByText(view.labels.machineComparison)).toBeTruthy(); expect(screen.getByText(view.labels.documentChanged)).toBeTruthy();
    expect(screen.getByText('Complete previous version.')).toBeTruthy(); expect(document.querySelector('script')).toBeNull();
    fireEvent.click(screen.getByText(view.labels.previousDocument)); expect(p.submit).not.toHaveBeenCalled();
    const wrong = structuredClone(view); if (wrong.comparison.state === 'available') wrong.comparison.current_digest = 'sha256:' + 'b'.repeat(64);
    expect(readDecisionBootstrap({ _meta: { agdf_decision: wrong } })).toBeNull();
  });
  it('puts the shared authored brief and consequence before choices, with technical evidence disclosed on demand', () => {
    const view = decisionView(locale), p = port();
    view.decision_heading = locale === 'de' ? 'Lösungsdesign prüfen und entscheiden' : 'Review solution design';
    view.gate_title = locale === 'de' ? 'Lösungsdesign' : 'Solution design';
    view.approval_effect = locale === 'de' ? 'Danach wird der Aufgabenplan vorbereitet.' : 'The task plan is prepared next.';
    view.approval_effect_label = locale === 'de' ? 'Nach Freigabe erlaubt' : 'Allowed after approval';
    view.decision_brief = '- Goal: Preserve the selected filter.\n- Proposal: Reuse the existing filter store.';
    view.summary += '\nAC-001 technical coverage remains complete.\n';
    render(<DecisionCard view={view} port={p}/>);
    expect(screen.getByRole('heading', { level: 1, name: view.decision_heading }).textContent).toBe(view.decision_heading);
    expect(screen.getByText(view.approval_effect, { exact: false }).textContent).toContain(view.approval_effect_label);
    const evidence = screen.getByText(/AC-001 technical/).closest('details');
    expect(evidence?.open).toBe(false); expect(evidence?.querySelector('summary')?.textContent).toBe(view.labels.sources);
    expect(p.submit).not.toHaveBeenCalled();
  });
  it('shows full summary and one deliberate approval; reading never decides', async () => {
    const view = decisionView(locale), p = port(); render(<DecisionCard view={view} port={p}/>);
    expect(screen.getByText('Full intended change.')).toBeTruthy();
    expect(screen.getByText('No applicable open issue.')).toBeTruthy();
    expect(document.querySelector('script')).toBeNull();
    expect(screen.getByRole('button', { name: view.labels.approve }).getAttribute('type')).toBe('button');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: view.labels.request_change })).toBeNull();
    expect(screen.queryByRole('button', { name: view.labels.reject })).toBeNull();
    const open = screen.getByRole('button', { name: view.labels.openDocument }); fireEvent.click(open);
    const heading = await screen.findByRole('heading', { name: `${view.labels.documentTitle} · SD` });
    await waitFor(() => expect(document.activeElement).toBe(heading)); expect(p.expand).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: view.labels.back }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: view.labels.openDocument })); expect(p.submit).not.toHaveBeenCalled();
  });
  it.each(['approve'] as const)('saves %s once and preserves exact intent in its UUID-bound receipt', async action => {
    const view = decisionView(locale), p = port();
    view.approval_effect = 'Preparing the task plan is a possible consequence of approval.';
    let finish!: (reply: Record<string, unknown>) => void;
    p.submit = vi.fn(() => new Promise<Record<string, unknown>>(resolve => { finish = resolve; }));
    render(<DecisionCard view={view} port={p}/>);
    const button = screen.getByRole('button', { name: view.labels[action] });
    fireEvent.click(button); fireEvent.click(button); expect(p.submit).toHaveBeenCalledTimes(1);
    const input = vi.mocked(p.submit).mock.calls[0][0];
    expect(input.action).toBe(action); expect(input.comment).toBeUndefined();
    expect(input.presentation_id).toBe(view.binding.presentation_id);
    await act(async () => finish({ outcome: 'accepted', receipt: decisionReceipt(view, input), current: { available: true } }));
    expect(screen.getByText(view.labels.confirmed)).toBeTruthy();
    expect(screen.queryByText(view.approval_effect, { exact: false })).toBeNull();
    expect(screen.queryByRole('button', { name: view.labels.approve })).toBeNull(); expect(p.submit).toHaveBeenCalledTimes(1);
  });
  it.each(['unsupported', 'supported', 'rejected', 'closeout', 'human'] as const)('automatically resumes %s once after confirmed approval, without another click or uncertain-message retry', async mode => {
    const view = decisionView(locale), p = port();
    const next = { available: true, status: 'open', revision_id: crypto.randomUUID(),
      next_operation: mode === 'human'
        ? { type: 'human_gate_decision', operation_key: 'approval.record', actor: 'human', effect: 'decision', gate: 'UAT' }
        : mode === 'closeout'
        ? { type: 'record_closeout', operation_key: 'closeout.record', actor: 'agent', effect: 'closeout', gate: 'OR' }
        : { type: 'prepare_gate_artifact', operation_key: 'artefact.author', actor: 'agent', effect: 'preparation', gate: 'TP' } };
    p.submit = vi.fn(async input => ({ outcome: 'accepted', receipt: decisionReceipt(view, input), current: next }));
    if (mode !== 'unsupported') p.next = vi.fn(async () => { if (mode === 'rejected') throw Error('host_rejected'); });
    render(<DecisionCard view={view} port={p}/>);
    fireEvent.click(screen.getByRole('button', { name: view.labels.approve })); await screen.findByText(view.labels.confirmed);
    expect(screen.queryByRole('button', { name: view.labels.approve })).toBeNull();
    if (mode === 'unsupported') { expect(screen.queryByRole('button', { name: view.labels.nextStep })).toBeNull(); expect(screen.getByText(view.labels.nextChat)).toBeTruthy(); }
    else {
      expect(screen.queryByRole('button', { name: view.labels.nextStep })).toBeNull();
      await screen.findByText(mode === 'rejected' ? view.labels.nextUnavailable : view.labels.nextRequested);
      expect(p.next).toHaveBeenCalledExactlyOnceWith(next, vi.mocked(p.submit).mock.calls[0][0]);
      fireEvent.click(screen.getByText(view.labels.sources)); await act(async () => {});
      expect(p.next).toHaveBeenCalledTimes(1);
    }
    expect(p.submit).toHaveBeenCalledTimes(1);
  });
  it.each(['blocked', 'unavailable'] as const)('does not continue with %s current observation', async mode => {
    const view = decisionView(locale), p = port(); p.next = vi.fn(async () => {});
    p.submit = vi.fn(async input => ({ outcome: 'accepted', receipt: decisionReceipt(view, input), current: { available: mode !== 'unavailable',
      status: mode === 'blocked' ? 'blocked' : 'open', revision_id: crypto.randomUUID(), next_operation: { type: 'human_gate_decision', operation_key: 'approval.record', actor: 'human', effect: 'decision', gate: 'TP' } } }));
    render(<DecisionCard view={view} port={p}/>); fireEvent.click(screen.getByRole('button', { name: view.labels.approve }));
    await screen.findByText(view.labels.confirmed + (mode === 'unavailable' ? ' ' + view.labels.unknownCurrent : '')); expect(screen.queryByRole('button', { name: view.labels.nextStep })).toBeNull(); expect(p.next).not.toHaveBeenCalled();
  });
  it('keeps uncertainty on absent status; retries only the original UUID and unchanged submission', async () => {
    const view = decisionView(locale), p = port(); render(<DecisionCard view={view} port={p}/>);
    fireEvent.click(screen.getByRole('button', { name: view.labels.approve })); await screen.findByText(view.labels.uncertain);
    const input = vi.mocked(p.submit).mock.calls[0][0];
    fireEvent.click(screen.getByRole('button', { name: view.labels.checkOperation })); await act(async () => {});
    expect(p.inspect).toHaveBeenCalledWith(input.operation_id); expect(screen.getByText(view.labels.uncertain)).toBeTruthy();
    p.submit = vi.fn(async () => ({ outcome: 'already_applied', receipt: decisionReceipt(view, input), current: { available: false } }));
    fireEvent.click(screen.getByRole('button', { name: view.labels.retryOriginal }));
    await screen.findByText(view.labels.confirmed + ' ' + view.labels.unknownCurrent);
    expect(p.submit).toHaveBeenCalledWith(input);
  });
  it('does not accept a mismatched receipt and can recover the exact recorded receipt', async () => {
    const view = decisionView(locale), p = port();
    p.next = vi.fn(async () => {});
    p.submit = vi.fn(async input => ({ outcome: 'accepted', receipt: { ...decisionReceipt(view, input), operation_id: crypto.randomUUID() } }));
    render(<DecisionCard view={view} port={p}/>); fireEvent.click(screen.getByRole('button', { name: view.labels.approve }));
    await screen.findByText(view.labels.uncertain); const input = vi.mocked(p.submit).mock.calls[0][0];
    expect(p.next).not.toHaveBeenCalled();
    const next = { available: true, status: 'open', revision_id: crypto.randomUUID(),
      next_operation: { type: 'prepare_gate_artifact', operation_key: 'artefact.author', actor: 'agent', effect: 'preparation', gate: 'TP' } };
    p.inspect = vi.fn(async () => ({ status: 'recorded', receipt: decisionReceipt(view, input), current: next }));
    fireEvent.click(screen.getByRole('button', { name: view.labels.checkOperation })); await screen.findByText(view.labels.confirmed);
    await screen.findByText(view.labels.nextRequested); expect(p.next).toHaveBeenCalledExactlyOnceWith(next, vi.mocked(p.submit).mock.calls[0][0]);
    expect(p.submit).toHaveBeenCalledTimes(1);
  });
  it.each(['stale_revision', 'session_expired', 'presentation_version_decided'])('explains %s and disables fresh decisions', async reason => {
    const view = decisionView(locale), p = port(); p.submit = vi.fn(async () => ({ outcome: 'rejected', reason }));
    render(<DecisionCard view={view} port={p}/>); fireEvent.click(screen.getByRole('button', { name: view.labels.approve }));
    await screen.findByText(reason === 'session_expired' ? view.labels.expired : reason === 'presentation_version_decided' ? view.labels.alreadyDecided : view.labels.sourceChanged);
    expect(screen.getByRole('button', { name: view.labels.approve }).hasAttribute('disabled')).toBe(true);
  });
  it.each(['not_qualified', 'available'] as const)('shows the Chat approval when %s has no native approve action', capability => {
    const view = decisionView(locale), p = port();
    render(<DecisionCard view={{ ...view, capability, enabled_actions: [] }} port={p}/>);
    expect(screen.getByText(view.labels.notQualified)).toBeTruthy();
    expect(screen.getByText(view.labels.chatApprovalHint.replace('{gate}', view.binding.gate))).toBeTruthy();
    expect(screen.queryByRole('button', { name: view.labels.approve })).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: view.labels.request_change })).toBeNull();
    expect(screen.queryByRole('button', { name: view.labels.reject })).toBeNull();
    expect(p.submit).not.toHaveBeenCalled();
  });
  it('keeps an unqualified QA deviation view readable without a misleading approve button', async () => {
    const view = decisionView(locale), p = port();
    view.binding.gate = 'QA';view.labels = { ...view.labels, approve: view.labels.approveWithDeviations };
    render(<DecisionCard view={{ ...view, capability: 'not_qualified', enabled_actions: [] }} port={p}/>);
    expect(screen.queryByRole('button', { name: view.labels.approve })).toBeNull();
    expect(screen.getByText(view.labels.chatApprovalHint.replace('{gate}', 'QA'))).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: view.labels.openDocument }));
    await screen.findByRole('button', { name: view.labels.back });
    fireEvent.click(screen.getByRole('button', { name: view.labels.back }));
    expect(screen.getByRole('button', { name: view.labels.openDocument })).toBeTruthy();
    expect(p.submit).not.toHaveBeenCalled();
  });
  it('expires during submission and a late accepted response never revives the view', async () => {
    vi.useFakeTimers(); const view = decisionView(locale), p = port(); view.expires_at = Date.now() + 1000;
    let finish!: (reply: Record<string, unknown>) => void; p.submit = vi.fn(() => new Promise<Record<string, unknown>>(resolve => { finish = resolve; }));
    render(<DecisionCard view={view} port={p}/>); fireEvent.click(screen.getByRole('button', { name: view.labels.approve }));
    const input = vi.mocked(p.submit).mock.calls[0][0];
    await act(async () => { vi.advanceTimersByTime(1001); });
    await act(async () => finish({ outcome: 'accepted', receipt: decisionReceipt(view, input) }));
    expect(screen.getByText(view.labels.expired)).toBeTruthy(); expect(screen.queryByText(view.labels.confirmed)).toBeNull();
  });
  it('unmount ignores a delayed document without asking to expand', async () => {
    const view = decisionView(locale), p = port(); let finish!: (value: string) => void;
    p.document = vi.fn(() => new Promise<string>(resolve => { finish = resolve; }));
    const rendered = render(<DecisionCard view={view} port={p}/>);
    fireEvent.click(screen.getByRole('button', { name: view.labels.openDocument })); rendered.unmount();
    await act(async () => finish('# Obsolete document')); expect(p.expand).not.toHaveBeenCalled();
    render(<DecisionCard view={view} port={p}/>); expect(screen.queryByRole('textbox')).toBeNull();
  });
});
it('validates bootstrap and rejects wrong receipt family, target, revision, material and action', () => {
  const view = decisionView(); expect(readDecisionBootstrap({ _meta: { agdf_decision: view } })).toEqual(view);
  for (const mutate of [(v: typeof view) => { v.target.target_id = 'invalid'; }, (v: typeof view) => { v.capability = 'not_qualified'; },
    (v: typeof view) => { v.binding.material_sources[0].path += '/../foreign.md'; }, (v: typeof view) => { delete v.labels.approve; }]) {
    const changed = structuredClone(view); mutate(changed); expect(readDecisionBootstrap({ _meta: { agdf_decision: changed } })).toBeNull();
  }
  for (const action of view.enabled_actions) {
    const input: DecisionSubmission = { session_id: view.session_id, operation_id: crypto.randomUUID(), presentation_id: view.binding.presentation_id,
      expected_revision_id: view.binding.expected_revision_id, action, comment: 'Changes' };
    const receipt = decisionReceipt(view, input); expect(matchedDecisionReceipt(receipt, view, input)).toBe(true);
    expect(matchedDecisionReceipt({ ...receipt, operation_id: crypto.randomUUID() }, view, input)).toBe(false);
    expect(matchedDecisionReceipt(receipt, { ...view, binding: { ...view.binding, material_version: 'sha256:' + 'b'.repeat(64) } }, input)).toBe(false);
    expect(matchedDecisionReceipt(receipt, { ...view, binding: { ...view.binding, expected_revision_id: crypto.randomUUID() } }, input)).toBe(false);
  }
});
