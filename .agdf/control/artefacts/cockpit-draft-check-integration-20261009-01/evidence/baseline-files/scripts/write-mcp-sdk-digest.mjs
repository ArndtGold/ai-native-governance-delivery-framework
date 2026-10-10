// Writes packages/mcp-server/sdk-runtime-digest.json: the expected digest of the plugin MCP SDK tree.
// Run after `npm ci` in packages/mcp-server whenever the SDK lock changes (npm run mcp:sdk-digest).
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { digestMcpSdkRuntime } from "../packages/core/lib/runtime/plugin-provenance.js";
import { runtimeSdkClosure, SDK_DIGEST_SOURCE } from "./sync-plugin-mcp.js";

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "packages", "mcp-server");

export function computeSdkRuntimeDigest() {
  const { entries } = runtimeSdkClosure();
  return {
    schema_version: 1,
    sdk_digest: digestMcpSdkRuntime(serverRoot),
    packages: entries.map(([name, entry]) => ({ name, version: entry.version, integrity: entry.integrity })),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeFileSync(SDK_DIGEST_SOURCE, `${JSON.stringify(computeSdkRuntimeDigest(), null, 2)}\n`, "utf8");
  console.log(`wrote ${join("packages", "mcp-server", "sdk-runtime-digest.json")}`);
}
