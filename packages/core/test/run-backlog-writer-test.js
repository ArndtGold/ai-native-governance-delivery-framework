import assert from "node:assert/strict";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { commandFixture } from "../../../scripts/support/control-command-fixture.js";
import { symlinkOrSkip } from "./control-cockpit-fixtures.js";
import { executeApprovalCommand } from "../lib/control-state/approval-command.js";
import { evaluateGateCheck } from "../lib/control-evaluation/gate-check.js";
import { policyForRunContent } from "../lib/control-evaluation/run-step-policy.js";
import { recordRunRevision } from "../lib/control-state/run-recording.js";
import { recordRunStep } from "../lib/control-state/run-steps.js";
import { runSealState } from "../lib/control-state/run-seal.js";
import { readApprovalOperations } from "../lib/control-state/approval-operations.js";
import { parseRunState } from "../lib/control-state/run-state-parser.js";

const dependencies = { evaluateGateCheck, packageVersion: "0.14.5" };
let checks = 0;
const pass = label => { checks++; console.log(`PASS ${label}`); };
const backlogPath = f => join(f.root, ".agdf/control/MASTER_BACKLOG.md");
const bytes = f => ({ run: readFileSync(f.runPath, "utf8"), backlog: readFileSync(backlogPath(f), "utf8") });
const row = f => bytes(f).backlog.split("\n").find(line => line.includes(`| ${f.runId} |`) || line.includes(`| \`${f.runId}\` |`));
const stale = text => text.replace(/^\|[^\n]*command-test[^\n]*$/mu, line => line.replace("Awaiting Brownfield Review", "Awaiting SD"));

for (const phase of ["intent", "run", "backlog"]) {
  const f = commandFixture();
  try {
    const before = bytes(f);
    const result = executeApprovalCommand(f.root, f.command, { ...dependencies,
      afterWrite(stage) { if (stage === phase) throw Error(`injected ${phase}`); } });
    if (phase === "intent") {
      assert.equal(result.outcome, "retryable_failure"); assert.deepEqual(bytes(f), before);
    } else {
      assert.equal(result.outcome, "recovery_required");
      assert.equal(existsSync(join(f.root, ".agdf/control/runs", f.runId, "RUN_STEP_PENDING.json")), true);
    }
    const retry = executeApprovalCommand(f.root, f.command, dependencies);
    assert.equal(retry.outcome, phase === "intent" ? "accepted" : "already_applied");
    const committed = bytes(f);
    assert.match(row(f), /Awaiting Brownfield Review/);
    assert.ok(row(f).includes(evaluateGateCheck(f.root, { runId: f.runId }).next_allowed_action));
    assert.equal(runSealState(f.root, committed.run).status, "valid");
    assert.equal(readApprovalOperations(committed.run).receipts.length, 1);
    assert.equal(existsSync(join(f.root, ".agdf/control/runs", f.runId, "RUN_STEP_PENDING.json")), false);
    assert.equal(executeApprovalCommand(f.root, f.command, dependencies).outcome, "already_applied");
    assert.deepEqual(bytes(f), committed, "receipt replay must neither bump revision nor rewrite Backlog");
    pass(`approval + Backlog transaction recovers ${phase}, identical replay has one effect`);
  } finally { f.cleanup(); }
}

