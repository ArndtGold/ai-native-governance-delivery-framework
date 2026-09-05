import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { CAPABILITIES, HOSTS, SCENARIOS, SCENARIO_SPECS, canonical, importHistoricalHC, proofState, validateObservation } from "./contract.mjs";
import { evaluateClaim } from "./evaluate.mjs";
import { checkComparison, comparison, hash, MANIFEST_PATH, recordComparison, safePath, sourceClosure, sourceSnapshot } from "./run.mjs";
import { renderComparison } from "./render.mjs";
import { environment } from "../../create-agdf/scripts/host-compatibility-test.js";
import { inspectPluginSurface } from "../../create-agdf/lib/installers/plugin-installers.js";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, MANIFEST_PATH)));
const digest = "a".repeat(64), previous = "b".repeat(64), reference = "e".repeat(64);
const references = { "docs/compatibility/evidence/unit.json": reference };
const make = (scenario = "installed", host = "codex") => {
  const spec = SCENARIO_SPECS[scenario];
  const facts = { payload_present: true, payload_digest: digest, expected_skills: ["gate-check"], exposed_skills: [{ name: "gate-check", enabled: true, payload_digest: digest }],
    invocation: { observed: true, contract_version: 1, binding_version: "2", canonical_result: true, post_terminal_actions: 0 },
    update_observed: true, previous_digest: previous, failure_observed: true, recovery_observed: true, recovered_digest: previous, foreign_preserved: true, permission_preserved: true, unresolved: [],
    check_executed: false, check_result_observed: false, authorized: false };
  if (scenario.startsWith("discovery-")) facts.exposed_skills = [];
  if (scenario === "update-stale") facts.payload_digest = previous;
  if (scenario === "recovery-partial") facts.unresolved = ["native_recovery_failed"];
  const identity = { canonical_version: "0.14.5", source_digest: digest, runtime_digest: digest };
  return { schema_version: 1, id: `${host}.${scenario}`, scenario, claim: spec.claim, mechanism: "fixture-mechanism", environment: environment(host, scenario),
    expected: identity, observed: identity, source_fingerprint: digest, lane: "deterministic_adapter", method: "isolated_production_fixture", observed_at: "2026-09-05T10:00:00.000Z",
    original: { result: "raw_fixture_result", evidence_class: "repository_fixture" }, facts, references: [{ path: Object.keys(references)[0], sha256: reference }], conformance: { expected: spec.expected, passed: true } };
};
let checks = 0;
const check = (name, action) => { action(); checks++; };
const evaluate = observations => evaluateClaim(observations[0], observations, references);

