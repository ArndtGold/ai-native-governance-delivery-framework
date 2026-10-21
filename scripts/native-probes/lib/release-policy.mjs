import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const CLI_CASES = Object.freeze(['dispatch', 'failure_case', 'skill_continuation', 'upgrade', 'recovery']);
export const DESKTOP_CASES = Object.freeze(['session', 'upgrade', 'recovery']);
export function releasePolicy(root) {
  const definition = JSON.parse(readFileSync(join(root, 'plugins/agdf/meta/agdf-plugin.definition.json'), 'utf8'));
  const policy = definition.hostSupport;
  assert.equal(policy?.schema_version, 1, 'release_host_policy_missing');
  assert.deepEqual(policy.tiers, { codex: 'qualification_target', claude: 'qualification_target', copilot: 'experimental', opencode: 'experimental' });
  assert.deepEqual(policy.codex.platforms, ['linux', 'win32']);
  assert.match(policy.codex.codex_version, /^\d+\.\d+\.\d+$/u);
  assert.ok(policy.codex.model);
  assert.deepEqual(policy.claude.platforms, ['win32']);
  assert.deepEqual(policy.claude.surfaces, ['cli', 'desktop-code']);
  return { version: definition.version, ...policy };
}
export function requiredReleaseCases(policy, host) {
  const rows = [];
  if (!host || host === 'codex') for (const os of policy.codex.platforms) for (const scenario of CLI_CASES) rows.push({ host: 'codex', surface: 'cli', os, scenario });
  if (!host || host === 'claude') {
    for (const scenario of CLI_CASES) rows.push({ host: 'claude', surface: 'cli', os: 'win32', scenario });
    for (const scenario of DESKTOP_CASES) rows.push({ host: 'claude', surface: 'desktop-code', os: 'win32', scenario });
  }
  assert.ok(rows.length, 'unknown_release_host');
  return rows;
}
export const caseKey = row => [row.host, row.surface, row.os, row.scenario].join(':');
