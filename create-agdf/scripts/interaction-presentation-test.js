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
  executeNativeApprovalAttempt,
  evaluateNativeApprovalCapability,
  canonicalizeLanguageTag,
  formatArtefactRefs,
  gateOptions,
  gateTitle,
  gateRationale,
  normalizeInteractionOutcome,
  normalizedRunTitle,
  resolveHumanRunTitle,
  resolvePresentationLocale,
  reconcileRunScope,
  renderApprovalOrientationSnapshot,
  renderOperationalStatusCard,
  normalizeReconciliationText,
  validateLocaleRegistry,
  validateApprovalOrientationSnapshot,
} from "../lib/interaction-presentation.js";
import { printApprovalEnvelope, printGateCheckReport } from "../lib/control-evaluation/gate-check.js";

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

{
  const presentation = renderOperationalStatusCard({
    run_id: "status-run",
    presentation_language: "de-AT",
    mode: "structured_delivery",
    status: "blocked",
    current_gate: "QA",
    mode_slice_decision: "structured_delivery",
    breadcrumb: [{ gate: "UR", status: "fulfilled" }, { gate: "QA", status: "current" }],
    delivery_state: "active",
    allowed_now: ["review <evidence>", "keep a | literal"],
    forbidden_now: ["release"],
    blocking_condition: "missing evidence",
    missing_approval: "none",
    next_gate_after_approval: "none",
    allowed_after_approval: "none",
    user_visible_outcome_after_approval: "none",
    internal_next_step: "refresh QA",
    next_user_gate: "none",
    user_action_required: "no",
    evidence: [{ evidence: "Direct fixture", source: "test" }],
    next_skill: "qa-gate",
    next_step: "Refresh the report.",
    quality_outlook: "Keep status parity.",
  }, {
    registry,
    revisionId: "status-revision",
    humanPresentation: { runTitle: "Status run", gateTitle: "Qualitätssicherung", artefactRefs: refs },
  });
  assert.equal(presentation.semantic_block, "run_status_card");
  assert.equal(presentation.presentation_language, "de");
  assert.equal(presentation.revision_id, "status-revision");
  assert.equal(presentation.authorizes, false);
  assert.equal(Object.isFrozen(presentation), true);
  assert.match(presentation.markdown, /^## AGDF-Statuskarte/);
  assert.match(presentation.markdown, /review &lt;evidence&gt;<br>keep a \\\| literal/);
  assert.match(presentation.markdown, /Aktuell verboten \| release/);
  assert.doesNotMatch(presentation.markdown, /Direct fixture/);
  assert.equal(renderOperationalStatusCard(null, { registry, humanPresentation: {} }), null);
  assert.equal(renderOperationalStatusCard({ run_id: "status-run", current_gate: "QA", presentation_language: "de" }, { registry, revisionId: "", humanPresentation: {} }).revision_id, "unversioned");
  const failedLines = [];
  assert.equal(printGateCheckReport({ status_card: { presentation_language: "de" }, status_presentation: null }, false, true, { log: (line) => failedLines.push(line) }), false);
  assert.match(failedLines[0], /Statuskarte nicht sicher darstellbar/);
}

const candidates = buildRunCandidates([
  { run_id: "closed", valid: true, meta: { lifecycle: "completed" } },
  { run_id: "beta-run", valid: true, meta: { lifecycle: "active", current_gate: "TP", revision_id: "b" }, control_state: { next_allowed_action: "Plan tests" }, ur_heading: "# Human beta title" },
  { run_id: "alpha-run", valid: true, meta: { lifecycle: "active", current_gate: "UR", revision_id: "a" }, control_state: { next_allowed_action: "Draft UR" }, current_artefact_heading: "# Human alpha title" },
]);
assert.deepEqual(candidates.map((candidate) => candidate.run_id), ["alpha-run", "beta-run"]);
assert.equal(candidates[0].display_title, "Human alpha title");
assert.equal(candidates[1].display_title, "Human beta title");
assert.equal(candidates[0].current_gate, "UR");
assert.equal(normalizeReconciliationText("Human Alpha_Title"), "human alpha title");
const reconciliation = reconcileRunScope({ scopeKey: "Human beta title", runs: [
  { run_id: "beta-run", valid: true, meta: { lifecycle: "active", current_gate: "TP" }, ur_heading: "# Human beta title" },
  { run_id: "closed", valid: true, meta: { lifecycle: "completed", current_gate: "OR" }, ur_heading: "# Closed title" },
] });
assert.equal(reconciliation.outcome, "active_match");
assert.equal(reconciliation.matches[0].run_id, "beta-run");
assert.equal(reconcileRunScope({ scopeKey: "Closed title", runs: [
  { run_id: "closed", valid: true, meta: { lifecycle: "completed", current_gate: "OR" }, ur_heading: "# Closed title" },
] }).outcome, "completed_match");
let nativeCalls = 0;
let fallbackCalls = 0;
const preflightSnapshot = buildApprovalOrientationSnapshot({
  ready: true,
  statusCard: { run_id: "alpha-run", status: "open", current_gate: "UR", missing_approval: "Approval: UR" },
  humanPresentation: { runTitle: "Alpha run", gateTitle: gateTitle(registry, "de", "UR"), artefactRefs: refs },
  revisionId: "preflight-revision",
  registry,
  requestedLocale: "de",
});
const nativeAttempt = executeNativeApprovalAttempt({
  ready: true,
  orientationSnapshot: preflightSnapshot,
  capabilityPreflight: evaluateNativeApprovalCapability({ staticCapability: { approvalValueTransport: "exact_option_value", waitSafety: "deliberate_no_auto_resolution" } }),
  invokeNative: () => { nativeCalls += 1; return { outcome: "attempted_not_applied", reason: "host_not_applied" }; },
  fallback: () => { fallbackCalls += 1; },
});
assert.equal(nativeCalls, 1);
assert.equal(fallbackCalls, 1);
assert.equal(nativeAttempt.outcome, "attempted_not_applied");
const decoratedPreflight = evaluateNativeApprovalCapability({ staticCapability: { approvalValueTransport: "decorated_label_only", waitSafety: "deliberate_no_auto_resolution" } });
assert.equal(registry.locales.en.primary.readOnlyOrientationDescription, "Read-only check — no new AGDF run and no approval required.");
assert.equal(registry.locales.de.primary.readOnlyOrientationDescription, "Read-only Prüfung – kein neuer AGDF-Run und keine Freigabe erforderlich.");
const interactionContract = readFileSync(join(import.meta.dirname, "..", "..", "plugin", "meta", "contracts", "interaction.md"), "utf8");
const gateCheckSkill = readFileSync(join(import.meta.dirname, "..", "..", "plugin", "skills", "gate-check", "SKILL.md"), "utf8");
assert.equal((interactionContract.match(/^### Read-only request orientation$/gm) ?? []).length, 1);
assert.match(interactionContract, /do not create a run, write control files, request gate approval or\s+repeat the sentence/);
assert.match(gateCheckSkill, /For status, blocked, read-only or rationale interactions,[\s\S]*without asking for approval/);
assert.doesNotMatch(gateCheckSkill, /Surface behavior:/);
assert.equal(evaluateNativeApprovalCapability({ staticCapability: { approvalValueTransport: "exact_option_value", waitSafety: "deliberate_no_auto_resolution" } }).eligible, true);
assert.equal(evaluateNativeApprovalCapability({ staticCapability: { approvalValueTransport: "exact_option_value", waitSafety: "deliberate_no_auto_resolution" } }).native_attempt_required, true);
assert.equal(evaluateNativeApprovalCapability({ staticCapability: { approvalValueTransport: "exact_option_value", waitSafety: "deliberate_no_auto_resolution" } }).reason, "exact_transport");
assert.equal(evaluateNativeApprovalCapability({ staticCapability: { approvalValueTransport: "decorated_label_only", waitSafety: "deliberate_no_auto_resolution" } }).native_attempt_required, false);
assert.equal(executeNativeApprovalAttempt({ ready: true, orientationSnapshot: preflightSnapshot, capabilityPreflight: decoratedPreflight, invokeNative: () => { nativeCalls += 1; } }).attempted, false);
assert.equal(nativeCalls, 1, "decorated-only capability must not invoke the adapter");
assert.equal(evaluateNativeApprovalCapability({ staticCapability: { approvalValueTransport: "exact_option_value", waitSafety: "unsafe" } }).preflight_outcome, "unsafe_to_wait");
assert.equal(evaluateNativeApprovalCapability({ staticCapability: { approvalValueTransport: "unknown", waitSafety: "unknown" } }).preflight_outcome, "unavailable_before_invocation");
assert.equal(evaluateNativeApprovalCapability({ staticCapability: { approvalValueTransport: "exact_option_value", waitSafety: "deliberate_no_auto_resolution" }, runtimeCapability: { approvalValueTransport: "decorated_label_only", waitSafety: "deliberate_no_auto_resolution" } }).reason, "capability_conflict");
assert.equal(evaluateNativeApprovalCapability({ staticCapability: { canonicalValueTransport: true, waitSafety: "deliberate_no_auto_resolution" } }).eligible, false, "legacy boolean metadata must fail closed");
const runtimeConfirmedPreflight = evaluateNativeApprovalCapability({ staticCapability: { approvalValueTransport: "separate_label_and_value", waitSafety: "deliberate_no_auto_resolution" }, runtimeCapability: { approvalValueTransport: "separate_label_and_value", waitSafety: "deliberate_no_auto_resolution" } });
assert.equal(runtimeConfirmedPreflight.eligible, true);
assert.equal(runtimeConfirmedPreflight.evidence_source, "runtime");
assert.equal(executeNativeApprovalAttempt({ ready: false, invokeNative: () => { nativeCalls += 1; } }).attempted, false);
assert.equal(executeNativeApprovalAttempt({ ready: true, orientationSnapshot: null, invokeNative: () => { nativeCalls += 1; } }).reason, "orientation_preflight_failed");
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
  assert.equal(snapshot.compact_status_card.semantic_block, "run_status_card");
  assert.equal(snapshot.gate_transition_card.semantic_block, "gate_transition_card");
  assert.equal(snapshot.approval_interaction.semantic_block, "approval_interaction");
  assert.equal(snapshot.compact_status_card.primary_heading, registry.locales.de.gateActionTitles[gate]);
  assert.equal(snapshot.compact_status_card.title, snapshot.compact_status_card.primary_heading);
  assert.equal(snapshot.compact_status_card.primary_heading_level, 2);
  assert.deepEqual(validateApprovalOrientationSnapshot(snapshot), { valid: true, errors: [] });
  assert.deepEqual(snapshot.compact_status_card.fields.map((field) => field.id), [
    "selected_run", "readiness_status", "current_gate", "required_decision", "next_action",
  ]);
  assert.equal(snapshot.run_id, "approval-run");
  assert.equal(snapshot.revision_id, "revision-1");
  assert.equal(snapshot.current_gate, gate);
  assert.equal(snapshot.presentation_language, "de");
  assert.equal(snapshot.compact_status_card.fields[1].value, "Bereit für deine Entscheidung");
  assert.equal(snapshot.compact_status_card.fields[3].value, registry.locales.de.gateRequiredDecisions[gate]);
  assert.equal(snapshot.compact_status_card.fields.some((field) => field.value.includes(`Approval: ${gate}`)), false);
  assert.equal(snapshot.gate_transition_card.exact_approval, `Approval: ${gate}`);
  assert.equal(snapshot.approval_interaction.options[0].value, `Approval: ${gate}`);
  assert.equal(snapshot.approval_interaction.authorizes, false);
  assert.equal(snapshot.authorizes, false);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.compact_status_card.fields), true);
  assert.equal(Object.isFrozen(snapshot.approval_interaction.options), true);
  const rendered = renderApprovalOrientationSnapshot(snapshot, {
    registry,
    expectedIdentity: { run_id: "approval-run", revision_id: "revision-1", current_gate: gate, presentation_language: "de" },
  });
  assert.equal(rendered.schema_version, "1");
  assert.match(rendered.blocks.run_status_card.markdown, new RegExp(`^## ${registry.locales.de.gateActionTitles[gate]}`));
  assert.equal(rendered.blocks.run_status_card.markdown.includes(`Approval: ${gate}`), false);
  assert.equal((`${rendered.blocks.run_status_card.markdown}\n${rendered.blocks.gate_transition_card.markdown}`.match(new RegExp(`Approval: ${gate}`, "g")) ?? []).length, 1);
  assert.match(rendered.approval_interaction.exact_text_fallback, new RegExp(`Approval: ${gate}`));
  assert.equal(rendered.authorizes, false);
}

for (const [mutation, expectedError] of [
  [(snapshot) => { snapshot.sequence = ["gate_transition_card", "run_status_card", "approval_interaction"]; }, "sequence"],
  [(snapshot) => { snapshot.compact_status_card.semantic_block = "combined_card"; }, "run_status_card"],
  [(snapshot) => { delete snapshot.gate_transition_card; }, "gate_transition_card"],
  [(snapshot) => { snapshot.compact_status_card.primary_heading = "AGDF Status"; }, "generic_primary_heading"],
  [(snapshot) => { snapshot.compact_status_card.title = "AGDF Status — TP"; }, "primary_heading_owner"],
  [(snapshot) => { snapshot.compact_status_card.primary_heading = "Run Status Card — TP"; snapshot.compact_status_card.title = snapshot.compact_status_card.primary_heading; }, "generic_primary_heading"],
  [(snapshot) => { snapshot.compact_status_card.primary_heading = "Approve user requirements"; snapshot.compact_status_card.title = snapshot.compact_status_card.primary_heading; }, "approval_biased_heading"],
  [(snapshot) => { snapshot.compact_status_card.primary_heading_level = 3; }, "primary_heading"],
  [(snapshot) => { snapshot.compact_status_card.fields[3].value = "Approval: UR"; }, "approval_card_occurrence"],
  [(snapshot) => { snapshot.run_id = "different-run"; }, "identity_projection"],
  [(snapshot) => { snapshot.gate_transition_card.artefact_refs[0].path = "../unsafe/UR.md"; snapshot.gate_transition_card.artefact_refs[0].exists = true; }, "unsafe_artefact_ref"],
  [(snapshot) => { snapshot.gate_transition_card.next_transition = ""; }, "transition_content"],
  [(snapshot) => { snapshot.approval_interaction.options[0].value = "Approval: TP (Recommended)"; }, "canonical_approval"],
]) {
  const invalid = structuredClone(preflightSnapshot);
  mutation(invalid);
  assert.equal(validateApprovalOrientationSnapshot(invalid).valid, false, expectedError);
  assert.ok(validateApprovalOrientationSnapshot(invalid).errors.includes(expectedError));
  assert.equal(renderApprovalOrientationSnapshot(invalid), null);
}

{
  const stale = structuredClone(preflightSnapshot);
  stale.revision_id = "stale-revision";
  const validation = {
    registry,
    expectedIdentity: { run_id: "alpha-run", revision_id: "preflight-revision", current_gate: "UR", presentation_language: "de" },
  };
  assert.ok(validateApprovalOrientationSnapshot(stale, validation).errors.includes("stale_identity"));
  assert.equal(renderApprovalOrientationSnapshot(stale, validation), null);
}

{
  const mixedLocale = structuredClone(preflightSnapshot);
  mixedLocale.compact_status_card.fields[3].label = registry.locales.en.statusCard.requiredDecision;
  assert.ok(validateApprovalOrientationSnapshot(mixedLocale, { registry }).errors.includes("locale_consistency"));
  assert.equal(renderApprovalOrientationSnapshot(mixedLocale, { registry }), null);
}

{
  const missingRevision = structuredClone(preflightSnapshot);
  missingRevision.revision_id = "";
  assert.ok(validateApprovalOrientationSnapshot(missingRevision).errors.includes("revision_identity"));
  assert.equal(renderApprovalOrientationSnapshot(missingRevision), null);
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

{
  const rendered = renderApprovalOrientationSnapshot(preflightSnapshot);
  const lines = [];
  const output = printApprovalEnvelope({ status: "open", approval_presentation: rendered }, { io: { log: (line = "") => lines.push(String(line)) } });
  assert.equal(output.outcome, "rendered");
  assert.equal(output.requested_decision, true);
  assert.equal(lines.length, 5);
  assert.match(lines[0], /^## Nutzeranforderungen prüfen und entscheiden/);
  assert.match(lines.at(-1), /Approval: UR/);
}

{
  const lines = [];
  const readyReport = {
    status: "open",
    current_gate: "UR",
    missing_approval: "Approval: UR",
    status_card: { presentation_language: "en" },
    approval_presentation: null,
  };
  const output = printApprovalEnvelope(readyReport, {
    io: { log: (line = "") => lines.push(String(line)) },
    reEvaluate: () => ({ ...readyReport }),
  });
  assert.equal(output.outcome, "exact_text_recovery");
  assert.equal(output.requested_decision, true);
  assert.match(lines[0], /could not be rendered safely/);
  assert.match(lines[1], /Approval: UR/);
}

{
  const lines = [];
  const readyReport = {
    status: "open",
    current_gate: "UR",
    missing_approval: "Approval: UR",
    status_card: { presentation_language: "en" },
    approval_presentation: null,
  };
  const output = printApprovalEnvelope(readyReport, {
    io: { log: (line = "") => lines.push(String(line)) },
    reEvaluate: () => ({ ...readyReport, status: "blocked", blocking_reason: "stale_revision", missing_approval: "none" }),
  });
  assert.equal(output.outcome, "non_ready");
  assert.equal(output.requested_decision, false);
  assert.match(lines[0], /stale_revision/);
  assert.doesNotMatch(lines[0], /Approval:/);
}

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
const missingActionTitle = structuredClone(registry);
delete missingActionTitle.locales.de.gateActionTitles.TP;
assert.equal(validateLocaleRegistry(missingActionTitle).valid, false);
const missingRequiredDecision = structuredClone(registry);
delete missingRequiredDecision.locales.de.gateRequiredDecisions.TP;
assert.equal(validateLocaleRegistry(missingRequiredDecision).valid, false);

const longLocale = structuredClone(registry);
longLocale.locales.fr = structuredClone(longLocale.locales.en);
longLocale.locales.fr.interaction.reviseLabel = "R".repeat(registry.lengthBudgets.label);
assert.equal(validateLocaleRegistry(longLocale).valid, true);
assert.ok(gateOptions(longLocale, "fr", "TP").every((option) => option.label && option.description));
longLocale.locales.fr.interaction.reviseLabel += "R";
assert.equal(validateLocaleRegistry(longLocale).valid, false);

console.log("interaction presentation tests passed");

const RATIONALE_GATES = ["UR", "PRD", "SD", "TP", "QA", "UAT", "Brownfield Review", "Mode/Slice Decision", "Brownfield Analysis", "CD+Tests", "CR", "OR"];

for (const gate of RATIONALE_GATES) {
  const enRationale = gateRationale(registry, "en", gate);
  const deRationale = gateRationale(registry, "de", gate);
  assert.ok(enRationale && enRationale !== gate, `en rationale for ${gate} must be a curated string`);
  assert.ok(deRationale && deRationale !== gate, `de rationale for ${gate} must be a curated string`);
  assert.ok(enRationale.length <= 160, `en rationale for ${gate} within budget`);
  assert.ok(deRationale.length <= 160, `de rationale for ${gate} within budget`);
}

assert.equal(gateRationale(registry, "de", "UR"), registry.locales.de.gateRationale.UR);
assert.equal(gateRationale(registry, "en", "UR"), registry.locales.en.gateRationale.UR);
assert.equal(gateRationale(registry, "de", "UR"), gateRationale(registry, "de", "UR"), "deterministic: same call returns same value");
assert.equal(gateRationale(registry, "fr", "UR"), registry.locales.en.gateRationale.UR, "unsupported locale falls back to en");

assert.ok(registry.locales.en.interaction.why && registry.locales.en.interaction.why.label, "en interaction.why.label exists");
assert.ok(registry.locales.de.interaction.why && registry.locales.de.interaction.why.label, "de interaction.why.label exists");
assert.ok(registry.locales.en.interaction.why.fulfilledPrefix, "en interaction.why.fulfilledPrefix exists");
assert.ok(registry.locales.de.interaction.why.protectsPrefix, "de interaction.why.protectsPrefix exists");
assert.ok(registry.locales.en.interaction.why.label.length <= 40, "en why.label within budget");
assert.ok(registry.locales.de.interaction.why.label.length <= 40, "de why.label within budget");

const whyOptions = gateOptions(registry, "de", "UR");
assert.deepEqual(whyOptions.map((option) => option.outcome), ["approve", "revise", "decline"], "gateOptions unchanged — no why option");
assert.ok(!whyOptions.some((option) => option.outcome === "why"), "no why option in gateOptions");

const missingRationale = structuredClone(registry);
delete missingRationale.locales.de.gateRationale;
assert.equal(validateLocaleRegistry(missingRationale).valid, false, "missing gateRationale in de causes validation failure");
assert.ok(validateLocaleRegistry(missingRationale).errors.some((error) => error.startsWith("incomplete_locale")), "incomplete_locale error for missing gateRationale");

const missingWhy = structuredClone(registry);
delete missingWhy.locales.en.interaction.why;
assert.equal(validateLocaleRegistry(missingWhy).valid, false, "missing interaction.why in en causes validation failure");

for (const gate of ["UR", "PRD", "SD", "TP", "QA", "UAT"]) {
  const statusCard = { run_id: "r", status: "open", current_gate: gate, missing_approval: `Approval: ${gate}`, next_gate_after_approval: "next", next_step: "Continue." };
  const snapshot = buildApprovalOrientationSnapshot({ ready: true, statusCard, humanPresentation: { runTitle: "Run", gateTitle: gate, artefactRefs: refs }, revisionId: "rev", registry, requestedLocale: "de" });
  assert.deepEqual(validateApprovalOrientationSnapshot(snapshot), { valid: true, errors: [] }, `snapshot valid for ${gate} with gateRationale present`);
}

console.log("gate rationale and why tests passed");
