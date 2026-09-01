import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertReleaseVersionCoherence, collectReleaseVersionEvidence } from "../lib/release/version-coherence.js";
import { assertDistributionProfileHistory } from "../lib/release/profile-history.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "..");
const evidence = collectReleaseVersionEvidence({ repoRoot });
const historyPath = resolve(repoRoot, "plugin", "meta", "distribution-profile-history.json");
const catalogueContent = readFileSync(historyPath, "utf8");
const currentDefinition = JSON.parse(readFileSync(resolve(repoRoot, "plugin", "meta", "agdf-plugin.definition.json"), "utf8"));
const generatedContents = Object.fromEntries([
  "create-agdf/generated/plugins/agdf/meta/distribution-profile-history.json",
  "create-agdf/generated/plugins/copilot/agdf/meta/distribution-profile-history.json",
].map((path) => [path, readFileSync(resolve(repoRoot, ...path.split("/")), "utf8")]));
const readTagFile = (tag, path) => execFileSync(
  "git",
  ["show", `${tag}:${path}`],
  { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
);

assert.throws(
  () => assertReleaseVersionCoherence({
    evidence: {
      expectedVersion: evidence.expectedVersion,
      entries: [{ relativePath: "create-agdf/generated/plugins/agdf/runtime/runtime-manifest.json", actualVersion: "0.0.0" }],
    },
  }),
  (error) => error.code === "AGDF_GENERATED_VERSION_STALE" && error.message.includes("release:prepare"),
);
assert.throws(
  () => assertReleaseVersionCoherence({
    evidence: {
      expectedVersion: evidence.expectedVersion,
      entries: [{ relativePath: "agdf/package.json", actualVersion: "0.0.0" }],
    },
  }),
  (error) => error.code === "AGDF_RELEASE_VERSION_SKEW",
);

assertReleaseVersionCoherence({ evidence });
const historyEvidence = assertDistributionProfileHistory({ repoRoot });

const commonHistoryOptions = {
  catalogueContent,
  currentDefinition,
  generatedContents,
  readTagFile,
  baselineContent: null,
};
const missingCurrent = JSON.parse(catalogueContent);
delete missingCurrent.releases[currentDefinition.version];
assert.throws(
  () => assertDistributionProfileHistory({ ...commonHistoryOptions, catalogueContent: `${JSON.stringify(missingCurrent)}\n` }),
  (error) => error.code === "profile_history_current_release_mismatch",
);
assert.throws(
  () => assertDistributionProfileHistory({
    ...commonHistoryOptions,
    generatedContents: { ...generatedContents, "create-agdf/generated/plugins/agdf/meta/distribution-profile-history.json": "{}\n" },
  }),
  (error) => error.code === "profile_history_current_release_mismatch",
);
assert.throws(
  () => assertDistributionProfileHistory({
    ...commonHistoryOptions,
    readTagFile(tag, path) {
      const content = readTagFile(tag, path);
      if (tag === "agdf-v0.13.8" && path === "create-agdf/package.json") {
        return `${JSON.stringify({ ...JSON.parse(content), version: "0.13.7" })}\n`;
      }
      return content;
    },
  }),
  (error) => error.code === "profile_history_tag_mismatch",
);

const baseline = JSON.parse(catalogueContent);
const priorVersion = "0.13.5";
const priorRelease = {
  contract_id: "four-profile-v1",
  provenance_schema_version: 1,
  profile_id: "runtime-plugin",
  status: "supported",
};
const entryValue = {
  version: priorVersion,
  contract_id: priorRelease.contract_id,
  contract_digest: baseline.contracts[priorRelease.contract_id].contract_digest,
  provenance_schema_version: priorRelease.provenance_schema_version,
  profile_id: priorRelease.profile_id,
  status: priorRelease.status,
};
priorRelease.entry_digest = createHash("sha256").update(JSON.stringify(
  Object.fromEntries(Object.entries(entryValue).sort(([left], [right]) => left.localeCompare(right))),
)).digest("hex");
baseline.releases = { [priorVersion]: priorRelease, ...baseline.releases };
assert.throws(
  () => assertDistributionProfileHistory({
    ...commonHistoryOptions,
    baselineContent: `${JSON.stringify(baseline)}\n`,
  }),
  (error) => error.code === "profile_history_continuity_break",
);
assert.throws(
  () => assertDistributionProfileHistory({
    catalogueContent,
    currentDefinition,
    generatedContents,
    readTagFile,
  }),
  (error) => error.code === "profile_history_continuity_break",
);

console.log(`Release version coherence passed (${evidence.entries.length + 1} surfaces at ${evidence.expectedVersion}; ${historyEvidence.supportedVersions.length} profile snapshots)`);
