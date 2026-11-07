// Representative run fixtures for the companion core (TP T-001, Planning Decisions: fixture set).
// Every fixture lives in its own disposable Git repository and is built through the actual current
// Core commands; approvals here are synthetic test prerequisites, never human acceptance.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { appendFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { currentFixture, currentRun } from './current-run.js';
import { structuredCloseout } from './current-closeout.js';
import { withSyntheticQaContent } from './decision-content.js';
import { clarifiedUr } from '../planned-fixtures.js';
import { syntheticPrd } from '../../../cli/scripts/fixtures/prd-definition.js';
import { syntheticSd } from '../../../cli/scripts/fixtures/sd-definition.js';
import { syntheticTp } from '../../../cli/scripts/fixtures/tp-definition.js';
import { closeoutConfirmation } from '../../lib/control-evaluation/closeout-readiness.js';

const accepted = value => { assert.equal(value.outcome, 'accepted', JSON.stringify(value)); return value; };
// A real archived control_state_version 2 run of this repository (no test loader exists for the
// frozen 0.20.2 archive, Brownfield Analysis finding).
export const LEGACY_V2_RUN_ID = 'agdf-surface-parity-fix';
export const legacyV2RunState = () => readFileSync(new URL('./companion/legacy-v2-run-state.md', import.meta.url), 'utf8');
// Larger than the companion's and the cockpit's per-run read bound of 1 MiB.
export const OVERSIZED_BYTES = 1024 * 1024 + 4096;

const runDir = (root, id) => join(root, '.agdf', 'control', 'runs', id);
const runStatePath = (root, id) => join(runDir(root, id), 'RUN_STATE.md');
const route = (run, decision, ux = 'no') => accepted(run.step('route',
  `# Brownfield Review\n\nExisting personal filter service owns the values.\n- ux_intent_definition_required: ${ux}\n`,
  { route: decision, reason: 'Synthetic companion fixture prerequisite' }));
const urApproved = run => { accepted(run.step('ur', clarifiedUr, { title: 'Synthetic saved filter' })); accepted(run.approve('UR')); };
function placeLegacy(root) {
  mkdirSync(runDir(root, LEGACY_V2_RUN_ID), { recursive: true });
  writeFileSync(runStatePath(root, LEGACY_V2_RUN_ID), legacyV2RunState());
}
function structuredToQa(run) {
  urApproved(run); route(run, 'structured_delivery');
  for (const [gate, text] of [['PRD', syntheticPrd()], ['SD', syntheticSd()], ['TP', syntheticTp()]]) { accepted(run.record(gate, text)); accepted(run.approve(gate)); }
  accepted(run.step('internal', '# Brownfield Analysis\n\nDecision: pass\n\nExisting store and isolated test owner confirmed.\n', { internal_step: 'Brownfield Analysis', decision: 'pass' }));
  accepted(run.step('internal', '# CD+Tests\n\nDecision: pass\n\nSynthetic filter values compared in this disposable test.\n', { internal_step: 'CD+Tests', decision: 'pass' }));
  for (const type of ['TP Review', 'Clean Implementation Review', 'CR'])
    accepted(run.step('internal', `# ${type}\n\nDecision: pass\n\nSynthetic fixture checks meet the declared local scope.\n`, { internal_step: type, decision: 'pass' }));
}
function closeout(run, text) {
  const operation_id = randomUUID(), binding = run.binding(), or = run.f.material(binding, 'OR', text);
  accepted(run.f.call('closeout.record', { or, confirmation: closeoutConfirmation(run.id, binding.expected_revision_id, operation_id, or.digest) }, { ...binding, operation_id }));
}

