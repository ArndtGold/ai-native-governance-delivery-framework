import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { syncPluginRuntime } from "./sync-plugin-runtime.js";
import {
  renderClaudePluginManifest,
  renderCodexPluginManifest,
  renderCopilotPluginManifest,
} from "../lib/public-plugin/manifest.js";
import { buildPublicPluginCandidate } from "../lib/public-plugin/builder.js";
import {
  buildCopilotPayloadInventory,
  validateCopilotPayload,
} from "../lib/public-plugin/copilot-profile.js";
import {
  REQUEST_ACTIVATION_MARKERS,
  computeRequestActivationGuardFingerprint,
  getRuntimeContractModulePaths,
  syncRequestActivationProjections,
} from "./sync-request-activation-projections.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const repoRoot = resolve(packageRoot, "..");
const sourceAgentsPath = join(repoRoot, "plugin", "meta", "agdf-agent-router.md");
const sourceSkillsRoot = join(repoRoot, "plugin", "skills");
const sourceControlRoot = join(repoRoot, "plugin", "control");
const sourcePluginRoot = join(repoRoot, "plugin");
const sourceContractsRoot = join(repoRoot, "plugin", "meta", "contracts");
const sourceInteractionLocalesPath = join(repoRoot, "plugin", "meta", "agdf-interaction-locales.json");
const pluginDefinitionPath = join(repoRoot, "plugin", "meta", "agdf-plugin.definition.json");
const pluginDefinition = JSON.parse(read(pluginDefinitionPath));
const sourceRuntimeContractPath = join(sourcePluginRoot, pluginDefinition.runtimeContract.manifestPath);
const contractModules = getRuntimeContractModulePaths(pluginDefinition)
  .map((modulePath) => modulePath.slice("meta/contracts/".length));
const generatedRoot = join(packageRoot, "generated");
const generatedControlRoot = join(generatedRoot, ".agdf", "control");
const generatedCodexPluginRoot = join(generatedRoot, "plugins", "agdf");
const generatedCopilotPluginRoot = join(generatedRoot, "plugins", "copilot", "agdf");
const generatedOpenCodeRoot = join(generatedRoot, ".opencode");
const generatedOpenCodeAgentsRoot = join(generatedOpenCodeRoot, "agents");
const generatedOpenCodeSkillsRoot = join(generatedOpenCodeRoot, "skills");
const openCodeRouterFileName = "agdf-agent-router.md";
const generatedCopilotPluginSkillsRoot = join(generatedCopilotPluginRoot, pluginDefinition.copilot.skills);
const interactionLocaleFileName = pluginDefinition.interactions.localeRegistry.split("/").at(-1);
const copilotBaselinePath = join(repoRoot, "plugin", "meta", "copilot-payload-baseline.json");
const copilotMappings = [];

function read(path) {
  return readFileSync(path, "utf8");
}

function write(path, content) {
  if (isWithinRoot(generatedRoot, path)) assertGeneratedPathSafe(path, "generated write target");
  mkdirSync(dirname(path), { recursive: true });
  if (isWithinRoot(generatedRoot, path)) assertGeneratedPathSafe(path, "generated write target");
  // Generated text must remain byte-identical across autocrlf checkouts.
  writeFileSync(path, content.replaceAll("\r\n", "\n"), "utf8");
}

function isWithinRoot(root, path) {
  const relativePath = relative(resolve(root), resolve(path));
  return relativePath === "" || (!isAbsolute(relativePath) && relativePath !== ".." && !relativePath.startsWith(`..${sep}`));
}

function assertGeneratedPathSafe(path, label) {
  if (!isWithinRoot(generatedRoot, path)) throw new Error(`${label} must stay inside the generated package root`);
  const absoluteRoot = resolve(generatedRoot);
  const absolutePath = resolve(path);
  const relativePath = relative(absoluteRoot, absolutePath);
  let current = absoluteRoot;
  for (const segment of relativePath ? relativePath.split(sep) : []) {
    current = join(current, segment);
    if (!existsSync(current)) break;
    const stats = lstatSync(current);
    if (stats.isSymbolicLink()) throw new Error(`${label} must not traverse symbolic links: ${relativePath}`);
  }
  return absolutePath;
}

