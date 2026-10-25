import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { npmInvocation } from "../../cli/lib/installers/npm-invocation.js";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
const lock = JSON.parse(readFileSync(new URL("package-lock.json", root), "utf8"));
const dispatcherManifest = JSON.parse(readFileSync(new URL("../../cli/package.json", import.meta.url), "utf8"));
const capability = JSON.parse(readFileSync(new URL("../../../plugins/agdf/meta/agdf-mcp-capability.json", import.meta.url), "utf8"));

assert.equal(manifest.name, "@agdf/mcp-server");
assert.equal(manifest.version, dispatcherManifest.version);
assert.equal(manifest.engines.node, ">=22");
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
// Repository consumers install the self-contained Core projection produced by assembly.
// The published dependency remains version-pinned; it must not acquire a checkout path.
assert.equal(lock.packages["node_modules/create-agdf"].resolved, "file:../../dist/npm/create-agdf");
// Windows file modes carry no execute bits; npm creates the bin shim there instead.
if (process.platform !== "win32") assert.equal(statSync(new URL("bin/agdf-mcp.js", root)).mode & 0o111, 0o111);
assert.equal(capability.release_version, manifest.version);
assert.equal(capability.schema_version, 2);
assert.equal(capability.tool.name, "agdf_dispatch");
assert.equal(capability.tool.semantic_owner, "packages/core/lib/skill-dispatch/contract.js");
assert.equal(capability.tool.authorizes, false);
const { SKILL_DISPATCH_FUNCTION_DEFINITION } = await import('../../cli/lib/mcp-dispatch-runtime.js');
assert.equal(capability.tool.read_only, SKILL_DISPATCH_FUNCTION_DEFINITION.annotations.readOnlyHint);
assert.equal(capability.package.sdk_server, manifest.dependencies["@modelcontextprotocol/server"]);
assert.equal(capability.transport.kind, "stdio");
assert.deepEqual(capability.transport.compatibility_protocols, ["2025-11-25"]);
assert.equal(capability.distribution.public_skills_only_candidate, "excluded");
assert.deepEqual(new Set(Object.values(capability.host_support)), new Set(["unverified"]));
assert.equal(capability.lifecycle.result_contract_version, 2);
assert.deepEqual(Object.keys(capability.lifecycle.adapters).sort(), ["claude", "codex", "copilot", "opencode"]);
assert.match(readFileSync(new URL("bin/agdf-mcp.js", root), "utf8"), /"copilot"/);

const npmCache = mkdtempSync(join(tmpdir(), "agdf-mcp-npm-cache-"));
let packed;
try {
  const pack = npmInvocation(["pack", "--dry-run", "--json", "--ignore-scripts"]);
  const report = JSON.parse(execFileSync(pack.executable, pack.args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, npm_config_cache: npmCache },
  }));
  packed = Array.isArray(report) ? report[0] : report[manifest.name];
} finally {
  rmSync(npmCache, { recursive: true, force: true });
}
assert.ok(Array.isArray(packed?.files), "npm pack must report the package file inventory");
const paths = packed.files.map((file) => file.path);
for (const required of ["bin/agdf-mcp.js", "src/main.js", "src/server.js", "src/worker.js", "src/worker-entry.js", "README.md", "LICENSE", "NOTICE", "package.json"]) {
  assert.ok(paths.includes(required), `packed server is missing ${required}`);
}
assert.equal(paths.some((path) => path.startsWith("test/")), false);
assert.equal(paths.some((path) => path.includes("node_modules")), false);

const node18Probe = spawnSync(process.execPath, ["--input-type=module", "--eval", `
Object.defineProperty(process.versions, "node", { value: "18.20.8" });
process.argv = [process.execPath, ${JSON.stringify(fileURLToPath(new URL("bin/agdf-mcp.js", root)))}, "--surface", "codex"];
await import(${JSON.stringify(new URL("bin/agdf-mcp.js", root).href)});
`], { encoding: "utf8" });
assert.equal(node18Probe.status, 1);
assert.equal(node18Probe.stdout, "");
assert.equal(node18Probe.stderr, "AGDF_MCP_NODE_UNSUPPORTED\n");

console.log("AGDF MCP package boundary tests passed.");

// Execute the exact npm archives, not a source-only projection. The existing
// fixture supplies only the pinned SDK dependency and ownership marker.
const { mkdirSync } = await import('node:fs');
const { createOwnedRuntimeFixture } = await import('./owned-runtime.js');
const { withStdioClient, unresolvedArguments } = await import('./helpers.js');
const packedRoot = mkdtempSync(join(tmpdir(), 'agdf-error-packed-'));
try {
  const unpacked = [];
  for (const name of ['create-agdf', 'agdf-mcp-server']) {
    const invocation = npmInvocation(['pack', '--json', '--ignore-scripts', '--pack-destination', packedRoot]);
    const reports = JSON.parse(execFileSync(invocation.executable, invocation.args, {
      cwd: fileURLToPath(new URL(`../../../dist/npm/${name}/`, import.meta.url)), encoding: 'utf8',
      env: { ...process.env, npm_config_cache: join(packedRoot, 'cache') }, stdio: ['ignore', 'pipe', 'pipe'],
    }));
    const destination = join(packedRoot, name); mkdirSync(destination);
    const report = Array.isArray(reports) ? reports[0] : reports[name === 'create-agdf' ? 'create-agdf' : '@agdf/mcp-server'];
    assert.equal(typeof report?.filename, 'string', 'npm pack must report its archive filename');
    execFileSync('tar', ['-xzf', report.filename, '--strip-components=1', '-C', name], { cwd: packedRoot });
    unpacked.push(destination);
  }
  const owned = createOwnedRuntimeFixture({ dispatcherSourceRoot: unpacked[0], candidateServerRoot: unpacked[1] });
  try {
    assert.ok(readFileSync(join(owned.dispatcherRoot, 'runtime/core/lib/mcp-tool-errors.js'), 'utf8').includes('agdf-tool-result/1'));
    await withStdioClient(owned, async client => {
      const error = await client.callTool({ name: 'agdf_dispatch', arguments: unresolvedArguments });
      assert.equal(error.isError, true); assert.equal(error.content.length, 2);
      assert.equal(error.structuredContent.runtime.provenance_status, 'matched');
      assert.equal(error.structuredContent.outcome, 'target_unresolved');
      assert.equal(error._meta?.['agdf/tool-result'], undefined);
      const ok = await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'doctor', presentation_language: 'en',
        working_directory: owned.governanceTarget, primary_target: owned.governanceTarget, target_source: 'explicit_target' } });
      assert.equal(ok.isError, undefined); assert.equal(ok.content.length, 1);
      assert.equal(ok.structuredContent.outcome, 'inspect_result');
    });
  } finally { owned.dispose(); }
  console.log('Exact packed CLI/MCP archives: matched owned SDK/stdio error and success smoke passed.');
} finally { rmSync(packedRoot, { recursive: true, force: true }); }
