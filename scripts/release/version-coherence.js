import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

function valueAtPath(value, path) {
  return path.reduce((current, key) => current?.[key], value);
}

function setValueAtPath(value, path, nextVersion) {
  let current = value;
  for (const key of path.slice(0, -1)) {
    if (!current?.[key] || typeof current[key] !== "object" || Array.isArray(current[key])) {
      throw new Error(`missing JSON version path ${path.join(".")}`);
    }
    current = current[key];
  }
  const key = path.at(-1);
  if (typeof current?.[key] !== "string") {
    throw new Error(`missing JSON version path ${path.join(".")}`);
  }
  current[key] = nextVersion;
}

function jsonVersion(relativePath, path = ["version"], options = {}) {
  return Object.freeze({
    relativePath,
    writable: options.writable ?? false,
    evidence: options.evidence ?? true,
    readContent(content) {
      return valueAtPath(JSON.parse(content), path);
    },
    updateContent(content, nextVersion) {
      const value = JSON.parse(content);
      setValueAtPath(value, path, nextVersion);
      return `${JSON.stringify(value, null, 2)}\n`;
    },
  });
}

function textVersion(relativePath, pattern, replacement, options = {}) {
  return Object.freeze({
    relativePath,
    writable: options.writable ?? false,
    evidence: options.evidence ?? true,
    readContent(content) {
      return content.match(pattern)?.[1];
    },
    updateContent(content, nextVersion) {
      const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
      const matches = [...content.matchAll(new RegExp(pattern.source, flags))];
      if (matches.length !== 1) {
        throw new Error(`expected exactly one version field in ${relativePath}; found ${matches.length}`);
      }
      return content.replace(pattern, replacement(nextVersion));
    },
  });
}

const writable = Object.freeze({ writable: true });
const authority = Object.freeze({ writable: true, evidence: false });

