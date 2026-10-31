import { exactObject, DIGEST_PATTERN } from './approval-command-contract.js';

export const LAYOUT_HISTORY_TYPE = 'Control Layout History';
export function validLayoutMigrationRecord(record, runId) {
  return exactObject(record, ['from_version', 'to_version', 'layout', 'archive', 'source_snapshot'])
    && record.from_version === 2 && record.to_version === 3 && record.layout === 'planned-urs-v1'
    && exactObject(record.archive, ['path', 'digest'])
    && record.archive.path === `.agdf/control/artefacts/${runId}/CONTROL_LAYOUT_V2.md` && DIGEST_PATTERN.test(record.archive.digest)
    && exactObject(record.source_snapshot, ['path', 'digest']) && DIGEST_PATTERN.test(record.source_snapshot.digest)
    && record.source_snapshot.path === `.agdf/control/maintenance/planned-layout/${record.source_snapshot.digest.slice(7)}/SOURCE_MANIFEST.json`;
}
