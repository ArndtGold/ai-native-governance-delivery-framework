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
const allowedTargets = new Set(["codex", "copilot", "both", "init", "doctor", "gate-check"]);
const agdfFragmentPath = "AGENTS.agdf.md";
const userGateOrder = ["UR", "PRD", "SD", "TP", "QA", "UAT"];
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

Options:
  --dir <path>   Write files into a specific directory
  --force        Overwrite existing generated files
  --json         Print doctor or gate-check output as JSON
  --help         Show this help
`);
}

function parseArgs(argv) {
  const args = [...argv];
  let target;
  let dir = ".";
  let force = false;
  let json = false;

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
    console.error("Please choose one target: codex, copilot, both, init, doctor or gate-check.");
    printUsage();
    process.exit(1);
  }

  return {
    target,
    dir: resolve(process.cwd(), dir),
    force,
    json,
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

function generatedFilesForTarget(target, targetDir, force) {
  const files = [];

  if (target === "init") {
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

    return files;
  }

  if (target === "codex" || target === "both") {
    for (const codexPath of codexPluginFiles) {
      files.push({
        path: codexPath,
        content: loadAsset(codexPath),
      });
    }
  }

  if (target === "copilot" || target === "both") {
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
      "Run npm create agdf@latest init, then fill the live control files with the current repository state.",
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

function cleanStatusCell(value) {
  return value.replace(/^`|`$/g, "").trim();
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
      evidence_refs: [],
    };
  }

  const content = readTargetFile(targetDir, runPath);
  const approvalsSection = content.match(/## Approvals([\s\S]*?)(?:\n## |\n# |$)/)?.[1] ?? "";
  const approvals = new Map();
  for (const cells of tableRows(approvalsSection)) {
    const [gate, status, evidence] = cells;
    if (!userGateOrder.includes(gate)) continue;
    approvals.set(gate, {
      status: cleanStatusCell(status ?? ""),
      evidence: evidence ?? "",
    });
  }

  const evidenceSection = content.match(/## Evidence([\s\S]*?)(?:\n## |\n# |$)/)?.[1] ?? "";
  const evidence_refs = tableRows(evidenceSection)
    .filter((cells) => cells[0] !== "Evidence")
    .filter((cells) => Boolean(cells[0] || cells[1] || cells[2]))
    .map((cells) => ({
      evidence: cells[0] ?? "",
      source: cells[1] ?? "",
      covers: cells[2] ?? "",
      strength: cleanStatusCell(cells[3] ?? ""),
    }));

  return {
    path: runPath,
    content,
    current_gate: extractField(content, "current_gate"),
    next_allowed_action: extractField(content, "next_allowed_action"),
    approvals,
    evidence_refs,
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

function evaluateGateCheck(targetDir) {
  const doctorReport = evaluateDoctor(targetDir);
  const runState = readRunState(targetDir);
  const fallbackGate = firstUnapprovedGate(runState.approvals);
  const currentGate = normalizeCurrentGate(runState.current_gate, fallbackGate);
  const currentApprovalStatus = gateApprovalStatus(runState, currentGate);
  const doctorBlocker = doctorReport.findings.find((finding) => finding.severity === "block");
  const doctorRevise = doctorReport.findings.find((finding) => finding.severity === "revise");

  let status = "open";
  let blockingReason = "none";
  let missingApproval = "none";
  let allowed = [
    "continue with the documented next allowed action",
    "update evidence when new facts are observed",
    "run doctor or gate-check again after control changes",
  ];
  let forbidden = [
    "bypass the documented gate state",
    "treat warnings as resolved without evidence",
  ];
  let nextAllowedAction = isPlaceholderValue(runState.next_allowed_action)
    ? "Continue with the current documented gate only after setting next_allowed_action."
    : runState.next_allowed_action;

  if (doctorBlocker) {
    status = "blocked";
    blockingReason = doctorBlocker.code;
    allowed = ["repair the AGDF control scaffold", "run doctor again"];
    forbidden = ["continue governed delivery", "create later-gate artefacts", "implement gated work"];
    nextAllowedAction = doctorBlocker.next_step;
  } else if (doctorRevise) {
    status = "blocked";
    blockingReason = doctorRevise.code;
    allowed = ["repair the incomplete control state", "run doctor again"];
    forbidden = ["continue governed delivery", "create later-gate artefacts", "implement gated work"];
    nextAllowedAction = doctorRevise.next_step;
  } else if (userGateOrder.includes(currentGate) && currentApprovalStatus !== "approved" && currentApprovalStatus !== "not_applicable") {
    status = "blocked";
    blockingReason = "missing_exact_approval";
    missingApproval = `Approval: ${currentGate}`;
    allowed = ["clarify the current gate", "record evidence", "write OR-lite status", "request exact approval"];
    forbidden = ["create later-gate artefacts", "implement gated work", "mark QA or UAT as passed"];
    nextAllowedAction = `Request exact approval: Approval: ${currentGate}`;
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

  const files = generatedFilesForTarget(options.target, options.dir, options.force);
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
