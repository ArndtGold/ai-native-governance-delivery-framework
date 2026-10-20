import process from "node:process";
import { DISPATCH_RECOVERY } from "../interaction-catalog.js";
import { buildStatusCard, evaluateGateCheck, postApprovalTransition, printApprovalEnvelope, printGateCheckReport } from "../control-evaluation/gate-check.js";
import { evaluateDoctor } from "../control-evaluation/doctor.js";
import { evaluateDeliveryMap } from "../control-evaluation/delivery-map.js";
import { readRuntimeContract } from "../resources/contracts.js";
import { renderSkillDispatchInputRecovery, renderSkillDispatchRecovery, renderTaskTargetOrientation, renderActiveRunInventory } from "../interaction-presentation.js";
import { resolveTaskTarget, TaskTargetInputError } from "../task-target-resolution.js";
import { SKILL_DISPATCH_PRESENTATION_LANGUAGE_RECOVERY, SkillDispatchInputError, emptySkillDispatchTiming } from "../skill-dispatch/contract.js";
import { CONTROL_INSPECT_CONTRACT_VERSION, CONTROL_INSPECT_SCHEMA_VERSION, ReadSelectionError, normalizeControlInspectInput, inspectContractHelp, PRESENTATION_CATALOG_MODULE } from "./contract.js";
import { operationContract } from '../control-state/run-command-contract.js';
import { inspectRunOperation } from '../control-state/run-operation-status.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { readRunState } from '../control-evaluation/run-state.js';
import { inspectArtifactReadiness } from "./artifact-readiness.js";
import { policyForRunContent } from '../control-evaluation/run-step-policy.js';
import { parseRunState } from '../control-state/run-state-parser.js';
import { artefactFileDigest, runSealState } from '../control-state/run-seal.js';
import { readArtefactBindings } from '../control-state/artefact-bindings.js';
import { readPresentationDocument, readPresentationPreview, readPresentationCatalog } from '../control-state/run-presentation.js';
import { sourceRevisionBoundary } from '../control-state/run-revision-boundary.js';
import { sourceRevisionQualityFacts } from '../control-state/run-source-revisions.js';
import { readHistoryBytes } from '../control-state/run-revision-history.js';

// The MCP read tool is a projection over the existing evaluators. It calls exactly the functions the
// CLI handlers call and returns their --json report. Draft preflight additionally composes those
// existing content validators through its read-only Core owner; it adds no CLI command. It never writes,
// never selects a run on its own and never prepares an approval binding. Evaluators run with the
// dispatcher's dependency set: no git child process, so verified_change git observation is absent.

const defaultNow = () => process.hrtime.bigint();
const milliseconds = (start, end) => Number(end - start) / 1_000_000;
const round = (value) => Math.round(Math.max(0, value) * 1000) / 1000;

class ControlInspectRuntimeError extends Error {
  constructor(code) {
    super(code);
    this.name = "ControlInspectRuntimeError";
    this.code = code;
  }
}

function stage(code, callback) {
  try {
    return callback();
  } catch {
    throw new ControlInspectRuntimeError(code);
  }
}

function runtimeEvidence(expectedVersion, evidence, env) {
  if (evidence && typeof evidence === "object" && !Array.isArray(evidence)) {
    return Object.freeze({
      machine_validation: typeof evidence.machine_validation === "string" ? evidence.machine_validation : "unavailable",
      expected_version: expectedVersion,
      plugin_root: typeof evidence.plugin_root === "string" ? evidence.plugin_root : null,
      runtime_digest: typeof evidence.runtime_digest === "string" ? evidence.runtime_digest : null,
      provenance_status: typeof evidence.provenance_status === "string" ? evidence.provenance_status : null,
    });
  }
  return Object.freeze({
    machine_validation: env.AGDF_MACHINE_VALIDATION || "unavailable",
    expected_version: expectedVersion,
    plugin_root: env.AGDF_DISPATCH_PLUGIN_ROOT || null,
    runtime_digest: env.AGDF_DISPATCH_RUNTIME_DIGEST || null,
    provenance_status: env.AGDF_DISPATCH_PROVENANCE_STATUS || null,
  });
}

function baseResult({ outcome, operation, runtime, timing }) {
  return {
    schema_version: CONTROL_INSPECT_SCHEMA_VERSION,
    contract_version: CONTROL_INSPECT_CONTRACT_VERSION,
    outcome,
    terminal: outcome !== "inspect_result",
    authorizes: false,
    operation: operation ?? null,
    runtime,
    target: null,
    report: null,
    presentation: null,
    recovery: null,
    host_action: null,
    timing,
    diagnostics: [],
  };
}

