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
import { runValidatorCli } from "../lib/runtime/validator-application.js";
import { pluginDefinition } from "../lib/cli/runtime-context.js";
import { installClaudeGlobalPlugin, installCodexGlobalPlugin } from "../lib/installers/plugin-installers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const expectedCommands = [
  "codex", "codex-repo", "claude", "copilot", "opencode", "opencode-status",
  "status", "disable", "uninstall",
  "opencode-repo", "both", "init", "config", "doctor", "gate-check",
  "delivery-map", "delivery-path-search", "run-create", "run-migrate",
  "run-render-legacy",
];

assert.deepEqual(supportedCommandNames(), expectedCommands);
assert.equal(new Set(commandRegistry.map(({ name }) => name)).size, expectedCommands.length);
assert.equal(new Set(commandRegistry.map(({ handler }) => handler)).size, expectedCommands.length);

const usage = renderUsage();
for (const command of expectedCommands) assert.match(usage, new RegExp(`(?:^|\\s)${command.replaceAll("-", "\\-")}(?:\\s|$)`));
assert.match(usage, /Bootstrap and lifecycle commands:/);
assert.doesNotMatch(usage, /@agdf\/cli@latest (?:doctor|gate-check|delivery-map|delivery-path-search|run-create|run-migrate|run-render-legacy)/);
for (const command of ["doctor", "gate-check", "delivery-map", "delivery-path-search", "run-create", "run-migrate", "run-render-legacy"]) {
  assert.match(usage, new RegExp(`agdf ${command}`), `help must route repeated ${command} use to the local command`);
}
assert.match(usage, /Advanced \/ Compatibility/);
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
  verbose: false,
  statusCard: false,
  approvalEnvelope: false,
  dirExplicit: true,
  language: { language: "default" },
  surface: "codex",
  fixture: "/tmp/root/fixture.json",
  persist: true,
  model: undefined,
  generateCandidates: true,
  runId: "run-a",
  allActive: false,
  scope: undefined,
  confirm: false,
  generatorModel: "g",
  maxGeneratedCandidates: 3,
  generationTimeoutMs: 12000,
  generationCostUnits: 2,
});

const alias = parseArgs(["--target", "config", "--lang", "de"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference });
assert.equal(alias.options.target, "config");
assert.deepEqual(alias.options.language, { language: "de" });
assert.equal(parseArgs(["status", "--verbose"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference }).options.verbose, true);
assert.equal(parseArgs(["gate-check", "--approval-envelope"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference }).options.approvalEnvelope, true);
const uninstallArgs = parseArgs(["uninstall", "--surface", "codex", "--scope", "global", "--confirm"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference });
assert.equal(uninstallArgs.options.scope, "global");
assert.equal(uninstallArgs.options.confirm, true);

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
assert.doesNotThrow(() => validateCommandOptions({ target: "gate-check", approvalEnvelope: true }));
assert.throws(() => validateCommandOptions({ target: "doctor", approvalEnvelope: true }), /supported only/);
assert.throws(() => validateCommandOptions({ target: "gate-check", approvalEnvelope: true, json: true }), /cannot be combined/);
assert.throws(() => validateCommandOptions({ target: "run-create", allActive: false }), /requires --run/);
assert.throws(() => validateCommandOptions({ target: "run-render-legacy" }), /requires --run/);
assert.doesNotThrow(() => validateCommandOptions({ target: "disable", surface: "codex" }));
assert.throws(() => validateCommandOptions({ target: "disable", surface: "generic" }), /explicit --surface/);
assert.throws(() => validateCommandOptions({ target: "uninstall", surface: "codex" }), /--scope global/);
assert.doesNotThrow(() => validateCommandOptions({ target: "uninstall", surface: "codex", scope: "global", confirm: true }));

const bin = readFileSync(join(packageRoot, "bin", "create-agdf.js"), "utf8");
assert.match(bin, /from "\.\.\/lib\/cli\/application\.js"/);
assert.doesNotMatch(bin, /function (parseArgs|evaluateDoctor|evaluateGateCheck|evaluateDeliveryMap|generatedFilesForTarget)/);
assert.ok(bin.split("\n").length < 20, "the executable must remain a thin composition root");

const packageReadme = readFileSync(join(packageRoot, "README.md"), "utf8");
for (const command of ["doctor", "gate-check", "delivery-map", "delivery-path-search", "run-create", "run-migrate", "run-render-legacy"]) {
  assert.match(packageReadme, new RegExp(`agdf ${command}`), `package README must route ${command} locally`);
  assert.doesNotMatch(packageReadme, new RegExp(`@agdf/cli@latest ${command}`), `package README must not require registry access for ${command}`);
}
assert.match(packageReadme, /BCP 47 language tag/);

const backlogTemplate = readFileSync(join(packageRoot, "..", "plugin", "control", "templates", "MASTER_BACKLOG.md"), "utf8");
assert.match(backlogTemplate, /create-agdf\/lib\/control-evaluation\/shared\.js/);
assert.doesNotMatch(backlogTemplate, /create-agdf\/bin\/create-agdf\.js/);

