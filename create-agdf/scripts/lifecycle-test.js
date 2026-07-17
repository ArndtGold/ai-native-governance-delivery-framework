import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createLifecycleResult } from "../lib/lifecycle/result.js";
import { lifecycleCardLines, printLifecycleResult } from "../lib/lifecycle/presentation.js";
import {
  applyLifecyclePlan,
  planGlobalUninstall,
  planRepositoryDisable,
  verifyGlobalUninstall,
  verifyRepositoryDisabled,
} from "../lib/lifecycle/operations.js";
import { pluginDefinition } from "../lib/cli/runtime-context.js";
import { installOpenCodeGlobalPlugin } from "../lib/installers/opencode.js";
import { evaluateGeneralStatus } from "../lib/lifecycle/status.js";

const success = createLifecycleResult({
  operation: "install", result: "success", surface: "codex", scope: "global",
  version: { expected: "1.2.3", installed: "1.2.3", status: "verified" },
  verification: { status: "healthy", evidence: ["fixture"] },
  restart: { required: true, reason: "host_reload" },
  next_action: { kind: "prompt", text: "Start a new task." },
});
assert.deepEqual(lifecycleCardLines(success).slice(1).map((line) => line.split(":")[0]), [
  "Surface", "Version", "Installation scope", "Installation", "Activation", "Repository delivery", "Verification", "Restart required", "Next action",
]);
assert.equal(lifecycleCardLines(success)[0], "AGDF installation complete");
assert.equal(success.installation.status, "healthy");
assert.equal(success.activation.status, "pending_restart");
assert.equal(success.delivery.status, "not_evaluated");
assert.throws(() => createLifecycleResult({
  operation: "install", result: "success", surface: "unsupported", scope: "global",
  next_action: { text: "Continue" },
}), /Unsupported lifecycle surface/);
assert.throws(() => createLifecycleResult({
  operation: "install", result: "success", scope: "global", next_action: { text: "Continue" },
}), /Unsupported lifecycle surface/);
for (const [surface, label] of Object.entries({ codex: "Codex", claude: "Claude Code", copilot: "GitHub Copilot", opencode: "OpenCode", generic: "Generic coding agent" })) {
  const report = createLifecycleResult({ operation: "status", result: "success", surface, scope: "global", next_action: { text: "Continue" } });
  assert.equal(lifecycleCardLines(report)[1], `Surface: ${label}`);
}
assert.deepEqual(lifecycleCardLines(success), lifecycleCardLines(success, "de"), "Lifecycle cards must not vary with project locale.");
const rendered = [];
printLifecycleResult(success, { io: { log(line) { rendered.push(line); } } });
assert.equal(rendered.some((line) => line.startsWith("Repository delivery:")), true);
assert.throws(() => createLifecycleResult({
  operation: "install", result: "success", surface: "codex", scope: "global",
  version: { status: "verified" }, next_action: { text: "Continue" },
}), /observed installed version/);
const partial = createLifecycleResult({
  operation: "uninstall", result: "partial", surface: "opencode", scope: "global",
  verification: { status: "degraded", evidence: ["config_written", "npm_failed"] },
  next_action: { kind: "recovery", text: "Inspect the failed package removal." },
  changes: [{ kind: "write", path: "opencode.json" }],
});
assert.equal(partial.result, "partial");
assert.equal(partial.next_action.text, "Inspect the failed package removal.");

const root = mkdtempSync(join(tmpdir(), "agdf-lifecycle-"));
const disablePlan = planRepositoryDisable(root, "codex");
assert.equal(disablePlan.scope, "repository");
assert.equal(applyLifecyclePlan(disablePlan).status, "success");
assert.match(readFileSync(join(root, ".codex", "config.toml"), "utf8"), /enabled = false/);
assert.equal(verifyRepositoryDisabled(root).status, "healthy");
assert.ok(disablePlan.retained.some((value) => value.includes(".agdf")));
assert.throws(() => planRepositoryDisable(root, "claude"), /not supported safely/);

