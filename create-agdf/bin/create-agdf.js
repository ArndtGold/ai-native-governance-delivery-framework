#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const generatedRoot = join(packageRoot, "generated");
const pluginDefinitionPath = join(generatedRoot, "plugins", "agdf", "meta", "agdf-plugin.definition.json");
const pluginDefinition = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));
const pluginInstallCommand = "claude plugin add arndtgold/ai-native-governance-delivery-framework";
const allowedTargets = new Set(["codex", "copilot", "opencode", "both", "init", "config", "doctor", "gate-check", "delivery-map"]);
const agdfFragmentPath = "AGENTS.agdf.md";
const openCodeConfigFragmentPath = "opencode.agdf.json";
const userGateOrder = ["UR", "PRD", "SD", "TP", "QA", "UAT"];
const durableGateArtefacts = new Set(["UR", "PRD", "SD", "TP", "QA"]);
const internalStepArtefacts = new Set(["Brownfield Review"]);
const deliveryRelationships = [
  { from: "UR", relationship: "approved_by", to: "Approval: UR", requiredBy: "UR" },
  { from: "PRD", relationship: "derived_from", to: "UR", requiredBy: "PRD" },
  { from: "SD", relationship: "derived_from", to: "PRD", requiredBy: "SD" },
  { from: "TP", relationship: "derived_from", to: "SD", requiredBy: "TP" },
  { from: "QA_REPORT", relationship: "tests", to: "TP", requiredBy: "QA" },
];
const nextSkillByGate = {
  UR: "gate-check",
  "Brownfield Review": "brownfield-analysis",
  "Mode/Slice Decision": "gate-check",
  "Quick Task Execution": "none",
  PRD: "gate-check",
  SD: "gate-check",
  TP: "gate-check",
  "Brownfield Analysis": "brownfield-analysis",
  "CD+Tests": "none",
  CR: "code-review",
  QA: "qa-gate",
  UAT: "delivery-closeout",
  OR: "release-or",
};
const gateProgressOrder = [
  "UR",
  "Brownfield Review",
  "Mode/Slice Decision",
  "Quick Task Execution",
  "PRD",
  "SD",
  "TP",
  "Brownfield Analysis",
  "CD+Tests",
  "CR",
  "QA",
  "UAT",
  "OR",
];
const codexSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.codex.skillPrefix}${skill.slug}`);
const copilotSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.copilot.skillPrefix}${skill.slug}`);
const openCodeSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.opencode.skillPrefix}${skill.slug}`);
const codexPluginFiles = [
  join(".agents", "plugins", "marketplace.json"),
  join("plugins", "agdf", ".codex-plugin", "plugin.json"),
  join("plugins", "agdf", "control", "README.md"),
  join("plugins", "agdf", "control", "templates", "AGDF_RUN.md"),
  join("plugins", "agdf", "control", "templates", "MASTER_BACKLOG.md"),
  join("plugins", "agdf", "control", "templates", "SOT_REGISTRY.md"),
  join("plugins", "agdf", "control", "templates", "CONTEXT_GRAPH.md"),
  join("plugins", "agdf", "control", "templates", "AGENT_QUALITY_CONTRACTS.json"),
  join("plugins", "agdf", "control", "templates", "artefacts", "UR.md"),
  join("plugins", "agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
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
  ...codexSkillNames.map((skillName) => join("plugins", "agdf", "skills", skillName, "SKILL.md")),
];
const controlFiles = [
  join(".agdf", "control", "README.md"),
  join(".agdf", "control", "templates", "AGDF_RUN.md"),
  join(".agdf", "control", "templates", "MASTER_BACKLOG.md"),
  join(".agdf", "control", "templates", "SOT_REGISTRY.md"),
  join(".agdf", "control", "templates", "CONTEXT_GRAPH.md"),
  join(".agdf", "control", "templates", "AGENT_QUALITY_CONTRACTS.json"),
  join(".agdf", "control", "templates", "artefacts", "UR.md"),
  join(".agdf", "control", "templates", "artefacts", "BROWNFIELD_REVIEW.md"),
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
  join(".agdf", "control", "templates", "artefacts", "PRD.md"),
  join(".agdf", "control", "templates", "artefacts", "SD.md"),
  join(".agdf", "control", "templates", "artefacts", "TP.md"),
  join(".agdf", "control", "templates", "artefacts", "QA_REPORT.md"),
  join(".agdf", "control", "templates", "artefacts", "OR.md"),
];
const doctorRequiredFiles = [
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
  ...copilotSkillNames.map((skillName) => join(".github", "skills", skillName, "SKILL.md")),
];
const openCodeFiles = [
  join(".opencode", pluginDefinition.opencode.instructionsFileName),
  join(".opencode", "README.md"),
  join(".opencode", pluginDefinition.opencode.runtimeContractFileName),
  ...openCodeSkillNames.map((skillName) => join(".opencode", "agents", `${skillName}.md`)),
];

function printUsage() {
  console.log(`create-agdf

Preferred AGDF CLI:
  npx --yes @agdf/cli@latest codex
  npx --yes @agdf/cli@latest opencode
  npx --yes @agdf/cli@latest init
  npx --yes @agdf/cli@latest doctor
  npx --yes @agdf/cli@latest gate-check --json

Scaffold-compatible npm create usage:
  npm create agdf@latest -- codex
  npm create agdf@latest -- copilot
  npm create agdf@latest -- opencode
  npm create agdf@latest -- both
  npm create agdf@latest -- init
  npm create agdf@latest -- config --language de
  npm create agdf@latest -- doctor
  npm create agdf@latest -- gate-check
  npm create agdf@latest -- delivery-map

Backward-compatible create-agdf usage:
  npx --yes create-agdf@latest doctor --json
  npx --yes create-agdf@latest gate-check --json

Options:
  --dir <path>   Write files into a specific directory
  --force        Overwrite existing generated files
  --language <de|en>
                 Set AGDF chat and artefact language. Defaults to detected system locale.
  --lang <de|en> Alias for --language
  --json         Print doctor, gate-check or delivery-map output as JSON
  --help         Show this help
