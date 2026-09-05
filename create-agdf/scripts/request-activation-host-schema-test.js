import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateJsonSchema } from "../lib/request-activation-evals/index.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const evidenceRoot = join(repoRoot, ".agdf", "control", "artefacts", "agdf-request-activation-boundary");
const schema = JSON.parse(readFileSync(join(evidenceRoot, "HOST_OBSERVATION_SCHEMA.json"), "utf8"));
const unavailableMatrix = JSON.parse(readFileSync(join(evidenceRoot, "HOST_OBSERVATION_MATRIX.json"), "utf8"));
const pluginDefinition = JSON.parse(readFileSync(join(repoRoot, "plugin", "meta", "agdf-plugin.definition.json"), "utf8"));
const activationManifest = JSON.parse(readFileSync(join(repoRoot, "evals", "request-activation", "manifest.json"), "utf8"));
const requiredHosts = schema.$defs.host.properties.host.enum;
const requiredFamilies = schema.$defs.case_family_id.enum;
const callbackVocabulary = activationManifest.callback_vocabulary;
const baselineCallbackVocabulary = ["session_start", ...callbackVocabulary];
const digestPattern = /^sha256:[0-9a-f]{64}$/;

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
const sameMembers = (values, expected) => values.length === expected.length && expected.every((value) => values.includes(value));

