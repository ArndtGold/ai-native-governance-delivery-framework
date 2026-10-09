import { RUN_ID_PATTERN } from "../control-state/run-state-parser.js";

const parentPrefix = "parent_run:";
const childPrefix = "child_run:";

function filled(value) {
  const text = String(value ?? "").trim();
  return Boolean(text && text !== "none" && !text.includes("<"));
}

function exactTarget(value, prefix) {
  const text = String(value ?? "").trim();
  if (!text.startsWith(prefix)) return "";
  const runId = text.slice(prefix.length);
  return RUN_ID_PATTERN.test(runId) && `${prefix}${runId}` === text ? runId : "";
}

function warning(runState, code, message, nextStep) {
  return {
    severity: "warn",
    code,
    message,
    path: runState.path,
    next_step: nextStep,
  };
}

function invalidDispositionInput(runState) {
  const input = runState.parent_reconciliation ?? {};
  if (!input.present) return false;
  const counts = input.field_counts ?? {};
  return counts.disposition !== 1
    || counts.next_action !== 1
    || !["action_required", "accepted_open"].includes(input.disposition)
    || !filled(input.next_action);
}

function openResult(runState, {
  code = "AGDF_PARENT_RECONCILIATION_OPEN",
  targetRunId = "",
  evidence = "",
  missingEvidence,
  nextAction,
} = {}) {
  const input = runState.parent_reconciliation ?? {};
  const fieldCounts = input.field_counts ?? {};
  const validDisposition = ["action_required", "accepted_open"].includes(input.disposition)
    && fieldCounts.disposition === 1;
  const validNextAction = filled(input.next_action) && fieldCounts.next_action === 1;
  const declaredInputInvalid = input.present && (!validDisposition || !validNextAction);
  const action = declaredInputInvalid ? nextAction : validNextAction ? input.next_action : nextAction;
  const finalCode = declaredInputInvalid
    ? "AGDF_PARENT_RECONCILIATION_EVIDENCE_INVALID"
    : code;
  return {
    result: {
      outcome: "open",
      target_run_id: targetRunId,
      disposition: validDisposition ? input.disposition : "action_required",
      evidence,
      missing_evidence: missingEvidence,
      next_action: action,
    },
    findings: [warning(
      runState,
      finalCode,
      targetRunId
        ? `Child ${runState.run_id || "run"} has an open reconciliation handoff to Parent ${targetRunId}.`
        : `Child ${runState.run_id || "run"} has invalid or ambiguous explicit Parent relationship evidence.`,
      action,
    )],
  };
}

export function evaluateParentReconciliation(runState, { loadRun } = {}) {
  const rows = runState.artefact_chain.filter((row) =>
    row.from === "OR" && row.relationship === "reconciles_with"
  );

  if (!rows.length) {
    return {
      result: {
        outcome: "not_applicable",
        target_run_id: "",
        disposition: "not_applicable",
        evidence: "",
        missing_evidence: "none",
        next_action: "none",
      },
      findings: [],
    };
  }

  if (rows.length !== 1) {
    return openResult(runState, {
      code: "AGDF_PARENT_RECONCILIATION_EVIDENCE_INVALID",
      missingEvidence: "Exactly one explicit Parent relationship is required.",
      nextAction: "Retain exactly one evidenced OR reconciles_with parent_run:<run_id> relationship.",
    });
  }

  if (invalidDispositionInput(runState)) {
    return openResult(runState, {
      code: "AGDF_PARENT_RECONCILIATION_EVIDENCE_INVALID",
      missingEvidence: "The Parent reconciliation disposition or next action is invalid or duplicated.",
      nextAction: "Record one valid disposition and exactly one concrete Parent reconciliation next action.",
    });
  }

  const row = rows[0];
  const parentRunId = exactTarget(row.to, parentPrefix);
  if (!parentRunId || parentRunId === runState.run_id || !filled(row.evidence)) {
    return openResult(runState, {
      code: "AGDF_PARENT_RECONCILIATION_EVIDENCE_INVALID",
      targetRunId: parentRunId,
      evidence: row.evidence,
      missingEvidence: "The Parent run ID and concrete relationship evidence must be valid and unambiguous.",
      nextAction: "Repair the explicit OR reconciles_with parent_run:<run_id> row and its evidence.",
    });
  }

  let parent;
  try {
    parent = loadRun?.(parentRunId);
  } catch {
    parent = null;
  }
  if (!parent?.content || parent.resolution_error) {
    return openResult(runState, {
      targetRunId: parentRunId,
      evidence: row.evidence,
      missingEvidence: "The named Parent run is unavailable.",
      nextAction: `Restore or select Parent run ${parentRunId}, then re-run Delivery Map.`,
    });
  }

  const reciprocalRows = parent.artefact_chain.filter((candidate) =>
    candidate.from === "Aggregate"
      && candidate.relationship === "includes"
      && candidate.to === `${childPrefix}${runState.run_id}`
  );
  if (reciprocalRows.length !== 1 || !filled(reciprocalRows[0]?.evidence)) {
    return openResult(runState, {
      targetRunId: parentRunId,
      evidence: row.evidence,
      missingEvidence: reciprocalRows.length > 1
        ? "The Parent contains ambiguous reciprocal Child relationships."
        : "The Parent lacks one evidenced reciprocal Aggregate includes Child relationship.",
      nextAction: `Reconcile Child ${runState.run_id} in Parent ${parentRunId} through the Parent's governed scope.`,
    });
  }

  return {
    result: {
      outcome: "resolved",
      target_run_id: parentRunId,
      disposition: "not_applicable",
      evidence: reciprocalRows[0].evidence,
      missing_evidence: "none",
      next_action: "none",
    },
    findings: [],
  };
}

