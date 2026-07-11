import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generatorOutputSchema, validateGeneratorRequest, validateGeneratorResponse } from "../contracts.js";
import { guardedExecFileSync } from "../transports/read-only-guard.js";

export function codexGenerator(options = {}) {
  const codexBin = options.codexBin ?? "codex";
  const execute = options.execute ?? guardedExecFileSync;
  let runtime = options.runtime ?? "codex version unavailable";
  if (!options.runtime) try { runtime = execFileSync(codexBin, ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch {}
  return {
    name: "codex",
    metadata: { name: "codex", runtime, model: options.model ?? "configured-default" },
    async generate(requestValue) {
      const request = validateGeneratorRequest(requestValue);
      const temp = mkdtempSync(join(tmpdir(), "agdf-dps-generator-"));
      const schemaPath = join(temp, "schema.json");
      const outputPath = join(temp, "output.json");
      try {
        writeFileSync(schemaPath, `${JSON.stringify(generatorOutputSchema(), null, 2)}\n`, "utf8");
        const prompt = [
          "Generate bounded advisory delivery-path proposals. Do not use tools, execute commands, or modify files.",
          "Return only JSON matching the supplied schema. Do not include hidden reasoning.",
          `Normalized request: ${JSON.stringify(request)}`,
        ].join("\n");
        const args = ["exec", "--sandbox", "read-only", "--ephemeral", "--ignore-user-config", "--output-schema", schemaPath, "--output-last-message", outputPath, "--color", "never"];
        if (options.model) args.push("--model", options.model);
        args.push(prompt);
        execute(codexBin, args, { cwd: options.cwd, timeout: options.timeoutMs ?? request.budgets.max_duration_ms });
        return validateGeneratorResponse(JSON.parse(readFileSync(outputPath, "utf8")));
      } finally {
        rmSync(temp, { recursive: true, force: true });
      }
    },
  };
}
