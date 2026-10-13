import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createSdDefinitionTestRun, syntheticSd } from '../../cli/scripts/fixtures/sd-definition.js';
import { createCoreServices } from '../lib/index.js';
import { resolveControlCommandTarget, digest } from '../lib/control-state/approval-command-contract.js';
import { readPresentationDocument } from '../lib/control-state/run-presentation.js';
import { createControlInspectService } from '../lib/control-inspect/service.js';
import { interactionLocales } from '../lib/resources/context.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-exact-remote-document-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const f = createSdDefinitionTestRun(root, cli, 'remote-document', process.env, { typedApprovals: true });
  const original = syntheticSd() + '\n## Synthetic exact-byte appendix\n' + '🙂'.repeat(9000) + 'x'.repeat(20000);
  writeFileSync(f.file('SD.md'), original); assert.equal(f.recordSd().value.outcome, 'recorded');
  const command = createCoreServices().command;
  const input = { schema_version: '1', presentation_language: 'de', working_directory: root,
    target_source: 'explicit_target', primary_target: root, target_id: resolveControlCommandTarget(root).target_id,
    run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local',
    command: { kind: 'presentation.prepare', payload: { gate: 'SD' } } };
  const prepared = command('agdf_prepare', input); assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
  const binding = { runId: f.runId, gate: 'SD', revisionId: f.revision(), presentationId: prepared.family_result.presentation_id, targetId: input.target_id };
  let cursor, content = '', offset = 0, parts = 0;
  do {
    const page = readPresentationDocument(root, { ...binding, cursor });
    assert.equal(page.available, true, JSON.stringify(page)); assert.equal(page.byte_start, offset);
    assert.equal(Buffer.byteLength(page.content), page.byte_end - page.byte_start);
    assert.equal(page.content_digest, digest(Buffer.from(original)));
    assert.equal(page.authorizes, false); assert.equal(page.document_language, 'en'); assert.equal(page.applicability, 'current'); assert.ok(page.byte_end - page.byte_start <= 32768);
    content += page.content; offset = page.byte_end; cursor = page.next_cursor ?? undefined; ++parts;
    assert.equal(page.complete, cursor === undefined);
  } while (cursor);
  assert.ok(parts > 1); assert.equal(content, original); assert.equal(offset, Buffer.byteLength(original));
  const inspect = createControlInspectService({ env: {} });
  const readInput = { operation: 'presentation-document', presentationLanguage: 'de', workingDirectory: root,
    targetSource: 'explicit_target', primaryTarget: root, runId: f.runId, gate: 'SD', expectedRevisionId: f.revision(),
    presentationId: binding.presentationId, targetId: binding.targetId, expectedVersion: '0.14.5', interactionLocales };
  assert.equal(inspect(readInput).report.content, readPresentationDocument(root, binding).content);
  assert.equal(inspect({ ...readInput, presentationId: randomUUID() }).report.available, false);
  const before = readFileSync(f.state, 'utf8');
  const interruptedInput = { ...input, operation_id: randomUUID() };
  const interrupted = createRunCommandService({ checkpoint: point => {
    if (point === 'presentation_document_published') throw Error('synthetic_document_publication_interruption');
  } });
  assert.notEqual(interrupted('agdf_prepare', interruptedInput).outcome, 'accepted');
  const resumed = command('agdf_prepare', interruptedInput);
  assert.equal(resumed.outcome, 'accepted', JSON.stringify(resumed));
  assert.equal(command('agdf_prepare', interruptedInput).outcome, 'already_applied');
  assert.equal(readFileSync(f.state, 'utf8'), before, 'Snapshot recovery never decides a gate.');
  const alteredInput = { ...input, operation_id: randomUUID() };
  const alteredSnapshot = join(root, `.agdf/control/runs/${f.runId}/presentations/${alteredInput.operation_id}.document`);
  writeFileSync(alteredSnapshot, 'unconfirmed partial bytes');
  assert.equal(command('agdf_prepare', alteredInput).reason, 'presentation_document_invalid');
  assert.equal(readFileSync(alteredSnapshot, 'utf8'), 'unconfirmed partial bytes');
  writeFileSync(f.file('SD.md'), 'Later mutable source');
  assert.equal(readPresentationDocument(root, binding).content_digest, digest(Buffer.from(original)));
  writeFileSync(f.file('SD.md'), original);
  const snapshot = join(root, `.agdf/control/runs/${f.runId}/presentations/${binding.presentationId}.document`);
  writeFileSync(snapshot, original.replace('Synthetic', 'SynthetiX'));
  assert.equal(readPresentationDocument(root, binding).reason, 'presentation_document_digest_mismatch');
  const approve = { ...input, operation_id: randomUUID(), command: { kind: 'approval.record', payload: {
    gate: 'SD', presentation_id: binding.presentationId, response: 'Approval: SD' } } };
  assert.equal(command('agdf_approve', approve).reason, 'presentation_document_digest_mismatch');
  assert.equal(readFileSync(f.state, 'utf8'), before);
  rmSync(snapshot); symlinkSync(f.file('SD.md'), snapshot);
  assert.equal(readPresentationDocument(root, binding).reason, 'presentation_document_invalid');
  assert.equal(command('agdf_approve', { ...approve, operation_id: randomUUID() }).reason, 'presentation_document_invalid');
  assert.equal(readFileSync(f.state, 'utf8'), before);
  console.log('Bound immutable document chunks, UTF-8 boundaries, exact-byte digest, shared Inspect projection and tamper/symlink approval denial passed (synthetic only).');
} finally { rmSync(root, { recursive: true, force: true }); }
