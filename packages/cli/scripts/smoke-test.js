import "../../../scripts/support/english-locale.js";
import { checkGeneratedGateContracts, checkLateGateTransitions } from "./build-contract-checks.js";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { delimiter, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { withWindowsCmdShim } from "../../../scripts/support/npm-cmd-shim.js";
import { createRun } from "#agdf-core/control-state/run-state-repository.js";

const packageRoot = new URL("..", import.meta.url);
const binPath = fileURLToPath(new URL("./bin/create-agdf.js", packageRoot));
const packageJsonPath = fileURLToPath(new URL("./package.json", packageRoot));
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const generatedRoot = fileURLToPath(new URL("./generated/", packageRoot));
const pluginDefinitionPath = fileURLToPath(new URL("../../plugins/agdf/meta/agdf-plugin.definition.json", packageRoot));
const pluginDefinition = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));
const codexSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.codex.skillPrefix}${skill.slug}`);
const openCodeSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.opencode.skillPrefix}${skill.slug}`);
const globalOpenCodeSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.opencode.globalSkillPrefix}${skill.slug}`);
const contractModules = pluginDefinition.runtimeContract.modules.map((modulePath) => {
  const prefix = "meta/contracts/";
  if (!modulePath.startsWith(prefix) || modulePath.slice(prefix.length).includes("/")) {
    throw new Error(`Invalid definition-owned runtime contract module path: ${modulePath}`);
  }
  return modulePath.slice(prefix.length);
});
process.env.npm_config_offline = "true";
const smokeStarted = performance.now();
function smokePhase(name) {
  console.log(`[smoke ${((performance.now() - smokeStarted) / 1000).toFixed(1)}s] ${name}`);
}

function runJson(args) {
  try {
    return JSON.parse(execFileSync(process.execPath, [binPath, ...args], { encoding: "utf8", stdio: "pipe" }));
  } catch (error) {
    if (error.stdout) return JSON.parse(error.stdout.toString());
    throw error;
  }
}

function makeFakeExecutable(tempDir, name, source) {
  const binDir = join(tempDir, "bin");
  mkdirSync(binDir, { recursive: true });
  const executablePath = join(binDir, name);
  writeFileSync(executablePath, source, "utf8");
  chmodSync(executablePath, 0o755);
  withWindowsCmdShim(binDir, name);
  return binDir;
}

function runCliWithPath(args, binDir, extraEnv = {}) {
  return execFileSync(process.execPath, [binPath, ...args], {
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
      // Never let a smoke install touch the real Claude home.
      CLAUDE_CONFIG_DIR: join(binDir, "..", "claude-home"),
      CODEX_HOME: join(binDir, '..', 'codex-home'),
      // The Claude packaged-app preflight probes %LOCALAPPDATA%; an isolated one keeps the result the same
      // inside a packaged host such as Claude Desktop, while npm keeps its real cache.
      LOCALAPPDATA: join(binDir, "..", "localappdata"),
      ...(process.env.LOCALAPPDATA && !process.env.npm_config_cache
        ? { npm_config_cache: join(process.env.LOCALAPPDATA, "npm-cache") }
        : {}),
      ...extraEnv,
      PATH: `${binDir}${delimiter}${process.env.PATH}`,
    },
  });
}

function readJsonLines(path) {
  return readFileSync(path, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

const openCodeNpmFixtureDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-fake-npm-"));
const openCodeNpmLog = join(openCodeNpmFixtureDir, "npm.log");
const openCodeNpmBinDir = makeFakeExecutable(openCodeNpmFixtureDir, "npm", `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_NPM_LOG, JSON.stringify(args) + "\\n");
const expectedSpecifier = ${JSON.stringify(`${pluginDefinition.opencode.npmPackage}@${pluginDefinition.version}`)};
const sdkSpecifier = "@opencode-ai/plugin@1.18.3";
const prefix = process.cwd();
const packageJsonPath = path.join(prefix, "package.json");
const lockPath = path.join(prefix, "package-lock.json");
if (args[0] === "view") {
  if (args[1] !== sdkSpecifier || args[2] !== "version" || args[3] !== "--json") {
    console.error("unexpected fake npm view invocation: " + JSON.stringify(args));
    process.exit(2);
  }
  if (process.env.FAKE_SDK_MODE === "unavailable") {
    console.error("npm ERR! code ETARGET");
    process.exit(1);
  }
  console.log(JSON.stringify("1.18.3"));
  process.exit(0);
}
if (args[0] === "install" && args.at(-1) === sdkSpecifier) {
  for (const required of ["--save-exact", "--ignore-scripts", "--no-audit", "--no-fund"]) {
    if (!args.includes(required)) {
      console.error("missing fake SDK npm argument " + required + ": " + JSON.stringify(args));
      process.exit(2);
    }
  }
  if (process.env.FAKE_SDK_MODE === "install-failed") {
    console.error("SDK install failed");
    process.exit(1);
  }
  let manifest = { name: "opencode-global-config", private: true };
  if (fs.existsSync(packageJsonPath)) manifest = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  manifest.dependencies = { ...(manifest.dependencies || {}), "@opencode-ai/plugin": "1.18.3" };
  fs.writeFileSync(packageJsonPath, JSON.stringify(manifest, null, 2) + "\\n");
  let lock = { name: manifest.name, lockfileVersion: 3, requires: true, packages: {} };
  if (fs.existsSync(lockPath)) lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  lock.packages = { ...(lock.packages || {}) };
  lock.packages[""] = { ...(lock.packages[""] || {}), dependencies: manifest.dependencies };
  lock.packages["node_modules/@opencode-ai/plugin"] = { version: "1.18.3" };
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + "\\n");
  const sdkDir = path.join(prefix, "node_modules", "@opencode-ai", "plugin");
  fs.mkdirSync(path.join(sdkDir, "dist"), { recursive: true });
  fs.writeFileSync(path.join(sdkDir, "package.json"), JSON.stringify({
    name: "@opencode-ai/plugin",
    version: "1.18.3",
    types: "dist/index.d.ts"
  }, null, 2) + "\\n");
  fs.writeFileSync(path.join(sdkDir, "dist", "index.d.ts"), process.env.FAKE_SDK_MODE === "verification-failed"
    ? "export type Hooks = {};\\n"
    : 'export type Hooks = { "experimental.chat.system.transform": unknown; "experimental.session.compacting": unknown; };\\n');
  process.exit(0);
}
if (args.includes("--prefix")
  || !["--save-exact", "--ignore-scripts", "--no-audit", "--no-fund"].every((required) => args.includes(required))
  || args.at(-1) !== expectedSpecifier) {
  console.error("unexpected fake npm invocation: " + JSON.stringify(args));
  process.exit(2);
}
let manifest = { name: "opencode-global-config", private: true };
if (fs.existsSync(packageJsonPath)) manifest = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
manifest.dependencies = { ...(manifest.dependencies || {}), ${JSON.stringify(pluginDefinition.opencode.npmPackage)}: ${JSON.stringify(pluginDefinition.version)} };
fs.mkdirSync(prefix, { recursive: true });
fs.writeFileSync(packageJsonPath, JSON.stringify(manifest, null, 2) + "\\n");
let lock = { name: manifest.name, lockfileVersion: 3, requires: true, packages: {} };
if (fs.existsSync(lockPath)) lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
lock.lockfileVersion = 3;
lock.requires = true;
lock.packages = { ...(lock.packages || {}) };
for (const key of Object.keys(lock.packages)) {
  if (key !== "node_modules/${pluginDefinition.opencode.npmPackage}" && key.includes("node_modules/${pluginDefinition.opencode.npmPackage}")) delete lock.packages[key];
}
lock.packages[""] = { ...(lock.packages[""] || {}), dependencies: manifest.dependencies };
lock.packages["node_modules/${pluginDefinition.opencode.npmPackage}"] = {
  version: ${JSON.stringify(pluginDefinition.version)},
  resolved: ${JSON.stringify(`https://registry.npmjs.org/${pluginDefinition.opencode.npmPackage}/-/${pluginDefinition.opencode.npmPackage}-${pluginDefinition.version}.tgz`)},
};
fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + "\\n");
const packageDir = path.join(prefix, "node_modules", ${JSON.stringify(pluginDefinition.opencode.npmPackage)});
fs.mkdirSync(packageDir, { recursive: true });
for (const entry of ["bin", "lib", "generated", "runtime"]) {
  fs.cpSync(path.join(${JSON.stringify(fileURLToPath(new URL("../../dist/npm/create-agdf/", packageRoot)))}, entry), path.join(packageDir, entry), { recursive: true });
}
fs.writeFileSync(path.join(packageDir, "package.json"), JSON.stringify({
  name: ${JSON.stringify(pluginDefinition.opencode.npmPackage)},
  version: ${JSON.stringify(pluginDefinition.version)},
  type: "module",
  imports: ${JSON.stringify(JSON.parse(readFileSync(new URL("../../dist/npm/create-agdf/package.json", packageRoot), "utf8")).imports)},
  main: "opencode-plugin.js"
}, null, 2) + "\\n");
fs.writeFileSync(path.join(packageDir, "opencode-plugin.js"), "export default async function () { return {}; }\\n");
const sdkDir = path.join(prefix, "node_modules", "@opencode-ai", "plugin");
if (!fs.existsSync(path.join(sdkDir, "package.json"))) {
  fs.mkdirSync(path.join(sdkDir, "dist"), { recursive: true });
  fs.writeFileSync(path.join(sdkDir, "package.json"), JSON.stringify({
    name: "@opencode-ai/plugin",
    version: "1.17.11",
    types: "dist/index.d.ts"
  }, null, 2) + "\\n");
  fs.writeFileSync(path.join(sdkDir, "dist", "index.d.ts"), 'export type Hooks = { "experimental.chat.system.transform": unknown; "experimental.session.compacting": unknown; };\\n');
}
`);
const openCodeHostBinDir = makeFakeExecutable(openCodeNpmFixtureDir, "opencode", `#!/usr/bin/env node
if (process.argv[2] === "--version") {
  process.stdout.write("1.18.3\\n");
  process.exit(0);
}
process.exit(2);
`);
const openCodeHostBin = withWindowsCmdShim(openCodeHostBinDir, "opencode");
process.env.AGDF_OPENCODE_BIN = openCodeHostBin;

function runOpenCodeCli(args, options = {}) {
  return execFileSync(process.execPath, [binPath, ...args], {
    ...options,
    env: {
      ...process.env,
      ...(options.env ?? {}),
      FAKE_NPM_LOG: openCodeNpmLog,
      NODE_ENV: "test",
      AGDF_TEST_NPM_CLI_PATH: join(openCodeNpmBinDir, "npm"),
      AGDF_OPENCODE_BIN: openCodeHostBin,
    },
  });
}

smokePhase("CLI metadata and release guards");
if (packageJson.bin?.["create-agdf"] !== "./bin/create-agdf.js") {
  throw new Error("create-agdf must keep the backward-compatible create-agdf binary.");
}

if (packageJson.exports?.["./cli"] !== "./bin/create-agdf.js") {
  throw new Error("create-agdf must export its CLI for the agdf wrapper package.");
}

const helpOutput = execFileSync(process.execPath, [binPath, "--help"], { encoding: "utf8" });
if (!helpOutput.includes("Bootstrap and lifecycle commands:") || !helpOutput.includes("Advanced / Compatibility") || !helpOutput.includes("npx --yes @agdf/cli@latest codex-repo") || !helpOutput.includes("npx --yes @agdf/cli@latest claude") || !helpOutput.includes("npx --yes @agdf/cli@latest opencode-status") || !helpOutput.includes("npx --yes @agdf/cli@latest opencode-repo") || !helpOutput.includes("npx --yes @agdf/cli@latest status") || !helpOutput.includes("npx --yes @agdf/cli@latest disable") || !helpOutput.includes("npx --yes @agdf/cli@latest uninstall") || !helpOutput.includes("npx --yes @agdf/cli@latest init") || !helpOutput.includes("agdf gate-check --approval-envelope") || !helpOutput.includes("agdf delivery-map --json") || !helpOutput.includes("Scaffold-compatible npm create usage:")) {
  throw new Error("CLI help must present agdf as the preferred CLI package and keep npm create compatibility.");
}

{
  const guardrailsWorkflowPath = fileURLToPath(new URL("../../.github/workflows/agdf-guardrails.yml", packageRoot));
  const guardrailsWorkflow = readFileSync(guardrailsWorkflowPath, "utf8");
  if (!guardrailsWorkflow.includes("uses: ./.github/workflows/verify-agdf.yml")) throw new Error("Guardrails must use the shared verification plan.");
  const { verificationPlan } = await import(new URL("../../scripts/verify-ci.mjs", packageRoot));
  const stages = verificationPlan().map(stage => stage.id);
  for (const stage of ['runtime', 'community', 'delivery-map']) {
    if (stages.indexOf('prepare') < 0 || stages.indexOf(stage) < stages.indexOf('prepare')) {
      throw new Error(`Guardrails must prepare release assets before ${stage}.`);
    }
  }
}

{
  const publishWorkflowPath = fileURLToPath(new URL("../../.github/workflows/publish-agdf.yml", packageRoot));
  const publishWorkflow = readFileSync(publishWorkflowPath, "utf8");
  for (const requiredSnippet of [
    "Wait for create-agdf readiness",
    "Wait for @agdf/mcp-server readiness",
    "Wait for @agdf/cli readiness",
    "MAX_ATTEMPTS=20",
    "SLEEP_SECONDS=15",
    "NPM_ERROR_LOG=\"$(mktemp)\"",
    "wait_for_npm_package \"create-agdf\"",
    "npm view \"@agdf/mcp-server@${VERSION}\" version --json",
    "wait_for_npm_package \"@agdf/cli\"",
    "npm view \"${PACKAGE}@${VERSION}\" version --json",
    "Timed out waiting for ${PACKAGE}@${VERSION} after ${MAX_ATTEMPTS} attempts",
    "@agdf/cli@latest\" version --json",
    "Run clean public bootstrap smoke test",
    "NPM_CONFIG_CACHE: ${{ github.workspace }}/.npm-cache",
  ]) {
    if (!publishWorkflow.includes(requiredSnippet)) {
      throw new Error(`Publish workflow must keep bounded exact-version npm readiness check: missing ${requiredSnippet}`);
    }
  }
  if (!(publishWorkflow.indexOf("Publish create-agdf to npm") < publishWorkflow.indexOf("Wait for create-agdf readiness")
    && publishWorkflow.indexOf("Wait for create-agdf readiness") < publishWorkflow.indexOf("Publish @agdf/mcp-server to npm")
    && publishWorkflow.indexOf("Publish @agdf/mcp-server to npm") < publishWorkflow.indexOf("Wait for @agdf/mcp-server readiness")
    && publishWorkflow.indexOf("Wait for @agdf/mcp-server readiness") < publishWorkflow.indexOf("Publish @agdf/cli to npm")
    && publishWorkflow.indexOf("Publish @agdf/cli to npm") < publishWorkflow.indexOf("Wait for @agdf/cli readiness"))) {
    throw new Error("Publish workflow must publish and verify create-agdf, @agdf/mcp-server and @agdf/cli in exact dependency order.");
  }
  if (publishWorkflow.indexOf("Wait for @agdf/cli readiness") > publishWorkflow.indexOf("Run clean public bootstrap smoke test")) {
    throw new Error("Clean public bootstrap smoke test must run after @agdf/cli readiness.");
  }
  const releaseBootstrapPath = fileURLToPath(new URL("./release-bootstrap-smoke-test.js", import.meta.url));
  const releaseBootstrap = readFileSync(releaseBootstrapPath, "utf8");
  if (!releaseBootstrap.includes('const packageSpec = `@agdf/cli@${expectedVersion}`;')
    || !releaseBootstrap.includes('["--yes", packageSpec, "codex", "--verbose"]')
    || releaseBootstrap.includes('["--yes", "@agdf/cli@latest", "codex"]')) {
    throw new Error("Clean public bootstrap must execute the exact release version after the workflow verifies the latest dist-tag separately.");
  }
  const { parse } = await import('yaml');
  const release = parse(publishWorkflow);
  const validateJob = release.jobs.validate.steps.map(step => step.name);
  const before = (first, second) => validateJob.includes(first) && validateJob.includes(second)
    && validateJob.indexOf(first) < validateJob.indexOf(second);
  if (!(before('Prepare and verify release assets', 'Verify runtime-free source and plugin metadata')
    && before('Verify runtime-free source and plugin metadata', 'Verify built plugin integrity')
    && before('Verify built plugin integrity', 'Install MCP validation dependencies from checkout')
    && before('Install MCP validation dependencies from checkout', 'Verify @agdf/mcp-server package contents')
    && release.jobs.tests.uses === './.github/workflows/verify-agdf.yml'
    && release.jobs.tests.with.scope === 'linux'
    && release.jobs.publish.needs.includes('tests')
    && release.jobs['verify-published-mcp'].with.suite === 'mcp'
    && release.jobs['verify-published-mcp'].with.published === true)) {
    throw new Error("Publish validation must prepare release assets, verify source and built integrity, and verify installed/package layouts before publication eligibility.");
  }
  const publishJob = JSON.stringify(release.jobs.publish.steps);
  if (!(publishJob.indexOf("Prepare and verify release assets") < publishJob.indexOf("Verify built plugin integrity")
    && publishJob.indexOf("Verify built plugin integrity") < publishJob.indexOf("Verify create-agdf package contents")
    && publishJob.indexOf("Verify create-agdf package contents") < publishJob.indexOf("Publish create-agdf to npm")
    && release.jobs.publish.permissions.contents === 'read')) {
    throw new Error("Publish job must prepare and verify the release-built plugin with read-only repository contents before npm publish.");
  }
}

smokePhase("codex global");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-codex-global-"));
  const logPath = join(tempDir, "codex.log");

  try {
    const binDir = makeFakeExecutable(tempDir, "codex", `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_CODEX_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "mcp list --json") console.log("[]");
