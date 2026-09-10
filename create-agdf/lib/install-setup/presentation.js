import { interactionLocales } from "../cli/runtime-context.js";
import { localePack } from "../interaction-presentation.js";

function localized(pack, group, code) {
  const value = pack?.installSetup?.[group]?.[code];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`AGDF_INSTALL_SETUP_PRESENTATION_UNLOCALIZED:${group}:${code}`);
  }
  return value;
}

function mcpState(value) {
  return value?.status ?? value?.result ?? "not_checked";
}

function pluginState(value) {
  if (value?.status) return value.status;
  if (["healthy", "configured", "configured_pending_restart"].includes(value?.verification?.status)) return "healthy";
  if (value?.verification?.status === "unavailable") return "unavailable";
  if (value?.verification?.status === "unknown") return "unknown";
  if (value?.verification?.status === "degraded") return "degraded";
  if (value?.result === "failed") return "degraded";
  return "observed";
}

function pluginVersion(value, pack) {
  const version = value?.version;
  if (!version) return pack.values.none;
  if (version.transition === "updated" && version.previous && version.installed) {
    return `${version.previous} -> ${version.installed}`;
  }
  if (version.installed) {
    const transition = version.transition
      ? ` (${localized({ installSetup: pack }, "versionTransitions", version.transition)})`
      : "";
    return `${version.installed}${transition}`;
  }
  if (version.expected) return replacement(pack.values.expectedVersion, { version: version.expected });
  return pack.values.none;
}

function runtimeChecksState(value) {
  return value?.effective ?? value?.status ?? "not_checked";
}

function replacement(template, values = {}) {
  return Object.entries(values).reduce((current, [key, value]) => current.replaceAll(`{${key}}`, String(value)), template);
}

function runtimeConsentPack(registry, language) {
  return localePack(registry, language).installSetup.runtimeConsent;
}

export function renderRuntimeCheckConsentDisclosure(disclosure, {
  retained = null,
  version,
  registry = interactionLocales,
  language = "en",
} = {}) {
  const pack = runtimeConsentPack(registry, language);
  const host = disclosure.surface === "claude" ? "Claude Code"
    : disclosure.surface === "copilot" ? "GitHub Copilot"
    : disclosure.surface === "opencode" ? "OpenCode" : "Codex";
  const lines = [
    "",
    replacement(pack.title, { version, host }),
    replacement(pack.appliesTo, { host }),
    "",
    pack.question,
  ];
  if (retained) {
    lines.push(retained.decision === "enable" ? pack.previousEnabled : pack.previousManual);
    if (retained.decision === "enable") lines.push(replacement(pack.permissionAfterInstall, { host }));
  }
  lines.push(
    "",
    pack.safeTitle,
    pack.reads,
    pack.noProjectChanges,
    pack.noGovernanceAuthority,
    "",
    replacement(pack.savesChoice, { host }),
    pack.chooseAgain,
    replacement(pack.turnOff, { revocation: disclosure.revocation }),
    "",
    pack.chooseTitle,
    pack.enableChoice,
    pack.manualChoice,
    pack.manualDescription,
    pack.detailsChoice,
    pack.cancelChoice,
  );
  return Object.freeze(lines);
}

export function renderRuntimeCheckConsentDetails(disclosure, {
  registry = interactionLocales,
  language = "en",
} = {}) {
  const pack = runtimeConsentPack(registry, language);
  const labels = pack.detailsLabels;
  const permissionOwner = disclosure.surface
    ? localized({ installSetup: pack }, "permissionOwners", disclosure.surface)
    : disclosure.permission_owner;
  if (typeof permissionOwner !== "string" || !permissionOwner.trim()) {
    throw new Error("AGDF_INSTALL_SETUP_PRESENTATION_INVALID_RUNTIME_DISCLOSURE");
  }
  return Object.freeze([
    "",
    pack.detailsTitle,
    `  ${labels.appliesTo}: ${pack.detailsInstallationScope}`,
    `  ${labels.runs}: ${pack.detailsRuns}`,
    `  ${labels.reads}: ${pack.detailsReads}`,
    `  ${labels.saves}: ${pack.detailsWrites}`,
    `  ${labels.permissionControl}: ${permissionOwner}`,
    `  ${labels.command}: ${disclosure.executable}`,
    `  ${labels.renewal}: ${pack.detailsRenewal}`,
    "",
  ]);
}

export function runtimeCheckInteractionCopy({ registry = interactionLocales, language = "en" } = {}) {
  const pack = runtimeConsentPack(registry, language);
  return Object.freeze({
    linePrompt: pack.linePrompt,
    lineInvalid: pack.lineInvalid,
    keyPrompt: pack.keyPrompt,
    keyInvalid: pack.keyInvalid,
    detailsEcho: pack.detailsEcho,
    decisionEcho: Object.freeze({ ...pack.decisionEcho }),
  });
}

