import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const CLI_CASES = Object.freeze(['dispatch', 'failure_case', 'skill_continuation', 'upgrade', 'recovery']);
export const DESKTOP_CASES = Object.freeze(['session', 'upgrade', 'recovery']);
export const DESKTOP_TARGETS = Object.freeze([
  { host: 'codex', surface: 'desktop-code', os: 'observed', scenarios: [...DESKTOP_CASES] },
  { host: 'claude', surface: 'desktop-code', os: 'win32', scenarios: [...DESKTOP_CASES] },
]);
export function releasePolicy(root) {
  const definition = JSON.parse(readFileSync(join(root, 'plugins/agdf/meta/agdf-plugin.definition.json'), 'utf8'));
  const policy = definition.hostSupport;
  assert.ok([1, 2].includes(policy?.schema_version), 'release_host_policy_missing_or_unsupported');
  assert.deepEqual(policy.tiers, { codex: 'qualification_target', claude: 'qualification_target', copilot: 'experimental', opencode: 'experimental' });
  const codex = policy.schema_version === 1 ? policy.codex : policy.optional_cli?.codex;
  assert.deepEqual(codex?.platforms, ['linux', 'win32']);
  assert.equal(codex.codex_version, '0.157.1'); assert.equal(codex.model, 'gpt-6-luna');
  if (policy.schema_version === 1) {
    assert.deepEqual(policy.claude.platforms, ['win32']);
    assert.deepEqual(policy.claude.surfaces, ['cli', 'desktop-code']);
  } else {
    assert.deepEqual(policy.required_targets, DESKTOP_TARGETS, 'release_desktop_targets_invalid');
    assert.deepEqual(policy.optional_cli.claude, { platforms: ['win32'] });
    assert.deepEqual(policy.unqualified, [
      { host: 'codex', surface: 'cli', os: 'linux' }, { host: 'codex', surface: 'cli', os: 'win32' },
    ], 'release_unqualified_scope_invalid');
  }
  return { version: definition.version, ...policy };
}
export function optionalCliCases(policy, host) {
  const rows = [];
  const cli = policy.schema_version === 2 ? policy.optional_cli : policy;
  if (!host || host === 'codex') for (const os of cli.codex.platforms) for (const scenario of CLI_CASES)
    rows.push({ host: 'codex', surface: 'cli', os, scenario });
  if (!host || host === 'claude') for (const os of cli.claude.platforms) for (const scenario of CLI_CASES)
    rows.push({ host: 'claude', surface: 'cli', os, scenario });
  assert.ok(rows.length, 'unknown_release_host'); return rows;
}
export function requiredReleaseCases(policy, host, lockedTuples = []) {
  assert.ok([1, 2].includes(policy?.schema_version), 'release_policy_schema_unsupported');
  if (policy.schema_version === 1) {
    const rows = optionalCliCases(policy, host);
    if (!host || host === 'claude') for (const scenario of DESKTOP_CASES)
      rows.push({ host: 'claude', surface: 'desktop-code', os: 'win32', scenario });
    return rows;
  }
  const targets = policy.required_targets.filter(row => !host || row.host === host);
  assert.ok(targets.length, 'unknown_release_host');
  return targets.flatMap(target => {
    const tuples = lockedTuples.filter(t => t.host === target.host && t.surface === target.surface);
    // "observed" is an unresolved evidence obligation, never a supported-OS wildcard.
    if (tuples.length) assert.equal(new Set(tuples.map(t => JSON.stringify(t))).size, 1, 'desktop_target_tuple_ambiguous');
    const os = target.os === 'observed' ? tuples[0]?.os ?? 'observed' : target.os;
    return target.scenarios.map(scenario => ({ host: target.host, surface: target.surface, os, scenario }));
  });
}
export const caseKey = row => [row.host, row.surface, row.os, row.scenario].join(':');
