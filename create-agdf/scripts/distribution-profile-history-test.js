import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canonicalDistributionProfileDigest,
  classifyHistoricalDistributionProfile,
  validateDistributionProfileHistory,
} from "../lib/runtime/distribution-profile-history.js";
import { SUPPORTED_PROFILE_RELEASES } from "../lib/release/profile-history.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "..");
const catalogue = JSON.parse(readFileSync(join(repoRoot, "plugin", "meta", "distribution-profile-history.json"), "utf8"));
const currentDefinition = JSON.parse(readFileSync(join(repoRoot, "plugin", "meta", "agdf-plugin.definition.json"), "utf8"));
const versions = Object.keys(catalogue.releases);
const unsupportedFutureVersion = `${Number(currentDefinition.version.split(".")[0]) + 1}.0.0`;

assert.deepEqual(validateDistributionProfileHistory(catalogue), {
  status: "matched",
  reason: "profile_history_valid",
});
for (const version of SUPPORTED_PROFILE_RELEASES) {
  assert.ok(Object.hasOwn(catalogue.releases, version), `missing required historical release ${version}`);
}
assert.ok(Object.hasOwn(catalogue.releases, currentDefinition.version), `missing current release ${currentDefinition.version}`);
assert.equal(Object.hasOwn(catalogue.releases, "0.14.0"), false);
assert.equal(Object.hasOwn(catalogue.releases, unsupportedFutureVersion), false);

for (const version of versions) {
  const release = catalogue.releases[version];
  const contract = catalogue.contracts[release.contract_id];
  assert.equal(canonicalDistributionProfileDigest(contract.distribution_profiles), contract.contract_digest);
  const matched = classifyHistoricalDistributionProfile({
    catalogue,
    version,
    distributionProfiles: structuredClone(contract.distribution_profiles),
  });
  assert.equal(matched.status, "matched");
  assert.equal(matched.release_version, version);
  assert.equal(matched.contract_id, release.contract_id);
  assert.equal(matched.contract_digest, contract.contract_digest);
  assert.equal(matched.entry_digest, release.entry_digest);
}

for (const version of ["0.14.0", "0.13", "^0.13.8", unsupportedFutureVersion]) {
  assert.equal(classifyHistoricalDistributionProfile({
    catalogue,
    version,
    distributionProfiles: catalogue.contracts["four-profile-v1"].distribution_profiles,
  }).reason, "historical_contract_unsupported");
}

for (const mutate of [
  (value) => { value.schema_version = 2; },
  (value) => { value.extra = true; },
  (value) => { value.contracts["four-profile-v1"].extra = true; },
  (value) => { value.contracts["four-profile-v1"].contract_digest = "0".repeat(64); },
  (value) => { value.contracts["duplicate-profile-v1"] = structuredClone(value.contracts["four-profile-v1"]); },
  (value) => {
    value.contracts["unreferenced-profile-v1"] = structuredClone(value.contracts["four-profile-v1"]);
    value.contracts["unreferenced-profile-v1"].distribution_profiles.profiles.extra = {
      runtime: "absent",
      installable: false,
      machineValidation: "unavailable",
    };
    value.contracts["unreferenced-profile-v1"].contract_digest = canonicalDistributionProfileDigest(
      value.contracts["unreferenced-profile-v1"].distribution_profiles,
    );
    value.contracts = Object.fromEntries(Object.entries(value.contracts).sort(([left], [right]) => left.localeCompare(right)));
  },
  (value) => { value.releases["0.13.8"].status = "retired"; },
  (value) => { value.releases["0.13.8"].contract_id = "missing"; },
  (value) => { value.releases["0.13.8"].entry_digest = "0".repeat(64); },
  (value) => {
    value.releases = Object.fromEntries(Object.entries(value.releases).reverse());
  },
]) {
  const malformed = structuredClone(catalogue);
  mutate(malformed);
  assert.equal(validateDistributionProfileHistory(malformed).reason, "profile_history_invalid");
}

for (const mutate of [
  (value) => { value.schemaVersion = 2; },
  (value) => { delete value.profiles["portable-skills"]; },
  (value) => { value.profiles.extra = {}; },
  (value) => { value.profiles["runtime-plugin"].runtime = "optional"; },
  (value) => { value.extra = true; },
]) {
  const observed = structuredClone(catalogue.contracts["four-profile-v1"].distribution_profiles);
  mutate(observed);
  assert.equal(classifyHistoricalDistributionProfile({
    catalogue,
    version: "0.13.8",
    distributionProfiles: observed,
  }).reason, "historical_contract_invalid");
}
for (const distributionProfiles of [null, [], undefined]) {
  assert.equal(classifyHistoricalDistributionProfile({
    catalogue,
    version: "0.13.8",
    distributionProfiles,
  }).reason, "historical_contract_invalid");
}

console.log(`Distribution profile history passed (${versions.length} exact releases, malformed and closed-policy matrices)`);
