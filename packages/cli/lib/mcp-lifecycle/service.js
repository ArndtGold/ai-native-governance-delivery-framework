import { execHostFileSync } from "../host-command.js";
import { realpathSync, statSync, readFileSync, lstatSync, existsSync } from "node:fs";
import { createHash } from 'node:crypto';
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { pluginDefinition } from "../cli/runtime-context.js";
import { defaultAgdfDataRoot, settleCodexCockpitPublication } from "../installers/local-marketplace.js";
import {
  createMcpRegistrationSpec,
  createMcpRegistrationTransaction,
  createMcpReferenceIdentity,
  inspectMcpHost,
  inspectMcpRegistration,
  mcpPermissionEffect,
  mcpNativeScope,
  resolveMcpSources,
} from "./host-config.js";
import {
  createMcpRuntimeReferenceTransaction,
  createMcpRuntimeRetirementTransaction,
  inspectMcpServerPackage,
  inspectMcpExecutableRoot,
  mcpLegacyRuntimeDataRoot,
  mcpRuntimeDataRoot,
  prepareMcpServerPackage,
  mcpRuntimeRetirementState,
} from "./package.js";
import { printMcpLifecycleResult } from "./presentation.js";
import { mcpCapabilityProfile } from "./profile-context.js";
import { createMcpLifecycleResult } from "./result.js";
import { inspectCodexSetup, createCodexCockpitTransition, inspectCodexCockpitPlugin } from './adapters/codex.js';
import { validateCockpitTransitionEvidence } from './evidence.js';
import { resolveControlCommandTarget } from '#agdf-core/control-state/approval-command-contract.js';
import { pluginMcpRuntimeIdentity } from './plugin-runtime.js';

const ACTIONS = new Set(["status", "enable", "disable"]);
const SURFACES = new Set(["codex", "claude", "opencode", "copilot"]);
const SCOPES = new Set(["project", "user"]);
export const PLUGIN_MANAGED_SURFACES = Object.freeze(["claude", "codex", "copilot"]);

function major(version) { return Number.parseInt(String(version).split(".")[0], 10); }

function capabilityFor({ surface, host, nodeVersion, scope, registration, runtime, expectedVersion }) {
  if (!Number.isInteger(major(nodeVersion)) || major(nodeVersion) < 22) return "manual_compatible";
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
  permissionEffect, setup, setupObserve }) {
  const discoveryState = typeof discovery === "string"
    ? { status: discovery, source: discovery === "pending_restart" ? "configuration" : "none", evidence_ref: null }
    : discovery;
  return createMcpLifecycleResult({ action, result, surface, scope, scopeEffect: scope, target, capability, host,
    runtime: runtimeResult(runtime, { execPath, nodeVersion, expectedVersion }),
    registration: normalizedRegistration(registration, { surface, scope }),
    discovery: discoveryState, changes, diagnostics, nextAction, permissionEffect,
    ...(setupObserve ? { setup: setupObserve() } : setup ? { setup } : {}) });
}

function failure(input, code, additionalDiagnostics = []) {
  return envelope({ ...input, result: "failed", discovery: "not_checked",
    diagnostics: [{ code }, ...additionalDiagnostics], nextAction: { code: "resolve_failure" } });
}

function registrationReference({ surface, scope, target, registration, createdConfig = false }) {
  return createMcpReferenceIdentity({ surface, scope, target, registration, createdConfig });
}

function sameReference(left, right) {
  if ((left?.role ?? 'governance') !== (right?.role ?? 'governance') || (left?.server_id ?? 'agdf') !== (right?.server_id ?? 'agdf')) return false;
  if (left?.native_scope) {
    return left.surface === right.surface && left.native_scope === right.native_scope
      && left.source === right.source && (right.native_scope === "user" || left.target === right.target);
  }
  return left?.surface === right.surface && left?.scope === (right.native_scope === "local" ? "project" : right.native_scope)
    && left?.target === (right.target ?? left?.target) && left?.path === right.path;
}

