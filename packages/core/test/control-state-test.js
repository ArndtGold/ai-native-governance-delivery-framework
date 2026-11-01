import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, writeFileSync } from 'node:fs';
import { currentFixture, currentRun } from './fixtures/current-run.js';
import { clarifiedUr } from './planned-fixtures.js';
import { validateGateApprovalResponse } from '../lib/control-state/gate-approval-validator.js';
import { parseRunState, RUN_ID_PATTERN } from '../lib/control-state/run-state-parser.js';
import { validateRunIdentity, RUN_ID_PATTERN as identityRunIdPattern } from '../lib/control-state/run-identity.js';
import { buildBreadcrumb, buildTransitionNarration, collapseInternalState } from '../lib/interaction-presentation.js';
import { evaluateGateCheck, postApprovalTransition } from '../lib/control-evaluation/gate-check.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { canonicalJson } from '../lib/control-state/approval-command-contract.js';
const localeRegistry = JSON.parse(readFileSync(new URL('../../../plugins/agdf/meta/agdf-interaction-locales.json', import.meta.url), 'utf8'));

test('exact gate reply validation preserves every deliberate-response boundary', () => {
  const approvalCandidate = Object.freeze({
    response: "Approval: TP",
    responseOrigin: "deliberate_user_input",
    expectedApproval: "Approval: TP",
    expectedRunId: "run-a",
    currentRunId: "run-a",
    expectedGate: "TP",
    currentGate: "TP",
    expectedRevisionId: "revision-a",
    currentRevisionId: "revision-a",
    durableArtefactReady: true,
  });
  assert.deepEqual(validateGateApprovalResponse(approvalCandidate), { accepted: true, reason: "accepted" });
  assert.deepEqual(validateGateApprovalResponse({ ...approvalCandidate, responseOutcome: "approve" }), { accepted: true, reason: "accepted" });
  assert.deepEqual(validateGateApprovalResponse({ ...approvalCandidate, response: "Approve", responseOutcome: "approve" }), { accepted: false, reason: "wrong_or_non_approval_response" });
  for (const [name, override, reason] of [
    ["unavailable adapter result", { response: undefined, noResponse: true }, "no_response"],
    ["non-deliberate response", { responseOrigin: "hook" }, "non_deliberate_response"],
    ["empty response", { response: "" }, "empty_response"],
    ["revise", { responseOutcome: "revise" }, "revision_requested"],
    ["decline", { responseOutcome: "decline" }, "declined"],
    ["cancel", { responseOutcome: "cancel" }, "cancelled"],
    ["timeout", { timedOut: true }, "timed_out"],
    ["invalid", { response: "Approve" }, "wrong_or_non_approval_response"],
    ["stale outcome", { responseOutcome: "stale" }, "stale_response"],
    ["formula mismatch", { expectedApproval: "Approval: QA" }, "approval_formula_mismatch"],
    ["stale gate", { currentGate: "QA" }, "changed_or_wrong_gate"],
    ["changed run", { currentRunId: "run-b" }, "changed_or_wrong_run"],
    ["stale revision", { currentRevisionId: "revision-b" }, "stale_revision"],
    ["missing artefact", { durableArtefactReady: false }, "durable_artefact_not_ready"],
  ]) {
    const before = JSON.stringify(approvalCandidate);
    assert.deepEqual(
      validateGateApprovalResponse({ ...approvalCandidate, ...override }),
      { accepted: false, reason },
      name,
    );
    assert.equal(JSON.stringify(approvalCandidate), before, `${name} must not mutate control input`);
  }

});
test('status rendering, narration, identity and localized labels remain independent of storage layout', () => {
  // BT-01: Breadcrumb rendering for structured_delivery with 2 approved gates
  {
    const breadcrumb = [
      { gate: "UR", status: "fulfilled" },
      { gate: "PRD", status: "fulfilled" },
      { gate: "SD", status: "current" },
      { gate: "TP", status: "open" },
      { gate: "QA", status: "open" },
      { gate: "UAT", status: "open" },
    ];
    const rendered = buildBreadcrumb(breadcrumb, localeRegistry, "en");
    assert.ok(rendered.includes("\u2713"), "BT-01: fulfilled symbol present");
    assert.ok(rendered.includes("\u25cf"), "BT-01: current symbol present");
    assert.ok(rendered.includes("\u25cb"), "BT-01: open symbol present");
    assert.equal((rendered.match(/\u00b7/g) || []).length, 5, "BT-01: 5 separators for 6 entries");
  }

  // BT-02: Breadcrumb for verified_change
  {
    const breadcrumb = [
      { gate: "UR", status: "fulfilled" },
      { gate: "Verified Change", status: "current" },
      { gate: "OR", status: "open" },
    ];
    const rendered = buildBreadcrumb(breadcrumb, localeRegistry, "en");
    assert.ok(rendered.includes("Verified change"), "BT-02: verified change label present");
    assert.equal((rendered.match(/\u00b7/g) || []).length, 2, "BT-02: 2 separators for 3 entries");
  }

  // BT-03: Post-UR quick_task is presented as Compact Delivery without changing the mode value
  {
    const breadcrumb = [
      { gate: "UR", status: "fulfilled" },
      { gate: "Compact Delivery", status: "current" },
    ];
    const rendered = buildBreadcrumb(breadcrumb, localeRegistry, "en");
    assert.ok(rendered.includes("Compact Delivery"), "BT-03: compact delivery label present");
    assert.equal((rendered.match(/\u00b7/g) || []).length, 1, "BT-03: 1 separator for 2 entries");
  }

  // BT-04: Breadcrumb for block
  {
    const breadcrumb = [
      { gate: "UR", status: "fulfilled" },
      { gate: "Block", status: "current" },
    ];
    const rendered = buildBreadcrumb(breadcrumb, localeRegistry, "en");
    assert.ok(rendered.includes("Block"), "BT-04: block label present");
  }

  // BT-05: Narration for UR
  {
    const narration = buildTransitionNarration("UR", localeRegistry, "en");
    assert.ok(narration.includes("Brownfield Review"), "BT-05: UR narration mentions Brownfield Review");
    assert.ok(narration.includes(localeRegistry.locales.en.primary.narration.noAction), "BT-05: UR narration uses canonical no-action text");
    const transition = postApprovalTransition("Approval: UR");
    assert.equal(transition.internal_next_step, "Brownfield Review and proportional routing");
    assert.equal(transition.user_action_required, "no");
    assert.equal(transition.next_user_gate, "none");
    assert.ok(!transition.allowed_after_approval.includes("PRD"), "BT-05: UR transition does not preselect PRD");
  }

  // BT-06: Narration is a string, not a card object (non-overlap)
  {
    const narration = buildTransitionNarration("UR", localeRegistry, "en");
    assert.equal(typeof narration, "string", "BT-06: narration is a string");
    assert.ok(!narration.includes("Where am I"), "BT-06: narration does not use card three-question form");
  }

  // BT-07: Narration does not contain Approval: value
  {
    const narration = buildTransitionNarration("PRD", localeRegistry, "en");
    assert.ok(!narration.includes("Approval:"), "BT-07: narration does not contain Approval: value");
  }

  // BT-08: Collapse verified_change eligible
  {
    const result = collapseInternalState({ modeSliceDecision: "verified_change", verifiedChangeState: "eligible" }, localeRegistry, "en");
    assert.equal(result.verified_change, "Compact change under review", "BT-08: eligible collapses to under review");
  }

  // BT-09: Collapse verified_change escalated (stays explicit)
  {
    const result = collapseInternalState({ modeSliceDecision: "verified_change", verifiedChangeState: "escalated" }, localeRegistry, "en");
    assert.equal(result.verified_change, "Escalated to structured delivery", "BT-09: escalated stays explicit");
  }

  // BT-10: Collapse context_graph open_gap (stays explicit)
  {
    const result = collapseInternalState({ contextGraphRequiredAction: "open_gap" }, localeRegistry, "en");
    assert.equal(result.context_graph, "Graph gap open", "BT-10: open_gap stays explicit");
  }

  // BT-11: Collapse multi_scope clear (not shown)
  {
    const result = collapseInternalState({ multiScopeState: "clear" }, localeRegistry, "en");
    assert.equal(result.multi_scope, undefined, "BT-11: clear multi_scope not shown");
  }

  // BT-12: collapseInternalState does not mutate input (full projection unchanged)
  {
    const input = { modeSliceDecision: "verified_change", verifiedChangeState: "eligible" };
    collapseInternalState(input, localeRegistry, "en");
    assert.equal(input.modeSliceDecision, "verified_change", "BT-12: input not mutated");
  }

  // BT-14: Locale registry has required new keys for en and de
  {
    for (const locale of ["en", "de"]) {
      assert.ok(localeRegistry.locales[locale].statusCard.breadcrumbFulfilled, `BT-14: ${locale} breadcrumbFulfilled exists`);
      assert.ok(localeRegistry.locales[locale].statusCard.breadcrumbCurrent, `BT-14: ${locale} breadcrumbCurrent exists`);
      assert.ok(localeRegistry.locales[locale].statusCard.breadcrumbOpen, `BT-14: ${locale} breadcrumbOpen exists`);
      assert.ok(localeRegistry.locales[locale].internalStateLabels, `BT-14: ${locale} internalStateLabels exists`);
      assert.ok(localeRegistry.locales[locale].primary.narration, `BT-14: ${locale} narration exists`);
      assert.ok(localeRegistry.locales[locale].gateTitles["Verified Change"], `BT-14: ${locale} Verified Change gateTitle exists`);
      assert.ok(localeRegistry.locales[locale].gateTitles["Quick Task"], `BT-14: ${locale} Quick Task gateTitle exists`);
      assert.ok(localeRegistry.locales[locale].gateTitles["Block"], `BT-14: ${locale} Block gateTitle exists`);
    }
  }

  // IPP-1: run-identity unit matrix and single-owner re-export
  {
    assert.equal(RUN_ID_PATTERN, identityRunIdPattern, "IPP-1: parser re-exports the shared pattern object");
    assert.deepEqual(validateRunIdentity({ runId: "example-run.1", revisionId: "6f0f2f9a-1d0a-4b7e-9c2d-3a5b8c1d2e4f" }), [], "IPP-1: valid identity yields no findings");
    for (const runId of ["Example", ".leading-dot", "", `a${"b".repeat(128)}`, "spaced id"]) {
      assert.deepEqual(validateRunIdentity({ runId, revisionId: "6f0f2f9a-1d0a-4b7e-9c2d-3a5b8c1d2e4f" }).map((finding) => finding.code), ["AGDF_RUN_ID_INVALID"], `IPP-1: run_id ${JSON.stringify(runId)} is invalid`);
    }
    for (const revisionId of ["", "not-a-uuid", "6f0f2f9a-1d0a-4b7e-9c2d"]) {
      assert.deepEqual(validateRunIdentity({ runId: "example", revisionId }).map((finding) => finding.code), ["AGDF_RUN_REVISION_ID_INVALID"], `IPP-1: revision_id ${JSON.stringify(revisionId)} is invalid`);
    }
    assert.deepEqual(validateRunIdentity({}).map((finding) => finding.code), ["AGDF_RUN_ID_INVALID", "AGDF_RUN_REVISION_ID_INVALID"], "IPP-1: missing identity yields both findings");
  }


});
for (const heading of ['Approvals', 'Artefacts', 'Artefact Chain', 'Evidence', 'Current Control State', 'Gate Checklist']) {
  test(`current parser refuses a second writable ${heading} source`, t => {
    const run = currentRun(currentFixture(t));
    const authored = run.content() + `\n## ${heading}\n\n| Question | Answer |\n|---|---|\n| injected | approved |\n`;
    assert.equal(parseRunState(authored).valid, false);
    writeFileSync(run.path, authored);
    assert.throws(() => run.call('presentation.prepare', { gate: 'UR' }), /original_operation_unconfirmed/);
    assert.equal(run.content(), authored);
  });
}
test('recorded facts determine the next gate and read-only checks preserve exact bytes', t => {
  const run = currentRun(currentFixture(t));
  assert.equal(run.step('ur', clarifiedUr, { title: 'Current source' }).outcome, 'accepted');
  const before = run.content();
  assert.equal(run.control().approvals.get('UR').status, 'missing');
  assert.equal(evaluateGateCheck(run.f.root, { runId: run.id }).current_gate, 'UR');
  assert.equal(run.content(), before);
  assert.equal(run.approve('UR').outcome, 'accepted');
  assert.equal(run.control().approvals.get('UR').status, 'approved');
  assert.equal(run.decision().current_gate, 'Brownfield Review');
  assert.equal(runSealState(run.f.root, run.content()).status, 'valid');
  assert.doesNotMatch(run.content(), /^- (?:current_gate|next_allowed_action):/mu);
  assert.doesNotMatch(run.content(), /^## (?:Approvals|Artefacts|Artefact Chain|Evidence|Current Control State)$/mu);
});
test('unsupported typed operation records cannot be adopted or resealed by an ordinary command', t => {
  const run = currentRun(currentFixture(t));
  const changed = run.content().replace(/^(\| [^|]+ \| sha256:[^|]+ \| )([a-zA-Z0-9_-]+)( \|)$/mu, (line, prefix, encoded, suffix) => {
    const value = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    value.input_resolution.record_version = '3';
    return prefix + Buffer.from(canonicalJson(value)).toString('base64url') + suffix;
  });
  assert.notEqual(changed, run.content()); writeFileSync(run.path, changed);
  assert.equal(parseRunState(changed).valid, false);
  assert.throws(() => run.call('presentation.prepare', { gate: 'UR' }), /original_operation_unconfirmed/);
  assert.equal(run.content(), changed);
});
