import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { generatedRoot, pluginDefinition } from "../cli/runtime-context.js";
import { evaluateOpenCodeRepositoryActivation } from "./opencode-activation.js";
import { resolveLocalValidator } from "../runtime/local-validator.js";

const contractModules = ["gate-transition.md", "interaction.md", "modes.md", "quality.md", "context-graph.md", "control-scaffold.md", "closeout.md"];
const openCodeSkillNames = pluginDefinition.skillSet.map((skill) => pluginDefinition.opencode.skillPrefix + skill.slug);
const globalOpenCodeSkillNames = pluginDefinition.skillSet.map((skill) => pluginDefinition.opencode.globalSkillPrefix + skill.slug);
const globalOpenCodeSkillOwnershipMarker = "<!-- AGDF-GLOBAL-SKILL: ";
const globalOpenCodeInstructionsOwnershipMarker = "<!-- AGDF-GLOBAL-INSTRUCTIONS -->";
const globalOpenCodeRuntimeContractOwnershipMarker = "<!-- AGDF-GLOBAL-RUNTIME-CONTRACT -->";
const globalOpenCodeValidatorOwnershipMarker = "// AGDF-GLOBAL-LOCAL-VALIDATOR";
const globalOpenCodeAgentOwnershipMarker = `<!-- AGDF-GLOBAL-AGENT: ${pluginDefinition.opencode.evaluatorAgentName} -->`;
const globalOpenCodeValidatorPackageOwner = "create-agdf";
const testNpmCliPath = process.env.NODE_ENV === "test" ? process.env.AGDF_TEST_NPM_CLI_PATH || "" : "";
const npmCommand = testNpmCliPath ? process.execPath : process.platform === "win32" ? process.execPath : "npm";
const npmPrefixArgs = testNpmCliPath ? [testNpmCliPath] : process.platform === "win32" ? [join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")] : [];

export function openCodeNpmInvocation(args) {
  return { executable: npmCommand, args: [...npmPrefixArgs, ...args] };
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

export function installOpenCodeGlobalPlugin(configDir) {
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

  const plugins = [...(config.plugin ?? [])];
  const alreadyInstalled = plugins.includes(pluginDefinition.opencode.npmPackage);
  if (!alreadyInstalled) {
    plugins.push(pluginDefinition.opencode.npmPackage);
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
  try {
    const packageSpecifier = `${pluginDefinition.opencode.npmPackage}@${pluginDefinition.version}`;
    const invocation = openCodeNpmInvocation(["install", "--silent", "--save-prod", "--save-exact", packageSpecifier]);
    execFileSync(invocation.executable, invocation.args, {
      cwd: configDir,
      stdio: "pipe",
    });
  } catch (error) {
    throw openCodeLifecycleError("plugin_operation", `Failed to install ${pluginDefinition.opencode.npmPackage} into the OpenCode config directory: ${(error.stderr || error.message).toString().trim()}`, {
      executable: npmCommand,
      args: [...npmPrefixArgs, "install"],
    });
  }
  try {
    writeFileSync(configPath, `${JSON.stringify(nextConfig, null, 2)}\n`, "utf8");
  } catch (error) {
    throw openCodeLifecycleError("configuration", `Failed to write OpenCode config ${configPath}: ${error.message}`, { configPath });
  }
  const installedPackage = resolveOpenCodePackage(configDir);

  return {
    configPath,
    added: !alreadyInstalled,
    transition: openCodePackageTransition(previousPackage, installedPackage),
  };
}

function globalOpenCodeConfigPaths(configDir) {
  return {
    instructions: join(configDir, pluginDefinition.opencode.instructionsFileName),
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

function globalOpenCodeBoundary() {
  return [
    "## Global OpenCode Surface Boundary",
    "",
    "This skill is globally discoverable, but global plugin or skill presence is not repository governance activation.",
    "Before applying AGDF gates, later artefacts or implementation guidance, inspect the current repository for valid `.agdf/control/config.json` durable control.",
    "If durable control is missing or invalid, stop and direct the user to `npx --yes @agdf/cli@latest opencode-repo` in this repository.",
    "When durable control is valid, use the global `agdf-global-*` skill surface; existing local OpenCode assets remain a compatibility path.",
    "Only exact `Approval: <GateName>` values can advance AGDF gates; host permissions and plugin hooks never grant delivery authority.",
    "Resolve and use the installed version-matched `agdf/bin/agdf-local.js` validator for deterministic checks.",
    "If activation, approval, evidence or validator ownership is missing or unclear, stop before later artefacts or implementation.",
    "Use `opencode-status --json` to inspect installed hook declarations, version divergence and evaluator availability without treating SDK declarations as live hook execution proof.",
    "",
  ].join("\n");
}

function globalOpenCodeActivationGuard() {
  return [
    "## Repository Activation Guard",
    "",
    "Apply AGDF governance only when this repository has valid `.agdf/control/config.json` durable control.",
    "If it is missing or invalid, stop and direct the user to `npx --yes @agdf/cli@latest opencode-repo`; the global installation alone is not activation.",
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

export function installOpenCodeGlobalSurface(configDir) {
  assertGlobalOpenCodeSurfaceWritable(configDir);
  const paths = globalOpenCodeConfigPaths(configDir);
  const generatedOpenCodeRoot = join(generatedRoot, ".opencode");
  const generatedInstructions = readFileSync(join(generatedOpenCodeRoot, pluginDefinition.opencode.instructionsFileName), "utf8");
  const generatedRuntimeContract = readFileSync(join(generatedOpenCodeRoot, pluginDefinition.opencode.runtimeContractFileName), "utf8");
  const globalInstructions = [
    globalOpenCodeInstructionsOwnershipMarker,
    "# AGDF Global OpenCode instructions",
    "",
    "AGDF native skills are globally discoverable through OpenCode.",
    "",
    globalOpenCodeBoundary(),
    "Valid `.agdf/control/` is the repository source of truth for active governance; legacy `.opencode/` assets remain supported without being required.",
    "",
    toGlobalOpenCodeContent(generatedInstructions),
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
    const content = toGlobalOpenCodeContent(sourceContent).replace(/^(---[\s\S]*?\n---\n)/, `$1${marker}\n\n${globalOpenCodeActivationGuard()}`);
    writeOwnedGlobalOpenCodeFile(join(paths.skills, skillName, "SKILL.md"), content, marker, "after-frontmatter");
  }

  return {
    instructions: paths.instructions,
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

function resolveOpenCodePackage(configDir) {
  return resolveOpenCodeInstalledPackage(configDir, pluginDefinition.opencode.npmPackage);
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
      && existsSync(paths.runtimeContract)
      && contractCount === contractModules.length
      && skillCount === openCodeSkillNames.length
      && existsSync(paths.localValidator)
      && existsSync(paths.evaluatorAgent)
      && globalOpenCodeValidatorPackageIsValid(paths.localValidatorPackage)
      && validatorResolution.envelope.machine_validation === "owned_version_matched",
  };
}

export function evaluateOpenCodeStatus(targetDir, configDir = defaultOpenCodeConfigDir(), transition = null, dependencies = {}) {
  const configPath = join(configDir, "opencode.json");
  const configState = readOpenCodeConfig(configPath);
  const plugins = Array.isArray(configState.config.plugin) ? configState.config.plugin : [];
  const globalConfigured = plugins.includes(pluginDefinition.opencode.npmPackage);
  const packageState = resolveOpenCodePackage(configDir);
  const packageVersionStatus = openCodePackageVersionStatus(packageState);
  const globalNativeSurface = evaluateGlobalOpenCodeSurface(configDir);
  const hostSdk = evaluateOpenCodeHostSdk(configDir, dependencies);
  const sessionSignals = {
    active: process.env.AGDF_PLUGIN_ACTIVE === "1",
    version: process.env.AGDF_PLUGIN_VERSION || "",
    control_dir: process.env.AGDF_CONTROL_DIR || "",
    repository_surface: process.env.AGDF_OPENCODE_REPOSITORY_SURFACE === "1",
    repository_activation: process.env.AGDF_OPENCODE_REPOSITORY_ACTIVATION || "",
  };
  const repositoryActivation = evaluateOpenCodeRepositoryActivation(targetDir);
  const gateCheckSkillPath = join(targetDir, ".opencode", "skills", `${pluginDefinition.opencode.skillPrefix}gate-check`, "SKILL.md");

  const findings = [];
  if (!configState.exists) findings.push("OpenCode global config not found.");
  if (configState.parseError) findings.push(`OpenCode global config is not valid JSON: ${configState.parseError}`);
  if (!globalConfigured) findings.push(`OpenCode global config does not include ${pluginDefinition.opencode.npmPackage}.`);
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
  if (!sessionSignals.active) findings.push("No active AGDF OpenCode session signal is visible in this process.");
  if (!repositoryActivation.active) {
    findings.push(repositoryActivation.state === "invalid_control"
      ? "Current repository has invalid AGDF durable control configuration."
      : "Current repository does not contain valid AGDF durable control configuration.");
  }

  return {
    schema_version: "1",
    status: globalConfigured && packageState.loadable ? "configured" : "not_configured",
    global_config: {
      path: configPath,
      exists: configState.exists,
      parse_error: configState.parseError,
      plugin_configured: globalConfigured,
    },
    package: {
      name: pluginDefinition.opencode.npmPackage,
      loadable: packageState.loadable,
      resolved_path: packageState.path,
      installed_version: packageState.installed_version || null,
      expected_version: pluginDefinition.version,
      version_status: packageVersionStatus,
      ...(transition ? { transition } : {}),
      error: packageState.error,
    },
    ...hostSdk,
    global_native_surface: globalNativeSurface,
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
    next_step: packageVersionStatus !== "current"
      ? "Run npx --yes @agdf/cli@latest opencode to install or repair the OpenCode package version."
      : !globalNativeSurface.complete
      ? "Run npx --yes @agdf/cli@latest opencode to install or repair the global native OpenCode skill surface."
      : hostSdk.experimental_hooks.aggregate === "uninspectable"
      ? "Repair the installed OpenCode plugin SDK so its declarations can be inspected; do not assume dynamic hook support."
      : hostSdk.experimental_hooks.aggregate === "degraded"
      ? "Use static AGDF instructions and review OpenCode compatibility before relying on dynamic hook injection."
      : hostSdk.host_sdk_version.status === "divergent"
      ? "Review OpenCode host/plugin-SDK compatibility; AGDF reports this divergence but does not align versions automatically."
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
  io.log(`Status: ${report.status}`);
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
  io.log(`Session active signal: ${report.session.active ? "yes" : "no"}`);
  if (report.session.version) io.log(`Session plugin version: ${report.session.version}`);
  if (report.session.control_dir) io.log(`Session control dir: ${report.session.control_dir}`);
  io.log(`Repository activation: ${report.repository_activation}`);
  io.log(`Repository control: ${report.repository_control.path} (${report.repository_control.diagnostic})`);
  io.log(`Legacy repository surface: ${report.repository_surface.legacy_present ? "present" : "absent"}`);
  io.log(`Visible entrypoint: ${report.visible_entrypoint}`);
  io.log(`Next step: ${report.next_step}`);

  if (report.findings.length > 0) {
    io.log("");
    io.log("Findings:");
    for (const finding of report.findings) io.log(`- ${finding}`);
  }
}
