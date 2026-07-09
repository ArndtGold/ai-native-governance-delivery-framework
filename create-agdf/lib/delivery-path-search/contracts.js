export const CONTRACT_VERSION = "1";
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

export function validateSearchInput(value) {
  const input = requireObject(value, "search input");
  if (input.contract_version !== CONTRACT_VERSION) throw new Error(`unsupported search input contract_version: ${input.contract_version}`);
  requireString(input.scope_key, "scope_key");
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(input.scope_key) || input.scope_key.includes("..")) {
    throw new Error("scope_key must be a safe path segment");
  }
  requireString(input.objective, "objective");
  requireString(input.current_gate, "current_gate");
  stringArray(input.allowed_actions, "allowed_actions");
  stringArray(input.forbidden_actions, "forbidden_actions");
  stringArray(input.evidence_refs ?? [], "evidence_refs");
  stringArray(input.risks ?? [], "risks");
  validateEnforcement(input.enforcement);
  const budgets = requireObject(input.budgets, "budgets");
  for (const key of ["max_candidates", "max_depth", "max_evaluations", "max_duration_ms", "max_cost_units", "stability_window"]) {
    if (!Number.isInteger(budgets[key]) || budgets[key] < 1) throw new Error(`budgets.${key} must be a positive integer`);
  }
  return structuredClone(input);
}

export function validateCandidate(value) {
  const candidate = requireObject(value, "candidate");
  requireString(candidate.id, "candidate.id");
  requireString(candidate.action, "candidate.action");
  stringArray(candidate.expected_evidence ?? [], "candidate.expected_evidence");
  stringArray(candidate.tests ?? [], "candidate.tests");
  stringArray(candidate.assumptions ?? [], "candidate.assumptions");
  return structuredClone(candidate);
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
