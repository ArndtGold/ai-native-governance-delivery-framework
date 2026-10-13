import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createCoreServices } from '../lib/index.js';
import { createLateSourceRevisionTestRun } from '../../cli/scripts/fixtures/late-source-revision.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { artefactFileDigest } from '../lib/control-state/run-seal.js';
import { readRunState, isInternalStepSatisfied, prepareRunContentState } from '../lib/control-evaluation/run-state.js';
import { readEvidenceBindings, appendEvidenceBinding, canonicalEvidenceDigest } from '../lib/control-state/evidence-bindings.js';
import { parseRunState } from '../lib/control-state/run-state-parser.js';
import { assertEvidenceBindingsChange } from '../lib/control-state/evidence-bindings.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-evidence-bindings-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const f = createLateSourceRevisionTestRun(root, cli), service = createCoreServices().command;
  const before = readRunState(root, { runId: f.runId });
  assert.equal(before.evidence_applicability.current.length, 0);
  assert.ok(before.evidence_applicability.applicability_unknown.length > 0);
  const candidate = f.prefix + 'CR_CANDIDATE.md';
  writeFileSync(join(root, candidate), '# Code Review\n- decision: pass\nSynthetic exact result.\n');
  const input = { schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: resolveControlCommandTarget(root).target_id, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local',
    command: { kind: 'step.record', payload: { step: 'internal', internal_step: 'CR', decision: 'pass', source: { path: candidate, digest: artefactFileDigest(root, candidate) } } } };
  const cdCandidate = f.prefix + 'CD_CANDIDATE.md';
  writeFileSync(join(root, cdCandidate), '# CD+Tests\n- decision: pass\nSynthetic exact implementation result.\n');
  const cdInput = { ...input, operation_id: randomUUID(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: 'CD+Tests', decision: 'pass', source: { path: cdCandidate, digest: artefactFileDigest(root, cdCandidate) } } } };
  const cdResult = service('agdf_record', cdInput); assert.equal(cdResult.outcome, 'accepted', JSON.stringify(cdResult));
  input.expected_revision_id = f.revision();
  const result = service('agdf_record', input); assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  const content = readFileSync(f.state, 'utf8'), state = readRunState(root, { runId: f.runId });
  const recorded = readEvidenceBindings(content).bindings.find(row => row.step === 'CR');
  assert.equal(state.evidence_applicability.by_step.get('CR').applicability, 'current');
  assert.equal(isInternalStepSatisfied(state, 'CR'), true);
  assert.equal(parseRunState(content).valid, true);
  assert.equal(recorded.sources.find(row => row.type === 'TP').digest, artefactFileDigest(root, f.prefix + 'TP.md'));
  const archived = new Map([...state.artefacts.values()].filter(row => row.path).map(row => [row.path, readFileSync(join(root, row.path), 'utf8')]));
  const cd = state.artefacts.get('CD+Tests').path;
  writeFileSync(join(root, cd), '# CD+Tests\n- decision: pass\nDifferent synthetic implementation result.\n');
  const changed = readRunState(root, { runId: f.runId });
  assert.equal(changed.evidence_applicability.by_step.get('CR').applicability, 'superseded');
  assert.equal(isInternalStepSatisfied(changed, 'CR'), false);
  assert.equal(prepareRunContentState(root, content, '', { readArtefact: name => archived.get(name) }).evidence_applicability.by_step.get('CR').applicability, 'current');
  assert.throws(() => assertEvidenceBindingsChange(content, content.replace(/## Evidence Bindings[\s\S]*$/u, '')), /EVIDENCE_BINDINGS_CHANGED/u);
  const orphan = appendEvidenceBinding(content.replace(/## Evidence Bindings[\s\S]*$/u, ''), { ...recorded, operation_id: randomUUID() });
  assert.equal(parseRunState(orphan).valid, false);
  assert.equal(canonicalEvidenceDigest('\uFEFFa\r\n'), canonicalEvidenceDigest('a\n'));
  assert.notEqual(canonicalEvidenceDigest('a'), canonicalEvidenceDigest('a\n'));
  assert.equal(readFileSync(f.state, 'utf8'), content, 'projection never rewrites registered state');
  console.log('Exact current/superseded/unknown evidence associations, immutable archive reads, writer guards and orphan rejection passed (synthetic only).');
} finally { rmSync(root, { recursive: true, force: true }); }
