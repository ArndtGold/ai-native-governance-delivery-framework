import { existsSync, readFileSync, rmSync, rmdirSync, mkdirSync, lstatSync } from "node:fs";
import { createHash } from 'node:crypto';
import { withOwnedFileLock } from '#agdf-core/control-state/run-state-writer.js';
import { inspectMcpServerPackage } from '../package.js';
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

function serverId(spec = {}) {
  const id = spec.serverId ?? 'agdf', role = spec.role ?? 'governance';
  if (role === 'governance' && id === 'agdf') return id;
  if (role === 'cockpit' && ['agdf-cockpit', 'agdf-cockpit-local'].includes(id)) return id;
  if (role === 'diagnostic' && /^agdf-test-[a-z0-9][a-z0-9-]{0,63}$/u.test(id)) return id;
  throw Error('AGDF_MCP_CODEX_ROLE_INVALID');
}

function safeSnapshot(path) {
  for (const part of [dirname(path), path]) {
    if (existsSync(part) && lstatSync(part).isSymbolicLink()) throw Error('AGDF_MCP_CODEX_CONFIG_INVALID');
  }
  return fileSnapshot(path);
}

function sameBytes(snapshot) {
  const current = safeSnapshot(snapshot.path);
  return current.existed === snapshot.existed && current.content === snapshot.content;
}

function exactJson(value) { return JSON.stringify(value); }

function section(spec, { createdConfig = false, createdDirectory = false } = {}) {
  const id = serverId(spec);
  const identity = exactJson({ owner: OWNER, version: spec.version, digest: spec.digest,
    ...(id !== 'agdf' ? { role: spec.role, server_id: id } : {}),
    ...(createdConfig ? { created_config: true } : {}), ...(createdDirectory ? { created_directory: true } : {}) });
  return `${MARKER} ${identity}\n[mcp_servers.${id}]\ncommand = ${exactJson(spec.command)}\nargs = ${exactJson(spec.args)}\n`;
}

