import { presentationDecisionState } from './presentation-decision.js';
import { SOURCE_REVISION_VERSION } from './run-source-revisions.js';
import { runControlPath } from './run-identity.js';
import { runDocumentPath } from './run-identity.js';
import { bindInputResolution } from './input-resolution.js';
import { resolutionRecordVersion } from './input-resolution.js';
import { assertRunOperationIdentity } from "./run-operation-identity.js";
import { prepareRunContentState } from "../control-evaluation/run-state.js";
import { parseRunState } from "./run-state-parser.js";
import { guardedWrite, readRun, rejected, replaceFirstScalar, replaceSectionScalar } from "./run-state-edits.js";
import { APPROVAL_GATES, artefactFileDigest, listedArtefactPaths, pendingArtefactPaths, canonicalRunText, runSealState } from "./run-seal.js";
import { transitionDecisionForRunState } from "../control-evaluation/gate-policy.js";
import { withOwnedFileLock } from "./run-state-writer.js";

import { withControlMutation, assertLayoutRunWrite } from './control-layout.js';
import { runWorkSummary, assertSummarySources } from "../control-evaluation/run-work-summary.js";
import { canonicalJson, digest, exactObject, resolveControlCommandTarget } from "./approval-command-contract.js";
import { randomUUID } from "node:crypto";
import { SOURCE_REVISION_PROPOSAL_VERSION, REVISION_PROPOSAL_FIELDS, REVISION_IMPACT_FIELDS, REVISION_UPSTREAM_FIELDS, REVISION_ANALYSIS_FIELDS } from './recording-formats.js';
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { runPath } from "./run-state-reader.js";
import { readArtefactBindings } from "./artefact-bindings.js";
import { exactApprovedArtefacts, readContainedJson, validateBindingProof } from "./artefact-binding-proof.js";
import { SOURCE_GATES, appendSourceRevision, readSourceRevisions, revisionHistoryPrefix, sourceRevisionImpact, sourceRevisionConfirmation, revisionProofProblems } from "./run-source-revisions.js";
import { collectRevisionHistory, byteDigest, inspectRevisionHistory, readHistoryBytes } from "./run-revision-history.js";
import { commitRunStepLocked, recoverPendingRunStepLocked, pendingRunStepConflictIds, readPendingRunStepJournal, readPendingSourceRevisionJournal } from "./run-step-transaction.js";
import { pendingRunStepPath } from "./run-step-pending.js";
import { REVISION_ID_PATTERN, RUN_ID_PATTERN } from "./run-identity.js";

import { containedRegularFile, hasSymlinkComponent } from "./contained-file.js";
import { sourceRevisionBoundary } from "./run-revision-boundary.js";
import { readOperationSource } from './run-operation-proof.js';
import { COOPERATIVE_ASSURANCE } from './approval-command-contract.js';
import { appendRunOperation, readRunOperations, earlyPrdConfirmation, assertRunNotEnded } from './run-operations.js';
import { operationReceipt } from './run-operation-proof.js';
import { earlyPrdRevisionBoundary } from './run-revision-boundary.js';
import { validateRunPresentationEnvelope } from './run-presentation.js';

export { SOURCE_REVISION_PROPOSAL_VERSION } from './recording-formats.js';
export { sourceRevisionConfirmation } from './run-source-revisions.js';

const revisionError = (reason, recovery = "Inspect the exact current run, correct the facts and prepare a fresh reviewed preview.") => Object.assign(Error(reason), { revision_reason: reason, recovery });
const nonempty = value => typeof value === "string" && value.trim().length > 0 && value.length <= 4096;
function validateRevisionIdentity({ runId, operationId, revisionId }) {
  if (!RUN_ID_PATTERN.test(runId ?? "") || ![operationId, revisionId].every(value => typeof value === "string" && REVISION_ID_PATTERN.test(value)))
    throw revisionError("revision_input_invalid");
}
function withRevisionLocks(root, input, work, { recovery = false } = {}) {
  validateRevisionIdentity(input);
  const relative = `.agdf/control/runs/${input.runId}/RUN_STATE.md`;
  const check = () => { if (hasSymlinkComponent(root, relative) || containedRegularFile(root, relative).status !== 'valid') throw revisionError('revision_path_invalid'); };
  check();
  return withOwnedFileLock(runPath(root, input.runId), () => withControlMutation(root, { resource: `run:${input.runId}`, operation_id: input.operationId,
    resume: true, proveOutcome: result => ['reopened', 'replayed', 'recovered'].includes(result?.outcome) }, () => {
    check(); assertLayoutRunWrite(root, parseRunState(readFileSync(runPath(root, input.runId), 'utf8')));
    return work();
  }));
}

