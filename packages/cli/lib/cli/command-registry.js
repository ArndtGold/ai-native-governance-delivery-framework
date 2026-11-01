import { TASK_TARGET_SOURCES } from "#agdf-core/task-target-resolution.js";
import { skillDispatchArgumentGrammar, skillDispatchCommandGrammar } from "#agdf-core/skill-dispatch/contract.js";
import { validateReadSelection } from "#agdf-core/control-inspect/selection.js";
import { RUN_COMMAND_GROUPS } from '#agdf-core/control-state/run-command-contract.js';
export { skillDispatchArgumentGrammar };
export const commandGroupRoutes = Object.freeze(Object.fromEntries(Object.keys(RUN_COMMAND_GROUPS).map(group => [group.replace('_', '-'), group])));

const TASK_TARGET_SOURCE_GRAMMAR = `<${TASK_TARGET_SOURCES.join("|")}>`;

function command(name, usages) {
  return Object.freeze({
    name,
    handler: name,
    groups: Object.freeze(Object.keys(usages)),
    usages: Object.freeze(Object.fromEntries(
      Object.entries(usages).map(([group, suffixes]) => [group, Object.freeze(suffixes)]),
    )),
  });
}

export const commandRegistry = Object.freeze([
  command("codex", { preferred: [" [--package <core|planning>] [--with-mcp --dir <absolute-target> [--scope <project|user>] | --plugin-only]"], scaffold: [""] }),
  command("codex-repo", { preferred: [" --dir <path>"], scaffold: [" --dir <path>"] }),
  command("claude", { preferred: [" [--with-mcp --dir <absolute-target> [--scope <project|user>] | --plugin-only]"], scaffold: [""] }),
  command("copilot", { preferred: [" [--with-mcp --dir <absolute-target> [--scope <project|user>] | --plugin-only]"] }),
  command("opencode", { preferred: [" [--with-mcp --dir <absolute-target> [--scope <project|user>] | --plugin-only]"], scaffold: [""] }),
  command("opencode-status", { preferred: [""], scaffold: [""] }),
  command("status", { preferred: [" [--surface <surface>] [--dir <absolute-target> [--scope <project|user>]] [--run <run_id>] [--json]"] }),
  command("runtime-checks", { preferred: [" <status|enable|manual> --surface <codex|claude|copilot|opencode> [--json]"] }),
  command("mcp", { preferred: [" <status|enable|disable> --surface <codex|claude|copilot|opencode> [--scope <project|user>] --dir <absolute-target> [--json]"] }),
  command("disable", { preferred: [" --surface <surface> [--scope repository] [--shared] [--dir <path>] [--with-mcp]"] }),
  command("uninstall", { preferred: [" --surface <surface> --scope global [--with-mcp --mcp-scope <project|user> --dir <absolute-target>] [--confirm]"] }),
  command("opencode-repo", { preferred: [" --dir <path>"], scaffold: [" --dir <path>"] }),
  command("init", { preferred: [" [--operation <original-uuid>]"], scaffold: [""] }),
  command("config", { scaffold: [" --language de"] }),
  command("target-check", { local: [` --json [--language <tag>] [--working-directory <absolute-path>] [--target-source ${TASK_TARGET_SOURCE_GRAMMAR} --primary-target <absolute-path>]`] }),
  command("skill-dispatch", { local: [` ${skillDispatchCommandGrammar()}`] }),
  command("doctor", { local: [""], scaffold: [""], legacy: [" --json"] }),
  command("gate-check", { local: [" --approval-envelope", " --json"], scaffold: [""], legacy: [" --json"] }),
  command("delivery-map", { local: [" --json"], scaffold: [""] }),
  command("inventory", { local: [" [--json] [--language <tag>]"] }),
  command('planned', { local: [' --dir <absolute-target> --action <list|inspect|create|replace|start|status> [--plan-id <id> --source-digest <sha256>] [--evidence <UR.md> --priority <high|normal|low>] [--operation <uuid>]'] }),
  command("delivery-path-search", {
    local: [" --surface codex --json", " --surface claude --json", " --surface opencode --json"],
    scaffold: [" --surface codex", " --surface claude", " --surface opencode"],
  }),
  command("contract", { local: [" --module <runtime-contract-module> [--json]"] }),
  command("control-maintenance", { local: [" --dir <absolute-repository> [--details | --json] [--language <tag>]"] }),
  command('run-create', { local: [' --title <title> [--operation <original-uuid>]'] }),
  command('run-present', { local: [' --run <id> --revision <uuid> --gate <gate> [--operation <original-uuid>]'] }),
  command('run-approve', { local: [' --run <id> --revision <uuid> --gate <gate> --presentation <uuid> --response <exact-reply> [--operation <original-uuid>]'] }),
  command('run-step', { local: [' --run <id> --revision <uuid> --step <ur|route|review|evidence|artefact|closeout> --evidence <source-file> [step fields] [--operation <original-uuid>]'] }),
  command('run-revise', { local: [' --run <id> --revision <uuid> --operation <original-uuid> [--preview|--apply|--inspect|--recover --source-gate <UR|PRD|SD|TP> --evidence <current-proposal.json>] [--confirmation <exact-selector>]'] }),
  command('run-close', { local: [' --action <preview|apply> [--closure-file <entries.json>|--run <id> --outcome <superseded|abandoned> --reason <text>] [--preview-id <id> --confirmation <exact-selector>] [--operation <original-uuid>]'] }),
  ...Object.keys(commandGroupRoutes).map(name => command(name, { local: [' --command-file <bounded-command.json>'] })),
]);

