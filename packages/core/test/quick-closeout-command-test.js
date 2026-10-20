import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createCoreServices } from '../lib/index.js';
import { artefactFileDigest, runSealState } from '../lib/control-state/run-seal.js';
import { parseRunState } from '../lib/control-state/run-state-parser.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { closeoutConfirmation } from '../lib/control-evaluation/closeout-readiness.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-quick-command-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]);
  execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const run = 'quick-command', prefix = `.agdf/control/artefacts/${run}/`, path = join(root, `.agdf/control/runs/${run}/RUN_STATE.md`);
  execFileSync(process.execPath, [cli, 'run-create', '--dir', root, '--run', run]);
  mkdirSync(join(root, prefix), { recursive: true });
  const core = createCoreServices(), service = core.command, target = resolveControlCommandTarget(root).target_id;
  const revision = () => parseRunState(readFileSync(path, 'utf8'), run).meta.revision_id;
  const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: target, run_id: run, expected_revision_id: revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
  const source = (name, content) => { const namePath = prefix + name; writeFileSync(join(root, namePath), content); return { path: namePath, digest: artefactFileDigest(root, namePath) }; };
  const record = payload => { const result = service('agdf_record', { ...bound(), command: { kind: 'step.record', payload } }); assert.equal(result.outcome, 'accepted', JSON.stringify(result)); return result; };
  record({ step: 'ur', title: 'Synthetic single function subtraction', source: source('UR_CANDIDATE.md', '# UR: Synthetic subtraction\n\n## Problem\nA bounded numeric operation is missing.\n## Goal\nProvide the operation with a regression.\n## Scope\nOne function and its direct test.\n\n## AGDF Approval Summary (en; source=en)\n- Problem: A bounded subtraction operation is missing.\n- Goal: Provide the operation with its regression.\n- Scope: One function and its test.\n') });
  record({ step: 'route', route: 'quick_task', reason: 'One bounded function and regression; no public policy or contract impact.', source: source('BROWNFIELD_CANDIDATE.md', '# Brownfield Review\nSynthetic disposable single-function scope.\n') });
  const prepared = service('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate: 'UR' } } });
  assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
  const approved = service('agdf_approve', { ...bound(), command: { kind: 'approval.record', payload: { gate: 'UR', presentation_id: prepared.family_result.presentation_id, response: 'Approval: UR' } } });
  assert.equal(approved.outcome, 'accepted', JSON.stringify(approved));
  const dispatch = (continueDelivery = true) => core.dispatch({ skillId: 'gate-check', presentationLanguage: 'en',
    workingDirectory: root, primaryTarget: root, targetSource: 'continued_target', runId: run,
    continueDelivery, surface: 'codex', expectedVersion: core.resources.pluginDefinition.version,
    skillSet: core.resources.pluginDefinition.skillSet, interactionLocales: core.resources.interactionLocales });
  const beforeDispatch = readFileSync(path, 'utf8');
  assert.equal(dispatch(false).terminal, true);
  assert.equal(readFileSync(path, 'utf8'), beforeDispatch, 'status does not write');
  const implementation = dispatch();
  assert.equal(implementation.continuation?.phase, 'compact_implementation', JSON.stringify(implementation));
  assert.equal(implementation.continuation.revision_id, revision());
  const or = source('OR_CANDIDATE.md', `# OR-lite: Synthetic subtraction\nReport mode: OR-lite\nRun: ${run}\n\n## Result\nSynthetic subtraction and direct regression complete.\n## Evidence\nDisposable test result recorded.\n## Risk\nnone\n## Next Step\nOptional explicitly requested VCS handoff.\n`);
  const request = () => { const input = { ...bound(), command: { kind: 'closeout.record', payload: { or, confirmation: '' } } };
    input.command.payload.confirmation = closeoutConfirmation(run, input.expected_revision_id, input.operation_id, or.digest); return input; };
  const before = readFileSync(path, 'utf8');
  assert.equal(service('agdf_closeout', request()).reason, 'closeout_obligations_unfulfilled');
  assert.equal(readFileSync(path, 'utf8'), before);
  for (const text of ['~~~\nDecision: pass\n~~~\n', '> Example:\nDecision: pass\n', '## Examples\nDecision: pass\n']) {
    const before = readFileSync(path, 'utf8');
    const denied = service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: { step: 'review', decision: 'pass', source: source('CR_CANDIDATE.md', text) } } });
    assert.equal(denied.outcome, 'rejected'); assert.equal(readFileSync(path, 'utf8'), before);
  }
  record({ step: 'review', decision: 'pass', source: source('CR_CANDIDATE.md', '# Code Review\nStatus: pass\n- decision: pass\nSynthetic bounded diff and its direct regression reviewed.\n\n## Examples\nDecision: block\n') });
  assert.equal(dispatch().continuation?.phase, 'compact_closeout');
  const input = request(), result = service('agdf_closeout', input);
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(result.current.lifecycle, 'completed'); assert.equal(result.current.completion.fulfilled, true);
  assert.equal(result.current.next_operation, null); assert.equal(result.current.gate, 'OR');
  assert.equal(service('agdf_closeout', input).outcome, 'already_applied');
  const saved = readFileSync(path, 'utf8'); assert.equal(runSealState(root, saved).status, 'valid');
  assert.equal(evaluateGateCheck(root, { runId: run }).completion.fulfilled, true);
  const completed = dispatch();
  assert.equal(completed.terminal, true); assert.equal(completed.control.next_operation, null);
  assert.doesNotMatch(readFileSync(join(root, '.agdf/control/MASTER_BACKLOG.md'), 'utf8').split('## Completed / Superseded Pointers')[0], /\| quick-command \|/);

  // The documented CLI lane records the Code Review without a registered file; closeout must still be reachable.
  const cliRun = 'quick-cli', cliPrefix = `.agdf/control/artefacts/${cliRun}/`, cliPath = join(root, `.agdf/control/runs/${cliRun}/RUN_STATE.md`);
  const cliRevision = () => parseRunState(readFileSync(cliPath, 'utf8'), cliRun).meta.revision_id;
  const runCli = (...args) => JSON.parse(execFileSync(process.execPath, [cli, ...args, '--dir', root, '--run', cliRun, '--json'], { encoding: 'utf8' }));
  execFileSync(process.execPath, [cli, 'run-create', '--dir', root, '--run', cliRun]);
  mkdirSync(join(root, cliPrefix), { recursive: true });
  writeFileSync(join(root, cliPrefix, 'UR.md'), '# UR: Synthetic CLI subtraction\n\n## Problem\nA bounded numeric operation is missing.\n## Goal\nProvide the operation with a regression.\n## Scope\nOne function and its direct test.\n\n## AGDF Approval Summary (en; source=en)\n- Problem: A bounded subtraction operation is missing.\n- Goal: Provide the operation with its regression.\n- Scope: One function and its test.\n');
  writeFileSync(join(root, cliPrefix, 'BROWNFIELD_REVIEW.md'), '# Brownfield Review\nSynthetic disposable single-function scope.\n');
  assert.equal(runCli('run-step', '--revision', cliRevision(), '--step', 'ur', '--title', 'Synthetic CLI subtraction').outcome, 'recorded');
  assert.equal(runCli('run-step', '--revision', cliRevision(), '--step', 'route', '--route', 'quick_task', '--reason', 'One bounded function and regression.', '--evidence', `${cliPrefix}BROWNFIELD_REVIEW.md`).outcome, 'recorded');
  const presentation = runCli('run-present', '--gate', 'UR', '--revision', cliRevision(), '--language', 'en');
  assert.equal(runCli('run-approve', '--gate', 'UR', '--revision', cliRevision(), '--presentation', presentation.presentation_id, '--response', 'Approval: UR').outcome, 'approved');
  writeFileSync(join(root, cliPrefix, 'CODE_REVIEW.md'), '# Code Review\n- decision: pass\n');
  assert.equal(runCli('run-step', '--revision', cliRevision(), '--step', 'review', '--decision', 'pass', '--evidence', 'Synthetic diff reviewed', '--source', `${cliPrefix}CODE_REVIEW.md`).outcome, 'recorded');
  const cliDispatch = () => core.dispatch({ skillId: 'gate-check', presentationLanguage: 'en', workingDirectory: root, primaryTarget: root,
    targetSource: 'continued_target', runId: cliRun, continueDelivery: true, surface: 'codex', expectedVersion: core.resources.pluginDefinition.version,
    skillSet: core.resources.pluginDefinition.skillSet, interactionLocales: core.resources.interactionLocales });
  const cliCloseout = cliDispatch();
  assert.equal(cliCloseout.continuation?.phase, 'compact_closeout', JSON.stringify(cliCloseout));
  assert.equal(cliCloseout.continuation.skill_id, 'release-or');
  assert.deepEqual(cliCloseout.continuation.source_artifacts.map(source => source.type), ['UR', 'Brownfield Review']);
  assert.equal(runCli('run-step', '--revision', cliRevision(), '--step', 'closeout', '--result', 'Synthetic subtraction complete.', '--evidence', 'Disposable test result recorded.', '--risk', 'none', '--next', 'Optional VCS handoff.').current_gate, 'OR');
  assert.equal(evaluateGateCheck(root, { runId: cliRun }).completion.fulfilled, true);
  assert.equal(cliDispatch().terminal, true);
  console.log('Actual disposable Quick command chain, mandatory CR, exact OR-lite confirmation, receipt replay and completed/backlog projection passed. No VCS command executed.');
} finally { rmSync(root, { recursive: true, force: true }); }