function sectionRange(content, id = 'agdf') {
  // This bounded owner edits generated single-line sections only. Headers inside
  // TOML multiline strings cannot establish ownership; preserve unsupported sources.
  if (/'''|"""/u.test(content)) throw Error('AGDF_MCP_CODEX_CONFIG_INVALID');
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const exactHeader = `[mcp_servers.${id}]`;
  const headers = [...content.matchAll(new RegExp('^[ \\t]*\\[mcp_servers\\.' + escaped + '\\][ \\t]*$', 'gm'))];
  const unsupported = content.split("\n").some((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return false;
    if (trimmed.startsWith("[")) {
      const normalized = trimmed.replace(/[\s"']/gu, "");
      if (normalized === "[mcp_servers]") return true;
      return new RegExp('^\\[\\[?mcp_servers\\.' + escaped + '(?:\\.|\\])', 'u').test(normalized)
        && trimmed !== exactHeader;
    }
    const assignment = trimmed.match(/^([^=]+)=/u)?.[1]?.replace(/[\s"']/gu, "");
    return assignment === "mcp_servers" || new RegExp('^mcp_servers\\.' + escaped + '(?:\\.|$)', 'u').test(assignment ?? '');
  });
  if (headers.length > 1 || unsupported) throw new Error("AGDF_MCP_CODEX_CONFIG_INVALID");
  const [header] = headers;
  if (!header) return null;
  const sectionStart = header.index;
  const next = /^[ \t]*\[[^\n]+\][ \t]*$/gm;
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
  const id = serverId(expected);
  if (!existsSync(path)) return { status: "absent", path, identity: null };
  const content = safeSnapshot(path).content;
  const range = sectionRange(content, id);
  if (!range) return { status: "absent", path, identity: null };
  const owned = identity(range.marker);
  if (!owned || id !== 'agdf' && (owned.role !== expected.role || owned.server_id !== id)) return { status: "foreign", path, identity: null };
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
    const entry = JSON.parse(String(input.exec("codex", ["mcp", "get", serverId(input.spec), "--json"], {
      cwd: input.target, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    })));
    nativeReadback = { status: entry?.name === serverId(input.spec) ? 'observed' : 'unconfirmed',
      entry_present: entry?.name === serverId(input.spec) ? true : null, client_variant: 'cli', effective_desktop_policy: 'unknown' };
  } catch { nativeReadback = { status: "unavailable", entry_present: false }; }
  return { ...allSourceResult({ sources: list, inspected: states, selectedSource: selected }),
    native_scope: input.scope, native_readback: Object.freeze(nativeReadback) };
}

function transaction({ action, scope, target, spec, previousSpec, revalidate = () => {}, env }) {
  const id = serverId(spec);
  const current = inspect({ scope, target, spec, env });
  if (current.status === "precedence_conflict") throw new Error("AGDF_MCP_REGISTRATION_PRECEDENCE_CONFLICT");
  if (current.selected_status === "foreign") throw new Error("AGDF_MCP_REGISTRATION_FOREIGN");
  const path = current.path;
  const snapshots = sources({ scope, target, env }).map(source => safeSnapshot(source.path));
  const locked = work => { mkdirSync(dirname(path), { recursive: true }); return withOwnedFileLock(`${path}.agdf-transaction`, work); };
  if ((action === "enable" && current.selected_status === "matched") || (action === "disable" && current.selected_status === "absent")) {
    return { status: "unchanged", path, apply() { const verify = () => {
      if (!snapshots.every(sameBytes)) throw Error('AGDF_MCP_CODEX_SOURCE_CHANGED');
      revalidate();
    }; return existsSync(dirname(path)) ? locked(verify) : verify(); }, rollback() {} };
  }
  const snapshot = snapshots.find(item => item.path === path);
  if (current.selected_status === 'owned_mismatch' && inspectPath(path, previousSpec ?? spec).status !== 'matched') throw Error('AGDF_MCP_REGISTRATION_FOREIGN');
  const range = sectionRange(snapshot.content, id);
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
  let applied = false;
  const expectedAfter = { ...snapshot, existed: after !== null, content: after ?? '' };
  return { status: "changed", path,
    preview: Object.freeze({ source_digest: createHash('sha256').update(snapshot.content).digest('hex'),
      result_digest: createHash('sha256').update(after ?? '').digest('hex'), server_id: id, role: spec.role ?? 'governance' }),
    apply() {
      const result = locked(() => {
      if (applied && sameBytes(expectedAfter)) return;
      if (!snapshots.every(sameBytes)) throw Error('AGDF_MCP_CODEX_SOURCE_CHANGED');
      revalidate();
      if (after === null) {
        rmSync(path, { force: true });
      } else atomicWrite(path, after);
      applied = true;
      });
      if (after === null && current.created_directory === true) try { rmdirSync(dirname(path)); } catch (error) { if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error?.code)) throw error; }
      return result;
    },
    rollback() {
      if (!applied && sameBytes(snapshot)) return;
      const result = locked(() => {
        if (!sameBytes(expectedAfter)) throw Error('AGDF_MCP_CODEX_ROLLBACK_CONFLICT');
        restoreSnapshot(snapshot, { removeEmptyParent: true }); applied = false;
      });
      if (!snapshot.parentExisted && !snapshot.existed) try { rmdirSync(dirname(path)); } catch (error) { if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error?.code)) throw error; }
      return result;
    },
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

// Read-only composition of declarations. It never claims desktop effective policy or rendering.
export function inspectCodexSetup({ target, env = {}, pluginRoot } = {}) {
  const entries = [], checked = [];
  for (const source of sources({ scope: 'project', target, env })) {
    try {
      const snapshot = safeSnapshot(source.path);
      if (Buffer.byteLength(snapshot.content) > 65_536) throw Error('bounded_source');
      if (/'''|"""/u.test(snapshot.content)) throw Error('unsupported_multiline_source');
      const sourceDigest = createHash('sha256').update(snapshot.content).digest('hex');
      checked.push({ source: source.id, path: source.path, status: snapshot.existed ? 'declared' : 'absent', digest: sourceDigest });
      const sections = [...snapshot.content.matchAll(/^[ \t]*\[([^\n]+)\][ \t]*$/gm)];
      for (let index = 0; index < sections.length; index++) {
        const header = sections[index][1];
        const id = /^mcp_servers\.(agdf(?:-[a-z0-9-]+)?)$/u.exec(header)?.[1];
        const plugin = header === 'plugins."agdf@agdf"';
        if (!id && !plugin) continue;
        if (entries.length >= 32) throw Error('bounded_entries');
        const name = plugin ? 'agdf' : id;
        const body = snapshot.content.slice(sections[index].index + sections[index][0].length, sections[index + 1]?.index ?? snapshot.content.length);
        const role = plugin ? 'product' : ['agdf-cockpit', 'agdf-cockpit-local'].includes(name) ? 'cockpit'
          : name.startsWith('agdf-test-') || ['agdf-cockpit-draft-check', 'agdf-decision-probe'].includes(name) ? 'diagnostic' : 'legacy_or_conflict';
        const value = key => new RegExp('^' + key + '[ \\t]*=[ \\t]*([^\\n#]+)', 'm').exec(body)?.[1]?.trim();
        const declaredEnabled = value('enabled');
        const enabled = declaredEnabled === 'false' ? false : declaredEnabled === 'true' ? true : declaredEnabled !== undefined || plugin ? null : true;
        const beforeHeader = snapshot.content.slice(0, sections[index].index).match(/(# AGDF-OWNED-MCP: [^\n]+)\n$/u)?.[1];
        const mark = identity(beforeHeader);
        const exactIdOwned = mark && (plugin || name === 'agdf' || mark.server_id === name && mark.role === role);
        const timeout = key => { const raw = value(key); return raw && /^\d+(?:\.\d+)?$/u.test(raw) ? Number(raw) : null; };
        let runtimeIdentity = null;
        try {
          const args = JSON.parse(value('args') ?? 'null');
          if (Array.isArray(args) && typeof args[0] === 'string' && /\/node_modules\/@agdf\/mcp-server\/bin\/agdf-mcp\.js$/u.test(args[0])) {
            let root = args[0]; for (let n = 0; n < 5; n++) root = dirname(root);
            const version = root.split(/[\\/]/u).at(-1);
            const runtime = inspectMcpServerPackage({ dataRoot: dirname(root), expectedVersion: version });
            runtimeIdentity = { status: runtime.status, version, server_digest: runtime.digest,
              dispatcher_digest: runtime.dispatcherDigest ?? null, sdk_digest: runtime.sdkDigest ?? null,
              evidence_class: 'direct_package_inspection', session_identity: 'unobserved' };
          }
        } catch {}
        entries.push({ server_id: name, display_name: role === 'product' ? 'AGDF' : role === 'cockpit' ? 'AGDF Cockpit' : name,
          source: plugin ? 'plugin_declaration' : source.id, config_source: source.id, path: source.path, source_digest: sourceDigest,
          scope: plugin ? 'plugin' : source.id, role, owner: plugin ? 'codex_plugin' : exactIdOwned ? OWNER : 'unconfirmed',
          target: source.id === 'project' ? target : null, declared_enabled: enabled,
          declared_startup_timeout_sec: timeout('startup_timeout_sec'), declared_tool_timeout_sec: timeout('tool_timeout_sec'),
          runtime_identity: runtimeIdentity, configured: enabled === null ? 'unknown' : enabled ? 'declared' : 'disabled',
          started: 'unobserved', discovered: 'unobserved', app_rendered: 'unobserved', app_interacted: 'unobserved',
          effective_policy: 'unknown', session_freshness: 'unobserved', evidence_class: 'configuration_only' });
      }
    } catch { checked.push({ source: source.id, path: source.path, status: 'unavailable' }); }
  }
  let pluginDeclaration = { status: 'unavailable' };
  if (pluginRoot) {
    try {
      const path = join(pluginRoot, 'mcp.json'), snapshot = safeSnapshot(path);
      if (Buffer.byteLength(snapshot.content) > 65_536) throw Error('bounded_source');
      const declaration = JSON.parse(snapshot.content).mcpServers?.agdf;
      if (declaration?.type !== 'stdio' || typeof declaration.command !== 'string' || !Array.isArray(declaration.args)) throw Error('invalid_declaration');
      pluginDeclaration = { status: 'declared', path, digest: createHash('sha256').update(snapshot.content).digest('hex'), transport: 'stdio' };
    } catch {}
  }
  return Object.freeze({ source: 'codex_adapter_derived', authorizes: false, entries, checked_sources: checked,
    plugin_declaration: pluginDeclaration, effective_host_policy: 'unknown',
    session_action: 'supported_client_refresh_and_verify', shared_app_data: 'host_owned_untouched' });
}
