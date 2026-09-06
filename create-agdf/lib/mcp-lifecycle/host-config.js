import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import process from "node:process";
import { renameSyncWithRetry } from "../fs-swap.js";

const CODEX_MARKER = "# AGDF-OWNED-MCP:";
const OPENCODE_OWNER = "create-agdf:mcp-runtime";
const OPENCODE_CREATED_CONFIG = "AGDF_MCP_CREATED_CONFIG";
const OPENCODE_SCHEMA = "https://opencode.ai/config.json";

function exactJson(value) {
  return JSON.stringify(value);
}

function atomicWrite(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = join(dirname(path), `.${Date.now()}-${process.pid}-agdf-mcp.tmp`);
  writeFileSync(temporary, content, "utf8");
  try {
    renameSyncWithRetry(temporary, path);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
}

function configPath({ surface, scope, target, env }) {
  if (surface === "codex") {
    return scope === "project"
      ? join(target, ".codex", "config.toml")
      : join(env.CODEX_HOME || join(homedir(), ".codex"), "config.toml");
  }
  if (surface === "opencode") {
    return scope === "project"
      ? join(target, "opencode.json")
      : join(env.OPENCODE_CONFIG_DIR || join(homedir(), ".config", "opencode"), "opencode.json");
  }
  return null;
}

export function createMcpRegistrationSpec({ surface, target, runtime, execPath, host = null }) {
  if (!isAbsolute(target) || !isAbsolute(execPath) || !isAbsolute(runtime.entrypoint)) {
    throw new Error("AGDF_MCP_REGISTRATION_PATH_INVALID");
  }
  return Object.freeze({
    surface,
    target: resolve(target),
    command: execPath,
    args: Object.freeze([runtime.entrypoint, "--surface", surface]),
    version: runtime.version,
    digest: runtime.digest,
    host,
  });
}

function codexSection(spec, { createdConfig = false, createdDirectory = false } = {}) {
  const identity = exactJson({
    owner: OPENCODE_OWNER,
    version: spec.version,
    digest: spec.digest,
    ...(createdConfig ? { created_config: true } : {}),
    ...(createdDirectory ? { created_directory: true } : {}),
  });
  return `${CODEX_MARKER} ${identity}\n[mcp_servers.agdf]\ncommand = ${exactJson(spec.command)}\nargs = ${exactJson(spec.args)}\n`;
}

function codexSectionRange(content) {
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
  if (headers.length > 1 || unsupported) {
    throw new Error("AGDF_MCP_CODEX_CONFIG_INVALID");
  }
  const [header] = headers;
  if (!header) return null;
  const sectionStart = header.index;
  const next = /^\[[^\n]+\]\s*$/gm;
  next.lastIndex = sectionStart + header[0].length;
  const nextHeader = next.exec(content);
  let start = sectionStart;
  const before = content.slice(0, sectionStart);
  const marker = before.match(/(?:^|\n)(# AGDF-OWNED-MCP: [^\n]+)\n$/);
  if (marker) start = sectionStart - marker[0].length + (marker[0].startsWith("\n") ? 1 : 0);
  return { start, sectionStart, end: nextHeader?.index ?? content.length, marker: marker?.[1] ?? null };
}

function parseCodexMarker(marker) {
  if (!marker?.startsWith(`${CODEX_MARKER} `)) return null;
  try {
    const value = JSON.parse(marker.slice(CODEX_MARKER.length + 1));
    return value?.owner === OPENCODE_OWNER ? value : null;
  } catch {
    return null;
  }
}

function inspectCodex(path, expected) {
  if (!existsSync(path)) return { status: "absent", path, identity: null };
  const content = readFileSync(path, "utf8");
  const range = codexSectionRange(content);
  if (!range) return { status: "absent", path, identity: null };
  const identity = parseCodexMarker(range.marker);
  if (!identity) return { status: "foreign", path, identity: null };
  const section = content.slice(range.sectionStart, range.end);
  const commandMatch = /^command\s*=\s*("(?:[^"\\]|\\.)*")\s*$/m.exec(section);
  const argsMatch = /^args\s*=\s*(\[[^\n]*\])\s*$/m.exec(section);
  let observed = null;
  try {
    const command = commandMatch ? JSON.parse(commandMatch[1]) : null;
    const args = argsMatch ? JSON.parse(argsMatch[1]) : null;
    if (typeof command === "string" && Array.isArray(args) && args.every((item) => typeof item === "string")) {
      observed = { command, args };
    }
  } catch {}
  const expectedSection = codexSection(expected).slice(codexSection(expected).indexOf("\n") + 1);
  const matched = section.trim() === expectedSection.trim()
    && identity.version === expected.version
    && identity.digest === expected.digest;
  return {
    status: matched ? "matched" : "owned_mismatch",
    path,
    identity,
    created_config: identity.created_config === true,
    created_directory: identity.created_directory === true,
    observed,
  };
}

function readOpenCode(path) {
  if (!existsSync(path)) return { content: "", config: {} };
  const content = readFileSync(path, "utf8");
  let config;
  try { config = JSON.parse(content); } catch { throw new Error("AGDF_MCP_OPENCODE_CONFIG_INVALID"); }
  if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error("AGDF_MCP_OPENCODE_CONFIG_INVALID");
  if (config.mcp !== undefined && (!config.mcp || typeof config.mcp !== "object" || Array.isArray(config.mcp))) {
    throw new Error("AGDF_MCP_OPENCODE_CONFIG_INVALID");
  }
  return { content, config };
}

function openCodeEntry(spec, { createdConfig = false } = {}) {
  const entry = {
    type: "local",
    command: [spec.command, ...spec.args],
    cwd: spec.target,
    environment: {
      AGDF_MCP_OWNER: OPENCODE_OWNER,
      AGDF_MCP_VERSION: spec.version,
      AGDF_MCP_DIGEST: spec.digest,
      ...(createdConfig ? { [OPENCODE_CREATED_CONFIG]: "true" } : {}),
    },
  };
  return spec.host?.config_variant === "nested_v2"
    ? { ...entry, disabled: false }
    : { ...entry, enabled: true };
}

function inspectOpenCode(path, expected) {
  const { config } = readOpenCode(path);
  const nested = config.mcp?.servers;
  if (nested !== undefined && (!nested || typeof nested !== "object" || Array.isArray(nested))) {
    throw new Error("AGDF_MCP_OPENCODE_CONFIG_INVALID");
  }
  const expectedNested = expected.host?.config_variant === "nested_v2";
  const alternate = expectedNested ? config.mcp?.agdf : nested?.agdf;
  if (alternate !== undefined) {
    const owned = alternate?.environment?.AGDF_MCP_OWNER === OPENCODE_OWNER;
    const createdConfig = alternate?.environment?.[OPENCODE_CREATED_CONFIG] === "true";
    const command = Array.isArray(alternate?.command) && alternate.command.every((item) => typeof item === "string")
      ? alternate.command
      : null;
    return {
      status: owned ? "owned_variant_mismatch" : "foreign",
      path,
      identity: owned ? {
        version: alternate.environment.AGDF_MCP_VERSION,
        digest: alternate.environment.AGDF_MCP_DIGEST,
      } : null,
      created_config: createdConfig,
      observed: command ? { command: command[0], args: command.slice(1) } : null,
    };
  }
  const entry = expectedNested ? nested?.agdf : config.mcp?.agdf;
  if (entry === undefined) return { status: "absent", path, identity: null };
  const owned = entry?.environment?.AGDF_MCP_OWNER === OPENCODE_OWNER;
  if (!owned) return { status: "foreign", path, identity: null };
  const createdConfigValue = entry?.environment?.[OPENCODE_CREATED_CONFIG];
  const createdConfig = createdConfigValue === "true";
  const matched = [undefined, "true"].includes(createdConfigValue)
    && JSON.stringify(entry) === JSON.stringify(openCodeEntry(expected, { createdConfig }));
  const command = Array.isArray(entry?.command) && entry.command.every((item) => typeof item === "string")
    ? entry.command
    : null;
  return {
    status: matched ? "matched" : "owned_mismatch",
    path,
    identity: { version: entry.environment.AGDF_MCP_VERSION, digest: entry.environment.AGDF_MCP_DIGEST },
    created_config: createdConfig,
    observed: command ? { command: command[0], args: command.slice(1) } : null,
  };
}

function claudeArgs(action, scope, spec) {
  const nativeScope = scope === "project" ? "local" : "user";
  if (action === "enable") {
    return ["mcp", "add", "--transport", "stdio", "--scope", nativeScope, "agdf", "--", spec.command, ...spec.args];
  }
  return ["mcp", "remove", "--scope", nativeScope, "agdf"];
}

function inspectClaude({ scope, target, expected, exec }) {
  try {
    const output = String(exec("claude", ["mcp", "get", "agdf"], { cwd: target, encoding: "utf8", stdio: "pipe" }));
    const fields = new Map(output.split("\n").map((line) => {
      const match = /^\s*([^:]+):\s*(.*)$/u.exec(line);
      return match ? [match[1], match[2]] : ["", ""];
    }).filter(([name]) => name));
    const scopePrefix = scope === "project" ? "Local config" : "User config";
    const argsText = fields.get("Args") ?? "";
    const argsSuffix = " --surface claude";
    const scopeMatched = fields.get("Scope")?.startsWith(scopePrefix);
    const observed = scopeMatched && fields.get("Type") === "stdio" && argsText.endsWith(argsSuffix)
      ? { command: fields.get("Command"), args: [argsText.slice(0, -argsSuffix.length), "--surface", "claude"] }
      : null;
    const matched = scopeMatched
      && fields.get("Type") === "stdio"
      && fields.get("Command") === expected.command
      && fields.get("Args") === expected.args.join(" ");
    return { status: matched ? "matched" : "foreign", path: `claude:${scope}:agdf`, identity: null, observed };
  } catch (error) {
    const output = `${String(error?.stdout ?? "")}\n${String(error?.stderr ?? "")}`;
    if (error?.status === 1 && output.includes('No MCP server named "agdf"')) {
      return { status: "absent", path: `claude:${scope}:agdf`, identity: null };
    }
    throw new Error("AGDF_MCP_CLAUDE_INSPECTION_FAILED");
  }
}

export function inspectMcpRegistration({ surface, scope, target, spec, env = {}, exec = execFileSync } = {}) {
  if (surface === "claude") return inspectClaude({ scope, target, expected: spec, exec });
  const path = configPath({ surface, scope, target, env });
  if (surface === "codex") return inspectCodex(path, spec);
  if (surface === "opencode") return inspectOpenCode(path, spec);
  throw new Error("AGDF_MCP_SURFACE_UNSUPPORTED");
}

function fileTransaction({ action, surface, scope, target, spec, env, inspect, previousSpec }) {
  const path = configPath({ surface, scope, target, env });
  const parentPath = dirname(path);
  const beforeParentExists = existsSync(parentPath);
  const beforeExists = existsSync(path);
  const before = beforeExists ? readFileSync(path, "utf8") : "";
  const current = inspect();
  if (["foreign", "owned_variant_mismatch"].includes(current.status) && !previousSpec) {
    throw new Error("AGDF_MCP_REGISTRATION_FOREIGN");
  }
  if (action === "enable" && current.status === "matched") {
    return { status: "unchanged", path, apply() {}, rollback() {} };
  }
  if (action === "disable" && current.status === "absent") {
    return { status: "unchanged", path, apply() {}, rollback() {} };
  }

  let after;
  if (surface === "codex") {
    const range = codexSectionRange(before);
    if (action === "enable") {
      const section = codexSection(spec, {
        createdConfig: !beforeExists || current.created_config === true,
        createdDirectory: !beforeParentExists || current.created_directory === true,
      });
      after = range
        ? `${before.slice(0, range.start).replace(/\s*$/u, "")}${before.slice(0, range.start).trim() ? "\n\n" : ""}${section}${before.slice(range.end).replace(/^\s*/u, "")}`
        : `${before.replace(/\s*$/u, "")}${before.trim() ? "\n\n" : ""}${section}`;
    } else {
      if (!range?.marker) throw new Error("AGDF_MCP_REGISTRATION_FOREIGN");
      after = `${before.slice(0, range.start).replace(/\s*$/u, "")}${before.slice(range.end).trim() ? "\n\n" : ""}${before.slice(range.end).replace(/^\s*/u, "")}`;
      if (current.created_config === true && !after.trim()) after = null;
    }
  } else {
    const { config } = readOpenCode(path);
    const mcp = { ...(config.mcp ?? {}) };
    const nested = spec.host?.config_variant === "nested_v2";
    const createdConfig = !beforeExists || current.created_config === true;
    if (nested) {
      if (previousSpec) delete mcp.agdf;
      const servers = { ...(mcp.servers ?? {}) };
      if (action === "enable") servers.agdf = openCodeEntry(spec, { createdConfig });
      else delete servers.agdf;
      if (Object.keys(servers).length) mcp.servers = servers;
      else delete mcp.servers;
    } else {
      if (previousSpec && mcp.servers && typeof mcp.servers === "object" && !Array.isArray(mcp.servers)) {
        const servers = { ...mcp.servers };
        delete servers.agdf;
        if (Object.keys(servers).length) mcp.servers = servers;
        else delete mcp.servers;
      }
      if (action === "enable") mcp.agdf = openCodeEntry(spec, { createdConfig });
      else delete mcp.agdf;
    }
    const next = { ...config };
    if (Object.keys(mcp).length) next.mcp = mcp;
    else delete next.mcp;
    const remainingKeys = Object.keys(next);
    const removableGeneratedShell = current.created_config === true
      && (remainingKeys.length === 0
        || (remainingKeys.length === 1 && remainingKeys[0] === "$schema" && next.$schema === OPENCODE_SCHEMA));
    after = action === "disable" && removableGeneratedShell
      ? null
      : `${JSON.stringify(next, null, 2)}\n`;
  }

  return {
    status: "changed",
    path,
    apply() {
      if (after === null) {
        rmSync(path, { force: true });
        if (surface === "codex" && current.created_directory === true) {
          try { rmdirSync(parentPath); } catch (error) {
            if (!["ENOTEMPTY", "EEXIST"].includes(error?.code)) throw error;
          }
        }
      } else atomicWrite(path, after);
    },
    rollback() {
      if (beforeExists) atomicWrite(path, before);
      else {
        rmSync(path, { force: true });
        if (surface === "codex" && !beforeParentExists) {
          try { rmdirSync(parentPath); } catch (error) {
            if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error?.code)) throw error;
          }
        }
      }
    },
  };
}

