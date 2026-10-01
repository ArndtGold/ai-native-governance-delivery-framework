import { statSync } from "node:fs";
import { dirname, isAbsolute } from "node:path";
import { SKILL_DISPATCH_SURFACES, skillDispatchArgumentGrammar } from "./contract.js";

const SURFACES = new Set(SKILL_DISPATCH_SURFACES);
const text = (value) => typeof value === "string" && value.length > 0 && value.length <= 4096 && !/[\r\n\0]/u.test(value);
const absolute = (value) => text(value) && isAbsolute(value);

function fileIdentity(path, stat) {
  if (!absolute(path)) throw new Error("runtime_unavailable");
  try {
    const s = stat(path);
    if (!s.isFile()) throw new Error();
    return [s.dev, s.ino, s.size, s.mtimeMs, s.ctimeMs];
  } catch { throw new Error("runtime_unavailable"); }
}

export function validateDispatchBinding(binding) {
  const invalid = () => { throw new Error("invalid_dispatch_binding"); };
  if (!binding || binding.schema_version !== "2" || binding.authorizes !== false
      || !absolute(binding.executable) || !text(binding.expected_version)
      || binding.arguments !== skillDispatchArgumentGrammar()) invalid();
  const keys = ["schema_version", "executable", "argv_prefix", "environment", "arguments", "expected_version", "request_activation", "authorizes"];
  if (binding.route_source_after_activation !== undefined) keys.push("route_source_after_activation");
  if (Object.keys(binding).sort().join() !== keys.sort().join()) invalid();
  const args = binding.argv_prefix;
  if (!Array.isArray(args) || args.length !== 5 || !absolute(args[0])
      || args.slice(1, 4).join() !== "skill-dispatch,--json,--surface" || !SURFACES.has(args[4])) invalid();
  const env = binding.environment;
  if (!env || typeof env !== "object" || Array.isArray(env)
      || Object.keys(env).some((key) => key !== "ELECTRON_RUN_AS_NODE")
      || (Object.hasOwn(env, "ELECTRON_RUN_AS_NODE") && env.ELECTRON_RUN_AS_NODE !== "1")) invalid();
  const a = binding.request_activation;
  if (!a || Object.keys(a).sort().join() !== "guard_fingerprint,owner,policy_version"
      || a.owner !== "request_activation_contract" || a.policy_version !== 1
      || !/^sha256:[a-f0-9]{64}$/u.test(a.guard_fingerprint)) invalid();
  const route = binding.route_source_after_activation;
  if (binding.route_source_after_activation !== undefined && (!route || Object.keys(route).sort().join() !== "path,relative_to"
      || route.relative_to !== "validator_directory"
      || !["../meta/contracts/request-activation.md", "../copilot-skills/contracts/request-activation.md"].includes(route.path))) invalid();
  return binding;
}

export function createDispatchBinding({ validator, surface, expectedVersion, requestActivation, routeSource,
  executable, versions }, { probe, stat = statSync } = {}) {
  if (typeof probe !== "function") throw new Error("runtime_unavailable");
  fileIdentity(validator, stat);
  const launch = probe({ executable, versions });
  const binding = {
    schema_version: "2",
    executable: launch.executable,
    argv_prefix: Object.freeze([validator, "skill-dispatch", "--json", "--surface", surface]),
    environment: launch.environment,
    arguments: skillDispatchArgumentGrammar(),
    expected_version: expectedVersion,
    request_activation: Object.freeze({ ...requestActivation }),
    ...(routeSource ? { route_source_after_activation: Object.freeze({ ...routeSource }) } : {}),
    authorizes: false,
  };
  validateDispatchBinding(binding);
  return Object.freeze(binding);
}

export function unavailableDispatchContext() {
  return 'AGDF dispatch: {"outcome":"dispatcher_unavailable","authorizes":false,"recovery":"Repair the installed runtime and restart; do not infer an executable or environment."}';
}
