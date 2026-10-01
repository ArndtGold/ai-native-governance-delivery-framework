import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CONTROL_COMMAND_SCHEMA_VERSION, recordGateApprovalCommand, resolveControlCommandTarget } from "../lib/control-command.js";
import { executeApprovalCommand } from "../lib/control-state/approval-command.js";
import { approvalRequestDigest, canonicalJson, COOPERATIVE_ASSURANCE } from "../lib/control-state/approval-command-contract.js";
import { appendApprovalOperation, readApprovalOperations } from "../lib/control-state/approval-operations.js";
import { approvalRecord, approvalSeal, runSealState, sealRunState } from "../lib/control-state/run-seal.js";
import { parseRunState } from "../lib/control-state/run-state-parser.js";
import { reopenPrdRevision } from "../lib/control-state/run-revision.js";
import { recordRunRevision } from "../lib/control-state/run-recording.js";
import { assertRecoveryOperationsTrusted, withRunLock, writeRun, writeRunRecoveryLocked, unapproveRecoveryApprovals } from "../lib/control-state/run-state-writer.js";
import { evaluateGateCheck } from "../lib/control-evaluation/gate-check.js";
import { cliGitObservation } from "../lib/control-evaluation/git-observation.js";
import { approvalArgs, commandFixture, invoke, json, sourceCli } from "./support/control-command-fixture.js";

