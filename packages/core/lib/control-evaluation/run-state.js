import { presentationDecisionState, approvedMaterialFindings } from '../control-state/presentation-decision.js';
import { inspectQaDeviationAcceptance } from '../control-state/qa-deviation-acceptance.js';
import { createHash } from "node:crypto";
import { canonicalRunText } from "../control-state/run-seal.js";
import { existsSync, readFileSync } from "../control-read/fs.js";
import { join } from "node:path";
import process from "node:process";
import { parseControlState, parseRunState } from "../control-state/run-state-parser.js";
import { resolveRuns } from "../control-state/run-state-resolver.js";
import { validateRunIdentity } from "../control-state/run-identity.js";
import { buildRunCandidates } from "../interaction-presentation.js";
import { cleanStatusCell, filled, isPlaceholderValue, readTargetFile } from "./shared.js";
import { extractField, isSafeRepoRelativePath, readVerifiedChangeRecord } from "./verified-change.js";
import { containedRegularFile } from "../control-state/contained-file.js";
import { readSourceRevisions } from "../control-state/run-source-revisions.js";
import { evidenceApplicability } from '../control-state/evidence-bindings.js';
import { evaluateCloseoutReadiness } from './closeout-readiness.js';
import { evaluateReconciliationState } from './parent-reconciliation.js';

export const userGateOrder = ["UR", "PRD", "SD", "TP", "QA", "UAT"];
export const durableGateArtefacts = new Set(["UR", "PRD", "SD", "TP", "QA"]);
export const internalStepArtefacts = new Set(["Brownfield Review", "UX Intent Definition", "Verified Change", "Brownfield Analysis", "CD+Tests", "TP Review", "Clean Implementation Review", "Clean Review", "CR", "Code Review"]);
export const closeoutArtefacts = new Set(["OR"]);

export function resolvedArtefactFile(targetDir, rawPath) {
  const normalizedPath = String(rawPath ?? "").replace(/^`|`$/g, "").trim();
  if (normalizedPath.includes("<") || normalizedPath.includes(">")) return "";
  const result = containedRegularFile(targetDir, normalizedPath);
  return result.status === "valid" ? result.path : "";
}

export function readArtefactHeading(targetDir, artefact) {
  const artefactPath = resolvedArtefactFile(targetDir, artefact?.path);
  if (!artefactPath) return "";
  try {
    return readFileSync(artefactPath, "utf8").match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "";
  } catch {
    return "";
  }
}

