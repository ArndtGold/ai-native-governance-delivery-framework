import { readFileSync } from "node:fs";
import { executeControlMaintenance } from "./control-maintenance-command.js";
import { createRun } from "../control-state/run-state-repository.js";
import { extractField } from "../control-evaluation/verified-change.js";
import { prepareRunPresentation } from "../control-state/run-presentation.js";
import {
  buildStatusCard,
  evaluateGateCheck,
  printApprovalEnvelope,
  postApprovalTransition,
  printGateCheckReport,
} from "../control-evaluation/gate-check.js";
import { evaluateDeliveryMap, printDeliveryMapReport } from "../control-evaluation/delivery-map.js";
import { evaluateDoctor, printDoctorReport } from "../control-evaluation/doctor.js";
import { executeDeliveryPathSearch } from "./delivery-path-search-command.js";
import { resolveTaskTarget } from "../task-target-resolution.js";
import { renderSkillDispatchRecovery, renderTaskTargetOrientation } from "../interaction-presentation.js";
import { interactionLocales, pluginDefinition } from "./runtime-context.js";
import { serializeSkillDispatchResult } from "../skill-dispatch/contract.js";
import { createSkillDispatchService } from "../skill-dispatch/service.js";
import { approveRunGate, recordRunRevision } from "../control-state/run-recording.js";
import { reopenPrdRevision } from "../control-state/run-revision.js";
import { readRuntimeContract, readSkillRuntimeContracts } from "./contract-command.js";
import { recordRunStep } from "../control-state/run-steps.js";
import { policyForRunContent } from "../control-evaluation/run-step-policy.js";
import { cliGitObservation } from "../control-evaluation/git-observation.js";
import { resolveRepositoryContext } from "../repository-context.js";
import { applyRunRecovery, inspectRunRecovery, previewRunRecovery } from "../control-state/run-recovery.js";

const evaluateDoctorWithCliGit = (target, selection) => evaluateDoctor(target, selection, cliGitObservation);
const evaluateGateWithCliGit = (target, selection) => evaluateGateCheck(target, selection, cliGitObservation);
const resolveTaskTargetWithCliGit = (input) => resolveTaskTarget(input, {
  resolveRepositoryContext: (directory) => resolveRepositoryContext(directory),
});
const deliveryMapDependencies = Object.freeze({ evaluateDoctor: evaluateDoctorWithCliGit, buildStatusCard, postApprovalTransition });

