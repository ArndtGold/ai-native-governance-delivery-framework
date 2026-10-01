const OPERATIONS = new Set(["install", "update", "status", "disable", "uninstall", "repository_setup", "control_init"]);
const RESULTS = new Set(["success", "partial", "failed", "preview"]);
const SCOPES = new Set(["global", "repository"]);
const SURFACES = new Set(["codex", "claude", "copilot", "opencode", "generic"]);
const OPERATION_OUTCOMES = new Set(["reported", "created", "unchanged", "repaired", "preview", "succeeded", "partial", "failed"]);
const STATUS_EXCLUDED_AUTHORITY = Object.freeze(["target_inference", "run_creation", "gate_approval", "mutation"]);
const LIFECYCLE_EXCLUDED_AUTHORITY = Object.freeze([
  "target_inference",
  "run_creation",
  "ur_persistence",
  "gate_approval",
  "implementation",
  "qa",
  "release",
]);
const GLOBAL_INSTALL_RESTART_ACTIONS = Object.freeze({
  codex: "Fully restart Codex, then start a fresh session. Restoring the previous session can retain stale AGDF skills.",
  claude: "Fully restart Claude Code, then start a fresh session. Restoring the previous session can retain stale AGDF skills.",
  copilot: "Fully restart GitHub Copilot, then start a fresh session. Restoring the previous session can retain stale AGDF skills.",
  opencode: "Fully restart OpenCode, then start a fresh session. Restoring the previous session can retain stale AGDF skills.",
});

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function lifecycleOperationId(operation, surface, scope) {
  if (["install", "update"].includes(operation)) {
    if (surface === "generic") throw new Error(`${operation} requires a concrete lifecycle surface.`);
    return `lifecycle.plugin.install.${surface}`;
  }
  if (operation === "repository_setup") {
    if (!["codex", "opencode"].includes(surface)) {
      throw new Error("Repository setup requires the codex or opencode surface.");
    }
    return `lifecycle.repository.activate.${surface}`;
  }
  if (operation === "disable") return "lifecycle.repository.disable";
  if (operation === "uninstall") return "lifecycle.plugin.uninstall";
  if (operation === "control_init") return "lifecycle.control.init";
  if (operation === "status" && scope === "repository") {
    return surface === "opencode" ? "status.opencode_repository" : "status.repository_delivery";
  }
  if (operation === "status" && surface !== "generic") return `status.installation.${surface}`;
  return "status.overview";
}

function lifecyclePlannedEffect(operation) {
  if (["install", "update"].includes(operation)) return "install_or_update_global_plugin";
  if (operation === "repository_setup") return "configure_repository_plugin_surface";
  if (operation === "disable") return "disable_repository_plugin";
  if (operation === "uninstall") return "uninstall_global_plugin";
  if (operation === "control_init") return "create_canonical_control_scaffold";
  return "read_only_status";
}

function lifecycleOutcome(result) {
  if (result === "success") return "succeeded";
  if (result === "partial") return "partial";
  if (result === "failed") return "failed";
  return "preview";
}

export function createOperationStatus({
  operationId,
  outcome,
  targetScope,
  target = null,
  plannedEffect,
  excludedAuthority,
  authorizes = false,
} = {}) {
  const normalizedScope = text(targetScope);
  const normalizedTarget = text(target) || null;
  const normalizedExcludedAuthority = Array.isArray(excludedAuthority)
    ? excludedAuthority.map(text).filter(Boolean)
    : [];
  const status = {
    operation_id: text(operationId),
    outcome: text(outcome),
    target_scope: normalizedScope,
    target: normalizedTarget,
    planned_effect: text(plannedEffect),
    excluded_authority: Object.freeze(normalizedExcludedAuthority),
    authorizes: false,
  };
  if (!status.operation_id
      || !OPERATION_OUTCOMES.has(status.outcome)
      || !SCOPES.has(status.target_scope)
      || (status.target_scope === "repository" && !status.target)
      || (status.target_scope === "global" && status.target !== null)
      || !status.planned_effect
      || status.excluded_authority.length === 0
      || !status.excluded_authority.includes("gate_approval")
      || authorizes !== false) {
    throw new Error("Lifecycle operation_status must be complete, target-bound when required and non-authorizing.");
  }
  return Object.freeze(status);
}

