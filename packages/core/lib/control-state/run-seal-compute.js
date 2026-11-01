import { runDocumentPath } from './run-identity.js';
import { canonicalRunText } from "./run-text.js";
export { canonicalRunText } from "./run-text.js";
import { APPROVAL_GATES } from "./run-identity.js";
import { approvalOperationsRecord } from "./approval-operations.js";
import { readSourceRevisions } from "./run-source-revisions.js";
import { canonicalJson } from "./approval-command-contract.js";
import { createHash } from "node:crypto";
import { readFileSync, memoizeControlRead } from "../control-read/fs.js";
import { basename, dirname } from "node:path";
import { parseArtefactPathCell, scalarFields, sectionTableRows, projectRunFacts, canonicalRunDocument } from "./run-state-document.js";
import { containedRegularFile, isSafeControlRelativePath } from "./contained-file.js";

// The seal makes unrecorded edits visible: content_seal covers the run state and the files
// derived from its records; approval_seal covers the recorded decisions and source revisions. It detects changes made
// outside typed recording, revision and approval; it is not a signature and does not resist deliberate tampering.
export { APPROVAL_GATES } from "./run-identity.js";
export const APPROVAL_SECTIONS = Object.freeze(["Approvals", "Gate Checklist"]);
const REVISION_META_LINE = /^- (?:revision|revision_id|content_seal|approval_seal):/u;
const SEAL_META_LINE = /^- (?:content_seal|approval_seal):/u;

const sha256 = (text) => `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;


function runMetaRange(lines) {
  const start = lines.findIndex((line) => /^## Run Meta\s*$/u.test(line));
  if (start < 0) return null;
  let end = start + 1;
  while (end < lines.length && !lines[end].startsWith("## ")) end += 1;
  return { start, end };
}

function withoutMetaLines(text, pattern) {
  const lines = text.split("\n");
  const range = runMetaRange(lines);
  if (!range) return text;
  return [
    ...lines.slice(0, range.start + 1),
    ...lines.slice(range.start + 1, range.end).filter((line) => !pattern.test(line)),
    ...lines.slice(range.end),
  ].join("\n");
}

export function runRootFromStatePath(path) {
  const runsDirectory = dirname(dirname(path));
  const controlDirectory = dirname(runsDirectory);
  const agdfDirectory = dirname(controlDirectory);
  if (basename(path) !== "RUN_STATE.md" || basename(runsDirectory) !== "runs"
      || basename(controlDirectory) !== "control" || basename(agdfDirectory) !== ".agdf") {
    throw new Error("AGDF_RUN_PATH_INVALID");
  }
  return dirname(agdfDirectory);
}

export function artefactFileDigest(root, rawPath) {
  return memoizeControlRead(`artefactDigest:${root}:${rawPath}`, () => capturedArtefactDigest(root, rawPath));
}

function capturedArtefactDigest(root, rawPath) {
  const path = String(rawPath ?? "").trim();
  const result = containedRegularFile(root, path);
  if (result.status !== "valid") return result.status === "missing" ? "missing" : "unresolved";
  return sha256(canonicalRunText(readFileSync(result.path, "utf8")));
}

export function listedArtefactPaths(text) {
  const facts = projectRunFacts(text);
  return [...new Set([...facts.artefacts.values()].map(row => row.path)
    .concat(facts.evidence_refs.map(row => row.source), facts.immutable_files).filter(Boolean))].sort();
}

// A current binding is published only with its owned output. Future files are
// not writable current metadata and cannot exempt an absent bound document.
export function pendingArtefactPaths() { return []; }

export function approvalRecord(content) {
  const facts = projectRunFacts(content);
  return APPROVAL_GATES.map(gate => [gate, facts.approvals.get(gate).status, facts.approvals.get(gate).evidence].join('\t')).join('\n');
}

export function approvalSeal(content) {
  const operations = approvalOperationsRecord(content);
  const revisions = readSourceRevisions(content);
  if (!revisions.valid) throw Error('AGDF_SOURCE_REVISIONS_INVALID');
  return sha256(['agdf-approval-seal/4', operations ?? '', canonicalJson(revisions.receipts)].join('\n'));
}

export function computeRunSeals(root, content, { selfReferenceDigest = "self", artefactDigests = new Map() } = {}) {
  const text = canonicalRunDocument(canonicalRunText(content));
  const runId = scalarFields(text).values.get("run_id");
  const selfPath = `.agdf/control/runs/${runId}/RUN_STATE.md`;
  // The run body is already covered above. Hashing its on-disk copy as an artefact creates
  // a circular dependency and invalidates the seal immediately after every atomic write.
  const artefacts = listedArtefactPaths(text).map((path) => `${path}\t${path === selfPath ? selfReferenceDigest : artefactDigests.get(path) ?? artefactFileDigest(root, path)}`);
  return Object.freeze({
    content_seal: sha256(["agdf-run-seal/2", withoutMetaLines(text, REVISION_META_LINE), "\0artefacts", ...artefacts].join("\n")),
    approval_seal: approvalSeal(text),
  });
}

export function applyRunSeals(content, seals) {
  const lines = withoutMetaLines(canonicalRunText(content), SEAL_META_LINE).split("\n");
  const range = runMetaRange(lines);
  if (!range) throw new Error("AGDF_RUN_STATE_INVALID");
  const revisionLine = lines.findIndex((line, index) => index > range.start && index < range.end && line.startsWith("- revision_id:"));
  lines.splice(revisionLine >= 0 ? revisionLine + 1 : range.start + 1, 0,
    `- content_seal: ${seals.content_seal}`,
    `- approval_seal: ${seals.approval_seal}`);
  return lines.join("\n");
}

export function sealRunState(root, content) {
  const canonical = canonicalRunDocument(canonicalRunText(content));
  return applyRunSeals(canonical, computeRunSeals(root, canonical));
}

