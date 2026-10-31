#!/usr/bin/env node
// A finite direct-MCP observation. No model turn, prompt, login copy or install.
import { spawn, execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync, realpathSync, existsSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { resolveControlCommandTarget } from '../../packages/core/lib/control-state/approval-command-contract.js';
import { independentCodexEnvironment } from '../../packages/cli/lib/host-adapters/codex/mcp-startup.js';

export const METHODS = Object.freeze(['initialize', 'thread/start', 'mcpServerStatus/list', 'mcpServer/tool/call']);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export function assertNativeReplay(result, receipt) {
  if (result.structuredContent?.outcome !== 'already_applied' || !isDeepStrictEqual(result.structuredContent.receipt, receipt)) throw Error('PROBE_REPLAY_FAILED');
}
export function assertFixtureCall(tool, args, roots) {
  if (tool === 'agdf_inspect' && Object.keys(args).join() === 'operation' && args.operation === 'inventory') return;
  if (!['agdf_inspect', 'agdf_run'].includes(tool) || !roots.includes(args.primary_target)
    || args.working_directory !== args.primary_target || args.target_source !== 'explicit_target') throw Error('PROBE_CALL_OUTSIDE_FIXTURE');
  if (tool === 'agdf_inspect' && (args.operation !== 'project-state' || args.run_id !== undefined)) throw Error('PROBE_READ_NOT_ALLOWED');
  if (tool === 'agdf_run' && (args.command?.kind !== 'run.create' || args.command.payload.title !== 'Synthetic MCP defaults comparison'
    || args.target_id !== resolveControlCommandTarget(args.primary_target).target_id)) throw Error('PROBE_WRITE_NOT_ALLOWED');
}
export function appServer(env, cwd, executable, { spawnProcess = spawn, timeoutMs = 45000, closeTimeoutMs = 15000 } = {}) {
  const child = spawnProcess(executable, ['app-server'], { env, cwd, stdio: ['pipe', 'pipe', 'pipe'] });
  const pending = new Map(); let id = 0, buffer = '', stderr = '', closed = false;
  const fail = error => { for (const p of pending.values()) { clearTimeout(p.timer); p.reject(error); } pending.clear(); };
  child.stderr.setEncoding('utf8'); child.stderr.on('data', bytes => { stderr = (stderr + bytes).slice(-4096); });
  child.stdout.setEncoding('utf8'); child.stdout.on('data', bytes => {
    buffer += bytes;
    if (buffer.length > 2 * 1024 ** 2) { fail(Error('PROBE_OUTPUT_LIMIT')); child.kill(); return; }
    let end;
    while ((end = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, end); buffer = buffer.slice(end + 1); let message;
      try { message = JSON.parse(line); } catch { fail(Error('PROBE_NON_JSON_OUTPUT')); continue; }
      const p = pending.get(message.id);
      if (p) { pending.delete(message.id); clearTimeout(p.timer); message.error ? p.reject(Error(JSON.stringify(message.error))) : p.resolve(message.result); }
      else if (message.id !== undefined && message.method) {
        child.stdin.write(JSON.stringify({ id: message.id, error: { code: -32601, message: 'Unexpected server request in fixed probe' } }) + '\n');
        fail(Error('PROBE_UNEXPECTED_SERVER_REQUEST')); child.stdin.end();
      }
    }
  });
  const exited = new Promise(resolve => child.once('close', (code, signal) => { closed = true; fail(Error('PROBE_PROCESS_EXIT')); resolve({ code, signal }); }));
  child.once('error', error => fail(error));
  child.stdin.on('error', error => fail(error));
  return {
    notify(method, params) { if (method !== 'initialized') throw Error('PROBE_METHOD_FORBIDDEN'); child.stdin.write(JSON.stringify({ method, params }) + '\n'); },
    call(method, params) {
      if (!METHODS.includes(method) || closed) return Promise.reject(Error('PROBE_METHOD_FORBIDDEN'));
      return new Promise((resolve, reject) => {
        const next = ++id, timer = setTimeout(() => { pending.delete(next); reject(Error(`PROBE_TIMEOUT:${method}`)); }, timeoutMs);
        pending.set(next, { resolve, reject, timer }); child.stdin.write(JSON.stringify({ id: next, method, params }) + '\n');
      });
    },
    async close() { if (!closed) child.stdin.end(); const timer = setTimeout(() => child.kill('SIGKILL'), closeTimeoutMs); try { return await exited; } finally { clearTimeout(timer); } },
    stderr: () => stderr,
  };
}
function sourceIdentity(root) {
  const files = {};
  function visit(directory) { for (const name of readdirSync(join(root, directory), { withFileTypes: true })) {
    const path = `${directory}/${name.name}`;
    if (name.isDirectory()) visit(path); else if (name.isFile()) files[path] = sha(readFileSync(join(root, path)));
  } }
  for (const directory of ['packages/core/lib', 'packages/mcp-server/src']) visit(directory);
  for (const path of ['packages/cli/lib/mcp-dispatch-runtime.js', 'packages/cli/lib/mcp-protocol-runtime.js', 'plugins/agdf/meta/agdf-defaults.json', 'plugins/agdf/meta/agdf-defaults.schema.json',
    'scripts/native-probes/codex-mcp-defaults.mjs', 'scripts/native-probes/codex-mcp-defaults-test.mjs']) files[path] = sha(readFileSync(join(root, path)));
  return { head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), files };
}
function controlIdentity(root) {
  const files = {};
  function visit(path, relative = '') {
    if (!existsSync(path)) return;
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const key = `${relative}/${entry.name}`, child = join(path, entry.name);
      if (entry.isDirectory()) visit(child, key); else files[key] = entry.isFile() ? sha(readFileSync(child)) : 'non_regular';
    }
  }
  visit(join(root, '.agdf/control')); return sha(JSON.stringify(files));
}
export async function runProbe({ out, executable = process.env.CODEX_BIN || 'codex' } = {}) {
  // Offline harness tests run before generation in clean CI. Load package and
  // generated-resource consumers only for the actual built-candidate probe.
  const [{ createProtocolRuntime }, { initializeCanonicalControl }, { generatedFilesForTarget }] = await Promise.all([
    import('../../evals/mcp-ergonomics/lib/protocol-harness.js'), import('../../packages/cli/lib/scaffold/canonical-init.js'),
    import('../../packages/cli/lib/scaffold/plan.js'),
  ]);
  const repository = realpathSync(fileURLToPath(new URL('../../', import.meta.url)));
  out = resolve(repository, out ?? 'probe-results/mcp-defaults-run-3ab79b5a/codex.json');
  if (!relative(join(repository, 'probe-results'), out) || relative(join(repository, 'probe-results'), out).startsWith('..') || existsSync(out)) throw Error('PROBE_OUTPUT_PATH_INVALID');
  const work = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-codex-defaults-'))), profile = join(work, 'profile');
  mkdirSync(profile); let runtime, host;
  const report = { schema_version: 1, evidence_class: 'native_codex_cli_mcp_transport', complete: false, model_calls: 0, credential_copy: false, plugin_install: false,
    observed_at: new Date().toISOString(), platform: process.platform, arch: process.arch, node: process.version, calls: [], source_identity: sourceIdentity(repository) };
  const personalRoot = process.env.CODEX_HOME ?? join(homedir(), '.codex');
  const settingsIdentity = () => ['config.toml', 'plugins/installed_plugins.json', 'plugins/known_marketplaces.json']
    .map(path => existsSync(join(personalRoot, path)) ? sha(readFileSync(join(personalRoot, path))) : null);
  const beforeControl = controlIdentity(repository), beforeSettings = settingsIdentity();
  try {
    report.codex = execFileSync(executable, ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    runtime = createProtocolRuntime();
    report.runtime_marker = JSON.parse(readFileSync(join(runtime.fixture.root, '.agdf-mcp-owned.json'), 'utf8'));
    const roots = ['defaulted', 'explicit'].map(name => {
      const root = join(work, name); mkdirSync(root); execFileSync('git', ['init', '-q', root]);
      initializeCanonicalControl(root, generatedFilesForTarget('init', root, false, 'en')); return root;
    });
    const config = `web_search = "disabled"\n[features]\nplugins = false\nhooks = false\n[mcp_servers.agdf]\ncommand = ${JSON.stringify(process.execPath)}\nargs = ${JSON.stringify([join(runtime.fixture.serverRoot, 'bin/agdf-mcp.js'), '--surface', 'codex'])}\nrequired = true\nenabled_tools = ["agdf_inspect", "agdf_run"]\n`;
    writeFileSync(join(profile, 'config.toml'), config, { mode: 0o600 });
    const env = independentCodexEnvironment(process.env);
    for (const key of Object.keys(env)) if (key.startsWith('AGDF_')) delete env[key];
    Object.assign(env, { CODEX_HOME: profile, AGDF_DATA_DIR: join(work, 'data') });
    for (const key of ['OPENAI_API_KEY', 'CODEX_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_ORG_ID']) delete env[key];
    host = appServer(env, roots[0], executable);
    await host.call('initialize', { clientInfo: { name: 'agdf_defaults_probe', version: '1' }, capabilities: { experimentalApi: true, requestAttestation: false } });
    host.notify('initialized');
    const started = await host.call('thread/start', { cwd: roots[0], ephemeral: true, sandbox: 'workspace-write', approvalPolicy: 'never' });
    const threadId = started.thread.id;
    let cursor, servers = []; const seen = new Set();
    do {
      const page = await host.call('mcpServerStatus/list', { threadId, detail: 'toolsAndAuthOnly', limit: 100, ...(cursor ? { cursor } : {}) });
      servers.push(...page.data); cursor = page.nextCursor;
      if (cursor && seen.has(cursor) || seen.size > 16 || servers.length > 128) throw Error('PROBE_DISCOVERY_LIMIT');
      if (cursor) seen.add(cursor);
    } while (cursor);
    const server = servers.find(s => s.name === 'agdf');
    if (!server || server.toolsError) throw Error('PROBE_MCP_DISCOVERY_UNAVAILABLE');
    const tools = Object.values(server.tools ?? {}); report.definitions = tools;
    for (const name of ['agdf_inspect', 'agdf_run']) {
      const definition = tools.find(t => t.name === name);
      if (!definition || definition.inputSchema.required.includes('presentation_language') || definition.inputSchema.required.includes('working_directory')) throw Error('PROBE_CANDIDATE_SCHEMA_MISMATCH');
    }
    const readResults = [], writes = [];
    for (const [i, root] of roots.entries()) {
      const explicit = i === 1 ? { presentation_language: 'en', schema_version: '1', assurance: 'cooperative_local' } : {};
      const base = { working_directory: root, target_source: 'explicit_target', primary_target: root };
      const read = { ...base, operation: 'project-state', ...(i ? { presentation_language: 'en' } : {}) };
      const write = { ...base, ...explicit, target_id: resolveControlCommandTarget(root).target_id, operation_id: randomUUID(), command: { kind: 'run.create', payload: { title: 'Synthetic MCP defaults comparison' } } };
      for (const [tool, args] of [['agdf_inspect', read], ['agdf_run', write]]) {
        assertFixtureCall(tool, args, roots);
        const result = await host.call('mcpServer/tool/call', { threadId, server: 'agdf', tool, arguments: args });
        report.calls.push({ tool, arguments: args, result });
        if (result.isError || !result.structuredContent) throw Error('PROBE_TOOL_CALL_FAILED');
        if (tool === 'agdf_inspect') { if (result.structuredContent.outcome !== 'inspect_result') throw Error('PROBE_READ_FAILED'); readResults.push(result.structuredContent.report.effective_configuration.values); }
        else { if (result.structuredContent.outcome !== 'accepted') throw Error('PROBE_WRITE_FAILED'); writes.push({ args, receipt: result.structuredContent.receipt }); }
      }
    }
    if (!isDeepStrictEqual(readResults[0], readResults[1]) || !isDeepStrictEqual(writes[0].receipt.effect.record, writes[1].receipt.effect.record)) throw Error('PROBE_EXPLICIT_DEFAULTED_MISMATCH');
    const configPath = join(roots[0], '.agdf/control/config.json');
    const configuration = JSON.parse(readFileSync(configPath)); configuration.chat_language = 'de'; writeFileSync(configPath, JSON.stringify(configuration));
    const replay = await host.call('mcpServer/tool/call', { threadId, server: 'agdf', tool: 'agdf_run', arguments: writes[0].args });
    report.calls.push({ tool: 'agdf_run', arguments: writes[0].args, result: replay });
    assertNativeReplay(replay, writes[0].receipt);
    if (roots.some(root => readdirSync(join(root, '.agdf/control/runs')).length !== 1)) throw Error('PROBE_EFFECT_COUNT_FAILED');
    assertFixtureCall('agdf_inspect', { operation: 'inventory' }, roots);
    const missing = await host.call('mcpServer/tool/call', { threadId, server: 'agdf', tool: 'agdf_inspect', arguments: { operation: 'inventory' } });
    report.calls.push({ tool: 'agdf_inspect', arguments: { operation: 'inventory' }, result: missing });
    if (!missing.isError || !missing.structuredContent?.diagnostics?.some(d => d.code === 'working_directory_required')) throw Error('PROBE_CONTEXT_FAILURE_MISSING');
    report.complete = true;
  } catch (error) { report.failure = String(error.message).slice(0, 2000); }
  finally {
    if (host) report.exit = await host.close();
    if (!host || report.exit?.code === 0 && report.exit?.signal === null) { runtime?.dispose(); rmSync(work, { recursive: true, force: true }); }
    else { report.complete = false; report.failure ??= 'PROBE_EXIT_UNCONFIRMED'; report.retained_work_root = work; }
    report.temporary_roots_removed = !existsSync(work);
    report.source_control_preserved = controlIdentity(repository) === beforeControl;
    report.personal_settings_preserved = JSON.stringify(settingsIdentity()) === JSON.stringify(beforeSettings);
    if (!report.source_control_preserved || !report.personal_settings_preserved || !report.temporary_roots_removed) report.complete = false;
    const sanitized = JSON.stringify(report, null, 2).replaceAll(work, '<FIXTURE>').replaceAll(repository, '<CANDIDATE>');
    if (Buffer.byteLength(sanitized) > 1048576) throw Error('PROBE_REPORT_LIMIT');
    mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, sanitized + '\n', { flag: 'wx' });
  }
  return report;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--out')) throw Error('Usage: codex-mcp-defaults.mjs [--out probe-results/.../observation.json]');
  const report = await runProbe({ out: args[1] });
  console.log(JSON.stringify({ complete: report.complete, failure: report.failure, model_calls: report.model_calls, calls: report.calls.length }));
  if (!report.complete) process.exitCode = 1;
}
