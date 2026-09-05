import { inspectPluginList } from "../../installers/plugin-command.js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { inspectGeneratedRepositoryMarketplace } from "../../runtime/plugin-provenance.js";
import { execFileSync } from "node:child_process";
import { pluginDefinition } from "../../cli/runtime-context.js";
import { historicalEvidenceEntries, rollbackMarketplaceFilesystem, captureOptions, runPluginPhase, lifecycleAdapterError, pluginVersionFromList, versionMismatchMessage, recoveryAttempt } from "../../installers/plugin-command.js";
import { CODEX_REGISTRATION_REVISION, isCodexLocalInstallVersion } from "./identity.js";
import { classifyMarketplaceList, inspectLocalMarketplaceProjection, prepareLocalMarketplace } from "../../installers/local-marketplace.js";

export function installCodexGlobalPlugin({ exec = execFileSync, prepare = prepareLocalMarketplace, dataRoot } = {}) {
  const expectedVersion = pluginDefinition.version;
  const nativeOutput = [];
  const transaction = prepare({ expectedVersion, codexRegistrationRevision: CODEX_REGISTRATION_REVISION, ...(dataRoot ? { dataRoot } : {}) });
  const expectedInstallVersion = transaction.codexInstallVersion ?? expectedVersion;
  const migration = { state: "unknown", source: "", addedLocal: false, removedLegacy: false, refreshOwnedLocal: false, removedOwnedLocal: false };
  try {
    const marketplaceOutput = runPluginPhase(exec, "codex", ["plugin", "marketplace", "list", "--json"], "marketplace", captureOptions());
    migrateMarketplace({ exec, output: marketplaceOutput, root: transaction.root, nativeOutput, migration, refreshOwnedLocal: transaction.changed === true });
    nativeOutput.push(runPluginPhase(exec, "codex", ["plugin", "add", "agdf@agdf", "--json"], "plugin_operation", captureOptions()));
    const listOutput = runPluginPhase(exec, "codex", ["plugin", "list"], "verification", captureOptions());
    const installedVersion = pluginVersionFromList(listOutput, "agdf@agdf");
    if (installedVersion !== expectedInstallVersion) {
      throw lifecycleAdapterError("version", versionMismatchMessage("Codex", "agdf@agdf", expectedInstallVersion, installedVersion, "npx --yes @agdf/cli@latest codex"));
    }
    transaction.commit();
    return {
      surface: "codex", operation: migration.state === "owned_local_current" ? "update" : "install", expectedVersion: expectedInstallVersion, canonicalVersion: expectedVersion, installedVersion, verificationStatus: "healthy",
      evidence: [
        "durable_local_marketplace",
        `marketplace:${migration.state}`,
        "codex plugin list",
        ...(transaction.pluginRoot ? [`staged_plugin_root:${transaction.pluginRoot}`, "staged_installation_provenance:matched"] : []),
        ...(transaction.sourceDigest ? [`source_digest:${transaction.sourceDigest}`] : []),
        ...(transaction.digest ? [`plugin_digest:${transaction.digest}`] : []),
        ...(transaction.existingClassification === "owned_pre_provenance_rebuild" ? ["marketplace_recovery:owned_pre_provenance_rebuild", "loaded_session:restart_required"] : []),
        ...(transaction.existingClassification === "owned_supported_historical_rebuild" ? ["marketplace_recovery:owned_supported_historical_rebuild", "loaded_session:fresh_session_required"] : []),
        ...historicalEvidenceEntries(transaction),
        ...(expectedInstallVersion === expectedVersion ? [] : [`canonical_version:${expectedVersion}`, `local_install_version:${expectedInstallVersion}`]),
      ],
      pluginRoot: transaction.pluginRoot ?? null,
      digest: transaction.digest ?? null,
      runtimeDigest: transaction.runtimeDigest ?? null,
      sourceDigest: transaction.sourceDigest ?? null,
      historicalEvidence: transaction.historicalEvidence ?? null,
      nativeOutput: nativeOutput.filter(Boolean).map(String),
    };
  } catch (error) {
    recoverMarketplace({ exec, migration, transaction, error });
    throw error;
  }
}

function migrateMarketplace({ exec, output, root, nativeOutput, migration, refreshOwnedLocal = false }) {
  const classification = classifyMarketplaceList("codex", output, root);
  Object.assign(migration, classification);
  if (["conflict", "unknown"].includes(classification.state)) {
    throw lifecycleAdapterError("marketplace", `Refusing to replace non-AGDF marketplace registration agdf (${classification.reason || classification.state}).`, classification);
  }
  if (classification.state === "owned_local_current" && refreshOwnedLocal) {
    migration.refreshOwnedLocal = true;
    nativeOutput.push(runPluginPhase(exec, "codex", ["plugin", "marketplace", "remove", "agdf", "--json"], "marketplace", captureOptions()));
    migration.removedOwnedLocal = true;
    nativeOutput.push(runPluginPhase(exec, "codex", ["plugin", "marketplace", "add", root, "--json"], "marketplace", captureOptions()));
    migration.addedLocal = true;
    return;
  }
  if (classification.state === "legacy_github") {
    nativeOutput.push(runPluginPhase(exec, "codex", ["plugin", "marketplace", "remove", "agdf", "--json"], "marketplace", captureOptions()));
    migration.removedLegacy = true;
  }
  if (["absent", "legacy_github"].includes(classification.state)) {
    nativeOutput.push(runPluginPhase(exec, "codex", ["plugin", "marketplace", "add", root, "--json"], "marketplace", captureOptions()));
    migration.addedLocal = true;
  }
}

