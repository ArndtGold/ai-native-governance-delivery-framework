import { createHash } from "node:crypto";
import { realpathSync, statSync } from "../control-read/fs.js";
import { isAbsolute } from "node:path";
import { APPROVAL_GATES, REVISION_ID_PATTERN, RUN_ID_PATTERN } from "./run-identity.js";

export const CONTROL_COMMAND_SCHEMA_VERSION = "1";
export const COOPERATIVE_ASSURANCE = Object.freeze({
  lane: "cooperative_local",
  reply_provenance: "caller_forwarded_deliberate_reply",
  independent_human_proof: "unavailable",
});
export const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const FIELDS = Object.freeze(["schema_version", "action", "target_id", "run_id", "gate", "expected_revision_id", "presentation_id", "response", "operation_id", "assurance"]);

export function digest(value) {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

export function exactObject(value, fields) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value))
    && Reflect.ownKeys(value).length === fields.length && fields.every((key) => Object.hasOwn(value, key)
      && Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), "value"));
}

// Schema diagnostics must not evaluate accessors on a rejected caller object.
export function ownDataValue(value, key) {
  if (value === null || typeof value !== "object") return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor && Object.hasOwn(descriptor, "value") ? descriptor.value : undefined;
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

// A local binding, not an authorization token or portable repository identity.
export function resolveControlCommandTarget(root) {
  if (typeof root !== "string" || !isAbsolute(root)) throw new Error("target_invalid");
  const canonicalRoot = realpathSync(root);
  if (!statSync(canonicalRoot).isDirectory()) throw new Error("target_invalid");
  return Object.freeze({ root: canonicalRoot, target_id: digest(`agdf-command-target/1\0${canonicalRoot}`) });
}

export function validateApprovalCommand(command) {
  const assurance = ownDataValue(command, "assurance");
  if (assurance !== undefined && assurance !== "cooperative_local") return "unsupported_authority";
  if (!exactObject(command, FIELDS) || FIELDS.some((key) => typeof command[key] !== "string")) return "command_schema_invalid";
  if (command.schema_version !== CONTROL_COMMAND_SCHEMA_VERSION) return "command_version_unsupported";
  if (command.action !== "record_gate_approval") return "command_action_unsupported";
  if (command.assurance !== "cooperative_local") return "unsupported_authority";
  if (!DIGEST_PATTERN.test(command.target_id) || !RUN_ID_PATTERN.test(command.run_id)
      || !APPROVAL_GATES.includes(command.gate)
      || ![command.operation_id, command.expected_revision_id, command.presentation_id].every((id) => REVISION_ID_PATTERN.test(id))) {
    return "command_binding_invalid";
  }
  return null;
}

export function approvalRequestDigest(command) {
  return digest(`agdf-approval-request/1\0${JSON.stringify(FIELDS.filter((key) => key !== "operation_id").map((key) => [key, command[key]]))}`);
}

export function commandBinding(command) {
  return Object.freeze(Object.fromEntries(["target_id", "run_id", "gate", "expected_revision_id", "presentation_id"].map((key) => {
    const value = ownDataValue(command, key);
    return [key, typeof value === "string" ? value : null];
  })));
}
