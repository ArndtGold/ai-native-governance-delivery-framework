import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import process from "node:process";
import { generatedRoot, pluginDefinition } from "./runtime-context.js";
import { createHash } from "node:crypto";

// MCP serves only the selected skill's allowlisted modules from its own verified package.
// No caller-provided path, inherited plugin-root environment or executable is consumed.
export function readSkillRuntimeContracts(skillId, { definition = pluginDefinition, packageGeneratedRoot = generatedRoot } = {}) {
  const modules = definition.skillSet.find(skill => skill.slug === skillId)?.runtimeContractModules;
  if (!Array.isArray(modules) || !modules.length || new Set(modules).size !== modules.length) throw new Error("runtime_contracts_unavailable");
  return Object.freeze(modules.map(module => {
    const result = readRuntimeContract(module, { pluginRoot: null, definition, packageGeneratedRoot });
    if (!result.ok || !result.content.trim()) throw new Error("runtime_contracts_unavailable");
    return Object.freeze({ module, content: result.content, sha256: createHash("sha256").update(result.content).digest("hex") });
  }));
}

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
  // Copilot keeps contracts beside its runtime/create-agdf package. Derive this profile
  // location from the loaded package, never from a caller path or inherited environment.
  const packagedRuntime = dirname(dirname(packageGeneratedRoot));
  const ownCopilotContracts = basename(packagedRuntime) === "runtime"
      && basename(dirname(packageGeneratedRoot)) === "create-agdf"
    ? join(dirname(packagedRuntime), "copilot-skills", "contracts") : null;
  const roots = [
    ...(pluginRoot ? [join(pluginRoot, "meta", "contracts"), join(pluginRoot, "copilot-skills", "contracts")] : []),
    join(packageGeneratedRoot, "plugins", "agdf", "meta", "contracts"),
    ...(ownCopilotContracts ? [ownCopilotContracts] : []),
  ];
  for (const root of roots) {
    const path = join(root, `${module}.md`);
    if (existsSync(path)) return Object.freeze({ ok: true, module, path, content: readFileSync(path, "utf8") });
  }
  return Object.freeze({ ok: false, reason: "module_unavailable", modules });
}
