import { existsSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  allSourceResult,
  atomicWrite,
  fileSnapshot,
  inheritedPermissionEffect,
  readJsonObject,
  referenceIdentityForSurface,
  restoreSnapshot,
} from "./file-utils.js";

const OWNER = "create-agdf:mcp-runtime";
const CREATED_CONFIG = "AGDF_MCP_CREATED_CONFIG";
const SCHEMA = "https://opencode.ai/config.json";

function readConfig(path) {
  const value = readJsonObject(path, "AGDF_MCP_OPENCODE_CONFIG_INVALID");
  if (value.config.mcp !== undefined && (!value.config.mcp || typeof value.config.mcp !== "object" || Array.isArray(value.config.mcp))) {
    throw new Error("AGDF_MCP_OPENCODE_CONFIG_INVALID");
  }
  if (value.config.mcp?.servers !== undefined && (!value.config.mcp.servers || typeof value.config.mcp.servers !== "object" || Array.isArray(value.config.mcp.servers))) {
    throw new Error("AGDF_MCP_OPENCODE_CONFIG_INVALID");
  }
  return value;
}

function entry(spec, { createdConfig = false } = {}) {
  const value = { type: "local", command: [spec.command, ...spec.args],
    ...(spec.scope === "project" ? { cwd: spec.target } : {}),
    environment: { AGDF_MCP_OWNER: OWNER, AGDF_MCP_VERSION: spec.version, AGDF_MCP_DIGEST: spec.digest,
      ...(createdConfig ? { [CREATED_CONFIG]: "true" } : {}) } };
  return spec.host?.config_variant === "nested_v2" ? { ...value, disabled: false } : { ...value, enabled: true };
}

function inspectConfig(config, path, expected) {
  const nested = config.mcp?.servers;
  const expectedNested = expected.host?.config_variant === "nested_v2";
  const alternate = expectedNested ? config.mcp?.agdf : nested?.agdf;
  if (alternate !== undefined) {
    const owned = alternate?.environment?.AGDF_MCP_OWNER === OWNER;
    const command = Array.isArray(alternate?.command) && alternate.command.every((item) => typeof item === "string") ? alternate.command : null;
    return { status: owned ? "owned_mismatch" : "foreign", path,
      identity: owned ? { version: alternate.environment.AGDF_MCP_VERSION, digest: alternate.environment.AGDF_MCP_DIGEST } : null,
      created_config: alternate?.environment?.[CREATED_CONFIG] === "true",
      observed: command ? { command: command[0], args: command.slice(1) } : null };
  }
  const observedEntry = expectedNested ? nested?.agdf : config.mcp?.agdf;
  if (observedEntry === undefined) return { status: "absent", path, identity: null };
  const owned = observedEntry?.environment?.AGDF_MCP_OWNER === OWNER;
  if (!owned) return { status: "foreign", path, identity: null };
  const created = observedEntry.environment?.[CREATED_CONFIG] === "true";
  const matched = [undefined, "true"].includes(observedEntry.environment?.[CREATED_CONFIG])
    && JSON.stringify(observedEntry) === JSON.stringify(entry(expected, { createdConfig: created }));
  const command = Array.isArray(observedEntry.command) && observedEntry.command.every((item) => typeof item === "string") ? observedEntry.command : null;
  return { status: matched ? "matched" : "owned_mismatch", path,
    identity: { version: observedEntry.environment.AGDF_MCP_VERSION, digest: observedEntry.environment.AGDF_MCP_DIGEST },
    created_config: created, observed: command ? { command: command[0], args: command.slice(1) } : null };
}

function inspectPath(path, expected) {
  return inspectConfig(readConfig(path).config, path, expected);
}

function sources({ scope, target, env }) {
  return [
    ...(typeof env.OPENCODE_CONFIG_CONTENT === "string" && env.OPENCODE_CONFIG_CONTENT.trim()
      ? [{ id: "inline", path: "env:OPENCODE_CONFIG_CONTENT", priority: 0, selected: false, inline: env.OPENCODE_CONFIG_CONTENT }] : []),
    ...(typeof env.OPENCODE_CONFIG === "string" && env.OPENCODE_CONFIG.trim()
      ? [{ id: "custom", path: env.OPENCODE_CONFIG, priority: 5, selected: false }] : []),
    { id: "project", path: join(target, "opencode.json"), priority: 10, selected: scope === "project" },
    { id: "user", path: join(env.OPENCODE_CONFIG_DIR || join(homedir(), ".config", "opencode"), "opencode.json"), priority: 20, selected: scope === "user" },
  ];
}

