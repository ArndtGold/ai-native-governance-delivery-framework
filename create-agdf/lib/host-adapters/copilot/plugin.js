import { inspectPluginList } from "../../installers/plugin-command.js";
import { execFileSync } from "node:child_process";
import { pluginDefinition } from "../../cli/runtime-context.js";
import { captureOptions, runPluginPhase, lifecycleAdapterError, commandErrorText, pluginListHasPlugin, pluginVersionFromList, versionMismatchMessage } from "../../installers/plugin-command.js";
import process from "node:process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { configureCopilotMarketplace, defaultCopilotSettingsPath, readCopilotSettings, restoreCopilotMarketplaceSettings } from "../../installers/copilot-settings.js";
import { copilotMarketplaceSource } from "../../installers/copilot-marketplace-transport.js";
import { verifyCopilotSkillDiscovery } from "../../installers/copilot-skill-discovery.js";
import { inspectOwnedSharedMarketplaceForCopilotMigration, prepareCopilotMarketplace } from "../../installers/local-marketplace.js";

export const COPILOT_CLI_NPM_PACKAGE = "@github/copilot@1.0.80";

export function installCopilotGlobalPlugin({
  exec = execFileSync, packagedCopilotExec = execFileSync, prepare = prepareCopilotMarketplace,
  dataRoot, pluginRoot, copilotSettingsPath = defaultCopilotSettingsPath(),
} = {}) {
  const expectedVersion = pluginDefinition.version;
  const previousSettings = readCopilotSettings(copilotSettingsPath);
  const transaction = prepare({ expectedVersion, ...(dataRoot ? { dataRoot } : {}), ...(pluginRoot ? { builtPluginRoot: pluginRoot } : {}) });
  const effectivePluginRoot = transaction.pluginRoot;
  const sourceDigest = transaction.sourceDigest;
  const marketplaceRoot = transaction.root;
  const desiredSource = copilotMarketplaceSource(marketplaceRoot, sourceDigest);
  let before = "";
  let activeExec = exec;
  const bootstrapEvidence = [];
  try {
    before = activeExec("copilot", ["plugin", "list"], captureOptions());
  } catch (error) {
    if (!copilotCliUnavailable(error)) {
      transaction.rollback();
      throw lifecycleAdapterError("verification", commandErrorText(error), { executable: "copilot", args: ["plugin", "list"] });
    }
    const invocation = copilotNpmInvocation();
    activeExec = (_executable, args, options) => packagedCopilotExec(invocation.executable, [...invocation.args, ...args], options);
    try {
      before = activeExec("copilot", ["plugin", "list"], captureOptions());
      bootstrapEvidence.push(
        error?.code === "ENOENT" ? "copilot_cli_not_found" : "copilot_cli_launcher_unavailable",
        `copilot_cli_npm_package:${COPILOT_CLI_NPM_PACKAGE}`,
      );
    } catch (bootstrapError) {
      transaction.commit();
      return {
        surface: "copilot", operation: "install", expectedVersion, installedVersion: null,
        verificationStatus: "unavailable", manualHandoff: true,
        evidence: ["copilot_cli_not_found", `copilot_cli_npm_bootstrap_failed:${commandErrorText(bootstrapError)}`, "durable_local_plugin_stage", `local_plugin_root:${effectivePluginRoot}`, `source_digest:${sourceDigest}`],
        pluginRoot: effectivePluginRoot, runtimeDigest: transaction.runtimeDigest, sourceDigest, nativeOutput: [],
      };
    }
  }
  const directInstalled = pluginListHasPlugin(before, "agdf");
  const marketplaceInstalled = pluginListHasPlugin(before, "agdf@agdf");
  let legacySharedProjection = null;
  try { legacySharedProjection = inspectOwnedSharedMarketplaceForCopilotMigration({ ...(dataRoot ? { dataRoot } : {}), expectedVersion }); } catch {}
  let marketplace = null;
  let registrationRemoved = false;
  let settingsChanged = false;
  let marketplacePluginRemoved = false;
  let directRemoved = false;
  let installedNewPlugin = false;
  try {
    const nativeOutput = [];
    const marketplaceOutput = runPluginPhase(activeExec, "copilot", ["plugin", "marketplace", "list"], "marketplace", captureOptions());
    marketplace = classifyCopilotMarketplaceList(marketplaceOutput, marketplaceRoot, {
      ownedLegacyRoots: legacySharedProjection ? [legacySharedProjection.root] : [],
    });
    const configured = previousSettings.settings.extraKnownMarketplaces?.agdf;
    if (configured) {
      const source = configured.source;
      const projection = source?.source === "directory" && typeof source.path === "string"
        ? `agdf (Local: ${source.path})`
        : source?.source === "git" && typeof source.url === "string" ? `agdf (URL: ${source.url})` : "agdf (Unknown source)";
      const configuredState = classifyCopilotMarketplaceList(projection, marketplaceRoot, {
        ownedLegacyRoots: legacySharedProjection ? [legacySharedProjection.root] : [],
      });
      if (configuredState.state === "conflict") marketplace = configuredState;
    }
    if (marketplace.state === "conflict") {
      throw lifecycleAdapterError("marketplace", `Refusing to replace non-AGDF Copilot marketplace registration agdf (${marketplace.source || "unknown source"}).`);
    }
    // Reinstall even at the same public version: source content can change in a
    // local checkout. The Git ref binds Copilot's catalog cache to that content.
    if (marketplaceInstalled) {
      nativeOutput.push(runPluginPhase(activeExec, "copilot", ["plugin", "uninstall", "agdf@agdf"], "plugin_operation", captureOptions()));
      marketplacePluginRemoved = true;
    }
    if (marketplace.state !== "absent"
        && JSON.stringify(previousSettings.settings.extraKnownMarketplaces?.agdf?.source) !== JSON.stringify(desiredSource)) {
      nativeOutput.push(runPluginPhase(activeExec, "copilot", ["plugin", "marketplace", "remove", "agdf"], "marketplace", captureOptions()));
      registrationRemoved = true;
    }
    // Copilot's documented declarative Git source accepts local file URLs;
    // its imperative marketplace-add parser treats those URLs as directories.
    configureCopilotMarketplace({ path: copilotSettingsPath, root: marketplaceRoot, sourceDigest });
    settingsChanged = true;
    if (directInstalled) {
      nativeOutput.push(runPluginPhase(activeExec, "copilot", ["plugin", "uninstall", "agdf"], "plugin_operation", captureOptions()));
      directRemoved = true;
    }
    nativeOutput.push(runPluginPhase(activeExec, "copilot", ["plugin", "install", "agdf@agdf"], "plugin_operation", captureOptions()));
    installedNewPlugin = true;
    const after = runPluginPhase(activeExec, "copilot", ["plugin", "list"], "verification", captureOptions());
    if (!pluginListHasPlugin(after, "agdf@agdf")) throw lifecycleAdapterError("verification", "AGDF was not present in copilot plugin list after installation.");
    const installedVersion = pluginVersionFromList(after, "agdf@agdf");
    if (installedVersion && installedVersion !== expectedVersion) {
      throw lifecycleAdapterError("version", versionMismatchMessage("GitHub Copilot", "agdf", expectedVersion, installedVersion, "npx --yes @agdf/cli@latest copilot"));
    }
    const skillOutput = runPluginPhase(activeExec, "copilot", ["skill", "list", "--json"], "verification", { ...captureOptions(), cwd: marketplaceRoot });
    let discovery;
    try { discovery = verifyCopilotSkillDiscovery(skillOutput, { definition: pluginDefinition, sourceDigest }); }
    catch (error) { throw lifecycleAdapterError("verification", error.message); }
    transaction.commit();
    return {
      surface: "copilot", operation: directInstalled || marketplaceInstalled ? "update" : "install", expectedVersion,
      installedVersion: installedVersion || null, verificationStatus: installedVersion ? "healthy" : "degraded", manualHandoff: false,
      evidence: [...bootstrapEvidence, "durable_local_plugin_stage", "copilot_marketplace_transport:git", "copilot plugin marketplace list",
        ...(marketplace.state === "owned_legacy_shared" ? ["shared_marketplace_registration_migrated"] : []),
        ...(marketplace.state === "owned_local_current" ? ["directory_marketplace_registration_migrated"] : []),
        ...(directRemoved ? ["direct_install_migrated"] : []), "copilot plugin install agdf@agdf", "copilot plugin list", "copilot skill list --json",
        `discovered_plugin_skills:${discovery.count}`, `discovered_plugin_root:${discovery.pluginRoot}`, "discovered_payload:matched",
        `local_plugin_root:${effectivePluginRoot}`, `source_digest:${sourceDigest}`, ...(installedVersion ? [] : ["host_did_not_expose_version"])],
      pluginRoot: effectivePluginRoot, runtimeDigest: transaction.runtimeDigest, sourceDigest, nativeOutput: nativeOutput.filter(Boolean).map(String),
    };
  } catch (error) {
    const recover = (name, action) => {
      try { action(); } catch (recoveryError) { error.evidence = { ...(error.evidence ?? {}), [name]: commandErrorText(recoveryError) }; }
    };
    if (installedNewPlugin) recover("new_plugin_cleanup", () => activeExec("copilot", ["plugin", "uninstall", "agdf@agdf"], captureOptions()));
    recover("marketplace_filesystem_recovery", () => transaction.rollback());
    if (settingsChanged || registrationRemoved || marketplacePluginRemoved) {
      recover("marketplace_settings_recovery", () => restoreCopilotMarketplaceSettings(copilotSettingsPath, previousSettings));
    }
    if (registrationRemoved && !previousSettings.settings.extraKnownMarketplaces?.agdf) {
      recover("marketplace_registration_recovery", () => activeExec("copilot", ["plugin", "marketplace", "add", marketplace.source], captureOptions()));
    }
    if (marketplacePluginRemoved) recover("marketplace_plugin_recovery", () => activeExec("copilot", ["plugin", "install", "agdf@agdf"], captureOptions()));
    if (directRemoved) recover("direct_install_recovery", () => activeExec("copilot", ["plugin", "install", effectivePluginRoot], captureOptions()));
    // Reinstallation can enable a previously disabled plugin. The prior user
    // setting remains authoritative after native recovery has finished.
    if (marketplacePluginRemoved || directRemoved) {
      recover("plugin_enablement_recovery", () => restoreCopilotMarketplaceSettings(copilotSettingsPath, previousSettings));
    }
    throw error;
  }
}