export function renderInstallProgress(surface, version, {
  registry = interactionLocales,
  language = "en",
} = {}) {
  const pack = runtimeConsentPack(registry, language);
  const host = surface === "claude" ? "Claude Code"
    : surface === "copilot" ? "GitHub Copilot"
    : surface === "opencode" ? "OpenCode" : "Codex";
  return replacement(pack.progress, { version, host });
}

export function installSetupChoiceOptions(preflight, { registry = interactionLocales, language = "en" } = {}) {
  const pack = localePack(registry, language).installSetup;
  return Object.freeze([
    Object.freeze({
      index: 1,
      value: "full",
      label: pack.choices.full,
      description: pack.choices.fullDescription,
      recommended: true,
      enabled: preflight.full_available,
      blocked_reason: preflight.full_available ? null : localized({ installSetup: pack }, "blockReasons", preflight.full_block_reason),
    }),
    Object.freeze({
      index: 2,
      value: "plugin_only",
      label: pack.choices.plugin_only,
      description: pack.choices.pluginOnlyDescription,
      recommended: false,
      enabled: true,
      blocked_reason: null,
    }),
    Object.freeze({
      index: 3,
      value: "cancel",
      label: pack.choices.cancel,
      description: pack.choices.cancelDescription,
      recommended: false,
      enabled: true,
      blocked_reason: null,
    }),
  ]);
}

export function installSetupScopeOptions(preflight, { registry = interactionLocales, language = "en" } = {}) {
  const pack = localePack(registry, language).installSetup;
  return Object.freeze(["project", "user"].map((scope, index) => {
    const state = preflight.mcp_by_scope[scope];
    return Object.freeze({
      index: index + 1,
      value: scope,
      label: pack.scopeChoices[scope],
      description: pack.scopeChoices[`${scope}Description`],
      recommended: scope === "project",
      existing: state.selected_status === "matched",
      enabled: state.available,
      blocked_reason: state.available ? null : localized({ installSetup: pack }, "blockReasons", state.block_reason),
    });
  }).concat(Object.freeze({
    index: 3,
    value: "back",
    label: pack.scopeChoices.back,
    description: pack.scopeChoices.backDescription,
    recommended: false,
    existing: false,
    enabled: true,
    blocked_reason: null,
  })));
}

export function renderInstallSetupPreflight(preflight, { registry = interactionLocales, language = "en" } = {}) {
  const pack = localePack(registry, language).installSetup;
  const labels = pack.labels;
  const value = pack.values;
  const options = installSetupChoiceOptions(preflight, { registry, language });
  const target = preflight.target ?? value.none;
  const pluginConfiguration = preflight.plugin_configuration ?? value.none;
  const availableScopes = ["project", "user"]
    .filter((scope) => preflight.mcp_by_scope[scope].available)
    .map((scope) => localized({ installSetup: pack }, "scopes", scope))
    .join(", ") || value.none;
  const lines = [
    pack.title,
    `${labels.surface}: ${preflight.surface}`,
    `${labels.version}: ${preflight.version}`,
    `${labels.plugin}: ${localized({ installSetup: pack }, "pluginStates", preflight.plugin.status)}`,
    `${labels.mcp}: ${availableScopes}`,
    `${labels.target}: ${target}`,
    `${labels.targetSource}: ${localized({ installSetup: pack }, "targetSources", preflight.target_source)}`,
    `${labels.invocationDirectorySource}: ${localized({ installSetup: pack }, "invocationDirectorySources", preflight.invocation_directory_source)}`,
    `${labels.pluginConfiguration}: ${pluginConfiguration}`,
    `${labels.localExecution}: ${preflight.local_execution ? value.yes : value.no}`,
    `${labels.packageAcquisition}: ${preflight.package_acquisition_required ? value.required : value.not_required}`,
    `${labels.removal}: ${preflight.removal_overview}`,
    `${labels.authorizes}: ${preflight.authorizes}`,
    "",
  ];
  for (const option of options) {
    const recommended = option.recommended ? ` (${pack.choices.recommended})` : "";
    lines.push(`  [${option.index}] ${option.label}${recommended}`);
    lines.push(`      ${option.description}`);
    if (!option.enabled) lines.push(`      ${replacement(pack.blockedChoice, { reason: option.blocked_reason })}`);
  }
  return lines.join("\n");
}

