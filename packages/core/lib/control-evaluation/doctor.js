import { existsSync, withControlReadMemo, memoizeControlRead } from "../control-read/fs.js";
import { dirname, join } from 'node:path';
import { aggregate } from "../control-state/aggregate.js";
import { verifyLegacyProjection } from "../control-state/legacy-projection-reader.js";
import { resolveRuns } from "../control-state/run-state-resolver.js";
import { readRunInventory } from "../control-state/run-inventory-reader.js";
import { runSealState } from "../control-state/run-seal.js";
import { observeDecisionContent, decisionContentRecovery } from './decision-content-readiness.js';
import { pendingRunStepConflictIds } from "../control-state/run-step-transaction.js";
import { doctorRequiredFiles } from "./required-files.js";
import { analyzeDeliveryMap } from "./delivery-map.js";
import { evaluateVerifiedChange } from "./verified-change.js";
import { analyzeArtefactRoleConsistency, analyzeDurableGateArtefactConsistency, modeSliceDecision, readRunState, resolvedArtefactFile } from "./run-state.js";
import { addFinding, allowNoActiveRuns, filled, hasFilledEvidenceRow, hasFilledTableRow, isPlaceholderValue, markdownSection, nonEmptyTableRows, parseQualityContracts, readTargetFile, runSelectionRecovery, tableRows } from "./shared.js";

const RUN_SEAL_FINDINGS = Object.freeze({
  approvals_changed: {
    code: "AGDF_RUN_APPROVALS_UNRECORDED",
    message: "The Approvals rows differ from the approvals recorded by run-approve.",
    next_step: "Restore the recorded Approvals rows; record a gate approval only with run-approve after the exact user reply.",
  },
  content_changed: {
    code: "AGDF_RUN_SEAL_MISMATCH",
    message: "The run state or a listed artefact changed after the last recorded revision.",
    next_step: "Record the reviewed change with run-update so the run revision advances, then run gate-check again.",
  },
  invalid: {
    code: "AGDF_RUN_SEAL_INVALID",
    message: "The run seal lines are missing or malformed.",
    next_step: "Restore the last sealed revision from trusted history and inspect changes before run-update; do not remove seal lines to bypass approval checks.",
  },
  unsealed: {
    code: "AGDF_RUN_SEAL_INVALID",
    message: "The run has no seal and cannot be changed by normal write commands.",
    next_step: "Restore a trusted sealed revision or use the explicit legacy migration path; do not infer approvals from this file.",
  },
});

// Keep inventory findings under the same diagnosis owner for direct and paged
// observations; transport pagination must not reinterpret their domain content.
export const doctorInventoryFindings = findings => findings.map(finding => ({
  ...finding,
  severity: 'block',
  message: finding.classification === 'unsupported_version'
    ? 'The recorded control-state version is unsupported by this reader; this does not establish corrupted history.'
    : finding.classification === 'unclassified'
      ? 'The control-state version is missing or malformed; producer incompatibility has not been established.'
      : 'Invalid canonical run entry.',
  next_step: finding.classification === 'unsupported_version'
    ? 'Use a compatible reader supporting the recorded format; preserve original history bytes and provenance.'
    : 'Inspect the original version and integrity evidence; do not automatically rewrite, migrate or remove unrelated history.',
}));

export function evaluateDoctor(targetDir, selection = {}, dependencies = {}) {
  return evaluateDoctorWithRunState(targetDir, selection, dependencies).report;
}

// A gate evaluation consumes the exact state already read by its doctor check.
// This observation lives only for that evaluation; later calls and writes read afresh.
export function evaluateDoctorWithRunState(targetDir, selection = {}, dependencies = {}) {
  return withControlReadMemo(() => evaluateDoctorObserved(targetDir, selection, dependencies));
}

