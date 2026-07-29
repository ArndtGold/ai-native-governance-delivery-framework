import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { stable } from "./contracts.js";

export const BEHAVIOR_SOURCES = Object.freeze([
  "plugin/meta/agdf-agent-router.md",
  "plugin/meta/contracts/modes.md",
  "plugin/meta/contracts/gate-transition.md",
  "plugin/meta/contracts/interaction.md",
  "plugin/skills/gate-check/SKILL.md",
]);
export const IMPLEMENTATION_SOURCES = Object.freeze([
  "create-agdf/lib/live-agent/read-only-structured.js",
  "create-agdf/lib/proportionality-benchmark/blind-prompt.js",
  "create-agdf/lib/proportionality-benchmark/contracts.js",
  "create-agdf/lib/proportionality-benchmark/corpus-loader.js",
  "create-agdf/lib/proportionality-benchmark/evaluator.js",
  "create-agdf/lib/proportionality-benchmark/live-recorder.js",
  "create-agdf/lib/proportionality-benchmark/source-fingerprint.js",
]);
export function behaviorSourceText(repoRoot) {
  return BEHAVIOR_SOURCES.map((path) => `--- ${path} ---\n${readFileSync(join(repoRoot, path), "utf8")}`).join("\n\n");
}
export function sourceFingerprint(repoRoot, testCase, fixture, adapterVersion) {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(stable({ testCase, fixture, adapterVersion })));
  for (const path of [...BEHAVIOR_SOURCES, ...IMPLEMENTATION_SOURCES]) hash.update(path).update(readFileSync(join(repoRoot, path)));
  return hash.digest("hex");
}
