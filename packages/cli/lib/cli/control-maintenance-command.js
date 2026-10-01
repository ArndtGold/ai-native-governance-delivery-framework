import { createInterface } from "node:readline/promises";
import process from "node:process";
import { runControlMaintenance } from "../control-maintenance/service.js";
import { maintenanceResult, maintenanceExitCode } from "#agdf-core/control-maintenance/contract.js";
import { renderMaintenanceResult } from "#agdf-core/control-maintenance/presentation.js";
import { selectControlMaintenance, selectControlMigration, selectControlRepair } from "../control-maintenance/interaction.js";

export async function executeControlMaintenance(options, io = console, adapters = {}) {
  const input = adapters.input ?? process.stdin;
  const output = adapters.output ?? process.stdout;
  if (options.guided && (options.json || !(adapters.interactive ?? (input.isTTY && output.isTTY)))) {
    io.error("AGDF_MAINTENANCE_INTERACTION_REQUIRED: --guided requires interactive input and cannot be combined with --json.");
    return 1;
  }
  let prompt;
  let closed = false;
  const language = options.language?.chat_language ?? "en";
  const write = (value) => io.log(value);
  const readChoice = adapters.readChoice ?? (({ prompt: question }) => new Promise((resolve, reject) => {
    if (closed) { reject(new Error("EOF")); return; }
    const onClose = () => reject(new Error("EOF"));
    prompt.once("close", onClose);
    prompt.question(question).then(resolve, reject).finally(() => prompt.removeListener("close", onClose));
  }));
  const interaction = { language, write, readChoice };
  try {
    if (options.guided && !adapters.readChoice) {
      prompt = createInterface({ input, output });
      prompt.on("close", () => { closed = true; });
    }
    const report = await runControlMaintenance(options.dir, {
      guided: options.guided,
      chooseMaintenance: (control) => selectControlMaintenance(control, interaction),
      confirmMigration: (plan) => selectControlMigration(plan, interaction),
      confirmRepair: (plan) => selectControlRepair(plan, { ...interaction, phase: "plan" }),
    });
    io.log(options.json ? JSON.stringify(report, null, 2) : renderMaintenanceResult(report, { language, details: options.details }));
    return maintenanceExitCode(report);
  } catch (error) {
    const report = maintenanceResult(options.dir, null, { operation: options.guided ? "guided" : "inspect", diagnostic: String(error.code ?? error.message) });
    io.log(options.json ? JSON.stringify(report, null, 2) : renderMaintenanceResult(report, { language }));
    return 1;
  } finally { prompt?.close(); }
}