// Each builder returns the subject run of its fixture; store-level fixtures name the run whose
// status card is captured.
const BUILDERS = Object.freeze({
  F01: { name: 'open UR without artefact', build: f => currentRun(f).id },
  F02: { name: 'ready UR draft awaiting approval', build: f => {
    const run = currentRun(f); accepted(run.step('ur', clarifiedUr, { title: 'Synthetic saved filter' })); return run.id; } },
  F03: { name: 'PRD gate with draft', build: f => {
    const run = currentRun(f); urApproved(run); route(run, 'structured_delivery'); accepted(run.record('PRD', syntheticPrd())); return run.id; } },
  F04: { name: 'pending structured internal step (Brownfield Review after approved UR)', build: f => {
    const run = currentRun(f); urApproved(run); return run.id; } },
  F05: { name: 'TP gate with draft', build: f => {
    const run = currentRun(f); urApproved(run); route(run, 'structured_delivery');
    for (const [gate, text] of [['PRD', syntheticPrd()], ['SD', syntheticSd()]]) { accepted(run.record(gate, text)); accepted(run.approve(gate)); }
    accepted(run.record('TP', syntheticTp())); return run.id; } },
  F06: { name: 'completed quick_task', build: f => {
    const run = currentRun(f); urApproved(run); route(run, 'quick_task');
    accepted(run.step('review', '# Code Review\nStatus: pass\n- decision: pass\nSynthetic bounded diff and its direct regression reviewed.\n', { decision: 'pass' }));
    closeout(run, `# OR-lite: Synthetic saved filter\nRun: ${run.id}\nReport mode: OR-lite\n\n## Result\nSynthetic bounded outcome and evidence.\n\n## Evidence\nSynthetic bounded outcome and evidence.\n\n## Risk\nnone\n\n## Next Step\nSynthetic bounded outcome and evidence.\n`);
    return run.id; } },
  F07: { name: 'completed structured run', build: f => {
    const run = currentRun(f); structuredToQa(run);
    accepted(run.record('QA', withSyntheticQaContent('# QA Report\n\nDecision: pass\n\n## Evidence\nSynthetic local fixture checks passed.\n')));
    accepted(run.approve('QA')); accepted(run.approve('UAT'));
    closeout(run, structuredCloseout(run)); return run.id; } },
  F08: { name: 'legacy v2 only', build: f => { placeLegacy(f.root); return LEGACY_V2_RUN_ID; } },
  F09: { name: 'unsupported control layout', build: f => {
    const id = currentRun(f).id, config = join(f.root, '.agdf', 'control', 'config.json');
    const parsed = JSON.parse(readFileSync(config, 'utf8')); delete parsed.control_layout;
    writeFileSync(config, `${JSON.stringify(parsed, null, 2)}\n`); return id; } },
  F10: { name: 'mixed current and legacy', build: f => {
    const run = currentRun(f); accepted(run.step('ur', clarifiedUr, { title: 'Synthetic saved filter' })); placeLegacy(f.root); return run.id; } },
  F11: { name: 'invalid RUN_STATE', build: f => {
    const id = currentRun(f).id, path = runStatePath(f.root, id);
    writeFileSync(path, readFileSync(path, 'utf8').replace(/^- control_state_version: 4$/mu, '- control_state_version: four')); return id; } },
  F12: { name: 'oversized RUN_STATE', build: f => {
    const id = currentRun(f).id, path = runStatePath(f.root, id);
    appendFileSync(path, `\n<!-- ${'x'.repeat(OVERSIZED_BYTES)} -->\n`); return id; } },
  F13: { name: 'current run with a doctor finding (broken seal)', build: f => {
    const run = currentRun(f); accepted(run.step('ur', clarifiedUr, { title: 'Synthetic saved filter' }));
    appendFileSync(join(runDir(f.root, run.id), 'documents', 'UR.md'), '\nUnrecorded edit after sealing.\n'); return run.id; } },
});
export const COMPANION_FIXTURE_IDS = Object.freeze(Object.keys(BUILDERS));

// Exact values a fixture introduces that differ per build: the root, every UUID and timestamp
// written below its control folder. Golden normalization replaces only these exact strings.
export function volatileValues(root) {
  const values = new Set([root, root.replaceAll('\\', '/')]);
  const walk = dir => { for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) { walk(path); continue; }
    const text = readFileSync(path, 'utf8');
    for (const match of text.matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/gu)) values.add(match[0]);
  } };
  walk(join(root, '.agdf', 'control'));
  return [...values].filter(Boolean).sort((a, b) => b.length - a.length);
}

// Builds the requested fixtures; `t` supplies after() cleanup like node:test.
export function buildCompanionFixtures(t, ids = COMPANION_FIXTURE_IDS) {
  return ids.map(id => {
    const { name, build } = BUILDERS[id];
    const f = currentFixture(t);
    const runId = build(f);
    return Object.freeze({ id, name, root: f.root, runId });
  });
}
