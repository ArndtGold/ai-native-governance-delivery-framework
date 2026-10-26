// Test-execution protection for the existing T7 owner; never product/gate authority.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { constants, openSync, closeSync, readFileSync, writeFileSync, appendFileSync, realpathSync, lstatSync, existsSync, unlinkSync } from 'node:fs';
import { readFile, readdir, lstat, readlink, mkdir, open, writeFile } from 'node:fs/promises';
import { join, relative, isAbsolute, dirname } from 'node:path';

const SETTINGS = ['config.toml', 'plugins/installed_plugins.json', 'plugins/known_marketplaces.json'];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = (parent, path) => { const rel = relative(parent, path); return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel); };
const fail = code => { throw Error(code); };
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const save = (path, value) => writeFile(path, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });

export function combinedPolicy(input) {
  return `(version 1)\n(allow default)\n(deny file-write* (subpath ${JSON.stringify(input.root)}))\n(deny file-write* ${SETTINGS.map(file => `(literal ${JSON.stringify(join(input.codex_home, file))})`).join(' ')})\n`;
}

function readInput(path, candidate) {
  if (!path || !isAbsolute(path) || lstatSync(path).isSymbolicLink() || lstatSync(path).size > 131072) fail('T7_GUARD_INPUT_INVALID');
  const bytes = readFileSync(path), input = JSON.parse(bytes);
  if (input.schema_version !== 1 || input.candidate !== realpathSync(candidate)) fail('T7_GUARD_CANDIDATE_MISMATCH');
  for (const key of ['root', 'candidate', 'codex_home']) if (!isAbsolute(input[key] ?? '') || realpathSync(input[key]) !== input[key]) fail('T7_GUARD_PATH_INVALID');
  if (input.root === input.candidate || inside(input.root, input.candidate) || inside(input.candidate, input.root)) fail('T7_GUARD_ROOT_OVERLAP');
  if (!inside(input.candidate, input.output) || !inside(input.candidate, input.ledger) || !inside(input.candidate, path)) fail('T7_GUARD_OUTPUT_INVALID');
  // Existing ancestors must be canonical; a literal deny cannot protect a symlink alias.
  for (const value of [input.output, input.ledger]) {
    let parent = dirname(value); while (!existsSync(parent)) parent = dirname(parent);
    if (realpathSync(parent) !== parent) fail('T7_GUARD_OUTPUT_ALIAS');
    if (existsSync(value) && lstatSync(value).isSymbolicLink()) fail('T7_GUARD_OUTPUT_ALIAS');
  }
  for (const file of SETTINGS) {
    const value = join(input.codex_home, file);
    if (existsSync(value) && (lstatSync(value).isSymbolicLink() || realpathSync(value) !== value)) fail('T7_GUARD_SETTINGS_ALIAS');
    if (existsSync(dirname(value)) && realpathSync(dirname(value)) !== dirname(value)) fail('T7_GUARD_SETTINGS_ALIAS');
  }
  if (!input.bindings || !Object.keys(input.bindings).length || !input.frozen_candidate || !input.expected_settings) fail('T7_GUARD_BINDINGS_REQUIRED');
  for (const [file, expected] of Object.entries(input.bindings)) {
    if (!inside(input.candidate, join(input.candidate, file)) || !/^[a-f0-9]{64}$/.test(expected)) fail('T7_GUARD_SOURCE_INVALID');
    if (sha(readFileSync(join(input.candidate, file))) !== expected || sha(readFileSync(join(input.root, file))) !== expected) fail('T7_GUARD_SOURCE_CHANGED');
  }
  const probe = join(input.root, 'packages/core/lib/control-inspect/contract.js');
  if (realpathSync(probe) !== probe || !existsSync(join(input.codex_home, 'config.toml'))) fail('T7_GUARD_PROBE_UNAVAILABLE');
  return { input, input_digest: sha(bytes), policy: combinedPolicy(input) };
}

