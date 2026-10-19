import { readFileSync, statSync } from '../control-read/fs.js';
import { canonicalJson, digest, DIGEST_PATTERN } from './approval-command-contract.js';
import { canonicalRunText } from './run-seal.js';
import { containedRegularFile } from './contained-file.js';
import { readRunOperations } from './run-operations.js';
import { readApprovalOperations } from './approval-operations.js';
import { READ_LIMITS } from '../control-read/snapshot.js';
import { STRUCTURED_REQUIRED_REVIEWS, CORRECTABLE_REVIEWS } from './evidence-bindings.js';

export const decisionRemediationOwner = gate => ({ UR: 'ur-definition', PRD: 'prd-definition', SD: 'sd-definition', TP: 'tp-definition', QA: 'qa-gate', UAT: 'delivery-closeout' })[gate] ?? null;
const prerequisiteTypes = {
  UR: ['UR'], PRD: ['UR', 'PRD'],
  SD: ['UR', 'PRD', 'SD'],
  TP: ['UR', 'PRD', 'SD', 'TP'],
  QA: ['UR', 'PRD', 'SD', 'TP', 'Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR', 'QA'],
  UAT: ['UR', 'PRD', 'SD', 'TP', 'Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR', 'QA'],
};

// Version is actual material, not a new envelope, recording UUID, Run revision or comment.
// Archived/proposed state supplies its own byte reader; it cannot adopt current bytes.
export function decisionMaterial(root, state, gate, { readArtefact } = {}) {
  const types = prerequisiteTypes[gate];
  if (!types || !state.run_id) return { available: false, reason: 'decision_material_unavailable' };
  const sources = [];
  try {
    for (const type of types) {
      const row = state.artefacts.get(type) ?? state.artefacts.get({ CR: 'Code Review', 'Clean Implementation Review': 'Clean Review' }[type]);
      if (!row?.path) { if (type === gate || gate === 'UAT' && type === 'QA') throw Error(); continue; }
      let content;
      if (readArtefact) content = readArtefact(row.path);
      else { const file = containedRegularFile(root, row.path); if (file.status !== 'valid' || statSync(file.path).size > READ_LIMITS.file) throw Error(); content = readFileSync(file.path, 'utf8'); }
      if (typeof content !== 'string' || !content.trim() || Buffer.byteLength(content) > READ_LIMITS.file) throw Error();
      sources.push({ type, path: row.path, digest: digest(canonicalRunText(content)) });
    }
    const material = { run_id: state.run_id, gate, sources };
    return { available: true, ...material, material_version: digest(`agdf-decision-material/1\0${canonicalJson(material)}`) };
  } catch { return { available: false, reason: 'decision_material_unavailable' }; }
}

export function validDecisionMaterial(sources, runId) {
  return Array.isArray(sources) && sources.length > 0 && sources.length <= 12
    && new Set(sources.map(s => s?.type)).size === sources.length
    && sources.every(s => s && Object.keys(s).sort().join(',') === 'digest,path,type' && typeof s.type === 'string'
      && typeof s.path === 'string' && s.path.startsWith(`.agdf/control/artefacts/${runId}/`)
      && !s.path.includes('..') && DIGEST_PATTERN.test(s.digest ?? ''));
}

export const decisionMaterialVersion = (runId, gate, sources) => digest(`agdf-decision-material/1\0${canonicalJson({ run_id: runId, gate, sources })}`);

export function projectPresentationDecision(state, gate, material) {
  if (!material.available) return { available: false, decided: false, reason: material.reason };
  const internal = readRunOperations(state.content), approvals = readApprovalOperations(state.content);
  if (!internal.valid || !approvals.valid) return { available: false, decided: false, reason: 'decision_receipts_invalid' };
  const approval = state.approvals.get(gate), currentPresentation = approval?.evidence?.match(/presentation ([0-9a-f-]{36}) /u)?.[1];
  const decisions = [
    ...internal.receipts.filter(r => r.kind === 'presentation_decision.record' && r.effect.record.gate === gate && r.effect.record.material_version === material.material_version)
      .map(receipt => ({ action: receipt.effect.record.action, receipt, owner: receipt.effect.record.owner })),
    ...approvals.receipts.filter(r => ['2', '3'].includes(r.schema_version) && r.binding.gate === gate && r.effect.material_version === material.material_version
      && approval?.status === 'approved' && r.binding.presentation_id === currentPresentation)
      .map(receipt => ({ action: 'approve', receipt, owner: null })),
  ];
  if (decisions.length > 1) return { available: false, decided: true, reason: 'decision_version_ambiguous', material_version: material.material_version };
  return { available: true, decided: decisions.length === 1, material_version: material.material_version, sources: material.sources,
    ...(decisions[0] ?? {}), authorizes: false };
}

export function presentationDecisionState(root, state, gate, options = {}) {
  return projectPresentationDecision(state, gate, decisionMaterial(root, state, gate, options));
}

