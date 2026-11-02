import { getPluginSourceRoot, PLUGIN_SOURCE_RELATIVE } from "../public-plugin/source-root.js";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  classifyHistoricalDistributionProfile,
  validateDistributionProfileHistory,
} from "../../packages/core/lib/runtime/distribution-profile-history.js";

export const SUPPORTED_PROFILE_RELEASES = Object.freeze([
  "0.13.6",
  "0.13.7",
  "0.13.8",
  "0.14.1",
  "0.14.2",
  "0.14.3",
]);

const HISTORY_PATH = "plugins/agdf/meta/distribution-profile-history.json";
const GENERATED_HISTORY_PATHS = [
  "packages/cli/generated/plugins/agdf/meta/distribution-profile-history.json",
  "packages/cli/generated/plugins/copilot/agdf/meta/distribution-profile-history.json",
];

function fail(reason, detail) {
  const error = new Error(`${reason}: ${detail}`);
  error.code = reason;
  throw error;
}

function parseJson(content, reason, label) {
  try {
    return JSON.parse(content);
  } catch {
    fail(reason, `${label} is not valid JSON`);
  }
}

export function readHistoricalPackageManifest(readTagFile, tag) {
  const found = [];
  for (const path of ["packages/cli/package.json", "create-agdf/package.json"]) {
    let content;
    try { content = readTagFile(tag, path); } catch { continue; }
    if (typeof content === "string") found.push({ path, content });
  }
  if (found.length !== 1) throw Object.assign(new Error(`profile_history_tag_mismatch: ${tag} package owner ${found.length ? "ambiguous" : "missing"}`), { code: "profile_history_tag_mismatch" });
  return parseJson(found[0].content, "profile_history_tag_mismatch", `${tag} package ${found[0].path}`);
}

