import process from "node:process";
import { extractField } from "../control-evaluation/verified-change.js";
import { DISPATCH_RECOVERY } from "../interaction-catalog.js";
import { evaluateGateCheck, isReadyUserGateApproval } from "../control-evaluation/gate-check.js";
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
          ...(dependencies.readSkillRuntimeContracts ? { runtime_contracts: dependencies.readSkillRuntimeContracts("brownfield-analysis") } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      const route = control.status_card?.mode_slice_decision ?? control.delivery_map?.mode_slice_decision?.decision;
      const structuredRoute = ["structured_slice", "structured_delivery"].includes(route);
      const tpIsFulfilled = control.status_card?.breadcrumb?.some((item) => item.gate === "TP" && item.status === "fulfilled");
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
          ...(dependencies.readSkillRuntimeContracts ? { runtime_contracts: dependencies.readSkillRuntimeContracts("brownfield-analysis") } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        timing.wrapper_ms = round(wrapperMilliseconds(now, env));
        return bindHostAction(result);
      }
      if (input.continue_delivery
          && control.status === "open"
          && control.current_gate === "PRD"
          && control.missing_approval === "Approval: PRD"
          && structuredRoute
          && !control.approval_presentation
          && !control.presentation_diagnostics?.approval_presentation_errors?.length) {
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({
          instruction: "Prepare and persist the PRD for this bound run from its approved UR and completed Brownfield Review. Include scope, acceptance criteria and non-goals at the smallest justified depth. Put product decisions needed for PRD approval in Approval Decisions; gather unresolved before_prd answers together before recording the final PRD revision. Defer only genuine design/planning decisions with named owners. Record the durable PRD in canonical run control, then dispatch again with the same run and target. Do not request Approval: PRD until the decision table is ready and the PRD is linked and presented.",
          phase: "required_gate_artifact",
          skill_id: "gate-check",
          gate: "PRD",
          governance_target: target.governance_target,
          run_id: result.control.run_id,
          revision_id: result.control.revision_id,
          artifact_path: `.agdf/control/artefacts/${result.control.run_id}/PRD.md`,
          source_artifacts: [
            `.agdf/control/artefacts/${result.control.run_id}/UR.md`,
            `.agdf/control/artefacts/${result.control.run_id}/BROWNFIELD_REVIEW.md`,
          ],
          presentation_language: input.presentation_language,
        });
        timing.total_ms = round(milliseconds(started, now()));
        timing.wrapper_ms = round(wrapperMilliseconds(now, env));
        return bindHostAction(result);
      }
      const sdRelationship = control.delivery_map?.relationships?.find((relationship) => relationship.from === "SD");
      if (input.continue_delivery
          && control.status === "open"
          && control.current_gate === "SD"
          && control.missing_approval === "Approval: SD"
          && structuredRoute
          && !control.approval_presentation
          && !control.presentation_diagnostics?.approval_presentation_errors?.length
          && sdRelationship?.status !== "pass") {
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({
          instruction: "Prepare and persist the Solution Design for this bound run directly from the approved PRD and its resolved Approval Decisions before presenting the next user card. Define architecture, boundaries, flows, technical ownership and trade-offs at the smallest justified depth. Ask only for genuine unresolved design choices; do not reopen answered product questions in SD. If new facts materially change product scope or acceptance, use the PRD revision route and obtain a new exact PRD approval first. Record the durable SD as derived from the approved PRD, then dispatch again with the same run and target. Do not create the Task/Test Plan or implement code before SD and TP approvals.",
          phase: "required_gate_artifact",
          skill_id: "gate-check",
          gate: "SD",
          governance_target: target.governance_target,
          run_id: result.control.run_id,
          revision_id: result.control.revision_id,
          artifact_path: `.agdf/control/artefacts/${result.control.run_id}/SD.md`,
          source_artifacts: [`.agdf/control/artefacts/${result.control.run_id}/PRD.md`],
          presentation_language: input.presentation_language,
        });
        timing.total_ms = round(milliseconds(started, now()));
        timing.wrapper_ms = round(wrapperMilliseconds(now, env));
        return bindHostAction(result);
      }
      const tpRelationship = control.delivery_map?.relationships?.find((relationship) => relationship.from === "TP");
      if (input.continue_delivery
          && control.status === "open"
          && control.current_gate === "TP"
          && control.missing_approval === "Approval: TP"
          && structuredRoute
          && !control.approval_presentation
          && !control.presentation_diagnostics?.approval_presentation_errors?.length
          && tpRelationship?.status !== "pass") {
        const result = baseResult({ outcome: "skill_continuation", terminal: false, skill, runtime, timing });
        result.target = target;
        result.control = controlSnapshot(control);
        result.continuation = Object.freeze({
          instruction: "Prepare and persist the Task/Test Plan for this bound run from its approved PRD and Solution Design before presenting the next user card. Map each implementation task to approved requirements and design decisions, define proportionate verification steps and the evidence each step must produce, and identify dependencies and risks. Record the durable TP in canonical run control as derived from the approved SD, then dispatch again with the same run and target. Do not implement code or claim QA or release readiness before TP approval.",
          phase: "required_gate_artifact",
          skill_id: "gate-check",
          gate: "TP",
          governance_target: target.governance_target,
          run_id: result.control.run_id,
          revision_id: result.control.revision_id,
          artifact_path: `.agdf/control/artefacts/${result.control.run_id}/TP.md`,
          source_artifacts: [
            `.agdf/control/artefacts/${result.control.run_id}/PRD.md`,
            `.agdf/control/artefacts/${result.control.run_id}/SD.md`,
          ],
          presentation_language: input.presentation_language,
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
          ...(dependencies.readSkillRuntimeContracts ? { runtime_contracts: dependencies.readSkillRuntimeContracts("release-or") } : {}),
        });
        timing.total_ms = round(milliseconds(started, now()));
        timing.wrapper_ms = round(wrapperMilliseconds(now, env));
        return bindHostAction(result);
      }
      if (control.status_card?.interaction_kind === "gate_approval"
          && isReadyUserGateApproval({ status: control.status, currentGate: control.current_gate, missingApproval: control.missing_approval })
          && !control.approval_presentation?.markdown) {
        throw new SkillDispatchRuntimeError(DISPATCH_RECOVERY.control_presentation_failed);
      }
      if ((input.intake || input.continue_delivery)
          && control.approval_presentation?.markdown) {
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
        const presentation = control.approval_presentation?.preview_markdown
          ? { markdown: control.approval_presentation.preview_markdown, authorizes: false }
          : control.status_presentation;
        if (!presentation) {
          throw new SkillDispatchRuntimeError(DISPATCH_RECOVERY.control_presentation_failed);
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
