// Shared run inventory derived from stored run state texts only. Pure: no `node:` import, no file,
// clock, network or process access, so a bundled copy can serve hosts without the Core runtime.
// Callers pass validity findings from the full parser; this module never validates receipts.
import { scalarFields, sectionTableRows, projectRunFacts } from "./run-state-document.js";
import { RUN_ID_PATTERN } from "./run-identity.js";
import { isDecisionContentPlaceholder } from "../control-evaluation/decision-content-placeholder.js";

export const RUN_INVENTORY_SCHEMA_VERSION = "1";
export const RUN_INVENTORY_LIFECYCLES = Object.freeze(["active", "completed", "superseded", "abandoned"]);
export const RUN_INVENTORY_ATTENTION = Object.freeze(["decision_required", "clarification_required", "blocked", "in_progress", "unclear", "none"]);

// English first, German second.
const LABELS = Object.freeze({
  decision_required: ["Decision required", "Entscheidung erforderlich"],
  clarification_required: ["Clarification required", "Klärung erforderlich"],
  blocked: ["Blocked", "blockiert"],
  in_progress: ["In progress", "in Arbeit"],
  unclear: ["Unclear", "unklar"],
  none: ["History", "Historie"],
});
const TEXT = Object.freeze({
  basis: [revision => `Derived observation at revision ${revision}; no delivery authority.`,
    revision => `Abgeleitete Beobachtung der Revision ${revision}; keine Lieferfreigabe.`],
  basisUnknown: [() => "Derived observation at an unknown revision; no delivery authority.",
    () => "Abgeleitete Beobachtung unbekannter Revision; keine Lieferfreigabe."],
  history: [c => `History: ${c.completed} completed, ${c.superseded} superseded, ${c.abandoned} abandoned.`,
    c => `Historie: ${c.completed} abgeschlossen, ${c.superseded} abgelöst, ${c.abandoned} abgebrochen.`],
  inspect: [id => `Inspect the run with doctor --run ${id}.`, id => `Den Run mit doctor --run ${id} prüfen.`],
});
const languageIndex = language => /^de(?:-|$)/iu.test(String(language ?? "")) ? 1 : 0;
export const runInventoryLabel = (code, language) => (LABELS[code] ?? LABELS.unclear)[languageIndex(language)];
export const runInventoryHistoryLine = (counts, language) => TEXT.history[languageIndex(language)](counts);

const BLOCKED = new Set(["block", "blocked"]);
const CLARIFICATION = new Set(["revise", "decline"]);
const AWAITING = new Set(["pending", "awaiting_uat"]);
const WORKING = new Set(["open", "in_progress", "pass", "qa_approved", "completed"]);
const ATTENTION_ORDER = RUN_INVENTORY_ATTENTION.slice(0, 5);
const TITLE_LIMIT = 240;
const ISO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/u;