if (args.join(" ") === "plugin marketplace list --json") console.log(JSON.stringify({ marketplaces: [] }));
if (args.join(" ") === "plugin list") {
  console.log("agdf@agdf ${pluginDefinition.version}");
}
`);
    const dataRoot = join(tempDir, "agdf-data");
    const output = runCliWithPath(["codex", "--verbose"], binDir, { FAKE_CODEX_LOG: logPath, AGDF_DATA_DIR: dataRoot });
    const calls = readJsonLines(logPath).map((args) => args.join(" "));
    const expectedCalls = [
      "plugin list",
      "mcp list --json",
      "plugin marketplace list --json",
      `plugin marketplace add ${join(dataRoot, "marketplaces", "agdf")} --json`,
      "plugin add agdf@agdf --json",
      "plugin list",
      // Read-only check for a legacy user-scope registration the plugin's own MCP server replaces.
      "mcp get agdf --json",
    ];
    if (JSON.stringify(calls) !== JSON.stringify(expectedCalls)) {
      throw new Error(`Codex global bootstrap command order changed: ${calls.join(" | ")}`);
    }
    if (!output.includes(`AGDF version: ${pluginDefinition.version}`) || !output.includes("Plugin state: healthy")) {
      throw new Error("Codex global bootstrap must report verified plugin version.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("host installer scenarios");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-codex-mismatch-"));
  const logPath = join(tempDir, "codex.log");

  try {
    const binDir = makeFakeExecutable(tempDir, "codex", `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_CODEX_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "mcp list --json") console.log("[]");
