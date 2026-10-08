import assert from "node:assert/strict";
import { effectiveNextAllowedAction, storedNextActionStale, storedNextActionApplies } from "../lib/control-evaluation/next-action.js";

// The stored next step refines the evaluated gate for active runs; completed runs keep their
// authored closeout text; only a generated next step from an earlier gate falls back to the evaluated decision.
const CD_TESTS = { current_gate: "CD+Tests", next_allowed_action: "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR." };
const run = ({ lifecycle = "active", gate = "CD+Tests", next = "" } = {}) => ({
  content: `# AGDF Run State\n\n## Run Meta\n\n- lifecycle: ${lifecycle}\n- current_gate: ${gate}\n`,
  current_gate: gate,
  next_allowed_action: next,
});

// Placeholder or empty stored text never applies.
for (const next of ["", "`text | text`"]) {
  assert.equal(storedNextActionApplies(run({ next }), CD_TESTS), false, `placeholder ${JSON.stringify(next)}`);
  assert.equal(effectiveNextAllowedAction(run({ next }), CD_TESTS), CD_TESTS.next_allowed_action);
}

// Active run whose stored gate moved: the evaluated next step applies (the observed defect).
const stale = run({ gate: "Brownfield Analysis", next: "Run Brownfield Analysis for the approved TP scope before CD+Tests." });
assert.equal(storedNextActionApplies(stale, CD_TESTS), false);
assert.equal(effectiveNextAllowedAction(stale, CD_TESTS), CD_TESTS.next_allowed_action);

// Active run on the same gate keeps deliberate run-specific text, including a pending
// same-gate decision at CD+Tests that must keep stopping automatic implementation.
const custom = run({ next: "Choose whether AC-006 stays open under this TP or a separate scope update starts." });
assert.equal(storedNextActionApplies(custom, CD_TESTS), true);
assert.equal(effectiveNextAllowedAction(custom, CD_TESTS), custom.next_allowed_action);
const sameText = run({ next: CD_TESTS.next_allowed_action });
assert.equal(effectiveNextAllowedAction(sameText, CD_TESTS), CD_TESTS.next_allowed_action);

// A forward gate move does not discard a deliberate run-specific instruction.
const movedCustom = run({ gate: "Brownfield Analysis", next: custom.next_allowed_action });
assert.equal(storedNextActionStale(movedCustom, CD_TESTS), false);
assert.equal(storedNextActionApplies(movedCustom, CD_TESTS), true);
assert.equal(effectiveNextAllowedAction(movedCustom, CD_TESTS), movedCustom.next_allowed_action);

// A backward move after retracted evidence (stored QA, evaluated CD+Tests) keeps the stored text and
// therefore keeps stopping automatic implementation; an unknown stored gate also fails closed.
const backward = run({ gate: "QA", next: "Draft or refine the current artefact." });
assert.equal(storedNextActionStale(backward, CD_TESTS), false);
assert.equal(effectiveNextAllowedAction(backward, CD_TESTS), backward.next_allowed_action);
const unknown = run({ gate: "Legacy Review Step", next: "Finish the legacy review." });
assert.equal(storedNextActionStale(unknown, CD_TESTS), false);
assert.equal(effectiveNextAllowedAction(unknown, CD_TESTS), unknown.next_allowed_action);
assert.equal(storedNextActionStale(stale, CD_TESTS), true, "the observed defect is a generated next step from an earlier gate");

// A backtick-quoted stored gate still compares by its gate name.
const quoted = run({ gate: "`CD+Tests`", next: "Run the remaining integration scenario first." });
assert.equal(storedNextActionApplies(quoted, CD_TESTS), true);

// Completed runs keep their closeout text, also when a legacy layout evaluates to another gate.
const completed = run({ lifecycle: "completed", gate: "OR", next: "No run work remains; VCS actions require a separate instruction." });
assert.equal(storedNextActionApplies(completed, { current_gate: "OR", next_allowed_action: "Produce delivery closeout." }), true);
assert.equal(effectiveNextAllowedAction(completed, CD_TESTS), completed.next_allowed_action, "legacy completed run keeps its text");

// A run without a lifecycle field is not treated as active.
const legacy = { content: "# AGDF Run State\n", current_gate: "OR", next_allowed_action: "Offer delivery closeout." };
assert.equal(effectiveNextAllowedAction(legacy, CD_TESTS), legacy.next_allowed_action);

console.log("next-action tests passed");