`);
}

function normalizeLanguage(value) {
  const normalized = String(value ?? "").trim().toLowerCase().replace("_", "-");
  if (!normalized) return "";
  if (normalized.startsWith("de")) return "de";
  if (normalized.startsWith("en")) return "en";
  return "";
}

function detectSystemLocale() {
  const envLocale = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || process.env.LANGUAGE || "";
  if (envLocale) return envLocale;
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || "";
  } catch {
    return "";
  }
}

function resolveLanguagePreference(explicitLanguage) {
  const explicit = normalizeLanguage(explicitLanguage);
  if (explicit) {
    return {
      artifact_language: explicit,
      chat_language: explicit,
      runtime_language: "en",
      source: "parameter",
      detected_locale: detectSystemLocale() || "unknown",
    };
  }

  const detectedLocale = detectSystemLocale();
  const detected = normalizeLanguage(detectedLocale) || "en";
  return {
    artifact_language: detected,
    chat_language: detected,
    runtime_language: "en",
    source: detectedLocale ? "system_locale" : "default",
    detected_locale: detectedLocale || "unknown",
  };
}

function languageConfigContent(languagePreference) {
  return `${JSON.stringify({
    artifact_language: languagePreference.artifact_language,
    chat_language: languagePreference.chat_language,
    runtime_language: languagePreference.runtime_language,
    source: languagePreference.source,
    detected_locale: languagePreference.detected_locale,
  }, null, 2)}\n`;
}

function parseArgs(argv) {
  const args = [...argv];
  let target;
  let dir = ".";
  let force = false;
  let json = false;
  let language;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg) continue;

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--force") {
      force = true;
      continue;
    }

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--language" || arg === "--lang") {
      const next = args[i + 1];
      if (!next) {
        console.error(`Missing value for ${arg}`);
        process.exit(1);
      }
      const normalized = normalizeLanguage(next);
      if (!normalized) {
        console.error("Unsupported language. Use --language de or --language en.");
        process.exit(1);
      }
      language = normalized;
      i += 1;
      continue;
    }

    if (arg === "--dir") {
      const next = args[i + 1];
      if (!next) {
        console.error("Missing value for --dir");
        process.exit(1);
      }
      dir = next;
      i += 1;
      continue;
    }

    if (arg === "--target" || arg === "-t") {
      const next = args[i + 1];
      if (!next) {
        console.error("Missing value for --target");
        process.exit(1);
      }
      target = next;
      i += 1;
      continue;
    }

    if (!arg.startsWith("-") && !target) {
      target = arg;
      continue;
    }

    console.error(`Unknown argument: ${arg}`);
    process.exit(1);
  }

  if (!target || !allowedTargets.has(target)) {
    console.error("Please choose one target: codex, copilot, opencode, both, init, config, doctor, gate-check or delivery-map.");
    printUsage();
    process.exit(1);
  }

  return {
    target,
    dir: resolve(process.cwd(), dir),
    force,
    json,
    language: resolveLanguagePreference(language),
  };
}

function loadAsset(relativePath) {
  return readFileSync(join(generatedRoot, relativePath), "utf8");
}

function writeGeneratedFile(targetDir, relativePath, content, force, allowOverwrite = false) {
  const outputPath = join(targetDir, relativePath);
  mkdirSync(dirname(outputPath), { recursive: true });

  if (existsSync(outputPath) && !force && !allowOverwrite) {
    throw new Error(`Refusing to overwrite existing file: ${relativePath}. Re-run with --force if you want to replace it.`);
  }

  writeFileSync(outputPath, content, "utf8");
}

function addLanguageConfig(files, languagePreference) {
  files.push({
    path: join(".agdf", "control", "config.json"),
    content: languageConfigContent(languagePreference),
  });
}

function generatedFilesForTarget(target, targetDir, force, languagePreference) {
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

  if (target === "codex" || target === "both") {
    addLanguageConfig(files, languagePreference);
    for (const codexPath of codexPluginFiles) {
      files.push({
        path: codexPath,
        content: loadAsset(codexPath),
      });
    }
  }

  if (target === "copilot" || target === "both") {
    if (target !== "both") addLanguageConfig(files, languagePreference);
    const agentsTargetPath = existsSync(join(targetDir, "AGENTS.md")) && !force ? agdfFragmentPath : "AGENTS.md";
    files.push({
      path: agentsTargetPath,
      content: loadAsset("AGENTS.md"),
    });

    for (const controlPath of controlFiles) {
      files.push({
        path: controlPath,
        content: loadAsset(controlPath),
      });
    }

    for (const instructionPath of copilotInstructionFiles) {
      files.push({
        path: instructionPath,
        content: loadAsset(instructionPath),
      });
    }

    for (const skillPath of copilotSkillFiles) {
      files.push({
        path: skillPath,
        content: loadAsset(skillPath),
      });
    }
  }

  if (target === "opencode") {
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

function printNextSteps(target, destination, files, wroteAgentsFragment, wroteOpenCodeConfigFragment) {
  console.log("");
  console.log(`AGDF bootstrap complete in ${destination}`);
  console.log("");
  console.log("Generated:");
  for (const file of files) {
    console.log(`- ${file.path}`);
  }

  console.log("");
  console.log("Next steps:");
  const languageConfig = files.find((file) => file.path === join(".agdf", "control", "config.json"));
  if (languageConfig) {
    const language = JSON.parse(languageConfig.content);
    console.log(`- AGDF language preference: artefacts=${language.artifact_language}, chat=${language.chat_language}, runtime=${language.runtime_language}.`);
  }
  if (target === "init") {
    console.log("- Fill .agdf/control/AGDF_RUN.md with the current gate, evidence and next allowed action.");
    console.log("- Run npx --yes @agdf/cli@latest doctor to check the control state before the next agent run.");
    console.log("- Commit the live control files once they represent the repository's current delivery state.");
    return;
  }
  if (target === "config") {
    console.log("- Restart or start a new agent session so the AGDF SessionStart hook reads the updated project language config.");
    console.log("- Run npx --yes @agdf/cli@latest doctor when this repository also uses durable AGDF control state.");
    return;
  }
  if (wroteAgentsFragment) {
    console.log(`- Existing AGENTS.md detected. Merge ${agdfFragmentPath} into your current AGENTS.md before using Copilot with AGDF.`);
  }
  if (target === "codex" || target === "both") {
    console.log("- Restart Codex in this repository, open /plugins, select This repository and install agdf.");
    console.log("- Start a new Codex thread in this repository and ask: Run an AGDF gate check for this request.");
  }
  if (target === "both") {
    console.log(`- Optional global Claude Code install: ${pluginInstallCommand}`);
  }
  if (target === "opencode") {
    if (wroteOpenCodeConfigFragment) {
      console.log(`- Existing opencode.json detected. Merge ${openCodeConfigFragmentPath} into your current opencode.json so OpenCode loads .opencode/AGDF.md.`);
    }
    console.log(`- OpenCode will install the ${pluginDefinition.opencode.npmPackage} npm plugin from opencode.json at startup.`);
    console.log("- Start OpenCode in this repository; it will load opencode.json, .opencode/AGDF.md and the AGDF subagents.");
    console.log("- Use @agdf-gate-check for new build/change intent or unclear approval before later artefacts or implementation.");
    console.log("- Run npx --yes @agdf/cli@latest init when the repository needs live AGDF control files.");
  }
  if (target === "copilot" || target === "both") {
    console.log("- In GitHub Copilot CLI, run /instructions after the AGENTS.md step is complete to confirm that AGDF instructions and the repository skills are visible.");
    console.log("- Run npx --yes @agdf/cli@latest init when the repository needs live AGDF control files.");
  }
  console.log("- Commit the generated files so the repository becomes the source of truth.");
}

function readTargetFile(targetDir, relativePath) {
  return readFileSync(join(targetDir, relativePath), "utf8");
}

function addFinding(findings, severity, code, message, path, nextStep) {
  findings.push({
    severity,
    code,
    message,
    path,
    next_step: nextStep,
  });
}

function nonEmptyTableRows(content) {
  return content
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !line.includes("---"))
    .map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.some((cell) => cell && !cell.startsWith("`")));
}

function tableRows(content) {
  return content
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !line.includes("---"))
    .map((line) => {
      const cells = line.split("|").map((cell) => cell.trim());
      if (cells[0] === "") cells.shift();
      if (cells.at(-1) === "") cells.pop();
      return cells;
    });
}

const compactBacklogHeaders = ["priority", "key", "work item", "status", "artefacts", "current spec", "next step"];
const legacyBacklogHeaders = ["prio", "key", "title", "status", "ur", "brownfield review", "prd", "sd", "tp", "qa", "or", "current spec", "notes"];
const backlogStatusLabels = new Map([
  ["needs ur", "needs_ur"],
  ["awaiting brownfield review", "awaiting_brownfield_review"],
  ["awaiting prd", "awaiting_prd"],
  ["awaiting prd approval", "awaiting_prd_approval"],
  ["awaiting sd", "awaiting_sd"],
  ["awaiting sd approval", "awaiting_sd_approval"],
  ["awaiting tp", "awaiting_tp"],
  ["awaiting tp approval", "awaiting_tp_approval"],
  ["in progress", "in_progress"],
  ["blocked", "blocked"],
  ["awaiting qa", "awaiting_qa"],
  ["awaiting uat", "awaiting_uat"],
  ["completed", "completed"],
  ["superseded", "superseded"],
  ["abandoned", "abandoned"],
]);
const backlogArtefactLabels = new Map([
  ["ur", "ur"],
  ["brownfield", "brownfield_review"],
  ["prd", "prd"],
  ["sd", "sd"],
  ["tp", "tp"],
  ["qa", "qa"],
  ["or", "or"],
]);

