import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { startControlServer } from '../server/service.mjs';
import { artifactReadinessFixture, readyPrd } from '../../core/test/fixtures/artifact-readiness.js';
import { treeBytes } from '../../core/test/control-cockpit-fixtures.js';
test('SCN-008/010: authenticated exact-query draft route uses actual Core and does not write', async () => {
  const f = artifactReadinessFixture(); fs.writeFileSync(f.path, readyPrd);
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
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(treeBytes(fs.realpathSync(f.root)), before);
  } finally { await service.close(); fs.rmSync(f.root, { recursive: true, force: true }); }
});
