export const DELIVERY_PATHS = Object.freeze([
  "trivial_change", "quick_task", "compact_delivery",
  "verified_change", "structured_slice", "structured_delivery",
]);
export const PATH_RANK = Object.freeze(Object.fromEntries(DELIVERY_PATHS.map((path, index) => [path, index])));
export const STAGES = Object.freeze([
  "ungated_execution", "ur", "brownfield_review", "prd", "sd", "tp",
  "brownfield_analysis", "cd_tests", "cr", "qa", "uat", "or", "blocked",
]);
export const OBSERVATION_SCHEMA = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: ["schema_version", "observed_delivery_path", "ambiguous", "rationale", "decision_grounds"],
  properties: {
    schema_version: { type: "string", const: "1" },
    observed_delivery_path: { type: ["string", "null"], enum: [...DELIVERY_PATHS, null] },
    ambiguous: { type: "boolean" },
    rationale: { type: "string", maxLength: 600 },
    decision_grounds: { type: "array", maxItems: 12, items: { type: "string", maxLength: 120 } },
  },
});
export const STAGED_OBSERVATION_SCHEMA = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: [
    "schema_version", "observed_next_permissible_stage", "stage_evaluability",
    "observed_delivery_path", "path_evaluability", "rationale", "decision_grounds",
  ],
  properties: {
    schema_version: { type: "string", const: "2" },
    observed_next_permissible_stage: { type: ["string", "null"], enum: [...STAGES, null] },
    stage_evaluability: { type: "string", enum: ["evaluated", "not_evaluable_yet"] },
    observed_delivery_path: { type: ["string", "null"], enum: [...DELIVERY_PATHS, null] },
    path_evaluability: { type: "string", enum: ["evaluated", "not_evaluable_yet"] },
    rationale: { type: "string", maxLength: 600 },
    decision_grounds: { type: "array", maxItems: 12, items: { type: "string", maxLength: 120 } },
  },
});

