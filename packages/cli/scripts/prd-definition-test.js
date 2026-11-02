import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, symlinkSync, unlinkSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createPrdDefinitionTestRun, syntheticPrd } from './fixtures/prd-definition.js';
import { artefactFileDigest } from '#agdf-core/control-state/run-seal.js';
import { resolveControlCommandTarget } from '#agdf-core/control-state/approval-command-contract.js';
import { treeBytes } from '../../core/test/control-cockpit-fixtures.js';
const temporary = mkdtempSync(join(tmpdir(), 'agdf-prd-definition-'));
try {
  const generated = resolve(import.meta.dirname, '../generated');
  for (const entry of ['plugins/agdf', '.agents/plugins/marketplace.json']) cpSync(join(generated, entry), join(temporary, entry), { recursive: true });
  const plugin = join(temporary, 'plugins/agdf'), validator = join(plugin, 'runtime/agdf-local.js'), root = join(temporary, 'project');
  mkdirSync(root); execFileSync('git', ['init', '-q', root]);
  execFileSync(process.execPath, [resolve(import.meta.dirname, '../bin/create-agdf.js'), 'init', '--dir', root, '--language', 'en']);
  const env = { ...process.env, PLUGIN_ROOT: plugin, AGDF_SURFACE: 'codex' }; delete env.AGDF_RUN_ID;
  const f = createPrdDefinitionTestRun(root, validator, 'prd-authoring-test', env);
  const dispatch = (selected = f, ...args) => {
    const before = treeBytes(root), result = spawnSync(process.execPath, [validator, 'skill-dispatch', '--json', '--skill', 'gate-check', '--surface', 'codex', '--language', 'de',
      '--working-directory', root, '--target-source', 'explicit_target', '--primary-target', root, '--run', selected.runId, ...args], { env, encoding: 'utf8' });
    assert.ifError(result.error); const value = JSON.parse(result.stdout); assert.deepEqual(treeBytes(root), before); return value;
  };
  const initial = dispatch(f, '--continue-delivery');
  assert.equal(initial.continuation.phase, 'prd_definition'); assert.equal(initial.continuation.draft_registered, false);
  assert.equal(initial.continuation.artifact_language, 'en'); assert.equal(initial.continuation.presentation_language, 'de');
  assert.equal(initial.continuation.sources[0].type, 'UR');
  assert.deepEqual(initial.continuation.runtime_contracts.map(row => row.module), ['prd-definition', 'gate-artifact-preparation']);
  for (const extra of [['--prd-action', 'revise'], ['--intake', '--intake-mode', 'resume', '--prd-action', 'revise'], ['--intake', '--intake-mode', 'new', '--revision', f.revision(), '--prd-action', 'revise']])
    assert.equal(dispatch(f, ...extra).outcome, 'invalid_input');
  assert.equal(dispatch(f, '--intake', '--intake-mode', 'resume', '--revision', randomUUID(), '--prd-action', 'revise').continuation.reason, 'stale_assignment');
  const canonicalUr = f.canonicalFile('UR.md'), originalUr = readFileSync(canonicalUr);
  writeFileSync(canonicalUr, originalUr + '\nUnknown approved-source change.\n'); assert.equal(dispatch(f, '--continue-delivery').terminal, true); writeFileSync(canonicalUr, originalUr);
  if (process.platform !== 'win32') {
    const outside = join(temporary, 'outside.md'); writeFileSync(outside, 'foreign'); symlinkSync(outside, f.canonicalFile('PRD.md'));
    assert.equal(dispatch(f, '--continue-delivery').terminal, true); assert.equal(readFileSync(outside, 'utf8'), 'foreign'); unlinkSync(f.canonicalFile('PRD.md'));
  }
  writeFileSync(f.file('PRD.md'), syntheticPrd(true)); assert.equal(f.record().value.outcome, 'accepted');
  assert.equal(dispatch(f, '--continue-delivery').continuation.phase, 'prd_definition');
  assert.notEqual(f.present('PRD', 'de').value.outcome, 'accepted');
  const incompleteRevision = f.revision(); writeFileSync(f.file('PRD.md'), syntheticPrd()); assert.equal(f.record(true).value.outcome, 'accepted');
  assert.notEqual(f.revision(), incompleteRevision); assert.equal(dispatch(f, '--continue-delivery').continuation.phase, 'presentation_required');
  const prepared = f.present('PRD', 'de'); assert.equal(prepared.value.outcome, 'accepted'); assert.match(prepared.value.family_result.text, /AC-001/);
  const oldRevision = f.revision(); writeFileSync(f.file('PRD.md'), syntheticPrd().replace('Synthetic saved filter', 'Revised synthetic saved filter'));
  assert.equal(f.record(true).value.outcome, 'accepted');
  assert.notEqual(f.approve('PRD', prepared.value.family_result.presentation_id, oldRevision).value.outcome, 'accepted');
  assert.notEqual(f.approve('PRD', prepared.value.family_result.presentation_id).value.outcome, 'accepted');
  const readyText = syntheticPrd();
  for (const [text, reason] of [[readyText.replace('- Ziel:', '- Ziel und Umfang:'), 'approval_summary_user_goal_missing'],
    [readyText.replace('- Entscheidungen:', '- Entscheidungskontext:'), 'approval_summary_decisions_missing']]) {
    writeFileSync(f.file('PRD.md'), text); assert.equal(f.record(true).value.outcome, 'accepted');
    const blocked = dispatch(f, '--continue-delivery'); assert.equal(blocked.continuation.phase, 'prd_definition'); assert.match(blocked.continuation.instruction, new RegExp(reason));
    const revision = f.revision(); dispatch(f, '--continue-delivery'); assert.equal(f.revision(), revision, 'Diagnosis does not record progress');
  }
  writeFileSync(f.file('PRD.md'), readyText); assert.equal(f.record(true).value.outcome, 'accepted');
  const fresh = f.present('PRD', 'de'); assert.equal(fresh.value.outcome, 'accepted');
  assert.notEqual(f.approve('PRD', fresh.value.family_result.presentation_id, f.revision(), 'ok').value.outcome, 'accepted');
  assert.equal(f.approve('PRD', fresh.value.family_result.presentation_id).value.outcome, 'accepted');
  const approved = treeBytes(root); assert.equal(f.record(true).value.outcome, 'rejected'); assert.deepEqual(treeBytes(root), approved);
  assert.equal(dispatch(f, '--continue-delivery').continuation.phase, 'sd_definition');

  // Required UX input is a separate synthetic pre-PRD path, never a hand edit
  // to an approved binding, an Artefacts row or a generic reseal/update command.
  const ux = createPrdDefinitionTestRun(root, validator, 'prd-required-ux', env, { uxRequired: true });
  assert.equal(dispatch(ux, '--continue-delivery').continuation.skill_id, 'ux-intent-definition');
  const path = ux.canonicalFile('UX_INTENT_DEFINITION.md');
  for (const text of ['# UX\nDecision: ready\n', '- decision: ready\n- decision: blocked\n']) {
    writeFileSync(path, text); const result = dispatch(ux, '--continue-delivery'); assert.equal(result.diagnostics[0].code, 'ux_decision_malformed');
  }
  writeFileSync(path, '# UX\n- decision: ready\n');
  assert.equal(dispatch(ux, '--continue-delivery').diagnostics[0].code, 'ux_source_unrecorded');
  const incoming = ux.prefix + 'UX_INCOMING.md'; writeFileSync(join(root, incoming), '# UX Intent Definition\n- decision: ready\nSynthetic analytical source under the retained approved UR.\n');
  const commandPath = join(root, 'ux-record-command.json'); writeFileSync(commandPath, JSON.stringify({ schema_version: '1', presentation_language: 'de', working_directory: root,
    primary_target: root, target_source: 'explicit_target', target_id: resolveControlCommandTarget(root).target_id,
    run_id: ux.runId, expected_revision_id: ux.revision(), operation_id: randomUUID(), assurance: 'cooperative_local',
    command: { kind: 'step.record', payload: { step: 'internal', internal_step: 'UX Intent Definition', decision: 'ready', source: { path: incoming, digest: artefactFileDigest(root, incoming) } } } }));
  const registration = spawnSync(process.execPath, [validator, 'agdf-record', '--command-file', commandPath, '--json'], { env, encoding: 'utf8' });
  assert.equal(registration.status, 0, registration.stdout + registration.stderr); assert.equal(JSON.parse(registration.stdout).outcome, 'accepted');
  assert.equal(dispatch(ux, '--continue-delivery').continuation.sources[2].type, 'UX Intent Definition');
  if (process.env.AGDF_PRD_TEST_LOG) writeFileSync(process.env.AGDF_PRD_TEST_LOG, JSON.stringify({ lane: 'synthetic deterministic packaged runtime', log: f.log }, null, 2));
  console.log('Current packaged PRD authoring: bound sources/UX, readiness, summary correction, stale decisions, exact approval and immutable upstream sources passed.');
} finally { rmSync(temporary, { recursive: true, force: true }); }
