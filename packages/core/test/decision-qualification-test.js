import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { evaluateDecisionAppQualification, inspectDecisionAppQualification, DECISION_APP_OBSERVATIONS } from '../lib/runtime/plugin-provenance.js';
const root = mkdtempSync(join(tmpdir(), 'agdf-qualification-contract-'));
try {
  mkdirSync(join(root, 'qualification'));
  const path = 'qualification/synthetic.log', bytes = 'Synthetic contract fixture; no native observation.';
  writeFileSync(join(root, path), bytes);
  const hash = createHash('sha256').update(bytes).digest('hex'), client = { name: 'Synthetic client', version: '1' };
  const candidate = Object.fromEntries(['server_digest', 'dispatcher_digest', 'sdk_digest', 'resource_digest'].map(key => [key, hash]));
  const record = { schema_version: 1, result: 'qualified', surface: 'codex', host: { ...client, os: process.platform, arch: process.arch },
    candidate, observations: [...DECISION_APP_OBSERVATIONS], evidence: [{ path, digest: hash }], assurance: 'cooperative_local', authorizes: false };
  const expected = { ...candidate, client };
  assert.deepEqual(inspectDecisionAppQualification(root, null, expected), { qualified: false, reason: 'qualification_record_missing', authorizes: false });
  assert.equal(inspectDecisionAppQualification(root, record, { ...expected, client: undefined }).reason, 'host_context_unavailable');
  assert.equal(inspectDecisionAppQualification(root, { ...record, host: { ...record.host, version: 'other' } }, expected).reason, 'qualification_host_mismatch');
  assert.deepEqual(inspectDecisionAppQualification(root, { ...record, candidate: { ...candidate, resource_digest: 'a'.repeat(64) } }, expected).fields, ['resource_digest']);
  assert.deepEqual(inspectDecisionAppQualification(root, { ...record, observations: record.observations.slice(1) }, expected).missing_observations, [DECISION_APP_OBSERVATIONS[0]]);
  assert.deepEqual(inspectDecisionAppQualification(root, record, expected), { qualified: true, reason: null, authorizes: false });
  assert.equal(evaluateDecisionAppQualification(root, record, expected), true, 'Validator contract only; fixture is not native qualification.');
  for (const altered of [null, { ...record, authorizes: true }, { ...record, surface: 'claude' },
    { ...record, confirmed: true }, { ...record, assurance: 'independent_human_proof' },
    { ...record, observations: record.observations.slice(1) }, { ...record, evidence: [] },
    { ...record, host: { ...record.host, version: 'different' } },
    { ...record, candidate: { ...candidate, resource_digest: 'a'.repeat(64) } },
    { ...record, evidence: [{ path: '../outside.log', digest: hash }] }]) assert.equal(evaluateDecisionAppQualification(root, altered, expected), false);
  assert.equal(evaluateDecisionAppQualification(root, record, { ...expected, client: undefined }), false);
  writeFileSync(join(root, path), 'Changed evidence'); assert.equal(inspectDecisionAppQualification(root, record, expected).reason, 'qualification_evidence_digest_mismatch'); assert.equal(evaluateDecisionAppQualification(root, record, expected), false);
  rmSync(join(root, path)); symlinkSync(join(root, 'elsewhere.log'), join(root, path));
  writeFileSync(join(root, 'elsewhere.log'), bytes); assert.equal(inspectDecisionAppQualification(root, record, expected).reason, 'qualification_evidence_symlink'); assert.equal(evaluateDecisionAppQualification(root, record, expected), false);
  console.log('Private qualification tuple/evidence containment, exact host/candidate/hash binding and unknown/missing/tampered/symlink rejection passed (synthetic contract only).');
} finally { rmSync(root, { recursive: true, force: true }); }
