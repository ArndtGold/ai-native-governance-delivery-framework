import { createHash, randomUUID } from 'node:crypto';

const tools = new Set(['agdf_project', 'agdf_run', 'agdf_prepare', 'agdf_record', 'agdf_approve', 'agdf_revise', 'agdf_closeout']);
const referenceSchema = { type: 'object', additionalProperties: false, required: ['prepared_call_id', 'inputs'], properties: {
  prepared_call_id: { type: 'string', pattern: '^[0-9a-f-]{36}$' },
  inputs: { type: 'object', maxProperties: 16 },
} };

// Connection-local argument storage, never permission or policy. The original
// group, immutable binding, UUID and every Core validator still execute unchanged.
export function preparedTransportSchema(name, schema) {
  if (!tools.has(name)) return schema;
  const { properties, $defs, type, additionalProperties, ...guards } = schema;
  return { type, additionalProperties, required: [], ...($defs ? { $defs } : {}),
    properties: { ...properties, ...referenceSchema.properties, ...(name === 'agdf_prepare' ? { inputs: { ...referenceSchema.properties.inputs, description: 'Only required payload pointers; ready: {}.' } } : {}) },
    anyOf: [{ ...guards, not: { anyOf: [...(guards.not ? [guards.not] : []),
      { required: ['prepared_call_id'] }, { required: ['inputs'] }] } },
      { required: referenceSchema.required, maxProperties: 2 }],
  };
}
export function createPreparedCallTransport({ now = Date.now, maxEntries = 256, lifetimeMs = 30 * 60_000 } = {}) {
  const rows = new Map(), signatures = new Map();
  const fail = code => { throw Object.assign(Error(code), { facts: { code, dispatch: 'not_dispatched', field: 'arguments' } }); };
  function expire() { for (const [id, row] of rows) if (now() - row.created >= lifetimeMs) { rows.delete(id); signatures.delete(row.signature); } }
  function submit(call, required = []) {
    if (!tools.has(call?.tool) || !call.arguments || !Array.isArray(required)
        || required.some(p => !/^\/command\/payload\/(?:[a-z_]+|[0-9]+)(?:\/(?:[a-z_]+|[0-9]+))*$/u.test(p)
          || p.split('/').some(k => ['__proto__', 'prototype', 'constructor'].includes(k)))) return undefined;
    const value = JSON.stringify({ call, required });
    if (Buffer.byteLength(value) > 65536) return undefined;
    expire();
    const signature = createHash('sha256').update(value).digest('hex');
    let id = signatures.get(signature);
    if (!id) {
      if (rows.size >= maxEntries) return undefined;
      id = randomUUID(); signatures.set(signature, id);
      rows.set(id, { call: JSON.parse(value).call, required: [...required], signature, created: now() });
    }
    return { tool: call.tool, arguments: { prepared_call_id: id, inputs: {} } };
  }
  return {
    decorate(result) {
      const value = structuredClone(result);
      for (const owner of [value, value.report, value.continuation, value.recovery, value.navigation].filter(Boolean)) {
        for (const form of [owner.prepared_call, owner.material_call, owner.approval_call, ...owner.recording_calls ?? []].filter(Boolean)) {
          const short = submit(form.call, form.required_inputs);
          if (short) { form.submit = short; form.instruction = 'Prefer submit on this connection; after reconnect retain the full original call for original-operation recovery. Fill inputs using the exact required_inputs JSON pointers. Stored binding and UUID cannot be overwritten. ' + form.instruction; }
        }
        for (const call of [...owner.next_calls ?? [], ...(owner.resume_call ? [owner.resume_call] : []), ...(owner.operation_status_call ? [owner.operation_status_call] : [])]) {
          const short = submit(call); if (short) { call.submit = short; call.required_inputs = []; call.submission_instruction = 'This call is already complete. Copy submit.arguments unchanged with inputs:{}. The original UUID and bindings are already stored; never generate or supply IDs in inputs. Core still checks current eligibility.'; }
        }
      }
      return value;
    },
    validationHint(name, input) {
      if (!tools.has(name) || !input || typeof input !== 'object') return '';
      const id = input.prepared_call_id ?? input.submit_id;
      if (typeof id !== 'string') return '';
      expire();
      const row = rows.get(id);
      if (!row) return 'Prepared reference unavailable on this connection. Use the retained full original call and original-UUID observation/recovery; never guess a new binding or UUID.';
      if (row.call.tool !== name) return 'A prepared reference cannot cross permission groups. No operation was dispatched.';
      const conflict = Object.entries(input).some(([key, value]) => !['prepared_call_id', 'submit_id', 'inputs'].includes(key)
        && JSON.stringify(row.call.arguments[key]) !== JSON.stringify(value));
      if (conflict) return 'Do not merge raw and prepared calls: their fixed fields conflict. Review the intended binding; neither binding was executed.';
      const prefix = 'Choose raw OR prepared mode. Prepared arguments contain only prepared_call_id and inputs; never submit_id or duplicated raw fields. ';
      return (prefix + (row.required.length
        ? `Fill inputs only at these required JSON pointers from actual author/review/reply input: ${JSON.stringify(row.required)}. Do not invent values.`
        : `Exact ready call: ${JSON.stringify({ tool: name, arguments: { prepared_call_id: id, inputs: {} } })}`)).slice(0, 768);
    },
    resolve(name, input) {
      if (!Object.hasOwn(input, 'prepared_call_id')) return input;
      expire();
      const row = rows.get(input.prepared_call_id);
      if (!row) return fail('session_expired');
      if (row.call.tool !== name || Object.keys(input).some(k => !['prepared_call_id', 'inputs'].includes(k))
          || !input.inputs || typeof input.inputs !== 'object' || Array.isArray(input.inputs)
          || Object.keys(input.inputs).length !== row.required.length || row.required.some(p => !Object.hasOwn(input.inputs, p))
          || Buffer.byteLength(JSON.stringify(input)) > 65536) return fail('command_schema_invalid');
      const args = structuredClone(row.call.arguments);
      for (const pointer of row.required) {
        const parts = pointer.slice(1).split('/'); let destination = args;
        for (const part of parts.slice(0, -1)) destination = destination[part];
        destination[parts.at(-1)] = structuredClone(input.inputs[pointer]);
      }
      return args;
    },
    close() { rows.clear(); signatures.clear(); },
  };
}
