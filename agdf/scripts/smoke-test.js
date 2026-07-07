import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = new URL("..", import.meta.url);
const repoRoot = new URL("..", packageRoot);
const createAgdfPackageRoot = fileURLToPath(new URL("./create-agdf", repoRoot));
const packageJsonPath = fileURLToPath(new URL("./package.json", packageRoot));
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

if (packageJson.name !== "agdf") {
  throw new Error("The primary CLI package must be named agdf.");
}

if (packageJson.bin?.agdf !== "./bin/agdf.js") {
  throw new Error("The agdf package must expose the agdf binary.");
}

if (packageJson.dependencies?.["create-agdf"] !== packageJson.version) {
  throw new Error("The agdf wrapper must depend on the matching create-agdf version.");
}

const tempDir = mkdtempSync(join(tmpdir(), "agdf-cli-"));

try {
  execFileSync("npm", ["pack", "--silent", createAgdfPackageRoot], {
    cwd: tempDir,
    stdio: "pipe",
  });

  const createAgdfTarball = join(tempDir, `create-agdf-${packageJson.version}.tgz`);
  if (!existsSync(createAgdfTarball)) {
    throw new Error("Expected create-agdf tarball was not created.");
  }

  execFileSync("npm", ["install", "--silent", createAgdfTarball], {
    cwd: tempDir,
    stdio: "pipe",
  });

  const installedAgdfRoot = join(tempDir, "node_modules", "agdf");
  mkdirSync(join(tempDir, "node_modules"), { recursive: true });
  cpSync(fileURLToPath(packageRoot), installedAgdfRoot, {
    recursive: true,
    filter: (source) => !source.includes(`${join("agdf", "node_modules")}`),
  });

  const agdfBin = join(installedAgdfRoot, "bin", "agdf.js");
  const helpOutput = execFileSync(process.execPath, [agdfBin, "--help"], {
    cwd: tempDir,
    encoding: "utf8",
  });

  if (!helpOutput.includes("Preferred AGDF CLI:") || !helpOutput.includes("npx --yes agdf@latest init")) {
    throw new Error("agdf help output must present the primary AGDF CLI shape.");
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

console.log("agdf CLI smoke test passed");
