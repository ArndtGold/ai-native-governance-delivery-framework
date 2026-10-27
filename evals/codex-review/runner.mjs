import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { CASES } from './fixtures.mjs';
import { SCHEMA, VARIANTS, aggregate, digest, reviewInput, scoreReview, validateReview } from './review.mjs';

export const CODEX_VERSION = '0.163.0';
export const FEATURES = Object.freeze({
  shell_tool: false, memories: false, multi_agent: false, apps: false,
  code_mode: false, code_mode_host: false, plugins: false, remote_plugin: false,
  hooks: false, computer_use: false, image_generation: false, view_image: false,
  in_app_browser: false, workspace_dependencies: false, sleep_tool: false,
  goals: false, daemon_auto_start: false, skip_host_skill_discovery: true,
});

export function codexArgs({ workspace, schema, final, model, effort }) {
  return ['exec', '--ignore-user-config', '--ephemeral', '--json', '--color', 'never',
    '--sandbox', 'read-only', '--skip-git-repo-check', '--cd', workspace,
    '--model', model, '--output-schema', schema, '--output-last-message', final,
    '-c', `model_reasoning_effort=${JSON.stringify(effort)}`,
    '-c', 'approval_policy="never"', '-c', 'web_search="disabled"',
    '-c', 'project_doc_max_bytes=0', '-c', 'mcp_servers={}',
    ...Object.entries(FEATURES).flatMap(([key, value]) => ['-c', `features.${key}=${value}`]), '-'];
}

export function inspectTrace(stdout, final) {
  const events = stdout.split(/\r?\n/u).filter(line => line.trim()).map(line => JSON.parse(line));
  const starts = events.filter(e => e.type === 'thread.started');
  const turnStarts = events.filter(e => e.type === 'turn.started');
  const turns = events.filter(e => e.type === 'turn.completed');
  if (starts.length !== 1 || typeof starts[0].thread_id !== 'string' || turnStarts.length !== 1 || turns.length !== 1
    || events.indexOf(starts[0]) >= events.indexOf(turnStarts[0]) || events.indexOf(turnStarts[0]) >= events.indexOf(turns[0])
    || events.some(e => ['error', 'turn.failed'].includes(e.type))) throw Error('incomplete_session_trace');
  // CLI 0.163.0 emits these host diagnostics as item.type=error before
  // turn.started. They are not model actions. Never allow generic error items
  // or notices after the model turn begins.
  const diagnostics = [], diagnosticEvents = new Set();
  let turnStarted = false;
  for (const event of events) {
    if (event.type === 'turn.started') turnStarted = true;
    const message = event.item?.message;
    if (!turnStarted && event.type === 'item.completed' && event.item?.type === 'error'
      && typeof message === 'string' && (message.startsWith('Under-development features enabled: skip_host_skill_discovery.')
        || message === 'Code Mode is unavailable because code-mode host is disabled. Code mode will fail closed; enable `features.code_mode_host` and install `codex-code-mode-host`.')) {
      diagnostics.push(message); diagnosticEvents.add(event);
    }
  }
  const items = events.filter(e => e.item && !diagnosticEvents.has(e)).map(e => e.item);
  if (items.some(item => !['reasoning', 'agent_message'].includes(item.type))) throw Error('unexpected_tool_or_action');
  const messages = events.filter(e => e.type === 'item.completed' && e.item?.type === 'agent_message');
  if (!messages.length || messages.at(-1).item.text?.trim() !== final.trim()) throw Error('final_message_trace_mismatch');
  const usage = turns[0].usage;
  const validUsage = ['input_tokens', 'cached_input_tokens', 'output_tokens'].every(key => Number.isSafeInteger(usage?.[key]) && usage[key] >= 0);
  return { thread_id: starts[0].thread_id, tool_calls: 0, startup_diagnostics: diagnostics, usage: validUsage ? usage : null };
}

