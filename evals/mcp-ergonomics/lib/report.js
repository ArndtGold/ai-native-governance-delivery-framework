// Baseline assembly and REPORT.md rendering (SDD-012, PRD AC-011 to AC-013).
import { aggregateNative, NATIVE_METRICS } from "./aggregate.js";

const cell = value => value === null || value === undefined ? "–" : String(value).replaceAll("|", "\\|");
// Display only: floating-point noise is rounded to six decimals; baseline.json keeps the raw values.
const shown = value => typeof value === "number" && !Number.isInteger(value) ? Number(value.toFixed(6)) : value;
const table = (header, rows) => [`| ${header.join(" | ")} |`, `|${header.map(() => "---").join("|")}|`, ...rows.map(row => `| ${row.map(cell).join(" | ")} |`)].join("\n");

// Session fields that may carry free text stay in probe-results; the baseline keeps structured values.
// The pre-session MCP check keeps its per-attempt status and duration; launcher diagnostics are free text.
function baselineSession(session) {
  const { stderr, transcript, mcp_check: check, ...rest } = session;
  return check ? { ...rest, mcp_check: { connected: check.connected, attempts: check.attempts } } : rest;
}

export function assembleBaseline({ protocol, native, findingsMap }) {
  const sessions = native?.schedule?.sessions?.map(baselineSession) ?? [];
  return {
    schema_version: "1",
    kind: "agdf_mcp_ergonomics_baseline",
    matrix_version: protocol.matrix_version,
    task_set_version: native?.task_set_version ?? null,
    complete: Boolean(native?.complete),
    provenance: { protocol: protocol.provenance, native: native ? { ...native.provenance, agdf_version: native.install?.agdf_version ?? null } : null },
    protocol: { executions_per_call: protocol.executions_per_call, tools: protocol.tools, calls: protocol.calls, summary: protocol.summary },
    native: native ? { config: native.config, consumed_usd: native.schedule?.consumed_usd ?? null, cap_usd: native.schedule?.cap_usd ?? null,
      cap_reached: native.schedule?.cap_reached ?? null, isolation: native.isolation, error: native.error ?? null,
      reevaluation: native.reevaluation ?? null, sessions, cells: aggregateNative(sessions) } : null,
    findings_map: findingsMap,
  };
}

function protocolSection(protocol) {
  const tools = Object.entries(protocol.tools).flatMap(([server, value]) => value.metrics.map(metric => [server, metric.tool, metric.definition_bytes,
    `${metric.params_documented}/${metric.params_total}`, metric.documented_share, metric.description_chars, metric.has_output_schema ? "yes" : "no",
    metric.annotations ? `ro=${metric.annotations.readOnlyHint} d=${metric.annotations.destructiveHint} i=${metric.annotations.idempotentHint}` : "–"]));
  const calls = protocol.calls.map(row => [row.page ? `${row.id} p${row.page}` : row.id, row.tool, row.call_class, row.class, row.outcome,
    row.is_error, row.text_bytes, row.est_tokens, row.latency_ms.median, row.latency_ms.p95]);
  const classes = protocol.summary.classes;
  return [
    "## Protocol layer",
    "",
    `Call matrix ${protocol.matrix_version ?? "v1"}, ${protocol.executions_per_call} executions per call. Bytes are normalized (METRICS.md).`,
    "",
    "### Tools",
    "",
    table(["Server", "Tool", "Definition bytes", "Documented params", "Share", "Description chars", "Output schema", "Annotations"], tools),
    "",
    "### Calls",
    "",
    table(["Call", "Tool", "Matrix class", "Observed class", "Outcome", "isError", "Text bytes", "Est. tokens", "Latency median ms", "Latency p95 ms"], calls),
    "",
    `Classes: ok ${classes.ok}, sdk_validation ${classes.sdk_validation}, agdf_failure ${classes.agdf_failure}, tool_error_other ${classes.tool_error_other}, `
      + `protocol_error ${classes.protocol_error}; failures without isError ${classes.failure_without_isError} of ${classes.total} calls.`,
  ].join("\n");
}

