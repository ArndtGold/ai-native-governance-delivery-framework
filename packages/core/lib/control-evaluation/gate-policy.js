import { extractField, verifiedChangeEscalationTargets } from "./verified-change.js";
import { gateApprovalStatus, gateArtefactStatus, isDurableGateArtefactSatisfied, isInternalStepSatisfied, modeSliceDecision } from "./run-state.js";
import { readSourceRevisions } from "../control-state/run-source-revisions.js";
import { STRUCTURED_REQUIRED_REVIEWS, reviewArtefactType } from "./closeout-readiness.js";

// Compatible display text. Execution consumes the semantic operation, never this sentence.
export const CD_TESTS_NEXT_ALLOWED_ACTION = "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR.";

function durableArtefactBlock(gate, nextGate) {
  const label = gate === "QA" ? "QA report" : `${gate} artefact`;
  const stablePath = gate === "QA" ? ".agdf/control/artefacts/<key>/QA_REPORT.md" : `.agdf/control/artefacts/<key>/${gate}.md`;
  return {
    status: "blocked",
    current_gate: gate,
    blocking_reason: `missing_durable_${gate.toLowerCase()}_artefact`,
    missing_approval: "none",
    allowed: [
      `persist the approved ${label} in a stable artefact path such as ${stablePath}`,
      "link the artefact from the selected RUN_STATE.md and MASTER_BACKLOG.md",
      "run gate-check again",
    ],
    forbidden: nextGate
      ? [`create ${nextGate}`, "create later-gate artefacts", "implement gated work", "claim QA or release readiness"]
      : ["create later-gate artefacts", "implement gated work", "claim release readiness"],
    next_allowed_action: `Persist the approved ${label} and link it from the AGDF control state before continuing.`,
  };
}

export function isGateSatisfied(runState, gate) {
  const status = gateApprovalStatus(runState, gate);
  if (status === "not_applicable") return true;
  if (status !== "approved") return false;
  if (gate === "UAT") return true;
  return isDurableGateArtefactSatisfied(runState, gate);
}

function qaNonPassDecision(runState) {
  const status = gateArtefactStatus(runState, "QA").status;
  return status === "revise" || status === "block" ? status : null;
}