// This independent domain oracle makes failures readable. Every fixture is also evaluated
// against the actual JSON Schema below, so the oracle cannot substitute for schema enforcement.
function validateCompletionEvidence(document) {
  const failures = [];
  const fail = (path, message) => failures.push(`${path}: ${message}`);
  const hosts = Array.isArray(document.hosts) ? document.hosts : [];

  if (document.request_activation?.guard_fingerprint !== unavailableMatrix.request_activation.guard_fingerprint) {
    fail("request_activation.guard_fingerprint", "must equal the canonical run fingerprint");
  }

  if (hosts.length !== requiredHosts.length) fail("hosts", `expected exactly ${requiredHosts.length} hosts`);

  const hostIds = hosts.map((host) => host.host);
  if (new Set(hostIds).size !== requiredHosts.length || !sameMembers(hostIds, requiredHosts)) {
    fail("hosts", "every evidence state requires each canonical host exactly once");
  }

  if (document.status === "complete") {
    if (hosts.some((host) => host.status !== "complete")) fail("hosts", "every host must be complete");
  }

  for (const [index, host] of hosts.entries()) {
    const path = `hosts[${index}]`;
    const probes = isObject(host.host_specific_probes) ? host.host_specific_probes : {};

    if (host.host === "opencode") {
      const probeNames = Object.keys(probes);
      const expected = [
        "user_vs_model_skill_origin",
        "subagent_hook_propagation",
        "system_transform_reapplied_after_compaction",
        "current_binding_available_after_compaction",
      ];
      if (!sameMembers(probeNames, expected)) fail(`${path}.host_specific_probes`, "OpenCode requires all canonical probes and no others");
    } else if (Object.keys(probes).length !== 0) {
      fail(`${path}.host_specific_probes`, "no host-specific probe is defined for this host");
    }

    if (host.status !== "complete") continue;

    if (host.install?.status !== "observed") fail(`${path}.install.status`, "must be observed");
    if (host.staged_profile?.status !== "observed") fail(`${path}.staged_profile.status`, "must be observed");
    for (const field of ["install_result", "root", "identity"]) {
      if (!isNonEmptyString(host.staged_profile?.[field])) fail(`${path}.staged_profile.${field}`, "must be a non-empty string");
    }
    if (host.staged_profile?.version !== pluginDefinition.version) fail(`${path}.staged_profile.version`, `must equal ${pluginDefinition.version}`);
    if (!digestPattern.test(host.staged_profile?.digest ?? "")) fail(`${path}.staged_profile.digest`, "must be a SHA-256 digest");
    if (host.installed_profile?.status !== "observed") fail(`${path}.installed_profile.status`, "must be observed");
    for (const field of ["install_result", "root", "identity"]) {
      if (!isNonEmptyString(host.installed_profile?.[field])) fail(`${path}.installed_profile.${field}`, "must be a non-empty string");
    }
    if (host.installed_profile?.version !== pluginDefinition.version) fail(`${path}.installed_profile.version`, `must equal ${pluginDefinition.version}`);
    if (!digestPattern.test(host.installed_profile?.digest ?? "")) fail(`${path}.installed_profile.digest`, "must be a SHA-256 digest");
    for (const field of ["version", "digest", "identity"]) {
      if (host.installed_profile?.[field] !== host.staged_profile?.[field]) fail(`${path}.installed_profile.${field}`, "must match the exact staged profile");
    }

    if (host.fresh_session?.status !== "observed") fail(`${path}.fresh_session.status`, "must be observed");
    for (const field of ["host_version", "model", "profile_identity"]) {
      if (!isNonEmptyString(host.fresh_session?.[field])) fail(`${path}.fresh_session.${field}`, "must be a non-empty string");
    }
    if (host.fresh_session?.profile_version !== pluginDefinition.version) fail(`${path}.fresh_session.profile_version`, `must equal ${pluginDefinition.version}`);
    if (!digestPattern.test(host.fresh_session?.profile_digest ?? "")) fail(`${path}.fresh_session.profile_digest`, "must be a SHA-256 digest");
    if (host.fresh_session?.profile_digest !== host.installed_profile?.digest) fail(`${path}.fresh_session.profile_digest`, "must match installed readback");
    if (host.fresh_session?.profile_identity !== host.installed_profile?.identity) fail(`${path}.fresh_session.profile_identity`, "must match installed readback");
    if (!["manual", "enabled"].includes(host.fresh_session?.session_start_consent)) fail(`${path}.fresh_session.session_start_consent`, "must record manual or enabled consent");
    const baseline = host.fresh_session?.post_session_start_callback_baseline;
    if (!isObject(baseline) || !sameMembers(Object.keys(baseline), baselineCallbackVocabulary)
        || Object.values(baseline).some((value) => !Number.isInteger(value) || value < 0)) {
      fail(`${path}.fresh_session.post_session_start_callback_baseline`, "must contain every canonical callback count exactly once");
    }

    if (host.trusted_invocation_signal !== "observed") fail(`${path}.trusted_invocation_signal`, "must be observed");
    if (host.callback_trace !== "observed") fail(`${path}.callback_trace`, "must be observed");

    const families = Array.isArray(host.case_families) ? host.case_families : [];
    const familyIds = families.map((family) => family.id);
    if (new Set(familyIds).size !== requiredFamilies.length || !sameMembers(familyIds, requiredFamilies)) {
      fail(`${path}.case_families`, "must contain each canonical family exactly once");
    }
    if (families.some((family) => family.status !== "pass")) fail(`${path}.case_families`, "every family must pass");

    if (!Array.isArray(host.observations) || host.observations.length === 0) {
      fail(`${path}.observations`, "must contain at least one observation");
    } else {
      const observedFamilies = new Set(host.observations.map((observation) => observation.case_family));
      for (const family of requiredFamilies) {
        if (!observedFamilies.has(family)) fail(`${path}.observations`, `missing observed case family ${family}`);
      }
      for (const [observationIndex, observation] of host.observations.entries()) {
        const observationPath = `${path}.observations[${observationIndex}]`;
        if (observation.outcome !== "pass") fail(`${observationPath}.outcome`, "must pass");
        if (!["current_user_text", "trusted_ephemeral_user_action"].includes(observation.invocation_provenance)) fail(`${observationPath}.invocation_provenance`, "must be observed");
        if (!["explicit_user_action", "automatic_discovery", "router_selection"].includes(observation.selection_origin)) fail(`${observationPath}.selection_origin`, "must be observed");
        if (!requiredFamilies.includes(observation.case_family)) fail(`${observationPath}.case_family`, "must be canonical");
        if (!isObject(observation.callback_delta) || !sameMembers(Object.keys(observation.callback_delta), callbackVocabulary)) {
          fail(`${observationPath}.callback_delta`, "must contain every canonical callback delta exactly once");
        }
        if (!isObject(observation.filesystem_control_delta)) fail(`${observationPath}.filesystem_control_delta`, "must be observed");
      }
    }

    if (host.host === "opencode" && Object.values(probes).some((value) => value !== "pass")) {
      fail(`${path}.host_specific_probes`, "all OpenCode probes must pass");
    }
  }

  return failures;
}

