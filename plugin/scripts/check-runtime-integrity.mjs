import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const repoRoot = new URL("../..", import.meta.url).pathname;
const pluginRoot = join(repoRoot, "plugin");
const runtimeContractPath = join(pluginRoot, "meta", "agdf-runtime-contract.md");
const skillRoot = join(pluginRoot, "skills");

const expectedSkills = [
  "agdf-brownfield-analysis",
  "agdf-clean-implementation-review",
  "agdf-delivery-closeout",
  "agdf-gate-check",
  "agdf-qa-gate",
  "agdf-release-or",
  "agdf-task-plan-review",
];

const allowedGermanFragments = [
  "Freigabe:",
  "freigabefähig",
];

const germanRuntimePatterns = [
  /\bNutze\b/i,
  /\bVerwende\b/i,
  /\bZweck\b/i,
  /\bBeschreibung\b/i,
  /\bArbeitsablauf\b/i,
  /\bNaechster\b/i,
  /\bNächster\b/i,
  /\bQualitaetsausblick\b/i,
  /\bQualitätsausblick\b/i,
  /\bfreigegeben\b/i,
  /\bzulaessig\b/i,
  /\bzulässig\b/i,
  /\bPrueft\b/i,
  /\bPrüft\b/i,
  /\bErzeugt\b/i,
  /\bBestimmt\b/i,
  /\bRekonstruiert\b/i,
  /\bLiefert\b/i,
];

const failures = [];

function read(path) {
  return readFileSync(path, "utf8");
}

function stripAllowedGerman(content) {
  let next = content;
  for (const fragment of allowedGermanFragments) {
    next = next.split(fragment).join("");
  }
  return next;
}

function assertFile(path, label) {
  try {
    if (!statSync(path).isFile()) failures.push(`${label} missing`);
  } catch {
    failures.push(`${label} missing`);
  }
}

assertFile(runtimeContractPath, "runtime contract");

const actualSkills = readdirSync(skillRoot)
  .filter((entry) => statSync(join(skillRoot, entry)).isDirectory())
  .sort();

if (JSON.stringify(actualSkills) !== JSON.stringify(expectedSkills)) {
  failures.push(`skill set mismatch: expected ${expectedSkills.join(", ")}, got ${actualSkills.join(", ")}`);
}

for (const skill of expectedSkills) {
  const skillPath = join(skillRoot, skill, "SKILL.md");
  const helpPath = join(skillRoot, skill, "help.md");
  assertFile(skillPath, `${skill}/SKILL.md`);
  assertFile(helpPath, `${skill}/help.md`);
  if (!statSync(skillPath).isFile() || !statSync(helpPath).isFile()) continue;

  const skillMd = read(skillPath);
  const helpMd = read(helpPath);
  const frontmatter = skillMd.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) {
    failures.push(`${skill}/SKILL.md missing YAML frontmatter`);
  } else {
    if (!frontmatter[1].includes(`name: ${skill}`)) failures.push(`${skill}/SKILL.md frontmatter name mismatch`);
    if (!/description:\s*Use this skill/i.test(frontmatter[1])) failures.push(`${skill}/SKILL.md description should be English and start with "Use this skill"`);
  }
  if (!skillMd.includes("../../meta/agdf-runtime-contract.md")) {
    failures.push(`${skill}/SKILL.md missing runtime contract reference`);
  }

  for (const [pathLabel, content] of [
    [`${skill}/SKILL.md`, skillMd],
    [`${skill}/help.md`, helpMd],
  ]) {
    const normalized = stripAllowedGerman(content);
    for (const pattern of germanRuntimePatterns) {
      if (pattern.test(normalized)) failures.push(`${pathLabel} contains German runtime wording matching ${pattern}`);
    }
  }
}

for (const [pathLabel, content] of [
  ["AGENTS.md", read(join(repoRoot, "AGENTS.md"))],
  ["plugin/meta/agdf-runtime-contract.md", read(runtimeContractPath)],
]) {
  const normalized = stripAllowedGerman(content);
  for (const pattern of germanRuntimePatterns) {
    if (pattern.test(normalized)) failures.push(`${pathLabel} contains German runtime wording matching ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error("[agdf-runtime-integrity] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`[agdf-runtime-integrity] ok (${expectedSkills.length} skills checked)`);
