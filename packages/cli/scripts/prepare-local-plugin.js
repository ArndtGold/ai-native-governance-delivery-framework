import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { syncPackageAssets } from "../../../scripts/sync-package-assets.js";
import { getPluginSourceRoot } from "../../../scripts/public-plugin/source-root.js";
import { COCKPIT_UI_BUILD_COMMAND, COCKPIT_UI_BUILD_ROOT, readCockpitUiBuild, readDecisionUiBuild } from "../../../scripts/cockpit-ui-build.mjs";
import { npmInvocation } from "../lib/npm-invocation.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function prepareLocalPlugin(surface) {
  if (!["codex", "claude", "copilot", "opencode"].includes(surface)) {
    throw new Error(`Unsupported AGDF local install surface: ${surface || "missing"}`);
  }
  const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
  const definition = readJson(join(getPluginSourceRoot(resolve(packageRoot, "../..")), "meta", "agdf-plugin.definition.json"));
  if (readJson(join(packageRoot, "package.json")).version !== definition.version) {
    throw new Error("AGDF local package and plugin versions differ.");
  }
  const validateUi = () => {
    readDecisionUiBuild();
    if (["codex", "claude"].includes(surface)) readCockpitUiBuild();
  };
  try {
    validateUi();
  } catch {
    // The canonical build writes both resources. Never follow linked output paths
    // while repairing an invalid build, including resources this surface omits.
    for (const path of [COCKPIT_UI_BUILD_ROOT, ...["cockpit.html", "manifest.json", "decision.html", "decision-manifest.json"]
      .map((name) => join(COCKPIT_UI_BUILD_ROOT, name))]) {
      if (lstatSync(path, { throwIfNoEntry: false })?.isSymbolicLink()) {
        throw new Error(`AGDF_UI_BUILD_PATH_INVALID: remove the linked build output ${path}, then retry.`);
      }
    }
    const build = npmInvocation(["--prefix", "packages/control-ui", "run", "build:mcp"]);
    try {
      execFileSync(build.executable, build.args, { cwd: resolve(packageRoot, "../.."), encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      const output = [error?.stdout, error?.stderr].map((value) => String(value || "").trim()).filter(Boolean).join("\n");
      throw new Error(`AGDF_UI_BUILD_FAILED: ${COCKPIT_UI_BUILD_COMMAND}\nIf UI build dependencies are missing, run npm --prefix packages/control-ui ci --ignore-scripts, then retry.\n${output || error.message}`, { cause: error });
    }
    // A successful command alone does not prove current, intact UI resources.
    validateUi();
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
