import { readFileSync } from 'node:fs';
import { searchInputFromControl } from '../delivery-path-search/state-adapter.js';
import { runDeliveryPathSearch } from '../delivery-path-search/search-engine.js';
import { codexEvaluator } from '../delivery-path-search/evaluators/codex.js';
import { claudeEvaluator } from '../delivery-path-search/evaluators/claude.js';
import { fixtureEvaluator } from '../delivery-path-search/evaluators/protocol.js';
import { codexGenerator } from '../delivery-path-search/generators/codex.js';
import { claudeGenerator } from '../delivery-path-search/generators/claude.js';
import { fixtureGenerator } from '../delivery-path-search/generators/protocol.js';
import { enforcementForSurface } from '../delivery-path-search/surfaces/capabilities.js';
import { persistSearchResult } from '../delivery-path-search/persistence.js';

export async function executeDeliveryPathSearch(options, io = console) {
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
    io.log(JSON.stringify(result, null, 2));
    return result;
  }
  io.log(`AGDF Delivery Path Search: ${result.status}`);
  io.log(`Current gate: ${result.current_gate}`);
  io.log(`Enforcement: ${result.enforcement.level}`);
  io.log(`Recommendation: ${result.recommendation?.action ?? "none"}`);
  io.log(`Evaluations: ${result.budgets.evaluations}`);
  io.log(`Generation: ${result.generation.status} (${result.generation.accepted}/${result.generation.returned} accepted)`);
  io.log(`Generation budget: ${result.generation.cost_units} cost units, ${result.generation.duration_ms} ms`);
  if (result.generation.failure_code) io.log(`Generation failure: ${result.generation.failure_code}`);
  io.log(`Stopping reason: ${result.stopping_reason}`);
  io.log(result.next_gate_action);
  return result;
}
