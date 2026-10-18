import assert from "node:assert/strict";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fixedRuntimeCheckCommand } from "../lib/runtime-check-consent/contract.js";
import { digestNormalizedPluginSource, renderCodexPluginMcpConfig } from "#agdf-core/runtime/plugin-provenance.js";
import {
  DISPATCHER_BINDING_PREFIX,
  REQUEST_ACTIVATION_MARKERS,
  validateInstructionFootprintProfile,
} from "../../../plugins/agdf/scripts/instruction-footprint.mjs";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const sourcePluginRoot = join(repoRoot, "plugins", "agdf");
const generatedPluginRoot = join(repoRoot, "packages", "cli", "generated", "plugins", "agdf");
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

function assertSessionBase(stdout, pluginRoot, expectedSurface, { facts = false } = {}) {
  const output = stdout.replaceAll("\r\n", "\n").replace(/\n$/u, "");
  const factBlocks = output.split("\n\n").filter((block) => block.startsWith("AGDF runtime facts:"));
  assert.equal(factBlocks.length, facts ? 1 : 0, facts
    ? "Claude plugin enablement is the runtime-check consent, so its session receives runtime facts"
    : "runtime facts require explicit automatic-check consent");
  // The footprint budget covers the base context; runtime facts and a drift notice are appended after it.
  const content = output.split("\n\n")
    .filter((block) => !block.startsWith("AGDF runtime facts:") && !block.startsWith("AGDF installation drift:"))
    .join("\n\n");
  const definition = JSON.parse(readFileSync(join(pluginRoot, "meta", "agdf-plugin.definition.json"), "utf8"));
  const contract = readFileSync(join(pluginRoot, "meta", "contracts", "request-activation.md"), "utf8")
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n");
  const kernelStart = contract.indexOf(REQUEST_ACTIVATION_MARKERS.start);
  const kernelEnd = contract.indexOf(REQUEST_ACTIVATION_MARKERS.end, kernelStart);
  assert.ok(kernelStart >= 0 && kernelEnd > kernelStart, "request-activation contract must expose one ordered kernel");
  const kernel = contract.slice(kernelStart, kernelEnd + REQUEST_ACTIVATION_MARKERS.end.length);
  const report = validateInstructionFootprintProfile({
    definition: definition.instructionFootprint,
    canonicalKernel: kernel,
    expectedVersion: definition.version,
    expectedInstanceIds: { sessionStartBase: [expectedSurface] },
    surfaces: { sessionStartBase: [{ id: expectedSurface, content }] },
    requiredSurfaceIds: ["sessionStartBase"],
  });
  assert.equal(report.status, "pass", JSON.stringify(report.failures));
  const bindingLine = content.split("\n").find((line) => line.startsWith(`${DISPATCHER_BINDING_PREFIX} `));
  const binding = JSON.parse(bindingLine.slice(DISPATCHER_BINDING_PREFIX.length + 1));
  assert.equal(binding.argv_prefix[4], expectedSurface, "binding must name the effective host surface");
  assert.deepEqual(binding.route_source_after_activation, {
    relative_to: "validator_directory",
    path: "../meta/contracts/request-activation.md",
  }, "SessionStart binding must expose the packaged on-demand operation catalog after positive activation");
  const routeSourcePath = resolve(dirname(binding.argv_prefix[0]), binding.route_source_after_activation.path);
  assert.equal(realpathSync(routeSourcePath), realpathSync(join(pluginRoot, "meta", "contracts", "request-activation.md")));
  assert.equal(readFileSync(routeSourcePath, "utf8"), contract, "SessionStart route source must resolve to the packaged canonical contract");
}

