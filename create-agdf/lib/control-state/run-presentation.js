import { randomUUID } from "node:crypto";
import { closeSync, constants, fstatSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { runPath } from "./run-state-reader.js";
import { readRun, rejected } from "./run-state-edits.js";
import { APPROVAL_GATES, runSealState } from "./run-seal.js";
import { hash } from "./run-presentation-render.js";

export { renderReviewableApproval } from "./run-presentation-render.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const recovery = "Run run-present for the current run/gate/revision, show its exact presentation, then wait for a NEW deliberate user response. Never bind an earlier reply retroactively.";

function directory(path) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error("presentation_path_invalid");
  return stat;
}

function checkedRunDirectory(root, runId) {
  const path = dirname(runPath(root, runId));
  for (const dir of [root, join(root, ".agdf"), join(root, ".agdf", "control"), join(root, ".agdf", "control", "runs"), path]) directory(dir);
  const state = lstatSync(join(path, "RUN_STATE.md"));
  if (state.isSymbolicLink() || !state.isFile()) throw new Error("presentation_path_invalid");
  return path;
}

function binding(root, { runId, gate, revisionId, language }, evaluateGateCheck) {
  checkedRunDirectory(root, runId);
  const run = readRun(root, runId);
  if (run.rejection) throw new Error(run.rejection.reason);
  if (run.meta.revision_id !== revisionId) throw new Error("stale_revision");
  const seal = runSealState(root, run.content);
  if (seal.status !== "valid") throw new Error("presentation_state_changed");
  const report = evaluateGateCheck(root, { runId, ...(language ? { presentationLanguage: language } : {}) });
  const artefactPresentation = report.approval_presentation;
  const text = artefactPresentation?.markdown;
  if (report.status !== "open" && report.blocking_reason && report.blocking_reason !== "none") {
    const error = new Error(report.blocking_reason);
    error.recovery = report.next_allowed_action;
    throw error;
  }
  if (report.status !== "open" || report.current_gate !== gate || report.missing_approval !== `Approval: ${gate}`
      || report.approval_presentation?.revision_id !== revisionId || !text) throw new Error("approval_presentation_unavailable");
  return { run_id: runId, gate, revision_id: revisionId, content_digest: seal.actual.content_seal,
    artefact_digest: artefactPresentation.artefact_digest,
    summary_digest: artefactPresentation.summary_digest,
    presentation_language: report.approval_presentation.presentation_language, presentation_digest: hash(text), text };
}

// Evidence of a prepared presentation, NOT a signature or proof of human visibility.
export function prepareRunPresentation(root, input, { evaluateGateCheck }) {
  const { runId, gate } = input;
  if (!APPROVAL_GATES.includes(gate)) return rejected(runId, "gate_invalid");
  try {
    const prepared = binding(root, input, evaluateGateCheck);
    const dir = join(checkedRunDirectory(root, runId), "presentations");
    try { mkdirSync(dir); } catch (error) { if (error.code !== "EEXIST") throw error; }
    const identity = directory(dir);
    const presentationId = randomUUID();
    const { text, ...bindingRecord } = prepared;
    const record = { schema_version: 1, presentation_id: presentationId, created_at: new Date().toISOString(), ...bindingRecord };
    const body = JSON.stringify(record);
    const envelope = JSON.stringify({ record, digest: hash(body) }, null, 2) + "\n";
    const fd = openSync(join(dir, `${presentationId}.json`), "wx", 0o600);
    try { writeFileSync(fd, envelope); fsyncSync(fd); } finally { closeSync(fd); }
    const after = directory(dir);
    if (after.dev !== identity.dev || after.ino !== identity.ino) throw new Error("presentation_path_invalid");
    const fresh = binding(root, input, evaluateGateCheck);
    if (JSON.stringify(fresh) !== JSON.stringify(prepared)) throw new Error("presentation_state_changed");
    return Object.freeze({ ...record, schema_version: "1", outcome: "prepared", text, record_digest: hash(body),
      next_action: "Show text verbatim before waiting for a deliberate response. Pass this presentation_id to run-approve only for that response." });
  } catch (error) {
    return rejected(runId, error.code ?? error.message, { recovery: error.recovery ?? recovery });
  }
}

export function validateRunPresentation(root, { runId, gate, revisionId, presentationId }, { evaluateGateCheck }) {
  if (!UUID.test(presentationId ?? "")) return { reason: "presentation_required", recovery };
  try {
    const dir = join(checkedRunDirectory(root, runId), "presentations");
    directory(dir);
    const path = join(dir, `${presentationId}.json`);
    const stat = lstatSync(path);
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 262144) throw new Error("presentation_path_invalid");
    const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    let envelope;
    try {
      const actual = fstatSync(fd);
      if (!actual.isFile() || actual.dev !== stat.dev || actual.ino !== stat.ino || actual.size > 262144) throw new Error("presentation_path_invalid");
      envelope = JSON.parse(readFileSync(fd, "utf8"));
    } finally { closeSync(fd); }
    const { record, digest } = envelope;
    if (!record || record.schema_version !== 1 || record.presentation_id !== presentationId
        || record.run_id !== runId || record.gate !== gate || record.revision_id !== revisionId
        || digest !== hash(JSON.stringify(record)) || !Number.isFinite(Date.parse(record.created_at))) throw new Error("presentation_binding_invalid");
    const fresh = binding(root, { runId, gate, revisionId, language: record.presentation_language }, evaluateGateCheck);
    if (Object.entries(fresh).some(([key, value]) => key !== "text" && record[key] !== value)) throw new Error("presentation_state_changed");
    return { presentationId, digest };
  } catch (error) {
    return { reason: error.code === "ENOENT" ? "presentation_missing" : error.message, recovery: error.recovery ?? recovery };
  }
}