// One child per cell, never retry or resume. Parent owns output files. The model
// receives only an inline packet, with no repository or ground-truth file access.
export async function executeSession({ executable, args, input, cwd, timeoutMs, signal, env }) {
  const started = performance.now();
  return new Promise(resolveSession => {
    const child = spawn(executable, args, { cwd, env, shell: false, detached: process.platform !== 'win32', stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', bytes = 0, failure = null, timer;
    const kill = () => {
      try { if (process.platform === 'win32') child.kill('SIGKILL'); else process.kill(-child.pid, 'SIGKILL'); } catch {}
    };
    const abort = () => { failure = 'interrupted'; kill(); };
    const collect = target => data => {
      bytes += Buffer.byteLength(data, 'utf8');
      if (bytes > 2 * 1024 * 1024) { failure = 'output_limit'; kill(); return; }
      if (target === 'stdout') stdout += data; else stderr += data;
    };
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
    child.stdout.on('data', collect('stdout')); child.stderr.on('data', collect('stderr'));
    child.stdin.on('error', () => {});
    signal?.addEventListener('abort', abort, { once: true });
    timer = setTimeout(() => { failure = 'timeout'; kill(); }, timeoutMs);
    child.once('error', () => { failure = 'spawn_failed'; });
    child.once('close', (code, childSignal) => {
      clearTimeout(timer); signal?.removeEventListener('abort', abort);
      resolveSession({ stdout, stderr, code, signal: childSignal, failure, wall_time_ms: Math.round(performance.now() - started) });
    });
    if (signal?.aborted) abort();
    else child.stdin.end(input);
  });
}

function markdown(report) {
  const lines = ['# Codex review calibration', '',
    `Status: ${report.complete ? 'complete' : 'incomplete'}; schema: ${report.schema_version}; authorizes: false`, '',
    `CLI: ${report.host.cli}; model: ${report.host.model}; reasoning: ${report.host.effort}; platform: ${report.host.platform}/${report.host.arch}`, '',
    '| Variant | Measured | Matched | Unmatched | Redundant | Missed | False clear | Clean flagged | Time (s) |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|'];
  for (const variant of VARIANTS) {
    const r = report.summary[variant];
    lines.push(`| ${variant} | ${r.measured}/${r.sessions} | ${r.true_positives} | ${r.unmatched_findings} | ${r.redundant_findings} | ${r.false_negatives} | ${r.false_clears} | ${r.clean_cases_flagged}/${r.clean_cases} | ${(r.wall_time_ms / 1000).toFixed(1)} |`);
  }
  if (report.derived_analysis) lines.push('', `Offline derived assessment. Original capture: ${report.derived_analysis.source}. Source report and raw events were preserved; this assessment made no model calls.`);
  lines.push('', '## Interpretation', '',
    'This is a synthetic packet-only comparison, not an implementation self-review baseline, a production review, AGDF host qualification, or a QA decision. No control state is read or written.',
    'Detections match requirement, gap category, file and a known defect line; quotations are checked against the packet. This is a deterministic scoring proxy. A human must audit reasoning in the preserved final JSON before treating a detection as correct.',
    'Unmatched findings are not established false positives: they may be useful coverage observations or defects omitted from the oracle. Redundant findings match an already detected obligation. A flagged correct case is not automatically a false alarm. Precision and a false-positive rate require independently adjudicated labels and are not reported.',
    'No tests are executed by the reviewer. Hidden checks run only against trusted synthetic fixtures in the parent.',
    'Costs in USD and human rework are unavailable. Token usage is recorded when the CLI reports it. Six small cases and a single repetition do not establish a reliable quality improvement.',
    'Infrastructure errors are invalid observations, never correct clean reviews. Any invalid or missing cell makes the comparison incomplete.', '',
    '## Cells', '', '| Case | Variant | Status | Result / error |', '|---|---|---|---|');
  for (const r of report.sessions) lines.push(`| ${r.case_id} | ${r.variant} | ${r.status} | ${r.error ?? r.review.disposition} |`);
  return `${lines.join('\n')}\n`;
}

export async function runComparison({ output, model, effort = 'high', timeoutMs = 120000,
  executable = process.env.CODEX_BIN || 'codex', signal, onProgress = () => {} } = {}) {
  if (!output || !model || !['low', 'medium', 'high', 'xhigh'].includes(effort)
    || !Number.isSafeInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 300000) throw Error('invalid_options');
  const host = spawnSync(executable, ['--version'], { encoding: 'utf8', timeout: 15000 });
  if (host.status !== 0 || host.stdout.trim() !== `codex-cli ${CODEX_VERSION}`) throw Error('unsupported_codex_version');
  const auth = spawnSync(executable, ['login', 'status'], { encoding: 'utf8', timeout: 15000 });
  if (auth.status !== 0 || !/Logged in using ChatGPT/iu.test(`${auth.stdout}${auth.stderr}`)) throw Error('existing_chatgpt_login_required');
  for (const item of CASES) if (item.oracle.check(item.packet) !== (item.oracle.expected.length === 0)) throw Error(`fixture_oracle_conflict:${item.id}`);
  const directory = resolve(output);
  mkdirSync(directory, { recursive: false, mode: 0o700 }); // Never overwrite an earlier run.
  const report = {
    schema_version: '1', kind: 'synthetic_codex_review_comparison', authorizes: false,
    started_at: new Date().toISOString(), complete: false,
    host: { cli: host.stdout.trim(), model, effort, platform: process.platform, arch: process.arch, node: process.version },
    experiment: { cases: CASES.length, variants: VARIANTS, repetitions: 1, max_sessions: CASES.length * VARIANTS.length,
      timeout_ms_per_session: timeoutMs, packet_only: true, baseline: 'fresh_context_standard_review',
      scoring: 'deterministic_citation_category_proxy_requires_human_audit',
      cases_digest: digest(CASES.map(({ id, packet, oracle }) => ({ id, packet, expected: oracle.expected }))),
      runner_digest: digest(readFileSync(new URL('./runner.mjs', import.meta.url), 'utf8')),
      review_contract_digest: digest(readFileSync(new URL('./review.mjs', import.meta.url), 'utf8')),
      fixtures_digest: digest(readFileSync(new URL('./fixtures.mjs', import.meta.url), 'utf8')) },
    isolation: { ignore_user_config: true, ephemeral: true, sandbox: 'read-only', approval_policy: 'never',
      mcp_servers: [], features: FEATURES, tools_allowed: [], packet_in_stdin: true,
      credentials_copied: false, global_config_modified: false, agdf_invoked: false },
    sessions: [], summary: {},
  };
  const persist = () => {
    report.summary = Object.fromEntries(VARIANTS.map(v => [v, aggregate(report.sessions, v)]));
    writeFileSync(join(directory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
    writeFileSync(join(directory, 'REPORT.md'), markdown(report));
  };
  persist();
  let infrastructureFailed = false;
  for (const [index, item] of CASES.entries()) {
    // Counterbalance which variant is first; each still gets a fresh session.
    for (const variant of index % 2 ? [...VARIANTS].reverse() : VARIANTS) {
      if (signal?.aborted) break;
      const key = `${item.id}-${variant}`, cell = join(directory, key);
      mkdirSync(cell, { mode: 0o700 });
      const workspace = mkdtempSync(join(tmpdir(), 'codex-review-'));
      try {
        const schema = join(workspace, 'response.schema.json'), final = join(cell, 'final.json');
        const input = reviewInput(item.packet, variant);
        writeFileSync(schema, JSON.stringify(SCHEMA));
        writeFileSync(join(cell, 'prompt.txt'), input);
        const args = codexArgs({ workspace, schema, final, model, effort });
        writeFileSync(join(cell, 'invocation.json'), JSON.stringify({ executable, args }, null, 2));
        onProgress({ case_id: item.id, variant, status: 'started' });
        // Preserve existing account auth in its existing location. Never copy or
        // expose credentials. Key-based billing is excluded from this pilot.
        const env = { ...process.env };
        delete env.OPENAI_API_KEY; delete env.CODEX_API_KEY;
        const execution = await executeSession({ executable, args, input, cwd: workspace, timeoutMs, signal, env });
        writeFileSync(join(cell, 'events.jsonl'), execution.stdout);
        writeFileSync(join(cell, 'stderr.txt'), execution.stderr);
        const row = { case_id: item.id, variant, packet_digest: digest(item.packet),
          wall_time_ms: execution.wall_time_ms, status: 'invalid', error: null, usage: null };
        try {
          if (execution.failure || execution.code !== 0) throw Error(execution.failure ?? `cli_exit_${execution.code ?? execution.signal}`);
          const text = readFileSync(final, 'utf8'), trace = inspectTrace(execution.stdout, text);
          row.review = validateReview(JSON.parse(text), item.packet);
          row.score = scoreReview(row.review, item.oracle);
          row.thread_id = trace.thread_id; row.tool_calls = trace.tool_calls; row.usage = trace.usage;
          row.startup_diagnostics = trace.startup_diagnostics;
          row.status = 'measured';
        } catch (error) { row.error = error.message; }
        report.sessions.push(row); persist(); onProgress(row);
        if (execution.failure || execution.code !== 0) infrastructureFailed = true;
      } finally { rmSync(workspace, { recursive: true, force: true }); }
      if (infrastructureFailed) break;
    }
    if (signal?.aborted || infrastructureFailed) break;
  }
  report.complete = report.sessions.length === report.experiment.max_sessions
    && report.sessions.every(row => row.status === 'measured');
  report.finished_at = new Date().toISOString(); persist();
  return report;
}

// Offline derived analysis. Source reports and event streams are never changed;
// no retries, new model calls, credential access or evidence promotion happen.
export function reassessComparison({ source, output } = {}) {
  if (!source || !output) throw Error('source_and_new_output_required');
  const sourceDir = resolve(source), directory = resolve(output);
  const reportBytes = readFileSync(join(sourceDir, 'report.json'), 'utf8');
  const original = JSON.parse(reportBytes);
  const expectedDigest = digest(CASES.map(({ id, packet, oracle }) => ({ id, packet, expected: oracle.expected })));
  if (original.kind !== 'synthetic_codex_review_comparison' || original.schema_version !== '1'
    || original.experiment.cases_digest !== expectedDigest || original.sessions.length > CASES.length * VARIANTS.length
    || original.experiment.fixtures_digest !== digest(readFileSync(new URL('./fixtures.mjs', import.meta.url), 'utf8'))) throw Error('comparison_source_mismatch');
  const report = structuredClone(original), seen = new Set(), inputs = [];
  report.derived_analysis = { source: sourceDir, source_report_digest: digest(reportBytes),
    assessor_digest: digest(readFileSync(new URL('./runner.mjs', import.meta.url), 'utf8')),
    assessment_review_contract_digest: digest(readFileSync(new URL('./review.mjs', import.meta.url), 'utf8')),
    assessed_at: new Date().toISOString(), inputs };
  report.sessions = original.sessions.map(row => {
    const item = CASES.find(c => c.id === row.case_id), key = `${row.case_id}-${row.variant}`;
    if (!item || !VARIANTS.includes(row.variant) || seen.has(key) || row.packet_digest !== digest(item.packet)) throw Error('invalid_source_cell');
    seen.add(key);
    // These statuses prove the original runner reached its post-exit audit.
    // A process failure or timeout is never repaired by a new trace parser.
    if (row.status !== 'measured' && row.error !== 'unexpected_tool_or_action') return row;
    const cell = join(sourceDir, key);
    const prompt = readFileSync(join(cell, 'prompt.txt'), 'utf8');
    const stdout = readFileSync(join(cell, 'events.jsonl'), 'utf8');
    const final = readFileSync(join(cell, 'final.json'), 'utf8');
    if (prompt !== reviewInput(item.packet, row.variant)) throw Error('source_prompt_mismatch');
    inputs.push({ cell: key, prompt_digest: digest(prompt), events_digest: digest(stdout), final_digest: digest(final) });
    const next = { case_id: row.case_id, variant: row.variant, packet_digest: row.packet_digest,
      wall_time_ms: row.wall_time_ms, status: 'invalid', error: null, usage: null };
    try {
      const trace = inspectTrace(stdout, final);
      next.review = validateReview(JSON.parse(final), item.packet);
      next.score = scoreReview(next.review, item.oracle);
      Object.assign(next, trace); next.status = 'measured';
    } catch (error) { next.error = error.message; }
    return next;
  });
  report.complete = report.sessions.length === CASES.length * VARIANTS.length && report.sessions.every(r => r.status === 'measured');
  report.summary = Object.fromEntries(VARIANTS.map(v => [v, aggregate(report.sessions, v)]));
  mkdirSync(directory, { recursive: false, mode: 0o700 });
  writeFileSync(join(directory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(join(directory, 'REPORT.md'), markdown(report));
  return report;
}
