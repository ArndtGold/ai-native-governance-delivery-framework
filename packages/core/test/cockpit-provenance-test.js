import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCockpitSessionService } from '../lib/control-inspect/cockpit-session.js';
import { fixture } from './control-cockpit-fixtures.js';

test('server resource identity is bound once to each new view and makes no host or candidate claim', async () => {
  const f = fixture(), service = createCockpitSessionService(f.root);
  try {
    assert.throws(() => service.bindResourceIdentity({ digest: 'bad', version: '1' }), /resource_identity_invalid/);
    service.bindResourceIdentity({ digest: 'a'.repeat(64), version: '0.31.0' });
    const first = (await service.render())._meta.agdf_cockpit;
    const second = (await service.render())._meta.agdf_cockpit;
    assert.notEqual(first.session_id, second.session_id);
    assert.deepEqual(first.provenance, { schema_version: '1', version: '0.31.0', resource_digest: 'sha256:' + 'a'.repeat(64),
      resource_scope: 'server_validated', host_display: 'unconfirmed', candidate_match: 'unverified' });
    assert.deepEqual(second.provenance, first.provenance);
    assert.throws(() => service.bindResourceIdentity({ digest: 'b'.repeat(64), version: '0.31.0' }), /resource_identity_invalid/);
  } finally { await service.close(); f.close(); }
});

test('integration surface reports only the configured supported adapter, without host confirmation', async () => {
  const f = fixture(), codex = createCockpitSessionService(f.root, { integrationSurface: 'codex' });
  const unknown = createCockpitSessionService(f.root, { integrationSurface: 'other' });
  try {
    assert.equal((await codex.render())._meta.agdf_cockpit.integration_surface, 'codex');
    assert.equal((await unknown.render())._meta.agdf_cockpit.integration_surface, undefined);
  } finally { await codex.close(); await unknown.close(); f.close(); }
});
