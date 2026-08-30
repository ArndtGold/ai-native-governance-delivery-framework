import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

export const COPILOT_PROFILE_ID = "copilot-runtime-plugin";
export const COPILOT_INVENTORY_FILE = ".agdf-payload-inventory.json";

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function filesUnder(root) {
  const files = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stats = statSync(path);
      if (stats.isDirectory()) visit(path);
      else if (stats.isFile()) files.push(path);
    }
  }
  visit(root);
  return files;
}

export function payloadInventoryDigest(inventory) {
  return sha256(`${JSON.stringify(inventory, null, 2)}\n`);
}

export function buildCopilotPayloadInventory({ profileRoot, mappings, version, baseline }) {
  const files = filesUnder(profileRoot)
    .map((path) => ({ path, relativePath: relative(profileRoot, path).replaceAll("\\", "/") }))
    .filter(({ relativePath }) => relativePath !== COPILOT_INVENTORY_FILE);
  const byDestination = new Map(mappings.map((entry) => [entry.destination, entry]));
  const unmapped = files.filter(({ relativePath }) => !byDestination.has(relativePath));
  if (unmapped.length) throw new Error(`AGDF_COPILOT_PAYLOAD_UNMAPPED: ${unmapped.map(({ relativePath }) => relativePath).join(", ")}`);
  const missing = mappings.filter(({ destination }) => !files.some(({ relativePath }) => relativePath === destination));
  if (missing.length) throw new Error(`AGDF_COPILOT_PAYLOAD_MISSING: ${missing.map(({ destination }) => destination).join(", ")}`);
  if (new Set(mappings.map(({ destination }) => destination)).size !== mappings.length) {
    throw new Error("AGDF_COPILOT_PAYLOAD_DUPLICATE_DESTINATION");
  }
  const entries = files.map(({ path, relativePath }) => {
    const mapping = byDestination.get(relativePath);
    const content = readFileSync(path);
    return {
      destination: relativePath,
      component: mapping.component,
      owner: mapping.owner,
      rule: mapping.rule,
      requirement: mapping.requirement,
      ...(mapping.source ? { source: mapping.source } : {}),
      ...(mapping.sourceDigest ? { source_digest: mapping.sourceDigest } : {}),
      digest: sha256(content),
      bytes: content.byteLength,
    };
  });
  const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  const inventory = {
    schema_version: 1,
    profile_id: COPILOT_PROFILE_ID,
    version,
    baseline,
    stats: { files: entries.length, bytes: totalBytes },
    entries,
  };
  writeFileSync(join(profileRoot, COPILOT_INVENTORY_FILE), `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
  return inventory;
}

export function validateCopilotPayload({ profileRoot, repoRoot, expectedVersion, expectedSkills, baseline }) {
  const inventoryPath = join(profileRoot, COPILOT_INVENTORY_FILE);
  if (!existsSync(inventoryPath)) throw new Error("AGDF_COPILOT_PAYLOAD_INVENTORY_MISSING");
  let inventory;
  try { inventory = JSON.parse(readFileSync(inventoryPath, "utf8")); } catch {
    throw new Error("AGDF_COPILOT_PAYLOAD_INVENTORY_INVALID");
  }
  if (inventory.schema_version !== 1 || inventory.profile_id !== COPILOT_PROFILE_ID || inventory.version !== expectedVersion) {
    throw new Error("AGDF_COPILOT_PAYLOAD_INVENTORY_INVALID");
  }
  const actualFiles = filesUnder(profileRoot)
    .map((path) => relative(profileRoot, path).replaceAll("\\", "/"))
    .filter((path) => path !== COPILOT_INVENTORY_FILE);
  const entries = Array.isArray(inventory.entries) ? inventory.entries : [];
  if (new Set(entries.map(({ destination }) => destination)).size !== entries.length) {
    throw new Error("AGDF_COPILOT_PAYLOAD_DUPLICATE_DESTINATION");
  }
  const mapped = new Set(entries.map(({ destination }) => destination));
  const unmapped = actualFiles.filter((path) => !mapped.has(path));
  if (unmapped.length) throw new Error(`AGDF_COPILOT_PAYLOAD_UNMAPPED: ${unmapped.join(", ")}`);
  const missing = entries.filter(({ destination }) => !actualFiles.includes(destination));
  if (missing.length) throw new Error(`AGDF_COPILOT_PAYLOAD_MISSING: ${missing.map(({ destination }) => destination).join(", ")}`);
  for (const entry of entries) {
    const content = readFileSync(join(profileRoot, entry.destination));
    if (sha256(content) !== entry.digest || content.byteLength !== entry.bytes) {
      throw new Error(`AGDF_COPILOT_PAYLOAD_DIGEST_MISMATCH: ${entry.destination}`);
    }
    if (repoRoot && entry.source) {
      const source = readFileSync(join(repoRoot, entry.source));
      if (sha256(source) !== entry.source_digest) {
        throw new Error(`AGDF_COPILOT_PAYLOAD_STALE_SOURCE: ${entry.destination}`);
      }
    }
  }
  const excluded = actualFiles.filter((path) => path === "skills" || path.startsWith("skills/")
    || path.startsWith(".codex-plugin/") || path.startsWith(".claude-plugin/")
    || path === "hooks/hooks.json" || path === "hooks/session-start.sh"
    || path.startsWith("submission/"));
  if (excluded.length) throw new Error(`AGDF_COPILOT_PAYLOAD_EXCLUDED_SURFACE: ${excluded.join(", ")}`);
  const skillFiles = actualFiles.filter((path) => /^copilot-skills\/agdf-[^/]+\/SKILL\.md$/.test(path));
  const expectedSkillFiles = expectedSkills.map((slug) => `copilot-skills/agdf-${slug}/SKILL.md`).sort();
  if (JSON.stringify(skillFiles.sort()) !== JSON.stringify(expectedSkillFiles)) {
    throw new Error("AGDF_COPILOT_PAYLOAD_SKILL_SET_MISMATCH");
  }
  const stats = {
    files: entries.length,
    bytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
  };
  if (stats.files > baseline.max_files || stats.bytes > baseline.max_bytes) {
    throw new Error(`AGDF_COPILOT_PAYLOAD_GROWTH: observed ${stats.files} files/${stats.bytes} bytes; baseline ${baseline.max_files}/${baseline.max_bytes}`);
  }
  if (inventory.stats?.files !== stats.files || inventory.stats?.bytes !== stats.bytes
      || inventory.baseline?.max_files !== baseline.max_files || inventory.baseline?.max_bytes !== baseline.max_bytes) {
    throw new Error("AGDF_COPILOT_PAYLOAD_BASELINE_MISMATCH");
  }
  return { inventory, inventoryDigest: payloadInventoryDigest(inventory), stats };
}
