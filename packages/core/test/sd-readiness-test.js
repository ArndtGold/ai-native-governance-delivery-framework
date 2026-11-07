import assert from "node:assert/strict";
import { evaluateSdDecisionContent, SD_DECISIONS_CONTRACT } from "../lib/control-evaluation/sd-readiness.js";
import { evaluateSdTraceability, evaluateTpTraceability, TRACEABILITY_CONTRACT } from "../lib/control-evaluation/traceability-readiness.js";
import { mkdtempSync, mkdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const table = "## Design Decisions\n\n| Decision | Timing | Status | Resolution | Owner |\n|---|---|---|---|---|\n";
const row = "| Cache owner | before_sd | resolved | Existing cache service | Ana |\n";
const ready = `${SD_DECISIONS_CONTRACT}\n\n${table}${row}`;
assert.equal(evaluateSdDecisionContent(ready).ready, true);
assert.equal(evaluateSdDecisionContent(ready.replaceAll("\n", "\r\n")).ready, true);
assert.equal(evaluateSdDecisionContent("# Existing SD\nArchitecture rationale.").contract, "legacy");
assert.equal(evaluateSdDecisionContent(ready + "| Test execution | later_tp | open | Choose runner in TP | Ben |\n").ready, true);
for (const content of [
  ready.replace(SD_DECISIONS_CONTRACT, ""), ready.replace("sd-decisions-v1", "sd-decisions-v2"),
  ready + `\n${SD_DECISIONS_CONTRACT}`, `${SD_DECISIONS_CONTRACT}\n`, ready + `\n${table}${row}`,
  `${SD_DECISIONS_CONTRACT}\n${table}`, ready.replace("before_sd | resolved", "before_sd | open"),
  ready.replace("before_sd | resolved", "before_sd | deferred"), ready + row,
  ready.replace("before_sd", "later_sd"), ready.replace("resolved", "approved"),
  ready.replace("Existing cache service", "TBD"), ready.replace("Ana", ""),
  ready.replace("Resolution | Owner", "Owner | Resolution"), ready.replace(" Ana |", " Ana | extra |"),
  ready.replace(" Ana |", " Ana"), ready.replace("|---|---|---|---|---|", "| invalid separator |"),
  ready + "| Test execution | later_tp | open | | Ben |\n",
]) assert.equal(evaluateSdDecisionContent(content).ready, false, content);
console.log("SD declared-decision readiness: resolved/open/malformed/legacy boundaries passed.");

// Observed native regression: a literal CLI argument is not an unfinished author prompt.
const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-sd-literal-')));
try {
  const base = '.agdf/control/runs/literal/documents/';
  mkdirSync(join(root, base), { recursive: true });
  const state = { artefacts: new Map(['PRD', 'SD', 'TP'].map(type => [type, { path: base + type + '.md' }])) };
  const put = (type, text) => writeFileSync(join(root, base, type + '.md'), text);
  put('PRD', `${TRACEABILITY_CONTRACT}\n## Acceptance Criteria\n- criterion_id: AC-001; observable_success: Completion preserves stored tasks\n`);
  const sd = `${TRACEABILITY_CONTRACT}\n## Architecture Decisions\n- SDD-001: Route \`done <id>\` through the store; rationale: keep completion deterministic; consequence: unknown IDs return failure without a write.\n\n## Acceptance Traceability\n| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |\n|---|---|---|---|---|\n| AC-001 | Store validates IDs | src/store.js | SDD-001 | Unknown IDs leave bytes unchanged |\n`;
  for (const command of ['done <id>', 'add <title>', 'node cli.js done <task_id>', 'cli --file <path>']) {
    put('SD', sd.replace('done <id>', command));
    assert.equal(evaluateSdTraceability(root, state).ready, true, command);
  }
  for (const incomplete of [
    sd.replace('keep completion deterministic', '<why>'),
    sd.replace('keep completion deterministic', '`<why>`'),
    sd.replace('keep completion deterministic', 'TBD'),
    sd.replace('unknown IDs return failure without a write.', '<consequence>'),
    sd.replace('`done <id>`', 'done <id>'),
    sd.replace('rationale: keep completion deterministic;', ''),
  ]) {
    put('SD', incomplete);
    assert.equal(evaluateSdTraceability(root, state).ready, false, incomplete);
  }

  const withDecision = detail => sd.replace(/^- SDD-001:.*$/mu, '- SDD-001: ' + detail);
  const rationale = 'rationale: one versioned local store keeps ownership explicit';
  const consequence = 'consequence: incompatible changes require a deliberate migration.';
  const suffix = `; ${rationale}; ${consequence}`;
  // Native regression: quoted type metavariables describe a concrete versioned
  // schema; they do not mean that its rationale/consequence remains unauthored.
  const nativeSchema = 'Store versioned JSON with schema `{ "version": 1, "tasks": [{ "id": "<uuid>", "text": "<non-empty string>", "completed": false }] }`';
  for (const example of [
    nativeSchema,
    'Use JSON schema example: `{"value":"<string>","count":"<non-negative integer>","ratio":"<positive number>","active":"<boolean>","empty":"<null>","nested":["<object>","<array>"]}`',
    'Use JSON example `[{"id":"<uuid>","text":"<non-empty string>"}]`',
    'Use schema `{"todo":"<string>","TBD":"<uuid>","to confirm":{"owner":"<non-empty string>"}}`',
  ]) {
    put('SD', withDecision(example + suffix));
    const result = evaluateSdTraceability(root, state);
    assert.equal(result.ready, true, JSON.stringify({ example, result }));
  }
  put('SD', withDecision(nativeSchema + suffix.replace('consequence:', 'trade-off:')));
  assert.equal(evaluateSdTraceability(root, state).ready, true, 'The existing trade-off alias remains supported.');
  for (const [detail, field, token] of [
    ['Use schema `{"id":"<choose UUID or integer>"}`' + suffix, 'decision', '<choose UUID or integer>'],
    ['Use schema `{"id":"<uuid>","encoding":"<choose encoding>"}`' + suffix, 'decision', '<choose encoding>'],
    ['Use schema `{"id":"<why>"}`' + suffix, 'decision', '<why>'],
    ['Use schema `{"<uuid>":"value"}`' + suffix, 'decision', '<uuid>'],
    ['Use schema `{"<why>":"<string>"}`' + suffix, 'decision', '<why>'],
    ['Use schema `{"\\u003cwhy>":"<string>"}`' + suffix, 'decision', '<why>'],
    ['Use schema `{id:"<uuid>"}`' + suffix, 'decision', '<uuid>'],
    ['Use schema `"<uuid>"`' + suffix, 'decision', '<uuid>'],
    ['Use `format("<uuid>")`' + suffix, 'decision', '<uuid>'],
    ['Use `{"id":"<uuid>"}`' + suffix, 'decision', '<uuid>'],
    ['Use schema `{"id":"<uuid>","owner":"TBD"}`' + suffix, 'decision', 'TBD'],
    ['Use schema `{"todo":"<string>","owner":"TBD"}`' + suffix, 'decision', 'TBD'],
    ['Use schema `{"todo":"<string>","encoding":"<choose encoding>"}`' + suffix, 'decision', '<choose encoding>'],
    ['Store JSON; rationale: use schema `{"id":"<uuid>"}`; ' + consequence, 'rationale', '<uuid>'],
    ['Store JSON; rationale: `<why>`; ' + consequence, 'rationale', '<why>'],
    ['Store JSON; ' + rationale + '; consequence: TODO', 'consequence', 'TODO'],
    ['<why' + suffix, 'decision', '<why'],
    ['<' + suffix, 'decision', '<'],
    [nativeSchema + '; rationale: <why; ' + consequence, 'rationale', '<why'],
    [nativeSchema + '; rationale: <; ' + consequence, 'rationale', '<'],
    [nativeSchema + '; ' + rationale + '; consequence: <trade-off', 'consequence', '<trade-off'],
    [nativeSchema + '; ' + rationale + '; consequence: <', 'consequence', '<'],
  ]) {
    put('SD', withDecision(detail));
    const result = evaluateSdTraceability(root, state);
    assert.equal(result.ready, false, detail);
    assert.ok(result.open_items.some(item => item.includes(`unresolved author prompts in ${field}:`)
      && item.includes(JSON.stringify(token))), JSON.stringify(result));
    assert.ok(!result.open_items.some(item => item.includes('is missing a nonempty')),
      'An unresolved token does not falsely report absent rationale/consequence fields.');
    if (token === '<choose encoding>') assert.ok(!result.open_items.some(item => item.includes('"<uuid>"')),
      'The diagnosis identifies the unresolved choice, not an adjacent valid schema type.');
  }
  for (const [detail, missing] of [
    [nativeSchema + '; ' + consequence, 'rationale'],
    [nativeSchema + '; ' + rationale, 'consequence'],
    [nativeSchema + '; rationale: ; ' + consequence, 'rationale'],
    ['Use schema `{"note":"; rationale: concrete text"}`; ' + consequence, 'rationale'],
  ]) {
    put('SD', withDecision(detail));
    const result = evaluateSdTraceability(root, state);
    assert.equal(result.ready, false, detail);
    assert.ok(result.open_items.some(item => item.includes(`is missing a nonempty ${missing}: field`)), JSON.stringify(result));
  }
  put('SD', withDecision('rationale: concrete motivation; ' + consequence));
  assert.ok(evaluateSdTraceability(root, state).open_items.some(item => item.includes('needs a concrete decision statement')));
  for (const [detail, duplicate] of [
    ['Store JSON; rationale: ; ' + rationale + '; ' + consequence, 'rationale'],
    ['Store JSON; ' + rationale + '; rationale: ; ' + consequence, 'rationale'],
    ['Store JSON; ' + rationale + '; rationale: another concrete reason; ' + consequence, 'rationale'],
    ['Store JSON; ' + rationale + '; consequence: ; ' + consequence, 'consequence'],
    ['Store JSON; ' + rationale + '; trade-off: concrete trade-off; ' + consequence, 'consequence'],
  ]) {
    put('SD', withDecision(detail));
    const result = evaluateSdTraceability(root, state);
    assert.equal(result.ready, false, detail);
    assert.ok(result.open_items.some(item => item.includes(`exactly one nonempty ${duplicate}: field; found 2 declarations`)), JSON.stringify(result));
  }
  put('SD', withDecision(nativeSchema + suffix).replace('| SDD-001 |', '| SDD-999 |'));
  assert.ok(evaluateSdTraceability(root, state).open_items.some(item => item.includes('undeclared decision SDD-999')),
    'A valid schema example does not bypass real SD mapping defects.');
  put('SD', sd);
  const tp = `${TRACEABILITY_CONTRACT}\n## Task List\n| task_id | task |\n|---|---|\n| T-001 | Implement completion |\n\n## Verification Traceability\n| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |\n|---|---|---|---|---|---|\n| AC-001 | SDD-999 | T-001 | SCN-001 | SDD-001 preserves bytes for an unknown ID | Observed JSON bytes and exit code |\n`;
  put('TP', tp);
  const wrong = evaluateTpTraceability(root, state);
  assert.equal(wrong.ready, false, JSON.stringify(wrong));
  assert.ok(wrong.open_items.some(item => item.includes('SCN-001 for AC-001 has design_decision_id SDD-999')
    && item.includes('mapped SD IDs: SDD-001') && item.includes('Scenario prose cannot replace this cell')));
  put('TP', tp.replace('| AC-001 | SDD-999 |', '| AC-001 | SDD-001 |'));
  assert.equal(evaluateTpTraceability(root, state).ready, true);
} finally { rmSync(root, { recursive: true, force: true }); }
console.log('SD literal command arguments, preserved placeholder guards and actionable TP mapping diagnostics passed.');
console.log('SD JSON schema metavariables: explicit example/value scope, precise unresolved-token and missing-field diagnostics passed.');
