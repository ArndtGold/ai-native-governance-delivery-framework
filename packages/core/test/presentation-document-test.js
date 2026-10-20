import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, readdirSync, copyFileSync } from 'node:fs';
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { tryLinkFile } from '../../../scripts/support/symlinks.js';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createSdDefinitionTestRun, syntheticSd } from '../../cli/scripts/fixtures/sd-definition.js';
import { createCoreServices } from '../lib/index.js';
import { resolveControlCommandTarget, digest } from '../lib/control-state/approval-command-contract.js';
import { readPresentationCatalog, readPresentationDocument } from '../lib/control-state/run-presentation.js';
import { createControlInspectService } from '../lib/control-inspect/service.js';
import { interactionLocales } from '../lib/resources/context.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-exact-remote-document-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const f = createSdDefinitionTestRun(root, cli, 'remote-document', process.env, { typedApprovals: true });
  const original = syntheticSd() + '\n## Synthetic exact-byte appendix\n' + '🙂'.repeat(9000) + 'x'.repeat(40000);
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
  assert.ok(parts > 2); assert.equal(content, original); assert.equal(offset, Buffer.byteLength(original));
  const inspect = createControlInspectService({ env: {} });
  const readInput = { operation: 'presentation-document', presentationLanguage: 'de', workingDirectory: root,
    targetSource: 'explicit_target', primaryTarget: root, runId: f.runId, gate: 'SD', expectedRevisionId: f.revision(),
    presentationId: binding.presentationId, targetId: binding.targetId, expectedVersion: '0.14.5', interactionLocales };
  assert.equal(inspect(readInput).report.content, readPresentationDocument(root, binding).content);
  assert.equal(inspect({ ...readInput, presentationId: randomUUID() }).report.available, false);
  const before = readFileSync(f.state, 'utf8');
  const catalogArgs = { runId: f.runId, gate: 'SD', revisionId: f.revision(), targetId: input.target_id,
    workingDirectory: root, targetSource: 'explicit_target', primaryTarget: root, language: 'de' };
  const catalog = (extra = {}) => readPresentationCatalog(root, { ...catalogArgs, ...extra });
  const unique = catalog();
  assert.equal(unique.state, 'unique', JSON.stringify(unique));
  assert.equal(unique.candidates[0].presentation_id, binding.presentationId);
  assert.equal(unique.candidates[0].prepared_status, 'prepared');
  const discovery = inspect({ ...readInput, operation: 'operation-contract', presentationId: undefined, targetId: undefined,
    contractModule: 'agdf_prepare/presentation.prepare' });
  assert.equal(discovery.report.presentation_catalog.state, 'unique', JSON.stringify(discovery));
  assert.equal(discovery.report.inspect_contract.examples.length, 3);
  assert.equal(catalog({ gate: 'QA' }).state, 'none');
  const historical = catalog({ gate: 'UR' });
  assert.equal(historical.state, 'unique');
  assert.equal(historical.candidates[0].applicability, 'historical');
  const originalBinding = historical.candidates[0].read_arguments;
  const oldDocument = readPresentationDocument(root, { runId: originalBinding.run_id, gate: originalBinding.gate, revisionId: originalBinding.expected_revision_id, presentationId: originalBinding.presentation_id, targetId: originalBinding.target_id });
  assert.equal(oldDocument.available, true); assert.equal(oldDocument.applicability, 'historical');
  assert.equal(catalog({ targetId: `sha256:${'0'.repeat(64)}` }).state, 'unavailable');
  const dir = join(root, `.agdf/control/runs/${f.runId}/presentations`);
  const originalOpenDirectory = fs.opendirSync, raceFile = join(dir, 'concurrent-observation.txt');
  try {
    fs.opendirSync = (path, ...options) => {
      const handle = originalOpenDirectory(path, ...options);
      if (path === dir) {
        // A real filesystem change after the scanner's initial snapshot. No
        // product-only test hook or substitute catalog implementation is used.
        writeFileSync(raceFile, 'created during scan');
        fs.utimesSync(dir, new Date(1000), new Date(1000));
      }
      return handle;
    };
    syncBuiltinESMExports();
    assert.equal(catalog().reason, 'presentation_catalog_changed');
  } finally {
    fs.opendirSync = originalOpenDirectory; syncBuiltinESMExports();
    rmSync(raceFile, { force: true });
  }
  assert.equal(catalog().state, 'unique', 'a changed scan never establishes uniqueness; a fresh stable scan can');
  const sourceRecord = JSON.parse(readFileSync(join(dir, `${binding.presentationId}.json`), 'utf8'));
  const clones = [];
  const clone = () => {
    const id = randomUUID(), record = { ...sourceRecord.record, presentation_id: id };
    delete record.operation_id; delete record.request_digest;
    writeFileSync(join(dir, `${id}.json`), JSON.stringify({ record, digest: digest(JSON.stringify(record)) }));
    copyFileSync(join(dir, `${binding.presentationId}.document`), join(dir, `${id}.document`));
    clones.push(id); return id;
  };
  const cleanClones = () => { for (const id of clones.splice(0)) for (const ext of ['json', 'document']) rmSync(join(dir, `${id}.${ext}`), { force: true }); };
  for (let i = 0; i < 16; ++i) clone();
  const first = catalog(); assert.equal(first.state, 'ambiguous'); assert.equal(first.candidates.length, 16);
  assert.equal(first.total_candidates, 17); assert.equal(first.page_complete, false);
  const second = catalog({ cursor: first.next_cursor });
  assert.equal(second.candidates.length, 1); assert.equal(second.state, 'ambiguous'); assert.equal(second.next_cursor, null);
  assert.equal(new Set([...first.candidates, ...second.candidates].map(c => c.presentation_id)).size, 17);
  assert.equal(catalog({ gate: 'PRD', cursor: first.next_cursor }).state, 'unavailable');
  assert.equal(catalog({ cursor: readPresentationDocument(root, binding).next_cursor }).state, 'unavailable');
  assert.equal(readPresentationDocument(root, { ...binding, cursor: first.next_cursor }).available, false);
  clone(); assert.equal(catalog({ cursor: first.next_cursor }).reason, 'presentation_catalog_cursor_invalid');
  cleanClones();
  const corrupt = clone();
  writeFileSync(join(dir, `${corrupt}.json`), '{}'); assert.equal(catalog().state, 'unavailable'); cleanClones();
  const missing = clone(); rmSync(join(dir, `${missing}.document`)); assert.equal(catalog().state, 'unavailable'); cleanClones();
  const foreign = clone();
  const envelope = JSON.parse(readFileSync(join(dir, `${foreign}.json`)));
  envelope.record.run_id = 'foreign-run'; envelope.digest = digest(JSON.stringify(envelope.record));
  writeFileSync(join(dir, `${foreign}.json`), JSON.stringify(envelope)); assert.equal(catalog().state, 'unavailable'); cleanClones();
  const noncanonical = clone(), noncanonicalPath = join(dir, `${noncanonical}.json`);
  const unsupported = JSON.parse(readFileSync(noncanonicalPath));
  unsupported.record.revision_id = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA';
  unsupported.digest = digest(JSON.stringify(unsupported.record));
  writeFileSync(noncanonicalPath, JSON.stringify(unsupported));
  assert.equal(catalog().state, 'unavailable', 'catalog must not advertise IDs rejected by the public MCP schema'); cleanClones();
  const linked = clone(); rmSync(join(dir, `${linked}.json`));
  if (tryLinkFile(join(dir, `${binding.presentationId}.json`), join(dir, `${linked}.json`), 'catalog-record')) assert.equal(catalog().state, 'unavailable');
  cleanClones();
  const initialRecords = readdirSync(dir).filter(name => name.endsWith('.json')).length;
  for (let i = initialRecords; i < 256; ++i) clone();
  assert.equal(catalog().state, 'ambiguous', 'exact record bound remains available');
  clone(); assert.equal(catalog().state, 'unavailable'); cleanClones();
  const baseBytes = readdirSync(dir).filter(name => name.endsWith('.json')).reduce((n, name) => n + Buffer.byteLength(readFileSync(join(dir, name))), 0);
  for (let i = 0; i < 4; ++i) {
    const id = clone(), file = join(dir, `${id}.json`);
    writeFileSync(file, readFileSync(file, 'utf8').padEnd(i === 3 ? 1048576 - baseBytes - 3 * 262144 : 262144, ' '));
  }
  assert.equal(catalog().state, 'ambiguous', 'exact byte bound remains available');
  const lastFile = join(dir, `${clones.at(-1)}.json`);
  writeFileSync(lastFile, readFileSync(lastFile, 'utf8') + ' ');
  assert.equal(catalog().reason, 'presentation_catalog_byte_limit'); cleanClones();
  const ignored = [];
  for (let i = readdirSync(dir).length; i < 1024; ++i) { const file = join(dir, `ignored-${i}.txt`); writeFileSync(file, ''); ignored.push(file); }
  assert.equal(catalog().state, 'unique', 'exact directory entry bound remains available');
  const overflow = join(dir, 'entry-overflow.txt'); writeFileSync(overflow, '');
  assert.equal(catalog().reason, 'presentation_catalog_directory_limit');
  for (const file of [...ignored, overflow]) rmSync(file);
  assert.equal(catalog().state, 'unique');
  assert.equal(readFileSync(f.state, 'utf8'), before, 'catalog never writes control state');
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
  rmSync(snapshot);
  if (tryLinkFile(f.file('SD.md'), snapshot, 'presentation-document')) {
    assert.equal(readPresentationDocument(root, binding).reason, 'presentation_document_invalid');
    assert.equal(command('agdf_approve', { ...approve, operation_id: randomUUID() }).reason, 'presentation_document_invalid');
    assert.equal(readFileSync(f.state, 'utf8'), before);
  }
  console.log('Bound immutable document chunks, UTF-8 boundaries, exact-byte digest, shared Inspect projection and tamper/symlink approval denial passed (synthetic only).');
} finally { rmSync(root, { recursive: true, force: true }); }
