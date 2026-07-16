import { fileURLToPath } from "node:url";
import { runSkillEvals } from "../lib/skill-evals/index.js";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const report = runSkillEvals(repoRoot);
if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
else console.log(`AGDF skill evals: ${report.status} (${report.passed}/${report.cases} cases; ${report.canonical_skills} skills; deterministic replay, not live host execution)`);
if (report.status !== "pass") process.exitCode = 1;
