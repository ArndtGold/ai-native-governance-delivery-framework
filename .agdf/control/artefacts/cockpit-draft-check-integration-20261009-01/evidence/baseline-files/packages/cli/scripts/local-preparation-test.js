import { copySourceFixture } from "../../../scripts/support/source-fixture.js";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { COCKPIT_MIME, COCKPIT_UI_URI } from "../../core/lib/control-inspect/cockpit-contract.js";

const repo = fileURLToPath(new URL("../../..", import.meta.url));
const fixture = realpathSync(mkdtempSync(join(tmpdir(), "agdf-local-preparation-")));
const run = (script, ...args) => spawnSync(process.execPath, [join(fixture, "packages", "cli", "scripts", script), ...args], { encoding: "utf8" });
try {
  copySourceFixture(fixture);
  const baselinePath = join(fixture, "plugins", "agdf", "meta", "copilot-payload-baseline.json");
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  baseline.max_bytes = 1;
  writeFileSync(baselinePath, JSON.stringify(baseline));
  const generated = join(fixture, "packages", "cli", "generated");
  const uiRoot = join(fixture, "packages", "control-ui", "dist-mcp");
  // A clean checkout has no ignored UI build; Claude requires verified build bytes.
  rmSync(uiRoot, { recursive: true, force: true });
  for (const surface of ["codex", "claude", "opencode"]) {
    rmSync(generated, { recursive: true, force: true });
    if (surface === "claude") {
      const missingUi = run("prepare-local-plugin.js", surface);
      assert.notEqual(missingUi.status, 0);
      assert.match(missingUi.stderr, /AGDF_COCKPIT_UI_BUILD_REQUIRED/);
      const html = "<!doctype html><title>Local preparation fixture</title>";
      mkdirSync(uiRoot, { recursive: true });
      writeFileSync(join(uiRoot, "cockpit.html"), html);
      writeFileSync(join(uiRoot, "manifest.json"), JSON.stringify({ schema_version: "1", uri: COCKPIT_UI_URI,
        mime_type: COCKPIT_MIME, bytes: Buffer.byteLength(html),
        digest: `sha256:${createHash("sha256").update(html).digest("hex")}` }));
    }
    const result = run("prepare-local-plugin.js", surface);
    assert.equal(result.status, 0, `${surface}: ${result.stdout}\n${result.stderr}`);
    assert.ok(existsSync(join(generated, "plugins", "agdf", "runtime", "agdf-local.js")));
    assert.equal(existsSync(join(generated, "plugins", "copilot")), false);
    assert.equal(existsSync(join(generated, "submissions")), false);
    assert.equal(existsSync(join(generated, ".opencode")), surface === "opencode");
    const packagedUi = join(generated, "plugins", "agdf", "mcp", "server", "ui");
    assert.equal(existsSync(packagedUi), surface === "claude");
    if (surface === "claude") {
      for (const name of ["cockpit.html", "manifest.json"]) {
        assert.deepEqual(readFileSync(join(packagedUi, name)), readFileSync(join(uiRoot, name)));
      }
      rmSync(uiRoot, { recursive: true, force: true });
    }
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
  console.log("local host preparation: isolation, clean bootstrap, runtime validation and release guard passed");
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
