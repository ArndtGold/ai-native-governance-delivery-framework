import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRun, parseRunState } from "../lib/control-state/index.js";
import { initializeCanonicalControl } from "../../cli/lib/scaffold/canonical-init.js";
import { generatedFilesForTarget } from "../../cli/lib/scaffold/plan.js";
import { recordRunStep } from "../lib/control-state/run-steps.js";
import { approveRunGate, recordRunRevision } from "../lib/control-state/run-recording.js";
import { prepareRunPresentation } from "../lib/control-state/run-presentation.js";
import { evaluateGateCheck } from "../lib/control-evaluation/gate-check.js";
import { evaluateDoctor } from "../lib/control-evaluation/doctor.js";
import { policyForRunContent } from "../lib/control-evaluation/run-step-policy.js";
import { runSealState } from "../lib/control-state/run-seal.js";
import { readRun } from "../lib/control-state/run-state-edits.js";
import { recoverPendingRunStep } from "../lib/control-state/run-step-transaction.js";

const digest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const closeout = { result: "delivered", evidence: "test evidence", risk: "none", next: "done" };

function fixture(root, runId) {
  const state = createRun(root, runId);
  const artefacts = join(root, ".agdf", "control", "artefacts", runId);
  mkdirSync(artefacts, { recursive: true });
  writeFileSync(join(artefacts, "UR.md"), `# UR: ${runId}\n\n## Problem\nA small task needs a clear result. The user should review this document before approval.\n\n## Goal\nRecord the completed task and its evidence.\n\n## Scope\nUse an isolated test repository.\n\n## AGDF Approval Summary (de; source=en)\n- Problem: Eine kleine Aufgabe braucht ein klares Ergebnis.\n- Ziel: Den Abschluss prüfen.\n- Umfang: Nur isolierter Test.\n`);
  const revision = () => parseRunState(readFileSync(state, "utf8"), runId).meta.revision_id;
  const step = (name, values = {}, options = {}) => recordRunStep(root,
    { runId, revisionId: revision(), step: name, ...values },
    { policy: policyForRunContent, date: "2026-09-29", ...options });
  assert.equal(step("ur", { title: runId }).outcome, "recorded");
  writeFileSync(join(artefacts, "BROWNFIELD_REVIEW.md"), "# Brownfield Review\n");
  assert.equal(step("route", { route: "quick_task", reason: "small", evidence: "fixture" }).outcome, "recorded");
  const presentation = prepareRunPresentation(root, { runId, gate: "UR", revisionId: revision() }, { evaluateGateCheck });
  assert.equal(presentation.outcome, "prepared");
  assert.equal(approveRunGate(root, { runId, gate: "UR", revisionId: revision(), response: "Approval: UR",
    presentationId: presentation.presentation_id }, { evaluateGateCheck }).outcome, "approved");
  assert.equal(step("review", { decision: "pass", evidence: "fixture" }).outcome, "recorded");
  return { state, artefacts, revision, step, or: join(artefacts, "OR.md") };
}

