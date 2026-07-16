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
  command("codex-repo", { preferred: [""], scaffold: [""] }),
  command("claude", { preferred: [""], scaffold: [""] }),
  command("copilot", { scaffold: [""] }),
  command("opencode", { preferred: [""], scaffold: [""] }),
  command("opencode-status", { preferred: [""], scaffold: [""] }),
  command("opencode-repo", { preferred: [""], scaffold: [""] }),
  command("both", { scaffold: [""] }),
  command("init", { preferred: [""], scaffold: [""] }),
  command("config", { scaffold: [" --language de"] }),
  command("doctor", { preferred: [""], scaffold: [""], legacy: [" --json"] }),
  command("gate-check", { preferred: [" --json"], scaffold: [""], legacy: [" --json"] }),
  command("delivery-map", { scaffold: [""] }),
  command("delivery-path-search", {
    preferred: [" --surface codex --json", " --surface claude --json"],
    scaffold: [" --surface codex", " --surface claude"],
  }),
  command("run-create", { preferred: [" --run <run_id>"] }),
  command("run-migrate", { preferred: [" [--run <run_id>]"] }),
  command("run-render-legacy", { preferred: [" --run <run_id>"] }),
]);

const commandByName = new Map(commandRegistry.map((entry) => [entry.name, entry]));

export function resolveCommand(name) {
  return commandByName.get(name) ?? null;
}

export function supportedCommandNames() {
  return commandRegistry.map((entry) => entry.name);
}

export function validateCommandOptions(options) {
  if (options.allActive && !["doctor", "delivery-map"].includes(options.target)) {
    throw new Error("--all-active is supported only by doctor and delivery-map");
  }
  if (options.target === "run-create" && (!options.runId || options.allActive)) {
    throw new Error("run-create requires --run and rejects --all-active");
  }
  if (options.target === "run-render-legacy" && !options.runId) {
    throw new Error("run-render-legacy requires --run");
  }
  return options;
}

function usageLines(group, prefix) {
  return commandRegistry
    .flatMap((entry) => (entry.usages[group] ?? []).map((suffix) => `  ${prefix}${entry.name}${suffix}`))
    .join("\n");
}

export function renderUsage() {
  return `create-agdf

Preferred AGDF CLI:
${usageLines("preferred", "npx --yes @agdf/cli@latest ")}

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
  --status-card  Print compact gate-check status-card output for interactive use
  --run <run_id> Select one canonical run
  --all-active   Evaluate every active run (doctor and delivery-map only)
  --surface <codex|claude|copilot|opencode|generic>
                 Declare the active Delivery Path Search surface
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
