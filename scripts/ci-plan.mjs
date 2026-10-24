import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verificationPlan, executeVerificationPlan } from './verify-ci.mjs';
import { SOURCE_PHASE_MATRIX } from '../packages/core/test/fixtures/source-phase-matrix.js';
import { CONTROL_COMMAND_PACKAGE_PARTS } from '../packages/cli/scripts/control-command-package-parts.js';
import { TEST_DOMAINS, scriptDomain, commandDomain } from './ci-test-domains.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = JSON.parse(readFileSync(new URL('./ci-duration-baseline.json', import.meta.url)));
const platforms = [
  { os: 'ubuntu-latest', node: 22, lane: 'repository', speed: 'linux' },
  { os: 'windows-latest', node: 22, lane: 'runtime', speed: 'windows' },
  { os: 'ubuntu-latest', node: 24, lane: 'runtime', speed: 'linux' },
];
export const CI_TEST_BUDGET_SECONDS = 360;
export const CI_EXECUTION_BUDGET_MS = 8 * 60 * 1000;

const prerequisites = new Set(['dependencies', 'ui-dependencies', 'ui-build', 'generate', 'build-contracts', 'evals', 'assemble', 'prepare', 'mcp-dependencies']);
const checkAreas = {
  contracts: { label: 'Repository contracts', shortLabel: 'Contracts', stages: ['maintenance', 'shell'] },
  compatibility: { label: 'Runtime & host compatibility', shortLabel: 'Compat', stages: ['compatibility-freshness', 'runtime', 'built-runtime', 'host-compatibility', 'mcp-ergonomics'] },
  distribution: { label: 'Distribution & package consumers', shortLabel: 'Archives', stages: ['cli-package', 'wrapper-package', 'mcp-package', 'archives', 'wrapper-smoke'] },
  'run-safety': { label: 'Run persistence & delivery map', shortLabel: 'Run safety', stages: ['transactions', 'delivery-map'] },
  documentation: { label: 'Documentation & community', shortLabel: 'Docs', stages: ['community', 'pages-install', 'pages'] },
};

const identity = c => JSON.stringify([c.cwd, c.tool, c.args, c.env ?? {}]);
const packageAt = (repository, cwd) => JSON.parse(readFileSync(join(repository, cwd, 'package.json'), 'utf8'));
const requireTestFile = (repository, cwd, file) => {
  const path = resolve(repository, cwd, file), local = relative(repository, path);
  if (local.startsWith('..') || !/\.m?js$/.test(file) || !existsSync(path)) throw Error(`Missing or unsafe test entrypoint: ${cwd}/${file}`);
};

