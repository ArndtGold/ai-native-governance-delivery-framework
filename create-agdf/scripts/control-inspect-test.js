import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createControlInspectService } from "../lib/control-inspect/service.js";
import {
  CONTROL_INSPECT_FUNCTION_DEFINITION,
  CONTROL_INSPECT_MAX_DEFINITION_BYTES,
  CONTROL_INSPECT_OUTPUT_TOO_LARGE_RECOVERY,
  controlInspectDefinitionBytes,
  parseControlInspectFunctionArguments,
  serializeControlInspectResult,
} from "../lib/control-inspect/contract.js";
import { CONTROL_INSPECT_OPERATIONS, validateReadSelection } from "../lib/control-inspect/selection.js";
import { validateCommandOptions } from "../lib/cli/command-registry.js";
import { createMcpDispatchRuntime } from "../lib/mcp-dispatch-runtime.js";
import { interactionLocales, pluginDefinition } from "../lib/cli/runtime-context.js";
import { INVALID_PRESENTATION_LANGUAGE_CASES, VALID_PRESENTATION_LANGUAGE_CASES } from "./fixtures/skill-dispatch-language.js";

const cli = join(dirname(fileURLToPath(import.meta.url)), "..", "bin", "create-agdf.js");
const trustedContext = { surface: "claude", expectedVersion: pluginDefinition.version, interactionLocales };

// SDD-005: the definition is loaded into every session on every host.
assert.equal(CONTROL_INSPECT_FUNCTION_DEFINITION.name, "agdf_inspect");
assert.ok(controlInspectDefinitionBytes() <= CONTROL_INSPECT_MAX_DEFINITION_BYTES,
  `agdf_inspect definition is ${controlInspectDefinitionBytes()} bytes, cap ${CONTROL_INSPECT_MAX_DEFINITION_BYTES}`);
assert.deepEqual(CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema.properties.operation.enum, [...CONTROL_INSPECT_OPERATIONS]);
assert.deepEqual([...CONTROL_INSPECT_OPERATIONS], ["doctor", "gate-check", "delivery-map", "contract"]);
assert.equal(CONTROL_INSPECT_FUNCTION_DEFINITION.annotations.readOnlyHint, true);
assert.equal(CONTROL_INSPECT_FUNCTION_DEFINITION.outputSchema.properties.authorizes.const, false);

// SDD-002: one rule set for CLI and MCP, identical wording.
const sharedCases = [
  [{ target: "run-create", allActive: true, runId: "x" }, { operation: "run-create", allActive: true }, "--all-active is supported only by doctor and delivery-map"],
  [{ target: "doctor", contractModule: "quality" }, { operation: "doctor", contractModule: "quality" }, "--module is supported only by contract"],
  [{ target: "contract" }, { operation: "contract" }, "contract requires --module"],
];
// The variant rule exists only for the MCP tool; the CLI keeps its historical flag tolerance (no new public rejection).
assert.throws(() => validateReadSelection({ operation: "doctor", variant: "status-card" }), /supported only by gate-check/u);
assert.doesNotThrow(() => validateCommandOptions({ json: true, target: "doctor", statusCard: true }));
for (const [cliOptions, selection, message] of sharedCases) {
  assert.throws(() => validateCommandOptions({ json: true, ...cliOptions }), new RegExp(message.replaceAll("-", "\\-")), `CLI: ${message}`);
  assert.throws(() => validateReadSelection(selection), new RegExp(message.replaceAll("-", "\\-")), `shared: ${message}`);
}
assert.doesNotThrow(() => validateReadSelection({ operation: "gate-check", variant: "approval-envelope" }));
assert.doesNotThrow(() => validateReadSelection({ operation: "delivery-map", allActive: true }));

