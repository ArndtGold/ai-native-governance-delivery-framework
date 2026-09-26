import { createHash } from "node:crypto";
import { readFileSync, realpathSync, statSync } from "node:fs";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { normalizeLineEndings, parseArtefactPathCell, scalarFields, sectionTableRows } from "./run-state-parser.js";

// The seal makes unrecorded edits visible: content_seal covers the run state and every file listed
// under Artefacts, approval_seal covers only the recorded gate approvals. It detects changes made
// outside run-update and run-approve; it is not a signature and does not resist deliberate tampering.
export const APPROVAL_GATES = Object.freeze(["UR", "PRD", "SD", "TP", "QA", "UAT"]);
export const APPROVAL_SECTIONS = Object.freeze(["Approvals", "Gate Checklist"]);
const SEAL_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const REVISION_META_LINE = /^- (?:revision|revision_id|content_seal|approval_seal):/u;
const SEAL_META_LINE = /^- (?:content_seal|approval_seal):/u;

const sha256 = (text) => `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
const escapes = (path) => !path || path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path);

export function canonicalRunText(content) {
  return normalizeLineEndings(String(content ?? "")).replace(/^﻿/u, "");
}

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
  const path = String(rawPath ?? "").trim();
  if (!path || isAbsolute(path)) return "unresolved";
  const target = resolve(root, path);
  if (escapes(relative(root, target))) return "unresolved";
  let realTarget;
  try {
    realTarget = realpathSync(target);
  } catch {
    return "missing";
  }
  if (escapes(relative(realpathSync(root), realTarget)) || !statSync(realTarget).isFile()) return "unresolved";
  return sha256(canonicalRunText(readFileSync(realTarget, "utf8")));
}

function listedArtefactPaths(text) {
  const paths = [];
  for (const [, cell = ""] of sectionTableRows(text, "Artefacts")) {
    const parsed = parseArtefactPathCell(cell);
    const path = parsed.format === "invalid" ? parsed.raw : parsed.path;
    if (!path || /^path$/iu.test(path) || paths.includes(path)) continue;
    paths.push(path);
  }
  return paths;
}

export function approvalRecord(content) {
  const text = canonicalRunText(content);
  const approvals = new Map();
  for (const heading of APPROVAL_SECTIONS) {
    for (const [gate, status = "", evidence = ""] of sectionTableRows(text, heading)) {
      if (APPROVAL_GATES.includes(gate)) {
        approvals.set(gate, [status.replace(/^`|`$/gu, "").trim() || "missing", evidence.trim()]);
      }
    }
  }
  return APPROVAL_GATES.map((gate) => [gate, ...(approvals.get(gate) ?? ["missing", ""])].join("\t")).join("\n");
}

export function approvalSeal(content) {
  return sha256(["agdf-approval-seal/1", approvalRecord(content)].join("\n"));
}

export function computeRunSeals(root, content) {
  const text = canonicalRunText(content);
  const artefacts = listedArtefactPaths(text).map((path) => `${path}\t${artefactFileDigest(root, path)}`);
  return Object.freeze({
    content_seal: sha256(["agdf-run-seal/1", withoutMetaLines(text, REVISION_META_LINE), "\0artefacts", ...artefacts].join("\n")),
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
  return applyRunSeals(content, computeRunSeals(root, content));
}

export function runSealState(root, content) {
  const text = canonicalRunText(content);
  const { values } = scalarFields(text);
  const recorded = Object.freeze({ content_seal: values.get("content_seal"), approval_seal: values.get("approval_seal") });
  if (recorded.content_seal === undefined && recorded.approval_seal === undefined) return Object.freeze({ status: "unsealed" });
  if (!SEAL_PATTERN.test(recorded.content_seal ?? "") || !SEAL_PATTERN.test(recorded.approval_seal ?? "")) {
    return Object.freeze({ status: "invalid", recorded });
  }
  const actual = computeRunSeals(root, text);
  const status = actual.approval_seal !== recorded.approval_seal
    ? "approvals_changed"
    : actual.content_seal !== recorded.content_seal ? "content_changed" : "valid";
  return Object.freeze({ status, recorded, actual });
}
