import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { sealRunState } from "#agdf-core/control-state/run-seal.js";

const cli = fileURLToPath(new URL("../bin/create-agdf.js", import.meta.url));
const scenarios = new Map([
  ["new-ur", newUrWithoutArtefact],
  ["duplicate-prd", duplicatePrdRow],
  ["bound-ur", boundUrApproval],
  ["stale-next-step", staleNextStep],
  ["qa-follow-up", qaFollowUp],
]);

function invoke(args, expectedExit = 0) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  if (result.error) throw result.error;
  assert.equal(result.status, expectedExit,
    `CLI ${args[0]} exited ${result.status}, expected ${expectedExit}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function json(args, expectedExit = 0) {
  return JSON.parse(invoke(args, expectedExit));
}

function fixture(runId, scenario, beforeCreate) {
  const root = mkdtempSync(join(tmpdir(), `agdf-cli-gate-${scenario}-`));
  try {
    const git = spawnSync("git", ["init", "-q"], { cwd: root, encoding: "utf8" });
    assert.equal(git.status, 0, git.stderr);
    invoke(["init", "--dir", root, "--language", "de"]);
    beforeCreate?.({ root });
    const created = invoke(["run-create", "--dir", root, "--run", runId]);
    const revisionId = created.match(/^revision_id: (\S+)$/mu)?.[1];
    assert.ok(revisionId, "run-create must print a revision id");
    return { root, runId, revisionId };
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
}

function withFixture(runId, scenario, action, { beforeCreate } = {}) {
  const context = fixture(runId, scenario, beforeCreate);
  try { action(context); }
  finally { rmSync(context.root, { recursive: true, force: true }); }
}

function dispatch({ root, runId }, ...extra) {
  return json(["skill-dispatch", "--json", "--skill", "gate-check", "--surface", "claude",
    "--language", "de", "--working-directory", root, "--target-source", "explicit_target",
    "--primary-target", root, ...(runId ? ["--run", runId] : []), ...extra]);
}

function newUrWithoutArtefact() {
  withFixture("new-ur", "new-ur", ({ root, runId, revisionId }) => {
    const report = json(["gate-check", "--dir", root, "--run", runId, "--json"]);
    assert.equal(report.status, "open");
    assert.equal(report.missing_approval, "Approval: UR", "the pending gate remains machine-readable");
    assert.equal(report.status_card.missing_approval, "none", "no user decision is due before a UR exists");
    assert.equal(report.status_card.user_action_required, "no");
    assert.ok(report.allowed.every((action) => !/request exact .* approval/iu.test(action)));
    assert.doesNotMatch(report.next_allowed_action, /Approval: UR|request exact approval/iu);
    const card = invoke(["gate-check", "--dir", root, "--run", runId, "--status-card"]);
    assert.match(card, /\| Fehlende Freigabe \| keine \|/u);
    assert.doesNotMatch(card, /Approval: UR|Freigabe anfordern/u);
    const preview = dispatch({ root, runId });
    assert.equal(preview.outcome, "control_result");
    assert.doesNotMatch(preview.host_action.text, /Approval: UR|Freigabe anfordern/u);
    const intake = dispatch({ root, runId }, "--intake");
    assert.equal(intake.continuation.phase, "ur_definition");
    assert.equal(intake.continuation.revision_id, revisionId);
    const presentation = json(["run-present", "--dir", root, "--run", runId, "--gate", "UR",
      "--revision", revisionId], 2);
    assert.equal(presentation.outcome, "rejected");
  }, { beforeCreate({ root }) {
    const intake = dispatch({ root }, "--intake");
    assert.equal(intake.continuation.phase, "resolve_delivery_run");
    assert.deepEqual(intake.continuation.candidate_runs, []);
    assert.equal(intake.control, null);
    assert.equal(dispatch({ root }).outcome, "control_result");
  } });
}

function duplicatePrdRow() {
  withFixture("duplicate-prd", "duplicate-prd", ({ root, runId, revisionId }) => {
    const statePath = join(root, ".agdf", "control", "runs", runId, "RUN_STATE.md");
    const relativePrd = `.agdf/control/artefacts/${runId}/PRD.md`;
    const prdPath = join(root, relativePrd);
    mkdirSync(join(root, ".agdf", "control", "artefacts", runId), { recursive: true });
    writeFileSync(prdPath, "# PRD: Duplicate row\n\n## Product Scope\nReviewable content.\n");
    const original = readFileSync(statePath, "utf8");
    assert.match(original, /\| PRD \|  \| missing \|  \|/u);
    writeFileSync(statePath, original.replace("| PRD |  | missing |  |",
      `| PRD | \`${relativePrd}\` | draft |  |\n| PRD |  | missing |  |`));
    const recorded = json(["run-update", "--dir", root, "--run", runId, "--revision", revisionId], 2);
    assert.equal(recorded.reason, "artefact_row_duplicate", "run-update must not seal a duplicate");
    assert.deepEqual(recorded.artefact_types, ["PRD"]);
    assert.match(recorded.recovery, /Keep one Artefacts row per type/u);
    assert.equal(readFileSync(statePath, "utf8").includes("| PRD |  | missing |  |"), true);
    writeFileSync(statePath, sealRunState(root, readFileSync(statePath, "utf8")));
    assert.equal(json(["run-update", "--dir", root, "--run", runId, "--revision", revisionId], 2).reason,
      "artefact_row_duplicate", "older sealed duplicates remain rejected");
    const report = json(["gate-check", "--dir", root, "--run", runId, "--json"], 2);
    assert.equal(report.status, "blocked");
    assert.equal(report.blocking_reason, "AGDF_ARTEFACT_ROW_DUPLICATE");
    assert.equal(report.approval_presentation, null);
    const card = invoke(["gate-check", "--dir", root, "--run", runId, "--status-card"], 2);
    assert.match(card, /AGDF_ARTEFACT_ROW_DUPLICATE/u);
    assert.doesNotMatch(card, /Approval: (?:UR|PRD)|Nach Freigabe/u);
    const envelope = invoke(["gate-check", "--dir", root, "--run", runId, "--approval-envelope"], 2);
    assert.match(envelope, /Keine Entscheidung angefordert/u);
    const presentation = json(["run-present", "--dir", root, "--run", runId, "--gate", "UR",
      "--revision", revisionId], 2);
    assert.equal(presentation.reason, "AGDF_ARTEFACT_ROW_DUPLICATE");
    const preview = dispatch({ root, runId });
    assert.equal(preview.outcome, "control_result");
    assert.match(preview.host_action.text, /AGDF_ARTEFACT_ROW_DUPLICATE/u);
    assert.doesNotMatch(preview.host_action.text, /Approval: (?:UR|PRD)|Nach Freigabe/u);
    writeFileSync(statePath, readFileSync(statePath, "utf8").replace("\n| PRD |  | missing |  |", ""));
    const repaired = json(["run-update", "--dir", root, "--run", runId, "--revision", revisionId]);
    assert.equal(repaired.outcome, "updated");
    assert.notEqual(repaired.revision_id, revisionId);
    const afterRepair = json(["gate-check", "--dir", root, "--run", runId, "--json"]);
    assert.notEqual(afterRepair.blocking_reason, "AGDF_ARTEFACT_ROW_DUPLICATE");
  });
}

