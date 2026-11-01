import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { sealRunState, runSealState, artefactFileDigest } from '../lib/control-state/run-seal.js';
import { withRunLock, writeRunLocked, writeRunRecoveryLocked, unapproveRecoveryApprovals } from '../lib/control-state/run-state-writer.js';
import { parseRunState } from '../lib/control-state/run-state-parser.js';
import { previewRunClosure, applyRunClosure } from '../lib/control-state/run-closure.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { correctRunRelationship } from '../lib/control-state/run-relationship-correction.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';

// Synthetic isolated repository only; no real run of this repository is read or written.
const root = mkdtempSync(join(tmpdir(), 'agdf-lifecycle-guard-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);

  // SCN-012 writer level: a sealed Run whose current lifecycle is ended is never written again.
  for (const outcome of ['superseded', 'abandoned']) {
    const path = createRun(root, `writer-${outcome}`);
    const ended = sealRunState(root, readFileSync(path, 'utf8').replace(/^- lifecycle: active$/mu, `- lifecycle: ${outcome}`));
    writeFileSync(path, ended);
    assert.equal(runSealState(root, ended).status, 'valid');
    const { meta } = parseRunState(ended), before = readFileSync(path);
    assert.throws(() => withRunLock(path, () => writeRunLocked(path, ended.replace('- decision: in_progress', '- decision: continued'), meta.revision_id,
      { expectedContent: ended, allowContentChange: true })), /AGDF_RUN_LIFECYCLE_ENDED/u, `writeRunLocked must refuse a ${outcome} Run`);
    assert.deepEqual(readFileSync(path), before, `${outcome} Run bytes stay identical after a refused write`);
    assert.throws(() => withRunLock(path, () => writeRunRecoveryLocked(path, unapproveRecoveryApprovals(ended), { expectedContent: ended,
      expectedRevisionId: meta.revision_id, nextRevisionId: '00000000-0000-4000-8000-000000000001' })), /AGDF_RUN_LIFECYCLE_ENDED/u, `writeRunRecoveryLocked must refuse a ${outcome} Run`);
    assert.deepEqual(readFileSync(path), before);
  }

  // Runs closed through the closure itself, one per outcome, plus active and completed neighbours.
  for (const id of ['old-work', 'dropped-work', 'new-work', 'still-active']) createRun(root, id);
  const backlogPath = join(root, '.agdf', 'control', 'MASTER_BACKLOG.md');
  const legacyBacklog = '# Preserved legacy planning\n\nDropped work reference.\n';
  writeFileSync(backlogPath, legacyBacklog);
  const statePath = id => join(root, '.agdf', 'control', 'runs', id, 'RUN_STATE.md');
  const revision = id => parseRunState(readFileSync(statePath(id), 'utf8'), id).meta.revision_id;
  const preview = previewRunClosure(root, { entries: [{ run_id: 'old-work', outcome: 'superseded', reason: 'Replaced by new work', successor_run: 'new-work' },
    { run_id: 'dropped-work', outcome: 'abandoned', reason: 'No longer wanted' }] });
  const closed = applyRunClosure(root, { previewId: preview.preview_id, confirmation: preview.confirmation_phrase }, { readIdentity: () => ({ statement: 'unknown' }) });
  assert.deepEqual(closed.results.map(row => row.result), ['closed', 'closed']);
  const prefix = id => `.agdf/control/artefacts/${id}/`;
  for (const id of ['old-work', 'dropped-work']) { mkdirSync(join(root, prefix(id)), { recursive: true }); writeFileSync(join(root, prefix(id), 'UR.md'), '# UR: Ended\n'); }
  const cliRun = (...args) => {
    const result = spawnSync(process.execPath, [cli, ...args, '--dir', root], { encoding: 'utf8' });
    let value = null; try { value = JSON.parse(result.stdout); } catch {}
    return { code: result.status, value, text: result.stdout + result.stderr };
  };
  const service = createRunCommandService(), target = resolveControlCommandTarget(root).target_id;
  const command = (group, id, kind, payload) => service(group, { schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target',
    primary_target: root, target_id: target, run_id: id, expected_revision_id: revision(id), operation_id: randomUUID(), assurance: 'cooperative_local', command: { kind, payload } });
  const source = id => { const path = `${prefix(id)}UR.md`; return { path, digest: artefactFileDigest(root, path) }; };

  // SCN-010: every CLI and MCP operation that would change an ended Run is refused with the closure; nothing is written.
  for (const [id, outcome] of [['old-work', 'superseded'], ['dropped-work', 'abandoned']]) {
    const before = readFileSync(statePath(id)), rev = revision(id), backlogBefore = readFileSync(backlogPath);
    const expectEnded = (result, label) => {
      const value = result?.family_result?.reason ? result.family_result : result;
      assert.equal(result?.reason, 'lifecycle_ended', `${id} ${label}: ${JSON.stringify(result)}`);
      assert.equal(value.closure?.outcome, outcome, label);
      assert.match(value.closure.closed_at ?? '', /^\d{4}-\d{2}-\d{2}T/u, label);
      if (outcome === 'superseded') assert.deepEqual(value.closure.successor, { kind: 'run', value: 'new-work', verified: true });
      assert.match(value.message, new RegExp(`closed as ${outcome}${outcome === 'superseded' ? ' by new-work' : ''} on \\d{4}-\\d{2}-\\d{2}; it accepts no further delivery operation\\. Start a new run`, 'u'), label);
      assert.deepEqual(readFileSync(statePath(id)), before, `${id} ${label} leaves the run byte-identical`);
    };
    expectEnded(cliRun('run-step', '--json', '--run', id, '--revision', rev, '--step', 'evidence', '--evidence', 'More work').value, 'run-step');
    expectEnded(cliRun('run-step', '--json', '--run', id, '--revision', rev, '--step', 'artefact', '--gate', 'PRD', '--evidence', `${prefix(id)}record.json`).value, 'artefact recording');
    expectEnded(cliRun('run-present', '--json', '--run', id, '--gate', 'UR', '--revision', rev).value, 'run-present');
    expectEnded(cliRun('run-approve', '--json', '--run', id, '--gate', 'UR', '--revision', rev, '--presentation', randomUUID(), '--response', 'Approval: UR').value, 'run-approve');
    expectEnded(cliRun('run-approve', '--json', '--run', id, '--gate', 'UR', '--revision', rev, '--presentation', randomUUID(), '--response', 'Approval: UR', '--operation', randomUUID()).value, 'typed run-approve');
    expectEnded(cliRun('run-revise', '--json', '--run', id, '--revision', rev).value, 'run-revise');
    expectEnded(cliRun('run-revise', '--json', '--preview', '--run', id, '--revision', rev, '--operation', randomUUID(), '--source-gate', 'UR', '--evidence', `${prefix(id)}proposal.json`).value, 'source revision');
    const recovery = cliRun('run-recovery', '--run', id, '--action', 'preview');
    assert.equal(recovery.code, 2); assert.equal(recovery.value.reason, 'AGDF_RUN_LIFECYCLE_ENDED'); assert.equal(recovery.value.closure.outcome, outcome);
    assert.match(recovery.value.message, /Start a new run/u);
    expectEnded(correctRunRelationship(root, { runId: id, revisionId: rev }, { evaluateGateCheck }), 'relationship correction');
    expectEnded(command('agdf_record', id, 'step.record', { step: 'evidence', source: source(id), reason: 'More', covers: 'scope' }), 'MCP step.record');
    expectEnded(command('agdf_record', id, 'artefact.record', { gate: 'PRD', reviewed_request: source(id) }), 'MCP artefact.record');
    expectEnded(command('agdf_prepare', id, 'presentation.prepare', { gate: 'UR' }), 'MCP presentation.prepare');
    expectEnded(command('agdf_approve', id, 'approval.record', { gate: 'UR', presentation_id: randomUUID(), response: 'Approval: UR' }), 'MCP approval.record');
    expectEnded(command('agdf_record', id, 'presentation_decision.record', { gate: 'UR', presentation_id: randomUUID(), action: 'reject', comment: 'No' }), 'MCP presentation decision');
    expectEnded(command('agdf_revise', id, 'prd_revision.reopen', { prd: source(id), confirmation: 'x' }), 'MCP revise');
    expectEnded(command('agdf_revise', id, 'source_revision.preview', { source_gate: 'UR', proposal: source(id) }), 'MCP source revision');
    expectEnded(command('agdf_closeout', id, 'closeout.record', { or: source(id), confirmation: 'x' }), 'MCP closeout');
    // run-update with changed content is refused; the hand edit stays where the owner made it.
    const edited = before.toString('utf8').replace('## Objective\n', '## Objective\n\nHand edit.\n');
    writeFileSync(statePath(id), edited);
    const changed = cliRun('run-update', '--json', '--run', id, '--revision', rev);
    assert.equal(changed.value.reason, 'lifecycle_ended', changed.text); assert.equal(readFileSync(statePath(id), 'utf8'), edited);
    writeFileSync(statePath(id), before);
    assert.deepEqual(readFileSync(backlogPath), backlogBefore, 'No refused operation touches the backlog');

    // SCN-013, SCN-026: gate-check and doctor show the closed history; continuation is refused.
    const gate = cliRun('gate-check', '--json', '--run', id).value;
    assert.equal(gate.status, 'closed'); assert.deepEqual(gate.allowed, []); assert.equal(gate.next_operation, null);
    assert.equal(gate.next_allowed_action, `Run ended as ${outcome}; start a new run to continue the work.`);
    assert.equal(gate.completion.status, outcome); assert.equal(gate.status_card.lifecycle, outcome); assert.equal(gate.status_card.delivery_state, outcome);
    assert.ok(gate.status_presentation?.markdown.includes('closed'));
    const german = cliRun('gate-check', '--json', '--run', id, '--language', 'de').value;
    assert.ok(german.status_presentation?.markdown.includes('geschlossen'), 'The German status card renders the ended run');
    const doctor = cliRun('doctor', '--json', '--run', id).value;
    assert.ok(!doctor.findings.some(row => ['block', 'revise'].includes(row.severity)), JSON.stringify(doctor.findings));
    const dispatched = cliRun('skill-dispatch', '--json', '--skill', 'gate-check', '--surface', 'claude', '--language', 'en', '--working-directory', root,
      '--target-source', 'explicit_target', '--primary-target', root, '--run', id, '--continue-delivery').value;
    assert.notEqual(dispatched?.outcome, 'skill_continuation', JSON.stringify(dispatched).slice(0, 400)); assert.equal(dispatched?.continuation ?? null, null);
    assert.deepEqual(readFileSync(statePath(id)), before);
  }

  // SCN-011: run-update on an unchanged ended Run preserves its state and legacy planning.
  const runBytes = readFileSync(statePath('dropped-work'));
  const synced = cliRun('run-update', '--json', '--run', 'dropped-work', '--revision', revision('dropped-work')).value;
  assert.equal(synced.outcome, 'unchanged', JSON.stringify(synced)); assert.equal(synced.run_state, 'unchanged'); assert.equal(synced.backlog, 'not_required');
  assert.deepEqual(readFileSync(statePath('dropped-work')), runBytes, 'The ended run itself is never written');
  assert.equal(readFileSync(backlogPath, 'utf8'), legacyBacklog, 'No implicit legacy backlog synchronization');
  assert.equal(cliRun('run-update', '--json', '--run', 'dropped-work', '--revision', revision('dropped-work')).value.outcome, 'unchanged');

  // SCN-015: all-active selections list only active runs.
  const doctorAll = cliRun('doctor', '--json', '--all-active').value, mapAll = cliRun('delivery-map', '--json', '--all-active').value;
  for (const report of [doctorAll, mapAll]) {
    const ids = report.runs.map(row => row.run_id);
    assert.ok(ids.includes('still-active') && ids.includes('new-work'), JSON.stringify(ids));
    for (const ended of ['old-work', 'dropped-work', 'writer-superseded', 'writer-abandoned']) assert.ok(!ids.includes(ended), ended);
  }
  assert.equal(doctorAll.inventory.active_count, 2);

  const evidence = cliRun('run-step', '--json', '--run', 'still-active', '--revision', revision('still-active'), '--step', 'evidence', '--evidence', 'Active work continues');
  assert.equal(evidence.value.outcome, 'recorded', 'Active runs keep today\'s behaviour');
  console.log('Ended-run guard for writers, CLI, MCP, readers, all-active selection and preserved legacy planning passed (synthetic only).');
} finally { rmSync(root, { recursive: true, force: true }); }
