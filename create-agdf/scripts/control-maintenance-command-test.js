import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { PassThrough } from "node:stream";
import { parseArgs } from "../lib/cli/parse-args.js";
import { validateCommandOptions } from "../lib/cli/command-registry.js";
import { executeControlMaintenance } from "../lib/cli/control-maintenance-command.js";
import { repository, addRun, treeDigest } from "./control-maintenance-fixtures.js";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const base = mkdtempSync(join(tmpdir(), "agdf-maintenance-command-"));
const options = (...args) => validateCommandOptions(parseArgs(["control-maintenance", ...args]).options);
try {
  for (const args of [[], ["--dir", "relative"], ["--dir", base, "--guided", "--json"], ["--dir", base, "--guided", "--details"], ["--dir", base, "--confirm"]]) {
    assert.throws(() => options(...args));
  }
  assert.throws(() => validateCommandOptions(parseArgs(["doctor", "--guided"]).options));
  const a = repository(base, "root A ' $ special");
  addRun(a, "old");
  const b = repository(base, "root B"); addRun(b, "current", { sealed: true });
  const beforeA = treeDigest(a), beforeB = treeDigest(b);
  for (const entrypoint of ["create-agdf/bin/create-agdf.js", "create-agdf/bin/agdf-validator.js"]) {
    for (const root of [a, b]) {
      const child = spawnSync(process.execPath, [resolve(repoRoot, entrypoint), "control-maintenance", "--dir", root, "--json"], { cwd: b, encoding: "utf8", timeout: 10000 });
      assert.equal(child.status, root === a ? 2 : 0, child.stderr);
      const report = JSON.parse(child.stdout);
      assert.equal(report.target, root); assert.equal(report.operation, "inspect");
      assert.equal(report.compatibility.status, root === a ? "migration_required" : "current");
    }
  }
  assert.equal(treeDigest(a), beforeA); assert.equal(treeDigest(b), beforeB);
  const logs = [], errors = [];
  const io = { log: (value) => logs.push(value), error: (value) => errors.push(value) };
  assert.equal(await executeControlMaintenance(options("--dir", a, "--guided"), io, { interactive: false }), 1);
  assert.equal(treeDigest(a), beforeA);
  for (const input of [["3", "bad", "2"], [""], [null]]) {
    const choices = [...input]; logs.length = 0;
    assert.equal(await executeControlMaintenance(options("--dir", a, "--guided", "--language", "de"), io, { interactive: true, readChoice: async () => choices.shift() }), 0);
    assert.equal(treeDigest(a), beforeA);
    assert.ok(logs.join("\n").includes(a));
  }
  // A real stream EOF resolves the question and produces the deferred result.
  const input = new PassThrough(), output = new PassThrough();
  const execution = executeControlMaintenance(options("--dir", a, "--guided"), io, { interactive: true, input, output });
  input.end();
  assert.equal(await execution, 0);
  assert.equal(treeDigest(a), beforeA);
  const choices = ["1", "1"];
  assert.equal(await executeControlMaintenance(options("--dir", a, "--guided"), io, { interactive: true, readChoice: async () => choices.shift() }), 0);
  assert.notEqual(treeDigest(a), beforeA); assert.equal(treeDigest(b), beforeB);

  // Validate actual generated full-runtime execution separately from source CLI behavior.
  for (const [plugin, surfaces] of [["create-agdf/generated/plugins/agdf", ["codex", "claude", "opencode"]], ["create-agdf/generated/plugins/copilot/agdf", ["copilot"]]]) {
    const pluginRoot = resolve(repoRoot, plugin), entrypoint = join(pluginRoot, "runtime/agdf-local.js");
    assert.ok(existsSync(entrypoint));
    const bundledLib = join(pluginRoot, "runtime/create-agdf/lib");
    for (const excluded of ["install-setup", "marketplace"]) assert.equal(existsSync(join(bundledLib, excluded)), false);
    if (surfaces.includes("copilot")) assert.equal(existsSync(join(bundledLib, "mcp-lifecycle")), false);
    // Shared Claude runtime already bundles its native MCP support. Maintenance
    // adds no dependency on configuration/installation services in any profile.
    for (const file of readdirSync(join(bundledLib, "control-maintenance"))) {
      const imports = readFileSync(join(bundledLib, "control-maintenance", file), "utf8").match(/^import .*$/gmu) ?? [];
      assert.doesNotMatch(imports.join("\n"), /install-setup|marketplace|mcp-lifecycle|runtime-check-consent/u);
    }
    assert.deepEqual(readdirSync(join(bundledLib, "runtime-check-consent")), ["contract.js"], "only read-only consent contract is bundled");
    for (const surface of surfaces) {
      const child = spawnSync(process.execPath, [entrypoint, "control-maintenance", "--dir", b, "--json"], {
        cwd: base, encoding: "utf8", timeout: 10000,
        env: { ...process.env, AGDF_SURFACE: surface, PLUGIN_ROOT: pluginRoot, CLAUDE_PLUGIN_ROOT: pluginRoot, AGDF_DATA_DIR: join(base, "data") },
      });
      assert.equal(child.status, 0, child.stderr || child.stdout);
      assert.equal(JSON.parse(child.stdout).compatibility.status, "current");
    }
  }
  assert.equal(existsSync(resolve(repoRoot, "create-agdf/generated/submissions/openai/agdf/runtime/agdf-local.js")), false,
    "reference-only public submission does not pretend to provide a runtime");
  assert.equal(treeDigest(b), beforeB);
  console.log("Control maintenance source/generated command tests passed.");
} finally { rmSync(base, { recursive: true, force: true }); }
