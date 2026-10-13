import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { npmInvocation } from '../packages/cli/lib/npm-invocation.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const npm = (args, options = {}) => ({ tool: 'npm', args, ...options });
const node = (file, args = [], options = {}) => ({ tool: 'node', args: [file, ...args], ...options });
// One ordered plan for build, Actions and local snapshots. Checks precede assembly
// and costly consumers. The prepare profile only produces assets for evidence recording.
const stages = [
  { id: 'dependencies', commands: [npm(['ci', '--ignore-scripts'])] },
  { id: 'maintenance', commands: [npm(['run', 'test:maintenance-contracts'])] },
  { id: 'shell', commands: [node('scripts/check-shell-syntax.mjs')] },
  { id: 'ui-dependencies', build: true, prepare: true,
    commands: [npm(['ci', '--ignore-scripts'], { cwd: 'packages/control-ui' })] },
  { id: 'ui-build', build: true, prepare: true,
    commands: [npm(['run', 'build:mcp'], { cwd: 'packages/control-ui' })] },
  { id: 'generate', build: true, prepare: true, commands: [node('scripts/sync-package-assets.js')] },
  { id: 'build-contracts', build: true, commands: [node('packages/cli/scripts/build-contract-test.js')] },
  { id: 'evals', build: true, commands: [npm(['--prefix', 'packages/cli', 'run', 'eval:skills'])] },
  { id: 'compatibility-freshness', build: true, repository: true,
    failureHint: 'Inspect the diagnostic. For source_snapshot_changed, run npm run build:prepare, then npm run compatibility:record with MCP dependencies installed; review the evidence and rerun npm run build. Other evidence errors require repair, not automatic recording.',
    commands: [npm(['run', 'compatibility:check'])] },
  { id: 'assemble', build: true, prepare: true, commands: [node('scripts/assemble-npm.mjs')] },
  { id: 'prepare', prepare: true, commands: [npm(['--prefix', 'packages/cli', 'run', 'release:prepare'])] },
  { id: 'mcp-dependencies', commands: [npm(['ci', '--ignore-scripts'], { cwd: 'packages/mcp-server' })] },
  { id: 'runtime', commands: [node('plugins/agdf/scripts/check-runtime-integrity.mjs')] },
  { id: 'community', repository: true, commands: [npm(['run', 'test:community-health']), npm(['run', 'check:community-health'])] },
  { id: 'host-compatibility', repository: true, commands: [npm(['run', 'test:host-compatibility'])] },
  { id: 'built-runtime', commands: [node('packages/cli/generated/plugins/agdf/scripts/check-runtime-integrity.mjs', [], { env: { AGDF_RUNTIME_INTEGRITY_ROOT: 'packages/cli/generated/plugins/agdf' } })] },
  { id: 'cli-package', commands: [npm(['--prefix', 'packages/cli', 'run', 'test:package-contents'])] },
  { id: 'wrapper-package', commands: [npm(['--prefix', 'packages/cli/distribution/agdf', 'run', 'test:package'])] },
  { id: 'transactions', commands: [npm(['--prefix', 'packages/cli', 'run', 'test:run-step-transaction']), npm(['--prefix', 'packages/cli', 'run', 'test:run-lock'])] },
  { id: 'delivery-map', repository: true, commands: [node('packages/cli/bin/create-agdf.js', ['delivery-map', '--dir', '.', '--all-active'])] },
  { id: 'mcp-package', commands: [npm(['--prefix', 'packages/mcp-server', 'run', 'test:package'])] },
  { id: 'archives', commands: [node('scripts/pack-npm.mjs'), node('scripts/test-package-consumers.mjs')] },
  { id: 'cli-smoke', commands: [npm(['--prefix', 'packages/cli', 'run', 'smoke-test'])] },
  { id: 'wrapper-smoke', commands: [npm(['--prefix', 'packages/cli/distribution/agdf', 'run', 'smoke-test'])] },
  { id: 'pages-install', repository: true, commands: [npm(['--prefix', 'pages', 'ci'])] },
  { id: 'pages', repository: true, commands: [npm(['--prefix', 'pages', 'run', 'check']), npm(['--prefix', 'pages', 'run', 'test:landing']), npm(['--prefix', 'pages', 'run', 'test:public-documents'])] },
];

export const SMOKE_SHARDS = Object.freeze(['installation', 'package', 'governance']);

