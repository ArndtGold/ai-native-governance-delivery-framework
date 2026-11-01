// Shared assertions: run early during build and retain coverage in the full smoke suite.
import "../../../scripts/support/english-locale.js";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import assert from 'node:assert/strict';
import { structuredCurrentRun } from '../../core/test/fixtures/current-structured-run.js';
import { withSyntheticQaContent } from '../../core/test/fixtures/decision-content.js';
import { evaluateGateCheck } from '#agdf-core/control-evaluation/gate-check.js';

const packageRoot = new URL("..", import.meta.url);
const binPath = fileURLToPath(new URL("./bin/create-agdf.js", packageRoot));
const generatedRoot = fileURLToPath(new URL("./generated/", packageRoot));
function runJson(args) {
  try {
    return JSON.parse(execFileSync(process.execPath, [binPath, ...args], { encoding: "utf8", stdio: "pipe" }));
  } catch (error) {
    if (error.stdout) return JSON.parse(error.stdout.toString());
    throw error;
  }
}

export function checkGeneratedGateContracts() {
  const transitionSkillPaths = [
    [join(generatedRoot, "plugins", "agdf", "skills", "gate-check", "SKILL.md"), "`../../meta/contracts/interaction.md`"],
    [join(generatedRoot, "plugins", "copilot", "agdf", "skills", "agdf-gate-check", "SKILL.md"), "`../contracts/interaction.md`"],
    [join(generatedRoot, ".opencode", "skills", "agdf-gate-check", "SKILL.md"), "`../../contracts/interaction.md`"],
  ];
  const transitionContractPaths = [
    join(generatedRoot, "plugins", "agdf", "meta", "contracts", "interaction.md"),
    join(generatedRoot, "plugins", "copilot", "agdf", "skills", "contracts", "interaction.md"),
    join(generatedRoot, ".opencode", "contracts", "interaction.md"),
  ];
  const transitionLocalePaths = [
    join(generatedRoot, "plugins", "agdf", "meta", "agdf-interaction-locales.json"),
    join(generatedRoot, "plugins", "copilot", "agdf", "skills", "agdf-interaction-locales.json"),
    join(generatedRoot, ".opencode", "agdf-interaction-locales.json"),
  ];

  for (const [path, interactionReference] of transitionSkillPaths) {
    const content = readFileSync(path, "utf8");
    const hasSingleInteractionReference = (text) => text.split(interactionReference).length - 1 === 1;
    if (!content.includes("Dispatch is non-authorizing.")
      || !content.includes("`skill.gate-check`: dispatch before inspection; changes: `intake`.")
      || !content.includes("`delivery.start`: resolve target once; unresolved/mismatch: orient and stop.")
      || !content.includes("For a result with `terminal: true`")
      || !content.includes("the entire assistant response must consist only of host_action.text, copied verbatim")
      || !content.includes("Add no question, explanation, heading, citation, link or other surrounding text")
      || !content.includes("Fallback requires trusted explicit `instruction_only` runtime evidence.")
      || !content.includes("Bind Run only by explicit selection, confirmed continuation or unequivocal UR scope.")
      || !content.includes("`expected_revision_id`")
      || !content.includes("`continue_delivery: true`")
      || !hasSingleInteractionReference(content)
      || content.includes("Consume the canonical `approval_presentation` verbatim")
      || content.includes("`status_presentation.markdown` verbatim")
      || content.includes("| Run status | Value |")
      || content.includes("Surface behavior:")) {
      throw new Error(`Generated gate-check surface must preserve compact orchestration and single contract ownership: ${path}`);
    }
    for (const invalid of [
      `${content}\n- ${interactionReference}\n`,
      content.replace(interactionReference, ""),
      content.replace(interactionReference, interactionReference.replace("contracts/", "other/")),
    ]) {
      if (hasSingleInteractionReference(invalid)) {
        throw new Error(`Generated gate-check reference check must reject duplicate, missing and wrong contract paths: ${path}`);
      }
    }
  }

  for (const path of transitionContractPaths) {
    const content = readFileSync(path, "utf8");
    if (!content.includes("## Prepared decision presentation")
      || !content.includes("one immutable Markdown decision document")
      || !content.includes("presentation.deliver")
      || !content.includes("full_markdown")
      || !content.includes("current-surface")
      || content.includes("answers exactly three user questions")
      || !content.includes("never bind an earlier reply to a subsequently prepared revision.")) {
      throw new Error(`Generated runtime contract must preserve the transition-card and status-projection boundary: ${path}`);
    }
  }

  const canonicalLocales = readFileSync(transitionLocalePaths[0], "utf8");
  for (const path of transitionLocalePaths) {
    const expected = path === transitionLocalePaths[1] ? JSON.stringify(JSON.parse(canonicalLocales)) + "\n" : canonicalLocales;
    if (readFileSync(path, "utf8") !== expected) {
      throw new Error(`Generated locale registry must preserve values and its declared projection: ${path}`);
    }
  }
  const inventory = JSON.parse(readFileSync(join(generatedRoot, 'plugins/copilot/agdf/.agdf-payload-inventory.json'), 'utf8'));
  if (inventory.entries.find(row => row.destination === 'skills/agdf-interaction-locales.json')?.rule !== 'compact_json') {
    throw Error('Compacted locale projection must declare compact_json in the existing payload inventory');
  }
}