function evaluateDoctorObserved(targetDir, selection, dependencies) {
  if (selection.allActive) {
    const selected = resolveRuns(targetDir, { allActive: true });
    const runs = selected.runs.map((run) => ({
      run_id: run.run_id,
      report: evaluateDoctor(targetDir, { runId: run.run_id }, dependencies),
    }));
    const status = selected.findings.length
      ? "block"
      : aggregate(
          runs.map((item) => ({ run_id: item.run_id, status: item.report.status })),
          { allowNoActiveRuns: allowNoActiveRuns(targetDir) },
        ).status;
    const findings = [
      ...doctorInventoryFindings(selected.findings),
      ...runs.flatMap((item) => item.report.findings.map((finding) => ({ ...finding, run_id: item.run_id }))),
    ];
    // Stored-state inventory of all runs; it never changes the evaluated doctor status above.
    const listed = readRunInventory(targetDir, { language: selection.presentationLanguage });
    return { report: {
      schema_version: "1",
      status,
      checked_at: new Date().toISOString(),
      target_dir: targetDir,
      inventory: {
        state: !existsSync(join(targetDir, ".agdf", "control")) ? "absent"
          : selected.findings.length ? "incomplete" : "complete",
        active_count: runs.length,
        counts: listed.counts,
        runs: listed.runs,
      },
      summary: {
        findings: findings.length,
        block: findings.filter((finding) => finding.severity === "block").length,
        revise: findings.filter((finding) => finding.severity === "revise").length,
        warn: findings.filter((finding) => finding.severity === "warn").length,
      },
      findings,
      runs,
    } };
  }
  const shared = sharedDoctorContext(targetDir, selection.runId);
  const findings = [...shared.findings], missing = shared.missing;
  let reconciliation, selectedRunState;
  if (missing.length === 0) {
    selectedRunState = readRunState(targetDir, selection);
    const runPath = selectedRunState.path;
    const run = selectedRunState.content;

    if (selectedRunState.resolution_error) {
      if (selectedRunState.resolution_findings?.length) findings.push(...doctorInventoryFindings(selectedRunState.resolution_findings));
      else addFinding(
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
      const content = observeDecisionContent(targetDir, selectedRunState, { objectiveOnly: true });
      if (!content.ready) addFinding(findings, 'warn', 'AGDF_DECISION_CONTENT_INCOMPLETE',
        'The selected active Run has incomplete decision orientation.', runPath,
        decisionContentRecovery(content, { state: selectedRunState }));

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

      const sealFinding = RUN_SEAL_FINDINGS[runSealState(targetDir, run).status];
      if (sealFinding) addFinding(findings, "block", sealFinding.code, sealFinding.message, runPath, sealFinding.next_step);
    }

    const runState = selectedRunState;
    for (const type of runState.artefact_row_duplicates ?? []) {
      addFinding(
        findings,
        "block",
        "AGDF_ARTEFACT_ROW_DUPLICATE",
        `The selected run has more than one Artefacts row for ${type}; the effective artefact is ambiguous.`,
        runState.path,
        "Keep exactly one Artefacts row per type, record the reviewed correction with run-update, then retry the gate presentation.",
      );
    }
    if (modeSliceDecision(runState) === "verified_change") {
      const verifiedChange = evaluateVerifiedChange(targetDir, runState, dependencies);
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
      targetDir,
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

  return { runState: selectedRunState, report: {
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
  } };
}


// Repeated Runs reuse shared policy/store findings only inside the same read observation.
// This cache never survives a source change or becomes write permission.
function sharedDoctorContext(targetDir, runId) {
  return memoizeControlRead(`doctorShared:${targetDir}:${runId ?? ""}`, () => {
    const findings = [];
    for (const pendingId of pendingRunStepConflictIds(targetDir, runId)) {
      addFinding(
        findings,
        "block",
        "AGDF_RUN_STEP_RECOVERY_REQUIRED",
        `A run-step transaction for ${pendingId} is incomplete; its recorded outputs require recovery.`,
        join(".agdf", "control", "runs", pendingId, "RUN_STEP_PENDING.json"),
        "Use explicit supported recovery for this exact pending operation; preserve conflicting bytes.",
      );
    }
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
    }
    return { findings, missing };
  });
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