function gateDecisionForRunState(runState, verifiedChange = null) {
  if (gateApprovalStatus(runState, "UR") === "approved" && !isGateSatisfied(runState, "UR")) return durableArtefactBlock("UR", "PRD");

  if (!isGateSatisfied(runState, "UR")) {
    return {
      status: "open",
      current_gate: "UR",
      blocking_reason: "none",
      missing_approval: "Approval: UR",
      allowed: ["clarify user need", "formulate and persist UR", "record evidence", "request exact UR approval"],
      forbidden: ["create later-gate artefacts beyond the current allowed gate", "run Brownfield Analysis as implementation preparation", "implement code", "claim QA or release readiness"],
      next_allowed_action: "Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR.",
    };
  }

  if (gateApprovalStatus(runState, "PRD") === "approved" && !isGateSatisfied(runState, "PRD")) return durableArtefactBlock("PRD", "SD");

  const revision = readSourceRevisions(runState.content ?? "").receipts.at(-1);
  const reassessment = type => revision?.analyses.some(row => row.type === type && row.disposition === "reassess");
  const renewedBrownfield = reassessment("Brownfield Review") && (!isInternalStepSatisfied(runState, "Brownfield Review")
    || !["structured_slice", "structured_delivery"].includes(modeSliceDecision(runState)));
  if (renewedBrownfield && revision.source_gate !== "UR" && isInternalStepSatisfied(runState, "Brownfield Review")
      && !["undecided", "structured_slice", "structured_delivery"].includes(modeSliceDecision(runState))) {
    return { status: "blocked", current_gate: "Mode/Slice Decision", blocking_reason: "mode_slice_decision_blocked", missing_approval: "none",
      allowed: ["resolve the analytical route under the retained approved UR"], forbidden: ["implement code", "skip renewed source approvals"],
      next_allowed_action: "Resolve the Brownfield Review blocker before choosing a delivery path." };
  }
  if ((reassessment("UX Intent Definition") || runState.source_revision_ux_required) && !isInternalStepSatisfied(runState, 'UX Intent Definition')
      && isInternalStepSatisfied(runState, "Brownfield Review") && ["structured_slice", "structured_delivery"].includes(modeSliceDecision(runState))) {
    return {
      status: "open", current_gate: revision.source_gate === "UR" ? "PRD" : revision.source_gate,
      blocking_reason: "none", missing_approval: "none",
      allowed: ["reassess UX intent under the current approved UR and reviewed analytical context", "record the renewed analysis before dependent authoring"],
      forbidden: ["draft or approve a dependent source before analytical reassessment", "implement code", "claim QA or release readiness"],
      next_allowed_action: "Reassess UX intent under the current approved UR before dependent source authoring.",
      next_operation: { type: "reassess_source_analysis", skill_id: "ux-intent-definition", analysis: "UX Intent Definition" },
    };
  }

  if (!isGateSatisfied(runState, "PRD") || renewedBrownfield) {
    if (!isInternalStepSatisfied(runState, "Brownfield Review")) {
      return {
        status: "open",
        current_gate: "Brownfield Review",
        blocking_reason: "none",
        missing_approval: "none",
        allowed: [
          "run Brownfield Review after G-00",
          "identify existing workstream, owners, SoT, reuse risks and open PRD/SD questions",
          "mark Brownfield Review as done or not_applicable in the selected RUN_STATE.md",
        ],
        forbidden: ["create PRD before Brownfield Review is resolved", "create SD", "create TP", "implement code", "claim QA or release readiness"],
        next_allowed_action: "Run Brownfield Review after G-00 before drafting PRD, or mark Brownfield Review not_applicable with evidence.",
      };
    }

    const modeDecision = modeSliceDecision(runState);
    if (modeDecision === "undecided") {
      return {
        status: "open",
        current_gate: "Mode/Slice Decision",
        blocking_reason: "none",
        missing_approval: "none",
        allowed: [
          "decide whether the approved UR is quick_task, verified_change, structured_slice, structured_delivery or block",
          "record scope reason, evidence and required next gate depth in the selected RUN_STATE.md",
          "choose the next required gate depth before drafting PRD or implementing",
        ],
        forbidden: ["create PRD before process size is decided", "create SD", "create TP", "implement code", "claim QA or release readiness"],
        next_allowed_action: "Record the Mode/Slice Decision from Brownfield Review with scope reason and evidence before choosing PRD depth or Quick Task execution.",
      };
    }

    if (modeDecision === "block") {
      return {
        status: "blocked",
        current_gate: "Mode/Slice Decision",
        blocking_reason: "mode_slice_decision_blocked",
        missing_approval: "none",
        allowed: ["resolve ownership, SoT, evidence, impact or product-direction uncertainty", "run gate-check again"],
        forbidden: ["create PRD", "create SD", "create TP", "implement code", "claim QA or release readiness"],
        next_allowed_action: "Resolve the Brownfield Review blocker before choosing a delivery path.",
      };
    }

    if (modeDecision === "quick_task") {
      if (
        extractField(runState.content ?? "", "lifecycle") === "completed"
        && runState.current_gate === "OR"
        && runState.artefacts.get("OR")?.status === "done"
      ) {
        return {
          status: "pass",
          current_gate: "OR",
          blocking_reason: "none",
          missing_approval: "none",
          allowed: ["use delivery closeout when explicitly requested"],
          forbidden: ["repeat Quick Task execution", "commit, push, open PR or release automatically"],
          next_allowed_action: "Use delivery closeout only when an operative VCS handoff is explicitly requested.",
        };
      }
      if (isInternalStepSatisfied(runState, "CR")) return {
        status: "open", current_gate: "Quick Task Execution", blocking_reason: "none", missing_approval: "none",
        allowed: ["produce OR or delivery closeout"],
        forbidden: ["repeat Quick Task execution", "commit, push, open PR or release automatically"],
        next_allowed_action: "Produce delivery closeout or requested handoff; do not perform VCS actions automatically.",
        next_operation: { type: "record_closeout", skill_id: "release-or", operation_key: "closeout.record", actor: "agent", effect: "closeout", gate: "Quick Task Execution" },
      };
      return {
        status: "open",
        current_gate: "Quick Task Execution",
        blocking_reason: "none",
        missing_approval: "none",
        allowed: ["implement the narrow approved UR scope", "run relevant checks", "record evidence and close with OR-lite"],
        forbidden: ["expand scope beyond the Brownfield Review decision", "create broad PRD/SD/TP artefacts by ritual", "claim QA or release readiness without evidence"],
        next_allowed_action: "Proceed as a Quick Task within the Brownfield Review scope and record verification evidence.",
        next_operation: { type: "implement_compact_scope", skill_id: "gate-check", operation_key: "implementation.execute", actor: "agent", effect: "implementation", gate: "Quick Task Execution" },
      };
    }

    if (modeDecision === "verified_change") {
      const state = verifiedChange?.status ?? "missing";
      const escalationTarget = verifiedChange?.escalation_target ?? "structured_slice";
      if (state === "executed") {
        return {
          status: "open",
          current_gate: "OR",
          blocking_reason: "none",
          missing_approval: "none",
          allowed: ["use the Verified Change mini-closeout", "offer delivery closeout when requested"],
          forbidden: ["create PRD, SD, TP, QA or UAT by ritual", "commit, push, open PR or release automatically"],
          next_allowed_action: "Close the executed Verified Change with its compact record and offer delivery closeout; do not perform VCS actions automatically.",
        };
      }
      if (state === "escalated" || (state === "invalid" && verifiedChangeEscalationTargets.has(escalationTarget))) {
        return {
          status: "open",
          current_gate: "PRD",
          blocking_reason: state === "escalated" ? "verified_change_escalated" : "verified_change_invalid_escalated",
          missing_approval: "Approval: PRD",
          allowed: ["draft the structured PRD required by the declared escalation target", "retain the Verified Change escalation evidence"],
          forbidden: ["implement through Verified Change", "create SD or TP before PRD approval", "claim QA or release readiness"],
          next_allowed_action: `Proceed as ${escalationTarget}: draft the required PRD and request exact approval: Approval: PRD.`,
        };
      }
      if (state === "eligible") {
        return {
          status: "open",
          current_gate: "Verified Change Execution",
          blocking_reason: "none",
          missing_approval: "none",
          allowed: ["implement only declared source and derived paths", "run declared propagation and validation commands", "record execution evidence and mini-closeout"],
          forbidden: ["touch unlisted paths", "add prohibited impacts", "claim QA, UAT or release readiness"],
          next_allowed_action: "Implement only the eligible Verified Change record scope, then record passing propagation and validation evidence.",
          next_operation: { type: "implement_compact_scope", skill_id: "gate-check", operation_key: "implementation.execute", actor: "agent", effect: "implementation", gate: "Verified Change Execution" },
        };
      }
      return {
        status: state === "missing" || state === "draft" ? "open" : "blocked",
        current_gate: "Verified Change Execution",
        blocking_reason: state === "invalid" ? "verified_change_invalid" : "verified_change_record_required",
        missing_approval: "none",
        allowed: ["create or refine the compact Verified Change record", "capture baseline paths", "prove fail-closed eligibility with doctor and gate-check"],
        forbidden: ["implement candidate changes", "claim validation, QA, UAT or release readiness"],
        next_allowed_action: "Create or repair VERIFIED_CHANGE.md, capture the baseline and satisfy every eligibility check before implementation; escalate if any condition is unproven.",
      };
    }

    return {
      status: "open",
      current_gate: "PRD",
      blocking_reason: "none",
      missing_approval: "Approval: PRD",
      allowed: ["draft or refine PRD", "define scope", "define acceptance criteria", "define non-goals", "request exact PRD approval"],
      forbidden: ["create SD", "create TP", "run Brownfield Analysis as implementation preparation", "implement code", "claim QA or release readiness"],
      next_allowed_action: modeDecision === "structured_slice"
        ? "Draft or refine the smallest PRD slice justified by Brownfield Review; do not implement before required artefacts are approved."
        : "Draft or refine the PRD; do not implement before PRD, SD and TP are approved.",
    };
  }

  if (gateApprovalStatus(runState, "SD") === "approved" && !isGateSatisfied(runState, "SD")) return durableArtefactBlock("SD", "TP");

  if (!isGateSatisfied(runState, "SD")) {
    return {
      status: "open",
      current_gate: "SD",
      blocking_reason: "none",
      missing_approval: "Approval: SD",
      allowed: ["draft or refine Solution Design", "define architecture", "define ownership", "request exact SD approval"],
      forbidden: ["create TP", "implement code", "claim QA or release readiness"],
      next_allowed_action: "Draft or refine the Solution Design; do not implement before SD and TP are approved.",
    };
  }

  if (gateApprovalStatus(runState, "TP") === "approved" && !isGateSatisfied(runState, "TP")) return durableArtefactBlock("TP", "Brownfield Analysis");

  if (!isGateSatisfied(runState, "TP")) {
    return {
      status: "open",
      current_gate: "TP",
      blocking_reason: "none",
      missing_approval: "Approval: TP",
      allowed: ["draft or refine Task/Test Plan", "define task IDs", "define test evidence", "request exact TP approval"],
      forbidden: ["implement code", "claim QA or release readiness"],
      next_allowed_action: "Draft or refine the Task/Test Plan; do not implement before TP is approved.",
    };
  }

  const implementationStepsRequired = gateApprovalStatus(runState, "TP") === "approved";
  if (implementationStepsRequired && !isInternalStepSatisfied(runState, "Brownfield Analysis")) {
    return {
      status: "open",
      current_gate: "Brownfield Analysis",
      blocking_reason: "none",
      missing_approval: "none",
      allowed: ["run Brownfield Analysis for the approved TP scope", "verify existing owners, reuse paths and regression risks"],
      forbidden: ["implement before Brownfield evidence supports the approved TP path", "claim QA or release readiness"],
      next_allowed_action: "Run Brownfield Analysis for the approved TP scope before CD+Tests.",
    };
  }

  if (implementationStepsRequired && !isInternalStepSatisfied(runState, "CD+Tests")) {
    return {
      status: "open",
      current_gate: "CD+Tests",
      blocking_reason: "none",
      missing_approval: "none",
      allowed: ["implement the approved TP tasks", "run the approved test plan", "record implementation and test evidence"],
      forbidden: ["claim QA pass", "request UAT approval", "release"],
      next_allowed_action: CD_TESTS_NEXT_ALLOWED_ACTION,
    };
  }

  if (implementationStepsRequired && !isInternalStepSatisfied(runState, "CR")) {
    return {
      status: "open",
      current_gate: "CR",
      blocking_reason: "none",
      missing_approval: "none",
      allowed: ["run mandatory code review", "record correctness, regression, security and maintainability findings", "fix blocking review findings"],
      forbidden: ["claim QA pass", "request UAT approval", "release"],
      next_allowed_action: "Run Code Review for the implemented TP scope and resolve blocking findings before QA.",
    };
  }

  const qaNonPass = qaNonPassDecision(runState);
  if (qaNonPass && !runState.qa_acceptance?.eligible) {
    const blocked = qaNonPass === "block";
    return {
      status: blocked ? "blocked" : "open",
      current_gate: "QA",
      blocking_reason: blocked ? "qa_blocked" : "qa_revise_required",
      missing_approval: "none",
      allowed: blocked
        ? ["route the blocking QA findings to their authoritative owner", "record the next permitted remediation or upstream decision", "rerun QA only after the blocker is resolved"]
        : ["revise the implementation against the QA findings", "refresh CD+Tests and mandatory reviews", "rerun QA with refreshed evidence"],
      forbidden: ["request QA approval", "request UAT approval", "release", "claim delivery readiness"],
      next_allowed_action: blocked
        ? "Resolve or route the blocking QA findings via their authoritative owner, then rerun the required steps. Do not request Approval: QA from a block report."
        : "Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do not request Approval: QA from a revise report.",
    };
  }

  // The qa-gate forbids a QA pass without review evidence and closeout requires both
  // reviews. Until they are recorded the QA approval request is withheld.
  const acceptedPlanDeviation = runState.qa_acceptance?.eligible || runState.qa_acceptance?.accepted;
  const structuredBeforeQaApproval = ["structured_slice", "structured_delivery"].includes(modeSliceDecision(runState))
    && gateApprovalStatus(runState, "QA") !== "approved";
  if (structuredBeforeQaApproval && STRUCTURED_REQUIRED_REVIEWS.some(step => !isInternalStepSatisfied(runState, reviewArtefactType(runState, step))
        && !(step === "TP Review" && acceptedPlanDeviation && runState.artefacts.get(step)?.status === "revise"))) {
    return {
      status: "open",
      current_gate: "QA",
      blocking_reason: "none",
      missing_approval: "none",
      allowed: ["record TP Review and Clean Implementation Review", "run QA gate"],
      forbidden: ["request QA approval", "request UAT approval", "release", "claim delivery readiness"],
      next_allowed_action: "Record TP Review and Clean Implementation Review before requesting Approval: QA.",
    };
  }
  // A QA report recorded before current evidence (for example reviews recorded after it)
  // would stay stale through closeout; QA is rerun before its approval request.
  const qaAssociation = runState.evidence_applicability?.by_step.get("QA");
  if (structuredBeforeQaApproval && runState.artefacts.get("QA")?.path && qaAssociation && qaAssociation.applicability !== "current") {
    return {
      status: "open",
      current_gate: "QA",
      blocking_reason: "none",
      missing_approval: "none",
      allowed: ["run QA gate", "persist or refine the QA report"],
      forbidden: ["request QA approval", "request UAT approval", "release", "claim delivery readiness"],
      next_allowed_action: "Rerun QA against the current evidence before requesting Approval: QA.",
    };
  }

  if (gateApprovalStatus(runState, "QA") === "approved" && !isGateSatisfied(runState, "QA")) return durableArtefactBlock("QA", "UAT");

  if (isGateSatisfied(runState, "QA") && !isGateSatisfied(runState, "UAT")) {
    return {
      status: "open",
      current_gate: "UAT",
      blocking_reason: "none",
      missing_approval: "Approval: UAT",
      allowed: ["request exact UAT approval", "prepare non-operative delivery summary"],
      forbidden: ["release", "push", "open PR", "commit without explicit user instruction and required approval"],
      next_allowed_action: "Request exact approval: Approval: UAT before delivery handoff.",
    };
  }

  if (isGateSatisfied(runState, "UAT")) {
    return {
      status: "open",
      current_gate: "OR",
      blocking_reason: "none",
      missing_approval: "none",
      allowed: ["produce OR or delivery closeout", "prepare commit, push or PR handoff when requested"],
      forbidden: ["commit, push, open PR or release automatically"],
      next_allowed_action: "Produce delivery closeout or requested handoff; do not perform VCS actions automatically.",
    };
  }

  return {
    status: "open",
    current_gate: "QA",
    blocking_reason: "none",
    missing_approval: "Approval: QA",
    allowed: ["run QA gate", "persist or refine the QA report", "request exact QA approval"],
    forbidden: ["request UAT approval", "release", "claim delivery readiness before QA approval and report evidence"],
    next_allowed_action: "Run the QA gate, persist the QA report, and request exact approval: Approval: QA",
  };
}