check("valid input and observed installation", () => { const o = make(); assert.deepEqual(validateObservation(o, references), []); assert.equal(evaluate([o]).state, "demonstrated"); });
check("legacy unspecified surface and import facade behavior", () => {
  for (const surface of [undefined, null, "unknown"]) {
    const result = inspectPluginSurface(surface, (executable, args) => { assert.equal(executable, "codex"); assert.deepEqual(args, ["plugin", "list"]); return "agdf@agdf 0.14.5\n"; });
    assert.equal(result.surface, surface); assert.equal(result.status, "healthy");
  }
});
for (const patch of [{ references: [] }, { method: "plugin_list_success" }, { source_fingerprint: null }, { original: {} }, { facts: null }, { observed_at: "yesterday" }, { claim: "callable" }]) {
  check("malformed observation", () => assert.notEqual(evaluate([{ ...make(), ...patch }]).diagnostics.length, 0));
}
check("changed reference", () => assert.ok(validateObservation(make(), {}).includes("reference_missing_or_changed")));
check("empty evidence cannot pass", () => assert.equal(evaluateClaim(make(), [], references).state, "unverified"));
check("duplicate observation IDs", () => assert.equal(evaluate([make(), make()]).state, "unverified"));
check("installation never proves discovery", () => { const o = make("discovered"); o.facts = { payload_present: true, payload_digest: digest }; assert.equal(evaluate([o]).state, "unverified"); });
check("listed plugin without exposed skills", () => { const o = make("discovered"); o.facts.exposed_skills = []; assert.equal(evaluate([o]).state, "failed"); });
check("trusted is not executed", () => { const o = make("trusted-unexecuted"); o.facts.authorized = true; assert.equal(evaluate([o]).state, "failed"); });
check("manual retains usable next action", () => assert.match(evaluate([make("manual-checks")]).next_action, /manual verification/));
check("terminal continuation fails callable", () => { const o = make("callable"); o.facts.invocation.post_terminal_actions = 1; assert.equal(evaluate([o]).state, "failed"); });
check("same-version stale bytes fail update", () => assert.equal(evaluate([make("update-stale")]).state, "failed"));
check("prior-state recovery is admissible", () => { const o = make("recoverable"); o.observed = { ...o.observed, source_digest: previous }; assert.equal(evaluate([o]).state, "demonstrated"); });
check("partial recovery remains failed", () => assert.equal(evaluate([make("recovery-partial")]).state, "failed"));
for (const field of ["foreign_preserved", "permission_preserved", "failure_observed", "recovery_observed"]) check(field, () => { const o = make("recoverable"); o.facts[field] = false; assert.equal(evaluate([o]).state, "failed"); });
for (const field of ["source_digest", "runtime_digest", "canonical_version"]) check(`payload ${field}`, () => {
  const o = make(); const target = { ...o, expected: { ...o.expected, [field]: field === "canonical_version" ? "0.14.6" : previous } };
  assert.equal(evaluateClaim(target, [o], references).state, "stale/mismatched");
});
for (const field of ["host_version", "os", "path", "permission", "trust", "activation", "model", "sdk_version", "fixture_version"]) check(`environment ${field}`, () => {
  const o = make(); const target = { ...o, environment: { ...o.environment, [field]: "changed" } };
  assert.equal(evaluateClaim(target, [o], references).state, "stale/mismatched");
});
check("unknown identity is not wildcard", () => { const o = make(); o.expected = { ...o.expected, source_digest: null }; assert.equal(evaluate([o]).state, "unverified"); });
check("unknown target path stays unverified against known evidence", () => { const o = make(); const result = evaluateClaim({ ...o, environment: { ...o.environment, path: null } }, [o], references); assert.equal(result.state, "unverified"); assert.ok(result.gaps.includes("environment.path")); });
check("missing execution runtime cannot prove automatic checks", () => { const o = make(); o.lane = "fresh_host"; o.method = "fresh_host_observation"; o.claim = "automatic_checks"; o.environment = { ...o.environment, variant: "CLI", host_version: "1.0.0", runtime_version: null }; o.facts = { authorized: true, check_executed: true, check_result_observed: true }; assert.equal(evaluate([o]).state, "unverified"); });
check("fixture cannot become fresh host", () => { const o = make(); o.lane = "fresh_host"; o.method = "fresh_host_observation"; assert.equal(evaluate([o]).state, "unverified"); });
check("installed-root lane cannot prove invocation", () => { const o = make("callable"); o.lane = "installed_payload"; o.method = "installed_root_inspection"; o.environment = { ...o.environment, variant: "CLI", host_version: "1.0.0" }; assert.equal(evaluate([o]).state, "unverified"); });
check("observed governance never establishes enforcement", () => {
  const o = make(); o.lane = "fresh_host"; o.method = "fresh_host_observation"; o.claim = "technical_enforcement";
  o.environment = { ...o.environment, variant: "CLI", host_version: "1.0.0", model: "fixture-model" }; o.facts = { canonical_decision_observed: true };
  assert.equal(evaluate([o]).state, "unverified");
  o.facts = { disallowed_action_blocked: true, intercepted_mechanism: o.mechanism, intercepted_path: o.environment.path };
  assert.equal(evaluate([o]).state, "demonstrated");
  assert.equal(evaluateClaim({ ...o, environment: { ...o.environment, path: "subagent" } }, [o], references).state, "stale/mismatched");
});
check("restriction requires evidence", () => { const o = make(); o.restriction = { reason: "documented_limit", reference: o.references[0].path }; assert.equal(evaluate([o]).state, "unsupported"); o.restriction.reference = "absent"; assert.equal(evaluate([o]).state, "unverified"); });
check("older pass cannot hide matching failure", () => {
  const pass = make(); const fail = { ...structuredClone(pass), id: "new.failure", observed_at: "2026-09-05T11:00:00.000Z" }; fail.facts.payload_present = false;
  const result = evaluateClaim(pass, [pass, fail], references); assert.equal(result.state, "unverified"); assert.deepEqual(result.failed_observations, [fail.id]);
  fail.id = "old.failure"; fail.observed_at = "2026-09-05T09:00:00.000Z";
  assert.equal(evaluateClaim(pass, [pass, fail], references).state, "unverified");
  pass.supersedes = [fail.id]; pass.retry_evidence = pass.references[0].path;
  assert.equal(evaluateClaim(pass, [pass, fail], references).state, "demonstrated");
  fail.supersedes = [pass.id]; fail.retry_evidence = fail.references[0].path;
  assert.equal(evaluateClaim(pass, [pass, fail], references).state, "unverified");
});
check("cross-tuple and missing retry evidence", () => { const o = make(); o.supersedes = ["absent"]; assert.equal(evaluate([o]).state, "unverified"); o.retry_evidence = o.references[0].path; assert.equal(evaluate([o]).state, "unverified"); });
check("empty report and wrong scenario claims", () => {
  const snapshot = { version: "0.14.5", digest, payloads: {} }; assert.equal(comparison(snapshot, [], {}, []).consistent, false);
  const wrong = HOSTS.flatMap(host => SCENARIOS.map(scenario => ({ ...make("installed", host), id: `${host}.${scenario}`, scenario })));
  assert.equal(comparison(snapshot, wrong, references).consistent, false);
});
check("historical mapping preserves original vocabulary", () => {
  const raw = JSON.parse(readFileSync(join(root, manifest.historical_sources[0].path))); const before = canonical(raw);
  const mapped = importHistoricalHC(raw, { path: manifest.historical_sources[0].path, sha256: hash(before) });
  assert.equal(mapped.length, 36); assert.equal(canonical(raw), before); assert.equal(mapped[0].original.result, raw.observations[0].result);
  assert.throws(() => importHistoricalHC({ ...raw, observations: [] }, {}), /historical_schema/);
});

