function fixedCommand(command) {
  if (typeof command !== "string" || !command.trim() || /[\n\r;&|*?]/.test(command)) {
    throw new Error("AGDF_RUNTIME_CHECK_COMMAND_NOT_EXACT");
  }
  return command.trim();
}

export function codexRuntimeCheckEvidence({ capabilityIdentity, observedIdentity, hookEnabled, reviewRequired = false }) {
  if (hookEnabled && observedIdentity === capabilityIdentity) return { status: "enabled", capability_identity: capabilityIdentity, reason: "none" };
  if (observedIdentity && observedIdentity !== capabilityIdentity) return { status: "renewal_required", reason: "capability_identity_changed" };
  return { status: "decision_required", reason: reviewRequired ? "host_review_required" : "host_permission_unverified" };
}

export function claudePermissionRule({ platform, command }) {
  const exact = fixedCommand(command);
  return platform === "win32" ? `PowerShell(${exact})` : `Bash(${exact})`;
}

export function applyClaudeExactRule(settings, { rule, deny = [], ask = [] }) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) throw new Error("AGDF_CLAUDE_SETTINGS_INVALID");
  if ([...deny, ...ask].includes(rule)) return { status: "degraded", reason: "host_permission_conflict", settings };
  const next = structuredClone(settings);
  next.permissions ??= {};
  if (Array.isArray(next.permissions.allow) && next.permissions.allow.some((entry) => entry.includes("*") || entry !== entry.trim())) {
    throw new Error("AGDF_CLAUDE_BROAD_OR_MALFORMED_RULE");
  }
  next.permissions.allow = [...new Set([...(next.permissions.allow ?? []), rule])];
  return { status: "configured", reason: "none", settings: next };
}

export function revokeClaudeExactRule(settings, rule) {
  const next = structuredClone(settings);
  if (Array.isArray(next.permissions?.allow)) next.permissions.allow = next.permissions.allow.filter((entry) => entry !== rule);
  return next;
}

export function openCodeRuntimeCheckEvidence({ capabilityIdentity, observedIdentity, packageLoadable, hookObserved }) {
  if (!packageLoadable) return { status: "unavailable", reason: "unsupported_host_capability" };
  if (observedIdentity !== capabilityIdentity) return { status: "renewal_required", reason: "installed_identity_mismatch" };
  if (!hookObserved) return { status: "degraded", reason: "host_permission_unverified" };
  return { status: "enabled", capability_identity: capabilityIdentity, reason: "none" };
}
