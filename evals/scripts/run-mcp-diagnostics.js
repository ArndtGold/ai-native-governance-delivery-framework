// Candidate-specific local protocol evidence; no native/human qualification.
import { createHash } from 'node:crypto';
import { cpus, platform, arch, release, loadavg, totalmem } from 'node:os';
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, realpathSync, readdirSync, cpSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { withStdioClient } from '../../packages/mcp-server/test/helpers.js';
import { ensurePluginMcpRuntime, pluginMcpRuntimeIdentity } from '../../packages/cli/lib/mcp-lifecycle/plugin-runtime.js';
import { offlineNpm, pluginRoot } from '../../scripts/support/plugin-mcp-fixture.js';
import { evaluateDoctor } from '../../packages/core/lib/control-evaluation/doctor.js';
import { cliGitObservation } from '../../packages/cli/lib/control-evaluation/git-observation.js';

const flags = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i], value = process.argv[i + 1];
  if (!['--target', '--run', '--samples', '--out'].includes(key) || !value || Object.hasOwn(flags, key)) throw Error('Invalid diagnostic probe arguments');
  flags[key] = value;
}
const { '--target': targetArgument, '--run': run, '--out': outputArgument } = flags;
if (!targetArgument?.startsWith('/') || !/^[A-Za-z0-9_-]{1,128}$/.test(run ?? '') || !outputArgument || flags['--samples'] !== '30')
  throw Error('usage: node run-mcp-diagnostics.js --target <absolute-target> --run <run> --samples 30 --out <new-output-directory>');
const target = realpathSync(targetArgument), directory = resolve(outputArgument);
mkdirSync(directory); // Never overwrite or cherry-pick a previous batch.
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const source = fileURLToPath(new URL('../../', import.meta.url));
const git = args => execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false',
  ...(args[0] === 'diff' ? ['diff', '--no-ext-diff', '--no-textconv', ...args.slice(1)] : args)],
  { cwd: source, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 ** 2 });
const capture = command => { try { return { state: 'measured', value: command() }; } catch { return { state: 'unavailable', reason: 'local_metadata_read_failed' }; } };
// Bind the actual desktop bundle established by the current host observation.
// Its filesystem name is not a product identity and may differ from Codex.app.
const hostAppBundle = process.env.AGDF_TEST_HOST_APP_BUNDLE ?? '/Applications/Codex.app';
if (!hostAppBundle.startsWith('/') || !hostAppBundle.endsWith('.app')) throw Error('invalid_host_app_bundle');
const appField = field => capture(() => execFileSync('/usr/bin/plutil', ['-extract', field, 'raw', join(hostAppBundle, 'Contents/Info.plist')],
  { encoding: 'utf8' }).trim());
function manifest(root) {
  const rows = [];
  function visit(path) {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = join(path, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile()) rows.push({ path: relative(root, file), digest: hash(readFileSync(file)) });
      else throw Error('unsupported_manifest_entry');
    }
  }
  visit(root); return { digest: hash(JSON.stringify(rows)), files: rows };
}
function sourceIdentity() {
  // The control tree has its own complete manifest. Exclude it at Git enumeration
  // rather than first buffering its much larger historical pathname inventory.
  const paths = [...new Set(git(['ls-files', '-co', '--exclude-standard', '-z', '--', '.', ':(exclude).agdf/**'])
    .split('\0').filter(p => p && !p.startsWith('.agdf/')))].sort();
  const files = paths.map(path => ({ path, digest: capture(() => hash(readFileSync(join(source, path)))) }));
  return { baseline_head: git(['rev-parse', 'HEAD']).trim(), branch: git(['branch', '--show-current']).trim(),
    tracked_diff_digest: hash(git(['diff', 'HEAD', '--binary'])), index_diff_digest: hash(git(['diff', '--cached', '--binary'])),
    file_manifest_digest: hash(JSON.stringify(files)), files };
}
const sourceBefore = sourceIdentity(), controlBefore = manifest(join(target, '.agdf/control'));
writeFileSync(join(directory, 'source-manifest.json'), JSON.stringify(sourceBefore, null, 2) + '\n');
writeFileSync(join(directory, 'control-manifest.json'), JSON.stringify(controlBefore, null, 2) + '\n');
const statePath = join(target, '.agdf/control/runs', run, 'RUN_STATE.md'), before = hash(readFileSync(statePath));
// Exercise the installed plugin's actual launcher and reduced owned package,
// rather than substituting the larger public CLI package. Retain the immutable
// candidate for review; SDK acquisition reuses the existing lock-verified local
// fixture transport and never claims an npm download or native installation.
const frozenPlugin = join(directory, 'candidate-plugin'), dataRoot = join(directory, 'candidate-data');
const selectedPlugin = process.env.AGDF_TEST_CANDIDATE_PLUGIN_ROOT ? realpathSync(process.env.AGDF_TEST_CANDIDATE_PLUGIN_ROOT) : pluginRoot;
cpSync(selectedPlugin, frozenPlugin, { recursive: true });
const prepared = ensurePluginMcpRuntime({ pluginRoot: frozenPlugin, dataRoot, exec: offlineNpm });
const identity = pluginMcpRuntimeIdentity(frozenPlugin);
if (prepared.dispatcherDigest !== identity.dispatcherDigest || prepared.digest !== identity.digest || prepared.sdkDigest !== identity.sdkDigest)
  throw Error('candidate_plugin_identity_mismatch');
