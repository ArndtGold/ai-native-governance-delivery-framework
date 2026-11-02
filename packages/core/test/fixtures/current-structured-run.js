import assert from 'node:assert/strict';
import { currentFixture, currentRun } from './current-run.js';
import { clarifiedUr } from '../planned-fixtures.js';
import { syntheticPrd } from '../../../cli/scripts/fixtures/prd-definition.js';
import { syntheticSd } from '../../../cli/scripts/fixtures/sd-definition.js';
import { syntheticTp } from '../../../cli/scripts/fixtures/tp-definition.js';
const accepted = value => { assert.equal(value.outcome, 'accepted', JSON.stringify(value)); return value; };
export function structuredCurrentRun(t, options) {
  const f = currentFixture(t, options), run = currentRun(f);
  accepted(run.step('ur', clarifiedUr, { title: 'Synthetic saved filter' }));
  accepted(run.approve('UR'));
  accepted(run.step('route', '# Brownfield Review\n\nExisting personal filter service owns the values.\n- ux_intent_definition_required: no\n', { route: 'structured_delivery', reason: 'Synthetic structured test prerequisite' }));
  for (const [gate, text] of [['PRD', syntheticPrd()], ['SD', syntheticSd()], ['TP', syntheticTp()]]) {
    accepted(run.record(gate, text)); accepted(run.approve(gate));
  }
  return run;
}