function completeFixture() {
  const document = structuredClone(unavailableMatrix);
  document.status = "complete";
  for (const [hostIndex, host] of document.hosts.entries()) {
    const profileDigest = `sha256:${String(hostIndex + 1).repeat(64)}`;
    const profileIdentity = `agdf@${pluginDefinition.version}:${host.host}:${profileDigest}`;
    host.status = "complete";
    host.reason = "Exact installed profile and fresh loaded-host observations recorded.";
    host.install = { status: "observed", reason: "Installed with the host lifecycle after consent." };
    host.staged_profile = {
      status: "observed",
      install_result: "staged",
      version: pluginDefinition.version,
      root: `/staged/${host.host}/agdf`,
      digest: profileDigest,
      identity: profileIdentity,
    };
    host.installed_profile = {
      status: "observed",
      install_result: "installed",
      version: pluginDefinition.version,
      root: `/installed/${host.host}/agdf`,
      digest: profileDigest,
      identity: profileIdentity,
    };
    host.fresh_session = {
      status: "observed",
      host_version: "1.0.0",
      model: "test-model",
      profile_version: pluginDefinition.version,
      profile_digest: profileDigest,
      profile_identity: profileIdentity,
      session_start_consent: "enabled",
      post_session_start_callback_baseline: Object.fromEntries(baselineCallbackVocabulary.map((callback) => [callback, callback === "session_start" ? 1 : 0])),
    };
    host.trusted_invocation_signal = "observed";
    host.callback_trace = "observed";
    host.case_families = host.case_families.map((family) => ({ ...family, status: "pass" }));
    host.observations = requiredFamilies.map((caseFamily) => ({
      case_id: `${host.host}-${caseFamily}`,
      case_family: caseFamily,
      invocation_provenance: "current_user_text",
      selection_origin: "automatic_discovery",
      visible_transcript: `Observed ${caseFamily} behavior for ${host.host}.`,
      callback_delta: Object.fromEntries(callbackVocabulary.map((callback) => [callback, 0])),
      filesystem_control_delta: {},
      covered_criteria: ["RAB-15"],
      outcome: "pass",
    }));
    host.claims_allowed = ["fresh-host request activation behavior"];
    if (host.host === "opencode") {
      host.host_specific_probes = {
        user_vs_model_skill_origin: "pass",
        subagent_hook_propagation: "pass",
        system_transform_reapplied_after_compaction: "pass",
        current_binding_available_after_compaction: "pass",
      };
    }
  }
  return document;
}

function assertInvalid(mutator, expectedFailure) {
  const document = completeFixture();
  mutator(document);
  const failures = validateCompletionEvidence(document);
  assert.ok(failures.some((failure) => failure.includes(expectedFailure)), `expected failure containing ${expectedFailure}; got ${JSON.stringify(failures)}`);
  assert.notDeepEqual(validateJsonSchema(schema, document), [], `actual JSON Schema must reject ${expectedFailure}`);
}

function assertOracleInvalid(mutator, expectedFailure) {
  const document = completeFixture();
  mutator(document);
  const failures = validateCompletionEvidence(document);
  assert.ok(failures.some((failure) => failure.includes(expectedFailure)), `expected oracle failure containing ${expectedFailure}; got ${JSON.stringify(failures)}`);
}

assert.deepEqual(validateCompletionEvidence(unavailableMatrix), [], "the truthful unavailable matrix must remain valid");
assert.deepEqual(validateCompletionEvidence(completeFixture()), [], "a fully evidenced four-host completion must be valid");
assert.deepEqual(validateJsonSchema(schema, unavailableMatrix), [], "the actual JSON Schema must accept the truthful unavailable matrix");
assert.deepEqual(validateJsonSchema(schema, completeFixture()), [], "the actual JSON Schema must accept fully evidenced completion");

const partialMatrix = structuredClone(unavailableMatrix);
partialMatrix.status = "partial";
partialMatrix.hosts[0].status = "partial";
partialMatrix.hosts[0].reason = "Codex evidence remains incomplete.";
assert.deepEqual(validateCompletionEvidence(partialMatrix), [], "a partial matrix with the exact canonical host set must remain valid");
assert.deepEqual(validateJsonSchema(schema, partialMatrix), [], "the actual JSON Schema must accept an honest partial matrix");

