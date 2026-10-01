import { attachApprovalOrientationSnapshot, buildArtefactRefs, buildQualityReadiness, gateTitle, isOperationalValueRenderable, localePack, renderApprovalOrientationSnapshot, renderControlSetupOrientation, renderOperationalStatusCard, renderRunResolutionCard, resolveHumanRunTitle, resolvePresentationLocale, validateApprovalOrientationPreconditions, validateApprovalOrientationSnapshot, validateOperationalStatusCardPreconditions } from "../interaction-presentation.js";
import { interactionLocales, resolveConfiguredChatLanguage } from "../resources/context.js";
import { evaluateDoctor } from "./doctor.js";
import { analyzeDeliveryMap, deriveQualityOutlook } from "./delivery-map.js";
import { isGateSatisfied, transitionDecisionForRunState } from "./gate-policy.js";
import { evaluateVerifiedChange, extractField, verifiedChangeEscalationTargets } from "./verified-change.js";
import { gateApprovalStatus, isInternalStepSatisfied, modeSliceDecision, readArtefactHeading, readRunState, resolvedArtefactFile } from "./run-state.js";
import { isPlaceholderValue } from "./shared.js";
import { renderReviewableApproval } from "../control-state/run-presentation-render.js";
import { evaluatePrdReadiness } from "./prd-readiness.js";
import { evaluateSdTraceability, evaluateTpTraceability } from "./traceability-readiness.js";

const nextSkillByGate = {
  UR: "gate-check",
  "Brownfield Review": "brownfield-analysis",
  "Mode/Slice Decision": "gate-check",
  "Quick Task Execution": "none",
  "Verified Change Execution": "gate-check",
  PRD: "gate-check",
  SD: "gate-check",
  TP: "gate-check",
  "Brownfield Analysis": "brownfield-analysis",
  "CD+Tests": "none",
  CR: "code-review",
  QA: "qa-gate",
  UAT: "delivery-closeout",
  OR: "release-or",
};

const gateArtifactPreparationPlans = Object.freeze({
  PRD: Object.freeze({ file: "PRD.md", sources: ["UR.md", "BROWNFIELD_REVIEW.md"] }),
  SD: Object.freeze({ file: "SD.md", sources: ["PRD.md"], requireUnpassedRelationship: true }),
  TP: Object.freeze({ file: "TP.md", sources: ["PRD.md", "SD.md"], requireUnpassedRelationship: true }),
});

function requiredGateArtifactPreparation({ status, currentGate, missingApproval,
  modeDecision, approvalPresentation, presentationDiagnostics, deliveryMap, runId }) {
  const plan = gateArtifactPreparationPlans[currentGate];
  if (!plan || status !== "open" || missingApproval !== `Approval: ${currentGate}`
      || !["structured_slice", "structured_delivery"].includes(modeDecision)
      || approvalPresentation || presentationDiagnostics?.approval_presentation_errors?.length
      || !runId) return null;

  if (plan.requireUnpassedRelationship
      && (deliveryMap.relationships ?? []).find((relationship) => relationship.from === currentGate)?.status === "pass") {
    return null;
  }

  return Object.freeze({
    type: "prepare_gate_artifact",
    gate: currentGate,
    skill_id: "gate-check",
    artifact_path: `.agdf/control/artefacts/${runId}/${plan.file}`,
    source_artifacts: Object.freeze(plan.sources.map((source) => `.agdf/control/artefacts/${runId}/${source}`)),
  });
}

