import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, symlinkSync, unlinkSync, readlinkSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { randomUUID, createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { createPrdDefinitionTestRun, syntheticPrd } from "./fixtures/prd-definition.js";

const temporary = mkdtempSync(join(tmpdir(), "agdf-prd-definition-"));
try {
  const generated = resolve(import.meta.dirname, "../generated");
  for (const entry of ["plugins/agdf", ".agents/plugins/marketplace.json"]) cpSync(join(generated, entry), join(temporary, entry), { recursive: true });
  const plugin = join(temporary, "plugins/agdf"), validator = join(plugin, "runtime/agdf-local.js");
  const root = join(temporary, "project"); mkdirSync(root);
  execFileSync("git", ["init", "-q", root]);
  execFileSync(process.execPath, [resolve(import.meta.dirname, "../bin/create-agdf.js"), "init", "--dir", root, "--language", "en"]);
  const env = { ...process.env, PLUGIN_ROOT: plugin, AGDF_SURFACE: "codex" }; delete env.AGDF_RUN_ID;
  const f = createPrdDefinitionTestRun(root, validator, "prd-authoring-test", env);
  const controlBytes = () => {
    const hash = createHash("sha256"), directory = join(root, ".agdf/control");
    const scan = (folder) => {
      for (const entry of readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const path = join(folder, entry.name);
        hash.update(path.slice(directory.length)).update(entry.isDirectory() ? "directory" : entry.isSymbolicLink() ? "symlink" : "file");
        if (entry.isDirectory()) scan(path);
        else if (entry.isFile()) hash.update(readFileSync(path));
        else if (entry.isSymbolicLink()) hash.update(readlinkSync(path));
      }
    };
    scan(directory); return hash.digest("hex");
  };
  const dispatch = (skill = "gate-check", ...args) => {
    const before = controlBytes();
    const r = spawnSync(process.execPath, [validator, "skill-dispatch", "--json", "--skill", skill, "--surface", "codex",
      "--language", "de", "--working-directory", root, "--target-source", "explicit_target", "--primary-target", root, ...args], { env, encoding: "utf8" });
    const value = JSON.parse(r.stdout);
    const after = controlBytes();
    assert.equal(after, before, "every tested dispatch preserves local and foreign control bytes");
    f.log.push({ command: "skill-dispatch", skill, args, code: r.status, value, control_before: before, control_after: after });
    return value;
  };
  const bound = (...args) => dispatch("gate-check", "--run", f.runId, ...args);
  const revise = (rev = f.revision()) => bound("--intake", "--intake-mode", "resume", "--revision", rev, "--prd-action", "revise");
  const protectedState = () => {
    const digest = createHash("sha256").update(readFileSync(f.state)).update(readFileSync(f.file("UR.md"))).digest("hex");
    f.log.push({ command: "protected run/UR byte digest", digest });
    return digest;
  };
  const initial = bound("--continue-delivery");
  assert.equal(initial.continuation?.phase, "prd_definition", JSON.stringify(initial));
  assert.equal(initial.continuation.draft_registered, false);
  assert.equal(initial.continuation.artifact_language, "en");
  assert.equal(initial.continuation.presentation_language, "de");
  assert.equal(initial.continuation.approval_summary_required, true);
  assert.equal(initial.continuation.approval_summary_heading, "AGDF Approval Summary (de; source=en)");
  assert.equal(initial.continuation.sources[0].type, "UR");
  assert.match(initial.continuation.sources[0].digest, /^sha256:[a-f0-9]{64}$/u);
  assert.deepEqual(initial.continuation.runtime_contracts.map(c => c.module), ["prd-definition", "gate-artifact-preparation"]);
  const before = protectedState();
  env.AGDF_RUN_ID = f.runId;
  assert.equal(dispatch("prd-definition").continuation.phase, "resolve_delivery_run"); delete env.AGDF_RUN_ID;
  assert.equal(protectedState(), before);
  const valid = ["--intake", "--intake-mode", "resume", "--revision", f.revision(), "--prd-action", "revise"];
  for (const args of [["--prd-action", "revise"], [...valid, "--ur-action", "revise"], [...valid, "--continue-delivery"],
    ["--intake", "--intake-mode", "resume", "--prd-action", "revise"], ["--intake", "--intake-mode", "new", "--revision", f.revision(), "--prd-action", "revise"],
    [...valid.slice(0, -1), "approve"]]) assert.equal(bound(...args).outcome, "invalid_input", args.join(" "));
  assert.equal(dispatch("code-review", "--run", f.runId, ...valid).outcome, "invalid_input");
  assert.equal(protectedState(), before);
  assert.equal(revise(randomUUID()).continuation.reason, "stale_assignment");

  const reviewBytes = readFileSync(f.file("BROWNFIELD_REVIEW.md"));
  unlinkSync(f.file("BROWNFIELD_REVIEW.md"));
  assert.equal(bound("--continue-delivery").terminal, true, "missing review input cannot permit authoring");
  writeFileSync(f.file("BROWNFIELD_REVIEW.md"), reviewBytes);
  writeFileSync(f.file("BROWNFIELD_REVIEW.md"), reviewBytes.toString().replace("required: no", "required: yes"));
  assert.equal(f.run("run-update", "--revision", f.revision()).value.outcome, "updated");
  const blockedUx = bound("--continue-delivery");
  assert.equal(blockedUx.terminal, false);
  assert.equal(blockedUx.continuation.skill_id, "ux-intent-definition");
  assert.equal(blockedUx.continuation.phase, "source_analysis_reassessment");
  assert.equal(blockedUx.diagnostics[0].code, "ux_source_missing");
  assert.match(blockedUx.continuation.instruction, /UX_INTENT_DEFINITION.md/);
  assert.match(blockedUx.continuation.instruction, /decision: ready/);
  assert.equal(dispatch("gate-check", "--run", f.runId).terminal, true, "explicit status never prepares UX");
  writeFileSync(f.file("UX_INTENT_DEFINITION.md"), "# UX intent\nDecision: ready\n");
  const malformed = bound("--continue-delivery");
  assert.equal(malformed.continuation.skill_id, "ux-intent-definition");
  assert.equal(malformed.diagnostics[0].code, "ux_decision_malformed");
  assert.match(malformed.continuation.instruction, /exact field absent/);
  assert.match(malformed.continuation.instruction, /unchanged failure stops/);
  assert.equal(bound("--continue-delivery").diagnostics[0].code, "ux_decision_malformed", "unchanged condition grants no new kind of work");
  writeFileSync(f.file("UX_INTENT_DEFINITION.md"), "- decision: ready\n- decision: blocked\n");
  assert.equal(bound("--continue-delivery").diagnostics[0].code, "ux_decision_malformed");
  writeFileSync(f.file("UX_INTENT_DEFINITION.md"), "# UX intent\n- decision: blocked\n");
  assert.equal(bound("--continue-delivery").terminal, true);
  const stoppedUx = bound("--continue-delivery");
  assert.match(stoppedUx.host_action.text, /blocked/);
  assert.doesNotMatch(stoppedUx.host_action.text, /Ich arbeite weiter/);
  if (process.platform !== "win32") {
    unlinkSync(f.file("UX_INTENT_DEFINITION.md"));
    const outsideUx = join(temporary, "outside-ux.md");
    writeFileSync(outsideUx, "- decision: ready\n");
    symlinkSync(outsideUx, f.file("UX_INTENT_DEFINITION.md"));
    const unsafe = bound("--continue-delivery");
    assert.equal(unsafe.terminal, true);
    assert.match(unsafe.host_action.text, /unsicheren Pfad/);
    assert.equal(readFileSync(outsideUx, "utf8"), "- decision: ready\n");
    unlinkSync(f.file("UX_INTENT_DEFINITION.md"));
  }
  writeFileSync(f.file("UX_INTENT_DEFINITION.md"), "# UX intent\n- decision: ready\n");
  assert.equal(bound("--continue-delivery").diagnostics[0].code, "ux_source_unrecorded", "ready bytes alone do not replace canonical analytical recording");
  const uxState = readFileSync(f.state, "utf8");
  writeFileSync(f.state, uxState.replace("| Brownfield Review |", `| UX Intent Definition | ${f.prefix}UX_INTENT_DEFINITION.md | done | prepared in the same chain |\n| Brownfield Review |`));
  const uxRevision = f.revision();
  assert.equal(f.run("run-update", "--revision", uxRevision).value.outcome, "updated");
  assert.notEqual(f.revision(), uxRevision);
  assert.equal(bound("--continue-delivery").continuation.sources[2].type, "UX Intent Definition");
  writeFileSync(f.file("BROWNFIELD_REVIEW.md"), reviewBytes);
  assert.equal(f.run("run-update", "--revision", f.revision()).value.outcome, "updated");
  const urBytes = readFileSync(f.file("UR.md"));
  writeFileSync(f.file("UR.md"), urBytes.toString() + "\nUnknown approved-source change.\n");
  assert.equal(bound("--continue-delivery").terminal, true);
  writeFileSync(f.file("UR.md"), urBytes);
  if (process.platform !== "win32") {
    const outside = join(temporary, "outside.md"); writeFileSync(outside, "outside");
    symlinkSync(outside, f.file("PRD.md"));
    assert.equal(bound("--continue-delivery").terminal, true);
    assert.equal(readFileSync(outside, "utf8"), "outside"); unlinkSync(f.file("PRD.md"));
  }
  assert.equal(bound("--intake", "--intake-mode", "resume", "--revision", f.revision(), "--ur-action", "revise").terminal, true,
    "declined UR revision must not create a PRD assignment");
  const foreignId = "foreign-ur";
  assert.equal(f.call("run-create", "--run", foreignId).code, 0);
  const foreignState = join(root, `.agdf/control/runs/${foreignId}/RUN_STATE.md`);
  const foreignRevision = readFileSync(foreignState, "utf8").match(/^- revision_id: (.+)$/mu)[1];
  const foreignBefore = readFileSync(foreignState, "utf8");
  const foreignPrd = dispatch("gate-check", "--run", foreignId, "--intake", "--intake-mode", "resume",
    "--revision", foreignRevision, "--prd-action", "revise");
  assert.equal(foreignPrd.terminal, true, "declined PRD revision must not create a UR assignment");
  assert.equal(dispatch("prd-definition", "--run", foreignId).terminal, true);
  assert.equal(readFileSync(foreignState, "utf8"), foreignBefore);
  writeFileSync(f.file("PRD.md"), syntheticPrd(true));
  const { recordRunStep } = await import(pathToFileURL(join(plugin, "runtime/create-agdf/runtime/core/lib/control-state/run-steps.js")));
  const { policyForRunContent } = await import(pathToFileURL(join(plugin, "runtime/create-agdf/runtime/core/lib/control-evaluation/run-step-policy.js")));
  const interruptedInput = f.recording();
  const interruptedRevision = f.revision();
  const interrupted = recordRunStep(root, { runId: f.runId, revisionId: interruptedRevision,
    step: "artefact", gate: "PRD", evidence: interruptedInput.path }, {
    policy: policyForRunContent,
    afterWrite(stage) { if (stage === "run") throw new Error("Synthetic interruption after committed PRD registration"); },
  });
  assert.equal(interrupted.reason, "run_step_recovery_required");
  f.log.push({ command: "built recordRunStep with existing transaction fault injection", value: interrupted });
  assert.notEqual(f.revision(), interruptedRevision);
  const committed = readFileSync(f.state, "utf8");
  assert.equal(f.run("run-step", "--revision", f.revision(), "--step", "artefact", "--gate", "PRD",
    "--evidence", interruptedInput.path).value.outcome, "recovered");
  assert.equal(readFileSync(f.state, "utf8"), committed, "recovery keeps the committed PRD receipt exactly once");
  assert.equal(bound("--continue-delivery").continuation.phase, "prd_definition");
  assert.equal(bound("--continue-delivery").control.blocking_reason, "AGDF_PRD_DECISIONS_OPEN");
  assert.notEqual(f.present().value?.outcome, "prepared");
  const old = f.revision();
  writeFileSync(f.file("PRD.md"), syntheticPrd());
  assert.equal(f.record(true).value?.outcome, "recorded");
  assert.notEqual(f.revision(), old);
  const stateAfter = readFileSync(f.state, "utf8");
  assert.equal((stateAfter.match(/\| sha256:[a-f0-9]{64} \| ey/g) ?? []).length, 2, "old binding receipt retained");
  // Even a ready registered PRD cannot present approval before required analytical recording.
  const readyReview = readFileSync(f.file("BROWNFIELD_REVIEW.md"), "utf8");
  writeFileSync(f.file("BROWNFIELD_REVIEW.md"), readyReview.replace("required: no", "required: yes"));
  const readyState = readFileSync(f.state,"utf8");
  writeFileSync(f.state, readyState.replace(/^\| UX Intent Definition \|.*\n/mu, ""));
  assert.equal(f.run("run-update", "--revision", f.revision()).value.outcome, "updated");
  const readyWithoutAnalysis = bound("--continue-delivery");
  assert.equal(readyWithoutAnalysis.continuation.skill_id, "ux-intent-definition", JSON.stringify(readyWithoutAnalysis));
  assert.notEqual(f.present("PRD", "de").value.outcome, "prepared", "readiness and authoring share source facts");
  writeFileSync(f.file("BROWNFIELD_REVIEW.md"), readyReview);
  assert.equal(f.run("run-update", "--revision", f.revision()).value.outcome, "updated");
  assert.equal(bound("--continue-delivery").continuation.phase, "presentation_required");
  assert.equal(revise().continuation.draft_registered, true);
  assert.equal(dispatch("prd-definition", "--run", f.runId).continuation.phase, "prd_definition");
  const en = f.present(), de = f.present("PRD", "de");
  assert.equal(en.value.outcome, "prepared"); assert.equal(de.value.outcome, "prepared");
  assert.match(de.value.text, /AC-001/);
  assert.notEqual(f.approve("PRD", de.value.presentation_id, f.revision(), "ok").value?.outcome, "approved");
  const oldRev = f.revision();
  writeFileSync(f.file("PRD.md"), syntheticPrd().replace("Synthetic saved filter", "Revised synthetic saved filter"));
  assert.equal(f.record(true).value.outcome, "recorded");
  assert.notEqual(f.approve("PRD", de.value.presentation_id, oldRev).value?.outcome, "approved");
  assert.notEqual(f.approve("PRD", de.value.presentation_id).value?.outcome, "approved");
  for (const mutate of [c => { c.target_id = "sha256:" + "0".repeat(64); }, c => { c.run_id = "foreign"; },
    c => { c.expected_revision_id = randomUUID(); }, c => { c.destination.path = "../outside.md"; },
    c => { c.source.path = `.agdf/control/artefacts/${foreignId}/UR.md`; },
    c => { c.source.digest = "sha256:" + "0".repeat(64); }]) {
    const snap = protectedState(); assert.equal(f.record(true, mutate).value?.outcome, "rejected"); assert.equal(protectedState(), snap);
  }
  const original = readFileSync(f.file("PRD.md"), "utf8");
  const invalidSummaries = [
    text => text.replace("- AC-001:", "- AC-999:"),
    text => text + "- AC-001: Doppelte Zusammenfassung.\n",
    text => text.replace(/^- AC-001:.*\n/mu, ""),
    text => text.replace(/^- Ziel:.*\n/mu, ""),
    text => text.replace(/^- Umfang:.*\n/mu, ""),
    text => text.replace(/^- Entscheidungen:.*\n/mu, ""),
    text => text.replace("- Ziel:", "- Ziel: " + "x".repeat(3000)),
    text => text.replace("(de; source=en)", "(xx; source=en)"),
    text => text.replace("- Ziel:", "- Ziel und Umfang:").replace("- Entscheidungen:", "- Entscheidungskontext:"),
  ];
  for (const mutate of invalidSummaries) {
    writeFileSync(f.file("PRD.md"), mutate(original));
    assert.equal(f.record(true).value.outcome, "recorded");
    const repair = bound("--continue-delivery");
    assert.equal(repair.terminal, false, "an own invalid summary remains a permitted authoring correction");
    assert.equal(repair.continuation.phase, "prd_definition");
    assert.equal(repair.continuation.draft_registered, true);
    assert.equal(repair.control.blocking_reason, "AGDF_PRD_DECISIONS_OPEN");
    assert.match(repair.continuation.instruction, /approval_summary_/);
    assert.match(repair.continuation.instruction, /one condition-specific correction/);
    assert.match(repair.continuation.instruction, /unchanged failed correction stops/);
    const status = bound();
    assert.equal(status.terminal, true, "status must not start summary correction");
    assert.equal(status.continuation, null);
    assert.match(status.host_action.text, /approval_summary_/);
    assert.notEqual(f.present("PRD", "de").value?.outcome, "prepared", "invalid localized summary cannot be presented");
  }
  // Reproduce the actual native combined-label mistake; then complete one typed correction chain.
  const summaryBroken = original.replace("- Ziel:", "- Ziel und Umfang:").replace("- Entscheidungen:", "- Entscheidungskontext:");
  writeFileSync(f.file("PRD.md"), summaryBroken); assert.equal(f.record(true).value.outcome, "recorded");
  const ownSummary = bound("--continue-delivery");
  assert.match(ownSummary.continuation.instruction, /approval_summary_user_goal_missing/);
  assert.match(ownSummary.continuation.instruction, /- Ziel:/);
  const failingRevision = f.revision();
  const unchangedSummary = bound("--continue-delivery");
  assert.equal(f.revision(), failingRevision, "reinspection performs no implicit correction or progress recording");
  assert.equal(unchangedSummary.continuation.phase, "prd_definition");
  assert.match(unchangedSummary.continuation.instruction, /unchanged failed correction stops/);
  writeFileSync(f.file("PRD.md"), summaryBroken.replace("- Ziel und Umfang:", "- Ziel:"));
  assert.equal(f.record(true).value.outcome, "recorded");
  assert.match(bound("--continue-delivery").continuation.instruction, /approval_summary_decisions_missing/);
  assert.match(bound("--continue-delivery").continuation.instruction, /- Entscheidungen:/);
  writeFileSync(f.file("PRD.md"), original); assert.equal(f.record(true).value.outcome, "recorded");
  assert.equal(bound("--continue-delivery").continuation.phase, "presentation_required", "validated canonical replacement reaches the next real decision without explicit revise intake");
  const fresh = f.present(); assert.equal(f.approve("PRD", fresh.value.presentation_id).value.outcome, "approved");
  const approved = protectedState();
  assert.equal(dispatch("prd-definition", "--run", f.runId).terminal, true);
  assert.equal(revise().terminal, true);
  assert.equal(f.record(true).value.outcome, "rejected"); assert.equal(protectedState(), approved);
  assert.equal(bound("--continue-delivery").continuation.phase, "sd_definition", "approved PRD delegates to SD authoring");
  if (process.env.AGDF_PRD_TEST_LOG) writeFileSync(process.env.AGDF_PRD_TEST_LOG, JSON.stringify({ lane: "synthetic deterministic packaged-runtime test", log: f.log }, null, 2));
  console.log("PRD packaged authoring/clarification/revision/binding/presentation/approval boundaries passed.");
} finally { rmSync(temporary, { recursive: true, force: true }); }
