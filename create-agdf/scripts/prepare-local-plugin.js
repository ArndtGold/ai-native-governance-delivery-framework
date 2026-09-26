import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { syncPackageAssets } from "./sync-package-assets.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function prepareLocalPlugin(surface) {
  if (!["codex", "claude", "copilot", "opencode"].includes(surface)) {
    throw new Error(`Unsupported AGDF local install surface: ${surface || "missing"}`);
  }
  const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
  const definition = readJson(join(packageRoot, "..", "plugin", "meta", "agdf-plugin.definition.json"));
  if (readJson(join(packageRoot, "package.json")).version !== definition.version) {
    throw new Error("AGDF local package and plugin versions differ.");
  }
  syncPackageAssets({ surface });
  // All hosts consume the shared CLI metadata. Copilot additionally owns a separate payload.
  const roots = [join(packageRoot, "generated", "plugins", "agdf")];
  if (surface === "copilot") roots.push(join(packageRoot, "generated", "plugins", "copilot", "agdf"));
  for (const root of roots) {
    const result = JSON.parse(execFileSync(process.execPath, [
      join(root, "runtime", "agdf-local.js"), "--resolve-only", "--json",
    ], { encoding: "utf8", stdio: "pipe" }));
    if (result.machine_validation !== "owned_version_matched"
        || result.observed_version !== definition.version
        || result.evidence_plane !== "generated_bundle") {
      throw new Error(`AGDF local runtime validation failed: ${root}`);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareLocalPlugin(process.argv[2]);
}