const f = commandFixture();
try {
  const original = bytes(f), path = backlogPath(f);
  const rejected = executeApprovalCommand(f.root, { ...f.command, response: "go ahead" }, dependencies);
  assert.equal(rejected.outcome, "rejected"); assert.deepEqual(bytes(f), original); pass("nonexact reply changes neither Run nor Backlog");
  const presentationPath = join(f.root, ".agdf/control/runs", f.runId, "presentations", `${f.command.presentation_id}.json`);
  const presentation = readFileSync(presentationPath, "utf8");
  const changedPresentation = executeApprovalCommand(f.root, f.command, { ...dependencies,
    afterWrite(stage) { if (stage === "intent") writeFileSync(presentationPath, "{}"); } });
  assert.equal(changedPresentation.outcome, "rejected"); assert.deepEqual(bytes(f), original);
  writeFileSync(presentationPath, presentation); pass("presentation tampered after journal intent is rejected before commit");
  assert.equal(executeApprovalCommand(f.root, f.command, dependencies).outcome, "accepted");
  const accepted = bytes(f), revisionId = parseRunState(accepted.run).meta.revision_id;
  const update = () => recordRunRevision(f.root, { runId: f.runId, revisionId });
  writeFileSync(path, stale(accepted.backlog));
  const fixed = update(); assert.equal(fixed.backlog, "updated"); assert.equal(fixed.run_state, "unchanged");
  assert.equal(bytes(f).run, accepted.run); assert.equal(bytes(f).backlog, accepted.backlog);
  assert.equal(update().outcome, "unchanged"); pass("backlog-only repair preserves exact sealed Run bytes and is idempotent");

  writeFileSync(path, stale(accepted.backlog.replace(`| ${f.runId} |`, `| \`${f.runId}\` |`)));
  assert.equal(update().backlog, "updated"); assert.match(row(f), /Awaiting Brownfield Review/);
  assert.equal(bytes(f).backlog.split("\n").filter(line => line.includes(`| \`${f.runId}\` |`)).length, 1);
  pass("backtick key is matched once, title and links retained");

  const valid = bytes(f).backlog;
  for (const [bad, reason, label] of [
    [valid.replace("| Status |", "| Unexpected |"), "backlog_layout_unsupported", "unsupported header"],
    [valid.replace(row(f), `${row(f)}\n${row(f)}`), "backlog_identity_ambiguous", "duplicate identity"],
  ]) {
    writeFileSync(path, bad); const before = bytes(f), skipped = update();
    assert.equal(skipped.outcome, "unchanged"); assert.equal(skipped.backlog, "skipped"); assert.equal(skipped.backlog_reason, reason);
    assert.deepEqual(bytes(f), before); pass(`${label} is reported as skipped with zero mutation`);
  }
  writeFileSync(path, valid);
  const beforeStale = bytes(f);
  assert.equal(recordRunRevision(f.root, { runId: f.runId, revisionId: f.command.expected_revision_id }).reason, "stale_revision");
  assert.deepEqual(bytes(f), beforeStale); pass("stale caller cannot repair pointer");

  const legacyHeader = "| Prio | Key | Title | Status | UR | Brownfield Review | PRD | SD | TP | QA | OR | Current spec | Notes |";
  const legacyRow = `| P1 | ${f.runId} | Command test | Awaiting SD | [UR](artefacts/${f.runId}/UR.md) | | | | | | | retained spec | stale next |`;
  writeFileSync(path, valid.replace("| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |", legacyHeader)
    .replace(/\|---:?\|---\|---\|---\|---\|---\|---\|/u, "|---|---|---|---|---|---|---|---|---|---|---|---|---|").replace(row(f), legacyRow));
  assert.equal(update().backlog, "updated"); assert.match(row(f), /Awaiting Brownfield Review/);
  assert.ok(row(f).includes("retained spec")); assert.equal(row(f).split("|").length, 15);
  assert.equal(bytes(f).run, accepted.run); writeFileSync(path, valid);
  pass("legacy pointer repair retains its thirteen columns and existing links");

  const foreign = join(f.root, "foreign-backlog.md"); writeFileSync(foreign, valid); unlinkSync(path);
  if (symlinkOrSkip(foreign, path)) {
    const skipped = update(); assert.equal(skipped.outcome, "unchanged"); assert.equal(skipped.backlog_reason, "backlog_path_invalid");
    assert.equal(readFileSync(foreign, "utf8"), valid);
    assert.equal(bytes(f).run, accepted.run); unlinkSync(path);
    pass("symlink Backlog is skipped without changing foreign file or Run");
  }
  writeFileSync(path, valid);

  const foreignRun = join(f.root, "foreign-run.md"); writeFileSync(foreignRun, accepted.run); unlinkSync(f.runPath);
  if (symlinkOrSkip(foreignRun, f.runPath)) {
    assert.equal(update().reason, "run_path_invalid"); assert.equal(readFileSync(foreignRun, "utf8"), accepted.run);
    assert.equal(bytes(f).backlog, valid); unlinkSync(f.runPath);
    pass("symlink Run cannot authorize a Backlog-only repair");
  }
  writeFileSync(f.runPath, accepted.run);

  writeFileSync(path, stale(valid));
  const evidence = recordRunStep(f.root, { runId: f.runId, revisionId, step: "evidence", evidence: "Synthetic check" }, { policy: policyForRunContent });
  assert.equal(evidence.outcome, "recorded"); assert.match(row(f), /Awaiting Brownfield Review/);
  assert.equal(runSealState(f.root, bytes(f).run).status, "valid");
  pass("evidence recording also synchronizes status and next action");
} finally { f.cleanup(); }

