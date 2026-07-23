import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evaluatorOutputSchema, validateEvaluation } from "../contracts.js";
import { guardedExecFileSync } from "../transports/read-only-guard.js";
import { buildEvaluatorPrompt } from "./prompt.js";

export function codexEvaluator(options = {}) {
  const codexBin = options.codexBin ?? "codex";
  let runtime = "codex version unavailable";
  try {
    runtime = execFileSync(codexBin, ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {}

  return {
    name: "codex",
    metadata: { name: "codex", runtime, model: options.model ?? "configured-default" },
    async evaluate(input, candidate) {
      const temp = mkdtempSync(join(tmpdir(), "agdf-dps-"));
      const schemaPath = join(temp, "schema.json");
      const outputPath = join(temp, "output.json");
      try {
        writeFileSync(schemaPath, `${JSON.stringify(evaluatorOutputSchema(), null, 2)}\n`, "utf8");
        const prompt = buildEvaluatorPrompt(input, candidate);
        const args = [
          "exec", "--sandbox", "read-only", "--ephemeral", "--ignore-user-config",
          "--output-schema", schemaPath, "--output-last-message", outputPath, "--color", "never",
        ];
        if (options.model) args.push("--model", options.model);
        args.push(prompt);
        guardedExecFileSync(codexBin, args, {
          cwd: options.cwd,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
          timeout: options.timeoutMs ?? 120000,
        });
        return validateEvaluation(JSON.parse(readFileSync(outputPath, "utf8")), candidate.id);
      } finally {
        rmSync(temp, { recursive: true, force: true });
      }
    },
  };
}
