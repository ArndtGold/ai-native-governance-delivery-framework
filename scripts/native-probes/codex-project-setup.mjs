// One independent installed-host session. No install, credential copy, global
// settings repair, prepared Git/identity/envelope, manual seed or writer fallback.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, lstatSync, realpathSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveHostCommand, spawnHostSync } from '../../packages/cli/lib/host-command.js';
import { pluginVersionFromList } from '../../packages/cli/lib/installers/plugin-command.js';
import { CODEX_MCP_STARTUP_ARGS, independentCodexEnvironment } from '../../packages/cli/lib/host-adapters/codex/mcp-startup.js';
import { observeCodexOrigins } from '../../packages/cli/lib/mcp-lifecycle/adapters/codex-origin-probe.js';
import { canonicalInitPlan } from '../../packages/core/lib/resources/canonical-init-plan.js';
import { inspectCanonicalProject } from '../../packages/core/lib/control-state/canonical-initialization.js';
import { resolutionRecord } from '../../packages/core/lib/control-state/input-resolution.js';

export const SETUP_TIMEOUT_MS = 300000;
export const SETUP_PROMPT = 'Erstelle in diesem leeren Verzeichnis ein neues Git-Testprojekt und initialisiere dessen .agdf-Projekt mit dem installierten AGDF-Plugin über native MCP-Tools. Prüfe anschließend den Status der ursprünglichen Initialisierungsoperation und den Projektzustand. Verwende die vom Plugin bereitgestellte Anleitung. Lege keinen Delivery-Run an. Keine manuellen Governance-Dateien, kein CLI-Schreibfallback, keine Installation oder globale Konfigurationsänderung. Führe die Arbeit selbständig aus.';
const sha = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const decode = call => { try { return JSON.parse(call.result.text); } catch { return null; } };

export function evaluateSetupObservation({ parsed, process: exit, audit, commands = [] }) {
  const reasons = [];
  if (exit.code !== 0 || exit.timeout || exit.output_limit) reasons.push('process_incomplete');
  if (parsed.turn_completed === false || !parsed.trace_complete && parsed.turn_completed === undefined) reasons.push('turn_incomplete');
  if (!parsed.trace_complete && parsed.turn_completed === true) reasons.push('trace_integrity_unconfirmed');
  const calls = parsed.calls ?? [], writes = calls.filter(c => c.name.endsWith('__agdf_project'));
  const successful = writes.filter(c => !c.result.is_error && ['accepted', 'already_applied'].includes(decode(c)?.outcome));
  const first = successful[0], operation = first?.input.operation_id;
  if (!first || !operation || successful.some(c => c.input.operation_id !== operation)) reasons.push('native_initialization_unconfirmed');
  if (calls.some(c => !c.name.endsWith('__agdf_inspect') && !c.name.endsWith('__agdf_project'))) reasons.push('unexpected_native_writer');
  if (!calls.some(c => c.name.endsWith('__agdf_inspect') && c.input.operation === 'project-state'
    && c.input.primary_target === audit.target && decode(c)?.report?.available === true)) reasons.push('project_read_missing');
  if (!calls.some(c => c.input.operation === 'operation-status' && c.input.module === `project.initialize/${operation}`
    && c.input.primary_target === audit.target && !c.result.is_error && decode(c)?.report?.status === 'recorded')) reasons.push('original_operation_unconfirmed');
  if (commands.some(command => /(?:agdf-project|command-file|\binit\b[^\n]*--dir|writeFile|write_text|apply_patch|\bcp\b|\brsync\b|\btee\b|\bcat\b[^\n]*>|\b(?:echo|printf)\b[^\n]*>)/iu.test(command))) reasons.push('shell_fallback_or_manual_seed');
  if (audit.status !== 'initialized' || audit.operation_status !== 'recorded' || audit.operation_id !== operation) reasons.push('receipt_unconfirmed');
  if (audit.file_count !== canonicalInitPlan().length || audit.hashes_match !== true || audit.extra_files?.length) reasons.push('canonical_files_mismatch');
  if (audit.run_count !== 0 || audit.approval_created !== false) reasons.push('unexpected_run_or_approval');
  if (audit.staging_clean !== true) reasons.push('staging_residue');
  if (audit.target !== first?.input.primary_target) reasons.push('target_mismatch');
  return { success: reasons.length === 0, reasons: [...new Set(reasons)], original_operation_id: operation ?? null };
}