const temp = mkdtempSync(join(tmpdir(), "agdf-compatibility-evidence-test-"));
try {
  const source = sourceSnapshot(root, manifest);
  for (const path of Object.keys(source.files)) { mkdirSync(dirname(join(temp, path)), { recursive: true }); cpSync(join(root, path), join(temp, path)); }
  for (const path of ["create-agdf/generated/plugins/agdf", "create-agdf/generated/plugins/copilot/agdf", ".agdf/control/artefacts/agdf-live-host-conformance-matrix"]) {
    mkdirSync(dirname(join(temp, path)), { recursive: true }); cpSync(join(root, path), join(temp, path), { recursive: true });
  }
  check("path traversal and symlink escape", () => {
    for (const path of ["../outside", "/absolute", "docs/../outside", "docs\\outside"]) assert.throws(() => safePath(temp, path));
    symlinkSync(root, join(temp, "escape")); assert.throws(() => safePath(temp, "escape/package.json"), /symlink/);
  });
  check("AST follows added helpers and handles import cycles", () => {
    writeFileSync(join(temp, "a.mjs"), 'import "./b.mjs";'); writeFileSync(join(temp, "b.mjs"), 'export * from "./a.mjs";');
    assert.deepEqual(sourceClosure(temp, ["a.mjs"]), ["a.mjs", "b.mjs"]);
    writeFileSync(join(temp, "b.mjs"), 'import(variable);'); assert.throws(() => sourceClosure(temp, ["a.mjs"]), /unresolved_dynamic_import/);
  });
  const changed = "create-agdf/lib/host-adapters/codex/plugin.js"; const original = readFileSync(join(temp, changed), "utf8");
  const baseline = sourceSnapshot(temp, manifest);
  check("representative real host-local command change is isolated", () => {
    writeFileSync(join(temp, changed), original.replace('["plugin", "remove", "agdf@agdf"]','["plugin", "remove", "agdf@agdf", "--fixture"]'));
    const after = sourceSnapshot(temp, manifest); assert.notEqual(after.by_host.codex, baseline.by_host.codex);
    for (const host of ["claude", "copilot", "opencode"]) assert.equal(after.by_host[host], baseline.by_host[host]);
  });
  const changedCodex = await import(pathToFileURL(join(temp, changed)));
  const unchangedClaude = await import(pathToFileURL(join(temp, "create-agdf/lib/host-adapters/claude/plugin.js")));
  check("production adapter executes the isolated change", () => { assert.equal(changedCodex.uninstallCommand().args.at(-1), "--fixture"); assert.deepEqual(unchangedClaude.uninstallCommand().args, ["plugin", "uninstall", "agdf@agdf", "--scope", "user"]); });
  writeFileSync(join(temp, changed), original);
  const synthetic = () => HOSTS.flatMap(host => SCENARIOS.map(scenario => {
    const o = make(scenario, host); const current = baseline.payloads[host];
    o.expected = current; o.observed = current;
    if (o.facts.payload_digest === digest) o.facts.payload_digest = current.source_digest;
    o.facts.exposed_skills.forEach(skill => { skill.payload_digest = current.source_digest; });
    return o;
  }));
  await recordComparison(temp, { runSuite: synthetic });
  check("record then read-only check", () => assert.equal(checkComparison(temp).status, "pass"));
  const reportPath = join(temp, "docs/compatibility/HOST_COMPATIBILITY.md"); const reportBytes = readFileSync(reportPath);
  const factsPath = join(temp, "docs/compatibility/evidence/facts.json"); const factsBefore = readFileSync(factsPath);
  await recordComparison(temp, { runSuite: synthetic });
  check("deterministic rendering and immutable attempt reuse", () => assert.deepEqual(readFileSync(reportPath), reportBytes));
  await assert.rejects(() => recordComparison(temp, { runSuite: () => [] }), /scenario_recording_failed/);
  check("empty recording retains accepted comparison", () => assert.deepEqual(readFileSync(reportPath), reportBytes));
  await assert.rejects(() => recordComparison(temp, { runSuite: () => { throw new Error("injected_runner_failure"); } }), /injected_runner_failure/);
  await assert.rejects(() => recordComparison(temp, { runSuite: synthetic, beforePublish: () => { throw new Error("injected_publication_failure"); } }), /injected_publication_failure/);
  check("failed publication and runner retain old bytes and diagnostic attempts", () => { assert.deepEqual(readFileSync(reportPath), reportBytes); assert.ok(readdirSync(join(temp, "evals/host-compatibility/observations/failures")).length >= 3); });
  await assert.rejects(() => recordComparison(temp, { runSuite: () => { const data = synthetic(); data[0].facts.private = "/Users/private/transcript"; return data; } }), /private_path/);
  check("private evidence not promoted", () => assert.deepEqual(readFileSync(reportPath), reportBytes));
  writeFileSync(factsPath, "changed");
  check("changed evidence is rejected without rewrite", () => { assert.equal(checkComparison(temp).status, "fail"); assert.equal(readFileSync(factsPath, "utf8"), "changed"); });
  writeFileSync(factsPath, factsBefore);
  writeFileSync(join(temp, changed), `${original}\n// modified source\n`);
  check("source drift rejected", () => assert.equal(checkComparison(temp).diagnostic, "source_snapshot_changed"));
  writeFileSync(join(temp, changed), original);
  await assert.rejects(() => recordComparison(temp, { runSuite: () => { writeFileSync(join(temp, changed), `${original}\n// changed during recording\n`); return synthetic(); } }), /source_changed_during_recording/);
  writeFileSync(join(temp, changed), original);
  writeFileSync(reportPath, "changed comparison");
  check("render drift rejected", () => assert.equal(checkComparison(temp).diagnostic, "rendered_comparison_changed"));
  writeFileSync(reportPath, reportBytes);
  const nativeEvidence = "docs/compatibility/evidence/native-unit.json";
  const nativeSource = "evals/host-compatibility/observations/native-unit.json";
  const native = make(); native.id = "native.unit"; native.scenario = "installed-root-observation";
  native.lane = "installed_payload"; native.method = "installed_root_inspection"; native.source_fingerprint = null;
  native.environment = { ...native.environment, variant: "CLI", host_version: "1.0.0", fixture_version: null };
  native.expected = baseline.payloads.codex; native.observed = native.expected;
  native.facts = { payload_present: true, payload_digest: native.expected.source_digest };
  const nativeBytes = JSON.stringify(native.facts); writeFileSync(join(temp, nativeEvidence), nativeBytes);
  native.references = [{ path: nativeEvidence, sha256: hash(nativeBytes) }]; native.publication = { reviewed: true, evidence: nativeEvidence };
  writeFileSync(join(temp, nativeSource), JSON.stringify([native]));
  const nativeManifest = { ...manifest, native_sources: [nativeSource], public_evidence: [nativeEvidence],
    native_targets: [{ environment: native.environment, lane: native.lane, mechanisms: { installed: native.mechanism } }] };
  writeFileSync(join(temp, MANIFEST_PATH), JSON.stringify(nativeManifest));
  await recordComparison(temp, { runSuite: synthetic });
  check("explicit native import retains its independent lane and public evidence", () => {
    assert.equal(checkComparison(temp).status, "pass");
    const text = readFileSync(reportPath, "utf8"); assert.match(text, /installed: demonstrated \(installed_payload\)/);
    assert.match(text, /callable: unverified \(installed_payload\)/); assert.equal(readFileSync(join(temp, nativeEvidence), "utf8"), nativeBytes);
  });
  writeFileSync(join(temp, nativeSource), JSON.stringify([{ ...native, original: { ...native.original, result: "changed" } }]));
  check("changed native input cannot hide a new result behind old observations", () => assert.equal(checkComparison(temp).diagnostic, "native_input_changed"));
  writeFileSync(join(temp, nativeSource), JSON.stringify([native]));
  const nativeReportBytes = readFileSync(reportPath);
  await assert.rejects(() => recordComparison(temp, { runSuite: synthetic, beforePublish: () => {
    writeFileSync(join(temp, nativeSource), JSON.stringify([{ ...native, original: { ...native.original, result: "racing change" } }]));
  } }), /native_input_changed_during_recording/);
  check("native input race preserves accepted report", () => assert.deepEqual(readFileSync(reportPath), nativeReportBytes));
  writeFileSync(join(temp, nativeSource), JSON.stringify([native]));
  await assert.rejects(() => recordComparison(temp, { runSuite: synthetic, beforePublish: () => {
    writeFileSync(join(temp, nativeEvidence), "changed evidence during publication");
  } }), /native_evidence_changed_during_recording/);
  check("native evidence race preserves accepted report", () => assert.deepEqual(readFileSync(reportPath), nativeReportBytes));
  writeFileSync(join(temp, nativeEvidence), nativeBytes);
  writeFileSync(join(temp, "docs/compatibility/foreign.txt"), "foreign");
  await assert.rejects(() => recordComparison(temp, { runSuite: synthetic }), /foreign_output_files/);
  check("foreign output retained", () => assert.equal(readFileSync(join(temp, "docs/compatibility/foreign.txt"), "utf8"), "foreign"));
} finally { rmSync(temp, { recursive: true, force: true }); }

console.log(`Host compatibility evidence tests passed (${checks} named checks, recording failure and isolation controls).`);
