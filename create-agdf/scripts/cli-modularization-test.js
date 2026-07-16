import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  commandRegistry,
  renderUsage,
  supportedCommandNames,
  validateCommandOptions,
} from "../lib/cli/command-registry.js";
import { CliUsageError, parseArgs } from "../lib/cli/parse-args.js";
import { runCli } from "../lib/cli/application.js";
import { installClaudeGlobalPlugin, installCodexGlobalPlugin } from "../lib/installers/plugin-installers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const expectedCommands = [
  "codex", "codex-repo", "claude", "copilot", "opencode", "opencode-status",
  "opencode-repo", "both", "init", "config", "doctor", "gate-check",
  "delivery-map", "delivery-path-search", "run-create", "run-migrate",
  "run-render-legacy",
];

assert.deepEqual(supportedCommandNames(), expectedCommands);
assert.equal(new Set(commandRegistry.map(({ name }) => name)).size, expectedCommands.length);
assert.equal(new Set(commandRegistry.map(({ handler }) => handler)).size, expectedCommands.length);

const usage = renderUsage();
for (const command of expectedCommands) assert.match(usage, new RegExp(`(?:^|\\s)${command.replaceAll("-", "\\-")}(?:\\s|$)`));
assert.match(usage, /Preferred AGDF CLI:/);
assert.match(usage, /Scaffold-compatible npm create usage:/);
assert.match(usage, /Backward-compatible create-agdf usage:/);

assert.deepEqual(parseArgs(["--help"]), { kind: "help" });
const languagePreference = (language) => ({ language: language ?? "default" });
const parsed = parseArgs([
  "delivery-path-search", "--dir", "workspace", "--surface", "codex", "--fixture", "fixture.json",
  "--generate-candidates", "--generator-model", "g", "--max-generated-candidates", "3",
  "--generation-timeout-ms", "12000", "--generation-cost-units", "2", "--run", "run-a", "--persist",
], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference });
assert.equal(parsed.kind, "command");
assert.deepEqual(parsed.options, {
  target: "delivery-path-search",
  dir: "/tmp/root/workspace",
  force: false,
  json: false,
  statusCard: false,
  dirExplicit: true,
  language: { language: "default" },
  surface: "codex",
  fixture: "/tmp/root/fixture.json",
  persist: true,
  model: undefined,
  generateCandidates: true,
  runId: "run-a",
  allActive: false,
  generatorModel: "g",
  maxGeneratedCandidates: 3,
  generationTimeoutMs: 12000,
  generationCostUnits: 2,
});

const alias = parseArgs(["--target", "config", "--lang", "de"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference });
assert.equal(alias.options.target, "config");
assert.deepEqual(alias.options.language, { language: "de" });

for (const fixture of [
  [["doctor", "--run"], "Missing value for --run"],
  [["doctor", "--surface", "bad"], "Unsupported surface"],
  [["doctor", "--generation-cost-units", "6"], "must be an integer from 1 to 5"],
  [["doctor", "--unknown"], "Unknown argument"],
  [["missing-command"], "Please choose one target"],
]) {
  assert.throws(() => parseArgs(fixture[0], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference }), (error) => {
    assert.ok(error instanceof CliUsageError);
    assert.match(error.message, new RegExp(fixture[1]));
    return true;
  });
}

assert.doesNotThrow(() => validateCommandOptions({ target: "doctor", allActive: true }));
assert.doesNotThrow(() => validateCommandOptions({ target: "delivery-map", allActive: true }));
assert.throws(() => validateCommandOptions({ target: "gate-check", allActive: true }), /supported only/);
assert.throws(() => validateCommandOptions({ target: "run-create", allActive: false }), /requires --run/);
assert.throws(() => validateCommandOptions({ target: "run-render-legacy" }), /requires --run/);

const bin = readFileSync(join(packageRoot, "bin", "create-agdf.js"), "utf8");
assert.match(bin, /from "\.\.\/lib\/cli\/application\.js"/);
assert.doesNotMatch(bin, /function (parseArgs|evaluateDoctor|evaluateGateCheck|evaluateDeliveryMap|generatedFilesForTarget)/);
assert.ok(bin.split("\n").length < 20, "the executable must remain a thin composition root");

const packageReadme = readFileSync(join(packageRoot, "README.md"), "utf8");
for (const command of ["delivery-map", "delivery-path-search", "run-create", "run-migrate", "run-render-legacy"]) {
  assert.match(packageReadme, new RegExp(`@agdf/cli@latest ${command}`), `package README must route ${command}`);
}
assert.match(packageReadme, /BCP 47 language tag/);

