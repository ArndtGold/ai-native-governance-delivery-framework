import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REQUEST_ACTIVATION_MARKERS,
  computeRequestActivationGuardFingerprint,
} from "./sync-request-activation-projections.js";

const scriptsRoot = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptsRoot, "..");
const repoRoot = resolve(packageRoot, "..");
const sourcePluginRoot = join(repoRoot, "plugin");

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
      || identity.path !== "plugin/meta/contracts/request-activation.md"
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

function copyRuntimeText(source, destination) {
  const stats = statSync(source);
  if (stats.isDirectory()) {
    mkdirSync(destination, { recursive: true });
    for (const entry of readdirSync(source)) {
      copyRuntimeText(join(source, entry), join(destination, entry));
    }
    return;
  }
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, readFileSync(source, "utf8").replaceAll("\r\n", "\n"), "utf8");
  chmodSync(destination, stats.mode);
}

export function syncPluginRuntime({ outputRoot } = {}) {
  outputRoot = safeOutputRoot(outputRoot);
  const bundledPackageRoot = join(outputRoot, "create-agdf");
  const packageManifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  const pluginDefinition = JSON.parse(readFileSync(join(repoRoot, "plugin", "meta", "agdf-plugin.definition.json"), "utf8"));
  const activationKernel = requestActivationKernel();
  if (packageManifest.version !== pluginDefinition.version) {
    throw new Error(`Refusing runtime sync with version skew: create-agdf ${packageManifest.version}, plugin ${pluginDefinition.version}`);
  }
  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(bundledPackageRoot, { recursive: true });
  const runtimeEntries = [
    "bin/agdf-validator.js",
    "lib/runtime/local-validator.js",
    "lib/runtime/plugin-provenance.js",
    "lib/runtime-check-consent/contract.js",
    "lib/runtime/validator-application.js",
    "lib/skill-dispatch",
    "lib/cli/command-registry.js",
    "lib/cli/delivery-path-search-command.js",
    "lib/cli/parse-args.js",
    "lib/cli/runtime-context.js",
    "lib/cli/validation-handlers.js",
    "lib/control-evaluation",
    "lib/control-state",
    "lib/delivery-path-search",
    "lib/interaction-presentation.js",
    "lib/repository-context.js",
    "lib/task-target-resolution.js",
    "generated/plugins/agdf/meta/agdf-plugin.definition.json",
    "generated/plugins/agdf/meta/agdf-interaction-locales.json",
    "NOTICE",
  ];
  for (const entry of runtimeEntries) {
    const source = join(packageRoot, entry);
    const destination = join(bundledPackageRoot, entry);
    copyRuntimeText(source, destination);
  }
  const runtimePackageManifest = {
    name: "@agdf/local-validator-runtime",
    version: packageManifest.version,
    private: true,
    type: "module",
  };
  writeFileSync(join(bundledPackageRoot, "package.json"), `${JSON.stringify(runtimePackageManifest, null, 2)}\n`, "utf8");
  const manifest = {
    schema_version: "1",
    generated: true,
    source: "create-agdf/cli",
    version: packageManifest.version,
    entrypoint: "create-agdf/bin/agdf-validator.js",
    digest: digestDirectory(bundledPackageRoot),
  };
  writeFileSync(join(outputRoot, "runtime-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  writeFileSync(join(outputRoot, "agdf-local.js"), `#!/usr/bin/env node\n\n// Generated by create-agdf/scripts/sync-plugin-runtime.js; do not edit.\nimport { readFileSync } from "node:fs";\nimport process from "node:process";\nimport { fileURLToPath } from "node:url";\nimport { runLocalValidator } from "./create-agdf/lib/runtime/local-validator.js";\n\nconst runtimeRoot = fileURLToPath(new URL(".", import.meta.url));\nconst pluginRoot = fileURLToPath(new URL("../", import.meta.url));\nconst manifest = JSON.parse(readFileSync(new URL("./runtime-manifest.json", import.meta.url), "utf8"));\nprocess.exitCode = runLocalValidator({\n  runtimeRoot,\n  pluginRoot,\n  expectedPluginRoot: process.env.CLAUDE_PLUGIN_ROOT || process.env.PLUGIN_ROOT || undefined,\n  expectedVersion: manifest.version,\n  surface: process.env.AGDF_SURFACE || "plugin",\n}, process.argv.slice(2));\n`, "utf8");
  writeFileSync(join(outputRoot, "agdf-session-check.js"), `#!/usr/bin/env node

// Generated by create-agdf/scripts/sync-plugin-runtime.js; do not edit.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { digestNormalizedPluginSource } from "./create-agdf/lib/runtime/plugin-provenance.js";
import { fixedRuntimeCheckCommand, runtimeCheckCapabilityIdentity } from "./create-agdf/lib/runtime-check-consent/contract.js";
import { resolveRepositoryContext } from "./create-agdf/lib/repository-context.js";
import { createDispatchBinding, unavailableDispatchContext } from "./create-agdf/lib/skill-dispatch/binding.js";

if (process.argv.length !== 2) {
  console.error("AGDF automatic runtime check accepts no arguments.");
  process.exitCode = 2;
} else {
  const requestedSurface = process.env.AGDF_SURFACE
    || (process.env.COPILOT_PLUGIN_DATA ? "copilot" : process.env.PLUGIN_ROOT ? "codex"
      : process.env.CLAUDE_PLUGIN_ROOT ? "claude" : "codex");
  const surface = ["codex", "claude", "copilot", "opencode"].includes(requestedSurface) ? requestedSurface : "codex";
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
    : "../copilot-skills/contracts/request-activation.md";
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
  const emitContext = (additionalContext) => {
    if (surface === "copilot") console.log(JSON.stringify({ additionalContext }));
    else console.log(additionalContext);
  };
  let consentEnabled = false;
  if (["codex", "claude", "copilot", "opencode"].includes(surface)) {
    try {
      const receipt = JSON.parse(readFileSync(join(dataRoot, "runtime-checks", \`\${surface}.json\`), "utf8"));
      consentEnabled = receipt?.schema_version === 1
        && receipt?.owner === "create-agdf"
        && receipt?.capability_id === "automatic-runtime-checks"
        && receipt?.surface === surface
        && receipt?.requested_state === "enabled";
      if (consentEnabled && ["codex", "claude", "copilot"].includes(surface)) {
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
  const hookCwd = typeof hookInput.cwd === "string" && isAbsolute(hookInput.cwd) ? hookInput.cwd : "";
  const hostContext = resolveRepositoryContext(hookCwd);
  const repositoryRoot = hostContext.context_state === "repository_bound" ? hostContext.repository_root : "";
  let check = { status: "skipped", findings: 0 };
  let configState = "unavailable";
  let languages;
  if (repositoryRoot) {
    const child = spawnSync(process.execPath, [validator, "doctor", "--all-active", "--json", "--dir", repositoryRoot], {
      cwd: repositoryRoot,
      env: { ...process.env, AGDF_SURFACE: process.env.AGDF_SURFACE || "plugin" },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    });
    try {
      const report = JSON.parse(child.stdout || "{}");
      const supportedStatuses = new Set(["pass", "warn", "block", "blocked", "error", "failed", "unknown", "unavailable"]);
      const rawStatus = typeof report.status === "string" ? report.status : "unknown";
      const rawFindings = report.summary?.findings ?? report.reports?.reduce((sum, item) => sum + (item.summary?.findings ?? 0), 0) ?? 0;
      check = {
        status: supportedStatuses.has(rawStatus) ? rawStatus : "unknown",
        findings: Number.isSafeInteger(rawFindings) && rawFindings >= 0 ? Math.min(rawFindings, 999999) : 0,
      };
    } catch {
      check = { status: "unavailable", findings: 0 };
    }
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
  }
  const facts = {
    context_state: hostContext.context_state,
    working_directory: hostContext.working_directory,
    automatic_check: check,
    config: configState,
    ...(languages ? { languages } : {}),
  };
  const additionalContext = [baseContext, \`AGDF runtime facts: \${JSON.stringify(facts)}\`].join("\\n\\n");
  emitContext(additionalContext);
  process.exitCode = 0;
}
`, "utf8");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) syncPluginRuntime();
