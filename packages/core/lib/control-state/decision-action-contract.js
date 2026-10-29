import { strictObject, schemaDiagnostics, RUN_COMMAND_LIMITS, RUN_COMMAND_GROUPS } from './run-command-schema.js';
import { REVISION_ID_PATTERN } from './run-identity.js';
import { canonicalJson, digest } from './approval-command-contract.js';

import { DECISION_UI_URI } from '../mcp-resource-contract.js';
export { DECISION_UI_URI };
export const DECISION_ACTION_GROUPS = Object.freeze({ approve: 'agdf_approve', request_change: 'agdf_record', reject: 'agdf_record' });
const uuid = { type: 'string', pattern: REVISION_ID_PATTERN.source };
export function enabledDecisionActions(groups) {
  if (!Array.isArray(groups) || new Set(groups).size !== groups.length || groups.some(group => !Object.hasOwn(RUN_COMMAND_GROUPS, group))) throw Error('command_group_unsupported');
  return Object.keys(DECISION_ACTION_GROUPS).filter(action => groups.includes(DECISION_ACTION_GROUPS[action]));
}
export function decisionActionSchema(actions = Object.keys(DECISION_ACTION_GROUPS)) {
  return strictObject({ session_id: uuid, operation_id: uuid, presentation_id: uuid, expected_revision_id: uuid,
    action: { enum: actions }, comment: { type: 'string', maxLength: 8192 } }, ['session_id', 'operation_id', 'presentation_id', 'expected_revision_id', 'action']);
}
export function validateDecisionAction(input, actions = Object.keys(DECISION_ACTION_GROUPS)) {
  const errors = schemaDiagnostics(input, decisionActionSchema(actions));
  if (errors.length) return errors;
  if (input.action === 'request_change' && !input.comment?.trim()) errors.push({ path: '$.comment', code: 'change_comment_required' });
  if (/\0/u.test(input.comment ?? '')) errors.push({ path: '$.comment', code: 'comment_invalid' });
  if (Buffer.byteLength(input.comment ?? '') > 8192 || Buffer.byteLength(canonicalJson(input)) > RUN_COMMAND_LIMITS.input_bytes) errors.push({ path: '$.comment', code: 'comment_budget_exceeded' });
  return errors;
}
export function decisionActionDefinition(groups) {
  const actions = enabledDecisionActions(groups);
  if (!actions.length) return null;
  return Object.freeze({ name: 'agdf_decision_action', description: 'App-only deliberate decision of one immutable presentation. Enabled actions: ' + actions.join(', ') + '. Cooperative UI route; technical tool permission is not a gate decision. Preserve original UUID after uncertainty.',
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    inputSchema: decisionActionSchema(actions), _meta: { ui: { resourceUri: DECISION_UI_URI, visibility: ['app'] } } });
}
export const decisionActionRequestDigest = (binding, input) => digest(`agdf-app-decision/1\0${canonicalJson({ binding, input })}`);

export const DECISION_VIEW_SCHEMA = strictObject({ primary_target: { type: 'string', minLength: 1, maxLength: 4096 },
  target_id: { type: 'string', pattern: '^sha256:[0-9a-f]{64}$' }, run_id: { type: 'string', pattern: '^[A-Za-z0-9_-]{1,128}$' },
  expected_revision_id: uuid, gate: { enum: ['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'] }, presentation_id: uuid });
export const DECISION_VIEW_DEFINITION = Object.freeze({ name: 'agdf_decision_view',
  description: 'Optional non-primary preview of a prepared decision. Display is unconfirmed until the bound live view is observed. Then call presentation.deliver; absent current-surface proof selects Markdown.',
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false }, inputSchema: DECISION_VIEW_SCHEMA,
  _meta: { ui: { resourceUri: DECISION_UI_URI, visibility: ['model', 'app'] } } });
export function validateDecisionView(input) { return schemaDiagnostics(input, DECISION_VIEW_SCHEMA); }