const commandResult = (runId, work) => {
  try { return work(); } catch (error) {
    if (error.revision_reason) return { ...rejected(runId, error.revision_reason, { recovery: error.recovery }), authorizes: false,
      ...(error.revision_reason === "run_step_recovery_required" ? { outcome: "recovery_required" } : {}) };
    const result = guardedWrite(runId, () => { throw error; });
    return { ...result.rejection, authorizes: false,
      ...(result.rejection.reason === "run_step_recovery_required" ? { outcome: "recovery_required" } : {}) };
  }
};

function collectRunRevisionClosure(root, run, state, operationId, approvedGates, extra = [], options = {}) {
  const runId = run.meta.run_id;
  const pendingPaths = pendingArtefactPaths(run.content);
  const paths = [...listedArtefactPaths(run.content).filter(path => !pendingPaths.includes(path) || existsSync(join(root, path))),
    `.agdf/control/runs/${runId}/RUN_STATE.md`, ...extra];
  for (const binding of readArtefactBindings(run.content).active) paths.push(binding.destination.path, binding.source.path);
  // Closure includes the exact presentation envelopes and current reviewed mapping proofs.
  for (const gate of approvedGates) {
    const id = state.approvals.get(gate).evidence.match(/presentation ([0-9a-f-]{36}) /u)?.[1];
    if (!id) throw revisionError("approved_source_proof_invalid");
    paths.push(`${runControlPath(runId, 'presentations')}/${id}.json`);
  }
  // Pending and superseded decision presentations remain exact historical evidence
  // too. In particular an unapproved SD card must not be lost on early UR reopening.
  const presentations = `${runControlPath(runId, 'presentations')}`;
  if (hasSymlinkComponent(root, presentations)) throw revisionError("revision_path_invalid");
  for (const name of readdirSync(join(root, presentations))) {
    if (!name.endsWith(".json") || !REVISION_ID_PATTERN.test(name.slice(0, -5))) continue;
    const path = `${presentations}/${name}`;
    paths.push(path);
    let envelope;
    try { envelope = JSON.parse(readHistoryBytes(root, path).toString('utf8')); } catch { continue; }
    if (resolutionRecordVersion(envelope.record) === 7) {
      const record = envelope.record;
      if (!APPROVAL_GATES.includes(record.gate) || validateRunPresentationEnvelope(envelope,
        { runId, gate: record.gate, revisionId: record.revision_id, presentationId: name.slice(0, -5) }).reason) throw revisionError('presentation_binding_invalid');
      const documentPath = `${presentations}/${record.presentation_id}.document`, bytes = readHistoryBytes(root, documentPath);
      if (bytes.length !== record.document_bytes || byteDigest(bytes) !== record.document_digest) throw revisionError('presentation_document_digest_mismatch');
      paths.push(documentPath);
      if (resolutionRecordVersion(record) === 7 && record.preview_review) {
        for (const file of [...record.preview_review.files, ...record.preview_review.chunks]) {
          const bytes = readHistoryBytes(root, file.snapshot);
          if (bytes.length !== file.bytes || byteDigest(bytes) !== file.digest) throw revisionError('preview_snapshot_changed');
          paths.push(file.snapshot);
          if (file.path) {
            const original = readHistoryBytes(root, file.path);
            if (original.length !== file.bytes || byteDigest(original) !== file.digest) throw revisionError('preview_file_changed');
            paths.push(file.path);
          }
        }
      }
    }
  }
  return collectRevisionHistory(root, runId, operationId, paths, options);
}

