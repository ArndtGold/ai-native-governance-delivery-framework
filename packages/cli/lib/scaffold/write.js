import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pluginDefinition } from "../cli/runtime-context.js";

export function writeGeneratedFile(targetDir, relativePath, content, force, allowOverwrite = false) {
  const outputPath = join(targetDir, relativePath);
  mkdirSync(dirname(outputPath), { recursive: true });

  if (existsSync(outputPath) && !force && !allowOverwrite) {
    throw new Error(`Refusing to overwrite existing file: ${relativePath}. Re-run with --force if you want to replace it.`);
  }

  writeFileSync(outputPath, content, "utf8");
}

export function removeOwnedLegacyOpenCodeAgents(targetDir) {
  const agentsDir = join(targetDir, ".opencode", "agents");
  if (!existsSync(agentsDir)) return [];

  const removed = [];
  for (const skill of pluginDefinition.skillSet) {
    const skillName = `${pluginDefinition.opencode.skillPrefix}${skill.slug}`;
    const relativePath = join(".opencode", "agents", `${skillName}.md`);
    const agentPath = join(targetDir, relativePath);
    if (!existsSync(agentPath)) continue;

    const content = readFileSync(agentPath, "utf8");
    const ownedHeader = `---\ndescription: ${skill.useFor}\nmode: subagent\n---`;
    if (!content.startsWith(ownedHeader) || !content.includes(`# ${skill.slug}`)) continue;

    rmSync(agentPath);
    removed.push(relativePath);
  }

  if (readdirSync(agentsDir).length === 0) rmSync(agentsDir, { recursive: true });
  return removed;
}

export function assertGeneratedWritePlan(targetDir, files, force) {
  const blocked = files.find((file) => existsSync(join(targetDir, file.path)) && !force && !file.allowOverwrite);
  if (blocked) {
    throw new Error(`Refusing to overwrite existing file: ${blocked.path}. Re-run with --force if you want to replace it.`);
  }
}

