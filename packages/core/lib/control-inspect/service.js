import { baseResult, bindHostAction } from "./result.js";
import { inspectArtefactRecordingMode } from '../control-state/run-artefact-recording.js';
import { preparedCommandCall } from '../control-state/prepared-control-calls.js';
import { inspectProjectState } from './project-state.js';
import process from "node:process";
import { DISPATCH_RECOVERY } from "../interaction-catalog.js";
import { buildStatusCard, evaluateGateCheck, postApprovalTransition, printApprovalEnvelope, printGateCheckReport } from "../control-evaluation/gate-check.js";
import { evaluateDoctor } from "../control-evaluation/doctor.js";
import { evaluateDeliveryMap } from "../control-evaluation/delivery-map.js";
import { readRuntimeContract, runtimeContractModules } from "../resources/contracts.js";
import { renderSkillDispatchInputRecovery, renderSkillDispatchRecovery, renderTaskTargetOrientation, renderActiveRunInventory, renderRunInventory } from "../interaction-presentation.js";
import { resolveTaskTarget, TaskTargetInputError } from "../task-target-resolution.js";
import { SKILL_DISPATCH_PRESENTATION_LANGUAGE_RECOVERY, SkillDispatchInputError, emptySkillDispatchTiming } from "../skill-dispatch/contract.js";
import { CONTROL_INSPECT_CONTRACT_VERSION, CONTROL_INSPECT_SCHEMA_VERSION, ReadSelectionError, normalizeControlInspectInput, inspectContractHelp, inspectModuleRecoveryCall, OPERATION_CONTRACT_MODULES, PRESENTATION_CATALOG_MODULE } from "./contract.js";
import { RUN_COMMAND_DESCRIPTORS, operationContract } from '../control-state/run-command-contract.js';
import { PROPOSAL_COMMAND_KINDS, PROPOSAL_MATERIAL_SLOT } from '../control-state/run-command-schema.js';
import { inspectRunOperation } from '../control-state/run-operation-status.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { readRunState } from '../control-evaluation/run-state.js';
import { readRunInventory } from '../control-state/run-inventory-reader.js';
import { inspectArtifactReadiness } from "./artifact-readiness.js";
import { policyForRunContent } from '../control-evaluation/run-step-policy.js';
import { parseRunState } from '../control-state/run-state-parser.js';
import { artefactFileDigest, runSealState } from '../control-state/run-seal.js';
import { readArtefactBindings } from '../control-state/artefact-bindings.js';
import { readPresentationDocument, readPresentationPreview, readPresentationCatalog } from '../control-state/run-presentation.js';
import { sourceRevisionBoundary } from '../control-state/run-revision-boundary.js';
import { sourceRevisionQualityFacts } from '../control-state/run-source-revisions.js';
import { readHistoryBytes } from '../control-state/run-revision-history.js';
import { creationRunId } from '../control-state/run-create-command.js';
import { inspectAuthoringInputs } from './authoring-inputs.js';
import { PLANNING_COMMAND_KINDS } from '../control-state/run-command-schema.js';
import { inspectPlannedEntry, inspectPlannedOperation, plannedEntryPath } from '../control-state/planned-entry.js';
import { controlPathPresent } from '../control-read/snapshot.js';
import { inspectPlannedHandoffOperation } from '../control-state/planned-handoff.js';
import { readPlannedInventory, readWorkInventory } from '../control-state/planned-inventory.js';
import { readControlLayout, CURRENT_LAYOUT } from '../control-state/control-layout.js';
import { existsSync } from '../control-read/fs.js';
import { join } from 'node:path';

