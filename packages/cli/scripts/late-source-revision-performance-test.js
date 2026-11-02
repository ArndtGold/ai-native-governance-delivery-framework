import assert from "node:assert/strict";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { spawn, execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from "node:url";
import { createRun } from '../../core/lib/control-state/run-state-repository.js';
import { createLateSourceRevisionTestRun } from "./fixtures/late-source-revision.js";

const candidate = process.env.AGDF_TEST_CANDIDATE_CLI_ROOT ?? resolve(import.meta.dirname, "../../../dist/npm/create-agdf");
const root = fs.mkdtempSync(join(tmpdir(), "agdf-revision-performance-")), env = { ...process.env, AGDF_DATA_DIR: join(root, "data") };
delete env.AGDF_RUN_ID;
const cli = join(candidate, "bin/create-agdf.js"), validator = join(candidate, "bin/agdf-validator.js");
execFileSync("git", ["init", "-q", root]); execFileSync(process.execPath, [cli, "init", "--dir", root, "--language", "en"], { env });
const f = createLateSourceRevisionTestRun(root, validator, "revision-performance", env);
const moduleUrl = pathToFileURL(join(candidate, "runtime/core/lib/control-state/run-revision.js")).href;
const { inspectSourceRevision, recoverSourceRevision } = await import(moduleUrl);
const { createCoreServices } = await import(pathToFileURL(join(candidate, 'runtime/core/lib/index.js')).href);
const command = createCoreServices().command;
const { resolveControlCommandTarget } = await import(pathToFileURL(join(candidate, 'runtime/core/lib/control-state/approval-command-contract.js')).href);
const { artefactFileDigest } = await import(pathToFileURL(join(candidate, 'runtime/core/lib/control-state/run-seal.js')).href);
const envelope = (input, action) => ({ working_directory: root, primary_target: root, target_source: 'explicit_target',
  target_id: resolveControlCommandTarget(root).target_id, run_id: input.runId, expected_revision_id: input.revisionId, operation_id: input.operationId,
  command: { kind: 'source_revision.' + action, payload: { source_gate: input.sourceGate,
    proposal: { path: input.evidence, digest: artefactFileDigest(root, input.evidence) },
    ...(action === 'apply' ? { preview_digest: input.previewDigest, confirmation: input.confirmation } : {}) } } });
const action = (input, kind) => {
  const result = command('agdf_revise', envelope(input, kind));
  return { ...result.family_result, outcome: result.outcome === 'accepted' ? result.family_result.outcome : result.outcome === 'already_applied' ? 'replayed' : result.outcome };
};
const previewSourceRevision = (_, input) => action(input, 'preview');
const applySourceRevision = (_, input) => action(input, 'apply');
const { evaluateGateCheck } = await import(pathToFileURL(join(candidate, "runtime/core/lib/control-evaluation/gate-check.js")).href);
// The benchmark measures repeated candidate Core revisions. Renew synthetic
// fixture prerequisites through that same public command boundary, avoiding
// repeated CLI transfer/bootstrap work outside the measured revision actions.
const fixtureDirectory = `.agdf/control/runs/${f.runId}/evidence/endurance-inputs`;
fs.mkdirSync(join(root, fixtureDirectory), { recursive: true });
const fixtureSource = (name, content) => {
  const path = `${fixtureDirectory}/${name}.md`; fs.writeFileSync(join(root, path), content);
  return { path, digest: artefactFileDigest(root, path) };
};
const fixtureCommand = (group, kind, payload) => {
  const result = command(group, { presentation_language: 'en', working_directory: root, primary_target: root,
    target_source: 'explicit_target', target_id: resolveControlCommandTarget(root).target_id,
    run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), command: { kind, payload } });
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  return result;
};
const renewFixture = cycle => {
  fixtureCommand('agdf_record', 'artefact.record', { gate: 'TP',
    material: fixtureSource(`tp-${cycle}`, fs.readFileSync(f.file('TP.md'), 'utf8')),
    reviewer: 'Synthetic current test reviewer', reviewed: true, update_draft: true });
  const prepared = fixtureCommand('agdf_prepare', 'presentation.prepare', { gate: 'TP' });
  fixtureCommand('agdf_approve', 'approval.record', { gate: 'TP', presentation_id: prepared.family_result.presentation_id, response: 'Approval: TP' });
  const analysis = fixtureCommand('agdf_record', 'step.record', { step: 'internal', internal_step: 'Brownfield Analysis', decision: 'pass',
    source: fixtureSource(`analysis-${cycle}`, '# Brownfield Analysis\n\nDecision: pass\n\nSynthetic current preparation reuses the existing filter store and tests.\n') });
  assert.equal(analysis.current.available, true);
  assert.equal(analysis.current.gate, 'CD+Tests');
  assert.equal(analysis.current.revision_id, f.revision());
};
const originalRead = fs.readFileSync, cycles = []; let reads = [];
fs.readFileSync = (path, ...args) => {
  const value = originalRead(path, ...args);
  reads.push({ path: String(path), bytes: Buffer.byteLength(value) }); return value;
};
syncBuiltinESMExports();
const measure = work => { reads = []; const start = performance.now(), value = work(); return { value, elapsed_ms: performance.now() - start,
  reads: reads.length, bytes_read: reads.reduce((n,row) => n + row.bytes, 0), history_reads: reads.filter(row => row.path.includes("/history/revisions/")).length }; };