// One preparation boundary for both saved and proposed Run content. Callers that
// inspect an immutable archive provide its own artefact reader, never current bytes.
export function prepareRunContentState(targetDir, content, path = "", { readArtefact, proposedArtefacts = new Map() } = {}) {
  if (!(proposedArtefacts instanceof Map)) throw Error("proposed_artefacts_invalid");
  const normalizedOverlay = new Map();
  for (const [name, row] of proposedArtefacts) {
    if (typeof name !== "string" || !isSafeRepoRelativePath(name) || typeof row?.content !== "string"
        || row.digest !== `sha256:${createHash("sha256").update(canonicalRunText(row.content)).digest("hex")}`) throw Error("proposed_artefacts_invalid");
    normalizedOverlay.set(name, row.content);
  }
  const overlayReader = normalizedOverlay.size ? name => {
    if (normalizedOverlay.has(name)) return normalizedOverlay.get(name);
    if (readArtefact) return readArtefact(name);
    const file = resolvedArtefactFile(targetDir, name);
    return file ? readFileSync(file, "utf8") : undefined;
  } : readArtefact;
  const parsed = parseControlState(content, {
    userGates: userGateOrder,
    internalSteps: [...internalStepArtefacts],
    closeoutArtefacts: [...closeoutArtefacts],
  });
  if ([...normalizedOverlay.keys()].some(name => !name.startsWith(`.agdf/control/artefacts/${parsed.run_id}/`))) throw Error("proposed_artefacts_invalid");
  const state = { path, content, ...parsed, meta: parseRunState(content).meta };
  const evidenceReader = overlayReader ?? (name => {
    const file = resolvedArtefactFile(targetDir, name);
    return file ? readFileSync(file, 'utf8') : undefined;
  });
  const presentationDecisions = new Map(userGateOrder.map(gate => [gate, presentationDecisionState(targetDir, state, gate, { readArtefact: overlayReader })]));
  const evidence = evidenceApplicability(state, evidenceReader);
  // The reconciliation owner consumes relationship declarations, not another
  // parent's evaluated closeout. Resolve its captured bytes without recursively
  // evaluating a parent/child cycle. Archived reads never borrow live Run bytes.
  const reconciliation = evaluateReconciliationState(state, {
    loadRun: id => {
      const name = `.agdf/control/runs/${id}/RUN_STATE.md`;
      const bytes = readArtefact ? readArtefact(name) : resolveRuns(targetDir, { runIdArg: id }).run.content;
      return typeof bytes === 'string' ? { content: bytes, ...parseControlState(bytes, {
        userGates: userGateOrder, internalSteps: [...internalStepArtefacts], closeoutArtefacts: [...closeoutArtefacts],
      }) } : null;
    },
    resolveFile: name => typeof evidenceReader(name) === 'string',
  });
  const qaAcceptance = inspectQaDeviationAcceptance(targetDir, {
    ...state, evidence_applicability: evidence, presentation_decisions: presentationDecisions,
  }, evidenceReader);
  const or = state.artefacts.get('OR');
  let closeoutEvidence = { ready: false, findings: ['or_unavailable'] };
  try { if (or?.path && or.status === 'done') closeoutEvidence = evaluateCloseoutReadiness({ ...state, qa_acceptance: qaAcceptance, reconciliation_state: reconciliation, evidence_applicability: evidence }, evidenceReader(or.path), evidenceReader); }
  catch { closeoutEvidence = { ready: false, findings: ['or_observation_unavailable'] }; }
  return {
    ...state,
    evidence_applicability: evidence,
    qa_acceptance: qaAcceptance,
    reconciliation_state: reconciliation,
    closeout_evidence: closeoutEvidence,
    presentation_decisions: presentationDecisions,
    approval_material_findings: approvedMaterialFindings(state, presentationDecisions),
    source_revision_ux_required: sourceRevisionUxRequired(targetDir, state, { readArtefact: overlayReader }),
    identity_findings: validateRunIdentity({
      runId: extractField(content, "run_id").replace(/^`|`$/g, ""),
      revisionId: extractField(content, "revision_id").replace(/^`|`$/g, ""),
    }),
  };
}

export function readRunState(targetDir, selection = {}) {
  let runPath = join(".agdf", "control", "AGDF_RUN.md");
  const canonicalRoot = join(targetDir, ".agdf", "control", "runs");
  let resolutionError;
  let candidateRuns = [];
  if (existsSync(canonicalRoot)) {
    try {
      const selected = resolveRuns(targetDir, {
        runIdArg: selection.runId,
        runIdEnv: selection.ignoreRunIdEnv ? undefined : process.env.AGDF_RUN_ID,
      });
      runPath = selected.run.path.startsWith(targetDir)
        ? selected.run.path.slice(targetDir.length + 1)
        : selected.run.path;
    } catch (error) {
      resolutionError = error.message;
      if (resolutionError.startsWith("AGDF_ACTIVE_RUN_AMBIGUOUS")) {
        const active = resolveRuns(targetDir, { allActive: true }).runs.map((run) => {
          const controlState = parseControlState(run.content, {
            userGates: userGateOrder,
            internalSteps: [...internalStepArtefacts],
            closeoutArtefacts: [...closeoutArtefacts],
          });
          return {
            ...run,
            control_state: controlState,
            current_artefact_heading: readArtefactHeading(targetDir, controlState.artefacts.get(controlState.current_gate)),
            ur_heading: readArtefactHeading(targetDir, controlState.artefacts.get("UR")),
          };
        });
        candidateRuns = buildRunCandidates(active);
      }
    }
  }
  if (resolutionError || !existsSync(join(targetDir, runPath))) {
    return {
      path: runPath,
      content: "",
      current_gate: "",
      next_allowed_action: "",
      approvals: new Map(),
      artefacts: new Map(),
      evidence_refs: [],
      artefact_chain: [],
      mode_slice_decision: {},
      missing_evidence: [],
      risks: [],
      context_graph: {},
      quality_outlook: "",
      source_scope: {},
      memory: {},
      candidate_runs: candidateRuns,
      resolution_error: resolutionError,
      identity_findings: [],
    };
  }

  const content = readTargetFile(targetDir, runPath);
  return prepareRunContentState(targetDir, content, runPath, { readArtefact: selection.readArtefact });
}

