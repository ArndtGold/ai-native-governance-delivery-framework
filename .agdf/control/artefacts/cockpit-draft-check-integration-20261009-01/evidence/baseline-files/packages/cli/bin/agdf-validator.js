#!/usr/bin/env node

import process from "node:process";
import { runValidatorCli } from "../lib/runtime/validator-application.js";

try {
  process.exitCode = await runValidatorCli(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
