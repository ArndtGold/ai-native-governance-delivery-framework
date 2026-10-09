import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = mkdtempSync(join(tmpdir(), 'agdf-evidence-publication-'));
const publisher = fileURLToPath(new URL('./publish-update.sh', import.meta.url));
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
try {
  const remote = join(root, 'remote.git');
  const repo = join(root, 'repo');
  const bin = join(root, 'bin');
  const log = join(root, 'gh.log');
  const patch = join(root, 'update.patch');
  mkdirSync(bin);
  git(root, 'init', '--bare', remote);
  git(root, 'init', '-b', 'main', repo);
  git(repo, 'config', 'user.name', 'Evidence test');
  git(repo, 'config', 'user.email', 'evidence@example.invalid');
  git(repo, 'remote', 'add', 'origin', remote);
  mkdirSync(join(repo, 'docs/compatibility'), { recursive: true });
  writeFileSync(join(repo, 'docs/compatibility/HOST_COMPATIBILITY.md'), 'old\n');
  git(repo, 'add', '.');
  git(repo, 'commit', '-m', 'source baseline');
  git(repo, 'push', 'origin', 'main');
  const base = git(repo, 'rev-parse', 'HEAD');
  writeFileSync(join(bin, 'gh'), `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "$MOCK_GH_LOG"
if [[ "$1 $2" == 'pr list' ]]; then printf '%s' "$MOCK_PR_NUMBER"; fi
`, { mode: 0o755 });
  const env = { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH}`, GH_TOKEN: 'fixture-only', GITHUB_REPOSITORY: 'fixture/repo',
    EVIDENCE_BASE_SHA: base, EVIDENCE_PATCH: patch, MOCK_GH_LOG: log, MOCK_PR_NUMBER: '' };
  const run = overrides => spawnSync('bash', [publisher], { cwd: repo, env: { ...env, ...overrides }, encoding: 'utf8' });
  const makePatch = (path, content) => {
    git(repo, 'checkout', '-B', 'fixture', base);
    writeFileSync(join(repo, path), content);
    git(repo, 'add', '--', path);
    writeFileSync(patch, execFileSync('git', ['diff', '--cached', '--binary'], { cwd: repo }));
    git(repo, 'reset', '--hard', base);
    writeFileSync(log, '');
  };

  makePatch('docs/compatibility/HOST_COMPATIBILITY.md', 'refreshed\n');
  const created = run();
  assert.equal(created.status, 0, created.stderr);
  assert.equal(git(repo, 'show', 'HEAD:docs/compatibility/HOST_COMPATIBILITY.md'), 'refreshed');
  assert.equal(git(repo, 'rev-parse', 'HEAD^'), base, 'evidence commit must retain the exact source parent');
  assert.equal(git(remote, 'rev-parse', 'refs/heads/codex/host-compatibility-evidence'), git(repo, 'rev-parse', 'HEAD'));
  assert.match(readFileSync(log, 'utf8'), /pr create .*--head codex\/host-compatibility-evidence --base main/u);
  assert.match(readFileSync(log, 'utf8'), /workflow run agdf-guardrails.yml .*--ref codex\/host-compatibility-evidence/u);

  makePatch('docs/compatibility/HOST_COMPATIBILITY.md', 'second refresh\n');
  const updated = run({ MOCK_PR_NUMBER: '17' });
  assert.equal(updated.status, 0, updated.stderr);
  assert.match(readFileSync(log, 'utf8'), /pr edit 17/u);
  assert.doesNotMatch(readFileSync(log, 'utf8'), /pr create/u);
  assert.equal(git(repo, 'rev-parse', 'HEAD^'), base, 'updating the owned branch must not accumulate stale evidence commits');

  const published = git(remote, 'rev-parse', 'refs/heads/codex/host-compatibility-evidence');
  makePatch('unexpected.txt', 'must not publish\n');
  const forbidden = run();
  assert.notEqual(forbidden.status, 0);
  assert.match(forbidden.stderr, /Unexpected evidence update path/u);
  assert.equal(git(remote, 'rev-parse', 'refs/heads/codex/host-compatibility-evidence'), published);
  assert.doesNotMatch(readFileSync(log, 'utf8'), /pr (create|edit)|workflow run/u);
  git(repo, 'reset', '--hard', base);

  makePatch('docs/compatibility/HOST_COMPATIBILITY.md', 'now stale\n');
  git(repo, 'checkout', 'main');
  writeFileSync(join(repo, 'source-change.txt'), 'newer source\n');
  git(repo, 'add', '.');
  git(repo, 'commit', '-m', 'main advanced');
  git(repo, 'push', 'origin', 'main');
  const stale = run();
  assert.equal(stale.status, 0, stale.stderr);
  assert.match(stale.stdout, /main advanced/u);
  assert.equal(git(remote, 'rev-parse', 'refs/heads/codex/host-compatibility-evidence'), published);
  assert.doesNotMatch(readFileSync(log, 'utf8'), /pr (create|edit)|workflow run/u);
  console.log('Evidence publication tests passed (create, update, path rejection, stale source; isolated Git remote and mocked GitHub).');
} finally {
  rmSync(root, { recursive: true, force: true });
}
