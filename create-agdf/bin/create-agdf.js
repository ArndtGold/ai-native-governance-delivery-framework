#!/usr/bin/env node

import process from "node:process";
import { main } from "../lib/cli/application.js";

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