function prepareGeneratedDirectory(path, label) {
  assertGeneratedPathSafe(path, label);
  mkdirSync(path, { recursive: true });
  assertGeneratedPathSafe(path, label);
}

function removeGeneratedPath(path, label) {
  assertGeneratedPathSafe(path, label);
  rmSync(path, { recursive: true, force: true });
}

function removeUnexpectedGeneratedEntries(root, expectedEntries, label) {
  prepareGeneratedDirectory(root, label);
  for (const entry of readdirSync(root)) {
    if (!expectedEntries.has(entry)) removeGeneratedPath(join(root, entry), `${label} stale entry`);
  }
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function copilotDestination(path) {
  return path.slice(generatedCopilotPluginRoot.length + 1).replaceAll("\\", "/");
}

function writeCopilot(path, content, { component, owner, rule, requirement, source } = {}) {
  write(path, content);
  copilotMappings.push({
    destination: copilotDestination(path),
    component,
    owner,
    rule,
    requirement,
    ...(source ? { source, sourceDigest: sha256(read(join(repoRoot, source))) } : {}),
  });
}

function mapGeneratedDirectory(root, metadata) {
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    const stats = lstatSync(path);
    if (stats.isSymbolicLink()) throw new Error(`generated Copilot inventory must not traverse symbolic links: ${path}`);
    if (stats.isDirectory()) mapGeneratedDirectory(path, metadata);
    else if (stats.isFile()) copilotMappings.push({ destination: copilotDestination(path), ...metadata });
  }
}

