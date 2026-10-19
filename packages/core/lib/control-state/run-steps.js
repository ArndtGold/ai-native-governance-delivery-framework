import { resolveControlCommandTarget } from './approval-command-contract.js';
import { policyForRunContent as policyForDecision } from '../control-evaluation/run-step-policy.js';
import { assertRunOperationIdentity } from "./run-operation-identity.js";
import { readArtefactBindings } from "./artefact-bindings.js";
import { pendingRunStepPath } from "./run-step-pending.js";
import { appendRunOperation, readRunOperations } from "./run-operations.js";
import { readOperationSource, operationSourceSetDigest, operationSources, operationReceipt, internalStepEligibility, reviewCorrectionRefusal, reviewCorrectionAvailable } from "./run-operation-proof.js";
import { appendEvidenceBinding, evidenceSourceSetDigest, CORRECTABLE_REVIEWS } from './evidence-bindings.js';
import { reviewFindingDiagnostics } from '../control-evaluation/normalized-gaps.js';
import { qaReportReferences } from '../control-evaluation/qa-follow-up.js';
import { COOPERATIVE_ASSURANCE } from './approval-command-contract.js';
import { INTERNAL_STEP_FILES, prepareOwnedOutput } from "./run-owned-outputs.js";
import { canonicalJson, digest } from "./approval-command-contract.js";
import { existsSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { runPath } from "./run-state-reader.js";
import { parseControlState } from "./run-state-parser.js";
import { APPROVAL_GATES, canonicalRunText } from "./run-seal-compute.js";
import {
  firstSection,
  projectUrObjective,
  guardedWrite,
  readRun,
  rejected,
  removeTableRows,
  replaceFirstScalar,
  replaceSectionScalar,
  tableCells,
  tableLineIndexes,
  upsertTableRow,
  appendTableRow,
} from "./run-state-edits.js";
import { withOwnedFileLock, writeRunLocked } from "./run-state-writer.js";
import { commitRunStepLocked, recoverPendingRunStepLocked, readPendingRunStepJournal } from "./run-step-transaction.js";
import { pendingRunStepIds } from "./run-step-pending.js";
import { prepareArtefactRecording } from "./run-artefact-recording.js";
import { backlogStatusForSummary, assertBacklogPath, prepareRunBacklog, backlogTableLayout } from "./run-backlog.js";
import { prepareRunContentState } from "../control-evaluation/run-state.js";
import { randomUUID } from "node:crypto";
import { evaluateCloseoutReadiness, closeoutConfirmation, closeoutContext } from '../control-evaluation/closeout-readiness.js';
import { exactApprovedArtefacts } from './artefact-binding-proof.js';
import { inspectQaReports } from '../control-evaluation/qa-follow-up.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';
import { statSync } from 'node:fs';
import { runWorkSummary, assertSummarySources } from "../control-evaluation/run-work-summary.js";
import { recordBacklogSummary } from "./backlog-summary.js";
import { decisionMaterial, presentationDecisionState, decisionRemediationOwner } from './presentation-decision.js';
import { validateRunPresentation, validateRunPresentationRecord } from './run-presentation.js';
import { withRunBacklogLock, writeRunWithBacklogLocked } from './run-backlog-writer.js';
import { APPROVAL_GATES as DECISION_GATES, REVISION_ID_PATTERN } from './run-identity.js';
import { runSealState, artefactFileDigest } from './run-seal.js';
import { inspectUxIntentDecision } from '../control-evaluation/definition-sources.js';
import { readReportDecision } from '../control-evaluation/report-decision.js';

// run-step records one standard transition of the small path in a single sealed revision. The agent
// supplies content, reasons and evidence; the command maintains the dependent tables, the backlog
// pointer and the policy-derived next action so no hand edit of the control state is needed.
export const RUN_STEPS = Object.freeze(["ur", "route", "review", "evidence", "closeout", "artefact", "internal"]);
export const RUN_STEP_ROUTES = Object.freeze(["quick_task", "verified_change", "structured_slice", "structured_delivery", "block"]);
const REVIEW_DECISIONS = new Set(["pass", "revise", "block"]);
const NEXT_GATE_BY_ROUTE = Object.freeze({
  quick_task: "Quick Task Execution",
  verified_change: "Verified Change Execution",
  structured_slice: "PRD",
  structured_delivery: "PRD",
  block: "none",
});
const BACKLOG_LABELS = Object.freeze([["UR", "UR"], ["Brownfield Review", "Brownfield"], ["PRD", "PRD"], ["SD", "SD"], ["TP", "TP"], ["QA", "QA"], ["OR", "OR"]]);
const BACKLOG_PATH = join(".agdf", "control", "MASTER_BACKLOG.md");
const CONTROL_PREFIX = ".agdf/control/";

const artefactPath = (key, file) => `${CONTROL_PREFIX}artefacts/${key}/${file}`;
const filled = (value) => typeof value === "string" && value.trim() !== "";
const oneLine = (value) => String(value ?? "").replace(/\s+/gu, " ").trim();
// Bounded strict-UTF-8 read of an artefact inside the selected Run; anything else is unavailable.
function readRunArtefact(root, runId, rawPath, limit = 131072) {
  const path = String(rawPath ?? '').replace(/^`|`$/gu, '');
  if (!path.startsWith(`.agdf/control/artefacts/${runId}/`) || posix.normalize(path) !== path || hasSymlinkComponent(root, path)) return undefined;
  const file = containedRegularFile(root, path);
  if (file.status !== 'valid' || statSync(file.path).size > limit) return undefined;
  try { return new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(file.path)); } catch { return undefined; }
}
// Review reports are read within the bound of the closeout quality inspection (inspectQaReports).
const REVIEW_REPORT_LIMIT = 262144;
// Every recording of a review or QA report applies the closeout quality rules; at most 64 diagnostics are returned.
const findingsRefusal = (runId, diagnostics) => rejected(runId, 'review_findings_invalid',
  { diagnostics: diagnostics.slice(0, 64), ...(diagnostics.length > 64 ? { diagnostics_truncated: true } : {}) });
