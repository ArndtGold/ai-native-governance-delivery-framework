import { existsSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, sep } from "node:path";
import { resolveRepositoryContext } from "./repository-context.js";

const TARGET_SOURCES = new Set(["explicit_target", "continued_target", "current_repository"]);

function canonicalPath(path) {
  try { return realpathSync(path); } catch { return null; }
}

function canonicalDirectory(path) {
  const canonical = canonicalPath(path);
  try { return canonical && statSync(canonical).isDirectory() ? canonical : ""; } catch { return ""; }
}

function isInside(root, candidate) {
  const path = relative(root, candidate);
  return path === "" || (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

function unresolved(reasonCode, { workingDirectory, evidenceSources = [], targetSource = "", nextAction }) {
  return Object.freeze({
    schema_version: "1",
    resolution_state: "unresolved",
    reason_code: reasonCode,
    primary_target: "",
    evidence_sources: Object.freeze([...evidenceSources]),
    working_directory: workingDirectory,
    governance_target: "",
    target_source: targetSource,
    target_changed: false,
    next_action: nextAction,
    authorizes: false,
  });
}

function repositoryRoot(target, runGit) {
  const start = statSync(target).isDirectory() ? target : dirname(target);
  const context = resolveRepositoryContext(start, { runGit });
  const root = context.context_state === "repository_bound" ? context.repository_root : null;
  return root && isInside(root, target) ? root : null;
}

export function resolveTaskTarget(input = {}, dependencies = {}) {
  const runGit = dependencies.runGit;
  const rawWorkingDirectory = String(input.workingDirectory ?? "").trim();
  const workingDirectory = isAbsolute(rawWorkingDirectory) && existsSync(rawWorkingDirectory)
    ? canonicalDirectory(rawWorkingDirectory)
    : "";
  const evidenceSources = Array.isArray(input.evidenceSources)
    ? input.evidenceSources.map((item) => String(item ?? "").trim()).filter(Boolean)
    : [];
  const candidates = Array.isArray(input.candidates)
    ? [...new Set(input.candidates.map((item) => String(item ?? "").trim()).filter(Boolean))]
    : [];
  const targetSource = String(input.targetSource ?? "").trim();
  const normalizedTargetSource = TARGET_SOURCES.has(targetSource) ? targetSource : "";
  const rawTarget = String(input.primaryTarget ?? "").trim();

  if (!workingDirectory) {
    return unresolved("target_content_mismatch", {
      workingDirectory: rawWorkingDirectory || "unavailable",
      evidenceSources,
      targetSource: normalizedTargetSource,
      nextAction: "Provide an absolute accessible working directory as execution context.",
    });
  }
  if (candidates.length > 1 || (candidates.length === 1 && rawTarget && candidates[0] !== rawTarget)) {
    return unresolved("multiple_plausible_targets", {
      workingDirectory,
      evidenceSources: [...evidenceSources, ...candidates],
      targetSource: normalizedTargetSource,
      nextAction: "Select exactly one primary task target.",
    });
  }
  if (!TARGET_SOURCES.has(targetSource) || !rawTarget) {
    return unresolved("no_reliable_target", {
      workingDirectory,
      evidenceSources,
      targetSource: normalizedTargetSource,
      nextAction: "Name one task target and classify it as explicit_target, continued_target or current_repository.",
    });
  }
  if (targetSource === "continued_target" && input.targetChanged === true) {
    return unresolved("target_content_mismatch", {
      workingDirectory,
      evidenceSources,
      targetSource: normalizedTargetSource,
      nextAction: "Classify a replaced target as explicit_target, not continued_target.",
    });
  }
  if (!isAbsolute(rawTarget)) {
    return unresolved("target_content_mismatch", {
      workingDirectory,
      evidenceSources,
      targetSource: normalizedTargetSource,
      nextAction: "Provide one absolute target path that agrees with the selected target source.",
    });
  }
  if (!existsSync(rawTarget)) {
    return unresolved("target_unavailable", {
      workingDirectory,
      evidenceSources,
      targetSource: normalizedTargetSource,
      nextAction: "Make the named target available and retry target-check.",
    });
  }

  const primaryTarget = canonicalPath(rawTarget);
  if (!primaryTarget) {
    return unresolved("target_unavailable", {
      workingDirectory,
      evidenceSources,
      targetSource: normalizedTargetSource,
      nextAction: "Make the named target readable and retry target-check.",
    });
  }
  const governanceTarget = repositoryRoot(primaryTarget, runGit);
  if (!governanceTarget) {
    return unresolved("target_content_mismatch", {
      workingDirectory,
      evidenceSources,
      targetSource: normalizedTargetSource,
      nextAction: "Choose a target inside the Git repository whose governance should be evaluated.",
    });
  }
  if (targetSource === "current_repository" && primaryTarget !== governanceTarget) {
    return unresolved("target_content_mismatch", {
      workingDirectory,
      evidenceSources,
      targetSource: normalizedTargetSource,
      nextAction: "For current_repository, provide the verified repository root as the primary target.",
    });
  }
  if (targetSource === "current_repository") {
    const workingContext = resolveRepositoryContext(workingDirectory, { runGit });
    if (workingContext.context_state !== "repository_bound" || workingContext.repository_root !== governanceTarget) {
      return unresolved("target_content_mismatch", {
        workingDirectory,
        evidenceSources,
        targetSource: normalizedTargetSource,
        nextAction: "Use current_repository only when the execution context is inside that verified repository.",
      });
    }
  }

  return Object.freeze({
    schema_version: "1",
    resolution_state: "resolved",
    reason_code: targetSource === "continued_target" ? "continued_target" : "explicit_target",
    primary_target: primaryTarget,
    evidence_sources: Object.freeze(evidenceSources),
    working_directory: workingDirectory,
    governance_target: governanceTarget,
    target_source: targetSource,
    target_changed: input.targetChanged === true,
    next_action: "",
    authorizes: false,
  });
}
