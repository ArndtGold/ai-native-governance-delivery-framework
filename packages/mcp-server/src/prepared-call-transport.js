import { createHash, randomUUID } from 'node:crypto';

const tools = new Set(['agdf_project', 'agdf_run', 'agdf_prepare', 'agdf_record', 'agdf_approve', 'agdf_revise', 'agdf_closeout']);
const referencePattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/u;
const referenceSchema = { type: 'object', additionalProperties: false, required: ['prepared_call_id', 'inputs'], properties: {
  prepared_call_id: { type: 'string', pattern: '^[0-9a-f-]{36}$' },
  inputs: { type: 'object', maxProperties: 16 },
} };
const inputNames = pointers => {
  const parts = pointers.map(pointer => pointer.split('/').slice(3));
  const leaves = parts.map(path => path.at(-1) || 'payload');
  const names = parts.map((path, index) => {
    const base = /^[a-z_]/u.test(leaves[index]) && leaves.filter(leaf => leaf === leaves[index]).length === 1
      ? leaves[index] : path.join('_') || 'payload';
    return /^[a-z_]/u.test(base) ? base : `field_${base}`;
  });
  // Flattened paths may collide with literal underscore field names. The
  // deterministic suffix belongs to this form only, never to a binding or UUID.
  const reserved = new Set(names), used = new Set();
  return names.map(base => {
    let name = base, index = 1;
    if (names.filter(candidate => candidate === base).length > 1 || used.has(name)) {
      do { name = `${base}_${index++}`; } while (reserved.has(name) || used.has(name));
    }
    used.add(name); return name;
  });
};