const backlogTemplate = readFileSync(join(packageRoot, "..", "plugin", "control", "templates", "MASTER_BACKLOG.md"), "utf8");
assert.match(backlogTemplate, /create-agdf\/lib\/control-evaluation\/shared\.js/);
assert.doesNotMatch(backlogTemplate, /create-agdf\/bin\/create-agdf\.js/);

const application = readFileSync(join(packageRoot, "lib", "cli", "application.js"), "utf8");
assert.doesNotMatch(application, /process\.(?:exit|exitCode)/);
assert.doesNotMatch(application, /function (evaluateDoctor|evaluateGateCheck|evaluateDeliveryMap|executeDeliveryPathSearch)/);
for (const { handler } of commandRegistry) {
  assert.match(application, new RegExp(`\\["${handler.replaceAll("-", "\\-")}"`), `missing explicit handler ${handler}`);
}

function recordingIo() {
  const out = [];
  const err = [];
  return { out, err, io: { log: (value = "") => out.push(String(value)), error: (value = "") => err.push(String(value)) } };
}

{
  const recording = recordingIo();
  assert.equal(await runCli(["--help"], { io: recording.io }), 0);
  assert.equal(recording.err.length, 0);
  assert.equal(recording.out.join("\n"), usage);
}

{
  const recording = recordingIo();
  assert.equal(await runCli(["missing-command"], { io: recording.io }), 1);
  assert.match(recording.err[0], /Please choose one target/);
  assert.equal(recording.out[0], usage);
}

{
  const recording = recordingIo();
  assert.equal(await runCli(["gate-check", "--all-active"], { io: recording.io }), 1);
  assert.deepEqual(recording.err, ["--all-active is supported only by doctor and delivery-map"]);
}

function installerRecording(outputs) {
  const calls = [];
  const io = recordingIo();
  return {
    calls,
    io,
    exec(command, args, options) {
      calls.push({ command, args, options });
      return outputs.shift() ?? "";
    },
  };
}

{
  const recording = installerRecording(["", "", "", "agdf@agdf 0.9.1\n"]);
  installCodexGlobalPlugin({ exec: recording.exec, io: recording.io.io });
  assert.deepEqual(recording.calls.map(({ command, args }) => [command, args]), [
    ["codex", ["plugin", "marketplace", "add", "arndtgold/ai-native-governance-delivery-framework"]],
    ["codex", ["plugin", "marketplace", "upgrade", "agdf"]],
    ["codex", ["plugin", "add", "agdf", "--marketplace", "agdf"]],
    ["codex", ["plugin", "list"]],
  ]);
  assert.deepEqual(recording.calls.map(({ options }) => options.stdio), ["inherit", "inherit", "inherit", "pipe"]);
}

{
  const recording = installerRecording(["", "", "agdf@agdf 0.9.1\n", "", "agdf@agdf 0.9.1\n"]);
  installClaudeGlobalPlugin({ exec: recording.exec, io: recording.io.io });
  assert.deepEqual(recording.calls[3].args, ["plugin", "update", "agdf@agdf"]);
}

const moduleRoots = ["cli", "installers", "scaffold", "control-evaluation"];
const moduleFiles = moduleRoots.flatMap((directory) =>
  readdirSync(join(packageRoot, "lib", directory))
    .filter((name) => name.endsWith(".js"))
    .map((name) => join(packageRoot, "lib", directory, name))
);
const importGraph = new Map(moduleFiles.map((file) => {
  const source = readFileSync(file, "utf8");
  const imports = [...source.matchAll(/from ["'](\.\.?\/[^"']+)["']/g)]
    .map((match) => join(dirname(file), match[1]))
    .filter((dependency) => moduleFiles.includes(dependency));
  return [file, imports];
}));
function visit(file, visiting = new Set(), visited = new Set()) {
  if (visiting.has(file)) throw new Error(`CLI module import cycle at ${file}`);
  if (visited.has(file)) return;
  visiting.add(file);
  for (const dependency of importGraph.get(file) ?? []) visit(dependency, visiting, visited);
  visiting.delete(file);
  visited.add(file);
}
for (const file of moduleFiles) visit(file);

const ownership = new Map([
  ["transitionDecisionForRunState", "control-evaluation/gate-policy.js"],
  ["evaluateDoctor", "control-evaluation/doctor.js"],
  ["evaluateDeliveryMap", "control-evaluation/delivery-map.js"],
  ["executeDeliveryPathSearch", "cli/delivery-path-search-command.js"],
]);
for (const [symbol, owner] of ownership) {
  const declarations = moduleFiles.filter((file) => new RegExp(`function\\s+${symbol}\\s*\\(`).test(readFileSync(file, "utf8")));
  assert.deepEqual(declarations, [join(packageRoot, "lib", owner)], `${symbol} must have one owner`);
}

console.log("cli modularization tests passed");