function inspect(input) {
  const list = sources(input);
  const selected = list.find((source) => source.selected);
  const states = new Map(list.map((source) => {
    if (!source.inline) return [source.id, inspectPath(source.path, input.spec)];
    try {
      const config = JSON.parse(source.inline);
      if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error("invalid");
      return [source.id, inspectConfig(config, source.path, input.spec)];
    } catch { return [source.id, { status: "invalid", path: source.path, identity: null }]; }
  }));
  return { ...allSourceResult({ sources: list, inspected: states, selectedSource: selected }), native_scope: input.scope };
}

function transaction({ action, scope, target, spec, previousSpec, env }) {
  const current = inspect({ scope, target, spec, env });
  if (current.status === "precedence_conflict") throw new Error("AGDF_MCP_REGISTRATION_PRECEDENCE_CONFLICT");
  if (current.selected_status === "foreign" && !previousSpec) throw new Error("AGDF_MCP_REGISTRATION_FOREIGN");
  if ((action === "enable" && current.selected_status === "matched") || (action === "disable" && current.selected_status === "absent")) {
    return { status: "unchanged", path: current.path, apply() {}, rollback() {} };
  }
  const snapshot = fileSnapshot(current.path);
  const { config } = readConfig(current.path);
  const mcp = { ...(config.mcp ?? {}) };
  const nested = spec.host?.config_variant === "nested_v2";
  const createdConfig = !snapshot.existed || current.created_config === true;
  if (nested) {
    if (previousSpec) delete mcp.agdf;
    const servers = { ...(mcp.servers ?? {}) };
    if (action === "enable") servers.agdf = entry(spec, { createdConfig }); else delete servers.agdf;
    if (Object.keys(servers).length) mcp.servers = servers; else delete mcp.servers;
  } else {
    if (previousSpec && mcp.servers && typeof mcp.servers === "object" && !Array.isArray(mcp.servers)) {
      const servers = { ...mcp.servers }; delete servers.agdf;
      if (Object.keys(servers).length) mcp.servers = servers; else delete mcp.servers;
    }
    if (action === "enable") mcp.agdf = entry(spec, { createdConfig }); else delete mcp.agdf;
  }
  const next = { ...config };
  if (Object.keys(mcp).length) next.mcp = mcp; else delete next.mcp;
  const remaining = Object.keys(next);
  const removable = current.created_config === true
    && (remaining.length === 0 || (remaining.length === 1 && remaining[0] === "$schema" && next.$schema === SCHEMA));
  const after = action === "disable" && removable ? null : `${JSON.stringify(next, null, 2)}\n`;
  return { status: "changed", path: current.path,
    apply() { if (after === null) rmSync(current.path, { force: true }); else atomicWrite(current.path, after); },
    rollback() { restoreSnapshot(snapshot); },
  };
}

function probe({ exec, target }) {
  try {
    const output = String(exec("opencode", ["--version"], { cwd: target, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })).trim();
    const version = output.match(/\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/)?.[0];
    const major = Number.parseInt(version?.split(".")[0], 10);
    if (!version || ![1, 2].includes(major)) return Object.freeze({ status: "unsupported", version: version ?? null, config_variant: null });
    return Object.freeze({ status: "detected", version, client_variant: "cli",
      config_variant: major >= 2 ? "nested_v2" : "flat_v1" });
  } catch { return Object.freeze({ status: "unavailable", version: null, client_variant: "cli", config_variant: null }); }
}

export const opencodeAdapter = Object.freeze({
  surface: "opencode",
  nativeScope: (scope) => scope,
  probeHost: probe,
  resolveSources: sources,
  inspect,
  createTransaction: transaction,
  referenceIdentity: (input) => referenceIdentityForSurface("opencode", (scope) => scope, input),
  permissionEffect: inheritedPermissionEffect,
});
export const opencodeAdapterConstants = Object.freeze({ owner: OWNER, createdConfig: CREATED_CONFIG });
