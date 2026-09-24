import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import process from "node:process";
import { generatedRoot, pluginDefinition } from "./runtime-context.js";

export function runtimeContractModules(definition = pluginDefinition) {
  return definition.runtimeContract.modules.map((path) => basename(path, ".md"));
}

// Serves the packaged runtime-contract modules through the validator. Claude Code grants skills no
// read access to the plugin directory, so skills read their contracts with this command instead of
// the file system. Only modules named by the plugin definition are served.
export function readRuntimeContract(module, {
  pluginRoot = process.env.AGDF_DISPATCH_PLUGIN_ROOT,
  definition = pluginDefinition,
  packageGeneratedRoot = generatedRoot,
} = {}) {
  const modules = runtimeContractModules(definition);
  if (!modules.includes(module)) return Object.freeze({ ok: false, reason: "module_unknown", modules });
  const roots = [
    ...(pluginRoot ? [join(pluginRoot, "meta", "contracts"), join(pluginRoot, "copilot-skills", "contracts")] : []),
    join(packageGeneratedRoot, "plugins", "agdf", "meta", "contracts"),
  ];
  for (const root of roots) {
    const path = join(root, `${module}.md`);
    if (existsSync(path)) return Object.freeze({ ok: true, module, path, content: readFileSync(path, "utf8") });
  }
  return Object.freeze({ ok: false, reason: "module_unavailable", modules });
}
