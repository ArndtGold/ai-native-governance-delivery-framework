// Repository evidence contract. This module grants no runtime or governance authority.
export const HOSTS = Object.freeze(["codex", "claude", "copilot", "opencode"]);
export const SYSTEMS = Object.freeze(["darwin", "linux", "win32"]);
export const OUTCOMES = Object.freeze(["installed", "discovered", "callable", "updated", "recoverable"]);
export const CAPABILITIES = Object.freeze(["skills", "automatic_checks", "observed_governance", "technical_enforcement"]);
export const LANES = Object.freeze(["deterministic_adapter", "installed_payload", "fresh_host", "human_uat"]);
export const CLAIMS = Object.freeze([...OUTCOMES, ...CAPABILITIES]);
export const SCENARIOS = Object.freeze(["installed", "discovered", "discovery-missing", "discovery-wrong-payload", "callable", "target-unresolved", "missing-approval", "invalid-input", "updated", "update-stale", "recoverable", "recovery-partial", "manual-checks", "trusted-unexecuted"]);
export const SCENARIO_SPECS = Object.freeze(Object.fromEntries(SCENARIOS.map(scenario => {
  const negative = ["discovery-missing", "discovery-wrong-payload", "update-stale", "recovery-partial", "manual-checks", "trusted-unexecuted"].includes(scenario);
  const claim = scenario.startsWith("discovery-") ? "discovered" : scenario === "update-stale" ? "updated"
    : scenario === "recovery-partial" ? "recoverable" : ["manual-checks", "trusted-unexecuted"].includes(scenario) ? "automatic_checks"
      : ["target-unresolved", "missing-approval", "invalid-input"].includes(scenario) ? "callable" : scenario;
  return [scenario, Object.freeze({ claim, expected: negative ? "failed" : "demonstrated" })];
})));
export const IDENTITY_FIELDS = Object.freeze(["canonical_version", "source_digest", "runtime_digest"]);
export const ENVIRONMENT_FIELDS = Object.freeze(["host", "variant", "host_version", "os", "target_os", "path", "permission", "trust", "activation", "runtime_version", "sdk_version", "model", "fixture_version", "condition"]);
const METHODS = Object.freeze({ deterministic_adapter: "isolated_production_fixture", installed_payload: "installed_root_inspection", fresh_host: "fresh_host_observation", human_uat: "human_observation" });
export const digestPattern = /^[a-f0-9]{64}$/;
const text = value => typeof value === "string" && value.trim().length > 0;
export const stable = value => Array.isArray(value) ? value.map(stable)
  : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
export const canonical = value => JSON.stringify(stable(value));

export function validateInventory(manifest) {
  const errors = [];
  if (manifest?.schema_version !== 1) errors.push("manifest_schema");
  if (canonical(manifest?.hosts) !== canonical(HOSTS) || canonical(manifest?.systems) !== canonical(SYSTEMS)) errors.push("inventory_incomplete");
  if (!Array.isArray(manifest?.scenarios) || !manifest.scenarios.length || new Set(manifest.scenarios).size !== manifest.scenarios.length) errors.push("scenarios_empty_or_duplicate");
  if (!["native_sources", "native_targets", "public_evidence", "historical_sources"].every(key => Array.isArray(manifest?.[key]))) errors.push("evidence_inventory_missing");
  for (const target of manifest?.native_targets ?? []) {
    if (!target.environment || !ENVIRONMENT_FIELDS.every(key => Object.hasOwn(target.environment, key))
        || !HOSTS.includes(target.environment.host) || !SYSTEMS.includes(target.environment.os)
        || !LANES.includes(target.lane) || target.lane === "deterministic_adapter") errors.push("native_target_invalid");
  }
  return errors;
}