if (args.join(" ") === "plugin marketplace list --json") console.log(JSON.stringify({ marketplaces: [] }));
if (args.join(" ") === "plugin list") {
  console.log("agdf@agdf 0.0.0");
}
`);
    let failed = false;
    try {
      runCliWithPath(["codex", "--json"], binDir, { FAKE_CODEX_LOG: logPath, AGDF_DATA_DIR: join(tempDir, "agdf-data") });
    } catch (error) {
      failed = true;
      const report = JSON.parse(error.stdout.toString());
      const evidence = JSON.stringify(report.plugin);
      if (!evidence.includes(`expected ${pluginDefinition.version}`) || !evidence.includes("observed 0.0.0")
          || report.next_action.code !== "retry_plugin") {
        throw new Error(`Codex mismatch error must be actionable, got: ${error.stdout.toString()}`);
      }
    }
    if (!failed) throw new Error("Codex global bootstrap must fail when the installed plugin version mismatches.");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("claude install");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-claude-install-"));
  const logPath = join(tempDir, "claude.log");
  const statePath = join(tempDir, "installed");

  try {
    const binDir = makeFakeExecutable(tempDir, "claude", `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_CLAUDE_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "plugin marketplace list --json") console.log("[]");
if (args.join(" ") === "plugin list") {
  if (fs.existsSync(process.env.FAKE_CLAUDE_STATE)) console.log("agdf@agdf ${pluginDefinition.version}");
  process.exit(0);
}
if (args.join(" ") === "plugin install agdf@agdf" || args.join(" ") === "plugin update agdf@agdf") {
  fs.writeFileSync(process.env.FAKE_CLAUDE_STATE, "installed");
}
`);
    const dataRoot = join(tempDir, "agdf-data");
    const output = runCliWithPath(["claude", "--verbose"], binDir, { FAKE_CLAUDE_LOG: logPath, FAKE_CLAUDE_STATE: statePath, AGDF_DATA_DIR: dataRoot });
    const calls = readJsonLines(logPath).map((args) => args.join(" "));
    if (!calls.includes(`plugin marketplace add ${join(dataRoot, "marketplaces", "agdf")} --scope user`) || !calls.includes("plugin marketplace update agdf") || !calls.includes("plugin install agdf@agdf")) {
      throw new Error(`Claude first install must use marketplace add/update and plugin install: ${calls.join(" | ")}`);
    }
    if (calls.some((call) => call === "plugin add arndtgold/ai-native-governance-delivery-framework")) {
      throw new Error("Claude bootstrap must not call unsupported plugin add.");
    }
    if (!output.includes(`AGDF version: ${pluginDefinition.version}`) || !output.includes("Plugin state: healthy")) {
      throw new Error("Claude install must report verified plugin version when exposed.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("claude update");
for (const [installedVersion, reinstall] of [[pluginDefinition.version, false], ["0.0.1", true]]) {
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-claude-update-"));
  const logPath = join(tempDir, "claude.log");
  const statePath = join(tempDir, "installed");
  writeFileSync(statePath, installedVersion, "utf8");

  try {
    const binDir = makeFakeExecutable(tempDir, "claude", `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_CLAUDE_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "plugin marketplace list --json") console.log("[]");
if (args.join(" ") === "plugin list") {
  if (fs.existsSync(process.env.FAKE_CLAUDE_STATE)) console.log("agdf@agdf " + fs.readFileSync(process.env.FAKE_CLAUDE_STATE, "utf8"));
  process.exit(0);
}
// An in-place host lists the owned marketplace plugin root as the plugin's location.
if (args.join(" ") === "plugin list --json") {
  const installPath = require("node:path").join(process.env.AGDF_DATA_DIR, "marketplaces", "agdf", "plugins", "agdf");
  console.log(JSON.stringify(fs.existsSync(process.env.FAKE_CLAUDE_STATE)
    ? [{ id: "agdf@agdf", version: fs.readFileSync(process.env.FAKE_CLAUDE_STATE, "utf8"), scope: "user", enabled: true, installPath }]
    : []));
  process.exit(0);
}
if (args.join(" ") === "plugin uninstall agdf@agdf --keep-data") {
  fs.rmSync(process.env.FAKE_CLAUDE_STATE, { force: true });
}
if (args.join(" ") === "plugin install agdf@agdf") {
  fs.writeFileSync(process.env.FAKE_CLAUDE_STATE, "${pluginDefinition.version}");
}
`);
    runCliWithPath(["claude"], binDir, { FAKE_CLAUDE_LOG: logPath, FAKE_CLAUDE_STATE: statePath, AGDF_DATA_DIR: join(tempDir, "agdf-data") });
    const calls = readJsonLines(logPath).map((args) => args.join(" "));
    const uninstallIndex = calls.indexOf("plugin uninstall agdf@agdf --keep-data");
    const installIndex = calls.indexOf("plugin install agdf@agdf");
    if (calls.includes("plugin update agdf@agdf")) throw new Error(`Claude must not use plugin update: ${calls.join(" | ")}`);
    if (reinstall && (uninstallIndex < 0 || installIndex < 0 || uninstallIndex >= installIndex)) {
      throw new Error(`Claude version change must use uninstall then install: ${calls.join(" | ")}`);
    }
    // The owned directory marketplace is loaded in place, so an unchanged version is not reinstalled.
    if (!reinstall && (uninstallIndex >= 0 || installIndex >= 0)) {
      throw new Error(`Claude same-version install must not reinstall: ${calls.join(" | ")}`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("Claude installer scenarios");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-claude-no-version-"));
  const logPath = join(tempDir, "claude.log");
  const statePath = join(tempDir, "installed");

  try {
    const binDir = makeFakeExecutable(tempDir, "claude", `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_CLAUDE_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "plugin marketplace list --json") console.log("[]");
