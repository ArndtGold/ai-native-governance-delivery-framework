import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { aggregate, resolveRuns, verifyLegacyProjection } from '../control-state/index.js';
import { doctorRequiredFiles } from './required-files.js';
import { analyzeDeliveryMap } from './delivery-map.js';
import { evaluateVerifiedChange } from './verified-change.js';
import { analyzeArtefactRoleConsistency, analyzeDurableGateArtefactConsistency, modeSliceDecision, readRunState, resolvedArtefactFile } from './run-state.js';
import { addFinding, allowNoActiveRuns, filled, hasFilledEvidenceRow, hasFilledTableRow, isPlaceholderValue, markdownSection, nonEmptyTableRows, parseBacklogSection, parseQualityContracts, readTargetFile, runSelectionRecovery, tableRows } from './shared.js';

export function evaluateDoctor(targetDir, selection = {}) {
  if (selection.allActive) {
    const selected = resolveRuns(targetDir, { allActive: true });
    const runs = selected.runs.map((run) => ({
      run_id: run.run_id,
      report: evaluateDoctor(targetDir, { runId: run.run_id }),
    }));
    const status = selected.findings.length
      ? "block"
      : aggregate(
          runs.map((item) => ({ run_id: item.run_id, status: item.report.status })),
          { allowNoActiveRuns: allowNoActiveRuns(targetDir) },
        ).status;
    const findings = [
      ...selected.findings.map((finding) => ({
        ...finding,
        severity: "block",
        message: "Invalid canonical run entry.",
        next_step: "Repair or remove the invalid run entry.",
      })),
      ...runs.flatMap((item) => item.report.findings.map((finding) => ({ ...finding, run_id: item.run_id }))),
    ];
    return {
      schema_version: "1",
      status,
      checked_at: new Date().toISOString(),
      target_dir: targetDir,
      summary: {
        findings: findings.length,
        block: findings.filter((finding) => finding.severity === "block").length,
        revise: findings.filter((finding) => finding.severity === "revise").length,
        warn: findings.filter((finding) => finding.severity === "warn").length,
      },
      findings,
      runs,
    };
  }
  const findings = [];
  let reconciliation;
  const hasCanonicalRuns = existsSync(join(targetDir, ".agdf", "control", "runs"));
  if (hasCanonicalRuns) {
    const projection = verifyLegacyProjection(targetDir);
    if (!["absent", "valid"].includes(projection.status)) {
      addFinding(
        findings,
        "block",
        "AGDF_LEGACY_PROJECTION_DRIFT",
        `Legacy compatibility state is not a valid projection: ${projection.status}.`,
        join(".agdf", "control", "AGDF_RUN.md"),
        "Regenerate the explicit legacy projection or remove it after legacy consumers are retired.",
      );
    }
  }
  const missing = doctorRequiredFiles.filter(
    (relativePath) => !(relativePath.endsWith("AGDF_RUN.md") && hasCanonicalRuns) && !existsSync(join(targetDir, relativePath)),
  );

  for (const relativePath of missing) {
    const templatePath = join(dirname(relativePath), "templates", relativePath.split("/").at(-1));
    const hasTemplate = existsSync(join(targetDir, templatePath));
    addFinding(
      findings,
      "block",
      "AGDF_CONTROL_FILE_MISSING",
      hasTemplate
        ? "Live control file is missing; only the template exists."
        : "Required live control file is missing.",
      relativePath,
      "Run npx --yes @agdf/cli@latest init only when the repository should own durable AGDF control state or deterministic setup is explicitly needed.",
    );
  }

  if (missing.length === 0) {
    const selectedRunState = readRunState(targetDir, selection);
    const runPath = selectedRunState.path;
    const run = selectedRunState.content;

    if (selectedRunState.resolution_error) {
      addFinding(
        findings,
        "block",
        selectedRunState.resolution_error.split(":")[0] || "AGDF_ACTIVE_RUN_UNRESOLVED",
        `Run selection failed: ${selectedRunState.resolution_error}`,
        runPath,
        runSelectionRecovery(selection.target),
      );
    } else {
      const currentGateLine = run.match(/^- current_gate:[^\S\r\n]*(.*)$/m)?.[1]?.trim() ?? "";
      const nextActionLine = run.match(/^- next_allowed_action:[^\S\r\n]*(.*)$/m)?.[1]?.trim() ?? "";
      const hasEvidence = hasFilledEvidenceRow(run);

      if (isPlaceholderValue(currentGateLine)) {
        addFinding(
          findings,
          "revise",
          "AGDF_CURRENT_GATE_MISSING",
          "The selected run state does not name the current gate.",
          runPath,
          "Set current_gate to the current delivery gate or none.",
        );
      }

      if (isPlaceholderValue(nextActionLine)) {
        addFinding(
          findings,
          "revise",
          "AGDF_NEXT_ALLOWED_ACTION_MISSING",
          "The selected run state does not state the next allowed action.",
          runPath,
          "Fill the next allowed action before asking an agent to continue delivery work.",
        );
      }

      if (!hasEvidence) {
        addFinding(
          findings,
          "warn",
          "AGDF_EVIDENCE_EMPTY",
          "The selected run state has no visible evidence row yet.",
          runPath,
          "Add at least one evidence row or explicitly document that no evidence exists yet.",
        );
      }

      for (const identityFinding of selectedRunState.identity_findings ?? []) {
        addFinding(
          findings,
          "revise",
          identityFinding.code,
          identityFinding.code === "AGDF_RUN_ID_INVALID"
            ? "The selected run state has a missing or invalid run_id; interaction cards cannot be rendered for it."
            : "The selected run state has a missing or invalid revision_id; approval interactions cannot be rendered for it.",
          runPath,
          "Run run-migrate to repair the run identity, or migrate the legacy state to a canonical run record.",
        );
      }
    }

    const backlogPath = join(".agdf", "control", "MASTER_BACKLOG.md");
    const backlog = readTargetFile(targetDir, backlogPath);
    parseBacklogSection(markdownSection(backlog, "Active Backlog"), findings, backlogPath);
    parseBacklogSection(markdownSection(backlog, "Planned / Parking Lot"), findings, backlogPath);
    const completedRows = tableRows(markdownSection(backlog, "Completed / Superseded Pointers"))
      .slice(1)
      .filter((cells) => cells.some((cell) => filled(cell)));
    if (!hasFilledTableRow(backlog, /^P[0-9]/) && completedRows.length === 0) {
      addFinding(
        findings,
        "warn",
        "AGDF_BACKLOG_POINTER_EMPTY",
        "MASTER_BACKLOG.md does not contain an active or planned work pointer.",
        backlogPath,
        "Add the active item or document that no governed delivery item is active.",
      );
    }

    const sotPath = join(".agdf", "control", "SOT_REGISTRY.md");
    const sot = readTargetFile(targetDir, sotPath);
    if (!hasFilledTableRow(sot, /Product intent|Architecture|Runtime contracts|UX \/ user flows|Operations \/ release/)) {
      addFinding(
        findings,
        "warn",
        "AGDF_SOT_REGISTRY_EMPTY",
        "SOT_REGISTRY.md has no filled primary source-of-truth row.",
        sotPath,
        "Assign one primary source of truth for at least the domains relevant to the next run.",
      );
    }

    const activeDomains = new Map();
    for (const cells of nonEmptyTableRows(sot)) {
      const [domain, document, status] = cells;
      if (!domain || !document || status !== "active") continue;
      activeDomains.set(domain, (activeDomains.get(domain) ?? 0) + 1);
    }
    for (const [domain, count] of activeDomains.entries()) {
      if (count > 1) {
        addFinding(
          findings,
          "block",
          "AGDF_PARALLEL_SOT",
          `Domain has ${count} active source-of-truth rows: ${domain}.`,
          sotPath,
          "Keep exactly one active primary source of truth for this domain.",
        );
      }
    }

    const contextPath = join(".agdf", "control", "CONTEXT_GRAPH.md");
    const contextGraph = readTargetFile(targetDir, contextPath);
    if (contextGraph.includes("### CG-001 Example")) {
      addFinding(
        findings,
        "warn",
        "AGDF_CONTEXT_GRAPH_TEMPLATE_NODE",
        "CONTEXT_GRAPH.md still contains the example node.",
        contextPath,
        "Remove the example or replace it with an evidenced node that has an exit criterion.",
      );
    }

    const contractsPath = join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json");
    try {
      parseQualityContracts(readTargetFile(targetDir, contractsPath));
    } catch (error) {
      addFinding(
        findings,
        "block",
        "AGDF_QUALITY_CONTRACTS_INVALID",
        `AGENT_QUALITY_CONTRACTS.json is invalid: ${error.message}`,
        contractsPath,
        "Restore the generated contracts or fix the JSON contract schema.",
      );
    }

    const runState = selectedRunState;
    if (modeSliceDecision(runState) === "verified_change") {
      const verifiedChange = evaluateVerifiedChange(targetDir, runState);
      for (const finding of verifiedChange.findings) {
        addFinding(findings, finding.severity, finding.code, finding.message, finding.path, finding.next_step);
      }
    }
    for (const finding of analyzeDurableGateArtefactConsistency(runState)) {
      addFinding(findings, finding.severity, finding.code, finding.message, finding.path, finding.next_step);
    }
    for (const finding of analyzeArtefactRoleConsistency(targetDir, runState)) {
      addFinding(findings, finding.severity, finding.code, finding.message, finding.path, finding.next_step);
    }
    reconciliation = analyzeDeliveryMap(runState, {
      loadRun: (runId) => readRunState(targetDir, { runId }),
      resolveFile: (path) => resolvedArtefactFile(targetDir, path),
    });
    for (const finding of reconciliation.findings) {
      addFinding(findings, finding.severity, finding.code, finding.message, finding.path, finding.next_step);
    }
  }

  const severityRank = { block: 3, revise: 2, warn: 1 };
  const maxSeverity = findings.reduce((max, finding) => Math.max(max, severityRank[finding.severity] ?? 0), 0);
  const status = maxSeverity >= 3 ? "block" : maxSeverity === 2 ? "revise" : maxSeverity === 1 ? "warn" : "pass";

  return {
    schema_version: "1",
    status,
    checked_at: new Date().toISOString(),
    target_dir: targetDir,
    summary: {
      findings: findings.length,
      block: findings.filter((finding) => finding.severity === "block").length,
      revise: findings.filter((finding) => finding.severity === "revise").length,
      warn: findings.filter((finding) => finding.severity === "warn").length,
    },
    parent_reconciliation: reconciliation?.parent_reconciliation,
    programme_aggregation: reconciliation?.programme_aggregation,
    findings,
  };
}

export function printDoctorReport(report, json, io = console) {
  if (json) {
    io.log(JSON.stringify(report, null, 2));
    return;
  }

  io.log(`AGDF doctor: ${report.status}`);
  io.log(`Checked: ${report.target_dir}`);
  io.log(`Findings: ${report.summary.findings} (${report.summary.block} block, ${report.summary.revise} revise, ${report.summary.warn} warn)`);

  for (const finding of report.findings) {
    io.log("");
    io.log(`[${finding.severity}] ${finding.code}`);
    io.log(`Path: ${finding.path}`);
    io.log(finding.message);
    io.log(`Next step: ${finding.next_step}`);
  }
}