for (const boundary of ["intent", "or", "run", "backlog"]) {
  const root = mkdtempSync(join(tmpdir(), `agdf-run-step-${boundary}-`));
  try {
    initializeCanonicalControl(root, generatedFilesForTarget("init", root, false, "de"));
    const run = fixture(root, "first");
    const backlog = join(root, ".agdf", "control", "MASTER_BACKLOG.md");
    writeFileSync(run.or, "prior OR bytes\n");
    const prior = { run: digest(run.state), backlog: digest(backlog), or: digest(run.or) };
    const injected = () => run.step("closeout", closeout, { afterWrite(stage) {
      if (stage === boundary) throw new Error(`injected ${stage}`);
    } });
    if (boundary === "intent" || boundary === "or") {
      assert.throws(injected, /injected/, boundary);
    } else {
      assert.equal(injected().reason, "run_step_recovery_required", boundary);
    }
    if (boundary === "intent" || boundary === "or") {
      assert.deepEqual({ run: digest(run.state), backlog: digest(backlog), or: digest(run.or) }, prior, boundary);
      assert.equal(existsSync(join(root, ".agdf", "control", "runs", "first", "RUN_STEP_PENDING.json")), false);
      assert.equal(run.step("closeout", closeout).outcome, "recorded");
    } else {
      assert.equal(run.step("closeout", closeout).outcome, "recovered", boundary);
    }
    assert.equal(runSealState(root, readFileSync(run.state, "utf8")).status, "valid", boundary);
    assert.match(readFileSync(run.or, "utf8"), /delivered/);
    assert.notEqual(digest(backlog), prior.backlog);
    assert.equal(existsSync(join(root, ".agdf", "control", "runs", "first", "RUN_STEP_PENDING.json")), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
}

const listedOrRoot = mkdtempSync(join(tmpdir(), "agdf-run-step-listed-or-"));
try {
  initializeCanonicalControl(listedOrRoot, generatedFilesForTarget("init", listedOrRoot, false, "de"));
  const run = fixture(listedOrRoot, "listed-or");
  writeFileSync(run.or, "prior OR bytes\n");
  const priorState = readFileSync(run.state, "utf8");
  const withListedOr = priorState.replace(/(## Artefacts[\s\S]*?\|---\|---\|---\|---\|\n)/u,
    "$1| OR | `.agdf/control/artefacts/listed-or/OR.md` | draft |  |\n");
  assert.notEqual(withListedOr, priorState);
  writeFileSync(run.state, withListedOr);
  assert.equal(recordRunRevision(listedOrRoot, { runId: "listed-or", revisionId: run.revision() }).outcome, "updated");
  assert.equal(runSealState(listedOrRoot, readFileSync(run.state, "utf8")).status, "valid");
  assert.equal(run.step("closeout", closeout).outcome, "recorded", "an already listed OR must not invalidate the prior seal during staging");
  assert.equal(runSealState(listedOrRoot, readFileSync(run.state, "utf8")).status, "valid");
  assert.match(readFileSync(run.or, "utf8"), /delivered/);
} finally { rmSync(listedOrRoot, { recursive: true, force: true }); }

const concurrentRoot = mkdtempSync(join(tmpdir(), "agdf-run-step-concurrent-"));
try {
  initializeCanonicalControl(concurrentRoot, generatedFilesForTarget("init", concurrentRoot, false, "de"));
  for (const runId of ["alpha", "beta"]) {
    createRun(concurrentRoot, runId);
    const artefacts = join(concurrentRoot, ".agdf", "control", "artefacts", runId);
    mkdirSync(artefacts, { recursive: true });
    writeFileSync(join(artefacts, "UR.md"), `# UR: ${runId}\n`);
  }
  const worker = (runId) => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(import.meta.dirname, "run-step-worker.js"), concurrentRoot, runId]);
    let stderr = "";
    child.stderr.setEncoding("utf8").on("data", (value) => { stderr += value; });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${runId}: ${stderr}`)));
  });
  await Promise.all([worker("alpha"), worker("beta")]);
  const backlog = readFileSync(join(concurrentRoot, ".agdf", "control", "MASTER_BACKLOG.md"), "utf8");
  for (const runId of ["alpha", "beta"]) {
    assert.equal(backlog.split("\n").filter((line) => line.startsWith(`| P1 | ${runId} |`)).length, 1);
  }
} finally { rmSync(concurrentRoot, { recursive: true, force: true }); }

const conflictRoot = mkdtempSync(join(tmpdir(), "agdf-run-step-conflict-"));
try {
  initializeCanonicalControl(conflictRoot, generatedFilesForTarget("init", conflictRoot, false, "de"));
  const run = fixture(conflictRoot, "conflict");
  const backlog = join(conflictRoot, ".agdf", "control", "MASTER_BACKLOG.md");
  const oldBacklog = readFileSync(backlog, "utf8");
  const foreignBacklog = `${oldBacklog}\nforeign edit\n`;
  assert.equal(run.step("closeout", closeout, { afterWrite(stage) {
    if (stage === "intent") writeFileSync(backlog, foreignBacklog);
  } }).reason, "run_step_recovery_required");
  assert.equal(readFileSync(backlog, "utf8"), foreignBacklog);
  assert.equal(readRun(conflictRoot, "conflict").rejection.reason, "run_step_recovery_required");
  const second = createRun(conflictRoot, "second");
  const secondArtefacts = join(conflictRoot, ".agdf", "control", "artefacts", "second");
  mkdirSync(secondArtefacts, { recursive: true });
  writeFileSync(join(secondArtefacts, "UR.md"), "# UR: second\n");
  const secondRevision = parseRunState(readFileSync(second, "utf8"), "second").meta.revision_id;
  const blockedOther = recordRunStep(conflictRoot, { runId: "second", revisionId: secondRevision, step: "ur", title: "second" },
    { policy: policyForRunContent, date: "2026-09-29" });
  assert.equal(blockedOther.reason, "run_step_recovery_required");
  assert.equal(blockedOther.pending_run_id, "conflict");
  const otherRead = evaluateDoctor(conflictRoot, { runId: "second" });
  assert.equal(otherRead.status, "block");
  assert.ok(otherRead.findings.some(({ code }) => code === "AGDF_RUN_STEP_RECOVERY_REQUIRED"));
  writeFileSync(backlog, oldBacklog);
  assert.equal(recoverPendingRunStep(conflictRoot, "conflict").status, "rolled_back");
} finally { rmSync(conflictRoot, { recursive: true, force: true }); }

console.log("Run-step transaction boundaries passed.");