function referenceKey(reference) {
  return [reference?.surface ?? "", reference?.native_scope ?? reference?.scope ?? "",
    reference?.source ?? reference?.path ?? "", reference?.target ?? "", reference?.role ?? 'governance', reference?.server_id ?? 'agdf'].join("\0");
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
  const retained = !references.length && mcpRuntimeRetirementState(runtime.root) !== 'eligible';
  return { references, retained, transaction: references.length || retained
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
  nodeVersion = process.versions.node, exec = execHostFileSync, prepare = prepareMcpServerPackage,
  inspectPackage = inspectMcpServerPackage,
  inspectRegistration = inspectMcpRegistration,
  createRegistrationTransaction = createMcpRegistrationTransaction,
  createReferenceTransaction = createMcpRuntimeReferenceTransaction,
  createRetirementTransaction = createMcpRuntimeRetirementTransaction,
  // Hosts whose runtime plugin declares the AGDF MCP server itself; enable refuses a second registration.
  pluginManagedSurfaces = PLUGIN_MANAGED_SURFACES,
  role = 'governance', serverId, preparedRuntime, descriptor, retireCockpit, restoreCockpit, cockpitEvidence,
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
    ...(surface === 'codex' ? { setupObserve: () => inspectCodexSetup({ target: selectedTarget, env, pluginRoot: env.AGDF_DISPATCH_PLUGIN_ROOT }) } : {}),
    permissionEffect: mcpPermissionEffect(surface, { scope, target: selectedTarget }) };

  if (retireCockpit !== undefined || restoreCockpit !== undefined || cockpitEvidence !== undefined) {
    if (surface !== 'codex' || scope !== 'project' || role !== 'governance'
      || retireCockpit && restoreCockpit || (retireCockpit ? action !== 'disable' : !restoreCockpit || action !== 'enable')
      || !cockpitEvidence) throw Error('AGDF_MCP_COCKPIT_TRANSITION_INPUT_INVALID');
    const transitionBase = { ...base, capability: 'unverified', host: null,
      runtime: { status: 'not_evaluated', version: expectedVersion }, registration: null };
    try {
      const evidencePath = resolve(selectedTarget, cockpitEvidence);
      const containment = relative(join(selectedTarget, '.agdf/control/artefacts'), evidencePath);
      if (containment.startsWith('..') || isAbsolute(containment) || realpathSync(evidencePath) !== evidencePath
        || lstatSync(evidencePath).size > 65_536) throw Error('AGDF_MCP_COCKPIT_EVIDENCE_INVALID');
      const bytes = readFileSync(evidencePath, 'utf8'), evidence = JSON.parse(bytes);
      const digest = 'sha256:' + createHash('sha256').update(bytes).digest('hex');
      const id = retireCockpit ?? restoreCockpit;
      const revalidate = ({ allowCandidate = false } = {}) => {
        if (readFileSync(evidencePath, 'utf8') !== bytes) throw Error('AGDF_MCP_CODEX_SOURCE_CHANGED');
        const result = validateCockpitTransitionEvidence(evidence, { expected: {
          target_id: resolveControlCommandTarget(selectedTarget).target_id, legacy_id: id, version: expectedVersion } });
        if (!result.valid || evidence.host.os !== process.platform || evidence.host.arch !== process.arch)
          throw Error('AGDF_MCP_COCKPIT_EVIDENCE_INVALID');
        const readDigest = path => {
          if (!isAbsolute(path) || realpathSync(path) !== path || !lstatSync(path).isFile() || lstatSync(path).size > 4 * 1024 ** 2)
            throw Error('AGDF_MCP_COCKPIT_EVIDENCE_INVALID');
          return 'sha256:' + createHash('sha256').update(readFileSync(path)).digest('hex');
        };
        for (const ref of evidence.evidence) {
          const file = resolve(selectedTarget, ref.path), rel = relative(join(selectedTarget, '.agdf/control/artefacts'), file);
          if (rel.startsWith('..') || isAbsolute(rel) || readDigest(file) !== ref.digest) throw Error('AGDF_MCP_COCKPIT_EVIDENCE_INVALID');
        }
        if (env.AGDF_DISPATCH_PLUGIN_ROOT && (resolve(env.AGDF_DISPATCH_PLUGIN_ROOT) !== evidence.plugin_root
          || existsSync(env.AGDF_DISPATCH_PLUGIN_ROOT) && realpathSync(env.AGDF_DISPATCH_PLUGIN_ROOT) !== evidence.plugin_root))
          throw Error('AGDF_MCP_COCKPIT_EVIDENCE_INVALID');
        const installed = inspectCodexCockpitPlugin(evidence.plugin_root);
        const priorAbsent = restoreCockpit && evidence.previous_plugin_digest === null && !existsSync(evidence.plugin_root);
        const candidateCurrent = installed.status === 'matched' && installed.version === expectedVersion && installed.digest === evidence.plugin_digest;
        const previousCurrent = installed.status === 'matched' && installed.version === evidence.previous_plugin_version
          && installed.digest === evidence.previous_plugin_digest;
        if (restoreCockpit ? !(previousCurrent || priorAbsent || allowCandidate && candidateCurrent)
          : !candidateCurrent || !installed.declaration.mcpServers?.['agdf-cockpit'])
          throw Error('AGDF_MCP_COCKPIT_INSTALLATION_CHANGED');
        const candidate = inspectMcpExecutableRoot({ root: evidence.runtime_root, expectedVersion });
        if (candidate.status !== 'matched' || 'sha256:' + candidate.digest !== evidence.server_digest
          || 'sha256:' + candidate.dispatcherDigest !== evidence.dispatcher_digest
          || 'sha256:' + candidate.sdkDigest !== evidence.sdk_digest
          || readDigest(join(candidate.packageRoot, 'ui/cockpit.html')) !== evidence.ui_digest)
          throw Error('AGDF_MCP_COCKPIT_EVIDENCE_INVALID');
        // Prior runtime bytes remain verifiable after rollback, but a retirement
        // must describe the runtime shipped by the installed candidate itself.
        if (!restoreCockpit) {
          const shipped = pluginMcpRuntimeIdentity(evidence.plugin_root);
          if (candidate.version !== shipped.version || candidate.digest !== shipped.digest
            || candidate.dispatcherDigest !== shipped.dispatcherDigest || candidate.sdkDigest !== shipped.sdkDigest)
            throw Error('AGDF_MCP_COCKPIT_EVIDENCE_INVALID');
        }
        if (!restoreCockpit) {
          for (const origin of evidence.inventory.origins) {
            if (!isAbsolute(origin.path)) throw Error('AGDF_MCP_COCKPIT_EVIDENCE_INVALID');
            // Absent user/project files are explicitly covered with the empty-byte digest.
            const actual = existsSync(origin.path) ? readDigest(origin.path) : 'sha256:' + createHash('sha256').update('').digest('hex');
            if (actual !== origin.digest) throw Error('AGDF_MCP_CODEX_SOURCE_CHANGED');
          }
          if (!evidence.inventory.origins.some(ref => ref.path === join(evidence.plugin_root, 'mcp.json')))
            throw Error('AGDF_MCP_COCKPIT_EVIDENCE_INVALID');
          const aliases = name => name.replaceAll('-', '_').toLowerCase();
          if (evidence.providers.some(provider => aliases(provider.server_id) === 'agdf_cockpit'
            && provider.origin !== evidence.plugin_root)) throw Error('AGDF_MCP_COCKPIT_NAME_CONFLICT');
        }
      };
      revalidate({ allowCandidate: Boolean(restoreCockpit) });
      const transaction = createCodexCockpitTransition({ target: selectedTarget, env, serverId: id,
        restore: Boolean(restoreCockpit), evidence, evidenceDigest: digest, revalidate });
      if (restoreCockpit && evidence.previous_plugin_digest !== evidence.plugin_digest
        && inspectCodexCockpitPlugin(evidence.plugin_root).digest === evidence.plugin_digest) {
        const restored = settleCodexCockpitPublication({ pluginRoot: evidence.plugin_root, target: selectedTarget,
          sourceDigest: evidence.plugin_digest.slice(7), previousSourceDigest: evidence.previous_plugin_digest?.slice(7) ?? null, action: 'rollback' });
        if ((restored.source_digest ? `sha256:${restored.source_digest}` : null) !== evidence.previous_plugin_digest)
          throw Error('AGDF_MCP_COCKPIT_INSTALLATION_CHANGED');
      }
      transaction.apply();
      return envelope({ ...transitionBase, result: 'configured_pending_restart', discovery: 'pending_restart',
        registration: { status: 'matched', selected_status: 'matched', effective_status: 'matched',
          selected_source: 'project', effective_source: 'project', path: transaction.path, native_scope: 'project' },
        changes: [{ code: restoreCockpit ? 'cockpit_legacy_restored' : 'cockpit_legacy_retired', ...transaction.preview }],
        diagnostics: [{ code: 'cockpit_transition_pending' }], nextAction: { code: 'restart_host' } });
    } catch (error) {
      return failure(transitionBase, 'cockpit_transition_failed', [{ code: 'cockpit_legacy_retained', reason: error.message }]);
    }
  }

  if (role !== 'governance') {
    if (surface !== 'codex' || !['cockpit', 'diagnostic'].includes(role) || role === 'cockpit' && scope !== 'project'
      || !preparedRuntime || role === 'cockpit' && !['agdf-cockpit', 'agdf-cockpit-local'].includes(serverId)
      || role === 'diagnostic' && !/^agdf-test-[a-z0-9][a-z0-9-]{0,63}$/u.test(serverId ?? '')) throw Error('AGDF_MCP_CODEX_ROLE_INVALID');
    const runtime = inspectMcpExecutableRoot({ root: preparedRuntime.root, expectedVersion });
    if (runtime.status !== 'matched' || runtime.digest !== preparedRuntime.digest
      || runtime.dispatcherDigest !== preparedRuntime.dispatcherDigest || runtime.sdkDigest !== preparedRuntime.sdkDigest
      || runtime.nodeExecutable !== execPath) throw Error('AGDF_MCP_SERVER_VERIFICATION_FAILED');
    let args = [runtime.entrypoint, '--surface', 'codex', '--cockpit-dir', selectedTarget];
    let revalidate;
    if (role === 'diagnostic') {
      if (descriptor?.role !== role || descriptor.server_id !== serverId || descriptor.owner !== 'create-agdf:mcp-runtime'
        || descriptor.target !== selectedTarget || descriptor.runtime_root !== runtime.root
        || descriptor.command !== execPath || !['completion_or_abort'].includes(descriptor.lifetime)
        || !Array.isArray(descriptor.sources) || !descriptor.sources.length || descriptor.sources.length > 8
        || !Array.isArray(descriptor.args) || descriptor.args.length > 16) throw Error('AGDF_MCP_DIAGNOSTIC_OWNERSHIP_INVALID');
      revalidate = () => { for (const source of descriptor.sources) {
        if (!isAbsolute(source.path ?? '') || realpathSync(source.path) !== source.path || lstatSync(source.path).isSymbolicLink()
          || statSync(source.path).size > 131_072 || 'sha256:' + createHash('sha256').update(readFileSync(source.path)).digest('hex') !== source.digest) throw Error('AGDF_MCP_DIAGNOSTIC_OWNERSHIP_INVALID');
      } };
      revalidate();
      if (!descriptor.sources.some(source => source.path === descriptor.args[0])) throw Error('AGDF_MCP_DIAGNOSTIC_OWNERSHIP_INVALID');
      if (action === 'enable') {
        const config = resolveMcpSources({ surface, scope, target: selectedTarget, env }).find(source => source.selected).path;
        let bytes = '', existed = false;
        try { bytes = readFileSync(config, 'utf8'); existed = true; } catch (error) { if (error.code !== 'ENOENT') throw error; }
        if (descriptor.configuration?.path !== config || descriptor.configuration.scope !== scope
          || typeof descriptor.configuration.existed !== 'boolean'
          || descriptor.configuration.existed !== existed
          || descriptor.configuration.digest !== 'sha256:' + createHash('sha256').update(bytes).digest('hex')) {
          // A repeated already-owned setup is checked by the same exact spec below, not adopted from names.
          const repeat = inspectRegistration({ surface, scope, target: selectedTarget, env, exec,
            spec: { command: execPath, args: descriptor.args, version: expectedVersion, digest: runtime.digest, role, serverId } });
          if (repeat.selected_status !== 'matched') throw Error('AGDF_MCP_DIAGNOSTIC_OWNERSHIP_INVALID');
        }
      }
      args = descriptor.args;
    }
    const spec = Object.freeze({ command: execPath, args, version: expectedVersion, digest: runtime.digest, role, serverId });
    const input = { surface, scope, target: selectedTarget, spec, env, exec };
    let registration = inspectRegistration(input);
    let previousRuntime, previousSpec;
    if (role === 'cockpit' && registration.selected_status === 'owned_mismatch') {
      try {
      const observed = registration.observed;
      if (observed?.args?.length === 5 && observed.args[1] === '--surface' && observed.args[2] === 'codex'
        && observed.args[3] === '--cockpit-dir' && observed.args[4] === selectedTarget
        && /[\\/]node_modules[\\/]@agdf[\\/]mcp-server[\\/]bin[\\/]agdf-mcp\.js$/u.test(observed.args[0])) {
        let previousRoot = observed.args[0]; for (let n = 0; n < 5; n++) previousRoot = resolve(previousRoot, '..');
        const inspected = inspectMcpExecutableRoot({ root: previousRoot, expectedVersion: registration.identity.version });
        if (inspected.status === 'matched' && inspected.digest === registration.identity.digest && inspected.nodeExecutable === observed.command
          && inspected.references.some(ref => ref.role === role && ref.server_id === serverId && ref.path === registration.path && ref.target === selectedTarget)) {
          previousRuntime = inspected;
          previousSpec = { ...spec, command: observed.command, args: observed.args, version: inspected.version, digest: inspected.digest };
        }
      }
      } catch {} // A stale/unproven old runtime cannot be adopted or removed by this transition.
    }
    const roleBase = { ...base, capability: 'unverified', host: inspectMcpHost(input), runtime, registration };
    if (action === 'enable' && role === 'cockpit' && base.setupObserve().entries.some(entry => entry.role === 'cockpit' && entry.server_id !== serverId)) {
      return envelope({ ...roleBase, result: 'degraded', diagnostics: [{ code: 'cockpit_legacy_retained' }],
        nextAction: { code: 'resolve_registration' } });
    }
    if (action === 'status') return envelope({ ...roleBase,
      result: registration.status === 'matched' ? 'configured_unverified' : registration.status === 'absent' ? 'not_configured' : 'degraded',
      nextAction: { code: registration.status === 'matched' ? 'restart_host' : nextForRegistration(registration) } });
    let transaction, references, previousReferences;
    try {
      transaction = createRegistrationTransaction({ ...input, action, previousSpec, revalidate });
      transaction.apply();
      registration = inspectRegistration(input);
      if (registration.selected_status !== (action === 'enable' ? 'matched' : 'absent')) throw Error('AGDF_MCP_REGISTRATION_VERIFICATION_FAILED');
      const reference = { ...registrationReference({ surface, scope, target: selectedTarget, registration }), role, server_id: serverId };
      // References keep the exact optional/diagnostic role distinct from another client of the same runtime.
      const selectedRuntime = action === 'disable' && previousRuntime ? previousRuntime : runtime;
      const retained = item => !(item.role === role && item.server_id === serverId && item.path === reference.path);
      references = createReferenceTransaction(selectedRuntime, action === 'enable' ? [...selectedRuntime.references.filter(retained), reference] : selectedRuntime.references.filter(retained));
      references.apply();
      if (action === 'enable' && previousRuntime && previousRuntime.root !== runtime.root) {
        previousReferences = createReferenceTransaction(previousRuntime, previousRuntime.references.filter(retained));
        previousReferences.apply();
      }
      previousReferences?.commit(); references.commit();
      return envelope({ ...roleBase, registration,
        result: transaction.status === 'unchanged' ? 'unchanged' : action === 'enable' ? 'configured_pending_restart' : 'disabled',
        discovery: action === 'enable' ? 'pending_restart' : 'not_checked',
        changes: transaction.status === 'changed' ? [{ kind: action === 'enable' ? 'host_registration_enable' : 'host_registration_disable', path: transaction.path }] : [],
        nextAction: { code: action === 'enable' ? 'restart_host' : 'none' } });
    } catch (error) {
      const complete = rollbackTransactions([previousReferences, references, transaction]);
      return failure(roleBase, complete ? (action === 'enable' ? 'enable_failed' : 'disable_failed') : 'rollback_incomplete');
    }
  }

  // Claude Code, Codex and Copilot start the AGDF MCP server from the runtime plugin. A second host registration
  // would duplicate it and survive plugin removal; status and disable remain available to inspect and
  // retire registrations made by earlier releases.
  if (action === "enable" && pluginManagedSurfaces.includes(surface)) {
    return envelope({ ...base, result: "not_configured", capability: "unverified", host: null,
      runtime: { status: "absent", version: expectedVersion },
      registration: { status: "absent", selected_status: "absent", effective_status: "absent", selected_source: "user",
        effective_source: "none", sources: [], path: null, native_scope: mcpNativeScope(surface, scope) },
      diagnostics: [{ code: `${surface}_plugin_managed` }], nextAction: { code: `use_${surface}_plugin_mcp` } });
  }

  if (!Number.isInteger(major(nodeVersion)) || major(nodeVersion) < 22) {
    return envelope({ ...base, capability: "manual_compatible", host: null,
      runtime: { status: "node_unsupported", version: expectedVersion }, registration: null,
      result: "not_configured", nextAction: { code: "use_node_22" } });
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
    const setup = surface === 'codex' ? base.setupObserve() : null;
    const pluginManaged = result === 'not_configured' && pluginManagedSurfaces.includes(surface)
      && setup?.plugin_declaration.status === 'declared'
      && setup.entries.some(entry => entry.role === 'product');
    return envelope({ ...base, capability, host, runtime, registration, result,
      diagnostics: pluginManaged ? [{ code: 'codex_plugin_managed' }] : [],
      nextAction: { code: pluginManaged ? 'use_codex_plugin_mcp' : result === "configured_unverified" ? "restart_host" : nextForRegistration(registration) } });
  }

  if (action === "enable") {
    let prepared;
    let transaction;
    let referenceTransaction;
    let previousRuntimeTransaction;
    let previousRuntimeChange;
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
        previousRuntimeChange = runtimeReferenceChange(previousRuntime, reference, {
          remove: true, createReferenceTransaction, createRetirementTransaction,
        });
        previousRuntimeTransaction = previousRuntimeChange.transaction;
        previousRuntimeTransaction.apply();
      }
      previousRuntimeTransaction?.commit(); referenceTransaction.commit(); prepared.commit();
      const installedRuntime = inspectPackage({ dataRoot: runtimeDataRoot, expectedVersion });
      const installedCapability = capabilityFor({ surface, host, nodeVersion, scope, registration: verified,
        runtime: installedRuntime, expectedVersion });
      return envelope({ ...base, capability: installedCapability, host, runtime: installedRuntime,
        registration: verified, discovery: "pending_restart", result: transaction.status === "unchanged" ? "unchanged" : "configured_pending_restart",
        changes: [...(prepared.changed ? [{ kind: "runtime_install", path: prepared.root }] : []),
          ...(previousRuntimeChange?.retained ? [{ kind: 'runtime_retain', path: previousRuntime.root }] : []),
          ...(transaction.status === "changed" ? [{ kind: "host_registration", path: verified.path }] : [])],
        diagnostics: previousRuntimeChange?.retained ? [{ code: 'runtime_executables_retained' }] : [],
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
      if (!change.references.length) changes.push({ kind: change.retained ? 'runtime_retain' : "runtime_remove", path: ownedRuntime.root });
      runtime = change.references.length || change.retained ? { ...ownedRuntime, references: Object.freeze(change.references), executable_retention: change.retained ? 'retained' : undefined }
        : { ...ownedRuntime, status: "absent", entrypoint: null, digest: null, references: Object.freeze([]) };
    }
    runtimeTransaction?.commit?.();
    const result = verified.status === "matched" ? "configured_unverified"
      : verified.status !== "absent" ? "degraded"
        : transaction.status === "unchanged" && !changes.length ? "unchanged" : "disabled";
    return envelope({ ...base, capability, host, runtime, registration: verified,
      result, changes, diagnostics: runtime.executable_retention === 'retained' ? [{ code: 'runtime_executables_retained' }] : [], nextAction: { code: result === "configured_unverified" ? "disable_effective_scope"
        : result === "degraded" ? nextForRegistration(verified) : "none" } });
  } catch (error) {
    const rollbackComplete = rollbackTransactions([runtimeTransaction, transaction]);
    const originalCode = /^[A-Z0-9_]+$/u.test(error?.message ?? "") ? error.message.toLowerCase() : "disable_failed";
    return failure({ ...base, capability, host, runtime, registration }, rollbackComplete ? originalCode : "rollback_incomplete",
      rollbackComplete ? [] : [{ code: originalCode }]);
  }
}

export { printMcpLifecycleResult };
