import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseControlState } from "./run-state-parser.js";
import { APPROVAL_GATES, canonicalRunText } from "./run-seal.js";
import {
  firstSection,
  guardedWrite,
  readRun,
  rejected,
  removeTableRows,
  replaceFirstScalar,
  replaceSectionScalar,
  tableCells,
  tableLineIndexes,
  upsertTableRow,
  appendTableRow,
} from "./run-state-edits.js";
import { atomicWrite, writeRun } from "./run-state-writer.js";

// run-step records one standard transition of the small path in a single sealed revision. The agent
// supplies content, reasons and evidence; the command maintains the dependent tables, the backlog
// pointer and the policy-derived next action so no hand edit of the control state is needed.
export const RUN_STEPS = Object.freeze(["ur", "route", "review", "evidence", "closeout"]);
export const RUN_STEP_ROUTES = Object.freeze(["quick_task", "verified_change", "structured_slice", "structured_delivery", "block"]);
const REVIEW_DECISIONS = new Set(["pass", "revise", "block"]);
const NEXT_GATE_BY_ROUTE = Object.freeze({
  quick_task: "Quick Task Execution",
  verified_change: "Verified Change Execution",
  structured_slice: "PRD",
  structured_delivery: "PRD",
  block: "none",
});
const BACKLOG_STATUS_BY_ROUTE = Object.freeze({
  quick_task: "In Progress",
  verified_change: "In Progress",
  structured_slice: "Awaiting PRD",
  structured_delivery: "Awaiting PRD",
  block: "Blocked",
});
const BACKLOG_LABELS = Object.freeze([["UR", "UR"], ["Brownfield Review", "Brownfield"], ["PRD", "PRD"], ["SD", "SD"], ["TP", "TP"], ["QA", "QA"], ["OR", "OR"]]);
const BACKLOG_PATH = join(".agdf", "control", "MASTER_BACKLOG.md");
const CONTROL_PREFIX = ".agdf/control/";

const artefactPath = (key, file) => `${CONTROL_PREFIX}artefacts/${key}/${file}`;
const filled = (value) => typeof value === "string" && value.trim() !== "";
const oneLine = (value) => String(value ?? "").replace(/\s+/gu, " ").trim();

function requireFile(root, runId, path, template) {
  return existsSync(join(root, path)) ? null : rejected(runId, "artefact_missing", { path, template });
}

function withSectionEdit(runId, text, edit) {
  const next = edit(text);
  return next === null ? { rejection: rejected(runId, "run_layout_unsupported") } : { text: next };
}

function artefactHeading(root, path) {
  try {
    return readFileSync(join(root, path), "utf8").match(/^#\s+(.+)$/mu)?.[1]?.trim() ?? "";
  } catch {
    return "";
  }
}

function backlogLinks(text) {
  const control = parseControlState(text, { userGates: APPROVAL_GATES, internalSteps: ["Brownfield Review"], closeoutArtefacts: ["OR"] });
  return BACKLOG_LABELS
    .map(([type, label]) => [label, control.artefacts.get(type)?.path ?? ""])
    .filter(([, path]) => path.startsWith(CONTROL_PREFIX))
    .map(([label, path]) => `[${label}](${path.slice(CONTROL_PREFIX.length)})`);
}

function updateBacklog(root, key, { title, status, links, next, closeout }) {
  const path = join(root, BACKLOG_PATH);
  if (!existsSync(path)) return "missing";
  const original = readFileSync(path, "utf8");
  let text = canonicalRunText(original);
  const lines = text.split("\n");
  const active = firstSection(lines, "Active Backlog");
  const existing = active
    ? tableLineIndexes(lines, active).slice(2).map((index) => tableCells(lines[index])).find((cells) => cells[1] === key)
    : undefined;
  const rowTitle = oneLine(title) || existing?.[2] || key;
  if (closeout) {
    text = removeTableRows(text, "Active Backlog", 1, key) ?? text;
    text = upsertTableRow(text, "Completed / Superseded Pointers", 0, key, [key, rowTitle, "Completed", closeout.record, oneLine(closeout.outcome)]);
  } else {
    text = upsertTableRow(text, "Active Backlog", 1, key, [
      existing?.[0] || "P1",
      key,
      rowTitle,
      status ?? existing?.[3] ?? "In Progress",
      links.join(" · "),
      links[0] ?? "",
      oneLine(next),
    ]);
  }
  if (text === null) return "layout_unsupported";
  if (text === canonicalRunText(original)) return "unchanged";
  atomicWrite(path, text);
  return "updated";
}

function writeCloseoutRecord(root, path, { title, runId, date, result, evidence, risk, next }) {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, [
    `# OR-lite: ${title}`,
    "",
    "Report mode: OR-lite",
    `Run: \`${runId}\``,
    "Route: `quick_task` (Compact Delivery)",
    `Date: ${date}`,
    "",
    "## Result",
    "",
    oneLine(result),
    "",
    "## Evidence",
    "",
    oneLine(evidence),
    "",
    "## Risk",
    "",
    oneLine(risk),
    "",
    "## Next Step",
    "",
    oneLine(next),
    "",
  ].join("\n"), "utf8");
}

