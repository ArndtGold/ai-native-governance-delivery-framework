import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';
import { ciJobs, ciJobPlan, testInventory, partitionTests, CI_TEST_BUDGET_SECONDS } from './ci-plan.mjs';
import { verificationPlan } from './verify-ci.mjs';
import { SOURCE_PHASE_MATRIX } from '../packages/core/test/fixtures/source-phase-matrix.js';
import { TEST_DOMAINS } from './ci-test-domains.mjs';

const preparation = ['dependencies', 'ui-dependencies', 'ui-build', 'generate', 'build-contracts', 'evals', 'assemble', 'prepare', 'mcp-dependencies'];

test('every OS/Node lane covers the entire canonical inventory and required checks', () => {
  const inventory = testInventory();
  const keys = commands => commands.map(c => JSON.stringify([c.cwd, c.tool, c.args, c.env ?? {}])).sort();
  const jobs = ciJobs();
  assert.equal(new Set(jobs.map(row => row.id)).size, jobs.length);
  assert.equal(new Set(jobs.map(row => row.label)).size, jobs.length);
  const lanes = [...new Set(jobs.map(row => `${row.os}/${row.node}`))];
  assert.deepEqual(lanes, ['ubuntu-latest/22', 'windows-latest/22', 'ubuntu-latest/24']);
  for (const lane of lanes) {
    const rows = jobs.filter(row => `${row.os}/${row.node}` === lane);
    assert.deepEqual(keys(rows.flatMap(row => row.commands ?? [])), keys(inventory));
    assert.ok(rows.filter(row => row.kind === 'tests').every(row => row.seconds <= CI_TEST_BUDGET_SECONDS));
    const checks = rows.filter(row => row.kind === 'checks');
    const stageKeys = stages => stages.map(stage => JSON.stringify(stage)).sort();
    const nonPreparation = stage => !preparation.includes(stage.id) && stage.id !== 'cli-smoke';
    assert.deepEqual(stageKeys(checks.flatMap(row => ciJobPlan(row).filter(nonPreparation))),
      stageKeys(verificationPlan({ lane: rows[0].lane }).filter(nonPreparation)), 'all former checks retain exactly one owner');
    assert.equal(checks.some(row => row.area === 'documentation'), rows[0].lane === 'repository');
    for (const row of rows) {
      const plan = ciJobPlan(row), ids = plan.map(stage => stage.id);
      for (const before of preparation) {
        assert.ok(ids.includes(before), `${row.id}: missing ${before}`);
      }
      assert.ok(ids.indexOf('ui-build') < ids.indexOf('generate'));
      assert.ok(ids.indexOf('assemble') < ids.indexOf('mcp-dependencies'));
      if (row.kind === 'tests') {
        assert.ok(row.commands.every(command => command.domain === row.area), `${row.id}: mixed functional areas`);
        assert.ok(ids.indexOf('mcp-dependencies') < ids.findIndex(id => id.startsWith('cli-')));
        assert.ok(Object.hasOwn(TEST_DOMAINS, row.area));
      }
      assert.ok(row.label.includes(`Node ${row.node}`));
      assert.doesNotMatch(row.id, /-tests-\d+$|^.*-checks$/);
    }
  }
  const selected = inventory.filter(c => c.args.includes('--source-gate'));
  const cells = Object.entries(SOURCE_PHASE_MATRIX).flatMap(([gate, phases]) => phases.map(phase => [gate, phase]));
  assert.deepEqual(selected.map(c => [c.args[c.args.indexOf('--source-gate') + 1], c.args[c.args.indexOf('--phase') + 1]]).sort(), cells.sort());
  assert.equal(selected.length, 18);
  for (const suite of ['cli', 'mcp']) for (const row of ciJobs({ suite }).filter(row => row.commands?.some(c => c.args.includes('--phase')))) {
    assert.equal(row.commands.length, 1, `${row.id}: source/phase fixtures need an exclusive job`);
    const args = row.commands[0].args, gate = args[args.indexOf('--source-gate') + 1], phase = args[args.indexOf('--phase') + 1];
    assert.ok(row.label.includes(`${gate} changed during ${phase}`));
    assert.equal(row.area, 'revisions');
  }
  assert.deepEqual(keys(testInventory({ suite: 'mcp' })), keys(inventory.filter(c => c.cwd === 'packages/mcp-server')));
  const mcp = ciJobs({ scope: 'linux', suite: 'mcp' })[0];
  const published = ciJobPlan(mcp, { suite: 'mcp', published: true });
  assert.deepEqual(published.find(stage => stage.id === 'mcp-dependencies').commands[0].args,
    ['install', '--package-lock=false', '--ignore-scripts', '--no-audit', '--no-fund']);
  assert.deepEqual(ciJobPlan(mcp, { suite: 'mcp' }).find(stage => stage.id === 'mcp-dependencies').commands[0].args,
    ['ci', '--ignore-scripts']);
  assert.throws(() => ciJobPlan(mcp, { published: true }), /MCP-only/);
});

