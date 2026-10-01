export function buildEvaluatorPrompt(input, candidate) {
  return [
    "You are an evaluation-only component. Do not use tools, execute commands, inspect files, delegate work or modify state.",
    `Return only one JSON object matching contract version ${input.contract_version}.`,
    `Objective: ${input.objective}`,
    `Current gate: ${input.current_gate}`,
    `Candidate id: ${candidate.id}`,
    `Candidate action: ${candidate.action}`,
    "Score scope_fit, gate_readiness, risk_reduction, evidence_gain, testability, reversibility and cost from 0 to 5.",
    "Cost 0 is low and 5 is high. uncertainty is 0 low to 5 high.",
    "Keep rationale concise. child_actions must only contain actions permitted by the current gate.",
  ].join("\n");
}