const fixture = { root: prepared.root, command: process.execPath,
  args: [join(frozenPlugin, 'mcp/agdf-mcp-launch.js'), '--surface', 'codex', '--data', dataRoot] };
const samples = [], initialization = [], pages = [];
const marker = JSON.parse(readFileSync(join(fixture.root, '.agdf-mcp-owned.json'), 'utf8'));
const argumentsFor = { operation: 'doctor', presentation_language: 'en', working_directory: target, primary_target: target,
  target_source: 'explicit_target', run_id: run };
const metadata = { schema_version: 1, evidence_class: 'local_scripted_mcp_roundtrip', started_at: new Date().toISOString(),
  target, run_id: run, run_state_digest: before, control_manifest_digest: controlBefore.digest,
  source: { ...sourceBefore, files: undefined }, candidate: marker,
  candidate_plugin: { root: frozenPlugin, selected_source: selectedPlugin, identity, launcher: fixture.args, retained: true,
    sdk_acquisition: 'existing local SDK copy; actual bytes verified against the shipped locked SDK digest; no npm download or native installation' },
  environment: { node: process.version, platform: platform(), os_release: release(), arch: arch(), cpu: cpus()[0]?.model,
    logical_cpus: cpus().length, physical_memory_bytes: totalmem(), initial_load: loadavg(),
    macos: capture(() => execFileSync('/usr/bin/sw_vers', [], { encoding: 'utf8' })),
    host_app: { bundle_path: hostAppBundle, name: appField('CFBundleName'), identifier: appField('CFBundleIdentifier'),
      version: appField('CFBundleShortVersionString'), build: appField('CFBundleVersion') } },
  composition: '10 initialized connections x 3 sequential doctor calls; no discarded warmups',
  excluded_costs: { model_reasoning: 'not present in scripted environment', human_permission_wait: 'not present in scripted environment', remote_latency: 'not present in local STDIO environment' },
  native_qualified: false, human_accepted: false, authorizes: false };