export function auditSetupProject(root, operationId) {
  const state = inspectCanonicalProject(root, { operationId });
  const hashes = {}, extra_files = [];
  let hashes_match = false;
  if (state.status === 'initialized') {
    const config = JSON.parse(readFileSync(join(root, '.agdf/control/config.json'), 'utf8'));
    const expected = canonicalInitPlan(config.language ?? config);
    const wanted = new Set(expected.map(f => f.path)); wanted.add('.agdf/control/.agdf-canonical-init.json');
    hashes_match = expected.every(f => {
      const path = join(root, f.path);
      if (!existsSync(path) || !lstatSync(path).isFile() || lstatSync(path).isSymbolicLink()) return false;
      const actual = sha(readFileSync(path)); hashes[f.path] = actual; return actual === sha(Buffer.from(f.content));
    });
    function walk(path, prefix) {
      for (const name of readdirSync(path)) {
        const rel = `${prefix}/${name}`, full = join(path, name), stat = lstatSync(full);
        if (stat.isDirectory() && !stat.isSymbolicLink()) walk(full, rel);
        else if (!wanted.has(rel)) extra_files.push(rel);
      }
    }
    walk(join(root, '.agdf/control'), '.agdf/control');
  }
  const rows = existsSync(join(root, '.agdf/control/runs')) ? readdirSync(join(root, '.agdf/control/runs')).filter(n => n !== '.gitkeep') : [];
  const record = state.receipt ? resolutionRecord(state.receipt) : null;
  return { status: state.status, operation_status: state.operation_status, operation_id: record?.operation?.operation_id ?? null,
    target: root, file_count: Object.keys(hashes).length, hashes, hashes_match, extra_files,
    run_count: rows.length, approval_created: record?.created_gate_approval ?? null,
    receipt_digest: state.receipt?.receipt_digest ?? null,
    staging_clean: existsSync(join(root, '.agdf')) && readdirSync(join(root, '.agdf')).every(n => !n.startsWith('.control-stage-') && !n.includes('pending')) };
}

function resolvedExecutable(command, env) {
  if (isAbsolute(command)) return realpathSync(command);
  for (const dir of (env.PATH ?? '').split(delimiter)) {
    try { const path = join(dir, command); if (lstatSync(path).isFile() || lstatSync(path).isSymbolicLink()) return realpathSync(path); } catch {}
  }
  return command;
}

