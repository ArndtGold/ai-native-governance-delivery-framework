import type { Envelope } from './types';
import { hasConsistentBacklogCounts } from '../../core/lib/control-inspect/cockpit-list.js';
import { validBacklogSummary, validWorkSummary } from '../../core/lib/control-state/backlog-summary-shape.js';
const states = new Set(['available', 'empty', 'partial', 'invalid', 'missing', 'unsupported', 'blocked', 'stale', 'error']);
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
// JSON object member order is not part of the wire contract. Array order is.
export const sameJson = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b)
    && a.length === b.length && a.every((v, i) => sameJson(v, b[i]));
  if (!object(a) || !object(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(k => Object.hasOwn(b, k) && sameJson(a[k], b[k]));
};
const text = (v: unknown) => typeof v === 'string';
const nullableText = (v: unknown) => v === null || text(v);
const savedSummary = (v: unknown, key: unknown, section: unknown) => object(v)
  && ['recorded', 'unverified', 'invalid'].includes(String(v.provenance_state)) && nullableText(v.code)
  && nullableText(v.label_de) && text(v.limitation_de) && v.authorizes === false
  && (v.provenance_state === 'recorded' ? validBacklogSummary(v.record)
    && object(v.record) && v.record.run_id === key && v.record.section === section
    && new TextEncoder().encode(JSON.stringify(v.record)).length <= 65536 : v.record === null);
const workSummary = (v: unknown, runId: string) => object(v) && validWorkSummary(v, runId)
  && new TextEncoder().encode(JSON.stringify(v)).length <= 65536;
const titleObservation = (v: unknown) => object(v) && ['available', 'unavailable'].includes(String(v.state))
  && ['code', 'path', 'heading', 'title', 'content_digest'].every(k => nullableText(v[k]))
  && text(v.observed_as_of) && text(v.backlog_digest)
  && (v.state !== 'available' || v.code === null && text(v.path) && text(v.heading) && text(v.title)
    && !!v.title && [...v.heading as string].length <= 512 && new TextEncoder().encode(v.heading as string).length <= 2048
    && /^[a-f0-9]{64}$/.test(String(v.content_digest)));
const resources = (v: unknown) => Array.isArray(v) && v.every(r => object(r) && text(r.resource_id) && text(r.run_id) && text(r.type) && text(r.registered_reference) && nullableText(r.path) && text(r.status));
const diagnostics = (v: unknown) => Array.isArray(v) && v.every(d => object(d) && text(d.code) && ['message', 'path', 'next_step', 'severity', 'section'].every(k => d[k] === undefined || text(d[k])) && (d.key === undefined || nullableText(d.key)));
const sha = (v: unknown) => typeof v === 'string' && /^sha256:[a-f0-9]{64}$/.test(v);
const uuid = (v: unknown) => typeof v === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(v);
const rawSha = (v: unknown) => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const documentGates = new Set(['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT']);
export function validDraftCheck(v: unknown, runId: string, revision: unknown): boolean {
  if (!object(v) || !object(v.source) || !object(v.display)) return false;
  const s = v.source, d = v.display, r = v.result;
  const supported = ['UR', 'PRD', 'SD', 'TP'].includes(String(s.gate));
  if (s.run_id !== runId || !uuid(s.revision_id) || s.revision_id !== revision || !text(s.gate)
    || typeof s.available !== 'boolean' || !nullableText(s.reason)
    || s.artifact_path !== (supported ? `.agdf/control/artefacts/${runId}/${s.gate}.md` : null)
    || !(s.artifact_digest === null || sha(s.artifact_digest))
    || s.available && (!supported || !sha(s.artifact_digest) || s.reason !== null)
    || !['unchecked', 'passed', 'corrections_required', 'unavailable'].includes(String(d.state))
    || !nullableText(d.reason) || !['check', 'authoring', 'reload'].includes(String(d.recovery))
    || d.findings !== undefined && (!diagnostics(d.findings) || d.state !== 'corrections_required' && (d.findings as unknown[]).length > 0)) return false;
  if (r === null) return d.state === (s.available ? 'unchecked' : 'unavailable');
  return s.available && object(r) && r.run_id === runId && r.gate === s.gate && r.expected_revision_id === revision && r.revision_id === revision
    && r.artifact_path === s.artifact_path && (r.artifact_digest === s.artifact_digest || r.artifact_digest === null && (d.state === 'unavailable'
      || r.current_gate === s.gate && r.diagnostics instanceof Array && r.diagnostics.length === 1 && object(r.diagnostics[0]) && r.diagnostics[0].code === 'artifact_gate_not_ready'))
    && typeof r.ready === 'boolean' && r.readiness_scope === 'authoring_checks' && r.authorizes === false
    && r.semantic_review_required === true && r.registration_required === true && r.presentation_required === true
    && Array.isArray(r.checks) && r.checks.every(c => object(c) && text(c.name) && typeof c.ready === 'boolean')
    && Array.isArray(r.diagnostics) && diagnostics(r.diagnostics) && text(r.next_action) && (r.readiness_details === undefined || object(r.readiness_details))
    && (r.ready ? d.state === 'passed' && r.artifact_digest === s.artifact_digest && r.diagnostics.length === 0 && r.checks.length > 0 && r.checks.every(c => c.ready)
      : ['corrections_required', 'unavailable'].includes(String(d.state)) && r.diagnostics.length > 0);
}
// Boundary/association validation only. The Core remains the state/proof authority.
function validDocumentState(v: unknown, resource: unknown): v is Record<string, unknown> {
  if (!object(v) || !object(resource) || !documentGates.has(String(v.type)) || v.schema_version !== '1' || v.authorizes !== false
    || !uuid(v.revision_id) || !nullableText(v.reason)
    || !['available', 'missing', 'blocked', 'unsupported', 'unavailable'].includes(String(v.source_state))
    || !['approved', 'draft', 'draft_checked', 'revision_required', 'check_unavailable', 'approval_unconfirmed', 'unavailable'].includes(String(v.state))
    || !['approved', 'draft', 'current', 'unavailable'].includes(String(v.version_kind))
    || !['resource_id', 'run_id', 'type', 'registered_reference'].every(k => v[k] === resource[k])
    || resource.status === 'blocked' && v.source_state !== 'blocked') return false;
  const approval = v.recorded_approval, check = v.check;
  if (!(approval === null || object(approval) && approval.status === 'approved' && text(approval.evidence))) return false;
  if (v.source_state !== 'available') return v.content_digest === null && v.state === 'unavailable' && v.version_kind === 'unavailable' && check === null;
  if (!rawSha(v.content_digest)) return false;
  if (check !== null && !(object(check) && check.content_digest === v.content_digest && validDraftCheck(check, String(v.run_id), v.revision_id)
    && object(check.source) && check.source.gate === v.type && check.source.artifact_path === v.registered_reference && check.result !== null)) return false;
  if (v.state === 'approved') return v.version_kind === 'approved' && approval !== null && check === null && v.reason === null;
  if (v.state === 'approval_unconfirmed') return v.version_kind === 'current' && approval !== null && check === null;
  if (approval !== null || v.version_kind === 'approved') return false;
  if (v.state === 'draft') return v.version_kind === 'draft' && check === null;
  if (v.state === 'draft_checked' || v.state === 'revision_required') return v.version_kind === 'draft' && object(check) && object(check.display)
    && check.display.state === (v.state === 'draft_checked' ? 'passed' : 'corrections_required');
  if (v.state === 'check_unavailable') return v.version_kind === 'draft' && (check === null || object(check) && object(check.display) && check.display.state === 'unavailable');
  return v.state === 'unavailable' && v.version_kind === 'current' && check === null;
}
function validDocumentStates(detail: Record<string, unknown>): boolean {
  const rows = detail.document_states;
  if (rows === undefined) return true;
  if (!Array.isArray(rows) || new TextEncoder().encode(JSON.stringify(rows)).length > 256 * 1024 || !Array.isArray(detail.resources)) return false;
  const registered = detail.resources.filter(r => object(r) && documentGates.has(String(r.type)));
  if (rows.length !== registered.length || new Set(rows.map(r => object(r) ? r.resource_id : null)).size !== rows.length) return false;
  return rows.every(v => {
    if (!object(v) || v.run_id !== detail.run_id || v.revision_id !== detail.revision_id
      || !registered.some(r => validDocumentState(v, r))) return false;
    const approval = v.recorded_approval, check = v.check;
    const original = object(detail.evaluation) && Array.isArray(detail.evaluation.approvals)
      ? detail.evaluation.approvals.find(a => object(a) && a.gate === v.type && a.status === 'approved') : undefined;
    if ((approval === null) !== (original === undefined)) return false;
    if (!(approval === null || object(approval) && approval.status === 'approved' && text(approval.evidence)
      && object(detail.evaluation) && Array.isArray(detail.evaluation.approvals)
      && detail.evaluation.approvals.some(a => object(a) && a.gate === v.type && a.status === approval.status && a.evidence === approval.evidence))) return false;
    return check === null || object(check) && sameJson({source:check.source,result:check.result,display:check.display}, detail.draft_check);
  });
}
export const graphReferences = (v: unknown) => Array.isArray(v) && v.length <= 64 && v.every(r => object(r)
  && ['resource_id', 'run_id', 'origin', 'path'].every(k => text(r[k]))
  && ['node_id', 'graph_digest', 'content_digest', 'content', 'code'].every(k => nullableText(r[k]))
  && ['available', 'unresolved', 'missing', 'blocked', 'unsupported'].includes(String(r.state))
  && (r.state !== 'available' || text(r.node_id) && text(r.content_digest) && text(r.graph_digest) && text(r.content)));
const detailData = (data: unknown, allowInvalid = false): boolean => {
  if (!object(data) || !text(data.run_id) || !nullableText(data.revision_id) || !nullableText(data.lifecycle)
    || !Array.isArray(data.resources) || !resources(data.resources) || data.resources.some((r: unknown) => !object(r) || r.run_id !== data.run_id)
    || data.title !== undefined && !text(data.title) || data.diagnostics !== undefined && !diagnostics(data.diagnostics)
    || data.work_summary !== undefined && data.work_summary !== null && !workSummary(data.work_summary, data.run_id)
    || data.draft_check !== undefined && !validDraftCheck(data.draft_check, data.run_id, data.revision_id)
    || !validDocumentStates(data)
    || data.backlog_comparison !== undefined && !(object(data.backlog_comparison)
      && ['matching', 'different', 'unavailable'].includes(String(data.backlog_comparison.state))
      && text(data.backlog_comparison.reason) && nullableText(data.backlog_comparison.saved_revision_id) && data.backlog_comparison.authorizes === false)) return false;
  if (data.evaluation === undefined) return allowInvalid && diagnostics(data.diagnostics);
  const e = data.evaluation, p = data.persisted;
  return object(e) && ['status', 'current_gate', 'blocking_reason', 'missing_approval', 'next_allowed_action', 'doctor_status', 'git_evidence'].every(k => text(e[k]))
    && nullableText(e.next_action_de) && diagnostics(e.diagnostics) && Array.isArray(e.missing_evidence)
    && (e.control_assessment === undefined || object(e.control_assessment) && ['open', 'blocked', 'unconfirmed', 'completed'].includes(String(e.control_assessment.state)) && e.control_assessment.authorizes === false)
    && Array.isArray(e.approvals) && e.approvals.every(a => object(a) && ['gate', 'status', 'evidence'].every(k => text(a[k])))
    && object(p) && ['current_gate', 'next_allowed_action', 'decision'].every(k => text(p[k]));
};
export const documentData = (data: unknown) => object(data) && resources([data.resource])
  && (data.content === undefined || text(data.content) && ['markdown', 'json', 'text'].includes(String(data.format))
    && text(data.content_digest) && object(data.links) && Object.values(data.links).every(text))
  && (data.document_state === undefined || validDocumentState(data.document_state, data.resource)
    && data.document_state.content_digest === data.content_digest
    && new TextEncoder().encode(JSON.stringify(data.document_state)).length <= 256 * 1024);
export function validateData(path: string, value: Envelope<unknown>) {
  if (value.data === null) return;
  if (!value.snapshot_id || !value.observed_as_of || !value.source_digest) throw Error('dto_invalid');
  const data = value.data;
  let valid = false;
  if (object(data)) {
    if (path.startsWith('/api/changes')) valid = typeof data.changed === 'boolean';
    else if (path.startsWith('/api/freshness')) valid = data.unchanged === true;
    else if (data.kind === 'backlog' && (path.startsWith('/api/snapshot') || path.startsWith('/api/runs/') || path.startsWith('/api/backlog-titles'))) {
      valid = Array.isArray(data.entries) && data.entries.every(r => object(r)
        && ['section', 'key', 'original_key', 'title', 'stored_status', 'scope', 'stored_next_step', 'source_links'].every(k => text(r[k]))
        && nullableText(r.priority) && nullableText(r.current_spec) && typeof r.selectable === 'boolean'
        && (r.row_id === undefined || text(r.row_id) && /^[a-f0-9-]{36}$/.test(r.row_id))
        && (r.saved_summary === undefined || savedSummary(r.saved_summary, r.key, r.section)
          && object(r.saved_summary) && (r.saved_summary.record === null || object(r.saved_summary.record) && r.saved_summary.record.target_id === value.target.target_id))
        && (r.title_observation === undefined || titleObservation(r.title_observation)
          && object(r.title_observation) && r.title_observation.backlog_digest === data.content_digest))
        && diagnostics(data.diagnostics) && text(data.source_path) && text(data.content_digest) && object(data.counts)
        && Object.values(data.counts).every(v => Number.isSafeInteger(v) && (v as number) >= 0)
        && hasConsistentBacklogCounts(data)
        && Number.isSafeInteger(data.file_count) && (data.file_count as number) >= 0
        && Number.isSafeInteger(data.byte_count) && (data.byte_count as number) >= 0
        && (data.removed_run_id === undefined || text(data.removed_run_id) && /^[A-Za-z0-9_-]{1,128}$/.test(data.removed_run_id));
      if (valid && path.startsWith('/api/backlog-titles') && Array.isArray(data.entries)) {
        const ids = data.entries.map(r => (r as Record<string, unknown>).row_id);
        const observed = data.entries.filter(r => (r as Record<string, unknown>).title_observation !== undefined).length;
        valid = ids.every(id => typeof id === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id))
          && new Set(ids).size === ids.length && observed >= 1 && observed <= 12;
      }
    } else if (['run', 'document', 'context'].includes(String(data.kind))) {
      valid = (data.run === null ? data.kind === 'run' && text(data.requested_run_id) && value.state === 'missing'
        : detailData(data.run, data.kind === 'run' && value.state === 'invalid'));
      if (data.kind === 'document' || data.kind === 'context') {
        valid = valid && object(data.run) && (data.document === null || documentData(data.document)
          && object(data.document) && object(data.document.resource) && data.document.resource.run_id === data.run.run_id
          && Array.isArray(data.run.resources) && data.run.resources.some(r => object(r) && object(data.document) && object(data.document.resource)
            && ['resource_id', 'run_id', 'type', 'path', 'registered_reference', 'status'].every(key => r[key] === (data.document as Record<string, Record<string, unknown>>).resource[key])));
        if (valid && object(data.document) && object(data.run)) {
          const projection = Array.isArray(data.run.document_states) ? data.run.document_states.find(s => object(s) && object(data.document) && object(data.document.resource) && s.resource_id === data.document.resource.resource_id) : undefined;
          valid = data.document.document_state === undefined ? projection === undefined || data.document.content === undefined
            : projection !== undefined && sameJson(projection, data.document.document_state)
              && object(projection) && projection.source_state === 'available' && projection.content_digest === data.document.content_digest;
        }
      }
      if (data.kind === 'context') valid = valid && object(data.context) && object(data.run)
        && data.context.run_id === data.run.run_id && Array.isArray(data.context.references) && graphReferences(data.context.references)
        && data.context.references.every((r: unknown) => object(r) && object(data.run) && r.run_id === data.run.run_id);
      const expectedKind = path.startsWith('/api/documents/') ? 'document' : path.startsWith('/api/context/') ? 'context' : 'run';
      valid = valid && (data.kind === expectedKind || value.state !== 'available' && data.kind === 'run');
    }
  }
  if (!valid) throw Error('dto_invalid');
  if (path.startsWith('/api/draft-check/') && value.state === 'available') {
    const url = new URL(path, 'https://local.invalid');
    if (!object(data) || !object(data.run) || !object(data.run.draft_check) || !object(data.run.draft_check.source)
      || data.kind !== 'run' || data.run.run_id !== url.pathname.slice(17)
      || data.run.draft_check.result === null || data.run.draft_check.source.gate !== url.searchParams.get('gate')
      || data.run.revision_id !== url.searchParams.get('expected_revision')) throw Error('dto_invalid');
  }
}
export function validateEnvelope(value: unknown, expected?: { target: string; snapshot: string; replacement?: boolean }): asserts value is Envelope<unknown> {
  if (!object(value) || value.schema_version !== '1' || !object(value.target)
    || typeof value.target.target_id !== 'string' || typeof value.target.display_path !== 'string'
    || !states.has(String(value.state)) || typeof value.retryable !== 'boolean'
    || !(value.code === null || typeof value.code === 'string')
    || !(value.snapshot_id === null || typeof value.snapshot_id === 'string')
    || !(value.observed_as_of === null || typeof value.observed_as_of === 'string')
    || !(value.source_digest === null || typeof value.source_digest === 'string')
    || !Object.hasOwn(value, 'data')) throw Error('dto_invalid');
  if (expected && (value.target.target_id !== expected.target
    || !expected.replacement && value.data !== null && value.snapshot_id !== expected.snapshot)) throw Error('dto_invalid');
}
export type ReadTransport = {
  <T>(path: string, signal: AbortSignal, expected?: { target: string; snapshot: string; replacement?: boolean }): Promise<Envelope<T>>;
  waitForChanges?: (snapshot: string, signal: AbortSignal, target: string) => Promise<Envelope<{ changed: boolean }>>;
};
export function createApi(secret: string): ReadTransport {
  const read: ReadTransport = async function read<T>(path: string, signal: AbortSignal, expected?: { target: string; snapshot: string; replacement?: boolean }): Promise<Envelope<T>> {
    const response = await fetch(path, { headers: { 'x-agdf-session': secret }, signal, cache: 'no-store', credentials: 'omit', redirect: 'error' });
    const value: unknown = await response.json(); validateEnvelope(value, expected); validateData(path, value);
    return value as Envelope<T>;
  };
  read.waitForChanges = (snapshot, signal, target) => read('/api/changes?snapshot=' + snapshot, signal, { target, snapshot });
  return read;
}
export function consumeSession(): string {
  const value = window.location.hash.slice(1);
  window.history.replaceState(null, '', window.location.pathname);
  return /^[a-f0-9]{64}$/.test(value) ? value : '';
}
