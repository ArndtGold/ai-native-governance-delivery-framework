#!/usr/bin/env node
// Native Codex hook payload probe (SDD-013 of run run-e6230084-23e0-43bb-955c-a97382dcbf93). It is a maintainer
// tool and never part of a shipped plugin: a logging hook on every event is acceptable for one bounded probe,
// not for the product.
//
//   install   --codex-home <dir> --out <dir>   back up <codex-home>/hooks.json and log every documented event
//   restore   --codex-home <dir>               put the previous hooks.json back (or remove the probe's file)
//   record    --out <dir>                      hook command: append one redacted event line, answer {}
//   measure   --entry <file> --out <dir>       time the Companion hook entry with sample payloads, directly
//                                              and through Windows PowerShell as Codex runs commandWindows
//   summarize --out <dir>                      write summary.json and summary.md from the recorded lines
//
// Records keep top-level field names, bounded host identities and ordering. All other
// payload values, including tool inputs/results, are reduced to type/length.
import { spawnSync } from 'node:child_process';
import { appendFileSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, platform, release, tmpdir, userInfo } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROBE = fileURLToPath(import.meta.url);
const EVENTS = ['SessionStart', 'SessionEnd', 'SubagentStart', 'SubagentStop', 'UserPromptSubmit', 'PreToolUse',
  'PermissionRequest', 'PostToolUse', 'PreCompact', 'PostCompact', 'Stop', 'Interrupt'];
const MATCHED = new Set(['PreToolUse', 'PostToolUse', 'PermissionRequest']);
const RAW = 'raw-events.jsonl';
const BACKUP = 'hooks.json.agdf-probe-backup';
const MARKER = 'hooks.json.agdf-probe-installed';

function options(argv) {
  const result = { mode: argv[0] };
  for (let index = 1; index < argv.length; index += 2) {
    if (!argv[index]?.startsWith('--') || argv[index + 1] === undefined) throw new Error(`usage: ${argv[index] ?? '(missing)'}`);
    result[argv[index].slice(2)] = argv[index + 1];
  }
  return result;
}

const home = homedir();
const user = (() => { try { return userInfo().username; } catch { return null; } })();
const SECRET = /token|secret|password|authorization|api[_-]?key|cookie|credential/iu;
const HOST_IDS = new Set(['session_id', 'turn_id', 'tool_use_id', 'tool_name', 'agent_id']);
const HOST_ID = /^[A-Za-z0-9_-]{1,256}$/u;
const SOURCES = new Set(['startup', 'resume', 'clear', 'compact']);

function redactString(value) {
  let text = value;
  for (const spelling of [home, home.replaceAll('\\', '/'), home.replaceAll('\\', '\\\\')]) text = text.split(spelling).join('~');
  if (user) text = text.replace(new RegExp(user.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'giu'), '<user>');
  return text.length > 600 ? `${text.slice(0, 600)}…(${text.length} chars)` : text;
}

export function redact(value, key = '', depth = 0) {
  if (SECRET.test(key)) return '<redacted>';
  if (typeof value === 'string') {
    if (depth === 1 && (HOST_IDS.has(key) && HOST_ID.test(value)
      || key === 'hook_event_name' && EVENTS.includes(value) || key === 'source' && SOURCES.has(value))) return value;
    return { redacted_text: true, length: value.length };
  }
  if (Array.isArray(value)) return { redacted_value: true, type: 'array', length: value.length };
  if (value && typeof value === 'object') return depth === 0
    ? Object.fromEntries(Object.entries(value).map(([name, item]) => [name, redact(item, name, depth + 1)]))
    : { redacted_value: true, type: 'object', fields: Object.keys(value).length };
  return { redacted_value: true, type: value === null ? 'null' : typeof value };
}

function command(out) {
  return `node "${PROBE}" record --out "${resolve(out)}"`;
}

