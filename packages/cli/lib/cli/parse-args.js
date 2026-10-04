import { isAbsolute, resolve } from "node:path";
import process from "node:process";
import { configuredLanguage, resolveLanguagePreference } from "./runtime-context.js";
import { resolveCommand, supportedCommandNames } from "./command-registry.js";

export class CliUsageError extends Error {
  constructor(message, { showUsage = false } = {}) {
    super(message);
    this.name = "CliUsageError";
    this.exitCode = 1;
    this.showUsage = showUsage;
  }
}

const STEP_FIELD_FLAGS = new Map(["title", "route", "reason", "evidence", "source", "covers", "decision", "result", "risk", "next"]
  .map((name) => [`--${name}`, name]));

function requiredValue(args, index, option) {
  const next = args[index + 1];
  if (!next) throw new CliUsageError(`Missing value for ${option}`);
  return next;
}

export function parseArgs(argv, dependencies = {}) {
  const cwd = dependencies.cwd ?? process.cwd();
  const workingDirectorySource = dependencies.cwdSource ?? "process_cwd";
  if (!new Set(["npm_init_cwd", "process_cwd"]).has(workingDirectorySource)) {
    throw new CliUsageError("Invalid invocation directory source.");
  }
  const languagePreference = dependencies.resolveLanguagePreference ?? resolveLanguagePreference;
  const normalizeLanguage = dependencies.configuredLanguage ?? configuredLanguage;
  const args = [...argv];
  let target;
  let dir = ".";
  let dirInput = ".";
  let force = false;
  let json = false;
  let verbose = false;
  let guided = false;
  let details = false;
  let statusCard = false;
  let approvalEnvelope = false;
  let language;
  let languageExplicit = false;
  let dirExplicit = false;
  let surface = "generic";
  let surfaceExplicit = false;
  let skillId;
  let intake = false;
  let urAction;
  let prdAction;
  let intakeMode;
  let continueDelivery = false;
  let presentationId;
  let operationId, assurance;
  let fixture;
  let persist = false;
  let model;
  let generateCandidates = false;
  let generatorModel;
  let maxGeneratedCandidates = 5;
  let generationTimeoutMs = 30000;
  let generationCostUnits = 5;
  let runId;
  let gate;
  let revisionId;
  let response;
  let contractModule;
  let runStep;
  let recoveryAction;
  let recoveryPreviewId;
  let recoveryConfirmation;
  const stepFields = {};
  let allActive = false;
  let scope;
  let confirm = false;
  let shared = false;
  let runtimeChecksDecision;
  let acceptPluginCapabilities = false;
  let runtimeChecksAction;
  let mcpAction;
  let mcpScope;
  let setupRequest;
  let controlDir;
  let controlMigration;
  let targetSource;
  let primaryTarget;
  let workingDirectory = cwd;
  let workingDirectoryExplicit = false;
  let targetChanged = false;
  const targetCandidates = [];
  const evidenceSources = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg) continue;
    if (arg === "--help" || arg === "-h") return { kind: "help" };
    if (arg === "--force") { force = true; continue; }
    if (arg === "--json") { json = true; continue; }
    if (arg === "--verbose") { verbose = true; continue; }
    if (arg === "--guided") { guided = true; continue; }
    if (arg === "--details") { details = true; continue; }
    if (arg === "--status-card") { statusCard = true; continue; }
    if (arg === "--approval-envelope") { approvalEnvelope = true; continue; }
    if (arg === "--persist") { persist = true; continue; }
    if (arg === "--generate-candidates") { generateCandidates = true; continue; }
    if (arg === "--all-active") { allActive = true; continue; }
    if (arg === "--confirm") { confirm = true; continue; }
    if (arg === "--shared") { shared = true; continue; }
    if (arg === "--accept-plugin-capabilities") { acceptPluginCapabilities = true; continue; }
    if (arg === "--target-changed") { targetChanged = true; continue; }
    if (arg === "--with-mcp") {
      if (setupRequest === "plugin_only") throw new CliUsageError("--with-mcp and --plugin-only cannot be combined.");
      setupRequest = "full";
      continue;
    }
    if (arg === "--plugin-only") {
      if (setupRequest === "full") throw new CliUsageError("--with-mcp and --plugin-only cannot be combined.");
      setupRequest = "plugin_only";
      continue;
    }

    if (arg === "--runtime-checks") {
      const next = requiredValue(args, i, arg);
      if (!["enable", "manual", "cancel"].includes(next)) throw new CliUsageError("--runtime-checks must be enable, manual or cancel.");
      runtimeChecksDecision = next;
      i += 1;
      continue;
    }

    if (arg === "--control-dir" || arg === "--control-migration") {
      const next = requiredValue(args, i, arg);
      if (arg === "--control-dir") {
        if (!isAbsolute(next)) throw new CliUsageError("--control-dir requires an absolute repository path.");
        controlDir = next;
      } else {
        if (!["inspect", "safe"].includes(next)) throw new CliUsageError("--control-migration must be inspect or safe.");
        controlMigration = next;
      }
      i += 1;
      continue;
    }

    if (arg === "--run") {
      runId = requiredValue(args, i, arg);
      i += 1;
      continue;
    }

    if (arg === "--step") {
      runStep = requiredValue(args, i, arg);
      i += 1;
      continue;
    }
    if (arg === "--action") {
      recoveryAction = requiredValue(args, i, arg);
      i += 1;
      continue;
    }
    if (arg === "--preview-id" || arg === "--recovery-confirmation") {
      const value = requiredValue(args, i, arg);
      if (arg === "--preview-id") recoveryPreviewId = value;
      else recoveryConfirmation = value;
      i += 1;
      continue;
    }

    if (STEP_FIELD_FLAGS.has(arg)) {
      stepFields[STEP_FIELD_FLAGS.get(arg)] = requiredValue(args, i, arg);
      i += 1;
      continue;
    }

    if (arg === "--module") {
      contractModule = requiredValue(args, i, arg);
      i += 1;
      continue;
    }

    if (["--gate", "--revision", "--response"].includes(arg)) {
      const next = requiredValue(args, i, arg);
      if (arg === "--gate") gate = next;
      else if (arg === "--revision") revisionId = next;
      else response = next;
      i += 1;
      continue;
    }

    if (arg === "--operation" || arg === "--assurance") {
      const value = requiredValue(args, i, arg);
      if (arg === "--operation") operationId = value;
      else assurance = value;
      i += 1;
      continue;
    }

    if (arg === "--skill") {
      skillId = requiredValue(args, i, arg);
      i += 1;
      continue;
    }

    if (arg === "--intake-mode" || arg === "--ur-action" || arg === "--prd-action" || arg === "--presentation") {
      const value = requiredValue(args, i, arg);
      if (arg === "--intake-mode") intakeMode = value;
      else if (arg === "--ur-action") urAction = value;
      else if (arg === "--prd-action") prdAction = value;
      else presentationId = value;
      i += 1;
      continue;
    }
    if (arg === "--continue-delivery") { continueDelivery = true; continue; }
    if (arg === "--intake") {
      intake = true;
      continue;
    }

    if (["--target-source", "--primary-target", "--working-directory", "--target-candidate", "--evidence-source"].includes(arg)) {
      const next = requiredValue(args, i, arg);
      if (arg === "--target-source") targetSource = next;
      else if (arg === "--primary-target") primaryTarget = next;
      else if (arg === "--working-directory") { workingDirectory = next; workingDirectoryExplicit = true; }
      else if (arg === "--target-candidate") targetCandidates.push(next);
      else evidenceSources.push(next);
      i += 1;
      continue;
    }

    if (["--surface", "--scope", "--mcp-scope", "--fixture", "--model", "--generator-model", "--max-generated-candidates", "--generation-timeout-ms", "--generation-cost-units"].includes(arg)) {
      const next = requiredValue(args, i, arg);
      if (arg === "--surface") {
        if (!["codex", "claude", "copilot", "opencode", "generic"].includes(next)) {
          throw new CliUsageError("Unsupported surface. Use codex, claude, copilot, opencode or generic.");
        }
        surface = next;
        surfaceExplicit = true;
      } else if (arg === "--scope") {
        if (!["repository", "global", "project", "user"].includes(next)) throw new CliUsageError("Unsupported scope. Use repository, global, project or user.");
        scope = next;
      } else if (arg === "--mcp-scope") {
        if (!["project", "user"].includes(next)) throw new CliUsageError("Unsupported MCP scope. Use project or user.");
        mcpScope = next;
      } else if (arg === "--fixture") fixture = next;
      else if (arg === "--model") model = next;
      else if (arg === "--generator-model") generatorModel = next;
      else {
        const value = Number(next);
        const maximum = arg === "--generation-timeout-ms" ? 30000 : 5;
        if (!Number.isInteger(value) || value < 1 || value > maximum) {
          throw new CliUsageError(`${arg} must be an integer from 1 to ${maximum}.`);
        }
        if (arg === "--max-generated-candidates") maxGeneratedCandidates = value;
        else if (arg === "--generation-timeout-ms") generationTimeoutMs = value;
        else generationCostUnits = value;
      }
      i += 1;
      continue;
    }

    if (arg === "--language" || arg === "--lang") {
      const next = requiredValue(args, i, arg);
      const normalized = normalizeLanguage(next);
      if (!normalized) throw new CliUsageError("Invalid language tag. Use a BCP 47 tag such as de, en or fr-CA.");
      language = normalized;
      languageExplicit = true;
      i += 1;
      continue;
    }

    if (arg === "--dir") {
      dirInput = requiredValue(args, i, arg);
      dir = dirInput;
      dirExplicit = true;
      i += 1;
      continue;
    }

    if (arg === "--target" || arg === "-t") {
      target = requiredValue(args, i, arg);
      i += 1;
      continue;
    }

    if (!arg.startsWith("-") && !target) {
      target = arg;
      continue;
    }
    if (!arg.startsWith("-") && target === "runtime-checks" && !runtimeChecksAction) {
      if (!["status", "enable", "manual"].includes(arg)) throw new CliUsageError("runtime-checks action must be status, enable or manual.");
      runtimeChecksAction = arg;
      continue;
    }
    if (!arg.startsWith("-") && target === "mcp" && !mcpAction) {
      if (!["status", "enable", "disable"].includes(arg)) throw new CliUsageError("mcp action must be status, enable or disable.");
      mcpAction = arg;
      continue;
    }
    throw new CliUsageError(`Unknown argument: ${arg}`);
  }

  if (!target || !resolveCommand(target)) {
    throw new CliUsageError(`Please choose one target: ${supportedCommandNames().join(", ")}.`, { showUsage: true });
  }

  return {
    kind: "command",
    options: {
      target,
      dir: resolve(cwd, dir),
      dirInput,
      dirInputAbsolute: dirExplicit && isAbsolute(dirInput),
      force,
      json,
      verbose,
      ...(guided ? { guided: true } : {}),
      ...(details ? { details: true } : {}),
      statusCard,
      approvalEnvelope,
      dirExplicit,
      language: languagePreference(language),
      languageExplicit,
      surface,
      surfaceExplicit,
      skillId,
      intake,
      intakeMode,
    urAction,
    prdAction,
      continueDelivery,
      presentationId,
      ...(operationId !== undefined ? { operationId } : {}),
      ...(assurance !== undefined ? { assurance } : {}),
      fixture: fixture ? resolve(cwd, fixture) : null,
      persist,
      model,
      generateCandidates,
      runId,
      gate,
      revisionId,
      response,
      contractModule,
      runStep,
      recoveryAction,
      recoveryPreviewId,
      recoveryConfirmation,
      stepFields,
      allActive,
      scope,
      confirm,
      shared,
      runtimeChecksDecision,
      acceptPluginCapabilities,
      runtimeChecksAction: runtimeChecksAction ?? "status",
      mcpAction,
      mcpScope,
      setupRequest,
      controlDir,
      controlMigration,
      generatorModel,
      maxGeneratedCandidates,
      generationTimeoutMs,
      generationCostUnits,
      targetSource,
      primaryTarget,
      workingDirectory: isAbsolute(workingDirectory) ? workingDirectory : resolve(cwd, workingDirectory),
      workingDirectorySource,
      workingDirectoryExplicit,
      targetChanged,
      targetCandidates,
      evidenceSources,
    },
  };
}
