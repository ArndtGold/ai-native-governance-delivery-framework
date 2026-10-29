// Protocol-layer harness (SDD-002). It reuses the MCP server test harness: the owned-runtime
// fixture provides a provenance-matched server from the current build, withStdioClient the client.
// The candidate server is the assembled package plus the verified cockpit UI, as the Claude build ships it.
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createOwnedRuntimeFixture } from "../../../packages/mcp-server/test/owned-runtime.js";
import { withStdioClient } from "../../../packages/mcp-server/test/helpers.js";
import { MCP_APP_UI_EXTENSION } from "../../../packages/mcp-server/src/ui-capability.js";
import { COCKPIT_MIME } from "../../../packages/core/lib/control-inspect/cockpit-contract.js";
import { readCockpitUiBuild } from "../../../scripts/cockpit-ui-build.mjs";

export const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
export const UI_CAPABILITIES = Object.freeze({ extensions: { [MCP_APP_UI_EXTENSION]: { mimeTypes: [COCKPIT_MIME] } } });

export function createProtocolRuntime() {
  const staging = mkdtempSync(join(tmpdir(), "agdf-mcp-ergonomics-server-"));
  let fixture;
  try {
    const candidate = join(staging, "agdf-mcp-server");
    try { cpSync(join(repoRoot, "dist", "npm", "agdf-mcp-server"), candidate, { recursive: true }); }
    catch { throw new Error("MCP_ERGONOMICS_BUILD_REQUIRED: run npm run build first"); }
    const ui = readCockpitUiBuild({ failure: "MCP_ERGONOMICS_COCKPIT_UI_REQUIRED: run npm run build first" });
    for (const name of ["manifest.json", "cockpit.html"]) cpSync(join(ui.root, name), join(candidate, "ui", name));
    fixture = createOwnedRuntimeFixture({ candidateServerRoot: candidate, controlRuns: [] });
  } catch (error) {
    rmSync(staging, { recursive: true, force: true });
    throw error;
  }
  return Object.freeze({
    fixture,
    roots: [{ path: fixture.root, token: "<MCP_RUNTIME>" }, { path: staging, token: "<MCP_STAGING>" }],
    dispose() { fixture.dispose(); rmSync(staging, { recursive: true, force: true }); },
  });
}

// One client session against the claude surface; with cockpitDir the cockpit server variant.
export function withAgdfClient(runtime, { cockpitDir, capabilities } = {}, callback) {
  const args = [join(runtime.fixture.serverRoot, "bin", "agdf-mcp.js"), "--surface", "claude",
    ...(cockpitDir ? ["--cockpit-dir", cockpitDir] : [])];
  return withStdioClient({ modern: true, command: process.execPath, args, cwd: runtime.fixture.root, capabilities,
    root: runtime.fixture.root }, callback);
}
