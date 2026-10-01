import { createInterface } from "node:readline/promises";
import process from "node:process";
import { interactionLocales } from "../cli/runtime-context.js";
import { localePack } from "../interaction-presentation.js";
import { renderMaintenanceOffer, renderControlMigrationDecision, renderControlRepairOffer, renderControlRepairPlan } from "./presentation.js";

export async function selectControlMaintenance(control, {
  readChoice, write = () => {}, registry = interactionLocales, language = "en",
} = {}) {
  if (typeof readChoice !== "function") throw new Error("AGDF_MAINTENANCE_INTERACTION_REQUIRED");
  const copy = localePack(registry, language).repositoryMaintenance;
  write(renderMaintenanceOffer(control, { registry, language }));
  while (true) {
    let raw;
    try { raw = await readChoice({ prompt: copy.prompt, default: null }); } catch { return "skip"; }
    const choice = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if (!choice || ["2", "skip", "later"].includes(choice)) return "skip";
    if (["1", "start"].includes(choice)) return "start";
    if (["3", "d", "details"].includes(choice)) write(renderMaintenanceOffer(control, { registry, language, details: true }));
    else write(copy.invalid);
  }
}

export async function selectControlMigration(plan, {
  readChoice, write = () => {}, registry = interactionLocales, language = "en",
} = {}) {
  if (typeof readChoice !== "function") throw new Error("AGDF_CONTROL_MIGRATION_READER_REQUIRED");
  const copy = localePack(registry, language).installSetup.controlMigration;
  write(renderControlMigrationDecision(plan, { registry, language }));
  while (true) {
    let value;
    try { value = await readChoice({ prompt: copy.batchPrompt, default: null }); } catch { return "skip"; }
    const choice = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (!choice || ["2", "skip", "later"].includes(choice)) return "skip";
    if (["1", "migrate"].includes(choice)) return "migrate";
    if (["3", "d", "details"].includes(choice)) write(renderControlMigrationDecision(plan, { registry, language, details: true }));
    else write(copy.invalidChoice);
  }
}

export async function promptControlMigration(plan, {
  input = process.stdin, output = process.stdout, registry = interactionLocales, language = "en",
} = {}) {
  const prompt = createInterface({ input, output });
  try {
    return await selectControlMigration(plan, { registry, language,
      write(value) { output.write(`${value}\n`); },
      readChoice({ prompt: question }) { return prompt.question(question); },
    });
  } finally { prompt.close(); }
}

export async function selectControlRepair(value, {
  readChoice, write = () => {}, registry = interactionLocales, language = "en", phase = "offer",
} = {}) {
  if (typeof readChoice !== "function") throw new Error("AGDF_CONTROL_REPAIR_READER_REQUIRED");
  if (!["offer", "plan"].includes(phase)) throw new Error("AGDF_CONTROL_REPAIR_PHASE_INVALID");
  const copy = localePack(registry, language).installSetup.controlRepair;
  const render = phase === "offer" ? renderControlRepairOffer : renderControlRepairPlan;
  write(render(value, { registry, language }));
  while (true) {
    let raw;
    try { raw = await readChoice({ prompt: copy.prompt, default: null }); } catch { return "skip"; }
    const choice = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if (!choice || ["2", "skip", "later"].includes(choice)) return "skip";
    if (choice === "1" && (phase === "offer" || value.items.some((item) => item.available))) return phase === "offer" ? "start" : "repair";
    if (["3", "d", "details"].includes(choice)) write(render(value, { registry, language, details: true }));
    else write(copy.invalidChoice);
  }
}

export async function promptControlRepair(value, {
  input = process.stdin, output = process.stdout, registry = interactionLocales, language = "en", phase = "offer",
} = {}) {
  const prompt = createInterface({ input, output });
  try {
    return await selectControlRepair(value, { registry, language, phase,
      write(text) { output.write(`${text}\n`); },
      readChoice({ prompt: question }) { return prompt.question(question); },
    });
  } finally { prompt.close(); }
}
