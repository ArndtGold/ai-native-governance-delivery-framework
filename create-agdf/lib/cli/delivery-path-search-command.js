import { readFileSync } from 'node:fs';
import { searchInputFromControl } from '../delivery-path-search/state-adapter.js';
import { runDeliveryPathSearch } from '../delivery-path-search/search-engine.js';
import { codexEvaluator } from '../delivery-path-search/evaluators/codex.js';
import { claudeEvaluator } from '../delivery-path-search/evaluators/claude.js';
import { openCodeEvaluator, preflightOpenCodeEvaluator } from '../delivery-path-search/evaluators/opencode.js';
import { fixtureEvaluator } from '../delivery-path-search/evaluators/protocol.js';
import { codexGenerator } from '../delivery-path-search/generators/codex.js';
import { claudeGenerator } from '../delivery-path-search/generators/claude.js';
import { fixtureGenerator } from '../delivery-path-search/generators/protocol.js';
import { enforcementForSurface } from '../delivery-path-search/surfaces/capabilities.js';
import { persistSearchResult } from '../delivery-path-search/persistence.js';

function unavailableOpenCodeResult({ options, preflight, input = null, error = null }) {
  const mutation = error?.code === "OPENCODE_EVALUATOR_MUTATION_DETECTED";
  const attempted = Boolean(input);
  const nextAction = mutation
    ? "Investigate and revert the detected repository mutation before any evaluator fallback or retry."
    : "Repair the reported OpenCode capability and retry, or use the existing instruction-only Delivery Path Search workflow.";
  return {
    contract_version: "1",
    surface: "opencode",
    scope_key: input?.scope_key ?? options.runId ?? null,
    current_gate: input?.current_gate ?? null,
    status: mutation ? "evaluator_error" : "evaluator_unavailable",
    recommendation: null,
    enforcement: enforcementForSurface("opencode"),
    evaluator: {
      name: "opencode",
      preflight: preflight?.code ?? "not_run",
      failure_code: error?.code ?? preflight?.code,
      detail: error?.message ?? preflight?.detail,
      evidence: preflight?.evidence ?? [],
    },
    executable_evaluator: {
      attempted,
      preflight: preflight?.status ?? "failed",
      failure_code: error?.code ?? preflight?.code,
      evidence: preflight?.evidence ?? [],
    },
    stopping_reason: mutation ? "opencode_mutation_detected" : attempted ? "opencode_evaluator_failed" : "opencode_preflight_failed",
    next_action: nextAction,
    next_gate_action: nextAction,
  };
}

export async function executeDeliveryPathSearch(options, io = console, dependencies = {}) {
  const fixture = options.fixture ? JSON.parse(readFileSync(options.fixture, "utf8")) : null;
  const preflight = !fixture && options.surface === "opencode"
    ? (dependencies.preflightOpenCodeEvaluator ?? preflightOpenCodeEvaluator)({ cwd: options.dir })
    : null;
  if (preflight?.status === "failed") {
    const result = unavailableOpenCodeResult({ options, preflight });
    printDeliveryPathSearchResult(result, options, io);
    return result;
  }
  const enforcement = fixture?.input?.enforcement
    ?? (preflight
      ? enforcementForSurface("opencode", preflight.evidence, { preflight })
      : enforcementForSurface(options.surface));
  const fixtureGeneration = fixture?.generator_response;
  const generationEnabled = Boolean(fixtureGeneration || options.generateCandidates);
  const baseInput = fixture?.input ?? (dependencies.searchInputFromControl ?? searchInputFromControl)(options.dir, {
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
        : options.surface === "opencode"
          ? (dependencies.openCodeEvaluator ?? openCodeEvaluator)({ cwd: options.dir, model: options.model, preflight })
          : null;
  if (!evaluator) {
    throw new Error(`${options.surface} has no executable evaluator in this release. Codex, Claude and preflight-qualified OpenCode are the executable adapters; --fixture is available for deterministic contract testing.`);
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
  let result;
  try {
    result = await (dependencies.runDeliveryPathSearch ?? runDeliveryPathSearch)(input, evaluator, { candidates: fixture?.candidates, generator });
    if (!fixture && options.surface === "opencode" && result.budgets?.evaluations === 0) {
      result.enforcement = enforcementForSurface("opencode");
    }
  } catch (error) {
    if (!error?.fatalEvaluator || options.surface !== "opencode") throw error;
    result = unavailableOpenCodeResult({ options, preflight, input, error });
  }
  if (options.persist && ["recommendation", "no_safe_recommendation"].includes(result.status)) {
    result.persistence = (dependencies.persistSearchResult ?? persistSearchResult)(options.dir, result);
  }
  printDeliveryPathSearchResult(result, options, io);
  return result;
}

function printDeliveryPathSearchResult(result, options, io) {
  if (options.json) {
    io.log(JSON.stringify(result, null, 2));
    return;
  }
  io.log(`AGDF Delivery Path Search: ${result.status}`);
  io.log(`Current gate: ${result.current_gate ?? "unknown"}`);
  io.log(`Enforcement: ${result.enforcement.level}`);
  io.log(`Recommendation: ${result.recommendation?.action ?? "none"}`);
  if (result.budgets) io.log(`Evaluations: ${result.budgets.evaluations}`);
  if (result.generation) {
    io.log(`Generation: ${result.generation.status} (${result.generation.accepted}/${result.generation.returned} accepted)`);
    io.log(`Generation budget: ${result.generation.cost_units} cost units, ${result.generation.duration_ms} ms`);
    if (result.generation.failure_code) io.log(`Generation failure: ${result.generation.failure_code}`);
  }
  io.log(`Stopping reason: ${result.stopping_reason}`);
  io.log(result.next_gate_action);
}
