import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { firstSection, tableCells, tableLine, tableLineIndexes } from "./run-state-edits.js";
import { containedRegularFile, hasSymlinkComponent } from "./contained-file.js";
import { policyForRunContent } from "../control-evaluation/run-step-policy.js";

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
  return "In Progress";
}

export function assertBacklogPath(root) {
  if (hasSymlinkComponent(root, BACKLOG_RELATIVE_PATH)
      || existsSync(join(root, BACKLOG_RELATIVE_PATH)) && containedRegularFile(root, BACKLOG_RELATIVE_PATH).status !== "valid") {
    throw Error("AGDF_BACKLOG_PATH_INVALID");
  }
}

// Change only the addressed existing Active row. Keep title, links, order, other rows and
// archive/planning placement intact. Unsupported layouts and ambiguous identities fail closed.
export function prepareRunBacklog(root, runId, content, runPath) {
  assertBacklogPath(root);
  const path = join(root, BACKLOG_RELATIVE_PATH);
  if (!existsSync(path)) return { status: "missing", update: null };
  const old = readFileSync(path, "utf8"), lines = old.split("\n");
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
  const status = backlogStatusForPolicy(after), next = after.next_allowed_action;
  if (cells[3] === status && cells.at(-1) === next) return { status: "unchanged", update: null };
  cells[3] = status; cells[width - 1] = next;
  lines[index] = tableLine(cells);
  return { status: "updated", update: { old, next: lines.join("\n") } };
}

// Approvals and run-update stay valid when the saved pointer cannot be synchronized. The
// pointer is left untouched and the result names why; the doctor reports the backlog itself.
export function prepareRunBacklogOrSkip(root, runId, content, runPath) {
  try { return prepareRunBacklog(root, runId, content, runPath); }
  catch (error) {
    const reason = SKIPPABLE_BACKLOG_ERRORS.get(error?.message);
    if (!reason) throw error;
    return { status: "skipped", reason, update: null };
  }
}
export const backlogSkip = plan => plan?.reason ? { backlog: plan.status, backlog_reason: plan.reason } : {};
