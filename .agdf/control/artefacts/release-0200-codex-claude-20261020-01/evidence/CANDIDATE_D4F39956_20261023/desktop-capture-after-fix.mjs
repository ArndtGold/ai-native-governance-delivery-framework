// Diagnostic only: applies the fixed Claude capture owner to native Claude Desktop transcript lines.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const [checkout, transcript] = process.argv.slice(2);
const { captureNativeCall } = await import(pathToFileURL(`${checkout}/scripts/native-probes/lib/release-observation.mjs`));
const lines = readFileSync(transcript, 'utf8').split('\n').filter(Boolean);
const ids = new Set();
for (const line of lines) { try { for (const c of JSON.parse(line).message?.content ?? []) if (c?.type === 'tool_use' && c.name === 'mcp__plugin_agdf_agdf__agdf_dispatch') ids.add(c.id); } catch {} }
const excerpt = lines.filter(line => { try { return (JSON.parse(line).message?.content ?? []).some(c => c?.type === 'tool_use' && ids.has(c.id) || c?.type === 'tool_result' && ids.has(c.tool_use_id)); } catch { return false; } }).join('\n');
const run = (label, stdout, surface) => { try { const { captured, observedModels } = captureNativeCall({ status: 0, stdout }, 'claude', 'dispatch', { surface });
  return { label, surface, accepted: true, observed_models: observedModels, session_id: captured.session_id ?? null, outcome: captured.outcome, terminal: captured.terminal, authorizes: captured.authorizes, runtime_digest: captured.runtime_digest };
} catch (error) { return { label, surface, accepted: false, error: error.message }; } };
console.log(JSON.stringify({ schema_version: 1, kind: 'diagnostic_probe', authorizes: false,
  excerpt: { selection: 'unmodified native lines of the single agdf_dispatch tool_use and tool_result', lines: excerpt.split('\n').length, sha256: createHash('sha256').update(excerpt).digest('hex') },
  results: [run('dispatch-only excerpt', excerpt, 'desktop-code'), run('full transcript', lines.join('\n'), 'desktop-code'), run('dispatch-only excerpt through CLI parser', excerpt, 'cli')] }, null, 2));
