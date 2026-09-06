import process from "node:process";
import { evaluateGateCheck } from "../control-evaluation/gate-check.js";
import { renderSkillDispatchInputRecovery, renderSkillDispatchRecovery, renderTaskTargetOrientation } from "../interaction-presentation.js";
import { resolveTaskTarget, TaskTargetInputError } from "../task-target-resolution.js";
import { SKILL_DISPATCH_CONTRACT_VERSION, SKILL_DISPATCH_SCHEMA_VERSION, SkillDispatchInputError, buildSkillDispatchRegistry, emptySkillDispatchTiming, normalizeSkillDispatchInput } from "./contract.js";

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
    throw new SkillDispatchRuntimeError("runtime_evidence_invalid");
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

function controlSnapshot(report) {
  return Object.freeze({
    status: report.status,
    current_gate: report.current_gate,
    blocking_reason: report.blocking_reason,
    missing_approval: report.missing_approval,
    next_allowed_action: report.next_allowed_action,
    run_id: report.status_card?.run_id ?? null,
    revision_id: report.approval_presentation?.revision_id ?? null,
    doctor_status: report.doctor_status,
  });
}

export function createSkillDispatchService(dependencies = {}) {
  const now = dependencies.now ?? defaultNow;
  const resolveTarget = dependencies.resolveTaskTarget ?? resolveTaskTarget;
  const renderTarget = dependencies.renderTaskTargetOrientation ?? renderTaskTargetOrientation;
  const renderInputRecovery = dependencies.renderSkillDispatchInputRecovery ?? renderSkillDispatchInputRecovery;
  const renderRecovery = dependencies.renderSkillDispatchRecovery ?? renderSkillDispatchRecovery;
  const evaluateGate = dependencies.evaluateGateCheck ?? evaluateGateCheck;
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
      const action = renderInputRecovery(
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
      const target = runDispatchStage("target_evaluation_failed", () => resolveTarget({ targetSource: input.target_source, primaryTarget: input.primary_target, workingDirectory: input.working_directory }));
      timing.target_ms = round(milliseconds(targetStarted, now()));
      const renderStarted = now();
      const orientation = runDispatchStage("target_presentation_failed", () => {
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
      const control = runDispatchStage("control_evaluation_failed", () => {
        validateControlReadBoundary?.(target.governance_target);
        return evaluateGate(target.governance_target, input.run_id ? { runId: input.run_id } : {});
      });
      timing.control_ms = round(milliseconds(controlStarted, now()));
      if (skill.dispatch_mode === "deterministic_control") {
        const presentation = control.approval_presentation ?? control.status_presentation;
        if (!presentation) {
          throw new SkillDispatchRuntimeError("control_presentation_failed");
        }
        const result = baseResult({ outcome: "control_result", terminal: true, skill, runtime, timing });
        result.target = target;
        result.control = control;
        result.presentation = presentation;
        timing.total_ms = round(milliseconds(started, now()));
        timing.wrapper_ms = round(wrapperMilliseconds(now, env));
        return bindHostAction(result);
      }

      const snapshot = skill.requires_control_snapshot ? controlSnapshot(control) : null;
      const result = baseResult({ outcome: "skill_continuation", terminal: false, skill, runtime, timing });
      result.target = target;
      result.control = snapshot;
      result.continuation = Object.freeze({ instruction: "Execute the named skill using only this target and control snapshot.", skill_id: skill.skill_id, governance_target: target.governance_target, run_id: snapshot?.run_id ?? input.run_id });
      timing.total_ms = round(milliseconds(started, now()));
      timing.wrapper_ms = round(wrapperMilliseconds(now, env));
      return bindHostAction(result);
    } catch (error) {
      const recoveryCode = error instanceof SkillDispatchRuntimeError ? error.code : "internal_failure";
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
