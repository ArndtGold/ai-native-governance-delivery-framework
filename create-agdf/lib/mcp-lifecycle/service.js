import { execFileSync } from "node:child_process";
import { realpathSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { pluginDefinition } from "../cli/runtime-context.js";
import { defaultAgdfDataRoot } from "../installers/local-marketplace.js";
import {
  createMcpRegistrationSpec,
  createMcpRegistrationTransaction,
  createMcpReferenceIdentity,
  inspectMcpHost,
  inspectMcpRegistration,
  mcpPermissionEffect,
  mcpNativeScope,
} from "./host-config.js";
import {
  createMcpRuntimeReferenceTransaction,
  createMcpRuntimeRetirementTransaction,
  inspectMcpServerPackage,
  mcpLegacyRuntimeDataRoot,
  mcpRuntimeDataRoot,
  prepareMcpServerPackage,
} from "./package.js";
import { printMcpLifecycleResult } from "./presentation.js";
import { mcpCapabilityProfile } from "./profile-context.js";
import { createMcpLifecycleResult } from "./result.js";

const ACTIONS = new Set(["status", "enable", "disable"]);
const SURFACES = new Set(["codex", "claude", "opencode", "copilot"]);
const SCOPES = new Set(["project", "user"]);

function major(version) { return Number.parseInt(String(version).split(".")[0], 10); }

function capabilityFor({ surface, host, nodeVersion, scope, registration, runtime, expectedVersion }) {
  if (!Number.isInteger(major(nodeVersion)) || major(nodeVersion) < 20) return "manual_compatible";
  if (host?.status === "unavailable") return "unavailable";
  if (host?.status === "unsupported") return "unsupported";
  const entrypointIdentity = runtime?.status === "matched" && runtime.digest && expectedVersion
    ? `${expectedVersion}:${runtime.digest}` : null;
  const qualified = mcpCapabilityProfile.qualification.records.some((record) => record.surface === surface
    && record.host_version === host?.version
    && record.client_variant === host?.client_variant
    && record.configuration_variant === host?.config_variant
    && record.os === process.platform
    && record.arch === process.arch
    && record.requested_scope === scope
    && record.native_scope === registration?.native_scope
    && record.configuration_source === registration?.selected_source
    && record.node_version === nodeVersion
    && record.server_version === expectedVersion
    && record.dispatcher_version === expectedVersion
    && record.sdk_version === "2.0.0"
    && record.entrypoint_identity === entrypointIdentity
    && record.capability === "supported");
  return qualified ? "supported" : "unverified";
}

function runtimeResult(runtime, { execPath, nodeVersion, expectedVersion }) {
  return {
    node_executable: execPath,
    node_version: nodeVersion,
    package_status: runtime.status,
    version: runtime.version ?? expectedVersion,
    digest: runtime.digest ?? null,
    entrypoint: runtime.entrypoint ?? null,
    marker_schema_version: runtime.markerSchemaVersion ?? null,
  };
}

function normalizedRegistration(registration, { surface, scope }) {
  if (registration) return registration;
  return { status: "invalid", selected_status: "invalid", effective_status: "invalid",
    selected_source: "unknown", effective_source: "unknown", sources: [], path: null,
    native_scope: mcpNativeScope(surface, scope) };
}

function envelope({ action, result, surface, scope, target, capability, host, execPath, nodeVersion,
  expectedVersion, runtime, registration, discovery = "not_checked", changes = [], diagnostics = [], nextAction,
  permissionEffect }) {
  const discoveryState = typeof discovery === "string"
    ? { status: discovery, source: discovery === "pending_restart" ? "configuration" : "none", evidence_ref: null }
    : discovery;
  return createMcpLifecycleResult({ action, result, surface, scope, scopeEffect: scope, target, capability, host,
    runtime: runtimeResult(runtime, { execPath, nodeVersion, expectedVersion }),
    registration: normalizedRegistration(registration, { surface, scope }),
    discovery: discoveryState, changes, diagnostics, nextAction, permissionEffect });
}

function failure(input, code, additionalDiagnostics = []) {
  return envelope({ ...input, result: "failed", discovery: "not_checked",
    diagnostics: [{ code }, ...additionalDiagnostics], nextAction: { code: "resolve_failure" } });
}

function registrationReference({ surface, scope, target, registration, createdConfig = false }) {
  return createMcpReferenceIdentity({ surface, scope, target, registration, createdConfig });
}

function sameReference(left, right) {
  if (left?.native_scope) {
    return left.surface === right.surface && left.native_scope === right.native_scope
      && left.source === right.source && (right.native_scope === "user" || left.target === right.target);
  }
  return left?.surface === right.surface && left?.scope === (right.native_scope === "local" ? "project" : right.native_scope)
    && left?.target === (right.target ?? left?.target) && left?.path === right.path;
}

function referenceKey(reference) {
  return [reference?.surface ?? "", reference?.native_scope ?? reference?.scope ?? "",
    reference?.source ?? reference?.path ?? "", reference?.target ?? ""].join("\0");
}

function runtimeReferenceChange(runtime, reference, {
  remove = false,
  createReferenceTransaction = createMcpRuntimeReferenceTransaction,
  createRetirementTransaction = createMcpRuntimeRetirementTransaction,
} = {}) {
  const candidates = remove
    ? runtime.references.filter((item) => !sameReference(item, reference))
    : [...runtime.references.filter((item) => !sameReference(item, reference)), reference];
  const references = [...new Map(candidates.map((item) => [referenceKey(item), item])).values()]
    .sort((left, right) => referenceKey(left).localeCompare(referenceKey(right)));
  return { references, transaction: references.length
    ? createReferenceTransaction(runtime, references)
    : createRetirementTransaction(runtime) };
}

function ownedRuntimeAt({ registration, runtimeDataRoot, surface, scope, target, inspectPackage }) {
  const observed = registration?.observed;
  if (!observed || typeof observed.command !== "string" || !Array.isArray(observed.args)
      || observed.args.length !== 3 || observed.args[1] !== "--surface" || observed.args[2] !== surface) return null;
  const entrypoint = observed.args[0];
  if (!isAbsolute(observed.command) || !isAbsolute(entrypoint)) return null;
  const path = relative(resolve(runtimeDataRoot), resolve(entrypoint));
  const parts = path.split(sep);
  if (parts.length !== 6 || parts[1] !== "node_modules" || parts[2] !== "@agdf" || parts[3] !== "mcp-server"
      || parts[4] !== "bin" || parts[5] !== "agdf-mcp.js" || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(parts[0])) return null;
  const previous = inspectPackage({ dataRoot: runtimeDataRoot, expectedVersion: parts[0] });
  const reference = registrationReference({ surface, scope, target, registration });
  if (previous.status !== "matched" || previous.entrypoint !== resolve(entrypoint)
      || previous.nodeExecutable !== observed.command
      || !previous.references.some((item) => sameReference(item, reference))) return null;
  return previous;
}

function inspectPreviousOwnedRuntime(input) {
  const roots = [input.runtimeDataRoot, input.legacyRuntimeDataRoot];
  for (const runtimeDataRoot of roots) {
    const runtime = ownedRuntimeAt({ ...input, runtimeDataRoot });
    if (runtime) return runtime;
  }
  return null;
}

function nextForRegistration(registration) {
  if (registration.status === "precedence_conflict") return "resolve_precedence";
  if (registration.selected_status === "absent" && registration.effective_source === "user"
      && registration.effective_status !== "absent") return "inspect_effective_scope";
  if (["foreign", "owned_mismatch", "invalid"].includes(registration.status)) return "resolve_registration";
  return "enable_scope";
}

function rollbackTransactions(transactions) {
  let complete = true;
  for (const transaction of transactions) {
    try { transaction?.rollback?.(); } catch { complete = false; }
  }
  return complete;
}

export function runMcpLifecycle({
  action, surface, scope = "project", target, env = process.env, execPath = process.execPath,
  nodeVersion = process.versions.node, exec = execFileSync, prepare = prepareMcpServerPackage,
  inspectPackage = inspectMcpServerPackage,
  inspectRegistration = inspectMcpRegistration,
  createRegistrationTransaction = createMcpRegistrationTransaction,
  createReferenceTransaction = createMcpRuntimeReferenceTransaction,
  createRetirementTransaction = createMcpRuntimeRetirementTransaction,
} = {}) {
  if (!ACTIONS.has(action) || !SURFACES.has(surface) || !SCOPES.has(scope) || !isAbsolute(target || "")) {
    throw new Error("AGDF_MCP_LIFECYCLE_INPUT_INVALID");
  }
  let selectedTarget;
  try { selectedTarget = realpathSync(resolve(target)); if (!statSync(selectedTarget).isDirectory()) throw new Error("not_directory"); }
  catch { throw new Error("AGDF_MCP_TARGET_INVALID"); }

  const expectedVersion = pluginDefinition.version;
  const dataRoot = defaultAgdfDataRoot({ env });
  const runtimeDataRoot = mcpRuntimeDataRoot({ dataRoot, scope, target: selectedTarget });
  const legacyRuntimeDataRoot = mcpLegacyRuntimeDataRoot({ dataRoot, scope, target: selectedTarget, surface });
  const base = { action, surface, scope, target: selectedTarget, execPath, nodeVersion, expectedVersion,
    permissionEffect: mcpPermissionEffect(surface, { scope, target: selectedTarget }) };

  if (!Number.isInteger(major(nodeVersion)) || major(nodeVersion) < 20) {
    return envelope({ ...base, capability: "manual_compatible", host: null,
      runtime: { status: "node_unsupported", version: expectedVersion }, registration: null,
      result: "not_configured", nextAction: { code: "use_node_20" } });
  }

  const host = inspectMcpHost({ surface, target: selectedTarget, exec });
  let capability = capabilityFor({ surface, host, nodeVersion });
  if (capability === "unsupported" || (capability === "unavailable"
      && (action === "enable" || surface === "claude"))) {
    return envelope({ ...base, capability, host, runtime: { status: "not_evaluated", version: expectedVersion },
      registration: null, result: "not_configured", nextAction: { code: "install_host" } });
  }

  let runtime = inspectPackage({ dataRoot: runtimeDataRoot, expectedVersion });
  const expectedEntrypoint = runtime.entrypoint
    ?? join(runtimeDataRoot, expectedVersion, "node_modules", "@agdf", "mcp-server", "bin", "agdf-mcp.js");
  let spec = createMcpRegistrationSpec({ surface, scope, target: selectedTarget,
    runtime: { ...runtime, version: expectedVersion, entrypoint: expectedEntrypoint }, execPath, host });
  let registration;
  try { registration = inspectRegistration({ surface, scope, target: selectedTarget, spec, env, exec }); }
  catch { return failure({ ...base, capability, host, runtime, registration: null }, "registration_inspection_failed"); }
  capability = capabilityFor({ surface, host, nodeVersion, scope, registration, runtime, expectedVersion });

  const previousRuntime = runtime.status === "matched" && registration.selected_status === "matched" ? null
    : inspectPreviousOwnedRuntime({ registration, runtimeDataRoot, legacyRuntimeDataRoot, surface, scope,
      target: selectedTarget, inspectPackage });
  const previousSpec = previousRuntime ? Object.freeze({ ...spec, command: registration.observed.command,
    args: Object.freeze([...registration.observed.args]), version: previousRuntime.version,
    digest: previousRuntime.digest, reference: previousRuntime.references.find((item) => item.surface === surface) ?? null }) : null;

  if (action === "status") {
    const result = runtime.status === "matched" && registration.status === "matched"
      ? "configured_unverified"
      : registration.status === "absent" ? "not_configured" : "degraded";
    return envelope({ ...base, capability, host, runtime, registration, result,
      nextAction: { code: result === "configured_unverified" ? "restart_host" : nextForRegistration(registration) } });
  }

  if (action === "enable") {
    let prepared;
    let transaction;
    let referenceTransaction;
    let previousRuntimeTransaction;
    try {
      if (registration.status === "precedence_conflict") throw new Error("AGDF_MCP_REGISTRATION_PRECEDENCE_CONFLICT");
      prepared = prepare({ dataRoot: runtimeDataRoot, expectedVersion, execPath, nodeVersion, exec });
      runtime = prepared;
      spec = createMcpRegistrationSpec({ surface, scope, target: selectedTarget, runtime, execPath, host });
      transaction = createRegistrationTransaction({ action, surface, scope, target: selectedTarget, spec, previousSpec, env, exec });
      transaction.apply();
      const verified = inspectRegistration({ surface, scope, target: selectedTarget, spec, env, exec });
      if (verified.selected_status !== "matched" || verified.status === "precedence_conflict") throw new Error("AGDF_MCP_REGISTRATION_VERIFICATION_FAILED");
      const reference = registrationReference({ surface, scope, target: selectedTarget, registration: verified,
        createdConfig: transaction.createdConfig === true });
      referenceTransaction = runtimeReferenceChange(prepared, reference, {
        createReferenceTransaction, createRetirementTransaction,
      }).transaction;
      referenceTransaction.apply();
      if (previousRuntime && previousRuntime.root !== prepared.root) {
        previousRuntimeTransaction = runtimeReferenceChange(previousRuntime, reference, {
          remove: true, createReferenceTransaction, createRetirementTransaction,
        }).transaction;
        previousRuntimeTransaction.apply();
      }
      previousRuntimeTransaction?.commit(); referenceTransaction.commit(); prepared.commit();
      const installedRuntime = inspectPackage({ dataRoot: runtimeDataRoot, expectedVersion });
      const installedCapability = capabilityFor({ surface, host, nodeVersion, scope, registration: verified,
        runtime: installedRuntime, expectedVersion });
      return envelope({ ...base, capability: installedCapability, host, runtime: installedRuntime,
        registration: verified, discovery: "pending_restart", result: transaction.status === "unchanged" ? "unchanged" : "configured_pending_restart",
        changes: [...(prepared.changed ? [{ kind: "runtime_install", path: prepared.root }] : []),
          ...(transaction.status === "changed" ? [{ kind: "host_registration", path: verified.path }] : [])],
        nextAction: { code: "restart_host" } });
    } catch (error) {
      const rollbackComplete = rollbackTransactions([previousRuntimeTransaction, referenceTransaction, transaction, prepared]);
      const originalCode = /^[A-Z0-9_]+$/u.test(error?.message ?? "") ? error.message.toLowerCase() : "enable_failed";
      return failure({ ...base, capability, host, runtime, registration }, rollbackComplete ? originalCode : "rollback_incomplete",
        rollbackComplete ? [] : [{ code: originalCode }]);
    }
  }

  let transaction;
  let runtimeTransaction;
  try {
    if (registration.status === "precedence_conflict") throw new Error("AGDF_MCP_REGISTRATION_PRECEDENCE_CONFLICT");
    const ownedRuntime = runtime.status === "matched" ? runtime : previousRuntime;
    if (ownedRuntime?.status === "matched" && runtime.status !== "matched") {
      spec = createMcpRegistrationSpec({ surface, scope, target: selectedTarget, runtime: ownedRuntime, execPath, host });
    }
    transaction = createRegistrationTransaction({ action, surface, scope, target: selectedTarget, spec, previousSpec, env, exec });
    transaction.apply();
    const verified = inspectRegistration({ surface, scope, target: selectedTarget, spec, env, exec });
    if (verified.selected_status !== "absent") throw new Error("AGDF_MCP_DISABLE_VERIFICATION_FAILED");
    const changes = transaction.status === "changed" ? [{ kind: "host_registration_remove", path: verified.path }] : [];
    if (ownedRuntime?.status === "matched") {
      const reference = registrationReference({ surface, scope, target: selectedTarget,
        registration: { ...registration, path: transaction.path } });
      const change = runtimeReferenceChange(ownedRuntime, reference, {
        remove: true, createReferenceTransaction, createRetirementTransaction,
      });
      runtimeTransaction = change.transaction; runtimeTransaction.apply();
      if (!change.references.length) changes.push({ kind: "runtime_remove", path: ownedRuntime.root });
      runtime = change.references.length ? { ...ownedRuntime, references: Object.freeze(change.references) }
        : { ...ownedRuntime, status: "absent", entrypoint: null, digest: null, references: Object.freeze([]) };
    }
    runtimeTransaction?.commit?.();
    const result = verified.status === "matched" ? "configured_unverified"
      : verified.status !== "absent" ? "degraded"
        : transaction.status === "unchanged" && !changes.length ? "unchanged" : "disabled";
    return envelope({ ...base, capability, host, runtime, registration: verified,
      result, changes, nextAction: { code: result === "configured_unverified" ? "disable_effective_scope"
        : result === "degraded" ? nextForRegistration(verified) : "none" } });
  } catch (error) {
    const rollbackComplete = rollbackTransactions([runtimeTransaction, transaction]);
    const originalCode = /^[A-Z0-9_]+$/u.test(error?.message ?? "") ? error.message.toLowerCase() : "disable_failed";
    return failure({ ...base, capability, host, runtime, registration }, rollbackComplete ? originalCode : "rollback_incomplete",
      rollbackComplete ? [] : [{ code: originalCode }]);
  }
}

export { printMcpLifecycleResult };
