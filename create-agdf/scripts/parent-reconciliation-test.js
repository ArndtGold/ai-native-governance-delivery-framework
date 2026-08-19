import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseControlState } from "../lib/control-state/run-state-parser.js";
import { evaluateDoctor } from "../lib/control-evaluation/doctor.js";
import { analyzeDeliveryMap, evaluateDeliveryMap, printDeliveryMapReport } from "../lib/control-evaluation/delivery-map.js";
import { buildStatusCard, evaluateGateCheck, postApprovalTransition } from "../lib/control-evaluation/gate-check.js";
import { evaluateReconciliationState } from "../lib/control-evaluation/parent-reconciliation.js";

function state(runId, rows = [], options = {}) {
  return {
    run_id: runId,
    path: `.agdf/control/runs/${runId}/RUN_STATE.md`,
    content: options.content ?? `run ${runId}`,
    artefact_chain: rows,
    approvals: options.approvals ?? new Map(),
    artefacts: options.artefacts ?? new Map(),
    parent_reconciliation: options.parent_reconciliation ?? { present: false, disposition: "", next_action: "", field_counts: { disposition: 0, next_action: 0 } },
    programme_aggregation: options.programme_aggregation ?? { present: false, acceptance_ref: "", evidence: "", missing_evidence: "", field_counts: { acceptance_ref: 0, evidence: 0, missing_evidence: 0 } },
    missing_evidence: [], risks: [], context_graph: {}, source_scope: {}, memory: {}, evidence_refs: [],
  };
}

const childRow = { from: "OR", relationship: "reconciles_with", to: "parent_run:parent", evidence: "Approved Child OR targets Parent." };
const reciprocal = { from: "Aggregate", relationship: "includes", to: "child_run:child", evidence: "Parent acceptance matrix links the Child OR." };
const parent = state("parent", [reciprocal]);
const loadResolved = (runId) => runId === "parent" ? parent : null;

assert.equal(evaluateReconciliationState(state("child"), { loadRun: loadResolved }).parent_reconciliation.outcome, "not_applicable");
assert.equal(evaluateReconciliationState(state("child", [{ from: "Nearby", relationship: "mentions", to: "parent", evidence: "name only" }]), { loadRun: loadResolved }).parent_reconciliation.outcome, "not_applicable");

const resolved = evaluateReconciliationState(state("child", [childRow]), { loadRun: loadResolved });
assert.equal(resolved.parent_reconciliation.outcome, "resolved");
assert.equal(resolved.findings.length, 0);

const missingParent = evaluateReconciliationState(state("child", [childRow]), { loadRun: () => null });
assert.equal(missingParent.parent_reconciliation.outcome, "open");
assert.equal(missingParent.findings[0].code, "AGDF_PARENT_RECONCILIATION_OPEN");
assert.match(missingParent.parent_reconciliation.next_action, /Restore or select Parent run parent/);

for (const [name, rows] of [
  ["missing reciprocal", []],
  ["empty reciprocal evidence", [{ ...reciprocal, evidence: "" }]],
  ["ambiguous reciprocal", [reciprocal, reciprocal]],
]) {
  const result = evaluateReconciliationState(state("child", [childRow]), { loadRun: () => state("parent", rows) });
  assert.equal(result.parent_reconciliation.outcome, "open", name);
  assert.equal(result.findings[0].severity, "warn", name);
}

const duplicate = evaluateReconciliationState(state("child", [childRow, { ...childRow, to: "parent_run:other" }]), { loadRun: loadResolved });
assert.equal(duplicate.parent_reconciliation.outcome, "open");
assert.equal(duplicate.findings[0].code, "AGDF_PARENT_RECONCILIATION_EVIDENCE_INVALID");
assert.equal(duplicate.parent_reconciliation.target_run_id, "");

for (const target of ["parent_run:../escape", "parent_run:/absolute", "parent_run:child", "parent_run:UPPER"]) {
  const invalid = evaluateReconciliationState(state("child", [{ ...childRow, to: target }]), { loadRun: () => { throw new Error("must not load invalid target"); } });
  assert.equal(invalid.parent_reconciliation.outcome, "open", target);
  assert.equal(invalid.findings[0].code, "AGDF_PARENT_RECONCILIATION_EVIDENCE_INVALID", target);
}

