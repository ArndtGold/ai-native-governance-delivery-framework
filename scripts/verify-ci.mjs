import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';
import { join } from 'node:path';
import { npmInvocation } from '../packages/cli/lib/npm-invocation.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const npm = (args, options = {}) => ({ tool: 'npm', args, ...options });
const node = (file, args = [], options = {}) => ({ tool: 'node', args: [file, ...args], ...options });
// One ordered plan for Actions and local snapshots. Preparation precedes npm's file: snapshot.
const stages = [
  { id: 'dependencies', commands: [npm(['ci', '--ignore-scripts'])] },
  { id: 'maintenance', commands: [npm(['run', 'test:maintenance-contracts'])] },
  { id: 'shell', commands: [node('scripts/check-shell-syntax.mjs')] },
  { id: 'prepare', commands: [npm(['run', 'build']), npm(['--prefix', 'packages/cli', 'run', 'release:prepare'])] },
  { id: 'mcp-dependencies', commands: [npm(['ci', '--ignore-scripts'], { cwd: 'packages/mcp-server' })] },
  { id: 'runtime', commands: [node('plugins/agdf/scripts/check-runtime-integrity.mjs')] },
  { id: 'community', repository: true, commands: [npm(['run', 'test:community-health']), npm(['run', 'check:community-health'])] },
  { id: 'host-compatibility', repository: true, commands: [npm(['run', 'test:host-compatibility']), npm(['run', 'compatibility:check'])] },
  { id: 'built-runtime', commands: [node('packages/cli/generated/plugins/agdf/scripts/check-runtime-integrity.mjs', [], { env: { AGDF_RUNTIME_INTEGRITY_ROOT: 'packages/cli/generated/plugins/agdf' } })] },
  { id: 'cli-package', commands: [npm(['--prefix', 'packages/cli', 'run', 'test:package-contents'])] },
  { id: 'wrapper-package', commands: [npm(['--prefix', 'packages/cli/distribution/agdf', 'run', 'test:package'])] },
  { id: 'transactions', commands: [npm(['--prefix', 'packages/cli', 'run', 'test:run-step-transaction']), npm(['--prefix', 'packages/cli', 'run', 'test:run-lock'])] },
  { id: 'delivery-map', repository: true, commands: [node('packages/cli/bin/create-agdf.js', ['delivery-map', '--dir', '.', '--all-active'])] },
  { id: 'evals', commands: [npm(['--prefix', 'packages/cli', 'run', 'eval:skills'])] },
  { id: 'mcp-package', commands: [npm(['--prefix', 'packages/mcp-server', 'run', 'test:package'])] },
  { id: 'archives', commands: [node('scripts/pack-npm.mjs'), node('scripts/test-package-consumers.mjs')] },
  { id: 'cli-smoke', commands: [npm(['--prefix', 'packages/cli', 'run', 'smoke-test'])] },
  { id: 'wrapper-smoke', commands: [npm(['--prefix', 'packages/cli/distribution/agdf', 'run', 'smoke-test'])] },
  { id: 'pages-install', repository: true, commands: [npm(['--prefix', 'pages', 'ci'])] },
  { id: 'pages', repository: true, commands: [npm(['--prefix', 'pages', 'run', 'check']), npm(['--prefix', 'pages', 'run', 'test:landing']), npm(['--prefix', 'pages', 'run', 'test:public-documents'])] },
];

export function verificationPlan({ lane = 'repository', stage } = {}) {
  if (!['repository', 'runtime'].includes(lane)) throw new Error(`Unknown verification lane: ${lane}`);
  if (stage && !stages.some(item => item.id === stage)) throw new Error(`Unknown verification stage: ${stage}`);
  // Return independent data so consumers cannot modify the shared policy.
  return structuredClone(stages.filter(item => (!item.repository || lane === 'repository') && (!stage || item.id === stage)));
}

export function runVerification({ lane, stage, execute = spawnSync, repository = root } = {}) {
  for (const item of verificationPlan({ lane, stage })) {
    console.log(`[verify-ci] ${item.id}`);
    for (const command of item.commands) {
      const invocation = command.tool === 'npm' ? npmInvocation(command.args) : { executable: process.execPath, args: command.args };
      const env = { ...process.env, ...command.env };
      if (command.env?.AGDF_RUNTIME_INTEGRITY_ROOT) env.AGDF_RUNTIME_INTEGRITY_ROOT = join(repository, command.env.AGDF_RUNTIME_INTEGRITY_ROOT);
      const result = execute(invocation.executable, invocation.args, { cwd: join(repository, command.cwd ?? ''), env, stdio: 'inherit', shell: false });
      if (result.error) throw result.error;
      if (result.status !== 0) throw new Error(`Verification failed at ${item.id}: ${command.tool} ${command.args.join(' ')} (${result.signal ?? result.status})`);
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  try {
    const options = {};
    for (let i = 2; i < process.argv.length; i += 2) {
      const name = process.argv[i];
      if (!['--lane', '--stage'].includes(name) || !process.argv[i + 1] || Object.hasOwn(options, name.slice(2))) throw new Error('Usage: verify-ci.mjs [--lane repository|runtime] [--stage <id>]');
      options[name.slice(2)] = process.argv[i + 1];
    }
    runVerification(options);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
