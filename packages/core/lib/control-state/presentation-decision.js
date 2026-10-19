import { readFileSync, statSync } from '../control-read/fs.js';
import { canonicalJson, digest } from './approval-command-contract.js';
import { canonicalRunText } from './run-text.js';
import { containedRegularFile } from './contained-file.js';
import { readRunOperations } from './run-operations.js';
import { readApprovalOperations } from './approval-operations.js';
import { READ_LIMITS } from '../control-read/snapshot.js';

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

export { validDecisionMaterial, decisionMaterialVersion } from './decision-material-contract.js';

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

// Only a positively matched current row/receipt is tested. Legacy approvals are
// not retrospectively assigned a material/source association they never recorded.
export function approvedMaterialFindings(state, decisions) {
  const receipts = readApprovalOperations(state.content).receipts;
  return [...state.approvals].flatMap(([gate, approval]) => {
    if (approval.status !== 'approved') return [];
    const id = approval.evidence?.match(/presentation ([0-9a-f-]{36}) /u)?.[1];
    const receipt = receipts.find(r => ['2', '3'].includes(r.schema_version) && r.binding.gate === gate && r.binding.presentation_id === id);
    if (!receipt) return [];
    const material = decisions.get(gate);
    return material?.available && material.material_version === receipt.effect.material_version ? []
      : [{ gate, reason: 'approved_material_sources_changed', operation_id: receipt.operation_id }];
  });
}
