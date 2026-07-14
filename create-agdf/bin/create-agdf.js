#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, posix, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { searchInputFromControl } from "../lib/delivery-path-search/state-adapter.js";
import { runDeliveryPathSearch } from "../lib/delivery-path-search/search-engine.js";
import { codexEvaluator } from "../lib/delivery-path-search/evaluators/codex.js";
import { claudeEvaluator } from "../lib/delivery-path-search/evaluators/claude.js";
import { fixtureEvaluator } from "../lib/delivery-path-search/evaluators/protocol.js";
import { codexGenerator } from "../lib/delivery-path-search/generators/codex.js";
import { claudeGenerator } from "../lib/delivery-path-search/generators/claude.js";
import { fixtureGenerator } from "../lib/delivery-path-search/generators/protocol.js";
import { enforcementForSurface } from "../lib/delivery-path-search/surfaces/capabilities.js";
import { persistSearchResult } from "../lib/delivery-path-search/persistence.js";
import {
  aggregate,
  createRun,
  resolveRuns,
  writeLegacyProjection,
  migrateLegacy,
  parseControlState,
  verifyLegacyProjection,
} from "../lib/control-state/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const generatedRoot = join(packageRoot, "generated");
const pluginDefinitionPath = join(generatedRoot, "plugins", "agdf", "meta", "agdf-plugin.definition.json");
const pluginDefinition = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));
const pluginInstallCommand = "npx --yes @agdf/cli@latest claude";
const testNpmCliPath = process.env.NODE_ENV === "test" ? process.env.AGDF_TEST_NPM_CLI_PATH || "" : "";
const npmCommand = testNpmCliPath
  ? process.execPath
  : process.platform === "win32"
    ? process.execPath
    : "npm";
const npmPrefixArgs = testNpmCliPath
  ? [testNpmCliPath]
  : process.platform === "win32"
    ? [join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")]
    : [];
const allowedTargets = new Set(["codex", "codex-repo", "claude", "copilot", "opencode", "opencode-status", "opencode-repo", "both", "init", "config", "doctor", "gate-check", "delivery-map", "delivery-path-search", "run-create", "run-migrate", "run-render-legacy"]);
const agdfFragmentPath = "AGENTS.agdf.md";
const openCodeConfigFragmentPath = "opencode.agdf.json";
const userGateOrder = ["UR", "PRD", "SD", "TP", "QA", "UAT"];
const durableGateArtefacts = new Set(["UR", "PRD", "SD", "TP", "QA"]);
const internalStepArtefacts = new Set(["Brownfield Review", "Verified Change", "Brownfield Analysis", "CD+Tests", "CR"]);
const deliveryRelationships = [
  { from: "UR", relationship: "approved_by", to: "Approval: UR", requiredBy: "UR" },
  { from: "PRD", relationship: "derived_from", to: "UR", requiredBy: "PRD" },
  { from: "SD", relationship: "derived_from", to: "PRD", requiredBy: "SD" },
  { from: "TP", relationship: "derived_from", to: "SD", requiredBy: "TP" },
  { from: "QA_REPORT", relationship: "tests", to: "TP", requiredBy: "QA" },
];
const nextSkillByGate = {
  UR: "gate-check",
  "Brownfield Review": "brownfield-analysis",
  "Mode/Slice Decision": "gate-check",
  "Quick Task Execution": "none",
  "Verified Change Execution": "gate-check",
  PRD: "gate-check",
  SD: "gate-check",
  TP: "gate-check",
  "Brownfield Analysis": "brownfield-analysis",
  "CD+Tests": "none",
  CR: "code-review",
  QA: "qa-gate",
  UAT: "delivery-closeout",
  OR: "release-or",
};
const codexSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.codex.skillPrefix}${skill.slug}`);
const copilotSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.copilot.skillPrefix}${skill.slug}`);
const openCodeSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.opencode.skillPrefix}${skill.slug}`);
const globalOpenCodeSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.opencode.globalSkillPrefix}${skill.slug}`);
const globalOpenCodeSkillOwnershipMarker = "<!-- AGDF-GLOBAL-SKILL: ";
const globalOpenCodeInstructionsOwnershipMarker = "<!-- AGDF-GLOBAL-INSTRUCTIONS -->";
const globalOpenCodeRuntimeContractOwnershipMarker = "<!-- AGDF-GLOBAL-RUNTIME-CONTRACT -->";
const codexPluginFiles = [
  join(".agents", "plugins", "marketplace.json"),
  join("plugins", "agdf", ".codex-plugin", "plugin.json"),
  join("plugins", "agdf", "control", "README.md"),
  join("plugins", "agdf", "control", "templates", "AGDF_RUN.md"),
  join("plugins", "agdf", "control", "templates", "RUN_STATE.md"),
  join("plugins", "agdf", "control", "templates", "MASTER_BACKLOG.md"),
  join("plugins", "agdf", "control", "templates", "SOT_REGISTRY.md"),
  join("plugins", "agdf", "control", "templates", "CONTEXT_GRAPH.md"),
  join("plugins", "agdf", "control", "templates", "AGENT_QUALITY_CONTRACTS.json"),
  join("plugins", "agdf", "control", "templates", "artefacts", "UR.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "VERIFIED_CHANGE.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "PRD.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "SD.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "TP.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "OR.md"),
  join("plugins", "agdf", "hooks", "hooks.json"),
  join("plugins", "agdf", "hooks", "session-start.sh"),
  join("plugins", "agdf", "meta", "agdf-agent-router.md"),
  join("plugins", "agdf", "meta", "agdf-constitution.md"),
  join("plugins", "agdf", "meta", "agdf-plugin.definition.json"),
  join("plugins", "agdf", "meta", "agdf-runtime-contract.md"),
  join("plugins", "agdf", "meta", "agdf-tenets.md"),
  ...codexSkillNames.map((skillName) => join("plugins", "agdf", "skills", skillName, "SKILL.md")),
];
const controlFiles = [
  join(".agdf", "control", "README.md"),
  join(".agdf", "control", "templates", "AGDF_RUN.md"),
  join(".agdf", "control", "templates", "RUN_STATE.md"),
  join(".agdf", "control", "templates", "MASTER_BACKLOG.md"),
  join(".agdf", "control", "templates", "SOT_REGISTRY.md"),
  join(".agdf", "control", "templates", "CONTEXT_GRAPH.md"),
  join(".agdf", "control", "templates", "AGENT_QUALITY_CONTRACTS.json"),
  join(".agdf", "control", "templates", "artefacts", "UR.md"),
  join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join(".agdf", "control", "templates", "artefacts", "VERIFIED_CHANGE.md"),
  join(".agdf", "control", "templates", "artefacts", "PRD.md"),
  join(".agdf", "control", "templates", "artefacts", "SD.md"),
  join(".agdf", "control", "templates", "artefacts", "TP.md"),
  join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join(".agdf", "control", "templates", "artefacts", "OR.md"),
];
const liveControlFiles = [
  {
    path: join(".agdf", "control", "AGDF_RUN.md"),
    source: join(".agdf", "control", "templates", "AGDF_RUN.md"),
  },
  {
    path: join(".agdf", "control", "MASTER_BACKLOG.md"),
    source: join(".agdf", "control", "templates", "MASTER_BACKLOG.md"),
  },
  {
    path: join(".agdf", "control", "SOT_REGISTRY.md"),
    source: join(".agdf", "control", "templates", "SOT_REGISTRY.md"),
  },
  {
    path: join(".agdf", "control", "CONTEXT_GRAPH.md"),
    source: join(".agdf", "control", "templates", "CONTEXT_GRAPH.md"),
  },
  {
    path: join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json"),
    source: join(".agdf", "control", "templates", "AGENT_QUALITY_CONTRACTS.json"),
  },
];
const artefactTemplateFiles = [
  join(".agdf", "control", "templates", "artefacts", "UR.md"),
  join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join(".agdf", "control", "templates", "artefacts", "VERIFIED_CHANGE.md"),
  join(".agdf", "control", "templates", "artefacts", "PRD.md"),
  join(".agdf", "control", "templates", "artefacts", "SD.md"),
  join(".agdf", "control", "templates", "artefacts", "TP.md"),
  join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join(".agdf", "control", "templates", "artefacts", "OR.md"),
];
const doctorRequiredFiles = [
  join(".agdf", "control", "AGDF_RUN.md"),
  join(".agdf", "control", "MASTER_BACKLOG.md"),
  join(".agdf", "control", "SOT_REGISTRY.md"),
  join(".agdf", "control", "CONTEXT_GRAPH.md"),
  join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json"),
];
const copilotInstructionFiles = [
  join(".github", "copilot-instructions.md"),
  join(".github", "instructions", "agdf-governance.instructions.md"),
];
const copilotSkillFiles = [
  join(".github", "skills", "README.md"),
  join(".github", "skills", pluginDefinition.copilot.runtimeContractFileName),
  ...copilotSkillNames.map((skillName) => join(".github", "skills", skillName, "SKILL.md")),
];
const openCodeFiles = [
  join(".opencode", pluginDefinition.opencode.instructionsFileName),
  join(".opencode", "README.md"),
  join(".opencode", pluginDefinition.opencode.runtimeContractFileName),
  ...openCodeSkillNames.map((skillName) => join(".opencode", "skills", skillName, "SKILL.md")),
];

function printUsage() {
  console.log(`create-agdf

Preferred AGDF CLI:
  npx --yes @agdf/cli@latest codex
  npx --yes @agdf/cli@latest codex-repo
  npx --yes @agdf/cli@latest claude
  npx --yes @agdf/cli@latest opencode
  npx --yes @agdf/cli@latest opencode-status
  npx --yes @agdf/cli@latest opencode-repo
  npx --yes @agdf/cli@latest init
  npx --yes @agdf/cli@latest doctor
  npx --yes @agdf/cli@latest gate-check --json
  npx --yes @agdf/cli@latest delivery-path-search --surface codex --json
  npx --yes @agdf/cli@latest delivery-path-search --surface claude --json
  npx --yes @agdf/cli@latest run-create --run <run_id>
  npx --yes @agdf/cli@latest run-migrate [--run <run_id>]
  npx --yes @agdf/cli@latest run-render-legacy --run <run_id>

Scaffold-compatible npm create usage:
  npm create agdf@latest -- codex
  npm create agdf@latest -- codex-repo
  npm create agdf@latest -- claude
  npm create agdf@latest -- copilot
  npm create agdf@latest -- opencode
  npm create agdf@latest -- opencode-status
  npm create agdf@latest -- opencode-repo
  npm create agdf@latest -- both
  npm create agdf@latest -- init
  npm create agdf@latest -- config --language de
  npm create agdf@latest -- doctor
  npm create agdf@latest -- gate-check
  npm create agdf@latest -- delivery-map
  npm create agdf@latest -- delivery-path-search --surface codex
  npm create agdf@latest -- delivery-path-search --surface claude

Backward-compatible create-agdf usage:
  npx --yes create-agdf@latest doctor --json
  npx --yes create-agdf@latest gate-check --json

Options:
  --dir <path>   Write files into a specific directory. With opencode, use this as the OpenCode config directory.
  --force        Overwrite existing generated files
  --language <de|en>
                 Set AGDF chat and artefact language. Defaults to detected system locale.
  --lang <de|en> Alias for --language
  --json         Print machine-readable command output as JSON
  --status-card  Print compact gate-check status-card output for interactive use
  --run <run_id> Select one canonical run
  --all-active   Evaluate every active run (doctor and delivery-map only)
  --surface <codex|claude|copilot|opencode|generic>
                 Declare the active Delivery Path Search surface
  --fixture <path>
                 Use deterministic evaluator/candidate fixtures instead of a live evaluator
  --persist      Persist the redacted Delivery Path Search result under the current scope
  --model <id>   Optional Codex evaluator model
  --generate-candidates
                 Add one bounded AI-native candidate-generation call before evaluation
  --generator-model <id>
                 Optional candidate-generator model override
  --max-generated-candidates <1-5>
  --generation-timeout-ms <1-30000>
  --generation-cost-units <1-5>
  --help         Show this help
`);
}

function normalizeLanguage(value) {
  const normalized = String(value ?? "").trim().toLowerCase().replace("_", "-");
  if (!normalized) return "";
  if (normalized.startsWith("de")) return "de";
  if (normalized.startsWith("en")) return "en";
  return "";
}

function detectSystemLocale() {
  const envLocale = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || process.env.LANGUAGE || "";
  if (envLocale) return envLocale;
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || "";
  } catch {
    return "";
  }
}

function resolveLanguagePreference(explicitLanguage) {
  const explicit = normalizeLanguage(explicitLanguage);
  if (explicit) {
    return {
      artifact_language: explicit,
      chat_language: explicit,
      runtime_language: "en",
      source: "parameter",
      detected_locale: detectSystemLocale() || "unknown",
    };
  }

  const detectedLocale = detectSystemLocale();
  const detected = normalizeLanguage(detectedLocale) || "en";
  return {
    artifact_language: detected,
    chat_language: detected,
    runtime_language: "en",
    source: detectedLocale ? "system_locale" : "default",
    detected_locale: detectedLocale || "unknown",
  };
}

function resolveConfiguredChatLanguage(targetDir) {
  const configPath = join(targetDir, ".agdf", "control", "config.json");
  if (!existsSync(configPath)) return "en";
  try {
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    return normalizeLanguage(config.chat_language) || "en";
  } catch {
    return "en";
  }
}

function languageConfigContent(languagePreference) {
  return `${JSON.stringify({
    artifact_language: languagePreference.artifact_language,
    chat_language: languagePreference.chat_language,
    runtime_language: languagePreference.runtime_language,
    source: languagePreference.source,
    detected_locale: languagePreference.detected_locale,
  }, null, 2)}\n`;
}