function nativeSection(native) {
  if (!native) return "## Native layer\n\nNot part of this baseline.";
  const rows = Object.values(native.cells).map(entry => [entry.model, entry.variant, entry.task,
    entry.sessions.map(session => `${session.repetition}:${session.status}`).join(" "),
    ...NATIVE_METRICS.map(metric => {
      const value = entry.metrics[metric];
      return value ? (value.min === value.max ? shown(value.min) : `${value.values.map(shown).join("/")} (${shown(value.min)}–${shown(value.max)})`) : null;
    })]);
  const notMeasured = native.sessions.filter(session => session.status !== "measured")
    .map(session => `- ${session.model} ${session.variant} ${session.task} r${session.repetition}: ${session.status} (${session.reason ?? "no reason"})`);
  const planned = (native.config.models?.length ?? 0) * (native.config.variants?.length ?? 0) * (native.config.tasks?.length ?? 6) * (native.config.repetitions ?? 0);
  const status = native.error ? `The native run failed: ${native.error}`
    : !native.sessions.length ? "The native run recorded no sessions."
      : notMeasured.length ? `Sessions without measurement:\n\n${notMeasured.join("\n")}`
        : native.sessions.length < planned ? `${native.sessions.length} of ${planned} planned sessions were recorded and measured.` : "All planned sessions were measured.";
  return [
    "## Native layer",
    "",
    `Models ${native.config.models.join(", ")}; variants ${native.config.variants.join(", ")}; ${native.config.repetitions} repetitions; cost cap ${native.cap_usd ?? native.config.cap_usd} USD.`,
    `Consumed ${native.consumed_usd ?? 0} USD; cap reached: ${native.cap_reached ?? false}. Isolation: ${native.isolation?.ok ? "unchanged" : `changed (${(native.isolation?.changed ?? []).join(", ")})`}.`,
    "",
    ...(rows.length ? [table(["Model", "Variant", "Task", "Sessions", ...NATIVE_METRICS], rows), ""] : []),
    status,
    ...(native.reevaluation ? ["", `Success of ${native.reevaluation.tasks.join(", ")} was re-evaluated from the recorded transcripts with the corrected `
      + `predicate (${native.reevaluation.predicates.join(", ")}); ${native.reevaluation.changes.filter(change => change.before !== change.after).length} of `
      + `${native.reevaluation.changes.length} session verdicts changed.`] : []),
  ].join("\n");
}

function findingsSection(map) {
  return ["## Findings mapping", "", table(["ID", "Finding", "Metrics", "Note"], map.findings.map(entry => [entry.id, entry.finding,
    entry.metrics.length ? entry.metrics.join(", ") : "–", entry.not_measurable ? `Not measurable in this slice: ${entry.not_measurable}` : entry.partial ?? ""]))].join("\n");
}

export function renderReport(baseline) {
  const protocol = baseline.provenance.protocol;
  const native = baseline.provenance.native;
  return [
    "# MCP Ergonomics Baseline",
    "",
    `Status: ${baseline.complete ? "complete" : "incomplete"} · Matrix ${baseline.matrix_version} · Task set ${baseline.task_set_version ?? "–"}`,
    "",
    "## Provenance",
    "",
    table(["Field", "Value"], [["AGDF version", protocol.agdf_version], ["Git commit", protocol.git_commit], ["Server digest", protocol.server_digest],
      ["Dispatcher digest", protocol.dispatcher_digest], ["SDK digest", protocol.sdk_digest], ["Platform", protocol.platform], ["Protocol Node", protocol.node],
      ["Protocol", protocol.protocol], ["Protocol recorded at", protocol.recorded_at], ["Claude Code", native?.claude_code_version ?? null],
      ["Native Node", native?.node ?? null], ["Native git commit", native?.git_commit ?? null],
      ["Native recorded at", native?.recorded_at ?? null]]),
    "",
    protocolSection(baseline.protocol),
    "",
    nativeSection(baseline.native),
    "",
    findingsSection(baseline.findings_map),
    "",
    "## Limitations",
    "",
    "- Token counts are estimates (normalized bytes / 4), not tokenizer counts.",
    "- Native cost is Claude Code's reported API-equivalent figure.",
    "- Two repetitions show a range, not a robust spread.",
    "- Latency depends on the measuring machine and is not compared between runs.",
    "- T6 (`stale_write_guarded`) requires a write attempt with the stale revision that AGDF rejects; an agent that checks the revision first and asks instead of writing does not pass.",
    "",
  ].join("\n");
}
