import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const root = mkdtempSync(join(tmpdir(), "agdf-verified-change-"));
const cli = join(import.meta.dirname, "..", "bin", "create-agdf.js");
const repoRoot = join(import.meta.dirname, "..", "..");
let baselineCommit = "0".repeat(40);

function write(path, content) {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}

function run(target = "gate-check") {
  const result = spawnSync(process.execPath, [cli, target, "--dir", root, "--json"], { encoding: "utf8" });
  if (!result.stdout.trim()) throw new Error(`Verified Change CLI produced no JSON: ${result.stderr.trim()}`);
  return { result, report: JSON.parse(result.stdout) };
}

function runState(recordStatus = "eligible", lifecycle = "active") {
  return `# AGDF Run State

## Run Meta

- run_id: example
- lifecycle: ${lifecycle}
- current_gate: Verified Change Execution

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/example/UR.md | approved | approved |
| Brownfield Review | .agdf/control/artefacts/example/BROWNFIELD_REVIEW.md | done | sized |
| Verified Change | .agdf/control/artefacts/example/VERIFIED_CHANGE.md | ${recordStatus} | bounded |

## Mode/Slice Decision

- decision: verified_change
- required_next_gate: none
- scope_reason: One canonical owner and deterministic integrity validation.
- evidence: BROWNFIELD_REVIEW.md

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Fixture | verified-change-test | bounded path | direct |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Fixture approval |

## Closeout

- next_allowed_action: Validate the Verified Change record.
`;
}

function record({ status = "eligible", relatedUr = ".agdf/control/artefacts/example/UR.md", escalationTarget = "structured_slice", owner = "README.md", sourcePaths = "README.md", derivedPaths = "none", prohibitedImpacts = "none", propagationCommand = "none", validationCommands = "node --check fixture", baselineTracked = ".agdf/control/AGDF_RUN.md, .agdf/control/artefacts/example/VERIFIED_CHANGE.md, unrelated-tracked.md", baselineUntracked = "unrelated-untracked.md", executionChangedPaths, executionScopeStatus, validationStatus = "pending", propagationStatus = "not_applicable", extra = "" } = {}) {
  const changedPaths = executionChangedPaths ?? (status === "executed" ? "README.md" : "none");
  const scopeStatus = executionScopeStatus ?? (status === "executed" ? "pass" : "pending");
  return `# Verified Change: Fixture

## Record

- status: ${status}
- related_ur: ${relatedUr}
- escalation_target: ${escalationTarget}
- canonical_owner: ${owner}
- allowed_source_paths: ${sourcePaths}
- allowed_derived_paths: ${derivedPaths}
- prohibited_impacts: ${prohibitedImpacts}
- propagation_command: ${propagationCommand}
- validation_commands: ${validationCommands}
- baseline_commit: ${baselineCommit}
- baseline_tracked_paths: ${baselineTracked}
- baseline_untracked_paths: ${baselineUntracked}
- execution_changed_paths: ${changedPaths}
- execution_scope_status: ${scopeStatus}
- validation_status: ${validationStatus}
- propagation_status: ${propagationStatus}
${extra}

## Brownfield Selection

- mode: post_ur_review
- decision: verified_change
- scope_reason: One canonical owner and bounded paths.
- evidence: Fixture review.

## Mini-Closeout

- delivered: Declared source change.
- intentionally_not_delivered: No structured delivery artefacts.
- escalation_result: none
- residual_risk: none
- next_step: Delivery closeout.
`;
}

