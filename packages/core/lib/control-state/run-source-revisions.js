import { TextDecoder } from "node:util";
import { canonicalJson, digest, DIGEST_PATTERN, exactObject, COOPERATIVE_ASSURANCE } from "./approval-command-contract.js";
import { REVISION_ID_PATTERN, RUN_ID_PATTERN } from "./run-identity.js";
import { isSafeControlRelativePath } from "./contained-file.js";
import { parseControlState } from "./run-state-document.js";
import { APPROVAL_GATES } from "./run-identity.js";
import { evidenceApplicability } from './evidence-bindings.js';
import { REVISION_STATEMENT_FIELDS, REVISION_QUALITY_FIELDS, REVISION_IMPACT_FIELDS, REVISION_UPSTREAM_FIELDS, REVISION_ANALYSIS_FIELDS } from './recording-formats.js';

export const SOURCE_GATES = Object.freeze(["UR", "PRD", "SD", "TP"]);
export const sourceRevisionConfirmation = ({ runId, revisionId, operationId, sourceGate, previewDigest }) =>
  `Apply source revision: ${runId} ${revisionId} ${operationId} ${sourceGate} ${previewDigest}`;
const uuid = value => typeof value === "string" && REVISION_ID_PATTERN.test(value);
const hashes = value => typeof value === "string" && DIGEST_PATTERN.test(value);
const fields = ["schema_version", "operation_id", "target_id", "run_id", "source_gate", "request_digest", "preview_digest", "previous_revision_id", "resulting_revision_id", "revision", "invalidated_bindings", "analyses", "retained_sources", "archive", "reason"];
export const sourceRevisionDigest = value => digest(`agdf-source-revision/1\0${canonicalJson(value)}`);
export const revisionHistoryPrefix = (runId, operationId) => `.agdf/control/runs/${runId}/revisions/${operationId}/`;

// One inventory for live preview and immutable archive validation. No inferred
// association can preserve fulfillment; the original writer owns consumed sources.
export function sourceRevisionQualityFacts(state, readArtefact) {
  const applicability = evidenceApplicability(state, readArtefact);
  if (!applicability.valid) throw Error('AGDF_EVIDENCE_BINDINGS_INVALID');
  const facts = [];
  for (const [type, record] of state.artefacts) {
    if (SOURCE_GATES.includes(type) || !record.path) continue;
    const text = readArtefact(record.path);
    if (typeof text !== 'string') throw Error('AGDF_REVISION_QUALITY_UNAVAILABLE');
    const binding = applicability.by_step.get(type === 'QA_REPORT' ? 'QA' : type)
      ?? applicability.current.find(row => row.report.path === record.path);
    const matched = binding?.report.path === record.path && binding.report.digest === digest(text.replace(/\r\n?/gu, '\n').replace(/^\uFEFF/u, ''));
    facts.push({ record: { type, path: record.path, digest: digest(text.replace(/\r\n?/gu, '\n').replace(/^\uFEFF/u, '')), status: record.status },
      record_digest: digest(canonicalJson(record)), operation_id: matched ? binding.operation_id : null,
      source_set_digest: matched ? binding.source_set_digest : null, sources: matched ? binding.sources : [],
      association: matched ? binding.applicability : 'applicability_unknown' });
  }
  for (const record of state.evidence_refs ?? []) {
    const path = String(record.source).replace(/^`|`$/gu, '');
    const binding = applicability.current.find(row => row.report.path === path);
    const text = isSafeControlRelativePath(path) ? readArtefact(path) : undefined;
    facts.push({ record: { type: 'evidence', path: typeof text === 'string' ? path : '', digest: typeof text === 'string' ? digest(text.replace(/\r\n?/gu, '\n').replace(/^\uFEFF/u, '')) : null, status: 'documented' },
      record_digest: digest(canonicalJson(record)), operation_id: binding?.operation_id ?? null,
      source_set_digest: binding?.source_set_digest ?? null, sources: binding?.sources ?? [],
      association: binding ? 'current' : 'applicability_unknown' });
  }
  return facts;
}

