import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AGDFPlugin } from "../opencode-plugin.js";
import { installOpenCodeGlobalSurface } from "../lib/installers/opencode.js";
import { digestNormalizedPluginSource } from "../lib/runtime/plugin-provenance.js";
import { fixedRuntimeCheckCommand, runtimeCheckCapabilityIdentity, validateRuntimeCheckCapability } from "../lib/runtime-check-consent/contract.js";
import { createRuntimeCheckReceipt, writeRuntimeCheckReceipt } from "../lib/runtime-check-consent/state.js";
import {
  DISPATCHER_BINDING_PREFIX,
  INSTRUCTION_FOOTPRINT_SURFACE_IDS,
  REQUEST_ACTIVATION_MARKERS,
  extractSerializedDescriptionScalar,
  measureInstructionContent,
  normalizeDynamicInstructionContent,
  requestActivationKernelFingerprint,
  validateInstructionFootprintDefinition,
  validateInstructionFootprintProfile,
} from "../../plugin/scripts/instruction-footprint.mjs";
import { syncPackageAssets } from "./sync-package-assets.js";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = resolve(packageRoot, "..");
const generatedRoot = join(packageRoot, "generated");
const sourcePluginRoot = join(repoRoot, "plugin");
const sourceDefinition = JSON.parse(readFileSync(join(sourcePluginRoot, "meta", "agdf-plugin.definition.json"), "utf8"));
const footprintDefinition = sourceDefinition.instructionFootprint;
const temporaryRoots = [];
const EXPECTED_PROFILE_INSTANCE_IDS = Object.freeze({
  activationKernel: ["canonical"],
  skillDiscoveryDescription: sourceDefinition.skillSet.map((skill) => skill.slug),
  allSkillDiscoveryDescriptions: ["definition-order"],
  sessionStartBase: ["codex", "claude", "copilot"],
  runtimeCheckSupplement: ["codex-consented"],
  openCodeEagerInstructions: ["repository", "global-installed"],
  openCodeActiveDynamicContext: ["active"],
  openCodeInactiveDynamicContext: ["inactive"],
  openCodeComposedStaticAndActiveDynamic: ["repository", "global-installed"],
  openCodeCompactionAddition: ["active"],
  selectedGateCheckSkill: ["canonical-generated", "global-installed"],
});

function temporaryRoot(prefix) {
  const path = mkdtempSync(join(tmpdir(), prefix));
  temporaryRoots.push(path);
  return path;
}

