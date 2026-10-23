import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const CLI_CASES = Object.freeze(['dispatch', 'failure_case', 'skill_continuation', 'upgrade', 'recovery']);
export const DESKTOP_CASES = Object.freeze(['session', 'upgrade', 'recovery']);
export const DESKTOP_TARGETS = Object.freeze([
  { host: 'codex', surface: 'desktop-code', os: 'observed', scenarios: [...DESKTOP_CASES] },
  { host: 'claude', surface: 'desktop-code', os: 'win32', scenarios: [...DESKTOP_CASES] },
]);
// Schema 3: the mandatory matrix is CLI; Desktop surfaces are reported, optional and non-gating.
export const CLI_TARGETS = Object.freeze([
  { host: 'claude', surface: 'cli', os: 'win32', scenarios: [...CLI_CASES] },
  { host: 'codex', surface: 'cli', os: 'darwin', scenarios: [...CLI_CASES] },
]);
const UNQUALIFIED = [{ host: 'codex', surface: 'cli', os: 'linux' }, { host: 'codex', surface: 'cli', os: 'win32' }];
export function releasePolicy(root) {
  const definition = JSON.parse(readFileSync(join(root, 'plugins/agdf/meta/agdf-plugin.definition.json'), 'utf8'));
  const policy = definition.hostSupport;
  assert.ok([1, 2, 3].includes(policy?.schema_version), 'release_host_policy_missing_or_unsupported');
  assert.deepEqual(policy.tiers, { codex: 'qualification_target', claude: 'qualification_target', copilot: 'experimental', opencode: 'experimental' });
  const codex = policy.schema_version === 1 ? policy.codex : policy.optional_cli?.codex;
  assert.deepEqual(codex?.platforms, ['linux', 'win32']);
  assert.equal(codex.codex_version, '0.157.1'); assert.equal(codex.model, 'gpt-6-luna');
  if (policy.schema_version === 1) {
    assert.deepEqual(policy.claude.platforms, ['win32']);
    assert.deepEqual(policy.claude.surfaces, ['cli', 'desktop-code']);
  } else if (policy.schema_version === 2) {
    assert.deepEqual(policy.required_targets, DESKTOP_TARGETS, 'release_desktop_targets_invalid');
    assert.deepEqual(policy.optional_cli.claude, { platforms: ['win32'] });
  } else {
    assert.deepEqual(policy.required_targets, CLI_TARGETS, 'release_cli_targets_invalid');
    assert.deepEqual(policy.reported_desktop, DESKTOP_TARGETS, 'release_reported_desktop_invalid');
    // Claude CLI is mandatory now, so the optional diagnostic scope is Codex Linux/Windows only.
    assert.deepEqual(Object.keys(policy.optional_cli), ['codex'], 'release_optional_cli_scope_invalid');
  }
  if (policy.schema_version !== 1) assert.deepEqual(policy.unqualified, UNQUALIFIED, 'release_unqualified_scope_invalid');
  return { version: definition.version, ...policy };
}
export function optionalCliCases(policy, host) {
  const rows = [];
  const cli = policy.schema_version === 1 ? policy : policy.optional_cli;
  if ((!host || host === 'codex') && cli.codex) for (const os of cli.codex.platforms) for (const scenario of CLI_CASES)
    rows.push({ host: 'codex', surface: 'cli', os, scenario });
  if ((!host || host === 'claude') && cli.claude) for (const os of cli.claude.platforms) for (const scenario of CLI_CASES)
    rows.push({ host: 'claude', surface: 'cli', os, scenario });
  assert.ok(rows.length, 'unknown_release_host'); return rows;
}
function targetCases(targets, host, lockedTuples) {
  const selected = targets.filter(row => !host || row.host === host);
  assert.ok(selected.length, 'unknown_release_host');
  return selected.flatMap(target => {
    const tuples = lockedTuples.filter(t => t.host === target.host && t.surface === target.surface);
    // "observed" is an unresolved evidence obligation, never a supported-OS wildcard.
    // Compare flat tuples independent of key order; a reordered copy is the same tuple.
    if (tuples.length) assert.equal(new Set(tuples.map(t => JSON.stringify(Object.entries(t).sort(([a], [b]) => a.localeCompare(b, 'en'))))).size, 1, 'release_target_tuple_ambiguous');
    const os = target.os === 'observed' ? tuples[0]?.os ?? 'observed' : target.os;
    return target.scenarios.map(scenario => ({ host: target.host, surface: target.surface, os, scenario }));
  });
}
export function requiredReleaseCases(policy, host, lockedTuples = []) {
  assert.ok([1, 2, 3].includes(policy?.schema_version), 'release_policy_schema_unsupported');
  if (policy.schema_version === 1) {
    const rows = optionalCliCases(policy, host);
    if (!host || host === 'claude') for (const scenario of DESKTOP_CASES)
      rows.push({ host: 'claude', surface: 'desktop-code', os: 'win32', scenario });
    return rows;
  }
  return targetCases(policy.required_targets, host, lockedTuples);
}
// Reported Desktop surfaces may carry strict, complete evidence, but never a publication obligation.
export function optionalDesktopCases(policy, host, lockedTuples = []) {
  assert.equal(policy?.schema_version, 3, 'optional_desktop_requires_cli_policy');
  return targetCases(policy.reported_desktop, host, lockedTuples);
}
export const caseKey = row => [row.host, row.surface, row.os, row.scenario].join(':');