export function validExpandedRevisionProof(proposal, state, readArtefact, phase) {
  const changed = proposal.changed_statements, affected = SOURCE_GATES.slice(SOURCE_GATES.indexOf(proposal.source_gate));
  const nonempty = value => typeof value === 'string' && value.trim() && value.length <= 4096;
  const assessmentProof = proposal.impact_assessment, index = SOURCE_GATES.indexOf(proposal.source_gate);
  const analyticalTypes = ['Brownfield Review', 'UX Intent Definition'].filter(type => state.artefacts.get(type)?.path);
  if (!exactObject(assessmentProof, REVISION_IMPACT_FIELDS) || !nonempty(assessmentProof.reviewer)
    || assessmentProof.earliest_source !== proposal.source_gate || !nonempty(assessmentProof.implementation_evidence)
    || !Array.isArray(assessmentProof.unresolved) || assessmentProof.unresolved.length
    || !Array.isArray(assessmentProof.upstream) || assessmentProof.upstream.length !== index
    || !assessmentProof.upstream.every((row, i) => exactObject(row, REVISION_UPSTREAM_FIELDS) && nonempty(row.rationale)
      && canonicalJson({type:row.type,path:row.path,digest:row.digest}) === canonicalJson(proposal.sources[i]))
    || !Array.isArray(assessmentProof.analyses) || assessmentProof.analyses.length !== analyticalTypes.length
    || !assessmentProof.analyses.every((row, i) => exactObject(row, REVISION_ANALYSIS_FIELDS) && row.type === analyticalTypes[i]
      && row.path === state.artefacts.get(row.type).path && hashes(row.digest) && nonempty(row.reason)
      && ['retain', 'reassess'].includes(row.disposition) && (proposal.source_gate !== 'UR' || row.disposition === 'reassess'))) return false;
  if (proposal.policy_version !== 2 || proposal.initiating_phase !== phase || !Array.isArray(changed) || !changed.length
      || !changed.every(row => exactObject(row, REVISION_STATEMENT_FIELDS) && affected.includes(row.type)
        && proposal.sources.some(source => source.type === row.type && source.path === row.path && source.digest === row.digest)
        && [row.statement, row.intended_change, row.reason].every(nonempty)
        && String(readArtefact(row.path)).replace(/\r\n?/gu, '\n').includes(row.statement))
      || !changed.some(row => row.type === proposal.source_gate)) return false;
  const facts = sourceRevisionQualityFacts(state, readArtefact), assessment = proposal.quality_assessment;
  if (!Array.isArray(assessment) || !assessment.length || assessment.length !== facts.length) return false;
  return assessment.every((row, i) => {
    if (!exactObject(row, REVISION_QUALITY_FIELDS) || !['retain', 'reassess'].includes(row.disposition) || !nonempty(row.reason)) return false;
    const { disposition, reason, ...proof } = row;
    if (canonicalJson(proof) !== canonicalJson(facts[i])) return false;
    const analysis = proposal.impact_assessment.analyses.find(item => item.type === row.record.type);
    if (analysis && (analysis.disposition !== disposition || analysis.path !== row.record.path || analysis.digest !== row.record.digest)) return false;
    return disposition !== 'retain' || row.association === 'current'
      && !row.sources.some(source => affected.includes(source.type))
      && !(proposal.source_gate === 'UR' && analysis);
  });
}

