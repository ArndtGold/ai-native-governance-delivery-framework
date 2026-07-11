import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function safeResult(result) {
  return JSON.parse(JSON.stringify(result, (key, value) => {
    if (/(prompt|hidden_reasoning|secret|credential|source_snapshot)/i.test(key)) return undefined;
    return value;
  }));
}

export function persistSearchResult(targetDir, result) {
  const root = join(targetDir, ".agdf", "control", "artefacts", result.scope_key);
  const jsonPath = join(root, "DELIVERY_PATH_SEARCH.json");
  const markdownPath = join(root, "DELIVERY_PATH_SEARCH.md");
  mkdirSync(dirname(jsonPath), { recursive: true });
  const safe = safeResult(result);
  writeFileSync(jsonPath, `${JSON.stringify(safe, null, 2)}\n`, "utf8");
  const recommendation = safe.recommendation?.action ?? "No safe recommendation";
  writeFileSync(markdownPath, [
    "# Delivery Path Search Decision",
    "",
    `- status: ${safe.status}`,
    `- current_gate: ${safe.current_gate}`,
    `- enforcement: ${safe.enforcement.level}`,
    `- recommendation: ${recommendation}`,
    `- stopping_reason: ${safe.stopping_reason}`,
    `- evaluations: ${safe.budgets.evaluations}`,
    `- generation_status: ${safe.generation?.status ?? "legacy_deterministic"}`,
    `- generated_candidates: ${safe.generation ? `${safe.generation.accepted}/${safe.generation.returned}` : "0/0"}`,
    `- generation_cost_units: ${safe.generation?.cost_units ?? 0}`,
    `- generation_duration_ms: ${safe.generation?.duration_ms ?? 0}`,
    ...(safe.generation?.failure_code ? [`- generation_failure: ${safe.generation.failure_code}`] : []),
    `- next_gate_action: ${safe.next_gate_action}`,
    "",
    "This summary contains model judgements, not measured facts. Canonical AGDF gate-check remains authoritative.",
    "",
  ].join("\n"), "utf8");
  return { jsonPath, markdownPath };
}