function prepareSourceRevision(root, input) {
  const { runId, revisionId, operationId, sourceGate, evidence } = input;
  validateRevisionIdentity(input);
  if (!REVISION_ID_PATTERN.test(operationId ?? "") || !SOURCE_GATES.includes(sourceGate)) throw revisionError("revision_input_invalid");
  if (pendingRunStepConflictIds(root, runId).length) throw revisionError("run_step_recovery_required");
  const run = readRun(root, runId);
  if (run.rejection) throw revisionError(run.rejection.reason);
  assertRunNotEnded(run.content);
  assertRunOperationIdentity(root, run, operationId, "source_revision.apply");
  if (run.meta.revision_id !== revisionId) throw revisionError("stale_revision");
  if (runSealState(root, run.content).status !== "valid") throw revisionError("seal_invalid");
  const state = { ...prepareRunContentState(root, run.content, run.path), meta: run.meta };
  const proposal = input.proposalMaterial ? JSON.parse(input.proposalMaterial.content) : readContainedJson(root, evidence), requestDigest = digest(canonicalJson(proposal));
  if (proposal.schema_version !== SOURCE_REVISION_PROPOSAL_VERSION) throw revisionError('revision_version_unsupported');
  if (!input.commandContext) throw revisionError('revision_command_required', 'Use the existing bound source_revision command with exact proposal and deliberate confirmation.');
  const boundary = sourceRevisionBoundary(state, sourceGate, 2);
  if (!boundary) throw revisionError("late_revision_boundary_invalid", 'Use an actually approved source in the declared active structured pre-UAT matrix; deliberate UAT, completed OR, integrity or lifecycle blockers prohibit revision.');
  if (!exactApprovedArtefacts(root, state)) throw revisionError("approved_source_proof_invalid");
  const bindings = readArtefactBindings(run.content);
  if (!bindings.valid || !boundary.bindings.every(type => bindings.active.some(row => row.destination.type === type && validateBindingProof(root, row)))) throw revisionError("current_source_binding_invalid");
  const sources = boundary.sources.map(type => ({ type, path: state.artefacts.get(type)?.path, digest: artefactFileDigest(root, state.artefacts.get(type)?.path) }));
  if (sources.some(row => row.path !== `${runDocumentPath(runId, '')}/${row.type}.md`
      || boundary.approved.includes(row.type) && state.approvals.get(row.type)?.status !== "approved")) throw revisionError("approved_source_invalid");
  if (input.commandContext && input.proposalBinding?.path !== evidence) throw revisionError('revision_source_binding_invalid');
  const boundProposal = input.proposalMaterial ? { validate: () => {} } : input.proposalBinding ? readOperationSource(root, runId, input.proposalBinding) : null;
  // Name each violated field with its expected binding: these are facts the caller
  // may read anyway, and the proposal can only be corrected when they are known.
  const expected = { target_id: resolveControlCommandTarget(root).target_id, run_id: runId, expected_revision_id: revisionId,
    operation_id: operationId, source_gate: sourceGate, sources };
  const problems = [
    ...(exactObject(proposal, REVISION_PROPOSAL_FIELDS) ? [] : [`fields must be exactly ${REVISION_PROPOSAL_FIELDS.join(", ")}`]),
    ...Object.entries(expected).filter(([key, value]) => canonicalJson(proposal[key] ?? null) !== canonicalJson(value))
      .map(([key, value]) => `${key} must be ${canonicalJson(value)}`),
    ...["reason", "intended_change"].filter(key => !nonempty(proposal[key])).map(key => `${key} must be nonempty text`),
  ];
  if (problems.length) throw revisionError("revision_proposal_invalid",
    `Correct the staged proposal and stage it again; operation_id is the UUID of this source_revision command. ${problems.join("; ")}.`);
  const assessment = proposal.impact_assessment, index = SOURCE_GATES.indexOf(sourceGate);
  // Like the binding check above, each rejection names the expected entries.
  const identity = row => canonicalJson({ type: row?.type, path: row?.path, digest: row?.digest });
  const upstream = sources.slice(0, index);
  const impactProblems = [
    ...(exactObject(assessment, REVISION_IMPACT_FIELDS) ? [] : [`impact_assessment fields must be exactly ${REVISION_IMPACT_FIELDS.join(", ")}`]),
    ...(nonempty(assessment?.reviewer) ? [] : ["impact_assessment.reviewer must be nonempty text"]),
    ...(assessment?.earliest_source === sourceGate ? [] : [`impact_assessment.earliest_source must be "${sourceGate}"`]),
    ...(nonempty(assessment?.implementation_evidence) ? [] : ["impact_assessment.implementation_evidence must be nonempty text"]),
    ...(Array.isArray(assessment?.unresolved) && !assessment.unresolved.length ? [] : ["impact_assessment.unresolved must be []"]),
    ...(Array.isArray(assessment?.upstream) && assessment.upstream.length === upstream.length
      && assessment.upstream.every((row, i) => exactObject(row, REVISION_UPSTREAM_FIELDS) && nonempty(row.rationale) && identity(row) === identity(upstream[i]))
      ? [] : [`impact_assessment.upstream must list exactly ${canonicalJson(upstream)} in order, each with a nonempty rationale`]),
  ];
  if (impactProblems.length) throw revisionError("source_impact_unresolved",
    `Resolve the earliest changed source and unchanged upstream rationale with its owner; then regenerate the proposal. ${impactProblems.join("; ")}.`);
  const analyses = ["Brownfield Review", "UX Intent Definition"].filter(type => state.artefacts.get(type)?.path)
    .map(type => ({ type, path: state.artefacts.get(type).path, digest: artefactFileDigest(root, state.artefacts.get(type).path) }));
  const dispositions = sourceGate === "UR" ? ["reassess"] : ["retain", "reassess"];
  if (!Array.isArray(assessment.analyses) || assessment.analyses.length !== analyses.length
      || !assessment.analyses.every((row, i) => exactObject(row, REVISION_ANALYSIS_FIELDS) && identity(row) === identity(analyses[i])
        && nonempty(row.reason) && dispositions.includes(row.disposition)))
    throw revisionError("analysis_applicability_unresolved", `Set impact_assessment.analyses to exactly the registered analyses ${canonicalJson(analyses)} in order, each with a nonempty reason and disposition ${dispositions.join(" or ")}; unregistered analyses are not listed.`);
  const readArtefact = path => { try { return readHistoryBytes(root, path).toString('utf8'); } catch { return undefined; } };
  const proofProblems = revisionProofProblems(proposal, state, readArtefact, boundary.initiating_phase);
  if (proofProblems.length) throw revisionError('revision_impact_proof_invalid',
    `Bind concrete changed statements, earliest source, actual phase and every exact quality record; unknown or affected associations require reassessment. ${proofProblems.slice(0, 5).join('; ')}.`);
  const affected = SOURCE_GATES.slice(index);
  const qualityPaths = proposal.quality_assessment.map(row => row.record.path).filter(Boolean);
  const history = collectRunRevisionClosure(root, run, state, operationId, boundary.approved, [evidence, ...qualityPaths], { proposalMaterial: input.proposalMaterial });
  const impact = sourceRevisionImpact(proposal, bindings.active);
  const preview = { schema_version: "2", target_id: proposal.target_id, run_id: runId, expected_revision_id: revisionId,
    operation_id: operationId, request_digest: requestDigest, reason: proposal.reason, intended_change: proposal.intended_change,
    sources, impact, archive_digest: history.digest, current_run_digest: byteDigest(Buffer.from(run.content)) };
  return { run, state, proposal, requestDigest, preview, previewDigest: digest(canonicalJson(preview)), history, affected, boundProposal };
}

