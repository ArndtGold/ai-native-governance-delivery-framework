import { createHash } from 'node:crypto';
export const GENERATION_LIMITS = Object.freeze({ slots: 3, input: 65536, result: 1048576, qualify: 30000, close: 10000, receipts: 256, routes: 4096 });
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/u.test(value);
const fields = ['schema_version', 'owner_epoch', 'generation_id', 'request_id', 'kind', 'original_operation_id', 'payload', 'context'];
export function validGenerationMessage(value, { epoch, generation, reply = false } = {}) {
  if (!finiteJson(value) || !value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join() !== [...fields].sort().join()
    || value.schema_version !== '1' || value.owner_epoch !== epoch || value.generation_id !== generation
    || !uuid(value.request_id) || !(value.original_operation_id === null || uuid(value.original_operation_id))
    || !Number.isSafeInteger(value.generation_id) || value.generation_id < 1
    || !(reply ? ['qualified', 'result', 'status', 'closed', 'failure'] : ['qualify', 'invoke', 'session_inspect', 'shutdown']).includes(value.kind)
    || !value.context || typeof value.context !== 'object' || Array.isArray(value.context)) return false;
  if (['status', 'closed'].includes(value.kind) && (!value.payload || !['views', 'inflight', 'executor', 'uncertain'].every(key =>
    Number.isSafeInteger(value.payload[key]) && value.payload[key] >= 0) || typeof value.payload.closing !== 'boolean' || value.kind === 'closed' && value.payload.closing !== true)) return false;
  try { return Buffer.byteLength(JSON.stringify(value)) <= (reply ? GENERATION_LIMITS.result : GENERATION_LIMITS.input); } catch { return false; }
}
export function generationMessage(epoch, generation, kind, payload, context = {}, original = null, requestId) {
  return JSON.parse(JSON.stringify({ schema_version: '1', owner_epoch: epoch, generation_id: generation, request_id: requestId,
    kind, original_operation_id: original, payload, context }));
}
export function generationManifest(runtime, uiDigest, sdkDigest) {
  if (typeof runtime.toolErrorContract !== 'string' || !runtime.toolErrorContract
    || typeof runtime.projectToolResult !== 'function' || typeof runtime.consumeToolResult !== 'function'
    || typeof runtime.normalizeFailure !== 'function') throw Error('generation_manifest_incompatible');
  // Stable transport shape, never business eligibility or a human-origin proof.
  return { schema_version: '1', mode: runtime.mode ?? 'headless', sdk_digest: sdkDigest,
    protocol: 'mcp-sdk/2:stdio-legacy-and-modern', tool_error_contract: runtime.toolErrorContract,
    tools: runtime.tools.map(tool => ({ name: tool.name, definition: tool.definition })),
    resource: runtime.ui ? { uri: runtime.ui.uri, mimeType: runtime.ui.mimeType, digest: uiDigest } : null,
    command_groups: [...(runtime.trustedContext.commandGroups ?? [])] };
}
export const manifestDigest = manifest => createHash('sha256').update(JSON.stringify(manifest)).digest('hex');

const FAILURE_REASONS = new Set([
  'generation_unavailable', 'generation_input_limit', 'generation_response_unknown', 'generation_connection_lost',
  'generation_capacity_protected', 'generation_manifest_incompatible', 'generation_result_limit',
  'generation_request_capacity', 'generation_already_initialized', 'generation_work_protected',
  'generation_cleanup_unconfirmed', 'resource_denied', 'runtime_provenance_invalid', 'runtime_version_mismatch',
  'dispatch_busy', 'dispatch_cancelled', 'dispatch_timeout', 'dispatch_worker_failed', 'dispatch_worker_termination_unconfirmed',
  'runtime_publication_unowned', 'runtime_candidate_manifest_invalid', 'runtime_candidate_unowned', 'runtime_candidate_digest_mismatch',
  'AGDF_MCP_EXECUTABLE_CLAIM_INVALID', 'AGDF_MCP_EXECUTABLE_CLAIM_CONTENDED',
  'AGDF_MCP_EXECUTABLE_CLAIM_LOCK_UNCONFIRMED', 'AGDF_MCP_PUBLICATION_DEADLINE_EXCEEDED',
]);
export function generationFailureReason(error) {
  const reason = error?.code ?? error?.message;
  return FAILURE_REASONS.has(reason) ? reason : 'generation_runtime_failed';
}

