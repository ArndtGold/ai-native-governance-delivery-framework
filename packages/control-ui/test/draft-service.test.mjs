import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { startControlServer } from '../server/service.mjs';
import { artifactReadinessFixture, readyPrd } from '../../core/test/fixtures/artifact-readiness.js';
import { treeBytes } from '../../core/test/control-cockpit-fixtures.js';
import { upsertTableRow } from '../../core/lib/control-state/run-state-edits.js';
test('SCN-008/010: authenticated exact-query draft route uses actual Core and does not write', async () => {
  const f = artifactReadinessFixture(); fs.writeFileSync(f.path, readyPrd);
  f.reseal(s=>upsertTableRow(s,'Artefacts',0,'PRD',['PRD',`${f.prefix}PRD.md`,'draft','Actual registered HTTP draft']));
  const before = treeBytes(fs.realpathSync(f.root)), service = await startControlServer({ dir: f.root });
  const request = (path, options = {}) => fetch(service.origin + path, { headers: { 'x-agdf-session': service.secret, ...options.headers }, method: options.method });
  try {
    const selected = await (await request('/api/snapshot?run_id=' + f.runId)).json();
    const path = `/api/draft-check/${f.runId}?snapshot=${selected.snapshot_id}&gate=PRD&expected_revision=${f.revision}`;
    for (const [url, options] of [[path + '&gate=PRD', {}], [path + '&path=UR.md', {}], [path.replace('gate=PRD', 'gate=QA'), {}],
      [path, { headers: { 'x-agdf-session': '' } }], [path, { headers: { Origin: 'https://foreign.invalid' } }], [path, { method: 'POST' }]]) {
      assert.ok([401, 403].includes((await request(url, options)).status));
    }
    const response = await request(path), checked = await response.json();
    assert.equal(response.status, 200); assert.equal(checked.data.run.draft_check.display.state, 'passed');
    assert.equal(checked.data.run.draft_check.result.authorizes, false);
    const row=checked.data.run.document_states.find(s=>s.type==='PRD');assert.equal(row.state,'draft_checked');
    const opened=await(await request(`/api/documents/${row.resource_id}?snapshot=${checked.snapshot_id}`)).json();
    assert.equal(opened.data.document.content,readyPrd);assert.equal(opened.data.document.content_digest,opened.data.document.document_state.content_digest);
    assert.deepEqual(opened.data.document.document_state.check.result,checked.data.run.draft_check.result);
    const returned=await(await request(`/api/runs/${f.runId}?snapshot=${opened.snapshot_id}`)).json();assert.deepEqual(returned.data.run.draft_check.result,checked.data.run.draft_check.result);
    const reload=await(await request('/api/snapshot?run_id='+f.runId)).json();assert.equal(reload.data.run.draft_check.result,null);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(treeBytes(fs.realpathSync(f.root)), before);
  } finally { await service.close(); fs.rmSync(f.root, { recursive: true, force: true }); }
});
