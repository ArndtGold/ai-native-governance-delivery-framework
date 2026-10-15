import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { evaluateTpPlanningContent } from '../lib/control-evaluation/tp-planning.js';
import { evaluateTpTraceability } from '../lib/control-evaluation/traceability-readiness.js';
import { artefactFileDigest } from '../lib/control-state/run-seal.js';
import { syntheticSd } from '../../cli/scripts/fixtures/sd-definition.js';

const root = mkdtempSync(join(tmpdir(), 'tp-planning-'));
try {
  const prefix = '.agdf/control/artefacts/tp-test/'; mkdirSync(join(root, prefix), { recursive: true });
  const sd = syntheticSd().replace('## Design Decisions\n', '## Design Decisions\n').replace('| Store boundary |', '| Evidence environment | later_tp | deferred | Choose available runtime | Test owner |\n| Store boundary |');
  const artefacts = new Map(), approvals = new Map();
  for (const type of ['UR', 'PRD', 'SD']) {
    const path = prefix + type + '.md'; writeFileSync(join(root, path), type === 'SD' ? sd : '# ' + type + '\nAC-001 user-owned filter');
    artefacts.set(type, { path, status: 'approved' }); approvals.set(type, { status: 'approved' });
  }
  const state = { run_id: 'tp-test', content: '', artefacts, approvals };
  const plan = `Planning Decisions contract: tp-decisions-v1
## Planning Decisions
| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Execution environment | SD: Evidence environment | resolved | Use isolated local runtime | Test owner |
`;
  const check = text => evaluateTpPlanningContent(root, state, sd, text);
  assert.deepEqual(check(plan).open_items, []);
  assert.deepEqual(check('Legacy Task Plan').open_items, []);
  for (const changed of [plan.replace('tp-decisions-v1', 'tp-decisions-v99'), plan + '\nPlanning Decisions contract: tp-decisions-v1',
    plan.replace('resolved', 'open'), plan.replace('Test owner', 'TODO'), plan.replace('Use isolated local runtime', ''),
    plan.replace('SD: Evidence environment', 'SD: Foreign decision'), plan.replace('| Execution environment', '| Duplicate environment') + plan.slice(plan.indexOf('## Planning Decisions')),
    plan.replace('| Execution environment | SD: Evidence environment | resolved | Use isolated local runtime | Test owner |', '| Local | TP | resolved | Local test only | Test owner |'),
    '```\n' + plan + '\n```\n## Planning Decisions\n', '<div>\n' + plan + '\n</div>\n## Planning Decisions\n']) {
    assert.ok(check(changed).open_items.length, changed);
  }
  const digest = artefactFileDigest(root, prefix + 'PRD.md');
  const open = plan.replace('| resolved |', '| open |');
  const details = `
## Clarification Requests
| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| F-1 | requirements_gap | PRD | open | AC-001 does not define filter visibility | Clarify visibility with product owner |
## Clarification Details
| finding_id | planning_decision | question | blocking_reason | required_answer | owner | source_ref | resolution_evidence |
|---|---|---|---|---|---|---|---|
| F-1 | Execution environment | Who may see the filter? | Visibility changes access and evidence scope | Choose personal visibility or revise product scope | Product owner | PRD: AC-001 @ ${digest} | pending |
`;
  const found = check(open + details); assert.equal(found.clarifications.length, 1);
  assert.equal(check(open + details + '\nOpen questions prevent approval.\n').clarifications.length, 1,
    'Explanatory prose following the declared table is permitted');
  assert.equal(check(open + details.replace('## Clarification Details\n', '## Clarification Details\nConcrete questions follow.\n')).clarifications.length, 1);
  assert.equal(check((open + details).replaceAll('## ', '### 3. ')).clarifications.length, 1);
  assert.equal(found.clarifications[0].gate, 'PRD'); assert.ok(found.open_items.length);
  for (const [gap, target, owner] of [['design_gap', 'SD', 'sd-definition'], ['plan_gap', 'TP', 'tp-definition'], ['evidence_gap', 'evidence_obligation', 'gate-check']]) {
    const r = check(open + details.replace('requirements_gap | PRD', gap + ' | ' + target));
    assert.equal(r.clarifications[0]?.gate, target);
  }
  assert.equal(check(open + details.replace('requirements_gap | PRD', 'requirements_gap | UR')).clarifications.length, 0, 'UR needs changed-intent evidence');
  const ur = check(open + details.replace('requirements_gap | PRD', 'requirements_gap | UR').replace('AC-001 does not define', 'changed user intent: AC-001 does not define'));
  assert.equal(ur.clarifications[0].gate, 'UR');
  for (const changed of [details.replace('Product owner | PRD:', 'TODO | PRD:'), details.replace('Who may see the filter?', ''),
    details.replace(digest, 'sha256:' + '0'.repeat(64)), details.replace('requirements_gap | PRD', 'design_gap | PRD'),
    details.replace('Execution environment | Who', 'Unknown decision | Who'), details.replace('F-1 | Execution', 'F-2 | Execution')]) {
    const r = check(open + changed); assert.ok(r.open_items.length); assert.equal(r.clarifications.length, 0);
  }
  const premature = check(plan + details.replace('| open | AC-001', '| resolved | AC-001'));
  assert.ok(premature.open_items.some(item => item.includes('recorded answer/source evidence')));
  const tpPath = prefix + 'TP.md'; writeFileSync(join(root, tpPath), open);
  artefacts.set('TP', { path: tpPath, status: 'draft' });
  writeFileSync(join(root, prefix + 'SD.md'), '# Legacy design');
  const declaredWithoutTraceability = evaluateTpTraceability(root, state);
  assert.equal(declaredWithoutTraceability.ready, false, 'a newly declared plan cannot bypass readiness by omitting traceability markers');
  assert.ok(declaredWithoutTraceability.open_items.some(item => item.startsWith('Open planning decision')));
  writeFileSync(join(root, prefix + 'PRD.md'), '# Changed AC-001');
  assert.equal(check(open + details).clarifications.length, 0, 'stale source cannot route a current clarification');
} finally { rmSync(root, { recursive: true, force: true }); }
console.log('TP declared decisions, typed deferred sources, material routing and stale/premature closure checks passed.');
