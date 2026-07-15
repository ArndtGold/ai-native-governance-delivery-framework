import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  attachApprovalOrientationSnapshot,
  buildApprovalOrientationSnapshot,
  buildArtefactRefs,
  buildInteractionAttempt,
  buildQualityReadiness,
  buildRunCandidates,
  canonicalizeLanguageTag,
  formatArtefactRefs,
  gateOptions,
  gateTitle,
  normalizeInteractionOutcome,
  normalizedRunTitle,
  resolveHumanRunTitle,
  resolvePresentationLocale,
  validateLocaleRegistry,
} from "../lib/interaction-presentation.js";

const registry = JSON.parse(readFileSync(join(import.meta.dirname, "..", "generated", "plugins", "agdf", "meta", "agdf-interaction-locales.json"), "utf8"));

assert.deepEqual(validateLocaleRegistry(registry), { valid: true, errors: [] });
assert.equal(canonicalizeLanguageTag("de_DE.UTF-8"), "de-de");
assert.equal(resolvePresentationLocale(registry, "de-AT"), "de");
assert.equal(resolvePresentationLocale(registry, "fr-FR"), "en");
assert.equal(resolvePresentationLocale(registry, ""), "en");

for (const gate of ["UR", "PRD", "SD", "TP", "QA", "UAT"]) {
  assert.ok(gateTitle(registry, "de", gate));
  const options = gateOptions(registry, "de", gate);
  assert.deepEqual(options.map((option) => option.outcome), ["approve", "revise", "decline"]);
  assert.equal(options[0].label, `Approval: ${gate}`);
  assert.equal(options.filter((option) => option.authorizes).length, 1);
  assert.ok(options.every((option) => option.label && option.description));
}

assert.deepEqual(gateOptions(registry, "en", "QA", { includeCancel: true }).map((option) => option.outcome), ["approve", "revise", "decline", "cancel"]);
assert.equal(normalizeInteractionOutcome("Approval: QA", { expectedApproval: "Approval: QA" }), "approve");
for (const outcome of ["revise", "decline", "cancel"]) assert.equal(normalizeInteractionOutcome(outcome, { expectedApproval: "Approval: QA" }), outcome);
assert.equal(normalizeInteractionOutcome("Approve", { expectedApproval: "Approval: QA" }), "invalid");
assert.equal(normalizeInteractionOutcome("Approval: UR", { expectedApproval: "Approval: QA" }), "invalid");
assert.equal(normalizeInteractionOutcome("", { expectedApproval: "Approval: QA" }), "empty");
assert.equal(normalizeInteractionOutcome(undefined, { expectedApproval: "Approval: QA" }), "no_response");
assert.equal(normalizeInteractionOutcome("Approval: QA", { expectedApproval: "Approval: QA", timedOut: true }), "timeout");
assert.equal(normalizeInteractionOutcome("Approval: QA", { expectedApproval: "Approval: QA", stale: true }), "stale");

const refs = buildArtefactRefs(new Map([
  ["UR", { path: ".agdf/control/artefacts/run/UR.md", status: "approved" }],
  ["PRD", { path: "../guessed/PRD.md", status: "approved" }],
  ["SD", { path: ".agdf/control/artefacts/run/SD.md", status: "approved" }],
] ), registry, "de");
assert.deepEqual(refs.map((ref) => ref.exists), [true, false, true, false]);
assert.equal(formatArtefactRefs(refs), "[UR](.agdf/control/artefacts/run/UR.md) · PRD (noch nicht erstellt) · [SD](.agdf/control/artefacts/run/SD.md) · TP (noch nicht erstellt)");
const verifiedRefs = buildArtefactRefs({ UR: { path: ".agdf/control/artefacts/run/UR.md" } }, registry, "en", { pathExists: () => false });
assert.equal(verifiedRefs[0].exists, false);
assert.equal(verifiedRefs[0].path, "");

