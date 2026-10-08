import { readFileSync } from "node:fs";
import { hasSymlinkComponent } from "../control-state/contained-file.js";
import { artefactFileDigest } from "../control-state/run-seal.js";
import { resolvedArtefactFile } from "../control-evaluation/run-state.js";
import { prdDefinitionPhase } from "./prd-definition.js";
import { sdDefinitionPhase } from "./sd-definition.js";
import process from "node:process";
import { extractField } from "../control-evaluation/verified-change.js";
import { DISPATCH_RECOVERY } from "../interaction-catalog.js";
import { resolveArtifactPresentationLanguages } from "../resources/context.js";
import { evaluateGateCheck, isReadyUserGateApproval } from "../control-evaluation/gate-check.js";
import { CD_TESTS_NEXT_ALLOWED_ACTION } from "../control-evaluation/gate-policy.js";
import { renderSkillDispatchInputRecovery, renderSkillDispatchRecovery, renderTaskTargetOrientation } from "../interaction-presentation.js";
import { resolveTaskTarget, TaskTargetInputError } from "../task-target-resolution.js";
import { DELIVERY_INTAKE_OPERATION, deliveryIntakePhase, deliveryIntakeSteps, urDefinitionPhase, quoteDispatchArgument } from "./delivery-intake.js";
import { deliveryRunAssignmentContinuation, readDeliveryRunInventory } from "./delivery-run-assignment.js";
import { SKILL_DISPATCH_CONTRACT_VERSION, SKILL_DISPATCH_PRESENTATION_LANGUAGE_RECOVERY, SKILL_DISPATCH_SCHEMA_VERSION, SkillDispatchInputError, buildSkillDispatchRegistry, emptySkillDispatchTiming, normalizeSkillDispatchInput } from "./contract.js";

// Read contained exact input facts only. Eligibility and control authority stay separate.
function readDefinitionSources(targetDir, control, gate, sourceTypes) {
  if (control.current_gate !== gate) return null;
  const state = control.status_card?.runState;
  if (!state || hasSymlinkComponent(targetDir, `.agdf/control/artefacts/${control.status_card.run_id}/${gate}.md`)) return null;
  const sources = [];
  for (const type of sourceTypes) {
    const path = String(state.artefacts.get(type)?.path ?? "").replace(/^`|`$/gu, "");
    const file = resolvedArtefactFile(targetDir, path);
    if (!file) return null;
    sources.push({ type, path, digest: artefactFileDigest(targetDir, path) });
  }
  const review = readFileSync(resolvedArtefactFile(targetDir, sources[1].path), "utf8");
  if (extractField(review, "ux_intent_definition_required") === "yes") {
    const path = String(state.artefacts.get("UX Intent Definition")?.path
      ?? `.agdf/control/artefacts/${control.status_card.run_id}/UX_INTENT_DEFINITION.md`).replace(/^`|`$/gu, "");
    const file = resolvedArtefactFile(targetDir, path);
    if (!file || extractField(readFileSync(file, "utf8"), "decision") !== "ready") return null;
    sources.push({ type: "UX Intent Definition", path, digest: artefactFileDigest(targetDir, path) });
  }
  return sources;
}

const defaultNow = () => process.hrtime.bigint();
const milliseconds = (start, end) => Number(end - start) / 1_000_000;
const round = (value) => Math.round(Math.max(0, value) * 1000) / 1000;

class SkillDispatchRuntimeError extends Error {
  constructor(code, details = "") {
    super(code);
    this.name = "SkillDispatchRuntimeError";
    this.code = code;
    this.details = details;
  }
}

const presentationRecovery = (control) => String(control?.presentation_diagnostics?.approval_presentation_recovery ?? "").trim();

function runDispatchStage(code, callback) {
  try {
    return callback();
  } catch {
    throw new SkillDispatchRuntimeError(code);
  }
}

function runtimeEvidence(expectedVersion, env) {
  return {
    machine_validation: env.AGDF_MACHINE_VALIDATION || "unavailable",
    expected_version: expectedVersion,
    plugin_root: env.AGDF_DISPATCH_PLUGIN_ROOT || null,
    runtime_digest: env.AGDF_DISPATCH_RUNTIME_DIGEST || null,
    provenance_status: env.AGDF_DISPATCH_PROVENANCE_STATUS || null,
  };
}

