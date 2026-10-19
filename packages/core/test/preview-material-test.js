import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { previewFixture } from './fixtures/preview-review.js';
import { inspectPreviewReview, previewRequirement, validatePreviewDescriptor, PREVIEW_LIMITS } from '../lib/control-state/preview-review.js';
import { canonicalJson, digest } from '../lib/control-state/approval-command-contract.js';
import { tryLinkFile } from '../../../scripts/support/symlinks.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-preview-material-'));
try {
  const f = previewFixture(root), inspect = (descriptor = f.descriptor, urContent = f.urContent) => inspectPreviewReview(root, { runId: 'preview-test', urContent, prdContent: f.prd(descriptor) });
  assert.equal(previewRequirement(f.urContent), true);
  assert.equal(previewRequirement('# UR\n\n## Example\nPreview requirement: before_prd_interactive'), false);
  assert.equal(previewRequirement('# UR\n```\nPreview requirement: before_prd_interactive\n```'), false);
  for (const field of ['', 'unknown', 'none\nPreview requirement: before_prd_interactive']) assert.throws(() => previewRequirement('# UR\nPreview requirement: ' + field), /preview_requirement_invalid/);
  const valid = inspect(); assert.equal(valid.files.length, 4); assert.ok(valid.html.includes('Content-Security-Policy'));
  assert.equal(inspectPreviewReview(root, { runId: 'preview-test', urContent: '# legacy', prdContent: '# legacy' }), null);
  assert.throws(() => inspectPreviewReview(root, { runId: 'preview-test', urContent: f.urContent, prdContent: '# no descriptor' }), /preview_descriptor_missing/);
  for (const mutate of [d => d.source_ur_digest = 'sha256:' + '0'.repeat(64), d => d.entry = '../outside', d => d.version = 'wrong', d => d.criterion_ids = ['UNKNOWN'],
    d => d.files[0].path = '.agdf/control/artefacts/foreign/previews/review-v1/index.html', d => d.files[0].path += '%2f..',
    d => d.files.push(d.files[0]), d => d.files[0].bytes = 131073, d => d.files[0].path = 'C:\\outside.html', d => d.extra = true]) {
    const row = structuredClone(f.descriptor); mutate(row); assert.throws(() => inspect(row), /preview_/);
  }
  const duplicate = f.prd().replace('"version": "review-v1"', '"version": "ignored", "version": "review-v1"');
  assert.throws(() => inspectPreviewReview(root, { runId: 'preview-test', urContent: f.urContent, prdContent: duplicate }), /preview_descriptor_duplicate_key/);
  assert.throws(() => inspectPreviewReview(root, { runId: 'preview-test', urContent: f.urContent, prdContent: f.prd() + '\n## Preview Review\n' }), /preview_descriptor_invalid/);
  const asset = f.descriptor.files.find(file => file.path.endsWith('main.js')), path = join(root, asset.path), original = readFileSync(path);
  writeFileSync(path, 'changed'); assert.throws(() => inspect(), /preview_file_changed/);
  rmSync(path); assert.throws(() => inspect(), /preview_file_unavailable/);
  if (tryLinkFile(join(root, 'outside.js'), path, 'preview-material')) {
    writeFileSync(join(root, 'outside.js'), original); assert.throws(() => inspect(), /preview_path_unsafe/); rmSync(path);
  }
  writeFileSync(path, original); assert.equal(inspect().rendered_digest, valid.rendered_digest);
  const boundary = structuredClone(f.descriptor), base = boundary.entry.slice(0, -10);
  boundary.files = Array.from({length: 32}, (_, i) => ({ path: base + (i === 0 ? 'index.html' : `z${String(i).padStart(2,'0')}.png`),
    digest: digest('x'), bytes: 1, media_type: i === 0 ? 'text/html' : 'image/png' }));
  assert.ok(validatePreviewDescriptor(boundary, 'preview-test'));
  boundary.files.push({...boundary.files.at(-1),path:base+'zz.png'}); assert.throws(()=>validatePreviewDescriptor(boundary,'preview-test'),/preview_/); boundary.files.pop();
  boundary.files = boundary.files.slice(0,8).map(row=>({...row,bytes:PREVIEW_LIMITS.file}));
  assert.ok(validatePreviewDescriptor(boundary,'preview-test')); // Exactly 1 MiB, each exactly 128 KiB.
  boundary.files.push({...boundary.files.at(-1),path:base+'zz.png',bytes:1}); assert.throws(()=>validatePreviewDescriptor(boundary,'preview-test'),/preview_file_limit/); boundary.files.pop();
  boundary.files[0].bytes++; assert.throws(()=>validatePreviewDescriptor(boundary,'preview-test'),/preview_file_binding_invalid/); boundary.files[0].bytes--;
  boundary.open_questions = Array(16).fill('x'.repeat(700));
  const remaining = PREVIEW_LIMITS.descriptor - Buffer.byteLength(canonicalJson(boundary));
  for(let left=remaining,i=0;left>0;i++){const n=Math.min(1200-boundary.open_questions[i].length,left);boundary.open_questions[i]+='x'.repeat(n);left-=n;}
  assert.equal(Buffer.byteLength(canonicalJson(boundary)),PREVIEW_LIMITS.descriptor); assert.ok(validatePreviewDescriptor(boundary,'preview-test'));
  boundary.open_questions[15]+='x'; assert.throws(()=>validatePreviewDescriptor(boundary,'preview-test'),/preview_descriptor_limit/);
  console.log('SCN-023: descriptor bytes, file count, per-file and total raw-byte exact boundaries passed.');
  console.log('SCN-001/006/007: real preview requirement/descriptor/source/file and containment checks passed.');
} finally { rmSync(root, { recursive: true, force: true }); }
