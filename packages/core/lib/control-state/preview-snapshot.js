import { closeSync, constants, fsyncSync, openSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { canonicalJson, digest, exactObject, DIGEST_PATTERN } from './approval-command-contract.js';
import { PREVIEW_LIMITS, previewError, readPreviewBytes, validatePreviewDescriptor } from './preview-review.js';
import { canonicalRunText } from './run-text.js';
import { readFileSync, statSync } from '../control-read/fs.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';

const prefix = (runId, id) => `.agdf/control/runs/${runId}/presentations/${id}`;
export function previewSnapshotBinding(preview, runId, id) {
  const start = prefix(runId, id), bytes = Buffer.from(preview.html);
  const chunks = [];
  for (let offset = 0; offset < bytes.length; offset += PREVIEW_LIMITS.chunk) {
    const data = bytes.subarray(offset, offset + PREVIEW_LIMITS.chunk);
    chunks.push({ snapshot: `${start}.preview-${chunks.length}`, bytes: data.length, digest: digest(data) });
  }
  return { descriptor: preview.descriptor, descriptor_digest: preview.descriptor_digest, renderer_policy: 1,
    rendered_digest: preview.rendered_digest, rendered_bytes: preview.rendered_bytes,
    files: preview.files.map((file, index) => ({ ...preview.descriptor.files[index], snapshot: `${start}.preview-file-${index}` })), chunks };
}

export function validPreviewSnapshot(row, runId, id) {
  try {
    if (!exactObject(row, ['descriptor', 'descriptor_digest', 'renderer_policy', 'rendered_digest', 'rendered_bytes', 'files', 'chunks'])
      || row.renderer_policy !== 1 || row.descriptor_digest !== digest(canonicalJson(row.descriptor))
      || !DIGEST_PATTERN.test(row.rendered_digest ?? '') || !Number.isSafeInteger(row.rendered_bytes)
      || row.rendered_bytes < 1 || row.rendered_bytes > PREVIEW_LIMITS.rendered) return false;
    validatePreviewDescriptor(row.descriptor, runId);
    const start = prefix(runId, id);
    if (!Array.isArray(row.files) || row.files.length !== row.descriptor.files.length
      || row.files.some((file, index) => !exactObject(file, ['path', 'digest', 'bytes', 'media_type', 'snapshot'])
        || file.snapshot !== `${start}.preview-file-${index}`
        || canonicalJson(Object.fromEntries(Object.entries(file).filter(([key]) => key !== 'snapshot'))) !== canonicalJson(row.descriptor.files[index]))) return false;
    if (!Array.isArray(row.chunks) || !row.chunks.length || row.chunks.length > 16
      || row.chunks.some((chunk, index) => !exactObject(chunk, ['snapshot', 'bytes', 'digest']) || chunk.snapshot !== `${start}.preview-${index}`
        || !Number.isSafeInteger(chunk.bytes) || chunk.bytes < 1 || chunk.bytes > PREVIEW_LIMITS.chunk || !DIGEST_PATTERN.test(chunk.digest ?? '')
        || index < row.chunks.length - 1 && chunk.bytes !== PREVIEW_LIMITS.chunk)
      || row.chunks.reduce((total, chunk) => total + chunk.bytes, 0) !== row.rendered_bytes) return false;
    return true;
  } catch { return false; }
}

export function publishPreviewSnapshot(root, record, preview, { resume = false, checkpoint = () => {} } = {}) {
  const binding = record.preview_review;
  if (!binding) return;
  const html = Buffer.from(preview.html);
  const outputs = [...binding.files.map((file, i) => ({ ...file, data: preview.files[i].data })),
    ...binding.chunks.map((chunk, i) => ({ ...chunk, data: html.subarray(i * PREVIEW_LIMITS.chunk, i * PREVIEW_LIMITS.chunk + chunk.bytes) })),
    { snapshot: prefix(record.run_id, record.presentation_id) + '.preview.html', digest: binding.rendered_digest, bytes: html.length, data: html }];
  for (const output of outputs) {
    let fd;
    try { fd = openSync(join(root, output.snapshot), constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | (constants.O_NOFOLLOW ?? 0), 0o600); }
    catch (error) {
      if (error.code !== 'EEXIST' || !resume) throw error;
      const old = output.snapshot.endsWith('.html') ? readStandalone(root, record) : readPreviewBytes(root, output.snapshot);
      if (old.length !== output.bytes || digest(old) !== output.digest) previewError('snapshot_invalid');
      continue;
    }
    try { writeFileSync(fd, output.data); fsyncSync(fd); } finally { closeSync(fd); }
    checkpoint('presentation_preview_file_published');
  }
}

export function readPreviewSnapshot(root, record, { readBytes = path => readPreviewBytes(root, path), current = false } = {}) {
  const row = record.preview_review;
  if (!([5, 6].includes(record.schema_version) && record.preview_review) || !validPreviewSnapshot(row, record.run_id, record.presentation_id)) previewError('snapshot_invalid');
  for (const file of row.files) {
    const bytes = readBytes(file.snapshot);
    if (!bytes || bytes.length !== file.bytes || digest(bytes) !== file.digest) previewError('snapshot_changed');
    if (current) { const live = readBytes(file.path); if (!live || live.length !== file.bytes || digest(live) !== file.digest) previewError('file_changed'); }
  }
  const chunks = row.chunks.map(chunk => {
    const bytes = readBytes(chunk.snapshot);
    if (!bytes || bytes.length !== chunk.bytes || digest(bytes) !== chunk.digest) previewError('snapshot_changed');
    return bytes;
  });
  const bytes = Buffer.concat(chunks);
  if (bytes.length !== row.rendered_bytes || digest(bytes) !== row.rendered_digest) previewError('snapshot_changed');
  return bytes;
}

export function validateCurrentPreviewRecord(root, record) {
  if (!([5, 6].includes(record.schema_version) && record.preview_review)) return;
  readPreviewSnapshot(root, record, { current: true });
  readStandalone(root, record);
  const base = `.agdf/control/artefacts/${record.run_id}/`;
  if (digest(readPreviewBytes(root, base + 'PRD.md')) !== (record.schema_version === 6 ? record.artefact_digest : record.document_digest)
    || digest(canonicalRunText(readPreviewBytes(root, base + 'UR.md').toString('utf8'))) !== record.preview_review.descriptor.source_ur_digest) previewError('source_changed');
}

// A checked full-document access copy. The immutable chunk set remains the
// historical authority; archives reconstruct it without this derived cache.
function readStandalone(root, record) {
  const path = prefix(record.run_id, record.presentation_id) + '.preview.html', file = containedRegularFile(root, path);
  if (hasSymlinkComponent(root, path) || file.status !== 'valid' || statSync(file.path).size !== record.preview_review.rendered_bytes) previewError('standalone_unavailable');
  const bytes = readFileSync(file.path);
  if (bytes.length > PREVIEW_LIMITS.rendered || digest(bytes) !== record.preview_review.rendered_digest) previewError('standalone_changed');
  return bytes;
}

// Proof readers may be archive-bound. Never repair history with live filesystem bytes.
export function previewProof(record, { rawFileDigest, fileDigest }) {
  const row = record.preview_review;
  if (!validPreviewSnapshot(row, record.run_id, record.presentation_id)) return false;
  if (row.files.some(file => rawFileDigest(file.snapshot) !== file.digest || rawFileDigest(file.path) !== file.digest)
    || row.chunks.some(chunk => rawFileDigest(chunk.snapshot) !== chunk.digest)) return false;
  return fileDigest(`.agdf/control/artefacts/${record.run_id}/UR.md`) === row.descriptor.source_ur_digest;
}
