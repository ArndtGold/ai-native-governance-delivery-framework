import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { aggregate, resolveRuns } from '../control-state/index.js';
import { resolveConfiguredChatLanguage } from '../cli/runtime-context.js';
import { isGateSatisfied, transitionDecisionForRunState } from './gate-policy.js';
import { gateApprovalStatus, readRunState } from './run-state.js';
import { allowNoActiveRuns, filled, isPlaceholderValue, markdownSection, parseBacklogSection, readTargetFile } from './shared.js';

const deliveryRelationships = [
  { from: "UR", relationship: "approved_by", to: "Approval: UR", requiredBy: "UR" },
  { from: "PRD", relationship: "derived_from", to: "UR", requiredBy: "PRD" },
  { from: "SD", relationship: "derived_from", to: "PRD", requiredBy: "SD" },
  { from: "TP", relationship: "derived_from", to: "SD", requiredBy: "TP" },
  { from: "QA_REPORT", relationship: "tests", to: "TP", requiredBy: "QA" },
];

function relationshipRequired(runState, requiredBy) {
  if (gateApprovalStatus(runState, requiredBy) === "not_applicable") return false;
  if (requiredBy === "QA") {
    return isGateSatisfied(runState, "QA");
  }

  return isGateSatisfied(runState, requiredBy);
}

function findRelationship(runState, expected) {
  return runState.artefact_chain.find((row) =>
    row.from === expected.from
    && row.relationship === expected.relationship
    && row.to === expected.to
  );
}

function severityFromImpact(value) {
  if (value === "block") return "block";
  if (value === "revise") return "revise";
  if (value === "warning" || value === "warn") return "warn";
  return null;
}

export function analyzeDeliveryMap(runState) {
  const findings = [];
  const relationships = deliveryRelationships.map((expected) => {
    const row = findRelationship(runState, expected);
    const required = relationshipRequired(runState, expected.requiredBy);
    const evidence = row?.evidence ?? "";
    const status = !row ? "missing" : filled(evidence) ? "pass" : required ? "missing_evidence" : "template";

    if (required && status !== "pass") {
      findings.push({
        severity: "revise",
        code: status === "missing" ? "AGDF_DELIVERY_RELATIONSHIP_MISSING" : "AGDF_DELIVERY_RELATIONSHIP_EVIDENCE_MISSING",
        message: `${expected.from} must be traceable via ${expected.relationship} ${expected.to}.`,
        path: runState.path,
        next_step: "Fill the Artefact Chain row with concrete evidence before treating the delivery map as complete.",
      });
    }

    return {
      from: expected.from,
      relationship: expected.relationship,
      to: expected.to,
      required,
      status,
      evidence,
    };
  });

  for (const item of runState.missing_evidence) {
    const severity = severityFromImpact(item.impact);
    if (!severity) continue;
    findings.push({
      severity,
      code: "AGDF_MISSING_EVIDENCE_DECLARED",
      message: item.missing_evidence,
      path: runState.path,
      next_step: item.required_next_step || "Resolve or explicitly accept the missing evidence before advancing the gate.",
    });
  }

  for (const item of runState.risks) {
    const severity = severityFromImpact(item.impact);
    if (!severity) continue;
    findings.push({
      severity,
      code: "AGDF_RISK_DECLARED",
      message: item.risk,
      path: runState.path,
      next_step: item.mitigation_or_owner || "Assign mitigation or ownership before advancing the gate.",
    });
  }

  const contextSeverity = severityFromImpact(runState.context_graph?.gate_effect);
  if (contextSeverity) {
    findings.push({
      severity: contextSeverity,
      code: "AGDF_CONTEXT_GRAPH_GATE_EFFECT",
      message: `Context Graph impact is ${runState.context_graph.impact || "unspecified"} with gate effect ${runState.context_graph.gate_effect}.`,
      path: runState.path,
      next_step: runState.context_graph.required_action && runState.context_graph.required_action !== "none"
        ? `Resolve Context Graph action: ${runState.context_graph.required_action}.`
        : "Clarify the Context Graph impact before advancing the gate.",
    });
  }

  const multiScopeState = runState.source_scope?.multi_scope_state;
  if (multiScopeState === "ambiguous" || multiScopeState === "blocked") {
    findings.push({
      severity: multiScopeState === "blocked" ? "block" : "revise",
      code: "AGDF_SCOPE_AMBIGUOUS",
      message: "Multiple active scope lines are plausible; the agent must not choose one silently.",
      path: runState.path,
      next_step: "List competing scope lines with gate and artefact evidence, then clarify the active scope.",
    });
  }

  const branchEffect = runState.source_scope?.branch_workspace_scope_effect;
  if (branchEffect === "conflicts" || branchEffect === "insufficient") {
    findings.push({
      severity: branchEffect === "conflicts" ? "revise" : "warn",
      code: "AGDF_BRANCH_NOT_SCOPE_PROOF",
      message: "Branch or workspace evidence is not sufficient scope proof.",
      path: runState.path,
      next_step: "Confirm the active scope from durable artefacts or record why branch/workspace evidence is only supporting evidence.",
    });
  }

  if (runState.memory?.target && runState.memory.target !== "none" && !filled(runState.memory.reason)) {
    findings.push({
      severity: "warn",
      code: "AGDF_MEMORY_TARGET_REASON_MISSING",
      message: "Knowledge persistence target is set without a reason.",
      path: runState.path,
      next_step: "Fill memory_reason or set memory_target to none.",
    });
  }

  return {
    relationships,
    missing_evidence: runState.missing_evidence,
    risks: runState.risks,
    context_graph: runState.context_graph,
    source_scope: runState.source_scope,
    memory: runState.memory,
    findings,
  };
}

