import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { COCKPIT_LIMITS, COCKPIT_MIME, COCKPIT_UI_URI } from "../../core/lib/control-inspect/cockpit-contract.js";
import { COCKPIT_UI_BUILD_COMMAND, readCockpitUiBuild } from "../../../scripts/cockpit-ui-build.mjs";
import { syncPluginMcp } from "../../../scripts/sync-plugin-mcp.js";

// Claude cockpit plugin variant: verified UI bytes plus a second declaration; every other build unchanged.
const root = mkdtempSync(join(tmpdir(), "agdf-plugin-cockpit-variant-"));
const build = (name, html, manifest = {}) => {
  const directory = join(root, name);
  mkdirSync(directory);
  writeFileSync(join(directory, "cockpit.html"), html);
  writeFileSync(join(directory, "manifest.json"), JSON.stringify({ schema_version: "1", uri: COCKPIT_UI_URI, mime_type: COCKPIT_MIME,
    bytes: Buffer.byteLength(html), digest: `sha256:${createHash("sha256").update(html).digest("hex")}`, ...manifest }));
  return directory;
};
try {
  const html = "<!doctype html><title>AGDF Cockpit</title>";
  const ui = readCockpitUiBuild({ uiRoot: build("valid", html) });
  assert.equal(ui.files["cockpit.html"].toString("utf8"), html);

  // One validation owner: missing, mismatched, oversized and linked builds fail with the caller's code.
  const failure = `AGDF_COCKPIT_UI_BUILD_REQUIRED: run ${COCKPIT_UI_BUILD_COMMAND}, then retry the Claude build.`;
  const rejected = [join(root, "missing"), build("digest", html, { digest: `sha256:${"0".repeat(64)}` }), build("bytes", html, { bytes: 1 }),
    build("uri", html, { uri: "ui://other/v1.html" }), build("mime", html, { mime_type: "text/html" }), build("schema", html, { schema_version: "2" }),
    build("oversize", "x".repeat(COCKPIT_LIMITS.html + 1))];
  try {
    const linked = join(root, "linked"); symlinkSync(join(root, "valid"), linked, "junction"); rejected.push(linked);
  } catch (error) { if (process.platform !== "win32" || error.code !== "EPERM") throw error; }
  for (const uiRoot of rejected) assert.throws(() => readCockpitUiBuild({ uiRoot, failure }), (error) => error.message === failure, uiRoot);

  const pluginRoot = join(root, "plugin");
  mkdirSync(pluginRoot);
  const declaration = () => JSON.parse(readFileSync(join(pluginRoot, "mcp", "claude.mcp.json"), "utf8"));
  syncPluginMcp({ pluginRoot });
  const plain = declaration();
  assert.deepEqual(Object.keys(plain.mcpServers), ["agdf"]);
  assert.equal(existsSync(join(pluginRoot, "mcp", "server", "ui")), false, "default build carries no cockpit UI");

  const files = syncPluginMcp({ pluginRoot, cockpitUi: ui });
  const variant = declaration();
  assert.deepEqual(Object.keys(variant.mcpServers), ["agdf", "agdf-cockpit"]);
  assert.deepEqual(variant.mcpServers.agdf, plain.mcpServers.agdf, "regular entry stays identical");
  assert.deepEqual(variant.mcpServers["agdf-cockpit"], { type: "stdio", command: "node",
    args: ["${CLAUDE_PLUGIN_ROOT}/mcp/agdf-mcp-launch.js", "--cockpit-dir", "${CLAUDE_PROJECT_DIR}"] });
  for (const name of ["manifest.json", "cockpit.html"]) {
    assert.deepEqual(readFileSync(join(pluginRoot, "mcp", "server", "ui", name)), ui.files[name], name);
    assert.ok(files.includes(`mcp/server/ui/${name}`), name);
  }

  // Rebuilding without the cockpit removes the variant again.
  syncPluginMcp({ pluginRoot });
  assert.deepEqual(declaration(), plain);
  assert.equal(existsSync(join(pluginRoot, "mcp", "server", "ui")), false, "stale cockpit UI is pruned");

  // The Copilot profile never carries the cockpit.
  const copilotRoot = join(root, "copilot");
  mkdirSync(copilotRoot);
  assert.throws(() => syncPluginMcp({ pluginRoot: copilotRoot, profile: "copilot", cockpitUi: ui }), /requires the shared profile/);
  console.log("Plugin MCP cockpit variant tests passed");
} finally {
  rmSync(root, { recursive: true, force: true });
}
