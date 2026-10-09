import process from "node:process";
import { createDispatchBinding as buildBinding } from "#agdf-core/skill-dispatch/binding.js";
import { createRuntimeProbe } from "../runtime/runtime-probe.js";
export { createRuntimeProbe, runtimeEnvironment } from "../runtime/runtime-probe.js";
export { validateDispatchBinding, unavailableDispatchContext } from "#agdf-core/skill-dispatch/binding.js";
const probeRuntime = createRuntimeProbe();
export function createDispatchBinding(options, dependencies = {}) {
  return buildBinding({ executable: process.execPath, versions: process.versions, ...options }, { probe: probeRuntime, ...dependencies });
}