// The existing npm smoke-test remains the only test inventory. Windows partitions
// that same ordered chain at stable suite boundaries; no command is omitted.
export function smokeShardCommands(shard, repository = root) {
  if (!SMOKE_SHARDS.includes(shard)) throw new Error(`Unknown smoke shard: ${shard}`);
  const suite = JSON.parse(readFileSync(join(repository, 'packages/cli/package.json'), 'utf8')).scripts?.['smoke-test'];
  if (typeof suite !== 'string') throw new Error('Smoke test inventory is missing');
  const commands = suite.split(' && ');
  const boundaries = ['npm run test:local-validator', 'npm run test:run-command-flow'].map(command => {
    if (commands.filter(item => item === command).length !== 1) throw new Error(`Smoke boundary must occur once: ${command}`);
    return commands.indexOf(command);
  });
  if (boundaries[0] <= 0 || boundaries[1] <= boundaries[0]) throw new Error('Smoke boundaries are out of order');
  const parsed = commands.map(command => {
    if (/^npm run [a-z0-9:-]+$/.test(command)) return npm(command.split(' ').slice(1), { cwd: 'packages/cli' });
    if (/^node scripts\/[a-zA-Z0-9./-]+\.m?js$/.test(command)) return node(command.slice(5), [], { cwd: 'packages/cli' });
    throw new Error(`Unsupported smoke command: ${command}`);
  });
  const offsets = [0, ...boundaries, commands.length], index = SMOKE_SHARDS.indexOf(shard);
  return parsed.slice(offsets[index], offsets[index + 1]);
}

export function verificationPlan({ lane = 'repository', stage, profile = 'ci', smokeShard, repository = root } = {}) {
  if (!['repository', 'runtime'].includes(lane)) throw new Error(`Unknown verification lane: ${lane}`);
  if (!['ci', 'build', 'prepare'].includes(profile)) throw new Error(`Unknown verification profile: ${profile}`);
  if (profile !== 'ci' && (stage || lane !== 'repository')) throw new Error('Build and prepare profiles require the complete repository profile; no stage or runtime lane override.');
  if (stage && !stages.some(item => item.id === stage)) throw new Error(`Unknown verification stage: ${stage}`);
  if (smokeShard && (lane !== 'runtime' || profile !== 'ci' || stage)) throw new Error('Smoke shards require the complete runtime CI lane; no stage or build override.');
  // Return independent data so consumers cannot modify the shared policy.
  const plan = structuredClone(stages.filter(item => (!item.repository || lane === 'repository') && (!stage || item.id === stage) && (profile === 'ci' || item[profile])));
  if (smokeShard) {
    const item = plan.find(item => item.id === 'cli-smoke');
    item.commands = smokeShardCommands(smokeShard, repository);
    item.label = `cli-smoke (${smokeShard})`;
  }
  return plan;
}

export function runVerification({ lane, stage, profile, smokeShard, execute = spawnSync, repository = root } = {}) {
  for (const item of verificationPlan({ lane, stage, profile, smokeShard, repository })) {
    const started = performance.now();
    console.log(`[verify-ci] ${item.label ?? item.id}`);
    for (const command of item.commands) {
      const invocation = command.tool === 'npm' ? npmInvocation(command.args) : { executable: process.execPath, args: command.args };
      const env = { ...process.env, ...command.env };
      if (command.env?.AGDF_RUNTIME_INTEGRITY_ROOT) env.AGDF_RUNTIME_INTEGRITY_ROOT = join(repository, command.env.AGDF_RUNTIME_INTEGRITY_ROOT);
      const result = execute(invocation.executable, invocation.args, { cwd: join(repository, command.cwd ?? ''), env, stdio: 'inherit', shell: false });
      if (result.error) throw result.error;
      if (result.status !== 0) throw new Error(`Verification failed at ${item.id}: ${command.tool} ${command.args.join(' ')} (${result.signal ?? result.status})${item.failureHint ? `\n${item.failureHint}` : ''}`);
    }
    console.log(`[verify-ci] ${item.label ?? item.id} passed (${((performance.now() - started) / 1000).toFixed(1)}s)`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  try {
    const options = {};
    for (let i = 2; i < process.argv.length; i += 2) {
      const name = process.argv[i];
      const key = name === '--smoke-shard' ? 'smokeShard' : name.slice(2);
      if (!['--lane', '--stage', '--profile', '--smoke-shard'].includes(name) || !process.argv[i + 1] || Object.hasOwn(options, key)) throw new Error('Usage: verify-ci.mjs [--lane repository|runtime] [--stage <id>] [--profile ci|build|prepare] [--smoke-shard installation|package|governance]');
      options[key] = process.argv[i + 1];
    }
    runVerification(options);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
