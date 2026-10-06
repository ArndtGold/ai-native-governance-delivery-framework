import type { Envelope } from './types';
const states = new Set(['available', 'empty', 'partial', 'invalid', 'missing', 'unsupported', 'blocked', 'stale', 'error']);
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown) => typeof v === 'string';
const nullableText = (v: unknown) => v === null || text(v);
const resources = (v: unknown) => Array.isArray(v) && v.every(r => object(r) && text(r.resource_id) && text(r.run_id) && text(r.type) && text(r.registered_reference) && nullableText(r.path) && text(r.status));
const diagnostics = (v: unknown) => Array.isArray(v) && v.every(d => object(d) && text(d.code) && ['message', 'path', 'next_step', 'severity'].every(k => d[k] === undefined || text(d[k])));
export const graphReferences = (v: unknown) => Array.isArray(v) && v.length <= 64 && v.every(r => object(r)
  && ['resource_id', 'run_id', 'origin', 'path'].every(k => text(r[k]))
  && ['node_id', 'graph_digest', 'content_digest', 'content', 'code'].every(k => nullableText(r[k]))
  && ['available', 'unresolved', 'missing', 'blocked', 'unsupported'].includes(String(r.state))
  && (r.state !== 'available' || text(r.node_id) && text(r.content_digest) && text(r.graph_digest) && text(r.content)));
export function validateData(path: string, value: Envelope<unknown>) {
  if (value.data === null) return;
  const data = value.data;
  let valid = false;
  if (object(data)) {
    if (path.startsWith('/api/snapshot')) valid = Array.isArray(data.runs) && data.runs.every(r => object(r) && text(r.run_id) && text(r.title) && typeof r.valid === 'boolean' && ['lifecycle', 'revision_id', 'objective', 'status', 'current_gate', 'code'].every(k => nullableText(r[k]))
      && (r.attention === undefined || object(r.attention) && text(r.attention.blocking_reason) && text(r.attention.missing_approval) && Number.isSafeInteger(r.attention.missing_evidence_count) && (r.attention.missing_evidence_count as number) >= 0)) && typeof data.file_count === 'number' && typeof data.byte_count === 'number';
    else if (path.startsWith('/api/context/')) valid = text(data.run_id) && graphReferences(data.references);
    else if (path.startsWith('/api/runs/')) {
      valid = text(data.run_id) && (data.title === undefined || text(data.title)) && resources(data.resources) && (data.diagnostics === undefined || diagnostics(data.diagnostics));
      if (data.evaluation !== undefined) {
        const e = data.evaluation, p = data.persisted;
        valid = valid && object(e) && ['status', 'current_gate', 'blocking_reason', 'missing_approval', 'next_allowed_action', 'doctor_status', 'git_evidence'].every(k => text(e[k]))
          && nullableText(e.next_action_de) && diagnostics(e.diagnostics) && Array.isArray(e.missing_evidence)
          && Array.isArray(e.approvals) && e.approvals.every(a => object(a) && ['gate', 'status', 'evidence'].every(k => text(a[k])))
          && object(p) && ['current_gate', 'next_allowed_action', 'decision'].every(k => text(p[k]));
      }
    } else if (path.startsWith('/api/documents/')) valid = resources([data.resource]) && (value.state !== 'available' || text(data.content) && ['markdown', 'json', 'text'].includes(String(data.format)) && object(data.links) && Object.values(data.links).every(text));
    else if (path.startsWith('/api/freshness')) valid = data.unchanged === true;
  }
  if (!valid) throw Error('dto_invalid');
}
export function validateEnvelope(value: unknown, expected?: { target: string; snapshot: string }): asserts value is Envelope<unknown> {
  if (!object(value) || value.schema_version !== '1' || !object(value.target)
    || typeof value.target.target_id !== 'string' || typeof value.target.display_path !== 'string'
    || !states.has(String(value.state)) || typeof value.retryable !== 'boolean'
    || !(value.code === null || typeof value.code === 'string')
    || !(value.snapshot_id === null || typeof value.snapshot_id === 'string')
    || !(value.observed_as_of === null || typeof value.observed_as_of === 'string')
    || !(value.source_digest === null || typeof value.source_digest === 'string')
    || !Object.hasOwn(value, 'data')) throw Error('dto_invalid');
  if (expected && (value.target.target_id !== expected.target
    || value.data !== null && value.snapshot_id !== expected.snapshot)) throw Error('dto_invalid');
}
export type ReadTransport = <T>(path: string, signal: AbortSignal, expected?: { target: string; snapshot: string }) => Promise<Envelope<T>>;
export function createApi(secret: string): ReadTransport {
  return async function read<T>(path: string, signal: AbortSignal, expected?: { target: string; snapshot: string }): Promise<Envelope<T>> {
    const response = await fetch(path, { headers: { 'x-agdf-session': secret }, signal, cache: 'no-store', credentials: 'omit', redirect: 'error' });
    const value: unknown = await response.json(); validateEnvelope(value, expected); validateData(path, value);
    return value as Envelope<T>;
  };
}
export function consumeSession(): string {
  const value = window.location.hash.slice(1);
  window.history.replaceState(null, '', window.location.pathname);
  return /^[a-f0-9]{64}$/.test(value) ? value : '';
}
