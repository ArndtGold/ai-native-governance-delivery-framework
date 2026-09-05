import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, linkSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { runCli } from "../lib/cli/application.js";
import { createRun } from "../lib/control-state/run-state-repository.js";
import { initializeCanonicalControl } from "../lib/scaffold/canonical-init.js";
import { generatedFilesForTarget } from "../lib/scaffold/plan.js";

const temporaryRoots = [];
const temporaryRoot = (label) => {
  const root = mkdtempSync(join(tmpdir(), `agdf-canonical-init-${label}-`));
  temporaryRoots.push(root);
  return root;
};
const languagePreference = Object.freeze({
  artifact_language: "en",
  chat_language: "en",
  runtime_language: "en",
  source: "parameter",
  detected_locale: "en",
});
const planFor = (root) => generatedFilesForTarget("init", root, false, languagePreference);
const relativeControlPath = (file) => file.path.replaceAll("\\", "/").replace(/^\.agdf\/control\//, "");
const writePlannedFile = (root, file, content = file.content) => {
  const path = join(root, ".agdf", "control", ...relativeControlPath(file).split("/"));
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
  return path;
};
const snapshot = (root) => {
  if (!existsSync(root)) return [];
  const values = [];
  const visit = (directory, prefix = "") => {
    for (const name of readdirSync(directory).sort()) {
      const relative = prefix ? `${prefix}/${name}` : name;
      const path = join(directory, name);
      const stats = lstatSync(path);
      if (stats.isDirectory()) {
        values.push([relative, "directory"]);
        visit(path, relative);
      } else {
        values.push([relative, readFileSync(path, "utf8")]);
      }
    }
  };
  visit(root);
  return values;
};
const assertNoStage = (root) => {
  const agdf = join(root, ".agdf");
  if (existsSync(agdf)) assert.equal(readdirSync(agdf).some((name) => name.startsWith(".control-stage-")), false);
};
const crashCanonicalInit = (root, point) => {
  const canonicalInitUrl = new URL("../lib/scaffold/canonical-init.js", import.meta.url).href;
  const scaffoldPlanUrl = new URL("../lib/scaffold/plan.js", import.meta.url).href;
  const source = `
    import { initializeCanonicalControl } from ${JSON.stringify(canonicalInitUrl)};
    import { generatedFilesForTarget } from ${JSON.stringify(scaffoldPlanUrl)};
    const root = process.argv[1];
    const point = process.argv[2];
    const language = {
      artifact_language: "en",
      chat_language: "en",
      runtime_language: "en",
      source: "parameter",
      detected_locale: "en",
    };
    const hooks = {
      beforePublish() {
        if (point === "before-publish") process.exit(86);
      },
      afterPublish() {
        if (point === "after-publish") process.exit(86);
      },
      afterLink({ index }) {
        if (point === "after-first-link" && index === 0) process.exit(86);
      },
    };
    initializeCanonicalControl(root, generatedFilesForTarget("init", root, false, language), {}, hooks);
  `;
  return spawnSync(process.execPath, ["--input-type=module", "--eval", source, root, point], {
    encoding: "utf8",
  });
};

try {
  const cleanRoot = temporaryRoot("clean");
  const cleanPlan = planFor(cleanRoot);
  const created = initializeCanonicalControl(cleanRoot, cleanPlan);
  assert.equal(created.status, "created");
  assert.equal(created.authorizes, false);
  assert.equal(created.created_run, false);
  assert.equal(created.created_ur, false);
  assert.equal(created.created_gate_approval, false);
  assert.equal(existsSync(join(cleanRoot, ".agdf", "control", "runs")), true);
  assert.equal(existsSync(join(cleanRoot, ".agdf", "control", "AGDF_RUN.md")), false);
  for (const file of cleanPlan) {
    assert.equal(readFileSync(join(cleanRoot, file.path), "utf8"), file.content);
  }
  assertNoStage(cleanRoot);

  const beforeRetry = snapshot(cleanRoot);
  const retried = initializeCanonicalControl(cleanRoot, cleanPlan);
  assert.equal(retried.status, "unchanged");
  assert.ok(retried.files.every((file) => file.action === "preserved_exact"));
  assert.deepEqual(snapshot(cleanRoot), beforeRetry);

  const populatedRunRoot = temporaryRoot("populated-run");
  const populatedRunPlan = planFor(populatedRunRoot);
  initializeCanonicalControl(populatedRunRoot, populatedRunPlan);
  createRun(populatedRunRoot, "run-a");
  const populatedRunBefore = snapshot(populatedRunRoot);
  const populatedRunRetry = initializeCanonicalControl(populatedRunRoot, populatedRunPlan);
  assert.equal(populatedRunRetry.status, "unchanged");
  assert.ok(populatedRunRetry.files.every((file) => file.action === "preserved_exact"));
  assert.deepEqual(snapshot(populatedRunRoot), populatedRunBefore, "init retry must preserve a valid canonical run byte-for-byte");

  const populatedRepairRoot = temporaryRoot("populated-run-repair");
  const populatedRepairPlan = planFor(populatedRepairRoot);
  initializeCanonicalControl(populatedRepairRoot, populatedRepairPlan);
  createRun(populatedRepairRoot, "run-a");
  const populatedRepairState = join(populatedRepairRoot, ".agdf", "control", "runs", "run-a", "RUN_STATE.md");
  const populatedRepairContent = readFileSync(populatedRepairState, "utf8");
  unlinkSync(join(populatedRepairRoot, populatedRepairPlan.at(-1).path));
  assert.equal(initializeCanonicalControl(populatedRepairRoot, populatedRepairPlan).status, "repaired");
  assert.equal(readFileSync(populatedRepairState, "utf8"), populatedRepairContent);

  const runDriftRoot = temporaryRoot("run-drift-during-repair");
  const runDriftPlan = planFor(runDriftRoot);
  initializeCanonicalControl(runDriftRoot, runDriftPlan);
  createRun(runDriftRoot, "run-a");
  const runDriftState = join(runDriftRoot, ".agdf", "control", "runs", "run-a", "RUN_STATE.md");
  unlinkSync(join(runDriftRoot, runDriftPlan.at(-1).path));
  assert.throws(
    () => initializeCanonicalControl(runDriftRoot, runDriftPlan, {}, {
      beforePublish() { writeFileSync(runDriftState, `${readFileSync(runDriftState, "utf8")}\n`, "utf8"); },
    }),
    (error) => error.code === "AGDF_CANONICAL_INIT_TARGET_DRIFT",
  );
  assertNoStage(runDriftRoot);

  const runLinkDriftRoot = temporaryRoot("run-drift-during-link");
  const runLinkDriftPlan = planFor(runLinkDriftRoot);
  initializeCanonicalControl(runLinkDriftRoot, runLinkDriftPlan);
  createRun(runLinkDriftRoot, "run-a");
  const runLinkDriftState = join(runLinkDriftRoot, ".agdf", "control", "runs", "run-a", "RUN_STATE.md");
  const runLinkDriftContent = readFileSync(runLinkDriftState, "utf8");
  const runLinkMissingPath = join(runLinkDriftRoot, runLinkDriftPlan.at(-1).path);
  unlinkSync(runLinkMissingPath);
  assert.throws(
    () => initializeCanonicalControl(runLinkDriftRoot, runLinkDriftPlan, {}, {
      beforeLink() { writeFileSync(runLinkDriftState, `${runLinkDriftContent}\n`, "utf8"); },
    }),
    (error) => error.code === "AGDF_CANONICAL_INIT_TARGET_DRIFT",
  );
  assert.equal(existsSync(runLinkMissingPath), false, "repair rollback must remove the linked scaffold file");
  assert.equal(readFileSync(runLinkDriftState, "utf8"), `${runLinkDriftContent}\n`, "foreign run drift must remain untouched");
  assertNoStage(runLinkDriftRoot);

  const partialRoot = temporaryRoot("partial");
  const partialPlan = planFor(partialRoot);
  writePlannedFile(partialRoot, partialPlan[0]);
  const repaired = initializeCanonicalControl(partialRoot, partialPlan);
  assert.equal(repaired.status, "repaired");
  assert.equal(repaired.files[0].action, "preserved_exact");
  assert.equal(existsSync(join(partialRoot, ".agdf", "control", "runs")), true);
  assert.equal(existsSync(join(partialRoot, ".agdf", "control", "AGDF_RUN.md")), false);
  assertNoStage(partialRoot);

  const unownedRoot = temporaryRoot("unowned");
  mkdirSync(join(unownedRoot, ".agdf", "control"), { recursive: true });
  assert.throws(
    () => initializeCanonicalControl(unownedRoot, planFor(unownedRoot)),
    (error) => error.code === "AGDF_CANONICAL_INIT_PARTIAL_UNOWNED",
  );
  assert.deepEqual(readdirSync(join(unownedRoot, ".agdf", "control")), []);

  const staleStageRoot = temporaryRoot("stale-stage");
  const staleStagePath = join(staleStageRoot, ".agdf", ".control-stage-ambiguous");
  mkdirSync(staleStagePath, { recursive: true });
  writeFileSync(join(staleStagePath, "user-owned.txt"), "ambiguous retained content\n", "utf8");
  const staleStageBefore = snapshot(staleStageRoot);
  assert.throws(
    () => initializeCanonicalControl(staleStageRoot, planFor(staleStageRoot)),
    (error) => error.code === "AGDF_CANONICAL_INIT_STALE_STAGE" && error.path === staleStagePath,
  );
  assert.deepEqual(
    snapshot(staleStageRoot),
    staleStageBefore,
    "pre-existing staging content must be retained exactly and stop init before a new stage is created",
  );

  const resumedNewRoot = temporaryRoot("resume-new-stage");
  const crashedNew = crashCanonicalInit(resumedNewRoot, "before-publish");
  assert.equal(crashedNew.status, 86, crashedNew.stderr);
  assert.equal(existsSync(join(resumedNewRoot, ".agdf", "control")), false);
  assert.equal(
    readdirSync(join(resumedNewRoot, ".agdf")).filter((name) => name.startsWith(".control-stage-")).length,
    1,
    "an abrupt exit must leave one ownership-marked internal stage",
  );
  assert.equal(initializeCanonicalControl(resumedNewRoot, planFor(resumedNewRoot)).status, "created");
  assertNoStage(resumedNewRoot);
  for (const file of planFor(resumedNewRoot)) {
    assert.equal(readFileSync(join(resumedNewRoot, file.path), "utf8"), file.content);
  }

  const changedOwnedStageRoot = temporaryRoot("changed-owned-stage");
  const crashedOwnedStage = crashCanonicalInit(changedOwnedStageRoot, "before-publish");
  assert.equal(crashedOwnedStage.status, 86, crashedOwnedStage.stderr);
  const changedOwnedStagePath = join(
    changedOwnedStageRoot,
    ".agdf",
    readdirSync(join(changedOwnedStageRoot, ".agdf")).find((name) => name.startsWith(".control-stage-")),
  );
  writeFileSync(join(changedOwnedStagePath, "unknown.txt"), "ambiguous concurrent content\n", "utf8");
  const changedOwnedStageBefore = snapshot(changedOwnedStageRoot);
  assert.throws(
    () => initializeCanonicalControl(changedOwnedStageRoot, planFor(changedOwnedStageRoot)),
    (error) => error.code === "AGDF_CANONICAL_INIT_STALE_STAGE",
  );
  assert.deepEqual(
    snapshot(changedOwnedStageRoot),
    changedOwnedStageBefore,
    "an ownership marker does not authorize cleanup or resume after unknown stage content appears",
  );

  const resumedPublishedRoot = temporaryRoot("resume-published-control");
  const crashedPublished = crashCanonicalInit(resumedPublishedRoot, "after-publish");
  assert.equal(crashedPublished.status, 86, crashedPublished.stderr);
  assert.equal(existsSync(join(resumedPublishedRoot, ".agdf", "control", ".agdf-canonical-init-stage.json")), true);
  assert.equal(initializeCanonicalControl(resumedPublishedRoot, planFor(resumedPublishedRoot)).status, "repaired");
  assert.equal(existsSync(join(resumedPublishedRoot, ".agdf", "control", ".agdf-canonical-init-stage.json")), false);
  assertNoStage(resumedPublishedRoot);

  const conflictRoot = temporaryRoot("changed");
  const conflictPlan = planFor(conflictRoot);
  initializeCanonicalControl(conflictRoot, conflictPlan);
  const changedPath = join(conflictRoot, conflictPlan[0].path);
  writeFileSync(changedPath, "user changed\n", "utf8");
  const conflictBefore = snapshot(conflictRoot);
  assert.throws(
    () => initializeCanonicalControl(conflictRoot, conflictPlan),
    (error) => error.code === "AGDF_CANONICAL_INIT_CONTENT_CONFLICT",
  );
  assert.deepEqual(snapshot(conflictRoot), conflictBefore);

  const unknownRoot = temporaryRoot("unknown");
  const unknownPlan = planFor(unknownRoot);
  initializeCanonicalControl(unknownRoot, unknownPlan);
  writeFileSync(join(unknownRoot, ".agdf", "control", "user-owned.txt"), "keep\n", "utf8");
  const unknownBefore = snapshot(unknownRoot);
  assert.throws(
    () => initializeCanonicalControl(unknownRoot, unknownPlan),
    (error) => error.code === "AGDF_CANONICAL_INIT_UNKNOWN_PATH",
  );
  assert.deepEqual(snapshot(unknownRoot), unknownBefore);

  const occupiedRunRoot = temporaryRoot("occupied-run");
  const occupiedRunPlan = planFor(occupiedRunRoot);
  initializeCanonicalControl(occupiedRunRoot, occupiedRunPlan);
  const occupiedState = join(occupiedRunRoot, ".agdf", "control", "runs", "run-a", "RUN_STATE.md");
  mkdirSync(dirname(occupiedState), { recursive: true });
  writeFileSync(occupiedState, "occupied\n", "utf8");
  assert.throws(
    () => initializeCanonicalControl(occupiedRunRoot, occupiedRunPlan),
    (error) => error.code === "AGDF_CANONICAL_INIT_CONFLICT",
  );
  assert.equal(readFileSync(occupiedState, "utf8"), "occupied\n");

  const extraRunPathRoot = temporaryRoot("extra-run-path");
  const extraRunPathPlan = planFor(extraRunPathRoot);
  initializeCanonicalControl(extraRunPathRoot, extraRunPathPlan);
  createRun(extraRunPathRoot, "run-a");
  const extraRunPath = join(extraRunPathRoot, ".agdf", "control", "runs", "run-a", "extra.txt");
  writeFileSync(extraRunPath, "unexpected\n", "utf8");
  assert.throws(
    () => initializeCanonicalControl(extraRunPathRoot, extraRunPathPlan),
    (error) => error.code === "AGDF_CANONICAL_INIT_UNKNOWN_PATH" && error.path === "runs/run-a/extra.txt",
  );
  assert.equal(readFileSync(extraRunPath, "utf8"), "unexpected\n");

  const invalidRunIdRoot = temporaryRoot("invalid-run-id");
  const invalidRunIdPlan = planFor(invalidRunIdRoot);
  initializeCanonicalControl(invalidRunIdRoot, invalidRunIdPlan);
  mkdirSync(join(invalidRunIdRoot, ".agdf", "control", "runs", "INVALID"));
  assert.throws(
    () => initializeCanonicalControl(invalidRunIdRoot, invalidRunIdPlan),
    (error) => error.code === "AGDF_CANONICAL_INIT_UNKNOWN_PATH" && error.path === "runs/INVALID",
  );

  const emptyRunRoot = temporaryRoot("empty-run");
  const emptyRunPlan = planFor(emptyRunRoot);
  initializeCanonicalControl(emptyRunRoot, emptyRunPlan);
  mkdirSync(join(emptyRunRoot, ".agdf", "control", "runs", "run-a"));
  assert.throws(
    () => initializeCanonicalControl(emptyRunRoot, emptyRunPlan),
    (error) => error.code === "AGDF_CANONICAL_INIT_CONFLICT" && error.path === "runs/run-a",
  );

  const mismatchedRunRoot = temporaryRoot("mismatched-run");
  const mismatchedRunPlan = planFor(mismatchedRunRoot);
  initializeCanonicalControl(mismatchedRunRoot, mismatchedRunPlan);
  const mismatchedRunPath = join(mismatchedRunRoot, ".agdf", "control", "runs", "run-b");
  mkdirSync(mismatchedRunPath);
  writeFileSync(join(mismatchedRunPath, "RUN_STATE.md"), readFileSync(join(populatedRunRoot, ".agdf", "control", "runs", "run-a", "RUN_STATE.md"), "utf8"), "utf8");
  assert.throws(
    () => initializeCanonicalControl(mismatchedRunRoot, mismatchedRunPlan),
    (error) => error.code === "AGDF_CANONICAL_INIT_CONFLICT" && error.path === "runs/run-b/RUN_STATE.md",
  );

  const runOnlyRoot = temporaryRoot("run-only-ownership");
  const runOnlyStatePath = join(runOnlyRoot, ".agdf", "control", "runs", "run-a", "RUN_STATE.md");
  mkdirSync(dirname(runOnlyStatePath), { recursive: true });
  writeFileSync(runOnlyStatePath, readFileSync(join(populatedRunRoot, ".agdf", "control", "runs", "run-a", "RUN_STATE.md"), "utf8"), "utf8");
  assert.throws(
    () => initializeCanonicalControl(runOnlyRoot, planFor(runOnlyRoot)),
    (error) => error.code === "AGDF_CANONICAL_INIT_PARTIAL_UNOWNED",
  );

  const hardlinkedRunRoot = temporaryRoot("hardlinked-run-state");
  const hardlinkedRunPlan = planFor(hardlinkedRunRoot);
  initializeCanonicalControl(hardlinkedRunRoot, hardlinkedRunPlan);
  const hardlinkedRunPath = join(hardlinkedRunRoot, ".agdf", "control", "runs", "run-a");
  mkdirSync(hardlinkedRunPath);
  linkSync(join(populatedRunRoot, ".agdf", "control", "runs", "run-a", "RUN_STATE.md"), join(hardlinkedRunPath, "RUN_STATE.md"));
  assert.throws(
    () => initializeCanonicalControl(hardlinkedRunRoot, hardlinkedRunPlan),
    (error) => error.code === "AGDF_CANONICAL_INIT_CONFLICT" && error.path === "runs/run-a/RUN_STATE.md",
  );

  const symlinkedRunRoot = temporaryRoot("symlinked-run-state");
  const symlinkedRunPlan = planFor(symlinkedRunRoot);
  initializeCanonicalControl(symlinkedRunRoot, symlinkedRunPlan);
  const symlinkedRunPath = join(symlinkedRunRoot, ".agdf", "control", "runs", "run-a");
  mkdirSync(symlinkedRunPath);
  try {
    symlinkSync(join(populatedRunRoot, ".agdf", "control", "runs", "run-a", "RUN_STATE.md"), join(symlinkedRunPath, "RUN_STATE.md"), "file");
    assert.throws(
      () => initializeCanonicalControl(symlinkedRunRoot, symlinkedRunPlan),
      (error) => error.code === "AGDF_CANONICAL_INIT_CONFLICT" && error.path === "runs/run-a/RUN_STATE.md",
    );
  } catch (error) {
    if (!["EPERM", "EACCES", "ENOTSUP"].includes(error?.code)) throw error;
  }

  const writeFailureRoot = temporaryRoot("write-failure");
  assert.throws(
    () => initializeCanonicalControl(writeFailureRoot, planFor(writeFailureRoot), {}, {
      beforeWrite({ index }) { if (index === 1) throw new Error("injected write failure"); },
    }),
    /injected write failure/,
  );
  assert.equal(existsSync(join(writeFailureRoot, ".agdf", "control")), false);
  assertNoStage(writeFailureRoot);

  const stagedBytesRoot = temporaryRoot("staged-bytes-drift");
  const stagedBytesPlan = planFor(stagedBytesRoot);
  let alteredStageFile = "";
  assert.throws(
    () => initializeCanonicalControl(stagedBytesRoot, stagedBytesPlan, {}, {
      beforePublish({ stagePath }) {
        alteredStageFile = join(stagePath, ...relativeControlPath(stagedBytesPlan[0]).split("/"));
        writeFileSync(alteredStageFile, "concurrent staged-byte change\n", "utf8");
      },
    }),
    (error) => error.code === "AGDF_CANONICAL_INIT_STAGE_INVALID",
  );
  assert.equal(existsSync(join(stagedBytesRoot, ".agdf", "control")), false);
  assert.equal(readFileSync(alteredStageFile, "utf8"), "concurrent staged-byte change\n");
  const alteredStageBefore = snapshot(stagedBytesRoot);
  assert.throws(
    () => initializeCanonicalControl(stagedBytesRoot, stagedBytesPlan),
    (error) => error.code === "AGDF_CANONICAL_INIT_STALE_STAGE",
  );
  assert.deepEqual(snapshot(stagedBytesRoot), alteredStageBefore, "an altered internal stage must be preserved and block retry");

  const publishFailureRoot = temporaryRoot("publish-failure");
  assert.throws(
    () => initializeCanonicalControl(publishFailureRoot, planFor(publishFailureRoot), {}, {
      beforePublish() { throw new Error("injected publish failure"); },
    }),
    /injected publish failure/,
  );
  assert.equal(existsSync(join(publishFailureRoot, ".agdf", "control")), false);
  assertNoStage(publishFailureRoot);

  const replacedStageRoot = temporaryRoot("replaced-stage-cleanup");
  let replacementStagePath = "";
  assert.throws(
    () => initializeCanonicalControl(replacedStageRoot, planFor(replacedStageRoot), {}, {
      beforePublish({ stagePath }) {
        replacementStagePath = stagePath;
        renameSync(stagePath, `${stagePath}-displaced`);
        mkdirSync(stagePath);
        writeFileSync(join(stagePath, "user-owned.txt"), "preserve replacement stage\n", "utf8");
      },
    }),
    (error) => error.code === "AGDF_CANONICAL_INIT_TARGET_DRIFT",
  );
  assert.equal(
    readFileSync(join(replacementStagePath, "user-owned.txt"), "utf8"),
    "preserve replacement stage\n",
    "cleanup must preserve a stage path whose directory identity changed",
  );

  const replacedAgdfRoot = temporaryRoot("replaced-agdf-cleanup");
  const replacementAgdfPath = join(replacedAgdfRoot, ".agdf");
  assert.throws(
    () => initializeCanonicalControl(replacedAgdfRoot, planFor(replacedAgdfRoot), {}, {
      beforePublish() {
        renameSync(replacementAgdfPath, join(replacedAgdfRoot, ".agdf-displaced"));
        mkdirSync(replacementAgdfPath);
        writeFileSync(join(replacementAgdfPath, "user-owned.txt"), "preserve replacement agdf\n", "utf8");
      },
    }),
    (error) => error.code === "AGDF_CANONICAL_INIT_TARGET_DRIFT",
  );
  assert.equal(
    readFileSync(join(replacementAgdfPath, "user-owned.txt"), "utf8"),
    "preserve replacement agdf\n",
    "cleanup must preserve a .agdf path whose directory identity changed",
  );

  const repairRollbackRoot = temporaryRoot("repair-rollback");
  const repairRollbackPlan = planFor(repairRollbackRoot);
  writePlannedFile(repairRollbackRoot, repairRollbackPlan[0]);
  const repairBefore = snapshot(repairRollbackRoot);
  assert.throws(
    () => initializeCanonicalControl(repairRollbackRoot, repairRollbackPlan, {}, {
      beforeLink({ index }) { if (index === 1) throw new Error("injected repair publish failure"); },
    }),
    /injected repair publish failure/,
  );
  assert.deepEqual(snapshot(repairRollbackRoot), repairBefore);
  assertNoStage(repairRollbackRoot);

  const concurrentReplacementRoot = temporaryRoot("concurrent-replacement");
  const concurrentReplacementPlan = planFor(concurrentReplacementRoot);
  writePlannedFile(concurrentReplacementRoot, concurrentReplacementPlan[0]);
  let firstPublishedPath = "";
  assert.throws(
    () => initializeCanonicalControl(concurrentReplacementRoot, concurrentReplacementPlan, {}, {
      beforeLink({ index, destination }) {
        if (index === 0) {
          firstPublishedPath = destination;
          return;
        }
        if (index === 1) {
          unlinkSync(firstPublishedPath);
          writeFileSync(firstPublishedPath, "concurrent user replacement\n", "utf8");
          throw new Error("injected failure after concurrent replacement");
        }
      },
    }),
    /injected failure after concurrent replacement/,
  );
  assert.equal(
    readFileSync(firstPublishedPath, "utf8"),
    "concurrent user replacement\n",
    "rollback must not unlink a concurrent replacement with a different file identity",
  );
  assertNoStage(concurrentReplacementRoot);

  const driftRoot = temporaryRoot("drift");
  const driftPlan = planFor(driftRoot);
  writePlannedFile(driftRoot, driftPlan[0]);
  assert.throws(
    () => initializeCanonicalControl(driftRoot, driftPlan, {}, {
      beforePublish() { writePlannedFile(driftRoot, driftPlan[0], "changed during init\n"); },
    }),
    (error) => error.code === "AGDF_CANONICAL_INIT_TARGET_DRIFT",
  );
  assert.equal(readFileSync(join(driftRoot, driftPlan[0].path), "utf8"), "changed during init\n");
  assert.equal(existsSync(join(driftRoot, driftPlan[1].path)), false);
  assertNoStage(driftRoot);

  const repairCrashRoot = temporaryRoot("resume-repair-stage");
  const repairCrashPlan = planFor(repairCrashRoot);
  writePlannedFile(repairCrashRoot, repairCrashPlan[0]);
  const crashedRepair = crashCanonicalInit(repairCrashRoot, "after-first-link");
  assert.equal(crashedRepair.status, 86, crashedRepair.stderr);
  assert.equal(
    readdirSync(join(repairCrashRoot, ".agdf")).filter((name) => name.startsWith(".control-stage-")).length,
    1,
  );
  assert.equal(initializeCanonicalControl(repairCrashRoot, repairCrashPlan).status, "repaired");
  assertNoStage(repairCrashRoot);
  for (const file of repairCrashPlan) {
    assert.equal(readFileSync(join(repairCrashRoot, file.path), "utf8"), file.content);
  }

  const invalidPlanRoot = temporaryRoot("invalid-plan");
  assert.throws(
    () => initializeCanonicalControl(invalidPlanRoot, [{ path: ".agdf/control/AGDF_RUN.md", content: "legacy\n" }]),
    (error) => error.code === "AGDF_CANONICAL_INIT_LEGACY_AUTHORITY_FORBIDDEN",
  );
  assert.equal(existsSync(join(invalidPlanRoot, ".agdf")), false);

  const forceRoot = temporaryRoot("force");
  assert.throws(
    () => initializeCanonicalControl(forceRoot, planFor(forceRoot), { force: true }),
    (error) => error.code === "AGDF_CANONICAL_INIT_FORCE_FORBIDDEN",
  );
  assert.equal(existsSync(join(forceRoot, ".agdf")), false);

  const absentRunRoot = temporaryRoot("run-create-without-scaffold");
  const absentRunErrors = [];
  assert.equal(await runCli(["run-create", "--dir", absentRunRoot, "--run", "must-not-exist"], {
    parser: { cwd: absentRunRoot },
    env: { LANG: "en" },
    io: { log() {}, error(value) { absentRunErrors.push(value); } },
  }), 1);
  assert.match(absentRunErrors.at(-1), /AGDF_CANONICAL_SCAFFOLD_REQUIRED/);
  assert.equal(existsSync(join(absentRunRoot, ".agdf")), false, "run-create must not create a control dead end before init");

  const incompleteRunRoot = temporaryRoot("run-create-incomplete-scaffold");
  mkdirSync(join(incompleteRunRoot, ".agdf", "control", "runs"), { recursive: true });
  const incompleteBefore = snapshot(incompleteRunRoot);
  const incompleteRunErrors = [];
  assert.equal(await runCli(["run-create", "--dir", incompleteRunRoot, "--run", "must-not-exist"], {
    parser: { cwd: incompleteRunRoot },
    env: { LANG: "en" },
    io: { log() {}, error(value) { incompleteRunErrors.push(value); } },
  }), 1);
  assert.match(incompleteRunErrors.at(-1), /AGDF_CANONICAL_SCAFFOLD_REQUIRED/);
  assert.deepEqual(snapshot(incompleteRunRoot), incompleteBefore, "run-create must preserve an incomplete pre-existing control tree");

  const deceptivePartialRoot = temporaryRoot("run-create-deceptive-partial");
  mkdirSync(join(deceptivePartialRoot, ".agdf", "control", "runs"), { recursive: true });
  writeFileSync(join(deceptivePartialRoot, ".agdf", "control", "config.json"), "{}\n", "utf8");
  writeFileSync(join(deceptivePartialRoot, ".agdf", "control", "README.md"), "partial\n", "utf8");
  const deceptivePartialBefore = snapshot(deceptivePartialRoot);
  const deceptivePartialErrors = [];
  assert.equal(await runCli(["run-create", "--dir", deceptivePartialRoot, "--run", "must-not-exist"], {
    parser: { cwd: deceptivePartialRoot },
    env: { LANG: "en" },
    io: { log() {}, error(value) { deceptivePartialErrors.push(value); } },
  }), 1);
  assert.match(deceptivePartialErrors.at(-1), /AGDF_CANONICAL_SCAFFOLD_REQUIRED/);
  assert.deepEqual(
    snapshot(deceptivePartialRoot),
    deceptivePartialBefore,
    "run-create must not treat only the core directory, config and README as a complete scaffold",
  );

  const jsonRoot = temporaryRoot("json-lifecycle");
  const jsonLogs = [];
  const jsonErrors = [];
  const jsonAdapters = {
    parser: { cwd: jsonRoot },
    env: { LANG: "en" },
    io: { log(value) { jsonLogs.push(value); }, error(value) { jsonErrors.push(value); } },
  };
  const readLastJsonResult = () => {
    assert.equal(jsonLogs.length, 1, "init --json must emit exactly one lifecycle result");
    const report = JSON.parse(jsonLogs.pop());
    assert.equal(report.schema_version, 1);
    assert.equal(report.operation, "control_init");
    assert.equal(report.result, "success");
    assert.equal(report.operation_status.operation_id, "lifecycle.control.init");
    assert.equal(report.operation_status.target_scope, "repository");
    assert.equal(report.operation_status.target, jsonRoot);
    assert.equal(report.operation_status.planned_effect, "create_canonical_control_scaffold");
    assert.deepEqual(report.operation_status.excluded_authority, [
      "target_inference", "run_creation", "ur_persistence", "gate_approval", "implementation", "qa", "release",
    ]);
    assert.equal(report.operation_status.authorizes, false);
    assert.equal(report.next_action.kind, "control_setup");
    assert.equal(jsonErrors.length, 0);
    return report;
  };
  assert.equal(await runCli(["init", "--dir", jsonRoot, "--json"], jsonAdapters), 0);
  assert.equal(readLastJsonResult().operation_status.outcome, "created");
  assert.equal(await runCli(["init", "--dir", jsonRoot, "--json"], jsonAdapters), 0);
  assert.equal(readLastJsonResult().operation_status.outcome, "unchanged");
  const jsonRepairFile = planFor(jsonRoot).at(-1);
  rmSync(join(jsonRoot, jsonRepairFile.path));
  assert.equal(await runCli(["init", "--dir", jsonRoot, "--json"], jsonAdapters), 0);
  const repairedJson = readLastJsonResult();
  assert.equal(repairedJson.operation_status.outcome, "repaired");
  assert.ok(repairedJson.changes.some((change) => change.path === jsonRepairFile.path));

  const cliRoot = temporaryRoot("cli");
  const cliLogs = [];
  const cliErrors = [];
  const cliAdapters = {
    parser: { cwd: cliRoot },
    env: { LANG: "en" },
    io: { log(value) { cliLogs.push(value); }, error(value) { cliErrors.push(value); } },
  };
  assert.equal(await runCli(["init", "--dir", cliRoot], cliAdapters), 0);
  assert.equal(existsSync(join(cliRoot, ".agdf", "control", "runs")), true);
  assert.deepEqual(readdirSync(join(cliRoot, ".agdf", "control", "runs")), [], "control init must not invent a run");
  assert.equal(existsSync(join(cliRoot, ".agdf", "control", "AGDF_RUN.md")), false);
  const cliInitial = snapshot(cliRoot);
  assert.equal(await runCli(["init", "--dir", cliRoot], cliAdapters), 0, "explicit lifecycle init retry must be idempotent");
  assert.deepEqual(snapshot(cliRoot), cliInitial);
  assert.equal(await runCli(["init", "--dir", cliRoot, "--force"], cliAdapters), 1);
  assert.match(cliErrors.at(-1), /AGDF_CANONICAL_INIT_FORCE_FORBIDDEN/);
  const failedJsonLogs = [];
  assert.equal(await runCli(["init", "--dir", cliRoot, "--force", "--json"], {
    ...cliAdapters,
    io: { log(value) { failedJsonLogs.push(value); }, error(value) { throw new Error(value); } },
  }), 1);
  const failedInitReport = JSON.parse(failedJsonLogs[0]);
  assert.equal(failedInitReport.result, "failed");
  assert.equal(failedInitReport.operation_status.operation_id, "lifecycle.control.init");
  assert.equal(failedInitReport.operation_status.outcome, "failed");
  assert.equal(failedInitReport.operation_status.target, cliRoot);
  assert.equal(failedInitReport.operation_status.authorizes, false);
  assert.deepEqual(snapshot(cliRoot), cliInitial);
  assert.equal(await runCli(["run-create", "--dir", cliRoot, "--run", "cli-run"], cliAdapters), 0);
  assert.equal(existsSync(join(cliRoot, ".agdf", "control", "runs", "cli-run", "RUN_STATE.md")), true);
  const cliWithRun = snapshot(cliRoot);
  assert.equal(await runCli(["init", "--dir", cliRoot], cliAdapters), 0, "init -> run-create -> init must be idempotent");
  assert.deepEqual(snapshot(cliRoot), cliWithRun, "CLI init retry must not mutate a valid canonical run");

  const atomicRunRoot = temporaryRoot("atomic-run-create");
  initializeCanonicalControl(atomicRunRoot, planFor(atomicRunRoot));
  const atomicRunBefore = snapshot(atomicRunRoot);
  assert.throws(
    () => createRun(atomicRunRoot, "injected-run", "", {
      beforePublish() {
        throw new Error("injected run publish failure");
      },
    }),
    /injected run publish failure/,
  );
  assert.deepEqual(snapshot(atomicRunRoot), atomicRunBefore, "failed run publication must leave no live or staged run state");
  assert.equal(
    readdirSync(join(atomicRunRoot, ".agdf", "control", "runs")).some((name) => name.startsWith(".run-stage-")),
    false,
  );
  createRun(atomicRunRoot, "injected-run");
  const publishedRunPath = join(atomicRunRoot, ".agdf", "control", "runs", "injected-run", "RUN_STATE.md");
  assert.equal(existsSync(publishedRunPath), true);
  assert.throws(() => createRun(atomicRunRoot, "injected-run"), /AGDF_RUN_COLLISION/);

  const runStageBytesRoot = temporaryRoot("run-staged-bytes-drift");
  initializeCanonicalControl(runStageBytesRoot, planFor(runStageBytesRoot));
  let alteredRunStage = "";
  assert.throws(
    () => createRun(runStageBytesRoot, "altered-stage", "", {
      beforePublish({ stageDirectory }) {
        alteredRunStage = join(stageDirectory, "RUN_STATE.md");
        writeFileSync(alteredRunStage, "concurrent run-stage change\n", "utf8");
      },
    }),
    /AGDF_RUN_STAGE_INVALID/,
  );
  assert.equal(readFileSync(alteredRunStage, "utf8"), "concurrent run-stage change\n");
  assert.equal(existsSync(join(runStageBytesRoot, ".agdf", "control", "runs", "altered-stage")), false);

  const runScaffoldDriftRoot = temporaryRoot("run-scaffold-drift");
  initializeCanonicalControl(runScaffoldDriftRoot, planFor(runScaffoldDriftRoot));
  const changedRequiredPath = join(runScaffoldDriftRoot, ".agdf", "control", "config.json");
  assert.throws(
    () => createRun(runScaffoldDriftRoot, "must-not-publish", "", {
      beforePublish() {
        writeFileSync(changedRequiredPath, "{\"changed\":true}\n", "utf8");
      },
    }),
    /AGDF_RUN_TARGET_DRIFT/,
  );
  assert.equal(readFileSync(changedRequiredPath, "utf8"), "{\"changed\":true}\n");
  assert.equal(existsSync(join(runScaffoldDriftRoot, ".agdf", "control", "runs", "must-not-publish")), false);
  assert.equal(
    readdirSync(join(runScaffoldDriftRoot, ".agdf", "control", "runs")).some((name) => name.startsWith(".run-stage-")),
    false,
  );

  const replacedRunStageRoot = temporaryRoot("run-replaced-stage-cleanup");
  initializeCanonicalControl(replacedRunStageRoot, planFor(replacedRunStageRoot));
  let replacementRunStage = "";
  assert.throws(
    () => createRun(replacedRunStageRoot, "must-preserve-stage", "", {
      beforePublish({ stageDirectory }) {
        replacementRunStage = stageDirectory;
        renameSync(stageDirectory, `${stageDirectory}-displaced`);
        mkdirSync(stageDirectory);
        writeFileSync(join(stageDirectory, "user-owned.txt"), "preserve run-stage replacement\n", "utf8");
      },
    }),
    /AGDF_RUN_STAGE_INVALID/,
  );
  assert.equal(
    readFileSync(join(replacementRunStage, "user-owned.txt"), "utf8"),
    "preserve run-stage replacement\n",
  );

  const replacedRunStoreRoot = temporaryRoot("run-replaced-target-cleanup");
  initializeCanonicalControl(replacedRunStoreRoot, planFor(replacedRunStoreRoot));
  const runStorePath = join(replacedRunStoreRoot, ".agdf", "control", "runs");
  assert.throws(
    () => createRun(replacedRunStoreRoot, "must-preserve-target", "", {
      beforePublish() {
        renameSync(runStorePath, `${runStorePath}-displaced`);
        mkdirSync(runStorePath);
        writeFileSync(join(runStorePath, "user-owned.txt"), "preserve run-store replacement\n", "utf8");
      },
    }),
    /AGDF_RUN_TARGET_DRIFT/,
  );
  assert.equal(
    readFileSync(join(runStorePath, "user-owned.txt"), "utf8"),
    "preserve run-store replacement\n",
    "run cleanup must not remove a replacement target directory",
  );

  for (const route of ["codex-repo", "opencode-repo"]) {
    const repositoryRoot = temporaryRoot(route);
    const repositoryErrors = [];
    const repositoryAdapters = {
      parser: { cwd: temporaryRoot(`${route}-decoy`) },
      env: { LANG: "en" },
      io: { log() {}, error(value) { repositoryErrors.push(value); } },
    };
    assert.equal(await runCli([route, "--dir", repositoryRoot], repositoryAdapters), 0);
    assert.equal(existsSync(join(repositoryRoot, ".agdf", "control", "AGDF_RUN.md")), false, `${route} must not invent a legacy run`);
    assert.equal(existsSync(join(repositoryRoot, ".agdf", "control", "runs")), false, `${route} must not invent canonical delivery state`);
    const repositoryBefore = snapshot(repositoryRoot);
    assert.equal(await runCli([route, "--dir", repositoryRoot], repositoryAdapters), 1, `${route} collision must stop without force`);
    assert.match(repositoryErrors.at(-1), /Refusing to overwrite existing file/);
    assert.deepEqual(snapshot(repositoryRoot), repositoryBefore);
  }

  console.log("Canonical init tests passed.");
} finally {
  for (const root of temporaryRoots) rmSync(root, { recursive: true, force: true });
}
