import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import process from "node:process";
import { generatedRoot, pluginDefinition } from "../cli/runtime-context.js";
import { defaultOpenCodeConfigDir, resolveOpenCodeInstalledPackage } from "../installers/opencode.js";
import { defaultAgdfDataRoot } from "../installers/local-marketplace.js";
import { digestNormalizedPluginSource } from "../runtime/plugin-provenance.js";
import { fixedRuntimeCheckCommand, runtimeCheckCapabilityIdentity } from "./contract.js";
import { consentDisclosure, resolveRuntimeCheckDecision } from "./coordinator.js";
import { claudePermissionRule } from "./adapters.js";
import { configureClaudeExactRuntimeRule, defaultClaudeSettingsPath, revokeClaudeRuntimeRule } from "./claude-settings.js";
import { createRuntimeCheckReceipt, readRuntimeCheckReceipt, writeRuntimeCheckReceipt } from "./state.js";

export { fixedRuntimeCheckCommand } from "./contract.js";

export function prepareInstallConsent(surface, options = {}, adapters = {}) {
  const explicit = options.runtimeChecksDecision;
  const interactive = explicit === undefined && Boolean(adapters.interactive);
  const answer = interactive ? adapters.ask?.(consentDisclosure(surface)) : undefined;
  const decision = resolveRuntimeCheckDecision({ explicitValue: explicit ?? answer, interactive: false });
  return { decision, persist: explicit !== undefined || interactive, disclosure: consentDisclosure(surface) };
}

function prospectiveRuntimeCheckIdentity(surface, platform = process.platform) {
  if (surface === "opencode") {
    const installed = resolveOpenCodeInstalledPackage(defaultOpenCodeConfigDir(), pluginDefinition.opencode.npmPackage);
    if (!installed.loadable || !installed.digest) return null;
    return runtimeCheckCapabilityIdentity({
      capability: pluginDefinition.automaticRuntimeChecks,
      surface,
      runtimeDigest: installed.digest,
      sourceDigest: installed.digest,
      command: fixedRuntimeCheckCommand(surface, installed.root, platform),
    });
  }
  if (!["codex", "claude"].includes(surface)) return null;
  const pluginRoot = join(generatedRoot, "plugins", "agdf");
  let runtimeManifest;
  try { runtimeManifest = JSON.parse(readFileSync(join(pluginRoot, "runtime", "runtime-manifest.json"), "utf8")); } catch { return null; }
  if (!/^[a-f0-9]{64}$/.test(runtimeManifest?.digest ?? "")) return null;
  const sourceDigest = digestNormalizedPluginSource(pluginRoot, pluginDefinition.version);
  const command = fixedRuntimeCheckCommand(surface, pluginRoot, platform);
  return runtimeCheckCapabilityIdentity({
    capability: pluginDefinition.automaticRuntimeChecks,
    surface,
    runtimeDigest: runtimeManifest.digest,
    sourceDigest,
    command,
  });
}

export function retainCurrentInstallConsent(surface, dataRoot = defaultAgdfDataRoot(), platform = process.platform) {
  const capabilityIdentity = prospectiveRuntimeCheckIdentity(surface, platform);
  if (!capabilityIdentity) return null;
  const current = readRuntimeCheckReceipt(dataRoot, surface);
  if (current.status !== "valid" || current.receipt.capability_identity !== capabilityIdentity) return null;
  return {
    decision: current.receipt.requested_state === "enabled" ? "enable" : "manual",
    persist: false,
    retained: true,
    disclosure: consentDisclosure(surface),
  };
}

export function persistInstallConsent({ surface, decision, installed, dataRoot, platform, claudeSettingsPath }) {
  if (decision === "cancel") return { requested: "cancelled", effective: "cancelled", reason: "consent_not_provided", capability_identity: null, verification: "not_attempted", mutation: "none", rollback: "none" };
  const runtimeDigest = installed?.runtimeDigest ?? installed?.digest;
  if (!installed?.pluginRoot || !runtimeDigest || !installed?.sourceDigest) {
    return { requested: decision === "enable" ? "enabled" : "manual", effective: "manual", reason: "host_permission_unverified", capability_identity: null, verification: "unavailable", mutation: "none", rollback: "none" };
  }
  const command = fixedRuntimeCheckCommand(surface, installed.pluginRoot, platform);
  const capabilityIdentity = runtimeCheckCapabilityIdentity({
    capability: pluginDefinition.automaticRuntimeChecks,
    surface,
    runtimeDigest,
    sourceDigest: installed.sourceDigest,
    command,
  });
  const receipt = createRuntimeCheckReceipt({ surface, decision, capabilityIdentity, command });
  let configured = null;
  let configurationReason = null;
  if (surface === "claude" && decision === "enable") {
    configured = configureClaudeExactRuntimeRule({
      path: claudeSettingsPath ?? defaultClaudeSettingsPath(),
      rule: claudePermissionRule({ platform: platform ?? process.platform, command }),
    });
    if (configured.status !== "configured") {
      configurationReason = configured.reason;
      configured = null;
    }
  }
  try {
    writeRuntimeCheckReceipt(dataRoot ?? defaultAgdfDataRoot(), receipt);
  } catch (error) {
    configured?.rollback();
    throw error;
  }
  if (configurationReason) return { requested: "enabled", effective: "degraded", reason: configurationReason, capability_identity: capabilityIdentity, verification: "conflict", mutation: "receipt_written", rollback: "none" };
  return {
    requested: receipt.requested_state,
    effective: receipt.requested_state === "manual" ? "manual" : "decision_required",
    reason: receipt.requested_state === "manual" ? "consent_not_provided" : "host_permission_unverified",
    capability_identity: capabilityIdentity,
    verification: receipt.requested_state === "manual" ? "not_required" : "host_unverified",
    mutation: surface === "claude" && decision === "enable" ? "exact_rule_and_receipt_written" : "receipt_written",
    rollback: "none",
  };
}

