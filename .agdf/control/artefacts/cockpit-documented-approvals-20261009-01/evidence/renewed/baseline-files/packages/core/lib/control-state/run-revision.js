import { parseControlState, parseRunState } from "./run-state-parser.js";
import { appendTableRow, firstSection, guardedWrite, readRun, rejected, replaceFirstScalar, replaceSectionScalar, removeTableRows, tableCells, tableLine, tableLineIndexes, upsertTableRow } from "./run-state-edits.js";
import { APPROVAL_GATES, artefactFileDigest, listedArtefactPaths, pendingArtefactPaths, canonicalRunText, runSealState } from "./run-seal.js";
import { transitionDecisionForRunState } from "../control-evaluation/gate-policy.js";
import { withOwnedFileLock } from "./run-state-writer.js";
import { writeRunWithBacklog } from "./run-backlog-writer.js";
import { backlogStatusForSummary } from "./run-backlog.js";
import { runWorkSummary, assertSummarySources } from "../control-evaluation/run-work-summary.js";
import { recordBacklogSummary } from "./backlog-summary.js";
import { canonicalJson, digest, exactObject, resolveControlCommandTarget } from "./approval-command-contract.js";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runPath } from "./run-state-reader.js";
import { readArtefactBindings } from "./artefact-bindings.js";
import { exactApprovedArtefacts, readContainedJson, validateBindingProof } from "./artefact-binding-proof.js";
import { SOURCE_GATES, appendSourceRevision, readSourceRevisions, revisionHistoryPrefix, sourceRevisionImpact } from "./run-source-revisions.js";
import { collectRevisionHistory, byteDigest, inspectRevisionHistory, readHistoryBytes } from "./run-revision-history.js";
import { commitRunStepLocked, recoverPendingRunStepLocked, readPendingSourceRevisionJournal } from "./run-step-transaction.js";
import { pendingRunStepIds, pendingRunStepPath } from "./run-step-pending.js";
import { REVISION_ID_PATTERN, RUN_ID_PATTERN } from "./run-identity.js";
import { internalStepArtefacts } from "../control-evaluation/run-state.js";
import { containedRegularFile, hasSymlinkComponent } from "./contained-file.js";

const revisionError = (reason, recovery = "Inspect the exact current run, correct the facts and prepare a fresh reviewed preview.") => Object.assign(Error(reason), { revision_reason: reason, recovery });
const nonempty = value => typeof value === "string" && value.trim().length > 0 && value.length <= 4096;
function validateRevisionIdentity({ runId, operationId, revisionId }) {
  if (!RUN_ID_PATTERN.test(runId ?? "") || ![operationId, revisionId].every(value => typeof value === "string" && REVISION_ID_PATTERN.test(value)))
    throw revisionError("revision_input_invalid");
}
function withRevisionLocks(root, input, work) {
  validateRevisionIdentity(input);
  const paths = [`.agdf/control/runs/${input.runId}/RUN_STATE.md`, ".agdf/control/MASTER_BACKLOG.md"];
  const check = () => {
    if (paths.some(path => hasSymlinkComponent(root, path) || containedRegularFile(root, path).status !== "valid"))
      throw revisionError("revision_path_invalid");
  };
  check();
  return withOwnedFileLock(runPath(root, input.runId), () => withOwnedFileLock(join(root, paths[1]), () => { check(); return work(); }));
}
const commandResult = (runId, work) => {
  try { return work(); } catch (error) {
    if (error.revision_reason) return { ...rejected(runId, error.revision_reason, { recovery: error.recovery }), authorizes: false,
      ...(error.revision_reason === "run_step_recovery_required" ? { outcome: "recovery_required" } : {}) };
    const result = guardedWrite(runId, () => { throw error; });
    return { ...result.rejection, authorizes: false,
      ...(result.rejection.reason === "run_step_recovery_required" ? { outcome: "recovery_required" } : {}) };
  }
};

