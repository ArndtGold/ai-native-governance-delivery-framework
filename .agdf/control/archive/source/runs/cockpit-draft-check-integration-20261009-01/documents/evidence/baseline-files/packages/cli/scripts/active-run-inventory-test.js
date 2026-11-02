import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMcpDispatchRuntime } from "../lib/mcp-dispatch-runtime.js";
import { createControlInspectService } from "#agdf-core/control-inspect/service.js";
import { interactionLocales, pluginDefinition } from "../lib/cli/runtime-context.js";
import { repository, addRun, treeDigest } from "./control-maintenance-fixtures.js";
import { loadRequestActivationCorpus } from "../../../evals/lib/request-activation-evals/index.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const contract = readFileSync(join(repoRoot, "plugins/agdf/meta/contracts/request-activation.md"), "utf8");
const { cases } = loadRequestActivationCorpus(repoRoot);
// Semantic intent is evaluated by the existing corpus, not a new keyword classifier.
for (const [locale, text] of [["de", "Zeige die aktiven AGDF-Runs in diesem Projekt"], ["en", "Show the active AGDF runs in this project"]]) {
  const scenario = cases.find((item) => item.case_id === `${locale}-active-runs-current-project`);
  assert.equal(scenario.user_text, text);
  assert.equal(scenario.expected.operation_id, "control.doctor");
  assert.equal(scenario.expected.selected_skill, "none");
  assert.ok(scenario.expected.forbidden_callbacks.includes("dispatcher_v1"));
  assert.ok(contract.includes(text));
}
assert.match(contract, /target_source: current_repository/u);
assert.match(contract, /operation: doctor.*, `all_active: true`/u);

const base = mkdtempSync(join(tmpdir(), "agdf-active-run-inventory-"));
const runtime = createMcpDispatchRuntime({ surface: "claude" });
const tool = runtime.tool("agdf_inspect");
const makeRepository = (name, options) => {
  const root = repository(base, name, options);
  execFileSync("git", ["init", "--quiet", root]);
  return root;
};
const inspect = (root, language, target = true) => tool.execute(tool.parse({
  operation: "doctor", all_active: true, presentation_language: language,
  working_directory: root,
  ...(target ? { primary_target: root, target_source: "current_repository" } : {}),
}));
try {
  const absent = makeRepository("absent", { scaffold: false });
  const empty = makeRepository("empty");
  const single = makeRepository("single"); addRun(single, "one");
  const multiple = makeRepository("multiple");
  addRun(multiple, "first"); addRun(multiple, "second", { sealed: true });
  addRun(multiple, "completed", { transform: (text) => text.replace("lifecycle: active", "lifecycle: completed") });
  const incomplete = makeRepository("incomplete"); addRun(incomplete, "known");
  const broken = addRun(incomplete, "broken"); writeFileSync(broken, "malformed run record\n");
  for (const language of ["en", "de", "de-DE", "fr"]) {
    for (const [root, state, ids] of [[absent, "absent", []], [empty, "complete", []], [single, "complete", ["one"]], [multiple, "complete", ["first", "second"]], [incomplete, "incomplete", ["known"]]]) {
      const before = treeDigest(root);
      const result = inspect(root, language);
      assert.equal(result.outcome, "inspect_result", JSON.stringify(result));
      assert.equal(result.terminal, false);
      assert.equal(result.authorizes, false);
      assert.equal(result.report.inventory.state, state);
      assert.deepEqual(result.report.runs.map((run) => run.run_id), ids);
      assert.equal(result.host_action.source, "presentation.markdown");
      assert.equal(result.host_action.may_request_run_or_evidence, false);
      const markdown = result.presentation.markdown;
      for (const id of ids) assert.ok(markdown.includes(`- \`${id}\``));
      assert.ok(!markdown.includes("completed"));
      assert.doesNotMatch(markdown, /Approval:|Choose the delivery run|Nutzer.*Freigabe/u);
      const german = language.startsWith("de");
      if (state === "absent") assert.match(markdown, german ? /keinen Ordner/u : /no .agdf\/control directory/u);
      else if (!ids.length) assert.match(markdown, german ? /Keine aktiven/u : /No active/u);
      else assert.match(markdown, german ? /aktive AGDF-Runs gefunden/u : /active AGDF runs found/u);
      if (state === "incomplete") assert.match(markdown, german ? /Gesamtzahl.*unbekannt/u : /total number.*unknown/u);
      if (ids.includes("one") || ids.includes("first")) assert.match(markdown, /AGDF_RUN_SEAL_INVALID/u);
      assert.equal(treeDigest(root), before, "inventory must not write any control or project file");
    }
  }
  const unresolved = inspect(multiple, "de", false);
  assert.equal(unresolved.outcome, "target_unresolved", "cwd alone still cannot bind the target");
  assert.equal(unresolved.report, null);
  assert.equal(unresolved.terminal, true);
  const other = inspect(empty, "en");
  const mismatch = tool.execute(tool.parse({ operation: "doctor", all_active: true, presentation_language: "en",
    working_directory: empty, primary_target: multiple, target_source: "current_repository" }));
  assert.equal(mismatch.outcome, "target_unresolved");
  assert.equal(other.report.runs.length, 0);
  const failed = createControlInspectService({ evaluateDoctor() { throw new Error("fixture read failure"); } })({
    operation: "doctor", allActive: true, presentationLanguage: "de", workingDirectory: multiple,
    primaryTarget: multiple, targetSource: "current_repository", interactionLocales,
    expectedVersion: pluginDefinition.version,
  });
  assert.equal(failed.outcome, "evaluator_error");
  assert.equal(failed.terminal, true);
  assert.equal(failed.report, null, "inspection failure cannot become an empty inventory");
  assert.equal(failed.presentation, null);
  const originalRunId = process.env.AGDF_RUN_ID;
  try {
    process.env.AGDF_RUN_ID = "completed";
    assert.deepEqual(inspect(multiple, "de").report.runs.map((run) => run.run_id), ["first", "second"]);
  } finally {
    if (originalRunId === undefined) delete process.env.AGDF_RUN_ID;
    else process.env.AGDF_RUN_ID = originalRunId;
  }
} finally { rmSync(base, { recursive: true, force: true }); }
console.log("Active-run inventory routing corpus, target binding, localized output and read-only runtime tests passed.");
