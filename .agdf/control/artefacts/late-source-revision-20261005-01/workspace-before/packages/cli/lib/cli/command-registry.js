import { TASK_TARGET_SOURCES } from "#agdf-core/task-target-resolution.js";
import { skillDispatchArgumentGrammar, skillDispatchCommandGrammar } from "#agdf-core/skill-dispatch/contract.js";
import { validateReadSelection } from "#agdf-core/control-inspect/selection.js";
export { skillDispatchArgumentGrammar };

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
  command("codex", { preferred: [" [--with-mcp --dir <absolute-target> [--scope <project|user>] | --plugin-only]"], scaffold: [""] }),
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
  command("init", { preferred: [""], scaffold: [""] }),
  command("config", { scaffold: [" --language de"] }),
  command("target-check", { local: [` --json [--language <tag>] [--working-directory <absolute-path>] [--target-source ${TASK_TARGET_SOURCE_GRAMMAR} --primary-target <absolute-path>]`] }),
  command("skill-dispatch", { local: [` ${skillDispatchCommandGrammar()}`] }),
  command("doctor", { local: [""], scaffold: [""], legacy: [" --json"] }),
  command("gate-check", { local: [" --approval-envelope", " --json"], scaffold: [""], legacy: [" --json"] }),
  command("delivery-map", { local: [" --json"], scaffold: [""] }),
  command("delivery-path-search", {
    local: [" --surface codex --json", " --surface claude --json", " --surface opencode --json"],
    scaffold: [" --surface codex", " --surface claude", " --surface opencode"],
  }),
  command("contract", { local: [" --module <runtime-contract-module> [--json]"] }),
  command("control-maintenance", { local: [" --dir <absolute-repository> [--guided | --details | --json] [--language <tag>]"] }),
  command("run-present", { local: [" --run <run_id> --gate <gate> --revision <revision_id>"] }),
  command("run-create", { local: [" --run <run_id>"] }),
  command("run-update", { local: [" --run <run_id> --revision <revision_id>"] }),
  command("run-revise", { local: [" --run <run_id> --revision <revision_id>"] }),
  command("run-step", { local: [" --run <run_id> --revision <revision_id> --step <ur|route|review|evidence|closeout|artefact> [step fields]"] }),
  command("run-approve", { local: [" --run <run_id> --gate <UR|PRD|SD|TP|QA|UAT> --revision <revision_id> --presentation <presentation_id> --response \"Approval: <gate>\""] }),
  command("run-migrate", { local: [" [--run <run_id>]"] }),
  command("run-recovery", { local: [" --run <run_id> --action <inspect|preview>", " --run <run_id> --action apply --preview-id <uuid> --recovery-confirmation \"RECOVER <run_id> <preview_id>\""] }),
  command("run-render-legacy", { local: [" --run <run_id>"] }),
]);

const commandByName = new Map(commandRegistry.map((entry) => [entry.name, entry]));

export function resolveCommand(name) {
  return commandByName.get(name) ?? null;
}

export function supportedCommandNames() {
  return commandRegistry.map((entry) => entry.name);
}