function prepareLateRevision(root, input) {
  const { runId, revisionId, operationId, sourceGate, evidence } = input;
  validateRevisionIdentity(input);
  if (!REVISION_ID_PATTERN.test(operationId ?? "") || !SOURCE_GATES.includes(sourceGate)) throw revisionError("revision_input_invalid");
  if (pendingRunStepIds(root).length) throw revisionError("run_step_recovery_required");
  const run = readRun(root, runId);
  if (run.rejection) throw revisionError(run.rejection.reason);
  if (run.meta.revision_id !== revisionId) throw revisionError("stale_revision");
  if (runSealState(root, run.content).status !== "valid") throw revisionError("seal_invalid");
  const state = { ...parseControlState(run.content, { userGates: APPROVAL_GATES,
    internalSteps: [...internalStepArtefacts], closeoutArtefacts: ["OR"] }), content: run.content, meta: run.meta };
  const current = transitionDecisionForRunState(state);
  if (run.meta.lifecycle !== "active" || !["structured_delivery", "structured_slice"].includes(state.mode_slice_decision.decision)
      || current.current_gate !== "CD+Tests" || current.status !== "open"
      || ["QA", "UAT"].some(gate => state.approvals.get(gate)?.status === "approved")
      || state.artefacts.get("OR")?.status === "done") throw revisionError("late_revision_boundary_invalid", "Use the supported active structured CD+Tests boundary; QA, review and closed runs are outside this revision path.");
  if (!exactApprovedArtefacts(root, state)) throw revisionError("approved_source_proof_invalid");
  const bindings = readArtefactBindings(run.content);
  if (!bindings.valid || !["PRD", "SD", "TP"].every(type => bindings.active.some(row => row.destination.type === type && validateBindingProof(root, row)))) throw revisionError("current_source_binding_invalid");
  const sources = SOURCE_GATES.map(type => ({ type, path: state.artefacts.get(type)?.path, digest: artefactFileDigest(root, state.artefacts.get(type)?.path) }));
  if (sources.some(row => row.path !== `.agdf/control/artefacts/${runId}/${row.type}.md` || state.approvals.get(row.type)?.status !== "approved")) throw revisionError("approved_source_invalid");
  const proposal = readContainedJson(root, evidence), requestDigest = digest(canonicalJson(proposal));
  if (!exactObject(proposal, ["schema_version", "target_id", "run_id", "expected_revision_id", "operation_id", "source_gate", "reason", "intended_change", "sources", "impact_assessment"])
      || proposal.schema_version !== "1" || proposal.target_id !== resolveControlCommandTarget(root).target_id
      || proposal.run_id !== runId || proposal.expected_revision_id !== revisionId || proposal.operation_id !== operationId
      || proposal.source_gate !== sourceGate || !nonempty(proposal.reason) || !nonempty(proposal.intended_change)
      || canonicalJson(proposal.sources) !== canonicalJson(sources)) throw revisionError("revision_proposal_invalid");
  const assessment = proposal.impact_assessment, index = SOURCE_GATES.indexOf(sourceGate);
  if (!exactObject(assessment, ["reviewer", "earliest_source", "upstream", "analyses", "implementation_evidence", "unresolved"])
      || !nonempty(assessment.reviewer) || assessment.earliest_source !== sourceGate || !nonempty(assessment.implementation_evidence)
      || !Array.isArray(assessment.unresolved) || assessment.unresolved.length
      || !Array.isArray(assessment.upstream) || assessment.upstream.length !== index
      || !assessment.upstream.every((row, i) => exactObject(row, ["type", "path", "digest", "rationale"])
        && nonempty(row.rationale) && canonicalJson({ type: row.type, path: row.path, digest: row.digest }) === canonicalJson(sources[i]))) throw revisionError("source_impact_unresolved", "Resolve the earliest changed source and unchanged upstream rationale with its owner; then regenerate the proposal.");
  const analyticalTypes = ["Brownfield Review", "UX Intent Definition"].filter(type => state.artefacts.get(type)?.path);
  if (!Array.isArray(assessment.analyses) || assessment.analyses.length !== analyticalTypes.length
      || !assessment.analyses.every((row, i) => exactObject(row, ["type", "disposition", "path", "digest", "reason"])
        && row.type === analyticalTypes[i] && row.path === state.artefacts.get(row.type).path
        && row.digest === artefactFileDigest(root, row.path) && nonempty(row.reason)
        && ["retain", "reassess"].includes(row.disposition) && (sourceGate !== "UR" || row.disposition === "reassess"))) throw revisionError("analysis_applicability_unresolved");
  const affected = SOURCE_GATES.slice(index);
  const pendingPaths = pendingArtefactPaths(run.content);
  const paths = [...listedArtefactPaths(run.content).filter(path => !pendingPaths.includes(path) || existsSync(join(root, path))),
    `.agdf/control/runs/${runId}/RUN_STATE.md`, evidence];
  for (const binding of bindings.active) paths.push(binding.review.path, binding.destination.path, binding.source.path);
  // Closure includes the exact presentation envelopes and current reviewed mapping proofs.
  for (const gate of SOURCE_GATES) {
    const id = state.approvals.get(gate).evidence.match(/presentation ([0-9a-f-]{36}) /u)?.[1];
    if (!id) throw revisionError("approved_source_proof_invalid");
    paths.push(`.agdf/control/runs/${runId}/presentations/${id}.json`);
  }
  const history = collectRevisionHistory(root, runId, operationId, paths);
  const impact = sourceRevisionImpact(proposal, bindings.active);
  const preview = { schema_version: "1", target_id: proposal.target_id, run_id: runId, expected_revision_id: revisionId,
    operation_id: operationId, request_digest: requestDigest, reason: proposal.reason, intended_change: proposal.intended_change,
    sources, impact, archive_digest: history.digest, current_run_digest: byteDigest(Buffer.from(run.content)) };
  return { run, state, proposal, requestDigest, preview, previewDigest: digest(canonicalJson(preview)), history, affected };
}

