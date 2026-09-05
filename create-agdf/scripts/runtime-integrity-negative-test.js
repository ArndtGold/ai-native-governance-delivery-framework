import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, unlinkSync, writeFileSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-runtime-integrity-"));
const integrityScript = join(fixtureRoot, "plugin", "scripts", "check-runtime-integrity.mjs");
const templatePath = join(fixtureRoot, "plugin", "control", "templates", "artefacts", "VERIFIED_CHANGE.md");
const brownfieldTemplatePath = join(fixtureRoot, "plugin", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md");
const pluginDefinitionPath = join(fixtureRoot, "plugin", "meta", "agdf-plugin.definition.json");
const requestActivationContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "request-activation.md");
const interactionContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "interaction.md");
const taskTargetContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "task-target-resolution.md");
const modesContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "modes.md");
const gateTransitionContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "gate-transition.md");
const qualityContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "quality.md");
const gateCheckPath = join(fixtureRoot, "plugin", "skills", "gate-check", "SKILL.md");
const brownfieldSkillPath = join(fixtureRoot, "plugin", "skills", "brownfield-analysis", "SKILL.md");
const cleanReviewPath = join(fixtureRoot, "plugin", "skills", "clean-implementation-review", "SKILL.md");
const qaGatePath = join(fixtureRoot, "plugin", "skills", "qa-gate", "SKILL.md");
const releaseOrPath = join(fixtureRoot, "plugin", "skills", "release-or", "SKILL.md");
const interactionLocalesPath = join(fixtureRoot, "plugin", "meta", "agdf-interaction-locales.json");
const agentSkillsPolicyPath = join(fixtureRoot, "plugin", "meta", "agent-skills-conformance.json");
const agentSkillsValidatorPath = join(fixtureRoot, "plugin", "scripts", "agent-skills-conformance.mjs");
const instructionFootprintValidatorPath = join(fixtureRoot, "plugin", "scripts", "instruction-footprint.mjs");

function copyPluginFixture() {
  const source = join(repoRoot, "plugin");
  cpSync(source, join(fixtureRoot, "plugin"), {
    recursive: true,
    filter: (path) => path !== join(source, "runtime") && !path.startsWith(`${join(source, "runtime")}/`),
  });
  symlinkSync(join(source, "runtime"), join(fixtureRoot, "plugin", "runtime"));
}

function makeFixture() {
  copyPluginFixture();
  for (const entry of [".claude-plugin", "agdf", "create-agdf", "pages", ".agdf", "LICENSE"]) {
    symlinkSync(join(repoRoot, entry), join(fixtureRoot, entry));
  }
}

function materializeCreateAgdfFixture() {
  const target = join(fixtureRoot, "create-agdf");
  unlinkSync(target);
  cpSync(join(repoRoot, "create-agdf"), target, { recursive: true });
}

function resetPluginFixture() {
  rmSync(join(fixtureRoot, "plugin"), { recursive: true, force: true });
  copyPluginFixture();
}

function expectIntegrityFailure(expected) {
  const result = spawnSync(process.execPath, [integrityScript], {
    encoding: "utf8",
    env: { ...process.env, AGDF_RUNTIME_INTEGRITY_ROOT: fixtureRoot },
  });
  assert.notEqual(result.status, 0, "runtime integrity must reject the independently broken fixture");
  assert.match(`${result.stdout}\n${result.stderr}`, expected);
}

function expectIntegrityPass() {
  const result = spawnSync(process.execPath, [integrityScript], {
    encoding: "utf8",
    env: { ...process.env, AGDF_RUNTIME_INTEGRITY_ROOT: fixtureRoot },
  });
  assert.equal(result.status, 0, `runtime integrity baseline must pass before negative mutations:\n${result.stdout}\n${result.stderr}`);
}

function replaceRequired(path, from, to) {
  const current = readFileSync(path, "utf8");
  const changed = current.replace(from, to);
  assert.notEqual(changed, current, `fixture mutation source missing: ${from}`);
  writeFileSync(path, changed, "utf8");
}