function parseArgs(argv) {
  const args = [...argv];
  let target;
  let dir = ".";
  let force = false;
  let json = false;
  let statusCard = false;
  let language;
  let dirExplicit = false;
  let surface = "generic";
  let fixture;
  let persist = false;
  let model;
  let generateCandidates = false;
  let generatorModel;
  let maxGeneratedCandidates = 5;
  let generationTimeoutMs = 30000;
  let generationCostUnits = 5;
  let runId;
  let allActive = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg) continue;

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--force") {
      force = true;
      continue;
    }

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--status-card") {
      statusCard = true;
      continue;
    }

    if (arg === "--persist") {
      persist = true;
      continue;
    }

    if (arg === "--generate-candidates") {
      generateCandidates = true;
      continue;
    }

    if (arg === "--all-active") {
      allActive = true;
      continue;
    }

    if (arg === "--run") {
      const next = args[i + 1];
      if (!next) {
        console.error("Missing value for --run");
        process.exit(1);
      }
      runId = next;
      i += 1;
      continue;
    }

    if (["--surface", "--fixture", "--model", "--generator-model", "--max-generated-candidates", "--generation-timeout-ms", "--generation-cost-units"].includes(arg)) {
      const next = args[i + 1];
      if (!next) {
        console.error(`Missing value for ${arg}`);
        process.exit(1);
      }
      if (arg === "--surface") {
        if (!["codex", "claude", "copilot", "opencode", "generic"].includes(next)) {
          console.error("Unsupported surface. Use codex, claude, copilot, opencode or generic.");
          process.exit(1);
        }
        surface = next;
      } else if (arg === "--fixture") fixture = next;
      else if (arg === "--model") model = next;
      else if (arg === "--generator-model") generatorModel = next;
      else {
        const value = Number(next);
        const maximum = arg === "--generation-timeout-ms" ? 30000 : 5;
        if (!Number.isInteger(value) || value < 1 || value > maximum) {
          console.error(`${arg} must be an integer from 1 to ${maximum}.`);
          process.exit(1);
        }
        if (arg === "--max-generated-candidates") maxGeneratedCandidates = value;
        else if (arg === "--generation-timeout-ms") generationTimeoutMs = value;
        else generationCostUnits = value;
      }
      i += 1;
      continue;
    }

    if (arg === "--language" || arg === "--lang") {
      const next = args[i + 1];
      if (!next) {
        console.error(`Missing value for ${arg}`);
        process.exit(1);
      }
      const normalized = normalizeLanguage(next);
      if (!normalized) {
        console.error("Unsupported language. Use --language de or --language en.");
        process.exit(1);
      }
      language = normalized;
      i += 1;
      continue;
    }

    if (arg === "--dir") {
      const next = args[i + 1];
      if (!next) {
        console.error("Missing value for --dir");
        process.exit(1);
      }
      dir = next;
      dirExplicit = true;
      i += 1;
      continue;
    }

    if (arg === "--target" || arg === "-t") {
      const next = args[i + 1];
      if (!next) {
        console.error("Missing value for --target");
        process.exit(1);
      }
      target = next;
      i += 1;
      continue;
    }

    if (!arg.startsWith("-") && !target) {
      target = arg;
      continue;
    }

    console.error(`Unknown argument: ${arg}`);
    process.exit(1);
  }

  if (!target || !allowedTargets.has(target)) {
    console.error("Please choose one target: codex, codex-repo, claude, copilot, opencode, opencode-status, opencode-repo, both, init, config, doctor, gate-check, delivery-map or delivery-path-search.");
    printUsage();
    process.exit(1);
  }

  return {
    target,
    dir: resolve(process.cwd(), dir),
    force,
    json,
    statusCard,
    dirExplicit,
    language: resolveLanguagePreference(language),
    surface,
    fixture: fixture ? resolve(process.cwd(), fixture) : null,
    persist,
    model,
    generateCandidates,
    runId,
    allActive,
    generatorModel,
    maxGeneratedCandidates,
    generationTimeoutMs,
    generationCostUnits,
  };
}

function defaultOpenCodeConfigDir() {
  return process.env.OPENCODE_CONFIG_DIR || join(homedir(), ".config", "opencode");
}

function installOpenCodeGlobalPlugin(configDir) {
  assertGlobalOpenCodeSurfaceWritable(configDir);
  const previousPackage = resolveOpenCodePackage(configDir);
  const configPath = join(configDir, "opencode.json");
  let config = {};

  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf8"));
    } catch {
      throw new Error(`Refusing to update unreadable OpenCode config: ${configPath}`);
    }
  }

  if (config.plugin !== undefined && !Array.isArray(config.plugin)) {
    throw new Error(`Refusing to update OpenCode config with non-array plugin field: ${configPath}`);
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
    throw new Error(`Refusing to update OpenCode config with non-array instructions field: ${configPath}`);
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
    execFileSync(npmCommand, [...npmPrefixArgs, "install", "--silent", "--save-prod", "--save-exact", packageSpecifier], {
      cwd: configDir,
      stdio: "pipe",
    });
  } catch (error) {
    throw new Error(`Failed to install ${pluginDefinition.opencode.npmPackage} into the OpenCode config directory: ${(error.stderr || error.message).toString().trim()}`);
  }
  writeFileSync(configPath, `${JSON.stringify(nextConfig, null, 2)}\n`, "utf8");
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
    skills: join(configDir, "skills"),
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
    "Before applying AGDF gates, later artefacts or implementation guidance, inspect the current repository for `.opencode/AGDF.md`, `.opencode/skills/agdf-gate-check/SKILL.md` and `.agdf/control/`.",
    "If the repository surface is absent, stop and direct the user to `npx --yes @agdf/cli@latest opencode-repo` in this repository.",
    "When the repository surface exists, its local instructions, native skills and `.agdf/control/` state are authoritative.",
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

function installOpenCodeGlobalSurface(configDir) {
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
    "The repository-local `.opencode/AGDF.md`, `.opencode/skills/` and `.agdf/control/` files remain the source of truth for active governance.",
    "",
    toGlobalOpenCodeContent(generatedInstructions),
  ].join("\n");
  const globalRuntimeContract = `${globalOpenCodeRuntimeContractOwnershipMarker}\n${generatedRuntimeContract}`;

  writeOwnedGlobalOpenCodeFile(paths.instructions, globalInstructions, globalOpenCodeInstructionsOwnershipMarker, "first-line");
  writeOwnedGlobalOpenCodeFile(paths.runtimeContract, globalRuntimeContract, globalOpenCodeRuntimeContractOwnershipMarker, "first-line");

  for (let index = 0; index < openCodeSkillNames.length; index += 1) {
    const sourceName = openCodeSkillNames[index];
    const skillName = globalOpenCodeSkillNames[index];
    const sourcePath = join(generatedOpenCodeRoot, "skills", sourceName, "SKILL.md");
    const sourceContent = readFileSync(sourcePath, "utf8");
    const marker = `${globalOpenCodeSkillOwnershipMarker}${skillName} -->`;
    const content = toGlobalOpenCodeContent(sourceContent).replace(/^(---[\s\S]*?\n---\n)/, `$1${marker}\n\n${globalOpenCodeBoundary()}`);
    writeOwnedGlobalOpenCodeFile(join(paths.skills, skillName, "SKILL.md"), content, marker, "after-frontmatter");
  }

  return {
    instructions: paths.instructions,
    runtimeContract: paths.runtimeContract,
    skills: paths.skills,
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

function isOpenCodeRepositorySurfacePresent(targetDir) {
  return existsSync(join(targetDir, ".opencode", pluginDefinition.opencode.instructionsFileName))
    && existsSync(join(targetDir, ".opencode", "skills", `${pluginDefinition.opencode.skillPrefix}gate-check`, "SKILL.md"));
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
  return {
    path: paths.skills,
    instructions: paths.instructions,
    runtime_contract: paths.runtimeContract,
    expected_skill_count: globalOpenCodeSkillNames.length,
    skill_count: skillCount,
    present: existsSync(paths.skills),
    complete: existsSync(paths.instructions) && existsSync(paths.runtimeContract) && skillCount === openCodeSkillNames.length,
  };
}

function evaluateOpenCodeStatus(targetDir, configDir = defaultOpenCodeConfigDir(), transition = null) {
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
  };
  const repositorySurface = isOpenCodeRepositorySurfacePresent(targetDir);
  const gateCheckSkillPath = join(targetDir, ".opencode", "skills", `${pluginDefinition.opencode.skillPrefix}gate-check`, "SKILL.md");

  const findings = [];
  if (!configState.exists) findings.push("OpenCode global config not found.");
  if (configState.parseError) findings.push(`OpenCode global config is not valid JSON: ${configState.parseError}`);
  if (!globalConfigured) findings.push(`OpenCode global config does not include ${pluginDefinition.opencode.npmPackage}.`);
  if (!packageState.loadable) findings.push(`${pluginDefinition.opencode.npmPackage} is not loadable from the OpenCode config directory.`);
  if (packageVersionStatus === "outdated") findings.push(`${pluginDefinition.opencode.npmPackage} version ${packageState.installed_version} is outdated; expected ${pluginDefinition.version}.`);
  if (packageVersionStatus === "unknown" && packageState.loadable) findings.push(`${pluginDefinition.opencode.npmPackage} is loadable but its installed version is unknown.`);
  if (!globalNativeSurface.complete) findings.push(`Global OpenCode native skill surface is incomplete (${globalNativeSurface.skill_count}/${globalNativeSurface.expected_skill_count} skills).`);
  if (!sessionSignals.active) findings.push("No active AGDF OpenCode session signal is visible in this process.");
  if (!repositorySurface) findings.push("Current repository does not contain the AGDF OpenCode surface.");

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
    repository_surface: {
      path: targetDir,
      present: repositorySurface,
      instructions: join(targetDir, ".opencode", pluginDefinition.opencode.instructionsFileName),
      gate_check_agent: gateCheckSkillPath,
      gate_check_skill: gateCheckSkillPath,
    },
    visible_entrypoint: repositorySurface ? `${pluginDefinition.opencode.skillPrefix}gate-check (native skill)` : "none until opencode-repo is installed for this repository",
    findings,
    next_step: packageVersionStatus !== "current"
      ? "Run npx --yes @agdf/cli@latest opencode to install or repair the OpenCode package version."
      : !globalNativeSurface.complete
      ? "Run npx --yes @agdf/cli@latest opencode to install or repair the global native OpenCode skill surface."
      : repositorySurface
      ? `Restart OpenCode if needed, then load ${pluginDefinition.opencode.skillPrefix}gate-check through the native skill tool for new build/change intent.`
      : "Run npx --yes @agdf/cli@latest opencode-repo in repositories where AGDF governance should be active and reviewable.",
  };
}

function printOpenCodeStatus(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log("AGDF OpenCode status");
  console.log(`Status: ${report.status}`);
  console.log(`Global config: ${report.global_config.plugin_configured ? "configured" : "missing"} (${report.global_config.path})`);
  if (report.global_config.parse_error) console.log(`Config parse error: ${report.global_config.parse_error}`);
  console.log(`Package loadable: ${report.package.loadable ? "yes" : "no"}`);
  if (report.package.resolved_path) console.log(`Package path: ${report.package.resolved_path}`);
  console.log(`Package version: ${report.package.installed_version || "unknown"}`);
  console.log(`Expected version: ${report.package.expected_version}`);
  console.log(`Version status: ${report.package.version_status}`);
  if (report.package.transition?.status === "updated") {
    console.log(`Version transition: ${report.package.transition.previous_version} -> ${report.package.transition.installed_version}`);
  } else if (report.package.transition?.status === "installed") {
    console.log(`Version transition: new install (${report.package.transition.installed_version || "unknown"})`);
  } else if (report.package.transition?.status === "unchanged") {
    console.log(`Version transition: unchanged (${report.package.transition.installed_version})`);
  } else if (report.package.transition?.status === "unknown") {
    console.log("Version transition: unknown");
  }
  console.log(`Global native skills: ${report.global_native_surface.complete ? "complete" : "incomplete"} (${report.global_native_surface.skill_count}/${report.global_native_surface.expected_skill_count})`);
  console.log(`Global skill path: ${report.global_native_surface.path}`);
  console.log(`Session active signal: ${report.session.active ? "yes" : "no"}`);
  if (report.session.version) console.log(`Session plugin version: ${report.session.version}`);
  if (report.session.control_dir) console.log(`Session control dir: ${report.session.control_dir}`);
  console.log(`Repository surface: ${report.repository_surface.present ? "present" : "missing"}`);
  console.log(`Visible entrypoint: ${report.visible_entrypoint}`);
  console.log(`Next step: ${report.next_step}`);

  if (report.findings.length > 0) {
    console.log("");
    console.log("Findings:");
    for (const finding of report.findings) console.log(`- ${finding}`);
  }
}

function installCodexGlobalPlugin() {
  const expectedVersion = pluginDefinition.version;

  try {
    execFileSync("codex", ["plugin", "marketplace", "add", "arndtgold/ai-native-governance-delivery-framework"], { stdio: "inherit" });
    execFileSync("codex", ["plugin", "marketplace", "upgrade", "agdf"], { stdio: "inherit" });
    execFileSync("codex", ["plugin", "add", "agdf", "--marketplace", "agdf"], { stdio: "inherit" });
    const listOutput = execFileSync("codex", ["plugin", "list"], { encoding: "utf8", stdio: "pipe" });
    const installedVersion = pluginVersionFromList(listOutput, "agdf@agdf");
    if (installedVersion !== expectedVersion) {
      throw new Error(versionMismatchMessage("Codex", "agdf@agdf", expectedVersion, installedVersion, "codex plugin marketplace upgrade agdf && codex plugin add agdf --marketplace agdf"));
    }
    console.log(`AGDF Codex plugin version verified: ${installedVersion}.`);
  } catch (error) {
    if (error.message?.startsWith("AGDF Codex plugin version mismatch")) throw error;
    throw new Error(`Failed to install the AGDF Codex plugin. Make sure the Codex CLI is installed and available on PATH, then rerun this command. ${commandErrorText(error)}`.trim());
  }
}

