import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { artefactFileDigest, approvalSeal, runSealState, sealRunState } from "../lib/control-state/run-seal.js";
import { canonicalJson, digest, resolveControlCommandTarget } from "../lib/control-state/approval-command-contract.js";
import { appendArtefactBinding, readArtefactBindings } from "../lib/control-state/artefact-bindings.js";
import { recordRunStep } from "../lib/control-state/run-steps.js";
import { policyForRunContent } from "../lib/control-evaluation/run-step-policy.js";
import { evaluateGateCheck } from "../lib/control-evaluation/gate-check.js";
import { evaluateDoctor } from "../lib/control-evaluation/doctor.js";
import { analyzeDeliveryMap } from "../lib/control-evaluation/delivery-map.js";
import { parseControlState, parseRunState } from "../lib/control-state/run-state-parser.js";
import { prepareRunPresentation } from "../lib/control-state/run-presentation.js";
import { approveRunGate, recordRunRevision } from "../lib/control-state/run-recording.js";
import { correctRunRelationship } from "../lib/control-state/run-relationship-correction.js";
import { createSkillDispatchService } from "../lib/skill-dispatch/service.js";
import { createCoreServices } from "../lib/index.js";
import { relationshipForGate } from "../lib/control-evaluation/delivery-relationships.js";
import { decodeBacklogMarker } from "../lib/control-state/backlog-summary.js";
import { interactionLocales, pluginDefinition } from "../../cli/lib/runtime/control-context.js";

