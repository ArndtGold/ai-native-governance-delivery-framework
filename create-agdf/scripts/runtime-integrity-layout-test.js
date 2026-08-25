import assert from "node:assert/strict";
import { copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { digestNormalizedPluginSource } from "../lib/runtime/plugin-provenance.js";

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
  const definition = JSON.parse(readFileSync(join(installedPluginRoot, "meta", "agdf-plugin.definition.json"), "utf8"));
  const runtime = JSON.parse(readFileSync(join(installedPluginRoot, "runtime", "runtime-manifest.json"), "utf8"));
  const codex = JSON.parse(readFileSync(join(installedPluginRoot, ".codex-plugin", "plugin.json"), "utf8"));
  writeFileSync(join(installedPluginRoot, ".agdf-installation.json"), `${JSON.stringify({
    schema_version: 1,
    owner: "create-agdf",
    profile_id: "runtime-plugin",
    marketplace_id: "agdf",
    canonical_version: definition.version,
    codex_install_version: codex.version,
    source_digest: digestNormalizedPluginSource(installedPluginRoot, definition.version),
    runtime_digest: runtime.digest,
  }, null, 2)}\n`);
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

  const healthyHook = spawnSync("bash", [join(installedPluginRoot, "hooks", "session-start.sh")], {
    cwd: fixtureRoot,
    encoding: "utf8",
    env: { ...process.env, AGDF_SURFACE: "claude", CLAUDE_PLUGIN_ROOT: installedPluginRoot },
  });
  assert.equal(healthyHook.status, 0, healthyHook.stderr);
  assert.match(healthyHook.stdout, /AGDF runtime: profile=runtime-plugin evidence=loaded_session/);
  assert.match(healthyHook.stdout, /provenance=matched machine_validation=owned_version_matched/);

  const mismatchedHook = spawnSync("bash", [join(installedPluginRoot, "hooks", "session-start.sh")], {
    cwd: fixtureRoot,
    encoding: "utf8",
    env: { ...process.env, AGDF_SURFACE: "claude", CLAUDE_PLUGIN_ROOT: join(fixtureRoot, "wrong-plugin-root") },
  });
  assert.equal(mismatchedHook.status, 0, mismatchedHook.stderr);
  assert.match(mismatchedHook.stdout, /provenance=mismatch machine_validation=version_mismatch/);

  const provenancePath = join(installedPluginRoot, ".agdf-installation.json");
  const validProvenance = readFileSync(provenancePath, "utf8");
  const tamperedProvenance = JSON.parse(validProvenance);
  tamperedProvenance.source_digest = "f".repeat(64);
  writeFileSync(provenancePath, `${JSON.stringify(tamperedProvenance, null, 2)}\n`);
  const tamperedInstalled = runIntegrity(join(installedPluginRoot, "scripts", "check-runtime-integrity.mjs"));
  assert.notEqual(tamperedInstalled.status, 0, "installed mode must reject provenance digest tamper");
  assert.match(combinedOutput(tamperedInstalled), /installation provenance must match/);
  writeFileSync(provenancePath, validProvenance);

  const runtimeEntrypoint = join(installedPluginRoot, "runtime", "agdf-local.js");
  const validRuntimeEntrypoint = readFileSync(runtimeEntrypoint, "utf8");
  writeFileSync(runtimeEntrypoint, "process.stdout.write('{invalid');\n");
  const malformedHook = spawnSync("bash", [join(installedPluginRoot, "hooks", "session-start.sh")], {
    cwd: fixtureRoot,
    encoding: "utf8",
    env: { ...process.env, AGDF_SURFACE: "codex" },
  });
  assert.equal(malformedHook.status, 0, malformedHook.stderr);
  assert.match(malformedHook.stdout, /evidence=unverified machine_validation=unavailable provenance=invalid/);
  writeFileSync(runtimeEntrypoint, validRuntimeEntrypoint);

  const missingRuntimeEntrypoint = `${runtimeEntrypoint}.missing`;
  renameSync(runtimeEntrypoint, missingRuntimeEntrypoint);
  const missingRuntimeHook = spawnSync("bash", [join(installedPluginRoot, "hooks", "session-start.sh")], {
    cwd: fixtureRoot,
    encoding: "utf8",
    env: { ...process.env, AGDF_SURFACE: "codex" },
  });
  assert.equal(missingRuntimeHook.status, 0, missingRuntimeHook.stderr);
  assert.match(missingRuntimeHook.stdout, /profile=runtime-plugin evidence=installed_plugin_root machine_validation=unavailable provenance=unverified/);
  renameSync(missingRuntimeEntrypoint, runtimeEntrypoint);

  const sourceHook = spawnSync("bash", [join(sourcePluginRoot, "hooks", "session-start.sh")], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, AGDF_SURFACE: "source" },
  });
  assert.equal(sourceHook.status, 0, sourceHook.stderr);
  assert.match(sourceHook.stdout, /profile=source-development evidence=source_checkout machine_validation=unavailable/);

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