export function previewSourceRevision(root, input) {
  return commandResult(input.runId, () => { const work = prepareLateRevision(root, input);
    return { outcome: "preview", authority: "proposed_only", authorizes: false, ...work.preview, preview_digest: work.previewDigest,
      next_action: "Review the bound impact; explicitly apply it or cancel without mutation." }; });
}

function revisedRun(work, receipt) {
  let next = work.run.content;
  for (const gate of work.affected) {
    for (const section of ["Approvals", "Gate Checklist"]) next = replaceGateRow(next, section, gate, cells => [gate, "missing", "", ...cells.slice(3)]);
    next = upsertTableRow(next, "Artefacts", 0, gate, [gate, "", "missing", "Previous content is historical; fresh recording and approval required"]);
    next = removeTableRows(next, "Artefact Chain", 0, gate) ?? next;
  }
  for (const id of receipt.invalidated_bindings) next = removeTableRows(next, "Artefacts", 0, `Binding proof ${id}`) ?? next;
  const invalidAnalyses = [...new Set([...receipt.analyses.filter(row => row.disposition === "reassess").map(row => row.type),
    ...(receipt.source_gate === "UR" ? ["Brownfield Review"] : [])])];
  for (const type of [...invalidAnalyses, "Brownfield Analysis", "CD+Tests", "CR", "Code Review", "TP Review", "Clean Review", "Clean Implementation Review", "QA"]) {
    if (work.state.artefacts.has(type) || ["Brownfield Analysis", "CD+Tests", "CR"].includes(type))
      next = upsertTableRow(next, "Artefacts", 0, type, [type, "", "missing", "Renewed evidence required after source revision"]);
  }
  if (invalidAnalyses.includes("Brownfield Review")) {
    const heading = firstSection(next.split("\n"), "Mode/Slice Decision") ? "Mode/Slice Decision" : "Mode / Slice Decision";
    next = replaceSectionScalar(next, heading, "decision", "undecided");
    if (!next) throw revisionError("run_layout_unsupported");
    next = replaceSectionScalar(next, heading, "scope_reason", "Source revision requires a fresh analytical route");
    if (!next) throw revisionError("run_layout_unsupported");
    next = replaceSectionScalar(next, heading, "evidence", receipt.archive.path);
  }
  if (!next) throw revisionError("run_layout_unsupported");
  next = appendSourceRevision(next, receipt);
  const after = transitionDecisionForRunState({ ...parseControlState(next, { userGates: APPROVAL_GATES, internalSteps: [...internalStepArtefacts] }), content: next });
  // Later-source reassessment can be the required internal next step before its gate.
  next = replaceFirstScalar(next, "current_gate", after.current_gate) ?? next;
  next = replaceFirstScalar(next, "next_allowed_action", after.next_allowed_action) ?? next;
  for (const [question, answer] of [["What is known?", `Source revision reopened ${receipt.source_gate}; previous evidence is historical.`],
    ["What is approved?", work.preview.impact.retained.map(gate => `Approval: ${gate}`).join(", ") || "Nothing yet."],
    ["What is missing?", after.missing_approval], ["What is the next allowed action?", after.next_allowed_action],
    ["What is explicitly forbidden right now?", after.forbidden.join("; ")]]) next = upsertTableRow(next, "Current Control State", 0, question, [question, answer]) ?? next;
  return { next, after };
}