export function postApprovalTransition(missingApproval, runState = null) {
  if (missingApproval === "Approval: UR" && runState
      && modeSliceDecision(runState) !== "undecided"
      && isInternalStepSatisfied(runState, "Brownfield Review")) {
    const approvals = new Map(runState.approvals);
    approvals.set("UR", { ...approvals.get("UR"), status: "approved" });
    const artefacts = new Map(runState.artefacts);
    artefacts.set("UR", { ...artefacts.get("UR"), status: "approved" });
    const after = transitionDecisionForRunState({ ...runState, approvals, artefacts });
    const nextUserGate = after.missing_approval.startsWith("Approval: ")
      ? after.missing_approval.slice("Approval: ".length)
      : "none";
    return {
      next_gate_after_approval: after.current_gate,
      allowed_after_approval: after.next_allowed_action,
      internal_next_step: after.next_allowed_action,
      next_user_gate: nextUserGate,
      user_action_required: nextUserGate === "none" ? "no" : "yes",
    };
  }
  const transitions = new Map([
    ["Approval: UR", {
      next_gate_after_approval: "Brownfield Review",
      allowed_after_approval: "Run Brownfield Review and proportional routing as one internal operation; no user action is required now.",
      internal_next_step: "Brownfield Review and proportional routing",
      next_user_gate: "none",
      user_action_required: "no",
    }],
    ["Approval: PRD", {
      next_gate_after_approval: "SD",
      allowed_after_approval: "Draft Solution Design; implementation remains forbidden.",
      internal_next_step: "draft Solution Design",
      next_user_gate: "SD",
      user_action_required: "yes",
    }],
    ["Approval: SD", {
      next_gate_after_approval: "TP",
      allowed_after_approval: "Draft Task/Test Plan; implementation remains forbidden.",
      internal_next_step: "draft Task/Test Plan",
      next_user_gate: "TP",
      user_action_required: "yes",
    }],
    ["Approval: TP", {
      next_gate_after_approval: "none",
      allowed_after_approval: "Run implementation-prep Brownfield Analysis before CD+Tests; no further user approval is required at this internal step.",
      internal_next_step: "pre-implementation Brownfield Analysis",
      next_user_gate: "none",
      user_action_required: "no",
    }],
    ["Approval: QA", {
      next_gate_after_approval: "UAT",
      allowed_after_approval: "Request UAT when QA has passed; release remains gated.",
      internal_next_step: "prepare UAT evidence",
      next_user_gate: "UAT",
      user_action_required: "yes",
    }],
    ["Approval: UAT", {
      next_gate_after_approval: "OR",
      allowed_after_approval: "Produce OR or delivery closeout; VCS and release actions still require explicit instruction.",
      internal_next_step: "OR or delivery closeout",
      next_user_gate: "none",
      user_action_required: "no",
    }],
  ]);

  return transitions.get(missingApproval) ?? {
    next_gate_after_approval: "none",
    allowed_after_approval: "none",
  };
}

const BREADCRUMB_PATH_TEMPLATES = {
  structured_delivery: ["UR", "PRD", "SD", "TP", "QA", "UAT"],
  structured_slice: ["UR", "PRD", "SD", "TP", "QA", "UAT"],
  verified_change: ["UR", "Verified Change", "OR"],
  quick_task: ["UR", "Compact Delivery"],
  block: ["UR", "Block"],
  undecided: ["UR"],
};

const BREADCRUMB_STANDARD_GATES = ["UR", "PRD", "SD", "TP", "QA", "UAT"];

export function isReadyUserGateApproval({ status, currentGate, missingApproval }) {
  return status === "open"
    && BREADCRUMB_STANDARD_GATES.includes(currentGate)
    && missingApproval === `Approval: ${currentGate}`;
}

function buildBreadcrumbPath(modeSliceDecision, currentGate, runState) {
  const gates = BREADCRUMB_PATH_TEMPLATES[modeSliceDecision] ?? ["UR"];
  return gates.map((gate) => {
    if (BREADCRUMB_STANDARD_GATES.includes(gate)) {
      if (gateApprovalStatus(runState, gate) === "approved") return { gate, status: "fulfilled" };
      if (gate === currentGate) return { gate, status: "current" };
      return { gate, status: "open" };
    }
    if (gate === currentGate) return { gate, status: "current" };
    if ((gate === "Verified Change" || gate === "Compact Delivery") && currentGate === "OR")
      return { gate, status: "fulfilled" };
    if (gate === "Verified Change" && modeSliceDecision === "verified_change")
      return { gate, status: "current" };
    if (gate === "Compact Delivery" && modeSliceDecision === "quick_task")
      return { gate, status: "current" };
    if (gate === "Block" && modeSliceDecision === "block")
      return { gate, status: "current" };
    if (gate === "OR" && currentGate === "OR")
      return { gate, status: "current" };
    return { gate, status: "open" };
  });
}

