import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { computeSdkRuntimeDigest } from "../../../scripts/write-mcp-sdk-digest.mjs";
import { renderPluginMcpSdkBundle } from "../../../scripts/sync-plugin-mcp.js";

// The committed expected SDK digest must describe the reviewed, installed SDK tree (run `npm ci` here first).
const committed = JSON.parse(readFileSync(new URL("../sdk-runtime-digest.json", import.meta.url), "utf8"));
assert.deepEqual(committed, computeSdkRuntimeDigest(), "sdk-runtime-digest.json is stale; run npm run mcp:sdk-digest");

// The plugin bundle carries exactly the runtime closure, never a dev dependency.
const bundle = renderPluginMcpSdkBundle();
const lock = JSON.parse(bundle["package-lock.json"]);
assert.deepEqual(Object.keys(lock.packages).sort(), ["", "node_modules/@modelcontextprotocol/core", "node_modules/@modelcontextprotocol/server", "node_modules/zod"]);
assert.ok(Object.values(lock.packages).every((entry) => !entry.dev));
assert.deepEqual(JSON.parse(bundle["package.json"]).dependencies, { "@modelcontextprotocol/server": "2.0.0" });
assert.equal(JSON.parse(bundle["expected-sdk.json"]).sdk_digest, committed.sdk_digest);

// A drifted digest source fails the drift check and is refused instead of being shipped.
const altered = { ...committed, sdk_digest: "0".repeat(64) };
assert.notDeepEqual(altered, computeSdkRuntimeDigest());
const stale = { ...committed, packages: committed.packages.map((entry) => (entry.name === "zod" ? { ...entry, version: "4.9.9" } : entry)) };
assert.throws(() => renderPluginMcpSdkBundle({ digestSource: stale }), /sdk-runtime-digest.json is stale/);

console.log("MCP SDK digest tests passed");
