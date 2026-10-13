import { readFileSync, existsSync } from '../control-read/fs.js';
import { join } from 'node:path';
import { readApprovalOperations } from './approval-operations.js';
import { readArtefactBindings } from './artefact-bindings.js';
import { readSourceRevisions } from './run-source-revisions.js';
import { readRunOperations } from './run-operations.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';
import { parseRunState } from './run-state-parser.js';
import { runSealState } from './run-seal.js';
import { readPendingRunStepJournal } from './run-step-transaction.js';
import { validateRunPresentationEnvelope } from './run-presentation.js';
import { digest, canonicalJson, resolveControlCommandTarget } from './approval-command-contract.js';
import { RUN_ID_PATTERN, REVISION_ID_PATTERN } from './run-identity.js';

// Lookup only. Receipts stay in their original family; no shadow ledger or recovery here.
export function inspectRunOperation(root, { runId, operationId, targetId }) {
  const result = extra => ({ schema_version: '1', run_id: runId, operation_id: operationId, authorizes: false, ...extra });
  if (!RUN_ID_PATTERN.test(runId ?? '') || !REVISION_ID_PATTERN.test(operationId ?? '') || targetId !== resolveControlCommandTarget(root).target_id) return result({ status: 'unavailable', reason: 'operation_binding_invalid' });
  const relative = `.agdf/control/runs/${runId}/RUN_STATE.md`;
  if (hasSymlinkComponent(root, relative) || containedRegularFile(root, relative).status !== 'valid') return result({ status: 'unavailable', reason: 'run_path_invalid' });
  const content = readFileSync(join(root, relative), 'utf8'), parsed = parseRunState(content, runId);
  if (!parsed.valid) return result({ status: 'unavailable', reason: 'run_state_invalid' });
  const records = [
    ...readApprovalOperations(content).receipts.map(receipt => ({ kind: 'approval.record', receipt, id: receipt.operation_id, request_digest: receipt.command_digest ?? receipt.request_digest })),
    ...readArtefactBindings(content).receipts.map(receipt => ({ kind: 'artefact.record', receipt, id: receipt.operation.id, request_digest: receipt.operation.request_digest ?? null })),
    ...readSourceRevisions(content).receipts.map(receipt => ({ kind: 'source_revision.apply', receipt, id: receipt.operation_id, request_digest: receipt.command_digest ?? receipt.request_digest })),
    ...readRunOperations(content).receipts.map(receipt => ({ kind: receipt.kind, receipt, id: receipt.operation_id, request_digest: receipt.request_digest })),
  ].filter(row => row.id === operationId);
  const pendingPath = `.agdf/control/runs/${runId}/RUN_STEP_PENDING.json`;
  let pending = null;
  if (existsSync(join(root, pendingPath))) {
    try { const journal = readPendingRunStepJournal(root, runId, { readJournal: path => readFileSync(path, "utf8") }); pending = { kind: journal.kind ?? 'legacy',
      operation_id: journal.operation_id, pending_digest: digest(canonicalJson(journal)), original_revision_id: journal.old_revision_id,
      next_revision_id: journal.next_revision_id, schema_version: journal.schema_version, matches_operation: journal.operation_id === operationId }; }
    catch { return result({ status: 'unknown', reason: 'pending_intent_unconfirmed', receipt: records[0]?.receipt ?? null }); }
  }
  if (records.length > 1) return result({ status: 'unknown', reason: 'operation_identity_ambiguous' });
  if (records.length === 1) {
    const record = records[0], seal = runSealState(root, content);
    if (seal.status !== 'valid') return result({ status: 'unknown', reason: 'current_seal_unconfirmed', receipt: record.receipt, pending });
    return result({ status: pending?.matches_operation ? 'committed_recovery_required' : 'recorded', family: record.kind,
      request_digest: record.request_digest, receipt: record.receipt, historical_effect: true, current_revision_id: parsed.meta.revision_id, pending });
  }
  if (pending) return result({ status: pending.matches_operation ? 'pending' : 'unknown', reason: pending.matches_operation ? null : 'another_pending_operation', pending, current_revision_id: parsed.meta.revision_id });
  // New immutable presentations use the original UUID as their presentation ID.
  const path = `.agdf/control/runs/${runId}/presentations/${operationId}.json`;
  if (existsSync(join(root, path))) {
    if (hasSymlinkComponent(root, path) || containedRegularFile(root, path).status !== 'valid') return result({ status: 'unknown', reason: 'presentation_path_invalid' });
    try {
      const bytes = readFileSync(join(root, path), 'utf8'); if (Buffer.byteLength(bytes) > 262144) throw Error();
      const envelope = JSON.parse(bytes), record = envelope.record;
      const checked = validateRunPresentationEnvelope(envelope, { runId, gate: record.gate, revisionId: record.revision_id, presentationId: operationId });
      if (checked.reason || record.operation_id !== operationId || !record.request_digest) throw Error();
      return result({ status: 'recorded', family: 'presentation.prepare', receipt: record, request_digest: record.request_digest,
        historical_effect: true, current_revision_id: parsed.meta.revision_id });
    } catch { return result({ status: 'unknown', reason: 'presentation_operation_unconfirmed' }); }
  }
  return result({ status: 'absent', reason: 'absence_is_not_proof_of_non_execution', current_revision_id: parsed.meta.revision_id });
}
