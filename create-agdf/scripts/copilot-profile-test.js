import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateCopilotPayload } from "../lib/public-plugin/copilot-profile.js";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = dirname(packageRoot);
const generatedRoot = join(packageRoot, "generated", "plugins", "copilot", "agdf");
const definition = JSON.parse(readFileSync(join(repoRoot, "plugin", "meta", "agdf-plugin.definition.json"), "utf8"));
const baseline = JSON.parse(readFileSync(join(repoRoot, "plugin", "meta", "copilot-payload-baseline.json"), "utf8"));
const expectedSkills = definition.skillSet.map(({ slug }) => slug);
const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-copilot-profile-"));
const sha256 = (content) => createHash("sha256").update(content).digest("hex");

function inventory(root) {
  return JSON.parse(readFileSync(join(root, ".agdf-payload-inventory.json"), "utf8"));
}

function writeInventory(root, value) {
  writeFileSync(join(root, ".agdf-payload-inventory.json"), `${JSON.stringify(value, null, 2)}\n`);
}

function validate(root, options = {}) {
  return validateCopilotPayload({
    profileRoot: root,
    repoRoot,
    expectedVersion: definition.version,
    expectedSkills,
    baseline,
    ...options,
  });
}

function fixture(name, action) {
  const root = join(fixtureRoot, name);
  cpSync(generatedRoot, root, { recursive: true });
  action(root);
}

try {
  const first = validate(generatedRoot);
  const second = validate(generatedRoot);
  assert.equal(second.inventoryDigest, first.inventoryDigest, "unchanged Copilot payload inventory must be deterministic");

  fixture("unmapped", (root) => {
    writeFileSync(join(root, "unexpected.txt"), "not inventoried\n");
    assert.throws(() => validate(root), /AGDF_COPILOT_PAYLOAD_UNMAPPED/);
  });
  fixture("missing", (root) => {
    unlinkSync(join(root, "plugin.json"));
    assert.throws(() => validate(root), /AGDF_COPILOT_PAYLOAD_MISSING/);
  });
  fixture("digest", (root) => {
    writeFileSync(join(root, "plugin.json"), "{}\n");
    assert.throws(() => validate(root), /AGDF_COPILOT_PAYLOAD_DIGEST_MISMATCH/);
  });
  fixture("stale-source", (root) => {
    const value = inventory(root);
    const entry = value.entries.find((candidate) => candidate.source);
    entry.source_digest = "0".repeat(64);
    writeInventory(root, value);
    assert.throws(() => validate(root), /AGDF_COPILOT_PAYLOAD_STALE_SOURCE/);
  });
  fixture("duplicate", (root) => {
    const value = inventory(root);
    value.entries.push({ ...value.entries[0] });
    writeInventory(root, value);
    assert.throws(() => validate(root), /AGDF_COPILOT_PAYLOAD_DUPLICATE_DESTINATION/);
  });
  fixture("excluded", (root) => {
    const path = join(root, ".codex-plugin", "plugin.json");
    mkdirSync(dirname(path), { recursive: true });
    const content = Buffer.from("{}\n");
    writeFileSync(path, content);
    const value = inventory(root);
    value.entries.push({
      destination: ".codex-plugin/plugin.json",
      component: "forbidden-test-fixture",
      owner: "test",
      rule: "forbidden",
      requirement: "negative-fixture",
      digest: sha256(content),
      bytes: content.byteLength,
    });
    value.stats.files += 1;
    value.stats.bytes += content.byteLength;
    writeInventory(root, value);
    assert.throws(() => validate(root, { baseline: { ...baseline, max_files: baseline.max_files + 1 } }), /AGDF_COPILOT_PAYLOAD_EXCLUDED_SURFACE/);
  });
  assert.throws(
    () => validate(generatedRoot, { baseline: { max_files: first.stats.files, max_bytes: first.stats.bytes - 1 } }),
    /AGDF_COPILOT_PAYLOAD_GROWTH/,
  );
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log("Copilot profile tests passed (inventory, drift, exclusions and growth fail closed)");
