import { DECISION_CARD_LABEL_KEYS } from '../../../core/lib/interaction-catalog.js';
export interface DecisionBootstrap {
  delivery_state?: 'preview' | 'ui_primary' | 'retired'; display_nonce?: string; surface_id?: string | null; source_digest?: string;
  schema_version: '1'; session_id: string; read_session_id: string; owner_epoch: string; generation: number; expires_at: number;
  target: { target_id: string; display_path: string }; title: string; labels: Record<string, string>;
  binding: { target_id: string; run_id: string; gate: string; expected_revision_id: string; presentation_id: string;
    presentation_digest: string; material_version: string; material_sources: { type: string; path: string; digest: string }[]; presentation_language: string };
  summary: string; snapshot_id: string; resource_id: string | null; document_digest: string | null;
  decision_brief?: string | null; gate_title?: string; decision_heading?: string; approval_effect?: string; approval_effect_label?: string;
  preview?: { resource_id: string; version: string; task: string; scenarios: string[]; criterion_ids: string[]; open_questions?: string[]; content_digest: string };
  enabled_actions: ('approve' | 'request_change' | 'reject')[]; capability: 'available' | 'not_qualified'; comparison:
    { state: 'unavailable'; reason: string } | { state: 'available'; previous_revision_id: string; previous_digest: string; current_digest: string; unchanged: boolean; previous_text: string };
}
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const uuid = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value);
const hash = (value: unknown) => typeof value === 'string' && /^sha256:[a-f0-9]{64}$/.test(value);
export function readDecisionBootstrap(result: unknown): DecisionBootstrap | null {
  if (!object(result) || result.isError === true || !object(result._meta) || !object(result._meta.agdf_decision)) return null;
  const row = result._meta.agdf_decision, b = row.binding, target = row.target;
  if (row.delivery_state !== undefined && (row.delivery_state !== 'preview' || !uuid(row.display_nonce)
    || row.surface_id !== null && !uuid(row.surface_id) || !Array.isArray(row.enabled_actions) || row.enabled_actions.length)) return null;
  if (row.source_digest !== undefined && !hash(row.source_digest)) return null;
  if (!object(b) || !object(target) || !object(row.labels) || !object(row.comparison)) return null;
  if (row.preview !== undefined) {
    const p = row.preview;
    if (b.gate !== 'PRD' || !object(p) || !uuid(p.resource_id) || !hash(p.content_digest)
      || typeof p.version !== 'string' || !/^[a-z][a-z0-9-]{0,63}-v[1-9][0-9]{0,5}$/.test(p.version)
      || typeof p.task !== 'string' || !p.task.trim() || p.task.length > 1200
      || !Array.isArray(p.scenarios) || !p.scenarios.length || p.scenarios.length > 16 || !p.scenarios.every(v => typeof v === 'string' && v.length > 0 && v.length <= 240)
      || p.open_questions !== undefined && (!Array.isArray(p.open_questions) || p.open_questions.length > 16
        || !p.open_questions.every(v => typeof v === 'string' && v.trim().length > 0 && v.length <= 1200))
      || !Array.isArray(p.criterion_ids) || !p.criterion_ids.length || p.criterion_ids.length > 64 || !p.criterion_ids.every(v => typeof v === 'string' && /^[A-Z][A-Z0-9-]*$/.test(v))) return null;
  }
  if (row.schema_version !== '1' || !['session_id', 'read_session_id', 'owner_epoch', 'snapshot_id'].every(key => uuid(row[key]))
    || !Number.isSafeInteger(row.generation) || Number(row.generation) < 1 || typeof row.expires_at !== 'number' || !Number.isFinite(row.expires_at)
    || typeof row.summary !== 'string' || !row.summary.trim() || new TextEncoder().encode(row.summary).length > 262144
    || typeof row.title !== 'string' || !row.title.trim() || typeof target.display_path !== 'string' || !hash(target.target_id)
    || row.decision_brief !== undefined && row.decision_brief !== null && (typeof row.decision_brief !== 'string' || new TextEncoder().encode(row.decision_brief).length > 24000)
    || ['gate_title', 'decision_heading', 'approval_effect', 'approval_effect_label'].some(key => row[key] !== undefined
      && (typeof row[key] !== 'string' || !(row[key] as string).trim() || (row[key] as string).length > 1200))
    || b.target_id !== target.target_id || typeof b.run_id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(b.run_id)
    || !['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'].includes(String(b.gate)) || !uuid(b.expected_revision_id) || !uuid(b.presentation_id)
    || !hash(b.material_version) || !hash(b.presentation_digest) || typeof b.presentation_language !== 'string'
    || !Array.isArray(b.material_sources) || !b.material_sources.length || b.material_sources.length > 12
    || !b.material_sources.every(s => object(s) && typeof s.type === 'string' && hash(s.digest) && typeof s.path === 'string'
      && s.path.startsWith(`.agdf/control/artefacts/${b.run_id}/`) && !s.path.includes('..'))
    || !(row.resource_id === null || uuid(row.resource_id)) || !(row.document_digest === null || hash(row.document_digest))
    || !Array.isArray(row.enabled_actions) || new Set(row.enabled_actions).size !== row.enabled_actions.length
    || !row.enabled_actions.every(action => ['approve', 'request_change', 'reject'].includes(String(action)))
    || !['available', 'not_qualified'].includes(String(row.capability)) || row.capability === 'not_qualified' && row.enabled_actions.length > 0
    || !(row.comparison.state === 'unavailable' && typeof row.comparison.reason === 'string'
      || row.comparison.state === 'available' && uuid(row.comparison.previous_revision_id) && hash(row.comparison.previous_digest)
        && row.comparison.current_digest === (row.source_digest ?? row.document_digest) && typeof row.comparison.unchanged === 'boolean'
        && row.comparison.unchanged === (row.comparison.previous_digest === row.comparison.current_digest)
        && typeof row.comparison.previous_text === 'string' && new TextEncoder().encode(row.comparison.previous_text).length <= 131072)
    || DECISION_CARD_LABEL_KEYS.some(key => typeof (row.labels as Record<string, unknown>)[key] !== 'string' || !(row.labels as Record<string, string>)[key].trim())) return null;
  return row as unknown as DecisionBootstrap;
}
export interface DecisionSubmission { session_id: string; operation_id: string; presentation_id: string; expected_revision_id: string;
  action: 'approve' | 'request_change' | 'reject'; comment?: string }
export function matchedDecisionReceipt(receipt: unknown, view: DecisionBootstrap, input: DecisionSubmission): boolean {
  if (!object(receipt) || receipt.operation_id !== input.operation_id || !object(receipt.effect)) return false;
  const b = object(receipt.binding) ? receipt.binding : receipt;
  const effect = receipt.effect, record = object(effect.record) ? effect.record : null;
  return b.run_id === view.binding.run_id && b.target_id === view.binding.target_id && b.expected_revision_id === view.binding.expected_revision_id
    && effect.previous_revision_id === view.binding.expected_revision_id
    && (input.action === 'approve' ? receipt.action === 'record_gate_approval' && b.gate === view.binding.gate
      && b.presentation_id === view.binding.presentation_id && effect.approval === `Approval: ${view.binding.gate}`
      && effect.presentation_digest === view.binding.presentation_digest && effect.material_version === view.binding.material_version
      : receipt.kind === 'presentation_decision.record' && record?.gate === view.binding.gate
        && record.presentation_id === view.binding.presentation_id && record.presentation_digest === view.binding.presentation_digest
        && record.material_version === view.binding.material_version && record.action === input.action && record.comment === (input.comment ?? ''));
}