// Expand the existing npm scripts, never a second test list. Shell syntax outside
// this small executable grammar fails closed rather than silently dropping work.
export function testInventory({ repository = root, suite = 'cli' } = {}) {
  if (!['cli', 'mcp'].includes(suite)) throw Error(`Unknown CI suite: ${suite}`);
  function expand(script, cwd, stack = [], inheritedDomain) {
    const manifest = packageAt(repository, cwd), key = `${manifest.name}:${script}`;
    if (stack.includes(key)) throw Error(`Recursive npm script: ${key}`);
    const text = manifest.scripts?.[script];
    if (typeof text !== 'string' || !text) throw Error(`Missing canonical npm script: ${key}`);
    if (manifest.scripts?.[`pre${script}`] || manifest.scripts?.[`post${script}`]) throw Error(`CI must explicitly preserve npm lifecycle hooks: ${key}`);
    const hints = baseline.suites[key];
    const domain = scriptDomain(manifest.name, script, inheritedDomain);
    const commands = text.split(' && ').flatMap(command => {
      const npm = /^npm (?:--prefix ([\w./-]+) )?(?:(?:run ([\w:-]+))|(test))$/.exec(command);
      if (npm) {
        const nextCwd = npm[1] ? relative(repository, resolve(repository, cwd, npm[1])).replaceAll('\\', '/') : cwd;
        if (nextCwd.startsWith('../') || !nextCwd) throw Error(`Unsafe npm prefix: ${command}`);
        const nextScript = npm[2] ?? npm[3];
        // Preparation is an ordered dependency with its own integrity checks.
        if (nextScript === 'release:prepare') return [{ tool: 'npm', args: ['run', nextScript], cwd: nextCwd,
          domain: commandDomain(`${nextCwd}:release:prepare`, scriptDomain(packageAt(repository, nextCwd).name, nextScript, domain)),
          seconds: { windows: 30, linux: 10 } }];
        return expand(nextScript, nextCwd, [...stack, key], domain);
      }
      if (!/^node [\w./= -]+$/.test(command)) throw Error(`Unsupported canonical test command: ${command}`);
      const args = command.slice(5).split(' ');
      if (args.includes('--test')) {
        const flags = args.filter(arg => arg.startsWith('--'));
        if (flags.some(arg => !['--test', '--test-concurrency=1'].includes(arg))) throw Error(`Unsupported test flags: ${command}`);
        return args.filter(arg => !arg.startsWith('--')).map(file => {
          requireTestFile(repository, cwd, file);
          return { tool: 'node', args: [...flags, file], cwd,
            domain: commandDomain(relative(repository, resolve(repository, cwd, file)).replaceAll('\\', '/'), domain) };
        });
      }
      const [file, ...rest] = args;
      if (rest.length || !/\.m?js$/.test(file)) throw Error(`Unsupported node test invocation: ${command}`);
      requireTestFile(repository, cwd, file);
      return [{ tool: 'node', args, cwd,
        domain: commandDomain(relative(repository, resolve(repository, cwd, file)).replaceAll('\\', '/'), domain) }];
    });
    // Missing duration evidence is deliberately expensive and gets its own small
    // group. Parent totals only distribute cost; CI runtime is measured separately.
    const own = hints;
    if (own) for (const command of commands) {
      command.seconds ??= {};
      for (const speed of ['windows', 'linux']) if (own[speed]) {
        command.seconds[speed] = Math.max(command.seconds[speed] ?? 0, own[speed] / commands.length);
      }
    }
    return commands;
  }
  const commands = expand(suite === 'cli' ? 'smoke-test' : 'test', `packages/${suite === 'cli' ? 'cli' : 'mcp-server'}`);
  // Each cell or part pays its own fixture setup on top of its share of the measured file.
  const share = (seconds, count) => Object.fromEntries(Object.entries(seconds ?? {}).map(([key, value]) => [key, value / count + (key === 'windows' ? 60 : 15)]));
  // This file exercises 18 independent source/phase cells. Preserve the full
  // default invocation locally; CI executes each validated source/phase cell.
  return commands.flatMap(command => {
    if (command.tool === 'node') {
      const file = command.args.find(arg => !arg.startsWith('--'));
      const fileHints = baseline.files[relative(repository, resolve(repository, command.cwd, file)).replaceAll('\\', '/')];
      command.seconds = { ...command.seconds, ...fileHints };
    }
    // The packed control-command suite rebuilds an isolated snapshot for each part. Run 39600811858
    // exhausted the Windows execution budget when all parts shared one invocation.
    if (command.cwd === 'packages/cli' && command.args[0] === 'scripts/control-command-package-test.js') {
      const parts = Object.keys(CONTROL_COMMAND_PACKAGE_PARTS);
      return parts.map(part => ({ ...command, args: [...command.args, '--part', part], seconds: share(command.seconds, parts.length) }));
    }
    if (command.cwd !== 'packages/mcp-server' || command.args[0] !== './test/expanded-source-revision.test.js') return [command];
    const total = Object.values(SOURCE_PHASE_MATRIX).flat().length;
    return Object.entries(SOURCE_PHASE_MATRIX).flatMap(([gate, phases]) => phases.map(phase => ({ ...command,
      args: [...command.args, '--source-gate', gate, '--phase', phase], isolated: true, domain: 'revisions',
      seconds: share(command.seconds, total) })));
  }).map(command => ({ ...command, id: createHash('sha256').update(identity(command)).digest('hex').slice(0, 12) }));
}

