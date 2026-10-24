import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';
import { ciJobs, ciJobPlan, ciGraphMatrices, testInventory, partitionTests, CI_TEST_BUDGET_SECONDS } from './ci-plan.mjs';
import { verificationPlan } from './verify-ci.mjs';
import { SOURCE_PHASE_MATRIX } from '../packages/core/test/fixtures/source-phase-matrix.js';
import { CONTROL_COMMAND_PACKAGE_PARTS } from '../packages/cli/scripts/control-command-package-parts.js';
import { TEST_DOMAINS } from './ci-test-domains.mjs';

const preparation = ['dependencies', 'ui-dependencies', 'ui-build', 'generate', 'build-contracts', 'evals', 'assemble', 'prepare', 'mcp-dependencies'];

test('every OS/Node lane covers the entire canonical inventory and required checks', () => {
  const inventory = testInventory();
  const keys = commands => commands.map(c => JSON.stringify([c.cwd, c.tool, c.args, c.env ?? {}])).sort();
  const jobs = ciJobs();
  assert.equal(new Set(jobs.map(row => row.id)).size, jobs.length);
  assert.equal(new Set(jobs.map(row => row.label)).size, jobs.length);
  assert.equal(new Set(jobs.map(row => row.graphLabel)).size, jobs.length, 'compact status names remain unique');
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
      assert.ok(row.graphLabel.includes(`${row.os === 'windows-latest' ? 'Win' : 'Linux'}${row.node}`));
      assert.doesNotMatch(row.graphLabel, /\//, 'graph names must not hide functional content in a slash hierarchy');
      assert.ok(row.graphLabel.length <= 24, `${row.id}: graph label is too long`);
      assert.doesNotMatch(row.id, /-tests-\d+$|^.*-checks$/);
    }
  }
  const selected = inventory.filter(c => c.args.includes('--source-gate'));
  const cells = Object.entries(SOURCE_PHASE_MATRIX).flatMap(([gate, phases]) => phases.map(phase => [gate, phase]));
  assert.deepEqual(selected.map(c => [c.args[c.args.indexOf('--source-gate') + 1], c.args[c.args.indexOf('--phase') + 1]]).sort(), cells.sort());
  assert.equal(selected.length, 18);
  const packageParts = inventory.filter(c => c.args[0] === 'scripts/control-command-package-test.js');
  assert.deepEqual(packageParts.map(c => c.args.slice(1)), Object.keys(CONTROL_COMMAND_PACKAGE_PARTS).map(part => ['--part', part]));
  assert.ok(packageParts.every(c => c.domain === 'packages' && !c.isolated));
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
    ['scripts/release/install-published-mcp.mjs']);
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
    assert.ok(rows.every(row => row.label && row.graphLabel && row.area && !row.commands && !row.checkStages));
    assert.equal(rows.some(row => row.kind === 'checks'), suite === 'cli');
    for (const row of rows) {
      const job = ciJobs({ scope: 'linux', suite }).find(job => job.id === row.id);
      assert.ok(job, `matrix selector must resolve: ${row.id}`);
      assert.equal(job.label, row.label);
      assert.equal(job.graphLabel, row.graphLabel);
      const plan = ciJobPlan(job, { suite, published: suite === 'mcp' });
      assert.ok(plan.length > 0);
      if (suite === 'mcp') assert.equal(plan.find(stage => stage.id === 'mcp-dependencies').commands[0].tool, 'node');
    }
  }
});

test('compact graph names retain purpose, platform, partition and revision scenario', () => {
  const jobs = ciJobs();
  const label = id => jobs.find(row => row.id === id).graphLabel;
  assert.equal(label('linux-22-activation'), 'Skills · Linux22');
  const mcpParts = jobs.filter(row => row.area === 'mcp' && row.os === 'windows-latest' && row.node === 22).length;
  assert.equal(label('windows-22-mcp-part-4'), `MCP · Win22 4of${mcpParts}`);
  assert.equal(label('windows-22-revision-ur-during-qa'), 'UR→QA · Win22');
  assert.equal(label('linux-24-revision-prd-during-cd-tests'), 'PRD→CD+Tests · Linux24');
  assert.equal(label('linux-22-checks-contracts'), 'Contracts · Linux22');
  for (const suite of ['cli', 'mcp']) {
    const rows = ciJobs({ suite });
    assert.equal(new Set(rows.map(row => row.graphLabel)).size, rows.length);
    for (const row of rows) {
      const part = /-part-(\d+)$/.exec(row.id);
      if (part) assert.ok(row.graphLabel.endsWith(`${part[1]}of${rows.filter(other => other.area === row.area && other.os === row.os && other.node === row.node && !other.commands?.some(command => command.isolated)).length}`));
    }
  }
});

test('measured Windows MCP lifecycle and whole-flow costs prevent the exhausted partition from recurring', () => {
  const jobs = ciJobs().filter(row => row.os === 'windows-latest');
  const lifecycle = jobs.find(row => row.commands?.some(command => command.args.includes('scripts/mcp-lifecycle-test.js')));
  const wholeFlow = jobs.find(row => row.commands?.some(command => command.args.includes('./test/whole-flow.test.js')));
  assert.ok(lifecycle && wholeFlow);
  assert.notEqual(lifecycle.id, wholeFlow.id, 'run 39142873658 exhausted its budget when both heavy fixtures shared one job');
  assert.ok(lifecycle.seconds <= CI_TEST_BUDGET_SECONDS);
  assert.ok(wholeFlow.seconds <= CI_TEST_BUDGET_SECONDS);
});

