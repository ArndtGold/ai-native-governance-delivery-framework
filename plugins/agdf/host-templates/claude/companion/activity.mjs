export const activityLifetime = 30_000;
const deduplicationWindow = 5 * 60_000;
export const activityRecordLimit = 64;
const toolLimit = 12;
const id = /^[a-z0-9_-]{1,128}$/iu;
const runId = /^[a-z0-9][a-z0-9._-]{0,127}$/u;
export const isActivityId = value => typeof value === 'string' && id.test(value);
const revision = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/iu;
const workPhases = new Map([
  ['post_ur_review', 'Brownfield Review'],
  ['pre_implementation_analysis', 'Brownfield Analysis'],
  ['prd_definition', 'PRD'],
  ['sd_definition', 'SD'],
  ['tp_definition', 'TP'],
  ['implementation', 'CD+Tests'],
]);

// The host supplies the turn identity. Core supplies the work scope and current step.
export function workBinding(request, result) {
  const continuation = result?.continuation;
  const target = result?.target?.governance_target;
  const gate = workPhases.get(continuation?.phase);
  if (request?.continue_delivery !== true || result?.outcome !== 'skill_continuation' || result.terminal !== false
    || result.authorizes !== false || !gate || result.control?.current_gate !== gate || result.control?.next_operation?.actor !== 'agent'
    || result.target?.resolution_state !== 'resolved' || typeof target !== 'string' || !target
    || (request.primary_target !== undefined && request.primary_target !== target)
    || target !== continuation.governance_target || typeof continuation.run_id !== 'string' || !runId.test(continuation.run_id)
    || request.run_id !== continuation.run_id || typeof continuation.revision_id !== 'string' || !revision.test(continuation.revision_id)) return null;
  return { target_id: target, run_id: continuation.run_id, revision_id: continuation.revision_id, gate };
}

export function updateActivity(records, event, now) {
  const { kind, session, turn, tool, binding } = event;
  if (!isActivityId(session) || !isActivityId(turn)) return null;
  const terminal = kind === 'ended' || kind === 'interrupted';
  const sameTurn = row => row.session === session && row.turn === turn;
  const current = records.filter(row => row.until > now);
  if (current.some(row => row.quarantined)) return null;
  const previous = current.find(sameTurn);
  const tools = previous?.tools ?? [];
  if (!terminal && (!['work', 'lost'].includes(kind) || !isActivityId(tool)
    || previous?.terminal || tools.includes(tool) || tools.length >= toolLimit || (kind === 'work' ? !binding : !previous))) return null;
  const next = current.filter(row => !sameTurn(row));
  if (next.length >= activityRecordLimit) return [{ quarantined: true, until: now + deduplicationWindow }];
  const lifetime = { session, turn, until: now + deduplicationWindow };
  if (terminal) return [...next, { ...lifetime, terminal: true, kind }];
  return [...next, {
    ...lifetime, ...binding, tools: [...tools, tool], expires_at: kind === 'work' ? now + activityLifetime : 0,
  }];
}

export function matchesActivity(record, scope, now) {
  return Boolean(record && scope?.gate && scope.target_id && scope.run_id && scope.revision_id
    && !record.terminal && !record.quarantined && Number.isSafeInteger(record.expires_at)
    && record.expires_at > now && record.expires_at <= now + activityLifetime
    && record.target_id === scope.target_id && record.run_id === scope.run_id
    && record.revision_id === scope.revision_id && record.gate === scope.gate);
}

export function selectActivity(records, scope, now) {
  const matches = records.filter(row => matchesActivity(row, scope, now));
  return matches.length === 1 ? matches[0] : null;
}
