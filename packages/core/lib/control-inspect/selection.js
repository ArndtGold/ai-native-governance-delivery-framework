// One rule set for read-only control selections. The CLI (`validateCommandOptions`) and the MCP
// read tool (`agdf_inspect`) both call this, so a combination the CLI rejects is rejected over MCP
// with the same reason string. Read operations never write control state.

export const CONTROL_INSPECT_OPERATIONS = Object.freeze(["doctor", "gate-check", "delivery-map", "contract"]);
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
  if (allActive && !["doctor", "delivery-map"].includes(operation)) {
    throw new ReadSelectionError("all_active", "--all-active is supported only by doctor and delivery-map");
  }
  if (contractModule !== undefined && operation !== "contract") {
    throw new ReadSelectionError("module", "--module is supported only by contract");
  }
  if (operation === "contract" && !contractModule) {
    throw new ReadSelectionError("module", "contract requires --module");
  }
  if (variant !== undefined && operation !== "gate-check") {
    throw new ReadSelectionError("variant", "--status-card and --approval-envelope are supported only by gate-check");
  }
  if (variant !== undefined && !GATE_CHECK_VARIANTS.includes(variant)) {
    throw new ReadSelectionError("variant", `gate-check variant must be one of ${GATE_CHECK_VARIANTS.join(", ")}`);
  }
}
