import { withSyntheticQaContent } from '../../core/test/fixtures/decision-content.js';
// Existing structured closeout scenario through the actual MCP entrypoint.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createLateSourceRevisionTestRun } from '../../cli/scripts/fixtures/late-source-revision.js';
import { resolveControlCommandTarget, canonicalJson, digest } from '../../core/lib/control-state/approval-command-contract.js';
import { artefactFileDigest, runSealState } from '../../core/lib/control-state/run-seal.js';
import { readRunState } from '../../core/lib/control-evaluation/run-state.js';
import { closeoutConfirmation } from '../../core/lib/control-evaluation/closeout-readiness.js';
import { COCKPIT_MIME } from '../../core/lib/control-inspect/cockpit-contract.js';
import { MCP_APP_UI_EXTENSION } from '../src/ui-capability.js';

for (const modern of [false, true]) for (const route of ['structured_delivery', 'structured_slice']) {
const fixture = createOwnedRuntimeFixture(), root = fixture.governanceTarget;
try {
  const cli = join(fixture.dispatcherRoot, 'bin/create-agdf.js');
  const f = createLateSourceRevisionTestRun(root, cli, 'structured-closeout-command', process.env, { route });
  await withStdioClient({ ...fixture, modern, capabilities: { extensions: { [MCP_APP_UI_EXTENSION]: { mimeTypes: [COCKPIT_MIME] } } } }, async client => {
  const service = async (name, input) => { const out = await client.callTool({ name, arguments: input }); assert.ok(out.structuredContent, JSON.stringify(out)); return out.structuredContent; };
  const target = resolveControlCommandTarget(root).target_id;
  const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: target, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
  writeFileSync(f.file('BROWNFIELD_ANALYSIS.md'), '# Brownfield Analysis\n- decision: pass\nSynthetic current preparation complete.\n');
  assert.equal(f.run('run-update', '--revision', f.revision()).value.outcome, 'updated');
  for (const step of ['CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR']) {
    const path = f.prefix + step.replaceAll(' ', '_').replaceAll('+', '_') + '_CANDIDATE.md';
    writeFileSync(join(root, path), '# ' + step + '\n- decision: pass\nSynthetic exact current result.\n');
    const recorded = await service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: step, decision: 'pass', source: { path, digest: artefactFileDigest(root, path) } } } });
    assert.equal(recorded.outcome, 'accepted', JSON.stringify(recorded));
  }
  const qaPath = f.prefix + 'QA_REPORT.md', proof = f.prefix + 'QA_MAPPING.json', request = f.prefix + 'QA_RECORD.json';
  writeFileSync(join(root, qaPath), withSyntheticQaContent('# QA: Synthetic closeout\nStatus: pass\n\n## 1. QA Decision\nDecision: pass\n\n## Scope\nApproved synthetic task fulfilled.\n\n## Evidence\nExact tests and reviews recorded.\n\n## Examples\n~~~\nDecision: block\n~~~\n> Example:\nDecision: unknown\n\n## Risks\nNo applicable open required finding.\n'));
  writeFileSync(join(root, qaPath), readFileSync(join(root, qaPath), 'utf8')
    + '\n\n## Normalized Findings\n\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n'
    + '| CD-PERF-001 | emergent_risk | CD+Tests | resolved | PERFORMANCE_FIX.md; both unchanged performance qualifications pass. | None for this finding; proceed to the current lifecycle owner. |\n');
  const command = { schema_version: '1', target_id: target, run_id: f.runId, expected_revision_id: f.revision(),
    destination: { type: 'QA_REPORT', path: qaPath, digest: artefactFileDigest(root, qaPath), status: 'pass' }, source: { type: 'TP', path: f.prefix + 'TP.md', digest: artefactFileDigest(root, f.prefix + 'TP.md') },
    relationship: { from: 'QA_REPORT', relationship: 'tests', to: 'TP' }, review: { reviewer: 'Synthetic QA mapping reviewer', path: proof, digest: '' }, update_draft: false };
  const { schema_version, target_id, run_id, destination, source, relationship } = command;
  writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, destination, source, relationship, reviewer: command.review.reviewer, reviewed: true }));
  command.review.digest = artefactFileDigest(root, proof); writeFileSync(join(root, request), JSON.stringify(command));
  const qa = await service('agdf_record', { ...bound(), command: { kind: 'artefact.record', payload: { gate: 'QA', reviewed_request: { path: request, digest: artefactFileDigest(root, request) } } } });
  assert.equal(qa.outcome, 'accepted', JSON.stringify(qa));
  for (const gate of ['QA', 'UAT']) {
    const preparedReply = await client.callTool({ name: 'agdf_prepare', arguments: { ...bound(), command: { kind: 'presentation.prepare', payload: { gate } } } });
    const prepare = preparedReply.structuredContent;
    assert.equal(prepare.outcome, 'accepted', JSON.stringify(prepare));
    const view = preparedReply._meta.agdf_decision;
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
          readFileSync(join(root, `.agdf/control/runs/${f.runId}/presentations/${prepare.family_result.presentation_id}.document`), 'utf8'),
          'UAT reads its exact immutable evidence document, independently of the Chat decision layout.');
        assert.match(document.data.document.content, /Available UAT evidence/u);
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
  writeFileSync(join(root, orPath), report);

  const input = { ...bound(), command: { kind: 'closeout.record', payload: { or: { path: orPath, digest: artefactFileDigest(root, orPath) }, confirmation: 'synthetic invalid confirmation' } } };
  const before = readFileSync(f.state, 'utf8');
  const rejected = await service('agdf_closeout', input); assert.equal(rejected.reason, 'closeout_confirmation_required');
  assert.equal(readFileSync(f.state, 'utf8'), before);
  input.command.payload.confirmation = closeoutConfirmation(f.runId, input.expected_revision_id, input.operation_id, input.command.payload.or.digest);
  const result = await service('agdf_closeout', input); assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(result.current.lifecycle, 'completed'); assert.equal(result.current.completion.fulfilled, true); assert.equal(result.current.next_operation, null);
  assert.equal((await service('agdf_closeout', input)).outcome, 'already_applied');
  assert.equal(runSealState(root, readFileSync(f.state, 'utf8')).status, 'valid');
  console.log(`Actual default-entrypoint STDIO ${route}: CD/reviews, reviewed QA recording, exact QA/UAT approvals, OR confirmation, completion and original-UUID replay passed; synthetic disposable decisions only.`);
  });
} finally { fixture.dispose(); }
}
