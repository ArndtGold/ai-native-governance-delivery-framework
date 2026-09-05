import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { generatedRoot, packageRoot, pluginDefinition } from "../lib/cli/runtime-context.js";
import { digestNormalizedPluginSource } from "../lib/runtime/plugin-provenance.js";
import { runtimeCheckCapabilityIdentity, validateRuntimeCheckCapability } from "../lib/runtime-check-consent/contract.js";
import {
  applyClaudeExactRule,
  claudePermissionRule,
  codexRuntimeCheckEvidence,
  openCodeRuntimeCheckEvidence,
  revokeClaudeExactRule,
} from "../lib/runtime-check-consent/adapters.js";
import { consentDisclosure, resolveRuntimeCheckDecision } from "../lib/runtime-check-consent/coordinator.js";
import { configureClaudeExactRuntimeRule, revokeClaudeRuntimeRule } from "../lib/runtime-check-consent/claude-settings.js";
import { executeOpenCodeAutomaticRuntimeCheck, fixedRuntimeCheckCommand, persistInstallConsent, retainCurrentInstallConsent, runtimeCheckStatus, setRuntimeChecksManual } from "../lib/runtime-check-consent/service.js";
import {
  createRuntimeCheckReceipt,
  deriveRuntimeCheckState,
  readRuntimeCheckReceipt,
  writeRuntimeCheckReceipt,
} from "../lib/runtime-check-consent/state.js";
import { syncPluginRuntime } from "./sync-plugin-runtime.js";

const capability = validateRuntimeCheckCapability(pluginDefinition.automaticRuntimeChecks);
assert.throws(() => validateRuntimeCheckCapability({ ...capability, operations: [...capability.operations, "write"] }), /closed operation/);
assert.throws(() => validateRuntimeCheckCapability({ ...capability, constraints: { ...capability.constraints, network: "allowed" } }), /read-only/);

const identityInput = { capability, surface: "claude", runtimeDigest: "a".repeat(64), sourceDigest: "b".repeat(64), command: "node /exact/check.js" };
const identity = runtimeCheckCapabilityIdentity(identityInput);
assert.match(identity, /^[a-f0-9]{64}$/);
for (const mutation of [
  { runtimeDigest: "c".repeat(64) }, { sourceDigest: "d".repeat(64) }, { command: "node /other/check.js" },
  { capability: { ...capability, adapterContractVersion: 2 } },
]) assert.notEqual(runtimeCheckCapabilityIdentity({ ...identityInput, ...mutation }), identity);

assert.equal(resolveRuntimeCheckDecision({ explicitValue: "enable" }), "enable");
assert.equal(resolveRuntimeCheckDecision({ interactive: false }), "manual");
assert.equal(resolveRuntimeCheckDecision({ interactive: true, ask: () => "" }), "cancel");
assert.throws(() => resolveRuntimeCheckDecision({ explicitValue: "yes" }), /DECISION_INVALID/);
assert.equal(consentDisclosure("claude").network, "none");
assert.equal(fixedRuntimeCheckCommand("claude", "/ignored", "darwin"), "node \"${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/runtime/agdf-session-check.js\"");
assert.equal(fixedRuntimeCheckCommand("claude", "C:\\ignored", "win32"), "node \"$([Environment]::GetEnvironmentVariable('PLUGIN_ROOT') + [Environment]::GetEnvironmentVariable('CLAUDE_PLUGIN_ROOT'))\\runtime\\agdf-session-check.js\"");
assert.equal(fixedRuntimeCheckCommand("copilot", "/ignored", "darwin"), 'node "${PLUGIN_ROOT}/runtime/agdf-session-check.js"');
assert.equal(consentDisclosure("copilot").permission_owner, "GitHub Copilot plugin hook review");
assert.match(consentDisclosure("claude").revocation, /runtime-checks manual/);

