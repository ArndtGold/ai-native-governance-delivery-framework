import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertReleaseVersionCoherence, collectReleaseVersionEvidence } from "../lib/release/version-coherence.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "..");
const evidence = collectReleaseVersionEvidence({ repoRoot });

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
console.log(`Release version coherence passed (${evidence.entries.length + 1} surfaces at ${evidence.expectedVersion})`);
