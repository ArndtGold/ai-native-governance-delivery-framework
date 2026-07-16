import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import process from "node:process";
import { parseControlState, resolveRuns } from "../control-state/index.js";
import { buildRunCandidates } from "../interaction-presentation.js";
import { cleanStatusCell, filled, isPlaceholderValue, readTargetFile } from "./shared.js";
import { extractField, isSafeRepoRelativePath, readVerifiedChangeRecord } from "./verified-change.js";

export const userGateOrder = ["UR", "PRD", "SD", "TP", "QA", "UAT"];
export const durableGateArtefacts = new Set(["UR", "PRD", "SD", "TP", "QA"]);
export const internalStepArtefacts = new Set(["Brownfield Review", "Verified Change", "Brownfield Analysis", "CD+Tests", "TP Review", "Clean Implementation Review", "Clean Review", "CR", "Code Review"]);
export const closeoutArtefacts = new Set(["OR"]);

export function resolvedArtefactFile(targetDir, rawPath) {
  const normalizedPath = String(rawPath ?? "").replace(/^`|`$/g, "").trim();
  if (!normalizedPath || isAbsolute(normalizedPath) || normalizedPath.includes("<") || normalizedPath.includes(">")) return "";
  const absolutePath = resolve(targetDir, normalizedPath);
  if (relative(targetDir, absolutePath).startsWith("..") || !existsSync(absolutePath)) return "";
  try {
    const realPath = realpathSync(absolutePath);
    return relative(realpathSync(targetDir), realPath).startsWith("..") || !statSync(realPath).isFile() ? "" : realPath;
  } catch {
    return "";
  }
}

export function readArtefactHeading(targetDir, artefact) {
  const artefactPath = resolvedArtefactFile(targetDir, artefact?.path);
  if (!artefactPath) return "";
  try {
    return readFileSync(artefactPath, "utf8").match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "";
  } catch {
    return "";
  }
}

export function readRunState(targetDir, selection = {}) {
  let runPath = join(".agdf", "control", "AGDF_RUN.md");
  const canonicalRoot = join(targetDir, ".agdf", "control", "runs");
  let resolutionError;
  let candidateRuns = [];
  if (existsSync(canonicalRoot)) {
    try {
      const selected = resolveRuns(targetDir, {
        runIdArg: selection.runId,
        runIdEnv: process.env.AGDF_RUN_ID,
      });
      runPath = selected.run.path.startsWith(targetDir)
        ? selected.run.path.slice(targetDir.length + 1)
        : selected.run.path;
    } catch (error) {
      resolutionError = error.message;
      if (resolutionError.startsWith("AGDF_ACTIVE_RUN_AMBIGUOUS")) {
        const active = resolveRuns(targetDir, { allActive: true }).runs.map((run) => {
          const controlState = parseControlState(run.content, {
            userGates: userGateOrder,
            internalSteps: [...internalStepArtefacts],
            closeoutArtefacts: [...closeoutArtefacts],
          });
          return {
            ...run,
            control_state: controlState,
            current_artefact_heading: readArtefactHeading(targetDir, controlState.artefacts.get(controlState.current_gate)),
            ur_heading: readArtefactHeading(targetDir, controlState.artefacts.get("UR")),
          };
        });
        candidateRuns = buildRunCandidates(active);
      }
    }
  }
  if (resolutionError || !existsSync(join(targetDir, runPath))) {
    return {
      path: runPath,
      content: "",
      current_gate: "",
      next_allowed_action: "",
      approvals: new Map(),
      artefacts: new Map(),
      evidence_refs: [],
      artefact_chain: [],
      mode_slice_decision: {},
      missing_evidence: [],
      risks: [],
      context_graph: {},
      quality_outlook: "",
      source_scope: {},
      memory: {},
      candidate_runs: candidateRuns,
      resolution_error: resolutionError,
    };
  }

  const content = readTargetFile(targetDir, runPath);
  const parsed = parseControlState(content, {
    userGates: userGateOrder,
    internalSteps: [...internalStepArtefacts],
    closeoutArtefacts: [...closeoutArtefacts],
  });

  return {
    path: runPath,
    content,
    ...parsed,
  };
}

export function gateApprovalStatus(runState, gate) {
  if (!userGateOrder.includes(gate)) return "not_applicable";
  return runState.approvals.get(gate)?.status ?? "";
}

export function gateArtefactStatus(runState, gate) {
  if (!userGateOrder.includes(gate)) return { status: "not_applicable", path: "" };
  return runState.artefacts.get(gate) ?? { status: "", path: "" };
}

export function isDurableGateArtefactSatisfied(runState, gate) {
  if (!durableGateArtefacts.has(gate)) return true;
  const artefact = gateArtefactStatus(runState, gate);
  if (!artefact.path || isPlaceholderValue(artefact.path)) return false;
  if (gate === "QA") return artefact.status === "pass" || artefact.status === "passed";
  return artefact.status === "approved";
}

export function expectedDurableArtefactStatuses(gate) {
  return gate === "QA" ? ["pass", "passed"] : ["approved"];
}

export function describeDurableArtefactStatuses(gate) {
  return expectedDurableArtefactStatuses(gate).map((status) => `\`${status}\``).join(" or ");
}

