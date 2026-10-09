import assert from "node:assert/strict";
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createOwnedRuntimeFixture } from "./owned-runtime.js";
import { withStdioClient } from "./helpers.js";
import { createLateSourceRevisionTestRun } from "../../cli/scripts/fixtures/late-source-revision.js";
import { byteDigest } from "../../core/lib/control-state/run-revision-history.js";

const candidate = process.env.AGDF_TEST_CANDIDATE_CLI_ROOT ?? resolve(import.meta.dirname, "../../../dist/npm/create-agdf");
const fixture = createOwnedRuntimeFixture({ dispatcherSourceRoot: candidate }), root = fixture.governanceTarget;
const validator = join(fixture.dispatcherRoot, "bin/agdf-validator.js");
const f = createLateSourceRevisionTestRun(root, validator, "late-source-mcp-test"), seed = join(fixture.root, "canonical-seed");
cpSync(join(root, ".agdf"), seed, { recursive: true });
const reset = () => { rmSync(join(root, ".agdf"), { recursive: true }); cpSync(seed, join(root, ".agdf"), { recursive: true }); };
const tree = () => {
  const files = {}; const scan = dir => readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name)).forEach(entry => {
    const path = join(dir, entry.name); if (entry.isDirectory()) scan(path); else files[path.slice(root.length)] = byteDigest(readFileSync(path));
  }); scan(join(root, ".agdf")); return files;
};
const args = input => ["--revision", input.revisionId, "--source-gate", input.sourceGate, "--operation", input.operationId, "--evidence", input.evidence];
const observations = [];
try {
  await withStdioClient(fixture, async client => {
    const { tools } = await client.listTools(); assert.deepEqual(tools.map(tool => tool.name), ["agdf_dispatch", "agdf_inspect"]);
    for (const tool of tools) for (const name of ["source_gate", "preview_digest", "revision_mode", "operation_id"])
      assert.equal(Object.hasOwn(tool.inputSchema.properties, name), false);
    const target = { presentation_language: "de", working_directory: root, target_source: "explicit_target", primary_target: root, run_id: f.runId };
    for (const gate of ["UR", "PRD", "SD", "TP"]) {
      reset(); const p = f.proposal(gate);
      const preview = f.run("run-revise", "--preview", ...args(p.input)).value; assert.equal(preview.outcome, "preview");
      const applied = f.run("run-revise", "--apply", ...args(p.input), "--preview-digest", preview.preview_digest).value;
      assert.equal(applied.outcome, "reopened", JSON.stringify(applied)); const before = tree();
      const dispatch = (await client.callTool({ name: "agdf_dispatch", arguments: { ...target, skill_id: "gate-check" } })).structuredContent;
      const inspected = (await client.callTool({ name: "agdf_inspect", arguments: { ...target, operation: "gate-check" } })).structuredContent;
      const cli = f.run("gate-check").value;
      assert.equal(dispatch.control.current_gate, gate, JSON.stringify(dispatch)); assert.equal(inspected.report.current_gate, gate);
      assert.equal(dispatch.control.missing_approval, cli.missing_approval); assert.equal(inspected.report.missing_approval, cli.missing_approval);
      assert.deepEqual(dispatch.control.source_revisions, cli.source_revisions); assert.deepEqual(inspected.report.source_revisions, cli.source_revisions);
      assert.equal(dispatch.authorizes, false); assert.equal(inspected.authorizes, false); assert.deepEqual(tree(), before);
      const continued = (await client.callTool({ name: "agdf_dispatch", arguments: { ...target, skill_id: "gate-check", continue_delivery: true } })).structuredContent;
      assert.notEqual(continued.continuation?.phase, "implementation"); assert.deepEqual(tree(), before);
      observations.push({ gate, dispatch: dispatch.control, inspect: { current_gate: inspected.report.current_gate, missing_approval: inspected.report.missing_approval, source_revisions: inspected.report.source_revisions }, authorizes: false });
    }
    reset(); const p = f.proposal("TP"), preview = f.run("run-revise", "--preview", ...args(p.input)).value;
    const program = `import {applySourceRevision} from ${JSON.stringify(pathToFileURL(join(fixture.dispatcherRoot, "runtime/core/lib/control-state/run-revision.js")).href)};
      applySourceRevision(process.argv[1],JSON.parse(process.argv[2]),{afterWrite(stage){if(stage==='archive_file')process.exit(71)}});`;
    try { execFileSync(process.execPath, ["--input-type=module", "-e", program, root, JSON.stringify({ ...p.input, previewDigest: preview.preview_digest })], { stdio: "pipe" }); assert.fail("worker should interrupt after an actual archive write"); }
    catch (error) { assert.equal(error.status, 71); }
    const before = tree();
    const pending = (await client.callTool({ name: "agdf_inspect", arguments: { ...target, operation: "gate-check" } })).structuredContent;
    assert.equal(pending.report.status, "blocked"); assert.ok(pending.report.doctor_report.findings.some(row => row.code === "AGDF_RUN_STEP_RECOVERY_REQUIRED"));
    assert.deepEqual(tree(), before); assert.equal(f.run("run-revise", "--recover", "--revision", p.input.revisionId, "--operation", p.input.operationId).value.outcome, "recovered");
    observations.push({ state: "pending", report: pending.report.status, observation: "read_only; explicit CLI recovery" });
  });
  if (process.env.AGDF_TEST_EVIDENCE_DIR) {
    mkdirSync(process.env.AGDF_TEST_EVIDENCE_DIR, { recursive: true });
    writeFileSync(join(process.env.AGDF_TEST_EVIDENCE_DIR, "SCN-023-mcp.json"), JSON.stringify({ scenario_id: "SCN-023", status: "pass", candidate,
      observations, fixture_authority: "synthetic_only", protocol: "actual stdio MCP server; no native host activation claim" }, null, 2) + "\n");
  }
  console.log("Late source revision CLI/Core/MCP parity passed (actual stdio server, synthetic fixture approvals).");
} finally { fixture.dispose(); }
