import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createLateSourceRevisionTestRun } from "../../cli/scripts/fixtures/late-source-revision.js";
import { previewSourceRevision, applySourceRevision, inspectSourceRevision, recoverSourceRevision } from "../lib/control-state/run-revision.js";
import { readSourceRevisions, revisionHistoryPrefix } from "../lib/control-state/run-source-revisions.js";
import { readApprovalOperations } from "../lib/control-state/approval-operations.js";
import { readArtefactBindings } from "../lib/control-state/artefact-bindings.js";
import { validateRevisionHistory, byteDigest } from "../lib/control-state/run-revision-history.js";
import { runSealState, sealRunState } from "../lib/control-state/run-seal.js";
import { validateBindingProof, exactApprovedArtefacts } from "../lib/control-state/artefact-binding-proof.js";
import { evaluateGateCheck } from "../lib/control-evaluation/gate-check.js";
import { recordRunRevision } from "../lib/control-state/run-recording.js";
import { writeRun } from "../lib/control-state/run-state-writer.js";
import { upsertTableRow } from "../lib/control-state/run-state-edits.js";
import { createCoreServices } from "../lib/index.js";
import { correctRunRelationship } from "../lib/control-state/run-relationship-correction.js";

const temporary = mkdtempSync(join(tmpdir(), "agdf-source-revisions-")), root = join(temporary, "project");
const cli = resolve(import.meta.dirname, "../../cli/bin/create-agdf.js");
mkdirSync(root); execFileSync("git", ["init", "-q", root]);
execFileSync(process.execPath, [cli, "init", "--dir", root, "--language", "en"]);
const f = createLateSourceRevisionTestRun(root, cli, "late-source-test", process.env, { tpEncoding: "crlf_bom" }), seed = join(temporary, "canonical-seed");
writeFileSync(join(root, "retained-filter.mjs"), `export function filterStore() {
  const saved = new Map(), key = (user, name) => JSON.stringify([user, name]);
  return { save(user, name, value) { saved.set(key(user, name), structuredClone(value)); },
    restore(user, name) { return structuredClone(saved.get(key(user, name))); } };
}\n`);
writeFileSync(join(root, "retained-filter-test.mjs"), `import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs'; import {createHash} from 'node:crypto';
import {filterStore} from './retained-filter.mjs';
const tp=readFileSync(process.argv[2]); const digest=createHash('sha256').update(tp).digest('hex');
assert.equal(digest,process.argv[3]); assert.match(tp.toString(),/AC-001/);assert.match(tp.toString(),/T-001/);
const store=filterStore(), original={status:['open'],minimum:10};store.save('owner','named',original);
original.status.push('changed');assert.deepEqual(store.restore('owner','named'),{status:['open'],minimum:10});
assert.equal(store.restore('different-owner','named'),undefined);
console.log(JSON.stringify({tp_digest:digest,criterion_id:'AC-001',task_id:'T-001',outcome:'pass',fixture_authority:'synthetic_only'}));\n`);
const code = readFileSync(join(root, "retained-filter.mjs")), retainedTest = readFileSync(join(root, "retained-filter-test.mjs"));
cpSync(join(root, ".agdf"), seed, { recursive: true });
const originalRevision = f.revision(), evidence = [], observations = [], gates = ["UR", "PRD", "SD", "TP"];
const structuredBacklogRow = readFileSync(join(root, ".agdf/control/MASTER_BACKLOG.md"), "utf8").split("\n").find(line => line.includes(`| ${f.runId} |`));
assert.match(structuredBacklogRow, /\| In Progress \|/u, "persisted TP approval updates Backlog beyond Awaiting TP");
assert.ok(structuredBacklogRow.includes("Implement the approved TP scope"), "Backlog next action follows the approved TP transition");
const reset = () => { rmSync(join(root, ".agdf"), { recursive: true }); cpSync(seed, join(root, ".agdf"), { recursive: true }); };
const tree = () => {
  const result = {};
  const scan = dir => readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name)).forEach(entry => {
    const path = join(dir, entry.name); if (entry.isDirectory()) scan(path); else if (entry.isFile()) result[path.slice(root.length)] = byteDigest(readFileSync(path));
    else result[path.slice(root.length)] = "nonregular";
  }); scan(join(root, ".agdf")); return result;
};
const passed = (ids, facts) => ids.forEach(scenario_id => evidence.push({ scenario_id, status: "pass", facts, run_id: f.runId,
  module_digest: byteDigest(readFileSync(new URL("../lib/control-state/run-revision.js", import.meta.url))), observations: [...observations], fixture_authority: "synthetic_only" }));
