import { resolve } from "node:path";
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

function requiredValue(args, index, option) {
  const next = args[index + 1];
  if (!next) throw new CliUsageError(`Missing value for ${option}`);
  return next;
}

export function parseArgs(argv, dependencies = {}) {
  const cwd = dependencies.cwd ?? process.cwd();
  const languagePreference = dependencies.resolveLanguagePreference ?? resolveLanguagePreference;
  const normalizeLanguage = dependencies.configuredLanguage ?? configuredLanguage;
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
  let scope;
  let confirm = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg) continue;
    if (arg === "--help" || arg === "-h") return { kind: "help" };
    if (arg === "--force") { force = true; continue; }
    if (arg === "--json") { json = true; continue; }
    if (arg === "--status-card") { statusCard = true; continue; }
    if (arg === "--persist") { persist = true; continue; }
    if (arg === "--generate-candidates") { generateCandidates = true; continue; }
    if (arg === "--all-active") { allActive = true; continue; }
    if (arg === "--confirm") { confirm = true; continue; }

    if (arg === "--run") {
      runId = requiredValue(args, i, arg);
      i += 1;
      continue;
    }

    if (["--surface", "--scope", "--fixture", "--model", "--generator-model", "--max-generated-candidates", "--generation-timeout-ms", "--generation-cost-units"].includes(arg)) {
      const next = requiredValue(args, i, arg);
      if (arg === "--surface") {
        if (!["codex", "claude", "copilot", "opencode", "generic"].includes(next)) {
          throw new CliUsageError("Unsupported surface. Use codex, claude, copilot, opencode or generic.");
        }
        surface = next;
      } else if (arg === "--scope") {
        if (!["repository", "global"].includes(next)) throw new CliUsageError("Unsupported scope. Use repository or global.");
        scope = next;
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
      i += 1;
      continue;
    }

    if (arg === "--dir") {
      dir = requiredValue(args, i, arg);
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
      force,
      json,
      statusCard,
      dirExplicit,
      language: languagePreference(language),
      surface,
      fixture: fixture ? resolve(cwd, fixture) : null,
      persist,
      model,
      generateCandidates,
      runId,
      allActive,
      scope,
      confirm,
      generatorModel,
      maxGeneratedCandidates,
      generationTimeoutMs,
      generationCostUnits,
    },
  };
}
