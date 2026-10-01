import { lstatSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, join, posix, relative, resolve, sep, win32 } from "node:path";

// A control artefact path is stored independently of the current host. Check Windows forms even
// on POSIX, where `D:foo` would otherwise name an ordinary file inside the checkout.
export function isSafeControlRelativePath(value) {
  if (typeof value !== "string" || !value || value === "none" || value.includes("\0")
      || value.includes("\\") || value.includes(":")) return false;
  if (isAbsolute(value) || win32.isAbsolute(value) || posix.isAbsolute(value)) return false;
  const normalized = posix.normalize(value);
  return normalized !== "." && normalized !== ".." && !normalized.startsWith("../")
    && normalized === value;
}

export function hasSymlinkComponent(root, relativePath) {
  if (!isSafeControlRelativePath(relativePath)) return true;
  let cursor = root;
  for (const component of relativePath.split("/")) {
    cursor = join(cursor, component);
    try {
      if (lstatSync(cursor).isSymbolicLink()) return true;
    } catch (error) {
      // A genuinely absent planned output is safe; unreadable or non-directory ancestors are not.
      return error.code !== "ENOENT";
    }
  }
  return false;
}

export function containedRegularFile(root, value) {
  if (!isSafeControlRelativePath(value)) return { status: "invalid", path: "" };
  const target = resolve(root, value);
  const lexical = relative(resolve(root), target);
  if (!lexical || lexical === ".." || lexical.startsWith(`..${sep}`) || isAbsolute(lexical)) {
    return { status: "invalid", path: "" };
  }
  let realRoot;
  let realTarget;
  try {
    realRoot = realpathSync(root);
    realTarget = realpathSync(target);
  } catch {
    return { status: "missing", path: "" };
  }
  const within = relative(realRoot, realTarget);
  if (!within || within === ".." || within.startsWith(`..${sep}`) || isAbsolute(within)) {
    return { status: "invalid", path: "" };
  }
  try {
    return statSync(realTarget).isFile()
      ? { status: "valid", path: realTarget }
      : { status: "invalid", path: "" };
  } catch {
    return { status: "missing", path: "" };
  }
}
