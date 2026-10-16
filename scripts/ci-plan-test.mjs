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

test('every OS/Node lane covers the entire canonical inventory and required checks', () => {
  const inventory = testInventory();
  const keys = commands => commands.map(c => JSON.stringify([c.cwd, c.tool, c.args])).sort();
  const jobs = ciJobs();
  const lanes = [...new Set(jobs.map(row => `${row.os}/${row.node}`))];
  assert.deepEqual(lanes, ['ubuntu-latest/22', 'windows-latest/22', 'ubuntu-latest/24']);
  for (const lane of lanes) {
    const rows = jobs.filter(row => `${row.os}/${row.node}` === lane);
    assert.deepEqual(keys(rows.flatMap(row => row.commands ?? [])), keys(inventory));
    assert.ok(rows.filter(row => row.kind === 'tests').every(row => row.seconds <= CI_TEST_BUDGET_SECONDS));
    const check = rows.find(row => row.kind === 'checks');
    assert.deepEqual(ciJobPlan(check), verificationPlan({ lane: check.lane }).filter(stage => stage.id !== 'cli-smoke'));
    for (const row of rows.filter(row => row.kind === 'tests')) {
      const plan = ciJobPlan(row), ids = plan.map(stage => stage.id);
      for (const before of ['ui-build', 'generate', 'build-contracts', 'evals', 'assemble', 'prepare', 'mcp-dependencies']) {
        assert.ok(ids.includes(before), `${row.id}: missing ${before}`);
        assert.ok(ids.indexOf(before) < ids.findIndex(id => id.startsWith('cli-')));
      }
    }
  }
  const selected = inventory.filter(c => c.args.includes('--source-gate'));
  assert.deepEqual(selected.map(c => c.args.at(-1)).sort(), Object.keys(SOURCE_PHASE_MATRIX).sort());
  assert.equal(selected.reduce((n, c) => n + SOURCE_PHASE_MATRIX[c.args.at(-1)].length, 0), 18);
  assert.deepEqual(keys(testInventory({ suite: 'mcp' })), keys(inventory.filter(c => c.cwd === 'packages/mcp-server')));
  const mcp = ciJobs({ scope: 'linux', suite: 'mcp' })[0];
  const published = ciJobPlan(mcp, { suite: 'mcp', published: true });
  assert.deepEqual(published.find(stage => stage.id === 'mcp-dependencies').commands[0].args,
    ['install', '--package-lock=false', '--ignore-scripts', '--no-audit', '--no-fund']);
  assert.deepEqual(ciJobPlan(mcp, { suite: 'mcp' }).find(stage => stage.id === 'mcp-dependencies').commands[0].args,
    ['ci', '--ignore-scripts']);
  assert.throws(() => ciJobPlan(mcp, { published: true }), /MCP-only/);
});

test('new nested tests are assigned automatically; unsupported or unsafe inventories fail', () => {
  const root = mkdtempSync(join(tmpdir(), 'agdf-ci-inventory-'));
  const dir = join(root, 'packages/cli');
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  for (const file of ['one.js', 'new.js']) writeFileSync(join(dir, 'scripts', file), '');
  const manifest = { name: 'fixture', scripts: { 'smoke-test': 'npm run test:one', 'test:one': 'node scripts/one.js' } };
  const save = () => writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest));
  try {
    save(); assert.equal(testInventory({ repository: root }).length, 1);
    manifest.scripts['test:one'] += ' && npm run test:new';
    manifest.scripts['test:new'] = 'node --test --test-concurrency=1 scripts/new.js'; save();
    const expanded = testInventory({ repository: root });
    assert.equal(expanded.length, 2);
    assert.ok(ciJobs({ repository: root }).some(job => job.commands?.some(c => c.args.includes('scripts/new.js'))));
    for (const command of ['node scripts/new.js | cat', 'npm run test:one', 'npm --prefix ../../../../outside test', 'node missing.js']) {
      manifest.scripts['test:new'] = command; save();
      assert.throws(() => testInventory({ repository: root }), /Unsupported|Recursive|Unsafe|Missing/);
    }
    manifest.scripts['test:new'] = 'node scripts/new.js'; manifest.scripts['pretest:new'] = 'node scripts/one.js'; save();
    assert.throws(() => testInventory({ repository: root }), /lifecycle hooks/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('over-budget tests fail planning instead of being omitted; selectors reject invalid work', () => {
  assert.throws(() => partitionTests([{ cwd: '.', tool: 'node', args: ['slow.js'], seconds: { windows: 600 } }], 'windows'), /finer partitioning/);
  for (const args of [['--job', 'missing'], ['--matrix', 'true', '--job', 'linux-22-checks'], ['--matrix', 'true', '--scope', 'skip'],
    ['--matrix', 'true', '--suite', 'skip'], ['--matrix', 'true', '--scope', 'linux;echo']]) {
    assert.notEqual(spawnSync(process.execPath, ['scripts/ci-plan.mjs', ...args], { encoding: 'utf8' }).status, 0);
  }
  assert.notEqual(spawnSync(process.execPath, ['packages/mcp-server/test/expanded-source-revision.test.js', '--source-gate', 'skip'], { encoding: 'utf8' }).status, 0);
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
  assert.ok(reusable.jobs.verify.steps.some(step => step.run?.includes('node scripts/ci-plan.mjs --job')));
  assert.ok(reusable.jobs.plan.steps.some(step => step.run?.includes('node scripts/ci-plan.mjs --matrix')));
});
