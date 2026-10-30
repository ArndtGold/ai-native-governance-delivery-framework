import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, realpathSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initializeCanonicalControl } from '../../cli/lib/scaffold/canonical-init.js';
import { generatedFilesForTarget } from '../../cli/lib/scaffold/plan.js';
import { cliGitObservation } from '../../cli/lib/control-evaluation/git-observation.js';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { canonicalRunText, runSealState } from '../lib/control-state/run-seal.js';
import { digest, resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { closeoutConfirmation } from '../lib/control-evaluation/closeout-readiness.js';

test('Git facts disable filesystem monitors and preserve the actual changed path', () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-readonly-git-')));
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
  try {
    git(['init','-q']); git(['config','user.name','Disposable fixture']); git(['config','user.email','fixture@example.invalid']);
    git(['config','core.fsmonitor','false']); git(['config','maintenance.auto','false']); git(['config','gc.auto','0']);
    writeFileSync(join(root,'README.md'),'Before\n'); git(['add','README.md']); git(['commit','-qm','Disposable baseline']);
    const canary = join(root,'.git','helper-invoked'), helper = join(root,'.git','monitor.cjs');
    // Valid fsmonitor v2 response: NUL-terminated token, then '/' invalidates the whole tree.
    // https://git-scm.com/docs/githooks#_fsmonitor_watchman
    writeFileSync(helper, `require('node:fs').writeFileSync(${JSON.stringify(canary)}, 'unexpected configured helper'); process.stdout.write('token\\0/\\0');`);
    git(['config','core.fsmonitor',`"${process.execPath}" "${helper}"`]);
    writeFileSync(join(root,'README.md'),'After\n');
    git(['diff','HEAD','--name-only']);
    assert.equal(existsSync(canary),true,'the unprotected Git invocation must detect the original helper-execution risk');
    rmSync(canary);
    assert.deepEqual(cliGitObservation.gitPathList(root,['diff','HEAD','--name-only']),['README.md']);
    assert.equal(existsSync(canary),false,'MCP observation must not execute a configured filesystem monitor');
    git(['config','core.fsmonitor','false']);
  } finally { rmSync(root,{recursive:true,force:true}); }
});