const prepare = (gate = "TP", analyses = "retain") => {
  const p = f.proposal(gate, analyses), v = previewSourceRevision(root, p.input);
  assert.equal(v.outcome, "preview", JSON.stringify({ result: v, gates: gates.map(gate => ({ gate, exact: exactApprovedArtefacts(root, { ...f.control(), content: f.readState().content, meta: f.readState().meta, approvals: new Map([[gate, f.control().approvals.get(gate)]]) }),
    effects: readApprovalOperations(f.readState().content).receipts.filter(row => row.binding.gate === gate).map(row => row.effect) })),
    bindings: readArtefactBindings(f.readState().content).active.map(row => ({ type: row.destination.type, valid: validateBindingProof(root, row) })) }));
  return { ...p, preview: v, input: { ...p.input, previewDigest: v.preview_digest } };
};
const renew = gate => {
  if (gate === "UR") {
    writeFileSync(f.file("UR.md"), readFileSync(f.file("UR.md"), "utf8") + "\nSynthetic renewed requirement explanation.\n");
    assert.equal(f.run("run-step", "--revision", f.revision(), "--step", "ur", "--title", "Renewed synthetic UR").value.outcome, "recorded");
    f.approveSource("UR"); assert.equal(evaluateGateCheck(root, { runId: f.runId }).current_gate, "Brownfield Review");
    writeFileSync(f.file("BROWNFIELD_REVIEW.md"), "# Brownfield Review\nFresh synthetic routing under renewed UR.\n- ux_intent_definition_required: no\n");
    assert.equal(f.run("run-step", "--revision", f.revision(), "--step", "route", "--route", "structured_delivery", "--reason", "Fresh synthetic review", "--evidence", f.prefix + "BROWNFIELD_REVIEW.md").value.outcome, "recorded");
  }
  for (const type of gates.slice(Math.max(1, gates.indexOf(gate)))) {
    writeFileSync(f.file(`${type}.md`), readFileSync(f.file(`${type}.md`), "utf8") + `\nRenewed synthetic ${type} source explanation.\n`);
    f.recordSource(type); f.approveSource(type);
  }
  assert.equal(evaluateGateCheck(root, { runId: f.runId }).current_gate, "Brownfield Analysis");
  assert.equal(f.control().artefacts.get("CD+Tests")?.status, "missing");
  const expected = byteDigest(readFileSync(f.file("TP.md"))).slice("sha256:".length);
  const freshCheck = JSON.parse(execFileSync(process.execPath, [join(root, "retained-filter-test.mjs"), f.file("TP.md"), expected]).toString());
  observations.push({ service: "actual retained filter behavior test under freshly approved fixture TP", run_id: f.runId,
    revision_id: f.revision(), ...freshCheck, code_digest: byteDigest(code), test_digest: byteDigest(retainedTest) });
  assert.deepEqual(readFileSync(join(root, "retained-filter-test.mjs")), retainedTest);
  f.prepareImplementation(); assert.equal(evaluateGateCheck(root, { runId: f.runId }).current_gate, "CD+Tests");
};
const worker = (input, stage) => new Promise((resolvePromise, reject) => {
  const program = `import {applySourceRevision} from ${JSON.stringify(new URL("../lib/control-state/run-revision.js", import.meta.url).href)};
    const result=applySourceRevision(process.argv[1],JSON.parse(process.argv[2]),{afterWrite(point){if(point===process.argv[3])process.exit(71)}});console.log(JSON.stringify(result));`;
  const child = spawn(process.execPath, ["--input-type=module", "-e", program, root, JSON.stringify(input), stage ?? ""]);
  let stdout = "", stderr = ""; child.stdout.on("data", data => stdout += data); child.stderr.on("data", data => stderr += data);
  child.on("error", reject); child.on("exit", code => resolvePromise({ code, value: stdout ? JSON.parse(stdout) : null, stderr }));
});

