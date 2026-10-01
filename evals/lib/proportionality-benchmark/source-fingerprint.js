import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { stable } from "./contracts.js";
import { getProfileDefinition } from "./profiles.js";

export const BEHAVIOR_SOURCES = Object.freeze([
  "plugins/agdf/meta/agdf-agent-router.md",
  "plugins/agdf/meta/contracts/modes.md",
  "plugins/agdf/meta/contracts/gate-transition.md",
  "plugins/agdf/meta/contracts/interaction.md",
  "plugins/agdf/skills/gate-check/SKILL.md",
]);
export const IMPLEMENTATION_SOURCES = Object.freeze([
  "packages/cli/lib/live-agent/read-only-structured.js",
  "evals/lib/proportionality-benchmark/blind-prompt.js",
  "evals/lib/proportionality-benchmark/contracts.js",
  "evals/lib/proportionality-benchmark/corpus-loader.js",
  "evals/lib/proportionality-benchmark/evaluator.js",
  "evals/lib/proportionality-benchmark/live-recorder.js",
  "evals/lib/proportionality-benchmark/source-fingerprint.js",
]);
export function behaviorSourceText(repoRoot) {
  return BEHAVIOR_SOURCES.map((path) => `--- ${path} ---\n${readFileSync(join(repoRoot, path), "utf8")}`).join("\n\n");
}
export function sourceFingerprint(repoRoot, testCase, fixture, adapterVersion) {
  const hash = createHash("sha256");
  const selectedProfile = testCase.profile_id ? getProfileDefinition(testCase.profile_id) : null;
  const profile = selectedProfile?.fingerprint_profile_metadata ? selectedProfile : null;
  hash.update(JSON.stringify(stable(profile ? { testCase, fixture, adapterVersion, profile } : { testCase, fixture, adapterVersion })));
  const sources = profile ? [...BEHAVIOR_SOURCES, ...IMPLEMENTATION_SOURCES, "evals/lib/proportionality-benchmark/profiles.js"] : [...BEHAVIOR_SOURCES, ...IMPLEMENTATION_SOURCES];
  for (const path of sources) hash.update(path).update(readFileSync(join(repoRoot, path)));
  return hash.digest("hex");
}
