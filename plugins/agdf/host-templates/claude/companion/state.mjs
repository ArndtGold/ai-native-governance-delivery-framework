// State rules (AC-003, AC-002 of the follow-up): which of the five moods a run shows and why, as a
// reason descriptor the view localizes. A run matching no rule is reported unreadable rather than
// guessed (SDD-04).

import { BUILD_GATES, isStructured } from './run-state.mjs';

export const MOODS = Object.freeze(['laeuft', 'baut', 'wartet', 'blockiert', 'fertig']);
const BLOCKING = new Set(['revise', 'block', 'blocked', 'decline']);
const AWAITING = new Set(['pending', 'awaiting_uat']);
const WORKING = new Set(['in_progress', 'pass', 'qa_approved', 'completed']);

// The gate a pending approval names, as in "Exact Approval: QA." or "Exact Approval: PRD for the new revision."
export const pendingApproval = missing => String(missing ?? '').match(/\bApproval: (UR|PRD|SD|TP|QA|UAT|OR)\b/u)?.[1] ?? null;

// The blocking outcome of a run: a legacy Run Meta decision, the current gate's recorded result
// (`revise`, `block`, `blocked`) or a deliberate decision on its presented material.
function blockingOutcome(run) {
  if (BLOCKING.has(run.decision)) return run.decision;
  if (run.gateResult) return run.gateResult;
  return { reject: 'decline', request_change: 'revise' }[run.gateDecision] ?? null;
}

// { mood, reason: { key, gate?, decision? } } or { mood: null, reason: { key: 'unknownState' } }.
// A structured run between an approved TP and QA (Brownfield Analysis, CD+Tests, CR) is being built.
export function runState(run) {
  if (run.lifecycle === 'completed') return { mood: 'fertig', reason: { key: 'done' } };
  const outcome = blockingOutcome(run);
  if (outcome) return { mood: 'blockiert', reason: { key: 'blocked', gate: run.gate, decision: outcome } };
  const approval = pendingApproval(run.missing);
  if (approval) return { mood: 'wartet', reason: { key: 'waitingApproval', gate: approval } };
  if (AWAITING.has(run.decision)) return { mood: 'wartet', reason: { key: 'waitingDecision', gate: run.gate } };
  if (WORKING.has(run.decision) && isStructured(run.route) && BUILD_GATES.includes(run.gate)) return { mood: 'baut', reason: { key: 'building', gate: run.gate } };
  if (WORKING.has(run.decision)) return { mood: 'laeuft', reason: { key: 'working', gate: run.gate } };
  return { mood: null, reason: { key: 'unknownState' } };
}

// A main-loop turn in progress shows läuft whatever the run says, except that a run being built
// stays baut; the run-derived state returns after the turn.
export function displayState(run, { isTurnActive = false } = {}) {
  const derived = runState(run);
  if (isTurnActive && derived.mood !== null && derived.mood !== 'baut') return { mood: 'laeuft', reason: { key: 'turnActive' } };
  return derived;
}