function qaReportDiagnostics(root, runId, qa, control) {
  const content = readRunArtefact(root, runId, qa.path, REVIEW_REPORT_LIMIT);
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

function artefactHeading(root, path) {
  try {
    return readFileSync(join(root, path), "utf8").match(/^#\s+(.+)$/mu)?.[1]?.trim() ?? "";
  } catch {
    return "";
  }
}

function backlogLinks(text) {
  const control = parseControlState(text, { userGates: APPROVAL_GATES, internalSteps: ["Brownfield Review"], closeoutArtefacts: ["OR"] });
  return BACKLOG_LABELS
    .map(([type, label]) => [label, control.artefacts.get(type)?.path ?? ""])
    .filter(([, path]) => path.startsWith(CONTROL_PREFIX))
    .map(([label, path]) => `[${label}](${path.slice(CONTROL_PREFIX.length)})`);
}

function prepareBacklog(root, key, { title, status, links, next, closeout }) {
  const path = join(root, BACKLOG_PATH);
  if (!existsSync(path)) return { status: "missing", update: null };
  const original = readFileSync(path, "utf8");
  let text = canonicalRunText(original);
  const lines = text.split("\n");
  const active = firstSection(lines, "Active Backlog");
  const indexes = active ? tableLineIndexes(lines, active) : [];
  const layout = indexes.length ? backlogTableLayout(tableCells(lines[indexes[0]])) : null;
  if (layout === "legacy") return { status: "layout_legacy", update: null };
  if (layout !== "compact") return { status: "layout_unsupported", update: null };
  const matching = indexes.slice(2).filter(index => tableCells(lines[index])[1]?.replaceAll("`", "").trim() === key);
  if (matching.length > 1) throw Error("AGDF_BACKLOG_IDENTITY_AMBIGUOUS");
  if (matching.some(index => tableCells(lines[index]).length !== 7)) return { status: "layout_unsupported", update: null };
  const existing = active
    ? tableLineIndexes(lines, active).slice(2).map((index) => tableCells(lines[index])).find((cells) => cells[1]?.replaceAll("`", "").trim() === key)
    : undefined;
  const rowTitle = oneLine(title) || existing?.[2] || key;
  if (closeout) {
    text = removeTableRows(text, "Active Backlog", 1, existing?.[1] ?? key) ?? text;
    text = upsertTableRow(text, "Completed / Superseded Pointers", 0, key, [key, rowTitle, "Completed", closeout.record, oneLine(closeout.outcome)]);
  } else {
    text = upsertTableRow(text, "Active Backlog", 1, existing?.[1] ?? key, [
      existing?.[0] || "P1",
      existing?.[1] ?? key,
      rowTitle,
      status ?? existing?.[3] ?? "In Progress",
      links.join(" · "),
      links[0] ?? "",
      oneLine(next),
    ]);
  }
  if (text === null) return { status: "layout_unsupported", update: null };
  // A step commits a new Run revision even when its visible row cells are unchanged.
  // Keep the candidate so the caller records that revision's observation in this transaction.
  return { status: "updated", update: { old: original, next: text } };
}

function closeoutRecord({ title, runId, date, result, evidence, risk, next }) {
  return [
    `# OR-lite: ${title}`,
    "",
    "Report mode: OR-lite",
    `Run: \`${runId}\``,
    "Route: `quick_task` (Compact Delivery)",
    `Date: ${date}`,
    "",
    "## Result",
    "",
    oneLine(result),
    "",
    "## Evidence",
    "",
    oneLine(evidence),
    "",
    "## Risk",
    "",
    oneLine(risk),
    "",
    "## Next Step",
    "",
    oneLine(next),
    "",
  ].join("\n");
}

function recordRunStepLocked(root, input, { policy, date, afterWrite, operationContext, packageVersion }) {
  const { runId, revisionId, step } = input;
  if (!RUN_STEPS.includes(step)) return rejected(runId, "step_invalid", { steps: RUN_STEPS });
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
  if (run.meta.revision_id !== revisionId) return rejected(runId, "stale_revision");

  const key = runId;
  let text = canonicalRunText(run.content);
  const control = { ...prepareRunContentState(root, text, run.path), meta: run.meta };
  const approved = (gate) => control.approvals.get(gate)?.status === "approved";
  const route = control.mode_slice_decision.decision;
  const before = policy(root, text, run.path);
  let known = "";
  let evidenceRow = null;
  let backlog = null;
  let orContent = null;
  let recording = null;
  let ownedOutputs = [];
  let operationSource = null;
  let operationRecord = null;
  const edit = (fn) => {
    const result = withSectionEdit(runId, text, fn);
    if (result.rejection) return result.rejection;
    text = result.text;
    return null;
  };

  if (operationContext && step !== "internal" && step !== "artefact" && step !== "closeout") {
    if (!input.sourceBinding || control.meta.lifecycle !== "active") return rejected(runId, "operation_source_required");
    operationSource = readOperationSource(root, runId, input.sourceBinding);
    const canonicalFile = { ur: "UR.md", route: "BROWNFIELD_REVIEW.md", review: INTERNAL_STEP_FILES.CR }[step];
    if (canonicalFile) ownedOutputs = [prepareOwnedOutput(root, runId, artefactPath(key, canonicalFile), operationSource.content)];
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
  if (step === "internal") {
    const ux = input.internalStep === 'UX Intent Definition';
    if (!operationContext || !internalStepEligibility(control, before, input, root) || !(ux ? ['ready', 'blocked', 'not_applicable'] : ["pass", "revise", "block", "not_applicable"]).includes(input.decision)
        || ["CD+Tests", "CR", "TP Review", "Clean Implementation Review"].includes(input.internalStep) && input.decision === "not_applicable"
        || input.decision === "not_applicable" && !filled(input.reason)) return rejected(runId, "internal_step_not_ready");
    operationSource = readOperationSource(root, runId, input.sourceBinding);
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
    const failed = edit(value => upsertTableRow(value, "Artefacts", 0, input.internalStep,
      [input.internalStep, path, status, `Recorded exact internal result; operation ${operationContext.operation_id}`]));
    if (failed) return failed;
    known = `${input.internalStep} result recorded: ${input.decision}.`;
    evidenceRow = [input.internalStep, path, oneLine(input.covers) || "approved TP scope", "bound cooperative result"];
    operationRecord = { step: input.internalStep, source: { path, digest: input.sourceBinding.digest }, status,
      covers: oneLine(input.covers) || "approved TP scope", source_set_digest: operationSourceSetDigest(root, control, input.internalStep) };
    backlog = {};
  } else if (step === "artefact") {
    if (operationContext) operationSource = readOperationSource(root, runId, input.sourceBinding);
    recording = prepareArtefactRecording(root, run, { ...input, ...(operationContext ? { operationId: operationContext.operation_id, requestDigest: operationContext.request_digest } : {}) }, control, before);
    if (input.gate === 'QA') {
      const diagnostics = qaReportDiagnostics(root, runId, recording.receipt.destination, control);
      if (diagnostics.length) return findingsRefusal(runId, diagnostics);
    }
    text = recording.text;
    known = `${input.gate} artefact and reviewed source binding recorded together.`;
    backlog = {};
  } else if (step === "ur") {
    if (approved("UR")) return rejected(runId, "gate_not_ready", { current_gate: before.current_gate });
    if (!filled(input.title)) return rejected(runId, "title_missing");
    const path = artefactPath(key, "UR.md");
    const missing = ownedOutputs.some(row => row.path === path) ? null : requireFile(root, runId, path, `${CONTROL_PREFIX}templates/artefacts/UR.md`);
    if (missing) return missing;
    // Only this authorized UR writer projects orientation; reading never repairs.
    text = projectUrObjective(text, operationSource?.content ?? readFileSync(join(root, path), 'utf8'));
    const failed = edit((value) => upsertTableRow(value, "Artefacts", 0, "UR", ["UR", `\`${path}\``, "draft"]));
    if (failed) return failed;
    known = `UR drafted at \`${path}\`.`;
    evidenceRow = ["UR draft", `\`${path}\``, "problem, goal, scope and acceptance signals", "direct"];
    backlog = { title: input.title };
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
      (value) => upsertTableRow(value, "Artefacts", 0, "Brownfield Review", ["Brownfield Review", `\`${path}\``, "done"]),
      (value) => replaceSectionScalar(value, "Mode/Slice Decision", "decision", input.route),
      (value) => replaceSectionScalar(value, "Mode/Slice Decision", "required_next_gate", NEXT_GATE_BY_ROUTE[input.route]),
      (value) => replaceSectionScalar(value, "Mode/Slice Decision", "scope_reason", oneLine(input.reason)),
      (value) => replaceSectionScalar(value, "Mode/Slice Decision", "evidence", oneLine(input.evidence)),
      (value) => replaceFirstScalar(value, "mode", input.route),
    ]) {
      const failed = edit(fn);
      if (failed) return failed;
    }
    known = `Brownfield Review at \`${path}\` selected \`${input.route}\`.`;
    evidenceRow = ["Brownfield Review", `\`${path}\``, `Mode/Slice Decision \`${input.route}\``, "direct"];
    backlog = {};
  } else if (step === "review") {
    if (!RUN_STEP_ROUTES.includes(route)) return rejected(runId, "gate_not_ready", { current_gate: before.current_gate });
    if (!REVIEW_DECISIONS.has(input.decision)) return rejected(runId, "decision_invalid", { decisions: [...REVIEW_DECISIONS] });
    if (!filled(input.evidence)) return rejected(runId, "evidence_missing");
    const status = input.decision === "pass" ? "done" : input.decision;
    const failed = edit((value) => upsertTableRow(value, "Artefacts", 0, "CR", ["CR", "", status, `Code Review ${input.decision}`]));
    if (failed) return failed;
    if (operationContext) {
      const failed = edit(value => upsertTableRow(value, "Artefacts", 0, "CR", ["CR", operationRecord.source.path, status, "Bound actual Code Review result"]));
      if (failed) return failed;
    }
    known = `Code Review decision \`${input.decision}\`.`;
    evidenceRow = ["Code Review", oneLine(input.source) || "code-review", `decision ${input.decision}: ${oneLine(input.evidence)}`, "direct"];
    backlog = {};
  } else if (step === "evidence") {
    if (!filled(input.evidence)) return rejected(runId, "evidence_missing");
    known = `Evidence recorded: ${oneLine(input.evidence)}.`;
    evidenceRow = [oneLine(input.evidence), oneLine(input.source) || "agent", oneLine(input.covers) || "delivery", "direct"];
  } else if (step === "closeout") {
    if (operationContext) {
      if (operationContext.kind !== 'closeout.record' || !input.sourceBinding || control.meta.lifecycle !== 'active'
        || !['OR', 'Quick Task Execution'].includes(before.current_gate) || before.status === 'blocked') return rejected(runId, 'closeout_not_ready');
      operationSource = readOperationSource(root, runId, input.sourceBinding);
      const report = operationSource.content;
      const readiness = evaluateCloseoutReadiness(control, report, path => readRunArtefact(root, runId, path), { prepared: true });
      if (!readiness.ready) return rejected(runId, 'closeout_obligations_unfulfilled', { findings: readiness.findings });
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
      for (const fn of [value => upsertTableRow(value, 'Artefacts', 0, 'OR', ['OR', path, 'done', 'Bound exact orchestration report']),
        value => replaceFirstScalar(value, 'lifecycle', 'completed'), value => replaceFirstScalar(value, 'current_gate', 'OR'), value => replaceFirstScalar(value, 'decision', 'completed')]) {
        const failed = edit(fn); if (failed) return failed;
      }
      if (route !== 'quick_task') for (const [field, value] of Object.entries(closeoutContext(report))) {
        const heading = field.startsWith('context_graph_') ? 'Context Graph Impact' : 'Knowledge Persistence Decision';
        if (!firstSection(text.split('\n'), heading)) text = `${text.trimEnd()}\n\n## ${heading}\n\n`;
        if (!new RegExp(`^- ${field}:`, 'mu').test(text)) text = text.replace(new RegExp(`(## ${heading}\\n)`), `$1\n- ${field}:\n`);
        const failed = edit(text => replaceSectionScalar(text, heading, field, value)); if (failed) return failed;
      }
      operationRecord = { or: { path, digest: input.sourceBinding.digest }, lifecycle: 'completed', context_evidence_digest: readiness.context_digest, confirmation_digest: digest(confirmation) };
      known = `Run delivery completed; exact ${route === 'quick_task' ? 'OR-lite' : 'OR-full'} at ${path}.`;
      evidenceRow = ['OR', path, 'selected Run closeout; no VCS or publication effect', 'bound cooperative result'];
      backlog = { closeout: { record: `[OR](artefacts/${key}/OR.md)`, outcome: 'Completed approved scope with disclosed report obligations.' } };
    } else {
    if (route !== "quick_task") return rejected(runId, "closeout_route_unsupported", { route: route || "undecided" });
    if (before.current_gate !== "Quick Task Execution") return rejected(runId, "gate_not_ready", { current_gate: before.current_gate });
    if (control.artefacts.get("CR")?.status !== "done") return rejected(runId, "code_review_missing");
    if (![input.result, input.evidence, input.risk, input.next].every(filled)) return rejected(runId, "closeout_fields_missing");
    const path = artefactPath(key, "OR.md");
    const title = artefactHeading(root, artefactPath(key, "UR.md")).replace(/^UR:\s*/u, "") || key;
    for (const fn of [
      (value) => upsertTableRow(value, "Artefacts", 0, "OR", ["OR", `\`${path}\``, "done"]),
      (value) => replaceFirstScalar(value, "lifecycle", "completed"),
      (value) => replaceFirstScalar(value, "current_gate", "OR"),
      (value) => replaceFirstScalar(value, "decision", "completed"),
    ]) {
      const failed = edit(fn);
      if (failed) return failed;
    }
    orContent = closeoutRecord({ title, runId, date, ...input });
    known = `Quick task delivered; OR-lite at \`${path}\`.`;
    evidenceRow = ["OR-lite", `\`${path}\``, "quick task closeout", "direct"];
    backlog = { closeout: { record: `[OR](artefacts/${key}/OR.md)`, outcome: input.result } };
    }
  }

  if (evidenceRow) {
    const failed = edit((value) => appendTableRow(value, "Evidence", evidenceRow));
    if (failed) return failed;
  }
  const proposedArtefacts = new Map(ownedOutputs.map(row => [row.path, { content: row.next, digest: input.sourceBinding.digest }]));
  if (orContent) proposedArtefacts.set(artefactPath(key, 'OR.md'), { content: orContent, digest: digest(canonicalRunText(orContent)) });
  const nextRevisionId = recording?.nextRevisionId ?? randomUUID();
  let appendedOperation = null, appendedEvidence = null;
  if (operationContext && operationRecord) {
    appendedOperation = operationReceipt(root, run, operationContext, nextRevisionId, operationRecord, packageVersion);
    text = appendRunOperation(text, appendedOperation);
  }
  if (operationContext && (operationRecord && operationContext.kind === 'step.record' || recording && input.gate === 'QA')) {
    const evidenceStep = operationRecord?.step ?? input.gate;
    const sources = operationSources(root, control, evidenceStep);
    appendedEvidence = { schema_version: '1', run_id: runId, operation_id: operationContext.operation_id, action: operationContext.kind, step: evidenceStep,
      report: operationRecord?.source ?? { path: recording.receipt.destination.path, digest: recording.receipt.destination.digest }, sources,
      source_set_digest: evidenceSourceSetDigest(sources), producer: { contract: 'run-command/1', package_version: packageVersion }, assurance: COOPERATIVE_ASSURANCE };
    text = appendEvidenceBinding(text, appendedEvidence);
  }
  const after = policy(root, text, run.path, { proposedArtefacts });
  const approvedGates = APPROVAL_GATES.filter((gate) => parseControlState(text, { userGates: APPROVAL_GATES }).approvals.get(gate)?.status === "approved");
  for (const fn of [
    (value) => replaceFirstScalar(value, "current_gate", after.current_gate),
    (value) => replaceFirstScalar(value, "next_allowed_action", after.next_allowed_action),
    (value) => upsertTableRow(value, "Current Control State", 0, "What is known?", ["What is known?", known]),
    (value) => upsertTableRow(value, "Current Control State", 0, "What is approved?", ["What is approved?", approvedGates.length ? approvedGates.map((gate) => `Approval: ${gate}`).join(", ") : "Nothing yet."]),
    (value) => upsertTableRow(value, "Current Control State", 0, "What is missing?", ["What is missing?", after.missing_approval !== "none" ? `Exact ${after.missing_approval}.` : "No approval is pending."]),
    (value) => upsertTableRow(value, "Current Control State", 0, "What is the next allowed action?", ["What is the next allowed action?", after.next_allowed_action]),
    (value) => upsertTableRow(value, "Current Control State", 0, "What is explicitly forbidden right now?", ["What is explicitly forbidden right now?", after.forbidden.join("; ") || "none"]),
  ]) {
    const failed = edit(fn);
    if (failed) return failed;
  }

  const summary = runWorkSummary(root, text, run.path, after);
  const statusLabel = backlogStatusForSummary(summary, after);
  let backlogPlan = backlog
    ? prepareBacklog(root, key, { ...backlog, status: statusLabel, links: backlogLinks(text), next: summary.display_action })
    : prepareRunBacklog(root, key, text, run.path, nextRevisionId);
  // Legacy rows keep their title and per-gate link columns. Status and next step still follow
  // the Run where the row exists; a closeout move is left to the maintainer.
  if (backlogPlan.status === "layout_legacy") backlogPlan = { ...(backlog.closeout ? { status: "skipped", update: null }
    : prepareRunBacklog(root, key, text, run.path, nextRevisionId)), reason: "backlog_layout_legacy" };
  if (backlogPlan.status === "layout_unsupported") return rejected(runId, "backlog_layout_unsupported");
  if (backlog && backlogPlan.update) backlogPlan.update.next = recordBacklogSummary(root, backlogPlan.update.next, key,
    backlog.closeout ? "Completed / Superseded Pointers" : "Active Backlog", summary, nextRevisionId);
  const written = guardedWrite(runId, () => (recording || orContent || backlogPlan.update || operationContext)
    ? commitRunStepLocked(root, {
      runId, runPath: run.path, content: text, revisionId, expectedContent: run.content,
      backlog: backlogPlan.update, or: orContent, afterWrite,
      nextRevisionId, outputs: ownedOutputs, operationContext,
      writeOptions: { ...(appendedOperation ? { appendedOperation } : {}), ...(appendedEvidence ? { appendedEvidence } : {}), ...(recording ? { appendedBinding: recording.receipt, allowContentChange: recording.allowContentChange } : {}),
        validateBeforeWrite: () => { recording?.validateBeforeWrite(); operationSource?.validate();
          if (operationRecord?.step && operationSourceSetDigest(root, control, operationRecord.step) !== operationRecord.source_set_digest) throw Error("AGDF_RUN_OPERATION_SOURCE_CHANGED");
          if (operationContext?.kind === 'closeout.record' && !exactApprovedArtefacts(root, control)) throw Error('AGDF_RUN_OPERATION_SOURCE_CHANGED');
          assertSummarySources(root, summary); } },
    })
    : writeRunLocked(run.path, text, revisionId, { expectedContent: run.content, nextRevisionId,
      validateBeforeWrite: () => assertSummarySources(root, summary) }));
  if (written.rejection) return written.rejection;
  return Object.freeze({
    schema_version: "1",
    outcome: "recorded",
    run_id: runId,
    step,
    previous_revision_id: revisionId,
    revision: written.state.meta.revision,
    revision_id: written.state.meta.revision_id,
    current_gate: after.current_gate,
    next_allowed_action: after.next_allowed_action,
    backlog: backlogPlan.status,
    ...(backlogPlan.reason ? { backlog_reason: backlogPlan.reason } : {}),
    ...(appendedOperation ? { operation_id: appendedOperation.operation_id, receipt: appendedOperation }
      : recording ? { operation_id: recording.receipt.operation.id, receipt: recording.receipt } : {}),
  });
}

export function recordRunStep(root, input, { policy, date = new Date().toISOString().slice(0, 10), afterWrite, operationContext, packageVersion = "0.14.5" } = {}) {
  const { runId, step } = input;
  if (!RUN_STEPS.includes(step)) return rejected(runId, "step_invalid", { steps: RUN_STEPS });
  let path;
  try { path = runPath(root, runId); } catch { return rejected(runId, "run_id_invalid"); }
  const backlogPath = join(root, BACKLOG_PATH);
  const locked = guardedWrite(runId, () => withOwnedFileLock(path, () => {
    assertBacklogPath(root);
    return withOwnedFileLock(backlogPath, () => {
    const otherPending = pendingRunStepIds(root).find((id) => id !== runId);
    if (otherPending) return rejected(runId, "run_step_recovery_required", { pending_run_id: otherPending });
    if (operationContext && existsSync(pendingRunStepPath(root, runId))) {
      const pending = readPendingRunStepJournal(root, runId);
      if (pending.schema_version !== 3 || pending.kind !== operationContext.kind || pending.operation_id !== operationContext.operation_id
          || pending.request_digest !== operationContext.request_digest || pending.old_revision_id !== input.revisionId) return rejected(runId, "original_operation_recovery_required");
      recoverPendingRunStepLocked(root, runId);
      return recordRunStepLocked(root, input, { policy, date, afterWrite, operationContext, packageVersion });
    }
    const recovered = recoverPendingRunStepLocked(root, runId);
    if (recovered.status === "completed") {
      return Object.freeze({ schema_version: "1", outcome: "recovered", run_id: runId,
        operation_id: recovered.operation_id, revision_id: recovered.revision_id,
        backlog: "updated" });
    }
    return recordRunStepLocked(root, input, { policy, date, afterWrite, operationContext, packageVersion });
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
  const written = guardedWrite(runId, () => withRunBacklogLock(root, runPath(root, runId), () => {
    const run = readRun(root, runId); if (run.rejection) return run.rejection;
    assertRunOperationIdentity(root, run, operationId, context.kind);
    const previous = readRunOperations(run.content).receipts.find(row => row.operation_id === operationId);
    if (previous) return previous.kind === context.kind && previous.request_digest === requestDigest
      ? { outcome: 'already_applied', receipt: previous, historical_effect: true, authorizes: false }
      : rejected(runId, 'operation_payload_conflict');
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
    next = appendTableRow(next, 'Evidence', [`Gate ${action}`, `presentation ${presentationId}`, `Version ${material.material_version}; comment: ${comment || '(none)'}`, 'cooperative bound decision']);
    if (next === null) return rejected(runId, 'run_layout_unsupported');
    const after = policyForDecision(root, next, run.path);
    next = replaceFirstScalar(next, 'next_allowed_action', after.next_allowed_action) ?? next;
    for (const [key, value] of [['What is known?', `${action} recorded for current ${gate} material.`], ['What is missing?', 'Changed material and a fresh deliberate decision.'],
      ['What is the next allowed action?', after.next_allowed_action]]) next = upsertTableRow(next, 'Current Control State', 0, key, [key, value]) ?? next;
    const saved = writeRunWithBacklogLocked(root, run.path, next, revisionId, { expectedContent: run.content,
      appendedOperation: receipt, nextRevisionId, operationContext: { ...context, target_id: receipt.target_id }, afterWrite,
      validateDuringTransaction: () => {
        const fresh = validateRunPresentationRecord(root, { runId, gate, revisionId, presentationId });
        if (fresh.reason || fresh.digest !== presentation.digest || decisionMaterial(root, state, gate).material_version !== material.material_version) throw Error('AGDF_STALE_RUN_REVISION');
      } });
    return { outcome: 'recorded', receipt, revision_id: saved.meta.revision_id, next_operation: after.next_operation, authorizes: false };
  }, { operationContext: { ...context, target_id: resolveControlCommandTarget(root).target_id } }));
  return written.rejection ?? written.state;
}
