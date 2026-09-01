import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  classifyHistoricalDistributionProfile,
  validateDistributionProfileHistory,
} from "../runtime/distribution-profile-history.js";

export const SUPPORTED_PROFILE_RELEASES = Object.freeze([
  "0.13.6",
  "0.13.7",
  "0.13.8",
  "0.14.1",
  "0.14.2",
  "0.14.3",
]);

const HISTORY_PATH = "plugin/meta/distribution-profile-history.json";
const GENERATED_HISTORY_PATHS = [
  "create-agdf/generated/plugins/agdf/meta/distribution-profile-history.json",
  "create-agdf/generated/plugins/copilot/agdf/meta/distribution-profile-history.json",
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

function defaultReadTagFile(repoRoot) {
  return (tag, relativePath) => execFileSync(
    "git",
    ["show", `${tag}:${relativePath}`],
    { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
}

function assertTagRecord(catalogue, version, readTagFile) {
  const tag = `agdf-v${version}`;
  let definition;
  let packageManifest;
  let codexManifest;
  try {
    definition = parseJson(readTagFile(tag, "plugin/meta/agdf-plugin.definition.json"), "profile_history_tag_mismatch", `${tag} definition`);
    packageManifest = parseJson(readTagFile(tag, "create-agdf/package.json"), "profile_history_tag_mismatch", `${tag} package`);
    codexManifest = parseJson(readTagFile(tag, "plugin/.codex-plugin/plugin.json"), "profile_history_tag_mismatch", `${tag} Codex manifest`);
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
      parseJson(readTagFile(tag, "create-agdf/package.json"), "profile_history_tag_mismatch", `${tag} package`).version,
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
  try {
    return execFileSync(
      "git",
      ["show", `${mergeBase}:${HISTORY_PATH}`],
      { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
  } catch {
    let matchingPaths;
    try {
      matchingPaths = execFileSync(
        "git",
        ["ls-tree", "--name-only", mergeBase, "--", HISTORY_PATH],
        { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ).trim();
    } catch {
      fail("profile_history_continuity_break", "baseline tree evidence is unavailable");
    }
    if (matchingPaths === "") return null;
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
  baselineContent,
} = {}) {
  repoRoot = repoRoot ? resolve(repoRoot) : null;
  catalogueContent ??= readFileSync(join(repoRoot, HISTORY_PATH), "utf8");
  const canonicalBytes = catalogueContent.replaceAll("\r\n", "\n");
  const catalogue = parseJson(canonicalBytes, "profile_history_invalid", "distribution profile history");
  if (validateDistributionProfileHistory(catalogue).status !== "matched") {
    fail("profile_history_invalid", "catalogue schema or digest validation failed");
  }

  currentDefinition ??= JSON.parse(readFileSync(join(repoRoot, "plugin", "meta", "agdf-plugin.definition.json"), "utf8"));
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

  readTagFile ??= defaultReadTagFile(repoRoot);
  for (const version of new Set([
    ...SUPPORTED_PROFILE_RELEASES,
    ...Object.keys(catalogue.releases),
  ])) assertTagRecord(catalogue, version, readTagFile);
  assertIncoherentTagNegative(catalogue, readTagFile);

  if (baselineContent === undefined && repoRoot) baselineContent = baselineFromRepository(repoRoot);
  const continuity = assertContinuity(catalogue, baselineContent);
  return {
    catalogue,
    currentVersion: currentDefinition.version,
    supportedVersions: [...SUPPORTED_PROFILE_RELEASES],
    generatedPaths: [...GENERATED_HISTORY_PATHS],
    continuity,
  };
}