export function classifyCopilotMarketplaceList(output, expectedRoot, { ownedLegacyRoots = [] } = {}) {
  const lines = String(output || "").split(/\r?\n/).filter((entry) => /^\s*[◆•]?\s*agdf\s+\(/.test(entry));
  if (lines.length === 0) return { state: "absent", source: "" };
  if (lines.length !== 1) return { state: "conflict", source: "multiple agdf marketplace registrations" };
  const [line] = lines;
  const local = line.match(/\(Local:\s*(.+)\)\s*$/);
  if (local) {
    if (resolve(local[1]) === resolve(expectedRoot)) return { state: "owned_local_current", source: local[1] };
    if (ownedLegacyRoots.some((root) => resolve(root) === resolve(local[1]))) return { state: "owned_legacy_shared", source: local[1] };
  }
  const remote = line.match(/\((?:URL|Git):\s*(file:\/\/.+)\)\s*$/);
  if (remote) {
    try {
      const url = new URL(remote[1]);
      url.hash = "";
      if (resolve(fileURLToPath(url)) === resolve(expectedRoot)) return { state: "owned_git_current", source: remote[1] };
    } catch {}
  }
  return { state: "conflict", source: local?.[1] ?? line.trim() };
}

export function copilotNpmInvocation({ env = process.env, platform = process.platform, execPath = process.execPath } = {}) {
  const args = ["exec", "--yes", `--package=${COPILOT_CLI_NPM_PACKAGE}`, "--", "copilot"];
  if (env.npm_execpath) return { executable: execPath, args: [env.npm_execpath, ...args] };
  return { executable: platform === "win32" ? "npm.cmd" : "npm", args };
}

export function setCopilotPluginEnabled({ enabled, exec = execFileSync } = {}) {
  if (typeof enabled !== "boolean") throw lifecycleAdapterError("plugin_operation", "Copilot plugin enabled state must be boolean.");
  const operation = enabled ? "enable" : "disable";
  try {
    const nativeOutput = runPluginPhase(exec, "copilot", ["plugin", operation, "agdf"], "plugin_operation", captureOptions());
    const listOutput = runPluginPhase(exec, "copilot", ["plugin", "list"], "verification", captureOptions());
    if (!pluginListHasPlugin(listOutput, "agdf") && !pluginListHasPlugin(listOutput, "agdf@agdf")) {
      throw lifecycleAdapterError("verification", "AGDF was not present in copilot plugin list after the state change.");
    }
    return {
      surface: "copilot",
      requestedState: enabled ? "enabled" : "disabled",
      status: "command_accepted_host_state_unverified",
      evidence: [`copilot plugin ${operation} agdf`, "copilot plugin list", "fresh_session_required"],
      nativeOutput: String(nativeOutput || ""),
    };
  } catch (error) {
    if (/\bmanaged\b/i.test(commandErrorText(error))) {
      return {
        surface: "copilot", requestedState: enabled ? "enabled" : "disabled", status: "managed",
        evidence: ["managed_policy_precedence", commandErrorText(error)], nativeOutput: "",
      };
    }
    throw error;
  }
}

function copilotCliUnavailable(error) {
  return error?.code === "ENOENT"
    || /^Cannot find GitHub Copilot CLI(?:\s|$|\()/i.test(commandErrorText(error));
}

export function inspectCopilotPlugin(exec = execFileSync) {
  return inspectPluginList({ surface: "copilot", exec, executable: "copilot", args: ["plugin", "list"], expectedVersion: pluginDefinition.version,
    selectPlugin: output => pluginListHasPlugin(output, "agdf@agdf") ? "agdf@agdf" : "agdf",
  });
}

export const uninstallCommand = () => ({ executable: "copilot", args: ["plugin", "uninstall", "agdf"] });

export const bootstrapCommands = () => ({ install: "npx --yes @agdf/cli@latest copilot", repository: "npx --yes @agdf/cli@latest copilot-repo" });
