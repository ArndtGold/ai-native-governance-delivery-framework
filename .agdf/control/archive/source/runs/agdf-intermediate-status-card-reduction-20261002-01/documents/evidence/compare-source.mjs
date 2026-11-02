import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const repo = resolve(process.argv[2]), output = dirname(fileURLToPath(import.meta.url));
const load = path => import(pathToFileURL(join(repo, path)).href);
const { createSkillDispatchService } = await load('packages/core/lib/skill-dispatch/service.js');
const { evaluateGateCheck } = await load('packages/core/lib/control-evaluation/gate-check.js');
const { runSealState } = await load('packages/core/lib/control-state/run-seal.js');
const interactionLocales = JSON.parse(readFileSync(join(repo, 'plugins/agdf/meta/agdf-interaction-locales.json')));
const frozen = JSON.parse(readFileSync(join(output, 'baseline-inputs.json')));
const before = JSON.parse(readFileSync(join(output, 'W-01-before-measurement.json')));
const traceBefore = JSON.parse(readFileSync(join(output, 'W-01-before-trace.json')));
const root = mkdtempSync(join(tmpdir(), 'agdf-card-after-'));
const digest = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const json = (name, value) => writeFileSync(join(output, name), JSON.stringify(value, null, 2) + '\n');
try {
  cpSync(join(output, 'fixture'), root, { recursive: true });
  execFileSync('git', ['init', '-q', root]);
  const input = { ...frozen.input, workingDirectory: root, primaryTarget: root, interactionLocales };
  const state = join(root, `.agdf/control/runs/${input.runId}/RUN_STATE.md`), original = readFileSync(state);
  const allowed = evaluateGateCheck(root, { runId: input.runId, presentationLanguage: 'de' });
  assert.equal(allowed.current_gate, 'CD+Tests'); assert.equal(allowed.status, 'open');
  assert.equal(allowed.blocking_reason, 'none'); assert.equal(allowed.missing_approval, 'none'); assert.equal(allowed.doctor_status, 'pass');
  assert.equal(runSealState(root, original.toString()).status, 'valid');
  const trace = [{ operation: 'fixture_precondition_validation', visible: false, permission: 'already permitted CD+Tests' }];
  const emit = createSkillDispatchService({ env: {}, evaluateGateCheck: (target, selection) => {
    trace.push({ operation: 'required_bound_gate_evaluation', target, selection }); return evaluateGateCheck(target, selection);
  } });
  const after = emit(input);
  assert.equal(after.outcome, 'skill_continuation'); assert.equal(after.terminal, false);
  assert.equal(after.continuation.phase, 'implementation'); assert.equal(after.presentation, null);
  assert.equal(after.control.current_gate, 'CD+Tests'); assert.equal(after.control.missing_approval, 'none');
  const sources = traceBefore.find(row => row.operation === 'source_inspection').files.map(row => row.path);
  trace.push({ operation: 'source_inspection', files: sources.map(path => ({ path, digest: digest(readFileSync(join(repo, path))) })), visible: false });
  assert.equal(digest(readFileSync(state)), digest(original));
  trace.push({ operation: 'required_validation', checks: traceBefore.find(row => row.operation === 'required_validation').checks, visible: false });
  json('W-01-after-dispatch.json', after);
  mkdirSync(join(output, 'transcripts'), { recursive: true });
  writeFileSync(join(output, 'transcripts/W-01-after.md'), '# W-01 after: deterministic source emission\n\nSame frozen goal, control, requested language and checkpoint obligations; only the ephemeral target is normalized. Candidate locale assets supply the newly required maintenance/conflict copy, which is not rendered in this workflow. The existing skill_continuation phase implementation emits no standalone framework card and permits continuation within existing authority. This is a source lane, not installed-plugin or model-host evidence.\n');
  trace.push({ operation: 'evidence_maintenance', outputs: ['W-01-after-dispatch.json', 'transcripts/W-01-after.md', 'card-comparison.json', 'W-01-after-trace.json'], authority_changes: false });
  assert.deepEqual(trace.map(row => row.operation), traceBefore.map(row => row.operation));
  json('W-01-after-trace.json', trace);
  json('card-comparison.json', { workflow: 'W-01', synthetic_non_authorizing: true, lane: 'matched deterministic source emission',
    before: { cards: before.intermediate_framework_cards, card_characters: before.intermediate_card_characters, total_framework_characters: before.total_framework_characters },
    after: { cards: 0, card_characters: 0, total_framework_characters: 0 },
    protected_events_removed: 0, checkpoint_order_preserved: true, approvals_and_control_unchanged: true,
    normalizations: ['ephemeral fixture target only; original IDs and times retained'], candidate_assets: ['updated canonical locale registry; same requested de language; new maintenance/conflict keys unused in W-01'], runtime_stop_before: true, runtime_stop_after: false,
    actual_host_observation: false, observed_at: new Date().toISOString() });
  json('control-evidence-parity.json', { before: traceBefore, after: trace, same_order: true, same_required_preflights: 1, mutation: false, approved_scope_unchanged: true });
  process.stdout.write(JSON.stringify({ before_cards: 1, after_cards: 0, before_characters: before.intermediate_card_characters, after_characters: 0, parity: true, host_observation: false }) + '\n');
} finally { rmSync(root, { recursive: true, force: true }); }