function installClaudeGlobalPlugin() {
  const expectedVersion = pluginDefinition.version;

  try {
    execFileSync("claude", ["plugin", "marketplace", "add", "arndtgold/ai-native-governance-delivery-framework"], { stdio: "inherit" });
    execFileSync("claude", ["plugin", "marketplace", "update", "agdf"], { stdio: "inherit" });
    const beforeList = execFileSync("claude", ["plugin", "list"], { encoding: "utf8", stdio: "pipe" });
    const alreadyInstalled = pluginListHasPlugin(beforeList, "agdf@agdf");
    execFileSync("claude", ["plugin", alreadyInstalled ? "update" : "install", "agdf@agdf"], { stdio: "inherit" });
    const afterList = execFileSync("claude", ["plugin", "list"], { encoding: "utf8", stdio: "pipe" });
    const installedVersion = pluginVersionFromList(afterList, "agdf@agdf");
    if (installedVersion) {
      if (installedVersion !== expectedVersion) {
        throw new Error(versionMismatchMessage("Claude Code", "agdf@agdf", expectedVersion, installedVersion, "claude plugin marketplace update agdf && claude plugin update agdf@agdf"));
      }
      console.log(`AGDF Claude Code plugin version verified: ${installedVersion}.`);
    } else {
      console.log("AGDF Claude Code plugin installed or updated. Claude Code did not expose a plugin version in `claude plugin list`; verify with `claude plugin list` after restart if needed.");
    }
  } catch (error) {
    if (error.message?.startsWith("AGDF Claude Code plugin version mismatch")) throw error;
    throw new Error(`Failed to install the AGDF Claude Code plugin. Make sure the Claude Code CLI is installed and available on PATH, then rerun this command. ${commandErrorText(error)}`.trim());
  }
}

function commandErrorText(error) {
  return (error.stderr || error.stdout || error.message || "").toString().trim();
}

function pluginListHasPlugin(output, pluginId) {
  return output
    .split(/\r?\n/)
    .some((line) => line.includes(pluginId));
}

function pluginVersionFromList(output, pluginId) {
  const escapedPluginId = pluginId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const line = output
    .split(/\r?\n/)
    .find((entry) => new RegExp(`(^|\\s)${escapedPluginId}(\\s|$)`).test(entry));
  if (!line) return "";
  const versionMatch = line.match(/\b(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)\b/);
  return versionMatch?.[1] ?? "";
}

function versionMismatchMessage(surface, pluginId, expectedVersion, installedVersion, correctiveCommand) {
  return `AGDF ${surface} plugin version mismatch for ${pluginId}: expected ${expectedVersion}, observed ${installedVersion || "unknown"}. Refresh with: ${correctiveCommand}`;
}

function loadAsset(relativePath) {
  return readFileSync(join(generatedRoot, relativePath), "utf8");
}

function writeGeneratedFile(targetDir, relativePath, content, force, allowOverwrite = false) {
  const outputPath = join(targetDir, relativePath);
  mkdirSync(dirname(outputPath), { recursive: true });

  if (existsSync(outputPath) && !force && !allowOverwrite) {
    throw new Error(`Refusing to overwrite existing file: ${relativePath}. Re-run with --force if you want to replace it.`);
  }

  writeFileSync(outputPath, content, "utf8");
}

function removeOwnedLegacyOpenCodeAgents(targetDir) {
  const agentsDir = join(targetDir, ".opencode", "agents");
  if (!existsSync(agentsDir)) return [];

  const removed = [];
  for (const skill of pluginDefinition.skillSet) {
    const skillName = `${pluginDefinition.opencode.skillPrefix}${skill.slug}`;
    const relativePath = join(".opencode", "agents", `${skillName}.md`);
    const agentPath = join(targetDir, relativePath);
    if (!existsSync(agentPath)) continue;

    const content = readFileSync(agentPath, "utf8");
    const ownedHeader = `---\ndescription: ${skill.useFor}\nmode: subagent\n---`;
    if (!content.startsWith(ownedHeader) || !content.includes(`# ${skill.slug}`)) continue;

    rmSync(agentPath);
    removed.push(relativePath);
  }

  if (readdirSync(agentsDir).length === 0) rmSync(agentsDir, { recursive: true });
  return removed;
}

function assertGeneratedWritePlan(targetDir, files, force) {
  const blocked = files.find((file) => existsSync(join(targetDir, file.path)) && !force && !file.allowOverwrite);
  if (blocked) {
    throw new Error(`Refusing to overwrite existing file: ${blocked.path}. Re-run with --force if you want to replace it.`);
  }
}

function isAgdfOwnedAgentsFile(content) {
  return content.includes("## Surface Convention")
    && content.includes("GitHub Copilot repository skills do not have a plugin namespace")
    && content.includes("AGDF is agent-native first and CLI-verifiable by design");
}

function addCopilotAgentsFile(files, targetDir, force) {
  const agentsPath = join(targetDir, "AGENTS.md");
  if (!existsSync(agentsPath) || force) {
    files.push({
      path: "AGENTS.md",
      content: loadAsset("AGENTS.md"),
    });
    return;
  }

  const existingAgents = readFileSync(agentsPath, "utf8");
  if (isAgdfOwnedAgentsFile(existingAgents)) {
    files.push({
      path: "AGENTS.md",
      content: loadAsset("AGENTS.md"),
      allowOverwrite: true,
      action: "refreshed",
    });
    return;
  }

  files.push({
    path: agdfFragmentPath,
    content: loadAsset("AGENTS.md"),
    allowOverwrite: true,
    action: "refreshed",
    preserved: "AGENTS.md",
  });
}

function shouldWriteLanguageConfig(target, targetDir, force) {
  if (force) return true;
  if ((target === "copilot" || target === "both") && existsSync(join(targetDir, ".agdf", "control", "config.json"))) return false;
  return true;
}

function addLanguageConfig(files, languagePreference) {
  files.push({
    path: join(".agdf", "control", "config.json"),
    content: languageConfigContent(languagePreference),
  });
}

function generatedFilesForTarget(target, targetDir, force, languagePreference) {
  const files = [];

  if (target === "config") {
    files.push({
      path: join(".agdf", "control", "config.json"),
      content: languageConfigContent(languagePreference),
      allowOverwrite: true,
    });
    return files;
  }

  if (target === "init") {
    addLanguageConfig(files, languagePreference);
    files.push({
      path: join(".agdf", "control", "README.md"),
      content: loadAsset(join(".agdf", "control", "README.md")),
    });

    for (const controlPath of liveControlFiles) {
      files.push({
        path: controlPath.path,
        content: loadAsset(controlPath.source),
      });
    }

    for (const templatePath of artefactTemplateFiles) {
      files.push({
        path: templatePath,
        content: loadAsset(templatePath),
      });
    }

    return files;
  }

  if (target === "codex-repo" || target === "both") {
    if (shouldWriteLanguageConfig(target, targetDir, force)) addLanguageConfig(files, languagePreference);
    for (const codexPath of codexPluginFiles) {
      files.push({
        path: codexPath,
        content: loadAsset(codexPath),
      });
    }
  }

  if (target === "copilot" || target === "both") {
    if (target !== "both" && shouldWriteLanguageConfig(target, targetDir, force)) addLanguageConfig(files, languagePreference);
    addCopilotAgentsFile(files, targetDir, force);

    for (const controlPath of controlFiles) {
      files.push({
        path: controlPath,
        content: loadAsset(controlPath),
        allowOverwrite: true,
        action: "refreshed",
      });
    }

    for (const instructionPath of copilotInstructionFiles) {
      files.push({
        path: instructionPath,
        content: loadAsset(instructionPath),
        allowOverwrite: true,
        action: "refreshed",
      });
    }

    for (const skillPath of copilotSkillFiles) {
      files.push({
        path: skillPath,
        content: loadAsset(skillPath),
        allowOverwrite: true,
        action: "refreshed",
      });
    }
  }

  if (target === "opencode-repo") {
    addLanguageConfig(files, languagePreference);
    const openCodeConfigTargetPath = existsSync(join(targetDir, "opencode.json")) && !force ? openCodeConfigFragmentPath : "opencode.json";
    files.push({
      path: openCodeConfigTargetPath,
      content: loadAsset("opencode.json"),
    });

    for (const openCodePath of openCodeFiles) {
      files.push({
        path: openCodePath,
        content: loadAsset(openCodePath),
      });
    }

    for (const controlPath of controlFiles) {
      files.push({
        path: controlPath,
        content: loadAsset(controlPath),
      });
    }
  }

  return files;
}

function printNextSteps(target, destination, files, wroteAgentsFragment, wroteOpenCodeConfigFragment, removedOpenCodeAgents = []) {
  console.log("");
  console.log(`AGDF bootstrap complete in ${destination}`);
  console.log("");
  console.log("Generated:");
  for (const file of files) {
    const action = file.action ? `${file.action}: ` : "";
    console.log(`- ${action}${file.path}`);
  }

  if (removedOpenCodeAgents.length > 0) {
    console.log("");
    console.log("Removed generated legacy OpenCode agents:");
    for (const relativePath of removedOpenCodeAgents) console.log(`- ${relativePath}`);
  }

  const preservedFiles = [...new Set(files.map((file) => file.preserved).filter(Boolean))];
  if (preservedFiles.length > 0) {
    console.log("");
    console.log("Preserved:");
    for (const preserved of preservedFiles) console.log(`- ${preserved}`);
  }

  console.log("");
  console.log("Next steps:");
  const languageConfig = files.find((file) => file.path === join(".agdf", "control", "config.json"));
  if (languageConfig) {
    const language = JSON.parse(languageConfig.content);
    console.log(`- AGDF language preference: artefacts=${language.artifact_language}, chat=${language.chat_language}, runtime=${language.runtime_language}.`);
  }
  if (target === "init") {
    console.log("- Create or migrate a canonical run, then fill its RUN_STATE.md with the current gate, evidence and next allowed action.");
    console.log("- Run npx --yes @agdf/cli@latest doctor to check the control state before the next agent run.");
    console.log("- Commit the live control files once they represent the repository's current delivery state.");
    return;
  }
  if (target === "config") {
    console.log("- Restart or start a new agent session so the AGDF SessionStart hook reads the updated project language config.");
    console.log("- Run npx --yes @agdf/cli@latest doctor when this repository also uses durable AGDF control state.");
    return;
  }
  if (wroteAgentsFragment) {
    console.log(`- Existing AGENTS.md detected. Merge ${agdfFragmentPath} into your current AGENTS.md before using Copilot with AGDF.`);
  }
  if (target === "codex-repo" || target === "both") {
    console.log("- Restart Codex in this repository, open /plugins, select This repository and install agdf.");
    console.log("- Start a new Codex thread in this repository and ask: Run an AGDF gate check for this request.");
  }
  if (target === "both") {
    console.log(`- Optional global Claude Code install: ${pluginInstallCommand}`);
  }
  if (target === "opencode-repo") {
    if (wroteOpenCodeConfigFragment) {
      console.log(`- Existing opencode.json detected. Review ${openCodeConfigFragmentPath} and merge its owned entries so OpenCode loads .opencode/AGDF.md; preserve an explicit permission.question decision.`);
    }
    console.log(`- OpenCode will install the ${pluginDefinition.opencode.npmPackage} npm plugin from opencode.json at startup.`);
    console.log("- Optional: also add create-agdf to ~/.config/opencode/opencode.json plugin[] for a user-wide OpenCode hook.");
    console.log("- The global hook does not replace repository instructions or native skills; this repository's .opencode files remain the AGDF source of truth.");
    console.log("- Start OpenCode in this repository; it will load opencode.json, .opencode/AGDF.md and the native AGDF skills.");
    console.log("- Load agdf-gate-check through OpenCode's native skill tool for new build/change intent or unclear approval before later artefacts or implementation.");
    console.log("- Run npx --yes @agdf/cli@latest init when the repository needs live AGDF control files.");
  }
  if (target === "copilot" || target === "both") {
    console.log("- In GitHub Copilot CLI, run /instructions after the AGENTS.md step is complete to confirm that AGDF instructions and the repository skills are visible.");
    console.log("- Run npx --yes @agdf/cli@latest init when the repository needs live AGDF control files.");
  }
  console.log("- Commit the generated files so the repository becomes the source of truth.");
}

function readTargetFile(targetDir, relativePath) {
  return readFileSync(join(targetDir, relativePath), "utf8");
}

function addFinding(findings, severity, code, message, path, nextStep) {
  findings.push({
    severity,
    code,
    message,
    path,
    next_step: nextStep,
  });
}

function nonEmptyTableRows(content) {
  return content
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !line.includes("---"))
    .map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.some((cell) => cell && !cell.startsWith("`")));
}

function tableRows(content) {
  return content
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !line.includes("---"))
    .map((line) => {
      const cells = line.split("|").map((cell) => cell.trim());
      if (cells[0] === "") cells.shift();
      if (cells.at(-1) === "") cells.pop();
      return cells;
    });
}

const compactBacklogHeaders = ["priority", "key", "work item", "status", "artefacts", "current spec", "next step"];
const legacyBacklogHeaders = ["prio", "key", "title", "status", "ur", "brownfield review", "prd", "sd", "tp", "qa", "or", "current spec", "notes"];
const backlogStatusLabels = new Map([
  ["needs ur", "needs_ur"],
  ["awaiting brownfield review", "awaiting_brownfield_review"],
  ["awaiting prd", "awaiting_prd"],
  ["awaiting prd approval", "awaiting_prd_approval"],
  ["awaiting sd", "awaiting_sd"],
  ["awaiting sd approval", "awaiting_sd_approval"],
  ["awaiting tp", "awaiting_tp"],
  ["awaiting tp approval", "awaiting_tp_approval"],
  ["in progress", "in_progress"],
  ["blocked", "blocked"],
  ["awaiting qa", "awaiting_qa"],
  ["awaiting uat", "awaiting_uat"],
  ["completed", "completed"],
  ["superseded", "superseded"],
  ["abandoned", "abandoned"],
]);
const backlogArtefactLabels = new Map([
  ["ur", "ur"],
  ["brownfield", "brownfield_review"],
  ["prd", "prd"],
  ["sd", "sd"],
  ["tp", "tp"],
  ["qa", "qa"],
  ["or", "or"],
]);
const backlogScopeLabels = new Map([
  ["framework-maintenance", "framework_maintenance"],
  ["external-delivery", "external_delivery"],
]);

