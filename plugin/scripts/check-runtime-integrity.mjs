import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const pluginRoot = join(repoRoot, "plugin");
const marketplacePath = join(repoRoot, ".claude-plugin", "marketplace.json");
const codexPluginPath = join(pluginRoot, ".codex-plugin", "plugin.json");
const claudePluginPath = join(pluginRoot, ".claude-plugin", "plugin.json");
const pluginDefinitionPath = join(pluginRoot, "meta", "agdf-plugin.definition.json");
const agentRouterPath = join(pluginRoot, "meta", "agdf-agent-router.md");
const runtimeContractPath = join(pluginRoot, "meta", "agdf-runtime-contract.md");
const hooksConfigPath = join(pluginRoot, "hooks", "hooks.json");
const sessionStartHookPath = join(pluginRoot, "hooks", "session-start.sh");
const codexComposerIconPath = join(pluginRoot, "assets", "agdf-icon.svg");
const codexLogoPath = join(pluginRoot, "assets", "agdf-logo.svg");
const agdfPackagePath = join(repoRoot, "agdf", "package.json");
const createAgdfPackagePath = join(repoRoot, "create-agdf", "package.json");
const pagesPackagePath = join(repoRoot, "pages", "package.json");
const pagesSiteDataPath = join(repoRoot, "pages", "src", "data", "site.ts");
const pagesSkillsPath = join(repoRoot, "pages", "src", "data", "skills.ts");
const pagesIndexPath = join(repoRoot, "pages", "src", "pages", "index.astro");
const syncPackageAssetsPath = join(repoRoot, "create-agdf", "scripts", "sync-package-assets.js");
const activeRunStatePath = join(repoRoot, ".agdf", "control", "AGDF_RUN.md");
const rootLicensePath = join(repoRoot, "LICENSE");
const pluginLicensePath = join(pluginRoot, "LICENSE");
const controlRoot = join(pluginRoot, "control");
const skillRoot = join(pluginRoot, "skills");

let expectedSkills = [];

