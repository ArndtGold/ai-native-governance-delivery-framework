import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { syncPluginRuntime } from "./sync-plugin-runtime.js";
import {
  renderClaudePluginManifest,
  renderCodexPluginManifest,
  renderCopilotPluginManifest,
} from "../lib/public-plugin/manifest.js";
import { buildPublicPluginCandidate } from "../lib/public-plugin/builder.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const repoRoot = resolve(packageRoot, "..");
const sourceAgentsPath = join(repoRoot, "plugin", "meta", "agdf-agent-router.md");
const sourceSkillsRoot = join(repoRoot, "plugin", "skills");
const sourceControlRoot = join(repoRoot, "plugin", "control");
const sourcePluginRoot = join(repoRoot, "plugin");
const sourceRuntimeContractPath = join(repoRoot, "plugin", "meta", "agdf-runtime-contract.md");
const sourceContractsRoot = join(repoRoot, "plugin", "meta", "contracts");
const contractModules = [
  "task-target-resolution.md",
  "gate-transition.md",
  "interaction.md",
  "modes.md",
  "quality.md",
  "context-graph.md",
  "control-scaffold.md",
  "closeout.md",
];
const sourceInteractionLocalesPath = join(repoRoot, "plugin", "meta", "agdf-interaction-locales.json");
const pluginDefinitionPath = join(repoRoot, "plugin", "meta", "agdf-plugin.definition.json");
const generatedRoot = join(packageRoot, "generated");
const generatedControlRoot = join(generatedRoot, ".agdf", "control");
const generatedCodexPluginRoot = join(generatedRoot, "plugins", "agdf");
const generatedOpenCodeRoot = join(generatedRoot, ".opencode");
const generatedOpenCodeAgentsRoot = join(generatedOpenCodeRoot, "agents");
const generatedOpenCodeSkillsRoot = join(generatedOpenCodeRoot, "skills");
const pluginDefinition = JSON.parse(read(pluginDefinitionPath));
const generatedCopilotPluginSkillsRoot = join(generatedCodexPluginRoot, pluginDefinition.copilot.skills);
const interactionLocaleFileName = pluginDefinition.interactions.localeRegistry.split("/").at(-1);