export function inspectSourceRevision(root, { runId, operationId, revisionId }) {
  return commandResult(runId, () => {
    validateRevisionIdentity({ runId, operationId, revisionId });
    const pending = pendingRunStepPath(root, runId), content = readHistoryBytes(root, `.agdf/control/runs/${runId}/RUN_STATE.md`).toString("utf8");
    const parsed = parseRunState(content, runId);
    if (!parsed.valid || !REVISION_ID_PATTERN.test(operationId ?? "")) throw revisionError("revision_input_invalid");
    if (existsSync(pending)) {
      const journal = readPendingSourceRevisionJournal(root, runId);
      if (journal.schema_version !== 2 || journal.operation_id !== operationId
          || journal.target_id !== resolveControlCommandTarget(root).target_id) throw revisionError("revision_recovery_binding_invalid");
      return { outcome: "recovery_required", run_id: runId, operation_id: operationId, revision_id: parsed.meta.revision_id, authorizes: false,
        next_action: "Inspect the exact pending operation and use explicit recovery; do not blindly repeat apply." };
    }
    if (runSealState(root, content).status !== "valid") throw revisionError("seal_invalid");
    const row = readSourceRevisions(content).receipts.find(item => item.operation_id === operationId);
    return { outcome: row ? "historical" : "not_found", run_id: runId, revision_id: parsed.meta.revision_id,
      stale_observation: revisionId !== parsed.meta.revision_id, authorizes: false,
      ...(row ? { history: inspectRevisionHistory(root, row) } : {}) };
  });
}

export function applySourceRevision(root, input, { afterWrite } = {}) {
  return commandResult(input.runId, () => withRevisionLocks(root, input, () => {
    const { runId, revisionId, operationId } = input;
    if (pendingRunStepIds(root).length) throw revisionError("run_step_recovery_required");
    const run = readRun(root, runId); if (run.rejection) throw revisionError(run.rejection.reason);
    const prior = readSourceRevisions(run.content).receipts.find(row => row.operation_id === operationId);
    if (prior) {
      if (runSealState(root, run.content).status !== "valid") throw revisionError("seal_invalid");
      const proposal = readContainedJson(root, input.evidence);
      if (prior.request_digest !== digest(canonicalJson(proposal)) || prior.preview_digest !== input.previewDigest
          || prior.previous_revision_id !== revisionId || prior.source_gate !== input.sourceGate
          || prior.target_id !== resolveControlCommandTarget(root).target_id) throw revisionError("revision_operation_conflict");
      return { outcome: "replayed", authorizes: false, run_id: runId, operation_id: operationId,
        resulting_revision_id: prior.resulting_revision_id, current_revision_id: run.meta.revision_id, historical_effect: true };
    }
    const work = prepareLateRevision(root, input);
    if (input.previewDigest !== work.previewDigest) throw revisionError("revision_preview_stale");
    const receipt = { schema_version: "1", operation_id: operationId, target_id: work.proposal.target_id, run_id: runId,
      source_gate: input.sourceGate, request_digest: work.requestDigest, preview_digest: work.previewDigest,
      previous_revision_id: revisionId, resulting_revision_id: randomUUID(), revision: Number(run.meta.revision) + 1,
      invalidated_bindings: work.preview.impact.invalidated_bindings, analyses: work.proposal.impact_assessment.analyses,
      retained_sources: work.proposal.impact_assessment.upstream,
      archive: { path: `${revisionHistoryPrefix(runId, operationId)}manifest.json`, digest: work.history.digest }, reason: work.proposal.reason };
    const { next, after } = revisedRun(work, receipt);
    const backlogPath = join(root, ".agdf/control/MASTER_BACKLOG.md");
    if (hasSymlinkComponent(root, ".agdf/control/MASTER_BACKLOG.md") || containedRegularFile(root, ".agdf/control/MASTER_BACKLOG.md").status !== "valid") throw revisionError("backlog_path_invalid");
    const oldBacklog = readFileSync(backlogPath, "utf8");
    const lines = oldBacklog.split("\n"), section = firstSection(lines, "Active Backlog");
    const priorRow = section && tableLineIndexes(lines, section).slice(2).map(i => tableCells(lines[i])).find(cells => cells[1]?.replaceAll("`", "").trim() === runId);
    const summary = runWorkSummary(root, next, run.path, after);
    let nextBacklog = upsertTableRow(oldBacklog, "Active Backlog", 1, priorRow?.[1] ?? runId, [priorRow?.[0] || "P1", priorRow?.[1] ?? runId, priorRow?.[2] || runId, backlogStatusForSummary(summary, after),
      SOURCE_GATES.filter(type => work.preview.impact.retained.includes(type)).map(type => `[${type}](artefacts/${runId}/${type}.md)`).join(" · "),
      `[Revision history](${receipt.archive.path.slice(".agdf/control/".length)})`, summary.display_action]);
    if (!nextBacklog) throw revisionError("backlog_layout_unsupported");
    nextBacklog = recordBacklogSummary(root, nextBacklog, runId, "Active Backlog", summary, receipt.resulting_revision_id);
    const written = commitRunStepLocked(root, { runId, runPath: run.path, content: next, revisionId, expectedContent: run.content,
      backlog: { old: oldBacklog, next: nextBacklog }, or: null, history: work.history, afterWrite,
      nextRevisionId: receipt.resulting_revision_id, writeOptions: { allowApprovalChange: true, appendedRevision: receipt,
        validateBeforeWrite: () => { assertSummarySources(root, summary); const checked = prepareLateRevisionIgnoringPending(root, input); if (checked.previewDigest !== work.previewDigest) throw Error("AGDF_STALE_RUN_REVISION"); } } });
    return { outcome: "reopened", authorizes: false, run_id: runId, operation_id: operationId, gate: after.current_gate,
      revision_id: written.meta.revision_id, revision: written.meta.revision, impact: work.preview.impact, next_action: after.next_allowed_action };
  }));
}

