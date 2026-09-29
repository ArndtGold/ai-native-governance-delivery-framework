import assert from "node:assert/strict";
import { cpSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pluginDefinition } from "../../lib/cli/runtime-context.js";

// Shared by the plugin MCP runtime, Claude and Codex tests: the generated runtime plugin and an offline
// stand-in for the one npm install the plugin-local launcher performs.
const packageRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
export const pluginRoot = join(packageRoot, "generated", "plugins", "agdf");
export const version = pluginDefinition.version;
const sdkSource = join(packageRoot, "..", "agdf-mcp-server", "node_modules");
assert.ok(existsSync(join(pluginRoot, "mcp", "agdf-mcp-launch.js")), "run sync-package-assets before this test");

// Replaces `npm install @modelcontextprotocol/server@2.0.0` by copying the pinned SDK closure.
export const npmCalls = [];
export const offlineNpm = (_executable, args, options) => {
  npmCalls.push(args.at(-1));
  assert.equal(args.at(-1), "@modelcontextprotocol/server@2.0.0", "only the pinned SDK is acquired from npm");
  for (const entry of ["@modelcontextprotocol/server", "@modelcontextprotocol/core", "zod"]) {
    cpSync(join(sdkSource, entry), join(options.cwd, "node_modules", entry), { recursive: true });
  }
  return "";
};
