import assert from 'node:assert/strict';
import { spawnSync, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRun } from '#agdf-core/control-state/run-state-repository.js';
import { resolveControlCommandTarget } from '#agdf-core/control-state/approval-command-contract.js';
import { artefactFileDigest } from '#agdf-core/control-state/run-seal.js';
import { readApprovalOperations } from '#agdf-core/control-state/approval-operations.js';
import { clarifiedUr } from '../../core/test/planned-fixtures.js';
import { treeBytes } from '../../core/test/control-cockpit-fixtures.js';
const temporary = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-intake-e2e-')));
try {
  const generated = resolve(import.meta.dirname, '../generated');
  for (const entry of ['plugins/agdf', '.agents/plugins/marketplace.json']) cpSync(join(generated, entry), join(temporary, entry), { recursive: true });
  const plugin = join(temporary, 'plugins/agdf'), validator = join(plugin, 'runtime/agdf-local.js'), root = join(temporary, 'project');
  mkdirSync(root); assert.equal(spawnSync('git', ['init', '-q', root]).status, 0);
  const env = { ...process.env, AGDF_SURFACE: 'codex', PLUGIN_ROOT: plugin }; delete env.AGDF_RUN_ID;
  const call = (...args) => {
    const result = spawnSync(process.execPath, [validator, ...args], { encoding: 'utf8', env }); assert.ifError(result.error);
    let value; try { value = JSON.parse(result.stdout); } catch {}
    return { code: result.status, value, text: result.stdout + result.stderr };
  };
  const invoke = (...args) => { const result = call(...args); assert.equal(result.code, 0, result.text); return result.value; };
  const initialized = spawnSync(process.execPath, [resolve(import.meta.dirname, '../bin/create-agdf.js'), 'init', '--dir', root, '--language', 'en', '--json'], { encoding: 'utf8' });
  assert.equal(initialized.status, 0, initialized.stdout + initialized.stderr);
  const dispatch = (...args) => call('skill-dispatch', '--json', '--skill', 'gate-check', '--surface', 'codex', '--language', 'de',
    '--working-directory', root, '--target-source', 'explicit_target', '--primary-target', root, ...args).value;
  assert.equal(dispatch('--intake').continuation.phase, 'resolve_delivery_run');
  for (const id of ['foreign-a', 'foreign-b']) createRun(root, id);
  const foreign = ['foreign-a', 'foreign-b'].map(id => readFileSync(join(root, '.agdf/control/runs', id, 'RUN_STATE.md')));
  let before = treeBytes(root), selected = dispatch('--intake');
  assert.deepEqual(selected.continuation.candidate_runs.map(row => row.run_id).sort(), ['foreign-a', 'foreign-b']);
  assert.equal(selected.control, null); assert.deepEqual(treeBytes(root), before);
  assert.equal(dispatch().control.blocking_reason, 'AGDF_ACTIVE_RUN_AMBIGUOUS');
  const operation = randomUUID(), runId = `run-${operation}`;
  const planned = dispatch('--intake', '--intake-mode', 'new', '--run', runId);
  assert.equal(planned.continuation.phase, 'run_missing', JSON.stringify(planned));
  assert.deepEqual(planned.continuation.steps[0].argv, ['run-create', '--dir', root, '--title', runId, '--operation', operation]);
  assert.deepEqual(treeBytes(root), before);
  const createArgs = ['run-create', '--dir', root, '--title', runId, '--operation', operation, '--json'];
  const created = invoke(...createArgs); assert.equal(created.outcome, 'accepted'); assert.equal(created.binding.run_id, runId);
  assert.equal(invoke(...createArgs).outcome, 'already_applied');
  const statePath = join(root, '.agdf/control/runs', runId, 'RUN_STATE.md');
  const revision = () => readFileSync(statePath, 'utf8').match(/^- revision_id: (.+)$/mu)[1];
  const resume = (...args) => dispatch('--intake', '--intake-mode', 'resume', '--run', runId, ...args);
  assert.equal(resume().continuation.phase, 'ur_definition');
  for (const args of [['--intake-mode', 'new'], ['--continue-delivery'], ['--intake', '--run', runId, '--continue-delivery']]) assert.equal(dispatch(...args).outcome, 'invalid_input');
  env.AGDF_RUN_ID = 'foreign-a'; assert.equal(dispatch('--intake').continuation.phase, 'resolve_delivery_run'); delete env.AGDF_RUN_ID;
  const incoming = join(root, 'incoming-UR.md');
  const text = clarifiedUr + '\n## AGDF Approval Summary (de; source=en)\n- Problem: Ein persönlicher Filter muss erneut aufgebaut werden.\n- Ziel: Den eigenen Filter speichern und wiederherstellen.\n- Umfang: Ein Filter ohne Teilen oder Berechtigungsänderung.\n';
  writeFileSync(incoming, text);
  const recorded = invoke('run-step', '--dir', root, '--run', runId, '--revision', revision(), '--step', 'ur', '--title', 'Bound intake', '--evidence', incoming, '--json');
  assert.equal(recorded.outcome, 'accepted'); assert.equal(resume().continuation.phase, 'presentation_required');
  const old = revision(), revise = rev => resume('--revision', rev, '--ur-action', 'revise');
  assert.equal(revise(old).continuation.draft_registered, true);
  const commandPath = join(root, 'replace-input.json'), replacement = `.agdf/control/runs/${runId}/evidence/incoming-UR.md`;
  mkdirSync(join(root, `.agdf/control/runs/${runId}/evidence`), { recursive: true }); writeFileSync(join(root, replacement), text.replace('persönlicher Filter', 'eigener benannter Filter'));
  writeFileSync(commandPath, JSON.stringify({ schema_version: '1', presentation_language: 'de', working_directory: root,
    primary_target: root, target_source: 'explicit_target', target_id: resolveControlCommandTarget(root).target_id,
    run_id: runId, expected_revision_id: old, operation_id: randomUUID(), assurance: 'cooperative_local',
    command: { kind: 'ur_draft.replace', payload: { title: 'Revised bound intake', source: { path: replacement, digest: artefactFileDigest(root, replacement) } } } }));
  assert.equal(invoke('agdf-revise', '--command-file', commandPath, '--json').outcome, 'accepted');
  assert.equal(revise(old).continuation.reason, 'stale_assignment');
  const prepared = invoke('run-present', '--dir', root, '--run', runId, '--revision', revision(), '--gate', 'UR', '--language', 'de', '--json');
  assert.equal(prepared.outcome, 'accepted'); const presentation = prepared.family_result.presentation_id;
  const canonical = join(root, '.agdf/control/runs', runId, 'documents/UR.md'), bytes = readFileSync(canonical);
  writeFileSync(canonical, bytes + '\nUnregistered change.\n'); assert.equal(resume().terminal, true); writeFileSync(canonical, bytes);
  const envelope = join(root, '.agdf/control/runs', runId, 'control/presentations', presentation + '.json'), original = readFileSync(envelope);
  writeFileSync(envelope, '{}'); const damaged = readFileSync(statePath);
  const rejected = call('run-approve', '--dir', root, '--run', runId, '--revision', revision(), '--gate', 'UR', '--presentation', presentation, '--response', 'Approval: UR', '--json');
  assert.notEqual(rejected.code, 0); assert.deepEqual(readFileSync(statePath), damaged); writeFileSync(envelope, original);
  if (process.platform !== 'win32') {
    const outside = join(temporary, 'foreign-envelope.json'); writeFileSync(outside, original); unlinkSync(envelope); symlinkSync(outside, envelope);
    const denied = call('run-approve', '--dir', root, '--run', runId, '--revision', revision(), '--gate', 'UR', '--presentation', presentation, '--response', 'Approval: UR', '--json');
    assert.notEqual(denied.code, 0); assert.deepEqual(readFileSync(outside), original); unlinkSync(envelope); writeFileSync(envelope, original);
  }
  const approveArgs = ['run-approve', '--dir', root, '--run', runId, '--revision', revision(), '--gate', 'UR', '--presentation', presentation,
    '--response', 'Approval: UR', '--operation', randomUUID(), '--language', 'de', '--json'];
  const concurrent = () => new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [validator, ...approveArgs], { env }); let output = '', error = '';
    child.stdout.on('data', chunk => { output += chunk; }); child.stderr.on('data', chunk => { error += chunk; }); child.on('error', reject);
    child.on('close', code => resolveResult({ code, output, error }));
  });
  // Reap both writers before assertions and fixture cleanup, including when one
  // fails. A first rejection must not race deletion against the other writer.
  const completed = await Promise.all([concurrent(), concurrent()]);
  const replies = completed.map(({ code, output, error }) => {
    const value = JSON.parse(output);
    const locked = value.reason === 'run_write_locked' && value.family_result?.outcome === 'retryable_failure';
    assert.equal(code, locked ? 2 : 0, error + output);
    assert.ok(locked || ['accepted', 'already_applied'].includes(value.outcome), output);
    return value;
  });
  assert.equal(replies.filter(row => row.outcome === 'accepted').length, 1);
  assert.equal(invoke(...approveArgs).outcome, 'already_applied');
  assert.equal(readApprovalOperations(readFileSync(statePath, 'utf8')).receipts.length, 1);
  assert.equal(resume().control.current_gate, 'Brownfield Review');
  for (const [i, id] of ['foreign-a', 'foreign-b'].entries()) assert.deepEqual(readFileSync(join(root, '.agdf/control/runs', id, 'RUN_STATE.md')), foreign[i]);
  console.log('Shipped current intake: explicit UUID creation/replay, scope assignment, bounded UR replacement, presentation tamper/symlink refusal and actual two-process approval replay passed.');
} finally { rmSync(temporary, { recursive: true, force: true }); }
