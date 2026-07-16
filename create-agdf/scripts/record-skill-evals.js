import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { fingerprintSkillCases } from "../lib/skill-evals/index.js";
import { recordLiveCase, surfaceRuntime } from "../lib/skill-evals/live-recorder.js";

function option(name) { const index = process.argv.indexOf(name); return index === -1 ? undefined : process.argv[index + 1]; }
const surface = option("--surface");
const caseId = option("--case");
if (!surface || !["codex", "claude"].includes(surface) || !caseId) throw new Error("usage: record-skill-evals --surface codex|claude --case <case-id> [--model <model>] [--persist]");
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const cases = readdirSync(join(repoRoot, "evals", "cases")).filter((name) => name.endsWith(".json")).sort().flatMap((name) => JSON.parse(readFileSync(join(repoRoot, "evals", "cases", name), "utf8")));
const testCase = cases.find((item) => item.case_id === caseId);
if (!testCase) throw new Error(`unknown eval case: ${caseId}`);
const definition = JSON.parse(readFileSync(join(repoRoot, "plugin", "meta", "agdf-plugin.definition.json"), "utf8"));
const catalog = JSON.parse(readFileSync(join(repoRoot, "evals", "fixtures", "catalog.json"), "utf8"));
const fingerprint = fingerprintSkillCases(repoRoot, definition, testCase.target_skill, cases);
const persistPath = process.argv.includes("--persist") ? join(repoRoot, "evals", "observations", "live", surface, `${caseId}.json`) : undefined;
const result = await recordLiveCase({ repoRoot, testCase, catalog, fingerprint, surface, model: option("--model"), persistPath });
process.stdout.write(`${JSON.stringify({ schema_version: 1, surface, runtime: surfaceRuntime(surface), persisted: Boolean(persistPath), ...result }, null, 2)}\n`);
if (result.grade.status !== "pass") process.exitCode = 1;
