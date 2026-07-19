import { attachApprovalOrientationSnapshot, buildArtefactRefs, buildQualityReadiness, gateTitle, localePack, renderApprovalOrientationSnapshot, renderOperationalStatusCard, resolveHumanRunTitle } from '../interaction-presentation.js';
import { interactionLocales, resolveConfiguredChatLanguage } from '../cli/runtime-context.js';
import { evaluateDoctor } from './doctor.js';
import { analyzeDeliveryMap, deriveQualityOutlook } from './delivery-map.js';
import { transitionDecisionForRunState } from './gate-policy.js';
import { evaluateVerifiedChange, extractField, verifiedChangeEscalationTargets } from './verified-change.js';
import { gateApprovalStatus, modeSliceDecision, readArtefactHeading, readRunState, resolvedArtefactFile } from './run-state.js';
import { isPlaceholderValue } from './shared.js';

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

export function postApprovalTransition(missingApproval) {
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
}) {
  const qualityOutlook = deriveQualityOutlook(runState, findings);
  const postApproval = postApprovalTransition(missingApproval);
  const isUserGateApproval = isReadyUserGateApproval({ status, currentGate, missingApproval });
  const lifecycle = extractField(runState.content ?? "", "lifecycle") || "unknown";
  const nativeAttemptRequired = false;
  const interactionKind = status === "open" && isUserGateApproval ? "gate_approval" : status === "blocked" ? "blocked" : "status";
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
    missing_approval: missingApproval || "none",
    next_gate_after_approval: postApproval.next_gate_after_approval,
    allowed_after_approval: postApproval.allowed_after_approval,
    user_visible_outcome_after_approval: postApproval.allowed_after_approval,
    internal_next_step: postApproval.internal_next_step || (isUserGateApproval ? "none" : nextAllowedAction),
    next_user_gate: postApproval.next_user_gate || "none",
    user_action_required: postApproval.user_action_required || (isUserGateApproval ? "yes" : "no"),
    evidence: runState.evidence_refs,
    next_skill: nextSkillByGate[currentGate] ?? "gate-check",
    next_step: nextAllowedAction,
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

export function evaluateGateCheck(targetDir, selection = {}) {
  const doctorReport = evaluateDoctor(targetDir, selection);
  const runState = readRunState(targetDir, selection);
  const verifiedChange = modeSliceDecision(runState) === "verified_change"
    ? evaluateVerifiedChange(targetDir, runState)
    : null;
  const transitionDecision = transitionDecisionForRunState(runState, verifiedChange);
  const deliveryMap = analyzeDeliveryMap(runState);
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

  if (doctorBlocker?.code === "AGDF_CONTROL_FILE_MISSING") {
    status = "blocked";
    blockingReason = doctorBlocker.code;
    currentGate = "UR";
    missingApproval = "Approval: UR";
    allowed = [
      "draft the minimal UR for the requested change in the response",
      "request exact approval: Approval: UR",
      "run npx --yes @agdf/cli@latest init only when durable control state or deterministic setup is explicitly needed",
    ];
    forbidden = ["create PRD", "create SD", "create TP", "run Brownfield Analysis", "implement code", "claim QA or release readiness"];
    nextAllowedAction = "Draft the minimal UR for the request in the response, then ask for exact approval: Approval: UR. Do not write a full .agdf/control scaffold unless durable control state or deterministic setup is explicitly needed.";
  } else if (doctorBlocker && !routesInvalidVerifiedChange) {
    status = "blocked";
    blockingReason = doctorBlocker.code;
    allowed = ["repair the AGDF control scaffold", ...transitionDecision.allowed, "run doctor again"];
    forbidden = ["create later-gate artefacts beyond the current allowed gate", "implement gated work", "claim QA or release readiness"];
    nextAllowedAction = doctorBlocker.next_step;
  } else if (doctorRevise && !routesInvalidVerifiedChange) {
    status = "blocked";
    blockingReason = doctorRevise.code;
    allowed = [...new Set(["complete the current control-state fields", ...transitionDecision.allowed, "run doctor again"])];
    forbidden = ["create later-gate artefacts beyond the current allowed gate", "implement gated work before the gate allows it", "claim QA or release readiness"];
    nextAllowedAction = transitionDecision.current_gate === "UR"
      ? "Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR."
      : doctorRevise.next_step;
  }

  const postApproval = postApprovalTransition(missingApproval);
  const presentationLocale = resolveConfiguredChatLanguage(targetDir);
  const statusCard = buildStatusCard({
    status,
    currentGate,
    allowed,
    forbidden,
    blockingReason,
    missingApproval,
    nextAllowedAction,
    runState,
    chatLanguage: presentationLocale,
    findings: deliveryMap.findings,
  });
  const humanPresentation = buildHumanPresentation(targetDir, runState, currentGate, presentationLocale);
  Object.defineProperty(statusCard, "humanPresentation", {
    value: humanPresentation,
    enumerable: false,
  });
  const revisionId = extractField(runState.content ?? "", "revision_id");
  const statusPresentation = renderOperationalStatusCard(statusCard, {
    registry: interactionLocales,
    humanPresentation,
    revisionId,
  });
  const approvalOrientation = attachApprovalOrientationSnapshot(statusCard, {
    ready: isReadyUserGateApproval({ status, currentGate, missingApproval }),
    humanPresentation,
    revisionId,
    registry: interactionLocales,
    requestedLocale: presentationLocale,
  });
  Object.defineProperty(statusCard, "runState", {
    value: runState,
    enumerable: false,
  });

  return {
    schema_version: "1",
    status,
    current_gate: currentGate,
    blocking_reason: blockingReason,
    missing_approval: missingApproval,
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
    approval_presentation: renderApprovalOrientationSnapshot(approvalOrientation, {
      registry: interactionLocales,
      expectedIdentity: {
        run_id: statusCard.run_id,
        revision_id: revisionId,
        current_gate: currentGate,
        presentation_language: statusCard.presentation_language,
      },
    }),
    delivery_map: {
      relationships: deliveryMap.relationships,
      mode_slice_decision: runState.mode_slice_decision,
      context_graph: deliveryMap.context_graph,
      source_scope: deliveryMap.source_scope,
      memory: deliveryMap.memory,
      findings: deliveryMap.findings,
    },
    verified_change: verifiedChange,
    doctor_report: doctorReport,
  };
}

function canonicalApprovalForReport(report) {
  const gate = String(report?.current_gate ?? "").trim();
  const approval = String(report?.missing_approval ?? "").trim();
  return isReadyUserGateApproval({ status: report?.status, currentGate: gate, missingApproval: approval })
    ? approval
    : "";
}

export function printApprovalEnvelope(report, { io = console, reEvaluate } = {}) {
  if (report?.approval_presentation) {
    io.log(report.approval_presentation.blocks.run_status_card.markdown);
    io.log("");
    io.log(report.approval_presentation.blocks.gate_transition_card.markdown);
    io.log("");
    io.log(report.approval_presentation.approval_interaction.exact_text_fallback);
    return Object.freeze({ outcome: "rendered", requested_decision: true, status: report.status });
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
    io.log(pack.interaction.presentationFailure);
    io.log(pack.interaction.exactTextRequest.replace("{approval}", refreshedApproval));
    return Object.freeze({ outcome: "exact_text_recovery", requested_decision: true, status: refreshed.status });
  }

  const blockingReason = String(refreshed?.blocking_reason ?? "").trim();
  const reason = String(
    blockingReason && blockingReason !== "none"
      ? blockingReason
      : refreshed?.next_allowed_action || "gate_not_ready",
  ).trim();
  io.log(pack.interaction.nonReadyDecision.replace("{reason}", reason));
  return Object.freeze({ outcome: "non_ready", requested_decision: false, status: refreshed?.status || "blocked" });
}

function printGateCheckStatusCard(report, io) {
  const card = report.status_card;
  if (!report.status_presentation?.markdown) {
    io.log(localePack(interactionLocales, card?.presentation_language || "en").interaction.statusPresentationFailure);
    return false;
  }
  io.log(report.status_presentation.markdown);
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
  return true;
}
