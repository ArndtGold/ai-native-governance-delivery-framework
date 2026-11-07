import { withSyntheticQaContent } from '../../core/test/fixtures/decision-content.js';
// Existing structured closeout scenario through the actual MCP entrypoint.
import assert from 'node:assert/strict';
import { deliveryModeCases } from './fixtures/delivery-mode-cases.js';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createMcpDeliveryHarness } from './delivery-harness.js';
import { resolveControlCommandTarget, canonicalJson, digest } from '../../core/lib/control-state/approval-command-contract.js';
import { artefactFileDigest, runSealState } from '../../core/lib/control-state/run-seal.js';
import { readRunState } from '../../core/lib/control-evaluation/run-state.js';
import { closeoutConfirmation } from '../../core/lib/control-evaluation/closeout-readiness.js';
import { COCKPIT_MIME } from '../../core/lib/control-inspect/cockpit-contract.js';
import { MCP_APP_UI_EXTENSION } from '../src/ui-capability.js';

function slowAuthoringGit(fixture, enabled) {
  if (!enabled) return {};
  const bin = join(fixture.governanceTarget, 'test-bin');
  const log = join(bin, 'git.log');
  const marker = join(bin, 'slow');
  mkdirSync(bin);
  writeFileSync(join(bin, 'git'), [
    '#!/bin/sh',
    'if [ -f "$AGDF_TEST_SLOW_GIT" ]; then',
    '  case "$*" in',
    '    "--no-optional-locks -c core.fsmonitor=false diff --no-ext-diff --no-textconv HEAD --name-only -z")',
    '      printf "diff\\n" >> "$AGDF_TEST_GIT_LOG"; sleep 2.6 ;;',
    '    "--no-optional-locks -c core.fsmonitor=false rev-parse HEAD") printf "head\\n" >> "$AGDF_TEST_GIT_LOG" ;;',
    '    "--no-optional-locks -c core.fsmonitor=false ls-files --others --exclude-standard -z") printf "untracked\\n" >> "$AGDF_TEST_GIT_LOG" ;;',
    '  esac',
    'fi',
    'exec "$AGDF_TEST_REAL_GIT" "$@"',
  ].join('\n') + '\n', { mode: 0o755 });
  return {
    env: { PATH: bin + ':' + process.env.PATH, AGDF_TEST_SLOW_GIT: marker, AGDF_TEST_GIT_LOG: log,
      AGDF_TEST_REAL_GIT: execFileSync('which', ['git'], { encoding: 'utf8' }).trim() },
    enable: () => writeFileSync(marker, ''),
    observed: () => existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n') : [],
  };
}

