import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, relative, resolve, sep } from "node:path";
import { fail, validateBaseline } from "./contracts.js";

function inside(root, candidate) {
  const target = resolve(root, candidate);
  const rel = relative(root, target);
  if (!rel || rel === ".." || rel.startsWith(`..${sep}`)) fail(`unsafe corpus path ${candidate}`);
  return target;
}
function existingInside(root, candidate) {
  const target = inside(root, candidate);
  if (!existsSync(target)) fail(`missing corpus path ${candidate}`);
  const canonicalRoot = realpathSync(root);
  const canonicalTarget = realpathSync(target);
  const rel = relative(canonicalRoot, canonicalTarget);
  if (rel === ".." || rel.startsWith(`..${sep}`)) fail(`corpus path escapes through symlink ${candidate}`);
  return target;
}
function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}
const stagedForbidden = /expected_|evidence_ref|classification|threshold|trivial_change|compact_delivery|verified_change|structured_slice|structured_delivery/i;
export function validateStagedBlindScenario(scenario, evidencePack = null, baselineScenario = null) {
  if (stagedForbidden.test(JSON.stringify(scenario))) fail(`staged scenario leakage ${scenario.scenario_id}`, "PROPORTIONALITY_LEAKAGE");
  const quickTaskReferences = JSON.stringify(scenario).match(/quick_task/gi)?.length ?? 0;
  if (quickTaskReferences && (
    scenario.lifecycle_stage !== "post_brownfield_decision"
    || scenario.control_state_context !== "A durable UR is approved. Brownfield analysis is complete and the stored mode/slice decision is quick_task."
    || quickTaskReferences !== 1
  )) fail(`staged scenario path leakage ${scenario.scenario_id}`, "PROPORTIONALITY_LEAKAGE");
  if (evidencePack && stagedForbidden.test(JSON.stringify(evidencePack))) fail(`staged evidence-pack leakage ${scenario.scenario_id}`, "PROPORTIONALITY_LEAKAGE");
  if (baselineScenario && (
    JSON.stringify(scenario).includes(baselineScenario.rationale)
    || JSON.stringify(evidencePack ?? {}).includes(baselineScenario.rationale)
  )) fail(`staged rationale leakage ${scenario.scenario_id}`, "PROPORTIONALITY_LEAKAGE");
  return scenario;
}
export function loadCorpus(repoRoot, profileId = "legacy-v1") {
  const root = existingInside(repoRoot, "evals/proportionality");
  if (profileId === "staged-v2") {
    const manifest = JSON.parse(readFileSync(existingInside(root, "staged-manifest.json"), "utf8"));
    const index = JSON.parse(readFileSync(existingInside(root, manifest.scenarios_path), "utf8"));
    const fixtures = JSON.parse(readFileSync(existingInside(root, manifest.fixture_path), "utf8"));
    const baselinePath = existingInside(repoRoot, manifest.baseline_path);
    const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
    if (
      manifest.profile_id !== "staged-v2"
      || baseline.schema_version !== "2"
      || baseline.baseline_version !== manifest.baseline_version
      || !manifest.corpus_version
      || !manifest.fixture_version
      || fixtures.fixture_version !== manifest.fixture_version
    ) fail("staged profile version mismatch");
    if (baseline.cases.length !== 40 || index.scenarios.length !== 72 || new Set(index.scenario_ids).size !== 72) fail("staged corpus coverage mismatch");
    const expectedIds = new Set(baseline.scenarios.map((item) => item.scenario_id));
    if (index.scenarios.some((item) => !expectedIds.has(item.scenario_id)) || baseline.scenarios.some((item) => !index.scenario_ids.includes(item.scenario_id))) fail("staged scenario baseline mismatch");
    for (const scenario of index.scenarios) {
      if (scenario.evidence_pack_id && !fixtures.evidence_packs[scenario.evidence_pack_id]) fail(`missing evidence pack ${scenario.scenario_id}`);
      validateStagedBlindScenario(
        scenario,
        scenario.evidence_pack_id ? fixtures.evidence_packs[scenario.evidence_pack_id] : null,
        baseline.scenarios.find((item) => item.scenario_id === scenario.scenario_id),
      );
    }
    const cases = index.scenarios.map((scenario) => ({
      ...scenario,
      profile_id: "staged-v2",
      corpus_version: manifest.corpus_version,
      fixture_version: manifest.fixture_version,
      allowed_stages: ["ungated_execution", "ur", "brownfield_review", "prd", "sd", "tp", "brownfield_analysis", "cd_tests", "cr", "qa", "uat", "or", "blocked"],
      evidence_pack: scenario.evidence_pack_id ? fixtures.evidence_packs[scenario.evidence_pack_id] : null,
    }));
    return { profile_id: "staged-v2", manifest, baseline, fixtures, cases };
  }
  if (profileId !== "legacy-v1") fail(`unknown proportionality profile ${profileId}`);
  const manifest = JSON.parse(readFileSync(existingInside(root, "manifest.json"), "utf8"));
  const provenance = JSON.parse(readFileSync(existingInside(root, "legacy-v1-provenance.json"), "utf8"));
  const index = JSON.parse(readFileSync(existingInside(root, "cases.json"), "utf8"));
  const fixtures = JSON.parse(readFileSync(existingInside(root, "fixtures/catalog.json"), "utf8"));
  const baselinePath = existingInside(repoRoot, manifest.baseline_path);
  const baseline = validateBaseline(JSON.parse(readFileSync(baselinePath, "utf8")));
  if (manifest.schema_version !== "1" || index.schema_version !== "1" || manifest.baseline_version !== baseline.baseline_version) fail("manifest/corpus version mismatch");
  if (provenance.profile_id !== "legacy-v1" || Object.keys(provenance.source_fingerprints ?? {}).length !== 40) fail("legacy provenance incomplete");
  for (const [path, expectedHash] of Object.entries(provenance.files ?? {})) {
    const target = existingInside(repoRoot, path);
    if (sha256(target) !== expectedHash) fail(`legacy provenance drift ${path}`, "PROPORTIONALITY_HISTORY_DRIFT");
  }
  if (!Array.isArray(index.case_ids) || index.case_ids.length !== 40 || new Set(index.case_ids).size !== 40) fail("blind corpus must list 40 unique ids");
  if (Object.keys(index.case_contexts ?? {}).some((id) => !index.case_ids.includes(id))) fail("case context references unknown id");
  if (Object.values(index.case_contexts ?? {}).some((value) => typeof value !== "string" || /expected_delivery_path|compact_delivery|structured_slice|structured_delivery|verified_change|trivial_change/i.test(value))) fail("case context contains result label");
  const baselineIds = new Set(baseline.cases.map((item) => item.case_id));
  if (index.case_ids.some((id) => !baselineIds.has(id)) || baseline.cases.some((item) => !index.case_ids.includes(item.case_id))) fail("baseline/corpus ids differ");
  const artefactRoot = realpathSync(resolve(repoRoot, ".agdf/control/artefacts"));
  for (const item of baseline.cases) {
    const evidence = resolve(dirname(baselinePath), item.evidence_ref);
    if (!existsSync(evidence)) fail(`unresolvable evidence_ref ${item.case_id}`);
    const rel = relative(artefactRoot, realpathSync(evidence));
    if (rel === ".." || rel.startsWith(`..${sep}`)) fail(`unsafe evidence_ref ${item.case_id}`);
  }
  const fixture = fixtures.fixtures?.[index.fixture_id];
  if (!fixture || "expected_delivery_path" in fixture || "rationale" in fixture) fail("invalid blind fixture");
  const cases = baseline.cases.map(({ case_id, task_summary }) => ({
    case_id, task_summary, fixture_id: index.fixture_id,
    repository_context: fixture.repository_context,
    control_state_context: index.case_contexts?.[case_id] ?? fixture.control_state_context,
  }));
  return { profile_id: "legacy-v1", manifest, baseline, fixtures, provenance, cases };
}
