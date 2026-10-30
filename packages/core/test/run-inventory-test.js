import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRunInventory, normalizedRunTitle, runAttention, runInventoryLabel } from '../lib/control-state/run-inventory.js';
import { readRunInventory } from '../lib/control-state/run-inventory-reader.js';
import { isDecisionContentPlaceholder as movedPlaceholder } from '../lib/control-evaluation/decision-content-placeholder.js';
import { isDecisionContentPlaceholder as exportedPlaceholder } from '../lib/control-evaluation/decision-content-readiness.js';
import { normalizedRunTitle as presentationTitle } from '../lib/interaction-presentation.js';

const libRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../lib');
const cell = value => Buffer.from(JSON.stringify(value)).toString('base64url');

// Minimal run state text with the sections the inventory reads.
function runText(id, { lifecycle = 'active', gate = 'UR', decision = 'in_progress', revision = 3, objective = `Outcome of ${id}.`,
  missing = 'none', next = 'Continue.', known = 'Known.', approvals = [], artefacts = [], runOps = [], approvalOps = [], updatedAt = '2026-09-30T08:31:00.000Z' } = {}) {
  const lines = ['# AGDF Run State', '', '## Run Meta', '', '- control_state_version: 2', `- run_id: ${id}`, `- lifecycle: ${lifecycle}`,
    `- revision: ${revision}`, '- revision_id: 11111111-2222-4333-8444-555555555555', ...(updatedAt ? [`- updated_at: ${updatedAt}`] : []),
    '- mode: structured_delivery', `- current_gate: ${gate}`, `- decision: ${decision}`, '', '## Objective', '', objective, '',
    '## Current Control State', '', '| Question | Answer |', '|---|---|', `| What is known? | ${known} |`, '| What is approved? | none |',
    `| What is missing? | ${missing} |`, `| What is the next allowed action? | ${next} |`, '', '## Approvals', '', '| Gate | Status | Evidence |', '|---|---|---|',
    ...approvals.map(([g, day]) => `| ${g} | approved | \`Approval: ${g}\` · ${day} · revision 2 · presentation x |`), '',
    '## Artefacts', '', '| Type | Path | Status | Notes |', '|---|---|---|---|', ...artefacts.map(([t, s]) => `| ${t} | x.md | ${s} |  |`), ''];
  if (runOps.length) lines.push('## Run Operations', '', '- schema_version: 1', '', '| operation_id | request_digest | receipt |', '|---|---|---|',
    ...runOps.map((receipt, index) => `| op-${index} | sha256:x | ${cell(receipt)} |`), '');
  if (approvalOps.length) lines.push('## Approval Operations', '', '- schema_version: 1', '', '| operation_id | request_digest | receipt |', '|---|---|---|',
    ...approvalOps.map((receipt, index) => `| ap-${index} | sha256:x | ${cell(receipt)} |`), '');
  return lines.join('\r\n');
}
const source = (id, options) => ({ run_id: id, text: runText(id, options), findings: [] });
const entryOf = (inventory, id) => inventory.runs.find(run => run.run_id === id);

