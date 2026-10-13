import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createEarlyUrRevisionTestRun } from "../../cli/scripts/fixtures/early-ur-revision.js";
import { previewSourceRevision, applySourceRevision, inspectSourceRevision, recoverSourceRevision } from "../lib/control-state/run-revision.js";
import { readSourceRevisions } from "../lib/control-state/run-source-revisions.js";
import { byteDigest, validateRevisionHistory } from "../lib/control-state/run-revision-history.js";
import { readArtefactBindings } from "../lib/control-state/artefact-bindings.js";
import { readApprovalOperations } from "../lib/control-state/approval-operations.js";
import { runSealState, sealRunState, artefactFileDigest } from "../lib/control-state/run-seal.js";
import { evaluateGateCheck } from "../lib/control-evaluation/gate-check.js";
import { decodeBacklogMarker } from "../lib/control-state/backlog-summary.js";
import { upsertTableRow } from "../lib/control-state/run-state-edits.js";
import { createCoreServices } from "../lib/index.js";
import { resolveControlCommandTarget, canonicalJson, digest } from "../lib/control-state/approval-command-contract.js";
import { readPendingSourceRevisionJournal } from "../lib/control-state/run-step-transaction.js";
import { intentStages, archiveStages, commitStages, beforeIntent, beforeRunCommit } from "./fixtures/transaction-checkpoints.js";

const temporary = mkdtempSync(join(tmpdir(), "agdf-early-ur-revision-")), root = join(temporary, "project");
const cli = resolve(import.meta.dirname, "../../cli/bin/create-agdf.js");
mkdirSync(root); execFileSync("git", ["init", "-q", root]);
execFileSync(process.execPath, [cli, "init", "--dir", root, "--language", "en"]);
const f = createEarlyUrRevisionTestRun(root, cli), seed = join(temporary, "seed");
cpSync(join(root, ".agdf"), seed, { recursive: true });
const reset = () => { rmSync(join(root, ".agdf"), { recursive: true }); cpSync(seed, join(root, ".agdf"), { recursive: true }); };
const tree = () => {
  const files = {};
  const scan = path => readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).forEach(entry => {
    const file = join(path, entry.name);
    if (entry.isDirectory()) scan(file); else files[file.slice(root.length)] = byteDigest(readFileSync(file));
  });
  scan(join(root, ".agdf")); return files;
};
const prepare = () => {
  const proposal = f.proposal(), preview = previewSourceRevision(root, proposal.input);
  assert.equal(preview.outcome, "preview", JSON.stringify(preview));
  return { ...proposal, preview, input: { ...proposal.input, previewDigest: preview.preview_digest } };
};
const flags = input => ["--revision", input.revisionId, "--source-gate", input.sourceGate, "--operation", input.operationId, "--evidence", input.evidence];
const worker = (input, stage = "") => new Promise((resolvePromise, reject) => {
  const program = `import {applySourceRevision} from ${JSON.stringify(new URL("../lib/control-state/run-revision.js", import.meta.url).href)};
    const result=applySourceRevision(process.argv[1],JSON.parse(process.argv[2]),{afterWrite(point){if(point===process.argv[3])process.exit(71)}});
    console.log(JSON.stringify(result));`;
  const child = spawn(process.execPath, ["--input-type=module", "-e", program, root, JSON.stringify(input), stage]);
  let stdout = "", stderr = "";
  child.stdout.on("data", data => stdout += data); child.stderr.on("data", data => stderr += data);
  child.on("error", reject); child.on("exit", code => resolvePromise({ code, value: stdout ? JSON.parse(stdout) : null, stderr }));
});

