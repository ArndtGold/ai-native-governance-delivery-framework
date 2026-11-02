import { decisionMaterial, presentationDecisionState } from './presentation-decision.js';
import { prepareRunContentState } from "../control-evaluation/run-state.js";
import { validateRunPresentation, validateRunPresentationRecord } from "./run-presentation.js";
import { validateCurrentPreviewRecord } from './preview-snapshot.js';
import { validateGateApprovalResponse } from "./gate-approval-validator.js";
import { duplicateArtefactRowTypes, parseControlState } from "./run-state-parser.js";
import { firstSection, guardedWrite, readRun, rejected, replaceFirstScalar, tableCells, tableLine, tableLineIndexes, upsertTableRow } from "./run-state-edits.js";
import { APPROVAL_GATES, artefactFileDigest, canonicalRunText, runSealState } from "./run-seal.js";
import { transitionDecisionForRunState } from "../control-evaluation/gate-policy.js";
import { storedNextActionStale } from "../control-evaluation/next-action.js";
import { writeRunMutation, withRunMutationLock, writeRunMutationLocked } from "./run-mutation.js";
import { runPath } from "./run-state-reader.js";
import { projectUrObjective, endedRunRejection } from './run-state-edits.js';
import { readFileSync } from 'node:fs';
import { containedRegularFile } from './contained-file.js';

const DURABLE_STATUS_GATES = new Set(["UR", "PRD", "SD", "TP"]);

// run-approve: persist one exact gate reply for the revision the user was shown. The CLI cannot
// observe the conversation; callers pass only the user's verbatim reply to the presented gate.
export function prepareGateApproval(root, { runId, gate, revisionId, response, presentationId, date = new Date().toISOString().slice(0, 10) }, { evaluateGateCheck }) {
  if (!APPROVAL_GATES.includes(gate)) return rejected(runId, "gate_invalid");
  const run = readRun(root, runId);
  if (run.rejection) return run.rejection;
  const ended = endedRunRejection(runId, run.content);
  if (ended) return ended;
  const state = prepareRunContentState(root, run.content, run.path);
  const material = decisionMaterial(root, state, gate);
  const decided = presentationDecisionState(root, state, gate);
  if (decided.decided) return rejected(runId, 'presentation_version_decided', { decision: decided.action, receipt: decided.receipt });
  // Select readiness in the immutable presentation's locale, never the caller's
  // locale or an unrelated repository default. Full freshness validation follows.
  const presented = presentationId ? validateRunPresentationRecord(root, { runId, gate, revisionId, presentationId }) : null;
  if (presented?.reason) return rejected(runId, presented.reason, { recovery: presented.recovery });
  const language = presented?.record.presentation_language;
  const report = evaluateGateCheck(root, { runId, ...(typeof language === 'string' ? { presentationLanguage: language } : {}) });
  if (report.status !== "open" || report.current_gate !== gate || report.missing_approval !== `Approval: ${gate}`) {
    return rejected(runId, "gate_not_ready", {
      status: report.status,
      current_gate: report.current_gate,
      missing_approval: report.missing_approval,
      blocking_reason: report.blocking_reason,
    });
  }
  const artefact = parseControlState(run.content, { userGates: APPROVAL_GATES }).artefacts.get(gate);
  const digest = gate === "UAT" ? null : artefactFileDigest(root, artefact?.path);
  const durableArtefactReady = gate === "UAT"
    || (artefact?.path_format !== "invalid" && digest.startsWith("sha256:")
      && (gate !== "QA" || ["pass", "passed"].includes(artefact.status) || state.qa_acceptance?.eligible === true));
  if (!presentationId && !durableArtefactReady) {
    return rejected(runId, "approval_presentation_unavailable", {
      presentation_errors: report.presentation_diagnostics?.approval_presentation_errors ?? [],
    });
  }
  if (!material.available || !decided.available) return rejected(runId, 'decision_material_unavailable');
  const validation = validateGateApprovalResponse({
    response,
    responseOrigin: "deliberate_user_input",
    expectedApproval: `Approval: ${gate}`,
    expectedRunId: runId,
    currentRunId: run.meta.run_id,
    expectedGate: gate,
    currentGate: report.current_gate,
    expectedRevisionId: revisionId,
    currentRevisionId: run.meta.revision_id,
    durableArtefactReady,
  });
  if (!validation.accepted) return rejected(runId, validation.reason);

  const presentation = validateRunPresentation(root, { runId, gate, revisionId, presentationId }, { evaluateGateCheck });
  if (presentation.reason) return rejected(runId, presentation.reason, { recovery: presentation.recovery });

  const evidence = [
    `\`Approval: ${gate}\``,
    date,
    `revision ${run.meta.revision}`,
    ...(digest ? [`\`${artefact.path}\` ${digest.slice(0, 23)}`] : []),
    `presentation ${presentation.presentationId} ${presentation.digest}`,
  ].join(" · ");
  const qaAcceptance = gate === 'QA' && state.qa_acceptance?.eligible ? {
    kind: 'accepted_with_deviations', digest: state.qa_acceptance.digest,
    deviation_ids: state.qa_acceptance.proposal.deviations.map(row => row.finding_id), qa_outcome: 'revise',
  } : null;
  const next = canonicalRunText(run.content);
  const approvals = new Map(state.approvals);
  approvals.set(gate, { status: 'approved', evidence });
  const artefacts = new Map(state.artefacts);
  if (DURABLE_STATUS_GATES.has(gate)) artefacts.set(gate, { ...artefact, status: 'approved' });
  const proposedState = { ...state, approvals, artefacts };
  const postApprovalState = qaAcceptance ? { ...proposedState,
    qa_acceptance: { ...state.qa_acceptance, accepted: true } } : proposedState;
  const after = transitionDecisionForRunState(postApprovalState);
  return { run, next, after, digest, presentation, material, qaAcceptance,
    validateBeforeWrite: () => {
      const current = validateRunPresentation(root, { runId, gate, revisionId, presentationId }, { evaluateGateCheck });
      if (current.reason || current.digest !== presentation.digest) throw new Error("AGDF_STALE_RUN_REVISION");
    },
    validateDuringTransaction: () => {
      const current = validateRunPresentationRecord(root, { runId, gate, revisionId, presentationId });
      if (current.reason || current.digest !== presentation.digest) throw new Error("AGDF_STALE_RUN_REVISION");
      try { validateCurrentPreviewRecord(root, current.record); } catch { throw new Error('AGDF_STALE_RUN_REVISION'); }
    },
  };
}