export function sourceRevisionImpact(proposal, activeBindings) {
  const index = SOURCE_GATES.indexOf(proposal.source_gate), affected = SOURCE_GATES.slice(index);
  const expanded = proposal.schema_version === '2';
  return { source_gate: proposal.source_gate, retained: SOURCE_GATES.slice(0, index), superseded: affected,
    invalidated_bindings: activeBindings.filter(row => affected.includes(row.destination.type)
      || expanded && ['QA', 'QA_REPORT'].includes(row.destination.type)).map(row => row.binding_id),
    analyses: proposal.impact_assessment.analyses, invalidated_steps: expanded
      ? [...new Set(['Brownfield Analysis', 'CD+Tests', 'CR', ...proposal.quality_assessment.filter(row => row.disposition === 'reassess' && row.record.type !== 'evidence').map(row => row.record.type)])]
      : ["Brownfield Analysis", "CD+Tests", "CR"],
    retained_work: "Code and test files are retained; fulfillment and evidence require the renewed TP.",
    next_gate: proposal.source_gate !== "UR" && proposal.impact_assessment.analyses.some(row => row.type === "Brownfield Review" && row.disposition === "reassess") ? "Brownfield Review" : proposal.source_gate,
    implementation_authority: false,
    ...(expanded ? { policy_version: 2, initiating_phase: proposal.initiating_phase,
      changed_statements: proposal.changed_statements, quality_assessment: proposal.quality_assessment,
      invalidated_quality: proposal.quality_assessment.filter(row => row.disposition === 'reassess'),
      renewed_approvals: [...affected, 'QA', 'UAT'], pending_presentations: 'superseded by exact material-version guard' } : {}) };
}

export function validSourceRevision(row) {
  const commandFields = ['command_digest', 'confirmation_digest', 'proposal_reference', 'producer', 'assurance'];
  const expandedFields = ['policy_version', 'initiating_phase', 'impact_digest', 'quality_digest'];
  if (!exactObject(row, row.schema_version === '3' ? [...fields, ...commandFields, ...expandedFields] : row.schema_version === '2' ? [...fields, ...commandFields] : fields) || !['1', '2', '3'].includes(row.schema_version) || !uuid(row.operation_id)
      || !RUN_ID_PATTERN.test(row.run_id ?? "") || !SOURCE_GATES.includes(row.source_gate)
      || ![row.target_id, row.request_digest, row.preview_digest].every(hashes)
      || ![row.previous_revision_id, row.resulting_revision_id].every(uuid)
      || row.previous_revision_id === row.resulting_revision_id
      || !Number.isSafeInteger(row.revision) || row.revision < 2
      || typeof row.reason !== "string" || !row.reason.trim() || row.reason.length > 4096
      || !Array.isArray(row.invalidated_bindings) || !row.invalidated_bindings.every(uuid)
      || new Set(row.invalidated_bindings).size !== row.invalidated_bindings.length
      || !Array.isArray(row.analyses) || !row.analyses.every(item => exactObject(item, ["type", "disposition", "path", "digest", "reason"])
        && ["Brownfield Review", "UX Intent Definition"].includes(item.type)
        && ["retain", "reassess"].includes(item.disposition) && hashes(item.digest)
        && isSafeControlRelativePath(item.path) && item.path.startsWith(`.agdf/control/artefacts/${row.run_id}/`)
        && typeof item.reason === "string" && item.reason.trim() && item.reason.length <= 4096)
      || new Set(row.analyses.map(item => item.type)).size !== row.analyses.length
      || !Array.isArray(row.retained_sources) || row.retained_sources.length !== SOURCE_GATES.indexOf(row.source_gate)
      || !row.retained_sources.every((item, i) => exactObject(item, ["type", "path", "digest", "rationale"])
        && item.type === SOURCE_GATES[i] && item.path === `.agdf/control/artefacts/${row.run_id}/${item.type}.md`
        && hashes(item.digest) && typeof item.rationale === "string" && item.rationale.trim() && item.rationale.length <= 4096)
      || !exactObject(row.archive, ["path", "digest"]) || !hashes(row.archive.digest)
      || row.archive.path !== `${revisionHistoryPrefix(row.run_id, row.operation_id)}manifest.json`) return false;
  if (['2', '3'].includes(row.schema_version) && (![row.command_digest, row.confirmation_digest].every(hashes)
    || !exactObject(row.proposal_reference, ['path', 'digest']) || !hashes(row.proposal_reference.digest)
    || !isSafeControlRelativePath(row.proposal_reference.path) || !row.proposal_reference.path.startsWith(`.agdf/control/artefacts/${row.run_id}/`)
    || !exactObject(row.producer, ['contract', 'package_version']) || row.producer.contract !== 'run-command/1' || typeof row.producer.package_version !== 'string'
    || canonicalJson(row.assurance) !== canonicalJson(COOPERATIVE_ASSURANCE)
    || row.confirmation_digest !== digest(sourceRevisionConfirmation({ runId: row.run_id, revisionId: row.previous_revision_id, operationId: row.operation_id, sourceGate: row.source_gate, previewDigest: row.preview_digest })))) return false;
  if (row.schema_version === '3' && (row.policy_version !== 2 || !['PRD', 'SD', 'TP', 'CD+Tests', 'QA', 'UAT'].includes(row.initiating_phase)
    || ![row.impact_digest, row.quality_digest].every(hashes))) return false;
  return row.source_gate !== "UR" || row.analyses.every(item => item.disposition === "reassess");
}