const exactSectionRoot = mkdtempSync(join(tmpdir(), "agdf-disable-exact-"));
mkdirSync(join(exactSectionRoot, ".agents", "plugins"), { recursive: true });
mkdirSync(join(exactSectionRoot, ".codex"), { recursive: true });
writeFileSync(join(exactSectionRoot, ".agents", "plugins", "marketplace.json"), "{}\n");
writeFileSync(join(exactSectionRoot, ".codex", "config.toml"), "[plugins.\"agdf@agdf-repo\"]\nenabled = true\n\n[plugins.\"other@market\"]\nenabled = false\n");
assert.equal(applyLifecyclePlan(planRepositoryDisable(exactSectionRoot, "codex")).status, "success");
assert.equal(verifyRepositoryDisabled(exactSectionRoot).status, "healthy");
assert.match(readFileSync(join(exactSectionRoot, ".codex", "config.toml"), "utf8"), /\[plugins\.\"other@market\"\]\nenabled = false/);
const disabledStatus = evaluateGeneralStatus(exactSectionRoot, { surface: "codex" }, {
  inspectPluginSurface: () => ({ status: "healthy", surface: "codex", version: "1.2.3", evidence: ["fixture"] }),
});
assert.equal(disabledStatus.repository.status, "disabled");
assert.match(disabledStatus.next_action.text, /Restart the host/);

const ambiguousDisableRoot = mkdtempSync(join(tmpdir(), "agdf-disable-ambiguous-"));
mkdirSync(join(ambiguousDisableRoot, ".codex"), { recursive: true });
writeFileSync(join(ambiguousDisableRoot, ".codex", "config.toml"), "[plugins.\"agdf@agdf\"]\ncustom = \"user-owned\"\n");
assert.throws(() => planRepositoryDisable(ambiguousDisableRoot, "codex"), /ambiguous AGDF plugin state/);

const uninstall = planGlobalUninstall("codex");
const calls = [];
assert.equal(applyLifecyclePlan(uninstall, { exec(command, args) { calls.push([command, args]); } }).status, "success");
assert.deepEqual(calls, [["codex", ["plugin", "remove", "agdf@agdf"]]]);
assert.equal(verifyGlobalUninstall(uninstall, root, {
  inspect: () => ({ status: "not_installed", evidence: ["fixture"] }),
}).status, "healthy");

const ownedConfig = mkdtempSync(join(tmpdir(), "agdf-opencode-uninstall-"));
writeFileSync(join(ownedConfig, "opencode.json"), `${JSON.stringify({ plugin: [pluginDefinition.opencode.npmPackage], instructions: ["AGDF.md", "USER.md"] })}\n`);
writeFileSync(join(ownedConfig, pluginDefinition.opencode.instructionsFileName), "<!-- AGDF-GLOBAL-INSTRUCTIONS -->\nowned\n");
writeFileSync(join(ownedConfig, pluginDefinition.opencode.runtimeContractFileName), "user-authored\n");
const previewConfig = readFileSync(join(ownedConfig, "opencode.json"), "utf8");
const openCodePlan = planGlobalUninstall("opencode", { configDir: ownedConfig });
assert.equal(readFileSync(join(ownedConfig, "opencode.json"), "utf8"), previewConfig, "planning must be non-mutating");
assert.ok(openCodePlan.mutations.some((mutation) => mutation.kind === "remove" && mutation.path.endsWith(pluginDefinition.opencode.instructionsFileName)));
assert.ok(openCodePlan.retained.some((item) => item.endsWith(pluginDefinition.opencode.runtimeContractFileName)));
assert.equal(applyLifecyclePlan(openCodePlan, { exec() {} }).status, "success");
assert.equal(existsSync(join(ownedConfig, pluginDefinition.opencode.instructionsFileName)), false);
assert.equal(existsSync(join(ownedConfig, pluginDefinition.opencode.runtimeContractFileName)), true);
assert.deepEqual(JSON.parse(readFileSync(join(ownedConfig, "opencode.json"), "utf8")).instructions, ["USER.md"]);
assert.equal(verifyGlobalUninstall(openCodePlan, root, {
  configDir: ownedConfig,
  evaluateOpenCode: () => ({ status: "not_configured", global_config: { path: join(ownedConfig, "opencode.json") } }),
}).status, "healthy");

const partialConfig = mkdtempSync(join(tmpdir(), "agdf-opencode-partial-"));
writeFileSync(join(partialConfig, "opencode.json"), `${JSON.stringify({ plugin: [pluginDefinition.opencode.npmPackage] })}\n`);
const partialPlan = planGlobalUninstall("opencode", { configDir: partialConfig });
const partialApply = applyLifecyclePlan(partialPlan, { exec() { throw new Error("npm removal failed"); } });
assert.equal(partialApply.status, "partial");
assert.equal(JSON.parse(readFileSync(join(partialConfig, "opencode.json"), "utf8")).plugin.length, 0);

const invalidOpenCodeConfig = mkdtempSync(join(tmpdir(), "agdf-opencode-invalid-"));
writeFileSync(join(invalidOpenCodeConfig, "opencode.json"), "{invalid\n");
assert.throws(() => installOpenCodeGlobalPlugin(invalidOpenCodeConfig), (error) => {
  assert.equal(error.phase, "configuration");
  assert.match(error.message, /unreadable OpenCode config/);
  return true;
});

const statusRoot = mkdtempSync(join(tmpdir(), "agdf-status-"));
const report = evaluateGeneralStatus(statusRoot, { surface: "codex" }, {
  inspectPluginSurface: () => ({ status: "healthy", surface: "codex", version: "1.2.3", evidence: ["fixture"] }),
  evaluateDoctor: () => { throw new Error("must not run without control state"); },
  evaluateGateCheck: () => { throw new Error("must not run without control state"); },
});
assert.equal(report.installation.status, "healthy");
assert.equal(report.repository.status, "not_configured");
assert.equal(report.delivery.status, "not_configured");

const autoSelected = evaluateGeneralStatus(statusRoot, {}, {
  inspectPluginSurface: (surface) => ({ status: surface === "claude" ? "healthy" : "not_installed", surface, version: surface === "claude" ? "1.2.3" : null, evidence: [surface] }),
  evaluateOpenCodeStatus: () => ({ status: "not_configured", package: { version_status: "unloadable", installed_version: null }, global_config: { path: "fixture" } }),
});
assert.equal(autoSelected.installation.surface, "claude");
const ambiguousSurface = evaluateGeneralStatus(statusRoot, {}, {
  inspectPluginSurface: (surface) => ({ status: "healthy", surface, version: "1.2.3", evidence: [surface] }),
  evaluateOpenCodeStatus: () => ({ status: "not_configured", package: { version_status: "unloadable", installed_version: null }, global_config: { path: "fixture" } }),
});
assert.equal(ambiguousSurface.installation.surface, "multiple");
assert.match(ambiguousSurface.next_action.text, /explicit --surface/);

const blockedRoot = mkdtempSync(join(tmpdir(), "agdf-status-blocked-"));
mkdirSync(join(blockedRoot, ".agdf", "control", "runs"), { recursive: true });
const blocked = evaluateGeneralStatus(blockedRoot, { surface: "codex", runId: "run-a" }, {
  inspectPluginSurface: () => ({ status: "healthy", surface: "codex", version: "1.2.3", evidence: ["fixture"] }),
  evaluateDoctor: () => ({ status: "warn" }),
  evaluateGateCheck: () => ({ status: "blocked", current_gate: "PRD" }),
});
assert.equal(blocked.installation.status, "healthy");
assert.equal(blocked.delivery.status, "blocked");
assert.equal(blocked.delivery.current_gate, "PRD");

const ambiguousRun = evaluateGeneralStatus(blockedRoot, { surface: "codex" }, {
  inspectPluginSurface: () => ({ status: "healthy", surface: "codex", version: "1.2.3", evidence: ["fixture"] }),
  evaluateDoctor: () => { throw new Error("AGDF_ACTIVE_RUN_AMBIGUOUS"); },
  evaluateGateCheck: () => { throw new Error("must not invent a run selection"); },
});
assert.equal(ambiguousRun.delivery.status, "unknown");
assert.match(ambiguousRun.delivery.evidence[0], /AGDF_ACTIVE_RUN_AMBIGUOUS/);

console.log("lifecycle tests passed");
