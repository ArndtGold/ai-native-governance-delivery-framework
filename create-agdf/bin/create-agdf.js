#!/usr/bin/env node

import process from "node:process";

try {
  if (Number.parseInt(process.versions.node, 10) < 22) throw new Error("AGDF_NODE_UNSUPPORTED: Node.js 22 or later is required.");
  const { main } = await import("../lib/cli/application.js");
  process.exitCode = await main(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