export function validateObservation(observation, referenceHashes = {}) {
  const o = observation;
  const errors = [];
  if (o?.schema_version !== 1 || !/^[a-zA-Z0-9_.-]+$/.test(o?.id ?? "")) errors.push("observation_identity");
  if (!text(o?.scenario) || !text(o?.observed_at) || !Number.isFinite(Date.parse(o.observed_at))) errors.push("observation_date_or_scenario");
  if (!LANES.includes(o?.lane) || o?.method !== METHODS[o?.lane]) errors.push("producer_method");
  if (!CLAIMS.includes(o?.claim) || !text(o?.mechanism)) errors.push("claim_scope");
  for (const group of ["expected", "observed"]) {
    if (!o?.[group] || !IDENTITY_FIELDS.every(key => Object.hasOwn(o[group], key))) errors.push(`${group}_identity_missing`);
    else {
      if (!text(o[group].canonical_version)) errors.push(`${group}_version_missing`);
      for (const key of ["source_digest", "runtime_digest"]) if (o[group][key] !== null && !digestPattern.test(o[group][key])) errors.push(`${group}_${key}_invalid`);
    }
  }
  const env = o?.environment;
  if (!env || !ENVIRONMENT_FIELDS.every(key => Object.hasOwn(env, key)) || !HOSTS.includes(env?.host) || !SYSTEMS.includes(env?.os)) errors.push("environment_missing");
  if (o?.lane === "deterministic_adapter" && (env?.variant !== "simulated" || !text(env?.fixture_version) || !text(env?.runtime_version))) errors.push("fixture_identity");
  if (o?.lane === "deterministic_adapter" && !digestPattern.test(o.source_fingerprint ?? "")) errors.push("fixture_source_fingerprint");
  if (o?.lane === "deterministic_adapter" && (SCENARIO_SPECS[o.scenario]?.claim !== o.claim || SCENARIO_SPECS[o.scenario]?.expected !== o.conformance?.expected)) errors.push("scenario_contract_mismatch");
  if (o?.lane !== "deterministic_adapter" && env?.variant === "simulated") errors.push("fixture_lane_promotion");
  if (!o?.original || !Object.hasOwn(o.original, "result") || !text(o.original.evidence_class)) errors.push("original_evidence_missing");
  if (!o?.facts || typeof o.facts !== "object" || Array.isArray(o.facts)) errors.push("facts_missing");
  if (!Array.isArray(o?.references) || !o.references.length) errors.push("references_missing");
  for (const ref of o?.references ?? []) {
    if (!text(ref.path) || !digestPattern.test(ref.sha256 ?? "") || referenceHashes[ref.path] !== ref.sha256) errors.push("reference_missing_or_changed");
  }
  if (o?.restriction && (!text(o.restriction.reason) || !o.references?.some(ref => ref.path === o.restriction.reference))) errors.push("restriction_without_evidence");
  if (o?.supersedes && (!Array.isArray(o.supersedes) || !text(o.retry_evidence) || !o.references?.some(ref => ref.path === o.retry_evidence))) errors.push("retry_without_evidence");
  return [...new Set(errors)];
}

export function identityGaps(o) {
  const required = ["variant", "os", "path", "permission", "trust", "activation", "condition"];
  if (o.lane !== "deterministic_adapter") required.push("host_version");
  if (o.lane === "fresh_host" && o.environment?.host === "opencode") required.push("sdk_version");
  if (["callable", "updated", "automatic_checks", "observed_governance", "technical_enforcement"].includes(o.claim)) required.push("runtime_version");
  if (["observed_governance", "technical_enforcement"].includes(o.claim) && o.lane !== "deterministic_adapter") required.push("model");
  return [
    ...required.filter(key => !text(o.environment?.[key])).map(key => `environment.${key}`),
    ...IDENTITY_FIELDS.filter(key => !text(o.expected?.[key]) || !text(o.observed?.[key])).map(key => `payload.${key}`),
  ];
}

export function tuple(o) {
  return canonical({ environment: o.environment, expected: o.expected, source_fingerprint: o.source_fingerprint ?? null, lane: o.lane, claim: o.claim, mechanism: o.mechanism });
}