export function renderInstallSetupScopePreflight(preflight, { registry = interactionLocales, language = "en" } = {}) {
  const pack = localePack(registry, language).installSetup;
  const labels = pack.labels;
  const values = pack.values;
  const options = installSetupScopeOptions(preflight, { registry, language });
  const lines = [
    pack.scopeTitle,
    `${labels.invocationContext}: ${preflight.target ?? values.none}`,
    `${labels.invocationDirectorySource}: ${localized({ installSetup: pack }, "invocationDirectorySources", preflight.invocation_directory_source)}`,
  ];
  for (const option of options) {
    const recommended = option.recommended ? ` (${pack.choices.recommended})` : "";
    const existing = option.existing ? ` (${pack.scopeChoices.existing})` : "";
    lines.push(`  [${option.index}] ${option.label}${recommended}${existing}`);
    lines.push(`      ${option.description}`);
    if (option.value !== "back") {
      const state = preflight.mcp_by_scope[option.value];
      lines.push(`      ${labels.mcp}: ${localized({ installSetup: pack }, "mcpStates", state.status)}`);
      lines.push(`      ${labels.selectedStatus}: ${localized({ installSetup: pack }, "registrationStates", state.selected_status)}`);
      lines.push(`      ${labels.effectiveSource}: ${localized({ installSetup: pack }, "effectiveSources", state.effective_source)}`);
      lines.push(`      ${labels.registrationPath}: ${state.registration_path ?? values.none}`);
      lines.push(`      ${labels.removal}: ${state.removal_command}`);
    }
    if (!option.enabled) lines.push(`      ${replacement(pack.blockedScopeChoice, { reason: option.blocked_reason })}`);
  }
  return lines.join("\n");
}

export function projectInstallSetupResult(report, { registry = interactionLocales, language = "en" } = {}) {
  const pack = localePack(registry, language).installSetup;
  const actionText = localized({ installSetup: pack }, "actions", report.next_action.code);
  if (report.failure) {
    localized({ installSetup: pack }, "failurePhases", report.failure.phase);
    localized({ installSetup: pack }, "failureCodes", report.failure.code);
  }
  for (const reason of report.restart.reasons) localized({ installSetup: pack }, "restartReasons", reason);
  localized({ installSetup: pack }, "results", report.result);
  localized({ installSetup: pack }, "setupRequests", report.setup_request);
  localized({ installSetup: pack }, "effectiveStates", report.effective_state);
  localized({ installSetup: pack }, "discoveryStates", report.discovery.status);
  localized({ installSetup: pack }, "mcpStates", mcpState(report.mcp));
  localized({ installSetup: pack }, "pluginStates", pluginState(report.plugin));
  localized({ installSetup: pack }, "runtimeCheckStates", runtimeChecksState(report.runtime_checks));
  return Object.freeze({
    ...report,
    next_action: Object.freeze({ ...report.next_action, text: actionText }),
  });
}

export function renderInstallSetupText(report, { registry = interactionLocales, language = "en" } = {}) {
  const pack = localePack(registry, language).installSetup;
  const projected = projectInstallSetupResult(report, { registry, language });
  const labels = pack.labels;
  const values = pack.values;
  const failure = report.failure
    ? `${localized({ installSetup: pack }, "failurePhases", report.failure.phase)}: ${localized({ installSetup: pack }, "failureCodes", report.failure.code)}`
    : values.none;
  const targetLabel = report.requested_scope === "user" ? labels.invocationContext : labels.target;
  const registration = report.mcp?.registration;
  return [
    pack.title,
    `${labels.result}: ${localized({ installSetup: pack }, "results", report.result)}`,
    `${labels.setupRequest}: ${localized({ installSetup: pack }, "setupRequests", report.setup_request)}`,
    `${labels.effectiveState}: ${localized({ installSetup: pack }, "effectiveStates", report.effective_state)}`,
    `${labels.surface}: ${report.surface}`,
    `${labels.version}: ${pluginVersion(report.plugin, pack)}`,
    `${targetLabel}: ${report.target ?? values.none}`,
    `${labels.invocationDirectorySource}: ${localized({ installSetup: pack }, "invocationDirectorySources", report.invocation_directory_source)}`,
    `${labels.scope}: ${report.requested_scope ? localized({ installSetup: pack }, "scopes", report.requested_scope) : values.none}`,
    `${labels.registrationPath}: ${registration?.path ?? values.none}`,
    `${labels.effectiveSource}: ${localized({ installSetup: pack }, "effectiveSources", registration?.effective_source ?? "none")}`,
    `${labels.plugin}: ${localized({ installSetup: pack }, "pluginStates", pluginState(report.plugin))}`,
    `${labels.runtimeChecks}: ${localized({ installSetup: pack }, "runtimeCheckStates", runtimeChecksState(report.runtime_checks))}`,
    `${labels.mcp}: ${localized({ installSetup: pack }, "mcpStates", mcpState(report.mcp))}`,
    `${labels.discovery}: ${localized({ installSetup: pack }, "discoveryStates", report.discovery.status)}`,
    `${labels.restart}: ${report.restart.required ? values.yes : values.no}`,
    `${labels.failure}: ${failure}`,
    `${labels.authorizes}: ${report.authorizes}`,
    `${labels.nextAction}: ${projected.next_action.text}`,
  ].join("\n");
}

export function printInstallSetupResult(report, { json = false, io = console, registry = interactionLocales, language = "en" } = {}) {
  io.log(json
    ? JSON.stringify(projectInstallSetupResult(report, { registry, language }), null, 2)
    : renderInstallSetupText(report, { registry, language }));
}
