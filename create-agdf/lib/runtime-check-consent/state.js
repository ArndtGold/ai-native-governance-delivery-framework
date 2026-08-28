import { randomUUID } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { renameSyncWithRetry } from "../fs-swap.js";

export function runtimeCheckReceiptPath(dataRoot, surface) {
  if (!["codex", "claude", "copilot", "opencode"].includes(surface)) throw new Error("AGDF_RUNTIME_CHECK_RECEIPT_SURFACE_INVALID");
  return join(resolve(dataRoot), "runtime-checks", `${surface}.json`);
}

export function createRuntimeCheckReceipt({ surface, decision, capabilityIdentity, command }) {
  if (!["codex", "claude", "copilot", "opencode"].includes(surface)) throw new Error("AGDF_RUNTIME_CHECK_RECEIPT_SURFACE_INVALID");
  if (!["enable", "manual"].includes(decision)) throw new Error("AGDF_RUNTIME_CHECK_RECEIPT_DECISION_INVALID");
  if (!/^[a-f0-9]{64}$/.test(capabilityIdentity)) throw new Error("AGDF_RUNTIME_CHECK_RECEIPT_IDENTITY_INVALID");
  return Object.freeze({
    schema_version: 1,
    owner: "create-agdf",
    capability_id: "automatic-runtime-checks",
    surface,
    requested_state: decision === "enable" ? "enabled" : "manual",
    capability_identity: capabilityIdentity,
    command,
  });
}

export function validateRuntimeCheckReceipt(receipt) {
  if (receipt?.schema_version !== 1 || receipt.owner !== "create-agdf"
      || receipt.capability_id !== "automatic-runtime-checks") return { status: "receipt_unowned", receipt: null };
  if (!["codex", "claude", "copilot", "opencode"].includes(receipt.surface)
      || !["enabled", "manual"].includes(receipt.requested_state)
      || !/^[a-f0-9]{64}$/.test(receipt.capability_identity)
      || typeof receipt.command !== "string" || !receipt.command.trim()) {
    return { status: "receipt_invalid", receipt: null };
  }
  return { status: "valid", receipt };
}

export function readRuntimeCheckReceipt(dataRoot, surface) {
  const path = runtimeCheckReceiptPath(dataRoot, surface);
  if (!existsSync(path)) return { status: "receipt_missing", receipt: null, path };
  try {
    const file = lstatSync(path);
    if (!file.isFile() || file.isSymbolicLink()) return { status: "receipt_unowned", receipt: null, path };
    return { ...validateRuntimeCheckReceipt(JSON.parse(readFileSync(path, "utf8"))), path };
  } catch {
    return { status: "receipt_invalid", receipt: null, path };
  }
}

export function writeRuntimeCheckReceipt(dataRoot, receipt, adapters = {}) {
  const validated = validateRuntimeCheckReceipt(receipt);
  if (validated.status !== "valid") throw new Error(`AGDF_RUNTIME_CHECK_${validated.status.toUpperCase()}`);
  const path = runtimeCheckReceiptPath(dataRoot, receipt.surface);
  const parent = dirname(path);
  const fs = {
    mkdir: adapters.mkdir ?? mkdirSync,
    write: adapters.write ?? writeFileSync,
    rename: adapters.rename ?? renameSyncWithRetry,
    remove: adapters.remove ?? rmSync,
  };
  fs.mkdir(parent, { recursive: true });
  const parentStats = lstatSync(parent);
  if (!parentStats.isDirectory() || parentStats.isSymbolicLink()) throw new Error("AGDF_RUNTIME_CHECK_RECEIPT_PARENT_UNOWNED");
  const temp = `${path}.tmp-${process.pid}-${randomUUID()}`;
  const backup = `${path}.bak-${process.pid}-${randomUUID()}`;
  const hadPrevious = existsSync(path);
  fs.write(temp, `${JSON.stringify(receipt, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  try {
    if (hadPrevious && process.platform === "win32") fs.rename(path, backup);
    fs.rename(temp, path);
    if (hadPrevious && process.platform === "win32") fs.remove(backup, { force: true });
  } catch (error) {
    try { fs.remove(temp, { force: true }); } catch {}
    if (hadPrevious && process.platform === "win32" && existsSync(backup) && !existsSync(path)) fs.rename(backup, path);
    throw error;
  }
  return path;
}

export function deriveRuntimeCheckState({ receiptResult, surface, capabilityIdentity, hostEvidence }) {
  if (receiptResult.status !== "valid") return { requested: "unknown", effective: receiptResult.status, reason: receiptResult.status };
  const receipt = receiptResult.receipt;
  if (receipt.surface !== surface) return { requested: receipt.requested_state, effective: "renewal_required", reason: "installed_identity_mismatch" };
  if (receipt.capability_identity !== capabilityIdentity) return { requested: receipt.requested_state, effective: "renewal_required", reason: "capability_identity_changed" };
  if (receipt.requested_state === "manual") return { requested: "manual", effective: "manual", reason: "consent_not_provided" };
  if (hostEvidence?.status === "enabled" && hostEvidence.capability_identity === capabilityIdentity) {
    return { requested: "enabled", effective: "enabled", reason: "none" };
  }
  return { requested: "enabled", effective: hostEvidence?.status || "decision_required", reason: hostEvidence?.reason || "host_permission_unverified" };
}
