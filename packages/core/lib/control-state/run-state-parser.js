import { scalarFields } from "./run-state-document.js";
export { scalarFields, sectionTableRows, duplicateArtefactRowTypes, parseArtefactPathCell, parseControlState } from "./run-state-document.js";
import { normalizeLineEndings } from "./run-text.js";
export { normalizeLineEndings } from "./run-text.js";
import { readRunOperations } from "./run-operations.js";
import { readEvidenceBindings } from './evidence-bindings.js';
import { readApprovalOperations } from "./approval-operations.js";
import { REVISION_ID_PATTERN, RUN_ID_PATTERN } from "./run-identity.js";
import { readSourceRevisions } from "./run-source-revisions.js";
import { readArtefactBindings } from "./artefact-bindings.js";

export { RUN_ID_PATTERN } from "./run-identity.js";
export const LIFECYCLES = new Set([
  "active",
  "completed",
  "superseded",
  "abandoned",
]);

export function parseRunState(content, expected) {
  const { values, duplicates } = scalarFields(content),
    findings = duplicates.map((field) => ({
      code: "AGDF_RUN_FIELD_DUPLICATE",
      field,
    })),
    id = values.get("run_id") ?? "";
  if (content.split(/\r?\n/).some((line) => line.trimStart().startsWith("|") && !line.trimEnd().endsWith("|"))) {
    findings.push({ code: "AGDF_RUN_TABLE_INVALID" });
  }
  if (!RUN_ID_PATTERN.test(id)) findings.push({ code: "AGDF_RUN_ID_INVALID" });
  if (expected && id !== expected)
    findings.push({ code: "AGDF_RUN_PATH_MISMATCH" });
  const version = values.get('control_state_version');
  if (version !== '2') {
    const unsupported = /^[1-9]\d*$/u.test(version ?? '') && !duplicates.includes('control_state_version');
    findings.push({ code: unsupported ? 'AGDF_RUN_VERSION_UNSUPPORTED' : 'AGDF_RUN_VERSION_INVALID',
      actual_version: version ?? null, classification: unsupported ? 'unsupported_version' : 'unclassified' });
  }
  if (!LIFECYCLES.has(values.get("lifecycle")))
    findings.push({ code: "AGDF_RUN_LIFECYCLE_INVALID" });
  if (!/^[1-9]\d*$/.test(values.get("revision") ?? ""))
    findings.push({ code: "AGDF_RUN_REVISION_INVALID" });
  const updatedAt = values.get("updated_at");
  if (updatedAt && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(updatedAt)
      || Number.isNaN(Date.parse(updatedAt)))) {
    findings.push({ code: "AGDF_RUN_UPDATED_AT_INVALID" });
  }
  if (!REVISION_ID_PATTERN.test(values.get("revision_id") ?? ""))
    findings.push({ code: "AGDF_RUN_REVISION_ID_INVALID" });
  const operations = readApprovalOperations(content);
  const effectIds = new Set(), effectRevisions = new Set();
  let lastEffectRevision = 0;
  const invalidHistory = operations.receipts.some((receipt) => {
    const invalid = effectIds.has(receipt.effect.resulting_revision_id) || effectRevisions.has(receipt.effect.revision)
      || receipt.effect.revision <= lastEffectRevision;
    effectIds.add(receipt.effect.resulting_revision_id); effectRevisions.add(receipt.effect.revision);
    lastEffectRevision = receipt.effect.revision;
    return invalid;
  });
  if (!operations.valid || invalidHistory || operations.receipts.some((receipt) => receipt.binding.run_id !== id
      || receipt.effect.revision > Number(values.get("revision"))
      || (receipt.effect.revision === Number(values.get("revision")) && receipt.effect.resulting_revision_id !== values.get("revision_id")))) {
    findings.push({ code: "AGDF_APPROVAL_OPERATIONS_INVALID" });
  }
  const revisions = readSourceRevisions(content);
  const bindings = readArtefactBindings(content);
  if (!revisions.valid || revisions.receipts.some(row => row.run_id !== id || row.revision > Number(values.get("revision"))
      || operations.receipts.some(item => item.operation_id === row.operation_id
        || item.effect.resulting_revision_id === row.resulting_revision_id || item.effect.revision === row.revision)
      || bindings.receipts.some(item => item.operation.id === row.operation_id
        || item.operation.resulting_revision_id === row.resulting_revision_id || item.operation.revision === row.revision)
      || row.invalidated_bindings.some(bindingId => !bindings.receipts.some(item => item.binding_id === bindingId && item.operation.revision < row.revision))
      || row.revision === Number(values.get("revision")) && row.resulting_revision_id !== values.get("revision_id"))) {
    findings.push({ code: "AGDF_SOURCE_REVISIONS_INVALID" });
  }
  const runOperations = readRunOperations(content);
  const evidenceBindings = readEvidenceBindings(content);
  if (!evidenceBindings.valid || evidenceBindings.bindings.some(row => row.run_id !== id
    || (['step.record', 'ur_draft.replace'].includes(row.action)
      ? !runOperations.receipts.some(r => r.operation_id === row.operation_id && r.kind === row.action && r.effect.record.step === row.step
          && r.effect.record.source.path === row.report.path && r.effect.record.source.digest === row.report.digest && r.effect.record.source_set_digest === row.source_set_digest)
      : !bindings.receipts.some(r => r.operation.id === row.operation_id && r.relationship.from === (row.step === 'QA' ? 'QA_REPORT' : row.step)
          && r.destination.path === row.report.path && r.destination.digest === row.report.digest)))) findings.push({ code: 'AGDF_EVIDENCE_BINDINGS_INVALID' });
  const existingEffects = [
    ...operations.receipts.map(r => ({ id: r.operation_id, revision: r.effect.revision, next: r.effect.resulting_revision_id })),
    ...bindings.receipts.map(r => ({ id: r.operation.id, revision: r.operation.revision, next: r.operation.resulting_revision_id })),
    ...revisions.receipts.map(r => ({ id: r.operation_id, revision: r.revision, next: r.resulting_revision_id })),
  ];
  if (!runOperations.valid || runOperations.receipts.some(r => r.run_id !== id
      || r.effect.revision > Number(values.get("revision"))
      || r.effect.revision === Number(values.get("revision")) && r.effect.resulting_revision_id !== values.get("revision_id")
      || existingEffects.some(e => e.id === r.operation_id || e.revision === r.effect.revision || e.next === r.effect.resulting_revision_id))) {
    findings.push({ code: "AGDF_RUN_OPERATIONS_INVALID" });
  }
  return {
    content,
    meta: Object.fromEntries(values),
    findings,
    valid: !findings.length,
  };
}
export function semanticBody(content) {
  return content
    .replace(/^# AGDF Run State\s*/m, "")
    .replace(/## Run Meta[\s\S]*?(?=\n## )/, "")
    .trim();
}
export function semanticFingerprint(content) {
  return semanticBody(content).replace(/\s+/g, " ");
}
