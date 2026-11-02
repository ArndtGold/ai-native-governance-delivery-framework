import assert from "node:assert/strict";
import { cpSync, existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pluginDefinition } from "../../packages/cli/lib/cli/runtime-context.js";

// Shared by the plugin MCP runtime, Claude and Codex tests: the generated runtime plugin and an offline
// stand-in for the one npm install the plugin-local launcher performs.
const packageRoot = resolve(fileURLToPath(new URL("../../packages/cli/", import.meta.url)));
export const pluginRoot = join(packageRoot, "generated", "plugins", "agdf");
export const version = pluginDefinition.version;
const sdkSource = join(packageRoot, "..", "mcp-server", "node_modules");
assert.ok(existsSync(join(pluginRoot, "mcp", "agdf-mcp-launch.js")), "run sync-package-assets before this test");

// Replaces `npm ci` against the shipped mcp/sdk lock (or, under the override, `npm install
// @modelcontextprotocol/server@2.0.0`) by copying the pinned SDK closure.
export const npmCalls = [];
export const offlineNpm = (_executable, args, options) => {
  const command = args.includes("ci") ? "ci" : args.at(-1);
  npmCalls.push(command);
  assert.ok(args.includes("--ignore-scripts"), "npm never runs install scripts");
  if (command === "ci") {
    assert.ok(args.includes("--omit=dev"), "the locked install omits dev dependencies");
    assert.equal(readFileSync(join(options.cwd, "package-lock.json"), "utf8"),
      readFileSync(join(pluginRoot, "mcp", "sdk", "package-lock.json"), "utf8"), "npm ci uses the lock shipped with the plugin");
  } else {
    assert.equal(command, "@modelcontextprotocol/server@2.0.0", "only the pinned SDK is acquired from npm");
  }
  for (const entry of ["@modelcontextprotocol/server", "@modelcontextprotocol/core", "zod"]) {
    cpSync(join(sdkSource, entry), join(options.cwd, "node_modules", entry), { recursive: true });
  }
  return "";
};
