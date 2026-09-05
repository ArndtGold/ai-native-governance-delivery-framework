import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createLifecycleResult, createOperationStatus, globalInstallRestartAction } from "../lib/lifecycle/result.js";
import { compactLifecycleCardLines, lifecycleCardLines, printLifecycleResult } from "../lib/lifecycle/presentation.js";
import {
  applyLifecyclePlan,
  planGlobalUninstall,
  planRepositoryDisable,
  verifyGlobalUninstall,
  verifyRepositoryDisabled,
} from "../lib/lifecycle/operations.js";
import { pluginDefinition } from "../lib/cli/runtime-context.js";
import { runCli } from "../lib/cli/application.js";
import {
  defaultOpenCodeConfigDir,
  installOpenCodeGlobalPlugin,
  installOpenCodeGlobalSurface,
  openCodePluginEntrypoint,
} from "../lib/installers/opencode.js";
import { evaluateOpenCodeRepositoryActivation } from "../lib/installers/opencode-activation.js";
import AGDFPlugin from "../opencode-plugin.js";
import {
  evaluateGeneralStatus,
  evaluateStatusOverview,
  inspectControlPresence,
  inspectGlobalInstallationStatus,
} from "../lib/lifecycle/status.js";
import {
  applyCopilotRepositoryDisable,
  atomicSettingsWrite,
  planCopilotRepositoryDisable,
  repositoryCopilotSettingsPath,
} from "../lib/installers/copilot-settings.js";

