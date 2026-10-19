// Compare and promote for the MCP ergonomics evaluation (SDD-012, SDD-014).
//   compare:  node evals/scripts/compare-mcp-ergonomics.js --baseline <dir> [--protocol <file>] [--native <file>]
//   promote:  node evals/scripts/compare-mcp-ergonomics.js --promote --protocol <file> [--native <file>] --out <dir>
//   tools:    node evals/scripts/compare-mcp-ergonomics.js --tools-before <file> --tools-after <file>
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { aggregateNative, compareNative, compareProtocol, compareToolCaptures } from "../mcp-ergonomics/lib/aggregate.js";
import { redactionViolations } from "../mcp-ergonomics/lib/redaction.js";
import { assembleBaseline, renderReport } from "../mcp-ergonomics/lib/report.js";
import { repoRoot } from "../mcp-ergonomics/lib/protocol-harness.js";

const args = process.argv.slice(2);
const option = name => { const index = args.indexOf(name); return index === -1 ? undefined : args[index + 1]; };
const readJson = path => JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
const FINDINGS = join(repoRoot, "evals", "mcp-ergonomics", "findings-map.v1.json");

export function promote({ protocol, native, out }) {
  const baseline = assembleBaseline({ protocol, native, findingsMap: JSON.parse(readFileSync(FINDINGS, "utf8")) });
  const json = `${JSON.stringify(baseline, null, 2)}\n`;
  const report = renderReport(baseline);
  const violations = [...redactionViolations(json), ...redactionViolations(report)];
  if (violations.length) return { promoted: false, violations: [...new Set(violations)] };
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "baseline.json"), json, "utf8");
  writeFileSync(join(out, "REPORT.md"), report, "utf8");
  return { promoted: true, out, complete: baseline.complete };
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  let result;
  if (args.includes("--promote")) {
    if (!option("--protocol") || !option("--out")) throw new Error("usage: --promote --protocol <file> [--native <file>] --out <dir>");
    result = promote({ protocol: readJson(option("--protocol")), native: option("--native") ? readJson(option("--native")) : null, out: resolve(repoRoot, option("--out")) });
    if (!result.promoted) process.exitCode = 1;
  } else if (option("--tools-before")) {
    result = compareToolCaptures(readJson(option("--tools-before")), readJson(option("--tools-after")));
    if (!result.identical) process.exitCode = 1;
  } else if (option("--baseline")) {
    const baseline = readJson(join(option("--baseline"), "baseline.json"));
    result = {};
    if (option("--protocol")) result.protocol = compareProtocol(baseline.protocol, readJson(option("--protocol")));
    if (option("--native")) {
      const fresh = readJson(option("--native"));
      result.native = compareNative(baseline.native?.cells ?? {}, aggregateNative(fresh.schedule?.sessions ?? []));
    }
    if (Object.values(result).some(entry => entry.status !== "unchanged")) process.exitCode = 1;
  } else {
    throw new Error("usage: --baseline <dir> [--protocol <file>] [--native <file>] | --promote ... | --tools-before <file> --tools-after <file>");
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