try {
  stageInstalledPlugin();
  const isolatedContract = join(installedPluginRoot, "runtime/create-agdf/lib/runtime-check-consent/contract.js");
  const isolatedCommands = spawnSync(process.execPath, ["--input-type=module", "-e", `
    import { fixedRuntimeCheckCommand } from ${JSON.stringify(pathToFileURL(isolatedContract).href)};
    console.log(JSON.stringify(["codex", "claude", "copilot", "opencode"].flatMap(host =>
      ["darwin", "linux", "win32"].map(platform => fixedRuntimeCheckCommand(host, "/fixture/plugin", platform)))));
  `], { cwd: fixtureRoot, encoding: "utf8" });
  assert.equal(isolatedCommands.status, 0, isolatedCommands.stderr);
  assert.deepEqual(JSON.parse(isolatedCommands.stdout), ["codex", "claude", "copilot", "opencode"].flatMap(host =>
    ["darwin", "linux", "win32"].map(platform => fixedRuntimeCheckCommand(host, "/fixture/plugin", platform))));
  for (const forbidden of ["installers", "lifecycle", "runtime-check-consent/service.js", "host-adapters/codex/plugin.js"]) {
    assert.equal(existsSync(join(installedPluginRoot, "runtime/create-agdf/lib", forbidden)), false, `runtime excludes ${forbidden}`);
  }
  const installedDefault = runIntegrity(join(installedPluginRoot, "scripts", "check-runtime-integrity.mjs"));
  assert.equal(installedDefault.status, 0, combinedOutput(installedDefault));
  assert.match(installedDefault.stdout, /mode=installed/);

  const mcpPath = join(installedPluginRoot, 'mcp.json'), mcpBytes = readFileSync(mcpPath, 'utf8');
  const markerPath = join(installedPluginRoot, '.agdf-installation.json'), markerBytes = readFileSync(markerPath, 'utf8');
  for (const cockpit of [false, true]) {
    writeFileSync(mcpPath, renderCodexPluginMcpConfig({ cockpit }));
    writeFileSync(markerPath, JSON.stringify({ ...JSON.parse(markerBytes),
      source_digest: digestNormalizedPluginSource(installedPluginRoot, JSON.parse(markerBytes).canonical_version) }));
    const historicalOrCurrent = runIntegrity(join(installedPluginRoot, 'scripts/check-runtime-integrity.mjs'));
    assert.equal(historicalOrCurrent.status, 0, combinedOutput(historicalOrCurrent));
  }
  for (const mutate of [
    c => { c.mcpServers['agdf-cockpit'].args[4] = '/foreign/data'; },
    c => { c.mcpServers['agdf-cockpit'].args.pop(); },
    c => { c.mcpServers.cockpit = c.mcpServers['agdf-cockpit']; },
    c => { c.mcpServers['agdf-cockpit'].env = { FOREIGN: 'value' }; },
  ]) {
    const config = JSON.parse(renderCodexPluginMcpConfig({ cockpit: true })); mutate(config);
    writeFileSync(mcpPath, JSON.stringify(config));
    const invalid = runIntegrity(join(installedPluginRoot, 'scripts/check-runtime-integrity.mjs'));
    assert.notEqual(invalid.status, 0);
    assert.match(combinedOutput(invalid), /runtime Codex MCP config/);
  }
  writeFileSync(mcpPath, mcpBytes); writeFileSync(markerPath, markerBytes);

  const installedOverride = runIntegrity(
    join(installedPluginRoot, "scripts", "check-runtime-integrity.mjs"),
    installedPluginRoot,
  );
  assert.equal(installedOverride.status, 0, combinedOutput(installedOverride));
  assert.match(installedOverride.stdout, /mode=installed/);

  const healthyHook = spawnSync("bash", [join(installedPluginRoot, "hooks", "session-start.sh")], {
    cwd: fixtureRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      AGDF_DATA_DIR: join(fixtureRoot, "no-consent"),
      AGDF_SURFACE: "claude",
      CLAUDE_PLUGIN_ROOT: installedPluginRoot,
    },
  });
  assert.equal(healthyHook.status, 0, healthyHook.stderr);
  assertSessionBase(healthyHook.stdout, installedPluginRoot, "claude", { facts: true });

  const mismatchedHook = spawnSync("bash", [join(installedPluginRoot, "hooks", "session-start.sh")], {
    cwd: fixtureRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      AGDF_DATA_DIR: join(fixtureRoot, "no-consent"),
      AGDF_SURFACE: "claude",
      CLAUDE_PLUGIN_ROOT: join(fixtureRoot, "wrong-plugin-root"),
    },
  });
  assert.equal(mismatchedHook.status, 0, mismatchedHook.stderr);
  assertSessionBase(mismatchedHook.stdout, installedPluginRoot, "claude", { facts: true });

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
    env: { ...process.env, AGDF_DATA_DIR: join(fixtureRoot, "no-consent"), AGDF_SURFACE: "codex" },
  });
  assert.equal(malformedHook.status, 0, malformedHook.stderr);
  assertSessionBase(malformedHook.stdout, installedPluginRoot, "codex");
  writeFileSync(runtimeEntrypoint, validRuntimeEntrypoint);

  const missingRuntimeEntrypoint = `${runtimeEntrypoint}.missing`;
  renameSync(runtimeEntrypoint, missingRuntimeEntrypoint);
  const missingRuntimeHook = spawnSync("bash", [join(installedPluginRoot, "hooks", "session-start.sh")], {
    cwd: fixtureRoot,
    encoding: "utf8",
    env: { ...process.env, AGDF_DATA_DIR: join(fixtureRoot, "no-consent"), AGDF_SURFACE: "codex" },
  });
  assert.equal(missingRuntimeHook.status, 0, missingRuntimeHook.stderr);
  assert.equal(missingRuntimeHook.stdout.includes(DISPATCHER_BINDING_PREFIX), false, "missing entrypoint must not advertise an executable binding");
  assert.match(missingRuntimeHook.stdout, /"outcome":"dispatcher_unavailable"/);
  assert.match(missingRuntimeHook.stdout, /"authorizes":false/);
  assert.equal(missingRuntimeHook.stdout.split(REQUEST_ACTIVATION_MARKERS.start).length - 1, 1, "unavailability does not remove the passive activation boundary");
  renameSync(missingRuntimeEntrypoint, runtimeEntrypoint);

  const sourceHook = spawnSync("bash", [join(sourcePluginRoot, "host-templates", "shared", "hooks", "session-start.sh")], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, AGDF_DATA_DIR: join(fixtureRoot, "no-consent"), AGDF_SURFACE: "source" },
  });
  assert.equal(sourceHook.status, 0, sourceHook.stderr);
  assert.equal(
    sourceHook.stdout,
    "AGDF SessionStart transport unavailable: generated runtime entrypoint not found.\n",
    "the non-configured source compatibility wrapper must not carry activation policy",
  );
  assert.equal(sourceHook.stdout.includes(REQUEST_ACTIVATION_MARKERS.start), false);
  assert.equal(sourceHook.stdout.includes(DISPATCHER_BINDING_PREFIX), false);
  assert.equal(sourceHook.stdout.includes("AGDF runtime facts:"), false);

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
