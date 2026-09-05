import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { executeStructuredAgent } from "../live-agent/read-only-structured.js";
import {
  composeRequestActivationProfile,
  REQUEST_ACTIVATION_EVALUATOR_SURFACES,
  REQUEST_ACTIVATION_PROFILE_SURFACES,
} from "./composed-profile.js";
import { gradeRequestActivationObservation, loadRequestActivationCorpus, validateRequestActivationCorpus } from "./index.js";

export const REQUEST_ACTIVATION_INPUT_MODES = Object.freeze(["canonical_contract", "composed_profile"]);

export const requestActivationBehaviorSchema = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: [
    "requested_effect", "invocation_provenance", "selection_origin", "request_class", "decision",
    "operation_id", "selected_skill", "visible_agdf", "predicted_callbacks", "authorizes", "persist",
  ],
  properties: {
    requested_effect: { enum: ["read_only_assistance", "governed_delivery", "binding_delivery_artefact", "named_agdf_operation", "control_lifecycle", "continuation_action", "ambiguous"] },
    invocation_provenance: { enum: ["current_user_text", "trusted_ephemeral_user_action", "unavailable"] },
    selection_origin: { enum: ["explicit_user_action", "automatic_discovery", "router_selection", "unavailable"] },
    request_class: { enum: ["ordinary_read_only", "delivery_intent", "explicit_agdf_operation", "explicit_control_lifecycle", "active_run_continuation", "ambiguous_effect"] },
    decision: { enum: ["abstain", "clarify", "activate_named_operation", "activate_delivery_intake", "activate_continuation"] },
    operation_id: { type: ["string", "null"] },
    selected_skill: { enum: ["none", "delivery-path-search", "brownfield-analysis", "ux-intent-definition", "clean-implementation-review", "code-review", "delivery-closeout", "gate-check", "qa-gate", "release-or", "task-plan-review"] },
    visible_agdf: { enum: ["silent", "clarification_without_agdf", "normal_answer", "operation_result"] },
    predicted_callbacks: {
      type: "array",
      items: { enum: ["dispatcher_v1", "target_resolver", "repository_activation", "control_presence", "run_selector", "control_evaluator", "agdf_renderer", "installation_status_owner", "repository_status_owner", "help_suitability_owner", "lifecycle_owner", "canonical_init"] },
    },
    authorizes: { type: "boolean", const: false },
    persist: { type: "boolean", const: false },
  },
});

function parseObservation(raw) {
  const value = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("behavioral adapter returned a non-object result");
  for (const field of requestActivationBehaviorSchema.required) if (!(field in value)) throw new Error(`behavioral adapter omitted ${field}`);
  if (!Array.isArray(value.predicted_callbacks)) throw new Error("behavioral adapter predicted_callbacks must be an array");
  return value;
}

const INVOCATION_EVIDENCE = Object.freeze({
  current_user_text: "The current user text is the only deliberate invocation evidence available.",
  trusted_ephemeral_user_action: "A trusted ephemeral host signal bound to this current deliberate user action was observed.",
  unavailable: "No separate trusted invocation signal is available.",
});

const SELECTION_EVIDENCE = Object.freeze({
  explicit_user_action: "The host observed an explicit user skill or action selection.",
  automatic_discovery: "The candidate AGDF path came from automatic discovery, not from a deliberate user selection.",
  router_selection: "The candidate AGDF path came from automatic router selection.",
  unavailable: "No selection-origin signal is available.",
});

export function requestActivationBehaviorInput(testCase) {
  const invocationEvidence = INVOCATION_EVIDENCE[testCase?.invocation_provenance];
  const selectionEvidence = SELECTION_EVIDENCE[testCase?.selection_origin];
  if (!invocationEvidence || !selectionEvidence) throw new Error("behavioral case has unknown observed provenance evidence");
  return Object.freeze({
    schema_version: 1,
    locale: testCase.locale,
    user_text: testCase.user_text,
    prior_context: structuredClone(testCase.prior_context),
    ambient_control_context: testCase.control_context,
    observed_invocation_evidence: invocationEvidence,
    observed_selection_evidence: selectionEvidence,
  });
}

