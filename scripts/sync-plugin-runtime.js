import { projectCore, coreImports } from "./core-projection.mjs";
import { getPluginSourceRoot } from "./public-plugin/source-root.js";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REQUEST_ACTIVATION_MARKERS,
  computeRequestActivationGuardFingerprint,
} from "./sync-request-activation-projections.js";

const scriptsRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptsRoot, "..");
const packageRoot = join(repoRoot, "packages", "cli");
const sourcePluginRoot = getPluginSourceRoot(repoRoot);

function countOccurrences(content, needle) {
  return content.split(needle).length - 1;
}

function requestActivationKernel() {
  const contractPath = join(sourcePluginRoot, "meta", "contracts", "request-activation.md");
  const content = readFileSync(contractPath, "utf8").replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  const { guardStart, guardEnd } = REQUEST_ACTIVATION_MARKERS;
  if (countOccurrences(content, guardStart) !== 1 || countOccurrences(content, guardEnd) !== 1) {
    throw new Error("Request Activation Guard markers must occur exactly once before runtime sync.");
  }
  const start = content.indexOf(guardStart);
  const end = content.indexOf(guardEnd, start);
  if (end < start) throw new Error("Request Activation Guard markers are out of order before runtime sync.");
  const guard = content.slice(start, end + guardEnd.length);
  const readMetadata = (name, pattern) => {
    const matches = [...guard.matchAll(pattern)];
    if (matches.length !== 1) throw new Error(`Request Activation Guard ${name} must occur exactly once.`);
    return matches[0][1];
  };
  const identity = {
    owner: readMetadata("owner", /- `owner`: `([^`]+)`/g),
    path: readMetadata("path", /- `path`: `([^`]+)`/g),
    policy_version: Number(readMetadata("policy_version", /- `policy_version`: `(\d+)`/g)),
    guard_fingerprint: readMetadata("guard_fingerprint", /- `guard_fingerprint`: `(sha256:[0-9a-f]{64})`/g),
  };
  if (identity.owner !== "request_activation_contract"
      || identity.path !== "meta/contracts/request-activation.md"
      || identity.policy_version !== 1) {
    throw new Error("Request Activation Guard identity does not match the runtime binding contract.");
  }
  const computedFingerprint = computeRequestActivationGuardFingerprint(guard);
  if (identity.guard_fingerprint !== computedFingerprint) {
    throw new Error(`Request Activation Guard fingerprint mismatch: declared ${identity.guard_fingerprint}, computed ${computedFingerprint}.`);
  }
  return Object.freeze({ identity: Object.freeze(identity), kernel: guard });
}

