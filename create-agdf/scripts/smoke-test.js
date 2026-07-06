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
      const copilotSkillsReadmePath = join(tempDir, ".github", "skills", "README.md");
      const copilotSkillsReadme = readFileSync(copilotSkillsReadmePath, "utf8");
      if (!copilotAgents.includes("| `agdf-gate-check` |")) {
        throw new Error(`Missing prefixed Copilot skill routing for ${target}.`);
      }
      if (copilotAgents.includes("| `gate-check` |")) {
        throw new Error(`Copilot AGENTS.md for ${target} must not contain unprefixed skill routing.`);
      }
      for (const skillName of copilotSkillNames) {
        const skillPath = join(tempDir, ".github", "skills", skillName, "SKILL.md");
        if (!existsSync(skillPath)) {
          throw new Error(`Copilot surface for ${target} routes ${skillName} but does not expose .github/skills/${skillName}/SKILL.md.`);
        }
        if (!copilotAgents.includes(`\`${skillName}\``)) {
          throw new Error(`Copilot AGENTS.md for ${target} must route ${skillName}.`);
        }
        if (!copilotSkillsReadme.includes(`\`${skillName}\``)) {
          throw new Error(`Copilot skills README for ${target} must list ${skillName}.`);
        }
      }
      if (copilotAgents.includes("`agdf-brownfield-analysis`") && !existsSync(join(tempDir, ".github", "skills", "agdf-brownfield-analysis", "SKILL.md"))) {
        throw new Error("Copilot AGENTS.md routes agdf-brownfield-analysis but the skill is not exposed.");
      }

      const copilotInstructionsPath = join(tempDir, ".github", "copilot-instructions.md");
      const copilotInstructions = readFileSync(copilotInstructionsPath, "utf8");
      if (!copilotInstructions.includes("Apply AGDF natively from `AGENTS.md`, repository skills and live `.agdf/control/` state")) {
        throw new Error(`Copilot instructions for ${target} must state native AGDF operation before helper commands.`);
      }
      if (!copilotInstructions.includes("Use machine-readable checks such as `doctor --json`, `gate-check --json` or `delivery-map --json` as validators")) {
        throw new Error(`Copilot instructions for ${target} must classify machine-readable checks as validators.`);
      }
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

