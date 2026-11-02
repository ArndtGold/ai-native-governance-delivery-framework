// Public synchronous ESM surface. Import reads package-owned metadata only; all target access and
// Git observations begin with an explicit invocation. Cooperative replies are not identity proof.
export { CONTROL_COMMAND_SCHEMA_VERSION, resolveControlCommandTarget } from "#agdf-core/control-state/approval-command-contract.js";
export { recordGateApprovalCommand } from "./runtime/control-command-service.js";