const expectedControlFiles = [
  "README.md",
  "templates/RUN_STATE.md",
  "templates/AGDF_RUN.md",
  "templates/MASTER_BACKLOG.md",
  "templates/SOT_REGISTRY.md",
  "templates/CONTEXT_GRAPH.md",
  "templates/AGENT_QUALITY_CONTRACTS.json",
  "templates/artefacts/UR.md",
  "templates/artefacts/BROWNFIELD_REVIEW.md",
  "templates/artefacts/PRD.md",
  "templates/artefacts/SD.md",
  "templates/artefacts/TP.md",
  "templates/artefacts/QA_REPORT.md",
  "templates/artefacts/OR.md",
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

function sectionAfterHeading(content, heading) {
  return content.match(new RegExp(`## ${heading}\\r?\\n([\\s\\S]*?)(?=\\r?\\n## )`))?.[1] ?? "";
}

function fieldValue(content, field) {
  return content.match(new RegExp(`^- ${field}:\\s*(.*)$`, "m"))?.[1]?.trim() ?? "";
}

function noneLike(value) {
  const normalized = value.replaceAll("`", "").trim().toLowerCase();
  return normalized === "" || normalized === "none" || normalized === "none yet" || normalized === "n/a";
}

function hasPendingContextGraphAction(value) {
  const normalized = value.replaceAll("`", "").toLowerCase();
  return /\b(link|update|create|resolve_drift|promote|reassess)\b/.test(normalized) || normalized.includes("after uat");
}

function assertContextGraphReconciliation(label, content, { allowTemplatePlaceholders = false } = {}) {
  const impact = fieldValue(content, "context_graph_impact");
  const refs = fieldValue(content, "context_graph_refs");
  const reconciliation = fieldValue(content, "context_graph_reconciliation").replaceAll("`", "").trim();
  const requiredAction = fieldValue(content, "context_graph_required_action");

  if (!content.includes("context_graph_reconciliation")) {
    failures.push(`${label} missing context_graph_reconciliation`);
    return;
  }

  if (allowTemplatePlaceholders && reconciliation.includes("|")) return;

  if (hasPendingContextGraphAction(requiredAction) && noneLike(refs) && reconciliation !== "open_gap") {
    failures.push(`${label} has pending Context Graph action without concrete refs or open_gap reconciliation`);
  }

  if (reconciliation === "resolved" && noneLike(refs) && impact.replaceAll("`", "").trim() !== "none") {
    failures.push(`${label} marks Context Graph reconciliation resolved without concrete refs`);
  }
}

function assertFile(path, label) {
  if (!isFile(path)) {
    failures.push(`${label} missing`);
  }
}

function skillNameForSurface(skill, surface) {
  const prefix = pluginDefinition?.[surface]?.skillPrefix ?? "";
  return `${prefix}${skill.slug}`;
}

function routingRowForSurface(skill, surface) {
  return `| \`${skillNameForSurface(skill, surface)}\` | ${skill.useFor} | ${skill.boundary} |`;
}

function assertRouterMatchesDefinition(pathLabel, content, surface) {
  if (!pluginDefinition) return;

  for (const skill of pluginDefinition.skillSet ?? []) {
    const expectedRow = routingRowForSurface(skill, surface);
    if (!content.includes(expectedRow)) {
      failures.push(`${pathLabel} missing canonical ${surface} routing row: ${expectedRow}`);
    }
  }
}

assertFile(runtimeContractPath, "runtime contract");
assertFile(pluginDefinitionPath, "canonical AGDF plugin definition");
assertFile(agentRouterPath, "canonical AGDF agent router");
assertFile(marketplacePath, "plugin marketplace");
assertFile(codexPluginPath, "Codex plugin manifest");
assertFile(claudePluginPath, "Claude plugin manifest");
assertFile(codexComposerIconPath, "Codex plugin composer icon");
assertFile(codexLogoPath, "Codex plugin logo");
assertFile(agdfPackagePath, "agdf CLI package manifest");
assertFile(hooksConfigPath, "Codex plugin default hooks config");
assertFile(sessionStartHookPath, "AGDF SessionStart hook");
assertFile(createAgdfPackagePath, "create-agdf package manifest");
assertFile(pagesPackagePath, "Pages package manifest");
assertFile(pagesSiteDataPath, "Pages site data");
assertFile(pagesSkillsPath, "Pages skill data");
assertFile(pagesIndexPath, "Pages index");
assertFile(syncPackageAssetsPath, "create-agdf package asset sync");
assertFile(join(controlRoot, "README.md"), "AGDF control scaffold README");
assertFile(rootLicensePath, "root LICENSE");
assertFile(pluginLicensePath, "plugin LICENSE");

if (isFile(rootLicensePath) && isFile(pluginLicensePath) && read(rootLicensePath) !== read(pluginLicensePath)) {
  failures.push("plugin/LICENSE must be byte-identical to the root LICENSE");
}

const pluginDefinition = isFile(pluginDefinitionPath) ? readJson(pluginDefinitionPath, "canonical AGDF plugin definition") : null;
const codexPlugin = isFile(codexPluginPath) ? readJson(codexPluginPath, "Codex plugin manifest") : null;
const claudePlugin = isFile(claudePluginPath) ? readJson(claudePluginPath, "Claude plugin manifest") : null;
const agdfPackage = isFile(agdfPackagePath) ? readJson(agdfPackagePath, "agdf CLI package manifest") : null;
const createAgdfPackage = isFile(createAgdfPackagePath) ? readJson(createAgdfPackagePath, "create-agdf package manifest") : null;
const pagesPackage = isFile(pagesPackagePath) ? readJson(pagesPackagePath, "Pages package manifest") : null;

if (pluginDefinition) {
  if (pluginDefinition.id !== "agdf") failures.push("canonical AGDF plugin definition id must be agdf");
  if (pluginDefinition.displayName !== "AI Governance & Delivery Framework") failures.push("canonical AGDF plugin definition must use the speaking display name");
  if (!pluginDefinition.shortDescription?.includes("Codex-first")) failures.push("canonical AGDF plugin definition short description must state Codex-first positioning");
  if (pluginDefinition.codex?.skillPrefix !== "") failures.push("canonical AGDF plugin definition Codex skill prefix must be empty to avoid agdf:agdf-* plugin labels");
  if (pluginDefinition.claude?.skillPrefix !== "") failures.push("canonical AGDF plugin definition Claude Code skill prefix must be empty to avoid agdf:agdf-* plugin labels");
  if (pluginDefinition.codex?.agentRouter !== "meta/agdf-agent-router.md") failures.push("canonical AGDF plugin definition Codex agent router must point to meta/agdf-agent-router.md");
  if (pluginDefinition.codex?.composerIcon !== "./assets/agdf-icon.svg") failures.push("canonical AGDF plugin definition Codex composer icon must point to ./assets/agdf-icon.svg");
  if (pluginDefinition.codex?.logo !== "./assets/agdf-logo.svg") failures.push("canonical AGDF plugin definition Codex logo must point to ./assets/agdf-logo.svg");
  if (pluginDefinition.claude?.agentRouter !== "meta/agdf-agent-router.md") failures.push("canonical AGDF plugin definition Claude agent router must point to meta/agdf-agent-router.md");
  if (pluginDefinition.copilot?.skillPrefix !== "agdf-") failures.push("canonical AGDF plugin definition Copilot skill prefix must be agdf-");
  if (pluginDefinition.opencode?.skillPrefix !== "agdf-") failures.push("canonical AGDF plugin definition OpenCode skill prefix must be agdf-");
  if (pluginDefinition.opencode?.runtimeContractFileName !== "agdf-runtime-contract.md") failures.push("canonical AGDF plugin definition OpenCode runtime contract filename must be agdf-runtime-contract.md");
  if (pluginDefinition.opencode?.instructionsFileName !== "AGDF.md") failures.push("canonical AGDF plugin definition OpenCode instructions filename must be AGDF.md");
  if (pluginDefinition.opencode?.permissions?.edit !== "ask" || pluginDefinition.opencode?.permissions?.bash !== "ask") failures.push("canonical AGDF plugin definition OpenCode permissions must ask before edit and bash");
  if (!Array.isArray(pluginDefinition.skillSet) || pluginDefinition.skillSet.length === 0) {
    failures.push("canonical AGDF plugin definition must declare the workflow skill set");
  } else {
    for (const skill of pluginDefinition.skillSet) {
      if (!skill?.slug) failures.push("canonical AGDF plugin definition skill set entries must declare slug");
      if (!skill?.useFor) failures.push(`canonical AGDF plugin definition skill ${skill?.slug ?? "<unknown>"} must declare useFor`);
      if (!skill?.boundary) failures.push(`canonical AGDF plugin definition skill ${skill?.slug ?? "<unknown>"} must declare boundary`);
    }
  }
  if (pluginDefinition.marketplaces?.repository?.name !== "agdf-repo") failures.push("canonical AGDF plugin definition repository marketplace name must be agdf-repo");
  if (pluginDefinition.marketplaces?.repository?.displayName !== "This repository") failures.push("canonical AGDF plugin definition repository marketplace display name must be This repository");
  expectedSkills = (pluginDefinition.skillSet ?? [])
    .map((skill) => `${pluginDefinition.codex?.skillPrefix ?? ""}${skill?.slug ?? ""}`)
    .sort();
}

if (pluginDefinition && isFile(pagesSkillsPath)) {
  const pageSkillNames = [...read(pagesSkillsPath).matchAll(/\bname:\s*"([^"]+)"/g)]
    .map((match) => match[1])
    .sort();
  const canonicalSkillNames = (pluginDefinition.skillSet ?? []).map((skill) => skill.slug).sort();
  if (JSON.stringify(pageSkillNames) !== JSON.stringify(canonicalSkillNames)) {
    failures.push(`Pages skill data must match canonical skillSet exactly: expected ${canonicalSkillNames.join(", ")}, got ${pageSkillNames.join(", ")}`);
  }
}

if (isFile(pagesIndexPath) && !read(pagesIndexPath).includes("{skills.length} Core Workflow Skills")) {
  failures.push("Pages skill heading must derive its count from skills.length");
}

if (codexPlugin && pluginDefinition) {
  if (codexPlugin.name !== pluginDefinition.id) failures.push("Codex plugin manifest name must match canonical AGDF plugin definition");
  if (codexPlugin.version !== pluginDefinition.version) failures.push("Codex plugin manifest version must match canonical AGDF plugin definition");
  if (codexPlugin.description !== pluginDefinition.description) failures.push("Codex plugin manifest description must match canonical AGDF plugin definition");
  if (codexPlugin.homepage !== pluginDefinition.homepage) failures.push("Codex plugin manifest homepage must match canonical AGDF plugin definition");
  if (codexPlugin.repository !== pluginDefinition.repository) failures.push("Codex plugin manifest repository must match canonical AGDF plugin definition");
  if (codexPlugin.license !== pluginDefinition.license) failures.push("Codex plugin manifest license must match canonical AGDF plugin definition");
  if (JSON.stringify(codexPlugin.keywords) !== JSON.stringify(pluginDefinition.keywords)) failures.push("Codex plugin manifest keywords must match canonical AGDF plugin definition");
  if (codexPlugin.author?.name !== pluginDefinition.author?.name || codexPlugin.author?.url !== pluginDefinition.author?.url) failures.push("Codex plugin manifest author must match canonical AGDF plugin definition");
  if (codexPlugin.skills !== pluginDefinition.codex?.skills) failures.push("Codex plugin manifest must point skills to canonical AGDF skills path");
  if (codexPlugin.interface?.displayName !== pluginDefinition.displayName) failures.push("Codex plugin display name must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.shortDescription !== pluginDefinition.shortDescription) failures.push("Codex plugin short description must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.longDescription !== pluginDefinition.longDescription) failures.push("Codex plugin long description must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.developerName !== pluginDefinition.developerName) failures.push("Codex plugin developer name must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.category !== pluginDefinition.category) failures.push("Codex plugin category must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.websiteURL !== pluginDefinition.homepage) failures.push("Codex plugin website URL must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.composerIcon !== pluginDefinition.codex?.composerIcon) failures.push("Codex plugin composer icon must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.logo !== pluginDefinition.codex?.logo) failures.push("Codex plugin logo must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.brandColor !== pluginDefinition.brandColor) failures.push("Codex plugin brand color must match canonical AGDF plugin definition");
  if (JSON.stringify(codexPlugin.interface?.capabilities) !== JSON.stringify(pluginDefinition.codex?.capabilities)) failures.push("Codex plugin capabilities must match canonical AGDF plugin definition");
  if (JSON.stringify(codexPlugin.interface?.defaultPrompt) !== JSON.stringify(pluginDefinition.codex?.defaultPrompt)) failures.push("Codex plugin default prompts must match canonical AGDF plugin definition");
  if (codexPlugin.hooks !== `./${pluginDefinition.codex?.hooks}`) failures.push("Codex plugin manifest hooks must explicitly point to ./hooks/hooks.json");
}

if (claudePlugin && pluginDefinition) {
  if (claudePlugin.name !== pluginDefinition.id) failures.push("Claude plugin manifest name must match canonical AGDF plugin definition");
  if (claudePlugin.version !== pluginDefinition.version) failures.push("Claude plugin manifest version must match canonical AGDF plugin definition");
  if (claudePlugin.description !== pluginDefinition.claudeDescription) failures.push("Claude plugin manifest description must match canonical AGDF plugin definition");
  if (claudePlugin.homepage !== pluginDefinition.homepage) failures.push("Claude plugin manifest homepage must match canonical AGDF plugin definition");
  if (claudePlugin.repository !== pluginDefinition.repository) failures.push("Claude plugin manifest repository must match canonical AGDF plugin definition");
  if (claudePlugin.license !== pluginDefinition.license) failures.push("Claude plugin manifest license must match canonical AGDF plugin definition");
  if (JSON.stringify(claudePlugin.keywords) !== JSON.stringify(pluginDefinition.keywords)) failures.push("Claude plugin manifest keywords must match canonical AGDF plugin definition");
  if (claudePlugin.author?.name !== pluginDefinition.author?.name || claudePlugin.author?.url !== pluginDefinition.author?.url) failures.push("Claude plugin manifest author must match canonical AGDF plugin definition");
}

if (createAgdfPackage && pluginDefinition && createAgdfPackage.version !== pluginDefinition.version) {
  failures.push("create-agdf package version must match canonical AGDF plugin definition");
}

if (agdfPackage && pluginDefinition) {
  if (agdfPackage.name !== "@agdf/cli") failures.push("agdf CLI package name must be @agdf/cli");
  if (agdfPackage.version !== pluginDefinition.version) failures.push("agdf CLI package version must match canonical AGDF plugin definition");
  if (agdfPackage.bin?.agdf !== "./bin/agdf.js") failures.push("agdf CLI package must expose the agdf binary");
  if (agdfPackage.dependencies?.["create-agdf"] !== pluginDefinition.version) failures.push("agdf CLI package must depend on the matching create-agdf version");
}

if (pagesPackage && pluginDefinition && pagesPackage.version !== pluginDefinition.version) {
  failures.push("Pages package version must match canonical AGDF plugin definition");
}

if (pluginDefinition && isFile(pagesSiteDataPath) && !read(pagesSiteDataPath).includes(`version: "${pluginDefinition.version}"`)) {
  failures.push("Pages site data version must match canonical AGDF plugin definition");
}

if (isFile(syncPackageAssetsPath)) {
  const syncPackageAssets = read(syncPackageAssetsPath);
  if (!syncPackageAssets.includes("writeOpenCodeConfig") || !syncPackageAssets.includes("writeOpenCodeSkill")) {
    failures.push("create-agdf package asset sync must generate the OpenCode config and native skills");
  }
  if (!pluginDefinition?.opencode?.npmPackage) {
    failures.push("canonical AGDF plugin definition must declare the OpenCode npm package");
  }
  if (!syncPackageAssets.includes("toOpenCodeInstructionsRouter")) {
    failures.push("OpenCode instructions must be rendered from the canonical AGDF router");
  }
}

const openCodeNpmPluginPath = join(repoRoot, "create-agdf", "opencode-plugin.js");
if (isFile(openCodeNpmPluginPath)) {
  const openCodeNpmPlugin = read(openCodeNpmPluginPath);
  if (!openCodeNpmPlugin.includes("experimental.session.compacting") || !openCodeNpmPlugin.includes("AGDF_CONTROL_DIR")) {
    failures.push("OpenCode npm plugin must preserve AGDF runtime context hooks");
  }
}

const hooksConfig = isFile(hooksConfigPath) ? readJson(hooksConfigPath, "Codex plugin hooks config") : null;
if (hooksConfig) {
  const sessionStartGroups = hooksConfig.hooks?.SessionStart;
  if (!Array.isArray(sessionStartGroups) || sessionStartGroups.length === 0) failures.push("Codex plugin hooks config must define SessionStart hooks");
  const sessionStartCommands = sessionStartGroups?.flatMap((group) => group?.hooks ?? []) ?? [];
  if (!sessionStartCommands.some((hook) => hook?.type === "command" && String(hook?.command ?? "").includes("session-start.sh"))) {
    failures.push("Codex plugin SessionStart hooks must load session-start.sh");
  }
  const sessionStartCommandText = sessionStartCommands.map((hook) => String(hook?.command ?? "")).join("\n");
  if (!sessionStartCommandText.includes("PLUGIN_ROOT")) failures.push("Codex plugin SessionStart hook command must use PLUGIN_ROOT");
  if (sessionStartCommandText.includes("/plugins/cache/*/")) failures.push("Codex plugin SessionStart hook command must not use cache wildcards");
}

if (isFile(sessionStartHookPath)) {
  const sessionStartHook = read(sessionStartHookPath);
  if (!sessionStartHook.includes("agdf-agent-router.md")) failures.push("AGDF SessionStart hook must load the canonical agent router");
  if (!sessionStartHook.includes("agdf-constitution.md")) failures.push("AGDF SessionStart hook must load the AGDF constitution");
  if (!sessionStartHook.includes("agdf-runtime-contract.md")) failures.push("AGDF SessionStart hook must expose the canonical runtime contract source");
  if (!sessionStartHook.includes("Do not print the full router or constitution unless the user asks for them")) {
    failures.push("AGDF SessionStart hook must avoid flooding the chat with full router or constitution text");
  }
  if (!sessionStartHook.includes(".agdf/control/config.json") || !sessionStartHook.includes("artefacts=") || !sessionStartHook.includes("chat=")) {
    failures.push("AGDF SessionStart hook must report the project language config hint compactly");
  }
  if (!sessionStartHook.includes("Language policy: write durable AGDF artefacts in")) {
    failures.push("AGDF SessionStart hook must turn language config into an explicit artefact/chat language instruction");
  }
  if (sessionStartHook.includes('cat "$ROUTER"') || sessionStartHook.includes('cat "$CONSTITUTION"')) {
    failures.push("AGDF SessionStart hook must not print full router or constitution files by default");
  }
}

if (isFile(agentRouterPath)) {
  const agentRouter = read(agentRouterPath);
  assertRouterMatchesDefinition("plugin/meta/agdf-agent-router.md", agentRouter, "codex");
  if (!agentRouter.includes("Default entry rule: a new user intent to build, add, change, extend, refactor or otherwise deliver something starts with `gate-check`")) {
    failures.push("plugin/meta/agdf-agent-router.md must state the gate-check default entry rule for new build/change intents");
  }
  if (!agentRouter.includes("Do not choose `brownfield-analysis` as the first primary skill for a fresh")) {
    failures.push("plugin/meta/agdf-agent-router.md must prevent brownfield-analysis from bypassing gate-check on fresh build/change prompts");
  }
  if (!agentRouter.includes("For Quick Task Mode, close with the Runtime Contract mini-output only")) {
    failures.push("plugin/meta/agdf-agent-router.md must keep Quick Task closeout lighter than relevant-run closeout");
  }
  for (const skill of pluginDefinition?.skillSet ?? []) {
    const copilotName = skillNameForSurface(skill, "copilot");
    if (agentRouter.includes(`\`${copilotName}\``) || agentRouter.includes(`/${copilotName}`)) {
      failures.push(`plugin/meta/agdf-agent-router.md must not use Copilot-prefixed skill name ${copilotName}`);
    }
  }
}

if (isFile(runtimeContractPath)) {
  const runtimeContract = read(runtimeContractPath);
  if (!runtimeContract.includes("Approval of one user gate permits work on the next allowed gate artefact or required internal step only")) {
    failures.push("runtime contract must state that one gate approval only permits the next gate artefact or required internal step");
  }
  if (!runtimeContract.includes("`Approval: UR` permits Brownfield Review after G-00 first, then a Mode/Slice Decision")) {
    failures.push("runtime contract must state that Approval: UR permits Brownfield Review before Mode/Slice Decision");
  }
  if (!runtimeContract.includes("PRD, SD and TP depth is chosen after Brownfield Review through the Mode/Slice Decision")) {
    failures.push("runtime contract must state that gate depth is chosen after Brownfield Review");
  }
  if (!runtimeContract.includes("The Mode/Slice Decision must be visible before any PRD shortcut, Quick Task execution or implementation")) {
    failures.push("runtime contract must require visible Mode/Slice Decision before later work");
  }
  if (!runtimeContract.includes("A Mode/Slice Decision without scope reason and evidence is not recorded")) {
    failures.push("runtime contract must treat unevidenced Mode/Slice Decision as missing");
  }
  if (!runtimeContract.includes("Missing control files or missing current-state fields do not forbid the agent from preparing the current allowed artefact")) {
    failures.push("runtime contract must allow constructive artefact drafting when control state is missing");
  }
  if (!runtimeContract.includes("For a fresh request, the default allowed work is to draft a minimal UR in the response")) {
    failures.push("runtime contract must keep fresh missing-control requests lightweight");
  }
  if (!runtimeContract.includes("Initialize or write `.agdf/control/` only when the user explicitly asks for durable AGDF control state")) {
    failures.push("runtime contract must prevent default full scaffold writes for fresh requests");
  }
  if (!runtimeContract.includes("`config.json` stores project language preferences")) {
    failures.push("runtime contract must define AGDF language preference config");
  }
  if (!runtimeContract.includes("## Gate Transition Model")) {
    failures.push("runtime contract must own the canonical gate transition model");
  }
  if (!runtimeContract.includes("Skills may reference it, but must not carry a second complete copy")) {
    failures.push("runtime contract must forbid duplicated complete gate transition tables");
  }
  if (!runtimeContract.includes("## Quick Task Output")) {
    failures.push("runtime contract must define Quick Task output");
  }
  if (!runtimeContract.includes("Do not add a separate `Quality outlook` line for pure Quick Tasks")) {
    failures.push("runtime contract must prevent Quick Task closeout from requiring Quality outlook");
  }
  if (!runtimeContract.includes("## Chat Output Discipline")) {
    failures.push("runtime contract must define compact chat output discipline");
  }
  if (!runtimeContract.includes("Do not paste full control files, full artefact bodies, full templates or full generated reports into the chat")) {
    failures.push("runtime contract must prevent full artefact bodies from flooding chat");
  }
  if (!runtimeContract.includes("## Relevant Run")) {
    failures.push("runtime contract must define relevant run for OR scope");
  }
  if (!runtimeContract.includes("## Brownfield Modes")) {
    failures.push("runtime contract must define Brownfield modes");
  }
  if (!runtimeContract.includes("requires a durable UR in `.agdf/control/` or a linked authoritative repository SoT")) {
    failures.push("runtime contract must require a durable UR for new product semantics or functional change");
  }
  if (!runtimeContract.includes("UR, PRD, SD, TP and QA report approvals require durable artefacts")) {
    failures.push("runtime contract must require durable artefacts for UR, PRD, SD, TP and QA report approvals");
  }
  if (!runtimeContract.includes("approval and durable artefact presence are separate requirements")) {
    failures.push("runtime contract must separate approval text from durable artefact presence");
  }
  if (!runtimeContract.includes("AGDF is agent-native first and CLI-verifiable by design")) {
    failures.push("runtime contract must state the agent-native and CLI-verifiable operating model");
  }
  if (!runtimeContract.includes("Helper commands are deterministic proof and automation interfaces, not the normal-work ritual")) {
    failures.push("runtime contract must classify helper commands as proof and automation interfaces");
  }
  if (!runtimeContract.includes("`delivery-map --json` is the machine-readable delivery picture")) {
    failures.push("runtime contract must define delivery-map as the machine-readable delivery picture");
  }
  if (!runtimeContract.includes("Missing relationship evidence in the Artefact Chain is at least `revise`")) {
    failures.push("runtime contract must state the delivery-map relationship evidence rule");
  }
  if (!runtimeContract.includes("## Run Status Card")) {
    failures.push("runtime contract must define the Run Status Card");
  }
  if (!runtimeContract.includes("`quality_outlook` is quality direction")) {
    failures.push("runtime contract must distinguish quality_outlook from next_step");
  }
  if (!runtimeContract.includes("do not expose snake_case keys as the visible")) {
    failures.push("runtime contract must keep the human-facing Run Status Card readable");
  }
  if (!runtimeContract.includes("## Source Precedence")) {
    failures.push("runtime contract must define source precedence");
  }
  if (!runtimeContract.includes("A branch name or uncommitted workspace delta is never sufficient scope proof by itself")) {
    failures.push("runtime contract must state branch/workspace evidence limits");
  }
  if (!runtimeContract.includes("## Workstate And Scope Ambiguity")) {
    failures.push("runtime contract must define multi-scope fail-closed behavior");
  }
  if (!runtimeContract.includes("## Knowledge Persistence Decision")) {
    failures.push("runtime contract must define knowledge persistence decisions");
  }
  if (!runtimeContract.includes("## Bug Lightweight Track")) {
    failures.push("runtime contract must define the Bug Lightweight Track");
  }
  if (!runtimeContract.includes("## Domain Guardrail Packs")) {
    failures.push("runtime contract must define domain guardrail packs");
  }
}

const marketplace = isFile(marketplacePath) ? readJson(marketplacePath, "plugin marketplace") : null;
const agdfMarketplaceEntry = marketplace?.plugins?.find((plugin) => plugin?.name === "agdf");
if (!agdfMarketplaceEntry) {
  failures.push("plugin marketplace must expose agdf");
} else {
  if (agdfMarketplaceEntry.source !== "./plugin/") failures.push("plugin marketplace agdf source must point to ./plugin/");
  if (Object.hasOwn(agdfMarketplaceEntry, "policy")) failures.push("Claude plugin marketplace agdf entry must not use unsupported policy field");
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
    const descriptionLine = frontmatter[1].split(/\r?\n/).find((line) => line.startsWith("description:"));
    const descriptionValue = descriptionLine?.slice("description:".length).trim() ?? "";
    const unquotedDescription = descriptionValue.replace(/^(["'])(.*)\1$/, "$2");
    if (!/^Use this skill/i.test(unquotedDescription)) failures.push(`${skill}/SKILL.md description should be English and start with "Use this skill"`);
    if (!/^["']/.test(descriptionValue) && descriptionValue.includes(": ")) {
      failures.push(`${skill}/SKILL.md description contains an unquoted colon-space sequence that Claude Code rejects as YAML`);
    }
  }
  if (!skillMd.includes("../../meta/agdf-runtime-contract.md")) {
    failures.push(`${skill}/SKILL.md missing runtime contract reference`);
  }
  if (skill === "gate-check") {
    if (!skillMd.includes("If `Approval: UR` is present, do not say implementation is the next step.")) {
      failures.push("gate-check must prevent implementation immediately after Approval: UR");
    }
    if (skillMd.includes("## Gate Transitions") || skillMd.includes("## Gate Order") || skillMd.includes("| State | Current gate or step | Allowed | Forbidden | Missing approval |")) {
      failures.push("gate-check must not duplicate the Runtime Contract gate transition table");
    }
    if (!skillMd.includes("The canonical gate order and transition model live only in the Runtime Contract")) {
      failures.push("gate-check must point to the Runtime Contract as gate transition SoT");
    }
    for (const label of ["Status", "Current gate", "Allowed now", "Blocked by", "Missing approval", "Next step", "Quality outlook"]) {
      if (!skillMd.includes(`| ${label} |`)) failures.push(`gate-check must render Run Status Card label: ${label}`);
    }
    if (!skillMd.includes("Next gate after approval") || !skillMd.includes("Allowed after approval")) {
      failures.push("gate-check must render post-approval Run Status Card fields when an approval is missing");
    }
    if (!skillMd.includes("A decision value without scope reason and evidence is still missing")) {
      failures.push("gate-check must require evidenced Mode/Slice Decision before later work");
    }
    if (!skillMd.includes("Missing or incomplete control state must not push setup work back to the user")) {
      failures.push("gate-check must make missing control state constructive for current artefact drafting");
    }
    if (!skillMd.includes("For a fresh request, draft the current minimal artefact in the response")) {
      failures.push("gate-check must keep fresh missing-control requests lightweight");
    }
    if (!skillMd.includes("Do not write a full control scaffold unless durable control state was explicitly requested")) {
      failures.push("gate-check must prevent full control scaffold writes by default");
    }
    if (!skillMd.includes("do not paste full file bodies into the chat")) {
      failures.push("gate-check must keep control artefact content out of chat by default");
    }
    if (!skillMd.includes("requires a durable UR in `.agdf/control/` or a linked authoritative repository SoT")) {
      failures.push("gate-check must require durable UR persistence for new product semantics or functional change");
    }
    if (!skillMd.includes("Approval text and durable artefact presence are separate requirements for UR, PRD, SD, TP and QA report decisions")) {
      failures.push("gate-check must separate approval text from durable artefact presence for UR, PRD, SD, TP and QA report decisions");
    }
    if (!skillMd.includes("npx --yes @agdf/cli@latest delivery-map --json")) {
      failures.push("gate-check must expose the machine-readable delivery-map command");
    }
    if (!skillMd.includes("This skill is the primary operating path for gate judgement")) {
      failures.push("gate-check must state that the skill is the primary operating path before helper commands");
    }
    if (!skillMd.includes("not a required ritual for normal work")) {
      failures.push("gate-check must state that CLI reports are not a required ritual for normal work");
    }
    if (!skillMd.includes("The CLI reports are validators and JSON evidence, not the primary user experience")) {
      failures.push("gate-check must classify CLI reports as validators, not the primary workflow");
    }
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
  ["plugin/meta/agdf-agent-router.md", read(agentRouterPath)],
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
const brownfieldReviewTemplatePath = join(controlRoot, "templates", "artefacts", "BROWNFIELD_REVIEW.md");
const orTemplatePath = join(controlRoot, "templates", "artefacts", "OR.md");
const backlogTemplatePath = join(controlRoot, "templates", "MASTER_BACKLOG.md");

if (isFile(runTemplatePath)) {
  const runTemplate = read(runTemplatePath);
  for (const required of ["current_gate", "next allowed action", "Missing Evidence", "Mode / Slice Decision", "transparency_note", "Artefact Chain", "context_graph_impact", "context_graph_reconciliation", "quality_outlook"]) {
    if (!runTemplate.includes(required)) failures.push(`AGDF_RUN.md missing control field: ${required}`);
  }
  assertContextGraphReconciliation("AGDF_RUN.md template", runTemplate, { allowTemplatePlaceholders: true });
  const runStatusCard = sectionAfterHeading(runTemplate, "Run Status Card");
  for (const label of ["Status", "Current gate", "Allowed now", "Blocked by", "Missing approval", "Next step", "Quality outlook"]) {
    if (!runStatusCard.includes(`| ${label} |`)) failures.push(`AGDF_RUN.md Run Status Card missing readable label: ${label}`);
  }
  for (const extraLabel of ["Mode", "Mode / slice", "Forbidden now", "Evidence", "Next skill"]) {
    if (runStatusCard.includes(`| ${extraLabel} |`)) failures.push(`AGDF_RUN.md Run Status Card is not compact: ${extraLabel}`);
  }
  for (const rawField of ["allowed_now", "forbidden_now", "blocking_condition", "next_skill", "next_step", "quality_outlook"]) {
    if (runStatusCard.includes(`- ${rawField}:`)) failures.push(`AGDF_RUN.md Run Status Card exposes raw field: ${rawField}`);
  }
}

if (isFile(orTemplatePath)) {
  const orTemplate = read(orTemplatePath);
  const orStatusCard = sectionAfterHeading(orTemplate, "Run Status Card");
  for (const label of ["Status", "Current gate", "Allowed now", "Blocked by", "Missing approval", "Next step", "Quality outlook"]) {
    if (!orStatusCard.includes(`| ${label} |`)) failures.push(`OR.md Run Status Card missing readable label: ${label}`);
  }
  for (const extraLabel of ["Mode", "Mode / slice", "Forbidden now", "Evidence", "Next skill"]) {
    if (orStatusCard.includes(`| ${extraLabel} |`)) failures.push(`OR.md Run Status Card is not compact: ${extraLabel}`);
  }
  for (const rawField of ["allowed_now", "forbidden_now", "blocking_condition", "next_skill", "next_step", "quality_outlook"]) {
    if (orStatusCard.includes(`- ${rawField}:`)) failures.push(`OR.md Run Status Card exposes raw field: ${rawField}`);
  }
  if ((orTemplate.match(/Quality outlook/g) ?? []).length !== 1) {
    failures.push("OR.md must present Quality outlook exactly once in the Run Status Card");
  }
}

if (isFile(backlogTemplatePath)) {
  const backlogTemplate = read(backlogTemplatePath);
  for (const required of [
    "| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |",
    "| Key | Work item | Final status | Historical record | Outcome |",
    "document-relative Markdown link",
  ]) {
    if (!backlogTemplate.includes(required)) failures.push(`MASTER_BACKLOG.md missing human-readable backlog contract: ${required}`);
  }
  if (backlogTemplate.includes("| Prio | Key | Title | Status | UR |")) {
    failures.push("MASTER_BACKLOG.md must not use the legacy wide layout as its canonical template");
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

if (isFile(brownfieldReviewTemplatePath)) {
  const brownfieldReviewTemplate = read(brownfieldReviewTemplatePath);
  for (const required of ["Existing-System View", "Reuse And Parallel-Structure Risk", "Mode / Slice Decision", "transparency_note", "Next Permissible Step"]) {
    if (!brownfieldReviewTemplate.includes(required)) failures.push(`BROWNFIELD_REVIEW.md missing control field: ${required}`);
  }
}

if (isFile(orTemplatePath)) {
  const orTemplate = read(orTemplatePath);
  for (const required of ["Report mode", "OR-lite | OR-full", "Next Permissible Step", "Context Graph Impact", "context_graph_reconciliation", "OR does not approve later gates"]) {
    if (!orTemplate.includes(required)) failures.push(`OR.md missing control field: ${required}`);
  }
  assertContextGraphReconciliation("OR.md template", orTemplate, { allowTemplatePlaceholders: true });
}

if (isFile(activeRunStatePath)) {
  assertContextGraphReconciliation(".agdf/control/AGDF_RUN.md", read(activeRunStatePath));
}

assertContextGraphReconciliation("Context Graph open-gap fixture", [
  "- context_graph_impact: link_only",
  "- context_graph_refs: none",
  "- context_graph_reconciliation: open_gap",
  "- context_graph_required_action: promote after UAT",
].join("\n"));

const fixtureFailureCount = failures.length;
assertContextGraphReconciliation("Context Graph invalid fixture", [
  "- context_graph_impact: link_only",
  "- context_graph_refs: none",
  "- context_graph_reconciliation: not_applicable",
  "- context_graph_required_action: promote after UAT",
].join("\n"));
const invalidFixtureFailure = failures.pop();
if (!invalidFixtureFailure?.includes("Context Graph invalid fixture")) {
  failures.push("Context Graph invalid fixture did not fail as expected");
}
if (failures.length !== fixtureFailureCount) {
  failures.push("Context Graph invalid fixture changed unrelated failure state");
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
