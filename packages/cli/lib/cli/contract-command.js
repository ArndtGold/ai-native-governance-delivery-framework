import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import process from "node:process";
import { generatedRoot, pluginDefinition } from "./runtime-context.js";
import { createHash } from "node:crypto";

export { runtimeContractModules } from "#agdf-core/resources/contracts.js";
import { resources } from "../runtime/control-context.js";
import { readSkillRuntimeContracts as readOwnedSkillContracts } from "#agdf-core/resources/contracts.js";
export function readSkillRuntimeContracts(skill, { definition = resources.pluginDefinition, packageGeneratedRoot = resources.generatedRoot } = {}) {
  if (packageGeneratedRoot !== resources.generatedRoot) throw new Error("runtime_contracts_unavailable");
  return readOwnedSkillContracts(skill, { context: { ...resources, pluginDefinition: definition } });
}
import { runtimeContractModules, readRuntimeContract as readOwnedContract } from "#agdf-core/resources/contracts.js";
export function readRuntimeContract(module, { pluginRoot = process.env.AGDF_DISPATCH_PLUGIN_ROOT, definition = pluginDefinition, packageGeneratedRoot = resources.generatedRoot } = {}) {
  const modules = runtimeContractModules(definition);
  if (!modules.includes(module)) return Object.freeze({ ok: false, reason: "module_unknown", modules });
  if (pluginRoot) for (const root of [join(pluginRoot, "meta", "contracts"), join(pluginRoot, "copilot-skills", "contracts")]) {
    const path = join(root, `${module}.md`);
    if (existsSync(path)) return Object.freeze({ ok: true, module, path, content: readFileSync(path, "utf8") });
  }
  if (packageGeneratedRoot !== resources.generatedRoot) return Object.freeze({ ok: false, reason: "module_unavailable", modules });
  return readOwnedContract(module, { context: resources });
}