export function buildStatusCard({
  status,
  currentGate,
  allowed = [],
  forbidden = [],
  blockingReason = "none",
  missingApproval = "none",
  nextAllowedAction,
  runState,
  chatLanguage = "en",
  findings = [],
  prdReadinessItems = [],
  traceabilityGaps = [],
  blockingDetails = [],
  continuePostTpWork = false,
  nextActionRequiresUserAction = false,
  qualityOutlook = deriveQualityOutlook(runState, findings),
  interactionKind: requestedInteractionKind,
  approvalArtefactReady = true,
}) {
  const isUserGateApproval = approvalArtefactReady
    && isReadyUserGateApproval({ status, currentGate, missingApproval });
  const visibleMissingApproval = isUserGateApproval ? missingApproval : "none";
  const postApproval = postApprovalTransition(visibleMissingApproval, runState);
  const nextStep = isUserGateApproval
    ? "Review the linked artefact and choose whether to approve, request revision, or decline it."
    : continuePostTpWork
      ? localePack(interactionLocales, "en").operationalValues.nextCdTestsAfterTpApproval
      : nextAllowedAction;
  const needsUserAction = nextActionRequiresUserAction && !isUserGateApproval;
  const lifecycle = extractField(runState.content ?? "", "lifecycle") || "unknown";
  const nativeAttemptRequired = false;
  const interactionKind = requestedInteractionKind
    || (status === "open" && isUserGateApproval ? "gate_approval" : status === "blocked" ? "blocked" : "status");
  return {
    run_id: extractField(runState.content ?? "", "run_id") || "unknown",
    presentation_language: chatLanguage,
    mode: extractField(runState.content ?? "", "mode") || "unknown",
    lifecycle,
    delivery_state: lifecycle === "completed" && currentGate === "OR" ? "completed_closeout_pending" : lifecycle,
    status,
    current_gate: currentGate,
    mode_slice_decision: runState.mode_slice_decision?.decision || "undecided",
    breadcrumb: buildBreadcrumbPath(
      runState.mode_slice_decision?.decision || "undecided",
      currentGate,
      runState,
    ),
    allowed_now: allowed,
    forbidden_now: forbidden,
    blocking_condition: blockingReason || "none",
    missing_approval: visibleMissingApproval,
    next_gate_after_approval: postApproval.next_gate_after_approval,
    allowed_after_approval: postApproval.allowed_after_approval,
    user_visible_outcome_after_approval: postApproval.allowed_after_approval,
    internal_next_step: needsUserAction
      ? "none"
      : postApproval.internal_next_step || (isUserGateApproval ? "none" : nextStep),
    next_user_gate: postApproval.next_user_gate || "none",
    user_action_required: needsUserAction
      ? "yes"
      : postApproval.user_action_required || (isUserGateApproval ? "yes" : "no"),
    prd_readiness_items: prdReadinessItems,
    traceability_gaps: traceabilityGaps,
    blocking_details: blockingDetails,
    evidence: runState.evidence_refs,
    next_skill: nextSkillByGate[currentGate] ?? "gate-check",
    next_step: nextStep,
    quality_outlook: qualityOutlook,
    interaction_kind: interactionKind,
    native_attempt_required: nativeAttemptRequired,
    native_preflight_outcome: isUserGateApproval ? "unavailable_before_invocation" : "not_applicable",
    native_preflight_reason: isUserGateApproval ? "capability_missing" : "none",
  };
}

function statusFromReviewArtefact(artefact) {
  if (!artefact) return "unknown";
  const text = `${artefact.status ?? ""} ${artefact.notes ?? ""}`.toLowerCase();
  for (const status of ["block", "revise", "warn", "pass"]) {
    if (new RegExp(`\\b${status}(?:ed)?\\b`).test(text)) return status;
  }
  return "unknown";
}

export function qualityReadinessForRunState(runState, nextAction) {
  const artefacts = runState.artefacts;
  const plan = artefacts.get("TP Review");
  const clean = artefacts.get("Clean Implementation Review") ?? artefacts.get("Clean Review");
  const code = artefacts.get("CR") ?? artefacts.get("Code Review");
  const qa = artefacts.get("QA");
  if (![plan, clean, code, qa].some(Boolean)) return null;
  const reviewRows = [plan, clean, code, qa].filter(Boolean);
  const decisive = reviewRows.find((artefact) => /\b(?:block|revise)\b/i.test(`${artefact.status ?? ""} ${artefact.notes ?? ""}`));
  const readiness = buildQualityReadiness({
    planCoverage: statusFromReviewArtefact(plan),
    solutionIntegrity: statusFromReviewArtefact(clean),
    codeQuality: statusFromReviewArtefact(code),
    qaDecision: statusFromReviewArtefact(qa),
    decisiveReason: decisive?.notes ?? "",
    nextAction,
  });
  if (!readiness) return null;
  return Object.freeze({ ...readiness, decisive_reference: decisive?.path ?? "" });
}

