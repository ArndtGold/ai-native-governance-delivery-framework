import process from "node:process";
import { extractField } from "../control-evaluation/verified-change.js";
import { DISPATCH_RECOVERY } from "../interaction-catalog.js";
import { evaluateGateCheck } from "../control-evaluation/gate-check.js";
import { renderSkillDispatchInputRecovery, renderSkillDispatchRecovery, renderTaskTargetOrientation } from "../interaction-presentation.js";
import { resolveTaskTarget, TaskTargetInputError } from "../task-target-resolution.js";
import { DELIVERY_INTAKE_OPERATION, deliveryIntakePhase, deliveryIntakeSteps, quoteDispatchArgument } from "./delivery-intake.js";
import { SKILL_DISPATCH_CONTRACT_VERSION, SKILL_DISPATCH_PRESENTATION_LANGUAGE_RECOVERY, SKILL_DISPATCH_SCHEMA_VERSION, SkillDispatchInputError, buildSkillDispatchRegistry, emptySkillDispatchTiming, normalizeSkillDispatchInput } from "./contract.js";

const defaultNow = () => process.hrtime.bigint();
const milliseconds = (start, end) => Number(end - start) / 1_000_000;
const round = (value) => Math.round(Math.max(0, value) * 1000) / 1000;

class SkillDispatchRuntimeError extends Error {
  constructor(code) {
    super(code);
    this.name = "SkillDispatchRuntimeError";
    this.code = code;
  }
}

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
      may_request_run_or_evidence: false,
    });
  } else if (result.outcome === "intake_continuation") {
    result.host_action = Object.freeze({
      mode: "continue_delivery_intake",
      source: "continuation.steps",
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

function controlSnapshot(report, { includeCandidateRuns = false } = {}) {
  return Object.freeze({
    status: report.status,
    current_gate: report.current_gate,
    blocking_reason: report.blocking_reason,
    missing_approval: report.missing_approval,
    next_allowed_action: report.next_allowed_action,
    run_id: report.status_card?.run_id ?? null,
    revision_id: report.approval_presentation?.revision_id ?? extractField(report.status_card?.runState?.content ?? "", "revision_id") ?? null,
    doctor_status: report.doctor_status,
    ...(includeCandidateRuns ? { candidate_runs: candidateRunsSnapshot(report) } : {}),
  });
}

export function createSkillDispatchService(dependencies = {}) {
  const now = dependencies.now ?? defaultNow;
  const resolveTarget = dependencies.resolveTaskTarget ?? resolveTaskTarget;
  const renderTarget = dependencies.renderTaskTargetOrientation ?? renderTaskTargetOrientation;
  const renderInputRecovery = dependencies.renderSkillDispatchInputRecovery ?? renderSkillDispatchInputRecovery;
  const renderRecovery = dependencies.renderSkillDispatchRecovery ?? renderSkillDispatchRecovery;
  const evaluateGate = dependencies.evaluateGateCheck ?? evaluateGateCheck;
  const resolveIntakePhase = dependencies.deliveryIntakePhase ?? deliveryIntakePhase;
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
      input = normalizeSkillDispatchInput(rawInput, buildSkillDispatchRegistry(rawInput.skillSet));
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
    const skill = input.skill;
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
      const control = runDispatchStage(DISPATCH_RECOVERY.control_evaluation_failed, () => {
        validateControlReadBoundary?.(target.governance_target);
        return evaluateGate(target.governance_target, {
          ...(input.run_id ? { runId: input.run_id } : {}),
          presentationLanguage: input.presentation_language,
        });
      });
      timing.control_ms = round(milliseconds(controlStarted, now()));
      let intake;
      try {
        intake = skill.dispatch_mode === "deterministic_control" && input.intake
        ? resolveIntakePhase(target.governance_target, control, input)
        : null;
      } catch (error) {
        const result = baseResult({ outcome: "control_result", terminal: true, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.diagnostics = [{ code: error.message === "AGDF_RUN_COLLISION" ? "AGDF_RUN_COLLISION" : "AGDF_CANONICAL_SCAFFOLD_REQUIRED" }];
        result.recovery = { action: error.message === "AGDF_RUN_COLLISION"
          ? (input.presentation_language === "de" ? "Die Run-ID ist bereits belegt. Den bestehenden Auftrag ausdrücklich zuordnen oder für den neuen Umfang eine unbenutzte ID wählen." : "The run id already exists. Bind an explicit continuation or choose an unused id for the new scope.")
          : (input.presentation_language === "de" ? "Das kanonische Kontrollgerüst prüfen und vor der Run-Erstellung wiederherstellen." : "Inspect and restore the canonical control scaffold before creating the run.") };
        return bindHostAction(result);
      }
      if (intake) {
        const result = baseResult({ outcome: "intake_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({
          instruction: "Continue the same delivery intake without asking the user: run these AGDF validator steps in order, then dispatch again. They persist intake bookkeeping only; they approve no gate and authorize no implementation.",
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
      const modeDecision = control.status_card?.runState?.mode_slice_decision?.decision ?? control.mode_slice_decision;
      const preApprovalRouting = control.current_gate === "UR"
        && control.missing_approval === "Approval: UR"
        && (!modeDecision || modeDecision === "undecided")
        && Boolean(control.approval_presentation);
      if ((input.intake || input.continue_delivery)
          && control.status === "open"
          && (preApprovalRouting || (control.missing_approval === "none" && ["Brownfield Review", "Mode/Slice Decision"].includes(control.current_gate)))) {
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({
          instruction: preApprovalRouting
            ? "Complete Brownfield Review and proportional routing before preparing UR approval; record evidence, then re-evaluate. Do not approve or implement."
            : "Execute Brownfield Review and proportional routing for this bound run, then re-evaluate. Stop with the concrete blocker if the same state remains; never loop or infer another gate approval.",
          phase: preApprovalRouting ? "pre_ur_approval_routing" : "post_ur_review",
          skill_id: "brownfield-analysis",
          mode: preApprovalRouting ? "pre_ur_approval" : "post_ur_review",
          governance_target: target.governance_target,
          run_id: result.control.run_id,
          revision_id: result.control.revision_id,
          presentation_language: input.presentation_language,
          ...(dependencies.readSkillRuntimeContracts ? { runtime_contracts: dependencies.readSkillRuntimeContracts("brownfield-analysis") } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      if ((input.intake || input.continue_delivery) && control.approval_presentation) {
        const result = baseResult({ outcome: "intake_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
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
        const presentation = control.approval_presentation ?? control.status_presentation;
        if (!presentation) {
          throw new SkillDispatchRuntimeError(DISPATCH_RECOVERY.control_presentation_failed);
        }
        const result = baseResult({ outcome: "control_result", terminal: true, skill, runtime, timing });
        result.target = target;
        result.control = control;
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
        instruction: "Execute the named skill using only this target, presentation language and control snapshot.",
        skill_id: skill.skill_id,
        presentation_language: input.presentation_language,
        governance_target: target.governance_target,
        run_id: snapshot?.run_id ?? input.run_id,
        ...(dependencies.readSkillRuntimeContracts ? {
          runtime_contracts: runDispatchStage(DISPATCH_RECOVERY.runtime_contracts_unavailable, () => dependencies.readSkillRuntimeContracts(skill.skill_id)),
        } : {}),
      });
      timing.total_ms = round(milliseconds(started, now()));
      timing.wrapper_ms = round(wrapperMilliseconds(now, env));
      return bindHostAction(result);
    } catch (error) {
      const recoveryCode = error instanceof SkillDispatchRuntimeError ? error.code : DISPATCH_RECOVERY.internal_failure;
      const result = baseResult({ outcome: "evaluator_error", terminal: true, skill, runtime, timing });
      let recoveryAction;
      try {
        recoveryAction = renderRecovery(
          { code: recoveryCode },
          { registry: rawInput.interactionLocales, requestedLocale: input.presentation_language },
        );
      } catch {
        recoveryAction = null;
      }
      result.recovery = {
        action: recoveryAction ?? "Repair the installed locale registry and retry once.",
      };
      result.diagnostics = [{ code: `dispatch_${recoveryCode}` }];
      timing.total_ms = round(milliseconds(started, now()));
      timing.wrapper_ms = round(wrapperMilliseconds(now, env));
      return bindHostAction(result);
    }
  };
}
