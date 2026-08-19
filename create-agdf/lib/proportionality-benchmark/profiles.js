const definitions = {
  "legacy-v1": {
    profile_id: "legacy-v1",
    family: "legacy",
    manifest_path: "evals/proportionality/manifest.json",
    schema_version: "1",
    protocol_version: "1",
    adapter_version: "1.1.0",
    runner_version: "1.0.0",
    report_version: "1.0.0",
    observation_key: "case_id",
    fixture_strategy: "catalog_fixture",
    evidence_kinds: ["live_agent_observation"],
    evidence_kind_provenance: false,
    history_provenance: false,
    semantic_fact_validation: false,
    fingerprint_profile_metadata: false,
    repository_replay_non_claim: false,
    strict_version_links: false,
    series_profile_metadata: false,
  },
  "staged-v2": {
    profile_id: "staged-v2",
    family: "staged",
    manifest_path: "evals/proportionality/staged-manifest.json",
    schema_version: "2",
    protocol_version: "2",
    adapter_version: "2.1.0",
    runner_version: "2.0.0",
    report_version: "2.0.0",
    observation_key: "scenario_id",
    fixture_strategy: "staged_catalog",
    evidence_kinds: ["live_agent_observation"],
    evidence_kind_provenance: false,
    history_provenance: false,
    semantic_fact_validation: false,
    fingerprint_profile_metadata: false,
    repository_replay_non_claim: false,
    strict_version_links: false,
    series_profile_metadata: false,
  },
  "staged-v3": {
    profile_id: "staged-v3",
    family: "staged",
    manifest_path: "evals/proportionality/staged-v3-manifest.json",
    schema_version: "3",
    protocol_version: "3",
    adapter_version: "3.0.0",
    runner_version: "3.0.0",
    report_version: "3.0.0",
    observation_key: "scenario_id",
    fixture_strategy: "staged_catalog",
    evidence_kinds: ["synthetic_replay", "live_agent_observation"],
    evidence_kind_provenance: true,
    history_provenance: true,
    semantic_fact_validation: true,
    fingerprint_profile_metadata: true,
    repository_replay_non_claim: true,
    strict_version_links: true,
    series_profile_metadata: true,
  },
};

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
  }
  return value;
}

export const PROPORTIONALITY_PROFILES = deepFreeze(definitions);
export const SUPPORTED_PROFILE_IDS = Object.freeze(Object.keys(PROPORTIONALITY_PROFILES));

export function getProfileDefinition(profileId) {
  const definition = PROPORTIONALITY_PROFILES[profileId];
  if (!definition) throw Object.assign(new Error(`unknown proportionality profile ${profileId}`), { code: "PROPORTIONALITY_PROFILE_UNKNOWN" });
  return definition;
}

export function isStagedProfile(profileOrId) {
  const definition = typeof profileOrId === "string" ? getProfileDefinition(profileOrId) : profileOrId;
  return definition.family === "staged";
}

export function observationKey(profileOrId, testCase) {
  const definition = typeof profileOrId === "string" ? getProfileDefinition(profileOrId) : profileOrId;
  const value = testCase[definition.observation_key];
  if (!value) throw new Error(`missing ${definition.observation_key} for ${definition.profile_id}`);
  return definition.observation_key === "scenario_id" ? value.replaceAll(":", "__") : value;
}

export function fixtureForProfile(profileOrId, corpus) {
  const definition = typeof profileOrId === "string" ? getProfileDefinition(profileOrId) : profileOrId;
  return definition.fixture_strategy === "staged_catalog"
    ? corpus.fixtures
    : corpus.fixtures.fixtures[corpus.manifest.fixture_id];
}

export function profileUsage() {
  return SUPPORTED_PROFILE_IDS.join("|");
}
