import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, symlinkSync, unlinkSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { randomUUID, createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { createSdDefinitionTestRun, syntheticSd } from "./fixtures/sd-definition.js";

const temporary = mkdtempSync(join(tmpdir(), "agdf-sd-definition-"));
try {
  const generated = resolve(import.meta.dirname, "../generated");
  for (const entry of ["plugins/agdf", ".agents/plugins/marketplace.json"]) cpSync(join(generated, entry), join(temporary, entry), { recursive: true });
  const plugin = join(temporary, "plugins/agdf"), validator = join(plugin, "runtime/agdf-local.js");
  const root = join(temporary, "project"); mkdirSync(root); execFileSync("git", ["init", "-q", root]);
  execFileSync(process.execPath, [resolve(import.meta.dirname, "../bin/create-agdf.js"), "init", "--dir", root, "--language", "en"]);
  const env = { ...process.env, PLUGIN_ROOT: plugin, AGDF_SURFACE: "codex" }; delete env.AGDF_RUN_ID;
  const f = createSdDefinitionTestRun(root, validator, "sd-authoring-test", env);
  const bytes = () => {
    const h = createHash("sha256"), directory = join(root, ".agdf/control");
    const scan = folder => {
      for (const entry of readdirSync(folder, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
        const p = join(folder,entry.name);
        if (entry.isDirectory()) scan(p); else if (entry.isFile()) h.update(p.slice(directory.length)).update(readFileSync(p));
      }
    }; scan(directory); return h.digest("hex");
  };
  const dispatch = (skill = "gate-check", ...args) => {
    const before = bytes();
    const r = spawnSync(process.execPath, [validator, "skill-dispatch", "--json", "--skill", skill, "--surface", "codex",
      "--language", "de", "--working-directory", root, "--target-source", "explicit_target", "--primary-target", root, ...args], { env, encoding: "utf8" });
    const value = JSON.parse(r.stdout); assert.equal(bytes(), before, "dispatch is read-only across all fixture runs");
    f.log.push({ command: "dispatch", skill, args, code: r.status, value }); return value;
  };
  const bound = (...args) => dispatch("gate-check", "--run", f.runId, ...args);
  const revise = (rev = f.revision()) => bound("--intake", "--intake-mode", "resume", "--revision", rev, "--sd-action", "revise");
  const initial = bound("--continue-delivery");
  assert.equal(initial.continuation?.phase, "sd_definition", JSON.stringify(initial));
  assert.equal(initial.continuation.draft_registered, false);
  assert.equal(initial.continuation.artifact_language, "en");
  assert.equal(initial.continuation.presentation_language, "de");
  assert.equal(initial.continuation.approval_summary_required, true);
  assert.equal(initial.continuation.approval_summary_heading, "AGDF Approval Summary (de; source=en)");
  assert.equal(initial.control.next_operation.skill_id, "sd-definition");
  assert.equal(initial.continuation.sources[0].type, "PRD");
  assert.deepEqual(initial.continuation.runtime_contracts.map(c => c.module), ["sd-definition", "gate-artifact-preparation"]);
  env.AGDF_RUN_ID=f.runId; assert.equal(dispatch("sd-definition").continuation.phase,"resolve_delivery_run"); delete env.AGDF_RUN_ID;
  assert.equal(dispatch("sd-definition","--run",f.runId).continuation.phase,"sd_definition");
  const valid=["--intake","--intake-mode","resume","--revision",f.revision(),"--sd-action","revise"];
  for (const args of [["--sd-action","revise"],[...valid,"--ur-action","revise"],[...valid,"--prd-action","revise"],
    [...valid,"--continue-delivery"],["--intake","--intake-mode","resume","--sd-action","revise"],
    ["--intake","--intake-mode","new","--revision",f.revision(),"--sd-action","revise"],
    [...valid.slice(0,-1),"approve"]]) assert.equal(bound(...args).outcome,"invalid_input",args.join(" "));
  assert.equal(dispatch("sd-definition","--run",f.runId,...valid).outcome,"invalid_input");
  assert.equal(revise(randomUUID()).continuation.reason,"stale_assignment");

  const foreignId="foreign-sd"; assert.equal(f.call("run-create","--run",foreignId).code,0);
  const foreignState=join(root,`.agdf/control/runs/${foreignId}/RUN_STATE.md`), foreignBytes=readFileSync(foreignState);
  const foreignRev=foreignBytes.toString().match(/^- revision_id: (.+)$/mu)[1];
  assert.equal(dispatch("gate-check","--run",foreignId,"--intake","--intake-mode","resume","--revision",foreignRev,"--sd-action","revise").terminal,true);
  assert.deepEqual(readFileSync(foreignState),foreignBytes);
  assert.equal(dispatch("sd-definition","--run",foreignId).terminal,true,"wrong stage cannot grant generic authoring");
  const approvedBytes=readFileSync(f.file("PRD.md"));
  writeFileSync(f.file("PRD.md"),approvedBytes.toString()+"\nUnapproved source edit.\n");
  assert.equal(bound("--continue-delivery").terminal,true); writeFileSync(f.file("PRD.md"),approvedBytes);
  if(process.platform!=="win32") {
    const outside=join(temporary,"outside.md");writeFileSync(outside,"outside");symlinkSync(outside,f.file("SD.md"));
    assert.equal(bound("--continue-delivery").terminal,true);assert.equal(readFileSync(outside,"utf8"),"outside");unlinkSync(f.file("SD.md"));
  }

  writeFileSync(f.file("SD.md"),syntheticSd(true)); assert.equal(f.recordSd().value.outcome,"recorded");
  const open=bound("--continue-delivery");assert.equal(open.continuation.phase,"sd_definition");
  assert.equal(open.control.blocking_reason,"AGDF_SD_DECISIONS_OPEN");
  assert.equal(f.present("SD","de").value.outcome,"rejected");
  assert.equal(f.run("run-approve","--revision",f.revision(),"--gate","SD","--response","Approval: SD").value.outcome,"rejected");
  // Unrelated source integrity outranks permission to clarify the declared question.
  writeFileSync(f.file("PRD.md"),approvedBytes.toString()+"\nIntegrity violation.\n");
  assert.equal(bound("--continue-delivery").terminal,true);writeFileSync(f.file("PRD.md"),approvedBytes);
  writeFileSync(f.file("SD.md"),syntheticSd());assert.equal(f.recordSd(true).value.outcome,"recorded");
  const ready=bound("--continue-delivery");assert.equal(ready.continuation.phase,"presentation_required");
  const oldPresentation=f.present("SD","de");assert.equal(oldPresentation.value.outcome,"prepared");
  const oldRevision=f.revision();assert.equal(revise().continuation.phase,"sd_definition");
  writeFileSync(f.file("SD.md"),syntheticSd().replace("Synthetic saved filter","Explicitly revised filter"));
  assert.equal(f.recordSd(true).value.outcome,"recorded");
  assert.equal(revise(oldRevision).continuation.reason,"stale_assignment");
  assert.notEqual(f.run("run-approve","--revision",oldRevision,"--gate","SD","--presentation",oldPresentation.value.presentation_id,"--response","Approval: SD").value.outcome,"approved");
  assert.deepEqual(readFileSync(f.file("PRD.md")),approvedBytes);
  const currentSd=readFileSync(f.file("SD.md"),"utf8");
  // Incorrect source proof is rejected before pointer/history replacement.
  assert.equal(f.recordSd(true,v=>{v.source.digest="sha256:"+"0".repeat(64);}).value.outcome,"rejected");
  writeFileSync(f.file("SD.md"),currentSd.replace("| AC-001 |","| AC-999 |"));
  assert.equal(f.recordSd(true).value.outcome,"recorded");
  assert.equal(bound("--continue-delivery").control.blocking_reason,"AGDF_SD_TRACEABILITY_INCOMPLETE");
  assert.equal(f.present("SD","de").value.outcome,"rejected");
  writeFileSync(f.file("SD.md"),currentSd);assert.equal(f.recordSd(true).value.outcome,"recorded");
  const p=f.present("SD","de");assert.equal(p.value.outcome,"prepared");
  assert.equal(f.run("run-approve","--revision",f.revision(),"--gate","SD","--presentation",p.value.presentation_id,"--response","Approval: PRD").value.outcome,"rejected");
  assert.equal(f.run("run-approve","--revision",f.revision(),"--gate","SD","--presentation",p.value.presentation_id,"--response","Approval: SD").value.outcome,"approved");
  const approvedSd=readFileSync(f.file("SD.md"));assert.equal(revise().terminal,true);
  assert.equal(dispatch("sd-definition","--run",f.runId).terminal,true);
  assert.equal(bound("--continue-delivery").continuation.gate,"TP");
  assert.deepEqual(readFileSync(f.file("SD.md")),approvedSd);
  assert.equal(f.recordSd(true).value.outcome,"rejected","approved design cannot be replaced");
  if(process.env.AGDF_SD_TEST_LOG) writeFileSync(process.env.AGDF_SD_TEST_LOG,JSON.stringify({synthetic_authorization:true,consumer:"assembled CLI",log:f.log},null,2));
} finally {rmSync(temporary,{recursive:true,force:true});}
console.log("SD assembled authoring/source/readiness/revision/approval boundaries passed (synthetic fixtures).");
