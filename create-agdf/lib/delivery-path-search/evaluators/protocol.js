import { validateEvaluation } from "../contracts.js";

export function fixtureEvaluator(evaluations) {
  return {
    name: "fixture",
    metadata: { name: "fixture", runtime: "deterministic-test" },
    async evaluate(_input, candidate) {
      const value = evaluations[candidate.id];
      if (!value) throw new Error(`missing fixture evaluation for ${candidate.id}`);
      return validateEvaluation(value, candidate.id);
    },
  };
}
