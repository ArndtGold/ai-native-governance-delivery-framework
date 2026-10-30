import assert from "node:assert/strict";
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { buildFixture, writeEvidenceNote, CLI } from '../../../evals/mcp-ergonomics/lib/fixtures.js';
import { createCoreServices } from '../../core/lib/index.js';
import { readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { artifactReadinessFixture, readyPrd } from '../../core/test/fixtures/artifact-readiness.js';
import { CONTROL_INSPECT_FUNCTION_DEFINITION, SKILL_DISPATCH_FUNCTION_DEFINITION } from "../../cli/lib/mcp-dispatch-runtime.js";
import {
  INVALID_PRESENTATION_LANGUAGE_CASES,
  VALID_PRESENTATION_LANGUAGE_CASES,
  argumentsForLanguageCase,
} from "../../cli/scripts/fixtures/skill-dispatch-language.js";
import { unresolvedArguments, withStdioClient } from "./helpers.js";

// Execute the Core-returned arguments through both negotiated SDK transports.
async function assertGuidedInspection(client) {
  const fixture = buildFixture('F3');
  const base = { presentation_language: 'de', working_directory: fixture.root,
    target_source: 'explicit_target', primary_target: fixture.root, run_id: fixture.runId };
  const call = async (args, unavailable = false) => {
    const response = await client.callTool({ name: 'agdf_inspect', arguments: args });
    assert.equal(response.isError, unavailable ? true : undefined, JSON.stringify(response));
    assert.equal(response.structuredContent.outcome, 'inspect_result');
    assert.equal(response.structuredContent.authorizes, false);
    return response.structuredContent;
  };
  const read = () => call({ ...base, operation: 'gate-check' });
  const snapshot = () => {
    const rows = [];
    const visit = (directory) => { for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else rows.push([path, createHash('sha256').update(readFileSync(path)).digest('hex')]);
    } };
    visit(join(fixture.root, '.agdf/control')); return rows.sort();
  };
  try {
    const before = snapshot();
    const first = await read(); const navigation = first.navigation;
    assert.equal(navigation.presentation_catalog.state, 'unique');
    assert.equal(navigation.presentation_catalog.requested_gate, first.report.current_gate, 'discovery discloses current-gate scope');
    assert.equal(navigation.presentation_catalog.complete_scan, true);
    assert.equal(navigation.presentation_catalog.page_complete, true);
    assert.equal(navigation.next_calls.length, 2);
    for (const next of navigation.next_calls) {
      assert.equal(next.tool, 'agdf_inspect');
      assert.equal((await call(next.arguments)).report.available, true);
    }
    const document = navigation.next_calls.find(next => next.arguments.operation === 'presentation-document').arguments;
    for (const override of [
      { expected_revision_id: '00000000-0000-4000-8000-000000000000' },
      { target_id: `sha256:${'0'.repeat(64)}` }, { gate: 'PRD' }, { run_id: 'foreign-run' },
    ]) assert.notEqual((await call({ ...document, ...override }, true)).report.available, true);
    const unbound = await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'gate-check', presentation_language: 'de', working_directory: fixture.root, run_id: fixture.runId } });
    assert.equal(unbound.structuredContent.navigation, undefined, 'working directory never supplies target authority');
    assert.equal(unbound.structuredContent.authorizes, false);
    assert.deepEqual(snapshot(), before, 'all reads preserve every control byte');

    const second = spawnSync(process.execPath, [CLI, 'run-present', '--dir', fixture.root,
      '--run', fixture.runId, '--revision', fixture.revision(), '--gate', 'UR', '--language', 'de', '--json'], { encoding: 'utf8' });
    assert.equal(second.status, 0, second.stdout + second.stderr);
    const ambiguousBefore = snapshot();
    const ambiguous = (await read()).navigation;
    assert.equal(ambiguous.presentation_catalog.state, 'ambiguous');
    assert.equal(ambiguous.next_calls.some(next => next.arguments.operation === 'presentation-document'), false);
    assert.equal((await call(document)).report.available, true, 'exact conversation binding remains readable despite ambiguous discovery');
    assert.deepEqual(snapshot(), ambiguousBefore);

    fixture.restore();
    rmSync(join(fixture.root, '.agdf/control/runs', fixture.runId, 'presentations'), { recursive: true });
    const missingBefore = snapshot(); const missing = (await read()).navigation;
    assert.equal(missing.presentation_catalog.state, 'none');
    assert.equal(missing.next_calls.some(next => next.arguments.operation === 'presentation-document'), false);
    assert.deepEqual(snapshot(), missingBefore, 'missing documents are never prepared by a read');

    fixture.restore();
    writeFileSync(join(fixture.root, '.agdf/control/runs', fixture.runId, 'presentations', `${fixture.presentationId}.json`), '{}');
    const corruptBefore = snapshot(); const corrupt = (await read()).navigation;
    assert.equal(corrupt.presentation_catalog.state, 'unavailable');
    assert.deepEqual(corrupt.next_calls, []);
    assert.deepEqual(snapshot(), corruptBefore);

    fixture.restore(); const original = fixture.revision();
    const common = { schema_version: '1', ...base, target_id: fixture.targetId,
      expected_revision_id: original, assurance: 'cooperative_local' };
    const source = writeEvidenceNote(fixture, 'ADDITIONAL.md', '# Additional evidence\n\nSynthetic check passed.\n');
    const record = createCoreServices().command('agdf_record', { ...common,
      operation_id: '00000000-0000-4000-8000-000000000001', command: { kind: 'step.record',
        payload: { step: 'evidence', source, reason: 'Synthetic check passed', covers: 'UR' } } });
    assert.equal(record.outcome, 'accepted', record.reason);
    const current = fixture.revision(); assert.notEqual(current, original);
    const historicalBefore = snapshot(); const historical = (await read()).navigation;
    assert.equal(historical.presentation_catalog.state, 'unique');
    assert.equal(historical.presentation_catalog.candidates[0].applicability, 'historical');
    const historicalDocument = historical.next_calls.find(next => next.arguments.operation === 'presentation-document');
    const currentContract = historical.next_calls.find(next => next.arguments.operation === 'operation-contract');
    assert.equal(historicalDocument.arguments.expected_revision_id, original);
    assert.equal(currentContract.arguments.expected_revision_id, current);
    assert.equal((await call(historicalDocument.arguments)).report.applicability, 'historical');
    assert.equal((await call(currentContract.arguments)).report.available, true);
    for (const [index, revision] of [original, current].entries()) {
      const rejected = await client.callTool({ name: 'agdf_approve', arguments: { ...common,
        expected_revision_id: revision, operation_id: `00000000-0000-4000-8000-00000000000${index + 2}`,
        command: { kind: 'approval.record', payload: { gate: 'UR', presentation_id: fixture.presentationId, response: 'Approval: UR' } } } });
      assert.equal(rejected.structuredContent.outcome, 'rejected', 'historical reads never renew approval authority');
    }
    assert.equal(fixture.revision(), current);
    assert.deepEqual(snapshot(), historicalBefore, 'rejected approvals and historical reads do not mutate control');
  } finally { fixture.dispose(); }
}