try {
  const p = prepare(), before = tree(), old = f.readState().content;
  assert.deepEqual(previewSourceRevision(root, p.input), p.preview); assert.deepEqual(tree(), before);
  assert.deepEqual(p.preview.sources.map(row => row.type), ["UR", "PRD", "SD"]);
  const oldPresentations = readdirSync(join(root, `.agdf/control/runs/${f.runId}/presentations`));
  const result = f.run("run-revise", "--apply", ...flags(p.input), "--preview-digest", p.preview.preview_digest);
  assert.equal(result.value?.outcome, "reopened", result.text); assert.equal(result.value.gate, "UR");
  const current = f.readState().content, receipt = readSourceRevisions(current).receipts[0];
  assert.equal(validateRevisionHistory(root, receipt), true);
  assert.equal(runSealState(root, current).status, "valid");
  assert.deepEqual(readApprovalOperations(current).receipts, readApprovalOperations(old).receipts, "old decision receipts survive without remaining current approvals");
  assert.equal(readArtefactBindings(current).active.length, 0);
  for (const gate of ["UR", "PRD", "SD", "TP"]) {
    assert.equal(f.control().approvals.get(gate).status, "missing");
    assert.equal(Boolean(f.control().artefacts.get(gate)?.path), false);
  }
  assert.equal(f.control().mode_slice_decision.decision, "undecided");
  assert.equal(f.control().artefacts.get("Brownfield Review").status, "missing");
  const history = inspectSourceRevision(root, p.input).history;
  for (const name of oldPresentations) assert.ok(history.manifest.files.some(row => row.path.endsWith(`/presentations/${name}`)));
  assert.deepEqual(readFileSync(join(root, history.manifest.files.find(row => row.path === f.prefix + "SD.md").snapshot)), readFileSync(f.file("SD.md")));
  const marker = readFileSync(join(root, ".agdf/control/MASTER_BACKLOG.md"), "utf8").split("\n").map(decodeBacklogMarker).find(row => row?.record?.run_id === f.runId);
  assert.equal(marker.record.revision_id, f.revision());
  const check = evaluateGateCheck(root, { runId: f.runId }); assert.equal(check.current_gate, "UR"); assert.equal(check.source_revisions.status, "verified");
  const services = createCoreServices();
  const dispatch = services.dispatch({ skillId: "gate-check", runId: f.runId, intake: true, intakeMode: "resume", urAction: "revise",
    expectedRevisionId: f.revision(), surface: "codex", presentationLanguage: "de", workingDirectory: root, primaryTarget: root,
    targetSource: "explicit_target", expectedVersion: services.resources.pluginDefinition.version, interactionLocales: services.resources.interactionLocales });
  assert.equal(dispatch.continuation?.phase, "ur_definition", JSON.stringify(dispatch));
  const after = tree();
  assert.equal(applySourceRevision(root, p.input).outcome, "replayed"); assert.deepEqual(tree(), after);
  assert.equal(applySourceRevision(root, { ...p.input, previewDigest: byteDigest(Buffer.from("different")) }).reason, "revision_operation_conflict");
  const oldApproval = readApprovalOperations(old).receipts.find(row => row.binding.gate === "UR");
  assert.equal(f.approve("UR", oldApproval.binding.presentation_id, oldApproval.binding.expected_revision_id).value.outcome, "rejected");
  writeFileSync(f.file("UR.md"), readFileSync(f.file("UR.md"), "utf8") + "\nFresh synthetic integrated need.\n");
  assert.equal(f.run("run-step", "--revision", f.revision(), "--step", "ur", "--title", "Renewed synthetic integrated UR").value.outcome, "recorded");
  assert.equal(validateRevisionHistory(root, receipt), true, "new canonical content cannot rewrite archived source proof");
  const fresh = f.present("UR"); assert.equal(fresh.value.outcome, "prepared");
  assert.equal(f.approve("UR", fresh.value.presentation_id).value.outcome, "accepted");
  assert.equal(evaluateGateCheck(root, { runId: f.runId }).current_gate, "Brownfield Review");

  reset(); writeFileSync(f.file("UX_INTENT_DEFINITION.md"), "# UX Intent Definition\nSynthetic prior analytical input.\n");
  writeFileSync(f.state, upsertTableRow(f.readState().content, "Artefacts", 0, "UX Intent Definition",
    ["UX Intent Definition", f.prefix + "UX_INTENT_DEFINITION.md", "done", "Synthetic analytical fixture"]));
  assert.equal(f.run("run-update", "--revision", f.revision()).value.outcome, "updated");
  const analytical = prepare(); assert.equal(applySourceRevision(root, analytical.input).outcome, "reopened");
  assert.equal(f.control().artefacts.get("UX Intent Definition").status, "missing");
  assert.ok(inspectSourceRevision(root, analytical.input).history.manifest.files.some(row => row.path === f.prefix + "UX_INTENT_DEFINITION.md"));
  reset(); writeFileSync(f.state, sealRunState(root, f.readState().content.replace("- decision: structured_delivery", "- decision: structured_slice")));
  assert.equal(applySourceRevision(root, prepare().input).outcome, "reopened", "both structured modes use the same boundary");
  const clone = join(temporary, "relocated-clone"); cpSync(root, clone, { recursive: true });
  const clonedState = readFileSync(join(clone, `.agdf/control/runs/${f.runId}/RUN_STATE.md`), "utf8");
  assert.equal(runSealState(clone, clonedState).status, "valid", "archived early history remains portable without transferring new command authority");
  const clonedReceipt = readSourceRevisions(clonedState).receipts[0];
  assert.equal(validateRevisionHistory(clone, clonedReceipt), true);
  const archived = inspectSourceRevision(root, {
    runId: f.runId, revisionId: f.revision(), operationId: clonedReceipt.operation_id }).history.manifest;
  writeFileSync(join(clone, archived.files[0].snapshot), "Damaged history");
  assert.equal(runSealState(clone, clonedState).status, "invalid");

  reset(); const missingProof = prepare(), mapping = readArtefactBindings(f.readState().content).active.find(row => row.destination.type === "SD").review.path;
  writeFileSync(join(root, mapping), "{}");
  const broken = tree(); assert.equal(applySourceRevision(root, missingProof.input).outcome, "rejected"); assert.deepEqual(tree(), broken);

  // Eligibility expansion must not include other source gates or later lifecycle work.
  for (const gate of ["PRD", "SD", "TP"]) {
    reset(); const candidate = f.proposal(gate), before = tree();
    assert.equal(previewSourceRevision(root, candidate.input).reason, "late_revision_boundary_invalid", gate); assert.deepEqual(tree(), before);
  }
  for (const [name, change] of [
    ["completed", text => text.replace("- lifecycle: active", "- lifecycle: completed")],
    ["non-structured", text => text.replace("- decision: structured_delivery", "- decision: quick_task")],
    ["SD-approved", text => upsertTableRow(text, "Approvals", 0, "SD", ["SD", "approved", "Negative boundary fixture"])],
    ["TP-linked", text => upsertTableRow(text, "Artefacts", 0, "TP", ["TP", f.prefix + "TP.md", "draft", "Negative boundary fixture"])],
    ["implementation", text => upsertTableRow(text, "Artefacts", 0, "CD+Tests", ["CD+Tests", "", "done", "Negative boundary fixture"])],
    ...["TP Review", "Clean Implementation Review", "CR", "QA", "UAT"].map(type => [type + "-linked", text => upsertTableRow(text, "Artefacts", 0, type, [type, f.prefix + "LATER_RESULT.md", "draft", "Negative boundary fixture"])]),
    ...["QA", "UAT"].map(gate => [gate + "-approved", text => upsertTableRow(text, "Approvals", 0, gate, [gate, "approved", "Negative boundary fixture"])]),
    ["OR", text => upsertTableRow(text, "Artefacts", 0, "OR", ["OR", "", "done", "Negative boundary fixture"])],
  ]) {
    reset(); writeFileSync(f.state, sealRunState(root, change(f.readState().content)));
    const candidate = f.proposal(), before = tree();
    assert.equal(previewSourceRevision(root, candidate.input).outcome, "rejected", name); assert.deepEqual(tree(), before);
  }
  for (const change of [value => value.target_id = byteDigest(Buffer.from("foreign")), value => value.expected_revision_id = randomUUID(),
    value => value.impact_assessment.analyses[0].disposition = "retain", value => value.impact_assessment.unresolved.push("Unknown impact")]) {
    reset(); const candidate = f.proposal(); change(candidate.value); writeFileSync(join(root, candidate.input.evidence), JSON.stringify(candidate.value));
    const before = tree(); assert.equal(previewSourceRevision(root, candidate.input).outcome, "rejected"); assert.deepEqual(tree(), before);
  }
  reset(); const stale = prepare(); writeFileSync(join(root, stale.input.evidence), JSON.stringify({ ...stale.value, intended_change: "Changed after preview" }));
  const unchanged = tree(); assert.equal(applySourceRevision(root, stale.input).reason, "revision_preview_stale"); assert.deepEqual(tree(), unchanged);
  reset(); const draftChanged = prepare(); writeFileSync(f.file("SD.md"), readFileSync(f.file("SD.md"), "utf8") + "Changed without recording\n");
  assert.equal(applySourceRevision(root, draftChanged.input).reason, "seal_invalid");

  // Real process exits cover both pre-commit rollback and post-commit completion.
  for (const stage of ["archive_file", "archive_published", "run", "backlog"]) {
    reset(); const candidate = prepare(), previous = f.revision();
    const interrupted = await worker(candidate.input, stage); assert.equal(interrupted.code, 71, interrupted.stderr);
    assert.equal(inspectSourceRevision(root, candidate.input).outcome, "recovery_required");
    assert.equal(evaluateGateCheck(root, { runId: f.runId }).status, "blocked");
    const recovered = recoverSourceRevision(root, candidate.input); assert.equal(recovered.outcome, "recovered", JSON.stringify(recovered));
    assert.equal(runSealState(root, f.readState().content).status, "valid");
    if (f.revision() === previous) assert.equal(evaluateGateCheck(root, { runId: f.runId }).current_gate, "SD");
    else { assert.equal(evaluateGateCheck(root, { runId: f.runId }).current_gate, "UR"); assert.equal(validateRevisionHistory(root, readSourceRevisions(f.readState().content).receipts[0]), true); }
  }
  // Early UR through the bounded v2 command uses the same real atomic checkpoints.
  // Process interruption is not physical power-loss or a native human decision.
  for (const stage of [...intentStages, ...archiveStages, ...commitStages]) {
    reset(); const candidate = f.proposal(), previous = f.readState().content;
    const payload = { source_gate: "UR", proposal: { path: candidate.input.evidence, digest: artefactFileDigest(root, candidate.input.evidence) } };
    const envelope = { schema_version: "1", presentation_language: "en", working_directory: root, target_source: "explicit_target", primary_target: root,
      target_id: resolveControlCommandTarget(root).target_id, run_id: f.runId, expected_revision_id: f.revision(), operation_id: candidate.input.operationId, assurance: "cooperative_local" };
    const service = createCoreServices().command;
    const preview = service("agdf_revise", { ...envelope, command: { kind: "source_revision.preview", payload } });
    assert.equal(preview.outcome, "accepted", JSON.stringify(preview));
    const input = { ...envelope, command: { kind: "source_revision.apply", payload: { ...payload,
      preview_digest: preview.family_result.preview_digest, confirmation: preview.family_result.confirmation_selector } } };
    const program = `import {createRunCommandService} from ${JSON.stringify(new URL("../lib/control-state/run-command-service.js", import.meta.url).href)};
      createRunCommandService({checkpoint(point){if(point===process.argv[2])process.exit(71)}})("agdf_revise",JSON.parse(process.argv[1]));`;
    const interrupted = await new Promise((resolvePromise, reject) => {
      const child = spawn(process.execPath, ["--input-type=module", "-e", program, JSON.stringify(input), stage]);
      let stderr = ""; child.stderr.on("data", chunk => stderr += chunk); child.on("error", reject);
      child.on("exit", code => resolvePromise({ code, stderr }));
    });
    assert.equal(interrupted.code, 71, stage + ": " + interrupted.stderr);
    if (!beforeIntent(stage) && stage !== "retired") {
      const pending = readPendingSourceRevisionJournal(root, f.runId);
      const recovery = { ...input, expected_revision_id: f.revision(), command: { kind: "source_revision.recover", payload: {
        ...payload, recovery_revision_id: f.revision(), pending_digest: digest(canonicalJson(pending)) } } };
      const result = service("agdf_revise", recovery);
      assert.equal(result.outcome, "accepted", stage + ": " + JSON.stringify(result));
    }
    if (beforeRunCommit(stage)) assert.equal(f.readState().content, previous, stage);
    const replay = service("agdf_revise", input);
    assert.equal(replay.outcome, beforeRunCommit(stage) ? "accepted" : "already_applied", stage);
    const current = f.readState().content, receipts = readSourceRevisions(current).receipts;
    assert.equal(receipts.length, 1); assert.equal(receipts[0].schema_version, "2");
    assert.equal(validateRevisionHistory(root, receipts[0]), true, stage);
    assert.equal(runSealState(root, current).status, "valid", stage);
    assert.deepEqual(readApprovalOperations(current).receipts, readApprovalOperations(previous).receipts, stage);
    console.log("SCN-022 early UR v2 checkpoint passed: " + stage);
  }
  reset(); const first = prepare(), second = prepare(); const concurrent = await Promise.all([worker(first.input), worker(second.input)]);
  assert.equal(concurrent.filter(row => row.value?.outcome === "reopened").length, 1, JSON.stringify(concurrent));
  assert.equal(readSourceRevisions(f.readState().content).receipts.length, 1);
  console.log("Early approved-UR revision: Core/CLI, history, fresh approval, unsupported boundaries, stale inputs, recovery and process concurrency passed (synthetic fixtures only).");
} finally { rmSync(temporary, { recursive: true, force: true }); }