try {
  for (const gate of gates) {
    reset(); const p = prepare(gate), before = tree(), old = f.readState().content;
    assert.deepEqual(previewSourceRevision(root, p.input), p.preview); assert.deepEqual(tree(), before);
    const oldApproval = readApprovalOperations(old).receipts, oldBindings = readArtefactBindings(old).receipts;
    const result = applySourceRevision(root, p.input); assert.equal(result.outcome, "reopened", JSON.stringify(result)); assert.equal(result.gate, gate);
    const current = f.readState().content, history = readSourceRevisions(current);
    assert.equal(history.valid, true); assert.equal(validateRevisionHistory(root, history.receipts[0]), true);
    assert.equal(runSealState(root, current).status, "valid");
    assert.deepEqual(readApprovalOperations(current).receipts, oldApproval); assert.deepEqual(readArtefactBindings(current).receipts, oldBindings);
    for (const type of gates) {
      const upstream = gates.indexOf(type) < gates.indexOf(gate), c = f.control();
      assert.equal(c.approvals.get(type).status, upstream ? "approved" : "missing");
      assert.equal(Boolean(c.artefacts.get(type).path), upstream); assert.equal(existsSync(f.file(`${type}.md`)), true);
    }
    const report = evaluateGateCheck(root, { runId: f.runId }); assert.equal(report.current_gate, gate);
    assert.equal(report.approval_presentation, null); assert.equal(report.missing_approval, `Approval: ${gate}`);
    assert.ok(!readArtefactBindings(current).active.some(row => history.receipts[0].invalidated_bindings.includes(row.binding_id)));
    assert.notEqual(correctRunRelationship(root, { runId: f.runId, revisionId: f.revision() }, { evaluateGateCheck }).outcome, "corrected", "Historical incoming proof cannot reconstruct a reopened source relation");
    observations.push({ gate, operation_id: p.input.operationId, previous_revision_id: p.input.revisionId, resulting_revision_id: result.revision_id,
      service: "previewSourceRevision/applySourceRevision/evaluateGateCheck/correctRunRelationship", before: byteDigest(Buffer.from(JSON.stringify(before))), after: byteDigest(Buffer.from(JSON.stringify(tree()))), outcome: result.outcome });
    const oldId = oldApproval.at(-1).binding.presentation_id;
    assert.equal(f.approve("TP", oldId).value.outcome, "rejected");
    const replayBefore = tree(); assert.equal(applySourceRevision(root, p.input).outcome, "replayed"); assert.deepEqual(tree(), replayBefore);
    assert.equal(applySourceRevision(root, { ...p.input, previewDigest: byteDigest(Buffer.from("wrong")) }).outcome, "rejected");
    renew(gate); assert.equal(validateRevisionHistory(root, history.receipts[0]), true, "historical proofs survive canonical replacement");
    assert.deepEqual(readFileSync(join(root, "retained-filter.mjs")), code);
    const replay = applySourceRevision(root, p.input); assert.equal(replay.outcome, "replayed");
    assert.notEqual(replay.resulting_revision_id, replay.current_revision_id);
    assert.equal(inspectSourceRevision(root, p.input).history.authority, "historical_evidence_only");
    assert.equal(readArtefactBindings(f.readState().content).active.length, 3);
  }
  passed(["SCN-001", "SCN-003", "SCN-004", "SCN-005", "SCN-007", "SCN-008", "SCN-011", "SCN-012", "SCN-013", "SCN-014"], "All four real canonical source renewal paths; exact upstream approval matrix, preserved history, fresh preparation and synthetic replies.");

  reset(); writeFileSync(f.state, "\ufeff" + f.readState().content.replace(/\n/gu, "\r\n"));
  const raw = readFileSync(f.state), tpRaw = readFileSync(f.file("TP.md"));
  const input = f.proposal("TP"); input.input.revisionId = originalRevision; input.value.expected_revision_id = originalRevision;
  writeFileSync(join(root, input.input.evidence), JSON.stringify(input.value));
  const preview = previewSourceRevision(root, input.input); assert.equal(preview.outcome, "preview", JSON.stringify(preview));
  assert.equal(applySourceRevision(root, { ...input.input, previewDigest: preview.preview_digest }).outcome, "reopened");
  const inspected = inspectSourceRevision(root, input.input), rows = inspected.history.manifest.files;
  assert.deepEqual(readFileSync(join(root, rows.find(row => row.path.endsWith("/RUN_STATE.md")).snapshot)), raw);
  assert.deepEqual(readFileSync(join(root, rows.find(row => row.path === f.prefix + "TP.md").snapshot)), tpRaw);
  renew("TP"); assert.equal(validateRevisionHistory(root, inspected.history.receipt), true);
  const second = prepare("SD"); assert.equal(applySourceRevision(root, second.input).outcome, "reopened"); renew("SD");
  const histories = readSourceRevisions(f.readState().content).receipts; assert.equal(histories.length, 2);
  assert.ok(histories.every(row => validateRevisionHistory(root, row)));
  assert.ok(inspectSourceRevision(root, second.input).history.manifest.files.every(row => !row.path.includes("/revisions/")));
  passed(["SCN-018"], "Two renewed revisions; raw CRLF/BOM bytes preserved; no recursively copied archive trees.");

  reset(); const reassessment = prepare("SD", "reassess"); assert.equal(applySourceRevision(root, reassessment.input).gate, "Brownfield Review");
  assert.equal(evaluateGateCheck(root, { runId: f.runId }).current_gate, "Brownfield Review");
  assert.equal(f.run("run-step", "--revision", f.revision(), "--step", "artefact", "--gate", "SD", "--evidence", reassessment.input.evidence).value.outcome, "rejected");
  writeFileSync(f.file("BROWNFIELD_REVIEW.md"), "# Brownfield Review\nFresh synthetic reassessment\n- ux_intent_definition_required: yes\n");
  assert.equal(f.run("run-step", "--revision", f.revision(), "--step", "route", "--route", "structured_delivery", "--reason", "Reassessment under retained UR", "--evidence", f.prefix + "BROWNFIELD_REVIEW.md").value.outcome, "recorded");
  const ux = evaluateGateCheck(root, { runId: f.runId }); assert.equal(ux.next_operation.type, "reassess_source_analysis"); assert.equal(ux.approval_presentation, null);
  const services = createCoreServices();
  const dispatch = services.dispatch({ skillId: "gate-check", runId: f.runId, continueDelivery: true, surface: "codex",
    presentationLanguage: "en", workingDirectory: root, primaryTarget: root, targetSource: "explicit_target",
    expectedVersion: services.resources.pluginDefinition.version, interactionLocales: services.resources.interactionLocales });
  assert.equal(dispatch.continuation?.skill_id, "ux-intent-definition", JSON.stringify(dispatch));
  writeFileSync(f.file("UX_INTENT_DEFINITION.md"), "# UX Intent Definition\nFresh synthetic approved-UR analytical input.\n");
  writeFileSync(f.state, upsertTableRow(f.readState().content, "Artefacts", 0, "UX Intent Definition", ["UX Intent Definition", f.prefix + "UX_INTENT_DEFINITION.md", "done", "Fresh analytical result"]));
  assert.equal(recordRunRevision(root, { runId: f.runId, revisionId: f.revision() }).outcome, "updated");
  assert.equal(evaluateGateCheck(root, { runId: f.runId }).missing_approval, "Approval: SD");
  passed(["SCN-009", "SCN-010"], "Fresh Review/Mode after UR; later analytical reassessment blocks source authoring and routes existing UX owner before renewal.");

  const proposalChanges = {
    foreign_target: p => p.target_id = byteDigest(Buffer.from("foreign")), foreign_run: p => p.run_id = "foreign",
    foreign_revision: p => p.expected_revision_id = randomUUID(), source_contradiction: p => p.impact_assessment.earliest_source = "UR",
    unresolved: p => p.impact_assessment.unresolved.push("Unknown context"), upstream: p => p.impact_assessment.upstream[0].rationale = "",
    analysis: p => p.impact_assessment.analyses[0].digest = byteDigest(Buffer.from("wrong")), schema: p => p.extra = true,
  };
  for (const change of Object.values(proposalChanges)) {
    reset(); const p = f.proposal("TP"); change(p.value); writeFileSync(join(root, p.input.evidence), JSON.stringify(p.value));
    const before = tree(); assert.equal(previewSourceRevision(root, p.input).outcome, "rejected"); assert.deepEqual(tree(), before);
  }
  for (const mutate of [p => p.input.revisionId = randomUUID(), p => p.input.sourceGate = "QA", p => p.input.evidence = "../proposal.json"]) {
    reset(); const p = prepare(); mutate(p); const before = tree(); assert.equal(applySourceRevision(root, p.input).outcome, "rejected"); assert.deepEqual(tree(), before);
  }
  passed(["SCN-015"], "Wrong identity, source, proposal, unresolved assessment and unsafe path rejected without writes.");

  for (const type of ["awaiting_cr", "qa", "uat", "or", "closed", "historical", "quick", "verified", "unapproved", "unsealed"]) {
    reset(); let text = f.readState().content;
    if (["awaiting_cr", "qa", "uat", "or"].includes(type)) text = upsertTableRow(text, "Artefacts", 0, "CD+Tests", ["CD+Tests", "", "done", "Boundary test"]);
    if (["qa", "uat", "or"].includes(type)) text = upsertTableRow(text, "Artefacts", 0, "CR", ["CR", "", "done", "Negative boundary fixture"]);
    // Deliberately altered negative states, never represented as canonical successful approvals.
    if (["uat", "or"].includes(type)) text = upsertTableRow(text, "Approvals", 0, "QA", ["QA", "approved", "Negative boundary fixture"]);
    if (type === "or") { text = upsertTableRow(text, "Approvals", 0, "UAT", ["UAT", "approved", "Negative boundary fixture"]); text = upsertTableRow(text, "Artefacts", 0, "OR", ["OR", "", "done", "Negative boundary fixture"]); }
    if (type === "closed") text = text.replace("- lifecycle: active", "- lifecycle: completed");
    if (type === "historical") text = text.replace("- lifecycle: active", "- lifecycle: superseded");
    if (type === "quick" || type === "verified") text = text.replace("- decision: structured_delivery", `- decision: ${type === "quick" ? "quick_task" : "verified_change"}`);
    if (type === "unapproved") text = text.replace(/\| TP \| approved \|[^\n]+/u, "| TP | missing | |");
    if (type === "unsealed") text = text.replace(/^- (?:content_seal|approval_seal):.*\n/gmu, "");
    writeFileSync(f.state, type === "unsealed" ? text : sealRunState(root, text));
    const p = f.proposal("TP"), before = tree(); assert.equal(previewSourceRevision(root, p.input).outcome, "rejected", type); assert.deepEqual(tree(), before);
  }
  passed(["SCN-017"], "Unsupported lifecycles, modes and post-implementation states refuse late revisions.");

  for (const phase of ["intent", "archive_intent", "archive_temp_written", "archive_after_file_sync", "archive_file", "archive_synced", "archive_published", "run_before_rename"]) {
    reset(); const p = prepare(), before = tree();
    assert.throws(() => applySourceRevision(root, p.input, { afterWrite(point) { if (point === phase) throw Error("injected_fault"); } }), /injected_fault/u, phase);
    assert.deepEqual(tree(), before, phase);
  }
  passed(["SCN-019"], "Faults at real intent/archive writes, file sync, publication and pre-Run rename restore exact old effective state.");
  for (const phase of ["run_after_rename", "run_after_directory_sync", "run", "backlog_after_rename", "backlog", "retired"]) {
    reset(); const p = prepare(), result = applySourceRevision(root, p.input, { afterWrite(point) { if (point === phase) throw Error("injected_fault"); } });
    assert.equal(result.outcome, "recovery_required", phase); const revision = f.revision(), before = tree();
    const inspect = inspectSourceRevision(root, p.input); assert.ok(["recovery_required", "historical"].includes(inspect.outcome)); assert.deepEqual(tree(), before);
    assert.equal(recoverSourceRevision(root, { ...p.input, revisionId: revision }).outcome, "recovered"); assert.equal(f.revision(), revision);
    assert.equal(runSealState(root, f.readState().content).status, "valid"); assert.equal(applySourceRevision(root, p.input).outcome, "replayed");
  }
  passed(["SCN-020"], "Post-rename/sync, Backlog and retirement errors reconcile one committed revision through explicit recovery.");

  reset(); const interrupted = prepare(); assert.equal((await worker(interrupted.input, "archive_file")).code, 71);
  const unknownBefore = tree(); assert.equal(evaluateGateCheck(root, { runId: f.runId }).status, "blocked");
  assert.equal(recordRunRevision(root, { runId: f.runId, revisionId: originalRevision }).reason, "run_step_recovery_required");
  assert.equal(inspectSourceRevision(root, interrupted.input).outcome, "recovery_required"); assert.deepEqual(tree(), unknownBefore);
  const staging = join(root, revisionHistoryPrefix(f.runId, interrupted.input.operationId).slice(0, -1) + ".pending");
  const durableTree = () => Object.fromEntries(Object.entries(tree()).filter(([path]) => !path.endsWith(".lock") && !path.endsWith(".reclaim")));
  const foreign = join(staging, "foreign.txt"); writeFileSync(foreign, "Do not delete unknown content"); const unknownTree = durableTree();
  assert.equal(recoverSourceRevision(root, interrupted.input).outcome, "recovery_required"); assert.deepEqual(durableTree(), unknownTree); unlinkSync(foreign);
  const firstSnapshot = join(staging, "files/0.bin"), snapshotBytes = readFileSync(firstSnapshot); writeFileSync(firstSnapshot, "Unknown changed staged bytes");
  const damagedTree = durableTree(); assert.equal(recoverSourceRevision(root, interrupted.input).outcome, "recovery_required"); assert.deepEqual(durableTree(), damagedTree); writeFileSync(firstSnapshot, snapshotBytes);
  assert.equal(recoverSourceRevision(root, interrupted.input).status, "rolled_back"); assert.equal(f.revision(), originalRevision);
  reset(); const race = prepare(), competitor = prepare(); const results = await Promise.all([worker(race.input), worker(competitor.input)]);
  assert.equal(results.filter(r => r.value?.outcome === "reopened").length, 1, JSON.stringify(results));
  assert.equal(readSourceRevisions(f.readState().content).receipts.length, 1); assert.deepEqual(readFileSync(join(root, "retained-filter.mjs")), code);
  assert.deepEqual(readFileSync(join(root, "retained-filter-test.mjs")), retainedTest);
  passed(["SCN-016", "SCN-021"], "Abrupt real process interruption leaves fail-closed pending state; explicit recovery rolls back. Competing real processes commit at most once; replay preserves current-vs-original identity.");

  reset(); const collision = prepare(), dir = join(root, revisionHistoryPrefix(f.runId, collision.input.operationId));
  mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, "foreign"), "Foreign content retained");
  const collisionBefore = tree(); assert.equal(applySourceRevision(root, collision.input).outcome, "rejected"); assert.deepEqual(tree(), collisionBefore);
  reset(); const unsafe = prepare(), file = f.file("TP.md"), bytes = readFileSync(file); unlinkSync(file);
  try { symlinkSync(join(temporary, "outside.md"), file); writeFileSync(join(temporary, "outside.md"), bytes); assert.equal(applySourceRevision(root, unsafe.input).outcome, "rejected"); }
  catch (error) { if (process.platform !== "win32" || error.code !== "EPERM") throw error; }
  reset(); const corruption = prepare(); assert.equal(applySourceRevision(root, corruption.input).outcome, "reopened");
  const receipt = readSourceRevisions(f.readState().content).receipts[0], manifest = inspectSourceRevision(root, corruption.input).history.manifest;
  assert.equal(validateRevisionHistory(root, { ...receipt, target_id: byteDigest(Buffer.from("foreign target")) }), false);
  assert.equal(validateRevisionHistory(root, { ...receipt, request_digest: byteDigest(Buffer.from("unrelated request")) }), false);
  assert.equal(validateRevisionHistory(root, { ...receipt, preview_digest: byteDigest(Buffer.from("unrelated preview")) }), false);
  assert.equal(validateRevisionHistory(root, { ...receipt, archive: { ...receipt.archive, path: "../manifest.json" } }), false);
  writeFileSync(join(root, manifest.files[0].snapshot), "corrupted archive");
  assert.equal(runSealState(root, f.readState().content).status, "invalid"); assert.equal(recordRunRevision(root, { runId: f.runId, revisionId: f.revision() }).outcome, "rejected");
  assert.equal(validateRevisionHistory(root, receipt), false);
  passed(["SCN-006"], "Unsafe source path, owned-name collision and corrupt archived bytes cannot change or restore effective authority.");

  for (const alter of [() => unlinkSync(f.file("BROWNFIELD_ANALYSIS.md")), () => { const id = readArtefactBindings(f.readState().content).active[0]; unlinkSync(join(root, id.review.path)); }]) {
    reset(); const p = prepare(); alter(); const unchanged = tree(); assert.equal(applySourceRevision(root, p.input).outcome, "rejected"); assert.deepEqual(tree(), unchanged);
  }
  reset(); const stale = prepare(); writeFileSync(join(root, stale.input.evidence), JSON.stringify({ ...stale.value, reason: "Changed after preview" }));
  const staleBefore = tree(); assert.equal(applySourceRevision(root, stale.input).reason, "revision_preview_stale"); assert.deepEqual(tree(), staleBefore);
  reset(); const large = prepare(), backlog = join(root, ".agdf/control/MASTER_BACKLOG.md"); writeFileSync(backlog, readFileSync(backlog, "utf8") + "\n" + "Large synthetic backlog context. ".repeat(3000) + "\n");
  assert.equal(applySourceRevision(root, large.input).outcome, "reopened", "Journal legitimately exceeds the small artefact JSON limit");
  reset(); const unsafeBacklog = prepare(), saved = readFileSync(backlog), outsideBacklog = join(temporary, "foreign-backlog.md");
  writeFileSync(outsideBacklog, saved); unlinkSync(backlog);
  try {
    symlinkSync(outsideBacklog, backlog); const unchanged = tree(); assert.equal(applySourceRevision(root, unsafeBacklog.input).reason, "revision_path_invalid");
    assert.deepEqual(tree(), unchanged); assert.deepEqual(readFileSync(outsideBacklog), saved);
  } catch (error) { if (process.platform !== "win32" || error.code !== "EPERM") throw error; }

  reset(); const sealed = prepare(); assert.equal(applySourceRevision(root, sealed.input).outcome, "reopened");
  const before = f.readState().content;
  assert.throws(() => writeRun(f.state, before.replace(/\n## Source Revisions[\s\S]*$/u, ""), f.revision(), { allowContentChange: true }), /AGDF_RUN_APPROVALS_UNRECORDED|AGDF_SOURCE_REVISIONS_CHANGED/u);
  assert.equal(f.readState().content, before);
  if (process.env.AGDF_TEST_EVIDENCE_DIR) {
    mkdirSync(process.env.AGDF_TEST_EVIDENCE_DIR, { recursive: true });
    for (const row of evidence) writeFileSync(join(process.env.AGDF_TEST_EVIDENCE_DIR, `${row.scenario_id}-core.json`), JSON.stringify(row, null, 2) + "\n");
  }
  console.log(JSON.stringify({ suite: "source-revisions", scenarios: evidence.map(row => row.scenario_id), fixture_authority: "synthetic_only" }));
} finally { rmSync(temporary, { recursive: true, force: true }); }