function completedChild(runState, resolveFile) {
  const orArtefact = runState?.artefacts?.get("OR");
  return Boolean(
    runState?.content
      && orArtefact?.status === "done"
      && filled(orArtefact.path)
      && resolveFile?.(orArtefact.path),
  );
}

export function evaluateProgrammeAggregation(runState, { loadRun, resolveFile } = {}) {
  const rows = runState.artefact_chain.filter((row) =>
    row.from === "Aggregate" && row.relationship === "includes"
  );
  const input = runState.programme_aggregation ?? {};
  const explicitInput = filled(input.acceptance_ref)
    || filled(input.evidence)
    || (Boolean(input.missing_evidence) && input.missing_evidence !== "none");
  const applicable = explicitInput || rows.length > 0;
  if (!applicable) {
    return {
      result: {
        applicable: false,
        startable: false,
        final_ready: false,
        acceptance_ref: "",
        evidence: [],
        missing_evidence: [],
        next_action: "none",
      },
      findings: [],
    };
  }

  const invalidRows = [];
  const seenChildRunIds = new Set();
  for (const row of rows) {
    const childRunId = exactTarget(row.to, childPrefix);
    if (!childRunId || !filled(row.evidence) || seenChildRunIds.has(childRunId)) invalidRows.push(row);
    else seenChildRunIds.add(childRunId);
  }
  const completedEvidence = [];
  for (const row of rows) {
    const childRunId = exactTarget(row.to, childPrefix);
    if (!childRunId || !filled(row.evidence)) continue;
    let child;
    try {
      child = loadRun?.(childRunId);
    } catch {
      child = null;
    }
    if (completedChild(child, resolveFile)) completedEvidence.push({ child_run_id: childRunId, evidence: row.evidence });
  }

  const fieldCounts = input.field_counts ?? {};
  const acceptanceRefValid = fieldCounts.acceptance_ref === 1
    && filled(input.acceptance_ref)
    && input.acceptance_ref.startsWith(".agdf/control/artefacts/")
    && Boolean(resolveFile?.(input.acceptance_ref));
  const missingEvidenceValid = fieldCounts.missing_evidence === 1
    && input.missing_evidence === "none";
  const evidenceFieldValid = fieldCounts.evidence === 1 && filled(input.evidence);
  const startable = completedEvidence.length > 0;
  const finalReady = startable && acceptanceRefValid && missingEvidenceValid && evidenceFieldValid && invalidRows.length === 0;
  const missingEvidence = [];
  if (!startable) missingEvidence.push("No evidenced included Child has a completed OR.");
  if (!acceptanceRefValid) missingEvidence.push("The declared programme acceptance artefact is missing or invalid.");
  if (!evidenceFieldValid) missingEvidence.push("Programme aggregation evidence is missing or invalid.");
  if (!missingEvidenceValid) missingEvidence.push(input.missing_evidence || "Programme missing-evidence state is not resolved.");
  if (invalidRows.length) missingEvidence.push("One or more Aggregate includes Child rows are invalid.");
  const nextAction = !startable
    ? "Link at least one evidenced completed Child OR in the Parent Artefact Chain."
    : !acceptanceRefValid
      ? "Provide one valid repository-relative programme acceptance artefact reference."
      : !evidenceFieldValid || !missingEvidenceValid
        ? "Resolve the declared programme evidence gaps before final readiness."
        : invalidRows.length
          ? "Repair invalid Aggregate includes child_run:<run_id> rows."
          : "none";
  const findings = [];
  if (invalidRows.length) {
    findings.push(warning(
      runState,
      "AGDF_PROGRAMME_AGGREGATION_EVIDENCE_INVALID",
      "Programme aggregation contains invalid explicit Child evidence.",
      nextAction,
    ));
  }
  if (!finalReady) {
    findings.push(warning(
      runState,
      "AGDF_PROGRAMME_AGGREGATION_NOT_FINAL",
      `Programme aggregation for ${runState.run_id || "run"} is ${startable ? "startable but not final-ready" : "not startable"}.`,
      nextAction,
    ));
  }
  return {
    result: {
      applicable: true,
      startable,
      final_ready: finalReady,
      acceptance_ref: input.acceptance_ref,
      evidence: completedEvidence,
      missing_evidence: missingEvidence,
      next_action: nextAction,
    },
    findings,
  };
}

export function evaluateReconciliationState(runState, dependencies = {}) {
  const parent = evaluateParentReconciliation(runState, dependencies);
  const programme = evaluateProgrammeAggregation(runState, dependencies);
  return {
    parent_reconciliation: parent.result,
    programme_aggregation: programme.result,
    findings: [...parent.findings, ...programme.findings],
  };
}
