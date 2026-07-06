import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const repoRoot = resolve(packageRoot, "..");
const sourceAgentsPath = join(repoRoot, "plugin", "meta", "agdf-agent-router.md");
const sourceSkillsRoot = join(repoRoot, "plugin", "skills");
const sourceControlRoot = join(repoRoot, "plugin", "control");
const sourcePluginRoot = join(repoRoot, "plugin");
const sourceRuntimeContractPath = join(repoRoot, "plugin", "meta", "agdf-runtime-contract.md");
const pluginDefinitionPath = join(repoRoot, "plugin", "meta", "agdf-plugin.definition.json");
const generatedRoot = join(packageRoot, "generated");
const generatedSkillsRoot = join(generatedRoot, ".github", "skills");
const generatedControlRoot = join(generatedRoot, ".agdf", "control");
const generatedCodexPluginRoot = join(generatedRoot, "plugins", "agdf");
const pluginDefinition = JSON.parse(read(pluginDefinitionPath));

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
  for (const entry of readdirSync(sourceRoot)) {
    if (entry === ".claude-plugin" || entry === "scripts") continue;

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

function toCopilotAgentRouter(content) {
  const copilotSurfaceConvention = [
    "## Surface Convention",
    "GitHub Copilot repository skills do not have a plugin namespace.",
    "",
    "Therefore generated Copilot skill names use the AGDF prefix:",
    "",
    ...pluginDefinition.skillSet.map((skill) => `- \`${copilotSkillName(skill.slug)}\``),
    "",
    "Do not remove that prefix in Copilot-facing repository skills.",
    "Codex and Claude Code plugin surfaces use the same canonical router with unprefixed skill names because their plugin namespace already carries `agdf`.",
    "",
  ].join("\n");

  return toCopilotSkillContent(content)
    .replace("# AGDF Agent Router", "# AGENTS.md")
    .replace(
      "You are operating inside the AGDF plugin namespace.",
      "You are an autonomous agent operating in an AGDF-governed delivery system.",
    )
    .replace(/## Surface Convention[\s\S]*?(?=## Mode Selection)/, copilotSurfaceConvention);
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

function syncTopLevelAssets() {
  write(join(generatedRoot, "AGENTS.md"), toCopilotAgentRouter(read(sourceAgentsPath)));
}

function writeCopilotInstructions() {
  const lines = [
    "# AGDF Copilot instructions",
    "",
    "AGDF is active in this repository.",
    "",
    "- Treat `AGENTS.md` as the primary repository instruction source.",
    "- Use `.github/skills/` for AGDF task workflows instead of inventing parallel process rules.",
    "- Use `.agdf/control/` for durable run state, backlog pointers, source-of-truth ownership, Context Graph knowledge and quality contracts.",
    "- Apply AGDF natively from `AGENTS.md`, repository skills and live `.agdf/control/` state before reaching for helper commands.",
    "- Before non-trivial implementation or formal delivery work, determine whether the request is a Quick Task or Structured Delivery.",
    "- If approval, evidence, ownership or the next allowed action is unclear, run the AGDF gate-check workflow before creating later artefacts or code.",
    "- Use machine-readable checks such as `doctor --json`, `gate-check --json` or `delivery-map --json` as validators, not as the primary workflow.",
    "- Do not infer gate approval from generic consent such as \"ok\", \"go ahead\", \"do it\", \"continue\", \"leg los\" or \"approved\".",
    "- Do not treat chat history as the source of truth for gate state, approvals, evidence or delivery status.",
    "",
  ];

  write(join(generatedRoot, ".github", "copilot-instructions.md"), lines.join("\n"));
}

function writeCopilotGovernanceInstructions() {
  const lines = [
    "---",
    'applyTo: "AGENTS.md,AGENTS.agdf.md,.agdf/**,.github/skills/**,.github/copilot-instructions.md,.github/instructions/**"',
    "---",
    "",
    "# AGDF governance artefacts",
    "",
    "These files are control artefacts, not general documentation.",
    "",
    "- Keep AGDF rules sourced from `AGENTS.md`, `.github/skills/` and `.github/skills/agdf-runtime-contract.md`.",
    "- Do not duplicate the full gate model, Quality Contract table or Context Graph relationship language in new files.",
    "- Keep generated AGDF files small, reviewable and linked to the owning source of truth.",
    "- Preserve the rule that missing approval, missing evidence or unclear ownership blocks later delivery steps.",
    "- Preserve the rule that gates cannot be skipped by generic consent, urgency or a request to start.",
    "- If changing AGDF bootstrap behaviour, update the generated files, smoke test and affected setup documentation together.",
    "",
  ];

  write(join(generatedRoot, ".github", "instructions", "agdf-governance.instructions.md"), lines.join("\n"));
}

function syncRuntimeContract() {
  write(join(generatedSkillsRoot, pluginDefinition.copilot.runtimeContractFileName), toCopilotSkillContent(read(sourceRuntimeContractPath)));
}

function syncSkill(skillSlug) {
  const sourceName = sourceSkillName(skillSlug);
  const targetName = copilotSkillName(skillSlug);
  const sourcePath = join(sourceSkillsRoot, sourceName, "SKILL.md");
  const normalized = toCopilotSkillContent(read(sourcePath).replaceAll("../../meta/agdf-runtime-contract.md", `../${pluginDefinition.copilot.runtimeContractFileName}`));
  write(join(generatedSkillsRoot, targetName, "SKILL.md"), normalized);
}

function writeSkillsReadme(skillSlugs) {
  const lines = [
    "# AGDF repository skills",
    "",
    "These repository skills were generated from the AGDF source repository and are intended to be checked into this repository.",
    "",
    "## Skills",
    "",
    ...skillSlugs.map((skill) => `- \`${copilotSkillName(skill)}\``),
    "",
    "## Runtime contract",
    "",
    "Shared output and gate rules for this checkout live in `agdf-runtime-contract.md`.",
    "",
  ];

  write(join(generatedSkillsRoot, "README.md"), lines.join("\n"));
}

function writeCodexMarketplace() {
  const repositoryMarketplace = pluginDefinition.marketplaces.repository;
  const marketplace = {
    name: repositoryMarketplace.name,
    interface: {
      displayName: repositoryMarketplace.displayName,
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

  rmSync(generatedRoot, { recursive: true, force: true });
  mkdirSync(generatedSkillsRoot, { recursive: true });

  syncTopLevelAssets();
  writeCopilotInstructions();
  writeCopilotGovernanceInstructions();
  syncRuntimeContract();
  syncDirectory(sourceControlRoot, generatedControlRoot);
  syncPluginDirectory(sourcePluginRoot, generatedCodexPluginRoot);
  writeCodexMarketplace();
  for (const skillSlug of skillSlugs) {
    syncSkill(skillSlug);
  }
  writeSkillsReadme(skillSlugs);
}

main();
