import { copySourceFixture } from "../../../scripts/support/source-fixture.js";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const repo = fileURLToPath(new URL("../../..", import.meta.url));
// Expand Windows 8.3 temp aliases so Vite's real file names share the same root.
const fixture = realpathSync.native(mkdtempSync(join(tmpdir(), "agdf-local-preparation-")));
const run = (script, ...args) => spawnSync(process.execPath, [join(fixture, "packages", "cli", "scripts", script), ...args], { encoding: "utf8" });
try {
  copySourceFixture(fixture);
  // Exercise the canonical UI build offline with the separately locked UI dependencies.
  cpSync(join(repo, "packages", "control-ui", "node_modules"), join(fixture, "packages", "control-ui", "node_modules"), {
    recursive: true, dereference: true,
  });
  const baselinePath = join(fixture, "plugins", "agdf", "meta", "copilot-payload-baseline.json");
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  baseline.max_bytes = 1;
  writeFileSync(baselinePath, JSON.stringify(baseline));
  const generated = join(fixture, "packages", "cli", "generated");
  const uiRoot = join(fixture, "packages", "control-ui", "dist-mcp");
  const builtUiRoot = join(repo, "packages", "control-ui", "dist-mcp");
  // Every host requires Decision UI; normal Codex and Claude also require Cockpit UI.
  rmSync(uiRoot, { recursive: true, force: true });
  const missingDecisionUi = run("prepare-local-plugin.js", "codex");
  assert.equal(missingDecisionUi.status, 0, missingDecisionUi.stderr);
  const decisionManifestPath = join(uiRoot, "decision-manifest.json");
  const firstDigest = JSON.parse(readFileSync(decisionManifestPath, "utf8")).source_digest;
  const currentBuildTime = statSync(decisionManifestPath).mtimeMs;
  const reused = run("prepare-local-plugin.js", "codex");
  assert.equal(reused.status, 0, reused.stderr);
  assert.equal(statSync(decisionManifestPath).mtimeMs, currentBuildTime, "current resources must not be rebuilt");
  const uiSourcePath = join(fixture, "packages", "control-ui", "src", "mcp", "decision-bootstrap.ts");
  const originalUiSource = readFileSync(uiSourcePath, "utf8");
  writeFileSync(uiSourcePath, originalUiSource + "\n// Changed source identity for local preparation regression.\n");
  const stale = run("prepare-local-plugin.js", "codex");
  assert.equal(stale.status, 0, stale.stderr);
  assert.notEqual(JSON.parse(readFileSync(decisionManifestPath, "utf8")).source_digest, firstDigest,
    "a changed UI source must rebuild resources instead of packaging the old source binding");
  // Restore the source and its build before exercising the unchanged surface matrix.
  writeFileSync(uiSourcePath, originalUiSource);
  const restored = run("prepare-local-plugin.js", "codex");
  assert.equal(restored.status, 0, restored.stderr);
  const decisionHtmlPath = join(uiRoot, "decision.html");
  const validDecisionHtml = readFileSync(decisionHtmlPath);
  writeFileSync(decisionHtmlPath, "corrupt resource");
  const corrupted = run("prepare-local-plugin.js", "codex");
  assert.equal(corrupted.status, 0, corrupted.stderr);
  assert.deepEqual(readFileSync(decisionHtmlPath), validDecisionHtml, "corrupt output must be rebuilt");
  for (const surface of ["codex", "claude", "opencode"]) {
    rmSync(generated, { recursive: true, force: true });
    const hasCockpit = ["codex", "claude"].includes(surface);
    if (hasCockpit) {
      const missingUi = run("prepare-local-plugin.js", surface);
      assert.equal(missingUi.status, 0, missingUi.stderr);
    }
    const result = run("prepare-local-plugin.js", surface);
    assert.equal(result.status, 0, `${surface}: ${result.stdout}\n${result.stderr}`);
    assert.ok(existsSync(join(generated, "plugins", "agdf", "runtime", "agdf-local.js")));
    assert.equal(existsSync(join(generated, "plugins", "copilot")), false);
    assert.equal(existsSync(join(generated, "submissions")), false);
    assert.equal(existsSync(join(generated, ".opencode")), surface === "opencode");
    const packagedUi = join(generated, "plugins", "agdf", "mcp", "server", "ui");
    assert.ok(existsSync(packagedUi));
    for (const name of ["decision.html", "decision-manifest.json"])
      assert.deepEqual(readFileSync(join(packagedUi, name)), readFileSync(join(uiRoot, name)));
    assert.equal(existsSync(join(packagedUi, "cockpit.html")), hasCockpit);
    if (hasCockpit) {
      for (const name of ["cockpit.html", "manifest.json"]) {
        assert.deepEqual(readFileSync(join(packagedUi, name)), readFileSync(join(uiRoot, name)));
      }
      for (const name of ["cockpit.html", "manifest.json"]) rmSync(join(uiRoot, name));
    }
  }
  // All-host generation must reach the Copilot budget guard with valid Codex UI inputs.
  for (const name of ["cockpit.html", "manifest.json"])
    cpSync(join(builtUiRoot, name), join(uiRoot, name));
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
  const wrapperUrl = pathToFileURL(join(fixture, "packages", "cli", "scripts", "install-local-plugin.js")).href;
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
  // Invalid output paths must never turn automatic rebuilding into writes through links.
  const savedUiRoot = join(fixture, "saved-ui");
  renameSync(uiRoot, savedUiRoot);
  symlinkSync(savedUiRoot, uiRoot, "junction");
  try {
    const linked = run("prepare-local-plugin.js", "codex");
    assert.notEqual(linked.status, 0);
    assert.match(linked.stderr, /AGDF_UI_BUILD_PATH_INVALID/);
    assert.deepEqual(readFileSync(join(savedUiRoot, "decision.html")), validDecisionHtml);
  } finally {
    rmSync(uiRoot);
    renameSync(savedUiRoot, uiRoot);
  }
  // Build failures and successful no-op builds stop before generation or host mutation.
  const builderPath = join(fixture, "packages", "control-ui", "scripts", "build-mcp.mjs");
  const originalBuilder = readFileSync(builderPath);
  rmSync(generated, { recursive: true, force: true });
  try {
    writeFileSync(builderPath, 'throw new Error("local-ui-build-failure-canary");\n');
    const failedWrapper = spawnSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict";
      import { installLocalPlugin } from ${JSON.stringify(wrapperUrl)};
      let hostCalls = 0;
      await assert.rejects(() => installLocalPlugin("codex", {
        env: {}, cwd: ${JSON.stringify(fixture)},
        async runCli() { hostCalls++; return 0; },
      }), (error) => {
        assert.match(error.message, /AGDF_UI_BUILD_FAILED/);
        assert.match(error.message, /local-ui-build-failure-canary/);
        assert.match(error.message, /npm --prefix packages\\/control-ui ci --ignore-scripts/);
        return true;
      });
      assert.equal(hostCalls, 0);
    `], { encoding: "utf8" });
    assert.equal(failedWrapper.status, 0, failedWrapper.stderr);
    assert.equal(existsSync(generated), false, "a failed build must stop before generation");
    writeFileSync(builderPath, '// Intentionally produce no fresh UI resources.\n');
    const noOutput = run("prepare-local-plugin.js", "codex");
    assert.notEqual(noOutput.status, 0);
    assert.match(noOutput.stderr, /AGDF_DECISION_UI_INVALID/);
    assert.equal(existsSync(generated), false, "a successful command with stale output must stop before generation");
  } finally {
    writeFileSync(builderPath, originalBuilder);
  }
  console.log("local host preparation: UI rebuild/reuse/failure safety, isolation, runtime validation and release guard passed");
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
