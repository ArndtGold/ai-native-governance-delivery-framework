import { resources } from "./resources/context.js";
import { readRuntimeContract, readSkillRuntimeContracts } from "./resources/contracts.js";
import { createDeliveryContinuationService } from "./delivery-continuation/service.js";
import { createControlInspectService } from "./control-inspect/service.js";
import { createRunCommandService } from "./control-state/run-command-service.js";
export { createResourceContext, resources } from "./resources/context.js";
export function createCoreServices({ resources: context = resources, observers = {}, runtimeBinding } = {}) {
  const contracts = { readRuntimeContract: module => readRuntimeContract(module, { context }), readSkillRuntimeContracts: skill => readSkillRuntimeContracts(skill, { context }) };
  return Object.freeze({ ...contracts, resources: context, runtimeBinding,
    dispatch: createDeliveryContinuationService({ ...observers, ...contracts, pluginDefinition: context.pluginDefinition }),
    inspect: createControlInspectService({ ...observers, ...contracts }),
    command: createRunCommandService({ packageVersion: context.pluginDefinition.version, enabledGroups: observers.commandGroups, runtimeControl: observers.runtimeControl }),
  });
}
