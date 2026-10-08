#!/usr/bin/env node
import process from "node:process";

const major = Number.parseInt(process.versions.node.split(".")[0], 10);
if (!Number.isInteger(major) || major < 22) {
  process.stderr.write("AGDF_MCP_NODE_UNSUPPORTED\n");
  process.exitCode = 1;
} else {
  const args = process.argv.slice(2);
  const valid = (args.length === 2 || args.length === 4 && ['codex', 'claude'].includes(args[1]) && args[2] === '--cockpit-dir')
    && args[0] === "--surface"
    && ["codex", "claude", "copilot", "opencode"].includes(args[1]);
  if (!valid) {
    process.stderr.write("AGDF_MCP_ARGUMENTS_INVALID\n");
    process.exitCode = 1;
  } else {
    const { runMcpServer } = await import("../src/main.js");
    try { await runMcpServer({ surface: args[1], cockpitDir: args.length === 4 ? args[3] : undefined }); }
    catch (error) {
      process.stderr.write(['AGDF_COCKPIT_TARGET_INVALID', 'AGDF_COCKPIT_UI_INVALID'].includes(error.message) ? `${error.message}\n` : 'AGDF_MCP_STARTUP_FAILED\n');
      process.exitCode = 1;
    }
  }
}
