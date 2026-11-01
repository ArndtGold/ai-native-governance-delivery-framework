// The existing Quick closeout scenario exercised through the shipped MCP entrypoint.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { artefactFileDigest, runSealState } from '../../core/lib/control-state/run-seal.js';
import { parseRunState } from '../../core/lib/control-state/run-state-parser.js';
import { resolveControlCommandTarget } from '../../core/lib/control-state/approval-command-contract.js';
import { closeoutConfirmation } from '../../core/lib/control-evaluation/closeout-readiness.js';
import { evaluateGateCheck } from '../../core/lib/control-evaluation/gate-check.js';

for (const modern of [false, true]) {
const fixture = createOwnedRuntimeFixture({ controlRuns: [] }), root = fixture.governanceTarget;
try {
  const legacyPath = join(root, '.agdf/control/MASTER_BACKLOG.md'), legacyBefore = readFileSync(legacyPath, 'utf8');
  await withStdioClient({ ...fixture, modern }, async client => {
  const service = async (name, input) => { const result = await client.callTool({ name, arguments: input }); assert.ok(result.structuredContent, JSON.stringify(result)); return result.structuredContent; };
  const target = resolveControlCommandTarget(root).target_id;
  const creation = { schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: target, operation_id: randomUUID(), assurance: 'cooperative_local', command: { kind: 'run.create', payload: { title: 'Synthetic single function subtraction' } } };
  const created = await service('agdf_run', creation); assert.equal(created.outcome, 'accepted', JSON.stringify(created));
  const run = created.binding.run_id, prefix = `.agdf/control/artefacts/${run}/`, path = join(root, `.agdf/control/runs/${run}/RUN_STATE.md`);
  assert.equal((await service('agdf_run', creation)).outcome, 'already_applied');
  const observedCreation = await service('agdf_inspect', { operation: 'operation-status', module: creation.operation_id,
    presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target' });
  assert.equal(observedCreation.report.status, 'recorded');

  const revision = () => parseRunState(readFileSync(path, 'utf8'), run).meta.revision_id;
  const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: target, run_id: run, expected_revision_id: revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
  const source = async (name, content) => {
    const slot = ({ UR_CANDIDATE: 'UR', BROWNFIELD_CANDIDATE: 'Brownfield Review', CR_CANDIDATE: 'CR', OR_CANDIDATE: 'OR' })[name.replace('.md', '')];
    const stage = async payload => { const result = await service('agdf_record', { ...bound(), command: { kind: 'material.stage', payload } });
      assert.equal(result.outcome, 'accepted', JSON.stringify(result)); return result.family_result; };
    const bytes = Buffer.from(content), begun = await stage({ action: 'begin', files: [{ slot, bytes: bytes.length }] });
    for (let offset = 0; offset < bytes.length; offset += 16384) await stage({ action: 'append', transfer_id: begun.transfer_id,
      file: 0, offset, data: bytes.subarray(offset, offset + 16384).toString('base64') });
    return (await stage({ action: 'seal', transfer_id: begun.transfer_id })).files[0].reference;
  };
  const record = async payload => { const result = await service('agdf_record', { ...bound(), command: { kind: 'step.record', payload } }); assert.equal(result.outcome, 'accepted', JSON.stringify(result)); return result; };
  await record({ step: 'ur', title: 'Synthetic single function subtraction', source: await source('UR_CANDIDATE.md', '# UR: Synthetic subtraction\n\n## Problem\nA bounded numeric operation is missing.\n## Goal\nProvide the operation with a regression.\n## Scope\nOne function and its direct test.\n\n## AGDF Approval Summary (en; source=en)\n- Problem: A bounded subtraction operation is missing.\n- Goal: Provide the operation with its regression.\n- Scope: One function and its test.\n') });
  await record({ step: 'route', route: 'quick_task', reason: 'One bounded function and regression; no public policy or contract impact.', source: await source('BROWNFIELD_CANDIDATE.md', '# Brownfield Review\nSynthetic disposable single-function scope.\n') });
  const prepared = await service('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate: 'UR' } } });
  assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
  const discovered = await service('agdf_inspect', { operation: 'operation-contract', module: 'agdf_prepare/presentation.prepare',
    presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    run_id: run, expected_revision_id: revision(), gate: 'UR' });
  assert.equal(discovered.report.presentation_catalog.state, 'unique', JSON.stringify(discovered));
  const selected = discovered.report.presentation_catalog.candidates[0];
  assert.equal(selected.presentation_id, prepared.family_result.presentation_id);
  const document = await service('agdf_inspect', selected.read_arguments);
  assert.equal(document.report.complete, true);
  assert.equal(document.report.content, readFileSync(join(root, `.agdf/control/runs/${run}/presentations/${selected.presentation_id}.document`), 'utf8'));
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
  let orText = `# OR-lite: Synthetic subtraction\nReport mode: OR-lite\nRun: ${run}\n\n## Result\nSynthetic subtraction and direct regression complete.\n## Evidence\nDisposable test result recorded.\n## Risk\nnone\n## Next Step\nOptional explicitly requested VCS handoff.\n`;
  const request = async () => { const or = await source('OR_CANDIDATE.md', orText);
    const input = { ...bound(), command: { kind: 'closeout.record', payload: { or, confirmation: '' } } };
    input.command.payload.confirmation = closeoutConfirmation(run, input.expected_revision_id, input.operation_id, or.digest); return input; };
  const before = readFileSync(path, 'utf8');
  assert.equal((await service('agdf_closeout', await request())).reason, 'closeout_obligations_unfulfilled');
  assert.equal(readFileSync(path, 'utf8'), before);
  await record({ step: 'review', decision: 'pass', source: await source('CR_CANDIDATE.md', '# Code Review\n- decision: pass\nSynthetic bounded diff and its direct regression reviewed.\n') });
  assert.equal((await dispatch()).continuation?.phase, 'compact_closeout');
  const authoringArgs = { operation: 'authoring-inputs', presentation_language: 'en', working_directory: root,
    primary_target: root, target_source: 'continued_target', run_id: run, expected_revision_id: revision() };
  let inputs = (await service('agdf_inspect', authoringArgs)).report;
  assert.equal(inputs.available, true, JSON.stringify(inputs));
  assert.equal(inputs.gate, 'Quick Task Execution');
  assert.equal(inputs.authoring_owner, 'OR');
  assert.equal(inputs.chunk.type, 'OR');
  assert.equal(inputs.chunk.role, 'template');
  assert.match(inputs.chunk.content, /^# OR:/u);
  assert.equal(inputs.formats.group, 'agdf_closeout');
  assert.equal(inputs.formats.kind, 'closeout.record');
  const format = inputs.formats.authoring_format.quick_task;
  assert.deepEqual(format.required_sections, ['Result', 'Evidence', 'Risk', 'Next Step']);
  assert.deepEqual(format.required_metadata.map(row => row.label), ['Run', 'Report mode']);
  while (!inputs.complete) {
    inputs = (await service('agdf_inspect', { ...authoringArgs, cursor: inputs.next_cursor })).report;
    assert.equal(inputs.available, true, JSON.stringify(inputs));
  }
  // Author the successful closeout from public discovery, not private format knowledge.
  orText = `# OR-lite: Synthetic subtraction\n${format.required_metadata.map(row => `${row.label}: ${row.field === 'run_id' ? run : format.report_mode}`).join('\n')}\n\n${format.required_sections.map(section => `## ${section}\n${section === 'Risk' ? 'none' : 'Synthetic bounded result and direct evidence.'}\n`).join('\n')}`;
  const input = await request(), result = await service('agdf_closeout', input);
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(result.current.lifecycle, 'completed'); assert.equal(result.current.completion.fulfilled, true);
  assert.equal(result.current.next_operation, null); assert.equal(result.current.gate, 'OR');
  assert.equal((await service('agdf_closeout', input)).outcome, 'already_applied');
  const saved = readFileSync(path, 'utf8'); assert.equal(runSealState(root, saved).status, 'valid');
  assert.equal(evaluateGateCheck(root, { runId: run }).completion.fulfilled, true);
  const completed = await dispatch(); assert.equal(completed.terminal, true);
  assert.equal(completed.control.next_operation, null);
  assert.equal(readFileSync(legacyPath, 'utf8'), legacyBefore, 'the whole typed Run lifecycle preserves optional legacy bytes');
  console.log('Actual default-entrypoint STDIO Quick command chain, mandatory CR, exact OR-lite confirmation, receipt replay and completion with unchanged optional legacy backlog passed. No VCS command executed.');
  });
} finally { fixture.dispose(); }
}
