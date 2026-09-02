#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { executeReleaseVersionBump, recoverReleaseVersionBump } from "../lib/release/version-bump.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultRepoRoot = resolve(packageRoot, "..");
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function commandError(code, detail) {
  const error = new Error(`${code}: ${detail}`);
  error.code = code;
  return error;
}

function parseArguments(args) {
  const nextVersion = args[0];
  let acceptedContractDigest;
  for (let index = 1; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--accept-profile-contract-digest") {
      acceptedContractDigest = args[index + 1];
      index += 1;
    } else if (argument.startsWith("--accept-profile-contract-digest=")) {
      acceptedContractDigest = argument.slice(argument.indexOf("=") + 1);
    } else {
      throw commandError("release_version_bump_invalid", `unknown argument ${argument}`);
    }
  }
  if (!SEMVER.test(nextVersion ?? "")) {
    throw commandError(
      "release_version_bump_invalid",
      "usage: npm run set-version -- <semver> [--accept-profile-contract-digest <sha256>]",
    );
  }
  if (acceptedContractDigest !== undefined && !/^[a-f0-9]{64}$/.test(acceptedContractDigest)) {
    throw commandError("release_version_bump_invalid", "accepted profile contract digest must be lowercase SHA-256");
  }
  return { nextVersion, acceptedContractDigest };
}

export function assertNpmVersionAvailable({ packageName, version, repoRoot, exec = execFileSync }) {
  const npmCommand = process.platform === "win32" ? process.execPath : "npm";
  const prefix = process.platform === "win32"
    ? [join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")]
    : [];
  try {
    exec(npmCommand, [...prefix, "view", `${packageName}@${version}`, "version", "--json"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}`;
    if (output.includes("E404") || output.includes("No match found for version")) return;
    throw error;
  }
  throw commandError("release_version_bump_invalid", `${packageName}@${version} already exists on npm`);
}

export function runReleaseBumpCommand({
  args = process.argv.slice(2),
  repoRoot = defaultRepoRoot,
  checkNpmVersion = assertNpmVersionAvailable,
  execute = executeReleaseVersionBump,
  recover = recoverReleaseVersionBump,
  output = console.log,
} = {}) {
  recover({ repoRoot });
  const { nextVersion, acceptedContractDigest } = parseArguments(args);
  for (const packageName of ["create-agdf", "@agdf/cli"]) {
    checkNpmVersion({ packageName, version: nextVersion, repoRoot });
    output(`ok: ${packageName}@${nextVersion} is not published`);
  }
  const plan = execute({ repoRoot, nextVersion, acceptedContractDigest });
  output(`Updated AGDF release state to ${nextVersion} (${plan.mode}).`);
  output("Next validation:");
  output("  npm --prefix create-agdf run release:prepare");
  output("  npm --prefix create-agdf run smoke-test");
  output("  npm --prefix agdf run smoke-test");
  output("  node plugin/scripts/check-runtime-integrity.mjs");
  output("  npm --prefix pages run build");
  output(`Release tag after validation and commit: agdf-v${nextVersion}`);
  return plan;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  try {
    runReleaseBumpCommand();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
