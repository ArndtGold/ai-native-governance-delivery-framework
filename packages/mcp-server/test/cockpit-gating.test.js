import assert from "node:assert/strict";
import { PROTOCOL_VERSION_META_KEY, CLIENT_CAPABILITIES_META_KEY } from "@modelcontextprotocol/server";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createMcpCockpitRuntime } from "../../../dist/npm/create-agdf/lib/mcp-dispatch-runtime.js";
import { COCKPIT_MIME, COCKPIT_UI_URI } from "../../core/lib/control-inspect/cockpit-contract.js";
import { declaresMcpAppUi, MCP_APP_UI_EXTENSION } from "../src/ui-capability.js";
import { withStdioClient } from "./helpers.js";

const temporary = mkdtempSync(join(tmpdir(), "agdf-cockpit-gating-"));
const uiDirectory = join(temporary, "ui"), marker = join(temporary, "calls.txt");
mkdirSync(uiDirectory);
const html = "<!doctype html><title>AGDF Cockpit</title>";
writeFileSync(join(uiDirectory, "cockpit.html"), html);
writeFileSync(join(uiDirectory, "manifest.json"), JSON.stringify({ schema_version: "1", uri: COCKPIT_UI_URI, mime_type: COCKPIT_MIME,
  bytes: Buffer.byteLength(html), digest: `sha256:${createHash("sha256").update(html).digest("hex")}` }));
const entry = fileURLToPath(new URL("./cockpit-gating-entry.js", import.meta.url));
const ui = { extensions: { [MCP_APP_UI_EXTENSION]: { mimeTypes: [COCKPIT_MIME] } } };
const missingUi = error => { assert.equal(error.code, -32021); assert.deepEqual(error.data, { requiredCapabilities: ui }); return true; };
const calls = () => existsSync(marker) ? readFileSync(marker, "utf8").split("\n").filter(Boolean) : [];
const session = (surface, modern, capabilities, callback) => withStdioClient({ modern, capabilities, args: [entry, surface, uiDirectory, marker] }, callback);