export function recordRunStep(root, input, { policy, date = new Date().toISOString().slice(0, 10) }) {
  const { runId, revisionId, step } = input;
  if (!RUN_STEPS.includes(step)) return rejected(runId, "step_invalid", { steps: RUN_STEPS });
  const run = readRun(root, runId);
  if (run.rejection) return run.rejection;
  if (run.meta.revision_id !== revisionId) return rejected(runId, "stale_revision");

  const key = runId;
  let text = canonicalRunText(run.content);
  const control = parseControlState(text, { userGates: APPROVAL_GATES, internalSteps: ["Brownfield Review", "CR"], closeoutArtefacts: ["OR"] });
  const approved = (gate) => control.approvals.get(gate)?.status === "approved";
  const route = control.mode_slice_decision.decision;
  const before = policy(root, text, run.path);
  let known = "";
  let evidenceRow = null;
  let backlog = null;
  let createdRecord = null;
  const edit = (fn) => {
    const result = withSectionEdit(runId, text, fn);
    if (result.rejection) return result.rejection;
    text = result.text;
    return null;
  };

  if (step === "ur") {
    if (approved("UR")) return rejected(runId, "gate_not_ready", { current_gate: before.current_gate });
    if (!filled(input.title)) return rejected(runId, "title_missing");
    const path = artefactPath(key, "UR.md");
    const missing = requireFile(root, runId, path, `${CONTROL_PREFIX}templates/artefacts/UR.md`);
    if (missing) return missing;
    const failed = edit((value) => upsertTableRow(value, "Artefacts", 0, "UR", ["UR", `\`${path}\``, "draft"]));
    if (failed) return failed;
    known = `UR drafted at \`${path}\`.`;
    evidenceRow = ["UR draft", `\`${path}\``, "problem, goal, scope and acceptance signals", "direct"];
    backlog = { title: input.title, status: "Needs UR" };
  } else if (step === "route") {
    if (!approved("UR") || !["Brownfield Review", "Mode/Slice Decision"].includes(before.current_gate)) {
      return rejected(runId, "gate_not_ready", { current_gate: before.current_gate });
    }
    if (!RUN_STEP_ROUTES.includes(input.route)) return rejected(runId, "route_invalid", { routes: RUN_STEP_ROUTES });
    if (!filled(input.reason) || !filled(input.evidence)) return rejected(runId, "route_reason_missing");
    const path = artefactPath(key, "BROWNFIELD_REVIEW.md");
    const missing = requireFile(root, runId, path, `${CONTROL_PREFIX}templates/artefacts/BROWNFIELD_REVIEW.md`);
    if (missing) return missing;
    for (const fn of [
      (value) => upsertTableRow(value, "Artefacts", 0, "Brownfield Review", ["Brownfield Review", `\`${path}\``, "done"]),
      (value) => replaceSectionScalar(value, "Mode/Slice Decision", "decision", input.route),
      (value) => replaceSectionScalar(value, "Mode/Slice Decision", "required_next_gate", NEXT_GATE_BY_ROUTE[input.route]),
      (value) => replaceSectionScalar(value, "Mode/Slice Decision", "scope_reason", oneLine(input.reason)),
      (value) => replaceSectionScalar(value, "Mode/Slice Decision", "evidence", oneLine(input.evidence)),
      (value) => replaceFirstScalar(value, "mode", input.route),
    ]) {
      const failed = edit(fn);
      if (failed) return failed;
    }
    known = `Brownfield Review at \`${path}\` selected \`${input.route}\`.`;
    evidenceRow = ["Brownfield Review", `\`${path}\``, `Mode/Slice Decision \`${input.route}\``, "direct"];
    backlog = { status: BACKLOG_STATUS_BY_ROUTE[input.route] };
  } else if (step === "review") {
    if (!RUN_STEP_ROUTES.includes(route)) return rejected(runId, "gate_not_ready", { current_gate: before.current_gate });
    if (!REVIEW_DECISIONS.has(input.decision)) return rejected(runId, "decision_invalid", { decisions: [...REVIEW_DECISIONS] });
    if (!filled(input.evidence)) return rejected(runId, "evidence_missing");
    const status = input.decision === "pass" ? "done" : input.decision;
    const failed = edit((value) => upsertTableRow(value, "Artefacts", 0, "CR", ["CR", "", status, `Code Review ${input.decision}`]));
    if (failed) return failed;
    known = `Code Review decision \`${input.decision}\`.`;
    evidenceRow = ["Code Review", oneLine(input.source) || "code-review", `decision ${input.decision}: ${oneLine(input.evidence)}`, "direct"];
    backlog = {};
  } else if (step === "evidence") {
    if (!filled(input.evidence)) return rejected(runId, "evidence_missing");
    known = `Evidence recorded: ${oneLine(input.evidence)}.`;
    evidenceRow = [oneLine(input.evidence), oneLine(input.source) || "agent", oneLine(input.covers) || "delivery", "direct"];
  } else if (step === "closeout") {
    if (route !== "quick_task") return rejected(runId, "closeout_route_unsupported", { route: route || "undecided" });
    if (before.current_gate !== "Quick Task Execution") return rejected(runId, "gate_not_ready", { current_gate: before.current_gate });
    if (control.artefacts.get("CR")?.status !== "done") return rejected(runId, "code_review_missing");
    if (![input.result, input.evidence, input.risk, input.next].every(filled)) return rejected(runId, "closeout_fields_missing");
    const path = artefactPath(key, "OR.md");
    const title = artefactHeading(root, artefactPath(key, "UR.md")).replace(/^UR:\s*/u, "") || key;
    for (const fn of [
      (value) => upsertTableRow(value, "Artefacts", 0, "OR", ["OR", `\`${path}\``, "done"]),
      (value) => replaceFirstScalar(value, "lifecycle", "completed"),
      (value) => replaceFirstScalar(value, "current_gate", "OR"),
      (value) => replaceFirstScalar(value, "decision", "completed"),
    ]) {
      const failed = edit(fn);
      if (failed) return failed;
    }
    if (!existsSync(join(root, path))) createdRecord = join(root, path);
    writeCloseoutRecord(root, path, { title, runId, date, ...input });
    known = `Quick task delivered; OR-lite at \`${path}\`.`;
    evidenceRow = ["OR-lite", `\`${path}\``, "quick task closeout", "direct"];
    backlog = { closeout: { record: `[OR](artefacts/${key}/OR.md)`, outcome: input.result } };
  }

  if (evidenceRow) {
    const failed = edit((value) => appendTableRow(value, "Evidence", evidenceRow));
    if (failed) return failed;
  }
  const after = policy(root, text, run.path);
  const approvedGates = APPROVAL_GATES.filter((gate) => parseControlState(text, { userGates: APPROVAL_GATES }).approvals.get(gate)?.status === "approved");
  for (const fn of [
    (value) => replaceFirstScalar(value, "current_gate", after.current_gate),
    (value) => replaceFirstScalar(value, "next_allowed_action", after.next_allowed_action),
    (value) => upsertTableRow(value, "Current Control State", 0, "What is known?", ["What is known?", known]),
    (value) => upsertTableRow(value, "Current Control State", 0, "What is approved?", ["What is approved?", approvedGates.length ? approvedGates.map((gate) => `Approval: ${gate}`).join(", ") : "Nothing yet."]),
    (value) => upsertTableRow(value, "Current Control State", 0, "What is missing?", ["What is missing?", after.missing_approval !== "none" ? `Exact ${after.missing_approval}.` : "No approval is pending."]),
    (value) => upsertTableRow(value, "Current Control State", 0, "What is the next allowed action?", ["What is the next allowed action?", after.next_allowed_action]),
    (value) => upsertTableRow(value, "Current Control State", 0, "What is explicitly forbidden right now?", ["What is explicitly forbidden right now?", after.forbidden.join("; ") || "none"]),
  ]) {
    const failed = edit(fn);
    if (failed) return failed;
  }

  const written = guardedWrite(runId, () => writeRun(run.path, text, revisionId, { expectedContent: run.content }));
  if (written.rejection) {
    if (createdRecord) unlinkSync(createdRecord);
    return written.rejection;
  }
  const backlogResult = backlog
    ? updateBacklog(root, key, { ...backlog, links: backlogLinks(text), next: after.next_allowed_action })
    : "unchanged";
  return Object.freeze({
    schema_version: "1",
    outcome: "recorded",
    run_id: runId,
    step,
    previous_revision_id: revisionId,
    revision: written.state.meta.revision,
    revision_id: written.state.meta.revision_id,
    current_gate: after.current_gate,
    next_allowed_action: after.next_allowed_action,
    backlog: backlogResult,
  });
}
