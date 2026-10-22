// Adapts already validated release observations into the existing comparison vocabulary.
// Only measured facts are projected: a passing release case never proves unobserved skills/UI.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { containedOutput, jsonDigest, sha } from '../native-probes/lib/release-candidate.mjs';

export function projectNativeRelease(root, rows, candidate) {
  const manifestPath = containedOutput(root, 'evals/host-compatibility/manifest.json');
  const original = readFileSync(manifestPath, 'utf8'), manifest = JSON.parse(original);
  const scopes = [...new Set(rows.map(({record}) => `${record.environment.host}-${record.environment.surface}`))];
  const prefix = scopes.length === 1 ? scopes[0] : 'claude';
  const publicPath = `docs/compatibility/evidence/${prefix}-release-${candidate.candidate_id}.json`;
  const observationPath = `evals/host-compatibility/observations/${prefix}-release-${candidate.candidate_id}.json`;
  const summary = rows.map(({ record }) => ({ id: record.id, candidate_id: record.candidate_id, environment: record.environment,
    scenario: record.scenario, result: record.result, assurance: record.assurance, loaded_identity: record.loaded_identity,
    primary_references: record.references }));
  const publicBytes = `${JSON.stringify(summary, null, 2)}\n`, publicDigest = sha(publicBytes);
  const observations = [], targets = new Map();
  for (const { record } of rows) {
    const e = record.environment, identity = record.loaded_identity;
    const expected = { canonical_version: identity.version, source_digest: identity.source_digest, runtime_digest: identity.runtime_digest };
    const environment = { host: e.host, variant: e.surface, host_version: e.version, os: e.os, target_os: null,
      path: 'primary/native', permission: 'explicit_test_scope', trust: record.assurance, activation: 'deliberate_native_test',
      runtime_version: e.node, sdk_version: null, model: e.model, fixture_version: null, condition: 'release_qualification' };
    const lane = e.surface === 'desktop-code' ? 'human_uat' : 'fresh_host';
    const mechanism = `${e.host}_${e.surface}_native_release`;
    const add = (claim, facts) => observations.push({ schema_version: 1, id: `${record.id}.${claim}`, scenario: record.scenario,
      observed_at: record.recorded_at, environment, expected, observed: expected, source_fingerprint: null,
      lane, method: lane === 'human_uat' ? 'human_observation' : 'fresh_host_observation', claim, mechanism, facts,
      original: { result: record.result, evidence_class: record.assurance }, references: [{ path: publicPath, sha256: publicDigest }],
      publication: { reviewed: true, evidence: publicPath, method: 'reviewed_native_release_facts' } });
    if (record.scenario === 'dispatch' || record.scenario === 'session') add('installed', { payload_present: true, payload_digest: identity.source_digest });
    const call = record.steps?.find(step => step.name === record.scenario)?.evidence ?? record.transition;
    if (record.scenario === 'upgrade' && call?.baseline?.source_digest) add('updated', { update_observed: true,
      previous_digest: call.baseline.source_digest, payload_digest: identity.source_digest, fresh_session_observed: true });
    if (record.scenario === 'recovery' && call?.permission_preserved === true) add('recoverable', { failure_observed: true,
      recovery_observed: true, foreign_preserved: call.preserved_foreign_state, permission_preserved: call.permission_preserved,
      previous_digest: call.baseline.source_digest, recovered_digest: identity.source_digest, unresolved: [] });
    targets.set(jsonDigest(environment), { environment, lane, mechanisms: Object.fromEntries(['installed','updated','recoverable'].map(claim => [claim, mechanism])) });
  }
  const created = []; let metadataWritten = false;
  try {
    for (const [relative, bytes] of [[publicPath, publicBytes], [observationPath, `${JSON.stringify(observations, null, 2)}\n`]]) {
      const path = containedOutput(root, relative); assert.ok(!existsSync(path), 'native_projection_exists');
      mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes, { flag: 'wx' }); created.push(path);
    }
    assert.equal(readFileSync(manifestPath, 'utf8'), original, 'native_manifest_changed_during_import');
    manifest.native_sources.push(observationPath); manifest.public_evidence.push(publicPath);
    manifest.native_targets.push(...targets.values());
    metadataWritten = true;
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  } catch (error) {
    for (const path of created) rmSync(path, { force: true });
    // The only shared metadata write is last; restore only when this call wrote it.
    if (metadataWritten) writeFileSync(manifestPath, original);
    throw error;
  }
  return { observationPath, publicPath, projected_claims: [...new Set(observations.map(row => row.claim))] };
}
