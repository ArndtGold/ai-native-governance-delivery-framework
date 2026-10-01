import { TextDecoder } from "node:util";
import { APPROVAL_GATES, REVISION_ID_PATTERN, RUN_ID_PATTERN } from "./run-identity.js";
import { canonicalJson, COOPERATIVE_ASSURANCE, DIGEST_PATTERN, exactObject } from "./approval-command-contract.js";

const RECEIPT_FIELDS = ["schema_version", "action", "operation_id", "request_digest", "binding", "assurance", "created_at", "producer", "effect"];
const BINDING_FIELDS = ["target_id", "run_id", "gate", "expected_revision_id", "presentation_id"];
const EFFECT_FIELDS = ["previous_revision_id", "resulting_revision_id", "revision", "gate", "approval", "artefact_digest", "presentation_digest", "next_gate_after_approval", "allowed_after_approval"];

export function validApprovalReceipt(receipt) {
  if (!exactObject(receipt, RECEIPT_FIELDS) || receipt.schema_version !== "1" || receipt.action !== "record_gate_approval"
      || !REVISION_ID_PATTERN.test(receipt.operation_id ?? "") || !DIGEST_PATTERN.test(receipt.request_digest ?? "")
      || !exactObject(receipt.binding, BINDING_FIELDS) || !exactObject(receipt.effect, EFFECT_FIELDS)
      || !exactObject(receipt.producer, ["contract", "package_version"])) return false;
  const binding = receipt.binding, effect = receipt.effect;
  return DIGEST_PATTERN.test(binding.target_id ?? "") && RUN_ID_PATTERN.test(binding.run_id ?? "")
    && APPROVAL_GATES.includes(binding.gate)
    && [binding.expected_revision_id, binding.presentation_id, effect.resulting_revision_id].every((id) => typeof id === "string" && REVISION_ID_PATTERN.test(id))
    && effect.previous_revision_id === binding.expected_revision_id && effect.resulting_revision_id !== effect.previous_revision_id
    && Number.isSafeInteger(effect.revision) && effect.revision >= 2 && effect.gate === binding.gate
    && effect.approval === `Approval: ${binding.gate}`
    && (binding.gate === "UAT" ? effect.artefact_digest === null : DIGEST_PATTERN.test(effect.artefact_digest ?? ""))
    && DIGEST_PATTERN.test(effect.presentation_digest ?? "")
    && typeof effect.next_gate_after_approval === "string" && effect.next_gate_after_approval.length > 0
    && typeof effect.allowed_after_approval === "string" && effect.allowed_after_approval.length > 0
    && canonicalJson(receipt.assurance) === canonicalJson(COOPERATIVE_ASSURANCE)
    && typeof receipt.created_at === "string" && /^\d{4}-\d{2}-\d{2}T.*Z$/u.test(receipt.created_at) && !Number.isNaN(Date.parse(receipt.created_at))
    && receipt.producer.contract === "approval-service/1" && typeof receipt.producer.package_version === "string" && receipt.producer.package_version.length > 0;
}

export function readApprovalOperations(content) {
  const lines = String(content).replace(/\r\n?/gu, "\n").split("\n");
  const headings = lines.map((line, index) => /^## Approval Operations\s*$/u.test(line) ? index : -1).filter((index) => index >= 0);
  if (!headings.length) return { present: false, valid: true, receipts: [] };
  const invalid = () => ({ present: true, valid: false, receipts: [], reason: "approval_operations_invalid" });
  if (headings.length !== 1) return invalid();
  const start = headings[0];
  let end = start + 1;
  while (end < lines.length && !/^#{1,2} /u.test(lines[end])) end += 1;
  const body = lines.slice(start + 1, end).map((line) => line.trim()).filter(Boolean);
  if (body[0] !== "- schema_version: 1" || body[1] !== "| operation_id | request_digest | receipt |"
      || !/^\|[-:|\s]+\|$/u.test(body[2] ?? "")) return invalid();
  const receipts = [], seen = new Set();
  for (const line of body.slice(3)) {
    const cells = line.match(/^\| ([^|]+) \| ([^|]+) \| ([A-Za-z0-9_-]+) \|$/u);
    if (!cells || seen.has(cells[1])) return invalid();
    try {
      const bytes = Buffer.from(cells[3], "base64url");
      const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      const receipt = JSON.parse(json);
      if (bytes.toString("base64url") !== cells[3] || canonicalJson(receipt) !== json || !validApprovalReceipt(receipt)
          || receipt.operation_id !== cells[1] || receipt.request_digest !== cells[2]) return invalid();
      seen.add(receipt.operation_id);
      receipts.push(receipt);
    } catch { return invalid(); }
  }
  return { present: true, valid: true, receipts, start, end };
}

export function approvalOperationsRecord(content) {
  const operations = readApprovalOperations(content);
  if (!operations.valid) throw new Error("AGDF_APPROVAL_OPERATIONS_INVALID");
  return operations.present ? canonicalJson(operations.receipts) : null;
}

export function appendApprovalOperation(content, receipt) {
  const operations = readApprovalOperations(content);
  if (!operations.valid || !validApprovalReceipt(receipt) || operations.receipts.some((item) => item.operation_id === receipt.operation_id)) {
    throw new Error("AGDF_APPROVAL_OPERATIONS_INVALID");
  }
  const block = ["## Approval Operations", "", "- schema_version: 1", "", "| operation_id | request_digest | receipt |", "|---|---|---|",
    ...[...operations.receipts, receipt].map((item) => `| ${item.operation_id} | ${item.request_digest} | ${Buffer.from(canonicalJson(item), "utf8").toString("base64url")} |`), ""];
  if (!operations.present) return `${String(content).trimEnd()}\n\n${block.join("\n")}`;
  const lines = String(content).replace(/\r\n?/gu, "\n").split("\n");
  return [...lines.slice(0, operations.start), ...block, ...lines.slice(operations.end)].join("\n");
}

// Only the approval service can append its one matching receipt. Every other writer preserves it.
export function assertApprovalOperationsChange(current, candidate, appendedReceipt) {
  const before = readApprovalOperations(current), after = readApprovalOperations(candidate);
  if (!before.valid || !after.valid) throw new Error("AGDF_APPROVAL_OPERATIONS_INVALID");
  const expected = appendedReceipt ? [...before.receipts, appendedReceipt] : before.receipts;
  if (canonicalJson(after.receipts) !== canonicalJson(expected)
      || after.present !== (before.present || Boolean(appendedReceipt))) throw new Error("AGDF_APPROVAL_OPERATIONS_CHANGED");
}
