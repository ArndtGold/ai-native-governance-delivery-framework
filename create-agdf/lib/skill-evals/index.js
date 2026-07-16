import { createHash } from "node:crypto";
import { readFileSync, readdirSync, realpathSync } from "node:fs";
import { resolve, relative, sep } from "node:path";
import { gradeArtefactContent } from "./artefact-quality.js";

export const FAILURE = Object.freeze({
  schema: "EVAL_SCHEMA_INVALID", coverage: "EVAL_COVERAGE_MISSING", stale: "EVAL_OBSERVATION_STALE",
  routing: "EVAL_ROUTING_MISMATCH", gate: "EVAL_GATE_MISMATCH", approval: "EVAL_APPROVAL_BOUNDARY_VIOLATION",
  action: "EVAL_ACTION_VIOLATION", mutation: "EVAL_MUTATION_OUT_OF_BOUNDS", quality: "EVAL_ARTEFACT_QUALITY_FAILED",
});

function readJson(path) { return JSON.parse(readFileSync(path, "utf8")); }
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((k) => [k, stable(value[k])]));
  return value;
}
export function safePath(root, path) {
  const target = resolve(root, path);
  const rel = relative(root, target);
  if (!rel || rel.startsWith(`..${sep}`) || rel === ".." || resolve(target) === resolve(root)) throw Object.assign(new Error(`unsafe eval path: ${path}`), { code: FAILURE.schema });
  let canonicalRoot;
  let canonicalTarget;
  try { canonicalRoot = realpathSync(root); canonicalTarget = realpathSync(target); }
  catch { throw Object.assign(new Error(`missing eval path: ${path}`), { code: FAILURE.schema }); }
  const canonicalRel = relative(canonicalRoot, canonicalTarget);
  if (canonicalRel === ".." || canonicalRel.startsWith(`..${sep}`)) throw Object.assign(new Error(`eval path escapes through symlink: ${path}`), { code: FAILURE.schema });
  return target;
}
function fail(code, message) { return { status: "block", code, message }; }

export function fingerprintCase(repoRoot, pluginDefinition, testCase) {
  const skill = pluginDefinition.skillSet.find((item) => item.slug === testCase.target_skill);
  const sources = ["evals/fixtures/catalog.json", "plugin/meta/agdf-agent-router.md", `plugin/skills/${testCase.target_skill}/SKILL.md`, ...(testCase.relevant_sources ?? [])];
  const hash = createHash("sha256");
  hash.update(JSON.stringify(stable({ case: testCase, routing: skill })));
  for (const source of [...new Set(sources)].sort()) hash.update(source).update(readFileSync(safePath(repoRoot, source)));
  return hash.digest("hex");
}

export function fingerprintSkillCases(repoRoot, pluginDefinition, skillSlug, cases) {
  const hash = createHash("sha256");
  for (const testCase of cases.filter((item) => item.target_skill === skillSlug).sort((a, b) => a.case_id.localeCompare(b.case_id))) hash.update(fingerprintCase(repoRoot, pluginDefinition, testCase));
  return hash.digest("hex");
}

export function gradeCase(testCase, observation, fingerprint) {
  const results = [];
  const expected = testCase.expected;
  if (observation.source_fingerprint !== fingerprint) results.push(fail(FAILURE.stale, "observation fingerprint does not match current behavior owners"));
  if (observation.selected_skill !== expected.selected_skill) results.push(fail(FAILURE.routing, `expected ${expected.selected_skill}, got ${observation.selected_skill}`));
  if ((observation.current_gate ?? null) !== (expected.current_gate ?? null) || (observation.internal_step ?? null) !== (expected.internal_step ?? null)) results.push(fail(FAILURE.gate, "gate or internal step mismatch"));
  if ((observation.missing_approval ?? null) !== (expected.missing_approval ?? null)) results.push(fail(FAILURE.approval, "approval boundary mismatch"));
  const actions = new Set(observation.actions ?? []);
  for (const required of expected.required_actions ?? []) if (!actions.has(required)) results.push(fail(FAILURE.action, `missing required action: ${required}`));
  for (const forbidden of expected.forbidden_actions ?? []) if (actions.has(forbidden)) results.push(fail(FAILURE.action, `forbidden action present: ${forbidden}`));
  const allowed = new Set(testCase.mutation?.allowed_paths ?? []);
  for (const changed of observation.changed_paths ?? []) if (!allowed.has(changed)) results.push(fail(FAILURE.mutation, `undeclared mutation: ${changed}`));
  if (testCase.quality_profile) {
    for (const failure of gradeArtefactContent(observation.artefact_content, testCase.quality_profile)) results.push(fail(FAILURE.quality, failure));
  }
  return { case_id: testCase.case_id, target_skill: testCase.target_skill, case_class: testCase.case_class, evidence_kind: observation.evidence_kind, status: results.length ? "block" : "pass", failures: results };
}

