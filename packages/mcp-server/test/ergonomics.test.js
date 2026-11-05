import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFixture } from '../../../evals/mcp-ergonomics/lib/fixtures.js';
import { CONTROL_INSPECT_FUNCTION_DEFINITION, CONTROL_INSPECT_MAX_DEFINITION_BYTES } from '../../core/lib/control-inspect/contract.js';
import { mcpInputValidationHint } from '../../core/lib/mcp-input-hints.js';
import { withStdioClient } from './helpers.js';
import { createOwnedRuntimeFixture } from './owned-runtime.js';

assert.ok(Buffer.byteLength(JSON.stringify(CONTROL_INSPECT_FUNCTION_DEFINITION)) <= CONTROL_INSPECT_MAX_DEFINITION_BYTES);
assert.match(CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema.properties.target_id.description, /Required for docs; gate-check/u);
const missingBinding = mcpInputValidationHint('agdf_inspect', { operation: 'operation-contract', module: 'agdf_record/step.record' });
for (const field of ['run_id', 'expected_revision_id', 'primary_target', 'target_source']) assert.ok(missingBinding.includes(field));
assert.match(missingBinding, /never silently replace a requested revision/u);
assert.doesNotMatch(mcpInputValidationHint('agdf_inspect', { operation: 'operation-contract', module: 'agdf_run/run.create' }), /Supply run_id|Supply expected_revision_id/u);
const setupHint = mcpInputValidationHint('agdf_inspect', { operation: 'operation-contract', module: 'project.initialize' });
assert.match(setupHint, /agdf_project\/project.initialize/u);
assert.doesNotMatch(setupHint, /Supply run_id|Supply expected_revision_id/u);
assert.match(mcpInputValidationHint('agdf_dispatch', { skill_id: 'gate-check', run_id: 'Demo-Run-01' }), /canonical Run ID/u);
assert.equal(mcpInputValidationHint('agdf_inspect', { operation: 'not-an-operation' }), '');
assert.match(mcpInputValidationHint('agdf_inspect', { operation:'status' }), /status is invalid/u);
assert.match(mcpInputValidationHint('agdf_record', { command: { kind: 'step.record' } }), /operation-contract module agdf_record\/step.record/u);
assert.match(mcpInputValidationHint('agdf_inspect', { operation: 'operation-contract', module: 'agdf_run/step.record' }), /Use module agdf_record\/step.record/u);
assert.doesNotMatch(mcpInputValidationHint('agdf_inspect', { operation: 'operation-contract', module: 'agdf_run/operation.recover' }), /Use module agdf_/u);
// Invalid/ambiguous locators never become an executable-looking suggestion.
const locator = { operation: 'gate-check', gate: 'UR', working_directory: process.cwd(), primary_target: process.cwd(), target_source: 'explicit_target', run_id: 'demo-run-01' };
for (const bad of [{ primary_target: 'relative' }, { run_id: 'Demo-Run-01' }, { target_source: 'guessed' }, { primary_target: undefined }, { primary_target: `/${'a'.repeat(4000)}` }])
  assert.doesNotMatch(mcpInputValidationHint('agdf_inspect', { ...locator, ...bad }), /Next read-only call/u);

