import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { isAbsolute, posix, relative, resolve } from "node:path";
import { cleanStatusCell, isPlaceholderValue } from "./shared.js";

export function extractField(content, field) {
  const pattern = new RegExp(`^- ${field}:[^\\S\\r\\n]*(.*)$`, "m");
  return content.match(pattern)?.[1]?.trim() ?? "";
}

export const verifiedChangeStatuses = new Set(["draft", "eligible", "executed", "escalated"]);
export const verifiedChangeEscalationTargets = new Set(["structured_slice", "structured_delivery"]);

export function parseVerifiedChangePathList(value) {
  const cleaned = cleanStatusCell(value ?? "");
  if (!cleaned || cleaned === "none") return [];
  return cleaned.split(",").map((item) => item.trim()).filter(Boolean);
}

export function isSafeRepoRelativePath(value) {
  if (!value || value === "none" || value.startsWith("/") || value.includes("\\")) return false;
  const normalized = posix.normalize(value);
  return normalized !== "." && normalized !== ".." && !normalized.startsWith("../") && normalized === value;
}

export function gitPathList(targetDir, args) {
  try {
    return execFileSync("git", args, { cwd: targetDir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return null;
  }
}

export function gitValue(targetDir, args) {
  try {
    return execFileSync("git", args, { cwd: targetDir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

export function readVerifiedChangeRecord(targetDir, runState) {
  const artefact = runState.artefacts.get("Verified Change");
  if (!artefact?.path || isPlaceholderValue(artefact.path)) return { status: "missing", path: "", content: "" };
  if (!isSafeRepoRelativePath(artefact.path)) return { status: "invalid", path: artefact.path, content: "", error: "record_path_invalid" };
  const absolutePath = resolve(targetDir, artefact.path);
  const relativePath = relative(resolve(targetDir), absolutePath);
  if (isAbsolute(relativePath) || relativePath === ".." || relativePath.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) || !existsSync(absolutePath)) {
    return { status: "missing", path: artefact.path, content: "", error: "record_missing" };
  }
  return { status: "present", path: artefact.path, content: readFileSync(absolutePath, "utf8") };
}

export function evaluateVerifiedChange(targetDir, runState) {
  const record = readVerifiedChangeRecord(targetDir, runState);
  const findings = [];
  const add = (code, message, nextStep, severity = "revise") => findings.push({
    severity,
    code,
    message,
    path: record.path || runState.path,
    next_step: nextStep,
  });

  if (record.status === "missing") {
    return { status: "missing", record, findings };
  }
  if (record.status === "invalid") {
    add("AGDF_VERIFIED_CHANGE_RECORD_PATH_INVALID", "Verified Change record path must be a repository-relative path inside the target repository.", "Link a stable repository-relative VERIFIED_CHANGE.md artefact from the selected run state.", "block");
    return { status: "invalid", record, findings };
  }

  const status = cleanStatusCell(extractField(record.content, "status"));
  const relatedUr = cleanStatusCell(extractField(record.content, "related_ur"));
  const escalationTarget = cleanStatusCell(extractField(record.content, "escalation_target"));
  const canonicalOwner = cleanStatusCell(extractField(record.content, "canonical_owner"));
  const sourcePaths = parseVerifiedChangePathList(extractField(record.content, "allowed_source_paths"));
  const derivedPaths = parseVerifiedChangePathList(extractField(record.content, "allowed_derived_paths"));
  const prohibitedImpacts = cleanStatusCell(extractField(record.content, "prohibited_impacts"));
  const propagationCommand = extractField(record.content, "propagation_command");
  const validationCommands = extractField(record.content, "validation_commands");
  const baselineTracked = parseVerifiedChangePathList(extractField(record.content, "baseline_tracked_paths"));
  const baselineUntracked = parseVerifiedChangePathList(extractField(record.content, "baseline_untracked_paths"));
  const baselineCommit = cleanStatusCell(extractField(record.content, "baseline_commit"));
  const executionChangedPaths = parseVerifiedChangePathList(extractField(record.content, "execution_changed_paths"));
  const executionScopeStatus = cleanStatusCell(extractField(record.content, "execution_scope_status"));
  const validationStatus = cleanStatusCell(extractField(record.content, "validation_status"));
  const propagationStatus = cleanStatusCell(extractField(record.content, "propagation_status"));
  const urArtefact = runState.artefacts.get("UR");
  const lifecycle = extractField(runState.content, "lifecycle") || "active";
  const runId = extractField(runState.content, "run_id") || "";

  if (!verifiedChangeStatuses.has(status)) add("AGDF_VERIFIED_CHANGE_STATUS_INVALID", "Verified Change record must use status draft, eligible, executed or escalated.", "Set a supported record status or escalate to the declared structured target.");
  if (!isSafeRepoRelativePath(relatedUr) || relatedUr !== urArtefact?.path) add("AGDF_VERIFIED_CHANGE_RELATED_UR_INVALID", "Verified Change record must link exactly to the selected run's repository-relative UR artefact.", "Set related_ur to the selected run's durable UR artefact path.");
  if (!verifiedChangeEscalationTargets.has(escalationTarget)) add("AGDF_VERIFIED_CHANGE_ESCALATION_INVALID", "Verified Change record must declare structured_slice or structured_delivery as its escalation target.", "Record the Brownfield-selected structured escalation target.");
  if (!canonicalOwner || canonicalOwner.includes(",") || !isSafeRepoRelativePath(canonicalOwner)) add("AGDF_VERIFIED_CHANGE_OWNER_INVALID", "Verified Change requires exactly one repository-relative canonical_owner.", "Name one canonical owner path; otherwise escalate.");
  if (sourcePaths.length === 0 || sourcePaths.some((path) => !isSafeRepoRelativePath(path))) add("AGDF_VERIFIED_CHANGE_SOURCE_PATHS_INVALID", "Verified Change requires non-empty normalized allowed_source_paths.", "Declare a bounded comma-separated source path list; otherwise escalate.");
  if (derivedPaths.some((path) => !isSafeRepoRelativePath(path))) add("AGDF_VERIFIED_CHANGE_DERIVED_PATHS_INVALID", "Verified Change derived paths must be normalized repository-relative paths or none.", "Correct the derived path list or escalate.");
  if (prohibitedImpacts !== "none") add("AGDF_VERIFIED_CHANGE_IMPACTS_INVALID", "Verified Change must declare prohibited_impacts: none after checking gates, permissions, security, persistence, architecture, external API, CLI and release behavior.", "Use the structured path when any prohibited impact applies.");
  if (!validationCommands || validationCommands === "none") add("AGDF_VERIFIED_CHANGE_VALIDATION_MISSING", "Verified Change requires at least one deterministic validation command.", "Record a deterministic acceptance or consistency check, or escalate.");
  if (derivedPaths.length > 0 && (!propagationCommand || propagationCommand === "none")) add("AGDF_VERIFIED_CHANGE_PROPAGATION_MISSING", "Derived paths require a deterministic propagation command.", "Record the propagation command or escalate.");
  if (!extractField(record.content, "baseline_tracked_paths") || !extractField(record.content, "baseline_untracked_paths")) add("AGDF_VERIFIED_CHANGE_BASELINE_MISSING", "Verified Change requires both tracked and untracked baseline path fields, using none when empty.", "Capture the worktree baseline before marking the record eligible.");
  if (["eligible", "executed"].includes(status) && !/^[0-9a-f]{40,64}$/i.test(baselineCommit)) add("AGDF_VERIFIED_CHANGE_BASELINE_COMMIT_INVALID", "Eligible or executed Verified Change requires a full Git baseline_commit.", "Capture the current full Git commit id before eligibility or escalate.");

  if (["eligible", "executed"].includes(status) && lifecycle !== "completed" && /^[0-9a-f]{40,64}$/i.test(baselineCommit)) {
    const currentHead = gitValue(targetDir, ["rev-parse", "HEAD"]);
    if (!currentHead) {
      add("AGDF_VERIFIED_CHANGE_BASELINE_COMMIT_UNAVAILABLE", "Active Verified Change requires a readable current Git HEAD for baseline identity validation.", "Restore Git repository access or use the structured path.", "block");
    } else if (baselineCommit !== currentHead) {
      add("AGDF_VERIFIED_CHANGE_BASELINE_COMMIT_MISMATCH", "Active Verified Change baseline_commit does not match the current Git HEAD.", "Recapture the baseline before eligibility or escalate; do not reuse a stale or fabricated baseline identity.", "block");
    }
  }

  const allowedPaths = new Set([...sourcePaths, ...derivedPaths]);
  const baselinePaths = new Set([...baselineTracked, ...baselineUntracked]);
  const dirtyCandidate = [...allowedPaths].find((path) => baselinePaths.has(path));
  if (dirtyCandidate) add("AGDF_VERIFIED_CHANGE_BASELINE_CANDIDATE_DIRTY", `Declared candidate path is already dirty at baseline: ${dirtyCandidate}.`, "Escalate or start from a clean candidate path; do not adopt pre-existing edits.", "block");

  const permittedControlPaths = new Set([record.path, runState.path, ".agdf/control/MASTER_BACKLOG.md"]);
  const runArtefactPrefix = `.agdf/control/artefacts/${runId}/`;
  for (const artefact of runState.artefacts.values()) {
    if (artefact.path_format === "invalid") continue;
    if (isSafeRepoRelativePath(artefact.path) && artefact.path.startsWith(runArtefactPrefix)) permittedControlPaths.add(artefact.path);
  }

  if (!(lifecycle === "completed" && status === "executed")) {
    const currentTracked = gitPathList(targetDir, ["diff", "HEAD", "--name-only"]);
    const currentUntracked = gitPathList(targetDir, ["ls-files", "--others", "--exclude-standard"]);
    if (currentTracked === null || currentUntracked === null) {
      add("AGDF_VERIFIED_CHANGE_GIT_BASELINE_UNAVAILABLE", "Verified Change requires a readable Git worktree for scoped baseline validation.", "Use the structured path or restore Git worktree access.", "block");
    } else {
      const introduced = [...new Set([...currentTracked, ...currentUntracked])].filter((path) => !baselinePaths.has(path)).sort();
      const unexpected = introduced.filter((path) => !allowedPaths.has(path) && !permittedControlPaths.has(path));
      if (unexpected.length > 0) add("AGDF_VERIFIED_CHANGE_SCOPE_ESCAPE", `Verified Change introduced unlisted path(s): ${unexpected.join(", ")}.`, "Mark the record escalated and continue at the declared structured target.", "block");
      if (status === "executed" && JSON.stringify(introduced) !== JSON.stringify([...executionChangedPaths].sort())) {
        add("AGDF_VERIFIED_CHANGE_EXECUTION_SCOPE_MISMATCH", "Executed Verified Change execution_changed_paths must equal the post-baseline changed-path set.", "Record the exact changed paths or escalate.", "block");
      }
    }
  } else {
    const unsafeExecutionPath = executionChangedPaths.find((path) => !isSafeRepoRelativePath(path) || (!allowedPaths.has(path) && !permittedControlPaths.has(path)));
    if (unsafeExecutionPath) add("AGDF_VERIFIED_CHANGE_EXECUTION_SCOPE_INVALID", `Recorded execution path is outside the eligible scope: ${unsafeExecutionPath}.`, "Correct the historical execution snapshot or escalate.", "block");
  }

  if (status === "executed") {
    if (executionChangedPaths.length === 0 || !executionChangedPaths.some((path) => allowedPaths.has(path)) || executionScopeStatus !== "pass") add("AGDF_VERIFIED_CHANGE_EXECUTION_EVIDENCE_MISSING", "Executed Verified Change requires a non-empty execution_changed_paths set containing a declared source/derived path and execution_scope_status: pass.", "Record complete execution-scope evidence or escalate.");
    if (validationStatus !== "pass") add("AGDF_VERIFIED_CHANGE_VALIDATION_EVIDENCE_MISSING", "Executed Verified Change requires validation_status: pass.", "Record passing deterministic validation evidence or escalate.");
    if (derivedPaths.length > 0 && propagationStatus !== "pass") add("AGDF_VERIFIED_CHANGE_PROPAGATION_EVIDENCE_MISSING", "Executed Verified Change with derived paths requires propagation_status: pass.", "Record successful propagation evidence or escalate.");
  }

  if (status === "escalated") return { status: "escalated", record, escalation_target: escalationTarget, findings };
  if (findings.length > 0) return { status: "invalid", record, escalation_target: escalationTarget, findings };
  return { status, record, escalation_target: escalationTarget, findings };
}
