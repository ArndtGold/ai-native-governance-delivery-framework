import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { guardedExecFileSync } from "../delivery-path-search/transports/read-only-guard.js";

export function executeStructuredAgent({ surface, cwd, prompt, model, outputSchema, timeoutMs = 120000 }) {
  if (surface === "codex") {
    const temp = mkdtempSync(join(tmpdir(), "agdf-live-codex-"));
    try {
      const schemaPath = join(temp, "schema.json");
      const outputPath = join(temp, "output.json");
      writeFileSync(schemaPath, `${JSON.stringify(outputSchema, null, 2)}\n`, "utf8");
      const args = [
        "exec", "--sandbox", "read-only", "--ephemeral", "--ignore-user-config",
        "--skip-git-repo-check", "--output-schema", schemaPath,
        "--output-last-message", outputPath, "--color", "never",
      ];
      if (model) args.push("--model", model);
      args.push(prompt);
      guardedExecFileSync("codex", args, {
        cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: timeoutMs,
      });
      return readFileSync(outputPath, "utf8");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  }
  if (surface === "claude") {
    const args = [
      "-p", "--disallowedTools", "Edit,Write,Bash", "--output-format", "json",
      "--json-schema", JSON.stringify(outputSchema),
    ];
    if (model) args.push("--model", model);
    args.push(prompt);
    const raw = guardedExecFileSync("claude", args, {
      cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: timeoutMs,
    });
    const envelope = JSON.parse(raw);
    if (envelope.is_error) throw new Error(`claude live adapter failed: ${envelope.result ?? "unknown error"}`);
    return envelope.result;
  }
  throw new Error(`unsupported live surface: ${surface}`);
}
