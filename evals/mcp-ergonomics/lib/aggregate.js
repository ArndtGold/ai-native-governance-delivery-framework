// Native aggregation and baseline comparison (METRICS.md, SDD-012).

export const NATIVE_METRICS = Object.freeze(["success", "tool_calls_total", "invalid_argument_calls", "is_error_results",
  "agdf_failure_results", "agdf_shell_calls", "response_tokens_total", "total_tokens", "cost_usd", "wall_time_ms"]);
const PROTOCOL_FIELDS = Object.freeze(["tool", "call_class", "class", "outcome", "is_error", "failure_without_isError", "text_bytes", "structured_bytes", "est_tokens"]);
// Per-tool tools/list metrics (METRICS.md "Per tool"); all are non-timing and must stay equal.
const TOOL_FIELDS = Object.freeze(["definition_bytes", "params_total", "params_documented", "documented_share", "description_chars", "has_output_schema",
  "has_title", "annotations"]);

const sum = value => Object.values(value ?? {}).reduce((total, item) => total + (Number(item) || 0), 0);
const numeric = value => typeof value === "number" && Number.isFinite(value) ? value : null;

export function sessionValues(session) {
  return {
    success: session.success === true ? 1 : session.success === false ? 0 : null,
    tool_calls_total: session.tool_calls ? sum(session.tool_calls) : null,
    invalid_argument_calls: numeric(session.invalid_argument_calls),
    is_error_results: numeric(session.is_error_results),
    agdf_failure_results: numeric(session.agdf_failure_results),
    agdf_shell_calls: numeric(session.agdf_shell_calls),
    response_tokens_total: session.response_tokens ? sum(session.response_tokens) : null,
    total_tokens: numeric(session.total_tokens),
    cost_usd: numeric(session.cost_usd),
    wall_time_ms: numeric(session.wall_time_ms),
  };
}

export const cellKey = session => `${session.model}|${session.variant}|${session.task}`;

export function aggregateNative(sessions) {
  const cells = {};
  for (const session of sessions) {
    const key = cellKey(session);
    const cell = cells[key] ??= { model: session.model, variant: session.variant, task: session.task, sessions: [], metrics: {} };
    cell.sessions.push({ repetition: session.repetition, status: session.status, reason: session.reason ?? null });
    if (session.status !== "measured") continue;
    const values = sessionValues(session);
    for (const metric of NATIVE_METRICS) {
      if (values[metric] === null) continue;
      const entry = cell.metrics[metric] ??= { values: [], min: null, max: null };
      entry.values.push(values[metric]);
      entry.min = Math.min(...entry.values);
      entry.max = Math.max(...entry.values);
    }
  }
  return cells;
}

const rowKey = row => `${row.id}#${row.page ?? 0}`;

export function compareProtocol(baseline, fresh) {
  const differences = [];
  const base = new Map(baseline.calls.map(row => [rowKey(row), row]));
  const next = new Map(fresh.calls.map(row => [rowKey(row), row]));
  for (const key of new Set([...base.keys(), ...next.keys()])) {
    const left = base.get(key), right = next.get(key);
    if (!left || !right) { differences.push({ call: key, field: "presence", baseline: Boolean(left), fresh: Boolean(right) }); continue; }
    for (const field of PROTOCOL_FIELDS) if (left[field] !== right[field]) differences.push({ call: key, field, baseline: left[field], fresh: right[field] });
  }
  for (const server of new Set([...Object.keys(baseline.tools ?? {}), ...Object.keys(fresh.tools ?? {})])) {
    const left = baseline.tools?.[server], right = fresh.tools?.[server];
    if (JSON.stringify(left?.names) !== JSON.stringify(right?.names)) differences.push({ call: `tools:${server}`, field: "names", baseline: left?.names, fresh: right?.names });
    if (left?.total_definition_bytes !== right?.total_definition_bytes) differences.push({ call: `tools:${server}`, field: "total_definition_bytes",
      baseline: left?.total_definition_bytes, fresh: right?.total_definition_bytes });
    const baseTools = new Map((left?.metrics ?? []).map(metric => [metric.tool, metric]));
    const nextTools = new Map((right?.metrics ?? []).map(metric => [metric.tool, metric]));
    for (const tool of new Set([...baseTools.keys(), ...nextTools.keys()])) {
      const before = baseTools.get(tool), after = nextTools.get(tool);
      if (!before || !after) { differences.push({ call: `tools:${server}:${tool}`, field: "presence", baseline: Boolean(before), fresh: Boolean(after) }); continue; }
      for (const field of TOOL_FIELDS) {
        if (JSON.stringify(before[field] ?? null) !== JSON.stringify(after[field] ?? null)) {
          differences.push({ call: `tools:${server}:${tool}`, field, baseline: before[field] ?? null, fresh: after[field] ?? null });
        }
      }
    }
  }
  return { status: differences.length ? "changed" : "unchanged", differences };
}

export function compareNative(baselineCells, freshCells) {
  const results = [];
  for (const key of new Set([...Object.keys(baselineCells), ...Object.keys(freshCells)])) {
    const left = baselineCells[key], right = freshCells[key];
    for (const metric of NATIVE_METRICS) {
      const base = left?.metrics?.[metric], next = right?.metrics?.[metric];
      if (!base || !next) { results.push({ cell: key, metric, status: "not_comparable" }); continue; }
      const outside = next.values.some(value => value < base.min || value > base.max);
      results.push({ cell: key, metric, status: outside ? "changed" : "unchanged", baseline: [base.min, base.max], fresh: next.values });
    }
  }
  const changed = results.filter(row => row.status === "changed").length;
  const notComparable = results.filter(row => row.status === "not_comparable").length;
  // A metric that could not be compared is no evidence of "unchanged": the overall result is then incomplete.
  return { status: changed ? "changed" : notComparable || !results.length ? "incomplete" : "unchanged", changed, not_comparable: notComparable, results };
}

// AC-014: tools/list must stay byte-identical (names and normalized definitions).
export function compareToolCaptures(before, after) {
  const differences = [];
  for (const server of new Set([...Object.keys(before.servers ?? {}), ...Object.keys(after.servers ?? {})])) {
    const left = before.servers?.[server], right = after.servers?.[server];
    if (JSON.stringify(left?.names) !== JSON.stringify(right?.names)) differences.push(`${server}:names`);
    for (const name of new Set([...Object.keys(left?.definitions ?? {}), ...Object.keys(right?.definitions ?? {})])) {
      if (left?.definitions?.[name] !== right?.definitions?.[name]) differences.push(`${server}:${name}`);
    }
  }
  return { identical: differences.length === 0, differences };
}
