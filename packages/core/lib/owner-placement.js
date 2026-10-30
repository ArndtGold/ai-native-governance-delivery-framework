import { constants, closeSync, fstatSync, lstatSync, openSync, realpathSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

// Internal fixed owner roles. The owner binds bytes, intent and producer; this
// helper binds existing objects across mount-session device-number changes.
const anchors = Object.freeze({ 'canonical-control': '.agdf-canonical-init.json', 'marketplace-publication': '.agdf-owned.json' });
const inode = value => typeof value === 'bigint' && value > 0n ? String(value) : (() => { throw Error('owner_placement_unsupported'); })();
function directory(path) {
  const resolved = resolve(path), real = realpathSync(path);
  // Preserve the platform's fixed system aliases used by existing CLI/installer
  // temp paths. A linked target entry or any additional linked ancestor rejects.
  if (real !== resolved && !(process.platform === 'darwin'
    && real === resolved.replace(/^\/(var|tmp|etc)(?=\/|$)/u, '/private/$1'))) throw Error('owner_placement_unsafe');
  const stat = lstatSync(path, { bigint: true });
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw Error('owner_placement_unsafe');
  inode(stat.ino); return stat;
}
const sameLive = (a, b) => a.dev === b.dev && a.ino === b.ino;
export function directoryPlacement(path) {
  const stat = directory(path);
  return Object.freeze({ location: realpathSync(path), ino: inode(stat.ino) });
}
export function ownerPlacement(path, role, logicalPath = path) {
  const name = anchors[role];
  if (!name) throw Error('owner_placement_role_invalid');
  const before = directory(path), anchorPath = join(path, name);
  let fd;
  try {
    const entry = lstatSync(anchorPath, { bigint: true });
    if (!entry.isFile() || entry.isSymbolicLink() || entry.nlink !== 1n) throw Error('owner_placement_unsafe');
    fd = openSync(anchorPath, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    const opened = fstatSync(fd, { bigint: true });
    const after = lstatSync(anchorPath, { bigint: true });
    if (!opened.isFile() || opened.nlink !== 1n || !sameLive(entry, opened)
      || !after.isFile() || after.isSymbolicLink() || after.nlink !== 1n
      || !sameLive(opened, after) || !sameLive(before, directory(path))) throw Error('owner_placement_changed');
    return Object.freeze({ schema_version: 1, role, location: join(realpathSync(dirname(logicalPath)), basename(logicalPath)), directory_ino: inode(before.ino),
      anchor: Object.freeze({ name, ino: inode(opened.ino) }) });
  } finally { if (fd !== undefined) closeSync(fd); }
}
export function assertOwnerPlacement(binding, path, role, logicalPath = path) {
  const actual = ownerPlacement(path, role, logicalPath);
  if (!binding || JSON.stringify(binding) !== JSON.stringify(actual)) throw Error('owner_placement_changed');
  return actual;
}
export function assertDirectoryPlacement(binding, path) {
  const actual = directoryPlacement(path);
  if (!binding || JSON.stringify(binding) !== JSON.stringify(actual)) throw Error('owner_placement_changed');
  return actual;
}
