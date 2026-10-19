// Re-evaluates the success predicates of a recorded native run from its cleaned transcripts, for
// predicates that depend only on the structured tool-call record (SDD-010). The raw run output stays
// unchanged; the result is written next to it with the re-evaluation recorded per session.
//   node evals/scripts/reevaluate-mcp-ergonomics-native.js --native <file> --tasks T6 --out <file>
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseClaudeStream, repoRoot } from "../../scripts/native-probes/lib/claude-session.mjs";
import { evaluateSuccess, loadTaskSet } from "../mcp-ergonomics/lib/native-tasks.js";

// Predicates whose verdict is fully determined by the transcript. stale_write_guarded needs the stale
// revision only to classify evidence writes; a session without any evidence write fails regardless.
const TRANSCRIPT_ONLY = Object.freeze(["stale_write_guarded"]);
const EVIDENCE_WRITE = /"name":"mcp__plugin_agdf_agdf__agdf_record"|run-step[^"\n]*--step[ \\"']+evidence/u;

export function reevaluate(native, { tasks, taskSet = loadTaskSet(), read = path => readFileSync(resolve(repoRoot, path), "utf8") }) {
  const changes = [];
  const sessions = native.schedule.sessions.map(session => {
    const task = taskSet.tasks.find(entry => entry.id === session.task);
    if (!tasks.includes(session.task) || session.status !== "measured" || !TRANSCRIPT_ONLY.includes(task.success.type)) return session;
    const transcript = read(session.transcript);
    if (EVIDENCE_WRITE.test(transcript)) throw new Error(`${session.transcript}: contains an evidence write; re-run instead of re-evaluating`);
    const verdict = evaluateSuccess({ task, fixture: { staleRevisionId: null }, parsed: parseClaudeStream(transcript), mutationViolations: [] });
    changes.push({ task: session.task, variant: session.variant, model: session.model, repetition: session.repetition, before: session.success, after: verdict.success });
    return { ...session, success: verdict.success, reason: verdict.reason ?? null, reevaluated: { predicate: task.success.type, previous_success: session.success } };
  });
  return { ...native, schedule: { ...native.schedule, sessions }, reevaluation: { tasks, predicates: TRANSCRIPT_ONLY, changes } };
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const option = name => { const index = args.indexOf(name); return index === -1 ? undefined : args[index + 1]; };
  if (!option("--native") || !option("--tasks") || !option("--out")) throw new Error("usage: --native <file> --tasks T6 --out <file>");
  const result = reevaluate(JSON.parse(readFileSync(resolve(repoRoot, option("--native")), "utf8")), { tasks: option("--tasks").split(",") });
  writeFileSync(resolve(repoRoot, option("--out")), `${JSON.stringify(result, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(result.reevaluation, null, 2)}\n`);
}
