import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describeToolResult, projectToolResult, consumeToolResult, validateToolDescriptor, executionFacts } from '../lib/mcp-tool-errors.js';
import { localePack } from '../lib/interaction-presentation.js';
const registry = JSON.parse(readFileSync(new URL('../../../plugins/agdf/meta/agdf-interaction-locales.json', import.meta.url)));
const base = { schema_version: '1', contract_version: 1, runtime: {}, skill: null, control: null, continuation: null, timing: { wrapper_ms: 0, input_ms: 0, target_ms: 0, control_ms: 0, render_ms: 0, total_ms: 0 }, authorizes: false, terminal: false, diagnostics: [], target: null, recovery: null, presentation: null, host_action: { mode: 'consume_report_and_continue', source: 'report', allow_surrounding_text: true, may_request_run_or_evidence: false } };
const dispatch = outcome => ({ ...base, outcome, ...(outcome === 'control_result' ? {} : { terminal: true, recovery: { action: 'Confirm the requested target.' }, host_action: { mode: 'transmit_recovery_verbatim_and_stop', source: 'recovery.action', allow_surrounding_text: false, may_request_run_or_evidence: false, text: 'Confirm the requested target.' } }) });
const inspect = report => ({ ...base, outcome: 'inspect_result', operation: 'doctor', report });
const envelope = state => ({ schema_version: '2', target: null, snapshot_id: null, state, code: state === 'blocked' ? 'resource_denied' : null, retryable: false, data: null });
const commands = ['agdf_prepare', 'agdf_record', 'agdf_approve', 'agdf_revise', 'agdf_closeout', 'agdf_decision_action'];
const successfulCommand = (outcome, receipt = {}) => ({ schema_version: '1', outcome, reason: null, receipt, authorizes: false,
  operation_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', request_digest: 'sha256:' + 'a'.repeat(64),
  binding: { target_id: 'sha256:' + 'b'.repeat(64), run_id: 'fixture', expected_revision_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', kind: 'fixture' },
  effect: null, current: { available: false }, assurance: {}, historical_effect: false, recovery: null, family_result: {} });
let count = 0;
for (const language of ['en', 'de', 'fr']) {
  const pack = localePack(registry, language);
  const describe = (name, input, value, facts) => { ++count; return describeToolResult(name, input, value, pack, facts); };
  for (const outcome of ['target_unresolved', 'invalid_input', 'evaluator_error']) assert.equal(describe('agdf_dispatch', {}, dispatch(outcome)).failed, true);
  assert.equal(describe('agdf_dispatch', {}, dispatch('control_result')).failed, false);
  for (const outcome of ['skill_continuation', 'intake_continuation']) assert.equal(describe('agdf_dispatch', {}, { ...base, outcome, host_action: { mode: outcome === 'skill_continuation' ? 'continue_named_skill' : 'continue_delivery_intake', source: 'continuation', bound_to_target: true } }).failed, false);
  for (const name of commands) {
    for (const outcome of ['rejected', 'recovery_required', 'effect_unknown']) {
      const d = describe(name, {}, { schema_version: '1', outcome, reason: 'PRIVATE:/secret', authorizes: false });
      assert.equal(d.failed, true); assert.equal(d.code, 'unclassified_tool_failure'); assert.ok(!d.message.includes('PRIVATE'));
      if (outcome !== 'rejected') { assert.equal(d.action, 'inspect_operation'); assert.equal(d.effect_state, 'unknown'); }
    }
    for (const outcome of ['accepted', 'already_applied']) assert.equal(describe(name, {}, successfulCommand(outcome)).failed, false);
    assert.equal(describe(name, {}, successfulCommand('accepted', null)).failed, false, 'preparation/preview/runtime-control have no Run receipt');
    const d = describe(name, {}, { schema_version: '1', outcome: 'rejected', reason: 'dispatch_cancelled', authorizes: false }, { code: 'dispatch_cancelled', dispatch: 'unknown' });
    assert.equal(d.action, 'inspect_operation');
  }
  for (const operation of ['doctor', 'gate-check', 'delivery-map', 'artifact-readiness', 'operation-status', 'native-qualification', 'contract']) {
    assert.equal(describe('agdf_inspect', { operation }, inspect({ ready: false, qualified: false, status: 'unknown', state: 'blocked', nested: { available: false } })).failed, false, operation);
  }
  for (const operation of ['operation-contract', 'presentation-document', 'presentation-preview', 'runtime-generations']) {
    assert.equal(describe('agdf_inspect', { operation }, inspect({ available: false, reason: 'stale_revision' })).action, 'refresh_binding');
    assert.equal(describe('agdf_inspect', { operation }, inspect({ available: true })).failed, false);
  }
  assert.equal(describe('agdf_cockpit', {}, envelope('blocked')).failed, true);
  const target = { target_id: 'target', display_path: '/fixture' };
  assert.equal(describe('agdf_cockpit', {}, { schema_version: '1', authorizes: false, target, _meta: { agdf_cockpit: { target, session_id: '11111111-1111-4111-8111-111111111111', render_generation: 1 } } }).failed, false);
  assert.equal(describe('agdf_cockpit_read', { operation: 'close' }, { schema_version: '1', state: 'available', data: { closed: true }, authorizes: false }).failed, false);
  const preview = { schema_version: '1', state: 'available', data: { preview: { resource_id: '11111111-1111-4111-8111-111111111111', content: '<html>Preview</html>', content_digest: 'sha256:' + 'a'.repeat(64), version: 'review-v1' } }, authorizes: false };
  assert.equal(describe('agdf_cockpit_read', { operation: 'preview' }, preview).failed, false);
  assert.deepEqual(consumeToolResult('agdf_cockpit_read', projectToolResult('agdf_cockpit_read', { operation: 'preview' }, preview, pack)).domain, preview);
  assert.throws(() => describe('agdf_cockpit_read', { operation: 'preview' }, { ...preview, data: { preview: { ...preview.data.preview, content_digest: 'invalid' } } }), /tool_result_invalid/);
  for (const operation of ['freshness', 'changes']) assert.equal(describe('agdf_cockpit_read', { operation }, envelope('stale')).failed, false);
  for (const [reason, action] of [['operation_source_invalid', 'correct_input'], ['presentation_missing', 'refresh_binding'], ['closeout_not_ready', 'obtain_authority']]) {
    const d = describe('agdf_record', {}, { schema_version: '1', outcome: 'rejected', reason, authorizes: false });
    assert.equal(d.code, reason); assert.equal(d.action, action); assert.ok(d.message.includes(pack.mcpErrors.causes[reason]));
    if (reason === 'operation_source_invalid') assert.match(d.message, /path|digest/);
  }
  const value = { ...dispatch('invalid_input'), _meta: { preserved: { value: 1 } } };
  const projected = projectToolResult('agdf_dispatch', {}, value, pack, { code: 'dispatch_input_invalid', dispatch: 'not_dispatched', field: 'run_id' });
  const { domain, metadata, descriptor } = consumeToolResult('agdf_dispatch', projected);
  assert.equal(descriptor.action, 'correct_input'); assert.match(descriptor.message, /run_id/);
  assert.ok(!/Repair|Reparier/.test(descriptor.message)); assert.ok(descriptor.message.length < 1200);
  assert.deepEqual(metadata, value._meta); const { _meta, ...expected } = value; assert.deepEqual(domain, expected);
  assert.throws(() => validateToolDescriptor({ ...descriptor, action: 'repair_runtime' }), /tool_result_invalid/);
  assert.throws(() => validateToolDescriptor({ ...descriptor, extra: true }), /tool_result_invalid/);
  assert.throws(() => validateToolDescriptor({ ...descriptor, message: 'a'.repeat(1201) }), /tool_result_invalid/);
  assert.throws(() => consumeToolResult('agdf_dispatch', { ...dispatch('control_result'), _meta: projected._meta }), /tool_result_invalid/);
  assert.throws(() => consumeToolResult('agdf_dispatch', dispatch('invalid_input')), /tool_result_invalid/);
  assert.throws(() => describe('agdf_cockpit', {}, { schema_version: '1', state: 'blocked' }), /tool_result_invalid/);
}
assert.equal(localePack(registry, 'fr'), localePack(registry, 'en'));
assert.deepEqual(executionFacts(Error('PRIVATE'), { phase: 'parse' }), { code: 'dispatch_worker_failed', dispatch: 'not_dispatched' });
assert.deepEqual(executionFacts({ code: 'resource_denied', message: 'PRIVATE' }), { code: 'dispatch_worker_failed', dispatch: 'unknown' });
assert.deepEqual(executionFacts({ facts: { code: 'resource_denied', dispatch: 'not_dispatched', field: '/secret' } }), { code: 'dispatch_worker_failed', dispatch: 'unknown' });
const shutdownFacts = { code: 'dispatch_worker_termination_unconfirmed', dispatch: 'unknown',
  cause_code: 'dispatch_timeout', worker_phase: 'operation' };
assert.deepEqual(executionFacts({ facts: shutdownFacts }), shutdownFacts);
for (const facts of [
  { ...shutdownFacts, cause_code: 'PRIVATE_CAUSE' },
  { ...shutdownFacts, worker_phase: 'PRIVATE_PHASE' },
  { ...shutdownFacts, code: 'resource_denied' },
  { ...shutdownFacts, private: 'PRIVATE_VALUE' },
]) assert.deepEqual(executionFacts({ facts }), { code: 'dispatch_worker_failed', dispatch: 'unknown' });
for (const language of ['de', 'en']) {
  const result = { ...dispatch('evaluator_error'), diagnostics: [{ code: shutdownFacts.code }] };
  const descriptor = describeToolResult('agdf_dispatch', {}, result, localePack(registry, language), shutdownFacts);
  assert.match(descriptor.message, /cause_code=dispatch_timeout, worker_phase=operation/);
  assert.equal(descriptor.effect_state, 'unknown');
  assert.equal(descriptor.action, 'inspect_operation');
  validateToolDescriptor(descriptor);
  const invalid = describeToolResult('agdf_dispatch', {}, result, localePack(registry, language), { ...shutdownFacts, worker_phase: 'PRIVATE_PHASE' });
  assert.ok(!invalid.message.includes('PRIVATE'));
}
const source = readFileSync(new URL('../lib/mcp-tool-errors.js', import.meta.url), 'utf8');
assert.ok(!/\bimport\b|\bprocess\b\.|\b(?:writeFile|readFile|setTimeout|eval)\s*\(/.test(source), 'projector stays pure');
console.log(`MCP error projector passed: ${count} classification/correction cases, locale/bounds/domain/purity checks.`);

{
  const describe = (name, input, value) => describeToolResult(name, input, value, localePack(registry, 'en'));
  const current = envelope('available');
  assert.equal(describe('agdf_cockpit_read', { operation: 'snapshot' }, current).failed, false);
  assert.throws(() => describe('agdf_cockpit_read', { operation: 'snapshot' }, { ...current, schema_version: '1' }), /tool_result_invalid/);
  assert.throws(() => describe('agdf_inspect', {}, { ...base, schema_version: '2' }), /tool_result_invalid/);
  assert.throws(() => describe('agdf_cockpit_read', { operation: 'close' }, { schema_version: '2', state: 'available', data: { closed: true }, authorizes: false }), /tool_result_invalid/);
}
