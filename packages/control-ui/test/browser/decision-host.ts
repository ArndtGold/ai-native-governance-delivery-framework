// Browser/SDK fixture only. This cannot qualify a native host or create a live decision.
import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge';
import { decisionReceipt, decisionView } from '../decision-fixtures';
import type { DecisionSubmission } from '../../src/mcp/decision-bootstrap';
const iframe = document.querySelector('iframe')!;
let view = decisionView(), generation = 0, mode = 'accepted', release: (() => void) | null = null;
let approvedRevision = crypto.randomUUID();
const messages: unknown[] = [], contexts: unknown[] = [];
let releaseMessage: (() => void) | null = null;
const nextOperation = () => mode === 'continue_human'
  ? { type: 'human_gate_decision', operation_key: 'approval.record', actor: 'human', effect: 'decision', gate: 'UAT' }
  : { type: 'prepare_gate_artifact', operation_key: 'artefact.author', actor: 'agent', effect: 'preparation', gate: 'TP' };
const calls: { name: string; arguments: Record<string, unknown> }[] = [];
const bridge = new AppBridge(null, { name: 'Synthetic browser fixture', version: '1' }, { serverTools: {}, message: { text: {} }, updateModelContext: {} }, {
  hostContext: { theme: 'light', displayMode: 'inline', availableDisplayModes: ['inline', 'fullscreen'], locale: 'en' }
});
bridge.onsizechange = ({ height }) => { if (height && Number.isFinite(height)) iframe.style.height = Math.ceil(height) + 'px'; };
const doc = '# Exact synthetic document\n\n' + 'Complete readable content.\n\n'.repeat(60);
bridge.oncalltool = async params => {
  calls.push({ name: params.name, arguments: params.arguments ?? {} });
  let result: Record<string, unknown>;
  if (params.name === 'agdf_cockpit_read') result = params.arguments?.operation === 'close'
    ? { state: 'available', data: { closed: true } }
    : { state: 'available', data: { kind: 'document', document: { content: doc, content_digest: view.document_digest!.slice(7) } } };
  else if (params.name === 'agdf_inspect') result = params.arguments?.operation === 'presentation-document'
    ? { outcome: 'inspect_result', report: { available: true, target_id: view.target.target_id, run_id: view.binding.run_id,
      gate: view.binding.gate, revision_id: view.binding.expected_revision_id, presentation_id: view.binding.presentation_id,
      content_digest: view.document_digest, content: doc, complete: true, next_cursor: null } }
    : params.arguments?.operation === 'operation-contract'
    ? { outcome: 'inspect_result', report: { binding: { target_id: view.target.target_id, run_id: view.binding.run_id,
      expected_revision_id: mode === 'continue_stale' ? crypto.randomUUID() : approvedRevision },
      current: { status: 'open', next_operation: nextOperation() } } }
    : { outcome: 'inspect_result', report: { status: 'absent', reason: 'absence_is_not_proof_of_non_execution' } };
  else if (params.name === 'agdf_decision_action') {
    const input = params.arguments as unknown as DecisionSubmission;
    const selected = mode;
    if (selected === 'pending') await new Promise<void>(resolve => { release = resolve; });
    result = selected === 'uncertain' ? { outcome: 'effect_unknown' }
      : ['stale_revision', 'session_expired', 'presentation_version_decided', 'permission_denied'].includes(selected)
        ? { outcome: 'rejected', reason: selected }
        : { outcome: 'accepted', receipt: decisionReceipt(view, input), current: selected.startsWith('continue_')
          ? { available: true, status: 'open', revision_id: approvedRevision, next_operation: nextOperation() }
          : { available: true } };
  } else throw Error('Unsupported fixture tool');
  return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result };
};
bridge.onupdatemodelcontext = async params => { contexts.push(params); return {}; };
bridge.onmessage = async params => {
  messages.push(params);
  if (mode === 'continue_busy') await new Promise<void>(resolve => { releaseMessage = resolve; });
  return mode === 'continue_unknown' ? { isError: true } : {};
};
bridge.onrequestdisplaymode = async ({ mode: displayMode }) => {
  bridge.setHostContext({ theme: 'light', displayMode, availableDisplayModes: ['inline', 'fullscreen'], locale: view.binding.presentation_language });
  return { mode: displayMode };
};
async function emit(locale: 'en' | 'de', capability = 'available', comparison = false) {
  view = decisionView(locale); view.generation = ++generation; approvedRevision = crypto.randomUUID();
  view.decision_heading = 'Source-bound decision heading';
  view.decision_brief = '- Proposal: Synthetic source-authored proposal.';
  view.approval_effect = 'Preparing the task plan is a possible consequence of approval.';
  view.approval_effect_label = locale === 'de' ? 'Nach Freigabe erlaubt' : 'Allowed after approval';
  view.session_id = crypto.randomUUID(); view.read_session_id = crypto.randomUUID();
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(doc)));
  view.document_digest = 'sha256:' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  if (comparison) {
    const previous = '# Archived document\n\nActual complete previous source.';
    const previousBytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(previous)));
    view.comparison = { state: 'available', previous_revision_id: crypto.randomUUID(),
      previous_digest: 'sha256:' + Array.from(previousBytes, b => b.toString(16).padStart(2, '0')).join(''),
      current_digest: view.document_digest, unchanged: false, previous_text: previous };
  }
  if (capability === 'not_qualified') { view.capability = 'not_qualified'; view.enabled_actions = []; }
  bridge.setHostContext({ theme: 'light', displayMode: 'inline', availableDisplayModes: ['inline', 'fullscreen'], locale });
  await bridge.sendToolInput({ arguments: { fixture: 'non-authorizing', locale } });
  await bridge.sendToolResult({ content: [{ type: 'text', text: 'Synthetic browser fixture' }], _meta: { agdf_decision: view } });
  return view.session_id;
}
const harness = { calls, messages, contexts, emit, mode: (value: string) => { mode = value; }, release: () => release?.(), releaseMessage: () => releaseMessage?.(),
  teardown: () => bridge.teardownResource({}), removeFrame: () => iframe.remove(),
  navigateFrame: async () => { await bridge.teardownResource({}); iframe.src = 'about:blank'; } };
(window as unknown as { decisionHarness: typeof harness }).decisionHarness = harness;
bridge.oninitialized = () => { void emit('en'); };
await bridge.connect(new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!));
iframe.src = '/decision.html';
