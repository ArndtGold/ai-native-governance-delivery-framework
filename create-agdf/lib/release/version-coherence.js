import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

function jsonVersion(relativePath, select = (value) => value.version) {
  return {
    relativePath,
    read: (repoRoot) => select(JSON.parse(readFileSync(join(repoRoot, relativePath), "utf8"))),
  };
}

function textVersion(relativePath, pattern) {
  return {
    relativePath,
    read: (repoRoot) => readFileSync(join(repoRoot, relativePath), "utf8").match(pattern)?.[1],
  };
}

const VERSION_SURFACES = [
  jsonVersion("plugin/.codex-plugin/plugin.json"),
  jsonVersion("plugin/.claude-plugin/plugin.json"),
  jsonVersion("create-agdf/package.json"),
  jsonVersion("agdf/package.json"),
  jsonVersion("agdf/package.json", (value) => value.dependencies?.["create-agdf"]),
  jsonVersion("pages/package.json"),
  jsonVersion("pages/package-lock.json"),
  jsonVersion("pages/package-lock.json", (value) => value.packages?.[""]?.version),
  textVersion("pages/src/data/site.ts", /version:\s*"([^"]+)"/),
  jsonVersion("plugin/submission/openai/capability-matrix.json", (value) => value.releaseVersion),
  jsonVersion("plugin/submission/openai/reviewer-cases.json", (value) => value.releaseVersion),
  textVersion("plugin/submission/openai/release-notes.md", /^# AGDF (\S+) —/m),
  textVersion("plugin/submission/openai/availability.md", /^- release: `([^`]+)`$/m),
  jsonVersion("create-agdf/generated/plugins/agdf/meta/agdf-plugin.definition.json"),
  jsonVersion("create-agdf/generated/plugins/agdf/.codex-plugin/plugin.json"),
  jsonVersion("create-agdf/generated/plugins/agdf/.claude-plugin/plugin.json"),
  jsonVersion("create-agdf/generated/plugins/agdf/runtime/runtime-manifest.json"),
  jsonVersion("create-agdf/generated/plugins/agdf/runtime/create-agdf/package.json"),
  jsonVersion("create-agdf/generated/submissions/openai/agdf/meta/agdf-plugin.definition.json"),
  jsonVersion("create-agdf/generated/submissions/openai/agdf/.codex-plugin/plugin.json"),
  jsonVersion("create-agdf/generated/submissions/openai/agdf/submission/openai/capability-matrix.json", (value) => value.releaseVersion),
  jsonVersion("create-agdf/generated/submissions/openai/agdf/submission/openai/reviewer-cases.json", (value) => value.releaseVersion),
  jsonVersion("create-agdf/generated/submissions/openai/agdf/submission/openai/listing.json", (value) => value.releaseVersion),
  jsonVersion("create-agdf/generated/submissions/openai/agdf/submission/openai/inventory.json", (value) => value.releaseVersion),
  jsonVersion("create-agdf/generated/submissions/openai/agdf/submission/openai/readiness.json", (value) => value.releaseVersion),
  textVersion("create-agdf/generated/submissions/openai/agdf/submission/openai/release-notes.md", /^# AGDF (\S+) —/m),
  textVersion("create-agdf/generated/submissions/openai/agdf/submission/openai/availability.md", /^- release: `([^`]+)`$/m),
  textVersion("create-agdf/generated/submissions/openai/agdf/submission/openai/readiness.md", /^- release: `([^`]+)`$/m),
];

export function collectReleaseVersionEvidence({ repoRoot }) {
  repoRoot = resolve(repoRoot);
  const definitionPath = join(repoRoot, "plugin", "meta", "agdf-plugin.definition.json");
  const expectedVersion = JSON.parse(readFileSync(definitionPath, "utf8")).version;
  const entries = VERSION_SURFACES.map(({ relativePath, read }) => {
    const absolutePath = join(repoRoot, relativePath);
    if (!existsSync(absolutePath)) return { relativePath, actualVersion: undefined };
    return { relativePath, actualVersion: read(repoRoot) };
  });
  return { expectedVersion, entries };
}

export function releaseVersionMismatches({ expectedVersion, entries }) {
  return entries.filter(({ actualVersion }) => actualVersion !== expectedVersion);
}

export function assertReleaseVersionCoherence({ repoRoot, evidence } = {}) {
  evidence ??= collectReleaseVersionEvidence({ repoRoot });
  const mismatches = releaseVersionMismatches(evidence);
  if (mismatches.length === 0) return evidence;

  const generated = mismatches.some(({ relativePath }) => relativePath.startsWith("create-agdf/generated/"));
  const code = generated ? "AGDF_GENERATED_VERSION_STALE" : "AGDF_RELEASE_VERSION_SKEW";
  const details = mismatches
    .map(({ relativePath, actualVersion }) => `- ${relativePath}: ${actualVersion ?? "missing version"}`)
    .join("\n");
  const error = new Error(`${code}: expected ${evidence.expectedVersion} on every release surface\n${details}\nRun npm --prefix create-agdf run release:prepare.`);
  error.code = code;
  error.mismatches = mismatches;
  throw error;
}
