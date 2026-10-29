import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gitConfigPaths, parseGitIdentity, readGitIdentity } from '../lib/control-state/git-identity.js';

// Synthetic temporary HOME, XDG and repository directories only; no process is started.
const base = mkdtempSync(join(tmpdir(), 'agdf-git-identity-'));
try {
  const home = join(base, 'home'), xdg = join(base, 'xdg'), repo = join(base, 'repo'), worktree = join(base, 'worktree');
  for (const dir of [home, join(xdg, 'git'), join(home, '.config', 'git'), join(repo, '.git', 'worktrees', 'feature'), join(repo, 'nested', 'deeper'), worktree]) mkdirSync(dir, { recursive: true });
  const options = { env: { XDG_CONFIG_HOME: xdg }, home };
  const write = (path, text) => writeFileSync(path, text);

  // Absent everywhere: unknown, never an invented person.
  assert.deepEqual(readGitIdentity(repo, options), { statement: 'unknown' });

  // The XDG config is the last source; CRLF, quotes, escapes and comments are handled.
  write(join(xdg, 'git', 'config'), '[user]\r\n\tname = "Xdg \\"Quoted\\" Name"  # comment\r\n\temail = xdg@example.invalid\r\n');
  assert.deepEqual(readGitIdentity(repo, options), { name: 'Xdg "Quoted" Name', email: 'xdg@example.invalid', statement: 'cooperative' });
  // Without XDG_CONFIG_HOME the default ~/.config/git/config is read instead.
  write(join(home, '.config', 'git', 'config'), '[user]\n  name = Default Xdg\n');
  assert.equal(readGitIdentity(repo, { env: {}, home }).name, 'Default Xdg');
  assert.equal(gitConfigPaths(repo, { env: { XDG_CONFIG_HOME: 'relative/path' }, home })[2], join(home, '.config', 'git', 'config'));

  // ~/.gitconfig precedes the XDG config, as in Git; first value per key wins across sources.
  write(join(home, '.gitconfig'), '[user]\n\tname = Home Name\n');
  assert.deepEqual(readGitIdentity(repo, options), { name: 'Home Name', email: 'xdg@example.invalid', statement: 'cooperative' });
  assert.deepEqual(gitConfigPaths(repo, options).slice(1), [join(home, '.gitconfig'), join(xdg, 'git', 'config')]);
  // An explicitly empty value is set and ends the fallthrough.
  write(join(home, '.gitconfig'), '[user]\n\tname = Home Name\n\temail =\n');
  assert.deepEqual(readGitIdentity(repo, options), { name: 'Home Name', email: null, statement: 'cooperative' });
  write(join(home, '.gitconfig'), '[user]\n\tname = ""\n\temail = ""\n');
  assert.deepEqual(readGitIdentity(repo, options), { statement: 'unknown' }, 'Empty home values hide the XDG identity');
  write(join(home, '.gitconfig'), '[user]\n\tname = Home Name\n');

  // The repository config precedes the global ones, also from a nested directory; includes are ignored;
  // within one file the last value wins.
  write(join(repo, '.git', 'config'), '[core]\n\tbare = false\n[include]\n\tpath = other.config\n[includeIf "gitdir:~/"]\n\tpath = more.config\n[user "sub"]\n\tname = Subsection Name\n[USER]\n\tName = Repo Name ; trailing comment\n\tname = Repo Last Name\n');
  write(join(repo, '.git', 'other.config'), '[user]\n\temail = included@example.invalid\n');
  assert.deepEqual(readGitIdentity(repo, options), { name: 'Repo Last Name', email: 'xdg@example.invalid', statement: 'cooperative' });
  assert.equal(readGitIdentity(join(repo, 'nested', 'deeper'), options).name, 'Repo Last Name');

  // A .git file names its gitdir; commondir leads to the shared repository config.
  write(join(worktree, '.git'), `gitdir: ${join(repo, '.git', 'worktrees', 'feature')}\r\n`);
  write(join(repo, '.git', 'worktrees', 'feature', 'commondir'), '../..\n');
  assert.equal(readGitIdentity(worktree, options).name, 'Repo Last Name');
  const separate = join(base, 'separate-gitdir'); mkdirSync(separate);
  write(join(separate, 'config'), '[user]\n\temail = separate@example.invalid\n');
  const linked = join(base, 'linked'); mkdirSync(linked);
  write(join(linked, '.git'), 'gitdir: ../separate-gitdir\n');
  assert.deepEqual(readGitIdentity(linked, options), { name: 'Home Name', email: 'separate@example.invalid', statement: 'cooperative' });

  // Values stay single table-safe lines; escapes and quoted spaces are kept.
  assert.deepEqual(parseGitIdentity('[user] name = "  Spaced  " \n[user]\nemail=a\\tb|c@example.invalid\n'), { name: '  Spaced  ', email: 'a\tb|c@example.invalid' });
  write(join(repo, '.git', 'config'), '[user]\n\tname = "Pipe | Name"\n');
  assert.deepEqual(readGitIdentity(repo, { env: {}, home: join(base, 'nohome') }), { name: 'Pipe / Name', email: null, statement: 'cooperative' });
  console.log('Git identity from repository, worktree, home and XDG config in Git order, without includes or processes passed (synthetic only).');
} finally { rmSync(base, { recursive: true, force: true }); }
