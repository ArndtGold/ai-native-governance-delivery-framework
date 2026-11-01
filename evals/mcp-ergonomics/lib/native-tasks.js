import { canonicalJson } from '../../../packages/core/lib/control-state/approval-command-contract.js';
import { readRunOperations } from '../../../packages/core/lib/control-state/run-operations.js';
import { runSealState } from '../../../packages/core/lib/control-state/run-seal.js';
import { strictPresentedDocumentRead } from './native-run.js';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
// Native task set v1: fixtures, prompts and deterministic success predicates (SDD-010, TP 1a).
import { readdirSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, realpathSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createCoreServices } from "../../../packages/core/lib/index.js";
import { readRunState } from "../../../packages/core/lib/control-evaluation/run-state.js";
import { classifyCall } from "./classify.js";
import { buildFixture, writeEvidenceNote } from "./fixtures.js";
import { deterministicUuid, resolveTemplate } from "./protocol-run.js";
import { repoRoot } from "./protocol-harness.js";

export const TASKS_PATH = join(repoRoot, "evals", "mcp-ergonomics", "tasks.v1.json");
export const loadTaskSet = (path = TASKS_PATH) => JSON.parse(readFileSync(path, "utf8"));

// Supplemental Codex command task: keep the historical six-task matrix intact.
export const CODEX_COMMAND_TASK = Object.freeze({ id: 'T7', title: 'Presented UR approval through MCP', fixture: 'F3',
  prompt: 'Mir wurde die UR von Run demo-run-01 in diesem Repository vorgelegt. Meine Antwort: Approval: UR. Erfasse diese Antwort für die vorgelegte Fassung.',
  allowed_paths: ['.agdf/control/**'], success: { type: 'single_ur_approval', run_id: 'demo-run-01' } });

// Bounded current Run-model journey; fixtures are never installed host state.
export const CODEX_RUN_MODEL_TASK = Object.freeze({id:'RUN_MODEL',title:'Current Run folders through native Codex MCP',fixture:'RUN_MODEL',
  allowed_paths:['.agdf/control/**'],success:{type:'current_run_model'},
  prompt:'Prüfe den neuen Run-Vertrag ausschließlich über die bereitgestellten AGDF-MCP-Funktionen. Ermittle zuerst Tool-Verträge und Projektzustand. Initialisiere dieses frische Wegwerf-Repository ausdrücklich mit englischer Artefaktsprache. Lege genau eine geplante UR mit Titel Persönlicher Filter an: Problem: Ein persönlicher Filter muss wiederholt erstellt werden. Ziel: Einen eigenen benannten Filter speichern und wiederherstellen. Scope: Ein Filter desselben Nutzers, ohne Teilen oder Berechtigungsänderung. Non-Goals: Keine Freigabe für andere Nutzer. Übergebe die UR über die Material-Schnittstelle und den geplanten UR-Vertrag. Prüfe die Planned-Inventur und führe mit der exakten Vorschau und Bestätigung die Übergabe in genau einen neuen Run aus. Prüfe die aktuelle Run-Inventur, die abgeleitete Gate-Identität und die Run-eigenen Dokumentpfade über MCP. Bereite die UR-Präsentation vor und lies deren vollständiges Dokument; hole keine Freigabe ein. Wiederhole genau den ursprünglichen Übergabe-Request mit derselben UUID unverändert; es darf nur eine Wirkung entstehen. Prüfe anschließend ausdrücklich das separate Unterprojekt legacy-negative per project-state: sein alter Steuerungsstand muss als nicht unterstützt erscheinen und unverändert bleiben. Keine Freigabe, keine Implementierung, keine Migration und kein Shell-Aufruf. Berichte die beobachteten Pfade und Grenzen.'});
