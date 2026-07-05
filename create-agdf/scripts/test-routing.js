import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = new URL("..", import.meta.url);
const repoRoot = new URL("..", packageRoot);
const binPath = fileURLToPath(new URL("./bin/create-agdf.js", packageRoot));
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

const tempDir = mkdtempSync(join(tmpdir(), "agdf-routing-test-"));

try {
  execFileSync(process.execPath, [binPath, "both", "--dir", tempDir], { stdio: "pipe" });

  const pluginRouterPath = join(tempDir, "plugins", "agdf", "meta", "agdf-agent-router.md");
  const copilotAgentsPath = join(tempDir, "AGENTS.md");

  assertFile(pluginRouterPath, "Plugin router");
  assertFile(copilotAgentsPath, "Copilot AGENTS.md");

  const pluginRouter = readFileSync(pluginRouterPath, "utf8");
  const copilotAgents = readFileSync(copilotAgentsPath, "utf8");

  for (const skill of pluginDefinition.skillSet) {
    const pluginName = skillName("codex", skill.slug);
    const copilotName = skillName("copilot", skill.slug);

    assertIncludes(pluginRouter, `| \`${pluginName}\` | ${skill.useFor} | ${skill.boundary} |`, "Plugin router");
    assertExcludes(pluginRouter, `\`${copilotName}\``, "Plugin router");

    assertIncludes(copilotAgents, `| \`${copilotName}\` | ${skill.useFor} | ${skill.boundary} |`, "Copilot AGENTS.md");
    if (pluginName !== copilotName) {
      assertExcludes(copilotAgents, `| \`${pluginName}\` | ${skill.useFor} | ${skill.boundary} |`, "Copilot AGENTS.md");
    }
  }

  console.log(`AGDF routing render test passed: ${tempDir}`);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