const forbiddenBaselineKeys = new Set(["observed_delivery_path", "classification", "status", "passed"]);
const forbiddenText = /(api[_-]?key|access[_-]?token|cookie|authorization:\s*bearer|hidden reasoning|\/Users\/[^/\s]+|[A-Z]:\\Users\\[^\\\s]+)/i;
export function fail(message, code = "PROPORTIONALITY_SCHEMA_INVALID") {
  throw Object.assign(new Error(message), { code });
}
export function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}
export function validateBaseline(value) {
  if (value?.schema_version !== "1" || value?.baseline_version !== "1.0.0") fail("unsupported baseline");
  if (!Array.isArray(value.cases) || value.cases.length !== 40) fail("baseline must contain exactly 40 cases");
  const ids = new Set();
  for (const item of value.cases) {
    if (!/^PB-\d{3}$/.test(item.case_id) || ids.has(item.case_id)) fail(`invalid or duplicate case ${item.case_id}`);
    if (!DELIVERY_PATHS.includes(item.expected_delivery_path)) fail(`unknown path for ${item.case_id}`);
    if (!item.task_summary || !item.rationale || !item.evidence_ref || item.evidence_ref.startsWith("/")) fail(`incomplete case ${item.case_id}`);
    for (const key of forbiddenBaselineKeys) if (key in item) fail(`baseline contains forbidden field ${key}`);
    ids.add(item.case_id);
  }
  if (new Set(value.cases.map((item) => item.expected_delivery_path)).size !== DELIVERY_PATHS.length) fail("baseline path coverage incomplete");
  if (value.cases.filter((item) => item.adversarial).length < 10) fail("adversarial coverage too small");
  return value;
}
export function normalizeAgentOutput(raw) {
  let value;
  try { value = typeof raw === "string" ? JSON.parse(raw) : raw; }
  catch { fail("agent output is not JSON", "PROPORTIONALITY_OUTPUT_INVALID"); }
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("agent output is not an object", "PROPORTIONALITY_OUTPUT_INVALID");
  const allowedKeys = new Set(["schema_version", "observed_delivery_path", "ambiguous", "rationale", "decision_grounds"]);
  if (Object.keys(value).some((key) => !allowedKeys.has(key))) fail("agent output contains unknown fields", "PROPORTIONALITY_OUTPUT_INVALID");
  if (value.schema_version !== "1" || typeof value.ambiguous !== "boolean") fail("agent output contract mismatch", "PROPORTIONALITY_OUTPUT_INVALID");
  if (value.observed_delivery_path !== null && !DELIVERY_PATHS.includes(value.observed_delivery_path)) fail("unknown observed path", "PROPORTIONALITY_OUTPUT_INVALID");
  if (typeof value.rationale !== "string" || value.rationale.length > 600 || forbiddenText.test(value.rationale)) fail("unsafe rationale", "PROPORTIONALITY_REDACTION_FAILED");
  if (!Array.isArray(value.decision_grounds) || value.decision_grounds.length > 12 || value.decision_grounds.some((item) => typeof item !== "string" || item.length > 120 || forbiddenText.test(item))) fail("unsafe decision grounds", "PROPORTIONALITY_REDACTION_FAILED");
  let path = value.observed_delivery_path;
  let ambiguous = value.ambiguous || path === null;
  if (path === "compact_delivery") {
    const grounds = value.decision_grounds.map((item) => item.toLowerCase()).join(" ");
    if (!grounds.includes("ur") || !grounds.includes("brownfield") || !grounds.includes("quick_task")) {
      path = null;
      ambiguous = true;
    }
  }
  if (ambiguous) path = null;
  return { schema_version: "1", observed_delivery_path: path, ambiguous, rationale: value.rationale, decision_grounds: [...value.decision_grounds] };
}
export function normalizeStagedAgentOutput(raw, requestedAxes) {
  let value;
  try { value = typeof raw === "string" ? JSON.parse(raw) : raw; }
  catch { fail("agent output is not JSON", "PROPORTIONALITY_OUTPUT_INVALID"); }
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("agent output is not an object", "PROPORTIONALITY_OUTPUT_INVALID");
  const allowed = new Set(Object.keys(STAGED_OBSERVATION_SCHEMA.properties));
  if (Object.keys(value).some((key) => !allowed.has(key))) fail("agent output contains unknown fields", "PROPORTIONALITY_OUTPUT_INVALID");
  if (value.schema_version !== "2" || (!STAGES.includes(value.observed_next_permissible_stage) && value.observed_next_permissible_stage !== null)) fail("invalid staged contract", "PROPORTIONALITY_OUTPUT_INVALID");
  if (!DELIVERY_PATHS.includes(value.observed_delivery_path) && value.observed_delivery_path !== null) fail("invalid staged path", "PROPORTIONALITY_OUTPUT_INVALID");
  if (!["evaluated", "not_evaluable_yet"].includes(value.stage_evaluability) || !["evaluated", "not_evaluable_yet"].includes(value.path_evaluability)) fail("invalid staged evaluability", "PROPORTIONALITY_OUTPUT_INVALID");
  for (const [axis, observed, evaluability] of [
    ["next_permissible_stage", value.observed_next_permissible_stage, value.stage_evaluability],
    ["eventual_delivery_path", value.observed_delivery_path, value.path_evaluability],
  ]) {
    const requested = requestedAxes.includes(axis);
    if (requested !== (evaluability === "evaluated") || (requested ? observed === null : observed !== null)) fail(`axis invariant failed: ${axis}`, "PROPORTIONALITY_OUTPUT_INVALID");
  }
  if (typeof value.rationale !== "string" || value.rationale.length > 600 || forbiddenText.test(value.rationale)) fail("unsafe rationale", "PROPORTIONALITY_REDACTION_FAILED");
  if (!Array.isArray(value.decision_grounds) || value.decision_grounds.length > 12 || value.decision_grounds.some((item) => typeof item !== "string" || item.length > 120 || forbiddenText.test(item))) fail("unsafe decision grounds", "PROPORTIONALITY_REDACTION_FAILED");
  if (value.observed_delivery_path === "compact_delivery") {
    const grounds = value.decision_grounds.join(" ").toLowerCase();
    if (!grounds.includes("ur") || !grounds.includes("brownfield") || !grounds.includes("quick_task")) fail("compact delivery evidence missing", "PROPORTIONALITY_OUTPUT_INVALID");
  }
  return {
    schema_version: "2",
    observed_next_permissible_stage: value.observed_next_permissible_stage,
    stage_evaluability: value.stage_evaluability,
    observed_delivery_path: value.observed_delivery_path,
    path_evaluability: value.path_evaluability,
    rationale: value.rationale,
    decision_grounds: [...value.decision_grounds],
  };
}