// A success enum, trust receipt or fixture-supplied grade is never sufficient proof.
export function proofState(o) {
  const f = o.facts;
  if (o.restriction) return "unsupported";
  if (identityGaps(o).length) return "unverified";
  if (o.claim !== "recoverable" && IDENTITY_FIELDS.some(key => o.expected[key] !== o.observed[key])) return "failed";
  const matching = field => f[field] === o.expected.source_digest;
  if (o.lane === "installed_payload" && !["installed"].includes(o.claim)) return "unverified";
  if (o.claim === "installed") return typeof f.payload_present !== "boolean" ? "unverified" : f.payload_present && matching("payload_digest") ? "demonstrated" : "failed";
  if (["discovered", "skills"].includes(o.claim)) {
    if (!Array.isArray(f.expected_skills) || !f.expected_skills.length || !Array.isArray(f.exposed_skills)) return "unverified";
    const valid = f.expected_skills.every(name => f.exposed_skills.some(skill => skill.name === name && skill.enabled === true && skill.payload_digest === o.expected.source_digest));
    return valid ? "demonstrated" : "failed";
  }
  if (o.claim === "callable") {
    if (!f.invocation || !Object.hasOwn(f.invocation, "observed")) return "unverified";
    return f.invocation.observed === true && f.invocation.contract_version === 1 && f.invocation.binding_version === "2"
      && f.invocation.canonical_result === true && f.invocation.post_terminal_actions === 0 ? "demonstrated" : "failed";
  }
  if (o.claim === "updated") {
    if (!Object.hasOwn(f, "update_observed")) return "unverified";
    return f.update_observed === true && text(f.previous_digest) && f.previous_digest !== o.expected.source_digest
      && matching("payload_digest") && (o.lane === "deterministic_adapter" || f.fresh_session_observed === true) ? "demonstrated" : "failed";
  }
  if (o.claim === "recoverable") {
    if (!Object.hasOwn(f, "failure_observed")) return "unverified";
    return f.failure_observed === true && f.recovery_observed === true && f.foreign_preserved === true
      && f.permission_preserved === true && f.unresolved?.length === 0 && text(f.recovered_digest)
      && [f.previous_digest, o.expected.source_digest].includes(f.recovered_digest) ? "demonstrated" : "failed";
  }
  if (o.claim === "automatic_checks") {
    if (!Object.hasOwn(f, "check_executed")) return "unverified";
    return f.check_executed === true && f.check_result_observed === true && f.authorized === true ? "demonstrated" : "failed";
  }
  if (o.claim === "observed_governance") return typeof f.canonical_decision_observed !== "boolean" ? "unverified" : f.canonical_decision_observed ? "demonstrated" : "failed";
  if (o.claim === "technical_enforcement") {
    if (!Object.hasOwn(f, "disallowed_action_blocked")) return "unverified";
    return f.disallowed_action_blocked === true && f.intercepted_mechanism === o.mechanism && f.intercepted_path === o.environment.path ? "demonstrated" : "failed";
  }
  return "unverified";
}

export function nextAction(claim, state) {
  if (state === "demonstrated") return "Use only this dated environment and evidence scope; inspect local status for your machine.";
  if (state === "unsupported") return "Use the existing manual path within the documented restriction.";
  if (["failed", "stale/mismatched"].includes(state)) return "Use the existing bounded retry/restart/repair path when authorized, then record matching evidence.";
  return `Record a matching ${claim} observation through the existing verification path; retain manual mode while evidence is missing.`;
}

export function importHistoricalHC(matrix, source) {
  if (matrix?.schema_version !== "1" || matrix.run_id !== "agdf-live-host-conformance-matrix" || matrix.observations?.length !== 36) throw new Error("historical_schema_mismatch");
  const ids = new Set();
  return matrix.observations.map(o => {
    if (ids.has(o.observation_id) || !/^(?:codex|claude_code|opencode)$/.test(o.host) || !/^HC-(0[1-9]|1[0-2])$/.test(o.case_id)) throw new Error("historical_observation_invalid");
    ids.add(o.observation_id);
    return { id: o.observation_id, run_id: matrix.run_id, case_id: o.case_id, host: o.host === "claude_code" ? "claude" : o.host,
      host_version: o.host_version, canonical_version: o.agdf_version, observed_at: o.observed_at,
      original: { result: o.result, evidence_class: o.evidence_class, enforcement_class: o.enforcement_class },
      source, original_references: o.evidence_refs, applicability: "historical_incomplete_identity" };
  });
}
