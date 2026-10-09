// Shared assertions: run early during build and retain coverage in the full smoke suite.
import "../../../scripts/support/english-locale.js";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { runRootFromStatePath, sealRunState } from "#agdf-core/control-state/run-seal.js";

const packageRoot = new URL("..", import.meta.url);
const binPath = fileURLToPath(new URL("./bin/create-agdf.js", packageRoot));
const generatedRoot = fileURLToPath(new URL("./generated/", packageRoot));
function runJson(args) {
  try {
    return JSON.parse(execFileSync(process.execPath, [binPath, ...args], { encoding: "utf8", stdio: "pipe" }));
  } catch (error) {
    if (error.stdout) return JSON.parse(error.stdout.toString());
    throw error;
  }
}
function sealFixtureRun(path) {
  writeFileSync(path, sealRunState(runRootFromStatePath(path), readFileSync(path, "utf8")), "utf8");
}

export function checkGeneratedGateContracts() {
  const transitionSkillPaths = [
    [join(generatedRoot, "plugins", "agdf", "skills", "gate-check", "SKILL.md"), "`../../meta/contracts/interaction.md`"],
    [join(generatedRoot, "plugins", "copilot", "agdf", "skills", "agdf-gate-check", "SKILL.md"), "`../contracts/interaction.md`"],
    [join(generatedRoot, ".opencode", "skills", "agdf-gate-check", "SKILL.md"), "`../../contracts/interaction.md`"],
  ];
  const transitionContractPaths = [
    join(generatedRoot, "plugins", "agdf", "meta", "contracts", "interaction.md"),
    join(generatedRoot, "plugins", "copilot", "agdf", "skills", "contracts", "interaction.md"),
    join(generatedRoot, ".opencode", "contracts", "interaction.md"),
  ];
  const transitionLocalePaths = [
    join(generatedRoot, "plugins", "agdf", "meta", "agdf-interaction-locales.json"),
    join(generatedRoot, "plugins", "copilot", "agdf", "skills", "agdf-interaction-locales.json"),
    join(generatedRoot, ".opencode", "agdf-interaction-locales.json"),
  ];

  for (const [path, interactionReference] of transitionSkillPaths) {
    const content = readFileSync(path, "utf8");
    const hasSingleInteractionReference = (text) => text.split(interactionReference).length - 1 === 1;
    if (!content.includes("Dispatch is non-authorizing.")
      || !content.includes("`skill.gate-check`: dispatch first; changes use `intake`. No prior repository/control inspection.")
      || !content.includes("`delivery.start`: resolve target once; unresolved: orient and stop.")
      || !content.includes("For a result with `terminal: true`")
      || !content.includes("the entire assistant response must consist only of host_action.text, copied verbatim")
      || !content.includes("Add no question, explanation, heading, citation, link or other surrounding text")
      || !content.includes("Only explicit trusted `instruction_only` runtime evidence enables fallback.")
      || !content.includes("Existing run binding requires explicit selection, confirmed continuation or unequivocal UR scope")
      || !content.includes("`expected_revision_id`")
      || !content.includes("`continue_delivery: true`")
      || !hasSingleInteractionReference(content)
      || content.includes("Consume the canonical `approval_presentation` verbatim")
      || content.includes("`status_presentation.markdown` verbatim")
      || content.includes("| Run status | Value |")
      || content.includes("Surface behavior:")) {
      throw new Error(`Generated gate-check surface must preserve compact orchestration and single contract ownership: ${path}`);
    }
    for (const invalid of [
      `${content}\n- ${interactionReference}\n`,
      content.replace(interactionReference, ""),
      content.replace(interactionReference, interactionReference.replace("contracts/", "other/")),
    ]) {
      if (hasSingleInteractionReference(invalid)) {
        throw new Error(`Generated gate-check reference check must reject duplicate, missing and wrong contract paths: ${path}`);
      }
    }
  }

  for (const path of transitionContractPaths) {
    const content = readFileSync(path, "utf8");
    if (!content.includes("## Gate Transition Card")
      || !content.includes("answers exactly three user questions")
      || !content.includes("Run Status Card remains the operational,")
      || !content.includes("must not be a Markdown table or dashboard")
      || !content.includes("never bind an earlier reply to a subsequently prepared revision.")) {
      throw new Error(`Generated runtime contract must preserve the transition-card and status-projection boundary: ${path}`);
    }
  }

  const canonicalLocales = readFileSync(transitionLocalePaths[0], "utf8");
  for (const path of transitionLocalePaths) {
    if (readFileSync(path, "utf8") !== canonicalLocales) {
      throw new Error(`Generated interaction locale registry must remain byte-identical: ${path}`);
    }
  }
}