// A gate question needs the artefact it approves: a durable file for UR/PRD/SD/TP and a passing QA
// report for QA. UAT approves the delivered result and has no separate artefact.
export function isDurableApprovalArtefactPresent(targetDir, runState, gate) {
  if (gate === "UAT") return true;
  const artefact = runState.artefacts.get(gate);
  if (!artefact || !resolvedArtefactFile(targetDir, artefact.path)) return false;
  return gate !== "QA" || ["pass", "passed"].includes(artefact.status);
}

function buildHumanPresentation(targetDir, runState, currentGate, presentationLocale) {
  const currentArtefactHeading = readArtefactHeading(targetDir, runState.artefacts.get(currentGate));
  const urHeading = readArtefactHeading(targetDir, runState.artefacts.get("UR"));
  return {
    runTitle: resolveHumanRunTitle({
      currentArtefactHeading,
      urHeading,
      runContent: runState.content,
      runId: extractField(runState.content ?? "", "run_id") || "unknown",
    }),
    gateTitle: gateTitle(interactionLocales, presentationLocale, currentGate),
    artefactRefs: buildArtefactRefs(runState.artefacts, interactionLocales, presentationLocale, {
      pathExists(path) {
        return Boolean(resolvedArtefactFile(targetDir, path));
      },
    }),
  };
}

