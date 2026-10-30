import { resources } from "./resources/context.js";
import { readRuntimeContract, readSkillRuntimeContracts } from "./resources/contracts.js";
import { createDeliveryContinuationService } from "./delivery-continuation/service.js";
import { createControlInspectService } from "./control-inspect/service.js";
import { createRunCommandService } from "./control-state/run-command-service.js";
import { createRunMaterialStore } from './control-state/run-material.js';
import { evaluateGateCheck } from './control-evaluation/gate-check.js';
import { evaluateDoctor } from './control-evaluation/doctor.js';
export { createResourceContext, resources } from "./resources/context.js";
export function createCoreServices({ resources: context = resources, observers = {}, runtimeBinding } = {}) {
  const contracts = { readRuntimeContract: module => readRuntimeContract(module, { context }), readSkillRuntimeContracts: skill => readSkillRuntimeContracts(skill, { context }) };
  const material = createRunMaterialStore();
  const reads = observers.gitObservation ? { ...observers,
    evaluateGateCheck: observers.evaluateGateCheck ?? ((root, selection) => evaluateGateCheck(root, selection, observers.gitObservation)),
    evaluateDoctor: observers.evaluateDoctor ?? ((root, selection) => evaluateDoctor(root, selection, observers.gitObservation)),
  } : observers;
  return Object.freeze({ ...contracts, resources: context, runtimeBinding, material,
    dispatch: createDeliveryContinuationService({ ...reads, ...contracts, pluginDefinition: context.pluginDefinition }),
    inspect: createControlInspectService({ ...reads, ...contracts }),
    command: createRunCommandService({ packageVersion: context.pluginDefinition.version, enabledGroups: observers.commandGroups, runtimeControl: observers.runtimeControl, materialGrants: observers.materialGrants, gitObservation: observers.gitObservation, initializationProducer: observers.runtimeEvidence?.runtime_digest }),
  });
}
