import { createHash } from "node:crypto";
import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, relative, resolve } from "node:path";

const scriptPluginRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

function isFile(path) {
  if (!path) return false;
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function isDirectory(path) {
  if (!path) return false;
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function samePath(left, right) {
  try {
    return realpathSync(left) === realpathSync(right);
  } catch {
    return false;
  }
}

function hasPluginLayout(root) {
  return [
    ".codex-plugin/plugin.json",
    ".claude-plugin/plugin.json",
    "meta/agdf-plugin.definition.json",
    "meta/agdf-runtime-contract.md",
    "hooks/hooks.json",
    "scripts/check-runtime-integrity.mjs",
  ].every((path) => isFile(join(root, path)))
    && ["skills", "control"].every((path) => isDirectory(join(root, path)));
}

function hasSourceLayout(root) {
  return hasPluginLayout(join(root, "plugin"))
    && [
      "agdf/package.json",
      "create-agdf/package.json",
      "pages/package.json",
      "LICENSE",
    ].every((path) => isFile(join(root, path)));
}

function invalidLayout(root) {
  console.error("[agdf-runtime-integrity] FAIL");
  console.error(`- AGDF_RUNTIME_INTEGRITY_LAYOUT_INVALID: ${root}`);
  process.exit(1);
}

function classifyLayout(root) {
  const source = hasSourceLayout(root);
  const installed = hasPluginLayout(root);
  if (source === installed) invalidLayout(root);
  return source
    ? { mode: "source", repoRoot: root, pluginRoot: join(root, "plugin") }
    : { mode: "installed", repoRoot: null, pluginRoot: root };
}

function resolveLayout() {
  if (process.env.AGDF_RUNTIME_INTEGRITY_ROOT) {
    return classifyLayout(resolve(process.env.AGDF_RUNTIME_INTEGRITY_ROOT));
  }

  const parentRoot = dirname(scriptPluginRoot);
  const sourceIntent = samePath(join(parentRoot, "plugin"), scriptPluginRoot)
    && (isFile(join(parentRoot, "package.json"))
      || isDirectory(join(parentRoot, "create-agdf"))
      || isDirectory(join(parentRoot, "agdf")));
  return classifyLayout(sourceIntent ? parentRoot : scriptPluginRoot);
}

const { mode: validationMode, repoRoot, pluginRoot } = resolveLayout();
const sourceMode = validationMode === "source";
let validateAgentSkillsConformance;
try {
  ({ validateAgentSkillsConformance } = await import("./agent-skills-conformance.mjs"));
} catch {
  console.error("[agdf-runtime-integrity] FAIL");
  console.error("- AGDF_AGENT_SKILLS_VALIDATOR_MISSING: scripts/agent-skills-conformance.mjs must be present and loadable");
  process.exit(1);
}
let extractSerializedDescriptionScalar;
let requestActivationKernelFingerprint;
let validateInstructionFootprintProfile;
try {
  ({
    extractSerializedDescriptionScalar,
    requestActivationKernelFingerprint,
    validateInstructionFootprintProfile,
  } = await import("./instruction-footprint.mjs"));
} catch {
  console.error("[agdf-runtime-integrity] FAIL");
  console.error("- AGDF_INSTRUCTION_FOOTPRINT_VALIDATOR_MISSING: scripts/instruction-footprint.mjs must be present and loadable");
  process.exit(1);
}
const codexSourceMarketplacePath = sourceMode ? join(repoRoot, ".agents", "plugins", "marketplace.json") : null;
const claudeSourceMarketplacePath = sourceMode ? join(repoRoot, ".claude-plugin", "marketplace.json") : null;
const codexPluginPath = join(pluginRoot, ".codex-plugin", "plugin.json");
const claudePluginPath = join(pluginRoot, ".claude-plugin", "plugin.json");
const copilotPluginPath = join(pluginRoot, "plugin.json");
const copilotHooksPath = join(pluginRoot, "hooks", "copilot-hooks.json");
const installationProvenancePath = join(pluginRoot, ".agdf-installation.json");
const legacyLocalInstallMarkerPath = join(pluginRoot, ".agdf-local-install.json");
const pluginDefinitionPath = join(pluginRoot, "meta", "agdf-plugin.definition.json");
const agentRouterPath = join(pluginRoot, "meta", "agdf-agent-router.md");
const runtimeContractPath = join(pluginRoot, "meta", "agdf-runtime-contract.md");
const contractsDir = join(pluginRoot, "meta", "contracts");
const requestActivationContractPath = join(contractsDir, "request-activation.md");
const commandRegistryPath = sourceMode
  ? join(repoRoot, "create-agdf", "lib", "cli", "command-registry.js")
  : join(pluginRoot, "runtime", "create-agdf", "lib", "cli", "command-registry.js");
const skillDispatchFunctionContractPath = sourceMode
  ? join(repoRoot, "create-agdf", "lib", "skill-dispatch", "contract.js")
  : join(pluginRoot, "runtime", "create-agdf", "lib", "skill-dispatch", "contract.js");
const interactionLocalesPath = join(pluginRoot, "meta", "agdf-interaction-locales.json");
const gateCheckSkillPath = join(pluginRoot, "skills", "gate-check", "SKILL.md");
const brownfieldSkillPath = join(pluginRoot, "skills", "brownfield-analysis", "SKILL.md");
const localRuntimeManifestPath = join(pluginRoot, "runtime", "runtime-manifest.json");
const localRuntimeEntrypointPath = join(pluginRoot, "runtime", "agdf-local.js");
const automaticRuntimeCheckPath = join(pluginRoot, "runtime", "agdf-session-check.js");
const hooksConfigPath = join(pluginRoot, "hooks", "hooks.json");
const sessionStartHookPath = join(pluginRoot, "hooks", "session-start.sh");
const codexComposerIconPath = join(pluginRoot, "assets", "agdf-icon.svg");
const codexLogoPath = join(pluginRoot, "assets", "agdf-logo.svg");
const agdfPackagePath = sourceMode ? join(repoRoot, "agdf", "package.json") : null;
const createAgdfPackagePath = sourceMode ? join(repoRoot, "create-agdf", "package.json") : null;
const pagesPackagePath = sourceMode ? join(repoRoot, "pages", "package.json") : null;
const pagesSiteDataPath = sourceMode ? join(repoRoot, "pages", "src", "data", "site.ts") : null;
const pagesSkillsPath = sourceMode ? join(repoRoot, "pages", "src", "data", "skills.ts") : null;
const pagesIndexPath = sourceMode ? join(repoRoot, "pages", "src", "pages", "index.astro") : null;
const syncPackageAssetsPath = sourceMode ? join(repoRoot, "create-agdf", "scripts", "sync-package-assets.js") : null;
const syncPluginRuntimePath = sourceMode ? join(repoRoot, "create-agdf", "scripts", "sync-plugin-runtime.js") : null;
const createAgdfOpenCodeInstallerPath = sourceMode ? join(repoRoot, "create-agdf", "lib", "installers", "opencode.js") : null;
const openCodeNpmPluginPath = sourceMode ? join(repoRoot, "create-agdf", "opencode-plugin.js") : null;
const activeRunStatePath = sourceMode ? join(repoRoot, ".agdf", "control", "AGDF_RUN.md") : null;
const rootLicensePath = sourceMode ? join(repoRoot, "LICENSE") : null;
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
  "templates/artefacts/VERIFIED_CHANGE.md",
  "templates/artefacts/PRD.md",
  "templates/artefacts/UX_INTENT_DEFINITION.md",
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
let canonicalSkillDispatchProjection = "";
try {
  const functionContract = await import(pathToFileURL(skillDispatchFunctionContractPath).href);
  canonicalSkillDispatchProjection = functionContract.renderSkillDispatchSemanticProjection();
} catch {
  failures.push("skill dispatch semantic function owner must be present and loadable");
}
const skillSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const requestActivationMarkers = Object.freeze({
  guardStart: "<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->",
  guardEnd: "<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->",
  discoveryStart: "<!-- AGDF-REQUEST-ACTIVATION-DISCOVERY-SUFFIX:START -->",
  discoveryEnd: "<!-- AGDF-REQUEST-ACTIVATION-DISCOVERY-SUFFIX:END -->",
  operationsStart: "<!-- AGDF-REQUEST-ACTIVATION-OPERATIONS:START -->",
  operationsEnd: "<!-- AGDF-REQUEST-ACTIVATION-OPERATIONS:END -->",
  runtimeModulesStart: "<!-- AGDF-RUNTIME-CONTRACT-MODULES:START -->",
  runtimeModulesEnd: "<!-- AGDF-RUNTIME-CONTRACT-MODULES:END -->",
  skillRoutingStart: "<!-- AGDF-SKILL-ROUTING:START -->",
  skillRoutingEnd: "<!-- AGDF-SKILL-ROUTING:END -->",
});

function read(path) {
  return readFileSync(path, "utf8");
}

function readAllContracts() {
  return contractModules
    .map((name) => {
      const path = join(contractsDir, name);
      return isFile(path) ? read(path) : "";
    })
    .join("\n\n");
}

function readJson(path, label) {
  try {
    return JSON.parse(read(path));
  } catch (error) {
    failures.push(`${label} must be readable JSON`);
    return null;
  }
}

function normalizeLf(content) {
  return content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function normalizeProse(content) {
  return normalizeLf(content).replace(/\s+/g, " ").trim();
}

function countOccurrences(content, needle) {
  return needle ? content.split(needle).length - 1 : 0;
}

function ownedBlock(content, startMarker, endMarker, label) {
  const startCount = countOccurrences(content, startMarker);
  const endCount = countOccurrences(content, endMarker);
  if (startCount !== 1 || endCount !== 1) {
    failures.push(`${label} must contain exactly one complete marker-bounded projection`);
    return "";
  }
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker, start) + endMarker.length;
  if (end <= start) {
    failures.push(`${label} projection markers are out of order`);
    return "";
  }
  return content.slice(start, end);
}

function requestActivationDiscoverySuffix(contractContent) {
  const block = ownedBlock(
    contractContent,
    requestActivationMarkers.discoveryStart,
    requestActivationMarkers.discoveryEnd,
    "request activation discovery suffix",
  );
  if (!block) return "";
  const suffix = block
    .split(/\r?\n/)
    .filter((line) => line !== requestActivationMarkers.discoveryStart
      && line !== requestActivationMarkers.discoveryEnd)
    .join("\n")
    .trim();
  if (!suffix || suffix.includes("\n")) {
    failures.push("request activation discovery suffix must contain exactly one non-empty line");
    return "";
  }
  return suffix;
}

function parseRequestActivationCatalog(contractContent) {
  const block = ownedBlock(
    contractContent,
    requestActivationMarkers.operationsStart,
    requestActivationMarkers.operationsEnd,
    "request activation operation catalog",
  );
  if (!block) return null;
  const match = block.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  if (!match || (block.match(/^```json$/gm) ?? []).length !== 1 || (block.match(/^```$/gm) ?? []).length !== 1) {
    failures.push("request activation operation catalog must contain exactly one JSON block");
    return null;
  }
  try {
    return JSON.parse(match[1]);
  } catch {
    failures.push("request activation operation catalog must be valid JSON");
    return null;
  }
}

function javascriptTokens(content) {
  const tokens = [];
  let index = 0;
  let lineStart = true;
  const push = (type, value) => {
    tokens.push({ type, value, lineStart });
    lineStart = false;
  };

  while (index < content.length) {
    const character = content[index];
    const next = content[index + 1];
    if (/\s/.test(character)) {
      if (character === "\n" || character === "\r") lineStart = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "/") {
      index += 2;
      while (index < content.length && !["\n", "\r"].includes(content[index])) index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      index += 2;
      while (index < content.length && !(content[index] === "*" && content[index + 1] === "/")) {
        if (content[index] === "\n" || content[index] === "\r") lineStart = true;
        index += 1;
      }
      index = Math.min(index + 2, content.length);
      continue;
    }
    if (character === "`") {
      index += 1;
      while (index < content.length) {
        if (content[index] === "\\") {
          index += 2;
          continue;
        }
        if (content[index] === "`") {
          index += 1;
          break;
        }
        index += 1;
      }
      push("template", "");
      continue;
    }
    if (character === "\"" || character === "'") {
      const quote = character;
      let value = "";
      let plain = true;
      index += 1;
      while (index < content.length) {
        if (content[index] === "\\") {
          plain = false;
          index += 2;
          continue;
        }
        if (content[index] === quote) {
          index += 1;
          break;
        }
        value += content[index];
        index += 1;
      }
      push("string", plain ? value : "");
      continue;
    }
    if (/[A-Za-z_$]/.test(character)) {
      let end = index + 1;
      while (end < content.length && /[A-Za-z0-9_$]/.test(content[end])) end += 1;
      push("identifier", content.slice(index, end));
      index = end;
      continue;
    }
    push("punctuation", character);
    index += 1;
  }
  return tokens;
}

function commandRegistryNames(content) {
  const commands = new Set();
  const tokens = javascriptTokens(content);
  for (let index = 0; index < tokens.length - 2; index += 1) {
    const [commandToken, openingToken, nameToken] = tokens.slice(index, index + 3);
    if (commandToken.type === "identifier"
        && commandToken.value === "command"
        && commandToken.lineStart
        && openingToken.type === "punctuation"
        && openingToken.value === "("
        && nameToken.type === "string"
        && skillSlugPattern.test(nameToken.value)) {
      commands.add(nameToken.value);
    }
  }
  return commands;
}

function validateRequestActivationCatalog(catalog, definition, registryContent) {
  if (catalog?.schema_version !== 1 || !Array.isArray(catalog?.operations) || !Array.isArray(catalog?.derived_operations)) {
    failures.push("request activation operation catalog must use schema_version 1 with operations and derived_operations arrays");
    return;
  }
  const skillSlugs = new Set((definition?.skillSet ?? []).map((skill) => skill.slug));
  const commands = commandRegistryNames(registryContent);
  if (commands.size === 0) failures.push("commandRegistry must expose operation-owner commands");
  const operationIds = new Set();
  const ownerKinds = new Set(["contract", "skill", "command", "function"]);
  for (const operation of catalog.operations) {
    const operationId = operation?.operation_id ?? "";
    if (!/^[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)+$/.test(operationId)) {
      failures.push(`request activation catalog contains a missing or unknown operation ID: ${operationId || "<missing>"}`);
      continue;
    }
    if (operationIds.has(operationId)) failures.push(`request activation catalog contains duplicate operation ID: ${operationId}`);
    operationIds.add(operationId);
    if (!operation.route_family || !operation.target_boundary || !operation.control_boundary) {
      failures.push(`request activation operation ${operationId} has an incomplete route boundary`);
    }
    if (!ownerKinds.has(operation.owner_kind) || !operation.owner) {
      failures.push(`request activation operation ${operationId} has an unknown owner declaration`);
    } else if (operation.owner_kind === "command" && !commands.has(operation.owner)) {
      failures.push(`request activation operation ${operationId} references unknown commandRegistry owner ${operation.owner}`);
    } else if (operation.owner_kind === "skill" && !skillSlugs.has(operation.owner)) {
      failures.push(`request activation operation ${operationId} references unknown skillSet owner ${operation.owner}`);
    }
    if (operationId.startsWith("skill.")) {
      failures.push("request activation direct skill IDs must derive from pluginDefinition.skillSet");
    }
  }
  const [derived] = catalog.derived_operations;
  if (catalog.derived_operations.length !== 1
      || derived?.operation_id_pattern !== "skill.<slug>"
      || derived?.derive_from !== "pluginDefinition.skillSet"
      || derived?.owner_kind !== "dispatcher"
      || derived?.owner !== "skill-dispatch-v1"
      || derived?.target_boundary !== "dispatcher_v1"
      || derived?.control_boundary !== "dispatcher_v1") {
    failures.push("request activation derived skill operation owner must be dispatcher v1 over pluginDefinition.skillSet");
  }
}

function runtimeModuleIndex(modulePaths) {
  const rows = [];
  for (const modulePath of modulePaths) {
    const path = join(pluginRoot, modulePath);
    if (!isFile(path)) continue;
    const title = read(path).match(/^# AGDF Runtime Contract (?:—|-) (.+)$/m)?.[1]?.trim();
    if (!title) {
      failures.push(`runtime contract module lacks its canonical title: ${modulePath}`);
      continue;
    }
    rows.push(`| ${title} | \`${modulePath.replace(/^meta\//, "")}\` | Canonical focused module; follow the linked source for semantics. |`);
  }
  return [
    requestActivationMarkers.runtimeModulesStart,
    "| Module | Path | Coverage |",
    "|---|---|---|",
    ...rows,
    requestActivationMarkers.runtimeModulesEnd,
  ].join("\n");
}

function expectedSkillDescription(skill, suffix) {
  return `Use this skill for this scope: ${skill.useFor}. Boundary: ${skill.boundary}. ${suffix}`;
}

function digestPluginSource(root, canonicalVersion) {
  const files = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stats = statSync(path);
      if (stats.isDirectory()) visit(path);
      else if (stats.isFile()) files.push(path);
    }
  }
  visit(root);
  const hash = createHash("sha256");
  for (const path of files) {
    const normalizedPath = relative(root, path).replaceAll("\\", "/");
    if ([".agdf-installation.json", ".agdf-local-install.json"].includes(normalizedPath)) continue;
    const content = normalizedPath === ".codex-plugin/plugin.json"
      ? `${JSON.stringify({ ...readJson(path, "Codex plugin manifest"), version: canonicalVersion }, null, 2)}\n`
      : readFileSync(path);
    hash.update(normalizedPath);
    hash.update("\0");
    hash.update(content);
    hash.update("\0");
  }
  return hash.digest("hex");
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

assertFile(pluginDefinitionPath, "canonical AGDF plugin definition");
const pluginDefinition = isFile(pluginDefinitionPath) ? readJson(pluginDefinitionPath, "canonical AGDF plugin definition") : null;
const runtimeContractDefinition = pluginDefinition?.runtimeContract;
let runtimeContractModulePaths = [];
if (runtimeContractDefinition?.schemaVersion !== 1
    || runtimeContractDefinition?.manifestPath !== "meta/agdf-runtime-contract.md"
    || !Array.isArray(runtimeContractDefinition?.modules)
    || runtimeContractDefinition.modules.length === 0) {
  failures.push("canonical AGDF plugin definition must declare runtimeContract schemaVersion 1, manifestPath and ordered modules");
} else {
  runtimeContractModulePaths = [...runtimeContractDefinition.modules];
  if (new Set(runtimeContractModulePaths).size !== runtimeContractModulePaths.length) {
    failures.push("runtimeContract.modules must not contain duplicates");
  }
  for (const modulePath of runtimeContractModulePaths) {
    if (!/^meta\/contracts\/[a-z0-9-]+\.md$/.test(modulePath)) {
      failures.push(`runtimeContract.modules contains an unknown module path: ${modulePath}`);
    }
  }
  if (runtimeContractModulePaths[0] !== "meta/contracts/request-activation.md"
      || runtimeContractModulePaths[1] !== "meta/contracts/task-target-resolution.md") {
    failures.push("runtimeContract.modules must order Request Activation before Task Target Resolution");
  }
}
const contractModules = runtimeContractModulePaths.map((modulePath) => modulePath.replace(/^meta\/contracts\//, ""));
assertFile(runtimeContractPath, "runtime contract");
for (const modulePath of runtimeContractModulePaths) {
  assertFile(
    join(pluginRoot, modulePath),
    `runtime contract module ${modulePath.replace(/^meta\/contracts\//, "")}`,
  );
}
assertFile(requestActivationContractPath, "request activation contract");
assertFile(commandRegistryPath, "commandRegistry operation owner");
assertFile(skillDispatchFunctionContractPath, "skill dispatch semantic function owner");
assertFile(interactionLocalesPath, "interaction locale registry");
if (sourceMode) {
  if (isDirectory(join(pluginRoot, "runtime"))) failures.push("source plugin must not contain generated runtime");
} else {
  assertFile(localRuntimeManifestPath, "surface-local runtime manifest");
  assertFile(localRuntimeEntrypointPath, "surface-local runtime entrypoint");
  assertFile(automaticRuntimeCheckPath, "argument-free automatic runtime-check entrypoint");
  assertFile(join(pluginRoot, "runtime", "create-agdf", "lib", "skill-dispatch", "contract.js"), "skill dispatch contract");
  assertFile(join(pluginRoot, "runtime", "create-agdf", "lib", "skill-dispatch", "service.js"), "skill dispatch service");
}
assertFile(agentRouterPath, "canonical AGDF agent router");
assertFile(codexPluginPath, "Codex plugin manifest");
assertFile(claudePluginPath, "Claude plugin manifest");
assertFile(codexComposerIconPath, "Codex plugin composer icon");
assertFile(codexLogoPath, "Codex plugin logo");
assertFile(hooksConfigPath, "Codex plugin default hooks config");
assertFile(sessionStartHookPath, "AGDF SessionStart hook");
assertFile(join(controlRoot, "README.md"), "AGDF control scaffold README");
assertFile(pluginLicensePath, "plugin LICENSE");

if (sourceMode) {
  if (isFile(codexSourceMarketplacePath)) failures.push("source checkout must not expose a runtime-free Codex marketplace");
  if (isFile(claudeSourceMarketplacePath)) failures.push("source checkout must not expose a runtime-free Claude marketplace");
  assertFile(agdfPackagePath, "agdf CLI package manifest");
  assertFile(createAgdfPackagePath, "create-agdf package manifest");
  assertFile(pagesPackagePath, "Pages package manifest");
  assertFile(pagesSiteDataPath, "Pages site data");
  assertFile(pagesIndexPath, "Pages index");
  assertFile(syncPackageAssetsPath, "create-agdf package asset sync");
  assertFile(syncPluginRuntimePath, "create-agdf plugin runtime sync");
  assertFile(openCodeNpmPluginPath, "OpenCode npm plugin source");
  assertFile(rootLicensePath, "root LICENSE");

  if (isFile(rootLicensePath) && isFile(pluginLicensePath) && read(rootLicensePath) !== read(pluginLicensePath)) {
    failures.push("plugin/LICENSE must be byte-identical to the root LICENSE");
  }
}

const localRuntimeManifest = isFile(localRuntimeManifestPath) ? readJson(localRuntimeManifestPath, "surface-local runtime manifest") : null;
if (pluginDefinition && localRuntimeManifest) {
  if (localRuntimeManifest.version !== pluginDefinition.version) failures.push("surface-local runtime version must match the plugin definition");
  if (localRuntimeManifest.entrypoint !== "create-agdf/bin/agdf-validator.js") failures.push("surface-local runtime manifest must own the focused validator entrypoint");
  if (!/^[a-f0-9]{64}$/.test(localRuntimeManifest.digest ?? "")) failures.push("surface-local runtime manifest must include a deterministic SHA-256 digest");
}
for (const forbiddenRuntimeDirectory of ["installers", "lifecycle", "scaffold"]) {
  if (isDirectory(join(pluginRoot, "runtime", "create-agdf", "lib", forbiddenRuntimeDirectory))) {
    failures.push(`surface-local runtime must exclude non-validation ${forbiddenRuntimeDirectory} modules`);
  }
}
for (const requiredRuntimeFile of sourceMode ? [] : [
  "runtime/create-agdf/lib/runtime/validator-application.js",
  "runtime/create-agdf/lib/runtime/plugin-provenance.js",
  "runtime/create-agdf/lib/cli/validation-handlers.js",
]) assertFile(join(pluginRoot, requiredRuntimeFile), `focused surface-local runtime module ${requiredRuntimeFile}`);
if (!sourceMode && isFile(localRuntimeEntrypointPath)) {
  const probe = spawnSync(process.execPath, [localRuntimeEntrypointPath, "--resolve-only", "--json"], { encoding: "utf8" });
  let report = null;
  try { report = JSON.parse(probe.stdout); } catch {}
  if (probe.status !== 0 || report?.machine_validation !== "owned_version_matched" || report?.registry_access !== false) {
    failures.push("surface-local runtime must pass exact-version digest resolution without registry access");
  }
}
const runtimeContract = readAllContracts();
const requestActivationContract = isFile(requestActivationContractPath) ? read(requestActivationContractPath) : "";
const canonicalRequestActivationGuard = requestActivationContract
  ? ownedBlock(
    requestActivationContract,
    requestActivationMarkers.guardStart,
    requestActivationMarkers.guardEnd,
    "canonical request activation guard",
  )
  : "";
let canonicalGuardFingerprint = "";
if (canonicalRequestActivationGuard) {
  try {
    canonicalGuardFingerprint = requestActivationKernelFingerprint(canonicalRequestActivationGuard);
  } catch (error) {
    failures.push(`canonical request activation guard fingerprint is invalid: ${error.message}`);
  }
}
if (canonicalRequestActivationGuard && canonicalGuardFingerprint
    && !canonicalRequestActivationGuard.includes(`- \`guard_fingerprint\`: \`${canonicalGuardFingerprint}\``)) {
  failures.push("canonical request activation guard fingerprint does not match its source block");
}
if (requestActivationContract) {
  for (const required of [
    "sole semantic owner",
    "no raw prompt or derived request classification is written",
    "no network request, remote classifier, repository read, tool call, or dispatcher call",
    "requested_effect",
    "invocation_provenance",
    "selection_origin",
    "persist: false",
  ]) {
    if (!requestActivationContract.includes(required)) {
      failures.push(`request activation contract missing non-authorizing/privacy boundary: ${required}`);
    }
  }
  const catalog = parseRequestActivationCatalog(requestActivationContract);
  validateRequestActivationCatalog(
    catalog,
    pluginDefinition,
    isFile(commandRegistryPath) ? read(commandRegistryPath) : "",
  );
}
const activationDiscoverySuffix = requestActivationContract
  ? requestActivationDiscoverySuffix(requestActivationContract)
  : "";
if (isFile(runtimeContractPath) && runtimeContractModulePaths.length > 0) {
  const manifestContent = read(runtimeContractPath);
  const projectedIndex = ownedBlock(
    manifestContent,
    requestActivationMarkers.runtimeModulesStart,
    requestActivationMarkers.runtimeModulesEnd,
    "runtime contract module index",
  );
  const expectedIndex = runtimeModuleIndex(runtimeContractModulePaths);
  if (projectedIndex && projectedIndex !== expectedIndex) {
    failures.push("runtime contract module index is stale or out of definition order");
  }
}
const taskTargetContract = isFile(join(contractsDir, "task-target-resolution.md")) ? read(join(contractsDir, "task-target-resolution.md")) : "";
const interactionContract = isFile(join(contractsDir, "interaction.md")) ? read(join(contractsDir, "interaction.md")) : "";
const modesContract = isFile(join(contractsDir, "modes.md")) ? read(join(contractsDir, "modes.md")) : "";
const gateTransitionContract = isFile(join(contractsDir, "gate-transition.md")) ? read(join(contractsDir, "gate-transition.md")) : "";
const agentRouterContent = isFile(agentRouterPath) ? read(agentRouterPath) : "";
const interactionLocales = isFile(interactionLocalesPath) ? readJson(interactionLocalesPath, "interaction locale registry") : null;
const gateCheckSkill = isFile(gateCheckSkillPath) ? read(gateCheckSkillPath) : "";
const brownfieldSkill = isFile(brownfieldSkillPath) ? read(brownfieldSkillPath) : "";
if (pluginDefinition && canonicalRequestActivationGuard && activationDiscoverySuffix && gateCheckSkill) {
  const expectedDescriptions = Object.fromEntries(pluginDefinition.skillSet.map((skill) => [
    skill.slug,
    JSON.stringify(expectedSkillDescription(skill, activationDiscoverySuffix)),
  ]));
  const discoveryRecords = [];
  for (const skill of pluginDefinition.skillSet) {
    const path = join(skillRoot, skill.slug, "SKILL.md");
    if (!isFile(path)) continue;
    try {
      discoveryRecords.push({
        id: skill.slug,
        slug: skill.slug,
        content: extractSerializedDescriptionScalar(read(path)),
      });
    } catch (error) {
      failures.push(`${skill.slug} discovery scalar is invalid: ${error.message}`);
    }
  }
  const footprintReport = validateInstructionFootprintProfile({
    definition: pluginDefinition.instructionFootprint,
    canonicalKernel: canonicalRequestActivationGuard,
    expectedDescriptions,
    expectedVersion: pluginDefinition.version,
    expectedInstanceIds: {
      activationKernel: ["canonical"],
      skillDiscoveryDescription: pluginDefinition.skillSet.map((skill) => skill.slug),
      allSkillDiscoveryDescriptions: ["definition-order"],
      selectedGateCheckSkill: ["canonical"],
    },
    surfaces: {
      activationKernel: [{ id: "canonical", content: canonicalRequestActivationGuard }],
      skillDiscoveryDescription: discoveryRecords,
      allSkillDiscoveryDescriptions: [{ id: "definition-order", content: discoveryRecords.map((record) => record.content).join("") }],
      selectedGateCheckSkill: [{ id: "canonical", variant: "canonical", content: gateCheckSkill }],
    },
    requiredSurfaceIds: [
      "activationKernel",
      "skillDiscoveryDescription",
      "allSkillDiscoveryDescriptions",
      "selectedGateCheckSkill",
    ],
  });
  for (const finding of footprintReport.failures) {
    failures.push(`${finding.code}: ${finding.message}`);
  }
}
if (!brownfieldSkill.includes("Persist the completed review and its decision, scope reason, evidence and required next gate in the same internal operation")) {
  failures.push("brownfield-analysis must own atomic post-UR review and routing persistence");
}
for (const required of [
  "### Structured Depth Decision",
  "depth_unresolved",
  "depth_facts_status",
  "bounded_structured_slice",
  "authority_policy_security_depth",
  "architecture_runtime_depth",
  "persistence_migration_depth",
  "external_contract_depth",
  "release_cross_host_depth",
  "unbounded_consumer_coordination",
  "depth_facts_missing",
  "depth_facts_conflicting",
  "coherent_outcome",
  "authority_boundary",
  "owner_consumer_coordination",
  "full_depth_impacts_absent",
  "migration_propagation_bounded",
  "failure_recovery_local",
  "independently_acceptable",
]) {
  if (!modesContract.includes(required)) failures.push(`modes contract Structured Depth Decision missing: ${required}`);
}
if (!modesContract.includes("counts are not a decision proxy")
    || !modesContract.includes("threshold for either structured mode")) {
  failures.push("modes contract must reject numeric structured-depth proxies");
}
if (!modesContract.includes("Structured Slice and Structured Delivery use the same existing gate and approval sequence")) {
  failures.push("modes contract must preserve structured-depth gate parity");
}
if (!gateTransitionContract.includes("sole normative `Structured Depth Decision`")
    || !gateTransitionContract.includes("does not duplicate its")
    || !gateTransitionContract.includes("trigger or bounded-slice matrix")) {
  failures.push("gate-transition contract must reference the Modes-owned Structured Depth Decision without duplicating it");
}
if (!gateTransitionContract.includes("`depth_unresolved` product result is persisted through this existing value")
    || !gateTransitionContract.includes("`depth_facts_missing | depth_facts_conflicting`")) {
  failures.push("gate-transition contract must route unresolved structured depth through the existing block value");
}
for (const required of [
  "../../meta/contracts/modes.md",
  "depth_policy_version: 1",
  "depth_facts_status: complete",
  "rejected_alternative",
  "missing_or_conflicting_facts",
  "all seven bounded-slice",
  "the existing `block` decision",
  "Brownfield/Mode-Slice re-evaluation",
]) {
  if (!brownfieldSkill.includes(required)) failures.push(`brownfield-analysis structured-depth guidance missing: ${required}`);
}
const codexPlugin = isFile(codexPluginPath) ? readJson(codexPluginPath, "Codex plugin manifest") : null;
const claudePlugin = isFile(claudePluginPath) ? readJson(claudePluginPath, "Claude plugin manifest") : null;
const installationProvenance = isFile(installationProvenancePath) ? readJson(installationProvenancePath, "AGDF installation provenance") : null;
const legacyLocalInstallMarker = isFile(legacyLocalInstallMarkerPath) ? readJson(legacyLocalInstallMarkerPath, "legacy AGDF local install marker") : null;
const agdfPackage = isFile(agdfPackagePath) ? readJson(agdfPackagePath, "agdf CLI package manifest") : null;
const createAgdfPackage = isFile(createAgdfPackagePath) ? readJson(createAgdfPackagePath, "create-agdf package manifest") : null;
const pagesPackage = isFile(pagesPackagePath) ? readJson(pagesPackagePath, "Pages package manifest") : null;

if (!runtimeContract.includes("first eligible native-attempt") || !runtimeContract.includes("does not trigger a second")) {
  failures.push("Native Interaction Contract must require a single first native attempt with no retry");
}
if (!runtimeContract.includes("`attempted_not_applied`") || !runtimeContract.includes("`unsafe_to_wait`")) {
  failures.push("Runtime Contract must define visible fallback attempt outcomes");
}
if (!runtimeContract.includes("### Interaction Locale Contract")
  || !runtimeContract.includes("an unsupported requested locale must fail to English as a complete unit")
  || !runtimeContract.includes("an incomplete or invalid registry fails closed")) {
  failures.push("Runtime Contract must define deterministic chat-locale resolution with English fallback");
}

const taskTargetContractProse = normalizeProse(taskTargetContract);
for (const targetBoundary of [
  "## Direct Skill Invocation Preflight",
  "before skill-specific input",
  "`task_target_orientation.markdown` verbatim",
  "request only the normalized `next_action`",
  "terminal pre-decision outcome",
  "do not\n   inspect repository control state",
  "use only its `governance_target`",
  "subsequent skill-owned chat output must not mix locale packs",
  "target-check --json --language <current-chat-language>",
  "Do not install or resolve a remote",
]) {
  if (!taskTargetContractProse.includes(normalizeProse(targetBoundary))) failures.push(`shared direct skill target-preflight boundary missing: ${targetBoundary}`);
}
for (const activationBoundary of [
  "After positive Request Activation, resolve the user's primary work target",
  "Silent Request Activation abstention and targetless catalog routes do not invoke this contract.",
  "After the already-loaded Request Activation guard has positively selected a direct, target-bound skill route",
  "Automatic selection alone is not positive activation; on silent abstention this preflight is not run.",
]) {
  if (!taskTargetContractProse.includes(activationBoundary)) {
    failures.push(`task-target-resolution must remain downstream of positive Request Activation: ${activationBoundary}`);
  }
}

const modesContractProse = normalizeProse(modesContract);
for (const activationBoundary of [
  "Request Activation precedes Mode Selection.",
  "read-only handling and are not Quick Tasks.",
  "Quick Task is a downstream process choice for an actual delivery effect or explicit AGDF operation; it is never an activation fallback.",
  "Read-only questions, reviews and diagnosis without a requested delivery effect remain outside AGDF.",
]) {
  if (!modesContractProse.includes(activationBoundary)) {
    failures.push(`modes contract must keep ordinary read-only work outside Quick Task: ${activationBoundary}`);
  }
}
if (modesContractProse.includes("| Quick Task Mode | small questions, reviews, debugging")) {
  failures.push("modes contract must not classify ordinary questions or reviews as Quick Task");
}

const interactionContractProse = normalizeProse(interactionContract);
for (const activationBoundary of [
  "Silent Request Activation abstention for an ordinary read-only request renders no AGDF orientation, status or other AGDF-visible text.",
  "Only after positive activation may a downstream AGDF owner use the localized `primary.readOnlyOrientationDescription` sentence",
  "After positive Request Activation selects a target-bound route, render the target orientation",
]) {
  if (!interactionContractProse.includes(activationBoundary)) {
    failures.push(`interaction contract must keep ordinary read-only handling silent and pre-target: ${activationBoundary}`);
  }
}
const controlSetupBoundary = interactionContract.indexOf("`control_setup` is a non-gate envelope");
const gateApprovalPresentationBoundary = interactionContract.indexOf("Before presenting `gate_approval`");
if (controlSetupBoundary < 0
    || gateApprovalPresentationBoundary < 0
    || controlSetupBoundary >= gateApprovalPresentationBoundary
    || !interactionContractProse.includes("before automatic run creation, automatic UR persistence or any gate approval can occur.")
    || !interactionContractProse.includes("After successful setup, the agent continues the same delivery intake by persisting the already reviewed canonical run and revision-stable UR without a second setup prompt.")
    || !interactionContractProse.includes("For the explicit standalone `lifecycle.control.init` operation, setup remains scaffold-only and creates neither a run nor UR.")
    || !interactionContractProse.includes("It renders no approval value, native gate control or synthetic selected run.")) {
  failures.push("interaction contract must define non-authorizing control_setup before any gate approval presentation");
}
if (!runtimeContract.includes("### Repository Activation Diagnosis Boundary")) {
  failures.push("control-scaffold contract must own the repository activation diagnosis boundary");
}
if (!runtimeContract.includes("### Scope Classification Card")) {
  failures.push("interaction contract must own the scope classification card section");
}
if (!runtimeContract.includes("## Purpose And Ordering")
  || !runtimeContract.includes("## Target Authority Precedence")
  || !runtimeContract.includes("## Evidence And Mutation Boundary")
  || !runtimeContract.includes("## Fail-Closed States")) {
  failures.push("task-target-resolution contract must own target precedence, evidence boundaries and fail-closed states");
}
if (!runtimeContract.includes("### Task Target Orientation")) {
  failures.push("interaction contract must own the task target orientation section");
}
if (!agentRouterContent.includes("## Task Target Resolution")
  || agentRouterContent.indexOf("## Task Target Resolution") > agentRouterContent.indexOf("## Mode Selection")) {
  failures.push("agent router must resolve the task target before Mode Selection");
}
if (gateCheckSkill.includes("## Task Target Orientation Template")
  || gateCheckSkill.includes("| Primary target | Governance target | Evidence sources |")) {
  failures.push("gate-check must not maintain a skill-local task target orientation template");
}
if (gateCheckSkill.includes("## Scope Classification Card Template") || gateCheckSkill.includes("| Classification | Mode | Boundary |")) {
  failures.push("gate-check must not maintain a skill-local scope classification card template");
}
const interactionPresentationPath = join(pluginRoot, "..", "create-agdf", "lib", "interaction-presentation.js");
if (sourceMode && isFile(interactionPresentationPath)) {
  const interactionPresentation = read(interactionPresentationPath);
  if (!interactionPresentation.includes("export function renderScopeClassificationCard")) {
    failures.push("interaction-presentation.js must export renderScopeClassificationCard");
  }
  if (!interactionPresentation.includes("SCOPE_CLASSIFICATION_LIMITS")
    || !interactionPresentation.includes("maxCodePointsPerField: 240")
    || !interactionPresentation.includes('mode !== "quick_task"')) {
    failures.push("interaction-presentation.js must enforce the bounded Quick Task-only scope classification contract");
  }
  if (!interactionPresentation.includes("export function renderTaskTargetOrientation")) {
    failures.push("interaction-presentation.js must export renderTaskTargetOrientation");
  }
}
for (const locale of ["en", "de"]) {
  const pack = interactionLocales?.locales?.[locale];
  if (!pack?.scopeClassification?.title || !pack?.scopeClassification?.mode?.quick_task || !pack?.scopeClassification?.challenge) {
    failures.push(`Interaction locale ${locale} missing scopeClassification section keys`);
  }
  if (Object.hasOwn(pack?.scopeClassification?.mode ?? {}, "verified_change")) {
    failures.push(`Interaction locale ${locale} must not expose Verified Change as a scope classification card mode`);
  }
  if (!pack?.taskTargetResolution?.title
    || !pack?.taskTargetResolution?.primaryTarget
    || !pack?.taskTargetResolution?.reasonCodes?.target_content_mismatch
    || !pack?.taskTargetResolution?.nextActions?.no_reliable_target
    || !pack?.taskTargetResolution?.nextAction) {
    failures.push(`Interaction locale ${locale} missing taskTargetResolution section keys`);
  }
}
if (!runtimeContract.includes("not an agent-facing diagnosis proof")) {
  failures.push("control-scaffold contract must classify AGDF_* env vars as non-agent-facing diagnosis");
}
if (!runtimeContract.includes("must not be used as proof of presence or absence of `.agdf/control/config.json`")) {
  failures.push("control-scaffold contract must forbid relative glob/grep as activation proof");
}
if (!runtimeContract.includes("### Deterministic Operational Presentation")
  || !/must\s+not reconstruct a table/.test(runtimeContract)) {
  failures.push("interaction contract must own deterministic operational status presentation");
}

for (const gate of ["UR", "PRD", "SD", "TP", "QA", "UAT"]) {
  for (const locale of ["en", "de"]) {
    if (!interactionLocales?.locales?.[locale]?.gateActionTitles?.[gate]) {
      failures.push(`Interaction locale ${locale} missing neutral decision gate title for ${gate}`);
    }
    if (!interactionLocales?.locales?.[locale]?.gateRequiredDecisions?.[gate]) failures.push(`Interaction locale ${locale} missing required decision copy for ${gate}`);
  }
}
for (const locale of ["en", "de"]) {
  const pack = interactionLocales?.locales?.[locale];
  if (!pack?.statusCard?.breadcrumbFulfilled || !pack?.statusCard?.breadcrumbCurrent || !pack?.statusCard?.breadcrumbOpen || !pack?.statusCard?.breadcrumbSeparator) {
    failures.push(`Interaction locale ${locale} missing breadcrumb keys in statusCard`);
  }
  if (!pack?.gateTitles?.["Compact Delivery"]) failures.push(`Interaction locale ${locale} missing Compact Delivery gate title`);
  if (!pack?.primary?.narration?.gateSatisfied || !pack?.primary?.narration?.noAction || !pack?.primary?.narration?.gates) {
    failures.push(`Interaction locale ${locale} missing narration keys in primary`);
  }
}
for (const [surface, expectedTransport] of [["codex", "exact_option_value"], ["claude", "exact_option_value"], ["opencode", "exact_option_value"], ["fallback", "exact_option_value"]]) {
  const surfaceContract = pluginDefinition?.interactions?.surfaces?.[surface];
  if (surfaceContract?.approvalValueTransport !== expectedTransport || surfaceContract?.waitSafety !== "deliberate_no_auto_resolution" || surfaceContract?.authorizationPath !== "exact_text" || Object.hasOwn(surfaceContract ?? {}, "canonicalValueTransport")) {
    failures.push(`${surface} interaction adapter must declare fail-closed canonical value transport and exact-text authorization path`);
  }
}
for (const required of [
  "Before presenting `gate_approval` for any user gate",
  "one immediately preceding assistant message",
  "one immutable,\nnon-authorizing presentation snapshot",
  "### Human Decision Presentation Contract",
  "Never guess a path or emit a broken link",
  "A localized label, description, option position, recommendation style or host action never authorizes a gate",
  "renders the complete operational Run Status Card exactly once, between the compact approval-time Run Status Card and the Gate Transition Card",
  "may carry the missing approval as audit data",
]) {
  if (!runtimeContract.includes(required)) failures.push(`interaction contract ownership boundary missing: ${required}`);
}
const gateTransitionCard = sectionAfterHeading(runtimeContract, "Gate Transition Card");
for (const pattern of [
  "| Status |",
  "- allowed_now:",
  "Diagnostic code:",
  "Evidence:",
  "Question:",
  "Next user gate: Brownfield Analysis",
]) {
  if (gateTransitionCard.includes(pattern)) failures.push(`Gate Transition Card must not render approval-time pattern: ${pattern}`);
}

if (pluginDefinition) {
  if (pluginDefinition.id !== "agdf") failures.push("canonical AGDF plugin definition id must be agdf");
  if (pluginDefinition.displayName !== "AI Governance & Delivery Framework") failures.push("canonical AGDF plugin definition must preserve the local product display name");
  if (pluginDefinition.publicDistribution?.publicDisplayName !== "AGDF") failures.push("canonical public distribution must use the approved constrained public display name");
  if (pluginDefinition.publicDistribution?.fullDisplayName !== "AI Governance & Delivery Framework (AGDF)") failures.push("canonical public distribution must preserve the full AGDF product identity");
  if (pluginDefinition.codex?.skillPrefix !== "") failures.push("canonical AGDF plugin definition Codex skill prefix must be empty to avoid agdf:agdf-* plugin labels");
  if (pluginDefinition.claude?.skillPrefix !== "") failures.push("canonical AGDF plugin definition Claude Code skill prefix must be empty to avoid agdf:agdf-* plugin labels");
  if (pluginDefinition.codex?.agentRouter !== "meta/agdf-agent-router.md") failures.push("canonical AGDF plugin definition Codex agent router must point to meta/agdf-agent-router.md");
  if (pluginDefinition.codex?.composerIcon !== "./assets/agdf-icon.svg") failures.push("canonical AGDF plugin definition Codex composer icon must point to ./assets/agdf-icon.svg");
  if (pluginDefinition.codex?.logo !== "./assets/agdf-logo.svg") failures.push("canonical AGDF plugin definition Codex logo must point to ./assets/agdf-logo.svg");
  if (pluginDefinition.claude?.agentRouter !== "meta/agdf-agent-router.md") failures.push("canonical AGDF plugin definition Claude agent router must point to meta/agdf-agent-router.md");
  if (pluginDefinition.copilot?.skillPrefix !== "agdf-") failures.push("canonical AGDF plugin definition Copilot skill prefix must be agdf-");
  if (pluginDefinition.copilot?.pluginManifest !== "plugin.json" || pluginDefinition.copilot?.skills !== "copilot-skills/" || pluginDefinition.copilot?.hooks !== "hooks/copilot-hooks.json") {
    failures.push("canonical AGDF plugin definition Copilot paths must point to the generated root manifest, prefixed skills and hook config");
  }
  if (pluginDefinition.opencode?.skillPrefix !== "agdf-") failures.push("canonical AGDF plugin definition OpenCode skill prefix must be agdf-");
  if (pluginDefinition.opencode?.globalSkillPrefix !== "agdf-global-") failures.push("canonical AGDF plugin definition OpenCode global skill prefix must be agdf-global-");
  if (pluginDefinition.opencode?.runtimeContractFileName !== "agdf-runtime-contract.md") failures.push("canonical AGDF plugin definition OpenCode runtime contract filename must be agdf-runtime-contract.md");
  if (pluginDefinition.opencode?.instructionsFileName !== "AGDF.md") failures.push("canonical AGDF plugin definition OpenCode instructions filename must be AGDF.md");
  if (pluginDefinition.opencode?.permissions?.question !== "allow") failures.push("canonical AGDF plugin definition OpenCode permissions must allow the native question tool");
  if (pluginDefinition.opencode?.permissions?.edit !== "ask" || pluginDefinition.opencode?.permissions?.bash !== "ask") failures.push("canonical AGDF plugin definition OpenCode permissions must ask before edit and bash");
  if (pluginDefinition.interactions?.fallback !== "exact_text") failures.push("canonical AGDF plugin definition interactions must declare exact_text fallback");
  if (pluginDefinition.interactions?.localeRegistry !== "meta/agdf-interaction-locales.json" || pluginDefinition.interactions?.fallbackLocale !== "en") {
    failures.push("canonical AGDF plugin definition must declare the locale registry and English fallback");
  }
  if (JSON.stringify(pluginDefinition.interactions?.optionOrder) !== JSON.stringify(["approve", "revise", "decline", "cancel"])) {
    failures.push("canonical AGDF plugin definition must preserve stable interaction option order");
  }
  if (JSON.stringify(pluginDefinition.interactions?.outcomes) !== JSON.stringify(["approve", "revise", "decline", "cancel", "no_response", "timeout", "empty", "invalid", "stale"])) {
    failures.push("canonical AGDF plugin definition must preserve distinct interaction outcomes");
  }
  for (const [surface, adapter, safety] of [
    ["codex", "request_user_input", "omit_auto_resolution"],
    ["claude", "AskUserQuestion", "no_timeout_or_hook_supplied_answer"],
    ["copilot", "exact_text", "wait_for_deliberate_user_input"],
    ["opencode", "question", "preserve_explicit_deny"],
    ["fallback", "exact_text", "wait_for_deliberate_user_input"],
  ]) {
    const interaction = pluginDefinition.interactions?.surfaces?.[surface];
    if (interaction?.questionAdapter !== adapter || interaction?.gateSafety !== safety || !interaction?.technicalPermissionOwner) {
      failures.push(`canonical AGDF plugin definition ${surface} interaction mapping must declare adapter, gate safety and technical permission owner`);
    }
    const expectedOutcomes = ["copilot", "fallback"].includes(surface) ? ["approve", "revise", "decline", "cancel"] : ["approve", "revise", "decline"];
    if (JSON.stringify(interaction?.explicitOutcomes) !== JSON.stringify(expectedOutcomes)) {
      failures.push(`canonical AGDF plugin definition ${surface} interaction mapping must preserve stable explicit outcome order`);
    }
  }
  if (!Array.isArray(pluginDefinition.skillSet) || pluginDefinition.skillSet.length === 0) {
    failures.push("canonical AGDF plugin definition must declare the workflow skill set");
  } else {
    const skillSlugs = new Set();
    for (const skill of pluginDefinition.skillSet) {
      if (!skillSlugPattern.test(skill?.slug ?? "")) {
        failures.push(`canonical AGDF plugin definition contains invalid skill slug: ${skill?.slug ?? "<unknown>"}`);
      } else if (skillSlugs.has(skill.slug)) {
        failures.push(`canonical AGDF plugin definition contains duplicate skill slug: ${skill.slug}`);
      } else {
        skillSlugs.add(skill.slug);
      }
      if (typeof skill?.useFor !== "string" || !skill.useFor.trim() || skill.useFor.trim() !== skill.useFor || /[\r\n]/.test(skill.useFor)) {
        failures.push(`canonical AGDF plugin definition skill ${skill?.slug ?? "<unknown>"} must declare single-line useFor`);
      }
      if (typeof skill?.boundary !== "string" || !skill.boundary.trim() || skill.boundary.trim() !== skill.boundary || /[\r\n]/.test(skill.boundary)) {
        failures.push(`canonical AGDF plugin definition skill ${skill?.slug ?? "<unknown>"} must declare single-line boundary`);
      }
      if (typeof skill?.discovery !== "string" || !skill.discovery.trim() || skill.discovery.trim() !== skill.discovery || /[\r\n]/.test(skill.discovery)) {
        failures.push(`canonical AGDF plugin definition skill ${skill?.slug ?? "<unknown>"} must declare single-line discovery`);
      }
      if (!["deterministic_control", "judgement_required"].includes(skill?.dispatch?.mode)) failures.push(`canonical AGDF plugin definition skill ${skill?.slug ?? "<unknown>"} must declare a valid dispatch mode`);
      if (skill?.dispatch?.requiresControlSnapshot !== true) failures.push(`canonical AGDF plugin definition skill ${skill?.slug ?? "<unknown>"} must require the canonical control snapshot`);
      if (skill?.slug === "gate-check"
          && (skill?.dispatch?.mode !== "deterministic_control" || skill?.dispatch?.deterministicCommand !== "gate-check")) {
        failures.push("gate-check must map deterministic_control to its existing deterministic command");
      }
      if (skill?.slug !== "gate-check"
          && (skill?.dispatch?.mode !== "judgement_required" || skill?.dispatch?.deterministicCommand)) {
        failures.push(`judgement skill ${skill?.slug ?? "<unknown>"} must use judgement_required without a deterministic command`);
      }
    }
  }
  const expectedProfiles = {
    "source-development": { runtime: "absent", installable: false, machineValidation: "unavailable" },
    "runtime-plugin": { runtime: "required", installable: true, machineValidation: "local_exact_version_digest" },
    "copilot-runtime-plugin": { runtime: "required", installable: true, machineValidation: "local_exact_version_digest_inventory" },
    "opencode-config-local": { runtime: "config_local_package", installable: true, machineValidation: "local_exact_version" },
    "portable-skills": { runtime: "absent", installable: true, machineValidation: "unavailable_or_external_required" },
  };
  if (pluginDefinition.distributionProfiles?.schemaVersion !== 1
      || pluginDefinition.distributionProfiles?.marketplaceIdentities?.durable !== "agdf"
      || pluginDefinition.distributionProfiles?.marketplaceIdentities?.generatedRepository !== "agdf-repo"
      || JSON.stringify(pluginDefinition.distributionProfiles?.profiles) !== JSON.stringify(expectedProfiles)) {
    failures.push("canonical AGDF plugin definition distribution profiles must match the runtime integrity contract");
  }
  expectedSkills = (pluginDefinition.skillSet ?? [])
    .filter((skill) => skillSlugPattern.test(skill?.slug ?? ""))
    .map((skill) => `${pluginDefinition.codex?.skillPrefix ?? ""}${skill?.slug ?? ""}`)
    .sort();
}

if (interactionLocales) {
  if (interactionLocales.schemaVersion !== 1 || interactionLocales.fallbackLocale !== "en") failures.push("interaction locale registry must use schemaVersion 1 and English fallback");
  if (JSON.stringify(interactionLocales.optionOrder) !== JSON.stringify(["approve", "revise", "decline", "cancel"])) failures.push("interaction locale registry must preserve stable option order");
  const englishKeys = JSON.stringify(Object.keys(interactionLocales.locales?.en?.statusCard ?? {}).sort());
  for (const locale of ["en", "de"]) {
    const pack = interactionLocales.locales?.[locale];
    if (!pack) {
      failures.push(`interaction locale registry missing initial ${locale} pack`);
      continue;
    }
    if (JSON.stringify(Object.keys(pack.statusCard ?? {}).sort()) !== englishKeys) failures.push(`interaction locale registry ${locale} status-card keys are incomplete`);
    for (const gate of ["UR", "PRD", "SD", "TP", "QA", "UAT"]) {
      if (!pack.gateTitles?.[gate]) failures.push(`interaction locale registry ${locale} missing gate title ${gate}`);
    }
    for (const key of ["reviseLabel", "reviseDescription", "declineLabel", "declineDescription", "cancelLabel", "cancelDescription"]) {
      if (!pack.interaction?.[key]) failures.push(`interaction locale registry ${locale} missing interaction copy ${key}`);
    }
  }
}

const agentSkillsConformance = validateAgentSkillsConformance({
  pluginRoot,
  surfaceRoot: pluginRoot,
  surface: sourceMode ? "source" : "plugin",
});
for (const conformanceFinding of agentSkillsConformance.findings) {
  const detail = [conformanceFinding.skillPath, conformanceFinding.resource].filter(Boolean).join(" -> ");
  const rendered = `${conformanceFinding.code} [${conformanceFinding.classification}]${detail ? ` ${detail}` : ""}: ${conformanceFinding.message}`;
  if (conformanceFinding.severity === "error") failures.push(rendered);
  else console.warn(`[agdf-runtime-integrity] advisory: ${rendered}`);
}

if (isFile(pagesSkillsPath)) {
  failures.push("Pages must not maintain a duplicate skill catalogue; use the canonical plugin definition and handbook");
}

if (isFile(pagesIndexPath)) {
  const pagesIndex = read(pagesIndexPath);
  for (const requiredProjection of [
    "evaluationEvidence.canonicalSkills",
    "evaluationEvidence.behavioralCases",
    "data-homepage",
    "data-home-section",
  ]) {
    if (!pagesIndex.includes(requiredProjection)) {
      failures.push(`Pages concise projection must preserve canonical evidence owner: ${requiredProjection}`);
    }
  }
}

if (isFile(pagesSiteDataPath)) {
  const pagesSiteData = read(pagesSiteDataPath);
  for (const canonicalDestination of [
    "docs/handbook",
    "plugin/meta/contracts",
    "INSTALL.md",
  ]) {
    if (!pagesSiteData.includes(canonicalDestination)) {
      failures.push(`Pages concise projection must link canonical detail owner: ${canonicalDestination}`);
    }
  }
}

if (codexPlugin && pluginDefinition) {
  if (codexPlugin.name !== pluginDefinition.id) failures.push("Codex plugin manifest name must match canonical AGDF plugin definition");
  const expectedInstallVersion = installationProvenance?.codex_install_version ?? pluginDefinition.version;
  const validInstalledProjection = !sourceMode
    && installationProvenance?.schema_version === 1
    && installationProvenance?.owner === "create-agdf"
    && installationProvenance?.profile_id === "runtime-plugin"
    && installationProvenance?.marketplace_id === "agdf"
    && installationProvenance?.canonical_version === pluginDefinition.version
    && /^[a-f0-9]{64}$/.test(installationProvenance?.source_digest ?? "")
    && installationProvenance?.source_digest === digestPluginSource(pluginRoot, pluginDefinition.version)
    && installationProvenance?.runtime_digest === localRuntimeManifest?.digest
    && codexPlugin.version === expectedInstallVersion;
  if (codexPlugin.version !== pluginDefinition.version && !validInstalledProjection) failures.push("Codex plugin manifest version must match canonical AGDF plugin definition or one owned installed projection");
  if (installationProvenance && !validInstalledProjection) failures.push("AGDF installation provenance must match plugin, runtime and normalized source digests");
  if (sourceMode && (installationProvenance || legacyLocalInstallMarker)) failures.push("source plugin must not contain AGDF installation provenance");
  if (!sourceMode && legacyLocalInstallMarker) failures.push("installed plugin must not retain the legacy AGDF local install marker");
  if (codexPlugin.description !== pluginDefinition.description) failures.push("Codex plugin manifest description must match canonical AGDF plugin definition");
  if (codexPlugin.homepage !== pluginDefinition.homepage) failures.push("Codex plugin manifest homepage must match canonical AGDF plugin definition");
  if (codexPlugin.repository !== pluginDefinition.repository) failures.push("Codex plugin manifest repository must match canonical AGDF plugin definition");
  if (codexPlugin.license !== pluginDefinition.license) failures.push("Codex plugin manifest license must match canonical AGDF plugin definition");
  if (JSON.stringify(codexPlugin.keywords) !== JSON.stringify(pluginDefinition.keywords)) failures.push("Codex plugin manifest keywords must match canonical AGDF plugin definition");
  if (codexPlugin.author?.name !== pluginDefinition.author?.name || codexPlugin.author?.url !== pluginDefinition.author?.url) failures.push("Codex plugin manifest author must match canonical AGDF plugin definition");
  if (codexPlugin.skills !== pluginDefinition.codex?.skills) failures.push("Codex plugin manifest must point skills to canonical AGDF skills path");
  if (codexPlugin.interface?.displayName !== pluginDefinition.displayName) failures.push("Codex plugin display name must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.shortDescription !== pluginDefinition.description) failures.push("Codex plugin short description must match canonical AGDF plugin description");
  if (codexPlugin.interface?.longDescription !== pluginDefinition.longDescription) failures.push("Codex plugin long description must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.developerName !== pluginDefinition.developerName) failures.push("Codex plugin developer name must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.category !== pluginDefinition.category) failures.push("Codex plugin category must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.websiteURL !== pluginDefinition.homepage) failures.push("Codex plugin website URL must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.privacyPolicyURL !== pluginDefinition.publicDistribution?.urls?.privacy) failures.push("Codex plugin privacy URL must match canonical public distribution definition");
  if (codexPlugin.interface?.termsOfServiceURL !== pluginDefinition.publicDistribution?.urls?.terms) failures.push("Codex plugin terms URL must match canonical public distribution definition");
  if (Object.hasOwn(codexPlugin.interface ?? {}, "supportURL")) failures.push("Codex plugin manifest must omit unsupported interface.supportURL metadata");
  if (codexPlugin.interface?.composerIcon !== pluginDefinition.codex?.composerIcon) failures.push("Codex plugin composer icon must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.logo !== pluginDefinition.codex?.logo) failures.push("Codex plugin logo must match canonical AGDF plugin definition");
  if (codexPlugin.interface?.brandColor !== pluginDefinition.brandColor) failures.push("Codex plugin brand color must match canonical AGDF plugin definition");
  if (JSON.stringify(codexPlugin.interface?.capabilities) !== JSON.stringify(pluginDefinition.codex?.capabilities)) failures.push("Codex plugin capabilities must match canonical AGDF plugin definition");
  if (JSON.stringify(codexPlugin.interface?.defaultPrompt) !== JSON.stringify(pluginDefinition.codex?.defaultPrompt)) failures.push("Codex plugin default prompts must match canonical AGDF plugin definition");
  if (Object.hasOwn(codexPlugin, "hooks")) failures.push("Codex plugin manifest must rely on default hooks/hooks.json discovery");
}

if (claudePlugin && pluginDefinition) {
  if (claudePlugin.name !== pluginDefinition.id) failures.push("Claude plugin manifest name must match canonical AGDF plugin definition");
  if (claudePlugin.version !== pluginDefinition.version) failures.push("Claude plugin manifest version must match canonical AGDF plugin definition");
  if (claudePlugin.description !== pluginDefinition.longDescription) failures.push("Claude plugin manifest description must match canonical AGDF long description");
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
  if (!syncPackageAssets.includes("getRuntimeContractModulePaths(pluginDefinition)")
      || /const contractModules\s*=\s*\[/.test(syncPackageAssets)) {
    failures.push("create-agdf package asset sync must consume the definition-owned runtimeContract inventory");
  }
  const packageSyncEntry = syncPackageAssets.indexOf("export function syncPackageAssets");
  const projectionCheck = syncPackageAssets.indexOf("syncRequestActivationProjections({ repoRoot, mode: \"check\" })", packageSyncEntry);
  const firstPackageMutation = [
    syncPackageAssets.indexOf("write(join(sourcePluginRoot", packageSyncEntry),
    syncPackageAssets.indexOf("rmSync(", packageSyncEntry),
    syncPackageAssets.indexOf("syncDirectory(", packageSyncEntry),
  ].filter((position) => position >= 0).sort((left, right) => left - right)[0] ?? -1;
  if (packageSyncEntry < 0 || projectionCheck < packageSyncEntry
      || (firstPackageMutation >= 0 && projectionCheck > firstPackageMutation)) {
    failures.push("create-agdf package asset sync must pass request-activation projection check before every mutation");
  }
  if (!syncPackageAssets.includes('"## Surface Convention",\n    REQUEST_ACTIVATION_MARKERS.guardStart')
      || syncPackageAssets.includes('replaceUniqueRouterSection(\n    transformed,\n    "## Surface Convention",\n    "## Request Activation"')
      || syncPackageAssets.includes("(?=## Mode Selection)")) {
    failures.push("OpenCode router transform must end Surface Convention replacement before the exact Request Activation guard marker");
  }
  if (!syncPackageAssets.includes("hooks: {\n      sessionStart: [{")) {
    failures.push("Copilot package projection must generate the sessionStart-only hook surface");
  }
}

if (isFile(createAgdfOpenCodeInstallerPath)) {
  const createAgdfOpenCodeInstaller = read(createAgdfOpenCodeInstallerPath);
  if (!createAgdfOpenCodeInstaller.includes("globalOpenCodeInstructionsOwnershipMarker")
      || !createAgdfOpenCodeInstaller.includes("globalOpenCodeSkillOwnershipMarker")
      || !createAgdfOpenCodeInstaller.includes("toGlobalOpenCodeInstructionsBootstrap")
      || !createAgdfOpenCodeInstaller.includes("insertRepositoryActivationGuard")) {
    failures.push("OpenCode global native-surface ownership and fail-closed boundary must remain in the canonical installer path");
  }
  if (createAgdfOpenCodeInstaller.includes("tool.execute.before")) {
    failures.push("OpenCode installer must not require a pre-tool request-classifier hook");
  }
}

if (isFile(syncPluginRuntimePath)) {
  const syncPluginRuntime = read(syncPluginRuntimePath);
  for (const required of [
    "const activationKernel = requestActivationKernel()",
    "requestActivation: ${JSON.stringify({",
    "owner: activationKernel.identity.owner",
    "policy_version: activationKernel.identity.policy_version",
    "guard_fingerprint: activationKernel.identity.guard_fingerprint",
    "routeSource:",
    "../meta/contracts/request-activation.md",
    "../copilot-skills/contracts/request-activation.md",
    "const bindingContext =",
    "AGDF dispatcher binding:",
    "const baseContext = [activationKernel, bindingContext].join",
    "const additionalContext = [baseContext",
    "AGDF runtime facts:",
    "createDispatchBinding",
  ]) {
    if (!syncPluginRuntime.includes(required)) {
      failures.push(`plugin runtime sync missing compact kernel/binding/runtime-facts structure: ${required}`);
    }
  }
  if (syncPluginRuntime.includes("activation_trigger") || syncPluginRuntime.includes("raw_prompt")) {
    failures.push("plugin runtime sync must not retain the broad activation trigger or raw request transport");
  }
}

if (sourceMode && isFile(openCodeNpmPluginPath)) {
  const openCodeNpmPlugin = read(openCodeNpmPluginPath);
  if (!openCodeNpmPlugin.includes("experimental.session.compacting") || !openCodeNpmPlugin.includes("AGDF_CONTROL_DIR")) {
    failures.push("OpenCode npm plugin must preserve AGDF runtime context hooks");
  }
  for (const required of [
    'identity?.owner !== "request_activation_contract"',
    'identity?.path !== "plugin/meta/contracts/request-activation.md"',
    "identity?.policy_version !== 1",
    "fingerprint mismatch",
    "const activeContext = () =>",
    "requestActivation: {",
    "owner: activationIdentity.owner",
    "policy_version: activationIdentity.policy_version",
    "guard_fingerprint: activationIdentity.guard_fingerprint",
    "createDispatchBinding",
    "if (!activation().active) return",
  ]) {
    if (!openCodeNpmPlugin.includes(required)) {
      failures.push(`OpenCode npm plugin missing compact active-context boundary: ${required}`);
    }
  }
  if (openCodeNpmPlugin.includes("activation_trigger")
      || openCodeNpmPlugin.includes("raw_prompt")
      || openCodeNpmPlugin.includes("tool.execute.before")) {
    failures.push("OpenCode npm plugin must not retain a broad activation trigger, raw request transport or pre-tool classifier hook");
  }
  if (!openCodeNpmPlugin.includes("if (validatorVersion && validatorVersion !== packageJson.version)")
      || countOccurrences(openCodeNpmPlugin, "await safeToast(") !== 1) {
    failures.push("OpenCode npm plugin must reserve its only session-created toast for version drift");
  }

  try {
    const expectedIdentity = {
      owner: "request_activation_contract",
      path: "plugin/meta/contracts/request-activation.md",
      policy_version: 1,
      guard_fingerprint: canonicalGuardFingerprint,
    };
    const { AGDFPlugin } = await import(pathToFileURL(openCodeNpmPluginPath).href);
    const observedToasts = [];
    const hooks = await AGDFPlugin({
      directory: join(repoRoot, ".agdf-runtime-integrity-inactive"),
      client: {
        app: { async log() { return {}; } },
        tui: { async showToast({ body }) { observedToasts.push(body); } },
      },
    }, {
      requestActivationIdentity: expectedIdentity,
      executeAutomaticRuntimeCheck: () => ({ effective: false, reason: "integrity_fixture", ran: false, output: "" }),
      validatorPath: join(repoRoot, "create-agdf", "bin", "agdf-validator.js"),
    });
    const expectedHookKeys = [
      "event",
      "experimental.chat.system.transform",
      "experimental.session.compacting",
      "shell.env",
    ];
    if (JSON.stringify(Object.keys(hooks).sort()) !== JSON.stringify(expectedHookKeys.sort())) {
      failures.push("OpenCode npm plugin hook inventory must remain exact and exclude tool.execute.before");
    }
    await hooks.event({ event: { type: "session.created" } });
    if (observedToasts.length !== 0) {
      failures.push("inactive OpenCode session creation must remain log-only and emit no toast");
    }
    const inactiveSystemOutput = { system: [] };
    await hooks["experimental.chat.system.transform"]({}, inactiveSystemOutput);
    if (inactiveSystemOutput.system.length !== 0) {
      failures.push("inactive OpenCode system transform must emit zero bytes");
    }
    const inactiveCompactionOutput = { context: [] };
    await hooks["experimental.session.compacting"]({}, inactiveCompactionOutput);
    if (inactiveCompactionOutput.context.length !== 0) {
      failures.push("inactive OpenCode compaction must emit zero bytes");
    }

    const activeHooks = await AGDFPlugin({
      directory: repoRoot,
      client: {
        app: { async log() { return {}; } },
        tui: { async showToast() { return {}; } },
      },
    }, {
      requestActivationIdentity: expectedIdentity,
      executeAutomaticRuntimeCheck: () => ({ effective: false, reason: "integrity_fixture", ran: false, output: "" }),
      validatorPath: join(repoRoot, "create-agdf", "bin", "agdf-validator.js"),
    });
    const activeSystemOutput = { system: [] };
    await activeHooks["experimental.chat.system.transform"]({}, activeSystemOutput);
    await activeHooks["experimental.chat.system.transform"]({}, activeSystemOutput);
    const activeCompactionOutput = { context: [] };
    await activeHooks["experimental.session.compacting"]({}, activeCompactionOutput);
    await activeHooks["experimental.session.compacting"]({}, activeCompactionOutput);
    const eagerPath = join(repoRoot, "create-agdf", "generated", ".opencode", pluginDefinition.opencode.instructionsFileName);
    if (activeSystemOutput.system.length !== 1 || activeCompactionOutput.context.length !== 1 || !isFile(eagerPath)) {
      failures.push("active OpenCode hooks must expose one idempotent dynamic context and one kernel-only compaction block");
    } else {
      const activeContext = activeSystemOutput.system[0];
      const bindingLine = activeContext.split("\n").find((line) => line.startsWith("AGDF dispatcher binding: "));
      const binding = JSON.parse(bindingLine.slice("AGDF dispatcher binding: ".length));
      const eager = read(eagerPath);
      const dynamicValues = { executable: binding.executable, validator: binding.argv_prefix[0] };
      const report = validateInstructionFootprintProfile({
        definition: pluginDefinition.instructionFootprint,
        canonicalKernel: canonicalRequestActivationGuard,
        expectedVersion: pluginDefinition.version,
        expectedInstanceIds: {
          openCodeEagerInstructions: ["repository"],
          openCodeActiveDynamicContext: ["active"],
          openCodeInactiveDynamicContext: ["inactive"],
          openCodeComposedStaticAndActiveDynamic: ["repository"],
          openCodeCompactionAddition: ["active"],
        },
        surfaces: {
          openCodeEagerInstructions: [{ id: "repository", content: eager }],
          openCodeActiveDynamicContext: [{ id: "active", content: activeContext, dynamicValues }],
          openCodeInactiveDynamicContext: [{ id: "inactive", content: "" }],
          openCodeComposedStaticAndActiveDynamic: [{ id: "repository", content: `${eager}\n${activeContext}`, dynamicValues }],
          openCodeCompactionAddition: [{ id: "active", content: activeCompactionOutput.context[0] }],
        },
        requiredSurfaceIds: [
          "openCodeEagerInstructions",
          "openCodeActiveDynamicContext",
          "openCodeInactiveDynamicContext",
          "openCodeComposedStaticAndActiveDynamic",
          "openCodeCompactionAddition",
        ],
      });
      for (const finding of report.failures) failures.push(`${finding.code}: ${finding.message}`);
    }
  } catch (error) {
    failures.push(`OpenCode npm plugin Request Activation integrity probe failed: ${error.message}`);
  }
}

const hooksConfig = isFile(hooksConfigPath) ? readJson(hooksConfigPath, "Codex plugin hooks config") : null;
if (hooksConfig) {
  if (JSON.stringify(Object.keys(hooksConfig.hooks ?? {}).sort()) !== JSON.stringify(["SessionStart"])) {
    failures.push("shared plugin hooks must expose SessionStart only");
  }
  const sessionStartGroups = hooksConfig.hooks?.SessionStart;
  if (!Array.isArray(sessionStartGroups) || sessionStartGroups.length === 0) failures.push("Codex plugin hooks config must define SessionStart hooks");
  const sessionStartCommands = sessionStartGroups?.flatMap((group) => group?.hooks ?? []) ?? [];
  if (!sessionStartCommands.some((hook) => hook?.type === "command" && String(hook?.command ?? "").includes("agdf-session-check.js"))) {
    failures.push("Codex plugin SessionStart hooks must load the fixed automatic runtime-check entrypoint");
  }
  const sessionStartCommandText = sessionStartCommands.map((hook) => String(hook?.command ?? "")).join("\n");
  if (!sessionStartCommandText.includes("PLUGIN_ROOT")) failures.push("Codex plugin SessionStart hook command must use PLUGIN_ROOT");
  if (!sessionStartCommands.every((hook) => String(hook?.commandWindows ?? "").includes("agdf-session-check.js"))) failures.push("Codex plugin SessionStart hooks must define a native Windows command");
  if (sessionStartCommandText.includes("/plugins/cache/*/")) failures.push("Codex plugin SessionStart hook command must not use cache wildcards");
}

if (pluginDefinition) {
  const capability = pluginDefinition.automaticRuntimeChecks;
  if (capability?.schemaVersion !== 1 || capability?.entrypoint !== "runtime/agdf-session-check.js"
      || capability?.constraints?.arguments !== "forbidden"
      || capability?.constraints?.filesystemWrites !== "forbidden"
      || capability?.constraints?.network !== "forbidden"
      || capability?.constraints?.gateAuthority !== "none") {
    failures.push("Canonical automatic runtime-check capability must remain argument-free, read-only, offline and non-authorizing");
  }
  if (capability?.surfaces?.["portable-skills"] !== "manual-external-required") {
    failures.push("Portable public Skills profile must not claim automatic runtime checks");
  }
  if (capability?.surfaces?.copilot !== "plugin-hook-review") {
    failures.push("Copilot automatic runtime checks must remain subject to plugin hook review");
  }
}

if (!sourceMode && installationProvenance?.profile_id === "copilot-runtime-plugin") {
  const copilotPlugin = isFile(copilotPluginPath) ? readJson(copilotPluginPath, "Copilot plugin manifest") : null;
  const copilotHooks = isFile(copilotHooksPath) ? readJson(copilotHooksPath, "Copilot plugin hooks") : null;
  if (!copilotPlugin) failures.push("installed runtime plugin must include root plugin.json for GitHub Copilot");
  if (copilotPlugin && (copilotPlugin.name !== "agdf" || copilotPlugin.version !== pluginDefinition?.version
      || copilotPlugin.skills !== "copilot-skills/" || copilotPlugin.hooks !== "hooks/copilot-hooks.json")) {
    failures.push("Copilot root plugin manifest must preserve AGDF identity, version and generated component paths");
  }
  const copilotSessionStart = copilotHooks?.hooks?.sessionStart;
  if (JSON.stringify(Object.keys(copilotHooks?.hooks ?? {}).sort()) !== JSON.stringify(["sessionStart"])) {
    failures.push("Copilot hooks must expose sessionStart only");
  }
  if (!Array.isArray(copilotSessionStart) || !copilotSessionStart.some((hook) => hook?.type === "command"
      && hook?.command === 'node "${PLUGIN_ROOT}/runtime/agdf-session-check.js"'
      && hook?.env?.AGDF_SURFACE === "copilot")) {
    failures.push("Copilot hooks must declare the fixed consent-bound AGDF sessionStart command");
  }
  for (const skill of pluginDefinition?.skillSet ?? []) {
    if (!skillSlugPattern.test(skill?.slug ?? "")) continue;
    assertFile(join(pluginRoot, "copilot-skills", `agdf-${skill.slug}`, "SKILL.md"), `Copilot prefixed plugin skill agdf-${skill.slug}`);
  }
}

if (isFile(sessionStartHookPath)) {
  const sessionStartHook = read(sessionStartHookPath);
  for (const required of [
    "Compatibility transport only",
    'SESSION_CHECK="${SCRIPT_DIR}/../runtime/agdf-session-check.js"',
    'exec node "${SESSION_CHECK}"',
    "AGDF SessionStart transport unavailable: generated runtime entrypoint not found.",
  ]) {
    if (!sessionStartHook.includes(required)) failures.push(`AGDF SessionStart compatibility transport missing: ${required}`);
  }
  if (/agdf-agent-router|agdf-constitution|agdf-runtime-contract|\.agdf\/control|Language policy|Request Activation Guard/iu.test(sessionStartHook)) {
    failures.push("AGDF SessionStart compatibility transport must not own model-visible policy or repository inspection");
  }
}

const footprintSessionEntrypoint = sourceMode
  ? join(repoRoot, "create-agdf", "generated", "plugins", "agdf", "runtime", "agdf-session-check.js")
  : automaticRuntimeCheckPath;
if (pluginDefinition && canonicalRequestActivationGuard && isFile(footprintSessionEntrypoint)) {
  const records = [];
  for (const surface of ["codex", "claude", "copilot"]) {
    const probe = spawnSync(process.execPath, [footprintSessionEntrypoint], {
      cwd: sourceMode ? repoRoot : pluginRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        AGDF_DATA_DIR: join(sourceMode ? repoRoot : pluginRoot, ".agdf-runtime-integrity-no-consent"),
        AGDF_SURFACE: surface,
      },
    });
    if (probe.status !== 0) {
      failures.push(`SessionStart footprint probe failed for ${surface}: ${probe.stderr.trim()}`);
      continue;
    }
    try {
      const transported = surface === "copilot" ? JSON.parse(probe.stdout).additionalContext : probe.stdout;
      const content = normalizeLf(transported).replace(/\n$/u, "");
      const bindingLine = content.split("\n").find((line) => line.startsWith("AGDF dispatcher binding: "));
      const binding = JSON.parse(bindingLine.slice("AGDF dispatcher binding: ".length));
      const routeSource = binding.route_source_after_activation;
      const routeSourcePath = routeSource?.relative_to === "validator_directory" && typeof routeSource.path === "string"
        ? resolve(dirname(binding.argv_prefix[0]), routeSource.path)
        : "";
      if (!routeSourcePath || !isFile(routeSourcePath)) {
        throw new Error("post-activation route source is missing or unresolved");
      }
      const routeSourceContent = read(routeSourcePath);
      if (!routeSourceContent.includes(requestActivationMarkers.operationsStart)
          || !routeSourceContent.includes(requestActivationMarkers.operationsEnd)
          || !routeSourceContent.includes(canonicalRequestActivationGuard)) {
        throw new Error("post-activation route source is not the packaged canonical operation catalog");
      }
      records.push({
        id: surface,
        content,
        dynamicValues: { executable: binding.executable, validator: binding.argv_prefix[0] },
      });
    } catch (error) {
      failures.push(`SessionStart footprint output is invalid for ${surface}: ${error.message}`);
    }
  }
  const report = validateInstructionFootprintProfile({
    definition: pluginDefinition.instructionFootprint,
    canonicalKernel: canonicalRequestActivationGuard,
    expectedVersion: pluginDefinition.version,
    expectedInstanceIds: { sessionStartBase: ["codex", "claude", "copilot"] },
    surfaces: { sessionStartBase: records },
    requiredSurfaceIds: ["sessionStartBase"],
  });
  for (const finding of report.failures) failures.push(`${finding.code}: ${finding.message}`);
}

if (isFile(agentRouterPath)) {
  const agentRouter = read(agentRouterPath);
  assertRouterMatchesDefinition("plugin/meta/agdf-agent-router.md", agentRouter, "codex");
  const routerGuard = ownedBlock(
    agentRouter,
    requestActivationMarkers.guardStart,
    requestActivationMarkers.guardEnd,
    "plugin/meta/agdf-agent-router.md request activation guard",
  );
  if (routerGuard && canonicalRequestActivationGuard && routerGuard !== canonicalRequestActivationGuard) {
    failures.push("plugin/meta/agdf-agent-router.md request activation guard must be byte-identical to the canonical source block");
  }
  const expectedRoutingBlock = [
    requestActivationMarkers.skillRoutingStart,
    "| Skill | Use For | Boundary |",
    "|---|---|---|",
    ...(pluginDefinition?.skillSet ?? []).map((skill) => routingRowForSurface(skill, "codex")),
    requestActivationMarkers.skillRoutingEnd,
  ].join("\n");
  const routingBlock = ownedBlock(
    agentRouter,
    requestActivationMarkers.skillRoutingStart,
    requestActivationMarkers.skillRoutingEnd,
    "plugin/meta/agdf-agent-router.md skill routing",
  );
  if (routingBlock && routingBlock !== expectedRoutingBlock) {
    failures.push("plugin/meta/agdf-agent-router.md skill routing must exactly match definition order and metadata");
  }
  const activationOrder = [
    "## Surface Convention",
    "## Request Activation",
    "## Task Target Resolution",
    "## Mode Selection",
  ];
  const positions = activationOrder.map((heading) => {
    const count = countOccurrences(agentRouter, heading);
    if (count !== 1) failures.push(`plugin/meta/agdf-agent-router.md must contain exactly one ${heading}; found ${count}`);
    return agentRouter.indexOf(heading);
  });
  if (!positions.every((position, index) => position >= 0 && (index === 0 || position > positions[index - 1]))) {
    failures.push("plugin/meta/agdf-agent-router.md must order Surface Convention -> Request Activation -> Task Target Resolution -> Mode Selection");
  }
  if (!agentRouter.includes("Only after positive Request Activation, and only for a target-bound route")
      || !agentRouter.includes("A request that abstained or remained an\nordinary read-only request never enters AGDF Mode Selection or Quick Task handling.")) {
    failures.push("plugin/meta/agdf-agent-router.md must keep target and mode routing downstream of positive Request Activation");
  }
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
  const runtimeContract = readAllContracts();
  for (const required of [
    "## Native Interaction Contract",
    "`clarification`: asks for missing intent",
    "`tool_permission`: requests host-owned authority",
    "`gate_approval`: requests deliberate user input",
    "auto_resolution: forbidden for gate_approval",
    "response_origin: deliberate_user_input for gate_approval",
    "re-run canonical gate evaluation against the same `run_id` and expected gate immediately before persistence",
    "Host permission, plan approval, native question presentation, timeout/default behavior, hook output and agent messages never carry AGDF gate authority by themselves",
  ]) {
    if (!runtimeContract.includes(required)) failures.push(`runtime contract Native Interaction Contract missing: ${required}`);
  }
  for (const adapter of ["request_user_input", "AskUserQuestion", "permission.question", "Exact textual approvals remain canonical"]) {
    if (!runtimeContract.includes(adapter)) failures.push(`runtime contract Native Interaction Contract missing surface/fallback mapping: ${adapter}`);
  }
  if (!runtimeContract.includes("Approval of one user gate permits work on the next allowed gate artefact or required internal step only")) {
    failures.push("runtime contract must state that one gate approval only permits the next gate artefact or required internal step");
  }
  if (!runtimeContract.includes("`Approval: UR` permits Brownfield Review after G-00 first. The review records its Mode/Slice Decision in the same internal operation")) {
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
  const gateRulesProse = normalizeProse(sectionAfterHeading(gateTransitionContract, "Gate Rules"));
  const gateRulesSearch = gateRulesProse.toLowerCase();
  const missingControlRuleStart = gateRulesSearch.indexOf("- after positive request activation and task-target resolution, missing control files");
  const missingControlRuleEnd = gateRulesSearch.indexOf("- `approval: ur` permits", missingControlRuleStart);
  const missingControlRule = missingControlRuleStart >= 0 && missingControlRuleEnd > missingControlRuleStart
    ? gateRulesSearch.slice(missingControlRuleStart, missingControlRuleEnd)
    : "";
  const missingControlSetup = missingControlRule.indexOf("obtain explicit setup or link authority");
  const missingControlPersistence = missingControlRule.indexOf("persist", missingControlSetup);
  const missingControlApproval = missingControlRule.indexOf("approval: ur", missingControlPersistence);
  if (!missingControlRule
      || !missingControlRule.includes("drafting the current minimal ur")
      || !missingControlRule.includes("forbid later-gate work, implementation and every gate-approval request")
      || missingControlSetup < 0
      || missingControlPersistence < 0
      || missingControlApproval < 0
      || !(missingControlSetup < missingControlPersistence
        && missingControlPersistence < missingControlApproval)) {
    failures.push("gate-transition contract must require setup/link authority and durable persistence before Approval: UR for missing control");
  }
  if (missingControlRule.includes("then request `approval: ur`. this branch is unreachable for `target_unresolved`. initialize or write `.agdf/control/`")) {
    failures.push("gate-transition contract must not request Approval: UR before missing-control setup and persistence");
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
  const requestActivationHeadingCount = countOccurrences(skillMd, "## Request Activation");
  if (requestActivationHeadingCount !== 1) {
    failures.push(`${skill} must contain exactly one Request Activation heading; found ${requestActivationHeadingCount}`);
  }
  const skillSlug = pluginDefinition?.codex?.skillPrefix && skill.startsWith(pluginDefinition.codex.skillPrefix)
    ? skill.slice(pluginDefinition.codex.skillPrefix.length)
    : skill;
  const skillDefinition = (pluginDefinition?.skillSet ?? []).find((entry) => entry.slug === skillSlug);
  const skillGuard = ownedBlock(
    skillMd,
    requestActivationMarkers.guardStart,
    requestActivationMarkers.guardEnd,
    `${skill} request activation guard`,
  );
  if (skillGuard && canonicalRequestActivationGuard && skillGuard !== canonicalRequestActivationGuard) {
    failures.push(`${skill} request activation guard must be byte-identical to the canonical source block`);
  }
  if (skillGuard && skillMd.indexOf(requestActivationMarkers.guardEnd) > skillMd.indexOf("## Executable Dispatch")) {
    failures.push(`${skill} request activation guard must precede executable dispatch`);
  }
  if (canonicalSkillDispatchProjection) {
    if (countOccurrences(skillMd, canonicalSkillDispatchProjection) !== 1) {
      failures.push(`${skill} must contain exactly one byte-identical projection of the canonical skill dispatch semantics`);
    }
    if (skillMd.includes(canonicalSkillDispatchProjection)
        && skillMd.indexOf(canonicalSkillDispatchProjection) < skillMd.indexOf("## Executable Dispatch")) {
      failures.push(`${skill} skill dispatch semantics must remain inside the executable dispatch boundary`);
    }
  }
  if (skillDefinition && activationDiscoverySuffix) {
    const expectedDescription = `description: ${JSON.stringify(expectedSkillDescription(skillDefinition, activationDiscoverySuffix))}`;
    if ((skillMd.match(/^description:.*$/gm) ?? []).length !== 1 || !skillMd.includes(expectedDescription)) {
      failures.push(`${skill} frontmatter description must derive exactly from skillSet useFor/boundary and the activation suffix`);
    }
  }
  for (const required of [
    "## Executable Dispatch",
    `--skill ${skill}`,
    "`terminal: true`",
    "`dispatcher_unavailable`",
  ]) {
    if (!skillMd.includes(required)) failures.push(`${skill} executable dispatch boundary missing: ${required}`);
  }
  if (skill === "gate-check") {
    for (const required of [
      "../../meta/contracts/task-target-resolution.md",
      "../../meta/contracts/gate-transition.md",
      "../../meta/contracts/interaction.md",
      "../../meta/contracts/control-scaffold.md",
      "../../meta/contracts/modes.md",
      "../../meta/contracts/quality.md",
      "## Declared `instruction_only` Fallback",
    ]) {
      if (!skillMd.includes(required)) failures.push(`${skill} instruction-only dispatch fallback missing: ${required}`);
    }
  } else if (!skillMd.includes("`instruction_only`: first load `../../meta/contracts/task-target-resolution.md` and `../../meta/contracts/interaction.md`.")) {
    failures.push(`${skill} instruction-only dispatch fallback is incomplete`);
  }
  if ((skillMd.match(/^## Executable Dispatch$/gm) ?? []).length !== 1) failures.push(`${skill} must contain exactly one executable dispatch boundary`);
  if (skill !== "gate-check" && !skillMd.includes("`skill_continuation`")) failures.push(`${skill} judgement dispatch must consume skill_continuation`);
  if (skillMd.includes("## Task Target Orientation Template")
      || skillMd.includes("| Primary target | Governance target | Evidence sources |")) {
    failures.push(`${skill} must not maintain a skill-local task target orientation template`);
  }
  if (skill === "gate-check") {
    if (skillMd.includes("## Gate Transitions") || skillMd.includes("## Gate Order") || skillMd.includes("| State | Current gate or step | Allowed | Forbidden | Missing approval |")) {
      failures.push("gate-check must not duplicate the Runtime Contract gate transition table");
    }
    if (/## Native Interaction Path|## Repository Activation Diagnosis|## OpenCode Passive Hook Boundary/u.test(skillMd)) {
      failures.push("gate-check must keep focused-contract handbooks out of the compact selected skill");
    }
  } else if (skill === "qa-gate") {
    for (const required of [
      "## Resolved Target Run And Evidence Discovery",
      "Select exactly one run whose objective matches the request",
      "request\n   one run selection and stop before a QA decision",
      "Do not ask the user to paste or relink repository files that the skill can read itself",
      "emit exactly one\n   `pass | revise | block` decision",
      "must not reconstruct or promise a Run Status\nCard, Gate Transition Card, native QA card or interactive QA card",
    ]) {
      if (!skillMd.includes(required)) failures.push(`qa-gate evidence-discovery boundary missing: ${required}`);
    }
  }
  if (skill === "release-or") {
    const rulesSection = skillMd.match(/## Rules\r?\n([\s\S]*?)(?=\r?\n## )/)?.[1] ?? "";
    const ruleNumbers = [...rulesSection.matchAll(/^(\d+)\. /gm)].map((match) => Number(match[1]));
    const expectedRuleNumbers = ruleNumbers.map((_, index) => index + 1);
    if (ruleNumbers.length === 0 || JSON.stringify(ruleNumbers) !== JSON.stringify(expectedRuleNumbers)) {
      failures.push(`release-or Rules numbering must be sequential from 1, got ${ruleNumbers.join(", ") || "none"}`);
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
  ["plugin/meta/contracts/*.md", readAllContracts()],
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
const uxIntentTemplatePath = join(controlRoot, "templates", "artefacts", "UX_INTENT_DEFINITION.md");
const prdTemplatePath = join(controlRoot, "templates", "artefacts", "PRD.md");
const verifiedChangeTemplatePath = join(controlRoot, "templates", "artefacts", "VERIFIED_CHANGE.md");
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
  for (const required of [
    "Existing-System View",
    "Reuse And Parallel-Structure Risk",
    "Mode / Slice Decision",
    "transparency_note",
    "Next Permissible Step",
    "delivery_context",
    "ui_ux_impact",
    "ui_ux_impact_reason",
    "ux_intent_definition_required",
    "ux_intent_definition_result",
    "Structured Depth Evidence",
    "depth_policy_version",
    "depth_facts_status",
    "primary_reason_code",
    "decisive_full_depth_triggers",
    "rejected_alternative",
    "missing_or_conflicting_facts",
    "depth_evidence_refs",
    "coherent_outcome",
    "authority_boundary",
    "owner_consumer_coordination",
    "full_depth_impacts_absent",
    "migration_propagation_bounded",
    "failure_recovery_local",
    "independently_acceptable",
  ]) {
    if (!brownfieldReviewTemplate.includes(required)) failures.push(`BROWNFIELD_REVIEW.md missing control field: ${required}`);
  }
}

if (isFile(uxIntentTemplatePath)) {
  const template = read(uxIntentTemplatePath);
  for (const required of ["Decision: ready | blocked | not_applicable", "effective_state_authority_by_mode", "primary_state_presentation_owner_by_mode", "recovery_paths", "Proposed PRD Acceptance Criteria", "non-authorizing analytical input"]) {
    if (!template.includes(required)) failures.push(`UX_INTENT_DEFINITION.md missing contract field: ${required}`);
  }
  if (/^Gate:|^Gate approval:|Approval:/m.test(template)) failures.push("UX_INTENT_DEFINITION.md must not carry gate or approval authority");
}

if (isFile(prdTemplatePath)) {
  const template = read(prdTemplatePath);
  for (const required of ["UX Intent And Success", "Working Modes And Effective State", "effective_state_authority", "primary_state_presentation_owner", "Activation, Blockers, Recovery And Transitions", "visible retry", "stable `criterion_id`"]) {
    if (!template.includes(required)) failures.push(`PRD.md missing mandatory UX requirement: ${required}`);
  }
}

if (isFile(join(skillRoot, "ux-intent-definition", "SKILL.md"))) {
  const skill = read(join(skillRoot, "ux-intent-definition", "SKILL.md"));
  for (const required of ["ready | blocked | not_applicable", "effective_state_authority_by_mode", "primary_state_presentation_owner_by_mode", "A required blocked result prevents PRD readiness", "not a user gate"]) {
    if (!skill.includes(required)) failures.push(`ux-intent-definition SKILL.md missing invariant: ${required}`);
  }
}

const normalizedGapFieldOrder = "finding_id | gap_type | routing_target | gap_status | evidence | required_next_step";
const normalizedGapMappingHeader = "| gap_type | meaning | routing_target |";
const qualityContractPath = join(contractsDir, "quality.md");
if (isFile(qualityContractPath)) {
  const contract = read(qualityContractPath);
  for (const required of [
    "## Normalized Review Gaps",
    normalizedGapFieldOrder,
    "requirements_gap",
    "design_gap",
    "plan_gap",
    "implementation_gap",
    "evidence_gap",
    "emergent_risk",
    "UR | PRD | SD | TP | CD+Tests | evidence_obligation",
    "gap_status` is exactly `open | resolved",
    "It is not a seventh normalized finding type",
  ]) {
    if (!contract.includes(required)) failures.push(`quality contract missing normalized review-gap invariant: ${required}`);
  }
}

for (const skillName of ["task-plan-review", "clean-implementation-review", "code-review", "qa-gate"]) {
  const path = join(skillRoot, skillName, "SKILL.md");
  if (!isFile(path)) continue;
  const skill = read(path);
  for (const required of ["§Normalized Review Gaps", "fail closed"]) {
    if (!skill.includes(required)) failures.push(`${skillName} SKILL.md missing normalized review-gap consumer invariant: ${required}`);
  }
  if (skillName !== "qa-gate" && !skill.includes(normalizedGapFieldOrder)) {
    failures.push(`${skillName} SKILL.md missing normalized finding field order`);
  }
  if (skill.includes(normalizedGapMappingHeader)) {
    failures.push(`${skillName} SKILL.md must not duplicate the complete normalized gap mapping`);
  }
}

if (isFile(join(skillRoot, "task-plan-review", "SKILL.md"))) {
  const skill = read(join(skillRoot, "task-plan-review", "SKILL.md"));
  for (const required of ["## UX Intent Fidelity", "prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type", "requirements_gap", "not_verifiable"]) {
    if (!skill.includes(required)) failures.push(`task-plan-review SKILL.md missing UX fidelity invariant: ${required}`);
  }
}

if (isFile(join(skillRoot, "qa-gate", "SKILL.md"))) {
  const skill = read(join(skillRoot, "qa-gate", "SKILL.md"));
  for (const required of ["UX Intent Fidelity", "visible evidence", "requirements_gap"]) {
    if (!skill.includes(required)) failures.push(`qa-gate SKILL.md missing UX fidelity consumption: ${required}`);
  }
}

if (isFile(verifiedChangeTemplatePath)) {
  const verifiedChangeTemplate = read(verifiedChangeTemplatePath);
  for (const required of ["related_ur", "canonical_owner", "allowed_source_paths", "allowed_derived_paths", "baseline_tracked_paths", "baseline_untracked_paths", "escalation_target", "validation_commands"]) {
    if (!new RegExp(`^- ${required}:`, "m").test(verifiedChangeTemplate)) failures.push(`VERIFIED_CHANGE.md missing control field: ${required}`);
  }
  if (!/^## Mini-Closeout$/m.test(verifiedChangeTemplate)) failures.push("VERIFIED_CHANGE.md missing control field: Mini-Closeout");
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

console.log(`[agdf-runtime-integrity] ok (mode=${validationMode}; ${expectedSkills.length} skills and ${expectedControlFiles.length} control files checked)`);
