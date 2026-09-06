import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { generatedRoot, pluginDefinition } from "../cli/runtime-context.js";
import { evaluateOpenCodeRepositoryActivation } from "./opencode-activation.js";
import { resolveLocalValidator } from "../runtime/local-validator.js";
import { digestDirectory } from "../runtime/plugin-provenance.js";
import { validateLocalOpenCodePackageSource } from "./local-development.js";
import { npmInvocation } from "./npm-invocation.js";

function runtimeContractModuleNames(definition) {
  const modules = definition?.runtimeContract?.modules;
  if (definition?.runtimeContract?.schemaVersion !== 1 || !Array.isArray(modules) || modules.length === 0) {
    throw new Error("OpenCode installation requires the definition-owned runtimeContract inventory.");
  }
  const names = modules.map((modulePath) => {
    const match = /^meta\/contracts\/([a-z0-9-]+\.md)$/.exec(modulePath);
    if (!match) throw new Error(`OpenCode runtime contract has an invalid module path: ${modulePath}`);
    return match[1];
  });
  if (new Set(names).size !== names.length) throw new Error("OpenCode runtime contract modules must be unique.");
  if (names[0] !== "request-activation.md" || names[1] !== "task-target-resolution.md") {
    throw new Error("OpenCode runtime contract must place request activation before task-target resolution.");
  }
  return Object.freeze(names);
}

const contractModules = runtimeContractModuleNames(pluginDefinition);
const openCodeSkillNames = pluginDefinition.skillSet.map((skill) => pluginDefinition.opencode.skillPrefix + skill.slug);
const globalOpenCodeSkillNames = pluginDefinition.skillSet.map((skill) => pluginDefinition.opencode.globalSkillPrefix + skill.slug);
const globalOpenCodeSkillOwnershipMarker = "<!-- AGDF-GLOBAL-SKILL: ";
const globalOpenCodeInstructionsOwnershipMarker = "<!-- AGDF-GLOBAL-INSTRUCTIONS -->";
const globalOpenCodeRuntimeContractOwnershipMarker = "<!-- AGDF-GLOBAL-RUNTIME-CONTRACT -->";
const globalOpenCodeValidatorOwnershipMarker = "// AGDF-GLOBAL-LOCAL-VALIDATOR";
const globalOpenCodeAgentOwnershipMarker = `<!-- AGDF-GLOBAL-AGENT: ${pluginDefinition.opencode.evaluatorAgentName} -->`;
const globalOpenCodeValidatorPackageOwner = "create-agdf";
const requestActivationGuardStart = "<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->";
const requestActivationGuardEnd = "<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->";
const openCodeRouterFileName = "agdf-agent-router.md";
export const openCodePluginEntrypoint = `./node_modules/${pluginDefinition.opencode.npmPackage}/opencode-plugin.js`;
export function openCodeNpmInvocation(args) {
  const invocation = npmInvocation(args);
  return { executable: invocation.executable, args: [...invocation.args] };
}

function openCodeLifecycleError(phase, message, evidence = {}) {
  const error = new Error(message);
  error.name = "LifecycleAdapterError";
  error.phase = phase;
  error.evidence = evidence;
  return error;
}

export function defaultOpenCodeConfigDir() {
  return process.env.OPENCODE_CONFIG_DIR || join(homedir(), ".config", "opencode");
}

export function resolveOpenCodeInstallPackageSource(packageSource) {
  const local = packageSource ? validateLocalOpenCodePackageSource(packageSource) : null;
  return Object.freeze({
    local,
    specifier: local?.specifier ?? `${pluginDefinition.opencode.npmPackage}@${pluginDefinition.version}`,
  });
}

export function installOpenCodeGlobalPlugin(configDir, dependencies = {}) {
  try {
    assertGlobalOpenCodeSurfaceWritable(configDir);
  } catch (error) {
    throw openCodeLifecycleError("ownership_preflight", error.message, { configDir });
  }
  const previousPackage = resolveOpenCodePackage(configDir);
  const configPath = join(configDir, "opencode.json");
  let config = {};

  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf8"));
    } catch {
      throw openCodeLifecycleError("configuration", `Refusing to update unreadable OpenCode config: ${configPath}`, { configPath });
    }
  }

  if (config.plugin !== undefined && !Array.isArray(config.plugin)) {
    throw openCodeLifecycleError("configuration", `Refusing to update OpenCode config with non-array plugin field: ${configPath}`, { configPath });
  }

  const plugins = (config.plugin ?? []).map((entry) => (
    entry === pluginDefinition.opencode.npmPackage || entry.startsWith(`${pluginDefinition.opencode.npmPackage}@`)
      ? openCodePluginEntrypoint
      : entry
  ));
  const alreadyInstalled = plugins.includes(openCodePluginEntrypoint);
  if (!alreadyInstalled) {
    plugins.push(openCodePluginEntrypoint);
  }

  const nextConfig = {
    "$schema": config.$schema ?? "https://opencode.ai/config.json",
    ...config,
    plugin: plugins,
  };

  if (nextConfig.instructions !== undefined && !Array.isArray(nextConfig.instructions)) {
    throw openCodeLifecycleError("configuration", `Refusing to update OpenCode config with non-array instructions field: ${configPath}`, { configPath });
  }
  nextConfig.instructions = [...(nextConfig.instructions ?? [])];
  if (!nextConfig.instructions.includes("AGDF.md")) nextConfig.instructions.push("AGDF.md");

  const canonicalPermissions = pluginDefinition.opencode.permissions;
  if (nextConfig.permission === undefined) {
    nextConfig.permission = JSON.parse(JSON.stringify(canonicalPermissions));
  } else if (nextConfig.permission && typeof nextConfig.permission === "object" && !Array.isArray(nextConfig.permission)) {
    nextConfig.permission = { ...nextConfig.permission };
    for (const permissionName of ["question", "edit", "bash"]) {
      if (nextConfig.permission[permissionName] === undefined) {
        nextConfig.permission[permissionName] = canonicalPermissions[permissionName];
      }
    }
    if (nextConfig.permission.skill === undefined) {
      nextConfig.permission.skill = { ...canonicalPermissions.skill };
    } else if (nextConfig.permission.skill && typeof nextConfig.permission.skill === "object" && !Array.isArray(nextConfig.permission.skill)) {
      nextConfig.permission.skill = { ...nextConfig.permission.skill };
      for (const [skillPattern, decision] of Object.entries(canonicalPermissions.skill)) {
        if (nextConfig.permission.skill[skillPattern] === undefined) nextConfig.permission.skill[skillPattern] = decision;
      }
    }
  }

  mkdirSync(configDir, { recursive: true });
  let localPackageSource = null;
  try {
    const packageSource = resolveOpenCodeInstallPackageSource(dependencies.packageSource);
    localPackageSource = packageSource.local;
    const packageSpecifier = packageSource.specifier;
    const invocation = openCodeNpmInvocation([
      "install",
      "--silent",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--save-prod",
      "--save-exact",
      packageSpecifier,
    ]);
    execFileSync(invocation.executable, invocation.args, {
      cwd: configDir,
      stdio: "pipe",
    });
  } catch (error) {
    const failedInvocation = openCodeNpmInvocation(["install"]);
    throw openCodeLifecycleError("plugin_operation", `Failed to install ${pluginDefinition.opencode.npmPackage} into the OpenCode config directory: ${(error.stderr || error.message).toString().trim()}`, {
      executable: failedInvocation.executable,
      args: failedInvocation.args,
    });
  }
  try {
    writeFileSync(configPath, `${JSON.stringify(nextConfig, null, 2)}\n`, "utf8");
  } catch (error) {
    throw openCodeLifecycleError("configuration", `Failed to write OpenCode config ${configPath}: ${error.message}`, { configPath });
  }
  const installedPackage = resolveOpenCodePackage(configDir);
  if (!installedPackage.loadable || !installedPackage.package_root) {
    throw openCodeLifecycleError("verification", "Installed OpenCode AGDF package is not loadable after installation.", { configDir });
  }
  const installedPackageDigest = digestDirectory(installedPackage.package_root);
  const sdkAlignment = alignOpenCodePluginSdk(configDir);

  return {
    configPath,
    added: !alreadyInstalled,
    transition: openCodePackageTransition(previousPackage, installedPackage),
    sdk_alignment: sdkAlignment,
    installed_package: { root: installedPackage.package_root, digest: installedPackageDigest },
    package_source: localPackageSource
      ? { kind: "local_checkout", path: localPackageSource.tarball, digest: localPackageSource.digest, version: localPackageSource.version }
      : { kind: "registry", path: "", digest: "", version: pluginDefinition.version },
  };
}