for (const modern of [false, true]) {
  await withStdioClient({ modern }, async (client) => {
    const protocol = modern ? "2026-07-28" : "2025-11-25";
    assert.equal(client.getNegotiatedProtocolVersion(), protocol);
    assert.equal(client.getProtocolEra(), modern ? "modern" : "legacy");
    const { tools } = await client.listTools();
    assert.equal(tools.length, 9);
    assert.deepEqual(tools.map((tool) => tool.name), ["agdf_dispatch", "agdf_inspect", "agdf_project", "agdf_run", "agdf_prepare", "agdf_record", "agdf_approve", "agdf_revise", "agdf_closeout"]);
    for (const [label, path] of [
      ["repository README", "../../../README.md"],
      ["installation guide", "../../../INSTALL.md"],
      ["architecture guide", "../../../docs/architecture/README.md"],
      ["create-agdf README", "../../cli/README.md"],
      ["MCP README", "../README.md"],
    ]) {
      const document = readFileSync(new URL(path, import.meta.url), "utf8");
      const declared = document.match(/^(?:MCP-Werkzeuge(?: des regulären Servers)?|MCP tools): ([^\n]+)$/m);
      assert.ok(declared, `${label}: missing MCP tool inventory`);
      assert.deepEqual([...declared[1].matchAll(/`(agdf_[a-z]+)`/g)].map((match) => match[1]), tools.map((tool) => tool.name), `${label}: MCP tool inventory differs from tools/list`);
    }
    assert.ok(Buffer.byteLength(JSON.stringify(tools[1])) <= 5000, `${protocol}: actual discovered definition budget`);
    assert.ok(tools[1].outputSchema, 'output validation retained');
    for (const field of Object.values(tools[1].inputSchema.properties)) assert.ok(field.description?.length > 10);
    assert.equal(tools[1].description, CONTROL_INSPECT_FUNCTION_DEFINITION.description);
    assert.deepEqual(tools[1].inputSchema, CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema);
    await assertGuidedInspection(client);
    const draft = artifactReadinessFixture();
    try {
      writeFileSync(draft.path, readyPrd);
      const args = { operation: 'artifact-readiness', presentation_language: 'de', working_directory: draft.root,
        target_source: 'explicit_target', primary_target: draft.root, run_id: draft.runId,
        gate: 'PRD', expected_revision_id: draft.revision };
      const contractArgs = { ...args, operation: 'operation-contract', module: 'agdf_prepare/presentation.prepare' };
      const contract = await client.callTool({ name: 'agdf_inspect', arguments: contractArgs });
      assert.equal(contract.isError, undefined);
      assert.equal(contract.structuredContent.report.presentation_catalog.state, 'unavailable', 'synthetic legacy approval records cannot establish a readable catalog');
      assert.equal(contract.structuredContent.report.presentation_catalog.complete_scan, false);
      assert.match(contract.structuredContent.report.presentation_catalog.next_action, /cannot establish/);
      assert.equal(contract.structuredContent.report.inspect_contract.examples_are_illustrative, true);
      for (const changed of [{ expected_revision_id: 'bad' }, { cursor: 'bad' }, { module: 'agdf_record/step.record', cursor: `${'0'.repeat(64)}:16` }]) {
        const bad = await client.callTool({ name: 'agdf_inspect', arguments: { ...contractArgs, ...changed } });
        assert.equal(bad.isError, true); assert.equal(bad.structuredContent, undefined, 'real SDK must reject factored schema violations');
      }
      const before = readFileSync(draft.runPath, 'utf8');
      const checked = await client.callTool({ name: 'agdf_inspect', arguments: args });
      assert.equal(checked.isError, undefined, `${protocol}:artifact-readiness`);
      assert.equal(checked.structuredContent.report.ready, true, JSON.stringify(checked));
      assert.equal(checked.structuredContent.authorizes, false);
      assert.deepEqual(JSON.parse(checked.content[0].text), checked.structuredContent);
      assert.equal(readFileSync(draft.runPath, 'utf8'), before, `${protocol}:reading cannot record approval`);
      const stale = await client.callTool({ name: 'agdf_inspect', arguments: { ...args, expected_revision_id: '00000000-0000-4000-8000-000000000000' } });
      assert.equal(stale.structuredContent.report.diagnostics[0].code, 'artifact_revision_stale');
    } finally { rmSync(draft.root, { recursive: true, force: true }); }
    const inspectUnresolved = await client.callTool({ name: "agdf_inspect", arguments: { operation: "doctor", presentation_language: "de", working_directory: "/tmp" } });
    assert.equal(inspectUnresolved.isError, true, `${protocol}:inspect`);
    assert.equal(inspectUnresolved.structuredContent.outcome, "target_unresolved");
    assert.equal(inspectUnresolved.structuredContent.authorizes, false);
    assert.equal(inspectUnresolved.structuredContent.report, null);
    const inspectRejected = await client.callTool({ name: "agdf_inspect", arguments: { operation: "run-approve", presentation_language: "de", working_directory: "/tmp" } });
    assert.equal(inspectRejected.isError, true, `${protocol}:inspect schema rejects write-shaped operations`);
    assert.equal(inspectRejected.structuredContent, undefined);
    assert.equal(tools[0].name, "agdf_dispatch");
    assert.equal(tools[0].description, SKILL_DISPATCH_FUNCTION_DEFINITION.description);
    assert.deepEqual(tools[0].inputSchema, SKILL_DISPATCH_FUNCTION_DEFINITION.inputSchema);
    assert.deepEqual(tools[0].outputSchema, SKILL_DISPATCH_FUNCTION_DEFINITION.outputSchema);

    for (const row of INVALID_PRESENTATION_LANGUAGE_CASES) {
      const result = await client.callTool({
        name: "agdf_dispatch",
        arguments: argumentsForLanguageCase(unresolvedArguments, row),
      });
      assert.equal(result.isError, true, `${protocol}:${row.id}`);
      assert.equal(result.structuredContent, undefined, `${protocol}:${row.id}:schema errors have no governance result`);
    }

    const validResults = new Map();
    for (const row of VALID_PRESENTATION_LANGUAGE_CASES) {
      const result = await client.callTool({
        name: "agdf_dispatch",
        arguments: argumentsForLanguageCase(unresolvedArguments, row),
      });
      assert.equal(result.isError, true, `${protocol}:${row.id}`);
      assert.equal(result.structuredContent.outcome, "target_unresolved", `${protocol}:${row.id}`);
      assert.equal(result.structuredContent.authorizes, false, `${protocol}:${row.id}`);
      assert.equal(result.structuredContent.presentation.presentation_language, row.expectedLocale, `${protocol}:${row.id}`);
      assert.equal(result.structuredContent.host_action.text, result.structuredContent.presentation.markdown, `${protocol}:${row.id}`);
      assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent, `${protocol}:${row.id}`);
      validResults.set(row.id, result.structuredContent.presentation);
    }
    assert.deepEqual(validResults.get("unsupported_fr"), validResults.get("supported_en"), `${protocol}:unsupported fr uses one complete English pack`);
    assert.deepEqual(validResults.get("unsupported_es"), validResults.get("supported_en"), `${protocol}:unsupported es uses one complete English pack`);
  });
}

console.log("AGDF MCP 2025-11-25 and 2026-07-28 separate language-matrix protocol tests passed.");
