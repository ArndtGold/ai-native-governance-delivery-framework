import { execFileSync } from "node:child_process";
import { realpathSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { pluginDefinition } from "../cli/runtime-context.js";
import { defaultAgdfDataRoot } from "../installers/local-marketplace.js";
import {
  createMcpRegistrationSpec,
  createMcpRegistrationTransaction,
  inspectMcpRegistration,
} from "./host-config.js";
import {
  inspectMcpServerPackage,
  mcpRuntimeDataRoot,
  prepareMcpServerPackage,
  createMcpRuntimeReferenceTransaction,
  createMcpRuntimeRetirementTransaction,
} from "./package.js";

const ACTIONS = new Set(["status", "enable", "disable"]);
const SURFACES = new Set(["codex", "claude", "opencode"]);
const SCOPES = new Set(["project", "user"]);
const FALLBACK = "Use the existing version-matched AGDF CLI skill-dispatch path.";

function scopeEffect(scope, target) {
  return scope === "user"
    ? "Registers AGDF MCP for the selected host across the current user's projects."
    : `Registers AGDF MCP only for the selected project target: ${target}`;
}

function major(version) {
  return Number.parseInt(String(version).split(".")[0], 10);
}

function failure({ action, surface, scope, target, code, runtime, registration, host = null }) {
  return Object.freeze({
    schema_version: 1,
    operation: `mcp.${action}`,
    result: "failed",
    surface,
    scope,
    scope_effect: scopeEffect(scope, target),
    target,
    authorizes: false,
    host,
    runtime,
    registration,
    changes: [],
    fallback: FALLBACK,
    next_action: "Resolve the reported MCP lifecycle failure and retry the same explicit action.",
    diagnostics: [{ code }],
  });
}

function resultEnvelope({ action, result, surface, scope, target, execPath, nodeVersion, runtime, registration, changes = [], nextAction, host = null }) {
  return Object.freeze({
    schema_version: 1,
    operation: `mcp.${action}`,
    result,
    surface,
    scope,
    scope_effect: scopeEffect(scope, target),
    target,
    authorizes: false,
    host,
    permission_effect: "The local MCP process inherits the launching host user's filesystem permissions.",
    runtime: {
      node_executable: execPath,
      node_version: nodeVersion,
      package_status: runtime.status,
      version: runtime.version ?? pluginDefinition.version,
      digest: runtime.digest ?? null,
      entrypoint: runtime.entrypoint ?? null,
    },
    registration,
    changes,
    fallback: FALLBACK,
    next_action: nextAction,
    diagnostics: [],
  });
}

function registrationReference({ surface, scope, target, path }) {
  return Object.freeze({ surface, scope, target, path });
}

function sameReference(left, right) {
  return left?.surface === right.surface
    && left?.scope === right.scope
    && left?.target === right.target
    && left?.path === right.path;
}

function inspectPreviousOwnedRuntime({ registration, runtimeDataRoot, surface, scope, target, inspectPackage }) {
  const observed = registration?.observed;
  if (!observed || typeof observed.command !== "string" || !Array.isArray(observed.args)
      || observed.args.length !== 3 || observed.args[1] !== "--surface" || observed.args[2] !== surface) {
    return null;
  }
  const entrypoint = observed.args[0];
  if (!isAbsolute(observed.command) || !isAbsolute(entrypoint)) return null;
  const path = relative(resolve(runtimeDataRoot), resolve(entrypoint));
  const parts = path.split(sep);
  if (parts.length !== 6
      || parts[1] !== "node_modules" || parts[2] !== "@agdf" || parts[3] !== "mcp-server"
      || parts[4] !== "bin" || parts[5] !== "agdf-mcp.js"
      || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(parts[0])) return null;
  const previous = inspectPackage({ dataRoot: runtimeDataRoot, expectedVersion: parts[0] });
  const reference = registrationReference({ surface, scope, target, path: registration.path });
  if (previous.status !== "matched" || previous.entrypoint !== resolve(entrypoint)
      || previous.nodeExecutable !== observed.command
      || !previous.references.some((item) => sameReference(item, reference))) return null;
  return previous;
}

function runtimeReferenceChange(runtime, reference, { remove = false } = {}) {
  const references = remove
    ? runtime.references.filter((item) => !sameReference(item, reference))
    : [...runtime.references.filter((item) => !sameReference(item, reference)), reference];
  return {
    references,
    transaction: references.length
      ? createMcpRuntimeReferenceTransaction(runtime, references)
      : createMcpRuntimeRetirementTransaction(runtime),
  };
}

function inspectOpenCodeHost(exec, target) {
  try {
    const output = String(exec("opencode", ["--version"], {
      cwd: target,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })).trim();
    const version = output.match(/\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/)?.[0];
    const majorVersion = Number.parseInt(version?.split(".")[0], 10);
    if (!version || ![1, 2].includes(majorVersion)) {
      return Object.freeze({ status: "unsupported", version: version ?? null, config_variant: null });
    }
    return Object.freeze({
      status: "detected",
      version,
      config_variant: majorVersion >= 2 ? "nested_v2" : "flat_v1",
    });
  } catch {
    return Object.freeze({ status: "unavailable", version: null, config_variant: null });
  }
}

function inspectClaudeHost(exec, target) {
  try {
    const output = String(exec("claude", ["--version"], {
      cwd: target,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })).trim();
    const version = output.match(/\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/)?.[0];
    return Object.freeze({
      status: version ? "detected" : "unsupported",
      version: version ?? null,
      config_variant: "native_cli",
    });
  } catch {
    return Object.freeze({ status: "unavailable", version: null, config_variant: null });
  }
}

export function runMcpLifecycle({
  action,
  surface,
  scope = "project",
  target,
  env = process.env,
  execPath = process.execPath,
  nodeVersion = process.versions.node,
  exec = execFileSync,
  prepare = prepareMcpServerPackage,
  inspectPackage = inspectMcpServerPackage,
} = {}) {
  if (!ACTIONS.has(action) || !SURFACES.has(surface) || !SCOPES.has(scope) || !isAbsolute(target || "")) {
    throw new Error("AGDF_MCP_LIFECYCLE_INPUT_INVALID");
  }
  let selectedTarget;
  try {
    selectedTarget = realpathSync(resolve(target));
    if (!statSync(selectedTarget).isDirectory()) throw new Error("not_directory");
  } catch {
    throw new Error("AGDF_MCP_TARGET_INVALID");
  }
  const expectedVersion = pluginDefinition.version;
  const dataRoot = defaultAgdfDataRoot({ env });
  const runtimeDataRoot = mcpRuntimeDataRoot({
    dataRoot,
    scope,
    target: selectedTarget,
    surface,
  });
  const observedMajor = major(nodeVersion);
  if (!Number.isInteger(observedMajor) || observedMajor < 20) {
    return resultEnvelope({
      action,
      result: "manual_compatible",
      surface,
      scope,
      target: selectedTarget,
      execPath,
      nodeVersion,
      runtime: { status: "node_unsupported", version: expectedVersion },
      registration: { status: "not_evaluated", path: null },
      nextAction: `Use Node.js 20 or later to ${action === "enable" ? "enable" : "inspect"} AGDF MCP. ${FALLBACK}`,
    });
  }

  const host = surface === "opencode"
    ? inspectOpenCodeHost(exec, selectedTarget)
    : surface === "claude" ? inspectClaudeHost(exec, selectedTarget) : null;
  if (["opencode", "claude"].includes(surface) && host.status !== "detected") {
    return resultEnvelope({
      action,
      result: "manual_compatible",
      surface,
      scope,
      target: selectedTarget,
      execPath,
      nodeVersion,
      runtime: { status: "not_evaluated", version: expectedVersion },
      registration: { status: "not_evaluated", path: null },
      nextAction: surface === "opencode"
        ? `Install a supported OpenCode 1.x or 2.x host, then retry. ${FALLBACK}`
        : `Install an available Claude Code host, then retry. ${FALLBACK}`,
      host,
    });
  }

  let runtime = inspectPackage({ dataRoot: runtimeDataRoot, expectedVersion });
  const expectedEntrypoint = runtime.entrypoint
    ?? join(runtimeDataRoot, expectedVersion, "node_modules", "@agdf", "mcp-server", "bin", "agdf-mcp.js");
  let spec = createMcpRegistrationSpec({
    surface,
    target: selectedTarget,
    runtime: { ...runtime, version: expectedVersion, entrypoint: expectedEntrypoint },
    execPath,
    host,
  });
  let registration;
  try {
    registration = inspectMcpRegistration({ surface, scope, target: selectedTarget, spec, env, exec });
  } catch {
    return failure({ action, surface, scope, target: selectedTarget, code: "registration_inspection_failed", runtime, registration: null, host });
  }
  const previousRuntime = runtime.status === "matched" && registration.status === "matched"
    ? null
    : inspectPreviousOwnedRuntime({
      registration,
      runtimeDataRoot,
      surface,
      scope,
      target: selectedTarget,
      inspectPackage,
    });
  const previousSpec = previousRuntime ? Object.freeze({
    ...spec,
    command: registration.observed.command,
    args: Object.freeze([...registration.observed.args]),
    version: previousRuntime.version,
    digest: previousRuntime.digest,
  }) : null;

  if (action === "status") {
    const state = runtime.status === "matched" && registration.status === "matched"
      ? "configured_unverified"
      : registration.status === "absent" ? "not_configured" : "degraded";
    return resultEnvelope({
      action,
      result: state,
      surface,
      scope,
      target: selectedTarget,
      execPath,
      nodeVersion,
      runtime,
      registration,
      nextAction: state === "configured_unverified"
        ? "Restart the selected host and verify discovery in a fresh session."
        : `${FALLBACK} Run mcp enable explicitly to configure this scope.`,
      host,
    });
  }

  if (action === "enable") {
    let prepared;
    let transaction;
    let referenceTransaction;
    let previousRuntimeTransaction;
    try {
      prepared = prepare({ dataRoot: runtimeDataRoot, expectedVersion, execPath, nodeVersion, exec });
      runtime = prepared;
      spec = createMcpRegistrationSpec({ surface, target: selectedTarget, runtime, execPath, host });
      transaction = createMcpRegistrationTransaction({
        action, surface, scope, target: selectedTarget, spec, previousSpec, env, exec,
      });
      transaction.apply();
      const verified = inspectMcpRegistration({ surface, scope, target: selectedTarget, spec, env, exec });
      if (verified.status !== "matched") throw new Error("AGDF_MCP_REGISTRATION_VERIFICATION_FAILED");
      const reference = registrationReference({ surface, scope, target: selectedTarget, path: verified.path });
      referenceTransaction = runtimeReferenceChange(prepared, reference).transaction;
      referenceTransaction.apply();
      if (previousRuntime && previousRuntime.root !== prepared.root) {
        previousRuntimeTransaction = runtimeReferenceChange(previousRuntime, reference, { remove: true }).transaction;
        previousRuntimeTransaction.apply();
      }
      prepared.commit();
      referenceTransaction.commit();
      previousRuntimeTransaction?.commit();
      return resultEnvelope({
        action,
        result: "configured_pending_restart",
        surface,
        scope,
        target: selectedTarget,
        execPath,
        nodeVersion,
        runtime: inspectPackage({ dataRoot: runtimeDataRoot, expectedVersion }),
        registration: verified,
        changes: [
          ...(prepared.changed ? [{ kind: "runtime_install", path: prepared.root }] : []),
          ...(transaction.status === "changed" ? [{ kind: "host_registration", path: verified.path }] : []),
        ],
        nextAction: "Restart the selected host and verify agdf_dispatch in a fresh session.",
        host,
      });
    } catch (error) {
      try { previousRuntimeTransaction?.rollback?.(); } catch {}
      try { referenceTransaction?.rollback?.(); } catch {}
      transaction?.rollback?.();
      prepared?.rollback?.();
      return failure({
        action, surface, scope, target: selectedTarget,
        code: /^[A-Z0-9_]+$/u.test(error?.message ?? "") ? error.message.toLowerCase() : "enable_failed",
        runtime, registration, host,
      });
    }
  }

  let transaction;
  let runtimeTransaction;
  try {
    const ownedRuntime = runtime.status === "matched" ? runtime : previousRuntime;
    transaction = createMcpRegistrationTransaction({
      action, surface, scope, target: selectedTarget, spec, previousSpec, env, exec,
    });
    transaction.apply();
    const verified = inspectMcpRegistration({ surface, scope, target: selectedTarget, spec, env, exec });
    if (verified.status !== "absent") throw new Error("AGDF_MCP_DISABLE_VERIFICATION_FAILED");
    const changes = transaction.status === "changed" ? [{ kind: "host_registration_remove", path: verified.path }] : [];
    if (ownedRuntime?.status === "matched") {
      const reference = registrationReference({ surface, scope, target: selectedTarget, path: transaction.path });
      const change = runtimeReferenceChange(ownedRuntime, reference, { remove: true });
      runtimeTransaction = change.transaction;
      runtimeTransaction.apply();
      if (!change.references.length) changes.push({ kind: "runtime_remove", path: ownedRuntime.root });
      runtime = change.references.length
        ? { ...ownedRuntime, references: Object.freeze(change.references) }
        : { ...ownedRuntime, status: "absent", entrypoint: null, digest: null, references: Object.freeze([]) };
    }
    runtimeTransaction?.commit?.();
    return resultEnvelope({
      action,
      result: "disabled",
      surface,
      scope,
      target: selectedTarget,
      execPath,
      nodeVersion,
      runtime,
      registration: verified,
      changes,
      nextAction: FALLBACK,
      host,
    });
  } catch (error) {
    try { runtimeTransaction?.rollback?.(); } catch {}
    transaction?.rollback?.();
    return failure({
      action, surface, scope, target: selectedTarget,
      code: /^[A-Z0-9_]+$/u.test(error?.message ?? "") ? error.message.toLowerCase() : "disable_failed",
      runtime, registration, host,
    });
  }
}

export function printMcpLifecycleResult(report, { json = false, io = console } = {}) {
  if (json) io.log(JSON.stringify(report, null, 2));
  else io.log([
    "AGDF MCP lifecycle",
    `Operation: ${report.operation}`,
    `Result: ${report.result}`,
    `Surface: ${report.surface}`,
    `Scope: ${report.scope}`,
    `Scope effect: ${report.scope_effect}`,
    `Target: ${report.target}`,
    `Authorizes: ${report.authorizes}`,
    `Runtime: ${report.runtime?.package_status ?? report.runtime?.status ?? "unknown"}`,
    `Registration: ${report.registration?.status ?? "unknown"}`,
    `Next action: ${report.next_action}`,
  ].join("\n"));
}