// SCN-001, SCN-002: entries, fields and closure facts.
{
  const inventory = buildRunInventory([
    source('active-run', { gate: 'PRD', missing: 'Exact Approval: PRD.', next: 'Request approval.' }),
    source('done-run', { lifecycle: 'completed', gate: 'OR', decision: 'completed' }),
    source('replaced-run', { lifecycle: 'superseded', gate: 'SD', runOps: [
      { kind: 'step.record', created_at: '2026-10-01T10:00:00.000Z' },
      { kind: 'lifecycle_close.record', created_at: '2026-10-20T09:00:00.000Z', effect: { record: { reason: 'Replaced by the new slice', successor: { value: 'new-run', verified: true } } } }] }),
    source('dropped-run', { lifecycle: 'abandoned', gate: 'UR', runOps: [
      { kind: 'lifecycle_close.record', created_at: '2026-10-21T09:00:00.000Z', effect: { record: { reason: 'No longer needed' } } }] }),
  ]);
  assert.equal(inventory.schema_version, '1');
  assert.equal(inventory.state, 'complete');
  assert.equal(inventory.authorizes, false);
  assert.equal(inventory.runs.length, 4);
  const active = entryOf(inventory, 'active-run');
  assert.deepEqual(Object.keys(active).sort(), ['attention', 'basis', 'closure', 'current_gate', 'decision', 'findings', 'last_activity', 'lifecycle',
    'missing', 'next_action', 'path', 'revision', 'revision_id', 'run_id', 'title', 'title_source', 'valid'].sort());
  assert.equal(active.title, 'Outcome of active-run.');
  assert.equal(active.lifecycle, 'active');
  assert.equal(active.current_gate, 'PRD');
  assert.equal(active.decision, 'in_progress');
  assert.equal(active.revision, 3);
  assert.equal(active.revision_id, '11111111-2222-4333-8444-555555555555');
  assert.equal(active.missing, 'Exact Approval: PRD.');
  assert.equal(active.next_action, 'Request approval.');
  assert.equal(active.path, '.agdf/control/runs/active-run/RUN_STATE.md');
  assert.equal(active.closure, null);
  assert.deepEqual(entryOf(inventory, 'replaced-run').closure, { outcome: 'superseded', reason: 'Replaced by the new slice',
    successor: { value: 'new-run', verified: true }, closed_at: '2026-10-20T09:00:00.000Z' });
  assert.deepEqual(entryOf(inventory, 'dropped-run').closure, { outcome: 'abandoned', reason: 'No longer needed', successor: null, closed_at: '2026-10-21T09:00:00.000Z' });
  assert.equal(entryOf(inventory, 'done-run').closure, null);
  assert.equal(entryOf(inventory, 'done-run').attention.code, 'none');
}

// SCN-003: titles and their source.
{
  const inventory = buildRunInventory([
    source('authored-run', { objective: '- **Readable** goal with `code`' }),
    source('template-run', { objective: 'Describe the trustworthy outcome.' }),
    source('prompt-run', { objective: 'What outcome should become possible?' }),
    source('empty-run', { objective: '' }),
  ]);
  assert.deepEqual([entryOf(inventory, 'authored-run').title, entryOf(inventory, 'authored-run').title_source], ['Readable goal with code', 'objective']);
  for (const id of ['template-run', 'prompt-run', 'empty-run']) {
    assert.equal(entryOf(inventory, id).title_source, 'run_id');
    assert.equal(entryOf(inventory, id).title, normalizedRunTitle(id));
  }
  assert.equal(normalizedRunTitle('run-inventory-core-20261029-01'), 'Run Inventory Core 20261029 01');
  assert.equal(presentationTitle, normalizedRunTitle, 'one owner for the run-ID title');
  // CR-F05: a hard-wrapped first paragraph stays whole; the next paragraph is not part of the title.
  const wrapped = buildRunInventory([source('wrapped-run', { objective: 'Create a German discussion document for candidate\r\ndomain-facing MCP capabilities.\r\n\r\nSecond paragraph.' })]);
  assert.equal(wrapped.runs[0].title, 'Create a German discussion document for candidate domain-facing MCP capabilities.');
}

// SCN-004: the moved placeholder rule keeps its exported behavior.
for (const value of ['Describe the trustworthy outcome.', '`What remains unverified?`', 'todo', 'TBD', '<goal>', 'pass | revise', '', '  ', null, 'A real sentence.']) {
  assert.equal(exportedPlaceholder(value), movedPlaceholder(value), String(value));
}
assert.equal(movedPlaceholder('A real sentence.'), false);

