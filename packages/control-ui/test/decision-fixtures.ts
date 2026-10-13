import registry from '../../../plugins/agdf/meta/agdf-interaction-locales.json';
import type { DecisionBootstrap, DecisionSubmission } from '../src/mcp/decision-bootstrap';
export function decisionView(locale: 'en' | 'de' = 'en'): DecisionBootstrap {
  const id = '11111111-1111-4111-8111-111111111111', hash = 'sha256:' + 'a'.repeat(64);
  return { schema_version: '1', session_id: id, read_session_id: '22222222-2222-4222-8222-222222222222',
    owner_epoch: '33333333-3333-4333-8333-333333333333', generation: 1, expires_at: Date.now() + 60_000,
    target: { target_id: hash, display_path: '/synthetic' }, title: 'Synthetic decision fixture', labels: registry.locales[locale].decisionCard,
    binding: { target_id: hash, run_id: 'synthetic-run', gate: 'SD', expected_revision_id: id, presentation_id: id,
      presentation_digest: hash, material_version: hash, presentation_language: locale,
      material_sources: [{ type: 'SD', path: '.agdf/control/artefacts/synthetic-run/SD.md', digest: hash }] },
    summary: '# Presented summary\n\nFull intended change.\n\n## Open points\n\nNo applicable open issue.\n\n<script>never execute</script>\n',
    snapshot_id: id, resource_id: id, document_digest: hash,
    enabled_actions: ['approve', 'request_change', 'reject'], capability: 'available',
    comparison: { state: 'unavailable', reason: 'no_verified_prior_applicable_version' } };
}
// Synthetic UI data. These fixtures are never evidence of native host mediation.
export function decisionReceipt(view: DecisionBootstrap, input: DecisionSubmission) {
  const b = view.binding, effect = { previous_revision_id: b.expected_revision_id, presentation_digest: b.presentation_digest,
    material_version: b.material_version };
  return input.action === 'approve'
    ? { action: 'record_gate_approval', operation_id: input.operation_id, binding: b, effect: { ...effect, approval: `Approval: ${b.gate}` } }
    : { kind: 'presentation_decision.record', operation_id: input.operation_id, ...b, effect: { previous_revision_id: b.expected_revision_id,
      record: { ...effect, gate: b.gate, presentation_id: b.presentation_id, action: input.action, comment: input.comment ?? '' } } };
}
