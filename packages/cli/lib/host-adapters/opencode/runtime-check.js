export function openCodeRuntimeCheckEvidence({ capabilityIdentity, observedIdentity, packageLoadable, hookObserved }) {
  if (!packageLoadable) return { status: "unavailable", reason: "unsupported_host_capability" };
  if (observedIdentity !== capabilityIdentity) return { status: "renewal_required", reason: "installed_identity_mismatch" };
  if (!hookObserved) return { status: "degraded", reason: "host_permission_unverified" };
  return { status: "enabled", capability_identity: capabilityIdentity, reason: "none" };
}

import { join } from "node:path";
import process from "node:process";
import { defaultOpenCodeConfigDir, resolveOpenCodeInstalledPackage } from "../../installers/opencode.js";
import { pluginDefinition } from "../../cli/runtime-context.js";

export function openCodeRuntimeSource() {
  return resolveOpenCodeInstalledPackage(defaultOpenCodeConfigDir(), pluginDefinition.opencode.npmPackage);
}

export function executeOpenCodeRuntimeCheck({ directory, dataRoot, packageRoot, run, executable, statusResolver, entrypointExists }) {
  const status = statusResolver(dataRoot, "opencode");
  if (status.requested !== "enabled" || status.effective !== "decision_required") {
    return { ...status, ran: false, output: "" };
  }
  const entrypoint = join(packageRoot, "generated", "plugins", "agdf", "runtime", "agdf-session-check.js");
  if (!entrypointExists(entrypoint)) {
    return { ...status, effective: "unavailable", reason: "unsupported_host_capability", verification: "entrypoint_missing", ran: false, output: "" };
  }
  const child = run(executable, [entrypoint], {
    cwd: directory,
    env: { ...process.env, AGDF_SURFACE: "opencode" },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 10000,
    maxBuffer: 1024 * 1024,
  });
  const output = String(child.stdout || "").trim().slice(0, 20000);
  if (child.status !== 0 || !output.includes("AGDF automatic runtime check:")) {
    return { ...status, effective: "degraded", reason: "host_permission_unverified", verification: "execution_failed", ran: true, output: "" };
  }
  return { ...status, effective: "enabled", reason: "none", verification: "host_observed", ran: true, output };
}