function trustedRuntimeEvidence(expectedVersion, evidence) {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    throw new SkillDispatchRuntimeError(DISPATCH_RECOVERY.runtime_evidence_invalid);
  }
  return Object.freeze({
    machine_validation: typeof evidence.machine_validation === "string" ? evidence.machine_validation : "unavailable",
    expected_version: expectedVersion,
    plugin_root: typeof evidence.plugin_root === "string" ? evidence.plugin_root : null,
    runtime_digest: typeof evidence.runtime_digest === "string" ? evidence.runtime_digest : null,
    provenance_status: typeof evidence.provenance_status === "string" ? evidence.provenance_status : null,
  });
}

function wrapperMilliseconds(now, env) {
  const raw = env.AGDF_DISPATCH_WRAPPER_START_NS;
  if (!raw || !/^\d+$/u.test(raw)) return 0;
  try { return milliseconds(BigInt(raw), now()); } catch { return 0; }
}

function baseResult({ outcome, terminal, skill, runtime, timing }) {
  return {
    schema_version: SKILL_DISPATCH_SCHEMA_VERSION,
    contract_version: SKILL_DISPATCH_CONTRACT_VERSION,
    outcome,
    terminal,
    authorizes: false,
    skill: skill ?? null,
    runtime,
    target: null,
    control: null,
    presentation: null,
    continuation: null,
    recovery: null,
    host_action: null,
    timing,
    diagnostics: [],
  };
}

function terminalPresentationAction(presentation) {
  if (typeof presentation?.markdown === "string" && presentation.markdown) {
    return { source: "presentation.markdown", text: presentation.markdown };
  }
  if (!Array.isArray(presentation?.sequence) || !presentation.sequence.length) return null;
  const parts = presentation.sequence.map((blockId) => {
    if (blockId === "approval_interaction") {
      return presentation.approval_interaction?.exact_text_fallback;
    }
    return presentation.blocks?.[blockId]?.markdown;
  });
  if (parts.some((part) => typeof part !== "string" || !part.trim())) return null;
  return { source: "presentation.sequence", text: parts.join("\n\n") };
}

function bindHostAction(result) {
  const presentationAction = terminalPresentationAction(result.presentation);
  if (result.terminal && presentationAction) {
    result.host_action = Object.freeze({
      mode: "transmit_presentation_verbatim_and_stop",
      ...presentationAction,
      allow_surrounding_text: false,
      may_request_run_or_evidence: result.control?.blocking_reason === "AGDF_ACTIVE_RUN_AMBIGUOUS",
    });
  } else if (result.outcome === "intake_continuation") {
    result.host_action = Object.freeze({
      mode: "continue_delivery_intake",
      source: result.continuation?.phase === "resolve_delivery_run" ? "continuation" : "continuation.steps",
      bound_to_target: true,
    });
  } else if (result.terminal) {
    result.host_action = Object.freeze({
      mode: "transmit_recovery_verbatim_and_stop",
      source: "recovery.action",
      text: result.recovery?.action ?? "",
      allow_surrounding_text: false,
      may_request_run_or_evidence: false,
    });
  } else {
    result.host_action = Object.freeze({
      mode: "continue_named_skill",
      source: "continuation",
      bound_to_target: true,
    });
  }
  return result;
}

function candidateRunsSnapshot(report) {
  return Object.freeze((Array.isArray(report?.candidate_runs) ? report.candidate_runs : [])
    .filter((candidate) => typeof candidate?.run_id === "string" && candidate.run_id)
    .map((candidate) => Object.freeze({
      run_id: candidate.run_id,
      display_title: String(candidate.display_title ?? ""),
      objective: String(candidate.objective ?? ""),
      current_gate: String(candidate.current_gate ?? ""),
      decision: String(candidate.decision ?? ""),
      next_allowed_action: String(candidate.next_allowed_action ?? ""),
      revision_id: String(candidate.revision_id ?? ""),
    })));
}

function gateRouteSnapshot(report) {
  const gate = typeof report?.current_gate === "string" && report.current_gate.trim()
    ? report.current_gate
    : null;
  if (!gate) return null;
  const skill = report?.status_card?.next_skill;
  return Object.freeze({
    gate,
    skills: typeof skill === "string" && skill && skill !== "none" ? [skill] : [],
  });
}