try {
  const agentRouter = readFileSync(join(repoRoot, "plugin", "meta", "agdf-agent-router.md"), "utf8");
  const runtimeContract = readFileSync(join(repoRoot, "plugin", "meta", "contracts", "modes.md"), "utf8");
  assert.match(agentRouter, /Use Verified Change only after approved UR and Brownfield Review/);
  assert.match(agentRouter, /missing or ambiguous record condition escalates to the declared structured target/);
  assert.match(runtimeContract, /`verified_change` is a compact, fail-closed path/);

  execFileSync("git", ["init", "-q", "--initial-branch=main"], { cwd: root });
  execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: root });
  execFileSync("git", ["config", "user.name", "Test"], { cwd: root });
  execFileSync(process.execPath, [cli, "init", "--dir", root]);
  write("README.md", "baseline\n");
  write("unrelated-tracked.md", "baseline\n");
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-qm", "baseline"], { cwd: root });
  baselineCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();

  write("unrelated-tracked.md", "pre-existing tracked work\n");
  write("unrelated-untracked.md", "pre-existing untracked work\n");

  write(".agdf/control/AGDF_RUN.md", runState());
  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record());
  let check = run();
  assert.equal(check.report.current_gate, "Verified Change Execution");
  assert.equal(check.report.status, "open");
  assert.ok(check.report.allowed.includes("implement only declared source and derived paths"));
  assert.equal(check.report.blocking_reason, "none");
  assert.ok(check.report.forbidden.includes("touch unlisted paths"));

  write(".agdf/control/AGDF_RUN.md", runState().replace("| Verified Change | .agdf/control/artefacts/example/VERIFIED_CHANGE.md |", "| Verified Change | `.agdf/control/artefacts/example/VERIFIED_CHANGE.md` |"));
  check = run();
  assert.equal(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_ARTEFACT_PATH_FORMAT_INVALID"), false);
  write(".agdf/control/AGDF_RUN.md", runState().replace("| Verified Change | .agdf/control/artefacts/example/VERIFIED_CHANGE.md |", "| Verified Change | `.agdf/control/artefacts/example/VERIFIED_CHANGE.md |"));
  check = run();
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_ARTEFACT_PATH_FORMAT_INVALID"));

  for (const unsafePath of ["/tmp/VERIFIED_CHANGE.md", "../VERIFIED_CHANGE.md", ".agdf\\control\\VERIFIED_CHANGE.md"]) {
    write(".agdf/control/AGDF_RUN.md", runState().replace(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", unsafePath));
    check = run("doctor");
    assert.ok(check.report.findings.some((finding) => finding.code === "AGDF_ARTEFACT_PATH_INVALID"), `${unsafePath} must fail repository-relative path validation`);
  }

  write(".agdf/control/AGDF_RUN.md", runState("draft"));
  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "draft" }));
  check = run();
  assert.equal(check.report.current_gate, "Verified Change Execution");
  assert.equal(check.report.status, "open");
  assert.equal(check.report.blocking_reason, "verified_change_record_required");
  assert.ok(check.report.forbidden.includes("implement candidate changes"));
  assert.match(check.report.next_allowed_action, /satisfy every eligibility check/);

  write(".agdf/control/AGDF_RUN.md", runState());
  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record());

  write(".agdf/control/artefacts/example/BROWNFIELD_REVIEW.md", "# Linked Brownfield Review\n");
  check = run();
  assert.equal(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_SCOPE_ESCAPE"), false, "selected-run linked recognized artefact paths must be permitted");
  rmSync(join(root, ".agdf/control/artefacts/example/BROWNFIELD_REVIEW.md"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ sourcePaths: "../escape.md" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_SOURCE_PATHS_INVALID"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ relatedUr: "none" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_RELATED_UR_INVALID"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "unknown" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_STATUS_INVALID"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ escalationTarget: "unknown" }));
  check = run();
  assert.equal(check.report.status, "blocked");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_ESCALATION_INVALID"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ owner: "none" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.equal(check.report.current_gate, "PRD");
  assert.equal(check.report.missing_approval, "Approval: PRD");
  assert.equal(check.report.blocking_reason, "verified_change_invalid_escalated");
  assert.ok(check.report.forbidden.includes("implement through Verified Change"));
  assert.match(check.report.next_allowed_action, /structured_slice/);
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_OWNER_INVALID"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ owner: "none", escalationTarget: "structured_delivery" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.equal(check.report.current_gate, "PRD");
  assert.equal(check.report.missing_approval, "Approval: PRD");
  assert.equal(check.report.blocking_reason, "verified_change_invalid_escalated");
  assert.ok(check.report.forbidden.includes("implement through Verified Change"));
  assert.match(check.report.next_allowed_action, /structured_delivery/);

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ sourcePaths: "none" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_SOURCE_PATHS_INVALID"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ derivedPaths: "../derived.md" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_DERIVED_PATHS_INVALID"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ baselineTracked: "", baselineUntracked: "" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_BASELINE_MISSING"));

  const actualBaselineCommit = baselineCommit;
  baselineCommit = "f".repeat(40);
  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record());
  check = run();
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_BASELINE_COMMIT_MISMATCH"));
  baselineCommit = actualBaselineCommit;

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record());

  write("README.md", "verified change\n");
  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "executed", validationStatus: "pass" }));
  check = run();
  assert.equal(check.report.current_gate, "OR");
  assert.equal(check.report.status, "open");
  assert.equal(check.report.blocking_reason, "none");
  assert.ok(check.report.forbidden.includes("create PRD, SD, TP, QA or UAT by ritual"));
  assert.match(check.report.next_allowed_action, /compact record/);

  const consolidatedState = runState("executed")
    .replace(".agdf/control/artefacts/example/BROWNFIELD_REVIEW.md", ".agdf/control/artefacts/example/VERIFIED_CHANGE.md")
    .replace("| Verified Change | .agdf/control/artefacts/example/VERIFIED_CHANGE.md | executed | bounded |", "| Verified Change | .agdf/control/artefacts/example/VERIFIED_CHANGE.md | executed | bounded |\n| OR | .agdf/control/artefacts/example/VERIFIED_CHANGE.md | done | compact closeout |");
  write(".agdf/control/AGDF_RUN.md", consolidatedState);
  check = run("doctor");
  assert.equal(check.report.findings.some((finding) => finding.code?.includes("ROLE")), false);

  write(".agdf/control/AGDF_RUN.md", consolidatedState);
  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "eligible" }));
  check = run("doctor");
  assert.ok(check.report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_ROLE_STATUS_MISMATCH"));
  assert.ok(check.report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_OR_ROLE_INVALID"));

  write(".agdf/control/AGDF_RUN.md", consolidatedState.replace("- decision: verified_change", "- decision: structured_slice"));
  check = run("doctor");
  assert.ok(check.report.findings.some((finding) => finding.code === "AGDF_ARTEFACT_ROLE_ALIAS_INVALID"));

  write(".agdf/control/AGDF_RUN.md", runState("executed"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "executed" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_VALIDATION_EVIDENCE_MISSING"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "executed", derivedPaths: "plugin/.codex-plugin/plugin.json", propagationCommand: "npm run sync", validationStatus: "pass", propagationStatus: "pending" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_PROPAGATION_EVIDENCE_MISSING"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "executed", validationStatus: "pass" }));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "executed", validationStatus: "pass", executionChangedPaths: "README.md, missing.md" }));
  check = run();
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_EXECUTION_SCOPE_MISMATCH"));
  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "executed", validationStatus: "pass" }));

  write("unlisted.md", "scope escape\n");
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_SCOPE_ESCAPE"));
  rmSync(join(root, "unlisted.md"));

  write(".agdf/control/AGDF_RUN.md", runState("executed").replace("| Verified Change |", "| Notes | .agdf/control/artefacts/example/UNRECOGNIZED.md | done | ignored |\n| Verified Change |"));
  write(".agdf/control/artefacts/example/UNRECOGNIZED.md", "unrecognized role\n");
  check = run();
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_SCOPE_ESCAPE"));
  rmSync(join(root, ".agdf/control/artefacts/example/UNRECOGNIZED.md"));

  write(".agdf/control/AGDF_RUN.md", runState("executed").replaceAll(".agdf/control/artefacts/example/UR.md", ".agdf/control/artefacts/other/UR.md"));
  write(".agdf/control/artefacts/other/UR.md", "# Other run UR\n");
  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "executed", relatedUr: ".agdf/control/artefacts/other/UR.md", validationStatus: "pass", executionChangedPaths: "README.md, .agdf/control/artefacts/other/UR.md" }));
  check = run();
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_SCOPE_ESCAPE"));
  rmSync(join(root, ".agdf/control/artefacts/other/UR.md"));

  write(".agdf/control/AGDF_RUN.md", runState("executed", "completed"));
  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "executed", validationStatus: "pass" }));
  write("later-unrelated.md", "future work\n");
  check = run("doctor");
  assert.equal(check.report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_SCOPE_ESCAPE"), false);
  rmSync(join(root, "later-unrelated.md"));
  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "executed", validationStatus: "pass", executionChangedPaths: "none" }));
  check = run("doctor");
  assert.ok(check.report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_EXECUTION_EVIDENCE_MISSING"));
  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "executed", validationStatus: "pass", executionChangedPaths: "README.md, ../unsafe.md" }));
  check = run("doctor");
  assert.ok(check.report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_EXECUTION_SCOPE_INVALID"));
  write(".agdf/control/AGDF_RUN.md", runState());

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ owner: "README.md, plugin/meta/agdf-runtime-contract.md" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_OWNER_INVALID"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ validationCommands: "none" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_VALIDATION_MISSING"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ prohibitedImpacts: "security" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_IMPACTS_INVALID"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ derivedPaths: "plugin/.codex-plugin/plugin.json" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_PROPAGATION_MISSING"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ baselineTracked: "README.md, unrelated-tracked.md" }));
  check = run();
  assert.equal(check.report.status, "open");
  assert.ok(check.report.doctor_report.findings.some((finding) => finding.code === "AGDF_VERIFIED_CHANGE_BASELINE_CANDIDATE_DIRTY"));

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "escalated" }));
  check = run();
  assert.equal(check.report.current_gate, "PRD");
  assert.equal(check.report.missing_approval, "Approval: PRD");
  assert.equal(check.report.blocking_reason, "verified_change_escalated");
  assert.ok(check.report.forbidden.includes("implement through Verified Change"));
  assert.match(check.report.next_allowed_action, /structured_slice/);

  write(".agdf/control/artefacts/example/VERIFIED_CHANGE.md", record({ status: "escalated", escalationTarget: "structured_delivery" }));
  check = run();
  assert.equal(check.report.current_gate, "PRD");
  assert.equal(check.report.missing_approval, "Approval: PRD");
  assert.ok(check.report.forbidden.includes("implement through Verified Change"));
  assert.match(check.report.next_allowed_action, /structured_delivery/);

  assert.equal(readFileSync(join(root, "README.md"), "utf8"), "verified change\n");
  console.log("Verified Change tests passed");
} finally {
  rmSync(root, { recursive: true, force: true });
}
