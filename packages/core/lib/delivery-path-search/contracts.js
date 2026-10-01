export const CONTRACT_VERSION = "1";
export const GENERATOR_CONTRACT_VERSION = "1";
export const SCORING_POLICY_VERSION = "1";
export const SCORE_DIMENSIONS = [
  "scope_fit",
  "gate_readiness",
  "risk_reduction",
  "evidence_gain",
  "testability",
  "reversibility",
  "cost",
];

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value;
}

function requireString(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string`);
  return value.trim();
}

function stringArray(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) throw new Error(`${label} must be a string array`);
  return value.map((item) => item.trim()).filter(Boolean);
}

function optionalBoundedString(value, label, maxLength = 1000) {
  if (value === undefined) return undefined;
  const result = requireString(value, label);
  if (result.length > maxLength) throw new Error(`${label} must be at most ${maxLength} characters`);
  return result;
}

function rejectUnknownKeys(value, allowed, label) {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new Error(`${label} contains unknown fields: ${unknown.join(", ")}`);
}

function generationConfig(value, wholeRunBudgets) {
  if (value === undefined) return undefined;
  const generation = requireObject(value, "generation");
  if (typeof generation.enabled !== "boolean") throw new Error("generation.enabled must be a boolean");
  const limits = {
    max_calls: 1,
    max_proposals: 5,
    max_duration_ms: 30000,
    max_cost_units: 5,
  };
  for (const [key, maximum] of Object.entries(limits)) {
    if (!Number.isInteger(generation[key]) || generation[key] < 1 || generation[key] > maximum) {
      throw new Error(`generation.${key} must be an integer from 1 to ${maximum}`);
    }
  }
  if (generation.max_calls !== 1) throw new Error("generation.max_calls must equal 1 in this contract version");
  if (generation.max_duration_ms > wholeRunBudgets.max_duration_ms) throw new Error("generation.max_duration_ms cannot exceed budgets.max_duration_ms");
  if (generation.max_cost_units > wholeRunBudgets.max_cost_units) throw new Error("generation.max_cost_units cannot exceed budgets.max_cost_units");
  return structuredClone(generation);
}

export function validateSearchInput(value) {
  const input = requireObject(value, "search input");
  if (input.contract_version !== CONTRACT_VERSION) throw new Error(`unsupported search input contract_version: ${input.contract_version}`);
  requireString(input.scope_key, "scope_key");
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(input.scope_key) || input.scope_key.includes("..")) {
    throw new Error("scope_key must be a safe path segment");
  }
  requireString(input.objective, "objective");
  requireString(input.current_gate, "current_gate");
  optionalBoundedString(input.scope_revision, "scope_revision", 200);
  optionalBoundedString(input.input_failure_code, "input_failure_code", 200);
  optionalBoundedString(input.input_failure_detail, "input_failure_detail", 1000);
  optionalBoundedString(input.input_recovery_action, "input_recovery_action", 1000);
  stringArray(input.allowed_actions, "allowed_actions");
  stringArray(input.forbidden_actions, "forbidden_actions");
  stringArray(input.evidence_refs ?? [], "evidence_refs");
  stringArray(input.risks ?? [], "risks");
  validateEnforcement(input.enforcement);
  const budgets = requireObject(input.budgets, "budgets");
  for (const key of ["max_candidates", "max_depth", "max_evaluations", "max_duration_ms", "max_cost_units", "stability_window"]) {
    if (!Number.isInteger(budgets[key]) || budgets[key] < 1) throw new Error(`budgets.${key} must be a positive integer`);
  }
  generationConfig(input.generation, budgets);
  return structuredClone(input);
}

const RESULT_PHASE_BY_STATUS = new Map([
  ["input_unavailable", "input"],
  ["no_legal_candidates", "candidate"],
  ["evaluator_unavailable", "evaluation"],
  ["evaluator_error", "evaluation"],
  ["recommendation", "search"],
  ["no_safe_recommendation", "search"],
]);

export function validateSearchResult(value) {
  const result = requireObject(value, "search result");
  if (result.contract_version !== CONTRACT_VERSION) throw new Error(`unsupported search result contract_version: ${result.contract_version}`);
  const status = requireString(result.status, "result.status");
  const expectedPhase = RESULT_PHASE_BY_STATUS.get(status);
  if (!expectedPhase) throw new Error(`unsupported search result status: ${status}`);
  if (result.outcome_phase !== expectedPhase) throw new Error(`${status} requires outcome_phase ${expectedPhase}`);
  requireString(result.scope_key, "result.scope_key");
  optionalBoundedString(result.scope_revision, "result.scope_revision", 200);
  const provenance = requireObject(result.provenance, "result.provenance");
  for (const key of ["baseline_candidates", "generated_candidates", "legal_candidates", "rejected_candidates", "evaluation_attempts", "valid_evaluations", "invalid_evaluations"]) {
    if (!Number.isInteger(provenance[key]) || provenance[key] < 0) throw new Error(`result.provenance.${key} must be a non-negative integer`);
  }
  if (provenance.evaluation_attempts !== provenance.valid_evaluations + provenance.invalid_evaluations) throw new Error("result evaluation provenance counts are inconsistent");
  const recommendationFacing = status === "recommendation" || status === "no_safe_recommendation";
  if (recommendationFacing && provenance.valid_evaluations < 1) throw new Error(`${status} requires at least one valid evaluation`);
  if (status === "recommendation" && !result.recommendation) throw new Error("recommendation status requires recommendation content");
  if (status !== "recommendation" && result.recommendation != null) throw new Error(`${status} must not contain recommendation content`);
  if (status === "no_legal_candidates" && (provenance.legal_candidates !== 0 || provenance.evaluation_attempts !== 0)) throw new Error("no_legal_candidates requires zero legal candidates and evaluation attempts");
  if (status === "input_unavailable" && provenance.evaluation_attempts !== 0) throw new Error("input_unavailable requires zero evaluation attempts");
  if ((status === "evaluator_unavailable" || status === "evaluator_error") && provenance.valid_evaluations !== 0) throw new Error(`${status} requires zero valid evaluations`);
  return structuredClone(result);
}

export function validateCandidate(value) {
  const candidate = requireObject(value, "candidate");
  requireString(candidate.id, "candidate.id");
  requireString(candidate.action, "candidate.action");
  stringArray(candidate.expected_evidence ?? [], "candidate.expected_evidence");
  stringArray(candidate.tests ?? [], "candidate.tests");
  stringArray(candidate.assumptions ?? [], "candidate.assumptions");
  if (candidate.source !== undefined && !["deterministic", "generated", "expanded"].includes(candidate.source)) {
    throw new Error("candidate.source must be deterministic, generated or expanded");
  }
  optionalBoundedString(candidate.gate_action, "candidate.gate_action");
  optionalBoundedString(candidate.intent, "candidate.intent");
  stringArray(candidate.affected_boundaries ?? [], "candidate.affected_boundaries");
  optionalBoundedString(candidate.risk_strategy, "candidate.risk_strategy");
  optionalBoundedString(candidate.reversibility, "candidate.reversibility");
  optionalBoundedString(candidate.generator_proposal_id, "candidate.generator_proposal_id", 200);
  return structuredClone(candidate);
}

export function validateGeneratorRequest(value) {
  const request = requireObject(value, "generator request");
  rejectUnknownKeys(request, ["contract_version", "scope_key", "objective", "scope_summary", "current_gate", "allowed_actions", "forbidden_actions", "artefact_refs", "evidence", "missing_evidence", "risks", "constraints", "enforcement", "budgets"], "generator request");
  if (request.contract_version !== GENERATOR_CONTRACT_VERSION) throw new Error(`unsupported generator contract_version: ${request.contract_version}`);
  requireString(request.scope_key, "generator scope_key");
  optionalBoundedString(request.objective, "generator objective", 2000);
  optionalBoundedString(request.scope_summary, "generator scope_summary", 2000);
  requireString(request.current_gate, "generator current_gate");
  for (const key of ["allowed_actions", "forbidden_actions", "artefact_refs", "evidence", "missing_evidence", "risks", "constraints"]) {
    const items = stringArray(request[key] ?? [], `generator ${key}`);
    if (items.length > 20 || items.some((item) => item.length > 500)) throw new Error(`generator ${key} exceeds context bounds`);
  }
  validateEnforcement(request.enforcement);
  const budgets = requireObject(request.budgets, "generator budgets");
  generationConfig({ enabled: true, ...budgets }, { max_duration_ms: 120000, max_cost_units: 20 });
  const serialized = JSON.stringify(request);
  if (/(secret|credential|environment|raw_prompt|hidden_reasoning|source_snapshot)/i.test(serialized)) {
    throw new Error("generator request contains disallowed context");
  }
  return structuredClone(request);
}

export function validateGeneratorResponse(value) {
  const response = requireObject(value, "generator response");
  rejectUnknownKeys(response, ["contract_version", "proposals", "cost_units", "metadata"], "generator response");
  if (response.contract_version !== GENERATOR_CONTRACT_VERSION) throw new Error(`unsupported generator contract_version: ${response.contract_version}`);
  if (!Array.isArray(response.proposals) || response.proposals.length > 5) throw new Error("generator proposals must be an array with at most 5 items");
  if (!Number.isInteger(response.cost_units) || response.cost_units < 0 || response.cost_units > 5) throw new Error("generator cost_units must be an integer from 0 to 5");
  if (response.metadata !== undefined) {
    const metadata = requireObject(response.metadata, "generator metadata");
    rejectUnknownKeys(metadata, ["name", "runtime", "model"], "generator metadata");
    for (const [key, item] of Object.entries(metadata)) optionalBoundedString(item, `generator metadata.${key}`, 500);
  }
  const proposals = response.proposals.map((proposal, index) => {
    const item = requireObject(proposal, `proposal ${index}`);
    rejectUnknownKeys(item, ["proposal_id", "gate_action", "intent", "expected_evidence", "tests", "assumptions", "affected_boundaries", "risk_strategy", "reversibility"], `proposal ${index}`);
    const normalized = {
      proposal_id: requireString(item.proposal_id, `proposal ${index}.proposal_id`),
      gate_action: requireString(item.gate_action, `proposal ${index}.gate_action`),
      intent: requireString(item.intent, `proposal ${index}.intent`),
      expected_evidence: stringArray(item.expected_evidence ?? [], `proposal ${index}.expected_evidence`),
      tests: stringArray(item.tests ?? [], `proposal ${index}.tests`),
      assumptions: stringArray(item.assumptions ?? [], `proposal ${index}.assumptions`),
      affected_boundaries: stringArray(item.affected_boundaries ?? [], `proposal ${index}.affected_boundaries`),
      risk_strategy: requireString(item.risk_strategy, `proposal ${index}.risk_strategy`),
      reversibility: requireString(item.reversibility, `proposal ${index}.reversibility`),
    };
    if (JSON.stringify(normalized).length > 5000) throw new Error(`proposal ${index} exceeds size limit`);
    if (/(^|\s)(rm|sudo|curl|wget|bash|sh|exec)\s/i.test(normalized.intent)) throw new Error(`proposal ${index} contains executable instructions`);
    return normalized;
  });
  return {
    contract_version: response.contract_version,
    proposals,
    cost_units: response.cost_units,
    metadata: response.metadata ? structuredClone(response.metadata) : {},
  };
}

export function generatorOutputSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["contract_version", "proposals", "cost_units"],
    properties: {
      contract_version: { type: "string", const: GENERATOR_CONTRACT_VERSION },
      cost_units: { type: "integer", minimum: 0, maximum: 5 },
      proposals: {
        type: "array", maxItems: 5, items: {
          type: "object", additionalProperties: false,
          required: ["proposal_id", "gate_action", "intent", "expected_evidence", "tests", "assumptions", "affected_boundaries", "risk_strategy", "reversibility"],
          properties: {
            proposal_id: { type: "string", minLength: 1 }, gate_action: { type: "string", minLength: 1 }, intent: { type: "string", minLength: 1 },
            expected_evidence: { type: "array", items: { type: "string" } }, tests: { type: "array", items: { type: "string" } },
            assumptions: { type: "array", items: { type: "string" } }, affected_boundaries: { type: "array", items: { type: "string" } },
            risk_strategy: { type: "string", minLength: 1 }, reversibility: { type: "string", minLength: 1 },
          },
        },
      },
    },
  };
}

export function validateEvaluation(value, candidateId) {
  const evaluation = requireObject(value, "evaluation");
  if (evaluation.contract_version !== CONTRACT_VERSION) throw new Error(`unsupported evaluator contract_version: ${evaluation.contract_version}`);
  if (evaluation.candidate_id !== candidateId) throw new Error(`evaluation candidate_id must be ${candidateId}`);
  for (const dimension of SCORE_DIMENSIONS) {
    if (!Number.isInteger(evaluation[dimension]) || evaluation[dimension] < 0 || evaluation[dimension] > 5) {
      throw new Error(`${dimension} must be an integer from 0 to 5`);
    }
  }
  if (!Number.isInteger(evaluation.uncertainty) || evaluation.uncertainty < 0 || evaluation.uncertainty > 5) {
    throw new Error("uncertainty must be an integer from 0 to 5");
  }
  requireString(evaluation.rationale, "evaluation.rationale");
  stringArray(evaluation.risks ?? [], "evaluation.risks");
  stringArray(evaluation.assumptions ?? [], "evaluation.assumptions");
  stringArray(evaluation.child_actions ?? [], "evaluation.child_actions");
  if (/(^|\s)(rm|sudo|curl|wget|bash|sh|exec)\s/i.test(evaluation.rationale)) {
    throw new Error("evaluation rationale contains executable instructions");
  }
  return structuredClone(evaluation);
}

export function validateEnforcement(value) {
  const enforcement = requireObject(value, "enforcement");
  if (!["full", "tool_enforced", "instruction_only"].includes(enforcement.level)) {
    throw new Error("enforcement.level must be full, tool_enforced or instruction_only");
  }
  const evidence = stringArray(enforcement.evidence ?? [], "enforcement.evidence");
  if (enforcement.level !== "instruction_only" && evidence.length === 0) {
    throw new Error(`${enforcement.level} requires enforcement evidence`);
  }
  return { level: enforcement.level, evidence };
}

export function evaluatorOutputSchema() {
  const scoreProperties = Object.fromEntries(SCORE_DIMENSIONS.map((key) => [key, { type: "integer", minimum: 0, maximum: 5 }]));
  return {
    type: "object",
    additionalProperties: false,
    required: ["contract_version", "candidate_id", ...SCORE_DIMENSIONS, "uncertainty", "rationale", "risks", "assumptions", "child_actions"],
    properties: {
      contract_version: { type: "string", const: CONTRACT_VERSION },
      candidate_id: { type: "string" },
      ...scoreProperties,
      uncertainty: { type: "integer", minimum: 0, maximum: 5 },
      rationale: { type: "string", minLength: 1, maxLength: 1000 },
      risks: { type: "array", items: { type: "string" } },
      assumptions: { type: "array", items: { type: "string" } },
      child_actions: { type: "array", items: { type: "string" }, maxItems: 5 },
    },
  };
}
