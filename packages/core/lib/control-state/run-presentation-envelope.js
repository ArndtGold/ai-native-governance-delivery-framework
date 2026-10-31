import { resolutionRecord } from './input-resolution.js';
// Immutable envelope validation is shared by live and archived proofs.
import { digest as hash, exactObject, DIGEST_PATTERN } from "./approval-command-contract.js";
import { validPreviewSnapshot } from "./preview-snapshot.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const recovery = "Run run-present for the current run/gate/revision, show its exact presentation, then wait for a NEW deliberate user response. Never bind an earlier reply retroactively.";

export { UUID as PRESENTATION_ID_PATTERN, recovery as PRESENTATION_RECOVERY };

// Rechecks the immutable presentation envelope without evaluating a Run hidden by its
// own pending journal. Full policy/binding validation must precede transaction intent.
// Pure record check is also consumed inside captured read-only observations.
export function validateRunPresentationEnvelope(envelope, { runId, gate, revisionId, presentationId }) {
  const { record: storedRecord, digest } = envelope ?? {};
  const record = resolutionRecord(storedRecord);
  if (!record || ![1, 2, 3, 4, 5, 6].includes(record.schema_version) || record.presentation_id !== presentationId
      || record.run_id !== runId || record.gate !== gate || record.revision_id !== revisionId
      || digest !== hash(JSON.stringify(storedRecord)) || !Number.isFinite(Date.parse(record.created_at))) {
    return { reason: "presentation_binding_invalid", recovery };
  }
  if (record.schema_version === 2 && (!exactObject(envelope, ['record', 'digest'])
    || !exactObject(record, ['schema_version', 'presentation_id', 'operation_id', 'request_digest', 'created_at', 'run_id', 'gate', 'revision_id', 'content_digest', 'artefact_digest', 'summary_digest', 'presentation_language', 'presentation_digest'])
    || record.operation_id !== presentationId || !UUID.test(record.operation_id) || !DIGEST_PATTERN.test(record.request_digest ?? ''))) return { reason: 'presentation_binding_invalid', recovery };
  if ([3, 4, 5, 6].includes(record.schema_version) && (!exactObject(envelope, ['record', 'digest'])
    || !exactObject(record, ['schema_version', 'presentation_id', ...(record.operation_id ? ['operation_id', 'request_digest'] : []),
      'created_at', 'run_id', 'gate', 'revision_id', 'content_digest', 'artefact_digest', 'summary_digest', 'presentation_language',
      'presentation_digest', 'document_digest', 'document_bytes', 'document_language', ...(record.schema_version === 4 || record.schema_version === 6 && record.qa_acceptance ? ['qa_acceptance'] : []), ...(record.schema_version === 5 || record.schema_version === 6 && record.preview_review ? ['preview_review'] : [])])
    || record.operation_id && (record.operation_id !== presentationId || !UUID.test(record.operation_id) || !DIGEST_PATTERN.test(record.request_digest ?? ''))
    || !/^[a-z]{2}(?:-[A-Za-z0-9]{2,8})*$/u.test(record.document_language ?? '')
    || !DIGEST_PATTERN.test(record.document_digest ?? '') || !Number.isInteger(record.document_bytes)
    || record.document_bytes < 1 || record.document_bytes > 131072)) return { reason: 'presentation_binding_invalid', recovery };
  if ((record.schema_version === 4 || record.schema_version === 6 && record.qa_acceptance) && (gate !== 'QA' || !exactObject(record.qa_acceptance, ['kind', 'digest'])
    || record.qa_acceptance.kind !== 'accepted_with_deviations' || !DIGEST_PATTERN.test(record.qa_acceptance.digest ?? ''))) return { reason: 'presentation_binding_invalid', recovery };
  if ((record.schema_version === 5 || record.schema_version === 6 && record.preview_review) && (gate !== 'PRD' || !validPreviewSnapshot(record.preview_review, runId, presentationId))) return { reason: 'presentation_binding_invalid', recovery };
  if (record.schema_version === 6 && record.presentation_digest !== record.document_digest) return { reason: 'presentation_binding_invalid', recovery };
  return { presentationId, digest, record: storedRecord };
}