function normalizeBacklogHeader(value) {
  return value.replace(/`/g, "").trim().toLowerCase();
}

function markdownLink(value) {
  const match = value.trim().match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  return match ? { label: match[1].trim(), target: match[2].trim() } : null;
}

function resolvedBacklogLinkTarget(target) {
  if (!target
    || target.startsWith("/")
    || target.includes("\\")
    || /^[a-z][a-z0-9+.-]*:/i.test(target)) {
    return null;
  }
  const resolved = posix.normalize(posix.join(".agdf/control", target));
  if (resolved === ".." || resolved.startsWith("../")) return null;
  return resolved;
}

function normalizedBacklogLinkTarget(value, findings, backlogPath, label) {
  const link = markdownLink(value);
  if (!link) return value.trim();
  const resolved = resolvedBacklogLinkTarget(link.target);
  if (!resolved) {
    if (findings) {
      addFinding(
        findings,
        "revise",
        "AGDF_BACKLOG_LINK_TARGET_INVALID",
        `Backlog ${label} link must be relative to MASTER_BACKLOG.md: ${link.target || "<empty>"}.`,
        backlogPath,
        "Use a document-relative artefact target such as artefacts/<key>/UR.md.",
      );
    }
    return link.target;
  }
  return resolved;
}

function normalizeBacklogStatus(value, findings, backlogPath) {
  const cleaned = cleanStatusCell(value ?? "");
  const lookup = cleaned.replaceAll("_", " ").toLowerCase();
  const normalized = backlogStatusLabels.get(lookup);
  if (normalized) return normalized;
  if (/^[a-z][a-z0-9_]*$/.test(cleaned)) return cleaned;
  if (findings && filled(cleaned)) {
    addFinding(
      findings,
      "revise",
      "AGDF_BACKLOG_STATUS_UNKNOWN",
      `MASTER_BACKLOG.md uses an unknown human status label: ${cleaned}.`,
      backlogPath,
      "Use a documented human status label or a supported legacy snake_case value.",
    );
  }
  return cleaned;
}

function normalizeBacklogScope(workItem, findings, backlogPath) {
  const match = (workItem ?? "").match(/^\[([^\]]+)\]/);
  if (!match) return undefined;
  const cleaned = match[1].trim();
  const lookup = cleaned.replaceAll("_", " ").toLowerCase().replaceAll(" ", "-");
  const normalized = backlogScopeLabels.get(lookup);
  if (normalized) return normalized;
  if (findings) {
    addFinding(
      findings,
      "revise",
      "AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN",
      `MASTER_BACKLOG.md uses an unknown Work item scope tag: [${cleaned}].`,
      backlogPath,
      "Use [framework-maintenance] or [external-delivery], or remove the bracketed tag.",
    );
  }
  return cleaned;
}

function emptyBacklogPointer() {
  return {
    prio: "",
    key: "",
    title: "",
    scope: "",
    status: "",
    ur: "",
    brownfield_review: "",
    prd: "",
    sd: "",
    tp: "",
    qa: "",
    or: "",
    current_spec: "",
    notes: "",
  };
}

function parseCompactArtefacts(value, pointer, findings, backlogPath) {
  if (!filled(value)) return;
  const seen = new Set();
  for (const entry of value.split(/\s+·\s+/)) {
    const link = markdownLink(entry);
    if (!link) {
      if (findings) {
        addFinding(
          findings,
          "revise",
          "AGDF_BACKLOG_ARTEFACT_LINK_INVALID",
          `Compact Artefacts entry is not a Markdown link: ${entry}.`,
          backlogPath,
          "Use [UR](artefacts/<key>/UR.md) style links separated by a middle dot.",
        );
      }
      continue;
    }
    const field = backlogArtefactLabels.get(link.label.toLowerCase());
    if (!field) {
      if (findings) {
        addFinding(
          findings,
          "revise",
          "AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN",
          `Compact Artefacts uses an unknown label: ${link.label}.`,
          backlogPath,
          "Use UR, Brownfield, PRD, SD, TP, QA or OR.",
        );
      }
      continue;
    }
    if (seen.has(field)) {
      if (findings) {
        addFinding(
          findings,
          "revise",
          "AGDF_BACKLOG_ARTEFACT_LABEL_DUPLICATE",
          `Compact Artefacts repeats the ${link.label} link.`,
          backlogPath,
          "Keep exactly one link per artefact type.",
        );
      }
      continue;
    }
    seen.add(field);
    pointer[field] = normalizedBacklogLinkTarget(entry, findings, backlogPath, link.label);
  }
}

function parseBacklogSection(section, findings = null, backlogPath = ".agdf/control/MASTER_BACKLOG.md") {
  const rows = tableRows(section);
  if (rows.length === 0) return [];
  const headers = rows[0].map(normalizeBacklogHeader);
  const layout = headers.join("|") === compactBacklogHeaders.join("|")
    ? "compact"
    : headers.join("|") === legacyBacklogHeaders.join("|")
      ? "legacy"
      : "unknown";

  if (layout === "unknown") {
    if (findings) {
      addFinding(
        findings,
        "revise",
        "AGDF_BACKLOG_LAYOUT_UNKNOWN",
        `MASTER_BACKLOG.md uses an unsupported table layout: ${headers.join(", ")}.`,
        backlogPath,
        "Use the canonical compact layout or the supported legacy 13-column layout.",
      );
    }
    return [];
  }

  return rows.slice(1)
    .filter((cells) => cells.some((cell) => filled(cell)))
    .map((cells) => {
      const pointer = emptyBacklogPointer();
      if (layout === "legacy") {
        [
          pointer.prio,
          pointer.key,
          pointer.title,
          pointer.status,
          pointer.ur,
          pointer.brownfield_review,
          pointer.prd,
          pointer.sd,
          pointer.tp,
          pointer.qa,
          pointer.or,
          pointer.current_spec,
          pointer.notes,
        ] = cells.map((cell) => cell ?? "");
        pointer.status = normalizeBacklogStatus(pointer.status, findings, backlogPath);
        return pointer;
      }

      pointer.prio = cells[0] ?? "";
      pointer.key = cleanStatusCell(cells[1] ?? "");
      pointer.title = cells[2] ?? "";
      pointer.scope = normalizeBacklogScope(cells[2], findings, backlogPath) ?? "";
      pointer.status = normalizeBacklogStatus(cells[3], findings, backlogPath);
      parseCompactArtefacts(cells[4] ?? "", pointer, findings, backlogPath);
      pointer.current_spec = normalizedBacklogLinkTarget(cells[5] ?? "", findings, backlogPath, "Current spec");
      pointer.notes = cells[6] ?? "";
      return pointer;
    });
}

function hasFilledTableRow(content, firstCellPattern) {
  return tableRows(content)
    .filter((cells) => firstCellPattern.test(cells[0] ?? ""))
    .some((cells) => cells.slice(1).some((cell) => cell && !cell.startsWith("`")));
}

function isPlaceholderValue(value) {
  return !value || (value.startsWith("`") && value.includes("|"));
}

function hasFilledEvidenceRow(content) {
  const evidenceSection = content.match(/## Evidence([\s\S]*?)(?:\n## |\n# |$)/)?.[1] ?? "";
  return tableRows(evidenceSection)
    .filter((cells) => cells[0] !== "Evidence")
    .some((cells) => {
      const [evidence, source, covers] = cells;
      return Boolean(evidence || source || covers);
    });
}

function allowNoActiveRuns(targetDir) {
  const configPath = join(targetDir, ".agdf", "control", "config.json");
  if (!existsSync(configPath)) return false;
  try {
    return JSON.parse(readFileSync(configPath, "utf8")).allow_no_active_runs === true;
  } catch {
    return false;
  }
}

function markdownSection(content, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(`(?:^|\\n)## ${escaped}\\s*\\n([\\s\\S]*?)(?:\\n## |\\n# |$)`))?.[1] ?? "";
}

function filled(value) {
  return Boolean(value && !isPlaceholderValue(value) && value.trim() !== "");
}

function parseQualityContracts(content) {
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed.contracts) || parsed.contracts.length === 0) {
    throw new Error("contracts must be a non-empty array");
  }
  for (const contract of parsed.contracts) {
    if (!contract.code || !contract.impact || !contract.required_evidence) {
      throw new Error(`contract ${contract.code ?? "<unknown>"} is missing code, impact or required_evidence`);
    }
  }
  return parsed;
}

function evaluateDoctor(targetDir, selection = {}) {
  if (selection.allActive) {
    const selected = resolveRuns(targetDir, { allActive: true });
    const runs = selected.runs.map((run) => ({
      run_id: run.run_id,
      report: evaluateDoctor(targetDir, { runId: run.run_id }),
    }));
    const status = selected.findings.length
      ? "block"
      : aggregate(
          runs.map((item) => ({ run_id: item.run_id, status: item.report.status })),
          { allowNoActiveRuns: allowNoActiveRuns(targetDir) },
        ).status;
    const findings = [
      ...selected.findings.map((finding) => ({
        ...finding,
        severity: "block",
        message: "Invalid canonical run entry.",
        next_step: "Repair or remove the invalid run entry.",
      })),
      ...runs.flatMap((item) => item.report.findings.map((finding) => ({ ...finding, run_id: item.run_id }))),
    ];
    return {
      schema_version: "1",
      status,
      checked_at: new Date().toISOString(),
      target_dir: targetDir,
      summary: {
        findings: findings.length,
        block: findings.filter((finding) => finding.severity === "block").length,
        revise: findings.filter((finding) => finding.severity === "revise").length,
        warn: findings.filter((finding) => finding.severity === "warn").length,
      },
      findings,
      runs,
    };
  }
  const findings = [];
  const hasCanonicalRuns = existsSync(join(targetDir, ".agdf", "control", "runs"));
  if (hasCanonicalRuns) {
    const projection = verifyLegacyProjection(targetDir);
    if (!["absent", "valid"].includes(projection.status)) {
      addFinding(
        findings,
        "block",
        "AGDF_LEGACY_PROJECTION_DRIFT",
        `Legacy compatibility state is not a valid projection: ${projection.status}.`,
        join(".agdf", "control", "AGDF_RUN.md"),
        "Regenerate the explicit legacy projection or remove it after legacy consumers are retired.",
      );
    }
  }
  const missing = doctorRequiredFiles.filter(
    (relativePath) => !(relativePath.endsWith("AGDF_RUN.md") && hasCanonicalRuns) && !existsSync(join(targetDir, relativePath)),
  );

  for (const relativePath of missing) {
    const templatePath = join(dirname(relativePath), "templates", relativePath.split("/").at(-1));
    const hasTemplate = existsSync(join(targetDir, templatePath));
    addFinding(
      findings,
      "block",
      "AGDF_CONTROL_FILE_MISSING",
      hasTemplate
        ? "Live control file is missing; only the template exists."
        : "Required live control file is missing.",
      relativePath,
      "Run npx --yes @agdf/cli@latest init only when the repository should own durable AGDF control state or deterministic setup is explicitly needed.",
    );
  }

  if (missing.length === 0) {
    const selectedRunState = readRunState(targetDir, selection);
    const runPath = selectedRunState.path;
    const run = selectedRunState.content;

    if (selectedRunState.resolution_error) {
      addFinding(
        findings,
        "block",
        selectedRunState.resolution_error.split(":")[0] || "AGDF_ACTIVE_RUN_UNRESOLVED",
        `Run selection failed: ${selectedRunState.resolution_error}`,
        runPath,
        "Pass --run <run_id> or set AGDF_RUN_ID to select the intended run, or use --all-active to evaluate every active run independently.",
      );
    } else {
      const currentGateLine = run.match(/^- current_gate:[^\S\r\n]*(.*)$/m)?.[1]?.trim() ?? "";
      const nextActionLine = run.match(/^- next_allowed_action:[^\S\r\n]*(.*)$/m)?.[1]?.trim() ?? "";
      const hasEvidence = hasFilledEvidenceRow(run);

      if (isPlaceholderValue(currentGateLine)) {
        addFinding(
          findings,
          "revise",
          "AGDF_CURRENT_GATE_MISSING",
          "The selected run state does not name the current gate.",
          runPath,
          "Set current_gate to the current delivery gate or none.",
        );
      }

      if (isPlaceholderValue(nextActionLine)) {
        addFinding(
          findings,
          "revise",
          "AGDF_NEXT_ALLOWED_ACTION_MISSING",
          "The selected run state does not state the next allowed action.",
          runPath,
          "Fill the next allowed action before asking an agent to continue delivery work.",
        );
      }

      if (!hasEvidence) {
        addFinding(
          findings,
          "warn",
          "AGDF_EVIDENCE_EMPTY",
          "The selected run state has no visible evidence row yet.",
          runPath,
          "Add at least one evidence row or explicitly document that no evidence exists yet.",
        );
      }
    }

    const backlogPath = join(".agdf", "control", "MASTER_BACKLOG.md");
    const backlog = readTargetFile(targetDir, backlogPath);
    parseBacklogSection(markdownSection(backlog, "Active Backlog"), findings, backlogPath);
    parseBacklogSection(markdownSection(backlog, "Planned / Parking Lot"), findings, backlogPath);
    const completedRows = tableRows(markdownSection(backlog, "Completed / Superseded Pointers"))
      .slice(1)
      .filter((cells) => cells.some((cell) => filled(cell)));
    if (!hasFilledTableRow(backlog, /^P[0-9]/) && completedRows.length === 0) {
      addFinding(
        findings,
        "warn",
        "AGDF_BACKLOG_POINTER_EMPTY",
        "MASTER_BACKLOG.md does not contain an active or planned work pointer.",
        backlogPath,
        "Add the active item or document that no governed delivery item is active.",
      );
    }

    const sotPath = join(".agdf", "control", "SOT_REGISTRY.md");
    const sot = readTargetFile(targetDir, sotPath);
    if (!hasFilledTableRow(sot, /Product intent|Architecture|Runtime contracts|UX \/ user flows|Operations \/ release/)) {
      addFinding(
        findings,
        "warn",
        "AGDF_SOT_REGISTRY_EMPTY",
        "SOT_REGISTRY.md has no filled primary source-of-truth row.",
        sotPath,
        "Assign one primary source of truth for at least the domains relevant to the next run.",
      );
    }

    const activeDomains = new Map();
    for (const cells of nonEmptyTableRows(sot)) {
      const [domain, document, status] = cells;
      if (!domain || !document || status !== "active") continue;
      activeDomains.set(domain, (activeDomains.get(domain) ?? 0) + 1);
    }
    for (const [domain, count] of activeDomains.entries()) {
      if (count > 1) {
        addFinding(
          findings,
          "block",
          "AGDF_PARALLEL_SOT",
          `Domain has ${count} active source-of-truth rows: ${domain}.`,
          sotPath,
          "Keep exactly one active primary source of truth for this domain.",
        );
      }
    }

    const contextPath = join(".agdf", "control", "CONTEXT_GRAPH.md");
    const contextGraph = readTargetFile(targetDir, contextPath);
    if (contextGraph.includes("### CG-001 Example")) {
      addFinding(
        findings,
        "warn",
        "AGDF_CONTEXT_GRAPH_TEMPLATE_NODE",
        "CONTEXT_GRAPH.md still contains the example node.",
        contextPath,
        "Remove the example or replace it with an evidenced node that has an exit criterion.",
      );
    }

    const contractsPath = join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json");
    try {
      parseQualityContracts(readTargetFile(targetDir, contractsPath));
    } catch (error) {
      addFinding(
        findings,
        "block",
        "AGDF_QUALITY_CONTRACTS_INVALID",
        `AGENT_QUALITY_CONTRACTS.json is invalid: ${error.message}`,
        contractsPath,
        "Restore the generated contracts or fix the JSON contract schema.",
      );
    }

    const runState = selectedRunState;
    if (modeSliceDecision(runState) === "verified_change") {
      const verifiedChange = evaluateVerifiedChange(targetDir, runState);
      for (const finding of verifiedChange.findings) {
        addFinding(findings, finding.severity, finding.code, finding.message, finding.path, finding.next_step);
      }
    }
    for (const finding of analyzeDurableGateArtefactConsistency(runState)) {
      addFinding(findings, finding.severity, finding.code, finding.message, finding.path, finding.next_step);
    }
    for (const finding of analyzeDeliveryMap(runState).findings) {
      addFinding(findings, finding.severity, finding.code, finding.message, finding.path, finding.next_step);
    }
  }

  const severityRank = { block: 3, revise: 2, warn: 1 };
  const maxSeverity = findings.reduce((max, finding) => Math.max(max, severityRank[finding.severity] ?? 0), 0);
  const status = maxSeverity >= 3 ? "block" : maxSeverity === 2 ? "revise" : maxSeverity === 1 ? "warn" : "pass";

  return {
    schema_version: "1",
    status,
    checked_at: new Date().toISOString(),
    target_dir: targetDir,
    summary: {
      findings: findings.length,
      block: findings.filter((finding) => finding.severity === "block").length,
      revise: findings.filter((finding) => finding.severity === "revise").length,
      warn: findings.filter((finding) => finding.severity === "warn").length,
    },
    findings,
  };
}