const historyInventory = dir => {
  const rows = []; for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name); if (entry.isDirectory()) rows.push(...historyInventory(path)); else rows.push({ path, bytes: fs.statSync(path).size });
  } return rows;
};
const worker = input => new Promise((resolveWorker, reject) => {
  const program = `import {createCoreServices} from ${JSON.stringify(pathToFileURL(join(candidate, 'runtime/core/lib/index.js')).href)};
    const r = createCoreServices().command('agdf_revise',JSON.parse(process.argv[2]));console.log(JSON.stringify({...r.family_result,outcome:r.outcome==='accepted'?r.family_result.outcome:r.outcome==='already_applied'?'replayed':r.outcome}));`;
  const child = spawn(process.execPath, ["--input-type=module", "-e", program, root, JSON.stringify(envelope(input, 'apply'))], { env }); let stdout = "";
  child.stdout.on("data", data => stdout += data); child.on("error", reject); child.on("exit", code => resolveWorker({ code, result: JSON.parse(stdout) }));
});
try {
  for (let cycle = 1; cycle <= 10; cycle++) {
    const p = f.proposal("TP"), preview = measure(() => previewSourceRevision(root, p.input)); assert.equal(preview.value.outcome, "preview");
    const input = { ...p.input, previewDigest: preview.value.preview_digest, confirmation: preview.value.confirmation_selector }, apply = measure(() => applySourceRevision(root, input));
    assert.equal(apply.value.outcome, "reopened", JSON.stringify(apply.value));
    const inspect = measure(() => inspectSourceRevision(root, input)); assert.equal(inspect.value.outcome, "historical");
    assert.ok(inspect.value.history.manifest.files.every(row => !row.path.includes("/history/revisions/")));
    const recover = measure(() => recoverSourceRevision(root, { ...input, revisionId: f.revision() })); assert.equal(recover.value.outcome, "recovered");
    const files = historyInventory(join(root, `.agdf/control/runs/${f.runId}/history/revisions`));
    cycles.push({ cycle, operation_id: input.operationId, revision_id: f.revision(), preview, apply, inspect: { ...inspect, value: { outcome: inspect.value.outcome } },
      recover: { ...recover, value: { outcome: recover.value.outcome } }, history_files: files.length, history_bytes: files.reduce((n,row) => n + row.bytes, 0) });
    fs.writeFileSync(f.file("TP.md"), fs.readFileSync(f.file("TP.md"), "utf8") + `\nSynthetic renewal ${cycle}.\n`);
    renewFixture(cycle);
    console.log(JSON.stringify({ phase: "revision_endurance_cycle", cycle, history_files: files.length }));
  }
  const unrelated = "unrelated-performance"; createRun(root, unrelated);
  const observation = measure(() => evaluateGateCheck(root, { runId: unrelated }));
  assert.equal(observation.history_reads, 0, "An unrelated selected run must not read another run's archived bytes");
  const p = f.proposal("TP"), preview = previewSourceRevision(root, p.input), input = { ...p.input, previewDigest: preview.preview_digest, confirmation: preview.confirmation_selector };
  assert.equal(preview.outcome, "preview"); const start = performance.now(), competition = await Promise.all([worker(input), worker(input)]);
  assert.equal(competition.filter(row => row.result.outcome === "reopened").length, 1, JSON.stringify(competition));
  const evidence = { scenario_id: "SCN-028", status: "pass", candidate, node: process.version, platform: process.platform + "-" + process.arch,
    cycles, unrelated_observation: { elapsed_ms: observation.elapsed_ms, reads: observation.reads, history_reads: observation.history_reads },
    competition: { elapsed_ms: performance.now() - start, results: competition }, diagnostic_only: "No added SLA; existing MCP budgets remain mandatory", fixture_authority: "synthetic_only" };
  if (process.env.AGDF_TEST_EVIDENCE_DIR) fs.writeFileSync(join(process.env.AGDF_TEST_EVIDENCE_DIR, "SCN-028-revision-performance.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify({ scenario_id: evidence.scenario_id, cycles: cycles.map(({cycle,preview,apply,history_files,history_bytes}) => ({cycle,preview_ms:preview.elapsed_ms,apply_ms:apply.elapsed_ms,history_files,history_bytes})), unrelated_history_reads: observation.history_reads, competition: evidence.competition }));
} finally { fs.readFileSync = originalRead; syncBuiltinESMExports(); fs.rmSync(root, { recursive: true, force: true }); }
