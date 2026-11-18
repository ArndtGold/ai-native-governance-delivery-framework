// Canonical owner of the host-neutral Companion activity policy: packages/core/lib/companion/activity.js.
// The Claude Companion imports no Core module, so it ships a byte-identical copy as companion/activity.mjs;
// the Companion integrity test and the runtime integrity check compare the two.

// The lease of a host that renews its own running turn (Claude Code renews every half lease).
export const activityLifetime = 30_000;
// Codex hooks are one-shot processes without a timer: confirmed work lasts until the turn ends, a later
// prompt of the same session retires it, or this bound passes after the turn's last confirmed dispatch.
// It is also the furthest expiry any record may claim.
export const codexTurnBound = 60 * 60_000;
const deduplicationWindow = 5 * 60_000;
export const activityRecordLimit = 64;
// Tool use IDs only drop duplicate deliveries of one result, which arrive close together.
const toolLimit = 12;
// Host IDs are ASCII. Without a case-insensitive Unicode class, U+212A and U+017F cannot pass as k and s.
const id = /^[A-Za-z0-9_-]{1,128}$/u;
const runId = /^[a-z0-9][a-z0-9._-]{0,127}$/u;
export const isActivityId = value => typeof value === 'string' && id.test(value);
const revision = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/iu;
// The AGDF dispatch tool under any MCP server name. The Codex hook matcher repeats this exact pattern;
// only Core's validation of the result decides whether a call was AGDF work.
export const agdfDispatchToolPattern = '^mcp__[A-Za-z0-9_-]+__agdf_dispatch$';
const dispatchTool = new RegExp(agdfDispatchToolPattern, 'u');
export const isAgdfDispatchTool = name => typeof name === 'string' && dispatchTool.test(name);
// Each continuation phase that hands agent work on the current gate, with the gates Core emits it for.
// `null` takes the reported current gate; a continuation that names its own gate must name that one.
const workPhases = new Map([
  ['post_ur_review', ['Brownfield Review', 'Mode/Slice Decision']],
  ['pre_implementation_analysis', ['Brownfield Analysis']],
  ['prd_definition', ['PRD']],
  ['sd_definition', ['SD']],
  ['tp_definition', ['TP']],
  ['implementation', ['CD+Tests']],
  ['compact_implementation', ['Quick Task Execution', 'Verified Change Execution']],
  ['verified_change_record', ['Verified Change Execution']],
  ['compact_closeout', ['Quick Task Execution', 'OR']],
  ['required_gate_artifact', null],
  ['post_uat_closeout', ['OR']],
]);

function workGate(continuation, current) {
  if (!workPhases.has(continuation?.phase) || typeof current !== 'string' || !current) return null;
  const gates = workPhases.get(continuation.phase);
  if (gates ? !gates.includes(current) : continuation.gate !== undefined && continuation.gate !== current) return null;
  return current;
}

// The host supplies the turn identity. Core supplies the work scope and current step. The returned
// governance target is Core's canonical resolution, so the request's own spelling of it is not compared.
export function workBinding(request, result) {
  const continuation = result?.continuation;
  const target = result?.target?.governance_target;
  const gate = workGate(continuation, result?.control?.current_gate);
  if (request?.continue_delivery !== true || result?.outcome !== 'skill_continuation' || result.terminal !== false
    || result.authorizes !== false || !gate || result.control?.next_operation?.actor !== 'agent'
    || result.target?.resolution_state !== 'resolved' || typeof target !== 'string' || !target
    || target !== continuation.governance_target || typeof continuation.run_id !== 'string' || !runId.test(continuation.run_id)
    || request.run_id !== continuation.run_id || typeof continuation.revision_id !== 'string' || !revision.test(continuation.revision_id)) return null;
  return { target_id: target, run_id: continuation.run_id, revision_id: continuation.revision_id, gate };
}

// A planned UR is no Run yet: confirmed authoring of exactly the requested planning entry binds its plan
// id at the UR gate.
export function plannedWorkBinding(request, result) {
  const continuation = result?.continuation;
  const target = result?.target?.governance_target;
  const planId = continuation?.planning?.plan_id;
  if (result?.outcome !== 'skill_continuation' || result.terminal !== false || result.authorizes !== false
    || continuation?.phase !== 'planned_ur_definition' || result.target?.resolution_state !== 'resolved'
    || typeof target !== 'string' || !target || target !== continuation.governance_target
    || typeof planId !== 'string' || !runId.test(planId) || request?.planning?.plan_id !== planId) return null;
  return { target_id: target, plan_id: planId, gate: 'UR' };
}

// Holds every observation back for one deduplication window: used when the window overflows or a
// stored set cannot be read, because neither can prove which turns already ended.
export const quarantineActivity = now => [{ quarantined: true, until: now + deduplicationWindow }];

const validLease = lifetime => Number.isSafeInteger(lifetime) && lifetime > 0 && lifetime <= codexTurnBound;

