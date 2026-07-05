import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const pluginRoot = join(repoRoot, "plugin");
const marketplacePath = join(repoRoot, ".claude-plugin", "marketplace.json");
const codexPluginPath = join(pluginRoot, ".codex-plugin", "plugin.json");
const runtimeContractPath = join(pluginRoot, "meta", "agdf-runtime-contract.md");
const copilotAgentsPath = join(pluginRoot, "meta", "agdf-copilot-agents.md");
const hooksConfigPath = join(pluginRoot, "hooks", "hooks.json");
const sessionStartHookPath = join(pluginRoot, "hooks", "session-start.sh");
const controlRoot = join(pluginRoot, "control");
const skillRoot = join(pluginRoot, "skills");

const expectedSkills = [
  "agdf-brownfield-analysis",
  "agdf-clean-implementation-review",
  "agdf-code-review",
  "agdf-delivery-closeout",
  "agdf-gate-check",
  "agdf-qa-gate",
  "agdf-release-or",
  "agdf-task-plan-review",
];

const expectedControlFiles = [
  "README.md",
  "templates/AGDF_RUN.md",
  "templates/MASTER_BACKLOG.md",
  "templates/SOT_REGISTRY.md",
  "templates/CONTEXT_GRAPH.md",
  "templates/AGENT_QUALITY_CONTRACTS.json",
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

function readJson(path, label) {
  try {
    return JSON.parse(read(path));
  } catch (error) {
    failures.push(`${label} must be readable JSON`);
    return null;
  }
}

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function stripAllowedGerman(content) {
  let next = content;
  for (const fragment of allowedGermanFragments) {
    next = next.split(fragment).join("");
  }
  return next;
}

function assertFile(path, label) {
  if (!isFile(path)) {
    failures.push(`${label} missing`);
  }
}

assertFile(runtimeContractPath, "runtime contract");
assertFile(copilotAgentsPath, "Copilot AGENTS source");
assertFile(marketplacePath, "plugin marketplace");
assertFile(codexPluginPath, "Codex plugin manifest");
assertFile(hooksConfigPath, "Codex plugin default hooks config");
assertFile(sessionStartHookPath, "AGDF SessionStart hook");
assertFile(join(controlRoot, "README.md"), "AGDF control scaffold README");

const codexPlugin = isFile(codexPluginPath) ? readJson(codexPluginPath, "Codex plugin manifest") : null;
if (codexPlugin) {
  if (codexPlugin.name !== "agdf") failures.push("Codex plugin manifest name must be agdf");
  if (codexPlugin.skills !== "./skills/") failures.push("Codex plugin manifest must point skills to ./skills/");
  if (codexPlugin.interface?.displayName !== "AI Governance & Delivery Framework") failures.push("Codex plugin display name must be speaking and not only the AGDF acronym");
  if (!codexPlugin.interface?.shortDescription?.includes("Codex-first")) failures.push("Codex plugin short description must state Codex-first positioning");
  if (Object.hasOwn(codexPlugin, "hooks")) failures.push("Codex plugin manifest should use default hooks/hooks.json instead of duplicating hooks");
}

const hooksConfig = isFile(hooksConfigPath) ? readJson(hooksConfigPath, "Codex plugin hooks config") : null;
if (hooksConfig) {
  const sessionStartGroups = hooksConfig.hooks?.SessionStart;
  if (!Array.isArray(sessionStartGroups) || sessionStartGroups.length === 0) failures.push("Codex plugin hooks config must define SessionStart hooks");
  const sessionStartCommands = sessionStartGroups?.flatMap((group) => group?.hooks ?? []) ?? [];
  if (!sessionStartCommands.some((hook) => hook?.type === "command" && String(hook?.command ?? "").includes("session-start.sh"))) {
    failures.push("Codex plugin SessionStart hooks must load session-start.sh");
  }
}

const marketplace = isFile(marketplacePath) ? readJson(marketplacePath, "plugin marketplace") : null;
const agdfMarketplaceEntry = marketplace?.plugins?.find((plugin) => plugin?.name === "agdf");
if (!agdfMarketplaceEntry) {
  failures.push("plugin marketplace must expose agdf");
} else {
  if (agdfMarketplaceEntry.source !== "./plugin/") failures.push("plugin marketplace agdf source must point to ./plugin/");
  if (agdfMarketplaceEntry.policy?.installation !== "AVAILABLE") failures.push("plugin marketplace agdf install policy must be AVAILABLE");
  if (agdfMarketplaceEntry.policy?.authentication !== "ON_INSTALL") failures.push("plugin marketplace agdf auth policy must be ON_INSTALL");
  if (agdfMarketplaceEntry.category !== "Productivity") failures.push("plugin marketplace agdf category must be Productivity");
}

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
  if (!isFile(skillPath) || !isFile(helpPath)) continue;

  const skillMd = read(skillPath);
  const helpMd = read(helpPath);
  const frontmatter = skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---/);
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
  ["plugin/meta/agdf-copilot-agents.md", read(copilotAgentsPath)],
  ["plugin/meta/agdf-runtime-contract.md", read(runtimeContractPath)],
]) {
  const normalized = stripAllowedGerman(content);
  for (const pattern of germanRuntimePatterns) {
    if (pattern.test(normalized)) failures.push(`${pathLabel} contains German runtime wording matching ${pattern}`);
  }
}

