const OPERATIONS = new Set(["install", "update", "status", "disable", "uninstall", "repository_setup"]);
const RESULTS = new Set(["success", "partial", "failed", "preview"]);
const SCOPES = new Set(["global", "repository"]);
const SURFACES = new Set(["codex", "claude", "copilot", "opencode", "generic"]);
const GLOBAL_INSTALL_RESTART_ACTIONS = Object.freeze({
  codex: "Restart Codex.",
  claude: "Restart Claude Code.",
  opencode: "Restart OpenCode.",
});

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function createLifecycleResult(input = {}) {
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
  return value;
}

export function globalInstallRestartAction(surface) {
  const action = GLOBAL_INSTALL_RESTART_ACTIONS[surface];
  if (!action) throw new Error(`Unsupported global installation restart surface: ${surface || "missing"}.`);
  return Object.freeze({ kind: "restart", text: action });
}

export function lifecycleFailure({ operation, surface, scope, phase, message, evidence = [], nextAction }) {
  return createLifecycleResult({
    operation,
    result: "failed",
    surface,
    scope,
    verification: { status: "degraded", evidence },
    next_action: { kind: "recovery", text: nextAction },
    failure: { phase, message },
  });
}
