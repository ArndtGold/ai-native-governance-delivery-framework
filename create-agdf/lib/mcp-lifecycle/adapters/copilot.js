import { rmSync } from "node:fs";
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

function entry(spec) {
  return { type: "local", command: spec.command, args: [...spec.args],
    env: { AGDF_MCP_OWNER: OWNER, AGDF_MCP_VERSION: spec.version, AGDF_MCP_DIGEST: spec.digest },
    tools: ["agdf_dispatch"] };
}

function inspectPath(path, expected) {
  const { config } = readJsonObject(path, "AGDF_MCP_COPILOT_CONFIG_INVALID");
  if (config.mcpServers !== undefined && (!config.mcpServers || typeof config.mcpServers !== "object" || Array.isArray(config.mcpServers))) {
    throw new Error("AGDF_MCP_COPILOT_CONFIG_INVALID");
  }
  const observedEntry = config.mcpServers?.agdf;
  if (observedEntry === undefined) return { status: "absent", path, identity: null };
  const owned = observedEntry?.env?.AGDF_MCP_OWNER === OWNER;
  if (!owned) return { status: "foreign", path, identity: null };
  const observed = typeof observedEntry.command === "string" && Array.isArray(observedEntry.args)
    && observedEntry.args.every((item) => typeof item === "string")
    ? { command: observedEntry.command, args: observedEntry.args } : null;
  const matched = JSON.stringify(observedEntry) === JSON.stringify(entry(expected));
  return { status: matched ? "matched" : "owned_mismatch", path,
    identity: { version: observedEntry.env.AGDF_MCP_VERSION, digest: observedEntry.env.AGDF_MCP_DIGEST }, observed };
}

function sources({ scope, target, env }) {
  return [
    { id: "project_override", path: join(target, ".mcp.json"), priority: 0, selected: false },
    { id: "project", path: join(target, ".github", "mcp.json"), priority: 10, selected: scope === "project" },
    { id: "user", path: join(env.COPILOT_HOME || join(homedir(), ".copilot"), "mcp-config.json"), priority: 20, selected: scope === "user" },
  ];
}

function supplementalReadback({ exec, target }) {
  try {
    const parsed = JSON.parse(String(exec("copilot", ["mcp", "get", "agdf", "--json"], {
      cwd: target, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    })));
    return Object.freeze({ status: "observed", entry_present: Boolean(parsed) });
  } catch { return Object.freeze({ status: "unavailable", entry_present: false }); }
}

function inspect(input) {
  const list = sources(input);
  const selected = list.find((source) => source.selected);
  const states = new Map(list.map((source) => [source.id, inspectPath(source.path, input.spec)]));
  return { ...allSourceResult({ sources: list, inspected: states, selectedSource: selected }),
    native_scope: input.scope, native_readback: supplementalReadback(input) };
}

function transaction({ action, scope, target, spec, previousSpec, env }) {
  const current = inspect({ scope, target, spec, env });
  if (current.status === "precedence_conflict") throw new Error("AGDF_MCP_REGISTRATION_PRECEDENCE_CONFLICT");
  if (["foreign", "invalid"].includes(current.selected_status) && !previousSpec) throw new Error("AGDF_MCP_REGISTRATION_FOREIGN");
  if ((action === "enable" && current.selected_status === "matched") || (action === "disable" && current.selected_status === "absent")) {
    return { status: "unchanged", path: current.path, createdConfig: false, apply() {}, rollback() {} };
  }
  const snapshot = fileSnapshot(current.path);
  const { config } = readJsonObject(current.path, "AGDF_MCP_COPILOT_CONFIG_INVALID");
  const servers = { ...(config.mcpServers ?? {}) };
  if (action === "enable") servers.agdf = entry(spec); else delete servers.agdf;
  const next = { ...config };
  if (Object.keys(servers).length) next.mcpServers = servers; else delete next.mcpServers;
  const createdByAgdf = spec.reference?.created_config === true;
  const after = action === "disable" && createdByAgdf && Object.keys(next).length === 0
    ? null : `${JSON.stringify(next, null, 2)}\n`;
  return { status: "changed", path: current.path, createdConfig: action === "enable" && !snapshot.existed,
    apply() { if (after === null) rmSync(current.path, { force: true }); else atomicWrite(current.path, after); },
    rollback() { restoreSnapshot(snapshot, { removeEmptyParent: true }); },
  };
}

function probe({ exec, target }) {
  try {
    const output = String(exec("copilot", ["--version"], { cwd: target, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })).trim();
    const version = output.match(/\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/)?.[0];
    return Object.freeze({ status: version ? "detected" : "unsupported", version: version ?? null,
      client_variant: "cli", config_variant: "json" });
  } catch { return Object.freeze({ status: "unverified", version: null,
    client_variant: "unobserved_client", config_variant: "json" }); }
}

export const copilotAdapter = Object.freeze({
  surface: "copilot",
  nativeScope: (scope) => scope,
  probeHost: probe,
  resolveSources: sources,
  inspect,
  createTransaction: transaction,
  referenceIdentity: (input) => referenceIdentityForSurface("copilot", (scope) => scope, input),
  permissionEffect: inheritedPermissionEffect,
});
export const copilotAdapterConstants = Object.freeze({ owner: OWNER });
