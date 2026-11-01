import { runDocumentPath, runHistoryPath, RUN_ID_PATTERN, REVISION_ID_PATTERN } from './run-identity.js';
import { readContainedControlText } from '../control-read/snapshot.js';
import { exactObject, digest, canonicalJson } from './approval-command-contract.js';
import { readRunOperations } from './run-operations.js';
import { artefactFileDigest } from './run-seal-compute.js';

const hash = value => typeof value === 'string' && /^sha256:[a-f0-9]{64}$/u.test(value);
const reference = (value, path) => exactObject(value, ['path', 'digest']) && value.path === path && hash(value.digest);
// The pending handoff retains its exact original effect for recovery. After
// publication, the creation receipt and immutable snapshot are the authority.
export function validPlannedOrigin(origin) {
  if (!exactObject(origin, ['schema_version', 'plan_id', 'operation_id', 'run_id', 'target_id', 'request_digest', 'raw_digest', 'planned', 'snapshot', 'initial_ur'])
    || origin.schema_version !== 1 || !RUN_ID_PATTERN.test(origin.plan_id ?? '') || !REVISION_ID_PATTERN.test(origin.operation_id ?? '')
    || origin.run_id !== `run-${origin.operation_id}` || !hash(origin.target_id) || !hash(origin.request_digest) || !hash(origin.raw_digest)) return false;
  return reference(origin.planned, `.agdf/control/planned/${origin.plan_id}/UR.md`)
    && reference(origin.snapshot, runHistoryPath(origin.run_id, 'planning/UR.md'))
    && reference(origin.initial_ur, runDocumentPath(origin.run_id, 'UR.md'))
    && origin.snapshot.digest === origin.planned.digest && origin.initial_ur.digest === origin.planned.digest;
}
export function plannedOriginFromReceipt(receipt) {
  const r = receipt.effect.record;
  return { schema_version: 1, plan_id: r.planned.plan_id, operation_id: receipt.operation_id, run_id: receipt.run_id,
    target_id: receipt.target_id, request_digest: receipt.request_digest, raw_digest: r.snapshot.raw_digest,
    planned: { path: r.planned.path, digest: r.planned.digest }, snapshot: { path: r.snapshot.path, digest: r.snapshot.digest },
    initial_ur: { path: runDocumentPath(receipt.run_id, 'UR.md'), digest: r.planned.digest } };
}
export function assertPlannedOriginImmutable(root, before, after) {
  const creation = readRunOperations(before).receipts.find(row => row.kind === 'run.create_from_planned');
  if (!creation) return;
  try {
    const next = readRunOperations(after).receipts.find(row => row.operation_id === creation.operation_id);
    const origin = plannedOriginFromReceipt(creation);
    if (canonicalJson(next) !== canonicalJson(creation) || !validPlannedOrigin(origin)
      || artefactFileDigest(root, origin.snapshot.path) !== origin.snapshot.digest
      || digest(readContainedControlText(root, origin.snapshot.path)) !== origin.raw_digest) throw Error();
  } catch { throw Error('AGDF_PLANNED_ORIGIN_IMMUTABLE'); }
}
export function validPlannedOriginHistory(root, content) {
  try { assertPlannedOriginImmutable(root, content, content); return true; } catch { return false; }
}
