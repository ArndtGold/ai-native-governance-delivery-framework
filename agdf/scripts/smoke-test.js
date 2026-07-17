import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import process from "node:process";

const packageRoot = new URL("..", import.meta.url);
const repoRoot = new URL("..", packageRoot);
const createAgdfPackageRoot = fileURLToPath(new URL("./create-agdf", repoRoot));
const packageJsonPath = fileURLToPath(new URL("./package.json", packageRoot));
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const npmCommand = process.platform === "win32" ? process.execPath : "npm";
const npmPrefixArgs = process.platform === "win32" ? [join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")] : [];

if (packageJson.name !== "@agdf/cli") {
  throw new Error("The primary CLI package must be named @agdf/cli.");
}

if (packageJson.bin?.agdf !== "./bin/agdf.js") {
  throw new Error("The agdf package must expose the agdf binary.");
}

if (packageJson.dependencies?.["create-agdf"] !== packageJson.version) {
  throw new Error("The agdf wrapper must depend on the matching create-agdf version.");
}

const tempDir = mkdtempSync(join(tmpdir(), "agdf-cli-"));

try {
  execFileSync(npmCommand, [...npmPrefixArgs, "pack", "--silent", createAgdfPackageRoot], {
    cwd: tempDir,
    stdio: "pipe",
  });

  const createAgdfTarball = join(tempDir, `create-agdf-${packageJson.version}.tgz`);
  if (!existsSync(createAgdfTarball)) {
    throw new Error("Expected create-agdf tarball was not created.");
  }

  execFileSync(npmCommand, [...npmPrefixArgs, "install", "--silent", createAgdfTarball], {
    cwd: tempDir,
    stdio: "pipe",
  });

  const installedAgdfRoot = join(tempDir, "node_modules", "@agdf", "cli");
  mkdirSync(join(tempDir, "node_modules", "@agdf"), { recursive: true });
  cpSync(fileURLToPath(packageRoot), installedAgdfRoot, {
    recursive: true,
    filter: (source) => !source.includes(`${join("agdf", "node_modules")}`),
  });

  const agdfBin = join(installedAgdfRoot, "bin", "agdf.js");
  const helpOutput = execFileSync(process.execPath, [agdfBin, "--help"], {
    cwd: tempDir,
    encoding: "utf8",
  });

  if (!helpOutput.includes("Primary commands:")
    || !helpOutput.includes("Advanced / Compatibility")
    || !helpOutput.includes("npx --yes @agdf/cli@latest init")) {
    throw new Error("agdf help output must present the primary AGDF CLI shape.");
  }

  const fixturePath = fileURLToPath(new URL("./create-agdf/scripts/fixtures/delivery-path-search.json", repoRoot));
  const result = JSON.parse(execFileSync(process.execPath, [
    agdfBin,
    "delivery-path-search",
    "--fixture",
    fixturePath,
    "--json",
  ], {
    cwd: tempDir,
    encoding: "utf8",
  }));
  if (result.status !== "recommendation" || result.recommendation?.candidate_id !== "inspect") {
    throw new Error("The packed @agdf/cli wrapper must execute Delivery Path Search through create-agdf.");
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

console.log("agdf CLI smoke test passed");