export function validateCommandOptions(options) {
  if ((options.guided || options.details) && options.target !== "control-maintenance") {
    throw new Error("--guided and --details are supported only by control-maintenance");
  }
  if (options.target === "control-maintenance") {
    if (!options.dirExplicit || !options.dirInputAbsolute) throw new Error("control-maintenance requires an explicit absolute --dir target");
    if (options.guided && (options.json || options.details)) throw new Error("--guided cannot be combined with --json or --details");
    if (options.runId || options.allActive || options.force || options.confirm || options.persist) throw new Error("control-maintenance does not support run selection or implicit apply flags");
  }
  const installTargets = ["codex", "claude", "copilot", "opencode"];
  const installTarget = installTargets.includes(options.target);
  if ((options.controlDir || options.controlMigration) && !installTarget) {
    throw new Error("--control-dir and --control-migration are supported only by installation commands");
  }
  if (options.controlMigration === "safe" && !options.controlDir
      && !(options.dirExplicit && (options.target !== "opencode" || options.setupRequest === "full"))) {
    throw new Error("--control-migration safe requires an explicit repository target (--control-dir or --dir).");
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
  if ((options.intakeMode || options.urAction || options.prdAction || options.sdAction || options.continueDelivery) && options.target !== "skill-dispatch") throw new Error("delivery modes are supported only by skill-dispatch");
  if ((options.operationId !== undefined || options.assurance !== undefined) && options.target !== "run-approve") {
    throw new Error("--operation and --assurance are supported only by run-approve");
  }
  if (options.presentationId && options.target !== "run-approve") throw new Error("--presentation is supported only by run-approve");
  if (options.target === "run-present" && (!options.runId || !options.gate || !options.revisionId)) throw new Error("run-present requires --run, --gate and --revision");
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
  validateReadSelection({ operation: options.target, allActive: options.allActive, contractModule: options.contractModule });
  if (options.target === "run-create" && (!options.runId || options.allActive)) {
    throw new Error("run-create requires --run and rejects --all-active");
  }
  if (options.target === "run-recovery") {
    if (!options.runId || !["inspect", "preview", "apply"].includes(options.recoveryAction)) {
      throw new Error("run-recovery requires --run and --action inspect, preview or apply");
    }
    if (options.recoveryAction === "apply" && (!options.recoveryPreviewId || !options.recoveryConfirmation)) {
      throw new Error("run-recovery apply requires --preview-id and --recovery-confirmation");
    }
    if (options.recoveryAction !== "apply" && (options.recoveryPreviewId || options.recoveryConfirmation)) {
      throw new Error("--preview-id and --recovery-confirmation are supported only by run-recovery apply");
    }
  } else if (options.recoveryAction || options.recoveryPreviewId || options.recoveryConfirmation) {
    throw new Error("--action, --preview-id and --recovery-confirmation are supported only by run-recovery");
  }
  if ((options.gate && !["run-approve", "run-present"].includes(options.target)
      && !(options.target === "run-step" && options.runStep === "artefact")) || (options.response !== undefined && options.target !== "run-approve")) {
    throw new Error("--gate is supported by run-present/run-approve; --response only by run-approve");
  }
  if (options.revisionId && !["run-update", "run-revise", "run-approve", "run-step", "run-present", "skill-dispatch"].includes(options.target)) {
    throw new Error("--revision is supported only by run-update, run-revise, run-present, run-approve, run-step and skill-dispatch");
  }
  if ((options.runStep || Object.keys(options.stepFields ?? {}).length) && options.target !== "run-step") {
    throw new Error("--step and step fields are supported only by run-step");
  }
  if (options.target === "run-step" && (!options.runId || !options.revisionId || !options.runStep)) {
    throw new Error("run-step requires --run, --revision and --step");
  }
  if (options.target === "run-step" && options.runStep === "artefact"
      && (!["PRD", "SD", "TP", "QA"].includes(options.gate) || !options.stepFields?.evidence
        || Object.keys(options.stepFields).some(key => key !== "evidence"))) throw new Error("run-step artefact requires --gate PRD|SD|TP|QA and --evidence <recording-input.json>; other step fields are rejected");
  if (options.target === "run-update" && (!options.runId || !options.revisionId || options.gate || options.response !== undefined)) {
    throw new Error("run-update requires --run and --revision and rejects --gate and --response");
  }
  if (options.target === "run-revise" && (!options.runId || !options.revisionId || options.gate || options.response !== undefined)) {
    throw new Error("run-revise requires --run and --revision and rejects --gate and --response");
  }
  if (options.target === "run-approve" && (!options.runId || !options.gate || !options.revisionId || options.response === undefined)) {
    throw new Error("run-approve requires --run, --gate, --revision and --response");
  }
  if (options.target === "run-render-legacy" && !options.runId) {
    throw new Error("run-render-legacy requires --run");
  }
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
                 Inspect existing .agdf state separately from host configuration; enables safe migrations.
  --control-migration <inspect|safe>
                 Inspect without changes, or migrate eligible unsealed runs in the explicit repository.
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
  --action <inspect|preview|apply>
                 run-recovery operation; apply also requires its preview ID and exact recovery confirmation
  --preview-id <uuid>
                 Bind run-recovery apply to one stored read-only preview
  --recovery-confirmation <text>
                 Exact confirmation printed by run-recovery preview
  --module <runtime-contract-module>
                 Runtime-contract module for contract, for example gate-transition
  --step <ur|route|review|evidence|closeout|artefact>
                 Standard transition for run-step. artefact --gate PRD|SD|TP|QA --evidence <recording-input.json>;
                 other step fields: ur --title; route --route
                 <quick_task|verified_change|structured_slice|structured_delivery|block> --reason
                 --evidence; review --decision <pass|revise|block> --evidence [--source]; evidence
                 --evidence [--source --covers]; closeout --result --evidence --risk --next
  --revision <revision_id>
                 Expected current run revision for run-update, run-revise, run-present, run-approve and run-step
  --gate <UR|PRD|SD|TP|QA|UAT>
                 Gate to present or approve
  --response <text>
                 The user's verbatim reply to the presented gate question
  --target-source ${TASK_TARGET_SOURCE_GRAMMAR}
                 Classify the semantic source for target-check
  --primary-target <absolute-path>
                 Supply exactly one target for target-check; cwd is never implied
  --working-directory <absolute-path>
                 Report execution context without granting target authority
  --skill <skill-id>
                 Select one canonical skill for skill-dispatch
  --intake-mode <new|resume>  Explicit new scope or bound intake recovery; requires --intake and --run
  --ur-action revise  Explicit unapproved UR revision; requires revision-bound resume intake
  --prd-action revise Explicit unapproved PRD revision; requires revision-bound resume intake
  --sd-action revise Explicit unapproved SD revision; requires revision-bound resume intake
  --continue-delivery  Bound internal continuation; excludes intake and read-only status
  --operation <uuid>     Explicit idempotent run-approve command identity
  --assurance <lane>     Only cooperative_local is supported; no independent human proof
  --presentation <uuid>  Previously prepared run-present binding required for run-approve
  --intake       Declare the governed delivery intake (delivery.start) for a gate-check skill-dispatch
  --target-candidate <absolute-path>
                 Repeat to expose competing plausible targets
  --evidence-source <value>
                 Repeat to report non-authorizing evidence sources
  --target-changed
                 Mark an explicit replacement of a previously confirmed target
  --all-active   Evaluate every active run (doctor and delivery-map only)
  --surface <codex|claude|copilot|opencode|generic>
                 Declare the selected coding-agent surface
  --scope <repository|global|project|user>
                 Select the lifecycle mutation scope. MCP defaults to project.
  --mcp-scope <project|user>
                 Select the MCP scope for an explicitly coupled global uninstall.
  --confirm      Apply a previously previewed global uninstall plan
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
