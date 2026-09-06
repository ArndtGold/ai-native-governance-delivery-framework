import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
const lock = JSON.parse(readFileSync(new URL("package-lock.json", root), "utf8"));
const dispatcherManifest = JSON.parse(readFileSync(new URL("../../create-agdf/package.json", import.meta.url), "utf8"));
const capability = JSON.parse(readFileSync(new URL("../../plugin/meta/agdf-mcp-capability.json", import.meta.url), "utf8"));

assert.equal(manifest.name, "@agdf/mcp-server");
assert.equal(manifest.version, dispatcherManifest.version);
assert.equal(manifest.engines.node, ">=20");
assert.deepEqual(manifest.dependencies, {
  "@modelcontextprotocol/server": "2.0.0",
  "create-agdf": dispatcherManifest.version,
});
assert.deepEqual(manifest.devDependencies, { "@modelcontextprotocol/client": "2.0.0" });
assert.equal(Object.hasOwn(manifest.dependencies, "@modelcontextprotocol/client"), false);
assert.equal(Object.keys(manifest.dependencies).some((name) => name === "@modelcontextprotocol/sdk"), false);
assert.equal(lock.packages["node_modules/@modelcontextprotocol/server"].version, "2.0.0");
assert.equal(lock.packages["node_modules/@modelcontextprotocol/client"].dev, true);
assert.equal(lock.version, manifest.version);
assert.equal(lock.packages[""].version, manifest.version);
assert.equal(lock.packages[""].dependencies["create-agdf"], manifest.version);
assert.equal(statSync(new URL("bin/agdf-mcp.js", root)).mode & 0o111, 0o111);
assert.equal(capability.release_version, manifest.version);
assert.equal(capability.tool.name, "agdf_dispatch");
assert.equal(capability.tool.semantic_owner, "create-agdf/lib/skill-dispatch/contract.js");
assert.equal(capability.tool.authorizes, false);
assert.equal(capability.package.sdk_server, manifest.dependencies["@modelcontextprotocol/server"]);
assert.equal(capability.transport.kind, "stdio");
assert.deepEqual(capability.transport.compatibility_protocols, ["2025-11-25"]);
assert.equal(capability.distribution.public_skills_only_candidate, "excluded");
assert.deepEqual(new Set(Object.values(capability.host_support)), new Set(["unverified"]));

const npmCache = mkdtempSync(join(tmpdir(), "agdf-mcp-npm-cache-"));
let packed;
try {
  packed = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, npm_config_cache: npmCache },
  }))[0];
} finally {
  rmSync(npmCache, { recursive: true, force: true });
}
const paths = packed.files.map((file) => file.path);
for (const required of ["bin/agdf-mcp.js", "src/main.js", "src/server.js", "src/worker.js", "src/worker-entry.js", "README.md", "NOTICE", "package.json"]) {
  assert.ok(paths.includes(required), `packed server is missing ${required}`);
}
assert.equal(paths.some((path) => path.startsWith("test/")), false);
assert.equal(paths.some((path) => path.includes("node_modules")), false);

const node18Probe = spawnSync(process.execPath, ["--input-type=module", "--eval", `
Object.defineProperty(process.versions, "node", { value: "18.20.8" });
process.argv = [process.execPath, ${JSON.stringify(new URL("bin/agdf-mcp.js", root).pathname)}, "--surface", "codex"];
await import(${JSON.stringify(new URL("bin/agdf-mcp.js", root).href)});
`], { encoding: "utf8" });
assert.equal(node18Probe.status, 1);
assert.equal(node18Probe.stdout, "");
assert.equal(node18Probe.stderr, "AGDF_MCP_NODE_UNSUPPORTED\n");

console.log("AGDF MCP package boundary tests passed.");