function prepareLateRevisionIgnoringPending(root, input) {
  // The exact pending operation is owned by the caller under both locks. Revalidation reads
  // the unchanged pre-commit state without allowing ordinary readRun to bypass a pending write.
  const pending = readPendingSourceRevisionJournal(root, input.runId);
  if (pending.schema_version !== 2 || pending.operation_id !== input.operationId) throw Error("AGDF_RUN_STEP_RECOVERY_REQUIRED");
  const proposal = readContainedJson(root, input.evidence);
  const text = readHistoryBytes(root, `.agdf/control/runs/${input.runId}/RUN_STATE.md`).toString("utf8");
  if (parseRunState(text).meta.revision_id !== input.revisionId || runSealState(root, text).status !== "valid") throw Error("AGDF_STALE_RUN_REVISION");
  const paths = readContainedJson(root, pending.archive.path).files;
  if (paths.some(row => byteDigest(readHistoryBytes(root, row.path)) !== row.digest)) throw Error("AGDF_STALE_RUN_REVISION");
  return { previewDigest: digest(canonicalJson(proposal)) === pending.request_digest ? pending.preview_digest : null };
}

export function recoverSourceRevision(root, input) {
  return commandResult(input.runId, () => withRevisionLocks(root, input, () => {
    const path = pendingRunStepPath(root, input.runId);
    if (!existsSync(path)) {
      const inspected = inspectSourceRevision(root, input);
      return inspected.outcome === "historical" ? { ...inspected, outcome: "recovered", status: "already_completed" } : inspected;
    }
    const pending = readPendingSourceRevisionJournal(root, input.runId);
    if (pending.schema_version !== 2 || pending.operation_id !== input.operationId
        || pending.target_id !== resolveControlCommandTarget(root).target_id
        || ![pending.old_revision_id, pending.next_revision_id].includes(input.revisionId)) throw revisionError("revision_recovery_binding_invalid");
    return { outcome: "recovered", authorizes: false, run_id: input.runId, ...recoverPendingRunStepLocked(root, input.runId, { sourceRevision: true }) };
  }));
}

