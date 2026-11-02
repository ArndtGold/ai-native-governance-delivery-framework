import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { currentFixture, currentRun } from '../../core/test/fixtures/current-run.js';
import { clarifiedUr } from '../../core/test/planned-fixtures.js';
import { treeBytes } from '../../core/test/control-cockpit-fixtures.js';
import { evaluateGateCheck } from '#agdf-core/control-evaluation/gate-check.js';
import { createSkillDispatchService } from '#agdf-core/skill-dispatch/service.js';
import { interactionLocales, pluginDefinition } from '../lib/cli/runtime-context.js';
const cleanups = [], prior = process.env.AGDF_RUN_ID;
delete process.env.AGDF_RUN_ID;
try {
  const f = currentFixture({ after: callback => cleanups.push(callback) }), root = f.root;
  let gateCalls = 0;
  const service = createSkillDispatchService({ env: {}, evaluateGateCheck(target, selection) { gateCalls++; return evaluateGateCheck(target, selection); } });
  const base = { skillSet: pluginDefinition.skillSet, interactionLocales, expectedVersion: pluginDefinition.version,
    skillId: 'gate-check', surface: 'codex', presentationLanguage: 'en', workingDirectory: root, targetSource: 'explicit_target', primaryTarget: root };
  const dispatch = fields => service({ ...base, intake: true, ...fields });
  const assignment = () => {
    const before = treeBytes(root), calls = gateCalls, result = dispatch();
    assert.equal(result.continuation.phase, 'resolve_delivery_run', JSON.stringify(result)); assert.equal(result.control, null);
    assert.equal(result.authorizes, false); assert.equal(result.terminal, false); assert.equal(gateCalls, calls);
    assert.deepEqual(treeBytes(root), before); return result.continuation.candidate_runs;
  };
  assert.deepEqual(assignment(), []);
  const unrelated = currentRun(f, 'An independent existing scope'); assert.equal(assignment().length, 1);
  const requested = currentRun(f, 'The selected current requirement');
  assert.deepEqual(assignment().map(row => row.run_id).sort(), [requested.id, unrelated.id].sort());
  assert.equal(requested.step('ur', clarifiedUr, { title: 'The selected current requirement' }).outcome, 'accepted');
  process.env.AGDF_RUN_ID = unrelated.id;
  const before = treeBytes(root), initial = requested.binding().expected_revision_id;
  const matched = dispatch({ runId: requested.id, intakeMode: 'resume', expectedRevisionId: initial });
  assert.equal(matched.continuation.phase, 'presentation_required', JSON.stringify(matched)); assert.equal(matched.control.run_id, requested.id);
  assert.deepEqual(treeBytes(root), before);
  const operation = randomUUID(), id = `run-${operation}`, fresh = dispatch({ runId: id, intakeMode: 'new' });
  assert.equal(fresh.continuation.phase, 'run_missing', JSON.stringify(fresh));
  assert.deepEqual(fresh.continuation.steps[0].argv, ['run-create', '--dir', root, '--title', id, '--operation', operation]);
  assert.deepEqual(treeBytes(root), before);
  assert.equal(dispatch({ runId: 'arbitrary-name', intakeMode: 'new' }).terminal, true, 'New creation requires its original UUID identity');
  assert.equal(requested.call('ur_draft.replace', { source: f.material(requested.binding(), 'UR', clarifiedUr + '\nRevised scope statement.\n'), title: 'The revised selected requirement' }).outcome, 'accepted');
  assert.equal(dispatch({ runId: requested.id, intakeMode: 'resume', expectedRevisionId: initial }).continuation.reason, 'stale_assignment');
  const configPath = root + '/.agdf/control/config.json', config = readFileSync(configPath);
  writeFileSync(configPath, '{"control_layout":"master-backlog-v1"}');
  const damaged = treeBytes(root), stopped = dispatch({ runId: `run-${randomUUID()}`, intakeMode: 'new' });
  assert.equal(stopped.terminal, true); assert.deepEqual(treeBytes(root), damaged); writeFileSync(configPath, config);
  // A changed current source between selection and evaluation is stale; it
  // cannot be assigned by recency or silently refreshed into a different scope.
  const revision = requested.binding().expected_revision_id;
  const raced = createSkillDispatchService({ env: {}, evaluateGateCheck(target, selection) {
    const changed = requested.call('ur_draft.replace', { source: f.material(requested.binding(), 'UR', clarifiedUr + '\nRaced source.\n'), title: 'Raced requirement' });
    assert.equal(changed.outcome, 'accepted'); return evaluateGateCheck(target, selection);
  } })({ ...base, intake: true, intakeMode: 'resume', runId: requested.id, expectedRevisionId: revision });
  assert.equal(raced.continuation.reason, 'stale_assignment');
  console.log('Current run assignment: zero/one/multiple candidates, explicit scope, UUID-bound creation steps, stale/raced selection and unsupported preservation passed.');
} finally { if (prior === undefined) delete process.env.AGDF_RUN_ID; else process.env.AGDF_RUN_ID = prior; for (const cleanup of cleanups.reverse()) cleanup(); }
