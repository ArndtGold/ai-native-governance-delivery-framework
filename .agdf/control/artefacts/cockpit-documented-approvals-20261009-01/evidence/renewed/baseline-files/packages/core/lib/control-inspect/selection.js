// Shared read-only selection policy for CLI and MCP; evaluation never writes control state.

export const CONTROL_INSPECT_OPERATIONS = Object.freeze(["doctor", "gate-check", "delivery-map", "contract", "artifact-readiness"]);
export const ALL_ACTIVE_OPERATIONS = Object.freeze(["doctor", "delivery-map"]);
export const VARIANT_OPERATION = "gate-check";
export const MODULE_OPERATION = "contract";
export const GATE_CHECK_VARIANTS = Object.freeze(["status-card", "approval-envelope"]);

export class ReadSelectionError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ReadSelectionError";
    this.field = field;
  }
}

// `operation` is the CLI command name or the MCP operation. Rules apply to every command so that a
// write command carrying a read-only flag is rejected exactly as before the extraction.
export function validateReadSelection({ operation, allActive = false, contractModule, variant } = {}) {
  if (allActive && !ALL_ACTIVE_OPERATIONS.includes(operation)) {
    throw new ReadSelectionError("all_active", "--all-active is supported only by doctor and delivery-map");
  }
  if (contractModule !== undefined && operation !== MODULE_OPERATION) {
    throw new ReadSelectionError("module", "--module is supported only by contract");
  }
  if (operation === MODULE_OPERATION && !contractModule) {
    throw new ReadSelectionError("module", "contract requires --module");
  }
  if (variant !== undefined && operation !== VARIANT_OPERATION) {
    throw new ReadSelectionError("variant", "--status-card and --approval-envelope are supported only by gate-check");
  }
  if (variant !== undefined && !GATE_CHECK_VARIANTS.includes(variant)) {
    throw new ReadSelectionError("variant", `gate-check variant must be one of ${GATE_CHECK_VARIANTS.join(", ")}`);
  }
}
