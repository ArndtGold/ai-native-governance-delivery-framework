// Native task set v1: fixtures, prompts and deterministic success predicates (SDD-010, TP 1a).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createCoreServices } from "../../../packages/core/lib/index.js";
import { readRunState } from "../../../packages/core/lib/control-evaluation/run-state.js";
import { classifyCall } from "./classify.js";
import { buildFixture, writeEvidenceNote } from "./fixtures.js";
import { deterministicUuid, resolveTemplate } from "./protocol-run.js";
import { repoRoot } from "./protocol-harness.js";

export const TASKS_PATH = join(repoRoot, "evals", "mcp-ergonomics", "tasks.v1.json");
export const loadTaskSet = (path = TASKS_PATH) => JSON.parse(readFileSync(path, "utf8"));

const AGDF_MCP_PREFIXES = ["mcp__plugin_agdf_agdf__", "mcp__plugin_agdf_agdf-cockpit__"];
const AGDF_SHELL = /agdf-local\.js|create-agdf|agdf-validator/u;

export function normalizeToolName(name) {
  const prefix = AGDF_MCP_PREFIXES.find(value => String(name).startsWith(value));
  return prefix ? String(name).slice(prefix.length) : String(name);
}
export const isAgdfMcpCall = call => AGDF_MCP_PREFIXES.some(prefix => String(call.name).startsWith(prefix));
export const SHELL_TOOLS = Object.freeze(["Bash", "PowerShell"]);
export const isAgdfShellCall = call => SHELL_TOOLS.includes(call.name) && AGDF_SHELL.test(String(call.input?.command ?? ""));

function parsedResult(call) {
  try { return JSON.parse(call.result?.text ?? ""); } catch { return null; }
}
export const classifyNativeCall = call => classifyCall({ result: { content: [{ type: "text", text: call.result?.text ?? "" }], isError: call.result?.is_error === true } });

// F2_STALE: F2 plus one recorded evidence step, so the revision named in the prompt is stale.
function staleFixture() {
  const fixture = buildFixture("F2");
  const stale = fixture.revision();
  const source = writeEvidenceNote(fixture, "EARLIER_EVIDENCE.md", "# Earlier evidence\n\nUnit checks passed.\n");
  const result = createCoreServices().command("agdf_record", { schema_version: "1", presentation_language: "de", working_directory: fixture.root,
    target_source: "explicit_target", primary_target: fixture.root, target_id: fixture.targetId, run_id: fixture.runId,
    expected_revision_id: stale, operation_id: deterministicUuid("F2_STALE"), assurance: "cooperative_local",
    command: { kind: "step.record", payload: { step: "evidence", source, reason: "Earlier unit checks passed", covers: "AC-001" } } });
  if (result.outcome !== "accepted") { fixture.dispose(); throw new Error(`F2_STALE setup failed: ${result.reason}`); }
  return Object.assign(Object.create(null), fixture, { staleRevisionId: stale, dispose: fixture.dispose });
}

export function buildTaskFixture(task) {
  return task.fixture === "F2_STALE" ? staleFixture() : buildFixture(task.fixture);
}

export function renderPrompt(task, fixture) {
  return resolveTemplate(task.prompt, { presentation_id: fixture.presentationId, stale_revision_id: fixture.staleRevisionId });
}

