import process from "node:process";
import { createValidationHandlers } from "../cli/validation-handlers.js";
import { validateCommandOptions } from "../cli/command-registry.js";
import { CliUsageError, parseArgs } from "../cli/parse-args.js";
import { pluginDefinition } from "../cli/runtime-context.js";

const validatorCommands = new Set(["doctor", "gate-check", "delivery-map", "delivery-path-search"]);

export async function runValidatorCli(argv = process.argv.slice(2), adapters = {}) {
  const io = adapters.io ?? console;
  if (argv.includes("--version")) {
    const output = { name: "create-agdf", version: pluginDefinition.version };
    io.log(argv.includes("--json") ? JSON.stringify(output) : output.version);
    return 0;
  }
  let parsed;
  try {
    parsed = parseArgs(argv, adapters.parser);
  } catch (error) {
    if (!(error instanceof CliUsageError)) throw error;
    io.error(error.message);
    return error.exitCode;
  }
  if (parsed.kind === "help") {
    io.log("AGDF surface-local validator: doctor | gate-check | delivery-map | delivery-path-search");
    return 0;
  }
  let options;
  try {
    options = validateCommandOptions(parsed.options);
  } catch (error) {
    io.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
  if (!validatorCommands.has(options.target)) {
    io.error(`The surface-local validator does not support lifecycle command: ${options.target}`);
    return 1;
  }
  return await createValidationHandlers(io).get(options.target)(options);
}
