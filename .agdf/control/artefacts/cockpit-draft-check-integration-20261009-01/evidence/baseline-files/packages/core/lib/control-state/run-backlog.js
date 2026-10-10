import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { firstSection, tableCells, tableLine, tableLineIndexes } from "./run-state-edits.js";
import { containedRegularFile, hasSymlinkComponent } from "./contained-file.js";
import { policyForRunContent } from "../control-evaluation/run-step-policy.js";
import { runWorkSummary } from "../control-evaluation/run-work-summary.js";
import { recordBacklogSummary } from "./backlog-summary.js";
import { parseRunState } from "./run-state-parser.js";

export const BACKLOG_RELATIVE_PATH = ".agdf/control/MASTER_BACKLOG.md";
const compactHeaders = ["priority", "key", "work item", "status", "artefacts", "current spec", "next step"];
const legacyHeaders = ["prio", "key", "title", "status", "ur", "brownfield review", "prd", "sd", "tp", "qa", "or", "current spec", "notes"];
const clean = value => value.replaceAll("`", "").trim();
export const backlogTableLayout = headers => {
  const normalized = headers.map(value => clean(value).toLowerCase()).join("\0");
  return normalized === compactHeaders.join("\0") ? "compact" : normalized === legacyHeaders.join("\0") ? "legacy" : null;
};
const SKIPPABLE_BACKLOG_ERRORS = new Map([
  ["AGDF_BACKLOG_PATH_INVALID", "backlog_path_invalid"],
  ["AGDF_BACKLOG_LAYOUT_UNSUPPORTED", "backlog_layout_unsupported"],
  ["AGDF_BACKLOG_IDENTITY_AMBIGUOUS", "backlog_identity_ambiguous"],
]);

// A saved projection of the same policy used by the Run writer, never UR metadata or a
// reader-side claim of current readiness. Completion still belongs to explicit closeout.
export function backlogStatusForPolicy(after) {
  if (after.status === "blocked") return "Blocked";
  if (after.current_gate === "UR") return "Needs UR";
  if (after.current_gate === "Brownfield Review") return "Awaiting Brownfield Review";
  if (["PRD", "SD", "TP"].includes(after.current_gate)) return `Awaiting ${after.current_gate}`;
  if (["QA", "UAT"].includes(after.current_gate) && after.missing_approval === `Approval: ${after.current_gate}`) return `Awaiting ${after.current_gate}`;
  if (after.current_gate === "OR") return "Awaiting OR";
  if (["Brownfield Analysis", "CD+Tests", "CR", "Quick Task Execution", "Verified Change Execution", "Mode/Slice Decision"].includes(after.current_gate)) return `${after.current_gate} work pending`;
  return "In Progress";
}
export const backlogStatusForSummary = (summary, after) =>
  ["work_pending", "approval_pending", "closeout_pending"].includes(summary.kind)
    ? backlogStatusForPolicy(after) : summary.status_label;

export function assertBacklogPath(root) {
  if (hasSymlinkComponent(root, BACKLOG_RELATIVE_PATH)
      || existsSync(join(root, BACKLOG_RELATIVE_PATH)) && containedRegularFile(root, BACKLOG_RELATIVE_PATH).status !== "valid") {
    throw Error("AGDF_BACKLOG_PATH_INVALID");
  }
}

// Change only the addressed existing Active row. Keep title, links, order, other rows and
// archive/planning placement intact. Unsupported layouts and ambiguous identities fail closed.
export function prepareRunBacklog(root, runId, content, runPath, revisionId = parseRunState(content).meta.revision_id) {
  assertBacklogPath(root);
  const path = join(root, BACKLOG_RELATIVE_PATH);
  if (!existsSync(path)) return { status: "missing", update: null };
  const old = readFileSync(path, "utf8"), lines = old.split("\n");
  if (Buffer.byteLength(old) > 2097152) throw Error("AGDF_BACKLOG_LAYOUT_UNSUPPORTED");
  const section = firstSection(lines, "Active Backlog");
  if (!section) throw Error("AGDF_BACKLOG_LAYOUT_UNSUPPORTED");
  const indexes = tableLineIndexes(lines, section), layout = backlogTableLayout(tableCells(lines[indexes[0]] ?? ""));
  const width = layout === "compact" ? compactHeaders.length : layout === "legacy" ? legacyHeaders.length : undefined;
  if (!width || indexes.length < 2 || tableCells(lines[indexes[1]]).length !== width
      || tableCells(lines[indexes[1]]).some(value => !/^:?-{3,}:?$/u.test(value))) throw Error("AGDF_BACKLOG_LAYOUT_UNSUPPORTED");
  const matches = indexes.slice(2).filter(index => clean(tableCells(lines[index])[1] ?? "") === runId);
  if (matches.length > 1) throw Error("AGDF_BACKLOG_IDENTITY_AMBIGUOUS");
  if (!matches.length) return { status: "unlinked", update: null };
  for (const [heading, column] of [["Planned / Parking Lot", 1], ["Completed / Superseded Pointers", 0]]) {
    const other = firstSection(lines, heading);
    if (other && tableLineIndexes(lines, other).slice(2).some(index => clean(tableCells(lines[index])[column] ?? "") === runId)) throw Error("AGDF_BACKLOG_IDENTITY_AMBIGUOUS");
  }
  const index = matches[0], cells = tableCells(lines[index]);
  if (cells.length !== width) throw Error("AGDF_BACKLOG_LAYOUT_UNSUPPORTED");
  const after = policyForRunContent(root, content, runPath);
  const summary = runWorkSummary(root, content, runPath, after);
  const status = backlogStatusForSummary(summary, after);
  const next = summary.display_action;
  cells[3] = status; cells[width - 1] = next;
  lines[index] = tableLine(cells);
  const updated = recordBacklogSummary(root, lines.join("\n"), runId, "Active Backlog", summary, revisionId);
  return { status: old === updated ? "unchanged" : "updated", summary, update: old === updated ? null : { old, next: updated } };
}

// Approvals and run-update stay valid when the saved pointer cannot be synchronized. The
// pointer is left untouched and the result names why; the doctor reports the backlog itself.
export function prepareRunBacklogOrSkip(root, runId, content, runPath, revisionId) {
  try { return prepareRunBacklog(root, runId, content, runPath, revisionId); }
  catch (error) {
    const reason = SKIPPABLE_BACKLOG_ERRORS.get(error?.message);
    if (!reason) throw error;
    return { status: "skipped", reason, update: null };
  }
}
export const backlogSkip = plan => plan?.reason ? { backlog: plan.status, backlog_reason: plan.reason } : {};