function replaceGateRow(text, heading, gate, update) {
  const lines = text.split("\n");
  const section = firstSection(lines, heading);
  if (!section) return text;
  for (const index of tableLineIndexes(lines, section).slice(2)) {
    const cells = tableCells(lines[index]);
    if (cells[0] === gate) lines[index] = tableLine(update(cells));
  }
  return lines.join("\n");
}

// A material product clarification supersedes the exact PRD approval. This deliberately
// supports only the PRD->SD boundary, before any downstream artefact is linked or approved.
export function reopenPrdRevision(root, { runId, revisionId }) {
  const run = readRun(root, runId);
  if (run.rejection) return run.rejection;
  if (run.meta.revision_id !== revisionId) return rejected(runId, "stale_revision");
  if (runSealState(root, run.content).status !== "valid") return rejected(runId, "seal_invalid");
  const state = parseControlState(run.content, { userGates: APPROVAL_GATES,
    internalSteps: ["Brownfield Review", "Brownfield Analysis", "CD+Tests", "CR"], closeoutArtefacts: ["OR"] });
  if (state.approvals.get("PRD")?.status !== "approved" || run.meta.current_gate !== "SD"
      || APPROVAL_GATES.slice(2).some((gate) => state.approvals.get(gate)?.status === "approved"
        || state.artefacts.get(gate)?.path)) {
    return rejected(runId, "prd_revision_boundary_invalid", {
      recovery: "PRD revision is available only at SD before later artefacts are linked or approved.",
    });
  }
  const previousApproval = state.approvals.get("PRD")?.evidence ?? "";
  if (!previousApproval) return rejected(runId, "prd_approval_evidence_missing");
  let next = canonicalRunText(run.content);
  for (const heading of ["Approvals", "Gate Checklist"]) {
    next = replaceGateRow(next, heading, "PRD", (cells) => ["PRD", "missing", "", ...cells.slice(3)]);
  }
  next = replaceGateRow(next, "Artefacts", "PRD", (cells) => ["PRD", cells[1], "draft", ...cells.slice(3)]);
  const withHistory = appendTableRow(next, "Evidence", ["Superseded PRD approval", previousApproval, "Prior PRD revision only; renewed Approval: PRD required", "direct"]);
  if (!withHistory) return rejected(runId, "prd_revision_history_unavailable");
  next = withHistory;
  const afterState = parseControlState(next, { userGates: APPROVAL_GATES,
    internalSteps: ["Brownfield Review", "Brownfield Analysis", "CD+Tests", "CR"], closeoutArtefacts: ["OR"] });
  const after = transitionDecisionForRunState({ ...afterState, content: next });
  if (after.current_gate !== "PRD" || after.missing_approval !== "Approval: PRD") return rejected(runId, "prd_revision_transition_invalid");
  next = replaceFirstScalar(next, "current_gate", "PRD") ?? next;
  next = replaceFirstScalar(next, "next_allowed_action", after.next_allowed_action) ?? next;
  for (const [question, answer] of [
    ["What is known?", "The previous PRD approval was superseded; renewed PRD approval is required."],
    ["What is approved?", "Approval: UR"],
    ["What is missing?", "Exact Approval: PRD for the new revision."],
    ["What is the next allowed action?", after.next_allowed_action],
    ["What is explicitly forbidden right now?", after.forbidden.join("; ") || "none"],
  ]) next = upsertTableRow(next, "Current Control State", 0, question, [question, answer]) ?? next;
  const written = guardedWrite(runId, () => writeRunWithBacklog(root, run.path, next, revisionId, {
    allowApprovalChange: true, expectedContent: run.content,
    validateBeforeWrite: () => {
      // Recomputes the artefact digests on disk under the write lock.
      if (runSealState(root, run.content).status !== "valid") throw new Error("AGDF_STALE_RUN_REVISION");
    },
  }));
  if (written.rejection) return written.rejection;
  return Object.freeze({ schema_version: "1", outcome: "reopened", run_id: runId, gate: "PRD",
    previous_revision_id: revisionId, revision: written.state.meta.revision,
    revision_id: written.state.meta.revision_id,
    next_action: "Revise the PRD, record it with run-update, then prepare a new run-present. A new deliberate Approval: PRD is required." });
}
