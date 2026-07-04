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
    if (entry === ".claude-plugin" || entry === "hooks" || entry === "scripts") continue;

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
    name: "agdf-project",
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