export function previewSourceRevision(root, input) {
  return commandResult(input.runId, () => { const work = prepareSourceRevision(root, input);
    return { outcome: "preview", authority: "proposed_only", authorizes: false, ...work.preview, preview_digest: work.previewDigest,
      confirmation_selector: sourceRevisionConfirmation({ ...input, previewDigest: work.previewDigest }),
      next_action: "Review the bound impact; explicitly apply it or cancel without mutation." }; });
}

function revisedRun(root, work, receipt) {
  let next = work.run.content;
  const invalidAnalyses = receipt.analyses.filter(row => row.disposition === 'reassess').map(row => row.type);
  if (receipt.source_gate === 'UR' || invalidAnalyses.includes('Brownfield Review')) {
    next = replaceFirstScalar(next, 'mode', 'undecided');
    for (const [key, value] of [['scope_reason', 'Source revision requires a fresh analytical route'], ['evidence', receipt.archive.path]]) {
      next = replaceSectionScalar(next, 'Mode/Slice Decision', key, value);
      if (!next) throw revisionError('run_layout_unsupported');
    }
  }
  next = appendSourceRevision(next, receipt);
  const after = transitionDecisionForRunState(prepareRunContentState(root, next, work.run.path));
  return { next, after };
}

export function inspectSourceRevision(root, { runId, operationId, revisionId }) {
  return commandResult(runId, () => {
    validateRevisionIdentity({ runId, operationId, revisionId });
    const pending = pendingRunStepPath(root, runId), content = readHistoryBytes(root, `.agdf/control/runs/${runId}/RUN_STATE.md`).toString("utf8");
    const parsed = parseRunState(content, runId);
    if (!parsed.valid || !REVISION_ID_PATTERN.test(operationId ?? "")) throw revisionError("revision_input_invalid");
    if (existsSync(pending)) {
      const journal = readPendingSourceRevisionJournal(root, runId);
      if (resolutionRecordVersion(journal) !== 7 || journal.operation_id !== operationId
          || journal.target_id !== resolveControlCommandTarget(root).target_id) throw revisionError("revision_recovery_binding_invalid");
      return { outcome: "recovery_required", run_id: runId, operation_id: operationId, revision_id: parsed.meta.revision_id, authorizes: false,
        next_action: "Inspect the exact pending operation and use explicit recovery; do not blindly repeat apply." };
    }
    if (runSealState(root, content).status !== "valid") throw revisionError("seal_invalid");
    const row = readSourceRevisions(content).receipts.find(item => item.operation_id === operationId);
    return { outcome: row ? "historical" : "not_found", run_id: runId, revision_id: parsed.meta.revision_id,
      stale_observation: revisionId !== parsed.meta.revision_id, authorizes: false,
      ...(row ? { history: inspectRevisionHistory(root, row) } : {}) };
  });
}

