import { execFileSync } from "node:child_process";
import { evaluatorOutputSchema, validateEvaluation } from "../contracts.js";

export function claudeEvaluator(options = {}) {
  const claudeBin = options.claudeBin ?? "claude";
  let runtime = "claude version unavailable";
  try {
    runtime = execFileSync(claudeBin, ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
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
    name: "claude",
    metadata: { name: "claude", runtime, model: options.model ?? "configured-default" },
    async evaluate(input, candidate) {
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
        "-p", "--disallowedTools", "Edit,Write,Bash",
        "--output-format", "json", "--json-schema", JSON.stringify(evaluatorOutputSchema()),
      ];
      if (options.model) args.push("--model", options.model);
      args.push(prompt);
      const before = gitState();
      const raw = execFileSync(claudeBin, args, {
        cwd: options.cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: options.timeoutMs ?? 120000,
      });
      const after = gitState();
      if (before !== null && after !== before) throw new Error("repository mutation detected during read-only evaluator run");
      const response = JSON.parse(raw);
      if (response.is_error) throw new Error(`claude evaluator returned an error: ${response.result ?? "unknown error"}`);
      return validateEvaluation(JSON.parse(response.result), candidate.id);
    },
  };
}
