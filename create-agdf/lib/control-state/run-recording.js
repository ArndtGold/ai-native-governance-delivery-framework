import { validateRunPresentation } from "./run-presentation.js";
import { validateGateApprovalResponse } from "./gate-approval-validator.js";
import { duplicateArtefactRowTypes, parseControlState } from "./run-state-parser.js";
import { firstSection, guardedWrite, readRun, rejected, replaceFirstScalar, tableCells, tableLine, tableLineIndexes, upsertTableRow } from "./run-state-edits.js";
import { APPROVAL_GATES, artefactFileDigest, canonicalRunText, runSealState } from "./run-seal.js";
import { transitionDecisionForRunState } from "../control-evaluation/gate-policy.js";
import { writeRun } from "./run-state-writer.js";

const DURABLE_STATUS_GATES = new Set(["UR", "PRD", "SD", "TP"]);

function recordGateApproval(text, gate, evidence) {
  const lines = text.split("\n");
  const sections = ["Approvals", "Gate Checklist"].map((heading) => firstSection(lines, heading));
  let updated = false;
  for (const range of sections.filter(Boolean)) {
    for (const index of tableLineIndexes(lines, range)) {
      const cells = tableCells(lines[index]);
      if (cells[0] !== gate) continue;
      lines[index] = tableLine([gate, "approved", evidence, ...cells.slice(3)]);
      updated = true;
    }
  }
  if (updated) return lines.join("\n");
  const row = tableLine([gate, "approved", evidence]);
  const target = sections.find(Boolean);
  if (target) {
    const rowsInTarget = tableLineIndexes(lines, target);
    if (rowsInTarget.length) lines.splice(rowsInTarget.at(-1) + 1, 0, row);
    else lines.splice(target.start + 1, 0, "", "| Gate | Status | Evidence |", "|---|---|---|", row);
    return lines.join("\n");
  }
  const block = ["## Approvals", "", "| Gate | Status | Evidence |", "|---|---|---|", row, ""];
  const anchor = ["Artefacts", "Evidence", "Closeout"].map((heading) => firstSection(lines, heading)).find(Boolean);
  if (anchor) lines.splice(anchor.start, 0, ...block);
  else lines.push("", ...block);
  return lines.join("\n");
}

function markGateArtefactApproved(text, gate) {
  const lines = text.split("\n");
  const range = firstSection(lines, "Artefacts");
  if (!range) return text;
  for (const index of tableLineIndexes(lines, range)) {
    const cells = tableCells(lines[index]);
    if (cells[0] === gate && cells[1] && cells.length >= 3) lines[index] = tableLine([...cells.slice(0, 2), "approved", ...cells.slice(3)]);
  }
  return lines.join("\n");
}

// The delivery map requires UR to be traceable via "UR | approved_by | Approval: UR".
function recordUrApprovalChain(text, evidence) {
  const lines = text.split("\n");
  const row = tableLine(["UR", "approved_by", "Approval: UR", evidence]);
  const range = firstSection(lines, "Artefact Chain");
  if (!range) {
    const block = ["## Artefact Chain", "", "| From | Relationship | To | Evidence |", "|---|---|---|---|", row, ""];
    const anchor = ["Evidence", "Closeout"].map((heading) => firstSection(lines, heading)).find(Boolean);
    if (anchor) lines.splice(anchor.start, 0, ...block);
    else lines.push("", ...block);
    return lines.join("\n");
  }
  const indexes = tableLineIndexes(lines, range);
  const existing = indexes.filter((index) => {
    const cells = tableCells(lines[index]);
    return cells[0] === "UR" && (cells[1] ?? "").replace(/^`|`$/gu, "") === "approved_by";
  });
  if (existing.length) {
    for (const index of existing) {
      const cells = tableCells(lines[index]);
      lines[index] = tableLine(["UR", "approved_by", "Approval: UR", ...cells.slice(3, -1), evidence]);
    }
  } else if (indexes.length) {
    lines.splice(indexes.at(-1) + 1, 0, row);
  } else {
    lines.splice(range.start + 1, 0, "", "| From | Relationship | To | Evidence |", "|---|---|---|---|", row);
  }
  return lines.join("\n");
}

// run-update: record the current run state and listed artefacts as a new sealed revision. Approval
// rows must match the recorded approvals; only run-approve may change them.
export function recordRunRevision(root, { runId, revisionId }) {
  const run = readRun(root, runId);
  if (run.rejection) return run.rejection;
  if (run.meta.revision_id !== revisionId) return rejected(runId, "stale_revision");
  const duplicates = duplicateArtefactRowTypes(run.content);
  if (duplicates.length) return rejected(runId, "artefact_row_duplicate", {
    artefact_types: duplicates,
    recovery: "Keep one Artefacts row per type, then retry run-update with the current revision_id.",
  });
  const seal = runSealState(root, run.content);
  if (seal.status === "valid") {
    return Object.freeze({ schema_version: "1", outcome: "unchanged", run_id: runId, revision: run.meta.revision, revision_id: run.meta.revision_id });
  }
  if (seal.status === "approvals_changed") return rejected(runId, "approvals_unrecorded");
  if (seal.status === "invalid") return rejected(runId, "seal_invalid");
  const written = guardedWrite(runId, () => writeRun(run.path, run.content, revisionId, { expectedContent: run.content }));
  if (written.rejection) return written.rejection;
  return Object.freeze({
    schema_version: "1",
    outcome: "updated",
    run_id: runId,
    previous_revision_id: revisionId,
    revision: written.state.meta.revision,
    revision_id: written.state.meta.revision_id,
  });
}

