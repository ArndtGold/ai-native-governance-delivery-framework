import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, symlinkSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { withTpFixture, syntheticTp } from './fixtures/tp-definition.js';

withTpFixture(f => {
  const initial = f.bound('--continue-delivery');
  assert.equal(initial.continuation?.phase, 'tp_definition', JSON.stringify(initial));
  assert.deepEqual(initial.continuation.sources.map(s => s.type), ['PRD', 'SD', 'Brownfield Review']);
  assert.deepEqual(initial.continuation.runtime_contracts.map(c => c.module), ['tp-definition', 'gate-artifact-preparation', 'quality']);
  const quality = initial.continuation.runtime_contracts.find(c => c.module === 'quality');
  const canonicalQuality = readFileSync(new URL('../../../plugins/agdf/meta/contracts/quality.md', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
  assert.equal(quality.content, canonicalQuality, 'bound TP receives the canonical shared policy');
  assert.equal(quality.sha256, createHash('sha256').update(canonicalQuality).digest('hex'));
  const qualityPath = join(f.plugin, 'runtime/create-agdf/generated/plugins/agdf/meta/contracts/quality.md');
  const qualityBytes = readFileSync(qualityPath);
  unlinkSync(qualityPath);
  try {
    const before = f.bytes();
    const missing = spawnSync(process.execPath, [join(f.plugin, 'runtime/agdf-local.js'), 'skill-dispatch', '--json', '--skill', 'gate-check', '--surface', 'codex',
      '--language', 'de', '--working-directory', f.root, '--target-source', 'explicit_target', '--primary-target', f.root,
      '--run', f.runId, '--continue-delivery'], { env: f.env, encoding: 'utf8' });
    assert.equal(missing.error, undefined);
    assert.ok(Number.isInteger(missing.status) && missing.status !== 0, 'missing packaged quality refuses startup before authoring');
    assert.match(missing.stderr, /quality\.md|runtime|integrity/iu);
    assert.equal(f.bytes(), before, 'early missing-resource refusal preserves fixture state');
  } finally { writeFileSync(qualityPath, qualityBytes); }
  assert.equal(f.bound('--continue-delivery').continuation.runtime_contracts.find(c => c.module === 'quality').content, canonicalQuality);

  const sharedContract = initial.continuation.runtime_contracts.find(c => c.module === 'gate-artifact-preparation');
  const packagedReadiness = sharedContract.content.match(/packaged as\n`([^`]+)`/u)?.[1];
  assert.ok(packagedReadiness && existsSync(join(f.plugin, packagedReadiness)),
    'the returned shared contract must resolve its declared read-only Core fallback in the actual plugin package');
  assert.equal(initial.control.next_operation.skill_id, 'tp-definition');
  f.env.AGDF_RUN_ID = f.runId;
  assert.equal(f.dispatch('tp-definition').continuation.phase, 'resolve_delivery_run'); delete f.env.AGDF_RUN_ID;
  assert.equal(f.dispatch('tp-definition', '--run', f.runId).continuation.phase, 'tp_definition');
  assert.notEqual(f.bound().continuation?.phase, 'tp_definition', 'status never drafts');
  assert.equal(f.dispatch('tp-definition', '--run', 'missing-tp-run').terminal, true);
  const foreignId = 'foreign-tp-stage'; assert.equal(f.call('run-create', '--run', foreignId).code, 0);
  const foreignState = join(f.root, `.agdf/control/runs/${foreignId}/RUN_STATE.md`), foreignBytes = readFileSync(foreignState);
  assert.equal(f.dispatch('tp-definition', '--run', foreignId).terminal, true, 'wrong stage never falls through to generic TP authoring');
  assert.deepEqual(readFileSync(foreignState), foreignBytes);
  const template = initial.continuation.template_path, templateBytes = readFileSync(template);
  unlinkSync(template);
  try { assert.equal(f.bound('--continue-delivery').terminal, true, 'missing installed template never falls back to repository scaffold'); }
  finally { writeFileSync(template, templateBytes); }
  if (process.platform !== 'win32') {
    const externalTemplate = join(f.temporary, 'external-template.md'); writeFileSync(externalTemplate, 'untouched');
    unlinkSync(template); symlinkSync(externalTemplate, template);
    try {
      assert.equal(f.bound('--continue-delivery').terminal, true, 'unsafe installed template fails closed');
      assert.equal(readFileSync(externalTemplate, 'utf8'), 'untouched');
    } finally { unlinkSync(template); writeFileSync(template, templateBytes); }
  }
  const valid = ['--intake', '--intake-mode', 'resume', '--revision', f.revision(), '--tp-action', 'revise'];
  for (const args of [['--tp-action', 'revise'], [...valid, '--sd-action', 'revise'], [...valid, '--prd-action', 'revise'], [...valid, '--ur-action', 'revise'],
    [...valid, '--continue-delivery'], [...valid.slice(0, -1), 'approve']]) assert.equal(f.bound(...args).outcome, 'invalid_input', args.join(' '));
  assert.equal(f.bound('--intake', '--intake-mode', 'resume', '--revision', randomUUID(), '--tp-action', 'revise').continuation.reason, 'stale_assignment');
  const sourceBytes = readFileSync(f.file('SD.md'));
  writeFileSync(f.file('SD.md'), sourceBytes + '\nUnapproved source tamper.\n'); { const blocked = f.bound('--continue-delivery'); assert.equal(blocked.terminal, true, JSON.stringify(blocked)); } writeFileSync(f.file('SD.md'), sourceBytes);
  if (process.platform !== 'win32') {
    const outside = join(f.temporary, 'outside.md'); writeFileSync(outside, 'untouched'); symlinkSync(outside, f.file('TP.md'));
    assert.equal(f.bound('--continue-delivery').terminal, true); assert.equal(readFileSync(outside, 'utf8'), 'untouched'); unlinkSync(f.file('TP.md'));
  }
  writeFileSync(f.file('TP.md'), syntheticTp()); assert.equal(f.recordTp().value.outcome, 'recorded');
  assert.equal(f.bound('--continue-delivery').continuation.phase, 'presentation_required');
  assert.notEqual(f.dispatch('tp-definition', '--run', f.runId).continuation?.phase, 'tp_definition', 'direct selection cannot rewrite a ready draft');
  const old = f.present('TP', 'de'); assert.equal(old.value.outcome, 'prepared');
  assert.equal(f.revise().continuation.phase, 'tp_definition');
  writeFileSync(f.file('TP.md'), syntheticTp().replace('Saved filter verification', 'Explicitly revised plan'));
  assert.equal(f.recordTp(true).value.outcome, 'recorded');
  assert.notEqual(f.run('run-approve', '--revision', f.revision(), '--gate', 'TP', '--presentation', old.value.presentation_id, '--response', 'Approval: TP').value.outcome, 'approved');
  writeFileSync(f.file('TP.md'), syntheticTp().replace('| resolved |', '| open |')); assert.equal(f.recordTp(true).value.outcome, 'recorded');
  assert.equal(f.bound('--continue-delivery').continuation.phase, 'tp_definition');
  assert.equal(f.present('TP', 'de').value.outcome, 'rejected');
  assert.equal(f.run('run-approve', '--revision', f.revision(), '--gate', 'TP', '--response', 'Approval: TP').value.outcome, 'rejected');
  writeFileSync(f.file('TP.md'), syntheticTp()); assert.equal(f.recordTp(true).value.outcome, 'recorded');
  assert.equal(f.recordTp(true, input => { input.source.digest = 'sha256:' + '0'.repeat(64); }).value.outcome, 'rejected');
  const current = f.present('TP', 'de'); assert.equal(f.approve('TP', current.value.presentation_id).value.outcome, 'approved');
  assert.equal(f.revise().terminal, true); assert.equal(f.dispatch('tp-definition', '--run', f.runId).terminal, true);
  assert.equal(f.recordTp(true).value.outcome, 'rejected'); assert.deepEqual(readFileSync(f.file('SD.md')), sourceBytes);
});
console.log('TP assembled assignment, ready-draft/revision, protected-source, recording and approval boundaries passed.');