function claudeTransaction({ action, scope, target, spec, exec, inspect, previousSpec }) {
  const current = inspect();
  if (current.status === "foreign" && !previousSpec) throw new Error("AGDF_MCP_REGISTRATION_FOREIGN");
  if ((action === "enable" && current.status === "matched") || (action === "disable" && current.status === "absent")) {
    return { status: "unchanged", path: current.path, apply() {}, rollback() {} };
  }
  let applied = false;
  const nativeScope = scope === "project" ? "local" : "user";
  const remove = () => exec("claude", ["mcp", "remove", "--scope", nativeScope, "agdf"], {
    cwd: target, encoding: "utf8", stdio: "pipe",
  });
  const add = (registrationSpec) => exec("claude", claudeArgs("enable", scope, registrationSpec), {
    cwd: target, encoding: "utf8", stdio: "pipe",
  });
  return {
    status: "changed",
    path: current.path,
    apply() {
      if (action === "enable" && previousSpec) {
        remove();
        try { add(spec); } catch (error) {
          try { add(previousSpec); } catch {}
          throw error;
        }
      } else {
        exec("claude", claudeArgs(action, scope, spec), { cwd: target, encoding: "utf8", stdio: "pipe" });
      }
      applied = true;
    },
    rollback() {
      if (!applied) return;
      if (action === "enable" && previousSpec) {
        try { remove(); } catch {}
        try { add(previousSpec); } catch {}
        applied = false;
        return;
      }
      const inverse = action === "enable" ? "disable" : "enable";
      try { exec("claude", claudeArgs(inverse, scope, spec), { cwd: target, encoding: "utf8", stdio: "pipe" }); } catch {}
      applied = false;
    },
  };
}

export function createMcpRegistrationTransaction({
  action, surface, scope, target, spec, previousSpec = null, env = {}, exec = execFileSync,
} = {}) {
  const inspect = () => inspectMcpRegistration({ surface, scope, target, spec, env, exec });
  if (surface === "claude") return claudeTransaction({ action, scope, target, spec, exec, inspect, previousSpec });
  return fileTransaction({ action, surface, scope, target, spec, env, inspect, previousSpec });
}

export const mcpHostConfigConstants = Object.freeze({
  codexMarker: CODEX_MARKER,
  openCodeOwner: OPENCODE_OWNER,
  openCodeCreatedConfig: OPENCODE_CREATED_CONFIG,
});
