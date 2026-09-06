import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  aggregate,
  createRun,
  discoverRuns,
  migrateLegacy,
  parseRunState,
  renderLegacyProjection,
  resolveRuns,
  verifyLegacyProjection,
  writeRun,
  validateGateApprovalResponse,
} from "../lib/control-state/index.js";
import { parseControlState, RUN_ID_PATTERN } from "../lib/control-state/run-state-parser.js";
import { validateRunIdentity, RUN_ID_PATTERN as identityRunIdPattern } from "../lib/control-state/run-identity.js";
import { postApprovalTransition } from "../lib/control-evaluation/gate-check.js";
import { transitionDecisionForRunState } from "../lib/control-evaluation/gate-policy.js";
import { normalizeBacklogStatus } from "../lib/control-evaluation/shared.js";
import { buildBreadcrumb, buildTransitionNarration, collapseInternalState } from "../lib/interaction-presentation.js";

const pluginRoot = join(import.meta.dirname, "..", "..", "plugin");
const localeRegistry = JSON.parse(readFileSync(join(pluginRoot, "meta", "agdf-interaction-locales.json"), "utf8"));

const root = mkdtempSync(join(tmpdir(), "agdf-control-state-"));
const cli = join(import.meta.dirname, "..", "bin", "create-agdf.js");
try {
  const approvalCandidate = Object.freeze({
    response: "Approval: TP",
    responseOrigin: "deliberate_user_input",
    expectedApproval: "Approval: TP",
    expectedRunId: "run-a",
    currentRunId: "run-a",
    expectedGate: "TP",
    currentGate: "TP",
    expectedRevisionId: "revision-a",
    currentRevisionId: "revision-a",
    durableArtefactReady: true,
  });
  assert.deepEqual(validateGateApprovalResponse(approvalCandidate), { accepted: true, reason: "accepted" });
  assert.deepEqual(validateGateApprovalResponse({ ...approvalCandidate, responseOutcome: "approve" }), { accepted: true, reason: "accepted" });
  assert.deepEqual(validateGateApprovalResponse({ ...approvalCandidate, response: "Approve", responseOutcome: "approve" }), { accepted: false, reason: "wrong_or_non_approval_response" });
  for (const [name, override, reason] of [
    ["unavailable adapter result", { response: undefined, noResponse: true }, "no_response"],
    ["non-deliberate response", { responseOrigin: "hook" }, "non_deliberate_response"],
    ["empty response", { response: "" }, "empty_response"],
    ["revise", { responseOutcome: "revise" }, "revision_requested"],
    ["decline", { responseOutcome: "decline" }, "declined"],
    ["cancel", { responseOutcome: "cancel" }, "cancelled"],
    ["timeout", { timedOut: true }, "timed_out"],
    ["invalid", { response: "Approve" }, "wrong_or_non_approval_response"],
    ["stale outcome", { responseOutcome: "stale" }, "stale_response"],
    ["formula mismatch", { expectedApproval: "Approval: QA" }, "approval_formula_mismatch"],
    ["stale gate", { currentGate: "QA" }, "changed_or_wrong_gate"],
    ["changed run", { currentRunId: "run-b" }, "changed_or_wrong_run"],
    ["stale revision", { currentRevisionId: "revision-b" }, "stale_revision"],
    ["missing artefact", { durableArtefactReady: false }, "durable_artefact_not_ready"],
  ]) {
    const before = JSON.stringify(approvalCandidate);
    assert.deepEqual(
      validateGateApprovalResponse({ ...approvalCandidate, ...override }),
      { accepted: false, reason },
      name,
    );
    assert.equal(JSON.stringify(approvalCandidate), before, `${name} must not mutate control input`);
  }

  execFileSync(process.execPath, [cli, "init", "--dir", root]);
  const a = createRun(root, "run-a", "## Objective\n\nA\n");
  assert.equal(discoverRuns(root).length, 1);
  assert.equal(resolveRuns(root, {}).run.run_id, "run-a");
  createRun(root, "run-b", "## Objective\n\nB\n");
  assert.deepEqual(discoverRuns(root).map((run) => run.run_id), ["run-a", "run-b"]);
  assert.throws(() => resolveRuns(root, {}), /AGDF_ACTIVE_RUN_AMBIGUOUS/);
  assert.equal(resolveRuns(root, { runIdArg: "run-b" }).run.run_id, "run-b");
  assert.equal(resolveRuns(root, { runIdEnv: "run-a" }).selection_source, "environment");
  assert.equal(resolveRuns(root, { runIdArg: "run-a", runIdEnv: "run-a" }).run.run_id, "run-a");
  assert.throws(() => resolveRuns(root, { runIdArg: "unknown" }), /AGDF_RUN_NOT_SELECTABLE/);
  assert.throws(() => resolveRuns(root, { runIdArg: "run-a", allActive: true }), /AGDF_SELECTOR_CONFLICT/);
  assert.throws(
    () => resolveRuns(root, { runIdArg: "run-a", runIdEnv: "run-b" }),
    /AGDF_SELECTOR_CONFLICT/,
  );
  const parsed = parseRunState(readFileSync(a, "utf8"), "run-a");
  assert.equal(parsed.valid, true);
  const controlStateFixture = `# AGDF Run State

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| QA | pass | QA report |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| Brownfield Review | BROWNFIELD_REVIEW.md | done | reviewed |
| Brownfield Analysis | BROWNFIELD_ANALYSIS.md | done | analysed |
| CD+Tests | CD_TESTS.md | done | tested |
| CR | CODE_REVIEW.md | done | reviewed |
| QA | QA_REPORT.md | passed | report status remains passed |
| OR | \`OR.md\` | done | closed |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Canonical heading evidence.
- evidence: BROWNFIELD_REVIEW.md
`;
  const parsedControlState = parseControlState(controlStateFixture, {
    userGates: ["UR", "PRD", "SD", "TP", "QA", "UAT"],
    internalSteps: ["Brownfield Review", "Brownfield Analysis", "CD+Tests", "CR"],
    closeoutArtefacts: ["OR"],
  });
  assert.equal(parsedControlState.approvals.get("QA")?.status, "approved");
  assert.equal(parsedControlState.artefacts.get("QA")?.status, "passed");
  assert.deepEqual(
    [...parsedControlState.artefacts.keys()],
    ["Brownfield Review", "Brownfield Analysis", "CD+Tests", "CR", "QA", "OR"],
  );
  assert.equal(parsedControlState.artefacts.get("OR")?.path, "OR.md");
  assert.equal(parsedControlState.artefacts.get("OR")?.path_format, "code_span");
  const invalidPathState = parseControlState(controlStateFixture.replace("`OR.md`", "`OR.md"), { closeoutArtefacts: ["OR"] });
  assert.equal(invalidPathState.artefacts.get("OR")?.path_format, "invalid");
  assert.equal(invalidPathState.artefacts.get("OR")?.path_reason, "unmatched_delimiter");
  for (const malformed of ["OR.md`", "``OR.md``", "`OR`-copy.md"]) {
    const malformedState = parseControlState(controlStateFixture.replace("`OR.md`", malformed), { closeoutArtefacts: ["OR"] });
    assert.equal(malformedState.artefacts.get("OR")?.path_format, "invalid", `${malformed} must remain invalid`);
  }
  assert.equal(parsedControlState.mode_slice_decision.decision, "structured_slice");
  const atomicBrownfieldFixture = controlStateFixture.replace(
    "| Brownfield Review | BROWNFIELD_REVIEW.md | done | reviewed |",
    "| UR | UR.md | approved | durable |\n| Brownfield Review | BROWNFIELD_REVIEW.md | done | reviewed |",
  );
  const atomicBrownfield = parseControlState(atomicBrownfieldFixture, { userGates: ["UR", "PRD"], internalSteps: ["Brownfield Review"] });
  assert.equal(transitionDecisionForRunState(atomicBrownfield).current_gate, "PRD", "completed Brownfield Review and mode selection route atomically");
  const interruptedBrownfield = parseControlState(atomicBrownfieldFixture.replace(/## Mode\/Slice Decision[\s\S]*$/, ""), {
    userGates: ["UR", "PRD"], internalSteps: ["Brownfield Review"],
  });
  assert.equal(transitionDecisionForRunState(interruptedBrownfield).current_gate, "Mode/Slice Decision", "interrupted atomic routing fails closed to recovery");
  const invalidBrownfieldEvidence = parseControlState(atomicBrownfieldFixture.replace("- evidence: BROWNFIELD_REVIEW.md", "- evidence:"), {
    userGates: ["UR", "PRD"], internalSteps: ["Brownfield Review"],
  });
  assert.equal(transitionDecisionForRunState(invalidBrownfieldEvidence).current_gate, "Mode/Slice Decision", "unevidenced routing fails closed to recovery");
  const activeQuickTask = {
    ...atomicBrownfield,
    content: "- lifecycle: active",
    current_gate: "Quick Task Execution",
    mode_slice_decision: { ...atomicBrownfield.mode_slice_decision, decision: "quick_task", required_next_gate: "none" },
  };
  assert.deepEqual(
    { status: transitionDecisionForRunState(activeQuickTask).status, current_gate: transitionDecisionForRunState(activeQuickTask).current_gate },
    { status: "open", current_gate: "Quick Task Execution" },
    "active Quick Task remains open",
  );
  const completedQuickTask = {
    ...activeQuickTask,
    content: "- lifecycle: completed",
    current_gate: "OR",
    artefacts: new Map([...activeQuickTask.artefacts, ["OR", { path: "OR.md", status: "done" }]]),
  };
  assert.deepEqual(
    { status: transitionDecisionForRunState(completedQuickTask).status, current_gate: transitionDecisionForRunState(completedQuickTask).current_gate },
    { status: "pass", current_gate: "OR" },
    "completed Quick Task with OR projects pass instead of reopening execution",
  );
  assert.deepEqual(
    {
      status: transitionDecisionForRunState({ ...completedQuickTask, content: "- lifecycle: active" }).status,
      current_gate: transitionDecisionForRunState({ ...completedQuickTask, content: "- lifecycle: active" }).current_gate,
    },
    { status: "open", current_gate: "Quick Task Execution" },
    "Quick Task with OR does not project pass while lifecycle remains active",
  );
  const qaReviseRoot = mkdtempSync(join(tmpdir(), "agdf-qa-revise-"));
  execFileSync(process.execPath, [cli, "init", "--dir", qaReviseRoot]);
  rmSync(join(qaReviseRoot, ".agdf", "control", "AGDF_RUN.md"), { force: true });
  execFileSync(process.execPath, [cli, "run-create", "--dir", qaReviseRoot, "--run", "qa-revise"]);
  const qaArtefactDir = join(qaReviseRoot, ".agdf", "control", "artefacts", "qa-revise");
  mkdirSync(qaArtefactDir, { recursive: true });
  for (const name of ["UR.md", "PRD.md", "SD.md", "TP.md", "QA_REPORT.md"]) writeFileSync(join(qaArtefactDir, name), `# ${name}\n`);
  writeFileSync(join(qaReviseRoot, ".agdf", "control", "runs", "qa-revise", "RUN_STATE.md"), `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: qa-revise
- lifecycle: active
- revision: 1
- revision_id: 11111111-1111-4111-8111-111111111111
- mode: structured_delivery
- current_gate: QA
- decision: revise
- owner: test

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | approved | Approval: SD |
| TP | approved | Approval: TP |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/qa-revise/UR.md | approved | ready |
| PRD | .agdf/control/artefacts/qa-revise/PRD.md | approved | ready |
| SD | .agdf/control/artefacts/qa-revise/SD.md | approved | ready |
| TP | .agdf/control/artefacts/qa-revise/TP.md | approved | ready |
| Brownfield Review | BROWNFIELD_REVIEW.md | done | ready |
| Brownfield Analysis | BROWNFIELD_ANALYSIS.md | done | ready |
| CD+Tests | CD_TESTS.md | done | ready |
| CR | CODE_REVIEW.md | done | ready |
| QA | .agdf/control/artefacts/qa-revise/QA_REPORT.md | revise | QA revision required |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Test QA revise projection.
- evidence: fixture

## Artefact Chain

| From | Relationship | To | Status | Evidence |
|---|---|---|---|---|
| UR | approved_by | Approval: UR | approved | fixture |
| PRD | derived_from | UR | approved | fixture |
| SD | derived_from | PRD | approved | fixture |
| TP | derived_from | SD | approved | fixture |
| QA_REPORT | tests | TP | pass | fixture |

## Closeout

- next_allowed_action: Resolve QA findings.
- quality_outlook: QA revise.
`);
  const qaReviseGateCheck = spawnSync(process.execPath, [cli, "gate-check", "--dir", qaReviseRoot, "--run", "qa-revise", "--json"], { encoding: "utf8" });
  assert.equal(qaReviseGateCheck.status, 0, qaReviseGateCheck.stderr);
  const qaReviseReport = JSON.parse(qaReviseGateCheck.stdout);
  assert.equal(qaReviseReport.current_gate, "QA");
  assert.equal(qaReviseReport.blocking_reason, "qa_revise_required");
  assert.equal(qaReviseReport.missing_approval, "none");
  assert.ok(qaReviseReport.allowed.every((action) => !action.includes("approval")));
  assert.ok(qaReviseReport.forbidden.includes("request QA approval"));
  assert.equal(qaReviseReport.status_card.user_action_required, "no");
  assert.equal(qaReviseReport.status_card.next_gate_after_approval, "none");
  assert.equal(Object.hasOwn(qaReviseReport.status_card, "approvalOrientation"), false, "approval orientation must not change public JSON keys");

  const qaBlockRunPath = join(qaReviseRoot, ".agdf", "control", "runs", "qa-revise", "RUN_STATE.md");
  writeFileSync(
    qaBlockRunPath,
    readFileSync(qaBlockRunPath, "utf8")
      .replace("| QA | .agdf/control/artefacts/qa-revise/QA_REPORT.md | revise | QA revision required |", "| QA | .agdf/control/artefacts/qa-revise/QA_REPORT.md | block | QA blocked |")
      .replace("- next_allowed_action: Resolve QA findings.", "- next_allowed_action: Route blocking QA findings."),
  );
  const qaBlockGateCheck = spawnSync(process.execPath, [cli, "gate-check", "--dir", qaReviseRoot, "--run", "qa-revise", "--json"], { encoding: "utf8" });
  assert.equal(qaBlockGateCheck.status, 2, qaBlockGateCheck.stderr);
  const qaBlockReport = JSON.parse(qaBlockGateCheck.stdout);
  assert.equal(qaBlockReport.status, "blocked");
  assert.equal(qaBlockReport.current_gate, "QA");
  assert.equal(qaBlockReport.blocking_reason, "qa_blocked");
  assert.equal(qaBlockReport.missing_approval, "none");
  assert.ok(qaBlockReport.allowed.every((action) => !action.includes("approval")));
  assert.ok(qaBlockReport.allowed.includes("route the blocking QA findings to their authoritative owner"));
  assert.ok(qaBlockReport.forbidden.includes("request QA approval"));
  assert.ok(qaBlockReport.forbidden.includes("request UAT approval"));
  assert.equal(qaBlockReport.interaction_kind, "blocked");
  assert.equal(qaBlockReport.approval_presentation, null);
  assert.equal(qaBlockReport.status_card.user_action_required, "no");
  assert.equal(qaBlockReport.status_card.next_gate_after_approval, "none");

  writeFileSync(
    qaBlockRunPath,
    readFileSync(qaBlockRunPath, "utf8").replace("| QA | missing |  |", "| QA | approved | Approval: QA |"),
  );
  const approvedQaBlockGateCheck = spawnSync(process.execPath, [cli, "gate-check", "--dir", qaReviseRoot, "--run", "qa-revise", "--json"], { encoding: "utf8" });
  assert.equal(approvedQaBlockGateCheck.status, 2, approvedQaBlockGateCheck.stderr);
  const approvedQaBlockReport = JSON.parse(approvedQaBlockGateCheck.stdout);
  assert.equal(approvedQaBlockReport.status, "blocked");
  assert.equal(approvedQaBlockReport.current_gate, "QA");
  assert.equal(approvedQaBlockReport.blocking_reason, "AGDF_GATE_ARTEFACT_STATUS_INCONSISTENT");
  assert.equal(approvedQaBlockReport.missing_approval, "none");
  assert.ok(approvedQaBlockReport.allowed.every((action) => !action.includes("UAT")));
  assert.ok(approvedQaBlockReport.forbidden.includes("create later-gate artefacts beyond the current allowed gate"));
  rmSync(qaReviseRoot, { recursive: true, force: true });

  for (const gate of ["UR", "PRD", "SD", "TP", "QA", "UAT"]) {
    const readyRoot = mkdtempSync(join(tmpdir(), `agdf-ready-${gate.toLowerCase()}-`));
    execFileSync(process.execPath, [cli, "init", "--dir", readyRoot]);
    rmSync(join(readyRoot, ".agdf", "control", "AGDF_RUN.md"), { force: true });
    const runId = `ready-${gate.toLowerCase()}`;
    execFileSync(process.execPath, [cli, "run-create", "--dir", readyRoot, "--run", runId]);
    const artefactDir = join(readyRoot, ".agdf", "control", "artefacts", runId);
    mkdirSync(artefactDir, { recursive: true });
    for (const name of ["UR.md", "PRD.md", "SD.md", "TP.md", "QA_REPORT.md", "BROWNFIELD_REVIEW.md", "BROWNFIELD_ANALYSIS.md", "CD_TESTS.md", "CODE_REVIEW.md"]) {
      writeFileSync(join(artefactDir, name), `# ${name}\n`);
    }
    const gateIndex = ["UR", "PRD", "SD", "TP", "QA", "UAT"].indexOf(gate);
    const approvals = ["UR", "PRD", "SD", "TP", "QA", "UAT"].map((candidate, index) =>
      `| ${candidate} | ${index < gateIndex ? "approved" : "missing"} | ${index < gateIndex ? `Approval: ${candidate}` : ""} |`,
    ).join("\n");
    writeFileSync(join(readyRoot, ".agdf", "control", "runs", runId, "RUN_STATE.md"), `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: ${runId}
- lifecycle: active
- revision: 1
- revision_id: 22222222-2222-4222-8222-${String(gateIndex + 1).padStart(12, "0")}
- mode: structured_delivery
- current_gate: ${gate}
- decision: in_progress
- owner: test

## Objective

Ready ${gate} approval fixture.

## Approvals

| Gate | Status | Evidence |
|---|---|---|
${approvals}

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/${runId}/UR.md | approved | ready |
| Brownfield Review | .agdf/control/artefacts/${runId}/BROWNFIELD_REVIEW.md | done | ready |
| PRD | .agdf/control/artefacts/${runId}/PRD.md | approved | ready |
| SD | .agdf/control/artefacts/${runId}/SD.md | approved | ready |
| TP | .agdf/control/artefacts/${runId}/TP.md | approved | ready |
| Brownfield Analysis | .agdf/control/artefacts/${runId}/BROWNFIELD_ANALYSIS.md | done | ready |
| CD+Tests | .agdf/control/artefacts/${runId}/CD_TESTS.md | done | ready |
| CR | .agdf/control/artefacts/${runId}/CODE_REVIEW.md | done | ready |
| QA | .agdf/control/artefacts/${runId}/QA_REPORT.md | pass | ready |

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Gate-readiness matrix fixture.
- evidence: fixture

## Artefact Chain

| From | Relationship | To | Status | Evidence |
|---|---|---|---|---|
| UR | approved_by | Approval: UR | approved | fixture |
| PRD | derived_from | UR | approved | fixture |
| SD | derived_from | PRD | approved | fixture |
| TP | derived_from | SD | approved | fixture |
| QA_REPORT | tests | TP | pass | fixture |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Ready fixture | test | ${gate} | direct |

## Next Allowed Action

- next_allowed_action: Request exact Approval: ${gate}.
`);
    const ready = spawnSync(process.execPath, [cli, "gate-check", "--dir", readyRoot, "--run", runId, "--json"], { encoding: "utf8" });
    assert.equal(ready.status, 0, ready.stderr);
    const report = JSON.parse(ready.stdout);
    assert.equal(report.status, "open", `${gate} ready gate must remain open independently of native capability`);
    assert.equal(report.current_gate, gate);
    assert.equal(report.missing_approval, `Approval: ${gate}`);
    assert.equal(report.interaction_kind, "gate_approval");
    assert.equal(report.native_attempt_required, false, "report-only evaluation has no verified host adapter capability");
    rmSync(readyRoot, { recursive: true, force: true });
  }
  const legacyMode = parseControlState(
    controlStateFixture.replace("## Mode/Slice Decision", "## Mode / Slice Decision"),
    { userGates: ["QA"], internalSteps: [] },
  );
  assert.equal(legacyMode.mode_slice_decision.decision, "structured_slice");
  const canonicalPrecedence = parseControlState(`${controlStateFixture}
## Mode / Slice Decision

- decision: block
- required_next_gate: none
- scope_reason: Legacy duplicate.
- evidence: legacy
`, { userGates: ["QA"], internalSteps: [] });
  assert.equal(canonicalPrecedence.mode_slice_decision.decision, "structured_slice");
  for (const status of ["pass", "passed", "approved"]) {
    const qaState = parseControlState(controlStateFixture.replace("| QA | pass | QA report |", `| QA | ${status} | QA report |`), {
      userGates: ["QA"],
      internalSteps: [],
    });
    assert.equal(qaState.approvals.get("QA")?.status, "approved");
  }
  for (const [replacement, code] of [
    ["- lifecycle: broken", "AGDF_RUN_LIFECYCLE_INVALID"],
    ["- revision: 0", "AGDF_RUN_REVISION_INVALID"],
    ["- control_state_version: 9", "AGDF_RUN_VERSION_UNSUPPORTED"],
  ]) {
    const bad = parsed.content.replace(
      /^- (lifecycle|revision|control_state_version):.*$/m,
      replacement,
    );
    assert.ok(
      parseRunState(bad, "run-a").findings.some((f) => f.code === code),
    );
  }
  assert.ok(
    parseRunState(
      parsed.content.replace("- run_id: run-a", "- run_id: run-a\n- run_id: run-a"),
      "run-a",
    ).findings.some((f) => f.code === "AGDF_RUN_FIELD_DUPLICATE"),
  );
  assert.ok(
    parseRunState(parsed.content, "different-run").findings.some(
      (finding) => finding.code === "AGDF_RUN_PATH_MISMATCH",
    ),
  );
  assert.ok(
    parseRunState(parsed.content.replace("- run_id: run-a", "- run_id: ../escape"), "run-a").findings.some(
      (finding) => finding.code === "AGDF_RUN_ID_INVALID",
    ),
  );
  assert.ok(
    parseRunState(parsed.content.replace(/^- revision_id:.*$/m, "- revision_id: invalid"), "run-a").findings.some(
      (finding) => finding.code === "AGDF_RUN_REVISION_ID_INVALID",
    ),
  );
  assert.ok(
    parseRunState(`${parsed.content}\n| malformed table row`, "run-a").findings.some(
      (finding) => finding.code === "AGDF_RUN_TABLE_INVALID",
    ),
  );
  assert.throws(
    () => writeRun(a, parsed.content, "stale"),
    /AGDF_STALE_RUN_REVISION/,
  );
  assert.equal(
    writeRun(a, parsed.content, parsed.meta.revision_id).meta.revision,
    "2",
  );
  assert.equal(readdirSync(join(root, ".agdf", "control", "runs", "run-a")).some((entry) => entry.includes(".tmp-")), false);
  assert.equal(readdirSync(join(root, ".agdf", "control", "runs", "run-a")).some((entry) => entry.endsWith(".lock")), false);
  const lockedState = parseRunState(readFileSync(a, "utf8"), "run-a");
  writeFileSync(`${a}.lock`, "held");
  assert.throws(() => writeRun(a, lockedState.content, lockedState.meta.revision_id), /AGDF_RUN_WRITE_LOCKED/);
  rmSync(`${a}.lock`);

  const emptyRoot = mkdtempSync(join(tmpdir(), "agdf-control-empty-"));
  assert.throws(() => resolveRuns(emptyRoot), /AGDF_ACTIVE_RUN_MISSING/);
  rmSync(emptyRoot, { recursive: true, force: true });
  assert.equal(
    aggregate([
      { run_id: "b", status: "warn" },
      { run_id: "a", status: "block" },
    ]).status,
    "block",
  );
  assert.equal(aggregate([]).status, "revise");
  assert.equal(aggregate([], { allowNoActiveRuns: true }).status, "pass");

  const cliRoot = mkdtempSync(join(tmpdir(), "agdf-control-cli-"));
  const help = execFileSync(process.execPath, [cli, "--help"], { encoding: "utf8" });
  for (const expected of ["--run <run_id>", "--all-active", "run-create", "run-migrate", "run-render-legacy"]) {
    assert.match(help, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  const missingScaffoldRun = spawnSync(process.execPath, [cli, "run-create", "--dir", cliRoot, "--run", "cli-run"], { encoding: "utf8" });
  assert.notEqual(missingScaffoldRun.status, 0);
  assert.match(missingScaffoldRun.stderr, /AGDF_CANONICAL_SCAFFOLD_REQUIRED/);
  assert.equal(existsSync(join(cliRoot, ".agdf")), false, "run-create must not create a dead-end control tree before init");
  execFileSync(process.execPath, [cli, "init", "--dir", cliRoot]);
  execFileSync(process.execPath, [cli, "run-create", "--dir", cliRoot, "--run", "cli-run"]);
  assert.ok(readFileSync(join(cliRoot, ".agdf", "control", "runs", "cli-run", "RUN_STATE.md"), "utf8").includes("- run_id: cli-run"));
  const cliLegacyPath = join(cliRoot, ".agdf", "control", "AGDF_RUN.md");
  writeFileSync(cliLegacyPath, "# AGDF Run State\n\nunmarked legacy\n");
  const mixedAuthority = spawnSync(process.execPath, [cli, "doctor", "--dir", cliRoot, "--all-active", "--json"], { encoding: "utf8" });
  assert.notEqual(mixedAuthority.status, 0);
  assert.ok(JSON.parse(mixedAuthority.stdout).findings.some((finding) => finding.code === "AGDF_LEGACY_PROJECTION_DRIFT"));
  rmSync(cliLegacyPath);
  const illegalAllActive = spawnSync(process.execPath, [cli, "gate-check", "--dir", cliRoot, "--all-active"], { encoding: "utf8" });
  assert.notEqual(illegalAllActive.status, 0);
  assert.match(illegalAllActive.stderr, /--all-active is supported only/);
  assert.doesNotMatch(illegalAllActive.stderr, /\n\s+at\s|node:internal|file:\/\//, "expected option errors must not expose a Node stack trace");
  const missingRenderSelector = spawnSync(process.execPath, [cli, "run-render-legacy", "--dir", cliRoot], { encoding: "utf8" });
  assert.notEqual(missingRenderSelector.status, 0);
  assert.match(missingRenderSelector.stderr, /requires --run/);
  rmSync(cliRoot, { recursive: true, force: true });

  const ambiguousRoot = mkdtempSync(join(tmpdir(), "agdf-control-ambiguous-"));
  execFileSync(process.execPath, [cli, "init", "--dir", ambiguousRoot]);
  rmSync(join(ambiguousRoot, ".agdf", "control", "AGDF_RUN.md"), { force: true });
  execFileSync(process.execPath, [cli, "run-create", "--dir", ambiguousRoot, "--run", "ambiguous-run-a"]);
  execFileSync(process.execPath, [cli, "run-create", "--dir", ambiguousRoot, "--run", "ambiguous-run-b"]);
  for (const target of ["doctor", "gate-check", "delivery-map"]) {
    const ambiguous = spawnSync(process.execPath, [cli, target, "--dir", ambiguousRoot, "--json"], { encoding: "utf8" });
    assert.notEqual(ambiguous.status, 0);
    assert.equal(ambiguous.stderr, "", `${target} must not crash with a raw stack trace on an ambiguous multi-run selection`);
    const report = JSON.parse(ambiguous.stdout);
    const findings = report.doctor_report?.findings ?? report.findings ?? [];
    assert.ok(
      findings.some((finding) => finding.code === "AGDF_ACTIVE_RUN_AMBIGUOUS"),
      `${target} must report AGDF_ACTIVE_RUN_AMBIGUOUS as a structured finding instead of throwing`,
    );
    if (target === "gate-check") {
      assert.deepEqual(report.candidate_runs.map((candidate) => candidate.run_id), ["ambiguous-run-a", "ambiguous-run-b"]);
      assert.ok(report.candidate_runs.every((candidate) => candidate.display_title && candidate.current_gate));
      assert.equal(report.native_attempt_required, false, "ambiguous runs must never require a native approval attempt");
      assert.notEqual(report.interaction_kind, "gate_approval", "ambiguous runs must remain clarification/blocked interactions");
      assert.ok(findings.every((finding) => !finding.next_step.includes("--all-active")), "gate-check recovery must not advertise its rejected --all-active option");
    } else {
      assert.ok(findings.some((finding) => finding.next_step.includes("--all-active")), `${target} recovery must retain supported aggregate selection`);
    }
  }
  rmSync(ambiguousRoot, { recursive: true, force: true });

  const legacyRoot = mkdtempSync(join(tmpdir(), "agdf-legacy-"));
  mkdirSync(join(legacyRoot, ".agdf", "control"), { recursive: true });
  writeFileSync(
    join(legacyRoot, ".agdf", "control", "AGDF_RUN.md"),
    "# AGDF Run State\n\n## Run Meta\n\n- run_id: legacy-run\n- mode: structured_delivery\n- current_gate: TP\n- decision: in_progress\n- owner: test-owner\n\n## Objective\n\nLegacy objective\n",
  );
  assert.equal(migrateLegacy(legacyRoot).status, "migrated");
  assert.equal(migrateLegacy(legacyRoot).status, "already_migrated");
  const canonical = join(
    legacyRoot,
    ".agdf",
    "control",
    "runs",
    "legacy-run",
    "RUN_STATE.md",
  );
  const migratedState = parseRunState(readFileSync(canonical, "utf8"), "legacy-run");
  assert.equal(migratedState.meta.current_gate, "TP");
  assert.equal(migratedState.meta.owner, "test-owner");
  writeFileSync(
    join(legacyRoot, ".agdf", "control", "AGDF_RUN.md"),
    renderLegacyProjection(canonical, legacyRoot),
  );
  assert.equal(verifyLegacyProjection(legacyRoot).status, "valid");
  const projectionPath = join(legacyRoot, ".agdf", "control", "AGDF_RUN.md");
  const validProjection = readFileSync(projectionPath, "utf8");
  writeFileSync(
    projectionPath,
    validProjection.replace("Legacy objective", "Changed projection"),
  );
  assert.equal(
    verifyLegacyProjection(legacyRoot).status,
    "legacy_projection_drift",
  );
  writeFileSync(projectionPath, validProjection);
  writeFileSync(canonical, `${readFileSync(canonical, "utf8")}\nchanged\n`);
  assert.equal(
    verifyLegacyProjection(legacyRoot).status,
    "legacy_projection_drift",
  );
  const beforeFailure = readFileSync(
    join(legacyRoot, ".agdf", "control", "AGDF_RUN.md"),
  );
  assert.throws(
    () => migrateLegacy(legacyRoot, "different-run"),
    /AGDF_RUN_COLLISION|AGDF_LEGACY_ALREADY_PROJECTED/,
  );
  assert.equal(
    readFileSync(join(legacyRoot, ".agdf", "control", "AGDF_RUN.md")).equals(
      beforeFailure,
    ),
    true,
  );
  const injectedRoot = mkdtempSync(join(tmpdir(), "agdf-migration-failure-"));
  mkdirSync(join(injectedRoot, ".agdf", "control"), { recursive: true });
  const injectedLegacyPath = join(injectedRoot, ".agdf", "control", "AGDF_RUN.md");
  const injectedLegacy = "# AGDF Run State\n\n## Objective\n\nFailure injection\n";
  writeFileSync(injectedLegacyPath, injectedLegacy);
  assert.throws(
    () => migrateLegacy(injectedRoot, "injected-run", { readFile: () => "invalid readback" }),
    /AGDF_MIGRATION_VERIFICATION_FAILED/,
  );
  assert.equal(readFileSync(injectedLegacyPath, "utf8"), injectedLegacy);
  assert.equal(discoverRuns(injectedRoot).length, 0);
  rmSync(injectedRoot, { recursive: true, force: true });
  const symlinkRoot = mkdtempSync(join(tmpdir(), "agdf-symlink-"));
  mkdirSync(join(symlinkRoot, ".agdf", "control", "runs"), { recursive: true });
  let symlinkCreatable = true;
  try {
    symlinkSync(
      join(root, ".agdf", "control", "runs", "run-a"),
      join(symlinkRoot, ".agdf", "control", "runs", "linked"),
    );
  } catch (error) {
    if (error.code !== "EPERM") throw error;
    symlinkCreatable = false;
    console.warn(
      "[control-state-test] SKIPPED symlink-rejection assertions: this environment cannot create symlinks (EPERM) without elevated privileges or Windows Developer Mode",
    );
  }
  if (symlinkCreatable) {
    assert.equal(discoverRuns(symlinkRoot)[0].valid, false);
    assert.equal(resolveRuns(symlinkRoot, { allActive: true }).findings[0].code, "AGDF_RUN_PATH_INVALID");
  }
  rmSync(symlinkRoot, { recursive: true, force: true });
  const gitRoot = mkdtempSync(join(tmpdir(), "agdf-git-conflict-"));
  execFileSync("git", ["init", "-q", "--initial-branch=main"], {
    cwd: gitRoot,
  });
  execFileSync("git", ["config", "user.email", "test@example.com"], {
    cwd: gitRoot,
  });
  execFileSync("git", ["config", "user.name", "Test"], { cwd: gitRoot });
  const state = join(gitRoot, "RUN_STATE.md");
  writeFileSync(state, "gate: UR\n");
  execFileSync("git", ["add", "."], { cwd: gitRoot });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: gitRoot });
  execFileSync("git", ["branch", "other"], { cwd: gitRoot });
  writeFileSync(state, "gate: PRD\n");
  execFileSync("git", ["commit", "-qam", "main"], { cwd: gitRoot });
  execFileSync("git", ["checkout", "-q", "other"], { cwd: gitRoot });
  writeFileSync(state, "gate: SD\n");
  execFileSync("git", ["commit", "-qam", "other"], { cwd: gitRoot });
  execFileSync("git", ["checkout", "-q", "main"], { cwd: gitRoot });
  assert.throws(() =>
    execFileSync("git", ["merge", "other"], { cwd: gitRoot, stdio: "pipe" }),
  );
  rmSync(gitRoot, { recursive: true, force: true });
  rmSync(legacyRoot, { recursive: true, force: true });

  // BT-01: Breadcrumb rendering for structured_delivery with 2 approved gates
  {
    const breadcrumb = [
      { gate: "UR", status: "fulfilled" },
      { gate: "PRD", status: "fulfilled" },
      { gate: "SD", status: "current" },
      { gate: "TP", status: "open" },
      { gate: "QA", status: "open" },
      { gate: "UAT", status: "open" },
    ];
    const rendered = buildBreadcrumb(breadcrumb, localeRegistry, "en");
    assert.ok(rendered.includes("\u2713"), "BT-01: fulfilled symbol present");
    assert.ok(rendered.includes("\u25cf"), "BT-01: current symbol present");
    assert.ok(rendered.includes("\u25cb"), "BT-01: open symbol present");
    assert.equal((rendered.match(/\u00b7/g) || []).length, 5, "BT-01: 5 separators for 6 entries");
  }

  // BT-02: Breadcrumb for verified_change
  {
    const breadcrumb = [
      { gate: "UR", status: "fulfilled" },
      { gate: "Verified Change", status: "current" },
      { gate: "OR", status: "open" },
    ];
    const rendered = buildBreadcrumb(breadcrumb, localeRegistry, "en");
    assert.ok(rendered.includes("Verified change"), "BT-02: verified change label present");
    assert.equal((rendered.match(/\u00b7/g) || []).length, 2, "BT-02: 2 separators for 3 entries");
  }

  // BT-03: Post-UR quick_task is presented as Compact Delivery without changing the mode value
  {
    const breadcrumb = [
      { gate: "UR", status: "fulfilled" },
      { gate: "Compact Delivery", status: "current" },
    ];
    const rendered = buildBreadcrumb(breadcrumb, localeRegistry, "en");
    assert.ok(rendered.includes("Compact Delivery"), "BT-03: compact delivery label present");
    assert.equal((rendered.match(/\u00b7/g) || []).length, 1, "BT-03: 1 separator for 2 entries");
  }

  // BT-04: Breadcrumb for block
  {
    const breadcrumb = [
      { gate: "UR", status: "fulfilled" },
      { gate: "Block", status: "current" },
    ];
    const rendered = buildBreadcrumb(breadcrumb, localeRegistry, "en");
    assert.ok(rendered.includes("Block"), "BT-04: block label present");
  }

  // BT-05: Narration for UR
  {
    const narration = buildTransitionNarration("UR", localeRegistry, "en");
    assert.ok(narration.includes("Brownfield Review"), "BT-05: UR narration mentions Brownfield Review");
    assert.ok(narration.includes(localeRegistry.locales.en.primary.narration.noAction), "BT-05: UR narration uses canonical no-action text");
    const transition = postApprovalTransition("Approval: UR");
    assert.equal(transition.internal_next_step, "Brownfield Review and proportional routing");
    assert.equal(transition.user_action_required, "no");
    assert.equal(transition.next_user_gate, "none");
    assert.ok(!transition.allowed_after_approval.includes("PRD"), "BT-05: UR transition does not preselect PRD");
  }

  // BT-06: Narration is a string, not a card object (non-overlap)
  {
    const narration = buildTransitionNarration("UR", localeRegistry, "en");
    assert.equal(typeof narration, "string", "BT-06: narration is a string");
    assert.ok(!narration.includes("Where am I"), "BT-06: narration does not use card three-question form");
  }

  // BT-07: Narration does not contain Approval: value
  {
    const narration = buildTransitionNarration("PRD", localeRegistry, "en");
    assert.ok(!narration.includes("Approval:"), "BT-07: narration does not contain Approval: value");
  }

  // BT-08: Collapse verified_change eligible
  {
    const result = collapseInternalState({ modeSliceDecision: "verified_change", verifiedChangeState: "eligible" }, localeRegistry, "en");
    assert.equal(result.verified_change, "Compact change under review", "BT-08: eligible collapses to under review");
  }

  // BT-09: Collapse verified_change escalated (stays explicit)
  {
    const result = collapseInternalState({ modeSliceDecision: "verified_change", verifiedChangeState: "escalated" }, localeRegistry, "en");
    assert.equal(result.verified_change, "Escalated to structured delivery", "BT-09: escalated stays explicit");
  }

  // BT-10: Collapse context_graph open_gap (stays explicit)
  {
    const result = collapseInternalState({ contextGraphRequiredAction: "open_gap" }, localeRegistry, "en");
    assert.equal(result.context_graph, "Graph gap open", "BT-10: open_gap stays explicit");
  }

  // BT-11: Collapse multi_scope clear (not shown)
  {
    const result = collapseInternalState({ multiScopeState: "clear" }, localeRegistry, "en");
    assert.equal(result.multi_scope, undefined, "BT-11: clear multi_scope not shown");
  }

  // BT-12: collapseInternalState does not mutate input (full projection unchanged)
  {
    const input = { modeSliceDecision: "verified_change", verifiedChangeState: "eligible" };
    collapseInternalState(input, localeRegistry, "en");
    assert.equal(input.modeSliceDecision, "verified_change", "BT-12: input not mutated");
  }

  // BT-14: Locale registry has required new keys for en and de
  {
    for (const locale of ["en", "de"]) {
      assert.ok(localeRegistry.locales[locale].statusCard.breadcrumbFulfilled, `BT-14: ${locale} breadcrumbFulfilled exists`);
      assert.ok(localeRegistry.locales[locale].statusCard.breadcrumbCurrent, `BT-14: ${locale} breadcrumbCurrent exists`);
      assert.ok(localeRegistry.locales[locale].statusCard.breadcrumbOpen, `BT-14: ${locale} breadcrumbOpen exists`);
      assert.ok(localeRegistry.locales[locale].internalStateLabels, `BT-14: ${locale} internalStateLabels exists`);
      assert.ok(localeRegistry.locales[locale].primary.narration, `BT-14: ${locale} narration exists`);
      assert.ok(localeRegistry.locales[locale].gateTitles["Verified Change"], `BT-14: ${locale} Verified Change gateTitle exists`);
      assert.ok(localeRegistry.locales[locale].gateTitles["Quick Task"], `BT-14: ${locale} Quick Task gateTitle exists`);
      assert.ok(localeRegistry.locales[locale].gateTitles["Block"], `BT-14: ${locale} Block gateTitle exists`);
    }
  }

  // IPP-1: run-identity unit matrix and single-owner re-export
  {
    assert.equal(RUN_ID_PATTERN, identityRunIdPattern, "IPP-1: parser re-exports the shared pattern object");
    assert.deepEqual(validateRunIdentity({ runId: "example-run.1", revisionId: "6f0f2f9a-1d0a-4b7e-9c2d-3a5b8c1d2e4f" }), [], "IPP-1: valid identity yields no findings");
    for (const runId of ["Example", ".leading-dot", "", `a${"b".repeat(128)}`, "spaced id"]) {
      assert.deepEqual(validateRunIdentity({ runId, revisionId: "6f0f2f9a-1d0a-4b7e-9c2d-3a5b8c1d2e4f" }).map((finding) => finding.code), ["AGDF_RUN_ID_INVALID"], `IPP-1: run_id ${JSON.stringify(runId)} is invalid`);
    }
    for (const revisionId of ["", "not-a-uuid", "6f0f2f9a-1d0a-4b7e-9c2d"]) {
      assert.deepEqual(validateRunIdentity({ runId: "example", revisionId }).map((finding) => finding.code), ["AGDF_RUN_REVISION_ID_INVALID"], `IPP-1: revision_id ${JSON.stringify(revisionId)} is invalid`);
    }
    assert.deepEqual(validateRunIdentity({}).map((finding) => finding.code), ["AGDF_RUN_ID_INVALID", "AGDF_RUN_REVISION_ID_INVALID"], "IPP-1: missing identity yields both findings");
  }

  // IPP-2 / IPP-3: legacy content path yields doctor identity findings and a loud gate-check outcome
  {
    const identityRoot = mkdtempSync(join(tmpdir(), "agdf-identity-parity-"));
    try {
      execFileSync(process.execPath, [cli, "init", "--dir", identityRoot]);
      rmSync(join(identityRoot, ".agdf", "control", "runs"), { recursive: true, force: true });
      const legacyState = `# AGDF Run State\n\n## Run Meta\n\n- run_id: Bad Run\n- lifecycle: active\n- current_gate: UR\n\n## Current Control State\n\n| Question | Answer |\n|---|---|\n| What is known? | Legacy fixture without identity. |\n| What is the next allowed action? | Draft the UR. |\n\n## Evidence\n\n| Evidence | Source | Covers | Strength |\n|---|---|---|---|\n| Fixture | identity-parity-test | legacy path | direct |\n\n## Closeout\n\n- next_allowed_action: Draft the UR.\n`;
      writeFileSync(join(identityRoot, ".agdf", "control", "AGDF_RUN.md"), legacyState, "utf8");
      const doctorResult = spawnSync(process.execPath, [cli, "doctor", "--dir", identityRoot, "--json"], { encoding: "utf8" });
      const doctorReport = JSON.parse(doctorResult.stdout);
      const doctorCodes = doctorReport.findings.map((finding) => finding.code);
      assert.ok(doctorCodes.includes("AGDF_RUN_ID_INVALID"), "IPP-2: doctor reports invalid run_id on the legacy content path");
      assert.ok(doctorCodes.includes("AGDF_RUN_REVISION_ID_INVALID"), "IPP-2: doctor reports missing revision_id on the legacy content path");
      for (const finding of doctorReport.findings.filter((entry) => ["AGDF_RUN_ID_INVALID", "AGDF_RUN_REVISION_ID_INVALID"].includes(entry.code))) {
        assert.equal(finding.severity, "revise", `IPP-2: ${finding.code} severity is revise`);
        assert.match(finding.next_step, /run-migrate/, `IPP-2: ${finding.code} names the repair path`);
      }
      assert.notEqual(doctorReport.status, "warn", "IPP-2: identity defects are never reported as mere warn");

      const gateResult = spawnSync(process.execPath, [cli, "gate-check", "--dir", identityRoot, "--json"], { encoding: "utf8" });
      const gateReport = JSON.parse(gateResult.stdout);
      assert.ok(["AGDF_RUN_ID_INVALID", "AGDF_RUN_REVISION_ID_INVALID"].includes(gateReport.blocking_reason), "IPP-3: gate-check names the identity defect instead of silently dropping the card");
      assert.match(gateReport.next_allowed_action, /run-migrate|Fill the current UR control state/, "IPP-3: gate-check names a concrete repair action");
    } finally {
      rmSync(identityRoot, { recursive: true, force: true });
    }
  }

  // IPP-4: healthy canonical run renders cards without presentation diagnostics
  {
    const healthyRoot = mkdtempSync(join(tmpdir(), "agdf-identity-healthy-"));
    try {
      execFileSync(process.execPath, [cli, "init", "--dir", healthyRoot]);
      execFileSync(process.execPath, [cli, "run-create", "--dir", healthyRoot, "--run", "identity-healthy-run"]);
      const gateResult = spawnSync(process.execPath, [cli, "gate-check", "--dir", healthyRoot, "--run", "identity-healthy-run", "--json"], { encoding: "utf8" });
      const gateReport = JSON.parse(gateResult.stdout);
      assert.ok(gateReport.status_presentation?.markdown, "IPP-4: healthy run renders the status card");
      assert.equal("presentation_diagnostics" in gateReport, false, "IPP-4: healthy run report has no presentation_diagnostics key");
    } finally {
      rmSync(healthyRoot, { recursive: true, force: true });
    }
  }

  console.log("control-state tests passed");

  const awaitingOrFindings = [];
  const normalizedAwaitingOr = normalizeBacklogStatus("Awaiting OR", awaitingOrFindings, "test-backlog.md");
  assert.equal(normalizedAwaitingOr, "awaiting_or", "BT-15: Awaiting OR normalizes to awaiting_or");
  assert.equal(awaitingOrFindings.length, 0, "BT-15: Awaiting OR produces no findings");

  console.log("backlog status vocabulary tests passed");
} finally {
  rmSync(root, { recursive: true, force: true });
}
