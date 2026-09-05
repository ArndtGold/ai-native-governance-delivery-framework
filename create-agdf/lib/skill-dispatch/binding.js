import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { dirname, isAbsolute } from "node:path";
import process from "node:process";
import { skillDispatchArgumentGrammar } from "../cli/command-registry.js";

const SURFACES = new Set(["codex", "claude", "copilot", "opencode"]);
const PROBE = 'process.stdout.write("AGDF_RUNTIME_OK:"+process.versions.node)';
const text = (value) => typeof value === "string" && value.length > 0 && value.length <= 4096 && !/[\r\n\0]/u.test(value);
const absolute = (value) => text(value) && isAbsolute(value);

export function runtimeEnvironment(versions = process.versions) {
  if (!text(versions.node)) throw new Error("unsupported_runtime");
  return Object.freeze(versions.electron ? { ELECTRON_RUN_AS_NODE: "1" } : {});
}

function fileIdentity(path, stat) {
  if (!absolute(path)) throw new Error("runtime_unavailable");
  try {
    const s = stat(path);
    if (!s.isFile()) throw new Error();
    return [s.dev, s.ino, s.size, s.mtimeMs, s.ctimeMs];
  } catch { throw new Error("runtime_unavailable"); }
}

export function createRuntimeProbe({ spawn = spawnSync, stat = statSync } = {}) {
  let cached;
  return ({ executable = process.execPath, versions = process.versions } = {}) => {
    const environment = runtimeEnvironment(versions);
    // Bootstrap options can execute preload modules before the fixed probe. Never probe
    // an inherited module-loading configuration or silently change the advertised tuple.
    if (process.env.NODE_OPTIONS || process.env.NODE_PATH) {
      cached = null;
      throw new Error("runtime_bootstrap_environment_unsupported");
    }
    const identity = JSON.stringify([executable, fileIdentity(executable, stat), versions.node,
      versions.electron ?? null, versions.bun ?? null, environment,
      process.env.NODE_OPTIONS ?? null, process.env.NODE_PATH ?? null]);
    if (cached?.identity === identity) return cached.launch;
    cached = null;
    const child = spawn(executable, ["-e", PROBE], {
      cwd: dirname(executable), env: { ...process.env, ...environment },
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: false,
      timeout: 1000, maxBuffer: 4096, windowsHide: true,
    });
    // Electron may emit OS diagnostics on stderr despite a successful exact probe.
    // Nonzero exit, signal, timeout, output overflow and unexpected stdout still fail.
    if (child.error || child.status !== 0 || child.signal
        || child.stdout !== `AGDF_RUNTIME_OK:${versions.node}`) {
      throw new Error("runtime_probe_failed");
    }
    // Do not cache a tuple whose executable was replaced during the probe.
    const after = JSON.stringify([executable, fileIdentity(executable, stat), versions.node,
      versions.electron ?? null, versions.bun ?? null, environment,
      process.env.NODE_OPTIONS ?? null, process.env.NODE_PATH ?? null]);
    if (after !== identity) throw new Error("runtime_identity_changed");
    const launch = Object.freeze({ executable, environment });
    cached = { identity, launch };
    return launch;
  };
}

const probeRuntime = createRuntimeProbe();

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
  executable = process.execPath, versions = process.versions }, { probe = probeRuntime, stat = statSync } = {}) {
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
