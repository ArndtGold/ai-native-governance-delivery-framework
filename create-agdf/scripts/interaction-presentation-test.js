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
  renderControlSetupOrientation,
  renderOperationalStatusCard,
  renderScopeClassificationCard,
  renderTaskTargetOrientation,
  normalizeReconciliationText,
  validateLocaleRegistry,
  validateApprovalOrientationSnapshot,
  validateApprovalOrientationPreconditions,
  validateOperationalStatusCardPreconditions,
} from "../lib/interaction-presentation.js";
import { RUN_ID_PATTERN } from "../lib/control-state/run-identity.js";
import { postApprovalTransition, printApprovalEnvelope, printGateCheckReport } from "../lib/control-evaluation/gate-check.js";

const registry = JSON.parse(readFileSync(join(import.meta.dirname, "..", "generated", "plugins", "agdf", "meta", "agdf-interaction-locales.json"), "utf8"));
const sourceRegistry = JSON.parse(readFileSync(join(import.meta.dirname, "..", "..", "plugin", "meta", "agdf-interaction-locales.json"), "utf8"));

assert.deepEqual(validateLocaleRegistry(registry), { valid: true, errors: [] });
assert.deepEqual(validateLocaleRegistry(sourceRegistry), { valid: true, errors: [] });
assert.equal(canonicalizeLanguageTag("de_DE.UTF-8"), "de-de");
assert.equal(resolvePresentationLocale(registry, "de-AT"), "de");
assert.equal(resolvePresentationLocale(registry, "fr-FR"), "en");
assert.equal(resolvePresentationLocale(registry, ""), "en");

const controlSetup = renderControlSetupOrientation({ target: "/repo/target" }, { registry: sourceRegistry, requestedLocale: "de" });
assert.equal(controlSetup.semantic_block, "control_setup");
assert.equal(controlSetup.status, "control_setup_required");
assert.equal(controlSetup.target, "/repo/target");
assert.equal(controlSetup.durable_scope, ".agdf/control");
assert.deepEqual(controlSetup.excluded_authority, ["automatic_run_creation", "automatic_ur_persistence", "gate_approval"]);
assert.equal(controlSetup.authorizes, false);
assert.match(controlSetup.markdown, /AGDF-Kontrollstatus einrichten/);
assert.match(controlSetup.markdown, /Aktiver Delivery-Intake persistiert danach Run und UR ohne zweite Frage/);
assert.match(controlSetup.markdown, /eigenständiges Init bleibt gerüstbezogen/);
assert.doesNotMatch(controlSetup.markdown, /Approval: UR/);
assert.equal(renderControlSetupOrientation({ target: "" }, { registry: sourceRegistry, requestedLocale: "de" }), null);
const incompleteControlSetupRegistry = JSON.parse(JSON.stringify(sourceRegistry));
delete incompleteControlSetupRegistry.locales.de.controlSetup.actionValue;
assert.equal(renderControlSetupOrientation({ target: "/repo/target" }, { registry: incompleteControlSetupRegistry, requestedLocale: "de" }), null);

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
    presentation_language: "en",
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
    humanPresentation: { runTitle: "Status run", gateTitle: "Quality assurance", artefactRefs: refs },
  });
  assert.equal(presentation.semantic_block, "run_status_card");
  assert.equal(presentation.presentation_language, "en");
  assert.equal(presentation.revision_id, "status-revision");
  assert.equal(presentation.authorizes, false);
  assert.equal(Object.isFrozen(presentation), true);
  assert.match(presentation.markdown, /^## AGDF status-card/);
  assert.match(presentation.markdown, /review &lt;evidence&gt;<br>keep a \\\| literal/);
  assert.match(presentation.markdown, /Forbidden now \| release/);
  assert.doesNotMatch(presentation.markdown, /Direct fixture/);
  assert.equal(renderOperationalStatusCard(null, { registry, humanPresentation: {} }), null);
  assert.equal(renderOperationalStatusCard({ run_id: "status-run", current_gate: "QA", presentation_language: "de" }, { registry, revisionId: "", humanPresentation: {} }).revision_id, "unversioned");
  const failedLines = [];
  assert.equal(printGateCheckReport({ status_card: { presentation_language: "de" }, status_presentation: null }, false, true, { log: (line) => failedLines.push(line) }), false);
  assert.match(failedLines[0], /Statuskarte nicht sicher darstellbar/);
}

