import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evaluatorOutputSchema, validateEvaluation } from "../contracts.js";

export function codexEvaluator(options = {}) {
  const codexBin = options.codexBin ?? "codex";
  let runtime = "codex version unavailable";
  try {
    runtime = execFileSync(codexBin, ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {}

  function gitState() {
    try {
      return execFileSync("git", ["status", "--porcelain=v1", "-z"], {
        cwd: options.cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch {
      return null;
    }
  }

  return {
    name: "codex",
    metadata: { name: "codex", runtime, model: options.model ?? "configured-default" },
    async evaluate(input, candidate) {
      const temp = mkdtempSync(join(tmpdir(), "agdf-dps-"));
      const schemaPath = join(temp, "schema.json");
      const outputPath = join(temp, "output.json");
      try {
        writeFileSync(schemaPath, `${JSON.stringify(evaluatorOutputSchema(), null, 2)}\n`, "utf8");
        const prompt = [
          "You are an evaluation-only component. Do not use tools, execute commands, or modify files.",
          `Return JSON matching contract version ${input.contract_version}.`,
          `Objective: ${input.objective}`,
          `Current gate: ${input.current_gate}`,
          `Candidate id: ${candidate.id}`,
          `Candidate action: ${candidate.action}`,
          "Score scope_fit, gate_readiness, risk_reduction, evidence_gain, testability, reversibility and cost from 0 to 5.",
          "Cost 0 is low and 5 is high. uncertainty is 0 low to 5 high.",
          "Keep rationale concise. child_actions must only contain actions permitted by the current gate.",
        ].join("\n");
        const args = [
          "exec", "--sandbox", "read-only", "--ephemeral", "--ignore-user-config",
          "--output-schema", schemaPath, "--output-last-message", outputPath, "--color", "never",
        ];
        if (options.model) args.push("--model", options.model);
        args.push(prompt);
        const before = gitState();
        execFileSync(codexBin, args, {
          cwd: options.cwd,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
          timeout: options.timeoutMs ?? 120000,
        });
        const after = gitState();
        if (before !== null && after !== before) throw new Error("repository mutation detected during read-only evaluator run");
        return validateEvaluation(JSON.parse(readFileSync(outputPath, "utf8")), candidate.id);
      } finally {
        rmSync(temp, { recursive: true, force: true });
      }
    },
  };
}