const runtime = createOwnedRuntimeFixture({ controlRuns: [], candidateServerRoot: fileURLToPath(new URL('../../../dist/npm/agdf-mcp-server/', import.meta.url)) });
try { for (const modern of [false, true]) {
  const fixture = buildFixture('F3');
  try {
    const runPath = join(fixture.root, `.agdf/control/runs/${fixture.runId}/RUN_STATE.md`);
    const before = readFileSync(runPath), revision = fixture.revision();
    const base = { working_directory: fixture.root, primary_target: fixture.root, target_source: 'explicit_target',
      presentation_language: 'de', run_id: fixture.runId };
    await withStdioClient({ modern, cwd: fixture.root, root: runtime.root,
      args: [join(runtime.serverRoot, 'bin/agdf-mcp.js'), '--surface', 'codex'] }, async client => {
      const status = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, operation: 'gate-check' } });
      assert.equal(status.isError, undefined, JSON.stringify(status));
      assert.equal(status.content[0].text, JSON.stringify(status.structuredContent), 'compact MCP text preserves the complete structured result');
      const navigation = status.structuredContent.navigation;
      assert.deepEqual(navigation.read_context, base, 'reusable context contains only validated read selectors, no revision or authority');
      assert.equal(navigation.next_calls[0].arguments.operation, 'presentation-document', 'document read precedes optional command help');
      assert.equal(navigation.next_calls[0].arguments.presentation_id, fixture.presentationId);
      let read = navigation.next_calls[0].arguments, content = '', offset = 0;
      do {
        const document = await client.callTool({ name: 'agdf_inspect', arguments: read });
        assert.equal(document.isError, undefined, JSON.stringify(document));
        assert.equal(document.content[0].text, JSON.stringify(document.structuredContent), 'compact MCP text preserves document bytes and navigation');
        const report = document.structuredContent.report;
        assert.match(report.delivery_instruction, /Tool output alone is not delivery/u);
        assert.equal(report.byte_start, offset);
        content += report.content;
        offset = report.byte_end;
        read = report.complete ? null : { ...read, cursor: report.next_cursor };
      } while (read);
      const expected = readFileSync(join(fixture.root, `.agdf/control/runs/${fixture.runId}/control/presentations/${fixture.presentationId}.document`));
      assert.deepEqual(Buffer.from(content), expected, 'exact immutable document bytes retained');
      const reused = await client.callTool({ name: 'agdf_inspect', arguments: { ...navigation.read_context, operation: 'gate-check' } });
      assert.equal(reused.isError, undefined);
      assert.deepEqual(reused.structuredContent.navigation.read_context, base);
      // No remembered target or cwd fallback, even after successful bound calls.
      const unknown = await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'gate-check', working_directory: fixture.root, run_id: fixture.runId } });
      assert.equal(unknown.isError, true);
      assert.equal(unknown.structuredContent.outcome, 'target_unresolved');
      const invalid = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, operation: 'gate-check', gate: 'UR', expected_revision_id: revision } });
      assert.equal(invalid.isError, true);
      assert.match(JSON.stringify(invalid), /Remove gate for gate-check/u);
      const text = invalid.content.filter(item => item.type === 'text').map(item => item.text).join('\n');
      const correction = JSON.parse(text.match(/Next read-only call[^:]+: (\{[^\n]+\}) Schema:/u)[1]);
      assert.equal(correction.tool, 'agdf_inspect');
      assert.deepEqual(correction.arguments, { operation: 'gate-check', ...base });
      assert.equal((await client.callTool({ name: correction.tool, arguments: correction.arguments })).isError, undefined);
      const alias = await client.callTool({name:'agdf_inspect',arguments:{...base,operation:'status',expected_revision_id:revision}});
      assert.equal(alias.isError,true,'status remains invalid; no alias is executed');
      const aliasText=alias.content.filter(item=>item.type==='text').map(item=>item.text).join('\n');
      assert.match(aliasText,/status is invalid/u);
      const aliasCorrection=JSON.parse(aliasText.match(/Next read-only call[^:]+: (\{[^\n]+\}) Schema:/u)[1]);
      assert.deepEqual(aliasCorrection,{tool:'agdf_inspect',arguments:{operation:'gate-check',...base}});
      assert.equal((await client.callTool({name:aliasCorrection.tool,arguments:aliasCorrection.arguments})).isError,undefined);
      const ambiguousStatus=await client.callTool({name:'agdf_inspect',arguments:{...base,operation:'operation-status',module:'00000000-0000-4000-8000-000000000001',run_id:undefined}});
      assert.equal(ambiguousStatus.structuredContent.report.lookup_scope,'run_creation');
      assert.match(ambiguousStatus.structuredContent.report.recovery_instruction,/original run_id, original expected_revision_id/u);
      assert.match(ambiguousStatus.structuredContent.report.recovery_instruction,/does not prove an approval effect/u);
      const noId = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, operation: 'presentation-document', gate: 'UR', expected_revision_id: revision, target_id: fixture.targetId } });
      assert.equal(noId.isError, true);
      assert.match(JSON.stringify(noId), /Next read-only call/u);
      const noTargetHash = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, operation: 'presentation-document', gate: 'UR', expected_revision_id: revision, presentation_id: fixture.presentationId } });
      assert.equal(noTargetHash.isError, true, 'The discovery wording never makes the required document target hash optional.');
      const missing = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, run_id: undefined, operation: 'operation-contract', module: 'agdf_record/step.record' } });
      assert.equal(missing.isError, true);
      assert.match(JSON.stringify(missing), /Supply run_id.*Supply expected_revision_id/u);
      const badRun = await client.callTool({ name: 'agdf_dispatch', arguments: { ...base, skill_id: 'gate-check', run_id: 'Demo-Run-01' } });
      assert.equal(badRun.isError, true);
      assert.match(JSON.stringify(badRun), /canonical Run ID/u);
      const stale = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, operation: 'operation-contract', module: 'agdf_record/step.record', expected_revision_id: '00000000-0000-4000-8000-000000000001' } });
      assert.equal(stale.isError, true);
      assert.equal(stale.structuredContent.report.reason, 'operation_binding_stale_or_invalid');
      assert.equal(fixture.revision(), revision);
      assert.deepEqual(readFileSync(runPath), before, 'all navigation and invalid inputs stay read-only');
    });
  } finally { fixture.dispose(); }
} } finally { runtime.dispose(); }
console.log('MCP ergonomics: reusable explicit context, document-first navigation and corrective errors passed in both protocol eras.');
