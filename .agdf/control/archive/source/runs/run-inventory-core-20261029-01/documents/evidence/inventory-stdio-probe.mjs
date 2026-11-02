// One-off evidence probe (run-inventory-core-20261029-01, SCN-016): agdf_inspect operation
// `inventory` through the built STDIO server on a real repository. Read-only; not part of `npm test`.
// Kept as evidence; run from packages/mcp-server/test. Usage: node test/inventory-stdio-probe.mjs <repository> <evidence-directory>
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { withStdioClient } from "./helpers.js";

const repository = resolve(process.argv[2]);
const out = resolve(process.argv[3]);
mkdirSync(out, { recursive: true });
const cli = spawnSync(process.execPath, [resolve("../cli/bin/create-agdf.js"), "inventory", "--dir", repository, "--json", "--language", "de"],
  { encoding: "utf8", maxBuffer: 1 << 28 });
const viaCli = JSON.parse(cli.stdout);

await withStdioClient({}, async (client) => {
  const tools = await client.listTools();
  const inspect = tools.tools.find((tool) => tool.name === "agdf_inspect");
  const calls = [];
  for (let index = 0; index < 3; index += 1) {
    const started = process.hrtime.bigint();
    const response = await client.callTool({ name: "agdf_inspect", arguments: {
      operation: "inventory", presentation_language: "de", working_directory: repository,
      target_source: "current_repository", primary_target: repository } });
    calls.push({ ms: Math.round(Number(process.hrtime.bigint() - started) / 1e6), response });
  }
  const last = calls.at(-1).response.structuredContent;
  if (!last?.report) { console.log(JSON.stringify(calls.at(-1).response.structuredContent?.diagnostics), JSON.stringify(calls.at(-1).response._meta ?? {}).slice(0, 800)); process.exit(2); }
  const refused = await client.callTool({ name: "agdf_inspect", arguments: {
    operation: "inventory", presentation_language: "de", working_directory: repository,
    target_source: "current_repository", primary_target: repository, run_id: "run-inventory-core-20261029-01" } });
  const facts = {
    transport: "stdio", server: "separate STDIO server process (test/stdio-entry.js, source runtime), SDK client",
    operation_listed: inspect.inputSchema.properties.operation.enum.includes("inventory"),
    definition_bytes: Buffer.byteLength(JSON.stringify(inspect)),
    outcome: last.outcome, is_error: calls.at(-1).response.isError ?? false, state: last.report.state,
    counts: last.report.counts, entries: last.report.runs.length,
    equals_cli: JSON.stringify(last.report) === JSON.stringify(viaCli),
    call_ms: calls.map((call) => call.ms),
    run_id_refused: refused.structuredContent?.outcome ?? (refused.isError ? "error" : "accepted"),
    authorizes: last.authorizes,
  };
  writeFileSync(join(out, "inventory-stdio.json"), `${JSON.stringify(facts, null, 2)}\n`);
  writeFileSync(join(out, "inventory-stdio-presentation.md"), last.presentation.markdown);
  console.log(JSON.stringify(facts, null, 2));
});