function printDoctorReport(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`AGDF doctor: ${report.status}`);
  console.log(`Checked: ${report.target_dir}`);
  console.log(`Findings: ${report.summary.findings} (${report.summary.block} block, ${report.summary.revise} revise, ${report.summary.warn} warn)`);

  for (const finding of report.findings) {
    console.log("");
    console.log(`[${finding.severity}] ${finding.code}`);
    console.log(`Path: ${finding.path}`);
    console.log(finding.message);
    console.log(`Next step: ${finding.next_step}`);
  }
}

function extractField(content, field) {
  const pattern = new RegExp(`^- ${field}:[^\\S\\r\\n]*(.*)$`, "m");
  return content.match(pattern)?.[1]?.trim() ?? "";
}

const verifiedChangeStatuses = new Set(["draft", "eligible", "executed", "escalated"]);
const verifiedChangeEscalationTargets = new Set(["structured_slice", "structured_delivery"]);

function parseVerifiedChangePathList(value) {
  const cleaned = cleanStatusCell(value ?? "");
  if (!cleaned || cleaned === "none") return [];
  return cleaned.split(",").map((item) => item.trim()).filter(Boolean);
}

function isSafeRepoRelativePath(value) {
  if (!value || value === "none" || value.startsWith("/") || value.includes("\\")) return false;
  const normalized = posix.normalize(value);
  return normalized !== "." && normalized !== ".." && !normalized.startsWith("../") && normalized === value;
}