const temporary = mkdtempSync(join(tmpdir(), "agdf-artefact-recording-"));
const seed = join(temporary, "seed"), runId = "typed-artefact", gates = ["UR", "PRD", "SD", "TP", "QA", "UAT"];
const cli = resolve(import.meta.dirname, "../../cli/bin/create-agdf.js");
mkdirSync(seed);
execFileSync(process.execPath, [cli, "init", "--dir", seed, "--language", "en"], { stdio: "pipe" });
let serial = 0, assertions = 0;
function fixture(gate = "SD") {
  const root = join(temporary, `case-${serial++}`);
  cpSync(seed, root, { recursive: true });
  rmSync(join(root, ".agdf/control/AGDF_RUN.md"), { force: true });
  writeFileSync(join(root, ".agdf/control/CONTEXT_GRAPH.md"), "# Context Graph\n\nNo durable graph update is claimed in synthetic tests.\n");
  writeFileSync(join(root, ".agdf/control/MASTER_BACKLOG.md"), `# Backlog\n\n## Active Backlog\n\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 1 | ${runId} | Synthetic recording | In Progress | [UR](artefacts/${runId}/UR.md) | [UR](artefacts/${runId}/UR.md) | Record current artefact |\n\n## Completed / Superseded Pointers\n\n| Key | Item | Status | Record | Outcome |\n|---|---|---|---|---|\n`);
  const prefix = `.agdf/control/artefacts/${runId}/`, dir = join(root, prefix), state = join(root, `.agdf/control/runs/${runId}/RUN_STATE.md`);
  mkdirSync(dir, { recursive: true }); mkdirSync(join(root, `.agdf/control/runs/${runId}/presentations`), { recursive: true });
  for (const name of ["UR", "PRD", "SD", "TP", "BROWNFIELD_REVIEW", "BROWNFIELD_ANALYSIS", "CD_TESTS", "CODE_REVIEW", "QA_REPORT"]) {
    writeFileSync(join(dir, `${name}.md`), `# ${name}: Synthetic non-authorizing test\n\n${name === "QA_REPORT" ? "Decision: pass\n" : ""}## Problem\nA defined result needs its evidence.\n\n## Goal\nKeep the approved scope and exact sources.\n\n## Scope\nIsolated fixture only.\n\n## AGDF Approval Summary (de; source=en)\n- Problem: Zuordnung braucht genaue Belege.\n- Ziel: Die Zuordnung zuverlässig erfassen.\n- Umfang: Nur isolierter Test.\n`);
  }
  const approvals = gates.map((g, i) => {
    if (i >= gates.indexOf(gate)) return `| ${g} | missing | |`;
    const id = randomUUID(), record = { schema_version: 1, presentation_id: id, run_id: runId, gate: g, revision_id: randomUUID(), artefact_digest: artefactFileDigest(root, `${prefix}${g}.md`) };
    const hash = digest(JSON.stringify(record));
    writeFileSync(join(root, `.agdf/control/runs/${runId}/presentations/${id}.json`), JSON.stringify({ record, digest: hash }));
    return `| ${g} | approved | Approval: ${g}; presentation ${id} ${hash} |`;
  }).join("\n");
  let body = `# AGDF Run State\n\n## Run Meta\n\n- control_state_version: 2\n- run_id: ${runId}\n- lifecycle: active\n- revision: 1\n- revision_id: ${randomUUID()}\n- mode: structured_delivery\n- current_gate: ${gate}\n- decision: in_progress\n- owner: synthetic-test\n\n## Objective\n\nSYNTHETIC NON-AUTHORIZING: atomically record reviewed derivation.\n\n## Current Control State\n\n| Question | Answer |\n|---|---|\n| What is known? | Synthetic recording test |\n| What is approved? | See synthetic rows |\n| What is missing? | Current artefact |\n| What is the next allowed action? | Record current artefact |\n| What is explicitly forbidden right now? | Invent approval |\n\n## Approvals\n\n| Gate | Status | Evidence |\n|---|---|---|\n${approvals}\n\n## Artefacts\n\n| Type | Path | Status | Notes |\n|---|---|---|---|\n`;
  for (const g of gates.slice(0, 5)) body += `| ${g} | ${gates.indexOf(g) < gates.indexOf(gate) ? `${prefix}${g}.md` : ""} | ${gates.indexOf(g) < gates.indexOf(gate) ? "approved" : "missing"} | fixture |\n`;
  for (const [type, file] of [["Brownfield Review", "BROWNFIELD_REVIEW"], ["Brownfield Analysis", "BROWNFIELD_ANALYSIS"], ["CD+Tests", "CD_TESTS"], ["CR", "CODE_REVIEW"]]) body += `| ${type} | ${prefix}${file}.md | ${type === "Brownfield Review" || gate === "QA" ? "done" : "missing"} | fixture |\n`;
  body += `\n## Mode/Slice Decision\n\n- decision: structured_delivery\n- required_next_gate: PRD\n- scope_reason: Synthetic explicit policy fixture\n- evidence: synthetic\n\n## Artefact Chain\n\n| From | Relationship | To | Evidence |\n|---|---|---|---|\n| UR | approved_by | Approval: UR | synthetic exact approval |\n`;
  for (const g of ["PRD", "SD", "TP"]) if (gates.indexOf(g) < gates.indexOf(gate)) { const row = relationshipForGate(g); body += `| ${row.from} | ${row.relationship} | ${row.to} | synthetic reviewed mapping |\n`; }
  body += "\n## Evidence\n\n| Evidence | Source | Covers | Strength |\n|---|---|---|---|\n| Synthetic fixture | isolated test | no live authority | direct |\n\n## Closeout\n\n- next_allowed_action: Draft or refine the current artefact.\n";
  writeFileSync(state, sealRunState(root, body));
  const revision = () => parseRunState(readFileSync(state, "utf8"), runId).meta.revision_id;
  const relation = relationshipForGate(gate), triple = { from: relation.from, relationship: relation.relationship, to: relation.to };
  const command = () => {
    const reviewPath = `${prefix}mapping-${randomUUID()}.json`;
    const value = { schema_version: "1", target_id: resolveControlCommandTarget(root).target_id, run_id: runId, expected_revision_id: revision(),
      destination: { type: relation.from, path: `${prefix}${relation.from}.md`, digest: artefactFileDigest(root, `${prefix}${relation.from}.md`), status: gate === "QA" ? "pass" : "draft" },
      source: { type: relation.to, path: `${prefix}${relation.to}.md`, digest: artefactFileDigest(root, `${prefix}${relation.to}.md`) }, relationship: triple,
      review: { reviewer: "synthetic reviewer", path: reviewPath, digest: "" }, update_draft: false };
    const { schema_version, target_id, run_id, destination, source, relationship } = value;
    writeFileSync(join(root, reviewPath), JSON.stringify({ schema_version, target_id, run_id, relationship, destination, source, reviewer: value.review.reviewer, reviewed: true }));
    value.review.digest = artefactFileDigest(root, reviewPath);
    return value;
  };
  const record = (value = command(), options = {}) => {
    const evidence = `${prefix}recording.json`; writeFileSync(join(root, evidence), JSON.stringify(value));
    return recordRunStep(root, { runId, revisionId: revision(), step: "artefact", gate, evidence }, { policy: policyForRunContent, ...options });
  };
  const edit = fn => writeFileSync(state, sealRunState(root, fn(readFileSync(state, "utf8"))));
  const omit = () => edit(text => text.replace(new RegExp(`^\\| ${relation.from} \\| ${relation.relationship} \\| ${relation.to} \\|[^\\n]*\\n`, "mu"), ""));
  return { root, state, prefix, gate, command, record, revision, edit, omit };
}

