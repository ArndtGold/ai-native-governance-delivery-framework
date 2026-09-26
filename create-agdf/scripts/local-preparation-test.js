import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const repo = fileURLToPath(new URL("../..", import.meta.url));
const fixture = realpathSync(mkdtempSync(join(tmpdir(), "agdf-local-preparation-")));
const run = (script, ...args) => spawnSync(process.execPath, [join(fixture, "create-agdf", "scripts", script), ...args], { encoding: "utf8" });
try {
  cpSync(join(repo, "plugin"), join(fixture, "plugin"), { recursive: true });
  cpSync(join(repo, "LICENSE"), join(fixture, "LICENSE"));
  mkdirSync(join(fixture, "create-agdf"));
  for (const entry of ["scripts", "lib", "bin", "package.json", "NOTICE"]) {
    cpSync(join(repo, "create-agdf", entry), join(fixture, "create-agdf", entry), { recursive: true });
  }
  // The runtime plugin ships the MCP server files its plugin-local launcher installs.
  for (const entry of ["bin", "src", "package.json", "README.md", "NOTICE"]) {
    cpSync(join(repo, "agdf-mcp-server", entry), join(fixture, "agdf-mcp-server", entry), { recursive: true });
  }
  const baselinePath = join(fixture, "plugin", "meta", "copilot-payload-baseline.json");
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  baseline.max_bytes = 1;
  writeFileSync(baselinePath, JSON.stringify(baseline));
  const generated = join(fixture, "create-agdf", "generated");
  for (const surface of ["codex", "claude", "opencode"]) {
    rmSync(generated, { recursive: true, force: true });
    const result = run("prepare-local-plugin.js", surface);
    assert.equal(result.status, 0, `${surface}: ${result.stdout}\n${result.stderr}`);
    assert.ok(existsSync(join(generated, "plugins", "agdf", "runtime", "agdf-local.js")));
    assert.equal(existsSync(join(generated, "plugins", "copilot")), false);
    assert.equal(existsSync(join(generated, "submissions")), false);
    assert.equal(existsSync(join(generated, ".opencode")), surface === "opencode");
  }
  for (const [script, args] of [["prepare-local-plugin.js", ["copilot"]], ["sync-package-assets.js", []]]) {
    const result = run(script, ...args);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /AGDF_COPILOT_PAYLOAD_GROWTH/);
  }
  // A reviewed valid Copilot baseline must still produce a verifiable local profile.
  baseline.max_bytes = 10000000;
  writeFileSync(baselinePath, JSON.stringify(baseline));
  const copilot = run("prepare-local-plugin.js", "copilot");
  assert.equal(copilot.status, 0, copilot.stderr);
  assert.notEqual(run("prepare-local-plugin.js", "unknown").status, 0);
  // Exercise the installation wrapper with real preparation, stopping before host mutation.
  baseline.max_bytes = 1;
  writeFileSync(baselinePath, JSON.stringify(baseline));
  rmSync(generated, { recursive: true, force: true });
  const wrapperUrl = pathToFileURL(join(fixture, "create-agdf", "scripts", "install-local-plugin.js")).href;
  const wrapper = spawnSync(process.execPath, ["--input-type=module", "-e", `
    import assert from "node:assert/strict";
    import { installLocalPlugin } from ${JSON.stringify(wrapperUrl)};
    let calls = 0;
    const result = await installLocalPlugin("codex", {
      env: {}, cwd: ${JSON.stringify(fixture)}, dataRoot: ${JSON.stringify(join(fixture, "data"))},
      async runCli(args) { assert.deepEqual(args, ["codex"]); calls++; return 0; },
    });
    assert.equal(result, 0);
    assert.equal(calls, 1);
  `], { encoding: "utf8" });
  assert.equal(wrapper.status, 0, wrapper.stderr);
  assert.equal(existsSync(join(generated, "plugins", "copilot")), false);
  console.log("local host preparation: isolation, clean bootstrap, runtime validation and release guard passed");
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
