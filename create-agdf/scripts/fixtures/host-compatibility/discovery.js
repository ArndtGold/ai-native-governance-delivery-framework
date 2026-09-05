// Synthetic host observations. These inspect fixture files, never a real host session.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginDefinition } from "../../../lib/cli/runtime-context.js";
import { digestNormalizedPluginSource } from "../../../lib/runtime/plugin-provenance.js";

export function observePlugin(root, surface) {
  const skillsRoot = surface === "copilot" ? "copilot-skills" : "skills";
  const skills = pluginDefinition.skillSet.map(({ slug }) => {
    const name = surface === "copilot" ? `agdf-${slug}` : slug;
    const path = join(root, skillsRoot, name, "SKILL.md");
    return { name: slug, enabled: existsSync(path), content: existsSync(path) ? readFileSync(path, "utf8") : null };
  });
  return { skills, digest: existsSync(join(root, "meta/agdf-plugin.definition.json"))
    ? digestNormalizedPluginSource(root, pluginDefinition.version) : null };
}

export const expectedSkills = pluginDefinition.skillSet.map(({ slug }) => slug);
