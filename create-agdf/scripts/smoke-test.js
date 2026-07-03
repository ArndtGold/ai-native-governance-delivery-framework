import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = new URL("..", import.meta.url);
const binPath = fileURLToPath(new URL("./bin/create-agdf.js", packageRoot));

function run(target, expectedFiles) {
  const tempDir = mkdtempSync(join(tmpdir(), `create-agdf-${target}-`));

  try {
    execFileSync(process.execPath, [binPath, target, "--dir", tempDir], { stdio: "pipe" });

    for (const relativePath of expectedFiles) {
      const outputPath = join(tempDir, relativePath);
      if (!existsSync(outputPath)) {
        throw new Error(`Missing expected file for ${target}: ${relativePath}`);
      }
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

run("copilot", [
  "AGENTS.md",
  join(".github", "skills", "README.md"),
  join(".github", "skills", "agdf-runtime-contract.md"),
  join(".github", "skills", "agdf-gate-check", "SKILL.md"),
  join(".github", "skills", "agdf-code-review", "SKILL.md"),
  join(".github", "skills", "agdf-qa-gate", "SKILL.md"),
]);
run("both", [
  "AGENTS.md",
  join(".github", "skills", "README.md"),
  join(".github", "skills", "agdf-runtime-contract.md"),
  join(".github", "skills", "agdf-code-review", "SKILL.md"),
  join(".github", "skills", "agdf-release-or", "SKILL.md"),
]);

{
  const tempDir = mkdtempSync(join(tmpdir(), "create-agdf-copilot-existing-agents-"));
  const existingAgentsPath = join(tempDir, "AGENTS.md");

  try {
    writeFileSync(existingAgentsPath, "# Existing repo instructions\n", "utf8");
    execFileSync(process.execPath, [binPath, "copilot", "--dir", tempDir], { stdio: "pipe" });

    if (readFileSync(existingAgentsPath, "utf8") !== "# Existing repo instructions\n") {
      throw new Error("Existing AGENTS.md should be preserved when no --force flag is used.");
    }

    const agdfFragmentPath = join(tempDir, "AGENTS.agdf.md");
    if (!existsSync(agdfFragmentPath)) {
      throw new Error("Missing AGENTS.agdf.md fragment for existing AGENTS.md scenario.");
    }

    const expectedSkillPath = join(tempDir, ".github", "skills", "agdf-gate-check", "SKILL.md");
    if (!existsSync(expectedSkillPath)) {
      throw new Error("Missing repository skills for existing AGENTS.md scenario.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

console.log("create-agdf smoke test passed");
