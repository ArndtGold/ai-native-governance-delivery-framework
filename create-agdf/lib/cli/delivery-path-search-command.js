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
  const surface = options.surface ?? "opencode";
  const mutation = error?.code === "OPENCODE_EVALUATOR_MUTATION_DETECTED";
  const attempted = Boolean(input && error);
  const nextAction = mutation
    ? "Investigate and revert the detected repository mutation before any evaluator fallback or retry."
    : "Repair the reported OpenCode capability and retry, or use the existing instruction-only Delivery Path Search workflow.";
  return {
    contract_version: "1",
    surface,
    scope_key: input?.scope_key ?? options.runId ?? null,
    scope_revision: input?.scope_revision ?? "unversioned",
    objective: input?.objective ?? "Delivery Path Search evaluator capability",
    current_gate: input?.current_gate ?? null,
    outcome_phase: "evaluation",
    status: mutation ? "evaluator_error" : "evaluator_unavailable",
    recommendation: null,
    enforcement: enforcementForSurface(surface),
    evaluator: {
      name: surface,
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
    provenance: {
      baseline_candidates: Math.min(input?.allowed_actions?.length ?? 0, input?.budgets?.max_candidates ?? 0),
      generated_candidates: 0,
      legal_candidates: attempted ? 1 : 0,
      rejected_candidates: 0,
      evaluation_attempts: attempted ? 1 : 0,
      valid_evaluations: 0,
      invalid_evaluations: attempted ? 1 : 0,
    },
    failure_code: error?.code ?? preflight?.code,
    stopping_reason: mutation ? "opencode_mutation_detected" : attempted ? "opencode_evaluator_failed" : "opencode_preflight_failed",
    next_action: nextAction,
    next_gate_action: nextAction,
  };
}

export async function executeDeliveryPathSearch(options, io = console, dependencies = {}) {
  const fixture = options.fixture ? JSON.parse(readFileSync(options.fixture, "utf8")) : null;
  const fixtureGeneration = fixture?.generator_response;
  const generationEnabled = Boolean(fixtureGeneration || options.generateCandidates);
  const initialEnforcement = fixture?.input?.enforcement ?? enforcementForSurface(options.surface);
  const initialInput = fixture?.input ?? (dependencies.searchInputFromControl ?? searchInputFromControl)(options.dir, {
    scopeKey: options.runId,
    enforcement: initialEnforcement,
    generation: generationEnabled ? {
      enabled: true,
      maxProposals: options.maxGeneratedCandidates,
      maxDurationMs: options.generationTimeoutMs,
      maxCostUnits: options.generationCostUnits,
    } : undefined,
  });
  const preflight = !fixture && options.surface === "opencode"
    ? (dependencies.preflightOpenCodeEvaluator ?? preflightOpenCodeEvaluator)({ cwd: options.dir })
    : null;
  if (preflight?.status === "failed") {
    const result = initialInput.input_failure_code
      ? await runDeliveryPathSearch(initialInput, { name: "not-invoked", async evaluate() { throw new Error("input failure must stop before evaluation"); } })
      : unavailableOpenCodeResult({ options, preflight, input: initialInput });
    printDeliveryPathSearchResult(result, options, io);
    return result;
  }
  const enforcement = fixture?.input?.enforcement
    ?? (preflight
      ? enforcementForSurface("opencode", preflight.evidence, { preflight })
      : enforcementForSurface(options.surface));
  const baseInput = fixture ? initialInput : { ...initialInput, enforcement };
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
    const detail = `${options.surface} has no executable evaluator in this release. Codex, Claude and preflight-qualified OpenCode are the executable adapters; --fixture is available for deterministic contract testing.`;
    const result = {
      ...unavailableOpenCodeResult({ options, preflight: { code: "surface_evaluator_unavailable", detail, evidence: [] }, input }),
      surface: options.surface,
    };
    printDeliveryPathSearchResult(result, options, io);
    return result;
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
  io.log(`Scope: ${result.scope_key ?? "unknown"} @ ${result.scope_revision ?? "unversioned"}`);
  if (result.objective) io.log(`Objective: ${result.objective}`);
  io.log(`Current gate: ${result.current_gate ?? "unknown"}`);
  io.log(`Outcome phase: ${result.outcome_phase ?? "unknown"}`);
  io.log(`Enforcement: ${result.enforcement.level}`);
  io.log(`Recommendation: ${result.recommendation?.action ?? "none"}`);
  if (result.budgets) io.log(`Evaluations: ${result.budgets.evaluations}`);
  if (result.provenance) {
    io.log(`Candidates: ${result.provenance.legal_candidates} legal, ${result.provenance.rejected_candidates} rejected`);
    io.log(`Evaluation provenance: ${result.provenance.valid_evaluations}/${result.provenance.evaluation_attempts} valid, ${result.provenance.invalid_evaluations} invalid`);
  }
  if (result.generation) {
    io.log(`Generation: ${result.generation.status} (${result.generation.accepted}/${result.generation.returned} accepted)`);
    io.log(`Generation budget: ${result.generation.cost_units} cost units, ${result.generation.duration_ms} ms`);
    if (result.generation.failure_code) io.log(`Generation failure: ${result.generation.failure_code}`);
  }
  io.log(`Stopping reason: ${result.stopping_reason}`);
  if (result.failure_code) io.log(`Failure: ${result.failure_code}`);
  io.log(result.next_action ?? result.next_gate_action);
}
