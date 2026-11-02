import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { dirname, isAbsolute } from "node:path";
import process from "node:process";
const PROBE = 'process.stdout.write("AGDF_RUNTIME_OK:"+process.versions.node)';
const RUNTIME_PROBE_TIMEOUT_MS = 5_000;
const text = value => typeof value === "string" && value.length > 0 && value.length <= 4096 && !/[\r\n\0]/u.test(value);
const absolute = value => text(value) && isAbsolute(value);
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
      timeout: RUNTIME_PROBE_TIMEOUT_MS, maxBuffer: 4096, windowsHide: true,
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

