import { existsSync, mkdtempSync, rmSync } from "node:fs";
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
  join(".github", "skills", "agdf-qa-gate", "SKILL.md"),
]);
run("both", [
  "AGENTS.md",
  join(".github", "skills", "README.md"),
  join(".github", "skills", "agdf-runtime-contract.md"),
  join(".github", "skills", "agdf-release-or", "SKILL.md"),
]);

console.log("create-agdf smoke test passed");
