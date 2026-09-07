import { execFileSync } from "node:child_process";
import { isAbsolute, resolve } from "node:path";
import { resolveMcpHostAdapter, validateMcpResolvedSources } from "./adapter-contract.js";
import { codexAdapterConstants } from "./adapters/codex.js";
import { copilotAdapterConstants } from "./adapters/copilot.js";
import { opencodeAdapterConstants } from "./adapters/opencode.js";

export function createMcpRegistrationSpec({ surface, scope = "project", target, runtime, execPath, host = null }) {
  if (!isAbsolute(target) || !isAbsolute(execPath) || !isAbsolute(runtime.entrypoint)) {
    throw new Error("AGDF_MCP_REGISTRATION_PATH_INVALID");
  }
  const adapter = resolveMcpHostAdapter(surface);
  const reference = runtime.references?.find((item) => item.surface === surface
    && item.native_scope === adapter.nativeScope(scope)
    && (scope === "user" || item.target === resolve(target))) ?? null;
  return Object.freeze({ surface, scope, target: resolve(target), command: execPath,
    args: Object.freeze([runtime.entrypoint, "--surface", surface]), version: runtime.version,
    digest: runtime.digest, host, reference });
}

export function inspectMcpRegistration({ surface, scope, target, spec, env = {}, exec = execFileSync } = {}) {
  return resolveMcpHostAdapter(surface).inspect({ scope, target, spec, env, exec });
}

export function createMcpRegistrationTransaction({
  action, surface, scope, target, spec, previousSpec = null, env = {}, exec = execFileSync,
} = {}) {
  return resolveMcpHostAdapter(surface).createTransaction({ action, scope, target, spec, previousSpec, env, exec });
}

export function inspectMcpHost({ surface, target, exec = execFileSync } = {}) {
  return resolveMcpHostAdapter(surface).probeHost({ target, exec });
}

export function resolveMcpSources({ surface, scope, target, env = {} } = {}) {
  const sources = resolveMcpHostAdapter(surface).resolveSources({ scope, target, env });
  const validation = validateMcpResolvedSources(sources);
  if (!validation.valid) throw new Error(`AGDF_MCP_ADAPTER_SOURCES_INVALID:${validation.errors.join(",")}`);
  return sources;
}

export function createMcpReferenceIdentity({ surface, scope, target, registration, createdConfig = false } = {}) {
  return resolveMcpHostAdapter(surface).referenceIdentity({ scope, target, registration, createdConfig });
}

export function mcpPermissionEffect(surface, input = {}) {
  return resolveMcpHostAdapter(surface).permissionEffect(input);
}

export function mcpNativeScope(surface, scope) {
  return resolveMcpHostAdapter(surface).nativeScope(scope);
}

export const mcpHostConfigConstants = Object.freeze({
  codexMarker: codexAdapterConstants.marker,
  openCodeOwner: opencodeAdapterConstants.owner,
  openCodeCreatedConfig: opencodeAdapterConstants.createdConfig,
  copilotOwner: copilotAdapterConstants.owner,
});