test('the workflow matrix exposes functional labels for repository, release and published MCP callers', () => {
  for (const suite of ['cli', 'mcp']) {
    const result = spawnSync(process.execPath, ['scripts/ci-plan.mjs', '--matrix', 'true', '--scope', 'linux', '--suite', suite], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const { include: rows } = JSON.parse(result.stdout);
    assert.ok(rows.length > 0 && rows.length <= 256);
    assert.ok(rows.every(row => row.os === 'ubuntu-latest' && row.node === 22));
    assert.ok(rows.every(row => row.label && row.area && !row.commands && !row.checkStages));
    assert.equal(rows.some(row => row.kind === 'checks'), suite === 'cli');
    for (const row of rows) {
      const job = ciJobs({ scope: 'linux', suite }).find(job => job.id === row.id);
      assert.ok(job, `matrix selector must resolve: ${row.id}`);
      assert.equal(job.label, row.label);
      const plan = ciJobPlan(job, { suite, published: suite === 'mcp' });
      assert.ok(plan.length > 0);
      if (suite === 'mcp') assert.ok(plan.find(stage => stage.id === 'mcp-dependencies').commands[0].args.includes('--package-lock=false'));
    }
  }
});

test('new nested tests are assigned automatically; unsupported or unsafe inventories fail', () => {
  const root = mkdtempSync(join(tmpdir(), 'agdf-ci-inventory-'));
  const dir = join(root, 'packages/cli');
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  for (const file of ['one.js', 'new.js']) writeFileSync(join(dir, 'scripts', file), '');
  const manifest = { name: 'create-agdf', scripts: { 'smoke-test': 'npm run test:request-activation', 'test:request-activation': 'node scripts/one.js' } };
  const save = () => writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest));
  try {
    save(); assert.equal(testInventory({ repository: root }).length, 1);
    manifest.scripts['test:request-activation'] += ' && npm run test:new';
    manifest.scripts['test:new'] = 'node --test --test-concurrency=1 scripts/new.js'; save();
    const expanded = testInventory({ repository: root });
    assert.equal(expanded.length, 2);
    assert.ok(expanded.every(command => command.domain === 'activation'), 'new nested tests inherit their suite owner');
    assert.ok(ciJobs({ repository: root }).some(job => job.commands?.some(c => c.args.includes('scripts/new.js'))));
    for (const command of ['node scripts/new.js | cat', 'npm run test:request-activation', 'npm --prefix ../../../../outside test', 'node missing.js']) {
      manifest.scripts['test:new'] = command; save();
      assert.throws(() => testInventory({ repository: root }), /Unsupported|Recursive|Unsafe|Missing/);
    }
    manifest.scripts['test:new'] = 'node scripts/new.js'; manifest.scripts['pretest:new'] = 'node scripts/one.js'; save();
    assert.throws(() => testInventory({ repository: root }), /lifecycle hooks/);
    delete manifest.scripts['pretest:new'];
    manifest.scripts['smoke-test'] = 'npm run test:new'; save();
    assert.throws(() => ciJobs({ repository: root }), /Unclassified CI test/, 'new top-level suites require an explicit owner');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('over-budget tests fail planning instead of being omitted; selectors reject invalid work', () => {
  assert.throws(() => partitionTests([{ cwd: '.', tool: 'node', args: ['slow.js'], seconds: { windows: 600 } }], 'windows'), /finer partitioning/);
  for (const args of [['--job', 'missing'], ['--matrix', 'true', '--job', 'linux-22-checks'], ['--matrix', 'true', '--scope', 'skip'],
    ['--matrix', 'true', '--suite', 'skip'], ['--matrix', 'true', '--scope', 'linux;echo']]) {
    assert.notEqual(spawnSync(process.execPath, ['scripts/ci-plan.mjs', ...args], { encoding: 'utf8' }).status, 0);
  }
  for (const selector of [['--source-gate', 'skip'], ['--phase', 'SD'], ['--source-gate', 'PRD', '--phase', 'PRD'],
    ['--source-gate', 'PRD', '--phase', 'skip'], ['--source-gate', 'PRD', '--phase', 'SD', 'extra']]) {
    const result = spawnSync(process.execPath, ['packages/mcp-server/test/expanded-source-revision.test.js', ...selector], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Invalid source-gate\/phase test selector/);
  }
});

test('all executable workflow jobs have a ten-minute ceiling and callers share the tested plan', () => {
  const workflows = Object.fromEntries(readdirSync(new URL('../.github/workflows/', import.meta.url)).filter(name => name.endsWith('.yml'))
    .map(name => [name, parse(readFileSync(new URL(`../.github/workflows/${name}`, import.meta.url), 'utf8'))]));
  for (const [name, workflow] of Object.entries(workflows)) for (const [id, job] of Object.entries(workflow.jobs)) {
    if (job.uses) assert.ok(job.uses.startsWith('./.github/workflows/'), `${name}/${id}`);
    else assert.ok(job['timeout-minutes'] > 0 && job['timeout-minutes'] <= 10, `${name}/${id} lacks a bounded timeout`);
  }
  assert.equal(workflows['agdf-guardrails.yml'].jobs.verify.uses, './.github/workflows/verify-agdf.yml');
  assert.equal(workflows['publish-agdf.yml'].jobs.tests.uses, './.github/workflows/verify-agdf.yml');
  const reusable = workflows['verify-agdf.yml'];
  assert.equal(reusable.jobs.verify.strategy['fail-fast'], false);
  assert.equal(reusable.jobs.verify.name, '${{ matrix.label }}');
  assert.ok(reusable.jobs.verify.steps.some(step => step.run?.includes('node scripts/ci-plan.mjs --job')));
  assert.ok(reusable.jobs.plan.steps.some(step => step.run?.includes('node scripts/ci-plan.mjs --matrix')));
});