function normalizeBacklogHeader(value) {
  return value.replace(/`/g, "").trim().toLowerCase();
}

function markdownLink(value) {
  const match = value.trim().match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  return match ? { label: match[1].trim(), target: match[2].trim() } : null;
}

function resolvedBacklogLinkTarget(target) {
  if (!target
    || target.startsWith("/")
    || target.includes("\\")
    || /^[a-z][a-z0-9+.-]*:/i.test(target)) {
    return null;
  }
  const resolved = posix.normalize(posix.join(".agdf/control", target));
  if (resolved === ".." || resolved.startsWith("../")) return null;
  return resolved;
}

function normalizedBacklogLinkTarget(value, findings, backlogPath, label) {
  const link = markdownLink(value);
  if (!link) return value.trim();
  const resolved = resolvedBacklogLinkTarget(link.target);
  if (!resolved) {
    if (findings) {
      addFinding(
        findings,
        "revise",
        "AGDF_BACKLOG_LINK_TARGET_INVALID",
        `Backlog ${label} link must be relative to MASTER_BACKLOG.md: ${link.target || "<empty>"}.`,
        backlogPath,
        "Use a document-relative artefact target such as artefacts/<key>/UR.md.",
      );
    }
    return link.target;
  }
  return resolved;
}

function normalizeBacklogStatus(value, findings, backlogPath) {
  const cleaned = cleanStatusCell(value ?? "");
  const lookup = cleaned.replaceAll("_", " ").toLowerCase();
  const normalized = backlogStatusLabels.get(lookup);
  if (normalized) return normalized;
  if (/^[a-z][a-z0-9_]*$/.test(cleaned)) return cleaned;
  if (findings && filled(cleaned)) {
    addFinding(
      findings,
      "revise",
      "AGDF_BACKLOG_STATUS_UNKNOWN",
      `MASTER_BACKLOG.md uses an unknown human status label: ${cleaned}.`,
      backlogPath,
      "Use a documented human status label or a supported legacy snake_case value.",
    );
  }
  return cleaned;
}

function emptyBacklogPointer() {
  return {
    prio: "",
    key: "",
    title: "",
    status: "",
    ur: "",
    brownfield_review: "",
    prd: "",
    sd: "",
    tp: "",
    qa: "",
    or: "",
    current_spec: "",
    notes: "",
  };
}

function parseCompactArtefacts(value, pointer, findings, backlogPath) {
  if (!filled(value)) return;
  const seen = new Set();
  for (const entry of value.split(/\s+·\s+/)) {
    const link = markdownLink(entry);
    if (!link) {
      if (findings) {
        addFinding(
          findings,
          "revise",
          "AGDF_BACKLOG_ARTEFACT_LINK_INVALID",
          `Compact Artefacts entry is not a Markdown link: ${entry}.`,
          backlogPath,
          "Use [UR](artefacts/<key>/UR.md) style links separated by a middle dot.",
        );
      }
      continue;
    }
    const field = backlogArtefactLabels.get(link.label.toLowerCase());
    if (!field) {
      if (findings) {
        addFinding(
          findings,
          "revise",
          "AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN",
          `Compact Artefacts uses an unknown label: ${link.label}.`,
          backlogPath,
          "Use UR, Brownfield, PRD, SD, TP, QA or OR.",
        );
      }
      continue;
    }
    if (seen.has(field)) {
      if (findings) {
        addFinding(
          findings,
          "revise",
          "AGDF_BACKLOG_ARTEFACT_LABEL_DUPLICATE",
          `Compact Artefacts repeats the ${link.label} link.`,
          backlogPath,
          "Keep exactly one link per artefact type.",
        );
      }
      continue;
    }
    seen.add(field);
    pointer[field] = normalizedBacklogLinkTarget(entry, findings, backlogPath, link.label);
  }
}

function parseBacklogSection(section, findings = null, backlogPath = ".agdf/control/MASTER_BACKLOG.md") {
  const rows = tableRows(section);
  if (rows.length === 0) return [];
  const headers = rows[0].map(normalizeBacklogHeader);
  const layout = headers.join("|") === compactBacklogHeaders.join("|")
    ? "compact"
    : headers.join("|") === legacyBacklogHeaders.join("|")
      ? "legacy"
      : "unknown";

  if (layout === "unknown") {
    if (findings) {
      addFinding(
        findings,
        "revise",
        "AGDF_BACKLOG_LAYOUT_UNKNOWN",
        `MASTER_BACKLOG.md uses an unsupported table layout: ${headers.join(", ")}.`,
        backlogPath,
        "Use the canonical compact layout or the supported legacy 13-column layout.",
      );
    }
    return [];
  }

  return rows.slice(1)
    .filter((cells) => cells.some((cell) => filled(cell)))
    .map((cells) => {
      const pointer = emptyBacklogPointer();
      if (layout === "legacy") {
        [
          pointer.prio,
          pointer.key,
          pointer.title,
          pointer.status,
          pointer.ur,
          pointer.brownfield_review,
          pointer.prd,
          pointer.sd,
          pointer.tp,
          pointer.qa,
          pointer.or,
          pointer.current_spec,
          pointer.notes,
        ] = cells.map((cell) => cell ?? "");
        pointer.status = normalizeBacklogStatus(pointer.status, findings, backlogPath);
        return pointer;
      }

      pointer.prio = cells[0] ?? "";
      pointer.key = cleanStatusCell(cells[1] ?? "");
      pointer.title = cells[2] ?? "";
      pointer.status = normalizeBacklogStatus(cells[3], findings, backlogPath);
      parseCompactArtefacts(cells[4] ?? "", pointer, findings, backlogPath);
      pointer.current_spec = normalizedBacklogLinkTarget(cells[5] ?? "", findings, backlogPath, "Current spec");
      pointer.notes = cells[6] ?? "";
      return pointer;
    });
}

function hasFilledTableRow(content, firstCellPattern) {
  return tableRows(content)
    .filter((cells) => firstCellPattern.test(cells[0] ?? ""))
    .some((cells) => cells.slice(1).some((cell) => cell && !cell.startsWith("`")));
}

function isPlaceholderValue(value) {
  return !value || (value.startsWith("`") && value.includes("|"));
}

function hasFilledEvidenceRow(content) {
  const evidenceSection = content.match(/## Evidence([\s\S]*?)(?:\n## |\n# |$)/)?.[1] ?? "";
  return tableRows(evidenceSection)
    .filter((cells) => cells[0] !== "Evidence")
    .some((cells) => {
      const [evidence, source, covers] = cells;
      return Boolean(evidence || source || covers);
    });
}

function markdownSection(content, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(`(?:^|\\n)## ${escaped}\\s*\\n([\\s\\S]*?)(?:\\n## |\\n# |$)`))?.[1] ?? "";
}

function filled(value) {
  return Boolean(value && !isPlaceholderValue(value) && value.trim() !== "");
}

function nonTemplateRows(section, headerCell) {
  return tableRows(section)
    .filter((cells) => cells[0] !== headerCell)
    .filter((cells) => cells.some((cell) => filled(cell)));
}

function parseQualityContracts(content) {
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed.contracts) || parsed.contracts.length === 0) {
    throw new Error("contracts must be a non-empty array");
  }
  for (const contract of parsed.contracts) {
    if (!contract.code || !contract.impact || !contract.required_evidence) {
      throw new Error(`contract ${contract.code ?? "<unknown>"} is missing code, impact or required_evidence`);
    }
  }
  return parsed;
}