function deriveLifecycleOperationStatus(input) {
  const operation = text(input.operation);
  const result = text(input.result);
  const surface = text(input.surface);
  const scope = text(input.scope);
  let outcome = operation === "status" ? "reported" : lifecycleOutcome(result);
  if (operation === "control_init" && result !== "failed") {
    const initializationOutcome = text(input.operationOutcome);
    if (!["created", "unchanged", "repaired"].includes(initializationOutcome)) {
      throw new Error("Control initialization requires an explicit created, unchanged or repaired operation outcome.");
    }
    outcome = initializationOutcome;
  }
  return createOperationStatus({
    operationId: lifecycleOperationId(operation, surface, scope),
    outcome,
    targetScope: scope,
    target: input.target,
    plannedEffect: lifecyclePlannedEffect(operation),
    excludedAuthority: operation === "status" ? STATUS_EXCLUDED_AUTHORITY : LIFECYCLE_EXCLUDED_AUTHORITY,
  });
}

function assertSuppliedOperationStatus(expected, supplied) {
  if (supplied.operation_id !== expected.operation_id) {
    throw new Error(`Lifecycle operation_status must use the exact operation id ${expected.operation_id}.`);
  }
  if (supplied.outcome !== expected.outcome) {
    throw new Error(`Lifecycle operation_status outcome must be ${expected.outcome}.`);
  }
  if (supplied.target_scope !== expected.target_scope || supplied.target !== expected.target) {
    throw new Error("Lifecycle operation_status target scope and target must be derived exactly from the lifecycle request.");
  }
  if (supplied.planned_effect !== expected.planned_effect) {
    throw new Error(`Lifecycle operation_status must use the exact planned effect ${expected.planned_effect}.`);
  }
  if (JSON.stringify(supplied.excluded_authority) !== JSON.stringify(expected.excluded_authority)) {
    throw new Error("Lifecycle operation_status must use the exact excluded-authority contract for its operation.");
  }
}

export function createLifecycleResult(input = {}) {
  const suppliedOperationStatus = input.operation_status
    ? createOperationStatus({
        operationId: input.operation_status.operation_id,
        outcome: input.operation_status.outcome,
        targetScope: input.operation_status.target_scope,
        target: input.operation_status.target,
        plannedEffect: input.operation_status.planned_effect,
        excludedAuthority: input.operation_status.excluded_authority,
        authorizes: input.operation_status.authorizes,
      })
    : null;
  const operationStatus = deriveLifecycleOperationStatus(input);
  if (suppliedOperationStatus) assertSuppliedOperationStatus(operationStatus, suppliedOperationStatus);
  const result = {
    schema_version: 1,
    operation: text(input.operation),
    result: text(input.result),
    surface: text(input.surface),
    scope: text(input.scope),
    version: {
      expected: text(input.version?.expected) || null,
      installed: text(input.version?.installed) || null,
      previous: text(input.version?.previous) || null,
      status: text(input.version?.status) || "unknown",
      transition: text(input.version?.transition) || null,
    },
    verification: {
      status: text(input.verification?.status) || "unknown",
      evidence: [...(input.verification?.evidence ?? [])].map(String),
    },
    installation: {
      status: text(input.installation?.status) || text(input.verification?.status) || "unknown",
    },
    activation: {
      status: text(input.activation?.status) || (input.restart?.required ? "pending_restart" : "active"),
    },
    delivery: {
      status: text(input.delivery?.status) || "not_evaluated",
    },
    runtime_checks: {
      requested: text(input.runtime_checks?.requested) || "unknown",
      effective: text(input.runtime_checks?.effective) || "unknown",
      reason: text(input.runtime_checks?.reason) || "not_evaluated",
      capability_identity: text(input.runtime_checks?.capability_identity) || null,
      verification: text(input.runtime_checks?.verification) || "not_evaluated",
      mutation: text(input.runtime_checks?.mutation) || "none",
      rollback: text(input.runtime_checks?.rollback) || "none",
    },
    restart: {
      required: Boolean(input.restart?.required),
      reason: text(input.restart?.reason) || "none",
    },
    next_action: {
      kind: text(input.next_action?.kind) || "none",
      text: text(input.next_action?.text) || "No further action required.",
    },
    changes: [...(input.changes ?? [])],
    retained: [...(input.retained ?? [])],
    failure: input.failure ?? null,
    operation_status: operationStatus,
  };
  assertLifecycleResult(result);
  return Object.freeze(result);
}