// run-approve: persist one exact gate reply for the revision the user was shown. The CLI cannot
// observe the conversation; callers pass only the user's verbatim reply to the presented gate.
export function approveRunGate(root, { runId, gate, revisionId, response, presentationId, date = new Date().toISOString().slice(0, 10) }, { evaluateGateCheck }) {
  if (!APPROVAL_GATES.includes(gate)) return rejected(runId, "gate_invalid");
  const run = readRun(root, runId);
  if (run.rejection) return run.rejection;
  const report = evaluateGateCheck(root, { runId });
  if (report.status !== "open" || report.current_gate !== gate || report.missing_approval !== `Approval: ${gate}`) {
    return rejected(runId, "gate_not_ready", {
      status: report.status,
      current_gate: report.current_gate,
      missing_approval: report.missing_approval,
      blocking_reason: report.blocking_reason,
    });
  }
  if (report.approval_presentation?.revision_id !== run.meta.revision_id) {
    return rejected(runId, "approval_presentation_unavailable", {
      presentation_errors: report.presentation_diagnostics?.approval_presentation_errors ?? [],
    });
  }
  const artefact = parseControlState(run.content, { userGates: APPROVAL_GATES }).artefacts.get(gate);
  const digest = gate === "UAT" ? null : artefactFileDigest(root, artefact?.path);
  const durableArtefactReady = gate === "UAT"
    || (artefact?.path_format !== "invalid" && digest.startsWith("sha256:")
      && (gate !== "QA" || ["pass", "passed"].includes(artefact.status)));
  const validation = validateGateApprovalResponse({
    response,
    responseOrigin: "deliberate_user_input",
    expectedApproval: `Approval: ${gate}`,
    expectedRunId: runId,
    currentRunId: run.meta.run_id,
    expectedGate: gate,
    currentGate: report.current_gate,
    expectedRevisionId: revisionId,
    currentRevisionId: run.meta.revision_id,
    durableArtefactReady,
  });
  if (!validation.accepted) return rejected(runId, validation.reason);

  const presentation = validateRunPresentation(root, { runId, gate, revisionId, presentationId }, { evaluateGateCheck });
  if (presentation.reason) return rejected(runId, presentation.reason, { recovery: presentation.recovery });

  const evidence = [
    `\`Approval: ${gate}\``,
    date,
    `revision ${run.meta.revision}`,
    ...(digest ? [`\`${artefact.path}\` ${digest.slice(0, 23)}`] : []),
    `presentation ${presentation.presentationId} ${presentation.digest}`,
  ].join(" · ");
  let next = recordGateApproval(canonicalRunText(run.content), gate, evidence);
  if (DURABLE_STATUS_GATES.has(gate)) next = markGateArtefactApproved(next, gate);
  if (gate === "UR") next = recordUrApprovalChain(next, evidence);
  const postApprovalState = parseControlState(next, {
    userGates: APPROVAL_GATES,
    internalSteps: ["Brownfield Review", "Brownfield Analysis", "CD+Tests", "CR"],
    closeoutArtefacts: ["OR"],
  });
  const after = transitionDecisionForRunState({
    ...postApprovalState,
    current_gate: postApprovalState.current_gate,
    content: next,
  });
  const approvedGates = APPROVAL_GATES.filter((candidate) => postApprovalState.approvals.get(candidate)?.status === "approved");
  const controlRows = [
    ["What is known?", `Approval recorded for ${gate}; current gate is ${after.current_gate}.`],
    ["What is approved?", approvedGates.length ? approvedGates.map((candidate) => `Approval: ${candidate}`).join(", ") : "Nothing yet."],
    ["What is missing?", after.missing_approval !== "none" ? `Exact ${after.missing_approval}.` : "No approval is pending."],
    ["What is the next allowed action?", after.next_allowed_action],
    ["What is explicitly forbidden right now?", after.forbidden.join("; ") || "none"],
  ];
  next = replaceFirstScalar(next, "current_gate", after.current_gate) ?? next;
  next = replaceFirstScalar(next, "next_allowed_action", after.next_allowed_action) ?? next;
  for (const [key, value] of controlRows) {
    next = upsertTableRow(next, "Current Control State", 0, key, [key, value]) ?? next;
  }
  const written = guardedWrite(runId, () => writeRun(run.path, next, revisionId, {
    allowApprovalChange: true,
    validateBeforeWrite: () => {
      const current = validateRunPresentation(root, { runId, gate, revisionId, presentationId }, { evaluateGateCheck });
      if (current.reason || current.digest !== presentation.digest) throw new Error("AGDF_STALE_RUN_REVISION");
    },
    expectedContent: run.content,
  }));
  if (written.rejection) return written.rejection;
  return Object.freeze({
    schema_version: "1",
    outcome: "approved",
    run_id: runId,
    gate,
    approval: `Approval: ${gate}`,
    previous_revision_id: revisionId,
    revision: written.state.meta.revision,
    revision_id: written.state.meta.revision_id,
    next_gate_after_approval: after.current_gate,
    allowed_after_approval: after.next_allowed_action,
  });
}