const root = mkdtempSync(join(tmpdir(), "agdf-runtime-check-consent-"));
try {
  const receipt = createRuntimeCheckReceipt({ surface: "claude", decision: "enable", capabilityIdentity: identity, command: identityInput.command });
  const path = writeRuntimeCheckReceipt(root, receipt);
  assert.deepEqual(readRuntimeCheckReceipt(root, "claude").receipt, receipt);
  assert.equal(readRuntimeCheckReceipt(root, "codex").status, "receipt_missing");
  assert.equal(deriveRuntimeCheckState({ receiptResult: readRuntimeCheckReceipt(root, "claude"), surface: "claude", capabilityIdentity: identity, hostEvidence: { status: "decision_required" } }).effective, "decision_required");
  assert.equal(deriveRuntimeCheckState({ receiptResult: readRuntimeCheckReceipt(root, "claude"), surface: "claude", capabilityIdentity: identity, hostEvidence: { status: "enabled", capability_identity: identity } }).effective, "enabled");
  assert.equal(deriveRuntimeCheckState({ receiptResult: readRuntimeCheckReceipt(root, "claude"), surface: "claude", capabilityIdentity: `${identity.slice(0, -1)}0`, hostEvidence: {} }).effective, "renewal_required");
  writeFileSync(path, "{}\n");
  assert.equal(readRuntimeCheckReceipt(root, "claude").status, "receipt_unowned");
} finally {
  rmSync(root, { recursive: true, force: true });
}

const retainedRoot = mkdtempSync(join(tmpdir(), "agdf-runtime-check-retained-"));
try {
  const generatedPluginRoot = join(generatedRoot, "plugins", "agdf");
  const manifest = JSON.parse(readFileSync(join(generatedPluginRoot, "runtime", "runtime-manifest.json"), "utf8"));
  const sourceDigest = digestNormalizedPluginSource(generatedPluginRoot, pluginDefinition.version);
  const command = fixedRuntimeCheckCommand("claude", generatedPluginRoot, "darwin");
  const capabilityIdentity = runtimeCheckCapabilityIdentity({ capability, surface: "claude", runtimeDigest: manifest.digest, sourceDigest, command });
  writeRuntimeCheckReceipt(retainedRoot, createRuntimeCheckReceipt({ surface: "claude", decision: "enable", capabilityIdentity, command }));
  assert.deepEqual(retainCurrentInstallConsent("claude", retainedRoot, "darwin")?.decision, "enable");
  assert.equal(runtimeCheckStatus(retainedRoot, "claude", "darwin").effective, "decision_required");
  assert.equal(runtimeCheckStatus(retainedRoot, "claude", "win32").effective, "renewal_required");
  assert.equal(retainCurrentInstallConsent("opencode", retainedRoot, "darwin"), null);
  const copilotCommand = fixedRuntimeCheckCommand("copilot", generatedPluginRoot, "darwin");
  const copilotIdentity = runtimeCheckCapabilityIdentity({ capability, surface: "copilot", runtimeDigest: manifest.digest, sourceDigest, command: copilotCommand });
  writeRuntimeCheckReceipt(retainedRoot, createRuntimeCheckReceipt({ surface: "copilot", decision: "enable", capabilityIdentity: copilotIdentity, command: copilotCommand }));
  assert.equal(retainCurrentInstallConsent("copilot", retainedRoot, "win32")?.decision, "enable", "Copilot hook command identity is platform independent");
} finally {
  rmSync(retainedRoot, { recursive: true, force: true });
}

const bashRule = claudePermissionRule({ platform: "darwin", command: "node /exact/check.js" });
const powerShellRule = claudePermissionRule({ platform: "win32", command: "node C:\\AGDF\\check.js" });
assert.equal(bashRule, "Bash(node /exact/check.js)");
assert.equal(powerShellRule, "PowerShell(node C:\\AGDF\\check.js)");
assert.throws(() => claudePermissionRule({ platform: "darwin", command: "node *" }), /NOT_EXACT/);
const original = { permissions: { allow: ["Read(/safe)"], deny: ["Bash(rm *)"] }, user: { retained: true } };
const applied = applyClaudeExactRule(original, { rule: bashRule });
assert.deepEqual(original.permissions.allow, ["Read(/safe)"]);
assert.deepEqual(applied.settings.permissions.allow, ["Read(/safe)", bashRule]);
assert.deepEqual(revokeClaudeExactRule(applied.settings, bashRule).permissions.allow, ["Read(/safe)"]);
assert.equal(applyClaudeExactRule(original, { rule: bashRule, ask: [bashRule] }).status, "degraded");