const dependencies = { evaluateGateCheck: (root, selection) => evaluateGateCheck(root, selection, cliGitObservation), packageVersion: "0.14.5" };
let checks = 0;
function scenario(name, action) { action(); checks++; console.log(`PASS ${name}`); }
const fixture = commandFixture();
const { root, command, runPath } = fixture;
const original = readFileSync(runPath, "utf8");
const unchanged = () => assert.equal(readFileSync(runPath, "utf8"), original);
try {
  scenario("SCN-002/009 closed schema and unsupported authority, zero mutation", () => {
    for (const extra of [{ role: "user" }, { seen: true }, { trusted: true }, { tool_provenance: "human" }]) {
      assert.equal(recordGateApprovalCommand(root, { ...command, ...extra }).reason, "command_schema_invalid"); unchanged(); console.log(`PASS SCN-002 undeclared ${JSON.stringify(extra)}`);
    }
    for (const hidden of [Object.defineProperty({ ...command }, "role", { value: "human" }), { ...command, [Symbol("authority")]: "human" }]) {
      assert.equal(recordGateApprovalCommand(root, hidden).reason, "command_schema_invalid"); unchanged();
    }
    for (const key of Object.keys(command)) {
      let reads = 0;
      const accessor = Object.defineProperty({ ...command }, key, { get() { reads++; throw new Error("caller accessor"); } });
      assert.equal(recordGateApprovalCommand(root, accessor).reason, "command_schema_invalid", key);
      assert.equal(reads, 0, key); unchanged(); console.log(`PASS SCN-002 accessor ${key} rejected without evaluation`);
    }
    for (const assurance of ["authenticated_human", "verified_human", "host_attested", "signed", "trusted", ""]) {
      assert.equal(recordGateApprovalCommand(root, { ...command, assurance }).reason, "unsupported_authority"); unchanged(); console.log(`PASS SCN-009 ${JSON.stringify(assurance)}`);
    }
    for (const patch of [{ schema_version: "2" }, { action: "present" }, { operation_id: "x" }, { run_id: "../foreign" },
      { expected_revision_id: null }, { presentation_id: undefined }]) {
      assert.equal(recordGateApprovalCommand(root, { ...command, ...patch }).outcome, "rejected"); unchanged(); console.log(`PASS SCN-002 malformed ${JSON.stringify(patch)}`);
    }
    assert.equal(recordGateApprovalCommand(root, null).outcome, "rejected"); unchanged();
    assert.equal(CONTROL_COMMAND_SCHEMA_VERSION, "1");
    assert.equal(json(sourceCli, approvalArgs(fixture, { ...command, assurance: "host_attested" }), 2).reason, "unsupported_authority"); unchanged();
  });
  scenario("SCN-007/008 read, present, derived and nonexact replies do not approve", () => {
    for (const response of ["revise", "decline", "cancel"]) {
      assert.equal(recordGateApprovalCommand(root, { ...command, response }).outcome, "rejected"); unchanged();
    }
    const report = json(sourceCli, ["gate-check", "--dir", root, "--run", command.run_id, "--json"]);
    assert.equal(report.missing_approval, "Approval: UR"); unchanged();
    for (const response of ["", "Ja", "Leg los", "Approval: PRD", "`Approval: UR`", "Zitat: Approval: UR"]) {
      assert.equal(recordGateApprovalCommand(root, { ...command, response }).outcome, "rejected", response); unchanged(); console.log(`PASS SCN-008 ${JSON.stringify(response)}`);
    }
  });
  scenario("SCN-011 exact target, revision and presentation bindings", () => {
    for (const patch of [{ target_id: `sha256:${"a".repeat(64)}` }, { expected_revision_id: randomUUID() }, { presentation_id: randomUUID() }, { gate: "PRD" }]) {
      assert.equal(recordGateApprovalCommand(root, { ...command, ...patch }).outcome, "rejected"); unchanged(); console.log(`PASS SCN-011 ${JSON.stringify(patch)}`);
    }
    assert.equal(resolveControlCommandTarget(`${root}/.`).target_id, command.target_id);
    const copied = mkdtempSync(join(tmpdir(), "agdf-command-moved-"));
    try {
      cpSync(root, copied, { recursive: true });
      assert.notEqual(resolveControlCommandTarget(copied).target_id, command.target_id);
      assert.equal(recordGateApprovalCommand(copied, command).reason, "target_binding_mismatch");
    } finally { rmSync(copied, { recursive: true, force: true }); }
  });
  scenario("SCN-015 live and unknown locks are retained and never succeed", () => {
    withRunLock(runPath, () => {
      const result = recordGateApprovalCommand(root, command);
      assert.equal(result.outcome, "retryable_failure");
      assert.match(result.recovery, /identical command.*original operation UUID and payload/u); unchanged();
    });
    writeFileSync(`${runPath}.lock`, "unknown owner");
    const unknown = recordGateApprovalCommand(root, command);
    assert.equal(unknown.outcome, "recovery_required");
    assert.match(unknown.recovery, /lock owner.*do not infer approval/u);
    assert.equal(readFileSync(`${runPath}.lock`, "utf8"), "unknown owner");
    rmSync(`${runPath}.lock`); unchanged();
  });
  scenario("SCN-020 write checkpoints before rename leave no approval or receipt", () => {
    for (const point of ["temp_opened", "temp_written", "after_file_sync", "before_rename"]) {
      const result = executeApprovalCommand(root, command, { ...dependencies,
        checkpoint: (stage) => { if (stage === point) throw new Error("injected I/O fault"); } });
      assert.equal(result.outcome, "retryable_failure", point);
      assert.match(result.recovery, /identical command.*original operation UUID and payload/u); unchanged(); console.log(`PASS SCN-020 ${point}`);
      assert.equal(readApprovalOperations(original).present, false);
    }
  });
  scenario("SCN-012 final presentation validation under lock", () => {
    const result = executeApprovalCommand(root, command, { ...dependencies,
      checkpoint: (stage) => {
        if (stage === "before_final_validation") writeFileSync(fixture.urPath, `${readFileSync(fixture.urPath, "utf8")}Changed.\n`);
      } });
    assert.notEqual(result.outcome, "accepted");
    assert.equal(readApprovalOperations(readFileSync(runPath, "utf8")).present, false);
    // Undo only the test fixture mutation; the canonical run has never been rewritten.
    writeFileSync(fixture.urPath, readFileSync(fixture.urPath, "utf8").replace(/Changed\.\n$/u, "")); unchanged();
  });
  scenario("SCN-012 prepared presentation mutation is rejected at final validation", () => {
    const path = join(root, ".agdf/control/runs", command.run_id, "presentations", `${command.presentation_id}.json`);
    const bytes = readFileSync(path, "utf8");
    try {
      const result = executeApprovalCommand(root, command, { ...dependencies,
        checkpoint: (stage) => { if (stage === "before_final_validation") writeFileSync(path, "{}"); } });
      assert.equal(result.outcome, "rejected"); unchanged();
    } finally { writeFileSync(path, bytes); }
  });
  let accepted;
  scenario("SCN-001/003/004/010 one revision, atomic receipt and explicit cooperative result", () => {
    accepted = recordGateApprovalCommand(root, command);
    assert.equal(accepted.outcome, "accepted", JSON.stringify(accepted));
    assert.equal(accepted.effect.revision, Number(parseRunState(original).meta.revision) + 1);
    assert.equal(accepted.effect.previous_revision_id, command.expected_revision_id);
    assert.equal(accepted.current.revision_id, accepted.effect.resulting_revision_id);
    assert.equal(accepted.current.approval_status, "approved");
    assert.deepEqual(accepted.assurance, COOPERATIVE_ASSURANCE);
    assert.equal(accepted.observations.independent_human_proof, "unavailable");
    const content = readFileSync(runPath, "utf8");
    assert.equal(runSealState(root, content).status, "valid");
    assert.equal(readApprovalOperations(content).receipts.length, 1);
    assert.equal(readApprovalOperations(content).receipts[0].request_digest, approvalRequestDigest(command));
  });
  const approvedContent = readFileSync(runPath, "utf8");
  scenario("SCN-023/025 receipt version, row identity, effect and encoding validation", () => {
    const receipt = readApprovalOperations(approvedContent).receipts[0];
    const encoded = Buffer.from(canonicalJson(receipt)).toString("base64url");
    const variants = [
      { ...receipt, schema_version: "2" }, { ...receipt, role: "human" },
      { ...receipt, operation_id: randomUUID() }, { ...receipt, request_digest: `sha256:${"b".repeat(64)}` },
      { ...receipt, effect: { ...receipt.effect, resulting_revision_id: "missing" } },
      { ...receipt, effect: { ...receipt.effect, artefact_digest: null } },
      { ...receipt, assurance: { ...receipt.assurance, independent_human_proof: "verified" } },
    ];
    for (const [index, variant] of variants.entries()) {
      const malformed = approvedContent.replace(encoded, Buffer.from(canonicalJson(variant)).toString("base64url"));
      assert.equal(readApprovalOperations(malformed).valid, false);
      assert.equal(parseRunState(malformed).valid, false);
      assert.equal(runSealState(root, malformed).status, "invalid");
      console.log(`PASS SCN-025 invalid receipt subcase ${index}`);
    }
    const unsupported = approvedContent.replace("- schema_version: 1", "- schema_version: 2");
    assert.equal(readApprovalOperations(unsupported).valid, false);
    const row = approvedContent.split("\n").find((line) => line.startsWith(`| ${receipt.operation_id} |`));
    assert.equal(readApprovalOperations(approvedContent.replace(row, `${row}\n${row}`)).valid, false);
    assert.equal(readApprovalOperations(approvedContent.replace(encoded, "_w")).valid, false);
    const withoutReceipts = approvedContent.slice(0, approvedContent.indexOf("## Approval Operations"));
    writeFileSync(runPath, withoutReceipts);
    assert.equal(recordRunRevision(root, { runId: command.run_id, revisionId: accepted.effect.resulting_revision_id }).reason, "approvals_unrecorded");
    assert.equal(readFileSync(runPath, "utf8"), withoutReceipts);
    writeFileSync(runPath, approvedContent);
  });
  scenario("SCN-016/017 same request replays; changed bytes conflict without a revision", () => {
    const replay = recordGateApprovalCommand(root, { ...command });
    assert.equal(replay.outcome, "already_applied");
    assert.deepEqual(replay.effect, accepted.effect);
    assert.equal(readFileSync(runPath, "utf8"), approvedContent);
    assert.equal(recordGateApprovalCommand(root, { ...command, response: "Approval: UR\n" }).reason, "operation_payload_conflict");
    assert.equal(recordGateApprovalCommand(root, { ...command, operation_id: randomUUID() }).outcome, "rejected");
    assert.equal(readFileSync(runPath, "utf8"), approvedContent);
    assert.notEqual(approvalRequestDigest(command), approvalRequestDigest({ ...command, response: "Approval: UR\n" }));
  });
  scenario("SCN-018/019 historical effect survives revocation, current state is separately observed", () => {
    writeRun(runPath, unapproveRecoveryApprovals(approvedContent), accepted.effect.resulting_revision_id, { allowApprovalChange: true });
    const replay = recordGateApprovalCommand(root, command);
    assert.equal(replay.outcome, "already_applied");
    assert.deepEqual(replay.effect, accepted.effect);
    assert.equal(replay.current.approval_status, "missing");
    assert.notEqual(replay.current.revision_id, replay.effect.resulting_revision_id);
    assert.equal(readApprovalOperations(readFileSync(runPath, "utf8")).receipts.length, 1);
  });
  scenario("SCN-023/025 receipt corruption, deletion and seal tampering fail closed", () => {
    const content = readFileSync(runPath, "utf8"), revision = parseRunState(content).meta.revision_id;
    const operations = readApprovalOperations(content);
    const missing = content.split("\n").slice(0, operations.start).join("\n");
    assert.throws(() => writeRun(runPath, missing, revision, { allowApprovalChange: true }), /AGDF_APPROVAL_OPERATIONS_CHANGED/u);
    const duplicate = `${content}${content.slice(content.indexOf("## Approval Operations"))}`;
    assert.equal(parseRunState(duplicate).valid, false);
    assert.equal(runSealState(root, duplicate).status, "invalid");
    assert.throws(() => appendApprovalOperation(content, operations.receipts[0]), /AGDF_APPROVAL_OPERATIONS_INVALID/u);
    const corrupted = content.replace(/(\| operation_id \| request_digest \| )receipt/u, "$1unexpected");
    writeFileSync(runPath, corrupted);
    assert.equal(recordGateApprovalCommand(root, command).outcome, "recovery_required");
    assert.throws(() => assertRecoveryOperationsTrusted(corrupted), /AGDF_APPROVAL_OPERATIONS_UNTRUSTED/u);
    writeFileSync(runPath, content.replace(/- approval_seal: sha256:[a-f0-9]+/u, "- approval_seal: invalid"));
    assert.throws(() => assertRecoveryOperationsTrusted(readFileSync(runPath, "utf8")), /AGDF_APPROVAL_OPERATIONS_UNTRUSTED/u);
    writeFileSync(runPath, content);
    writeFileSync(join(root, ".agdf/control/runs", command.run_id, "RUN_STEP_PENDING.json"), "{}");
    assert.equal(recordGateApprovalCommand(root, command).outcome, "recovery_required");
    rmSync(join(root, ".agdf/control/runs", command.run_id, "RUN_STEP_PENDING.json"));
  });
  scenario("SCN-018 receipt-preserving recovery never restores approval", () => {
    const content = readFileSync(runPath, "utf8");
    const invalidContent = content.replace(/- content_seal: sha256:[a-f0-9]+/u, "- content_seal: invalid");
    assertRecoveryOperationsTrusted(invalidContent);
    writeFileSync(runPath, invalidContent);
    withRunLock(runPath, () => writeRunRecoveryLocked(runPath, unapproveRecoveryApprovals(invalidContent), {
      expectedContent: invalidContent, expectedRevisionId: parseRunState(invalidContent).meta.revision_id,
      nextRevisionId: randomUUID(), updatedAt: new Date().toISOString(),
    }));
    const replay = recordGateApprovalCommand(root, command);
    assert.equal(replay.outcome, "already_applied");
    assert.equal(replay.current.approval_status, "missing");
    assert.equal(readApprovalOperations(readFileSync(runPath, "utf8")).receipts.length, 1);
  });
  scenario("SCN-022 postrename failure exposes canonical effect; retry acknowledges without writing", () => {
    const current = readFileSync(runPath, "utf8"), meta = parseRunState(current).meta;
    const presentation = json(sourceCli, ["run-present", "--dir", root, "--run", command.run_id, "--gate", "UR", "--revision", meta.revision_id]);
    const second = { ...command, operation_id: randomUUID(), expected_revision_id: meta.revision_id, presentation_id: presentation.presentation_id };
    const failure = executeApprovalCommand(root, second, { ...dependencies,
      checkpoint: (stage) => { if (stage === "after_rename") throw new Error("directory sync failed"); } });
    assert.equal(failure.outcome, "recovery_required");
    assert.ok(failure.effect);
    const committed = readFileSync(runPath, "utf8");
    const failedAcknowledgement = executeApprovalCommand(root, second, { ...dependencies, flush: () => { throw new Error("sync failed again"); } });
    assert.equal(failedAcknowledgement.outcome, "recovery_required");
    assert.equal(readFileSync(runPath, "utf8"), committed);
    const replay = recordGateApprovalCommand(root, second);
    assert.equal(replay.outcome, "already_applied");
    assert.deepEqual(replay.effect, failure.effect);
    assert.equal(readFileSync(runPath, "utf8"), committed);
  });
  scenario("SCN-018 bounded PRD supersession preserves UR receipt and never reapproves PRD", () => {
    const current = readFileSync(runPath, "utf8"), revision = parseRunState(current).meta.revision_id;
    const candidate = current.replace(/- current_gate:.*$/mu, "- current_gate: SD")
      .replace(/- mode:.*$/mu, "- mode: structured_delivery")
      .replace(/^\| Brownfield Review \|.*$/mu, "| Brownfield Review |  | done | fixture |");
    const routed = candidate.replace(/## Mode\/? ?Slice Decision[\s\S]*?(?=\n## |$)/u, "## Mode / Slice Decision\n\n- decision: structured_delivery\n- required_next_gate: PRD\n- scope_reason: test fixture\n- evidence: fixture\n");
    const updated = routed
      .replace(/^\| PRD \| missing \|.*$/mu, "| PRD | approved | Approval: PRD |")
      .replace(/^\| SD \|.*$/mu, "| SD |  | missing |  |");
    writeRun(runPath, updated, revision, { allowApprovalChange: true });
    const fresh = parseRunState(readFileSync(runPath, "utf8")).meta.revision_id;
    const reopened = reopenPrdRevision(root, { runId: command.run_id, revisionId: fresh });
    assert.equal(reopened.outcome, "reopened", JSON.stringify(reopened));
    const replay = recordGateApprovalCommand(root, command);
    assert.equal(replay.outcome, "already_applied");
    assert.match(readFileSync(runPath, "utf8"), /^\| PRD \| missing \|/mu);
    assert.equal(readApprovalOperations(readFileSync(runPath, "utf8")).receipts.length, 2);
  });
  scenario("SCN-024 legacy seal bytes and CLI rejection/assurance remain compatible", () => {
    const hash = createHash("sha256").update(["agdf-approval-seal/1", approvalRecord(original)].join("\n"), "utf8").digest("hex");
    assert.equal(approvalSeal(original), `sha256:${hash}`);
    const legacy = commandFixture({ runId: "legacy" });
    try {
      const args = approvalArgs(legacy).slice(0, -4);
      const result = json(sourceCli, args);
      assert.equal(result.outcome, "approved");
      assert.deepEqual(result.assurance, COOPERATIVE_ASSURANCE);
      assert.equal(readApprovalOperations(readFileSync(legacy.runPath, "utf8")).present, false);
      assert.equal(json(sourceCli, [...args, "--assurance", "authenticated_human"], 2).reason, "unsupported_authority");
    } finally { legacy.cleanup(); }
  });
  scenario("SCN-011 symlink run paths are rejected before mutation", () => {
    const content = readFileSync(runPath, "utf8");
    rmSync(runPath); writeFileSync(`${runPath}.real`, content); symlinkSync(`${runPath}.real`, runPath);
    assert.equal(recordGateApprovalCommand(root, command).reason, "run_path_invalid");
    assert.equal(readFileSync(`${runPath}.real`, "utf8"), content);
  });
} finally { fixture.cleanup(); }
console.log(`Control command tests passed: ${checks} scenario groups.`);

for (const point of ["after_directory_sync", "before_response", "before_lock_release", "after_lock_release"]) {
  const fixture = commandFixture();
  try {
    const result = executeApprovalCommand(fixture.root, fixture.command, { ...dependencies,
      checkpoint: (stage) => { if (stage === point) throw new Error("postcommit fault"); } });
    assert.equal(result.outcome, "recovery_required", point);
    assert.ok(result.effect); assert.equal(result.observations.durability, "unconfirmed");
    const committed = readFileSync(fixture.runPath, "utf8");
    const replay = recordGateApprovalCommand(fixture.root, fixture.command);
    assert.equal(replay.outcome, "already_applied"); assert.deepEqual(replay.effect, result.effect);
    assert.equal(readFileSync(fixture.runPath, "utf8"), committed);
    console.log(`PASS SCN-020/022 postcommit ${point} acknowledged without another revision`);
  } finally { fixture.cleanup(); }
}
