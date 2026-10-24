// Diagnostic only: applies the candidate's own Claude stream parser and native-call capture to this
// actual Claude Desktop Code session transcript. Emits structure and validator outcome, never content.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const [worktree, transcript, selection = 'full'] = process.argv.slice(2);
const { parseClaudeStream } = await import(pathToFileURL(`${worktree}/scripts/native-probes/lib/claude-session.mjs`));
const { captureNativeCall } = await import(pathToFileURL(`${worktree}/scripts/native-probes/lib/release-observation.mjs`));
const bytes = readFileSync(transcript);
let text = bytes.toString('utf8');
// dispatch-only keeps the unmodified native lines of the single agdf_dispatch tool_use and its tool_result.
if (selection === 'dispatch-only') {
  const lines = text.split('\n').filter(Boolean);
  const ids = new Set();
  for (const line of lines) { try { for (const c of JSON.parse(line).message?.content ?? []) if (c?.type === 'tool_use' && c.name === 'mcp__plugin_agdf_agdf__agdf_dispatch') ids.add(c.id); } catch {} }
  text = lines.filter(line => { try { return (JSON.parse(line).message?.content ?? []).some(c => c?.type === 'tool_use' && ids.has(c.id) || c?.type === 'tool_result' && ids.has(c.tool_use_id)); } catch { return false; } }).join('\n');
}
const parsed = parseClaudeStream(text);
const assistantModels = [...new Set(parsed.events.filter(e => e.type === 'assistant' && e.message?.model).map(e => e.message.model))];
const toolNames = {};
for (const call of parsed.calls) toolNames[call.name] = (toolNames[call.name] ?? 0) + 1;
let validator;
try {
  const { captured, observedModels } = captureNativeCall({ status: 0, stdout: text }, 'claude', 'dispatch');
  // assertDesktopRecord then requires observedModels to equal [tuple.model] (desktop_model_mismatch).
  const tupleModel = assistantModels.length === 1 ? assistantModels[0] : null;
  validator = { capture_accepted: true, observed_models: observedModels, outcome: captured.outcome, terminal: captured.terminal,
    authorizes: captured.authorizes, runtime_digest: captured.runtime_digest,
    desktop_model_check: { expected: [tupleModel], passes: JSON.stringify(observedModels) === JSON.stringify([tupleModel]), failure_code: 'desktop_model_mismatch' } };
} catch (error) { validator = { capture_accepted: false, error: error.message }; }
console.log(JSON.stringify({
  schema_version: 1, kind: 'diagnostic_probe', authorizes: false,
  purpose: 'Can the candidate Claude capture owner ingest a native Claude Desktop Code session transcript?',
  transcript: { file: basename(transcript), selection, file_sha256_at_probe: createHash('sha256').update(bytes).digest('hex'),
    selected_sha256: createHash('sha256').update(text).digest('hex'), selected_lines: text.split('\n').filter(Boolean).length },
  parser: { init_event_present: parsed.init !== null, init_model: parsed.init?.model ?? null, assistant_message_models: assistantModels,
    event_types: parsed.eventTypes, tool_use_count_by_name: toolNames },
  validator_capture_native_call: validator,
}, null, 2));