export function setRuntimeChecksManual({ dataRoot = defaultAgdfDataRoot(), surface, platform = process.platform, claudeSettingsPath }) {
  const result = readRuntimeCheckReceipt(dataRoot, surface);
  if (result.status === "receipt_missing") return { requested: "manual", effective: "manual", reason: "consent_not_provided", capability_identity: null, verification: "not_required", mutation: "none", rollback: "none", path: result.path };
  if (result.status !== "valid") return { requested: "manual", effective: result.status, reason: result.status, capability_identity: null, verification: "unavailable", mutation: "none", rollback: "none", path: result.path };
  if (surface === "claude" && result.receipt.requested_state === "enabled") {
    revokeClaudeRuntimeRule({
      path: claudeSettingsPath ?? defaultClaudeSettingsPath(),
      rule: claudePermissionRule({ platform, command: result.receipt.command }),
    });
  }
  const receipt = createRuntimeCheckReceipt({
    surface,
    decision: "manual",
    capabilityIdentity: result.receipt.capability_identity,
    command: result.receipt.command,
  });
  writeRuntimeCheckReceipt(dataRoot, receipt);
  return {
    requested: "manual",
    effective: "manual",
    reason: "consent_not_provided",
    capability_identity: receipt.capability_identity,
    verification: "not_required",
    mutation: surface === "claude" ? "exact_owned_rule_removed" : "receipt_updated",
    rollback: "none",
    path: result.path,
  };
}

export function runtimeCheckStatus(dataRoot = defaultAgdfDataRoot(), surface, platform = process.platform) {
  const result = readRuntimeCheckReceipt(dataRoot, surface);
  if (result.status !== "valid") return { requested: "unknown", effective: result.status, reason: result.status, capability_identity: null, verification: "unavailable", mutation: "none", rollback: "none", path: result.path };
  const currentIdentity = prospectiveRuntimeCheckIdentity(surface, platform);
  if (currentIdentity && currentIdentity !== result.receipt.capability_identity) {
    return { requested: result.receipt.requested_state, effective: "renewal_required", reason: "capability_identity_changed", capability_identity: result.receipt.capability_identity, verification: "identity_mismatch", mutation: "none", rollback: "none", path: result.path };
  }
  return { requested: result.receipt.requested_state, effective: result.receipt.requested_state === "manual" ? "manual" : "decision_required", reason: result.receipt.requested_state === "manual" ? "consent_not_provided" : "host_permission_unverified", capability_identity: result.receipt.capability_identity, verification: result.receipt.requested_state === "manual" ? "not_required" : "host_unverified", mutation: "none", rollback: "none", path: result.path };
}

export function executeOpenCodeAutomaticRuntimeCheck({
  directory = process.cwd(),
  dataRoot = defaultAgdfDataRoot(),
  packageRoot = fileURLToPath(new URL("../../", import.meta.url)),
  run = spawnSync,
  executable = process.platform === "win32" ? "node.exe" : "node",
  statusResolver = runtimeCheckStatus,
  entrypointExists = existsSync,
} = {}) {
  const status = statusResolver(dataRoot, "opencode");
  if (status.requested !== "enabled" || status.effective !== "decision_required") {
    return { ...status, ran: false, output: "" };
  }
  const entrypoint = join(packageRoot, "generated", "plugins", "agdf", "runtime", "agdf-session-check.js");
  if (!entrypointExists(entrypoint)) {
    return { ...status, effective: "unavailable", reason: "unsupported_host_capability", verification: "entrypoint_missing", ran: false, output: "" };
  }
  const child = run(executable, [entrypoint], {
    cwd: directory,
    env: { ...process.env, AGDF_SURFACE: "opencode" },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 10000,
    maxBuffer: 1024 * 1024,
  });
  const output = String(child.stdout || "").trim().slice(0, 20000);
  if (child.status !== 0 || !output.includes("AGDF automatic runtime check:")) {
    return { ...status, effective: "degraded", reason: "host_permission_unverified", verification: "execution_failed", ran: true, output: "" };
  }
  return { ...status, effective: "enabled", reason: "none", verification: "host_observed", ran: true, output };
}
