import assert from "node:assert/strict";
import { execFileSync, spawnSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, symlinkSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// Exercise the shipped plugin runtime, not source create-agdf as a substitute for missing commands.
const temporary = mkdtempSync(join(tmpdir(), "agdf-intake-e2e-"));
const sourceCli = resolve(import.meta.dirname, "../bin/create-agdf.js");
try {
  const archive = join(temporary, "plugin.tgz");
  execFileSync("tar", ["-czf", archive, "-C", resolve(import.meta.dirname, "../generated"), "plugins/agdf", ".agents/plugins/marketplace.json"]);
  execFileSync("tar", ["-xzf", archive, "-C", temporary]);
  const plugin = join(temporary, "plugins", "agdf");
  const validator = join(plugin, "runtime", "agdf-local.js");
  const root = join(temporary, "project");
  mkdirSync(root);
  execFileSync("git", ["init", "-q", root]);
  execFileSync(process.execPath, [sourceCli, "init", "--dir", root], { stdio: "pipe" });
  const env = { ...process.env, AGDF_SURFACE: "codex", PLUGIN_ROOT: plugin };
  delete env.AGDF_RUN_ID;
  const call = (...args) => {
    const r = spawnSync(process.execPath, [validator, ...args], { encoding: "utf8", env });
    assert.equal(r.error, undefined);
    let value;
    try { value = JSON.parse(r.stdout); } catch { value = null; }
    return { code: r.status, text: r.stdout + r.stderr, value };
  };
  const run = (command, ...args) => call(command, "--dir", root, ...args);
  const dispatch = (...args) => call("skill-dispatch", "--json", "--skill", "gate-check", "--surface", "codex", "--language", "de",
    "--working-directory", root, "--target-source", "explicit_target", "--primary-target", root, ...args).value;
  const statePath = (id) => join(root, ".agdf/control/runs", id, "RUN_STATE.md");
  const revision = (id) => readFileSync(statePath(id), "utf8").match(/^- revision_id: (.+)$/mu)[1];
  const snapshot = (dir = join(root, ".agdf")) => Object.fromEntries(readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const path = join(dir, e.name);
    return e.isDirectory() ? Object.entries(snapshot(path)) : [[path, createHash("sha256").update(readFileSync(path)).digest("hex")]];
  }));
  for (const id of ["foreign-a", "foreign-b"]) {
    const probe = dispatch("--intake", "--intake-mode", "new", "--run", "new-run");
    assert.equal(probe.continuation.phase, "run_missing", "zero/one foreign runs must not hijack new scope");
    const r = run("run-create", "--run", id); assert.equal(r.code, 0, r.text); }
  const foreign = ["foreign-a", "foreign-b"].map(id => readFileSync(statePath(id), "utf8"));
  let before = snapshot();
  const ambiguous = dispatch();
  assert.equal(ambiguous.control.blocking_reason, "AGDF_ACTIVE_RUN_AMBIGUOUS");
  assert.equal(ambiguous.control.missing_approval, "none");
  assert.doesNotMatch(ambiguous.host_action.text, /Approval: UR/);
  assert.deepEqual(snapshot(), before, "status is read-only");
  for (const args of [["--intake-mode", "new"], ["--continue-delivery"], ["--intake", "--run", "new-run", "--continue-delivery"]]) {
    assert.equal(dispatch(...args).outcome, "invalid_input");
  }
  const start = dispatch("--intake", "--intake-mode", "new", "--run", "new-run");
  assert.equal(start.outcome, "intake_continuation");
  assert.equal(start.continuation.run_id, "new-run");
  assert.match(start.continuation.steps[0].command, /--run new-run$/u);
  assert.deepEqual(snapshot(), before, "new dispatch only prepares steps");
  assert.equal(run("run-create", "--run", "new-run").code, 0);
  assert.equal(run("run-create", "--run", "new-run").code, 1);
  assert.equal(dispatch("--intake", "--intake-mode", "new", "--run", "new-run").diagnostics[0].code, "AGDF_RUN_COLLISION");
  const resume = () => dispatch("--intake", "--intake-mode", "resume", "--run", "new-run");
  assert.equal(resume().continuation.phase, "ur_missing");
  const artefacts = join(root, ".agdf/control/artefacts/new-run");
  mkdirSync(artefacts, { recursive: true });
  const ur = join(artefacts, "UR.md");
  writeFileSync(ur, "# UR: Bound intake\n\nA new scope.\n");
  assert.equal(run("run-step", "--run", "new-run", "--revision", revision("new-run"), "--step", "ur", "--title", "Bound intake").value.outcome, "recorded");
  const routeFirst = resume();
  assert.equal(routeFirst.outcome, "skill_continuation");
  assert.equal(routeFirst.continuation.phase, "pre_ur_approval_routing");
  assert.equal(routeFirst.continuation.skill_id, "brownfield-analysis");
  assert.equal(dispatch("--run", "new-run", "--continue-delivery").continuation.phase, "pre_ur_approval_routing", "a ready UR is routed before its approval is presented");
  writeFileSync(join(artefacts, "BROWNFIELD_REVIEW.md"), "# Brownfield Review\n\nStructured delivery is proportionate to this change.\n");
  const routed = run("run-step", "--run", "new-run", "--revision", revision("new-run"), "--step", "route", "--route", "structured_delivery",
    "--reason", "The change spans governed control flow and host-facing behavior.", "--evidence", ".agdf/control/artefacts/new-run/BROWNFIELD_REVIEW.md");
  assert.equal(routed.value.outcome, "recorded", routed.text);
  const routeAwareCard = run("gate-check", "--run", "new-run", "--json").value.status_card;
  assert.equal(routeAwareCard.next_gate_after_approval, "PRD");
  assert.equal(routeAwareCard.next_user_gate, "PRD");
  assert.equal(routeAwareCard.user_action_required, "yes");
  assert.match(routeAwareCard.allowed_after_approval, /PRD/u);
  assert.equal(resume().continuation.phase, "presentation_required", "after route recording, intake presents the exact UR revision");
  const present = () => run("run-present", "--run", "new-run", "--gate", "UR", "--revision", revision("new-run"), "--language", "de").value;
  const approve = (id, response = "Approval: UR", rev = revision("new-run")) => run("run-approve", "--run", "new-run", "--gate", "UR", "--revision", rev, "--response", response,
    ...(id ? ["--presentation", id] : [])).value;
  assert.equal(approve().reason, "presentation_required");
  const p = present();
  assert.equal(p.outcome, "prepared", JSON.stringify(p));
  assert.equal(p.schema_version, "1", "CLI envelope uses the canonical string version");
  assert.match(p.text, /## Kurzfassung · UR/u);
  assert.match(p.text, /## Prüfartefakt · UR/u);
  assert.match(p.text, /Artefakt: \[UR\.md\]\(<[^>]+\/UR\.md>\)/u, "the exact UR file must be clickable");
  assert.match(p.text, /SHA-256: `sha256:[0-9a-f]{64}`/u);
  assert.match(p.text, /- Inhalt: A new scope\./u, "short artefact content appears in the summary");
  assert.ok(p.text.indexOf("## Kurzfassung · UR") < p.text.indexOf("Jetzt freigeben"), "summary appears before the approval action");
  assert.match(p.artefact_digest, /^sha256:[0-9a-f]{64}$/u);
  assert.match(p.summary_digest, /^sha256:[0-9a-f]{64}$/u);
  assert.match(p.text, /Approval: UR/u);
  const recordPath = join(root, ".agdf/control/runs/new-run/presentations", `${p.presentation_id}.json`);
  const record = readFileSync(recordPath);
  const storedPresentation = JSON.parse(record.toString());
  assert.equal(storedPresentation.record.summary_digest, p.summary_digest, "the prepared summary digest is persisted with the binding");
  before = snapshot();
  for (const value of ["revise", "decline", "cancel", "Approval: PRD"]) assert.equal(approve(p.presentation_id, value).outcome, "rejected");
  const emptyReply = run("run-approve", "--run", "new-run", "--gate", "UR", "--revision", revision("new-run"), "--presentation", p.presentation_id, "--response", "");
  assert.notEqual(emptyReply.code, 0, "empty input cannot approve");
  assert.deepEqual(snapshot(), before, "rejection and waiting without a response grant no authority");
  assert.equal(approve("../outside").reason, "presentation_required");
  const originalUr = readFileSync(ur);
  writeFileSync(ur, `${originalUr}\nA changed artefact invalidates its summary and link binding.\n`);
  assert.equal(approve(p.presentation_id).reason, "gate_not_ready", "a changed source artefact blocks approval before reusing the prepared summary");
  writeFileSync(ur, originalUr);
  assert.deepEqual(snapshot(), before, "a changed linked artefact cannot persist approval");
  const tamperedEnvelope = JSON.parse(record.toString());
  tamperedEnvelope.record.artefact_digest = `sha256:${"0".repeat(64)}`;
  writeFileSync(recordPath, JSON.stringify(tamperedEnvelope));
  assert.equal(approve(p.presentation_id).reason, "presentation_binding_invalid");
  writeFileSync(recordPath, record);
  unlinkSync(recordPath);
  const outside = join(temporary, "outside.json");
  writeFileSync(outside, record);
  symlinkSync(outside, recordPath);
  assert.equal(approve(p.presentation_id).reason, "presentation_path_invalid");
  unlinkSync(recordPath); writeFileSync(recordPath, record);
  writeFileSync(ur, "# UR: Bound intake\n\nChanged scope.\n");
  assert.equal(approve(p.presentation_id).outcome, "rejected");
  assert.equal(run("run-update", "--run", "new-run", "--revision", revision("new-run")).value.outcome, "updated");
  assert.equal(approve(p.presentation_id).reason, "presentation_binding_invalid");
  const fresh = present();
  const previous = revision("new-run");
  const simultaneous = () => new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [validator, "run-approve", "--dir", root, "--run", "new-run",
      "--gate", "UR", "--revision", previous, "--presentation", fresh.presentation_id, "--response", "Approval: UR"], { env });
    let output = "";
    child.stdout.on("data", chunk => { output += chunk; });
    child.stderr.on("data", chunk => { output += chunk; });
    child.on("error", reject);
    child.on("close", () => { try { resolveResult(JSON.parse(output)); } catch { reject(new Error(output)); } });
  });
  const results = await Promise.all([simultaneous(), simultaneous()]);
  assert.equal(results.filter(r => r.outcome === "approved").length, 1, "concurrent replies approve once");
  assert.equal(results.filter(r => r.outcome === "rejected").length, 1);
  assert.equal(approve(fresh.presentation_id, "Approval: UR", previous).outcome, "rejected");
  before = snapshot();
  assert.equal(dispatch("--run", "new-run").terminal, true);
  assert.deepEqual(snapshot(), before);
  const continuation = dispatch("--run", "new-run", "--continue-delivery");
  assert.equal(continuation.outcome, "control_result");
  assert.equal(continuation.control.current_gate, "PRD", "the preselected route advances directly to its next gate after UR approval");
  assert.deepEqual(snapshot(), before);
  assert.equal(continuation.terminal, true, "missing next artefact cannot start another internal skill");
  assert.deepEqual(["foreign-a", "foreign-b"].map(id => readFileSync(statePath(id), "utf8")), foreign);
  console.log(`intake continuation packaged-runtime E2E passed (new/resume, binding, rejection, read-only, recovery, route); archive sha256:${createHash("sha256").update(readFileSync(archive)).digest("hex")}`);
} finally { rmSync(temporary, { recursive: true, force: true }); }