function bindHostAction(result) {
  if (result.outcome === "inspect_result") {
    result.host_action = Object.freeze({
      mode: "consume_report_and_continue",
      source: result.presentation?.markdown ? "presentation.markdown" : "report",
      ...(result.presentation?.markdown ? { text: result.presentation.markdown } : {}),
      allow_surrounding_text: true,
      may_request_run_or_evidence: false,
    });
  } else if (result.presentation?.markdown) {
    result.host_action = Object.freeze({
      mode: "transmit_presentation_verbatim_and_stop",
      source: "presentation.markdown",
      text: result.presentation.markdown,
      allow_surrounding_text: false,
      may_request_run_or_evidence: false,
    });
  } else {
    result.host_action = Object.freeze({
      mode: "transmit_recovery_verbatim_and_stop",
      source: "recovery.action",
      text: result.recovery?.action ?? "",
      allow_surrounding_text: false,
      may_request_run_or_evidence: false,
    });
  }
  return Object.freeze(result);
}

export function createInspectFailureResult(code, runtime, action) {
  const result = baseResult({ outcome: "evaluator_error", runtime, timing: emptySkillDispatchTiming() });
  result.recovery = { action };
  result.diagnostics = [{ code }];
  return bindHostAction(result);
}

function gateCheckPresentation(report, variant, reEvaluate) {
  if (variant === "approval-envelope" || variant === "status-card") {
    const lines = [];
    const io = { log: (line = "") => lines.push(String(line)) };
    if (variant === "approval-envelope") printApprovalEnvelope(report, { io, reEvaluate });
    else printGateCheckReport(report, false, true, io);
    return lines.length ? { markdown: lines.join("\n"), authorizes: false } : null;
  }
  if (report.status_presentation?.markdown) return report.status_presentation;
  if (report.approval_presentation?.preview_markdown) return { markdown: report.approval_presentation.preview_markdown, authorizes: false };
  return null;
}

