import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createMcpCockpitRuntime } from "create-agdf/mcp-dispatch-runtime";
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
const calls = () => existsSync(marker) ? readFileSync(marker, "utf8").split("\n").filter(Boolean) : [];
const session = (surface, modern, capabilities, callback) => withStdioClient({ modern, capabilities, args: [entry, surface, uiDirectory, marker] }, callback);

try {
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
      await assert.rejects(client.readResource({ uri: COCKPIT_UI_URI }), /resource_denied/, era);
      const before = calls().length;
      for (const name of ["agdf_cockpit", "agdf_cockpit_read"]) {
        const result = await client.callTool({ name, arguments: name === "agdf_cockpit" ? {} : { operation: "close", session_id: "00000000-0000-4000-8000-000000000000" } });
        assert.equal(result.structuredContent.code, "resource_denied", `${era}:${name}`);
      }
      assert.equal(calls().length, before, `${era}: denied calls never reach the cockpit service`);
    });
  }
  console.log("AGDF cockpit UI capability gating tests passed (2025-11-25 and 2026-07-28).");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