function gitPathList(targetDir, args) {
  try {
    return execFileSync("git", args, { cwd: targetDir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return null;
  }
}

function readVerifiedChangeRecord(targetDir, runState) {
  const artefact = runState.artefacts.get("Verified Change");
  if (!artefact?.path || isPlaceholderValue(artefact.path)) return { status: "missing", path: "", content: "" };
  if (!isSafeRepoRelativePath(artefact.path)) return { status: "invalid", path: artefact.path, content: "", error: "record_path_invalid" };
  const absolutePath = resolve(targetDir, artefact.path);
  const relativePath = relative(resolve(targetDir), absolutePath);
  if (isAbsolute(relativePath) || relativePath === ".." || relativePath.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) || !existsSync(absolutePath)) {
    return { status: "missing", path: artefact.path, content: "", error: "record_missing" };
  }
  return { status: "present", path: artefact.path, content: readFileSync(absolutePath, "utf8") };
}

function evaluateVerifiedChange(targetDir, runState) {
  const record = readVerifiedChangeRecord(targetDir, runState);
  const findings = [];
  const add = (code, message, nextStep, severity = "revise") => findings.push({
    severity,
    code,
    message,
    path: record.path || runState.path,
    next_step: nextStep,
  });

  if (record.status === "missing") {
    return { status: "missing", record, findings };
  }
  if (record.status === "invalid") {
    add("AGDF_VERIFIED_CHANGE_RECORD_PATH_INVALID", "Verified Change record path must be a repository-relative path inside the target repository.", "Link a stable repository-relative VERIFIED_CHANGE.md artefact from the selected run state.", "block");
    return { status: "invalid", record, findings };
  }

  const status = cleanStatusCell(extractField(record.content, "status"));
  const relatedUr = cleanStatusCell(extractField(record.content, "related_ur"));
  const escalationTarget = cleanStatusCell(extractField(record.content, "escalation_target"));
  const canonicalOwner = cleanStatusCell(extractField(record.content, "canonical_owner"));
  const sourcePaths = parseVerifiedChangePathList(extractField(record.content, "allowed_source_paths"));
  const derivedPaths = parseVerifiedChangePathList(extractField(record.content, "allowed_derived_paths"));
  const prohibitedImpacts = cleanStatusCell(extractField(record.content, "prohibited_impacts"));
  const propagationCommand = extractField(record.content, "propagation_command");
  const validationCommands = extractField(record.content, "validation_commands");
  const baselineTracked = parseVerifiedChangePathList(extractField(record.content, "baseline_tracked_paths"));
  const baselineUntracked = parseVerifiedChangePathList(extractField(record.content, "baseline_untracked_paths"));
  const validationStatus = cleanStatusCell(extractField(record.content, "validation_status"));
  const propagationStatus = cleanStatusCell(extractField(record.content, "propagation_status"));
  const urArtefact = runState.artefacts.get("UR");

  if (!verifiedChangeStatuses.has(status)) add("AGDF_VERIFIED_CHANGE_STATUS_INVALID", "Verified Change record must use status draft, eligible, executed or escalated.", "Set a supported record status or escalate to the declared structured target.");
  if (!isSafeRepoRelativePath(relatedUr) || relatedUr !== urArtefact?.path) add("AGDF_VERIFIED_CHANGE_RELATED_UR_INVALID", "Verified Change record must link exactly to the selected run's repository-relative UR artefact.", "Set related_ur to the selected run's durable UR artefact path.");
  if (!verifiedChangeEscalationTargets.has(escalationTarget)) add("AGDF_VERIFIED_CHANGE_ESCALATION_INVALID", "Verified Change record must declare structured_slice or structured_delivery as its escalation target.", "Record the Brownfield-selected structured escalation target.");
  if (!canonicalOwner || canonicalOwner.includes(",") || !isSafeRepoRelativePath(canonicalOwner)) add("AGDF_VERIFIED_CHANGE_OWNER_INVALID", "Verified Change requires exactly one repository-relative canonical_owner.", "Name one canonical owner path; otherwise escalate.");
  if (sourcePaths.length === 0 || sourcePaths.some((path) => !isSafeRepoRelativePath(path))) add("AGDF_VERIFIED_CHANGE_SOURCE_PATHS_INVALID", "Verified Change requires non-empty normalized allowed_source_paths.", "Declare a bounded comma-separated source path list; otherwise escalate.");
  if (derivedPaths.some((path) => !isSafeRepoRelativePath(path))) add("AGDF_VERIFIED_CHANGE_DERIVED_PATHS_INVALID", "Verified Change derived paths must be normalized repository-relative paths or none.", "Correct the derived path list or escalate.");
  if (prohibitedImpacts !== "none") add("AGDF_VERIFIED_CHANGE_IMPACTS_INVALID", "Verified Change must declare prohibited_impacts: none after checking gates, permissions, security, persistence, architecture, external API, CLI and release behavior.", "Use the structured path when any prohibited impact applies.");
  if (!validationCommands || validationCommands === "none") add("AGDF_VERIFIED_CHANGE_VALIDATION_MISSING", "Verified Change requires at least one deterministic validation command.", "Record a deterministic acceptance or consistency check, or escalate.");
  if (derivedPaths.length > 0 && (!propagationCommand || propagationCommand === "none")) add("AGDF_VERIFIED_CHANGE_PROPAGATION_MISSING", "Derived paths require a deterministic propagation command.", "Record the propagation command or escalate.");
  if (!extractField(record.content, "baseline_tracked_paths") || !extractField(record.content, "baseline_untracked_paths")) add("AGDF_VERIFIED_CHANGE_BASELINE_MISSING", "Verified Change requires both tracked and untracked baseline path fields, using none when empty.", "Capture the worktree baseline before marking the record eligible.");

  const allowedPaths = new Set([...sourcePaths, ...derivedPaths]);
  const baselinePaths = new Set([...baselineTracked, ...baselineUntracked]);
  const dirtyCandidate = [...allowedPaths].find((path) => baselinePaths.has(path));
  if (dirtyCandidate) add("AGDF_VERIFIED_CHANGE_BASELINE_CANDIDATE_DIRTY", `Declared candidate path is already dirty at baseline: ${dirtyCandidate}.`, "Escalate or start from a clean candidate path; do not adopt pre-existing edits.", "block");

  const currentTracked = gitPathList(targetDir, ["diff", "HEAD", "--name-only"]);
  const currentUntracked = gitPathList(targetDir, ["ls-files", "--others", "--exclude-standard"]);
  if (currentTracked === null || currentUntracked === null) {
    add("AGDF_VERIFIED_CHANGE_GIT_BASELINE_UNAVAILABLE", "Verified Change requires a readable Git worktree for scoped baseline validation.", "Use the structured path or restore Git worktree access.", "block");
  } else {
    const currentPaths = new Set([...currentTracked, ...currentUntracked]);
    const permittedControlPaths = new Set([record.path, runState.path, ".agdf/control/MASTER_BACKLOG.md"]);
    const unexpected = [...currentPaths].filter((path) => !baselinePaths.has(path) && !allowedPaths.has(path) && !permittedControlPaths.has(path));
    if (unexpected.length > 0) add("AGDF_VERIFIED_CHANGE_SCOPE_ESCAPE", `Verified Change introduced unlisted path(s): ${unexpected.join(", ")}.`, "Mark the record escalated and continue at the declared structured target.", "block");
  }

  if (status === "executed") {
    if (validationStatus !== "pass") add("AGDF_VERIFIED_CHANGE_VALIDATION_EVIDENCE_MISSING", "Executed Verified Change requires validation_status: pass.", "Record passing deterministic validation evidence or escalate.");
    if (derivedPaths.length > 0 && propagationStatus !== "pass") add("AGDF_VERIFIED_CHANGE_PROPAGATION_EVIDENCE_MISSING", "Executed Verified Change with derived paths requires propagation_status: pass.", "Record successful propagation evidence or escalate.");
  }

  if (status === "escalated") return { status: "escalated", record, escalation_target: escalationTarget, findings };
  if (findings.length > 0) return { status: "invalid", record, escalation_target: escalationTarget, findings };
  return { status, record, escalation_target: escalationTarget, findings };
}

function cleanStatusCell(value) {
  return value.replace(/^`|`$/g, "").trim();
}

function readRunState(targetDir, selection = {}) {
  let runPath = join(".agdf", "control", "AGDF_RUN.md");
  const canonicalRoot = join(targetDir, ".agdf", "control", "runs");
  let resolutionError;
  if (existsSync(canonicalRoot)) {
    try {
      const selected = resolveRuns(targetDir, {
        runIdArg: selection.runId,
        runIdEnv: process.env.AGDF_RUN_ID,
      });
      runPath = selected.run.path.startsWith(targetDir)
        ? selected.run.path.slice(targetDir.length + 1)
        : selected.run.path;
    } catch (error) {
      resolutionError = error.message;
    }
  }
  if (resolutionError || !existsSync(join(targetDir, runPath))) {
    return {
      path: runPath,
      content: "",
      current_gate: "",
      next_allowed_action: "",
      approvals: new Map(),
      artefacts: new Map(),
      evidence_refs: [],
      artefact_chain: [],
      mode_slice_decision: {},
      missing_evidence: [],
      risks: [],
      context_graph: {},
      quality_outlook: "",
      source_scope: {},
      memory: {},
      resolution_error: resolutionError,
    };
  }

  const content = readTargetFile(targetDir, runPath);
  const parsed = parseControlState(content, {
    userGates: userGateOrder,
    internalSteps: [...internalStepArtefacts],
  });

  return {
    path: runPath,
    content,
    ...parsed,
  };
}

function gateApprovalStatus(runState, gate) {
  if (!userGateOrder.includes(gate)) return "not_applicable";
  return runState.approvals.get(gate)?.status ?? "";
}

function gateArtefactStatus(runState, gate) {
  if (!userGateOrder.includes(gate)) return { status: "not_applicable", path: "" };
  return runState.artefacts.get(gate) ?? { status: "", path: "" };
}

function isDurableGateArtefactSatisfied(runState, gate) {
  if (!durableGateArtefacts.has(gate)) return true;
  const artefact = gateArtefactStatus(runState, gate);
  if (!artefact.path || isPlaceholderValue(artefact.path)) return false;
  if (gate === "QA") return artefact.status === "pass" || artefact.status === "passed";
  return artefact.status === "approved";
}

function expectedDurableArtefactStatuses(gate) {
  return gate === "QA" ? ["pass", "passed"] : ["approved"];
}

function describeDurableArtefactStatuses(gate) {
  return expectedDurableArtefactStatuses(gate).map((status) => `\`${status}\``).join(" or ");
}

function analyzeDurableGateArtefactConsistency(runState) {
  const findings = [];

  for (const gate of durableGateArtefacts) {
    if (gateApprovalStatus(runState, gate) !== "approved") continue;

    const artefact = gateArtefactStatus(runState, gate);
    if (!artefact.path || isPlaceholderValue(artefact.path) || !artefact.status) continue;

    const expectedStatuses = expectedDurableArtefactStatuses(gate);
    if (expectedStatuses.includes(artefact.status)) continue;

    findings.push({
      severity: "revise",
      code: "AGDF_GATE_ARTEFACT_STATUS_INCONSISTENT",
      message: `${gate} approval is recorded, but the durable artefact row uses status \`${artefact.status}\`; expected ${describeDurableArtefactStatuses(gate)}.`,
      path: runState.path,
      next_step: `Update the ${gate} artefact row in the selected RUN_STATE.md to use the gate-specific durable status vocabulary.`,
    });
  }

  return findings;
}

function isInternalStepSatisfied(runState, step) {
  const artefact = runState.artefacts.get(step);
  if (!artefact) return false;
  if (artefact.status === "done") return true;
  return artefact.status === "not_applicable"
    && (step === "Brownfield Review" || step === "Brownfield Analysis");
}

function modeSliceDecision(runState) {
  const decision = runState.mode_slice_decision?.decision ?? "";
  const scopeReason = runState.mode_slice_decision?.scope_reason ?? "";
  const evidence = runState.mode_slice_decision?.evidence ?? "";
  if (!decision || isPlaceholderValue(decision) || !filled(scopeReason) || !filled(evidence)) return "undecided";
  return decision;
}

function relationshipRequired(runState, requiredBy) {
  if (gateApprovalStatus(runState, requiredBy) === "not_applicable") return false;
  if (requiredBy === "QA") {
    return isGateSatisfied(runState, "QA");
  }

  return isGateSatisfied(runState, requiredBy);
}

function findRelationship(runState, expected) {
  return runState.artefact_chain.find((row) =>
    row.from === expected.from
    && row.relationship === expected.relationship
    && row.to === expected.to
  );
}

function severityFromImpact(value) {
  if (value === "block") return "block";
  if (value === "revise") return "revise";
  if (value === "warning" || value === "warn") return "warn";
  return null;
}

function analyzeDeliveryMap(runState) {
  const findings = [];
  const relationships = deliveryRelationships.map((expected) => {
    const row = findRelationship(runState, expected);
    const required = relationshipRequired(runState, expected.requiredBy);
    const evidence = row?.evidence ?? "";
    const status = !row ? "missing" : filled(evidence) ? "pass" : required ? "missing_evidence" : "template";

    if (required && status !== "pass") {
      findings.push({
        severity: "revise",
        code: status === "missing" ? "AGDF_DELIVERY_RELATIONSHIP_MISSING" : "AGDF_DELIVERY_RELATIONSHIP_EVIDENCE_MISSING",
        message: `${expected.from} must be traceable via ${expected.relationship} ${expected.to}.`,
        path: runState.path,
        next_step: "Fill the Artefact Chain row with concrete evidence before treating the delivery map as complete.",
      });
    }

    return {
      from: expected.from,
      relationship: expected.relationship,
      to: expected.to,
      required,
      status,
      evidence,
    };
  });

  for (const item of runState.missing_evidence) {
    const severity = severityFromImpact(item.impact);
    if (!severity) continue;
    findings.push({
      severity,
      code: "AGDF_MISSING_EVIDENCE_DECLARED",
      message: item.missing_evidence,
      path: runState.path,
      next_step: item.required_next_step || "Resolve or explicitly accept the missing evidence before advancing the gate.",
    });
  }

  for (const item of runState.risks) {
    const severity = severityFromImpact(item.impact);
    if (!severity) continue;
    findings.push({
      severity,
      code: "AGDF_RISK_DECLARED",
      message: item.risk,
      path: runState.path,
      next_step: item.mitigation_or_owner || "Assign mitigation or ownership before advancing the gate.",
    });
  }

  const contextSeverity = severityFromImpact(runState.context_graph?.gate_effect);
  if (contextSeverity) {
    findings.push({
      severity: contextSeverity,
      code: "AGDF_CONTEXT_GRAPH_GATE_EFFECT",
      message: `Context Graph impact is ${runState.context_graph.impact || "unspecified"} with gate effect ${runState.context_graph.gate_effect}.`,
      path: runState.path,
      next_step: runState.context_graph.required_action && runState.context_graph.required_action !== "none"
        ? `Resolve Context Graph action: ${runState.context_graph.required_action}.`
        : "Clarify the Context Graph impact before advancing the gate.",
    });
  }

  const multiScopeState = runState.source_scope?.multi_scope_state;
  if (multiScopeState === "ambiguous" || multiScopeState === "blocked") {
    findings.push({
      severity: multiScopeState === "blocked" ? "block" : "revise",
      code: "AGDF_SCOPE_AMBIGUOUS",
      message: "Multiple active scope lines are plausible; the agent must not choose one silently.",
      path: runState.path,
      next_step: "List competing scope lines with gate and artefact evidence, then clarify the active scope.",
    });
  }

  const branchEffect = runState.source_scope?.branch_workspace_scope_effect;
  if (branchEffect === "conflicts" || branchEffect === "insufficient") {
    findings.push({
      severity: branchEffect === "conflicts" ? "revise" : "warn",
      code: "AGDF_BRANCH_NOT_SCOPE_PROOF",
      message: "Branch or workspace evidence is not sufficient scope proof.",
      path: runState.path,
      next_step: "Confirm the active scope from durable artefacts or record why branch/workspace evidence is only supporting evidence.",
    });
  }

  if (runState.memory?.target && runState.memory.target !== "none" && !filled(runState.memory.reason)) {
    findings.push({
      severity: "warn",
      code: "AGDF_MEMORY_TARGET_REASON_MISSING",
      message: "Knowledge persistence target is set without a reason.",
      path: runState.path,
      next_step: "Fill memory_reason or set memory_target to none.",
    });
  }

  return {
    relationships,
    missing_evidence: runState.missing_evidence,
    risks: runState.risks,
    context_graph: runState.context_graph,
    source_scope: runState.source_scope,
    memory: runState.memory,
    findings,
  };
}

function deriveQualityOutlook(runState, findings = []) {
  if (filled(runState.quality_outlook)) return runState.quality_outlook;
  if (findings.some((finding) => finding.severity === "block" || finding.severity === "revise")) {
    return "Resolve blocking or revise-level delivery-map findings before making stronger quality claims.";
  }
  if (findings.some((finding) => finding.severity === "warn")) {
    return "Review warning-level findings when investing further in delivery confidence.";
  }
  return "No additional quality follow-up identified from the current control state.";
}

function postApprovalTransition(missingApproval) {
  const transitions = new Map([
    ["Approval: UR", {
      next_gate_after_approval: "Brownfield Review",
      allowed_after_approval: "Run Brownfield Review and record Mode/Slice Decision before PRD or implementation.",
      internal_next_step: "Brownfield Review and Mode/Slice Decision",
      next_user_gate: "PRD",
      user_action_required: "yes",
    }],
    ["Approval: PRD", {
      next_gate_after_approval: "SD",
      allowed_after_approval: "Draft Solution Design; implementation remains forbidden.",
      internal_next_step: "draft Solution Design",
      next_user_gate: "SD",
      user_action_required: "yes",
    }],
    ["Approval: SD", {
      next_gate_after_approval: "TP",
      allowed_after_approval: "Draft Task/Test Plan; implementation remains forbidden.",
      internal_next_step: "draft Task/Test Plan",
      next_user_gate: "TP",
      user_action_required: "yes",
    }],
    ["Approval: TP", {
      next_gate_after_approval: "none",
      allowed_after_approval: "Run implementation-prep Brownfield Analysis before CD+Tests; no further user approval is required at this internal step.",
      internal_next_step: "pre-implementation Brownfield Analysis",
      next_user_gate: "none",
      user_action_required: "no",
    }],
    ["Approval: QA", {
      next_gate_after_approval: "UAT",
      allowed_after_approval: "Request UAT when QA has passed; release remains gated.",
      internal_next_step: "prepare UAT evidence",
      next_user_gate: "UAT",
      user_action_required: "yes",
    }],
    ["Approval: UAT", {
      next_gate_after_approval: "OR",
      allowed_after_approval: "Produce OR or delivery closeout; VCS and release actions still require explicit instruction.",
      internal_next_step: "OR or delivery closeout",
      next_user_gate: "none",
      user_action_required: "no",
    }],
  ]);

  return transitions.get(missingApproval) ?? {
    next_gate_after_approval: "none",
    allowed_after_approval: "none",
  };
}

function buildStatusCard({
  status,
  currentGate,
  allowed = [],
  forbidden = [],
  blockingReason = "none",
  missingApproval = "none",
  nextAllowedAction,
  runState,
  chatLanguage = "en",
  findings = [],
}) {
  const qualityOutlook = deriveQualityOutlook(runState, findings);
  const postApproval = postApprovalTransition(missingApproval);
  const isUserGateApproval = missingApproval !== "none";
  return {
    run_id: extractField(runState.content ?? "", "run_id") || "unknown",
    presentation_language: chatLanguage,
    mode: extractField(runState.content ?? "", "mode") || "unknown",
    status,
    current_gate: currentGate,
    mode_slice_decision: runState.mode_slice_decision?.decision || "undecided",
    allowed_now: allowed,
    forbidden_now: forbidden,
    blocking_condition: blockingReason || "none",
    missing_approval: missingApproval || "none",
    next_gate_after_approval: postApproval.next_gate_after_approval,
    allowed_after_approval: postApproval.allowed_after_approval,
    user_visible_outcome_after_approval: postApproval.allowed_after_approval,
    internal_next_step: postApproval.internal_next_step || (isUserGateApproval ? "none" : nextAllowedAction),
    next_user_gate: postApproval.next_user_gate || "none",
    user_action_required: postApproval.user_action_required || (isUserGateApproval ? "yes" : "no"),
    evidence: runState.evidence_refs,
    next_skill: nextSkillByGate[currentGate] ?? "gate-check",
    next_step: nextAllowedAction,
    quality_outlook: qualityOutlook,
  };
}

function durableArtefactBlock(gate, nextGate) {
  const label = gate === "QA" ? "QA report" : `${gate} artefact`;
  const stablePath = gate === "QA" ? ".agdf/control/artefacts/<key>/QA_REPORT.md" : `.agdf/control/artefacts/<key>/${gate}.md`;
  return {
    status: "blocked",
    current_gate: gate,
    blocking_reason: `missing_durable_${gate.toLowerCase()}_artefact`,
    missing_approval: "none",
    allowed: [
      `persist the approved ${label} in a stable artefact path such as ${stablePath}`,
      "link the artefact from the selected RUN_STATE.md and MASTER_BACKLOG.md",
      "run gate-check again",
    ],
    forbidden: nextGate
      ? [`create ${nextGate}`, "create later-gate artefacts", "implement gated work", "claim QA or release readiness"]
      : ["create later-gate artefacts", "implement gated work", "claim release readiness"],
    next_allowed_action: `Persist the approved ${label} and link it from the AGDF control state before continuing.`,
  };
}

function isGateSatisfied(runState, gate) {
  const status = gateApprovalStatus(runState, gate);
  if (status === "not_applicable") return true;
  if (status !== "approved") return false;
  if (gate === "UAT") return true;
  return isDurableGateArtefactSatisfied(runState, gate);
}

function transitionDecisionForRunState(runState, verifiedChange = null) {
  if (gateApprovalStatus(runState, "UR") === "approved" && !isGateSatisfied(runState, "UR")) return durableArtefactBlock("UR", "PRD");

  if (!isGateSatisfied(runState, "UR")) {
    return {
      status: "blocked",
      current_gate: "UR",
      blocking_reason: "missing_exact_approval",
      missing_approval: "Approval: UR",
      allowed: ["clarify user need", "formulate and persist UR", "record evidence", "request exact UR approval"],
      forbidden: ["create PRD", "create SD", "create TP", "run Brownfield Analysis", "implement code", "claim QA or release readiness"],
      next_allowed_action: "Clarify the user requirement, persist the UR, and request exact approval: Approval: UR",
    };
  }

  if (gateApprovalStatus(runState, "PRD") === "approved" && !isGateSatisfied(runState, "PRD")) return durableArtefactBlock("PRD", "SD");

  if (!isGateSatisfied(runState, "PRD")) {
    if (!isInternalStepSatisfied(runState, "Brownfield Review")) {
      return {
        status: "open",
        current_gate: "Brownfield Review",
        blocking_reason: "none",
        missing_approval: "none",
        allowed: [
          "run Brownfield Review after G-00",
          "identify existing workstream, owners, SoT, reuse risks and open PRD/SD questions",
          "mark Brownfield Review as done or not_applicable in the selected RUN_STATE.md",
        ],
        forbidden: ["create PRD before Brownfield Review is resolved", "create SD", "create TP", "implement code", "claim QA or release readiness"],
        next_allowed_action: "Run Brownfield Review after G-00 before drafting PRD, or mark Brownfield Review not_applicable with evidence.",
      };
    }

    const modeDecision = modeSliceDecision(runState);
    if (modeDecision === "undecided") {
      return {
        status: "open",
        current_gate: "Mode/Slice Decision",
        blocking_reason: "none",
        missing_approval: "none",
        allowed: [
          "decide whether the approved UR is quick_task, verified_change, structured_slice, structured_delivery or block",
          "record scope reason, evidence and required next gate depth in the selected RUN_STATE.md",
          "choose the next required gate depth before drafting PRD or implementing",
        ],
        forbidden: ["create PRD before process size is decided", "create SD", "create TP", "implement code", "claim QA or release readiness"],
        next_allowed_action: "Record the Mode/Slice Decision from Brownfield Review with scope reason and evidence before choosing PRD depth or Quick Task execution.",
      };
    }

    if (modeDecision === "block") {
      return {
        status: "blocked",
        current_gate: "Mode/Slice Decision",
        blocking_reason: "mode_slice_decision_blocked",
        missing_approval: "none",
        allowed: ["resolve ownership, SoT, evidence, impact or product-direction uncertainty", "run gate-check again"],
        forbidden: ["create PRD", "create SD", "create TP", "implement code", "claim QA or release readiness"],
        next_allowed_action: "Resolve the Brownfield Review blocker before choosing a delivery path.",
      };
    }

    if (modeDecision === "quick_task") {
      return {
        status: "open",
        current_gate: "Quick Task Execution",
        blocking_reason: "none",
        missing_approval: "none",
        allowed: ["implement the narrow approved UR scope", "run relevant checks", "record evidence and close with OR-lite"],
        forbidden: ["expand scope beyond the Brownfield Review decision", "create broad PRD/SD/TP artefacts by ritual", "claim QA or release readiness without evidence"],
        next_allowed_action: "Proceed as a Quick Task within the Brownfield Review scope and record verification evidence.",
      };
    }

    if (modeDecision === "verified_change") {
      const state = verifiedChange?.status ?? "missing";
      const escalationTarget = verifiedChange?.escalation_target ?? "structured_slice";
      if (state === "executed") {
        return {
          status: "open",
          current_gate: "OR",
          blocking_reason: "none",
          missing_approval: "none",
          allowed: ["use the Verified Change mini-closeout", "offer delivery closeout when requested"],
          forbidden: ["create PRD, SD, TP, QA or UAT by ritual", "commit, push, open PR or release automatically"],
          next_allowed_action: "Close the executed Verified Change with its compact record and offer delivery closeout; do not perform VCS actions automatically.",
        };
      }
      if (state === "escalated" || (state === "invalid" && verifiedChangeEscalationTargets.has(escalationTarget))) {
        return {
          status: "open",
          current_gate: "PRD",
          blocking_reason: state === "escalated" ? "verified_change_escalated" : "verified_change_invalid_escalated",
          missing_approval: "Approval: PRD",
          allowed: ["draft the structured PRD required by the declared escalation target", "retain the Verified Change escalation evidence"],
          forbidden: ["implement through Verified Change", "create SD or TP before PRD approval", "claim QA or release readiness"],
          next_allowed_action: `Proceed as ${escalationTarget}: draft the required PRD and request exact approval: Approval: PRD.`,
        };
      }
      if (state === "eligible") {
        return {
          status: "open",
          current_gate: "Verified Change Execution",
          blocking_reason: "none",
          missing_approval: "none",
          allowed: ["implement only declared source and derived paths", "run declared propagation and validation commands", "record execution evidence and mini-closeout"],
          forbidden: ["touch unlisted paths", "add prohibited impacts", "claim QA, UAT or release readiness"],
          next_allowed_action: "Implement only the eligible Verified Change record scope, then record passing propagation and validation evidence.",
        };
      }
      return {
        status: state === "missing" || state === "draft" ? "open" : "blocked",
        current_gate: "Verified Change Execution",
        blocking_reason: state === "invalid" ? "verified_change_invalid" : "verified_change_record_required",
        missing_approval: "none",
        allowed: ["create or refine the compact Verified Change record", "capture baseline paths", "prove fail-closed eligibility with doctor and gate-check"],
        forbidden: ["implement candidate changes", "claim validation, QA, UAT or release readiness"],
        next_allowed_action: "Create or repair VERIFIED_CHANGE.md, capture the baseline and satisfy every eligibility check before implementation; escalate when any condition cannot be proven.",
      };
    }

    return {
      status: "open",
      current_gate: "PRD",
      blocking_reason: "none",
      missing_approval: "Approval: PRD",
      allowed: ["draft or refine PRD", "define scope", "define acceptance criteria", "define non-goals", "request exact PRD approval"],
      forbidden: ["create SD", "create TP", "run Brownfield Analysis as implementation preparation", "implement code", "claim QA or release readiness"],
      next_allowed_action: modeDecision === "structured_slice"
        ? "Draft or refine the smallest PRD slice justified by Brownfield Review; do not implement before required artefacts are approved."
        : "Draft or refine the PRD; do not implement before PRD, SD and TP are approved.",
    };
  }

  if (gateApprovalStatus(runState, "SD") === "approved" && !isGateSatisfied(runState, "SD")) return durableArtefactBlock("SD", "TP");

  if (!isGateSatisfied(runState, "SD")) {
    return {
      status: "open",
      current_gate: "SD",
      blocking_reason: "none",
      missing_approval: "Approval: SD",
      allowed: ["draft or refine Solution Design", "define architecture", "define ownership", "request exact SD approval"],
      forbidden: ["create TP", "implement code", "claim QA or release readiness"],
      next_allowed_action: "Draft or refine the Solution Design; do not implement before SD and TP are approved.",
    };
  }

  if (gateApprovalStatus(runState, "TP") === "approved" && !isGateSatisfied(runState, "TP")) return durableArtefactBlock("TP", "Brownfield Analysis");

  if (!isGateSatisfied(runState, "TP")) {
    return {
      status: "open",
      current_gate: "TP",
      blocking_reason: "none",
      missing_approval: "Approval: TP",
      allowed: ["draft or refine Task/Test Plan", "define task IDs", "define test evidence", "request exact TP approval"],
      forbidden: ["implement code", "claim QA or release readiness"],
      next_allowed_action: "Draft or refine the Task/Test Plan; do not implement before TP is approved.",
    };
  }

  const implementationStepsRequired = gateApprovalStatus(runState, "TP") === "approved";
  if (implementationStepsRequired && !isInternalStepSatisfied(runState, "Brownfield Analysis")) {
    return {
      status: "open",
      current_gate: "Brownfield Analysis",
      blocking_reason: "none",
      missing_approval: "none",
      allowed: ["run Brownfield Analysis for the approved TP scope", "verify existing owners, reuse paths and regression risks"],
      forbidden: ["implement before Brownfield evidence supports the approved TP path", "claim QA or release readiness"],
      next_allowed_action: "Run Brownfield Analysis for the approved TP scope before CD+Tests.",
    };
  }

  if (implementationStepsRequired && !isInternalStepSatisfied(runState, "CD+Tests")) {
    return {
      status: "open",
      current_gate: "CD+Tests",
      blocking_reason: "none",
      missing_approval: "none",
      allowed: ["implement the approved TP tasks", "run the approved test plan", "record implementation and test evidence"],
      forbidden: ["claim QA pass", "request UAT approval", "release"],
      next_allowed_action: "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR.",
    };
  }

  if (implementationStepsRequired && !isInternalStepSatisfied(runState, "CR")) {
    return {
      status: "open",
      current_gate: "CR",
      blocking_reason: "none",
      missing_approval: "none",
      allowed: ["run mandatory code review", "record correctness, regression, security and maintainability findings", "fix blocking review findings"],
      forbidden: ["claim QA pass", "request UAT approval", "release"],
      next_allowed_action: "Run Code Review for the implemented TP scope and resolve blocking findings before QA.",
    };
  }

  if (gateApprovalStatus(runState, "QA") === "approved" && !isGateSatisfied(runState, "QA")) return durableArtefactBlock("QA", "UAT");

  if (isGateSatisfied(runState, "QA") && !isGateSatisfied(runState, "UAT")) {
    return {
      status: "open",
      current_gate: "UAT",
      blocking_reason: "none",
      missing_approval: "Approval: UAT",
      allowed: ["request exact UAT approval", "prepare non-operative delivery summary"],
      forbidden: ["release", "push", "open PR", "commit without explicit user instruction and required approval"],
      next_allowed_action: "Request exact approval: Approval: UAT before delivery handoff.",
    };
  }

  if (isGateSatisfied(runState, "UAT")) {
    return {
      status: "open",
      current_gate: "OR",
      blocking_reason: "none",
      missing_approval: "none",
      allowed: ["produce OR or delivery closeout", "prepare commit, push or PR handoff when requested"],
      forbidden: ["commit, push, open PR or release automatically"],
      next_allowed_action: "Produce delivery closeout or requested handoff; do not perform VCS actions automatically.",
    };
  }

  return {
    status: "open",
    current_gate: "QA",
    blocking_reason: "none",
    missing_approval: "Approval: QA",
    allowed: ["run QA gate", "persist or refine the QA report", "request exact QA approval"],
    forbidden: ["request UAT approval", "release", "claim delivery readiness before QA approval and report evidence"],
    next_allowed_action: "Run the QA gate, persist the QA report, and request exact approval: Approval: QA",
  };
}

function evaluateGateCheck(targetDir, selection = {}) {
  const doctorReport = evaluateDoctor(targetDir, selection);
  const runState = readRunState(targetDir, selection);
  const verifiedChange = modeSliceDecision(runState) === "verified_change"
    ? evaluateVerifiedChange(targetDir, runState)
    : null;
  const transitionDecision = transitionDecisionForRunState(runState, verifiedChange);
  const deliveryMap = analyzeDeliveryMap(runState);
  const doctorBlocker = doctorReport.findings.find((finding) => finding.severity === "block");
  const doctorRevise = doctorReport.findings.find((finding) => finding.severity === "revise");
  const routesInvalidVerifiedChange = modeSliceDecision(runState) === "verified_change"
    && verifiedChange?.status === "invalid"
    && verifiedChangeEscalationTargets.has(verifiedChange.escalation_target);

  let status = transitionDecision.status;
  let currentGate = transitionDecision.current_gate;
  let blockingReason = transitionDecision.blocking_reason;
  let missingApproval = transitionDecision.missing_approval;
  let allowed = transitionDecision.allowed;
  let forbidden = transitionDecision.forbidden;
  let nextAllowedAction = modeSliceDecision(runState) === "verified_change"
    ? transitionDecision.next_allowed_action
    : isPlaceholderValue(runState.next_allowed_action)
    ? transitionDecision.next_allowed_action
    : runState.next_allowed_action;

  if (doctorBlocker?.code === "AGDF_CONTROL_FILE_MISSING") {
    status = "blocked";
    blockingReason = doctorBlocker.code;
    currentGate = "UR";
    missingApproval = "Approval: UR";
    allowed = [
      "draft the minimal UR for the requested change in the response",
      "request exact approval: Approval: UR",
      "run npx --yes @agdf/cli@latest init only when durable control state or deterministic setup is explicitly needed",
    ];
    forbidden = ["create PRD", "create SD", "create TP", "run Brownfield Analysis", "implement code", "claim QA or release readiness"];
    nextAllowedAction = "Draft the minimal UR for the request in the response, then ask for exact approval: Approval: UR. Do not write a full .agdf/control scaffold unless durable control state or deterministic setup is explicitly needed.";
  } else if (doctorBlocker && !routesInvalidVerifiedChange) {
    status = "blocked";
    blockingReason = doctorBlocker.code;
    allowed = ["repair the AGDF control scaffold", ...transitionDecision.allowed, "run doctor again"];
    forbidden = ["create later-gate artefacts beyond the current allowed gate", "implement gated work", "claim QA or release readiness"];
    nextAllowedAction = doctorBlocker.next_step;
  } else if (doctorRevise && !routesInvalidVerifiedChange) {
    status = "blocked";
    blockingReason = doctorRevise.code;
    allowed = [...new Set(["complete the current control-state fields", ...transitionDecision.allowed, "run doctor again"])];
    forbidden = ["create later-gate artefacts beyond the current allowed gate", "implement gated work before the gate allows it", "claim QA or release readiness"];
    nextAllowedAction = transitionDecision.current_gate === "UR"
      ? "Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR."
      : doctorRevise.next_step;
  }

  const postApproval = postApprovalTransition(missingApproval);

  return {
    schema_version: "1",
    status,
    current_gate: currentGate,
    blocking_reason: blockingReason,
    missing_approval: missingApproval,
    next_gate_after_approval: postApproval.next_gate_after_approval,
    allowed_after_approval: postApproval.allowed_after_approval,
    allowed,
    forbidden,
    next_allowed_action: nextAllowedAction,
    doctor_status: doctorReport.status,
    doctor_summary: doctorReport.summary,
    evidence_refs: runState.evidence_refs,
    quality_outlook: deriveQualityOutlook(runState, deliveryMap.findings),
    status_card: buildStatusCard({
      status,
      currentGate,
      allowed,
      forbidden,
      blockingReason,
      missingApproval,
      nextAllowedAction,
      runState,
      chatLanguage: resolveConfiguredChatLanguage(targetDir),
      findings: deliveryMap.findings,
    }),
    delivery_map: {
      relationships: deliveryMap.relationships,
      mode_slice_decision: runState.mode_slice_decision,
      context_graph: deliveryMap.context_graph,
      source_scope: deliveryMap.source_scope,
      memory: deliveryMap.memory,
      findings: deliveryMap.findings,
    },
    verified_change: verifiedChange,
    doctor_report: doctorReport,
  };
}

function printGateCheckStatusCard(report) {
  const card = report.status_card;
  const de = card.presentation_language === "de";
  const labels = de ? {
    title: "AGDF-Statuskarte",
    run: "Ausgewählter Run",
    gate: "Aktuelles Gate",
    blocked: "Blockiert durch",
    missing: "Fehlende Freigabe",
    outcome: "Ergebnis nach Freigabe",
    internal: "Interner nächster Schritt",
    userGate: "Nächstes User-Gate",
    userAction: "Nutzeraktion erforderlich",
    nextGate: "Nächstes Gate nach Freigabe",
    allowedAfter: "Nach Freigabe erlaubt",
    skill: "Nächster Skill",
    step: "Nächster Schritt",
    quality: "Qualitätsausblick",
    allowed: "Jetzt erlaubt",
    forbidden: "Aktuell verboten",
  } : {
    title: "AGDF status-card",
    run: "Selected run",
    gate: "Current gate",
    blocked: "Blocked by",
    missing: "Missing approval",
    outcome: "User-visible outcome after approval",
    internal: "Internal next step",
    userGate: "Next user gate",
    userAction: "User action required",
    nextGate: "Next gate after approval",
    allowedAfter: "Allowed after approval",
    skill: "Next skill",
    step: "Next step",
    quality: "Quality outlook",
    allowed: "Allowed now",
    forbidden: "Forbidden now",
  };
  console.log(`${labels.title}: ${card.status}`);
  console.log(`${labels.run}: ${card.run_id}`);
  console.log(`${labels.gate}: ${card.current_gate}`);
  console.log(`${labels.blocked}: ${card.blocking_condition}`);
  console.log(`${labels.missing}: ${card.missing_approval}`);
  console.log(`${labels.outcome}: ${card.user_visible_outcome_after_approval}`);
  console.log(`${labels.internal}: ${card.internal_next_step}`);
  console.log(`${labels.userGate}: ${card.next_user_gate}`);
  console.log(`${labels.userAction}: ${card.user_action_required}`);
  if (card.next_gate_after_approval !== "none") console.log(`${labels.nextGate}: ${card.next_gate_after_approval}`);
  if (card.allowed_after_approval !== "none") console.log(`${labels.allowedAfter}: ${card.allowed_after_approval}`);
  console.log(`${labels.skill}: ${card.next_skill}`);
  console.log(`${labels.step}: ${card.next_step}`);
  console.log(`${labels.quality}: ${card.quality_outlook}`);
  if (card.allowed_now.length > 0) console.log(`${labels.allowed}: ${card.allowed_now.join("; ")}`);
  if (card.forbidden_now.length > 0) console.log(`${labels.forbidden}: ${card.forbidden_now.join("; ")}`);
}

function printGateCheckReport(report, json, statusCard = false) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (statusCard) {
    printGateCheckStatusCard(report);
    return;
  }

  console.log(`AGDF gate-check: ${report.status}`);
  console.log(`Current gate: ${report.current_gate}`);
  console.log(`Blocking reason: ${report.blocking_reason}`);
  console.log(`Missing approval: ${report.missing_approval}`);
  console.log(`Quality outlook: ${report.quality_outlook}`);
  console.log(`Doctor: ${report.doctor_status} (${report.doctor_summary.findings} findings)`);
  console.log("");
  console.log("Allowed:");
  for (const item of report.allowed) console.log(`- ${item}`);
  console.log("");
  console.log("Forbidden:");
  for (const item of report.forbidden) console.log(`- ${item}`);
  console.log("");
  console.log(`Next allowed action: ${report.next_allowed_action}`);
}

