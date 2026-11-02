// T-001 source-emission capture. Isolated synthetic approvals have no live authority.
// Run with the unchanged repository path as the only argument, before production edits.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(process.argv[2]);
const output = dirname(fileURLToPath(import.meta.url));
const id = 'agdf-intermediate-status-card-reduction-20261002-01';
const source = path => import(pathToFileURL(join(repo, path)).href);
const { evaluateGateCheck } = await source('packages/core/lib/control-evaluation/gate-check.js');
const { evaluateDoctor } = await source('packages/core/lib/control-evaluation/doctor.js');
const { createSkillDispatchService } = await source('packages/core/lib/skill-dispatch/service.js');
const { sealRunState, runSealState } = await source('packages/core/lib/control-state/run-seal.js');
const { interactionLocales, pluginDefinition } = await source('packages/cli/lib/runtime/control-context.js');
const digest = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const json = (name, value) => writeFileSync(join(output, name), JSON.stringify(value, null, 2) + '\n');
const root = mkdtempSync(join(tmpdir(), 'agdf-card-before-'));
const runRel = `.agdf/control/runs/${id}/RUN_STATE.md`;
const artefactRel = `.agdf/control/artefacts/${id}`;
const fixture = join(output, 'fixture');
assert.equal(existsSync(fixture), false, 'freeze once; do not overwrite a recorded before fixture');
try {
  execFileSync('git', ['init', '-q', root]);
  execFileSync(process.execPath, [join(repo, 'packages/cli/bin/create-agdf.js'), 'init', '--dir', root, '--language', 'en'], { stdio: 'pipe' });
  rmSync(join(root, '.agdf/control/AGDF_RUN.md'), { force: true });
  execFileSync(process.execPath, [join(repo, 'packages/cli/bin/create-agdf.js'), 'run-create', '--dir', root, '--run', id], { stdio: 'pipe' });
  // Finalize only the isolated scaffold: keep a selected-run backlog pointer and no example node.
  writeFileSync(join(root, '.agdf/control/CONTEXT_GRAPH.md'), '# AGDF Context Graph\n\n## Active Context Nodes\n\nNo durable project knowledge is claimed by this isolated synthetic fixture.\n');
  writeFileSync(join(root, '.agdf/control/MASTER_BACKLOG.md'), `# AGDF Master Backlog\n\n## Active Work\n\n| Priority | Item | State | Evidence | Next step |\n|---|---|---|---|---|\n| 1 | W-01 synthetic non-authorizing source fixture | in_progress | .agdf/control/runs/${id}/RUN_STATE.md | Already permitted source inspection and validation |\n`);
  cpSync(join(repo, artefactRel), join(root, artefactRel), { recursive: true, filter: path => !path.startsWith(join(repo, artefactRel, 'evidence')) });
  mkdirSync(dirname(join(root, runRel)), { recursive: true });
  const original = readFileSync(join(repo, runRel), 'utf8');
  assert.match(original, /\| Brownfield Analysis \|[^\n]+\| done \|/u);
  const synthetic = original.replace('## Objective\n\nDescribe the trustworthy outcome.', '## Objective\n\nSYNTHETIC NON-AUTHORIZING fixture: already permitted W-01 source inspection, required validation and evidence maintenance, with unchanged binding/scope and no new event.');
  writeFileSync(join(root, runRel), sealRunState(root, synthetic));
  const beforeBytes = readFileSync(join(root, runRel));
  const allowed = evaluateGateCheck(root, { runId: id, presentationLanguage: 'de' });
  assert.equal(allowed.current_gate, 'CD+Tests', JSON.stringify({ status: allowed.status, reason: allowed.blocking_reason }));
  assert.equal(allowed.status, 'open');
  assert.equal(allowed.blocking_reason, 'none');
  assert.equal(allowed.missing_approval, 'none');
  const doctor = evaluateDoctor(root, { runId: id });
  if (allowed.doctor_status !== 'pass') {
    json('baseline-attempt-doctor.json', doctor);
    process.stdout.write(JSON.stringify({ baseline_attempt: 'doctor_not_pass', findings: doctor.findings }) + '\n');
  }
  assert.equal(allowed.doctor_status, 'pass');
  assert.equal(runSealState(root, beforeBytes.toString()).status, 'valid');
  const trace = [{ operation: 'fixture_precondition_validation', visible: false, permission: 'already permitted CD+Tests' }];
  const dispatch = createSkillDispatchService({ env: {}, evaluateGateCheck: (target, selection) => {
    trace.push({ operation: 'required_bound_gate_evaluation', target, selection });
    return evaluateGateCheck(target, selection);
  } });
  const input = { skillSet: pluginDefinition.skillSet, interactionLocales, expectedVersion: JSON.parse(readFileSync(join(repo, 'packages/core/package.json'), 'utf8')).version, surface: 'codex', skillId: 'gate-check', presentationLanguage: 'de', workingDirectory: root, targetSource: 'continued_target', primaryTarget: root, runId: id, continueDelivery: true };
  // A change consumer is required to dispatch first. Exactly one preflight, no added status call.
  const emitted = dispatch(input);
  if (emitted.outcome !== 'control_result') json('baseline-attempt-dispatch.json', emitted);
  assert.equal(emitted.outcome, 'control_result', JSON.stringify(emitted));
  assert.equal(emitted.terminal, true);
  assert.equal(emitted.control.current_gate, 'CD+Tests');
  assert.equal(emitted.control.missing_approval, 'none');
  assert.equal(emitted.control.blocking_reason, 'none');
  const card = emitted.host_action.text;
  assert.ok(card.length > 0);
  assert.equal(card, allowed.status_presentation.markdown);
  const inspected = ['packages/core/lib/control-evaluation/gate-policy.js', 'packages/core/lib/control-evaluation/delivery-map.js', 'packages/core/lib/skill-dispatch/service.js'];
  trace.push({ operation: 'source_inspection', files: inspected.map(path => ({ path, digest: digest(readFileSync(join(repo, path))) })), visible: false });
  assert.equal(digest(readFileSync(join(root, runRel))), digest(beforeBytes), 'source capture must not change fixture control or approvals');
  trace.push({ operation: 'required_validation', checks: ['existing permission', 'doctor pass', 'valid seal', 'unchanged approvals/control', 'one existing consumer preflight'], visible: false });
  mkdirSync(join(output, 'transcripts'), { recursive: true });
  writeFileSync(join(output, 'transcripts/W-01-before.md'), '# W-01 before: deterministic source emission\n\nSynthetic non-authorizing fixture; source lane only. Start state already permits CD+Tests. This is the existing dispatch-first change consumer, exactly one preflight. No new decision, blocker, uncertainty, scope/binding change or significant intermediate result. The live Brownfield-to-CD+Tests transition is excluded. Terminal emission blocks the remaining workflow in the existing implementation; inspection/validation below are independent read-only evidence, not a claim that an agent ignored that stop.\n\n## Emitted intermediate framework card\n\n' + card + '\n');
  json('W-01-before-dispatch.json', emitted);
  trace.push({ operation: 'evidence_maintenance', outputs: ['W-01-before-dispatch.json', 'transcripts/W-01-before.md', 'W-01-before-measurement.json', 'W-01-before-trace.json'], authority_changes: false });
  json('W-01-before-trace.json', trace);
  json('W-01-before-measurement.json', { scenario: 'SCN-002', workflow: 'W-01', lane: 'deterministic source emission from existing dispatch-first change consumer', eligible_positive_baseline: true, intermediate_framework_cards: 1, intermediate_card_characters: [...card].length, total_framework_characters: [...card].length, protected_event_cards: 0, brief_progress_characters: 0, host_tool_block_characters: 0, checkpoint_preflight_count: 1, actual_host_observation: false, runtime_stop_observed: true, emitted_at: new Date().toISOString(), fixture_target: root, fixture_run: id });
  // Preserve the complete isolated input scaffold without a nested Git repository.
  cpSync(root, fixture, { recursive: true, filter: path => !path.startsWith(join(root, '.git')) });
  json('baseline-inputs.json', { schema_version: 1, synthetic_non_authorizing: true, original_ephemeral_target: root, preserved_fixture: 'fixture', input, goal: 'Already permitted W-01 source inspection, required validation and evidence maintenance without a new visible event', normalize_only: ['ephemeral fixture absolute target path', 'irrelevant timestamps/revision identities, retaining originals'], protected_transition_excluded: 'live Brownfield Analysis to CD+Tests', unchanged_checkpoint_order: trace.map(row => row.operation) });
  const paths = [...new Set(execFileSync('git', ['ls-files', '-c', '-o', '--exclude-standard', '-z'], { cwd: repo, encoding: 'utf8' }).split('\0').filter(Boolean))].sort();
  const files = paths.map(path => {
    const absolute = join(repo, path);
    if (!existsSync(absolute)) return { path, state: 'deleted' };
    const stat = lstatSync(absolute);
    return { path, state: stat.isSymbolicLink() ? 'symlink' : 'file', digest: digest(stat.isSymbolicLink() ? readlinkSync(absolute) : readFileSync(absolute)) };
  });
  const approved = Object.fromEntries(['UR', 'PRD', 'SD', 'TP'].map(gate => [gate, digest(readFileSync(join(repo, artefactRel, `${gate}.md`)))]));
  const installed = '/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-ba2230d3a7db';
  const installedInputs = ['runtime/agdf-local.js', 'skills/gate-check/SKILL.md', 'skills/brownfield-analysis/SKILL.md', 'meta/contracts/interaction.md'].map(path => ({ path: join(installed, path), digest: digest(readFileSync(join(installed, path))) }));
  json('baseline-manifest.json', { frozen_at: new Date().toISOString(), head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), git_status: execFileSync('git', ['status', '--porcelain=v1'], { cwd: repo, encoding: 'utf8' }), files, snapshot_digest: digest(JSON.stringify(files)), approved_artefacts: approved, node: { executable: process.execPath, version: process.version }, installed_inputs: installedInputs, installed_version: '0.14.5+codex.local-ba2230d3a7db', installed_runtime_provenance_digest: '6e9a51a51c94e1e80cf6f533e9332f484acf9993d4f5c74dd844a4ac0909e3e7', exclusions: ['manifest itself and later analysis/measurement outputs cannot self-hash; no production source is excluded', 'Git ignored build dependencies are not source inventory; selected installed runtime/instruction inputs are separately hashed'], separate_preexisting_delta: ['plugins/agdf/hooks/hooks.json deletion', 'plugins/agdf/hooks/session-start.sh deletion'], actual_host_observation: false });
  process.stdout.write(JSON.stringify({ eligible_positive_baseline: true, cards: 1, characters: [...card].length, doctor: allowed.doctor_status, gate: allowed.current_gate, files: files.length, synthetic_non_authorizing: true, actual_host_observation: false }) + '\n');
} finally {
  rmSync(root, { recursive: true, force: true });
}