const plain = value => String(value ?? "").replace(/`/gu, "").trim();
const clip = text => (text.length > TITLE_LIMIT ? `${text.slice(0, TITLE_LIMIT - 1)}…` : text);

// The run-ID title every reader shows when no authored title exists.
export function normalizedRunTitle(runId) {
  const words = String(runId ?? "").replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  return words ? words.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase()) : "AGDF run";
}

// Lines of one level-two section up to the next heading; an empty section stays empty.
function sectionLines(text, heading) {
  const lines = text.split("\n"), start = lines.findIndex(line => line.trimEnd() === `## ${heading}`);
  if (start < 0) return [];
  const rest = lines.slice(start + 1), end = rest.findIndex(line => /^#{1,2} /u.test(line));
  return end < 0 ? rest : rest.slice(0, end);
}

function objectiveTitle(text, runId) {
  // The first paragraph, so hard-wrapped objectives stay whole.
  const lines = sectionLines(text, "Objective").map(value => value.trim()), first = lines.findIndex(Boolean);
  const paragraph = first < 0 ? [] : lines.slice(first), end = paragraph.indexOf("");
  const line = (end < 0 ? paragraph : paragraph.slice(0, end)).join(" ");
  const stripped = line.replace(/^(?:[-*>]|#+|\d+\.)\s+/u, "").replace(/\*\*|__|`/gu, "").replace(/\s+/gu, " ").trim();
  return isDecisionContentPlaceholder(stripped)
    ? { title: normalizedRunTitle(runId), title_source: "run_id" }
    : { title: clip(stripped), title_source: "objective" };
}

// Base64url receipt cells decoded for display facts only; undecodable cells are skipped.
function decodeReceipt(cell) {
  if (!/^[A-Za-z0-9_-]+$/u.test(cell)) return null;
  try {
    const base64 = cell.replace(/-/gu, "+").replace(/_/gu, "/").padEnd(Math.ceil(cell.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
    const receipt = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return receipt && typeof receipt === "object" ? receipt : null;
  } catch { return null; }
}
const receipts = text => ["Run Operations", "Approval Operations", "Artefact Bindings", "Source Revisions"]
  .flatMap(heading => sectionTableRows(text, heading).filter(row => row.length === 3).map(row => decodeReceipt(row[2])))
  .filter(Boolean);
const timeOf = value => (typeof value === "string" && ISO_TIME.test(value) && !Number.isNaN(Date.parse(value)) ? Date.parse(value) : null);

function lastActivity(decoded) {
  const times = decoded.map(receipt => timeOf(receipt.created_at)).filter(value => value !== null);
  if (times.length) return { at: new Date(Math.max(...times)).toISOString(), source: "receipt", precision: "time" };
  return { at: null, source: "none", precision: null };
}

function closureFacts(lifecycle, decoded) {
  if (!["superseded", "abandoned"].includes(lifecycle)) return null;
  const receipt = decoded.filter(row => row.kind === "lifecycle_close.record")
    .sort((left, right) => (timeOf(left.created_at) ?? 0) - (timeOf(right.created_at) ?? 0)).at(-1);
  const record = receipt?.effect?.record ?? {};
  const successor = record.successor && typeof record.successor.value === "string"
    ? { value: record.successor.value, verified: record.successor.verified === true } : null;
  return { outcome: lifecycle, reason: typeof record.reason === "string" ? record.reason : null, successor,
    closed_at: timeOf(receipt?.created_at) === null ? null : receipt.created_at };
}

// Attention from stored control state only; the first matching rule wins (PRD AC-003).
export function runAttention({ lifecycle, valid, decision, gateResult, presentationDecision, missing }) {
  if (valid && lifecycle !== "active") return "none";
  if (!valid) return "blocked";
  if (BLOCKED.has(decision) || BLOCKED.has(gateResult)) return "blocked";
  if (CLARIFICATION.has(decision) || gateResult === "revise" || presentationDecision) return "clarification_required";
  if (/(?<!\b(?:[Nn]o|[Nn]ot|[Ww]ithout) )\bApproval: (?:UR|PRD|SD|TP|QA|UAT|OR)\b/u.test(missing) || AWAITING.has(decision)) return "decision_required";
  if (WORKING.has(decision)) return "in_progress";
  return "unclear";
}

function entryOf(source, language) {
  const runId = String(source?.run_id ?? "");
  const text = typeof source?.text === "string" ? source.text.replace(/^﻿/u, "").replace(/\r\n?/gu, "\n") : null;
  const findings = [...(Array.isArray(source?.findings) ? source.findings : [])].map(finding => ({ ...finding }));
  const meta = text ? scalarFields(text).values : new Map();
  const lifecycle = meta.get("lifecycle") ?? null;
  if (!text) { if (!findings.length) findings.push({ code: "AGDF_RUN_STATE_UNAVAILABLE" }); }
  else if (meta.get("run_id") !== runId || !RUN_INVENTORY_LIFECYCLES.includes(lifecycle)) findings.push({ code: "AGDF_RUN_META_INVALID" });
  const valid = RUN_ID_PATTERN.test(runId) && findings.length === 0;
  const gate = source.observation?.current_gate ?? null;
  const decision = source.observation?.decision ?? null;
  const decoded = text ? receipts(text) : [];
  const facts = text && valid ? projectRunFacts(text) : null;
  const gateResult = facts?.artefacts.get(gate === 'Quick Task Execution' ? 'CR' : gate)?.status ?? null;
  const presentationDecision = source.observation?.presentation_decision === true;
  const missing = source.observation?.missing === 'none' ? '' : source.observation?.missing ?? '';
  const situation = source.observation?.work_situation;
  const attention = situation?.code ?? runAttention({ lifecycle, valid, decision, gateResult, presentationDecision, missing });
  const revision = /^[1-9]\d*$/u.test(meta.get("revision") ?? "") ? Number(meta.get("revision")) : null;
  const index = languageIndex(language);
  return {
    run_id: runId,
    ...(text ? objectiveTitle(text, runId) : { title: normalizedRunTitle(runId), title_source: "run_id" }),
    ...(source.presentation ? { presentation: source.presentation } : {}),
    valid,
    lifecycle: valid ? lifecycle : null,
    current_gate: gate,
    decision,
    attention: { code: attention, label: situation ? (index === 1 ? situation.de : situation.en) : LABELS[attention][index] },
    basis: revision === null ? TEXT.basisUnknown[index]() : TEXT.basis[index](revision),
    last_activity: text ? lastActivity(decoded) : { at: null, source: "none", precision: null },
    revision,
    revision_id: meta.get("revision_id") ?? null,
    missing: missing || null,
    next_action: source.observation?.next_action ?? null,
    path: `.agdf/control/runs/${runId}/RUN_STATE.md`,
    closure: valid ? closureFacts(lifecycle, decoded) : null,
    findings: valid ? [] : findings.map(finding => ({ ...finding, next_step: TEXT.inspect[index](runId) })),
  };
}

const groupOf = entry => (entry.lifecycle === null || entry.lifecycle === "active" ? 0 : 1 + RUN_INVENTORY_LIFECYCLES.indexOf(entry.lifecycle));
const activityOf = entry => (entry.last_activity.at === null ? -Infinity : Date.parse(entry.last_activity.at));
function compareEntries(left, right) {
  return groupOf(left) - groupOf(right)
    || (groupOf(left) === 0 ? ATTENTION_ORDER.indexOf(left.attention.code) - ATTENTION_ORDER.indexOf(right.attention.code) : 0)
    || activityOf(right) - activityOf(left)
    || (left.run_id < right.run_id ? -1 : left.run_id > right.run_id ? 1 : 0);
}

// `sources` is null when the repository has no run store; otherwise one item per run folder.
// Store-level findings, such as a runs path that is no directory, make the inventory incomplete.
export function buildRunInventory(sources, { language = "en", findings = [] } = {}) {
  const runs = Array.isArray(sources) ? sources.map(source => entryOf(source, language)).sort(compareEntries) : [];
  const lifecycle = Object.fromEntries([...RUN_INVENTORY_LIFECYCLES, "invalid"].map(key => [key, 0]));
  const attention = Object.fromEntries(RUN_INVENTORY_ATTENTION.map(key => [key, 0]));
  for (const run of runs) {
    lifecycle[run.valid ? run.lifecycle : "invalid"] += 1;
    attention[run.attention.code] += 1;
  }
  return {
    schema_version: RUN_INVENTORY_SCHEMA_VERSION,
    state: !Array.isArray(sources) ? "absent" : findings.length || runs.some(run => !run.valid) ? "incomplete" : "complete",
    counts: { total: runs.length, lifecycle, attention },
    runs,
    findings: findings.map(finding => ({ ...finding })),
    authorizes: false,
  };
}
