export const RUN_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,127}$/;
export const LIFECYCLES = new Set([
  "active",
  "completed",
  "superseded",
  "abandoned",
]);
export function scalarFields(content) {
  const values = new Map(),
    duplicates = [];
  const runMeta = content.match(/(?:^|\n)## Run Meta\s*\n([\s\S]*?)(?=\n## |$)/)?.[1] ?? "";
  for (const [, k, v] of runMeta.matchAll(/^- ([a-z_]+):\s*(.*?)\s*$/gm)) {
    if (values.has(k)) duplicates.push(k);
    else values.set(k, v.replace(/^`|`$/g, ""));
  }
  return { values, duplicates };
}
export function parseRunState(content, expected) {
  const { values, duplicates } = scalarFields(content),
    findings = duplicates.map((field) => ({
      code: "AGDF_RUN_FIELD_DUPLICATE",
      field,
    })),
    id = values.get("run_id") ?? "";
  if (content.split(/\r?\n/).some((line) => line.trimStart().startsWith("|") && !line.trimEnd().endsWith("|"))) {
    findings.push({ code: "AGDF_RUN_TABLE_INVALID" });
  }
  if (!RUN_ID_PATTERN.test(id)) findings.push({ code: "AGDF_RUN_ID_INVALID" });
  if (expected && id !== expected)
    findings.push({ code: "AGDF_RUN_PATH_MISMATCH" });
  if (values.get("control_state_version") !== "2")
    findings.push({ code: "AGDF_RUN_VERSION_UNSUPPORTED" });
  if (!LIFECYCLES.has(values.get("lifecycle")))
    findings.push({ code: "AGDF_RUN_LIFECYCLE_INVALID" });
  if (!/^[1-9]\d*$/.test(values.get("revision") ?? ""))
    findings.push({ code: "AGDF_RUN_REVISION_INVALID" });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(values.get("revision_id") ?? ""))
    findings.push({ code: "AGDF_RUN_REVISION_ID_INVALID" });
  return {
    content,
    meta: Object.fromEntries(values),
    findings,
    valid: !findings.length,
  };
}
export function semanticBody(content) {
  return content
    .replace(/^# AGDF Run State\s*/m, "")
    .replace(/## Run Meta[\s\S]*?(?=\n## )/, "")
    .trim();
}
export function semanticFingerprint(content) {
  return semanticBody(content).replace(/\s+/g, " ");
}

function section(c, h) {
  const e = h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    c.match(
      new RegExp(`(?:^|\\n)## ${e}\\s*\\n([\\s\\S]*?)(?:\\n## |\\n# |$)`),
    )?.[1] ?? ""
  );
}
function rows(s) {
  return s
    .split(/\r?\n/)
    .filter((l) => l.trim().startsWith("|"))
    .map((l) =>
      l
        .split("|")
        .slice(1, -1)
        .map((x) => x.trim()),
    )
    .filter((r) => !r.every((x) => /^[-:]+$/.test(x)));
}
function clean(v = "") {
  return v.replace(/^`|`$/g, "").trim();
}
export function parseArtefactPathCell(value = "") {
  const raw = String(value).trim();
  if (!raw) return { raw, path: "", format: "plain", reason: "empty" };
  const ticks = [...raw].filter((character) => character === "`").length;
  if (ticks === 0) return { raw, path: raw, format: "plain", reason: "none" };
  if (ticks === 2 && raw.startsWith("`") && raw.endsWith("`")) {
    const path = raw.slice(1, -1).trim();
    if (path && !path.includes("`")) return { raw, path, format: "code_span", reason: "none" };
  }
  return {
    raw,
    path: "",
    format: "invalid",
    reason: ticks === 1 || raw.startsWith("`") !== raw.endsWith("`")
      ? "unmatched_delimiter"
      : "embedded_delimiter",
  };
}
function meaningful(v = "") {
  return Boolean(v && !(v.startsWith("`") && v.includes("|")));
}
function field(c, k) {
  return (
    c.match(new RegExp(`^- ${k}:[^\\S\\r\\n]*(.*)$`, "m"))?.[1]?.trim() ?? ""
  );
}
function sectionField(c, h, k) {
  return field(section(c, h), k);
}
function dataRows(c, h, header) {
  return rows(section(c, h)).filter(
    (r) =>
      r[0] !== header &&
      (h === "Evidence" ? r.slice(0, 3).some(meaningful) : r.some(meaningful)),
  );
}
export function parseControlState(
  content,
  { userGates = [], internalSteps = [], closeoutArtefacts = [] } = {},
) {
  const approvals = new Map();
  for (const h of ["Approvals", "Gate Checklist"])
    for (const [g, s, e] of rows(section(content, h))) {
      if (userGates.includes(g)) {
        const status = clean(s);
        approvals.set(g, {
          status: g === "QA" && (status === "pass" || status === "passed") ? "approved" : status,
          evidence: e ?? "",
        });
      }
    }
  const artefacts = new Map();
  for (const [t, p, s, n] of rows(section(content, "Artefacts"))) {
    if (userGates.includes(t) || internalSteps.includes(t) || closeoutArtefacts.includes(t)) {
      const parsedPath = parseArtefactPathCell(p ?? "");
      artefacts.set(t, {
        path: parsedPath.path,
        status: clean(s),
        notes: n ?? "",
        raw_path: parsedPath.raw,
        path_format: parsedPath.format,
        path_reason: parsedPath.reason,
      });
    }
  }
  const mapRows = (h, header, fn) => dataRows(content, h, header).map(fn);
  const mode = section(content, "Mode/Slice Decision").trim()
      ? "Mode/Slice Decision"
      : "Mode / Slice Decision",
    source = "Source And Scope State",
    memory = "Knowledge Persistence Decision";
  return {
    current_gate: field(content, "current_gate"),
    next_allowed_action: field(content, "next_allowed_action"),
    approvals,
    artefacts,
    evidence_refs: mapRows("Evidence", "Evidence", (r) => ({
      evidence: r[0] ?? "",
      source: r[1] ?? "",
      covers: r[2] ?? "",
      strength: clean(r[3]),
    })),
    artefact_chain: mapRows("Artefact Chain", "From", (r) => ({
      from: r[0] ?? "",
      relationship: clean(r[1]),
      to: clean(r[2]),
      evidence: r[3] ?? "",
    })),
    missing_evidence: mapRows("Missing Evidence", "Missing evidence", (r) => ({
      missing_evidence: r[0] ?? "",
      impact: clean(r[1]),
      required_next_step: r[2] ?? "",
    })),
    risks: mapRows("Risks", "Risk", (r) => ({
      risk: r[0] ?? "",
      impact: clean(r[1]),
      mitigation_or_owner: r[2] ?? "",
    })),
    context_graph: {
      impact: clean(field(content, "context_graph_impact")),
      refs: field(content, "context_graph_refs"),
      required_action: clean(field(content, "context_graph_required_action")),
      gate_effect: clean(field(content, "context_graph_gate_effect")),
      evidence: field(content, "context_graph_evidence"),
    },
    quality_outlook: field(content, "quality_outlook"),
    mode_slice_decision: {
      decision: clean(sectionField(content, mode, "decision")),
      required_next_gate: clean(
        sectionField(content, mode, "required_next_gate"),
      ),
      scope_reason: sectionField(content, mode, "scope_reason"),
      evidence: sectionField(content, mode, "evidence"),
    },
    source_scope: {
      normative_instruction_source: sectionField(
        content,
        source,
        "normative_instruction_source",
      ),
      multi_scope_state: clean(
        sectionField(content, source, "multi_scope_state"),
      ),
      active_scope_evidence: sectionField(
        content,
        source,
        "active_scope_evidence",
      ),
      competing_scope_lines: sectionField(
        content,
        source,
        "competing_scope_lines",
      ),
      branch_workspace_evidence: sectionField(
        content,
        source,
        "branch_workspace_evidence",
      ),
      branch_workspace_scope_effect: clean(
        sectionField(content, source, "branch_workspace_scope_effect"),
      ),
    },
    memory: {
      target: clean(sectionField(content, memory, "memory_target")),
      reason: sectionField(content, memory, "memory_reason"),
      refs: sectionField(content, memory, "memory_refs"),
    },
  };
}
