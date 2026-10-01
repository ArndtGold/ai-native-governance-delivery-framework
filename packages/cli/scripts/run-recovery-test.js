import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applyRunRecovery, inspectRunRecovery, previewRunRecovery } from "../lib/control-state/run-recovery.js";
import { canonicalRunText, runSealState, sealRunState } from "#agdf-core/control-state/run-seal.js";
import { recordRunRevision } from "#agdf-core/control-state/run-recording.js";
import { withRunLock, writeRunRecoveryLocked } from "#agdf-core/control-state/run-state-writer.js";

const root = mkdtempSync(join(tmpdir(), "agdf-run-recovery-"));
const runId = "recovery-fixture";
const runDir = join(root, ".agdf", "control", "runs", runId);
  const statePath = join(runDir, "RUN_STATE.md");
const sentinelPath = join(root, ".agdf", "control", "runs", "nonselected", "RUN_STATE.md");
const source = `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: ${runId}
- lifecycle: active
- revision: 1
- revision_id: 11111111-1111-4111-8111-111111111111
- mode: structured_delivery
- current_gate: CD+Tests
- next_allowed_action: implement code
- decision: in_progress
- owner: test

## Objective

Recovery fixture.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Old state. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Implement code |
| What is explicitly forbidden right now? | none |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | approved | Approval: SD |
| TP | approved | Approval: TP |
| QA | missing | |
| UAT | missing | |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR |  | missing | |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Fixture | test | Recovery | direct |
`;