export function partitionTests(commands, speed) {
  const groups = [];
  // First fit decreasing keeps the slow files isolated. Within each group retain
  // canonical ordering and run serially, so performance assertions never compete.
  const ranked = commands.map((command, order) => ({ command, order,
    cost: Math.max(5, Math.ceil((command.seconds?.[speed] ?? (speed === 'windows' ? 90 : 45)) * 1.5)) }))
    .sort((a, b) => b.cost - a.cost || a.order - b.order);
  for (const task of ranked) {
    if (task.cost > CI_TEST_BUDGET_SECONDS) throw Error(`Test needs finer partitioning: ${task.command.cwd} ${task.command.args.join(' ')} (${task.cost}s)`);
    // These transport fixtures have substantial per-invocation setup and highly
    // variable Windows I/O. Their old PRD block exhausted run 38885088312's budget.
    // Reserve a complete job for each cell rather than trusting averaged totals.
    let group = !task.command.isolated && groups.find(group => !group.isolated && group.seconds + task.cost <= CI_TEST_BUDGET_SECONDS);
    if (!group) { group = { seconds: 0, tasks: [], isolated: Boolean(task.command.isolated) }; groups.push(group); }
    group.tasks.push(task); group.seconds += task.cost;
  }
  return groups.map(group => ({ seconds: group.seconds,
    commands: group.tasks.sort((a, b) => a.order - b.order).map(task => task.command) }));
}

export function ciJobs({ repository = root, scope = 'all', suite = 'cli' } = {}) {
  if (!['all', 'linux'].includes(scope)) throw Error(`Unknown CI scope: ${scope}`);
  const inventory = testInventory({ repository, suite });
  const rows = [];
  for (const platform of platforms.filter(row => scope === 'all' || (row.os === 'ubuntu-latest' && row.node === 22))) {
    const prefix = `${platform.speed}-${platform.node}`;
    const suffix = `${platform.speed === 'windows' ? 'Windows' : 'Linux'} / Node ${platform.node}`;
    const graphPlatform = `${platform.speed === 'windows' ? 'Win' : 'Linux'}${platform.node}`;
    if (suite === 'cli') {
      const checks = verificationPlan({ lane: platform.lane }).filter(stage => !prerequisites.has(stage.id) && stage.id !== 'cli-smoke');
      for (const stage of checks) {
        const owners = Object.values(checkAreas).filter(area => area.stages.includes(stage.id));
        if (owners.length !== 1) throw Error(`CI check needs exactly one owner: ${stage.id}`);
      }
      for (const [area, { label, shortLabel, stages }] of Object.entries(checkAreas)) {
        const checkStages = checks.filter(stage => stages.includes(stage.id)).map(stage => stage.id);
        if (checkStages.length) rows.push({ ...platform, id: `${prefix}-checks-${area}`, label: `${label} / ${suffix}`,
          graphLabel: `${shortLabel} · ${graphPlatform}`,
          area, kind: 'checks', checkStages, seconds: null });
      }
    }
    const groups = [];
    for (const [area, { label, shortLabel }] of Object.entries(TEST_DOMAINS)) {
      const partitions = partitionTests(inventory.filter(command => command.domain === area && !command.isolated), platform.speed);
      for (const [index, group] of partitions.entries()) {
        const part = partitions.length > 1 ? `-part-${index + 1}` : '';
        const partLabel = partitions.length > 1 ? ` / Part ${index + 1} of ${partitions.length}` : '';
        groups.push(group);
        rows.push({ ...platform, id: `${prefix}-${area}${part}`, label: `${label}${partLabel} / ${suffix}`,
          graphLabel: `${shortLabel} · ${graphPlatform}${part ? ` ${index + 1}of${partitions.length}` : ''}`,
          area, kind: 'tests', ...group });
      }
    }
    for (const command of inventory.filter(command => command.isolated)) {
      const gate = command.args[command.args.indexOf('--source-gate') + 1];
      const phase = command.args[command.args.indexOf('--phase') + 1];
      const [group] = partitionTests([command], platform.speed);
      groups.push(group);
      rows.push({ ...platform, id: `${prefix}-revision-${gate.toLowerCase()}-during-${phase.toLowerCase().replaceAll('+', '-')}`,
        graphLabel: `${gate}→${phase} · ${graphPlatform}`,
        label: `Source revision / ${gate} changed during ${phase} / ${suffix}`, area: 'revisions', kind: 'tests', ...group });
    }
    // Multiset equality catches missing *and* duplicate assignments, even if a
    // canonical script intentionally invokes one test more than once.
    const ids = values => values.map(command => identity(command)).sort();
    if (JSON.stringify(ids(groups.flatMap(group => group.commands))) !== JSON.stringify(ids(inventory))) throw Error('CI test coverage mismatch');
  }
  if (rows.length > 256) throw Error('CI matrix exceeds GitHub Actions limit');
  return rows;
}