export function sourceRevisionUxRequired(targetDir, state, { readArtefact } = {}) {
  if (!readSourceRevisions(state.content ?? "").present) return false;
  const review = state.artefacts.get("Brownfield Review");
  if (review?.status !== "done") return false;
  if (readArtefact) {
    const content = readArtefact(review.path);
    return typeof content === "string" && extractField(content, "ux_intent_definition_required") === "yes";
  }
  const file = resolvedArtefactFile(targetDir, review.path);
  return Boolean(file && extractField(readFileSync(file, "utf8"), "ux_intent_definition_required") === "yes");
}

export function gateApprovalStatus(runState, gate) {
  if (!userGateOrder.includes(gate)) return "not_applicable";
  return runState.approvals.get(gate)?.status ?? "";
}

export function gateArtefactStatus(runState, gate) {
  if (!userGateOrder.includes(gate)) return { status: "not_applicable", path: "" };
  return runState.artefacts.get(gate) ?? { status: "", path: "" };
}

export function isDurableGateArtefactSatisfied(runState, gate) {
  if (!durableGateArtefacts.has(gate)) return true;
  const artefact = gateArtefactStatus(runState, gate);
  if (!artefact.path || isPlaceholderValue(artefact.path)) return false;
  if (gate === "QA") return artefact.status === "pass" || artefact.status === "passed" || runState.qa_acceptance?.accepted === true;
  return artefact.status === "approved";
}

export function expectedDurableArtefactStatuses(gate) {
  return gate === "QA" ? ["pass", "passed"] : ["approved"];
}

export function describeDurableArtefactStatuses(gate) {
  return expectedDurableArtefactStatuses(gate).map((status) => `\`${status}\``).join(" or ");
}

export function analyzeDurableGateArtefactConsistency(runState) {
  const findings = [];

  for (const gate of durableGateArtefacts) {
    if (gateApprovalStatus(runState, gate) !== "approved") continue;

    const artefact = gateArtefactStatus(runState, gate);
    if (gate === 'QA' && runState.qa_acceptance?.accepted === true) continue;
    if (!artefact.path || isPlaceholderValue(artefact.path) || !artefact.status) continue;

    const expectedStatuses = expectedDurableArtefactStatuses(gate);
    if (expectedStatuses.includes(artefact.status)) continue;

    findings.push({
      severity: "revise",
      code: "AGDF_GATE_ARTEFACT_STATUS_INCONSISTENT",
      message: `${gate} approval is recorded, but the durable artefact row uses status \`${artefact.status}\`; expected ${describeDurableArtefactStatuses(gate)}.`,
      path: runState.path,
      next_step: `Update the ${gate} artefact row in the selected RUN_STATE.md to use the gate-specific durable status vocabulary.`,
    });
  }

  return findings;
}