const declaredAction = { present: true, disposition: "action_required", next_action: "Update the named Parent.", field_counts: { disposition: 1, next_action: 1 } };
const acceptedOpen = { ...declaredAction, disposition: "accepted_open", next_action: "Retain for the next Parent review." };
assert.equal(evaluateReconciliationState(state("child", [childRow], { parent_reconciliation: declaredAction }), { loadRun: () => null }).parent_reconciliation.next_action, declaredAction.next_action);
assert.equal(evaluateReconciliationState(state("child", [childRow], { parent_reconciliation: acceptedOpen }), { loadRun: () => null }).parent_reconciliation.disposition, "accepted_open");
const invalidInput = { ...declaredAction, field_counts: { disposition: 2, next_action: 1 } };
assert.equal(evaluateReconciliationState(state("child", [childRow], { parent_reconciliation: invalidInput }), { loadRun: () => null }).findings[0].code, "AGDF_PARENT_RECONCILIATION_EVIDENCE_INVALID");
assert.equal(evaluateReconciliationState(state("child", [childRow], { parent_reconciliation: invalidInput }), { loadRun: loadResolved }).parent_reconciliation.outcome, "open");

const completedChild = state("included", [], { artefacts: new Map([["OR", { path: ".agdf/control/artefacts/included/OR.md", status: "done" }]]) });
const includes = { from: "Aggregate", relationship: "includes", to: "child_run:included", evidence: "Completed Child OR." };
const programmeInput = (overrides = {}) => ({
  present: true,
  acceptance_ref: ".agdf/control/artefacts/parent/AGGREGATE_ACCEPTANCE.md",
  evidence: "Programme acceptance matrix.",
  missing_evidence: "none",
  field_counts: { acceptance_ref: 1, evidence: 1, missing_evidence: 1 },
  ...overrides,
});
const evaluateProgramme = (rows, input, resolveFile = () => "/repo/acceptance.md", loadRun = () => completedChild) => evaluateReconciliationState(
  state("parent", rows, { programme_aggregation: input }),
  { loadRun, resolveFile },
).programme_aggregation;
assert.deepEqual(
  [evaluateProgramme([], programmeInput()).startable, evaluateProgramme([], programmeInput()).final_ready],
  [false, false],
);
assert.deepEqual(
  [evaluateProgramme([includes], programmeInput(), () => "").startable, evaluateProgramme([includes], programmeInput(), () => "").final_ready],
  [false, false],
);
assert.deepEqual(
  [evaluateProgramme([includes], programmeInput(), (path) => path.endsWith("OR.md") ? "/repo/OR.md" : "").startable, evaluateProgramme([includes], programmeInput(), (path) => path.endsWith("OR.md") ? "/repo/OR.md" : "").final_ready],
  [true, false],
);
assert.equal(evaluateProgramme([includes], programmeInput({ missing_evidence: "UAT missing" })).final_ready, false);
assert.equal(evaluateProgramme([includes, includes], programmeInput()).final_ready, false);
const finalReady = evaluateProgramme([includes], programmeInput());
assert.equal(finalReady.startable, true);
assert.equal(finalReady.final_ready, true);

const parsed = parseControlState(`## Run Meta\n\n- run_id: child\n\n## Parent Reconciliation Handoff\n\n- parent_reconciliation_disposition: accepted_open\n- parent_reconciliation_next_action: Reconcile Parent.\n\n## Programme Aggregation Readiness\n\n- programme_acceptance_ref: .agdf/control/artefacts/parent/ACCEPTANCE.md\n- programme_aggregation_evidence: linked children\n- programme_aggregation_missing_evidence: none\n`);
assert.equal(parsed.run_id, "child");
assert.equal(parsed.parent_reconciliation.disposition, "accepted_open");
assert.equal(parsed.parent_reconciliation.field_counts.next_action, 1);
assert.equal(parsed.programme_aggregation.acceptance_ref, ".agdf/control/artefacts/parent/ACCEPTANCE.md");
const templateOnly = parseControlState(`## Run Meta\n\n- run_id: child\n\n## Programme Aggregation Readiness\n\n- programme_acceptance_ref:\n- programme_aggregation_evidence:\n- programme_aggregation_missing_evidence: \`none\`\n`);
assert.equal(evaluateReconciliationState({ ...state("child"), programme_aggregation: templateOnly.programme_aggregation }).programme_aggregation.applicable, false);
assert.equal(evaluateProgramme([includes], programmeInput({ acceptance_ref: "README.md" }), () => "/repo/README.md").final_ready, false);

const directMap = analyzeDeliveryMap(state("child", [childRow]), { loadRun: () => state("parent", []) });
assert.equal(directMap.parent_reconciliation.outcome, "open");
assert.ok(directMap.findings.some((finding) => finding.code === "AGDF_PARENT_RECONCILIATION_OPEN"));
const humanLines = [];
printDeliveryMapReport({ ...directMap, status: "warn", current_gate: "OR", next_allowed_action: "Reconcile Parent.", quality_outlook: "Preserve Child authority." }, false, { log: (line = "") => humanLines.push(line) });
assert.match(humanLines.join("\n"), /Child child has an open reconciliation handoff to Parent parent/);
assert.match(humanLines.join("\n"), /Reconcile Child child in Parent parent/);
assert.doesNotMatch(humanLines.join("\n"), /Approval:/);

