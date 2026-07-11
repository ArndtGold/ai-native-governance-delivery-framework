import { execFileSync } from "node:child_process";
import { generatorOutputSchema, validateGeneratorRequest, validateGeneratorResponse } from "../contracts.js";
import { guardedExecFileSync } from "../transports/read-only-guard.js";

export function claudeGenerator(options = {}) {
  const claudeBin = options.claudeBin ?? "claude";
  const execute = options.execute ?? guardedExecFileSync;
  let runtime = options.runtime ?? "claude version unavailable";
  if (!options.runtime) try { runtime = execFileSync(claudeBin, ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch {}
  return {
    name: "claude",
    metadata: { name: "claude", runtime, model: options.model ?? "configured-default" },
    async generate(requestValue) {
      const request = validateGeneratorRequest(requestValue);
      const prompt = [
        "Generate bounded advisory delivery-path proposals. Do not use tools, execute commands, or modify files.",
        "Return only JSON matching the supplied schema. Do not include hidden reasoning.",
        `Normalized request: ${JSON.stringify(request)}`,
      ].join("\n");
      const args = ["-p", "--disallowedTools", "Edit,Write,Bash", "--output-format", "json", "--json-schema", JSON.stringify(generatorOutputSchema())];
      if (options.model) args.push("--model", options.model);
      args.push(prompt);
      let raw;
      try {
        raw = execute(claudeBin, args, { cwd: options.cwd, timeout: options.timeoutMs ?? request.budgets.max_duration_ms });
      } catch (error) {
        const providerOutput = String(error?.stdout ?? "");
        if (/not logged in|unauthorized|authentication/i.test(providerOutput)) {
          const authentication = new Error("claude generator authentication failed");
          authentication.code = "GENERATOR_AUTHENTICATION_FAILED";
          throw authentication;
        }
        throw error;
      }
      const response = JSON.parse(raw);
      if (response.is_error) throw new Error(`claude generator returned an error: ${response.result ?? "unknown error"}`);
      return validateGeneratorResponse(JSON.parse(response.result));
    },
  };
}