function install({ 'codex-home': codexHome = process.env.CODEX_HOME ?? join(home, '.codex'), out }) {
  if (!out) throw new Error('--out is required');
  mkdirSync(out, { recursive: true });
  const path = join(codexHome, 'hooks.json');
  if (existsSync(join(codexHome, MARKER))) throw new Error('a probe is already installed; restore it first');
  if (existsSync(path)) copyFileSync(path, join(codexHome, BACKUP));
  const hook = { type: 'command', command: command(out), commandWindows: command(out), timeout: 3, statusMessage: 'AGDF probe · record event' };
  const hooks = Object.fromEntries(EVENTS.map(event => [event, [{ ...(MATCHED.has(event) ? { matcher: '.*' } : {}), hooks: [hook] }]]));
  writeFileSync(path, `${JSON.stringify({ hooks }, null, 2)}\n`);
  writeFileSync(join(codexHome, MARKER), `${new Date().toISOString()}\n`);
  console.log(`Probe hooks installed in ${redactString(path)}; events are written to ${redactString(join(resolve(out), RAW))}.`);
}

function restore({ 'codex-home': codexHome = process.env.CODEX_HOME ?? join(home, '.codex') }) {
  const path = join(codexHome, 'hooks.json');
  if (!existsSync(join(codexHome, MARKER))) throw new Error('no probe is installed here');
  if (existsSync(join(codexHome, BACKUP))) { copyFileSync(join(codexHome, BACKUP), path); rmSync(join(codexHome, BACKUP)); }
  else rmSync(path, { force: true });
  rmSync(join(codexHome, MARKER));
  console.log('Previous hooks restored.');
}

async function record({ out }) {
  const started = performance.timeOrigin;
  try {
    const chunks = [];
    let bytes = 0;
    const deadline = setTimeout(() => process.stdin.destroy(), 2000);
    try {
      for await (const chunk of process.stdin) { bytes += chunk.length; if (bytes > 1024 * 1024) break; chunks.push(chunk); }
    } finally { clearTimeout(deadline); }
    const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    mkdirSync(out, { recursive: true });
    appendFileSync(join(out, RAW), `${JSON.stringify({ received_at: new Date().toISOString(), process_started_ms: Math.round(started),
      handled_after_ms: Math.round(Date.now() - started), event: EVENTS.includes(payload?.hook_event_name) ? payload.hook_event_name : 'unknown', payload: redact(payload) })}\n`);
  } catch (error) {
    // Parser and filesystem errors may contain input excerpts or private paths.
    try { appendFileSync(join(out, RAW), `${JSON.stringify({ received_at: new Date().toISOString(), error: error instanceof SyntaxError ? 'invalid_payload' : 'record_failed' })}\n`); } catch {}
  }
  process.stdout.write('{}\n');
}

