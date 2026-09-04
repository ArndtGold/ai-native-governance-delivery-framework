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
const interactionContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "interaction.md");
const taskTargetContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "task-target-resolution.md");
const modesContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "modes.md");
const qualityContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "quality.md");
const gateCheckPath = join(fixtureRoot, "plugin", "skills", "gate-check", "SKILL.md");
const brownfieldSkillPath = join(fixtureRoot, "plugin", "skills", "brownfield-analysis", "SKILL.md");
const cleanReviewPath = join(fixtureRoot, "plugin", "skills", "clean-implementation-review", "SKILL.md");
const qaGatePath = join(fixtureRoot, "plugin", "skills", "qa-gate", "SKILL.md");
const releaseOrPath = join(fixtureRoot, "plugin", "skills", "release-or", "SKILL.md");
const interactionLocalesPath = join(fixtureRoot, "plugin", "meta", "agdf-interaction-locales.json");
const agentSkillsPolicyPath = join(fixtureRoot, "plugin", "meta", "agent-skills-conformance.json");
const agentSkillsValidatorPath = join(fixtureRoot, "plugin", "scripts", "agent-skills-conformance.mjs");

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

function resetPluginFixture() {
  rmSync(join(fixtureRoot, "plugin"), { recursive: true, force: true });
  copyPluginFixture();
}

function expectIntegrityFailure(expected) {
  const result = spawnSync(process.execPath, [integrityScript], {
    encoding: "utf8",
    env: { ...process.env, AGDF_RUNTIME_INTEGRITY_ROOT: fixtureRoot },
  });
  assert.notEqual(result.status, 0, "runtime integrity must reject a broken Verified Change surface");
  assert.match(`${result.stdout}\n${result.stderr}`, expected);
}

try {
  makeFixture();
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

  for (const boundary of [
    "Resolve or revalidate the primary task target before selecting repository control state.",
    "Derive repository activation only from the resolved governance target",
    "Select exactly one run and evaluate its current gate.",
    "Confirm that the required durable artefact is present and ready.",
    "Consume the canonical `approval_presentation` verbatim",
    "obtain deliberate input through the contract-selected native or exact-text path",
    "Revalidate the same target, run, gate and revision immediately after the response and before persistence.",
    "Persist only a currently valid exact approval through the existing control-state workflow.",
  ]) {
    resetPluginFixture();
    writeFileSync(gateCheckPath, readFileSync(gateCheckPath, "utf8").replace(boundary, "boundary removed"), "utf8");
    expectIntegrityFailure(/gate-check operational boundary missing:/);
  }

  resetPluginFixture();
  writeFileSync(
    taskTargetContractPath,
    readFileSync(taskTargetContractPath, "utf8").replace("## Direct Skill Invocation Preflight", "## Removed Direct Skill Invocation Preflight"),
    "utf8",
  );
  expectIntegrityFailure(/shared direct skill target-preflight boundary missing: ## Direct Skill Invocation Preflight/);

  resetPluginFixture();
  writeFileSync(
    cleanReviewPath,
    readFileSync(cleanReviewPath, "utf8").replace("request only the normalized recovery action and stop", "continue without a resolved target"),
    "utf8",
  );
  expectIntegrityFailure(/clean-implementation-review direct skill target-preflight boundary missing:/);

  resetPluginFixture();
  writeFileSync(
    qaGatePath,
    readFileSync(qaGatePath, "utf8").replace("Do not ask the user to paste or relink repository files that the skill can read itself", "Ask the user to supply repository evidence"),
    "utf8",
  );
  expectIntegrityFailure(/qa-gate evidence-discovery boundary missing:/);

  resetPluginFixture();
  writeFileSync(
    gateCheckPath,
    readFileSync(gateCheckPath, "utf8").replaceAll("`status_presentation.markdown` verbatim", "status presentation removed"),
    "utf8",
  );
  expectIntegrityFailure(/gate-check must consume the deterministic operational status presentation/);

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
