#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const nextVersion = process.argv[2];
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

if (!nextVersion || nextVersion.startsWith("-")) {
  fail("Usage: npm run set-version -- <semver>");
}

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(nextVersion)) {
  fail(`Invalid version "${nextVersion}". Expected semver like 0.3.2 or 0.3.2-beta.1.`);
}

const packagesToCheck = ["create-agdf", "@agdf/cli"];

for (const packageName of packagesToCheck) {
  assertNpmVersionDoesNotExist(packageName, nextVersion);
}

const jsonUpdates = [
  ["plugin/meta/agdf-plugin.definition.json", (json) => {
    json.version = nextVersion;
  }],
  ["plugin/.codex-plugin/plugin.json", (json) => {
    json.version = nextVersion;
  }],
  ["plugin/.claude-plugin/plugin.json", (json) => {
    json.version = nextVersion;
  }],
  ["create-agdf/package.json", (json) => {
    json.version = nextVersion;
  }],
  ["agdf/package.json", (json) => {
    json.version = nextVersion;
    json.dependencies ??= {};
    json.dependencies["create-agdf"] = nextVersion;
  }],
  ["pages/package.json", (json) => {
    json.version = nextVersion;
  }],
  ["pages/package-lock.json", (json) => {
    json.version = nextVersion;
    if (json.packages?.[""]) {
      json.packages[""].version = nextVersion;
    }
  }],
];

for (const [relativePath, update] of jsonUpdates) {
  updateJson(relativePath, update);
}

replaceInFile(
  "pages/src/data/site.ts",
  /version:\s*"[^"]+"/,
  `version: "${nextVersion}"`,
);

console.log(`Updated AGDF version to ${nextVersion}.`);
console.log("");
console.log("Next validation:");
console.log("  npm --prefix create-agdf run smoke-test");
console.log("  npm --prefix agdf run smoke-test");
console.log("  node plugin/scripts/check-runtime-integrity.mjs");
console.log("  npm --prefix pages run build");
console.log("");
console.log("Release tags:");
console.log(`  agdf-v${nextVersion}`);

function assertNpmVersionDoesNotExist(packageName, version) {
  try {
    execFileSync(npmCommand, ["view", `${packageName}@${version}`, "version", "--json"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}`;
    if (output.includes("E404") || output.includes("No match found for version")) {
      console.log(`ok: ${packageName}@${version} is not published`);
      return;
    }
    throw error;
  }

  fail(`${packageName}@${version} already exists on npm. Choose a new version.`);
}

function updateJson(relativePath, update) {
  const absolutePath = join(repoRoot, relativePath);
  assertFile(absolutePath, relativePath);
  const json = JSON.parse(readFileSync(absolutePath, "utf8"));
  update(json);
  writeFileSync(absolutePath, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`updated: ${relativePath}`);
}

function replaceInFile(relativePath, pattern, replacement) {
  const absolutePath = join(repoRoot, relativePath);
  assertFile(absolutePath, relativePath);
  const before = readFileSync(absolutePath, "utf8");
  if (!pattern.test(before)) {
    fail(`Could not find version field in ${relativePath}.`);
  }
  const after = before.replace(pattern, replacement);
  writeFileSync(absolutePath, after);
  console.log(`updated: ${relativePath}`);
}

function assertFile(absolutePath, relativePath) {
  if (!existsSync(absolutePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