// Read-only projection of canonical CLI evaluators and Core validators. It never
// writes, selects a Run or prepares approval. Git observations are unavailable.

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
  const readModules = dependencies.runtimeContractModules ?? runtimeContractModules;
  const validateControlReadBoundary = dependencies.validateControlReadBoundary;
  const deliveryMapDependencies = Object.freeze({ evaluateDoctor: doctor, buildStatusCard, postApprovalTransition });

  return function executeControlInspect(rawInput, { signal } = {}) {
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
      if (field === 'module') {
        const supplied = { operation: rawInput.operation,
          ...Object.fromEntries([['module', 'contractModule'], ['working_directory', 'workingDirectory'],
            ['primary_target', 'primaryTarget'], ['target_source', 'targetSource'], ['presentation_language', 'presentationLanguage'],
            ['run_id', 'runId'], ['expected_revision_id', 'expectedRevisionId'], ['gate', 'gate'], ['target_id', 'targetId']]
            .filter(([, key]) => rawInput[key] !== undefined).map(([field, key]) => [field, rawInput[key]])) };
        // Preserve unsupported selectors too, so they prevent a misleading
        // executable suggestion rather than disappearing from the new lookup.
        for (const [field, key] of [['presentation_id', 'presentationId'], ['cursor', 'cursor'], ['planning', 'planning'], ['all_active', 'allActive']])
          if (rawInput[key] !== undefined) supplied[field] = rawInput[key];
        const next = inspectModuleRecoveryCall(supplied);
        if (next) result.recovery.next_calls = [next];
      }
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
      if (input.target_id && resolveControlCommandTarget(target.governance_target).target_id !== input.target_id) {
        const result = baseResult({ outcome: 'invalid_input', operation: input.operation, runtime, timing });
        result.target = target;
        result.diagnostics = [{ code: 'target_binding_mismatch', field: 'target_id' }];
        result.recovery = { action: renderInputRecovery({ field: 'target_id', allowedValues: [] },
          { registry: rawInput.interactionLocales, requestedLocale: input.presentation_language }) };
        timing.total_ms = round(milliseconds(started, now()));
        return bindHostAction(result);
      }
      if (input.operation === 'doctor' && dependencies.observeDoctor) {
        const controlStarted = now();
        return Promise.resolve(dependencies.observeDoctor(target.governance_target, input, signal)).then(report => {
          timing.control_ms = round(milliseconds(controlStarted, now()));
          const result = baseResult({ outcome: 'inspect_result', operation: input.operation, runtime, timing });
          result.target = target; result.report = report;
          // Reuse the existing localized inventory only when this reply holds
          // the complete inventory. Paged replies remain explicit scoped data;
          // the agent follows every advertised cursor before summarizing them.
          if (input.all_active && report.available && report.completeness === 'complete'
            && report.inventory?.accounted_count === report.runs?.length + (report.invalid_entries?.length ?? 0)) {
            const renderStarted = now();
            result.presentation = renderActiveRunInventory(report, rawInput.interactionLocales, input.presentation_language);
            timing.render_ms = round(milliseconds(renderStarted, now()));
          }
          timing.total_ms = round(milliseconds(started, now())); return bindHostAction(result);
        });
      }
      const controlStarted = now();
      const { report, presentation, invalidModule, navigation } = stage(DISPATCH_RECOVERY.control_evaluation_failed, () => {
        validateControlReadBoundary?.(target.governance_target);
        const selection = {
          ...(input.run_id ? { runId: input.run_id } : {}),
          ...(input.all_active ? { allActive: true } : {}),
        };
        switch (input.operation) {
          case 'presentation-document':
          case 'presentation-preview': {
            const report = (input.operation === 'presentation-preview' ? readPresentationPreview : readPresentationDocument)(target.governance_target, {
              runId: input.run_id, gate: input.gate, revisionId: input.expected_revision_id,
              presentationId: input.presentation_id, targetId: input.target_id, cursor: input.cursor,
            });
            if (input.operation === 'presentation-document' && report.available) report.delivery_instruction = 'If full text is requested and an explicitly configured verified host renderer consumes these MCP pages, fetch all next_cursor pages with the exact original binding; let that renderer verify and output the bytes. Otherwise send this content verbatim in a user-visible agent message BEFORE fetching next_cursor, repeating in byte order. Tool output alone is not delivery. Retain already read pages. Never claim complete delivery from a successful read alone. Rendering is not human approval.';
            return { report, presentation: null };
          }
          case 'runtime-generations':
          case 'native-qualification': {
            const state = readRunState(target.governance_target, { runId: input.run_id });
            const valid = parseRunState(state.content, input.run_id).valid && state.meta?.revision_id === input.expected_revision_id
              && runSealState(target.governance_target, state.content).status === 'valid';
            if (!valid) return { report: { available: false, reason: 'operation_binding_stale_or_invalid', authorizes: false }, presentation: null };
            if (input.operation === 'runtime-generations') return { report: dependencies.runtimeControl?.status()
              ?? { available: false, reason: 'connection_control_unavailable', authorizes: false }, presentation: null };
            const decision = gateCheck(target.governance_target, { runId: input.run_id, presentationLanguage: input.presentation_language });
            return { report: { available: true, run_id: input.run_id, revision_id: state.meta.revision_id,
              ui_rendering_support: 'unknown', action_qualification: { qualified: false, reason: 'host_context_unavailable', authorizes: false },
              business_readiness: { current_gate: decision.current_gate, status: decision.status,
                next_operation: decision.next_operation, blocking_reason: decision.blocking_reason }, authorizes: false }, presentation: null };
          }
          case 'operation-contract': {
            if (PLANNING_COMMAND_KINDS.includes(input.kind) && !input.run_id) {
              const contract = operationContract(input.group, input.kind);
              return { report: { ...contract, binding: { target_id: resolveControlCommandTarget(target.governance_target).target_id },
                next_calls: [{ tool: input.group, kind: input.kind, instruction: contract.planning_capture?.instructions
                  ?? 'Use the confirmed planning scope and original UUID; no Run/revision. Planning never approves a gate. Start a Run only from a deliberately selected complete source.' }] }, presentation: null };
            }
            if (['agdf_run', 'agdf_project'].includes(input.group) && !input.run_id) {
              const prepared = preparedCommandCall(input.group, input.kind, { ...input, presentation_language: input.presentation_language,
                target_id: resolveControlCommandTarget(target.governance_target).target_id });
              return { report: { ...operationContract(input.group, input.kind),
              binding: { target_id: resolveControlCommandTarget(target.governance_target).target_id },
              prepared_call: prepared, next_calls: prepared?.state === 'ready' ? [prepared.call] : [],
              next_action: input.group === 'agdf_project' ? 'Explicit fixed setup only. No Run, repair, installation or approval.'
                : 'Fill the prepared title from the authorized original request, preserving its UUID and target. No prior Run/revision.' }, presentation: null };
            }
            const state = readRunState(target.governance_target, { runId: input.run_id });
            const targetId = resolveControlCommandTarget(target.governance_target).target_id;
            const valid = parseRunState(state.content, input.run_id).valid && state.meta?.revision_id === input.expected_revision_id
              && runSealState(target.governance_target, state.content).status === 'valid';
            return { report: valid ? { ...operationContract(input.group, input.kind, { gate: input.gate ?? state.current_gate }),
              prepared_call: preparedCommandCall(input.group, input.kind, { ...input, presentation_language: input.presentation_language, target_id: targetId },
                { gate: input.gate ?? state.current_gate, recording: inspectArtefactRecordingMode(state, input.gate ?? state.current_gate) }),
              ...(input.kind === 'artefact.record' ? { recording: inspectArtefactRecordingMode(state, input.gate ?? state.current_gate) } : {}),
              // Revision proposals are staged in their own slot. Offer that staging form with the
              // revision commands and beside a material.stage form, whose prepared_call uses the gate's slot.
              ...(PROPOSAL_COMMAND_KINDS.includes(input.kind) || input.kind === 'material.stage' ? { material_call: preparedCommandCall('agdf_record', 'material.stage',
                { ...input, presentation_language: input.presentation_language, target_id: targetId }, { gate: PROPOSAL_MATERIAL_SLOT }) } : {}),
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
              current: (() => { const decision = gateCheck(target.governance_target, { runId: input.run_id, presentationLanguage: input.presentation_language });
                return { current_gate: decision.current_gate, lifecycle: state.meta.lifecycle, status: decision.status, missing_approval: decision.missing_approval,
                  next_operation: decision.next_operation, completion: decision.completion,
                  artefacts: [...state.artefacts].filter(([type]) => ['UR', 'PRD', 'SD', 'TP', 'Brownfield Review', 'UX Intent Definition', 'Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR', 'QA', 'OR'].includes(type))
                    .map(([type, row]) => ({ type, path: row.path, status: row.status, digest: row.path ? artefactFileDigest(target.governance_target, row.path) : null,
                      association: state.evidence_applicability.by_step.get(type)?.applicability ?? 'applicability_unknown' })),
                  source_bindings: readArtefactBindings(state.content).active.map(row => ({ binding_id: row.binding_id, source: row.source, destination: row.destination, relationship: row.relationship })) }; })() }
              : { available: false, authorizes: false, reason: 'operation_binding_stale_or_invalid' }, presentation: null };
          }
          case 'project-state':
            return { report: inspectProjectState(target.governance_target, input, dependencies.gitObservation), presentation: null };
          case 'operation-status':
            if (input.planning) return { report: input.contract_module.startsWith('run.create_from_planned/')
              ? inspectPlannedHandoffOperation(target.governance_target, input.planning.plan_id, input.operation_id)
              : inspectPlannedOperation(target.governance_target, input.planning.plan_id, input.operation_id), presentation: null };
            if (input.contract_module.startsWith('project.initialize/')) return { report: inspectProjectState(target.governance_target, input, dependencies.gitObservation), presentation: null };
            return { report: { ...inspectRunOperation(target.governance_target, { runId: input.run_id ?? creationRunId(input.operation_id), operationId: input.operation_id, targetId: resolveControlCommandTarget(target.governance_target).target_id }), expected_revision_id: input.expected_revision_id ?? null,
              ...(!input.run_id ? { lookup_scope: 'run_creation', recovery_instruction: 'This target-only lookup is for Run creation. For a write to an existing Run, inspect operation-status with the original run_id, original expected_revision_id and the same original UUID in module. An unavailable creation lookup does not prove an approval effect. Never substitute a fresh UUID or infer success from a changed gate alone.' } : {}) }, presentation: null };
          case "artifact-readiness":
            return { report: inspectArtifactReadiness(target.governance_target, {
              runId: input.run_id, gate: input.gate, expectedRevisionId: input.expected_revision_id,
              presentationLanguage: input.presentation_language,
            }), presentation: null };
          case 'authoring-inputs':
            return { report: inspectAuthoringInputs(target.governance_target, input, { gitObservation: dependencies.gitObservation }), presentation: null };
          case 'planned-inventory': {
            const inventory = readPlannedInventory(target.governance_target, { language: input.presentation_language });
            return { report: { ...inventory, available: inventory.state !== 'unavailable' }, presentation: null };
          }
          case 'planned-entry': {
            const path = plannedEntryPath(input.planning.plan_id);
            if (!controlPathPresent(target.governance_target, `${path}/UR.md`)) {
              const inventory = readPlannedInventory(target.governance_target, { language: input.presentation_language });
              const unavailable = inventory.state === 'unavailable', incomplete = existsSync(join(target.governance_target, path));
              return { report: { available: false, state: unavailable ? 'unavailable' : 'missing',
                reason: unavailable ? 'planning_store_unavailable' : incomplete ? 'planned_document_missing' : 'planned_entry_missing',
                plan_id: input.planning.plan_id, authorizes: false,
                ...(unavailable ? { findings: inventory.findings } : {}),
                ...(!unavailable && !incomplete && input.planning.expected_digest === null ? { next_calls: [{ tool: 'agdf_inspect',
                  arguments: { operation: 'authoring-inputs', working_directory: input.working_directory,
                    target_source: input.target_source, primary_target: input.primary_target,
                    presentation_language: input.presentation_language, planning: input.planning },
                  instruction: 'Read the version-matched UR inputs before capture. Planning authoring needs no module, gate, Run or revision.' }] } : {}) }, presentation: null };
            }
            const entry = inspectPlannedEntry(target.governance_target, input.planning.plan_id, { presentationLanguage: input.presentation_language });
            return { report: input.planning.expected_digest && input.planning.expected_digest !== entry.digest
              ? { available: false, reason: 'planning_source_stale', plan_id: input.planning.plan_id, authorizes: false }
              : { ...entry, available: true }, presentation: null };
          }
          case "doctor": {
            const evaluated = doctor(target.governance_target, selection);
            return { report: evaluated, presentation: input.all_active
              ? renderActiveRunInventory(evaluated, rawInput.interactionLocales, input.presentation_language) : null };
          }
          case "gate-check": {
            const evaluate = () => gateCheck(target.governance_target, { ...selection, presentationLanguage: input.presentation_language });
            const evaluated = evaluate();
            let navigation;
            // Optional hints never replace the canonical report.
            try {
              if (input.run_id && input.target_source && input.primary_target && evaluated.status_card?.run_id === input.run_id) {
                const revisionId = evaluated.status_card.runState?.meta?.revision_id;
                const targetId = resolveControlCommandTarget(target.governance_target).target_id;
                const common = Object.fromEntries(['presentation_language', 'working_directory', 'target_source', 'primary_target', 'run_id'].map(key => [key, input[key]]));
                common.expected_revision_id = revisionId;
                const catalog = readPresentationCatalog(target.governance_target, { runId: input.run_id, revisionId, targetId,
                  gate: evaluated.current_gate, workingDirectory: input.working_directory, targetSource: input.target_source,
                  primaryTarget: input.primary_target, language: input.presentation_language });
                const kind = evaluated.next_operation?.operation_key;
                const group = RUN_COMMAND_DESCRIPTORS[kind]?.group;
                const nextCalls = [];
                // Read the selected immutable document first. Operation help is
                // optional and must not delay a user's read-only document task.
                if (catalog.state === 'unique' && catalog.complete_scan && catalog.page_complete)
                  nextCalls.push({ tool: 'agdf_inspect', arguments: catalog.candidates[0].read_arguments });
                if (catalog.state !== 'unavailable' && group) nextCalls.push({ tool: 'agdf_inspect', arguments: {
                  operation: 'operation-contract', ...common, module: `${group}/${kind}` } });
                // An explicit reusable locator, not retained connection state or
                // authority. Reuse passes through the ordinary target/Run checks.
                const { expected_revision_id: _revision, ...readContext } = common;
                navigation = { read_context: readContext, presentation_catalog: catalog, next_calls: nextCalls };
              }
            } catch { /* Advisory navigation unavailable. */ }
            return { report: evaluated, navigation, presentation: gateCheckPresentation(evaluated, input.variant, evaluate) };
          }
          case "inventory": {
            // Read-only inventory also works before control initialization. An
            // existing config still goes through strict layout validation.
            if (existsSync(join(target.governance_target, '.agdf/control/config.json'))
              && readControlLayout(target.governance_target).layout === CURRENT_LAYOUT) return { report: readWorkInventory(target.governance_target, { language: input.presentation_language }), presentation: null };
            const inventory = readRunInventory(target.governance_target, { language: input.presentation_language });
            return { report: inventory, presentation: renderRunInventory(inventory, rawInput.interactionLocales, input.presentation_language) };
          }
          case "delivery-map": {
            const evaluated = deliveryMap(target.governance_target, selection, deliveryMapDependencies);
            return { report: evaluated, presentation: null };
          }
          case "contract": {
            if (!input.contract_module) return { report: { available: true, modules: readModules(),
              operation_modules: OPERATION_CONTRACT_MODULES, inspect_contract: inspectContractHelp(),
              instruction: 'contract reads a listed runtime module. operation-contract reads an exact listed group/kind; omit planning, gate and Run/revision for creation help. Copy operation-specific arguments; never copy whole command bindings.', authorizes: false }, presentation: null };
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
      if (navigation) result.navigation = navigation;
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

export { createInspectFailureResult } from "./result.js";
