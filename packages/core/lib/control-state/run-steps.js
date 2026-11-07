import { extractField } from '../control-evaluation/verified-change.js';
import { transitionDecisionForRunState } from '../control-evaluation/gate-policy.js';
import { runDocumentPath, runEvidencePath, isRunDataPath, RUN_STEP_SLOTS } from './run-identity.js';
import { resolutionRecordVersion } from './input-resolution.js';
import { resolveControlCommandTarget } from './approval-command-contract.js';

import { assertRunOperationIdentity } from "./run-operation-identity.js";
import { readArtefactBindings } from "./artefact-bindings.js";
import { pendingRunStepPath } from "./run-step-pending.js";
import { appendRunOperation, readRunOperations, closureSuccessorText } from "./run-operations.js";
import { readOperationSource, operationSourceSetDigest, operationSources, operationReceipt, internalStepEligibility, reviewCorrectionRefusal, reviewCorrectionAvailable } from "./run-operation-proof.js";
import { appendEvidenceBinding, evidenceSourceSetDigest, CORRECTABLE_REVIEWS } from './evidence-bindings.js';
import { reviewFindingDiagnostics } from '../control-evaluation/normalized-gaps.js';
import { qaReportReferences } from '../control-evaluation/qa-follow-up.js';
import { COOPERATIVE_ASSURANCE } from './approval-command-contract.js';
import { INTERNAL_STEP_FILES, prepareOwnedOutput } from "./run-owned-outputs.js";
import { withControlMutation, assertLayoutRunWrite } from './control-layout.js';
import { digest } from "./approval-command-contract.js";
import { existsSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { runPath } from "./run-state-reader.js";
import { parseRunState } from "./run-state-parser.js";
import { canonicalRunText } from "./run-seal-compute.js";
import {
  firstSection,
  projectUrObjective,
  guardedWrite,
  readRun,
  rejected,
  endedRunRejection,
  replaceFirstScalar,
  replaceSectionScalar,
} from "./run-state-edits.js";
import { withOwnedFileLock } from "./run-state-writer.js";
import { commitRunStepLocked, recoverPendingRunStepLocked, readPendingRunStepJournal, pendingRunStepConflictIds } from "./run-step-transaction.js";
import { prepareArtefactRecording } from "./run-artefact-recording.js";
import { prepareRunContentState } from "../control-evaluation/run-state.js";
import { randomUUID } from "node:crypto";
import { evaluateCloseoutReadiness, closeoutConfirmation, closeoutContext } from '../control-evaluation/closeout-readiness.js';
import { exactApprovedArtefacts } from './artefact-binding-proof.js';
import { inspectQaReports } from '../control-evaluation/qa-follow-up.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';
import { statSync } from 'node:fs';
import { runWorkSummary, assertSummarySources } from "../control-evaluation/run-work-summary.js";
import { decisionMaterial, presentationDecisionState, decisionRemediationOwner } from './presentation-decision.js';
import { validateRunPresentation, validateRunPresentationRecord } from './run-presentation.js';
import { withRunMutationLock, writeRunMutationLocked } from './run-mutation.js';
import { APPROVAL_GATES as DECISION_GATES, REVISION_ID_PATTERN } from './run-identity.js';
import { runSealState, artefactFileDigest } from './run-seal.js';
import { inspectUxIntentDecision } from '../control-evaluation/definition-sources.js';
import { readReportDecision } from '../control-evaluation/report-decision.js';
import { prepareVerifiedChangeRecording } from './run-verified-change.js';

// Record one typed transition and its owned files in a single sealed revision.
// Current control and next actions are derived from those canonical facts.
export const RUN_STEPS = Object.freeze(["ur", "route", "review", "evidence", "closeout", "artefact", "internal"]);
export const RUN_STEP_ROUTES = Object.freeze(["quick_task", "verified_change", "structured_slice", "structured_delivery", "block"]);
// Internal steps are reachable only from their owning Core operation, never from run-step or step.record.
const INTERNAL_STEP_KINDS = Object.freeze({ lifecycle_close: "lifecycle_close.record" });
const knownStep = (step, operationContext) => RUN_STEPS.includes(step) || Object.hasOwn(INTERNAL_STEP_KINDS, step) && INTERNAL_STEP_KINDS[step] === operationContext?.kind;
export const RUN_CLOSED_NEXT_ACTION = "none, run ended";
const REVIEW_DECISIONS = new Set(["pass", "revise", "block"]);
const CONTROL_PREFIX = ".agdf/control/";

const artefactPath = (key, file) => file.startsWith('EVIDENCE-') ? runEvidencePath(key, file) : runDocumentPath(key, file);
const filled = (value) => typeof value === "string" && value.trim() !== "";
const recordingStep = (step, context) => knownStep(step, context) || step === 'verified_change' && context?.kind === 'step.record';
const oneLine = (value) => String(value ?? "").replace(/\s+/gu, " ").trim();
// Bounded strict-UTF-8 read of an artefact inside the selected Run; anything else is unavailable.
function readRunArtefact(root, runId, rawPath, limit = 131072) {
  const path = String(rawPath ?? '').replace(/^`|`$/gu, '');
  if (!isRunDataPath(runId, path) || posix.normalize(path) !== path || hasSymlinkComponent(root, path)) return undefined;
  const file = containedRegularFile(root, path);
  if (file.status !== 'valid' || statSync(file.path).size > limit) return undefined;
  try { return new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(file.path)); } catch { return undefined; }
}
// Review reports are read within the bound of the closeout quality inspection (inspectQaReports).
const REVIEW_REPORT_LIMIT = 262144;
// Every recording of a review or QA report applies the closeout quality rules; at most 64 diagnostics are returned.
const findingsRefusal = (runId, diagnostics) => rejected(runId, 'review_findings_invalid',
  { diagnostics: diagnostics.slice(0, 64), ...(diagnostics.length > 64 ? { diagnostics_truncated: true } : {}) });
