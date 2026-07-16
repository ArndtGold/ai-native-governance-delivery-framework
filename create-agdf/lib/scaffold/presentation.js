import { join } from "node:path";
import { pluginDefinition } from "../cli/runtime-context.js";
import { agdfFragmentPath, openCodeConfigFragmentPath } from "./plan.js";

const pluginInstallCommand = "npx --yes @agdf/cli@latest claude";

export function printNextSteps(target, destination, files, wroteAgentsFragment, wroteOpenCodeConfigFragment, removedOpenCodeAgents = [], io = console) {
  io.log("");
  io.log(`AGDF bootstrap complete in ${destination}`);
  io.log("");
  io.log("Generated:");
  for (const file of files) {
    const action = file.action ? `${file.action}: ` : "";
    io.log(`- ${action}${file.path}`);
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

  io.log("");
  io.log("Next steps:");
  const languageConfig = files.find((file) => file.path === join(".agdf", "control", "config.json"));
  if (languageConfig) {
    const language = JSON.parse(languageConfig.content);
    io.log(`- AGDF language preference: artefacts=${language.artifact_language}, chat=${language.chat_language}, runtime=${language.runtime_language}.`);
  }
  if (target === "init") {
    io.log("- Create or migrate a canonical run, then fill its RUN_STATE.md with the current gate, evidence and next allowed action.");
    io.log("- Run npx --yes @agdf/cli@latest doctor to check the control state before the next agent run.");
    io.log("- Commit the live control files once they represent the repository's current delivery state.");
    return;
  }
  if (target === "config") {
    io.log("- Restart or start a new agent session so the AGDF SessionStart hook reads the updated project language config.");
    io.log("- Run npx --yes @agdf/cli@latest doctor when this repository also uses durable AGDF control state.");
    return;
  }
  if (wroteAgentsFragment) {
    io.log(`- Existing AGENTS.md detected. Merge ${agdfFragmentPath} into your current AGENTS.md before using Copilot with AGDF.`);
  }
  if (target === "codex-repo" || target === "both") {
    io.log("- Restart Codex in this repository, open /plugins, select This repository and install agdf.");
    io.log("- Start a new Codex thread in this repository and ask: Run an AGDF gate check for this request.");
  }
  if (target === "both") {
    io.log(`- Optional global Claude Code install: ${pluginInstallCommand}`);
  }
  if (target === "opencode-repo") {
    if (wroteOpenCodeConfigFragment) {
      io.log(`- Existing opencode.json detected. Review ${openCodeConfigFragmentPath} and merge its owned entries so OpenCode loads .opencode/AGDF.md; preserve an explicit permission.question decision.`);
    }
    io.log(`- OpenCode will install the ${pluginDefinition.opencode.npmPackage} npm plugin from opencode.json at startup.`);
    io.log("- Optional: also add create-agdf to ~/.config/opencode/opencode.json plugin[] for a user-wide OpenCode hook.");
    io.log("- The global hook does not replace repository instructions or native skills; this repository's .opencode files remain the AGDF source of truth.");
    io.log("- Start OpenCode in this repository; it will load opencode.json, .opencode/AGDF.md and the native AGDF skills.");
    io.log("- Load agdf-gate-check through OpenCode's native skill tool for new build/change intent or unclear approval before later artefacts or implementation.");
    io.log("- Run npx --yes @agdf/cli@latest init when the repository needs live AGDF control files.");
  }
  if (target === "copilot" || target === "both") {
    io.log("- In GitHub Copilot CLI, run /instructions after the AGENTS.md step is complete to confirm that AGDF instructions and the repository skills are visible.");
    io.log("- Run npx --yes @agdf/cli@latest init when the repository needs live AGDF control files.");
  }
  io.log("- Commit the generated files so the repository becomes the source of truth.");
}
