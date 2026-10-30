import { RUN_COMMAND_GROUPS, RUN_COMMAND_LIMITS } from '#agdf-core/control-state/run-command-schema.js';

// Optional UI composition is deliberately outside the default headless import
// closure. Full and thin UI fronts share this one structural contract.
const unwrapped = () => { throw Object.assign(Error('generation_unavailable'), { code: 'generation_unavailable', dispatch: 'not_dispatched' }); };

import { decisionActionDefinition, validateDecisionAction, DECISION_VIEW_DEFINITION, validateDecisionView } from '#agdf-core/control-state/decision-action-contract.js';
import { COCKPIT_READ_DEFINITION, parseCockpitArguments } from '#agdf-core/control-inspect/cockpit-contract.js';

export function composeMcpDecisionProtocol({ runtime, ui, prepared = unwrapped, open = unwrapped, read = unwrapped, action = unwrapped, close = () => {} } = {}) {
  const groups = runtime.trustedContext.commandGroups;
  const facade = decisionActionDefinition(groups);
  const tools = [...runtime.tools];
  if (groups.includes('agdf_prepare')) tools.push({ name: DECISION_VIEW_DEFINITION.name, definition: DECISION_VIEW_DEFINITION, requiresUi: true, parentOwned: true,
    parse: input => { if (validateDecisionView(input).length) throw Error('decision_schema_invalid'); return input; },
    execute: async (input, signal, host) => {
      const remembered = prepared(input);
      if (!remembered) return { schema_version: '1', outcome: 'rejected', reason: 'delivery_state_unavailable', authorizes: false };
      const opened = await open(remembered.input, remembered.result, host);
      return { schema_version: '1', outcome: opened._meta ? 'accepted' : 'rejected', reason: opened.app_reason ?? null,
        app_capability: opened.app_capability, authorizes: false, ...(opened._meta ? { _meta: opened._meta } : {}) };
    }, serialize: JSON.stringify });
  tools.push({ name: COCKPIT_READ_DEFINITION.name, definition: COCKPIT_READ_DEFINITION, requiresUi: true, parentOwned: true,
    parse: parseCockpitArguments, execute: (input, signal, host) => read(input, signal, host), serialize: value => JSON.stringify(value) });
  if (facade) tools.push({ name: facade.name, definition: facade, requiresUi: true, parentOwned: true,
    parse: input => { if (validateDecisionAction(input, facade.inputSchema.properties.action.enum).length) throw Error('decision_schema_invalid'); return input; },
    execute: (input, signal, host) => action(input, host), serialize: value => JSON.stringify(value) });
  const bytes = tools.filter(tool => Object.hasOwn(RUN_COMMAND_GROUPS, tool.name) || tool.name === facade?.name || tool.name === DECISION_VIEW_DEFINITION.name)
    .reduce((sum, tool) => sum + Buffer.byteLength(JSON.stringify(tool.definition)), 0);
  if (bytes > RUN_COMMAND_LIMITS.aggregate_definition_bytes) { void close(); throw Error('command_aggregate_definition_budget_exceeded'); }
  return Object.freeze({ ...runtime, tools: Object.freeze(tools), ui, mode: 'decision',
    tool: name => tools.find(tool => tool.name === name) ?? null,
    failure(code, name, input, dispatch) {
      return name === 'agdf_decision_action' ? { schema_version: '1', outcome: dispatch?.dispatch === 'not_dispatched' ? 'rejected' : 'effect_unknown',
        reason: code, operation_id: input?.operation_id ?? null, authorizes: false, recovery: 'Inspect the original UUID; do not infer non-execution or submit another decision.' }
        : ['agdf_cockpit_read', 'agdf_decision_view'].includes(name) ? { schema_version: '1', outcome: 'rejected', reason: code, authorizes: false } : runtime.failure(code, name, input, dispatch);
    },
  });
}