export function analyzeArtefactRoleConsistency(targetDir, runState) {
  const findings = [];
  for (const [type, artefact] of runState.artefacts) {
    if (artefact.path_format === "invalid") {
      findings.push({
        severity: "block",
        code: "AGDF_ARTEFACT_PATH_FORMAT_INVALID",
        message: `${type} uses an invalid artefact path cell (${artefact.path_reason}).`,
        path: runState.path,
        next_step: "Use a plain repository-relative path or one complete Markdown code span.",
      });
    } else if (artefact.path && !isSafeRepoRelativePath(artefact.path)) {
      findings.push({
        severity: "block",
        code: "AGDF_ARTEFACT_PATH_INVALID",
        message: `${type} must use a normalized repository-relative artefact path.`,
        path: runState.path,
        next_step: "Remove absolute, traversal, unsupported-backslash or otherwise non-normalized path text.",
      });
    }
  }
  const rolesByPath = new Map();
  for (const [type, artefact] of runState.artefacts) {
    if (!artefact.path) continue;
    rolesByPath.set(artefact.path, [...(rolesByPath.get(artefact.path) ?? []), type]);
  }
  for (const [path, roles] of rolesByPath) {
    if (roles.length < 2) continue;
    // CR and Clean Review are supported names for the same review roles, not separate artefacts.
    const aliases = new Map([["CR", "Code Review"], ["Clean Review", "Clean Implementation Review"]]);
    const canonicalRoles = new Set(roles.map((role) => aliases.get(role) ?? role));
    if (canonicalRoles.size === 1) {
      const statuses = new Set(roles.map((role) => runState.artefacts.get(role)?.status));
      if (statuses.size > 1) findings.push({ severity: "block", code: "AGDF_ARTEFACT_ROLE_ALIAS_INVALID", message: `Artefact aliases have conflicting statuses: ${roles.join(", ")}.`, path, next_step: "Use one consistent status for aliases of the same artefact role." });
      continue;
    }
    const allowedRoles = new Set(["Brownfield Review", "Verified Change", "OR"]);
    if (modeSliceDecision(runState) !== "verified_change" || roles.some((role) => !allowedRoles.has(role))) {
      findings.push({ severity: "block", code: "AGDF_ARTEFACT_ROLE_ALIAS_INVALID", message: `Artefact path is reused across incompatible roles: ${roles.join(", ")}.`, path, next_step: "Use distinct artefacts or a lifecycle-consistent Verified Change compact record." });
      continue;
    }
    const record = readVerifiedChangeRecord(targetDir, runState);
    if (record.status !== "present") continue;
    const recordStatus = cleanStatusCell(extractField(record.content, "status"));
    const brownfieldComplete = extractField(record.content, "decision") === "verified_change" && filled(extractField(record.content, "scope_reason")) && filled(extractField(record.content, "evidence"));
    const miniCloseoutComplete = ["delivered", "intentionally_not_delivered", "residual_risk", "next_step"].every((field) => filled(extractField(record.content, field)));
    if (roles.includes("Brownfield Review") && (runState.artefacts.get("Brownfield Review")?.status !== "done" || !brownfieldComplete)) findings.push({ severity: "block", code: "AGDF_VERIFIED_CHANGE_BROWNFIELD_ROLE_INVALID", message: "Consolidated Brownfield Review role is incomplete.", path, next_step: "Complete Brownfield Selection before eligibility." });
    if (roles.includes("Verified Change") && runState.artefacts.get("Verified Change")?.status !== recordStatus) findings.push({ severity: "block", code: "AGDF_VERIFIED_CHANGE_ROLE_STATUS_MISMATCH", message: "Verified Change artefact row status does not match the compact record.", path, next_step: "Align the run-state row and record status." });
    if (roles.includes("OR") && runState.artefacts.get("OR")?.status === "done" && (recordStatus !== "executed" || !miniCloseoutComplete)) findings.push({ severity: "block", code: "AGDF_VERIFIED_CHANGE_OR_ROLE_INVALID", message: "Consolidated OR is complete before execution and Mini-Closeout evidence are complete.", path, next_step: "Complete execution and Mini-Closeout evidence before marking OR done." });
  }
  return findings;
}

export function isInternalStepSatisfied(runState, step) {
  const artefact = runState.artefacts.get(step);
  if (!artefact) return false;
  const associated = runState.evidence_applicability?.by_step.get(step);
  if (associated && associated.applicability !== 'current') return false;
  if (artefact.status === "done") return true;
  return artefact.status === "not_applicable"
    && (step === "Brownfield Review" || step === "Brownfield Analysis");
}

export function modeSliceDecision(runState) {
  const decision = runState.mode_slice_decision?.decision ?? "";
  const scopeReason = runState.mode_slice_decision?.scope_reason ?? "";
  const evidence = runState.mode_slice_decision?.evidence ?? "";
  if (!decision || isPlaceholderValue(decision) || !filled(scopeReason) || !filled(evidence)) return "undecided";
  return decision;
}
