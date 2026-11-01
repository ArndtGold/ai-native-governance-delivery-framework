// Explicit synthetic impact review over actual current facts in disposable Runs.
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sourceRevisionBoundary } from '../../lib/control-state/run-revision-boundary.js';
import { sourceRevisionQualityFacts } from '../../lib/control-state/run-source-revisions.js';
import { artefactFileDigest } from '../../lib/control-state/run-seal.js';
export function currentSourceProposalValue(run, sourceGate, { operationId = randomUUID(), mutate = () => {} } = {}) {
  const state = run.state(), boundary = sourceRevisionBoundary(state, sourceGate, 2);
  if (!boundary) throw Error('synthetic_revision_boundary_unavailable');
  const read = path => readFileSync(join(run.f.root, path), 'utf8');
  const sources = boundary.sources.map(type => { const path = state.artefacts.get(type).path; return { type, path, digest: artefactFileDigest(run.f.root, path) }; });
  const index = ['UR', 'PRD', 'SD', 'TP'].indexOf(sourceGate), source = sources.find(row => row.type === sourceGate);
  const value = { schema_version: '3', target_id: run.f.base.target_id, run_id: run.id, expected_revision_id: run.binding().expected_revision_id,
    operation_id: operationId, source_gate: sourceGate, reason: 'Synthetic reviewed source change', intended_change: 'Clarify the declared synthetic requirement.', sources,
    impact_assessment: { reviewer: 'Synthetic source owner', earliest_source: sourceGate,
      upstream: sources.slice(0, index).map(row => ({ ...row, rationale: 'The upstream requirement remains unchanged in this synthetic review.' })),
      analyses: ['Brownfield Review', 'UX Intent Definition'].filter(type => state.artefacts.get(type)?.path).map(type => {
        const path = state.artefacts.get(type).path;
        return { type, disposition: sourceGate === 'UR' ? 'reassess' : 'retain', path, digest: artefactFileDigest(run.f.root, path),
          reason: sourceGate === 'UR' ? 'Changed intent requires renewed analysis.' : 'The unchanged existing-system scope retains this exact analytical source.' };
      }), implementation_evidence: 'Disposable synthetic fixture; no production qualification or human acceptance.', unresolved: [] },
    policy_version: 2, initiating_phase: boundary.initiating_phase,
    changed_statements: [{ ...source, statement: read(source.path).replace(/\r\n?/gu,'\n').replace(/^\uFEFF/u,'').split('\n').find(line => line.trim()), intended_change: 'Clarify this exact source statement.', reason: 'The declared source owner reviewed this synthetic change.' }],
    quality_assessment: sourceRevisionQualityFacts(state, read).map(row => ({ ...row, disposition: sourceGate !== 'UR' && ['Brownfield Review', 'UX Intent Definition'].includes(row.record.type) ? 'retain' : 'reassess', reason: 'Retain only the explicitly unchanged upstream analysis; renew affected fulfillment and evidence association.' })) };
  mutate(value);
  return value;
}
export function currentSourceProposal(run, sourceGate, { operationId = randomUUID(), mutate = () => {} } = {}) {
  const value = currentSourceProposalValue(run, sourceGate, { operationId, mutate });
  const reference = run.f.material(run.binding(), 'EVIDENCE', JSON.stringify(value));
  const request = kind => run.f.request(kind, { source_gate: sourceGate, proposal: reference }, { ...run.binding(), operation_id: operationId });
  const preview = request('source_revision.preview');
  return { value, reference, preview, operationId, apply: inspected => ({ ...request('source_revision.apply'), command: { kind: 'source_revision.apply', payload: {
    source_gate: sourceGate, proposal: reference, preview_digest: inspected.family_result.preview_digest, confirmation: inspected.family_result.confirmation_selector } } }) };
}