const commandByName = new Map(commandRegistry.map((entry) => [entry.name, entry]));

export function resolveCommand(name) {
  return commandByName.get(name) ?? null;
}

export function supportedCommandNames() {
  return commandRegistry.map((entry) => entry.name);
}

export function validateCommandOptions(options) {
  if (['run-create', 'run-present', 'run-approve', 'run-step', 'run-revise', 'run-close'].includes(options.target)) {
    if (options.commandFile || options.allActive || options.force || options.intake || options.continueDelivery || options.packageSelection) throw Error('A current Run command rejects unrelated scopes and force.');
    if (options.target === 'run-create' && (options.runId || !options.stepFields?.title)) throw Error('run-create requires --title; its original UUID determines the new Run ID.');
    if (!['run-create', 'run-close'].includes(options.target) && (!options.runId || !options.revisionId)) throw Error('The current Run command requires --run and --revision.');
    if (options.target === 'run-present' && !options.gate) throw Error('run-present requires --gate.');
    if (options.target === 'run-approve' && (!options.gate || !options.response || !options.presentationId)) throw Error('run-approve requires --gate, --presentation and --response.');
    if (options.target === 'run-step' && !options.runStep) throw Error('run-step requires --step.');
    if (options.target === 'run-revise' && !options.revisionMode && options.gate !== 'PRD') throw Error('Early source reopening requires --gate PRD; other sources use explicit preview/apply.');
    if (options.target === 'run-revise' && !options.operationId) throw Error('run-revise requires the original --operation UUID.');
    if (options.target === 'run-close' && !['preview', 'apply'].includes(options.recoveryAction)) throw Error('run-close requires --action preview or apply.');
    return options;
  }

  if (options.target === 'planned') {
    if (!options.dirExplicit || !options.dirInputAbsolute || options.runId || options.revisionId || options.gate || options.allActive
      || options.force || options.intake || options.continueDelivery || options.commandFile || options.packageSelection) throw Error('Planning requires an explicit absolute --dir and no Run/gate/force scope');
    const actions = ['list', 'inspect', 'create', 'replace', 'start', 'status'];
    if (!actions.includes(options.recoveryAction)) throw Error('Unsupported planning action');
    if (options.target === 'planned') {
      if (['inspect', 'replace', 'start', 'status'].includes(options.recoveryAction) && !options.planId) throw Error('--plan-id is required for the selected source');
      if (['replace', 'start'].includes(options.recoveryAction) && !options.sourceDigest) throw Error('--source-digest is required');
      if (['create', 'replace'].includes(options.recoveryAction) && !options.stepFields.evidence) throw Error('--evidence UR.md is required');
      if (options.priority && (options.recoveryAction !== 'create' || !['high', 'normal', 'low'].includes(options.priority))) throw Error('Priority is high, normal or low on create; replacement edits canonical metadata');
      if (options.recoveryAction === 'create' && (options.planId || options.sourceDigest)) throw Error('Create derives its plan identity from the original UUID');
    }
    if (['apply', 'recover', 'status'].includes(options.recoveryAction) && !options.operationId) throw Error('--operation must retain the original UUID');
    return options;
  }
  if (options.packageSelection !== undefined && (options.target !== 'codex' || !['core', 'planning'].includes(options.packageSelection))) throw Error('--package supports only codex core or planning');
  if (options.packageSelection === 'planning' && (options.setupRequest !== 'plugin_only' || options.acceptPluginCapabilities || options.runtimeChecksDecision
    || options.controlDir || options.scope)) throw Error('The optional package requires --plugin-only and does not change Core setup, hooks or project control');
  if ([options.planId, options.sourceDigest, options.priority, options.pendingDigest].some(value => value !== undefined)) throw Error('Planning source fields require planned');
  if (Object.hasOwn(commandGroupRoutes, options.target)) {
    if (!options.commandFile) throw new Error('Bound command routes require --command-file; target/Run/revision/UUID are taken only from that strict envelope.');
    return options;
  }
  if (options.commandFile) throw new Error('--command-file requires a fixed AGDF command-group route');
  if (options.guided) throw Error('Guided migration/reset is unsupported; inspect current control and recover only the original bounded operation.');
  if ((options.details) && options.target !== "control-maintenance") {
    throw new Error("--guided and --details are supported only by control-maintenance");
  }
  if (options.target === "control-maintenance") {
    if (!options.dirExplicit || !options.dirInputAbsolute) throw new Error("control-maintenance requires an explicit absolute --dir target");
    if (options.guided && (options.json || options.details)) throw new Error("--guided cannot be combined with --json or --details");
    if (options.runId || options.allActive || options.force || options.confirm || options.persist) throw new Error("control-maintenance does not support run selection or implicit apply flags");
  }
  const installTargets = ["codex", "claude", "copilot", "opencode"];
  const installTarget = installTargets.includes(options.target);
  if ((options.controlDir) && !installTarget) {
    throw new Error("--control-dir is supported only by installation commands");
  }

  if (options.target !== "mcp" && options.target !== "status" && !installTarget && ["project", "user"].includes(options.scope)) {
    throw new Error("project and user scopes are supported only by mcp or a full installation setup");
  }
  if (options.setupRequest && !installTarget && !["disable", "uninstall"].includes(options.target)) {
    throw new Error("--with-mcp and --plugin-only are supported only by installation, disable and uninstall commands");
  }
  if (options.setupRequest === "plugin_only" && !installTarget) {
    throw new Error("--plugin-only is supported only by codex, claude, copilot and opencode installation commands");
  }
  if (installTarget && options.scope && (options.setupRequest !== "full" || !["project", "user"].includes(options.scope))) {
    throw new Error("Installation --scope project or user requires --with-mcp");
  }
  if (options.mcpScope && !(options.target === "uninstall" && options.setupRequest === "full")) {
    throw new Error("--mcp-scope is supported only by uninstall --with-mcp");
  }
  if (options.target === "status" && options.scope && (!options.dirExplicit
      || !["codex", "claude", "copilot", "opencode"].includes(options.surface))) {
    throw new Error("status --scope requires an explicit --surface and --dir target");
  }
  if (["codex-repo", "opencode-repo"].includes(options.target) && !options.dirExplicit) {
    throw new Error(`${options.target} requires an explicit --dir`);
  }
  const targetOptionsUsed = Boolean(options.targetSource || options.primaryTarget || options.workingDirectoryExplicit || options.targetChanged
    || options.targetCandidates?.length || options.evidenceSources?.length);
  if (targetOptionsUsed && !["target-check", "skill-dispatch"].includes(options.target)) {
    throw new Error("Task-target options are supported only by target-check and skill-dispatch");
  }
  if (options.target === "target-check" && !options.json) {
    throw new Error("target-check requires --json");
  }
  if (options.skillId && options.target !== "skill-dispatch") throw new Error("--skill is supported only by skill-dispatch");
  if ((options.intakeMode || options.urAction || options.prdAction || options.sdAction || options.tpAction || options.continueDelivery) && options.target !== "skill-dispatch") throw new Error("delivery modes are supported only by skill-dispatch");
  if (options.operationId !== undefined && options.target !== 'init') throw Error('--operation is supported only by init or planned; other writes use the bound command file.');
  if (options.assurance !== undefined || options.revisionMode || options.sourceGate !== undefined || options.previewDigest !== undefined || options.presentationId)
    throw Error('Use the current bound AGDF command group and --command-file for delivery writes.');
  if (options.intake && options.target !== "skill-dispatch") throw new Error("--intake is supported only by skill-dispatch");
  if (options.target === "skill-dispatch") {
    if (!options.json) throw new Error("skill-dispatch requires --json");
    if (!options.skillId) throw new Error("skill-dispatch requires --skill");
    if (!options.surfaceExplicit || options.surface === "generic") throw new Error("skill-dispatch requires --surface codex, claude, copilot or opencode");
    if (!options.languageExplicit) throw new Error("skill-dispatch requires --language");
    if (!options.workingDirectoryExplicit) throw new Error("skill-dispatch requires --working-directory");
    if (options.targetChanged || options.targetCandidates?.length || options.evidenceSources?.length) {
      throw new Error("skill-dispatch accepts only the paired --target-source and --primary-target target options");
    }
  }
  // Shared read-selection rules (MCP agdf_inspect applies the same function). The gate-check
  // --status-card/--approval-envelope flags keep their historical CLI tolerance and are not passed here.
  validateReadSelection({ operation: options.target, allActive: options.allActive, contractModule: options.contractModule, runId: options.runId });
  if (options.gate || options.response !== undefined || options.runStep || options.recoveryAction || options.recoveryPreviewId
    || options.recoveryConfirmation || options.closureFile || options.closureOutcome || options.successorRun !== undefined
    || options.successorReference !== undefined || options.closureConfirmation !== undefined)
    throw Error('Use the current bound AGDF command group and --command-file for delivery writes.');
  if (options.revisionId && options.target !== 'skill-dispatch') throw Error('--revision is supported only by skill-dispatch; a bound write takes its revision from the command file.');
  if (Object.keys(options.stepFields ?? {}).length && !(options.target === 'mcp' && (options.retireCockpit || options.restoreCockpit)
    && Object.keys(options.stepFields).every(key => key === 'evidence')))
    throw Error('Delivery sources belong to the bound command file; --evidence is reserved for explicit MCP cockpit retirement/recovery.');
  if (["disable", "uninstall"].includes(options.target) && ["", "generic", undefined].includes(options.surface)) {
    throw new Error(`${options.target} requires an explicit --surface`);
  }
  if (options.target === "disable" && options.scope && options.scope !== "repository") {
    throw new Error("disable supports repository scope only");
  }
  if (options.target === "uninstall" && options.scope !== "global") {
    throw new Error("uninstall requires explicit --scope global");
  }
  if (options.confirm && options.target !== "uninstall") throw new Error("--confirm is supported only by uninstall");
  if (options.shared && !(options.target === "disable" && options.surface === "copilot" && options.scope === "repository")) {
    throw new Error("--shared is supported only by disable --surface copilot --scope repository");
  }
  if (options.target === "disable" && options.surface === "copilot" && options.scope !== "repository") {
    throw new Error("Copilot disable requires explicit --scope repository");
  }
  if (options.target === "disable" && options.setupRequest === "full" && !options.dirExplicit) {
    throw new Error("disable --with-mcp requires an explicit --dir target");
  }
  if (options.target === "disable" && options.setupRequest === "full" && options.scope !== "repository") {
    throw new Error("disable --with-mcp requires explicit --scope repository");
  }
  if (options.target === "uninstall" && options.setupRequest === "full") {
    if (!options.mcpScope) throw new Error("uninstall --with-mcp requires --mcp-scope project or user");
    if (!options.dirExplicit || !options.dirInputAbsolute) throw new Error("uninstall --with-mcp requires an explicit absolute --dir target");
  }
  if (options.runtimeChecksDecision && !["codex", "claude", "copilot", "opencode"].includes(options.target)) {
    throw new Error("--runtime-checks is supported only by codex, claude, copilot and opencode installation commands");
  }
  if (options.acceptPluginCapabilities && (options.target !== "codex"
      || (options.runtimeChecksDecision && options.runtimeChecksDecision !== "enable"))) {
    throw new Error("--accept-plugin-capabilities requires codex installation and cannot be combined with manual or cancel.");
  }
  if (options.target === "runtime-checks" && !["codex", "claude", "copilot", "opencode"].includes(options.surface)) {
    throw new Error("runtime-checks requires --surface codex, claude, copilot or opencode");
  }
  if (options.target === "mcp") {
    if (!["status", "enable", "disable"].includes(options.mcpAction)) throw new Error("mcp requires status, enable or disable");
    if (!["codex", "claude", "copilot", "opencode"].includes(options.surface) || !options.surfaceExplicit) {
      throw new Error("mcp requires --surface codex, claude, copilot or opencode");
    }
    if (!options.dirExplicit) throw new Error("mcp requires an explicit --dir target");
    if (options.scope && !["project", "user"].includes(options.scope)) throw new Error("mcp --scope must be project or user");
  }
  if (options.retireCockpit !== undefined || options.restoreCockpit !== undefined) {
    if (options.target !== 'mcp' || options.surface !== 'codex' || options.scope !== 'project'
      || options.retireCockpit && options.restoreCockpit
      || !['agdf-cockpit', 'agdf-cockpit-local'].includes(options.retireCockpit ?? options.restoreCockpit)
      || (options.retireCockpit ? options.mcpAction !== 'disable' : options.mcpAction !== 'enable')
      || !options.stepFields?.evidence) throw new Error('Cockpit transition requires Codex project scope, matching enable/disable and exact --evidence');
  }
  if (options.approvalEnvelope && options.target !== "gate-check") throw new Error("--approval-envelope is supported only by gate-check");
  if (options.approvalEnvelope && (options.json || options.statusCard || options.allActive)) {
    throw new Error("--approval-envelope cannot be combined with --json, --status-card or --all-active");
  }
  return options;
}

