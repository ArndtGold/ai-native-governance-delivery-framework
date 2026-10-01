import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { evaluateSeries, loadCorpus, observationKey, profileUsage, renderMarkdown } from "../lib/proportionality-benchmark/index.js";

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const seriesId = option("--series");
const profileId = option("--profile") ?? "legacy-v1";
if (!seriesId || !/^[a-z0-9][a-z0-9._-]{2,79}$/i.test(seriesId)) throw new Error(`usage: run-proportionality-benchmark --profile ${profileUsage()} --series <id> [--json-out path] [--markdown-out path]`);
const corpus = loadCorpus(repoRoot, profileId);
const root = join(repoRoot, "evals", "proportionality", "observations", seriesId);
const observations = [];
for (const testCase of corpus.cases) {
  const key = observationKey(profileId, testCase);
  const directory = join(root, key);
  try {
    for (const name of readdirSync(directory).filter((item) => item.endsWith(".json")).sort()) observations.push(JSON.parse(readFileSync(join(directory, name), "utf8")));
  } catch (error) { if (error.code !== "ENOENT") throw error; }
}
const report = evaluateSeries({ repoRoot, corpus, observations, minimumRepeats: corpus.manifest.required_repeats });
const markdown = renderMarkdown(report);
if (option("--json-out")) writeFileSync(option("--json-out"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
if (option("--markdown-out")) writeFileSync(option("--markdown-out"), markdown, "utf8");
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (report.status !== "pass") process.exitCode = 1;