const settingsRoot = mkdtempSync(join(tmpdir(), "agdf-claude-settings-"));
try {
  const settingsPath = join(settingsRoot, "settings.json");
  writeFileSync(settingsPath, `${JSON.stringify(original)}\n`);
  const configured = configureClaudeExactRuntimeRule({ path: settingsPath, rule: bashRule });
  assert.equal(configured.status, "configured");
  assert.deepEqual(JSON.parse(readFileSync(settingsPath, "utf8")).permissions.allow, ["Read(/safe)", bashRule]);
  configured.rollback();
  assert.deepEqual(JSON.parse(readFileSync(settingsPath, "utf8")), original);
  configureClaudeExactRuntimeRule({ path: settingsPath, rule: bashRule });
  revokeClaudeRuntimeRule({ path: settingsPath, rule: bashRule });
  assert.deepEqual(JSON.parse(readFileSync(settingsPath, "utf8")).permissions.allow, ["Read(/safe)"]);

  const consentRoot = join(settingsRoot, "data");
  const runtimeCommand = fixedRuntimeCheckCommand("claude", "/ignored", "darwin");
  const consentState = persistInstallConsent({
    surface: "claude",
    decision: "enable",
    installed: { pluginRoot: "/installed", digest: "a".repeat(64), sourceDigest: "b".repeat(64) },
    dataRoot: consentRoot,
    platform: "darwin",
    claudeSettingsPath: settingsPath,
  });
  assert.equal(consentState.effective, "decision_required");
  assert.ok(JSON.parse(readFileSync(settingsPath, "utf8")).permissions.allow.includes(`Bash(${runtimeCommand})`));
  assert.equal(setRuntimeChecksManual({ dataRoot: consentRoot, surface: "claude", platform: "darwin", claudeSettingsPath: settingsPath }).effective, "manual");
  assert.equal(JSON.parse(readFileSync(settingsPath, "utf8")).permissions.allow.includes(`Bash(${runtimeCommand})`), false);

  writeRuntimeCheckReceipt(consentRoot, createRuntimeCheckReceipt({
    surface: "opencode",
    decision: "enable",
    capabilityIdentity: "c".repeat(64),
    command: "node /installed/runtime/agdf-session-check.js",
  }));
  const openCodeManual = setRuntimeChecksManual({ dataRoot: consentRoot, surface: "opencode", platform: "darwin" });
  assert.equal(openCodeManual.effective, "manual");
  assert.equal(openCodeManual.mutation, "receipt_updated");

  const failingRoot = join(settingsRoot, "failing-data");
  const failingRuntimeChecks = join(failingRoot, "runtime-checks");
  mkdirSync(failingRoot);
  writeFileSync(failingRuntimeChecks, "blocks-directory\n");
  assert.throws(() => persistInstallConsent({
    surface: "claude",
    decision: "enable",
    installed: { pluginRoot: "/installed", digest: "a".repeat(64), sourceDigest: "b".repeat(64) },
    dataRoot: failingRoot,
    platform: "darwin",
    claudeSettingsPath: settingsPath,
  }));
  assert.equal(JSON.parse(readFileSync(settingsPath, "utf8")).permissions.allow.includes(`Bash(${runtimeCommand})`), false, "receipt failure must roll back the exact Claude rule");
} finally {
  rmSync(settingsRoot, { recursive: true, force: true });
}

assert.equal(codexRuntimeCheckEvidence({ capabilityIdentity: identity, observedIdentity: identity, hookEnabled: true }).status, "enabled");
assert.equal(codexRuntimeCheckEvidence({ capabilityIdentity: identity, observedIdentity: "old", hookEnabled: true }).status, "renewal_required");
assert.equal(openCodeRuntimeCheckEvidence({ capabilityIdentity: identity, observedIdentity: identity, packageLoadable: true, hookObserved: false }).status, "degraded");

const automaticOutput = "AGDF active.\n\nAGDF automatic runtime check: status=pass findings=0.";
const automaticCheck = executeOpenCodeAutomaticRuntimeCheck({
  directory: process.cwd(),
  packageRoot: process.cwd(),
  statusResolver: () => ({ requested: "enabled", effective: "decision_required", reason: "host_permission_unverified", capability_identity: identity }),
  entrypointExists: () => true,
  executable: "fixture-node",
  run(file, args, options) {
    assert.equal(file, "fixture-node");
    assert.equal(args.length, 1);
    assert.equal(options.cwd, process.cwd());
    assert.equal(options.env.AGDF_SURFACE, "opencode");
    assert.deepEqual(options.stdio, ["ignore", "pipe", "pipe"]);
    return { status: 0, stdout: automaticOutput, stderr: "" };
  },
});
assert.equal(automaticCheck.effective, "enabled");
assert.equal(automaticCheck.verification, "host_observed");
assert.equal(automaticCheck.ran, true);
assert.match(automaticCheck.output, /automatic runtime check/);
const manualAutomaticCheck = executeOpenCodeAutomaticRuntimeCheck({
  statusResolver: () => ({ requested: "manual", effective: "manual", reason: "consent_not_provided" }),
  run() { throw new Error("manual mode must not execute"); },
});
assert.equal(manualAutomaticCheck.ran, false);