const exactHostSetRule = schema.allOf.find((rule) => rule.properties?.hosts?.allOf)?.properties.hosts;
assert.ok(exactHostSetRule, "schema must require the exact host set for every evidence state");
assert.deepEqual(exactHostSetRule.allOf.map((rule) => rule.contains.properties.host.const).sort(), [...requiredHosts].sort());
assert.equal(exactHostSetRule.allOf.every((rule) => rule.minContains === 1 && rule.maxContains === 1), true);

const topCompleteRule = schema.allOf.find((rule) => rule.if?.properties?.status?.const === "complete")?.then?.properties?.hosts;
assert.ok(topCompleteRule, "schema must condition top-level complete evidence");
assert.equal(topCompleteRule.items.allOf[1].properties.status.const, "complete");

const completeHostRule = schema.$defs.host.allOf.find((rule) => rule.if?.properties?.status?.const === "complete")?.then?.properties;
assert.ok(completeHostRule, "schema must condition each complete host");
assert.equal(completeHostRule.install.properties.status.const, "observed");
for (const profile of ["staged_profile", "installed_profile"]) {
  for (const field of ["install_result", "root", "identity"]) {
    assert.equal(completeHostRule[profile].properties[field].$ref, "#/$defs/non_empty_string");
  }
  assert.equal(completeHostRule[profile].properties.version.const, pluginDefinition.version);
  assert.equal(completeHostRule[profile].properties.digest.type, "string");
}
for (const field of ["host_version", "model"]) {
  assert.equal(completeHostRule.fresh_session.properties[field].$ref, "#/$defs/non_empty_string");
}
assert.equal(completeHostRule.fresh_session.properties.profile_version.const, pluginDefinition.version);
assert.equal(completeHostRule.fresh_session.properties.profile_digest.type, "string");
assert.equal(completeHostRule.fresh_session.properties.profile_identity.$ref, "#/$defs/non_empty_string");
assert.equal(completeHostRule.fresh_session.properties.post_session_start_callback_baseline.$ref, "#/$defs/callback_baseline");
assert.deepEqual(schema.$defs.callback_baseline.required, baselineCallbackVocabulary);
assert.deepEqual(schema.$defs.callback_delta.required, callbackVocabulary);
assert.equal(completeHostRule.trusted_invocation_signal.const, "observed");
assert.equal(completeHostRule.callback_trace.const, "observed");
assert.equal(completeHostRule.case_families.minItems, requiredFamilies.length);
assert.equal(completeHostRule.case_families.maxItems, requiredFamilies.length);
assert.equal(completeHostRule.case_families.uniqueItems, true);
assert.equal(completeHostRule.case_families.items.allOf[1].properties.status.const, "pass");
assert.equal(completeHostRule.observations.minItems, requiredFamilies.length);
assert.equal(completeHostRule.observations.allOf.length, requiredFamilies.length);
assert.equal(completeHostRule.observations.items.allOf[1].properties.outcome.const, "pass");
assert.equal(completeHostRule.observations.items.allOf[1].properties.callback_delta.$ref, "#/$defs/callback_delta");

const openCodeCompleteRule = schema.$defs.host.allOf.find((rule) => rule.if?.properties?.host?.const === "opencode" && rule.if?.properties?.status?.const === "complete");
assert.equal(openCodeCompleteRule.then.properties.host_specific_probes.properties.user_vs_model_skill_origin.const, "pass");
assert.equal(openCodeCompleteRule.then.properties.host_specific_probes.properties.subagent_hook_propagation.const, "pass");
assert.equal(openCodeCompleteRule.then.properties.host_specific_probes.properties.system_transform_reapplied_after_compaction.const, "pass");
assert.equal(openCodeCompleteRule.then.properties.host_specific_probes.properties.current_binding_available_after_compaction.const, "pass");

