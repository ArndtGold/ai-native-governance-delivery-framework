import { createHash } from 'node:crypto';
export const GENERATION_LIMITS = Object.freeze({ slots: 3, input: 65536, result: 1048576, qualify: 30000, close: 10000, receipts: 256, routes: 4096 });
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/u.test(value);
const fields = ['schema_version', 'owner_epoch', 'generation_id', 'request_id', 'kind', 'original_operation_id', 'payload', 'context'];
export function validGenerationMessage(value, { epoch, generation, reply = false } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join() !== [...fields].sort().join()
    || value.schema_version !== '1' || value.owner_epoch !== epoch || value.generation_id !== generation
    || !uuid(value.request_id) || !(value.original_operation_id === null || uuid(value.original_operation_id))
    || !Number.isSafeInteger(value.generation_id) || value.generation_id < 1
    || !(reply ? ['qualified', 'result', 'status', 'closed', 'failure'] : ['qualify', 'invoke', 'session_inspect', 'shutdown']).includes(value.kind)
    || !value.context || typeof value.context !== 'object' || Array.isArray(value.context)) return false;
  try { return Buffer.byteLength(JSON.stringify(value)) <= (reply ? GENERATION_LIMITS.result : GENERATION_LIMITS.input); } catch { return false; }
}
export function generationMessage(epoch, generation, kind, payload, context = {}, original = null, requestId) {
  return { schema_version: '1', owner_epoch: epoch, generation_id: generation, request_id: requestId,
    kind, original_operation_id: original, payload, context };
}
export function generationManifest(runtime, uiDigest, sdkDigest) {
  // Stable transport shape, never business eligibility or a human-origin proof.
  return { schema_version: '1', mode: runtime.mode ?? 'headless', sdk_digest: sdkDigest,
    protocol: 'mcp-sdk/2:stdio-legacy-and-modern',
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
