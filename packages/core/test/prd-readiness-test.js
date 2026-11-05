import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { evaluatePrdReadiness } from "../lib/control-evaluation/prd-readiness.js";
import { evaluateApprovalSummaryReadiness, renderApprovalSummaryIssue, renderReviewableApproval } from '../lib/control-state/run-presentation-render.js';
import { languageConfigContent, resolveLanguagePreference } from '../lib/resources/language-preference.js';

// PRD approval requires a named owner and every before_prd decision resolved in one explicit table.
const root = mkdtempSync(join(tmpdir(), "agdf-prd-readiness-"));
const path = ".agdf/control/runs/run/documents/PRD.md";
mkdirSync(dirname(join(root, path)), { recursive: true });
const runState = { artefacts: new Map([["PRD", { path }]]) };
const header = "| Decision | Timing | Status | Resolution | Owner |\n|---|---|---|---|---|\n";
const readiness = (content) => {
  writeFileSync(join(root, path), content);
  return evaluatePrdReadiness(root, runState);
};
try {
  assert.deepEqual(evaluatePrdReadiness(root, { artefacts: new Map() }), { ready: false, open_decisions: ["PRD artefact is missing"] });
  assert.deepEqual(readiness("# PRD\n\nOwner: Ana\n"), { ready: false, open_decisions: ["Approval Decisions section is missing"] });
  assert.deepEqual(readiness(`# PRD\n\nOwner: Ana\n\n## Approval Decisions\n\n${header}`),
    { ready: false, open_decisions: ["Approval Decisions table is empty or malformed"] });

  const resolved = `## Approval Decisions\n\n${header}| Pricing tier | before_prd | resolved | Free tier only | Ana |\n| Cache store | later_sd | open | Decide in SD | Ben |\n`;
  assert.deepEqual(readiness(`# PRD\n\nOwner: Ana\n\n${resolved}`), { ready: true, open_decisions: [] });
  // The shipped template leaves Owner empty; the following heading must not count as the owner.
  assert.deepEqual(readiness(`# PRD\n\nOwner:\n\n## 1. Product Scope\nScope.\n\n${resolved}`),
    { ready: false, open_decisions: ["Named PRD owner"] });
  assert.deepEqual(readiness(`# PRD\n\nOwner: to confirm\n\n${resolved}`), { ready: false, open_decisions: ["Named PRD owner"] });

  const open = `## Approval Decisions\n\n${header}| Pricing tier | before_prd | open | <answer> | Ana |\n| Pricing tier | later_tp | open | Plan later | Ana |\n| Retention | later_sd | open | TBD | Ben |\n| Rollout | someday | open | x | Ana |\n`;
  assert.deepEqual(readiness(`# PRD\n\nOwner: Ana\n\n${open}`),
    { ready: false, open_decisions: ["Pricing tier", "Pricing tier", "Retention", "Rollout"] },
    "unresolved before_prd rows, duplicates, placeholder resolutions and unknown timings stay open");

  // Native regression: compound field names were accepted as ready, then the
  // presentation recommended adding a summary which same-language rendering ignores.
  const invalidCriteria = `# PRD: Open tasks\n\nOwner: Ana\nTraceability contract: criteria-chain-v1\n\n## Product Scope\nShow open tasks.\n\n## Acceptance Criteria\n- criterion_id: AC-001; expected_effective_state_visible_feedback: Only open tasks; observable_success_required_evidence: Real CLI test\n- criterion_id: AC-002; working_mode: list\n\n${resolved}`;
  const extraSummary = '\n## AGDF Approval Summary (de; source=de)\n- Ziel: Offene Aufgaben sehen.\n- Umfang: Nur Anzeige.\n- AC-001: Nur offene Aufgaben.\n- AC-002: Alle Aufgaben.\n';
  for (const locale of ['de', 'en']) {
    const languages = { artifact_language: locale, presentation_language: locale, approval_summary_required: false, approval_summary_heading: null };
    for (const suffix of ['', extraSummary]) {
      const checked = evaluateApprovalSummaryReadiness('PRD', invalidCriteria + suffix, languages, { path });
      assert.equal(checked.ready, false);
      assert.equal(checked.reason, 'approval_summary_criterion_content_missing');
      assert.deepEqual(checked.diagnostics.map(row => row.criterion_id), ['AC-001', 'AC-002']);
      assert.ok(checked.diagnostics.every(row => row.source === path && row.line > 0));
      const issue = renderApprovalSummaryIssue(checked, { path, presentationLanguage: locale });
      for (const field of ['AC-001', 'AC-002', 'observable_success', 'visible_feedback', 'expected_effective_state']) assert.ok(issue.includes(field), issue);
      assert.ok(!issue.includes('`null`') && !issue.includes('Required section') && !issue.includes('Erforderlicher Abschnitt'), issue);
    }
    for (const field of ['observable_success', 'visible_feedback', 'expected_effective_state']) {
      const corrected = invalidCriteria.replace('expected_effective_state_visible_feedback', field)
        .replace('criterion_id: AC-002; working_mode: list', `criterion_id: AC-002; ${field}: All tasks remain visible`);
      assert.equal(evaluateApprovalSummaryReadiness('PRD', corrected, languages).ready, true, field);
    }
  }
  const invalidReadiness = readiness(invalidCriteria);
  assert.equal(invalidReadiness.ready, false, JSON.stringify(invalidReadiness));
  assert.ok(invalidReadiness.open_decisions.some(issue => issue.includes('AC-001') && issue.includes('observable_success')));
  // The direct presentation failure also retains the source correction instead
  // of requesting a localized summary, even if authoring preflight was skipped.
  writeFileSync(join(root, '.agdf/control/config.json'), languageConfigContent(resolveLanguagePreference('en')));
  const report = { approval_presentation: { presentation_language: 'en', artefact: { path } } };
  assert.throws(() => renderReviewableApproval(root, report, { runId: 'run', gate: 'PRD', revisionId: 'draft' }, runState), error => {
    assert.equal(error.message, 'approval_summary_criterion_content_missing');
    assert.ok(error.recovery.includes('observable_success') && error.recovery.includes('AC-001'));
    assert.ok(!error.recovery.includes('Required section:') && !error.recovery.includes('complete localized summary'));
    return true;
  });
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("PRD readiness tests passed");
