import { section, tableRows } from "./markdown-table.js";
import { evaluateTpPlanningContent } from "./tp-planning.js";
import { readFileSync } from "../control-read/fs.js";
import { resolvedArtefactFile } from "./run-state.js";

export const TRACEABILITY_CONTRACT = "Traceability contract: criteria-chain-v1";

const CRITERION_ID = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/u;
const TASK_ID = /^T-[A-Z0-9]+(?:-[A-Z0-9]+)*$/u;
const SCENARIO_ID = /^SCN-[A-Z0-9]+(?:-[A-Z0-9]+)*$/u;
const DESIGN_DECISION_ID = /^SDD-[A-Z0-9]+(?:-[A-Z0-9]+)*$/u;

export const TP_AUTHORING_FORMAT = Object.freeze({ declaration: TRACEABILITY_CONTRACT,
  tasks: Object.freeze({ section: 'Task List', columns: Object.freeze(['task_id', 'task']), id_pattern: TASK_ID.source }),
  verification: Object.freeze({ section: 'Verification Traceability', columns: Object.freeze(['criterion_id', 'design_decision_id', 'task_id', 'scenario_id', 'expected_result', 'evidence']), scenario_id_pattern: SCENARIO_ID.source, design_decision_id_pattern: DESIGN_DECISION_ID.source,
    cell_rule: 'One design_decision_id per row; criterion_id/scenario_id pairs are unique. Use separate applicable scenarios for additional design decisions.',
    table_rule: 'Rows must remain contiguous under their declared Markdown table header.',
    required_coverage: 'Every PRD criterion and every SD decision associated with that criterion needs a declared task, scenario, observable expected_result and evidence.' }),
});

function artifactText(targetDir, runState, type) {
  const path = resolvedArtefactFile(targetDir, runState.artefacts.get(type)?.path);
  return path ? readFileSync(path, "utf8") : null;
}

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

const acceptanceCriteria = readAcceptanceCriteria;


function unfinished(value) {
  const text = String(value ?? "").trim();
  return !text || /^(?:<|tbd\b|to confirm\b|todo\b)/iu.test(text);
}

function reasonedNone(value) {
  const text = String(value ?? "").trim();
  if (!/^(?:none|n\/a|not applicable)\b/iu.test(text)) return false;
  return /^(?:none|n\/a|not applicable)\s*(?:[:—-]\s*.+)$/iu.test(text);
}

function designDecisionIds(value) {
  const text = String(value ?? "").trim();
  if (reasonedNone(text) && !/^(?:none|n\/a|not applicable)$/iu.test(text)) return [];
  return text.split(",").map((item) => item.trim().toUpperCase());
}

function architectureDecisionIds(markdown) {
  const body = section(markdown, "Architecture Decisions");
  const openItems = [];
  const ids = [];
  let none = false;
  if (body === null) return { ids, none, openItems: ["SD Architecture Decisions section is missing"] };
  for (const line of body.split("\n").map((item) => item.trim()).filter((item) => /^[-*]\s+/u.test(item))) {
    const decision = line.replace(/^[-*]\s+/u, "").trim();
    if (/^none\b/iu.test(decision)) {
      if (!reasonedNone(decision) || /<[^>]+>|\b(?:tbd|to confirm|todo)\b/iu.test(decision)) {
        openItems.push("State why no binding SD decision is needed after 'none'");
      }
      if (none || ids.length) openItems.push("SD cannot combine 'none' with binding design decisions");
      none = true;
      continue;
    }
    const match = decision.match(/^(SDD-[A-Z0-9]+(?:-[A-Z0-9]+)*)\s*:\s*(.+)$/iu);
    if (!match) {
      openItems.push("Each binding SD decision needs a stable SDD-... ID and rationale");
      continue;
    }
    const id = match[1].toUpperCase();
    if (none) openItems.push("SD cannot combine 'none' with binding design decisions");
    if (ids.includes(id)) openItems.push(`Duplicate SD design decision ID: ${id}`);
    ids.push(id);
    const detail = match[2];
    const rationale = detail.match(/(?:^|;\s*)rationale:\s*([^;]+)/iu)?.[1]?.trim();
    const consequence = detail.match(/(?:^|;\s*)(?:consequence|trade-off):\s*([^;]+)/iu)?.[1]?.trim();
    if (unfinished(detail) || /<[^>]+>|\b(?:tbd|to confirm|todo)\b/iu.test(detail)
        || unfinished(rationale) || unfinished(consequence)) {
      openItems.push(`SD design decision ${id} needs a concrete rationale and consequence`);
    }
  }
  if (!ids.length && !none) openItems.push("List binding SD decisions by SDD ID, or record a reasoned none");
  return { ids, none, openItems };
}

