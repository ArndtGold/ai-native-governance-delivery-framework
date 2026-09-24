import { readFileSync } from "node:fs";
import { validateGateApprovalResponse } from "./gate-approval-validator.js";
import { parseControlState, parseRunState } from "./run-state-parser.js";
import { runPath } from "./run-state-reader.js";
import { APPROVAL_GATES, artefactFileDigest, canonicalRunText, runSealState } from "./run-seal.js";
import { writeRun } from "./run-state-writer.js";

const WRITE_REJECTIONS = new Map([
  ["AGDF_STALE_RUN_REVISION", "stale_revision"],
  ["AGDF_RUN_WRITE_LOCKED", "run_write_locked"],
  ["AGDF_RUN_APPROVALS_UNRECORDED", "approvals_unrecorded"],
  ["AGDF_RUN_SEAL_INVALID", "seal_invalid"],
  ["AGDF_RUN_STATE_INVALID", "run_state_invalid"],
]);
const DURABLE_STATUS_GATES = new Set(["UR", "PRD", "SD", "TP"]);

function rejected(runId, reason, details = {}) {
  return Object.freeze({ schema_version: "1", outcome: "rejected", run_id: runId ?? null, reason, ...details });
}

function readRun(root, runId) {
  let path;
  try {
    path = runPath(root, runId);
  } catch {
    return { rejection: rejected(runId, "run_id_invalid") };
  }
  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    return { rejection: rejected(runId, "run_missing") };
  }
  const parsed = parseRunState(content, runId);
  if (!parsed.valid) {
    return { rejection: rejected(runId, "run_state_invalid", { findings: parsed.findings.map((finding) => finding.code) }) };
  }
  return { path, content, meta: parsed.meta };
}

function guardedWrite(runId, write) {
  try {
    return { state: write() };
  } catch (error) {
    const reason = WRITE_REJECTIONS.get(error?.message);
    if (!reason) throw error;
    return { rejection: rejected(runId, reason) };
  }
}

function tableCells(line) {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

function tableLine(cells) {
  return `| ${cells.join(" | ")} |`;
}

function firstSection(lines, heading) {
  const pattern = new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s*$`, "u");
  const start = lines.findIndex((line) => pattern.test(line));
  if (start < 0) return null;
  let end = start + 1;
  while (end < lines.length && !/^#{1,2} /u.test(lines[end])) end += 1;
  return { start, end };
}

function tableLineIndexes(lines, range) {
  const indexes = [];
  for (let index = range.start + 1; index < range.end; index += 1) {
    if (lines[index].trimStart().startsWith("|")) indexes.push(index);
  }
  return indexes;
}

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

function replaceNextAllowedAction(text, action) {
  return text.replace(/^- next_allowed_action:.*$/mu, () => `- next_allowed_action: ${action}`);
}

// run-update: record the current run state and listed artefacts as a new sealed revision. Approval
// rows must match the recorded approvals; only run-approve may change them.
export function recordRunRevision(root, { runId, revisionId }) {
  const run = readRun(root, runId);
  if (run.rejection) return run.rejection;
  if (run.meta.revision_id !== revisionId) return rejected(runId, "stale_revision");
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
export function approveRunGate(root, { runId, gate, revisionId, response, date = new Date().toISOString().slice(0, 10) }, { evaluateGateCheck }) {
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

  const evidence = [
    `\`Approval: ${gate}\``,
    date,
    `revision ${run.meta.revision}`,
    ...(digest ? [`\`${artefact.path}\` ${digest.slice(0, 23)}`] : []),
  ].join(" · ");
  let next = recordGateApproval(canonicalRunText(run.content), gate, evidence);
  if (DURABLE_STATUS_GATES.has(gate)) next = markGateArtefactApproved(next, gate);
  if (gate === "UR") next = recordUrApprovalChain(next, evidence);
  if (report.allowed_after_approval && report.allowed_after_approval !== "none") {
    next = replaceNextAllowedAction(next, report.allowed_after_approval);
  }
  const written = guardedWrite(runId, () => writeRun(run.path, next, revisionId, {
    allowApprovalChange: true,
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
    next_gate_after_approval: report.next_gate_after_approval,
    allowed_after_approval: report.allowed_after_approval,
  });
}
