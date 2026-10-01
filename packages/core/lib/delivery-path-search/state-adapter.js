import {
  CONTRACT_VERSION,
  GENERATOR_CONTRACT_VERSION,
  validateGeneratorRequest,
} from "./contracts.js";
import { evaluateGateCheck } from "../control-evaluation/gate-check.js";
import { readRunState } from "../control-evaluation/run-state.js";

function section(content, heading) {
  return (
    content.match(
      new RegExp(`## ${heading}\\r?\\n([\\s\\S]*?)(?=\\r?\\n## |$)`),
    )?.[1] ?? ""
  );
}

function metaField(content, name) {
  return content.match(new RegExp(`^- ${name}:\\s*(.+)$`, "m"))?.[1]
    ?.replace(/^`|`$/g, "")
    .trim() ?? "";
}

export function searchInputFromControl(targetDir, options = {}, dependencies = {}) {
  const evaluate = dependencies.evaluateGateCheck ?? evaluateGateCheck;
  const readRun = dependencies.readRunState ?? readRunState;
  const selection = options.scopeKey ? { runId: options.scopeKey } : {};
  const gate = evaluate(targetDir, selection);
  const run = readRun(targetDir, selection);
  const content = run.content ?? "";
  const evaluatedRunId = gate.status_card?.run_id ?? "";
  const evaluatedRevision = gate.status_presentation?.revision_id ?? "";
  const runId = metaField(content, "run_id");
  const runRevision = metaField(content, "revision_id");
  const runGate = metaField(content, "current_gate");
  let inputFailureCode = "";
  if (!content || run.resolution_error) inputFailureCode = "canonical_control_unavailable";
  else if (!evaluatedRunId || !evaluatedRevision) inputFailureCode = "canonical_snapshot_identity_missing";
  else if (evaluatedRunId !== runId || evaluatedRevision !== runRevision || gate.current_gate !== runGate) {
    inputFailureCode = "stale_control_snapshot";
  } else if (!Array.isArray(gate.allowed) || gate.allowed.length === 0) {
    inputFailureCode = "canonical_actions_unavailable";
  }
  const result = {
    contract_version: CONTRACT_VERSION,
    scope_key: evaluatedRunId || runId || options.scopeKey || "unknown-scope",
    scope_revision: evaluatedRevision || runRevision || "unversioned",
    objective: section(content, "Objective").trim() || "Canonical Delivery Path Search input unavailable",
    current_gate: gate.current_gate || runGate || "unknown",
    allowed_actions: inputFailureCode ? [] : [...gate.allowed],
    forbidden_actions: Array.isArray(gate.forbidden) ? [...gate.forbidden] : [],
    evidence_refs: Array.isArray(gate.evidence_refs)
      ? gate.evidence_refs.map((item) => `${item.evidence}: ${item.source}`)
      : [],
    risks: Array.isArray(run.risks) ? run.risks.map((item) => item.risk).filter(Boolean) : [],
    enforcement: options.enforcement ?? {
      level: "instruction_only",
      evidence: ["surface instruction prohibits implementation during search"],
    },
    budgets: {
      max_candidates: options.maxCandidates ?? 5,
      max_depth: options.maxDepth ?? 2,
      max_evaluations: options.maxEvaluations ?? 8,
      max_duration_ms: options.maxDurationMs ?? 120000,
      max_cost_units: options.maxCostUnits ?? 20,
      stability_window: options.stabilityWindow ?? 3,
    },
  };
  if (inputFailureCode) {
    result.input_failure_code = inputFailureCode;
    result.input_failure_detail = run.resolution_error || (gate.blocking_reason !== "none" ? gate.blocking_reason : "") || "canonical input is not ready";
    result.input_recovery_action = gate.next_allowed_action || "Run canonical AGDF gate-check and repair the selected control state.";
  }
  if (options.generation?.enabled)
    result.generation = {
      enabled: true,
      max_calls: 1,
      max_proposals: options.generation.maxProposals ?? 5,
      max_duration_ms: options.generation.maxDurationMs ?? 30000,
      max_cost_units: options.generation.maxCostUnits ?? 5,
    };
  return result;
}

export function generatorRequestFromInput(input) {
  return validateGeneratorRequest({
    contract_version: GENERATOR_CONTRACT_VERSION,
    scope_key: input.scope_key,
    objective: input.objective,
    scope_summary: input.objective,
    current_gate: input.current_gate,
    allowed_actions: input.allowed_actions,
    forbidden_actions: input.forbidden_actions,
    artefact_refs: [],
    evidence: input.evidence_refs ?? [],
    missing_evidence: [],
    risks: input.risks ?? [],
    constraints: [
      "advisory only",
      "canonical gate-check remains authoritative",
    ],
    enforcement: input.enforcement,
    budgets: {
      max_calls: input.generation.max_calls,
      max_proposals: input.generation.max_proposals,
      max_duration_ms: input.generation.max_duration_ms,
      max_cost_units: input.generation.max_cost_units,
    },
  });
}
