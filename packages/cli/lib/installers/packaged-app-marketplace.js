import { lstatSync, readFileSync, renameSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import process from "node:process";
import { packagedAppCopies, sameFileSystemEntry } from "#agdf-core/runtime/host-installation.js";

const OWNERSHIP_FILE = ".agdf-owned.json";

function ownedMarketplaceMarker(root, fs) {
  try {
    const type = fs.lstatSync(root);
    if (type.isSymbolicLink() || !type.isDirectory()) return null;
    const marker = JSON.parse(fs.readFileSync(join(root, OWNERSHIP_FILE), "utf8"));
    return marker?.schema_version === 1
      && marker.owner === "create-agdf"
      && marker.marketplace_id === basename(root)
      && (marker.profile_id ?? "runtime-plugin") === "runtime-plugin"
      && marker.staging_state === "ready"
      ? marker
      : null;
  } catch {
    return null;
  }
}

// A committed marketplace is not what packaged hosts see while their private copy of the same location
// (see packagedAppCopies) survives: Claude Code inside Claude Desktop loads the plugin in place from it.
// A stale AGDF-owned copy is retired, so the package falls back to the committed root. When the copy is
// this process's own view, the install itself ran inside a package and stays invisible outside of it.
export function reconcilePackagedAppMarketplaceCopies({
  root,
  sourceDigest,
  pluginDigest,
  env = process.env,
  platform = process.platform,
  now = Date.now,
  fs = { lstatSync, readFileSync, renameSync, rmSync },
} = {}) {
  return packagedAppCopies(root, { env, platform }).map((copy) => {
    const observed = { package: copy.package, path: copy.path };
    if (sameFileSystemEntry(copy.path, root)) return Object.freeze({ ...observed, state: "install_view" });
    const marker = ownedMarketplaceMarker(copy.path, fs);
    if (!marker) return Object.freeze({ ...observed, state: "foreign" });
    if (marker.source_digest === sourceDigest && marker.plugin_digest === pluginDigest) {
      return Object.freeze({ ...observed, state: "current" });
    }
    const retiredPath = `${copy.path}.retired-${now()}`;
    try {
      fs.renameSync(copy.path, retiredPath);
    } catch (error) {
      return Object.freeze({ ...observed, state: "stale", reason: error?.code || "rename_failed" });
    }
    try {
      fs.rmSync(retiredPath, { recursive: true, force: true });
    } catch {
      return Object.freeze({ ...observed, state: "retired", cleanup: retiredPath });
    }
    return Object.freeze({ ...observed, state: "retired" });
  });
}

export function packagedAppCopyEvidence(copies) {
  return copies.map((copy) => `packaged_app_copy:${copy.package}:${copy.state}${copy.reason ? `:${copy.reason}` : ""}`);
}

export function packagedAppCopiesHealthy(copies) {
  return copies.every((copy) => ["current", "retired"].includes(copy.state));
}
