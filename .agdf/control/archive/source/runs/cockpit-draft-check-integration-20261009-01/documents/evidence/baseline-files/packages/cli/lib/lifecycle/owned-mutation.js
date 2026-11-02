import { createHash } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

function conflict(path) {
  const error = new Error(`AGDF_OWNERSHIP_CONFLICT: ${path}`);
  error.code = "AGDF_OWNERSHIP_CONFLICT";
  return error;
}

export function ownedFileSnapshot(path) {
  // NTFS inode IDs can exceed Number precision; compare complete integer identities.
  // A planned new file has no inode to check. Validate its nearest existing parent too, so a
  // directory replaced by a symlink between plan and apply cannot redirect an atomic write.
  let parentPath = dirname(path);
  let parent;
  for (;;) {
    try {
      parent = lstatSync(parentPath, { bigint: true });
      if (parent.isSymbolicLink() || !parent.isDirectory()) throw conflict(path);
      break;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      const next = dirname(parentPath);
      if (next === parentPath) throw conflict(path);
      parentPath = next;
    }
  }
  let target;
  try { target = lstatSync(path, { bigint: true }); }
  catch (error) {
    if (error?.code === "ENOENT") return {
      parent: `${parent.dev}:${parent.ino}`, file: null, digest: null,
    };
    throw error;
  }
  if (target.isSymbolicLink() || !target.isFile()) throw conflict(path);
  return { parent: `${parent.dev}:${parent.ino}`, file: `${target.dev}:${target.ino}`,
    digest: createHash("sha256").update(readFileSync(path)).digest("hex") };
}

export function fileContentDigest(path) {
  return ownedFileSnapshot(path).digest;
}

export function assertUnchangedOwnedFile(path, expectedSnapshot) {
  const current = ownedFileSnapshot(path);
  if (!expectedSnapshot || current.parent !== expectedSnapshot.parent
      || current.file !== expectedSnapshot.file || current.digest !== expectedSnapshot.digest) throw conflict(path);
}

export function directoryIdentity(path) {
  let type;
  try { type = lstatSync(path, { bigint: true }); }
  catch (error) { if (error?.code === "ENOENT") return null; throw error; }
  if (type.isSymbolicLink() || !type.isDirectory()) throw conflict(path);
  return `${type.dev}:${type.ino}`;
}

export function assertOwnedDirectory(path, expectedIdentity, inspect) {
  if (!expectedIdentity || directoryIdentity(path) !== expectedIdentity || inspect(path) !== "owned") {
    throw conflict(path);
  }
}