async function checkCloseoutRead(f, context, slow) {
  const status = readRunState(context.primary_target, { runId: f.runId });
  const source = type => {
    const path = status.artefacts.get(type).path.replace(/^`|`$/gu, '');
    return readFileSync(join(context.primary_target, path), 'utf8');
  };
  const expected = { OR: source('OR'), QA: source('QA') };
  const stateBefore = readFileSync(f.state, 'utf8');
  slow.enable?.();
  const start = performance.now();
  const dispatch = await f.call('agdf_dispatch', { ...context, skill_id: 'delivery-closeout', run_id: f.runId });
  assert.equal(dispatch.outcome, 'skill_continuation', JSON.stringify(dispatch.diagnostics));
  assert.equal(dispatch.control.completion.fulfilled, true);
  const offered = dispatch.continuation.next_calls[0];
  const first = dispatch.next_read?.result ?? await f.call('agdf_inspect', offered.arguments);
  const readArguments = offered.recovery_only?.original_call.arguments ?? offered.arguments;
  const elapsed = Math.round(performance.now() - start);
  const calls = slow.observed?.() ?? [];
  assert.equal(readFileSync(f.state, 'utf8'), stateBefore);
  assert.equal(readArguments.authoring_scope, 'delivery-closeout',
    `Completed structured handoff did not offer its scoped read (elapsed_ms=${elapsed}, Git=${calls.join(',')}, page=${first.report?.page_index}, failure=${first.diagnostics?.[0]?.code}).`);
  assert.equal(first.report.available, true);
  assert.equal(first.report.complete, true);
  assert.equal(first.report.material_call, undefined);
  assert.equal(first.report.formats, undefined);
  assert.equal(first.report.material_transport, undefined);
  assert.deepEqual(Object.fromEntries(first.report.documents.map(row => [row.type, row.content])), expected);
  assert.ok(first.report.documents.every(row => row.role === 'source'));
  assert.deepEqual(first.report.document_manifest.map(row => row.type).sort(), ['OR', 'QA']);
  assert.equal((dispatch.next_read?.result ? dispatch : first).next_action?.call, null);
  if (slow.enable) assert.ok(elapsed < 10_000, `Scoped handoff took ${elapsed} ms`);
  assert.deepEqual(calls, []);

  const { authoring_scope, ...ordinaryRead } = readArguments;
  let page = (await f.call('agdf_inspect', ordinaryRead)).report;
  assert.ok(page.available);
  assert.ok(page.document_manifest.some(row => row.role === 'template'));
  assert.ok(page.next_cursor, 'The ordinary read covers multiple pages.');
  const scoped = { ...ordinaryRead, authoring_scope };
  assert.equal((await f.call('agdf_inspect', { ...scoped, cursor: page.next_cursor })).report.reason, 'authoring_cursor_stale_or_invalid');
  assert.equal((await f.call('agdf_inspect', { ...scoped, expected_revision_id: randomUUID() })).report.reason, 'authoring_binding_stale_or_invalid');
  const sources = new Map();
  const manifest = page.document_manifest;
  const manifestDigest = page.manifest_digest;
  assert.equal(manifestDigest, digest(JSON.stringify({
    target_id: f.target, run_id: f.runId, revision_id: f.revision(),
    languages: { artifact_language: page.artifact_language, presentation_language: page.presentation_language,
      approval_summary_required: page.approval_summary_required, approval_summary_heading: page.approval_summary_heading },
    bundle: 2, gate: page.gate, authoring_owner: page.authoring_owner, recording: page.recording, documents: manifest,
  })), 'Ordinary cursor still uses the existing unscoped manifest identity.');
  let pageCount = 0;
  for (;;) {
    assert.equal(page.manifest_digest, manifestDigest);
    assert.deepEqual(page.document_manifest, manifest);
    assert.ok(++pageCount <= 8);
    for (const row of [...page.documents, ...page.fragments]) {
      const key = row.digest + ':' + row.type;
      const prior = sources.get(key) ?? '';
      assert.equal(Buffer.byteLength(prior), row.byte_start);
      sources.set(key, prior + row.content);
    }
    if (page.complete) break;
    page = (await f.call('agdf_inspect', page.next_calls[0].arguments)).report;
    assert.ok(page.available);
  }
  for (const row of manifest.filter(row => row.role === 'source')) {
    assert.equal(sources.get(row.digest + ':' + row.type), source(row.type));
  }
  const qa = f.file('QA_REPORT.md');
  try {
    writeFileSync(qa, expected.QA + '\nChanged protected source.\n');
    assert.equal((await f.call('agdf_inspect', scoped)).report.reason, 'authoring_binding_stale_or_invalid');
    assert.equal(readFileSync(qa, 'utf8'), expected.QA + '\nChanged protected source.\n');
  } finally {
    writeFileSync(qa, expected.QA);
  }
  assert.equal(readFileSync(f.state, 'utf8'), stateBefore);
  assert.deepEqual(slow.observed?.() ?? [], []);
  console.log(JSON.stringify({ closeout_scope: authoring_scope, elapsed_ms: elapsed, git_calls: calls,
    ordinary_pages: pageCount, or_digest: digest(expected.OR), qa_digest: digest(expected.QA), state_unchanged: true }));
}