function boundUrApproval() {
  withFixture("bound-ur", "bound-ur", ({ root, runId, revisionId }) => {
    const artefactDir = join(root, ".agdf", "control", "artefacts", runId);
    mkdirSync(artefactDir, { recursive: true });
    writeFileSync(join(artefactDir, "UR.md"), "# UR: Bound CLI run\n\n## Problem\n\nAdd subtract. The user should review this document before approval.\n\n## AGDF Approval Summary (de; source=en)\n- Problem: Eine Subtraktionsfunktion fehlt.\n- Ziel: Das gespeicherte UR vor der Entscheidung prüfen.\n- Umfang: Eine kleine, nachvollziehbare Nutzeranforderung.\n");
    const recorded = json(["run-step", "--dir", root, "--run", runId, "--revision", revisionId,
      "--step", "ur", "--title", "Bound CLI run"]);
    assert.equal(recorded.outcome, "recorded");
    const intakeReady = dispatch({ root, runId }, "--intake");
    assert.equal(intakeReady.continuation.phase, "presentation_required");
    assert.equal(intakeReady.control.missing_approval, "Approval: UR");
    const preview = dispatch({ root, runId });
    assert.equal(preview.outcome, "control_result");
    assert.match(preview.host_action.text, /Artefakt: \[UR\.md\]/u);
    assert.doesNotMatch(preview.host_action.text, /Approval: UR/u);
    const continuation = dispatch({ root, runId }, "--continue-delivery");
    assert.equal(continuation.outcome, "intake_continuation");
    assert.equal(continuation.continuation.phase, "presentation_required");
    assert.deepEqual(continuation.continuation.steps[0].argv.slice(0, 7),
      ["run-present", "--dir", realpathSync(root), "--run", runId, "--gate", "UR"]);
    const unbound = json(["run-approve", "--dir", root, "--run", runId, "--gate", "UR",
      "--revision", recorded.revision_id, "--response", "Approval: UR"], 2);
    assert.equal(unbound.reason, "presentation_required", "an unbound reply must not advance the gate");
    const prepared = json(continuation.continuation.steps[0].argv);
    assert.equal(prepared.outcome, "prepared");
    assert.match(prepared.text, /Artefakt: \[UR\.md\]/u);
    assert.match(prepared.text, /Approval: UR/u);
    const approved = json(["run-approve", "--dir", root, "--run", runId, "--gate", "UR",
      "--revision", prepared.revision_id, "--presentation", prepared.presentation_id,
      "--response", "Approval: UR"]);
    assert.equal(approved.outcome, "approved");
    assert.match(readFileSync(join(root, ".agdf", "control", "runs", runId, "RUN_STATE.md"), "utf8"),
      /\| UR \| `\.agdf\/control\/artefacts\/bound-ur\/UR\.md` \| approved \|/u);
  });
}