try {
  // Public SDK stdio: render/read/close replies identify the same real server
  // instance. A fresh connection gets another identity. Other profiles keep theirs.
  for (const modern of [false, true]) {
    let previous;
    for (let attempt = 0; attempt < 2; attempt++) await session('codex-plugin', modern, ui, async client => {
      const render = await client.callTool({ name: 'agdf_cockpit', arguments: {} });
      const provider = render._meta?.['agdf/provider'];
      assert.equal(provider?.identity_scope, 'sdk_server_instance');
      assert.equal(provider.authorizes, false);
      assert.match(provider.connection_id, /^[a-f0-9-]{36}$/u);
      assert.equal(provider.server_module, fileURLToPath(new URL('../src/server.js', import.meta.url)));
      assert.equal(render._meta['agdf/peer'].client_info.name, 'agdf-mcp-test');
      assert.deepEqual(render._meta['agdf/peer'].capabilities.extensions[MCP_APP_UI_EXTENSION], ui.extensions[MCP_APP_UI_EXTENSION]);
      if (previous) assert.notEqual(provider.connection_id, previous);
      previous = provider.connection_id;
      for (const operation of ['snapshot', 'close']) {
        const read = await client.callTool({ name: 'agdf_cockpit_read', arguments: {
          operation, session_id: '00000000-0000-4000-8000-000000000001',
        } });
        assert.deepEqual(read._meta?.['agdf/provider'], provider);
        assert.deepEqual(read._meta?.['agdf/peer'], render._meta['agdf/peer']);
      }
      assert.equal(render.structuredContent['agdf/provider'], undefined);
    });
  }
  // Capability predicate: exact extension id and MIME type, nothing inferred from other capabilities.
  assert.equal(declaresMcpAppUi(ui, COCKPIT_MIME), true);
  for (const capabilities of [undefined, {}, { roots: { listChanged: true }, elicitation: { form: {}, url: {} } },
    { extensions: { [MCP_APP_UI_EXTENSION]: {} } }, { extensions: { [MCP_APP_UI_EXTENSION]: { mimeTypes: ["text/html"] } } }]) {
    assert.equal(declaresMcpAppUi(capabilities, COCKPIT_MIME), false, JSON.stringify(capabilities));
  }

  // Runtime factory: claude is gated, codex is not, other surfaces stay rejected.
  const inspected = { expectedVersion: "0.0.0", provenanceStatus: "matched" };
  assert.equal((await createMcpCockpitRuntime({ surface: "claude", cockpitDir: temporary, inspected })).uiCapabilityRequired, true);
  assert.equal((await createMcpCockpitRuntime({ surface: "codex", cockpitDir: temporary, inspected })).uiCapabilityRequired, false);
  const pluginRuntime = await createMcpCockpitRuntime({ surface: 'codex', cockpitMode: 'plugin', inspected });
  assert.equal(pluginRuntime.uiCapabilityRequired, true);
  assert.equal(pluginRuntime.ui.label, 'Cockpit');
  assert.deepEqual(pluginRuntime.definition.inputSchema.required, ['working_directory', 'primary_target', 'target_source']);
  assert.throws(() => pluginRuntime.tools[0].parse({}), /resource_denied/);
  await pluginRuntime.close();
  for (const invalid of [{ surface: 'claude', cockpitMode: 'plugin' }, { surface: 'codex', cockpitMode: 'plugin', cockpitDir: temporary }, { surface: 'codex', cockpitMode: 'other' }]) {
    await assert.rejects(createMcpCockpitRuntime({ ...invalid, inspected }), /AGDF_COCKPIT_TARGET_INVALID/);
  }
  for (const surface of ["copilot", "opencode"]) {
    await assert.rejects(createMcpCockpitRuntime({ surface, cockpitDir: temporary, inspected }), /AGDF_COCKPIT_TARGET_INVALID/);
  }

  // Server entry point: cockpit mode only for codex and claude; invalid roots fail before serving.
  const bin = fileURLToPath(new URL("../bin/agdf-mcp.js", import.meta.url));
  const start = (...args) => spawnSync(process.execPath, [bin, ...args], { encoding: "utf8", input: "", timeout: 30000 });
  assert.match(start("--surface", "copilot", "--cockpit-dir", temporary).stderr, /AGDF_MCP_ARGUMENTS_INVALID/);
  assert.match(start("--surface", "claude", "--cockpit-dir", join(temporary, "missing")).stderr, /AGDF_COCKPIT_TARGET_INVALID/);
  assert.match(start("--surface", "claude", "--cockpit-dir", "relative/path").stderr, /AGDF_COCKPIT_TARGET_INVALID/);
  assert.doesNotMatch(start("--surface", "claude", "--cockpit-dir", temporary).stderr, /AGDF_MCP_ARGUMENTS_INVALID|AGDF_COCKPIT_TARGET_INVALID/);

  for (const modern of [false, true]) {
    const era = modern ? "2026-07-28" : "2025-11-25";
    // Codex discovers metadata before choosing its UI-capable invocation route.
    // Advertising tools grants neither a view nor access to the UI resource.
    await session('codex-plugin', modern, undefined, async client => {
      const listed = (await client.listTools()).tools;
      assert.deepEqual(listed.map(tool => tool.name), ['agdf_cockpit', 'agdf_cockpit_read'], era);
      assert.equal(listed[0]._meta.ui.resourceUri, COCKPIT_UI_URI);
      assert.deepEqual((await client.listResources()).resources, [], era);
      await assert.rejects(client.readResource({ uri: COCKPIT_UI_URI }), modern ? missingUi : /resource_denied/, era);
      const before = calls().length;
      for (const name of ['agdf_cockpit', 'agdf_cockpit_read']) {
        const input = { name, arguments: name === 'agdf_cockpit' ? {}
          : { operation: 'close', session_id: '00000000-0000-4000-8000-000000000000' } };
        if (modern) await assert.rejects(client.callTool(input), missingUi, era);
        else assert.equal((await client.callTool(input)).structuredContent.code, 'resource_denied', era);
      }
      assert.equal(calls().length, before, `${era}: discovery must not allocate or read a view`);
    });
    let codexTools;
    // Codex stays unconditional, also for a client without the UI extension.
    await session("codex", modern, undefined, async (client) => {
      codexTools = (await client.listTools()).tools;
      assert.deepEqual(codexTools.map((tool) => tool.name), ["agdf_cockpit", "agdf_cockpit_read"], era);
      assert.deepEqual((await client.listResources()).resources.map((resource) => resource.uri), [COCKPIT_UI_URI], era);
    });
    // Claude with the UI extension: same offering as Codex.
    await session("claude", modern, ui, async (client) => {
      assert.deepEqual((await client.listTools()).tools, codexTools, `${era}: gated listing equals the ungated cockpit listing`);
      assert.deepEqual((await client.listResources()).resources.map((resource) => resource.uri), [COCKPIT_UI_URI], era);
      assert.equal((await client.readResource({ uri: COCKPIT_UI_URI })).contents[0].mimeType, COCKPIT_MIME, era);
      const before = calls().length;
      assert.equal((await client.callTool({ name: "agdf_cockpit", arguments: {} })).structuredContent.tool, "agdf_cockpit", era);
      assert.equal(calls().length, before + 1, `${era}: UI-capable call reaches the cockpit service`);
    });
    // Claude without the UI extension (as Claude Code 2.1.268/2.1.293 declares): nothing offered, nothing executed.
    await session("claude", modern, { roots: { listChanged: true }, elicitation: { form: {} } }, async (client) => {
      assert.deepEqual((await client.listTools()).tools, [], era);
      assert.deepEqual((await client.listResources()).resources, [], era);
      await assert.rejects(client.readResource({ uri: COCKPIT_UI_URI }), modern ? missingUi : /resource_denied/, era);
      const before = calls().length;
      for (const name of ["agdf_cockpit", "agdf_cockpit_read"]) {
        const input = { name, arguments: name === "agdf_cockpit" ? {} : { operation: "close", session_id: "00000000-0000-4000-8000-000000000000" } };
        if (modern) await assert.rejects(client.callTool(input), missingUi, `${era}:${name}`);
        else assert.equal((await client.callTool(input)).structuredContent.code, "resource_denied", `${era}:${name}`);
      }
      assert.equal(calls().length, before, `${era}: denied calls never reach the cockpit service`);
    });
  }
  // Actual wire frames on one modern connection: declarations are per request,
  // malformed/unknown/invalid-input priority remains SDK-owned and EOF drains.
  const modernMeta = capabilities => ({ [PROTOCOL_VERSION_META_KEY]: '2026-07-28', [CLIENT_CAPABILITIES_META_KEY]: capabilities });
  const request = (id, method, params, capabilities = {}) => ({ jsonrpc: '2.0', id, method, params: { ...params, _meta: modernMeta(capabilities) } });
  const wire = [
    request(101, 'tools/call', { name: 'agdf_cockpit', arguments: {} }),
    request(102, 'tools/call', { name: 'agdf_cockpit', arguments: {} }, ui),
    request(103, 'tools/call', { name: 'agdf_cockpit', arguments: {} }),
    { jsonrpc: '2.0', id: 104, method: 'tools/call', params: { name: 'agdf_cockpit', arguments: {}, _meta: { [PROTOCOL_VERSION_META_KEY]: '2026-07-28' } } },
    request(105, 'tools/call', { name: 'agdf_cockpit', arguments: { injected: true } }),
    request(106, 'tools/call', { name: 'absent', arguments: {} }),
    request(107, 'resources/read', { uri: COCKPIT_UI_URI }),
    request(108, 'resources/read', { uri: 'ui://absent' }),
    request(109, 'tools/call', { name: 'agdf_cockpit', arguments: {} }, { extensions: { [MCP_APP_UI_EXTENSION]: { mimeTypes: ['text/html'] } } }),
  ];
  const beforeWire = calls().length;
  const exchanged = spawnSync(process.execPath, [entry, 'claude', uiDirectory, marker], { encoding: 'utf8', input: wire.map(row => JSON.stringify(row)).join('\n') + '\n', timeout: 30000 });
  assert.equal(exchanged.status, 0, exchanged.stderr);
  const replies = exchanged.stdout.trim().split('\n').map(line => JSON.parse(line));
  assert.equal(replies.length, wire.length, 'one reply per request, all pending IDs drained at EOF');
  const byId = new Map(replies.map(reply => [reply.id, reply]));
  for (const id of [101, 103, 107, 109]) { assert.equal(byId.get(id).error.code, -32021); assert.deepEqual(byId.get(id).error.data, { requiredCapabilities: ui }); }
  assert.ok(byId.get(102).result);
  assert.equal(byId.get(104).error.code, -32602);
  assert.equal(byId.get(105).result.isError, true);
  assert.match(byId.get(105).result.content[0].text, /Input validation error/);
  for (const id of [106, 108]) { assert.ok(byId.get(id).error); assert.notEqual(byId.get(id).error.code, -32021); }
  assert.equal(calls().length, beforeWire + 1, 'only the explicitly supported request executes');
  if (process.env.AGDF_MCP_WIRE_EVIDENCE === '1') console.log(JSON.stringify({
    scenario_ids: ['SCN-001', 'SCN-002', 'SCN-013'], protocol: '2026-07-28',
    requests: wire, responses: replies, executions: calls().length - beforeWire,
    process_exit: exchanged.status, stderr: exchanged.stderr, eof_drained: replies.length === wire.length,
  }));
  console.log("AGDF cockpit UI capability gating tests passed (2025-11-25 and 2026-07-28).");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