try {
  mkdirSync(runDir, { recursive: true });
  mkdirSync(join(root, ".agdf", "control", "runs", "nonselected"), { recursive: true });
  writeFileSync(sentinelPath, "non-selected fixture bytes\n");
  const sentinelBefore = readFileSync(sentinelPath);
  writeFileSync(statePath, source);
  assert.equal(inspectRunRecovery(root, runId).seal_status, "unsealed");
  const cli = join(import.meta.dirname, "..", "bin", "create-agdf.js");
  const cliInspection = execFileSync(process.execPath, [cli, "run-recovery", "--dir", root,
    "--run", runId, "--action", "inspect"], { encoding: "utf8" });
  assert.equal(JSON.parse(cliInspection).run_id, runId);
  assert.equal(recordRunRevision(root, { runId, revisionId: "11111111-1111-4111-8111-111111111111" }).reason, "seal_invalid");
  assert.throws(() => withRunLock(statePath, () => writeRunRecoveryLocked(statePath,
    source.replace("Recovery fixture.", "changed objective"), {
      expectedContent: source, expectedRevisionId: "11111111-1111-4111-8111-111111111111",
      nextRevisionId: "22222222-2222-4222-8222-222222222222",
    })), /AGDF_RUN_RECOVERY_CANDIDATE_INVALID/);
  assert.equal(readFileSync(statePath, "utf8"), source, "recovery writer must reject a non-canonical candidate");

  const before = readFileSync(statePath, "utf8");
  const preview = previewRunRecovery(root, runId);
  assert.equal(readFileSync(statePath, "utf8"), before, "preview must not mutate RUN_STATE.md");
  assert.deepEqual(preview.approvals_to_invalidate, ["UR", "PRD", "SD", "TP", "QA", "UAT"]);
  assert.equal(preview.next_gate, "UR");
  assert.throws(() => applyRunRecovery(root, { runId, previewId: preview.preview_id, confirmation: "wrong" }), /AGDF_RECOVERY_CONFIRMATION_REQUIRED/);
  assert.equal(readFileSync(statePath, "utf8"), before, "bad confirmation must not mutate RUN_STATE.md");
  const lockPath = `${statePath}.lock`;
  writeFileSync(lockPath, `${JSON.stringify({ schema_version: 1, pid: process.pid, token: "11111111-1111-4111-8111-111111111111", started_at: new Date().toISOString() })}\n`);
  assert.throws(() => applyRunRecovery(root, { runId, previewId: preview.preview_id, confirmation: preview.confirmation }), /AGDF_RUN_WRITE_LOCKED/);
  unlinkSync(lockPath);
  assert.equal(readFileSync(statePath, "utf8"), before, "an occupied writer lock must block before the journal moves to applying");

  const result = applyRunRecovery(root, { runId, previewId: preview.preview_id, confirmation: preview.confirmation });
  assert.equal(result.outcome, "recovered");
  assert.equal(result.revision, "2");
  assert.equal(result.seal_status, "valid");
  assert.equal(result.next_gate, "UR");
  const after = readFileSync(statePath, "utf8");
  assert.match(after, /\| UR \| missing \|  \|/u);
  assert.match(after, /^- current_gate: UR$/mu);
  assert.match(after, /\| What is approved\? \| Nothing yet\. \|/u);
  assert.match(after, /\| What is missing\? \| Exact Approval: UR\. \|/u);
  assert.equal(runSealState(root, after).status, "valid");
  assert.deepEqual(readFileSync(sentinelPath), sentinelBefore, "recovery must not alter non-selected Run States");
  assert.equal(applyRunRecovery(root, { runId, previewId: preview.preview_id, confirmation: preview.confirmation }).outcome, "already_recovered");

  const tamperId = "tamper-fixture";
  const tamperDir = join(root, ".agdf", "control", "runs", tamperId);
  mkdirSync(tamperDir);
  const tamperStatePath = join(tamperDir, "RUN_STATE.md");
  const tamperState = source.replaceAll(runId, tamperId);
  writeFileSync(tamperStatePath, tamperState);
  const tamperPreview = previewRunRecovery(root, tamperId);
  const journalPath = join(root, tamperPreview.journal);
  const journal = JSON.parse(readFileSync(journalPath, "utf8"));
  journal.next_gate = "forged";
  writeFileSync(journalPath, `${JSON.stringify(journal, null, 2)}\n`);
  assert.throws(() => applyRunRecovery(root, { runId: tamperId,
    previewId: tamperPreview.preview_id, confirmation: tamperPreview.confirmation }), /AGDF_RECOVERY_PREVIEW_INVALID/);
  assert.equal(readFileSync(tamperStatePath, "utf8"), tamperState, "tampered preview must block before Run State write");

  const timestampPreview = previewRunRecovery(root, tamperId);
  const timestampPath = join(root, timestampPreview.journal);
  const timestampJournal = JSON.parse(readFileSync(timestampPath, "utf8"));
  assert.equal(timestampJournal.preview_format_version, 2);
  timestampJournal.created_at = "2000-01-01T00:00:00.000Z";
  writeFileSync(timestampPath, `${JSON.stringify(timestampJournal, null, 2)}\n`);
  assert.throws(() => applyRunRecovery(root, { runId: tamperId,
    previewId: timestampPreview.preview_id, confirmation: timestampPreview.confirmation }), /AGDF_RECOVERY_PREVIEW_INVALID/);
  assert.equal(readFileSync(tamperStatePath, "utf8"), tamperState, "the preview must bind the activity timestamp before writing");

  const phaseId = "unknown-phase";
  const phaseDir = join(root, ".agdf", "control", "runs", phaseId);
  mkdirSync(phaseDir);
  const phaseState = source.replaceAll(runId, phaseId);
  writeFileSync(join(phaseDir, "RUN_STATE.md"), phaseState);
  const phasePreview = previewRunRecovery(root, phaseId);
  const phaseJournalPath = join(root, phasePreview.journal);
  const phaseJournal = JSON.parse(readFileSync(phaseJournalPath, "utf8"));
  phaseJournal.phase = "unknown";
  writeFileSync(phaseJournalPath, `${JSON.stringify(phaseJournal, null, 2)}\n`);
  assert.throws(() => applyRunRecovery(root, { runId: phaseId,
    previewId: phasePreview.preview_id, confirmation: phasePreview.confirmation }), /AGDF_RECOVERY_JOURNAL_PHASE_INVALID/);
  assert.equal(readFileSync(join(phaseDir, "RUN_STATE.md"), "utf8"), phaseState, "unknown journal phase must remain fail-closed");

  for (const boundary of ["beforeRunWrite", "afterRunWrite", "beforeJournalCommit"]) {
    const resumeId = `resume-${boundary.toLowerCase()}`;
    const resumeDir = join(root, ".agdf", "control", "runs", resumeId);
    mkdirSync(resumeDir);
    const resumeStatePath = join(resumeDir, "RUN_STATE.md");
    const resumeState = source.replaceAll(runId, resumeId);
    writeFileSync(resumeStatePath, resumeState);
    const resumePreview = previewRunRecovery(root, resumeId);
    const recovery = { runId: resumeId, previewId: resumePreview.preview_id, confirmation: resumePreview.confirmation };
    assert.throws(() => applyRunRecovery(root, recovery, {
      [boundary]() { throw new Error("INJECTED_FILESYSTEM_INTERRUPTION"); },
    }), /INJECTED_FILESYSTEM_INTERRUPTION/);
    if (boundary === "beforeRunWrite") assert.equal(readFileSync(resumeStatePath, "utf8"), resumeState);
    else assert.match(readFileSync(resumeStatePath, "utf8"), /^- revision: 2$/mu);
    const resumed = applyRunRecovery(root, recovery);
    assert.equal(resumed.outcome, "recovered", `${boundary}: recovery resumes the actual interrupted transaction`);
    assert.equal(resumed.revision, "2", "interrupted recovery must not write a second revision");
    const finalBytes = readFileSync(resumeStatePath);
    assert.equal(applyRunRecovery(root, recovery).outcome, "already_recovered");
    assert.deepEqual(readFileSync(resumeStatePath), finalBytes);
    assert.deepEqual(readFileSync(sentinelPath), sentinelBefore);
  }

  const staleId = "stale-fixture";
  const staleDir = join(root, ".agdf", "control", "runs", staleId);
  mkdirSync(staleDir);
  writeFileSync(join(staleDir, "RUN_STATE.md"), source.replaceAll(runId, staleId));
  const stale = previewRunRecovery(root, staleId);
  writeFileSync(join(staleDir, "RUN_STATE.md"), `${readFileSync(join(staleDir, "RUN_STATE.md"), "utf8")}\n`);
  assert.throws(() => applyRunRecovery(root, { runId: staleId, previewId: stale.preview_id, confirmation: stale.confirmation }), /AGDF_STALE_RUN_REVISION/);

  const artifactId = "artifact-stale";
  const artifactRunDir = join(root, ".agdf", "control", "runs", artifactId);
  const artifactDir = join(root, ".agdf", "control", "artefacts", artifactId);
  mkdirSync(artifactRunDir);
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(join(artifactDir, "UR.md"), "# Original\n");
  const artifactState = source.replaceAll(runId, artifactId)
    .replace("| UR |  | missing | |", `| UR | .agdf/control/artefacts/${artifactId}/UR.md | draft | |`);
  const artifactStatePath = join(artifactRunDir, "RUN_STATE.md");
  writeFileSync(artifactStatePath, artifactState);
  const artifactPreview = previewRunRecovery(root, artifactId);
  writeFileSync(join(artifactDir, "UR.md"), "# Changed after preview\n");
  assert.throws(() => applyRunRecovery(root, { runId: artifactId,
    previewId: artifactPreview.preview_id, confirmation: artifactPreview.confirmation }), /AGDF_STALE_RUN_REVISION/);
  assert.equal(readFileSync(artifactStatePath, "utf8"), artifactState, "artifact conflict must block before Run State write");

  const linkId = "symlink-artifact";
  const linkRunDir = join(root, ".agdf", "control", "runs", linkId);
  const linkArtifactDir = join(root, ".agdf", "control", "artefacts", linkId);
  mkdirSync(linkRunDir);
  mkdirSync(linkArtifactDir, { recursive: true });
  writeFileSync(join(linkArtifactDir, "real.md"), "# Safe target\n");
  symlinkSync("real.md", join(linkArtifactDir, "alias.md"));
  const linkState = source.replaceAll(runId, linkId)
    .replace("| UR |  | missing | |", `| UR | .agdf/control/artefacts/${linkId}/alias.md | draft | |`);
  const linkStatePath = join(linkRunDir, "RUN_STATE.md");
  writeFileSync(linkStatePath, linkState);
  assert.throws(() => previewRunRecovery(root, linkId), /AGDF_RECOVERY_ARTEFACT_PATH_INVALID/);
  assert.equal(readFileSync(linkStatePath, "utf8"), linkState, "symlink artefact must block before Run State write");

  for (const status of ["missing", "pending", "done", "approved"]) {
    const plannedId = `planned-${status}`;
    const plannedDir = join(root, ".agdf", "control", "runs", plannedId);
    mkdirSync(plannedDir);
    const file = `.agdf/control/artefacts/${plannedId}/future.md`;
    mkdirSync(join(root, ".agdf", "control", "artefacts", plannedId), { recursive: true });
    const plannedSource = source.replaceAll(runId, plannedId)
      .replace("| UR |  | missing | |", `| UR | ${file} | ${status} | Future output |`);
    const plannedPath = join(plannedDir, "RUN_STATE.md");
    writeFileSync(plannedPath, plannedSource);
    if (["done", "approved"].includes(status)) {
      assert.throws(() => previewRunRecovery(root, plannedId), /AGDF_RECOVERY_ARTEFACT_MISSING/);
      continue;
    }
    const planned = previewRunRecovery(root, plannedId);
    assert.equal(planned.source_artefacts[0].planned, true);
    const applied = applyRunRecovery(root, { runId: plannedId, previewId: planned.preview_id, confirmation: planned.confirmation });
    assert.equal(applied.seal_status, "valid");
    assert.equal(applied.next_gate, "UR");
    const recovered = readFileSync(plannedPath, "utf8");
    assert.ok(recovered.includes(`| UR | ${file} | ${status} |`), "declared output must remain pending");
    writeFileSync(join(root, file), "new output\n");
    assert.equal(runSealState(root, recovered).status, "content_changed", "future output still belongs to the integrity snapshot");
  }

  const plannedRaceId = "planned-race";
  const plannedRaceDir = join(root, ".agdf", "control", "runs", plannedRaceId);
  const plannedRaceFile = `.agdf/control/artefacts/${plannedRaceId}/future.md`;
  mkdirSync(plannedRaceDir);
  mkdirSync(join(root, ".agdf", "control", "artefacts", plannedRaceId), { recursive: true });
  const plannedRaceSource = source.replaceAll(runId, plannedRaceId)
    .replace("| UR |  | missing | |", `| UR | ${plannedRaceFile} | pending | |`);
  writeFileSync(join(plannedRaceDir, "RUN_STATE.md"), plannedRaceSource);
  const plannedRacePreview = previewRunRecovery(root, plannedRaceId);
  writeFileSync(join(root, plannedRaceFile), "appeared after preview\n");
  assert.throws(() => applyRunRecovery(root, { runId: plannedRaceId,
    previewId: plannedRacePreview.preview_id, confirmation: plannedRacePreview.confirmation }), /AGDF_STALE_RUN_REVISION/);
  unlinkSync(join(root, plannedRaceFile));
  symlinkSync(join(root, "outside-missing.md"), join(root, plannedRaceFile));
  assert.throws(() => previewRunRecovery(root, plannedRaceId), /AGDF_RECOVERY_ARTEFACT_MISSING|AGDF_RECOVERY_ARTEFACT_PATH_INVALID/);


  const completedId = "completed-run";
  const completedDir = join(root, ".agdf", "control", "runs", completedId);
  mkdirSync(completedDir);
  writeFileSync(join(completedDir, "RUN_STATE.md"), source.replaceAll(runId, completedId).replace("- lifecycle: active", "- lifecycle: completed"));
  assert.throws(() => inspectRunRecovery(root, completedId), /AGDF_RECOVERY_LIFECYCLE_UNSUPPORTED/);

  const cliRunId = "cli-fixture";
  const cliRunDir = join(root, ".agdf", "control", "runs", cliRunId);
  mkdirSync(cliRunDir);
  writeFileSync(join(cliRunDir, "RUN_STATE.md"), source.replaceAll(runId, cliRunId));
  const cliPreview = JSON.parse(execFileSync(process.execPath, [cli, "run-recovery", "--dir", root,
    "--run", cliRunId, "--action", "preview"], { encoding: "utf8" }));
  const cliApplied = JSON.parse(execFileSync(process.execPath, [cli, "run-recovery", "--dir", root,
    "--run", cliRunId, "--action", "apply", "--preview-id", cliPreview.preview_id,
    "--recovery-confirmation", cliPreview.confirmation], { encoding: "utf8" }));
  assert.equal(cliApplied.outcome, "recovered", "CLI must apply only the exact returned confirmation");
  console.log("run recovery tests passed");
} finally {
  rmSync(root, { recursive: true, force: true });
}