function isInside(root, candidate) {
  const path = relative(root, candidate);
  return path === "" || (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

function safeOutputRoot(outputRoot) {
  if (!outputRoot || typeof outputRoot !== "string") {
    throw new Error("Runtime sync requires an explicit outputRoot.");
  }
  const resolved = resolve(outputRoot);
  if (resolved !== outputRoot) {
    throw new Error(`Runtime sync outputRoot must be absolute: ${outputRoot}`);
  }
  if (isInside(sourcePluginRoot, resolved)) {
    throw new Error(`Runtime sync must not write into the source plugin: ${resolved}`);
  }
  if (resolved === repoRoot || resolved === packageRoot) {
    throw new Error(`Runtime sync outputRoot is too broad: ${resolved}`);
  }
  return resolved;
}

function digestDirectory(root) {
  const files = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stats = statSync(path);
      if (stats.isDirectory()) visit(path);
      else if (stats.isFile()) files.push(path);
    }
  }
  visit(root);
  const hash = createHash("sha256");
  for (const path of files) {
    hash.update(relative(root, path).replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(readFileSync(path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function copyRuntimeText(source, destination, expectedFiles, expectedRoot) {
  const stats = statSync(source);
  if (stats.isDirectory()) {
    mkdirSync(destination, { recursive: true });
    for (const entry of readdirSync(source)) {
      copyRuntimeText(join(source, entry), join(destination, entry), expectedFiles, expectedRoot);
    }
    return;
  }
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, readFileSync(source, "utf8").replaceAll("\r\n", "\n"), "utf8");
  chmodSync(destination, stats.mode);
  expectedFiles.add(relative(expectedRoot, destination).replaceAll("\\", "/"));
}

function pruneRuntimeOutput(root, expectedFiles) {
  function visit(directory) {
    for (const name of readdirSync(directory)) {
      const path = join(directory, name);
      const stats = lstatSync(path);
      if (stats.isDirectory()) {
        visit(path);
        if (readdirSync(path).length === 0) rmSync(path, { recursive: true, force: true });
        continue;
      }
      const relativePath = relative(root, path).replaceAll("\\", "/");
      if (stats.isSymbolicLink() || !expectedFiles.has(relativePath)) rmSync(path, { force: true });
    }
  }
  visit(root);
}

// Modules needed by the plugin-local MCP launcher in every MCP-enabled profile.
// The supervisor entry is shipped with the same owner as its launcher.
export const CLAUDE_MCP_RUNTIME_ENTRIES = Object.freeze([
  "generated/plugins/agdf/meta/contracts",
  "lib/mcp-dispatch-runtime.js",
  "lib/mcp-lifecycle/package.js",
  "lib/mcp-lifecycle/plugin-runtime.js",
  "lib/mcp-lifecycle/facade-entry.js",
  "lib/mcp-lifecycle/facade-owner-entry.js",
  "lib/npm-invocation.js",
]);

const COPILOT_CONTEXT_EMITTER = `  const emitContext = (additionalContext) => {
    if (surface === "copilot") console.log(JSON.stringify({ additionalContext }));
    else console.log(additionalContext);
  };`;

const COPILOT_CONSENT_GATE = `  let consentEnabled = false;
  if (["codex", "claude", "copilot", "opencode"].includes(surface)) {`;

// Claude Code runs the hook only while the AGDF plugin is enabled, so enablement is its consent
// (automaticRuntimeChecks.surfaces.claude: plugin-enablement); no receipt exists or is required.
const CLAUDE_PLUGIN_CONSENT_GATE = `  let consentEnabled = surface === "claude";
  if (["codex", "copilot", "opencode"].includes(surface)) {`;

// Claude Code loads a directory-marketplace plugin in place, so the version alone cannot reveal a
// stale plugin root; its installation provenance can. The notice is appended last, so the kernel,
// the binding and the runtime facts keep their positions.
const CLAUDE_DRIFT_AWARE_CONTEXT_EMITTER = `  let installationDrift = null;
  if (surface === "claude") {
    try { installationDrift = inspectClaudeHostInstallationDrift({ pluginRoot }); } catch {}
  }
  const driftContext = installationDrift?.status === "drift"
    ? \`AGDF installation drift: \${JSON.stringify({
      ...installationDrift,
      recovery: installationDrift.packaged_app_copy
        ? "Tell the user before relying on AGDF: this session loads AGDF from the private copy of packaged app " + installationDrift.packaged_app_copy + ", not from the installation. Reinstall AGDF from a terminal outside that app, then restart it."
        : "Tell the user before relying on AGDF: this session loads another AGDF state than the one last installed for Claude, for example after another host's AGDF install changed the shared marketplace. Reinstall AGDF for Claude from a terminal outside Claude Desktop, then restart Claude Code.",
    })}\`
    : "";
  const emitContext = (additionalContext) => {
    const context = driftContext ? [additionalContext, driftContext].join("\\n\\n") : additionalContext;
    if (surface === "copilot") console.log(JSON.stringify({ additionalContext: context }));
    else console.log(context);
  };`;

export function syncPluginRuntime({ outputRoot, mcpRuntime = false, copilot = false } = {}) {
  outputRoot = safeOutputRoot(outputRoot);
  const bundledPackageRoot = join(outputRoot, "create-agdf");
  const expectedPackageFiles = new Set();
  const packageManifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  const pluginDefinition = JSON.parse(readFileSync(join(getPluginSourceRoot(repoRoot), "meta", "agdf-plugin.definition.json"), "utf8"));
  const activationKernel = requestActivationKernel();
  if (packageManifest.version !== pluginDefinition.version) {
    throw new Error(`Refusing runtime sync with version skew: create-agdf ${packageManifest.version}, plugin ${pluginDefinition.version}`);
  }
  mkdirSync(bundledPackageRoot, { recursive: true });
  const runtimeEntries = [
    "bin/agdf-validator.js",
    "lib/runtime/local-validator.js",
    "lib/runtime/runtime-probe.js",
    "lib/runtime/git-history.js",
    "lib/runtime/git-originals.js",
    "lib/control-command.js",
    "lib/runtime/control-command-service.js",
    "lib/runtime/control-context.js",
    "lib/runtime/plugin-provenance.js",
    "lib/host-command.js",
    // Run creation and run-state writes retry Windows rename locks through it.
    "lib/runtime-check-consent/contract.js",
    "lib/host-adapters/codex/session-command.js",
    "lib/host-adapters/claude/session-command.js",
    "lib/host-adapters/copilot/session-command.js",
    "lib/host-adapters/opencode/session-command.js",
    "lib/host-adapters/session-command.js",
    "lib/runtime/validator-application.js",
    "lib/skill-dispatch",
    "lib/cli/command-registry.js",
    "lib/cli/contract-command.js",
    "lib/cli/delivery-path-search-command.js",
    "lib/cli/parse-args.js",
    "lib/cli/runtime-context.js",
    "lib/cli/validation-handlers.js",
    "lib/cli/control-maintenance-command.js",
    "lib/control-maintenance",
    "lib/control-evaluation",
    "lib/control-state",
    "lib/delivery-path-search",
    "lib/repository-context.js",
    "generated/plugins/agdf/meta/agdf-plugin.definition.json",
    "generated/plugins/agdf/meta/agdf-interaction-locales.json",
    "NOTICE",
    ...(mcpRuntime ? CLAUDE_MCP_RUNTIME_ENTRIES : []),
  ];
  for (const entry of runtimeEntries) {
    const source = join(packageRoot, entry);
    const destination = join(bundledPackageRoot, entry);
    copyRuntimeText(source, destination, expectedPackageFiles, bundledPackageRoot);
  }
  projectCore(bundledPackageRoot, { copilot });
  copyRuntimeText(join(bundledPackageRoot, "runtime", "core"), join(bundledPackageRoot, "runtime", "core"), expectedPackageFiles, bundledPackageRoot);
  const runtimePackageManifest = {
    name: "@agdf/local-validator-runtime",
    version: packageManifest.version,
    private: true,
    type: "module",
    imports: coreImports,
  };
  writeFileSync(join(bundledPackageRoot, "package.json"), `${JSON.stringify(runtimePackageManifest, null, 2)}\n`, "utf8");
  expectedPackageFiles.add("package.json");
  pruneRuntimeOutput(bundledPackageRoot, expectedPackageFiles);
  const manifest = {
    schema_version: "1",
    generated: true,
    source: "create-agdf/cli",
    version: packageManifest.version,
    entrypoint: "create-agdf/bin/agdf-validator.js",
    digest: digestDirectory(bundledPackageRoot),
  };
  writeFileSync(join(outputRoot, "runtime-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  writeFileSync(join(outputRoot, "agdf-local.js"), `#!/usr/bin/env node\n\n// Generated by scripts/sync-plugin-runtime.js; do not edit.\nimport { readFileSync } from "node:fs";\nimport process from "node:process";\nimport { fileURLToPath } from "node:url";\nimport { resolvePluginHostEnvironment, runLocalValidator } from "./create-agdf/lib/runtime/local-validator.js";\n\nconst runtimeRoot = fileURLToPath(new URL(".", import.meta.url));\nconst pluginRoot = fileURLToPath(new URL("../", import.meta.url));\nconst manifest = JSON.parse(readFileSync(new URL("./runtime-manifest.json", import.meta.url), "utf8"));\nconst hostEnvironment = resolvePluginHostEnvironment(process.env);\nprocess.exitCode = runLocalValidator({\n  runtimeRoot,\n  pluginRoot,\n  expectedPluginRoot: hostEnvironment.expectedPluginRoot,\n  expectedVersion: manifest.version,\n  surface: hostEnvironment.surface,\n}, process.argv.slice(2));\n`, "utf8");
  writeFileSync(join(outputRoot, "agdf-session-check.js"), `#!/usr/bin/env node

// Generated by scripts/sync-plugin-runtime.js; do not edit.
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { digestNormalizedPluginSource } from "./create-agdf/lib/runtime/plugin-provenance.js";${copilot ? "" : `
import { inspectClaudeHostInstallationDrift } from "./create-agdf/runtime/core/lib/runtime/host-installation.js";`}
import { resolvePluginHostEnvironment } from "./create-agdf/lib/runtime/local-validator.js";
import { fixedRuntimeCheckCommand, runtimeCheckCapabilityIdentity } from "./create-agdf/lib/runtime-check-consent/contract.js";
import { resolveRepositoryContext } from "./create-agdf/lib/repository-context.js";
import { createDispatchBinding, unavailableDispatchContext } from "./create-agdf/lib/skill-dispatch/binding.js";
import { inspectStartupCompatibility, startupMaintenanceInvocation } from "./create-agdf/lib/control-maintenance/startup.js";
import { renderStartupControlNotice } from "./create-agdf/runtime/core/lib/control-maintenance/presentation.js";

if (process.argv.length !== 2) {
  console.error("AGDF automatic runtime check accepts no arguments.");
  process.exitCode = 2;
} else {
  const { surface } = resolvePluginHostEnvironment(process.env, { defaultSurface: "codex" });
  const dataRoot = process.env.AGDF_DATA_DIR
    || (process.platform === "darwin"
      ? join(homedir(), "Library", "Application Support", "agdf")
      : process.platform === "win32"
        ? join(process.env.LOCALAPPDATA || process.env.APPDATA || join(homedir(), "AppData", "Local"), "agdf")
        : join(process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"), "agdf"));
  const pluginRoot = fileURLToPath(new URL("../", import.meta.url));
  const validator = fileURLToPath(new URL("./agdf-local.js", import.meta.url));
  const routeSourceAfterActivation = existsSync(join(pluginRoot, "meta", "contracts", "request-activation.md"))
    ? "../meta/contracts/request-activation.md"
    : "../skills/contracts/request-activation.md";
  const manifest = JSON.parse(readFileSync(new URL("./runtime-manifest.json", import.meta.url), "utf8"));
  let dispatchBinding;
  try {
  dispatchBinding = createDispatchBinding({
    validator,
    surface,
    expectedVersion: manifest.version,
    requestActivation: ${JSON.stringify({
      owner: activationKernel.identity.owner,
      policy_version: activationKernel.identity.policy_version,
      guard_fingerprint: activationKernel.identity.guard_fingerprint,
    })},
    routeSource: {
      relative_to: "validator_directory",
      path: routeSourceAfterActivation,
    },
  });
  } catch { /* Invalid launch capability must never expose an executable binding. */ }
  const activationKernel = ${JSON.stringify(activationKernel.kernel)};
  const bindingContext = dispatchBinding ? \`AGDF dispatcher binding: \${JSON.stringify(dispatchBinding)}\` : unavailableDispatchContext();
  const baseContext = [activationKernel, bindingContext].join("\\n\\n");
${copilot ? COPILOT_CONTEXT_EMITTER : CLAUDE_DRIFT_AWARE_CONTEXT_EMITTER}
${copilot ? COPILOT_CONSENT_GATE : CLAUDE_PLUGIN_CONSENT_GATE}
    try {
      const receipt = JSON.parse(readFileSync(join(dataRoot, "runtime-checks", \`\${surface}.json\`), "utf8"));
      consentEnabled = receipt?.schema_version === 1
        && receipt?.owner === "create-agdf"
        && receipt?.capability_id === "automatic-runtime-checks"
        && receipt?.surface === surface
        && receipt?.requested_state === "enabled";
      if (consentEnabled && [${copilot ? '"codex", "claude", "copilot"' : '"codex", "copilot"'}].includes(surface)) {
        const definition = JSON.parse(readFileSync(new URL("../meta/agdf-plugin.definition.json", import.meta.url), "utf8"));
        const currentIdentity = runtimeCheckCapabilityIdentity({
          capability: definition.automaticRuntimeChecks,
          surface,
          runtimeDigest: manifest.digest,
          sourceDigest: digestNormalizedPluginSource(pluginRoot, manifest.version),
          command: fixedRuntimeCheckCommand(surface, pluginRoot, process.platform),
        });
        consentEnabled = receipt.capability_identity === currentIdentity;
      }
    } catch {}
  }
  if (!consentEnabled) {
    emitContext(baseContext);
    process.exit(0);
  }
  let hookInput = {};
  try {
    const input = readFileSync(0, "utf8").trim();
    if (input) hookInput = JSON.parse(input);
  } catch {}
  const hookCwd = typeof hookInput.cwd === "string" && isAbsolute(hookInput.cwd) ? hookInput.cwd
    : surface === "opencode" ? process.cwd() : "";
  const hostContext = resolveRepositoryContext(hookCwd);
  const repositoryRoot = hostContext.context_state === "repository_bound" ? hostContext.repository_root : "";
  let check = { status: "skipped", findings: 0 };
  let configState = "unavailable";
  let languages;
  let repositoryControl;
  const deadline = Date.now() + 10000;
  if (repositoryRoot) {
    const runtimeEnv = { ...process.env, AGDF_SURFACE: process.env.AGDF_SURFACE || "plugin" };
    // Doctor runs beside the compatibility inspection: run first, it can exhaust the shared deadline alone.
    const doctorOutput = new Promise((resolveDoctor) => {
      const child = execFile(process.execPath, [validator, "doctor", "--all-active", "--json", "--dir", repositoryRoot], {
        cwd: repositoryRoot,
        env: runtimeEnv,
        encoding: "utf8",
        timeout: 10000,
        maxBuffer: 1024 * 1024,
      }, (_error, stdout) => resolveDoctor(stdout));
      child.stdin?.end();
    });
    const configPath = join(repositoryRoot, ".agdf", "control", "config.json");
    configState = "missing";
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, "utf8"));
        const requiredLanguageFields = ["artifact_language", "chat_language", "runtime_language"];
        if (!config || typeof config !== "object" || Array.isArray(config)
            || !requiredLanguageFields.every((field) => typeof config[field] === "string" && config[field].trim())) {
          throw new Error("invalid AGDF language config");
        }
        const compactLanguage = (value, fallback) => {
          const candidate = typeof value === "string" ? value.trim() : "";
          return /^[A-Za-z0-9-]{1,24}$/.test(candidate) ? candidate : fallback;
        };
        configState = "valid";
        languages = {
          artifact: compactLanguage(config.artifact_language, "unset"),
          chat: compactLanguage(config.chat_language, "unset"),
          runtime: compactLanguage(config.runtime_language, "en"),
        };
      } catch {
        configState = "invalid";
      }
    }
    repositoryControl = inspectStartupCompatibility({ target: repositoryRoot, executable: process.execPath,
      validator, env: runtimeEnv, deadline });
    const invocation = startupMaintenanceInvocation(repositoryControl, { executable: process.execPath,
      validator, language: languages?.chat || "en" });
    if (invocation) {
      repositoryControl.invocation = invocation;
      repositoryControl.notice = renderStartupControlNotice(repositoryControl, { language: languages?.chat || "en" });
    }
    try {
      const report = JSON.parse((await doctorOutput) || "{}");
      const supportedStatuses = new Set(["pass", "warn", "revise", "block"]);
      const rawStatus = typeof report.status === "string" ? report.status : "unknown";
      const rawFindings = report.summary?.findings ?? report.reports?.reduce((sum, item) => sum + (item.summary?.findings ?? 0), 0) ?? 0;
      check = {
        status: supportedStatuses.has(rawStatus) ? rawStatus : "unknown",
        findings: Number.isSafeInteger(rawFindings) && rawFindings >= 0 ? Math.min(rawFindings, 999999) : 0,
      };
    } catch {
      check = { status: "unavailable", findings: 0 };
    }
  }
  const facts = {
    context_state: hostContext.context_state,
    working_directory: hostContext.working_directory,
    automatic_check: check,
    config: configState,
    ...(languages ? { languages } : {}),
    ...(repositoryControl ? { repository_control: repositoryControl } : {}),
  };
  const additionalContext = [baseContext, \`AGDF runtime facts: \${JSON.stringify(facts)}\`].join("\\n\\n");
  emitContext(additionalContext);
  process.exitCode = 0;
}
`, "utf8");
  const expectedOutputFiles = new Set([
    ...[...expectedPackageFiles].map((path) => `create-agdf/${path}`),
    "runtime-manifest.json",
    "agdf-local.js",
    "agdf-session-check.js",
  ]);
  pruneRuntimeOutput(outputRoot, expectedOutputFiles);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) syncPluginRuntime();
