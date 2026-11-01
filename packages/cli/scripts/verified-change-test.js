import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { currentFixture, currentRun } from '../../core/test/fixtures/current-run.js';
import { clarifiedUr } from '../../core/test/planned-fixtures.js';
import { containedRegularFile, isSafeControlRelativePath } from '#agdf-core/control-state/contained-file.js';
import { artefactFileDigest } from '#agdf-core/control-state/run-seal.js';
import { analyzeArtefactRoleConsistency, resolvedArtefactFile } from '#agdf-core/control-evaluation/run-state.js';
import { isSafeRepoRelativePath, readVerifiedChangeRecord } from '#agdf-core/control-evaluation/verified-change.js';
const cleanups = [], f = currentFixture({ after: callback => cleanups.push(callback) }), root = f.root;
const run = currentRun(f, 'Bounded current README copy'), prefix = `.agdf/control/runs/${run.id}/`;
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
let baselineCommit = '0'.repeat(40);
function record({ status = "eligible", relatedUr = `${prefix}documents/UR.md`, escalationTarget = "structured_slice", owner = "README.md", sourcePaths = "README.md", derivedPaths = "none", prohibitedImpacts = "none", propagationCommand = "none", validationCommands = "node --check fixture", baselineTracked = "none", baselineUntracked = "none", executionChangedPaths, executionScopeStatus, validationStatus = "pending", propagationStatus = "not_applicable", extra = "" } = {}) {
  const changedPaths = executionChangedPaths ?? (status === "executed" ? "README.md" : "none");
  const scopeStatus = executionScopeStatus ?? (status === "executed" ? "pass" : "pending");
  return `# Verified Change: Fixture

## Record

- status: ${status}
- related_ur: ${relatedUr}
- escalation_target: ${escalationTarget}
- canonical_owner: ${owner}
- allowed_source_paths: ${sourcePaths}
- allowed_derived_paths: ${derivedPaths}
- prohibited_impacts: ${prohibitedImpacts}
- propagation_command: ${propagationCommand}
- validation_commands: ${validationCommands}
- baseline_commit: ${baselineCommit}
- baseline_tracked_paths: ${baselineTracked}
- baseline_untracked_paths: ${baselineUntracked}
- execution_changed_paths: ${changedPaths}
- execution_scope_status: ${scopeStatus}
- validation_status: ${validationStatus}
- propagation_status: ${propagationStatus}
${extra}

## Brownfield Selection

- mode: post_ur_review
- decision: verified_change
- scope_reason: One canonical owner and bounded paths.
- evidence: Fixture review.

## Mini-Closeout

- delivered: Declared source change.
- intentionally_not_delivered: No structured delivery artefacts.
- escalation_result: none
- residual_risk: none
- next_step: Delivery closeout.
`;
}