{
  const germanPresentation = renderOperationalStatusCard({
    run_id: "status-run",
    presentation_language: "de-AT",
    status: "blocked",
    current_gate: "QA",
    breadcrumb: [{ gate: "UR", status: "fulfilled" }, { gate: "QA", status: "current" }],
    allowed_now: [
      "complete the current control-state fields",
      "revise the implementation against the QA findings",
      "refresh CD+Tests and mandatory reviews",
      "rerun QA with refreshed evidence",
      "run doctor again",
    ],
    forbidden_now: [
      "create later-gate artefacts beyond the current allowed gate",
      "implement gated work before the gate allows it",
      "claim QA or release readiness",
    ],
    blocking_condition: "AGDF_MISSING_EVIDENCE_DECLARED",
    missing_approval: "none",
    next_gate_after_approval: "none",
    allowed_after_approval: "none",
    next_step: "Repair the separately owned runtime-packaging baseline, rerun complete smoke and refresh QA.",
    quality_outlook: "Preserve the distinction between installed state and fresh-session loaded behavior.",
  }, {
    registry,
    revisionId: "status-revision",
    humanPresentation: { runTitle: "Status run", gateTitle: "Qualitätssicherung", artefactRefs: refs },
  });
  assert.equal(germanPresentation.presentation_language, "de");
  assert.match(germanPresentation.markdown, /die aktuellen Felder des Kontrollstatus vervollständigen/);
  assert.match(germanPresentation.markdown, /Die separat verwaltete Runtime-Packaging-Baseline reparieren/);
  assert.match(germanPresentation.markdown, /Ladeverhalten einer frischen Session/);
  assert.doesNotMatch(germanPresentation.markdown, /complete the current|revise the implementation|Repair the separately|Preserve the distinction/);

  const unregisteredGermanCard = {
    run_id: "status-run",
    presentation_language: "de",
    status: "blocked",
    current_gate: "QA",
    allowed_now: ["unregistered English value"],
    forbidden_now: [],
    blocking_condition: "none",
    missing_approval: "none",
    next_gate_after_approval: "none",
    allowed_after_approval: "none",
    next_step: "Repair the separately owned runtime-packaging baseline, rerun complete smoke and refresh QA.",
    quality_outlook: "Preserve the distinction between installed state and fresh-session loaded behavior.",
  };
  assert.equal(renderOperationalStatusCard(unregisteredGermanCard, { registry, humanPresentation: {} }), null, "non-fallback locales fail closed instead of mixing unregistered text");
  assert.ok(validateOperationalStatusCardPreconditions(unregisteredGermanCard, { registry, humanPresentation: {} }).errors.includes("allowed_now_unlocalized"));

  const germanQaApproval = renderOperationalStatusCard({
    run_id: "status-run",
    presentation_language: "de",
    status: "open",
    current_gate: "QA",
    allowed_now: ["run QA gate", "persist or refine the QA report", "request exact QA approval"],
    forbidden_now: ["request UAT approval", "release", "claim delivery readiness before QA approval and report evidence"],
    blocking_condition: "none",
    missing_approval: "Approval: QA",
    next_gate_after_approval: "UAT",
    allowed_after_approval: "Request UAT when QA has passed; release remains gated.",
    next_step: "Request exact approval: Approval: QA.",
    quality_outlook: "Preserve the distinction between installed state and fresh-session loaded behavior.",
  }, { registry, humanPresentation: { gateTitle: "Qualitätssicherung" } });
  assert.match(germanQaApproval.markdown, /das QA-Gate durchführen/);
  assert.match(germanQaApproval.markdown, /Die exakte Freigabe Approval: QA anfordern/);
  assert.doesNotMatch(germanQaApproval.markdown, /run QA gate|Request UAT when|Request exact approval/);

  const germanUatApproval = renderOperationalStatusCard({
    run_id: "status-run",
    presentation_language: "de",
    status: "open",
    current_gate: "UAT",
    allowed_now: ["request exact UAT approval", "prepare non-operative delivery summary"],
    forbidden_now: ["release", "push", "open PR", "commit without explicit user instruction and required approval"],
    blocking_condition: "none",
    missing_approval: "Approval: UAT",
    next_gate_after_approval: "OR",
    allowed_after_approval: "Produce OR or delivery closeout; VCS and release actions still require explicit instruction.",
    next_step: "Restart GitHub Copilot and capture fresh-session installed-plugin, skill-discovery and SessionStart evidence before the UAT decision.",
    quality_outlook: "Preserve the distinction between installed state and fresh-session loaded behavior.",
  }, { registry, humanPresentation: { gateTitle: "Nutzerabnahme" } });
  assert.match(germanUatApproval.markdown, /die exakte UAT-Freigabe anfordern/);
  assert.match(germanUatApproval.markdown, /GitHub Copilot neu starten/);
  assert.doesNotMatch(germanUatApproval.markdown, /request exact UAT|prepare non-operative|Produce OR|Restart GitHub Copilot/);
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
const approvalTransitionForGate = (gate) => postApprovalTransition(`Approval: ${gate}`);
let nativeCalls = 0;
let fallbackCalls = 0;
const preflightSnapshot = buildApprovalOrientationSnapshot({
  ready: true,
  statusCard: { run_id: "alpha-run", status: "open", current_gate: "UR", missing_approval: "Approval: UR", ...approvalTransitionForGate("UR") },
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
assert.equal((interactionContract.match(/^### Post-activation read-only request orientation$/gm) ?? []).length, 1);
assert.match(interactionContract, /Silent Request Activation abstention for an ordinary read-only request renders no AGDF orientation/);
assert.match(interactionContract, /interaction_kind: clarification \| tool_permission \| gate_approval \| control_setup \| blocked \| status/);
assert.match(interactionContract, /For read-only status, `planned_effect` is `read_only_status`/);
assert.match(interactionContract, /do not create a run, write control files, request gate approval or\s+repeat the sentence/);
assert.match(
  interactionContract,
  /Clarification, blocked, internal-step and status-only\s+interactions must not display gate-approval controls/,
  "the focused interaction owner must keep non-approval interactions free of gate controls",
);
assert.equal(
  (gateCheckSkill.match(/`\.\.\/\.\.\/meta\/contracts\/interaction\.md`/g) ?? []).length,
  1,
  "compact gate-check must load the interaction owner only through its declared fallback",
);
assert.doesNotMatch(
  gateCheckSkill,
  /For status, blocked, read-only or rationale interactions/,
  "compact gate-check must not duplicate the focused interaction handbook",
);
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
    ...approvalTransitionForGate(gate),
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

for (const locale of ["en", "de"]) {
  for (const gate of ["UR", "TP"]) {
    const snapshot = buildApprovalOrientationSnapshot({
      ready: true,
      statusCard: {
        run_id: `internal-${gate.toLowerCase()}`,
        status: "open",
        current_gate: gate,
        missing_approval: `Approval: ${gate}`,
        ...approvalTransitionForGate(gate),
      },
      humanPresentation: { runTitle: `Internal ${gate}`, gateTitle: gateTitle(registry, locale, gate), artefactRefs: refs },
      revisionId: `internal-${locale}-${gate}`,
      registry,
      requestedLocale: locale,
    });
    const noAction = registry.locales[locale].primary.narration.noAction;
    assert.equal(snapshot.gate_transition_card.next_gate, approvalTransitionForGate(gate).next_gate_after_approval);
    assert.ok(snapshot.gate_transition_card.next_transition.includes(noAction), `${locale} ${gate} uses no-action narration`);
    assert.equal(snapshot.gate_transition_card.next_transition.includes(registry.locales[locale].interaction.decisionFollows), false);
    assert.deepEqual(validateApprovalOrientationSnapshot(snapshot, { registry }), { valid: true, errors: [] });
  }

  const userGateSnapshot = buildApprovalOrientationSnapshot({
    ready: true,
    statusCard: {
      run_id: "user-gate-prd",
      status: "open",
      current_gate: "PRD",
      missing_approval: "Approval: PRD",
      ...approvalTransitionForGate("PRD"),
    },
    humanPresentation: { runTitle: "User gate PRD", gateTitle: gateTitle(registry, locale, "PRD"), artefactRefs: refs },
    revisionId: `user-gate-${locale}`,
    registry,
    requestedLocale: locale,
  });
  assert.ok(userGateSnapshot.gate_transition_card.next_transition.includes(registry.locales[locale].interaction.decisionFollows));
  assert.equal(userGateSnapshot.gate_transition_card.next_transition.includes(registry.locales[locale].primary.narration.noAction), false);
  assert.deepEqual(validateApprovalOrientationSnapshot(userGateSnapshot, { registry }), { valid: true, errors: [] });
}

for (const statusCard of [
  { run_id: "contradictory-no", status: "open", current_gate: "UR", missing_approval: "Approval: UR", next_gate_after_approval: "Brownfield Review", next_user_gate: "SD", user_action_required: "no" },
  { run_id: "contradictory-yes", status: "open", current_gate: "UR", missing_approval: "Approval: UR", next_gate_after_approval: "Brownfield Review", next_user_gate: "SD", user_action_required: "yes" },
]) {
  assert.equal(buildApprovalOrientationSnapshot({
    ready: true,
    statusCard,
    humanPresentation: { runTitle: "Contradictory", gateTitle: gateTitle(registry, "en", "UR"), artefactRefs: refs },
    revisionId: "contradictory",
    registry,
    requestedLocale: "en",
  }), null, "contradictory user-action semantics must fail closed");
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
Object.assign(readyStatus, approvalTransitionForGate("QA"));
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
  const fullCardMarkdown = "## AGDF status card\n\n| Field | Value |\n|---|---|\n| Missing approval | Approval: UR |";
  const output = printApprovalEnvelope({
    status: "open",
    approval_presentation: rendered,
    status_presentation: { markdown: fullCardMarkdown },
  }, { io: { log: (line = "") => lines.push(String(line)) } });
  assert.equal(output.outcome, "rendered");
  assert.equal(output.requested_decision, true);
  assert.equal(lines.length, 7);
  assert.match(lines[0], /^## Nutzeranforderungen prüfen und entscheiden/);
  assert.equal(lines[2], fullCardMarkdown, "envelope renders the full operational status card verbatim between the cards");
  assert.equal(lines.filter((line) => line === fullCardMarkdown).length, 1, "full card appears exactly once");
  assert.match(lines[4], /Nutzeranforderungen ·/);
  assert.match(lines.at(-1), /Approval: UR/);
}

{
  // Degradation: a ready gate without a deliverable full card names the codes at the card position.
  const rendered = renderApprovalOrientationSnapshot(preflightSnapshot);
  const lines = [];
  const output = printApprovalEnvelope({
    status: "open",
    approval_presentation: rendered,
    status_presentation: null,
    presentation_diagnostics: { status_presentation_errors: ["run_id_missing"] },
  }, { io: { log: (line = "") => lines.push(String(line)) } });
  assert.equal(output.outcome, "rendered");
  assert.match(lines[2], /run_id_missing/, "degradation line carries the concrete codes");
  assert.match(lines.at(-1), /Approval: UR/, "decision is still requested");
}

{
  // Negative control: empty diagnostics never render empty parentheses.
  const rendered = renderApprovalOrientationSnapshot(preflightSnapshot);
  const lines = [];
  printApprovalEnvelope({
    status: "open",
    approval_presentation: rendered,
    status_presentation: null,
    presentation_diagnostics: { status_presentation_errors: [] },
  }, { io: { log: (line = "") => lines.push(String(line)) } });
  assert.doesNotMatch(lines[2], /\(\)/, "no empty parentheses on the degradation line");
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

// IPP: single identity owner — presentation consumes the canonical pattern, no second regex
{
  const presentationSource = readFileSync(join(import.meta.dirname, "..", "lib", "interaction-presentation.js"), "utf8");
  assert.match(presentationSource, /from "\.\/control-state\/run-identity\.js"/, "IPP: presentation imports the shared identity owner");
  assert.equal(presentationSource.includes("/^[A-Za-z0-9._-]+$/"), false, "IPP: retired presentation-local run_id superset regex is gone");
  assert.equal(RUN_ID_PATTERN.test("approval-run"), true);
  assert.equal(RUN_ID_PATTERN.test("Approval-Run"), false, "IPP: canonical pattern is authoritative for presentation eligibility");
}

// IPP: status-card precondition validator mirrors the silent-null conditions
{
  assert.deepEqual([...validateOperationalStatusCardPreconditions(null, { registry }).errors], ["status_card_missing"]);
  assert.deepEqual(
    [...validateOperationalStatusCardPreconditions({ current_gate: "QA", presentation_language: "de" }, { registry, humanPresentation: {} }).errors],
    ["run_id_missing"],
  );
  assert.deepEqual(
    [...validateOperationalStatusCardPreconditions({ run_id: "status-run", presentation_language: "de" }, { registry, humanPresentation: {} }).errors],
    ["current_gate_missing"],
  );
  assert.deepEqual(
    [...validateOperationalStatusCardPreconditions({ run_id: "status-run", current_gate: "QA" }, { registry, humanPresentation: null }).errors],
    ["human_presentation_missing"],
  );
  const healthy = validateOperationalStatusCardPreconditions({ run_id: "status-run", current_gate: "QA", presentation_language: "de" }, { registry, humanPresentation: {} });
  assert.deepEqual([...healthy.errors], []);
  assert.equal(healthy.valid, true);
}

// IPP: approval precondition validator mirrors buildApprovalOrientationSnapshot guards
{
  assert.deepEqual([...validateApprovalOrientationPreconditions({ statusCard: null, registry }).errors], ["status_card_missing"]);
  const readyCard = {
    run_id: "approval-run",
    status: "open",
    current_gate: "UR",
    missing_approval: "Approval: UR",
    next_gate_after_approval: "PRD",
    next_user_gate: "PRD",
    user_action_required: "yes",
  };
  const healthy = validateApprovalOrientationPreconditions({ statusCard: readyCard, humanPresentation: {}, registry, requestedLocale: "de" });
  assert.deepEqual([...healthy.errors], []);
  assert.equal(healthy.valid, true);
  assert.deepEqual(
    [...validateApprovalOrientationPreconditions({ statusCard: { ...readyCard, run_id: "Bad Run" }, humanPresentation: {}, registry, requestedLocale: "de" }).errors],
    ["run_id_invalid"],
  );
  assert.deepEqual(
    [...validateApprovalOrientationPreconditions({ statusCard: { ...readyCard, current_gate: "Brownfield Review", missing_approval: "none" }, humanPresentation: {}, registry, requestedLocale: "de" }).errors],
    ["gate_not_user_gate", "missing_approval_mismatch"],
  );
  assert.deepEqual(
    [...validateApprovalOrientationPreconditions({ statusCard: { ...readyCard, status: "blocked" }, humanPresentation: {}, registry, requestedLocale: "de" }).errors],
    ["status_not_open"],
  );
  assert.deepEqual(
    [...validateApprovalOrientationPreconditions({ statusCard: { ...readyCard, user_action_required: "yes", next_user_gate: "none" }, humanPresentation: {}, registry, requestedLocale: "de" }).errors],
    ["user_action_semantics_invalid"],
  );
  // matching the retired superset but failing the canonical pattern must now be a precondition error
  assert.deepEqual(
    [...validateApprovalOrientationPreconditions({ statusCard: { ...readyCard, run_id: "Uppercase-Run" }, humanPresentation: {}, registry, requestedLocale: "de" }).errors],
    ["run_id_invalid"],
  );
  assert.equal(
    buildApprovalOrientationSnapshot({
      ready: true,
      statusCard: { ...readyCard, run_id: "Uppercase-Run" },
      humanPresentation: { runTitle: "Approval run", gateTitle: "UR", artefactRefs: refs },
      revisionId: "revision-1",
      registry,
      requestedLocale: "de",
    }),
    null,
    "IPP: canonical pattern gates snapshot eligibility",
  );
}

// IPP: CLI fallback lines carry the concrete presentation error codes
{
  const statusLines = [];
  const statusIo = { log: (line) => statusLines.push(String(line)) };
  const rendered = printGateCheckReport({
    status_card: { presentation_language: "en" },
    status_presentation: null,
    presentation_diagnostics: { status_presentation_errors: ["run_id_missing", "locale_unresolved"] },
  }, false, true, statusIo);
  assert.equal(rendered, false);
  assert.match(statusLines.join("\n"), /run_id_missing, locale_unresolved/, "IPP: status-card fallback names the error codes");

  const envelopeLines = [];
  const envelopeIo = { log: (line) => envelopeLines.push(String(line)) };
  const readyReport = {
    status: "open",
    current_gate: "UR",
    missing_approval: "Approval: UR",
    approval_presentation: null,
    presentation_diagnostics: { approval_presentation_errors: ["revision_identity"] },
    status_card: { presentation_language: "en" },
  };
  const envelopeResult = printApprovalEnvelope(readyReport, { io: envelopeIo, reEvaluate: () => readyReport });
  assert.equal(envelopeResult.outcome, "exact_text_recovery");
  assert.match(envelopeLines.join("\n"), /revision_identity/, "IPP: envelope fallback names the error codes");
  assert.match(envelopeLines.join("\n"), /Approval: UR/, "IPP: envelope fallback still requests the exact approval");
}

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
  const statusCard = { run_id: "r", status: "open", current_gate: gate, missing_approval: `Approval: ${gate}`, ...approvalTransitionForGate(gate), next_step: "Continue." };
  const snapshot = buildApprovalOrientationSnapshot({ ready: true, statusCard, humanPresentation: { runTitle: "Run", gateTitle: gate, artefactRefs: refs }, revisionId: "rev", registry, requestedLocale: "de" });
  assert.deepEqual(validateApprovalOrientationSnapshot(snapshot), { valid: true, errors: [] }, `snapshot valid for ${gate} with gateRationale present`);
}

console.log("gate rationale and why tests passed");

const validClassification = {
  outcome: "ungated",
  mode: "quick_task",
  trivial_boundary: "inside",
  ur_trigger_evaluation: "No new product semantics, functional change or user-visible behaviour.",
  allowed_summary: "Draft the minimal artefact and proceed with the quick task.",
  forbidden_summary: "PRD, SD, TP, implementation of gated scope, QA, release.",
  escalation_triggers: ["New product semantics discovered", "Boundary proves ambiguous"],
  challenge_path: "Override toward the UR gate by requesting a durable UR.",
};

const scopeCardEn = renderScopeClassificationCard(validClassification, { registry, requestedLocale: "en" });
assert.ok(scopeCardEn, "valid classification returns a card");
assert.equal(scopeCardEn.semantic_block, "scope_classification_card");
assert.equal(scopeCardEn.authorizes, false);
assert.ok(scopeCardEn.markdown.includes("Quick Task"), "card shows mode label");
assert.ok(scopeCardEn.markdown.includes("Challenge path"), "card shows challenge path field (SCC-5)");
assert.ok(!scopeCardEn.markdown.includes("Approval:"), "card must not contain approval vocabulary (SCC-2)");
assert.ok(!scopeCardEn.markdown.includes("approve"), "card must not contain approval-option vocabulary (SCC-2)");

const scopeCardEnRepeat = renderScopeClassificationCard(validClassification, { registry, requestedLocale: "en" });
assert.equal(scopeCardEnRepeat.markdown, scopeCardEn.markdown, "byte-identical repeat render (SCC-1)");

const scopeCardDe = renderScopeClassificationCard(validClassification, { registry, requestedLocale: "de" });
assert.ok(scopeCardDe, "valid classification returns a de card");
assert.ok(scopeCardDe.markdown.includes("Widerspruchspfad"), "de card shows localized challenge path");
assert.equal(scopeCardDe.presentation_language, "de");

const scopeCardUnsupportedLocale = renderScopeClassificationCard(validClassification, { registry, requestedLocale: "fr-CA" });
assert.ok(scopeCardUnsupportedLocale, "unsupported locale uses the complete fallback pack");
assert.equal(scopeCardUnsupportedLocale.presentation_language, "en");
assert.ok(scopeCardUnsupportedLocale.markdown.includes("Challenge path"), "unsupported locale renders complete English labels");

const incompleteRegistry = JSON.parse(JSON.stringify(registry));
delete incompleteRegistry.locales.de.scopeClassification;
const scopeCardFallback = renderScopeClassificationCard(validClassification, { registry: incompleteRegistry, requestedLocale: "de" });
assert.equal(scopeCardFallback, null, "incomplete de pack fails closed to null (SCC-6)");

const malformedRegistry = JSON.parse(JSON.stringify(registry));
malformedRegistry.schemaVersion = 2;
assert.equal(renderScopeClassificationCard(validClassification, { registry: malformedRegistry, requestedLocale: "en" }), null, "invalid registry fails closed");

assert.equal(renderScopeClassificationCard(null, { registry, requestedLocale: "en" }), null, "null input returns null");
assert.equal(renderScopeClassificationCard({ outcome: "gated" }, { registry, requestedLocale: "en" }), null, "gated outcome returns null");
assert.equal(renderScopeClassificationCard({ ...validClassification, outcome: "gated" }, { registry, requestedLocale: "en" }), null, "complete gated input returns null");
assert.equal(renderScopeClassificationCard({ ...validClassification, mode: "verified_change" }, { registry, requestedLocale: "en" }), null, "Verified Change returns null");
assert.equal(renderScopeClassificationCard({ ...validClassification, mode: "structured_delivery" }, { registry, requestedLocale: "en" }), null, "Structured Delivery returns null");
assert.equal(renderScopeClassificationCard({ ...validClassification, mode: "unknown" }, { registry, requestedLocale: "en" }), null, "unknown mode returns null");
assert.equal(renderScopeClassificationCard({ ...validClassification, trivial_boundary: "ambiguous" }, { registry, requestedLocale: "en" }), null, "ambiguous boundary returns null");
assert.equal(renderScopeClassificationCard({ ...validClassification, escalation_triggers: [] }, { registry, requestedLocale: "en" }), null, "empty escalation triggers returns null");
assert.equal(renderScopeClassificationCard({ ...validClassification, escalation_triggers: ["one", "two", "three", "four"] }, { registry, requestedLocale: "en" }), null, "four escalation triggers return null");
assert.equal(renderScopeClassificationCard({ ...validClassification, escalation_triggers: "one" }, { registry, requestedLocale: "en" }), null, "non-array escalation triggers return null");
assert.ok(renderScopeClassificationCard({ ...validClassification, escalation_triggers: ["one"] }, { registry, requestedLocale: "en" }), "one escalation trigger is valid");
assert.ok(renderScopeClassificationCard({ ...validClassification, escalation_triggers: ["one", "two", "three"] }, { registry, requestedLocale: "en" }), "three escalation triggers are valid");
assert.equal(renderScopeClassificationCard({ ...validClassification, escalation_triggers: ["same", " same "] }, { registry, requestedLocale: "en" }), null, "duplicate normalized escalation triggers return null");
assert.ok(renderScopeClassificationCard({ ...validClassification, escalation_triggers: ["a".repeat(240)] }, { registry, requestedLocale: "en" }), "escalation trigger accepts 240 code points");
assert.equal(renderScopeClassificationCard({ ...validClassification, escalation_triggers: ["a".repeat(241)] }, { registry, requestedLocale: "en" }), null, "escalation trigger rejects 241 code points");
assert.equal(renderScopeClassificationCard({ ...validClassification, escalation_triggers: ["   "] }, { registry, requestedLocale: "en" }), null, "whitespace-only escalation trigger returns null");
assert.equal(renderScopeClassificationCard({ ...validClassification, escalation_triggers: [42] }, { registry, requestedLocale: "en" }), null, "non-string escalation trigger returns null");
assert.equal(renderScopeClassificationCard({ ...validClassification, challenge_path: "" }, { registry, requestedLocale: "en" }), null, "missing challenge path returns null");

const scopeScalarFields = ["ur_trigger_evaluation", "allowed_summary", "forbidden_summary", "challenge_path"];
for (const field of scopeScalarFields) {
  assert.ok(renderScopeClassificationCard({ ...validClassification, [field]: "x" }, { registry, requestedLocale: "en" }), `${field} accepts one code point`);
  assert.ok(renderScopeClassificationCard({ ...validClassification, [field]: "a".repeat(240) }, { registry, requestedLocale: "en" }), `${field} accepts 240 code points`);
  assert.equal(renderScopeClassificationCard({ ...validClassification, [field]: "a".repeat(241) }, { registry, requestedLocale: "en" }), null, `${field} rejects 241 code points`);
  assert.equal(renderScopeClassificationCard({ ...validClassification, [field]: 42 }, { registry, requestedLocale: "en" }), null, `${field} rejects implicit number coercion`);
  assert.equal(renderScopeClassificationCard({ ...validClassification, [field]: ["text"] }, { registry, requestedLocale: "en" }), null, `${field} rejects implicit array coercion`);
  assert.equal(renderScopeClassificationCard({ ...validClassification, [field]: "   " }, { registry, requestedLocale: "en" }), null, `${field} rejects whitespace-only input`);
  assert.equal(renderScopeClassificationCard({ ...validClassification, [field]: "first\nsecond" }, { registry, requestedLocale: "en" }), null, `${field} rejects newline input`);
  assert.equal(renderScopeClassificationCard({ ...validClassification, [field]: "first\rsecond" }, { registry, requestedLocale: "en" }), null, `${field} rejects carriage-return input`);
  assert.equal(renderScopeClassificationCard({ ...validClassification, [field]: "first\u2028second" }, { registry, requestedLocale: "en" }), null, `${field} rejects Unicode line-separator input`);
  assert.equal(renderScopeClassificationCard({ ...validClassification, [field]: "first\u2029second" }, { registry, requestedLocale: "en" }), null, `${field} rejects Unicode paragraph-separator input`);
}

const astralBoundary = "😀".repeat(240);
assert.ok(renderScopeClassificationCard({ ...validClassification, allowed_summary: astralBoundary }, { registry, requestedLocale: "en" }), "240 astral code points are valid");
assert.equal(renderScopeClassificationCard({ ...validClassification, allowed_summary: `${astralBoundary}😀` }, { registry, requestedLocale: "en" }), null, "241 astral code points are rejected");

const markdownBearingValues = [
  "# heading",
  "*emphasis*",
  "_emphasis_",
  "`code`",
  "[link](https://example.com)",
  "![image](asset.png)",
  "> quote",
  "- item",
  "+ item",
  "1. item",
  "value | cell",
  "escaped \\ token",
  "<tag>",
];
for (const field of scopeScalarFields) {
  for (const value of markdownBearingValues) {
    assert.equal(renderScopeClassificationCard({ ...validClassification, [field]: value }, { registry, requestedLocale: "en" }), null, `${field} rejects Markdown-bearing value: ${value}`);
  }
}
for (const value of markdownBearingValues) {
  assert.equal(renderScopeClassificationCard({ ...validClassification, escalation_triggers: [value] }, { registry, requestedLocale: "en" }), null, `escalation trigger rejects Markdown-bearing value: ${value}`);
}
assert.ok(renderScopeClassificationCard({
  ...validClassification,
  allowed_summary: "Ordinary punctuation: commas, periods, colons; and https://example.com/path?q=1&b=2 are valid.",
}, { registry, requestedLocale: "en" }), "ordinary punctuation and a plain URL remain valid");
assert.ok(Object.isFrozen(scopeCardEn), "scope classification result remains frozen");

console.log("scope classification card tests passed");

const explicitTarget = {
  resolution_state: "resolved",
  reason_code: "explicit_target",
  primary_target: "/tmp/analysis.md",
  governance_target: "",
  evidence_sources: ["/repo/AGDF"],
  working_directory: "/repo/AGDF",
  target_changed: false,
  next_action: "",
};

const targetCardEn = renderTaskTargetOrientation(explicitTarget, { registry, requestedLocale: "en" });
assert.ok(targetCardEn, "valid explicit target returns an orientation");
assert.equal(targetCardEn.semantic_block, "task_target_orientation");
assert.equal(targetCardEn.authorizes, false);
assert.equal(targetCardEn.resolution_state, "resolved");
assert.ok(targetCardEn.markdown.includes("/tmp/analysis.md"), "resolved orientation shows primary target");
assert.ok(targetCardEn.markdown.includes("/repo/AGDF"), "resolved orientation shows evidence and working directory");
assert.ok(!targetCardEn.markdown.includes("Approval:"), "target orientation never contains approval controls");

const continuedTarget = renderTaskTargetOrientation({
  ...explicitTarget,
  reason_code: "continued_target",
  target_changed: true,
}, { registry, requestedLocale: "de" });
assert.ok(continuedTarget.markdown.includes("Ziel gewechselt"), "changed target is visible");
assert.equal(continuedTarget.presentation_language, "de");

for (const reasonCode of [
  "multiple_plausible_targets",
  "target_content_mismatch",
  "target_unavailable",
  "no_reliable_target",
]) {
  const unresolved = renderTaskTargetOrientation({
    resolution_state: "unresolved",
    reason_code: reasonCode,
    primary_target: "",
    governance_target: "",
    evidence_sources: ["/repo/evidence"],
    working_directory: "/repo/current",
    target_changed: false,
    next_action: "Clarify or supply the requested target, then retry.",
  }, { registry, requestedLocale: "en" });
  assert.ok(unresolved, `${reasonCode} renders a fail-closed orientation`);
  assert.equal(unresolved.resolution_state, "unresolved");
  assert.ok(unresolved.markdown.includes("Next action"), `${reasonCode} shows recovery`);
  assert.ok(!unresolved.markdown.includes("Clarify or supply"), `${reasonCode} uses the locale-owned recovery text`);
}

const targetCardDe = renderTaskTargetOrientation({
  resolution_state: "unresolved",
  reason_code: "no_reliable_target",
  primary_target: "",
  governance_target: "",
  evidence_sources: [],
  working_directory: "/tmp/chat",
  target_changed: false,
  next_action: "Name exactly one primary task target.",
}, { registry, requestedLocale: "de" });
assert.match(targetCardDe.markdown, /Ein primäres Ziel benennen\./);
assert.doesNotMatch(targetCardDe.markdown, /Name exactly one/);

const incompleteTargetRegistry = JSON.parse(JSON.stringify(registry));
delete incompleteTargetRegistry.locales.de.taskTargetResolution;
assert.equal(
  renderTaskTargetOrientation(explicitTarget, { registry: incompleteTargetRegistry, requestedLocale: "de" }),
  null,
  "incomplete target locale pack fails closed",
);
assert.equal(renderTaskTargetOrientation(null, { registry, requestedLocale: "en" }), null);
assert.equal(renderTaskTargetOrientation({ ...explicitTarget, target_changed: "false" }, { registry, requestedLocale: "en" }), null);
assert.equal(renderTaskTargetOrientation({ ...explicitTarget, resolution_state: "unknown" }, { registry, requestedLocale: "en" }), null);
assert.equal(renderTaskTargetOrientation({ ...explicitTarget, reason_code: "target_unavailable" }, { registry, requestedLocale: "en" }), null);
assert.equal(renderTaskTargetOrientation({ ...explicitTarget, next_action: "Unexpected" }, { registry, requestedLocale: "en" }), null);
assert.equal(renderTaskTargetOrientation({
  ...explicitTarget,
  resolution_state: "unresolved",
  reason_code: "target_unavailable",
  primary_target: "",
  governance_target: "/repo/AGDF",
  next_action: "Retry",
}, { registry, requestedLocale: "en" }), null);

console.log("task target orientation tests passed");
