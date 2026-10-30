import { createCoreServices } from "#agdf-core";
import { resources } from "./runtime/control-context.js";
import { cliGitObservation } from './control-evaluation/git-observation.js';
import { createReadWorkerBudget } from '#agdf-core/control-read/cockpit-pool.js';
import { createDoctorObservationService } from '#agdf-core/control-inspect/doctor-observation.js';
import { createPresentationDelivery } from '#agdf-core/control-state/presentation-delivery.js';
import { mcpControlContinuation } from '#agdf-core/skill-dispatch/mcp-continuation.js';
import { assertMcpControlReadBoundary } from "#agdf-core/control-read-boundary.js";
import { existsSync, lstatSync, realpathSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { composeMcpProtocolRuntime, errorSupport, inspectMcpDispatcherRuntime, configuredMcpCommandGroups } from './mcp-protocol-runtime.js';
export { inspectMcpDispatcherRuntime, configuredMcpCommandGroups, CONTROL_INSPECT_FUNCTION_DEFINITION, SKILL_DISPATCH_FUNCTION_DEFINITION,
  parseControlInspectFunctionArguments, parseSkillDispatchFunctionArguments, serializeSkillDispatchResult, DECISION_UI_URI, OWNED_LOCK_CHANNEL, releaseAbandonedOwnedLock } from './mcp-protocol-runtime.js';
export async function createMcpCockpitRuntime({ surface, cockpitDir, cockpitMode, inspected = inspectMcpDispatcherRuntime() } = {}) {
  const pluginMode = cockpitMode === 'plugin';
  if (cockpitMode !== undefined && !pluginMode || pluginMode && (surface !== 'codex' || cockpitDir !== undefined)
    || !pluginMode && (!['codex', 'claude'].includes(surface) || typeof cockpitDir !== 'string' || !isAbsolute(cockpitDir))) throw new TypeError('AGDF_COCKPIT_TARGET_INVALID');
  let root;
  try { if (!pluginMode) { root = realpathSync(cockpitDir); if (!lstatSync(root).isDirectory()) throw Error(); } }
  catch { throw new TypeError('AGDF_COCKPIT_TARGET_INVALID'); }
  const [{ COCKPIT_RENDER_DEFINITION, COCKPIT_PLUGIN_RENDER_DEFINITION, COCKPIT_READ_DEFINITION, COCKPIT_UI_URI, COCKPIT_MIME, COCKPIT_LIMITS, parseCockpitArguments, parsePluginCockpitArguments },
    { createCockpitSessionService }, { READ_LIMITS }] = await Promise.all([
    import("#agdf-core/control-inspect/cockpit-contract.js"),
    import("#agdf-core/control-inspect/cockpit-session.js"),
    import("#agdf-core/control-read/snapshot.js"),
  ]);
  const session = createCockpitSessionService(root, { pluginMode });
  const renderDefinition = pluginMode ? COCKPIT_PLUGIN_RENDER_DEFINITION : COCKPIT_RENDER_DEFINITION;
  const tools = [
    { name: renderDefinition.name, definition: renderDefinition,
      parse: value => pluginMode ? parsePluginCockpitArguments(value) : parseCockpitArguments(value, true), execute: value => session.render(value) },
    { name: COCKPIT_READ_DEFINITION.name, definition: COCKPIT_READ_DEFINITION,
      parse: parseCockpitArguments, execute: (value, signal) => session.read(value, signal) },
  ];
  // Claude Code renders no MCP app UI today; its cockpit stays hidden until a client declares support.
  return Object.freeze({ ...errorSupport(true), mode: 'cockpit', definition: renderDefinition, tools,
    producerIdentity: inspected.generationIdentity ?? null,
    uiCapabilityRequired: pluginMode || surface === 'claude', responseLimit: READ_LIMITS.response,
    ...(pluginMode ? { unsupportedUiCode: 'host_ui_unsupported' } : {}),
    ui: Object.freeze({ uri: COCKPIT_UI_URI, mimeType: COCKPIT_MIME, limit: COCKPIT_LIMITS.html,
      ...(pluginMode ? { label: 'Cockpit' } : {}) }),
    serialize: value => JSON.stringify(value), failure: code => code === 'host_ui_unsupported'
      ? { ...session.failure(code), retryable: false,
        next_action: 'Use a Codex session that advertises MCP App UI support; configuration or tool discovery alone cannot render Cockpit.' }
      : session.failure(code), close: () => session.close(),
    inspectOwnership: () => session.inspectOwnership(),
    trustedContext: Object.freeze({ surface, expectedVersion: inspected.expectedVersion, provenanceStatus: inspected.provenanceStatus }),
  });
}

export function createMcpDispatchRuntime({ surface, inspected = inspectMcpDispatcherRuntime(), commandGroups = configuredMcpCommandGroups(), runtimeControl, materialGrants, verifyRuntime } = {}) {
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
  const execute = input => mcpControlContinuation(input, services.dispatch(input), commandGroups);
  const executeInspect = services.inspect;
  const protocol = composeMcpProtocolRuntime({ surface, inspected, commandGroups, execute, executeInspect,
    executeCommand: (group, input, signal, host) => input.command.kind === 'material.stage' ? services.material.stage(input)
      : input.command.kind === 'presentation.deliver' ? delivery.deliver(input, host) : services.command(group, input) });
  return Object.freeze({ ...protocol,
    verifyProducer,
    prepareDispatch(name, input) { return { materialGrants: ['agdf_record', 'agdf_revise', 'agdf_closeout'].includes(name) ? services.material.grants(input) : [] }; },
    readBudget,
    delivery,
    async postprocessToolResult(name, input, result) {
      if (['agdf_record', 'agdf_revise', 'agdf_closeout'].includes(name)) services.material.settle(input, result);
      if (name !== 'agdf_prepare' || input.command?.kind !== 'presentation.prepare' || !result.family_result?.text) return result;
      delivery.remember(input, result);
      const prepared = result.family_result, { operation_id, ...binding } = input;
      return { ...result, presentation_delivery: { mode: 'prepared', text: '', presentation_id: prepared.presentation_id,
        document_digest: prepared.document_digest, authorizes: false,
        ...(prepared.preview_review ? { preview_review: { operation: 'presentation-preview', version: prepared.preview_review.descriptor.version,
          content_digest: prepared.preview_review.rendered_digest, access_state: 'not_observed', target_id: input.target_id,
          run_id: input.run_id, gate: 'PRD', expected_revision_id: input.expected_revision_id, presentation_id: prepared.presentation_id } } : {}),
        instruction: 'Prepared, not delivered. Optionally open agdf_decision_view as a non-primary preview. Then presentation.deliver selects once. Default route markdown; no second summary.',
        next_calls: [{ tool: 'agdf_prepare', arguments: { ...binding, command: { kind: 'presentation.deliver',
          payload: { gate: input.command.payload.gate, presentation_id: prepared.presentation_id, route: 'markdown' } } },
          required_input: { operation_id: 'Generate a new UUID for delivery; no gate approval is required.' } }] } };
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

