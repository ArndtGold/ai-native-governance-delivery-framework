import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { delimiter, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = new URL("..", import.meta.url);
const binPath = fileURLToPath(new URL("./bin/create-agdf.js", packageRoot));
const packageJsonPath = fileURLToPath(new URL("./package.json", packageRoot));
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const generatedRoot = fileURLToPath(new URL("./generated/", packageRoot));
const pluginDefinitionPath = fileURLToPath(new URL("../plugin/meta/agdf-plugin.definition.json", packageRoot));
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
  return binDir;
}

function runCliWithPath(args, binDir, extraEnv = {}) {
  return execFileSync(process.execPath, [binPath, ...args], {
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
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
for (const entry of ["bin", "lib", "generated"]) {
  fs.cpSync(path.join(${JSON.stringify(fileURLToPath(packageRoot))}, entry), path.join(packageDir, entry), { recursive: true });
}
fs.writeFileSync(path.join(packageDir, "package.json"), JSON.stringify({
  name: ${JSON.stringify(pluginDefinition.opencode.npmPackage)},
  version: ${JSON.stringify(pluginDefinition.version)},
  type: "module",
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
const openCodeHostBin = join(openCodeHostBinDir, "opencode");
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
  const guardrailsWorkflowPath = fileURLToPath(new URL("../.github/workflows/agdf-guardrails.yml", packageRoot));
  const guardrailsWorkflow = readFileSync(guardrailsWorkflowPath, "utf8");
  const syncMarker = "run: npm --prefix create-agdf run release:prepare";
  const deliveryMapMarker = "run: node create-agdf/bin/create-agdf.js delivery-map --dir . --all-active";
  if (!guardrailsWorkflow.includes(syncMarker) || !guardrailsWorkflow.includes(deliveryMapMarker)
    || guardrailsWorkflow.indexOf(syncMarker) > guardrailsWorkflow.indexOf(deliveryMapMarker)) {
    throw new Error("AGDF guardrails must prepare and verify release assets before running delivery-map directly from source.");
  }
}

{
  const publishWorkflowPath = fileURLToPath(new URL("../.github/workflows/publish-agdf.yml", packageRoot));
  const publishWorkflow = readFileSync(publishWorkflowPath, "utf8");
  for (const requiredSnippet of [
    "Wait for create-agdf readiness",
    "Wait for @agdf/cli readiness",
    "MAX_ATTEMPTS=20",
    "SLEEP_SECONDS=15",
    "NPM_ERROR_LOG=\"$(mktemp)\"",
    "wait_for_npm_package \"create-agdf\"",
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
    && publishWorkflow.indexOf("Wait for create-agdf readiness") < publishWorkflow.indexOf("Publish @agdf/cli to npm")
    && publishWorkflow.indexOf("Publish @agdf/cli to npm") < publishWorkflow.indexOf("Wait for @agdf/cli readiness"))) {
    throw new Error("Publish workflow must wait for create-agdf readiness before publishing @agdf/cli, then wait for @agdf/cli readiness.");
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
  const publishJobIndex = publishWorkflow.indexOf("\n  publish:");
  const validateJob = publishWorkflow.slice(0, publishJobIndex);
  const publishJob = publishWorkflow.slice(publishJobIndex);
  if (!(validateJob.indexOf("Verify runtime-free source and plugin metadata") < validateJob.indexOf("Prepare and verify release assets")
    && validateJob.indexOf("Prepare and verify release assets") < validateJob.indexOf("Verify built plugin integrity")
    && validateJob.indexOf("Verify built plugin integrity") < validateJob.indexOf("Run create-agdf smoke test")
    && validateJob.indexOf("Run create-agdf smoke test") < validateJob.indexOf("Verify create-agdf package contents"))) {
    throw new Error("Publish validation must verify runtime-free source, prepare release assets and verify installed/package layouts before publication eligibility.");
  }
  if (!(publishJob.indexOf("Prepare and verify release assets") < publishJob.indexOf("Verify built plugin integrity")
    && publishJob.indexOf("Verify built plugin integrity") < publishJob.indexOf("Verify create-agdf package contents")
    && publishJob.indexOf("Verify create-agdf package contents") < publishJob.indexOf("Publish create-agdf to npm")
    && publishJob.includes("contents: read"))) {
    throw new Error("Publish job must prepare and verify the release-built plugin with read-only repository contents before npm publish.");
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-codex-global-"));
  const logPath = join(tempDir, "codex.log");

  try {
    const binDir = makeFakeExecutable(tempDir, "codex", `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_CODEX_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "plugin marketplace list --json") console.log(JSON.stringify({ marketplaces: [] }));
if (args.join(" ") === "plugin list") {
  console.log("agdf@agdf ${pluginDefinition.version}");
}
`);
    const dataRoot = join(tempDir, "agdf-data");
    const output = runCliWithPath(["codex", "--verbose"], binDir, { FAKE_CODEX_LOG: logPath, AGDF_DATA_DIR: dataRoot });
    const calls = readJsonLines(logPath).map((args) => args.join(" "));
    const expectedCalls = [
      "plugin marketplace list --json",
      `plugin marketplace add ${join(dataRoot, "marketplaces", "agdf")} --json`,
      "plugin add agdf@agdf --json",
      "plugin list",
    ];
    if (JSON.stringify(calls) !== JSON.stringify(expectedCalls)) {
      throw new Error(`Codex global bootstrap command order changed: ${calls.join(" | ")}`);
    }
    if (!output.includes(`Version: ${pluginDefinition.version} (verified)`) || !output.includes("Installation: healthy") || !output.includes("Verification: healthy")) {
      throw new Error("Codex global bootstrap must report verified plugin version.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-codex-mismatch-"));
  const logPath = join(tempDir, "codex.log");

  try {
    const binDir = makeFakeExecutable(tempDir, "codex", `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_CODEX_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "plugin marketplace list --json") console.log(JSON.stringify({ marketplaces: [] }));
if (args.join(" ") === "plugin list") {
  console.log("agdf@agdf 0.0.0");
}
`);
    let failed = false;
    try {
      runCliWithPath(["codex"], binDir, { FAKE_CODEX_LOG: logPath, AGDF_DATA_DIR: join(tempDir, "agdf-data") });
    } catch (error) {
      failed = true;
      const stderr = error.stderr.toString();
      if (!stderr.includes(`expected ${pluginDefinition.version}`) || !stderr.includes("observed 0.0.0") || !stderr.includes("@agdf/cli@latest codex")) {
        throw new Error(`Codex mismatch error must be actionable, got: ${stderr}`);
      }
    }
    if (!failed) throw new Error("Codex global bootstrap must fail when the installed plugin version mismatches.");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

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
    if (!output.includes(`Version: ${pluginDefinition.version} (verified)`) || !output.includes("Installation: healthy") || !output.includes("Verification: healthy")) {
      throw new Error("Claude install must report verified plugin version when exposed.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-claude-update-"));
  const logPath = join(tempDir, "claude.log");
  const statePath = join(tempDir, "installed");
  writeFileSync(statePath, "installed", "utf8");

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
if (args.join(" ") === "plugin uninstall agdf@agdf") {
  fs.rmSync(process.env.FAKE_CLAUDE_STATE, { force: true });
}
if (args.join(" ") === "plugin install agdf@agdf") {
  fs.writeFileSync(process.env.FAKE_CLAUDE_STATE, "installed");
}
`);
    runCliWithPath(["claude"], binDir, { FAKE_CLAUDE_LOG: logPath, FAKE_CLAUDE_STATE: statePath, AGDF_DATA_DIR: join(tempDir, "agdf-data") });
    const calls = readJsonLines(logPath).map((args) => args.join(" "));
    const uninstallIndex = calls.indexOf("plugin uninstall agdf@agdf");
    const installIndex = calls.indexOf("plugin install agdf@agdf");
    if (uninstallIndex < 0 || installIndex < 0 || uninstallIndex >= installIndex || calls.includes("plugin update agdf@agdf")) {
      throw new Error(`Claude existing install must use uninstall then install: ${calls.join(" | ")}`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

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
    const output = runCliWithPath(["claude", "--verbose"], binDir, { FAKE_CLAUDE_LOG: logPath, FAKE_CLAUDE_STATE: statePath, AGDF_DATA_DIR: join(tempDir, "agdf-data") });
    if (!output.includes(`Version: unknown; expected ${pluginDefinition.version} (unknown)`) || !output.includes("Installation: degraded") || !output.includes("Verification: degraded")) {
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
  if (!installOutput.includes(`Version: ${pluginDefinition.version} (verified; transition installed)`)
    || !installOutput.includes("Verification: healthy")
    || !installOutput.includes("OpenCode host / plugin SDK:")
    || !installOutput.includes("Plugin SDK alignment: aligned (target 1.18.3; installed 1.18.3)")
    || !installOutput.includes("Experimental hook declarations: declared_supported")
    || !installOutput.includes("Installation scope: global")
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
    if (report?.result !== "partial"
      || report.verification?.status !== "degraded"
      || !report.verification?.evidence?.includes("sdk_alignment=unavailable;target=1.18.3;installed=1.17.11")
      || report.next_action?.kind !== "recovery"
      || !report.next_action?.text?.includes("@opencode-ai/plugin")
      || !report.next_action?.text?.includes("observed SDK: 1.17.11")
      || !humanOutput.includes("AGDF installation partially completed")
      || !humanOutput.includes("Plugin SDK alignment: unavailable (target 1.18.3; installed 1.17.11)")
      || !humanOutput.includes("Next action: Retry the OpenCode installation")) {
      throw new Error("unavailable exact SDK alignment must return one observable partial lifecycle recovery result.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

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

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-global-collision-"));
  const configPath = join(tempDir, "opencode.json");
  const instructionsPath = join(tempDir, "AGDF.md");
  const originalConfig = JSON.stringify({ plugin: ["user-plugin"], permission: { edit: "ask", bash: "ask" } }, null, 2) + "\n";
  writeFileSync(configPath, originalConfig, "utf8");
  writeFileSync(instructionsPath, "# User AGDF instructions\n<!-- AGDF-GLOBAL-INSTRUCTIONS -->\n", "utf8");
  let rejected = false;
  try {
    runOpenCodeCli(["opencode", "--dir", tempDir], { encoding: "utf8", stdio: "pipe" });
  } catch (error) {
    rejected = String(error.stderr || error.stdout || error.message).includes("Refusing to overwrite unowned global OpenCode file");
  }
  if (!rejected || readFileSync(configPath, "utf8") !== originalConfig || existsSync(join(tempDir, "node_modules"))) {
    throw new Error("opencode global install must preflight collisions before mutating config or installing the package.");
  }
  rmSync(tempDir, { recursive: true, force: true });
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-opencode-validator-package-collision-"));
  const validatorPackagePath = join(tempDir, "agdf", "package.json");
  const originalConfig = JSON.stringify({ plugin: ["user-plugin"] }, null, 2) + "\n";
  mkdirSync(dirname(validatorPackagePath), { recursive: true });
  writeFileSync(join(tempDir, "opencode.json"), originalConfig, "utf8");
  writeFileSync(validatorPackagePath, JSON.stringify({ name: "user-owned-package", type: "commonjs" }, null, 2) + "\n", "utf8");
  let rejected = false;
  try {
    runOpenCodeCli(["opencode", "--dir", tempDir], { encoding: "utf8", stdio: "pipe" });
  } catch (error) {
    rejected = String(error.stderr || error.stdout || error.message).includes("Refusing to overwrite unowned global OpenCode validator package");
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
    if (!updated.output.includes(`Version: 0.0.1 -> ${pluginDefinition.version} (verified)`)) {
      throw new Error("opencode update must report an observable previous-to-installed version transition.");
    }
    if (!unchanged.includes(`Version: ${pluginDefinition.version} (verified; transition unchanged)`)) {
      throw new Error("opencode repeat install must report an unchanged version transition.");
    }
    if (!unknown.output.includes("transition unknown")) {
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

run("codex-repo", [
  join(".agdf", "control", "config.json"),
  join(".agents", "plugins", "marketplace.json"),
  join("plugins", "agdf", ".codex-plugin", "plugin.json"),
  join("plugins", "agdf", "control", "templates", "AGDF_RUN.md"),
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
  join(".agdf", "control", "templates", "AGDF_RUN.md"),
  join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
]);

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
run("config", [
  join(".agdf", "control", "config.json"),
]);

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-init-"));

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });

    for (const relativePath of [
      join(".agdf", "control", "config.json"),
      join(".agdf", "control", "README.md"),
      join(".agdf", "control", "runs"),
      join(".agdf", "control", "MASTER_BACKLOG.md"),
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
    if (existsSync(join(tempDir, ".agdf", "control", "AGDF_RUN.md"))
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

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-status-card-"));

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--status-card"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const output = error.stdout.toString();
      if (!output.includes("## AGDF status-card")
        || !output.includes("| Status | blocked |")
        || !output.includes("| Current gate | User requirements (`UR`) |")
        || !output.includes("| Next step |")) {
        throw new Error("gate-check --status-card should print compact status-card fields.");
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

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-language-config-update-"));

  try {
    execFileSync(process.execPath, [binPath, "config", "--dir", tempDir, "--language", "de"], { stdio: "pipe" });
    let config = JSON.parse(readFileSync(join(tempDir, ".agdf", "control", "config.json"), "utf8"));
    if (config.artifact_language !== "de" || config.chat_language !== "de") {
      throw new Error("Config target should write only the requested project language.");
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

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-status-card-i18n-"));

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir, "--language", "de"], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "locale-card"], { stdio: "pipe" });
    const german = spawnSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "locale-card", "--status-card"], { encoding: "utf8" }).stdout;
    if (!german.includes("## AGDF-Statuskarte")
      || !german.includes("| Ausgewählter Run |") || !german.includes("`locale-card`")
      || !german.includes("| Aktuelles Gate | Nutzeranforderungen (`UR`) |")
      || !german.includes("| Fehlende Freigabe | Approval: UR |")) {
      throw new Error("German chat language should render a German status card while preserving the exact English approval token.");
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
      || !fallback.includes("| Missing approval | Approval: UR |")) {
      throw new Error("Unsupported chat language should fall back deterministically to English status-card copy.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-status-card-tp-transition-"));
  const runPath = join(tempDir, ".agdf", "control", "runs", "tp-transition", "RUN_STATE.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir, "--language", "en"], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "tp-transition"], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: tp-transition
- lifecycle: active
- revision: 1
- mode: structured_delivery
- current_gate: TP
- revision_id: 6f0f2f9a-1d0a-4b7e-9c2d-3a5b8c1d2e4f
- decision: in_progress
- owner: test

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | approved | Approval: SD |
| TP | missing | |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | UR.md | approved | |
| Brownfield Review | BROWNFIELD_REVIEW.md | done | |
| PRD | PRD.md | approved | |
| SD | SD.md | approved | |
| TP | TP.md | draft | |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: TP status-card transition fixture.
- evidence: BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | exact approval |
| PRD | derived_from | UR | linked |
| SD | derived_from | PRD | linked |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| TP fixture | smoke-test.js | status-card transition | direct |

## Closeout

- next_allowed_action: Request exact TP approval.
`, "utf8");
    const report = runJson(["gate-check", "--dir", tempDir, "--run", "tp-transition", "--json"]);
    if (report.current_gate !== "TP" || report.status_card?.run_id !== "tp-transition" || report.status_card?.internal_next_step !== "pre-implementation Brownfield Analysis" || report.status_card?.next_user_gate !== "none" || report.status_card?.user_action_required !== "no") {
      throw new Error(`TP approval status card must distinguish Brownfield Analysis from a user gate: ${JSON.stringify(report.status_card)}`);
    }
    if (report.status_presentation?.run_id !== "tp-transition"
      || report.status_presentation?.revision_id !== report.approval_presentation?.revision_id
      || !report.status_presentation?.markdown?.includes("| Allowed now |")
      || !report.status_presentation?.markdown?.includes("request exact TP approval")
      || report.status_presentation?.authorizes !== false) {
      throw new Error(`Gate-check JSON must expose one deterministic operational status presentation: ${JSON.stringify(report.status_presentation)}`);
    }
    if (report.approval_presentation?.blocks?.run_status_card?.markdown?.includes("Approval: TP")
      || !report.approval_presentation?.blocks?.run_status_card?.markdown?.includes("Required decision: Task and Test Plan approval")
      || !report.approval_presentation?.blocks?.gate_transition_card?.markdown?.includes("`Approval: TP`")) {
      throw new Error(`Ready gate-check JSON must expose the neutral, additive approval presentation: ${JSON.stringify(report.approval_presentation)}`);
    }
    const cardApprovalCount = JSON.stringify(report.approval_presentation.blocks).split("Approval: TP").length - 1;
    if (cardApprovalCount !== 1) {
      throw new Error(`Ready gate-check cards must contain the exact approval value once, got ${cardApprovalCount}.`);
    }
    const envelope = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "tp-transition", "--approval-envelope"], { encoding: "utf8", stdio: "pipe" });
    if (!envelope.includes("## Review and decide on task and test plan")
      || !envelope.includes("Required decision: Task and Test Plan approval")
      || !envelope.includes("To approve, reply exactly with `Approval: TP`")) {
      throw new Error(`gate-check --approval-envelope must render both cards and the safe exact-text request: ${envelope}`);
    }
    const envelopeApprovalCount = envelope.split("Approval: TP").length - 1;
    if (envelopeApprovalCount !== 3) {
      throw new Error(`Approval envelope must contain the exact value once in the snapshot cards, once in the full status card and once in the request, got ${envelopeApprovalCount}.`);
    }
    if (!envelope.includes("| Missing approval |") || !envelope.includes("| Allowed now |")) {
      throw new Error("Approval envelope must render the complete operational Run Status Card between the cards.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const transitionSkillPaths = [
    join(generatedRoot, "plugins", "agdf", "skills", "gate-check", "SKILL.md"),
    join(generatedRoot, "plugins", "copilot", "agdf", "copilot-skills", "agdf-gate-check", "SKILL.md"),
    join(generatedRoot, ".opencode", "skills", "agdf-gate-check", "SKILL.md"),
  ];
  const transitionContractPaths = [
    join(generatedRoot, "plugins", "agdf", "meta", "contracts", "interaction.md"),
    join(generatedRoot, "plugins", "copilot", "agdf", "copilot-skills", "contracts", "interaction.md"),
    join(generatedRoot, ".opencode", "contracts", "interaction.md"),
  ];
  const transitionLocalePaths = [
    join(generatedRoot, "plugins", "agdf", "meta", "agdf-interaction-locales.json"),
    join(generatedRoot, "plugins", "copilot", "agdf", "copilot-skills", "agdf-interaction-locales.json"),
    join(generatedRoot, ".opencode", "agdf-interaction-locales.json"),
  ];

  for (const path of transitionSkillPaths) {
    const content = readFileSync(path, "utf8");
    if (!content.includes("This compact bootstrap owns no")
      || !content.includes("`skill.gate-check` is a direct-skill route. Invoke dispatcher v1 as the first operational call")
      || !content.includes("`delivery.start` is a delivery-intake route, not a direct-skill route")
      || !content.includes("On `terminal: true`, execute the returned")
      || !content.includes("transmit `host_action.text` verbatim and stop")
      || !content.includes("Only trusted runtime evidence explicitly declaring this invocation `instruction_only`")
      || (content.match(/interaction\.md/g) ?? []).length !== 1
      || content.includes("Consume the canonical `approval_presentation` verbatim")
      || content.includes("`status_presentation.markdown` verbatim")
      || content.includes("| Run status | Value |")
      || content.includes("Surface behavior:")) {
      throw new Error(`Generated gate-check surface must preserve compact orchestration and single contract ownership: ${path}`);
    }
  }

  for (const path of transitionContractPaths) {
    const content = readFileSync(path, "utf8");
    if (!content.includes("## Gate Transition Card")
      || !content.includes("answers exactly three user questions")
      || !content.includes("Run Status Card remains the operational,")
      || !content.includes("must not be a Markdown table or dashboard")) {
      throw new Error(`Generated runtime contract must preserve the transition-card and status-projection boundary: ${path}`);
    }
  }

  const canonicalLocales = readFileSync(transitionLocalePaths[0], "utf8");
  for (const path of transitionLocalePaths) {
    if (readFileSync(path, "utf8") !== canonicalLocales) {
      throw new Error(`Generated interaction locale registry must remain byte-identical: ${path}`);
    }
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-implicit-consent-"));
  const runPath = join(tempDir, ".agdf", "control", "runs", "test-run", "RUN_STATE.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "test-run"], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: test-run
- lifecycle: active
- revision: 1
- revision_id: 11111111-1111-4111-8111-111111111111
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | User said "ok, leg los" after a draft intent. |
| What is approved? | implicit consent only |
| What is missing? | exact Approval: UR |
| What is the next allowed action? | Request exact UR approval. |
| What is explicitly forbidden right now? | PRD, SD, TP, implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | missing | ok, leg los |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | draft |  |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| implicit consent | RUN_STATE.md | UR gate | direct |

## Closeout

- next_allowed_action: Request exact UR approval.
`, "utf8");

    const gateCheckReport = JSON.parse(execFileSync(
      process.execPath,
      [binPath, "gate-check", "--dir", tempDir, "--run", "test-run", "--json"],
      { encoding: "utf8", stdio: "pipe" },
    ));
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should keep approval-ready implicit consent open, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.current_gate !== "UR") {
      throw new Error(`Gate-check should remain at UR for implicit consent, got ${gateCheckReport.current_gate}.`);
    }
    if (gateCheckReport.missing_approval !== "Approval: UR") {
      throw new Error(`Gate-check should require exact UR approval, got ${gateCheckReport.missing_approval}.`);
    }
    if (gateCheckReport.interaction_kind !== "gate_approval") {
      throw new Error(`Gate-check should classify ready UR as gate_approval, got ${gateCheckReport.interaction_kind}.`);
    }
    if (!gateCheckReport.forbidden.includes("implement code")) {
      throw new Error("Gate-check should forbid implementation when consent is only implicit.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const cases = [
    { name: "brownfield", steps: {}, qa: "missing", qaArtefact: ["", "missing"], uat: "missing", gate: "Brownfield Analysis", missing: "none", allowed: "run Brownfield Analysis for the approved TP scope", forbidden: "implement before Brownfield evidence supports the approved TP path", next: "Run Brownfield Analysis for the approved TP scope before CD+Tests." },
    { name: "cd-tests", steps: { "Brownfield Analysis": "done" }, qa: "missing", qaArtefact: ["", "missing"], uat: "missing", gate: "CD+Tests", missing: "none", allowed: "implement the approved TP tasks", forbidden: "claim QA pass", next: "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR." },
    { name: "cr", steps: { "Brownfield Analysis": "done", "CD+Tests": "done" }, qa: "missing", qaArtefact: ["", "missing"], uat: "missing", gate: "CR", missing: "none", allowed: "run mandatory code review", forbidden: "claim QA pass", next: "Run Code Review for the implemented TP scope and resolve blocking findings before QA." },
    { name: "qa-revise", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "missing", qaArtefact: ["QA_REPORT.md", "revise"], uat: "missing", gate: "QA", missing: "none", allowed: "revise the implementation against the QA findings", forbidden: "request QA approval", next: "Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do not request Approval: QA from a revise report.", status: "open" },
    { name: "qa-block", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "missing", qaArtefact: ["QA_REPORT.md", "block"], uat: "missing", gate: "QA", missing: "none", allowed: "route the blocking QA findings to their authoritative owner", forbidden: "request QA approval", next: "Resolve or route the blocking QA findings through their authoritative owner, then rerun the required delivery steps. Do not request Approval: QA from a block report.", status: "blocked" },
    { name: "approved-qa-block", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "approved", qaArtefact: ["QA_REPORT.md", "block"], uat: "missing", gate: "QA", missing: "none", allowed: "route the blocking QA findings to their authoritative owner", forbidden: "create later-gate artefacts beyond the current allowed gate", next: "Update the QA artefact row in the selected RUN_STATE.md to use the gate-specific durable status vocabulary.", status: "blocked" },
    { name: "qa-approval", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "missing", qaArtefact: ["QA_REPORT.md", "pass"], uat: "missing", gate: "QA", missing: "Approval: QA", allowed: "run QA gate", forbidden: "request UAT approval", next: "Run the QA gate, persist the QA report, and request exact approval: Approval: QA" },
    { name: "brownfield-not-applicable", steps: { "Brownfield Analysis": "not_applicable", "CD+Tests": "done", CR: "done" }, qa: "missing", qaArtefact: ["QA_REPORT.md", "pass"], uat: "missing", gate: "QA", missing: "Approval: QA", allowed: "run QA gate", forbidden: "request UAT approval", next: "Run the QA gate, persist the QA report, and request exact approval: Approval: QA" },
    { name: "mandatory-not-applicable", steps: { "Brownfield Analysis": "not_applicable", "CD+Tests": "not_applicable", CR: "not_applicable" }, qa: "missing", qaArtefact: ["QA_REPORT.md", "pass"], uat: "missing", gate: "CD+Tests", missing: "none", allowed: "implement the approved TP tasks", forbidden: "claim QA pass", next: "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR." },
    { name: "premature-qa", steps: {}, qa: "approved", qaArtefact: ["QA_REPORT.md", "pass"], uat: "missing", gate: "Brownfield Analysis", missing: "none", allowed: "run Brownfield Analysis for the approved TP scope", forbidden: "implement before Brownfield evidence supports the approved TP path", next: "Run Brownfield Analysis for the approved TP scope before CD+Tests." },
    { name: "premature-uat", steps: { "Brownfield Analysis": "done" }, qa: "approved", qaArtefact: ["QA_REPORT.md", "pass"], uat: "approved", gate: "CD+Tests", missing: "none", allowed: "implement the approved TP tasks", forbidden: "claim QA pass", next: "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR." },
    { name: "qa-report", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "approved", qaArtefact: ["", "missing"], uat: "missing", gate: "QA", missing: "none", allowed: "persist the approved QA report in a stable artefact path such as .agdf/control/artefacts/<key>/QA_REPORT.md", forbidden: "create UAT", next: "Persist the approved QA report and link it from the AGDF control state before continuing.", status: "blocked" },
    { name: "uat", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "pass", qaArtefact: ["QA_REPORT.md", "passed"], uat: "missing", gate: "UAT", missing: "Approval: UAT", allowed: "request exact UAT approval", forbidden: "release", next: "Request exact approval: Approval: UAT before delivery handoff." },
    { name: "or", steps: { "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" }, qa: "passed", qaArtefact: ["QA_REPORT.md", "pass"], uat: "approved", gate: "OR", missing: "none", allowed: "produce OR or delivery closeout", forbidden: "commit, push, open PR or release automatically", next: "Produce delivery closeout or requested handoff; do not perform VCS actions automatically." },
  ];

  for (const testCase of cases) {
    const tempDir = mkdtempSync(join(tmpdir(), `create-agdf-late-gate-${testCase.name}-`));
    const runId = `late-gate-${testCase.name}`;
    const runPath = join(tempDir, ".agdf", "control", "runs", runId, "RUN_STATE.md");
    try {
      execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
      execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", runId], { stdio: "pipe" });
      const internalRows = ["Brownfield Analysis", "CD+Tests", "CR"]
        .map((step) => `| ${step} | ${testCase.steps[step] ? `${step.replace(/[^A-Za-z]+/g, "_").toUpperCase()}.md` : ""} | ${testCase.steps[step] ?? "missing"} | |`)
        .join("\n");
      writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: ${runId}
- lifecycle: active
- revision: 1
- revision_id: 22222222-2222-4222-8222-222222222222
- started_at: 2026-07-13
- mode: structured_delivery
- current_gate: OR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approved TP and explicit late-gate artefact state. |
| What is approved? | UR, PRD, SD and TP; QA/UAT according to fixture. |
| What is missing? | The next canonical late-gate step. |
| What is the next allowed action? | Derive it from the canonical transition model. |
| What is explicitly forbidden right now? | Skipping the canonical transition model. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | approved | Approval: SD |
| TP | approved | Approval: TP |
| QA | ${testCase.qa} | QA evidence |
| UAT | ${testCase.uat} | UAT evidence |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | UR.md | approved | |
| Brownfield Review | BROWNFIELD_REVIEW.md | done | |
| PRD | PRD.md | approved | |
| SD | SD.md | approved | |
| TP | TP.md | approved | |
${internalRows}
| QA | ${testCase.qaArtefact[0]} | ${testCase.qaArtefact[1]} | |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Late-gate transition fixture.
- evidence: BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | exact approval |
| PRD | derived_from | UR | linked |
| SD | derived_from | PRD | linked |
| TP | derived_from | SD | linked |
| QA_REPORT | tests | TP | linked when present |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| late-gate fixture | smoke-test.js | transition | direct |

## Closeout

- next_allowed_action: ${testCase.next}
`, "utf8");
      const report = runJson(["gate-check", "--dir", tempDir, "--run", runId, "--json"]);
      if (report.current_gate !== testCase.gate
        || report.missing_approval !== testCase.missing
        || report.status !== (testCase.status ?? "open")
        || !report.allowed.includes(testCase.allowed)
        || !report.forbidden.includes(testCase.forbidden)
        || report.next_allowed_action !== testCase.next) {
        throw new Error(`Late-gate ${testCase.name} mismatch: ${JSON.stringify({ status: report.status, gate: report.current_gate, missing: report.missing_approval, allowed: report.allowed, forbidden: report.forbidden, next: report.next_allowed_action, doctor: report.doctor_report?.findings })}`);
      }
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-qa-passed-uat-"));
  const runPath = join(tempDir, ".agdf", "control", "runs", "qa-passed-run", "RUN_STATE.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "qa-passed-run"], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: qa-passed-run
- lifecycle: active
- revision: 1
- revision_id: 33333333-3333-4333-8333-333333333333
- started_at: 2026-07-08
- mode: structured_delivery
- current_gate: UAT
- decision: qa_passed
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | QA passed for a structured slice. |
| What is approved? | UR approved; PRD/SD/TP not applicable; QA passed. |
| What is missing? | Approval: UAT |
| What is the next allowed action? | Request Approval: UAT before delivery handoff. |
| What is explicitly forbidden right now? | release or commit handoff without UAT approval |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | not_applicable | structured_slice |
| SD | not_applicable | structured_slice |
| TP | not_applicable | structured_slice |
| QA | passed | .agdf/control/artefacts/qa-passed-run/QA_REPORT.md |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/qa-passed-run/UR.md | approved |  |
| QA | .agdf/control/artefacts/qa-passed-run/QA_REPORT.md | passed |  |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: none
- scope_reason: Test slice.
- evidence: Test evidence.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | exact approval |
| PRD | derived_from | UR | not_applicable: structured_slice |
| SD | derived_from | PRD | not_applicable: structured_slice |
| TP | derived_from | SD | not_applicable: structured_slice |
| QA_REPORT | tests | TP | .agdf/control/artefacts/qa-passed-run/QA_REPORT.md |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| QA report | .agdf/control/artefacts/qa-passed-run/QA_REPORT.md | QA | direct |

## Closeout

- next_allowed_action: Request Approval: UAT before delivery handoff.
`, "utf8");

    const gateCheckReport = JSON.parse(execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "qa-passed-run", "--json"], { encoding: "utf8" }));
    if (gateCheckReport.current_gate !== "UAT") {
      throw new Error(`Gate-check should stay at UAT after QA passed, got ${gateCheckReport.current_gate}.`);
    }
    if (gateCheckReport.missing_approval !== "Approval: UAT") {
      throw new Error(`Gate-check should require UAT approval after QA passed, got ${gateCheckReport.missing_approval}.`);
    }
    if (!gateCheckReport.allowed.includes("request exact UAT approval")) {
      throw new Error("Gate-check should allow requesting exact UAT approval after QA passed.");
    }
    if (!gateCheckReport.forbidden.includes("release")) {
      throw new Error("Gate-check should forbid release until UAT approval.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-doctor-qa-status-mismatch-"));
  const runPath = join(tempDir, ".agdf", "control", "runs", "qa-status-mismatch", "RUN_STATE.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "qa-status-mismatch"], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: qa-status-mismatch
- lifecycle: active
- revision: 1
- revision_id: 44444444-4444-4444-8444-444444444444
- started_at: 2026-07-09
- mode: structured_delivery
- current_gate: QA
- decision: qa_passed
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | QA approval and report exist, but the artefact status uses the wrong durable vocabulary. |
| What is approved? | UR, PRD, SD, TP and QA |
| What is missing? | Durable status correction |
| What is the next allowed action? | Correct QA artefact status. |
| What is explicitly forbidden right now? | Release readiness claims |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | approved | Approval: SD |
| TP | approved | Approval: TP |
| QA | approved | Approval: QA |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/qa-status-mismatch/UR.md | approved |  |
| PRD | .agdf/control/artefacts/qa-status-mismatch/PRD.md | approved |  |
| SD | .agdf/control/artefacts/qa-status-mismatch/SD.md | approved |  |
| TP | .agdf/control/artefacts/qa-status-mismatch/TP.md | approved |  |
| QA | .agdf/control/artefacts/qa-status-mismatch/QA_REPORT.md | approved | wrong durable status for QA |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: TP
- scope_reason: Test slice.
- evidence: Test evidence.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | exact approval |
| PRD | derived_from | UR | PRD links to approved UR. |
| SD | derived_from | PRD | SD links to approved PRD. |
| TP | derived_from | SD | TP links to approved SD. |
| QA_REPORT | tests | TP | .agdf/control/artefacts/qa-status-mismatch/QA_REPORT.md |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| QA report | .agdf/control/artefacts/qa-status-mismatch/QA_REPORT.md | QA | direct |
`, "utf8");

    const doctorReport = runJson(["doctor", "--dir", tempDir, "--run", "qa-status-mismatch", "--json"]);
    if (doctorReport.status !== "revise") {
      throw new Error(`Doctor should revise on QA durable artefact status mismatch, got ${doctorReport.status}.`);
    }
    if (!doctorReport.findings.some((finding) => finding.code === "AGDF_GATE_ARTEFACT_STATUS_INCONSISTENT" && finding.message.includes("expected `pass` or `passed`"))) {
      throw new Error("Doctor should report the QA-specific durable artefact status vocabulary.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

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

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-ur-triage-"));
  const runPath = join(tempDir, ".agdf", "control", "runs", "test-run", "RUN_STATE.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "test-run"], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: test-run
- lifecycle: active
- revision: 1
- revision_id: 55555555-5555-4555-8555-555555555555
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Test UR is approved and persisted. |
| What is approved? | UR |
| What is missing? | Brownfield Review |
| What is the next allowed action? | Run Brownfield Review after G-00. |
| What is explicitly forbidden right now? | PRD and implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review |  | missing |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in RUN_STATE.md |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Test fixture uses a small structured slice.
- evidence: Brownfield Review marked not_applicable.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | RUN_STATE.md | UR gate | direct |

## Closeout

- next_allowed_action: Run Brownfield Review after G-00.
`, "utf8");

    const gateCheckOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "test-run", "--json"], { encoding: "utf8" });
    const gateCheckReport = JSON.parse(gateCheckOutput);
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should open Brownfield Review after approved UR, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.current_gate !== "Brownfield Review") {
      throw new Error(`Gate-check should move from approved UR to Brownfield Review, got ${gateCheckReport.current_gate}.`);
    }
    if (!gateCheckReport.allowed.includes("run Brownfield Review after G-00")) {
      throw new Error("Gate-check should allow Brownfield Review after approved UR.");
    }
    if (!gateCheckReport.forbidden.includes("create PRD before Brownfield Review is resolved")) {
      throw new Error("Gate-check should forbid PRD before Brownfield Review is resolved.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-open-"));
  const runPath = join(tempDir, ".agdf", "control", "runs", "test-run", "RUN_STATE.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "test-run"], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: test-run
- lifecycle: active
- revision: 1
- revision_id: 66666666-6666-4666-8666-666666666666
- started_at: 2026-07-05
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Test UR is approved. |
| What is approved? | UR |
| What is missing? | PRD |
| What is the next allowed action? | Draft PRD. |
| What is explicitly forbidden right now? | Implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |
| SD | not_applicable |  |
| TP | not_applicable |  |
| QA | not_applicable |  |
| UAT | not_applicable |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review | .agdf/control/artefacts/test-run/BROWNFIELD_REVIEW.md | not_applicable | No Brownfield impact. |
| PRD |  | draft |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in RUN_STATE.md |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Test fixture uses a small structured slice.
- evidence: Brownfield Review marked not_applicable.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | RUN_STATE.md | UR gate | direct |

## Closeout

- next_allowed_action: Draft PRD.
`, "utf8");

    const gateCheckOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "test-run", "--json"], { encoding: "utf8" });
    const gateCheckReport = JSON.parse(gateCheckOutput);
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should be open when current gate is approved and next action exists, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.current_gate !== "PRD") {
      throw new Error(`Gate-check should move from approved UR to PRD, got ${gateCheckReport.current_gate}.`);
    }
    if (!gateCheckReport.forbidden.includes("implement code")) {
      throw new Error("Gate-check should forbid implementation immediately after UR approval.");
    }
    if (gateCheckReport.doctor_status !== "warn") {
      throw new Error(`Gate-check should preserve non-blocking doctor warnings, got ${gateCheckReport.doctor_status}.`);
    }
    if (gateCheckReport.next_allowed_action !== "Draft PRD.") {
      throw new Error(`Gate-check should expose the next allowed action, got ${gateCheckReport.next_allowed_action}.`);
    }
    if (gateCheckReport.next_gate_after_approval !== "SD" || gateCheckReport.status_card?.next_gate_after_approval !== "SD") {
      throw new Error("Gate-check should expose SD as the next gate after PRD approval.");
    }
    if (!gateCheckReport.allowed_after_approval.includes("Draft Solution Design") || gateCheckReport.allowed_after_approval.includes("implementation is allowed")) {
      throw new Error("Gate-check should describe post-PRD approval authority without implying implementation authority.");
    }
    if (!gateCheckReport.status_card?.allowed_after_approval.includes("Draft Solution Design")) {
      throw new Error("Status card should expose allowed-after-approval text for a missing PRD approval.");
    }
    if (gateCheckReport.status_card?.next_user_gate !== "SD" || gateCheckReport.status_card?.user_action_required !== "yes") {
      throw new Error("Status card should identify SD as the next actual user gate after PRD approval.");
    }
    if (gateCheckReport.interaction_kind !== "gate_approval" || gateCheckReport.native_attempt_required !== false || gateCheckReport.status_card?.native_attempt_required !== false) {
      throw new Error("A report-only ready gate must remain a gate approval while failing closed before native invocation without host capability evidence.");
    }
    const statusCardOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "test-run", "--status-card"], { encoding: "utf8" });
    if (!statusCardOutput.includes("| Next gate after approval | SD |")
      || !statusCardOutput.includes("| Allowed after approval | Draft Solution Design; implementation remains forbidden. |")
      || statusCardOutput.includes("| User action required |")) {
      throw new Error("gate-check --status-card should print post-approval transition lines for missing approval cases.");
    }
    if (gateCheckReport.evidence_refs.length !== 1 || gateCheckReport.evidence_refs[0].evidence !== "UR approval") {
      throw new Error("Gate-check should expose filled evidence references.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-mode-slice-missing-"));
  const runPath = join(tempDir, ".agdf", "control", "runs", "test-run", "RUN_STATE.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "test-run"], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: test-run
- lifecycle: active
- revision: 1
- revision_id: 77777777-7777-4777-8777-777777777777
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: Brownfield Review
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR is approved and Brownfield Review is done. |
| What is approved? | UR |
| What is missing? | Mode/Slice Decision |
| What is the next allowed action? | Decide process size. |
| What is explicitly forbidden right now? | PRD and implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review | .agdf/control/artefacts/test-run/BROWNFIELD_REVIEW.md | done | Existing owner and scope were inspected. |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in RUN_STATE.md |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Brownfield Review | RUN_STATE.md | Mode selection | direct |

## Closeout

- next_allowed_action: Decide process size.
`, "utf8");

    const gateCheckOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "test-run", "--json"], { encoding: "utf8" });
    const gateCheckReport = JSON.parse(gateCheckOutput);
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should open Mode/Slice Decision after Brownfield Review, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.current_gate !== "Mode/Slice Decision") {
      throw new Error(`Gate-check should not jump to PRD without Mode/Slice Decision, got ${gateCheckReport.current_gate}.`);
    }
    if (!gateCheckReport.forbidden.includes("create PRD before process size is decided")) {
      throw new Error("Gate-check should forbid PRD before process size is decided.");
    }
    if (gateCheckReport.next_gate_after_approval !== "none" || gateCheckReport.status_card?.allowed_after_approval !== "none") {
      throw new Error("Internal Mode/Slice Decision should not invent post-approval transition fields.");
    }
    if (gateCheckReport.status_card?.next_user_gate !== "none" || gateCheckReport.status_card?.user_action_required !== "no" || !gateCheckReport.status_card?.internal_next_step) {
      throw new Error("Internal-step status card should distinguish its next internal step from user approval.");
    }
    const statusCardOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "test-run", "--status-card"], { encoding: "utf8" });
    if (!statusCardOutput.includes("| Next gate after approval | none |") || !statusCardOutput.includes("| Allowed after approval | none |")) {
      throw new Error("Internal-step status card should deterministically render empty post-approval authority.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-or-handoff-"));
  const runPath = join(tempDir, ".agdf", "control", "runs", "or-run", "RUN_STATE.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "or-run"], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: or-run
- lifecycle: active
- revision: 1
- revision_id: 88888888-8888-4888-8888-888888888888
- started_at: 2026-07-10
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UAT approved and OR handoff is allowed. |
| What is approved? | UR, PRD, SD, TP, QA, UAT |
| What is missing? | none |
| What is the next allowed action? | Produce delivery closeout. |
| What is explicitly forbidden right now? | Automatic commit or release |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | not_applicable | quick historical scope |
| PRD | not_applicable | quick historical scope |
| SD | not_applicable | quick historical scope |
| TP | not_applicable | quick historical scope |
| QA | approved | QA report passed |
| UAT | approved | Approval: UAT |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| QA | .agdf/control/artefacts/or-run/QA_REPORT.md | passed |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| QA_REPORT | tests | TP | QA report verified the completed task plan. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UAT approval | RUN_STATE.md | UAT | direct |

## Closeout

- next_allowed_action: Produce delivery closeout.
`, "utf8");

    const gateCheckReport = JSON.parse(execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "or-run", "--json"], { encoding: "utf8" }));
    if (gateCheckReport.current_gate !== "OR" || gateCheckReport.missing_approval !== "none") {
      throw new Error("OR handoff should have no missing approval.");
    }
    if (gateCheckReport.next_gate_after_approval !== "none" || gateCheckReport.status_card?.allowed_after_approval !== "none") {
      throw new Error("OR handoff should not expose post-approval transition fields.");
    }
    const statusCardOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "or-run", "--status-card"], { encoding: "utf8" });
    if (!statusCardOutput.includes("| Next gate after approval | none |") || !statusCardOutput.includes("| Allowed after approval | none |")) {
      throw new Error("OR handoff status card should deterministically render empty post-approval authority.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-mode-slice-incomplete-"));
  const runPath = join(tempDir, ".agdf", "control", "runs", "test-run", "RUN_STATE.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "test-run"], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: test-run
- lifecycle: active
- revision: 1
- revision_id: 99999999-9999-4999-8999-999999999999
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: Brownfield Review
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR is approved and Brownfield Review is done. |
| What is approved? | UR |
| What is missing? | Mode/Slice Decision evidence |
| What is the next allowed action? | Record Mode/Slice Decision with evidence. |
| What is explicitly forbidden right now? | Implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review | .agdf/control/artefacts/test-run/BROWNFIELD_REVIEW.md | done | Existing owner and scope were inspected. |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in RUN_STATE.md |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason:
- evidence:

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Brownfield Review | RUN_STATE.md | Mode selection | direct |

## Closeout

- next_allowed_action: Record Mode/Slice Decision with evidence.
`, "utf8");

    const gateCheckOutput = execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "test-run", "--json"], { encoding: "utf8" });
    const gateCheckReport = JSON.parse(gateCheckOutput);
    if (gateCheckReport.status !== "open") {
      throw new Error(`Gate-check should remain open for incomplete Mode/Slice Decision, got ${gateCheckReport.status}.`);
    }
    if (gateCheckReport.current_gate !== "Mode/Slice Decision") {
      throw new Error(`Gate-check should not enter Quick Task Execution without Mode/Slice evidence, got ${gateCheckReport.current_gate}.`);
    }
    if (!gateCheckReport.forbidden.includes("implement code")) {
      throw new Error("Gate-check should forbid implementation while Mode/Slice Decision evidence is missing.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-delivery-map-chain-"));
  const runPath = join(tempDir, ".agdf", "control", "runs", "test-run", "RUN_STATE.md");
  const backlogPath = join(tempDir, ".agdf", "control", "MASTER_BACKLOG.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "test-run"], { stdio: "pipe" });
    writeFileSync(backlogPath, `# AGDF Master Backlog

## Active Backlog

| Prio | Key | Title | Status | UR | Brownfield Review | PRD | SD | TP | QA | OR | Current Spec | Notes |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | test-run | Delivery map test | in_progress | UR.md | BROWNFIELD_REVIEW.md | PRD.md |  |  |  | OR.md | PRD.md | needs SD |
`, "utf8");
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: test-run
- lifecycle: active
- revision: 1
- revision_id: aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa
- started_at: 2026-07-06
- mode: structured_delivery
- current_gate: SD
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR and PRD are approved. |
| What is approved? | UR, PRD |
| What is missing? | PRD relationship evidence |
| What is the next allowed action? | Fill Artefact Chain evidence. |
| What is explicitly forbidden right now? | SD approval |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| Brownfield Review | .agdf/control/artefacts/test-run/BROWNFIELD_REVIEW.md | not_applicable | No Brownfield impact. |
| PRD | .agdf/control/artefacts/test-run/PRD.md | approved |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in RUN_STATE.md |
| PRD | derived_from | UR |  |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | RUN_STATE.md | UR gate | direct |
| PRD approval | RUN_STATE.md | PRD gate | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
|  | warn |  |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
|  | warn |  |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs:
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence:

## Closeout

- next_allowed_action: Fill Artefact Chain evidence.
`, "utf8");

    const deliveryMapOutput = execFileSync(process.execPath, [binPath, "delivery-map", "--dir", tempDir, "--run", "test-run", "--json"], { encoding: "utf8" });
    const deliveryMapReport = JSON.parse(deliveryMapOutput);
    if (deliveryMapReport.status !== "revise") {
      throw new Error(`Delivery-map should revise approved PRD without relationship evidence, got ${deliveryMapReport.status}.`);
    }
    if (deliveryMapReport.status_card?.current_gate !== "SD") {
      throw new Error("Delivery-map should expose a Run Status Card with the current gate.");
    }
    if (!deliveryMapReport.status_card?.forbidden_now?.includes("create TP")) {
      throw new Error("Delivery-map status card should expose currently forbidden actions.");
    }
    if (!deliveryMapReport.quality_outlook || deliveryMapReport.status_card?.quality_outlook !== deliveryMapReport.quality_outlook) {
      throw new Error("Delivery-map should expose quality_outlook consistently on the report and status card.");
    }
    if (!deliveryMapReport.findings.some((finding) => finding.code === "AGDF_DELIVERY_RELATIONSHIP_EVIDENCE_MISSING")) {
      throw new Error("Delivery-map should report missing relationship evidence for approved PRD.");
    }
    if (!deliveryMapReport.relationships.some((relationship) => relationship.from === "PRD" && relationship.status === "missing_evidence")) {
      throw new Error("Delivery-map should expose PRD relationship status as missing_evidence.");
    }
    if (deliveryMapReport.backlog_pointers[0]?.brownfield_review !== "BROWNFIELD_REVIEW.md") {
      throw new Error("Delivery-map should preserve the Brownfield Review backlog pointer column.");
    }
    if (deliveryMapReport.backlog_pointers[0]?.or !== "OR.md") {
      throw new Error("Delivery-map should preserve the OR backlog pointer column.");
    }
    if (deliveryMapReport.backlog_pointers[0]?.current_spec !== "PRD.md") {
      throw new Error("Delivery-map should preserve the Current Spec column after OR.");
    }

    let gateCheckFailed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "test-run", "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      gateCheckFailed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (!gateCheckReport.delivery_map?.findings?.some((finding) => finding.code === "AGDF_DELIVERY_RELATIONSHIP_EVIDENCE_MISSING")) {
        throw new Error("Gate-check should include delivery-map findings as evidence context.");
      }
      if (gateCheckReport.status_card?.current_gate !== "SD") {
        throw new Error("Gate-check should expose a Run Status Card with the current gate.");
      }
      if (!gateCheckReport.status_card?.allowed_now?.includes("draft or refine Solution Design")) {
        throw new Error("Gate-check status card should expose currently allowed actions.");
      }
      if (!gateCheckReport.quality_outlook || gateCheckReport.status_card?.quality_outlook !== gateCheckReport.quality_outlook) {
        throw new Error("Gate-check should expose quality_outlook consistently on the report and status card.");
      }
    }
    if (!gateCheckFailed) {
      throw new Error("Gate-check should exit non-zero when delivery-map relationship evidence is missing.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-compact-backlog-"));
  const backlogPath = join(tempDir, ".agdf", "control", "MASTER_BACKLOG.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    const statusCases = [
      ["Needs UR", "needs_ur"],
      ["Awaiting Brownfield Review", "awaiting_brownfield_review"],
      ["Awaiting PRD", "awaiting_prd"],
      ["Awaiting PRD approval", "awaiting_prd_approval"],
      ["Awaiting SD", "awaiting_sd"],
      ["Awaiting SD approval", "awaiting_sd_approval"],
      ["Awaiting TP", "awaiting_tp"],
      ["Awaiting TP approval", "awaiting_tp_approval"],
      ["In progress", "in_progress"],
      ["Blocked", "blocked"],
      ["Awaiting QA", "awaiting_qa"],
      ["Awaiting UAT", "awaiting_uat"],
      ["Completed", "completed"],
      ["Superseded", "superseded"],
      ["Abandoned", "abandoned"],
      ["legacy_custom_status", "legacy_custom_status"],
    ];
    const statusRows = statusCases
      .map(([label], index) => `| P1 | \`status-${index}\` | ${label} test | ${label} | [UR](artefacts/status-${index}/UR.md) | [UR](artefacts/status-${index}/UR.md) | Continue |`)
      .join("\n");
    writeFileSync(backlogPath, `# AGDF Master Backlog

## Active Backlog

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|
| P1 | \`compact-run\` | [framework-maintenance] Compact backlog test | Awaiting UAT | [UR](artefacts/compact-run/UR.md) · [Brownfield](artefacts/compact-run/BROWNFIELD_REVIEW.md) · [QA](artefacts/compact-run/QA_REPORT.md) · [OR](artefacts/compact-run/OR.md) | [QA](artefacts/compact-run/QA_REPORT.md) | Request \`Approval: UAT\` |
| P1 | \`external-spec\` | Repository SoT test | In progress | [UR](artefacts/external-spec/UR.md) | [Spec](../../docs/spec.md) | Continue |
${statusRows}

## Planned / Parking Lot

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|
`, "utf8");

    const report = runJson(["delivery-map", "--dir", tempDir, "--json"]);
    const pointer = report.backlog_pointers[0];
    if (pointer?.key !== "compact-run" || pointer?.status !== "awaiting_uat") {
      throw new Error("Compact backlog should preserve the key and normalize the human status label.");
    }
    if (pointer?.scope !== "framework_maintenance") {
      throw new Error(`Compact backlog should normalize a recognized [framework-maintenance] scope tag, got ${pointer?.scope}.`);
    }
    const scopeDoctorReport = runJson(["doctor", "--dir", tempDir, "--json"]);
    if (scopeDoctorReport.findings.some((finding) => finding.code === "AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN")) {
      throw new Error("A recognized [framework-maintenance] scope tag must not raise AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN.");
    }
    if (pointer?.ur !== ".agdf/control/artefacts/compact-run/UR.md"
      || pointer?.brownfield_review !== ".agdf/control/artefacts/compact-run/BROWNFIELD_REVIEW.md"
      || pointer?.qa !== ".agdf/control/artefacts/compact-run/QA_REPORT.md"
      || pointer?.or !== ".agdf/control/artefacts/compact-run/OR.md"
      || pointer?.current_spec !== ".agdf/control/artefacts/compact-run/QA_REPORT.md") {
      throw new Error("Compact backlog should resolve document-relative Markdown links to repository-relative JSON paths.");
    }
    if (Object.values(pointer).some((value) => typeof value === "string" && value.includes("]("))) {
      throw new Error("Compact backlog JSON must not expose Markdown link syntax.");
    }
    const externalSpecPointer = report.backlog_pointers.find((item) => item.key === "external-spec");
    if (externalSpecPointer?.current_spec !== "docs/spec.md") {
      throw new Error(`Compact backlog should resolve safe repository SoT links, got ${externalSpecPointer?.current_spec}.`);
    }
    if (externalSpecPointer?.scope !== "") {
      throw new Error(`A Work item cell with no bracketed tag should leave scope empty, got ${externalSpecPointer?.scope}.`);
    }
    for (const [index, [, expectedStatus]] of statusCases.entries()) {
      const statusPointer = report.backlog_pointers.find((item) => item.key === `status-${index}`);
      if (statusPointer?.status !== expectedStatus) {
        throw new Error(`Compact backlog should normalize status-${index} to ${expectedStatus}, got ${statusPointer?.status}.`);
      }
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-invalid-compact-backlog-"));
  const backlogPath = join(tempDir, ".agdf", "control", "MASTER_BACKLOG.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(backlogPath, `# AGDF Master Backlog

## Active Backlog

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|
| P1 | \`invalid-run\` | [bogus-scope] Invalid compact backlog | Waiting magically | [UR](https://example.com/UR.md) · [UR](artefacts/invalid-run/UR.md) · [QA](/tmp/QA.md) · [Mystery](artefacts/invalid-run/MYSTERY.md) · malformed-entry | [PRD](../../../outside.md) | Fix validation |

## Planned / Parking Lot

| Priority | Key | Unsupported |
|---:|---|---|
`, "utf8");

    const report = runJson(["doctor", "--dir", tempDir, "--json"]);
    const codes = new Set(report.findings.map((finding) => finding.code));
    for (const requiredCode of [
      "AGDF_BACKLOG_STATUS_UNKNOWN",
      "AGDF_BACKLOG_LINK_TARGET_INVALID",
      "AGDF_BACKLOG_ARTEFACT_LABEL_DUPLICATE",
      "AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN",
      "AGDF_BACKLOG_ARTEFACT_LINK_INVALID",
      "AGDF_BACKLOG_LAYOUT_UNKNOWN",
      "AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN",
    ]) {
      if (!codes.has(requiredCode)) throw new Error(`Invalid compact backlog should report ${requiredCode}.`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-completed-only-backlog-"));
  const backlogPath = join(tempDir, ".agdf", "control", "MASTER_BACKLOG.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    writeFileSync(backlogPath, `# AGDF Master Backlog

## Active Backlog

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|

## Planned / Parking Lot

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|

## Completed / Superseded Pointers

| Key | Work item | Final status | Historical record | Outcome |
|---|---|---|---|---|
| \`completed-run\` | Completed run | Completed | [OR](artefacts/completed-run/OR.md) | UAT approved |
`, "utf8");

    const report = runJson(["doctor", "--dir", tempDir, "--json"]);
    if (report.findings.some((finding) => finding.code === "AGDF_BACKLOG_POINTER_EMPTY")) {
      throw new Error("A completed-only backlog should not be reported as empty.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-missing-ur-artifact-"));
  const runPath = join(tempDir, ".agdf", "control", "runs", "test-run", "RUN_STATE.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "test-run"], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: test-run
- lifecycle: active
- revision: 1
- revision_id: bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb
- started_at: 2026-07-05
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Test UR was approved in chat. |
| What is approved? | UR |
| What is missing? | Durable UR artefact |
| What is the next allowed action? | Persist UR. |
| What is explicitly forbidden right now? | PRD and implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR |  | missing |  |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | RUN_STATE.md | UR gate | direct |

## Closeout

- next_allowed_action: Persist UR.
`, "utf8");

    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "test-run", "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block approved UR without durable artefact, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.blocking_reason !== "missing_durable_ur_artefact") {
        throw new Error(`Gate-check should report missing_durable_ur_artefact, got ${gateCheckReport.blocking_reason}.`);
      }
      if (gateCheckReport.current_gate !== "UR") {
        throw new Error(`Gate-check should remain at UR when durable UR is missing, got ${gateCheckReport.current_gate}.`);
      }
      if (!gateCheckReport.forbidden.includes("create PRD")) {
        throw new Error("Gate-check should forbid PRD before the approved UR is persisted.");
      }
    }
    if (!failed) {
      throw new Error("Gate-check should exit non-zero when UR approval has no durable artefact.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-gate-check-missing-prd-artifact-"));
  const runPath = join(tempDir, ".agdf", "control", "runs", "test-run", "RUN_STATE.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "test-run"], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: test-run
- lifecycle: active
- revision: 1
- revision_id: cccccccc-cccc-4ccc-8ccc-cccccccccccc
- started_at: 2026-07-05
- mode: structured_delivery
- current_gate: PRD
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR and PRD approval text exist. |
| What is approved? | UR, PRD |
| What is missing? | Durable PRD artefact |
| What is the next allowed action? | Persist PRD. |
| What is explicitly forbidden right now? | SD and implementation |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |
| PRD |  | missing |  |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Approval evidence in RUN_STATE.md |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR approval | RUN_STATE.md | UR gate | direct |
| PRD approval | RUN_STATE.md | PRD gate | direct |

## Closeout

- next_allowed_action: Persist PRD.
`, "utf8");

    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "test-run", "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block approved PRD without durable artefact, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.blocking_reason !== "missing_durable_prd_artefact") {
        throw new Error(`Gate-check should report missing_durable_prd_artefact, got ${gateCheckReport.blocking_reason}.`);
      }
      if (gateCheckReport.current_gate !== "PRD") {
        throw new Error(`Gate-check should remain at PRD when durable PRD is missing, got ${gateCheckReport.current_gate}.`);
      }
      if (!gateCheckReport.forbidden.includes("create SD")) {
        throw new Error("Gate-check should forbid SD before the approved PRD is persisted.");
      }
    }
    if (!failed) {
      throw new Error("Gate-check should exit non-zero when PRD approval has no durable artefact.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

for (const missingCase of [
  {
    gate: "SD",
    nextAction: "Persist SD.",
    approvals: [
      "| UR | approved | Approval: UR |",
      "| PRD | approved | Approval: PRD |",
      "| SD | approved | Approval: SD |",
      "| TP | missing |  |",
    ],
    artefacts: [
      "| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |",
      "| PRD | .agdf/control/artefacts/test-run/PRD.md | approved |  |",
      "| SD |  | missing |  |",
    ],
    chain: [
      "| UR | approved_by | Approval: UR | Approval evidence in RUN_STATE.md |",
      "| PRD | derived_from | UR | PRD links to approved UR. |",
    ],
    reason: "missing_durable_sd_artefact",
  },
  {
    gate: "TP",
    nextAction: "Persist TP.",
    approvals: [
      "| UR | approved | Approval: UR |",
      "| PRD | approved | Approval: PRD |",
      "| SD | approved | Approval: SD |",
      "| TP | approved | Approval: TP |",
    ],
    artefacts: [
      "| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |",
      "| PRD | .agdf/control/artefacts/test-run/PRD.md | approved |  |",
      "| SD | .agdf/control/artefacts/test-run/SD.md | approved |  |",
      "| TP |  | missing |  |",
    ],
    chain: [
      "| UR | approved_by | Approval: UR | Approval evidence in RUN_STATE.md |",
      "| PRD | derived_from | UR | PRD links to approved UR. |",
      "| SD | derived_from | PRD | SD links to approved PRD. |",
    ],
    reason: "missing_durable_tp_artefact",
  },
  {
    gate: "QA",
    nextAction: "Persist QA report.",
    approvals: [
      "| UR | approved | Approval: UR |",
      "| PRD | approved | Approval: PRD |",
      "| SD | approved | Approval: SD |",
      "| TP | approved | Approval: TP |",
      "| QA | approved | Approval: QA |",
    ],
    artefacts: [
      "| UR | .agdf/control/artefacts/test-run/UR.md | approved |  |",
      "| PRD | .agdf/control/artefacts/test-run/PRD.md | approved |  |",
      "| SD | .agdf/control/artefacts/test-run/SD.md | approved |  |",
      "| TP | .agdf/control/artefacts/test-run/TP.md | approved |  |",
      "| Brownfield Analysis | .agdf/control/artefacts/test-run/BROWNFIELD_ANALYSIS.md | done |  |",
      "| CD+Tests | .agdf/control/artefacts/test-run/CD_TESTS.md | done |  |",
      "| CR | .agdf/control/artefacts/test-run/CODE_REVIEW.md | done |  |",
      "| QA |  | missing |  |",
    ],
    chain: [
      "| UR | approved_by | Approval: UR | Approval evidence in RUN_STATE.md |",
      "| PRD | derived_from | UR | PRD links to approved UR. |",
      "| SD | derived_from | PRD | SD links to approved PRD. |",
      "| TP | derived_from | SD | TP links to approved SD. |",
    ],
    reason: "missing_durable_qa_artefact",
  },
]) {
  const tempDir = mkdtempSync(join(tmpdir(), `create-agdf-gate-check-missing-${missingCase.gate.toLowerCase()}-artifact-`));
  const runPath = join(tempDir, ".agdf", "control", "runs", "test-run", "RUN_STATE.md");

  try {
    execFileSync(process.execPath, [binPath, "init", "--dir", tempDir], { stdio: "pipe" });
    execFileSync(process.execPath, [binPath, "run-create", "--dir", tempDir, "--run", "test-run"], { stdio: "pipe" });
    writeFileSync(runPath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: test-run
- lifecycle: active
- revision: 1
- revision_id: dddddddd-dddd-4ddd-8ddd-dddddddddddd
- started_at: 2026-07-05
- mode: structured_delivery
- current_gate: ${missingCase.gate}
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | ${missingCase.gate} approval text exists. |
| What is approved? | ${missingCase.gate} |
| What is missing? | Durable ${missingCase.gate} artefact |
| What is the next allowed action? | ${missingCase.nextAction} |
| What is explicitly forbidden right now? | Later gate work |

## Gate Checklist

| Gate | Status | Evidence |
|---|---|---|
${missingCase.approvals.join("\n")}

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
${missingCase.artefacts.join("\n")}

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
${missingCase.chain.join("\n")}

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| ${missingCase.gate} approval | RUN_STATE.md | ${missingCase.gate} gate | direct |

## Closeout

- next_allowed_action: ${missingCase.nextAction}
`, "utf8");

    let failed = false;
    try {
      execFileSync(process.execPath, [binPath, "gate-check", "--dir", tempDir, "--run", "test-run", "--json"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      failed = true;
      const gateCheckReport = JSON.parse(error.stdout.toString());
      if (gateCheckReport.status !== "blocked") {
        throw new Error(`Gate-check should block approved ${missingCase.gate} without durable artefact, got ${gateCheckReport.status}.`);
      }
      if (gateCheckReport.blocking_reason !== missingCase.reason) {
        throw new Error(`Gate-check should report ${missingCase.reason}, got ${gateCheckReport.blocking_reason}.`);
      }
      if (gateCheckReport.current_gate !== missingCase.gate) {
        throw new Error(`Gate-check should remain at ${missingCase.gate}, got ${gateCheckReport.current_gate}.`);
      }
    }
    if (!failed) {
      throw new Error(`Gate-check should exit non-zero when ${missingCase.gate} approval has no durable artefact.`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

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