export function ciJobPlan(job, { suite = 'cli', published = false } = {}) {
  if (published && suite !== 'mcp') throw Error('Published dependency mode is MCP-only');
  const complete = verificationPlan({ lane: job.lane });
  const plan = job.kind === 'checks'
    ? complete.filter(stage => prerequisites.has(stage.id) || job.checkStages.includes(stage.id))
    : [...complete.filter(stage => prerequisites.has(stage.id)),
    ...job.commands.map((command, i) => ({ id: `${suite}-${command.id}-${i + 1}`, commands: [command] }))];
  if (published) {
    plan.find(stage => stage.id === 'mcp-dependencies').commands = [{ tool: 'node',
      args: ['scripts/release/install-published-mcp.mjs'] }];
  }
  return plan;
}

// Graph groups only reorganize the already validated partitions. They never
// rebalance commands or introduce execution dependencies between test areas.
export function ciGraphMatrices(jobs) {
  const groups = Object.fromEntries([...Object.keys(TEST_DOMAINS), 'checks'].map(area => [area, { include: [] }]));
  for (const { commands, speed, checkStages, ...row } of jobs) {
    const area = row.kind === 'checks' ? 'checks' : row.area;
    if (!Object.hasOwn(groups, area)) throw Error(`Unknown CI graph area: ${area}`);
    groups[area].include.push(row);
  }
  return Object.fromEntries(Object.entries(groups).filter(([, matrix]) => matrix.include.length));
}

export async function ciMain(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--matrix', '--job', '--scope', '--suite', '--published'].includes(args[i]) || !args[i + 1] || Object.hasOwn(options, args[i])) throw Error('Usage: ci-plan.mjs --matrix true|github | --job <id> [--scope all|linux] [--suite cli|mcp] [--published true|false]');
    options[args[i]] = args[i + 1];
  }
  if (Boolean(options['--matrix']) === Boolean(options['--job'])) throw Error('Select exactly one of --matrix or --job');
  if (options['--matrix'] && !['true', 'github'].includes(options['--matrix'])) throw Error('Invalid matrix flag');
  if (options['--published'] && !['true', 'false'].includes(options['--published'])) throw Error('Invalid published flag');
  const scope = options['--scope'] ?? 'all', suite = options['--suite'] ?? 'cli';
  const jobs = ciJobs({ scope, suite });
  if (options['--matrix'] === 'github') {
    for (const [area, matrix] of Object.entries(ciGraphMatrices(jobs))) console.log(`${area}=${JSON.stringify(matrix)}`);
    return;
  }
  if (options['--matrix']) {
    console.log(JSON.stringify({ include: jobs.map(({ commands, speed, checkStages, ...row }) => row) }));
    return;
  }
  const job = jobs.find(row => row.id === options['--job']);
  if (!job) throw Error(`Unknown CI job: ${options['--job']}`);
  const expectedOS = job.speed === 'windows' ? 'win32' : 'linux';
  if (process.env.CI && (process.platform !== expectedOS || Number(process.versions.node.split('.')[0]) !== job.node)) throw Error('CI platform does not match planned lane');
  const started = Date.now(), timings = [];
  const execute = (executable, argv, config) => {
    const remaining = CI_EXECUTION_BUDGET_MS - (Date.now() - started);
    if (remaining <= 0) throw Error('CI job exceeded its execution budget');
    const before = Date.now();
    const result = spawnSync(executable, argv, { ...config, timeout: remaining });
    timings.push({ command: `${relative(root, config.cwd)}: ${argv.join(' ')}`, seconds: (Date.now() - before) / 1000, status: result.status });
    return result;
  };
  try {
    const plan = ciJobPlan(job, { suite, published: options['--published'] === 'true' });
    executeVerificationPlan(plan, { execute });
  } finally {
    const seconds = (Date.now() - started) / 1000;
    writeFileSync(join(root, 'ci-timings.json'), JSON.stringify({ job: job.id, label: job.label, suite, seconds, timings }, null, 2) + '\n');
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `### ${job.label}\n\nJob: \`${job.id}\`. Verification: ${seconds.toFixed(1)} seconds. Checkout/setup/cleanup are additional; the job timeout is 10 minutes.\n\n| Command | Seconds | Exit |\n|---|---:|---:|\n${timings.map(row => `| \`${row.command.replaceAll('|', '\\|')}\` | ${row.seconds.toFixed(1)} | ${row.status} |`).join('\n')}\n`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  ciMain(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
