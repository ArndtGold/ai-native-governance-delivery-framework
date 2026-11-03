import { executeRunAlias } from './run-command-aliases.js';
import { renderCodexDocument } from './codex-document-command.js';
import { readFileSync, lstatSync, openSync, fstatSync, closeSync, constants } from "node:fs";
import { commandGroupRoutes } from './command-registry.js';
import { RUN_COMMAND_LIMITS } from '#agdf-core/control-state/run-command-contract.js';
import { executeControlMaintenance } from "./control-maintenance-command.js";
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
import { renderSkillDispatchRecovery, renderTaskTargetOrientation, renderSourceRevision, renderRunInventory } from "#agdf-core/interaction-presentation.js";
import { readRunInventory } from "#agdf-core/control-state/run-inventory-reader.js";
import { readWorkInventory } from '#agdf-core/control-state/planned-inventory.js';
import { readControlLayout, CURRENT_LAYOUT } from '#agdf-core/control-state/control-layout.js';
import { executePlannedCli } from './planned-command.js';
import { interactionLocales, pluginDefinition } from "./runtime-context.js";
import { serializeSkillDispatchResult } from "#agdf-core/skill-dispatch/contract.js";
import { createCoreServices } from "#agdf-core";
import { resources } from "../runtime/control-context.js";
import { readRuntimeContract, readSkillRuntimeContracts } from "./contract-command.js";
import { cliGitObservation } from "../control-evaluation/git-observation.js";
import { resolveRepositoryContext } from "../repository-context.js";
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
    ['render-document', options => renderCodexDocument(options)],
    ...['run-create', 'run-present', 'run-approve', 'run-step', 'run-revise', 'run-close'].map(name => [name, options => executeRunAlias(options, io)]),
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
        const result = createCoreServices({ resources, observers: { gitObservation: cliGitObservation } }).command(group, input);
        io.log(JSON.stringify(result));
        return ['accepted', 'already_applied'].includes(result.outcome) ? 0 : 2;
      } catch (error) { io.error(error.message); return 1; }
      finally { if (fd !== undefined) closeSync(fd); }
    }]),
    ["control-maintenance", (options) => executeControlMaintenance(options, io)],
    ['planned', options => executePlannedCli(options, io)],
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
    ["inventory", (options) => {
      const language = options.languageExplicit ? options.language?.chat_language : resolveConfiguredChatLanguage(options.dir);
      if (readControlLayout(options.dir).layout === CURRENT_LAYOUT) {
        const inventory = readWorkInventory(options.dir, { language });
        io.log(options.json ? JSON.stringify(inventory, null, 2) : inventory.entries.map(row => `${row.kind}: ${row.title} · ${row.coverage}`).join('\n'));
        return inventory.state === 'unavailable' ? 2 : 0;
      }
      const inventory = readRunInventory(options.dir, { language });
      io.log(options.json ? JSON.stringify(inventory, null, 2) : renderRunInventory(inventory, interactionLocales, language).markdown);
      return 0;
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
