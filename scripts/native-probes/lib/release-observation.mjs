import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, lstatSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { caseKey, CLI_CASES, requiredReleaseCases } from './release-policy.mjs';
import { containedFile, jsonDigest, sha } from './release-candidate.mjs';
import { mcpCalls } from './codex-trace.mjs';
import { parseClaudeStream } from './claude-session.mjs';

const text = value => typeof value === 'string' && value.length > 0 && !/^(?:unknown|current|latest|pending|unverified)$/iu.test(value);
export function assertTuple(tuple) {
  assert.ok(tuple && ['codex', 'claude'].includes(tuple.host), 'host_tuple_missing');
  assert.ok(['cli', 'desktop-code'].includes(tuple.surface), 'surface_tuple_missing');
  assert.ok(['linux', 'win32', 'darwin'].includes(tuple.os), 'os_tuple_missing');
  for (const key of ['arch', 'version', 'node', 'model']) assert.ok(text(tuple[key]), `tuple_${key}_missing`);
  assert.match(tuple.version, /^\d+\.\d+\.\d+(?:[.+-].*)?$/u);
  assert.match(tuple.node, /^v?(?:2[2-9]|[3-9]\d)\./u, 'unsupported_node_tuple');
  return tuple;
}
export function referencesFrom(root, files) {
  return files.map(path => ({ path, sha256: sha(readFileSync(containedFile(root, path))) }));
}
export function assertReferences(root, references) {
  assert.ok(Array.isArray(references) && references.length > 0 && references.length <= 32, 'native_references_missing');
  const paths = new Set(); let total = 0;
  for (const ref of references) {
    assert.ok(!paths.has(ref.path), 'duplicate_native_reference'); paths.add(ref.path);
    const bytes = readFileSync(containedFile(root, ref.path)); total += bytes.length;
    assert.ok(total <= 32 * 1024 * 1024, 'native_bundle_too_large');
    assert.equal(sha(bytes), ref.sha256, 'native_reference_changed');
  }
}
export function releaseRecords(directory) {
  const rows = [];
  function visit(path, depth = 0) {
    assert.ok(depth <= 8, 'evidence_depth_limit');
    for (const name of readdirSync(path).sort()) {
      const file = join(path, name), stat = lstatSync(file);
      assert.ok(!stat.isSymbolicLink(), 'evidence_symlink');
      if (stat.isDirectory()) { if (name !== 'work-tmp') visit(file, depth + 1); }
      else if (name === 'release-records.json' || /^desktop-(?:session|upgrade|recovery)\.json$/u.test(name)) {
        assert.ok(stat.size <= 1024 * 1024, 'native_observation_too_large');
        const data = JSON.parse(readFileSync(file, 'utf8'));
        for (const record of Array.isArray(data) ? data : [data]) rows.push({ record, directory: path });
      }
    }
  }
  visit(directory); return rows;
}
function assertTransition(transition, scenario) {
  assert.equal(transition?.baseline?.version, '0.14.5');
  assert.match(transition.baseline.integrity, /^sha512-/u);
  assert.match(transition.baseline.source_digest, /^[0-9a-f]{64}$/u);
  assert.equal(transition.preserved_foreign_state, true);
  assert.equal(transition.permission_preserved, true);
  if (scenario === 'recovery') assert.equal(transition.repair, 'owned_stale_install');
}
export function assertNativeRecord(record, { candidate, policy, directory, commit, lockedTuples }) {
  assert.equal(record.schema_version, 2, 'release_observation_schema');
  assert.ok(text(record.id) && Number.isFinite(Date.parse(record.recorded_at)), 'native_observation_identity');
  assertTuple(record.environment);
  const key = { ...record.environment, scenario: record.scenario };
  assert.ok(requiredReleaseCases(policy).some(row => caseKey(row) === caseKey(key)), 'native_case_unexpected');
  assert.equal(record.result, 'pass', 'native_case_not_passed');
  assert.equal(record.candidate_id, candidate.candidate_id, 'native_candidate_mismatch');
  assert.equal(record.policy_digest, candidate.policy_digest, 'native_policy_mismatch');
  assert.equal(record.tuple_digest, jsonDigest(record.environment), 'native_tuple_modified');
  assert.equal(record.source?.dirty, false, 'native_source_dirty');
  assert.match(record.source?.commit ?? '', /^[a-f0-9]{40}$/u, 'native_source_commit_missing');
  assert.deepEqual(record.loaded_identity, candidate.identities.agdf, 'native_loaded_identity_mismatch');
  assertReferences(directory, record.references);
  const tuple = record.environment;
  if (tuple.host === 'codex') {
    assert.equal(record.source.commit, commit, 'native_codex_release_commit_mismatch');
    assert.equal(tuple.version, policy.codex.codex_version); assert.equal(tuple.model, policy.codex.model);
  } else {
    assert.ok(Array.isArray(lockedTuples) && lockedTuples.some(item => jsonDigest(item) === record.tuple_digest), 'claude_tuple_not_reviewed');
  }
  if (tuple.surface === 'desktop-code') {
    assert.equal(record.assurance, 'operator_observed');
    assert.ok(text(record.session_id) && record.references.length >= 2, 'desktop_observation_missing');
    for (const field of ['coding_surface', 'fresh_session', 'candidate_loaded', 'agdf_access', 'cleanup']) assert.equal(record.observations?.[field], true, `desktop_${field}_missing`);
    assert.ok(record.references.some(ref => /\.(?:json|jsonl|log)$/u.test(ref.path)) && record.references.some(ref => /\.(?:png|jpg|webp)$/u.test(ref.path)), 'desktop_primary_capture_missing');
    if (['upgrade', 'recovery'].includes(record.scenario)) assertTransition(record.transition, record.scenario);
  } else {
    assert.equal(record.assurance, 'native_process');
    const steps = record.steps;
    assert.ok(Array.isArray(steps), 'native_steps_missing');
    assert.equal(new Set(steps.map(row => row.name)).size, steps.length, 'native_steps_duplicate');
    for (const name of ['host', 'install', 'discovery', 'removal', record.scenario]) {
      const step = steps.find(row => row.name === name); assert.equal(step?.status, 'pass', `native_step_missing:${name}`);
    }
    assert.ok(steps.every(row => row.status === 'pass'), 'native_step_failed');
    const call = steps.find(row => row.name === record.scenario).evidence;
    assert.ok(record.references.some(ref => ref.path === 'host-process.json'), 'native_host_capture_missing');
    const hostCapture = JSON.parse(readFileSync(containedFile(directory, 'host-process.json'), 'utf8'));
    assert.equal(hostCapture.status, 0, 'native_host_failed');
    const versionParts = hostCapture.stdout.trim().split(/\s+/u);
    assert.equal(tuple.version, tuple.host === 'codex' ? versionParts.at(-1) : versionParts[0], 'native_host_version_mismatch');
    const primaryName = record.references.find(ref => ref.path === `${record.scenario}-primary.json`)?.path
      ?? record.references.find(ref => ref.path === `${record.scenario}-process.json`)?.path;
    assert.ok(primaryName, 'native_primary_case_capture_missing');
    const primary = JSON.parse(readFileSync(containedFile(directory, primaryName), 'utf8'));
    assert.equal(primary.status, 0, 'primary_native_exit_failed');
    let captured, observedModels;
    if (tuple.host === 'codex') {
      const texts = Array.isArray(primary.rollouts) ? primary.rollouts : [primary.stdout];
      const calls = mcpCalls(texts); assert.equal(calls.length, 1, 'primary_native_calls'); captured = calls[0];
      const models = texts.flatMap(text => String(text).split('\n').flatMap(line => {
        try { const value = JSON.parse(line); return value.type === 'turn_context' && value.payload?.model ? [value.payload.model] : []; } catch { return []; }
      }));
      observedModels = [...new Set(models)];
    } else {
      const parsed = parseClaudeStream(primary.stdout);
      assert.ok(parsed.calls.every(item => [ 'mcp__plugin_agdf_agdf__agdf_dispatch', 'ToolSearch' ].includes(item.name)), 'primary_unexpected_native_tool');
      const calls = parsed.calls.filter(item => item.name === 'mcp__plugin_agdf_agdf__agdf_dispatch');
      assert.equal(calls.length, 1, 'primary_native_calls');
      const result = JSON.parse(calls[0].result?.text ?? 'null'); assert.ok(result, 'primary_native_result_missing');
      captured = { ...result, runtime_digest: result.runtime?.runtime_digest,
        contract_modules: result.continuation?.runtime_contracts?.map(module => module.module),
        contracts_verified: Array.isArray(result.continuation?.runtime_contracts) && result.continuation.runtime_contracts.length > 0
          && result.continuation.runtime_contracts.every(module => typeof module.content === 'string' && sha(module.content) === module.sha256) };
      observedModels = parsed.init?.model ? [parsed.init.model] : [];
      assert.equal(primary.status, 0, 'primary_native_exit_failed');
    }
    assert.deepEqual(observedModels, [tuple.model], 'primary_model_mismatch');
    assert.equal(captured.outcome, call.outcome, 'primary_outcome_mismatch');
    assert.equal(captured.authorizes, false, 'primary_authority_mismatch');
    assert.equal(captured.terminal, record.scenario !== 'skill_continuation', 'primary_terminal_mismatch');
    if (tuple.host === 'codex') assert.equal(captured.plugin_id, 'agdf@agdf', 'primary_plugin_mismatch');
    if (record.scenario !== 'failure_case') assert.equal(captured.runtime_digest, call.runtime_digest, 'primary_runtime_mismatch');
    if (record.scenario === 'skill_continuation') {
      assert.equal(captured.contracts_verified, true, 'primary_contracts_unverified');
      assert.deepEqual(captured.contract_modules, ['quality', 'context-graph'], 'primary_contract_modules_missing');
    }
    assert.equal(call.exec_status, 0); assert.equal(call.calls, 1);
    assert.deepEqual(call.observed_models, [tuple.model]);
    assert.equal(call.authorizes, false);
    if (record.scenario !== 'failure_case') assert.equal(call.runtime_digest, candidate.identities.mcp_dispatcher?.digest, 'native_executed_runtime_mismatch');
    if (record.scenario === 'failure_case') assert.equal(call.outcome, 'invalid_input');
    else if (record.scenario === 'skill_continuation') { assert.equal(call.outcome, 'skill_continuation'); assert.equal(call.contracts_verified, true); }
    else assert.equal(call.outcome, 'control_result');
    const cleanup = steps.find(row => row.name === 'removal').evidence;
    for (const path of ['uninstall-process.json', 'removal-process.json']) {
      assert.ok(record.references.some(ref => ref.path === path), 'native_cleanup_capture_missing');
      const process = JSON.parse(readFileSync(containedFile(directory, path), 'utf8'));
      assert.equal(process.status, 0, 'native_cleanup_process_failed');
    }
    assert.ok(cleanup && Object.keys(cleanup).length >= 4, 'native_cleanup_missing');
    const leftovers = tuple.host === 'codex' ? ['mcp_listed','config_mcp_section','plugin_cache','mcp_runtime','plugin_tool_policy']
      : ['mcp_listed','plugin_data','enabled','permission_rules','user_mcp','installed_entry'];
    for (const name of leftovers) assert.ok(cleanup[name] === false || cleanup[name] === 0, `native_cleanup_failed:${name}`);
    for (const [name, value] of Object.entries(cleanup)) if (!['kept_by_design','stderr','uninstall_status'].includes(name))
      assert.ok(value === false || value === 0, `native_cleanup_failed:${name}`);
    if (tuple.host === 'codex') {
      assert.equal(steps.find(row => row.name === 'installation_consent')?.evidence.mcp_approval?.status, 'configured');
      assert.equal(call.plugin_id, 'agdf@agdf');
    }
    if (['upgrade', 'recovery'].includes(record.scenario)) {
      assertTransition(call, record.scenario);
    }
  }
  return caseKey(key);
}
export function assertHostReleaseEvidence(rows, options) {
  const expected = requiredReleaseCases(options.policy, options.host).map(caseKey).sort();
  const seen = rows.map(({ record, directory }) => assertNativeRecord(record, { ...options, directory }));
  const tuples = new Map();
  for (const { record } of rows) {
    const e = record.environment, scope = [e.host, e.surface, e.os].join(':');
    if (tuples.has(scope)) assert.equal(record.tuple_digest, tuples.get(scope), 'native_tuple_changed_between_cases');
    else tuples.set(scope, record.tuple_digest);
  }
  assert.deepEqual(seen.sort(), expected, 'native_required_matrix_missing_or_duplicate');
  assert.equal(new Set(rows.map(({ record }) => record.id)).size, rows.length, 'duplicate_observation_id');
  return { result: 'pass', candidate_id: options.candidate.candidate_id, cases: seen, authorizes: false };
}
export function emitReleaseRecords({ observation, candidate, directory, host, scenario, loadedIdentity, tuple }) {
  if (!candidate) return; // Old diagnostics remain explicitly outside release-grade evidence.
  const environment = tuple ?? { host, surface: 'cli', os: observation.host.os, arch: observation.host.arch,
    version: observation.host.version, node: observation.host.node, model: observation.model ?? observation.requested_model };
  const files = readdirSync(directory).filter(name => /(?:-process\.json|primary\.json)$/u.test(name));
  const records = (scenario ? [scenario] : CLI_CASES).map(caseName => ({ schema_version: 2,
    id: `${host}-${observation.recorded_at.replace(/[^0-9]/gu, '')}-${caseName}`, recorded_at: observation.recorded_at,
    environment, tuple_digest: jsonDigest(environment), source: observation.source, candidate_id: candidate.candidate_id,
    policy_digest: candidate.policy_digest, scenario: caseName, result: observation.result,
    assurance: 'native_process', loaded_identity: loadedIdentity ?? null,
    steps: observation.steps.filter(step => !CLI_CASES.includes(step.name) || step.name === caseName), references: referencesFrom(directory, files) }));
  writeFileSync(join(directory, 'release-records.json'), `${JSON.stringify(records, null, 2)}\n`);
}