function usageLines(group, prefix) {
  return commandRegistry
    .flatMap((entry) => (entry.usages[group] ?? []).map((suffix) => `  ${prefix}${entry.name}${suffix}`))
    .join("\n");
}

export function renderUsage() {
  return `AGDF CLI

Operating model:
  Chat/skill is the normal interaction surface.
  .agdf/control is the durable source of truth.
  The CLI validates, renders deterministic gate output and supports automation.

Repeated local validation (after global installation):
${usageLines("local", "agdf ")}

Bootstrap, installation and explicit refresh:

Bootstrap and lifecycle commands:
${usageLines("preferred", "npx --yes @agdf/cli@latest ")}

Advanced / Compatibility

Scaffold-compatible npm create usage:
${usageLines("scaffold", "npm create agdf@latest -- ")}

Backward-compatible create-agdf usage:
${usageLines("legacy", "npx --yes create-agdf@latest ")}

Options:
  --dir <path>   Select an explicit target directory. OpenCode installation uses it as its config directory; MCP requires an absolute repository target.
  --with-mcp     Install the plugin and explicitly enable AGDF MCP for the selected target.
  --plugin-only  Install or update only the plugin and leave MCP unchanged.
  --control-dir <absolute-repository>
                 Inspect existing project control separately from host configuration; inspection never resets or converts it.
  --force        Overwrite existing generated files
  --language <tag>
                 Set AGDF chat and artefact language. Defaults to detected system locale.
  --lang <tag>   Alias for --language
  --json         Print machine-readable command output as JSON
  --verbose       Print captured host command output and generated-file details
  --status-card  Print compact gate-check status-card output for interactive use
  --approval-envelope
                 Preview the current gate artefact; run-present is required before asking for approval
  --run <run_id> Select one canonical run
  Delivery writes use the fixed agdf-* command group and --command-file.
  init --operation <original-uuid> preserves an interrupted initialization identity.
  --shared       Apply Copilot repository disable through shared .github/copilot/settings.json
  --runtime-checks <enable|manual|cancel>
                 Make the installation-time automatic-check decision explicitly; no TTY defaults to manual
  --accept-plugin-capabilities
                 Codex install: consent to the AGDF hook and approve only agdf_dispatch. Native hook trust remains separate.
  --fixture <path>
                 Use deterministic evaluator/candidate fixtures instead of a live evaluator
  --persist      Persist the redacted Delivery Path Search result under the current scope
  --model <id>   Optional Codex evaluator model
  --generate-candidates
                 Add one bounded AI-native candidate-generation call before evaluation
  --generator-model <id>
                 Optional candidate-generator model override
  --max-generated-candidates <1-5>
  --generation-timeout-ms <1-30000>
  --generation-cost-units <1-5>
  --help         Show this help
`;
}