// Connection-local argument storage, never permission or policy. The original
// group, immutable binding, UUID and every Core validator still execute unchanged.
export function preparedTransportSchema(name, schema) {
  if (!tools.has(name)) return schema;
  const { properties, $defs, type, additionalProperties, ...guards } = schema;
  return { type, additionalProperties, required: [], ...($defs ? { $defs } : {}),
    properties: { ...properties, ...referenceSchema.properties, ...(name === 'agdf_prepare' ? { inputs: { ...referenceSchema.properties.inputs, description: 'Named required fields; ready: {}.' } } : {}) },
    anyOf: [{ ...guards, not: { anyOf: [...(guards.not ? [guards.not] : []),
      { required: ['prepared_call_id'] }, { required: ['inputs'] }] } },
      { required: referenceSchema.required, maxProperties: 2 }],
  };
}
export function createPreparedCallTransport({ now = Date.now, maxEntries = 256, lifetimeMs = 30 * 60_000 } = {}) {
  const rows = new Map(), signatures = new Map(), expired = new Map();
  const fail = code => { throw Object.assign(Error(code), { facts: { code, dispatch: 'not_dispatched', field: 'arguments' } }); };
  function expire() {
    for (const [id, row] of rows) if (now() - row.created >= lifetimeMs) {
      rows.delete(id); signatures.delete(row.signature); expired.set(id, now());
    }
    // Tombstones distinguish observed expiry from a typo without keeping an
    // unbounded connection history or retaining the expired raw arguments.
    while (expired.size > maxEntries) expired.delete(expired.keys().next().value);
  }
  function referenceState(id) {
    if (typeof id !== 'string' || !id) return 'reference_empty';
    if (!referencePattern.test(id)) return 'reference_invalid';
    expire();
    return rows.has(id) ? 'available' : expired.has(id) ? 'reference_expired' : 'reference_unknown';
  }
  const operation = call => ({ kind: call.arguments.command?.kind ?? null,
    ...Object.fromEntries(['operation_id', 'target_id', 'run_id', 'expected_revision_id']
      .filter(key => call.arguments[key] !== undefined).map(key => [key, call.arguments[key]])),
    ...Object.fromEntries(['gate', 'presentation_id'].filter(key => call.arguments.command?.payload?.[key] !== undefined)
      .map(key => [key, call.arguments.command.payload[key]])) });
  function validTemplate(call, required = []) {
    if (!tools.has(call?.tool) || !call.arguments || !referencePattern.test(call.arguments.operation_id ?? '')
        || typeof call.arguments.command?.kind !== 'string' || !call.arguments.command.kind || !Array.isArray(required)
        || required.length > 16 || new Set(required).size !== required.length
        || required.some(p => !/^\/command\/payload\/(?:[a-z_]+|[0-9]+)(?:\/(?:[a-z_]+|[0-9]+))*$/u.test(p)
          || p.split('/').some(k => ['__proto__', 'prototype', 'constructor'].includes(k)))) return false;
    return true;
  }
  function originalProjection(raw, fields, names = inputNames(fields)) {
    return { required_inputs: names, input_fields: names.map(name => ({ name, required: true })), operation: operation(raw), recovery_only: {
      original_call: structuredClone(raw), required_inputs: [...fields], authorizes: false,
      input_fields: names.map((name, index) => ({ name, pointer: fields[index] })),
      instruction: 'Recovery only, never the normal call path. Preserve this exact original raw call and UUID across reconnect. For an uncertain dispatch, first observe the original operation and retain exactly the inputs already submitted; never refresh the revision, invent a UUID or change the payload to escape uncertainty.' } };
  }
  const unregisteredRecovery = (call, required = []) => validTemplate(call, required) ? originalProjection(call, required) : null;
  function submit(call, required = []) {
    if (!validTemplate(call, required)) return undefined;
    const value = JSON.stringify({ call, required });
    if (Buffer.byteLength(value) > 65536) return undefined;
    expire();
    const signature = createHash('sha256').update(value).digest('hex');
    let id = signatures.get(signature);
    if (!id) {
      if (rows.size >= maxEntries) return undefined;
      id = randomUUID(); signatures.set(signature, id);
      rows.set(id, { call: JSON.parse(value).call, required: [...required], names: inputNames(required), signature, created: now() });
    }
    return { tool: call.tool, arguments: { prepared_call_id: id, inputs: {} } };
  }
  function projectCall(call, required = []) {
    if (!tools.has(call?.tool)) return call;
    const alreadyPrepared = Object.hasOwn(call.arguments ?? {}, 'prepared_call_id');
    const saved = alreadyPrepared && referenceState(call.arguments.prepared_call_id) === 'available'
      ? rows.get(call.arguments.prepared_call_id) : null;
    if (alreadyPrepared && (!saved || saved.call.tool !== call.tool
        || Object.keys(call.arguments).some(key => !['prepared_call_id', 'inputs'].includes(key)))) return null;
    const raw = saved?.call ?? call, fields = saved?.required ?? required;
    const prepared = alreadyPrepared ? { tool: call.tool, arguments: structuredClone(call.arguments) } : submit(raw, fields);
    if (!prepared) return null;
    const names = [...(saved?.names ?? rows.get(prepared.arguments.prepared_call_id).names)];
    return { ...prepared, ...originalProjection(raw, fields, names) };
  }
  return {
    // Transport availability only: never a gate, review or permission decision.
    // An offered input form legitimately has no authored values yet.
    isAvailable(call) {
      const args = call?.arguments;
      if (!tools.has(call?.tool) || !args || typeof args !== 'object'
          || !Object.hasOwn(args, 'prepared_call_id') || !Object.hasOwn(args, 'inputs')
          || !args.inputs || typeof args.inputs !== 'object' || Array.isArray(args.inputs)
          || Object.keys(args).some(key => !['prepared_call_id', 'inputs'].includes(key))
          || referenceState(args.prepared_call_id) !== 'available') return false;
      return rows.get(args.prepared_call_id).call.tool === call.tool;
    },
    decorate: function projectResult(result) {
      const value = structuredClone(result);
      if (value.next_read?.result) value.next_read.result = projectResult(value.next_read.result);
      for (const owner of [value, value.report, value.continuation, value.recovery, value.navigation,
        value.family_result, value.presentation_delivery].filter(Boolean)) {
        for (const form of [owner.prepared_call, owner.material_call, owner.approval_call, ...owner.recording_calls ?? []].filter(Boolean)) {
          const raw = form.call, projected = projectCall(raw, form.required_inputs);
          delete form.submit;
          if (!tools.has(raw?.tool)) continue;
          form.call = projected ? { tool: projected.tool, arguments: projected.arguments } : null;
          if (projected) {
            form.required_inputs = projected.required_inputs; form.input_fields = projected.input_fields;
            form.operation = projected.operation; form.recovery_only = projected.recovery_only;
            form.instruction = 'Use call.tool with call.arguments. Fill only call.arguments.inputs using the named required_inputs fields; keep its reference unchanged. The adapter maps those names to the exact stored command fields and retains binding and UUID. Do not construct a raw envelope or copy technical JSON paths. Keep authored text as string data using host-supported serialization. Check failure before reading returned fields. recovery_only is separate original-request recovery, never the normal write path. ' + (form.instruction ?? '');
          } else {
            const recovery = unregisteredRecovery(raw, form.required_inputs);
            if (recovery) Object.assign(form, recovery);
            form.state = 'transport_unavailable'; form.transport_reason = 'prepared_call_unavailable';
            form.authorizes = false;
          }
        }
        const unavailable = [];
        const projectReadyCall = call => {
          const projected = projectCall(call);
          if (!projected) {
            const recovery = unregisteredRecovery(call);
            if (recovery) unavailable.push({ ...recovery.recovery_only, operation: recovery.operation });
          }
          return projected;
        };
        if (owner.next_calls) owner.next_calls = owner.next_calls.map(projectReadyCall).filter(Boolean);
        for (const key of ['resume_call', 'operation_status_call']) if (owner[key]) owner[key] = projectReadyCall(owner[key]);
        if (unavailable.length) owner.recovery_only = { ...owner.recovery_only, authorizes: false,
          unavailable_calls: [...(owner.recovery_only?.unavailable_calls ?? []), ...unavailable] };
        for (const call of owner.next_calls ?? []) if (call?.arguments?.prepared_call_id) {
          call.required_inputs = [];
          call.submission_instruction = 'This call is complete. Forward arguments unchanged, including inputs:{}. No cloning helper, new reference, UUID or binding is needed. Core still checks current eligibility.';
        }
      }
      // The normal action has exactly the same call shape as named forms and
      // ready calls; its original raw request stays in the explicit recovery branch.
      if (value.next_action?.call) {
        const projected = projectCall(value.next_action.call, value.next_action.required_inputs);
        if (projected) value.next_action = { ...value.next_action,
          call: { tool: projected.tool, arguments: projected.arguments }, required_inputs: projected.required_inputs,
          input_fields: projected.input_fields, operation: projected.operation, recovery_only: projected.recovery_only };
        else if (tools.has(value.next_action.call?.tool) && !Object.hasOwn(value.next_action.call.arguments ?? {}, 'prepared_call_id'))
          value.next_action = { ...(unregisteredRecovery(value.next_action.call, value.next_action.required_inputs) ?? {}),
            state: 'transport_unavailable', authorizes: false, transport_reason: 'prepared_call_unavailable', call: null };
      }
      return value;
    },
    validationHint(name, input) {
      if (!tools.has(name) || !input || typeof input !== 'object') return '';
      const id = input.prepared_call_id ?? input.submit_id;
      const prefix = 'Normal call arguments contain only prepared_call_id and inputs. Copy the supplied call.arguments; never submit_id, a new ID or duplicated raw fields. ';
      if (typeof id !== 'string') {
        if (!Object.hasOwn(input, 'inputs')) return '';
        const raw = Object.keys(input).some(key => !['inputs', 'prepared_call_id', 'submit_id'].includes(key));
        return prefix + (raw ? 'A full raw call cannot contain inputs. ' : 'The prepared reference is missing. ')
          + 'Fill only its named required_inputs fields. Raw requests belong only to the explicit recovery path. No operation was dispatched.';
      }
      const state = referenceState(id);
      if (state !== 'available') return state === 'reference_expired'
        ? 'The supplied reference was issued on this connection and has expired. Use saved original-request/UUID observation and recovery; never generate another binding or UUID. No operation was dispatched.'
        : state === 'reference_empty' ? 'The prepared reference is empty. Copy the existing reference in the supplied call.arguments; never use an empty placeholder. No operation was dispatched.'
          : state === 'reference_invalid' ? 'The prepared reference is malformed. Copy the supplied call.arguments unchanged; never retype or autocorrect a reference. No operation was dispatched.'
            : 'The reference is unknown on this connection; this is not proof of expiry. Copy the exact supplied call.arguments or use saved original-request/UUID recovery. Never guess or autocorrect. No operation was dispatched.';
      const row = rows.get(id);
      if (row.call.tool !== name) return 'A prepared reference cannot cross permission groups. No operation was dispatched.';
      const conflict = Object.entries(input).some(([key, value]) => !['prepared_call_id', 'submit_id', 'inputs'].includes(key)
        && JSON.stringify(row.call.arguments[key]) !== JSON.stringify(value));
      if (conflict) return 'Do not merge raw and prepared calls: their fixed fields conflict. Review the intended binding; neither binding was executed.';
      return (prefix + (row.required.length
        ? `Fill exactly these named inputs from actual author/review/reply data: ${JSON.stringify(row.names)}. Do not invent values or mix named and legacy pointer inputs.`
        : `Exact ready call: ${JSON.stringify({ tool: name, arguments: { prepared_call_id: id, inputs: {} } })}`)).slice(0, 768);
    },
    resolve(name, input) {
      if (!Object.hasOwn(input, 'prepared_call_id')) return input;
      const state = referenceState(input.prepared_call_id);
      if (state !== 'available') return fail(state === 'reference_expired' ? 'session_expired' : 'command_schema_invalid');
      const row = rows.get(input.prepared_call_id);
      if (row.call.tool !== name || Object.keys(input).some(k => !['prepared_call_id', 'inputs'].includes(k))
          || !input.inputs || typeof input.inputs !== 'object' || Array.isArray(input.inputs)
          || Buffer.byteLength(JSON.stringify(input)) > 65536) return fail('command_schema_invalid');
      const keys = Object.keys(input.inputs);
      const named = keys.length === row.names.length && row.names.every(key => Object.hasOwn(input.inputs, key));
      const legacy = keys.length === row.required.length && row.required.every(key => Object.hasOwn(input.inputs, key));
      if (!named && !legacy) return fail('command_schema_invalid');
      const args = structuredClone(row.call.arguments);
      for (const [index, pointer] of row.required.entries()) {
        const parts = pointer.slice(1).split('/'); let destination = args;
        for (const part of parts.slice(0, -1)) destination = destination[part];
        destination[parts.at(-1)] = structuredClone(input.inputs[named ? row.names[index] : pointer]);
      }
      return args;
    },
    close() { rows.clear(); signatures.clear(); expired.clear(); },
  };
}