assert.equal(resolveHumanRunTitle({ currentArtefactHeading: "# Current title", urHeading: "# UR title", runContent: "## Objective\n\nObjective title", runId: "fallback-run" }), "Current title");
assert.equal(resolveHumanRunTitle({ urHeading: "# UR title", runContent: "## Objective\n\nObjective title", runId: "fallback-run" }), "UR title");
assert.equal(resolveHumanRunTitle({ runContent: "## Objective\n\nObjective title\nmore", runId: "fallback-run" }), "Objective title");
assert.equal(resolveHumanRunTitle({ runContent: "", runId: "fallback-run" }), "Fallback Run");
assert.equal(normalizedRunTitle("only_run.id"), "Only Run Id");

const candidates = buildRunCandidates([
  { run_id: "closed", valid: true, meta: { lifecycle: "completed" } },
  { run_id: "beta-run", valid: true, meta: { lifecycle: "active", current_gate: "TP", revision_id: "b" }, control_state: { next_allowed_action: "Plan tests" }, ur_heading: "# Human beta title" },
  { run_id: "alpha-run", valid: true, meta: { lifecycle: "active", current_gate: "UR", revision_id: "a" }, control_state: { next_allowed_action: "Draft UR" }, current_artefact_heading: "# Human alpha title" },
]);
assert.deepEqual(candidates.map((candidate) => candidate.run_id), ["alpha-run", "beta-run"]);
assert.equal(candidates[0].display_title, "Human alpha title");
assert.equal(candidates[1].display_title, "Human beta title");
assert.equal(candidates[0].current_gate, "UR");
const attempt = buildInteractionAttempt({ interactionId: "i-1", runId: "alpha-run", currentGate: "UR", surface: "codex", attemptOutcome: "presented", expectedApproval: "Approval: UR" });
assert.equal(attempt.authorizes, false);
for (const attemptOutcome of ["presented", "unavailable_before_invocation", "attempted_not_applied", "unsafe_to_wait"]) {
  const receipt = buildInteractionAttempt({ interactionId: `i-${attemptOutcome}`, runId: "alpha-run", currentGate: "UR", surface: "fallback", attemptOutcome, expectedApproval: "Approval: UR", fallbackReason: "host capability unavailable" });
  assert.equal(receipt.attempt_outcome, attemptOutcome);
  assert.equal(receipt.expected_approval, "Approval: UR");
  assert.equal(receipt.authorizes, false);
  assert.equal(Object.isFrozen(receipt), true);
}
assert.throws(() => buildInteractionAttempt({ interactionId: "i", runId: "r", currentGate: "UR", attemptOutcome: "invalid" }));

for (const gate of ["UR", "PRD", "SD", "TP", "QA", "UAT"]) {
  const statusCard = {
    run_id: "approval-run",
    status: "open",
    current_gate: gate,
    missing_approval: `Approval: ${gate}`,
    next_gate_after_approval: gate === "UAT" ? "OR" : "next",
    next_step: "Continue with the current approved transition.",
  };
  const snapshot = buildApprovalOrientationSnapshot({
    ready: true,
    statusCard,
    humanPresentation: {
      runTitle: "Approval run",
      gateTitle: gateTitle(registry, "de", gate),
      artefactRefs: refs,
    },
    revisionId: "revision-1",
    registry,
    requestedLocale: "de-AT",
  });
  assert.deepEqual(snapshot.sequence, ["run_status_card", "gate_transition_card", "approval_interaction"]);
  assert.deepEqual(snapshot.compact_status_card.fields.map((field) => field.id), [
    "selected_run", "readiness_status", "current_gate", "missing_approval", "next_action", "quality_outlook",
  ]);
  assert.equal(snapshot.run_id, "approval-run");
  assert.equal(snapshot.revision_id, "revision-1");
  assert.equal(snapshot.current_gate, gate);
  assert.equal(snapshot.presentation_language, "de");
  assert.equal(snapshot.compact_status_card.fields[1].value, "Bereit für deine Entscheidung");
  assert.equal(snapshot.gate_transition_card.exact_approval, `Approval: ${gate}`);
  assert.equal(snapshot.approval_interaction.options[0].value, `Approval: ${gate}`);
  assert.equal(snapshot.approval_interaction.authorizes, false);
  assert.equal(snapshot.authorizes, false);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.compact_status_card.fields), true);
  assert.equal(Object.isFrozen(snapshot.approval_interaction.options), true);
}