try {
  makeFixture();
  expectIntegrityPass();

  mkdirSync(join(fixtureRoot, ".agents", "plugins"), { recursive: true });
  writeFileSync(join(fixtureRoot, ".agents", "plugins", "marketplace.json"), "{}\n");
  expectIntegrityFailure(/source checkout must not expose a runtime-free Codex marketplace/);
  rmSync(join(fixtureRoot, ".agents"), { recursive: true, force: true });

  resetPluginFixture();
  const invalidProfiles = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));
  invalidProfiles.distributionProfiles.profiles["runtime-plugin"].runtime = "optional";
  writeFileSync(pluginDefinitionPath, `${JSON.stringify(invalidProfiles, null, 2)}\n`, "utf8");
  expectIntegrityFailure(/distribution profiles must match the runtime integrity contract/);

  resetPluginFixture();
  unlinkSync(join(fixtureRoot, "plugin", "runtime"));
  mkdirSync(join(fixtureRoot, "plugin", "runtime"));
  writeFileSync(join(fixtureRoot, "plugin", "runtime", "runtime-manifest.json"), "{}\n");
  expectIntegrityFailure(/source plugin must not contain generated runtime/);

  resetPluginFixture();
  unlinkSync(agentSkillsValidatorPath);
  expectIntegrityFailure(/AGDF_AGENT_SKILLS_VALIDATOR_MISSING/);

  resetPluginFixture();
  unlinkSync(instructionFootprintValidatorPath);
  expectIntegrityFailure(/AGDF_INSTRUCTION_FOOTPRINT_VALIDATOR_MISSING/);

  resetPluginFixture();
  unlinkSync(agentSkillsPolicyPath);
  expectIntegrityFailure(/AGDF_SKILL_POLICY_UNREADABLE/);

  resetPluginFixture();
  writeFileSync(
    gateCheckPath,
    readFileSync(gateCheckPath, "utf8").replace("name: gate-check", "name: gate--check"),
    "utf8",
  );
  expectIntegrityFailure(/AGENT_SKILLS_NAME_INVALID \[standard_strict\]/);

  resetPluginFixture();
  unlinkSync(templatePath);
  expectIntegrityFailure(/plugin\/control\/templates\/artefacts\/VERIFIED_CHANGE\.md missing/);

  resetPluginFixture();
  const template = readFileSync(templatePath, "utf8").replace("canonical_owner", "canonical_owner_removed");
  writeFileSync(templatePath, template, "utf8");
  expectIntegrityFailure(/VERIFIED_CHANGE\.md missing control field: canonical_owner/);

  resetPluginFixture();
  writeFileSync(
    modesContractPath,
    readFileSync(modesContractPath, "utf8").replace("### Structured Depth Decision", "### Removed Structured Depth Decision"),
    "utf8",
  );
  expectIntegrityFailure(/modes contract Structured Depth Decision missing: ### Structured Depth Decision/);

  resetPluginFixture();
  writeFileSync(
    brownfieldTemplatePath,
    readFileSync(brownfieldTemplatePath, "utf8").replace("depth_policy_version", "depth_policy_removed"),
    "utf8",
  );
  expectIntegrityFailure(/BROWNFIELD_REVIEW\.md missing control field: depth_policy_version/);

  resetPluginFixture();
  writeFileSync(
    brownfieldSkillPath,
    readFileSync(brownfieldSkillPath, "utf8").replace("Brownfield\/Mode-Slice re-evaluation", "structured-depth recovery removed"),
    "utf8",
  );
  expectIntegrityFailure(/brownfield-analysis structured-depth guidance missing: Brownfield\/Mode-Slice re-evaluation/);

  resetPluginFixture();
  writeFileSync(
    pluginDefinitionPath,
    readFileSync(pluginDefinitionPath, "utf8").replace('"question": "allow"', '"question": "deny"'),
    "utf8",
  );
  expectIntegrityFailure(/OpenCode permissions must allow the native question tool/);

  resetPluginFixture();
  unlinkSync(interactionContractPath);
  expectIntegrityFailure(/runtime contract module interaction\.md missing/);

  resetPluginFixture();
  writeFileSync(
    interactionContractPath,
    readFileSync(interactionContractPath, "utf8").replace("## Native Interaction Contract", "## Removed Native Interaction Contract"),
    "utf8",
  );
  expectIntegrityFailure(/runtime contract Native Interaction Contract missing: ## Native Interaction Contract/);

  resetPluginFixture();
  writeFileSync(
    taskTargetContractPath,
    readFileSync(taskTargetContractPath, "utf8").replace("## Direct Skill Invocation Preflight", "## Removed Direct Skill Invocation Preflight"),
    "utf8",
  );
  expectIntegrityFailure(/shared direct skill target-preflight boundary missing: ## Direct Skill Invocation Preflight/);

  resetPluginFixture();
  replaceRequired(
    taskTargetContractPath,
    "After positive Request Activation, resolve the user's primary work target",
    "Before positive Request Activation, resolve the user's primary work target",
  );
  expectIntegrityFailure(/task-target-resolution must remain downstream of positive Request Activation/);

  resetPluginFixture();
  replaceRequired(
    modesContractPath,
    "read-only handling and are not Quick Tasks.",
    "read-only handling and are Quick Tasks.",
  );
  expectIntegrityFailure(/modes contract must keep ordinary read-only work outside Quick Task/);

  resetPluginFixture();
  replaceRequired(
    interactionContractPath,
    "renders no AGDF orientation,",
    "renders an AGDF orientation,",
  );
  expectIntegrityFailure(/interaction contract must keep ordinary read-only handling silent and pre-target/);

  resetPluginFixture();
  replaceRequired(
    interactionContractPath,
    "`control_setup` is a non-gate envelope",
    "`control_setup` is a gate envelope",
  );
  expectIntegrityFailure(/interaction contract must define non-authorizing control_setup before any gate approval presentation/);

  resetPluginFixture();
  replaceRequired(
    gateTransitionContractPath,
    "Obtain\n  explicit setup or link authority",
    "Request\n  gate approval without setup authority",
  );
  expectIntegrityFailure(/gate-transition contract must require setup\/link authority and durable persistence before Approval: UR/);

  resetPluginFixture();
  const raisedBudget = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));
  raisedBudget.instructionFootprint.budgets.activationKernel.maxNormalizedBytes += 1;
  writeFileSync(pluginDefinitionPath, `${JSON.stringify(raisedBudget, null, 2)}\n`, "utf8");
  expectIntegrityFailure(/AGDF_INSTRUCTION_FOOTPRINT_CONTRACT_UNAUTHORIZED/);

  for (const [label, mutate, expected] of [
    ["missing", (content) => content.replace(/<!--[ ]*AGDF-REQUEST-ACTIVATION-GUARD:START -->[\s\S]*?<!--[ ]*AGDF-REQUEST-ACTIVATION-GUARD:END -->/u, ""), /AGDF_INSTRUCTION_FOOTPRINT_CANONICAL_KERNEL_MISSING|canonical request activation guard/],
    ["duplicate", (content) => `${content}\n${content.match(/<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->[\s\S]*?<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->/u)?.[0]}`, /canonical request activation guard must contain exactly one complete marker-bounded projection/],
    ["partial", (content) => content.replace("<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->", ""), /canonical request activation guard must contain exactly one complete marker-bounded projection/],
    ["reordered", (content) => content.replace("<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->", "<!-- AGDF-REQUEST-ACTIVATION-GUARD:TEMP -->").replace("<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->", "<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->").replace("<!-- AGDF-REQUEST-ACTIVATION-GUARD:TEMP -->", "<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->"), /canonical request activation guard projection markers are out of order/],
    ["manual", (content) => content.replace("Decide effect from loaded instructions", "Decide the effect from loaded instructions"), /AGDF_INSTRUCTION_FOOTPRINT_KERNEL_COUNT|request activation guard fingerprint/],
  ]) {
    resetPluginFixture();
    const current = readFileSync(requestActivationContractPath, "utf8");
    const changed = mutate(current);
    assert.notEqual(changed, current, `${label} marker fixture must make one mutation`);
    writeFileSync(requestActivationContractPath, changed, "utf8");
    expectIntegrityFailure(expected);
  }

  resetPluginFixture();
  writeFileSync(
    gateCheckPath,
    readFileSync(gateCheckPath, "utf8").replace(
      "## Executable Dispatch",
      "## Request Activation\n\nUnowned duplicate guard residue.\n\n## Executable Dispatch",
    ),
    "utf8",
  );
  expectIntegrityFailure(/gate-check must contain exactly one Request Activation heading; found 2/);

  resetPluginFixture();
  const invalidSkillSlug = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));
  invalidSkillSlug.skillSet[0].slug = "../outside";
  writeFileSync(pluginDefinitionPath, `${JSON.stringify(invalidSkillSlug, null, 2)}\n`, "utf8");
  expectIntegrityFailure(/canonical AGDF plugin definition contains invalid skill slug: \.\.\/outside/);

  materializeCreateAgdfFixture();
  resetPluginFixture();
  replaceRequired(requestActivationContractPath, '"owner": "doctor"', '"owner": "comment-only-command"');
  const fixtureCommandRegistryPath = join(fixtureRoot, "create-agdf", "lib", "cli", "command-registry.js");
  writeFileSync(
    fixtureCommandRegistryPath,
    `${readFileSync(fixtureCommandRegistryPath, "utf8")}\n// command("comment-only-command", {})\nconst commandTemplate = \`\ncommand("comment-only-command", {})\n\`;\n`,
    "utf8",
  );
  expectIntegrityFailure(/request activation operation control\.doctor references unknown commandRegistry owner comment-only-command/);

  resetPluginFixture();
  writeFileSync(
    cleanReviewPath,
    readFileSync(cleanReviewPath, "utf8").replace("`--skill clean-implementation-review`", "`--skill missing-review`"),
    "utf8",
  );
  expectIntegrityFailure(/clean-implementation-review executable dispatch boundary missing:/);

  resetPluginFixture();
  const invalidDispatchMode = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));
  invalidDispatchMode.skillSet.find((skill) => skill.slug === "qa-gate").dispatch.mode = "deterministic_control";
  writeFileSync(pluginDefinitionPath, `${JSON.stringify(invalidDispatchMode, null, 2)}\n`, "utf8");
  expectIntegrityFailure(/judgement skill qa-gate must use judgement_required without a deterministic command/);

  resetPluginFixture();
  writeFileSync(
    qaGatePath,
    readFileSync(qaGatePath, "utf8").replace("Do not ask the user to paste or relink repository files that the skill can read itself", "Ask the user to supply repository evidence"),
    "utf8",
  );
  expectIntegrityFailure(/qa-gate evidence-discovery boundary missing:/);

  resetPluginFixture();
  writeFileSync(
    interactionContractPath,
    readFileSync(interactionContractPath, "utf8").replace("`attempted_not_applied`", "`attempt_outcome_removed`"),
    "utf8",
  );
  expectIntegrityFailure(/Runtime Contract must define visible fallback attempt outcomes/);

  resetPluginFixture();
  writeFileSync(
    releaseOrPath,
    readFileSync(releaseOrPath, "utf8").replace("16. After writing or updating", "15. After writing or updating"),
    "utf8",
  );
  expectIntegrityFailure(/release-or Rules numbering must be sequential from 1/);

  resetPluginFixture();
  writeFileSync(
    pluginDefinitionPath,
    readFileSync(pluginDefinitionPath, "utf8").replace('[\n      "approve",\n      "revise",\n      "decline",\n      "cancel"\n    ]', '[\n      "approve",\n      "decline",\n      "revise",\n      "cancel"\n    ]'),
    "utf8",
  );
  expectIntegrityFailure(/must preserve stable interaction option order/);

  resetPluginFixture();
  const pluginDefinition = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));
  delete pluginDefinition.interactions.surfaces.codex.approvalValueTransport;
  pluginDefinition.interactions.surfaces.codex.canonicalValueTransport = true;
  writeFileSync(pluginDefinitionPath, `${JSON.stringify(pluginDefinition, null, 2)}\n`, "utf8");
  expectIntegrityFailure(/codex interaction adapter must declare fail-closed canonical value transport/);

  resetPluginFixture();
  const localeRegistry = JSON.parse(readFileSync(interactionLocalesPath, "utf8"));
  delete localeRegistry.locales.de.interaction.declineDescription;
  writeFileSync(interactionLocalesPath, `${JSON.stringify(localeRegistry, null, 2)}\n`, "utf8");
  expectIntegrityFailure(/interaction locale registry de missing interaction copy declineDescription/);

  resetPluginFixture();
  writeFileSync(
    interactionContractPath,
    readFileSync(interactionContractPath, "utf8").replace("Never guess a path or emit a broken link", "Guess a path when convenient"),
    "utf8",
  );
  expectIntegrityFailure(/interaction contract ownership boundary missing: Never guess a path or emit a broken link/);

  for (const [badPattern, expected] of [
    ["| Status | Value |", /Gate Transition Card must not render approval-time pattern: \| Status \|/],
    ["- allowed_now: implementation", /Gate Transition Card must not render approval-time pattern: - allowed_now:/],
    ["Diagnostic code: AGDF_INTERNAL", /Gate Transition Card must not render approval-time pattern: Diagnostic code:/],
    ["Evidence: internal audit rows", /Gate Transition Card must not render approval-time pattern: Evidence:/],
    ["Question: Approve this gate?", /Gate Transition Card must not render approval-time pattern: Question:/],
    ["Next user gate: Brownfield Analysis", /Gate Transition Card must not render approval-time pattern: Next user gate: Brownfield Analysis/],
  ]) {
    resetPluginFixture();
    writeFileSync(
      interactionContractPath,
      readFileSync(interactionContractPath, "utf8").replace("## Gate Transition Card\n", `## Gate Transition Card\n\n${badPattern}\n`),
      "utf8",
    );
    expectIntegrityFailure(expected);
  }

  resetPluginFixture();
  writeFileSync(
    qualityContractPath,
    readFileSync(qualityContractPath, "utf8").replaceAll("design_gap", "design-classification-removed"),
    "utf8",
  );
  expectIntegrityFailure(/quality contract missing normalized review-gap invariant: design_gap/);

  resetPluginFixture();
  writeFileSync(
    cleanReviewPath,
    `${readFileSync(cleanReviewPath, "utf8")}\n| gap_type | meaning | routing_target |\n|---|---|---|\n`,
    "utf8",
  );
  expectIntegrityFailure(/clean-implementation-review SKILL\.md must not duplicate the complete normalized gap mapping/);

  console.log("Runtime integrity negative tests passed");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