function deniedOpen(path) {
  let fd;
  try { fd = openSync(path, constants.O_WRONLY | constants.O_APPEND); }
  catch (error) { if (['EPERM', 'EACCES'].includes(error.code)) return true; throw error; }
  finally { if (fd !== undefined) closeSync(fd); }
  fail('T7_GUARD_PROTECTION_NOT_ACTIVE');
}

export function verifyGuardedWorker(candidate) {
  const binding = readInput(process.env.AGDF_T7_GUARD_INPUT, candidate);
  const { input, input_digest, policy } = binding;
  const contextPath = process.env.AGDF_T7_GUARD_WORKER;
  if (!contextPath || !inside(input.output, contextPath)) fail('T7_GUARD_WORKER_BINDING_INVALID');
  const context = json(contextPath);
  if (context.input_digest !== input_digest || context.policy_digest !== sha(policy) || context.policy_path !== join(input.output, 'combined.sb') || readFileSync(context.policy_path, 'utf8') !== policy) fail('T7_GUARD_WORKER_BINDING_INVALID');
  deniedOpen(join(input.root, 'packages/core/lib/control-inspect/contract.js'));
  deniedOpen(join(input.codex_home, 'config.toml'));
  const positive = join(input.output, `positive-${process.pid}.tmp`);
  try { writeFileSync(positive, 'owned-write-control', { flag: 'wx', mode: 0o600 }); if (readFileSync(positive, 'utf8') !== 'owned-write-control') fail('T7_GUARD_POSITIVE_CONTROL_FAILED'); }
  finally { if (existsSync(positive)) unlinkSync(positive); }
  const controls = { owner: 'macos_sandbox_exec', policy_digest: sha(policy), input_digest, root_write_denied: true, config_write_denied: true, positive_control: true, immutable_settings: SETTINGS, protected_root: input.root, model_invocations: 0 };
  writeFileSync(join(input.output, 'guard-controls.json'), JSON.stringify(controls, null, 2) + '\n');
  return { ...binding, context, controls };
}

