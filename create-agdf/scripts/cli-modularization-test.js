import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { PassThrough } from "node:stream";
import { fileURLToPath } from "node:url";
import {
  commandRegistry,
  renderUsage,
  supportedCommandNames,
  validateCommandOptions,
} from "../lib/cli/command-registry.js";
import { CliUsageError, parseArgs } from "../lib/cli/parse-args.js";
import { askRuntimeCheckDecisionByKey, runCli } from "../lib/cli/application.js";
import { runValidatorCli } from "../lib/runtime/validator-application.js";
import { generatedRoot, pluginDefinition } from "../lib/cli/runtime-context.js";
import { installClaudeGlobalPlugin, installCodexGlobalPlugin } from "../lib/installers/plugin-installers.js";
import { digestNormalizedPluginSource } from "../lib/runtime/plugin-provenance.js";
import { persistInstallConsent, runtimeCheckStatus } from "../lib/runtime-check-consent/service.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const expectedCommands = [
  "codex", "codex-repo", "claude", "copilot", "opencode", "opencode-status",
  "status", "runtime-checks", "mcp", "disable", "uninstall",
  "opencode-repo", "init", "config", "target-check", "skill-dispatch", "doctor", "gate-check",
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
  languageExplicit: false,
  surface: "codex",
  surfaceExplicit: true,
  skillId: undefined,
  fixture: "/tmp/root/fixture.json",
  persist: true,
  model: undefined,
  generateCandidates: true,
  runId: "run-a",
  allActive: false,
  scope: undefined,
  confirm: false,
  shared: false,
  runtimeChecksDecision: undefined,
  runtimeChecksAction: "status",
  mcpAction: undefined,
  generatorModel: "g",
  maxGeneratedCandidates: 3,
  generationTimeoutMs: 12000,
  generationCostUnits: 2,
  targetSource: undefined,
  primaryTarget: undefined,
  workingDirectory: "/tmp/root",
  workingDirectoryExplicit: false,
  targetChanged: false,
  targetCandidates: [],
  evidenceSources: [],
});

const alias = parseArgs(["--target", "config", "--lang", "de"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference });
assert.equal(alias.options.target, "config");
assert.deepEqual(alias.options.language, { language: "de" });
assert.equal(parseArgs(["status", "--verbose"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference }).options.verbose, true);
assert.equal(parseArgs(["runtime-checks", "enable", "--surface", "claude"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference }).options.runtimeChecksAction, "enable");
const mcpArgs = parseArgs(["mcp", "enable", "--surface", "codex", "--scope", "project", "--dir", "/tmp/repo"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference });
assert.equal(mcpArgs.options.mcpAction, "enable");
assert.equal(mcpArgs.options.scope, "project");
assert.doesNotThrow(() => validateCommandOptions(mcpArgs.options));
assert.equal(parseArgs(["claude", "--runtime-checks", "manual"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference }).options.runtimeChecksDecision, "manual");
assert.equal(parseArgs(["gate-check", "--approval-envelope"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference }).options.approvalEnvelope, true);
const targetCheck = parseArgs([
  "target-check", "--json", "--target-source", "continued_target", "--primary-target", "/tmp/repo",
  "--working-directory", "/tmp/chat", "--target-candidate", "/tmp/repo", "--evidence-source", "request", "--target-changed",
], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference });
assert.equal(targetCheck.options.targetSource, "continued_target");
assert.equal(targetCheck.options.primaryTarget, "/tmp/repo");
assert.equal(targetCheck.options.workingDirectory, "/tmp/chat");
assert.equal(targetCheck.options.workingDirectoryExplicit, true);
assert.deepEqual(targetCheck.options.targetCandidates, ["/tmp/repo"]);
assert.deepEqual(targetCheck.options.evidenceSources, ["request"]);
assert.equal(targetCheck.options.targetChanged, true);
const skillDispatch = parseArgs([
  "skill-dispatch", "--json", "--skill", "qa-gate", "--surface", "copilot", "--language", "de",
  "--working-directory", "/tmp/chat", "--target-source", "continued_target", "--primary-target", "/tmp/repo", "--run", "delivery-run",
], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference });
assert.equal(skillDispatch.options.skillId, "qa-gate");
assert.equal(skillDispatch.options.surfaceExplicit, true);
assert.equal(skillDispatch.options.languageExplicit, true);
assert.doesNotThrow(() => validateCommandOptions(skillDispatch.options));
const uninstallArgs = parseArgs(["uninstall", "--surface", "codex", "--scope", "global", "--confirm"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference });
assert.equal(uninstallArgs.options.scope, "global");
assert.equal(uninstallArgs.options.confirm, true);
const sharedDisableArgs = parseArgs(["disable", "--surface", "copilot", "--scope", "repository", "--shared"], { cwd: "/tmp/root", resolveLanguagePreference: languagePreference });
assert.equal(sharedDisableArgs.options.shared, true);