function normalizeLf(content) {
  return content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function extractKernel(content) {
  const normalized = normalizeLf(content);
  const start = normalized.indexOf(REQUEST_ACTIVATION_MARKERS.start);
  const end = normalized.indexOf(REQUEST_ACTIVATION_MARKERS.end, start);
  assert.ok(start >= 0 && end > start, "canonical Request Activation kernel markers must be ordered");
  assert.equal(normalized.split(REQUEST_ACTIVATION_MARKERS.start).length - 1, 1);
  assert.equal(normalized.split(REQUEST_ACTIVATION_MARKERS.end).length - 1, 1);
  return normalized.slice(start, end + REQUEST_ACTIVATION_MARKERS.end.length);
}

function digestTree(root) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.push(path);
      else throw new Error(`unexpected generated entry type: ${path}`);
    }
  };
  visit(root);
  const hash = createHash("sha256");
  for (const path of files) {
    hash.update(relative(root, path).replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(readFileSync(path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function unwrapSessionOutput(stdout, surface) {
  const transported = surface === "copilot" ? JSON.parse(stdout).additionalContext : stdout;
  return normalizeLf(transported).replace(/\n$/u, "");
}

function parseSessionContext(content) {
  const bindingSeparator = `\n\n${DISPATCHER_BINDING_PREFIX} `;
  const bindingStart = content.indexOf(bindingSeparator);
  assert.ok(bindingStart > 0, "SessionStart must contain a dispatcher binding after its kernel");
  const factsSeparator = "\n\nAGDF runtime facts: ";
  const factsStart = content.indexOf(factsSeparator, bindingStart + bindingSeparator.length);
  const bindingJson = content.slice(
    bindingStart + bindingSeparator.length,
    factsStart < 0 ? content.length : factsStart,
  );
  const binding = JSON.parse(bindingJson);
  return {
    base: content.slice(0, factsStart < 0 ? content.length : factsStart),
    binding,
    supplement: factsStart < 0 ? "" : content.slice(factsStart + 2),
  };
}

function executeSessionStart(entrypoint, surface, dataRoot, input = "") {
  const result = spawnSync(process.execPath, [entrypoint], {
    cwd: repoRoot,
    encoding: "utf8",
    input,
    env: { ...process.env, AGDF_DATA_DIR: dataRoot, AGDF_SURFACE: surface },
  });
  assert.equal(result.status, 0, result.stderr);
  return parseSessionContext(unwrapSessionOutput(result.stdout, surface));
}

function discoverySuffix(contract) {
  const start = "<!-- AGDF-REQUEST-ACTIVATION-DISCOVERY-SUFFIX:START -->";
  const end = "<!-- AGDF-REQUEST-ACTIVATION-DISCOVERY-SUFFIX:END -->";
  const startIndex = contract.indexOf(start);
  const endIndex = contract.indexOf(end, startIndex);
  assert.ok(startIndex >= 0 && endIndex > startIndex, "canonical discovery suffix must be present");
  return contract.slice(startIndex + start.length, endIndex).trim();
}

function bindingDynamicValues(content) {
  const line = normalizeLf(content).split("\n").find((candidate) => candidate.startsWith(`${DISPATCHER_BINDING_PREFIX} `));
  assert.ok(line, "surface must expose its exact dispatcher binding");
  const binding = JSON.parse(line.slice(DISPATCHER_BINDING_PREFIX.length + 1));
  return {
    binding,
    dynamicValues: { executable: binding.executable, validator: binding.argv_prefix[0] },
  };
}

function buildBinding(canonicalKernel, version = sourceDefinition.version, surface = "codex") {
  const identity = {
    owner: "request_activation_contract",
    policy_version: 1,
    guard_fingerprint: requestActivationKernelFingerprint(canonicalKernel),
  };
  return {
    schema_version: "1",
    executable: "/absolute/runtime/node",
    argv_prefix: ["/absolute/runtime/agdf-local.js", "skill-dispatch", "--json", "--surface", surface],
    expected_version: version,
    request_activation: identity,
    ...(surface === "opencode" ? {} : {
      route_source_after_activation: {
        relative_to: "validator_directory",
        path: surface === "copilot"
          ? "../copilot-skills/contracts/request-activation.md"
          : "../meta/contracts/request-activation.md",
      },
    }),
    authorizes: false,
  };
}

function bindingLine(binding) {
  return `${DISPATCHER_BINDING_PREFIX} ${JSON.stringify(binding)}`;
}

function withRecomputedFingerprint(kernel) {
  const placeholder = "sha256:" + "0".repeat(64);
  const pending = kernel.replace(/sha256:[0-9a-f]{64}/u, placeholder);
  const fingerprint = requestActivationKernelFingerprint(pending);
  return pending.replace(placeholder, fingerprint);
}

function padPastBudget(content, budget) {
  const current = measureInstructionContent({ content }).normalized_bytes;
  return `${content}${"x".repeat(Math.max(1, budget - current + 1))}`;
}

function padPastNormalizedBudget(content, budget, dynamicValues) {
  const current = measureInstructionContent({
    content,
    dynamicValues,
    dynamicTokens: footprintDefinition.measurement.dynamicAbsolutePathTokens,
  }).normalized_bytes;
  return `${content}${"x".repeat(Math.max(1, budget - current + 1))}`;
}

function assertFailure(report, code, label) {
  assert.equal(report.status, "block", `${label} must fail closed`);
  assert.ok(report.failures.some((entry) => entry.code === code), `${label} must report ${code}: ${JSON.stringify(report.failures)}`);
}

function validateSingle({
  surfaceId,
  records,
  canonicalKernel,
  expectedDescriptions = {},
  expectedVersion = null,
}) {
  return validateInstructionFootprintProfile({
    definition: footprintDefinition,
    canonicalKernel,
    expectedDescriptions,
    expectedVersion,
    surfaces: { [surfaceId]: records },
    requiredSurfaceIds: [surfaceId],
  });
}

async function collectProfile() {
  syncPackageAssets();
  const firstDigest = digestTree(generatedRoot);
  syncPackageAssets();
  assert.equal(digestTree(generatedRoot), firstDigest, "two canonical generation runs must be byte- and digest-stable");

  const generatedPluginRoot = join(generatedRoot, "plugins", "agdf");
  const generatedDefinition = JSON.parse(readFileSync(join(generatedPluginRoot, "meta", "agdf-plugin.definition.json"), "utf8"));
  assert.deepEqual(generatedDefinition.instructionFootprint, footprintDefinition, "generated footprint contract must equal its source owner");
  const activationContract = normalizeLf(readFileSync(join(generatedPluginRoot, "meta", "contracts", "request-activation.md"), "utf8"));
  const canonicalKernel = extractKernel(activationContract);
  const suffix = discoverySuffix(activationContract);
  const expectedDescriptions = Object.fromEntries(sourceDefinition.skillSet.map((skill) => [
    skill.slug,
    JSON.stringify(`Use this skill for this scope: ${skill.useFor}. Boundary: ${skill.boundary}. ${suffix}`),
  ]));
  const discoveryRecords = sourceDefinition.skillSet.map((skill) => ({
    id: skill.slug,
    slug: skill.slug,
    content: extractSerializedDescriptionScalar(readFileSync(join(generatedPluginRoot, "skills", skill.slug, "SKILL.md"), "utf8")),
  }));

  const installedPluginRoot = join(temporaryRoot("agdf-footprint-plugin-"), "agdf");
  cpSync(generatedPluginRoot, installedPluginRoot, { recursive: true });
  const entrypoint = join(installedPluginRoot, "runtime", "agdf-session-check.js");
  const noConsentDataRoot = temporaryRoot("agdf-footprint-no-consent-");
  const sessionRecords = ["codex", "claude", "copilot"].map((surface) => {
    const observed = executeSessionStart(entrypoint, surface, noConsentDataRoot);
    const { dynamicValues } = bindingDynamicValues(observed.base);
    return { id: surface, content: observed.base, dynamicValues };
  });

  const consentDataRoot = temporaryRoot("agdf-footprint-consent-");
  const capability = validateRuntimeCheckCapability(sourceDefinition.automaticRuntimeChecks);
  const manifest = JSON.parse(readFileSync(join(installedPluginRoot, "runtime", "runtime-manifest.json"), "utf8"));
  const command = fixedRuntimeCheckCommand("codex", installedPluginRoot, process.platform);
  writeRuntimeCheckReceipt(consentDataRoot, createRuntimeCheckReceipt({
    surface: "codex",
    decision: "enable",
    capabilityIdentity: runtimeCheckCapabilityIdentity({
      capability,
      surface: "codex",
      runtimeDigest: manifest.digest,
      sourceDigest: digestNormalizedPluginSource(installedPluginRoot, sourceDefinition.version),
      command,
    }),
    command,
  }));
  const consented = executeSessionStart(entrypoint, "codex", consentDataRoot, JSON.stringify({ cwd: repoRoot }));
  assert.ok(consented.supplement, "consented SessionStart must expose a separate runtime supplement");

  const activeRepository = temporaryRoot("agdf-footprint-active-");
  mkdirSync(join(activeRepository, ".agdf", "control"), { recursive: true });
  writeFileSync(join(activeRepository, ".agdf", "control", "config.json"), `${JSON.stringify({
    artifact_language: "en",
    chat_language: "de",
    runtime_language: "en",
  })}\n`, "utf8");
  const inactiveRepository = temporaryRoot("agdf-footprint-inactive-");
  const client = { app: { log: async () => ({}) }, tui: { showToast: async () => ({}) } };
  const activePlugin = await AGDFPlugin({ directory: activeRepository, client });
  const inactivePlugin = await AGDFPlugin({ directory: inactiveRepository, client });
  const activeOutput = { system: [] };
  await activePlugin["experimental.chat.system.transform"]({}, activeOutput);
  await activePlugin["experimental.chat.system.transform"]({}, activeOutput);
  assert.equal(activeOutput.system.length, 1, "active OpenCode system transform must be idempotent");
  const activeDynamic = activeOutput.system[0];
  const activeDynamicValues = bindingDynamicValues(activeDynamic).dynamicValues;
  const inactiveOutput = { system: [] };
  await inactivePlugin["experimental.chat.system.transform"]({}, inactiveOutput);
  assert.deepEqual(inactiveOutput.system, [], "inactive OpenCode system transform must emit zero bytes");
  const compactionOutput = { context: [] };
  await activePlugin["experimental.session.compacting"]({}, compactionOutput);
  await activePlugin["experimental.session.compacting"]({}, compactionOutput);
  assert.deepEqual(compactionOutput.context, [canonicalKernel], "OpenCode compaction must add one idempotent kernel-only block");
  const inactiveCompaction = { context: [] };
  await inactivePlugin["experimental.session.compacting"]({}, inactiveCompaction);
  assert.deepEqual(inactiveCompaction.context, [], "inactive OpenCode compaction must emit zero bytes");

  const localEager = normalizeLf(readFileSync(join(generatedRoot, ".opencode", sourceDefinition.opencode.instructionsFileName), "utf8"));
  const globalConfigRoot = temporaryRoot("agdf-footprint-global-");
  const installedPackageRoot = join(globalConfigRoot, "node_modules", sourceDefinition.opencode.npmPackage);
  mkdirSync(join(globalConfigRoot, "node_modules"), { recursive: true });
  cpSync(packageRoot, installedPackageRoot, {
    recursive: true,
    filter: (path) => !path.includes(`${join(packageRoot, "node_modules")}/`),
  });
  const globalPaths = installOpenCodeGlobalSurface(globalConfigRoot);
  assert.ok(statSync(globalPaths.router).isFile(), "temporary global install must include its on-demand package router");
  const globalEager = normalizeLf(readFileSync(globalPaths.instructions, "utf8"));
  const canonicalGateCheck = normalizeLf(readFileSync(join(generatedPluginRoot, "skills", "gate-check", "SKILL.md"), "utf8"));
  const globalGateCheck = normalizeLf(readFileSync(join(globalPaths.skills, `${sourceDefinition.opencode.globalSkillPrefix}gate-check`, "SKILL.md"), "utf8"));

  const surfaces = {
    activationKernel: [{ id: "canonical", content: canonicalKernel }],
    skillDiscoveryDescription: discoveryRecords,
    allSkillDiscoveryDescriptions: [{ id: "definition-order", content: discoveryRecords.map((record) => record.content).join("") }],
    sessionStartBase: sessionRecords,
    runtimeCheckSupplement: [{
      id: "codex-consented",
      content: consented.supplement,
      dynamicValues: { workingDirectory: repoRoot },
    }],
    openCodeEagerInstructions: [
      { id: "repository", variant: "canonical", content: localEager },
      { id: "global-installed", variant: "global", content: globalEager },
    ],
    openCodeActiveDynamicContext: [{ id: "active", content: activeDynamic, dynamicValues: activeDynamicValues }],
    openCodeInactiveDynamicContext: [{ id: "inactive", content: "" }],
    openCodeComposedStaticAndActiveDynamic: [
      { id: "repository", variant: "canonical", content: `${localEager}\n${activeDynamic}`, dynamicValues: activeDynamicValues },
      { id: "global-installed", variant: "global", content: `${globalEager}\n${activeDynamic}`, dynamicValues: activeDynamicValues },
    ],
    openCodeCompactionAddition: [{ id: "active", content: compactionOutput.context[0] }],
    selectedGateCheckSkill: [
      { id: "canonical-generated", variant: "canonical", content: canonicalGateCheck },
      { id: "global-installed", variant: "global", content: globalGateCheck },
    ],
  };
  return { canonicalKernel, expectedDescriptions, surfaces, generatedDigest: firstDigest };
}

function runNegativeFixtures(valid) {
  const budget = (surfaceId) => footprintDefinition.budgets[surfaceId].maxNormalizedBytes;
  const expectSingleFailure = (label, surfaceId, records, code = "AGDF_INSTRUCTION_FOOTPRINT_BUDGET_EXCEEDED", options = {}) => {
    const report = validateSingle({
      surfaceId,
      records,
      canonicalKernel: options.canonicalKernel ?? valid.canonicalKernel,
      expectedDescriptions: options.expectedDescriptions ?? valid.expectedDescriptions,
      expectedVersion: options.expectedVersion ?? sourceDefinition.version,
    });
    assertFailure(report, code, label);
  };

  const oversizedKernel = withRecomputedFingerprint(padPastBudget(valid.canonicalKernel.replace(`\n${REQUEST_ACTIVATION_MARKERS.end}`, ""), budget("activationKernel")) + `\n${REQUEST_ACTIVATION_MARKERS.end}`);
  expectSingleFailure("activation kernel overflow", "activationKernel", [{ id: "overflow", content: oversizedKernel }], undefined, { canonicalKernel: oversizedKernel });

  const longDescriptions = { ...valid.expectedDescriptions };
  const firstSlug = Object.keys(longDescriptions)[0];
  longDescriptions[firstSlug] = `"${"x".repeat(budget("skillDiscoveryDescription"))}"`;
  const longDescriptionRecords = Object.entries(longDescriptions).map(([slug, content]) => ({ id: slug, slug, content }));
  expectSingleFailure("one description overflow", "skillDiscoveryDescription", longDescriptionRecords, undefined, { expectedDescriptions: longDescriptions });

  const aggregateDescriptions = Object.fromEntries(sourceDefinition.skillSet.map((skill, index) => [
    skill.slug,
    JSON.stringify(`${index}-${"x".repeat(310)}`),
  ]));
  expectSingleFailure(
    "description aggregate overflow",
    "allSkillDiscoveryDescriptions",
    [{ id: "overflow", content: Object.values(aggregateDescriptions).join("") }],
    undefined,
    { expectedDescriptions: aggregateDescriptions },
  );

  const longSessionBinding = buildBinding(valid.canonicalKernel, "x".repeat(900), "codex");
  const longSession = `${valid.canonicalKernel}\n\n${bindingLine(longSessionBinding)}`;
  expectSingleFailure("SessionStart base overflow", "sessionStartBase", [{ id: "overflow", content: longSession }], undefined, { expectedVersion: null });

  const missingRouteSourceBinding = buildBinding(valid.canonicalKernel, sourceDefinition.version, "codex");
  delete missingRouteSourceBinding.route_source_after_activation;
  expectSingleFailure(
    "SessionStart route source missing",
    "sessionStartBase",
    [{ id: "missing-route-source", content: `${valid.canonicalKernel}\n\n${bindingLine(missingRouteSourceBinding)}` }],
    "AGDF_INSTRUCTION_FOOTPRINT_BINDING_INVALID",
  );

  const longSupplement = `AGDF runtime facts: ${JSON.stringify({
    context_state: "repository_bound",
    working_directory: "unavailable",
    automatic_check: { status: "x".repeat(330), findings: 0 },
    config: "valid",
  })}`;
  expectSingleFailure("runtime supplement overflow", "runtimeCheckSupplement", [{ id: "overflow", content: longSupplement }]);

  const validEager = valid.surfaces.openCodeEagerInstructions[0].content;
  expectSingleFailure("OpenCode eager overflow", "openCodeEagerInstructions", [{ id: "overflow", content: padPastBudget(validEager, budget("openCodeEagerInstructions")) }]);

  const longVersion = "x".repeat(700);
  const activeOverflow = [
    bindingLine(buildBinding(valid.canonicalKernel, longVersion, "opencode")),
    `AGDF runtime facts: ${JSON.stringify({ active: true, version: longVersion })}`,
  ].join("\n");
  expectSingleFailure("OpenCode active dynamic overflow", "openCodeActiveDynamicContext", [{ id: "overflow", content: activeOverflow }], undefined, { expectedVersion: null });
  expectSingleFailure("OpenCode inactive overflow", "openCodeInactiveDynamicContext", [{ id: "overflow", content: "x" }]);

  const composed = valid.surfaces.openCodeComposedStaticAndActiveDynamic[0];
  expectSingleFailure("OpenCode composed overflow", "openCodeComposedStaticAndActiveDynamic", [{ id: "overflow", content: padPastNormalizedBudget(composed.content, budget("openCodeComposedStaticAndActiveDynamic"), composed.dynamicValues), dynamicValues: composed.dynamicValues }]);

  const oversizedCompactionKernel = withRecomputedFingerprint(padPastBudget(valid.canonicalKernel.replace(`\n${REQUEST_ACTIVATION_MARKERS.end}`, ""), budget("openCodeCompactionAddition")) + `\n${REQUEST_ACTIVATION_MARKERS.end}`);
  expectSingleFailure("OpenCode compaction overflow", "openCodeCompactionAddition", [{ id: "overflow", content: oversizedCompactionKernel }], undefined, { canonicalKernel: oversizedCompactionKernel });

  const gate = valid.surfaces.selectedGateCheckSkill[0].content;
  expectSingleFailure("selected gate-check overflow", "selectedGateCheckSkill", [{ id: "overflow", variant: "canonical", content: padPastBudget(gate, budget("selectedGateCheckSkill")) }]);

  const composedRecord = valid.surfaces.openCodeComposedStaticAndActiveDynamic[0];
  expectSingleFailure("second kernel", "openCodeComposedStaticAndActiveDynamic", [{ ...composedRecord, content: `${composedRecord.content}\n${valid.canonicalKernel}` }], "AGDF_INSTRUCTION_FOOTPRINT_KERNEL_COUNT");
  const dynamicBindingLine = normalizeLf(valid.surfaces.openCodeActiveDynamicContext[0].content).split("\n")[0];
  expectSingleFailure("second binding", "openCodeComposedStaticAndActiveDynamic", [{ ...composedRecord, content: `${composedRecord.content}\n${dynamicBindingLine}` }], "AGDF_INSTRUCTION_FOOTPRINT_BINDING_COUNT");
  expectSingleFailure("conflicting activation language", "openCodeEagerInstructions", [{ id: "conflict", content: `${validEager}\nActivate AGDF for every request.` }], "AGDF_INSTRUCTION_FOOTPRINT_ACTIVATION_CONFLICT");
  for (const [label, prose] of [
    ["paraphrased activation conflict", "Enable AGDF on every prompt."],
    ["read-only activation conflict", "Run AGDF on all work, including ordinary read-only questions."],
  ]) {
    expectSingleFailure(
      label,
      "openCodeEagerInstructions",
      [{ id: label, variant: "canonical", content: `${validEager}\n${prose}` }],
      "AGDF_INSTRUCTION_FOOTPRINT_EAGER_IDENTITY_DRIFT",
    );
  }
  expectSingleFailure("full eager router", "openCodeEagerInstructions", [{ id: "router", content: `${validEager}\n### task target resolution` }], "AGDF_INSTRUCTION_FOOTPRINT_FULL_ROUTER_LEAK");
  const active = valid.surfaces.openCodeActiveDynamicContext[0];
  expectSingleFailure("dynamic policy prose", "openCodeActiveDynamicContext", [{ ...active, content: `${active.content}\nAlways require prior governance approval.` }], "AGDF_INSTRUCTION_FOOTPRINT_DYNAMIC_FACTS_INVALID");
  expectSingleFailure("inactive nonempty", "openCodeInactiveDynamicContext", [{ id: "notice", content: "AGDF is inactive." }], "AGDF_INSTRUCTION_FOOTPRINT_INACTIVE_NONEMPTY");
  expectSingleFailure("compaction binding", "openCodeCompactionAddition", [{ id: "binding", content: `${valid.canonicalKernel}\n${dynamicBindingLine}` }], "AGDF_INSTRUCTION_FOOTPRINT_COMPACTION_INVALID");
  expectSingleFailure("compaction guidance", "openCodeCompactionAddition", [{ id: "guidance", content: `${valid.canonicalKernel}\nAGDF is active.` }], "AGDF_INSTRUCTION_FOOTPRINT_COMPACTION_GUIDANCE_LEAK");

  for (const [label, content] of [
    ["missing markers", ""],
    ["duplicate markers", `${valid.canonicalKernel}\n${valid.canonicalKernel}`],
    ["partial markers", valid.canonicalKernel.replace(REQUEST_ACTIVATION_MARKERS.end, "")],
    ["reordered markers", `${REQUEST_ACTIVATION_MARKERS.end}\n${REQUEST_ACTIVATION_MARKERS.start}`],
    ["manual kernel drift", valid.canonicalKernel.replace("Decide effect", "Decide the effect")],
  ]) {
    expectSingleFailure(label, "activationKernel", [{ id: label, content }], "AGDF_INSTRUCTION_FOOTPRINT_KERNEL_COUNT");
  }
  const fingerprintDrift = valid.canonicalKernel.replace(/sha256:[0-9a-f]{64}/u, `sha256:${"0".repeat(64)}`);
  expectSingleFailure("fingerprint drift", "activationKernel", [{ id: "fingerprint", content: fingerprintDrift }], "AGDF_INSTRUCTION_FOOTPRINT_CANONICAL_FINGERPRINT_INVALID", { canonicalKernel: fingerprintDrift });

  const gateDispatchDrift = valid.surfaces.selectedGateCheckSkill[0].content.replace(
    "transmit `host_action.text` verbatim and stop",
    "summarize `host_action.text` and stop",
  );
  expectSingleFailure(
    "terminal dispatch drift",
    "selectedGateCheckSkill",
    [{ id: "drift", variant: "canonical", content: gateDispatchDrift }],
    "AGDF_INSTRUCTION_FOOTPRINT_GATE_TERMINAL_DISPATCH_DRIFT",
  );

  const missingBudget = structuredClone(footprintDefinition);
  delete missingBudget.budgets.activationKernel;
  assertFailure(validateInstructionFootprintDefinition(missingBudget), "AGDF_INSTRUCTION_FOOTPRINT_BUDGET_MISSING", "missing budget");
  const unknownBudget = structuredClone(footprintDefinition);
  unknownBudget.budgets.unknownSurface = { maxNormalizedBytes: 1, structuralConditions: ["unknown"] };
  assertFailure(validateInstructionFootprintDefinition(unknownBudget), "AGDF_INSTRUCTION_FOOTPRINT_BUDGET_UNKNOWN", "unknown budget");
  const unknownSchema = structuredClone(footprintDefinition);
  unknownSchema.schemaVersion = 2;
  assertFailure(validateInstructionFootprintDefinition(unknownSchema), "AGDF_INSTRUCTION_FOOTPRINT_SCHEMA_UNKNOWN", "unknown schema");
  const reorderedDefinition = {
    budgets: structuredClone(footprintDefinition.budgets),
    measurement: structuredClone(footprintDefinition.measurement),
    schemaVersion: footprintDefinition.schemaVersion,
  };
  assert.equal(
    validateInstructionFootprintDefinition(reorderedDefinition).status,
    "pass",
    "object-key reordering alone must not change the approved schema-v1 contract",
  );
  const missingSurface = structuredClone(valid.surfaces);
  delete missingSurface.activationKernel;
  assertFailure(validateInstructionFootprintProfile({
    definition: footprintDefinition,
    canonicalKernel: valid.canonicalKernel,
    expectedDescriptions: valid.expectedDescriptions,
    expectedVersion: sourceDefinition.version,
    expectedInstanceIds: EXPECTED_PROFILE_INSTANCE_IDS,
    surfaces: missingSurface,
  }), "AGDF_INSTRUCTION_FOOTPRINT_SURFACE_MISSING", "missing surface");
  const missingInstance = structuredClone(valid.surfaces);
  missingInstance.sessionStartBase = missingInstance.sessionStartBase.filter((record) => record.id !== "claude");
  assertFailure(validateInstructionFootprintProfile({
    definition: footprintDefinition,
    canonicalKernel: valid.canonicalKernel,
    expectedDescriptions: valid.expectedDescriptions,
    expectedVersion: sourceDefinition.version,
    expectedInstanceIds: EXPECTED_PROFILE_INSTANCE_IDS,
    surfaces: missingInstance,
  }), "AGDF_INSTRUCTION_FOOTPRINT_SURFACE_INVENTORY_INVALID", "missing surface instance");
  const unknownSurface = structuredClone(valid.surfaces);
  unknownSurface.unknownSurface = [{ id: "unknown", content: "" }];
  assertFailure(validateInstructionFootprintProfile({
    definition: footprintDefinition,
    canonicalKernel: valid.canonicalKernel,
    expectedDescriptions: valid.expectedDescriptions,
    expectedVersion: sourceDefinition.version,
    expectedInstanceIds: EXPECTED_PROFILE_INSTANCE_IDS,
    surfaces: unknownSurface,
  }), "AGDF_INSTRUCTION_FOOTPRINT_SURFACE_UNKNOWN", "unknown surface");
}

try {
  assert.equal(validateInstructionFootprintDefinition(footprintDefinition).status, "pass");
  const probeExecutable = "/very/long/runtime/location/for/node";
  const probeValidator = "/very/long/runtime/location/for/agdf-local.js";
  const probeWorkingDirectory = "/very/long/working/directory/for/repository";
  const probeContent = `${probeExecutable}|${probeValidator}|${probeWorkingDirectory}|relative/path|/ignored`;
  const normalizedProbeContent = normalizeDynamicInstructionContent(
    probeContent,
    {
      executable: probeExecutable,
      validator: probeValidator,
      workingDirectory: probeWorkingDirectory,
      ignored: "/ignored",
    },
    footprintDefinition.measurement.dynamicAbsolutePathTokens,
  );
  assert.equal(
    normalizedProbeContent,
    "<executable>|<validator>|<working-directory>|relative/path|/ignored",
    "normalization must replace exactly the three declared absolute path values",
  );
  const normalizedProbe = measureInstructionContent({
    content: probeContent,
    dynamicValues: { executable: probeExecutable, validator: probeValidator, workingDirectory: probeWorkingDirectory, ignored: "/ignored" },
    dynamicTokens: footprintDefinition.measurement.dynamicAbsolutePathTokens,
  });
  assert.ok(normalizedProbe.normalized_bytes < normalizedProbe.raw_bytes, "only declared absolute dynamic values must normalize");
  const crlfProbe = measureInstructionContent({ content: "alpha\r\nbeta\r" });
  assert.deepEqual(crlfProbe, {
    raw_bytes: Buffer.byteLength("alpha\nbeta\n", "utf8"),
    normalized_bytes: Buffer.byteLength("alpha\nbeta\n", "utf8"),
  }, "raw and normalized measurement must both start after LF normalization");

  const profile = await collectProfile();
  const report = validateInstructionFootprintProfile({
    definition: footprintDefinition,
    canonicalKernel: profile.canonicalKernel,
    expectedDescriptions: profile.expectedDescriptions,
    expectedVersion: sourceDefinition.version,
    expectedInstanceIds: EXPECTED_PROFILE_INSTANCE_IDS,
    surfaces: profile.surfaces,
  });
  assert.equal(report.status, "pass", JSON.stringify(report.failures, null, 2));
  assert.deepEqual(
    [...new Set(report.measurements.map((measurement) => measurement.surface_id))],
    INSTRUCTION_FOOTPRINT_SURFACE_IDS,
    "the real profile must report raw and normalized bytes for all eleven definition-owned budgets",
  );
  for (const measurement of report.measurements) {
    assert.ok(Number.isSafeInteger(measurement.raw_bytes));
    assert.ok(Number.isSafeInteger(measurement.normalized_bytes));
    assert.ok(measurement.normalized_bytes <= measurement.max_normalized_bytes);
  }
  const activeRecord = profile.surfaces.openCodeActiveDynamicContext[0];
  const forgedNormalization = validateSingle({
    surfaceId: "openCodeActiveDynamicContext",
    records: [{ ...activeRecord, dynamicValues: { executable: "/", validator: "/", workingDirectory: "/" } }],
    canonicalKernel: profile.canonicalKernel,
    expectedVersion: sourceDefinition.version,
  });
  assert.equal(forgedNormalization.status, "pass", JSON.stringify(forgedNormalization.failures));
  assert.equal(
    forgedNormalization.measurements[0].normalized_bytes,
    report.measurements.find((measurement) => measurement.surface_id === "openCodeActiveDynamicContext").normalized_bytes,
    "caller-supplied broad paths must not influence profile measurement",
  );
  runNegativeFixtures(profile);
  console.log(JSON.stringify({
    status: report.status,
    evidence_plane: "source_composed",
    profile_surface: "generated_and_temporary_install_fixture",
    evaluator_surface: "node_deterministic",
    loaded_host_evidence: false,
    generated_digest: profile.generatedDigest,
    canonical_kernel_fingerprint: report.canonical_kernel_fingerprint,
    measurements: report.measurements,
  }, null, 2));
  console.log("Instruction-footprint tests passed");
} finally {
  for (const path of temporaryRoots.reverse()) rmSync(path, { recursive: true, force: true });
}
