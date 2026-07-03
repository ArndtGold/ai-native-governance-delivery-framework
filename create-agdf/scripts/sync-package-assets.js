import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const repoRoot = resolve(packageRoot, "..");
const sourceAgentsPath = join(repoRoot, "AGENTS.md");
const sourceSkillsRoot = join(repoRoot, "plugin", "skills");
const sourceRuntimeContractPath = join(repoRoot, "plugin", "meta", "agdf-runtime-contract.md");
const generatedRoot = join(packageRoot, "generated");
const generatedSkillsRoot = join(generatedRoot, ".github", "skills");

function read(path) {
  return readFileSync(path, "utf8");
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
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

function main() {
  const skillNames = getSkillDirectories();

  rmSync(generatedRoot, { recursive: true, force: true });
  mkdirSync(generatedSkillsRoot, { recursive: true });

  syncTopLevelAssets();
  syncRuntimeContract();
  for (const skillName of skillNames) {
    syncSkill(skillName);
  }
  writeSkillsReadme(skillNames);
}

main();
