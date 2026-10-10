import { mcpCapabilityProfileContract } from "./profile.js";

const SETS = Object.freeze({
  capability: new Set(mcpCapabilityProfileContract.capabilityStates),
  registration: new Set(mcpCapabilityProfileContract.registrationStates),
  discovery: new Set(mcpCapabilityProfileContract.discoveryStates),
  result: new Set(mcpCapabilityProfileContract.resultStates),
});

function freezeArray(value = []) {
  return Object.freeze(value.map((entry) => Object.freeze({ ...entry })));
}

function coded(value, fallbackCode) {
  if (typeof value === "string") return Object.freeze({ code: value, parameters: Object.freeze({}) });
  if (value && typeof value === "object" && typeof value.code === "string") {
    return Object.freeze({ ...value, parameters: Object.freeze({ ...(value.parameters ?? {}) }) });
  }
  return Object.freeze({ code: fallbackCode, parameters: Object.freeze({}) });
}

function effectiveScope(registration) {
  if (registration?.effective_status === "absent") return null;
  if (registration?.effective_source === "user") return "user";
  if (["project", "project_override", "local", "shared_project", "inline", "custom"].includes(registration?.effective_source)) return "project";
  return null;
}

export function createMcpLifecycleResult({
  action,
  result,
  surface,
  scope,
  scopeEffect,
  target,
  capability,
  host = null,
  runtime,
  registration,
  discovery = { status: "not_checked" },
  changes = [],
  diagnostics = [],
  nextAction,
  fallback = { code: "version_matched_cli_dispatch" },
  permissionEffect = { code: "inherited_host_user" },
}) {
  const invalidCombination = (result === "discovered_ready"
      && (capability !== "supported" || registration?.status !== "matched" || discovery?.status !== "discovered"
        || discovery?.source !== "direct_host" || typeof discovery?.evidence_ref !== "string"))
    || (result === "configured_pending_restart"
      && (registration?.status !== "matched" || discovery?.status !== "pending_restart"))
    || (result === "configured_unverified"
      && (registration?.status !== "matched" || discovery?.status === "discovered"))
    || (result === "not_configured" && !["absent", "invalid"].includes(registration?.status))
    || (result === "disabled" && registration?.status !== "absent");
  if (!["status", "enable", "disable"].includes(action) || !mcpCapabilityProfileContract.surfaces.includes(surface)
      || !["project", "user"].includes(scope) || !SETS.result.has(result) || !SETS.capability.has(capability)
      || !SETS.registration.has(registration?.status) || !SETS.discovery.has(discovery?.status)
      || !runtime || typeof runtime !== "object" || !Array.isArray(changes) || !Array.isArray(diagnostics)
      || diagnostics.some((item) => !item || typeof item.code !== "string") || invalidCombination) {
    throw new Error("AGDF_MCP_LIFECYCLE_RESULT_INVALID");
  }
  return Object.freeze({
    schema_version: 2,
    contract_version: 2,
    operation: `mcp.${action}`,
    result,
    capability,
    surface,
    scope,
    effective_scope: effectiveScope(registration),
    native_scope: registration.native_scope ?? scope,
    scope_effect: scopeEffect,
    target,
    authorizes: false,
    host: host ? Object.freeze({ ...host }) : null,
    permission_effect: coded(permissionEffect, "inherited_host_user"),
    runtime: Object.freeze({ ...runtime }),
    registration: Object.freeze({ ...registration,
      checked_sources: freezeArray(registration.checked_sources ?? registration.sources),
    }),
    discovery: Object.freeze({ source: "none", evidence_ref: null, ...discovery }),
    changes: freezeArray(changes),
    fallback: coded(fallback, "version_matched_cli_dispatch"),
    next_action: coded(nextAction, "none"),
    diagnostics: freezeArray(diagnostics),
  });
}

export const mcpLifecycleResultStates = SETS;