// Records one event of a host turn. `lifetime` is the lease of confirmed work; a host without its own
// renewal passes a longer one. Returns null when the event changes nothing.
export function updateActivity(records, event, now, { lifetime = activityLifetime } = {}) {
  const { kind, session, turn, tool, binding } = event;
  if (!isActivityId(session) || !isActivityId(turn) || !validLease(lifetime)) return null;
  const terminal = kind === 'ended' || kind === 'interrupted';
  const sameTurn = row => row.session === session && row.turn === turn;
  const current = records.filter(row => row.until > now);
  if (current.some(row => row.quarantined)) return null;
  const admitted = current.find(row => row.session === session && row.current_turn === true);
  if (!terminal && admitted && admitted.turn !== turn) return null;
  const previous = current.find(sameTurn);
  const tools = previous?.tools ?? [];
  // A hand-off or a later result is never refused for the number of results the turn already had.
  if (!terminal && (!['work', 'lost'].includes(kind) || !isActivityId(tool)
    || previous?.terminal || tools.includes(tool) || (kind === 'work' ? !binding : !previous))) return null;
  const next = current.filter(row => !sameTurn(row));
  if (next.length >= activityRecordLimit) return quarantineActivity(now);
  const admission = previous?.current_turn === true ? { current_turn: true } : {};
  const retained = previous?.current_turn === true ? Math.max(previous.until, now + codexTurnBound) : 0;
  if (terminal) return [...next, { session, turn, ...admission,
    until: Math.max(now + deduplicationWindow, retained), terminal: true, kind }];
  const kept = kind === 'work' ? Math.max(deduplicationWindow, lifetime) : deduplicationWindow;
  return [...next, {
    session, turn, ...admission, until: Math.max(now + kept, retained), ...binding, tools: [...tools, tool].slice(-toolLimit),
    expires_at: kind === 'work' ? now + lifetime : 0,
  }];
}

// A prompt admits its exact turn for one bounded window, even before its first
// result. Keep this admission on the same row through work, hand-off and Stop so
// late results cannot revive an unseen older turn or an already-ended one.
export function retireTurns(records, { session, turn }, now) {
  if (!isActivityId(session) || !isActivityId(turn)) return null;
  const current = records.filter(row => row.until > now);
  if (current.some(row => row.quarantined)) return null;
  const previous = current.find(row => row.session === session && row.turn === turn);
  if (previous?.current_turn === true || previous?.terminal) return null;
  const next = current.filter(row => row.session !== session || row.turn !== turn).map(row => {
    if (row.session !== session || row.terminal && row.current_turn !== true) return row;
    return { session: row.session, turn: row.turn, until: now + deduplicationWindow, terminal: true, kind: 'retired' };
  });
  if (next.length >= activityRecordLimit) return quarantineActivity(now);
  return [...next, { session, turn, expires_at: 0, tools: [], ...previous,
    current_turn: true, until: Math.max(previous?.until ?? 0, now + codexTurnBound) }];
}

// Extends confirmed work while its host turn is still running. Only a host that reports the turn's end
// itself may renew; expired, lost or terminal work stays as it is. Returns null when nothing was renewed.
export function renewActivity(records, { session, turn }, now, { lifetime = activityLifetime } = {}) {
  if (!validLease(lifetime)) return null;
  let renewed = false;
  const next = records.map(row => {
    if (row.session !== session || row.turn !== turn || row.terminal || row.quarantined
      || !Number.isSafeInteger(row.expires_at) || row.expires_at <= now) return row;
    renewed = true;
    return { ...row, expires_at: now + lifetime, until: Math.max(row.until, now + Math.max(deduplicationWindow, lifetime)) };
  });
  return renewed ? next : null;
}

// Work matches the shown step by target, Run (or planning entry) and gate. The revision is not compared:
// the same turn records new revisions of its own work, and work ends with its turn, not with a revision.
export function matchesActivity(record, scope, now) {
  if (!record || !scope?.gate || !scope.target_id || record.terminal || record.quarantined
    || !Number.isSafeInteger(record.expires_at) || record.expires_at <= now || record.expires_at > now + codexTurnBound
    || record.target_id !== scope.target_id || record.gate !== scope.gate) return false;
  return scope.plan_id !== undefined
    ? typeof scope.plan_id === 'string' && record.plan_id === scope.plan_id && record.run_id === undefined
    : typeof scope.run_id === 'string' && Boolean(scope.run_id) && record.run_id === scope.run_id && record.plan_id === undefined;
}

// Several turns may claim the same step, for example an abandoned session beside the one that works now.
// Any of them shows that the step is being worked on; the one that lasts longest is shown.
export function selectActivity(records, scope, now) {
  return records.filter(row => matchesActivity(row, scope, now))
    .reduce((latest, row) => (latest && latest.expires_at >= row.expires_at ? latest : row), null);
}
