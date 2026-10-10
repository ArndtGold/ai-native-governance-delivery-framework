import { validateGeneratorRequest, validateGeneratorResponse } from "#agdf-core/delivery-path-search/contracts.js";

export function fixtureGenerator(response, metadata = { name: "fixture-generator" }) {
  return {
    name: metadata.name,
    metadata,
    async generate(request) {
      validateGeneratorRequest(request);
      return validateGeneratorResponse(response);
    },
  };
}
