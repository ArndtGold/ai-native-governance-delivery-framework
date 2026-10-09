import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verificationPlan, runVerification } from './verify-ci.mjs';
import { exportSnapshot, verifyCommit } from './verify-commit.mjs';
import { npmInvocation } from '../packages/cli/lib/npm-invocation.js';
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

test('full plan preserves dependency ordering and mandatory package consumers in both lanes', () => {
  for (const lane of ['repository', 'runtime']) {
    const plan = verificationPlan({ lane });
    const ids = plan.map(item => item.id);
    assert.ok(ids.indexOf('dependencies') < ids.indexOf('prepare'));
    for (const early of ['build-contracts', 'evals']) {
      assert.ok(ids.indexOf('generate') < ids.indexOf(early));
      assert.ok(ids.indexOf(early) < ids.indexOf('assemble'));
      assert.ok(ids.indexOf(early) < ids.indexOf('mcp-dependencies'));
    }
    assert.ok(ids.indexOf('prepare') < ids.indexOf('mcp-dependencies'));
    assert.ok(ids.indexOf('mcp-dependencies') < ids.indexOf('archives'));
    assert.ok(ids.indexOf('archives') < ids.indexOf('cli-smoke'));
    assert.ok(ids.includes('wrapper-smoke') && ids.includes('transactions') && ids.includes('evals'));
    assert.equal(ids.includes('host-compatibility'), lane === 'repository');
    assert.equal(ids.includes('compatibility-freshness'), lane === 'repository');
    assert.equal(ids.includes('pages'), lane === 'repository');
  }
  assert.throws(() => verificationPlan({ lane: 'skip-tests' }), /Unknown/);
  assert.throws(() => verificationPlan({ stage: 'missing' }), /Unknown/);
});

test('build shares CI checks without recursive builds; evidence preparation remains possible', () => {
  const build = verificationPlan({ profile: 'build' });
  assert.deepEqual(build.map(item => item.id), ['generate', 'build-contracts', 'evals', 'compatibility-freshness', 'assemble']);
  for (const item of build) assert.deepEqual(item, verificationPlan({ stage: item.id })[0]);
  assert.deepEqual(verificationPlan({ profile: 'prepare' }).map(item => item.id), ['generate', 'assemble', 'prepare']);
  assert.ok(verificationPlan().every(item => item.commands.every(command => !command.args.includes('build'))));
  assert.throws(() => verificationPlan({ profile: 'unchecked' }), /Unknown/);
  assert.throws(() => verificationPlan({ profile: 'build', stage: 'assemble' }), /no stage/);
  assert.throws(() => verificationPlan({ profile: 'build', lane: 'runtime' }), /no stage/);
});