assertInvalid((document) => { document.hosts[1].host = "codex"; }, "each canonical host exactly once");
assertInvalid((document) => { document.hosts[0].status = "partial"; }, "every host must be complete");
assertInvalid((document) => { document.hosts[0].install.status = "unavailable"; }, "install.status");
for (const field of ["install_result", "version", "root", "identity"]) {
  assertInvalid((document) => { document.hosts[0].staged_profile[field] = null; }, `staged_profile.${field}`);
}
assertInvalid((document) => { document.hosts[0].staged_profile.digest = null; }, "staged_profile.digest");
for (const field of ["install_result", "version", "root", "identity"]) {
  assertInvalid((document) => { document.hosts[0].installed_profile[field] = null; }, `installed_profile.${field}`);
}
assertInvalid((document) => { document.hosts[0].installed_profile.digest = null; }, "installed_profile.digest");
for (const field of ["host_version", "model", "profile_version", "profile_identity"]) {
  assertInvalid((document) => { document.hosts[0].fresh_session[field] = null; }, `fresh_session.${field}`);
}
assertInvalid((document) => { document.hosts[0].fresh_session.profile_digest = null; }, "fresh_session.profile_digest");
assertInvalid((document) => { document.hosts[0].fresh_session.session_start_consent = "unavailable"; }, "session_start_consent");
assertInvalid((document) => { document.hosts[0].fresh_session.post_session_start_callback_baseline = {}; }, "post_session_start_callback_baseline");
assertInvalid((document) => { delete document.hosts[0].fresh_session.post_session_start_callback_baseline.dispatcher_v1; }, "post_session_start_callback_baseline");
assertInvalid((document) => { document.hosts[0].trusted_invocation_signal = "unavailable"; }, "trusted_invocation_signal");
assertInvalid((document) => { document.hosts[0].callback_trace = "unavailable"; }, "callback_trace");
assertInvalid((document) => { document.hosts[0].case_families[1] = structuredClone(document.hosts[0].case_families[0]); }, "each canonical family exactly once");
assertInvalid((document) => { document.hosts[0].case_families[0].status = "fail"; }, "every family must pass");
assertInvalid((document) => { document.hosts[0].observations = []; }, "at least one observation");
assertInvalid((document) => { document.hosts[0].observations = document.hosts[0].observations.filter((observation) => observation.case_family !== requiredFamilies[0]); }, "missing observed case family");
assertInvalid((document) => { document.hosts[0].observations[0].outcome = "fail"; }, "observations[0].outcome");
assertInvalid((document) => { document.hosts[0].observations[0].callback_delta = {}; }, "observations[0].callback_delta");
assertInvalid((document) => { document.hosts[0].observations[0].callback_delta.unknown_callback = 0; }, "observations[0].callback_delta");
assertInvalid((document) => { document.request_activation.guard_fingerprint = `sha256:${"f".repeat(64)}`; }, "guard_fingerprint");
assertInvalid((document) => { document.hosts[0].installed_profile.version = "0.14.4"; }, "installed_profile.version");
assertOracleInvalid((document) => { document.hosts[0].installed_profile.digest = `sha256:${"9".repeat(64)}`; }, "must match the exact staged profile");
assertOracleInvalid((document) => { document.hosts[0].fresh_session.profile_digest = `sha256:${"8".repeat(64)}`; }, "must match installed readback");
assertOracleInvalid((document) => { document.hosts[0].fresh_session.profile_identity = "different-profile"; }, "must match installed readback");
assertInvalid((document) => { delete document.hosts[3].host_specific_probes.user_vs_model_skill_origin; }, "OpenCode requires all canonical probes");
assertInvalid((document) => { document.hosts[3].host_specific_probes.subagent_hook_propagation = "unavailable"; }, "all OpenCode probes must pass");
assertInvalid((document) => { document.hosts[3].host_specific_probes.system_transform_reapplied_after_compaction = "unavailable"; }, "all OpenCode probes must pass");
assertInvalid((document) => { document.hosts[3].host_specific_probes.current_binding_available_after_compaction = "unavailable"; }, "all OpenCode probes must pass");

const duplicateUnavailableHost = structuredClone(unavailableMatrix);
duplicateUnavailableHost.hosts[1].host = "codex";
assert.ok(validateCompletionEvidence(duplicateUnavailableHost).some((failure) => failure.includes("each canonical host exactly once")));
assert.notDeepEqual(validateJsonSchema(schema, duplicateUnavailableHost), [], "unavailable evidence must also reject a duplicate host");

const duplicatePartialHost = structuredClone(partialMatrix);
duplicatePartialHost.hosts[1].host = "codex";
assert.ok(validateCompletionEvidence(duplicatePartialHost).some((failure) => failure.includes("each canonical host exactly once")));
assert.notDeepEqual(validateJsonSchema(schema, duplicatePartialHost), [], "partial evidence must also reject a duplicate host");

console.log("Request Activation host observation schema tests passed");
