import { TextDecoder } from "node:util";
import { canonicalJson, digest, DIGEST_PATTERN, exactObject } from "./approval-command-contract.js";
import { REVISION_ID_PATTERN, RUN_ID_PATTERN } from "./run-identity.js";
import { isSafeControlRelativePath } from "./contained-file.js";
import { deliveryRelationships, sameRelationship } from "../control-evaluation/delivery-relationships.js";
import { bindingIsEffective } from "./run-source-revisions.js";

const fields = ["schema_version", "binding_id", "target_id", "run_id", "relationship", "destination", "source", "review", "origin", "operation", "supersedes"];
const text = value => typeof value === "string" && value.trim().length > 0 && value.length <= 4096 && !/[\r\n\0|]/u.test(value);
const uuid = value => typeof value === "string" && REVISION_ID_PATTERN.test(value);
const file = (value, keys) => exactObject(value, keys) && text(value.type)
  && isSafeControlRelativePath(value.path) && DIGEST_PATTERN.test(value.digest ?? "");
export const artefactBindingDigest = receipt => digest(`agdf-artefact-binding/1\0${canonicalJson(receipt)}`);
export const artefactBindingKey = receipt => canonicalJson([receipt.target_id, receipt.run_id, receipt.relationship]);

export function validArtefactBinding(receipt) {
  if (!exactObject(receipt, fields) || receipt.schema_version !== "1" || !uuid(receipt.binding_id)
      || !DIGEST_PATTERN.test(receipt.target_id ?? "") || !RUN_ID_PATTERN.test(receipt.run_id ?? "")
      || !exactObject(receipt.relationship, ["from", "relationship", "to"])
      || !file(receipt.destination, ["type", "path", "digest", "status"])
      || !file(receipt.source, ["type", "path", "digest"])
      || !exactObject(receipt.review, ["reviewer", "path", "digest"]) || !text(receipt.review.reviewer)
      || !isSafeControlRelativePath(receipt.review.path) || !DIGEST_PATTERN.test(receipt.review.digest ?? "")
      || receipt.origin !== "reviewed_mapping" || !exactObject(receipt.operation, ["id", "previous_revision_id", "resulting_revision_id", "revision"])
      || ![receipt.operation.id, receipt.operation.previous_revision_id, receipt.operation.resulting_revision_id].every(uuid)
      || receipt.operation.previous_revision_id === receipt.operation.resulting_revision_id
      || !Number.isSafeInteger(receipt.operation.revision) || receipt.operation.revision < 2
      || !(receipt.supersedes === null || uuid(receipt.supersedes))) return false;
  const expected = deliveryRelationships.find(row => row.requiredBy !== "UR" && sameRelationship(receipt.relationship, row));
  if (!expected || receipt.destination.type !== expected.from || receipt.source.type !== expected.to) return false;
  const prefix = `.agdf/control/artefacts/${receipt.run_id}/`;
  return receipt.destination.path === `${prefix}${expected.from}.md` && receipt.source.path === `${prefix}${expected.to}.md`
    && receipt.review.path.startsWith(prefix) && receipt.review.path !== receipt.destination.path && receipt.review.path !== receipt.source.path
    && (expected.requiredBy === "QA" ? ["pass", "revise", "block"].includes(receipt.destination.status) : receipt.destination.status === "draft");
}

export function readArtefactBindings(content) {
  const lines = String(content).replace(/\r\n?/gu, "\n").split("\n");
  const starts = lines.flatMap((line, i) => /^## Artefact Bindings\s*$/u.test(line) ? [i] : []);
  if (!starts.length) return { present: false, valid: true, receipts: [], active: [], latest: [] };
  const invalid = () => ({ present: true, valid: false, receipts: [], active: [], reason: "artefact_bindings_invalid" });
  if (starts.length !== 1) return invalid();
  const start = starts[0];
  let end = start + 1;
  while (end < lines.length && !/^#{1,2} /u.test(lines[end])) end++;
  const body = lines.slice(start + 1, end).map(line => line.trim()).filter(Boolean);
  if (body[0] !== "- schema_version: 1" || body[1] !== "| binding_id | receipt_digest | receipt |"
      || !/^\|[-:|\s]+\|$/u.test(body[2] ?? "")) return invalid();
  const receipts = [], active = new Map(), ids = new Set(), operations = new Set();
  let lastRevision = 1;
  for (const line of body.slice(3)) {
    const cells = line.match(/^\| ([^|]+) \| ([^|]+) \| ([A-Za-z0-9_-]+) \|$/u);
    if (!cells || cells[3].length > 131072) return invalid();
    try {
      const bytes = Buffer.from(cells[3], "base64url");
      const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      const receipt = JSON.parse(json);
      if (bytes.toString("base64url") !== cells[3] || canonicalJson(receipt) !== json || !validArtefactBinding(receipt)
          || receipt.binding_id !== cells[1] || artefactBindingDigest(receipt) !== cells[2]
          || ids.has(receipt.binding_id) || operations.has(receipt.operation.id)
          || receipt.operation.revision <= lastRevision) return invalid();
      const key = artefactBindingKey(receipt), prior = active.get(key);
      if (receipt.supersedes !== (prior?.binding_id ?? null)) return invalid();
      active.set(key, receipt);
      receipts.push(receipt); ids.add(receipt.binding_id); operations.add(receipt.operation.id);
      lastRevision = receipt.operation.revision;
    } catch { return invalid(); }
  }
  const latest = [...active.values()];
  return { present: true, valid: true, receipts, latest, active: latest.filter(receipt => bindingIsEffective(content, receipt)), start, end };
}

export function appendArtefactBinding(content, receipt) {
  const prior = readArtefactBindings(content);
  if (!prior.valid || !validArtefactBinding(receipt)) throw new Error("AGDF_ARTEFACT_BINDINGS_INVALID");
  const block = ["## Artefact Bindings", "", "- schema_version: 1", "", "| binding_id | receipt_digest | receipt |", "|---|---|---|",
    ...[...prior.receipts, receipt].map(item => `| ${item.binding_id} | ${artefactBindingDigest(item)} | ${Buffer.from(canonicalJson(item)).toString("base64url")} |`), ""];
  const lines = String(content).replace(/\r\n?/gu, "\n").split("\n");
  const candidate = prior.present ? [...lines.slice(0, prior.start), ...block, ...lines.slice(prior.end)].join("\n")
    : `${String(content).trimEnd()}\n\n${block.join("\n")}`;
  if (!readArtefactBindings(candidate).valid) throw new Error("AGDF_ARTEFACT_BINDINGS_INVALID");
  return candidate;
}

// Only explicit artefact recording can append proof. All other writes preserve the history.
export function assertArtefactBindingsChange(current, candidate, appendedBinding) {
  const before = readArtefactBindings(current), after = readArtefactBindings(candidate);
  if (!before.valid || !after.valid) throw new Error("AGDF_ARTEFACT_BINDINGS_INVALID");
  const expected = appendedBinding ? [...before.receipts, appendedBinding] : before.receipts;
  if (canonicalJson(after.receipts) !== canonicalJson(expected)
      || after.present !== (before.present || Boolean(appendedBinding))) throw new Error("AGDF_ARTEFACT_BINDINGS_CHANGED");
}