function globalOpenCodeConfigPaths(configDir) {
  return {
    instructions: join(configDir, pluginDefinition.opencode.instructionsFileName),
    router: join(configDir, "node_modules", pluginDefinition.opencode.npmPackage, "generated", ".opencode", openCodeRouterFileName),
    runtimeContract: join(configDir, pluginDefinition.opencode.runtimeContractFileName),
    contracts: join(configDir, "contracts"),
    skills: join(configDir, "skills"),
    localValidator: join(configDir, "agdf", "bin", "agdf-local.js"),
    localValidatorPackage: join(configDir, "agdf", "package.json"),
    evaluatorAgent: join(configDir, "agents", `${pluginDefinition.opencode.evaluatorAgentName}.md`),
  };
}

function readGlobalOpenCodeValidatorPackage(path) {
  if (!existsSync(path)) return null;
  let existing;
  try {
    existing = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
  return existing;
}

function globalOpenCodeValidatorPackageIsValid(path) {
  const manifest = readGlobalOpenCodeValidatorPackage(path);
  return manifest?.type === "module"
    && manifest?.agdf?.owner === globalOpenCodeValidatorPackageOwner
    && manifest?.agdf?.surface === "opencode-global-validator";
}

function assertGlobalOpenCodeValidatorPackageWritable(path) {
  if (!existsSync(path)) return;
  if (!globalOpenCodeValidatorPackageIsValid(path)) {
    throw new Error(`Refusing to overwrite unowned global OpenCode validator package: ${path}`);
  }
}

function globalOpenCodeOwnershipMarkerIsValid(content, marker, placement) {
  const lines = content.split(/\r?\n/);
  if (placement === "first-line") return lines[0] === marker;
  const frontmatterEnd = lines.findIndex((line, index) => index > 0 && line === "---");
  return frontmatterEnd >= 0 && lines[frontmatterEnd + 1] === marker;
}

function assertGlobalOpenCodeFileWritable(path, marker, placement) {
  if (!existsSync(path)) return;
  const existing = readFileSync(path, "utf8");
  if (!globalOpenCodeOwnershipMarkerIsValid(existing, marker, placement)) {
    throw new Error(`Refusing to overwrite unowned global OpenCode file: ${path}`);
  }
}

function assertGlobalOpenCodeSurfaceWritable(configDir) {
  const paths = globalOpenCodeConfigPaths(configDir);
  assertGlobalOpenCodeFileWritable(paths.instructions, globalOpenCodeInstructionsOwnershipMarker, "first-line");
  assertGlobalOpenCodeFileWritable(paths.runtimeContract, globalOpenCodeRuntimeContractOwnershipMarker, "first-line");
  assertGlobalOpenCodeFileWritable(paths.localValidator, globalOpenCodeValidatorOwnershipMarker, "first-line");
  assertGlobalOpenCodeFileWritable(paths.evaluatorAgent, globalOpenCodeAgentOwnershipMarker, "after-frontmatter");
  assertGlobalOpenCodeValidatorPackageWritable(paths.localValidatorPackage);
  for (const moduleName of contractModules) {
    assertGlobalOpenCodeFileWritable(
      join(paths.contracts, moduleName),
      globalOpenCodeRuntimeContractOwnershipMarker,
      "first-line",
    );
  }
  for (const skillName of globalOpenCodeSkillNames) {
    assertGlobalOpenCodeFileWritable(
      join(paths.skills, skillName, "SKILL.md"),
      `${globalOpenCodeSkillOwnershipMarker}${skillName} -->`,
      "after-frontmatter",
    );
  }
}

function writeOwnedGlobalOpenCodeFile(path, content, marker, placement) {
  if (existsSync(path)) {
    assertGlobalOpenCodeFileWritable(path, marker, placement);
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function globalOpenCodeActivationGuard() {
  return [
    "## Repository Activation Guard",
    "",
    "This guard is reachable only after positive Request Activation and applies only to a target-bound route.",
    "Control-independent help, global plugin lifecycle, global runtime checks and global installation status bypass this guard and never invent or inspect a repository target.",
    "For a target-bound route, continue only when the current OpenCode plugin system context explicitly declares this repository AGDF-active and supplies an exact `AGDF dispatcher binding:`.",
    "If either signal is absent, stop and direct the user to `npx --yes @agdf/cli@latest opencode-repo`; the global installation alone is not activation.",
    "Do not inspect files, search installed packages, derive a runtime path or request shell permission to establish activation or recover a missing binding.",
    "The Conditional Executable Dispatch section below is unreachable unless both signals are present.",
    "",
  ].join("\n");
}

function toGlobalOpenCodeContent(content) {
  let next = content;
  for (const skill of pluginDefinition.skillSet) {
    const localName = `${pluginDefinition.opencode.skillPrefix}${skill.slug}`;
    const globalName = `${pluginDefinition.opencode.globalSkillPrefix}${skill.slug}`;
    next = next.replaceAll(localName, globalName);
  }
  return next;
}

export function toGlobalOpenCodeInstructionsBootstrap(content) {
  const localRouterReference = `the sibling \`${openCodeRouterFileName}\``;
  const globalRouterReference = `\`./node_modules/${pluginDefinition.opencode.npmPackage}/generated/.opencode/${openCodeRouterFileName}\``;
  const globalBootstrap = toGlobalOpenCodeContent(content);
  if (globalBootstrap.split(localRouterReference).length !== 2) {
    throw new Error("OpenCode micro-bootstrap must contain exactly one on-demand router reference.");
  }
  return globalBootstrap.replace(localRouterReference, globalRouterReference);
}

function toGlobalOpenCodeSkillContent(content) {
  return toGlobalOpenCodeContent(content).replace(
    "## Executable Dispatch\n",
    [
      "## Conditional Executable Dispatch",
      "",
      "Use only the exact dispatcher binding supplied by the active OpenCode plugin system context.",
      "Never search for, infer or construct an executable or runtime path from this skill, the npm package, the filesystem or prior messages.",
      "Without the explicit active declaration and exact binding, return the activation recovery above without invoking `bash` or another tool.",
      "",
    ].join("\n"),
  );
}

function insertRepositoryActivationGuard(content) {
  const startCount = content.split(requestActivationGuardStart).length - 1;
  const endCount = content.split(requestActivationGuardEnd).length - 1;
  if (startCount !== 1 || endCount !== 1) {
    throw new Error(`OpenCode skill must contain exactly one Request Activation Guard; found ${startCount} start and ${endCount} end markers.`);
  }
  const start = content.indexOf(requestActivationGuardStart);
  const end = content.indexOf(requestActivationGuardEnd, start);
  if (end < start) throw new Error("OpenCode Request Activation Guard markers are out of order.");
  const insertion = end + requestActivationGuardEnd.length;
  return `${content.slice(0, insertion)}\n\n${globalOpenCodeActivationGuard()}${content.slice(insertion)}`;
}

export function installOpenCodeGlobalSurface(configDir) {
  assertGlobalOpenCodeSurfaceWritable(configDir);
  const paths = globalOpenCodeConfigPaths(configDir);
  const generatedOpenCodeRoot = join(generatedRoot, ".opencode");
  const generatedInstructions = readFileSync(join(generatedOpenCodeRoot, pluginDefinition.opencode.instructionsFileName), "utf8");
  const generatedRouter = join(generatedOpenCodeRoot, openCodeRouterFileName);
  if (!existsSync(generatedRouter)) throw new Error(`OpenCode on-demand router is unavailable: ${generatedRouter}`);
  const generatedRuntimeContract = readFileSync(join(generatedOpenCodeRoot, pluginDefinition.opencode.runtimeContractFileName), "utf8");
  const globalInstructions = [
    globalOpenCodeInstructionsOwnershipMarker,
    toGlobalOpenCodeInstructionsBootstrap(generatedInstructions),
  ].join("\n");
  const globalRuntimeContract = `${globalOpenCodeRuntimeContractOwnershipMarker}\n${generatedRuntimeContract}`;
  const localValidator = `${globalOpenCodeValidatorOwnershipMarker}\nimport process from "node:process";\nimport { fileURLToPath } from "node:url";\nimport { runLocalValidator } from "../../node_modules/create-agdf/lib/runtime/local-validator.js";\n\nconst ownedPackageRoot = fileURLToPath(new URL("../../node_modules/create-agdf", import.meta.url));\nprocess.exitCode = runLocalValidator({ ownedPackageRoot, expectedVersion: ${JSON.stringify(pluginDefinition.version)}, surface: "opencode" }, process.argv.slice(2));\n`;
  const evaluatorAgent = [
    "---",
    "description: Evaluate one AGDF Delivery Path Search candidate without tools or side effects.",
    "mode: primary",
    "permission:",
    '  "*": deny',
    "---",
    globalOpenCodeAgentOwnershipMarker,
    "",
    "# AGDF Delivery Path Search evaluator",
    "",
    "Evaluate only the bounded candidate supplied in the user message.",
    "Do not call tools, inspect files, delegate work or modify state.",
    "Return only the requested JSON object; AGDF validates it independently.",
    "",
  ].join("\n");

  writeOwnedGlobalOpenCodeFile(paths.instructions, globalInstructions, globalOpenCodeInstructionsOwnershipMarker, "first-line");
  writeOwnedGlobalOpenCodeFile(paths.runtimeContract, globalRuntimeContract, globalOpenCodeRuntimeContractOwnershipMarker, "first-line");
  writeOwnedGlobalOpenCodeFile(paths.localValidator, localValidator, globalOpenCodeValidatorOwnershipMarker, "first-line");
  writeOwnedGlobalOpenCodeFile(paths.evaluatorAgent, evaluatorAgent, globalOpenCodeAgentOwnershipMarker, "after-frontmatter");
  mkdirSync(dirname(paths.localValidatorPackage), { recursive: true });
  writeFileSync(paths.localValidatorPackage, `${JSON.stringify({
    name: "agdf-opencode-validator-runtime",
    private: true,
    type: "module",
    agdf: {
      owner: globalOpenCodeValidatorPackageOwner,
      surface: "opencode-global-validator",
    },
  }, null, 2)}\n`, "utf8");
  for (const moduleName of contractModules) {
    const generatedModule = readFileSync(join(generatedOpenCodeRoot, "contracts", moduleName), "utf8");
    writeOwnedGlobalOpenCodeFile(
      join(paths.contracts, moduleName),
      `${globalOpenCodeRuntimeContractOwnershipMarker}\n${generatedModule}`,
      globalOpenCodeRuntimeContractOwnershipMarker,
      "first-line",
    );
  }

  for (let index = 0; index < openCodeSkillNames.length; index += 1) {
    const sourceName = openCodeSkillNames[index];
    const skillName = globalOpenCodeSkillNames[index];
    const sourcePath = join(generatedOpenCodeRoot, "skills", sourceName, "SKILL.md");
    const sourceContent = readFileSync(sourcePath, "utf8");
    const marker = `${globalOpenCodeSkillOwnershipMarker}${skillName} -->`;
    const markedContent = toGlobalOpenCodeSkillContent(sourceContent).replace(/^(---[\s\S]*?\n---\n)/, `$1${marker}\n\n`);
    const content = insertRepositoryActivationGuard(markedContent);
    writeOwnedGlobalOpenCodeFile(join(paths.skills, skillName, "SKILL.md"), content, marker, "after-frontmatter");
  }

  return {
    instructions: paths.instructions,
    router: paths.router,
    runtimeContract: paths.runtimeContract,
    contracts: paths.contracts,
    skills: paths.skills,
    localValidator: paths.localValidator,
    localValidatorPackage: paths.localValidatorPackage,
    evaluatorAgent: paths.evaluatorAgent,
  };
}

function readOpenCodeConfig(configPath) {
  if (!existsSync(configPath)) return { exists: false, parseError: "", config: {} };
  try {
    return { exists: true, parseError: "", config: JSON.parse(readFileSync(configPath, "utf8")) };
  } catch (error) {
    return { exists: true, parseError: error.message, config: {} };
  }
}

export function resolveOpenCodeInstalledPackage(configDir, packageName, dependencies = {}) {
  const run = dependencies.execFileSync ?? execFileSync;
  try {
    const probe = [
      'const fs = require("node:fs");',
      'const path = require("node:path");',
      `const packageName = ${JSON.stringify(packageName)};`,
      'let resolvedPath = "";',
      'try { resolvedPath = require.resolve(packageName); } catch {}',
      'let manifestPath = "";',
      'for (const root of require.resolve.paths(packageName) || []) {',
      '  const candidate = path.join(root, packageName, "package.json");',
      '  if (fs.existsSync(candidate)) { manifestPath = candidate; break; }',
      '}',
      'if (!manifestPath) throw new Error(`installed package manifest not found: ${packageName}`);',
      'process.stdout.write(JSON.stringify({ resolvedPath, manifestPath }));',
    ].join("\n");
    const rawResolution = run(process.execPath, ["-e", probe], {
      cwd: configDir,
      encoding: "utf8",
      stdio: "pipe",
    });
    let resolvedPath = rawResolution;
    let probedManifestPath = "";
    try {
      const parsed = JSON.parse(rawResolution);
      resolvedPath = parsed.resolvedPath || parsed.manifestPath;
      probedManifestPath = parsed.manifestPath;
    } catch {}
    let current = probedManifestPath ? dirname(probedManifestPath) : dirname(resolvedPath);
    let manifestPath = "";
    let packageRoot = "";
    let manifest = null;
    for (let depth = 0; depth < 20; depth += 1) {
      const candidate = join(current, "package.json");
      if (existsSync(candidate)) {
        try {
          const value = JSON.parse(readFileSync(candidate, "utf8"));
          if (value?.name === packageName) {
            manifestPath = candidate;
            packageRoot = current;
            manifest = value;
            break;
          }
        } catch {}
      }
      const parent = dirname(current);
      if (parent === current) break;
      current = parent;
    }
    if (!manifest) throw new Error(`resolved ${packageName} entry has no matching package manifest`);
    const installedVersion = typeof manifest.version === "string" && manifest.version.trim() ? manifest.version.trim() : "";
    return {
      loadable: true,
      path: resolvedPath,
      manifest_path: manifestPath,
      package_root: packageRoot,
      manifest,
      installed_version: installedVersion,
      error: "",
    };
  } catch (error) {
    return {
      loadable: false,
      path: "",
      manifest_path: "",
      package_root: "",
      manifest: null,
      installed_version: "",
      error: (error.stderr || error.message || "package not resolvable").toString().trim(),
    };
  }
}

function resolveOpenCodePackage(configDir, dependencies = {}) {
  return resolveOpenCodeInstalledPackage(configDir, pluginDefinition.opencode.npmPackage, dependencies);
}

const requiredExperimentalHooks = [
  "experimental.chat.system.transform",
  "experimental.session.compacting",
];

function packageLocalPath(packageRoot, candidate) {
  if (!packageRoot || !candidate) return "";
  const path = resolve(packageRoot, candidate);
  const relation = relative(packageRoot, path);
  return relation === "" || (relation !== ".." && !relation.startsWith(`..${sep}`) && !isAbsolute(relation)) ? path : "";
}

function openCodeHostProbe(dependencies = {}) {
  const executable = dependencies.openCodeBin ?? process.env.AGDF_OPENCODE_BIN ?? "opencode";
  const run = dependencies.execFileSync ?? execFileSync;
  try {
    return {
      name: "opencode",
      executable,
      inspectable: true,
      installed_version: run(executable, ["--version"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 5000,
      }).trim(),
      error: "",
    };
  } catch (error) {
    return {
      name: "opencode",
      executable,
      inspectable: false,
      installed_version: "",
      error: (error.stderr || error.message || "host version unavailable").toString().trim(),
    };
  }
}

function openCodeSdkProbe(configDir, dependencies = {}) {
  const sdk = resolveOpenCodeInstalledPackage(configDir, "@opencode-ai/plugin", dependencies);
  let declarationPath = "";
  let declaration = "";
  if (sdk.loadable) {
    const declaredEntry = sdk.manifest?.types || sdk.manifest?.typings || "dist/index.d.ts";
    declarationPath = packageLocalPath(sdk.package_root, declaredEntry);
    if (declarationPath && existsSync(declarationPath)) {
      try {
        declaration = readFileSync(declarationPath, "utf8");
      } catch (error) {
        sdk.error = error.message;
      }
    } else {
      sdk.error = `SDK declaration not found: ${declaredEntry}`;
    }
  }
  const hooks = requiredExperimentalHooks.map((name) => ({
    name,
    state: !declaration
      ? "uninspectable"
      : declaration.includes(`"${name}"`)
        ? "declared_supported"
        : "declared_missing",
  }));
  const states = hooks.map((hook) => hook.state);
  const aggregate = states.every((state) => state === "declared_supported")
    ? "declared_supported"
    : states.some((state) => state === "uninspectable")
      ? "uninspectable"
      : "degraded";
  return {
    package: {
      name: "@opencode-ai/plugin",
      loadable: sdk.loadable,
      resolved_path: sdk.path,
      manifest_path: sdk.manifest_path,
      declaration_path: declarationPath,
      installed_version: sdk.installed_version || null,
      error: sdk.error,
    },
    hooks: {
      evidence_level: "sdk_declaration",
      aggregate,
      hooks,
      live_invocation_observed: false,
    },
  };
}

export function evaluateOpenCodeHostSdk(configDir, dependencies = {}) {
  const host = openCodeHostProbe(dependencies);
  const sdk = openCodeSdkProbe(configDir, dependencies);
  return {
    host,
    plugin_sdk: sdk.package,
    experimental_hooks: sdk.hooks,
    host_sdk_version: {
      status: !host.installed_version || !sdk.package.installed_version
        ? "unknown"
        : host.installed_version === sdk.package.installed_version
          ? "matching"
          : "divergent",
      host_version: host.installed_version || null,
      sdk_version: sdk.package.installed_version || null,
      policy: "warn_only",
    },
  };
}

const exactOpenCodeVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function openCodeSdkAlignmentResult(status, initial, overrides = {}) {
  return {
    status,
    attempted: false,
    host_version: initial.host.installed_version || null,
    previous_version: initial.plugin_sdk.installed_version || null,
    target_version: null,
    installed_version: initial.plugin_sdk.installed_version || null,
    error: "",
    ...overrides,
  };
}

function openCodeRegistryVersion(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "string" ? parsed.trim() : "";
  } catch {
    return value;
  }
}

function openCodeSdkUnavailable(error) {
  return /(?:ETARGET|E404|404 Not Found|No matching version)/i.test(
    (error?.stderr || error?.message || "").toString(),
  );
}

export function alignOpenCodePluginSdk(configDir, dependencies = {}) {
  const initial = evaluateOpenCodeHostSdk(configDir, dependencies);
  const hostVersion = initial.host.installed_version || "";
  const sdkVersion = initial.plugin_sdk.installed_version || "";
  if (!initial.host.inspectable || !initial.plugin_sdk.loadable || !exactOpenCodeVersionPattern.test(hostVersion)) {
    return openCodeSdkAlignmentResult("not_attempted", initial, {
      target_version: exactOpenCodeVersionPattern.test(hostVersion) ? hostVersion : null,
      error: !initial.host.inspectable
        ? initial.host.error || "OpenCode host version is not inspectable."
        : !initial.plugin_sdk.loadable
          ? initial.plugin_sdk.error || "OpenCode plugin SDK is not inspectable."
          : `OpenCode host version is not an exact semantic version: ${hostVersion || "unknown"}`,
    });
  }
  if (sdkVersion === hostVersion) {
    return openCodeSdkAlignmentResult("already_matching", initial, {
      target_version: hostVersion,
    });
  }

  const run = dependencies.execFileSync ?? execFileSync;
  const packageSpecifier = `@opencode-ai/plugin@${hostVersion}`;
  const registryInvocation = openCodeNpmInvocation(["view", packageSpecifier, "version", "--json"]);
  try {
    const availableVersion = openCodeRegistryVersion(run(registryInvocation.executable, registryInvocation.args, {
      cwd: configDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 15000,
    }));
    if (availableVersion !== hostVersion) {
      return openCodeSdkAlignmentResult("unavailable", initial, {
        target_version: hostVersion,
        error: `Exact plugin SDK version is unavailable: ${packageSpecifier}`,
      });
    }
  } catch (error) {
    return openCodeSdkAlignmentResult(openCodeSdkUnavailable(error) ? "unavailable" : "failed", initial, {
      target_version: hostVersion,
      error: (error.stderr || error.message || "plugin SDK registry lookup failed").toString().trim(),
    });
  }

  const installInvocation = openCodeNpmInvocation([
    "install",
    "--silent",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    "--save-prod",
    "--save-exact",
    packageSpecifier,
  ]);
  let installError = null;
  try {
    run(installInvocation.executable, installInvocation.args, {
      cwd: configDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 60000,
    });
  } catch (error) {
    installError = error;
  }

  const observed = evaluateOpenCodeHostSdk(configDir, dependencies);
  const verified = observed.plugin_sdk.installed_version === hostVersion
    && observed.experimental_hooks.aggregate === "declared_supported";
  if (installError) {
    return openCodeSdkAlignmentResult("failed", initial, {
      attempted: true,
      target_version: hostVersion,
      installed_version: observed.plugin_sdk.installed_version || null,
      error: (installError.stderr || installError.message || "plugin SDK installation failed").toString().trim(),
    });
  }
  if (!verified) {
    return openCodeSdkAlignmentResult("verification_failed", initial, {
      attempted: true,
      target_version: hostVersion,
      installed_version: observed.plugin_sdk.installed_version || null,
      error: observed.plugin_sdk.installed_version !== hostVersion
        ? `Observed plugin SDK ${observed.plugin_sdk.installed_version || "unknown"} after targeting ${hostVersion}.`
        : `Plugin SDK ${hostVersion} does not declare all required experimental hooks.`,
    });
  }
  return openCodeSdkAlignmentResult("aligned", initial, {
    attempted: true,
    target_version: hostVersion,
    installed_version: observed.plugin_sdk.installed_version,
  });
}

function openCodePackageVersionStatus(packageState) {
  if (!packageState.loadable) return "unloadable";
  if (!packageState.installed_version) return "unknown";
  return packageState.installed_version === pluginDefinition.version ? "current" : "outdated";
}

function openCodePackageTransition(previousPackage, installedPackage) {
  const previousVersion = previousPackage.loadable ? previousPackage.installed_version : "";
  const installedVersion = installedPackage.loadable ? installedPackage.installed_version : "";
  if (!installedVersion || (previousPackage.loadable && !previousVersion)) {
    return {
      previous_version: previousVersion,
      installed_version: installedVersion,
      status: "unknown",
    };
  }
  if (!previousPackage.loadable) {
    return {
      previous_version: "",
      installed_version: installedVersion,
      status: "installed",
    };
  }
  return {
    previous_version: previousVersion,
    installed_version: installedVersion,
    status: previousVersion === installedVersion ? "unchanged" : "updated",
  };
}

function evaluateGlobalOpenCodeSurface(configDir) {
  const paths = globalOpenCodeConfigPaths(configDir);
  const skillCount = globalOpenCodeSkillNames.filter((skillName) => existsSync(join(paths.skills, skillName, "SKILL.md"))).length;
  const contractCount = contractModules.filter((moduleName) => existsSync(join(paths.contracts, moduleName))).length;
  const validatorResolution = resolveLocalValidator({
    ownedPackageRoot: join(configDir, "node_modules", pluginDefinition.opencode.npmPackage),
    runtimeRoot: join(configDir, "agdf"),
    expectedVersion: pluginDefinition.version,
    surface: "opencode",
  });
  return {
    path: paths.skills,
    instructions: paths.instructions,
    runtime_contract: paths.runtimeContract,
    router: {
      path: paths.router,
      present: existsSync(paths.router),
      loading: "on_demand",
    },
    contracts: paths.contracts,
    expected_skill_count: globalOpenCodeSkillNames.length,
    skill_count: skillCount,
    expected_contract_count: contractModules.length,
    contract_count: contractCount,
    local_validator: {
      path: paths.localValidator,
      present: existsSync(paths.localValidator),
      ...validatorResolution.envelope,
    },
    evaluator_agent: {
      name: pluginDefinition.opencode.evaluatorAgentName,
      path: paths.evaluatorAgent,
      present: existsSync(paths.evaluatorAgent),
    },
    present: existsSync(paths.skills),
    complete: existsSync(paths.instructions)
      && existsSync(paths.router)
      && existsSync(paths.runtimeContract)
      && contractCount === contractModules.length
      && skillCount === openCodeSkillNames.length
      && existsSync(paths.localValidator)
      && existsSync(paths.evaluatorAgent)
      && globalOpenCodeValidatorPackageIsValid(paths.localValidatorPackage)
      && validatorResolution.envelope.machine_validation === "owned_version_matched",
  };
}

export function evaluateOpenCodeGlobalStatus(configDir = defaultOpenCodeConfigDir(), dependencies = {}) {
  const configPath = join(configDir, "opencode.json");
  const configState = (dependencies.readOpenCodeConfig ?? readOpenCodeConfig)(configPath);
  const plugins = Array.isArray(configState.config.plugin) ? configState.config.plugin : [];
  const globalConfigured = plugins.includes(openCodePluginEntrypoint);
  const legacyPluginConfigured = plugins.some((entry) => entry === pluginDefinition.opencode.npmPackage || entry.startsWith(`${pluginDefinition.opencode.npmPackage}@`));
  const packageState = (dependencies.resolveOpenCodePackage ?? resolveOpenCodePackage)(configDir, dependencies);
  const packageVersionStatus = openCodePackageVersionStatus(packageState);
  const globalNativeSurface = (dependencies.evaluateGlobalOpenCodeSurface ?? evaluateGlobalOpenCodeSurface)(configDir, dependencies);
  const hostSdk = (dependencies.evaluateOpenCodeHostSdk ?? evaluateOpenCodeHostSdk)(configDir, dependencies);

  const findings = [];
  if (!configState.exists) findings.push("OpenCode global config not found.");
  if (configState.parseError) findings.push(`OpenCode global config is not valid JSON: ${configState.parseError}`);
  if (!globalConfigured) findings.push(legacyPluginConfigured
    ? `OpenCode global config still uses the host-managed npm cache entry for ${pluginDefinition.opencode.npmPackage}; rerun installation to bind the verified local package entrypoint.`
    : `OpenCode global config does not include ${openCodePluginEntrypoint}.`);
  if (!packageState.loadable) findings.push(`${pluginDefinition.opencode.npmPackage} is not loadable from the OpenCode config directory.`);
  if (packageVersionStatus === "outdated") findings.push(`${pluginDefinition.opencode.npmPackage} version ${packageState.installed_version} is outdated; expected ${pluginDefinition.version}.`);
  if (packageVersionStatus === "unknown" && packageState.loadable) findings.push(`${pluginDefinition.opencode.npmPackage} is loadable but its installed version is unknown.`);
  if (!globalNativeSurface.complete) {
    findings.push(
      `Global OpenCode native surface is incomplete (${globalNativeSurface.skill_count}/${globalNativeSurface.expected_skill_count} skills; ${globalNativeSurface.contract_count}/${globalNativeSurface.expected_contract_count} contract modules).`,
    );
  }
  if (hostSdk.experimental_hooks.aggregate === "uninspectable") findings.push("Installed OpenCode plugin SDK hook declarations could not be inspected.");
  if (hostSdk.experimental_hooks.aggregate === "degraded") findings.push("Installed OpenCode plugin SDK is missing one or more required experimental hook declarations.");
  if (hostSdk.host_sdk_version.status === "divergent") {
    findings.push(`OpenCode host ${hostSdk.host_sdk_version.host_version} and plugin SDK ${hostSdk.host_sdk_version.sdk_version} diverge; policy is warning-only.`);
  }

  return {
    schema_version: "1",
    status: globalConfigured && packageState.loadable ? "configured" : "not_configured",
    global_config: {
      path: configPath,
      exists: configState.exists,
      parse_error: configState.parseError,
      plugin_configured: globalConfigured,
      plugin_entrypoint: openCodePluginEntrypoint,
      legacy_plugin_configured: legacyPluginConfigured,
    },
    package: {
      name: pluginDefinition.opencode.npmPackage,
      loadable: packageState.loadable,
      resolved_path: packageState.path,
      installed_version: packageState.installed_version || null,
      expected_version: pluginDefinition.version,
      version_status: packageVersionStatus,
      error: packageState.error,
    },
    ...hostSdk,
    global_native_surface: globalNativeSurface,
    findings,
    next_step: packageVersionStatus !== "current"
      ? "Run npx --yes @agdf/cli@latest opencode to install or repair the OpenCode package version."
      : !globalNativeSurface.complete
      ? "Run npx --yes @agdf/cli@latest opencode to install or repair the global native OpenCode skill surface."
      : hostSdk.experimental_hooks.aggregate === "uninspectable"
      ? "Repair the installed OpenCode plugin SDK so its declarations can be inspected; do not assume dynamic hook support."
      : hostSdk.experimental_hooks.aggregate === "degraded"
      ? "Use static AGDF instructions and review OpenCode compatibility before relying on dynamic hook injection."
      : hostSdk.host_sdk_version.status === "divergent"
      ? "Run npx --yes @agdf/cli@latest opencode to align the plugin SDK to the exact OpenCode host version; status itself remains read-only."
      : "Global OpenCode installation is current; a repository target is not required for global status or lifecycle operations.",
  };
}

export function evaluateOpenCodeStatus(targetDir, configDir = defaultOpenCodeConfigDir(), transition = null, dependencies = {}) {
  const globalStatus = evaluateOpenCodeGlobalStatus(configDir, dependencies);
  const sessionSignals = {
    active: process.env.AGDF_PLUGIN_ACTIVE === "1",
    version: process.env.AGDF_PLUGIN_VERSION || "",
    control_dir: process.env.AGDF_CONTROL_DIR || "",
    repository_surface: process.env.AGDF_OPENCODE_REPOSITORY_SURFACE === "1",
    repository_activation: process.env.AGDF_OPENCODE_REPOSITORY_ACTIVATION || "",
  };
  const repositoryActivation = (dependencies.evaluateOpenCodeRepositoryActivation ?? evaluateOpenCodeRepositoryActivation)(targetDir);
  const gateCheckSkillPath = join(targetDir, ".opencode", "skills", `${pluginDefinition.opencode.skillPrefix}gate-check`, "SKILL.md");
  const findings = [...globalStatus.findings];
  if (!sessionSignals.active) findings.push("No active AGDF OpenCode session signal is visible in this process.");
  if (!repositoryActivation.active) {
    findings.push(repositoryActivation.state === "invalid_control"
      ? "Current repository has invalid AGDF durable control configuration."
      : "Current repository does not contain valid AGDF durable control configuration.");
  }

  return {
    ...globalStatus,
    package: {
      ...globalStatus.package,
      ...(transition ? { transition } : {}),
    },
    session: sessionSignals,
    repository_activation: repositoryActivation.state,
    repository_control: {
      path: repositoryActivation.config_path,
      diagnostic: repositoryActivation.diagnostic,
      ...(repositoryActivation.error ? { error: repositoryActivation.error } : {}),
    },
    repository_surface: {
      path: targetDir,
      present: repositoryActivation.active,
      legacy_present: repositoryActivation.legacy_surface,
      instructions: join(targetDir, ".opencode", pluginDefinition.opencode.instructionsFileName),
      gate_check_agent: gateCheckSkillPath,
      gate_check_skill: gateCheckSkillPath,
    },
    visible_entrypoint: repositoryActivation.active ? `${pluginDefinition.opencode.globalSkillPrefix}gate-check (native skill)` : "none until durable AGDF control is configured for this repository",
    findings,
    next_step: globalStatus.package.version_status !== "current" || !globalStatus.global_native_surface.complete
      || globalStatus.experimental_hooks.aggregate !== "declared_supported"
      || globalStatus.host_sdk_version.status === "divergent"
      ? globalStatus.next_step
      : repositoryActivation.state === "invalid_control"
      ? "Repair .agdf/control/config.json so it contains valid artifact_language, chat_language and runtime_language values."
      : repositoryActivation.active
      ? `Restart OpenCode if needed, then load ${pluginDefinition.opencode.globalSkillPrefix}gate-check through the native skill tool for new build/change intent.`
      : "Run npx --yes @agdf/cli@latest opencode-repo in repositories where AGDF governance should be active and reviewable.",
  };
}

export function printOpenCodeStatus(report, json, io = console) {
  if (json) {
    io.log(JSON.stringify(report, null, 2));
    return;
  }

  io.log("AGDF OpenCode status");
  if (report.operation_status) {
    io.log(`Operation: ${report.operation_status.operation_id}`);
    io.log(`Outcome: ${report.operation_status.outcome}`);
    io.log(`Target: ${report.operation_status.target ?? "global"}`);
    io.log(`Authorizes: ${report.operation_status.authorizes ? "yes" : "no"}`);
  }
  io.log(`Status: ${report.status}`);
  if (report.installation_status) io.log(`Installation health: ${report.installation_status}`);
  io.log(`Global config: ${report.global_config.plugin_configured ? "configured" : "missing"} (${report.global_config.path})`);
  if (report.global_config.parse_error) io.log(`Config parse error: ${report.global_config.parse_error}`);
  io.log(`Package loadable: ${report.package.loadable ? "yes" : "no"}`);
  if (report.package.resolved_path) io.log(`Package path: ${report.package.resolved_path}`);
  io.log(`Package version: ${report.package.installed_version || "unknown"}`);
  io.log(`Expected version: ${report.package.expected_version}`);
  io.log(`Version status: ${report.package.version_status}`);
  io.log(`OpenCode host version: ${report.host.installed_version || "unknown"}`);
  io.log(`Plugin SDK version: ${report.plugin_sdk.installed_version || "unknown"}`);
  io.log(`Host/SDK version: ${report.host_sdk_version.status} (${report.host_sdk_version.policy})`);
  io.log(`Experimental hook declarations: ${report.experimental_hooks.aggregate} (${report.experimental_hooks.evidence_level}; live invocation not observed)`);
  for (const hook of report.experimental_hooks.hooks) io.log(`- ${hook.name}: ${hook.state}`);
  if (report.package.transition?.status === "updated") {
    io.log(`Version transition: ${report.package.transition.previous_version} -> ${report.package.transition.installed_version}`);
  } else if (report.package.transition?.status === "installed") {
    io.log(`Version transition: new install (${report.package.transition.installed_version || "unknown"})`);
  } else if (report.package.transition?.status === "unchanged") {
    io.log(`Version transition: unchanged (${report.package.transition.installed_version})`);
  } else if (report.package.transition?.status === "unknown") {
    io.log("Version transition: unknown");
  }
  io.log(`Global native skills: ${report.global_native_surface.complete ? "complete" : "incomplete"} (${report.global_native_surface.skill_count}/${report.global_native_surface.expected_skill_count})`);
  io.log(`Global skill path: ${report.global_native_surface.path}`);
  if (report.session) {
    io.log(`Session active signal: ${report.session.active ? "yes" : "no"}`);
    if (report.session.version) io.log(`Session plugin version: ${report.session.version}`);
    if (report.session.control_dir) io.log(`Session control dir: ${report.session.control_dir}`);
    io.log(`Repository activation: ${report.repository_activation}`);
    io.log(`Repository control: ${report.repository_control.path} (${report.repository_control.diagnostic})`);
    io.log(`Legacy repository surface: ${report.repository_surface.legacy_present ? "present" : "absent"}`);
    io.log(`Visible entrypoint: ${report.visible_entrypoint}`);
  }
  io.log(`Next step: ${report.next_step}`);

  if (report.findings.length > 0) {
    io.log("");
    io.log("Findings:");
    for (const finding of report.findings) io.log(`- ${finding}`);
  }
}

export function planOpenCodeGlobalUninstall(configDir) {
  const surface = "opencode";
    if (!configDir) throw new Error("OpenCode uninstall requires its explicit config directory.");
    const configPath = join(configDir, "opencode.json");
    if (!existsSync(configPath)) throw new Error(`OpenCode config not found: ${configPath}`);
    let config;
    try {
      config = JSON.parse(readFileSync(configPath, "utf8"));
    } catch {
      throw new Error(`Refusing to modify unreadable OpenCode config: ${configPath}`);
    }
    if (config.plugin !== undefined && !Array.isArray(config.plugin)) {
      throw new Error(`Refusing to modify OpenCode config with non-array plugin field: ${configPath}`);
    }
    const next = { ...config };
    next.plugin = (config.plugin ?? []).filter((entry) => !isOwnedOpenCodePluginEntry(entry));
    if (Array.isArray(config.instructions)) next.instructions = config.instructions.filter((entry) => entry !== "AGDF.md");
    const npm = openCodeNpmInvocation(["uninstall", "--silent", pluginDefinition.opencode.npmPackage]);
    const mutations = [
      { kind: "write", path: configPath, content: `${JSON.stringify(next, null, 2)}\n`, ownership: "exact_known_entries" },
      { kind: "command", executable: npm.executable, args: npm.args, cwd: configDir },
    ];
    const retained = ["repository AGDF files", ".agdf/control"];
    for (const candidate of openCodeOwnedGlobalFiles(configDir)) {
      if (!existsSync(candidate.path)) continue;
      const content = readFileSync(candidate.path, "utf8");
      if (candidate.owned(content)) mutations.push({ kind: "remove", path: candidate.path, ownership: "agdf_marker" });
      else retained.push(candidate.path);
    }
    return Object.freeze({
      operation: "uninstall",
      surface,
      scope: "global",
      mutations: Object.freeze(mutations),
      retained: Object.freeze(retained),
      expected: Object.freeze({ installation_status: "not_installed" }),
    });
}
function openCodeOwnedGlobalFiles(configDir) {
  const firstLine = (marker) => (content) => content.split(/\r?\n/)[0] === marker;
  const afterFrontmatter = (marker) => (content) => {
    const lines = content.split(/\r?\n/);
    const end = lines.findIndex((line, index) => index > 0 && line === "---");
    return end >= 0 && lines[end + 1] === marker;
  };
  const ownedValidatorPackage = (content) => {
    try {
      const manifest = JSON.parse(content);
      return manifest?.agdf?.owner === "create-agdf"
        && manifest?.agdf?.surface === "opencode-global-validator";
    } catch {
      return false;
    }
  };
  const files = [
    { path: join(configDir, pluginDefinition.opencode.instructionsFileName), owned: firstLine("<!-- AGDF-GLOBAL-INSTRUCTIONS -->") },
    { path: join(configDir, pluginDefinition.opencode.runtimeContractFileName), owned: firstLine("<!-- AGDF-GLOBAL-RUNTIME-CONTRACT -->") },
    { path: join(configDir, "agdf", "bin", "agdf-local.js"), owned: firstLine("// AGDF-GLOBAL-LOCAL-VALIDATOR") },
    { path: join(configDir, "agdf", "package.json"), owned: ownedValidatorPackage },
    {
      path: join(configDir, "agents", `${pluginDefinition.opencode.evaluatorAgentName}.md`),
      owned: afterFrontmatter(`<!-- AGDF-GLOBAL-AGENT: ${pluginDefinition.opencode.evaluatorAgentName} -->`),
    },
  ];
  for (const modulePath of pluginDefinition.runtimeContract.modules) {
    const prefix = "meta/contracts/";
    if (!modulePath.startsWith(prefix) || modulePath.slice(prefix.length).includes("/")) {
      throw new Error(`Invalid definition-owned runtime contract module path: ${modulePath}`);
    }
    const moduleName = modulePath.slice(prefix.length);
    files.push({ path: join(configDir, "contracts", moduleName), owned: firstLine("<!-- AGDF-GLOBAL-RUNTIME-CONTRACT -->") });
  }
  for (const skill of pluginDefinition.skillSet) {
    const name = `${pluginDefinition.opencode.globalSkillPrefix}${skill.slug}`;
    const marker = `<!-- AGDF-GLOBAL-SKILL: ${name} -->`;
    files.push({ path: join(configDir, "skills", name, "SKILL.md"), owned: afterFrontmatter(marker) });
  }
  return files;
}

function isOwnedOpenCodePluginEntry(entry) {
  return typeof entry === "string"
    && (entry === openCodePluginEntrypoint
      || entry === pluginDefinition.opencode.npmPackage
      || entry.startsWith(`${pluginDefinition.opencode.npmPackage}@`));
}

export function verifyOpenCodeGlobalUninstall(plan, configDir, evaluate = evaluateOpenCodeGlobalStatus) {
    const report = evaluate(configDir);
    const remainingOwnedFiles = plan.mutations
      .filter((mutation) => mutation.kind === "remove")
      .map((mutation) => mutation.path)
      .filter((path) => existsSync(path));
    const configClean = report.global_config?.plugin_configured === false
      && report.global_config?.legacy_plugin_configured === false;
    const packageRemoved = report.package?.loadable === false;
    const statusClean = report.status === "not_configured";
    const evidence = [
      report.global_config?.path || join(configDir, "opencode.json"),
      ...(configClean ? [] : ["postcondition_failed:agdf_plugin_entry_still_configured_or_uninspectable"]),
      ...(packageRemoved ? [] : ["postcondition_failed:create-agdf_package_still_loadable_or_uninspectable"]),
      ...(statusClean ? [] : [`postcondition_failed:observed_status:${report.status || "unknown"}`]),
      ...remainingOwnedFiles.map((path) => `still_present:${path}`),
    ];
    return statusClean && configClean && packageRemoved && remainingOwnedFiles.length === 0
      ? { status: "healthy", evidence: [...evidence, "marker_owned_global_files_removed"] }
      : { status: "failed", evidence };
}

export const bootstrapCommands = () => ({ install: "npx --yes @agdf/cli@latest opencode", repository: "npx --yes @agdf/cli@latest opencode-repo" });
