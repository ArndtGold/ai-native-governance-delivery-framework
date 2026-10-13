import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readRunOperations } from './run-operations.js';
import { readApprovalOperations } from './approval-operations.js';
import { readArtefactBindings } from './artefact-bindings.js';
import { readSourceRevisions } from './run-source-revisions.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';
import { REVISION_ID_PATTERN } from './run-identity.js';
import { validateRunPresentationEnvelope } from './run-presentation.js';

// Called under the existing selected Run lock. This is identity reservation only;
// the original family alone validates payload, eligibility, receipt and replay.
export function assertRunOperationIdentity(root, run, operationId, family) {
  if (!REVISION_ID_PATTERN.test(operationId ?? '')) throw Error('AGDF_OPERATION_BINDING_INVALID');
  const receipts = [
    ...readRunOperations(run.content).receipts.map(r => [r.operation_id, r.kind]),
    ...readApprovalOperations(run.content).receipts.map(r => [r.operation_id, 'approval.record']),
    ...readArtefactBindings(run.content).receipts.map(r => [r.operation.id, 'artefact.record']),
    ...readSourceRevisions(run.content).receipts.map(r => [r.operation_id, 'source_revision.apply']),
  ].filter(([id]) => id === operationId);
  if (receipts.length > 1 || receipts.some(([, kind]) => kind !== family)) throw Error('AGDF_OPERATION_PAYLOAD_CONFLICT');
  const path = `.agdf/control/runs/${run.meta.run_id}/presentations/${operationId}.json`;
  if (!existsSync(join(root, path))) return;
  if (hasSymlinkComponent(root, path) || containedRegularFile(root, path).status !== 'valid') throw Error('AGDF_OPERATION_IDENTITY_UNCONFIRMED');
  const bytes = readFileSync(join(root, path)); if (bytes.length > 262144) throw Error('AGDF_OPERATION_IDENTITY_UNCONFIRMED');
  let envelope; try { envelope = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { throw Error('AGDF_OPERATION_IDENTITY_UNCONFIRMED'); }
  const r = envelope.record;
  const check = validateRunPresentationEnvelope(envelope, { runId: run.meta.run_id, gate: r?.gate, revisionId: r?.revision_id, presentationId: operationId });
  if (check.reason) throw Error('AGDF_OPERATION_IDENTITY_UNCONFIRMED');
  if (r.operation_id === operationId && (family !== 'presentation.prepare' || receipts.length)) throw Error('AGDF_OPERATION_PAYLOAD_CONFLICT');
}
