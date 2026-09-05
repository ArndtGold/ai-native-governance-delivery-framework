import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginDefinition } from "../cli/runtime-context.js";
import { printLifecycleResult } from "../lifecycle/presentation.js";
import { createLifecycleResult } from "../lifecycle/result.js";

export function createCanonicalInitLifecycleResult(destination, initialization) {
  if (!initialization || !["created", "unchanged", "repaired"].includes(initialization.status)) {
    throw new Error("Canonical init presentation requires a created, unchanged or repaired result.");
  }
  const created = initialization.files
    .filter((file) => file.action === "created")
    .map((file) => Object.freeze({ kind: "create", path: file.path }));
  const retained = initialization.files
    .filter((file) => file.action === "preserved_exact")
    .map((file) => file.path);
  return createLifecycleResult({
    operation: "control_init",
    result: "success",
    surface: "generic",
    scope: "repository",
    target: destination,
    operationOutcome: initialization.status,
    verification: {
      status: "healthy",
      evidence: [".agdf/control/runs", ...initialization.files.map((file) => file.path)],
    },
    installation: { status: "not_applicable" },
    activation: { status: "not_applicable" },
    delivery: { status: "not_evaluated" },
    restart: { required: false, reason: "none" },
    next_action: {
      kind: "control_setup",
      text: "Create or migrate one canonical run with an explicit run id before drafting durable delivery state.",
    },
    changes: created,
    retained,
  });
}

export function printNextSteps(target, destination, files, removedOpenCodeAgents = [], {
  verbose = false,
  json = false,
  io = console,
  initialization = null,
} = {}) {
  const repositorySurface = { "codex-repo": "codex", "opencode-repo": "opencode" }[target];
  const verified = files.every((file) => {
    const path = join(destination, file.path);
    return existsSync(path) && readFileSync(path, "utf8") === file.content;
  });
  if (repositorySurface) {
    const nextAction = repositorySurface === "codex"
      ? "Restart Codex, open /plugins, select This repository and install agdf; then start a new task with: Run an AGDF gate check for this request."
      : "Restart OpenCode in this repository so the global AGDF plugin observes the durable control configuration.";
    printLifecycleResult(createLifecycleResult({
      operation: "repository_setup",
      result: verified ? "success" : "partial",
      surface: repositorySurface,
      scope: "repository",
      target: destination,
      version: { expected: pluginDefinition.version, status: "expected" },
      verification: { status: verified ? "healthy" : "degraded", evidence: files.map((file) => file.path) },
      installation: { status: verified ? "healthy" : "degraded" },
      activation: { status: "pending_restart" },
      delivery: { status: "not_evaluated" },
      restart: { required: true, reason: "host_reload_and_repository_plugin_activation" },
      next_action: { kind: "host_action", text: nextAction },
    }), { json, io });
    if (!verbose || json) return;
  }

  if (target === "init") {
    const report = createCanonicalInitLifecycleResult(destination, initialization);
    if (json) {
      printLifecycleResult(report, { json: true, io });
      return;
    }
    printLifecycleResult(report, { compact: true, io });
  }

  if (verbose) {
    io.log("");
    io.log(`AGDF bootstrap complete in ${destination}`);
    io.log("");
    io.log("Generated:");
    for (const file of files) {
      const action = file.action ? `${file.action}: ` : "";
      io.log(`- ${action}${file.path}`);
    }
  }

  if (removedOpenCodeAgents.length > 0) {
    io.log("");
    io.log("Removed generated legacy OpenCode agents:");
    for (const relativePath of removedOpenCodeAgents) io.log(`- ${relativePath}`);
  }

  const preservedFiles = [...new Set(files.map((file) => file.preserved).filter(Boolean))];
  if (preservedFiles.length > 0) {
    io.log("");
    io.log("Preserved:");
    for (const preserved of preservedFiles) io.log(`- ${preserved}`);
  }

  if (repositorySurface && !verbose) return;

  io.log("");
  io.log("Next steps:");
  const languageConfig = files.find((file) => file.path === join(".agdf", "control", "config.json"));
  if (languageConfig) {
    const language = JSON.parse(languageConfig.content);
    io.log(`- AGDF language preference: artefacts=${language.artifact_language}, chat=${language.chat_language}, runtime=${language.runtime_language}.`);
  }
  if (target === "init") {
    io.log("- Create or migrate a canonical run, then fill its RUN_STATE.md with the current gate, evidence and next allowed action.");
    io.log("- Run the installed `agdf doctor` to check the control state before the next agent run.");
    io.log("- Commit the live control files once they represent the repository's current delivery state.");
    return;
  }
  if (target === "config") {
    io.log("- Restart or start a new agent session so the AGDF SessionStart hook reads the updated project language config.");
    io.log("- Run the installed `agdf doctor` when this repository also uses durable AGDF control state.");
    return;
  }
  if (target === "opencode-repo") {
    io.log("- Install the global OpenCode surface once with npx --yes @agdf/cli@latest opencode if it is not already installed.");
    io.log("- Start or restart OpenCode in this repository; valid .agdf/control/config.json activates the global AGDF runtime here.");
    io.log("- After positive Request Activation selects actual delivery work, load agdf-global-gate-check through OpenCode's native skill tool before later artefacts or implementation. Unclear approval alone never activates AGDF.");
    io.log("- Existing .opencode files are left untouched as a compatibility path; this command does not copy a second runtime surface.");
  }
  io.log("- Commit the generated files so the repository becomes the source of truth.");
}
