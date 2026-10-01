import assert from "node:assert/strict";
import { RELEASE_PACKAGES, classifyRegistryResult, releaseRegistryDecision } from "../../../scripts/release/registry-state.js";

const version = "9.9.9";
const result = (name, status, stdout = "", stderr = "") =>
  classifyRegistryResult(name, version, { status, stdout, stderr });
const absent = RELEASE_PACKAGES.map((name) => result(name, 1, "", "npm error code E404"));
assert.equal(releaseRegistryDecision(absent).safe_to_start, true);
const partial = [result(RELEASE_PACKAGES[0], 0, `"${version}"`), ...absent.slice(1)];
assert.deepEqual(partial.map(({ state }) => state), ["published", "absent", "absent"]);
assert.equal(releaseRegistryDecision(partial).outcome, "partial_or_unknown");
assert.equal(releaseRegistryDecision(partial).safe_to_start, false);
assert.equal(releaseRegistryDecision(RELEASE_PACKAGES.map((name) => result(name, 0, `"${version}"`))).complete, true);
assert.equal(result(RELEASE_PACKAGES[0], 1, "", "ETIMEDOUT").state, "unknown");
assert.equal(result(RELEASE_PACKAGES[0], 0, '"9.9.8"').state, "unknown");
console.log("Release registry state classification passed.");
