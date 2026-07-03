#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const generatedRoot = join(packageRoot, "generated");
const pluginInstallCommand = "claude plugin add arndtgold/ai-native-governance-delivery-framework";
const allowedTargets = new Set(["copilot", "both"]);
const copilotSkillFiles = [
  join(".github", "skills", "README.md"),
  join(".github", "skills", "agdf-runtime-contract.md"),
  join(".github", "skills", "agdf-gate-check", "SKILL.md"),
  join(".github", "skills", "agdf-brownfield-analysis", "SKILL.md"),
  join(".github", "skills", "agdf-task-plan-review", "SKILL.md"),
  join(".github", "skills", "agdf-clean-implementation-review", "SKILL.md"),
  join(".github", "skills", "agdf-qa-gate", "SKILL.md"),
  join(".github", "skills", "agdf-release-or", "SKILL.md"),
  join(".github", "skills", "agdf-delivery-closeout", "SKILL.md"),
];

function printUsage() {
  console.log(`create-agdf

Usage:
  npm create agdf@latest copilot
  npm create agdf@latest both

Options:
  --dir <path>   Write files into a specific directory
  --force        Overwrite existing generated files
  --help         Show this help
`);
}

function parseArgs(argv) {
  const args = [...argv];
  let target;
  let dir = ".";
  let force = false;

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
    console.error("Please choose one target: copilot or both.");
    printUsage();
    process.exit(1);
  }

  return {
    target,
    dir: resolve(process.cwd(), dir),
    force,
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

function generatedFilesForTarget(target) {
  const files = [
    {
      path: "AGENTS.md",
      content: loadAsset("AGENTS.md"),
    },
  ];

  if (target === "copilot" || target === "both") {
    for (const skillPath of copilotSkillFiles) {
      files.push({
        path: skillPath,
        content: loadAsset(skillPath),
      });
    }
  }

  return files;
}

function printNextSteps(target, destination, files) {
  console.log("");
  console.log(`AGDF bootstrap complete in ${destination}`);
  console.log("");
  console.log("Generated:");
  for (const file of files) {
    console.log(`- ${file.path}`);
  }

  console.log("");
  console.log("Next steps:");
  if (target === "both") {
    console.log(`- Install the Claude Code plugin: ${pluginInstallCommand}`);
  }
  if (target === "copilot" || target === "both") {
    console.log("- In GitHub Copilot CLI, run /instructions to confirm that AGENTS.md is loaded and the repository skills are visible.");
  }
  console.log("- Commit the generated files so the repository becomes the source of truth.");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = generatedFilesForTarget(options.target);

  try {
    for (const file of files) {
      writeGeneratedFile(options.dir, file.path, file.content, options.force);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  printNextSteps(options.target, options.dir, files);
}

main();