function controlSnapshot(report, { includeCandidateRuns = false } = {}) {
  return Object.freeze({
    status: report.status,
    current_gate: report.current_gate,
    gate_route: gateRouteSnapshot(report),
    blocking_reason: report.blocking_reason,
    missing_approval: report.missing_approval,
    next_operation: report.next_operation ?? null,
    next_allowed_action: report.next_allowed_action,
    run_id: report.status_card?.run_id ?? null,
    revision_id: report.approval_presentation?.revision_id ?? extractField(report.status_card?.runState?.content ?? "", "revision_id") ?? null,
    doctor_status: report.doctor_status,
    ...(report.source_revisions ? { source_revisions: report.source_revisions } : {}),
    ...(report.relationship_correction ? { relationship_correction: report.relationship_correction } : {}),
    ...(includeCandidateRuns ? { candidate_runs: candidateRunsSnapshot(report) } : {}),
  });
}

export function createSkillDispatchFailure({ skill, runtime, timing, code, details, interactionLocales,
  presentationLanguage, renderRecovery = renderSkillDispatchRecovery }) {
  const result = baseResult({ outcome: "evaluator_error", terminal: true, skill, runtime, timing });
  let action;
  try { action = renderRecovery({ code }, { registry: interactionLocales, requestedLocale: presentationLanguage }); }
  catch { action = null; }
  result.recovery = { action: [action ?? "Repair the installed locale registry and retry once.", details].filter(Boolean).join("\n\n") };
  result.diagnostics = [{ code: `dispatch_${code}` }];
  return bindHostAction(result);
}

