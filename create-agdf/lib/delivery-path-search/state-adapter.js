import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CONTRACT_VERSION, GENERATOR_CONTRACT_VERSION, validateGeneratorRequest } from "./contracts.js";

function section(content, heading) {
  return content.match(new RegExp(`## ${heading}\\r?\\n([\\s\\S]*?)(?=\\r?\\n## |$)`))?.[1] ?? "";
}

function tableAnswers(content) {
  const answers = {};
  for (const line of section(content, "Current Control State").split(/\r?\n/)) {
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length >= 2 && cells[0] && !cells[0].startsWith("---") && cells[0] !== "Question") answers[cells[0]] = cells[1];
  }
  return answers;
}

function statusCard(content) {
  const card = {};
  for (const line of section(content, "Run Status Card").split(/\r?\n/)) {
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim().replace(/^`|`$/g, ""));
    if (cells.length >= 2 && cells[0] && !cells[0].startsWith("---") && cells[0] !== "Run status") card[cells[0]] = cells[1];
  }
  return card;
}

function listCell(value) {
  return String(value ?? "").split(/\s*;\s*/).map((item) => item.trim()).filter(Boolean);
}

export function searchInputFromControl(targetDir, options = {}) {
  const runPath = join(targetDir, ".agdf", "control", "AGDF_RUN.md");
  if (!existsSync(runPath)) throw new Error("missing .agdf/control/AGDF_RUN.md");
  const content = readFileSync(runPath, "utf8");
  const meta = Object.fromEntries([...content.matchAll(/^- ([a-z_]+):\s*(.+)$/gm)].map((match) => [match[1], match[2].replace(/^`|`$/g, "").trim()]));
  const answers = tableAnswers(content);
  const card = statusCard(content);
  const result = {
    contract_version: CONTRACT_VERSION,
    scope_key: options.scopeKey ?? meta.run_id ?? "unknown-scope",
    objective: section(content, "Objective").trim(),
    current_gate: card["Current gate"] ?? meta.current_gate ?? "unknown",
    allowed_actions: options.allowedActions ?? listCell(card["Allowed now"]),
    forbidden_actions: options.forbiddenActions ?? listCell(answers["What is explicitly forbidden right now?"]),
    evidence_refs: [...content.matchAll(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(direct|indirect)\s*\|/g)]
      .slice(1).map((match) => `${match[1].trim()}: ${match[2].trim()}`),
    risks: section(content, "Risks").split(/\r?\n/).filter((line) => line.startsWith("|") && !line.includes("---") && !line.includes("| Risk |")).map((line) => line.split("|")[1].trim()),
    enforcement: options.enforcement ?? { level: "instruction_only", evidence: ["surface instruction prohibits implementation during search"] },
    budgets: {
      max_candidates: options.maxCandidates ?? 5,
      max_depth: options.maxDepth ?? 2,
      max_evaluations: options.maxEvaluations ?? 8,
      max_duration_ms: options.maxDurationMs ?? 120000,
      max_cost_units: options.maxCostUnits ?? 20,
      stability_window: options.stabilityWindow ?? 3,
    },
  };
  if (options.generation?.enabled) result.generation = {
    enabled: true,
    max_calls: 1,
    max_proposals: options.generation.maxProposals ?? 5,
    max_duration_ms: options.generation.maxDurationMs ?? 30000,
    max_cost_units: options.generation.maxCostUnits ?? 5,
  };
  return result;
}

export function generatorRequestFromInput(input) {
  return validateGeneratorRequest({
    contract_version: GENERATOR_CONTRACT_VERSION,
    scope_key: input.scope_key,
    objective: input.objective,
    scope_summary: input.objective,
    current_gate: input.current_gate,
    allowed_actions: input.allowed_actions,
    forbidden_actions: input.forbidden_actions,
    artefact_refs: [],
    evidence: input.evidence_refs ?? [],
    missing_evidence: [],
    risks: input.risks ?? [],
    constraints: ["advisory only", "canonical gate-check remains authoritative"],
    enforcement: input.enforcement,
    budgets: {
      max_calls: input.generation.max_calls,
      max_proposals: input.generation.max_proposals,
      max_duration_ms: input.generation.max_duration_ms,
      max_cost_units: input.generation.max_cost_units,
    },
  });
}