const application = readFileSync(join(packageRoot, "lib", "cli", "application.js"), "utf8");
const validationHandlers = readFileSync(join(packageRoot, "lib", "cli", "validation-handlers.js"), "utf8");
assert.doesNotMatch(application, /process\.(?:exit|exitCode)/);
assert.doesNotMatch(application, /function (evaluateDoctor|evaluateGateCheck|evaluateDeliveryMap|executeDeliveryPathSearch)/);
for (const { handler } of commandRegistry) {
  assert.match(`${application}\n${validationHandlers}`, new RegExp(`\\["${handler.replaceAll("-", "\\-")}"`), `missing explicit handler ${handler}`);
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
  assert.equal(await runCli(["--version", "--json"], { io: recording.io }), 0);
  assert.deepEqual(JSON.parse(recording.out[0]), { name: "create-agdf", version: pluginDefinition.version });
  assert.equal(recording.err.length, 0);
}

{
  const recording = recordingIo();
  assert.equal(await runValidatorCli(["--version", "--json"], { io: recording.io }), 0);
  assert.deepEqual(JSON.parse(recording.out[0]), { name: "create-agdf", version: pluginDefinition.version });
  assert.equal(await runValidatorCli(["codex"], { io: recording.io }), 1);
  assert.match(recording.err.at(-1), /does not support lifecycle command/);
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

const fakeMarketplaceRoot = "/tmp/agdf-test-marketplace";
function prepareMarketplace() {
  return { root: fakeMarketplaceRoot, commit() {}, rollback() {} };
}

{
  const recording = installerRecording(['{"marketplaces":[]}', "", "", `agdf@agdf ${pluginDefinition.version}\n`]);
  const installed = installCodexGlobalPlugin({ exec: recording.exec, prepare: prepareMarketplace });
  assert.deepEqual(recording.calls.map(({ command, args }) => [command, args]), [
    ["codex", ["plugin", "marketplace", "list", "--json"]],
    ["codex", ["plugin", "marketplace", "add", fakeMarketplaceRoot, "--json"]],
    ["codex", ["plugin", "add", "agdf", "--marketplace", "agdf"]],
    ["codex", ["plugin", "list"]],
  ]);
  assert.deepEqual(recording.calls.map(({ options }) => options.stdio), ["pipe", "pipe", "pipe", "pipe"]);
  assert.deepEqual(installed.nativeOutput, []);
}

{
  const quiet = recordingIo();
  const outputs = ['{"marketplaces":[]}', "marketplace added\n", "plugin added\n", `agdf@agdf ${pluginDefinition.version}\n`];
  assert.equal(await runCli(["codex"], { io: quiet.io, exec() { return outputs.shift(); }, prepare: prepareMarketplace }), 0);
  assert.equal(quiet.out.some((line) => line.includes("marketplace added")), false, "successful host details are quiet by default");
  assert.equal(quiet.out[0], "AGDF installation complete");
  assert.equal(quiet.out.at(-1), "Next action: Restart Codex.");
  assert.equal(quiet.out.some((line) => line.includes("codex-repo")), false, "global installation must not route to the repository-local test path");

  const verbose = recordingIo();
  const verboseOutputs = ['{"marketplaces":[]}', "marketplace added\n", "plugin added\n", `agdf@agdf ${pluginDefinition.version}\n`];
  assert.equal(await runCli(["codex", "--verbose"], { io: verbose.io, exec() { return verboseOutputs.shift(); }, prepare: prepareMarketplace }), 0);
  assert.equal(verbose.out.includes("Host command output:"), true);
  assert.equal(verbose.out.some((line) => line.includes("marketplace added")), true);
}

{
  const quiet = recordingIo();
  const outputs = ["[]", "", "", "", "", `agdf@agdf ${pluginDefinition.version}\n`];
  assert.equal(await runCli(["claude"], { io: quiet.io, exec() { return outputs.shift(); }, prepare: prepareMarketplace }), 0);
  assert.equal(quiet.out.at(-1), "Next action: Restart Claude Code.");
  assert.equal(quiet.out.some((line) => line.includes("new session")), false, "global installation must not add a second post-restart action");
}

{
  const recording = installerRecording(["[]", "", "", `agdf@agdf ${pluginDefinition.version}\n`, "", `agdf@agdf ${pluginDefinition.version}\n`]);
  installClaudeGlobalPlugin({ exec: recording.exec, prepare: prepareMarketplace });
  assert.deepEqual(recording.calls[4].args, ["plugin", "update", "agdf@agdf"]);
}

{
  let call = 0;
  assert.throws(() => installClaudeGlobalPlugin({
    prepare: prepareMarketplace,
    exec() {
      call += 1;
      if (call === 2) throw Object.assign(new Error("marketplace failed"), { stderr: "Git executable is missing or unsafe" });
      return call === 1 ? "[]" : "";
    },
  }), (error) => {
    assert.equal(error.phase, "marketplace");
    assert.match(error.message, /Git executable is missing or unsafe/);
    assert.doesNotMatch(error.message, /Claude Code CLI is installed/);
    return true;
  });
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