export function analyzeDurableGateArtefactConsistency(runState) {
  const findings = [];

  for (const gate of durableGateArtefacts) {
    if (gateApprovalStatus(runState, gate) !== "approved") continue;

    const artefact = gateArtefactStatus(runState, gate);
    if (!artefact.path || isPlaceholderValue(artefact.path) || !artefact.status) continue;

    const expectedStatuses = expectedDurableArtefactStatuses(gate);
    if (expectedStatuses.includes(artefact.status)) continue;

    findings.push({
      severity: "revise",
      code: "AGDF_GATE_ARTEFACT_STATUS_INCONSISTENT",
      message: `${gate} approval is recorded, but the durable artefact row uses status \`${artefact.status}\`; expected ${describeDurableArtefactStatuses(gate)}.`,
      path: runState.path,
      next_step: `Update the ${gate} artefact row in the selected RUN_STATE.md to use the gate-specific durable status vocabulary.`,
    });
  }

  return findings;
}

export function analyzeArtefactRoleConsistency(targetDir, runState) {
  const findings = [];
  for (const [type, artefact] of runState.artefacts) {
    if (artefact.path_format === "invalid") {
      findings.push({
        severity: "block",
        code: "AGDF_ARTEFACT_PATH_FORMAT_INVALID",
        message: `${type} uses an invalid artefact path cell (${artefact.path_reason}).`,
        path: runState.path,
        next_step: "Use a plain repository-relative path or one complete Markdown code span.",
      });
    } else if (artefact.path && !isSafeRepoRelativePath(artefact.path)) {
      findings.push({
        severity: "block",
        code: "AGDF_ARTEFACT_PATH_INVALID",
        message: `${type} must use a normalized repository-relative artefact path.`,
        path: runState.path,
        next_step: "Remove absolute, traversal, unsupported-backslash or otherwise non-normalized path text.",
      });
    }
  }
  const rolesByPath = new Map();
  for (const [type, artefact] of runState.artefacts) {
    if (!artefact.path) continue;
    rolesByPath.set(artefact.path, [...(rolesByPath.get(artefact.path) ?? []), type]);
  }
  for (const [path, roles] of rolesByPath) {
    if (roles.length < 2) continue;
    const allowedRoles = new Set(["Brownfield Review", "Verified Change", "OR"]);
    if (modeSliceDecision(runState) !== "verified_change" || roles.some((role) => !allowedRoles.has(role))) {
      findings.push({ severity: "block", code: "AGDF_ARTEFACT_ROLE_ALIAS_INVALID", message: `Artefact path is reused across incompatible roles: ${roles.join(", ")}.`, path, next_step: "Use distinct artefacts or a lifecycle-consistent Verified Change compact record." });
      continue;
    }
    const record = readVerifiedChangeRecord(targetDir, runState);
    if (record.status !== "present") continue;
    const recordStatus = cleanStatusCell(extractField(record.content, "status"));
    const brownfieldComplete = extractField(record.content, "decision") === "verified_change" && filled(extractField(record.content, "scope_reason")) && filled(extractField(record.content, "evidence"));
    const miniCloseoutComplete = ["delivered", "intentionally_not_delivered", "residual_risk", "next_step"].every((field) => filled(extractField(record.content, field)));
    if (roles.includes("Brownfield Review") && (runState.artefacts.get("Brownfield Review")?.status !== "done" || !brownfieldComplete)) findings.push({ severity: "block", code: "AGDF_VERIFIED_CHANGE_BROWNFIELD_ROLE_INVALID", message: "Consolidated Brownfield Review role is incomplete.", path, next_step: "Complete Brownfield Selection before eligibility." });
    if (roles.includes("Verified Change") && runState.artefacts.get("Verified Change")?.status !== recordStatus) findings.push({ severity: "block", code: "AGDF_VERIFIED_CHANGE_ROLE_STATUS_MISMATCH", message: "Verified Change artefact row status does not match the compact record.", path, next_step: "Align the run-state row and record status." });
    if (roles.includes("OR") && runState.artefacts.get("OR")?.status === "done" && (recordStatus !== "executed" || !miniCloseoutComplete)) findings.push({ severity: "block", code: "AGDF_VERIFIED_CHANGE_OR_ROLE_INVALID", message: "Consolidated OR is complete before execution and Mini-Closeout evidence are complete.", path, next_step: "Complete execution and Mini-Closeout evidence before marking OR done." });
  }
  return findings;
}

export function isInternalStepSatisfied(runState, step) {
  const artefact = runState.artefacts.get(step);
  if (!artefact) return false;
  if (artefact.status === "done") return true;
  return artefact.status === "not_applicable"
    && (step === "Brownfield Review" || step === "Brownfield Analysis");
}

export function modeSliceDecision(runState) {
  const decision = runState.mode_slice_decision?.decision ?? "";
  const scopeReason = runState.mode_slice_decision?.scope_reason ?? "";
  const evidence = runState.mode_slice_decision?.evidence ?? "";
  if (!decision || isPlaceholderValue(decision) || !filled(scopeReason) || !filled(evidence)) return "undecided";
  return decision;
}

