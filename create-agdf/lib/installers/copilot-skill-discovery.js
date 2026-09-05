import { basename, dirname, isAbsolute } from "node:path";
import { digestNormalizedPluginSource } from "../runtime/plugin-provenance.js";

export function verifyCopilotSkillDiscovery(output, { definition, sourceDigest }) {
  let skills;
  try { skills = JSON.parse(output); } catch { throw new Error("Copilot skill discovery returned invalid JSON."); }
  if (!Array.isArray(skills)) throw new Error("Copilot skill discovery did not return a skill list.");
  const expected = definition.skillSet.map(({ slug }) => `${definition.copilot.skillPrefix}${slug}`);
  const roots = new Set();
  for (const name of expected) {
    const matches = skills.filter((skill) => skill?.name === name);
    if (matches.length !== 1 || matches[0].source !== "plugin" || matches[0].enabled !== true) {
      throw new Error(`Copilot plugin skill is missing, disabled or shadowed: ${name}`);
    }
    const path = matches[0].path;
    if (typeof path !== "string" || !isAbsolute(path) || basename(path) !== name || basename(dirname(path)) !== "copilot-skills") {
      throw new Error(`Copilot skill has an unexpected installed path: ${name}`);
    }
    roots.add(dirname(dirname(path)));
  }
  if (roots.size !== 1) throw new Error("Copilot skills resolve to different plugin installations.");
  const [pluginRoot] = roots;
  if (digestNormalizedPluginSource(pluginRoot, definition.version) !== sourceDigest) {
    throw new Error("Copilot discovered a stale or modified AGDF plugin payload.");
  }
  return { pluginRoot, count: expected.length, names: expected };
}
