import { existsSync, readFileSync, rmSync, rmdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import {
  allSourceResult,
  atomicWrite,
  fileSnapshot,
  inheritedPermissionEffect,
  referenceIdentityForSurface,
  restoreSnapshot,
} from "./file-utils.js";

const MARKER = "# AGDF-OWNED-MCP:";
const OWNER = "create-agdf:mcp-runtime";

function exactJson(value) { return JSON.stringify(value); }

function section(spec, { createdConfig = false, createdDirectory = false } = {}) {
  const identity = exactJson({ owner: OWNER, version: spec.version, digest: spec.digest,
    ...(createdConfig ? { created_config: true } : {}), ...(createdDirectory ? { created_directory: true } : {}) });
  return `${MARKER} ${identity}\n[mcp_servers.agdf]\ncommand = ${exactJson(spec.command)}\nargs = ${exactJson(spec.args)}\n`;
}

function sectionRange(content) {
  const headers = [...content.matchAll(/^\[mcp_servers\.agdf\]\s*$/gm)];
  const unsupported = content.split("\n").some((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return false;
    if (trimmed.startsWith("[")) {
      const normalized = trimmed.replace(/[\s"']/gu, "");
      if (normalized === "[mcp_servers]") return true;
      return (normalized.startsWith("[mcp_servers.agdf") || normalized.startsWith("[[mcp_servers.agdf"))
        && trimmed !== "[mcp_servers.agdf]";
    }
    const assignment = trimmed.match(/^([^=]+)=/u)?.[1]?.replace(/[\s"']/gu, "");
    return assignment === "mcp_servers" || assignment?.startsWith("mcp_servers.agdf") === true;
  });
  if (headers.length > 1 || unsupported) throw new Error("AGDF_MCP_CODEX_CONFIG_INVALID");
  const [header] = headers;
  if (!header) return null;
  const sectionStart = header.index;
  const next = /^\[[^\n]+\]\s*$/gm;
  next.lastIndex = sectionStart + header[0].length;
  const nextHeader = next.exec(content);
  let start = sectionStart;
  const marker = content.slice(0, sectionStart).match(/(?:^|\n)(# AGDF-OWNED-MCP: [^\n]+)\n$/);
  if (marker) start = sectionStart - marker[0].length + (marker[0].startsWith("\n") ? 1 : 0);
  return { start, sectionStart, end: nextHeader?.index ?? content.length, marker: marker?.[1] ?? null };
}

function identity(marker) {
  if (!marker?.startsWith(`${MARKER} `)) return null;
  try { const value = JSON.parse(marker.slice(MARKER.length + 1)); return value?.owner === OWNER ? value : null; } catch { return null; }
}

function inspectPath(path, expected) {
  if (!existsSync(path)) return { status: "absent", path, identity: null };
  const content = readFileSync(path, "utf8");
  const range = sectionRange(content);
  if (!range) return { status: "absent", path, identity: null };
  const owned = identity(range.marker);
  if (!owned) return { status: "foreign", path, identity: null };
  const body = content.slice(range.sectionStart, range.end);
  const commandMatch = /^command\s*=\s*("(?:[^"\\]|\\.)*")\s*$/m.exec(body);
  const argsMatch = /^args\s*=\s*(\[[^\n]*\])\s*$/m.exec(body);
  let observed = null;
  try {
    const command = commandMatch ? JSON.parse(commandMatch[1]) : null;
    const args = argsMatch ? JSON.parse(argsMatch[1]) : null;
    if (typeof command === "string" && Array.isArray(args) && args.every((item) => typeof item === "string")) observed = { command, args };
  } catch {}
  const expectedBody = section(expected).slice(section(expected).indexOf("\n") + 1);
  const matched = body.trim() === expectedBody.trim() && owned.version === expected.version && owned.digest === expected.digest;
  return { status: matched ? "matched" : "owned_mismatch", path, identity: owned,
    created_config: owned.created_config === true, created_directory: owned.created_directory === true, observed };
}

function sources({ scope, target, env }) {
  const project = { id: "project", path: join(target, ".codex", "config.toml"), priority: 10, selected: scope === "project" };
  const user = { id: "user", path: join(env.CODEX_HOME || join(homedir(), ".codex"), "config.toml"), priority: 20, selected: scope === "user" };
  return [project, user];
}

function inspect(input) {
  const list = sources(input);
  const selected = list.find((source) => source.selected);
  const states = new Map(list.map((source) => [source.id, inspectPath(source.path, input.spec)]));
  let nativeReadback;
  try {
    JSON.parse(String(input.exec("codex", ["mcp", "get", "agdf", "--json"], {
      cwd: input.target, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    })));
    nativeReadback = { status: "observed", entry_present: true };
  } catch { nativeReadback = { status: "unavailable", entry_present: false }; }
  return { ...allSourceResult({ sources: list, inspected: states, selectedSource: selected }),
    native_scope: input.scope, native_readback: Object.freeze(nativeReadback) };
}

function transaction({ action, scope, target, spec, previousSpec, env }) {
  const current = inspect({ scope, target, spec, env });
  if (current.status === "precedence_conflict") throw new Error("AGDF_MCP_REGISTRATION_PRECEDENCE_CONFLICT");
  if (current.selected_status === "foreign" && !previousSpec) throw new Error("AGDF_MCP_REGISTRATION_FOREIGN");
  const path = current.path;
  if ((action === "enable" && current.selected_status === "matched") || (action === "disable" && current.selected_status === "absent")) {
    return { status: "unchanged", path, apply() {}, rollback() {} };
  }
  const snapshot = fileSnapshot(path);
  const range = sectionRange(snapshot.content);
  let after;
  if (action === "enable") {
    const nextSection = section(spec, { createdConfig: !snapshot.existed || current.created_config === true,
      createdDirectory: !snapshot.parentExisted || current.created_directory === true });
    after = range
      ? `${snapshot.content.slice(0, range.start).replace(/\s*$/u, "")}${snapshot.content.slice(0, range.start).trim() ? "\n\n" : ""}${nextSection}${snapshot.content.slice(range.end).replace(/^\s*/u, "")}`
      : `${snapshot.content.replace(/\s*$/u, "")}${snapshot.content.trim() ? "\n\n" : ""}${nextSection}`;
  } else {
    if (!range?.marker) throw new Error("AGDF_MCP_REGISTRATION_FOREIGN");
    after = `${snapshot.content.slice(0, range.start).replace(/\s*$/u, "")}${snapshot.content.slice(range.end).trim() ? "\n\n" : ""}${snapshot.content.slice(range.end).replace(/^\s*/u, "")}`;
    if (current.created_config === true && !after.trim()) after = null;
  }
  return { status: "changed", path,
    apply() {
      if (after === null) {
        rmSync(path, { force: true });
        if (current.created_directory === true) try { rmdirSync(dirname(path)); } catch (error) { if (!["ENOTEMPTY", "EEXIST"].includes(error?.code)) throw error; }
      } else atomicWrite(path, after);
    },
    rollback() { restoreSnapshot(snapshot, { removeEmptyParent: true }); },
  };
}

export const codexAdapter = Object.freeze({
  surface: "codex",
  nativeScope: (scope) => scope,
  resolveSources: sources,
  inspect,
  createTransaction: transaction,
  referenceIdentity: (input) => referenceIdentityForSurface("codex", (scope) => scope, input),
  permissionEffect: inheritedPermissionEffect,
  probeHost({ exec, target }) {
    try {
      const output = String(exec("codex", ["--version"], { cwd: target, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })).trim();
      const version = output.match(/\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/)?.[0];
      return Object.freeze({ status: version ? "detected" : "unsupported", version: version ?? null,
        client_variant: "cli", config_variant: "toml" });
    } catch { return Object.freeze({ status: "unavailable", version: null, client_variant: "cli", config_variant: "toml" }); }
  },
});

export const codexAdapterConstants = Object.freeze({ marker: MARKER, owner: OWNER });
