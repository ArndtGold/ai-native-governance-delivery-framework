import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  aggregate,
  createRun,
  discoverRuns,
  migrateLegacy,
  parseRunState,
  renderLegacyProjection,
  resolveRuns,
  verifyLegacyProjection,
  writeRun,
  validateGateApprovalResponse,
} from "../lib/control-state/index.js";
import { parseControlState } from "../lib/control-state/run-state-parser.js";

const root = mkdtempSync(join(tmpdir(), "agdf-control-state-"));
const cli = join(import.meta.dirname, "..", "bin", "create-agdf.js");
try {
  const approvalCandidate = Object.freeze({
    response: "Approval: TP",
    responseOrigin: "deliberate_user_input",
    expectedApproval: "Approval: TP",
    expectedRunId: "run-a",
    currentRunId: "run-a",
    expectedGate: "TP",
    currentGate: "TP",
    expectedRevisionId: "revision-a",
    currentRevisionId: "revision-a",
    durableArtefactReady: true,
  });
  assert.deepEqual(validateGateApprovalResponse(approvalCandidate), { accepted: true, reason: "accepted" });
  for (const [name, override, reason] of [
    ["unavailable adapter result", { response: "" }, "empty_response"],
    ["non-deliberate response", { responseOrigin: "hook" }, "non_deliberate_response"],
    ["empty response", { response: "" }, "empty_response"],
    ["revise", { response: "Revise" }, "wrong_or_non_approval_response"],
    ["decline", { response: "Decline" }, "wrong_or_non_approval_response"],
    ["formula mismatch", { expectedApproval: "Approval: QA" }, "approval_formula_mismatch"],
    ["stale gate", { currentGate: "QA" }, "changed_or_wrong_gate"],
    ["changed run", { currentRunId: "run-b" }, "changed_or_wrong_run"],
    ["stale revision", { currentRevisionId: "revision-b" }, "stale_revision"],
    ["missing artefact", { durableArtefactReady: false }, "durable_artefact_not_ready"],
  ]) {
    const before = JSON.stringify(approvalCandidate);
    assert.deepEqual(
      validateGateApprovalResponse({ ...approvalCandidate, ...override }),
      { accepted: false, reason },
      name,
    );
    assert.equal(JSON.stringify(approvalCandidate), before, `${name} must not mutate control input`);
  }

  const a = createRun(root, "run-a", "## Objective\n\nA\n");
  assert.equal(discoverRuns(root).length, 1);
  assert.equal(resolveRuns(root, {}).run.run_id, "run-a");
  createRun(root, "run-b", "## Objective\n\nB\n");
  assert.deepEqual(discoverRuns(root).map((run) => run.run_id), ["run-a", "run-b"]);
  assert.throws(() => resolveRuns(root, {}), /AGDF_ACTIVE_RUN_AMBIGUOUS/);
  assert.equal(resolveRuns(root, { runIdArg: "run-b" }).run.run_id, "run-b");
  assert.equal(resolveRuns(root, { runIdEnv: "run-a" }).selection_source, "environment");
  assert.equal(resolveRuns(root, { runIdArg: "run-a", runIdEnv: "run-a" }).run.run_id, "run-a");
  assert.throws(() => resolveRuns(root, { runIdArg: "unknown" }), /AGDF_RUN_NOT_SELECTABLE/);
  assert.throws(() => resolveRuns(root, { runIdArg: "run-a", allActive: true }), /AGDF_SELECTOR_CONFLICT/);
  assert.throws(
    () => resolveRuns(root, { runIdArg: "run-a", runIdEnv: "run-b" }),
    /AGDF_SELECTOR_CONFLICT/,
  );
  const parsed = parseRunState(readFileSync(a, "utf8"), "run-a");
  assert.equal(parsed.valid, true);
  const controlStateFixture = `# AGDF Run State

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| QA | pass | QA report |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| Brownfield Review | BROWNFIELD_REVIEW.md | done | reviewed |
| Brownfield Analysis | BROWNFIELD_ANALYSIS.md | done | analysed |
| CD+Tests | CD_TESTS.md | done | tested |
| CR | CODE_REVIEW.md | done | reviewed |
| QA | QA_REPORT.md | passed | report status remains passed |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Canonical heading evidence.
- evidence: BROWNFIELD_REVIEW.md
`;
  const parsedControlState = parseControlState(controlStateFixture, {
    userGates: ["UR", "PRD", "SD", "TP", "QA", "UAT"],
    internalSteps: ["Brownfield Review", "Brownfield Analysis", "CD+Tests", "CR"],
  });
  assert.equal(parsedControlState.approvals.get("QA")?.status, "approved");
  assert.equal(parsedControlState.artefacts.get("QA")?.status, "passed");
  assert.deepEqual(
    [...parsedControlState.artefacts.keys()],
    ["Brownfield Review", "Brownfield Analysis", "CD+Tests", "CR", "QA"],
  );
  assert.equal(parsedControlState.mode_slice_decision.decision, "structured_slice");
  const legacyMode = parseControlState(
    controlStateFixture.replace("## Mode/Slice Decision", "## Mode / Slice Decision"),
    { userGates: ["QA"], internalSteps: [] },
  );
  assert.equal(legacyMode.mode_slice_decision.decision, "structured_slice");
  const canonicalPrecedence = parseControlState(`${controlStateFixture}
## Mode / Slice Decision

- decision: block
- required_next_gate: none
- scope_reason: Legacy duplicate.
- evidence: legacy
`, { userGates: ["QA"], internalSteps: [] });
  assert.equal(canonicalPrecedence.mode_slice_decision.decision, "structured_slice");
  for (const status of ["pass", "passed", "approved"]) {
    const qaState = parseControlState(controlStateFixture.replace("| QA | pass | QA report |", `| QA | ${status} | QA report |`), {
      userGates: ["QA"],
      internalSteps: [],
    });
    assert.equal(qaState.approvals.get("QA")?.status, "approved");
  }
  for (const [replacement, code] of [
    ["- lifecycle: broken", "AGDF_RUN_LIFECYCLE_INVALID"],
    ["- revision: 0", "AGDF_RUN_REVISION_INVALID"],
    ["- control_state_version: 9", "AGDF_RUN_VERSION_UNSUPPORTED"],
  ]) {
    const bad = parsed.content.replace(
      /^- (lifecycle|revision|control_state_version):.*$/m,
      replacement,
    );
    assert.ok(
      parseRunState(bad, "run-a").findings.some((f) => f.code === code),
    );
  }
  assert.ok(
    parseRunState(
      parsed.content.replace("- run_id: run-a", "- run_id: run-a\n- run_id: run-a"),
      "run-a",
    ).findings.some((f) => f.code === "AGDF_RUN_FIELD_DUPLICATE"),
  );
  assert.ok(
    parseRunState(parsed.content, "different-run").findings.some(
      (finding) => finding.code === "AGDF_RUN_PATH_MISMATCH",
    ),
  );
  assert.ok(
    parseRunState(parsed.content.replace("- run_id: run-a", "- run_id: ../escape"), "run-a").findings.some(
      (finding) => finding.code === "AGDF_RUN_ID_INVALID",
    ),
  );
  assert.ok(
    parseRunState(parsed.content.replace(/^- revision_id:.*$/m, "- revision_id: invalid"), "run-a").findings.some(
      (finding) => finding.code === "AGDF_RUN_REVISION_ID_INVALID",
    ),
  );
  assert.ok(
    parseRunState(`${parsed.content}\n| malformed table row`, "run-a").findings.some(
      (finding) => finding.code === "AGDF_RUN_TABLE_INVALID",
    ),
  );
  assert.throws(
    () => writeRun(a, parsed.content, "stale"),
    /AGDF_STALE_RUN_REVISION/,
  );
  assert.equal(
    writeRun(a, parsed.content, parsed.meta.revision_id).meta.revision,
    "2",
  );
  assert.equal(readdirSync(join(root, ".agdf", "control", "runs", "run-a")).some((entry) => entry.includes(".tmp-")), false);
  assert.equal(readdirSync(join(root, ".agdf", "control", "runs", "run-a")).some((entry) => entry.endsWith(".lock")), false);
  const lockedState = parseRunState(readFileSync(a, "utf8"), "run-a");
  writeFileSync(`${a}.lock`, "held");
  assert.throws(() => writeRun(a, lockedState.content, lockedState.meta.revision_id), /AGDF_RUN_WRITE_LOCKED/);
  rmSync(`${a}.lock`);

  const emptyRoot = mkdtempSync(join(tmpdir(), "agdf-control-empty-"));
  assert.throws(() => resolveRuns(emptyRoot), /AGDF_ACTIVE_RUN_MISSING/);
  rmSync(emptyRoot, { recursive: true, force: true });
  assert.equal(
    aggregate([
      { run_id: "b", status: "warn" },
      { run_id: "a", status: "block" },
    ]).status,
    "block",
  );
  assert.equal(aggregate([]).status, "revise");
  assert.equal(aggregate([], { allowNoActiveRuns: true }).status, "pass");

  const cliRoot = mkdtempSync(join(tmpdir(), "agdf-control-cli-"));
  const help = execFileSync(process.execPath, [cli, "--help"], { encoding: "utf8" });
  for (const expected of ["--run <run_id>", "--all-active", "run-create", "run-migrate", "run-render-legacy"]) {
    assert.match(help, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  execFileSync(process.execPath, [cli, "run-create", "--dir", cliRoot, "--run", "cli-run"]);
  assert.ok(readFileSync(join(cliRoot, ".agdf", "control", "runs", "cli-run", "RUN_STATE.md"), "utf8").includes("- run_id: cli-run"));
  const cliLegacyPath = join(cliRoot, ".agdf", "control", "AGDF_RUN.md");
  writeFileSync(cliLegacyPath, "# AGDF Run State\n\nunmarked legacy\n");
  const mixedAuthority = spawnSync(process.execPath, [cli, "doctor", "--dir", cliRoot, "--all-active", "--json"], { encoding: "utf8" });
  assert.notEqual(mixedAuthority.status, 0);
  assert.ok(JSON.parse(mixedAuthority.stdout).findings.some((finding) => finding.code === "AGDF_LEGACY_PROJECTION_DRIFT"));
  rmSync(cliLegacyPath);
  const illegalAllActive = spawnSync(process.execPath, [cli, "gate-check", "--dir", cliRoot, "--all-active"], { encoding: "utf8" });
  assert.notEqual(illegalAllActive.status, 0);
  assert.match(illegalAllActive.stderr, /--all-active is supported only/);
  const missingRenderSelector = spawnSync(process.execPath, [cli, "run-render-legacy", "--dir", cliRoot], { encoding: "utf8" });
  assert.notEqual(missingRenderSelector.status, 0);
  assert.match(missingRenderSelector.stderr, /requires --run/);
  rmSync(cliRoot, { recursive: true, force: true });

  const ambiguousRoot = mkdtempSync(join(tmpdir(), "agdf-control-ambiguous-"));
  execFileSync(process.execPath, [cli, "init", "--dir", ambiguousRoot]);
  rmSync(join(ambiguousRoot, ".agdf", "control", "AGDF_RUN.md"), { force: true });
  execFileSync(process.execPath, [cli, "run-create", "--dir", ambiguousRoot, "--run", "ambiguous-run-a"]);
  execFileSync(process.execPath, [cli, "run-create", "--dir", ambiguousRoot, "--run", "ambiguous-run-b"]);
  for (const target of ["doctor", "gate-check", "delivery-map"]) {
    const ambiguous = spawnSync(process.execPath, [cli, target, "--dir", ambiguousRoot, "--json"], { encoding: "utf8" });
    assert.notEqual(ambiguous.status, 0);
    assert.equal(ambiguous.stderr, "", `${target} must not crash with a raw stack trace on an ambiguous multi-run selection`);
    const report = JSON.parse(ambiguous.stdout);
    const findings = report.doctor_report?.findings ?? report.findings ?? [];
    assert.ok(
      findings.some((finding) => finding.code === "AGDF_ACTIVE_RUN_AMBIGUOUS"),
      `${target} must report AGDF_ACTIVE_RUN_AMBIGUOUS as a structured finding instead of throwing`,
    );
  }
  rmSync(ambiguousRoot, { recursive: true, force: true });

  const legacyRoot = mkdtempSync(join(tmpdir(), "agdf-legacy-"));
  mkdirSync(join(legacyRoot, ".agdf", "control"), { recursive: true });
  writeFileSync(
    join(legacyRoot, ".agdf", "control", "AGDF_RUN.md"),
    "# AGDF Run State\n\n## Run Meta\n\n- run_id: legacy-run\n- mode: structured_delivery\n- current_gate: TP\n- decision: in_progress\n- owner: test-owner\n\n## Objective\n\nLegacy objective\n",
  );
  assert.equal(migrateLegacy(legacyRoot).status, "migrated");
  assert.equal(migrateLegacy(legacyRoot).status, "already_migrated");
  const canonical = join(
    legacyRoot,
    ".agdf",
    "control",
    "runs",
    "legacy-run",
    "RUN_STATE.md",
  );
  const migratedState = parseRunState(readFileSync(canonical, "utf8"), "legacy-run");
  assert.equal(migratedState.meta.current_gate, "TP");
  assert.equal(migratedState.meta.owner, "test-owner");
  writeFileSync(
    join(legacyRoot, ".agdf", "control", "AGDF_RUN.md"),
    renderLegacyProjection(canonical, legacyRoot),
  );
  assert.equal(verifyLegacyProjection(legacyRoot).status, "valid");
  const projectionPath = join(legacyRoot, ".agdf", "control", "AGDF_RUN.md");
  const validProjection = readFileSync(projectionPath, "utf8");
  writeFileSync(
    projectionPath,
    validProjection.replace("Legacy objective", "Changed projection"),
  );
  assert.equal(
    verifyLegacyProjection(legacyRoot).status,
    "legacy_projection_drift",
  );
  writeFileSync(projectionPath, validProjection);
  writeFileSync(canonical, `${readFileSync(canonical, "utf8")}\nchanged\n`);
  assert.equal(
    verifyLegacyProjection(legacyRoot).status,
    "legacy_projection_drift",
  );
  const beforeFailure = readFileSync(
    join(legacyRoot, ".agdf", "control", "AGDF_RUN.md"),
  );
  assert.throws(
    () => migrateLegacy(legacyRoot, "different-run"),
    /AGDF_RUN_COLLISION|AGDF_LEGACY_ALREADY_PROJECTED/,
  );
  assert.equal(
    readFileSync(join(legacyRoot, ".agdf", "control", "AGDF_RUN.md")).equals(
      beforeFailure,
    ),
    true,
  );
  const injectedRoot = mkdtempSync(join(tmpdir(), "agdf-migration-failure-"));
  mkdirSync(join(injectedRoot, ".agdf", "control"), { recursive: true });
  const injectedLegacyPath = join(injectedRoot, ".agdf", "control", "AGDF_RUN.md");
  const injectedLegacy = "# AGDF Run State\n\n## Objective\n\nFailure injection\n";
  writeFileSync(injectedLegacyPath, injectedLegacy);
  assert.throws(
    () => migrateLegacy(injectedRoot, "injected-run", { readFile: () => "invalid readback" }),
    /AGDF_MIGRATION_VERIFICATION_FAILED/,
  );
  assert.equal(readFileSync(injectedLegacyPath, "utf8"), injectedLegacy);
  assert.equal(discoverRuns(injectedRoot).length, 0);
  rmSync(injectedRoot, { recursive: true, force: true });
  const symlinkRoot = mkdtempSync(join(tmpdir(), "agdf-symlink-"));
  mkdirSync(join(symlinkRoot, ".agdf", "control", "runs"), { recursive: true });
  let symlinkCreatable = true;
  try {
    symlinkSync(
      join(root, ".agdf", "control", "runs", "run-a"),
      join(symlinkRoot, ".agdf", "control", "runs", "linked"),
    );
  } catch (error) {
    if (error.code !== "EPERM") throw error;
    symlinkCreatable = false;
    console.warn(
      "[control-state-test] SKIPPED symlink-rejection assertions: this environment cannot create symlinks (EPERM) without elevated privileges or Windows Developer Mode",
    );
  }
  if (symlinkCreatable) {
    assert.equal(discoverRuns(symlinkRoot)[0].valid, false);
    assert.equal(resolveRuns(symlinkRoot, { allActive: true }).findings[0].code, "AGDF_RUN_PATH_INVALID");
  }
  rmSync(symlinkRoot, { recursive: true, force: true });
  const gitRoot = mkdtempSync(join(tmpdir(), "agdf-git-conflict-"));
  execFileSync("git", ["init", "-q", "--initial-branch=main"], {
    cwd: gitRoot,
  });
  execFileSync("git", ["config", "user.email", "test@example.com"], {
    cwd: gitRoot,
  });
  execFileSync("git", ["config", "user.name", "Test"], { cwd: gitRoot });
  const state = join(gitRoot, "RUN_STATE.md");
  writeFileSync(state, "gate: UR\n");
  execFileSync("git", ["add", "."], { cwd: gitRoot });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: gitRoot });
  execFileSync("git", ["branch", "other"], { cwd: gitRoot });
  writeFileSync(state, "gate: PRD\n");
  execFileSync("git", ["commit", "-qam", "main"], { cwd: gitRoot });
  execFileSync("git", ["checkout", "-q", "other"], { cwd: gitRoot });
  writeFileSync(state, "gate: SD\n");
  execFileSync("git", ["commit", "-qam", "other"], { cwd: gitRoot });
  execFileSync("git", ["checkout", "-q", "main"], { cwd: gitRoot });
  assert.throws(() =>
    execFileSync("git", ["merge", "other"], { cwd: gitRoot, stdio: "pipe" }),
  );
  rmSync(gitRoot, { recursive: true, force: true });
  rmSync(legacyRoot, { recursive: true, force: true });
  console.log("control-state tests passed");
} finally {
  rmSync(root, { recursive: true, force: true });
}
