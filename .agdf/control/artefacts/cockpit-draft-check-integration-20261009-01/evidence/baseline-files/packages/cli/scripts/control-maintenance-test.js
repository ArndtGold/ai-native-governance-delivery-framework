import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, unlinkSync, cpSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runControlMaintenance } from "../lib/control-maintenance/service.js";
import { inspectControlMigration } from "../lib/install-setup/control-migration.js";
import { controlCounts, assertMaintenanceResult, maintenanceExitCode, maintenanceResult } from "#agdf-core/control-maintenance/contract.js";
import { selectControlMaintenance, selectControlMigration, selectControlRepair } from "../lib/control-maintenance/interaction.js";
import { renderMaintenanceResult } from "#agdf-core/control-maintenance/presentation.js";
import { runSealState } from "#agdf-core/control-state/run-seal.js";
import { repository, addRun, treeDigest, git } from "./control-maintenance-fixtures.js";

const base = mkdtempSync(join(tmpdir(), "agdf-maintenance-"));
try {
  const absent = repository(base, "absent", { scaffold: false });
  const current = repository(base, "current");
  addRun(current, "current", { sealed: true });
  const legacy = repository(base, "legacy");
  const path = addRun(legacy, "old");
  const baseline = treeDigest(legacy);
  for (const root of [absent, current, legacy]) {
    const report = await runControlMaintenance(root);
    assert.deepEqual(report.compatibility, inspectControlMigration(root));
    assert.deepEqual(report.counts, controlCounts(report.compatibility));
    assert.equal(report.operation, "inspect");
  }
  assert.equal(treeDigest(legacy), baseline);
  assert.throws(() => assertMaintenanceResult({}), /INVALID/);
  assert.throws(() => assertMaintenanceResult({ ...( { schema_version: 1, target: legacy, operation: "inspect", authorizes: false,
    inspection_state: "complete", maintenance_outcome: "not_started", diagnostics: [], compatibility: inspectControlMigration(current), counts: controlCounts(inspectControlMigration(current)) }) }), /TARGET_MISMATCH/);
  for (const language of ["en", "de", "fr-CA"]) {
    const report = await runControlMaintenance(legacy);
    for (const values of [["3", "3", "bad", "2"], [""], [null]]) {
      const choices = [...values], output = [];
      assert.equal(await selectControlMaintenance(report.compatibility, { language, readChoice: async () => choices.shift(), write: (text) => output.push(text) }), "skip");
      assert.ok(output[0].includes("[1]") && output[0].includes("[2]") && output[0].includes("[3]"));
      assert.equal(treeDigest(legacy), baseline);
    }
    for (const status of ["absent", "current", "migration_required", "repair_required"]) {
      assert.ok(renderMaintenanceResult({ ...report, compatibility: { ...report.compatibility, status } }, { language, details: true }).includes(legacy));
    }
  }
  const skipped = await runControlMaintenance(legacy, { guided: true, chooseMaintenance: () => "skip", confirmMigration: () => { throw new Error("unexpected"); }, confirmRepair: () => { throw new Error("unexpected"); } });
  assert.equal(skipped.maintenance_outcome, "deferred");
  assert.equal(treeDigest(legacy), baseline);
  const otherBefore = treeDigest(current);
  const original = readFileSync(path, "utf8");
  const applied = await runControlMaintenance(legacy, { guided: true, chooseMaintenance: () => "start", confirmMigration: (plan) => {
    assert.equal(plan.target, legacy); assert.equal(plan.runs.length, 1); assert.equal(treeDigest(legacy), baseline); return "migrate";
  }, confirmRepair: () => { throw new Error("unexpected repair"); } });
  assert.equal(applied.maintenance_outcome, "applied");
  assert.equal(applied.compatibility.status, "current");
  assert.equal(runSealState(legacy, readFileSync(path, "utf8")).status, "valid");
  const backup = JSON.parse(readFileSync(join(legacy, applied.compatibility.changes[0].backup)));
  assert.equal(backup.source_content, original);
  assert.equal(treeDigest(current), otherBefore);
  const repeatedBefore = treeDigest(legacy);
  const repeated = await runControlMaintenance(legacy, { guided: true });
  assert.equal(repeated.compatibility.changes.length, 0);
  assert.equal(treeDigest(legacy), repeatedBefore);

  // Mixed legacy migration and actual original restoration through the direct shared service.
  const mixed = repository(base, "mixed root");
  const artefact = ".agdf/control/artefacts/lost/UR.md";
  mkdirSync(join(mixed, ".agdf/control/artefacts/lost"), { recursive: true });
  writeFileSync(join(mixed, artefact), "Original requirement\n");
  const lost = addRun(mixed, "lost", { transform: (text) => text.replace("| UR |  | missing |", `| UR | ${artefact} | ready |`)
    .replace("| UR | missing |", "| UR | approved | Approval: UR") });
  git(mixed, "init", "-q"); git(mixed, "add", ".agdf"); git(mixed, "commit", "-qm", "Original fixture");
  unlinkSync(join(mixed, artefact));
  addRun(mixed, "old");
  const mixedBefore = treeDigest(mixed);
  const outcome = await runControlMaintenance(mixed, { guided: true, chooseMaintenance: () => "start", confirmMigration: () => "migrate", confirmRepair: (plan) => {
    assert.equal(plan.items[0].available, true); assert.equal(plan.target, mixed); return "repair";
  } });
  assert.equal(outcome.compatibility.status, "current");
  assert.equal(outcome.maintenance_outcome, "applied");
  assert.equal(outcome.compatibility.changes.length, 1);
  assert.equal(outcome.compatibility.repair.items[0].outcome, "repaired");
  assert.equal(readFileSync(join(mixed, artefact), "utf8"), "Original requirement\n");
  assert.match(readFileSync(lost, "utf8"), /\| UR \| missing \|/u);
  assert.doesNotMatch(JSON.stringify(outcome), /"(?:source_content|candidate_content|bytes)"/u);
  assert.notEqual(treeDigest(mixed), mixedBefore);

  const noSource = repository(base, "no source");
  addRun(noSource, "lost", { transform: (text) => text.replace("| UR |  | missing |", "| UR | .agdf/control/artefacts/lost/UR.md | ready |") });
  const noSourceBefore = treeDigest(noSource);
  const unresolved = await runControlMaintenance(noSource, { guided: true, chooseMaintenance: () => "start", confirmMigration: () => "migrate", confirmRepair: () => "skip" });
  assert.equal(unresolved.maintenance_outcome, "needs_input");
  assert.equal(unresolved.compatibility.status, "repair_required");
  assert.equal(treeDigest(noSource), noSourceBefore);
  addRun(noSource, "eligible");
  const partial = await runControlMaintenance(noSource, { guided: true, chooseMaintenance: () => "start", confirmMigration: () => "migrate", confirmRepair: () => "skip" });
  assert.equal(partial.maintenance_outcome, "partial");
  assert.equal(partial.compatibility.changes.length, 1);
  assert.equal(partial.counts.repair, 1);
  assert.equal(maintenanceExitCode(partial), 2);
  for (const language of ["en", "de", "fr-CA"]) {
    for (const report of [applied, partial, unresolved, skipped, maintenanceResult(noSource, null, { diagnostic: "test-unavailable" })]) {
      const text = renderMaintenanceResult(report, { language });
      assert.ok(text.includes(report.target));
      assert.doesNotMatch(text, /undefined/u);
    }
  }

  // Even a deferred choice reports a new inventory rather than its displayed snapshot.
  const switched = repository(base, "changed while deciding");
  addRun(switched, "old");
  const fresh = await runControlMaintenance(switched, { guided: true, chooseMaintenance: () => {
    addRun(switched, "new"); return "skip";
  }, confirmMigration: () => "skip", confirmRepair: () => "skip" });
  assert.equal(fresh.counts.migration, 2);
  assert.equal(fresh.maintenance_outcome, "deferred");

  const stale = repository(base, "stale");
  const stalePath = addRun(stale, "old");
  const staleResult = await runControlMaintenance(stale, { guided: true, chooseMaintenance: () => "start", confirmMigration: () => {
    writeFileSync(stalePath, readFileSync(stalePath, "utf8").replace("Describe the trustworthy outcome.", "Concurrent edit.")); return "migrate";
  }, confirmRepair: () => "skip" });
  assert.match(readFileSync(stalePath, "utf8"), /Concurrent edit/u);
  assert.ok(staleResult.diagnostics.some((finding) => finding.code === "AGDF_STALE_RUN_REVISION"));
  const replaced = repository(base, "replaced target"); addRun(replaced, "old");
  const replacement = join(base, "replacement"), preserved = join(base, "preserved original");
  cpSync(replaced, replacement, { recursive: true });
  const replacedBefore = treeDigest(replaced);
  await assert.rejects(runControlMaintenance(replaced, { guided: true, chooseMaintenance: () => "start", confirmMigration: () => {
    renameSync(replaced, preserved); renameSync(replacement, replaced); return "migrate";
  }, confirmRepair: () => "skip" }), /AGDF_MAINTENANCE_TARGET_CHANGED/u);
  assert.equal(treeDigest(replaced), replacedBefore);
  assert.equal(treeDigest(preserved), replacedBefore);
  const entry = inspectControlMigration(stale);
  const plan = { target: stale, control: entry, runs: [], diagnostics: [], approval_reset_count: 0 };
  const migrationOutput = [];
  const migrationChoices = ["3", "2"];
  assert.equal(await selectControlMigration(plan, { readChoice: async () => migrationChoices.shift(), write: (text) => migrationOutput.push(text) }), "skip");
  assert.ok(migrationOutput.at(-1).includes("[3]"));
  assert.equal(await selectControlRepair({ target: stale, items: [], diagnostics: [] }, { phase: "plan", readChoice: async () => null }), "skip");
  console.log("Control maintenance shared service and interaction tests passed.");
} finally { rmSync(base, { recursive: true, force: true }); }