// SCN-005: attention rules and precedence.
{
  const cases = [
    ['history-run', { lifecycle: 'completed', decision: 'completed' }, 'none'],
    ['block-run', { decision: 'block' }, 'blocked'],
    ['blocked-result-run', { gate: 'QA', artefacts: [['QA', '`blocked`']] }, 'blocked'],
    ['revise-run', { decision: '`revise`' }, 'clarification_required'],
    ['decline-run', { decision: 'decline' }, 'clarification_required'],
    ['revise-result-run', { gate: 'QA', artefacts: [['QA', 'revise']] }, 'clarification_required'],
    ['quick-cr-run', { gate: 'Quick Task Execution', artefacts: [['CR', 'revise']] }, 'clarification_required'],
    ['reject-run', { gate: 'SD', known: 'reject recorded for current SD material.' }, 'clarification_required'],
    ['change-run', { gate: 'SD', known: 'request_change recorded for current SD material.' }, 'clarification_required'],
    ['other-gate-change-run', { gate: 'TP', known: 'request_change recorded for current SD material.' }, 'in_progress'],
    ['approval-run', { gate: 'QA', missing: 'Exact Approval: QA.' }, 'decision_required'],
    ['pending-run', { decision: 'pending' }, 'decision_required'],
    ['uat-run', { decision: 'awaiting_uat' }, 'decision_required'],
    ['revise-and-approval-run', { decision: 'revise', missing: 'Exact Approval: UR.' }, 'clarification_required'],
    ['progress-run', { decision: 'in_progress' }, 'in_progress'],
    ['pass-run', { decision: 'pass' }, 'in_progress'],
    ['qa-approved-run', { decision: 'qa_approved' }, 'in_progress'],
    ['active-completed-run', { decision: 'completed' }, 'in_progress'],
    ['odd-run', { decision: 'mystery' }, 'unclear'],
    ['negated-approval-run', { missing: 'No Approval: UR is needed; later evidence remains.' }, 'in_progress'],
  ];
  const inventory = buildRunInventory([...cases.map(([id, options]) => source(id, options)),
    { run_id: 'invalid-run', text: runText('invalid-run'), findings: [{ code: 'AGDF_RUN_SEAL_INVALID' }] }]);
  for (const [id, , expected] of cases) assert.equal(entryOf(inventory, id).attention.code, expected, id);
  assert.equal(entryOf(inventory, 'invalid-run').attention.code, 'blocked');
  assert.equal(runAttention({ lifecycle: 'active', valid: true, decision: 'block', gateResult: 'revise', presentationDecision: true, missing: 'Exact Approval: UR.' }), 'blocked');
}

// SCN-006: last activity from receipts, approval dates or nothing; never updated_at.
{
  const inventory = buildRunInventory([
    source('receipt-run', { approvals: [['UR', '2026-10-25']], runOps: [{ created_at: '2026-10-02T08:00:00.000Z' }],
      approvalOps: [{ created_at: '2026-10-03T07:00:00.000Z' }, { created_at: 'not a time' }] }),
    source('approval-run', { approvals: [['UR', '2026-10-01'], ['PRD', '2026-10-04']] }),
    source('bare-run', {}),
    source('no-updated-run', { updatedAt: null }),
    { run_id: 'garbled-run', text: runText('garbled-run', { approvals: [['UR', '2026-10-05']], runOps: [{ created_at: '2026-10-09T00:00:00.000Z' }] })
      .replace(cell({ created_at: '2026-10-09T00:00:00.000Z' }), '%%%notbase64'), findings: [] },
  ]);
  assert.deepEqual(entryOf(inventory, 'receipt-run').last_activity, { at: '2026-10-03T07:00:00.000Z', source: 'receipt', precision: 'time' });
  assert.deepEqual(entryOf(inventory, 'approval-run').last_activity, { at: '2026-10-04T00:00:00.000Z', source: 'approval', precision: 'day' });
  assert.deepEqual(entryOf(inventory, 'bare-run').last_activity, { at: null, source: 'none', precision: null });
  assert.deepEqual(entryOf(inventory, 'no-updated-run').last_activity, { at: null, source: 'none', precision: null });
  assert.deepEqual(entryOf(inventory, 'garbled-run').last_activity, { at: '2026-10-05T00:00:00.000Z', source: 'approval', precision: 'day' });
  assert.ok(inventory.runs.every(run => run.last_activity.at !== '2026-09-30T08:31:00.000Z'));
}

