import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { STAGED_ADAPTER_VERSION, loadCorpus, recordObservation } from "../lib/proportionality-benchmark/index.js";

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}
function safeErrorMessage(error) {
  const known = {
    GENERATOR_TIMEOUT: "read-only process timed out",
    PROPORTIONALITY_OUTPUT_INVALID: "agent output failed the structured contract",
    PROPORTIONALITY_REDACTION_FAILED: "agent output failed redaction",
    PROPORTIONALITY_MUTATION: "agent mutated the disposable fixture",
  };
  return known[error?.code] ?? "agent execution failed";
}
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const surface = option("--surface");
const model = option("--model");
const seriesId = option("--series");
const profileId = option("--profile") ?? "legacy-v1";
const selectedCase = option("--case");
const selectedScenario = option("--scenario");
const repeats = Number(option("--repeats") ?? 3);
const timeoutMs = Number(option("--timeout-ms") ?? 120000);
const persist = process.argv.includes("--persist");
if (surface !== "codex" || !model || !seriesId || !Number.isInteger(repeats) || repeats < 3) {
  throw new Error("usage: record-proportionality-benchmark --profile legacy-v1|staged-v2 --surface codex --model <model> --series <id> [--case PB-NNN] [--scenario id] [--repeats >=3] [--timeout-ms 120000] [--persist]");
}
const corpus = loadCorpus(repoRoot, profileId);
const packageVersion = JSON.parse(readFileSync(join(repoRoot, "create-agdf", "package.json"), "utf8")).version;
const fixture = profileId === "staged-v2" ? corpus.fixtures : corpus.fixtures.fixtures[corpus.manifest.fixture_id];
const cases = corpus.cases.filter((item) => (!selectedCase || item.case_id === selectedCase) && (!selectedScenario || item.scenario_id === selectedScenario));
if (!cases.length) throw new Error(`unknown case/scenario ${selectedScenario ?? selectedCase}`);
const results = [];
const attemptsPath = join(repoRoot, "evals", "proportionality", "observations", seriesId, "attempts.json");
const previousAttempts = persist && existsSync(attemptsPath) ? JSON.parse(readFileSync(attemptsPath, "utf8")) : { attempts: [] };
if (previousAttempts.profile_id && previousAttempts.profile_id !== profileId) throw new Error(`attempt provenance mismatch: ${attemptsPath}`);
const attempts = previousAttempts.attempts ?? [];
let attemptCount = attempts.length;
function persistAttempts() {
  if (!persist) return;
  const directory = join(repoRoot, "evals", "proportionality", "observations", seriesId);
  mkdirSync(directory, { recursive: true });
  writeFileSync(attemptsPath, `${JSON.stringify({ schema_version: profileId === "staged-v2" ? "2" : "1", profile_id: profileId, series_id: seriesId, attempts }, null, 2)}\n`, "utf8");
}
for (const testCase of cases) {
  for (let repeat = 1; repeat <= repeats; repeat += 1) {
    const observationKey = profileId === "staged-v2" ? testCase.scenario_id.replaceAll(":", "__") : testCase.case_id;
    const persistPath = persist ? join(repoRoot, "evals", "proportionality", "observations", seriesId, observationKey, `${repeat}.json`) : undefined;
    if (persistPath && existsSync(persistPath)) {
      const existing = JSON.parse(readFileSync(persistPath, "utf8"));
      if (
        existing.series_id !== seriesId
        || existing.case_id !== testCase.case_id
        || existing.repeat !== repeat
        || existing.surface !== surface
        || existing.model !== model
        || existing.agdf_version !== packageVersion
        || existing.baseline_version !== corpus.baseline.baseline_version
        || (profileId === "staged-v2" && (
          existing.profile_id !== profileId
          || existing.scenario_id !== testCase.scenario_id
          || existing.corpus_version !== corpus.manifest.corpus_version
          || existing.fixture_version !== corpus.manifest.fixture_version
          || existing.adapter_version !== STAGED_ADAPTER_VERSION
        ))
      ) {
        throw new Error(`existing observation provenance mismatch: ${persistPath}`);
      }
      results.push(existing);
      continue;
    }
    let completed = false;
    while (!completed && attemptCount < corpus.manifest.attempt_limit) {
      attemptCount += 1;
      try {
        results.push(await recordObservation({
          repoRoot, testCase, fixture, seriesId, repeat, surface, model,
          agdfVersion: packageVersion, baselineVersion: corpus.baseline.baseline_version, timeoutMs, persistPath,
        }));
        attempts.push({ attempt: attemptCount, case_id: testCase.case_id, ...(testCase.scenario_id ? { scenario_id: testCase.scenario_id } : {}), repeat, status: "valid" });
        persistAttempts();
        completed = true;
      } catch (error) {
        attempts.push({ attempt: attemptCount, case_id: testCase.case_id, ...(testCase.scenario_id ? { scenario_id: testCase.scenario_id } : {}), repeat, status: "invalid", code: error.code ?? "EXECUTION_ERROR", message: safeErrorMessage(error) });
        persistAttempts();
        if (["PROPORTIONALITY_MUTATION", "PROPORTIONALITY_REDACTION_FAILED"].includes(error.code)) throw error;
      }
    }
    if (!completed) throw new Error(`attempt budget ${corpus.manifest.attempt_limit} exhausted`);
  }
}
persistAttempts();
process.stdout.write(`${JSON.stringify({
  schema_version: profileId === "staged-v2" ? "2" : "1", profile_id: profileId, series_id: seriesId, surface, model, persisted: persist,
  valid_observations: results.length, attempts: attemptCount, results,
}, null, 2)}\n`);