{
  const g = commandFixture();
  try {
    const free = "# AGDF Master Backlog\n\nFree-form planning notes without pointer tables.\n";
    writeFileSync(backlogPath(g), free);
    const accepted = executeApprovalCommand(g.root, g.command, dependencies);
    assert.equal(accepted.outcome, "accepted", JSON.stringify(accepted));
    assert.equal(accepted.backlog, "skipped"); assert.equal(accepted.backlog_reason, "backlog_layout_unsupported");
    assert.equal(readFileSync(backlogPath(g), "utf8"), free);
    assert.equal(readApprovalOperations(bytes(g).run).receipts.length, 1);
    assert.equal(runSealState(g.root, bytes(g).run).status, "valid");
    pass("approval is accepted when the Backlog cannot be synchronized and reports why");
  } finally { g.cleanup(); }
}

{
  const g = commandFixture();
  try {
    assert.equal(executeApprovalCommand(g.root, g.command, dependencies).outcome, "accepted");
    const path = backlogPath(g), compact = bytes(g).backlog;
    const legacyHeader = "| Prio | Key | Title | Status | UR | Brownfield Review | PRD | SD | TP | QA | OR | Current spec | Notes |";
    const legacyRow = `| P1 | ${g.runId} | Legacy title | Awaiting SD | [UR](artefacts/${g.runId}/UR.md) | | | | | | | retained spec | stale next |`;
    writeFileSync(path, compact.replace("| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |", legacyHeader)
      .replace(/\|---:?\|---\|---\|---\|---\|---\|---\|/u, "|---|---|---|---|---|---|---|---|---|---|---|---|---|").replace(row(g), legacyRow));
    const revisionId = parseRunState(bytes(g).run).meta.revision_id;
    // route rewrites a compact row (title, links); a legacy row keeps them and follows status only.
    writeFileSync(join(g.root, ".agdf/control/artefacts", g.runId, "BROWNFIELD_REVIEW.md"), "# Brownfield Review\n\nSynthetic legacy review.\n");
    const step = recordRunStep(g.root, { runId: g.runId, revisionId, step: "route", route: "quick_task",
      reason: "isolated legacy fixture", evidence: "test" }, { policy: policyForRunContent });
    assert.equal(step.outcome, "recorded", JSON.stringify(step)); assert.equal(step.backlog_reason, "backlog_layout_legacy");
    assert.equal(row(g).split("|").length, 15); assert.ok(row(g).includes("Legacy title")); assert.ok(row(g).includes("retained spec"));
    assert.match(row(g), /\| In Progress \|/u); assert.ok(row(g).includes(step.next_allowed_action));
    pass("run-step keeps a legacy row's title and links, updates its status and reports the layout");
  } finally { g.cleanup(); }
}

console.log(`${checks} Backlog writer scenarios passed.`);
