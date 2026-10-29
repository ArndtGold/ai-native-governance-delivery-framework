import { recordGateApprovalCommand, resolveControlCommandTarget } from "../control-command.js";
import { COOPERATIVE_ASSURANCE } from "#agdf-core/control-state/approval-command-contract.js";
import { readFileSync, lstatSync, openSync, fstatSync, closeSync, constants } from "node:fs";
import { commandGroupRoutes } from './command-registry.js';
import { RUN_COMMAND_LIMITS } from '#agdf-core/control-state/run-command-contract.js';
import { executeControlMaintenance } from "./control-maintenance-command.js";
import { createRun } from "#agdf-core/control-state/run-state-repository.js";
import { extractField } from "#agdf-core/control-evaluation/verified-change.js";
import { ARTEFACT_TEMPLATE_IDS, resolveArtefactTemplatePath } from "#agdf-core/resources/artefact-templates.js";
import { prepareRunPresentation } from "#agdf-core/control-state/run-presentation.js";
import {
  buildStatusCard,
  evaluateGateCheck,
  printApprovalEnvelope,
  postApprovalTransition,
  printGateCheckReport,
} from "#agdf-core/control-evaluation/gate-check.js";
import { evaluateDeliveryMap, printDeliveryMapReport } from "#agdf-core/control-evaluation/delivery-map.js";
import { evaluateDoctor, printDoctorReport } from "#agdf-core/control-evaluation/doctor.js";
import { executeDeliveryPathSearch } from "./delivery-path-search-command.js";
import { resolveTaskTarget } from "#agdf-core/task-target-resolution.js";
import { renderSkillDispatchRecovery, renderTaskTargetOrientation, renderSourceRevision } from "#agdf-core/interaction-presentation.js";
import { interactionLocales, pluginDefinition } from "./runtime-context.js";
import { serializeSkillDispatchResult } from "#agdf-core/skill-dispatch/contract.js";
import { createCoreServices } from "#agdf-core";
import { resources } from "../runtime/control-context.js";
import { approveRunGate, recordRunRevision } from "#agdf-core/control-state/run-recording.js";
import { reopenPrdRevision, previewSourceRevision, applySourceRevision, inspectSourceRevision, recoverSourceRevision } from "#agdf-core/control-state/run-revision.js";
import { readRuntimeContract, readSkillRuntimeContracts } from "./contract-command.js";
import { recordRunStep } from "#agdf-core/control-state/run-steps.js";
import { policyForRunContent } from "#agdf-core/control-evaluation/run-step-policy.js";
import { cliGitObservation } from "../control-evaluation/git-observation.js";
import { resolveRepositoryContext } from "../repository-context.js";
import { applyRunRecovery, inspectRunRecovery, previewRunRecovery } from "../control-state/run-recovery.js";
import { previewRunClosure, applyRunClosure } from "#agdf-core/control-state/run-closure.js";
import { endedRunMessage } from "#agdf-core/control-state/run-operations.js";
import { resolveConfiguredChatLanguage } from "#agdf-core/resources/context.js";

const evaluateDoctorWithCliGit = (target, selection) => evaluateDoctor(target, selection, cliGitObservation);
const evaluateGateWithCliGit = (target, selection) => evaluateGateCheck(target, selection, cliGitObservation);
const resolveTaskTargetWithCliGit = (input) => resolveTaskTarget(input, {
  resolveRepositoryContext: (directory) => resolveRepositoryContext(directory),
});
const deliveryMapDependencies = Object.freeze({ evaluateDoctor: evaluateDoctorWithCliGit, buildStatusCard, postApprovalTransition });

