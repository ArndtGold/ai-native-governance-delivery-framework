// Structural Run document parsing; receipt validation belongs to run-state-parser.
import { APPROVAL_GATES, runDocumentPath } from './run-identity.js';

// These tables used to repeat current facts. They are now rendered from the
// typed records in this document. They have no persistence or editing authority.
export const DERIVED_RUN_SECTIONS = Object.freeze([
  'Current Control State', 'Approvals', 'Gate Checklist', 'Artefacts', 'Artefact Chain', 'Evidence',
]);
export function hasPersistedDerivedState(content) {
  return String(content).split(/\r?\n/u).some(line => DERIVED_RUN_SECTIONS.includes(line.match(/^## (.+?)\s*$/u)?.[1])
    ) || /(?:^|\n)## Run Meta\s*\n(?:(?!\n## )[\s\S])*?^- (?:current_gate|next_allowed_action):/mu.test(String(content));
}
export function canonicalRunDocument(content) {
  const lines = String(content).replace(/\r\n?/gu, '\n').split('\n');
  let omitted = false, meta = false;
  return lines.filter(line => {
    const heading = line.match(/^## (.+?)\s*$/u);
    if (heading) { omitted = DERIVED_RUN_SECTIONS.includes(heading[1]); meta = heading[1] === 'Run Meta'; }
    return !omitted && !(meta && /^- (?:current_gate|next_allowed_action):/u.test(line));
  }).join('\n').trimEnd() + '\n';
}

// Decode display facts only. Family codecs validate exact shapes, digests,
// ordering and cross-record associations before a saved Run is accepted.
// Browser consumers share this pure projection; it never reads a file or clock.
function recordRows(content, heading) {
  return sectionTableRows(content, heading).slice(1).map(row => {
    const encoded = row.at(-1);
    if (!/^[A-Za-z0-9_-]+$/u.test(encoded ?? '') || encoded.length > 131072) throw Error('AGDF_RUN_RECORDS_INVALID');
    try {
      const base64 = encoded.replace(/-/gu, '+').replace(/_/gu, '/').padEnd(Math.ceil(encoded.length / 4) * 4, '=');
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    } catch { throw Error('AGDF_RUN_RECORDS_INVALID'); }
  });
}
export function projectRunFacts(content) {
  const approvals = new Map(APPROVAL_GATES.map(gate => [gate, { status: 'missing', evidence: '' }]));
  const artefacts = new Map(), chain = new Map(), immutableFiles = [];
  const currentEvidence = new Map();
  const evidence = recordRows(content, 'Evidence Bindings');
  const byId = new Map(evidence.map(row => [row.operation_id, row]));
  const events = [
    ...recordRows(content, 'Run Operations').map(record => ({ type: 'operation', revision: record.effect?.revision, record })),
    ...recordRows(content, 'Artefact Bindings').map(record => ({ type: 'binding', revision: record.operation?.revision, record })),
    ...recordRows(content, 'Approval Operations').map(record => ({ type: 'approval', revision: record.effect?.revision, record })),
    ...recordRows(content, 'Source Revisions').map(record => ({ type: 'revision', revision: record.revision, record })),
  ].sort((a, b) => a.revision - b.revision);
  const put = (type, path, status) => artefacts.set(type, {
    path, status, notes: '', raw_path: path, path_format: 'plain', path_reason: path ? 'none' : 'empty',
  });
  const invalidate = gate => {
    const affected = ['UR', 'PRD', 'SD', 'TP'].slice(['UR', 'PRD', 'SD', 'TP'].indexOf(gate));
    for (const name of [...affected, 'QA', 'UAT']) approvals.set(name, { status: 'missing', evidence: '' });
    for (const name of [...affected, 'QA']) { put(name, '', 'missing'); chain.delete(name); }
  };
  for (const { type, record } of events) {
    if (type === 'revision') {
      invalidate(record.source_gate);
      currentEvidence.clear();
      const retained = new Set(record.analyses.filter(row => row.disposition === 'retain').map(row => row.type));
      for (const name of new Set([...artefacts.keys(), 'Brownfield Analysis', 'CD+Tests', 'CR'])) if (!['UR', 'PRD', 'SD', 'TP'].includes(name) && !retained.has(name)) {
        put(name, '', 'missing'); chain.delete(name);
      }
    } else if (type === 'binding') {
      const destination = record.destination;
      const name = destination.type === 'QA_REPORT' ? 'QA' : destination.type;
      put(name, destination.path, destination.status);
      if (name === 'QA' && byId.has(record.operation.id)) currentEvidence.set('QA', byId.get(record.operation.id));
      chain.set(name, { ...record.relationship, evidence: `binding ${record.binding_id}; reviewed by ${record.review.reviewer}` });
    } else if (type === 'approval') {
      const gate = record.binding.gate;
      const attestation = `${record.effect.approval} · ${record.created_at.slice(0, 10)} · presentation ${record.binding.presentation_id} ${record.effect.presentation_digest}`;
      approvals.set(gate, { status: 'approved', evidence: attestation });
      if (['UR', 'PRD', 'SD', 'TP'].includes(gate) && artefacts.get(gate)?.path) put(gate, artefacts.get(gate).path, 'approved');
      if (gate === 'UR') chain.set('UR', { from: 'UR', relationship: 'approved_by', to: 'Approval: UR', evidence: attestation });
    } else {
      const r = record.effect.record;
      if (record.kind === 'run.create_from_planned') {
        put('UR', runDocumentPath(record.run_id, 'UR.md'), 'draft'); immutableFiles.push(r.snapshot.path);
      }
      else if (['step.record', 'ur_draft.replace'].includes(record.kind)) {
        const binding = byId.get(r.evidence_binding_id);
        if (!binding) throw Error('AGDF_EVIDENCE_BINDINGS_INVALID');
        const name = ({ ur: 'UR', route: 'Brownfield Review', review: 'CR' })[binding.step] ?? binding.step;
        currentEvidence.set(binding.step, binding);
        if (binding.step !== 'evidence') put(name, binding.report.path, binding.step === 'ur' ? 'draft' : r.status);
      } else if (record.kind === 'prd_revision.reopen') {
        approvals.set('PRD', { status: 'missing', evidence: '' });
        const previous = artefacts.get('PRD'); if (previous?.path) put('PRD', previous.path, 'draft');
      }
      else if (record.kind === 'closeout.record') {
        put('OR', (r.verified_change ?? r.or).path, 'done');
        if (r.mode === 'verified_change') put('Verified Change', r.verified_change.path, 'executed');
      }
    }
  }
  return { approvals, artefacts, immutable_files: immutableFiles, artefact_chain: [...chain.values()], evidence_refs: [...currentEvidence.values()].map(row => ({
    evidence: row.step, source: row.report.path, covers: `operation ${row.operation_id}`, strength: 'bound cooperative result',
  })) };
}
export function scalarFields(content) {
  const values = new Map(),
    duplicates = [];
  const runMeta = content.match(/(?:^|\n)## Run Meta\s*\n([\s\S]*?)(?=\n## |$)/)?.[1] ?? "";
  for (const [, k, v] of runMeta.matchAll(/^- ([a-z_]+):[ \t]*(.*?)[ \t]*$/gm)) {
    if (values.has(k)) duplicates.push(k);
    else values.set(k, v.replace(/^`|`$/g, ""));
  }
  return { values, duplicates };
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
export function sectionTableRows(content, heading) {
  return rows(section(content, heading));
}
export function duplicateArtefactRowTypes(content) {
  const seen = new Set();
  const duplicates = new Set();
  for (const [type = ""] of sectionTableRows(content, "Artefacts")) {
    if (!type || type === "Type") continue;
    if (seen.has(type)) duplicates.add(type);
    else seen.add(type);
  }
  return [...duplicates];
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
function sectionScalar(c, h, k) {
  const body = section(c, h);
  const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [...body.matchAll(new RegExp(`^- ${escaped}:[^\\S\\r\\n]*(.*)$`, "gm"))];
  return {
    value: clean(matches[0]?.[1] ?? ""),
    count: matches.length,
  };
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
  const metaValues = scalarFields(content).values;
  const facts = projectRunFacts(content);
  const approvals = facts.approvals;
  const artefacts = facts.artefacts;
  const mapRows = (h, header, fn) => dataRows(content, h, header).map(fn);
  const mode = "Mode/Slice Decision",
    source = "Source And Scope State",
    memory = "Knowledge Persistence Decision",
    handoff = "Parent Reconciliation Handoff",
    aggregation = "Programme Aggregation Readiness";
  const disposition = sectionScalar(content, handoff, "parent_reconciliation_disposition");
  const reconciliationNextAction = sectionScalar(content, handoff, "parent_reconciliation_next_action");
  const acceptanceRef = sectionScalar(content, aggregation, "programme_acceptance_ref");
  const aggregationEvidence = sectionScalar(content, aggregation, "programme_aggregation_evidence");
  const aggregationMissingEvidence = sectionScalar(content, aggregation, "programme_aggregation_missing_evidence");
  return {
    run_id: clean(metaValues.get("run_id") ?? ""),
    current_gate: '',
    next_allowed_action: '',
    approvals,
    artefacts,
    artefact_row_duplicates: duplicateArtefactRowTypes(content),
    evidence_refs: facts.evidence_refs,
    artefact_chain: [...facts.artefact_chain, ...mapRows("Relationships", "From", (r) => ({
      from: r[0] ?? "",
      relationship: clean(r[1]),
      to: clean(r[2]),
      evidence: r[3] ?? "",
    }))],
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
      reconciliation: clean(field(content, 'context_graph_reconciliation')),
      refs: field(content, "context_graph_refs"),
      required_action: clean(field(content, "context_graph_required_action")),
      gate_effect: clean(field(content, "context_graph_gate_effect")),
      evidence: field(content, "context_graph_evidence"),
    },
    quality_outlook: field(content, "quality_outlook"),
    mode_slice_decision: {
      decision: clean(metaValues.get("mode") ?? ""),
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
    parent_reconciliation: {
      present: Boolean(section(content, handoff).trim()),
      disposition: disposition.value,
      next_action: reconciliationNextAction.value,
      field_counts: {
        disposition: disposition.count,
        next_action: reconciliationNextAction.count,
      },
    },
    programme_aggregation: {
      present: Boolean(section(content, aggregation).trim()),
      acceptance_ref: acceptanceRef.value,
      evidence: aggregationEvidence.value,
      missing_evidence: aggregationMissingEvidence.value,
      field_counts: {
        acceptance_ref: acceptanceRef.count,
        evidence: aggregationEvidence.count,
        missing_evidence: aggregationMissingEvidence.count,
      },
    },
  };
}
