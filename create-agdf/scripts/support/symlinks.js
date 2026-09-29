import { symlinkSync } from "node:fs";
import process from "node:process";

// Windows without Developer Mode or elevation refuses symlinks with EPERM. Directory links fall back
// to junctions, which need no privilege and which Node reports through lstat().isSymbolicLink() and
// realpath() like symlinks, so escape checks stay exercised. File links have no such fallback.
export function linkDirectory(target, path, { platform = process.platform } = {}) {
  symlinkSync(target, path, platform === "win32" ? "junction" : "dir");
}

// Returns false (after a visible notice) when file symlinks are unavailable, so the caller skips only
// the assertions that need one. Any other failure, or EPERM outside Windows, still fails the test.
export function tryLinkFile(target, path, label, { platform = process.platform, link = symlinkSync } = {}) {
  try {
    link(target, path, "file");
    return true;
  } catch (error) {
    if (platform !== "win32" || !["EPERM", "EACCES"].includes(error?.code)) throw error;
    console.warn(`[${label}] SKIPPED file-symlink assertions: this environment cannot create file symlinks (${error.code}) without elevated privileges or Windows Developer Mode`);
    return false;
  }
}