// Parsing rejects unknown and write-shaped operations before any evaluation.
assert.throws(() => parseControlInspectFunctionArguments({ operation: "run-approve", presentation_language: "en", working_directory: "/tmp", executable: "/bin/sh" }, trustedContext), /unsupported argument/u);
const inspect = createControlInspectService({ env: {} });
for (const operation of ["run-approve", "run-present", "status", "target-check", ""]) {
  const rejected = inspect({ operation, presentationLanguage: "en", workingDirectory: "/tmp", interactionLocales, expectedVersion: "0.0.0" });
  assert.equal(rejected.outcome, "invalid_input", operation);
  assert.equal(rejected.authorizes, false);
  assert.equal(rejected.report, null);
}
const sharedOverMcp = inspect({ operation: "doctor", contractModule: "quality", presentationLanguage: "en", workingDirectory: "/tmp", interactionLocales, expectedVersion: "0.0.0" });
assert.equal(sharedOverMcp.outcome, "invalid_input");
assert.equal(sharedOverMcp.recovery.action, "--module is supported only by contract", "MCP reuses the CLI wording");
assert.deepEqual(sharedOverMcp.diagnostics, [{ code: "inspect_input_invalid", field: "module" }]);

// AC-005: language matrix behaves like dispatch, envelopes stay non-authorizing.
for (const row of INVALID_PRESENTATION_LANGUAGE_CASES) {
  const input = { operation: "doctor", workingDirectory: "/tmp", interactionLocales, expectedVersion: "0.0.0" };
  if (!row.omit) input.presentationLanguage = row.value;
  const result = inspect(input);
  assert.equal(result.outcome, "invalid_input", row.id);
  assert.equal(result.authorizes, false, row.id);
}

function snapshot(root) {
  const entries = new Map();
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else entries.set(path, `${statSync(path).mtimeMs}:${createHash("sha256").update(readFileSync(path)).digest("hex")}`);
    }
  };
  visit(root);
  return entries;
}
// Evaluation timestamps differ per call; parity is asserted on every other field.
const stable = (value) => JSON.stringify(value).replace(/"checked_at":"[^"]*"/gu, "\"checked_at\":\"<timestamp>\"");
function cliJson(args, root) {
  const run = spawnSync(process.execPath, [cli, ...args, "--dir", root, "--json"], { encoding: "utf8" });
  assert.ok([0, 2].includes(run.status), `${args.join(" ")}: ${run.stderr}`);
  return JSON.parse(run.stdout);
}