for (const fixture of [
  [["doctor", "--run"], "Missing value for --run"],
  [["doctor", "--surface", "bad"], "Unsupported surface"],
  [["doctor", "--generation-cost-units", "6"], "must be an integer from 1 to 5"],
  [["doctor", "--unknown"], "Unknown argument"],
  [["missing-command"], "Please choose one target"],
  [["copilot-plugin"], "Please choose one target"],
  [["both"], "Please choose one target"],
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
assert.doesNotThrow(() => validateCommandOptions({ target: "target-check", json: true }));
assert.throws(() => validateCommandOptions({ target: "target-check", json: false }), /requires --json/);
assert.throws(() => validateCommandOptions({ target: "doctor", primaryTarget: "/tmp/repo" }), /only by target-check and skill-dispatch/);
assert.throws(() => validateCommandOptions({ target: "doctor", workingDirectoryExplicit: true }), /only by target-check and skill-dispatch/);
assert.throws(() => validateCommandOptions({ target: "skill-dispatch", json: true, skillId: "gate-check", surface: "codex", surfaceExplicit: true, languageExplicit: true }), /requires --working-directory/);
assert.throws(() => validateCommandOptions({ target: "doctor", skillId: "gate-check" }), /--skill is supported only/);
assert.throws(() => validateCommandOptions({ target: "doctor", approvalEnvelope: true }), /supported only/);
assert.throws(() => validateCommandOptions({ target: "gate-check", approvalEnvelope: true, json: true }), /cannot be combined/);
assert.throws(() => validateCommandOptions({ target: "run-create", allActive: false }), /requires --run/);
assert.throws(() => validateCommandOptions({ target: "run-render-legacy" }), /requires --run/);
assert.doesNotThrow(() => validateCommandOptions({ target: "disable", surface: "codex" }));
assert.throws(() => validateCommandOptions({ target: "disable", surface: "copilot" }), /requires explicit --scope repository/);
assert.doesNotThrow(() => validateCommandOptions({ target: "disable", surface: "copilot", scope: "repository", shared: true }));
for (const options of [
  { target: "disable", surface: "codex", scope: "repository", shared: true },
  { target: "disable", surface: "claude", scope: "repository", shared: true },
  { target: "disable", surface: "opencode", scope: "repository", shared: true },
  { target: "disable", surface: "copilot", shared: true },
  { target: "uninstall", surface: "copilot", scope: "global", shared: true },
  { target: "status", surface: "copilot", shared: true },
]) assert.throws(() => validateCommandOptions(options), /--shared is supported only/);
assert.match(usage, /disable --surface <surface> \[--scope repository\] \[--shared\]/);
assert.match(usage, /--shared\s+Apply Copilot repository disable/);
assert.throws(() => validateCommandOptions({ target: "disable", surface: "generic" }), /explicit --surface/);
assert.throws(() => validateCommandOptions({ target: "uninstall", surface: "codex" }), /--scope global/);
assert.doesNotThrow(() => validateCommandOptions({ target: "uninstall", surface: "codex", scope: "global", confirm: true }));
assert.doesNotThrow(() => validateCommandOptions({ target: "runtime-checks", surface: "claude" }));
assert.throws(() => validateCommandOptions({ target: "runtime-checks", surface: "generic" }), /requires --surface/);
assert.throws(() => validateCommandOptions({ target: "mcp", mcpAction: "enable", surface: "codex", surfaceExplicit: true }), /explicit --dir/);
assert.throws(() => validateCommandOptions({ target: "mcp", mcpAction: "enable", surface: "copilot", surfaceExplicit: true, dirExplicit: true }), /codex, claude or opencode/);
assert.throws(() => validateCommandOptions({ target: "codex", scope: "project" }), /only by mcp/);
for (const command of ["codex-repo", "opencode-repo"]) {
  assert.throws(() => validateCommandOptions({ target: command, dirExplicit: false }), /requires an explicit --dir/);
  assert.doesNotThrow(() => validateCommandOptions({ target: command, dirExplicit: true }));
  assert.match(usage, new RegExp(`${command} --dir <path>`));

  const target = mkdtempSync(join(tmpdir(), `agdf-${command}-missing-dir-`));
  const before = readdirSync(target);
  const recording = recordingIo();
  assert.equal(await runCli([command], { parser: { cwd: target }, io: recording.io }), 1);
  assert.deepEqual(readdirSync(target), before, `${command} without --dir must not mutate parser cwd`);
  assert.match(recording.err[0], /requires an explicit --dir/);
}

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

const repositoryRoot = join(packageRoot, "..");
for (const [label, content] of [
  ["root README", readFileSync(join(repositoryRoot, "README.md"), "utf8")],
  ["installation guide", readFileSync(join(repositoryRoot, "INSTALL.md"), "utf8")],
  ["package README", packageReadme],
]) {
  for (const required of [
    "disable --surface copilot --scope repository",
    "disable --surface copilot --scope repository --shared",
    ".github/copilot/settings.local.json",
    ".github/copilot/settings.json",
    "Claude Code",
    "GitHub Copilot",
    "OpenCode",
  ]) assert.ok(content.includes(required), `${label} must document ${required}`);
  assert.ok(content.includes("AGENTS.md"), `${label} must preserve the independent-instructions boundary`);
}

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
    ["codex", ["plugin", "add", "agdf@agdf", "--json"]],
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
  assert.equal(quiet.out[0], "AGDF installed for Codex");
  assert.equal(quiet.out[1], "Operation: lifecycle.plugin.install.codex (succeeded; global)");
  assert.equal(quiet.out[2], `Version: ${pluginDefinition.version} (verified)`);
  assert.match(quiet.out.at(-1), /^Next: Fully restart Codex, then start a fresh session\./);
  assert.match(quiet.out.at(-1), /Restoring the previous session can retain stale AGDF skills/);
  assert.equal(quiet.out.some((line) => line.includes("codex-repo")), false, "global installation must not route to the repository-local test path");

  const verbose = recordingIo();
  const verboseOutputs = ['{"marketplaces":[]}', "marketplace added\n", "plugin added\n", `agdf@agdf ${pluginDefinition.version}\n`];
  assert.equal(await runCli(["codex", "--verbose"], { io: verbose.io, exec() { return verboseOutputs.shift(); }, prepare: prepareMarketplace }), 0);
  assert.equal(verbose.out.includes("Host command output:"), true);
  assert.equal(verbose.out.some((line) => line.includes("marketplace added")), true);
}

{
  const cancelled = installerRecording([]);
  assert.equal(await runCli(["claude", "--runtime-checks", "cancel", "--json"], { io: cancelled.io.io, exec: cancelled.exec, prepare: prepareMarketplace }), 0);
  assert.equal(cancelled.calls.length, 0, "cancel must stop before every host mutation");
  const cancelledReport = JSON.parse(cancelled.io.out[0]);
  assert.equal(cancelledReport.runtime_checks.effective, "cancelled");
  assert.equal(cancelledReport.operation_status.operation_id, "lifecycle.plugin.install.claude");
  assert.equal(cancelledReport.operation_status.outcome, "preview");
  assert.equal(cancelledReport.operation_status.authorizes, false);
}

{
  const dataRoot = mkdtempSync(join(tmpdir(), "agdf-cli-install-consent-"));
  try {
    const pluginRoot = join(generatedRoot, "plugins", "agdf");
    const runtimeDigest = JSON.parse(readFileSync(join(pluginRoot, "runtime", "runtime-manifest.json"), "utf8")).digest;
    const installed = { pluginRoot, runtimeDigest, sourceDigest: digestNormalizedPluginSource(pluginRoot, pluginDefinition.version) };
    const prepareConsentMarketplace = () => ({
      root: fakeMarketplaceRoot,
      ...installed,
      digest: runtimeDigest,
      commit() {},
      rollback() {},
    });

    for (const currentDecision of [null, "enable", "manual"]) {
      if (currentDecision) persistInstallConsent({ surface: "codex", decision: currentDecision, installed, dataRoot });
      const cancelled = installerRecording([]);
      let prompts = 0;
      assert.equal(await runCli(["codex"], {
        io: cancelled.io.io,
        env: { AGDF_DATA_DIR: dataRoot },
        exec: cancelled.exec,
        prepare: prepareMarketplace,
        interactive: true,
        askRuntimeCheckDecision(disclosure) {
          prompts += 1;
          assert.equal(disclosure.surface, "codex");
          return "cancel";
        },
      }), 0);
      assert.equal(prompts, 1, "every interactive install or update must ask exactly once");
      assert.equal(cancelled.calls.length, 0, "interactive cancel must stop before every host mutation");
      assert.equal(cancelled.io.out.includes("AGDF installation cancelled"), true);
      if (currentDecision) {
        const expected = currentDecision === "enable"
          ? "Your previous choice: automatic checks requested"
          : "Your previous choice: manual checks";
        assert.equal(cancelled.io.out.includes(expected), true);
        assert.equal(cancelled.io.out.includes("Codex permission: checked after installation"), currentDecision === "enable");
      } else {
        assert.equal(cancelled.io.out.some((line) => line.startsWith("Your previous choice:")), false);
      }
      assert.equal(cancelled.io.out.includes(`AGDF ${pluginDefinition.version} for Codex`), true);
      assert.equal(cancelled.io.out.includes("Applies to this Codex installation for your user account."), true);
      assert.equal(cancelled.io.out.includes("Safe by design"), true);
      assert.equal(cancelled.io.out.includes("  Changes no project files and uses no network"), true);
      assert.equal(cancelled.io.out.includes("  Never approves AGDF work"), true);
      assert.equal(cancelled.io.out.includes("Choose"), true);
      assert.equal(cancelled.io.out.includes("  [1] Yes, check automatically"), true);
      assert.equal(cancelled.io.out.includes("  [2] No automatic checks"), true);
      assert.equal(cancelled.io.out.includes("      AGDF still works. Checks run when you request them."), true);
      assert.equal(cancelled.io.out.includes("  [D] Show technical details"), true);
      assert.equal(cancelled.io.out.includes("  [Esc] Cancel installation"), true);
    }

    for (const selectedDecision of ["manual", "enable"]) {
      const outputs = ['{"marketplaces":[]}', "", "", `agdf@agdf ${pluginDefinition.version}\n`];
      let prompts = 0;
      const selectedIo = recordingIo();
      assert.equal(await runCli(["codex"], {
        io: selectedIo.io,
        env: { AGDF_DATA_DIR: dataRoot },
        exec() { return outputs.shift(); },
        prepare: prepareConsentMarketplace,
        interactive: true,
        askRuntimeCheckDecision() { prompts += 1; return selectedDecision; },
        observeCodexHookTrust: async () => ({ status: "unavailable" }),
      }), 0);
      assert.equal(prompts, 1);
      assert.equal(selectedIo.out.includes(`Setting up AGDF ${pluginDefinition.version} for Codex...`), true);
      assert.equal(runtimeCheckStatus(dataRoot, "codex").requested, selectedDecision === "enable" ? "enabled" : "manual");
      if (selectedDecision === "enable") {
        assert.match(selectedIo.out.at(-1), /^Next: Fully restart Codex, then start a fresh session\./);
        assert.match(selectedIo.out.at(-1), /Inspect the AGDF session hook in Codex \/hooks/);
      }
    }

    persistInstallConsent({ surface: "codex", decision: "enable", installed, dataRoot });
    for (const [trustStatus, enabled, verification] of [
      ["trusted", true, "hook_trusted_session_unverified"],
      ["modified", true, "hook_review_required"],
      ["trusted", false, "hook_disabled"],
    ]) {
      const observed = { status: "observed", hook: { trust_status: trustStatus, enabled } };
      const installIo = recordingIo();
      const installOutputs = ['{"marketplaces":[]}', "", "", `agdf@agdf ${pluginDefinition.version}\n`];
      assert.equal(await runCli(["codex", "--runtime-checks", "enable"], {
        io: installIo.io, env: { AGDF_DATA_DIR: dataRoot },
        exec() { return installOutputs.shift(); }, prepare: prepareConsentMarketplace,
        observeCodexHookTrust: async () => observed,
      }), 0);
      if (trustStatus === "trusted" && enabled) {
        assert.ok(installIo.out.includes("Automatic checks: Hook trusted; fresh-session check pending"));
        assert.match(installIo.out.at(-1), /already trusted/);
        assert.doesNotMatch(installIo.out.at(-1), /Approve|review and trust/);
      }
      const statusIo = recordingIo();
      assert.equal(await runCli(["runtime-checks", "status", "--surface", "codex", "--json"], {
        io: statusIo.io, env: { AGDF_DATA_DIR: dataRoot }, observeCodexHookTrust: async () => observed,
      }), 1);
      const report = JSON.parse(statusIo.out[0]);
      assert.equal(report.effective, "decision_required");
      assert.equal(report.verification, verification);
      assert.equal(report.operation_status.authorizes, false);
    }
    const nonInteractive = recordingIo();
    const outputs = ['{"marketplaces":[]}', "", "", `agdf@agdf ${pluginDefinition.version}\n`];
    assert.equal(await runCli(["codex", "--json"], {
      io: nonInteractive.io,
      env: { AGDF_DATA_DIR: dataRoot },
      exec() { return outputs.shift(); },
      prepare: prepareConsentMarketplace,
      interactive: false,
    }), 0);
    assert.equal(JSON.parse(nonInteractive.out.at(-1)).runtime_checks.requested, "manual", "non-interactive install must not silently retain enabled consent");
  } finally {
    rmSync(dataRoot, { recursive: true, force: true });
  }
}

async function rawRuntimeCheckChoice(inputBytes, expectedDecision, disclosure) {
  const input = new PassThrough();
  input.isTTY = true;
  input.isRaw = false;
  input.setRawMode = (value) => { input.isRaw = value; };
  input.pause();
  const output = new PassThrough();
  let rendered = "";
  output.on("data", (chunk) => { rendered += chunk.toString(); });
  const decision = askRuntimeCheckDecisionByKey(input, output, disclosure);
  input.write(inputBytes);
  assert.equal(await decision, expectedDecision);
  assert.equal(input.isRaw, false, "raw mode must be restored after the choice");
  assert.equal(input.isPaused(), true, "input must be paused after the one-time installer choice");
  if (!disclosure) assert.equal(rendered, `Choice: ${expectedDecision}\n`);
  return rendered;
}

await rawRuntimeCheckChoice("1", "enable");
await rawRuntimeCheckChoice("E", "enable");
await rawRuntimeCheckChoice("2", "manual");
await rawRuntimeCheckChoice("m", "manual");
await rawRuntimeCheckChoice("\u001b", "cancel");
assert.match(await rawRuntimeCheckChoice("x1", "enable", {}), /Press 1, 2, D or Esc\.\nChoice: enable/);
const detailsRendered = await rawRuntimeCheckChoice("d\u001b", "cancel", {
  installation_scope: "global user installation",
  runs: "one local check",
  when: "at session start",
  reads: "runtime identity and .agdf/control",
  writes: "one AGDF choice receipt",
  permission_owner: "Codex native hook trust",
  executable: "runtime/agdf-session-check.js",
  renewal: "ask again when the check changes",
});
assert.match(detailsRendered, /Technical details/);
assert.match(detailsRendered, /Command: runtime\/agdf-session-check\.js/);
assert.match(detailsRendered, /Choice: cancel/);

{
  const quiet = recordingIo();
  const outputs = ["[]", "", "", "", "", `agdf@agdf ${pluginDefinition.version}\n`];
  assert.equal(await runCli(["claude"], { io: quiet.io, exec() { return outputs.shift(); }, prepare: prepareMarketplace }), 0);
  assert.match(quiet.out.at(-1), /^Next: Fully restart Claude Code, then start a fresh session\./);
  assert.match(quiet.out.at(-1), /Restoring the previous session can retain stale AGDF skills/);
}

{
  const recording = installerRecording(["[]", "", "", `agdf@agdf ${pluginDefinition.version}\n`, "", "", `agdf@agdf ${pluginDefinition.version}\n`]);
  installClaudeGlobalPlugin({ exec: recording.exec, prepare: prepareMarketplace });
  assert.deepEqual(recording.calls.slice(4, 6).map(({ args }) => args), [
    ["plugin", "uninstall", "agdf@agdf"],
    ["plugin", "install", "agdf@agdf"],
  ]);
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