export function applySourceRevision(root, input, { afterWrite } = {}) {
  return commandResult(input.runId, () => withRevisionLocks(root, input, () => {
    const { runId, revisionId, operationId } = input;
    if (pendingRunStepConflictIds(root, runId).length) throw revisionError("run_step_recovery_required");
    const run = readRun(root, runId); if (run.rejection) throw revisionError(run.rejection.reason);
    const prior = readSourceRevisions(run.content).receipts.find(row => row.operation_id === operationId);
    if (prior) {
      if (runSealState(root, run.content).status !== "valid") throw revisionError("seal_invalid");
      if (input.commandContext) {
        if (resolutionRecordVersion(prior) !== '4' || prior.command_digest !== input.commandContext.request_digest) throw revisionError('revision_operation_conflict');
        return { outcome: 'replayed', authorizes: false, historical_effect: true, receipt: prior, run_id: runId,
          operation_id: operationId, resulting_revision_id: prior.resulting_revision_id, current_revision_id: run.meta.revision_id };
      }
      const proposal = readContainedJson(root, input.evidence);
      if (prior.request_digest !== digest(canonicalJson(proposal)) || prior.preview_digest !== input.previewDigest
          || prior.previous_revision_id !== revisionId || prior.source_gate !== input.sourceGate
          || prior.target_id !== resolveControlCommandTarget(root).target_id) throw revisionError("revision_operation_conflict");
      return { outcome: "replayed", authorizes: false, run_id: runId, operation_id: operationId,
        resulting_revision_id: prior.resulting_revision_id, current_revision_id: run.meta.revision_id, historical_effect: true };
    }
    assertRunNotEnded(run.content);
    const work = prepareSourceRevision(root, input);
    if (input.previewDigest !== work.previewDigest) throw revisionError("revision_preview_stale");
    if (input.commandContext && input.confirmation !== sourceRevisionConfirmation(input)) throw revisionError('confirmation_required', 'Obtain a deliberate confirmation of the exact current preview selector; host tool consent alone is insufficient.');
    let receipt = { schema_version: SOURCE_REVISION_VERSION, operation_id: operationId, target_id: work.proposal.target_id, run_id: runId,
      source_gate: input.sourceGate, request_digest: work.requestDigest, preview_digest: work.previewDigest,
      previous_revision_id: revisionId, resulting_revision_id: randomUUID(), revision: Number(run.meta.revision) + 1,
      invalidated_bindings: work.preview.impact.invalidated_bindings, analyses: work.proposal.impact_assessment.analyses,
      retained_sources: work.proposal.impact_assessment.upstream,
      archive: { path: `${revisionHistoryPrefix(runId, operationId)}manifest.json`, digest: work.history.digest }, reason: work.proposal.reason };
    if (input.commandContext) Object.assign(receipt, { command_digest: input.commandContext.request_digest, confirmation_digest: digest(input.confirmation),
      proposal_reference: input.proposalBinding, producer: { contract: 'run-command/1', package_version: input.packageVersion }, assurance: COOPERATIVE_ASSURANCE });
    Object.assign(receipt, { policy_version: 2, initiating_phase: work.proposal.initiating_phase,
      impact_digest: digest(canonicalJson(work.preview.impact)), quality_digest: digest(canonicalJson(work.proposal.quality_assessment)) });
    receipt = bindInputResolution(receipt);
    const { next, after } = revisedRun(root, work, receipt);
    const summary = runWorkSummary(root, next, run.path, after);
    const written = commitRunStepLocked(root, { runId, runPath: run.path, content: next, revisionId, expectedContent: run.content,
      history: work.history, afterWrite,
      nextRevisionId: receipt.resulting_revision_id, writeOptions: { allowApprovalChange: true, appendedRevision: receipt,
        validateBeforeWrite: () => { work.boundProposal?.validate(); assertSummarySources(root, summary); const checked = prepareSourceRevisionIgnoringPending(root, input); if (checked.previewDigest !== work.previewDigest) throw Error("AGDF_STALE_RUN_REVISION"); } } });
    return { outcome: "reopened", authorizes: false, run_id: runId, operation_id: operationId, gate: after.current_gate,
      revision_id: written.meta.revision_id, revision: written.meta.revision, impact: work.preview.impact, next_action: after.next_allowed_action };
  }));
}

