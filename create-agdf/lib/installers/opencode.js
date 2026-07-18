import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
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

  if (nextConfig.permission === undefined) {
    nextConfig.permission = { question: "allow", skill: { "agdf-*": "allow" } };
  } else if (nextConfig.permission && typeof nextConfig.permission === "object" && !Array.isArray(nextConfig.permission)) {
    nextConfig.permission = { ...nextConfig.permission };
    if (nextConfig.permission.question === undefined) nextConfig.permission.question = "allow";
    if (nextConfig.permission.skill === undefined) {
      nextConfig.permission.skill = { "agdf-*": "allow" };
    } else if (nextConfig.permission.skill && typeof nextConfig.permission.skill === "object" && !Array.isArray(nextConfig.permission.skill)) {
      nextConfig.permission.skill = { ...nextConfig.permission.skill };
      if (nextConfig.permission.skill["agdf-*"] === undefined) nextConfig.permission.skill["agdf-*"] = "allow";
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
  };
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

  writeOwnedGlobalOpenCodeFile(paths.instructions, globalInstructions, globalOpenCodeInstructionsOwnershipMarker, "first-line");
  writeOwnedGlobalOpenCodeFile(paths.runtimeContract, globalRuntimeContract, globalOpenCodeRuntimeContractOwnershipMarker, "first-line");
  writeOwnedGlobalOpenCodeFile(paths.localValidator, localValidator, globalOpenCodeValidatorOwnershipMarker, "first-line");
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

function resolveOpenCodePackage(configDir) {
  const packageName = pluginDefinition.opencode.npmPackage;
  try {
    const resolvedPath = execFileSync(process.execPath, ["-e", `process.stdout.write(require.resolve(${JSON.stringify(packageName)}))`], {
      cwd: configDir,
      encoding: "utf8",
      stdio: "pipe",
    });
    let installedVersion = "";
    try {
      const packageManifest = JSON.parse(readFileSync(join(dirname(resolvedPath), "package.json"), "utf8"));
      installedVersion = typeof packageManifest.version === "string" && packageManifest.version.trim() ? packageManifest.version.trim() : "";
    } catch {
      installedVersion = "";
    }
    return {
      loadable: true,
      path: resolvedPath,
      installed_version: installedVersion,
      error: "",
    };
  } catch (error) {
    return {
      loadable: false,
      path: "",
      installed_version: "",
      error: (error.stderr || error.message || "package not resolvable").toString().trim(),
    };
  }
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
    present: existsSync(paths.skills),
    complete: existsSync(paths.instructions)
      && existsSync(paths.runtimeContract)
      && contractCount === contractModules.length
      && skillCount === openCodeSkillNames.length
      && existsSync(paths.localValidator)
      && validatorResolution.envelope.machine_validation === "owned_version_matched",
  };
}

export function evaluateOpenCodeStatus(targetDir, configDir = defaultOpenCodeConfigDir(), transition = null) {
  const configPath = join(configDir, "opencode.json");
  const configState = readOpenCodeConfig(configPath);
  const plugins = Array.isArray(configState.config.plugin) ? configState.config.plugin : [];
  const globalConfigured = plugins.includes(pluginDefinition.opencode.npmPackage);
  const packageState = resolveOpenCodePackage(configDir);
  const packageVersionStatus = openCodePackageVersionStatus(packageState);
  const globalNativeSurface = evaluateGlobalOpenCodeSurface(configDir);
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