// This history is authority only as part of the sealed Run, never a second workflow store.
export function readSourceRevisions(content) {
  const lines = String(content).replace(/\r\n?/gu, "\n").split("\n");
  const starts = lines.flatMap((line, i) => /^## Source Revisions\s*$/u.test(line) ? [i] : []);
  if (!starts.length) return { present: false, valid: true, receipts: [] };
  const invalid = () => ({ present: true, valid: false, receipts: [] });
  if (starts.length !== 1) return invalid();
  const start = starts[0]; let end = start + 1;
  while (end < lines.length && !/^#{1,2} /u.test(lines[end])) end++;
  const body = lines.slice(start + 1, end).map(line => line.trim()).filter(Boolean);
  if (body[0] !== "- schema_version: 1" || body[1] !== "| operation_id | receipt_digest | receipt |"
      || !/^\|[-:|\s]+\|$/u.test(body[2] ?? "")) return invalid();
  const receipts = [], ids = new Set(), effects = new Set(); let revision = 1;
  for (const line of body.slice(3)) {
    const cells = line.match(/^\| ([^|]+) \| ([^|]+) \| ([A-Za-z0-9_-]+) \|$/u);
    if (!cells || cells[3].length > 131072) return invalid();
    try {
      const bytes = Buffer.from(cells[3], "base64url");
      const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes), row = JSON.parse(json);
      if (bytes.toString("base64url") !== cells[3] || canonicalJson(row) !== json || !validSourceRevision(row)
          || row.operation_id !== cells[1] || sourceRevisionDigest(row) !== cells[2] || ids.has(row.operation_id)
          || effects.has(row.resulting_revision_id) || row.revision <= revision) return invalid();
      receipts.push(row); ids.add(row.operation_id); effects.add(row.resulting_revision_id); revision = row.revision;
    } catch { return invalid(); }
  }
  return receipts.length ? { present: true, valid: true, receipts, start, end } : invalid();
}

export function appendSourceRevision(content, receipt) {
  const history = readSourceRevisions(content);
  if (!history.valid || !validSourceRevision(receipt)) throw Error("AGDF_SOURCE_REVISIONS_INVALID");
  const block = ["## Source Revisions", "", "- schema_version: 1", "", "| operation_id | receipt_digest | receipt |", "|---|---|---|",
    ...[...history.receipts, receipt].map(row => `| ${row.operation_id} | ${sourceRevisionDigest(row)} | ${Buffer.from(canonicalJson(row)).toString("base64url")} |`), ""];
  const lines = String(content).split("\n");
  const next = history.present ? [...lines.slice(0, history.start), ...block, ...lines.slice(history.end)].join("\n")
    : `${String(content).trimEnd()}\n\n${block.join("\n")}`;
  if (!readSourceRevisions(next).valid) throw Error("AGDF_SOURCE_REVISIONS_INVALID");
  return next;
}

export function assertSourceRevisionsChange(before, after, appended) {
  const old = readSourceRevisions(before), next = readSourceRevisions(after);
  if (!old.valid || !next.valid || next.present !== (old.present || Boolean(appended))
      || canonicalJson(next.receipts) !== canonicalJson(appended ? [...old.receipts, appended] : old.receipts)) {
    throw Error("AGDF_SOURCE_REVISIONS_CHANGED");
  }
}

export function bindingIsEffective(content, receipt) {
  const history = readSourceRevisions(content);
  return history.valid && !history.receipts.some(row => row.invalidated_bindings.includes(receipt.binding_id));
}

export function sourceRevisionObservation(content, unavailable = false) {
  const history = readSourceRevisions(content);
  if (!history.present) return null;
  return { status: unavailable || !history.valid ? "unavailable" : "verified",
    archive_authority: "historical_evidence_only", entries: history.receipts.map(row => ({
      operation_id: row.operation_id, source_gate: row.source_gate, previous_revision_id: row.previous_revision_id,
      resulting_revision_id: row.resulting_revision_id, archive: row.archive, superseded_sources: SOURCE_GATES.slice(SOURCE_GATES.indexOf(row.source_gate)),
    })) };
}

export function validSourceRevisionEffect(before, after, receipt) {
  const steps = ["Brownfield Review", "UX Intent Definition", "Brownfield Analysis", "CD+Tests", "CR", "Code Review", "TP Review", "Clean Review", "Clean Implementation Review"];
  const state = text => parseControlState(text, { userGates: APPROVAL_GATES, internalSteps: steps });
  const old = state(before), next = state(after), index = SOURCE_GATES.indexOf(receipt.source_gate);
  return SOURCE_GATES.every((gate, i) => i < index
    ? canonicalJson(next.approvals.get(gate)) === canonicalJson(old.approvals.get(gate))
      && next.artefacts.get(gate)?.path === old.artefacts.get(gate)?.path && next.artefacts.get(gate)?.status === "approved"
    : next.approvals.get(gate)?.status === "missing" && !next.approvals.get(gate)?.evidence
      && next.artefacts.get(gate)?.status === "missing" && !next.artefacts.get(gate)?.path
      && !next.artefact_chain.some(row => row.from === gate))
    && ["QA", "UAT"].every(gate => receipt.schema_version === '3'
      ? next.approvals.get(gate)?.status === 'missing' && !next.approvals.get(gate)?.evidence
        && (!old.artefacts.has(gate) || next.artefacts.get(gate)?.status === 'missing' && !next.artefacts.get(gate)?.path)
      : canonicalJson(next.approvals.get(gate)) === canonicalJson(old.approvals.get(gate)))
    && steps.filter(type => ["Brownfield Analysis", "CD+Tests", "CR"].includes(type) || old.artefacts.has(type) && !["Brownfield Review", "UX Intent Definition"].includes(type))
      .every(type => next.artefacts.get(type)?.status === "missing" && !next.artefacts.get(type)?.path)
    && receipt.analyses.every(row => row.disposition === "retain"
      ? canonicalJson(old.artefacts.get(row.type)) === canonicalJson(next.artefacts.get(row.type))
      : next.artefacts.get(row.type)?.status === "missing" && !next.artefacts.get(row.type)?.path)
    && (receipt.source_gate !== "UR" && !receipt.analyses.some(row => row.type === "Brownfield Review" && row.disposition === "reassess")
      || next.artefacts.get("Brownfield Review")?.status === "missing" && next.mode_slice_decision.decision === "undecided");
}