function readBacklogPointers(targetDir) {
  const backlogPath = join(".agdf", "control", "MASTER_BACKLOG.md");
  if (!existsSync(join(targetDir, backlogPath))) return [];

  const backlog = readTargetFile(targetDir, backlogPath);
  const activeSection = markdownSection(backlog, "Active Backlog");
  return parseBacklogSection(activeSection);
}

function evaluateDeliveryMap(targetDir, selection = {}) {
  if (selection.allActive) {
    const selected = resolveRuns(targetDir, { allActive: true });
    const runs = selected.runs.map((run) => ({
      run_id: run.run_id,
      report: evaluateDeliveryMap(targetDir, { runId: run.run_id }),
    }));
    const status = selected.findings.length
      ? "block"
      : aggregate(
          runs.map((item) => ({
            run_id: item.run_id,
            status: item.report.status,
          })),
          { allowNoActiveRuns: allowNoActiveRuns(targetDir) },
        ).status;
    const findings = [
      ...selected.findings.map((finding) => ({
        ...finding,
        severity: "block",
        message: "Invalid canonical run entry.",
        next_step: "Repair or remove the invalid run entry.",
      })),
      ...runs.flatMap((item) =>
        (item.report.doctor_report?.findings ?? item.report.findings).map((finding) => ({
          ...finding,
          run_id: item.run_id,
        })),
      ),
    ];
    return {
      schema_version: "1",
      status,
      current_gate: "all-active",
      next_allowed_action: runs.length
        ? "Resolve per-run findings."
        : "Create or activate a governed run.",
      quality_outlook: "Keep every active run independently actionable.",
      relationships: runs.flatMap((item) => item.report.relationships),
      findings,
      runs,
    };
  }
  const doctorReport = evaluateDoctor(targetDir, selection);
  const runState = readRunState(targetDir, selection);
  const map = analyzeDeliveryMap(runState);
  const gateDecision = transitionDecisionForRunState(runState);
  const currentGate = gateDecision.current_gate;

  const severityRank = { block: 3, revise: 2, warn: 1 };
  const deliverySeverity = map.findings.reduce((max, finding) => Math.max(max, severityRank[finding.severity] ?? 0), 0);
  const doctorSeverity = severityRank[doctorReport.status] ?? 0;
  const maxSeverity = Math.max(deliverySeverity, doctorSeverity);
  const status = maxSeverity >= 3 ? "block" : maxSeverity === 2 ? "revise" : maxSeverity === 1 ? "warn" : "pass";

  const qualityOutlook = deriveQualityOutlook(runState, map.findings);
  const nextAllowedAction = isPlaceholderValue(runState.next_allowed_action) ? gateDecision.next_allowed_action : runState.next_allowed_action;
  const postApproval = postApprovalTransition(gateDecision.missing_approval);

  return {
    schema_version: "1",
    status,
    checked_at: new Date().toISOString(),
    target_dir: targetDir,
    current_gate: currentGate,
    next_allowed_action: nextAllowedAction,
    next_gate_after_approval: postApproval.next_gate_after_approval,
    allowed_after_approval: postApproval.allowed_after_approval,
    quality_outlook: qualityOutlook,
    status_card: buildStatusCard({
      status,
      currentGate,
      allowed: gateDecision.allowed,
      forbidden: gateDecision.forbidden,
      blockingReason: gateDecision.blocking_reason,
      missingApproval: gateDecision.missing_approval,
      nextAllowedAction,
      runState,
      chatLanguage: resolveConfiguredChatLanguage(targetDir),
      findings: map.findings,
    }),
    backlog_pointers: readBacklogPointers(targetDir),
    artefacts: Object.fromEntries([...runState.artefacts.entries()]),
    approvals: Object.fromEntries([...runState.approvals.entries()]),
    mode_slice_decision: runState.mode_slice_decision,
    relationships: map.relationships,
    evidence_refs: runState.evidence_refs,
    missing_evidence: map.missing_evidence,
    risks: map.risks,
    context_graph: map.context_graph,
    source_scope: map.source_scope,
    memory: map.memory,
    findings: map.findings,
    doctor_status: doctorReport.status,
    doctor_summary: doctorReport.summary,
    doctor_report: doctorReport,
  };
}