export function evaluateGateCheck(targetDir, selection = {}, dependencies = {}) {
  const doctorReport = evaluateDoctor(targetDir, selection, dependencies);
  const runState = readRunState(targetDir, selection);
  const verifiedChange = modeSliceDecision(runState) === "verified_change"
    ? evaluateVerifiedChange(targetDir, runState, dependencies)
    : null;
  const transitionDecision = transitionDecisionForRunState(runState, verifiedChange);
  const deliveryMap = analyzeDeliveryMap(runState, {
    loadRun: (runId) => readRunState(targetDir, { runId }),
    resolveFile: (path) => resolvedArtefactFile(targetDir, path),
  });
  const doctorBlocker = doctorReport.findings.find((finding) => finding.severity === "block");
  const doctorRevise = doctorReport.findings.find((finding) => finding.severity === "revise");
  const routesInvalidVerifiedChange = modeSliceDecision(runState) === "verified_change"
    && verifiedChange?.status === "invalid"
    && verifiedChangeEscalationTargets.has(verifiedChange.escalation_target);

  let status = transitionDecision.status;
  let currentGate = transitionDecision.current_gate;
  let blockingReason = transitionDecision.blocking_reason;
  let missingApproval = transitionDecision.missing_approval;
  let allowed = transitionDecision.allowed;
  let forbidden = transitionDecision.forbidden;
  let nextAllowedAction = modeSliceDecision(runState) === "verified_change"
    ? transitionDecision.next_allowed_action
    : isPlaceholderValue(runState.next_allowed_action)
    ? transitionDecision.next_allowed_action
    : runState.next_allowed_action;
  let controlSetupRequired = false;

  if (doctorBlocker?.code === "AGDF_CONTROL_FILE_MISSING") {
    controlSetupRequired = true;
    status = "blocked";
    blockingReason = doctorBlocker.code;
    currentGate = "UR";
    missingApproval = "none";
    allowed = [
      "draft the minimal UR for the requested change in the response",
      "obtain explicit authority to initialize or link durable control",
      "initialize and persist durable control before requesting a gate approval",
    ];
    forbidden = ["create PRD", "create SD", "create TP", "run Brownfield Analysis as implementation preparation", "implement code", "claim QA or release readiness"];
    nextAllowedAction = "Draft the minimal UR, obtain explicit setup or link authority, then initialize and persist durable control before requesting any gate approval.";
  } else if (doctorBlocker?.code === "AGDF_ACTIVE_RUN_MISSING") {
    status = "blocked";
    blockingReason = doctorBlocker.code;
    currentGate = "UR";
    missingApproval = "none";
    allowed = [
      "create or migrate a canonical run with an explicit run id",
      "select an existing canonical run explicitly",
      "persist a real UR revision before requesting gate approval",
      "run doctor again",
    ];
    forbidden = ["request gate approval without a durable run and artefact", "implement gated work", "claim QA or release readiness"];
    nextAllowedAction = "Create, migrate or select the canonical run, then persist its UR revision before requesting approval.";
  } else if (doctorBlocker && /AGDF_(?:ACTIVE_RUN|RUN_NOT_SELECTABLE|RUN_PATH_INVALID)/u.test(doctorBlocker.code)) {
    status = "blocked";
    blockingReason = doctorBlocker.code;
    missingApproval = "none";
    allowed = ["select an existing canonical run explicitly", "run doctor again"];
    forbidden = ["request gate approval without a durable run and artefact", "implement gated work", "claim QA or release readiness"];
    nextAllowedAction = doctorBlocker.next_step;
  } else if (doctorBlocker && !routesInvalidVerifiedChange) {
    status = "blocked";
    blockingReason = doctorBlocker.code;
    allowed = ["repair the AGDF control scaffold", "run doctor again"];
    forbidden = ["create later-gate artefacts beyond the current allowed gate", "implement gated work", "claim QA or release readiness"];
    nextAllowedAction = doctorBlocker.next_step;
  } else if (doctorRevise && !routesInvalidVerifiedChange) {
    status = "blocked";
    blockingReason = doctorRevise.code;
    allowed = ["complete the current control-state fields", "run doctor again"];
    forbidden = ["create later-gate artefacts beyond the current allowed gate", "implement gated work before the gate allows it", "claim QA or release readiness"];
    nextAllowedAction = doctorRevise.next_step;
  }

  const approvalArtefactReady = isDurableApprovalArtefactPresent(targetDir, runState, currentGate);
  const prdReadiness = currentGate === "PRD" && approvalArtefactReady
    ? evaluatePrdReadiness(targetDir, runState) : null;
  if (status === "open" && currentGate === "PRD" && prdReadiness && !prdReadiness.ready) {
    status = "blocked";
    blockingReason = "AGDF_PRD_DECISIONS_OPEN";
    allowed = ["complete the listed PRD readiness items together and record a new run revision"];
    forbidden = [...forbidden, "present or approve PRD before required decisions and acceptance criteria are ready"];
    // Fixed text keeps the card localizable; detailed gaps travel separately in prd_readiness.open_decisions.
    nextAllowedAction = "complete the open PRD readiness items together, then record the revision with run-update";
  }
  const traceabilityReadiness = status === "open" && approvalArtefactReady && currentGate === "SD"
    ? evaluateSdTraceability(targetDir, runState)
    : status === "open" && approvalArtefactReady && currentGate === "TP"
      ? evaluateTpTraceability(targetDir, runState)
      : null;
  if (traceabilityReadiness && !traceabilityReadiness.ready) {
    status = "blocked";
    blockingReason = currentGate === "SD" ? "AGDF_SD_TRACEABILITY_INCOMPLETE" : "AGDF_TP_TRACEABILITY_INCOMPLETE";
    allowed = [currentGate === "SD"
      ? "complete the listed SD traceability rows and record a new run revision"
      : "complete the listed TP traceability rows and record a new run revision"];
    forbidden = [...forbidden, "present or approve the current artefact before its traceability is complete"];
    nextAllowedAction = currentGate === "SD"
      ? "complete the listed SD traceability rows, then record the revision with run-update"
      : "complete the listed TP traceability rows, then record the revision with run-update";
  }
  if (status === "open" && /^Approval: /u.test(missingApproval) && !approvalArtefactReady) {
    allowed = allowed.filter((action) => !/^request exact .* approval$/iu.test(action));
    if (/request exact approval: Approval: /iu.test(nextAllowedAction)) {
      nextAllowedAction = allowed.find((action) => /^(?:formulate and persist|persist or refine|draft)/iu.test(action))
        ?? allowed[0] ?? nextAllowedAction;
    }
  }

  const postApproval = postApprovalTransition(missingApproval, runState);
  const presentationLocale = selection.presentationLanguage
    ? resolvePresentationLocale(interactionLocales, selection.presentationLanguage)
    : resolveConfiguredChatLanguage(targetDir);
  const renderable = (value) => isOperationalValueRenderable(value, { registry: interactionLocales, requestedLocale: presentationLocale });
  const runQualityOutlook = deriveQualityOutlook(runState, deliveryMap.findings);
  const readyForApproval = isReadyUserGateApproval({ status, currentGate, missingApproval })
    && approvalArtefactReady;
  const continuePostTpWork = status === "open" && blockingReason === "none"
    && currentGate === "CD+Tests" && isGateSatisfied(runState, "TP")
    && runState.next_allowed_action === transitionDecision.next_allowed_action;
  const hostEvidenceProvisioningChoice = localePack(interactionLocales, "en").operationalValues.hostEvidenceProvisioningChoice;
  const statusCardNextStep = continuePostTpWork
    ? localePack(interactionLocales, "en").operationalValues.nextCdTestsAfterTpApproval
    : nextAllowedAction;
  const statusCardNextStepRenderable = renderable(statusCardNextStep);
  const statusCard = buildStatusCard({
    status,
    currentGate,
    allowed,
    forbidden,
    blockingReason,
    missingApproval,
    nextAllowedAction: statusCardNextStepRenderable
      ? statusCardNextStep
      : localePack(interactionLocales, "en").operationalValues.unknownRunAction,
    continuePostTpWork,
    nextActionRequiresUserAction: !statusCardNextStepRenderable || statusCardNextStep === hostEvidenceProvisioningChoice,
    qualityOutlook: renderable(runQualityOutlook) ? runQualityOutlook : deriveQualityOutlook({}, deliveryMap.findings),
    runState,
    chatLanguage: presentationLocale,
    findings: deliveryMap.findings,
    prdReadinessItems: prdReadiness?.open_decisions ?? [],
    traceabilityGaps: traceabilityReadiness?.open_items ?? [],
    blockingDetails: deliveryMap.findings
      .filter((finding) => finding.severity === "block" || finding.severity === "revise")
      .map(({ code, message, next_step }) => ({ code, message, next_step })),
    interactionKind: controlSetupRequired ? "control_setup" : undefined,
    approvalArtefactReady: readyForApproval,
  });
  const humanPresentation = buildHumanPresentation(targetDir, runState, currentGate, presentationLocale);
  Object.defineProperty(statusCard, "humanPresentation", {
    value: humanPresentation,
    enumerable: false,
  });
  const revisionId = extractField(runState.content ?? "", "revision_id");
  const runResolutionPresentation = runState.resolution_error?.startsWith("AGDF_ACTIVE_RUN_AMBIGUOUS:")
    ? renderRunResolutionCard({ candidates: runState.candidate_runs, presentationLanguage: presentationLocale }, { registry: interactionLocales })
    : runState.resolution_error === "AGDF_ACTIVE_RUN_MISSING"
      ? renderRunResolutionCard({ noActiveRun: true, presentationLanguage: presentationLocale }, { registry: interactionLocales })
      : null;
  const statusPresentation = controlSetupRequired
    ? renderControlSetupOrientation({ target: targetDir }, {
        registry: interactionLocales,
        requestedLocale: presentationLocale,
      })
    : runResolutionPresentation
      ? runResolutionPresentation
    : renderOperationalStatusCard(statusCard, {
        registry: interactionLocales,
        humanPresentation,
        revisionId,
      });
  const approvalOrientation = attachApprovalOrientationSnapshot(statusCard, {
    ready: readyForApproval,
    humanPresentation,
    revisionId,
    registry: interactionLocales,
    requestedLocale: presentationLocale,
  });
  Object.defineProperty(statusCard, "runState", {
    value: runState,
    enumerable: false,
  });

  const approvalOrientationPresentation = renderApprovalOrientationSnapshot(approvalOrientation, {
    registry: interactionLocales,
    expectedIdentity: {
      run_id: statusCard.run_id,
      revision_id: revisionId,
      current_gate: currentGate,
      presentation_language: statusCard.presentation_language,
    },
  });
  const presentationDiagnostics = {};
  let approvalPresentation = null;
  if (approvalOrientationPresentation && statusPresentation) {
    try {
      const review = renderReviewableApproval(targetDir, {
        approval_presentation: approvalOrientationPresentation,
        status_presentation: statusPresentation,
      }, { runId: statusCard.run_id, gate: currentGate, revisionId }, runState);
      if (review) approvalPresentation = Object.freeze({ ...approvalOrientationPresentation, ...review });
      else presentationDiagnostics.approval_presentation_errors = ["review_artefact_unavailable"];
    } catch (error) {
      presentationDiagnostics.approval_presentation_errors = [error.message || "review_artefact_unavailable"];
      if (typeof error.recovery === "string" && error.recovery.trim()) {
        presentationDiagnostics.approval_presentation_recovery = error.recovery;
      }
    }
  } else if (approvalOrientationPresentation && !statusPresentation) {
    presentationDiagnostics.approval_presentation_errors = ["status_presentation_unavailable"];
  }
  if (!statusPresentation) {
    presentationDiagnostics.status_presentation_errors = controlSetupRequired
      ? ["control_setup_presentation_unavailable"]
      : [
          ...validateOperationalStatusCardPreconditions(statusCard, {
            registry: interactionLocales,
            humanPresentation,
          }).errors,
        ];
  }
  if (readyForApproval && !approvalPresentation && !presentationDiagnostics.approval_presentation_errors) {
    presentationDiagnostics.approval_presentation_errors = approvalOrientation
      ? [
          ...validateApprovalOrientationSnapshot(approvalOrientation, {
            registry: interactionLocales,
            expectedIdentity: {
              run_id: statusCard.run_id,
              revision_id: revisionId,
              current_gate: currentGate,
              presentation_language: statusCard.presentation_language,
            },
          }).errors,
        ]
      : [
          ...validateApprovalOrientationPreconditions({
            statusCard,
            humanPresentation,
            registry: interactionLocales,
            requestedLocale: presentationLocale,
          }).errors,
        ];
    if (!presentationDiagnostics.approval_presentation_errors.length) {
      presentationDiagnostics.approval_presentation_errors = ["snapshot_unavailable"];
    }
  }

  const nextOperation = requiredGateArtifactPreparation({
    status,
    currentGate,
    missingApproval,
    modeDecision: modeSliceDecision(runState),
    approvalPresentation,
    presentationDiagnostics,
    deliveryMap,
    runId: statusCard.run_id,
  });

  return {
    schema_version: "1",
    status,
    current_gate: currentGate,
    blocking_reason: blockingReason,
    missing_approval: missingApproval,
    ...(prdReadiness ? { prd_readiness: prdReadiness } : {}),
    ...(traceabilityReadiness ? { traceability_readiness: traceabilityReadiness } : {}),
    next_gate_after_approval: postApproval.next_gate_after_approval,
    allowed_after_approval: postApproval.allowed_after_approval,
    allowed,
    forbidden,
    next_allowed_action: nextAllowedAction,
    doctor_status: doctorReport.status,
    doctor_summary: doctorReport.summary,
    evidence_refs: runState.evidence_refs,
    quality_outlook: deriveQualityOutlook(runState, deliveryMap.findings),
    interaction_kind: statusCard.interaction_kind,
    native_attempt_required: statusCard.native_attempt_required,
    candidate_runs: runState.candidate_runs ?? [],
    status_card: statusCard,
    status_presentation: statusPresentation,
    approval_presentation: approvalPresentation,
    next_operation: nextOperation,
    ...(Object.keys(presentationDiagnostics).length ? { presentation_diagnostics: presentationDiagnostics } : {}),
    delivery_map: {
      relationships: deliveryMap.relationships,
      mode_slice_decision: runState.mode_slice_decision,
      context_graph: deliveryMap.context_graph,
      source_scope: deliveryMap.source_scope,
      memory: deliveryMap.memory,
      parent_reconciliation: deliveryMap.parent_reconciliation,
      programme_aggregation: deliveryMap.programme_aggregation,
      findings: deliveryMap.findings,
    },
    verified_change: verifiedChange,
    doctor_report: doctorReport,
  };
}

