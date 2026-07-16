import { verifiedChangeEscalationTargets } from './verified-change.js';
import { gateApprovalStatus, gateArtefactStatus, isDurableGateArtefactSatisfied, isInternalStepSatisfied, modeSliceDecision } from './run-state.js';

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

function qaRevisionRequired(runState) {
  return gateArtefactStatus(runState, "QA").status === "revise";
}

export function transitionDecisionForRunState(runState, verifiedChange = null) {
  if (gateApprovalStatus(runState, "UR") === "approved" && !isGateSatisfied(runState, "UR")) return durableArtefactBlock("UR", "PRD");

  if (!isGateSatisfied(runState, "UR")) {
    return {
      status: "open",
      current_gate: "UR",
      blocking_reason: "none",
      missing_approval: "Approval: UR",
      allowed: ["clarify user need", "formulate and persist UR", "record evidence", "request exact UR approval"],
      forbidden: ["create PRD", "create SD", "create TP", "run Brownfield Analysis", "implement code", "claim QA or release readiness"],
      next_allowed_action: "Clarify the user requirement, persist the UR, and request exact approval: Approval: UR",
    };
  }

  if (gateApprovalStatus(runState, "PRD") === "approved" && !isGateSatisfied(runState, "PRD")) return durableArtefactBlock("PRD", "SD");

  if (!isGateSatisfied(runState, "PRD")) {
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
      return {
        status: "open",
        current_gate: "Quick Task Execution",
        blocking_reason: "none",
        missing_approval: "none",
        allowed: ["implement the narrow approved UR scope", "run relevant checks", "record evidence and close with OR-lite"],
        forbidden: ["expand scope beyond the Brownfield Review decision", "create broad PRD/SD/TP artefacts by ritual", "claim QA or release readiness without evidence"],
        next_allowed_action: "Proceed as a Quick Task within the Brownfield Review scope and record verification evidence.",
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
        };
      }
      return {
        status: state === "missing" || state === "draft" ? "open" : "blocked",
        current_gate: "Verified Change Execution",
        blocking_reason: state === "invalid" ? "verified_change_invalid" : "verified_change_record_required",
        missing_approval: "none",
        allowed: ["create or refine the compact Verified Change record", "capture baseline paths", "prove fail-closed eligibility with doctor and gate-check"],
        forbidden: ["implement candidate changes", "claim validation, QA, UAT or release readiness"],
        next_allowed_action: "Create or repair VERIFIED_CHANGE.md, capture the baseline and satisfy every eligibility check before implementation; escalate when any condition cannot be proven.",
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
      next_allowed_action: "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR.",
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

  if (qaRevisionRequired(runState)) {
    return {
      status: "open",
      current_gate: "QA",
      blocking_reason: "qa_revise_required",
      missing_approval: "none",
      allowed: ["revise the implementation against the QA findings", "refresh CD+Tests and mandatory reviews", "rerun QA with refreshed evidence"],
      forbidden: ["request QA approval", "request UAT approval", "release", "claim delivery readiness"],
      next_allowed_action: "Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do not request Approval: QA from a revise report.",
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
