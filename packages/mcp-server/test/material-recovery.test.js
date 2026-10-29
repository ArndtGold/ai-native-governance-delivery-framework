// Real serving-generation loss and dropped STDIO acknowledgement in owned fixtures.
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createMcpDeliveryHarness } from './delivery-harness.js';
import { readRunOperations } from '../../core/lib/control-state/run-operations.js';

for (const modern of [false, true]) {
  const fixture = createOwnedRuntimeFixture({ controlRuns: [] }), root = fixture.governanceTarget;
  try {
    let original, firstReference;
    const content = '# UR: Exact staged intent\n## Problem\nA bounded result is unavailable.\n## Goal\nDeliver that bounded result.\n## Scope\nOnly this fixture.\n';
    await withStdioClient({ ...fixture, modern }, async client => {
      const h = await createMcpDeliveryHarness(client, root, 'Synthetic exact staged intent');
      firstReference = await h.stage('UR', content);
      original = { ...h.bound(), command: { kind: 'step.record', payload: { step: 'ur', title: 'Synthetic exact staged intent', source: firstReference } } };
    }); // No canonical record call: this serving generation and its buffers are gone.
    const entry = join(fixture.root, 'drop-one-ack.mjs');
    writeFileSync(entry, `import {runMcpServer} from ${JSON.stringify(join(fixture.serverRoot, 'src/main.js'))};
const originalWrite=process.stdout.write.bind(process.stdout);let dropped=false;
process.stdout.write=function(chunk,...args){let packet;try{packet=JSON.parse(String(chunk))}catch{}
if(!dropped&&packet?.result?.structuredContent?.operation_id===${JSON.stringify(original.operation_id)}&&packet.result.structuredContent.outcome==='accepted'&&packet.result.structuredContent.binding?.kind==='step.record'){
dropped=true;const callback=args.find(a=>typeof a==='function');callback?.();return true;}
return originalWrite(chunk,...args)};
await runMcpServer({surface:'codex'});`);
    await withStdioClient({ ...fixture, modern, args: [entry] }, async client => {
      const call = async payload => {
        const result = (await client.callTool({ name: 'agdf_record', arguments: { ...original, operation_id: randomUUID(), command: { kind: 'material.stage', payload } } })).structuredContent;
        assert.equal(result.outcome, 'accepted', JSON.stringify(result)); return result.family_result;
      };
      const bytes = Buffer.from(content), start = await call({ action: 'begin', files: [{ slot: 'UR', bytes: bytes.length }] });
      await call({ action: 'append', transfer_id: start.transfer_id, file: 0, offset: 0, data: bytes.toString('base64') });
      const reference = (await call({ action: 'seal', transfer_id: start.transfer_id })).files[0].reference;
      assert.notEqual(reference.material_id, firstReference.material_id); assert.equal(reference.digest, firstReference.digest);
      original.command.payload.source = reference;
      await assert.rejects(client.callTool({ name: 'agdf_record', arguments: original }, { timeout: 3000 }), /timed out|timeout/i);
      const observed = (await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'operation-status', module: original.operation_id,
        presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target',
        run_id: original.run_id, expected_revision_id: original.expected_revision_id } })).structuredContent.report;
      assert.equal(observed.status, 'recorded', JSON.stringify(observed)); assert.equal(observed.receipt.operation_id, original.operation_id);
      const replay = (await client.callTool({ name: 'agdf_record', arguments: original })).structuredContent;
      assert.equal(replay.outcome, 'already_applied', JSON.stringify(replay)); assert.deepEqual(replay.receipt, observed.receipt);
    });
    await withStdioClient({ ...fixture, modern }, async client => {
      const replay = (await client.callTool({ name: 'agdf_record', arguments: original })).structuredContent;
      assert.equal(replay.outcome, 'already_applied', JSON.stringify(replay));
      const state = readFileSync(join(root, '.agdf/control/runs', original.run_id, 'RUN_STATE.md'), 'utf8');
      assert.equal(readRunOperations(state).receipts.filter(r => r.operation_id === original.operation_id).length, 1);
      assert.equal(readFileSync(join(root, '.agdf/control/artefacts', original.run_id, 'UR.md'), 'utf8'), content);
    });
    console.log(`Actual generation loss/restaging, dropped acknowledgement, original receipt and one canonical UR effect passed (${modern ? 'modern' : 'legacy'}).`);
  } finally { fixture.dispose(); }
}
