import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COCKPIT_LIMITS, COCKPIT_MIME, COCKPIT_UI_URI, DECISION_UI_URI } from "../../core/lib/control-inspect/cockpit-contract.js";
import { COCKPIT_UI_BUILD_COMMAND, readCockpitUiBuild, readDecisionUiBuild, mcpUiSourceDigest } from "../../../scripts/cockpit-ui-build.mjs";
import { syncPluginMcp } from "../../../scripts/sync-plugin-mcp.js";

// Claude cockpit plugin variant: verified UI bytes plus a second declaration; every other build unchanged.
const root = mkdtempSync(join(tmpdir(), "agdf-plugin-cockpit-variant-"));
const build = (name, html, manifest = {}) => {
  const directory = join(root, name);
  mkdirSync(directory);
  writeFileSync(join(directory, "cockpit.html"), html);
  writeFileSync(join(directory, "manifest.json"), JSON.stringify({ schema_version: "1", uri: COCKPIT_UI_URI, mime_type: COCKPIT_MIME,
    bytes: Buffer.byteLength(html), digest: `sha256:${createHash("sha256").update(html).digest("hex")}`,
    source_digest: mcpUiSourceDigest(), ...manifest }));
  return directory;
};
try {
  // A changed imported catalog invalidates the UI source identity even when
  // the component sources and the previously built HTML remain unchanged.
  const sourceRoot = join(root, 'source-fixture');
  const repository = fileURLToPath(new URL('../../../', import.meta.url));
  for (const path of ['packages/control-ui/src', 'packages/control-ui/scripts',
    'packages/control-ui/mcp.html', 'packages/control-ui/decision.html',
    'packages/control-ui/vite.config.mjs', 'packages/control-ui/package.json',
    'packages/control-ui/package-lock.json', 'packages/core/lib',
    'plugins/agdf/meta/agdf-interaction-locales.json', 'pages/src/design',
    'pages/src/styles/design-tokens.css', 'pages/scripts/design-tokens.mjs',
    'scripts/cockpit-ui-build.mjs']) {
    mkdirSync(dirname(join(sourceRoot, path)), { recursive: true });
    cpSync(join(repository, path), join(sourceRoot, path), { recursive: true });
  }
  const beforeCatalogChange = mcpUiSourceDigest({ sourceRoot });
  assert.equal(beforeCatalogChange, mcpUiSourceDigest());
  const catalogPath = join(sourceRoot, 'plugins/agdf/meta/agdf-interaction-locales.json');
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  catalog.locales.de.gateTitles.UR += ' (changed fixture)';
  writeFileSync(catalogPath, JSON.stringify(catalog));
  assert.notEqual(mcpUiSourceDigest({ sourceRoot }), beforeCatalogChange);

  const html = "<!doctype html><title>AGDF Cockpit</title>";
  const ui = readCockpitUiBuild({ uiRoot: build("valid", html) });
  assert.equal(ui.files["cockpit.html"].toString("utf8"), html);

  // One validation owner: missing, mismatched, oversized and linked builds fail with the caller's code.
  const failure = `AGDF_COCKPIT_UI_BUILD_REQUIRED: run ${COCKPIT_UI_BUILD_COMMAND}, then retry the Claude build.`;
  const rejected = [join(root, "missing"), build("digest", html, { digest: `sha256:${"0".repeat(64)}` }), build("bytes", html, { bytes: 1 }),
    build("uri", html, { uri: "ui://other/v1.html" }), build("mime", html, { mime_type: "text/html" }), build("schema", html, { schema_version: "2" }),
    build("oversize", "x".repeat(COCKPIT_LIMITS.html + 1)),
    build("stale-source", html, { source_digest: `sha256:${"0".repeat(64)}` }),
    build("unbound-source", html, { source_digest: undefined })];
  try {
    const linked = join(root, "linked"); symlinkSync(join(root, "valid"), linked, "junction"); rejected.push(linked);
  } catch (error) { if (process.platform !== "win32" || error.code !== "EPERM") throw error; }
  for (const uiRoot of rejected) assert.throws(() => readCockpitUiBuild({ uiRoot, failure }), (error) => error.message === failure, uiRoot);

  const decisionRoot = build('decision-source-binding', html);
  writeFileSync(join(decisionRoot, 'decision.html'), html);
  const decisionManifest = JSON.parse(readFileSync(join(decisionRoot, 'manifest.json'), 'utf8'));
  decisionManifest.uri = DECISION_UI_URI;
  writeFileSync(join(decisionRoot, 'decision-manifest.json'), JSON.stringify(decisionManifest));
  assert.equal(readDecisionUiBuild({ uiRoot: decisionRoot }).manifest.source_digest, mcpUiSourceDigest());
  // The HTML still has an exact, valid digest. Changed source binding must prevent
  // assembly nevertheless, rather than silently qualifying an older UI bundle.
  decisionManifest.source_digest = `sha256:${'0'.repeat(64)}`;
  writeFileSync(join(decisionRoot, 'decision-manifest.json'), JSON.stringify(decisionManifest));
  assert.throws(() => readDecisionUiBuild({ uiRoot: decisionRoot }), /AGDF_DECISION_UI_INVALID/);

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

  // Codex carries the same exact UI without implicitly enabling Claude's variant.
  syncPluginMcp({ pluginRoot, cockpitUi: ui, surface: 'codex' });
  assert.deepEqual(declaration(), plain);
  const codex = JSON.parse(readFileSync(join(pluginRoot, 'mcp.json'), 'utf8'));
  assert.deepEqual(Object.keys(codex.mcpServers), ['agdf', 'agdf-cockpit']);
  assert.deepEqual(codex.mcpServers['agdf-cockpit'].args, [...codex.mcpServers.agdf.args, '--cockpit']);
  for (const name of ['manifest.json', 'cockpit.html']) assert.deepEqual(readFileSync(join(pluginRoot, 'mcp/server/ui', name)), ui.files[name]);
  syncPluginMcp({ pluginRoot, cockpitUi: ui, surface: 'all' });
  assert.deepEqual(declaration(), plain, 'published Codex payload does not change Claude declaration');

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
