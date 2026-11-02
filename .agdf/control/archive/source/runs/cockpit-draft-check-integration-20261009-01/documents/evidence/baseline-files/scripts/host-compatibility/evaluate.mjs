import { ENVIRONMENT_FIELDS, IDENTITY_FIELDS, canonical, identityGaps, nextAction, proofState, tuple, validateObservation } from "./contract.mjs";

export function evaluateClaim(target, observations, referenceHashes) {
  const relevant = observations.filter(o => o.environment?.host === target.environment.host && o.claim === target.claim && o.lane === target.lane && o.mechanism === target.mechanism);
  const exact = relevant.filter(o => tuple(o) === tuple(target));
  const diagnostics = [];
  const eligible = [];
  const ids = new Set();
  for (const o of exact) {
    const errors = validateObservation(o, referenceHashes);
    if (ids.has(o.id)) errors.push("duplicate_observation_id");
    ids.add(o.id);
    if (errors.length) diagnostics.push({ id: o.id, errors });
    else eligible.push(o);
  }
  const byId = new Map(eligible.map(o => [o.id, o]));
  const superseded = new Set();
  const visit = (id, active = new Set()) => {
    if (active.has(id)) throw new Error("cyclic_supersession");
    const o = byId.get(id); if (!o) throw new Error("supersession_not_same_tuple");
    active.add(id);
    for (const oldId of o.supersedes ?? []) {
      const old = byId.get(oldId);
      if (!old || Date.parse(old.observed_at) >= Date.parse(o.observed_at)) throw new Error("invalid_supersession_order");
      visit(oldId, new Set(active));
      superseded.add(oldId);
    }
  };
  try { for (const o of eligible) visit(o.id); }
  catch (error) { diagnostics.push({ id: "supersession", errors: [error.message] }); superseded.clear(); }
  const current = eligible.filter(o => !superseded.has(o.id));
  const states = [...new Set(current.map(proofState))];
  let state = states.length === 1 ? states[0] : "unverified";
  if (states.length > 1) diagnostics.push({ id: "conflict", errors: ["unsuperseded_conflicting_observations"] });
  if (diagnostics.length) state = "unverified";
  if (!exact.length && relevant.length) state = "stale/mismatched";
  const gaps = [...new Set([...identityGaps({ ...target, observed: target.expected }), ...current.flatMap(identityGaps)])];
  if (gaps.length) state = "unverified";
  const mismatches = relevant.filter(o => !exact.includes(o)).map(o => ({ id: o.id,
    dimensions: [...ENVIRONMENT_FIELDS.filter(key => canonical(o.environment?.[key]) !== canonical(target.environment[key])).map(key => `environment.${key}`),
      ...IDENTITY_FIELDS.filter(key => o.expected?.[key] !== target.expected[key]).map(key => `payload.${key}`),
      ...(o.source_fingerprint !== target.source_fingerprint ? ["source_fingerprint"] : [])] }));
  return { ...target, state, observations: current.map(o => o.id), failed_observations: current.filter(o => proofState(o) === "failed").map(o => o.id),
    superseded: [...superseded], diagnostics, gaps, mismatches,
    next_action: target.claim === "automatic_checks" && current.some(o => o.facts.authorized === false)
      ? "Use the existing manual verification path; automatic checks remain declined."
      : nextAction(target.claim, state) };
}
