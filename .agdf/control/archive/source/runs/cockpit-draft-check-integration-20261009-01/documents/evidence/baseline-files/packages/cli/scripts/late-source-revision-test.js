import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { createLateSourceRevisionTestRun } from "./fixtures/late-source-revision.js";
import { byteDigest } from "../../core/lib/control-state/run-revision-history.js";
import { renderSourceRevision, validateLocaleRegistry } from "../../core/lib/interaction-presentation.js";

const candidate = process.env.AGDF_TEST_CANDIDATE_CLI_ROOT ?? resolve(import.meta.dirname, "../../../dist/npm/create-agdf");
const validator = join(candidate, "bin/agdf-validator.js"), cli = join(candidate, "bin/create-agdf.js");
const temporary = mkdtempSync(join(tmpdir(), "agdf-late-cli-")), root = join(temporary, "project");
const locales = JSON.parse(readFileSync(join(candidate, "generated/plugins/agdf/meta/agdf-interaction-locales.json")));
assert.equal(validateLocaleRegistry(locales).valid, true);
mkdirSync(root); execFileSync("git", ["init", "-q", root]);
const env = { ...process.env, AGDF_DATA_DIR: join(temporary, "data") }; delete env.AGDF_RUN_ID;
execFileSync(process.execPath, [cli, "init", "--dir", root, "--language", "en"], { env });
const f = createLateSourceRevisionTestRun(root, validator, "late-cli-test", env), seed = join(temporary, "canonical-seed");
cpSync(join(root, ".agdf"), seed, { recursive: true });
const reset = () => { rmSync(join(root, ".agdf"), { recursive: true }); cpSync(seed, join(root, ".agdf"), { recursive: true }); };
const tree = () => {
  const files = {}; const scan = dir => readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name)).forEach(entry => {
    const path = join(dir, entry.name); if (entry.isDirectory()) scan(path); else files[path.slice(root.length)] = byteDigest(readFileSync(path));
  }); scan(join(root, ".agdf")); return files;
};
const rawAt = (revision, ...args) => spawnSync(process.execPath, [validator, "run-revise", "--dir", root, "--run", f.runId, "--revision", revision, ...args], { env, encoding: "utf8" });
const raw = (...args) => rawAt(f.revision(), ...args);
const flags = input => ["--source-gate", input.sourceGate, "--operation", input.operationId, "--evidence", input.evidence];
const observations = [];
try {
  for (const gate of ["UR", "PRD", "SD", "TP"]) {
    reset(); const p = f.proposal(gate), before = tree();
    const preview = raw("--preview", ...flags(p.input), "--json"); assert.equal(preview.status, 0, preview.stderr);
    const value = JSON.parse(preview.stdout); assert.equal(value.outcome, "preview"); assert.deepEqual(tree(), before);
    for (const language of [...Object.keys(locales.locales), "fr-CA"]) {
      const rendered = raw("--preview", ...flags(p.input), "--language", language); assert.equal(rendered.status, 0, rendered.stderr);
      const pack = locales.locales[language] ?? locales.locales.en;
      assert.ok(rendered.stdout.includes(pack.sourceRevision.preview)); assert.ok(rendered.stdout.includes(p.input.operationId));
      assert.ok(rendered.stdout.includes(pack.sourceRevision.authority)); assert.ok(rendered.stdout.includes(pack.sourceRevision.reviewNext));
      assert.ok(rendered.stdout.includes(p.value.intended_change), "Human preview must show the reviewed intended change");
      assert.ok(rendered.stdout.includes(value.preview_digest), "Human preview must expose the exact apply binding");
      for (const source of value.sources) {
        assert.ok(rendered.stdout.includes(source.path)); assert.ok(rendered.stdout.includes(source.digest));
      }
      for (const analysis of value.impact.analyses) {
        assert.ok(rendered.stdout.includes(analysis.type)); assert.ok(rendered.stdout.includes(analysis.reason));
        assert.ok(rendered.stdout.includes(analysis.path)); assert.ok(rendered.stdout.includes(analysis.digest));
      }
      for (const step of value.impact.invalidated_steps) assert.ok(rendered.stdout.includes(step));
      observations.push({ gate, language, outcome: "preview", rendered: rendered.stdout });
    }
    const applied = raw("--apply", ...flags(p.input), "--preview-digest", value.preview_digest, "--json");
    assert.equal(applied.status, 0, applied.stderr); assert.equal(JSON.parse(applied.stdout).outcome, "reopened");
    const current = f.revision(), after = tree();
    for (const language of Object.keys(locales.locales)) {
      const inspected = raw("--inspect", "--operation", p.input.operationId, "--language", language);
      assert.equal(inspected.status, 0, inspected.stderr); assert.ok(inspected.stdout.includes(locales.locales[language].sourceRevision.historical));
      assert.ok(inspected.stdout.includes(current)); assert.deepEqual(tree(), after);
      observations.push({ gate, language, outcome: "historical", rendered: inspected.stdout });
      const refused = raw("--preview", ...flags(p.input), "--language", language); assert.equal(refused.status, 2);
      assert.ok(refused.stdout.includes(locales.locales[language].sourceRevision.rejected));
    }
    const report = f.run("gate-check").value; assert.equal(report.current_gate, gate); assert.equal(report.source_revisions.status, "verified");
    assert.equal(report.source_revisions.entries[0].operation_id, p.input.operationId);
  }
  reset(); const p = f.proposal("TP"), before = tree();
  for (const args of [["--preview", "--apply", ...flags(p.input)], ["--preview", ...flags(p.input), "--preview"],
    ["--source-gate", "TP"], ["--apply", ...flags(p.input)], ["--preview", "--operation", p.input.operationId],
    ["--inspect", ...flags(p.input)], ["--recover", "--operation", p.input.operationId, "--preview-digest", "sha256:bad"],
    ["--preview", ...flags(p.input), "--step", "evidence"], ["--preview", ...flags(p.input), "--response", "Approval: TP"],
    ["--preview", ...flags(p.input), "--evidence", p.input.evidence], ["--preview", ...flags(p.input), "--run", "other"]]) {
    const result = raw(...args, "--json"); assert.notEqual(result.status, 0, args.join(" ")); assert.deepEqual(tree(), before);
  }
  assert.equal(JSON.parse(raw("--json").stdout).reason, "prd_revision_boundary_invalid", "no mode remains the early owner");
  for (const language of [...Object.keys(locales.locales), "fr-CA"]) {
    reset(); const p = f.proposal("TP"), preview = JSON.parse(raw("--preview", ...flags(p.input), "--json").stdout);
    const pack = (locales.locales[language] ?? locales.locales.en).sourceRevision;
    for (const [outcome, result] of [
      ["reopened", rawAt(p.input.revisionId, "--apply", ...flags(p.input), "--preview-digest", preview.preview_digest, "--language", language)],
      ["replayed", rawAt(p.input.revisionId, "--apply", ...flags(p.input), "--preview-digest", preview.preview_digest, "--language", language)],
      ["recovered", raw("--recover", "--operation", p.input.operationId, "--language", language)],
    ]) {
      assert.equal(result.status, 0, result.stdout + result.stderr); assert.ok(result.stdout.includes(pack[outcome]));
      assert.ok(result.stdout.includes(pack.authority)); observations.push({ language, outcome, rendered: result.stdout, actual_cli: true });
    }
    reset(); const interrupted = f.proposal("TP"), v = JSON.parse(raw("--preview", ...flags(interrupted.input), "--json").stdout);
    const program = `import {applySourceRevision} from ${JSON.stringify(pathToFileURL(join(candidate, "runtime/core/lib/control-state/run-revision.js")).href)};
      applySourceRevision(process.argv[1],JSON.parse(process.argv[2]),{afterWrite(stage){if(stage==='archive_file')process.exit(71)}});`;
    const worker = spawnSync(process.execPath, ["--input-type=module", "-e", program, root, JSON.stringify({ ...interrupted.input, previewDigest: v.preview_digest })], { env });
    assert.equal(worker.status, 71);
    const before = tree(), required = raw("--inspect", "--operation", interrupted.input.operationId, "--language", language);
    assert.equal(required.status, 2, required.stdout + required.stderr); assert.ok(required.stdout.includes(pack.recovery_required)); assert.deepEqual(tree(), before);
    const recovered = raw("--recover", "--operation", interrupted.input.operationId, "--language", language);
    assert.equal(recovered.status, 0, recovered.stdout + recovered.stderr); assert.ok(recovered.stdout.includes(pack.recovered));
    observations.push({ language, outcome: "recovery_required", rendered: required.stdout, actual_cli: true }, { language, outcome: "recovered", rendered: recovered.stdout, actual_cli: true });
  }
  for (const language of Object.keys(locales.locales)) {
    for (const outcome of ["preview", "reopened", "historical", "replayed", "recovered", "rejected", "recovery_required", "unknown"]) {
      const rendered = renderSourceRevision({ outcome, run_id: f.runId, operation_id: p.input.operationId, revision_id: f.revision(), authorizes: false }, locales, language, { target: root });
      const pack = locales.locales[language].sourceRevision;
      assert.ok(rendered.markdown.includes(pack[outcome] ?? pack.rejected)); assert.ok(rendered.markdown.includes(pack.authority));
      assert.ok(rendered.markdown.includes(pack.next)); assert.equal(rendered.authorizes, false);
      observations.push({ language, outcome, rendered: rendered.markdown });
    }
  }
  if (process.env.AGDF_TEST_EVIDENCE_DIR) {
    mkdirSync(process.env.AGDF_TEST_EVIDENCE_DIR, { recursive: true });
    for (const scenario_id of ["SCN-002", "SCN-022", "SCN-029"]) writeFileSync(join(process.env.AGDF_TEST_EVIDENCE_DIR, `${scenario_id}-cli.json`), JSON.stringify({ scenario_id, status: "pass", candidate,
      observations, fixture_authority: "synthetic_only", note: "Early positive and version-1 fault behavior also covered by unchanged existing suites." }, null, 2) + "\n");
  }
  console.log(JSON.stringify({ suite: "late-source-revision-cli", candidate, cases: observations.length, fixture_authority: "synthetic_only" }));
} finally { rmSync(temporary, { recursive: true, force: true }); }
