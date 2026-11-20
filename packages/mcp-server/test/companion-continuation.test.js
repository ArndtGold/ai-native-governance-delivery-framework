import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createMcpCockpitRuntime, createMcpDispatchRuntime } from '../../cli/lib/mcp-dispatch-runtime.js';
import { approvalFixture, treeBytes } from '../../core/test/control-cockpit-fixtures.js';
import { createCodexContinuationAdmission } from '../../core/lib/companion/codex-continuation.js';
import { createCockpitReader } from '../../core/lib/control-inspect/cockpit.js';
import { CODEX_CONTINUATION_OBSERVATIONS, inspectCodexContinuationQualification } from '../../core/lib/runtime/plugin-provenance.js';

function dataRoot(t) {
  const path = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-continuation-mcp-')));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  return path;
}

test('qualification matches candidate bytes and requires native competing-chat evidence', t => {
  const root = dataRoot(t);
  const path = 'qualification/fixture.json', evidence = '{"kind":"fixture"}';
  mkdirSync(join(root, 'qualification'));
  writeFileSync(join(root, path), evidence);
  const digest = createHash('sha256').update(evidence).digest('hex');
  const candidate = { server_digest: '1'.repeat(64), dispatcher_digest: '2'.repeat(64), sdk_digest: '3'.repeat(64) };
  const qualification = { schema_version: 1, surface: 'codex', result: 'qualified', assurance: 'cooperative_local', authorizes: false,
    host: { name: 'test fixture', version: '1', os: process.platform, arch: process.arch },
    candidate, observations: [...CODEX_CONTINUATION_OBSERVATIONS], evidence: [{ path, digest }] };
  const check = (record, expected = candidate) => inspectCodexContinuationQualification(root, record, expected);
  assert.equal(check(null).qualified, false);
  assert.equal(check(qualification).qualified, true);
  assert.equal(check(qualification, { ...candidate, dispatcher_digest: '4'.repeat(64) }).reason, 'qualification_candidate_mismatch');
  assert.equal(check({ ...qualification, observations: qualification.observations.filter(row => row !== 'competing_companions') }).reason,
    'qualification_observations_incomplete');
  writeFileSync(join(root, path), 'changed');
  assert.equal(check(qualification).reason, 'qualification_evidence_digest_mismatch');
});

test('the scoped action rejects stale input, blocks an ordinary competing dispatch and claims the original exactly once', async t => {
  const f = await approvalFixture();
  const root = dataRoot(t);
  const options = { surface: 'codex', companionDataRoot: root, continuationQualified: true };
  const dispatch = createMcpDispatchRuntime(options);
  const cockpit = await createMcpCockpitRuntime({ ...options, cockpitMode: 'plugin' });
  t.after(async () => { await cockpit.close(); await dispatch.close(); f.close(); });
  const runId = 'fixture-a';
  const target = { working_directory: f.root, primary_target: f.root, target_source: 'explicit_target' };
  const rendered = await cockpit.tools.find(tool => tool.name === 'agdf_cockpit').execute({ ...target, run_id: runId });
  const session_id = rendered._meta.agdf_cockpit.session_id;
  assert.equal(rendered._meta.agdf_cockpit.continuation, true);
  const read = cockpit.tools.find(tool => tool.name === 'agdf_cockpit_read');
  const action = cockpit.tools.find(tool => tool.name === 'agdf_cockpit_continue');
  const snapshot = await read.execute({ session_id, operation: 'snapshot', run_id: runId });
  assert.equal(snapshot.state, 'available');
  const binding = { session_id, snapshot_id: snapshot.snapshot_id, revision_id: f.revision(), run_id: runId };
  const invokeAction = (operation, fields) => action.execute(action.parse({ ...binding, operation, ...fields }));
  assert.equal(invokeAction('reserve').state, 'stale', 'action requires a displayed snapshot');
  await read.execute({ session_id, operation: 'display_ack', snapshot_id: snapshot.snapshot_id });
  assert.equal(invokeAction('reserve', { revision_id: randomUUID() }).state, 'stale');
  const approval = invokeAction('reserve');
  assert.equal(approval.operation_key, 'approval.record');
  const beforeDecision = treeBytes(f.root);
  const gate = dispatch.tool('agdf_dispatch');
  const invokeDispatch = fields => gate.execute(gate.parse({ ...target, presentation_language: 'en', skill_id: 'gate-check',
    continue_delivery: true, run_id: runId, ...fields }));
  assert.equal(invokeAction('publish', { attempt_id: approval.attempt_id }).send, true);
  const decision = invokeDispatch({ continuation_attempt_id: approval.attempt_id });
  assert.equal(decision.continuation?.phase, 'presentation_required',
    JSON.stringify({ diagnostics: decision.diagnostics, text: decision.host_action?.text, control: decision.control }));
  assert.equal(decision.continuation.work_admission.attempt_id, approval.attempt_id);
  assert.equal(decision.continuation.next_calls[0].tool, 'agdf_prepare');
  assert.deepEqual(treeBytes(f.root), beforeDecision, 'opening the decision does not record approval');
  assert.equal(invokeDispatch({ continuation_attempt_id: approval.attempt_id }).terminal, true);

  const authority = createCodexContinuationAdmission(root);
  const scope = { root: f.root, target_id: snapshot.target.target_id, run_id: runId };
  const turn = { session: 'fixture-chat', id: 'fixture-turn' };
  assert.equal(authority.associateTurn(scope, approval.attempt_id, decision.continuation.work_admission.owner, turn).matched, true);
  authority.settleRunning(scope, approval.attempt_id, turn);
  assert.equal(f.approve().outcome, 'accepted');
  const second = await read.execute({ session_id, operation: 'snapshot', run_id: runId });
  const latest = { snapshot_id: second.snapshot_id, revision_id: f.revision() };
  assert.equal(invokeAction('reserve').state, 'stale');
  const ready = invokeAction('reserve', latest);
  assert.equal(ready.reserved, true, JSON.stringify(createCockpitReader(f.root).snapshot(runId).data.run.evaluation.next_operation));
  const original = invokeAction('publish', { ...latest, attempt_id: ready.attempt_id });
  assert.equal(original.send, true);
  assert.equal(invokeAction('publish', { ...latest, attempt_id: ready.attempt_id }).send, undefined);
  const competing = invokeDispatch({});
  assert.equal(competing.terminal, true);
  assert.match(competing.host_action.text, /not confirmed/);
  const claimed = invokeDispatch({ continuation_attempt_id: ready.attempt_id });
  assert.equal(claimed.terminal, false);
  assert.equal(claimed.continuation.work_admission.attempt_id, ready.attempt_id);
  assert.equal(claimed.continuation.resume_call.arguments.continuation_owner, claimed.continuation.work_admission.owner);
  assert.match(invokeDispatch({}).host_action.text, /already working/);
});