try {
  for (const roles of [['CR', 'Code Review'], ['Clean Review', 'Clean Implementation Review']]) {
    const state = { artefacts: new Map(roles.map(role => [role, { path: 'reviews/review.md', status: 'done' }])) };
    assert.deepEqual(analyzeArtefactRoleConsistency(root, state), []);
    state.artefacts.get(roles[0]).status = 'missing'; assert(analyzeArtefactRoleConsistency(root, state).some(row => row.code === 'AGDF_ARTEFACT_ROLE_ALIAS_INVALID'));
    state.artefacts.get(roles[0]).status = 'done'; state.artefacts.set('QA', { path: 'reviews/review.md', status: 'done' });
    assert(analyzeArtefactRoleConsistency(root, state).some(row => row.code === 'AGDF_ARTEFACT_ROLE_ALIAS_INVALID'));
  }
  for (const path of ['D:foo', 'D:/foo', 'C:\\foo', '//server/share', '../outside', '/absolute', 'file:stream']) {
    assert.equal(isSafeControlRelativePath(path), false); assert.equal(isSafeRepoRelativePath(path), false);
    assert.equal(resolvedArtefactFile(root, path), ''); assert.equal(artefactFileDigest(root, path), 'unresolved');
    assert.equal(readVerifiedChangeRecord(root, { artefacts: new Map([['Verified Change', { path }]]) }).status, 'invalid');
  }
  writeFileSync(join(root, 'contained.md'), 'contained\n'); assert.equal(containedRegularFile(root, 'contained.md').status, 'valid');
  git(['config', 'user.name', 'Synthetic current fixture']); git(['config', 'user.email', 'fixture@example.invalid']);
  writeFileSync(join(root, 'README.md'), 'Before\n'); git(['add', '.']); git(['commit', '-qm', 'Synthetic current baseline']); baselineCommit = git(['rev-parse', 'HEAD']).trim();
  const accepted = value => { assert.equal(value.outcome, 'accepted', JSON.stringify(value)); return value; };
  accepted(run.step('ur', clarifiedUr, { title: 'Bounded current README copy' })); accepted(run.approve('UR'));
  const vc = (text, phase = 'eligibility') => {
    const binding = run.binding(), staged = f.material(binding, 'Verified Change', text, { transfer: true });
    const result = run.call('verified_change.record', { phase, source: staged.reference });
    if (result.outcome === 'rejected') assert.equal(f.store.stage(f.request('material.stage', { action: 'discard', transfer_id: staged.transfer_id }, binding)).outcome, 'accepted');
    return result;
  };
  for (const change of [{ sourcePaths: '../escape.md' }, { derivedPaths: '../derived.md' }, { relatedUr: 'none' }, { owner: 'README.md, other.md' },
    { validationCommands: 'none' }, { prohibitedImpacts: 'security' }, { derivedPaths: 'generated/file.json', propagationCommand: 'none' }]) {
    const before = run.content(); assert.equal(vc(record(change)).outcome, 'rejected', JSON.stringify(change)); assert.equal(run.content(), before);
  }
  accepted(vc(record())); const path = join(root, prefix, 'documents/VERIFIED_CHANGE.md');
  let saved = readFileSync(path, 'utf8'); assert(saved.includes('- baseline_commit: ' + baselineCommit));
  accepted(run.step('route', '# Brownfield Review\n- decision: pass\nOne bounded README owner and direct verification.\n', { route: 'verified_change', reason: 'One bounded current source owner' }));
  const cli = join(import.meta.dirname, '../bin/create-agdf.js');
  const inspect = () => { const result = spawnSync(process.execPath, [cli, 'gate-check', '--dir', root, '--run', run.id, '--language', 'en', '--json'], { encoding: 'utf8' }); assert.ifError(result.error); return JSON.parse(result.stdout); };
  assert.equal(inspect().current_gate, 'Verified Change Execution');
  assert.equal(inspect().next_operation.type, 'implement_compact_scope');
  writeFileSync(join(root, 'README.md'), 'After: clearer current sentence.\n');
  const executed = saved.replace('- status: eligible', '- status: executed').replace('- execution_scope_status: pending', '- execution_scope_status: pass').replace('- validation_status: pending', '- validation_status: pass');
  writeFileSync(join(root, 'unlisted.md'), 'foreign scope\n'); let before = run.content();
  assert.equal(vc(executed, 'execution').outcome, 'rejected'); assert.equal(run.content(), before); rmSync(join(root, 'unlisted.md'));
  assert.equal(vc(executed.replace('- validation_status: pass', '- validation_status: pending'), 'execution').outcome, 'rejected'); assert.equal(run.content(), before);
  accepted(vc(executed, 'execution')); assert.equal(inspect().current_gate, 'OR');
  assert.equal(readFileSync(join(root, 'README.md'), 'utf8'), 'After: clearer current sentence.\n');
  console.log('Verified Change current CLI observation and actual typed Git ownership: eligibility refusals, captured baseline, execution scope/validation and compact closeout routing passed.');
} finally { for (const cleanup of cleanups.reverse()) cleanup(); }
