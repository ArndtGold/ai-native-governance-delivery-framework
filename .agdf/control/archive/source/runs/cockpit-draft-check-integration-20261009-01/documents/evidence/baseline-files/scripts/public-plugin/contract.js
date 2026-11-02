import { readFileSync } from "node:fs";

export const LISTING_LIMITS = Object.freeze({
  displayName: 30,
  shortDescription: 30,
  developerName: 80,
  promptCount: 3,
  promptLength: 128,
});

export function unicodeLength(value) {
  return [...String(value)].length;
}

function requiredString(value, label, errors) {
  if (typeof value !== "string" || value.trim() === "") errors.push(`${label} is required`);
}

function within(value, limit, label, errors) {
  requiredString(value, label, errors);
  if (typeof value === "string" && unicodeLength(value) > limit) {
    errors.push(`${label} exceeds ${limit} Unicode code points`);
  }
}

export function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function validatePublicPluginContract({ definition, capabilityMatrix, reviewerCases, releaseNotes }) {
  const errors = [];
  const contract = definition?.publicDistribution;
  if (contract?.schemaVersion !== 1) errors.push("publicDistribution.schemaVersion must be 1");
  if (contract?.submissionType !== "skills") errors.push("submissionType must be skills");
  if (contract?.technicalId !== definition?.id) errors.push("technicalId must match canonical plugin id");
  if (contract?.developerName !== definition?.developerName) errors.push("developerName must match canonical developerName");
  if (contract?.category !== definition?.category) errors.push("category must match canonical category");
  within(contract?.publicDisplayName, LISTING_LIMITS.displayName, "publicDisplayName", errors);
  within(contract?.shortDescription, LISTING_LIMITS.shortDescription, "shortDescription", errors);
  within(contract?.developerName, LISTING_LIMITS.developerName, "developerName", errors);
  requiredString(contract?.fullDisplayName, "fullDisplayName", errors);
  requiredString(definition?.longDescription, "longDescription", errors);
  if (Object.hasOwn(contract ?? {}, "longDescription")) {
    errors.push("publicDistribution.longDescription must use canonical longDescription");
  }
  if (contract?.fullDisplayName !== `${definition?.displayName} (${contract?.publicDisplayName})`) {
    errors.push("fullDisplayName must combine canonical displayName and publicDisplayName");
  }

  const prompts = contract?.defaultPrompt;
  if (!Array.isArray(prompts) || prompts.length !== LISTING_LIMITS.promptCount) {
    errors.push(`defaultPrompt must contain exactly ${LISTING_LIMITS.promptCount} prompts`);
  } else {
    prompts.forEach((prompt, index) => within(prompt, LISTING_LIMITS.promptLength, `defaultPrompt[${index}]`, errors));
  }
  for (const [name, value] of Object.entries(contract?.urls ?? {})) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") errors.push(`${name} URL must use HTTPS`);
    } catch {
      errors.push(`${name} URL is invalid`);
    }
  }
  for (const name of ["website", "privacy", "terms", "support"]) {
    if (!contract?.urls?.[name]) errors.push(`${name} URL is required`);
  }
  if (contract?.publisher?.verificationState !== "unverified") {
    errors.push("publisher verificationState must remain unverified without portal evidence");
  }
  if (!contract?.availability || !Array.isArray(contract.availability.countries) || !Array.isArray(contract.availability.regions) || !Array.isArray(contract.availability.workspaceContexts)) {
    errors.push("availability decision record is incomplete");
  }

  const allowedStates = new Set(["common", "codex-specific", "chatgpt-specific", "advisory", "unavailable", "unverified"]);
  if (capabilityMatrix?.releaseVersion !== definition?.version) errors.push("capability matrix version must match definition");
  if (!Array.isArray(capabilityMatrix?.capabilities) || capabilityMatrix.capabilities.length === 0) errors.push("capability matrix is empty");
  for (const capability of capabilityMatrix?.capabilities ?? []) {
    if (!allowedStates.has(capability.state)) errors.push(`capability ${capability.id ?? "unknown"} has invalid state`);
    requiredString(capability.evidenceClass, `capability ${capability.id} evidenceClass`, errors);
    requiredString(capability.evidenceRef, `capability ${capability.id} evidenceRef`, errors);
  }

  if (reviewerCases?.releaseVersion !== definition?.version) errors.push("reviewer cases version must match definition");
  const cases = reviewerCases?.cases ?? [];
  if (cases.filter((entry) => entry.kind === "positive").length < 5) errors.push("at least five positive reviewer cases are required");
  if (cases.filter((entry) => entry.kind === "negative").length < 3) errors.push("at least three negative reviewer cases are required");
  for (const entry of cases) {
    for (const field of ["id", "kind", "theme", "prompt", "expectedWorkflow", "expectedResult"]) requiredString(entry[field], `${entry.id ?? "case"}.${field}`, errors);
    if (!Array.isArray(entry.prerequisites)) errors.push(`${entry.id}.prerequisites must be an array`);
  }
  for (const theme of ["missing-approval", "disproportionate-fit", "unavailable-repository-authority", "unsupported-host-capability", "unauthorized-external-action"]) {
    if (!cases.some((entry) => entry.kind === "negative" && entry.theme === theme)) errors.push(`negative reviewer theme ${theme} is required`);
  }
  requiredString(releaseNotes, "releaseNotes", errors);
  if (typeof releaseNotes === "string" && !releaseNotes.includes(definition?.version)) errors.push("release notes must contain exact version");
  return errors;
}

export function assertPublicPluginContract(inputs) {
  const errors = validatePublicPluginContract(inputs);
  if (errors.length) throw new Error(`AGDF_PUBLIC_PLUGIN_CONTRACT_INVALID: ${errors.join("; ")}`);
}