function read(path) {
  return readFileSync(path, "utf8");
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function syncDirectory(sourceRoot, targetRoot) {
  for (const entry of readdirSync(sourceRoot)) {
    const sourcePath = join(sourceRoot, entry);
    const targetPath = join(targetRoot, entry);
    const stats = statSync(sourcePath);

    if (stats.isDirectory()) {
      syncDirectory(sourcePath, targetPath);
      continue;
    }

    if (stats.isFile()) {
      write(targetPath, read(sourcePath));
    }
  }
}

function syncPluginDirectory(sourceRoot, targetRoot) {
  mkdirSync(targetRoot, { recursive: true });
  const sourceEntries = new Set(readdirSync(sourceRoot).filter((entry) => entry !== "runtime"));
  for (const entry of readdirSync(targetRoot)) {
    if (!sourceEntries.has(entry)) rmSync(join(targetRoot, entry), { recursive: true, force: true });
  }
  for (const entry of readdirSync(sourceRoot)) {
    if (entry === "runtime") continue;

    const sourcePath = join(sourceRoot, entry);
    const targetPath = join(targetRoot, entry);
    const stats = statSync(sourcePath);

    if (stats.isDirectory()) {
      syncPluginDirectory(sourcePath, targetPath);
      continue;
    }

    if (stats.isFile()) {
      write(targetPath, read(sourcePath));
    }
  }
}

function sourceSkillName(skillSlug) {
  return `${pluginDefinition.codex.skillPrefix}${skillSlug}`;
}

function copilotSkillName(skillSlug) {
  return `${pluginDefinition.copilot.skillPrefix}${skillSlug}`;
}

function openCodeSkillName(skillSlug) {
  return `${pluginDefinition.opencode.skillPrefix}${skillSlug}`;
}

function toCopilotSkillContent(content) {
  let next = content;
  for (const skill of pluginDefinition.skillSet) {
    const sourceName = sourceSkillName(skill.slug);
    const targetName = copilotSkillName(skill.slug);
    if (sourceName === targetName) continue;

    next = next
      .replaceAll(`name: ${sourceName}`, `name: ${targetName}`)
      .replaceAll(`\`${sourceName}\``, `\`${targetName}\``)
      .replaceAll(`/${sourceName}`, `/${targetName}`);
  }
  return next;
}

function toOpenCodeSkillContent(content) {
  let next = content;
  for (const skill of pluginDefinition.skillSet) {
    const sourceName = sourceSkillName(skill.slug);
    const targetName = openCodeSkillName(skill.slug);
    if (sourceName === targetName) continue;

    next = next
      .replaceAll(`name: ${sourceName}`, `name: ${targetName}`)
      .replaceAll(`\`${sourceName}\``, `\`${targetName}\``)
      .replaceAll(`/${sourceName}`, `/${targetName}`);
  }
  return next;
}

function toOpenCodeInstructionsRouter(content) {
  const openCodeSurfaceConvention = [
    "## Surface Convention",
    "OpenCode project skills do not have a plugin namespace.",
    "",
    "Therefore generated OpenCode skill names use the AGDF prefix:",
    "",
    ...pluginDefinition.skillSet.map((skill) => `- \`${openCodeSkillName(skill.slug)}\``),
    "",
    "Do not remove that prefix in OpenCode-facing repository skills.",
    "Codex and Claude Code plugin surfaces use unprefixed skill names because their plugin namespace already carries `agdf`.",
    "",
  ].join("\n");

  return toOpenCodeSkillContent(content)
    .replace("# AGDF Agent Router", "# AGDF OpenCode instructions")
    .replace(
      "You are operating inside the AGDF plugin namespace.",
      "You are operating in an OpenCode project configured with AGDF.",
    )
    .replace(
      "Use the plugin skills as workflow controls, not as documentation shortcuts.",
      "Use the native AGDF skills as workflow controls, not as documentation shortcuts.",
    )
    .replace(/## Surface Convention[\s\S]*?(?=## Mode Selection)/, openCodeSurfaceConvention);
}

function getSkillDirectories() {
  const expectedSkillNames = pluginDefinition.skillSet
    .map((skill) => sourceSkillName(skill.slug))
    .sort();
  const actualSkillNames = readdirSync(sourceSkillsRoot)
    .filter((entry) => statSync(join(sourceSkillsRoot, entry)).isDirectory())
    .sort();

  if (JSON.stringify(actualSkillNames) !== JSON.stringify(expectedSkillNames)) {
    throw new Error(`AGDF skill directories do not match the canonical target convention. Expected ${expectedSkillNames.join(", ")}, got ${actualSkillNames.join(", ")}`);
  }

  return actualSkillNames;
}

function writeOpenCodeConfig() {
  const config = {
    "$schema": "https://opencode.ai/config.json",
    plugin: [pluginDefinition.opencode.npmPackage],
    instructions: [`.opencode/${pluginDefinition.opencode.instructionsFileName}`],
    permission: pluginDefinition.opencode.permissions,
  };

  write(join(generatedRoot, "opencode.json"), `${JSON.stringify(config, null, 2)}\n`);
}

function writeOpenCodeInstructions() {
  const lines = [
    toOpenCodeInstructionsRouter(read(sourceAgentsPath)),
    "",
    "## OpenCode Files",
    "",
    "- OpenCode loads this file through `opencode.json` `instructions`.",
    "- AGDF for OpenCode has a global npm/native-skill discoverability layer and this repository-local governance surface.",
    "- The global plugin and skills do not replace this file, `.opencode/skills/` or `.agdf/control/`; repository files remain the AGDF source of truth.",
    "- Native OpenCode skills live under `.opencode/skills/` and use the `agdf-` prefix.",
    "- The generated AGDF skills are loaded on demand through OpenCode's native `skill` tool; they are not parallel subagents or primary menu agents.",
    "- For new build/change intent or unclear approval, load the `agdf-gate-check` skill before later artefacts or implementation.",
    `- The AGDF OpenCode plugin is loaded from npm through \`opencode.json\` \`plugin: ["${pluginDefinition.opencode.npmPackage}"]\`.`,
    "- Use `npx --yes @agdf/cli@latest opencode-status --json` to verify global config, package loadability, global native-skill completeness, active session signals and repository surface presence separately.",
    "- OpenCode permissions allow the built-in `question` tool, keep `edit` and `bash` on explicit approval and allow the generated `agdf-*` skills explicitly; global adapters use the `agdf-global-*` namespace.",
    "- An explicit user `permission.question: deny` remains authoritative and selects the exact-text AGDF fallback; never convert an OpenCode permission outcome or auto mode into gate approval.",
    "- Shared output and gate rules live in `.opencode/agdf-runtime-contract.md`.",
    "- Do not paste full control files, templates or artefact bodies into chat unless the user explicitly asks for the full content; summarize and link paths instead.",
    "- OpenCode plugin hooks (`tool.execute.before`) do not intercept tool calls from subagents spawned via the `task` tool (issue #5894, PR #36238 open). AGDF enforcement through plugin hooks applies to primary-agent tool calls only; in the subagent path, AGDF governance is auditing-only. Do not route work to a subagent to bypass a primary-agent gate; verify subagent results through the canonical validator after the subagent returns.",
    "",
  ];

  write(join(generatedOpenCodeRoot, pluginDefinition.opencode.instructionsFileName), lines.join("\n"));
}

function writeOpenCodeSkill(skillSlug) {
  const sourceName = sourceSkillName(skillSlug);
  const targetName = openCodeSkillName(skillSlug);
  const sourcePath = join(sourceSkillsRoot, sourceName, "SKILL.md");
  const content = toOpenCodeSkillContent(
    read(sourcePath).replaceAll(
      "../../meta/contracts/",
      "../../contracts/",
    ).replaceAll(
      "../../meta/agdf-runtime-contract.md",
      `../../${pluginDefinition.opencode.runtimeContractFileName}`,
    ).replaceAll("plugin/meta/agdf-interaction-locales.json", `../../${interactionLocaleFileName}`),
  );

  write(join(generatedOpenCodeSkillsRoot, targetName, "SKILL.md"), content);
}

function writeOpenCodeReadme(skillSlugs) {
  const lines = [
    "# AGDF OpenCode surface",
    "",
    "These files were generated from the AGDF source repository for OpenCode.",
    "",
    `- The globally installed npm plugin \`${pluginDefinition.opencode.npmPackage}\` owns the shared OpenCode runtime surface.`,
    "- A repository is AGDF-active when `.agdf/control/config.json` is valid; this activation does not copy `.opencode/` assets.",
    "- Global adapters use `agdf-global-*` to avoid same-name masking by supported legacy local `agdf-*` skills.",
    "- Preserve an explicit user `permission.question: deny`; AGDF then uses exact textual approval and never interprets OpenCode permission outcomes or auto mode as gate authority.",
    "- For new build/change intent or unclear approval, load `agdf-global-gate-check` through OpenCode's native `skill` tool.",
    "- Use `npx --yes @agdf/cli@latest opencode-status --json` to distinguish global hook/native-skill configuration, package loadability, durable activation, legacy compatibility and session activity.",
    "- For deterministic ready-gate rendering, prefer an installed `agdf gate-check --approval-envelope`; reserve `agdf gate-check --json` for native-adapter input, automation or audit evidence and use `npx ...@latest` only for bootstrap, refresh or a missing local executable.",
    "- The globally installed runtime contract is the shared gate and output contract.",
    "",
    "## Skills",
    "",
    ...skillSlugs.map((skill) => `- \`${openCodeSkillName(skill)}\``),
    "",
  ];

  write(join(generatedOpenCodeRoot, "README.md"), lines.join("\n"));
}

function syncOpenCodeRuntimeContract() {
  write(join(generatedOpenCodeRoot, pluginDefinition.opencode.runtimeContractFileName), toOpenCodeSkillContent(read(sourceRuntimeContractPath).replaceAll("plugin/meta/agdf-interaction-locales.json", interactionLocaleFileName)));
  write(join(generatedOpenCodeRoot, interactionLocaleFileName), read(sourceInteractionLocalesPath));
  for (const moduleName of contractModules) {
    const source = read(join(sourceContractsRoot, moduleName))
      .replaceAll("plugin/meta/agdf-interaction-locales.json", interactionLocaleFileName);
    write(join(generatedOpenCodeRoot, "contracts", moduleName), toOpenCodeSkillContent(source));
  }
}

function syncCopilotPluginContract() {
  const contract = toCopilotSkillContent(read(sourceRuntimeContractPath)
    .replaceAll("plugin/meta/agdf-interaction-locales.json", interactionLocaleFileName));
  write(join(generatedCopilotPluginSkillsRoot, pluginDefinition.copilot.runtimeContractFileName), contract);
  write(join(generatedCopilotPluginSkillsRoot, interactionLocaleFileName), read(sourceInteractionLocalesPath));
  for (const moduleName of contractModules) {
    const source = read(join(sourceContractsRoot, moduleName))
      .replaceAll("plugin/meta/agdf-interaction-locales.json", interactionLocaleFileName);
    write(join(generatedCopilotPluginSkillsRoot, "contracts", moduleName), toCopilotSkillContent(source));
  }
}

function syncCopilotPluginSkill(skillSlug) {
  const sourceName = sourceSkillName(skillSlug);
  const targetName = copilotSkillName(skillSlug);
  const sourcePath = join(sourceSkillsRoot, sourceName, "SKILL.md");
  const normalized = toCopilotSkillContent(read(sourcePath)
    .replaceAll("../../meta/contracts/", "../contracts/")
    .replaceAll("../../meta/agdf-runtime-contract.md", `../${pluginDefinition.copilot.runtimeContractFileName}`)
    .replaceAll("plugin/meta/agdf-interaction-locales.json", `../${interactionLocaleFileName}`));
  write(join(generatedCopilotPluginSkillsRoot, targetName, "SKILL.md"), normalized);
}

function writeCopilotPluginFiles() {
  write(join(generatedCodexPluginRoot, pluginDefinition.copilot.pluginManifest), renderCopilotPluginManifest(pluginDefinition));
  write(join(generatedCodexPluginRoot, pluginDefinition.copilot.hooks), `${JSON.stringify({
    version: 1,
    hooks: {
      sessionStart: [{
        type: "command",
        command: "node \"${PLUGIN_ROOT}/runtime/agdf-session-check.js\"",
        env: { AGDF_SURFACE: "copilot" },
        timeoutSec: 10,
      }],
    },
  }, null, 2)}\n`);
  syncCopilotPluginContract();
}

function writeCodexMarketplace() {
  const repositoryMarketplaceName = pluginDefinition.distributionProfiles.marketplaceIdentities.generatedRepository;
  const marketplace = {
    name: repositoryMarketplaceName,
    interface: {
      displayName: "This repository",
    },
    plugins: [
      {
        name: pluginDefinition.id,
        source: {
          source: "local",
          path: "./plugins/agdf",
        },
        policy: {
          installation: "AVAILABLE",
          authentication: "ON_INSTALL",
        },
        category: pluginDefinition.category,
      },
    ],
  };

  write(join(generatedRoot, ".agents", "plugins", "marketplace.json"), `${JSON.stringify(marketplace, null, 2)}\n`);
}

function main() {
  const skillSlugs = getSkillDirectories().map((skillName) => {
    const prefix = pluginDefinition.codex.skillPrefix;
    return prefix && skillName.startsWith(prefix) ? skillName.slice(prefix.length) : skillName;
  });

  // Project the source Codex manifest from the canonical definition before staging the complete
  // plugin. Host manifests are generated projections, never independent metadata owners.
  write(join(sourcePluginRoot, ".codex-plugin", "plugin.json"), renderCodexPluginManifest(pluginDefinition));
  write(join(sourcePluginRoot, ".claude-plugin", "plugin.json"), renderClaudePluginManifest(pluginDefinition));
  // Synchronize source-owned assets in place. Removing the complete generated tree first creates a
  // real missing-assets window when pack, smoke and another agent/session run concurrently.
  // Remove only obsolete package-owned Copilot repository projections. This cleanup never
  // targets a consumer repository and therefore cannot delete existing user-owned files.
  for (const obsoletePath of [
    join(generatedRoot, "AGENTS.md"),
    join(generatedRoot, ".github", "copilot-instructions.md"),
    join(generatedRoot, ".github", "instructions", "agdf-governance.instructions.md"),
    join(generatedRoot, ".github", "skills"),
  ]) rmSync(obsoletePath, { recursive: true, force: true });

  syncOpenCodeRuntimeContract();
  syncDirectory(sourceControlRoot, generatedControlRoot);
  syncPluginDirectory(sourcePluginRoot, generatedCodexPluginRoot);
  writeCopilotPluginFiles();
  writeCodexMarketplace();
  writeOpenCodeConfig();
  writeOpenCodeInstructions();
  for (const skillSlug of skillSlugs) {
    syncCopilotPluginSkill(skillSlug);
    writeOpenCodeSkill(skillSlug);
  }
  rmSync(generatedOpenCodeAgentsRoot, { recursive: true, force: true });
  writeOpenCodeReadme(skillSlugs);
  syncPluginRuntime({ outputRoot: join(generatedCodexPluginRoot, "runtime") });
  buildPublicPluginCandidate({
    repoRoot,
    outputRoot: join(packageRoot, "generated", "submissions", "openai", "agdf"),
  });
}

main();