const BROWNFIELD_NEXT = "Run Brownfield Analysis for the approved TP scope before CD+Tests.";
const CD_TESTS_NEXT = "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR.";

// Approved TP with a recorded Brownfield Analysis: the evaluated gate is CD+Tests. The stored
// header gate and next step vary per case.
function internalStepRunState(runId, { storedGate, storedNext, lifecycle = "active", mode = "structured_delivery", extraArtefactRow = "" }) {
  return `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: ${runId}
- lifecycle: ${lifecycle}
- revision: 1
- revision_id: 44444444-4444-4444-8444-444444444444
- mode: ${mode}
- current_gate: ${storedGate}
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approved TP; Brownfield Analysis recorded. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | No approval is pending. |
| What is the next allowed action? | ${storedNext} |
| What is explicitly forbidden right now? | claim QA pass |

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
| UR | UR.md | approved | |
| Brownfield Review | BROWNFIELD_REVIEW.md | done | |
| PRD | PRD.md | approved | |
| SD | SD.md | approved | |
| TP | TP.md | approved | |
| Brownfield Analysis | BROWNFIELD_ANALYSIS.md | done | pre_implementation_analysis; decision pass |
| CD+Tests |  | missing | |
| CR |  | missing | |
| QA |  | missing | |
${extraArtefactRow}
## Mode/Slice Decision

- decision: ${mode}
- required_next_gate: PRD
- scope_reason: Stale next-step fixture.
- evidence: BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | exact approval |
| PRD | derived_from | UR | linked |
| SD | derived_from | PRD | linked |
| TP | derived_from | SD | linked |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| stale next-step fixture | cli-gate-scenarios-test.js | transition | direct |

## Closeout

- next_allowed_action: ${storedNext}
`;
}

function withInternalStepRun(caseName, options, action) {
  withFixture("internal-step", `stale-${caseName}`, (context) => {
    const statePath = join(context.root, ".agdf", "control", "runs", context.runId, "RUN_STATE.md");
    writeFileSync(statePath, sealRunState(context.root, internalStepRunState(context.runId, options)));
    action({ ...context, statePath });
  });
}

function nextStepView({ root, runId }) {
  const report = json(["gate-check", "--dir", root, "--run", runId, "--json"]);
  const map = json(["delivery-map", "--dir", root, "--run", runId, "--json"]);
  const card = invoke(["gate-check", "--dir", root, "--run", runId, "--status-card"]);
  return { report, map, card };
}