const success = createLifecycleResult({
  operation: "install", result: "success", surface: "codex", scope: "global",
  version: { expected: "1.2.3", installed: "1.2.3", status: "verified" },
  verification: { status: "healthy", evidence: ["fixture"] },
  restart: { required: true, reason: "host_reload" },
  next_action: { kind: "prompt", text: "Start a new task." },
});
for (const [surface, host] of Object.entries({
  codex: "Codex",
  claude: "Claude Code",
  copilot: "GitHub Copilot",
  opencode: "OpenCode",
})) {
  const action = globalInstallRestartAction(surface);
  assert.equal(action.kind, "restart");
  assert.match(action.text, new RegExp(`^Fully restart ${host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.match(action.text, /fresh session/);
  assert.match(action.text, /Restoring the previous session can retain stale AGDF skills/);
}
assert.deepEqual(lifecycleCardLines(success).slice(1).map((line) => line.split(":")[0]), [
  "Surface", "Operation", "Operation outcome", "Target", "Planned effect", "Authorizes", "Version", "Installation scope", "Installation", "Activation", "Repository delivery", "Automatic runtime checks", "Verification", "Restart required", "Next action",
]);
assert.equal(lifecycleCardLines(success)[0], "AGDF installation complete");
assert.deepEqual(compactLifecycleCardLines(success), [
  "AGDF installed for Codex",
  "Operation: lifecycle.plugin.install.codex (succeeded; global)",
  "Version: 1.2.3 (verified)",
  "Installation: Ready",
  "Automatic checks: Not configured",
  "Next: Start a new task.",
]);
assert.deepEqual(compactLifecycleCardLines(createLifecycleResult({
  operation: "install", result: "success", surface: "codex", scope: "global",
  verification: { status: "healthy" },
  runtime_checks: { requested: "enabled", effective: "decision_required" },
  restart: { required: true },
  next_action: { text: "Restart Codex." },
})), [
  "AGDF installed for Codex",
  "Operation: lifecycle.plugin.install.codex (succeeded; global)",
  "Version: not verified",
  "Installation: Ready",
  "Automatic checks: Waiting for Codex permission",
  "Next: Restart Codex.",
]);
assert.equal(lifecycleCardLines(createLifecycleResult({
  operation: "install", result: "preview", surface: "codex", scope: "global",
  next_action: { text: "Cancelled." },
}))[0], "AGDF installation cancelled");
assert.equal(lifecycleCardLines(createLifecycleResult({
  operation: "uninstall", result: "preview", surface: "codex", scope: "global",
  next_action: { text: "Review before uninstall." },
}))[0], "AGDF uninstall preview");
assert.deepEqual(compactLifecycleCardLines(createLifecycleResult({
  operation: "install", result: "preview", surface: "codex", scope: "global",
  runtime_checks: { requested: "cancelled", effective: "cancelled" },
  next_action: { text: "Installation was cancelled." },
})), [
  "AGDF installation cancelled",
  "Operation: lifecycle.plugin.install.codex (preview; global)",
  "No changes were made.",
  "Next: Installation was cancelled.",
]);
const updateCard = compactLifecycleCardLines(createLifecycleResult({
  operation: "update", result: "success", surface: "opencode", scope: "global",
  version: { previous: "1.2.2", installed: "1.2.3", status: "verified", transition: "updated" },
  verification: { status: "healthy" },
  next_action: { text: "Restart OpenCode." },
}));
assert.deepEqual(updateCard.slice(0, 2), ["AGDF updated for OpenCode", "Operation: lifecycle.plugin.install.opencode (succeeded; global)"]);
assert.equal(updateCard[2], "Updated: 1.2.2 -> 1.2.3 (verified)");
assert.equal(success.installation.status, "healthy");
assert.equal(success.activation.status, "pending_restart");
assert.equal(success.delivery.status, "not_evaluated");
assert.deepEqual(success.operation_status, {
  operation_id: "lifecycle.plugin.install.codex",
  outcome: "succeeded",
  target_scope: "global",
  target: null,
  planned_effect: "install_or_update_global_plugin",
  excluded_authority: ["target_inference", "run_creation", "ur_persistence", "gate_approval", "implementation", "qa", "release"],
  authorizes: false,
});
assert.deepEqual(success.runtime_checks, { requested: "unknown", effective: "unknown", reason: "not_evaluated", capability_identity: null, verification: "not_evaluated", mutation: "none", rollback: "none" });
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
assert.equal(partial.operation_status.outcome, "partial");
assert.equal(partial.operation_status.operation_id, "lifecycle.plugin.uninstall");
assert.equal(partial.next_action.text, "Inspect the failed package removal.");
assert.throws(() => createLifecycleResult({
  operation: "disable", result: "success", surface: "codex", scope: "repository",
  next_action: { text: "Restart Codex." },
}), /target-bound/);
assert.throws(() => createOperationStatus({
  operationId: "status.overview",
  outcome: "reported",
  targetScope: "global",
  target: "/must-not-be-accepted",
  plannedEffect: "read_only_status",
  excludedAuthority: ["gate_approval"],
}), /target-bound/);
assert.throws(() => createLifecycleResult({
  operation: "install", result: "success", surface: "codex", scope: "global",
  operation_status: {
    operation_id: "lifecycle.plugin.install.codex",
    outcome: "succeeded",
    target_scope: "global",
    target: null,
    planned_effect: "install_or_update_global_plugin",
    excluded_authority: ["gate_approval"],
    authorizes: true,
  },
  next_action: { text: "Continue." },
}), /non-authorizing/);
assert.throws(() => createLifecycleResult({
  operation: "install", result: "success", surface: "codex", scope: "global",
  operation_status: {
    operation_id: "status.overview",
    outcome: "succeeded",
    target_scope: "global",
    target: null,
    planned_effect: "install_or_update_global_plugin",
    excluded_authority: ["gate_approval"],
    authorizes: false,
  },
  next_action: { text: "Continue." },
}), /exact operation id/);
assert.throws(() => createLifecycleResult({
  operation: "repository_setup", result: "success", surface: "codex", scope: "repository", target: "/explicit/repository",
  operation_status: {
    operation_id: "lifecycle.repository.activate.codex",
    outcome: "succeeded",
    target_scope: "global",
    target: null,
    planned_effect: "configure_repository_plugin_surface",
    excluded_authority: ["target_inference", "run_creation", "ur_persistence", "gate_approval", "implementation", "qa", "release"],
    authorizes: false,
  },
  next_action: { text: "Continue." },
}), /target scope and target must be derived exactly/);
assert.throws(() => createLifecycleResult({
  operation: "install", result: "success", surface: "codex", scope: "global",
  operation_status: {
    operation_id: "lifecycle.plugin.install.codex",
    outcome: "succeeded",
    target_scope: "global",
    target: null,
    planned_effect: "read_only_status",
    excluded_authority: ["target_inference", "run_creation", "ur_persistence", "gate_approval", "implementation", "qa", "release"],
    authorizes: false,
  },
  next_action: { text: "Continue." },
}), /exact planned effect install_or_update_global_plugin/);
assert.throws(() => createLifecycleResult({
  operation: "install", result: "success", surface: "codex", scope: "global",
  operation_status: {
    operation_id: "lifecycle.plugin.install.codex",
    outcome: "succeeded",
    target_scope: "global",
    target: null,
    planned_effect: "install_or_update_global_plugin",
    excluded_authority: ["gate_approval"],
    authorizes: false,
  },
  next_action: { text: "Continue." },
}), /exact excluded-authority contract/);

const root = mkdtempSync(join(tmpdir(), "agdf-lifecycle-"));
for (const [command, surface, operationId] of [
  ["codex-repo", "codex", "lifecycle.repository.activate.codex"],
  ["opencode-repo", "opencode", "lifecycle.repository.activate.opencode"],
]) {
  const setupRoot = mkdtempSync(join(tmpdir(), `agdf-${command}-lifecycle-`));
  const setupOutput = [];
  assert.equal(await runCli([command, "--dir", setupRoot, "--json"], {
    parser: { cwd: root },
    env: { LANG: "en" },
    io: { log(value) { setupOutput.push(value); }, error(message) { throw new Error(message); } },
  }), 0);
  const setupReport = JSON.parse(setupOutput.at(-1));
  assert.equal(setupReport.operation, "repository_setup");
  assert.equal(setupReport.operation_status.operation_id, operationId);
  assert.equal(setupReport.operation_status.outcome, "succeeded");
  assert.equal(setupReport.operation_status.target_scope, "repository");
  assert.equal(setupReport.operation_status.target, setupRoot);
  assert.equal(setupReport.operation_status.authorizes, false);
  assert.equal(setupReport.next_action.text.length > 0, true);
  assert.equal(setupReport.surface, surface);
}

const repositorySetupFailureRoot = mkdtempSync(join(tmpdir(), "agdf-repository-setup-failure-"));
writeFileSync(join(repositorySetupFailureRoot, ".agents"), "user-owned collision\n");
const repositorySetupFailureOutput = [];
assert.equal(await runCli(["codex-repo", "--dir", repositorySetupFailureRoot, "--json"], {
  parser: { cwd: root },
  env: { LANG: "en" },
  io: { log(value) { repositorySetupFailureOutput.push(value); }, error(message) { throw new Error(message); } },
}), 1);
const repositorySetupFailureReport = JSON.parse(repositorySetupFailureOutput[0]);
assert.equal(repositorySetupFailureReport.result, "failed");
assert.equal(repositorySetupFailureReport.operation_status.operation_id, "lifecycle.repository.activate.codex");
assert.equal(repositorySetupFailureReport.operation_status.outcome, "failed");
assert.equal(repositorySetupFailureReport.operation_status.target, repositorySetupFailureRoot);
assert.equal(lifecycleCardLines(repositorySetupFailureReport)[0], "AGDF repository setup failed");

const disablePlan = planRepositoryDisable(root, "codex");
assert.equal(disablePlan.scope, "repository");
assert.equal(applyLifecyclePlan(disablePlan).status, "success");
assert.match(readFileSync(join(root, ".codex", "config.toml"), "utf8"), /enabled = false/);
assert.equal(verifyRepositoryDisabled(root).status, "healthy");
assert.ok(disablePlan.retained.some((value) => value.includes(".agdf")));
assert.throws(() => planRepositoryDisable(root, "claude"), /not supported safely/);

const ignoredExec = (executable, args, options) => {
  assert.equal(executable, "git");
  assert.deepEqual(args, ["check-ignore", "--quiet", "--", ".github/copilot/settings.local.json"]);
  assert.ok(options.cwd);
};
const copilotPersonalRoot = mkdtempSync(join(tmpdir(), "agdf-copilot-personal-"));
const personalPlan = planRepositoryDisable(copilotPersonalRoot, "copilot", { exec: ignoredExec });
assert.equal(personalPlan.audience, "personal");
assert.equal(personalPlan.mutations[0].path, join(copilotPersonalRoot, ".github", "copilot", "settings.local.json"));
assert.equal(applyLifecyclePlan(personalPlan).status, "success");
assert.equal(verifyRepositoryDisabled(copilotPersonalRoot, "copilot").status, "healthy");
assert.equal(JSON.parse(readFileSync(personalPlan.mutations[0].path, "utf8")).enabledPlugins["agdf@agdf"], false);
if (process.platform !== "win32") assert.equal(statSync(personalPlan.mutations[0].path).mode & 0o777, 0o600);

const copilotSharedRoot = mkdtempSync(join(tmpdir(), "agdf-copilot-shared-"));
const sharedPath = join(copilotSharedRoot, ".github", "copilot", "settings.json");
mkdirSync(join(copilotSharedRoot, ".github", "copilot"), { recursive: true });
writeFileSync(sharedPath, `${JSON.stringify({ theme: "dark", enabledPlugins: { "other@market": true, "agdf@agdf": true } }, null, 2)}\n`);
const sharedPlan = planRepositoryDisable(copilotSharedRoot, "copilot", { shared: true });
assert.equal(sharedPlan.audience, "shared");
assert.equal(applyLifecyclePlan(sharedPlan).status, "success");
assert.deepEqual(JSON.parse(readFileSync(sharedPath, "utf8")), {
  theme: "dark",
  enabledPlugins: { "other@market": true, "agdf@agdf": false },
});
assert.equal(verifyRepositoryDisabled(copilotSharedRoot, "copilot", { shared: true }).status, "healthy");
assert.equal(planRepositoryDisable(copilotSharedRoot, "copilot", { shared: true }).mutations.length, 0, "repeat disable must be an idempotent no-op");
assert.throws(() => planRepositoryDisable(copilotSharedRoot, "codex", { shared: true }), /not supported safely/);

const unignoredError = Object.assign(new Error("not ignored"), { status: 1 });
const unignoredRoot = mkdtempSync(join(tmpdir(), "agdf-copilot-unignored-"));
assert.throws(() => planCopilotRepositoryDisable({ targetDir: unignoredRoot, exec() { throw unignoredError; } }), /LOCAL_SETTINGS_NOT_IGNORED/);
assert.equal(existsSync(repositoryCopilotSettingsPath(unignoredRoot)), false);
const unavailableGitError = Object.assign(new Error("missing Git"), { code: "ENOENT" });
assert.throws(() => planCopilotRepositoryDisable({ targetDir: unignoredRoot, exec() { throw unavailableGitError; } }), /GIT_UNAVAILABLE/);
const nonWorktreeError = Object.assign(new Error("not a worktree"), { status: 128 });
assert.throws(() => planCopilotRepositoryDisable({ targetDir: unignoredRoot, exec() { throw nonWorktreeError; } }), /GIT_IGNORE_UNVERIFIED/);
assert.throws(() => planCopilotRepositoryDisable({ targetDir: join(unignoredRoot, "missing"), shared: true }), /REPOSITORY_UNOWNED_PATH/);
const parentFileRoot = mkdtempSync(join(tmpdir(), "agdf-copilot-parent-file-"));
writeFileSync(join(parentFileRoot, ".github"), "not a directory\n");
assert.throws(() => planCopilotRepositoryDisable({ targetDir: parentFileRoot, shared: true }), /SETTINGS_UNOWNED_PATH/);

for (const [name, content, pattern] of [
  ["invalid", "{broken\n", /SETTINGS_INVALID/],
  ["jsonc", "{\n  // comment\n  \"enabledPlugins\": {}\n}\n", /SETTINGS_INVALID/],
  ["root-array", "[]\n", /SETTINGS_INVALID/],
  ["plugins-array", "{\"enabledPlugins\":[]}\n", /SETTINGS_INVALID/],
  ["ambiguous", "{\"enabledPlugins\":{\"agdf@agdf\":\"false\"}}\n", /AMBIGUOUS_PLUGIN_STATE/],
]) {
  const invalidRoot = mkdtempSync(join(tmpdir(), `agdf-copilot-${name}-`));
  const invalidPath = join(invalidRoot, ".github", "copilot", "settings.json");
  mkdirSync(join(invalidRoot, ".github", "copilot"), { recursive: true });
  writeFileSync(invalidPath, content);
  assert.throws(() => planRepositoryDisable(invalidRoot, "copilot", { shared: true }), pattern);
  assert.equal(readFileSync(invalidPath, "utf8"), content, `${name} fixture must remain unchanged`);
}

const symlinkRoot = mkdtempSync(join(tmpdir(), "agdf-copilot-symlink-"));
mkdirSync(join(symlinkRoot, ".github"), { recursive: true });
symlinkSync(copilotSharedRoot, join(symlinkRoot, ".github", "copilot"));
assert.throws(() => planRepositoryDisable(symlinkRoot, "copilot", { shared: true }), /UNOWNED_PATH/);

const atomicRoot = mkdtempSync(join(tmpdir(), "agdf-copilot-atomic-"));
const atomicPath = join(atomicRoot, "settings.json");
writeFileSync(atomicPath, "{\"before\":true}\n");
assert.throws(() => atomicSettingsWrite(atomicPath, { after: true }, { rename() { throw new Error("injected rename failure"); } }), /injected rename failure/);
assert.equal(readFileSync(atomicPath, "utf8"), "{\"before\":true}\n");
assert.equal(readdirSync(atomicRoot).some((name) => name.includes("agdf-tmp")), false);

const rollbackRoot = mkdtempSync(join(tmpdir(), "agdf-copilot-verify-rollback-"));
const rollbackPath = join(rollbackRoot, ".github", "copilot", "settings.json");
mkdirSync(join(rollbackRoot, ".github", "copilot"), { recursive: true });
writeFileSync(rollbackPath, "{\n  \"keep\": true\n}\n");
const rollbackBytes = readFileSync(rollbackPath, "utf8");
const rollbackMutation = planCopilotRepositoryDisable({ targetDir: rollbackRoot, shared: true });
let writes = 0;
assert.throws(() => applyCopilotRepositoryDisable(rollbackMutation, {
  writeSettings(path, settings) {
    writes += 1;
    atomicSettingsWrite(path, writes === 1 ? { ...settings, enabledPlugins: { "agdf@agdf": true } } : settings);
  },
}), /VERIFICATION_FAILED/);
assert.equal(readFileSync(rollbackPath, "utf8"), rollbackBytes, "verification rollback must restore exact prior bytes");

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

const generatedRepositoryRoot = mkdtempSync(join(tmpdir(), "agdf-generated-repository-"));
cpSync(fileURLToPath(new URL("../generated/.agents", import.meta.url)), join(generatedRepositoryRoot, ".agents"), { recursive: true });
cpSync(fileURLToPath(new URL("../generated/plugins", import.meta.url)), join(generatedRepositoryRoot, "plugins"), { recursive: true });
const generatedRepositoryStatus = evaluateGeneralStatus(generatedRepositoryRoot, { surface: "codex" }, {
  inspectPluginSurface: () => ({ status: "healthy", surface: "codex", version: pluginDefinition.version, evidence: ["fixture"] }),
});
assert.equal(generatedRepositoryStatus.repository.status, "active", "runtime-complete generated repository marketplace must remain active");
const generatedDisablePlan = planRepositoryDisable(generatedRepositoryRoot, "codex");
assert.match(generatedDisablePlan.mutations[0].content, /agdf@agdf-repo/);

const invalidRepositoryRoot = mkdtempSync(join(tmpdir(), "agdf-invalid-repository-"));
mkdirSync(join(invalidRepositoryRoot, ".agents", "plugins"), { recursive: true });
writeFileSync(join(invalidRepositoryRoot, ".agents", "plugins", "marketplace.json"), "{}\n");
const invalidRepositoryStatus = evaluateGeneralStatus(invalidRepositoryRoot, { surface: "codex" }, {
  inspectPluginSurface: () => ({ status: "healthy", surface: "codex", version: pluginDefinition.version, evidence: ["fixture"] }),
});
assert.equal(invalidRepositoryStatus.repository.status, "degraded", "runtime-free or malformed repository marketplace must not appear active");
assert.match(invalidRepositoryStatus.next_action.text, /incomplete or invalid/);

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
const copilotUninstall = planGlobalUninstall("copilot");
assert.deepEqual(copilotUninstall.mutations[0], { kind: "command", executable: "copilot", args: ["plugin", "uninstall", "agdf"] });

const ownedConfig = mkdtempSync(join(tmpdir(), "agdf-opencode-uninstall-"));
writeFileSync(join(ownedConfig, "opencode.json"), `${JSON.stringify({
  plugin: [openCodePluginEntrypoint, pluginDefinition.opencode.npmPackage, `${pluginDefinition.opencode.npmPackage}@0.13.0`, "user-plugin"],
  instructions: ["AGDF.md", "USER.md"],
})}\n`);
writeFileSync(join(ownedConfig, pluginDefinition.opencode.instructionsFileName), "<!-- AGDF-GLOBAL-INSTRUCTIONS -->\nowned\n");
writeFileSync(join(ownedConfig, pluginDefinition.opencode.runtimeContractFileName), "user-authored\n");
mkdirSync(join(ownedConfig, "agdf", "bin"), { recursive: true });
writeFileSync(join(ownedConfig, "agdf", "bin", "agdf-local.js"), "// AGDF-GLOBAL-LOCAL-VALIDATOR\nowned\n");
writeFileSync(join(ownedConfig, "agdf", "package.json"), `${JSON.stringify({
  name: "agdf-opencode-validator-runtime",
  agdf: { owner: "create-agdf", surface: "opencode-global-validator" },
})}\n`);
const previewConfig = readFileSync(join(ownedConfig, "opencode.json"), "utf8");
const openCodePlan = planGlobalUninstall("opencode", { configDir: ownedConfig });
assert.equal(readFileSync(join(ownedConfig, "opencode.json"), "utf8"), previewConfig, "planning must be non-mutating");
assert.ok(openCodePlan.mutations.some((mutation) => mutation.kind === "remove" && mutation.path.endsWith(pluginDefinition.opencode.instructionsFileName)));
assert.ok(openCodePlan.retained.some((item) => item.endsWith(pluginDefinition.opencode.runtimeContractFileName)));
assert.equal(applyLifecyclePlan(openCodePlan, { exec() {} }).status, "success");
assert.equal(existsSync(join(ownedConfig, pluginDefinition.opencode.instructionsFileName)), false);
assert.equal(existsSync(join(ownedConfig, pluginDefinition.opencode.runtimeContractFileName)), true);
assert.equal(existsSync(join(ownedConfig, "agdf", "bin", "agdf-local.js")), false);
assert.equal(existsSync(join(ownedConfig, "agdf", "package.json")), false);
assert.deepEqual(JSON.parse(readFileSync(join(ownedConfig, "opencode.json"), "utf8")).instructions, ["USER.md"]);
assert.deepEqual(JSON.parse(readFileSync(join(ownedConfig, "opencode.json"), "utf8")).plugin, ["user-plugin"]);
let openCodeVerificationArguments = null;
assert.equal(verifyGlobalUninstall(openCodePlan, root, {
  configDir: ownedConfig,
  evaluateOpenCodeGlobalStatus(...args) {
    openCodeVerificationArguments = args;
    return {
      status: "not_configured",
      global_config: { path: join(ownedConfig, "opencode.json"), plugin_configured: false, legacy_plugin_configured: false },
      package: { loadable: false },
    };
  },
}).status, "healthy");
assert.deepEqual(openCodeVerificationArguments, [ownedConfig], "global uninstall verification must not receive a repository target");
assert.equal(verifyGlobalUninstall(openCodePlan, root, {
  configDir: ownedConfig,
  evaluateOpenCodeGlobalStatus: () => ({
    status: "not_configured",
    global_config: { path: join(ownedConfig, "opencode.json"), plugin_configured: true, legacy_plugin_configured: false },
    package: { loadable: false },
  }),
}).status, "failed", "uninstall verification must reject a stale actual plugin entry even when aggregate status is not_configured");

const unownedValidatorConfig = mkdtempSync(join(tmpdir(), "agdf-opencode-uninstall-unowned-validator-"));
writeFileSync(join(unownedValidatorConfig, "opencode.json"), `${JSON.stringify({ plugin: [openCodePluginEntrypoint] })}\n`);
mkdirSync(join(unownedValidatorConfig, "agdf", "bin"), { recursive: true });
writeFileSync(join(unownedValidatorConfig, "agdf", "bin", "agdf-local.js"), "// user-owned validator\n");
writeFileSync(join(unownedValidatorConfig, "agdf", "package.json"), `${JSON.stringify({ name: "user-owned" })}\n`);
const unownedValidatorPlan = planGlobalUninstall("opencode", { configDir: unownedValidatorConfig });
assert.ok(unownedValidatorPlan.retained.includes(join(unownedValidatorConfig, "agdf", "bin", "agdf-local.js")));
assert.ok(unownedValidatorPlan.retained.includes(join(unownedValidatorConfig, "agdf", "package.json")));
assert.equal(unownedValidatorPlan.mutations.some((mutation) => mutation.kind === "remove" && mutation.path.startsWith(join(unownedValidatorConfig, "agdf"))), false);

const partialConfig = mkdtempSync(join(tmpdir(), "agdf-opencode-partial-"));
writeFileSync(join(partialConfig, "opencode.json"), `${JSON.stringify({ plugin: [pluginDefinition.opencode.npmPackage] })}\n`);
const partialPlan = planGlobalUninstall("opencode", { configDir: partialConfig });
const partialApply = applyLifecyclePlan(partialPlan, { exec() { throw new Error("npm removal failed"); } });
assert.equal(partialApply.status, "partial");
assert.equal(JSON.parse(readFileSync(join(partialConfig, "opencode.json"), "utf8")).plugin.length, 0);

const uninstallPreviewOutput = [];
assert.equal(await runCli(["uninstall", "--surface", "codex", "--scope", "global", "--json"], {
  parser: { cwd: root },
  io: { log(value) { uninstallPreviewOutput.push(value); }, error(message) { throw new Error(message); } },
}), 0);
const uninstallPreviewReport = JSON.parse(uninstallPreviewOutput[0]);
assert.equal(uninstallPreviewReport.operation_status.operation_id, "lifecycle.plugin.uninstall");
assert.equal(uninstallPreviewReport.operation_status.outcome, "preview");
assert.equal(uninstallPreviewReport.operation_status.target, null);

const uninstallApplyOutput = [];
assert.equal(await runCli(["uninstall", "--surface", "codex", "--scope", "global", "--confirm", "--json"], {
  parser: { cwd: root },
  io: { log(value) { uninstallApplyOutput.push(value); }, error(message) { throw new Error(message); } },
  exec() { return ""; },
}), 0);
const uninstallApplyReport = JSON.parse(uninstallApplyOutput[0]);
assert.equal(uninstallApplyReport.operation_status.outcome, "succeeded");
assert.equal(uninstallApplyReport.operation_status.authorizes, false);

const uninstallPartialConfig = mkdtempSync(join(tmpdir(), "agdf-opencode-cli-partial-"));
writeFileSync(join(uninstallPartialConfig, "opencode.json"), `${JSON.stringify({ plugin: [pluginDefinition.opencode.npmPackage] })}\n`);
const uninstallPartialOutput = [];
assert.equal(await runCli(["uninstall", "--surface", "opencode", "--scope", "global", "--confirm", "--json"], {
  parser: { cwd: root },
  env: { OPENCODE_CONFIG_DIR: uninstallPartialConfig },
  io: { log(value) { uninstallPartialOutput.push(value); }, error(message) { throw new Error(message); } },
  exec() { throw new Error("injected package removal failure"); },
}), 1);
const uninstallPartialReport = JSON.parse(uninstallPartialOutput[0]);
assert.equal(uninstallPartialReport.result, "partial");
assert.equal(uninstallPartialReport.operation_status.outcome, "partial");
assert.equal(uninstallPartialReport.operation_status.operation_id, "lifecycle.plugin.uninstall");

const uninstallFailureConfig = mkdtempSync(join(tmpdir(), "agdf-opencode-cli-failure-"));
writeFileSync(join(uninstallFailureConfig, "opencode.json"), "{broken\n");
const uninstallFailureOutput = [];
assert.equal(await runCli(["uninstall", "--surface", "opencode", "--scope", "global", "--json"], {
  parser: { cwd: root },
  env: { OPENCODE_CONFIG_DIR: uninstallFailureConfig },
  io: { log(value) { uninstallFailureOutput.push(value); }, error(message) { throw new Error(message); } },
}), 1);
const uninstallFailureReport = JSON.parse(uninstallFailureOutput[0]);
assert.equal(uninstallFailureReport.result, "failed");
assert.equal(uninstallFailureReport.operation_status.outcome, "failed");
assert.equal(uninstallFailureReport.operation_status.operation_id, "lifecycle.plugin.uninstall");

const evaluatorConfig = mkdtempSync(join(tmpdir(), "agdf-opencode-evaluator-agent-"));
const installedSurface = installOpenCodeGlobalSurface(evaluatorConfig);
writeFileSync(join(evaluatorConfig, "opencode.json"), `${JSON.stringify({ plugin: [pluginDefinition.opencode.npmPackage], instructions: ["AGDF.md"] })}\n`);
assert.equal(existsSync(installedSurface.evaluatorAgent), true);
assert.match(readFileSync(installedSurface.evaluatorAgent, "utf8"), /AGDF-GLOBAL-AGENT: agdf-evaluator/);
installOpenCodeGlobalSurface(evaluatorConfig);
const userAgent = join(evaluatorConfig, "agents", "user-agent.md");
writeFileSync(userAgent, "---\ndescription: user\n---\nuser-owned\n");
const evaluatorUninstall = planGlobalUninstall("opencode", { configDir: evaluatorConfig });
assert.ok(evaluatorUninstall.mutations.some((mutation) => mutation.path === installedSurface.evaluatorAgent));
assert.equal(applyLifecyclePlan(evaluatorUninstall, { exec() {} }).status, "success");
assert.equal(existsSync(installedSurface.evaluatorAgent), false);
assert.equal(existsSync(userAgent), true);

const evaluatorCollision = mkdtempSync(join(tmpdir(), "agdf-opencode-evaluator-collision-"));
mkdirSync(join(evaluatorCollision, "agents"), { recursive: true });
writeFileSync(join(evaluatorCollision, "agents", "agdf-evaluator.md"), "---\ndescription: user\n---\nunowned\n");
assert.throws(() => installOpenCodeGlobalSurface(evaluatorCollision), /unowned global OpenCode file/);
assert.equal(existsSync(join(evaluatorCollision, pluginDefinition.opencode.instructionsFileName)), false, "collision preflight must precede surface mutation");

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
assert.equal(report.operation_status.operation_id, "status.repository_delivery");
assert.deepEqual(report.operation_status.excluded_authority, ["target_inference", "run_creation", "gate_approval", "mutation"]);

let observedOpenCodeConfigDir = null;
const targetlessOpenCodeInstallation = inspectGlobalInstallationStatus({ surface: "opencode" }, {
  evaluateOpenCodeGlobalStatus(configDir) {
    observedOpenCodeConfigDir = configDir;
    return {
      status: "not_configured",
      package: { version_status: "unloadable", installed_version: null },
      global_config: { path: join(configDir, "opencode.json") },
    };
  },
});
assert.equal(observedOpenCodeConfigDir, defaultOpenCodeConfigDir());
assert.equal(targetlessOpenCodeInstallation.surface, "opencode");
assert.equal(targetlessOpenCodeInstallation.operation_status.operation_id, "status.installation.opencode");
assert.equal(targetlessOpenCodeInstallation.operation_status.target, null);
assert.equal(targetlessOpenCodeInstallation.operation_status.authorizes, false);
assert.equal(typeof targetlessOpenCodeInstallation.next_action.text, "string");

for (const surface of ["codex", "claude", "copilot"]) {
  const installationStatus = inspectGlobalInstallationStatus({ surface }, {
    inspectPluginSurface: () => ({ status: "healthy", surface, version: "1.2.3", evidence: ["fixture"] }),
  });
  assert.equal(installationStatus.operation_status.operation_id, `status.installation.${surface}`);
  assert.equal(installationStatus.operation_status.outcome, "reported");
  assert.equal(installationStatus.operation_status.target_scope, "global");
  assert.equal(installationStatus.operation_status.target, null);
  assert.equal(installationStatus.operation_status.authorizes, false);
  assert.equal(installationStatus.next_action.text, "No further installation action is required.");
}

const degradedOpenCodeInstallation = inspectGlobalInstallationStatus({ surface: "opencode", configDir: "/fixture/opencode" }, {
  evaluateOpenCodeGlobalStatus: () => ({
    status: "configured",
    global_config: { path: "/fixture/opencode/opencode.json", plugin_configured: true, legacy_plugin_configured: false },
    package: { loadable: true, version_status: "current", installed_version: pluginDefinition.version },
    global_native_surface: { present: true, complete: false },
    experimental_hooks: { aggregate: "uninspectable" },
    host_sdk_version: { status: "divergent", policy: "warn_only" },
    next_step: "Repair the incomplete OpenCode installation.",
  }),
});
assert.equal(degradedOpenCodeInstallation.status, "degraded", "healthy package/config must not erase degraded global dimensions");
assert.match(degradedOpenCodeInstallation.evidence.join("\n"), /global_native_surface:incomplete/);
assert.match(degradedOpenCodeInstallation.evidence.join("\n"), /experimental_hooks:uninspectable/);
assert.match(degradedOpenCodeInstallation.evidence.join("\n"), /host_sdk_version:divergent/);
assert.equal(degradedOpenCodeInstallation.next_action.text, "Repair the incomplete OpenCode installation.");

const canonicalOpenCodeRepository = mkdtempSync(join(tmpdir(), "agdf-opencode-status-canonical-control-"));
mkdirSync(join(canonicalOpenCodeRepository, ".agdf", "control"), { recursive: true });
writeFileSync(join(canonicalOpenCodeRepository, ".agdf", "control", "config.json"), `${JSON.stringify({
  artifact_language: "en",
  chat_language: "en",
  runtime_language: "en",
})}\n`);
const canonicalOpenCodeRepositoryStatus = evaluateGeneralStatus(canonicalOpenCodeRepository, { surface: "opencode" }, {
  inspectControlPresence: () => "absent",
  evaluateOpenCodeGlobalStatus: () => ({
    status: "configured",
    global_config: { path: "fixture", plugin_configured: true, legacy_plugin_configured: false },
    package: { loadable: true, version_status: "current", installed_version: pluginDefinition.version },
    global_native_surface: { present: true, complete: true },
    experimental_hooks: { aggregate: "declared_supported" },
    host_sdk_version: { status: "matching", policy: "warn_only" },
    next_step: "No repair required.",
  }),
});
assert.equal(canonicalOpenCodeRepositoryStatus.repository.status, "active", "canonical .agdf/control activation must not depend on legacy .opencode files");
assert.match(canonicalOpenCodeRepositoryStatus.repository.evidence.join("\n"), /control\/config\.json/);

writeFileSync(join(canonicalOpenCodeRepository, ".agdf", "control", "config.json"), "{invalid\n");
const invalidCanonicalOpenCodeRepositoryStatus = evaluateGeneralStatus(canonicalOpenCodeRepository, { surface: "opencode" }, {
  inspectControlPresence: () => "absent",
  evaluateOpenCodeGlobalStatus: () => ({
    status: "configured",
    global_config: { path: "fixture", plugin_configured: true, legacy_plugin_configured: false },
    package: { loadable: true, version_status: "current", installed_version: pluginDefinition.version },
    global_native_surface: { present: true, complete: true },
    experimental_hooks: { aggregate: "declared_supported" },
    host_sdk_version: { status: "matching", policy: "warn_only" },
  }),
});
assert.equal(invalidCanonicalOpenCodeRepositoryStatus.repository.status, "degraded");

const autoSelected = evaluateGeneralStatus(statusRoot, {}, {
  inspectPluginSurface: (surface) => ({ status: surface === "claude" ? "healthy" : "not_installed", surface, version: surface === "claude" ? "1.2.3" : null, evidence: [surface] }),
  evaluateOpenCodeGlobalStatus: () => ({ status: "not_configured", package: { version_status: "unloadable", installed_version: null }, global_config: { path: "fixture" } }),
});
assert.equal(autoSelected.installation.surface, "claude");
const ambiguousSurface = evaluateGeneralStatus(statusRoot, {}, {
  inspectPluginSurface: (surface) => ({ status: "healthy", surface, version: "1.2.3", evidence: [surface] }),
  evaluateOpenCodeGlobalStatus: () => ({ status: "not_configured", package: { version_status: "unloadable", installed_version: null }, global_config: { path: "fixture" } }),
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

const presenceRoot = mkdtempSync(join(tmpdir(), "agdf-control-presence-"));
assert.equal(inspectControlPresence(presenceRoot), "absent");
mkdirSync(join(presenceRoot, ".agdf", "control"), { recursive: true });
assert.equal(inspectControlPresence(presenceRoot), "candidate_present");

const statusCallbacks = [];
const targetlessOverview = evaluateStatusOverview({ surface: "codex" }, {
  inspectPluginSurface: (surface) => {
    statusCallbacks.push("installation_status_owner");
    return { status: "healthy", surface, version: "1.2.3", evidence: ["fixture"] };
  },
  inspectControlPresence: () => { statusCallbacks.push("control_presence"); throw new Error("targetless status must not inspect control"); },
  evaluateDoctor: () => { statusCallbacks.push("control_evaluator:doctor"); throw new Error("targetless status must not run doctor"); },
  evaluateGateCheck: () => { statusCallbacks.push("control_evaluator:gate"); throw new Error("targetless status must not run gate-check"); },
});
assert.deepEqual(statusCallbacks, ["installation_status_owner"]);
assert.deepEqual(targetlessOverview.operation_status, {
  operation_id: "status.overview",
  outcome: "reported",
  target_scope: "global",
  target: null,
  planned_effect: "read_only_status",
  excluded_authority: ["target_inference", "run_creation", "gate_approval", "mutation"],
  authorizes: false,
});
assert.equal(targetlessOverview.repository.status, "unresolved");
assert.equal(targetlessOverview.delivery.status, "unresolved");
assert.match(targetlessOverview.next_action.text, /explicit --dir/);

const targetStatusCallbacks = [];
const explicitOverview = evaluateStatusOverview({ surface: "codex", targetDir: statusRoot }, {
  inspectPluginSurface: (surface) => {
    targetStatusCallbacks.push("installation_status_owner");
    return { status: "healthy", surface, version: "1.2.3", evidence: ["fixture"] };
  },
  inspectControlPresence: () => { targetStatusCallbacks.push("control_presence"); return "absent"; },
  evaluateDoctor: () => { targetStatusCallbacks.push("control_evaluator:doctor"); throw new Error("must not run without candidate control"); },
  evaluateGateCheck: () => { targetStatusCallbacks.push("control_evaluator:gate"); throw new Error("must not run without candidate control"); },
});
assert.deepEqual(targetStatusCallbacks, ["installation_status_owner", "control_presence"]);
assert.equal(explicitOverview.operation_status.target, statusRoot);
assert.equal(explicitOverview.repository.status, "not_configured");
assert.equal(explicitOverview.delivery.status, "not_configured");

const configuredStatusCallbacks = [];
const configuredOverview = evaluateStatusOverview({ surface: "codex", targetDir: blockedRoot }, {
  inspectPluginSurface: (surface) => {
    configuredStatusCallbacks.push("installation_status_owner");
    return { status: "healthy", surface, version: "1.2.3", evidence: ["fixture"] };
  },
  inspectControlPresence: () => { configuredStatusCallbacks.push("control_presence"); return "candidate_present"; },
  evaluateDoctor: () => { configuredStatusCallbacks.push("control_evaluator:doctor"); return { status: "warn" }; },
  evaluateGateCheck: () => { configuredStatusCallbacks.push("control_evaluator:gate"); return { status: "open", current_gate: "TP" }; },
});
assert.deepEqual(configuredStatusCallbacks, ["installation_status_owner", "control_presence", "control_evaluator:doctor", "control_evaluator:gate"]);
assert.equal(configuredOverview.delivery.status, "open");

const handlerCalls = [];
const handlerOutput = [];
const statusResult = {
  schema_version: 1,
  operation_status: {
    operation_id: "status.overview",
    outcome: "reported",
    target_scope: "global",
    target: null,
    planned_effect: "read_only_status",
    excluded_authority: ["target_inference", "run_creation", "gate_approval", "mutation"],
    authorizes: false,
  },
  installation: { status: "healthy", surface: "codex", version: "1.2.3", evidence: [] },
  repository: { status: "unresolved", scope: "repository", evidence: [] },
  delivery: { status: "unresolved", run_id: null, current_gate: null, evidence: [] },
  runtime_checks: { requested: "unknown", effective: "unavailable", reason: "fixture" },
  next_action: { kind: "action", text: "Provide a target." },
};
assert.equal(await runCli(["status", "--surface", "codex", "--json"], {
  parser: { cwd: statusRoot },
  io: { log(value) { handlerOutput.push(value); }, error(message) { throw new Error(message); } },
  evaluateStatusOverview(options) { handlerCalls.push(options); return statusResult; },
}), 0);
assert.equal(handlerCalls[0].targetDir, null, "parser cwd must not become status target authority");
assert.equal(JSON.parse(handlerOutput[0]).repository.status, "unresolved");

assert.equal(await runCli(["status", "--surface", "codex", "--dir", blockedRoot, "--json"], {
  parser: { cwd: statusRoot },
  io: { log() {}, error(message) { throw new Error(message); } },
  evaluateStatusOverview(options) { handlerCalls.push(options); return { ...statusResult, operation_status: { ...statusResult.operation_status, target_scope: "repository", target: options.targetDir } }; },
}), 0);
assert.equal(handlerCalls[1].targetDir, blockedRoot);

const openCodeStatusConfig = mkdtempSync(join(tmpdir(), "agdf-opencode-cli-config-"));
const decoyOpenCodeCwd = mkdtempSync(join(tmpdir(), "agdf-opencode-cli-decoy-"));
const explicitOpenCodeTarget = mkdtempSync(join(tmpdir(), "agdf-opencode-cli-target-"));
const targetlessOpenCodeCalls = [];
const targetlessOpenCodeOutput = [];
const openCodeStatusFixture = {
  schema_version: "1",
  status: "configured",
  global_config: { path: join(openCodeStatusConfig, "opencode.json"), plugin_configured: true, legacy_plugin_configured: false },
  package: { loadable: true, installed_version: pluginDefinition.version, version_status: "current" },
  global_native_surface: { present: true, complete: true },
  experimental_hooks: { aggregate: "declared_supported" },
  host_sdk_version: { status: "matching", policy: "warn_only" },
  findings: [],
  next_step: "Global OpenCode installation is current.",
};
assert.equal(await runCli(["opencode-status", "--json"], {
  parser: { cwd: decoyOpenCodeCwd },
  env: { OPENCODE_CONFIG_DIR: openCodeStatusConfig },
  io: { log(value) { targetlessOpenCodeOutput.push(value); }, error(message) { throw new Error(message); } },
  evaluateOpenCodeGlobalStatus(configDir) {
    targetlessOpenCodeCalls.push(["global", configDir]);
    return openCodeStatusFixture;
  },
  evaluateOpenCodeStatus() {
    targetlessOpenCodeCalls.push(["repository"]);
    throw new Error("targetless opencode-status must not invoke repository status");
  },
}), 0);
assert.deepEqual(targetlessOpenCodeCalls, [["global", openCodeStatusConfig]]);
const targetlessOpenCodeReport = JSON.parse(targetlessOpenCodeOutput[0]);
assert.deepEqual(targetlessOpenCodeReport.operation_status, {
  operation_id: "status.installation.opencode",
  outcome: "reported",
  target_scope: "global",
  target: null,
  planned_effect: "read_only_status",
  excluded_authority: ["target_inference", "run_creation", "gate_approval", "mutation"],
  authorizes: false,
});
assert.equal(targetlessOpenCodeReport.installation_status, "healthy");
assert.equal(JSON.stringify(targetlessOpenCodeReport).includes(decoyOpenCodeCwd), false, "parser cwd must not leak into targetless OpenCode status");

const degradedOpenCodeStatusOutput = [];
assert.equal(await runCli(["opencode-status", "--json"], {
  parser: { cwd: decoyOpenCodeCwd },
  env: { OPENCODE_CONFIG_DIR: openCodeStatusConfig },
  io: { log(value) { degradedOpenCodeStatusOutput.push(value); }, error(message) { throw new Error(message); } },
  evaluateOpenCodeGlobalStatus: () => ({
    ...openCodeStatusFixture,
    global_native_surface: { present: true, complete: false },
    next_step: "Repair the incomplete global native surface.",
  }),
}), 1, "configured OpenCode state with a degraded dimension must not return a successful status exit code");
const degradedOpenCodeStatusReport = JSON.parse(degradedOpenCodeStatusOutput[0]);
assert.equal(degradedOpenCodeStatusReport.status, "configured", "raw status remains the OpenCode configuration state");
assert.equal(degradedOpenCodeStatusReport.installation_status, "degraded");
assert.equal(degradedOpenCodeStatusReport.next_action.text, "Repair the incomplete global native surface.");

const repositoryOpenCodeCalls = [];
const repositoryOpenCodeOutput = [];
assert.equal(await runCli(["opencode-status", "--dir", explicitOpenCodeTarget, "--json"], {
  parser: { cwd: decoyOpenCodeCwd },
  env: { OPENCODE_CONFIG_DIR: openCodeStatusConfig },
  io: { log(value) { repositoryOpenCodeOutput.push(value); }, error(message) { throw new Error(message); } },
  evaluateOpenCodeGlobalStatus() {
    throw new Error("explicit OpenCode repository status must use its repository owner");
  },
  evaluateOpenCodeStatus(targetDir, configDir) {
    repositoryOpenCodeCalls.push([targetDir, configDir]);
    return openCodeStatusFixture;
  },
}), 0);
assert.deepEqual(repositoryOpenCodeCalls, [[explicitOpenCodeTarget, openCodeStatusConfig]]);
assert.deepEqual(JSON.parse(repositoryOpenCodeOutput[0]).operation_status, {
  operation_id: "status.opencode_repository",
  outcome: "reported",
  target_scope: "repository",
  target: explicitOpenCodeTarget,
  planned_effect: "read_only_status",
  excluded_authority: ["target_inference", "run_creation", "gate_approval", "mutation"],
  authorizes: false,
});

const openCodeInstallCalls = [];
const openCodeInstallOutput = [];
const openCodeInstallData = mkdtempSync(join(tmpdir(), "agdf-opencode-install-data-"));
assert.equal(await runCli(["opencode", "--dir", openCodeStatusConfig, "--json", "--runtime-checks", "manual"], {
  parser: { cwd: decoyOpenCodeCwd },
  env: { AGDF_DATA_DIR: openCodeInstallData },
  io: { log(value) { openCodeInstallOutput.push(value); }, error(message) { throw new Error(message); } },
  installOpenCodeGlobalPlugin(configDir) {
    openCodeInstallCalls.push(["install", configDir]);
    return {
      transition: { status: "installed", previous_version: null, installed_version: pluginDefinition.version },
      sdk_alignment: { status: "aligned", target_version: "1.18.3", installed_version: "1.18.3" },
      installed_package: { root: join(configDir, "node_modules", "create-agdf"), digest: "a".repeat(64) },
      package_source: { kind: "registry", digest: "a".repeat(64) },
    };
  },
  installOpenCodeGlobalSurface(configDir) {
    openCodeInstallCalls.push(["surface", configDir]);
    return {};
  },
  evaluateOpenCodeGlobalStatus(configDir) {
    openCodeInstallCalls.push(["global_status", configDir]);
    return {
      status: "configured",
      global_config: { path: join(configDir, "opencode.json") },
      package: { expected_version: pluginDefinition.version, installed_version: pluginDefinition.version, version_status: "current" },
      global_native_surface: { complete: true, path: join(configDir, "skills") },
      experimental_hooks: { aggregate: "declared_supported" },
      host_sdk_version: { status: "matching", policy: "warn_only" },
      host: { installed_version: "1.18.3" },
      plugin_sdk: { installed_version: "1.18.3" },
    };
  },
  evaluateOpenCodeStatus() {
    openCodeInstallCalls.push(["repository_status"]);
    throw new Error("global OpenCode installation verification must not invoke repository status");
  },
}), 0);
assert.deepEqual(openCodeInstallCalls, [
  ["install", openCodeStatusConfig],
  ["surface", openCodeStatusConfig],
  ["global_status", openCodeStatusConfig],
]);
const openCodeInstallReport = JSON.parse(openCodeInstallOutput[0]);
assert.equal(openCodeInstallReport.operation_status.operation_id, "lifecycle.plugin.install.opencode");
assert.equal(openCodeInstallReport.operation_status.target_scope, "global");
assert.equal(openCodeInstallReport.operation_status.target, null);
assert.equal(openCodeInstallReport.operation_status.authorizes, false);

const cancelledInstallOutput = [];
assert.equal(await runCli(["opencode", "--json", "--runtime-checks", "cancel"], {
  parser: { cwd: decoyOpenCodeCwd },
  io: { log(value) { cancelledInstallOutput.push(value); }, error(message) { throw new Error(message); } },
  installOpenCodeGlobalPlugin() { throw new Error("cancel must stop before plugin installation"); },
}), 0);
const cancelledInstallReport = JSON.parse(cancelledInstallOutput[0]);
assert.equal(cancelledInstallReport.operation_status.operation_id, "lifecycle.plugin.install.opencode");
assert.equal(cancelledInstallReport.operation_status.outcome, "preview");

const failedInstallOutput = [];
assert.equal(await runCli(["opencode", "--json", "--runtime-checks", "manual"], {
  parser: { cwd: decoyOpenCodeCwd },
  io: { log(value) { failedInstallOutput.push(value); }, error() {} },
  installOpenCodeGlobalPlugin() { throw new Error("injected install failure"); },
}), 1);
const failedInstallReport = JSON.parse(failedInstallOutput[0]);
assert.equal(failedInstallReport.result, "failed");
assert.equal(failedInstallReport.operation_status.outcome, "failed");
assert.equal(failedInstallReport.operation_status.operation_id, "lifecycle.plugin.install.opencode");

const runtimeChecksOutput = [];
assert.equal(await runCli(["runtime-checks", "status", "--surface", "codex", "--json"], {
  parser: { cwd: decoyOpenCodeCwd },
  env: { AGDF_DATA_DIR: openCodeInstallData },
  io: { log(value) { runtimeChecksOutput.push(value); }, error(message) { throw new Error(message); } },
}), 1);
const runtimeChecksReport = JSON.parse(runtimeChecksOutput[0]);
assert.equal(runtimeChecksReport.operation_status.operation_id, "runtime.checks");
assert.equal(runtimeChecksReport.operation_status.outcome, "reported");
assert.equal(runtimeChecksReport.operation_status.target, null);
assert.equal(runtimeChecksReport.operation_status.authorizes, false);
assert.equal(typeof runtimeChecksReport.next_action.text, "string");

const activationRoot = mkdtempSync(join(tmpdir(), "agdf-opencode-activation-"));
assert.equal(evaluateOpenCodeRepositoryActivation(activationRoot).state, "inactive");
mkdirSync(join(activationRoot, ".agdf", "control"), { recursive: true });
writeFileSync(join(activationRoot, ".agdf", "control", "config.json"), "{invalid\n");
assert.equal(evaluateOpenCodeRepositoryActivation(activationRoot).state, "invalid_control");
writeFileSync(join(activationRoot, ".agdf", "control", "config.json"), JSON.stringify({ artifact_language: "en", chat_language: "en", runtime_language: "en" }));
assert.equal(evaluateOpenCodeRepositoryActivation(activationRoot).state, "active");
mkdirSync(join(activationRoot, ".opencode", "skills", "agdf-gate-check"), { recursive: true });
writeFileSync(join(activationRoot, ".opencode", "AGDF.md"), "legacy\n");
writeFileSync(join(activationRoot, ".opencode", "skills", "agdf-gate-check", "SKILL.md"), "legacy\n");
assert.equal(evaluateOpenCodeRepositoryActivation(activationRoot).state, "legacy_compatible");

const pluginLogs = [];
const manualRuntimeCheck = () => ({ requested: "manual", effective: "manual", reason: "consent_not_provided", ran: false, output: "" });
const hooks = await AGDFPlugin(
  { directory: activationRoot, client: { app: { log: async (entry) => pluginLogs.push(entry) } } },
  { executeAutomaticRuntimeCheck: manualRuntimeCheck },
);
const activeSystem = { system: [] };
await hooks["experimental.chat.system.transform"]({}, activeSystem);
assert.equal(activeSystem.system.length, 1);
const [activeBindingLine, activeFactsLine] = activeSystem.system[0].split("\n");
assert.match(activeBindingLine, /^AGDF dispatcher binding: /);
assert.deepEqual(JSON.parse(activeFactsLine.slice("AGDF runtime facts: ".length)), { active: true, version: pluginDefinition.version });
assert.doesNotMatch(activeSystem.system[0], /agdf-global-gate-check|AGDF-REQUEST-ACTIVATION-GUARD/);
await hooks["experimental.chat.system.transform"]({}, null);
await hooks["experimental.session.compacting"]({}, { context: null });
assert.ok(pluginLogs.some((entry) => (entry.body ?? entry).level === "warn" && /context degraded/.test((entry.body ?? entry).message)));
const activeEnvironment = { env: {} };
await hooks["shell.env"]({}, activeEnvironment);
assert.equal(activeEnvironment.env.AGDF_PLUGIN_ACTIVE, "1");
assert.equal(activeEnvironment.env.AGDF_OPENCODE_REPOSITORY_ACTIVATION, "legacy_compatible");

const inactiveRoot = mkdtempSync(join(tmpdir(), "agdf-opencode-inactive-"));
const inactiveHooks = await AGDFPlugin(
  { directory: inactiveRoot, client: { app: { log: async (entry) => pluginLogs.push(entry) } } },
  { executeAutomaticRuntimeCheck: manualRuntimeCheck },
);
const inactiveSystem = { system: [] };
await inactiveHooks["experimental.chat.system.transform"]({}, inactiveSystem);
assert.deepEqual(inactiveSystem.system, []);
const inactiveEnvironment = { env: {} };
await inactiveHooks["shell.env"]({}, inactiveEnvironment);
assert.equal(inactiveEnvironment.env.AGDF_PLUGIN_ACTIVE, "0");

console.log("lifecycle tests passed");