for (const { modern, route } of deliveryModeCases(process.argv.slice(2), { structured: true })) {
const fixture = createOwnedRuntimeFixture({ controlRuns: [] }), root = fixture.governanceTarget;
try {
  const slow = slowAuthoringGit(fixture, process.env.AGDF_TEST_SLOW_CLOSEOUT_GIT === '1' && route === 'structured_delivery' && !modern);
  const context = { presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target' };
  await withStdioClient({ ...fixture, env: slow.env, modern, capabilities: { extensions: { [MCP_APP_UI_EXTENSION]: { mimeTypes: [COCKPIT_MIME] } } } }, async client => {
  const f = await createMcpDeliveryHarness(client, root); await f.startStructured(route);
  const service = f.call, target = f.target, bound = f.bound;
  let recorded;
  for (const step of ['CD+Tests', 'CR']) {
    const padding = step === 'CD+Tests' ? 'Synthetic evidence for ordinary paging.\n'.repeat(1200) : '';
    const source = await f.stage(step, '# ' + step + '\n- decision: pass\nSynthetic exact current result.\n' + padding);
    recorded = await service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: step, decision: 'pass', source } } });
    assert.equal(recorded.outcome, 'accepted', JSON.stringify(recorded));
  }
  const dispatch = { presentation_language: 'en', working_directory: root, primary_target: root,
    target_source: 'explicit_target', run_id: f.runId };
  const follow = (action, inputs) => {
    assert.ok(action?.call, JSON.stringify(action));
    const { tool, arguments: args } = action.call;
    return service(tool, inputs ? { ...args, inputs } : args);
  };
  const authoring = async continuation => {
    let read = continuation.next_read?.result;
    if (!read?.report?.available) read = await follow(continuation.next_action);
    const documents = [];
    for (;;) {
      assert.equal(read.report?.available, true, JSON.stringify(read));
      documents.push(...read.report.documents);
      if (read.report.complete) break;
      read = await follow(read.next_action);
    }
    assert.equal(read.report.run_id, f.runId);
    assert.equal(read.report.revision_id, f.revision());
    return { ...read, documents };
  };
  const stageReview = async (input, step, decision = 'pass', findings = '') => {
    const staged = await follow(input.next_action, {
      content: '# ' + step + '\n- decision: ' + decision + '\nSynthetic review result.\n' + findings,
    });
    assert.equal(staged.outcome, 'accepted', JSON.stringify(staged));
    assert.equal(staged.family_result.files[0].slot, step);
    assert.equal(staged.next_action.slot, step);
    assert.equal(staged.next_action.operation.expected_revision_id, f.revision());
    assert.deepEqual(staged.next_action.required_inputs, ['decision']);
    return staged.next_action;
  };

  const initialState = readFileSync(f.state, 'utf8');
  const initialStatus = await service('agdf_dispatch', { ...dispatch, skill_id: 'gate-check' });
  assert.equal(initialStatus.outcome, 'control_result');
  assert.equal(initialStatus.terminal, true);
  assert.equal(initialStatus.control.next_operation.internal_step, 'TP Review');
  assert.equal(readFileSync(f.state, 'utf8'), initialState);

  const checkNegativeCases = !modern && route === 'structured_delivery';
  for (const [step, skill] of [['TP Review', 'task-plan-review'], ['Clean Implementation Review', 'clean-implementation-review']]) {
    const previousRevision = f.revision();
    const continuation = await follow(recorded.next_action);
    assert.equal(continuation.terminal, false, `Bound continuation must offer ${step} rather than a terminal status`);
    assert.equal(continuation.continuation.skill_id, skill);
    assert.equal(continuation.continuation.run_id, f.runId);
    assert.equal(continuation.continuation.revision_id, previousRevision);
    const direct = await authoring(await service('agdf_dispatch', { ...dispatch, skill_id: skill }));
    assert.equal(direct.report.authoring_owner, step);
    const directForm = await stageReview(direct, step);
    let input = await authoring(continuation);
    assert.equal(input.report.authoring_owner, step);

    if (checkNegativeCases && step === 'TP Review') {
      const findings = '\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n'
        + '| F-01 | implementation_gap | CD+Tests | open | Synthetic assertion fails | Correct the synthetic implementation and rerun its test |\n';
      const nonpass = await follow(await stageReview(input, step, 'revise', findings), { decision: 'revise' });
      assert.equal(nonpass.outcome, 'accepted', JSON.stringify(nonpass));
      const afterNonpass = await follow(nonpass.next_action);
      assert.equal(afterNonpass.control.next_operation.internal_step, step);
      assert.equal(afterNonpass.control.missing_approval, 'none');
      const denied = await service('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate: 'QA' } } });
      assert.equal(denied.outcome, 'rejected');
      input = await authoring(afterNonpass);
    }

    recorded = await follow(await stageReview(input, step), { decision: 'pass' });
    assert.equal(recorded.outcome, 'accepted', JSON.stringify(recorded));
    assert.notEqual(f.revision(), previousRevision);
    assert.equal(readRunState(root, { runId: f.runId }).approvals.get('QA').status, 'missing');
    if (checkNegativeCases && step === 'TP Review') {
      const current = readFileSync(f.state, 'utf8');
      const rejected = await follow(directForm, { decision: 'pass' });
      assert.equal(rejected.reason, 'stale_revision', JSON.stringify(rejected));
      assert.equal(readFileSync(f.state, 'utf8'), current);
    }
  }
  const qaContinuation = await follow(recorded.next_action);
  assert.equal(qaContinuation.terminal, false);
  assert.equal(qaContinuation.continuation.skill_id, 'qa-gate');
  assert.equal(qaContinuation.continuation.revision_id, f.revision());
  const beforeReport = await service('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate: 'QA' } } });
  assert.equal(beforeReport.outcome, 'rejected');
  if (checkNegativeCases) {
    const state = readRunState(root, { runId: f.runId });
    const cdPath = join(root, state.artefacts.get('CD+Tests').path);
    const current = readFileSync(cdPath, 'utf8');
    try {
      writeFileSync(cdPath, current + '\nSuperseded implementation evidence in the disposable fixture.\n');
      const stale = readRunState(root, { runId: f.runId });
      assert.equal(stale.evidence_applicability.by_step.get('TP Review').applicability, 'superseded');
      const afterStale = await follow(recorded.next_action);
      assert.equal(afterStale.control.missing_approval, 'none');
      assert.notEqual(afterStale.continuation?.skill_id, 'qa-gate');
      assert.equal(stale.approvals.get('QA').status, 'missing');
    } finally {
      writeFileSync(cdPath, current);
    }
  }
  const qaPath = f.prefix + 'QA_REPORT.md';
  const qaInputs = await authoring(qaContinuation);
  assert.equal(qaInputs.report.authoring_owner, 'QA');
  assert.ok(qaInputs.documents.some(row => row.role === 'template' && row.type === 'QA_REPORT'));
  const qaText = withSyntheticQaContent('# QA: Synthetic closeout\nStatus: pass\n\n## 1. QA Decision\nDecision: pass\n\n## Scope\nApproved synthetic task fulfilled.\n\n## Evidence\nExact tests and reviews recorded.\n\n## Examples\n~~~\nDecision: block\n~~~\n> Example:\nDecision: unknown\n\n## Risks\nNo applicable open required finding.\n');
  const qa = await f.formal('QA', qaText);
  assert.equal(qa.outcome, 'accepted', JSON.stringify(qa));
  const qaDecision = await follow(qa.next_action);
  assert.equal(qaDecision.continuation.phase, 'presentation_required');
  assert.equal(qaDecision.next_action.operation.gate, 'QA');
  assert.equal(qaDecision.next_action.operation.expected_revision_id, f.revision());
  assert.equal(readRunState(root, { runId: f.runId }).approvals.get('QA').status, 'missing');
  for (const gate of ['QA', 'UAT']) {
    const preparedReply = await client.callTool({ name: 'agdf_prepare', arguments: { ...bound(), command: { kind: 'presentation.prepare', payload: { gate } } } });
    const prepare = preparedReply.structuredContent;
    assert.equal(prepare.outcome, 'accepted', JSON.stringify(prepare));
    assert.equal(preparedReply._meta?.agdf_decision, undefined);
    const probed = await client.callTool({ name: 'agdf_decision_view', arguments: { primary_target: root, target_id: target,
      run_id: f.runId, expected_revision_id: f.revision(), gate, presentation_id: prepare.family_result.presentation_id } });
    const view = probed._meta.agdf_decision;
    assert.ok(view?.resource_id, 'Each gate offers exact presented material in the large reading view.');
    const noDecision = readFileSync(f.state, 'utf8');
    const read = { operation: 'document', session_id: view.read_session_id, snapshot_id: view.snapshot_id, run_id: f.runId, resource_id: view.resource_id };
    for (let i = 0; i < 2; ++i) {
      const document = await service('agdf_cockpit_read', read);
      assert.equal(document.state, 'available', JSON.stringify(document));
      assert.equal(document.data.document.resource.type, gate);
      assert.equal('sha256:' + document.data.document.content_digest, view.document_digest);
      if (gate === 'UAT') {
        assert.equal(document.data.document.content,
          readFileSync(join(root, `.agdf/control/runs/${f.runId}/control/presentations/${prepare.family_result.presentation_id}.document`), 'utf8'),
          'UAT reads its exact immutable evidence document, independently of the Chat decision layout.');
        assert.match(document.data.document.content, /Intended outcome|Delivered result/u);
        assert.notEqual(document.data.document.content, readFileSync(join(root, qaPath), 'utf8'), 'QA is not substituted for the UAT evidence material.');
        assert.equal(document.data.document.resource.registered_reference, `presentation:${view.binding.presentation_id}`);
      }
    }
    for (const foreign of [{ resource_id: randomUUID() }, { snapshot_id: randomUUID() }, { run_id: 'other-run' }]) {
      const denied = await service('agdf_cockpit_read', { ...read, ...foreign });
      assert.equal(denied.reason ?? denied.code, 'resource_denied');
    }
    if (gate === 'UAT') {
      writeFileSync(f.state, noDecision + '\nUnsealed change without a new revision.\n');
      assert.notEqual((await service('agdf_cockpit_read', read)).state, 'available', 'A changed Run seal cannot revive the old UAT view.');
      writeFileSync(f.state, noDecision);
      const original = readFileSync(join(root, qaPath), 'utf8');
      writeFileSync(join(root, qaPath), original + '\nChanged evidence after presentation.\n');
      const changed = await service('agdf_cockpit_read', read);
      assert.notEqual(changed.state, 'available', 'Changed evidence cannot be presented under the old UAT binding.');
      writeFileSync(join(root, qaPath), original);
    }
    assert.equal(readFileSync(f.state, 'utf8'), noDecision, 'Opening, repeated reading and rejected selectors never decide.');
    assert.equal((await service('agdf_cockpit_read', { operation: 'close', session_id: view.read_session_id })).data.closed, true);
    assert.equal((await service('agdf_cockpit_read', { operation: 'snapshot', session_id: view.read_session_id })).reason, 'session_expired');
    const approvalInput = { ...bound(), command: { kind: 'approval.record', payload: { gate, presentation_id: prepare.family_result.presentation_id, response: `Approval: ${gate}` } } };
    let approval = await service('agdf_approve', approvalInput);
    if (approval.outcome === 'effect_unknown') {
      // A response deadline is not evidence of non-execution. Only a valid
      // committed original receipt permits exact replay; pending/absent/unknown
      // effects remain failures. Never invent another synthetic decision/UUID.
      const observed = await service('agdf_inspect', { operation: 'operation-status', module: approvalInput.operation_id,
        presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
        run_id: f.runId, expected_revision_id: f.revision() });
      assert.equal(observed.report.status, 'recorded', JSON.stringify(observed));
      assert.equal(observed.report.family, 'approval.record');
      assert.equal(observed.report.request_digest, approval.request_digest);
      assert.equal(observed.report.receipt.operation_id, approvalInput.operation_id);
      assert.equal(observed.report.receipt.binding.gate, gate);
      assert.equal(observed.report.receipt.binding.presentation_id, prepare.family_result.presentation_id);
      assert.equal(observed.report.receipt.effect.resulting_revision_id, f.revision());
      const committed = readFileSync(f.state, 'utf8');
      approval = await service('agdf_approve', approvalInput);
      assert.equal(approval.outcome, 'already_applied', JSON.stringify(approval));
      assert.equal(approval.request_digest, observed.report.request_digest);
      assert.deepEqual(approval.receipt, observed.report.receipt);
      assert.equal(readFileSync(f.state, 'utf8'), committed, 'Original receipt replay records no second approval.');
    } else assert.equal(approval.outcome, 'accepted', JSON.stringify(approval));
    assert.equal(readRunState(root, { runId: f.runId }).approvals.get(gate).status, 'approved');
  }
  const state = readRunState(root, { runId: f.runId });
  const rows = ['UR', 'Brownfield Review', 'PRD', 'SD', 'TP', 'Brownfield Analysis', 'CD+Tests', 'CR', 'QA', 'UAT'].map(type => `| ${type} | ${state.approvals.get(type)?.status ?? state.artefacts.get(type).status} | ${state.artefacts.get(type)?.path || state.approvals.get(type).evidence} |`).join('\n');
  const orPath = f.prefix + 'OR_CANDIDATE.md';
  const report = `# OR: Synthetic closeout
Report mode: OR-full
Status: done
## Run
- run_id: ${f.runId}
- related_ur: ${f.prefix}UR.md
- related_prd: ${f.prefix}PRD.md
- related_sd: ${f.prefix}SD.md
- related_tp: ${f.prefix}TP.md
- related_qa_report: ${qaPath}
- mode_slice_decision: ${route}
- current_gate: OR
- decision: pass
## Gate State
| Gate or step | Status | Evidence |
|---|---|---|
${rows}
## Delivered
Synthetic exact approved fixture task and checks complete.
## Not Delivered / Intentionally Deferred
none
## Evidence
Actual fixture QA and all mandatory reviews are registered and approved.
## Missing Evidence
none
## Risks And Open Items
none
## Context Graph Impact
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Synthetic isolated scope changes no graph owner or knowledge.
## Knowledge Persistence Decision
- memory_target: none
- memory_reason: Synthetic disposable fixture creates no persistent project knowledge.
- memory_refs: none
## Next Permissible Step
- next_allowed_action: Optional explicitly requested VCS handoff.
- required_approval: none
- forbidden_until_then: Automatic Git or release action.
`;
  const orMaterial = await f.stage('OR', report);

  const input = { ...bound(), command: { kind: 'closeout.record', payload: { or: orMaterial, confirmation: 'synthetic invalid confirmation' } } };
  const before = readFileSync(f.state, 'utf8');
  const rejected = await service('agdf_closeout', input); assert.equal(rejected.reason, 'closeout_confirmation_required');
  assert.equal(readFileSync(f.state, 'utf8'), before);
  input.command.payload.confirmation = closeoutConfirmation(f.runId, input.expected_revision_id, input.operation_id, input.command.payload.or.digest);
  const result = await service('agdf_closeout', input); assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(result.current.lifecycle, 'completed'); assert.equal(result.current.completion.fulfilled, true); assert.equal(result.current.next_operation, null);
  assert.equal((await service('agdf_closeout', input)).outcome, 'already_applied');
  assert.equal(runSealState(root, readFileSync(f.state, 'utf8')).status, 'valid');
  await checkCloseoutRead(f, context, slow);
  console.log(`Actual default-entrypoint STDIO ${route}: CD/reviews, reviewed QA recording, exact QA/UAT approvals, OR confirmation, completion and original-UUID replay passed; synthetic disposable decisions only.`);
  });
} finally { fixture.dispose(); }
}