export function requestActivationBehaviorPrompt(contract, caseInput) {
  return [
    "Evaluate one AGDF Request Activation case. This is a read-only behavioral evaluation, not an operational classifier.",
    "Do not call tools, inspect a repository, mutate state, emit an AGDF status card or authorize work.",
    "Return only JSON matching the supplied schema. Use only the schema's exact enum values; do not invent synonyms, function names, command names or descriptive callback labels.",
    "Map the observed invocation evidence literally: 'current user text is the only deliberate invocation evidence' means `current_user_text`; 'trusted ephemeral host signal' means `trusted_ephemeral_user_action`; 'no separate trusted invocation signal' means `unavailable`. Map the observed selection evidence literally to its named origin. Do not reinterpret either field from the requested effect.",
    "Visible-output policy is exact: `abstain` => `silent`; `clarify` => `clarification_without_agdf`; `assist.*` => `normal_answer`; every other positive operation => `operation_result`.",
    "For `ambiguous_effect`, use `abstain` only when the supplied text still supports a useful read-only answer. A vague suggestion with no concrete subject or effect to assess cannot be answered usefully and therefore uses `clarify`; clarification remains outside AGDF.",
    "Skill selection is exact: `delivery.start` selects `gate-check`; `skill.<slug>` selects that slug; every other operation selects `none`.",
    "`predicted_callbacks` describes the exact ordered callbacks after the transient decision and does not execute them. Use these route rules: abstain/clarify => []; direct skill => [dispatcher_v1]; assist => [help_suitability_owner]; installation status => [installation_status_owner, agdf_renderer]; targetless status overview => [installation_status_owner, agdf_renderer]; repository status => [target_resolver, repository_status_owner, agdf_renderer]; runtime or global lifecycle => [lifecycle_owner, agdf_renderer]; control init => [target_resolver, lifecycle_owner, canonical_init, agdf_renderer]; repository activation => [target_resolver, repository_activation, lifecycle_owner, agdf_renderer]; repository disable => [target_resolver, lifecycle_owner, agdf_renderer]; active-run continuation => [target_resolver, run_selector, control_evaluator, agdf_renderer]. For delivery.start use [target_resolver, control_presence, dispatcher_v1, agdf_renderer] in active_run, [target_resolver, control_presence, agdf_renderer] in no_control, and [target_resolver, agdf_renderer] in repositoryless context.",
    `Case input: ${JSON.stringify(caseInput)}`,
    "Canonical Request Activation Contract:",
    contract,
  ].join("\n\n");
}

export function requestActivationComposedProfilePrompt(modelInstructions, caseInput) {
  return [
    "Evaluate one AGDF Request Activation case from the source-composed instruction profile below. This is supporting read-only model evidence, not loaded-host evidence or an operational classifier.",
    "Do not call tools, inspect a repository, mutate state, emit an AGDF status card or authorize work.",
    "Return only JSON matching the supplied output schema. Apply the source-composed instructions to the current user text, prior context, ambient context and observed provenance evidence exactly as supplied.",
    "For predicted_callbacks, report only the ordered callback identifiers entailed by the selected route; this predicts no execution.",
    "Source-composed instruction profile:",
    modelInstructions,
    `Case input: ${JSON.stringify(caseInput)}`,
  ].join("\n\n");
}

export function resolveRequestActivationEvaluationSurfaces({
  inputMode = "canonical_contract",
  surface,
  evaluatorSurface,
  profileSurface,
} = {}) {
  if (!REQUEST_ACTIVATION_INPUT_MODES.includes(inputMode)) {
    throw new Error(`unsupported request activation input mode: ${inputMode || "missing"}`);
  }
  if (surface !== undefined && evaluatorSurface !== undefined) {
    throw new Error("legacy surface is an evaluator-only alias and cannot be combined with evaluatorSurface");
  }
  const evaluator = evaluatorSurface ?? surface ?? "codex";
  if (!REQUEST_ACTIVATION_EVALUATOR_SURFACES.includes(evaluator)) {
    throw new Error("behavioral evaluator supports only codex or claude; loaded-host evidence is recorded separately");
  }
  if (inputMode === "composed_profile") {
    if (!REQUEST_ACTIVATION_PROFILE_SURFACES.includes(profileSurface)) {
      throw new Error("composed_profile input mode requires profileSurface codex, claude, copilot or opencode");
    }
  } else if (profileSurface !== undefined) {
    throw new Error("profileSurface is valid only for composed_profile input mode");
  }
  return Object.freeze({
    inputMode,
    evaluatorSurface: evaluator,
    profileSurface: inputMode === "composed_profile" ? profileSurface : null,
  });
}

function defaultExecute({ evaluatorSurface, cwd, prompt, model, timeoutMs }) {
  return executeStructuredAgent({ surface: evaluatorSurface, cwd, prompt, model, outputSchema: requestActivationBehaviorSchema, timeoutMs });
}

