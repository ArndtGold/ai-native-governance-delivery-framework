import assert from 'node:assert/strict';
import { test } from 'node:test';
import { authoredObjective, normalizedRunTitle, plainHeading, runIdentity } from '../lib/control-state/run-title.js';
import { buildRunInventory } from '../lib/control-state/run-inventory.js';
import { renderRunState } from '../lib/control-state/run-state-repository.js';
import { buildRunCandidates, resolveHumanRunTitle } from '../lib/interaction-presentation.js';
import { projectRunEntry } from '../lib/companion/run-view.js';

const RUN_ID = 'run-921ef1f8-9792-4392-a2ea-6eb63c50bde6';
const run = objective => `## Run Meta\n\n- run_id: x\n\n## Objective\n\n${objective}\n\n## Mode/Slice Decision\n\n- scope_reason:\n`;

test('the authored Objective is the first paragraph without Markdown marks', () => {
  assert.equal(authoredObjective(run('Ship **the** `companion`\nsafely.\n\nLater detail.')), 'Ship the companion safely.');
  assert.equal(authoredObjective(run('- A listed goal.')), 'A listed goal.');
  assert.equal(authoredObjective('## Objective\r\n\r\nWindows line endings.\r\n'), 'Windows line endings.');
  assert.equal(authoredObjective('## Mode/Slice Decision\n'), null, 'no Objective section');
  assert.equal(authoredObjective(null), null);
});

test('placeholders, status words and a bare generated Run ID are no Objective', () => {
  for (const value of ['Describe the trustworthy outcome.', 'TODO', '<goal>', '', RUN_ID, `\`${RUN_ID}\``])
    assert.equal(authoredObjective(run(value)), null, value);
  assert.equal(authoredObjective(run(`Fix ${RUN_ID} so its card shows one gate.`)), `Fix ${RUN_ID} so its card shows one gate.`);
});

test('title precedence is UR heading, then authored Objective, then the normalized Run ID', () => {
  assert.deepEqual(runIdentity({ runId: RUN_ID, runContent: run('The goal.'), urHeading: '# Status card `path`' }),
    { title: 'Status card path', title_source: 'ur', objective: 'The goal.' });
  assert.deepEqual(runIdentity({ runId: RUN_ID, runContent: run('The goal.') }), { title: 'The goal.', title_source: 'objective', objective: 'The goal.' });
  assert.deepEqual(runIdentity({ runId: RUN_ID, runContent: run(RUN_ID), urHeading: '  ' }),
    { title: normalizedRunTitle(RUN_ID), title_source: 'run_id', objective: null });
  assert.equal(plainHeading('## A *marked* _heading_'), 'A marked heading');
});

test('inventory, companion, status card and run candidates agree on one Run', () => {
  for (const [objective, expected] of [['The shared goal.', 'The shared goal.'], [RUN_ID, null], ['Describe the trustworthy outcome.', null]]) {
    const content = renderRunState(RUN_ID, run(objective).replace(/^## Run Meta[\s\S]*?(?=## Objective)/u, ''));
    const [entry] = buildRunInventory([{ run_id: RUN_ID, text: content, findings: [] }]).runs;
    const identity = runIdentity({ runId: RUN_ID, runContent: content });
    assert.equal(entry.objective, expected, objective);
    assert.equal(entry.title, identity.title);
    assert.equal(entry.title_source, identity.title_source);
    assert.equal(projectRunEntry(entry, null).objective, expected);
    assert.equal(resolveHumanRunTitle({ runContent: content, runId: RUN_ID }), identity.title);
    const [candidate] = buildRunCandidates([{ run_id: RUN_ID, valid: true, meta: { lifecycle: 'active' }, content }]);
    assert.equal(candidate.objective, expected ?? normalizedRunTitle(RUN_ID));
  }
});
