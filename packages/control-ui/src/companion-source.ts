import type { Detail, Resource } from './types';
import { observedAssessment } from './presentation';

function sourceFor(data: Detail, blocked: boolean, waiting: boolean) {
  if (waiting) {
    if (data.evaluation?.current_gate === 'UAT') {
      const presentation = data.companion?.uat_presentation;
      return presentation ? { resourceId: presentation.resource_id, digest: presentation.content_digest } : null;
    }
    const draft = data.document_states?.find(row => row.type === data.evaluation?.current_gate && row.version_kind === 'draft'
      && row.source_state === 'available' && row.run_id === data.run_id && row.revision_id === data.revision_id);
    if (draft?.content_digest) return { resourceId: draft.resource_id, digest: draft.content_digest };
  }
  if (blocked && data.companion?.finding) {
    const finding = data.companion.finding;
    return { resourceId: finding.resource_id, digest: finding.content_digest };
  }
  const report = data.companion?.closeout_report;
  if (!waiting && report) return { resourceId: report.resource_id, digest: report.content_digest };
  return null;
}

export function companionDecision(data: Detail, current: boolean) {
  const assessment = observedAssessment(data, current);
  const evaluation = data.evaluation;
  const gate = evaluation?.current_gate;
  // The reader's assessment blocks delivery until approval; the same Core report
  // can identify that as a ready human decision rather than a delivery problem.
  const waiting = !!gate && assessment !== 'unconfirmed' && evaluation?.status === 'open'
    && evaluation.blocking_reason === 'none' && evaluation.missing_approval === `Approval: ${gate}`;
  const human = waiting || assessment === 'open' && (evaluation?.next_operation?.actor === 'human' || data.figure?.reason?.key === 'waitingDecision');
  return { assessment, waiting, human };
}

export type CompanionSource = { resource: Resource; digest: string; decision: string | null; key: string };
export function sourceKey(target: string, resource: Resource, digest: string) {
  return JSON.stringify([target, resource.run_id, resource.type, resource.registered_reference, digest]);
}
export function companionSource(data: Detail, target: string, current: boolean): CompanionSource | null {
  const { assessment, waiting } = companionDecision(data, current);
  if (!current || assessment === 'unconfirmed') return null;
  const source = sourceFor(data, assessment === 'blocked' && !waiting, waiting);
  const resource = data.resources.find(r => r.resource_id === source?.resourceId && r.status === 'registered' && r.run_id === data.run_id);
  if (!resource || !source) return null;
  return { resource, digest: source.digest, key: sourceKey(target, resource, source.digest),
    decision: waiting && data.companion?.decision_material_version
      ? JSON.stringify([target, data.run_id, data.evaluation?.current_gate, data.companion.decision_material_version]) : null };
}

// Resolve a remembered version only against the latest registered source set.
export function resolveSource(data: Detail, target: string, key: string): CompanionSource | null {
  const offered = companionSource(data, target, true);
  if (offered?.key === key) return offered;
  for (const row of data.document_states ?? []) {
    const resource = data.resources.find(r => r.resource_id === row.resource_id && r.status === 'registered' && r.run_id === data.run_id);
    if (resource && row.source_state === 'available' && row.revision_id === data.revision_id && row.content_digest
      && sourceKey(target, resource, row.content_digest) === key) return { resource, digest: row.content_digest, key, decision: null };
  }
  return null;
}