test('Verified Change uses actual Git baseline and completes through canonical typed writers without run-update', () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-verified-command-'))), run = 'verified';
  try {
    const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
    git(['init', '-q']); git(['config', 'user.name', 'Synthetic fixture']); git(['config', 'user.email', 'fixture@example.invalid']);
    initializeCanonicalControl(root, generatedFilesForTarget('init', root, false, 'en'));
    const state = createRun(root, run); writeFileSync(join(root, 'README.md'), 'Before\n');
    git(['add', '.']); git(['commit', '-qm', 'Synthetic clean baseline']);
    const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root, primary_target: root,
      target_source: 'explicit_target', target_id: resolveControlCommandTarget(root).target_id, run_id: run,
      expected_revision_id: readFileSync(state, 'utf8').match(/^- revision_id: (.+)$/m)[1], operation_id: randomUUID(), assurance: 'cooperative_local' });
    const service = (group, input, grant) => createRunCommandService({ packageVersion: '0.20.2', gitObservation: cliGitObservation,
      materialGrants: grant ? [grant] : [] })(group, input);
    const recordText = (kind, slot, content, extra = {}, group = 'agdf_record') => {
      const reference = { material_id: randomUUID(), digest: digest(canonicalRunText(content)) };
      const input = { ...bound(), command: { kind, payload: { source: reference, ...extra } } };
      const grant = { ...reference, content, slot, target_id: input.target_id, run_id: run, expected_revision_id: input.expected_revision_id };
      return service(group, input, grant);
    };
    const ur = '# UR: Bounded copy\n\n## Problem\nThe README copy is unclear.\n## Goal\nClarify one sentence.\n## Scope\nREADME.md only.\n\n## AGDF Approval Summary (en; source=en)\n- Problem: One sentence is unclear.\n- Goal: Clarify the sentence.\n- Scope: README.md only.\n';
    assert.equal(recordText('step.record', 'UR', ur, { step: 'ur', title: 'Bounded README copy' }).outcome, 'accepted');
    const prepared = service('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate: 'UR' } } });
    assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
    const approved = service('agdf_approve', { ...bound(), command: { kind: 'approval.record', payload: {
      gate: 'UR', presentation_id: prepared.family_result.presentation_id, response: 'Approval: UR' } } });
    assert.equal(approved.outcome, 'accepted', JSON.stringify(approved));
    let record = '# Verified Change: Synthetic bounded copy\n\n## Record\n- status: eligible\n- related_ur: .agdf/control/artefacts/verified/UR.md\n- escalation_target: structured_slice\n- canonical_owner: README.md\n- allowed_source_paths: README.md\n- allowed_derived_paths: none\n- prohibited_impacts: none\n- propagation_command: none\n- validation_commands: inspect exact README sentence\n- baseline_commit: to_be_captured\n- baseline_tracked_paths: none\n- baseline_untracked_paths: none\n- execution_changed_paths: none\n- execution_scope_status: pending\n- validation_status: pending\n- propagation_status: not_applicable\n\n## Brownfield Selection\n- mode: post_ur_review\n- decision: verified_change\n- scope_reason: One owner, bounded copy, no prohibited impact.\n- evidence: Synthetic fixture analysis.\n\n## Mini-Closeout\n- delivered:\n- intentionally_not_delivered:\n- residual_risk: none\n- next_step:\n';
    const eligible = recordText('verified_change.record', 'Verified Change', record, { phase: 'eligibility' });
    assert.equal(eligible.outcome, 'accepted', JSON.stringify(eligible));
    const vcPath = join(root, '.agdf/control/artefacts/verified/VERIFIED_CHANGE.md');
    record = readFileSync(vcPath, 'utf8');
    assert.ok(record.includes(`- baseline_commit: ${git(['rev-parse', 'HEAD']).trim()}`));
    const routed = recordText('step.record', 'Brownfield Review', '# Brownfield Review\n- decision: pass\nSynthetic bounded copy, one canonical owner and no prohibited impact.\n',
      { step: 'route', route: 'verified_change', reason: 'Bounded clean README copy with deterministic validation.' });
    assert.equal(routed.outcome, 'accepted', JSON.stringify(routed));
    assert.equal(routed.current.gate, 'Verified Change Execution', JSON.stringify(routed));
    writeFileSync(join(root, 'README.md'), 'After: clearer sentence.\n');
    const executedText = record.replace('- status: eligible', '- status: executed').replace('- execution_scope_status: pending', '- execution_scope_status: pass').replace('- validation_status: pending', '- validation_status: pass');
    const stateBeforeFailure = readFileSync(state, 'utf8');
    writeFileSync(join(root, 'unexpected.txt'), 'Out of the approved candidate scope.\n');
    const escaped = recordText('verified_change.record', 'Verified Change', executedText, { phase: 'execution' });
    assert.equal(escaped.outcome, 'rejected', JSON.stringify(escaped));
    assert.equal(escaped.reason, 'verified_change_not_ready');
    assert.equal(escaped.current.blocking_reason, 'verified_change_invalid_escalated', JSON.stringify(escaped));
    assert.equal(readFileSync(state, 'utf8'), stateBeforeFailure);
    rmSync(join(root, 'unexpected.txt'));
    writeFileSync(join(root, ' README.md'), 'A distinct path must not be trimmed into the approved README path.\n');
    writeFileSync(join(root, 'Änderung.md'), 'Unicode Git paths must not become quoted escape sequences.\n');
    assert.ok(cliGitObservation.gitPathList(root, ['ls-files', '--others', '--exclude-standard']).includes(' README.md'));
    assert.ok(cliGitObservation.gitPathList(root, ['ls-files', '--others', '--exclude-standard']).includes('Änderung.md'));
    const distinctPath = recordText('verified_change.record', 'Verified Change', executedText, { phase: 'execution' });
    assert.equal(distinctPath.outcome, 'rejected'); assert.equal(readFileSync(state, 'utf8'), stateBeforeFailure);
    rmSync(join(root, ' README.md')); rmSync(join(root, 'Änderung.md'));
    const executed = recordText('verified_change.record', 'Verified Change', executedText, { phase: 'execution' });
    assert.equal(executed.outcome, 'accepted', JSON.stringify(executed));
    assert.equal(executed.current.gate, 'OR', JSON.stringify(executed));
    record = readFileSync(vcPath, 'utf8');
    assert.match(record, /- execution_changed_paths: .*README\.md/);
    const closeText = record.replace('- delivered:\n', '- delivered: The README sentence was clarified.\n').replace('- intentionally_not_delivered:\n', '- intentionally_not_delivered: Other files were excluded.\n').replace('- next_step:\n', '- next_step: Optional handoff only.\n');
    const reference = { material_id: randomUUID(), digest: digest(canonicalRunText(closeText)) }, input = bound();
    input.command = { kind: 'closeout.record', payload: { or: reference, confirmation: closeoutConfirmation(run, input.expected_revision_id, input.operation_id, reference.digest) } };
    const wrongConfirmation = service('agdf_closeout', { ...input, command: { kind: 'closeout.record', payload: { or: reference, confirmation: 'Approval: TP' } } },
      { ...reference, slot: 'Verified Change', content: closeText, target_id: input.target_id, run_id: run, expected_revision_id: input.expected_revision_id });
    assert.equal(wrongConfirmation.reason, 'confirmation_required');
    const closed = service('agdf_closeout', input, { ...reference, slot: 'Verified Change', content: closeText,
      target_id: input.target_id, run_id: run, expected_revision_id: input.expected_revision_id });
    assert.equal(closed.outcome, 'accepted', JSON.stringify(closed));
    assert.equal(closed.current.lifecycle, 'completed');
    assert.equal(closed.receipt.effect.record.mode, 'verified_change');
    assert.equal(runSealState(root, readFileSync(state, 'utf8')).status, 'valid');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