function prepareSourceRevisionIgnoringPending(root, input) {
  // The exact pending operation is owned by the caller under its applicable output locks. Revalidation reads
  // the unchanged pre-commit state without allowing ordinary readRun to bypass a pending write.
  const pending = readPendingSourceRevisionJournal(root, input.runId);
  if (resolutionRecordVersion(pending) !== 7 || pending.operation_id !== input.operationId) throw Error("AGDF_RUN_STEP_RECOVERY_REQUIRED");
  const proposal = input.proposalMaterial ? JSON.parse(input.proposalMaterial.content) : readContainedJson(root, input.evidence);
  const text = readHistoryBytes(root, `.agdf/control/runs/${input.runId}/RUN_STATE.md`).toString("utf8");
  if (parseRunState(text).meta.revision_id !== input.revisionId || runSealState(root, text).status !== "valid") throw Error("AGDF_STALE_RUN_REVISION");
  const paths = readContainedJson(root, pending.archive.path).files;
  if (paths.some(row => byteDigest(input.proposalMaterial?.path === row.path ? Buffer.from(input.proposalMaterial.content) : readHistoryBytes(root, row.path)) !== row.digest)) throw Error("AGDF_STALE_RUN_REVISION");
  return { previewDigest: digest(canonicalJson(proposal)) === pending.request_digest ? pending.preview_digest : null };
}