// Routing and presentation only. The application continuation owner coordinates mutations.
export function createSkillDispatchService(dependencies = {}) {
  const now = dependencies.now ?? defaultNow;
  const resolveTarget = dependencies.resolveTaskTarget ?? resolveTaskTarget;
  const renderTarget = dependencies.renderTaskTargetOrientation ?? renderTaskTargetOrientation;
  const renderInputRecovery = dependencies.renderSkillDispatchInputRecovery ?? renderSkillDispatchInputRecovery;
  const renderRecovery = dependencies.renderSkillDispatchRecovery ?? renderSkillDispatchRecovery;
  const evaluateGate = dependencies.evaluateGateCheck ?? evaluateGateCheck;
  const resolveIntakePhase = dependencies.deliveryIntakePhase ?? deliveryIntakePhase;
  const readRunInventory = dependencies.readDeliveryRunInventory ?? readDeliveryRunInventory;
  const validateControlReadBoundary = dependencies.validateControlReadBoundary;
  const env = dependencies.env ?? process.env;

  return function executeSkillDispatch(rawInput) {
    const started = now();
    const timing = emptySkillDispatchTiming();
    const runtime = dependencies.runtimeEvidence
      ? trustedRuntimeEvidence(rawInput.expectedVersion, dependencies.runtimeEvidence)
      : runtimeEvidence(rawInput.expectedVersion, env);
    let input;
    try {
      input = normalizeSkillDispatchInput(rawInput, buildSkillDispatchRegistry(dependencies.pluginDefinition?.skillSet ?? rawInput.skillSet), dependencies.pluginDefinition);
    } catch (error) {
      timing.input_ms = round(milliseconds(started, now()));
      timing.total_ms = timing.input_ms;
      timing.wrapper_ms = round(wrapperMilliseconds(now, env));
      const result = baseResult({ outcome: "invalid_input", terminal: true, runtime, timing });
      const inputError = error instanceof SkillDispatchInputError || error instanceof TaskTargetInputError ? error : null;
      const field = inputError?.field ?? "skill_registry";
      const allowedValues = inputError?.allowedValues ?? [];
      const action = field === "presentation_language"
        ? SKILL_DISPATCH_PRESENTATION_LANGUAGE_RECOVERY
        : renderInputRecovery(
          { field, allowedValues },
          { registry: rawInput.interactionLocales, requestedLocale: rawInput.presentationLanguage },
        ) ?? "Repair the installed locale registry and retry once.";
      result.recovery = { action };
      result.diagnostics = [{
        code: "dispatch_input_invalid",
        field,
        ...(allowedValues.length ? { allowed_values: allowedValues } : {}),
      }];
      return bindHostAction(result);
    }

    timing.input_ms = round(milliseconds(started, now()));
    let skill = input.skill;
    try {
      const targetStarted = now();
      const target = runDispatchStage(DISPATCH_RECOVERY.target_evaluation_failed, () => resolveTarget({ targetSource: input.target_source, primaryTarget: input.primary_target, workingDirectory: input.working_directory }));
      timing.target_ms = round(milliseconds(targetStarted, now()));
      const renderStarted = now();
      const orientation = runDispatchStage(DISPATCH_RECOVERY.target_presentation_failed, () => {
        const rendered = renderTarget(target, { registry: rawInput.interactionLocales, requestedLocale: input.presentation_language });
        if (!rendered) throw new Error("task_target_orientation_unavailable");
        return rendered;
      });
      timing.render_ms = round(milliseconds(renderStarted, now()));
      if (target.resolution_state !== "resolved") {
        const result = baseResult({ outcome: "target_unresolved", terminal: true, skill, runtime, timing });
        result.target = target;
        result.presentation = orientation;
        result.recovery = { action: target.next_action };
        timing.total_ms = round(milliseconds(started, now()));
        timing.wrapper_ms = round(wrapperMilliseconds(now, env));
        return bindHostAction(result);
      }

      const controlStarted = now();
      const assignmentResult = (candidates, reason) => {
        const result = baseResult({ outcome: "intake_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.continuation = deliveryRunAssignmentContinuation(target.governance_target, input, candidates, reason);
        timing.control_ms = round(milliseconds(controlStarted, now()));
        timing.total_ms = round(milliseconds(started, now()));
        timing.wrapper_ms = round(wrapperMilliseconds(now, env));
        return bindHostAction(result);
      };
      if ((input.intake && (!input.run_id || input.expected_revision_id)) || (["ur-definition", "prd-definition", "sd-definition"].includes(skill.skill_id) && !input.run_id)) {
        let candidates;
        try {
          validateControlReadBoundary?.(target.governance_target);
          candidates = readRunInventory(target.governance_target);
        } catch (error) {
          const code = error.code === "AGDF_CANONICAL_SCAFFOLD_REQUIRED" ? "intake_scaffold_required"
            : error.code === "AGDF_RUN_ASSIGNMENT_INVENTORY_INVALID" ? "run_assignment_inventory_invalid" : null;
          if (!code) throw new SkillDispatchRuntimeError(DISPATCH_RECOVERY.control_evaluation_failed);
          const result = baseResult({ outcome: "control_result", terminal: true, skill, runtime, timing });
          result.target = target;
          result.diagnostics = [{ code: error.code, ...(error.findings ? { findings: error.findings } : {}) }];
          const details = (error.findings ?? []).map((finding) =>
            `- ${[finding.code, finding.run_id, finding.path].filter(Boolean).map((value) => String(value).replace(/[\r\n|`]/gu, " ")).join(" · ")}`).join("\n");
          result.recovery = { action: [renderRecovery({ code }, { registry: rawInput.interactionLocales, requestedLocale: input.presentation_language }), details].filter(Boolean).join("\n\n") };
          timing.control_ms = round(milliseconds(controlStarted, now()));
          timing.total_ms = round(milliseconds(started, now()));
          return bindHostAction(result);
        }
        const selected = candidates.find((candidate) => candidate.run_id === input.run_id);
        if (!input.run_id || selected?.revision_id !== input.expected_revision_id) {
          return assignmentResult(candidates, input.run_id ? "stale_assignment" : "unbound_delivery");
        }
      }
      const control = runDispatchStage(DISPATCH_RECOVERY.control_evaluation_failed, () => {
        validateControlReadBoundary?.(target.governance_target);
        return evaluateGate(target.governance_target, {
          ...(input.run_id ? { runId: input.run_id } : {}),
          ...((input.intake || ["ur-definition", "prd-definition", "sd-definition"].includes(skill.skill_id)) ? { ignoreRunIdEnv: true } : {}),
          presentationLanguage: input.presentation_language,
        });
      });
      if (input.expected_revision_id
          && controlSnapshot(control).revision_id !== input.expected_revision_id) {
        return assignmentResult(runDispatchStage(DISPATCH_RECOVERY.control_evaluation_failed,
          () => readRunInventory(target.governance_target)), "stale_assignment");
      }
      timing.control_ms = round(milliseconds(controlStarted, now()));
      let intake;
      try {
        intake = skill.dispatch_mode === "deterministic_control" && input.intake
        ? resolveIntakePhase(target.governance_target, control, input)
        : null;
      } catch (error) {
        const code = error.message === "AGDF_RUN_COLLISION" ? "AGDF_RUN_COLLISION"
          : error.code === "AGDF_CANONICAL_SCAFFOLD_REQUIRED" ? "AGDF_CANONICAL_SCAFFOLD_REQUIRED" : null;
        // Only the two known intake refusals are reported as such; anything else keeps its real class.
        if (!code) throw new SkillDispatchRuntimeError(DISPATCH_RECOVERY.control_evaluation_failed);
        const result = baseResult({ outcome: "control_result", terminal: true, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.diagnostics = [{ code }];
        result.recovery = { action: renderRecovery({ code: code === "AGDF_RUN_COLLISION" ? DISPATCH_RECOVERY.intake_run_collision
          : DISPATCH_RECOVERY.intake_scaffold_required }, { registry: rawInput.interactionLocales, requestedLocale: input.presentation_language }) };
        return bindHostAction(result);
      }
      const urPhase = input.prd_action || input.sd_action ? null : urDefinitionPhase(target.governance_target, control, input);
      if (urPhase) {
        const urSkill = buildSkillDispatchRegistry(dependencies.pluginDefinition?.skillSet ?? rawInput.skillSet).get("ur-definition");
        if (!urSkill) throw new SkillDispatchRuntimeError(DISPATCH_RECOVERY.runtime_contracts_unavailable);
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill: urSkill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({ ...urPhase,
          ...(dependencies.readSkillRuntimeContracts ? { runtime_contracts: runDispatchStage(DISPATCH_RECOVERY.runtime_contracts_unavailable,
            () => dependencies.readSkillRuntimeContracts("ur-definition")) } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      // Check the pure authoring route before reading sources. Presentation and unrelated
      // control failures retain their existing diagnosis instead of entering authoring checks.
      const prdEligible = prdDefinitionPhase(target.governance_target, control, input, []);
      const prdSources = prdEligible ? runDispatchStage(DISPATCH_RECOVERY.prd_authoring_inputs_invalid,
        () => readDefinitionSources(target.governance_target, control, "PRD", ["UR", "Brownfield Review"])) : null;
      if (prdEligible && !prdSources) {
        const result = baseResult({ outcome: "control_result", terminal: true, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.diagnostics = [{ code: "prd_authoring_inputs_invalid" }];
        result.recovery = { action: renderRecovery({ code: DISPATCH_RECOVERY.prd_authoring_inputs_invalid },
          { registry: rawInput.interactionLocales, requestedLocale: input.presentation_language }) };
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      const prdPhase = prdDefinitionPhase(target.governance_target, control, input, prdSources);
      if (prdPhase) {
        const prdSkill = buildSkillDispatchRegistry(dependencies.pluginDefinition?.skillSet ?? rawInput.skillSet).get("prd-definition");
        if (!prdSkill) throw new SkillDispatchRuntimeError(DISPATCH_RECOVERY.runtime_contracts_unavailable);
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill: prdSkill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({ ...prdPhase,
          ...(dependencies.readSkillRuntimeContracts ? { runtime_contracts: runDispatchStage(DISPATCH_RECOVERY.runtime_contracts_unavailable,
            () => dependencies.readSkillRuntimeContracts("prd-definition")) } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      const sdEligible = sdDefinitionPhase(target.governance_target, control, input, []);
      const sdSources = sdEligible ? runDispatchStage(DISPATCH_RECOVERY.sd_authoring_inputs_invalid,
        () => readDefinitionSources(target.governance_target, control, "SD", ["PRD", "Brownfield Review"])) : null;
      if (sdEligible && !sdSources) {
        const result = baseResult({ outcome: "control_result", terminal: true, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.diagnostics = [{ code: "sd_authoring_inputs_invalid" }];
        result.recovery = { action: renderRecovery({ code: DISPATCH_RECOVERY.sd_authoring_inputs_invalid },
          { registry: rawInput.interactionLocales, requestedLocale: input.presentation_language }) };
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      const sdPhase = sdDefinitionPhase(target.governance_target, control, input, sdSources);
      if (sdPhase) {
        const sdSkill = buildSkillDispatchRegistry(dependencies.pluginDefinition?.skillSet ?? rawInput.skillSet).get("sd-definition");
        if (!sdSkill) throw new SkillDispatchRuntimeError(DISPATCH_RECOVERY.runtime_contracts_unavailable);
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill: sdSkill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({ ...sdPhase,
          ...(dependencies.readSkillRuntimeContracts ? { runtime_contracts: runDispatchStage(DISPATCH_RECOVERY.runtime_contracts_unavailable,
            () => dependencies.readSkillRuntimeContracts("sd-definition")) } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      if ((input.ur_action && !urPhase) || (input.prd_action && !prdPhase) || (input.sd_action && !sdPhase)) {
        // A declined revision route cannot turn into post-UR or later artefact preparation.
        if (!control.status_presentation) throw new SkillDispatchRuntimeError(DISPATCH_RECOVERY.control_presentation_failed, presentationRecovery(control));
        const result = baseResult({ outcome: "control_result", terminal: true, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.presentation = control.status_presentation;
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      // Direct UR invocation must not fall through to the generic judgement writer route.
      if (["ur-definition", "prd-definition", "sd-definition"].includes(skill.skill_id)) skill = buildSkillDispatchRegistry(dependencies.pluginDefinition?.skillSet ?? rawInput.skillSet).get("gate-check");
      if (intake?.phase === "run_missing") {
        const result = baseResult({ outcome: "intake_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({
          instruction: "Continue the same delivery intake without asking the user: run these AGDF validator steps in order, then dispatch again. Use the returned run-create revision in the following resume dispatch. They persist intake bookkeeping only; they approve no gate and authorize no implementation.",
          operation_id: DELIVERY_INTAKE_OPERATION,
          phase: intake.phase,
          presentation_language: input.presentation_language,
          governance_target: target.governance_target,
          run_id: intake.run_id,
          revision_id: intake.revision_id,
          steps: deliveryIntakeSteps(target.governance_target, intake),
        });
        timing.total_ms = round(milliseconds(started, now()));
        timing.wrapper_ms = round(wrapperMilliseconds(now, env));
        return bindHostAction(result);
      }
      if ((input.intake || input.continue_delivery)
          && control.status === "open"
          && control.missing_approval === "none"
          && ["Brownfield Review", "Mode/Slice Decision"].includes(control.current_gate)) {
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({
          instruction: "Execute brownfield-analysis for this bound run without continue_delivery. Record Brownfield Review and proportional routing, then redispatch gate-check with the same run and continue_delivery: true. Stop with the concrete blocker if the same state remains; never loop or infer another gate approval.",
          phase: "post_ur_review",
          skill_id: "brownfield-analysis",
          mode: "post_ur_review",
          governance_target: target.governance_target,
          run_id: result.control.run_id,
          revision_id: result.control.revision_id,
          presentation_language: input.presentation_language,
          ...(dependencies.readSkillRuntimeContracts ? { runtime_contracts: runDispatchStage(DISPATCH_RECOVERY.runtime_contracts_unavailable, () => dependencies.readSkillRuntimeContracts("brownfield-analysis")) } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      const route = control.status_card?.mode_slice_decision ?? control.delivery_map?.mode_slice_decision?.decision;
      const structuredRoute = ["structured_slice", "structured_delivery"].includes(route);
      const tpIsFulfilled = control.status_card?.breadcrumb?.some((item) => item.gate === "TP" && item.status === "fulfilled");
      if (input.continue_delivery && control.status === "open" && control.current_gate === "CD+Tests"
          && control.missing_approval === "none" && structuredRoute && tpIsFulfilled
          && control.next_allowed_action === CD_TESTS_NEXT_ALLOWED_ACTION) {
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({
          phase: "implementation", skill_id: "gate-check", governance_target: target.governance_target,
          run_id: result.control.run_id, revision_id: result.control.revision_id, presentation_language: input.presentation_language,
          instruction: "Implement only the already approved TP scope, run its required checks, and maintain evidence for this bound run. Use the interaction event policy: routine internal checks need no standalone status card; meaningful events and explicit status remain visible. After recorded control changes, redispatch gate-check for this same target/run with continue_delivery. Stop at the next human decision or concrete blocker; never infer QA, UAT or release approval.",
          ...(control.relationship_correction ? { relationship_correction: control.relationship_correction } : {}),
          ...(dependencies.readSkillRuntimeContracts ? { runtime_contracts: runDispatchStage(DISPATCH_RECOVERY.runtime_contracts_unavailable, () => dependencies.readSkillRuntimeContracts("gate-check")) } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      if (input.continue_delivery
          && control.status === "open"
          && control.current_gate === "Brownfield Analysis"
          && control.missing_approval === "none"
          && structuredRoute
          && tpIsFulfilled) {
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({
          instruction: "Run brownfield-analysis without continue_delivery for this bound run against its approved TP and the existing system before CD+Tests. Identify owners, reusable components, affected interfaces and data, regression risks, test impact and the minimal safe implementation path. Persist the analysis and mark the internal step complete in canonical run control, then redispatch gate-check with the same run and continue_delivery: true. Do not begin CD+Tests until the review and control record are complete.",
          phase: "pre_implementation_analysis",
          skill_id: "brownfield-analysis",
          mode: "pre_implementation_analysis",
          governance_target: target.governance_target,
          run_id: controlSnapshot(control).run_id,
          revision_id: controlSnapshot(control).revision_id,
          presentation_language: input.presentation_language,
          ...(dependencies.readSkillRuntimeContracts ? { runtime_contracts: runDispatchStage(DISPATCH_RECOVERY.runtime_contracts_unavailable, () => dependencies.readSkillRuntimeContracts("brownfield-analysis")) } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        timing.wrapper_ms = round(wrapperMilliseconds(now, env));
        return bindHostAction(result);
      }
      if (input.continue_delivery && control.status === "open" && control.next_operation?.type === "reassess_source_analysis") {
        const owner = control.next_operation.skill_id;
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill, runtime, timing });
        result.target = target; result.control = controlSnapshot(control);
        result.continuation = Object.freeze({ phase: "source_analysis_reassessment", skill_id: owner,
          governance_target: target.governance_target, run_id: result.control.run_id, revision_id: result.control.revision_id,
          presentation_language: input.presentation_language,
          instruction: "Use the existing analytical owner under the current approved UR. Persist the renewed analysis in this bound Run before dependent source authoring, then redispatch gate-check for the same target/run. Do not change approved product intent or infer implementation authority.",
          ...(dependencies.readSkillRuntimeContracts ? { runtime_contracts: runDispatchStage(DISPATCH_RECOVERY.runtime_contracts_unavailable, () => dependencies.readSkillRuntimeContracts(owner)) } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      if (input.continue_delivery && control.next_operation?.type === "prepare_gate_artifact") {
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        const artifact = control.next_operation;
        result.continuation = Object.freeze({
          phase: "required_gate_artifact",
          skill_id: artifact.skill_id,
          gate: artifact.gate,
          governance_target: target.governance_target,
          run_id: result.control.run_id,
          revision_id: result.control.revision_id,
          artifact_path: artifact.artifact_path,
          source_artifacts: artifact.source_artifacts,
          instruction: "Follow the gate-artifact-preparation runtime contract for this exact gate and the supplied canonical artefact/source paths. Persist the required artefact in the selected run, then redispatch gate-check for the same target/run; do not ask for approval until the fresh dispatch supplies a valid presentation.",
          ...resolveArtifactPresentationLanguages(target.governance_target, input.presentation_language),
          ...(dependencies.readSkillRuntimeContracts ? {
            runtime_contracts: runDispatchStage(DISPATCH_RECOVERY.runtime_contracts_unavailable, () => dependencies.readSkillRuntimeContracts("gate-check")),
          } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        timing.wrapper_ms = round(wrapperMilliseconds(now, env));
        return bindHostAction(result);
      }
      const runState = control.status_card?.runState;
      const orArtefact = runState?.artefacts?.get?.("OR");
      const uatIsFulfilled = control.status_card?.breadcrumb?.some((item) => item.gate === "UAT" && item.status === "fulfilled");
      if (input.continue_delivery
          && control.status === "open"
          && control.current_gate === "OR"
          && control.missing_approval === "none"
          && structuredRoute
          && uatIsFulfilled
          && orArtefact?.status !== "done") {
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({
          instruction: "Produce and persist the Orchestration Report for this bound run using its recorded approvals, artefacts, Task Plan, implementation and test evidence, QA result, and UAT approval. Preserve any missing evidence and risks explicitly; do not perform commit, push, PR, release or other VCS actions. After the OR is recorded, dispatch again with the same run and target.",
          phase: "post_uat_closeout",
          skill_id: "release-or",
          governance_target: target.governance_target,
          run_id: controlSnapshot(control).run_id,
          revision_id: controlSnapshot(control).revision_id,
          presentation_language: input.presentation_language,
          ...(dependencies.readSkillRuntimeContracts ? { runtime_contracts: runDispatchStage(DISPATCH_RECOVERY.runtime_contracts_unavailable, () => dependencies.readSkillRuntimeContracts("release-or")) } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        timing.wrapper_ms = round(wrapperMilliseconds(now, env));
        return bindHostAction(result);
      }
      if (control.status_card?.interaction_kind === "gate_approval"
          && isReadyUserGateApproval({ status: control.status, currentGate: control.current_gate, missingApproval: control.missing_approval })
          && !control.approval_presentation?.markdown) {
        throw new SkillDispatchRuntimeError(DISPATCH_RECOVERY.control_presentation_failed, presentationRecovery(control));
      }
      const nextSkillId = control.status_card?.next_skill;
      const routeNextSkill = input.continue_delivery && !control.approval_presentation?.markdown
        && nextSkillId && nextSkillId !== "none"
        && (control.current_gate !== "QA" || control.missing_approval === "Approval: QA");
      if (routeNextSkill) skill = buildSkillDispatchRegistry(dependencies.pluginDefinition?.skillSet ?? rawInput.skillSet).get(nextSkillId) ?? skill;
      if ((input.intake || input.continue_delivery)
          && control.approval_presentation?.markdown) {
        const result = baseResult({ outcome: "intake_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        // Read-only preview rendered by gate-check; run-present remains the only binding writer and the
        // gate question is asked only after it returned a presentation_id.
        const preview = control.approval_presentation;
        result.presentation = preview?.preview_markdown ? Object.freeze({
          schema_version: SKILL_DISPATCH_SCHEMA_VERSION,
          semantic_block: "approval_preview",
          run_id: result.control.run_id,
          revision_id: preview.revision_id ?? result.control.revision_id,
          current_gate: control.current_gate,
          presentation_language: input.presentation_language,
          markdown: preview.preview_markdown,
          artefact_digest: preview.artefact_digest ?? null,
          summary_digest: preview.summary_digest ?? null,
          authorizes: false,
        }) : null;
        result.continuation = Object.freeze({
          instruction: "Prepare this exact gate with run-present, show its returned text verbatim, then stop and wait for a NEW deliberate user response. Do not redispatch or apply an earlier reply.",
          phase: "presentation_required", governance_target: target.governance_target,
          run_id: result.control.run_id, revision_id: result.control.revision_id,
          steps: [{ id: "prepare_presentation", argv: ["run-present", "--dir", target.governance_target, "--run", result.control.run_id, "--gate", control.current_gate, "--revision", result.control.revision_id, "--language", input.presentation_language], command: `run-present --dir ${quoteDispatchArgument(target.governance_target)} --run ${result.control.run_id} --gate ${control.current_gate} --revision ${result.control.revision_id} --language ${input.presentation_language}` }],
        });
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      if (skill.dispatch_mode === "deterministic_control") {
        const presentation = control.approval_presentation?.preview_markdown
          ? { markdown: control.approval_presentation.preview_markdown, authorizes: false }
          : control.status_presentation;
        if (!presentation) {
          throw new SkillDispatchRuntimeError(DISPATCH_RECOVERY.control_presentation_failed, presentationRecovery(control));
        }
        const result = baseResult({ outcome: "control_result", terminal: true, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control, { includeCandidateRuns: true });
        result.presentation = presentation;
        timing.total_ms = round(milliseconds(started, now()));
        timing.wrapper_ms = round(wrapperMilliseconds(now, env));
        return bindHostAction(result);
      }

      const snapshot = skill.requires_control_snapshot
        ? controlSnapshot(control, { includeCandidateRuns: skill.skill_id === "qa-gate" })
        : null;
      const result = baseResult({ outcome: "skill_continuation", terminal: false, skill, runtime, timing });
      result.target = target;
      result.control = snapshot;
      result.continuation = Object.freeze({
        instruction: "Execute the named skill using only this target, presentation language and control snapshot. Do not set continue_delivery on a judgement skill; use it only when redispatching gate-check for the same run.",
        skill_id: skill.skill_id,
        presentation_language: input.presentation_language,
        governance_target: target.governance_target,
        run_id: snapshot?.run_id ?? input.run_id,
        revision_id: snapshot?.revision_id ?? null,
        ...(dependencies.readSkillRuntimeContracts ? {
          runtime_contracts: runDispatchStage(DISPATCH_RECOVERY.runtime_contracts_unavailable, () => dependencies.readSkillRuntimeContracts(skill.skill_id)),
        } : {}),
      });
      timing.total_ms = round(milliseconds(started, now()));
      timing.wrapper_ms = round(wrapperMilliseconds(now, env));
      return bindHostAction(result);
    } catch (error) {
      const recoveryCode = error instanceof SkillDispatchRuntimeError ? error.code : DISPATCH_RECOVERY.internal_failure;
      timing.total_ms = round(milliseconds(started, now()));
      timing.wrapper_ms = round(wrapperMilliseconds(now, env));
      return createSkillDispatchFailure({ skill, runtime, timing, code: recoveryCode, details: error?.details,
        interactionLocales: rawInput.interactionLocales, presentationLanguage: input.presentation_language, renderRecovery });
    }
  };
}
