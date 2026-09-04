import process from "node:process";
import { evaluateGateCheck } from "../control-evaluation/gate-check.js";
import { renderTaskTargetOrientation } from "../interaction-presentation.js";
import { resolveTaskTarget } from "../task-target-resolution.js";
import { SKILL_DISPATCH_CONTRACT_VERSION, SKILL_DISPATCH_SCHEMA_VERSION, SkillDispatchInputError, buildSkillDispatchRegistry, emptySkillDispatchTiming, normalizeSkillDispatchInput } from "./contract.js";

const defaultNow = () => process.hrtime.bigint();
const milliseconds = (start, end) => Number(end - start) / 1_000_000;
const round = (value) => Math.round(Math.max(0, value) * 1000) / 1000;

function runtimeEvidence(expectedVersion, env) {
  return {
    machine_validation: env.AGDF_MACHINE_VALIDATION || "unavailable",
    expected_version: expectedVersion,
    plugin_root: env.AGDF_DISPATCH_PLUGIN_ROOT || null,
    runtime_digest: env.AGDF_DISPATCH_RUNTIME_DIGEST || null,
    provenance_status: env.AGDF_DISPATCH_PROVENANCE_STATUS || null,
  };
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

function bindHostAction(result) {
  if (result.terminal && typeof result.presentation?.markdown === "string") {
    result.host_action = Object.freeze({
      mode: "transmit_presentation_verbatim_and_stop",
      source: "presentation.markdown",
      text: result.presentation.markdown,
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
  const evaluateGate = dependencies.evaluateGateCheck ?? evaluateGateCheck;
  const env = dependencies.env ?? process.env;

  return function executeSkillDispatch(rawInput) {
    const started = now();
    const timing = emptySkillDispatchTiming();
    const runtime = runtimeEvidence(rawInput.expectedVersion, env);
    let input;
    try {
      input = normalizeSkillDispatchInput(rawInput, buildSkillDispatchRegistry(rawInput.skillSet));
    } catch (error) {
      timing.input_ms = round(milliseconds(started, now()));
      timing.total_ms = timing.input_ms;
      timing.wrapper_ms = round(wrapperMilliseconds(now, env));
      const result = baseResult({ outcome: "invalid_input", terminal: true, runtime, timing });
      result.recovery = { action: "Correct the named dispatch input field and retry once." };
      result.diagnostics = [{ code: "dispatch_input_invalid", field: error instanceof SkillDispatchInputError ? error.field : "skill_registry", message: error instanceof Error ? error.message : String(error) }];
      return bindHostAction(result);
    }

    timing.input_ms = round(milliseconds(started, now()));
    const skill = input.skill;
    try {
      const targetStarted = now();
      const target = resolveTarget({ targetSource: input.target_source, primaryTarget: input.primary_target, workingDirectory: input.working_directory });
      timing.target_ms = round(milliseconds(targetStarted, now()));
      const renderStarted = now();
      const orientation = renderTarget(target, { registry: rawInput.interactionLocales, requestedLocale: input.presentation_language });
      timing.render_ms = round(milliseconds(renderStarted, now()));
      if (!orientation) throw new Error("task_target_orientation_unavailable");
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
      const control = evaluateGate(target.governance_target, input.run_id ? { runId: input.run_id } : {});
      timing.control_ms = round(milliseconds(controlStarted, now()));
      if (skill.dispatch_mode === "deterministic_control") {
        const presentation = control.approval_presentation ?? control.status_presentation;
        if (!presentation) {
          const diagnostics = control.presentation_diagnostics
            ? JSON.stringify(control.presentation_diagnostics)
            : "presentation_missing";
          throw new Error(`deterministic_control_presentation_unavailable: ${diagnostics}`);
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
      const result = baseResult({ outcome: "evaluator_error", terminal: true, skill, runtime, timing });
      result.recovery = { action: "Repair the existing evaluator or renderer and retry once." };
      result.diagnostics = [{ code: "dispatch_evaluator_error", message: error instanceof Error ? error.message : String(error) }];
      timing.total_ms = round(milliseconds(started, now()));
      timing.wrapper_ms = round(wrapperMilliseconds(now, env));
      return bindHostAction(result);
    }
  };
}
