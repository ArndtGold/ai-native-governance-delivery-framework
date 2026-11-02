import { resolutionRecord } from './input-resolution.js';
import { digest as hash, exactObject, DIGEST_PATTERN } from './approval-command-contract.js';
import { validPreviewSnapshot } from './preview-snapshot.js';
import { REVISION_ID_PATTERN } from './run-identity.js';
export const PRESENTATION_RECORD_VERSION = 7;
export { REVISION_ID_PATTERN as PRESENTATION_ID_PATTERN } from './run-identity.js';
export const PRESENTATION_RECOVERY = 'Run run-present for the current run/gate/revision, show its exact presentation, then wait for a NEW deliberate user response. Never bind an earlier reply retroactively.';
export function validateRunPresentationEnvelope(envelope, { runId, gate, revisionId, presentationId }) {
  const invalid = () => ({ reason: 'presentation_binding_invalid', recovery: PRESENTATION_RECOVERY });
  const record = resolutionRecord(envelope?.record);
  if (!record || !exactObject(envelope, ['record', 'digest']) || record.schema_version !== PRESENTATION_RECORD_VERSION
    || !exactObject(record, ['schema_version', 'presentation_id', 'operation_id', 'request_digest', 'created_at', 'run_id', 'gate', 'revision_id',
      'content_digest', 'artefact_digest', 'summary_digest', 'presentation_language', 'presentation_digest',
      'document_digest', 'document_bytes', 'document_language', ...(record.qa_acceptance ? ['qa_acceptance'] : []), ...(record.preview_review ? ['preview_review'] : [])])
    || record.presentation_id !== presentationId || record.operation_id !== presentationId || !REVISION_ID_PATTERN.test(presentationId ?? '')
    || record.run_id !== runId || record.gate !== gate || record.revision_id !== revisionId
    || ![record.request_digest, record.content_digest, record.summary_digest, record.presentation_digest, record.document_digest].every(value => DIGEST_PATTERN.test(value ?? ''))
    || !DIGEST_PATTERN.test(record.artefact_digest ?? '')
    || envelope.digest !== hash(JSON.stringify(envelope.record)) || !Number.isFinite(Date.parse(record.created_at))
    || !/^[a-z]{2}(?:-[A-Za-z0-9]{2,8})*$/u.test(record.document_language ?? '')
    || typeof record.presentation_language !== 'string' || !record.presentation_language
    || !Number.isInteger(record.document_bytes) || record.document_bytes < 1 || record.document_bytes > 131072
    || record.presentation_digest !== record.document_digest) return invalid();
  if (record.qa_acceptance && (gate !== 'QA' || !exactObject(record.qa_acceptance, ['kind', 'digest'])
    || record.qa_acceptance.kind !== 'accepted_with_deviations' || !DIGEST_PATTERN.test(record.qa_acceptance.digest ?? ''))) return invalid();
  if (record.preview_review && (gate !== 'PRD' || !validPreviewSnapshot(record.preview_review, runId, presentationId))) return invalid();
  return { presentationId, digest: envelope.digest, record: envelope.record };
}
