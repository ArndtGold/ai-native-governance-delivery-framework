#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const generatedRoot = join(packageRoot, "generated");
const pluginDefinitionPath = join(generatedRoot, "plugins", "agdf", "meta", "agdf-plugin.definition.json");
const pluginDefinition = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));
const pluginInstallCommand = "claude plugin add arndtgold/ai-native-governance-delivery-framework";
const allowedTargets = new Set(["codex", "copilot", "both", "init", "doctor", "gate-check", "delivery-map"]);
const agdfFragmentPath = "AGENTS.agdf.md";
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
const codexSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.codex.skillPrefix}${skill.slug}`);
const copilotSkillNames = pluginDefinition.skillSet.map((skill) => `${pluginDefinition.copilot.skillPrefix}${skill.slug}`);
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

function printUsage() {
  console.log(`create-agdf

Usage:
  npm create agdf@latest codex
  npm create agdf@latest copilot
  npm create agdf@latest both
  npm create agdf@latest init
  npm create agdf@latest doctor
  npm create agdf@latest gate-check
  npm create agdf@latest delivery-map

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
    console.error("Please choose one target: codex, copilot, both, init, doctor, gate-check or delivery-map.");
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

function writeGeneratedFile(targetDir, relativePath, content, force) {
  const outputPath = join(targetDir, relativePath);
  mkdirSync(dirname(outputPath), { recursive: true });

  if (existsSync(outputPath) && !force) {
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

  return files;
}

function printNextSteps(target, destination, files, wroteAgentsFragment) {
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
    console.log("- Run npm create agdf@latest doctor to check the control state before the next agent run.");
    console.log("- Commit the live control files once they represent the repository's current delivery state.");
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
  if (target === "copilot" || target === "both") {
    console.log("- In GitHub Copilot CLI, run /instructions after the AGENTS.md step is complete to confirm that AGDF instructions and the repository skills are visible.");
    console.log("- Run npm create agdf@latest init when the repository needs live AGDF control files.");
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
      "Run npm create agdf@latest init only when the repository should own durable AGDF control state or deterministic setup is explicitly needed.",
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
    if (!hasFilledTableRow(backlog, /^P[0-9]/)) {
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

function addApprovalRows(approvals, section) {
  for (const cells of tableRows(section)) {
    const [gate, status, evidence] = cells;
    if (!userGateOrder.includes(gate)) continue;
    approvals.set(gate, {
      status: cleanStatusCell(status ?? ""),
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
  if (gate === "QA") return artefact.status === "pass";
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

  return {
    relationships,
    missing_evidence: runState.missing_evidence,
    risks: runState.risks,
    context_graph: runState.context_graph,
    findings,
  };
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
  let currentGate = transitionDecision.current_gate;
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
      "run npm create agdf@latest init only when durable control state or deterministic setup is explicitly needed",
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
    delivery_map: {
      relationships: deliveryMap.relationships,
      mode_slice_decision: runState.mode_slice_decision,
      context_graph: deliveryMap.context_graph,
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
  return nonTemplateRows(activeSection, "Prio")
    .map((cells) => ({
      prio: cells[0] ?? "",
      key: cells[1] ?? "",
      title: cells[2] ?? "",
      status: cleanStatusCell(cells[3] ?? ""),
      ur: cells[4] ?? "",
      brownfield_review: cells[5] ?? "",
      prd: cells[6] ?? "",
      sd: cells[7] ?? "",
      tp: cells[8] ?? "",
      qa: cells[9] ?? "",
      or: cells[10] ?? "",
      current_spec: cells[11] ?? "",
      notes: cells[12] ?? "",
    }));
}

function evaluateDeliveryMap(targetDir) {
  const doctorReport = evaluateDoctor(targetDir);
  const runState = readRunState(targetDir);
  const map = analyzeDeliveryMap(runState);
  const gateDecision = transitionDecisionForRunState(runState);

  const severityRank = { block: 3, revise: 2, warn: 1 };
  const deliverySeverity = map.findings.reduce((max, finding) => Math.max(max, severityRank[finding.severity] ?? 0), 0);
  const doctorSeverity = severityRank[doctorReport.status] ?? 0;
  const maxSeverity = Math.max(deliverySeverity, doctorSeverity);
  const status = maxSeverity >= 3 ? "block" : maxSeverity === 2 ? "revise" : maxSeverity === 1 ? "warn" : "pass";

  return {
    schema_version: "1",
    status,
    checked_at: new Date().toISOString(),
    target_dir: targetDir,
    current_gate: gateDecision.current_gate,
    next_allowed_action: isPlaceholderValue(runState.next_allowed_action) ? gateDecision.next_allowed_action : runState.next_allowed_action,
    backlog_pointers: readBacklogPointers(targetDir),
    artefacts: Object.fromEntries([...runState.artefacts.entries()]),
    approvals: Object.fromEntries([...runState.approvals.entries()]),
    mode_slice_decision: runState.mode_slice_decision,
    relationships: map.relationships,
    evidence_refs: runState.evidence_refs,
    missing_evidence: map.missing_evidence,
    risks: map.risks,
    context_graph: map.context_graph,
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

  try {
    for (const file of files) {
      writeGeneratedFile(options.dir, file.path, file.content, options.force);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  printNextSteps(options.target, options.dir, files, wroteAgentsFragment);
}

main();
