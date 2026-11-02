import { RUN_MODES, RUN_ID_PATTERN, REVISION_ID_PATTERN } from '../../../../../packages/core/lib/control-state/run-identity.js';
// Bounded stored-fact projection only. No filesystem reads, seal qualification or authorization.
import { parseControlState, recordRows, scalarFields, hasPersistedDerivedState } from '../../../../../packages/core/lib/control-state/run-state-document.js';
import { modeSliceDecision } from '../../../../../packages/core/lib/control-evaluation/run-state-policy.js';
import { createGatePolicy } from '../../../../../packages/core/lib/control-evaluation/gate-policy-pure.js';
const policy = createGatePolicy(content => ({ receipts: recordRows(content, 'Source Revisions') }));
export function projectStoredRun(content) {
  const fields = scalarFields(content), meta = Object.fromEntries(fields.values);
  if (fields.duplicates.length || meta.control_state_version !== '4' || !RUN_MODES.includes(meta.mode) || !RUN_ID_PATTERN.test(meta.run_id ?? '') || !REVISION_ID_PATTERN.test(meta.revision_id ?? '') || hasPersistedDerivedState(content)) throw Error('format');
  const facts = parseControlState(content);
  const decisions = new Map();
  for (const row of recordRows(content, 'Run Operations')) if (row.kind === 'presentation_decision.record' && row.effect.revision === Number(meta.revision))
    decisions.set(row.effect.record.gate, { available: true, decided: true, action: row.effect.record.action });
  const state = { ...facts, content, meta, presentation_decisions: decisions };
  return { meta, facts, route: modeSliceDecision(state), control: policy.transitionDecisionForRunState(state) };
}
