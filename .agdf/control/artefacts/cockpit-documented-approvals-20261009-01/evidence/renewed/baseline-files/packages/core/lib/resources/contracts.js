import { readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";
import { resources } from "./context.js";
export function runtimeContractModules(definition = resources.pluginDefinition) {
  return definition.runtimeContract.modules.map(path => basename(path, ".md"));
}
export function readRuntimeContract(module, { context = resources } = {}) {
  const modules = runtimeContractModules(context.pluginDefinition);
  if (!modules.includes(module)) return Object.freeze({ ok: false, reason: "module_unknown", modules });
  const path = join(context.contractsRoot, `${module}.md`);
  try { return Object.freeze({ ok: true, module, path, content: readFileSync(path, "utf8") }); }
  catch { return Object.freeze({ ok: false, reason: "module_unavailable", modules }); }
}
export function readSkillRuntimeContracts(skillId, { context = resources } = {}) {
  const modules = context.pluginDefinition.skillSet.find(skill => skill.slug === skillId)?.runtimeContractModules;
  if (!Array.isArray(modules) || !modules.length || new Set(modules).size !== modules.length) throw new Error("runtime_contracts_unavailable");
  return Object.freeze(modules.map(module => {
    const result = readRuntimeContract(module, { context });
    if (!result.ok || !result.content.trim()) throw new Error("runtime_contracts_unavailable");
    return Object.freeze({ module, content: result.content, sha256: createHash("sha256").update(result.content).digest("hex") });
  }));
}
