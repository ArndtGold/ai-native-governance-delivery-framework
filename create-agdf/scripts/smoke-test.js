import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = new URL("..", import.meta.url);
const binPath = fileURLToPath(new URL("./bin/create-agdf.js", packageRoot));
const pluginDefinitionPath = fileURLToPath(new URL("../plugin/meta/agdf-plugin.definition.json", packageRoot));
const pluginDefinition = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));
const codexSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.codex.skillPrefix}${skill.slug}`);
const copilotSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.copilot.skillPrefix}${skill.slug}`);

function run(target, expectedFiles) {
  const tempDir = mkdtempSync(join(tmpdir(), `create-agdf-${target}-`));

  try {
    execFileSync(process.execPath, [binPath, target, "--dir", tempDir], { stdio: "pipe" });

    for (const relativePath of expectedFiles) {
      const outputPath = join(tempDir, relativePath);
      if (!existsSync(outputPath)) {
        throw new Error(`Missing expected file for ${target}: ${relativePath}`);
      }
    }

    if (target === "codex" || target === "both") {
      const pluginRouterPath = join(tempDir, "plugins", "agdf", "meta", "agdf-agent-router.md");
      const pluginRouter = readFileSync(pluginRouterPath, "utf8");
      if (!pluginRouter.includes("| `gate-check` |")) {
        throw new Error(`Missing unprefixed plugin skill routing for ${target}.`);
      }
      if (pluginRouter.includes("`agdf-gate-check`")) {
        throw new Error(`Plugin router for ${target} must not contain Copilot-prefixed skill names.`);
      }
    }

    if (target === "copilot" || target === "both") {
      const copilotAgentsPath = join(tempDir, "AGENTS.md");
      const copilotAgents = readFileSync(copilotAgentsPath, "utf8");
      if (!copilotAgents.includes("| `agdf-gate-check` |")) {
        throw new Error(`Missing prefixed Copilot skill routing for ${target}.`);
      }
      if (copilotAgents.includes("| `gate-check` |")) {
        throw new Error(`Copilot AGENTS.md for ${target} must not contain unprefixed skill routing.`);
      }
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

run("codex", [
  join(".agents", "plugins", "marketplace.json"),
  join("plugins", "agdf", ".codex-plugin", "plugin.json"),
  join("plugins", "agdf", "control", "templates", "AGDF_RUN.md"),
  join("plugins", "agdf", "hooks", "hooks.json"),
  join("plugins", "agdf", "hooks", "session-start.sh"),
  join("plugins", "agdf", "meta", "agdf-agent-router.md"),
  join("plugins", "agdf", "meta", "agdf-constitution.md"),
  join("plugins", "agdf", "meta", "agdf-plugin.definition.json"),
  join("plugins", "agdf", "meta", "agdf-runtime-contract.md"),
  join("plugins", "agdf", "meta", "agdf-tenets.md"),
  ...["gate-check", "code-review", "qa-gate"].map((slug) => join("plugins", "agdf", "skills", `${pluginDefinition.codex.skillPrefix}${slug}`, "SKILL.md")),
]);
run("copilot", [
  "AGENTS.md",
  join(".agdf", "control", "README.md"),
  join(".agdf", "control", "templates", "AGDF_RUN.md"),
  join(".agdf", "control", "templates", "SOT_REGISTRY.md"),
  join(".agdf", "control", "templates", "CONTEXT_GRAPH.md"),
  join(".agdf", "control", "templates", "AGENT_QUALITY_CONTRACTS.json"),
  join(".github", "copilot-instructions.md"),
  join(".github", "instructions", "agdf-governance.instructions.md"),
  join(".github", "skills", "README.md"),
  join(".github", "skills", pluginDefinition.copilot.runtimeContractFileName),
  ...["gate-check", "code-review", "qa-gate"].map((slug) => join(".github", "skills", `${pluginDefinition.copilot.skillPrefix}${slug}`, "SKILL.md")),
]);
run("both", [
  "AGENTS.md",
  join(".agents", "plugins", "marketplace.json"),
  join("plugins", "agdf", ".codex-plugin", "plugin.json"),
  join("plugins", "agdf", "hooks", "hooks.json"),
  join("plugins", "agdf", "meta", "agdf-agent-router.md"),
  join("plugins", "agdf", "meta", "agdf-constitution.md"),
  join("plugins", "agdf", "skills", `${pluginDefinition.codex.skillPrefix}release-or`, "SKILL.md"),
  join(".agdf", "control", "README.md"),
  join(".agdf", "control", "templates", "MASTER_BACKLOG.md"),
  join(".github", "copilot-instructions.md"),
  join(".github", "instructions", "agdf-governance.instructions.md"),
  join(".github", "skills", "README.md"),
  join(".github", "skills", pluginDefinition.copilot.runtimeContractFileName),
  join(".github", "skills", `${pluginDefinition.copilot.skillPrefix}code-review`, "SKILL.md"),
  join(".github", "skills", `${pluginDefinition.copilot.skillPrefix}release-or`, "SKILL.md"),
]);

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-init-"));

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });

    for (const relativePath of [
      join(".agdf", "control", "README.md"),
      join(".agdf", "control", "AGDF_RUN.md"),
      join(".agdf", "control", "MASTER_BACKLOG.md"),
      join(".agdf", "control", "SOT_REGISTRY.md"),
      join(".agdf", "control", "CONTEXT_GRAPH.md"),
      join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json"),
    ]) {
      if (!existsSync(join(tempDir, relativePath))) {
        throw new Error(`Missing live control file for init: ${relativePath}`);
      }
    }

    const doctorOutput = execFileSync(process.execPath, [binPath, "doctor", "--dir", tempDir, "--json"], { encoding: "utf8" });
    const doctorReport = JSON.parse(doctorOutput);
    if (doctorReport.status !== "revise") {
      throw new Error(`Doctor should classify a fresh unfilled control scaffold as revise, got ${doctorReport.status}.`);
    }
    if (!doctorReport.findings.some((finding) => finding.code === "AGDF_CURRENT_GATE_MISSING")) {
      throw new Error("Doctor should report a missing current gate for a fresh control scaffold.");
    }
    if (!doctorReport.findings.some((finding) => finding.code === "AGDF_NEXT_ALLOWED_ACTION_MISSING")) {
      throw new Error("Doctor should report a missing next allowed action for a fresh control scaffold.");
    }
    if (!doctorReport.findings.some((finding) => finding.code === "AGDF_EVIDENCE_EMPTY")) {
      throw new Error("Doctor should report empty evidence for a fresh control scaffold.");
    }

    let gateCheckFailed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      gateCheckFailed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block a fresh unfilled control scaffold, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.current_gate !== "UR") {
        throw new Error(`Gate-check should fall back to UR for a fresh scaffold, got ${gateCheckReport.current_gate}.`);
      }
      if (gateCheckReport.doctor_status !== "revise") {
        throw new Error(`Gate-check should embed the doctor revise status, got ${gateCheckReport.doctor_status}.`);
      }
      if (!gateCheckReport.doctor_report?.findings?.some((finding) => finding.code === "AGDF_CURRENT_GATE_MISSING")) {
        throw new Error("Gate-check should include the doctor report as evidence.");
      }
      if (gateCheckReport.evidence_refs.length !== 0) {
        throw new Error("Gate-check should not expose empty template evidence rows.");
      }
    }
    if (!gateCheckFailed) {
      throw new Error("Gate-check should exit non-zero when a fresh control scaffold is blocked.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-doctor-missing-"));

  try {
    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "doctor", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const output = error.stdout.toString();
      const doctorReport = JSON.parse(output);
      if (doctorReport.status !== "block") {
        throw new Error(`Doctor should block when live control files are missing, got ${doctorReport.status}.`);
      }
      if (!doctorReport.findings.some((finding) => finding.code === "AGDF_CONTROL_FILE_MISSING")) {
        throw new Error("Doctor should report missing live control files.");
      }
    }

    if (!failed) {
      throw new Error("Doctor should exit non-zero when live control files are missing.");
    }

    let gateCheckFailed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      gateCheckFailed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked" || gateCheckReport.doctor_status !== "block") {
        throw new Error("Gate-check should block when doctor blocks missing live control files.");
      }
      if (gateCheckReport.blocking_reason !== "AGDF_CONTROL_FILE_MISSING") {
        throw new Error(`Gate-check should expose the doctor blocker, got ${gateCheckReport.blocking_reason}.`);
      }
    }

    if (!gateCheckFailed) {
      throw new Error("Gate-check should exit non-zero when live control files are missing.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-open-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-05
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Test UR is approved. |
| What is approved? | UR |
| What is missing? | PRD |
| What is the next allowed action? | Draft PRD. |
| What is explicitly forbidden right now? | Implementation |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | not_applicable |  |
| SD | not_applicable |  |
| TP | not_applicable |  |
| QA | not_applicable |  |
| UAT | not_applicable |  |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | AGDF_RUN.md | UR gate | direct |

## Closeout

- next_allowed_action: Draft PRD.
`, "utf8");

    const gateCheckOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8" });
    const gateCheckReport = JSON.parse(gateCheckOutput);
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should be open when current gate is approved and next action exists, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.doctor_status !== "warn") {
      throw new Error(`Gate-check should preserve non-blocking doctor warnings, got ${gateCheckReport.doctor_status}.`);
    }
    if (gateCheckReport.next_allowed_action !== "Draft PRD.") {
      throw new Error(`Gate-check should expose the next allowed action, got ${gateCheckReport.next_allowed_action}.`);
    }
    if (gateCheckReport.evidence_refs.length !== 1 || gateCheckReport.evidence_refs[0].evidence !== "UR approval") {
      throw new Error("Gate-check should expose filled evidence references.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-copilot-existing-agents-"));
  const existingAgentsPath = join(tempDir, "AGENTS.md");

  try {
    writeFileSync(existingAgentsPath, "# Existing repo instructions\n", "utf8");
    execFileSync(process.execPath, [binPath, "copilot", "--dir", tempDir], { stdio: "pipe" });

    if (readFileSync(existingAgentsPath, "utf8") !== "# Existing repo instructions\n") {
      throw new Error("Existing AGENTS.md should be preserved when no --force flag is used.");
    }

    const agdfFragmentPath = join(tempDir, "AGENTS.agdf.md");
    if (!existsSync(agdfFragmentPath)) {
      throw new Error("Missing AGENTS.agdf.md fragment for existing AGENTS.md scenario.");
    }
    if (!readFileSync(agdfFragmentPath, "utf8").includes("| `agdf-gate-check` |")) {
      throw new Error("AGENTS.agdf.md must contain prefixed Copilot skill routing.");
    }

    const expectedSkillPath = join(tempDir, ".github", "skills", `${pluginDefinition.copilot.skillPrefix}gate-check`, "SKILL.md");
    if (!existsSync(expectedSkillPath)) {
      throw new Error("Missing repository skills for existing AGENTS.md scenario.");
    }

    const expectedInstructionsPath = join(tempDir, ".github", "copilot-instructions.md");
    if (!existsSync(expectedInstructionsPath)) {
      throw new Error("Missing Copilot instructions for existing AGENTS.md scenario.");
    }

    const expectedControlPath = join(tempDir, ".agdf", "control", "templates", "AGDF_RUN.md");
    if (!existsSync(expectedControlPath)) {
      throw new Error("Missing AGDF control scaffold for existing AGENTS.md scenario.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

console.log("create-agdf smoke test passed");
