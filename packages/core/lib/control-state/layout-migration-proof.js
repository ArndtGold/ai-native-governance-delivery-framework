import { readContainedControlText, READ_LIMITS } from '../control-read/snapshot.js';
import { digest, exactObject, DIGEST_PATTERN } from './approval-command-contract.js';
import { scalarFields, sectionTableRows } from './run-state-document.js';
import { appendRunOperation, readRunOperations } from './run-operations.js';
import { upsertTableRow } from './run-state-edits.js';
import { canonicalRunText, approvalSeal } from './run-seal-compute.js';
import { LAYOUT_HISTORY_TYPE, validLayoutMigrationRecord } from './layout-migration-record.js';
import { isSafeControlRelativePath } from './contained-file.js';

export function layoutMigrationCandidate(content, receipt) {
  const next = canonicalRunText(content).replace(/^- control_state_version: 2$/mu, '- control_state_version: 3');
  const registered = upsertTableRow(next, 'Artefacts', 0, LAYOUT_HISTORY_TYPE, [LAYOUT_HISTORY_TYPE, receipt.effect.record.archive.path, 'done']);
  if (!registered) throw Error('AGDF_LAYOUT_MIGRATION_STATE_INVALID');
  return appendRunOperation(registered, receipt);
}

export function validLayoutSourceManifest(value) {
  return exactObject(value, ['schema_version', 'policy_version', 'sources']) && value.schema_version === 1 && value.policy_version === 1
    && Array.isArray(value.sources) && value.sources.length > 0 && value.sources.length <= 20000
    && new Set(value.sources.map(row => row?.path)).size === value.sources.length
    && new Set(value.sources.map(row => row?.snapshot_name)).size === value.sources.length
    && value.sources.every(row => exactObject(row, ['path', 'digest', 'snapshot_name']) && typeof row.path === 'string'
      && (row.path.startsWith('.agdf/control/') && isSafeControlRelativePath(row.path) || row.path === '@plugin/control/templates/artefacts/UR.md')
      && DIGEST_PATTERN.test(row.digest)
      && /^(?:OLD-[0-9]+\.bin|UR\.template\.md)$/u.test(row.snapshot_name));
}

function history(root, receipt) {
  const record = receipt.effect.record;
  if (!validLayoutMigrationRecord(record, receipt.run_id)) throw Error('AGDF_LAYOUT_MIGRATION_HISTORY_INVALID');
  const old = readContainedControlText(root, record.archive.path, READ_LIMITS.file);
  const source = readContainedControlText(root, record.source_snapshot.path, READ_LIMITS.file);
  const manifest = JSON.parse(source), fields = scalarFields(old);
  if (digest(old) !== record.archive.digest || digest(source) !== record.source_snapshot.digest || !validLayoutSourceManifest(manifest)
    || !manifest.sources.some(row => row.path === `.agdf/control/runs/${receipt.run_id}/RUN_STATE.md` && row.digest === record.archive.digest)
    || fields.duplicates.length || fields.values.get('control_state_version') !== '2' || fields.values.get('run_id') !== receipt.run_id
    || fields.values.get('revision_id') !== receipt.expected_revision_id || fields.values.get('approval_seal') !== approvalSeal(old))
    throw Error('AGDF_LAYOUT_MIGRATION_HISTORY_INVALID');
  return old;
}

export function assertLayoutMigrationEffect(root, before, candidate, receipt) {
  if (history(root, receipt) !== before || candidate !== layoutMigrationCandidate(before, receipt)) throw Error('AGDF_LAYOUT_MIGRATION_EFFECT_INVALID');
}

export function validLayoutMigrationHistories(root, content) {
  const operations = readRunOperations(content);
  // Preserve legacy seal classification; the parser separately rejects malformed
  // operation sections. Only this new kind adds a new historical proof obligation.
  if (!operations.valid) return true;
  try {
    for (const receipt of operations.receipts.filter(row => row.kind === 'control_layout.migrate')) {
      history(root, receipt);
      const rows = sectionTableRows(content, 'Artefacts').filter(row => row[0] === LAYOUT_HISTORY_TYPE);
      if (rows.length !== 1 || rows[0][1] !== receipt.effect.record.archive.path || rows[0][2] !== 'done') return false;
    }
    return true;
  } catch { return false; }
}
