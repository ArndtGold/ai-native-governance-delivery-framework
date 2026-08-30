import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = new URL("..", import.meta.url);
const repoRoot = new URL("..", packageRoot);
const generatedPluginRoot = fileURLToPath(new URL("./generated/plugins/agdf/", packageRoot));
const generatedCopilotPluginRoot = fileURLToPath(new URL("./generated/plugins/copilot/agdf/", packageRoot));
const pluginDefinitionPath = fileURLToPath(new URL("./plugin/meta/agdf-plugin.definition.json", repoRoot));
const pluginDefinition = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));

function skillName(surface, slug) {
  return `${pluginDefinition[surface].skillPrefix}${slug}`;
}

function assertIncludes(content, expected, label) {
  if (!content.includes(expected)) {
    throw new Error(`${label} must include ${expected}`);
  }
}

function assertExcludes(content, forbidden, label) {
  if (content.includes(forbidden)) {
    throw new Error(`${label} must not include ${forbidden}`);
  }
}

function assertFile(path, label) {
  if (!existsSync(path)) {
    throw new Error(`${label} missing: ${path}`);
  }
}

{
  const pluginRouterPath = join(generatedPluginRoot, "meta", "agdf-agent-router.md");
  const copilotSkillsRoot = join(generatedCopilotPluginRoot, pluginDefinition.copilot.skills);

  assertFile(pluginRouterPath, "Plugin router");
  assertFile(join(copilotSkillsRoot, "agdf-gate-check", "SKILL.md"), "Copilot plugin gate-check skill");

  const pluginRouter = readFileSync(pluginRouterPath, "utf8");

  for (const skill of pluginDefinition.skillSet) {
    const pluginName = skillName("codex", skill.slug);
    const copilotName = skillName("copilot", skill.slug);

    assertIncludes(pluginRouter, `| \`${pluginName}\` | ${skill.useFor} | ${skill.boundary} |`, "Plugin router");
    assertExcludes(pluginRouter, `\`${copilotName}\``, "Plugin router");

    const copilotSkillPath = join(copilotSkillsRoot, copilotName, "SKILL.md");
    assertFile(copilotSkillPath, `Copilot plugin skill ${copilotName}`);
    const copilotSkill = readFileSync(copilotSkillPath, "utf8");
    assertIncludes(copilotSkill, `name: ${copilotName}`, `Copilot plugin skill ${copilotName}`);
    if (pluginName !== copilotName) assertExcludes(copilotSkill, `name: ${pluginName}`, `Copilot plugin skill ${copilotName}`);
  }

  console.log("AGDF routing render test passed for plugin-only Copilot skills");
}