// The same policy supplies machine meaning and compatible prose. These operations
// describe eligibility; they are neither user approval nor an invocation authority.
function semanticOperation(decision) {
  if (decision.next_operation) return { ...decision.next_operation,
    operation_key: decision.next_operation.operation_key ?? decision.next_operation.type,
    actor: decision.next_operation.actor ?? "agent", effect: decision.next_operation.effect ?? "preparation" };
  if (decision.status === "blocked") return { type: "resolve_control_blocker", operation_key: "control.resolve",
    actor: "agent", effect: "none", gate: decision.current_gate };
  const key = {
    "Brownfield Review": ["analyse_existing_system", "brownfield-analysis", "analysis.brownfield_review", "preparation"],
    "Mode/Slice Decision": ["resolve_delivery_route", "brownfield-analysis", "analysis.route", "preparation"],
    "Brownfield Analysis": ["prepare_implementation", "brownfield-analysis", "analysis.brownfield_implementation", "preparation"],
    "CD+Tests": ["implement_approved_plan", "gate-check", "implementation.execute", "implementation"],
    "CR": ["review_implementation", "code-review", "review.code", "preparation"],
    "QA": ["evaluate_quality", "qa-gate", "quality.evaluate", "preparation"],
    "OR": ["record_closeout", "release-or", "closeout.record", "closeout"],
  }[decision.current_gate];
  if (key) return { type: key[0], skill_id: key[1], operation_key: key[2], actor: "agent", effect: key[3], gate: decision.current_gate };
  if (decision.current_gate === "UAT") return { type: "human_gate_decision", operation_key: "approval.record",
    actor: "human", effect: "decision", gate: "UAT" };
  if (["UR", "PRD", "SD", "TP"].includes(decision.current_gate)) return { type: "author_gate_artifact",
    operation_key: "artefact.author", actor: "agent", effect: "preparation", gate: decision.current_gate };
  return { type: "resolve_control_state", operation_key: "control.resolve", actor: "agent", effect: "none", gate: decision.current_gate };
}

