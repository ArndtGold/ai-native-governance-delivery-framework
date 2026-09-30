import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initializeCanonicalControl } from "../lib/scaffold/canonical-init.js";
import { generatedFilesForTarget } from "../lib/scaffold/plan.js";
import { createRun } from "../lib/control-state/run-state-repository.js";
import { sealRunState } from "../lib/control-state/run-seal.js";
import { recordRunStep } from "../lib/control-state/run-steps.js";
import { recordRunRevision } from "../lib/control-state/run-recording.js";
import { policyForRunContent } from "../lib/control-evaluation/run-step-policy.js";
import { evaluateGateCheck } from "../lib/control-evaluation/gate-check.js";
import { createSkillDispatchService } from "../lib/skill-dispatch/service.js";
import { interactionLocales, pluginDefinition } from "../lib/cli/runtime-context.js";

const root = realpathSync(mkdtempSync(join(tmpdir(), "agdf-run-assignment-")));
const originalEnvRun = process.env.AGDF_RUN_ID;
delete process.env.AGDF_RUN_ID;
const hash = (content) => createHash("sha256").update(content).digest("hex");
const snapshot = (dir = join(root, ".agdf")) => readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
  .flatMap((entry) => entry.isDirectory() ? snapshot(join(dir, entry.name)) : [[join(dir, entry.name), hash(readFileSync(join(dir, entry.name)))]]);
const statePath = (id) => join(root, `.agdf/control/runs/${id}/RUN_STATE.md`);
const revision = (id) => readFileSync(statePath(id), "utf8").match(/^- revision_id: (.+)$/mu)[1];
let gateCalls = 0;
const service = createSkillDispatchService({
  env: {},
  evaluateGateCheck: (target, selection) => { gateCalls += 1; return evaluateGateCheck(target, selection); },
});
const base = { skillSet: pluginDefinition.skillSet, interactionLocales, expectedVersion: pluginDefinition.version,
  skillId: "gate-check", surface: "codex", presentationLanguage: "en", workingDirectory: root,
  targetSource: "explicit_target", primaryTarget: root };