function qaReportDiagnostics(root, runId, qa, control, proposedContent) {
  const content = proposedContent ?? readRunArtefact(root, runId, qa.path, REVIEW_REPORT_LIMIT);
  if (typeof content !== 'string') return [{ review: 'QA', finding_id: null, field: 'report', expected: 'a readable UTF-8 report of at most 256 KiB inside the Run', rule: 'report_unreadable' }];
  const references = qaReportReferences(content, qa.path);
  // Closeout inspects at most 64 distinct reports: the QA report, the recorded reviews and its references.
  const reports = new Set([qa.path, ...['TP Review', 'Clean Implementation Review', 'Clean Review', 'CR', 'Code Review']
    .map(type => String(control.artefacts.get(type)?.path ?? '').replace(/^`|`$/gu, '')).filter(Boolean), ...references.map(reference => reference.path)]);
  const bound = reports.size > 64 ? [{ review: 'QA', finding_id: null, field: 'references', expected: 'at most 64 review reports including the QA report', rule: 'source_limit' }] : [];
  return [...bound, ...reviewFindingDiagnostics('QA', content, { decision: qa.status }), ...references.flatMap(reference => {
    const text = /[%?#]/u.test(reference.path) ? undefined : readRunArtefact(root, runId, reference.path, REVIEW_REPORT_LIMIT);
    return typeof text === 'string' ? reviewFindingDiagnostics(reference.type, text)
      : [{ review: reference.type, finding_id: null, field: 'reference', expected: `a readable review report inside the Run at ${reference.path}, without %, ? or #`, rule: 'reference_unreadable' }];
  })];
}
// An invalid row names its correction path at OR only where the correction can be taken (closeout only).
const closeoutQualityDetail = (qa, control) => !qa.invalid ? qa.reason
  : `${qa.reason} ${qa.invalid.problems.map(problem => `${problem.field}: expected ${problem.expected}`).join('; ')}.${reviewCorrectionAvailable(control, qa.invalid.review, qa.invalid.problems)
    ? ` Record ${qa.invalid.review} again at gate OR from a corrected source that changes only the required_next_step cells, then record closeout.` : ' A correction at OR is not available for this finding.'}`;

function requireFile(root, runId, path, template) {
  return existsSync(join(root, path)) ? null : rejected(runId, "artefact_missing", { path, template });
}

function withSectionEdit(runId, text, edit) {
  const next = edit(text);
  return next === null ? { rejection: rejected(runId, "run_layout_unsupported") } : { text: next };
}

function recordRunStepLocked(root, input, { policy, date, afterWrite, operationContext, packageVersion, resolveMaterial, gitObservation }) {
  const { runId, revisionId, step } = input;
  if (!operationContext) return rejected(runId, 'operation_context_required');
  if (!recordingStep(step, operationContext)) return rejected(runId, "step_invalid", { steps: RUN_STEPS });
  const run = readRun(root, runId);
  if (run.rejection) return run.rejection;
  if (operationContext) {
    assertRunOperationIdentity(root, run, operationContext.operation_id, operationContext.kind);
    const artefactReceipt = readArtefactBindings(run.content).receipts.find(row => row.operation.id === operationContext.operation_id);
    const previous = artefactReceipt ? { kind: "artefact.record", request_digest: artefactReceipt.operation.request_digest, operation_id: artefactReceipt.operation.id, original: artefactReceipt }
      : readRunOperations(run.content).receipts.find(row => row.operation_id === operationContext.operation_id);
    if (previous) {
      if (previous.kind !== operationContext.kind || previous.request_digest !== operationContext.request_digest) return rejected(runId, "operation_payload_conflict");
      return { schema_version: "1", outcome: "already_applied", run_id: runId, operation_id: previous.operation_id,
        receipt: previous.original ?? previous, revision_id: run.meta.revision_id, authorizes: false };
    }
  }
  const ended = endedRunRejection(runId, run.content);
  if (ended) return ended;
  if (run.meta.revision_id !== revisionId) return rejected(runId, "stale_revision");
  let stagedSource;
  if (input.sourceBinding?.material_id) {
    stagedSource = resolveMaterial?.(input.sourceBinding);
    const slot = input.step === 'internal' ? input.internalStep : input.step === 'verified_change' ? 'Verified Change'
      : input.step === 'closeout' && stagedSource?.slot === 'Verified Change' ? 'Verified Change'
      : RUN_STEP_SLOTS[input.step];
    if (!stagedSource || stagedSource.slot !== slot) return rejected(runId, 'material_slot_mismatch');
    const file = slot === 'EVIDENCE' ? `EVIDENCE-${stagedSource.digest.slice(7)}.md`
      : ({ UR: 'UR.md', OR: 'OR.md', 'Verified Change': 'VERIFIED_CHANGE.md', ...INTERNAL_STEP_FILES })[slot];
    const path = artefactPath(runId, file);
    input = { ...input, sourceBinding: { path, digest: stagedSource.digest }, evidence: path };
  }
  if (input.material) {
    const sourceFile = input.material.path ? readOperationSource(root, runId, input.material) : null;
    const staged = sourceFile ? { slot: input.gate, content: sourceFile.content, digest: input.material.digest, validate: sourceFile.validate } : resolveMaterial?.(input.material);
    if (!staged || staged.slot !== input.gate) return rejected(runId, 'material_slot_mismatch');
    input = { ...input, stagedMaterial: staged };
  }
  const readSource = () => stagedSource ? { content: stagedSource.content,
    validate: () => { if (digest(canonicalRunText(stagedSource.content)) !== input.sourceBinding.digest) throw Error('AGDF_RUN_OPERATION_SOURCE_CHANGED'); } }
    : readOperationSource(root, runId, input.sourceBinding);

  const key = runId;
  let text = canonicalRunText(run.content);
  const control = { ...prepareRunContentState(root, text, run.path), meta: run.meta };
  const approved = (gate) => control.approvals.get(gate)?.status === "approved";
  const route = control.mode_slice_decision.decision;
  const before = policy(root, text, run.path);
  if (operationContext?.kind === 'ur_draft.replace' && (before.current_gate !== 'UR'
    || !control.artefacts.get('UR')?.path || approved('UR'))) return rejected(runId, 'ur_draft_not_replaceable');
  let recording = null;
  let ownedOutputs = [];
  let operationSource = null;
  let operationRecord = null;
  let compactPreparation = null;
  const edit = (fn) => {
    const result = withSectionEdit(runId, text, fn);
    if (result.rejection) return result.rejection;
    text = result.text;
    return null;
  };

  if (operationContext && !['internal', 'artefact', 'closeout', 'verified_change', 'lifecycle_close'].includes(step)) {
    if (!input.sourceBinding || control.meta.lifecycle !== "active") return rejected(runId, "operation_source_required");
    operationSource = readSource();
    const canonicalFile = { ur: "UR.md", route: "BROWNFIELD_REVIEW.md", review: INTERNAL_STEP_FILES.CR }[step];
    if (canonicalFile) ownedOutputs = [prepareOwnedOutput(root, runId, artefactPath(key, canonicalFile), operationSource.content)];
    else if (stagedSource) ownedOutputs = [prepareOwnedOutput(root, runId, input.sourceBinding.path, operationSource.content)];
    if (step === "review") {
      if (!['CR', 'Quick Task Execution'].includes(before.current_gate)
          || !['pass', 'revise', 'block'].includes(input.decision)) return rejected(runId, "review_step_not_ready");
      if (readReportDecision(operationSource.content) !== input.decision) return rejected(runId, "internal_result_unconfirmed");
      const diagnostics = reviewFindingDiagnostics('CR', operationSource.content, { decision: input.decision });
      if (diagnostics.length) return findingsRefusal(runId, diagnostics);
    }
    operationRecord = { step, source: { path: canonicalFile ? artefactPath(key, canonicalFile) : input.sourceBinding.path, digest: input.sourceBinding.digest },
      status: step === "review" && input.decision !== "pass" ? input.decision : "done", covers: oneLine(input.covers) || "selected Run scope",
      source_set_digest: operationSourceSetDigest(root, control, step) };
  }
  if (step === "lifecycle_close") {
    // Only an active, validly sealed Run closes; the closure keeps its gate and every artefact byte.
    const closure = input.closure;
    if (control.meta.lifecycle !== "active") return rejected(runId, "not_active");
    if (runSealState(root, run.content).status !== "valid") return rejected(runId, "seal_invalid");
    for (const fn of [value => replaceFirstScalar(value, "lifecycle", closure.lifecycle)]) {
      const failed = edit(fn); if (failed) return failed;
    }
    const successor = closureSuccessorText(closure.successor);
    const confirmer = closure.confirmed_by.statement === "unknown" ? "unknown person" : [closure.confirmed_by.name, closure.confirmed_by.email && `<${closure.confirmed_by.email}>`].filter(Boolean).join(" ");

    operationRecord = closure;

  } else if (step === 'verified_change') {
    operationSource = readSource();
    try { compactPreparation = prepareVerifiedChangeRecording(root, run, control, before, input, operationSource, gitObservation); }
    catch (e) { if (e.message.startsWith('verified_change_') || e.message === 'confirmation_required') return rejected(runId, e.message); throw e; }
    text = compactPreparation.text; ownedOutputs = compactPreparation.outputs;
    operationRecord = { step: 'Verified Change', source: { path: compactPreparation.path, digest: compactPreparation.digest },
      status: extractField(compactPreparation.content, 'status'), covers: `Verified Change ${input.phase}`, source_set_digest: operationSourceSetDigest(root, control, 'Verified Change') };

  } else if (step === "internal") {
    const ux = input.internalStep === 'UX Intent Definition';
    if (!operationContext || !internalStepEligibility(control, before, input, root) || !(ux ? ['ready', 'blocked', 'not_applicable'] : ["pass", "revise", "block", "not_applicable"]).includes(input.decision)
        || ["CD+Tests", "CR", "TP Review", "Clean Implementation Review"].includes(input.internalStep) && input.decision === "not_applicable"
        || input.decision === "not_applicable" && !filled(input.reason)) return rejected(runId, "internal_step_not_ready");
    operationSource = readSource();
    if (ux) {
      const checked = inspectUxIntentDecision(operationSource.content);
      if (!checked.well_formed || !checked.supported || checked.decision !== input.decision
        || input.decision === 'not_applicable' && (control.source_revision_ux_required || before.next_operation?.analysis === input.internalStep)) return rejected(runId, 'internal_result_unconfirmed');
    } else {
      if (readReportDecision(operationSource.content, { allowNotApplicable: true }) !== input.decision) return rejected(runId, "internal_result_unconfirmed");
    }
    if (CORRECTABLE_REVIEWS.includes(input.internalStep)) {
      const diagnostics = reviewFindingDiagnostics(input.internalStep, operationSource.content, { decision: input.decision });
      if (diagnostics.length) return findingsRefusal(runId, diagnostics);
      // After the QA approval only the OR correction path reaches an already recorded review.
      const recorded = control.artefacts.get(input.internalStep);
      if (approved('QA') && recorded?.path) {
        const correction = reviewCorrectionRefusal(input.internalStep, { ...recorded, content: readRunArtefact(root, runId, recorded.path, REVIEW_REPORT_LIMIT) }, input.decision, operationSource.content);
        if (correction) return rejected(runId, 'internal_step_not_ready', { correction });
      }
    }
    const path = artefactPath(key, INTERNAL_STEP_FILES[input.internalStep]);
    const status = ['pass', 'ready'].includes(input.decision) ? "done" : input.decision === 'blocked' ? 'block' : input.decision;
    ownedOutputs = [prepareOwnedOutput(root, runId, path, operationSource.content)];

    operationRecord = { step: input.internalStep, source: { path, digest: input.sourceBinding.digest }, status,
      covers: oneLine(input.covers) || "approved TP scope", source_set_digest: operationSourceSetDigest(root, control, input.internalStep) };

  } else if (step === "artefact") {
    if (operationContext && !input.material) operationSource = readSource();
    recording = prepareArtefactRecording(root, run, { ...input, ...(operationContext ? { operationId: operationContext.operation_id, requestDigest: operationContext.request_digest } : {}) }, control, before);
    ownedOutputs = recording.outputs ?? [];
    if (input.gate === 'QA') {
      const diagnostics = qaReportDiagnostics(root, runId, recording.receipt.destination, control, input.stagedMaterial?.content);
      if (diagnostics.length) return findingsRefusal(runId, diagnostics);
    }
    text = recording.text;

  } else if (step === "ur") {
    if (approved("UR")) return rejected(runId, "gate_not_ready", { current_gate: before.current_gate });
    if (!filled(input.title)) return rejected(runId, "title_missing");
    const path = artefactPath(key, "UR.md");
    const missing = ownedOutputs.some(row => row.path === path) ? null : requireFile(root, runId, path, `${CONTROL_PREFIX}templates/artefacts/UR.md`);
    if (missing) return missing;
    // Only this authorized UR writer projects orientation; reading never repairs.
    text = projectUrObjective(text, operationSource?.content ?? readFileSync(join(root, path), 'utf8'));

  } else if (step === "route") {
    const routeBeforeUrApproval = !approved("UR")
      && before.status === "open"
      && before.current_gate === "UR"
      && before.missing_approval === "Approval: UR";
    if (!routeBeforeUrApproval && (!approved("UR") || !["Brownfield Review", "Mode/Slice Decision"].includes(before.current_gate))) {
      return rejected(runId, "gate_not_ready", { current_gate: before.current_gate });
    }
    if (!RUN_STEP_ROUTES.includes(input.route)) return rejected(runId, "route_invalid", { routes: RUN_STEP_ROUTES });
    if (!filled(input.reason) || !filled(input.evidence)) return rejected(runId, "route_reason_missing");
    const path = artefactPath(key, "BROWNFIELD_REVIEW.md");
    const missing = ownedOutputs.some(row => row.path === path) ? null : requireFile(root, runId, path, `${CONTROL_PREFIX}templates/artefacts/BROWNFIELD_REVIEW.md`);
    if (missing) return missing;
    for (const fn of [
      (value) => replaceSectionScalar(value, "Mode/Slice Decision", "scope_reason", oneLine(input.reason)),
      (value) => replaceSectionScalar(value, "Mode/Slice Decision", "evidence", oneLine(input.evidence)),
      (value) => replaceFirstScalar(value, "mode", input.route),
    ]) {
      const failed = edit(fn);
      if (failed) return failed;
    }

  } else if (step === "review") {
    if (!RUN_STEP_ROUTES.includes(route)) return rejected(runId, "gate_not_ready", { current_gate: before.current_gate });
    if (!REVIEW_DECISIONS.has(input.decision)) return rejected(runId, "decision_invalid", { decisions: [...REVIEW_DECISIONS] });
    if (!filled(input.evidence)) return rejected(runId, "evidence_missing");
    const status = input.decision === "pass" ? "done" : input.decision;

  } else if (step === "evidence") {
    if (!filled(input.evidence)) return rejected(runId, "evidence_missing");

  } else if (step === 'closeout' && route === 'verified_change') {
    if (operationContext?.kind !== 'closeout.record') return rejected(runId, 'closeout_not_ready');
    operationSource = readSource();
    try { compactPreparation = prepareVerifiedChangeRecording(root, run, control, before, { ...input, operationId: operationContext.operation_id }, operationSource, gitObservation); }
    catch (e) { if (e.message.startsWith('verified_change_') || e.message === 'confirmation_required') return rejected(runId, e.message); throw e; }
    if (!exactApprovedArtefacts(root, control)) return rejected(runId, 'approved_source_proof_invalid');
    text = compactPreparation.text; ownedOutputs = compactPreparation.outputs; operationRecord = compactPreparation.record;

  } else if (step === "closeout") {
    if (operationContext) {
      if (operationContext.kind !== 'closeout.record' || !input.sourceBinding || control.meta.lifecycle !== 'active'
        || !['OR', 'Quick Task Execution'].includes(before.current_gate) || before.status === 'blocked') return rejected(runId, 'closeout_not_ready');
      operationSource = readSource();
      const report = operationSource.content;
      const readiness = evaluateCloseoutReadiness(control, report, path => readRunArtefact(root, runId, path), { prepared: true });
      if (!readiness.ready) {
        // The quality obligation still names the decisive finding and, where available, its correction path.
        const qa = readiness.findings.includes('closeout_quality_unconfirmed') ? inspectQaReports(root, control, runId, 'pass', 64, true) : null;
        return rejected(runId, 'closeout_obligations_unfulfilled', { findings: readiness.findings,
          ...(qa?.reason ? { reason_detail: closeoutQualityDetail(qa, control) } : {}) });
      }
      if (!exactApprovedArtefacts(root, control)) return rejected(runId, 'approved_source_proof_invalid');
      // The current exact acceptance projection already validates every remaining
      // evidence finding against its receipt. Do not reinterpret its retained
      // QA revise report as pass; ordinary closeout keeps the existing pass check.
      if (['structured_slice', 'structured_delivery'].includes(route) && !control.qa_acceptance?.accepted) {
        const qa = inspectQaReports(root, control, runId, 'pass', 64, true);
        if (qa.kind !== 'none' || qa.findings.length) return rejected(runId, 'closeout_quality_unconfirmed', { findings: qa.findings, reason_detail: closeoutQualityDetail(qa, control) });
      }
      const confirmation = closeoutConfirmation(runId, revisionId, operationContext.operation_id, input.sourceBinding.digest);
      if (input.confirmation !== confirmation) return rejected(runId, 'closeout_confirmation_required', { confirmation_selector: confirmation });
      const path = artefactPath(key, 'OR.md');
      ownedOutputs = [prepareOwnedOutput(root, runId, path, report)];
      for (const fn of [value => replaceFirstScalar(value, 'lifecycle', 'completed')]) {
        const failed = edit(fn); if (failed) return failed;
      }
      if (route !== 'quick_task') for (const [field, value] of Object.entries(closeoutContext(report))) {
        const heading = field.startsWith('context_graph_') ? 'Context Graph Impact' : 'Knowledge Persistence Decision';
        if (!firstSection(text.split('\n'), heading)) text = `${text.trimEnd()}\n\n## ${heading}\n\n`;
        if (!new RegExp(`^- ${field}:`, 'mu').test(text)) text = text.replace(new RegExp(`(## ${heading}\\n)`), `$1\n- ${field}:\n`);
        const failed = edit(text => replaceSectionScalar(text, heading, field, value)); if (failed) return failed;
      }
      operationRecord = { or: { path, digest: input.sourceBinding.digest }, lifecycle: 'completed', context_evidence_digest: readiness.context_digest, confirmation_digest: digest(confirmation) };

    }
  }

  const proposedArtefacts = new Map(ownedOutputs.map(row => [row.path, { content: row.next, digest: digest(canonicalRunText(row.next)) }]));
  const nextRevisionId = recording?.nextRevisionId ?? randomUUID();
  let appendedOperation = null, appendedEvidence = null;
  if (operationContext && (operationRecord && ['step.record', 'ur_draft.replace'].includes(operationContext.kind) || recording && input.gate === 'QA')) {
    const evidenceStep = operationRecord?.step ?? input.gate;
    const sources = operationSources(root, control, evidenceStep);
    appendedEvidence = { schema_version: operationContext.kind === 'ur_draft.replace' ? '2' : '1', run_id: runId, operation_id: operationContext.operation_id, action: operationContext.kind, step: evidenceStep,
      report: operationRecord?.source ?? { path: recording.receipt.destination.path, digest: recording.receipt.destination.digest }, sources,
      source_set_digest: evidenceSourceSetDigest(sources), producer: { contract: 'run-command/1', package_version: packageVersion }, assurance: COOPERATIVE_ASSURANCE };
    text = appendEvidenceBinding(text, appendedEvidence);
  }
  if (operationContext && operationRecord) {
    const record = appendedEvidence ? { evidence_binding_id: appendedEvidence.operation_id, status: operationRecord.status, covers: operationRecord.covers } : operationRecord;
    appendedOperation = operationReceipt(root, run, operationContext, nextRevisionId, record, packageVersion);
    text = appendRunOperation(text, appendedOperation);
  }
  const after = policy(root, text, run.path, { proposedArtefacts });
  const closing = step === 'lifecycle_close', nextAction = closing ? RUN_CLOSED_NEXT_ACTION : after.next_allowed_action;

  // Owned outputs are published before the precommit source check, so the summary reads them as proposed.
  const summary = runWorkSummary(root, text, run.path, after, { proposed: new Map([...proposedArtefacts].map(([path, row]) => [path, row.content])) });
  const written = guardedWrite(runId, () => commitRunStepLocked(root, {
      runId, runPath: run.path, content: text, revisionId, expectedContent: run.content,
      afterWrite,
      nextRevisionId, outputs: ownedOutputs, operationContext,
      writeOptions: { ...(appendedOperation ? { appendedOperation } : {}), ...(appendedEvidence ? { appendedEvidence } : {}), ...(recording ? { appendedBinding: recording.receipt, allowContentChange: recording.allowContentChange } : {}),
        validateBeforeWrite: () => { recording?.validateBeforeWrite(); operationSource?.validate(); compactPreparation?.validate();
          if (operationRecord?.step && operationSourceSetDigest(root, control, operationRecord.step) !== operationRecord.source_set_digest) throw Error("AGDF_RUN_OPERATION_SOURCE_CHANGED");
          if (operationContext?.kind === 'closeout.record' && !exactApprovedArtefacts(root, control)) throw Error('AGDF_RUN_OPERATION_SOURCE_CHANGED');
          assertSummarySources(root, summary); } },
    }));
  if (written.rejection) return written.rejection;
  return Object.freeze({
    schema_version: "1",
    outcome: "recorded",
    run_id: runId,
    step,
    previous_revision_id: revisionId,
    revision: written.state.meta.revision,
    revision_id: written.state.meta.revision_id,
    current_gate: closing ? before.current_gate : after.current_gate,
    next_allowed_action: nextAction,
    ...(appendedOperation ? { operation_id: appendedOperation.operation_id, receipt: appendedOperation }
      : recording ? { operation_id: recording.receipt.operation.id, receipt: recording.receipt } : {}),
  });
}

export function recordRunStep(root, input, { policy, date = new Date().toISOString().slice(0, 10), afterWrite, operationContext, packageVersion = "0.14.5", resolveMaterial, gitObservation } = {}) {
  const { runId, step } = input;
  if (!recordingStep(step, operationContext)) return rejected(runId, "step_invalid", { steps: RUN_STEPS });
  let path;
  try { path = runPath(root, runId); } catch { return rejected(runId, "run_id_invalid"); }
  const locked = guardedWrite(runId, () => withOwnedFileLock(path, () => {
    return withControlMutation(root, { resource: `run:${runId}`, operation_id: operationContext?.operation_id ?? randomUUID(),
      resume: true, proveOutcome: result => ['recorded', 'recovered', 'already_applied'].includes(result?.outcome) }, () => {
    const perform = () => {
    const parsed = parseRunState(readFileSync(path, 'utf8'));
    if (!parsed.valid) return rejected(runId, 'run_state_invalid');
    assertLayoutRunWrite(root, parsed);
    const otherPending = pendingRunStepConflictIds(root, runId).find((id) => id !== runId);
    if (otherPending) return rejected(runId, "run_step_recovery_required", { pending_run_id: otherPending });
    if (operationContext && existsSync(pendingRunStepPath(root, runId))) {
      const pending = readPendingRunStepJournal(root, runId);
      if (resolutionRecordVersion(pending) !== 7 || pending.kind !== operationContext.kind || pending.operation_id !== operationContext.operation_id
          || pending.request_digest !== operationContext.request_digest || pending.old_revision_id !== input.revisionId) return rejected(runId, "original_operation_recovery_required");
      recoverPendingRunStepLocked(root, runId);
      return recordRunStepLocked(root, input, { policy, date, afterWrite, operationContext, packageVersion, resolveMaterial, gitObservation });
    }
    const recovered = recoverPendingRunStepLocked(root, runId);
    if (recovered.status === "completed") {
      return Object.freeze({ schema_version: "1", outcome: "recovered", run_id: runId,
        operation_id: recovered.operation_id, revision_id: recovered.revision_id });
    }
    return recordRunStepLocked(root, input, { policy, date, afterWrite, operationContext, packageVersion, resolveMaterial, gitObservation });
    };
    return perform();
    });
  }));
  return locked.rejection ?? locked.state;
}

// Private app decision branch of this existing recording owner. It is deliberately
// absent from RUN_STEPS and every model-facing step.record selector/schema.
export function recordRunPresentationDecision(root, input, { evaluateGateCheck, packageVersion = '0.14.5', afterWrite } = {}) {
  const { runId, revisionId, operationId, gate, presentationId, action, comment, requestDigest } = input;
  if (!DECISION_GATES.includes(gate) || !['request_change', 'reject'].includes(action)
    || ![revisionId, operationId, presentationId].every(id => REVISION_ID_PATTERN.test(id ?? ''))
    || typeof comment !== 'string' || Buffer.byteLength(comment) > 8192 || /\0/u.test(comment)
    || action === 'request_change' && !comment.trim() || !/^sha256:[0-9a-f]{64}$/u.test(requestDigest ?? '')) return rejected(runId, 'decision_input_invalid');
  const context = { kind: 'presentation_decision.record', operation_id: operationId, request_digest: requestDigest };
  const written = guardedWrite(runId, () => withRunMutationLock(root, runPath(root, runId), () => {
    const run = readRun(root, runId); if (run.rejection) return run.rejection;
    assertRunOperationIdentity(root, run, operationId, context.kind);
    const previous = readRunOperations(run.content).receipts.find(row => row.operation_id === operationId);
    if (previous) return previous.kind === context.kind && previous.request_digest === requestDigest
      ? { outcome: 'already_applied', receipt: previous, historical_effect: true, authorizes: false }
      : rejected(runId, 'operation_payload_conflict');
    const ended = endedRunRejection(runId, run.content); if (ended) return ended;
    if (run.meta.revision_id !== revisionId) return rejected(runId, 'stale_revision');
    if (runSealState(root, run.content).status !== 'valid') return rejected(runId, 'seal_invalid');
    const state = prepareRunContentState(root, run.content, run.path);
    const decision = presentationDecisionState(root, state, gate);
    if (!decision.available) return rejected(runId, decision.reason);
    if (decision.decided || state.approvals.get(gate)?.status === 'approved') return rejected(runId, 'presentation_version_decided', { decision });
    const presentation = validateRunPresentation(root, { runId, gate, revisionId, presentationId }, { evaluateGateCheck });
    if (presentation.reason) return rejected(runId, presentation.reason);
    const material = decisionMaterial(root, state, gate), nextRevisionId = randomUUID();
    const record = { gate, presentation_id: presentationId, presentation_digest: presentation.digest,
      material_version: material.material_version, material_sources: material.sources, action, comment,
      owner: decisionRemediationOwner(gate), artefact_digest: gate === 'UAT' ? null : artefactFileDigest(root, state.artefacts.get(gate)?.path) };
    const receipt = operationReceipt(root, run, context, nextRevisionId, record, packageVersion);
    let next = appendRunOperation(run.content, receipt);
    const saved = writeRunMutationLocked(root, run.path, next, revisionId, { expectedContent: run.content,
      appendedOperation: receipt, nextRevisionId, operationContext: { ...context, target_id: receipt.target_id }, afterWrite,
      validateDuringTransaction: () => {
        const fresh = validateRunPresentationRecord(root, { runId, gate, revisionId, presentationId });
        if (fresh.reason || fresh.digest !== presentation.digest || decisionMaterial(root, state, gate).material_version !== material.material_version) throw Error('AGDF_STALE_RUN_REVISION');
      } });
    const after = transitionDecisionForRunState(prepareRunContentState(root, saved.content, run.path));
    return { outcome: 'recorded', receipt, revision_id: saved.meta.revision_id, next_operation: after.next_operation, authorizes: false };
  }, { operationContext: { ...context, target_id: resolveControlCommandTarget(root).target_id } }));
  return written.rejection ?? written.state;
}
