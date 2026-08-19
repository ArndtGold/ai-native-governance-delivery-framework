import { existsSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative, resolve, sep } from "node:path";
import { DELIVERY_PATHS, fail, validateBaseline } from "./contracts.js";
import { getProfileDefinition, isStagedProfile } from "./profiles.js";

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
const stagedForbidden = /expected_|evidence_ref|classification|threshold|reason_code|target_rationale|grading_value|baseline_(version|path)|trivial_change|compact_delivery|verified_change|structured_slice|structured_delivery/i;
export function validateStagedBlindScenario(scenario, evidencePack = null, baselineScenario = null) {
  if (stagedForbidden.test(JSON.stringify(scenario))) fail(`staged scenario leakage ${scenario.scenario_id}`, "PROPORTIONALITY_LEAKAGE");
  const quickTaskReferences = JSON.stringify(scenario).match(/quick_task/gi)?.length ?? 0;
  if (quickTaskReferences && (
    scenario.lifecycle_stage !== "post_brownfield_decision"
    || scenario.control_state_context !== "A durable UR is approved. Brownfield analysis is complete and the stored mode/slice decision is quick_task."
    || quickTaskReferences !== 1
  )) fail(`staged scenario path leakage ${scenario.scenario_id}`, "PROPORTIONALITY_LEAKAGE");
  if (evidencePack) {
    const leakageEvidence = JSON.parse(JSON.stringify(evidencePack));
    const escalation = leakageEvidence.bounded_change_facts?.escalation;
    if (escalation) {
      if (!["structured_slice", "structured_delivery"].includes(escalation.target)) fail(`invalid structured escalation target ${scenario.scenario_id}`, "PROPORTIONALITY_LEAKAGE");
      delete escalation.target;
    }
    if (stagedForbidden.test(JSON.stringify(leakageEvidence))) fail(`staged evidence-pack leakage ${scenario.scenario_id}`, "PROPORTIONALITY_LEAKAGE");
  }
  if (baselineScenario && (
    JSON.stringify(scenario).includes(baselineScenario.rationale)
    || JSON.stringify(evidencePack ?? {}).includes(baselineScenario.rationale)
  )) fail(`staged rationale leakage ${scenario.scenario_id}`, "PROPORTIONALITY_LEAKAGE");
  return scenario;
}
function recursiveFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? recursiveFiles(path) : [path];
  });
}
const requiredProtectedV2Files = [
  "evals/proportionality/staged-manifest.json",
  "evals/proportionality/staged-scenarios.json",
  "evals/proportionality/fixtures/staged-catalog.json",
  ".agdf/control/artefacts/agdf-staged-proportionality-observation/STAGED_PROPORTIONALITY_BASELINE.json",
  ".agdf/control/artefacts/agdf-staged-proportionality-observation/STAGED_PROPORTIONALITY_REPORT.json",
  ".agdf/control/artefacts/agdf-staged-proportionality-observation/STAGED_PROPORTIONALITY_REPORT.md",
  ".agdf/control/artefacts/agdf-staged-proportionality-observation/QA_REPORT.md",
  ".agdf/control/artefacts/agdf-staged-proportionality-observation/OR.md",
];
const requiredProtectedV2Root = "evals/proportionality/observations/codex-gpt-5.6-sol-agdf-0.11.4-staged-v2-20260729-r3";
export function validateHistoryInventory(repoRoot, root, manifest) {
  const inventoryPath = existingInside(root, manifest.history_provenance_path);
  const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
  if (inventory.schema_version !== "1" || inventory.profile_id !== manifest.profile_id || inventory.inventory_version !== manifest.history_inventory_version) fail("history inventory version mismatch", "PROPORTIONALITY_HISTORY_DRIFT");
  const declared = Object.keys(inventory.protected_files ?? {}).sort();
  if (requiredProtectedV2Files.some((path) => !declared.includes(path))) fail("protected history inventory omits required staged-v2 evidence", "PROPORTIONALITY_HISTORY_DRIFT");
  if (!Array.isArray(inventory.protected_roots) || inventory.protected_roots.length !== 1 || inventory.protected_roots[0] !== requiredProtectedV2Root) fail("protected history root mismatch", "PROPORTIONALITY_HISTORY_DRIFT");
  if (declared.some((path) => !requiredProtectedV2Files.includes(path) && !path.startsWith(`${requiredProtectedV2Root}/`))) fail("protected history inventory contains an out-of-bound path", "PROPORTIONALITY_HISTORY_DRIFT");
  for (const path of declared) {
    const target = existingInside(repoRoot, path);
    if (sha256(target) !== inventory.protected_files[path]) fail(`protected history drift ${path}`, "PROPORTIONALITY_HISTORY_DRIFT");
  }
  for (const protectedRoot of inventory.protected_roots ?? []) {
    const absolute = existingInside(repoRoot, protectedRoot);
    const actual = recursiveFiles(absolute).map((path) => relative(repoRoot, path).split(sep).join("/")).sort();
    const expected = declared.filter((path) => path === protectedRoot || path.startsWith(`${protectedRoot}/`));
    if (actual.length !== expected.length || actual.some((path, index) => path !== expected[index])) fail(`protected history inventory incomplete ${protectedRoot}`, "PROPORTIONALITY_HISTORY_DRIFT");
  }
  return inventory;
}
const verifiedFactGroups = ["ownership_boundary", "prohibited_impacts", "deterministic_controls", "baseline_state", "escalation"];
const impactFacts = ["product_semantics", "runtime", "policy", "persistence", "architecture", "security", "external_api", "cli_contract", "release", "cross_host"];
const depthTriggerFamilies = ["behavior_or_policy", "architecture_or_runtime", "persistence_or_security", "external_contract", "release_or_cross_host", "unbounded_coordination"];
const depthChecks = ["scope_boundary", "owner_map", "affected_surfaces", "validation_path", "rollback_boundary", "coordination_boundary", "uncertainty_register"];
const semanticDepthTargets = {
  "PB-021": "behavior_or_policy",
  "PB-031": "architecture_or_runtime",
  "PB-033": "persistence_or_security",
  "PB-034": "unbounded_coordination",
  "PB-036": "release_or_cross_host",
  "PB-037": "external_contract",
};
export function validateV3Facts(index, fixtures, baseline) {
  for (const caseId of ["PB-008", "PB-010", "PB-011"]) {
    const scenarios = index.scenarios.filter((item) => item.case_id === caseId);
    if (!scenarios.length) fail(`missing targeted semantics ${caseId}`);
    for (const scenario of scenarios) {
      if (caseId === "PB-008" && (!scenario.decision_state_facts || typeof scenario.decision_state_facts.effective_control_state !== "string" || typeof scenario.decision_state_facts.currently_permitted_action !== "string" || typeof scenario.decision_state_facts.mutation_intent !== "string" || scenario.decision_state_facts.unresolved_target !== true)) fail(`incomplete decision-state facts ${scenario.scenario_id}`);
      if (["PB-010", "PB-011"].includes(caseId) && (!scenario.task_semantics?.requested_action || !scenario.task_semantics?.semantic_effect || !scenario.task_semantics?.excluded_effects?.length)) fail(`incomplete task semantics ${scenario.scenario_id}`);
    }
  }
  for (const caseId of ["PB-016", "PB-017", "PB-020"]) {
    const pack = fixtures.evidence_packs[`EP-${caseId}`]?.bounded_change_facts;
    const missingGroup = verifiedFactGroups.find((key) => !(key in (pack ?? {})));
    if (!pack || missingGroup) fail(`incomplete verified-change facts ${caseId}: missing ${missingGroup ?? "bounded_change_facts"}; restore the declared facts and rerun`);
    if (pack.ownership_boundary.canonical_owner_count !== 1 || pack.ownership_boundary.bounded !== true || !Number.isInteger(pack.ownership_boundary.source_path_count) || pack.ownership_boundary.source_path_count < 1 || !Number.isInteger(pack.ownership_boundary.derived_path_count) || pack.ownership_boundary.derived_path_count < 0) fail(`conflicting ownership-boundary facts ${caseId}; correct the facts and rerun`);
    if (!/^[a-f0-9]{40}$/.test(pack.baseline_state.commit ?? "") || pack.baseline_state.tracked_candidate_paths_clean !== true || pack.baseline_state.untracked_candidate_paths_clean !== true || !Array.isArray(pack.baseline_state.conflicts) || pack.baseline_state.conflicts.length) fail(`conflicting baseline-state facts ${caseId}; correct the facts and rerun`);
    if (pack.deterministic_controls.validation !== true || pack.deterministic_controls.propagation !== true) fail(`conflicting deterministic-control facts ${caseId}; correct the facts and rerun`);
    if (pack.prohibited_impacts.complete !== true || impactFacts.some((key) => pack.prohibited_impacts.impacts?.[key] !== false)) fail(`conflicting prohibited-impact facts ${caseId}; correct the facts and rerun`);
    if (!["structured_slice", "structured_delivery"].includes(pack.escalation.target) || !Array.isArray(pack.escalation.conditions) || !pack.escalation.conditions.length) fail(`conflicting escalation facts ${caseId}; correct the facts and rerun`);
  }
  const structuredCases = baseline.cases.filter((item) => ["structured_slice", "structured_delivery"].includes(item.expected_delivery_path));
  for (const item of structuredCases) {
    const facts = fixtures.evidence_packs[`EP-${item.case_id}`]?.structured_depth_facts;
    if (!facts || facts.depth_policy_version !== 1 || facts.fact_state !== "complete" || !Array.isArray(facts.conflicts) || facts.conflicts.length) fail(`incomplete structured-depth facts ${item.case_id}; correct the facts and rerun`);
    if (depthTriggerFamilies.some((key) => typeof facts.trigger_families?.[key] !== "boolean")) fail(`incomplete depth triggers ${item.case_id}; complete all six trigger families and rerun`);
    if (depthChecks.some((key) => typeof facts.bounded_checks?.[key] !== "string" || !facts.bounded_checks[key])) fail(`incomplete depth checks ${item.case_id}; complete all seven bounded checks and rerun`);
    if (semanticDepthTargets[item.case_id] && (facts.semantic_eval_target !== semanticDepthTargets[item.case_id] || facts.trigger_families[facts.semantic_eval_target] !== true)) fail(`invalid semantic depth target ${item.case_id}`);
  }
  if (new Set(Object.values(semanticDepthTargets)).size !== depthTriggerFamilies.length) fail("semantic depth target coverage mismatch");
}
export function loadCorpus(repoRoot, profileId = "legacy-v1") {
  const profile = getProfileDefinition(profileId);
  const root = existingInside(repoRoot, "evals/proportionality");
  if (isStagedProfile(profile)) {
    const manifest = JSON.parse(readFileSync(existingInside(repoRoot, profile.manifest_path), "utf8"));
    const index = JSON.parse(readFileSync(existingInside(root, manifest.scenarios_path), "utf8"));
    const fixtures = JSON.parse(readFileSync(existingInside(root, manifest.fixture_path), "utf8"));
    const baselinePath = existingInside(repoRoot, manifest.baseline_path);
    const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
    const versionMismatch = [
      ["manifest.profile_id", manifest.profile_id, profile.profile_id],
      ["manifest.schema_version", manifest.schema_version, profile.schema_version],
      ["manifest.protocol_version", manifest.protocol_version, profile.protocol_version],
      ["index.schema_version", index.schema_version, profile.schema_version],
      ["index.profile_id", index.profile_id, profile.profile_id],
      ["fixtures.schema_version", fixtures.schema_version, profile.schema_version],
      ["fixtures.profile_id", fixtures.profile_id, profile.profile_id],
      ["fixtures.fixture_version", fixtures.fixture_version, manifest.fixture_version],
      ["baseline.schema_version", baseline.schema_version, profile.schema_version],
      ["baseline.baseline_version", baseline.baseline_version, manifest.baseline_version],
    ].find(([, actual, expected]) => actual !== expected);
    if (versionMismatch || !manifest.corpus_version || !manifest.fixture_version) fail(`staged profile version mismatch: ${versionMismatch?.[0] ?? "manifest corpus/fixture version"}`);
    if (profile.strict_version_links) {
      const strictMismatch = [
        ["index.corpus_version", index.corpus_version, manifest.corpus_version],
        ["baseline.profile_id", baseline.profile_id, profile.profile_id],
        ["baseline.protocol_version", baseline.protocol_version, profile.protocol_version],
        ["manifest.adapter_version", manifest.adapter_version, profile.adapter_version],
        ["manifest.runner_version", manifest.runner_version, profile.runner_version],
        ["manifest.report_version", manifest.report_version, profile.report_version],
      ].find(([, actual, expected]) => actual !== expected);
      if (strictMismatch || !manifest.history_inventory_version) fail(`staged profile version mismatch: ${strictMismatch?.[0] ?? "manifest.history_inventory_version"}`);
    }
    const baselineCaseIds = baseline.cases.map((item) => item.case_id);
    const scenarioIds = index.scenarios.map((item) => item.scenario_id);
    if (baseline.cases.length !== 40 || new Set(baselineCaseIds).size !== 40 || baselineCaseIds.some((id) => !/^PB-\d{3}$/.test(id))) fail("staged case identity mismatch");
    if (!Array.isArray(index.scenario_ids) || index.scenario_ids.length !== 72 || index.scenarios.length !== 72 || new Set(index.scenario_ids).size !== 72 || new Set(scenarioIds).size !== 72 || scenarioIds.some((id) => !index.scenario_ids.includes(id))) fail("staged corpus coverage mismatch");
    const pathSet = new Set(baseline.cases.map((item) => item.expected_delivery_path));
    if (DELIVERY_PATHS.some((path) => !pathSet.has(path)) || [...pathSet].some((path) => !DELIVERY_PATHS.includes(path)) || baseline.cases.filter((item) => item.adversarial).length < 10) fail("staged baseline coverage mismatch");
    const expectedIds = new Set(baseline.scenarios.map((item) => item.scenario_id));
    if (baseline.scenarios.length !== 72 || expectedIds.size !== 72 || baseline.scenarios.some((item) => !baselineCaseIds.includes(item.case_id) || item.scenario_id.split(":")[0] !== item.case_id)) fail("staged scenario baseline mismatch");
    if (index.scenarios.some((item) => !expectedIds.has(item.scenario_id)) || baseline.scenarios.some((item) => !index.scenario_ids.includes(item.scenario_id))) fail("staged scenario baseline mismatch");
    for (const scenario of index.scenarios) {
      if (scenario.evidence_pack_id && !fixtures.evidence_packs[scenario.evidence_pack_id]) fail(`missing evidence pack ${scenario.scenario_id}`);
      validateStagedBlindScenario(
        scenario,
        scenario.evidence_pack_id ? fixtures.evidence_packs[scenario.evidence_pack_id] : null,
        baseline.scenarios.find((item) => item.scenario_id === scenario.scenario_id),
      );
    }
    const historyProvenance = profile.history_provenance ? validateHistoryInventory(repoRoot, root, manifest) : undefined;
    if (profile.semantic_fact_validation) validateV3Facts(index, fixtures, baseline);
    const cases = index.scenarios.map((scenario) => ({
      ...scenario,
      profile_id: profile.profile_id,
      corpus_version: manifest.corpus_version,
      fixture_version: manifest.fixture_version,
      allowed_stages: ["ungated_execution", "ur", "brownfield_review", "prd", "sd", "tp", "brownfield_analysis", "cd_tests", "cr", "qa", "uat", "or", "blocked"],
      evidence_pack: scenario.evidence_pack_id ? fixtures.evidence_packs[scenario.evidence_pack_id] : null,
    }));
    return { profile_id: profile.profile_id, profile, manifest, baseline, fixtures, ...(historyProvenance ? { history_provenance: historyProvenance } : {}), cases };
  }
  const manifest = JSON.parse(readFileSync(existingInside(repoRoot, profile.manifest_path), "utf8"));
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
  return { profile_id: "legacy-v1", profile, manifest, baseline, fixtures, provenance, cases };
}