function canonicalApprovalForReport(report) {
  if (report?.status_card?.interaction_kind && report.status_card.interaction_kind !== "gate_approval") return "";
  const gate = String(report?.current_gate ?? "").trim();
  const approval = String(report?.missing_approval ?? "").trim();
  return isReadyUserGateApproval({ status: report?.status, currentGate: gate, missingApproval: approval })
    ? approval
    : "";
}

export function printApprovalEnvelope(report, { io = console, reEvaluate } = {}) {
  if (report?.approval_presentation?.preview_markdown) {
    io.log(report.approval_presentation.preview_markdown);
    return Object.freeze({ outcome: "preview", requested_decision: false, status: report.status });
  }

  const initialApproval = canonicalApprovalForReport(report);
  let refreshed = report;
  if (initialApproval && typeof reEvaluate === "function") {
    try {
      refreshed = reEvaluate();
    } catch {
      refreshed = { ...report, status: "blocked", blocking_reason: "fresh_gate_evaluation_failed", missing_approval: "none" };
    }
  }
  const pack = localePack(interactionLocales, refreshed?.status_card?.presentation_language || report?.status_card?.presentation_language || "en");
  const refreshedApproval = canonicalApprovalForReport(refreshed);
  if (initialApproval && refreshedApproval) {
    const codes = refreshed?.presentation_diagnostics?.approval_presentation_errors
      ?? report?.presentation_diagnostics?.approval_presentation_errors
      ?? [];
    const recovery = refreshed?.presentation_diagnostics?.approval_presentation_recovery
      ?? report?.presentation_diagnostics?.approval_presentation_recovery;
    io.log(recovery || (codes.length ? `${pack.interaction.presentationFailure} (${codes.join(", ")})` : pack.interaction.presentationFailure));
    return Object.freeze({ outcome: "presentation_unavailable", requested_decision: false, status: refreshed.status });
  }

  const blockingReason = String(refreshed?.blocking_reason ?? "").trim();
  const reason = String(
    blockingReason && blockingReason !== "none"
      ? blockingReason
      : refreshed?.next_allowed_action || "gate_not_ready",
  ).trim();
  io.log(pack.interaction.nonReadyDecision.replace("{reason}", reason));
  printReadinessDetails(refreshed, pack.statusCard, io);
  return Object.freeze({ outcome: "non_ready", requested_decision: false, status: refreshed?.status || "blocked" });
}

