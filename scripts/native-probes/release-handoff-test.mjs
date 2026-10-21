import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { candidateFixture } from './test-support.mjs';
import { jsonDigest, sha } from './lib/release-candidate.mjs';
import { releasePolicy, requiredReleaseCases } from './lib/release-policy.mjs';
import { assertHostReleaseEvidence, referencesFrom, releaseRecords } from './lib/release-observation.mjs';
import { assertBundleReview, bundleDigest, importClaudeEvidence, runReleaseTool } from './lib/release-handoff.mjs';

function nativeFixtures(f, host) {
  const root = mkdtempSync(join(tmpdir(), 'agdf-native-fixture-'));
  const policy = releasePolicy(f.root);
  const rows = requiredReleaseCases(policy, host).map((item, i) => {
    const directory = join(root, String(i)); mkdirSync(directory);
    const environment = { host: item.host, surface: item.surface, os: item.os, arch: 'x64', node: 'v22.22.3',
      version: item.host === 'codex' ? policy.codex.codex_version : '2.1.193', model: item.host === 'codex' ? policy.codex.model : 'fixture-model' };
    const result = { schema_version: '1', outcome: item.scenario === 'failure_case' ? 'invalid_input' : item.scenario === 'skill_continuation' ? 'skill_continuation' : 'control_result',
      terminal: item.scenario !== 'skill_continuation', authorizes: false, runtime: { runtime_digest: f.candidate.identities.mcp_dispatcher.digest } };
    if (item.scenario === 'skill_continuation') result.continuation = { runtime_contracts: ['quality','context-graph'].map(module => ({ module, content: module, sha256: sha(module) })) };
    let record = { schema_version: 2, id: `fixture-${item.host}-${i}`, recorded_at: '2026-10-20T12:00:00Z', environment,
      tuple_digest: jsonDigest(environment), source: f.candidate.source_revision, candidate_id: f.candidate.candidate_id, policy_digest: f.candidate.policy_digest,
      scenario: item.scenario, result: 'pass', loaded_identity: f.candidate.identities.agdf, assurance: 'native_process' };
    if (item.surface === 'desktop-code') {
      writeFileSync(join(directory, 'native.json'), JSON.stringify({ fixture: true, result }));
      writeFileSync(join(directory, 'capture.png'), 'deterministic fixture image; not native evidence');
      writeFileSync(join(directory, 'native.log'), 'synthetic fixture\r\nsecond line\r\n');
      record = { ...record, assurance: 'operator_observed', session_id: 'fixture-session',
        ...(['upgrade','recovery'].includes(item.scenario) ? { transition: { baseline: { version: '0.14.5', integrity: 'sha512-fixture', source_digest: 'c'.repeat(64) }, preserved_foreign_state: true, permission_preserved: true, repair: 'owned_stale_install' } } : {}),
        observations: { coding_surface: true, fresh_session: true, candidate_loaded: true, agdf_access: true, cleanup: true }, references: referencesFrom(directory, ['native.json','capture.png','native.log']) };
    } else {
      const events = item.host === 'codex' ? [
        { type: 'turn_context', payload: { model: environment.model } },
        { item: { id: 'call', type: 'mcp_tool_call', pluginId: 'agdf@agdf', invocation: { tool: 'agdf_dispatch', server: 'agdf' }, result: { content: [{ text: JSON.stringify(result) }] } } },
      ] : [
        { type: 'system', subtype: 'init', model: environment.model },
        { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'call', name: 'mcp__plugin_agdf_agdf__agdf_dispatch' }] } },
        // Claude CLI joins an error reply's machine report and human diagnostic into one string.
        { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'call', ...(item.scenario === 'failure_case'
          ? { is_error: true, content: `${JSON.stringify(result, null, 2)}\nAGDF tool failed: dispatch_input_invalid (working_directory).` }
          : { content: [{ text: JSON.stringify(result) }] }) }] } },
      ];
      const text = events.map(event => JSON.stringify(event)).join('\n');
      const primary = { status: 0, stdout: text, ...(item.host === 'codex' ? { rollouts: [text] } : {}) };
      writeFileSync(join(directory, `${item.scenario}-process.json`), JSON.stringify(primary));
      writeFileSync(join(directory, 'host-process.json'), JSON.stringify({ status: 0, stdout: item.host === 'codex' ? `codex-cli ${environment.version}` : `${environment.version} (Claude Code)` }));
      for (const path of ['uninstall-process.json','removal-process.json']) writeFileSync(join(directory, path), JSON.stringify({ status: 0, stdout: 'fixture native cleanup' }));
      const evidence = { exec_status: 0, calls: 1, observed_models: [environment.model], plugin_id: 'agdf@agdf', outcome: result.outcome,
        terminal: result.terminal, authorizes: false, runtime_digest: result.runtime.runtime_digest, contracts_verified: true,
        baseline: { version: '0.14.5', integrity: 'sha512-fixture', source_digest: 'c'.repeat(64) }, preserved_foreign_state: true, permission_preserved: true, repair: 'owned_stale_install' };
      record.steps = ['host','install','installation_consent','discovery','removal',item.scenario].map(name => ({ name, status: 'pass',
        evidence: name === 'removal' ? { mcp_listed: false, installed_entry: false, plugin_data: false, enabled: false, permission_rules: 0, user_mcp: false, config_mcp_section: false, plugin_cache: false, mcp_runtime: false, plugin_tool_policy: false }
          : name === 'installation_consent' ? { mcp_approval: { status: 'configured' } } : evidence }));
      record.references = referencesFrom(directory, [`${item.scenario}-process.json`, 'host-process.json', 'uninstall-process.json', 'removal-process.json']);
    }
    writeFileSync(join(directory, item.surface === 'desktop-code' ? `desktop-${item.scenario}.json` : 'release-records.json'), JSON.stringify([record]));
    return { record, directory };
  });
  return { root, rows, options: { candidate: f.candidate, policy, host, commit: f.candidate.source_revision.commit,
    lockedTuples: rows.map(row => row.record.environment) } };
}
test('complete matrix accepts real-shaped primary events and rejects missing/forged observations', () => {
  const f = candidateFixture(), data = nativeFixtures(f);
  try {
    assert.equal(data.rows.length, 18);
    assert.equal(assertHostReleaseEvidence(data.rows, data.options).result, 'pass');
    for (const mutate of [rows => rows.pop(), rows => rows.push(rows[0]), rows => rows[0].record.source = { ...rows[0].record.source, dirty: true },
      rows => rows[0].record.candidate_id = '0'.repeat(64), rows => rows[0].record.environment.version = 'latest',
      rows => rows[0].record.steps.at(-1).evidence.calls = 0, rows => rows[0].record.steps.find(row => row.name === 'removal').evidence.enabled = true,
      rows => rows[0].record.references[0].sha256 = '0'.repeat(64), rows => rows[0].record.references[0].path = '../escape',
      rows => rows.at(-1).record.observations.coding_surface = false, rows => delete rows.at(-1).record.transition]) {
      const rows = structuredClone(data.rows); mutate(rows);
      assert.throws(() => assertHostReleaseEvidence(rows, data.options));
    }
    assert.throws(() => assertHostReleaseEvidence(data.rows, { ...data.options, commit: 'f'.repeat(40) }), /commit_mismatch/u);
    assert.throws(() => assertHostReleaseEvidence(data.rows, { ...data.options, lockedTuples: [] }), /tuple_not_reviewed/u);
    const drift = structuredClone(data.rows);
    const changed = drift.at(-1).record;
    changed.environment.version = '3.0.0'; changed.tuple_digest = jsonDigest(changed.environment);
    assert.throws(() => assertHostReleaseEvidence(drift, { ...data.options, lockedTuples: [...data.options.lockedTuples, changed.environment] }), /tuple_changed_between_cases/u);
    // A native call reports the MCP dispatcher projection; the plugin runtime manifest digest is no substitute.
    const { mcp_dispatcher: { digest: dispatcher }, agdf: { runtime_digest: manifest } } = f.candidate.identities;
    assert.notEqual(dispatcher, manifest);
    const executed = data.rows.find(row => row.record.environment.surface === 'cli' && row.record.scenario === 'dispatch');
    const capture = join(executed.directory, 'dispatch-process.json'), bytes = readFileSync(capture, 'utf8');
    const step = executed.record.steps.find(row => row.name === 'dispatch');
    writeFileSync(capture, bytes.replaceAll(dispatcher, manifest)); step.evidence.runtime_digest = manifest;
    executed.record.references = referencesFrom(executed.directory, executed.record.references.map(row => row.path));
    assert.throws(() => assertHostReleaseEvidence(data.rows, data.options), /native_executed_runtime_mismatch/u);
    writeFileSync(capture, bytes); step.evidence.runtime_digest = dispatcher;
    executed.record.references = referencesFrom(executed.directory, executed.record.references.map(row => row.path));
    const primary = data.rows[0];
    const original = readFileSync(join(primary.directory, primary.record.references[0].path));
    writeFileSync(join(primary.directory, primary.record.references[0].path), JSON.stringify({ status: 0, stdout: 'model says PASS' }));
    primary.record.references = referencesFrom(primary.directory, primary.record.references.map(row => row.path));
    assert.throws(() => assertHostReleaseEvidence(data.rows, data.options), /primary_native_calls/u);
    writeFileSync(join(primary.directory, primary.record.references[0].path), original);
    primary.record.references = referencesFrom(primary.directory, primary.record.references.map(row => row.path));
    const claude = data.rows.find(row => row.record.environment.host === 'claude' && row.record.environment.surface === 'cli');
    const path = join(claude.directory, claude.record.references[0].path), captured = JSON.parse(readFileSync(path));
    captured.stdout += `\n${JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', id: 'unexpected', name: 'Bash', input: {} }] } })}`;
    writeFileSync(path, JSON.stringify(captured));
    claude.record.references = referencesFrom(claude.directory, claude.record.references.map(row => row.path));
    assert.throws(() => assertHostReleaseEvidence(data.rows, data.options), /primary_unexpected_native_tool/u);
  } finally { rmSync(f.root, { recursive: true, force: true }); rmSync(data.root, { recursive: true, force: true }); }
});
test('Claude import requires reviewed exact bundle, remains immutable and excludes unrelated files', () => {
  const f = candidateFixture(), data = nativeFixtures(f, 'claude');
  try {
    const review = { schema_version: 1, candidate_id: f.candidate.candidate_id, reviewed: true, reviewer: 'Fixture reviewer',
      bundle_digest: bundleDigest(data.rows), tuples: data.options.lockedTuples };
    assert.throws(() => importClaudeEvidence(f.root, { candidate: f.candidate, bundle: data.root, review: { ...review, reviewed: false } }), /review_required/u);
    writeFileSync(join(data.root, 'unrelated-secret.txt'), 'must not be copied');
    const imported = importClaudeEvidence(f.root, { candidate: f.candidate, bundle: data.root, review });
    assert.equal(imported.result, 'pass');
    assertBundleReview(review, data.rows, f.candidate);
    assert.throws(() => assertBundleReview({ ...review, reviewed: false }, data.rows, f.candidate), /review_required/u);
    assert.throws(() => assertBundleReview({ ...review, bundle_digest: '0'.repeat(64) }, data.rows, f.candidate), /bundle_mismatch/u);
    assert.throws(() => readFileSync(join(imported.destination, 'unrelated-secret.txt')));
    // The import itself is now an uncommitted output: persist it in this disposable fixture only.
    f.git('add', '.'); f.git('commit', '-qm', 'native result only');
    const desktop = data.rows.find(row => row.record.environment.surface === 'desktop-code');
    const nativePath = `evals/host-compatibility/native/${f.candidate.candidate_id}/claude/${desktop.record.id}/native.log`;
    assert.equal(f.git('show', `HEAD:${nativePath}`), 'synthetic fixture\r\nsecond line\r\n', 'Git storage must preserve the bytes referenced by imported Windows captures');
    rmSync(join(f.root, nativePath)); f.git('checkout', '--', nativePath);
    assert.equal(readFileSync(join(f.root, nativePath), 'utf8'), 'synthetic fixture\r\nsecond line\r\n', 'fresh checkout must preserve reference digests');
    assert.equal(assertHostReleaseEvidence(releaseRecords(imported.destination), data.options).result, 'pass');
    assert.throws(() => importClaudeEvidence(f.root, { candidate: f.candidate, bundle: data.root, review }), /already_exists/u);
  } finally { rmSync(f.root, { recursive: true, force: true }); rmSync(data.root, { recursive: true, force: true }); }
});
test('Desktop templates are explicitly unverified and cannot satisfy release acceptance', async () => {
  const f = candidateFixture();
  try {
    const folder = join(f.root, 'probe-results'); mkdirSync(folder);
    const environment = { host: 'claude', surface: 'desktop-code', os: 'win32', arch: 'x64', node: 'v22.22.3', version: '2.1.193', model: 'fixture-model' };
    const candidatePath = join(folder, 'candidate.json'), tuplePath = join(folder, 'tuple.json'), output = join(folder, 'desktop-session.json');
    writeFileSync(candidatePath, JSON.stringify(f.candidate)); writeFileSync(tuplePath, JSON.stringify({ candidate_id: f.candidate.candidate_id, environment, tuple_digest: jsonDigest(environment) }));
    f.put('docs/evidence-only.txt', 'evidence-only fixture commit\n'); f.git('add', '.'); f.git('commit', '-qm', 'evidence only');
    await runReleaseTool(['desktop-template','--candidate',candidatePath,'--tuple',tuplePath,'--output',output], f.root);
    assert.equal(JSON.parse(readFileSync(output)).result, 'unverified');
    assert.equal(JSON.parse(readFileSync(output)).source.commit, f.git('rev-parse','HEAD').trim());
    assert.notEqual(JSON.parse(readFileSync(output)).source.commit, f.candidate.source_revision.commit);
    assert.throws(() => assertHostReleaseEvidence([{ record: JSON.parse(readFileSync(output)), directory: folder }], { candidate: f.candidate, policy: releasePolicy(f.root), host: 'claude' }));
    await assert.rejects(runReleaseTool(['handoff','--candidate',candidatePath,'--output',folder,'--unexpected','value'], f.root), /command_invalid/u);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
test('local validation binds the actual checkout and CI additionally requires its exact trusted SHA', async () => {
  const f = candidateFixture(), data = nativeFixtures(f, 'codex');
  const previous = process.env.GITHUB_SHA;
  try {
    const candidatePath = join(f.root, '.release-candidate.json');
    writeFileSync(candidatePath, JSON.stringify(f.candidate));
    delete process.env.GITHUB_SHA;
    const args = ['validate','--candidate',candidatePath,'--directory',data.root];
    assert.equal((await runReleaseTool(args, f.root)).result, 'pass');
    process.env.GITHUB_SHA = 'f'.repeat(40);
    await assert.rejects(runReleaseTool(args, f.root), /release_checkout_sha_mismatch/u);
  } finally {
    if (previous === undefined) delete process.env.GITHUB_SHA; else process.env.GITHUB_SHA = previous;
    rmSync(f.root, { recursive: true, force: true }); rmSync(data.root, { recursive: true, force: true });
  }
});
