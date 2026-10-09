import { validateCandidate } from "./contracts.js";

function normalized(value) {
  return String(value).normalize("NFKC").toLowerCase().replace(/[`*_]/g, "").replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
}

const STOP_WORDS = new Set(["a", "an", "and", "der", "die", "das", "ein", "eine", "the", "to", "und", "zu"]);

function tokens(value) {
  return new Set(normalized(value).split(/\s+/).filter((item) => item && !STOP_WORDS.has(item)));
}

function jaccard(left, right) {
  const union = new Set([...left, ...right]);
  if (!union.size) return 1;
  let intersection = 0;
  for (const item of left) if (right.has(item)) intersection += 1;
  return intersection / union.size;
}

function signature(candidate) {
  return JSON.stringify({
    gate_action: normalized(candidate.gate_action ?? candidate.action),
    affected_boundaries: [...(candidate.affected_boundaries ?? [])].map(normalized).sort(),
    evidence: [...(candidate.expected_evidence ?? [])].map(normalized).sort(),
    tests: [...(candidate.tests ?? [])].map(normalized).sort(),
    risk_strategy: normalized(candidate.risk_strategy ?? ""),
    reversibility: normalized(candidate.reversibility ?? ""),
  });
}

export function candidateLegality(candidateValue, input) {
  const candidate = validateCandidate(candidateValue);
  const action = normalized(candidate.gate_action ?? candidate.action);
  const forbiddenMatch = input.forbidden_actions.find((item) => {
    const forbidden = normalized(item);
    return forbidden && action === forbidden;
  });
  if (forbiddenMatch) return { legal: false, reason: `forbidden_by_gate: ${forbiddenMatch}`, candidate };

  const allowedMatch = input.allowed_actions.some((item) => {
    const allowed = normalized(item);
    return allowed && action === allowed;
  });
  if (!allowedMatch) return { legal: false, reason: "not_in_allowed_actions", candidate };
  return { legal: true, reason: "allowed_by_current_gate", candidate };
}

export function candidatesFromInput(input) {
  return input.allowed_actions.slice(0, input.budgets.max_candidates).map((action, index) => ({
    id: `candidate-${index + 1}`,
    action,
    expected_evidence: input.evidence_refs,
    tests: [],
    assumptions: [],
    depth: 0,
    parent_id: null,
  }));
}

export function generatedCandidatesFromResponse(response, input, existingCandidates = []) {
  const accepted = [];
  const rejected = [];
  for (const proposal of response.proposals) {
    const candidate = {
      id: `generated-${proposal.proposal_id}`,
      action: proposal.intent,
      source: "generated",
      gate_action: proposal.gate_action,
      intent: proposal.intent,
      expected_evidence: proposal.expected_evidence,
      tests: proposal.tests,
      assumptions: proposal.assumptions,
      affected_boundaries: proposal.affected_boundaries,
      risk_strategy: proposal.risk_strategy,
      reversibility: proposal.reversibility,
      generator_proposal_id: proposal.proposal_id,
      depth: 0,
      parent_id: null,
    };
    const legality = candidateLegality(candidate, input);
    if (!legality.legal) {
      rejected.push({ proposal_id: proposal.proposal_id, reason: legality.reason });
      continue;
    }
    const peers = [...existingCandidates, ...accepted].filter((item) => normalized(item.gate_action ?? item.action) === normalized(candidate.gate_action));
    const duplicate = peers.find((item) => {
      const same = normalized(item.intent ?? item.action) === normalized(candidate.intent);
      const sameDecision = signature(item) === signature(candidate);
      return same || sameDecision || jaccard(tokens(item.intent ?? item.action), tokens(candidate.intent)) >= 0.8;
    });
    if (duplicate) {
      rejected.push({ proposal_id: proposal.proposal_id, reason: "cosmetic_or_material_duplicate" });
      continue;
    }
    accepted.push(candidate);
  }
  return { accepted, rejected };
}
