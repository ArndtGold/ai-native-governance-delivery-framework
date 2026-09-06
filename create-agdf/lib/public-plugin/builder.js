import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { renameSyncWithRetry } from "../fs-swap.js";
import { assertPublicPluginContract, loadJson } from "./contract.js";
import { renderCodexPluginManifest } from "./manifest.js";
import { createReadinessReport, renderReadinessReport } from "./report.js";
import { inventory, validateCandidate } from "./validator.js";

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function buildPublicPluginCandidate({ repoRoot, outputRoot }) {
  repoRoot = resolve(repoRoot);
  outputRoot = resolve(outputRoot);
  const expectedParent = resolve(repoRoot, "create-agdf", "generated", "submissions", "openai");
  if (dirname(outputRoot) !== expectedParent) throw new Error(`Public candidate output must be a direct child of ${expectedParent}`);
  mkdirSync(expectedParent, { recursive: true });
  const temporaryRoot = mkdtempSync(join(expectedParent, ".agdf-build-"));
  try {
    const pluginRoot = join(repoRoot, "plugin");
    const definition = loadJson(join(pluginRoot, "meta", "agdf-plugin.definition.json"));
    const capabilityMatrix = loadJson(join(pluginRoot, "submission", "openai", "capability-matrix.json"));
    const reviewerCases = loadJson(join(pluginRoot, "submission", "openai", "reviewer-cases.json"));
    const releaseNotes = readFileSync(join(pluginRoot, "submission", "openai", "release-notes.md"), "utf8");
    assertPublicPluginContract({ definition, capabilityMatrix, reviewerCases, releaseNotes });

    write(join(temporaryRoot, ".codex-plugin", "plugin.json"), renderCodexPluginManifest(definition, { publicCandidate: true }));
    for (const directory of ["skills", "meta", "assets"]) cpSync(join(pluginRoot, directory), join(temporaryRoot, directory), { recursive: true });
    rmSync(join(temporaryRoot, "meta", "agdf-mcp-capability.json"), { force: true });
    cpSync(join(pluginRoot, "submission", "openai"), join(temporaryRoot, "submission", "openai"), { recursive: true });
    const listing = {
      schemaVersion: 1,
      releaseVersion: definition.version,
      submissionType: definition.publicDistribution.submissionType,
      identity: {
        technicalId: definition.publicDistribution.technicalId,
        publicDisplayName: definition.publicDistribution.publicDisplayName,
        fullDisplayName: definition.publicDistribution.fullDisplayName,
      },
      interface: {
        shortDescription: definition.publicDistribution.shortDescription,
        longDescription: definition.longDescription,
        developerName: definition.publicDistribution.developerName,
        category: definition.publicDistribution.category,
        defaultPrompt: definition.publicDistribution.defaultPrompt,
      },
      publisher: definition.publicDistribution.publisher,
      urls: definition.publicDistribution.urls,
      availability: definition.publicDistribution.availability,
    };
    write(join(temporaryRoot, "submission", "openai", "listing.json"), json(listing));
    validateCandidate(temporaryRoot);
    const entries = inventory(temporaryRoot, { exclude: ["submission/openai/inventory.json", "submission/openai/readiness.json"] });
    const digest = createHash("sha256").update(json(entries)).digest("hex");
    write(join(temporaryRoot, "submission", "openai", "inventory.json"), json({ schemaVersion: 1, releaseVersion: definition.version, digest, files: entries }));
    const report = createReadinessReport({ definition, fileCount: entries.length, inventoryDigest: digest });
    write(join(temporaryRoot, "submission", "openai", "readiness.json"), json(report));
    write(join(temporaryRoot, "submission", "openai", "readiness.md"), renderReadinessReport(report));
    validateCandidate(temporaryRoot);

    const backupRoot = `${outputRoot}.previous`;
    if (existsSync(backupRoot)) throw new Error(`Refusing candidate swap while recovery backup exists: ${backupRoot}`);
    const hadPrevious = existsSync(outputRoot);
    if (hadPrevious) renameSyncWithRetry(outputRoot, backupRoot);
    try {
      renameSyncWithRetry(temporaryRoot, outputRoot);
    } catch (error) {
      if (hadPrevious && existsSync(backupRoot) && !existsSync(outputRoot)) renameSyncWithRetry(backupRoot, outputRoot);
      throw error;
    }
    if (hadPrevious) rmSync(backupRoot, { recursive: true, force: true });
    return { outputRoot, digest, fileCount: entries.length, report };
  } catch (error) {
    rmSync(temporaryRoot, { recursive: true, force: true });
    throw error;
  }
}