function staleNextStep() {
  let neverStale;
  withInternalStepRun("current", { storedGate: "CD+Tests", storedNext: CD_TESTS_NEXT }, (context) => {
    neverStale = nextStepView(context);
    assert.equal(neverStale.report.current_gate, "CD+Tests");
    assert.equal(neverStale.report.next_allowed_action, CD_TESTS_NEXT);
    const continued = dispatch(context, "--continue-delivery");
    assert.equal(continued.continuation?.phase, "implementation", "a current CD+Tests next step continues into implementation");
  });

  // The stored gate moved (Brownfield Analysis recorded without refreshing derived fields): every
  // read surface and the dispatcher follow the evaluated gate, exactly like the never-stale run.
  withInternalStepRun("moved", { storedGate: "Brownfield Analysis", storedNext: BROWNFIELD_NEXT }, (context) => {
    const stale = nextStepView(context);
    assert.equal(stale.report.current_gate, "CD+Tests");
    assert.equal(stale.report.next_allowed_action, CD_TESTS_NEXT, "gate-check uses the evaluated next step");
    assert.equal(stale.report.status_card.next_step, neverStale.report.status_card.next_step);
    assert.equal(stale.card, neverStale.card, "the status card equals the never-stale card");
    assert.equal(stale.map.next_allowed_action, CD_TESTS_NEXT, "delivery-map uses the evaluated next step");
    assert.doesNotMatch(stale.card, /Run Brownfield Analysis/u);
    const continued = dispatch(context, "--continue-delivery");
    assert.equal(continued.continuation?.phase, "implementation", "a moved gate no longer stalls continue_delivery");
  });

  // A deliberate same-gate decision keeps its text and keeps stopping automatic implementation.
  const pending = "Choose whether AC-006 stays open under this TP or a separate scope update starts.";
  withInternalStepRun("same-gate", { storedGate: "CD+Tests", storedNext: pending }, (context) => {
    const view = nextStepView(context);
    assert.equal(view.report.next_allowed_action, pending);
    assert.equal(view.map.next_allowed_action, pending);
    const continued = dispatch(context, "--continue-delivery");
    assert.notEqual(continued.continuation?.phase, "implementation", "a pending same-gate decision must not start implementation");
  });

  // A backward move after retracted evidence (stored QA, evaluated CD+Tests) keeps the stored text and
  // never starts automatic implementation.
  const retracted = "Draft or refine the current artefact.";
  withInternalStepRun("backward", { storedGate: "QA", storedNext: retracted }, (context) => {
    const view = nextStepView(context);
    assert.equal(view.report.current_gate, "CD+Tests");
    assert.equal(view.report.next_allowed_action, retracted, "a backward move keeps the stored next step");
    assert.equal(view.map.next_allowed_action, retracted);
    const continued = dispatch(context, "--continue-delivery");
    assert.notEqual(continued.continuation?.phase, "implementation", "a backward move must not start implementation");
  });

  // Completed runs keep their authored closeout text, even when the layout evaluates to another gate.
  const closeout = "No run work remains; VCS actions require a separate explicit instruction.";
  for (const mode of ["structured_delivery", "verified_change"]) {
    withInternalStepRun(`completed-${mode}`, { storedGate: "OR", storedNext: closeout, lifecycle: "completed", mode }, (context) => {
      const view = nextStepView(context);
      if (mode === "structured_delivery") assert.equal(view.report.next_allowed_action, closeout);
      assert.equal(view.map.next_allowed_action, closeout, `delivery-map keeps the closeout text (${mode})`);
    });
  }

  // An open blocker keeps precedence over the evaluated next step.
  withInternalStepRun("blocked", { storedGate: "Brownfield Analysis", storedNext: BROWNFIELD_NEXT,
    extraArtefactRow: "| CR |  | missing | |\n" }, (context) => {
    const report = json(["gate-check", "--dir", context.root, "--run", context.runId, "--json"], 2);
    assert.equal(report.status, "blocked");
    assert.notEqual(report.next_allowed_action, CD_TESTS_NEXT, "a blocker's recovery wins over the evaluated next step");
    assert.notEqual(report.next_allowed_action, BROWNFIELD_NEXT);
  });
}

