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
const pluginDefinitionPath = join(fixtureRoot, "plugin", "meta", "agdf-plugin.definition.json");
const interactionContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "interaction.md");
const gateCheckPath = join(fixtureRoot, "plugin", "skills", "gate-check", "SKILL.md");
const interactionLocalesPath = join(fixtureRoot, "plugin", "meta", "agdf-interaction-locales.json");

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
  unlinkSync(join(fixtureRoot, "plugin", "runtime"));
  mkdirSync(join(fixtureRoot, "plugin", "runtime"));
  writeFileSync(join(fixtureRoot, "plugin", "runtime", "runtime-manifest.json"), "{}\n");
  expectIntegrityFailure(/source plugin must not contain generated runtime/);

  resetPluginFixture();
  unlinkSync(templatePath);
  expectIntegrityFailure(/plugin\/control\/templates\/artefacts\/VERIFIED_CHANGE\.md missing/);

  resetPluginFixture();
  const template = readFileSync(templatePath, "utf8").replace("canonical_owner", "canonical_owner_removed");
  writeFileSync(templatePath, template, "utf8");
  expectIntegrityFailure(/VERIFIED_CHANGE\.md missing control field: canonical_owner/);

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
    "Select exactly one run and evaluate its current gate.",
    "Confirm that the required durable artefact is present and ready.",
    "Consume the canonical `approval_presentation` verbatim",
    "obtain deliberate input through the contract-selected native or exact-text path",
    "Revalidate the same run, gate and revision immediately after the response and before persistence.",
    "Persist only a currently valid exact approval through the existing control-state workflow.",
  ]) {
    resetPluginFixture();
    writeFileSync(gateCheckPath, readFileSync(gateCheckPath, "utf8").replace(boundary, "boundary removed"), "utf8");
    expectIntegrityFailure(/gate-check operational boundary missing:/);
  }

  resetPluginFixture();
  writeFileSync(
    interactionContractPath,
    readFileSync(interactionContractPath, "utf8").replace("`attempted_not_applied`", "`attempt_outcome_removed`"),
    "utf8",
  );
  expectIntegrityFailure(/Runtime Contract must define visible fallback attempt outcomes/);

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

  console.log("Runtime integrity negative tests passed");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