if (args.join(" ") === "plugin list") {
  if (fs.existsSync(process.env.FAKE_CLAUDE_STATE)) console.log("agdf@agdf");
  process.exit(0);
}
if (args.join(" ") === "plugin install agdf@agdf") {
  fs.writeFileSync(process.env.FAKE_CLAUDE_STATE, "installed");
}
`);
    let output = "";
    let failed = false;
    try {
      runCliWithPath(["claude", "--verbose"], binDir, { FAKE_CLAUDE_LOG: logPath, FAKE_CLAUDE_STATE: statePath, AGDF_DATA_DIR: join(tempDir, "agdf-data") });
    } catch (error) {
      failed = true;
      output = error.stdout.toString();
    }
    if (!failed) throw new Error("Claude bootstrap must fail when list output does not expose a verifiable version.");
    if (!output.includes(`AGDF version: expected ${pluginDefinition.version}`) || !output.includes("Plugin state: degraded")) {
      throw new Error("Claude bootstrap must report verification limitation when list output has no version.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

const deliveryPathSearchFixture = fileURLToPath(new URL("./scripts/fixtures/delivery-path-search.json", packageRoot));
const deliveryPathSearchOutput = JSON.parse(execFileSync(process.execPath, [
  binPath,
  "delivery-path-search",
  "--fixture",
  deliveryPathSearchFixture,
  "--json",
], { encoding: "utf8" }));
if (deliveryPathSearchOutput.status !== "recommendation"
  || deliveryPathSearchOutput.recommendation?.candidate_id !== "inspect"
  || deliveryPathSearchOutput.next_gate_action !== "Run canonical AGDF gate-check; search does not grant permission.") {
  throw new Error("delivery-path-search CLI must return the canonical advisory fixture result.");
}

const generatedDeliveryPathSearchFixture = fileURLToPath(new URL("./scripts/fixtures/delivery-path-search-generated.json", packageRoot));
const generatedDeliveryPathSearchOutput = JSON.parse(execFileSync(process.execPath, [
  binPath, "delivery-path-search", "--fixture", generatedDeliveryPathSearchFixture, "--json",
], { encoding: "utf8" }));
if (generatedDeliveryPathSearchOutput.generation?.status !== "success"
  || generatedDeliveryPathSearchOutput.generation?.accepted !== 1
  || generatedDeliveryPathSearchOutput.generation?.cost_units !== 2) {
  throw new Error("delivery-path-search CLI must expose bounded generated-candidate provenance and budgets.");
}

smokePhase("OpenCode global installation and validator");
const openCodeConfigTempDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-config-"));
try {
  const openCodeSdkFixture = join(openCodeConfigTempDir, "node_modules", "@opencode-ai", "plugin");
  mkdirSync(join(openCodeSdkFixture, "dist"), { recursive: true });
  writeFileSync(join(openCodeSdkFixture, "package.json"), JSON.stringify({
    name: "@opencode-ai/plugin",
    version: "1.17.11",
    types: "dist/index.d.ts",
  }), "utf8");
  writeFileSync(join(openCodeSdkFixture, "dist", "index.d.ts"), 'export type Hooks = { "experimental.chat.system.transform": unknown; "experimental.session.compacting": unknown; };\n', "utf8");
  const installOutput = runOpenCodeCli(["opencode", "--dir", openCodeConfigTempDir, "--verbose"], { encoding: "utf8", stdio: "pipe" });
  const openCodeGlobalConfig = JSON.parse(readFileSync(join(openCodeConfigTempDir, "opencode.json"), "utf8"));
  if (!openCodeGlobalConfig.plugin?.includes(`./node_modules/${pluginDefinition.opencode.npmPackage}/opencode-plugin.js`)) {
    throw new Error("opencode must bind the verified local AGDF plugin entrypoint in OpenCode global config.");
  }
  let status = JSON.parse(execFileSync(process.execPath, [binPath, "opencode-status", "--dir", openCodeConfigTempDir, "--json"], {
    encoding: "utf8",
    stdio: "pipe",
    env: { ...process.env, OPENCODE_CONFIG_DIR: openCodeConfigTempDir },
  }));
  if (status.status !== "configured") {
    throw new Error(`opencode-status should report configured after opencode install, got ${status.status}.`);
  }
  if (!status.global_config.plugin_configured || !status.package.loadable) {
    throw new Error("opencode-status must prove global config and package loadability separately.");
  }
  if (status.package.installed_version !== pluginDefinition.version
    || status.package.expected_version !== pluginDefinition.version
    || status.package.version_status !== "current") {
    throw new Error("opencode-status must report matching installed and expected package versions as current.");
  }
  if (!installOutput.includes(`AGDF version: ${pluginDefinition.version} (installed)`)
    || !installOutput.includes("Plugin state: healthy")
    || !installOutput.includes("OpenCode host / plugin SDK:")
    || !installOutput.includes("Plugin SDK alignment: aligned (target 1.18.3; installed 1.18.3)")
    || !installOutput.includes("Experimental hook declarations: declared_supported")
    || !installOutput.includes("Setup choice: plugin only")
    || !installOutput.includes("Restart required: yes")) {
    throw new Error("opencode install must report the shared verified global lifecycle Success Card.");
  }
  const npmCallsAfterInstall = readJsonLines(openCodeNpmLog).length;
  const npmArgs = readJsonLines(openCodeNpmLog).find((args) => args.at(-1) === `${pluginDefinition.opencode.npmPackage}@${pluginDefinition.version}`);
  if (!["--save-exact", "--ignore-scripts", "--no-audit", "--no-fund"].every((required) => npmArgs.includes(required))
    || npmArgs.includes("--prefix")
    || npmArgs.at(-1) !== `${pluginDefinition.opencode.npmPackage}@${pluginDefinition.version}`
    || npmArgs.some((arg) => arg.includes(".npm/_npx") || arg === fileURLToPath(packageRoot))) {
    throw new Error("opencode must install the exact registry package without a local package or npx-cache source.");
  }
  const installedManifest = JSON.parse(readFileSync(join(openCodeConfigTempDir, "package.json"), "utf8"));
  const validatorPackageManifest = JSON.parse(readFileSync(join(openCodeConfigTempDir, "agdf", "package.json"), "utf8"));
  const installedLock = readFileSync(join(openCodeConfigTempDir, "package-lock.json"), "utf8");
  if (installedManifest.dependencies?.[pluginDefinition.opencode.npmPackage] !== pluginDefinition.version
    || installedLock.includes("file:") || installedLock.includes(".npm/_npx")) {
    throw new Error("opencode clean install must persist an exact registry dependency without a file source.");
  }
  if (validatorPackageManifest.type !== "module"
    || validatorPackageManifest.agdf?.owner !== "create-agdf"
    || validatorPackageManifest.agdf?.surface !== "opencode-global-validator") {
    throw new Error("opencode must scope ESM semantics to its owned local-validator package.");
  }
  if (!status.global_native_surface?.complete
    || status.global_native_surface.skill_count !== openCodeSkillNames.length
    || status.global_native_surface.expected_skill_count !== openCodeSkillNames.length
    || status.global_native_surface.contract_count !== contractModules.length
    || status.global_native_surface.expected_contract_count !== contractModules.length
    || status.global_native_surface.evaluator_agent?.name !== pluginDefinition.opencode.evaluatorAgentName
    || !status.global_native_surface.evaluator_agent?.present) {
    throw new Error("opencode-status must prove the complete global native OpenCode skill and contract surface.");
  }
  if (!openCodeGlobalConfig.instructions?.includes("AGDF.md")
    || openCodeGlobalConfig.permission?.question !== "allow"
    || openCodeGlobalConfig.permission?.edit !== "ask"
    || openCodeGlobalConfig.permission?.bash !== "ask"
    || openCodeGlobalConfig.permission?.skill?.["agdf-*"] !== "allow") {
    throw new Error("opencode must add the owned global AGDF instructions and canonical missing permissions.");
  }
  const validatorProbe = spawnSync(process.execPath, [join(openCodeConfigTempDir, "agdf", "bin", "agdf-local.js"), "--resolve-only", "--json"], {
    encoding: "utf8",
  });
  if (validatorProbe.status !== 0 || validatorProbe.stderr !== ""
    || JSON.parse(validatorProbe.stdout).machine_validation !== "owned_version_matched") {
    throw new Error(`opencode local validator must resolve without stderr warnings: ${validatorProbe.stderr}`);
  }
  if (!existsSync(join(openCodeConfigTempDir, "AGDF.md"))
    || !existsSync(join(openCodeConfigTempDir, "agdf-runtime-contract.md"))
    || !existsSync(join(openCodeConfigTempDir, "agents", `${pluginDefinition.opencode.evaluatorAgentName}.md`))) {
    throw new Error("opencode must generate the owned global instructions, Runtime Contract and evaluator agent.");
  }
  const globalInstructions = readFileSync(join(openCodeConfigTempDir, "AGDF.md"), "utf8");
  if (pluginDefinition.opencode.globalSkillPrefix !== "agdf-global-"
    || globalOpenCodeSkillNames.some((name) => !name.startsWith(pluginDefinition.opencode.globalSkillPrefix))
    || globalOpenCodeSkillNames.some((name) => openCodeSkillNames.includes(name))
    || new Set(globalOpenCodeSkillNames).size !== globalOpenCodeSkillNames.length) {
    throw new Error("opencode global surface must keep the collision-safe agdf-global-* namespace current.");
  }
  let legacyFullBoundaryCount = (globalInstructions.match(/## Global OpenCode Surface Boundary/g) ?? []).length;
  let requestActivationGuardCount = (globalInstructions.match(/<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->/g) ?? []).length;
  let activationGuardCount = 0;
  let conditionalDispatchCount = 0;
  for (const skillName of globalOpenCodeSkillNames) {
    const globalSkillPath = join(openCodeConfigTempDir, "skills", skillName, "SKILL.md");
    const globalSkill = existsSync(globalSkillPath) ? readFileSync(globalSkillPath, "utf8") : "";
    if (!globalSkill.includes(`AGDF-GLOBAL-SKILL: ${skillName} -->`)) {
      throw new Error(`opencode must generate an owned global skill adapter for ${skillName}.`);
    }
    legacyFullBoundaryCount += (globalSkill.match(/## Global OpenCode Surface Boundary/g) ?? []).length;
    requestActivationGuardCount += (globalSkill.match(/<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->/g) ?? []).length;
    activationGuardCount += (globalSkill.match(/## Repository Activation Guard/g) ?? []).length;
    conditionalDispatchCount += (globalSkill.match(/## Conditional Executable Dispatch/g) ?? []).length;
    if (globalSkill.includes("## Executable Dispatch")
      || !globalSkill.includes("Do not inspect files, search installed packages, derive a runtime path or request shell permission")
      || !globalSkill.includes("Never search for, infer or construct an executable or runtime path")
      || !globalSkill.includes("Without the explicit active declaration and exact binding")) {
      throw new Error(`opencode global skill ${skillName} must fail closed without an active supplied binding and forbid runtime reconstruction.`);
    }
  }
  if (legacyFullBoundaryCount !== 0
    || requestActivationGuardCount !== globalOpenCodeSkillNames.length + 1
    || activationGuardCount !== globalOpenCodeSkillNames.length
    || conditionalDispatchCount !== globalOpenCodeSkillNames.length) {
    throw new Error(`opencode must install one activation micro-bootstrap and ${globalOpenCodeSkillNames.length} fail-closed skill guards without the legacy full boundary.`);
  }
  const localValidatorPath = join(openCodeConfigTempDir, "agdf", "bin", "agdf-local.js");
  if (!existsSync(localValidatorPath)
    || status.global_native_surface.local_validator?.machine_validation !== "owned_version_matched") {
    throw new Error("opencode must expose an exact-version config-local validator entrypoint.");
  }
  for (const command of ["doctor", "gate-check", "delivery-map"]) {
    const localExecution = spawnSync(process.execPath, [localValidatorPath, command, "--dir", openCodeConfigTempDir, "--json"], { encoding: "utf8" });
    let report = null;
    try { report = JSON.parse(localExecution.stdout); } catch {}
    if (localExecution.status !== 2 || !report?.schema_version) {
      throw new Error(`opencode config-local validator must execute ${command} offline and fail only on the intentionally missing control fixture.`);
    }
  }
  for (const moduleName of contractModules) {
    const globalContractPath = join(openCodeConfigTempDir, "contracts", moduleName);
    if (!existsSync(globalContractPath)
      || !readFileSync(globalContractPath, "utf8").startsWith("<!-- AGDF-GLOBAL-RUNTIME-CONTRACT -->")) {
      throw new Error(`opencode must generate an owned global contract module for ${moduleName}.`);
    }
  }
  if (status.session.active) {
    throw new Error("opencode-status must not claim an active session from config evidence alone.");
  }
  if (status.repository_activation !== "inactive" || status.repository_surface.present || status.visible_entrypoint !== "none until durable AGDF control is configured for this repository") {
    throw new Error("opencode-status must keep global installation separate from durable repository activation.");
  }

  execFileSync(process.execPath, [binPath, "opencode-repo", "--dir", openCodeConfigTempDir, "--force"], { encoding: "utf8", stdio: "pipe" });
  status = JSON.parse(execFileSync(process.execPath, [binPath, "opencode-status", "--dir", openCodeConfigTempDir, "--json"], {
    encoding: "utf8",
    stdio: "pipe",
    env: { ...process.env, OPENCODE_CONFIG_DIR: openCodeConfigTempDir },
  }));
  if (status.repository_activation !== "active" || !status.repository_surface.present || status.visible_entrypoint !== "agdf-global-gate-check (native skill)") {
    throw new Error("opencode-status should detect durable repository activation after opencode-repo generation.");
  }
  if (status.schema_version !== "1"
    || status.repository_surface.gate_check_agent !== status.repository_surface.gate_check_skill
    || status.repository_surface.legacy_present) {
    throw new Error("opencode-status schema v1 must preserve gate_check_agent as a native-skill compatibility alias.");
  }
  if (readJsonLines(openCodeNpmLog).length !== npmCallsAfterInstall) {
    throw new Error("opencode-status must remain read-only and never invoke npm.");
  }
} finally {
  rmSync(openCodeConfigTempDir, { recursive: true, force: true });
}

smokePhase("OpenCode installation and status scenarios");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-sdk-unavailable-"));
  try {
    let report = null;
    let humanOutput = "";
    try {
      runOpenCodeCli(["opencode", "--dir", tempDir, "--json"], {
        encoding: "utf8",
        stdio: "pipe",
        env: { FAKE_SDK_MODE: "unavailable" },
      });
    } catch (error) {
      report = JSON.parse(error.stdout.toString());
    }
    rmSync(join(tempDir, "node_modules"), { recursive: true, force: true });
    try {
      runOpenCodeCli(["opencode", "--dir", tempDir, "--verbose"], {
        encoding: "utf8",
        stdio: "pipe",
        env: { FAKE_SDK_MODE: "unavailable" },
      });
    } catch (error) {
      humanOutput = error.stdout.toString();
    }
    if (report?.result !== "failed"
      || report.plugin?.result !== "partial"
      || report.plugin?.verification?.status !== "degraded"
      || !report.plugin?.verification?.evidence?.includes("sdk_alignment=unavailable;target=1.18.3;installed=1.17.11")
      || report.plugin?.next_action?.kind !== "recovery"
      || !report.plugin?.next_action?.text?.includes("@opencode-ai/plugin")
      || !report.plugin?.next_action?.text?.includes("observed SDK: 1.17.11")
      || report.next_action?.code !== "retry_plugin"
      || !humanOutput.includes("Result: failed")
      || !humanOutput.includes("Plugin state: degraded")
      || !humanOutput.includes("Plugin SDK alignment: unavailable (target 1.18.3; installed 1.17.11)")
      || !humanOutput.includes("Next action: Resolve the plugin failure")) {
      throw new Error("unavailable exact SDK alignment must return one observable partial lifecycle recovery result.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("opencode global preservation");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-global-preservation-"));
  const userSkillPath = join(tempDir, "skills", "user-skill", "SKILL.md");
  mkdirSync(join(tempDir, "skills", "user-skill"), { recursive: true });
  writeFileSync(userSkillPath, "---\nname: user-skill\ndescription: User-owned skill.\n---\n\nUser content.\n", "utf8");
  writeFileSync(join(tempDir, "opencode.json"), JSON.stringify({
    "$schema": "https://opencode.ai/config.json",
    plugin: ["user-plugin"],
    instructions: ["user.md"],
    permission: { edit: "allow", bash: "deny", skill: { "user-*": "deny" } },
  }, null, 2), "utf8");
  writeFileSync(join(tempDir, "package.json"), JSON.stringify({
    name: "preservation-fixture",
    dependencies: { "user-dependency": "1.2.3", [pluginDefinition.opencode.npmPackage]: "file:./.npm/_npx/legacy/node_modules/create-agdf" },
  }, null, 2), "utf8");
  writeFileSync(join(tempDir, "package-lock.json"), JSON.stringify({
    name: "preservation-fixture",
    lockfileVersion: 3,
    packages: {
      "": { dependencies: { "user-dependency": "1.2.3", [pluginDefinition.opencode.npmPackage]: "file:./.npm/_npx/legacy/node_modules/create-agdf" } },
      "node_modules/user-dependency": { version: "1.2.3" },
      ".npm/_npx/legacy/node_modules/create-agdf": { version: "0.0.1" },
    },
  }, null, 2), "utf8");
  const legacySourcePath = join(tempDir, ".npm", "_npx", "legacy", "node_modules", pluginDefinition.opencode.npmPackage);
  mkdirSync(legacySourcePath, { recursive: true });
  writeFileSync(join(legacySourcePath, "package.json"), JSON.stringify({
    name: pluginDefinition.opencode.npmPackage,
    version: "0.0.1",
  }), "utf8");
  runOpenCodeCli(["opencode", "--dir", tempDir], { encoding: "utf8", stdio: "pipe" });
  const preservedConfig = JSON.parse(readFileSync(join(tempDir, "opencode.json"), "utf8"));
  if (!preservedConfig.plugin.includes("user-plugin") || !preservedConfig.instructions.includes("user.md")
    || preservedConfig.permission.edit !== "allow" || preservedConfig.permission.bash !== "deny"
    || preservedConfig.permission.question !== "allow"
    || preservedConfig.permission.skill["user-*"] !== "deny" || !preservedConfig.permission.skill["agdf-*"]) {
    throw new Error("opencode global install must preserve unrelated config and add only owned entries.");
  }
  if (readFileSync(userSkillPath, "utf8") !== "---\nname: user-skill\ndescription: User-owned skill.\n---\n\nUser content.\n") {
    throw new Error("opencode global install must preserve unrelated user-owned skills.");
  }
  const migratedManifest = JSON.parse(readFileSync(join(tempDir, "package.json"), "utf8"));
  const migratedLock = JSON.parse(readFileSync(join(tempDir, "package-lock.json"), "utf8"));
  if (migratedManifest.dependencies[pluginDefinition.opencode.npmPackage] !== pluginDefinition.version
    || migratedManifest.dependencies["user-dependency"] !== "1.2.3"
    || migratedLock.packages["node_modules/user-dependency"]?.version !== "1.2.3"
    || Object.keys(migratedLock.packages).some((key) => key.includes(".npm/_npx"))) {
    throw new Error("opencode update must migrate the AGDF file dependency while preserving unrelated package state.");
  }
  rmSync(join(tempDir, ".npm"), { recursive: true, force: true });
  const migratedStatus = JSON.parse(execFileSync(process.execPath, [binPath, "opencode-status", "--dir", tempDir, "--json"], {
    encoding: "utf8",
    stdio: "pipe",
    env: { ...process.env, OPENCODE_CONFIG_DIR: tempDir },
  }));
  if (!migratedStatus.package.loadable
    || migratedStatus.package.installed_version !== pluginDefinition.version
    || migratedStatus.package.version_status !== "current") {
    throw new Error("opencode registry migration must remain loadable after the legacy npx-cache source is removed.");
  }
  rmSync(tempDir, { recursive: true, force: true });
}

for (const explicitQuestionDecision of ["allow", "deny"]) {
  const tempDir = mkdtempSync(join(tmpdir(), `create-agdf-opencode-question-${explicitQuestionDecision}-`));
  try {
    writeFileSync(join(tempDir, "opencode.json"), JSON.stringify({
      "$schema": "https://opencode.ai/config.json",
      permission: { question: explicitQuestionDecision },
    }, null, 2), "utf8");
    runOpenCodeCli(["opencode", "--dir", tempDir], { encoding: "utf8", stdio: "pipe" });
    const config = JSON.parse(readFileSync(join(tempDir, "opencode.json"), "utf8"));
    if (config.permission.question !== explicitQuestionDecision) {
      throw new Error(`opencode global install must preserve explicit question ${explicitQuestionDecision}.`);
    }
    if (config.permission.edit !== "ask" || config.permission.bash !== "ask") {
      throw new Error("opencode global install must fill missing canonical edit/bash permissions.");
    }
    if (config.permission.skill?.["agdf-*"] !== "allow") {
      throw new Error("opencode global install must add its owned skill permission beside an explicit question decision.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("opencode global collision");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-global-collision-"));
  const configPath = join(tempDir, "opencode.json");
  const instructionsPath = join(tempDir, "AGDF.md");
  const originalConfig = JSON.stringify({ plugin: ["user-plugin"], permission: { edit: "ask", bash: "ask" } }, null, 2) + "\n";
  writeFileSync(configPath, originalConfig, "utf8");
  writeFileSync(instructionsPath, "# User AGDF instructions\n<!-- AGDF-GLOBAL-INSTRUCTIONS -->\n", "utf8");
  let rejected = false;
  try {
    runOpenCodeCli(["opencode", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
  } catch (error) {
    const report = JSON.parse(String(error.stdout || "{}"));
    rejected = report.result === "failed"
      && report.setup_request === "plugin_only"
      && report.failure?.phase === "plugin_operation"
      && report.failure?.code === "plugin_operation_failed"
      && report.plugin?.failure?.phase === "ownership_preflight";
  }
  if (!rejected || readFileSync(configPath, "utf8") !== originalConfig || existsSync(join(tempDir, "node_modules"))) {
    throw new Error("opencode global install must preflight collisions before mutating config or installing the package.");
  }
  rmSync(tempDir, { recursive: true, force: true });
}

smokePhase("opencode validator package collision");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-validator-package-collision-"));
  const validatorPackagePath = join(tempDir, "agdf", "package.json");
  const originalConfig = JSON.stringify({ plugin: ["user-plugin"] }, null, 2) + "\n";
  mkdirSync(dirname(validatorPackagePath), { recursive: true });
  writeFileSync(join(tempDir, "opencode.json"), originalConfig, "utf8");
  writeFileSync(validatorPackagePath, JSON.stringify({ name: "user-owned-package", type: "commonjs" }, null, 2) + "\n", "utf8");
  let rejected = false;
  try {
    runOpenCodeCli(["opencode", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
  } catch (error) {
    const report = JSON.parse(String(error.stdout || "{}"));
    rejected = report.result === "failed"
      && report.setup_request === "plugin_only"
      && report.failure?.phase === "plugin_operation"
      && report.failure?.code === "plugin_operation_failed"
      && report.plugin?.failure?.phase === "ownership_preflight";
  }
  if (!rejected || readFileSync(join(tempDir, "opencode.json"), "utf8") !== originalConfig || existsSync(join(tempDir, "node_modules"))) {
    throw new Error("opencode global install must preflight an unowned validator package before config or package mutation.");
  }
  rmSync(tempDir, { recursive: true, force: true });
}

function packageStatusFixture(version, includeVersion = true) {
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-version-status-"));
  const packageDir = join(tempDir, "node_modules", pluginDefinition.opencode.npmPackage);
  mkdirSync(packageDir, { recursive: true });
  const manifest = { name: pluginDefinition.opencode.npmPackage, main: "index.js" };
  if (includeVersion) manifest.version = version;
  writeFileSync(join(packageDir, "package.json"), JSON.stringify(manifest, null, 2), "utf8");
  writeFileSync(join(packageDir, "index.js"), "module.exports = {};\n", "utf8");
  writeFileSync(join(tempDir, "opencode.json"), JSON.stringify({ plugin: [pluginDefinition.opencode.npmPackage] }), "utf8");
  return tempDir;
}

function readPackageStatus(tempDir) {
  try {
    return JSON.parse(execFileSync(process.execPath, [binPath, "opencode-status", "--dir", tempDir, "--json"], {
      encoding: "utf8",
      stdio: "pipe",
      env: { ...process.env, OPENCODE_CONFIG_DIR: tempDir },
    })).package;
  } catch (error) {
    if (error.stdout) return JSON.parse(error.stdout).package;
    throw error;
  }
}

{
  const currentDir = packageStatusFixture(pluginDefinition.version);
  const outdatedDir = packageStatusFixture("0.0.1");
  const unknownDir = packageStatusFixture("", false);
  const unloadableDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-version-unloadable-"));
  writeFileSync(join(unloadableDir, "opencode.json"), JSON.stringify({ plugin: [pluginDefinition.opencode.npmPackage] }), "utf8");
  try {
    const current = readPackageStatus(currentDir);
    const outdated = readPackageStatus(outdatedDir);
    const unknown = readPackageStatus(unknownDir);
    const unloadable = readPackageStatus(unloadableDir);
    if (current.installed_version !== pluginDefinition.version || current.expected_version !== pluginDefinition.version || current.version_status !== "current") {
      throw new Error("current OpenCode package fixture must classify as current.");
    }
    if (outdated.installed_version !== "0.0.1" || outdated.version_status !== "outdated") {
      throw new Error("outdated OpenCode package fixture must classify as outdated.");
    }
    if (unknown.installed_version !== null || unknown.version_status !== "unknown") {
      throw new Error("versionless OpenCode package fixture must classify as unknown.");
    }
    if (unloadable.installed_version !== null || unloadable.version_status !== "unloadable") {
      throw new Error("unloadable OpenCode package fixture must classify as unloadable.");
    }
  } finally {
    rmSync(currentDir, { recursive: true, force: true });
    rmSync(outdatedDir, { recursive: true, force: true });
    rmSync(unknownDir, { recursive: true, force: true });
    rmSync(unloadableDir, { recursive: true, force: true });
  }
}

function runOpenCodeWithPreinstalledVersion(version, includeVersion = true) {
  const tempDir = packageStatusFixture(version, includeVersion);
  const output = runOpenCodeCli(["opencode", "--dir", tempDir, "--verbose"], { encoding: "utf8", stdio: "pipe" });
  return { tempDir, output };
}

{
  const updated = runOpenCodeWithPreinstalledVersion("0.0.1");
  const unchanged = runOpenCodeCli(["opencode", "--dir", updated.tempDir, "--verbose"], { encoding: "utf8", stdio: "pipe" });
  const unknown = runOpenCodeWithPreinstalledVersion("", false);
  try {
    if (!updated.output.includes(`AGDF version: 0.0.1 -> ${pluginDefinition.version}`)) {
      throw new Error("opencode update must report an observable previous-to-installed version transition.");
    }
    if (!unchanged.includes(`AGDF version: ${pluginDefinition.version} (unchanged)`)) {
      throw new Error("opencode repeat install must report an unchanged version transition.");
    }
    if (!unknown.output.includes(`AGDF version: ${pluginDefinition.version} (transition unknown)`)) {
      throw new Error("opencode must not invent a transition when the previous package version is unreadable.");
    }
  } finally {
    rmSync(updated.tempDir, { recursive: true, force: true });
    rmSync(unknown.tempDir, { recursive: true, force: true });
  }
}

rmSync(openCodeNpmFixtureDir, { recursive: true, force: true });

function run(target, expectedFiles) {
  const tempDir = mkdtempSync(join(tmpdir(), `create-agdf-${target}-`));

  try {
    execFileSync(process.execPath, [binPath, target, "--dir", tempDir], { stdio: "pipe" });

    for (const relativePath of expectedFiles) {
      const outputPath = join(tempDir, relativePath);
      if (!existsSync(outputPath)) {
        throw new Error(`Missing expected file for ${target}: ${relativePath}`);
      }
    }

    if (target === "codex-repo") {
      const pluginRouterPath = join(tempDir, "plugins", "agdf", "meta", "agdf-agent-router.md");
      const pluginRouter = readFileSync(pluginRouterPath, "utf8");
      if (!pluginRouter.includes("| `gate-check` |")) {
        throw new Error(`Missing unprefixed plugin skill routing for ${target}.`);
      }
      if (pluginRouter.includes("`agdf-gate-check`")) {
        throw new Error(`Plugin router for ${target} must not contain Copilot-prefixed skill names.`);
      }
    }

    if (target === "opencode-repo" && (existsSync(join(tempDir, "opencode.json")) || existsSync(join(tempDir, ".opencode")))) {
      throw new Error("opencode-repo must activate durable control without copying an OpenCode runtime surface.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("repository bootstrap scenarios");
run("codex-repo", [
  join(".agdf", "control", "config.json"),
  join(".agents", "plugins", "marketplace.json"),
  join("plugins", "agdf", ".codex-plugin", "plugin.json"),
  join("plugins", "agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "OR.md"),
  join("plugins", "agdf", "hooks", "hooks.json"),
  join("plugins", "agdf", "hooks", "session-start.sh"),
  join("plugins", "agdf", "meta", "agdf-agent-router.md"),
  join("plugins", "agdf", "meta", "agdf-constitution.md"),
  join("plugins", "agdf", "meta", "agdf-plugin.definition.json"),
  join("plugins", "agdf", "meta", "agdf-runtime-contract.md"),
  join("plugins", "agdf", "meta", "agdf-tenets.md"),
  ...contractModules.map((moduleName) => join("plugins", "agdf", "meta", "contracts", moduleName)),
  ...["gate-check", "code-review", "qa-gate"].map((slug) => join("plugins", "agdf", "skills", `${pluginDefinition.codex.skillPrefix}${slug}`, "SKILL.md")),
]);
run("opencode-repo", [
  join(".agdf", "control", "config.json"),
  join(".agdf", "control", "README.md"),
  join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
]);

smokePhase("opencode agent migration");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-agent-migration-"));
  const agentsDir = join(tempDir, ".opencode", "agents");
  const gateCheckDefinition = pluginDefinition.skillSet.find((skill) => skill.slug === "gate-check");
  const legacyAgentPath = join(agentsDir, `${pluginDefinition.opencode.skillPrefix}gate-check.md`);
  const userAgentPath = join(agentsDir, "user-owned.md");

  try {
    mkdirSync(agentsDir, { recursive: true });
    writeFileSync(legacyAgentPath, [
      "---",
      `description: ${gateCheckDefinition.useFor}`,
      "mode: subagent",
      "---",
      "",
      "# gate-check",
      "",
      "legacy generated content",
      "",
    ].join("\n"), "utf8");
    writeFileSync(userAgentPath, "---\ndescription: user owned\nmode: subagent\n---\n\n# User agent\n", "utf8");

    execFileSync(process.execPath, [binPath, "opencode-repo", "--dir", tempDir, "--force"], { stdio: "pipe" });

    if (!existsSync(legacyAgentPath)) {
      throw new Error("opencode-repo migration must preserve owned legacy OpenCode assets by default.");
    }
    if (!existsSync(userAgentPath)) {
      throw new Error("opencode-repo migration must preserve unrelated user-owned agents.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("opencode existing config");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-existing-config-"));

  try {
    writeFileSync(join(tempDir, "opencode.json"), '{\n  "$schema": "https://opencode.ai/config.json",\n  "permission": { "question": "deny" }\n}\n', "utf8");
    const output = execFileSync(process.execPath, [binPath, "opencode-repo", "--dir", tempDir, "--verbose"], { encoding: "utf8", stdio: "pipe" });

    const existingConfig = JSON.parse(readFileSync(join(tempDir, "opencode.json"), "utf8"));
    if (existingConfig.instructions?.includes(".opencode/AGDF.md") || existingConfig.permission.question !== "deny") {
      throw new Error("OpenCode target must not overwrite an existing opencode.json or its explicit question denial without --force.");
    }
    if (existsSync(join(tempDir, "opencode.agdf.json")) || !output.includes("does not copy a second runtime surface")) {
      throw new Error("OpenCode activation must preserve existing configuration without writing a second config surface.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}
smokePhase("configuration and locale scenarios");
run("config", [
  join(".agdf", "control", "config.json"),
]);

smokePhase("init");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-init-"));

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });

    for (const relativePath of [
      join(".agdf", "control", "config.json"),
      join(".agdf", "control", "README.md"),
      join(".agdf", "control", "runs"),
      join(".agdf", "control", "SOT_REGISTRY.md"),
      join(".agdf", "control", "CONTEXT_GRAPH.md"),
      join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json"),
      join(".agdf", "control", "templates", "artefacts", "UR.md"),
      join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
      join(".agdf", "control", "templates", "artefacts", "PRD.md"),
      join(".agdf", "control", "templates", "artefacts", "SD.md"),
      join(".agdf", "control", "templates", "artefacts", "TP.md"),
      join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
      join(".agdf", "control", "templates", "artefacts", "OR.md"),
    ]) {
      if (!existsSync(join(tempDir, relativePath))) {
        throw new Error(`Missing live control file for init: ${relativePath}`);
      }
    }
    if (existsSync(join(tempDir, ".agdf", "control", "MASTER_BACKLOG.md"))
        || existsSync(join(tempDir, ".agdf", "control", "AGDF_RUN.md"))
        || readdirSync(join(tempDir, ".agdf", "control", "runs")).length !== 0) {
      throw new Error("Canonical init must create an empty run store without a live legacy run.");
    }

    const doctorReport = runJson(["doctor", "--dir", tempDir, "--json"]);
    if (doctorReport.status !== "block") {
      throw new Error(`Doctor should block a fresh canonical scaffold without a selected run, got ${doctorReport.status}.`);
    }
    if (!doctorReport.findings.some((finding) => finding.code === "AGDF_ACTIVE_RUN_MISSING")) {
      throw new Error("Doctor should report that canonical control exists without an active run.");
    }

    let gateCheckFailed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      gateCheckFailed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block a fresh unfilled control scaffold, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.current_gate !== "UR") {
        throw new Error(`Gate-check should fall back to UR for a fresh scaffold, got ${gateCheckReport.current_gate}.`);
      }
      if (!gateCheckReport.allowed.includes("create or migrate a canonical run with an explicit run id")) {
        throw new Error("Gate-check should require canonical run creation or migration before later artefacts.");
      }
      if (gateCheckReport.missing_approval !== "none" || gateCheckReport.approval_presentation !== null) {
        throw new Error("Gate-check must not request approval before a durable run and UR revision exist.");
      }
      if (!gateCheckReport.next_allowed_action.includes("Create, migrate or select")) {
        throw new Error("Gate-check should make canonical run setup the constructive next action for a fresh scaffold.");
      }
      if (gateCheckReport.doctor_status !== "block") {
        throw new Error(`Gate-check should embed the doctor block status, got ${gateCheckReport.doctor_status}.`);
      }
      if (!gateCheckReport.doctor_report?.findings?.some((finding) => finding.code === "AGDF_ACTIVE_RUN_MISSING")) {
        throw new Error("Gate-check should include the doctor report as evidence.");
      }
      if (!gateCheckReport.status_card || gateCheckReport.status_card.current_gate !== "UR") {
        throw new Error("Gate-check JSON should include the compact status_card projection.");
      }
      if (gateCheckReport.evidence_refs.length !== 0) {
        throw new Error("Gate-check should not expose empty template evidence rows.");
      }
    }
    if (!gateCheckFailed) {
      throw new Error("Gate-check should exit non-zero when a fresh control scaffold is blocked.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("gate check status card");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-status-card-"));

  try {
    // Explicit English keeps this check independent of the machine locale.
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir, "--language", "en"], { stdio: "pipe" });
    createRun(tempDir, "status-card"); // Private current-format synthetic fixture identity.
    // The missing-run route now renders assignment orientation. Use an explicitly bound
    // run with an unrecorded edit to exercise the blocked status-card and exit code.
    const runPath = join(tempDir, ".agdf", "control", "runs", "status-card", "RUN_STATE.md");
    writeFileSync(runPath, `${readFileSync(runPath, "utf8")}\nUnrecorded fixture edit.\n`, "utf8");
    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "status-card", "--status-card"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const output = error.stdout.toString();
      if (!output.includes("## AGDF status-card")
        || !output.includes("| Status | blocked |")
        || !output.includes("| Current gate | User requirements (`UR`) |")
        || !output.includes("| Next permitted agent action |")) {
        throw new Error("gate-check --status-card should print compact status-card fields, including the actor row.");
      }
      if (output.includes("doctor_report") || output.includes("delivery_map")) {
        throw new Error("gate-check --status-card must not print the full JSON report.");
      }
    }
    if (!failed) {
      throw new Error("gate-check --status-card should preserve the blocked exit code when the gate is blocked.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("language explicit");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-language-explicit-"));

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir, "--language", "de"], { stdio: "pipe" });
    const config = JSON.parse(readFileSync(join(tempDir, ".agdf", "control", "config.json"), "utf8"));
    if (config.artifact_language !== "de" || config.chat_language !== "de" || config.runtime_language !== "en") {
      throw new Error("Explicit --language de should set artefact/chat language to de and runtime language to en.");
    }
    if (config.source !== "parameter") {
      throw new Error(`Explicit --language should record source=parameter, got ${config.source}.`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("language config update");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-language-config-update-"));

  try {
    execFileSync(process.execPath, [binPath, "config", "--dir", tempDir, "--language", "de"], { stdio: "pipe" });
    let config = JSON.parse(readFileSync(join(tempDir, ".agdf", "control", "config.json"), "utf8"));
    if (config.artifact_language !== "de" || config.chat_language !== "de") {
      throw new Error("Config target should write only the requested project language.");
    }
    if (existsSync(join(tempDir, ".agdf", "control", "MASTER_BACKLOG.md"))) {
      throw new Error("Config target must not create a shared legacy backlog.");
    }
    if (existsSync(join(tempDir, ".agdf", "control", "AGDF_RUN.md"))) {
      throw new Error("Config target must not create live AGDF control files.");
    }

    execFileSync(process.execPath, [binPath, "config", "--dir", tempDir, "--language", "en"], { stdio: "pipe" });
    config = JSON.parse(readFileSync(join(tempDir, ".agdf", "control", "config.json"), "utf8"));
    if (config.artifact_language !== "en" || config.chat_language !== "en" || config.runtime_language !== "en") {
      throw new Error("Config target should update existing config.json without requiring --force.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("language locale");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-language-locale-"));

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], {
      stdio: "pipe",
      env: {
        ...process.env,
        LC_ALL: "",
        LC_MESSAGES: "",
        LANGUAGE: "",
        LANG: "de_DE.UTF-8",
      },
    });
    const config = JSON.parse(readFileSync(join(tempDir, ".agdf", "control", "config.json"), "utf8"));
    if (config.artifact_language !== "de" || config.chat_language !== "de") {
      throw new Error("System locale de_DE.UTF-8 should default artefact/chat language to de.");
    }
    if (config.source !== "system_locale" || config.detected_locale !== "de_DE.UTF-8") {
      throw new Error(`System locale detection should record source and locale, got ${config.source}/${config.detected_locale}.`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("localized status cards");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-status-card-i18n-"));

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir, "--language", "de"], { stdio: "pipe" });
    createRun(tempDir, "locale-card"); // Private current-format synthetic fixture identity.
    const german = spawnSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "locale-card", "--status-card"], { encoding: "utf8" }).stdout;
    if (!german.includes("## AGDF-Statuskarte")
      || !german.includes("| Ausgewählter Run |") || !german.includes("`locale-card`")
      || !german.includes("| Aktuelles Gate | Nutzeranforderungen (`UR`) |")
      || !german.includes("| Fehlende Freigabe | keine |")
      || /Approval: UR|Freigabe anfordern/u.test(german)) {
      throw new Error("German chat language should render a German status card without requesting approval for an absent UR.");
    }
    for (const rawPrimary of ["internal_next_step", "next_user_gate", "mode_slice_decision", "Internal next step", "Allowed now:"]) {
      if (german.includes(rawPrimary)) throw new Error(`German primary status card must not expose mixed or raw process wording: ${rawPrimary}`);
    }
    const configPath = join(tempDir, ".agdf", "control", "config.json");
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    writeFileSync(configPath, `${JSON.stringify({ ...config, chat_language: "fr" }, null, 2)}\n`, "utf8");
    const fallback = spawnSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "locale-card", "--status-card"], { encoding: "utf8" }).stdout;
    if (!fallback.includes("## AGDF status-card")
      || !fallback.includes("| Selected run |") || !fallback.includes("`locale-card`")
      || !fallback.includes("| Current gate | User requirements (`UR`) |")
      || !fallback.includes("| Missing approval | none |")
      || /Approval: UR|request exact UR approval/u.test(fallback)) {
      throw new Error("Unsupported chat language should fall back to English without requesting approval for an absent UR.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

// Positive v2 tables and Masterbacklog projection cases are retired. Current
// typed late-gate ownership is exercised here through actual commands. Detailed
// source/decision/refusal cases live in the canonical run-command-flow, current
// binding/seal, QA follow-up and revision suites; unsupported-old stores have
// explicit read-only negatives in control-compatibility and run-recovery.
smokePhase("current command-owned late-gate transitions");
checkLateGateTransitions();

smokePhase("doctor missing");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-doctor-missing-"));

  try {
    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "doctor", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const output = error.stdout.toString();
      const doctorReport = JSON.parse(output);
      if (doctorReport.status !== "block") {
        throw new Error(`Doctor should block when live control files are missing, got ${doctorReport.status}.`);
      }
      if (!doctorReport.findings.some((finding) => finding.code === "AGDF_CONTROL_FILE_MISSING")) {
        throw new Error("Doctor should report missing live control files.");
      }
    }

    if (!failed) {
      throw new Error("Doctor should exit non-zero when live control files are missing.");
    }

    let gateCheckFailed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      gateCheckFailed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked" || gateCheckReport.doctor_status !== "block") {
        throw new Error("Gate-check should block when doctor blocks missing live control files.");
      }
      if (gateCheckReport.blocking_reason !== "AGDF_CONTROL_FILE_MISSING") {
        throw new Error(`Gate-check should expose the doctor blocker, got ${gateCheckReport.blocking_reason}.`);
      }
      if (gateCheckReport.current_gate !== "UR") {
        throw new Error(`Gate-check should orient missing control files to UR, got ${gateCheckReport.current_gate}.`);
      }
      if (!gateCheckReport.allowed.includes("draft the minimal UR for the requested change in the response")) {
        throw new Error("Gate-check should allow minimal in-response UR drafting when control files are missing.");
      }
      if (gateCheckReport.missing_approval !== "none" || gateCheckReport.approval_presentation !== null) {
        throw new Error("Gate-check must not request gate approval before durable control and a revision-stable UR exist.");
      }
      if (gateCheckReport.interaction_kind !== "control_setup"
        || gateCheckReport.status_presentation?.status !== "control_setup_required"
        || !gateCheckReport.next_allowed_action.includes("obtain explicit setup or link authority")) {
        throw new Error("Gate-check should orient missing control to explicit setup before any gate approval.");
      }
      if (!gateCheckReport.forbidden.includes("implement code")) {
        throw new Error("Gate-check should still forbid implementation when control files are missing.");
      }
    }

    if (!gateCheckFailed) {
      throw new Error("Gate-check should exit non-zero when live control files are missing.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

smokePhase("generated host surface scenarios");
{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-retired-copilot-targets-"));
  const existingAgentsPath = join(tempDir, "AGENTS.md");

  try {
    writeFileSync(existingAgentsPath, "# Existing repo instructions\n", "utf8");
    for (const retiredTarget of ["copilot-plugin", "both"]) {
      let failed = false;
      try {
        execFileSync(process.execPath, [binPath, retiredTarget, "--dir", tempDir], { stdio: "pipe" });
      } catch {
        failed = true;
      }
      if (!failed) throw new Error(`${retiredTarget} must be rejected.`);
    }
    if (readFileSync(existingAgentsPath, "utf8") !== "# Existing repo instructions\n") {
      throw new Error("Rejected Copilot targets must not rewrite existing repository files.");
    }
    if (existsSync(join(tempDir, "AGENTS.agdf.md")) || existsSync(join(tempDir, ".github")) || existsSync(join(tempDir, ".agdf"))) {
      throw new Error("Rejected Copilot targets must not create repository projections or control files.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

console.log("create-agdf smoke test passed");
