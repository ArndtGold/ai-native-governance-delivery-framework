import assert from "node:assert/strict";
import { cpSync, mkdtempSync, rmSync, symlinkSync, unlinkSync, writeFileSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-runtime-integrity-"));
const integrityScript = join(fixtureRoot, "plugin", "scripts", "check-runtime-integrity.mjs");
const templatePath = join(fixtureRoot, "plugin", "control", "templates", "artefacts", "VERIFIED_CHANGE.md");
const pluginDefinitionPath = join(fixtureRoot, "plugin", "meta", "agdf-plugin.definition.json");
const runtimeContractPath = join(fixtureRoot, "plugin", "meta", "agdf-runtime-contract.md");
const gateCheckPath = join(fixtureRoot, "plugin", "skills", "gate-check", "SKILL.md");

function makeFixture() {
  cpSync(join(repoRoot, "plugin"), join(fixtureRoot, "plugin"), { recursive: true });
  for (const entry of [".claude-plugin", "agdf", "create-agdf", "pages", ".agdf", "LICENSE"]) {
    symlinkSync(join(repoRoot, entry), join(fixtureRoot, entry));
  }
}

function resetPluginFixture() {
  rmSync(join(fixtureRoot, "plugin"), { recursive: true, force: true });
  cpSync(join(repoRoot, "plugin"), join(fixtureRoot, "plugin"), { recursive: true });
}

function expectIntegrityFailure(expected) {
  const result = spawnSync(process.execPath, [integrityScript], {
    encoding: "utf8",
    env: { ...process.env, AGDF_RUNTIME_INTEGRITY_ROOT: fixtureRoot },
  });
  assert.notEqual(result.status, 0, "runtime integrity must reject a broken Verified Change surface");
  assert.match(`${result.stdout}\n${result.stderr}`, expected);
}

try {
  makeFixture();
  unlinkSync(templatePath);
  expectIntegrityFailure(/plugin\/control\/templates\/artefacts\/VERIFIED_CHANGE\.md missing/);

  resetPluginFixture();
  const template = readFileSync(templatePath, "utf8").replace("canonical_owner", "canonical_owner_removed");
  writeFileSync(templatePath, template, "utf8");
  expectIntegrityFailure(/VERIFIED_CHANGE\.md missing control field: canonical_owner/);

  resetPluginFixture();
  writeFileSync(
    pluginDefinitionPath,
    readFileSync(pluginDefinitionPath, "utf8").replace('"question": "allow"', '"question": "deny"'),
    "utf8",
  );
  expectIntegrityFailure(/OpenCode permissions must allow the native question tool/);

  resetPluginFixture();
  writeFileSync(
    runtimeContractPath,
    readFileSync(runtimeContractPath, "utf8").replace("## Native Interaction Contract", "## Removed Native Interaction Contract"),
    "utf8",
  );
  expectIntegrityFailure(/runtime contract Native Interaction Contract missing: ## Native Interaction Contract/);

  resetPluginFixture();
  writeFileSync(
    gateCheckPath,
    readFileSync(gateCheckPath, "utf8").replace("## Native Interaction Path", "## Removed Native Interaction Path"),
    "utf8",
  );
  expectIntegrityFailure(/gate-check native interaction guidance missing: ## Native Interaction Path/);

  console.log("Runtime integrity negative tests passed");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
