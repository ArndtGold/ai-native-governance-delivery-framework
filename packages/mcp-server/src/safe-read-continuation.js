// Only a single, exact Core-supplied inspect call may be folded into a response.
// Dispatch can repair sealed relationships; no dispatch or command is auto-run.
const operations = new Set(['authoring-inputs', 'gate-check', 'operation-contract']);
// Only read results fold a follow-up read. A write result returns at once so a
// slow or large follow-up can never delay or enlarge the receipt of a committed
// write; its next read stays a normal supplied call.
const readableOutcome = new Set(['inspect_result', 'skill_continuation', 'intake_continuation', 'control_result']);

export function suppliedReadContinuation(result) {
  if (!result || result.terminal === true || !readableOutcome.has(result.outcome)) return null;
  if (result.outcome === 'inspect_result' && result.report?.available === false) return null;
  // Source pages are consumed explicitly, in order. Folding page N+1 into page N
  // would create two competing source locations and could lose the first form.
  if (result.operation === 'authoring-inputs') return null;
  // Bootstrap state and initialization have compact response contracts. Their
  // supplied setup/Run operation-contract remains an explicit next action
  // instead of duplicating the full command schema inside the bootstrap result.
  if (result.operation === 'project-state' || result.binding?.kind === 'project.initialize') return null;
  // These are authoritative normal next steps, not recovery or optional preview.
  const lists = [result.next_calls, result.continuation?.next_calls,
    result.report?.next_calls, result.family_result?.next_calls].filter(Array.isArray);
  const candidates = new Map(lists.flat().filter(Boolean).map(call => [JSON.stringify([call.tool, call.arguments]), call]));
  if (candidates.size !== 1) return null;
  const call = [...candidates.values()][0];
  if (call.tool !== 'agdf_inspect' || !operations.has(call.arguments?.operation)
    || call.arguments?.planning && call.arguments?.run_id) return null;
  return { tool: call.tool, arguments: structuredClone(call.arguments) };
}

export async function appendSafeReadContinuation(result, { execute, validate, allowed = true } = {}) {
  let call, phase = 'selection';
  // execute owns normal parsing, policy and result validation. A follow-up failure
  // is separate from the original read result and never replaces it.
  try {
    call = allowed && suppliedReadContinuation(result);
    if (!call) return result;
    phase = 'validation';
    if (!validate?.(call)) return result;
    phase = 'execute';
    const observed = await execute(call);
    return { ...result, next_read: { ...call, result: observed, authorizes: false } };
  } catch {
    if (!call) return result;
    return { ...result, next_read: { ...call, result: null, authorizes: false,
      failure: { code: 'read_followup_unavailable', phase, original_effect_unchanged: true,
        instruction: 'The original operation result and receipt remain authoritative. No write was repeated. Inspect the supplied read separately; never replay a successful write to obtain its next step.' } } };
  }
}

// Core validates the original domain before this explicit MCP wire projection.
// Open result schemas already permit the additive fields; dispatch is closed.
export function nextActionOutputSchema(name, schema) {
  if (name !== 'agdf_dispatch' || !schema) return schema;
  return { ...schema, properties: { ...schema.properties,
    next_action: { type: 'object', required: ['state', 'authorizes'],
      properties: { state: { type: 'string' }, authorizes: { const: false } } },
    next_read: { type: 'object', required: ['tool', 'arguments', 'result', 'authorizes'],
      properties: { tool: { const: 'agdf_inspect' }, arguments: { type: 'object' },
        result: { type: ['object', 'null'] }, authorizes: { const: false } } },
    recovery_only: { type: 'object' },
  } };
}
