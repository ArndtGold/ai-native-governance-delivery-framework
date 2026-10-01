import { createInterface } from "node:readline/promises";
import process from "node:process";
import { interactionLocales } from "#agdf-core/resources/context.js";
import { selectControlMigration, selectControlRepair } from "#agdf-core/control-maintenance/interaction.js";
export * from "#agdf-core/control-maintenance/interaction.js";
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
