import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const repoRoot = resolve(packageRoot, "..");
const sourceAgentsPath = join(repoRoot, "plugin", "meta", "agdf-copilot-agents.md");
const sourceSkillsRoot = join(repoRoot, "plugin", "skills");
const sourceControlRoot = join(repoRoot, "plugin", "control");
const sourcePluginRoot = join(repoRoot, "plugin");
const sourceRuntimeContractPath = join(repoRoot, "plugin", "meta", "agdf-runtime-contract.md");
const generatedRoot = join(packageRoot, "generated");
const generatedSkillsRoot = join(generatedRoot, ".github", "skills");
const generatedControlRoot = join(generatedRoot, ".agdf", "control");
const generatedCodexPluginRoot = join(generatedRoot, "plugins", "agdf");

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

function getSkillDirectories() {
  return readdirSync(sourceSkillsRoot)
    .filter((entry) => statSync(join(sourceSkillsRoot, entry)).isDirectory())
    .sort();
}

function syncTopLevelAssets() {
  write(join(generatedRoot, "AGENTS.md"), read(sourceAgentsPath));
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
    "- Before non-trivial implementation or formal delivery work, determine whether the request is a Quick Task or Structured Delivery.",
    "- If approval, evidence, ownership or the next allowed action is unclear, run the AGDF gate-check workflow before creating later artefacts or code.",
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
    "- If changing AGDF bootstrap behaviour, update the generated files, smoke test and affected setup documentation together.",
    "",
  ];

  write(join(generatedRoot, ".github", "instructions", "agdf-governance.instructions.md"), lines.join("\n"));
}

function syncRuntimeContract() {
  write(join(generatedSkillsRoot, "agdf-runtime-contract.md"), read(sourceRuntimeContractPath));
}

function syncSkill(skillName) {
  const sourcePath = join(sourceSkillsRoot, skillName, "SKILL.md");
  const normalized = read(sourcePath).replaceAll("../../meta/agdf-runtime-contract.md", "../agdf-runtime-contract.md");
  write(join(generatedSkillsRoot, skillName, "SKILL.md"), normalized);
}

function writeSkillsReadme(skillNames) {
  const lines = [
    "# AGDF repository skills",
    "",
    "These repository skills were generated from the AGDF source repository and are intended to be checked into this repository.",
    "",
    "## Skills",
    "",
    ...skillNames.map((skill) => `- \`${skill}\``),
    "",
    "## Runtime contract",
    "",
    "Shared output and gate rules for this checkout live in `agdf-runtime-contract.md`.",
    "",
  ];

  write(join(generatedSkillsRoot, "README.md"), lines.join("\n"));
}

function writeCodexMarketplace() {
  const marketplace = {
    name: "agdf-repo",
    interface: {
      displayName: "This repository",
    },
    plugins: [
      {
        name: "agdf",
        source: {
          source: "local",
          path: "./plugins/agdf",
        },
        policy: {
          installation: "AVAILABLE",
          authentication: "ON_INSTALL",
        },
        category: "Productivity",
      },
    ],
  };

  write(join(generatedRoot, ".agents", "plugins", "marketplace.json"), `${JSON.stringify(marketplace, null, 2)}\n`);
}

function main() {
  const skillNames = getSkillDirectories();

  rmSync(generatedRoot, { recursive: true, force: true });
  mkdirSync(generatedSkillsRoot, { recursive: true });

  syncTopLevelAssets();
  writeCopilotInstructions();
  writeCopilotGovernanceInstructions();
  syncRuntimeContract();
  syncDirectory(sourceControlRoot, generatedControlRoot);
  syncPluginDirectory(sourcePluginRoot, generatedCodexPluginRoot);
  writeCodexMarketplace();
  for (const skillName of skillNames) {
    syncSkill(skillName);
  }
  writeSkillsReadme(skillNames);
}

main();