const dispatch = (fields = {}) => service({ ...base, intake: true, ...fields });
const assignment = () => {
  const before = snapshot();
  const calls = gateCalls;
  const result = dispatch();
  assert.equal(result.outcome, "intake_continuation", JSON.stringify(result));
  assert.equal(result.continuation.phase, "resolve_delivery_run");
  assert.equal(result.control, null, "unbound intake cannot imply a selected gate");
  assert.equal(result.terminal, false);
  assert.equal(result.authorizes, false);
  assert.equal(result.host_action.source, "continuation");
  assert.equal(gateCalls, calls, "unbound intake never evaluates a candidate's gate");
  assert.deepEqual(snapshot(), before, "assignment only observes canonical state");
  return result.continuation.candidate_runs;
};
try {
  assert.equal(spawnSync("git", ["init", "-q", root]).status, 0);
  initializeCanonicalControl(root, generatedFilesForTarget("init", root, false, {
    artifact_language: "en", chat_language: "en", runtime_language: "en",
  }));
  assert.deepEqual(assignment(), [], "no active run returns assignment, not a setup question or executable placeholders");
  createRun(root, "unrelated");
  assert.deepEqual(assignment().map((run) => run.run_id), ["unrelated"], "a single run is not a scope match");
  const legacyTime = new Date("2020-01-01T00:00:00.000Z");
  const legacy = readFileSync(statePath("unrelated"), "utf8").replace(/^- updated_at:.*$/mu, "- updated_at:");
  writeFileSync(statePath("unrelated"), sealRunState(root, legacy));
  utimesSync(statePath("unrelated"), legacyTime, legacyTime);
  assert.equal(assignment()[0].last_updated_at, legacyTime.toISOString(), "legacy empty timestamps use the reader's filesystem fallback");
  writeFileSync(statePath("unrelated"), sealRunState(root, legacy.replace(/^- updated_at:.*\n/mu, "")));
  utimesSync(statePath("unrelated"), legacyTime, legacyTime);
  assert.equal(assignment()[0].last_updated_at, legacyTime.toISOString(), "legacy absent timestamps also remain selectable");
  createRun(root, "requested");
  assert.equal(assignment()[0].run_id, "requested", "recency orders evidence but does not bind scope");
  assert.equal(assignment().length, 2, "multiple runs remain agent evidence, not a technical selection card");
  const urPath = ".agdf/control/artefacts/requested/UR.md";
  mkdirSync(join(root, ".agdf/control/artefacts/requested"), { recursive: true });
  writeFileSync(join(root, urPath), "# UR: Requested outcome\n\n## Problem\nThe requested outcome is unavailable.\n\n## Goal\nMake the requested outcome observable.\n\n## Scope\nImplement only this bounded outcome.\n\n## Non-Goals\nOther independent work is excluded.\n\n## Acceptance Signals\nThe stated result is observable.\n\n## Risks And Unknowns\nNo additional product decisions are pending.\n");
  const recorded = recordRunStep(root, { runId: "requested", revisionId: revision("requested"), step: "ur", title: "Requested outcome" }, { policy: policyForRunContent });
  assert.equal(recorded.outcome, "recorded", JSON.stringify(recorded));
  const candidate = assignment().find((run) => run.run_id === "requested");
  assert.equal(candidate.ur_path, urPath);
  assert.match(candidate.ur_digest, /^sha256:[0-9a-f]{64}$/u);
  assert.equal(candidate.revision_id, revision("requested"));
  assert.match(candidate.content_seal, /^sha256:[0-9a-f]{64}$/u);

  // Simulate the agent's same-scope choice; matching itself remains an agent judgement.
  process.env.AGDF_RUN_ID = "unrelated";
  let before = snapshot();
  const matched = dispatch({ runId: "requested", intakeMode: "resume", expectedRevisionId: candidate.revision_id });
  assert.equal(matched.continuation?.phase, "presentation_required", JSON.stringify(matched));
  assert.equal(matched.control.run_id, "requested", "ambient run environment cannot hijack intake");
  assert.equal(matched.control.current_gate, "UR");
  assert.deepEqual(snapshot(), before, "gate preview neither records approval nor prepares a binding");

  const fresh = dispatch({ runId: "independent", intakeMode: "new" });
  assert.equal(fresh.continuation.phase, "run_missing", JSON.stringify(fresh));
  assert.deepEqual(fresh.continuation.steps.map((step) => step.id), ["create_run", "dispatch_again"]);
  assert.deepEqual(fresh.continuation.steps[0].argv, ["run-create", "--dir", root, "--run", "independent"]);
  assert.doesNotMatch(JSON.stringify(fresh.continuation), /<run_id>|<revision_id/);
  assert.deepEqual(snapshot(), before, "new-scope dispatch plans concrete bookkeeping only");

  writeFileSync(join(root, urPath), `${readFileSync(join(root, urPath), "utf8")}\nRecorded scope clarification.\n`);
  assert.equal(recordRunRevision(root, { runId: "requested", revisionId: candidate.revision_id }).outcome, "updated");
  const calls = gateCalls;
  before = snapshot();
  const stale = dispatch({ runId: "requested", intakeMode: "resume", expectedRevisionId: candidate.revision_id });
  assert.equal(stale.continuation.phase, "resolve_delivery_run");
  assert.equal(stale.continuation.reason, "stale_assignment");
  assert.equal(stale.continuation.candidate_runs.find((run) => run.run_id === "requested").revision_id, revision("requested"));
  assert.equal(gateCalls, calls, "stale assignment cannot reach gate evaluation");
  assert.deepEqual(snapshot(), before);

  const currentRevision = revision("requested");
  const raceService = createSkillDispatchService({ env: {}, evaluateGateCheck: (target, selection) => {
    writeFileSync(join(root, urPath), `${readFileSync(join(root, urPath), "utf8")}\nConcurrent recorded scope clarification.\n`);
    assert.equal(recordRunRevision(root, { runId: "requested", revisionId: currentRevision }).outcome, "updated");
    return evaluateGateCheck(target, selection);
  } });
  const raced = raceService({ ...base, intake: true, intakeMode: "resume", runId: "requested", expectedRevisionId: currentRevision });
  assert.equal(raced.continuation.phase, "resolve_delivery_run", "a revision change during evaluation also discards the gate result");
  assert.equal(raced.presentation, null);

  const originalUr = readFileSync(join(root, urPath));
  writeFileSync(join(root, urPath), `${originalUr}\nUnrecorded scope extension.\n`);
  before = snapshot();
  for (const presentationLanguage of ["en", "de"]) {
    const broken = dispatch({ presentationLanguage });
    assert.equal(broken.terminal, true);
    assert.equal(broken.continuation, null, "unreadable or unsealed inventory cannot imply no match");
    assert.equal(broken.diagnostics[0].code, "AGDF_RUN_ASSIGNMENT_INVENTORY_INVALID");
    assert.match(broken.host_action.text, /AGDF_RUN_ASSIGNMENT_SEAL_INVALID/);
    assert.deepEqual(snapshot(), before);
  }
  writeFileSync(join(root, urPath), originalUr);
  const originalState = readFileSync(statePath("requested"), "utf8");
  const urRow = originalState.split("## Artefacts\n")[1].split("\n").find(line => /^\| UR \|/u.test(line));
  assert.ok(urRow);
  const missingScope = originalState.replace(urRow, urRow.replace(urPath, "")).replace(/^- current_gate: UR$/mu, "- current_gate: TP");
  writeFileSync(statePath("requested"), sealRunState(root, missingScope));
  const unavailable = dispatch();
  assert.equal(unavailable.continuation, null, "an advanced run without its UR cannot establish no scope match");
  assert.match(unavailable.host_action.text, /AGDF_RUN_ASSIGNMENT_UR_UNAVAILABLE/u);
  writeFileSync(statePath("requested"), originalState.replace(urRow, `${urRow}\n${urRow}`));
  const duplicate = dispatch();
  assert.equal(duplicate.diagnostics[0].code, "AGDF_RUN_ASSIGNMENT_INVENTORY_INVALID");
  assert.match(duplicate.host_action.text, /AGDF_ARTEFACT_ROW_DUPLICATE/u);
  assert.equal(duplicate.continuation, null);
  writeFileSync(statePath("requested"), originalState);
  const inaccessible = createSkillDispatchService({ env: {}, readDeliveryRunInventory: () => { throw Object.assign(new Error("denied"), { code: "EACCES" }); } })({ ...base, intake: true });
  assert.equal(inaccessible.outcome, "evaluator_error");
  assert.equal(inaccessible.continuation, null);

  delete process.env.AGDF_RUN_ID;
  for (const [presentationLanguage, heading] of [["en", "Choose the delivery run"], ["de", "Liefer-Run auswählen"]]) {
    const status = dispatch({ intake: false, presentationLanguage });
    assert.equal(status.terminal, true);
    assert.ok(status.host_action.text.includes(heading), "ambiguous error suffix must reach the localized status-selection card");
    assert.doesNotMatch(status.host_action.text, /Approval: UR/);
  }
  console.log("Delivery run assignment: zero/one/multiple runs, UR references, explicit scope binding, new scope, stale and racing revisions, ambient selector, integrity and EN/DE status passed.");
} finally {
  if (originalEnvRun === undefined) delete process.env.AGDF_RUN_ID;
  else process.env.AGDF_RUN_ID = originalEnvRun;
  rmSync(root, { recursive: true, force: true });
}
