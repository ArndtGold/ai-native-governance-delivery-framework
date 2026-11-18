// Companion figure state (SD SDD-004): one mood and a reason descriptor per run-view entry, derived
// only from the status-card fields the run view copied. Pure and host-neutral; hosts localize the
// reason with the catalog's companion section and may overlay their own activity (turn in progress).
import { COMPANION_MOODS } from '../interaction-catalog.js';
import { RUN_MODES } from '../control-state/run-identity.js';

export { COMPANION_MOODS };
// The internal steps between an approved TP and QA, shown as building in structured runs; hosts that
// mark the build phase use this list (CR finding CIR-04).
export const BUILD_GATES = Object.freeze(['Brownfield Analysis', 'CD+Tests', 'CR']);
export const STRUCTURED_MODES = Object.freeze(RUN_MODES.filter(mode => mode.startsWith('structured_')));
// The ended lifecycles of run-operations.js (ENDED_LIFECYCLES), kept here so this module stays pure;
// the companion tests assert both agree.
export const ENDED_LIFECYCLES = Object.freeze(['superseded', 'abandoned']);
// The pending approval as the run inventory reads it (run-inventory.js runAttention): a negated
// mention ("No Approval: QA") is no pending approval.
const pendingApproval = missing => String(missing ?? '').match(/(?<!\b(?:[Nn]o|[Nn]ot|[Ww]ithout) )\bApproval: (UR|PRD|SD|TP|QA|UAT|OR)\b/u)?.[1] ?? null;

// { mood, reason: { key, gate?, decision?, reason? } }; null or no entry is the idle figure.
export function deriveFigureState(entry) {
  if (!entry) return { mood: 'bereit', reason: { key: 'idle' } };
  if (entry.valid === false) return { mood: 'blockiert', reason: { key: 'unreadable', reason: entry.unreadable_reason ?? 'run_state_invalid' } };
  if (entry.evaluation_error) return { mood: 'blockiert', reason: { key: 'unreadable', reason: entry.evaluation_error } };
  // A completed run whose evaluation is blocked is not done: the block is shown like any other.
  const blocked = entry.evaluated === true && (entry.status === 'blocked' || Boolean(entry.blocking_reason && entry.blocking_reason !== 'none'));
  // A completed run without confirmed completion is still shown, but claims nothing: its own reason.
  if (entry.lifecycle === 'completed' && !blocked) return entry.completion_confirmed === true
    ? { mood: 'fertig', reason: { key: 'done' } } : { mood: 'bereit', reason: { key: 'completionUnconfirmed' } };
  if (ENDED_LIFECYCLES.includes(entry.lifecycle)) return { mood: 'bereit', reason: { key: 'ended' } };
  if (!entry.evaluated) return { mood: 'bereit', reason: { key: 'idle' } };
  const gate = entry.current_gate;
  if (blocked) return { mood: 'blockiert', reason: { key: 'blocked', gate, decision: entry.blocking_reason } };
  const approval = pendingApproval(entry.missing_approval);
  if (approval) return { mood: 'wartet', reason: { key: 'waitingApproval', gate: approval } };
  if (entry.user_action_required === 'yes') return { mood: 'wartet', reason: { key: 'waitingDecision', gate } };
  if (STRUCTURED_MODES.includes(entry.mode) && BUILD_GATES.includes(gate)) return { mood: 'baut', reason: { key: 'building', gate } };
  return { mood: 'laeuft', reason: { key: 'working', gate } };
}
