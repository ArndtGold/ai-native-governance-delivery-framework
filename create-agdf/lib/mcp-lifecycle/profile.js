import { mcpQualificationFields, validateMcpQualificationRecord } from "./evidence.js";

const CAPABILITY_STATES = new Set(["supported", "manual_compatible", "unavailable", "unsupported", "unverified"]);
const REGISTRATION_STATES = new Set(["absent", "matched", "foreign", "owned_mismatch", "precedence_conflict", "invalid"]);
const DISCOVERY_STATES = new Set(["not_checked", "pending_restart", "discovered", "not_discovered", "unavailable"]);
const RESULT_STATES = new Set(["not_configured", "configured_pending_restart", "configured_unverified", "discovered_ready", "unchanged", "disabled", "degraded", "failed"]);
const SURFACES = Object.freeze(["codex", "claude", "opencode", "copilot"]);

function plainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function exactEnum(actual, expected) {
  return Array.isArray(actual)
    && actual.length === expected.size
    && new Set(actual).size === expected.size
    && actual.every((value) => expected.has(value));
}

export function validateMcpCapabilityProfile(profile, { expectedVersion } = {}) {
  const errors = [];
  if (!plainObject(profile) || profile.schema_version !== 2) errors.push("schema_version");
  if (profile?.capability_id !== "agdf-mcp-dispatch") errors.push("capability_id");
  if (expectedVersion && profile?.release_version !== expectedVersion) errors.push("release_version");
  if (profile?.tool?.name !== "agdf_dispatch") errors.push("tool_name");
  if (profile?.tool?.semantic_owner !== "create-agdf/lib/skill-dispatch/contract.js") errors.push("semantic_owner");
  if (Object.hasOwn(profile?.tool ?? {}, "description") || Object.hasOwn(profile?.tool ?? {}, "input_schema")
      || Object.hasOwn(profile?.tool ?? {}, "output_schema")) errors.push("duplicated_tool_semantics");
  if (profile?.tool?.authorizes !== false || profile?.tool?.read_only !== true) errors.push("tool_boundary");
  if (profile?.package?.name !== "@agdf/mcp-server" || profile?.package?.sdk_server !== "2.0.0") errors.push("package");
  if (profile?.lifecycle?.owner !== "create-agdf" || profile?.lifecycle?.default_scope !== "project") errors.push("lifecycle");
  if (profile?.lifecycle?.result_contract_version !== 2) errors.push("result_contract_version");
  if (!exactEnum(profile?.lifecycle?.states?.capability, CAPABILITY_STATES)) errors.push("capability_states");
  if (!exactEnum(profile?.lifecycle?.states?.registration, REGISTRATION_STATES)) errors.push("registration_states");
  if (!exactEnum(profile?.lifecycle?.states?.discovery, DISCOVERY_STATES)) errors.push("discovery_states");
  if (!exactEnum(profile?.lifecycle?.states?.result, RESULT_STATES)) errors.push("result_states");
  for (const surface of SURFACES) {
    const adapter = profile?.lifecycle?.adapters?.[surface];
    if (!plainObject(adapter) || adapter.surface !== surface || !["project", "user"].includes(adapter.default_scope)
        || !plainObject(adapter.native_scopes) || typeof adapter.project_source !== "string"
        || typeof adapter.user_source !== "string") errors.push(`adapter:${surface}`);
  }
  if (!Array.isArray(profile?.qualification?.records)) errors.push("qualification_records");
  if (!exactEnum(profile?.qualification?.tuple, new Set(mcpQualificationFields))) errors.push("qualification_tuple");
  for (const [index, record] of (profile?.qualification?.records ?? []).entries()) {
    if (!validateMcpQualificationRecord(record).valid) errors.push(`qualification_record:${index}`);
  }
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

export function assertMcpCapabilityProfile(profile, options = {}) {
  const validation = validateMcpCapabilityProfile(profile, options);
  if (!validation.valid) throw new Error(`AGDF_MCP_CAPABILITY_PROFILE_INVALID:${validation.errors.join(",")}`);
  return profile;
}

export const mcpCapabilityProfileContract = Object.freeze({
  surfaces: SURFACES,
  capabilityStates: Object.freeze([...CAPABILITY_STATES]),
  registrationStates: Object.freeze([...REGISTRATION_STATES]),
  discoveryStates: Object.freeze([...DISCOVERY_STATES]),
  resultStates: Object.freeze([...RESULT_STATES]),
});
