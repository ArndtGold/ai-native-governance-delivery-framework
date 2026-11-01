import { inspectArtefactRecordingMode } from '../../../core/lib/control-state/run-artefact-recording.js';
import { currentFixture } from '../../../core/test/fixtures/current-run.js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { createSdDefinitionTestRun, syntheticSd } from './sd-definition.js';
import { syntheticTp } from './tp-definition.js';
import { parseRunState } from '../../../core/lib/control-state/run-state-parser.js';
import { prepareRunContentState } from '../../../core/lib/control-evaluation/run-state.js';
import { createCoreServices } from '../../../core/lib/index.js';
import { resolveControlCommandTarget } from '../../../core/lib/control-state/approval-command-contract.js';
import { currentSourceProposalValue } from '../../../core/test/fixtures/current-source-proposal.js';
import { artefactFileDigest } from '../../../core/lib/control-state/run-seal.js';
export { syntheticTp };

// Current sources and typed receipts only; positive approvals are synthetic.
export function createLateSourceRevisionTestRun(root, validator, runId = 'late-source-test', env = process.env,
  { tpEncoding = 'lf', route = 'structured_delivery', prepare = true, uxRecorded = false } = {}) {
  const f = createSdDefinitionTestRun(root, validator, runId, env, { route, uxRecorded, uxRequired: uxRecorded });
  const state = () => parseRunState(readFileSync(f.state, 'utf8'), runId);
  const control = () => prepareRunContentState(root, readFileSync(f.state, 'utf8'), f.state);
  const recordSource = gate => { const result = f.recordGate(gate, inspectArtefactRecordingMode(control(), gate).update_draft); assert.equal(result.value?.outcome, 'accepted', result.text); return result.value; };
  const approveSource = gate => {
    const prepared = f.present(gate); assert.equal(prepared.value?.outcome, 'accepted', prepared.text);
    const approval = f.approve(gate, prepared.value.family_result.presentation_id); assert.equal(approval.value?.outcome, 'accepted', approval.text);
    return { prepared: prepared.value, approval: approval.value };
  };
  const prepareImplementation = () => {
    const path = relative(root, f.file('BROWNFIELD_ANALYSIS.md')).split('\\').join('/');
    writeFileSync(join(root, path), '# Brownfield Analysis\n\nDecision: pass\n\nSynthetic current preparation reuses the existing filter store and tests.\n');
    const cleanup = [], current = currentFixture({ after(fn) { cleanup.push(fn); } }, { root, initialize: false });
    let result;
    try {
      const binding = { run_id: runId, expected_revision_id: f.revision() };
      result = current.call('step.record', { step: 'internal', internal_step: 'Brownfield Analysis', decision: 'pass',
        source: current.material(binding, 'Brownfield Analysis', readFileSync(join(root, path), 'utf8')) }, binding);
    } finally { for (const close of cleanup.reverse()) close(); }
    assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  };
  writeFileSync(f.file('SD.md'), syntheticSd()); recordSource('SD'); approveSource('SD');
  writeFileSync(f.file('TP.md'), tpEncoding === 'crlf_bom' ? '\ufeff' + syntheticTp().replace(/\n/gu, '\r\n') : syntheticTp());
  recordSource('TP'); approveSource('TP'); if (prepare) prepareImplementation();
  const proposal = (sourceGate, analyses = 'retain', operationId = randomUUID()) => sourceRevisionTestProposal(root, { ...f, control }, sourceGate, analyses, operationId);
  return { ...f, readState: state, control, recordSource, approveSource, prepareImplementation, proposal };
}
export function sourceRevisionTestProposal(root, f, sourceGate, analyses = 'retain', operationId = randomUUID()) {
  const context = { id: f.runId, state: f.control, binding: () => ({ expected_revision_id: f.revision() }),
    f: { root, base: { target_id: resolveControlCommandTarget(root).target_id } } };
  const value = currentSourceProposalValue(context, sourceGate, { operationId, mutate(value) {
    if (analyses === 'retain' || sourceGate === 'UR') return;
    for (const row of value.impact_assessment.analyses) row.disposition = analyses;
    for (const row of value.quality_assessment.filter(row => ['Brownfield Review', 'UX Intent Definition'].includes(row.record.type))) row.disposition = analyses;
  } });
  const evidence = `.agdf/control/runs/${f.runId}/evidence/proposals/${operationId}.json`; mkdirSync(dirname(join(root, evidence)), { recursive: true }); writeFileSync(join(root, evidence), JSON.stringify(value));
  return { input: { runId: f.runId, revisionId: f.revision(), operationId, sourceGate, evidence }, value };
}