const runtimeProjectionTemp = mkdtempSync(join(tmpdir(), "agdf-runtime-projection-"));
const projectedPluginRoot = join(runtimeProjectionTemp, "agdf");
cpSync(join(packageRoot, "..", "plugin"), projectedPluginRoot, { recursive: true });
syncPluginRuntime({ outputRoot: join(projectedPluginRoot, "runtime") });
const generatedEntrypoint = join(projectedPluginRoot, "runtime", "agdf-session-check.js");
const generatedSessionCheck = readFileSync(generatedEntrypoint, "utf8");
assert.match(generatedSessionCheck, /process\.argv\.length !== 2/);
assert.match(generatedSessionCheck, /receipt\?\.requested_state === "enabled"/);
assert.doesNotMatch(generatedSessionCheck, /writeFile|appendFile|fetch\(|https?:\/\//);
const activationContract = readFileSync(join(packageRoot, "..", "plugin", "meta", "contracts", "request-activation.md"), "utf8").replaceAll("\r\n", "\n").replaceAll("\r", "\n");
const activationStart = "<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->";
const activationEnd = "<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->";
const activationKernel = activationContract.slice(
  activationContract.indexOf(activationStart),
  activationContract.indexOf(activationEnd) + activationEnd.length,
);

function parseSessionStartContext(rawContext) {
  const context = rawContext.replace(/\n$/, "");
  const bindingPrefix = "\n\nAGDF dispatcher binding: ";
  const bindingStart = context.indexOf(bindingPrefix);
  assert.ok(bindingStart > 0, "SessionStart context must contain exactly one dispatcher binding after the kernel");
  const factsPrefix = "\n\nAGDF runtime facts: ";
  const factsStart = context.indexOf(factsPrefix, bindingStart + bindingPrefix.length);
  const bindingJson = context.slice(
    bindingStart + bindingPrefix.length,
    factsStart < 0 ? context.length : factsStart,
  );
  return {
    kernel: context.slice(0, bindingStart),
    binding: JSON.parse(bindingJson),
    facts: factsStart < 0 ? null : JSON.parse(context.slice(factsStart + factsPrefix.length)),
    supplement: factsStart < 0 ? "" : context.slice(factsStart + 2),
  };
}

const entrypointDataRoot = mkdtempSync(join(tmpdir(), "agdf-entrypoint-consent-"));
try {
  const withoutConsent = spawnSync(process.execPath, [generatedEntrypoint], {
    cwd: process.cwd(), encoding: "utf8", env: { ...process.env, AGDF_DATA_DIR: entrypointDataRoot, AGDF_SURFACE: "codex" },
  });
  assert.equal(withoutConsent.status, 0, withoutConsent.stderr);
  const base = parseSessionStartContext(withoutConsent.stdout);
  assert.equal(base.kernel, activationKernel, "SessionStart must embed the canonical kernel byte-for-byte exactly once");
  assert.equal(base.facts, null, "runtime facts require exact automatic-check consent");
  assert.deepEqual(Object.keys(base.binding), ["schema_version", "executable", "argv_prefix", "expected_version", "request_activation", "route_source_after_activation", "authorizes"]);
  assert.deepEqual(base.binding.argv_prefix.slice(1), ["skill-dispatch", "--json", "--surface", "codex"]);
  assert.deepEqual(base.binding.request_activation, {
    owner: "request_activation_contract",
    policy_version: 1,
    guard_fingerprint: "sha256:50833bf7396f65e57ffd73bb9200e6dfd5dc016440e6d7186fbcd8a6e07dd2ab",
  });
  assert.deepEqual(base.binding.route_source_after_activation, {
    relative_to: "validator_directory",
    path: "../meta/contracts/request-activation.md",
  });
  const routeSourcePath = resolve(dirname(base.binding.argv_prefix[0]), base.binding.route_source_after_activation.path);
  assert.equal(realpathSync(routeSourcePath), realpathSync(join(projectedPluginRoot, "meta", "contracts", "request-activation.md")));
  assert.equal(readFileSync(routeSourcePath, "utf8").replaceAll("\r\n", "\n").replaceAll("\r", "\n"), activationContract);
  assert.equal(base.binding.authorizes, false);
  const normalizedBase = withoutConsent.stdout
    .replaceAll(base.binding.executable, "<executable>")
    .replaceAll(base.binding.argv_prefix[0], "<validator>");
  assert.ok(Buffer.byteLength(normalizedBase, "utf8") <= 1900, "normalized SessionStart base must stay within budget");
  assert.equal(withoutConsent.stdout.split(activationStart).length - 1, 1);
  assert.equal(withoutConsent.stdout.split("AGDF dispatcher binding:").length - 1, 1);
  assert.doesNotMatch(withoutConsent.stdout, /AGDF runtime facts:|Automatic repository checks|Project config:|Language policy:|Source of truth:|Obey result\.host_action/);

  const wrapperOutput = spawnSync("bash", [join(projectedPluginRoot, "hooks", "session-start.sh")], {
    cwd: process.cwd(), encoding: "utf8", env: { ...process.env, AGDF_DATA_DIR: entrypointDataRoot, AGDF_SURFACE: "codex" },
  });
  assert.equal(wrapperOutput.status, 0, wrapperOutput.stderr);
  assert.equal(wrapperOutput.stdout, withoutConsent.stdout, "SessionStart shell helper must be a policy-free transport wrapper");
  const sourceWrapperOutput = spawnSync("bash", [join(packageRoot, "..", "plugin", "hooks", "session-start.sh")], {
    cwd: process.cwd(), encoding: "utf8", env: { ...process.env, AGDF_SURFACE: "source" },
  });
  assert.equal(sourceWrapperOutput.status, 0, sourceWrapperOutput.stderr);
  assert.equal(sourceWrapperOutput.stdout, "AGDF SessionStart transport unavailable: generated runtime entrypoint not found.\n");
  writeRuntimeCheckReceipt(entrypointDataRoot, createRuntimeCheckReceipt({
    surface: "codex",
    decision: "enable",
    capabilityIdentity: runtimeCheckCapabilityIdentity({
      capability,
      surface: "codex",
      runtimeDigest: JSON.parse(readFileSync(join(projectedPluginRoot, "runtime", "runtime-manifest.json"), "utf8")).digest,
      sourceDigest: digestNormalizedPluginSource(projectedPluginRoot, pluginDefinition.version),
      command: fixedRuntimeCheckCommand("codex", projectedPluginRoot, process.platform),
    }),
    command: fixedRuntimeCheckCommand("codex", projectedPluginRoot, process.platform),
  }));
  const withConsent = spawnSync(process.execPath, [generatedEntrypoint], {
    cwd: process.cwd(), encoding: "utf8", env: { ...process.env, AGDF_DATA_DIR: entrypointDataRoot, AGDF_SURFACE: "codex" },
  });
  assert.equal(withConsent.status, 0, withConsent.stderr);
  const consented = parseSessionStartContext(withConsent.stdout);
  assert.equal(consented.kernel, activationKernel);
  assert.deepEqual(consented.binding, base.binding);
  assert.deepEqual(consented.facts, {
    context_state: "repo_less",
    working_directory: "unavailable",
    automatic_check: { status: "skipped", findings: 0 },
    config: "unavailable",
  });
  assert.ok(Buffer.byteLength(consented.supplement, "utf8") <= 320, "runtime-check supplement must stay within budget");
  assert.doesNotMatch(withConsent.stdout, /AGDF automatic runtime check:|AGDF host context:|Project config:|Language policy:|Source of truth:/);

  const copilotCommand = fixedRuntimeCheckCommand("copilot", projectedPluginRoot, process.platform);
  writeRuntimeCheckReceipt(entrypointDataRoot, createRuntimeCheckReceipt({
    surface: "copilot",
    decision: "enable",
    capabilityIdentity: runtimeCheckCapabilityIdentity({
      capability,
      surface: "copilot",
      runtimeDigest: JSON.parse(readFileSync(join(projectedPluginRoot, "runtime", "runtime-manifest.json"), "utf8")).digest,
      sourceDigest: digestNormalizedPluginSource(projectedPluginRoot, pluginDefinition.version),
      command: copilotCommand,
    }),
    command: copilotCommand,
  }));
  const withCopilotConsent = spawnSync(process.execPath, [generatedEntrypoint], {
    cwd: process.cwd(), encoding: "utf8", env: { ...process.env, AGDF_DATA_DIR: entrypointDataRoot, AGDF_SURFACE: "copilot" },
  });
  assert.equal(withCopilotConsent.status, 0, withCopilotConsent.stderr);
  const copilotOutput = JSON.parse(withCopilotConsent.stdout);
  assert.deepEqual(Object.keys(copilotOutput), ["additionalContext"]);
  const copilotContext = parseSessionStartContext(copilotOutput.additionalContext);
  assert.equal(copilotContext.kernel, activationKernel);
  assert.equal(copilotContext.binding.argv_prefix.at(-1), "copilot");
  const copilotRouteSourcePath = resolve(
    dirname(copilotContext.binding.argv_prefix[0]),
    copilotContext.binding.route_source_after_activation.path,
  );
  assert.equal(readFileSync(copilotRouteSourcePath, "utf8").replaceAll("\r\n", "\n").replaceAll("\r", "\n"), activationContract);
  assert.deepEqual(copilotContext.facts, consented.facts);
  assert.ok(Buffer.byteLength(copilotContext.supplement, "utf8") <= 320);

  const foreignHookCwd = mkdtempSync(join(tmpdir(), "agdf-copilot-hook-cwd-"));
  try {
    const withEventCwd = spawnSync(process.execPath, [generatedEntrypoint], {
      cwd: foreignHookCwd,
      encoding: "utf8",
      input: JSON.stringify({
        sessionId: "session-fixture",
        timestamp: Date.now(),
        cwd: process.cwd(),
        source: "new",
      }),
      env: { ...process.env, AGDF_DATA_DIR: entrypointDataRoot, AGDF_SURFACE: "copilot" },
    });
    assert.equal(withEventCwd.status, 0, withEventCwd.stderr);
    const eventCwdOutput = JSON.parse(withEventCwd.stdout);
    const eventCwdContext = parseSessionStartContext(eventCwdOutput.additionalContext);
    assert.equal(eventCwdContext.kernel, activationKernel);
    assert.equal(eventCwdContext.facts.context_state, "repository_bound");
    assert.equal(eventCwdContext.facts.working_directory, process.cwd());
    assert.equal(eventCwdContext.facts.config, "valid");
    assert.deepEqual(eventCwdContext.facts.languages, { artifact: "en", chat: "de", runtime: "en" });
    assert.equal(typeof eventCwdContext.facts.automatic_check.status, "string");
    assert.equal(typeof eventCwdContext.facts.automatic_check.findings, "number");
    const normalizedSupplement = eventCwdContext.supplement.replaceAll(process.cwd(), "<working-directory>");
    assert.ok(Buffer.byteLength(normalizedSupplement, "utf8") <= 320);
    assert.doesNotMatch(eventCwdOutput.additionalContext, /Verified repository root:|Project config:|Language policy:/);

    const malformedInput = spawnSync(process.execPath, [generatedEntrypoint], {
      cwd: process.cwd(),
      encoding: "utf8",
      input: JSON.stringify({ cwd: "relative/path" }),
      env: { ...process.env, AGDF_DATA_DIR: entrypointDataRoot, AGDF_SURFACE: "copilot" },
    });
    assert.equal(malformedInput.status, 0, malformedInput.stderr);
    const malformedOutput = JSON.parse(malformedInput.stdout);
    const malformedContext = parseSessionStartContext(malformedOutput.additionalContext);
    assert.equal(malformedContext.facts.context_state, "repo_less");
    assert.equal(malformedContext.facts.working_directory, "unavailable");
    assert.equal(malformedContext.facts.config, "unavailable");
  } finally {
    rmSync(foreignHookCwd, { recursive: true, force: true });
  }
} finally {
  rmSync(entrypointDataRoot, { recursive: true, force: true });
  rmSync(runtimeProjectionTemp, { recursive: true, force: true });
}

console.log("Runtime-check consent tests passed");
