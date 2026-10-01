import { resources } from "./resources/context.js";
import { readRuntimeContract, readSkillRuntimeContracts } from "./resources/contracts.js";
import { createSkillDispatchService } from "./skill-dispatch/service.js";
import { createControlInspectService } from "./control-inspect/service.js";
export { createResourceContext, resources } from "./resources/context.js";
export function createCoreServices({ resources: context = resources, observers = {}, runtimeBinding } = {}) {
  const contracts = { readRuntimeContract: module => readRuntimeContract(module, { context }), readSkillRuntimeContracts: skill => readSkillRuntimeContracts(skill, { context }) };
  return Object.freeze({ ...contracts, resources: context, runtimeBinding,
    dispatch: createSkillDispatchService({ ...observers, ...contracts }),
    inspect: createControlInspectService({ ...observers, ...contracts }),
  });
}