export function runSkillEvals(repoRoot, { corpusDir = "evals" } = {}) {
  const root = safePath(repoRoot, corpusDir);
  const manifest = readJson(safePath(root, "manifest.json"));
  if (manifest.schema_version !== 1) throw Object.assign(new Error("unsupported eval manifest schema"), { code: FAILURE.schema });
  const thresholdFamilies = ["coverage", "routing", "gate", "actions", "mutation", "artefact_quality"];
  if (thresholdFamilies.some((name) => manifest.thresholds?.[name] !== 1)) throw Object.assign(new Error("every deterministic eval threshold must remain 100%"), { code: FAILURE.schema });
  const pluginDefinition = readJson(safePath(repoRoot, "plugin/meta/agdf-plugin.definition.json"));
  const caseDir = safePath(root, "cases");
  const cases = readdirSync(caseDir).filter((name) => name.endsWith(".json")).sort().flatMap((name) => readJson(safePath(caseDir, name)));
  const fixtures = readJson(safePath(root, "fixtures/catalog.json"));
  const observationList = readJson(safePath(root, "observations/deterministic-replay.json"));
  const observations = new Map();
  for (const observation of observationList) {
    if (!observation.case_id || observations.has(observation.case_id)) throw Object.assign(new Error(`invalid or duplicate observation ${observation.case_id}`), { code: FAILURE.schema });
    if (observation.evidence_kind !== "deterministic_replay") throw Object.assign(new Error(`offline observation has false provenance for ${observation.case_id}`), { code: FAILURE.schema });
    observations.set(observation.case_id, observation);
  }
  const ids = new Set();
  for (const testCase of cases) {
    if (!testCase.case_id || ids.has(testCase.case_id) || testCase.schema_version !== 1) throw Object.assign(new Error(`invalid or duplicate case ${testCase.case_id}`), { code: FAILURE.schema });
    if (!pluginDefinition.skillSet.some((skill) => skill.slug === testCase.target_skill)) throw Object.assign(new Error(`unknown target skill for ${testCase.case_id}`), { code: FAILURE.schema });
    if (!fixtures.repositories?.[testCase.repository_fixture] || !fixtures.control_states?.includes(testCase.control_state_fixture)) throw Object.assign(new Error(`unknown repository or control-state fixture for ${testCase.case_id}`), { code: FAILURE.schema });
    ids.add(testCase.case_id);
  }
  for (const caseId of observations.keys()) if (!ids.has(caseId)) throw Object.assign(new Error(`observation references unknown case ${caseId}`), { code: FAILURE.schema });
  const requiredClasses = manifest.required_case_classes;
  const currentFingerprints = Object.fromEntries(pluginDefinition.skillSet.map((skill) => [skill.slug, fingerprintSkillCases(repoRoot, pluginDefinition, skill.slug, cases)]));
  const coverageFailures = [];
  for (const skill of pluginDefinition.skillSet) for (const kind of requiredClasses) if (!cases.some((item) => item.target_skill === skill.slug && item.case_class === kind)) coverageFailures.push(`${skill.slug}:${kind}`);
  const results = cases.map((testCase) => {
    const observation = observations.get(testCase.case_id);
    if (!observation) return { case_id: testCase.case_id, target_skill: testCase.target_skill, status: "block", failures: [fail(FAILURE.stale, "required observation missing")] };
    const qualityProfile = fixtures.artefact_quality?.profiles?.[testCase.case_class];
    const artefactContent = observation.artefact_content ?? fixtures.artefact_quality?.contents?.[testCase.case_class];
    return gradeCase({ ...testCase, quality_profile: qualityProfile }, { ...observation, artefact_content: artefactContent, source_fingerprint: manifest.source_fingerprints?.[testCase.target_skill] }, currentFingerprints[testCase.target_skill]);
  });
  if (coverageFailures.length) results.unshift({ case_id: "coverage", status: "block", failures: [fail(FAILURE.coverage, coverageFailures.join(", "))] });
  const passed = results.filter((item) => item.status === "pass").length;
  const report = { schema_version: 1, corpus_version: manifest.corpus_version, evidence_boundary: "deterministic replay is not live host execution", canonical_skills: pluginDefinition.skillSet.length, cases: cases.length, passed, failed: results.length - passed, status: results.every((item) => item.status === "pass") ? "pass" : "block", results };
  return report;
}