export function checkLateGateTransitions() {
  const cases = [
    { name: "brownfield", steps: {}, qa: "missing", qaArtefact: ["", "missing"], uat: "missing", gate: "Brownfield Analysis", missing: "none", allowed: "run Brownfield Analysis for the approved TP scope", forbidden: "implement before Brownfield evidence supports the approved TP path", next: "Run Brownfield Analysis for the approved TP scope before CD+Tests." },
    { name: "cd-tests", steps: { "Brownfield Analysis": "done" }, qa: "missing", qaArtefact: ["", "missing"], uat: "missing", gate: "CD+Tests", missing: "none", allowed: "implement the approved TP tasks", forbidden: "claim QA pass", next: "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR." },
    { name: "cr", steps: { "Brownfield Analysis": "done", "CD+Tests": "done" }, qa: "missing", qaArtefact: ["", "missing"], uat: "missing", gate: "CR", missing: "none", allowed: "run mandatory code review", forbidden: "claim QA pass", next: "Run Code Review for the implemented TP scope and resolve blocking findings before QA." },
    { name: "qa-revise-missing-findings", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "missing", qaArtefact: ["QA_REPORT.md", "revise"], uat: "missing", gate: "QA", missing: "none", allowed: "route the blocking QA findings to their authoritative owner", forbidden: "request QA approval", forbiddenExtra: ["implement code", "request UAT approval"], next: "Resolve or route the QA revise findings through their authoritative owner before dependent work. Do not request Approval: QA from a revise report.", status: "open" },
    { name: "qa-block", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "missing", qaArtefact: ["QA_REPORT.md", "block"], uat: "missing", gate: "QA", missing: "none", allowed: "route the blocking QA findings to their authoritative owner", forbidden: "request QA approval", next: "Resolve or route the blocking QA findings via their authoritative owner, then rerun the required steps. Do not request Approval: QA from a block report.", status: "blocked" },
    { name: "approved-qa-block", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "approved", qaArtefact: ["QA_REPORT.md", "block"], uat: "missing", gate: "QA", missing: "none", allowed: "complete the current control-state fields", forbidden: "create later-gate artefacts beyond the current allowed gate", next: "Update the QA artefact row in the selected RUN_STATE.md to use the gate-specific durable status vocabulary.", status: "blocked" },
    { name: "qa-approval", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "missing", qaArtefact: ["QA_REPORT.md", "pass"], uat: "missing", gate: "QA", missing: "Approval: QA", allowed: "run QA gate", forbidden: "request UAT approval", next: "persist or refine the QA report" },
    { name: "brownfield-not-applicable", steps: { "Brownfield Analysis": "not_applicable", "CD+Tests": "done", CR: "done" }, qa: "missing", qaArtefact: ["QA_REPORT.md", "pass"], uat: "missing", gate: "QA", missing: "Approval: QA", allowed: "run QA gate", forbidden: "request UAT approval", next: "persist or refine the QA report" },
    { name: "mandatory-not-applicable", steps: { "Brownfield Analysis": "not_applicable", "CD+Tests": "not_applicable", CR: "not_applicable" }, qa: "missing", qaArtefact: ["QA_REPORT.md", "pass"], uat: "missing", gate: "CD+Tests", missing: "none", allowed: "implement the approved TP tasks", forbidden: "claim QA pass", next: "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR." },
    { name: "premature-qa", steps: {}, qa: "approved", qaArtefact: ["QA_REPORT.md", "pass"], uat: "missing", gate: "Brownfield Analysis", missing: "none", allowed: "run Brownfield Analysis for the approved TP scope", forbidden: "implement before Brownfield evidence supports the approved TP path", next: "Run Brownfield Analysis for the approved TP scope before CD+Tests." },
    { name: "premature-uat", steps: { "Brownfield Analysis": "done" }, qa: "approved", qaArtefact: ["QA_REPORT.md", "pass"], uat: "approved", gate: "CD+Tests", missing: "none", allowed: "implement the approved TP tasks", forbidden: "claim QA pass", next: "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR." },
    { name: "qa-report", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "approved", qaArtefact: ["", "missing"], uat: "missing", gate: "QA", missing: "none", allowed: "persist the approved QA report in a stable artefact path such as .agdf/control/artefacts/<key>/QA_REPORT.md", forbidden: "create UAT", next: "Persist the approved QA report and link it from the AGDF control state before continuing.", status: "blocked" },
    { name: "uat", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "pass", qaArtefact: ["QA_REPORT.md", "passed"], uat: "missing", gate: "UAT", missing: "Approval: UAT", allowed: "request exact UAT approval", forbidden: "release", next: "Request exact approval: Approval: UAT before delivery handoff." },
    { name: "or", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "passed", qaArtefact: ["QA_REPORT.md", "pass"], uat: "approved", gate: "OR", missing: "none", allowed: "produce OR or delivery closeout", forbidden: "commit, push, open PR or release automatically", next: "Produce delivery closeout or requested handoff; do not perform VCS actions automatically." },
  ];

  for (const testCase of cases) {
    const tempDir = mkdtempSync(join(tmpdir(), `create-agdf-late-gate-${testCase.name}-`));
    const runId = `late-gate-${testCase.name}`;
    const runPath = join(tempDir, ".agdf", "control", "runs", runId, "RUN_STATE.md");
    try {
      execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
      execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", runId], { stdio: "pipe" });
      const internalRows = ["Brownfield Analysis", "CD+Tests", "CR"]
        .map((step) => `| ${step} | ${testCase.steps[step] ? `${step.replace(/[^A-Za-z]+/g, "_").toUpperCase()}.md` : ""} | ${testCase.steps[step] ?? "missing"} | |`)
        .join("\n");
      writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: ${runId}
- lifecycle: active
- revision: 1
- revision_id: 22222222-2222-4222-8222-222222222222
- started_at: 2026-07-13
- mode: structured_delivery
- current_gate: OR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approved TP and explicit late-gate artefact state. |
| What is approved? | UR, PRD, SD and TP; QA/UAT according to fixture. |
| What is missing? | The next canonical late-gate step. |
| What is the next allowed action? | Derive it from the canonical transition model. |
| What is explicitly forbidden right now? | Skipping the canonical transition model. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | approved | Approval: SD |
| TP | approved | Approval: TP |
| QA | ${testCase.qa} | QA evidence |
| UAT | ${testCase.uat} | UAT evidence |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | UR.md | approved | |
| Brownfield Review | BROWNFIELD_REVIEW.md | done | |
| PRD | PRD.md | approved | |
| SD | SD.md | approved | |
| TP | TP.md | approved | |
${internalRows}
| QA | ${testCase.qaArtefact[0]} | ${testCase.qaArtefact[1]} | |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Late-gate transition fixture.
- evidence: BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | exact approval |
| PRD | derived_from | UR | linked |
| SD | derived_from | PRD | linked |
| TP | derived_from | SD | linked |
| QA_REPORT | tests | TP | linked when present |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| late-gate fixture | build-contract-checks.js | transition | direct |

## Closeout

- next_allowed_action: ${testCase.next}
`, "utf8");
      sealFixtureRun(runPath);
      const report = runJson(["gate-check", "--dir", tempDir, "--run", runId, "--json"]);
      if (report.current_gate !== testCase.gate
        || report.missing_approval !== testCase.missing
        || report.status !== (testCase.status ?? "open")
        || !report.allowed.includes(testCase.allowed)
        || !report.forbidden.includes(testCase.forbidden)
        || (testCase.forbiddenExtra ?? []).some((action) => !report.forbidden.includes(action))
        || report.next_allowed_action !== testCase.next) {
        throw new Error(`Late-gate ${testCase.name} mismatch: ${JSON.stringify({ status: report.status, gate: report.current_gate, missing: report.missing_approval, allowed: report.allowed, forbidden: report.forbidden, next: report.next_allowed_action, doctor: report.doctor_report?.findings })}`);
      }
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  }
}