function measure({ entry, out, runs = '5' }) {
  if (!entry || !existsSync(entry)) throw new Error('--entry must name the Companion hook entry (hooks/companion-activity.mjs)');
  mkdirSync(out, { recursive: true });
  const payloads = {
    SessionStart: { session_id: 'probe-session', hook_event_name: 'SessionStart', source: 'startup' },
    UserPromptSubmit: { session_id: 'probe-session', turn_id: 'probe-turn', hook_event_name: 'UserPromptSubmit' },
    PostToolUse: { session_id: 'probe-session', turn_id: 'probe-turn', tool_use_id: 'probe-tool', hook_event_name: 'PostToolUse',
      tool_name: 'mcp__agdf__agdf_dispatch', tool_input: { continue_delivery: true, run_id: 'run-probe' }, tool_response: {} },
    Stop: { session_id: 'probe-session', turn_id: 'probe-turn', hook_event_name: 'Stop' },
  };
  const time = (file, args, input) => {
    const begin = performance.now();
    const result = spawnSync(file, args, { input: JSON.stringify(input), encoding: 'utf8', timeout: 10_000, windowsHide: true });
    return { ms: Math.round(performance.now() - begin), status: result.status, stdout: (result.stdout ?? '').trim().slice(0, 40), timed_out: Boolean(result.error) };
  };
  const results = [];
  for (const [event, payload] of Object.entries(payloads)) {
    for (let run = 0; run < Number(runs); run++) {
      results.push({ event, route: 'node', run, ...time(process.execPath, [entry], payload) });
      if (platform() === 'win32') {
        results.push({ event, route: 'powershell', run, ...time('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `node "${entry}"`], payload) });
      }
    }
  }
  const summary = { measured_at: new Date().toISOString(), platform: platform(), os_release: release(), node: process.version,
    entry: redactString(entry), note: 'run 0 of each event is the coldest start in this series; Codex adds its own spawn cost', results };
  writeFileSync(join(out, 'hook-runtime.json'), `${JSON.stringify(summary, null, 2)}\n`);
  const worst = Math.max(...results.map(item => item.ms));
  console.log(`Measured ${results.length} hook starts; slowest ${worst} ms against the 3000 ms timeout.`);
}

function summarize({ out }) {
  const lines = existsSync(join(out, RAW)) ? readFileSync(join(out, RAW), 'utf8').split(/\r?\n/u).filter(Boolean).map(line => JSON.parse(line)) : [];
  const events = lines.filter(line => line.payload);
  const fields = {};
  for (const { event, payload } of events) for (const name of Object.keys(payload ?? {})) (fields[event] ??= new Set()).add(name);
  const turns = new Map();
  for (const line of events) {
    const { session_id: session, turn_id: turn } = line.payload;
    if (!turn) continue;
    const key = `${session}/${turn}`;
    if (!turns.has(key)) turns.set(key, []);
    turns.get(key).push({ event: line.event, tool: line.payload.tool_name ?? null, tool_use_id: line.payload.tool_use_id ?? null, at: line.received_at });
  }
  const agdfTools = [...new Set(events.map(line => line.payload.tool_name).filter(name => typeof name === 'string' && /agdf/iu.test(name)))];
  const orderings = [...turns.entries()].map(([key, list]) => {
    const stop = list.findIndex(item => item.event === 'Stop' || item.event === 'Interrupt');
    const lateResult = stop >= 0 && list.slice(stop + 1).some(item => item.event === 'PostToolUse');
    return { turn: key, events: list.map(item => item.event), ends_with: stop >= 0 ? list[stop].event : null, post_tool_use_after_end: lateResult };
  });
  const summary = { summarized_at: new Date().toISOString(), event_count: events.length, errors: lines.filter(line => line.error).length,
    fields: Object.fromEntries(Object.entries(fields).map(([event, set]) => [event, [...set].filter(Boolean).sort()])),
    sessions: [...new Set(events.map(line => line.payload.session_id))].length, turns: orderings, agdf_tool_names: agdfTools,
    handled_after_ms: { max: Math.max(0, ...events.map(line => line.handled_after_ms ?? 0)) } };
  writeFileSync(join(out, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  const md = ['# Codex hook payload probe summary', '', `- events: ${summary.event_count} (errors: ${summary.errors})`,
    `- sessions: ${summary.sessions}, turns: ${orderings.length}`, `- AGDF tool names: ${agdfTools.join(', ') || 'none observed'}`,
    `- slowest probe hook (process start to handled): ${summary.handled_after_ms.max} ms`, '', '## Fields per event', '',
    ...Object.entries(summary.fields).map(([event, names]) => `- ${event}: ${names.join(', ')}`), '', '## Turns', '',
    ...orderings.map(item => `- ${item.turn}: ${item.events.join(' → ')}${item.post_tool_use_after_end ? ' (PostToolUse after the turn end)' : ''}`), ''];
  writeFileSync(join(out, 'summary.md'), md.join('\n'));
  console.log(md.slice(0, 6).join('\n'));
}

if (process.argv[1] && resolve(process.argv[1]) === PROBE) {
  const input = options(process.argv.slice(2));
  const run = { install, restore, record, measure, summarize }[input.mode];
  if (!run) {
    console.error('modes: install | restore | record | measure | summarize');
    process.exitCode = 2;
  } else await run(input);
}
