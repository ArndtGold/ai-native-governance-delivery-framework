// Actual Git and MCP control; synthetic fixture intents, not native qualification.
import assert from 'node:assert/strict';
import { deliveryModeCases } from './fixtures/delivery-mode-cases.js';
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createMcpDeliveryHarness } from './delivery-harness.js';

for (const { modern } of deliveryModeCases(process.argv.slice(2))) {
  const fixture = createOwnedRuntimeFixture({ controlRuns: [] }), root = fixture.governanceTarget;
  try {
    const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
    git(['init', '-q']); git(['config','core.fsmonitor','false']); git(['config','maintenance.auto','false']); git(['config','gc.auto','0']); git(['config', 'user.name', 'Synthetic protocol fixture']); git(['config', 'user.email', 'fixture@example.invalid']);
    writeFileSync(join(root, 'README.md'), 'Before\n'); git(['add', '.']); git(['commit', '-qm', 'Synthetic clean baseline']);
    await withStdioClient({ ...fixture, modern }, async client => {
      const h = await createMcpDeliveryHarness(client, root, 'Synthetic bounded README copy');
      await h.invoke('agdf_record', 'step.record', { step: 'ur', title: 'Synthetic bounded README copy',
        source: await h.stage('UR', '# UR: Bounded copy\n## Problem\nOne README sentence is unclear.\n## Goal\nClarify one sentence.\n## Scope\nREADME.md only.\n') });
      await h.approve('UR');
      let text = `# Verified Change: Synthetic copy
## Record
- status: eligible
- related_ur: ${h.prefix}UR.md
- escalation_target: structured_slice
- canonical_owner: README.md
- allowed_source_paths: README.md
- allowed_derived_paths: none
- prohibited_impacts: none
- propagation_command: none
- validation_commands: assert exact README sentence
- baseline_commit: captured_by_owner
- baseline_tracked_paths: none
- baseline_untracked_paths: none
- execution_changed_paths: none
- execution_scope_status: pending
- validation_status: pending
- propagation_status: not_applicable
## Brownfield Selection
- mode: post_ur_review
- decision: verified_change
- scope_reason: One copy owner with deterministic validation and no prohibited impact.
- evidence: Synthetic bounded protocol fixture analysis.
## Mini-Closeout
- delivered:
- intentionally_not_delivered:
- residual_risk: none
- next_step:
`;
      assert.ok((await h.inputs())[0].documents.some(d => d.type === 'VERIFIED_CHANGE'));
      await h.invoke('agdf_record', 'verified_change.record', { phase: 'eligibility', source: await h.stage('Verified Change', text) });
      await h.invoke('agdf_record', 'step.record', { step: 'route', route: 'verified_change', reason: 'One bounded README owner and direct deterministic validation.',
        source: await h.stage('Brownfield Review', '# Brownfield Review\n- decision: pass\nSynthetic bounded copy with one owner.\n') });
      const readRecord = async () => (await h.inputs()).filter(p => p.chunk?.role === 'source' && p.chunk.type === 'Verified Change').map(p => p.chunk.content).join('');
      text = await readRecord(); assert.ok(text.includes(git(['rev-parse', 'HEAD']).trim()));
      // Deliberate external execution; no control command is invoked through a shell.
      writeFileSync(join(root, 'README.md'), 'After: clearer sentence.\n');
      execFileSync(process.execPath, ['-e', "if(require('fs').readFileSync('README.md','utf8')!=='After: clearer sentence.\\n')process.exit(1)"], { cwd: root });
      text = text.replace('- status: eligible', '- status: executed').replace('- execution_scope_status: pending', '- execution_scope_status: pass').replace('- validation_status: pending', '- validation_status: pass');
      const executed = await h.invoke('agdf_record', 'verified_change.record', { phase: 'execution', source: await h.stage('Verified Change', text) });
      assert.equal(executed.current.gate, 'OR');
      const inputs = await h.inputs(); assert.equal(inputs[0].mode, 'verified_change');
      assert.ok(inputs[0].documents.some(d => d.role === 'template' && d.type === 'VERIFIED_CHANGE'));
      text = await readRecord(); assert.match(text, /execution_changed_paths: .*README.md/);
      text = text.replace('- delivered:\n', '- delivered: One README sentence was clarified and directly checked.\n')
        .replace('- intentionally_not_delivered:\n', '- intentionally_not_delivered: All other product changes.\n').replace('- next_step:\n', '- next_step: Optional explicit handoff only.\n');
      const material = await h.stage('Verified Change', text);
      const help = await h.call('agdf_inspect', { operation: 'operation-contract', module: 'agdf_closeout/closeout.record', presentation_language: 'en',
        working_directory: root, primary_target: root, target_source: 'explicit_target', run_id: h.runId, expected_revision_id: h.revision() });
      const input = h.bound(), confirmation = help.report.confirmation_format.replace('{run_id}', h.runId).replace('{expected_revision_id}', input.expected_revision_id)
        .replace('{operation_id}', input.operation_id).replace('{or.digest}', material.digest);
      input.command = { kind: 'closeout.record', payload: { or: material, confirmation } };
      const closed = await h.call('agdf_closeout', input); assert.ok(closed.outcome==='accepted' || closed.outcome==='already_applied' && h.recoveredOperations.has(closed.operation_id),JSON.stringify(closed));
      assert.equal(closed.current.lifecycle, 'completed'); assert.equal(closed.receipt.effect.record.mode, 'verified_change');
      assert.equal((await h.call('agdf_closeout', input)).outcome, 'already_applied');
      assert.equal(readFileSync(join(root, 'README.md'), 'utf8'), 'After: clearer sentence.\n');
      console.log(`Verified Change MCP-only control, actual Git/test, server baseline/path observation and Mini-Closeout passed (${modern ? 'modern' : 'legacy'}).`);
    });
  } finally { fixture.dispose(); }
}