export function createValidationHandlers(io = console) {
  const executeSkillDispatch = createSkillDispatchService({
    evaluateGateCheck: evaluateGateWithCliGit,
    resolveTaskTarget: resolveTaskTargetWithCliGit,
    readSkillRuntimeContracts,
  });
  return new Map([
    ["control-maintenance", (options) => executeControlMaintenance(options, io)],
    ["run-create", (options) => {
      try {
        const path = createRun(options.dir, options.runId);
        const revisionId = extractField(readFileSync(path, "utf8"), "revision_id");
        io.log(path);
        io.log(`revision_id: ${revisionId}`);
        io.log(`Next: write .agdf/control/artefacts/${options.runId}/UR.md from .agdf/control/templates/artefacts/UR.md, then record it with run-step --run ${options.runId} --revision ${revisionId} --step ur --title "<short requirement title>".`);
        return 0;
      } catch (error) {
        io.error(error instanceof Error ? error.message : String(error));
        return 1;
      }
    }],
    ["run-present", (options) => {
      const result = prepareRunPresentation(options.dir, { runId: options.runId, gate: options.gate,
        revisionId: options.revisionId, language: options.language?.chat_language }, { evaluateGateCheck: evaluateGateWithCliGit });
      io.log(JSON.stringify(result, null, 2));
      return result.outcome === "prepared" ? 0 : 2;
    }],
    ["target-check", (options) => {
      const report = resolveTaskTargetWithCliGit({
        targetSource: options.targetSource,
        primaryTarget: options.primaryTarget,
        workingDirectory: options.workingDirectory,
        targetChanged: options.targetChanged,
        candidates: options.targetCandidates,
        evidenceSources: options.evidenceSources,
      });
      const taskTargetOrientation = renderTaskTargetOrientation(report, {
        registry: interactionLocales,
        requestedLocale: options.language?.chat_language,
      });
      io.log(JSON.stringify({ ...report, task_target_orientation: taskTargetOrientation }, null, 2));
      return report.resolution_state === "resolved" ? 0 : 2;
    }],
    ["skill-dispatch", (options) => {
      const result = executeSkillDispatch({
        skillSet: pluginDefinition.skillSet,
        interactionLocales,
        skillId: options.skillId,
        surface: options.surface,
        presentationLanguage: options.language?.chat_language,
        workingDirectory: options.workingDirectory,
        targetSource: options.targetSource,
        primaryTarget: options.primaryTarget,
        runId: options.runId,
        intake: options.intake,
        intakeMode: options.intakeMode,
        ...(options.revisionId ? { expectedRevisionId: options.revisionId } : {}),
        continueDelivery: options.continueDelivery,
        expectedVersion: pluginDefinition.version,
      });
      io.log(serializeSkillDispatchResult(result, {
        outputTooLargeRecovery: renderSkillDispatchRecovery(
          { code: "output_too_large" },
          { registry: interactionLocales, requestedLocale: options.language?.chat_language },
        ),
      }));
      return ["control_result", "skill_continuation", "intake_continuation"].includes(result.outcome) ? 0 : 2;
    }],
    ["doctor", (options) => {
      const report = evaluateDoctorWithCliGit(options.dir, options);
      printDoctorReport(report, options.json, io);
      return report.status === "block" ? 2 : 0;
    }],
    ["gate-check", (options) => {
      const selection = options.languageExplicit
        ? { ...options, presentationLanguage: options.language?.chat_language }
        : options;
      const report = evaluateGateWithCliGit(options.dir, selection);
      if (options.approvalEnvelope) {
        const output = printApprovalEnvelope(report, { io, reEvaluate: () => evaluateGateWithCliGit(options.dir, selection) });
        return output.status === "blocked" ? 2 : 0;
      }
      const presentationRendered = printGateCheckReport(report, options.json, options.statusCard, io);
      if (presentationRendered === false) return 2;
      return report.status === "blocked" ? 2 : 0;
    }],
    ["delivery-map", (options) => {
      const report = evaluateDeliveryMap(options.dir, options, deliveryMapDependencies);
      printDeliveryMapReport(report, options.json, io);
      return report.status === "block" ? 2 : 0;
    }],
    ["contract", (options) => {
      const result = readRuntimeContract(options.contractModule);
      if (!result.ok) {
        io.error(`${result.reason}: ${options.contractModule}. Available modules: ${result.modules.join(", ")}`);
        return 1;
      }
      io.log(options.json ? JSON.stringify({ module: result.module, content: result.content }) : result.content.replace(/\n$/u, ""));
      return 0;
    }],
    ["run-update", (options) => {
      const result = recordRunRevision(options.dir, { runId: options.runId, revisionId: options.revisionId });
      io.log(JSON.stringify(result, null, 2));
      return result.outcome === "rejected" ? 2 : 0;
    }],
    ["run-revise", (options) => {
      const result = reopenPrdRevision(options.dir, { runId: options.runId, revisionId: options.revisionId });
      io.log(JSON.stringify(result, null, 2));
      return result.outcome === "rejected" ? 2 : 0;
    }],
    ["run-step", (options) => {
      const result = recordRunStep(options.dir, {
        runId: options.runId,
        revisionId: options.revisionId,
        step: options.runStep,
        ...options.stepFields,
      }, { policy: policyForRunContent });
      io.log(JSON.stringify(result, null, 2));
      return result.outcome === "rejected" ? 2 : 0;
    }],
    ["run-approve", (options) => {
      const result = approveRunGate(options.dir, {
        runId: options.runId,
        gate: options.gate,
        revisionId: options.revisionId,
        response: options.response,
        presentationId: options.presentationId,
      }, { evaluateGateCheck: evaluateGateWithCliGit });
      io.log(JSON.stringify(result, null, 2));
      return result.outcome === "rejected" ? 2 : 0;
    }],
    ["run-recovery", (options) => {
      try {
        const result = options.recoveryAction === "inspect"
          ? inspectRunRecovery(options.dir, options.runId)
          : options.recoveryAction === "preview"
            ? previewRunRecovery(options.dir, options.runId)
            : applyRunRecovery(options.dir, { runId: options.runId,
              previewId: options.recoveryPreviewId, confirmation: options.recoveryConfirmation });
        io.log(JSON.stringify(result, null, 2));
        return 0;
      } catch (error) {
        io.log(JSON.stringify({ schema_version: "1", outcome: "blocked", run_id: options.runId,
          action: options.recoveryAction, reason: error instanceof Error ? error.message : String(error) }, null, 2));
        return 2;
      }
    }],
    ["delivery-path-search", async (options) => {
      try {
        const result = await executeDeliveryPathSearch(options, io);
        return result.status === "recommendation" ? 0 : 2;
      } catch (error) {
        io.error(`Delivery Path Search failed: ${error.message}`);
        return 2;
      }
    }],
  ]);
}