const root = mkdtempSync(join(tmpdir(), "agdf-control-inspect-"));
try {
  mkdirSync(join(root, ".git"));
  writeFileSync(join(root, ".git", "HEAD"), "ref: refs/heads/main\n", "utf8");
  execFileSync(process.execPath, [cli, "init", "--dir", root]);
  rmSync(join(root, ".agdf", "control", "AGDF_RUN.md"), { force: true });
  execFileSync(process.execPath, [cli, "run-create", "--dir", root, "--run", "inspect-run"]);
  const artefacts = join(root, ".agdf", "control", "artefacts", "inspect-run");
  mkdirSync(artefacts, { recursive: true });
  writeFileSync(join(artefacts, "UR.md"), "# UR: Inspect\n\nStatus: draft\n\n## Problem\nRead operations need one MCP surface. The user should review this document before approval.\n\n## Goal\nInspect control state without a shell.\n\n## Scope\nRead-only operations.\n\n## AGDF Approval Summary (de; source=en)\n- Problem: Leseoperationen brauchen eine MCP-Oberfläche.\n- Ziel: Kontrollzustand ohne Shell prüfen.\n- Umfang: Nur lesende Operationen.\n");
  const revision = readFileSync(join(root, ".agdf", "control", "runs", "inspect-run", "RUN_STATE.md"), "utf8").match(/^- revision_id: (.+)$/mu)[1];
  execFileSync(process.execPath, [cli, "run-step", "--dir", root, "--run", "inspect-run", "--revision", revision, "--step", "ur", "--title", "Inspect run"]);

  const base = { workingDirectory: root, targetSource: "explicit_target", primaryTarget: root, interactionLocales, expectedVersion: pluginDefinition.version };
  const before = snapshot(join(root, ".agdf", "control"));
  const controlTreeBefore = readdirSync(join(root, ".agdf", "control")).sort();

  // AC-001: report parity with the CLI --json object, both registered locales, every operation and variant.
  const parityCases = [
    ["doctor", {}, ["doctor", "--run", "inspect-run"]],
    ["doctor", { allActive: true }, ["doctor", "--all-active"]],
    ["gate-check", {}, ["gate-check", "--run", "inspect-run"]],
    ["gate-check", { variant: "status-card" }, ["gate-check", "--run", "inspect-run"]],
    ["gate-check", { variant: "approval-envelope" }, ["gate-check", "--run", "inspect-run"]],
    ["delivery-map", {}, ["delivery-map", "--run", "inspect-run"]],
    ["delivery-map", { allActive: true }, ["delivery-map", "--all-active"]],
  ];
  for (const language of ["en", "de"]) {
    for (const [operation, extra, cliArgs] of parityCases) {
      const result = inspect({ ...base, operation, presentationLanguage: language, runId: extra.allActive ? undefined : "inspect-run", ...extra });
      assert.equal(result.outcome, "inspect_result", `${language} ${operation} ${JSON.stringify(extra)}: ${JSON.stringify(result.diagnostics)} ${result.recovery?.action ?? ""}`);
      assert.equal(result.authorizes, false);
      assert.equal(result.terminal, true);
      const expected = cliJson(operation === "gate-check" ? [...cliArgs, "--language", language] : cliArgs, root);
      assert.equal(stable(result.report), stable(expected), `${language} ${operation} ${JSON.stringify(extra)} report parity`);
      if (operation === "gate-check") {
        assert.equal(result.presentation?.markdown, extra.variant === "approval-envelope" && expected.approval_presentation?.markdown
          ? expected.approval_presentation.markdown
          : expected.status_presentation?.markdown, `${language} ${operation} markdown parity`);
        assert.equal(result.presentation.authorizes, false);
      }
    }
    for (const module of pluginDefinition.runtimeContract.modules.map((path) => path.split("/").pop().replace(/\.md$/u, ""))) {
      const result = inspect({ ...base, operation: "contract", presentationLanguage: language, contractModule: module });
      assert.equal(result.outcome, "inspect_result", `${language} contract ${module}: ${JSON.stringify(result.diagnostics)}`);
      const run = spawnSync(process.execPath, [cli, "contract", "--module", module, "--json"], { encoding: "utf8" });
      assert.equal(run.status, 0, run.stderr);
      assert.equal(JSON.stringify(result.report), JSON.stringify(JSON.parse(run.stdout)), `${language} contract ${module} parity`);
      assert.equal(result.presentation.markdown, result.report.content);
    }
  }
  const unknownModule = inspect({ ...base, operation: "contract", presentationLanguage: "en", contractModule: "does-not-exist" });
  assert.equal(unknownModule.outcome, "invalid_input");
  assert.match(unknownModule.recovery.action, /^module_unknown: does-not-exist\. Available modules: /u);

  // AC-003: the dispatcher's presentation_required carries the read-only preview with the gate-check digests.
  const runtime = createMcpDispatchRuntime({ surface: "claude" });
  const dispatch = runtime.tool("agdf_dispatch");
  const presented = dispatch.execute(dispatch.parse({
    skill_id: "gate-check", presentation_language: "de", working_directory: root,
    target_source: "explicit_target", primary_target: root, run_id: "inspect-run", intake: true, intake_mode: "resume",
  }));
  assert.equal(presented.outcome, "intake_continuation", JSON.stringify(presented.diagnostics));
  assert.equal(presented.continuation.phase, "presentation_required");
  assert.equal(presented.host_action.mode, "continue_delivery_intake", "the preview does not make the result terminal");
  assert.equal(presented.presentation?.semantic_block, "approval_preview");
  assert.equal(presented.presentation.authorizes, false);
  const gate = cliJson(["gate-check", "--run", "inspect-run", "--language", "de"], root);
  assert.equal(presented.presentation.markdown, gate.approval_presentation.preview_markdown);
  assert.equal(presented.presentation.summary_digest, gate.approval_presentation.summary_digest);
  assert.equal(presented.presentation.artefact_digest, gate.approval_presentation.artefact_digest);
  assert.equal(presented.presentation.revision_id, gate.approval_presentation.revision_id);
  assert.equal(presented.continuation.steps[0].argv[0], "run-present", "run-present remains the binding step");

  // AC-002: no operation, rejected call or dispatch preview wrote under .agdf/control.
  assert.deepEqual([...snapshot(join(root, ".agdf", "control")).entries()], [...before.entries()], "read operations must not change the control tree");
  assert.deepEqual(readdirSync(join(root, ".agdf", "control")).sort(), controlTreeBefore);

  // AC-003 continued: the binding write still happens only through run-present, and its digests match the preview.
  const presentRun = spawnSync(process.execPath, [cli, "run-present", "--dir", root, "--run", "inspect-run", "--gate", "UR", "--revision", gate.approval_presentation.revision_id, "--language", "de"], { encoding: "utf8" });
  assert.equal(presentRun.status, 0, presentRun.stderr);
  const present = JSON.parse(presentRun.stdout);
  assert.equal(present.summary_digest, presented.presentation.summary_digest);
  assert.equal(present.artefact_digest, presented.presentation.artefact_digest);
  assert.ok(present.text.includes(presented.presentation.markdown), "run-present text contains the exact preview");
  const approveWithoutPresentation = spawnSync(process.execPath, [cli, "run-approve", "--dir", root, "--run", "inspect-run", "--gate", "UR", "--revision", gate.approval_presentation.revision_id, "--response", "Approval: UR"], { encoding: "utf8" });
  assert.notEqual(approveWithoutPresentation.status, 0, "approval without a presentation id stays rejected");

  // Unresolved target: orientation instead of evaluation, still read-only.
  const fake = mkdtempSync(join(tmpdir(), "agdf-inspect-fake-"));
  try {
    mkdirSync(join(fake, ".git"));
    const unresolved = inspect({ operation: "doctor", presentationLanguage: "en", workingDirectory: fake, targetSource: "explicit_target", primaryTarget: fake, interactionLocales, expectedVersion: pluginDefinition.version });
    assert.equal(unresolved.outcome, "target_unresolved");
    assert.equal(unresolved.presentation?.semantic_block, "task_target_orientation");
    assert.equal(unresolved.report, null);
  } finally {
    rmSync(fake, { recursive: true, force: true });
  }

  // The owned runtime exposes both tools and routes inspect through the same read boundary.
  assert.deepEqual(runtime.tools.map((tool) => tool.name), ["agdf_dispatch", "agdf_inspect"]);
  const inspectTool = runtime.tool("agdf_inspect");
  const viaRuntime = inspectTool.execute(inspectTool.parse({ operation: "doctor", presentation_language: "en", working_directory: root, target_source: "explicit_target", primary_target: root, run_id: "inspect-run" }));
  assert.equal(viaRuntime.outcome, "inspect_result");
  assert.equal(stable(viaRuntime.report), stable(cliJson(["doctor", "--run", "inspect-run"], root)));
  for (const row of VALID_PRESENTATION_LANGUAGE_CASES) {
    const result = inspectTool.execute(inspectTool.parse({ operation: "gate-check", presentation_language: row.value, working_directory: root, target_source: "explicit_target", primary_target: root, run_id: "inspect-run" }));
    assert.equal(result.outcome, "inspect_result", row.id);
    assert.equal(result.report.status_card.presentation_language, row.expectedLocale, row.id);
  }
  // CR-01: an oversize result (e.g. delivery-map all_active on a large repository) keeps the inspect shape.
  const oversize = JSON.parse(serializeControlInspectResult({ ...viaRuntime, report: { pad: "x".repeat(1024 * 1024 + 1) } }));
  assert.equal(oversize.outcome, "evaluator_error");
  assert.equal(oversize.operation, "doctor");
  assert.equal(oversize.report, null);
  assert.equal(oversize.recovery.action, CONTROL_INSPECT_OUTPUT_TOO_LARGE_RECOVERY);
  assert.deepEqual(oversize.diagnostics, [{ code: "inspect_output_too_large" }]);
  assert.deepEqual(Object.keys(oversize), Object.keys(viaRuntime), "oversize fallback keeps every inspect result key");
  assert.equal(JSON.parse(runtime.tool("agdf_inspect").serialize(viaRuntime)).outcome, "inspect_result");
  const inspectFailure = runtime.failure("dispatch_timeout", "agdf_inspect");
  assert.equal(inspectFailure.outcome, "evaluator_error");
  assert.equal(inspectFailure.authorizes, false);
  assert.equal(Object.hasOwn(inspectFailure, "report"), true, "inspect failures use the inspect result shape");
  assert.equal(runtime.tool("agdf_write"), null);
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("control-inspect parity, shared selection, read-only and preview tests passed.");