export function assertLifecycleResult(value) {
  if (value?.schema_version !== 1) throw new Error("Lifecycle result requires schema_version 1.");
  if (!OPERATIONS.has(value.operation)) throw new Error(`Unsupported lifecycle operation: ${value.operation || "missing"}.`);
  if (!RESULTS.has(value.result)) throw new Error(`Unsupported lifecycle result: ${value.result || "missing"}.`);
  if (!SURFACES.has(value.surface)) throw new Error(`Unsupported lifecycle surface: ${value.surface || "missing"}.`);
  if (!SCOPES.has(value.scope)) throw new Error(`Unsupported lifecycle scope: ${value.scope || "missing"}.`);
  if (!value.next_action || Array.isArray(value.next_action) || !text(value.next_action.text)) {
    throw new Error("Lifecycle result requires exactly one next action.");
  }
  if (value.version.status === "verified" && !value.version.installed) {
    throw new Error("A verified lifecycle version requires an observed installed version.");
  }
  if (value.result === "failed" && !value.failure) throw new Error("Failed lifecycle results require failure evidence.");
  if (!value.operation_status
      || !value.operation_status.operation_id
      || !OPERATION_OUTCOMES.has(value.operation_status.outcome)
      || !SCOPES.has(value.operation_status.target_scope)
      || (value.operation_status.target_scope === "repository" && !value.operation_status.target)
      || (value.operation_status.target_scope === "global" && value.operation_status.target !== null)
      || !value.operation_status.planned_effect
      || value.operation_status.excluded_authority.length === 0
      || !value.operation_status.excluded_authority.includes("gate_approval")
      || value.operation_status.authorizes !== false) {
    throw new Error("Lifecycle operation_status must be complete, target-bound when required and non-authorizing.");
  }
  const expectedOperationId = lifecycleOperationId(value.operation, value.surface, value.scope);
  if (value.operation_status.operation_id !== expectedOperationId) {
    throw new Error(`Lifecycle operation_status must use the exact operation id ${expectedOperationId}.`);
  }
  const expectedOutcome = value.operation === "status" ? "reported" : lifecycleOutcome(value.result);
  if (value.operation !== "control_init" && value.operation_status.outcome !== expectedOutcome) {
    throw new Error(`Lifecycle operation_status outcome must reflect lifecycle result ${value.result}.`);
  }
  if (value.operation === "control_init"
      && (value.operation_status?.operation_id !== "lifecycle.control.init"
        || !(value.result === "failed"
          ? value.operation_status?.outcome === "failed"
          : ["created", "unchanged", "repaired"].includes(value.operation_status?.outcome)))) {
    throw new Error("Control initialization requires a canonical lifecycle.control.init outcome.");
  }
  if (value.operation_status.target_scope !== value.scope) {
    throw new Error("Lifecycle operation_status target_scope must match the lifecycle scope.");
  }
  const expectedPlannedEffect = lifecyclePlannedEffect(value.operation);
  if (value.operation_status.planned_effect !== expectedPlannedEffect) {
    throw new Error(`Lifecycle operation_status must use the exact planned effect ${expectedPlannedEffect}.`);
  }
  const expectedExcludedAuthority = value.operation === "status"
    ? STATUS_EXCLUDED_AUTHORITY
    : LIFECYCLE_EXCLUDED_AUTHORITY;
  if (JSON.stringify(value.operation_status.excluded_authority) !== JSON.stringify(expectedExcludedAuthority)) {
    throw new Error("Lifecycle operation_status must use the exact excluded-authority contract for its operation.");
  }
  return value;
}

export function globalInstallRestartAction(surface) {
  const action = GLOBAL_INSTALL_RESTART_ACTIONS[surface];
  if (!action) throw new Error(`Unsupported global installation restart surface: ${surface || "missing"}.`);
  return Object.freeze({ kind: "restart", text: action });
}

export function lifecycleFailure({ operation, surface, scope, target = null, phase, message, evidence = [], nextAction }) {
  return createLifecycleResult({
    operation,
    result: "failed",
    surface,
    scope,
    target,
    verification: { status: "degraded", evidence },
    next_action: { kind: "recovery", text: nextAction },
    failure: { phase, message },
  });
}