export async function runSetupProbe(out, { env = process.env } = {}) {
  const started = performance.now();
  if (!isAbsolute(out) || existsSync(out)) throw Error('SETUP_PROBE_REQUIRES_UNUSED_ABSOLUTE_REPORT_DIRECTORY');
  mkdirSync(out, { recursive: true });
  const project = join(realpathSync(out), 'project'); mkdirSync(project);
  const hostEnv = independentCodexEnvironment(env), executable = env.CODEX_BIN || 'codex';
  let model = null;
  const configuration = await observeCodexOrigins({ target: project, mode: 'configuration', env: hostEnv, timeoutMs: 15000,
    configurationObserver: result => { if (typeof result?.config?.model === 'string' && /^[a-zA-Z0-9._-]{1,100}$/u.test(result.config.model)) model = result.config.model; } });
  const report = { schema_version: 1, qualification: 'installed_tuple_only', candidate_host_qualification: 'not_established',
    model, configured_model_observation: configuration.status, configured_model_reason: configuration.reason, session_timeout_ms: SETUP_TIMEOUT_MS,
    executable: resolvedExecutable(executable, hostEnv), installation: 'unchanged', authentication: 'existing_environment', credential_copy: false,
    environment: { platform: process.platform, node: process.version, sandbox: 'workspace-write', parent_session_ids_removed: true },
    invocation_overrides: [...CODEX_MCP_STARTUP_ARGS, ...(model ? ['-m', model] : [])],
    prompt_digest: sha(SETUP_PROMPT), project, success: false };
  const version = spawnHostSync(executable, ['--version'], { env: hostEnv, encoding: 'utf8', timeout: 15000 });
  report.cli_version = version.status === 0 ? version.stdout.trim().slice(0, 120) : null;
  const plugins = spawnHostSync(executable, ['plugin', 'list'], { env: hostEnv, cwd: project, encoding: 'utf8', timeout: 15000 });
  const pluginVersion = plugins.status === 0 ? pluginVersionFromList(plugins.stdout, 'agdf@agdf') : null;
  report.installed_plugin_version = typeof pluginVersion === 'string' && /^[0-9A-Za-z.+-]{1,160}$/u.test(pluginVersion) ? pluginVersion : null;
  report.preflight_elapsed_ms = performance.now() - started;
  report.session_elapsed_ms = null;
  report.elapsed_ms = report.preflight_elapsed_ms;
  if (!model || !report.cli_version || !report.installed_plugin_version) {
    report.reasons = ['configured_model_cli_or_plugin_unavailable'];
    writeFileSync(join(out, 'observation.json'), JSON.stringify(report, null, 2) + '\n'); return report;
  }
  // The live parser also loads MCP protocol helpers. Pure oracle tests and an
  // unavailable host preflight must not require that optional live-test stack.
  // Resolve it before starting a model session so missing dependencies do not
  // leave a completed initialization without its final observation report.
  const { parseCodexT4Trace } = await import('../../evals/mcp-ergonomics/lib/native-run.js');
  const command = resolveHostCommand(executable, { env: hostEnv });
  const args = [...command.prefixArgs, 'exec', ...CODEX_MCP_STARTUP_ARGS, '--ephemeral', '--json', '--sandbox', 'workspace-write', '--skip-git-repo-check', '-m', model, SETUP_PROMPT];
  const sessionStarted = performance.now();
  const output = await new Promise(resolve => {
    const child = spawn(command.executable, args, { cwd: project, env: hostEnv, stdio: ['ignore', 'pipe', 'pipe'], shell: false, detached: process.platform !== 'win32' });
    let stdout = '', bytes = 0, timeout = false, output_limit = false, done = false, cleanup;
    const kill = () => { try { if (process.platform !== 'win32') process.kill(-child.pid, 'SIGKILL'); else child.kill('SIGKILL'); } catch {} };
    const finish = code => { if (done) return; done = true; clearTimeout(timer); clearTimeout(cleanup); resolve({ code, timeout, output_limit, stdout }); };
    const stop = () => { kill(); cleanup = setTimeout(() => finish(null), 2000); };
    const timer = setTimeout(() => { timeout = true; stop(); }, SETUP_TIMEOUT_MS);
    child.stdout.on('data', data => { bytes += data.length; if (bytes > 16 * 1024 * 1024) { output_limit = true; stop(); } else stdout += data; });
    child.stderr.on('data', data => { bytes += data.length; if (bytes > 16 * 1024 * 1024) { output_limit = true; stop(); } });
    child.once('error', () => finish(null)); child.once('close', finish);
  });
  report.session_elapsed_ms = performance.now() - sessionStarted;
  const parsed = parseCodexT4Trace(output.stdout, [], ['agdf_inspect', 'agdf_project']);
  const eventTypes = output.stdout.split('\n').flatMap(line => { try { return [JSON.parse(line).type]; } catch { return []; } });
  parsed.turn_completed = eventTypes.includes('turn.completed') && !eventTypes.includes('turn.failed');
  const commands = output.stdout.split('\n').flatMap(line => {
    try {
      const e = JSON.parse(line);
      if (e.item?.type === 'command_execution') return [e.item.command ?? ''];
      if (e.item?.type === 'file_change' && e.item.changes?.some(c => /(?:^|[\\/])\.agdf[\\/]/u.test(c.path ?? ''))) return ['apply_patch .agdf'];
      return [];
    } catch { return []; }
  });
  const operation = parsed.calls.find(c => c.name.endsWith('__agdf_project'))?.input.operation_id;
  let audit; try { audit = auditSetupProject(project, operation); } catch { audit = { status: 'unavailable', target: project }; }
  const result = evaluateSetupObservation({ parsed, process: output, audit, commands });
  const runtimes = parsed.calls.map(decode).filter(r => r?.runtime).map(r => r.runtime);
  Object.assign(report, result, { process: { code: output.code, timeout: output.timeout, output_limit: output.output_limit }, audit,
    runtime: runtimes[0] ?? null, structured_trace_complete: parsed.trace_complete, turn_completed: parsed.turn_completed,
    observed_tools: [...new Set(parsed.calls.map(c => c.name))], command_count: commands.length,
    // Bounded, selected structural facts only: no model reasoning, prompts,
    // shell output, full config, credentials or unrelated tool payloads.
    events: parsed.calls.map(c => ({ id: c.id, tool: c.name, operation: c.input.operation ?? c.input.command?.kind,
      operation_id: c.input.operation_id ?? null, module: c.input.module ?? null, failed: c.result.is_error,
      outcome: decode(c)?.outcome ?? null, status: decode(c)?.report?.status ?? null })) });
  if (!report.runtime?.runtime_digest || report.runtime?.provenance_status !== 'matched') {
    report.success = false; report.reasons = [...report.reasons, 'installed_runtime_provenance_unconfirmed'];
  }
  report.elapsed_ms = performance.now() - started;
  writeFileSync(join(out, 'observation.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== '--out') throw Error('USAGE: codex-project-setup.mjs --out ABSOLUTE_UNUSED_REPORT_DIRECTORY');
    const result = await runSetupProbe(args[1]);
    console.log(JSON.stringify({ success: result.success, reasons: result.reasons, report: join(args[1], 'observation.json') }));
    process.exitCode = result.success ? 0 : 2;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
