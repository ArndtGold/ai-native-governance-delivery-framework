import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { inspectControlMigration, installationControlTarget, migrateInstallationControl } from "../lib/install-setup/control-migration.js";
import { selectControlMigration } from "../lib/install-setup/interaction.js";
import { runInstallSetup } from "../lib/install-setup/service.js";
import { renderControlMigration, renderControlMigrationDecision, renderInstallSetupText } from "../lib/install-setup/presentation.js";
import { initializeCanonicalControl } from "../lib/scaffold/canonical-init.js";
import { generatedFilesForTarget } from "../lib/scaffold/plan.js";
import { renderRunState } from "../lib/control-state/run-state-repository.js";
import { runSealState, sealRunState } from "../lib/control-state/run-seal.js";
import { applyRunRecovery, previewRunRecovery } from "../lib/control-state/run-recovery.js";
import { createLifecycleResult } from "../lib/lifecycle/result.js";
import { parseArgs } from "../lib/cli/parse-args.js";
import { validateCommandOptions } from "../lib/cli/command-registry.js";
import { interactionLocales } from "../lib/cli/runtime-context.js";
import { runCli } from "../lib/cli/application.js";

const base = mkdtempSync(join(tmpdir(), "agdf-install-migration-"));
function repository(name) {
  const root = join(base, name);
  mkdirSync(root);
  initializeCanonicalControl(root, generatedFilesForTarget("init", root, false, {
    artifact_language: "en", chat_language: "en", runtime_language: "en", source: "parameter", detected_locale: "en",
  }));
  return root;
}
function addRun(root, id, transform = (content) => content) {
  const directory = join(root, ".agdf", "control", "runs", id);
  mkdirSync(directory);
  const path = join(directory, "RUN_STATE.md");
  const content = transform(renderRunState(id));
  writeFileSync(path, content);
  return { path, content };
}
function pluginReport(result = "success") {
  return createLifecycleResult({ operation: "update", result, surface: "codex", scope: "global",
    version: { expected: "0.14.5", installed: "0.14.5", status: "verified" },
    verification: { status: result === "success" ? "healthy" : "degraded", evidence: ["fixture_installation"] },
    restart: { required: true, reason: "plugin_reload" },
    next_action: { kind: "restart", text: "Restart host." },
    ...(result === "failed" ? { failure: { phase: "plugin_operation", message: "injected install failure" } } : {}),
  });
}
async function install(root, overrides = {}, dependencies = {}) {
  return runInstallSetup({ options: { target: "codex", dir: root, dirExplicit: true,
    workingDirectory: root, setupRequest: "plugin_only", json: false, ...overrides },
    interactive: Boolean(dependencies.confirmControlMigration), env: {} }, {
    inspectPlugin: () => ({ status: "healthy", evidence: [] }),
    installPlugin: () => ({ report: pluginReport() }), ...dependencies,
  });
}
try {
  const absent = join(base, "absent");
  mkdirSync(absent);
  assert.equal(inspectControlMigration(absent).status, "absent");
  const healthy = repository("healthy");
  const current = addRun(healthy, "current", (content) => sealRunState(healthy, content));
  assert.equal(inspectControlMigration(healthy).status, "current");
  const archive = addRun(healthy, "archive", (content) => content.replace("lifecycle: active", "lifecycle: completed"));
  assert.equal(inspectControlMigration(healthy).runs.find((run) => run.run_id === "archive").status, "historical");
  await install(healthy);
  assert.equal(readFileSync(current.path, "utf8"), current.content);
  assert.equal(readFileSync(archive.path, "utf8"), archive.content);

  const safe = repository("safe");
  const old = addRun(safe, "old");
  const outcome = await install(safe);
  assert.equal(outcome.report.plugin.result, "success");
  assert.equal(outcome.report.control.status, "current");
  assert.equal(outcome.report.control.changes.length, 1);
  assert.equal(runSealState(safe, readFileSync(old.path, "utf8")).status, "valid");
  const backup = JSON.parse(readFileSync(join(safe, outcome.report.control.changes[0].backup), "utf8"));
  assert.equal(backup.source_content, old.content, "recovery retains the original record");
  const migrated = readFileSync(old.path);
  const repeated = await install(safe);
  assert.equal(repeated.report.control.changes.length, 0);
  assert.deepEqual(readFileSync(old.path), migrated, "reinstallation is idempotent");
  for (const boundary of ["beforeRunWrite", "afterRunWrite", "beforeJournalCommit"]) {
    const interrupted = repository(`interrupted-${boundary.toLowerCase()}`);
    const interruptedRun = addRun(interrupted, "interrupted");
    const preview = previewRunRecovery(interrupted, "interrupted");
    assert.throws(() => applyRunRecovery(interrupted, { runId: "interrupted", previewId: preview.preview_id,
      confirmation: preview.confirmation }, { [boundary]() { throw new Error("INJECTED_INTERRUPTION"); } }), /INJECTED_INTERRUPTION/);
    assert.equal(inspectControlMigration(interrupted).status, "repair_required");
    const resumed = await install(interrupted);
    assert.equal(resumed.report.control.status, "current");
    assert.match(readFileSync(interruptedRun.path, "utf8"), /^- revision: 2$/mu);
    assert.equal(resumed.report.control.changes.length, 1);
  }

  const approved = repository("approved");
  const plannedRoot = repository("planned");
  const plannedRun = addRun(plannedRoot, "planned", (content) => content.replace("| UR |  | missing |",
    "| UR | .agdf/control/artefacts/planned/future.md | pending |"));
  assert.equal(inspectControlMigration(plannedRoot).status, "migration_required", "declared future output is not a repair case");
  const plannedMigration = await migrateInstallationControl(plannedRoot, { mode: "safe" });
  assert.equal(plannedMigration.status, "current");
  assert.equal(runSealState(plannedRoot, readFileSync(plannedRun.path, "utf8")).status, "valid");
  assert.equal(existsSync(join(plannedRoot, ".agdf/control/artefacts/planned/future.md")), false,
    "migration never fabricates future evidence");
  const historical = addRun(approved, "historical", (content) => content.replace("| UR | missing |", "| UR | approved | Approval: UR"));
  const pending = await install(approved);
  assert.equal(pending.report.result, "partial");
  assert.equal(pending.report.effective_state, "control_migration_required");
  assert.equal(pending.report.plugin.result, "success", "control migration does not invalidate plugin installation");
  assert.equal(readFileSync(historical.path, "utf8"), historical.content);
  assert.equal(existsSync(join(approved, ".agdf/control/runs/historical/recovery-previews")), false,
    "noninteractive approval migration must not create a preview or change approvals");
  await install(approved, {}, { confirmControlMigration: () => "yes" });
  assert.equal(readFileSync(historical.path, "utf8"), historical.content, "generic yes cannot select a migration batch");
  let seen;
  const recovered = await install(approved, {}, { confirmControlMigration: (plan) => {
    seen = plan;
    assert.equal(plan.runs[0].prior_approvals.some((row) => row.status === "approved"), true);
    return "migrate";
  } });
  assert.equal(recovered.report.control.status, "current");
  assert.match(readFileSync(historical.path, "utf8"), /\| UR \| missing \|/u);
  for (const language of Object.keys(interactionLocales.locales)) {
    assert.ok(renderControlMigration(pending.report.control, { language }).includes(approved));
    assert.ok(renderInstallSetupText(pending.report, { language }).includes(interactionLocales.locales[language].installSetup.controlMigration.states.migration_required));
    const text = renderControlMigrationDecision(seen, { language, details: true });
    assert.ok(text.includes("[1]"));
    assert.ok(text.includes("Approval: UR"));
    assert.doesNotMatch(text, /undefined/);
  }

  const implicit = repository("implicit");
  const untouched = addRun(implicit, "implicit-old");
  const observed = await install(implicit, { dirExplicit: false });
  assert.equal(observed.report.control.status, "migration_required");
  assert.equal(readFileSync(untouched.path, "utf8"), untouched.content, "cwd is a read-only installation observation");
  await install(implicit, { controlMigration: "inspect" });
  assert.equal(readFileSync(untouched.path, "utf8"), untouched.content);
  await install(implicit, { dirExplicit: false }, { confirmControlMigration: () => "yes" });
  assert.equal(readFileSync(untouched.path, "utf8"), untouched.content, "an implicit target needs an explicit migration choice");
  const selected = await install(implicit, { dirExplicit: false }, { confirmControlMigration: (plan) => { assert.equal(plan.target, implicit); return "migrate"; } });
  assert.equal(selected.report.control.status, "current");
  assert.equal(selected.report.control.changes.length, 1);
  // One read-only, snapshot-bound decision covers an implicit repository and historical approvals.
  const batch = repository("batch");
  const batchRuns = ["first", "second"].map((id) => addRun(batch, id,
    (content) => content.replace("| UR | missing |", "| UR | approved | Approval: UR")));
  const blockedRun = addRun(batch, "blocked", (content) => content.replace("| UR |  | missing |",
    "| UR | .agdf/control/artefacts/missing.md | done |"));
  let batchPlan;
  let decisions = 0;
  const decide = (plan) => {
    decisions++;
    batchPlan = plan;
    assert.equal(plan.target, batch);
    assert.equal(plan.runs.length, 2);
    assert.equal(plan.approval_reset_count, 2);
    for (const run of batchRuns) assert.equal(existsSync(join(run.path, "../recovery-previews")), false);
    return "skip";
  };
  await install(batch, { dirExplicit: false }, { confirmControlMigration: decide });
  assert.equal(decisions, 1);
  for (const run of batchRuns) assert.equal(readFileSync(run.path, "utf8"), run.content);
  for (const language of Object.keys(interactionLocales.locales)) {
    const compact = renderControlMigrationDecision(batchPlan, { language });
    assert.ok(compact.includes(batch));
    assert.ok(compact.includes("[1]"));
    assert.ok(compact.includes("[3]"));
    assert.ok(compact.includes("UR"));
    assert.doesNotMatch(compact, /AGDF_RECOVERY|RECOVER |MIGRATE |\nfirst:|\nsecond:|\nblocked:/u);
    assert.ok(compact.split("\n").length < 16);
    const detail = renderControlMigrationDecision(batchPlan, { language, details: true });
    assert.ok(detail.includes("AGDF_RECOVERY_ARTEFACT_MISSING"));
    assert.ok(detail.includes("Approval: UR"));
    assert.doesNotMatch(detail, /undefined/);
    for (const reply of ["", null, "2"]) {
      assert.equal(await selectControlMigration(batchPlan, { language, readChoice: () => reply }), "skip");
    }
    const choices = ["yes", "d", "1"];
    const shown = [];
    assert.equal(await selectControlMigration(batchPlan, { language, readChoice: () => choices.shift(),
      write: (value) => shown.push(value) }), "migrate");
    assert.equal(shown.length, 3);
    assert.ok(shown.at(-1).includes("AGDF_RECOVERY_ARTEFACT_MISSING"));
  }
  await install(batch, { dirExplicit: false, controlMigration: "inspect" }, {
    confirmControlMigration: () => { throw new Error("inspect must not ask"); },
  });
  const grouped = await install(batch, { dirExplicit: false }, { confirmControlMigration: (plan) => {
    decisions++;
    assert.equal(plan.runs.length, 2);
    return "migrate";
  } });
  assert.equal(decisions, 2, "one common decision per installation");
  assert.equal(grouped.report.control.changes.length, 2, "repair cases do not block eligible runs");
  assert.equal(grouped.report.plugin.result, "success");
  assert.equal(grouped.report.control.status, "repair_required");
  assert.equal(readFileSync(blockedRun.path, "utf8"), blockedRun.content);
  for (const run of batchRuns) {
    assert.equal(runSealState(batch, readFileSync(run.path, "utf8")).status, "valid");
    const change = grouped.report.control.changes.find((entry) => entry.run_id === basename(dirname(run.path)));
    assert.equal(JSON.parse(readFileSync(join(batch, change.backup), "utf8")).source_content, run.content);
  }
  const noRepeat = await install(batch, { dirExplicit: false }, {
    confirmControlMigration: () => { throw new Error("no eligible runs must not prompt"); },
  });
  assert.equal(noRepeat.report.control.changes.length, 0);

  const batchStale = repository("batch-stale");
  const changedRun = addRun(batchStale, "changed", (content) => content.replace("| UR | missing |", "| UR | approved | Approval: UR"));
  const unchangedRun = addRun(batchStale, "unchanged");
  let addedRun;
  const staleBatch = await install(batchStale, { dirExplicit: false }, { confirmControlMigration: (plan) => {
    writeFileSync(changedRun.path, `${changedRun.content}\nConcurrent edit\n`);
    addedRun = addRun(batchStale, "newly-added");
    plan.runs[0].source_content_digest = "attempted mutation";
    return "migrate";
  } });
  assert.equal(staleBatch.report.control.changes.length, 1);
  assert.equal(runSealState(batchStale, readFileSync(unchangedRun.path, "utf8")).status, "valid");
  assert.equal(readFileSync(changedRun.path, "utf8"), `${changedRun.content}\nConcurrent edit\n`);
  assert.equal(readFileSync(addedRun.path, "utf8"), addedRun.content, "consent cannot include later discovered runs");

  const failedUpdate = repository("failed-update");
  const failedRun = addRun(failedUpdate, "failed-run");
  await install(failedUpdate, {}, { installPlugin: () => ({ report: pluginReport("failed") }) });
  assert.equal(readFileSync(failedRun.path, "utf8"), failedRun.content, "failed plugin update must not migrate controls");

  const broken = repository("broken");
  const missing = addRun(broken, "missing", (content) => content.replace("| UR |  | missing |", "| UR | .agdf/control/artefacts/missing.md | done |"));
  const future = addRun(broken, "future", (content) => content.replace("control_state_version: 2", "control_state_version: 999"));
  const invalid = addRun(broken, "invalid", (content) => content.replace("- revision: 1", "- content_seal: broken\n- revision: 1"));
  const sealed = addRun(broken, "changed", (content) => sealRunState(broken, content));
  writeFileSync(sealed.path, sealed.content.replace("Describe the trustworthy outcome.", "Changed outside recording."));
  const damaged = await install(broken);
  assert.equal(damaged.report.effective_state, "control_repair_required");
  assert.equal(damaged.report.control.changes.length, 0);
  for (const file of [missing, future, invalid]) assert.equal(readFileSync(file.path, "utf8"), file.content);
  assert.equal(damaged.report.control.runs.find((run) => run.run_id === "changed").seal_status, "content_changed");

  const linked = join(base, "linked");
  mkdirSync(linked);
  symlinkSync(join(safe, ".agdf"), join(linked, ".agdf"));
  assert.equal((await migrateInstallationControl(linked, { mode: "safe" })).status, "repair_required");
  assert.deepEqual(readFileSync(old.path), migrated);
  const dangling = join(base, "dangling");
  mkdirSync(dangling);
  symlinkSync(join(base, "missing-target"), join(dangling, ".agdf"));
  assert.equal(inspectControlMigration(dangling).status, "repair_required");
  const stale = repository("stale");
  const staleRun = addRun(stale, "stale", (content) => content.replace("| UR | missing |", "| UR | approved | Approval: UR"));
  const conflicted = await install(stale, {}, { confirmControlMigration: () => {
    writeFileSync(staleRun.path, `${staleRun.content}\nConcurrent edit\n`);
    return "migrate";
  } });
  assert.equal(conflicted.report.control.status, "repair_required");
  assert.equal(conflicted.report.control.changes.length, 0);
  assert.equal(readFileSync(staleRun.path, "utf8"), `${staleRun.content}\nConcurrent edit\n`);

  const artefactRace = repository("artefact-race");
  mkdirSync(join(artefactRace, ".agdf/control/artefacts"));
  const artefactPath = join(artefactRace, ".agdf/control/artefacts/UR.md");
  writeFileSync(artefactPath, "Original scope\n");
  const artefactRun = addRun(artefactRace, "artefact", (content) => content.replace("| UR |  | missing |",
    "| UR | .agdf/control/artefacts/UR.md | missing |"));
  const changedArtefact = await install(artefactRace, {}, { confirmControlMigration: () => {
    writeFileSync(artefactPath, "New scope during decision\n");
    return "migrate";
  } });
  assert.equal(changedArtefact.report.control.changes.length, 0);
  assert.ok(changedArtefact.report.control.diagnostics.some((finding) => finding.code === "AGDF_STALE_RUN_REVISION"));
  assert.equal(readFileSync(artefactRun.path, "utf8"), artefactRun.content);
  assert.equal(existsSync(join(artefactRace, ".agdf/control/runs/artefact/recovery-previews")), false);

  assert.deepEqual(installationControlTarget({ target: "opencode", dirExplicit: true, dir: "/host-config", workingDirectory: "/repo" }),
    { root: "/repo", writable: false });
  const args = parseArgs(["codex", "--control-dir", safe, "--control-migration", "safe"]);
  assert.doesNotThrow(() => validateCommandOptions(args.options));
  assert.throws(() => parseArgs(["codex", "--control-dir", "relative"]), /absolute repository/);
  assert.throws(() => validateCommandOptions(parseArgs(["codex", "--control-migration", "safe"]).options), /explicit repository/);
  assert.throws(() => validateCommandOptions(parseArgs(["status", "--control-dir", safe]).options), /installation commands/);
  // Exercise the public CLI path with the actual installer and recovery owners; only host commands
  // are fixtures, so no user-wide plugin installation or permission state is changed.
  const cliRoot = repository("cli-install");
  const cliRun = addRun(cliRoot, "cli-old");
  const output = [];
  const cliAdapters = { interactive: false, parser: { cwd: cliRoot }, env: { AGDF_DATA_DIR: join(base, "cli-data") },
    inspectPluginInstallation: () => ({ status: "not_installed", evidence: [] }),
    io: { log: (value) => output.push(value), error: (value) => output.push(value) },
    prepare: () => ({ root: join(base, "fixture-marketplace"), commit() {}, rollback() {} }),
    exec(_executable, args) {
      if (args.join(" ") === "plugin marketplace list --json") return '{"marketplaces":[]}';
      if (args.join(" ") === "plugin list") return "agdf@agdf 0.14.5\n";
      return "";
    },
  };
  assert.equal(await runCli(["codex", "--control-dir", cliRoot, "--control-migration", "safe", "--json"], cliAdapters), 0);
  const cliReport = JSON.parse(output.at(-1));
  assert.equal(cliReport.plugin.result, "success");
  assert.equal(cliReport.control.status, "current");
  assert.equal(cliReport.control.changes.length, 1);
  assert.equal(runSealState(cliRoot, readFileSync(cliRun.path, "utf8")).status, "valid");
  const cliBatchRoot = repository("cli-batch");
  const cliBatchRun = addRun(cliBatchRoot, "cli-approved", (content) => content.replace("| UR | missing |", "| UR | approved | Approval: UR"));
  addRun(cliBatchRoot, "cli-blocked", (content) => content.replace("| UR |  | missing |", "| UR | .agdf/control/artefacts/missing.md | done |"));
  let cliChoices = 0;
  const cliBatchAdapters = { ...cliAdapters, interactive: true, askControlRepair: () => "skip", parser: { cwd: cliBatchRoot },
    askControlMigration: (plan) => {
      cliChoices++;
      assert.equal(plan.target, cliBatchRoot);
      assert.equal(plan.approval_reset_count, 1);
      return "migrate";
    },
  };
  // JSON stays noninteractive even with an interactive host adapter.
  assert.equal(await runCli(["codex", "--json"], cliBatchAdapters), 1);
  assert.equal(cliChoices, 0);
  assert.equal(readFileSync(cliBatchRun.path, "utf8"), cliBatchRun.content);
  output.length = 0;
  assert.equal(await runCli(["codex", "--runtime-checks", "manual"], cliBatchAdapters), 1);
  assert.equal(cliChoices, 1);
  assert.equal(runSealState(cliBatchRoot, readFileSync(cliBatchRun.path, "utf8")).status, "valid");
  assert.doesNotMatch(output.join("\n"), /RECOVER |MIGRATE |AGDF_RECOVERY_ARTEFACT_MISSING|cli-blocked:/u);
  output.length = 0;
  assert.equal(await runCli(["codex", "--runtime-checks", "manual", "--verbose"], cliBatchAdapters), 1);
  assert.equal(cliChoices, 1, "remaining repair-only inventory does not prompt again");
  assert.match(output.join("\n"), /AGDF_RECOVERY_ARTEFACT_MISSING/u);
  console.log("Installation control migration: batch consent, partial migration, read-only deferral, bound snapshots, backups, CLI/JSON and EN/DE rendering passed.");
} finally {
  rmSync(base, { recursive: true, force: true });
}
