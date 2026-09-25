import { readFileSync } from "node:fs";
import { parseRunState } from "./run-state-parser.js";
import { runPath } from "./run-state-reader.js";

// Shared line-based edits for the recording commands (run-approve, run-step). They change only the
// addressed section or table row and keep every other byte of the run state.
const WRITE_REJECTIONS = new Map([
  ["AGDF_STALE_RUN_REVISION", "stale_revision"],
  ["AGDF_RUN_WRITE_LOCKED", "run_write_locked"],
  ["AGDF_RUN_APPROVALS_UNRECORDED", "approvals_unrecorded"],
  ["AGDF_RUN_SEAL_INVALID", "seal_invalid"],
  ["AGDF_RUN_STATE_INVALID", "run_state_invalid"],
]);

export function rejected(runId, reason, details = {}) {
  return Object.freeze({ schema_version: "1", outcome: "rejected", run_id: runId ?? null, reason, ...details });
}

export function readRun(root, runId) {
  let path;
  try {
    path = runPath(root, runId);
  } catch {
    return { rejection: rejected(runId, "run_id_invalid") };
  }
  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    return { rejection: rejected(runId, "run_missing") };
  }
  const parsed = parseRunState(content, runId);
  if (!parsed.valid) {
    return { rejection: rejected(runId, "run_state_invalid", { findings: parsed.findings.map((finding) => finding.code) }) };
  }
  return { path, content, meta: parsed.meta };
}

export function guardedWrite(runId, write) {
  try {
    return { state: write() };
  } catch (error) {
    const reason = WRITE_REJECTIONS.get(error?.message);
    if (!reason) throw error;
    return { rejection: rejected(runId, reason) };
  }
}

export function tableCells(line) {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

// The table parser splits on every pipe, so cell text must not contain one.
export function tableLine(cells) {
  return `| ${cells.map((cell) => String(cell).replaceAll("|", "/").replace(/\r?\n/gu, " ")).join(" | ")} |`;
}

function padded(cells, width) {
  return cells.length >= width ? cells : [...cells, ...Array(width - cells.length).fill("")];
}

export function firstSection(lines, heading) {
  const pattern = new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s*$`, "u");
  const start = lines.findIndex((line) => pattern.test(line));
  if (start < 0) return null;
  let end = start + 1;
  while (end < lines.length && !/^#{1,2} /u.test(lines[end])) end += 1;
  return { start, end };
}

export function tableLineIndexes(lines, range) {
  const indexes = [];
  for (let index = range.start + 1; index < range.end; index += 1) {
    if (lines[index].trimStart().startsWith("|")) indexes.push(index);
  }
  return indexes;
}

// Replaces the first `- key:` line anywhere, matching how the parser reads unsectioned fields.
export function replaceFirstScalar(text, key, value) {
  const pattern = new RegExp(`^- ${key}:.*$`, "mu");
  return pattern.test(text) ? text.replace(pattern, () => `- ${key}: ${value}`) : null;
}

export function replaceSectionScalar(text, heading, key, value) {
  const lines = text.split("\n");
  const range = firstSection(lines, heading);
  if (!range) return null;
  const prefix = `- ${key}:`;
  const index = lines.findIndex((line, position) => position > range.start && position < range.end && line.startsWith(prefix));
  if (index < 0) return null;
  lines[index] = `${prefix} ${value}`;
  return lines.join("\n");
}

// Replaces the rows whose `column` cell equals `key` (keeping extra columns) or appends one row.
export function upsertTableRow(text, heading, column, key, cells) {
  const lines = text.split("\n");
  const range = firstSection(lines, heading);
  if (!range) return null;
  const indexes = tableLineIndexes(lines, range);
  if (indexes.length < 2) return null;
  const width = tableCells(lines[indexes[0]]).length;
  const matches = indexes.slice(2).filter((index) => tableCells(lines[index])[column] === key);
  if (matches.length) {
    for (const index of matches) lines[index] = tableLine(padded([...cells, ...tableCells(lines[index]).slice(cells.length)], width));
  } else {
    lines.splice(indexes.at(-1) + 1, 0, tableLine(padded(cells, width)));
  }
  return lines.join("\n");
}

export function appendTableRow(text, heading, cells) {
  const lines = text.split("\n");
  const range = firstSection(lines, heading);
  if (!range) return null;
  const indexes = tableLineIndexes(lines, range);
  if (indexes.length < 2) return null;
  lines.splice(indexes.at(-1) + 1, 0, tableLine(padded(cells, tableCells(lines[indexes[0]]).length)));
  return lines.join("\n");
}

export function removeTableRows(text, heading, column, key) {
  const lines = text.split("\n");
  const range = firstSection(lines, heading);
  if (!range) return null;
  const doomed = new Set(tableLineIndexes(lines, range).slice(2).filter((index) => tableCells(lines[index])[column] === key));
  return lines.filter((_, index) => !doomed.has(index)).join("\n");
}
