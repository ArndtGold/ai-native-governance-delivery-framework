import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { executeStructuredAgent } from "../live-agent/read-only-structured.js";
import { changedPaths, snapshotWorkspace } from "../skill-evals/workspace.js";
import { buildBlindPrompt } from "./blind-prompt.js";
import { normalizeAgentOutput, normalizeStagedAgentOutput, OBSERVATION_SCHEMA, fail, stagedSchemaForVersion } from "./contracts.js";
import { getProfileDefinition, isStagedProfile } from "./profiles.js";
import { behaviorSourceText, sourceFingerprint } from "./source-fingerprint.js";

export const ADAPTER_VERSION = getProfileDefinition("legacy-v1").adapter_version;
export const STAGED_ADAPTER_VERSION = getProfileDefinition("staged-v2").adapter_version;
export const STAGED_V3_ADAPTER_VERSION = getProfileDefinition("staged-v3").adapter_version;
export function isRetryableObservationError(error) {
  return error?.code === "GENERATOR_TIMEOUT";
}
export function observationAttemptFailure(error, attemptCount, attemptLimit) {
  const messages = {
    GENERATOR_TIMEOUT: "read-only process timed out",
    PROPORTIONALITY_OUTPUT_INVALID: "agent output failed the structured contract",
    PROPORTIONALITY_REDACTION_FAILED: "agent output failed redaction",
    PROPORTIONALITY_MUTATION: "agent mutated the disposable fixture",
  };
  return {
    status: "invalid",
    code: error?.code ?? "EXECUTION_ERROR",
    message: messages[error?.code] ?? "agent execution failed",
    retryable: isRetryableObservationError(error),
    remaining_attempt_budget: Math.max(0, attemptLimit - attemptCount),
  };
}
function runtimeVersion(surface) {
  try { return execFileSync(surface, ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { return `${surface} version unavailable`; }
}
export function persistObservation(path, observation, { replace = false } = {}) {
  let previous;
  try { previous = JSON.parse(readFileSync(path, "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  if (previous && !replace) {
    fail(`observation already exists: ${path}`, "PROPORTIONALITY_DUPLICATE");
  }
  const persisted = previous ? {
    ...observation,
    replacement_provenance: {
      previous_observation_id: previous.observation_id ?? null,
      previous_recorded_at: previous.recorded_at ?? null,
      replaced_at: new Date().toISOString(),
    },
  } : observation;
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, `${JSON.stringify(persisted, null, 2)}\n`, "utf8");
  renameSync(temp, path);
}
export async function recordObservation({
  repoRoot, testCase, fixture, seriesId, repeat, surface, model, agdfVersion, baselineVersion,
  timeoutMs = 120000, execute = executeStructuredAgent, persistPath, replace = false,
}) {
  if (!/^[a-z0-9][a-z0-9._-]{2,79}$/i.test(seriesId) || !Number.isInteger(repeat) || repeat < 1) fail("invalid series or repeat");
  if (!surface || !model || !agdfVersion || !baselineVersion) fail("surface, model, AGDF version and baseline version are required");
  const profile = getProfileDefinition(testCase.profile_id ?? "legacy-v1");
  const staged = isStagedProfile(profile);
  const adapterVersion = profile.adapter_version;
  const fingerprint = sourceFingerprint(repoRoot, testCase, fixture, adapterVersion);
  const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-proportionality-"));
  let output;
  let executionError;
  try {
    writeFileSync(join(fixtureRoot, "TASK.md"), `${testCase.task_summary}\n`, "utf8");
    writeFileSync(join(fixtureRoot, "CONTEXT.json"), `${JSON.stringify({
      repository_context: testCase.repository_context,
      control_state_context: testCase.control_state_context,
    }, null, 2)}\n`, "utf8");
    const before = snapshotWorkspace(fixtureRoot);
    try {
      output = await execute({
        surface, cwd: fixtureRoot, model, timeoutMs, outputSchema: staged ? stagedSchemaForVersion(profile.schema_version) : OBSERVATION_SCHEMA,
        prompt: buildBlindPrompt(testCase, behaviorSourceText(repoRoot)),
      });
    } catch (error) { executionError = error; }
    const after = snapshotWorkspace(fixtureRoot);
    const mutations = changedPaths(before, after);
    if (mutations.length) fail(`agent mutated fixture: ${mutations.join(", ")}`, "PROPORTIONALITY_MUTATION");
    if (executionError) throw executionError;
    const normalized = staged ? normalizeStagedAgentOutput(output, testCase.requested_axes, profile.schema_version) : normalizeAgentOutput(output);
    const observation = {
      schema_version: profile.schema_version,
      observation_id: `${seriesId}:${staged ? testCase.scenario_id : testCase.case_id}:${repeat}`,
      case_id: testCase.case_id,
      ...(staged ? {
        profile_id: profile.profile_id,
        protocol_version: profile.protocol_version,
        corpus_version: testCase.corpus_version,
        fixture_version: testCase.fixture_version,
        scenario_id: testCase.scenario_id,
        lifecycle_stage: testCase.lifecycle_stage,
        ...(profile.series_profile_metadata ? { runner_version: profile.runner_version } : {}),
      } : {}),
      series_id: seriesId,
      repeat,
      evidence_kind: "live_agent_observation",
      surface,
      runtime_version: runtimeVersion(surface),
      agdf_version: agdfVersion,
      baseline_version: baselineVersion,
      model,
      adapter_version: adapterVersion,
      source_fingerprint: fingerprint,
      recorded_at: new Date().toISOString(),
      ...normalized,
      execution_status: "completed",
      redaction_status: "pass",
      mutation_status: "pass",
    };
    if (persistPath) persistObservation(persistPath, observation, { replace });
    return observation;
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}