export function recordGuardedSession(candidate, phase, pid = null) {
  const { input, context, input_digest } = verifyGuardedWorker(candidate);
  if (context.preflight_only) fail('T7_PREFLIGHT_MODEL_FORBIDDEN');
  const reserved = json(input.ledger);
  if (reserved.input_digest !== input_digest || reserved.sessions_reserved.length !== 2) fail('T7_SESSION_RESERVATION_INVALID');
  const path = join(input.output, 'session-launches.jsonl');
  const events = existsSync(path) ? readFileSync(path, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
  const attempts = events.filter(event => event.phase === 'attempted').length;
  if (phase === 'attempted' && attempts >= 2) fail('T7_SESSION_BUDGET_EXHAUSTED');
  if (!['attempted', 'executed'].includes(phase) || phase === 'executed' && (attempts < 1 || events.at(-1)?.phase !== 'attempted')) fail('T7_SESSION_EVENT_INVALID');
  appendFileSync(path, JSON.stringify({ phase, session: phase === 'attempted' ? attempts + 1 : attempts, pid, at: new Date().toISOString() }) + '\n', { mode: 0o600 });
}

async function command(command, args, options = {}, owned = new Set()) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    owned.add(child);
    let stdout = '', stderr = '';
    const timer = setTimeout(() => killGroup(child.pid), 15000);
    child.stdout.on('data', chunk => { stdout += chunk; }); child.stderr.on('data', chunk => { stderr += chunk; });
    child.once('error', error => { clearTimeout(timer); owned.delete(child); reject(error); });
    child.once('close', code => { clearTimeout(timer); owned.delete(child); if (code !== 0) reject(Error('T7_SNAPSHOT_COMMAND_FAILED:' + stderr.slice(0, 100))); else resolve(stdout); });
  });
}
async function fileValue(path) {
  try { const stat = await lstat(path); return stat.isSymbolicLink() ? { symlink: await readlink(path) } : stat.isDirectory() ? { directory: true } : { sha256: sha(await readFile(path)) }; }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function walkFiles(root, prefix, paths) {
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    const rel = join(prefix, entry.name);
    if (entry.isDirectory()) await walkFiles(root, rel, paths); else paths.add(rel);
  }
}
async function rootSnapshot(input, checkpoint = () => {}, owned) {
  const listing = await command('git', ['-c', 'core.fsmonitor=false', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: input.root, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }, owned);
  const paths = new Set(listing.split('\0').filter(Boolean));
  await walkFiles(input.root, '.agdf/control', paths);
  const files = {};
  for (const path of [...paths].sort()) { checkpoint(); files[path] = await fileValue(join(input.root, path)); }
  const settings = {};
  for (const rel of SETTINGS) settings[rel] = (await fileValue(join(input.codex_home, rel)))?.sha256 ?? null;
  const index = await command('git', ['-c', 'core.fsmonitor=false', 'ls-files', '--stage', '-z'], { cwd: input.root, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }, owned);
  return { files, settings, staging_sha256: sha(index), scope: 'tracked/nonignored Root files plus complete control; entire Root OS denial' };
}
async function checkFrozen(input, checkpoint = () => {}) {
  const bytes = await readFile(input.frozen_candidate.path);
  if (sha(bytes) !== input.frozen_candidate.sha256) fail('T7_FROZEN_MANIFEST_CHANGED');
  const manifest = JSON.parse(bytes);
  for (const [rel, expected] of Object.entries(manifest.files)) {
    checkpoint();
    if (!inside(input.candidate, join(input.candidate, rel))) fail('T7_FROZEN_PATH_INVALID');
    if (JSON.stringify(await fileValue(join(input.candidate, rel))) !== JSON.stringify(expected)) fail('T7_FROZEN_CANDIDATE_CHANGED:' + rel);
  }
}
function killGroup(pid) { if (pid) try { process.kill(-pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; } }

export async function runGuardedCohort({ candidate, entry, args, executable = '/usr/bin/sandbox-exec', deadlineMs = 1500000 }) {
  // Deadline options are injected by tests of this execution owner, never public CLI flags.
  if (process.platform !== 'darwin' || !existsSync(executable)) fail('T7_GUARD_APPLICATION_UNAVAILABLE');
  const { input, input_digest, policy } = readInput(process.env.AGDF_T7_GUARD_INPUT, candidate);
  if (existsSync(input.output)) fail('T7_GUARD_OUTPUT_EXISTS');
  await mkdir(input.output, { recursive: true, mode: 0o700 });
  const started = Date.now(); let worker, timedOut = false, before, result, signals = []; const owned = new Set();
  const terminate = () => { timedOut = true; killGroup(worker?.pid); for (const child of owned) killGroup(child.pid); };
  // Reserve five seconds within the whole-window limit for termination/reap/reporting.
  const timer = setTimeout(terminate, Math.max(1, deadlineMs - Math.min(5000, deadlineMs / 5)));
  const hard = setTimeout(() => { terminate(); process.exit(124); }, deadlineMs);
  const onSignal = () => terminate();
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) { process.once(signal, onSignal); signals.push(signal); }
  const assertTime = () => { if (timedOut) fail('T7_COHORT_DEADLINE'); };
  try {
    await checkFrozen(input, assertTime); assertTime();
    before = await rootSnapshot(input, assertTime, owned); assertTime();
    if (JSON.stringify(before.settings) !== JSON.stringify(input.expected_settings)) fail('T7_PROTECTED_SETTINGS_CHANGED');
    await save(join(input.output, 'root-before.json'), before);
    const preflightOnly = args.includes('--preflight-only');
    if (!preflightOnly) {
      const receipt = json(input.preflight.path);
      if (sha(readFileSync(input.preflight.path)) !== input.preflight.sha256 || receipt.exit_code !== 0 || !receipt.preserved || receipt.model_invocations !== 0 || receipt.frozen_candidate_digest !== input.frozen_candidate.sha256 || receipt.policy_digest !== sha(policy) || JSON.stringify(receipt.bindings) !== JSON.stringify(input.bindings)) fail('T7_FRESH_PREFLIGHT_REQUIRED');
      // Exclusive creation is the one-cohort reservation boundary. Never overwrite/retry it.
      const ledger = await open(input.ledger, 'wx', 0o600);
      await ledger.writeFile(JSON.stringify({ sessions_reserved: [1, 2], cohort_launches_reserved: 1, model: 'gpt-6.1-sol', reasoning_effort: 'low', input_digest, bindings: input.bindings, at: new Date().toISOString() }, null, 2) + '\n'); await ledger.sync(); await ledger.close();
    }
    await writeFile(join(input.output, 'combined.sb'), policy, { mode: 0o600 });
    const contextPath = join(input.output, 'worker-context.json');
    await save(contextPath, { input_digest, policy_digest: sha(policy), policy_path: join(input.output, 'combined.sb'), preflight_only: preflightOnly });
    const env = { ...process.env, CODEX_HOME: input.codex_home, AGDF_T7_GUARD_WORKER: contextPath };
    for (const key of Object.keys(env)) if (key === 'AGDF_AB_REPETITION' || /^(?:OPENAI_|AZURE_OPENAI_|CODEX_API_KEY$)/.test(key)) delete env[key];
    assertTime();
    const out = await open(join(input.output, 'stdout.log'), 'wx', 0o600), err = await open(join(input.output, 'stderr.log'), 'wx', 0o600);
    let code;
    try {
      code = await new Promise((resolve, reject) => {
        worker = spawn(executable, ['-f', join(input.output, 'combined.sb'), process.execPath, entry, ...args], { cwd: candidate, env, detached: true, stdio: ['ignore', out.fd, err.fd] });
        worker.once('error', reject); worker.once('exit', resolve);
      });
    } finally { killGroup(worker?.pid); await out.close(); await err.close(); }
    const controls = existsSync(join(input.output, 'guard-controls.json')) ? json(join(input.output, 'guard-controls.json')) : null;
    const stderr = await readFile(join(input.output, 'stderr.log'), 'utf8');
    let failure = timedOut ? 'T7_COHORT_DEADLINE' : controls ? null : /sandbox-exec:|sandbox_apply/.test(stderr) ? 'T7_GUARD_APPLICATION_FAILED' : 'T7_GUARD_VERIFICATION_FAILED';
    if (controls && code !== 0 && !timedOut) failure = 'T7_WORKER_FAILED';
    const after = await rootSnapshot(input, assertTime, owned); await save(join(input.output, 'root-after.json'), after);
    await checkFrozen(input, assertTime); assertTime();
    const preserved = JSON.stringify(before) === JSON.stringify(after);
    const launchesPath = join(input.output, 'session-launches.jsonl');
    const launches = existsSync(launchesPath) ? readFileSync(launchesPath, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
    result = { exit_code: code === 0 && controls && preserved && !failure ? 0 : 1, worker_exit_code: code, failure, preserved, policy_digest: sha(policy), input_digest, bindings: input.bindings, frozen_candidate_digest: input.frozen_candidate.sha256, preflight_only: preflightOnly, evidence_class: process.env.NODE_TEST_CONTEXT ? 'offline_mock_host' : preflightOnly ? 'native_host_preflight' : 'native_host_observation', session_invocations: launches.filter(e => e.phase === 'executed').length, model_invocations: process.env.NODE_TEST_CONTEXT ? 0 : launches.filter(e => e.phase === 'attempted').length !== launches.filter(e => e.phase === 'executed').length ? null : launches.filter(e => e.phase === 'executed').length, launches, elapsed_ms: Date.now() - started };
  } catch (error) { result = { exit_code: timedOut ? 124 : 1, failure: timedOut ? 'T7_COHORT_DEADLINE' : error.message, preserved: false, input_digest, policy_digest: sha(policy), model_invocations: null, elapsed_ms: Date.now() - started }; }
  finally {
    killGroup(worker?.pid); for (const child of owned) killGroup(child.pid); clearTimeout(timer); clearTimeout(hard);
    for (const signal of signals) process.off(signal, onSignal);
  }
  await save(join(input.output, 'result.json'), result);
  return result;
}