export function deriveQualityOutlook(runState, findings = []) {
  if (filled(runState.quality_outlook)) return runState.quality_outlook;
  if (findings.some((finding) => finding.severity === "block" || finding.severity === "revise")) {
    return "Resolve blocking or revise-level delivery-map findings before making stronger quality claims.";
  }
  if (findings.some((finding) => finding.severity === "warn")) {
    return "Review warning-level findings when investing further in delivery confidence.";
  }
  return "No additional quality follow-up identified from the current control state.";
}

function readBacklogPointers(targetDir) {
  const backlogPath = join(".agdf", "control", "MASTER_BACKLOG.md");
  if (!existsSync(join(targetDir, backlogPath))) return [];

  const backlog = readTargetFile(targetDir, backlogPath);
  const activeSection = markdownSection(backlog, "Active Backlog");
  return parseBacklogSection(activeSection);
}

export function evaluateDeliveryMap(targetDir, selection = {}, dependencies = {}) {
  const { evaluateDoctor, buildStatusCard, postApprovalTransition } = dependencies;
  if (typeof evaluateDoctor !== "function" || typeof buildStatusCard !== "function" || typeof postApprovalTransition !== "function") {
    throw new TypeError("evaluateDeliveryMap requires doctor and status-card composition dependencies.");
  }
  if (selection.allActive) {
    const selected = resolveRuns(targetDir, { allActive: true });
    const runs = selected.runs.map((run) => ({
      run_id: run.run_id,
      report: evaluateDeliveryMap(targetDir, { runId: run.run_id }, dependencies),
    }));
    const status = selected.findings.length
      ? "block"
      : aggregate(
          runs.map((item) => ({
            run_id: item.run_id,
            status: item.report.status,
          })),
          { allowNoActiveRuns: allowNoActiveRuns(targetDir) },
        ).status;
    const findings = [
      ...selected.findings.map((finding) => ({
        ...finding,
        severity: "block",
        message: "Invalid canonical run entry.",
        next_step: "Repair or remove the invalid run entry.",
      })),
      ...runs.flatMap((item) =>
        (item.report.doctor_report?.findings ?? item.report.findings).map((finding) => ({
          ...finding,
          run_id: item.run_id,
        })),
      ),
    ];
    return {
      schema_version: "1",
      status,
      current_gate: "all-active",
      next_allowed_action: runs.length
        ? "Resolve per-run findings."
        : "Create or activate a governed run.",
      quality_outlook: "Keep every active run independently actionable.",
      relationships: runs.flatMap((item) => item.report.relationships),
      findings,
      runs,
    };
  }
  const doctorReport = evaluateDoctor(targetDir, selection);
  const runState = readRunState(targetDir, selection);
  const map = analyzeDeliveryMap(runState);
  const gateDecision = transitionDecisionForRunState(runState);
  const currentGate = gateDecision.current_gate;

  const severityRank = { block: 3, revise: 2, warn: 1 };
  const deliverySeverity = map.findings.reduce((max, finding) => Math.max(max, severityRank[finding.severity] ?? 0), 0);
  const doctorSeverity = severityRank[doctorReport.status] ?? 0;
  const maxSeverity = Math.max(deliverySeverity, doctorSeverity);
  const status = maxSeverity >= 3 ? "block" : maxSeverity === 2 ? "revise" : maxSeverity === 1 ? "warn" : "pass";

  const qualityOutlook = deriveQualityOutlook(runState, map.findings);
  const nextAllowedAction = isPlaceholderValue(runState.next_allowed_action) ? gateDecision.next_allowed_action : runState.next_allowed_action;
  const postApproval = postApprovalTransition(gateDecision.missing_approval);

  return {
    schema_version: "1",
    status,
    checked_at: new Date().toISOString(),
    target_dir: targetDir,
    current_gate: currentGate,
    next_allowed_action: nextAllowedAction,
    next_gate_after_approval: postApproval.next_gate_after_approval,
    allowed_after_approval: postApproval.allowed_after_approval,
    quality_outlook: qualityOutlook,
    status_card: buildStatusCard({
      status,
      currentGate,
      allowed: gateDecision.allowed,
      forbidden: gateDecision.forbidden,
      blockingReason: gateDecision.blocking_reason,
      missingApproval: gateDecision.missing_approval,
      nextAllowedAction,
      runState,
      chatLanguage: resolveConfiguredChatLanguage(targetDir),
      findings: map.findings,
    }),
    backlog_pointers: readBacklogPointers(targetDir),
    artefacts: Object.fromEntries([...runState.artefacts.entries()]),
    approvals: Object.fromEntries([...runState.approvals.entries()]),
    mode_slice_decision: runState.mode_slice_decision,
    relationships: map.relationships,
    evidence_refs: runState.evidence_refs,
    missing_evidence: map.missing_evidence,
    risks: map.risks,
    context_graph: map.context_graph,
    source_scope: map.source_scope,
    memory: map.memory,
    findings: map.findings,
    doctor_status: doctorReport.status,
    doctor_summary: doctorReport.summary,
    doctor_report: doctorReport,
  };
}

export function printDeliveryMapReport(report, json, io = console) {
  if (json) {
    io.log(JSON.stringify(report, null, 2));
    return;
  }

  io.log(`AGDF delivery-map: ${report.status}`);
  io.log(`Current gate: ${report.current_gate}`);
  io.log(`Next allowed action: ${report.next_allowed_action}`);
  io.log(`Quality outlook: ${report.quality_outlook}`);
  io.log(`Relationships: ${report.relationships.filter((item) => item.status === "pass").length}/${report.relationships.length} evidenced`);
  io.log(`Findings: ${report.findings.length}`);

  for (const finding of report.findings) {
    io.log("");
    io.log(`[${finding.severity}] ${finding.code}`);
    io.log(finding.message);
    io.log(`Next step: ${finding.next_step}`);
  }
}