// Private owner transport. JSON strings deliberately preserve the old fork wire
// semantics instead of accepting Worker structured-clone capabilities.
export const OWNER_EXECUTION_MODEL = 'owner_threads_v1';
// The fixed owner header is separate from the unchanged generation wire
// budgets. Wrapping a previously legal 64 KiB/1 MiB packet must not reject it.
export const OWNER_LIMITS = Object.freeze({ frames: 64, bytes: 3 * GENERATION_LIMITS.result, history: 8192,
  header: 512, inputFrame: GENERATION_LIMITS.input + 512, resultFrame: GENERATION_LIMITS.result + 512 });
const ownerFields = ['schema_version', 'token', 'connection_epoch', 'request_id', 'kind', 'generation_epoch', 'generation_id', 'publication_id', 'payload'];
const ownerKinds = new Set(['open', 'opened', 'send', 'message', 'exit', 'failure', 'stop', 'closed']);
export function finiteJson(value, depth = 0, seen = new Set()) {
  if (depth > 64) return false;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (!value || typeof value !== 'object' || seen.has(value)) return false;
  const array = Array.isArray(value);
  if (Object.getPrototypeOf(value) !== (array ? Array.prototype : Object.prototype)) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value), keys = Object.keys(descriptors);
  if (Reflect.ownKeys(value).length !== keys.length) return false;
  if (array && (keys.length !== value.length + 1 || keys.some(key => key !== 'length' && !/^(?:0|[1-9][0-9]*)$/u.test(key)))) return false;
  seen.add(value);
  for (const key of keys) {
    if (array && key === 'length') continue;
    const d = descriptors[key];
    if (!d.enumerable || !Object.hasOwn(d, 'value') || !finiteJson(d.value, depth + 1, seen)) { seen.delete(value); return false; }
  }
  seen.delete(value); return true;
}
export function ownerFrame(binding, kind, payload, requestId, generation = {}) {
  return { schema_version: '1', token: binding.token, connection_epoch: binding.connection_epoch,
    request_id: requestId, kind, generation_epoch: generation.epoch ?? null,
    generation_id: generation.generation ?? null, publication_id: generation.publication_id ?? binding.publication_id, payload };
}
export function encodeOwnerFrame(value, binding, { reply = false } = {}) {
  if (!finiteJson(value) || Object.keys(value).sort().join() !== [...ownerFields].sort().join()
    || value.schema_version !== '1' || value.token !== binding.token || value.connection_epoch !== binding.connection_epoch
    || !uuid(value.token) || !uuid(value.connection_epoch) || !uuid(value.request_id) || !ownerKinds.has(value.kind)
    || !(reply ? ['opened', 'message', 'exit', 'failure', 'stop'] : ['open', 'send', 'closed']).includes(value.kind)
    || !/^[0-9a-f]{64}$/u.test(value.publication_id ?? '')
    || !(value.generation_epoch === null && value.generation_id === null
      || uuid(value.generation_epoch) && Number.isSafeInteger(value.generation_id) && value.generation_id > 0)) throw Error('generation_input_limit');
  if (Buffer.byteLength(JSON.stringify(value.payload)) > (reply ? GENERATION_LIMITS.result : GENERATION_LIMITS.input)) throw Error('generation_input_limit');
  if (['send', 'message'].includes(value.kind) && (!validGenerationMessage(value.payload, { epoch: value.generation_epoch, generation: value.generation_id, reply: value.kind === 'message' })
    || value.payload.request_id !== value.request_id)) throw Error('generation_input_limit');
  const wire = JSON.stringify(value);
  if (Buffer.byteLength(wire) > (reply ? OWNER_LIMITS.resultFrame : OWNER_LIMITS.inputFrame)) throw Error('generation_input_limit');
  return wire;
}
export function decodeOwnerFrame(wire, binding, options) {
  if (typeof wire !== 'string' || Buffer.byteLength(wire) > (options?.reply ? OWNER_LIMITS.resultFrame : OWNER_LIMITS.inputFrame)) throw Error('generation_input_limit');
  const value = JSON.parse(wire); encodeOwnerFrame(value, binding, options); return value;
}
export function publicationSelector(runtime) {
  return { schema_version: '1', publication_id: runtime.publication_id, version: runtime.version,
    server_digest: runtime.digest, dispatcher_digest: runtime.dispatcherDigest, sdk_digest: runtime.sdkDigest };
}
