#!/usr/bin/env node
import process from "node:process";

const major = Number.parseInt(process.versions.node.split(".")[0], 10);
if (!Number.isInteger(major) || major < 20) {
  process.stderr.write("AGDF_MCP_NODE_UNSUPPORTED\n");
  process.exitCode = 1;
} else {
  const args = process.argv.slice(2);
  const valid = args.length === 2
    && args[0] === "--surface"
    && ["codex", "claude", "opencode"].includes(args[1]);
  if (!valid) {
    process.stderr.write("AGDF_MCP_ARGUMENTS_INVALID\n");
    process.exitCode = 1;
  } else {
    const { runMcpServer } = await import("../src/main.js");
    await runMcpServer({ surface: args[1] });
  }
}
