// The existing Quick closeout scenario exercised through the shipped MCP entrypoint.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync, rmSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
const pluginRoot = '/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf';
const installedCore = pluginRoot + '/runtime/create-agdf/runtime/core/lib';
const proof = new URL('./installed-stdio.jsonl', import.meta.url);
const marker = JSON.parse(readFileSync(pluginRoot + '/.agdf-installation.json', 'utf8'));
appendFileSync(proof, JSON.stringify({ kind: 'installed_identity', marker, native_model_qualified: false }) + '\n');
import { withStdioClient } from '../../../../../packages/mcp-server/test/helpers.js';
const { artefactFileDigest, runSealState } = await import(new URL('file://' + installedCore + '/control-state/run-seal.js'));
const { parseRunState } = await import(new URL('file://' + installedCore + '/control-state/run-state-parser.js'));
const { resolveControlCommandTarget } = await import(new URL('file://' + installedCore + '/control-state/approval-command-contract.js'));
const { closeoutConfirmation } = await import(new URL('file://' + installedCore + '/control-evaluation/closeout-readiness.js'));
const { evaluateGateCheck } = await import(new URL('file://' + installedCore + '/control-evaluation/gate-check.js'));

for (const modern of [false, true]) {
const root = mkdtempSync(join(tmpdir(), 'agdf-installed-compact-'));
const config = JSON.parse(readFileSync(pluginRoot + '/mcp.json', 'utf8')).mcpServers.agdf;
const fixture = { args: config.args, command: process.execPath, cwd: root };
execFileSync('git', ['init', '-q', root]);
// Fixture setup uses repository scaffold CLI; every Run command below uses the installed validator.
execFileSync(process.execPath, ['/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/cli/bin/create-agdf.js', 'init', '--dir', root, '--language', 'en']);
try {
  const cli = pluginRoot + '/runtime/agdf-local.js';
  const run = 'quick-command', prefix = `.agdf/control/artefacts/${run}/`, path = join(root, `.agdf/control/runs/${run}/RUN_STATE.md`);
  execFileSync(process.execPath, [cli, 'run-create', '--dir', root, '--run', run]);
  mkdirSync(join(root, prefix), { recursive: true });
  await withStdioClient({ ...fixture, modern }, async client => {
  const service = async (name, input) => { const result = await client.callTool({ name, arguments: input }); appendFileSync(proof, JSON.stringify({ kind: 'actual_installed_stdio', modern, request: { name, arguments: input }, result, native_model_qualified: false }) + '\n'); assert.ok(result.structuredContent, JSON.stringify(result)); return result.structuredContent; };
  const target = resolveControlCommandTarget(root).target_id;
  const revision = () => parseRunState(readFileSync(path, 'utf8'), run).meta.revision_id;
  const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: target, run_id: run, expected_revision_id: revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
  const source = (name, content) => { const namePath = prefix + name; writeFileSync(join(root, namePath), content); return { path: namePath, digest: artefactFileDigest(root, namePath) }; };
  const record = async payload => { const result = await service('agdf_record', { ...bound(), command: { kind: 'step.record', payload } }); assert.equal(result.outcome, 'accepted', JSON.stringify(result)); return result; };
  await record({ step: 'ur', title: 'Synthetic single function subtraction', source: source('UR_CANDIDATE.md', '# UR: Synthetic subtraction\n\n## Problem\nA bounded numeric operation is missing.\n## Goal\nProvide the operation with a regression.\n## Scope\nOne function and its direct test.\n\n## AGDF Approval Summary (en; source=en)\n- Problem: A bounded subtraction operation is missing.\n- Goal: Provide the operation with its regression.\n- Scope: One function and its test.\n') });
  await record({ step: 'route', route: 'quick_task', reason: 'One bounded function and regression; no public policy or contract impact.', source: source('BROWNFIELD_CANDIDATE.md', '# Brownfield Review\nSynthetic disposable single-function scope.\n') });
  const prepared = await service('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate: 'UR' } } });
  assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
  const pending = await service('agdf_dispatch', { skill_id: 'gate-check', presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'continued_target', run_id: run, continue_delivery: true });
  assert.notEqual(pending.continuation?.phase, 'compact_implementation');
  const approved = await service('agdf_approve', { ...bound(), command: { kind: 'approval.record', payload: { gate: 'UR', presentation_id: prepared.family_result.presentation_id, response: 'Approval: UR' } } });
  assert.equal(approved.outcome, 'accepted', JSON.stringify(approved));
  const dispatch = async (continue_delivery = true) => service('agdf_dispatch', { skill_id: 'gate-check',
    presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'continued_target',
    run_id: run, continue_delivery });
  const statusBytes = readFileSync(path, 'utf8');
  assert.equal((await dispatch(false)).terminal, true);
  assert.equal(readFileSync(path, 'utf8'), statusBytes);
  const implementation = await dispatch();
  assert.equal(implementation.continuation?.phase, 'compact_implementation', JSON.stringify(implementation));
  assert.equal(implementation.continuation.revision_id, revision());
  const cliArgs = ['skill-dispatch', '--skill', 'gate-check', '--language', 'en', '--surface', 'codex',
    '--working-directory', root, '--target-source', 'continued_target', '--primary-target', root, '--run', run, '--continue-delivery', '--json'];
  const cliHandoff = JSON.parse(execFileSync(process.execPath, [cli, ...cliArgs], { encoding: 'utf8' }));
  assert.equal(cliHandoff.continuation.phase, 'compact_implementation');
  appendFileSync(proof, JSON.stringify({ kind: 'actual_installed_cli_quick', result: cliHandoff }) + '\n');
  writeFileSync(join(root, 'subtract.mjs'), 'export const subtract = (a, b) => a - b;\n');
  const check = execFileSync(process.execPath, ['--input-type=module', '-e',
    "import assert from 'node:assert/strict'; import {subtract} from './subtract.mjs'; assert.equal(subtract(9,4),5); assert.equal(subtract(0,4),-4); assert.equal(subtract(-3,-2),-1); console.log('3 subtraction cases passed');"], { cwd: root, encoding: 'utf8' });
  appendFileSync(proof, JSON.stringify({ kind: 'actual_disposable_implementation_check', check, code: readFileSync(join(root, 'subtract.mjs'), 'utf8') }) + '\n');
  const urPath = join(root, prefix + 'UR.md'), urBytes = readFileSync(urPath);
  writeFileSync(urPath, '# Changed approved source\n');
  const refused = await dispatch(); assert.notEqual(refused.continuation?.phase, 'compact_implementation');
  writeFileSync(urPath, urBytes);

  const or = source('OR_CANDIDATE.md', `# OR-lite: Synthetic subtraction\nReport mode: OR-lite\nRun: ${run}\n\n## Result\nSynthetic subtraction and direct regression complete.\n## Evidence\nActual three-case subtraction check passed; actual disposable source reviewed.\n## Risk\nnone\n## Next Step\nOptional explicitly requested VCS handoff.\n`);
  const request = () => { const input = { ...bound(), command: { kind: 'closeout.record', payload: { or, confirmation: '' } } };
    input.command.payload.confirmation = closeoutConfirmation(run, input.expected_revision_id, input.operation_id, or.digest); return input; };
  const before = readFileSync(path, 'utf8');
  assert.equal((await service('agdf_closeout', request())).reason, 'closeout_obligations_unfulfilled');
  assert.equal(readFileSync(path, 'utf8'), before);
  await record({ step: 'review', decision: 'pass', source: source('CR_CANDIDATE.md', '# Code Review\n- decision: pass\nActual subtract.mjs diff and three executed subtraction cases reviewed; no finding.\n') });
  assert.equal((await dispatch()).continuation?.phase, 'compact_closeout');
  const stale = await service('agdf_dispatch', { skill_id: 'gate-check', presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'continued_target', run_id: run, expected_revision_id: implementation.continuation.revision_id, intake: true, intake_mode: 'resume' });
  assert.notEqual(stale.continuation?.phase, 'compact_implementation');
  const input = request(), result = await service('agdf_closeout', input);
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(result.current.lifecycle, 'completed'); assert.equal(result.current.completion.fulfilled, true);
  assert.equal(result.current.next_operation, null); assert.equal(result.current.gate, 'OR');
  assert.equal((await service('agdf_closeout', input)).outcome, 'already_applied');
  const saved = readFileSync(path, 'utf8'); assert.equal(runSealState(root, saved).status, 'valid');
  assert.equal(evaluateGateCheck(root, { runId: run }).completion.fulfilled, true);
  const completed = await dispatch(); assert.equal(completed.terminal, true);
  assert.equal(completed.control.next_operation, null);
  assert.doesNotMatch(readFileSync(join(root, '.agdf/control/MASTER_BACKLOG.md'), 'utf8').split('## Completed / Superseded Pointers')[0], /\| quick-command \|/);
  console.log('Actual default-entrypoint STDIO Quick command chain, mandatory CR, exact OR-lite confirmation, receipt replay and completed/backlog projection passed. No VCS command executed.');
  });
} finally { rmSync(root, { recursive: true, force: true }); }
}
