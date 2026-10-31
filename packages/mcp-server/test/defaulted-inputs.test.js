import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initializeCanonicalControl } from '../../cli/lib/scaffold/canonical-init.js';
import { generatedFilesForTarget } from '../../cli/lib/scaffold/plan.js';
import { resolveControlCommandTarget } from '../../core/lib/control-state/approval-command-contract.js';
import { runSealState } from '../../core/lib/control-state/run-seal.js';
import { readRunOperations } from '../../core/lib/control-state/run-operations.js';
import { withStdioClient } from './helpers.js';
import { buildFixture, writeEvidenceNote } from '../../../evals/mcp-ergonomics/lib/fixtures.js';

for (const modern of [false, true]) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-defaulted-sdk-')));
  try {
    execFileSync('git', ['init', '-q', root]);
    initializeCanonicalControl(root, generatedFilesForTarget('init', root, false, 'en'));
    const config = join(root, '.agdf/control/config.json'), before = readFileSync(config);
    const base = { working_directory: root, target_source: 'explicit_target', primary_target: root };
    await withStdioClient({ modern, cwd: root }, async client => {
      const { tools } = await client.listTools();
      assert.equal(tools.length, 9);
      for (const tool of tools) {
        assert.ok(!tool.inputSchema.required.includes('presentation_language'), tool.name);
        assert.ok(!tool.inputSchema.required.includes('working_directory'), tool.name);
        if (tool.name !== 'agdf_inspect' && tool.name !== 'agdf_dispatch') {
          assert.ok(!tool.inputSchema.required.includes('schema_version'), tool.name);
          assert.ok(!tool.inputSchema.required.includes('assurance'), tool.name);
        }
      }
      const read = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, operation: 'project-state' } });
      assert.equal(read.isError, undefined, JSON.stringify(read));
      assert.equal(read.structuredContent.outcome, 'inspect_result');
      assert.equal(read.structuredContent.report.effective_configuration.sources.chat_language.kind, 'project');
      const explicit = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, operation: 'project-state', presentation_language: 'en' } });
      assert.equal(explicit.structuredContent.report.effective_configuration.sources.chat_language.kind, 'explicit');
      const missing = await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'inventory' } });
      assert.equal(missing.isError, true);
      assert.equal(missing.structuredContent.diagnostics[0].code, 'working_directory_required');
      assert.deepEqual(readFileSync(config), before);
      const original = { ...base, target_id: resolveControlCommandTarget(root).target_id, operation_id: randomUUID(),
        command: { kind: 'run.create', payload: { title: 'Synthetic defaulted creation' } } };
      const made = await client.callTool({ name: 'agdf_run', arguments: original });
      assert.equal(made.isError, undefined, JSON.stringify(made));
      assert.equal(made.structuredContent.outcome, 'accepted', JSON.stringify(made));
      const receipt = made.structuredContent.receipt;
      assert.equal(receipt.schema_version, 'resolved/1');
      assert.equal(receipt.input_resolution.fields.presentation_language, 'en');
      assert.equal(receipt.input_resolution.fields.schema_version, '1');
      assert.equal(receipt.input_resolution.fields.assurance, 'cooperative_local');
      const runId = made.structuredContent.binding.run_id, path = join(root, `.agdf/control/runs/${runId}/RUN_STATE.md`);
      const state = readFileSync(path, 'utf8');
      assert.equal(runSealState(root, state).status, 'valid');
      assert.equal(readRunOperations(state).receipts.length, 1);
      writeFileSync(config, JSON.stringify({ artifact_language: 'en', chat_language: 'de', runtime_language: 'en' }));
      const replay = await client.callTool({ name: 'agdf_run', arguments: original });
      assert.equal(replay.structuredContent.outcome, 'already_applied', JSON.stringify(replay));
      assert.deepEqual(replay.structuredContent.receipt, receipt);
      assert.equal(readFileSync(path, 'utf8'), state);
      writeFileSync(config, '{');
      const replayBadConfig = await client.callTool({ name: 'agdf_run', arguments: original });
      assert.equal(replayBadConfig.structuredContent.outcome, 'already_applied', JSON.stringify(replayBadConfig));
      assert.equal(readFileSync(path, 'utf8'), state);
      const status = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, operation: 'operation-status', module: original.operation_id } });
      assert.equal(status.isError, undefined, JSON.stringify(status));
      assert.equal(status.structuredContent.report.status, 'recorded');
      assert.deepEqual(status.structuredContent.report.receipt, receipt);
      const invalid = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, operation: 'project-state', presentation_language: 'en' } });
      assert.equal(invalid.isError, true);
      assert.ok(invalid.structuredContent.diagnostics.some(d => d.code === 'configuration_invalid' && d.source?.kind === 'project'));
      const germanInvalid = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, operation: 'project-state', presentation_language: 'de' } });
      assert.equal(germanInvalid.isError, true);
      assert.match(germanInvalid.content.at(-1).text, /Eingabe|Konfiguration|korrigier/u);
      writeFileSync(config, JSON.stringify({ artifact_language: 'en', runtime_language: 'en', chat_language: 123, extension_secret: 'FIXTURE_PRIVATE_VALUE' }));
      const typedInvalid = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, operation: 'project-state' } });
      assert.equal(typedInvalid.isError, true);
      assert.ok(typedInvalid.structuredContent.diagnostics.some(d => d.code === 'configuration_invalid' && d.field === 'chat_language'));
      assert.equal(JSON.stringify(typedInvalid).includes('FIXTURE_PRIVATE_VALUE'), false);
      writeFileSync(config, before);
      const conflict = await client.callTool({ name: 'agdf_run', arguments: { ...original, presentation_language: 'en' } });
      assert.equal(conflict.isError, true);
      assert.equal(conflict.structuredContent.reason, 'operation_payload_conflict');
      assert.equal(readdirSync(join(root, '.agdf/control/runs')).length, 1);
      assert.equal(readFileSync(path, 'utf8'), state);
      for (const bad of [{ schema_version: '2' }, { assurance: 'human_approved' }, { trusted_context: { working_directory: root } }]) {
        let rejected = false;
        try { const result = await client.callTool({ name: 'agdf_run', arguments: { ...original, operation_id: randomUUID(), ...bad } }); rejected = result.isError === true; }
        catch { rejected = true; }
        assert.equal(rejected, true, JSON.stringify(bad));
      }
      assert.equal(readdirSync(join(root, '.agdf/control/runs')).length, 1);
      const setupRoot = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-defaulted-setup-')));
      try {
        execFileSync('git', ['init', '-q', setupRoot]);
        const setup = { working_directory: setupRoot, target_source: 'explicit_target', primary_target: setupRoot,
          target_id: resolveControlCommandTarget(setupRoot).target_id, operation_id: randomUUID(), command: { kind: 'project.initialize', payload: { language: 'en' } } };
        const made = await client.callTool({ name: 'agdf_project', arguments: setup });
        assert.equal(made.structuredContent.outcome, 'accepted', JSON.stringify(made));
        assert.equal(made.structuredContent.receipt.schema_version, 'resolved/1');
        const path = join(setupRoot, '.agdf/control/config.json'); writeFileSync(path, '{');
        const replay = await client.callTool({ name: 'agdf_project', arguments: setup });
        assert.equal(replay.structuredContent.outcome, 'already_applied', JSON.stringify(replay));
        assert.deepEqual(replay.structuredContent.receipt, made.structuredContent.receipt);
        assert.equal(readFileSync(path, 'utf8'), '{', 'setup replay never repairs config');
      } finally { rmSync(setupRoot, { recursive: true, force: true }); }
      const f = buildFixture('F3');
      try {
        execFileSync('git', ['-C', f.root, 'config', 'user.name', 'AGDF synthetic fixture']);
        execFileSync('git', ['-C', f.root, 'config', 'user.email', 'fixture@example.invalid']);
        const common = { working_directory: f.root, target_source: 'explicit_target', primary_target: f.root, target_id: f.targetId };
        const projectConfig = join(f.root, '.agdf/control/config.json'), originalConfig = readFileSync(projectConfig);
        const bound = () => ({ ...common, run_id: f.runId, expected_revision_id: f.revision() });
        const call = async (name, kind, payload, envelope = bound()) => {
          const args = { ...envelope, operation_id: randomUUID(), command: { kind, payload } };
          const result = await client.callTool({ name, arguments: args });
          const failure = JSON.stringify({ kind, outcome: result.structuredContent?.outcome, reason: result.structuredContent?.reason, diagnostics: result.structuredContent?.diagnostics });
          assert.equal(result.isError, undefined, failure);
          assert.equal(result.structuredContent.outcome, 'accepted', failure);
          return { args, result: result.structuredContent };
        };
        const evidence = writeEvidenceNote(f, 'DEFAULTED_EVIDENCE.md', '# Synthetic evidence\n\nFixture-only validation.\n');
        const recorded = await call('agdf_record', 'step.record', { step: 'evidence', source: evidence, reason: 'Synthetic evidence', covers: 'UR' });
        assert.equal(recorded.result.receipt.schema_version, 'resolved/1');
        const transfer = await call('agdf_record', 'material.stage', { action: 'begin', files: [{ slot: 'EVIDENCE', bytes: 0 }] });
        writeFileSync(projectConfig, '{');
        const repeatedTransfer = await client.callTool({ name: 'agdf_record', arguments: transfer.args });
        assert.equal(repeatedTransfer.structuredContent.outcome, 'accepted', JSON.stringify(repeatedTransfer));
        assert.equal(repeatedTransfer.structuredContent.family_result.transfer_id, transfer.result.family_result.transfer_id);
        writeFileSync(projectConfig, originalConfig);
        const replacement = writeEvidenceNote(f, 'DEFAULTED_UR.md', readFileSync(join(f.root, `.agdf/control/artefacts/${f.runId}/UR.md`), 'utf8'));
        const revised = await call('agdf_revise', 'ur_draft.replace', { source: replacement, title: 'Synthetic defaulted UR replacement' });
        assert.equal(revised.result.receipt.schema_version, 'resolved/1');
        const preferences = { ...JSON.parse(originalConfig), presentation_route: 'automatic', gate_check_variant: 'status-card' };
        writeFileSync(projectConfig, JSON.stringify(preferences));
        const gateRead = { ...common, run_id: f.runId, operation: 'gate-check' }; delete gateRead.target_id;
        const inheritedVariant = await client.callTool({ name: 'agdf_inspect', arguments: gateRead });
        const explicitVariant = await client.callTool({ name: 'agdf_inspect', arguments: { ...gateRead, variant: 'approval-envelope' } });
        assert.equal(inheritedVariant.structuredContent.report.effective_configuration.values.gate_check_variant, 'status-card');
        assert.equal(explicitVariant.structuredContent.report.effective_configuration.sources.gate_check_variant.kind, 'explicit');
        // Both selectors may intentionally expose the same immutable document
        // link at this gate; source attribution proves the explicit override.
        assert.equal(inheritedVariant.structuredContent.outcome, 'inspect_result');
        assert.equal(explicitVariant.structuredContent.outcome, 'inspect_result');
        const prepared = await call('agdf_prepare', 'presentation.prepare', { gate: 'UR' });
        assert.equal(prepared.result.receipt.schema_version, 'resolved/1');
        const delivery = await call('agdf_prepare', 'presentation.deliver', { gate: 'UR', presentation_id: prepared.result.receipt.presentation_id });
        assert.equal(delivery.result.presentation_delivery.mode, 'full_markdown');
        const docRead = { ...common, run_id: f.runId,
          expected_revision_id: f.revision(), operation: 'presentation-document', gate: 'UR', presentation_id: prepared.result.receipt.presentation_id };
        const document = await client.callTool({ name: 'agdf_inspect', arguments: docRead });
        assert.equal(document.isError, undefined, JSON.stringify(document));
        writeFileSync(projectConfig, '{');
        const historicalDocument = await client.callTool({ name: 'agdf_inspect', arguments: docRead });
        assert.equal(historicalDocument.isError, undefined, JSON.stringify(historicalDocument));
        assert.deepEqual(historicalDocument.structuredContent.report.content, document.structuredContent.report.content);
        assert.equal(historicalDocument.structuredContent.report.effective_configuration.binding, 'original_operation');
        const changed = JSON.parse(originalConfig); changed.chat_language = 'de'; writeFileSync(projectConfig, JSON.stringify(changed));
        const repeatedDelivery = await client.callTool({ name: 'agdf_prepare', arguments: delivery.args });
        assert.equal(repeatedDelivery.structuredContent.presentation_delivery.historical_delivery, true);
        assert.equal(repeatedDelivery.structuredContent.presentation_delivery.text, '');
        writeFileSync(projectConfig, originalConfig);
        const approval = await call('agdf_approve', 'approval.record', { gate: 'UR', presentation_id: prepared.result.receipt.presentation_id, response: 'Approval: UR' });
        assert.equal(approval.result.receipt.schema_version, 'resolved/1');
        const preview = await call('agdf_closeout', 'closure.preview', { entries: [{ run_id: f.runId, outcome: 'abandoned', reason: 'Synthetic closure test' }] }, common);
        const selected = preview.result.family_result;
        const applied = await call('agdf_closeout', 'closure.apply', { preview_id: selected.preview_id, confirmation: selected.confirmation_phrase }, common);
        assert.equal(applied.result.family_result.closed_count, 1);
        const statePath = join(f.root, `.agdf/control/runs/${f.runId}/RUN_STATE.md`), closed = readFileSync(statePath, 'utf8');
        assert.equal(runSealState(f.root, closed).status, 'valid');
        writeFileSync(projectConfig, JSON.stringify(changed));
        const repeatedClosure = await client.callTool({ name: 'agdf_closeout', arguments: applied.args });
        assert.equal(repeatedClosure.structuredContent.family_result.closed_count, 0, JSON.stringify(repeatedClosure));
        assert.equal(readFileSync(statePath, 'utf8'), closed);
      } finally { f.dispose(); }
    });
  } finally { rmSync(root, { recursive: true, force: true }); }
}
console.log('Defaulted MCP inputs: both SDK eras, discovery, read/write/replay, invalid config and authority negatives passed.');