export function recoverSourceRevision(root, input) {
  return commandResult(input.runId, () => withRevisionLocks(root, input, () => {
    const path = pendingRunStepPath(root, input.runId);
    if (!existsSync(path)) {
      const inspected = inspectSourceRevision(root, input);
      return inspected.outcome === "historical" ? { ...inspected, outcome: "recovered", status: "already_completed" } : inspected;
    }
    const pending = readPendingSourceRevisionJournal(root, input.runId);
    if (resolutionRecordVersion(pending) !== 7 || pending.operation_id !== input.operationId
        || pending.target_id !== resolveControlCommandTarget(root).target_id
        || ![pending.old_revision_id, pending.next_revision_id].includes(input.revisionId)) throw revisionError("revision_recovery_binding_invalid");
    if (input.pendingDigest) {
      const current = parseRunState(readHistoryBytes(root, `.agdf/control/runs/${input.runId}/RUN_STATE.md`).toString('utf8'));
      if (!current.valid || current.meta.revision_id !== input.revisionId || digest(canonicalJson(pending)) !== input.pendingDigest
        || input.recoveryRevisionId !== input.revisionId) throw revisionError('revision_recovery_binding_invalid');
      if (current.meta.revision_id === pending.next_revision_id) {
        // Once the Run committed, its sealed receipt owns the effect. The proposal
        // is mutable authoring input and cannot veto forward recovery of the captured Run transaction.
        const receipt = readSourceRevisions(current.content).receipts.find(row => row.operation_id === input.operationId);
        if (resolutionRecordVersion(receipt) !== '4' || receipt.source_gate !== input.sourceGate
          || canonicalJson(receipt.proposal_reference) !== canonicalJson(input.proposalBinding)
          || receipt.request_digest !== pending.request_digest || receipt.preview_digest !== pending.preview_digest) throw revisionError('revision_recovery_binding_invalid');
      } else {
        const source = input.proposalMaterial ?? readOperationSource(root, input.runId, input.proposalBinding), proposal = JSON.parse(source.content);
        if (digest(canonicalJson(proposal)) !== pending.request_digest || proposal.source_gate !== input.sourceGate) throw revisionError('revision_recovery_binding_invalid');
      }
    }
    return { outcome: "recovered", authorizes: false, run_id: input.runId, ...recoverPendingRunStepLocked(root, input.runId, { sourceRevision: true }) };
  }, { recovery: true }));
}

// A material product clarification supersedes the exact PRD approval. This deliberately
// supports only the PRD->SD boundary, before any downstream artefact is linked or approved.
function earlyPrdReopenCandidate(root, run) {
  const runId = run.meta.run_id;
  const state = prepareRunContentState(root, run.content, run.path);
  if (!earlyPrdRevisionBoundary(state)) {
    return rejected(runId, "prd_revision_boundary_invalid", {
      recovery: "PRD revision is available only at SD before later artefacts are linked or approved.",
    });
  }
  const previousApproval = state.approvals.get("PRD")?.evidence ?? "";
  if (!previousApproval) return rejected(runId, "prd_approval_evidence_missing");
  const approvals = new Map(state.approvals), artefacts = new Map(state.artefacts);
  approvals.set('PRD', { status: 'missing', evidence: '' });
  artefacts.set('PRD', { ...artefacts.get('PRD'), status: 'draft' });
  const proposed = { ...state, approvals, artefacts };
  const presentation_decisions = new Map(state.presentation_decisions);
  presentation_decisions.set('PRD', presentationDecisionState(root, proposed, 'PRD'));
  const after = transitionDecisionForRunState({ ...proposed, presentation_decisions });
  if (after.current_gate !== 'PRD' || after.missing_approval !== 'Approval: PRD') return rejected(runId, 'prd_revision_transition_invalid');
  const next = canonicalRunText(run.content);
  return { text: next, state, after };
}