export function createValidationHandlers(io = console) {
  const executeSkillDispatch = createCoreServices({ resources, observers: {
    evaluateGateCheck: evaluateGateWithCliGit,
    resolveTaskTarget: resolveTaskTargetWithCliGit,
    readSkillRuntimeContracts,
  } }).dispatch;
  return new Map([
    ...Object.entries(commandGroupRoutes).map(([route, group]) => [route, options => {
      let fd;
      try {
        const stat = lstatSync(options.commandFile);
        if (!stat.isFile() || stat.isSymbolicLink() || stat.size > RUN_COMMAND_LIMITS.input_bytes) throw Error('command_file_invalid');
        fd = openSync(options.commandFile, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
        const actual = fstatSync(fd);
        if (!actual.isFile() || actual.dev !== stat.dev || actual.ino !== stat.ino || actual.size > RUN_COMMAND_LIMITS.input_bytes) throw Error('command_file_invalid');
        const bytes = readFileSync(fd);
        if (bytes.length > RUN_COMMAND_LIMITS.input_bytes) throw Error('command_file_invalid');
        const input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
        const result = createCoreServices({ resources }).command(group, input);
        io.log(JSON.stringify(result));
        return ['accepted', 'already_applied'].includes(result.outcome) ? 0 : 2;
      } catch (error) { io.error(error.message); return 1; }
      finally { if (fd !== undefined) closeSync(fd); }
    }]),
    ["control-maintenance", (options) => executeControlMaintenance(options, io)],
    ["run-create", (options) => {
      try {
        const path = createRun(options.dir, options.runId);
        const revisionId = extractField(readFileSync(path, "utf8"), "revision_id");
        io.log(path);
        io.log(`revision_id: ${revisionId}`);
        // The plugin-owned template is the only authoring source; repository scaffold copies are
        // derived references. Run creation itself never fails on template availability.
        let urTemplate = null;
        try { urTemplate = resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS.UR); } catch {}
        const templateSource = urTemplate
          ? `the plugin-owned UR template at ${urTemplate}`
          : "the plugin-owned UR template supplied as template_path by the bound ur-definition dispatch";
        io.log(`Next: write .agdf/control/artefacts/${options.runId}/UR.md from ${templateSource}, then record it with run-step --run ${options.runId} --revision ${revisionId} --step ur --title "<short requirement title>".`);
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
        ...(options.urAction !== undefined ? { urAction: options.urAction } : {}),
        ...(options.prdAction !== undefined ? { prdAction: options.prdAction } : {}),
        ...(options.sdAction !== undefined ? { sdAction: options.sdAction } : {}),
        ...(options.tpAction !== undefined ? { tpAction: options.tpAction } : {}),
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
      const operation = { preview: previewSourceRevision, apply: applySourceRevision, inspect: inspectSourceRevision, recover: recoverSourceRevision }[options.revisionMode] ?? reopenPrdRevision;
      const result = operation(options.dir, { runId: options.runId, revisionId: options.revisionId,
        operationId: options.operationId, sourceGate: options.sourceGate, evidence: options.stepFields?.evidence, previewDigest: options.previewDigest });
      io.log(options.revisionMode && !options.json ? renderSourceRevision(result, interactionLocales, options.language.chat_language,
        { ...options, target: options.dir }).markdown : JSON.stringify(result, null, 2));
      return ["rejected", "recovery_required"].includes(result.outcome) ? 2 : 0;
    }],
    ["run-step", (options) => {
      const result = recordRunStep(options.dir, {
        runId: options.runId,
        revisionId: options.revisionId,
        step: options.runStep,
        ...(options.gate ? { gate: options.gate } : {}),
        ...options.stepFields,
      }, { policy: policyForRunContent });
      io.log(JSON.stringify(result, null, 2));
      return result.outcome === "rejected" ? 2 : 0;
    }],
    ["run-approve", (options) => {
      let result;
      if (options.assurance !== undefined && options.assurance !== "cooperative_local") {
        result = { schema_version: "1", outcome: "rejected", run_id: options.runId,
          reason: "unsupported_authority", assurance: COOPERATIVE_ASSURANCE };
      } else if (options.operationId !== undefined) {
        result = recordGateApprovalCommand(options.dir, {
          schema_version: "1", action: "record_gate_approval",
          target_id: resolveControlCommandTarget(options.dir).target_id, run_id: options.runId,
          gate: options.gate, expected_revision_id: options.revisionId,
          presentation_id: options.presentationId, response: options.response,
          operation_id: options.operationId, assurance: options.assurance ?? "cooperative_local",
        });
      } else result = { ...approveRunGate(options.dir, {
        runId: options.runId,
        gate: options.gate,
        revisionId: options.revisionId,
        response: options.response,
        presentationId: options.presentationId,
      }, { evaluateGateCheck: evaluateGateWithCliGit }), assurance: COOPERATIVE_ASSURANCE };
      io.log(JSON.stringify(result, null, 2));
      return ["approved", "accepted", "already_applied"].includes(result.outcome) ? 0 : 2;
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
          action: options.recoveryAction, reason: error instanceof Error ? error.message : String(error),
          ...(error?.closure ? { closure: error.closure, message: endedRunMessage(options.runId, error.closure) } : {}) }, null, 2));
        return 2;
      }
    }],
    ["run-close", (options) => {
      // Like gate-check: an explicit --language wins, otherwise the repository chat language.
      const language = options.languageExplicit ? options.language?.chat_language : resolveConfiguredChatLanguage(options.dir);
      let result;
      if (options.recoveryAction === "apply") {
        result = applyRunClosure(options.dir, { previewId: options.recoveryPreviewId, confirmation: options.closureConfirmation, language }, { packageVersion: pluginDefinition.version });
      } else {
        let entries;
        if (options.closureFile) {
          try {
            const stat = lstatSync(options.closureFile);
            if (!stat.isFile() || stat.isSymbolicLink() || stat.size > RUN_COMMAND_LIMITS.input_bytes) throw Error("closure_file_invalid");
            entries = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(readFileSync(options.closureFile)))?.entries;
          } catch { io.error("closure_file_invalid: --closure-file must name a JSON file of at most 64 KiB with an entries array"); return 1; }
        } else entries = [{ run_id: options.runId, outcome: options.closureOutcome, reason: options.stepFields.reason,
          ...(options.successorRun !== undefined ? { successor_run: options.successorRun } : {}),
          ...(options.successorReference !== undefined ? { successor_reference: options.successorReference } : {}) }];
        result = previewRunClosure(options.dir, { entries, language });
      }
      io.log(options.json ? JSON.stringify(result, null, 2) : result.text);
      return result.outcome === "rejected" ? 2 : 0;
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