function runModelFixture(){
  const root=realpathSync(mkdtempSync(join(tmpdir(),'agdf-native-run-model-'))),legacy=join(root,'legacy-negative');
  execFileSync('git',['init','-q',root]);mkdirSync(join(legacy,'.agdf/control'),{recursive:true});execFileSync('git',['init','-q',legacy]);
  const bytes=JSON.stringify({control_layout:'master-backlog-v1',chat_language:'en',artifact_language:'en'});writeFileSync(join(legacy,'.agdf/control/config.json'),bytes);writeFileSync(join(legacy,'.agdf/control/MASTER_BACKLOG.md'),'# Unsupported disposable old control\n');
  return {root,runId:null,presentationId:null,revision:()=>null,legacy,legacyBytes:bytes,dispose:()=>rmSync(root,{recursive:true,force:true})};
}
export function strictRunModelFlow({parsed,fixture}){
  const fail=reason=>({check:'current_run_model_v1',success:false,reason});
  if(!parsed.trace_complete||parsed.detours.length)return fail('incomplete_trace_or_forbidden_detour');
  const calls=parsed.calls.map(call=>{try{return {call,result:JSON.parse(call.result.text)}}catch{return {call,result:null}}});
  const accepted=kind=>calls.filter(({call,result})=>call.input?.command?.kind===kind&&result?.outcome==='accepted');
  if(accepted('project.initialize').length!==1||accepted('planned_ur.create').length!==1||accepted('run.create_from_planned').length!==1)return fail('current_init_planning_handoff_not_observed');
  const original=accepted('run.create_from_planned')[0];
  if(!calls.some(({call,result})=>result?.outcome==='already_applied'&&call.input?.operation_id===original.call.input.operation_id&&canonicalJson(call.input)===canonicalJson(original.call.input)))return fail('exact_original_replay_missing');
  if(calls.some(({call})=>call.input?.command?.kind==='approval.record'))return fail('unrequested_approval');
  if(!calls.some(({call,result})=>call.input?.operation==='project-state'&&call.input?.primary_target===fixture.legacy&&/unsupported/iu.test(JSON.stringify(result))))return fail('unsupported_old_control_not_observed');
  if(readFileSync(join(fixture.legacy,'.agdf/control/config.json'),'utf8')!==fixture.legacyBytes||readFileSync(join(fixture.legacy,'.agdf/control/MASTER_BACKLOG.md'),'utf8')!=='# Unsupported disposable old control\n')return fail('old_control_changed');
  let runs;try{runs=readdirSync(join(fixture.root,'.agdf/control/runs')).filter(id=>!id.startsWith('.'));}catch{return fail('run_missing')}
  if(runs.length!==1||existsSync(join(fixture.root,'.agdf/control/MASTER_BACKLOG.md')))return fail('duplicate_run_or_shared_backlog');
  const state=readRunState(fixture.root,{runId:runs[0]}),ur=state.artefacts.get('UR')?.path;
  if(runSealState(fixture.root,state.content).status!=='valid')return fail('run_seal_invalid');
  const creation=readRunOperations(state.content).receipts.find(row=>row.kind==='run.create_from_planned');
  const snapshot=creation?.effect.record.snapshot;
  if(!snapshot||snapshot.path!=='.agdf/control/runs/'+runs[0]+'/history/planning/UR.md')return fail('planning_snapshot_missing');
  const snapshotDigest='sha256:'+createHash('sha256').update(readFileSync(join(fixture.root,snapshot.path))).digest('hex');
  if(snapshotDigest!==snapshot.raw_digest)return fail('planning_snapshot_changed');
  if(/^## (?:Approvals|Artefacts|Artefact Chain|Evidence|Current Control State)\s*$/mu.test(state.content))return fail('derived_control_copy');
  if(state.meta.control_state_version!==4&&String(state.meta.control_state_version)!=='4'||!ur?.startsWith('.agdf/control/runs/'+runs[0]+'/documents/'))return fail('wrong_current_shape');
  if(!calls.some(({result})=>JSON.stringify(result).includes(ur)))return fail('current_document_path_not_observed');
  const preparations=accepted('presentation.prepare');
  if(preparations.length!==1)return fail('presentation_not_prepared');
  const presentationId=preparations[0].result.family_result?.presentation_id;
  let expectedBytes;try{expectedBytes=readFileSync(join(fixture.root,'.agdf/control/runs',runs[0],'control/presentations',presentationId+'.document'));}catch{return fail('presentation_snapshot_missing')}
  const documentRead=strictPresentedDocumentRead({parsed,expectedBytes,binding:{target_id:creation.target_id,run_id:runs[0],gate:'UR',expected_revision_id:state.meta.revision_id,presentation_id:presentationId}});
  if(!documentRead.success)return fail('document_not_read:'+documentRead.reason);
  return {check:'current_run_model_v1',success:true,run_id:runs[0],ur,exact_replay:true,old_control_unchanged:true,document_read:documentRead};
}

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
  if(task.fixture==='RUN_MODEL')return runModelFixture();
  return task.fixture === "F2_STALE" ? staleFixture() : buildFixture(task.fixture);
}

export function renderPrompt(task, fixture) {
  return resolveTemplate(task.prompt, { presentation_id: fixture.presentationId, stale_revision_id: fixture.staleRevisionId });
}

const runStatePath = (root, runId) => join(root, ".agdf", "control", "runs", runId, "RUN_STATE.md");
const agdfCalls = parsed => parsed.calls.filter(call => isAgdfMcpCall(call) || isAgdfShellCall(call));
// An evidence write through MCP (agdf_record step.record with step evidence) or through the CLI (run-step --step evidence).
const isEvidenceWrite = call => isAgdfMcpCall(call)
  ? normalizeToolName(call.name) === "agdf_record" && call.input?.command?.kind === "step.record" && call.input?.command?.payload?.step === "evidence"
  : /\brun-step\b/u.test(String(call.input?.command ?? "")) && /--step\s+["']?evidence\b/u.test(String(call.input?.command ?? ""));

const PREDICATES = {
  current_run_model: strictRunModelFlow,
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
    try { gate = readRunState(fixture.root,{runId:runs[0]}).current_gate; } catch { return { success: false, reason: "new run has no readable RUN_STATE.md" }; }
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
