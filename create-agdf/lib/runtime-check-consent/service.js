import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import process from "node:process";
import { generatedRoot, pluginDefinition } from "../cli/runtime-context.js";
import { openCodeRuntimeSource, executeOpenCodeRuntimeCheck } from "../host-adapters/opencode/runtime-check.js";
import { defaultAgdfDataRoot } from "../installers/local-marketplace.js";
import { digestNormalizedPluginSource } from "../runtime/plugin-provenance.js";
import { fixedRuntimeCheckCommand, runtimeCheckCapabilityIdentity } from "./contract.js";
import { consentDisclosure, resolveRuntimeCheckDecision } from "./coordinator.js";
import { CLAUDE_PLUGIN_DISABLE_COMMAND, claudeRuntimeCheckState, removeLegacyClaudeRuntimeCheckState } from "../host-adapters/claude/runtime-check.js";
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
    const installed = openCodeRuntimeSource();
    if (!installed.loadable || !installed.digest) return null;
    return runtimeCheckCapabilityIdentity({
      capability: pluginDefinition.automaticRuntimeChecks,
      surface,
      runtimeDigest: installed.digest,
      sourceDigest: installed.digest,
      command: fixedRuntimeCheckCommand(surface, installed.root, platform),
    });
  }
  if (!["codex", "claude", "copilot"].includes(surface)) return null;
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
  if (surface === "claude") return null;
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
  if (surface === "claude") {
    const removed = removeLegacyClaudeRuntimeCheckState({ claudeSettingsPath, dataRoot: dataRoot ?? defaultAgdfDataRoot() });
    return {
      ...claudeRuntimeCheckState(decision === "enable" ? "enabled" : "manual"),
      mutation: removed.length ? "legacy_rule_or_receipt_removed" : "none",
      rollback: "none",
    };
  }
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
  writeRuntimeCheckReceipt(dataRoot ?? defaultAgdfDataRoot(), receipt);
  return {
    requested: receipt.requested_state,
    effective: receipt.requested_state === "manual" ? "manual" : "decision_required",
    reason: receipt.requested_state === "manual" ? "consent_not_provided" : "host_permission_unverified",
    capability_identity: capabilityIdentity,
    verification: receipt.requested_state === "manual" ? "not_required" : "host_unverified",
    mutation: "receipt_written",
    rollback: "none",
  };
}

export function setRuntimeChecksManual({ dataRoot = defaultAgdfDataRoot(), surface, platform = process.platform, claudeSettingsPath }) {
  if (surface === "claude") {
    const removed = removeLegacyClaudeRuntimeCheckState({ claudeSettingsPath, dataRoot });
    return {
      ...claudeRuntimeCheckState("manual"),
      effective: "unavailable",
      reason: "unsupported_host_capability",
      mutation: removed.length ? "legacy_rule_or_receipt_removed" : "none",
      rollback: "none",
      next_action: `Claude Code runs the AGDF session check whenever the AGDF plugin is enabled; to stop it, run: ${CLAUDE_PLUGIN_DISABLE_COMMAND}`,
    };
  }
  const result = readRuntimeCheckReceipt(dataRoot, surface);
  if (result.status === "receipt_missing") return { requested: "manual", effective: "manual", reason: "consent_not_provided", capability_identity: null, verification: "not_required", mutation: "none", rollback: "none", path: result.path };
  if (result.status !== "valid") return { requested: "manual", effective: result.status, reason: result.status, capability_identity: null, verification: "unavailable", mutation: "none", rollback: "none", path: result.path };
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
    mutation: "receipt_updated",
    rollback: "none",
    path: result.path,
  };
}

export function runtimeCheckStatus(dataRoot = defaultAgdfDataRoot(), surface, platform = process.platform) {
  if (surface === "claude") return { ...claudeRuntimeCheckState(), mutation: "none", rollback: "none" };
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
  return executeOpenCodeRuntimeCheck({ directory, dataRoot, packageRoot, run, executable, statusResolver, entrypointExists });
}