function syncDirectory(sourceRoot, targetRoot) {
  prepareGeneratedDirectory(targetRoot, "exact generated directory");
  const sourceEntries = new Set(readdirSync(sourceRoot));
  for (const entry of readdirSync(targetRoot)) {
    if (!sourceEntries.has(entry)) removeGeneratedPath(join(targetRoot, entry), "exact generated directory stale entry");
  }
  for (const entry of sourceEntries) {
    const sourcePath = join(sourceRoot, entry);
    const targetPath = join(targetRoot, entry);
    const stats = lstatSync(sourcePath);
    if (stats.isSymbolicLink()) throw new Error(`source directory sync must not traverse symbolic links: ${sourcePath}`);

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
  prepareGeneratedDirectory(targetRoot, "generated plugin directory");
  const sourceEntries = new Set(readdirSync(sourceRoot).filter((entry) => entry !== "runtime"));
  for (const entry of readdirSync(targetRoot)) {
    if (!sourceEntries.has(entry)) removeGeneratedPath(join(targetRoot, entry), "generated plugin stale entry");
  }
  for (const entry of readdirSync(sourceRoot)) {
    if (entry === "runtime") continue;

    const sourcePath = join(sourceRoot, entry);
    const targetPath = join(targetRoot, entry);
    const stats = lstatSync(sourcePath);
    if (stats.isSymbolicLink()) throw new Error(`plugin source sync must not traverse symbolic links: ${sourcePath}`);

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

function replaceUniqueRouterSection(content, startHeading, endHeading, replacement) {
  const startCount = content.split(startHeading).length - 1;
  const endCount = content.split(endHeading).length - 1;
  if (startCount !== 1 || endCount !== 1) {
    throw new Error(`OpenCode router transform requires exactly one ${startHeading} and one ${endHeading}`);
  }
  const start = content.indexOf(startHeading);
  const end = content.indexOf(endHeading, start);
  if (end <= start) throw new Error(`OpenCode router section order is invalid: ${startHeading} -> ${endHeading}`);
  return `${content.slice(0, start)}${replacement}\n\n${content.slice(end)}`;
}

function extractUniqueBlock(content, startMarker, endMarker, label) {
  const startCount = content.split(startMarker).length - 1;
  const endCount = content.split(endMarker).length - 1;
  if (startCount !== 1 || endCount !== 1) {
    throw new Error(`${label} requires exactly one complete marker pair; found ${startCount}/${endCount}`);
  }
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker, start) + endMarker.length;
  if (end <= start) throw new Error(`${label} markers are out of order`);
  return content.slice(start, end);
}

export function toOpenCodeInstructionsRouter(content) {
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

  const transformed = toOpenCodeSkillContent(content)
    .replace("# AGDF Agent Router", "# AGDF OpenCode instructions")
    .replace(
      "You are operating inside the AGDF plugin namespace.",
      "You are operating in an OpenCode project configured with AGDF.",
    )
    .replace(
      "Use the plugin skills as workflow controls, not as documentation shortcuts.",
      "Use the native AGDF skills as workflow controls, not as documentation shortcuts.",
    );
  const bounded = replaceUniqueRouterSection(
    transformed,
    "## Surface Convention",
    REQUEST_ACTIVATION_MARKERS.guardStart,
    openCodeSurfaceConvention,
  );
  const canonicalGuard = extractUniqueBlock(
    read(join(sourceContractsRoot, "request-activation.md")),
    REQUEST_ACTIVATION_MARKERS.guardStart,
    REQUEST_ACTIVATION_MARKERS.guardEnd,
    "canonical Request Activation guard",
  );
  const projectedGuard = extractUniqueBlock(
    bounded,
    REQUEST_ACTIVATION_MARKERS.guardStart,
    REQUEST_ACTIVATION_MARKERS.guardEnd,
    "OpenCode Request Activation guard",
  );
  if (projectedGuard !== canonicalGuard) {
    throw new Error("OpenCode Request Activation guard must be byte-identical to the canonical contract projection");
  }
  const guardFingerprint = computeRequestActivationGuardFingerprint(projectedGuard);
  if (!projectedGuard.includes(`- \`guard_fingerprint\`: \`${guardFingerprint}\``)) {
    throw new Error("OpenCode Request Activation guard fingerprint must match its projected bytes");
  }
  const orderedHeadings = [
    "## Surface Convention",
    "## Request Activation",
    "## Task Target Resolution",
    "## Mode Selection",
  ];
  const positions = orderedHeadings.map((heading) => {
    const count = bounded.split(heading).length - 1;
    if (count !== 1) throw new Error(`OpenCode router projection requires exactly one ${heading}; found ${count}`);
    return bounded.indexOf(heading);
  });
  if (!positions.every((position, index) => index === 0 || position > positions[index - 1])) {
    throw new Error("OpenCode router order must remain Surface Convention -> Request Activation -> Task Target Resolution -> Mode Selection");
  }
  return bounded;
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

export function toOpenCodeInstructionsBootstrap() {
  const activationKernel = extractUniqueBlock(
    read(join(sourceContractsRoot, "request-activation.md")),
    REQUEST_ACTIVATION_MARKERS.guardStart,
    REQUEST_ACTIVATION_MARKERS.guardEnd,
    "canonical Request Activation kernel",
  );
  return [
    "# AGDF OpenCode bootstrap",
    "",
    activationKernel,
    "",
    "## On-demand resources",
    "",
    "- After positive Request Activation, load the selected native AGDF skill; governed delivery starts with `agdf-gate-check`.",
    `- Load the full router from the sibling \`${openCodeRouterFileName}\` only when routing detail is needed.`,
    "- Focused contracts and the runtime contract remain available from the sibling `contracts/` directory and `agdf-runtime-contract.md`.",
    "",
  ].join("\n");
}

function writeOpenCodeInstructions() {
  write(join(generatedOpenCodeRoot, pluginDefinition.opencode.instructionsFileName), toOpenCodeInstructionsBootstrap());
  write(join(generatedOpenCodeRoot, openCodeRouterFileName), toOpenCodeInstructionsRouter(read(sourceAgentsPath)));
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

  removeUnexpectedGeneratedEntries(
    join(generatedOpenCodeSkillsRoot, targetName),
    new Set(["SKILL.md"]),
    `generated OpenCode skill ${targetName}`,
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
    `- The eager \`${pluginDefinition.opencode.instructionsFileName}\` is a micro-bootstrap; \`${openCodeRouterFileName}\` retains the full on-demand router.`,
    "- Preserve an explicit user `permission.question: deny`; AGDF then uses exact textual approval and never interprets OpenCode permission outcomes or auto mode as gate authority.",
    "- After positive Request Activation selects actual delivery work, load `agdf-global-gate-check` through OpenCode's native `skill` tool. Unclear approval alone never activates AGDF.",
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
  removeUnexpectedGeneratedEntries(
    join(generatedOpenCodeRoot, "contracts"),
    new Set(contractModules),
    "generated OpenCode contract directory",
  );
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
  writeCopilot(join(generatedCopilotPluginSkillsRoot, pluginDefinition.copilot.runtimeContractFileName), contract, {
    component: "runtime_contract", owner: "plugin/meta/agdf-runtime-contract.md", rule: "copilot_name_projection",
    requirement: "shared gate and output contract", source: "plugin/meta/agdf-runtime-contract.md",
  });
  writeCopilot(join(generatedCopilotPluginSkillsRoot, interactionLocaleFileName), read(sourceInteractionLocalesPath), {
    component: "locale_registry", owner: "plugin/meta/agdf-interaction-locales.json", rule: "copy",
    requirement: "localized interaction presentation", source: "plugin/meta/agdf-interaction-locales.json",
  });
  for (const moduleName of contractModules) {
    const source = read(join(sourceContractsRoot, moduleName))
      .replaceAll("plugin/meta/agdf-interaction-locales.json", interactionLocaleFileName);
    writeCopilot(join(generatedCopilotPluginSkillsRoot, "contracts", moduleName), toCopilotSkillContent(source), {
      component: "runtime_contract_module", owner: `plugin/meta/contracts/${moduleName}`, rule: "copilot_name_projection",
      requirement: "focused runtime contract", source: `plugin/meta/contracts/${moduleName}`,
    });
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
  writeCopilot(join(generatedCopilotPluginSkillsRoot, targetName, "SKILL.md"), normalized, {
    component: "skill", owner: `plugin/skills/${sourceName}/SKILL.md`, rule: "copilot_name_projection",
    requirement: `Copilot skill ${targetName}`, source: `plugin/skills/${sourceName}/SKILL.md`,
  });
}

function writeCopilotPluginFiles() {
  writeCopilot(join(generatedCopilotPluginRoot, pluginDefinition.copilot.pluginManifest), renderCopilotPluginManifest(pluginDefinition), {
    component: "manifest", owner: "plugin/meta/agdf-plugin.definition.json", rule: "render_copilot_manifest",
    requirement: "Copilot plugin discovery", source: "plugin/meta/agdf-plugin.definition.json",
  });
  writeCopilot(join(generatedCopilotPluginRoot, pluginDefinition.copilot.hooks), `${JSON.stringify({
    version: 1,
    hooks: {
      sessionStart: [{
        type: "command",
        command: "node \"${PLUGIN_ROOT}/runtime/agdf-session-check.js\"",
        env: { AGDF_SURFACE: "copilot" },
        timeoutSec: 10,
      }],
    },
  }, null, 2)}\n`, {
    component: "hook", owner: "plugin/meta/agdf-plugin.definition.json", rule: "render_copilot_hook",
    requirement: "consent-bound session start check", source: "plugin/meta/agdf-plugin.definition.json",
  });
  syncCopilotPluginContract();
}

function writeCopilotSupportFiles() {
  for (const source of [
    "plugin/meta/agdf-plugin.definition.json",
    "plugin/meta/agdf-agent-router.md",
    "plugin/meta/agdf-constitution.md",
    "plugin/meta/agdf-runtime-contract.md",
    "plugin/meta/distribution-profile-history.json",
    "LICENSE",
  ]) {
    const destination = source === "LICENSE" ? "LICENSE" : source.replace(/^plugin\//, "");
    writeCopilot(join(generatedCopilotPluginRoot, destination), read(join(repoRoot, source)), {
      component: source === "LICENSE" ? "license" : "runtime_support",
      owner: source,
      rule: "copy",
      requirement: source === "LICENSE" ? "license notice" : "local validator and session orientation dependency",
      source,
    });
  }
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

export function syncPackageAssets({
  projectionCheck = () => syncRequestActivationProjections({ repoRoot, mode: "check" }),
} = {}) {
  copilotMappings.length = 0;
  // Canonical source projections must be current before any source/generated manifest write,
  // deletion, cleanup, copy, or runtime generation begins.
  projectionCheck();
  const skillSlugs = getSkillDirectories().map((skillName) => {
    const prefix = pluginDefinition.codex.skillPrefix;
    return prefix && skillName.startsWith(prefix) ? skillName.slice(prefix.length) : skillName;
  });
  removeUnexpectedGeneratedEntries(
    generatedOpenCodeSkillsRoot,
    new Set(skillSlugs.map((skillSlug) => openCodeSkillName(skillSlug))),
    "generated OpenCode skill directory",
  );

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
  ]) removeGeneratedPath(obsoletePath, "obsolete generated projection");
  removeGeneratedPath(generatedCopilotPluginRoot, "generated Copilot profile");

  syncOpenCodeRuntimeContract();
  syncDirectory(sourceControlRoot, generatedControlRoot);
  syncPluginDirectory(sourcePluginRoot, generatedCodexPluginRoot);
  writeCopilotPluginFiles();
  writeCopilotSupportFiles();
  writeCodexMarketplace();
  writeOpenCodeConfig();
  writeOpenCodeInstructions();
  for (const skillSlug of skillSlugs) {
    syncCopilotPluginSkill(skillSlug);
    writeOpenCodeSkill(skillSlug);
  }
  removeGeneratedPath(generatedOpenCodeAgentsRoot, "retired generated OpenCode agents");
  writeOpenCodeReadme(skillSlugs);
  const generatedCodexRuntimeRoot = assertGeneratedPathSafe(join(generatedCodexPluginRoot, "runtime"), "generated Codex runtime");
  const generatedCopilotRuntimeRoot = assertGeneratedPathSafe(join(generatedCopilotPluginRoot, "runtime"), "generated Copilot runtime");
  syncPluginRuntime({ outputRoot: generatedCodexRuntimeRoot });
  syncPluginRuntime({ outputRoot: generatedCopilotRuntimeRoot });
  mapGeneratedDirectory(join(generatedCopilotPluginRoot, "runtime"), {
    component: "runtime",
    owner: "create-agdf/scripts/sync-plugin-runtime.js",
    rule: "generated_exact_runtime",
    requirement: "offline exact-version validator and session check",
  });
  const copilotBaseline = JSON.parse(read(copilotBaselinePath));
  buildCopilotPayloadInventory({
    profileRoot: generatedCopilotPluginRoot,
    mappings: copilotMappings,
    version: pluginDefinition.version,
    baseline: { max_files: copilotBaseline.max_files, max_bytes: copilotBaseline.max_bytes },
  });
  validateCopilotPayload({
    profileRoot: generatedCopilotPluginRoot,
    repoRoot,
    expectedVersion: pluginDefinition.version,
    expectedSkills: skillSlugs,
    baseline: copilotBaseline,
  });
  const publicPluginOutputRoot = assertGeneratedPathSafe(
    join(packageRoot, "generated", "submissions", "openai", "agdf"),
    "generated public plugin candidate",
  );
  buildPublicPluginCandidate({
    repoRoot,
    outputRoot: publicPluginOutputRoot,
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncPackageAssets();
}