// SCN-007: total order and counts, independent of input order.
{
  const sources = [
    source('old-progress', { approvals: [['UR', '2026-10-01']] }),
    source('new-progress', { runOps: [{ created_at: '2026-10-10T00:00:01.000Z' }] }),
    source('same-day-progress', { approvals: [['UR', '2026-10-10']] }),
    source('unknown-progress', {}),
    source('decision-b', { missing: 'Exact Approval: UR.' }),
    source('decision-a', { missing: 'Exact Approval: UR.' }),
    source('clarify', { decision: 'revise' }),
    source('stuck', { decision: 'block' }),
    source('odd', { decision: 'mystery' }),
    source('abandoned-run', { lifecycle: 'abandoned' }),
    source('superseded-run', { lifecycle: 'superseded' }),
    source('completed-new', { lifecycle: 'completed', runOps: [{ created_at: '2026-10-28T00:00:00.000Z' }] }),
    source('completed-old', { lifecycle: 'completed', runOps: [{ created_at: '2026-10-01T00:00:00.000Z' }] }),
  ];
  const expected = ['decision-a', 'decision-b', 'clarify', 'stuck', 'new-progress', 'same-day-progress', 'old-progress', 'unknown-progress', 'odd',
    'completed-new', 'completed-old', 'superseded-run', 'abandoned-run'];
  const first = buildRunInventory(sources), second = buildRunInventory([...sources].reverse());
  assert.deepEqual(first.runs.map(run => run.run_id), expected);
  assert.deepEqual(second, first);
  assert.deepEqual(first.counts, { total: 13, lifecycle: { active: 9, completed: 2, superseded: 1, abandoned: 1, invalid: 0 },
    attention: { decision_required: 2, clarification_required: 1, blocked: 1, in_progress: 4, unclear: 1, none: 4 } });
}

// SCN-008: discovery-backed reader; faulty runs never abort the inventory.
{
  const base = mkdtempSync(join(tmpdir(), 'agdf-run-inventory-'));
  try {
    const absent = join(base, 'absent'); mkdirSync(absent);
    assert.deepEqual(readRunInventory(absent), buildRunInventory(null));
    assert.equal(readRunInventory(absent).state, 'absent');
    const repo = join(base, 'repo'), runs = join(repo, '.agdf', 'control', 'runs');
    const write = (id, text) => { mkdirSync(join(runs, id), { recursive: true }); if (text !== undefined) writeFileSync(join(runs, id, 'RUN_STATE.md'), text); };
    write('good-run', runText('good-run'));
    write('clean-check', runText('clean-check'));
    const clean = readRunInventory(repo);
    assert.equal(clean.state, 'complete');
    assert.ok(clean.runs.every(run => run.valid && run.title.startsWith('Outcome of')));
    write('missing-run');
    write('pending-run', runText('pending-run')); writeFileSync(join(runs, 'pending-run', 'RUN_STEP_PENDING.json'), '{}');
    write('bad-meta-run', '# AGDF Run State\n\n## Run Meta\n\n- run_id: other\n');
    const inventory = readRunInventory(repo, { language: 'de' });
    assert.equal(inventory.state, 'incomplete');
    assert.equal(inventory.counts.total, 5);
    assert.equal(inventory.counts.lifecycle.invalid, 3);
    for (const id of ['missing-run', 'pending-run', 'bad-meta-run']) {
      const entry = entryOf(inventory, id);
      assert.equal(entry.valid, false, id);
      assert.equal(entry.attention.code, 'blocked', id);
      assert.ok(entry.findings.length && entry.findings.every(finding => finding.next_step === `Den Run mit doctor --run ${id} prüfen.`), id);
    }
    assert.deepEqual(entryOf(inventory, 'missing-run').findings.map(finding => finding.code), ['AGDF_RUN_PATH_INVALID'], 'CR-F04: one finding per cause');
    assert.deepEqual(inventory.findings, []);
    // CR-F04: a runs path that is a file is a store-level finding, not a run entry.
    const fileStore = join(base, 'file-store'); mkdirSync(join(fileStore, '.agdf', 'control'), { recursive: true });
    writeFileSync(join(fileStore, '.agdf', 'control', 'runs'), 'not a directory');
    const storeInventory = readRunInventory(fileStore);
    assert.equal(storeInventory.state, 'incomplete');
    assert.deepEqual(storeInventory.runs, []);
    assert.deepEqual(storeInventory.findings.map(finding => finding.code), ['AGDF_RUN_PATH_INVALID']);
    assert.equal(entryOf(inventory, 'pending-run').findings[0].code, 'AGDF_RUN_STEP_RECOVERY_REQUIRED');
    assert.ok(entryOf(inventory, 'bad-meta-run').findings.some(finding => finding.code === 'AGDF_RUN_PATH_MISMATCH'));
    assert.equal(buildRunInventory([source('fine-run')]).state, 'complete');
    assert.equal(buildRunInventory([]).state, 'complete');
  } finally { rmSync(base, { recursive: true, force: true }); }
}