test('real npm build failures prevent assembly and preserve stored evidence', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'agdf early build '));
  try {
    for (const folder of ['scripts', 'packages/cli/scripts', 'packages/cli/lib']) mkdirSync(join(temporary, folder), { recursive: true });
    cpSync(new URL('./verify-ci.mjs', import.meta.url), join(temporary, 'scripts/verify-ci.mjs'));
    cpSync(new URL('../packages/cli/lib/npm-invocation.js', import.meta.url), join(temporary, 'packages/cli/lib/npm-invocation.js'));
    const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    writeFileSync(join(temporary, 'package.json'), JSON.stringify({ type: 'module', scripts: {
      build: manifest.scripts.build,
      'compatibility:check': 'node scripts/evidence-check.mjs',
    } }));
    writeFileSync(join(temporary, 'packages/cli/package.json'), JSON.stringify({ scripts: { 'eval:skills': 'node ../../scripts/eval-check.mjs' } }));
    const scripts = {
      generate: 'scripts/sync-package-assets.js',
      'build-contracts': 'packages/cli/scripts/build-contract-test.js',
      evals: 'scripts/eval-check.mjs',
      'compatibility-freshness': 'scripts/evidence-check.mjs',
      assemble: 'scripts/assemble-npm.mjs',
    };
    const trace = join(temporary, 'trace.jsonl');
    const failure = join(temporary, 'failure');
    const artifact = join(temporary, 'assembled');
    const evidence = join(temporary, 'evidence.json');
    writeFileSync(evidence, '{"snapshot":"reviewed, stale fixture"}\n');
    const before = readFileSync(evidence);
    for (const [id, path] of Object.entries(scripts)) {
      writeFileSync(join(temporary, path), `import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
appendFileSync(${JSON.stringify(trace)}, ${JSON.stringify(id + '\n')});
if (readFileSync(${JSON.stringify(failure)}, 'utf8') === ${JSON.stringify(id)}) throw Error('fixture: ${id} failed');
${id === 'assemble' ? `writeFileSync(${JSON.stringify(artifact)}, 'assembled');` : ''}\n`);
    }
    const npm = npmInvocation(['run', 'build']);
    const ids = Object.keys(scripts);
    for (const id of ['build-contracts', 'evals', 'compatibility-freshness']) {
      writeFileSync(failure, id); writeFileSync(trace, '');
      const result = spawnSync(npm.executable, npm.args, { cwd: temporary, encoding: 'utf8', shell: false });
      assert.equal(result.status, 1, result.stdout + result.stderr);
      assert.match(result.stderr, new RegExp(`failed at ${id}`));
      assert.deepEqual(readFileSync(trace, 'utf8').trim().split('\n'), ids.slice(0, ids.indexOf(id) + 1));
      assert.equal(existsSync(artifact), false, 'a failed early check must not assemble packages');
      assert.deepEqual(readFileSync(evidence), before, 'checking must not refresh evidence');
    }
    writeFileSync(failure, ''); writeFileSync(trace, '');
    const success = spawnSync(npm.executable, npm.args, { cwd: temporary, encoding: 'utf8', shell: false });
    assert.equal(success.status, 0, success.stdout + success.stderr);
    assert.deepEqual(readFileSync(trace, 'utf8').trim().split('\n'), ids);
    assert.equal(readFileSync(artifact, 'utf8'), 'assembled');
    assert.deepEqual(readFileSync(evidence), before);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

test('a failed command stops before later commands and stages', () => {
  const calls = [];
  assert.throws(() => runVerification({ stage: 'prepare', execute: (exe, args, options) => {
    calls.push({ exe, args, options }); return { status: 9 };
  } }), /failed at prepare/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.shell, false);
});

test('the real CLI executes under temporary path aliases and rejects an invalid stage', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-cli-entry-'));
  try {
    mkdirSync(join(temporary, 'scripts'));
    mkdirSync(join(temporary, 'packages/cli/lib'), { recursive: true });
    cpSync(new URL('./verify-ci.mjs', import.meta.url), join(temporary, 'scripts/verify-ci.mjs'));
    cpSync(new URL('../packages/cli/lib/npm-invocation.js', import.meta.url), join(temporary, 'packages/cli/lib/npm-invocation.js'));
    writeFileSync(join(temporary, 'package.json'), '{"type":"module"}\n');
    const result = spawnSync(process.execPath, [join(temporary, 'scripts/verify-ci.mjs'), '--stage', 'missing'], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unknown verification stage/);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

test('snapshot uses staged blobs, excludes unstaged/untracked fixes and preserves source index', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'agdf snapshot test '));
  const repo = join(temporary, 'source'); mkdirSync(repo);
  try {
    git(repo, '-c', 'init.templateDir=', 'init', '-q');
    git(repo, 'config', 'user.name', 'Snapshot fixture');
    git(repo, 'config', 'user.email', 'snapshot@example.invalid');
    writeFileSync(join(repo, 'package.json'), '{"scripts":{"test":"node missing.js"}}\n');
    writeFileSync(join(repo, 'removed.js'), 'committed\n');
    writeFileSync(join(repo, '.gitattributes'), 'removed.js export-ignore\n');
    git(repo, 'add', '.'); git(repo, 'commit', '-qm', 'baseline'); git(repo, 'tag', 'fixture-release');
    git(repo, 'update-ref', 'refs/remotes/origin/main', 'HEAD');
    writeFileSync(join(repo, 'package.json'), '{"scripts":{"test":"node fixed.js"}}\n');
    git(repo, 'add', 'package.json');
    git(repo, 'rm', '-q', 'removed.js');
    writeFileSync(join(repo, 'package.json'), '{"scripts":{}}\n');
    writeFileSync(join(repo, 'fixed.js'), 'untracked fix\n');
    git(repo, 'update-index', '--split-index');
    const before = readFileSync(join(repo, '.git/index'));
    const staged = join(temporary, 'staged'); exportSnapshot(repo, staged);
    assert.match(readFileSync(join(staged, 'package.json'), 'utf8'), /fixed.js/);
    assert.equal(existsSync(join(staged, 'fixed.js')), false);
    assert.equal(existsSync(join(staged, 'removed.js')), false);
    const committed = join(temporary, 'committed'); exportSnapshot(repo, committed, { ref: 'HEAD' });
    assert.match(readFileSync(join(committed, 'package.json'), 'utf8'), /missing.js/);
    assert.equal(existsSync(join(committed, 'removed.js')), true, 'export-ignore must not hide checkout files');
    assert.match(git(committed, 'show', 'fixture-release:removed.js'), /committed/);
    assert.equal(git(committed, 'merge-base', 'HEAD', 'origin/main'), git(repo, 'rev-parse', 'HEAD'));
    assert.deepEqual(readFileSync(join(repo, '.git/index')), before);
    assert.throws(() => verifyCommit({ repository: repo }), /snapshot lacks/);
    assert.deepEqual(readFileSync(join(repo, '.git/index')), before);
    // A verifier failure must reach the caller, without touching the source.
    mkdirSync(join(repo, 'scripts')); writeFileSync(join(repo, 'scripts/verify-ci.mjs'), 'throw Error("fixture");\n');
    git(repo, 'add', 'scripts');
    const withRunner = readFileSync(join(repo, '.git/index'));
    let snapshotPath;
    assert.throws(() => verifyCommit({ repository: repo, execute: (_exe, _args, options) => {
      snapshotPath = options.cwd; assert.equal(existsSync(join(snapshotPath, 'fixed.js')), false); return { status: 1 };
    } }), /Snapshot verification failed/);
    assert.equal(existsSync(snapshotPath), false, 'failed snapshot must be cleaned');
    assert.deepEqual(readFileSync(join(repo, '.git/index')), withRunner);
    git(repo, 'commit', '-qm', 'later runner');
    const older = join(temporary, 'older'); exportSnapshot(repo, older, { ref: 'fixture-release' });
    assert.equal(git(older, 'rev-parse', 'HEAD'), git(repo, 'rev-parse', 'fixture-release'));
    assert.equal(existsSync(join(older, 'scripts/verify-ci.mjs')), false);
    assert.equal(git(older, 'status', '--porcelain').trim(), '', 'selected commit and exported index must agree');
    const blob = git(repo, 'rev-parse', 'HEAD:package.json').trim();
    execFileSync('git', ['update-index', '--index-info'], { cwd: repo, input: `0 ${'0'.repeat(blob.length)}\tpackage.json\n100644 ${blob} 1\tpackage.json\n` });
    assert.throws(() => exportSnapshot(repo, join(temporary, 'conflicted')), /Resolve index conflicts/);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
