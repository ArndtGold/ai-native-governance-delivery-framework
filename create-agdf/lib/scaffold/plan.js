import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { generatedRoot, languageConfigContent, pluginDefinition } from "../cli/runtime-context.js";

export const agdfFragmentPath = "AGENTS.agdf.md";
export const openCodeConfigFragmentPath = "opencode.agdf.json";
const codexSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.codex.skillPrefix}${skill.slug}`);
const copilotSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.copilot.skillPrefix}${skill.slug}`);
const openCodeSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.opencode.skillPrefix}${skill.slug}`);
const globalOpenCodeSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.opencode.globalSkillPrefix}${skill.slug}`);
const contractModules = [
  "gate-transition.md",
  "interaction.md",
  "modes.md",
  "quality.md",
  "context-graph.md",
  "control-scaffold.md",
  "closeout.md",
];
const codexPluginFiles = [
  join(".agents", "plugins", "marketplace.json"),
  join("plugins", "agdf", ".codex-plugin", "plugin.json"),
  join("plugins", "agdf", "control", "README.md"),
  join("plugins", "agdf", "control", "templates", "AGDF_RUN.md"),
  join("plugins", "agdf", "control", "templates", "RUN_STATE.md"),
  join("plugins", "agdf", "control", "templates", "MASTER_BACKLOG.md"),
  join("plugins", "agdf", "control", "templates", "SOT_REGISTRY.md"),
  join("plugins", "agdf", "control", "templates", "CONTEXT_GRAPH.md"),
  join("plugins", "agdf", "control", "templates", "AGENT_QUALITY_CONTRACTS.json"),
  join("plugins", "agdf", "control", "templates", "artefacts", "UR.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "VERIFIED_CHANGE.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "PRD.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "SD.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "TP.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "OR.md"),
  join("plugins", "agdf", "hooks", "hooks.json"),
  join("plugins", "agdf", "hooks", "session-start.sh"),
  join("plugins", "agdf", "meta", "agdf-agent-router.md"),
  join("plugins", "agdf", "meta", "agdf-constitution.md"),
  join("plugins", "agdf", "meta", "agdf-plugin.definition.json"),
  join("plugins", "agdf", "meta", "agdf-runtime-contract.md"),
  join("plugins", "agdf", "meta", "agdf-tenets.md"),
  ...contractModules.map((moduleName) => join("plugins", "agdf", "meta", "contracts", moduleName)),
  ...codexSkillNames.map((skillName) => join("plugins", "agdf", "skills", skillName, "SKILL.md")),
];
const controlFiles = [
  join(".agdf", "control", "README.md"),
  join(".agdf", "control", "templates", "AGDF_RUN.md"),
  join(".agdf", "control", "templates", "RUN_STATE.md"),
  join(".agdf", "control", "templates", "MASTER_BACKLOG.md"),
  join(".agdf", "control", "templates", "SOT_REGISTRY.md"),
  join(".agdf", "control", "templates", "CONTEXT_GRAPH.md"),
  join(".agdf", "control", "templates", "AGENT_QUALITY_CONTRACTS.json"),
  join(".agdf", "control", "templates", "artefacts", "UR.md"),
  join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join(".agdf", "control", "templates", "artefacts", "VERIFIED_CHANGE.md"),
  join(".agdf", "control", "templates", "artefacts", "PRD.md"),
  join(".agdf", "control", "templates", "artefacts", "SD.md"),
  join(".agdf", "control", "templates", "artefacts", "TP.md"),
  join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join(".agdf", "control", "templates", "artefacts", "OR.md"),
];
const liveControlFiles = [
  {
    path: join(".agdf", "control", "AGDF_RUN.md"),
    source: join(".agdf", "control", "templates", "AGDF_RUN.md"),
  },
  {
    path: join(".agdf", "control", "MASTER_BACKLOG.md"),
    source: join(".agdf", "control", "templates", "MASTER_BACKLOG.md"),
  },
  {
    path: join(".agdf", "control", "SOT_REGISTRY.md"),
    source: join(".agdf", "control", "templates", "SOT_REGISTRY.md"),
  },
  {
    path: join(".agdf", "control", "CONTEXT_GRAPH.md"),
    source: join(".agdf", "control", "templates", "CONTEXT_GRAPH.md"),
  },
  {
    path: join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json"),
    source: join(".agdf", "control", "templates", "AGENT_QUALITY_CONTRACTS.json"),
  },
];
const artefactTemplateFiles = [
  join(".agdf", "control", "templates", "artefacts", "UR.md"),
  join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
  join(".agdf", "control", "templates", "artefacts", "VERIFIED_CHANGE.md"),
  join(".agdf", "control", "templates", "artefacts", "PRD.md"),
  join(".agdf", "control", "templates", "artefacts", "SD.md"),
  join(".agdf", "control", "templates", "artefacts", "TP.md"),
  join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join(".agdf", "control", "templates", "artefacts", "OR.md"),
];
export const doctorRequiredFiles = [
  join(".agdf", "control", "AGDF_RUN.md"),
  join(".agdf", "control", "MASTER_BACKLOG.md"),
  join(".agdf", "control", "SOT_REGISTRY.md"),
  join(".agdf", "control", "CONTEXT_GRAPH.md"),
  join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json"),
];
const copilotInstructionFiles = [
  join(".github", "copilot-instructions.md"),
  join(".github", "instructions", "agdf-governance.instructions.md"),
];
const copilotSkillFiles = [
  join(".github", "skills", "README.md"),
  join(".github", "skills", pluginDefinition.copilot.runtimeContractFileName),
  ...contractModules.map((moduleName) => join(".github", "skills", "contracts", moduleName)),
  ...copilotSkillNames.map((skillName) => join(".github", "skills", skillName, "SKILL.md")),
];
const openCodeFiles = [
  join(".opencode", pluginDefinition.opencode.instructionsFileName),
  join(".opencode", "README.md"),
  join(".opencode", pluginDefinition.opencode.runtimeContractFileName),
  ...contractModules.map((moduleName) => join(".opencode", "contracts", moduleName)),
  ...openCodeSkillNames.map((skillName) => join(".opencode", "skills", skillName, "SKILL.md")),
];

function loadAsset(relativePath) {
  return readFileSync(join(generatedRoot, relativePath), "utf8");
}

function isAgdfOwnedAgentsFile(content) {
  return content.includes("## Surface Convention")
    && content.includes("GitHub Copilot repository skills do not have a plugin namespace")
    && content.includes("AGDF is agent-native first and CLI-verifiable by design");
}

function addCopilotAgentsFile(files, targetDir, force) {
  const agentsPath = join(targetDir, "AGENTS.md");
  if (!existsSync(agentsPath) || force) {
    files.push({
      path: "AGENTS.md",
      content: loadAsset("AGENTS.md"),
    });
    return;
  }

  const existingAgents = readFileSync(agentsPath, "utf8");
  if (isAgdfOwnedAgentsFile(existingAgents)) {
    files.push({
      path: "AGENTS.md",
      content: loadAsset("AGENTS.md"),
      allowOverwrite: true,
      action: "refreshed",
    });
    return;
  }

  files.push({
    path: agdfFragmentPath,
    content: loadAsset("AGENTS.md"),
    allowOverwrite: true,
    action: "refreshed",
    preserved: "AGENTS.md",
  });
}

function shouldWriteLanguageConfig(target, targetDir, force) {
  if (force) return true;
  if ((target === "copilot" || target === "both") && existsSync(join(targetDir, ".agdf", "control", "config.json"))) return false;
  return true;
}

function addLanguageConfig(files, languagePreference) {
  files.push({
    path: join(".agdf", "control", "config.json"),
    content: languageConfigContent(languagePreference),
  });
}

export function generatedFilesForTarget(target, targetDir, force, languagePreference) {
  const files = [];

  if (target === "config") {
    files.push({
      path: join(".agdf", "control", "config.json"),
      content: languageConfigContent(languagePreference),
      allowOverwrite: true,
    });
    return files;
  }

  if (target === "init") {
    addLanguageConfig(files, languagePreference);
    files.push({
      path: join(".agdf", "control", "README.md"),
      content: loadAsset(join(".agdf", "control", "README.md")),
    });

    for (const controlPath of liveControlFiles) {
      files.push({
        path: controlPath.path,
        content: loadAsset(controlPath.source),
      });
    }

    for (const templatePath of artefactTemplateFiles) {
      files.push({
        path: templatePath,
        content: loadAsset(templatePath),
      });
    }

    return files;
  }

  if (target === "codex-repo" || target === "both") {
    if (shouldWriteLanguageConfig(target, targetDir, force)) addLanguageConfig(files, languagePreference);
    for (const codexPath of codexPluginFiles) {
      files.push({
        path: codexPath,
        content: loadAsset(codexPath),
      });
    }
  }

  if (target === "copilot" || target === "both") {
    if (target !== "both" && shouldWriteLanguageConfig(target, targetDir, force)) addLanguageConfig(files, languagePreference);
    addCopilotAgentsFile(files, targetDir, force);

    for (const controlPath of controlFiles) {
      files.push({
        path: controlPath,
        content: loadAsset(controlPath),
        allowOverwrite: true,
        action: "refreshed",
      });
    }

    for (const instructionPath of copilotInstructionFiles) {
      files.push({
        path: instructionPath,
        content: loadAsset(instructionPath),
        allowOverwrite: true,
        action: "refreshed",
      });
    }

    for (const skillPath of copilotSkillFiles) {
      files.push({
        path: skillPath,
        content: loadAsset(skillPath),
        allowOverwrite: true,
        action: "refreshed",
      });
    }
  }

  if (target === "opencode-repo") {
    addLanguageConfig(files, languagePreference);
    const openCodeConfigTargetPath = existsSync(join(targetDir, "opencode.json")) && !force ? openCodeConfigFragmentPath : "opencode.json";
    files.push({
      path: openCodeConfigTargetPath,
      content: loadAsset("opencode.json"),
    });

    for (const openCodePath of openCodeFiles) {
      files.push({
        path: openCodePath,
        content: loadAsset(openCodePath),
      });
    }

    for (const controlPath of controlFiles) {
      files.push({
        path: controlPath,
        content: loadAsset(controlPath),
      });
    }
  }

  return files;
}