function evaluateDoctor(targetDir) {
  const findings = [];
  const missing = doctorRequiredFiles.filter((relativePath) => !existsSync(join(targetDir, relativePath)));

  for (const relativePath of missing) {
    const templatePath = join(dirname(relativePath), "templates", relativePath.split("/").at(-1));
    const hasTemplate = existsSync(join(targetDir, templatePath));
    addFinding(
      findings,
      "block",
      "AGDF_CONTROL_FILE_MISSING",
      hasTemplate
        ? "Live control file is missing; only the template exists."
        : "Required live control file is missing.",
      relativePath,
      "Run npx --yes @agdf/cli@latest init only when the repository should own durable AGDF control state or deterministic setup is explicitly needed.",
    );
  }

  if (missing.length === 0) {
    const runPath = join(".agdf", "control", "AGDF_RUN.md");
    const run = readTargetFile(targetDir, runPath);
    const currentGateLine = run.match(/^- current_gate:[^\S\r\n]*(.*)$/m)?.[1]?.trim() ?? "";
    const nextActionLine = run.match(/^- next_allowed_action:[^\S\r\n]*(.*)$/m)?.[1]?.trim() ?? "";
    const hasEvidence = hasFilledEvidenceRow(run);

    if (isPlaceholderValue(currentGateLine)) {
      addFinding(
        findings,
        "revise",
        "AGDF_CURRENT_GATE_MISSING",
        "AGDF_RUN.md does not name the current gate.",
        runPath,
        "Set current_gate to the current delivery gate or none.",
      );
    }

    if (isPlaceholderValue(nextActionLine)) {
      addFinding(
        findings,
        "revise",
        "AGDF_NEXT_ALLOWED_ACTION_MISSING",
        "AGDF_RUN.md does not state the next allowed action.",
        runPath,
        "Fill the next allowed action before asking an agent to continue delivery work.",
      );
    }

    if (!hasEvidence) {
      addFinding(
        findings,
        "warn",
        "AGDF_EVIDENCE_EMPTY",
        "AGDF_RUN.md has no visible evidence row yet.",
        runPath,
        "Add at least one evidence row or explicitly document that no evidence exists yet.",
      );
    }

    const backlogPath = join(".agdf", "control", "MASTER_BACKLOG.md");
    const backlog = readTargetFile(targetDir, backlogPath);
    parseBacklogSection(markdownSection(backlog, "Active Backlog"), findings, backlogPath);
    parseBacklogSection(markdownSection(backlog, "Planned / Parking Lot"), findings, backlogPath);
    const completedRows = tableRows(markdownSection(backlog, "Completed / Superseded Pointers"))
      .slice(1)
      .filter((cells) => cells.some((cell) => filled(cell)));
    if (!hasFilledTableRow(backlog, /^P[0-9]/) && completedRows.length === 0) {
      addFinding(
        findings,
        "warn",
        "AGDF_BACKLOG_POINTER_EMPTY",
        "MASTER_BACKLOG.md does not contain an active or planned work pointer.",
        backlogPath,
        "Add the active item or document that no governed delivery item is active.",
      );
    }

    const sotPath = join(".agdf", "control", "SOT_REGISTRY.md");
    const sot = readTargetFile(targetDir, sotPath);
    if (!hasFilledTableRow(sot, /Product intent|Architecture|Runtime contracts|UX \/ user flows|Operations \/ release/)) {
      addFinding(
        findings,
        "warn",
        "AGDF_SOT_REGISTRY_EMPTY",
        "SOT_REGISTRY.md has no filled primary source-of-truth row.",
        sotPath,
        "Assign one primary source of truth for at least the domains relevant to the next run.",
      );
    }

    const activeDomains = new Map();
    for (const cells of nonEmptyTableRows(sot)) {
      const [domain, document, status] = cells;
      if (!domain || !document || status !== "active") continue;
      activeDomains.set(domain, (activeDomains.get(domain) ?? 0) + 1);
    }
    for (const [domain, count] of activeDomains.entries()) {
      if (count > 1) {
        addFinding(
          findings,
          "block",
          "AGDF_PARALLEL_SOT",
          `Domain has ${count} active source-of-truth rows: ${domain}.`,
          sotPath,
          "Keep exactly one active primary source of truth for this domain.",
        );
      }
    }

    const contextPath = join(".agdf", "control", "CONTEXT_GRAPH.md");
    const contextGraph = readTargetFile(targetDir, contextPath);
    if (contextGraph.includes("### CG-001 Example")) {
      addFinding(
        findings,
        "warn",
        "AGDF_CONTEXT_GRAPH_TEMPLATE_NODE",
        "CONTEXT_GRAPH.md still contains the example node.",
        contextPath,
        "Remove the example or replace it with an evidenced node that has an exit criterion.",
      );
    }

    const contractsPath = join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json");
    try {
      parseQualityContracts(readTargetFile(targetDir, contractsPath));
    } catch (error) {
      addFinding(
        findings,
        "block",
        "AGDF_QUALITY_CONTRACTS_INVALID",
        `AGENT_QUALITY_CONTRACTS.json is invalid: ${error.message}`,
        contractsPath,
        "Restore the generated contracts or fix the JSON contract schema.",
      );
    }

    const runState = readRunState(targetDir);
    for (const finding of analyzeDeliveryMap(runState).findings) {
      addFinding(findings, finding.severity, finding.code, finding.message, finding.path, finding.next_step);
    }
  }

  const severityRank = { block: 3, revise: 2, warn: 1 };
  const maxSeverity = findings.reduce((max, finding) => Math.max(max, severityRank[finding.severity] ?? 0), 0);
  const status = maxSeverity >= 3 ? "block" : maxSeverity === 2 ? "revise" : maxSeverity === 1 ? "warn" : "pass";

  return {
    schema_version: "1",
    status,
    checked_at: new Date().toISOString(),
    target_dir: targetDir,
    summary: {
      findings: findings.length,
      block: findings.filter((finding) => finding.severity === "block").length,
      revise: findings.filter((finding) => finding.severity === "revise").length,
      warn: findings.filter((finding) => finding.severity === "warn").length,
    },
    findings,
  };
}

function printDoctorReport(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`AGDF doctor: ${report.status}`);
  console.log(`Checked: ${report.target_dir}`);
  console.log(`Findings: ${report.summary.findings} (${report.summary.block} block, ${report.summary.revise} revise, ${report.summary.warn} warn)`);

  for (const finding of report.findings) {
    console.log("");
    console.log(`[${finding.severity}] ${finding.code}`);
    console.log(`Path: ${finding.path}`);
    console.log(finding.message);
    console.log(`Next step: ${finding.next_step}`);
  }
}

function extractField(content, field) {
  const pattern = new RegExp(`^- ${field}:[^\\S\\r\\n]*(.*)$`, "m");
  return content.match(pattern)?.[1]?.trim() ?? "";
}

function extractSectionField(section, field) {
  const pattern = new RegExp(`^- ${field}:[^\\S\\r\\n]*(.*)$`, "m");
  return section.match(pattern)?.[1]?.trim() ?? "";
}

function cleanStatusCell(value) {
  return value.replace(/^`|`$/g, "").trim();
}

function normalizeGateStatus(gate, status) {
  const normalized = cleanStatusCell(status ?? "");
  if (gate === "QA" && normalized === "passed") return "approved";
  return normalized;
}

