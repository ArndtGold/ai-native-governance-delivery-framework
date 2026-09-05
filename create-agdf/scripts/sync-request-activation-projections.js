import { createHash } from "node:crypto";
import { lstatSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const defaultRepoRoot = resolve(dirname(scriptPath), "../..");

export const REQUEST_ACTIVATION_MARKERS = Object.freeze({
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

const guardFingerprintPattern = /- `guard_fingerprint`: `sha256:([0-9a-f]{64})`/g;
const operationIdPattern = /^[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)+$/;
const skillSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const requestActivationHeading = "## Request Activation";
const instructionFootprintBudgetIds = Object.freeze([
  "activationKernel",
  "skillDiscoveryDescription",
  "allSkillDiscoveryDescriptions",
  "sessionStartBase",
  "runtimeCheckSupplement",
  "openCodeEagerInstructions",
  "openCodeActiveDynamicContext",
  "openCodeInactiveDynamicContext",
  "openCodeComposedStaticAndActiveDynamic",
  "openCodeCompactionAddition",
  "selectedGateCheckSkill",
]);

function normalizeLf(content) {
  return content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function normalizedUtf8Bytes(content) {
  return Buffer.byteLength(normalizeLf(content), "utf8");
}

function read(path) {
  return normalizeLf(readFileSync(path, "utf8"));
}

function assertSafeExistingFile(root, path, label) {
  const absoluteRoot = resolve(root);
  const absolutePath = resolve(path);
  const relativePath = relative(absoluteRoot, absolutePath);
  if (!relativePath || relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    throw new Error(`${label} must stay inside ${absoluteRoot}`);
  }

  const rootStats = lstatSync(absoluteRoot);
  if (rootStats.isSymbolicLink() || !rootStats.isDirectory()) {
    throw new Error(`request activation projection root must be a regular directory: ${absoluteRoot}`);
  }
  let current = absoluteRoot;
  for (const segment of relativePath.split(sep)) {
    current = join(current, segment);
    let stats;
    try {
      stats = lstatSync(current);
    } catch (error) {
      if (error?.code === "ENOENT") throw new Error(`${label} is missing: ${relativePath}`);
      throw error;
    }
    if (stats.isSymbolicLink()) throw new Error(`${label} must not traverse symbolic links: ${relativePath}`);
  }
  if (!lstatSync(absolutePath).isFile()) throw new Error(`${label} must be a regular file: ${relativePath}`);
  return absolutePath;
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

function countOccurrences(content, needle) {
  if (!needle) return 0;
  return content.split(needle).length - 1;
}

function assertExactlyOne(content, needle, label) {
  const count = countOccurrences(content, needle);
  if (count !== 1) throw new Error(`${label} must occur exactly once; found ${count}`);
}

function extractOwnedBlock(content, startMarker, endMarker, label) {
  assertExactlyOne(content, startMarker, `${label} start marker`);
  assertExactlyOne(content, endMarker, `${label} end marker`);
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker, start) + endMarker.length;
  if (end <= start) throw new Error(`${label} markers are out of order`);
  return content.slice(start, end);
}

function replaceOwnedBlock(content, startMarker, endMarker, replacement, label) {
  const current = extractOwnedBlock(content, startMarker, endMarker, label);
  return content.replace(current, replacement);
}

function sha256(content) {
  return createHash("sha256").update(normalizeLf(content)).digest("hex");
}

export function computeRequestActivationGuardFingerprint(guardBlock) {
  const matches = [...normalizeLf(guardBlock).matchAll(guardFingerprintPattern)];
  if (matches.length !== 1) {
    throw new Error(`request activation guard fingerprint must occur exactly once; found ${matches.length}`);
  }
  const fingerprintInput = normalizeLf(guardBlock).replace(
    guardFingerprintPattern,
    "- `guard_fingerprint`: `sha256:<computed>`",
  );
  return `sha256:${sha256(fingerprintInput)}`;
}

function validateExistingGuardProjection(guardBlock, label) {
  const lines = normalizeLf(guardBlock).split("\n");
  const expectedHeader = [
    REQUEST_ACTIVATION_MARKERS.guardStart,
    requestActivationHeading,
    "",
    "- `owner`: `request_activation_contract`",
    "- `path`: `plugin/meta/contracts/request-activation.md`",
    "- `policy_version`: `1`",
  ];
  if (!expectedHeader.every((line, index) => lines[index] === line)
      || !/^- `guard_fingerprint`: `sha256:[0-9a-f]{64}`$/.test(lines[6] ?? "")
      || lines[7] !== ""
      || lines.at(-1) !== REQUEST_ACTIVATION_MARKERS.guardEnd) {
    throw new Error(`${label} has reordered or manually changed guard metadata`);
  }
  const declaredFingerprint = lines[6].match(/sha256:[0-9a-f]{64}/)?.[0];
  const computedFingerprint = computeRequestActivationGuardFingerprint(guardBlock);
  if (declaredFingerprint !== computedFingerprint) {
    throw new Error(`${label} has a manually changed or fingerprint-mismatched guard block`);
  }
}

function updateExistingGuardProjection(content, desiredGuardBlock, label) {
  const currentGuardBlock = extractOwnedBlock(
    content,
    REQUEST_ACTIVATION_MARKERS.guardStart,
    REQUEST_ACTIVATION_MARKERS.guardEnd,
    label,
  );
  validateExistingGuardProjection(currentGuardBlock, label);
  return content.replace(currentGuardBlock, desiredGuardBlock);
}

function materializeGuardFingerprint(contractContent) {
  const guardBlock = extractOwnedBlock(
    contractContent,
    REQUEST_ACTIVATION_MARKERS.guardStart,
    REQUEST_ACTIVATION_MARKERS.guardEnd,
    "canonical request activation guard",
  );
  const expectedFingerprint = computeRequestActivationGuardFingerprint(guardBlock);
  const desiredGuard = guardBlock.replace(
    guardFingerprintPattern,
    `- \`guard_fingerprint\`: \`${expectedFingerprint}\``,
  );
  return {
    contractContent: contractContent.replace(guardBlock, desiredGuard),
    guardBlock: desiredGuard,
    fingerprint: expectedFingerprint,
  };
}

function extractDiscoverySuffix(contractContent) {
  const block = extractOwnedBlock(
    contractContent,
    REQUEST_ACTIVATION_MARKERS.discoveryStart,
    REQUEST_ACTIVATION_MARKERS.discoveryEnd,
    "request activation discovery suffix",
  );
  const suffix = block
    .split("\n")
    .filter((line) => line !== REQUEST_ACTIVATION_MARKERS.discoveryStart
      && line !== REQUEST_ACTIVATION_MARKERS.discoveryEnd)
    .join("\n")
    .trim();
  if (!suffix || suffix.includes("\n")) {
    throw new Error("request activation discovery suffix must contain exactly one non-empty line");
  }
  return suffix;
}

export function parseRequestActivationOperationCatalog(contractContent) {
  const block = extractOwnedBlock(
    normalizeLf(contractContent),
    REQUEST_ACTIVATION_MARKERS.operationsStart,
    REQUEST_ACTIVATION_MARKERS.operationsEnd,
    "request activation operation catalog",
  );
  const jsonMatch = block.match(/```json\n([\s\S]*?)\n```/);
  const jsonOpenings = block.match(/^```json$/gm) ?? [];
  const fenceClosings = block.match(/^```$/gm) ?? [];
  if (!jsonMatch || jsonOpenings.length !== 1 || fenceClosings.length !== 1) {
    throw new Error("request activation operation catalog must contain exactly one JSON block");
  }
  let catalog;
  try {
    catalog = JSON.parse(jsonMatch[1]);
  } catch (error) {
    throw new Error(`request activation operation catalog is invalid JSON: ${error.message}`);
  }
  if (catalog?.schema_version !== 1 || !Array.isArray(catalog.operations) || !Array.isArray(catalog.derived_operations)) {
    throw new Error("request activation operation catalog must use schema_version 1 with operations and derived_operations arrays");
  }
  return catalog;
}

function validateSkillSet(definition) {
  if (!Array.isArray(definition?.skillSet) || definition.skillSet.length !== 10) {
    throw new Error("pluginDefinition.skillSet must contain exactly ten ordered skills");
  }
  const slugs = new Set();
  for (const skill of definition.skillSet) {
    if (![skill?.slug, skill?.useFor, skill?.boundary, skill?.discovery]
      .every((value) => typeof value === "string" && value.trim() === value && value.length > 0 && !/[\r\n]/.test(value))) {
      throw new Error("every pluginDefinition.skillSet entry must declare slug, discovery, useFor, and boundary");
    }
    if (!skillSlugPattern.test(skill.slug)) throw new Error(`invalid skill slug: ${skill.slug}`);
    if (slugs.has(skill.slug)) throw new Error(`duplicate skill slug: ${skill.slug}`);
    slugs.add(skill.slug);
  }
  return slugs;
}

function validateInstructionFootprint(definition) {
  const footprint = definition?.instructionFootprint;
  if (footprint?.schemaVersion !== 1) {
    throw new Error("instructionFootprint.schemaVersion must be 1");
  }
  if (footprint.measurement?.encoding !== "utf8" || footprint.measurement?.lineEndings !== "lf") {
    throw new Error("instructionFootprint measurement must use utf8 with LF normalization");
  }
  const expectedTokens = {
    executable: "<executable>",
    validator: "<validator>",
    workingDirectory: "<working-directory>",
  };
  if (JSON.stringify(footprint.measurement.dynamicAbsolutePathTokens) !== JSON.stringify(expectedTokens)) {
    throw new Error("instructionFootprint dynamic absolute-path tokens are invalid");
  }
  if (!footprint.budgets || typeof footprint.budgets !== "object" || Array.isArray(footprint.budgets)) {
    throw new Error("instructionFootprint.budgets must be an object");
  }
  const budgetIds = Object.keys(footprint.budgets);
  const missing = instructionFootprintBudgetIds.filter((budgetId) => !budgetIds.includes(budgetId));
  const unknown = budgetIds.filter((budgetId) => !instructionFootprintBudgetIds.includes(budgetId));
  if (missing.length > 0 || unknown.length > 0) {
    throw new Error(`instructionFootprint budget inventory mismatch; missing=${missing.join(",") || "none"}; unknown=${unknown.join(",") || "none"}`);
  }
  for (const budgetId of instructionFootprintBudgetIds) {
    const budget = footprint.budgets[budgetId];
    if (!Number.isSafeInteger(budget?.maxNormalizedBytes) || budget.maxNormalizedBytes < 0) {
      throw new Error(`instructionFootprint budget ${budgetId} must declare a non-negative integer maxNormalizedBytes`);
    }
    if (!Array.isArray(budget.structuralConditions) || budget.structuralConditions.length === 0
        || !budget.structuralConditions.every((condition) => typeof condition === "string"
          && condition.length > 0 && condition.trim() === condition && !/[\r\n]/.test(condition))) {
      throw new Error(`instructionFootprint budget ${budgetId} must declare structuralConditions`);
    }
  }
  return footprint.budgets;
}

export function getRuntimeContractModulePaths(definition) {
  const runtimeContract = definition?.runtimeContract;
  if (runtimeContract?.schemaVersion !== 1) throw new Error("runtimeContract.schemaVersion must be 1");
  if (runtimeContract.manifestPath !== "meta/agdf-runtime-contract.md") {
    throw new Error("runtimeContract.manifestPath must be meta/agdf-runtime-contract.md");
  }
  if (!Array.isArray(runtimeContract.modules) || runtimeContract.modules.length === 0) {
    throw new Error("runtimeContract.modules must be a non-empty ordered array");
  }
  const unique = new Set(runtimeContract.modules);
  if (unique.size !== runtimeContract.modules.length) throw new Error("runtimeContract.modules must not contain duplicates");
  for (const modulePath of runtimeContract.modules) {
    if (!/^meta\/contracts\/[a-z0-9-]+\.md$/.test(modulePath)) {
      throw new Error(`runtimeContract module has an unknown path shape: ${modulePath}`);
    }
  }
  if (runtimeContract.modules[0] !== "meta/contracts/request-activation.md") {
    throw new Error("runtimeContract.modules must place request-activation.md first");
  }
  if (runtimeContract.modules[1] !== "meta/contracts/task-target-resolution.md") {
    throw new Error("runtimeContract.modules must place task-target-resolution.md immediately after request activation");
  }
  return [...runtimeContract.modules];
}

function parseCommandRegistry(commandRegistryContent) {
  const commands = new Set();
  const tokens = javascriptTokens(commandRegistryContent);
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
  if (commands.size === 0) throw new Error("commandRegistry contains no commands");
  return commands;
}

function validateOperationCatalog(catalog, definition, commandRegistryContent) {
  const skillSlugs = validateSkillSet(definition);
  const commands = parseCommandRegistry(commandRegistryContent);
  const operationIds = new Set();
  const ownerKinds = new Set(["contract", "skill", "command", "function"]);
  for (const operation of catalog.operations) {
    if (!operationIdPattern.test(operation?.operation_id ?? "")) {
      throw new Error(`request activation operation has missing or unknown operation_id: ${operation?.operation_id ?? "<missing>"}`);
    }
    if (operationIds.has(operation.operation_id)) throw new Error(`duplicate request activation operation_id: ${operation.operation_id}`);
    operationIds.add(operation.operation_id);
    if (!operation.route_family || !operation.target_boundary || !operation.control_boundary) {
      throw new Error(`request activation operation ${operation.operation_id} has an incomplete route boundary`);
    }
    if (!ownerKinds.has(operation.owner_kind) || !operation.owner) {
      throw new Error(`request activation operation ${operation.operation_id} has an unknown owner declaration`);
    }
    if (operation.owner_kind === "command" && !commands.has(operation.owner)) {
      throw new Error(`request activation operation ${operation.operation_id} references unknown commandRegistry owner ${operation.owner}`);
    }
    if (operation.owner_kind === "skill" && !skillSlugs.has(operation.owner)) {
      throw new Error(`request activation operation ${operation.operation_id} references unknown skillSet owner ${operation.owner}`);
    }
    if (operation.operation_id.startsWith("skill.")) {
      throw new Error("direct skill operation IDs must derive from pluginDefinition.skillSet, not be copied into the explicit catalog");
    }
  }
  if (catalog.derived_operations.length !== 1) {
    throw new Error("request activation catalog must declare exactly one derived skill operation rule");
  }
  const [derived] = catalog.derived_operations;
  if (derived?.operation_id_pattern !== "skill.<slug>"
      || derived?.derive_from !== "pluginDefinition.skillSet"
      || derived?.owner_kind !== "dispatcher"
      || derived?.owner !== "skill-dispatch-v1"
      || derived?.target_boundary !== "dispatcher_v1"
      || derived?.control_boundary !== "dispatcher_v1") {
    throw new Error("request activation derived skill operation rule is invalid");
  }
  return operationIds;
}

function moduleTitle(content, modulePath) {
  const match = content.match(/^# AGDF Runtime Contract (?:—|-) (.+)$/m);
  if (!match) throw new Error(`runtimeContract module lacks its canonical title: ${modulePath}`);
  return match[1].trim();
}

function renderRuntimeModuleIndex(modulePaths, repoRoot, pluginRoot) {
  const rows = modulePaths.map((modulePath) => {
    const absolutePath = assertSafeExistingFile(
      repoRoot,
      join(pluginRoot, modulePath),
      `runtimeContract module source ${modulePath}`,
    );
    const title = moduleTitle(read(absolutePath), modulePath);
    return `| ${title} | \`${modulePath.replace(/^meta\//, "")}\` | Canonical focused module; follow the linked source for semantics. |`;
  });
  return [
    REQUEST_ACTIVATION_MARKERS.runtimeModulesStart,
    "| Module | Path | Coverage |",
    "|---|---|---|",
    ...rows,
    REQUEST_ACTIVATION_MARKERS.runtimeModulesEnd,
  ].join("\n");
}

function renderSkillRouting(definition) {
  return [
    REQUEST_ACTIVATION_MARKERS.skillRoutingStart,
    "| Skill | Use For | Boundary |",
    "|---|---|---|",
    ...definition.skillSet.map((skill) => `| \`${skill.slug}\` | ${skill.useFor} | ${skill.boundary} |`),
    REQUEST_ACTIVATION_MARKERS.skillRoutingEnd,
  ].join("\n");
}

function renderDescription(skill, discoverySuffix) {
  return `Use this skill for this scope: ${skill.useFor}. Boundary: ${skill.boundary}. ${discoverySuffix}`;
}

function validateDiscoveryDescriptionBudgets(definition, discoverySuffix, budgets) {
  const descriptions = definition.skillSet.map((skill) => ({
    slug: skill.slug,
    serialized: JSON.stringify(renderDescription(skill, discoverySuffix)),
  }));
  for (const description of descriptions) {
    const bytes = normalizedUtf8Bytes(description.serialized);
    if (bytes > budgets.skillDiscoveryDescription.maxNormalizedBytes) {
      throw new Error(`skill ${description.slug} discovery description exceeds its instruction footprint budget: ${bytes}`);
    }
  }
  const aggregateBytes = descriptions.reduce(
    (total, description) => total + normalizedUtf8Bytes(description.serialized),
    0,
  );
  if (aggregateBytes > budgets.allSkillDiscoveryDescriptions.maxNormalizedBytes) {
    throw new Error(`all skill discovery descriptions exceed their instruction footprint budget: ${aggregateBytes}`);
  }
}

function updateSkillFrontmatter(content, skill, discoverySuffix, label) {
  if (!content.startsWith("---\n")) throw new Error(`${label} must start with YAML frontmatter`);
  const frontmatterEnd = content.indexOf("\n---\n", 4);
  if (frontmatterEnd < 0) throw new Error(`${label} has no closing YAML frontmatter marker`);
  const frontmatter = content.slice(4, frontmatterEnd);
  assertExactlyOne(frontmatter, `name: ${skill.slug}`, `${label} canonical name`);
  const descriptionMatches = frontmatter.match(/^description:.*$/gm) ?? [];
  if (descriptionMatches.length !== 1) throw new Error(`${label} must contain exactly one description field`);
  const descriptionLine = `description: ${JSON.stringify(renderDescription(skill, discoverySuffix))}`;
  const desiredFrontmatter = frontmatter.replace(/^description:.*$/m, descriptionLine);
  return `---\n${desiredFrontmatter}${content.slice(frontmatterEnd)}`;
}

function validateGateCheckProjection(content, guardBlock, budget) {
  if (normalizedUtf8Bytes(content) > budget.maxNormalizedBytes) {
    throw new Error(`gate-check skill exceeds its instruction footprint budget: ${normalizedUtf8Bytes(content)}`);
  }
  const headings = content.match(/^## .+$/gm) ?? [];
  const expectedHeadings = [
    "## Purpose",
    requestActivationHeading,
    "## Route Boundary",
    "## Executable Dispatch",
    "## Declared `instruction_only` Fallback",
  ];
  if (JSON.stringify(headings) !== JSON.stringify(expectedHeadings)) {
    throw new Error("gate-check must contain only its compact bootstrap sections");
  }
  assertExactlyOne(content, guardBlock, "gate-check canonical request activation guard");
  for (const required of ["`skill.gate-check`", "`delivery.start`", "`terminal: true`", "`instruction_only`"]) {
    if (!content.includes(required)) throw new Error(`gate-check compact bootstrap is missing ${required}`);
  }
}

function assertRouterOrder(content) {
  for (const heading of ["## Surface Convention", "## Request Activation", "## Task Target Resolution", "## Mode Selection"]) {
    assertExactlyOne(content, heading, `router ${heading}`);
  }
  const order = [
    content.indexOf("## Surface Convention"),
    content.indexOf("## Request Activation"),
    content.indexOf("## Task Target Resolution"),
    content.indexOf("## Mode Selection"),
  ];
  if (!order.every((position, index) => index === 0 || position > order[index - 1])) {
    throw new Error("router order must be Surface Convention -> Request Activation -> Task Target Resolution -> Mode Selection");
  }
}

function planFile(plans, path, current, desired) {
  plans.push({ path, current, desired: normalizeLf(desired) });
}

export function syncRequestActivationProjections({ repoRoot = defaultRepoRoot, mode } = {}) {
  if (!new Set(["write", "check"]).has(mode)) throw new Error("mode must be write or check");
  repoRoot = resolve(repoRoot);
  const pluginRoot = join(repoRoot, "plugin");
  const definitionPath = assertSafeExistingFile(
    repoRoot,
    join(pluginRoot, "meta", "agdf-plugin.definition.json"),
    "plugin definition",
  );
  const contractPath = assertSafeExistingFile(
    repoRoot,
    join(pluginRoot, "meta", "contracts", "request-activation.md"),
    "request activation contract",
  );
  const commandRegistryPath = assertSafeExistingFile(
    repoRoot,
    join(repoRoot, "create-agdf", "lib", "cli", "command-registry.js"),
    "command registry",
  );
  const definition = JSON.parse(read(definitionPath));
  const modulePaths = getRuntimeContractModulePaths(definition);
  const skillSlugs = validateSkillSet(definition);
  const instructionFootprintBudgets = validateInstructionFootprint(definition);
  const originalContract = read(contractPath);
  const materialized = materializeGuardFingerprint(originalContract);
  const canonicalContract = materialized.contractContent;
  const discoverySuffix = extractDiscoverySuffix(canonicalContract);
  if (normalizedUtf8Bytes(materialized.guardBlock) > instructionFootprintBudgets.activationKernel.maxNormalizedBytes) {
    throw new Error(`request activation guard exceeds its instruction footprint budget: ${normalizedUtf8Bytes(materialized.guardBlock)}`);
  }
  validateDiscoveryDescriptionBudgets(definition, discoverySuffix, instructionFootprintBudgets);
  const operationCatalog = parseRequestActivationOperationCatalog(canonicalContract);
  validateOperationCatalog(operationCatalog, definition, read(commandRegistryPath));

  const expectedSkillDirectories = new Set(definition.skillSet.map((skill) => skill.slug));
  if (expectedSkillDirectories.size !== skillSlugs.size) throw new Error("skillSet projection inventory is inconsistent");

  const plans = [];
  planFile(plans, contractPath, originalContract, canonicalContract);

  const manifestPath = assertSafeExistingFile(
    repoRoot,
    join(pluginRoot, definition.runtimeContract.manifestPath),
    "runtime contract manifest",
  );
  const manifestContent = read(manifestPath);
  const runtimeModuleBlock = renderRuntimeModuleIndex(modulePaths, repoRoot, pluginRoot);
  const desiredManifest = replaceOwnedBlock(
    manifestContent,
    REQUEST_ACTIVATION_MARKERS.runtimeModulesStart,
    REQUEST_ACTIVATION_MARKERS.runtimeModulesEnd,
    runtimeModuleBlock,
    "runtime contract module index",
  );
  planFile(plans, manifestPath, manifestContent, desiredManifest);

  const routerPath = assertSafeExistingFile(
    repoRoot,
    join(pluginRoot, "meta", "agdf-agent-router.md"),
    "agent router",
  );
  const routerContent = read(routerPath);
  let desiredRouter = updateExistingGuardProjection(
    routerContent,
    materialized.guardBlock,
    "router request activation guard",
  );
  desiredRouter = replaceOwnedBlock(
    desiredRouter,
    REQUEST_ACTIVATION_MARKERS.skillRoutingStart,
    REQUEST_ACTIVATION_MARKERS.skillRoutingEnd,
    renderSkillRouting(definition),
    "router skill routing",
  );
  assertRouterOrder(desiredRouter);
  planFile(plans, routerPath, routerContent, desiredRouter);

  for (const skill of definition.skillSet) {
    const skillPath = assertSafeExistingFile(
      repoRoot,
      join(pluginRoot, "skills", skill.slug, "SKILL.md"),
      `canonical skill source ${skill.slug}`,
    );
    const skillContent = read(skillPath);
    let desiredSkill = updateSkillFrontmatter(skillContent, skill, discoverySuffix, `skill ${skill.slug}`);
    const dispatchCount = countOccurrences(desiredSkill, "## Executable Dispatch");
    const directCount = countOccurrences(desiredSkill, "## Direct Skill Invocation");
    if (dispatchCount + directCount !== 1) {
      throw new Error(`skill ${skill.slug} must expose exactly one approved operational bootstrap anchor`);
    }
    const anchor = dispatchCount === 1 ? "## Executable Dispatch" : "## Direct Skill Invocation";
    desiredSkill = updateExistingGuardProjection(
      desiredSkill,
      materialized.guardBlock,
      `skill ${skill.slug} request activation guard`,
    );
    assertExactlyOne(desiredSkill, requestActivationHeading, `skill ${skill.slug} Request Activation heading`);
    assertExactlyOne(desiredSkill, REQUEST_ACTIVATION_MARKERS.guardStart, `skill ${skill.slug} request activation guard start marker`);
    assertExactlyOne(desiredSkill, REQUEST_ACTIVATION_MARKERS.guardEnd, `skill ${skill.slug} request activation guard end marker`);
    if (desiredSkill.indexOf(REQUEST_ACTIVATION_MARKERS.guardEnd) > desiredSkill.indexOf(anchor)) {
      throw new Error(`skill ${skill.slug} request activation guard must precede ${anchor}`);
    }
    if (skill.slug === "gate-check") {
      validateGateCheckProjection(
        desiredSkill,
        materialized.guardBlock,
        instructionFootprintBudgets.selectedGateCheckSkill,
      );
    }
    planFile(plans, skillPath, skillContent, desiredSkill);
  }

  const drift = plans.filter(({ current, desired }) => current !== desired);
  if (mode === "check" && drift.length > 0) {
    throw new Error(`request activation projections are stale: ${drift.map(({ path }) => path.slice(repoRoot.length + 1)).join(", ")}`);
  }
  if (mode === "write") {
    for (const { path, desired } of drift) {
      const safePath = assertSafeExistingFile(repoRoot, path, "request activation projection target");
      writeFileSync(safePath, desired, "utf8");
    }
  }
  return {
    mode,
    changed: drift.map(({ path }) => path.slice(repoRoot.length + 1)),
    guard_fingerprint: materialized.fingerprint,
    modules: modulePaths,
    operations: operationCatalog.operations.map(({ operation_id: operationId }) => operationId),
    derived_skill_operations: definition.skillSet.map(({ slug }) => `skill.${slug}`),
  };
}

function parseCliMode(argv) {
  if (argv.length !== 1 || !["--write", "--check"].includes(argv[0])) {
    throw new Error("usage: node create-agdf/scripts/sync-request-activation-projections.js <--write|--check>");
  }
  return argv[0].slice(2);
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  try {
    const result = syncRequestActivationProjections({ mode: parseCliMode(process.argv.slice(2)) });
    console.log(`[agdf-request-activation-projections] ${result.mode} ok; changed=${result.changed.length}; guard_fingerprint=${result.guard_fingerprint}`);
  } catch (error) {
    console.error(`[agdf-request-activation-projections] FAIL: ${error.message}`);
    process.exit(1);
  }
}
