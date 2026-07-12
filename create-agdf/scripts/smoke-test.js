import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { delimiter, join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = new URL("..", import.meta.url);
const binPath = fileURLToPath(new URL("./bin/create-agdf.js", packageRoot));
const packageJsonPath = fileURLToPath(new URL("./package.json", packageRoot));
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const pluginDefinitionPath = fileURLToPath(new URL("../plugin/meta/agdf-plugin.definition.json", packageRoot));
const pluginDefinition = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));
const codexSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.codex.skillPrefix}${skill.slug}`);
const copilotSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.copilot.skillPrefix}${skill.slug}`);
const openCodeSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.opencode.skillPrefix}${skill.slug}`);

function runJson(args) {
  try {
    return JSON.parse(execFileSync(process.execPath, [binPath, ...args], { encoding: "utf8", stdio: "pipe" }));
  } catch (error) {
    if (error.stdout) return JSON.parse(error.stdout.toString());
    throw error;
  }
}

function makeFakeExecutable(tempDir, name, source) {
  const binDir = join(tempDir, "bin");
  mkdirSync(binDir, { recursive: true });
  const executablePath = join(binDir, name);
  writeFileSync(executablePath, source, "utf8");
  chmodSync(executablePath, 0o755);
  return binDir;
}

function runCliWithPath(args, binDir, extraEnv = {}) {
  return execFileSync(process.execPath, [binPath, ...args], {
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
      ...extraEnv,
      PATH: `${binDir}${delimiter}${process.env.PATH}`,
    },
  });
}

function readJsonLines(path) {
  return readFileSync(path, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

if (packageJson.bin?.["create-agdf"] !== "./bin/create-agdf.js") {
  throw new Error("create-agdf must keep the backward-compatible create-agdf binary.");
}

if (packageJson.exports?.["./cli"] !== "./bin/create-agdf.js") {
  throw new Error("create-agdf must export its CLI for the agdf wrapper package.");
}

const helpOutput = execFileSync(process.execPath, [binPath, "--help"], { encoding: "utf8" });
if (!helpOutput.includes("Preferred AGDF CLI:") || !helpOutput.includes("npx --yes @agdf/cli@latest codex-repo") || !helpOutput.includes("npx --yes @agdf/cli@latest claude") || !helpOutput.includes("npx --yes @agdf/cli@latest opencode-status") || !helpOutput.includes("npx --yes @agdf/cli@latest opencode-repo") || !helpOutput.includes("npx --yes @agdf/cli@latest init") || !helpOutput.includes("--status-card") || !helpOutput.includes("Scaffold-compatible npm create usage:")) {
  throw new Error("CLI help must present agdf as the preferred CLI package and keep npm create compatibility.");
}

{
  const publishWorkflowPath = fileURLToPath(new URL("../.github/workflows/publish-agdf.yml", packageRoot));
  const publishWorkflow = readFileSync(publishWorkflowPath, "utf8");
  for (const requiredSnippet of [
    "Wait for create-agdf readiness",
    "Wait for @agdf/cli readiness",
    "MAX_ATTEMPTS=20",
    "SLEEP_SECONDS=15",
    "NPM_ERROR_LOG=\"$(mktemp)\"",
    "wait_for_npm_package \"create-agdf\"",
    "wait_for_npm_package \"@agdf/cli\"",
    "npm view \"${PACKAGE}@${VERSION}\" version --json",
    "Timed out waiting for ${PACKAGE}@${VERSION} after ${MAX_ATTEMPTS} attempts",
    "@agdf/cli@latest\" version --json",
    "Run clean public bootstrap smoke test",
    "NPM_CONFIG_CACHE: ${{ runner.temp }}/agdf-release-npm-cache",
  ]) {
    if (!publishWorkflow.includes(requiredSnippet)) {
      throw new Error(`Publish workflow must keep bounded exact-version npm readiness check: missing ${requiredSnippet}`);
    }
  }
  if (!(publishWorkflow.indexOf("Publish create-agdf to npm") < publishWorkflow.indexOf("Wait for create-agdf readiness")
    && publishWorkflow.indexOf("Wait for create-agdf readiness") < publishWorkflow.indexOf("Publish @agdf/cli to npm")
    && publishWorkflow.indexOf("Publish @agdf/cli to npm") < publishWorkflow.indexOf("Wait for @agdf/cli readiness"))) {
    throw new Error("Publish workflow must wait for create-agdf readiness before publishing @agdf/cli, then wait for @agdf/cli readiness.");
  }
  if (publishWorkflow.indexOf("Wait for @agdf/cli readiness") > publishWorkflow.indexOf("Run clean public bootstrap smoke test")) {
    throw new Error("Clean public bootstrap smoke test must run after @agdf/cli readiness.");
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-codex-global-"));
  const logPath = join(tempDir, "codex.log");

  try {
    const binDir = makeFakeExecutable(tempDir, "codex", `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_CODEX_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "plugin list") {
  console.log("agdf@agdf ${pluginDefinition.version}");
}
`);
    const output = runCliWithPath(["codex"], binDir, { FAKE_CODEX_LOG: logPath });
    const calls = readJsonLines(logPath).map((args) => args.join(" "));
    const expectedCalls = [
      "plugin marketplace add arndtgold/ai-native-governance-delivery-framework",
      "plugin marketplace upgrade agdf",
      "plugin add agdf --marketplace agdf",
      "plugin list",
    ];
    if (JSON.stringify(calls) !== JSON.stringify(expectedCalls)) {
      throw new Error(`Codex global bootstrap command order changed: ${calls.join(" | ")}`);
    }
    if (!output.includes(`AGDF Codex plugin version verified: ${pluginDefinition.version}`)) {
      throw new Error("Codex global bootstrap must report verified plugin version.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-codex-mismatch-"));
  const logPath = join(tempDir, "codex.log");

  try {
    const binDir = makeFakeExecutable(tempDir, "codex", `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_CODEX_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "plugin list") {
  console.log("agdf@agdf 0.0.0");
}
`);
    let failed = false;
    try {
      runCliWithPath(["codex"], binDir, { FAKE_CODEX_LOG: logPath });
    } catch (error) {
      failed = true;
      const stderr = error.stderr.toString();
      if (!stderr.includes(`expected ${pluginDefinition.version}`) || !stderr.includes("observed 0.0.0") || !stderr.includes("codex plugin marketplace upgrade agdf")) {
        throw new Error(`Codex mismatch error must be actionable, got: ${stderr}`);
      }
    }
    if (!failed) throw new Error("Codex global bootstrap must fail when the installed plugin version mismatches.");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-claude-install-"));
  const logPath = join(tempDir, "claude.log");
  const statePath = join(tempDir, "installed");

  try {
    const binDir = makeFakeExecutable(tempDir, "claude", `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_CLAUDE_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "plugin list") {
  if (fs.existsSync(process.env.FAKE_CLAUDE_STATE)) console.log("agdf@agdf ${pluginDefinition.version}");
  process.exit(0);
}
if (args.join(" ") === "plugin install agdf@agdf" || args.join(" ") === "plugin update agdf@agdf") {
  fs.writeFileSync(process.env.FAKE_CLAUDE_STATE, "installed");
}
`);
    const output = runCliWithPath(["claude"], binDir, { FAKE_CLAUDE_LOG: logPath, FAKE_CLAUDE_STATE: statePath });
    const calls = readJsonLines(logPath).map((args) => args.join(" "));
    if (!calls.includes("plugin marketplace add arndtgold/ai-native-governance-delivery-framework") || !calls.includes("plugin marketplace update agdf") || !calls.includes("plugin install agdf@agdf")) {
      throw new Error(`Claude first install must use marketplace add/update and plugin install: ${calls.join(" | ")}`);
    }
    if (calls.some((call) => call === "plugin add arndtgold/ai-native-governance-delivery-framework")) {
      throw new Error("Claude bootstrap must not call unsupported plugin add.");
    }
    if (!output.includes(`AGDF Claude Code plugin version verified: ${pluginDefinition.version}`)) {
      throw new Error("Claude install must report verified plugin version when exposed.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-claude-update-"));
  const logPath = join(tempDir, "claude.log");
  const statePath = join(tempDir, "installed");
  writeFileSync(statePath, "installed", "utf8");

  try {
    const binDir = makeFakeExecutable(tempDir, "claude", `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_CLAUDE_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "plugin list") {
  console.log("agdf@agdf ${pluginDefinition.version}");
}
`);
    runCliWithPath(["claude"], binDir, { FAKE_CLAUDE_LOG: logPath, FAKE_CLAUDE_STATE: statePath });
    const calls = readJsonLines(logPath).map((args) => args.join(" "));
    if (!calls.includes("plugin update agdf@agdf") || calls.includes("plugin install agdf@agdf")) {
      throw new Error(`Claude existing install must use plugin update only: ${calls.join(" | ")}`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-claude-no-version-"));
  const logPath = join(tempDir, "claude.log");
  const statePath = join(tempDir, "installed");

  try {
    const binDir = makeFakeExecutable(tempDir, "claude", `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_CLAUDE_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "plugin list") {
  if (fs.existsSync(process.env.FAKE_CLAUDE_STATE)) console.log("agdf@agdf");
  process.exit(0);
}
if (args.join(" ") === "plugin install agdf@agdf") {
  fs.writeFileSync(process.env.FAKE_CLAUDE_STATE, "installed");
}
`);
    const output = runCliWithPath(["claude"], binDir, { FAKE_CLAUDE_LOG: logPath, FAKE_CLAUDE_STATE: statePath });
    if (!output.includes("did not expose a plugin version")) {
      throw new Error("Claude bootstrap must report verification limitation when list output has no version.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

const deliveryPathSearchFixture = fileURLToPath(new URL("./scripts/fixtures/delivery-path-search.json", packageRoot));
const deliveryPathSearchOutput = JSON.parse(execFileSync(process.execPath, [
  binPath,
  "delivery-path-search",
  "--fixture",
  deliveryPathSearchFixture,
  "--json",
], { encoding: "utf8" }));
if (deliveryPathSearchOutput.status !== "recommendation"
  || deliveryPathSearchOutput.recommendation?.candidate_id !== "inspect"
  || deliveryPathSearchOutput.next_gate_action !== "Run canonical AGDF gate-check; search does not grant permission.") {
  throw new Error("delivery-path-search CLI must return the canonical advisory fixture result.");
}

const generatedDeliveryPathSearchFixture = fileURLToPath(new URL("./scripts/fixtures/delivery-path-search-generated.json", packageRoot));
const generatedDeliveryPathSearchOutput = JSON.parse(execFileSync(process.execPath, [
  binPath, "delivery-path-search", "--fixture", generatedDeliveryPathSearchFixture, "--json",
], { encoding: "utf8" }));
if (generatedDeliveryPathSearchOutput.generation?.status !== "success"
  || generatedDeliveryPathSearchOutput.generation?.accepted !== 1
  || generatedDeliveryPathSearchOutput.generation?.cost_units !== 2) {
  throw new Error("delivery-path-search CLI must expose bounded generated-candidate provenance and budgets.");
}

const openCodeConfigTempDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-config-"));
try {
  execFileSync(process.execPath, [binPath, "opencode", "--dir", openCodeConfigTempDir], { encoding: "utf8", stdio: "pipe" });
  const openCodeGlobalConfig = JSON.parse(readFileSync(join(openCodeConfigTempDir, "opencode.json"), "utf8"));
  if (!openCodeGlobalConfig.plugin?.includes(pluginDefinition.opencode.npmPackage)) {
    throw new Error("opencode must add the AGDF npm plugin to OpenCode global config.");
  }
  let status = JSON.parse(execFileSync(process.execPath, [binPath, "opencode-status", "--dir", openCodeConfigTempDir, "--json"], {
    encoding: "utf8",
    stdio: "pipe",
    env: { ...process.env, OPENCODE_CONFIG_DIR: openCodeConfigTempDir },
  }));
  if (status.status !== "configured") {
    throw new Error(`opencode-status should report configured after opencode install, got ${status.status}.`);
  }
  if (!status.global_config.plugin_configured || !status.package.loadable) {
    throw new Error("opencode-status must prove global config and package loadability separately.");
  }
  if (status.session.active) {
    throw new Error("opencode-status must not claim an active session from config evidence alone.");
  }
  if (status.repository_surface.present || status.visible_entrypoint !== "none until opencode-repo is installed for this repository") {
    throw new Error("opencode-status must keep global installation separate from repository surface activation.");
  }

  execFileSync(process.execPath, [binPath, "opencode-repo", "--dir", openCodeConfigTempDir, "--force"], { encoding: "utf8", stdio: "pipe" });
  status = JSON.parse(execFileSync(process.execPath, [binPath, "opencode-status", "--dir", openCodeConfigTempDir, "--json"], {
    encoding: "utf8",
    stdio: "pipe",
    env: { ...process.env, OPENCODE_CONFIG_DIR: openCodeConfigTempDir },
  }));
  if (!status.repository_surface.present || status.visible_entrypoint !== "@agdf-gate-check") {
    throw new Error("opencode-status should detect the repository surface after opencode-repo generation.");
  }
} finally {
  rmSync(openCodeConfigTempDir, { recursive: true, force: true });
}

function run(target, expectedFiles) {
  const tempDir = mkdtempSync(join(tmpdir(), `create-agdf-${target}-`));

  try {
    execFileSync(process.execPath, [binPath, target, "--dir", tempDir], { stdio: "pipe" });

    for (const relativePath of expectedFiles) {
      const outputPath = join(tempDir, relativePath);
      if (!existsSync(outputPath)) {
        throw new Error(`Missing expected file for ${target}: ${relativePath}`);
      }
    }

    if (target === "codex-repo" || target === "both") {
      const pluginRouterPath = join(tempDir, "plugins", "agdf", "meta", "agdf-agent-router.md");
      const pluginRouter = readFileSync(pluginRouterPath, "utf8");
      if (!pluginRouter.includes("| `gate-check` |")) {
        throw new Error(`Missing unprefixed plugin skill routing for ${target}.`);
      }
      if (pluginRouter.includes("`agdf-gate-check`")) {
        throw new Error(`Plugin router for ${target} must not contain Copilot-prefixed skill names.`);
      }
    }

    if (target === "copilot" || target === "both") {
      const copilotAgentsPath = join(tempDir, "AGENTS.md");
      const copilotAgents = readFileSync(copilotAgentsPath, "utf8");
      const copilotSkillsReadmePath = join(tempDir, ".github", "skills", "README.md");
      const copilotSkillsReadme = readFileSync(copilotSkillsReadmePath, "utf8");
      if (!copilotAgents.includes("| `agdf-gate-check` |")) {
        throw new Error(`Missing prefixed Copilot skill routing for ${target}.`);
      }
      if (copilotAgents.includes("| `gate-check` |")) {
        throw new Error(`Copilot AGENTS.md for ${target} must not contain unprefixed skill routing.`);
      }
      for (const skillName of copilotSkillNames) {
        const skillPath = join(tempDir, ".github", "skills", skillName, "SKILL.md");
        if (!existsSync(skillPath)) {
          throw new Error(`Copilot surface for ${target} routes ${skillName} but does not expose .github/skills/${skillName}/SKILL.md.`);
        }
        if (!copilotAgents.includes(`\`${skillName}\``)) {
          throw new Error(`Copilot AGENTS.md for ${target} must route ${skillName}.`);
        }
        if (!copilotSkillsReadme.includes(`\`${skillName}\``)) {
          throw new Error(`Copilot skills README for ${target} must list ${skillName}.`);
        }
      }
      if (copilotAgents.includes("`agdf-brownfield-analysis`") && !existsSync(join(tempDir, ".github", "skills", "agdf-brownfield-analysis", "SKILL.md"))) {
        throw new Error("Copilot AGENTS.md routes agdf-brownfield-analysis but the skill is not exposed.");
      }

      const copilotInstructionsPath = join(tempDir, ".github", "copilot-instructions.md");
      const copilotInstructions = readFileSync(copilotInstructionsPath, "utf8");
      if (!copilotInstructions.includes("Apply AGDF natively from `AGENTS.md`, repository skills and live `.agdf/control/` state")) {
        throw new Error(`Copilot instructions for ${target} must state native AGDF operation before helper commands.`);
      }
      if (!copilotInstructions.includes("AGDF is agent-native first and CLI-verifiable by design")) {
        throw new Error(`Copilot instructions for ${target} must state the agent-native and CLI-verifiable operating model.`);
      }
      if (!copilotInstructions.includes("Use `doctor --json`, `gate-check --json` or `delivery-map --json` as deterministic validators")) {
        throw new Error(`Copilot instructions for ${target} must classify CLI checks as deterministic validators.`);
      }
    }

    if (target === "opencode-repo") {
      const openCodeConfig = JSON.parse(readFileSync(join(tempDir, "opencode.json"), "utf8"));
      if (!openCodeConfig.instructions?.includes(".opencode/AGDF.md")) {
        throw new Error("OpenCode config must load .opencode/AGDF.md instructions.");
      }
      if (!openCodeConfig.plugin?.includes(pluginDefinition.opencode.npmPackage)) {
        throw new Error(`OpenCode config must load the ${pluginDefinition.opencode.npmPackage} npm plugin.`);
      }
      if (openCodeConfig.permission?.edit !== "ask" || openCodeConfig.permission?.bash !== "ask") {
        throw new Error("OpenCode config must keep edit and bash on explicit approval.");
      }

      const openCodeInstructions = readFileSync(join(tempDir, ".opencode", "AGDF.md"), "utf8");
      if (!openCodeInstructions.includes("| `agdf-gate-check` |")) {
        throw new Error("OpenCode instructions must route prefixed AGDF agents.");
      }
      if (openCodeInstructions.includes("| `gate-check` |")) {
        throw new Error("OpenCode instructions must not contain unprefixed skill routing.");
      }
      if (!openCodeInstructions.includes("optional global npm plugin hook") || !openCodeInstructions.includes("repository files remain the AGDF source of truth")) {
        throw new Error("OpenCode instructions must distinguish the optional global plugin hook from the repository-local AGDF source of truth.");
      }
      if (!openCodeInstructions.includes("mode: subagent") || !openCodeInstructions.includes("not OpenCode Skills under `.opencode/skills/`")) {
        throw new Error("OpenCode instructions must explain that generated AGDF agents are subagent workflow controls, not OpenCode Skills.");
      }

      for (const skillName of openCodeSkillNames) {
        const agentPath = join(tempDir, ".opencode", "agents", `${skillName}.md`);
        if (!existsSync(agentPath)) {
          throw new Error(`OpenCode surface routes ${skillName} but does not expose .opencode/agents/${skillName}.md.`);
        }
        const agentContent = readFileSync(agentPath, "utf8");
        const frontmatterMatches = agentContent.match(/^---$/gm) ?? [];
        if (frontmatterMatches.length !== 2) {
          throw new Error(`OpenCode agent ${skillName} must contain exactly one YAML frontmatter block.`);
        }
        if (!agentContent.startsWith("---\ndescription:") || !agentContent.includes("\nmode: subagent\n---\n\n# ")) {
          throw new Error(`OpenCode agent ${skillName} must render OpenCode metadata before the prompt body.`);
        }
      }
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

run("codex-repo", [
  join(".agdf", "control", "config.json"),
  join(".agents", "plugins", "marketplace.json"),
  join("plugins", "agdf", ".codex-plugin", "plugin.json"),
  join("plugins", "agdf", "control", "templates", "AGDF_RUN.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "OR.md"),
  join("plugins", "agdf", "hooks", "hooks.json"),
  join("plugins", "agdf", "hooks", "session-start.sh"),
  join("plugins", "agdf", "meta", "agdf-agent-router.md"),
  join("plugins", "agdf", "meta", "agdf-constitution.md"),
  join("plugins", "agdf", "meta", "agdf-plugin.definition.json"),
  join("plugins", "agdf", "meta", "agdf-runtime-contract.md"),
  join("plugins", "agdf", "meta", "agdf-tenets.md"),
  ...["gate-check", "code-review", "qa-gate"].map((slug) => join("plugins", "agdf", "skills", `${pluginDefinition.codex.skillPrefix}${slug}`, "SKILL.md")),
]);
run("copilot", [
  "AGENTS.md",
  join(".agdf", "control", "config.json"),
  join(".agdf", "control", "README.md"),
  join(".agdf", "control", "templates", "AGDF_RUN.md"),
  join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join(".agdf", "control", "templates", "artefacts", "PRD.md"),
  join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join(".agdf", "control", "templates", "artefacts", "OR.md"),
  join(".agdf", "control", "templates", "SOT_REGISTRY.md"),
  join(".agdf", "control", "templates", "CONTEXT_GRAPH.md"),
  join(".agdf", "control", "templates", "AGENT_QUALITY_CONTRACTS.json"),
  join(".github", "copilot-instructions.md"),
  join(".github", "instructions", "agdf-governance.instructions.md"),
  join(".github", "skills", "README.md"),
  join(".github", "skills", pluginDefinition.copilot.runtimeContractFileName),
  ...["gate-check", "code-review", "qa-gate"].map((slug) => join(".github", "skills", `${pluginDefinition.copilot.skillPrefix}${slug}`, "SKILL.md")),
]);

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-copilot-rerun-owned-"));

  try {
    execFileSync(process.execPath, [binPath, "copilot", "--dir", tempDir, "--language", "de"], { stdio: "pipe" });
    const configPath = join(tempDir, ".agdf", "control", "config.json");
    const instructionsPath = join(tempDir, ".github", "copilot-instructions.md");
    const agentsPath = join(tempDir, "AGENTS.md");
    writeFileSync(instructionsPath, "stale generated instructions\n", "utf8");
    const output = execFileSync(process.execPath, [binPath, "copilot", "--dir", tempDir, "--language", "en"], { encoding: "utf8", stdio: "pipe" });
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    if (config.artifact_language !== "de" || config.chat_language !== "de") {
      throw new Error("Copilot rerun must preserve an existing AGDF language config without --force.");
    }
    const refreshedInstructions = readFileSync(instructionsPath, "utf8");
    if (refreshedInstructions === "stale generated instructions\n" || !refreshedInstructions.includes("AGDF is agent-native first and CLI-verifiable by design")) {
      throw new Error("Copilot rerun must refresh AGDF-owned generated instruction files.");
    }
    const agents = readFileSync(agentsPath, "utf8");
    if (!agents.includes("## Surface Convention")) {
      throw new Error("Copilot rerun should refresh an AGDF-owned root AGENTS.md.");
    }
    if (!output.includes("refreshed: .github/copilot-instructions.md")) {
      throw new Error("Copilot rerun output must name refreshed files.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-copilot-rerun-user-agents-"));

  try {
    writeFileSync(join(tempDir, "AGENTS.md"), "# Project Agent Notes\n\nKeep this user-owned file.\n", "utf8");
    execFileSync(process.execPath, [binPath, "copilot", "--dir", tempDir, "--language", "de"], { stdio: "pipe" });
    const userAgents = readFileSync(join(tempDir, "AGENTS.md"), "utf8");
    if (!userAgents.includes("Keep this user-owned file.")) {
      throw new Error("Copilot bootstrap must preserve a user-owned AGENTS.md.");
    }
    if (!existsSync(join(tempDir, "AGENTS.agdf.md"))) {
      throw new Error("Copilot bootstrap must create the AGDF fragment when user-owned AGENTS.md exists.");
    }
    writeFileSync(join(tempDir, "AGENTS.agdf.md"), "stale fragment\n", "utf8");
    const output = execFileSync(process.execPath, [binPath, "copilot", "--dir", tempDir, "--language", "en"], { encoding: "utf8", stdio: "pipe" });
    const fragment = readFileSync(join(tempDir, "AGENTS.agdf.md"), "utf8");
    if (fragment === "stale fragment\n" || !fragment.includes("## Surface Convention")) {
      throw new Error("Copilot rerun must refresh AGENTS.agdf.md while preserving user AGENTS.md.");
    }
    const config = JSON.parse(readFileSync(join(tempDir, ".agdf", "control", "config.json"), "utf8"));
    if (config.artifact_language !== "de" || config.chat_language !== "de") {
      throw new Error("Copilot rerun with user-owned AGENTS.md must preserve existing language config.");
    }
    if (!output.includes("Preserved:") || !output.includes("AGENTS.md")) {
      throw new Error("Copilot rerun output must name preserved user-owned AGENTS.md.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-copilot-owned-agents-"));

  try {
    writeFileSync(join(tempDir, "AGENTS.md"), "# AGENTS.md\n\n## Surface Convention\nGitHub Copilot repository skills do not have a plugin namespace.\n\nAGDF is agent-native first and CLI-verifiable by design.\n\nstale\n", "utf8");
    execFileSync(process.execPath, [binPath, "copilot", "--dir", tempDir], { stdio: "pipe" });
    const agents = readFileSync(join(tempDir, "AGENTS.md"), "utf8");
    if (agents.includes("stale") || !agents.includes("## Skill Routing")) {
      throw new Error("Copilot bootstrap must refresh a positively AGDF-owned root AGENTS.md.");
    }
    if (existsSync(join(tempDir, "AGENTS.agdf.md"))) {
      throw new Error("Copilot bootstrap should not create a fragment when root AGENTS.md is AGDF-owned.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}
run("both", [
  "AGENTS.md",
  join(".agdf", "control", "config.json"),
  join(".agents", "plugins", "marketplace.json"),
  join("plugins", "agdf", ".codex-plugin", "plugin.json"),
  join("plugins", "agdf", "hooks", "hooks.json"),
  join("plugins", "agdf", "meta", "agdf-agent-router.md"),
  join("plugins", "agdf", "meta", "agdf-constitution.md"),
  join("plugins", "agdf", "skills", `${pluginDefinition.codex.skillPrefix}release-or`, "SKILL.md"),
  join(".agdf", "control", "README.md"),
  join(".agdf", "control", "templates", "MASTER_BACKLOG.md"),
  join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join(".agdf", "control", "templates", "artefacts", "TP.md"),
  join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join(".agdf", "control", "templates", "artefacts", "OR.md"),
  join(".github", "copilot-instructions.md"),
  join(".github", "instructions", "agdf-governance.instructions.md"),
  join(".github", "skills", "README.md"),
  join(".github", "skills", pluginDefinition.copilot.runtimeContractFileName),
  join(".github", "skills", `${pluginDefinition.copilot.skillPrefix}code-review`, "SKILL.md"),
  join(".github", "skills", `${pluginDefinition.copilot.skillPrefix}release-or`, "SKILL.md"),
]);
run("opencode-repo", [
  "opencode.json",
  join(".agdf", "control", "config.json"),
  join(".agdf", "control", "README.md"),
  join(".agdf", "control", "templates", "AGDF_RUN.md"),
  join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join(".opencode", "AGDF.md"),
  join(".opencode", "README.md"),
  join(".opencode", pluginDefinition.opencode.runtimeContractFileName),
  join(".opencode", "agents", `${pluginDefinition.opencode.skillPrefix}gate-check.md`),
  join(".opencode", "agents", `${pluginDefinition.opencode.skillPrefix}code-review.md`),
  join(".opencode", "agents", `${pluginDefinition.opencode.skillPrefix}qa-gate.md`),
]);

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-existing-config-"));

  try {
    writeFileSync(join(tempDir, "opencode.json"), '{\n  "$schema": "https://opencode.ai/config.json"\n}\n', "utf8");
    execFileSync(process.execPath, [binPath, "opencode-repo", "--dir", tempDir], { stdio: "pipe" });

    if (!existsSync(join(tempDir, "opencode.agdf.json"))) {
      throw new Error("OpenCode target should write opencode.agdf.json when opencode.json already exists.");
    }

    const existingConfig = readFileSync(join(tempDir, "opencode.json"), "utf8");
    if (existingConfig.includes(".opencode/AGDF.md")) {
      throw new Error("OpenCode target must not overwrite an existing opencode.json without --force.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}
run("config", [
  join(".agdf", "control", "config.json"),
]);

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-init-"));

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });

    for (const relativePath of [
      join(".agdf", "control", "config.json"),
      join(".agdf", "control", "README.md"),
      join(".agdf", "control", "AGDF_RUN.md"),
      join(".agdf", "control", "MASTER_BACKLOG.md"),
      join(".agdf", "control", "SOT_REGISTRY.md"),
      join(".agdf", "control", "CONTEXT_GRAPH.md"),
      join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json"),
      join(".agdf", "control", "templates", "artefacts", "UR.md"),
      join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
      join(".agdf", "control", "templates", "artefacts", "PRD.md"),
      join(".agdf", "control", "templates", "artefacts", "SD.md"),
      join(".agdf", "control", "templates", "artefacts", "TP.md"),
      join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
      join(".agdf", "control", "templates", "artefacts", "OR.md"),
    ]) {
      if (!existsSync(join(tempDir, relativePath))) {
        throw new Error(`Missing live control file for init: ${relativePath}`);
      }
    }

    const doctorOutput = execFileSync(process.execPath, [binPath, "doctor", "--dir", tempDir, "--json"], { encoding: "utf8" });
    const doctorReport = JSON.parse(doctorOutput);
    if (doctorReport.status !== "revise") {
      throw new Error(`Doctor should classify a fresh unfilled control scaffold as revise, got ${doctorReport.status}.`);
    }
    if (!doctorReport.findings.some((finding) => finding.code === "AGDF_CURRENT_GATE_MISSING")) {
      throw new Error("Doctor should report a missing current gate for a fresh control scaffold.");
    }
    if (!doctorReport.findings.some((finding) => finding.code === "AGDF_NEXT_ALLOWED_ACTION_MISSING")) {
      throw new Error("Doctor should report a missing next allowed action for a fresh control scaffold.");
    }
    if (!doctorReport.findings.some((finding) => finding.code === "AGDF_EVIDENCE_EMPTY")) {
      throw new Error("Doctor should report empty evidence for a fresh control scaffold.");
    }

    let gateCheckFailed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      gateCheckFailed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block a fresh unfilled control scaffold, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.current_gate !== "UR") {
        throw new Error(`Gate-check should fall back to UR for a fresh scaffold, got ${gateCheckReport.current_gate}.`);
      }
      if (!gateCheckReport.allowed.includes("formulate and persist UR")) {
        throw new Error("Gate-check should require UR persistence before later artefacts.");
      }
      if (!gateCheckReport.next_allowed_action.includes("persist the UR draft")) {
        throw new Error("Gate-check should make UR drafting the constructive next action for a fresh scaffold.");
      }
      if (gateCheckReport.doctor_status !== "revise") {
        throw new Error(`Gate-check should embed the doctor revise status, got ${gateCheckReport.doctor_status}.`);
      }
      if (!gateCheckReport.doctor_report?.findings?.some((finding) => finding.code === "AGDF_CURRENT_GATE_MISSING")) {
        throw new Error("Gate-check should include the doctor report as evidence.");
      }
      if (!gateCheckReport.status_card || gateCheckReport.status_card.current_gate !== "UR") {
        throw new Error("Gate-check JSON should include the compact status_card projection.");
      }
      if (gateCheckReport.evidence_refs.length !== 0) {
        throw new Error("Gate-check should not expose empty template evidence rows.");
      }
    }
    if (!gateCheckFailed) {
      throw new Error("Gate-check should exit non-zero when a fresh control scaffold is blocked.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-status-card-"));

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--status-card"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const output = error.stdout.toString();
      if (!output.includes("AGDF status-card: blocked") || !output.includes("Current gate: UR") || !output.includes("Next step:")) {
        throw new Error("gate-check --status-card should print compact status-card fields.");
      }
      if (output.includes("doctor_report") || output.includes("delivery_map")) {
        throw new Error("gate-check --status-card must not print the full JSON report.");
      }
    }
    if (!failed) {
      throw new Error("gate-check --status-card should preserve the blocked exit code when the gate is blocked.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-language-explicit-"));

  try {
    execFileSync(process.execPath, [binPath, "copilot", "--dir", tempDir, "--language", "de"], { stdio: "pipe" });
    const config = JSON.parse(readFileSync(join(tempDir, ".agdf", "control", "config.json"), "utf8"));
    if (config.artifact_language !== "de" || config.chat_language !== "de" || config.runtime_language !== "en") {
      throw new Error("Explicit --language de should set artefact/chat language to de and runtime language to en.");
    }
    if (config.source !== "parameter") {
      throw new Error(`Explicit --language should record source=parameter, got ${config.source}.`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-language-config-update-"));

  try {
    execFileSync(process.execPath, [binPath, "config", "--dir", tempDir, "--language", "de"], { stdio: "pipe" });
    let config = JSON.parse(readFileSync(join(tempDir, ".agdf", "control", "config.json"), "utf8"));
    if (config.artifact_language !== "de" || config.chat_language !== "de") {
      throw new Error("Config target should write only the requested project language.");
    }
    if (existsSync(join(tempDir, ".agdf", "control", "AGDF_RUN.md"))) {
      throw new Error("Config target must not create live AGDF control files.");
    }

    execFileSync(process.execPath, [binPath, "config", "--dir", tempDir, "--language", "en"], { stdio: "pipe" });
    config = JSON.parse(readFileSync(join(tempDir, ".agdf", "control", "config.json"), "utf8"));
    if (config.artifact_language !== "en" || config.chat_language !== "en" || config.runtime_language !== "en") {
      throw new Error("Config target should update existing config.json without requiring --force.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-language-locale-"));

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], {
      stdio: "pipe",
      env: {
        ...process.env,
        LC_ALL: "",
        LC_MESSAGES: "",
        LANGUAGE: "",
        LANG: "de_DE.UTF-8",
      },
    });
    const config = JSON.parse(readFileSync(join(tempDir, ".agdf", "control", "config.json"), "utf8"));
    if (config.artifact_language !== "de" || config.chat_language !== "de") {
      throw new Error("System locale de_DE.UTF-8 should default artefact/chat language to de.");
    }
    if (config.source !== "system_locale" || config.detected_locale !== "de_DE.UTF-8") {
      throw new Error(`System locale detection should record source and locale, got ${config.source}/${config.detected_locale}.`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-implicit-consent-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | User said "ok, leg los" after a draft intent. |
| What is approved? | implicit consent only |
| What is missing? | exact Approval: UR |
| What is the next allowed action? | Request exact UR approval. |
| What is explicitly forbidden right now? | PRD, SD, TP, implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | missing | ok, leg los |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | draft |  |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| implicit consent | AGDF_RUN.md | UR gate | direct |

## Closeout

- next_allowed_action: Request exact UR approval.
`, "utf8");

    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block implicit consent, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.current_gate !== "UR") {
        throw new Error(`Gate-check should remain at UR for implicit consent, got ${gateCheckReport.current_gate}.`);
      }
      if (gateCheckReport.missing_approval !== "Approval: UR") {
        throw new Error(`Gate-check should require exact UR approval, got ${gateCheckReport.missing_approval}.`);
      }
      if (!gateCheckReport.forbidden.includes("implement code")) {
        throw new Error("Gate-check should forbid implementation when consent is only implicit.");
      }
    }
    if (!failed) {
      throw new Error("Gate-check should exit non-zero when consent is only implicit.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-qa-passed-uat-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: qa-passed-run
- started_at: 2026-07-08
- mode: structured_delivery
- current_gate: UAT
- decision: qa_passed
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | QA passed for a structured slice. |
| What is approved? | UR approved; PRD/SD/TP not applicable; QA passed. |
| What is missing? | Approval: UAT |
| What is the next allowed action? | Request Approval: UAT before delivery handoff. |
| What is explicitly forbidden right now? | release or commit handoff without UAT approval |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | not_applicable | structured_slice |
| SD | not_applicable | structured_slice |
| TP | not_applicable | structured_slice |
| QA | passed | .agdf/control/artefacts/qa-passed-run/QA_REPORT.md |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/qa-passed-run/UR.md | approved |  |
| QA | .agdf/control/artefacts/qa-passed-run/QA_REPORT.md | passed |  |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: none
- scope_reason: Test slice.
- evidence: Test evidence.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | exact approval |
| PRD | derived_from | UR | not_applicable: structured_slice |
| SD | derived_from | PRD | not_applicable: structured_slice |
| TP | derived_from | SD | not_applicable: structured_slice |
| QA_REPORT | tests | TP | .agdf/control/artefacts/qa-passed-run/QA_REPORT.md |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| QA report | .agdf/control/artefacts/qa-passed-run/QA_REPORT.md | QA | direct |

## Closeout

- next_allowed_action: Request Approval: UAT before delivery handoff.
`, "utf8");

    const gateCheckReport = JSON.parse(execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8" }));
    if (gateCheckReport.current_gate !== "UAT") {
      throw new Error(`Gate-check should stay at UAT after QA passed, got ${gateCheckReport.current_gate}.`);
    }
    if (gateCheckReport.missing_approval !== "Approval: UAT") {
      throw new Error(`Gate-check should require UAT approval after QA passed, got ${gateCheckReport.missing_approval}.`);
    }
    if (!gateCheckReport.allowed.includes("request exact UAT approval")) {
      throw new Error("Gate-check should allow requesting exact UAT approval after QA passed.");
    }
    if (!gateCheckReport.forbidden.includes("release")) {
      throw new Error("Gate-check should forbid release until UAT approval.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-doctor-qa-status-mismatch-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: qa-status-mismatch
- started_at: 2026-07-09
- mode: structured_delivery
- current_gate: QA
- decision: qa_passed
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | QA approval and report exist, but the artefact status uses the wrong durable vocabulary. |
| What is approved? | UR, PRD, SD, TP and QA |
| What is missing? | Durable status correction |
| What is the next allowed action? | Correct QA artefact status. |
| What is explicitly forbidden right now? | Release readiness claims |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | approved | Approval: SD |
| TP | approved | Approval: TP |
| QA | approved | Approval: QA |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/qa-status-mismatch/UR.md | approved |  |
| PRD | .agdf/control/artefacts/qa-status-mismatch/PRD.md | approved |  |
| SD | .agdf/control/artefacts/qa-status-mismatch/SD.md | approved |  |
| TP | .agdf/control/artefacts/qa-status-mismatch/TP.md | approved |  |
| QA | .agdf/control/artefacts/qa-status-mismatch/QA_REPORT.md | approved | wrong durable status for QA |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: TP
- scope_reason: Test slice.
- evidence: Test evidence.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | exact approval |
| PRD | derived_from | UR | PRD links to approved UR. |
| SD | derived_from | PRD | SD links to approved PRD. |
| TP | derived_from | SD | TP links to approved SD. |
| QA_REPORT | tests | TP | .agdf/control/artefacts/qa-status-mismatch/QA_REPORT.md |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| QA report | .agdf/control/artefacts/qa-status-mismatch/QA_REPORT.md | QA | direct |
`, "utf8");

    const doctorReport = runJson(["doctor", "--dir", tempDir, "--json"]);
    if (doctorReport.status !== "revise") {
      throw new Error(`Doctor should revise on QA durable artefact status mismatch, got ${doctorReport.status}.`);
    }
    if (!doctorReport.findings.some((finding) => finding.code === "AGDF_GATE_ARTEFACT_STATUS_INCONSISTENT" && finding.message.includes("expected `pass` or `passed`"))) {
      throw new Error("Doctor should report the QA-specific durable artefact status vocabulary.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-doctor-missing-"));

  try {
    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "doctor", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const output = error.stdout.toString();
      const doctorReport = JSON.parse(output);
      if (doctorReport.status !== "block") {
        throw new Error(`Doctor should block when live control files are missing, got ${doctorReport.status}.`);
      }
      if (!doctorReport.findings.some((finding) => finding.code === "AGDF_CONTROL_FILE_MISSING")) {
        throw new Error("Doctor should report missing live control files.");
      }
    }

    if (!failed) {
      throw new Error("Doctor should exit non-zero when live control files are missing.");
    }

    let gateCheckFailed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      gateCheckFailed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked" || gateCheckReport.doctor_status !== "block") {
        throw new Error("Gate-check should block when doctor blocks missing live control files.");
      }
      if (gateCheckReport.blocking_reason !== "AGDF_CONTROL_FILE_MISSING") {
        throw new Error(`Gate-check should expose the doctor blocker, got ${gateCheckReport.blocking_reason}.`);
      }
      if (gateCheckReport.current_gate !== "UR") {
        throw new Error(`Gate-check should orient missing control files to UR, got ${gateCheckReport.current_gate}.`);
      }
      if (!gateCheckReport.allowed.includes("draft the minimal UR for the requested change in the response")) {
        throw new Error("Gate-check should allow minimal in-response UR drafting when control files are missing.");
      }
      if (!gateCheckReport.next_allowed_action.includes("Draft the minimal UR for the request in the response")) {
        throw new Error("Gate-check should give in-response UR draft as the next action when control files are missing.");
      }
      if (!gateCheckReport.next_allowed_action.includes("Do not write a full .agdf/control scaffold")) {
        throw new Error("Gate-check should prevent full control scaffold writes by default when control files are missing.");
      }
      if (!gateCheckReport.forbidden.includes("implement code")) {
        throw new Error("Gate-check should still forbid implementation when control files are missing.");
      }
    }

    if (!gateCheckFailed) {
      throw new Error("Gate-check should exit non-zero when live control files are missing.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-ur-triage-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Test UR is approved and persisted. |
| What is approved? | UR |
| What is missing? | Brownfield Review |
| What is the next allowed action? | Run Brownfield Review after G-00. |
| What is explicitly forbidden right now? | PRD and implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review |  | missing |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Test fixture uses a small structured slice.
- evidence: Brownfield Review marked not_applicable.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | AGDF_RUN.md | UR gate | direct |

## Closeout

- next_allowed_action: Run Brownfield Review after G-00.
`, "utf8");

    const gateCheckOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8" });
    const gateCheckReport = JSON.parse(gateCheckOutput);
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should open Brownfield Review after approved UR, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.current_gate !== "Brownfield Review") {
      throw new Error(`Gate-check should move from approved UR to Brownfield Review, got ${gateCheckReport.current_gate}.`);
    }
    if (!gateCheckReport.allowed.includes("run Brownfield Review after G-00")) {
      throw new Error("Gate-check should allow Brownfield Review after approved UR.");
    }
    if (!gateCheckReport.forbidden.includes("create PRD before Brownfield Review is resolved")) {
      throw new Error("Gate-check should forbid PRD before Brownfield Review is resolved.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-open-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-05
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Test UR is approved. |
| What is approved? | UR |
| What is missing? | PRD |
| What is the next allowed action? | Draft PRD. |
| What is explicitly forbidden right now? | Implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |
| SD | not_applicable |  |
| TP | not_applicable |  |
| QA | not_applicable |  |
| UAT | not_applicable |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review | .agdf/control/artefacts/test-run/BROWNFIELD_REVIEW.md | not_applicable | No Brownfield impact. |
| PRD |  | draft |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Test fixture uses a small structured slice.
- evidence: Brownfield Review marked not_applicable.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | AGDF_RUN.md | UR gate | direct |

## Closeout

- next_allowed_action: Draft PRD.
`, "utf8");

    const gateCheckOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8" });
    const gateCheckReport = JSON.parse(gateCheckOutput);
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should be open when current gate is approved and next action exists, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.current_gate !== "PRD") {
      throw new Error(`Gate-check should move from approved UR to PRD, got ${gateCheckReport.current_gate}.`);
    }
    if (!gateCheckReport.forbidden.includes("implement code")) {
      throw new Error("Gate-check should forbid implementation immediately after UR approval.");
    }
    if (gateCheckReport.doctor_status !== "warn") {
      throw new Error(`Gate-check should preserve non-blocking doctor warnings, got ${gateCheckReport.doctor_status}.`);
    }
    if (gateCheckReport.next_allowed_action !== "Draft PRD.") {
      throw new Error(`Gate-check should expose the next allowed action, got ${gateCheckReport.next_allowed_action}.`);
    }
    if (gateCheckReport.next_gate_after_approval !== "SD" || gateCheckReport.status_card?.next_gate_after_approval !== "SD") {
      throw new Error("Gate-check should expose SD as the next gate after PRD approval.");
    }
    if (!gateCheckReport.allowed_after_approval.includes("Draft Solution Design") || gateCheckReport.allowed_after_approval.includes("implementation is allowed")) {
      throw new Error("Gate-check should describe post-PRD approval authority without implying implementation authority.");
    }
    if (!gateCheckReport.status_card?.allowed_after_approval.includes("Draft Solution Design")) {
      throw new Error("Status card should expose allowed-after-approval text for a missing PRD approval.");
    }
    const statusCardOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--status-card"], { encoding: "utf8" });
    if (!statusCardOutput.includes("Next gate after approval: SD") || !statusCardOutput.includes("Allowed after approval: Draft Solution Design")) {
      throw new Error("gate-check --status-card should print post-approval transition lines for missing approval cases.");
    }
    if (gateCheckReport.evidence_refs.length !== 1 || gateCheckReport.evidence_refs[0].evidence !== "UR approval") {
      throw new Error("Gate-check should expose filled evidence references.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-mode-slice-missing-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: Brownfield Review
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR is approved and Brownfield Review is done. |
| What is approved? | UR |
| What is missing? | Mode/Slice Decision |
| What is the next allowed action? | Decide process size. |
| What is explicitly forbidden right now? | PRD and implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review | .agdf/control/artefacts/test-run/BROWNFIELD_REVIEW.md | done | Existing owner and scope were inspected. |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Brownfield Review | AGDF_RUN.md | Mode selection | direct |

## Closeout

- next_allowed_action: Decide process size.
`, "utf8");

    const gateCheckOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8" });
    const gateCheckReport = JSON.parse(gateCheckOutput);
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should open Mode/Slice Decision after Brownfield Review, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.current_gate !== "Mode/Slice Decision") {
      throw new Error(`Gate-check should not jump to PRD without Mode/Slice Decision, got ${gateCheckReport.current_gate}.`);
    }
    if (!gateCheckReport.forbidden.includes("create PRD before process size is decided")) {
      throw new Error("Gate-check should forbid PRD before process size is decided.");
    }
    if (gateCheckReport.next_gate_after_approval !== "none" || gateCheckReport.status_card?.allowed_after_approval !== "none") {
      throw new Error("Internal Mode/Slice Decision should not invent post-approval transition fields.");
    }
    const statusCardOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--status-card"], { encoding: "utf8" });
    if (statusCardOutput.includes("Next gate after approval:") || statusCardOutput.includes("Allowed after approval:")) {
      throw new Error("Internal-step status card should omit post-approval transition lines.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-or-handoff-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: or-run
- started_at: 2026-07-10
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UAT approved and OR handoff is allowed. |
| What is approved? | UR, PRD, SD, TP, QA, UAT |
| What is missing? | none |
| What is the next allowed action? | Produce delivery closeout. |
| What is explicitly forbidden right now? | Automatic commit or release |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | not_applicable | quick historical scope |
| PRD | not_applicable | quick historical scope |
| SD | not_applicable | quick historical scope |
| TP | not_applicable | quick historical scope |
| QA | approved | QA report passed |
| UAT | approved | Approval: UAT |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| QA | .agdf/control/artefacts/or-run/QA_REPORT.md | passed |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| QA_REPORT | tests | TP | QA report verified the completed task plan. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UAT approval | AGDF_RUN.md | UAT | direct |

## Closeout

- next_allowed_action: Produce delivery closeout.
`, "utf8");

    const gateCheckReport = JSON.parse(execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8" }));
    if (gateCheckReport.current_gate !== "OR" || gateCheckReport.missing_approval !== "none") {
      throw new Error("OR handoff should have no missing approval.");
    }
    if (gateCheckReport.next_gate_after_approval !== "none" || gateCheckReport.status_card?.allowed_after_approval !== "none") {
      throw new Error("OR handoff should not expose post-approval transition fields.");
    }
    const statusCardOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--status-card"], { encoding: "utf8" });
    if (statusCardOutput.includes("Next gate after approval:") || statusCardOutput.includes("Allowed after approval:")) {
      throw new Error("OR handoff status card should omit post-approval transition lines.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-mode-slice-incomplete-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: Brownfield Review
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR is approved and Brownfield Review is done. |
| What is approved? | UR |
| What is missing? | Mode/Slice Decision evidence |
| What is the next allowed action? | Record Mode/Slice Decision with evidence. |
| What is explicitly forbidden right now? | Implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review | .agdf/control/artefacts/test-run/BROWNFIELD_REVIEW.md | done | Existing owner and scope were inspected. |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason:
- evidence:

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Brownfield Review | AGDF_RUN.md | Mode selection | direct |

## Closeout

- next_allowed_action: Record Mode/Slice Decision with evidence.
`, "utf8");

    const gateCheckOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8" });
    const gateCheckReport = JSON.parse(gateCheckOutput);
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should remain open for incomplete Mode/Slice Decision, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.current_gate !== "Mode/Slice Decision") {
      throw new Error(`Gate-check should not enter Quick Task Execution without Mode/Slice evidence, got ${gateCheckReport.current_gate}.`);
    }
    if (!gateCheckReport.forbidden.includes("implement code")) {
      throw new Error("Gate-check should forbid implementation while Mode/Slice Decision evidence is missing.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-delivery-map-chain-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");
  const backlogPath = join(tempDir, ".agdf", "control", "MASTER_BACKLOG.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(backlogPath, `# AGDF Master Backlog

## Active Backlog

| Prio | Key | Title | Status | UR | Brownfield Review | PRD | SD | TP | QA | OR | Current Spec | Notes |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | test-run | Delivery map test | in_progress | UR.md | BROWNFIELD_REVIEW.md | PRD.md |  |  |  | OR.md | PRD.md | needs SD |
`, "utf8");
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: SD
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR and PRD are approved. |
| What is approved? | UR, PRD |
| What is missing? | PRD relationship evidence |
| What is the next allowed action? | Fill Artefact Chain evidence. |
| What is explicitly forbidden right now? | SD approval |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review | .agdf/control/artefacts/test-run/BROWNFIELD_REVIEW.md | not_applicable | No Brownfield impact. |
| PRD | .agdf/control/artefacts/test-run/PRD.md | approved |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |
| PRD | derived_from | UR |  |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | AGDF_RUN.md | UR gate | direct |
| PRD approval | AGDF_RUN.md | PRD gate | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
|  | warn |  |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
|  | warn |  |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs:
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence:

## Closeout

- next_allowed_action: Fill Artefact Chain evidence.
`, "utf8");

    const deliveryMapOutput = execFileSync(process.execPath, [binPath, "delivery-map", "--dir", tempDir, "--json"], { encoding: "utf8" });
    const deliveryMapReport = JSON.parse(deliveryMapOutput);
    if (deliveryMapReport.status !== "revise") {
      throw new Error(`Delivery-map should revise approved PRD without relationship evidence, got ${deliveryMapReport.status}.`);
    }
    if (deliveryMapReport.status_card?.current_gate !== "SD") {
      throw new Error("Delivery-map should expose a Run Status Card with the current gate.");
    }
    if (!deliveryMapReport.status_card?.forbidden_now?.includes("create TP")) {
      throw new Error("Delivery-map status card should expose currently forbidden actions.");
    }
    if (!deliveryMapReport.quality_outlook || deliveryMapReport.status_card?.quality_outlook !== deliveryMapReport.quality_outlook) {
      throw new Error("Delivery-map should expose quality_outlook consistently on the report and status card.");
    }
    if (!deliveryMapReport.findings.some((finding) => finding.code === "AGDF_DELIVERY_RELATIONSHIP_EVIDENCE_MISSING")) {
      throw new Error("Delivery-map should report missing relationship evidence for approved PRD.");
    }
    if (!deliveryMapReport.relationships.some((relationship) => relationship.from === "PRD" && relationship.status === "missing_evidence")) {
      throw new Error("Delivery-map should expose PRD relationship status as missing_evidence.");
    }
    if (deliveryMapReport.backlog_pointers[0]?.brownfield_review !== "BROWNFIELD_REVIEW.md") {
      throw new Error("Delivery-map should preserve the Brownfield Review backlog pointer column.");
    }
    if (deliveryMapReport.backlog_pointers[0]?.or !== "OR.md") {
      throw new Error("Delivery-map should preserve the OR backlog pointer column.");
    }
    if (deliveryMapReport.backlog_pointers[0]?.current_spec !== "PRD.md") {
      throw new Error("Delivery-map should preserve the Current Spec column after OR.");
    }

    let gateCheckFailed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      gateCheckFailed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (!gateCheckReport.delivery_map?.findings?.some((finding) => finding.code === "AGDF_DELIVERY_RELATIONSHIP_EVIDENCE_MISSING")) {
        throw new Error("Gate-check should include delivery-map findings as evidence context.");
      }
      if (gateCheckReport.status_card?.current_gate !== "SD") {
        throw new Error("Gate-check should expose a Run Status Card with the current gate.");
      }
      if (!gateCheckReport.status_card?.allowed_now?.includes("draft or refine Solution Design")) {
        throw new Error("Gate-check status card should expose currently allowed actions.");
      }
      if (!gateCheckReport.quality_outlook || gateCheckReport.status_card?.quality_outlook !== gateCheckReport.quality_outlook) {
        throw new Error("Gate-check should expose quality_outlook consistently on the report and status card.");
      }
    }
    if (!gateCheckFailed) {
      throw new Error("Gate-check should exit non-zero when delivery-map relationship evidence is missing.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-compact-backlog-"));
  const backlogPath = join(tempDir, ".agdf", "control", "MASTER_BACKLOG.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    const statusCases = [
      ["Needs UR", "needs_ur"],
      ["Awaiting Brownfield Review", "awaiting_brownfield_review"],
      ["Awaiting PRD", "awaiting_prd"],
      ["Awaiting PRD approval", "awaiting_prd_approval"],
      ["Awaiting SD", "awaiting_sd"],
      ["Awaiting SD approval", "awaiting_sd_approval"],
      ["Awaiting TP", "awaiting_tp"],
      ["Awaiting TP approval", "awaiting_tp_approval"],
      ["In progress", "in_progress"],
      ["Blocked", "blocked"],
      ["Awaiting QA", "awaiting_qa"],
      ["Awaiting UAT", "awaiting_uat"],
      ["Completed", "completed"],
      ["Superseded", "superseded"],
      ["Abandoned", "abandoned"],
      ["legacy_custom_status", "legacy_custom_status"],
    ];
    const statusRows = statusCases
      .map(([label], index) => `| P1 | \`status-${index}\` | ${label} test | ${label} | [UR](artefacts/status-${index}/UR.md) | [UR](artefacts/status-${index}/UR.md) | Continue |`)
      .join("\n");
    writeFileSync(backlogPath, `# AGDF Master Backlog

## Active Backlog

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|
| P1 | \`compact-run\` | Compact backlog test | Awaiting UAT | [UR](artefacts/compact-run/UR.md) · [Brownfield](artefacts/compact-run/BROWNFIELD_REVIEW.md) · [QA](artefacts/compact-run/QA_REPORT.md) · [OR](artefacts/compact-run/OR.md) | [QA](artefacts/compact-run/QA_REPORT.md) | Request \`Approval: UAT\` |
| P1 | \`external-spec\` | Repository SoT test | In progress | [UR](artefacts/external-spec/UR.md) | [Spec](../../docs/spec.md) | Continue |
${statusRows}

## Planned / Parking Lot

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|
`, "utf8");

    const report = runJson(["delivery-map", "--dir", tempDir, "--json"]);
    const pointer = report.backlog_pointers[0];
    if (pointer?.key !== "compact-run" || pointer?.status !== "awaiting_uat") {
      throw new Error("Compact backlog should preserve the key and normalize the human status label.");
    }
    if (pointer?.ur !== ".agdf/control/artefacts/compact-run/UR.md"
      || pointer?.brownfield_review !== ".agdf/control/artefacts/compact-run/BROWNFIELD_REVIEW.md"
      || pointer?.qa !== ".agdf/control/artefacts/compact-run/QA_REPORT.md"
      || pointer?.or !== ".agdf/control/artefacts/compact-run/OR.md"
      || pointer?.current_spec !== ".agdf/control/artefacts/compact-run/QA_REPORT.md") {
      throw new Error("Compact backlog should resolve document-relative Markdown links to repository-relative JSON paths.");
    }
    if (Object.values(pointer).some((value) => typeof value === "string" && value.includes("]("))) {
      throw new Error("Compact backlog JSON must not expose Markdown link syntax.");
    }
    const externalSpecPointer = report.backlog_pointers.find((item) => item.key === "external-spec");
    if (externalSpecPointer?.current_spec !== "docs/spec.md") {
      throw new Error(`Compact backlog should resolve safe repository SoT links, got ${externalSpecPointer?.current_spec}.`);
    }
    for (const [index, [, expectedStatus]] of statusCases.entries()) {
      const statusPointer = report.backlog_pointers.find((item) => item.key === `status-${index}`);
      if (statusPointer?.status !== expectedStatus) {
        throw new Error(`Compact backlog should normalize status-${index} to ${expectedStatus}, got ${statusPointer?.status}.`);
      }
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-invalid-compact-backlog-"));
  const backlogPath = join(tempDir, ".agdf", "control", "MASTER_BACKLOG.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(backlogPath, `# AGDF Master Backlog

## Active Backlog

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|
| P1 | \`invalid-run\` | Invalid compact backlog | Waiting magically | [UR](https://example.com/UR.md) · [UR](artefacts/invalid-run/UR.md) · [QA](/tmp/QA.md) · [Mystery](artefacts/invalid-run/MYSTERY.md) · malformed-entry | [PRD](../../../outside.md) | Fix validation |

## Planned / Parking Lot

| Priority | Key | Unsupported |
|---:|---|---|
`, "utf8");

    const report = runJson(["doctor", "--dir", tempDir, "--json"]);
    const codes = new Set(report.findings.map((finding) => finding.code));
    for (const requiredCode of [
      "AGDF_BACKLOG_STATUS_UNKNOWN",
      "AGDF_BACKLOG_LINK_TARGET_INVALID",
      "AGDF_BACKLOG_ARTEFACT_LABEL_DUPLICATE",
      "AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN",
      "AGDF_BACKLOG_ARTEFACT_LINK_INVALID",
      "AGDF_BACKLOG_LAYOUT_UNKNOWN",
    ]) {
      if (!codes.has(requiredCode)) throw new Error(`Invalid compact backlog should report ${requiredCode}.`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-completed-only-backlog-"));
  const backlogPath = join(tempDir, ".agdf", "control", "MASTER_BACKLOG.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(backlogPath, `# AGDF Master Backlog

## Active Backlog

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|

## Planned / Parking Lot

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|

## Completed / Superseded Pointers

| Key | Work item | Final status | Historical record | Outcome |
|---|---|---|---|---|
| \`completed-run\` | Completed run | Completed | [OR](artefacts/completed-run/OR.md) | UAT approved |
`, "utf8");

    const report = runJson(["doctor", "--dir", tempDir, "--json"]);
    if (report.findings.some((finding) => finding.code === "AGDF_BACKLOG_POINTER_EMPTY")) {
      throw new Error("A completed-only backlog should not be reported as empty.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-missing-ur-artifact-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-05
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Test UR was approved in chat. |
| What is approved? | UR |
| What is missing? | Durable UR artefact |
| What is the next allowed action? | Persist UR. |
| What is explicitly forbidden right now? | PRD and implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR |  | missing |  |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | AGDF_RUN.md | UR gate | direct |

## Closeout

- next_allowed_action: Persist UR.
`, "utf8");

    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block approved UR without durable artefact, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.blocking_reason !== "missing_durable_ur_artefact") {
        throw new Error(`Gate-check should report missing_durable_ur_artefact, got ${gateCheckReport.blocking_reason}.`);
      }
      if (gateCheckReport.current_gate !== "UR") {
        throw new Error(`Gate-check should remain at UR when durable UR is missing, got ${gateCheckReport.current_gate}.`);
      }
      if (!gateCheckReport.forbidden.includes("create PRD")) {
        throw new Error("Gate-check should forbid PRD before the approved UR is persisted.");
      }
    }
    if (!failed) {
      throw new Error("Gate-check should exit non-zero when UR approval has no durable artefact.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-missing-prd-artifact-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-05
- mode: structured_delivery
- current_gate: PRD
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR and PRD approval text exist. |
| What is approved? | UR, PRD |
| What is missing? | Durable PRD artefact |
| What is the next allowed action? | Persist PRD. |
| What is explicitly forbidden right now? | SD and implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| PRD |  | missing |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | AGDF_RUN.md | UR gate | direct |
| PRD approval | AGDF_RUN.md | PRD gate | direct |

## Closeout

- next_allowed_action: Persist PRD.
`, "utf8");

    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block approved PRD without durable artefact, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.blocking_reason !== "missing_durable_prd_artefact") {
        throw new Error(`Gate-check should report missing_durable_prd_artefact, got ${gateCheckReport.blocking_reason}.`);
      }
      if (gateCheckReport.current_gate !== "PRD") {
        throw new Error(`Gate-check should remain at PRD when durable PRD is missing, got ${gateCheckReport.current_gate}.`);
      }
      if (!gateCheckReport.forbidden.includes("create SD")) {
        throw new Error("Gate-check should forbid SD before the approved PRD is persisted.");
      }
    }
    if (!failed) {
      throw new Error("Gate-check should exit non-zero when PRD approval has no durable artefact.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

for (const missingCase of [
  {
    gate: "SD",
    nextAction: "Persist SD.",
    approvals: [
      "| UR | approved | Approval: UR |",
      "| PRD | approved | Approval: PRD |",
      "| SD | approved | Approval: SD |",
      "| TP | missing |  |",
    ],
    artefacts: [
      "| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |",
      "| PRD | .agdf/control/artefacts/test-run/PRD.md | approved |  |",
      "| SD |  | missing |  |",
    ],
    chain: [
      "| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |",
      "| PRD | derived_from | UR | PRD links to approved UR. |",
    ],
    reason: "missing_durable_sd_artefact",
  },
  {
    gate: "TP",
    nextAction: "Persist TP.",
    approvals: [
      "| UR | approved | Approval: UR |",
      "| PRD | approved | Approval: PRD |",
      "| SD | approved | Approval: SD |",
      "| TP | approved | Approval: TP |",
    ],
    artefacts: [
      "| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |",
      "| PRD | .agdf/control/artefacts/test-run/PRD.md | approved |  |",
      "| SD | .agdf/control/artefacts/test-run/SD.md | approved |  |",
      "| TP |  | missing |  |",
    ],
    chain: [
      "| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |",
      "| PRD | derived_from | UR | PRD links to approved UR. |",
      "| SD | derived_from | PRD | SD links to approved PRD. |",
    ],
    reason: "missing_durable_tp_artefact",
  },
  {
    gate: "QA",
    nextAction: "Persist QA report.",
    approvals: [
      "| UR | approved | Approval: UR |",
      "| PRD | approved | Approval: PRD |",
      "| SD | approved | Approval: SD |",
      "| TP | approved | Approval: TP |",
      "| QA | approved | Approval: QA |",
    ],
    artefacts: [
      "| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |",
      "| PRD | .agdf/control/artefacts/test-run/PRD.md | approved |  |",
      "| SD | .agdf/control/artefacts/test-run/SD.md | approved |  |",
      "| TP | .agdf/control/artefacts/test-run/TP.md | approved |  |",
      "| QA |  | missing |  |",
    ],
    chain: [
      "| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |",
      "| PRD | derived_from | UR | PRD links to approved UR. |",
      "| SD | derived_from | PRD | SD links to approved PRD. |",
      "| TP | derived_from | SD | TP links to approved SD. |",
    ],
    reason: "missing_durable_qa_artefact",
  },
]) {
  const tempDir = mkdtempSync(join(tmpdir(), `create-agdf-gate-check-missing-${missingCase.gate.toLowerCase()}-artifact-`));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-05
- mode: structured_delivery
- current_gate: ${missingCase.gate}
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | ${missingCase.gate} approval text exists. |
| What is approved? | ${missingCase.gate} |
| What is missing? | Durable ${missingCase.gate} artefact |
| What is the next allowed action? | ${missingCase.nextAction} |
| What is explicitly forbidden right now? | Later gate work |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
${missingCase.approvals.join("\n")}

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
${missingCase.artefacts.join("\n")}

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
${missingCase.chain.join("\n")}

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| ${missingCase.gate} approval | AGDF_RUN.md | ${missingCase.gate} gate | direct |

## Closeout

- next_allowed_action: ${missingCase.nextAction}
`, "utf8");

    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block approved ${missingCase.gate} without durable artefact, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.blocking_reason !== missingCase.reason) {
        throw new Error(`Gate-check should report ${missingCase.reason}, got ${gateCheckReport.blocking_reason}.`);
      }
      if (gateCheckReport.current_gate !== missingCase.gate) {
        throw new Error(`Gate-check should remain at ${missingCase.gate}, got ${gateCheckReport.current_gate}.`);
      }
    }
    if (!failed) {
      throw new Error(`Gate-check should exit non-zero when ${missingCase.gate} approval has no durable artefact.`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-copilot-existing-agents-"));
  const existingAgentsPath = join(tempDir, "AGENTS.md");

  try {
    writeFileSync(existingAgentsPath, "# Existing repo instructions\n", "utf8");
    execFileSync(process.execPath, [binPath, "copilot", "--dir", tempDir], { stdio: "pipe" });

    if (readFileSync(existingAgentsPath, "utf8") !== "# Existing repo instructions\n") {
      throw new Error("Existing AGENTS.md should be preserved when no --force flag is used.");
    }

    const agdfFragmentPath = join(tempDir, "AGENTS.agdf.md");
    if (!existsSync(agdfFragmentPath)) {
      throw new Error("Missing AGENTS.agdf.md fragment for existing AGENTS.md scenario.");
    }
    if (!readFileSync(agdfFragmentPath, "utf8").includes("| `agdf-gate-check` |")) {
      throw new Error("AGENTS.agdf.md must contain prefixed Copilot skill routing.");
    }

    const expectedSkillPath = join(tempDir, ".github", "skills", `${pluginDefinition.copilot.skillPrefix}gate-check`, "SKILL.md");
    if (!existsSync(expectedSkillPath)) {
      throw new Error("Missing repository skills for existing AGENTS.md scenario.");
    }

    const expectedInstructionsPath = join(tempDir, ".github", "copilot-instructions.md");
    if (!existsSync(expectedInstructionsPath)) {
      throw new Error("Missing Copilot instructions for existing AGENTS.md scenario.");
    }

    const expectedControlPath = join(tempDir, ".agdf", "control", "templates", "AGDF_RUN.md");
    if (!existsSync(expectedControlPath)) {
      throw new Error("Missing AGDF control scaffold for existing AGENTS.md scenario.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

console.log("create-agdf smoke test passed");