export function transitionDecisionForRunState(runState, verifiedChange = null) {
  const decision = gateDecisionForRunState(runState, verifiedChange);
  const lifecycle = extractField(runState.content ?? "", "lifecycle") || runState.meta?.lifecycle || "unknown";
  if (runState.approval_material_findings?.length) return { ...decision, status: 'blocked', missing_approval: 'none', blocking_reason: 'approved_material_sources_changed',
    allowed: ['inspect the changed approved sources through their existing revision/recovery owner'], forbidden: [...decision.forbidden, 'continue from an unconfirmed old approval'],
    next_allowed_action: 'Resolve the changed approved material through its existing source/recovery owner; do not infer a fresh approval.',
    next_operation: { type: 'resolve_control_blocker', operation_key: 'control.resolve', actor: 'agent', effect: 'none', gate: decision.current_gate },
    completion: { status: lifecycle === 'completed' ? 'unconfirmed' : 'pending', gate: 'OR', fulfilled: false } };
  if (lifecycle === "completed") {
    const or = runState.artefacts.get("OR");
    const route = modeSliceDecision(runState);
    const fulfilled = decision.current_gate === "OR" && decision.status !== "blocked"
      && or?.status === "done" && Boolean(or.path)
      && (route === 'verified_change' ? verifiedChange?.status === 'executed' : runState.closeout_evidence?.ready === true)
      && ["structured_slice", "structured_delivery", "quick_task", "verified_change"].includes(route);
    if (fulfilled) return { ...decision, status: "pass", missing_approval: "none", blocking_reason: "none",
      allowed: ["prepare an explicitly requested VCS handoff"], forbidden: ["repeat completed Run work", "perform VCS or release actions automatically"],
      next_allowed_action: "Run completed; prepare a VCS handoff only when explicitly requested.",
      next_operation: null, completion: { status: "completed", gate: "OR", fulfilled: true, vcs_handoff: "explicit_request_required" } };
    return { ...decision, status: "blocked", missing_approval: "none", blocking_reason: "completed_run_obligations_unconfirmed",
      allowed: ["inspect the inconsistent completion and route it to its existing recovery owner"],
      forbidden: ["repeat completed work automatically", "claim clean completion", "perform VCS or release actions automatically"],
      next_allowed_action: "Resolve the inconsistent completed Run obligations before claiming a clean closeout.",
      next_operation: { type: "resolve_control_blocker", operation_key: "control.resolve", actor: "agent", effect: "none", gate: decision.current_gate },
      completion: { status: "unconfirmed", gate: "OR", fulfilled: false } };
  }
  const decided = runState.presentation_decisions?.get(decision.current_gate);
  if (decided?.decided && runState.approvals.get(decision.current_gate)?.status !== 'approved') return { ...decision,
    blocking_reason: decided.reason ?? 'presentation_version_decided', missing_approval: 'none', presentation_decision: decided,
    allowed: ['revise the current material through its existing authoring or remediation owner'],
    forbidden: [...decision.forbidden, 'approve unchanged decided material', 'invalidate approved upstream sources without supported revision'],
    next_allowed_action: 'Revise the decided material through its existing owner, register the changed version and obtain a fresh presentation and deliberate decision.',
    next_operation: { type: 'revise_gate_material', operation_key: 'artefact.author', actor: 'agent', effect: 'preparation', gate: decision.current_gate, skill_id: decided.owner },
    completion: { status: 'pending', gate: 'OR', fulfilled: false } };
  return { ...decision, next_operation: semanticOperation(decision),
    completion: { status: "pending", gate: "OR", fulfilled: false } };
}
