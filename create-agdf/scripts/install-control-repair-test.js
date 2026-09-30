import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initializeCanonicalControl } from "../lib/scaffold/canonical-init.js";
import { generatedFilesForTarget } from "../lib/scaffold/plan.js";
import { renderRunState } from "../lib/control-state/run-state-repository.js";
import { applyRunSeals, canonicalRunText, computeRunSeals, runSealState, sealRunState } from "../lib/control-state/run-seal.js";
import { inspectSelfReferenceRecovery, previewRunRecovery } from "../lib/control-state/run-recovery.js";
import { recoveryRunContent, writeRun } from "../lib/control-state/run-state-writer.js";
import { inspectControlMigration } from "../lib/install-setup/control-migration.js";
import { inspectControlRepair, repairInstallationControl } from "../lib/install-setup/control-repair.js";
import { selectControlRepair } from "../lib/install-setup/interaction.js";
import { renderControlRepairOffer, renderControlRepairPlan, renderInstallSetupText } from "../lib/install-setup/presentation.js";
import { runInstallSetup } from "../lib/install-setup/service.js";
import { createLifecycleResult } from "../lib/lifecycle/result.js";
import { interactionLocales } from "../lib/cli/runtime-context.js";
import { runCli } from "../lib/cli/application.js";

const base = mkdtempSync(join(tmpdir(), "agdf-install-repair-"));
const textDigest = (text) => `sha256:${createHash("sha256").update(canonicalRunText(text)).digest("hex")}`;
function repository(name) {
  const root = join(base, name);
  mkdirSync(root);
  initializeCanonicalControl(root, generatedFilesForTarget("init", root, false, {
    artifact_language: "en", chat_language: "en", runtime_language: "en", source: "parameter", detected_locale: "en",
  }));
  return root;
}
function addRun(root, id, transform = (value) => value) {
  const dir = join(root, ".agdf/control/runs", id);
  mkdirSync(dir);
  const path = join(dir, "RUN_STATE.md");
  const content = transform(renderRunState(id));
  writeFileSync(path, content);
  return { path, content };
}
function git(root, args) {
  return execFileSync("git", ["-c", "user.name=Repair Fixture", "-c", "user.email=fixture@example.invalid",
    "-c", "core.hooksPath=/dev/null", ...args], { cwd: root, stdio: "pipe" });
}
function missingFixture(name) {
  const root = repository(name);
  const artifact = `.agdf/control/artefacts/${name}/UR.md`;
  mkdirSync(join(root, `.agdf/control/artefacts/${name}`), { recursive: true });
  writeFileSync(join(root, artifact), "Original user request\n");
  const run = addRun(root, name, (value) => value.replace("| UR |  | missing |", `| UR | ${artifact} | ready |`)
    .replace("| UR | missing |", "| UR | approved | Approval: UR"));
  git(root, ["init", "-q"]);
  git(root, ["add", ".agdf"]);
  git(root, ["commit", "-qm", "Original artefact fixture"]);
  unlinkSync(join(root, artifact));
  return { root, run, artifact };
}
function selfReferenceFixture(name) {
  const root = repository(name);
  const relative = `.agdf/control/runs/${name}/RUN_STATE.md`;
  const run = addRun(root, name, (value) => value.replace("| UR |  | missing |", `| UR | ${relative} | ready |`));
  const preview = previewRunRecovery(root, name);
  const journalPath = join(root, preview.journal);
  const journal = JSON.parse(readFileSync(journalPath));
  const corrected = recoveryRunContent(root, journal.candidate_content, {
    revision: 1, nextRevisionId: journal.next_revision_id, updatedAt: journal.created_at,
  });
  const legacy = applyRunSeals(corrected, computeRunSeals(root, corrected, { selfReferenceDigest: journal.source_content_digest }));
  writeFileSync(run.path, legacy);
  writeFileSync(journalPath, JSON.stringify({ ...journal, phase: "committed", result_digest: textDigest(legacy),
    result_revision_id: journal.next_revision_id }));
  return { root, run, legacy, journalPath };
}
function pluginReport(result = "success") {
  return createLifecycleResult({ operation: "update", result, surface: "codex", scope: "global",
    version: { expected: "0.14.5", installed: "0.14.5", status: "verified" },
    verification: { status: result === "success" ? "healthy" : "degraded", evidence: ["fixture"] },
    restart: { required: true, reason: "plugin_reload" }, next_action: { kind: "restart", text: "Restart host." },
    ...(result === "failed" ? { failure: { phase: "plugin_operation", message: "fixture failure" } } : {}),
  });
}
async function install(root, options = {}, dependencies = {}) {
  return runInstallSetup({ options: { target: "codex", workingDirectory: root, dir: root, dirExplicit: false,
    setupRequest: "plugin_only", ...options }, interactive: true, env: {} }, {
    inspectPlugin: () => ({ status: "healthy", evidence: [] }), installPlugin: () => ({ report: pluginReport() }),
    chooseControlRepair: () => "start", confirmControlRepair: () => "repair", ...dependencies,
  });
}
try {
  const self = selfReferenceFixture("self-reference");
  assert.equal(runSealState(self.root, self.legacy).status, "content_changed");
  assert.ok(inspectSelfReferenceRecovery(self.root, "self-reference"));
  assert.equal(inspectControlRepair(self.root).items[0].kind, "self_reference");
  const skipped = await repairInstallationControl(inspectControlMigration(self.root), { chooseRepair: () => "skip" });
  assert.equal(skipped.status, "repair_required");
  assert.equal(existsSync(join(self.root, ".agdf/control/runs/self-reference/repair-previews")), false);
  const deferred = await repairInstallationControl(inspectControlMigration(self.root), {
    chooseRepair: () => "start", confirmRepair: () => "skip",
  });
  assert.equal(deferred.repair.status, "deferred");
  assert.equal(readFileSync(self.run.path, "utf8"), self.legacy);
  assert.equal(existsSync(join(self.root, ".agdf/control/runs/self-reference/repair-previews")), false);
  const repaired = await install(self.root);
  assert.equal(repaired.report.plugin.result, "success");
  assert.equal(repaired.report.control.status, "current");
  assert.equal(repaired.report.control.repair.items[0].outcome, "repaired");
  const fixed = readFileSync(self.run.path, "utf8");
  assert.equal(runSealState(self.root, fixed).status, "valid");
  assert.match(fixed, /- revision: 3/u);
  const backup = JSON.parse(readFileSync(join(self.root, repaired.report.control.repair.items[0].backup)));
  assert.equal(backup.source_content, self.legacy);
  assert.equal(backup.phase, "committed");
  // Every subsequent ordinary write remains valid with the self-reference still listed.
  const revision = fixed.match(/^- revision_id: (.+)$/mu)[1];
  writeRun(self.run.path, fixed, revision);
  assert.equal(runSealState(self.root, readFileSync(self.run.path, "utf8")).status, "valid");
  await install(self.root, {}, { chooseControlRepair: () => { throw new Error("no repair should prompt"); } });
  const other = addRun(self.root, "other", (content) => sealRunState(self.root, content));
  const own = readFileSync(self.run.path, "utf8");
  writeRun(self.run.path, own.replace("| PRD |  | missing |", "| PRD | .agdf/control/runs/other/RUN_STATE.md | ready |"),
    own.match(/^- revision_id: (.+)$/mu)[1]);
  const ownWithReference = readFileSync(self.run.path, "utf8");
  assert.equal(runSealState(self.root, ownWithReference).status, "valid");
  writeFileSync(other.path, `${other.content}\nOther run was changed\n`);
  assert.equal(runSealState(self.root, ownWithReference).status, "content_changed", "other run files remain fully hashed");

  // Only the exact proven writer defect is repairable; arbitrary edits and damaged journals are not.
  const tampered = selfReferenceFixture("tampered");
  writeFileSync(tampered.run.path, `${tampered.legacy}\nUnrecorded change\n`);
  assert.equal(inspectSelfReferenceRecovery(tampered.root, "tampered"), null);
  assert.equal(inspectControlRepair(tampered.root).items[0].available, false);
  const corrupt = selfReferenceFixture("corrupt");
  const corruptJournal = JSON.parse(readFileSync(corrupt.journalPath));
  corruptJournal.candidate_content += "\nChanged candidate\n";
  writeFileSync(corrupt.journalPath, JSON.stringify(corruptJournal));
  assert.equal(inspectSelfReferenceRecovery(corrupt.root, "corrupt"), null);

  const snapshot = repository("snapshot");
  const snapshotRun = addRun(snapshot, "snapshot", (content) => sealRunState(snapshot, content));
  git(snapshot, ["init", "-q"]);
  git(snapshot, ["add", ".agdf"]);
  git(snapshot, ["commit", "-qm", "Original sealed run"]);
  const changedSnapshot = snapshotRun.content.replace("Describe the trustworthy outcome.", "Unrecorded objective.");
  writeFileSync(snapshotRun.path, changedSnapshot);
  const snapshotItem = inspectControlRepair(snapshot).items[0];
  let snapshotDiagnostic;
  if (snapshotItem.kind !== "run_snapshot") {
    const objectPath = ".agdf/control/runs/snapshot/RUN_STATE.md";
    const original = git(snapshot, ["show", `HEAD:${objectPath}`]).toString("utf8");
    snapshotDiagnostic = JSON.stringify({
      required: snapshotItem.required, sources: snapshotItem.sources,
      git_root: git(snapshot, ["rev-parse", "--show-toplevel"]).toString().trim(), target: snapshot,
      tree: git(snapshot, ["ls-tree", "--full-tree", "-z", "HEAD", "--", objectPath]).toString(),
      original_seal: runSealState(snapshot, original), changed_seal: runSealState(snapshot, changedSnapshot),
      original_matches: canonicalRunText(original) === canonicalRunText(snapshotRun.content),
    });
  }
  assert.equal(snapshotItem.kind, "run_snapshot", snapshotDiagnostic);
  const snapshotResult = await install(snapshot);
  assert.equal(snapshotResult.report.control.status, "current");
  assert.match(readFileSync(snapshotRun.path, "utf8"), /Describe the trustworthy outcome\./u);
  assert.equal(JSON.parse(readFileSync(join(snapshot, snapshotResult.report.control.repair.items[0].backup))).source_content, changedSnapshot);

  const snapshotRace = repository("snapshot-race");
  const candidateArtifact = ".agdf/control/artefacts/snapshot-race/PRD.md";
  mkdirSync(join(snapshotRace, ".agdf/control/artefacts/snapshot-race"), { recursive: true });
  writeFileSync(join(snapshotRace, candidateArtifact), "Original PRD\n");
  const snapshotRaceRun = addRun(snapshotRace, "snapshot-race", (content) => sealRunState(snapshotRace,
    content.replace("| PRD |  | missing |", `| PRD | ${candidateArtifact} | ready |`)));
  git(snapshotRace, ["init", "-q"]); git(snapshotRace, ["add", ".agdf"]);
  git(snapshotRace, ["commit", "-qm", "Original snapshot with artefact"]);
  const removedReference = snapshotRaceRun.content.replace(`| PRD | ${candidateArtifact} | ready |`, "| PRD |  | missing |");
  writeFileSync(snapshotRaceRun.path, removedReference);
  assert.equal(inspectControlRepair(snapshotRace).items[0].available, true);
  const racedSnapshot = await repairInstallationControl(inspectControlMigration(snapshotRace), {
    chooseRepair: () => "start", confirmRepair: () => "repair",
    hooks: { beforeRunWrite() { writeFileSync(join(snapshotRace, candidateArtifact), "Changed candidate PRD\n"); } },
  });
  assert.equal(racedSnapshot.repair.status, "partial");
  assert.equal(readFileSync(snapshotRaceRun.path, "utf8"), removedReference,
    "artefacts restored by the candidate's references must also stay bound to the displayed hashes");

  const missing = missingFixture("missing");
  const plan = inspectControlRepair(missing.root);
  assert.equal(plan.items[0].available, true);
  assert.equal(plan.items[0].kind, "missing_artefacts");
  assert.equal(plan.items[0].sources[0].source, "git");
  assert.equal(existsSync(join(missing.root, missing.artifact)), false, "search is read-only");
  let offerCalls = 0;
  let confirmCalls = 0;
  const restored = await install(missing.root, {}, {
    chooseControlRepair: (control) => { offerCalls++; assert.equal(control.target, missing.root); return "start"; },
    confirmControlRepair: (displayed) => {
      confirmCalls++;
      assert.equal(displayed.items[0].approval_reset, true);
      displayed.items[0].files[0].bytes = Buffer.from("Forged content\n").toString("base64");
      return "repair";
    },
  });
  assert.deepEqual([offerCalls, confirmCalls], [1, 1]);
  assert.equal(restored.report.control.status, "current");
  assert.equal(readFileSync(join(missing.root, missing.artifact), "utf8"), "Original user request\n");
  const restoredRun = readFileSync(missing.run.path, "utf8");
  assert.match(restoredRun, /\| UR \| missing \|/u);
  assert.equal(runSealState(missing.root, restoredRun).status, "valid");
  assert.doesNotMatch(JSON.stringify(restored.report.control.repair), /source_content|candidate_content|"bytes"/u);

  const parent = repository("monorepo");
  const child = repository("monorepo/child");
  const nestedArtifact = ".agdf/control/artefacts/nested-run/UR.md";
  for (const project of [parent, child]) mkdirSync(join(project, ".agdf/control/artefacts/nested-run"), { recursive: true });
  writeFileSync(join(parent, nestedArtifact), "Parent project must not be selected\n");
  writeFileSync(join(child, nestedArtifact), "Child project original\n");
  const nestedRun = addRun(child, "nested-run", (content) => content.replace("| UR |  | missing |", `| UR | ${nestedArtifact} | ready |`));
  git(parent, ["init", "-q"]); git(parent, ["add", ".agdf", "child/.agdf"]);
  git(parent, ["commit", "-qm", "Separate parent and child originals"]);
  unlinkSync(join(child, nestedArtifact));
  assert.equal(inspectControlRepair(child).items[0].sources[0].git_path, `child/${nestedArtifact}`);
  assert.equal((await install(child)).report.control.status, "current");
  assert.equal(readFileSync(join(child, nestedArtifact), "utf8"), "Child project original\n");
  assert.equal(readFileSync(join(parent, nestedArtifact), "utf8"), "Parent project must not be selected\n");
  assert.equal(runSealState(child, readFileSync(nestedRun.path, "utf8")).status, "valid");

  const noOriginal = repository("no-original");
  const noOriginalRun = addRun(noOriginal, "no-original", (value) => value.replace("| UR |  | missing |",
    "| UR | .agdf/control/artefacts/no-original/REPORT.md | done |"));
  const placeholder = addRun(noOriginal, "placeholder", (value) => value.replace("| UR |  | missing |",
    "| UR | three linked review artefacts | missing |"));
  const future = addRun(noOriginal, "future", (value) => value.replace("control_state_version: 2", "control_state_version: 999"));
  const needed = inspectControlRepair(noOriginal);
  assert.equal(needed.items.some((item) => item.available), false);
  assert.ok(needed.items.flatMap((item) => item.required).some((finding) => finding.path === "three linked review artefacts"));
  const unavailable = await install(noOriginal);
  assert.equal(unavailable.report.control.repair.status, "needs_input");
  for (const file of [noOriginalRun, placeholder, future]) assert.equal(readFileSync(file.path, "utf8"), file.content);

  for (const language of Object.keys(interactionLocales.locales)) {
    const offer = renderControlRepairOffer(inspectControlMigration(noOriginal), { language });
    assert.ok(offer.includes("[1]")); assert.ok(offer.includes("[2]")); assert.ok(offer.includes("[3]"));
    const detail = renderControlRepairPlan(needed, { language });
    assert.ok(detail.includes("REPORT.md")); assert.doesNotMatch(detail, /undefined/u);
    assert.ok(!detail.includes("[1]"), "no unavailable apply choice");
    const result = renderInstallSetupText(unavailable.report, { language });
    assert.ok(result.includes(interactionLocales.locales[language].installSetup.controlRepair.resultDescription));
    assert.ok(result.includes("REPORT.md"));
    for (const answer of ["", null, "2"]) {
      assert.equal(await selectControlRepair(needed, { language, phase: "plan", readChoice: () => answer }), "skip");
    }
    const replies = ["3", "1"];
    const output = [];
    assert.equal(await selectControlRepair(plan, { language, phase: "plan", readChoice: () => replies.shift(),
      write: (value) => output.push(value) }), "repair");
    assert.ok(output.at(-1).includes(plan.items[0].sources[0].commit));
  }

  const stale = missingFixture("stale");
  const staleResult = await install(stale.root, {}, { confirmControlRepair: () => {
    writeFileSync(stale.run.path, `${stale.run.content}\nConcurrent edit\n`);
    return "repair";
  } });
  assert.equal(staleResult.report.control.repair.status, "partial");
  assert.equal(existsSync(join(stale.root, stale.artifact)), false);
  assert.equal(readFileSync(stale.run.path, "utf8"), `${stale.run.content}\nConcurrent edit\n`);

  const appeared = missingFixture("appeared");
  const appearedResult = await install(appeared.root, {}, { confirmControlRepair: () => {
    writeFileSync(join(appeared.root, appeared.artifact), "New document during decision\n");
    return "repair";
  } });
  assert.equal(appearedResult.report.control.repair.status, "partial");
  assert.equal(readFileSync(join(appeared.root, appeared.artifact), "utf8"), "New document during decision\n");
  assert.equal(readFileSync(appeared.run.path, "utf8"), appeared.run.content);

  const assetRace = missingFixture("asset-race");
  const asset = ".agdf/control/artefacts/asset-race/PRD.md";
  writeFileSync(join(assetRace.root, asset), "Existing PRD\n");
  const assetRun = assetRace.run.content.replace("| PRD |  | missing |", `| PRD | ${asset} | ready |`);
  writeFileSync(assetRace.run.path, assetRun);
  const raceResult = await repairInstallationControl(inspectControlMigration(assetRace.root), {
    chooseRepair: () => "start", confirmRepair: () => "repair",
    hooks: { beforeRunWrite() { writeFileSync(join(assetRace.root, asset), "Concurrent PRD\n"); } },
  });
  assert.equal(raceResult.repair.status, "partial");
  assert.equal(existsSync(join(assetRace.root, assetRace.artifact)), false, "rollback restores missing-file tombstones");
  assert.equal(readFileSync(assetRace.run.path, "utf8"), assetRun, "an asset race must never be re-sealed");

  const sourceLink = missingFixture("source-link");
  symlinkSync("elsewhere.md", join(sourceLink.root, sourceLink.artifact));
  git(sourceLink.root, ["add", sourceLink.artifact]);
  git(sourceLink.root, ["commit", "-qm", "Symlink is not an original report"]);
  unlinkSync(join(sourceLink.root, sourceLink.artifact));
  // A deleted symlink must never be materialized as report text. An earlier regular original
  // may still be offered because it is the exact path in this repository's history.
  const linkPlan = inspectControlRepair(sourceLink.root);
  assert.equal(Buffer.from(linkPlan.items[0].files[0].bytes, "base64").toString("utf8"), "Original user request\n");

  const linked = missingFixture("linked");
  symlinkSync(join(missing.root, ".agdf/control/artefacts/missing"), join(linked.root, ".agdf/control/artefacts/linked/symlink"));
  writeFileSync(linked.run.path, linked.run.content.replace(linked.artifact, ".agdf/control/artefacts/linked/symlink/UR.md"));
  assert.equal(inspectControlRepair(linked.root).items[0].available, false);
  assert.equal(readFileSync(join(missing.root, missing.artifact), "utf8"), "Original user request\n");

  for (const boundary of ["beforeRunWrite", "afterRunWrite"]) {
    const interrupted = missingFixture(`interrupted-${boundary.toLowerCase()}`);
    const outcome = await repairInstallationControl(inspectControlMigration(interrupted.root), {
      chooseRepair: () => "start", confirmRepair: () => "repair",
      hooks: { [boundary]() { throw new Error("INJECTED_INTERRUPTION"); } },
    });
    assert.equal(outcome.repair.status, "partial");
    if (boundary === "beforeRunWrite") {
      assert.equal(existsSync(join(interrupted.root, interrupted.artifact)), false);
      assert.equal(readFileSync(interrupted.run.path, "utf8"), interrupted.run.content);
      assert.equal((await install(interrupted.root)).report.control.status, "current");
    } else {
      assert.equal(runSealState(interrupted.root, readFileSync(interrupted.run.path, "utf8")).status, "valid");
      const saved = readFileSync(interrupted.run.path, "utf8");
      await install(interrupted.root);
      assert.equal(readFileSync(interrupted.run.path, "utf8"), saved, "post-rename retry never adds another revision");
    }
  }

  for (const options of [{ json: true }, { controlMigration: "inspect" }]) {
    await install(noOriginal, options, { chooseControlRepair: () => { throw new Error("read-only must not prompt"); } });
  }
  await install(noOriginal, {}, { installPlugin: () => ({ report: pluginReport("failed") }),
    chooseControlRepair: () => { throw new Error("failed plugin install must not repair"); } });

  const cli = missingFixture("cli");
  const output = [];
  let cliOffer = 0;
  let cliConfirm = 0;
  const adapters = { interactive: true, parser: { cwd: cli.root }, env: { AGDF_DATA_DIR: join(base, "cli-data") },
    io: { log: (value) => output.push(value), error: (value) => output.push(value) },
    inspectPluginInstallation: () => ({ status: "not_installed", evidence: [] }),
    prepare: () => ({ root: join(base, "fixture-marketplace"), commit() {}, rollback() {} }),
    askControlRepair: () => { cliOffer++; return "start"; },
    askControlRepairConfirmation: () => { cliConfirm++; return "repair"; },
    exec(_executable, args) {
      if (args.join(" ") === "plugin marketplace list --json") return '{"marketplaces":[]}';
      if (args.join(" ") === "plugin list") return "agdf@agdf 0.14.5\n";
      return "";
    },
  };
  assert.equal(await runCli(["codex", "--json"], adapters), 1);
  assert.deepEqual([cliOffer, cliConfirm], [0, 0]);
  assert.equal(await runCli(["codex", "--runtime-checks", "manual"], adapters), 0);
  assert.deepEqual([cliOffer, cliConfirm], [1, 1]);
  assert.equal(runSealState(cli.root, readFileSync(cli.run.path, "utf8")).status, "valid");
  console.log("Installation repair: 1/2/3, verified checkpoint/Git sources, missing inputs, backups, approval reset, conflicts, interruptions, CLI and EN/DE passed.");
} finally { rmSync(base, { recursive: true, force: true }); }
