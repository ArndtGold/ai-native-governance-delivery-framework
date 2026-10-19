import { section } from "./markdown-table.js";
const CRITERION_ID = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/u;

export const ACCEPTANCE_CRITERIA_FORMAT = Object.freeze({
  section: "Acceptance Criteria", declaration: "criterion_id: <stable id>",
  fields: "semicolon-separated inline fields or following bullet key: value lines",
  id_pattern: CRITERION_ID.source,
  examples: Object.freeze([
    "## Acceptance Criteria\n- criterion_id: AC-001; observable_success: Saved choice remains selected",
    "## Acceptance Criteria\n- criterion_id: AC-001\n  - observable_success: Saved choice remains selected",
  ]),
});

// Shared readiness/presentation grammar, retaining legacy inline declarations.
// Diagnostics refer to the original file and line, not a rewritten normal form.
export function readAcceptanceCriteria(markdown, { source = "PRD" } = {}) {
  const normalized = String(markdown).replace(/\r\n?/gu, "\n");
  const body = section(normalized, "Acceptance Criteria");
  const entries = [], diagnostics = [], openItems = [];
  const report = (code, line, field, message) => {
    diagnostics.push({ code, source, line, field, message }); openItems.push(message);
  };
  if (body === null) {
    report("criteria_section_missing", 1, "Acceptance Criteria", "PRD Acceptance Criteria section is missing");
    return { ids: [], entries, diagnostics, openItems };
  }
  const startLine = normalized.slice(0, normalized.indexOf(body)).split("\n").length;
  let current = null;
  const field = (clause, line) => {
    const match = clause.trim().replace(/^[-*]\s*/u, "").match(/^([a-z][a-z0-9_-]*(?:\s+[a-z][a-z0-9_-]*)*)\s*:\s*(.*)$/iu);
    if (!match) return;
    const name = match[1].replace(/\s+/gu, "_").toLowerCase();
    if (Object.hasOwn(current.fields, name)) {
      report("criterion_field_duplicate", line, name, `Duplicate PRD criterion field ${name}: ${current.id}`); return;
    }
    current.fields[name] = match[2].trim(); current.field_lines[name] = line;
  };
  for (const [index, line] of body.split("\n").entries()) {
    const lineNumber = startLine + index;
    if (/criterion_id\s*:/iu.test(line)) {
      const match = line.match(/criterion_id\s*:\s*([A-Za-z][A-Za-z0-9_-]*)\b(.*)$/iu);
      const id = match?.[1]?.toUpperCase();
      if (!id || !CRITERION_ID.test(id)) {
        report("criterion_id_invalid", lineNumber, "criterion_id", "Every PRD acceptance criterion needs a stable criterion_id");
        current = null; continue;
      }
      current = { id, fields: {}, source, line: lineNumber, field_lines: {} }; entries.push(current);
      const tail = match[2].trim();
      if (tail && !tail.startsWith(";")) report("criterion_fields_ambiguous", lineNumber, "criterion_id", `Ambiguous PRD criterion fields: ${id}`);
      else for (const clause of tail.replace(/^;/u, "").split(/;\s*/u)) field(clause, lineNumber);
    } else if (/^#{1,6}\s/u.test(line)) current = null;
    else if (current && /^\s*[-*]\s*[^:]+:/u.test(line)) field(line, lineNumber);
  }
  if (!entries.length) report("criteria_missing", startLine, "criterion_id", "Add at least one stable criterion_id to PRD acceptance criteria");
  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.id)) report("criterion_id_duplicate", entry.line, "criterion_id", `Duplicate PRD criterion_id: ${entry.id}`);
    seen.add(entry.id);
  }
  return { ids: entries.map(entry => entry.id), entries, diagnostics, openItems: [...new Set(openItems)] };
}