run("codex", [
  join(".agdf", "control", "config.json"),
  join(".agents", "plugins", "marketplace.json"),
  join("plugins", "agdf", ".codex-plugin", "plugin.json"),
  join("plugins", "agdf", "control", "templates", "AGDF_RUN.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "OR.md"),
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
  join(".agdf", "control", "config.json"),
  join(".agdf", "control", "README.md"),
  join(".agdf", "control", "templates", "AGDF_RUN.md"),
  join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join(".agdf", "control", "templates", "artefacts", "PRD.md"),
  join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join(".agdf", "control", "templates", "artefacts", "OR.md"),
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
  join(".agdf", "control", "config.json"),
  join(".agents", "plugins", "marketplace.json"),
  join("plugins", "agdf", ".codex-plugin", "plugin.json"),
  join("plugins", "agdf", "hooks", "hooks.json"),
  join("plugins", "agdf", "meta", "agdf-agent-router.md"),
  join("plugins", "agdf", "meta", "agdf-constitution.md"),
  join("plugins", "agdf", "skills", `${pluginDefinition.codex.skillPrefix}release-or`, "SKILL.md"),
  join(".agdf", "control", "README.md"),
  join(".agdf", "control", "templates", "MASTER_BACKLOG.md"),
  join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join(".agdf", "control", "templates", "artefacts", "TP.md"),
  join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join(".agdf", "control", "templates", "artefacts", "OR.md"),
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
      join(".agdf", "control", "config.json"),
      join(".agdf", "control", "README.md"),
      join(".agdf", "control", "AGDF_RUN.md"),
      join(".agdf", "control", "MASTER_BACKLOG.md"),
      join(".agdf", "control", "SOT_REGISTRY.md"),
      join(".agdf", "control", "CONTEXT_GRAPH.md"),
      join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json"),
      join(".agdf", "control", "templates", "artefacts", "UR.md"),
      join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
      join(".agdf", "control", "templates", "artefacts", "PRD.md"),
      join(".agdf", "control", "templates", "artefacts", "SD.md"),
      join(".agdf", "control", "templates", "artefacts", "TP.md"),
      join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
      join(".agdf", "control", "templates", "artefacts", "OR.md"),
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
      if (!gateCheckReport.allowed.includes("formulate and persist UR")) {
        throw new Error("Gate-check should require UR persistence before later artefacts.");
      }
      if (!gateCheckReport.next_allowed_action.includes("persist the UR draft")) {
        throw new Error("Gate-check should make UR drafting the constructive next action for a fresh scaffold.");
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
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-language-explicit-"));

  try {
    execFileSync(process.execPath, [binPath, "copilot", "--dir", tempDir, "--language", "de"], { stdio: "pipe" });
    const config = JSON.parse(readFileSync(join(tempDir, ".agdf", "control", "config.json"), "utf8"));
    if (config.artifact_language !== "de" || config.chat_language !== "de" || config.runtime_language !== "en") {
      throw new Error("Explicit --language de should set artefact/chat language to de and runtime language to en.");
    }
    if (config.source !== "parameter") {
      throw new Error(`Explicit --language should record source=parameter, got ${config.source}.`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-language-locale-"));

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], {
      stdio: "pipe",
      env: {
        ...process.env,
        LC_ALL: "",
        LC_MESSAGES: "",
        LANGUAGE: "",
        LANG: "de_DE.UTF-8",
      },
    });
    const config = JSON.parse(readFileSync(join(tempDir, ".agdf", "control", "config.json"), "utf8"));
    if (config.artifact_language !== "de" || config.chat_language !== "de") {
      throw new Error("System locale de_DE.UTF-8 should default artefact/chat language to de.");
    }
    if (config.source !== "system_locale" || config.detected_locale !== "de_DE.UTF-8") {
      throw new Error(`System locale detection should record source and locale, got ${config.source}/${config.detected_locale}.`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-implicit-consent-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | User said "ok, leg los" after a draft intent. |
| What is approved? | implicit consent only |
| What is missing? | exact Approval: UR |
| What is the next allowed action? | Request exact UR approval. |
| What is explicitly forbidden right now? | PRD, SD, TP, implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | missing | ok, leg los |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | draft |  |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| implicit consent | AGDF_RUN.md | UR gate | direct |

## Closeout

- next_allowed_action: Request exact UR approval.
`, "utf8");

    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block implicit consent, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.current_gate !== "UR") {
        throw new Error(`Gate-check should remain at UR for implicit consent, got ${gateCheckReport.current_gate}.`);
      }
      if (gateCheckReport.missing_approval !== "Approval: UR") {
        throw new Error(`Gate-check should require exact UR approval, got ${gateCheckReport.missing_approval}.`);
      }
      if (!gateCheckReport.forbidden.includes("implement code")) {
        throw new Error("Gate-check should forbid implementation when consent is only implicit.");
      }
    }
    if (!failed) {
      throw new Error("Gate-check should exit non-zero when consent is only implicit.");
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
      if (gateCheckReport.current_gate !== "UR") {
        throw new Error(`Gate-check should orient missing control files to UR, got ${gateCheckReport.current_gate}.`);
      }
      if (!gateCheckReport.allowed.includes("draft and persist the minimal UR for the requested change")) {
        throw new Error("Gate-check should allow minimal UR drafting when control files are missing.");
      }
      if (!gateCheckReport.next_allowed_action.includes("Initialize .agdf/control, draft the minimal UR")) {
        throw new Error("Gate-check should give init plus UR draft as the next action when control files are missing.");
      }
      if (!gateCheckReport.forbidden.includes("implement code")) {
        throw new Error("Gate-check should still forbid implementation when control files are missing.");
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
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-ur-triage-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Test UR is approved and persisted. |
| What is approved? | UR |
| What is missing? | Brownfield Review |
| What is the next allowed action? | Run Brownfield Review after G-00. |
| What is explicitly forbidden right now? | PRD and implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review |  | missing |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Test fixture uses a small structured slice.
- evidence: Brownfield Review marked not_applicable.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | AGDF_RUN.md | UR gate | direct |

## Closeout

- next_allowed_action: Run Brownfield Review after G-00.
`, "utf8");

    const gateCheckOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8" });
    const gateCheckReport = JSON.parse(gateCheckOutput);
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should open Brownfield Review after approved UR, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.current_gate !== "Brownfield Review") {
      throw new Error(`Gate-check should move from approved UR to Brownfield Review, got ${gateCheckReport.current_gate}.`);
    }
    if (!gateCheckReport.allowed.includes("run Brownfield Review after G-00")) {
      throw new Error("Gate-check should allow Brownfield Review after approved UR.");
    }
    if (!gateCheckReport.forbidden.includes("create PRD before Brownfield Review is resolved")) {
      throw new Error("Gate-check should forbid PRD before Brownfield Review is resolved.");
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

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |
| SD | not_applicable |  |
| TP | not_applicable |  |
| QA | not_applicable |  |
| UAT | not_applicable |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review | .agdf/control/artefacts/test-run/BROWNFIELD_REVIEW.md | not_applicable | No Brownfield impact. |
| PRD |  | draft |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Test fixture uses a small structured slice.
- evidence: Brownfield Review marked not_applicable.

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
    if (gateCheckReport.current_gate !== "PRD") {
      throw new Error(`Gate-check should move from approved UR to PRD, got ${gateCheckReport.current_gate}.`);
    }
    if (!gateCheckReport.forbidden.includes("implement code")) {
      throw new Error("Gate-check should forbid implementation immediately after UR approval.");
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
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-mode-slice-missing-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: Brownfield Review
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR is approved and Brownfield Review is done. |
| What is approved? | UR |
| What is missing? | Mode/Slice Decision |
| What is the next allowed action? | Decide process size. |
| What is explicitly forbidden right now? | PRD and implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review | .agdf/control/artefacts/test-run/BROWNFIELD_REVIEW.md | done | Existing owner and scope were inspected. |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Brownfield Review | AGDF_RUN.md | Mode selection | direct |

## Closeout

- next_allowed_action: Decide process size.
`, "utf8");

    const gateCheckOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8" });
    const gateCheckReport = JSON.parse(gateCheckOutput);
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should open Mode/Slice Decision after Brownfield Review, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.current_gate !== "Mode/Slice Decision") {
      throw new Error(`Gate-check should not jump to PRD without Mode/Slice Decision, got ${gateCheckReport.current_gate}.`);
    }
    if (!gateCheckReport.forbidden.includes("create PRD before process size is decided")) {
      throw new Error("Gate-check should forbid PRD before process size is decided.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-mode-slice-incomplete-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: Brownfield Review
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR is approved and Brownfield Review is done. |
| What is approved? | UR |
| What is missing? | Mode/Slice Decision evidence |
| What is the next allowed action? | Record Mode/Slice Decision with evidence. |
| What is explicitly forbidden right now? | Implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review | .agdf/control/artefacts/test-run/BROWNFIELD_REVIEW.md | done | Existing owner and scope were inspected. |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason:
- evidence:

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Brownfield Review | AGDF_RUN.md | Mode selection | direct |

## Closeout

- next_allowed_action: Record Mode/Slice Decision with evidence.
`, "utf8");

    const gateCheckOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8" });
    const gateCheckReport = JSON.parse(gateCheckOutput);
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should remain open for incomplete Mode/Slice Decision, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.current_gate !== "Mode/Slice Decision") {
      throw new Error(`Gate-check should not enter Quick Task Execution without Mode/Slice evidence, got ${gateCheckReport.current_gate}.`);
    }
    if (!gateCheckReport.forbidden.includes("implement code")) {
      throw new Error("Gate-check should forbid implementation while Mode/Slice Decision evidence is missing.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-delivery-map-chain-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");
  const backlogPath = join(tempDir, ".agdf", "control", "MASTER_BACKLOG.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(backlogPath, `# AGDF Master Backlog

## Active Backlog

| Prio | Key | Title | Status | UR | Brownfield Review | PRD | SD | TP | QA | OR | Current Spec | Notes |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | test-run | Delivery map test | in_progress | UR.md | BROWNFIELD_REVIEW.md | PRD.md |  |  |  | OR.md | PRD.md | needs SD |
`, "utf8");
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: SD
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR and PRD are approved. |
| What is approved? | UR, PRD |
| What is missing? | PRD relationship evidence |
| What is the next allowed action? | Fill Artefact Chain evidence. |
| What is explicitly forbidden right now? | SD approval |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review | .agdf/control/artefacts/test-run/BROWNFIELD_REVIEW.md | not_applicable | No Brownfield impact. |
| PRD | .agdf/control/artefacts/test-run/PRD.md | approved |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |
| PRD | derived_from | UR |  |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | AGDF_RUN.md | UR gate | direct |
| PRD approval | AGDF_RUN.md | PRD gate | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
|  | warn |  |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
|  | warn |  |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs:
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence:

## Closeout

- next_allowed_action: Fill Artefact Chain evidence.
`, "utf8");

    const deliveryMapOutput = execFileSync(process.execPath, [binPath, "delivery-map", "--dir", tempDir, "--json"], { encoding: "utf8" });
    const deliveryMapReport = JSON.parse(deliveryMapOutput);
    if (deliveryMapReport.status !== "revise") {
      throw new Error(`Delivery-map should revise approved PRD without relationship evidence, got ${deliveryMapReport.status}.`);
    }
    if (!deliveryMapReport.findings.some((finding) => finding.code === "AGDF_DELIVERY_RELATIONSHIP_EVIDENCE_MISSING")) {
      throw new Error("Delivery-map should report missing relationship evidence for approved PRD.");
    }
    if (!deliveryMapReport.relationships.some((relationship) => relationship.from === "PRD" && relationship.status === "missing_evidence")) {
      throw new Error("Delivery-map should expose PRD relationship status as missing_evidence.");
    }
    if (deliveryMapReport.backlog_pointers[0]?.brownfield_review !== "BROWNFIELD_REVIEW.md") {
      throw new Error("Delivery-map should preserve the Brownfield Review backlog pointer column.");
    }
    if (deliveryMapReport.backlog_pointers[0]?.or !== "OR.md") {
      throw new Error("Delivery-map should preserve the OR backlog pointer column.");
    }
    if (deliveryMapReport.backlog_pointers[0]?.current_spec !== "PRD.md") {
      throw new Error("Delivery-map should preserve the Current Spec column after OR.");
    }

    let gateCheckFailed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      gateCheckFailed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (!gateCheckReport.delivery_map?.findings?.some((finding) => finding.code === "AGDF_DELIVERY_RELATIONSHIP_EVIDENCE_MISSING")) {
        throw new Error("Gate-check should include delivery-map findings as evidence context.");
      }
    }
    if (!gateCheckFailed) {
      throw new Error("Gate-check should exit non-zero when delivery-map relationship evidence is missing.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-missing-ur-artifact-"));
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
| What is known? | Test UR was approved in chat. |
| What is approved? | UR |
| What is missing? | Durable UR artefact |
| What is the next allowed action? | Persist UR. |
| What is explicitly forbidden right now? | PRD and implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR |  | missing |  |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | AGDF_RUN.md | UR gate | direct |

## Closeout

- next_allowed_action: Persist UR.
`, "utf8");

    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block approved UR without durable artefact, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.blocking_reason !== "missing_durable_ur_artefact") {
        throw new Error(`Gate-check should report missing_durable_ur_artefact, got ${gateCheckReport.blocking_reason}.`);
      }
      if (gateCheckReport.current_gate !== "UR") {
        throw new Error(`Gate-check should remain at UR when durable UR is missing, got ${gateCheckReport.current_gate}.`);
      }
      if (!gateCheckReport.forbidden.includes("create PRD")) {
        throw new Error("Gate-check should forbid PRD before the approved UR is persisted.");
      }
    }
    if (!failed) {
      throw new Error("Gate-check should exit non-zero when UR approval has no durable artefact.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-missing-prd-artifact-"));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-05
- mode: structured_delivery
- current_gate: PRD
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR and PRD approval text exist. |
| What is approved? | UR, PRD |
| What is missing? | Durable PRD artefact |
| What is the next allowed action? | Persist PRD. |
| What is explicitly forbidden right now? | SD and implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| PRD |  | missing |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | AGDF_RUN.md | UR gate | direct |
| PRD approval | AGDF_RUN.md | PRD gate | direct |

## Closeout

- next_allowed_action: Persist PRD.
`, "utf8");

    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block approved PRD without durable artefact, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.blocking_reason !== "missing_durable_prd_artefact") {
        throw new Error(`Gate-check should report missing_durable_prd_artefact, got ${gateCheckReport.blocking_reason}.`);
      }
      if (gateCheckReport.current_gate !== "PRD") {
        throw new Error(`Gate-check should remain at PRD when durable PRD is missing, got ${gateCheckReport.current_gate}.`);
      }
      if (!gateCheckReport.forbidden.includes("create SD")) {
        throw new Error("Gate-check should forbid SD before the approved PRD is persisted.");
      }
    }
    if (!failed) {
      throw new Error("Gate-check should exit non-zero when PRD approval has no durable artefact.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

for (const missingCase of [
  {
    gate: "SD",
    nextAction: "Persist SD.",
    approvals: [
      "| UR | approved | Approval: UR |",
      "| PRD | approved | Approval: PRD |",
      "| SD | approved | Approval: SD |",
      "| TP | missing |  |",
    ],
    artefacts: [
      "| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |",
      "| PRD | .agdf/control/artefacts/test-run/PRD.md | approved |  |",
      "| SD |  | missing |  |",
    ],
    chain: [
      "| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |",
      "| PRD | derived_from | UR | PRD links to approved UR. |",
    ],
    reason: "missing_durable_sd_artefact",
  },
  {
    gate: "TP",
    nextAction: "Persist TP.",
    approvals: [
      "| UR | approved | Approval: UR |",
      "| PRD | approved | Approval: PRD |",
      "| SD | approved | Approval: SD |",
      "| TP | approved | Approval: TP |",
    ],
    artefacts: [
      "| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |",
      "| PRD | .agdf/control/artefacts/test-run/PRD.md | approved |  |",
      "| SD | .agdf/control/artefacts/test-run/SD.md | approved |  |",
      "| TP |  | missing |  |",
    ],
    chain: [
      "| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |",
      "| PRD | derived_from | UR | PRD links to approved UR. |",
      "| SD | derived_from | PRD | SD links to approved PRD. |",
    ],
    reason: "missing_durable_tp_artefact",
  },
  {
    gate: "QA",
    nextAction: "Persist QA report.",
    approvals: [
      "| UR | approved | Approval: UR |",
      "| PRD | approved | Approval: PRD |",
      "| SD | approved | Approval: SD |",
      "| TP | approved | Approval: TP |",
      "| QA | approved | Approval: QA |",
    ],
    artefacts: [
      "| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |",
      "| PRD | .agdf/control/artefacts/test-run/PRD.md | approved |  |",
      "| SD | .agdf/control/artefacts/test-run/SD.md | approved |  |",
      "| TP | .agdf/control/artefacts/test-run/TP.md | approved |  |",
      "| QA |  | missing |  |",
    ],
    chain: [
      "| UR | approved_by | Approval: UR | Approval evidence in AGDF_RUN.md |",
      "| PRD | derived_from | UR | PRD links to approved UR. |",
      "| SD | derived_from | PRD | SD links to approved PRD. |",
      "| TP | derived_from | SD | TP links to approved SD. |",
    ],
    reason: "missing_durable_qa_artefact",
  },
]) {
  const tempDir = mkdtempSync(join(tmpdir(), `create-agdf-gate-check-missing-${missingCase.gate.toLowerCase()}-artifact-`));
  const runPath = join(tempDir, ".agdf", "control", "AGDF_RUN.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- run_id: test-run
- started_at: 2026-07-05
- mode: structured_delivery
- current_gate: ${missingCase.gate}
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | ${missingCase.gate} approval text exists. |
| What is approved? | ${missingCase.gate} |
| What is missing? | Durable ${missingCase.gate} artefact |
| What is the next allowed action? | ${missingCase.nextAction} |
| What is explicitly forbidden right now? | Later gate work |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
${missingCase.approvals.join("\n")}

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
${missingCase.artefacts.join("\n")}

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
${missingCase.chain.join("\n")}

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| ${missingCase.gate} approval | AGDF_RUN.md | ${missingCase.gate} gate | direct |

## Closeout

- next_allowed_action: ${missingCase.nextAction}
`, "utf8");

    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block approved ${missingCase.gate} without durable artefact, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.blocking_reason !== missingCase.reason) {
        throw new Error(`Gate-check should report ${missingCase.reason}, got ${gateCheckReport.blocking_reason}.`);
      }
      if (gateCheckReport.current_gate !== missingCase.gate) {
        throw new Error(`Gate-check should remain at ${missingCase.gate}, got ${gateCheckReport.current_gate}.`);
      }
    }
    if (!failed) {
      throw new Error(`Gate-check should exit non-zero when ${missingCase.gate} approval has no durable artefact.`);
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
