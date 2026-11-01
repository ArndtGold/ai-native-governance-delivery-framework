import { createHash } from 'node:crypto';
import { runEvidencePath } from '../control-state/run-identity.js';
import { readSelectedRun } from '../control-state/run-state-reader.js';
import { runSealState } from '../control-state/run-seal.js';
import { hasSymlinkComponent } from '../control-state/contained-file.js';
import { mkdirSync, writeFileSync, readFileSync, lstatSync } from "node:fs";
import { dirname, join } from "node:path";
import { validateSearchResult } from "./contracts.js";

function safeResult(result) {
  return JSON.parse(JSON.stringify(result, (key, value) => {
    if (/(prompt|hidden_reasoning|secret|credential|source_snapshot)/i.test(key)) return undefined;
    return value;
  }));
}

export function persistSearchResult(targetDir, result) {
  const validated = validateSearchResult(result);
  if (!["recommendation", "no_safe_recommendation"].includes(validated.status)) {
    throw new Error(`search result status ${validated.status} is not persistable`);
  }
  if (validated.provenance.valid_evaluations < 1) {
    throw new Error("search result requires at least one valid evaluation before persistence");
  }
  const run = readSelectedRun(targetDir, validated.scope_key);
  if (!run.valid || runSealState(targetDir, run.content).status !== 'valid') throw Error('AGDF_SEARCH_CURRENT_RUN_REQUIRED');
  const relative = runEvidencePath(run.run_id, '');
  if (hasSymlinkComponent(targetDir, relative)) throw Error('AGDF_RUN_PATH_INVALID');
  const root = join(targetDir, relative);
  const safe = safeResult(validated);
  const jsonText = `${JSON.stringify(safe, null, 2)}\n`;
  const identity = createHash('sha256').update(jsonText).digest('hex');
  const jsonPath = join(root, `DELIVERY_PATH_SEARCH-${identity}.json`);
  const markdownPath = join(root, `DELIVERY_PATH_SEARCH-${identity}.md`);
  mkdirSync(dirname(jsonPath), { recursive: true });
  if (hasSymlinkComponent(targetDir, relative)) throw Error('AGDF_RUN_PATH_INVALID');
  const publish = (path, text) => {
    try { writeFileSync(path, text, { encoding: 'utf8', flag: 'wx' }); }
    catch (error) {
      if (error.code !== 'EEXIST' || !lstatSync(path).isFile() || lstatSync(path).isSymbolicLink() || readFileSync(path, 'utf8') !== text) throw error;
    }
  };
  publish(jsonPath, jsonText);
  const recommendation = safe.recommendation?.action ?? "No safe recommendation";
  publish(markdownPath, [
    "# Delivery Path Search Decision",
    "",
    `- status: ${safe.status}`,
    `- outcome_phase: ${safe.outcome_phase}`,
    `- scope_revision: ${safe.scope_revision}`,
    `- current_gate: ${safe.current_gate}`,
    `- enforcement: ${safe.enforcement.level}`,
    `- recommendation: ${recommendation}`,
    `- stopping_reason: ${safe.stopping_reason}`,
    `- evaluations: ${safe.budgets.evaluations}`,
    `- evaluation_attempts: ${safe.provenance.evaluation_attempts}`,
    `- invalid_evaluations: ${safe.provenance.invalid_evaluations}`,
    `- generation_status: ${safe.generation?.status ?? "legacy_deterministic"}`,
    `- generated_candidates: ${safe.generation ? `${safe.generation.accepted}/${safe.generation.returned}` : "0/0"}`,
    `- generation_cost_units: ${safe.generation?.cost_units ?? 0}`,
    `- generation_duration_ms: ${safe.generation?.duration_ms ?? 0}`,
    ...(safe.generation?.failure_code ? [`- generation_failure: ${safe.generation.failure_code}`] : []),
    `- next_gate_action: ${safe.next_gate_action}`,
    "",
    "This summary contains model judgements, not measured facts. Canonical AGDF gate-check remains authoritative.",
    "",
  ].join("\n"));
  return { jsonPath, markdownPath };
}
