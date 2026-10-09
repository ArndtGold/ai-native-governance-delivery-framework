import assert from "node:assert/strict";
import { fork, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { json, invoke } from "../../../scripts/support/control-command-fixture.js";
import { recordGateApprovalCommand } from "../lib/control-command.js";
import { readApprovalOperations } from "#agdf-core/control-state/approval-operations.js";
import { parseRunState } from "#agdf-core/control-state/run-state-parser.js";
import { runSealState, sealRunState } from "#agdf-core/control-state/run-seal.js";
import { approvalArgs, commandFixture, sourceCli } from "../../../scripts/support/control-command-fixture.js";

const interruptionMetrics = [];
const processEvidence = [];
const childPath = fileURLToPath(new URL("../../../scripts/support/control-command-child.js", import.meta.url));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function markerReady(child, marker) {
  const until = Date.now() + 10000;
  while (!existsSync(marker)) {
    assert.equal(child.exitCode, null, "child exited before checkpoint");
    assert.ok(Date.now() < until, "checkpoint deadline");
    await wait(20);
  }
}
function worker(fixture, command, pauseAt) {
  const marker = join(fixture.root, `checkpoint-${randomUUID()}`), release = `${marker}.release`;
  const child = fork(childPath, [], { stdio: ["ignore", "pipe", "pipe", "ipc"] });
  const completion = new Promise((resolve, reject) => {
    let result, errors = "";
    child.stderr.on("data", (data) => { errors += data; });
    child.on("message", (message) => { result = message; });
    child.on("error", reject);
    child.on("exit", (code, signal) => code === 0 || signal === "SIGKILL" ? resolve({ code, signal, result }) : reject(new Error(errors)));
  });
  child.send({ root: fixture.root, command, pauseAt, marker, release });
  return { child, completion, marker, release };
}
function cliWorker(fixture, command) {
  const child = spawn(process.execPath, [sourceCli, ...approvalArgs(fixture, command)], { stdio: ["ignore", "pipe", "pipe"] });
  return new Promise((resolve, reject) => {
    let output = "", errors = "";
    child.stdout.on("data", (data) => { output += data; }); child.stderr.on("data", (data) => { errors += data; });
    child.on("error", reject); child.on("exit", (code) => {
      try { resolve({ code, result: JSON.parse(output) }); } catch { reject(new Error(`${errors}\n${output}`)); }
    });
  });
}

for (const point of ["before_rename", "after_rename", "before_response"]) {
  const fixture = commandFixture(); let active;
  try {
    const before = readFileSync(fixture.runPath, "utf8"), revision = Number(parseRunState(before).meta.revision);
    active = worker(fixture, fixture.command, point);
    await markerReady(active.child, active.marker);
    assert.equal(existsSync(`${fixture.runPath}.lock`), true);
    active.child.kill("SIGKILL");
    const killed = await active.completion;
    assert.equal(killed.signal, "SIGKILL", "process death must be observed before stale lock reclamation");
    const interrupted = readFileSync(fixture.runPath, "utf8");
    if (point === "before_rename") assert.equal(interrupted, before);
    else {
      assert.equal(readApprovalOperations(interrupted).receipts.length, 1);
      assert.equal(runSealState(fixture.root, interrupted).status, "valid");
    }
    const replay = recordGateApprovalCommand(fixture.root, fixture.command);
    assert.equal(replay.outcome, point === "before_rename" ? "accepted" : "already_applied");
    assert.equal(replay.effect.revision, revision + 1);
    assert.equal(readApprovalOperations(readFileSync(fixture.runPath, "utf8")).receipts.length, 1);
    assert.equal(existsSync(`${fixture.runPath}.lock`), false);
    processEvidence.push({ point, child_pid: active.child.pid, observed_exit: killed, interrupted_revision: parseRunState(interrupted).meta.revision_id, retry: replay });
    interruptionMetrics.push({ lane: "command", point, interrupted_calls: 1, retry_calls: 1, resulting_revision_count: 1, replay_outcome: replay.outcome, manual_corrections: 0, human_decision: "unavailable" });
    console.log(`PASS SCN-021/016 kill ${point}, confirmed death, one committed revision`);
  } finally { active?.child.kill("SIGKILL"); fixture.cleanup(); }
}

for (const mode of ["identical", "distinct", "changed_payload"]) {
  const fixture = commandFixture(); let active;
  try {
    const identical = mode === "identical";
    const first = fixture.command, second = identical ? first : mode === "distinct" ? { ...first, operation_id: randomUUID() } : { ...first, response: "Approval: UR\n" };
    const before = Number(parseRunState(readFileSync(fixture.runPath, "utf8")).meta.revision);
    // Hold one owner across preparation and final validation while another process attempts CLI.
    active = worker(fixture, first, "before_final_validation");
    await markerReady(active.child, active.marker);
    const rival = await cliWorker(fixture, second);
    assert.equal(rival.code, 2); assert.equal(rival.result.outcome, "retryable_failure");
    assert.equal(existsSync(`${fixture.runPath}.lock`), true);
    writeFileSync(active.release, "continue");
    const completed = await active.completion;
    assert.equal(completed.result.outcome, "accepted");
    const retried = await cliWorker(fixture, second);
    assert.equal(retried.result.outcome, identical ? "already_applied" : "rejected");
    assert.equal(retried.code, identical ? 0 : 2);
    if (mode === "changed_payload") assert.equal(retried.result.reason, "operation_payload_conflict");
    processEvidence.push({ mode, child_pid: active.child.pid, winner: completed.result, concurrent: rival, retried });
    const content = readFileSync(fixture.runPath, "utf8");
    assert.equal(Number(parseRunState(content).meta.revision), before + 1);
    assert.equal(readApprovalOperations(content).receipts.length, 1);
    assert.equal(existsSync(`${fixture.runPath}.lock`), false);
    console.log(`PASS SCN-013/014/015 CLI/API concurrent ${mode}`);
  } finally { active?.child.kill("SIGKILL"); fixture.cleanup(); }
}
console.log(`Control command process tests passed on ${process.platform}/${process.arch}.`);

// Baseline interruption qualification uses the real legacy CLI with a private native-I/O preload.
// The preload is generated in the disposable fixture, has no environment hook and never ships.
for (const point of ["before_rename", "after_rename"]) {
  const fixture = commandFixture(); let child;
  try {
    const marker = join(fixture.root, "legacy-marker"), release = join(fixture.root, "legacy-release");
    const preload = join(fixture.root, "legacy-preload.mjs");
    writeFileSync(preload, `import fs from 'node:fs'; import {syncBuiltinESMExports} from 'node:module';
+const original=fs.renameSync;
+function pause(){fs.writeFileSync(${JSON.stringify(marker)},'checkpoint');const until=Date.now()+20000;while(!fs.existsSync(${JSON.stringify(release)})){if(Date.now()>until)throw Error('timeout');Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,25);}}
+fs.renameSync=(from,to)=>{const selected=String(to)===${JSON.stringify(fixture.runPath)};if(selected&&${JSON.stringify(point)}==='before_rename')pause();const result=original(from,to);if(selected&&${JSON.stringify(point)}==='after_rename')pause();return result;};syncBuiltinESMExports();
+`.replace(/^\+/gmu, ""));
    const legacyArgs = approvalArgs(fixture).slice(0, -4);
    const before = readFileSync(fixture.runPath, "utf8");
    child = spawn(process.execPath, ["--import", pathToFileURL(preload).href, sourceCli, ...legacyArgs], { stdio: ["ignore", "pipe", "pipe"] });
    const exited = new Promise((resolve) => child.once("exit", (code, signal) => resolve({ code, signal })));
    await markerReady(child, marker); child.kill("SIGKILL"); assert.equal((await exited).signal, "SIGKILL");
    const interrupted = readFileSync(fixture.runPath, "utf8");
    const replay = json(sourceCli, legacyArgs, point === "before_rename" ? 0 : 2);
    assert.equal(replay.outcome, point === "before_rename" ? "approved" : "rejected");
    assert.equal(readApprovalOperations(readFileSync(fixture.runPath, "utf8")).present, false);
    if (point === "after_rename") assert.equal(readFileSync(fixture.runPath, "utf8"), interrupted);
    assert.equal(Number(parseRunState(readFileSync(fixture.runPath, "utf8")).meta.revision), Number(parseRunState(before).meta.revision) + 1);
    interruptionMetrics.push({ lane: "legacy", point, interrupted_calls: 1, retry_calls: 1, resulting_revision_count: 1, replay_outcome: replay.outcome, manual_corrections: 0, human_decision: "unavailable" });
    console.log(`PASS SCN-026 real legacy CLI interruption ${point}`);
  } finally { child?.kill("SIGKILL"); fixture.cleanup(); }
}
console.log(`SCN-026 INTERRUPTION_METRICS ${JSON.stringify(interruptionMetrics)}`);

console.log(`PROCESS_EVIDENCE ${JSON.stringify(processEvidence)}`);

for (const kind of ["artefact", "presentation", "revision", "gate_eligibility"]) {
  const fixture = commandFixture(); let active;
  try {
    active = worker(fixture, fixture.command, "before_final_validation");
    await markerReady(active.child, active.marker);
    let expectedContent = readFileSync(fixture.runPath, "utf8");
    if (kind === "artefact") writeFileSync(fixture.urPath, `${readFileSync(fixture.urPath, "utf8")}Changed before commit.\n`);
    if (kind === "presentation") writeFileSync(join(fixture.root, ".agdf/control/runs", fixture.runId, "presentations", `${fixture.command.presentation_id}.json`), "{}");
    if (kind === "revision" || kind === "gate_eligibility") {
      const changed = kind === "revision"
        ? expectedContent.replace(/^- revision:.*$/mu, `- revision: ${Number(parseRunState(expectedContent).meta.revision) + 1}`)
          .replace(/^- revision_id:.*$/mu, `- revision_id: ${randomUUID()}`)
        : expectedContent.replace(/^- lifecycle:.*$/mu, "- lifecycle: completed");
      expectedContent = sealRunState(fixture.root, changed); writeFileSync(fixture.runPath, expectedContent);
    }
    writeFileSync(active.release, "continue");
    const completed = await active.completion;
    assert.notEqual(completed.result.outcome, "accepted"); assert.equal(completed.result.effect, null);
    assert.equal(readFileSync(fixture.runPath, "utf8"), expectedContent);
    assert.equal(readApprovalOperations(expectedContent).present, false);
    console.log(`PASS SCN-012 real child final-checkpoint ${kind}, no command effect`);
    console.log(`FRESHNESS_EVIDENCE ${JSON.stringify({ kind, child_pid: active.child.pid, result: completed.result })}`);
  } finally { active?.child.kill("SIGKILL"); fixture.cleanup(); }
}
