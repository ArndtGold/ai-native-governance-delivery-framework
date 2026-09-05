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
  command("codex", { preferred: [""], scaffold: [""] }),
  command("codex-repo", { preferred: [" --dir <path>"], scaffold: [" --dir <path>"] }),
  command("claude", { preferred: [""], scaffold: [""] }),
  command("copilot", { preferred: [""] }),
  command("opencode", { preferred: [""], scaffold: [""] }),
  command("opencode-status", { preferred: [""], scaffold: [""] }),
  command("status", { preferred: [" [--surface <surface>] [--run <run_id>] [--json]"] }),
  command("runtime-checks", { preferred: [" <status|enable|manual> --surface <codex|claude|copilot|opencode> [--json]"] }),
  command("disable", { preferred: [" --surface <surface> [--scope repository] [--shared] [--dir <path>]"] }),
  command("uninstall", { preferred: [" --surface <surface> --scope global [--confirm]"] }),
  command("opencode-repo", { preferred: [" --dir <path>"], scaffold: [" --dir <path>"] }),
  command("init", { preferred: [""], scaffold: [""] }),
  command("config", { scaffold: [" --language de"] }),
  command("target-check", { local: [" --json [--language <tag>] [--working-directory <absolute-path>] [--target-source <source> --primary-target <absolute-path>]"] }),
  command("skill-dispatch", { local: [" --json --skill <skill-id> --surface <surface> --language <tag> --working-directory <absolute-path> [--target-source <source> --primary-target <absolute-path>] [--run <run_id>]"] }),
  command("doctor", { local: [""], scaffold: [""], legacy: [" --json"] }),
  command("gate-check", { local: [" --approval-envelope", " --json"], scaffold: [""], legacy: [" --json"] }),
  command("delivery-map", { local: [" --json"], scaffold: [""] }),
  command("delivery-path-search", {
    local: [" --surface codex --json", " --surface claude --json", " --surface opencode --json"],
    scaffold: [" --surface codex", " --surface claude", " --surface opencode"],
  }),
  command("run-create", { local: [" --run <run_id>"] }),
  command("run-migrate", { local: [" [--run <run_id>]"] }),
  command("run-render-legacy", { local: [" --run <run_id>"] }),
]);

const commandByName = new Map(commandRegistry.map((entry) => [entry.name, entry]));

export function resolveCommand(name) {
  return commandByName.get(name) ?? null;
}

// Binding guidance is a projection of the public grammar, not a second flag inventory.
export function skillDispatchArgumentGrammar() {
  return resolveCommand("skill-dispatch").usages.local[0]
    .replace(" --json", "").replace(" --surface <surface>", "").trim();
}

export function supportedCommandNames() {
  return commandRegistry.map((entry) => entry.name);
}

export function validateCommandOptions(options) {
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
  if (options.allActive && !["doctor", "delivery-map"].includes(options.target)) {
    throw new Error("--all-active is supported only by doctor and delivery-map");
  }
  if (options.target === "run-create" && (!options.runId || options.allActive)) {
    throw new Error("run-create requires --run and rejects --all-active");
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
  if (options.runtimeChecksDecision && !["codex", "claude", "copilot", "opencode"].includes(options.target)) {
    throw new Error("--runtime-checks is supported only by codex, claude, copilot and opencode installation commands");
  }
  if (options.target === "runtime-checks" && !["codex", "claude", "copilot", "opencode"].includes(options.surface)) {
    throw new Error("runtime-checks requires --surface codex, claude, copilot or opencode");
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
  --dir <path>   Write files into a specific directory. With opencode, use this as the OpenCode config directory.
  --force        Overwrite existing generated files
  --language <tag>
                 Set AGDF chat and artefact language. Defaults to detected system locale.
  --lang <tag>   Alias for --language
  --json         Print machine-readable command output as JSON
  --verbose       Print captured host command output and generated-file details
  --status-card  Print compact gate-check status-card output for interactive use
  --approval-envelope
                 Print the deterministic ready-gate cards and exact-text request
  --run <run_id> Select one canonical run
  --target-source <explicit_target|continued_target|current_repository>
                 Classify the semantic source for target-check
  --primary-target <absolute-path>
                 Supply exactly one target for target-check; cwd is never implied
  --working-directory <absolute-path>
                 Report execution context without granting target authority
  --skill <skill-id>
                 Select one canonical skill for skill-dispatch
  --target-candidate <absolute-path>
                 Repeat to expose competing plausible targets
  --evidence-source <value>
                 Repeat to report non-authorizing evidence sources
  --target-changed
                 Mark an explicit replacement of a previously confirmed target
  --all-active   Evaluate every active run (doctor and delivery-map only)
  --surface <codex|claude|copilot|opencode|generic>
                 Declare the active Delivery Path Search surface
  --scope <repository|global>
                 Select the lifecycle mutation scope
  --confirm      Apply a previously previewed global uninstall plan
  --shared       Apply Copilot repository disable through shared .github/copilot/settings.json
  --runtime-checks <enable|manual|cancel>
                 Make the installation-time automatic-check decision explicitly; no TTY defaults to manual
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