writeFileSync(join(directory, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n');
const environmentComplete = metadata.environment.macos.state === 'measured'
  && ['name', 'identifier', 'version', 'build'].every(field => metadata.environment.host_app[field].state === 'measured'
    && metadata.environment.host_app[field].value.length > 0)
  && metadata.environment.cpu && metadata.environment.logical_cpus > 0 && metadata.environment.physical_memory_bytes > 0;
if (!environmentComplete) {
  writeFileSync(join(directory, 'preflight-status.json'), JSON.stringify({ state: 'invalid', reason: 'required_environment_metadata_unavailable',
    samples_issued: 0, native_qualified: false, authorizes: false }, null, 2) + '\n');
  throw Error('required_environment_metadata_unavailable_before_sampling');
}
// Semantic reference only, outside timed protocol samples; no hidden MCP warmup.
// Keep the actual findings so a fast but changed diagnosis cannot satisfy parity.
const baselineStarted = performance.now();
const baseline = { selected: evaluateDoctor(target, { runId: run, ignoreRunIdEnv: true }, cliGitObservation),
  all_active: evaluateDoctor(target, { allActive: true, ignoreRunIdEnv: true }, cliGitObservation) };
writeFileSync(join(directory, 'semantic-baseline.json'), JSON.stringify({ ...baseline,
  evidence_class: 'untimed_direct_core_reference', elapsed_ms: performance.now() - baselineStarted,
  native_qualified: false, authorizes: false }, null, 2) + '\n');
try {
  for (let connection = 1; connection <= 10; connection++) {
    const initialized = performance.now();
    try { await withStdioClient(fixture, async client => {
      initialization.push({ connection, initialization_ms: performance.now() - initialized,
        protocol: client.getNegotiatedProtocolVersion() });
      for (let request = 1; request <= 3; request++) {
        const started = performance.now(); let row;
        try {
          const result = await client.callTool({ name: 'agdf_inspect', arguments: argumentsFor });
          row = { connection, request, first_request: request === 1, elapsed_ms: performance.now() - started,
            completed: !result.isError && result.structuredContent?.report?.available === true,
            response: result };
        } catch (error) { row = { connection, request, first_request: request === 1, elapsed_ms: performance.now() - started,
          completed: false, error: { code: error.code ?? null, message: error.message }, phase_measurement: 'unavailable' }; }
        row.load_after = loadavg();
        samples.push(row); appendFileSync(join(directory, 'samples.jsonl'), JSON.stringify(row) + '\n');
      }
      if (connection === 10) {
        const started = performance.now(); let cursor;
        do {
          const { run_id, ...all } = argumentsFor;
          const result = await client.callTool({ name: 'agdf_inspect', arguments: { ...all, all_active: true, ...(cursor ? { cursor } : {}) } });
          pages.push(result); appendFileSync(join(directory, 'all-active.jsonl'), JSON.stringify(result) + '\n');
          if (result.isError || result.structuredContent?.report?.available !== true) break;
          cursor = result.structuredContent.report.next_cursor;
          if (pages.length > 64) throw Error('unbounded_advertised_inventory');
        } while (cursor);
        metadata.all_active_elapsed_ms = performance.now() - started;
      }
    }); } catch (error) {
      appendFileSync(join(directory, 'connection-errors.jsonl'), JSON.stringify({ connection, elapsed_ms: performance.now() - initialized,
        error: { code: error.code ?? null, message: error.message } }) + '\n');
      for (let request = samples.filter(row => row.connection === connection).length + 1; request <= 3; request++) {
        const row = { connection, request, first_request: request === 1, elapsed_ms: null, completed: false,
          phase_measurement: 'request_not_issued_after_connection_failure' };
        samples.push(row); appendFileSync(join(directory, 'samples.jsonl'), JSON.stringify(row) + '\n');
      }
    }
  }
} finally { metadata.candidate_retained = true; }
const sorted = samples.map(r => r.elapsed_ms ?? Infinity).sort((a, b) => a - b), p95 = sorted[Math.ceil(.95 * sorted.length) - 1];
const countWithin = samples.filter(r => r.completed && r.elapsed_ms <= 2000).length;
const runResults = rows => rows.map(row => ({ run_id: row.run_id, status: row.report.status, findings: row.report.findings }))
  .sort((a, b) => a.run_id.localeCompare(b.run_id));
const observedRuns = pages.flatMap(page => page.structuredContent?.report?.runs ?? []);
const findingValues = findings => findings.map(finding => JSON.stringify(Object.fromEntries(Object.entries(finding)
  .sort(([left], [right]) => left.localeCompare(right))))).sort();
const observedFindings = pages.flatMap(page => page.structuredContent?.report?.findings ?? []);
const allActiveMatches = JSON.stringify(runResults(observedRuns)) === JSON.stringify(runResults(baseline.all_active.runs))
  && JSON.stringify(findingValues(observedFindings)) === JSON.stringify(findingValues(baseline.all_active.findings))
  && pages.at(-1)?.structuredContent?.report?.status === baseline.all_active.status
  && JSON.stringify(pages.at(-1)?.structuredContent?.report?.summary) === JSON.stringify(baseline.all_active.summary);
const selectedMatches = samples.every(row => row.completed && row.response.structuredContent.report.status === baseline.selected.status
  && JSON.stringify(row.response.structuredContent.report.findings) === JSON.stringify(baseline.selected.findings));
const sourceAfter = sourceIdentity(), controlAfter = manifest(join(target, '.agdf/control'));
const unchanged = sourceBefore.file_manifest_digest === sourceAfter.file_manifest_digest && sourceBefore.baseline_head === sourceAfter.baseline_head
  && sourceBefore.branch === sourceAfter.branch && sourceBefore.index_diff_digest === sourceAfter.index_diff_digest
  && sourceBefore.tracked_diff_digest === sourceAfter.tracked_diff_digest && controlBefore.digest === controlAfter.digest;
writeFileSync(join(directory, 'metadata.json'), JSON.stringify({ ...metadata, completed_at: new Date().toISOString(),
  final_load: loadavg(), source_after: { ...sourceAfter, files: undefined }, control_manifest_after: controlAfter.digest }, null, 2) + '\n');
const summary = { schema_version: 1, completed_at: new Date().toISOString(), samples: samples.length, p95_ms: Number.isFinite(p95) ? p95 : null,
  environment_metadata_complete: Boolean(environmentComplete),
  selected_findings_match_direct_core: selectedMatches, all_active_findings_match_direct_core: allActiveMatches,
  successful_within_2000_ms: countWithin, reference_target_passed: samples.length === 30 && p95 <= 2000 && countWithin >= 29,
  selected_statuses: samples.reduce((counts,row) => {
    const status=row.response?.structuredContent?.report?.status ?? 'unavailable'; counts[status]=(counts[status]??0)+1; return counts;
  },{}),
  first_request_ms: samples.filter(r => r.first_request).map(r => r.elapsed_ms), subsequent_ms: samples.filter(r => !r.first_request).map(r => r.elapsed_ms),
  initialization, all_active_pages: pages.length, all_active_elapsed_ms: metadata.all_active_elapsed_ms,
  all_active_final: pages.at(-1)?.structuredContent?.report ?? null,
  run_state_unchanged: before === hash(readFileSync(statePath)), source_and_control_unchanged: unchanged, native_qualified: false, authorizes: false };
writeFileSync(join(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ ...summary, all_active_final: summary.all_active_final && { status: summary.all_active_final.status,
  completeness: summary.all_active_final.completeness, inventory: summary.all_active_final.inventory } }, null, 2));
if (!summary.reference_target_passed || !unchanged || !summary.run_state_unchanged || !selectedMatches || !allActiveMatches
  || summary.all_active_final?.completeness !== 'complete') process.exitCode = 1;