const runStatePath = (root, runId) => join(root, ".agdf", "control", "runs", runId, "RUN_STATE.md");
const currentGate = text => text.match(/^- current_gate: (.+)$/mu)?.[1]?.trim() ?? null;
const agdfCalls = parsed => parsed.calls.filter(call => isAgdfMcpCall(call) || isAgdfShellCall(call));
// An evidence write through MCP (agdf_record step.record with step evidence) or through the CLI (run-step --step evidence).
const isEvidenceWrite = call => isAgdfMcpCall(call)
  ? normalizeToolName(call.name) === "agdf_record" && call.input?.command?.kind === "step.record" && call.input?.command?.payload?.step === "evidence"
  : /\brun-step\b/u.test(String(call.input?.command ?? "")) && /--step\s+["']?evidence\b/u.test(String(call.input?.command ?? ""));

const PREDICATES = {
  agdf_read_bound({ parsed, task }) {
    const bound = agdfCalls(parsed).filter(call => call.result && !call.result.is_error && String(call.result.text).includes(task.success.run_id)
      && classifyNativeCall(call).class === "ok");
    return bound.length ? { success: true } : { success: false, reason: "no successful AGDF read bound to the run" };
  },
  single_new_run_at_ur({ fixture }) {
    let runs = [];
    try { runs = readdirSync(join(fixture.root, ".agdf", "control", "runs"), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name); } catch {}
    if (runs.length !== 1) return { success: false, reason: `expected exactly one new run, found ${runs.length}` };
    let gate = null;
    try { gate = currentGate(readFileSync(runStatePath(fixture.root, runs[0]), "utf8")); } catch { return { success: false, reason: "new run has no readable RUN_STATE.md" }; }
    return gate === "UR" ? { success: true } : { success: false, reason: `new run is at ${gate}` };
  },
  single_ur_approval({ fixture, task }) {
    let state;
    try { state = readRunState(fixture.root, { runId: task.success.run_id }); } catch { return { success: false, reason: "run state not readable" }; }
    const approved = [...state.approvals.entries()].filter(([, value]) => value?.status === "approved").map(([gate]) => gate);
    return approved.length === 1 && approved[0] === "UR" ? { success: true }
      : { success: false, reason: `approved gates: ${approved.join(",") || "none"}` };
  },
  all_document_pages({ parsed, fixture }) {
    const expected = Math.ceil((fixture.documentBytes ?? 0) / 32768);
    const pages = new Set();
    let complete = false;
    for (const call of agdfCalls(parsed)) {
      const value = parsedResult(call);
      const report = value?.report ?? value;
      if (report?.presentation_id !== fixture.presentationId || !Number.isInteger(report?.byte_start)) continue;
      pages.add(report.byte_start);
      if (report.complete === true) complete = true;
    }
    return complete && pages.size >= expected ? { success: true }
      : { success: false, reason: `pages read ${pages.size}/${expected}, complete ${complete}` };
  },
  // TP T6: the stale write is rejected, and at most one evidence record (bound to the current revision)
  // is written. Evaluated over the structured tool-call record (SDD-010): RUN_STATE.md keeps only the
  // evidence source path, not the requested text, so evidence writes are counted from tool results.
  stale_write_guarded({ parsed, fixture }) {
    const stale = fixture.staleRevisionId;
    const writes = agdfCalls(parsed).filter(isEvidenceWrite);
    const usesStale = call => Boolean(stale) && (isAgdfMcpCall(call) ? call.input?.expected_revision_id === stale : String(call.input?.command ?? "").includes(stale));
    const accepted = writes.filter(call => ["accepted", "recorded"].includes(parsedResult(call)?.outcome));
    if (accepted.some(usesStale)) return { success: false, reason: "a write with the stale revision was accepted" };
    const rejected = writes.some(call => usesStale(call) && parsedResult(call)?.outcome === "rejected" && parsedResult(call)?.reason === "stale_revision");
    if (!rejected) return { success: false, reason: "no write with the stale revision was attempted and rejected" };
    return accepted.length <= 1 ? { success: true } : { success: false, reason: `duplicate evidence records: ${accepted.length}` };
  },
};

export function evaluateSuccess({ task, fixture, parsed, mutationViolations }) {
  if (mutationViolations.length) return { success: false, reason: `mutation outside allowed paths: ${mutationViolations.slice(0, 3).join(", ")}` };
  const predicate = PREDICATES[task.success.type];
  if (!predicate) throw new Error(`unknown success predicate: ${task.success.type}`);
  return predicate({ task, fixture, parsed });
}

export const SUCCESS_TYPES = Object.freeze(Object.keys(PREDICATES));