export function createControlInspectService(dependencies = {}) {
  const now = dependencies.now ?? defaultNow;
  const env = dependencies.env ?? process.env;
  const resolveTarget = dependencies.resolveTaskTarget ?? resolveTaskTarget;
  const renderTarget = dependencies.renderTaskTargetOrientation ?? renderTaskTargetOrientation;
  const renderInputRecovery = dependencies.renderSkillDispatchInputRecovery ?? renderSkillDispatchInputRecovery;
  const renderRecovery = dependencies.renderSkillDispatchRecovery ?? renderSkillDispatchRecovery;
  const doctor = dependencies.evaluateDoctor ?? evaluateDoctor;
  const gateCheck = dependencies.evaluateGateCheck ?? evaluateGateCheck;
  const deliveryMap = dependencies.evaluateDeliveryMap ?? evaluateDeliveryMap;
  const readContract = dependencies.readRuntimeContract ?? readRuntimeContract;
  const validateControlReadBoundary = dependencies.validateControlReadBoundary;
  const deliveryMapDependencies = Object.freeze({ evaluateDoctor: doctor, buildStatusCard, postApprovalTransition });

  return function executeControlInspect(rawInput) {
    const started = now();
    const timing = emptySkillDispatchTiming();
    const runtime = runtimeEvidence(rawInput.expectedVersion, dependencies.runtimeEvidence, env);
    let input;
    try {
      input = normalizeControlInspectInput(rawInput);
    } catch (error) {
      timing.input_ms = round(milliseconds(started, now()));
      timing.total_ms = timing.input_ms;
      const result = baseResult({ outcome: "invalid_input", operation: typeof rawInput.operation === "string" ? rawInput.operation : null, runtime, timing });
      const inputError = error instanceof SkillDispatchInputError || error instanceof TaskTargetInputError || error instanceof ReadSelectionError ? error : null;
      const field = inputError?.field ?? "arguments";
      // Shared read-selection rules keep the CLI wording so both surfaces reject identically.
      const action = error instanceof ReadSelectionError
        ? error.message
        : field === "presentation_language"
          ? SKILL_DISPATCH_PRESENTATION_LANGUAGE_RECOVERY
          : renderInputRecovery(
            { field, allowedValues: inputError?.allowedValues ?? [] },
            { registry: rawInput.interactionLocales, requestedLocale: rawInput.presentationLanguage },
          ) ?? "Repair the installed locale registry and retry once.";
      result.recovery = { action };
      result.diagnostics = [{ code: "inspect_input_invalid", field,
        ...(inputError?.allowedValues?.length ? { allowed_values: [...inputError.allowedValues] } : {}),
      }];
      return bindHostAction(result);
    }
    timing.input_ms = round(milliseconds(started, now()));
    try {
      const targetStarted = now();
      const target = stage(DISPATCH_RECOVERY.target_evaluation_failed, () => resolveTarget({
        targetSource: input.target_source, primaryTarget: input.primary_target, workingDirectory: input.working_directory,
      }));
      timing.target_ms = round(milliseconds(targetStarted, now()));
      if (target.resolution_state !== "resolved") {
        const renderStarted = now();
        const orientation = stage(DISPATCH_RECOVERY.target_presentation_failed, () => {
          const rendered = renderTarget(target, { registry: rawInput.interactionLocales, requestedLocale: input.presentation_language });
          if (!rendered) throw new Error("task_target_orientation_unavailable");
          return rendered;
        });
        timing.render_ms = round(milliseconds(renderStarted, now()));
        const result = baseResult({ outcome: "target_unresolved", operation: input.operation, runtime, timing });
        result.target = target;
        result.presentation = orientation;
        result.recovery = { action: target.next_action };
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      const controlStarted = now();
      const { report, presentation, invalidModule } = stage(DISPATCH_RECOVERY.control_evaluation_failed, () => {
        validateControlReadBoundary?.(target.governance_target);
        const selection = {
          ...(input.run_id ? { runId: input.run_id } : {}),
          ...(input.all_active ? { allActive: true } : {}),
        };
        switch (input.operation) {
          case 'presentation-document':
          case 'presentation-preview':
            return { report: (input.operation === 'presentation-preview' ? readPresentationPreview : readPresentationDocument)(target.governance_target, {
              runId: input.run_id, gate: input.gate, revisionId: input.expected_revision_id,
              presentationId: input.presentation_id, targetId: input.target_id, cursor: input.cursor,
            }), presentation: null };
          case 'runtime-generations':
          case 'native-qualification': {
            const state = readRunState(target.governance_target, { runId: input.run_id });
            const valid = parseRunState(state.content, input.run_id).valid && state.meta?.revision_id === input.expected_revision_id
              && runSealState(target.governance_target, state.content).status === 'valid';
            if (!valid) return { report: { available: false, reason: 'operation_binding_stale_or_invalid', authorizes: false }, presentation: null };
            if (input.operation === 'runtime-generations') return { report: dependencies.runtimeControl?.status()
              ?? { available: false, reason: 'connection_control_unavailable', authorizes: false }, presentation: null };
            const decision = gateCheck(target.governance_target, { runId: input.run_id, presentationLanguage: input.presentationLanguage });
            return { report: { available: true, run_id: input.run_id, revision_id: state.meta.revision_id,
              ui_rendering_support: 'unknown', action_qualification: { qualified: false, reason: 'host_context_unavailable', authorizes: false },
              business_readiness: { current_gate: decision.current_gate, status: decision.status,
                next_operation: decision.next_operation, blocking_reason: decision.blocking_reason }, authorizes: false }, presentation: null };
          }
          case 'operation-contract': {
            const state = readRunState(target.governance_target, { runId: input.run_id });
            const targetId = resolveControlCommandTarget(target.governance_target).target_id;
            const valid = parseRunState(state.content, input.run_id).valid && state.meta?.revision_id === input.expected_revision_id
              && runSealState(target.governance_target, state.content).status === 'valid';
            return { report: valid ? { ...operationContract(input.group, input.kind, { gate: input.gate }),
              ...(input.contract_module === PRESENTATION_CATALOG_MODULE ? {
                inspect_contract: inspectContractHelp(),
                presentation_catalog: readPresentationCatalog(target.governance_target, { runId: input.run_id,
                  revisionId: input.expected_revision_id, targetId, gate: input.gate, cursor: input.cursor,
                  workingDirectory: input.working_directory, targetSource: input.target_source,
                  primaryTarget: input.primary_target, language: input.presentation_language }),
              } : {}),
              ...(input.kind.startsWith('source_revision.') ? { revision_facts: {
                policy_version: 2, eligible_sources: ['UR', 'PRD', 'SD', 'TP'].filter(gate => sourceRevisionBoundary(state, gate, 2)),
                initiating_phase: policyForRunContent(target.governance_target, state.content, state.path).current_gate,
                quality_records: sourceRevisionQualityFacts(state, path => { try { return readHistoryBytes(target.governance_target, path).toString('utf8'); } catch { return undefined; } }),
              } } : {}),
              binding: { target_id: targetId, run_id: input.run_id, expected_revision_id: input.expected_revision_id },
              current: (() => { const decision = gateCheck(target.governance_target, { runId: input.run_id, presentationLanguage: input.presentationLanguage });
                return { current_gate: decision.current_gate, lifecycle: state.meta.lifecycle, status: decision.status, missing_approval: decision.missing_approval,
                  next_operation: decision.next_operation, completion: decision.completion,
                  artefacts: [...state.artefacts].filter(([type]) => ['UR', 'PRD', 'SD', 'TP', 'Brownfield Review', 'UX Intent Definition', 'Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR', 'QA', 'OR'].includes(type))
                    .map(([type, row]) => ({ type, path: row.path, status: row.status, digest: row.path ? artefactFileDigest(target.governance_target, row.path) : null,
                      association: state.evidence_applicability.by_step.get(type)?.applicability ?? 'applicability_unknown' })),
                  source_bindings: readArtefactBindings(state.content).active.map(row => ({ binding_id: row.binding_id, source: row.source, destination: row.destination, relationship: row.relationship })) }; })() }
              : { available: false, authorizes: false, reason: 'operation_binding_stale_or_invalid' }, presentation: null };
          }
          case 'operation-status':
            return { report: { ...inspectRunOperation(target.governance_target, { runId: input.run_id, operationId: input.operation_id, targetId: resolveControlCommandTarget(target.governance_target).target_id }), expected_revision_id: input.expected_revision_id }, presentation: null };
          case "artifact-readiness":
            return { report: inspectArtifactReadiness(target.governance_target, {
              runId: input.run_id, gate: input.gate, expectedRevisionId: input.expected_revision_id,
              presentationLanguage: input.presentation_language,
            }), presentation: null };
          case "doctor": {
            const evaluated = doctor(target.governance_target, selection);
            return { report: evaluated, presentation: input.all_active
              ? renderActiveRunInventory(evaluated, rawInput.interactionLocales, input.presentation_language) : null };
          }
          case "gate-check": {
            const evaluate = () => gateCheck(target.governance_target, { ...selection, presentationLanguage: input.presentation_language });
            const evaluated = evaluate();
            return { report: evaluated, presentation: gateCheckPresentation(evaluated, input.variant, evaluate) };
          }
          case "delivery-map": {
            const evaluated = deliveryMap(target.governance_target, selection, deliveryMapDependencies);
            return { report: evaluated, presentation: null };
          }
          case "contract": {
            const read = readContract(input.contract_module, { pluginRoot: null });
            if (!read.ok) return { report: null, presentation: null, invalidModule: read };
            return { report: { module: read.module, content: read.content }, presentation: { markdown: read.content, authorizes: false } };
          }
          default:
            throw new Error("unsupported_operation");
        }
      });
      timing.control_ms = round(milliseconds(controlStarted, now()));
      if (invalidModule) {
        const result = baseResult({ outcome: "invalid_input", operation: input.operation, runtime, timing });
        result.target = target;
        // Same wording as the CLI `contract` handler's error output.
        result.recovery = { action: `${invalidModule.reason}: ${input.contract_module}. Available modules: ${invalidModule.modules.join(", ")}` };
        result.diagnostics = [{ code: "inspect_input_invalid", field: "module", allowed_values: [...invalidModule.modules] }];
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      const result = baseResult({ outcome: "inspect_result", operation: input.operation, runtime, timing });
      result.target = target;
      result.report = report;
      result.presentation = presentation;
      timing.total_ms = round(milliseconds(started, now()));
      return bindHostAction(result);
    } catch (error) {
      const code = error instanceof ControlInspectRuntimeError ? error.code : DISPATCH_RECOVERY.internal_failure;
      let action;
      try {
        action = renderRecovery({ code }, { registry: rawInput.interactionLocales, requestedLocale: input.presentation_language });
      } catch {
        action = null;
      }
      const result = baseResult({ outcome: "evaluator_error", operation: input.operation, runtime, timing });
      result.recovery = { action: action ?? "Repair the installed locale registry and retry once." };
      result.diagnostics = [{ code: `inspect_${code}` }];
      timing.total_ms = round(milliseconds(started, now()));
      return bindHostAction(result);
    }
  };
}