export const RELEASE_VERSION_SURFACES = Object.freeze([
  jsonVersion("plugins/agdf/meta/agdf-plugin.definition.json", ["version"], authority),
  jsonVersion("plugins/agdf/plugin.json", ["version"], writable),
  jsonVersion("plugins/agdf/.codex-plugin/plugin.json", ["version"], writable),
  jsonVersion("plugins/agdf/.claude-plugin/plugin.json", ["version"], writable),
  jsonVersion("packages/core/package.json", ["version"], writable),
  jsonVersion("package-lock.json", ["packages", "packages/core", "version"], writable),
  jsonVersion("package-lock.json", ["packages", "packages/cli", "version"], writable),
  jsonVersion("packages/cli/package.json", ["version"], writable),
  jsonVersion("plugins/agdf/meta/agdf-mcp-capability.json", ["release_version"], writable),
  jsonVersion("packages/mcp-server/package.json", ["version"], writable),
  jsonVersion("packages/mcp-server/package.json", ["dependencies", "create-agdf"], writable),
  jsonVersion("packages/mcp-server/package-lock.json", ["version"], writable),
  jsonVersion("packages/mcp-server/package-lock.json", ["packages", "", "version"], writable),
  jsonVersion("packages/mcp-server/package-lock.json", ["packages", "", "dependencies", "create-agdf"], writable),
  jsonVersion("packages/mcp-server/package-lock.json", ["packages", "node_modules/create-agdf", "version"], writable),
  jsonVersion("packages/cli/distribution/agdf/package.json", ["version"], writable),
  jsonVersion("packages/cli/distribution/agdf/package.json", ["dependencies", "create-agdf"], writable),
  jsonVersion("packages/cli/distribution/agdf/package-lock.json", ["version"], writable),
  jsonVersion("packages/cli/distribution/agdf/package-lock.json", ["packages", "", "version"], writable),
  jsonVersion("packages/cli/distribution/agdf/package-lock.json", ["packages", "", "dependencies", "create-agdf"], writable),
  jsonVersion("packages/cli/distribution/agdf/package-lock.json", ["packages", "node_modules/create-agdf", "version"], writable),
  jsonVersion("pages/package.json", ["version"], writable),
  jsonVersion("pages/package-lock.json", ["version"], writable),
  jsonVersion("pages/package-lock.json", ["packages", "", "version"], writable),
  textVersion("pages/src/data/site.ts", /version:\s*"([^"]+)"/, (version) => `version: "${version}"`, writable),
  jsonVersion("plugins/agdf/submission/openai/capability-matrix.json", ["releaseVersion"], writable),
  jsonVersion("plugins/agdf/submission/openai/reviewer-cases.json", ["releaseVersion"], writable),
  textVersion("plugins/agdf/submission/openai/release-notes.md", /^# AGDF (\S+) —/m, (version) => `# AGDF ${version} —`, writable),
  textVersion("plugins/agdf/submission/openai/availability.md", /^- release: `([^`]+)`$/m, (version) => `- release: \`${version}\``, writable),
  jsonVersion("packages/cli/generated/plugins/agdf/meta/agdf-plugin.definition.json"),
  jsonVersion("packages/cli/generated/plugins/agdf/plugin.json"),
  jsonVersion("packages/cli/generated/plugins/agdf/.codex-plugin/plugin.json"),
  jsonVersion("packages/cli/generated/plugins/agdf/.claude-plugin/plugin.json"),
  jsonVersion("packages/cli/generated/plugins/agdf/runtime/runtime-manifest.json"),
  jsonVersion("packages/cli/generated/plugins/agdf/runtime/create-agdf/package.json"),
  jsonVersion("packages/cli/generated/plugins/copilot/agdf/meta/agdf-plugin.definition.json"),
  jsonVersion("packages/cli/generated/plugins/copilot/agdf/plugin.json"),
  jsonVersion("packages/cli/generated/plugins/copilot/agdf/runtime/runtime-manifest.json"),
  jsonVersion("packages/cli/generated/plugins/copilot/agdf/runtime/create-agdf/package.json"),
  jsonVersion("packages/cli/generated/submissions/openai/agdf/meta/agdf-plugin.definition.json"),
  jsonVersion("packages/cli/generated/submissions/openai/agdf/plugin.json"),
  jsonVersion("packages/cli/generated/submissions/openai/agdf/.codex-plugin/plugin.json"),
  jsonVersion("packages/cli/generated/submissions/openai/agdf/submission/openai/capability-matrix.json", ["releaseVersion"]),
  jsonVersion("packages/cli/generated/submissions/openai/agdf/submission/openai/reviewer-cases.json", ["releaseVersion"]),
  jsonVersion("packages/cli/generated/submissions/openai/agdf/submission/openai/listing.json", ["releaseVersion"]),
  jsonVersion("packages/cli/generated/submissions/openai/agdf/submission/openai/inventory.json", ["releaseVersion"]),
  jsonVersion("packages/cli/generated/submissions/openai/agdf/submission/openai/readiness.json", ["releaseVersion"]),
  textVersion("packages/cli/generated/submissions/openai/agdf/submission/openai/release-notes.md", /^# AGDF (\S+) —/m, () => ""),
  textVersion("packages/cli/generated/submissions/openai/agdf/submission/openai/availability.md", /^- release: `([^`]+)`$/m, () => ""),
  textVersion("packages/cli/generated/submissions/openai/agdf/submission/openai/readiness.md", /^- release: `([^`]+)`$/m, () => ""),
]);

export const WRITABLE_RELEASE_VERSION_SURFACES = Object.freeze(
  RELEASE_VERSION_SURFACES.filter((surface) => surface.writable),
);

export function collectReleaseVersionEvidence({ repoRoot }) {
  repoRoot = resolve(repoRoot);
  const authoritySurface = RELEASE_VERSION_SURFACES[0];
  const definitionPath = join(repoRoot, authoritySurface.relativePath);
  const expectedVersion = authoritySurface.readContent(readFileSync(definitionPath, "utf8"));
  const entries = RELEASE_VERSION_SURFACES
    .filter((surface) => surface.evidence)
    .map((surface) => {
      const absolutePath = join(repoRoot, surface.relativePath);
      if (!existsSync(absolutePath)) return { relativePath: surface.relativePath, actualVersion: undefined };
      return {
        relativePath: surface.relativePath,
        actualVersion: surface.readContent(readFileSync(absolutePath, "utf8")),
      };
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

  const generated = mismatches.some(({ relativePath }) => relativePath.startsWith("packages/cli/generated/"));
  const code = generated ? "AGDF_GENERATED_VERSION_STALE" : "AGDF_RELEASE_VERSION_SKEW";
  const details = mismatches
    .map(({ relativePath, actualVersion }) => `- ${relativePath}: ${actualVersion ?? "missing version"}`)
    .join("\n");
  const error = new Error(`${code}: expected ${evidence.expectedVersion} on every release surface\n${details}\nRun npm --prefix packages/cli run release:prepare.`);
  error.code = code;
  error.mismatches = mismatches;
  throw error;
}