export function reopenPrdRevision(root, input, { afterWrite = () => {} } = {}) {
  if (!input.commandContext) return rejected(input.runId, 'revision_command_required');
  return commandResult(input.runId, () => withRevisionLocks(root, input, () => {
    const { runId, revisionId, operationId, commandContext } = input;
    if (commandContext.kind !== 'prd_revision.reopen' || commandContext.operation_id !== operationId
      || commandContext.target_id !== resolveControlCommandTarget(root).target_id) throw revisionError('revision_input_invalid');
    if (pendingRunStepConflictIds(root, runId).some(id => id !== runId)) throw revisionError('run_step_recovery_required');
    if (existsSync(pendingRunStepPath(root, runId))) {
      const pending = readPendingRunStepJournal(root, runId);
      if (resolutionRecordVersion(pending) !== 7 || pending.kind !== commandContext.kind || pending.operation_id !== operationId
        || pending.target_id !== commandContext.target_id || pending.request_digest !== commandContext.request_digest
        || pending.old_revision_id !== revisionId) throw revisionError('run_step_recovery_required');
      recoverPendingRunStepLocked(root, runId);
    }
    const run = readRun(root, runId);
    if (run.rejection) throw revisionError(run.rejection.reason);
    assertRunOperationIdentity(root, run, operationId, commandContext.kind);
    const previous = readRunOperations(run.content).receipts.find(row => row.operation_id === operationId);
    if (previous) {
      if (previous.request_digest !== commandContext.request_digest) throw revisionError('operation_payload_conflict');
      return { schema_version: '1', outcome: 'replayed', run_id: runId, receipt: previous, historical_effect: true, authorizes: false };
    }
    assertRunNotEnded(run.content);
    if (run.meta.revision_id !== revisionId) throw revisionError('stale_revision');
    if (runSealState(root, run.content).status !== 'valid') throw revisionError('seal_invalid');
    const prepared = earlyPrdReopenCandidate(root, run);
    if (prepared.outcome === 'rejected') return prepared;
    const prd = prepared.state.artefacts.get('PRD');
    if (input.prdBinding?.path !== prd?.path || input.prdBinding.digest !== artefactFileDigest(root, prd.path)
      || !exactApprovedArtefacts(root, prepared.state)) throw revisionError('approved_source_proof_invalid');
    const boundPrd = readOperationSource(root, runId, input.prdBinding);
    const confirmation = earlyPrdConfirmation(runId, revisionId, operationId, input.prdBinding.digest);
    if (input.confirmation !== confirmation) return rejected(runId, 'revision_confirmation_required', { confirmation_selector: confirmation });
    const history = collectRunRevisionClosure(root, run, prepared.state, operationId, ['UR', 'PRD']);
    const nextRevisionId = randomUUID();
    const receipt = operationReceipt(root, run, commandContext, nextRevisionId, { prd: input.prdBinding,
      archive: { path: `${revisionHistoryPrefix(runId, operationId)}manifest.json`, digest: history.digest }, confirmation_digest: digest(confirmation) }, input.packageVersion ?? '0.14.5');
    const next = appendRunOperation(prepared.text, receipt);
    const plan = { update: null };
    const validate = () => {
      boundPrd.validate();
      if (!exactApprovedArtefacts(root, prepared.state) || history.files.some(row => byteDigest(readHistoryBytes(root, row.path)) !== row.digest)) throw revisionError('stale_revision');
      if (plan.summary) assertSummarySources(root, plan.summary);
    };
    validate();
    const written = commitRunStepLocked(root, { runId, runPath: run.path, content: next, revisionId, expectedContent: run.content,
      nextRevisionId, operationContext: commandContext, history, afterWrite,
      writeOptions: { allowApprovalChange: true, appendedOperation: receipt, validateBeforeWrite: validate } });
    return { schema_version: '1', outcome: 'reopened', run_id: runId, gate: 'PRD', receipt, previous_revision_id: revisionId,
      revision_id: written.meta.revision_id, revision: Number(written.meta.revision), authorizes: false };
  }));
}
