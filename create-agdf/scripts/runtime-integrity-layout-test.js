import assert from "node:assert/strict";
import { copyFileSync, cpSync, mkdirSync, mkdtempSync, rmSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const sourcePluginRoot = join(repoRoot, "plugin");
const generatedPluginRoot = join(repoRoot, "create-agdf", "generated", "plugins", "agdf");
const sourceIntegrityScript = join(sourcePluginRoot, "scripts", "check-runtime-integrity.mjs");
const sourceAgentSkillsScript = join(sourcePluginRoot, "scripts", "agent-skills-conformance.mjs");
const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-runtime-integrity-layout-"));
const installedPluginRoot = join(fixtureRoot, "installed-agdf");

function stageInstalledPlugin() {
  rmSync(installedPluginRoot, { recursive: true, force: true });
  cpSync(generatedPluginRoot, installedPluginRoot, { recursive: true });
}

function runIntegrity(script, root) {
  const env = { ...process.env };
  if (root === undefined) delete env.AGDF_RUNTIME_INTEGRITY_ROOT;
  else env.AGDF_RUNTIME_INTEGRITY_ROOT = root;
  return spawnSync(process.execPath, [script], { encoding: "utf8", env });
}

function combinedOutput(result) {
  return `${result.stdout}\n${result.stderr}`;
}

try {
  stageInstalledPlugin();
  const installedDefault = runIntegrity(join(installedPluginRoot, "scripts", "check-runtime-integrity.mjs"));
  assert.equal(installedDefault.status, 0, combinedOutput(installedDefault));
  assert.match(installedDefault.stdout, /mode=installed/);

  const installedOverride = runIntegrity(
    join(installedPluginRoot, "scripts", "check-runtime-integrity.mjs"),
    installedPluginRoot,
  );
  assert.equal(installedOverride.status, 0, combinedOutput(installedOverride));
  assert.match(installedOverride.stdout, /mode=installed/);

  const sourceOverride = runIntegrity(sourceIntegrityScript, repoRoot);
  assert.equal(sourceOverride.status, 0, combinedOutput(sourceOverride));
  assert.match(sourceOverride.stdout, /mode=source/);

  unlinkSync(join(installedPluginRoot, "meta", "contracts", "interaction.md"));
  const missingContract = runIntegrity(join(installedPluginRoot, "scripts", "check-runtime-integrity.mjs"));
  assert.notEqual(missingContract.status, 0, "installed mode must reject a missing contract module");
  assert.match(combinedOutput(missingContract), /runtime contract module interaction\.md missing/);

  const partialRoot = join(fixtureRoot, "partial-agdf");
  mkdirSync(join(partialRoot, "scripts"), { recursive: true });
  const partialScript = join(partialRoot, "scripts", "check-runtime-integrity.mjs");
  copyFileSync(sourceIntegrityScript, partialScript);
  copyFileSync(sourceAgentSkillsScript, join(partialRoot, "scripts", "agent-skills-conformance.mjs"));
  const partial = runIntegrity(partialScript);
  assert.notEqual(partial.status, 0, "partial installed layout must fail closed");
  assert.match(combinedOutput(partial), /AGDF_RUNTIME_INTEGRITY_LAYOUT_INVALID/);
  assert.doesNotMatch(combinedOutput(partial), /ENOENT|scandir/);

  console.log("Runtime integrity layout tests passed");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