function recoverMarketplace({ exec, migration, transaction, error }) {
  const recovery = [];
  const attempt = recoveryAttempt(exec, "codex", recovery);
  if (migration?.refreshOwnedLocal) {
    const refreshedRegistrationRemoved = migration.addedLocal
      ? attempt(["plugin", "marketplace", "remove", "agdf", "--json"])
      : true;
    rollbackMarketplaceFilesystem(transaction, recovery);
    if (migration.removedOwnedLocal && refreshedRegistrationRemoved) {
      attempt(["plugin", "marketplace", "add", migration.source || transaction.root, "--json"]);
    }
    error.evidence = { ...(error.evidence ?? {}), rollback: recovery };
    return;
  }
  if (migration?.addedLocal) attempt(["plugin", "marketplace", "remove", "agdf", "--json"]);
  if (migration?.removedLegacy && migration.source) attempt(["plugin", "marketplace", "add", migration.source, "--json"]);
  rollbackMarketplaceFilesystem(transaction, recovery);
  error.evidence = { ...(error.evidence ?? {}), rollback: recovery };
}

export function inspectCodexPlugin(exec = execFileSync, options = {}, surface) {
  return inspectPluginList({ surface, exec, executable: "codex", args: ["plugin", "list"], expectedVersion: pluginDefinition.version,
    selectPlugin: () => "agdf@agdf",
    localVersion(version) {
      if (surface !== "codex" || !isCodexLocalInstallVersion(pluginDefinition.version, version)) return false;
      try { return inspectLocalMarketplaceProjection(options)?.codexInstallVersion === version; }
      catch { return false; }
    },
  });
}

export const uninstallCommand = () => ({ executable: "codex", args: ["plugin", "remove", "agdf@agdf"] });

const CODEX_DISABLE_MARKER = "# AGDF-OWNED-REPOSITORY-PLUGIN-STATE";

function pluginSection(content, selector) {
  const escaped = JSON.stringify(selector).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(`\\[plugins\\.${escaped}\\][\\s\\S]*?(?=\\n\\[|$)`))?.[0] ?? "";
}

function repositorySelector(targetDir, config = "") {
  const repository = inspectGeneratedRepositoryMarketplace(targetDir);
  if (repository.status === "matched") return repository.selector;
  return pluginSection(config, "agdf@agdf-repo") ? "agdf@agdf-repo" : "agdf@agdf";
}

export function planCodexRepositoryDisable(targetDir) {
  const surface = "codex";
  const path = join(targetDir, ".codex", "config.toml");
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const selector = repositorySelector(targetDir, existing);
  const escaped = JSON.stringify(selector).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sectionPattern = new RegExp(`\\[plugins\\.${escaped}\\][\\s\\S]*?(?=\\n\\[|$)`);
  const currentSection = pluginSection(existing, selector);
  const enabledMatches = [...currentSection.matchAll(/^enabled\s*=\s*(true|false)\s*$/gm)];
  if (currentSection && enabledMatches.length !== 1) {
    throw new Error(`Refusing to modify ambiguous AGDF plugin state in ${path}.`);
  }
  const section = currentSection
    ? currentSection.replace(/^enabled\s*=\s*(true|false)\s*$/m, "enabled = false")
    : `${CODEX_DISABLE_MARKER}\n[plugins.${JSON.stringify(selector)}]\nenabled = false`;
  const content = currentSection
    ? existing.replace(sectionPattern, section).replace(/\s*$/, "\n")
    : `${existing.replace(/\s*$/, "")}${existing.trim() ? "\n\n" : ""}${section}\n`;
  return Object.freeze({
    operation: "disable",
    surface,
    scope: "repository",
    mutations: Object.freeze([{ kind: "write", path, content, ownership: currentSection ? "exact_plugin_section" : "agdf_marker" }]),
    retained: Object.freeze([join(targetDir, ".agdf", "control"), "global AGDF plugin availability"]),
    expected: Object.freeze({ repository_status: "disabled" }),
  });
}

export function verifyCodexRepositoryDisabled(targetDir) {
  const path = join(targetDir, ".codex", "config.toml");
  if (!existsSync(path)) return { status: "failed", evidence: [`missing:${path}`] };
  const config = readFileSync(path, "utf8");
  const selector = repositorySelector(targetDir, config);
  const section = pluginSection(config, selector);
  const matches = [...section.matchAll(/^enabled\s*=\s*(true|false)\s*$/gm)];
  return matches.length === 1 && matches[0][1] === "false"
    ? { status: "healthy", evidence: [`${path}:${selector}:enabled=false`] }
    : { status: "failed", evidence: [`postcondition_failed:${path}:${selector}`] };
}

export function inspectCodexRepositoryStatus(targetDir) {
    const repository = inspectGeneratedRepositoryMarketplace(targetDir);
    const marketplace = repository.marketplacePath;
    const disabled = join(targetDir, ".codex", "config.toml");
    const config = existsSync(disabled) ? readFileSync(disabled, "utf8") : "";
    const isDisabled = ["agdf@agdf-repo", "agdf@agdf"].some((selector) => {
      const escaped = JSON.stringify(selector).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const section = config.match(new RegExp(`\\[plugins\\.${escaped}\\][\\s\\S]*?(?=\\n\\[|$)`))?.[0] ?? "";
      return /^enabled\s*=\s*false\s*$/m.test(section);
    });
    return {
      status: isDisabled ? "disabled" : repository.status === "matched" ? "active" : repository.status === "invalid" ? "degraded" : "not_configured",
      scope: "repository",
      evidence: [marketplace, ...(repository.reason ? [repository.reason] : [])],
    };
}

export const bootstrapCommands = () => ({ install: "npx --yes @agdf/cli@latest codex", repository: "npx --yes @agdf/cli@latest codex-repo" });