function addApprovalRows(approvals, section) {
  for (const cells of tableRows(section)) {
    const [gate, status, evidence] = cells;
    if (!userGateOrder.includes(gate)) continue;
    approvals.set(gate, {
      status: normalizeGateStatus(gate, status),
      evidence: evidence ?? "",
    });
  }
}

function readRunState(targetDir) {
  const runPath = join(".agdf", "control", "AGDF_RUN.md");
  if (!existsSync(join(targetDir, runPath))) {
    return {
      path: runPath,
      content: "",
      current_gate: "",
      next_allowed_action: "",
      approvals: new Map(),
      artefacts: new Map(),
      evidence_refs: [],
      artefact_chain: [],
      mode_slice_decision: {},
      missing_evidence: [],
      risks: [],
      context_graph: {},
      quality_outlook: "",
      source_scope: {},
      memory: {},
    };
  }

  const content = readTargetFile(targetDir, runPath);
  const approvals = new Map();
  addApprovalRows(approvals, content.match(/## Approvals([\s\S]*?)(?:\n## |\n# |$)/)?.[1] ?? "");
  addApprovalRows(approvals, content.match(/## Gate Checklist([\s\S]*?)(?:\n## |\n# |$)/)?.[1] ?? "");

  const artefacts = new Map();
  const artefactsSection = markdownSection(content, "Artefacts");
  for (const cells of tableRows(artefactsSection)) {
    const [type, path, status, notes] = cells;
    if (!userGateOrder.includes(type) && !internalStepArtefacts.has(type)) continue;
    artefacts.set(type, {
      path: path ?? "",
      status: cleanStatusCell(status ?? ""),
      notes: notes ?? "",
    });
  }

  const artefactChain = nonTemplateRows(markdownSection(content, "Artefact Chain"), "From")
    .map((cells) => ({
      from: cells[0] ?? "",
      relationship: cleanStatusCell(cells[1] ?? ""),
      to: cleanStatusCell(cells[2] ?? ""),
      evidence: cells[3] ?? "",
    }));

  const evidence_refs = tableRows(markdownSection(content, "Evidence"))
    .filter((cells) => cells[0] !== "Evidence")
    .filter((cells) => filled(cells[0]) || filled(cells[1]) || filled(cells[2]))
    .map((cells) => ({
      evidence: cells[0] ?? "",
      source: cells[1] ?? "",
      covers: cells[2] ?? "",
      strength: cleanStatusCell(cells[3] ?? ""),
    }));

  const missingEvidence = tableRows(markdownSection(content, "Missing Evidence"))
    .filter((cells) => cells[0] !== "Missing evidence")
    .filter((cells) => filled(cells[0]))
    .map((cells) => ({
      missing_evidence: cells[0] ?? "",
      impact: cleanStatusCell(cells[1] ?? ""),
      required_next_step: cells[2] ?? "",
    }));

  const risks = tableRows(markdownSection(content, "Risks"))
    .filter((cells) => cells[0] !== "Risk")
    .filter((cells) => filled(cells[0]))
    .map((cells) => ({
      risk: cells[0] ?? "",
      impact: cleanStatusCell(cells[1] ?? ""),
      mitigation_or_owner: cells[2] ?? "",
    }));

  const contextGraph = {
    impact: cleanStatusCell(extractField(content, "context_graph_impact")),
    refs: extractField(content, "context_graph_refs"),
    required_action: cleanStatusCell(extractField(content, "context_graph_required_action")),
    gate_effect: cleanStatusCell(extractField(content, "context_graph_gate_effect")),
    evidence: extractField(content, "context_graph_evidence"),
  };

  const modeSliceSection = markdownSection(content, "Mode / Slice Decision");
  const modeSliceDecision = {
    decision: cleanStatusCell(extractSectionField(modeSliceSection, "decision")),
    required_next_gate: cleanStatusCell(extractSectionField(modeSliceSection, "required_next_gate")),
    scope_reason: extractSectionField(modeSliceSection, "scope_reason"),
    evidence: extractSectionField(modeSliceSection, "evidence"),
  };

  const sourceScopeSection = markdownSection(content, "Source And Scope State");
  const sourceScope = {
    normative_instruction_source: extractSectionField(sourceScopeSection, "normative_instruction_source"),
    multi_scope_state: cleanStatusCell(extractSectionField(sourceScopeSection, "multi_scope_state")),
    active_scope_evidence: extractSectionField(sourceScopeSection, "active_scope_evidence"),
    competing_scope_lines: extractSectionField(sourceScopeSection, "competing_scope_lines"),
    branch_workspace_evidence: extractSectionField(sourceScopeSection, "branch_workspace_evidence"),
    branch_workspace_scope_effect: cleanStatusCell(extractSectionField(sourceScopeSection, "branch_workspace_scope_effect")),
  };

  const memorySection = markdownSection(content, "Knowledge Persistence Decision");
  const memory = {
    target: cleanStatusCell(extractSectionField(memorySection, "memory_target")),
    reason: extractSectionField(memorySection, "memory_reason"),
    refs: extractSectionField(memorySection, "memory_refs"),
  };

  return {
    path: runPath,
    content,
    current_gate: extractField(content, "current_gate"),
    next_allowed_action: extractField(content, "next_allowed_action"),
    approvals,
    artefacts,
    evidence_refs,
    artefact_chain: artefactChain,
    mode_slice_decision: modeSliceDecision,
    missing_evidence: missingEvidence,
    risks,
    context_graph: contextGraph,
    quality_outlook: extractField(content, "quality_outlook"),
    source_scope: sourceScope,
    memory,
  };
}

function firstUnapprovedGate(approvals) {
  for (const gate of userGateOrder) {
    const status = approvals.get(gate)?.status ?? "";
    if (status !== "approved" && status !== "not_applicable") return gate;
  }
  return "OR";
}

function normalizeCurrentGate(value, fallbackGate) {
  if (isPlaceholderValue(value)) return fallbackGate;
  const normalized = value.replace(/`/g, "").trim();
  return normalized || fallbackGate;
}

function gateApprovalStatus(runState, gate) {
  if (!userGateOrder.includes(gate)) return "not_applicable";
  return runState.approvals.get(gate)?.status ?? "";
}

function gateArtefactStatus(runState, gate) {
  if (!userGateOrder.includes(gate)) return { status: "not_applicable", path: "" };
  return runState.artefacts.get(gate) ?? { status: "", path: "" };
}

function isDurableGateArtefactSatisfied(runState, gate) {
  if (!durableGateArtefacts.has(gate)) return true;
  const artefact = gateArtefactStatus(runState, gate);
  if (!artefact.path || isPlaceholderValue(artefact.path)) return false;
  if (gate === "QA") return artefact.status === "pass" || artefact.status === "passed";
  return artefact.status === "approved";
}

function isInternalStepSatisfied(runState, step) {
  const artefact = runState.artefacts.get(step);
  if (!artefact) return false;
  return artefact.status === "done" || artefact.status === "not_applicable";
}

function modeSliceDecision(runState) {
  const decision = runState.mode_slice_decision?.decision ?? "";
  const scopeReason = runState.mode_slice_decision?.scope_reason ?? "";
  const evidence = runState.mode_slice_decision?.evidence ?? "";
  if (!decision || isPlaceholderValue(decision) || !filled(scopeReason) || !filled(evidence)) return "undecided";
  return decision;
}

function relationshipRequired(runState, requiredBy) {
  if (gateApprovalStatus(runState, requiredBy) === "not_applicable") return false;
  if (requiredBy === "QA") {
    return isGateSatisfied(runState, "QA");
  }

  return isGateSatisfied(runState, requiredBy);
}

function findRelationship(runState, expected) {
  return runState.artefact_chain.find((row) =>
    row.from === expected.from
    && row.relationship === expected.relationship
    && row.to === expected.to
  );
}

function severityFromImpact(value) {
  if (value === "block") return "block";
  if (value === "revise") return "revise";
  if (value === "warning" || value === "warn") return "warn";
  return null;
}

function analyzeDeliveryMap(runState) {
  const findings = [];
  const relationships = deliveryRelationships.map((expected) => {
    const row = findRelationship(runState, expected);
    const required = relationshipRequired(runState, expected.requiredBy);
    const evidence = row?.evidence ?? "";
    const status = !row ? "missing" : filled(evidence) ? "pass" : required ? "missing_evidence" : "template";

    if (required && status !== "pass") {
      findings.push({
        severity: "revise",
        code: status === "missing" ? "AGDF_DELIVERY_RELATIONSHIP_MISSING" : "AGDF_DELIVERY_RELATIONSHIP_EVIDENCE_MISSING",
        message: `${expected.from} must be traceable via ${expected.relationship} ${expected.to}.`,
        path: runState.path,
        next_step: "Fill the Artefact Chain row with concrete evidence before treating the delivery map as complete.",
      });
    }

    return {
      from: expected.from,
      relationship: expected.relationship,
      to: expected.to,
      required,
      status,
      evidence,
    };
  });

  for (const item of runState.missing_evidence) {
    const severity = severityFromImpact(item.impact);
    if (!severity) continue;
    findings.push({
      severity,
      code: "AGDF_MISSING_EVIDENCE_DECLARED",
      message: item.missing_evidence,
      path: runState.path,
      next_step: item.required_next_step || "Resolve or explicitly accept the missing evidence before advancing the gate.",
    });
  }

  for (const item of runState.risks) {
    const severity = severityFromImpact(item.impact);
    if (!severity) continue;
    findings.push({
      severity,
      code: "AGDF_RISK_DECLARED",
      message: item.risk,
      path: runState.path,
      next_step: item.mitigation_or_owner || "Assign mitigation or ownership before advancing the gate.",
    });
  }

  const contextSeverity = severityFromImpact(runState.context_graph?.gate_effect);
  if (contextSeverity) {
    findings.push({
      severity: contextSeverity,
      code: "AGDF_CONTEXT_GRAPH_GATE_EFFECT",
      message: `Context Graph impact is ${runState.context_graph.impact || "unspecified"} with gate effect ${runState.context_graph.gate_effect}.`,
      path: runState.path,
      next_step: runState.context_graph.required_action && runState.context_graph.required_action !== "none"
        ? `Resolve Context Graph action: ${runState.context_graph.required_action}.`
        : "Clarify the Context Graph impact before advancing the gate.",
    });
  }

  const multiScopeState = runState.source_scope?.multi_scope_state;
  if (multiScopeState === "ambiguous" || multiScopeState === "blocked") {
    findings.push({
      severity: multiScopeState === "blocked" ? "block" : "revise",
      code: "AGDF_SCOPE_AMBIGUOUS",
      message: "Multiple active scope lines are plausible; the agent must not choose one silently.",
      path: runState.path,
      next_step: "List competing scope lines with gate and artefact evidence, then clarify the active scope.",
    });
  }

  const branchEffect = runState.source_scope?.branch_workspace_scope_effect;
  if (branchEffect === "conflicts" || branchEffect === "insufficient") {
    findings.push({
      severity: branchEffect === "conflicts" ? "revise" : "warn",
      code: "AGDF_BRANCH_NOT_SCOPE_PROOF",
      message: "Branch or workspace evidence is not sufficient scope proof.",
      path: runState.path,
      next_step: "Confirm the active scope from durable artefacts or record why branch/workspace evidence is only supporting evidence.",
    });
  }

  if (runState.memory?.target && runState.memory.target !== "none" && !filled(runState.memory.reason)) {
    findings.push({
      severity: "warn",
      code: "AGDF_MEMORY_TARGET_REASON_MISSING",
      message: "Knowledge persistence target is set without a reason.",
      path: runState.path,
      next_step: "Fill memory_reason or set memory_target to none.",
    });
  }

  return {
    relationships,
    missing_evidence: runState.missing_evidence,
    risks: runState.risks,
    context_graph: runState.context_graph,
    source_scope: runState.source_scope,
    memory: runState.memory,
    findings,
  };
}

function deriveQualityOutlook(runState, findings = []) {
  if (filled(runState.quality_outlook)) return runState.quality_outlook;
  if (findings.some((finding) => finding.severity === "block" || finding.severity === "revise")) {
    return "Resolve blocking or revise-level delivery-map findings before making stronger quality claims.";
  }
  if (findings.some((finding) => finding.severity === "warn")) {
    return "Review warning-level findings when investing further in delivery confidence.";
  }
  return "No additional quality follow-up identified from the current control state.";
}

function buildStatusCard({
  status,
  currentGate,
  allowed = [],
  forbidden = [],
  blockingReason = "none",
  missingApproval = "none",
  nextAllowedAction,
  runState,
  findings = [],
}) {
  const qualityOutlook = deriveQualityOutlook(runState, findings);
  return {
    mode: extractField(runState.content ?? "", "mode") || "unknown",
    status,
    current_gate: currentGate,
    mode_slice_decision: runState.mode_slice_decision?.decision || "undecided",
    allowed_now: allowed,
    forbidden_now: forbidden,
    blocking_condition: blockingReason || "none",
    missing_approval: missingApproval || "none",
    evidence: runState.evidence_refs,
    next_skill: nextSkillByGate[currentGate] ?? "gate-check",
    next_step: nextAllowedAction,
    quality_outlook: qualityOutlook,
  };
}

function effectiveCurrentGate(runState, transitionDecision) {
  if (transitionDecision.status !== "open") return transitionDecision.current_gate;
  const explicitGate = normalizeCurrentGate(runState.current_gate, "");
  const explicitIndex = gateProgressOrder.indexOf(explicitGate);
  const fallbackIndex = gateProgressOrder.indexOf(transitionDecision.current_gate);
  if (explicitIndex === -1 || fallbackIndex === -1) return transitionDecision.current_gate;
  return explicitIndex > fallbackIndex ? explicitGate : transitionDecision.current_gate;
}

function durableArtefactBlock(gate, nextGate) {
  const label = gate === "QA" ? "QA report" : `${gate} artefact`;
  const stablePath = gate === "QA" ? ".agdf/control/artefacts/<key>/QA_REPORT.md" : `.agdf/control/artefacts/<key>/${gate}.md`;
  return {
    status: "blocked",
    current_gate: gate,
    blocking_reason: `missing_durable_${gate.toLowerCase()}_artefact`,
    missing_approval: "none",
    allowed: [
      `persist the approved ${label} in a stable artefact path such as ${stablePath}`,
      "link the artefact from AGDF_RUN.md and MASTER_BACKLOG.md",
      "run gate-check again",
    ],
    forbidden: nextGate
      ? [`create ${nextGate}`, "create later-gate artefacts", "implement gated work", "claim QA or release readiness"]
      : ["create later-gate artefacts", "implement gated work", "claim release readiness"],
    next_allowed_action: `Persist the approved ${label} and link it from the AGDF control state before continuing.`,
  };
}

function isGateSatisfied(runState, gate) {
  const status = gateApprovalStatus(runState, gate);
  if (status === "not_applicable") return true;
  if (status !== "approved") return false;
  if (gate === "UAT") return true;
  return isDurableGateArtefactSatisfied(runState, gate);
}

function transitionDecisionForRunState(runState) {
  if (gateApprovalStatus(runState, "UR") === "approved" && !isGateSatisfied(runState, "UR")) return durableArtefactBlock("UR", "PRD");

  if (!isGateSatisfied(runState, "UR")) {
    return {
      status: "blocked",
      current_gate: "UR",
      blocking_reason: "missing_exact_approval",
      missing_approval: "Approval: UR",
      allowed: ["clarify user need", "formulate and persist UR", "record evidence", "request exact UR approval"],
      forbidden: ["create PRD", "create SD", "create TP", "run Brownfield Analysis", "implement code", "claim QA or release readiness"],
      next_allowed_action: "Clarify the user requirement, persist the UR, and request exact approval: Approval: UR",
    };
  }

  if (gateApprovalStatus(runState, "PRD") === "approved" && !isGateSatisfied(runState, "PRD")) return durableArtefactBlock("PRD", "SD");

  if (!isGateSatisfied(runState, "PRD")) {
    if (!isInternalStepSatisfied(runState, "Brownfield Review")) {
      return {
        status: "open",
        current_gate: "Brownfield Review",
        blocking_reason: "none",
        missing_approval: "none",
        allowed: [
          "run Brownfield Review after G-00",
          "identify existing workstream, owners, SoT, reuse risks and open PRD/SD questions",
          "mark Brownfield Review as done or not_applicable in AGDF_RUN.md",
        ],
        forbidden: ["create PRD before Brownfield Review is resolved", "create SD", "create TP", "implement code", "claim QA or release readiness"],
        next_allowed_action: "Run Brownfield Review after G-00 before drafting PRD, or mark Brownfield Review not_applicable with evidence.",
      };
    }

    const modeDecision = modeSliceDecision(runState);
    if (modeDecision === "undecided") {
      return {
        status: "open",
        current_gate: "Mode/Slice Decision",
        blocking_reason: "none",
        missing_approval: "none",
        allowed: [
          "decide whether the approved UR is quick_task, structured_slice, structured_delivery or block",
          "record scope reason, evidence and required next gate depth in AGDF_RUN.md",
          "choose the next required gate depth before drafting PRD or implementing",
        ],
        forbidden: ["create PRD before process size is decided", "create SD", "create TP", "implement code", "claim QA or release readiness"],
        next_allowed_action: "Record the Mode/Slice Decision from Brownfield Review with scope reason and evidence before choosing PRD depth or Quick Task execution.",
      };
    }

    if (modeDecision === "block") {
      return {
        status: "blocked",
        current_gate: "Mode/Slice Decision",
        blocking_reason: "mode_slice_decision_blocked",
        missing_approval: "none",
        allowed: ["resolve ownership, SoT, evidence, impact or product-direction uncertainty", "run gate-check again"],
        forbidden: ["create PRD", "create SD", "create TP", "implement code", "claim QA or release readiness"],
        next_allowed_action: "Resolve the Brownfield Review blocker before choosing a delivery path.",
      };
    }

    if (modeDecision === "quick_task") {
      return {
        status: "open",
        current_gate: "Quick Task Execution",
        blocking_reason: "none",
        missing_approval: "none",
        allowed: ["implement the narrow approved UR scope", "run relevant checks", "record evidence and close with OR-lite"],
        forbidden: ["expand scope beyond the Brownfield Review decision", "create broad PRD/SD/TP artefacts by ritual", "claim QA or release readiness without evidence"],
        next_allowed_action: "Proceed as a Quick Task within the Brownfield Review scope and record verification evidence.",
      };
    }

    return {
      status: "open",
      current_gate: "PRD",
      blocking_reason: "none",
      missing_approval: "Approval: PRD",
      allowed: ["draft or refine PRD", "define scope", "define acceptance criteria", "define non-goals", "request exact PRD approval"],
      forbidden: ["create SD", "create TP", "run Brownfield Analysis as implementation preparation", "implement code", "claim QA or release readiness"],
      next_allowed_action: modeDecision === "structured_slice"
        ? "Draft or refine the smallest PRD slice justified by Brownfield Review; do not implement before required artefacts are approved."
        : "Draft or refine the PRD; do not implement before PRD, SD and TP are approved.",
    };
  }

  if (gateApprovalStatus(runState, "SD") === "approved" && !isGateSatisfied(runState, "SD")) return durableArtefactBlock("SD", "TP");

  if (!isGateSatisfied(runState, "SD")) {
    return {
      status: "open",
      current_gate: "SD",
      blocking_reason: "none",
      missing_approval: "Approval: SD",
      allowed: ["draft or refine Solution Design", "define architecture", "define ownership", "request exact SD approval"],
      forbidden: ["create TP", "implement code", "claim QA or release readiness"],
      next_allowed_action: "Draft or refine the Solution Design; do not implement before SD and TP are approved.",
    };
  }

  if (gateApprovalStatus(runState, "TP") === "approved" && !isGateSatisfied(runState, "TP")) return durableArtefactBlock("TP", "Brownfield Analysis");

  if (!isGateSatisfied(runState, "TP")) {
    return {
      status: "open",
      current_gate: "TP",
      blocking_reason: "none",
      missing_approval: "Approval: TP",
      allowed: ["draft or refine Task/Test Plan", "define task IDs", "define test evidence", "request exact TP approval"],
      forbidden: ["implement code", "claim QA or release readiness"],
      next_allowed_action: "Draft or refine the Task/Test Plan; do not implement before TP is approved.",
    };
  }

  if (gateApprovalStatus(runState, "QA") === "approved" && !isGateSatisfied(runState, "QA")) return durableArtefactBlock("QA", "UAT");

  if (isGateSatisfied(runState, "QA") && !isGateSatisfied(runState, "UAT")) {
    return {
      status: "open",
      current_gate: "UAT",
      blocking_reason: "none",
      missing_approval: "Approval: UAT",
      allowed: ["request exact UAT approval", "prepare non-operative delivery summary"],
      forbidden: ["release", "push", "open PR", "commit without explicit user instruction and required approval"],
      next_allowed_action: "Request exact approval: Approval: UAT before delivery handoff.",
    };
  }

  if (isGateSatisfied(runState, "UAT")) {
    return {
      status: "open",
      current_gate: "OR",
      blocking_reason: "none",
      missing_approval: "none",
      allowed: ["produce OR or delivery closeout", "prepare commit, push or PR handoff when requested"],
      forbidden: ["commit, push, open PR or release automatically"],
      next_allowed_action: "Produce delivery closeout or requested handoff; do not perform VCS actions automatically.",
    };
  }

  return {
    status: "open",
    current_gate: "Brownfield Analysis",
    blocking_reason: "none",
    missing_approval: "none",
    allowed: ["run Brownfield Analysis for the approved TP scope", "verify existing owners, reuse paths and regression risks"],
    forbidden: ["implement before Brownfield evidence supports the approved TP path", "claim QA or release readiness"],
    next_allowed_action: "Run Brownfield Analysis for the approved TP scope before CD+Tests.",
  };
}

function evaluateGateCheck(targetDir) {
  const doctorReport = evaluateDoctor(targetDir);
  const runState = readRunState(targetDir);
  const transitionDecision = transitionDecisionForRunState(runState);
  const deliveryMap = analyzeDeliveryMap(runState);
  const doctorBlocker = doctorReport.findings.find((finding) => finding.severity === "block");
  const doctorRevise = doctorReport.findings.find((finding) => finding.severity === "revise");

  let status = transitionDecision.status;
  let currentGate = effectiveCurrentGate(runState, transitionDecision);
  let blockingReason = transitionDecision.blocking_reason;
  let missingApproval = transitionDecision.missing_approval;
  let allowed = transitionDecision.allowed;
  let forbidden = transitionDecision.forbidden;
  let nextAllowedAction = isPlaceholderValue(runState.next_allowed_action)
    ? transitionDecision.next_allowed_action
    : runState.next_allowed_action;

  if (doctorBlocker?.code === "AGDF_CONTROL_FILE_MISSING") {
    status = "blocked";
    blockingReason = doctorBlocker.code;
    currentGate = "UR";
    missingApproval = "Approval: UR";
    allowed = [
      "draft the minimal UR for the requested change in the response",
      "request exact approval: Approval: UR",
      "run npx --yes @agdf/cli@latest init only when durable control state or deterministic setup is explicitly needed",
    ];
    forbidden = ["create PRD", "create SD", "create TP", "run Brownfield Analysis", "implement code", "claim QA or release readiness"];
    nextAllowedAction = "Draft the minimal UR for the request in the response, then ask for exact approval: Approval: UR. Do not write a full .agdf/control scaffold unless durable control state or deterministic setup is explicitly needed.";
  } else if (doctorBlocker) {
    status = "blocked";
    blockingReason = doctorBlocker.code;
    allowed = ["repair the AGDF control scaffold", ...transitionDecision.allowed, "run doctor again"];
    forbidden = ["create later-gate artefacts beyond the current allowed gate", "implement gated work", "claim QA or release readiness"];
    nextAllowedAction = doctorBlocker.next_step;
  } else if (doctorRevise) {
    status = "blocked";
    blockingReason = doctorRevise.code;
    allowed = [...new Set(["complete the current control-state fields", ...transitionDecision.allowed, "run doctor again"])];
    forbidden = ["create later-gate artefacts beyond the current allowed gate", "implement gated work before the gate allows it", "claim QA or release readiness"];
    nextAllowedAction = transitionDecision.current_gate === "UR"
      ? "Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR."
      : doctorRevise.next_step;
  }

  return {
    schema_version: "1",
    status,
    current_gate: currentGate,
    blocking_reason: blockingReason,
    missing_approval: missingApproval,
    allowed,
    forbidden,
    next_allowed_action: nextAllowedAction,
    doctor_status: doctorReport.status,
    doctor_summary: doctorReport.summary,
    evidence_refs: runState.evidence_refs,
    quality_outlook: deriveQualityOutlook(runState, deliveryMap.findings),
    status_card: buildStatusCard({
      status,
      currentGate,
      allowed,
      forbidden,
      blockingReason,
      missingApproval,
      nextAllowedAction,
      runState,
      findings: deliveryMap.findings,
    }),
    delivery_map: {
      relationships: deliveryMap.relationships,
      mode_slice_decision: runState.mode_slice_decision,
      context_graph: deliveryMap.context_graph,
      source_scope: deliveryMap.source_scope,
      memory: deliveryMap.memory,
      findings: deliveryMap.findings,
    },
    doctor_report: doctorReport,
  };
}

function printGateCheckReport(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`AGDF gate-check: ${report.status}`);
  console.log(`Current gate: ${report.current_gate}`);
  console.log(`Blocking reason: ${report.blocking_reason}`);
  console.log(`Missing approval: ${report.missing_approval}`);
  console.log(`Quality outlook: ${report.quality_outlook}`);
  console.log(`Doctor: ${report.doctor_status} (${report.doctor_summary.findings} findings)`);
  console.log("");
  console.log("Allowed:");
  for (const item of report.allowed) console.log(`- ${item}`);
  console.log("");
  console.log("Forbidden:");
  for (const item of report.forbidden) console.log(`- ${item}`);
  console.log("");
  console.log(`Next allowed action: ${report.next_allowed_action}`);
}

function readBacklogPointers(targetDir) {
  const backlogPath = join(".agdf", "control", "MASTER_BACKLOG.md");
  if (!existsSync(join(targetDir, backlogPath))) return [];

  const backlog = readTargetFile(targetDir, backlogPath);
  const activeSection = markdownSection(backlog, "Active Backlog");
  return parseBacklogSection(activeSection);
}

function evaluateDeliveryMap(targetDir) {
  const doctorReport = evaluateDoctor(targetDir);
  const runState = readRunState(targetDir);
  const map = analyzeDeliveryMap(runState);
  const gateDecision = transitionDecisionForRunState(runState);
  const currentGate = effectiveCurrentGate(runState, gateDecision);

  const severityRank = { block: 3, revise: 2, warn: 1 };
  const deliverySeverity = map.findings.reduce((max, finding) => Math.max(max, severityRank[finding.severity] ?? 0), 0);
  const doctorSeverity = severityRank[doctorReport.status] ?? 0;
  const maxSeverity = Math.max(deliverySeverity, doctorSeverity);
  const status = maxSeverity >= 3 ? "block" : maxSeverity === 2 ? "revise" : maxSeverity === 1 ? "warn" : "pass";

  const qualityOutlook = deriveQualityOutlook(runState, map.findings);
  const nextAllowedAction = isPlaceholderValue(runState.next_allowed_action) ? gateDecision.next_allowed_action : runState.next_allowed_action;

  return {
    schema_version: "1",
    status,
    checked_at: new Date().toISOString(),
    target_dir: targetDir,
    current_gate: currentGate,
    next_allowed_action: nextAllowedAction,
    quality_outlook: qualityOutlook,
    status_card: buildStatusCard({
      status,
      currentGate,
      allowed: gateDecision.allowed,
      forbidden: gateDecision.forbidden,
      blockingReason: gateDecision.blocking_reason,
      missingApproval: gateDecision.missing_approval,
      nextAllowedAction,
      runState,
      findings: map.findings,
    }),
    backlog_pointers: readBacklogPointers(targetDir),
    artefacts: Object.fromEntries([...runState.artefacts.entries()]),
    approvals: Object.fromEntries([...runState.approvals.entries()]),
    mode_slice_decision: runState.mode_slice_decision,
    relationships: map.relationships,
    evidence_refs: runState.evidence_refs,
    missing_evidence: map.missing_evidence,
    risks: map.risks,
    context_graph: map.context_graph,
    source_scope: map.source_scope,
    memory: map.memory,
    findings: map.findings,
    doctor_status: doctorReport.status,
    doctor_summary: doctorReport.summary,
    doctor_report: doctorReport,
  };
}

function printDeliveryMapReport(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`AGDF delivery-map: ${report.status}`);
  console.log(`Current gate: ${report.current_gate}`);
  console.log(`Next allowed action: ${report.next_allowed_action}`);
  console.log(`Quality outlook: ${report.quality_outlook}`);
  console.log(`Relationships: ${report.relationships.filter((item) => item.status === "pass").length}/${report.relationships.length} evidenced`);
  console.log(`Findings: ${report.findings.length}`);

  for (const finding of report.findings) {
    console.log("");
    console.log(`[${finding.severity}] ${finding.code}`);
    console.log(finding.message);
    console.log(`Next step: ${finding.next_step}`);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.target === "doctor") {
    const report = evaluateDoctor(options.dir);
    printDoctorReport(report, options.json);
    process.exit(report.status === "block" ? 2 : 0);
  }

  if (options.target === "gate-check") {
    const report = evaluateGateCheck(options.dir);
    printGateCheckReport(report, options.json);
    process.exit(report.status === "blocked" ? 2 : 0);
  }

  if (options.target === "delivery-map") {
    const report = evaluateDeliveryMap(options.dir);
    printDeliveryMapReport(report, options.json);
    process.exit(report.status === "block" ? 2 : 0);
  }

  const files = generatedFilesForTarget(options.target, options.dir, options.force, options.language);
  const wroteAgentsFragment = files.some(file => file.path === agdfFragmentPath);
  const wroteOpenCodeConfigFragment = files.some(file => file.path === openCodeConfigFragmentPath);

  try {
    for (const file of files) {
      writeGeneratedFile(options.dir, file.path, file.content, options.force, file.allowOverwrite);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  printNextSteps(options.target, options.dir, files, wroteAgentsFragment, wroteOpenCodeConfigFragment);
}

main();