// SCN-009: no `node:` import in the import chain, no clock or process access, deterministic.
{
  const seen = new Set();
  const walk = file => {
    if (seen.has(file)) return; seen.add(file);
    const text = readFileSync(file, 'utf8');
    for (const [, specifier] of text.matchAll(/^\s*(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]/gmu)) {
      assert.ok(!specifier.startsWith('node:') && specifier.startsWith('.'), `${file} imports ${specifier}`);
      walk(resolve(dirname(file), specifier));
    }
    assert.doesNotMatch(text, /\bprocess\.|Date\.now\(|new Date\(\)|\brequire\(|\bimport\(/u, file);
  };
  walk(join(libRoot, 'control-state', 'run-inventory.js'));
  assert.equal(seen.size, 4, [...seen].join(', '));
  const input = [source('a-run', { missing: 'Exact Approval: UR.' }), source('b-run', { lifecycle: 'completed' })];
  assert.deepEqual(buildRunInventory(input, { language: 'de' }), buildRunInventory(input, { language: 'de' }));
}

// SCN-010: codes, labels and basis in both languages; no person named.
{
  const input = [source('d-run', { missing: 'Exact Approval: UR.', revision: 7 }), source('c-run', { decision: 'revise' }), source('b-run', { decision: 'block' }),
    source('p-run', {}), source('u-run', { decision: 'mystery' })];
  const german = buildRunInventory(input, { language: 'de' }), english = buildRunInventory(input, { language: 'en' }), french = buildRunInventory(input, { language: 'fr' });
  assert.deepEqual(german.runs.map(run => run.attention.label), ['Entscheidung erforderlich', 'Klärung erforderlich', 'blockiert', 'in Arbeit', 'unklar']);
  assert.deepEqual(english.runs.map(run => run.attention.label), ['Decision required', 'Clarification required', 'Blocked', 'In progress', 'Unclear']);
  assert.deepEqual(french.runs.map(run => run.attention.label), english.runs.map(run => run.attention.label));
  assert.equal(german.runs[0].basis, 'Gespeicherter Stand der Revision 7, keine Live-Bewertung.');
  assert.equal(english.runs[0].basis, 'Stored state at revision 7, not a live evaluation.');
  assert.equal(runInventoryLabel('none', 'de-DE'), 'Historie');
  for (const run of [...german.runs, ...english.runs]) assert.doesNotMatch(run.attention.label, /\b(?:my|mine|your)\b|Meine|deine/iu);
}

console.log('Run inventory module, reader, order, labels and purity tests passed.');
