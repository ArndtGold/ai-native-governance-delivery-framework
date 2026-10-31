import { withOwnedFileLock } from '../lib/control-state/run-state-writer.js';
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
import { recoverPendingRunStep, commitRunStepLocked } from "../lib/control-state/run-step-transaction.js";
import { decodeBacklogMarker } from "../lib/control-state/backlog-summary.js";

const digest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const closeout = { result: "delivered", evidence: "test evidence", risk: "none", next: "done" };

function fixture(root, runId) {
  const backlog = join(root, '.agdf/control/MASTER_BACKLOG.md');
  if (!existsSync(backlog)) writeFileSync(backlog, '# Legacy planning\n\nRetained idea.\n');
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

for (const boundary of ["intent", "or", "run"]) {
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
      assert.equal(JSON.parse(readFileSync(join(root, '.agdf/control/runs/first/RUN_STEP_PENDING.json'), 'utf8')).backlog, null);
      assert.equal(run.step("closeout", closeout).outcome, "recovered", boundary);
      assert.equal(digest(backlog), prior.backlog, 'Run-only recovery leaves legacy bytes unchanged');
    }
    assert.equal(runSealState(root, readFileSync(run.state, "utf8")).status, "valid", boundary);
    assert.match(readFileSync(run.or, "utf8"), /delivered/);
    assert.equal(digest(backlog), prior.backlog);
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
  assert.equal(existsSync(join(concurrentRoot, '.agdf/control/MASTER_BACKLOG.md')), false);
  for (const runId of ['alpha', 'beta']) assert.equal(runSealState(concurrentRoot,
    readFileSync(join(concurrentRoot, '.agdf/control/runs', runId, 'RUN_STATE.md'), 'utf8')).status, 'valid');

} finally { rmSync(concurrentRoot, { recursive: true, force: true }); }

const independentRoot = mkdtempSync(join(tmpdir(), 'agdf-run-step-independent-pending-'));
try {
  initializeCanonicalControl(independentRoot, generatedFilesForTarget('init', independentRoot, false, 'de'));
  const alpha = fixture(independentRoot, 'alpha'), beta = fixture(independentRoot, 'beta');
  const legacy = readFileSync(join(independentRoot, '.agdf/control/MASTER_BACKLOG.md'), 'utf8');
  const interrupted = alpha.step('closeout', closeout, { afterWrite(stage) { if (stage === 'run') throw Error('interrupted alpha'); } });
  assert.equal(interrupted.reason, 'run_step_recovery_required');
  const oldBeta = beta.revision();
  assert.equal(beta.step('evidence', { evidence: 'Independent beta check' }).outcome, 'recorded');
  assert.equal(beta.step('evidence', { evidence: 'Stale beta check', revisionId: oldBeta }).reason, 'stale_revision');
  assert.notEqual(evaluateDoctor(independentRoot, { runId: 'beta' }).status, 'block');
  const betaBytes = readFileSync(beta.state, 'utf8');
  assert.equal(recoverPendingRunStep(independentRoot, 'alpha').status, 'completed');
  assert.equal(readFileSync(beta.state, 'utf8'), betaBytes);
  assert.equal(readFileSync(join(independentRoot, '.agdf/control/MASTER_BACKLOG.md'), 'utf8'), legacy);
} finally { rmSync(independentRoot, { recursive: true, force: true }); }

const conflictRoot = mkdtempSync(join(tmpdir(), "agdf-run-step-conflict-"));
try {
  initializeCanonicalControl(conflictRoot, generatedFilesForTarget("init", conflictRoot, false, "de"));
  const run = fixture(conflictRoot, "conflict");
  const backlog = join(conflictRoot, ".agdf", "control", "MASTER_BACKLOG.md");
  const oldBacklog = readFileSync(backlog, "utf8");
  const foreignBacklog = `${oldBacklog}\nforeign edit\n`;
  // Emulate a pre-cutover journal using the original low-level transaction owner.
  const oldRun = readFileSync(run.state, 'utf8');
  assert.throws(() => withOwnedFileLock(run.state, () => withOwnedFileLock(backlog, () => commitRunStepLocked(conflictRoot, {
    runId: 'conflict', runPath: run.state, content: oldRun, revisionId: run.revision(), expectedContent: oldRun,
    backlog: { old: oldBacklog, next: oldBacklog + 'captured legacy update\n' }, or: null,
    afterWrite(stage) { if (stage === 'run') { writeFileSync(backlog, foreignBacklog); throw Error('legacy interruption'); } },
  }))), /AGDF_RUN_STEP_RECOVERY_REQUIRED/);
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
  assert.equal(recoverPendingRunStep(conflictRoot, "conflict").status, "completed");
  assert.equal(readFileSync(backlog, "utf8"), oldBacklog + "captured legacy update\n");
} finally { rmSync(conflictRoot, { recursive: true, force: true }); }

const sameTextRoot = mkdtempSync(join(tmpdir(), 'agdf-run-step-same-text-'));
try {
  initializeCanonicalControl(sameTextRoot, generatedFilesForTarget('init', sameTextRoot, false, 'de'));
  const run = fixture(sameTextRoot, 'same-text'), backlog = join(sameTextRoot, '.agdf/control/MASTER_BACKLOG.md');
  const before = readFileSync(backlog, 'utf8'), beforeRevision = run.revision();
  const repeated = run.step('review', { decision: 'pass', evidence: 'fixture' });
  assert.equal(repeated.outcome, 'recorded'); assert.equal(repeated.backlog, 'not_required');
  assert.notEqual(repeated.revision_id, beforeRevision); assert.equal(readFileSync(backlog, 'utf8'), before);
  // Closeout owns OR output, so it uses a journal even without a typed operation context.
  const interrupted = run.step('closeout', closeout, { afterWrite(stage) { if (stage === 'run') throw Error('injected'); } });
  assert.equal(interrupted.reason, 'run_step_recovery_required');
  assert.equal(JSON.parse(readFileSync(join(sameTextRoot, '.agdf/control/runs/same-text/RUN_STEP_PENDING.json'), 'utf8')).backlog, null);
  assert.equal(run.step('closeout', closeout).outcome, 'recovered');
  assert.equal(readFileSync(backlog, 'utf8'), before);

} finally { rmSync(sameTextRoot, { recursive: true, force: true }); }

console.log("Run-step transaction boundaries passed.");