function printDeliveryMapReport(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`AGDF delivery-map: ${report.status}`);
  console.log(`Current gate: ${report.current_gate}`);
  console.log(`Next allowed action: ${report.next_allowed_action}`);
  console.log(`Quality outlook: ${report.quality_outlook}`);
  console.log(`Relationships: ${report.relationships.filter((item) => item.status === "pass").length}/${report.relationships.length} evidenced`);
  console.log(`Findings: ${report.findings.length}`);

  for (const finding of report.findings) {
    console.log("");
    console.log(`[${finding.severity}] ${finding.code}`);
    console.log(finding.message);
    console.log(`Next step: ${finding.next_step}`);
  }
}

async function executeDeliveryPathSearch(options) {
  const fixture = options.fixture ? JSON.parse(readFileSync(options.fixture, "utf8")) : null;
  const enforcement = fixture?.input?.enforcement ?? enforcementForSurface(options.surface);
  const fixtureGeneration = fixture?.generator_response;
  const generationEnabled = Boolean(fixtureGeneration || options.generateCandidates);
  const baseInput = fixture?.input ?? searchInputFromControl(options.dir, {
    scopeKey: options.runId,
    enforcement,
    generation: generationEnabled ? {
      enabled: true,
      maxProposals: options.maxGeneratedCandidates,
      maxDurationMs: options.generationTimeoutMs,
      maxCostUnits: options.generationCostUnits,
    } : undefined,
  });
  const input = generationEnabled && !baseInput.generation ? {
    ...baseInput,
    generation: {
      enabled: true,
      max_calls: 1,
      max_proposals: options.maxGeneratedCandidates,
      max_duration_ms: options.generationTimeoutMs,
      max_cost_units: options.generationCostUnits,
    },
  } : baseInput;
  const evaluator = fixture
    ? fixtureEvaluator(fixture.evaluations ?? {})
    : options.surface === "codex"
      ? codexEvaluator({ cwd: options.dir, model: options.model })
      : options.surface === "claude"
        ? claudeEvaluator({ cwd: options.dir, model: options.model })
        : null;
  if (!evaluator) {
    throw new Error(`${options.surface} has no executable evaluator in this release. Codex and Claude are the reference adapters; --fixture is available for deterministic contract testing.`);
  }
  const generator = fixtureGeneration
    ? fixtureGenerator(fixtureGeneration)
    : options.generateCandidates && options.surface === "codex"
      ? codexGenerator({ cwd: options.dir, model: options.generatorModel, timeoutMs: options.generationTimeoutMs })
      : options.generateCandidates && options.surface === "claude"
        ? claudeGenerator({ cwd: options.dir, model: options.generatorModel, timeoutMs: options.generationTimeoutMs })
        : null;
  if (options.generateCandidates && !generator) {
    throw new Error(`${options.surface} has no executable candidate generator; Codex and Claude are tool-enforced reference transports.`);
  }
  const result = await runDeliveryPathSearch(input, evaluator, { candidates: fixture?.candidates, generator });
  if (options.persist) result.persistence = persistSearchResult(options.dir, result);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return result;
  }
  console.log(`AGDF Delivery Path Search: ${result.status}`);
  console.log(`Current gate: ${result.current_gate}`);
  console.log(`Enforcement: ${result.enforcement.level}`);
  console.log(`Recommendation: ${result.recommendation?.action ?? "none"}`);
  console.log(`Evaluations: ${result.budgets.evaluations}`);
  console.log(`Generation: ${result.generation.status} (${result.generation.accepted}/${result.generation.returned} accepted)`);
  console.log(`Generation budget: ${result.generation.cost_units} cost units, ${result.generation.duration_ms} ms`);
  if (result.generation.failure_code) console.log(`Generation failure: ${result.generation.failure_code}`);
  console.log(`Stopping reason: ${result.stopping_reason}`);
  console.log(result.next_gate_action);
  return result;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (
    options.allActive &&
    !["doctor", "delivery-map"].includes(options.target)
  ) {
    throw new Error(
      "--all-active is supported only by doctor and delivery-map",
    );
  }

  if (options.target === "run-create") {
    if (!options.runId || options.allActive)
      throw new Error("run-create requires --run and rejects --all-active");
    console.log(createRun(options.dir, options.runId));
    return;
  }
  if (options.target === "run-migrate") {
    console.log(
      JSON.stringify(migrateLegacy(options.dir, options.runId), null, 2),
    );
    return;
  }
  if (options.target === "run-render-legacy") {
    if (!options.runId) throw new Error("run-render-legacy requires --run");
    const selected = resolveRuns(options.dir, { runIdArg: options.runId });
    const output = join(options.dir, ".agdf", "control", "AGDF_RUN.md");
    writeLegacyProjection(output, selected.run.path);
    console.log(output);
    return;
  }

  if (options.target === "doctor") {
    const report = evaluateDoctor(options.dir, options);
    printDoctorReport(report, options.json);
    process.exit(report.status === "block" ? 2 : 0);
  }

  if (options.target === "gate-check") {
    const report = evaluateGateCheck(options.dir, options);
    printGateCheckReport(report, options.json, options.statusCard);
    process.exit(report.status === "blocked" ? 2 : 0);
  }

  if (options.target === "delivery-map") {
    const report = evaluateDeliveryMap(options.dir, options);
    printDeliveryMapReport(report, options.json);
    process.exit(report.status === "block" ? 2 : 0);
  }

  if (options.target === "delivery-path-search") {
    try {
      const result = await executeDeliveryPathSearch(options);
      process.exitCode = result.status === "recommendation" ? 0 : 2;
    } catch (error) {
      console.error(`Delivery Path Search failed: ${error.message}`);
      process.exitCode = 2;
    }
    return;
  }

  if (options.target === "opencode-status") {
    const configDir = process.env.OPENCODE_CONFIG_DIR || defaultOpenCodeConfigDir();
    const report = evaluateOpenCodeStatus(options.dir, configDir);
    printOpenCodeStatus(report, options.json);
    process.exit(report.status === "configured" ? 0 : 1);
  }

  if (options.target === "codex") {
    try {
      installCodexGlobalPlugin();
      console.log("AGDF Codex plugin installed globally.");
      console.log("Run npx --yes @agdf/cli@latest codex-repo in a repository when you want to test AGDF from repository-local plugin files.");
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
    return;
  }

  if (options.target === "claude") {
    try {
      installClaudeGlobalPlugin();
      console.log("AGDF Claude Code plugin installed globally.");
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
    return;
  }

  if (options.target === "opencode") {
    const configDir = options.dirExplicit ? options.dir : defaultOpenCodeConfigDir();
    try {
      const result = installOpenCodeGlobalPlugin(configDir);
      installOpenCodeGlobalSurface(configDir);
      console.log(`AGDF OpenCode global plugin ${result.added ? "installed" : "already present"}: ${result.configPath}`);
      const report = evaluateOpenCodeStatus(options.dir, configDir, result.transition);
      printOpenCodeStatus(report, false);
      console.log("Restart OpenCode so it loads the updated global plugin config.");
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
    return;
  }

  const files = generatedFilesForTarget(options.target, options.dir, options.force, options.language);
  const wroteAgentsFragment = files.some(file => file.path === agdfFragmentPath);
  const wroteOpenCodeConfigFragment = files.some(file => file.path === openCodeConfigFragmentPath);
  let removedOpenCodeAgents = [];

  try {
    assertGeneratedWritePlan(options.dir, files, options.force);
    for (const file of files) {
      writeGeneratedFile(options.dir, file.path, file.content, options.force, file.allowOverwrite);
    }
    if (options.target === "opencode-repo") {
      removedOpenCodeAgents = removeOwnedLegacyOpenCodeAgents(options.dir);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  printNextSteps(options.target, options.dir, files, wroteAgentsFragment, wroteOpenCodeConfigFragment, removedOpenCodeAgents);
}

await main();
