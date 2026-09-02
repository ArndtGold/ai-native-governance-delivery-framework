#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runReleaseBumpCommand } from "../create-agdf/scripts/release-bump.js";

const repoRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

try {
  runReleaseBumpCommand({ repoRoot: resolve(repoRoot) });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
