import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  allSourceResult,
  atomicWrite,
  fileSnapshot,
  inheritedPermissionEffect,
  referenceIdentityForSurface,
  restoreSnapshot,
} from "./file-utils.js";

const OWNER = "create-agdf:mcp-runtime";
const CREATED_CONFIG = "AGDF_MCP_CREATED_CONFIG";
const SCHEMA = "https://opencode.ai/config.json";

// Preserve offsets: comments and trailing commas are syntax, never string data.
function jsonc(content) {
  const tokens = [], clean = content.split('');
  for (const match of content.matchAll(/"(?:\\[\s\S]|[^"\\])*"|\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|[{}\[\]:,]|[^\s{}\[\]:,/"']+|[^\s]/gu)) {
    const text = match[0], start = match.index, end = start + text.length;
    if (text.startsWith('//') || text.startsWith('/*')) {
      for (let i = start; i < end; ++i) if (!/[\r\n]/u.test(clean[i])) clean[i] = ' ';
    } else tokens.push({ text, start, end });
  }
  for (let i = 0; i < tokens.length - 1; ++i) {
    if (i > 0 && tokens[i].text === ',' && ['}', ']'].includes(tokens[i + 1].text)
      && !['{', '[', ':', ','].includes(tokens[i - 1].text)) clean[tokens[i].start] = ' ';
  }
  const sanitized = clean.join(''), config = JSON.parse(sanitized);
  let cursor = 0;
  function node() {
    const first = tokens[cursor++], properties = [];
    if (!['{', '['].includes(first.text)) return { ...first };
    const object = first.text === '{', close = object ? '}' : ']';
    while (tokens[cursor].text !== close) {
      const key = object ? tokens[cursor++] : null;
      if (object) ++cursor; // colon; JSON.parse already validated the grammar
      const value = node(), comma = tokens[cursor].text === ',' ? tokens[cursor++] : null;
      if (object) {
        const name = JSON.parse(key.text);
        if (properties.some(row => row.name === name)) throw Error('duplicate_key');
        properties.push({ name, start: key.start, value, comma });
      }
    }
    return { start: first.start, end: tokens[cursor++].end, ...(object ? { properties } : {}) };
  }
  return { config, tree: node(), preserveSyntax: sanitized !== content };
}

function editJsonc(content, path, value) {
  let { tree } = jsonc(content);
  for (let i = 0; i < path.length; ++i) {
    if (!tree.properties) throw Error('invalid_object');
    const index = tree.properties.findIndex(row => row.name === path[i]), property = tree.properties[index];
    if (property && i < path.length - 1) { tree = property.value; continue; }
    const edits = [];
    if (property) {
      if (value !== undefined) edits.push([property.value.start, property.value.end, JSON.stringify(value, null, 2)]);
      else {
        edits.push([property.start, property.comma?.end ?? property.value.end, '']);
        const previous = tree.properties[index - 1]?.comma;
        if (!property.comma && previous) edits.push([previous.start, previous.end, '']);
      }
    } else {
      if (value === undefined) return content;
      for (const key of path.slice(i + 1).reverse()) value = { [key]: value };
      const last = tree.properties.at(-1);
      if (last && !last.comma) edits.push([last.value.end, last.value.end, ',']);
      edits.push([tree.end - 1, tree.end - 1, `\n${'  '.repeat(i + 1)}${JSON.stringify(path[i])}: ${JSON.stringify(value, null, 2)}\n${'  '.repeat(i)}`]);
    }
    for (const [start, end, text] of edits.sort((a, b) => b[0] - a[0])) content = content.slice(0, start) + text + content.slice(end);
    return content;
  }
  throw Error('invalid_path');
}

function readConfig(path) {
  let value;
  try {
    const content = existsSync(path) ? readFileSync(path, 'utf8') : '{}';
    const parsed = jsonc(content);
    value = { content, config: parsed.config, preserveSyntax: path.endsWith('.jsonc') || parsed.preserveSyntax };
    if (!value.config || typeof value.config !== 'object' || Array.isArray(value.config)) throw Error('invalid');
  } catch { throw Error('AGDF_MCP_OPENCODE_CONFIG_INVALID'); }
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
  const user = env.OPENCODE_CONFIG_DIR || join(homedir(), '.config', 'opencode');
  const files = (id, directory, priority) => {
    const paths = ['opencode.jsonc', 'opencode.json'].map(name => join(directory, name)).filter(existsSync);
    if (!paths.length) paths.push(join(directory, 'opencode.json'));
    // JSONC wins conflicting keys. Otherwise update the file owning the entry,
    // rather than silently shadowing it by creating a second registration.
    const selected = paths.find(path => {
      const { config } = readConfig(path);
      return config.mcp?.agdf !== undefined || config.mcp?.servers?.agdf !== undefined;
    }) ?? paths[0];
    return paths.map((path, index) => ({ id: path === selected ? id : `${id}_${path.endsWith('.jsonc') ? 'jsonc' : 'json'}`,
      path, priority: priority + index, selected: scope === id && path === selected }));
  };
  return [
    ...(typeof env.OPENCODE_CONFIG_CONTENT === "string" && env.OPENCODE_CONFIG_CONTENT.trim()
      ? [{ id: "inline", path: "env:OPENCODE_CONFIG_CONTENT", priority: 0, selected: false, inline: env.OPENCODE_CONFIG_CONTENT }] : []),
    ...(typeof env.OPENCODE_CONFIG === "string" && env.OPENCODE_CONFIG.trim()
      ? [{ id: "custom", path: env.OPENCODE_CONFIG, priority: 5, selected: false }] : []),
    ...files('project', target, 10),
    ...files('user', user, 20),
  ];
}

function inspect(input) {
  const list = sources(input);
  const selected = list.find((source) => source.selected);
  const states = new Map(list.map((source) => {
    if (!source.inline) return [source.id, inspectPath(source.path, input.spec)];
    try {
      const config = jsonc(source.inline).config;
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
  const { config, content, preserveSyntax } = readConfig(current.path);
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
  let after = `${JSON.stringify(next, null, 2)}\n`;
  if (snapshot.existed && preserveSyntax) {
    after = content;
    for (const keys of [['mcp', 'agdf'], ['mcp', 'servers', 'agdf'], ['mcp', 'servers'], ['mcp']]) {
      const beforeValue = keys.reduce((row, key) => row?.[key], config), nextValue = keys.reduce((row, key) => row?.[key], next);
      if ((keys.length > 2 || keys.at(-1) === 'agdf' || nextValue === undefined) && JSON.stringify(beforeValue) !== JSON.stringify(nextValue)) {
        after = editJsonc(after, keys, nextValue);
      }
    }
  }
  if (action === 'disable' && removable) after = null;
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