function addCriterionCoverageErrors(openItems, criterionIds, rows, { exactlyOnce }) {
  const expected = new Set(criterionIds);
  const counts = new Map();
  for (const row of rows) {
    const id = String(row.criterion_id ?? "").trim().toUpperCase();
    if (!id || !expected.has(id)) {
      openItems.push(`Unknown or missing criterion_id in traceability table: ${id || "empty"}`);
      continue;
    }
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  for (const id of criterionIds) {
    const count = counts.get(id) ?? 0;
    if (!count) openItems.push(`PRD criterion ${id} is not mapped`);
    else if (exactlyOnce && count !== 1) openItems.push(`PRD criterion ${id} must have exactly one SD mapping`);
  }
}

export function evaluatePrdCriteriaReadiness(markdown) {
  if (!markdown.includes(TRACEABILITY_CONTRACT)) return { ready: true, open_items: [], contract: "legacy" };
  const criteria = acceptanceCriteria(markdown);
  return { ready: criteria.openItems.length === 0, open_items: criteria.openItems, diagnostics: criteria.diagnostics, contract: "criteria-chain-v1" };
}

export function evaluateSdTraceability(targetDir, runState) {
  const prd = artifactText(targetDir, runState, "PRD");
  const sd = artifactText(targetDir, runState, "SD");
  if (!sd) return { ready: true, open_items: [], contract: "not_linked" };
  if (!prd?.includes(TRACEABILITY_CONTRACT) && !sd.includes(TRACEABILITY_CONTRACT)) {
    return { ready: true, open_items: [], contract: "legacy" };
  }
  const openItems = [];
  if (!prd) openItems.push("Approved PRD artefact is missing for SD traceability");
  if (!prd?.includes(TRACEABILITY_CONTRACT)) openItems.push("PRD must declare the criteria-chain-v1 traceability contract");
  if (!sd.includes(TRACEABILITY_CONTRACT)) openItems.push("SD must retain the criteria-chain-v1 traceability contract");
  const criteria = acceptanceCriteria(prd ?? "");
  openItems.push(...criteria.openItems);
  const architecture = architectureDecisionIds(sd);
  openItems.push(...architecture.openItems);
  const required = ["criterion_id", "design_response", "source_of_truth", "design_decision_ids", "compatibility_risk"];
  const table = tableRows(sd, "Acceptance Traceability", required);
  if (table.error) openItems.push(table.error);
  const mappedDecisions = new Set();
  for (const row of table.rows) {
    for (const column of required.slice(1)) if (unfinished(row[column])) openItems.push(`SD mapping for ${row.criterion_id || "an acceptance criterion"} needs ${column}`);
    const decisions = designDecisionIds(row.design_decision_ids);
    if (!decisions.length && !reasonedNone(row.design_decision_ids)) openItems.push(`SD mapping for ${row.criterion_id || "an acceptance criterion"} needs an SDD-... id or a reasoned none`);
    for (const id of decisions) {
      if (!DESIGN_DECISION_ID.test(id)) openItems.push(`Invalid SD design_decision_id: ${id}`);
      else mappedDecisions.add(id);
    }
  }
  addCriterionCoverageErrors(openItems, criteria.ids, table.rows, { exactlyOnce: true });
  for (const id of architecture.ids) if (!mappedDecisions.has(id)) openItems.push(`SD design decision ${id} is not mapped to a PRD criterion`);
  for (const id of mappedDecisions) if (!architecture.ids.includes(id)) openItems.push(`SD mapping references undeclared decision ${id}`);
  if (architecture.none && mappedDecisions.size) openItems.push("SD acceptance mappings must use reasoned none when Architecture Decisions records none");
  return { ready: openItems.length === 0, open_items: [...new Set(openItems)], contract: "criteria-chain-v1" };
}

export function evaluateTpTraceability(targetDir, runState) {
  const prd = artifactText(targetDir, runState, "PRD");
  const sd = artifactText(targetDir, runState, "SD");
  const tp = artifactText(targetDir, runState, "TP");
  if (!tp) return { ready: true, open_items: [], contract: "not_linked" };
  const planning = evaluateTpPlanningContent(targetDir, runState, sd ?? "", tp);
  const strict = planning.declared || [prd, sd, tp].some((content) => content?.includes(TRACEABILITY_CONTRACT));
  if (!strict) return { ready: true, open_items: [], contract: "legacy" };
  const openItems = [];
  if (!prd?.includes(TRACEABILITY_CONTRACT)) openItems.push("PRD must declare the criteria-chain-v1 traceability contract");
  if (!sd?.includes(TRACEABILITY_CONTRACT)) openItems.push("SD must retain the criteria-chain-v1 traceability contract");
  if (!tp.includes(TRACEABILITY_CONTRACT)) openItems.push("TP must retain the criteria-chain-v1 traceability contract");
  const criteria = acceptanceCriteria(prd ?? "");
  openItems.push(...criteria.openItems);
  const sdReadiness = evaluateSdTraceability(targetDir, runState);
  if (!sdReadiness.ready) openItems.push(...sdReadiness.open_items.map((item) => `Upstream SD: ${item}`));
  const decisionTable = tableRows(sd ?? "", "Acceptance Traceability", ["criterion_id", "design_response", "source_of_truth", "design_decision_ids", "compatibility_risk"]);
  if (decisionTable.error) openItems.push(`Upstream SD: ${decisionTable.error}`);
  const decisionsByCriterion = new Map();
  for (const row of decisionTable.rows) decisionsByCriterion.set(String(row.criterion_id ?? "").toUpperCase(), designDecisionIds(row.design_decision_ids));

  const taskTable = tableRows(tp, TP_AUTHORING_FORMAT.tasks.section, TP_AUTHORING_FORMAT.tasks.columns);
  if (taskTable.error) openItems.push(taskTable.error);
  const taskIds = new Set();
  for (const row of taskTable.rows) {
    const id = String(row.task_id ?? "").trim().toUpperCase();
    if (!TASK_ID.test(id)) openItems.push(`Invalid TP task_id: ${id || "empty"}`);
    else if (taskIds.has(id)) openItems.push(`Duplicate TP task_id: ${id}`);
    else taskIds.add(id);
    if (unfinished(row.task)) openItems.push(`TP task ${id || "without id"} needs a task description`);
  }

  const required = TP_AUTHORING_FORMAT.verification.columns;
  const verification = tableRows(tp, TP_AUTHORING_FORMAT.verification.section, required);
  if (verification.error) openItems.push(verification.error);
  addCriterionCoverageErrors(openItems, criteria.ids, verification.rows, { exactlyOnce: false });
  const scenarios = new Set();
  const verifiedDecisions = new Map();
  for (const row of verification.rows) {
    const criterion = String(row.criterion_id ?? "").trim().toUpperCase();
    const task = String(row.task_id ?? "").trim().toUpperCase();
    const scenario = String(row.scenario_id ?? "").trim().toUpperCase();
    const decision = String(row.design_decision_id ?? "").trim().toUpperCase();
    if (!taskIds.has(task)) openItems.push(`TP scenario ${scenario || "without id"} references unknown task_id: ${task || "empty"}`);
    if (!SCENARIO_ID.test(scenario)) openItems.push(`Invalid TP scenario_id: ${scenario || "empty"}`);
    const scenarioKey = `${criterion}:${scenario}`;
    if (scenarios.has(scenarioKey)) openItems.push(`Duplicate TP scenario mapping: ${scenarioKey}`);
    scenarios.add(scenarioKey);
    for (const column of ["expected_result", "evidence"]) if (unfinished(row[column])) openItems.push(`TP scenario ${scenario || "without id"} needs ${column}`);
    const expectedDecisions = decisionsByCriterion.get(criterion) ?? [];
    if (expectedDecisions.length) {
      if (!expectedDecisions.includes(decision)) openItems.push(`TP scenario ${scenario || "without id"} must reference an SD decision for ${criterion}`);
      else {
        if (!verifiedDecisions.has(criterion)) verifiedDecisions.set(criterion, new Set());
        verifiedDecisions.get(criterion).add(decision);
      }
    } else if (!reasonedNone(decision)) {
      openItems.push(`TP scenario ${scenario || "without id"} needs the mapped SDD-... id or a reasoned none`);
    }
  }
  for (const [criterion, expectedDecisions] of decisionsByCriterion) {
    for (const decision of expectedDecisions) {
      if (!verifiedDecisions.get(criterion)?.has(decision)) openItems.push(`SD decision ${decision} for ${criterion} has no TP verification scenario`);
    }
  }
  openItems.push(...planning.open_items);
  return { ready: openItems.length === 0, open_items: [...new Set(openItems)], contract: "criteria-chain-v1",
    ...(planning.clarifications.length ? { clarifications: planning.clarifications } : {}) };
}
