import { runDocumentPath, runEvidencePath } from './run-identity.js';
import { join, dirname } from 'node:path';
import { existsSync, lstatSync, readFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { exactObject } from './approval-command-contract.js';
import { hasSymlinkComponent } from './contained-file.js';
import { atomicWrite, fsyncDirectory } from './run-state-writer.js';

export const INTERNAL_STEP_FILES = Object.freeze({
  'Brownfield Review': 'BROWNFIELD_REVIEW.md', 'UX Intent Definition': 'UX_INTENT_DEFINITION.md',
  'Brownfield Analysis': 'BROWNFIELD_ANALYSIS.md', 'CD+Tests': 'CD_TESTS.md', 'TP Review': 'TP_REVIEW.md',
  'Clean Implementation Review': 'CLEAN_IMPLEMENTATION_REVIEW.md', CR: 'CODE_REVIEW.md',
});
const documentNames = new Set(['UR.md', 'OR.md', 'PRD.md', 'SD.md', 'TP.md', 'QA_REPORT.md', 'VERIFIED_CHANGE.md', ...Object.values(INTERNAL_STEP_FILES)]);
function allowedPath(runId, path) {
  const documents = `${runDocumentPath(runId, '')}/`, evidence = `${runEvidencePath(runId, '')}/`;
  return typeof path === 'string' && (path.startsWith(documents) && documentNames.has(path.slice(documents.length))
    || path.startsWith(evidence) && /^EVIDENCE-[0-9a-f]{64}\.(?:md|json)$/u.test(path.slice(evidence.length)));
}
export const outputBytesDigest = text => text === null ? null : 'sha256:' + createHash('sha256').update(text, 'utf8').digest('hex');
export function ownedOutputPath(root, runId, path) {
  if (!allowedPath(runId, path) || hasSymlinkComponent(root, path)) throw Error('AGDF_RUN_STEP_RECOVERY_REQUIRED');
  return join(root, path);
}
export function ownedOutputText(root, runId, path) {
  const file = ownedOutputPath(root, runId, path);
  if (!existsSync(file)) return null;
  const stat = lstatSync(file); if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 131072) throw Error('AGDF_RUN_STEP_RECOVERY_REQUIRED');
  return new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(file));
}
export function validOwnedOutputs(runId, outputs) {
  return Array.isArray(outputs) && outputs.length <= 1 && new Set(outputs.map(row => row?.path)).size === outputs.length
    && outputs.every(row => exactObject(row, ['path', 'old', 'next', 'old_digest', 'next_digest'])
      && allowedPath(runId, row.path)
      && (row.old === null || typeof row.old === 'string') && typeof row.next === 'string'
      && Buffer.byteLength(row.next) <= 131072 && (row.old === null || Buffer.byteLength(row.old) <= 131072)
      && row.old_digest === outputBytesDigest(row.old) && row.next_digest === outputBytesDigest(row.next));
}
export function prepareOwnedOutput(root, runId, path, next) {
  const old = ownedOutputText(root, runId, path), row = { path, old, next, old_digest: outputBytesDigest(old), next_digest: outputBytesDigest(next) };
  if (!validOwnedOutputs(runId, [row])) throw Error('AGDF_RUN_STEP_RECOVERY_REQUIRED'); return row;
}
export function publishOwnedOutputs(root, journal, checkpoint) {
  if (journal.outputs.length) {
    for (const relative of [...new Set(journal.outputs.map(row => row.path.slice(0, row.path.lastIndexOf('/'))))]) {
      const directory = join(root, relative);
      if (hasSymlinkComponent(root, relative)) throw Error('AGDF_RUN_STEP_RECOVERY_REQUIRED');
      if (!existsSync(directory)) { mkdirSync(directory, { mode: 0o700 }); fsyncDirectory(dirname(directory)); }
      if (!lstatSync(directory).isDirectory() || lstatSync(directory).isSymbolicLink()) throw Error('AGDF_RUN_STEP_RECOVERY_REQUIRED');
    }
  }
  for (const row of journal.outputs) {
    if (ownedOutputText(root, journal.run_id, row.path) !== row.old) throw Error('AGDF_RUN_STEP_RECOVERY_REQUIRED');
    atomicWrite(ownedOutputPath(root, journal.run_id, row.path), row.next, { checkpoint: stage => checkpoint(`output_${stage}`) });
    checkpoint('output');
  }
}
export function recoverOwnedOutputs(root, journal, committed) {
  for (const row of journal.outputs) {
    const text = ownedOutputText(root, journal.run_id, row.path);
    if (committed) { if (text !== row.next) throw Error('AGDF_RUN_STEP_RECOVERY_REQUIRED'); }
    else {
      if (text !== row.old && text !== row.next) throw Error('AGDF_RUN_STEP_RECOVERY_REQUIRED');
      if (text !== row.old) {
        const file = ownedOutputPath(root, journal.run_id, row.path);
        if (row.old === null) { unlinkSync(file); fsyncDirectory(dirname(file)); }
        else atomicWrite(file, row.old);
      }
    }
  }
}
