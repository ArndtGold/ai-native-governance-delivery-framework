import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = (repository, args, options = {}) => execFileSync('git', args, { cwd: repository, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...options });

export function exportSnapshot(repository, destination, { ref } = {}) {
  mkdirSync(destination, { recursive: true });
  const indexDirectory = mkdtempSync(join(tmpdir(), 'agdf-snapshot-index-'));
  const env = { ...process.env, GIT_INDEX_FILE: join(indexDirectory, 'index') };
  try {
    let entries;
    if (ref) {
      const commit = git(repository, ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]).trim();
      git(repository, ['read-tree', commit], { env });
      entries = git(repository, ['ls-files', '--stage', '-z'], { env }).split('\0').filter(Boolean);
    } else {
      entries = git(repository, ['ls-files', '--stage', '-z']).split('\0').filter(Boolean);
    }
    if (entries.some(entry => !/^\d+ [0-9a-f]+ 0\t/u.test(entry))) throw new Error('Resolve index conflicts before verification.');
    if (entries.some(entry => entry.startsWith('160000 '))) throw new Error('Snapshot verification requires explicit submodule support.');
    if (!ref) git(repository, ['update-index', '-z', '--index-info'], { env, input: entries.map(entry => `${entry}\0`).join('') });
    // CI uses fetch-depth: 0. Retain release tags/history as well, without checking out files,
    // copying worktree state, linking object files or contacting the source's remote.
    git(repository, ['-c', 'init.templateDir=', 'clone', '--no-local', '--no-checkout', '--', repository, destination]);
    if (git(repository, ['for-each-ref', '--format=%(refname)', 'refs/remotes/']).trim()) {
      git(destination, ['fetch', '--no-write-fetch-head', '--no-tags', repository, '+refs/remotes/*:refs/remotes/*']);
    }
    // Reads blobs from the index, never the working copy; does not update the source index.
    git(repository, ['checkout-index', '--all', `--prefix=${destination.replaceAll('\\', '/')}/`], { env });
  } finally { rmSync(indexDirectory, { recursive: true, force: true }); }
  // Only the disposable clone receives the exported snapshot's index.
  git(destination, ['config', 'core.longpaths', 'true']);
  git(destination, ['add', '--all', '--force', '--', '.']);
}

export function verifyCommit({ repository = root, ref, execute = spawnSync } = {}) {
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-commit-'));
  const snapshot = join(temporary, 'checkout');
  try {
    exportSnapshot(repository, snapshot, { ref });
    const entry = join(snapshot, 'scripts/verify-ci.mjs');
    if (!existsSync(entry)) throw new Error('The snapshot lacks scripts/verify-ci.mjs. Stage the verifier and its dependencies before checking the index.');
    console.log(`[verify-commit] Isolated ${ref ? `commit ${ref}` : 'Git index'}; Node ${process.versions.node}, ${process.platform}.`);
    const result = execute(process.execPath, [entry], { cwd: snapshot, env: { ...process.env, AGDF_DATA_DIR: join(temporary, 'data') }, stdio: 'inherit', shell: false });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Snapshot verification failed (${result.signal ?? result.status}); source checkout and index were preserved.`);
    console.log('[verify-commit] PASS: the exact snapshot passed the shared repository plan on this Node/OS.');
  } finally { rmSync(temporary, { recursive: true, force: true }); }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== '--ref' || !args[1])) throw new Error('Usage: verify-commit.mjs [--ref <commit>] (default: staged Git index)');
    verifyCommit({ ref: args[1] });
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