function defaultReadTagFile(repoRoot) {
  return (tag, relativePath) => execFileSync(
    "git",
    ["show", `${tag}:${relativePath}`],
    { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
}

function defaultTagExists(repoRoot) {
  return (tag) => {
    try {
      execFileSync(
        "git",
        ["rev-parse", "--verify", "--quiet", `refs/tags/${tag}`],
        { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      );
      return true;
    } catch {
      return false;
    }
  };
}

// Tags before the source migration keep their original paths. Resolve exactly one
// tagged source owner; this is archive compatibility, never a live old-root fallback.
function readTaggedPluginFile(tag, path, readTagFile) {
  const found = [];
  for (const root of [PLUGIN_SOURCE_RELATIVE, "plugin"]) {
    try {
      const value = readTagFile(tag, `${root}/${path}`);
      if (typeof value === "string") found.push(value);
    } catch { /* Absent path at this immutable tag. */ }
  }
  if (found.length !== 1) fail("profile_history_tag_mismatch", `${tag} must have exactly one tagged source root for ${path}`);
  return found[0];
}

function assertTagRecord(catalogue, version, readTagFile) {
  const tag = `agdf-v${version}`;
  let definition;
  let packageManifest;
  let codexManifest;
  try {
    definition = parseJson(readTaggedPluginFile(tag, "meta/agdf-plugin.definition.json", readTagFile), "profile_history_tag_mismatch", `${tag} definition`);
    packageManifest = readHistoricalPackageManifest(readTagFile, tag);
    codexManifest = parseJson(readTaggedPluginFile(tag, ".codex-plugin/plugin.json", readTagFile), "profile_history_tag_mismatch", `${tag} Codex manifest`);
  } catch (error) {
    if (error.code === "profile_history_tag_mismatch") throw error;
    fail("profile_history_tag_mismatch", `${tag} evidence is unavailable`);
  }
  if (definition.version !== version || packageManifest.version !== version || codexManifest.version !== version) {
    fail("profile_history_tag_mismatch", `${tag} does not identify exact version ${version}`);
  }
  const classification = classifyHistoricalDistributionProfile({
    catalogue,
    version,
    distributionProfiles: definition.distributionProfiles,
  });
  if (classification.status !== "matched") {
    fail("profile_history_tag_mismatch", `${tag} does not match its catalogue contract`);
  }
}

function assertIncoherentTagNegative(catalogue, readTagFile) {
  if (Object.hasOwn(catalogue.releases, "0.14.0")) {
    fail("profile_history_tag_mismatch", "incoherent agdf-v0.14.0 must not have a release record");
  }
  const tag = "agdf-v0.14.0";
  let versions;
  try {
    versions = [
      parseJson(readTagFile(tag, "plugin/meta/agdf-plugin.definition.json"), "profile_history_tag_mismatch", `${tag} definition`).version,
      readHistoricalPackageManifest(readTagFile, tag).version,
      parseJson(readTagFile(tag, "plugin/.codex-plugin/plugin.json"), "profile_history_tag_mismatch", `${tag} Codex manifest`).version,
    ];
  } catch (error) {
    if (error.code === "profile_history_tag_mismatch") throw error;
    fail("profile_history_tag_mismatch", `${tag} negative evidence is unavailable`);
  }
  if (versions.some((version) => version !== "0.13.8")) {
    fail("profile_history_tag_mismatch", `${tag} must remain the explicit internally-0.13.8 negative`);
  }
}

function baselineFromRepository(repoRoot) {
  let mergeBase;
  try {
    mergeBase = execFileSync(
      "git",
      ["merge-base", "HEAD", "origin/main"],
      { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch {
    fail("profile_history_continuity_break", "merge-base evidence is unavailable");
  }
  let matchingPaths;
  try {
    matchingPaths = execFileSync(
      "git",
      ["ls-tree", "--name-only", mergeBase, "--", HISTORY_PATH, "plugin/meta/distribution-profile-history.json"],
      { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim().split(/\r?\n/u).filter(Boolean);
  } catch {
    fail("profile_history_continuity_break", "baseline tree evidence is unavailable");
  }
  if (!matchingPaths.length) return null;
  if (matchingPaths.length !== 1) fail("profile_history_continuity_break", "baseline has competing source catalogues");
  try {
    return execFileSync("git", ["show", `${mergeBase}:${matchingPaths[0]}`], {
      cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    fail("profile_history_continuity_break", "baseline catalogue cannot be read");
  }
}

function assertContinuity(catalogue, baselineContent) {
  if (baselineContent === null) return "initial_catalogue";
  if (baselineContent === undefined) {
    fail("profile_history_continuity_break", "baseline continuity evidence is unavailable");
  }
  const baseline = parseJson(baselineContent, "profile_history_continuity_break", "baseline catalogue");
  if (validateDistributionProfileHistory(baseline).status !== "matched") {
    fail("profile_history_continuity_break", "baseline catalogue is invalid");
  }
  for (const [version, priorRelease] of Object.entries(baseline.releases)) {
    const currentRelease = catalogue.releases[version];
    const priorContract = baseline.contracts[priorRelease.contract_id];
    const currentContract = catalogue.contracts[currentRelease?.contract_id];
    if (JSON.stringify(currentRelease) !== JSON.stringify(priorRelease)
        || JSON.stringify(currentContract) !== JSON.stringify(priorContract)) {
      fail("profile_history_continuity_break", `supported release ${version} was removed or changed`);
    }
  }
  return "matched";
}

export function assertDistributionProfileHistory({
  repoRoot,
  catalogueContent,
  generatedContents,
  currentDefinition,
  readTagFile,
  tagExists,
  baselineContent,
} = {}) {
  repoRoot = repoRoot ? resolve(repoRoot) : null;
  catalogueContent ??= readFileSync(join(repoRoot, HISTORY_PATH), "utf8");
  const canonicalBytes = catalogueContent.replaceAll("\r\n", "\n");
  const catalogue = parseJson(canonicalBytes, "profile_history_invalid", "distribution profile history");
  if (validateDistributionProfileHistory(catalogue).status !== "matched") {
    fail("profile_history_invalid", "catalogue schema or digest validation failed");
  }

  currentDefinition ??= JSON.parse(readFileSync(join(getPluginSourceRoot(repoRoot), "meta", "agdf-plugin.definition.json"), "utf8"));
  const current = classifyHistoricalDistributionProfile({
    catalogue,
    version: currentDefinition.version,
    distributionProfiles: currentDefinition.distributionProfiles,
  });
  if (current.status !== "matched") {
    fail("profile_history_current_release_mismatch", `current definition ${currentDefinition.version} has no exact matching snapshot`);
  }

  generatedContents ??= Object.fromEntries(GENERATED_HISTORY_PATHS.map((path) => [
    path,
    existsSync(join(repoRoot, path)) ? readFileSync(join(repoRoot, path), "utf8") : null,
  ]));
  for (const path of GENERATED_HISTORY_PATHS) {
    if (generatedContents[path] !== canonicalBytes) {
      fail("profile_history_current_release_mismatch", `generated catalogue drift at ${path}`);
    }
  }

  const suppliedReadTagFile = Boolean(readTagFile);
  readTagFile ??= defaultReadTagFile(repoRoot);
  tagExists ??= suppliedReadTagFile && !repoRoot ? () => true : defaultTagExists(repoRoot);
  const supportedVersions = [...new Set([
    ...SUPPORTED_PROFILE_RELEASES,
    ...Object.keys(catalogue.releases),
  ])];
  for (const version of supportedVersions) {
    const tag = `agdf-v${version}`;
    if (version === currentDefinition.version && !tagExists(tag)) continue;
    assertTagRecord(catalogue, version, readTagFile);
  }
  assertIncoherentTagNegative(catalogue, readTagFile);

  if (baselineContent === undefined && repoRoot) baselineContent = baselineFromRepository(repoRoot);
  const continuity = assertContinuity(catalogue, baselineContent);
  return {
    catalogue,
    currentVersion: currentDefinition.version,
    supportedVersions,
    generatedPaths: [...GENERATED_HISTORY_PATHS],
    continuity,
  };
}