const repoRoot = join(import.meta.dirname, "..", "..");
const closeoutContract = readFileSync(join(repoRoot, "plugin", "meta", "contracts", "closeout.md"), "utf8");
const releaseSkill = readFileSync(join(repoRoot, "plugin", "skills", "release-or", "SKILL.md"), "utf8");
const deliverySkill = readFileSync(join(repoRoot, "plugin", "skills", "delivery-closeout", "SKILL.md"), "utf8");
const orTemplate = readFileSync(join(repoRoot, "plugin", "control", "templates", "artefacts", "OR.md"), "utf8");
assert.match(closeoutContract, /never grants, revokes or\s+blocks Child gates, QA, UAT, OR completion/);
assert.match(closeoutContract, /Delivery Map is the single deterministic evaluator/);
assert.match(releaseSkill, /report that evaluated object without\s+rediscovering or reclassifying/);
assert.match(deliverySkill, /Consume Parent reconciliation from the OR only/);
const parentTemplateSection = orTemplate.match(/## Parent Reconciliation Handoff[\s\S]*?(?=\n## Programme Aggregation Readiness)/)?.[0] ?? "";
assert.match(parentTemplateSection, /resolved \| not_applicable \| open/);
assert.doesNotMatch(parentTemplateSection, /Approval:/);

const root = mkdtempSync(join(tmpdir(), "agdf-parent-reconciliation-"));
const cli = join(import.meta.dirname, "..", "bin", "create-agdf.js");
try {
  execFileSync(process.execPath, [cli, "init", "--dir", root]);
  rmSync(join(root, ".agdf", "control", "AGDF_RUN.md"), { force: true });
  for (const runId of ["child", "parent"]) execFileSync(process.execPath, [cli, "run-create", "--dir", root, "--run", runId]);
  const runText = (runId, chain) => `# AGDF Run State\n\n## Run Meta\n\n- control_state_version: 2\n- run_id: ${runId}\n- lifecycle: active\n- revision: 1\n- revision_id: ${runId === "child" ? "11111111-1111-4111-8111-111111111111" : "22222222-2222-4222-8222-222222222222"}\n- mode: structured_delivery\n- current_gate: UR\n- decision: in_progress\n- owner: test\n\n## Artefact Chain\n\n| From | Relationship | To | Evidence |\n|---|---|---|---|\n${chain}\n\n## Evidence\n\n| Evidence | Source | Covers | Strength |\n|---|---|---|---|\n| Fixture | test | reconciliation | direct |\n\n## Closeout\n\n- next_allowed_action: Draft UR.\n- quality_outlook: Preserve independent authority.\n`;
  const childPath = join(root, ".agdf", "control", "runs", "child", "RUN_STATE.md");
  const parentPath = join(root, ".agdf", "control", "runs", "parent", "RUN_STATE.md");
  writeFileSync(childPath, runText("child", "| OR | reconciles_with | parent_run:parent | Explicit Parent evidence. |"));
  writeFileSync(parentPath, runText("parent", "| Aggregate | includes | child_run:child | Child OR evidence. |"));
  const beforeParent = readFileSync(parentPath, "utf8");
  const doctorResolved = evaluateDoctor(root, { runId: "child" });
  const gateResolved = evaluateGateCheck(root, { runId: "child" });
  const mapResolved = evaluateDeliveryMap(root, { runId: "child" }, { evaluateDoctor, buildStatusCard, postApprovalTransition });
  assert.equal(doctorResolved.parent_reconciliation.outcome, "resolved");
  assert.equal(gateResolved.delivery_map.parent_reconciliation.outcome, "resolved");
  assert.equal(mapResolved.parent_reconciliation.outcome, "resolved");
  writeFileSync(parentPath, runText("parent", ""));
  const doctorOpen = evaluateDoctor(root, { runId: "child" });
  const gateOpen = evaluateGateCheck(root, { runId: "child" });
  const mapOpen = evaluateDeliveryMap(root, { runId: "child" }, { evaluateDoctor, buildStatusCard, postApprovalTransition });
  for (const report of [doctorOpen, gateOpen.delivery_map, mapOpen]) {
    assert.equal(report.parent_reconciliation.outcome, "open");
    assert.equal(report.findings.filter((finding) => finding.code === "AGDF_PARENT_RECONCILIATION_OPEN").length, 1);
  }
  assert.equal(readFileSync(parentPath, "utf8"), runText("parent", ""), "evaluation must not mutate Parent state");
  assert.notEqual(beforeParent, readFileSync(parentPath, "utf8"), "test setup must exercise changed Parent evidence");
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("AGDF parent reconciliation tests passed");