try {
  for (const gate of ["PRD", "SD", "TP", "QA"]) {
    const f = fixture(gate), before = readFileSync(f.state, "utf8"), approvals = approvalSeal(before);
    assert.equal(evaluateGateCheck(f.root, { runId }).current_gate, gate);
    const recorded = f.record(); assert.equal(recorded.outcome, "recorded", JSON.stringify(recorded));
    const after = readFileSync(f.state, "utf8"), history = readArtefactBindings(after);
    assert.equal(approvalSeal(after), approvals); assert.equal(history.valid, true); assert.equal(history.receipts.length, 1);
    assert.equal(history.active[0].operation.resulting_revision_id, f.revision()); assert.equal(runSealState(f.root, after).status, "valid");
    assert.equal(evaluateGateCheck(f.root, { runId }).delivery_map.relationships.find(row => row.from === history.active[0].destination.type).status, "pass");
    const backlogPath = join(f.root, '.agdf/control/MASTER_BACKLOG.md');
    const visibleRow = () => readFileSync(backlogPath, 'utf8').split('\n').find(line => line.startsWith(`| 1 | ${runId} |`));
    const firstRow = visibleRow(), firstRevision = f.revision();
    const repeated = f.record(); assert.equal(repeated.outcome, 'recorded');
    assert.notEqual(repeated.revision_id, firstRevision); assert.equal(visibleRow(), firstRow);
    const marker = readFileSync(backlogPath, 'utf8').split('\n').map(decodeBacklogMarker).find(m => m?.record?.run_id === runId);
    assert.equal(marker.record.revision_id, repeated.revision_id, 'same visible row must bind each new typed recording revision');
    assert.equal(repeated.backlog, 'updated');
    f.omit(); const blocked = evaluateGateCheck(f.root, { runId });
    assert.equal(blocked.blocking_reason, "AGDF_DELIVERY_RELATIONSHIP_MISSING", JSON.stringify(blocked.doctor_report?.findings));
    assert.equal(blocked.next_operation, null); assert.equal(blocked.approval_presentation, null);
    assert.equal(prepareRunPresentation(f.root, { runId, gate, revisionId: f.revision() }, { evaluateGateCheck }).outcome, "rejected");
    assert.equal(approveRunGate(f.root, { runId, gate, revisionId: f.revision(), response: `Approval: ${gate}` }, { evaluateGateCheck }).outcome, "rejected");
    const stateBeforeRead = readFileSync(f.state, "utf8");
    evaluateDoctor(f.root, { runId }); evaluateGateCheck(f.root, { runId });
    analyzeDeliveryMap({ ...parseControlState(stateBeforeRead, { userGates: gates }), content: stateBeforeRead });
    assert.equal(readFileSync(f.state, "utf8"), stateBeforeRead);
    const repaired = correctRunRelationship(f.root, { runId, revisionId: f.revision() }, { evaluateGateCheck });
    assert.equal(repaired.outcome, "corrected", JSON.stringify(repaired));
    assert.equal(repaired.backlog, "pending"); assert.equal(repaired.backlog_reason, "run_only_relationship_correction");
    assert.ok(repaired.backlog_next_action.includes(`--run ${runId} --revision ${repaired.revision_id}`));
    assert.equal(approvalSeal(readFileSync(f.state, "utf8")), approvals);
    assert.match(readFileSync(f.state, "utf8"), new RegExp(repaired.revision_id));
    const snapshot = readFileSync(f.state, "utf8");
    assert.equal(correctRunRelationship(f.root, { runId, revisionId: f.revision() }, { evaluateGateCheck }).outcome, "unchanged");
    assert.equal(readFileSync(f.state, "utf8"), snapshot); assertions += 18;
    for (const locale of Object.keys(interactionLocales.locales)) {
      const report = evaluateGateCheck(f.root, { runId, presentationLanguage: locale });
      assert.match(report.status_presentation.markdown, new RegExp(interactionLocales.locales[locale].operationalValues.relationshipCorrected.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"))); assertions++;
    }
  }
  const negatives = {
    unknown: c => { c.extra = true; }, version: c => { c.schema_version = "2"; }, target: c => { c.target_id = digest("foreign"); }, run: c => { c.run_id = "foreign"; }, stale: c => { c.expected_revision_id = randomUUID(); },
    approval_status: c => { c.destination.status = "approved"; }, path_escape: c => { c.destination.path = "../outside.md"; }, source_digest: c => { c.source.digest = digest("wrong"); }, destination_digest: c => { c.destination.digest = digest("wrong"); },
    wrong_relationship: c => { c.relationship.to = "TP"; }, missing_mapping: c => { c.review.path = c.destination.path; }, wrong_reviewer: c => { c.review.reviewer = "other"; }, unsupported_update: c => { c.update_draft = "yes"; },
  };
  for (const [name, change] of Object.entries(negatives)) {
    const f = fixture(), c = f.command(), before = readFileSync(f.state, "utf8"); change(c);
    assert.equal(f.record(c).outcome, "rejected", name); assert.equal(readFileSync(f.state, "utf8"), before, name); assertions += 2;
  }
  const f = fixture(); assert.equal(f.record().outcome, "recorded");
  const original = readFileSync(f.state, "utf8"), history = readArtefactBindings(original), oldReceipt = history.active[0];
  for (const transform of [text => text.replace("- schema_version: 1", "- schema_version: 2"), text => text + "\n## Artefact Bindings\n", text => text.replace(`| ${oldReceipt.binding_id} |`, `| ${randomUUID()} |`)]) {
    assert.equal(readArtefactBindings(transform(original)).valid, false); assertions++;
  }
  assert.throws(() => appendArtefactBinding(original, { ...oldReceipt, binding_id: randomUUID(), operation: { ...oldReceipt.operation, id: randomUUID(), revision: 3, resulting_revision_id: randomUUID() } })); assertions++;
  writeFileSync(join(f.root, `${f.prefix}SD.md`), readFileSync(join(f.root, `${f.prefix}SD.md`), "utf8") + "\nReviewed draft update.\n");
  const update = f.command(); update.update_draft = true;
  assert.equal(f.record(update).outcome, "recorded");
  const updated = readArtefactBindings(readFileSync(f.state, "utf8"));
  assert.equal(updated.receipts.length, 2); assert.equal(updated.active.length, 1); assert.equal(updated.active[0].supersedes, oldReceipt.binding_id); assertions += 4;
  f.omit(); const beforeCorrection = readFileSync(f.state, "utf8");
  for (const [name, action] of [
    ["stale", () => correctRunRelationship(f.root, { runId, revisionId: randomUUID() }, { evaluateGateCheck })],
    ["proof drift", () => { writeFileSync(join(f.root, updated.active[0].review.path), "{}"); return correctRunRelationship(f.root, { runId, revisionId: f.revision() }, { evaluateGateCheck }); }],
  ]) { assert.equal(action().outcome, "rejected", name); assert.equal(readFileSync(f.state, "utf8"), beforeCorrection); assertions += 2; }
  const legacy = fixture(); legacy.edit(text => text.replace(`| SD |  | missing | fixture |`, `| SD | ${legacy.prefix}SD.md | draft | fixture |`));
  const legacyReport = evaluateGateCheck(legacy.root, { runId });
  assert.equal(correctRunRelationship(legacy.root, { runId, revisionId: legacy.revision() }, { evaluateGateCheck }).reason, "binding_proof_missing_or_ambiguous", JSON.stringify({ blocker: legacyReport.blocking_reason, doctor: legacyReport.doctor_report.findings, relationships: legacyReport.delivery_map.relationships })); assertions++;
  const atomic = fixture(), atomicBefore = readFileSync(atomic.state, "utf8");
  assert.throws(() => atomic.record(undefined, { afterWrite: stage => { if (stage === "intent") throw new Error("injected before Run commit"); } }), /injected before Run commit/u);
  assert.equal(readFileSync(atomic.state, "utf8"), atomicBefore); assertions += 2;
  const committed = fixture(), committedBefore = readFileSync(committed.state, "utf8");
  assert.equal(committed.record(undefined, { afterWrite: stage => { if (stage === "run") throw new Error("injected after Run commit"); } }).reason, "run_step_recovery_required");
  assert.notEqual(readFileSync(committed.state, "utf8"), committedBefore);
  assert.equal(readArtefactBindings(readFileSync(committed.state, "utf8")).receipts.length, 1);
  assert.equal(committed.record().outcome, "recovered");
  assert.equal(readArtefactBindings(readFileSync(committed.state, "utf8")).receipts.length, 1); assertions += 5;
  const fault = fixture(); fault.record(); fault.omit(); const faultBefore = readFileSync(fault.state, "utf8");
  assert.throws(() => correctRunRelationship(fault.root, { runId, revisionId: fault.revision() }, { evaluateGateCheck,
    checkpoint: point => { if (point === "before_rename") throw new Error("injected correction precommit"); } }), /injected correction precommit/u);
  assert.equal(readFileSync(fault.state, "utf8"), faultBefore);
  const recoveredCorrection = correctRunRelationship(fault.root, { runId, revisionId: fault.revision() }, { evaluateGateCheck,
    checkpoint: point => { if (point === "after_rename") throw new Error("injected correction postcommit"); } });
  assert.equal(recoveredCorrection.outcome, "corrected"); assert.equal(recoveredCorrection.recovered_commit, true);
  assert.equal(recoveredCorrection.revision_id, fault.revision()); assertions += 5;
  const unconfirmed = fixture(); unconfirmed.record(); unconfirmed.omit();
  const unresolved = correctRunRelationship(unconfirmed.root, { runId, revisionId: unconfirmed.revision() }, { evaluateGateCheck,
    checkpoint: point => { if (point === "after_rename") throw new Error("injected postcommit"); },
    confirmCommit: () => { throw new Error("injected durability confirmation failure"); } });
  assert.equal(unresolved.reason, "correction_commit_unconfirmed"); assert.equal(unresolved.committed, true);
  assert.equal(unresolved.revision_id, unconfirmed.revision()); assertions += 3;
  const conflictingInput = fixture(); conflictingInput.edit(text => text.replace("## Artefact Chain", "## Artefact Chain").replace("| UR | approved_by | Approval: UR | synthetic exact approval |", "| UR | approved_by | Approval: UR | synthetic exact approval |\n| SD | tests | PRD | contradictory row |"));
  const conflictingBefore = readFileSync(conflictingInput.state, "utf8");
  assert.equal(conflictingInput.record().reason, "artefact_binding_proof_invalid");
  assert.equal(readFileSync(conflictingInput.state, "utf8"), conflictingBefore); assertions += 2;
  const conflict = fixture(); conflict.record(); conflict.edit(text => text.replace(/^(\| SD \| derived_from \| PRD \|[^\n]*\n)/mu, "$1$1"));
  for (const locale of Object.keys(interactionLocales.locales)) {
    const report = evaluateGateCheck(conflict.root, { runId, presentationLanguage: locale });
    assert.equal(report.blocking_reason, "AGDF_DELIVERY_RELATIONSHIP_CONFLICT");
    assert.ok(report.status_presentation.markdown.includes(interactionLocales.locales[locale].operationalValues.blockedRelationshipConflict)); assertions += 2;
  }
  for (const [name, alter] of [
    ["missing approval proof", x => rmSync(join(x.root, `.agdf/control/runs/${runId}/presentations`), { recursive: true })],
    ["multiple omissions", x => x.edit(text => text.replace(/^\| PRD \| derived_from \| UR \|[^\n]*\n/mu, ""))],
    ["unrelated blocker", x => writeFileSync(join(x.root, ".agdf/control/MASTER_BACKLOG.md"), readFileSync(join(x.root, ".agdf/control/MASTER_BACKLOG.md"), "utf8").replace(/\[UR\]\([^)]*\)/u, "invalid link"))],
    ["pending transaction", x => writeFileSync(join(x.root, `.agdf/control/runs/${runId}/RUN_STEP_PENDING.json`), "{}")],
    ["changed source", x => { writeFileSync(join(x.root, `${x.prefix}PRD.md`), "Changed approved source\n"); x.edit(text => text); }],
    ["changed destination", x => writeFileSync(join(x.root, `${x.prefix}SD.md`), "Changed destination\n")],
    ["symlink proof", x => { const receipt = readArtefactBindings(readFileSync(x.state, "utf8")).active[0]; const path = join(x.root, receipt.review.path); cpSync(path, `${path}.copy`); rmSync(path);
      // Windows without Developer Mode refuses symlinks; only this tamper case is skipped there.
      try { symlinkSync(`${path}.copy`, path); } catch (error) { if (process.platform !== "win32" || error.code !== "EPERM") throw error; return false; } }],
  ]) {
    const x = fixture(); assert.equal(x.record().outcome, "recorded"); x.omit();
    if (alter(x) === false) { console.warn(`SKIPPED ${name}: symlinks need Windows Developer Mode (EPERM)`); continue; }
    const snapshot = readFileSync(x.state, "utf8");
    assert.equal(correctRunRelationship(x.root, { runId, revisionId: x.revision() }, { evaluateGateCheck }).outcome, "rejected", name);
    assert.equal(readFileSync(x.state, "utf8"), snapshot, name); assertions += 3;
  }
  const direct = fixture(); direct.record(); direct.omit(); let attempts = 0;
  const input = { skillSet: pluginDefinition.skillSet, interactionLocales, expectedVersion: pluginDefinition.version,
    surface: "codex", skillId: "gate-check", presentationLanguage: "de", workingDirectory: direct.root,
    targetSource: "continued_target", primaryTarget: direct.root, runId };
  const targetOrientation = () => ({ schema_version: "1", semantic_block: "task_target_orientation", presentation_language: "de", markdown: "synthetic bound target", authorizes: false });
  const continuationDependencies = { env: {}, renderTaskTargetOrientation: targetOrientation, resolveTaskTarget: () => ({ schema_version: "1", resolution_state: "resolved", reason_code: "continued_target",
    primary_target: direct.root, governance_target: direct.root, working_directory: direct.root, target_changed: false, next_action: "", authorizes: false }),
    correctRunRelationship: (root, values, dependencies) => { attempts++; return correctRunRelationship(root, values, dependencies); } };
  const dispatch = createCoreServices({ observers: continuationDependencies }).dispatch;
  const readOnlyBefore = readFileSync(direct.state, "utf8"), status = dispatch(input);
  assert.equal(status.terminal, true); assert.equal(attempts, 0); assert.equal(readFileSync(direct.state, "utf8"), readOnlyBefore);
  const boundInput = { ...input, continueDelivery: true }, oldRevision = direct.revision();
  const pureRoute = createSkillDispatchService(continuationDependencies)(boundInput);
  assert.equal(pureRoute.control.blocking_reason, "AGDF_DELIVERY_RELATIONSHIP_MISSING");
  assert.equal(attempts, 0); assert.equal(readFileSync(direct.state, "utf8"), readOnlyBefore); assertions += 3;
  for (const invalid of [
    { ...boundInput, skillId: "qa-gate" }, { ...boundInput, intake: true },
    { ...boundInput, expectedRevisionId: randomUUID() }, { ...boundInput, runId: "foreign" },
    { ...input, intake: true, intakeMode: "resume", expectedRevisionId: randomUUID() },
  ]) {
    dispatch(invalid); assert.equal(attempts, 0); assert.equal(readFileSync(direct.state, "utf8"), readOnlyBefore); assertions += 2;
  }
  const unresolvedDispatch = createCoreServices({ observers: { ...continuationDependencies,
    resolveTaskTarget: () => ({ resolution_state: "unresolved", next_action: "Bind a target." }) } }).dispatch;
  assert.equal(unresolvedDispatch(boundInput).outcome, "target_unresolved");
  assert.equal(attempts, 0); assert.equal(readFileSync(direct.state, "utf8"), readOnlyBefore); assertions += 3;
  let refusals = 0;
  const refusedDispatch = createCoreServices({ observers: { ...continuationDependencies,
    correctRunRelationship: () => { refusals++; return { outcome: "rejected", reason: "binding_proof_missing_or_ambiguous" }; } } }).dispatch;
  assert.equal(refusedDispatch(boundInput).control.blocking_reason, "AGDF_DELIVERY_RELATIONSHIP_MISSING");
  assert.equal(refusals, 1); assert.equal(readFileSync(direct.state, "utf8"), readOnlyBefore); assertions += 3;
  let errors = 0;
  const throwingDispatch = createCoreServices({ observers: { ...continuationDependencies,
    correctRunRelationship: () => { errors++; throw new Error("injected correction failure"); } } }).dispatch;
  assert.equal(throwingDispatch(boundInput).outcome, "evaluator_error");
  assert.equal(errors, 1); assert.equal(readFileSync(direct.state, "utf8"), readOnlyBefore); assertions += 3;
  const continued = dispatch(boundInput);
  assert.equal(attempts, 1, JSON.stringify(continued)); assert.equal(continued.control.relationship_correction.outcome, "corrected");
  assert.equal(continued.control.relationship_correction.message, interactionLocales.locales.de.operationalValues.relationshipCorrected); assertions += 6;
  assert.equal(continued.control.revision_id, direct.revision());
  assert.notEqual(continued.control.revision_id, oldRevision);
  assert.equal(continued.authorizes, false);
  const correctedBytes = readFileSync(direct.state, "utf8");
  dispatch(boundInput);
  assert.equal(attempts, 1); assert.equal(readFileSync(direct.state, "utf8"), correctedBytes); assertions += 5;
  const failedDispatch = createCoreServices({ observers: { env: {}, renderTaskTargetOrientation: targetOrientation,
    resolveTaskTarget: () => ({ schema_version: "1", resolution_state: "resolved", reason_code: "continued_target",
      primary_target: direct.root, governance_target: direct.root, working_directory: direct.root, target_changed: false, next_action: "", authorizes: false }),
    evaluateGateCheck: () => ({ ...evaluateGateCheck(direct.root, { runId }), blocking_reason: "AGDF_DELIVERY_RELATIONSHIP_MISSING" }),
    correctRunRelationship: () => ({ outcome: "rejected", reason: "correction_commit_unconfirmed", committed: true, run_id: runId, revision_id: direct.revision() }) } }).dispatch;
  const stopped = failedDispatch({ ...input, continueDelivery: true });
  assert.equal(stopped.terminal, true); assert.equal(stopped.outcome, "evaluator_error");
  assert.ok(stopped.host_action.text.includes(direct.revision())); assertions += 3;
  const freshFailure = fixture(); freshFailure.record(); freshFailure.omit();
  let freshEvaluations = 0, freshCorrections = 0;
  const freshFailureInput = { ...boundInput, workingDirectory: freshFailure.root, primaryTarget: freshFailure.root };
  const freshFailureDispatch = createCoreServices({ observers: { ...continuationDependencies,
    resolveTaskTarget: () => ({ schema_version: "1", resolution_state: "resolved", reason_code: "continued_target",
      primary_target: freshFailure.root, governance_target: freshFailure.root, working_directory: freshFailure.root, target_changed: false, next_action: "", authorizes: false }),
    evaluateGateCheck: (root, selection) => {
      if (++freshEvaluations === 3) throw new Error("injected fresh evaluation failure after commit");
      return evaluateGateCheck(root, selection);
    },
    correctRunRelationship: (root, values, dependencies) => { freshCorrections++; return correctRunRelationship(root, values, dependencies); },
  } }).dispatch;
  assert.equal(freshFailureDispatch(freshFailureInput).outcome, "evaluator_error");
  assert.equal(freshCorrections, 1); assert.equal(freshEvaluations, 3);
  assert.equal(runSealState(freshFailure.root, readFileSync(freshFailure.state, "utf8")).status, "valid");
  assert.equal(evaluateGateCheck(freshFailure.root, { runId }).blocking_reason, "none"); assertions += 5;
  const implementing = fixture("QA"); implementing.edit(text => text.replace(`| CD+Tests | ${implementing.prefix}CD_TESTS.md | done |`, `| CD+Tests | ${implementing.prefix}CD_TESTS.md | missing |`));
  const phaseInput = { ...input, workingDirectory: implementing.root, primaryTarget: implementing.root };
  const phase = createSkillDispatchService({ env: {}, renderTaskTargetOrientation: targetOrientation, resolveTaskTarget: () => ({ schema_version: "1", resolution_state: "resolved", reason_code: "continued_target",
    primary_target: implementing.root, governance_target: implementing.root, working_directory: implementing.root, target_changed: false, next_action: "", authorizes: false }) });
  assert.equal(phase({ ...phaseInput, continueDelivery: true }).terminal, true, "a distinct recorded action must not authorize generic implementation"); assertions++;
  implementing.edit(text => text.replace("- next_allowed_action: Draft or refine the current artefact.", "- next_allowed_action: Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR."));
  const phaseResult = phase({ ...phaseInput, continueDelivery: true });
  assert.equal(phaseResult.terminal, false); assert.equal(phaseResult.continuation.phase, "implementation"); assert.equal(phaseResult.presentation, null);
  assert.equal(phase(phaseInput).terminal, true); assertions += 4;
  const racing = fixture(), raceCommand = racing.command(), raceRevision = racing.revision(), evidence = `${racing.prefix}recording.json`;
  writeFileSync(join(racing.root, evidence), JSON.stringify(raceCommand));
  const invoke = () => new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [cli, "run-step", "--dir", racing.root, "--run", runId, "--revision", raceRevision, "--step", "artefact", "--gate", "SD", "--evidence", evidence]);
    let out = "", err = ""; child.stdout.on("data", data => out += data); child.stderr.on("data", data => err += data);
    child.on("error", rejectPromise); child.on("close", () => { try { resolvePromise(JSON.parse(out)); } catch { rejectPromise(new Error(out + err)); } });
  });
  const raced = await Promise.all([invoke(), invoke()]);
  assert.equal(raced.filter(result => result.outcome === "recorded").length, 1);
  assert.equal(raced.filter(result => result.outcome === "rejected" && ["stale_revision", "run_write_locked"].includes(result.reason)).length, 1);
  assert.equal(readArtefactBindings(readFileSync(racing.state, "utf8")).receipts.length, 1); assertions += 3;
  console.log(`artefact recording/correction tests passed (${assertions} assertions)`);
} finally { rmSync(temporary, { recursive: true, force: true }); }