const readyStatus = { run_id: "r", status: "open", current_gate: "QA", missing_approval: "Approval: QA" };
const readyHuman = { runTitle: "Run", gateTitle: "QA", artefactRefs: [] };
assert.equal(buildApprovalOrientationSnapshot({ ready: false, statusCard: readyStatus, humanPresentation: readyHuman, registry, requestedLocale: "en" }), null);
assert.equal(buildApprovalOrientationSnapshot({ ready: true, statusCard: { ...readyStatus, status: "blocked" }, humanPresentation: readyHuman, registry, requestedLocale: "en" }), null);
assert.equal(buildApprovalOrientationSnapshot({ ready: true, statusCard: { ...readyStatus, missing_approval: "Approval: TP" }, humanPresentation: readyHuman, registry, requestedLocale: "en" }), null);
assert.equal(buildApprovalOrientationSnapshot({ ready: true, statusCard: { ...readyStatus, current_gate: "Brownfield Analysis" }, humanPresentation: readyHuman, registry, requestedLocale: "en" }), null);

const attachedStatus = { ...readyStatus };
const publicKeysBefore = Object.keys(attachedStatus);
const attachedSnapshot = attachApprovalOrientationSnapshot(attachedStatus, {
  ready: true,
  humanPresentation: readyHuman,
  revisionId: "revision-attach",
  registry,
  requestedLocale: "en",
});
assert.equal(attachedStatus.approvalOrientation, attachedSnapshot);
assert.equal(attachedSnapshot.revision_id, "revision-attach");
assert.deepEqual(Object.keys(attachedStatus), publicKeysBefore);
assert.equal(JSON.stringify(attachedStatus).includes("approvalOrientation"), false);
assert.throws(() => attachApprovalOrientationSnapshot(null, {}), /status card missing/);

const readiness = buildQualityReadiness({
  planCoverage: "pass",
  solutionIntegrity: "pass",
  codeQuality: "pass",
  qaDecision: "revise",
  decisiveReason: "TP coverage is incomplete",
  nextAction: "Revise the affected task and rerun checks.",
});
assert.equal(readiness.status, "revise");
assert.deepEqual(readiness.rows.map((row) => row.id), ["plan_coverage", "solution_integrity", "code_quality", "qa_decision"]);
assert.equal(readiness.decisive_dimension, "qa_decision");
assert.equal(readiness.decision_owner, "qa-gate");
assert.equal(readiness.authorizes, false);
assert.equal(buildQualityReadiness({ planCoverage: "pass", solutionIntegrity: "pass", codeQuality: "pass", qaDecision: "pass" }).status, "pass");
assert.equal(buildQualityReadiness({ planCoverage: "pass", solutionIntegrity: "pass", codeQuality: "block", qaDecision: "pass" }).status, "block");
assert.equal(buildQualityReadiness({ planCoverage: "pass", solutionIntegrity: "pass", codeQuality: "pass", qaDecision: "unknown" }).status, "revise");
assert.equal(buildQualityReadiness({}), null);

const additional = structuredClone(registry);
additional.locales.es = structuredClone(additional.locales.en);
additional.locales.es.statusCard.title = "Tarjeta de estado AGDF";
assert.deepEqual(validateLocaleRegistry(additional), { valid: true, errors: [] });
assert.equal(resolvePresentationLocale(additional, "es-MX"), "es");

const incomplete = structuredClone(registry);
delete incomplete.locales.de.interaction.declineDescription;
assert.equal(validateLocaleRegistry(incomplete).valid, false);

const longLocale = structuredClone(registry);
longLocale.locales.fr = structuredClone(longLocale.locales.en);
longLocale.locales.fr.interaction.reviseLabel = "R".repeat(registry.lengthBudgets.label);
assert.equal(validateLocaleRegistry(longLocale).valid, true);
assert.ok(gateOptions(longLocale, "fr", "TP").every((option) => option.label && option.description));
longLocale.locales.fr.interaction.reviseLabel += "R";
assert.equal(validateLocaleRegistry(longLocale).valid, false);

console.log("interaction presentation tests passed");