test('measured packed control-command parts run in separate Windows partitions', () => {
  const jobs = ciJobs().filter(row => row.os === 'windows-latest');
  const owners = Object.keys(CONTROL_COMMAND_PACKAGE_PARTS).map(part => jobs.find(row => row.commands?.some(command =>
    command.args[0] === 'scripts/control-command-package-test.js' && command.args.at(-1) === part)));
  assert.ok(owners.every(Boolean));
  assert.equal(new Set(owners.map(row => row.id)).size, owners.length, 'run 39600811858 exhausted its budget when all parts shared one job');
  assert.ok(owners.every(row => row.seconds <= CI_TEST_BUDGET_SECONDS));
});

test('graph matrices route every existing partition exactly once for every caller', () => {
  const workflow = parse(readFileSync(new URL('../.github/workflows/verify-agdf.yml', import.meta.url), 'utf8'));
  const areas = [...Object.keys(TEST_DOMAINS), 'checks'];
  const graphJobs = Object.entries(workflow.jobs).filter(([id]) => id !== 'plan');
  assert.equal(graphJobs.length, areas.length);
  assert.ok(workflow.jobs.plan.name && workflow.jobs.plan.name !== 'plan', 'planning has a descriptive display name');
  assert.deepEqual(Object.keys(workflow.jobs.plan.outputs), areas);
  for (const area of areas) {
    const matrix = `\${{ fromJSON(needs.plan.outputs.${area}) }}`;
    const owners = graphJobs.filter(([, job]) => job.strategy.matrix === matrix);
    assert.equal(owners.length, 1, `${area}: exactly one graph group must consume its matrix`);
    const [id, job] = owners[0];
    assert.match(id, /^[a-zA-Z_][a-zA-Z0-9_-]*$/, 'graph titles remain valid workflow job IDs');
    assert.notEqual(id, area, 'group headers must use descriptive names instead of area abbreviations');
    assert.ok(id.length >= 10 && id.length <= 19, `${area}: group header must be descriptive and fit the visible tab`);
    assert.equal(workflow.jobs.plan.outputs[area], `\${{ steps.plan.outputs.${area} }}`);
    assert.equal(job.needs, 'plan', `${area}: areas must execute in parallel`);
    assert.equal(job.if, `needs.plan.outputs.${area} != ''`, `${area}: skip absent areas before matrix expansion`);
    assert.equal(job.strategy.matrix, matrix);
    assert.equal(job.strategy['fail-fast'], false);
    assert.equal(job.name, '${{ matrix.graphLabel }}');
    assert.equal(job['runs-on'], '${{ matrix.os }}');
    assert.equal(job['timeout-minutes'], 10);
    assert.deepEqual(job.defaults, { run: { shell: 'bash' } });
    assert.deepEqual(job.steps, graphJobs[0][1].steps, 'all areas share the same runner and timing artifacts');
  }
  const sort = rows => rows.sort((a, b) => a.id.localeCompare(b.id));
  for (const scope of ['all', 'linux']) for (const suite of ['cli', 'mcp']) {
    const jobs = ciJobs({ scope, suite });
    const grouped = ciGraphMatrices(jobs);
    const result = spawnSync(process.execPath, ['scripts/ci-plan.mjs', '--matrix', 'github', '--scope', scope, '--suite', suite], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const outputs = Object.fromEntries(result.stdout.trim().split('\n').map(line => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator), JSON.parse(line.slice(separator + 1))];
    }));
    assert.deepEqual(outputs, grouped, 'planner output is directly consumable by GITHUB_OUTPUT');
    assert.deepEqual(Object.keys(grouped), suite === 'cli' ? areas : ['revisions', 'mcp']);
    const rows = Object.values(grouped).flatMap(matrix => matrix.include);
    assert.deepEqual(sort(rows), sort(jobs.map(({ commands, speed, checkStages, ...row }) => row)), 'grouping preserves all partition selectors and metadata');
    for (const [area, matrix] of Object.entries(grouped)) {
      assert.ok(matrix.include.length > 0 && matrix.include.length <= 256);
      assert.ok(matrix.include.every(row => area === 'checks' ? row.kind === 'checks' : row.kind === 'tests' && row.area === area));
    }
  }
  assert.deepEqual(ciGraphMatrices([]), {});
  assert.throws(() => ciGraphMatrices([{ area: 'missing', kind: 'tests' }]), /Unknown CI graph area/);
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
    ['--matrix', 'true', '--suite', 'skip'], ['--matrix', 'true', '--scope', 'linux;echo'], ['--matrix', 'invalid']]) {
    assert.notEqual(spawnSync(process.execPath, ['scripts/ci-plan.mjs', ...args], { encoding: 'utf8' }).status, 0);
  }
  for (const selector of [['--source-gate', 'skip'], ['--phase', 'SD'], ['--source-gate', 'PRD', '--phase', 'PRD'],
    ['--source-gate', 'PRD', '--phase', 'skip'], ['--source-gate', 'PRD', '--phase', 'SD', 'extra']]) {
    const result = spawnSync(process.execPath, ['packages/mcp-server/test/expanded-source-revision.test.js', ...selector], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Invalid source-gate\/phase test selector/);
  }
  for (const selector of [['--part'], ['--part', 'skip'], ['--part', 'core', 'extra'], ['core']]) {
    const result = spawnSync(process.execPath, ['packages/cli/scripts/control-command-package-test.js', ...selector], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Invalid control-command package test selector/);
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
  for (const [id, job] of Object.entries(reusable.jobs).filter(([id]) => id !== 'plan')) {
    assert.equal(job.strategy['fail-fast'], false, id);
    assert.equal(job.name, '${{ matrix.graphLabel }}');
    assert.ok(job.steps.some(step => step.run?.includes('node scripts/ci-plan.mjs --job')));
  }
  assert.ok(reusable.jobs.plan.steps.some(step => step.run?.includes('node scripts/ci-plan.mjs --matrix')));
});