// The material receipt of the current approval of a gate, located by its presentation id.
function currentApprovalReceipt(state, gate, operations = readApprovalOperations(state.content ?? '')) {
  const id = state.approvals?.get(gate)?.evidence?.match(/presentation ([0-9a-f-]{36}) /u)?.[1];
  return operations.receipts.find(r => ['2', '3'].includes(r.schema_version) && r.binding.gate === gate && r.binding.presentation_id === id) ?? null;
}

// Material types of the current approval of a gate: 'recorded' with its receipt's source
// types, 'unrecorded' for an approval without a material receipt (legacy), or 'invalid'
// when the receipts cannot be read. Callers fail closed on 'invalid'.
export function approvalMaterialTypes(state, gate) {
  const approval = state.approvals?.get(gate);
  if (approval?.status !== 'approved') return { status: 'unapproved', types: new Set() };
  const operations = readApprovalOperations(state.content ?? '');
  if (!operations.valid) return { status: 'invalid', types: new Set() };
  const receipt = currentApprovalReceipt(state, gate, operations);
  return receipt ? { status: 'recorded', types: new Set(receipt.effect.material_sources.map(source => source.type)) } : { status: 'unrecorded', types: new Set() };
}

// For each review: the version the approvals saw (its last step receipt before the current
// UAT approval; CR includes the quick-task review step) and every later recording. Missing
// or invalid ledgers, or a UAT approval without a material receipt, prove nothing.
function reviewRecordingChains(state) {
  const chains = new Map();
  if (state.approvals?.get('UAT')?.status !== 'approved') return chains;
  const approvals = readApprovalOperations(state.content ?? ''), operations = readRunOperations(state.content ?? '');
  const uat = approvals.valid ? currentApprovalReceipt(state, 'UAT', approvals) : null;
  if (!uat || !operations.valid) return chains;
  for (const type of CORRECTABLE_REVIEWS) {
    const steps = operations.receipts.filter(r => r.kind === 'step.record' && (r.effect.record.step === type || type === 'CR' && r.effect.record.step === 'review'));
    const seen = steps.filter(r => r.effect.revision < uat.effect.revision).at(-1)?.effect.record;
    if (seen) chains.set(type, { seen, later: steps.filter(r => r.effect.revision > uat.effect.revision).map(r => r.effect.record) });
  }
  return chains;
}
export const reviewRecordingChain = (state, type) => reviewRecordingChains(state).get(type) ?? null;

// After Approval: UAT a review can be recorded only through the OR correction path or the
// D4 late path, so later receipts at the same path with the status of the version the
// approvals saw prove a correction. Maps type -> { seen_digest, current_digest }.
export function reviewCorrections(state) {
  const corrections = new Map();
  for (const [type, { seen, later }] of reviewRecordingChains(state)) {
    const current = later.at(-1), row = state.artefacts?.get(type);
    if (!current || later.some(record => record.status !== seen.status || record.source.path !== seen.source.path)
      || row?.path !== current.source.path || row.status !== current.status) continue;
    corrections.set(type, { seen_digest: seen.source.digest, current_digest: current.source.digest });
  }
  return corrections;
}

// Only a positively matched current row/receipt is tested. Legacy approvals are
// not retrospectively assigned a material/source association they never recorded.
export function approvedMaterialFindings(state, decisions) {
  const receipts = readApprovalOperations(state.content).receipts, corrections = reviewCorrections(state);
  return [...state.approvals].flatMap(([gate, approval]) => {
    if (approval.status !== 'approved') return [];
    const id = approval.evidence?.match(/presentation ([0-9a-f-]{36}) /u)?.[1];
    const receipt = receipts.find(r => ['2', '3'].includes(r.schema_version) && r.binding.gate === gate && r.binding.presentation_id === id);
    if (!receipt) return [];
    const material = decisions.get(gate);
    if (material?.available && material.material_version === receipt.effect.material_version) return [];
    // A required review the approval never saw (absent from its recorded material) may be
    // recorded later for closeout, and a proven correction of a review it saw is compared as
    // the version it saw; everything else the approval saw must still match exactly.
    const seen = new Set(receipt.effect.material_sources.map(source => source.type));
    const unseenReviews = source => STRUCTURED_REQUIRED_REVIEWS.includes(source.type) && !seen.has(source.type);
    const corrected = source => {
      const correction = corrections.get(source.type);
      return correction && source.digest === correction.current_digest ? { ...source, digest: correction.seen_digest } : source;
    };
    const exempt = material?.available
      && decisionMaterialVersion(state.run_id, gate, material.sources.filter(source => !unseenReviews(source)).map(corrected)) === receipt.effect.material_version;
    return exempt ? [] : [{ gate, reason: 'approved_material_sources_changed', operation_id: receipt.operation_id }];
  });
}
