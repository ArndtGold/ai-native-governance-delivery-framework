#!/usr/bin/env node
// Claude CLI native observation producer. Desktop Code observations have a separate operator lane.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createIsolatedClaudeHome, createRedactor, installAgdfForClaude, parseClaudeStream, parseMcpList, repoRoot as repo,
  runClaudeSession, runCommand, summarizeToolSession, withCopiedCredentials } from './lib/claude-session.mjs';
import { readCandidate, validateCandidate, gitIdentity, jsonDigest } from './lib/release-candidate.mjs';
import { emitReleaseRecords } from './lib/release-observation.mjs';
import { CLI_CASES } from './lib/release-policy.mjs';
import { installedIdentity, rootForVersion, releasedBaseline, installBaseline, makeOwnedStale } from './lib/release-lifecycle.mjs';

const TOOL = 'mcp__plugin_agdf_agdf__agdf_dispatch', SERVER = 'plugin:agdf:agdf';
const args = process.argv.slice(2);
const option = (key, fallback = null) => { const i = args.indexOf(key); return i < 0 ? fallback : args[i + 1]; };
const model = option('--model', process.env.AGDF_E2E_MODEL || 'claude-sonnet-5');
const scenario = option('--scenario'), keep = args.includes('--keep');
if (scenario && !CLI_CASES.includes(scenario)) throw Error('CLAUDE_SCENARIO_INVALID');
const candidate = option('--candidate') ? readCandidate(option('--candidate')) : null;
if (candidate) { validateCandidate(repo, candidate); if (!scenario || !option('--tuple')) throw Error('CLAUDE_RELEASE_PREFLIGHT_REQUIRED'); }
const frozenTuple = option('--tuple') ? JSON.parse(readFileSync(option('--tuple'), 'utf8')) : null;
const stamp = new Date().toISOString().replace(/[:.]/gu, '-');
const results = join(repo, 'probe-results', `claude-host-e2e-${stamp}`), work = join(results, 'work-tmp'), target = join(work, 'target');
const { claudeHome, env } = createIsolatedClaudeHome(work);
mkdirSync(target, { recursive: true });
const foreignRule = 'Read(**/agdf-release-sentinel)';
writeFileSync(join(claudeHome, 'settings.json'), JSON.stringify({ permissions: { allow: [foreignRule] } }));
const permissionPreserved = () => JSON.parse(readFileSync(join(claudeHome, 'settings.json'), 'utf8')).permissions?.allow?.includes(foreignRule) === true;
const run = (command, argv, options = {}) => runCommand(command, argv, { env, ...options });
run('git', ['init', '-q'], { cwd: target });
writeFileSync(join(target, 'foreign-sentinel.txt'), 'preserve-native-test-state\n');
const paths = createRedactor([{ path: work, token: '<WORK>' }]);
const secrets = ['CLAUDE_CODE_OAUTH_TOKEN', 'ANTHROPIC_API_KEY'].map(key => env[key]).filter(Boolean);
const redact = value => secrets.reduce((text, secret) => text.replaceAll(secret, '<REDACTED>'), paths(value));
const steps = [];
const step = (name, pass, evidence) => { steps.push({ name, status: pass ? 'pass' : 'fail', evidence }); return pass; };
const observation = { schema_version: 1, kind: 'agdf_claude_host_e2e', recorded_at: new Date().toISOString(), requested_model: model, source: gitIdentity(repo), scenario };
let loadedIdentity = null, baseline = null;
try {
  const version = run('claude', ['--version']);
  writeFileSync(join(results, 'host-process.json'), redact(JSON.stringify(version)));
  observation.host = { client: 'claude-code-cli', version: version.stdout.trim().split(/\s+/u)[0], os: process.platform, arch: process.arch, node: process.version };
  step('host', version.status === 0, { version: observation.host.version });
  const environment = { host: 'claude', surface: 'cli', os: process.platform, arch: process.arch, version: observation.host.version, node: process.version, model };
  if (frozenTuple && (frozenTuple.candidate_id !== candidate?.candidate_id || frozenTuple.tuple_digest !== jsonDigest(environment))) throw Error('CLAUDE_PREFLIGHT_TUPLE_MISMATCH');
  if (['upgrade', 'recovery'].includes(scenario)) {
    baseline = await releasedBaseline(join(work, 'baseline'));
    installBaseline(baseline.cli, 'claude', env);
    baseline.identity = installedIdentity(rootForVersion(work, '0.14.5'), '0.14.5');
  }
  const install = installAgdfForClaude(env);
  observation.agdf = { version: install.report?.plugin?.version?.installed ?? null };
  step('install', install.status === 0 && install.report?.result === 'success', { result: install.report?.result ?? null, effective_state: install.report?.effective_state ?? null });
  if (scenario === 'recovery') {
    makeOwnedStale(rootForVersion(work, candidate?.version ?? observation.agdf.version), candidate?.version ?? observation.agdf.version);
    const repaired = installAgdfForClaude(env);
    step('repair', repaired.status === 0 && repaired.report?.result === 'success', { result: repaired.report?.result ?? null });
  }
  if (candidate) loadedIdentity = installedIdentity(rootForVersion(work, candidate.version), candidate.version);
  const cli = join(repo, 'packages/cli/bin/create-agdf.js');
  const init = run(process.execPath, [cli, 'init', '--dir', target, '--json']);
  const control = run(process.execPath, [cli, 'run-create', '--dir', target, '--run', 'claude-e2e', '--json']);
  step('control_fixture', init.status === 0 && control.status === 0, { init_status: init.status, run_create_status: control.status });
  const listed = run('claude', ['mcp', 'list'], { cwd: target });
  const server = parseMcpList(listed.stdout).find(row => row.name === SERVER);
  step('discovery', listed.status === 0 && server?.status === 'connected', { mcp_list: redact(server?.line ?? '') });
  withCopiedCredentials(claudeHome, ({ available }) => {
    for (const name of scenario ? [scenario] : CLI_CASES.slice(0, 3)) {
      const canRun = available && steps.every(row => row.status === 'pass');
      const input = name === 'failure_case' ? { skill_id: 'gate-check', presentation_language: 'de', working_directory: 'relative/dir' }
        : { skill_id: name === 'skill_continuation' ? 'code-review' : 'gate-check', presentation_language: 'de', working_directory: target,
          target_source: 'explicit_target', primary_target: target, run_id: 'claude-e2e' };
      const prompt = `Call ${TOOL} exactly once with these exact arguments: ${JSON.stringify(input)}. ToolSearch may be used for discovery. Call no other tool; then reply DONE.`;
      const result = canRun ? runClaudeSession({ prompt, model, allowedTools: [TOOL], tools: ['ToolSearch'] }, { env, cwd: target, timeout: 300000 }) : null;
      if (result) writeFileSync(join(results, `${name}-process.json`), redact(JSON.stringify(result, null, 2)));
      const parsed = parseClaudeStream(result?.stdout ?? '');
      const summary = summarizeToolSession(parsed, { tool: TOOL, server: SERVER, redact });
      const calls = parsed.calls.filter(row => row.name === TOOL);
      const unexpectedTools = parsed.calls.filter(row => ![TOOL, 'ToolSearch'].includes(row.name)).map(row => row.name);
      let call; try { call = JSON.parse(calls[0]?.result?.text ?? ''); } catch {}
      observation.model = summary.model ?? model;
      const modules = call?.continuation?.runtime_contracts;
      const verified = Array.isArray(modules) && modules.length > 0 && modules.every(row => typeof row.content === 'string' && createHash('sha256').update(row.content).digest('hex') === row.sha256);
      const expected = name === 'failure_case' ? 'invalid_input' : name === 'skill_continuation' ? 'skill_continuation' : 'control_result';
      const preserved = readFileSync(join(target, 'foreign-sentinel.txt'), 'utf8') === 'preserve-native-test-state\n';
      step(name, Boolean(result?.status === 0 && unexpectedTools.length === 0 && calls.length === 1 && summary.model === model && call?.outcome === expected && call.authorizes === false
        && (name !== 'skill_continuation' || verified) && preserved), {
        exec_status: result?.status ?? null, calls: calls.length, unexpected_tools: unexpectedTools, observed_models: summary.model ? [summary.model] : [],
        outcome: call?.outcome ?? null, terminal: call?.terminal ?? null, authorizes: call?.authorizes ?? null,
        runtime_digest: call?.runtime?.runtime_digest ?? null, contracts_verified: verified,
        preserved_foreign_state: preserved, permission_preserved: permissionPreserved(), ...(baseline ? { baseline: { version: baseline.version, integrity: baseline.integrity, source_digest: baseline.identity.source_digest } } : {}),
        ...(name === 'recovery' ? { repair: 'owned_stale_install' } : {}),
        ...(!available ? { skipped: 'isolated_authentication_unavailable' } : {}) });
    }
  });
} catch (error) {
  step('execution', false, { error: redact(error.message).slice(0, 400) });
} finally {
  // Native uninstall is measured even after a failed session. Deleting the disposable profile
  // afterwards is housekeeping, never evidence that the real uninstall succeeded.
  const uninstall = run('claude', ['plugin', 'uninstall', 'agdf@agdf']);
  const after = run('claude', ['mcp', 'list'], { cwd: target });
  writeFileSync(join(results, 'uninstall-process.json'), redact(JSON.stringify(uninstall)));
  writeFileSync(join(results, 'removal-process.json'), redact(JSON.stringify(after)));
  const json = path => { try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return {}; } };
  const settings = json(join(claudeHome, 'settings.json')), state = json(join(claudeHome, '.claude.json'));
  const installed = json(join(claudeHome, 'plugins/installed_plugins.json'));
  const leftovers = { mcp_listed: after.stdout.includes(SERVER), plugin_data: existsSync(join(claudeHome, 'plugins/data/agdf-agdf')),
    enabled: Boolean(settings.enabledPlugins?.['agdf@agdf']), permission_rules: (settings.permissions?.allow ?? []).filter(rule => rule.includes('agdf-session-check')).length,
    user_mcp: Boolean(state.mcpServers?.agdf), installed_entry: Boolean(installed.plugins?.['agdf@agdf']), kept_by_design: 'agdf marketplace registration' };
  step('removal', uninstall.status === 0 && after.status === 0 && Object.entries(leftovers).every(([key, value]) => key === 'kept_by_design' || value === false || value === 0) && permissionPreserved(), leftovers);
  observation.steps = steps; observation.result = steps.every(row => row.status === 'pass') ? 'pass' : 'fail';
  writeFileSync(join(results, 'observation.json'), `${JSON.stringify(observation, null, 2)}\n`);
  emitReleaseRecords({ observation, candidate, directory: results, host: 'claude', scenario, loadedIdentity, tuple: frozenTuple?.environment });
  const summary = `Claude CLI: ${observation.result}; ${steps.map(row => `${row.name}=${row.status}`).join(', ')}\nResults: ${results}\n`;
  writeFileSync(join(results, 'summary.txt'), summary); console.log(summary);
  if (!keep) rmSync(work, { recursive: true, force: true });
}
process.exitCode = observation.result === 'pass' ? 0 : 1;