function printReadinessDetails(report, labels, io) {
  const groups = [
    [labels.prdReadinessItems, report?.prd_readiness?.open_decisions ?? []],
    [labels.traceabilityGaps, report?.traceability_readiness?.open_items ?? []],
  ];
  for (const [label, items] of groups) {
    if (!items.length) continue;
    io.log(`${label}:`);
    for (const item of items) io.log(`- ${item}`);
  }
}

function printGateCheckStatusCard(report, io) {
  const card = report.status_card;
  if (canonicalApprovalForReport(report)) {
    if (report.approval_presentation?.preview_markdown) {
      io.log(report.approval_presentation.preview_markdown);
      return true;
    }
    const pack = localePack(interactionLocales, card?.presentation_language || "en");
    const codes = report.presentation_diagnostics?.approval_presentation_errors ?? [];
    const recovery = report.presentation_diagnostics?.approval_presentation_recovery;
    io.log(recovery || (codes.length ? `${pack.interaction.presentationFailure} (${codes.join(", ")})` : pack.interaction.presentationFailure));
    return false;
  }
  if (!report.status_presentation?.markdown) {
    const failure = localePack(interactionLocales, card?.presentation_language || "en").interaction.statusPresentationFailure;
    const codes = report.presentation_diagnostics?.status_presentation_errors ?? [];
    io.log(codes.length ? `${failure} (${codes.join(", ")})` : failure);
    return false;
  }
  io.log(report.status_presentation.markdown);
  const statusLabels = localePack(interactionLocales, card?.presentation_language || "en").statusCard;
  printReadinessDetails(report, statusLabels, io);
  const primary = localePack(interactionLocales, card.presentation_language).primary;
  const readiness = qualityReadinessForRunState(card.runState, report.next_allowed_action);
  if (readiness) {
    const quality = localePack(interactionLocales, card.presentation_language).qualityReadiness;
    io.log("");
    io.log(`${quality.title}: ${primary.status[readiness.status] ?? readiness.status}`);
    for (const row of readiness.rows) {
      io.log(`${quality.rows[row.id]}: ${primary.status[row.status] ?? quality.unknown}`);
    }
    const reason = readiness.decisive_reason
      || (readiness.status === "pass" ? primary.none : quality.fallbackReasons[readiness.decisive_dimension] || primary.none);
    io.log(`${quality.reason}: ${reason}`);
    if (readiness.status !== "pass" && readiness.decisive_reference) io.log(`${quality.reference}: ${readiness.decisive_reference}`);
    io.log(`${quality.nextAction}: ${readiness.next_action || primary.none}`);
    io.log(`${quality.decisionOwner}: ${quality.decisionOwnerValue}`);
  }
  return true;
}

export function printGateCheckReport(report, json, statusCard = false, io = console) {
  if (json) {
    io.log(JSON.stringify(report, null, 2));
    return true;
  }

  if (statusCard) {
    return printGateCheckStatusCard(report, io);
  }

  io.log(`AGDF gate-check: ${report.status}`);
  io.log(`Current gate: ${report.current_gate}`);
  io.log(`Blocking reason: ${report.blocking_reason}`);
  io.log(`Missing approval: ${report.missing_approval}`);
  io.log(`Quality outlook: ${report.quality_outlook}`);
  io.log(`Doctor: ${report.doctor_status} (${report.doctor_summary.findings} findings)`);
  io.log("");
  io.log("Allowed:");
  for (const item of report.allowed) io.log(`- ${item}`);
  io.log("");
  io.log("Forbidden:");
  for (const item of report.forbidden) io.log(`- ${item}`);
  io.log("");
  io.log(`Next allowed action: ${report.next_allowed_action}`);
  const labels = localePack(interactionLocales, report?.status_card?.presentation_language || "en").statusCard;
  printReadinessDetails(report, labels, io);
  return true;
}