export function checkLateGateTransitions() {
  const disposers = [], lifecycle = { after: dispose => disposers.push(dispose) };
  try {
    const run = structuredCurrentRun(lifecycle);
    const accepted = result => { assert.equal(result.outcome, 'accepted', JSON.stringify(result)); return result; };
    const inspect = () => evaluateGateCheck(run.f.root, { runId: run.id });
    const step = (name, decision = 'pass') => run.step('internal', `# ${name}\nDecision: ${decision}\nSynthetic exact build contract prerequisite.\n`,
      { internal_step: name, decision, ...(decision === 'not_applicable' ? { reason: 'Synthetic attempt to skip a mandatory step' } : {}) });
    // Current command ownership makes previously forged premature-approval/table
    // states unconstructible. Assert the actual refusals and derived transitions.
    assert.equal(inspect().current_gate, 'Brownfield Analysis');
    assert.equal(run.present('QA').outcome, 'rejected');
    accepted(step('Brownfield Analysis'));
    assert.equal(inspect().current_gate, 'CD+Tests');
    assert.equal(step('CD+Tests', 'not_applicable').outcome, 'rejected');
    accepted(step('CD+Tests'));
    assert.equal(inspect().current_gate, 'CR');
    assert.equal(step('CR', 'not_applicable').outcome, 'rejected');
    accepted(step('CR'));
    assert.equal(run.present('QA').outcome, 'rejected', 'TP and clean reviews are mandatory');
    accepted(step('TP Review'));
    assert.equal(run.present('QA').outcome, 'rejected', 'Clean review is still missing');
    accepted(step('Clean Implementation Review'));
    assert.equal(inspect().current_gate, 'QA');
    assert.equal(run.present('QA').outcome, 'rejected', 'No durable passing QA report');
    const text = decision => withSyntheticQaContent(`# QA: Build contract\nDecision: ${decision}\n\n## Scope\nSynthetic current transition.\n## Evidence\nActual current command progression.\n## Risks\nnone\n`);
    accepted(run.record('QA', text('revise') + '\n## Normalized Findings\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n| BUILD-1 | evidence_gap | evidence_obligation | open | Synthetic missing observation | Collect the missing observation |\n'));
    assert.equal(run.present('QA').outcome, 'rejected');
    accepted(run.record('QA', text('pass'), true));
    accepted(run.approve('QA'));
    assert.equal(inspect().current_gate, 'UAT');
    assert.equal(inspect().missing_approval, 'Approval: UAT');
    accepted(run.approve('UAT'));
    const final = inspect();
    assert.equal(final.current_gate, 'OR');
    assert(final.forbidden.includes('commit, push, open PR or release automatically'));
    assert(!/^## (?:Approvals|Artefacts|Artefact Chain|Evidence)\s*$/mu.test(run.content()));
  } finally { for (const dispose of disposers.reverse()) dispose(); }
}