function runtimeVersion(evaluatorSurface) {
  try {
    return execFileSync(evaluatorSurface, ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "unavailable";
  }
}

export async function runRequestActivationBehavioralEvaluation({
  repoRoot,
  inputMode = "canonical_contract",
  surface,
  evaluatorSurface,
  profileSurface,
  model,
  caseId,
  timeoutMs = 120000,
  execute = defaultExecute,
} = {}) {
  if (!repoRoot) throw new Error("request activation behavioral evaluation requires repoRoot");
  const resolved = resolveRequestActivationEvaluationSurfaces({ inputMode, surface, evaluatorSurface, profileSurface });
  const deterministic = validateRequestActivationCorpus(repoRoot);
  if (deterministic.status !== "pass") throw new Error(`request activation corpus is not current: ${deterministic.failures.map(({ code }) => code).join(", ")}`);
  const { cases, manifest } = loadRequestActivationCorpus(repoRoot);
  const eligible = resolved.inputMode === "composed_profile"
    ? cases.filter((testCase) => testCase.composed_profile)
    : cases;
  const selected = caseId ? eligible.filter((testCase) => testCase.case_id === caseId) : eligible;
  if (selected.length === 0) throw new Error(`unknown request activation case: ${caseId}`);
  const contract = resolved.inputMode === "canonical_contract"
    ? readFileSync(join(repoRoot, "plugin", "meta", "contracts", "request-activation.md"), "utf8")
    : null;
  const compositions = new Map();
  const results = [];
  for (const testCase of selected) {
    const sandbox = mkdtempSync(join(tmpdir(), "agdf-request-activation-eval-"));
    try {
      const caseInput = requestActivationBehaviorInput(testCase);
      let prompt;
      let profileFingerprint;
      if (resolved.inputMode === "composed_profile") {
        const instructionSkill = testCase.composed_profile.instruction_skill;
        let composition = compositions.get(instructionSkill);
        if (!composition) {
          composition = await composeRequestActivationProfile({
            repoRoot,
            manifest,
            profileSurface: resolved.profileSurface,
            instructionSkill,
          });
          compositions.set(instructionSkill, composition);
        }
        profileFingerprint = composition.fingerprint;
        prompt = requestActivationComposedProfilePrompt(composition.model_instructions, caseInput);
      } else {
        prompt = requestActivationBehaviorPrompt(contract, caseInput);
      }
      const raw = await execute({
        evaluatorSurface: resolved.evaluatorSurface,
        cwd: sandbox,
        prompt,
        model,
        timeoutMs,
        caseInput,
      });
      const observation = parseObservation(raw);
      results.push({
        case_id: testCase.case_id,
        ...(profileFingerprint ? { profile_fingerprint: profileFingerprint } : {}),
        observation,
        transcript: typeof raw === "string" ? raw : JSON.stringify(raw),
        grade: gradeRequestActivationObservation(testCase, observation),
      });
    } finally {
      rmSync(sandbox, { recursive: true, force: true });
    }
  }
  const failed = results.filter(({ grade }) => grade.status !== "pass").length;
  return {
    schema_version: 1,
    evidence_kind: "behavioral_model",
    evidence_boundary: resolved.inputMode === "composed_profile"
      ? "Source-composed behavioral output is not deterministic proof, installed-profile readback or loaded-host evidence."
      : "Contract-supplied behavioral output is not deterministic proof, installed-profile readback or loaded-host evidence.",
    input_mode: resolved.inputMode,
    profile_surface: resolved.profileSurface,
    evaluator_surface: resolved.evaluatorSurface,
    evidence_plane: resolved.inputMode === "composed_profile" ? "source_composed" : "contract_supplied",
    adapter: `headless_${resolved.evaluatorSurface}`,
    model: model || "host_default",
    runtime_version: runtimeVersion(resolved.evaluatorSurface),
    corpus_version: deterministic.corpus_version,
    source_fingerprint: deterministic.source_fingerprint,
    session_start_baseline: resolved.inputMode === "composed_profile"
      ? "source_composed_not_loaded_host"
      : "not_applicable_headless_behavioral_eval",
    loaded_profile: false,
    ...(resolved.inputMode === "composed_profile" ? {
      source_compositions: [...compositions.entries()].map(([instructionSkill, composition]) => ({
        instruction_skill: instructionSkill,
        fingerprint: composition.fingerprint,
        components: composition.components,
      })),
    } : {}),
    recorded_at: new Date().toISOString(),
    cases: results.length,
    passed: results.length - failed,
    failed,
    status: failed === 0 ? "pass" : "block",
    results,
  };
}

export function persistRequestActivationBehavioralReport(path, report) {
  const validComposed = report?.input_mode === "composed_profile"
    && report.evidence_plane === "source_composed"
    && REQUEST_ACTIVATION_PROFILE_SURFACES.includes(report.profile_surface)
    && REQUEST_ACTIVATION_EVALUATOR_SURFACES.includes(report.evaluator_surface);
  const validCanonical = report?.input_mode === "canonical_contract"
    && report.evidence_plane === "contract_supplied"
    && report.profile_surface === null
    && REQUEST_ACTIVATION_EVALUATOR_SURFACES.includes(report.evaluator_surface);
  if (report?.evidence_kind !== "behavioral_model" || report.loaded_profile !== false || (!validComposed && !validCanonical)) {
    throw new Error("refusing to persist a report with ambiguous evidence provenance");
  }
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  renameSync(temp, path);
  return path;
}