for (const relativePath of expectedControlFiles) {
  assertFile(join(controlRoot, relativePath), `plugin/control/${relativePath}`);
}

const runTemplatePath = join(controlRoot, "templates", "AGDF_RUN.md");
const contextGraphTemplatePath = join(controlRoot, "templates", "CONTEXT_GRAPH.md");
const sotRegistryTemplatePath = join(controlRoot, "templates", "SOT_REGISTRY.md");
const qualityContractsPath = join(controlRoot, "templates", "AGENT_QUALITY_CONTRACTS.json");

if (isFile(runTemplatePath)) {
  const runTemplate = read(runTemplatePath);
  for (const required of ["current_gate", "next allowed action", "Missing Evidence", "context_graph_impact", "quality_outlook"]) {
    if (!runTemplate.includes(required)) failures.push(`AGDF_RUN.md missing control field: ${required}`);
  }
}

if (isFile(contextGraphTemplatePath)) {
  const contextGraphTemplate = read(contextGraphTemplatePath);
  for (const required of ["Admission Rules", "exit criterion", "Relationship Language", "evidenced_by"]) {
    if (!contextGraphTemplate.includes(required)) failures.push(`CONTEXT_GRAPH.md missing control concept: ${required}`);
  }
}

if (isFile(sotRegistryTemplatePath)) {
  const sotRegistryTemplate = read(sotRegistryTemplatePath);
  if (!sotRegistryTemplate.includes("Each domain should have one primary owner")) {
    failures.push("SOT_REGISTRY.md must state one primary owner per domain");
  }
}

const qualityContracts = isFile(qualityContractsPath) ? readJson(qualityContractsPath, "AGDF control quality contracts") : null;
if (qualityContracts) {
  const contracts = Array.isArray(qualityContracts.contracts) ? qualityContracts.contracts : [];
  const requiredCodes = ["AGDF_GATE_BYPASS", "AGDF_QA_WITHOUT_TASK_PLAN_REVIEW", "AGDF_PARALLEL_SOT"];
  for (const code of requiredCodes) {
    if (!contracts.some((contract) => contract?.code === code)) {
      failures.push(`AGENT_QUALITY_CONTRACTS.json missing ${code}`);
    }
  }
  for (const contract of contracts) {
    if (!["block", "revise", "warn"].includes(contract?.impact)) {
      failures.push(`AGENT_QUALITY_CONTRACTS.json contract ${contract?.code ?? "<unknown>"} has invalid impact`);
    }
    if (!Array.isArray(contract?.required_evidence) || contract.required_evidence.length === 0) {
      failures.push(`AGENT_QUALITY_CONTRACTS.json contract ${contract?.code ?? "<unknown>"} missing required evidence`);
    }
  }
}

if (failures.length > 0) {
  console.error("[agdf-runtime-integrity] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`[agdf-runtime-integrity] ok (${expectedSkills.length} skills and ${expectedControlFiles.length} control files checked)`);
