import { createCoreServices } from "#agdf-core";
import { resources } from "./runtime/control-context.js";
import { cliGitObservation } from './control-evaluation/git-observation.js';
import { createReadWorkerBudget } from '#agdf-core/control-read/cockpit-pool.js';
import { createDoctorObservationService } from '#agdf-core/control-inspect/doctor-observation.js';
import { createPresentationDelivery } from '#agdf-core/control-state/presentation-delivery.js';
import { mcpControlContinuation } from '#agdf-core/skill-dispatch/mcp-continuation.js';
import { inspectRunInputResolution } from '#agdf-core/control-state/run-input-resolution.js';
import { assertMcpControlReadBoundary } from "#agdf-core/control-read-boundary.js";
import { knownExecutionCode, validExecutionFacts } from '#agdf-core/mcp-tool-errors.js';
import { COMPANION_DATA_ROOT_ENV, createCompanionJournal } from '#agdf-core/companion/journal.js';
import { createCodexContinuationAdmission } from '#agdf-core/companion/codex-continuation.js';
import { readSystemBootId } from './mcp-lifecycle/system-boot.js';
import { isCurrentContinuation } from '#agdf-core/companion/codex-continuation-binding.js';
import { resolveControlCommandTarget } from '#agdf-core/control-state/approval-command-contract.js';
import { existsSync, lstatSync, realpathSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { composeMcpProtocolRuntime, errorSupport, inspectMcpDispatcherRuntime, configuredMcpCommandGroups } from './mcp-protocol-runtime.js';
export const CODEX_SHARED_ADMISSION_PROTOCOL = 'codex-shared-v1';
export { inspectMcpDispatcherRuntime, configuredMcpCommandGroups, CONTROL_INSPECT_FUNCTION_DEFINITION, SKILL_DISPATCH_FUNCTION_DEFINITION,
  parseControlInspectFunctionArguments, parseSkillDispatchFunctionArguments, serializeSkillDispatchResult, DECISION_UI_URI, OWNED_LOCK_CHANNEL, releaseAbandonedOwnedLock } from './mcp-protocol-runtime.js';
// Core reasons that the tool-error contract names differently. Core's command service maps
// RECOVERY_REQUIRED the same way and rejects the others under these existing codes.
const PREPARATION_REASONS = Object.freeze([
  [/RECOVERY_REQUIRED/iu, 'recovery_required'],
  [/^AGDF_PLANNED_SOURCE_STALE$/u, 'planning_source_stale'],
  [/^(?:run_state_invalid|run_id_invalid)$/u, 'invalid_run'],
  [/^AGDF_CONTROL_LAYOUT_MIGRATION_REQUIRED$/u, 'control_layout_unsupported'],
]);
// Dispatch preparation only reads the input context and grants staged material; no command has
// been dispatched yet. Its failures therefore carry typed not_dispatched facts, so the facade and
// generation call sites report a rejected command with its classified reason, never an unknown effect.
export function preDispatchFailure(error) {
  if (validExecutionFacts(error?.facts)) return Object.assign(error, { facts: { ...error.facts, dispatch: 'not_dispatched' } });
  const reason = String(error?.message ?? '');
  const code = knownExecutionCode(PREPARATION_REASONS.find(([pattern]) => pattern.test(reason))?.[1] ?? reason);
  return Object.assign(new Error(code), { facts: { code, dispatch: 'not_dispatched' } });
}
// Native qualification reports test results. It cannot be a prerequisite for
// exposing the first test gesture. Both routes require the same owned runtime;
// the App additionally checks host capabilities and the displayed Run binding.
export async function createMcpCockpitRuntime({ surface, cockpitDir, cockpitMode, inspected = inspectMcpDispatcherRuntime(),
  continuationQualified = inspected.provenanceStatus === 'matched' && !!inspected.generationIdentity, companionDataRoot } = {}) {
  const pluginMode = cockpitMode === 'plugin';
  if (cockpitMode !== undefined && !pluginMode || pluginMode && (surface !== 'codex' || cockpitDir !== undefined)
    || !pluginMode && (!['codex', 'claude'].includes(surface) || typeof cockpitDir !== 'string' || !isAbsolute(cockpitDir))) throw new TypeError('AGDF_COCKPIT_TARGET_INVALID');
  let root;
  try { if (!pluginMode) { root = realpathSync(cockpitDir); if (!lstatSync(root).isDirectory()) throw Error(); } }
  catch { throw new TypeError('AGDF_COCKPIT_TARGET_INVALID'); }
  const [{ COCKPIT_RENDER_DEFINITION, COCKPIT_PLUGIN_RENDER_DEFINITION, COCKPIT_READ_DEFINITION, COCKPIT_CONTINUATION_DEFINITION, COCKPIT_UI_URI, COCKPIT_MIME, COCKPIT_LIMITS, parseCockpitArguments, parseCockpitContinuationArguments, parsePluginCockpitArguments },
    { createCockpitSessionService }, { READ_LIMITS }] = await Promise.all([
    import("#agdf-core/control-inspect/cockpit-contract.js"),
    import("#agdf-core/control-inspect/cockpit-session.js"),
    import("#agdf-core/control-read/snapshot.js"),
  ]);
  const session = createCockpitSessionService(root, { pluginMode, integrationSurface: surface, continuationQualified, companionDataRoot,
    continuationRuntimeRoot: inspected.packageRoot ? resolve(inspected.packageRoot, '..', '..') : undefined,
    continuationBootId: readSystemBootId() });
  const renderDefinition = pluginMode ? COCKPIT_PLUGIN_RENDER_DEFINITION : COCKPIT_RENDER_DEFINITION;
  const continuationHost = inspected.continuationHost;
  const matchingClient = host => !continuationHost || host?.client?.name === continuationHost.name && host.client.version === continuationHost.version;
  const tools = [
    { name: renderDefinition.name, definition: renderDefinition,
      parse: value => pluginMode ? parsePluginCockpitArguments(value) : parseCockpitArguments(value, true),
      execute: (value, _signal, host) => session.render(value, { continuation: matchingClient(host) }) },
    { name: COCKPIT_READ_DEFINITION.name, definition: COCKPIT_READ_DEFINITION,
      parse: parseCockpitArguments, execute: (value, signal) => session.read(value, signal) },
    ...(session.continuationAvailable ? [{ name: COCKPIT_CONTINUATION_DEFINITION.name, definition: COCKPIT_CONTINUATION_DEFINITION,
      requiresUi: true, parse: parseCockpitContinuationArguments, execute: (value, signal, host) => matchingClient(host)
        ? session.continue(value, signal) : { schema_version: '1', authorizes: false, state: 'unavailable' } }] : []),
  ];
  // Claude Code renders no MCP app UI today; its cockpit stays hidden until a client declares support.
  return Object.freeze({ ...errorSupport(true), mode: 'cockpit', definition: renderDefinition, tools,
    bindResourceIdentity: identity => session.bindResourceIdentity(identity),
    producerIdentity: inspected.generationIdentity ?? null,
    uiCapabilityRequired: pluginMode || surface === 'claude', responseLimit: READ_LIMITS.response,
    ...(pluginMode ? { unsupportedUiCode: 'host_ui_unsupported' } : {}),
    ui: Object.freeze({ uri: COCKPIT_UI_URI, mimeType: COCKPIT_MIME, limit: COCKPIT_LIMITS.html,
      ...(pluginMode ? { label: 'Cockpit' } : {}) }),
    serialize: value => JSON.stringify(value), failure: (code, name) => name === COCKPIT_CONTINUATION_DEFINITION.name
      ? { schema_version: '1', authorizes: false, state: 'unavailable' }
      : code === 'host_ui_unsupported'
      ? { ...session.failure(code), retryable: false,
        next_action: 'Use a Codex session that advertises MCP App UI support; configuration or tool discovery alone cannot render Cockpit.' }
      : session.failure(code), close: () => session.close(),
    inspectOwnership: () => session.inspectOwnership(),
    trustedContext: Object.freeze({ surface, expectedVersion: inspected.expectedVersion, provenanceStatus: inspected.provenanceStatus }),
  });
}

function stopCodexContinuation(result, decision, language) {
  const de = language?.toLowerCase().split('-')[0] === 'de';
  const { state } = decision;
  const text = decision.boot_restart_required ? de
    ? 'Für den Wechsel zur neuen AGDF-Fassung ist ein vollständiger Neustart des Computers erforderlich. Ein Neustart von Codex allein genügt dafür nicht.'
    : 'A full computer restart is required to confirm that the older AGDF executables have ended. Restarting Codex alone is insufficient.'
    : decision.legacy_runtime ? de
    ? 'Der Abschluss einer älteren AGDF-Verbindung ist noch nicht bestätigt. Deshalb bleibt ein weiterer Start gesperrt.'
    : 'Termination of an older AGDF connection is unconfirmed. Another start remains blocked.'
    : decision.interrupt_requested ? de ? 'Der Abbruch wurde angefordert.' : 'Cancellation has been requested.'
    : state === 'running' ? de ? 'Codex arbeitet bereits an diesem Run.' : 'Codex is already working on this Run.'
    : state === 'pending' ? de ? 'Die Bestätigung von Codex steht noch aus.' : 'Codex has not confirmed the original handoff yet.'
    : state === 'stale' ? de ? 'Der Run hat sich geändert. Öffne den aktuellen Stand.' : 'The Run has changed. Open its current state.'
    : de ? 'Die Fortsetzung für diesen Run ist gerade nicht verfügbar.' : 'Continuation is unavailable for this Run.';
  return { ...result, outcome: 'control_result', terminal: true, presentation: { markdown: text, authorizes: false }, continuation: null, recovery: null,
    host_action: { mode: 'transmit_presentation_verbatim_and_stop', source: 'presentation.markdown',
      allow_surrounding_text: false, may_request_run_or_evidence: false, text } };
}

function admitCodexContinuation(admission, input, result, requireAdmission = false) {
  if (!input.continueDelivery || result.terminal || !result.continuation || !result.control?.next_operation) return result;
  const operation = result.control.next_operation, root = result.target?.governance_target;
  if (operation.actor !== 'agent' && !(input.continuationAttemptId && operation.operation_key === 'approval.record')) return result;
  if (!admission) return requireAdmission || input.continuationAttemptId || input.continuationOwner
    ? stopCodexContinuation(result, { state: 'unavailable' }, input.presentationLanguage) : result;
  const scope = { root, target_id: resolveControlCommandTarget(root).target_id,
    run_id: input.runId, revision_id: result.continuation.revision_id ?? result.control.revision_id,
    operation_key: operation.operation_key, actor: operation.actor };
  const decision = admission.claim(scope, { attemptId: input.continuationAttemptId, owner: input.continuationOwner },
    () => isCurrentContinuation(root, scope));
  if (!decision.admitted) return stopCodexContinuation(result, decision, input.presentationLanguage);
  return { ...result, continuation: { ...result.continuation,
    work_admission: { attempt_id: decision.attempt_id, owner: decision.owner, target_id: scope.target_id, run_id: scope.run_id },
    instruction: `${result.continuation.instruction} After a canonical write, use the owner-bound resume_call from this dispatch when its ready next action is to continue this Run. Never reuse it outside this turn.`,
  } };
}

export function createMcpDispatchRuntime({ surface, inspected = inspectMcpDispatcherRuntime(), commandGroups = configuredMcpCommandGroups(), runtimeControl, materialGrants, verifyRuntime, inputContext, executionContext,
  continuationQualified = inspected.provenanceStatus === 'matched' && !!inspected.generationIdentity, companionDataRoot = process.env[COMPANION_DATA_ROOT_ENV] } = {}) {
  const readBudget = createReadWorkerBudget();
  const delivery = createPresentationDelivery();
  const verifyProducer = verifyRuntime ?? (() => {
      const current = inspectMcpDispatcherRuntime();
      if (current.provenanceStatus !== 'matched' || current.runtimeEvidence.runtime_digest !== inspected.runtimeEvidence.runtime_digest
        || JSON.stringify(current.generationIdentity) !== JSON.stringify(inspected.generationIdentity))
        throw Object.assign(Error('runtime_provenance_invalid'), { code: 'runtime_provenance_invalid' });
      return current.generationIdentity;
    });
  const diagnostic = createDoctorObservationService({ budget: readBudget, gitObservation: cliGitObservation, verifyRuntime: verifyProducer });
  const services = createCoreServices({ resources, observers: {
    runtimeEvidence: inspected.runtimeEvidence,
    validateControlReadBoundary: assertMcpControlReadBoundary,
    commandGroups, runtimeControl, materialGrants, gitObservation: cliGitObservation,
    observeDoctor: (root, input, signal) => diagnostic.observe(root, input, signal),
  } });
  // Companion events (companion core SDD-006): the executing process journals each final command result
  // once, below the data root the launcher hands over; review facts read the sealed material here.
  const journal = createCompanionJournal({ sealedFiles: transferId => services.material.sealedFiles(transferId) });
  const admission = surface === 'codex' && continuationQualified === true && companionDataRoot
    ? createCodexContinuationAdmission(companionDataRoot, { runtimeRoot: inspected.packageRoot ? resolve(inspected.packageRoot, '..', '..') : undefined,
      bootId: readSystemBootId() }) : null;
  const execute = input => {
    const result = services.dispatch(input);
    const admitted = admitCodexContinuation(admission, input, result, surface === 'codex' && Boolean(companionDataRoot));
    return mcpControlContinuation(input, admitted, commandGroups);
  };
  const executeInspect = services.inspect;
  const protocol = composeMcpProtocolRuntime({ surface, inspected, commandGroups, execute, executeInspect, inputContext, executionContext,
    lookupOriginal: (root, input) => ['material.stage', 'planned_material.stage'].includes(input.command?.kind) ? services.material.originalInput(input)
      : input.command?.kind === 'presentation.deliver' ? delivery.originalInput(input)
        : runtimeControl?.originalInput?.(input) ?? inspectRunInputResolution(root, input),
    executeCommand: (group, input, signal, host) => ['material.stage', 'planned_material.stage'].includes(input.command.kind) ? services.material.stage(input)
      : input.command.kind === 'presentation.deliver' ? delivery.deliver(input, host) : services.command(group, input) });
  return Object.freeze({ ...protocol,
    verifyProducer,
    prepareDispatch(name, input) {
      try {
        return { inputContext: protocol.inputContextFor(input), materialGrants: ['agdf_record', 'agdf_revise', 'agdf_closeout'].includes(name) ? services.material.grants(input) : [] };
      } catch (error) { throw preDispatchFailure(error); }
    },
    readBudget,
    delivery,
    observeOutcome: (name, input, result) => journal.observe(name, input, result),
    observesOutcome: (name, input, result) => journal.observes(name, input, result),
    async postprocessToolResult(name, input, result) {
      const configuration = protocol.configurationProjection(input);
      if (configuration && name === 'agdf_inspect' && result.report) result = { ...result, report: { ...result.report, effective_configuration: configuration } };
      if (['agdf_record', 'agdf_revise', 'agdf_closeout'].includes(name)) services.material.settle(input, result);
      if (name !== 'agdf_prepare' || input.command?.kind !== 'presentation.prepare' || !result.family_result?.text) return result;
      delivery.remember(input, result);
      const prepared = result.family_result;
      return { ...result, presentation_delivery: { mode: 'prepared', text: '', presentation_id: prepared.presentation_id,
        document_digest: prepared.document_digest, authorizes: false,
        ...(prepared.preview_review ? { preview_review: { operation: 'presentation-preview', version: prepared.preview_review.descriptor.version,
          content_digest: prepared.preview_review.rendered_digest, access_state: 'not_observed', target_id: input.target_id,
          run_id: input.run_id, gate: 'PRD', expected_revision_id: input.expected_revision_id, presentation_id: prepared.presentation_id } } : {}),
        instruction: 'Prepared, not delivered. Optionally open agdf_decision_view as a non-primary preview. Follow the authoritative top-level next action for presentation.deliver; its original UUID and binding are already supplied. No second summary and no generated delivery UUID.',
        next_action_source: 'next_calls' } };
    },
    async close() { services.material.close(); delivery.close(); await diagnostic.close(); },
    inspectOwnership() { const d = diagnostic.inspectOwnership(); return { diagnostic: d, read_workers: readBudget.inspect(),
      views: d.observations, inflight: d.inflight, uncertain: 0 }; },
  });
}

export async function createMcpDecisionRuntime({ runtime, ui, appOnlyMediationQualified = false, surfaceBinding } = {}) {
  if (!runtime || runtime.trustedContext.surface !== 'codex') throw Error('decision_runtime_surface_invalid');
  const [{ createDecisionSessionService }, { createCockpitSessionService }, { composeMcpDecisionProtocol }] = await Promise.all([
    import('#agdf-core/control-inspect/decision-session.js'), import('#agdf-core/control-inspect/cockpit-session.js'),
    import('./mcp-decision-protocol.js'),
  ]);
  const groups = runtime.trustedContext.commandGroups, session = createDecisionSessionService({ groups, delivery: runtime.delivery, appOnlyMediationQualified, surfaceBinding,
    readServiceFactory: root => createCockpitSessionService(root, { budget: runtime.readBudget }),
    qualification: ({ client }) => appOnlyMediationQualified === true
      || runtime.trustedContext.decisionQualification(client, ui.digest) === true });
  const protocol = composeMcpDecisionProtocol({ runtime, ui, prepared: input => session.prepared(input),
    open: (input, result, host) => session.open(input, result, host), read: (input, signal, host) => session.read(input, signal, host),
    action: (input, host) => session.action(input, host), close: () => session.close() });
  return Object.freeze({ ...protocol,
    observeOutcome: (name, input, result) => runtime.observeOutcome?.(name, input, result) ?? false,
    observesOutcome: (name, input, result) => runtime.observesOutcome?.(name, input, result) ?? false,
    async postprocessToolResult(name, input, result, { uiSupported, client } = {}) {
      if (name === 'agdf_inspect' && input.operation === 'native-qualification' && result.report?.available) {
        return { ...result, report: { ...result.report, ui_rendering_support: uiSupported ? 'supported' : 'unsupported',
          action_qualification: runtime.trustedContext.decisionQualificationReport(client, ui.digest),
          enabled_command_groups: [...groups], authorizes: false } };
      }
      return runtime.postprocessToolResult(name, input, result);

    },
    async close() { await Promise.all([session.close(), runtime.close?.()]); },
    inspectOwnership() { const base = runtime.inspectOwnership(), decision = session.inspectOwnership(); return { ...base, decision,
      views: base.views + decision.views, inflight: base.inflight + decision.inflight, uncertain: base.uncertain + (decision.uncertain ?? 0) }; },
  });
}