// Canonical read-only dispatch and recording in isolated synthetic approved-scope runs.
function qaFollowUp() {
  const table = '| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n';
  const rows = {
    implementation: '| F-01 | implementation_gap | CD+Tests | open | Approved AC-001 assertion fails | Correct the declared assertion and refresh its tests/reviews |',
    internalEvidence: '| F-01 | evidence_gap | evidence_obligation | open | Required local test output is missing | Run the declared local test and retain its output |',
    requirements: '| F-01 | requirements_gap | PRD | open | Approved acceptance behavior is contradictory | Request PRD source revision |',
    changedIntent: '| F-01 | requirements_gap | UR | open | Observed changed user intent in scope | Request UR source revision |',
    plan: '| F-01 | plan_gap | TP | open | Acceptance test has no task | Request TP source revision |',
    emergent: '| F-01 | emergent_risk | SD | open | Explicit earliest-owner assessment identifies missing SD policy | Request assessed source revision |',
    missing: '',
    decisionConflict: '| F-01 | implementation_gap | CD+Tests | open | Test fails | Correct code |',
    blocked: '| F-01 | implementation_gap | CD+Tests | open | Test fails | Correct code |',
    reference: '| F-01 | implementation_gap | CD+Tests | open | Test fails | Correct code |',
    foreign: '| F-01 | implementation_gap | CD+Tests | open | Test fails | Correct code |',
    evidence: '| F-01 | evidence_gap | evidence_obligation | open | Native model observation is missing | Prepare the exact candidate and full observation sequence |',
    upstream: '| F-01 | design_gap | SD | open | Existing owner was not decided | Request the existing SD revision decision |',
    multipleOwners: '| F-01 | design_gap | SD | open | Missing owner | Request SD revision |\n| F-02 | requirements_gap | PRD | open | Acceptance contradicts scope | Request PRD revision |\n| F-03 | design_gap | SD | open | Missing failure policy | Request SD revision |',
    secondHeader: '| F-01 | implementation_gap | CD+Tests | open | Test fails | Correct code |\n\n| finding-id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n| F-02 | design_gap | SD | open | Missing ownership | Request source revision |',
    malformed: '| F-01 | implementation_gap | SD | open | Test fails | Correct code |',
    unknown: '| F-01 | unknown_gap | CD+Tests | open | Test fails | Correct code |',
    incomplete: '| F-01 | implementation_gap | CD+Tests | open | Test fails |',
    resolved: '| F-01 | implementation_gap | CD+Tests | resolved | Test now passes | Refresh affected review |',
    conflict: '| F-01 | implementation_gap | CD+Tests | open | Test fails | Correct code |',
  };
  for (const [name, row] of Object.entries(rows)) withFixture('qa-follow-up', `qa-${name}`, context => {
    const { root, runId } = context, prefix = `.agdf/control/artefacts/${runId}/`;
    mkdirSync(join(root, prefix), { recursive: true });
    writeFileSync(join(root, prefix, 'QA_REPORT.md'), `# QA\n- decision: ${name === 'decisionConflict' ? 'pass' : name === 'blocked' ? 'block' : 'revise'}\n\n` + table + row + (name === 'foreign' ? '\n[Code Review](../foreign/CR.md)\n' : name === 'reference' ? '\n[Plan coverage](TASK_PLAN_REVIEW.md)\n' : '\n'));
    writeFileSync(join(root, prefix, 'CR.md'), '# Code Review\n- decision: pass\n' + (name === 'conflict' ? '\n' + table + rows.upstream : ''));
    if (name === 'reference') writeFileSync(join(root, prefix, 'TASK_PLAN_REVIEW.md'), '# Review\n- decision: revise\n\n' + table + rows.plan + '\n');
    const path = join(root, `.agdf/control/runs/${runId}/RUN_STATE.md`);
    let content = internalStepRunState(runId, { storedGate: 'QA', storedNext: 'Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do not request Approval: QA from a revise report.' });
    content = content.replace('| CD+Tests |  | missing | |', '| CD+Tests |  | done | synthetic implementation complete |')
      .replace('| CR |  | missing | |', `| CR | ${prefix}CR.md | done | synthetic review |`)
      .replace('| QA |  | missing | |', `| QA | ${prefix}QA_REPORT.md | ${name === 'blocked' ? 'block' : 'revise'} | synthetic decision |`);
    writeFileSync(path, sealRunState(root, content));
    const bytes = () => {
      const inventory = [], hash = createHash('sha256');
      const scan = folder => { for (const e of readdirSync(folder, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
        const p = join(folder,e.name); inventory.push(p.slice(root.length));
        if (e.isDirectory()) scan(p); else hash.update(p.slice(root.length)).update(readFileSync(p));
      }}; scan(join(root, '.agdf/control')); return JSON.stringify({ inventory, digest: hash.digest('hex') });
    };
    if (name === 'implementation') writeFileSync(join(root, 'filter.mjs'), 'export const restore = saved => ({});\n');
    const checkFilter = () => spawnSync(process.execPath, ['--input-type=module', '-e', `import assert from 'node:assert/strict'; import {restore} from './filter.mjs'; assert.deepEqual(restore({status:'active'}),{status:'active'});`], {cwd:root,encoding:'utf8'});
    if (name === 'implementation') assert.notEqual(checkFilter().status, 0, 'synthetic approved AC is initially violated');
    const before = bytes(), status = dispatch(context), continued = dispatch(context, '--continue-delivery');
    assert.equal(bytes(), before, 'status and continuation dispatch preserve complete control paths/bytes');
    assert.equal(status.terminal, true);
    assert.doesNotMatch(status.host_action.text, /Ich arbeite weiter|I am continuing/);
    if (name === 'upstream' || name === 'multipleOwners') {
      const expected = name === 'upstream' ? /source-owner decision \(SD\)/u : /source-owner decision \(SD, PRD\)/u;
      for (const language of ['en', 'de']) {
        const rendered = json(['skill-dispatch', '--json', '--skill', 'gate-check', '--surface', 'codex',
          '--language', language, '--working-directory', root, '--target-source', 'explicit_target',
          '--primary-target', root, '--run', runId, '--continue-delivery']);
        assert.equal(rendered.terminal, true, 'naming the source owner must retain the decision stop');
        assert.equal(rendered.control.missing_approval, 'none');
        assert.match(rendered.host_action.text, expected, 'the actual card must identify known upstream owners');
      }
      assert.equal(bytes(), before, 'owner diagnosis keeps the entire control inventory and bytes read-only');
    }
    if (['implementation','evidence','internalEvidence'].includes(name)) {
      assert.equal(continued.terminal, false, JSON.stringify(continued));
      assert.equal(continued.continuation.skill_id, name === 'implementation' ? 'gate-check' : 'qa-gate');
      assert.equal(continued.continuation.phase, name === 'implementation' ? 'implementation' : undefined);
      assert.match(continued.continuation.instruction, /F-01/);
      assert.match(continued.continuation.instruction, /Do not edit approved sources/);
      assert.equal(continued.control.missing_approval, 'none');
      // Execute the permitted synthetic work, refresh affected evidence/review, then record.
      if (name === 'implementation') {
        writeFileSync(join(root, 'filter.mjs'), 'export const restore = saved => ({...saved});\n');
        assert.equal(checkFilter().status, 0, 'the same declared acceptance check now passes');
      }
      writeFileSync(join(root, prefix, 'CD_TESTS.md'), '# Refreshed CD+Tests\nSynthetic approved filter check observed: pass.\n');
      writeFileSync(join(root, prefix, 'CR.md'), '# Refreshed Code Review\n- decision: pass\nDeclared synthetic change and affected evidence reviewed.\n');
      writeFileSync(path, readFileSync(path,'utf8').replace('| CD+Tests |  | done | synthetic implementation complete |', `| CD+Tests | ${prefix}CD_TESTS.md | done | refreshed evidence |`));
      writeFileSync(join(root, prefix, 'QA_REPORT.md'), '# QA\n- decision: revise\n\n' + table + rows.resolved + '\n');
      const old = content.match(/^- revision_id: (.+)$/mu)[1];
      const recorded = json(['run-update', '--dir', root, '--run', runId, '--revision', old, '--json']);
      assert.notEqual(recorded.revision_id, old);
      const reevaluated = dispatch(context, '--continue-delivery');
      assert.equal(reevaluated.terminal, true, 'a revise report with no open obligation cannot grant fresh work or QA approval');
      assert.equal(reevaluated.control.missing_approval, 'none');
    } else {
      assert.equal(continued.terminal, true, JSON.stringify(continued));
      assert.equal(continued.control.missing_approval, 'none');
      assert.doesNotMatch(continued.host_action.text, /Ich arbeite weiter/);
    }
    if (process.env.AGDF_CHAIN_TEST_LOG) {
      const logPath = process.env.AGDF_CHAIN_TEST_LOG;
      let log = []; try { log = JSON.parse(readFileSync(logPath, 'utf8')); } catch {}
      log.push({ scenario: name, status, continued, control_before: before, control_after_dispatch: before });
      writeFileSync(logPath, JSON.stringify(log, null, 2));
    }
  });
}

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--list") {
  console.log([...scenarios.keys()].join("\n"));
} else {
  if (args.length && (args.length !== 2 || args[0] !== "--case" || !scenarios.has(args[1]))) {
    throw new Error(`Use --case <${[...scenarios.keys()].join("|")}> or --list.`);
  }
  const selected = args.length ? [args[1]] : [...scenarios.keys()];
  for (const name of selected) {
    const started = performance.now();
    console.log(`[cli-gates] START ${name}`);
    scenarios.get(name)();
    console.log(`[cli-gates] PASS ${name} (${((performance.now() - started) / 1000).toFixed(1)}s)`);
  }
}
