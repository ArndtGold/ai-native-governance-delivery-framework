import { parseControlState } from "./run-state-parser.js";
import { appendTableRow, firstSection, guardedWrite, readRun, rejected, replaceFirstScalar, tableCells, tableLine, tableLineIndexes, upsertTableRow } from "./run-state-edits.js";
import { APPROVAL_GATES, canonicalRunText, runSealState } from "./run-seal.js";
import { transitionDecisionForRunState } from "../control-evaluation/gate-policy.js";
import { writeRun } from "./run-state-writer.js";

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
  const written = guardedWrite(runId, () => writeRun(run.path, next, revisionId, {
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
