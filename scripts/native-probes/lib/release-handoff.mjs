import assert from 'node:assert/strict';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, copyFileSync, renameSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnHostSync } from '../../../packages/cli/lib/host-command.js';
import { candidateManifest, containedFile, jsonDigest, readCandidate, sha, validateCandidate } from './release-candidate.mjs';
import { CLI_CASES, releasePolicy, requiredReleaseCases } from './release-policy.mjs';
import { assertHostReleaseEvidence, assertTuple, releaseRecords } from './release-observation.mjs';
import { projectNativeRelease } from '../../host-compatibility/native-release.mjs';

const json = value => `${JSON.stringify(value, null, 2)}\n`;
const writeNew = (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, typeof value === 'string' ? value : json(value), { flag: 'wx' }); };
export function bundleDigest(rows) {
  return jsonDigest(rows.map(({ record }) => record).sort((a, b) => a.id.localeCompare(b.id, 'en')));
}
export function assertBundleReview(review, rows, candidate) {
  assert.equal(review?.schema_version, 1); assert.equal(review.reviewed, true, 'native_review_required');
  assert.ok(typeof review.reviewer === 'string' && review.reviewer.trim(), 'native_reviewer_missing');
  assert.equal(review.candidate_id, candidate.candidate_id, 'native_review_candidate_mismatch');
  assert.equal(review.bundle_digest, bundleDigest(rows), 'native_review_bundle_mismatch');
}
// A schema-2 review locks exactly the one actual tuple of its own host and surface.
function assertReviewScope(review, host, surface) {
  assert.ok(Array.isArray(review.tuples) && review.tuples.length === 1
    && review.tuples[0]?.host === host && review.tuples[0]?.surface === surface, 'native_review_tuple_scope');
}
function ownedImportParent(root, candidateId) {
  assert.match(candidateId, /^[a-f0-9]{64}$/u);
  let parent = root;
  for (const part of ['evals','host-compatibility','native',candidateId]) {
    parent = join(parent, part);
    if (existsSync(parent)) assert.ok(lstatSync(parent).isDirectory() && !lstatSync(parent).isSymbolicLink(), 'native_import_parent_unsafe');
    else mkdirSync(parent);
  }
  return parent;
}
// Schema 3 derives the scope from the canonical targets: a listed host/surface is mandatory evidence.
export function evidenceScope(policy, host, surface) {
  if (policy.schema_version === 3) {
    if (policy.required_targets.some(target => target.host === host && target.surface === surface)) return undefined;
    return surface === 'desktop-code' ? 'optional-desktop' : 'optional-cli';
  }
  return surface === 'cli' ? 'optional-cli' : undefined;
}
export function importNativeEvidence(root, { candidate, bundle, review, host = 'claude', surface }) {
  assert.ok(['codex','claude'].includes(host), 'native_import_host_invalid');
  const policy = releasePolicy(root);
  if (policy.schema_version >= 2) assert.ok(['cli','desktop-code'].includes(surface), 'native_import_surface_required');
  const scope = evidenceScope(policy, host, surface);
  const actualCandidate = validateCandidate(root, candidate, { requireClean: true });
  const rows = releaseRecords(bundle);
  assertBundleReview(review, rows, candidate);
  if (policy.schema_version >= 2) assertReviewScope(review, host, surface);
  const result = assertHostReleaseEvidence(rows, { candidate, policy, host, scope, commit: actualCandidate.source_revision.commit, lockedTuples: review.tuples });
  if (surface) assert.ok(rows.every(({record}) => record.environment.host === host && record.environment.surface === surface), 'native_import_scope_mismatch');
  const parent = ownedImportParent(root, candidate.candidate_id);
  let destination = join(parent, host);
  if (policy.schema_version >= 2) {
    if (existsSync(destination)) assert.ok(lstatSync(destination).isDirectory() && !lstatSync(destination).isSymbolicLink(), 'native_import_parent_unsafe');
    else mkdirSync(destination);
    destination = join(destination, surface);
  }
  assert.ok(!existsSync(destination), 'native_import_already_exists');
  const stage = mkdtempSync(join(parent, '.native-stage-'));
  try {
    // Never copy the input directory recursively: only verified referenced files are imported.
    for (const { record, directory } of rows) {
      assert.match(record.id, /^[A-Za-z0-9_.-]{1,128}$/u, 'unsafe_observation_id');
      const folder = join(stage, record.id); mkdirSync(folder);
      writeNew(join(folder, record.environment.surface === 'desktop-code' ? `desktop-${record.scenario}.json` : 'release-records.json'), [record]);
      for (const ref of record.references) {
        const source = containedFile(directory, ref.path), target = join(folder, ref.path);
        assert.ok(!existsSync(target), 'reference_conflicts_with_record');
        mkdirSync(dirname(target), { recursive: true }); copyFileSync(source, target);
      }
    }
    writeNew(join(stage, 'review.json'), review);
    // Recheck bytes immediately before committing the owned import.
    assertHostReleaseEvidence(releaseRecords(stage), { candidate, policy, host, scope, commit: actualCandidate.source_revision.commit, lockedTuples: review.tuples });
    validateCandidate(root, candidate);
    renameSync(stage, destination);
    try { projectNativeRelease(root, rows, candidate); }
    catch (error) { rmSync(destination, { recursive: true, force: true }); throw error; }
  } finally { rmSync(stage, { recursive: true, force: true }); }
  return { ...result, destination, assurance: 'cooperative_evidence_review' };
}
export function importClaudeEvidence(root, args) { return importNativeEvidence(root, { ...args, host: 'claude' }); }

// Per-host instructions for the mandatory schema-3 CLI matrix; the executor keeps credentials and the computer.
function cliHandoff(candidate, host) {
  const claude = host === 'claude';
  return [`# ${claude ? 'Claude Code CLI on Windows' : 'Codex CLI on macOS'}: release qualification`, '',
    `Candidate: ${candidate.candidate_id}`, `Version: ${candidate.version}`, `Clean source commit: ${candidate.source_revision.commit}`, '',
    `Mandatory cases on ${claude ? 'native Windows' : 'macOS'}: ${CLI_CASES.join(', ')}. Each case installs, discovers, invokes and removes AGDF in an isolated scope.`, '',
    '1. Use a clean checkout of that commit with complete history and lockfile dependencies. Run npm run build:prepare, then npm --prefix packages/mcp-server ci --ignore-scripts. Recompute and validate the candidate content before execution.',
    claude ? '2. Start every command from a terminal outside the Claude Desktop app package, for example one opened through explorer.exe. Keep the existing Claude authentication on this computer.'
      : '2. Use the legitimately authenticated Codex CLI on this Mac. When the client ships inside the ChatGPT app, set CODEX_BIN to that executable for preflight and every case.',
    `3. Freeze the actual tuple: node scripts/native-probes/release-evidence.mjs preflight --candidate candidate.json --host ${host} --surface cli --model MODEL --output tuple.json, where MODEL is the model actually available.`,
    `4. For each case run npm run native:${host}-e2e -- --candidate candidate.json --tuple tuple.json --model MODEL --scenario CASE. The harness refuses a changed tuple; never edit a completed record.`,
    '5. Return only the probe-results directories with release-records.json and their referenced captures, plus tuple.json and candidate.json. Credentials, profiles and unrelated transcripts stay on this computer.',
    `6. A reviewer runs review-template, checks the primary captures, marks the review and imports with --host ${host} --surface cli. Missing or failed cases stay open; this handoff grants no gate approval or publication.`, ''].join('\n');
}

export async function runReleaseTool(args, root = process.cwd()) {
  const [command, ...rest] = args;
  const options = {};
  for (let i = 0; i < rest.length; i++) {
    const key = rest[i]; assert.match(key, /^--[a-z-]+$/u, 'release_option_invalid');
    assert.ok(!Object.hasOwn(options, key), 'release_option_duplicate');
    options[key] = key === '--all-hosts' ? true : rest[++i];
    assert.ok(options[key] !== undefined && !String(options[key]).startsWith('--'), 'release_option_value_missing');
  }
  const allowed = { candidate: ['--output'], handoff: ['--candidate', '--output', '--host'], preflight: ['--host','--candidate','--surface','--model','--output','--version','--version-evidence'],
    'desktop-template': ['--candidate','--tuple','--output','--scenario'], 'review-template': ['--candidate','--bundle','--output'], import: ['--candidate','--bundle','--review','--host','--surface'], validate: ['--candidate','--directory','--all-hosts'], 'validate-cli': ['--candidate','--directory'] };
  assert.ok(allowed[command] && Object.keys(options).every(key => allowed[command].includes(key)), 'release_command_invalid');
  const required = key => { assert.ok(options[key], `release_required:${key}`); return options[key]; };
  const policy = releasePolicy(root);
  if (command === 'validate' && options['--all-hosts']) assert.equal(policy.schema_version, 3, 'publication_requires_cli_policy');
  if (command === 'candidate') {
    const candidate = candidateManifest(root); writeNew(resolve(required('--output')), candidate);
    return { candidate_id: candidate.candidate_id, version: candidate.version, source: candidate.source_revision, authorizes: false };
  }
  const candidate = readCandidate(required('--candidate'));
  const host = options['--host'] ?? 'claude';
  assert.ok(['codex','claude'].includes(host), 'release_host_invalid');
  const actual = validateCandidate(root, candidate, { requireClean: command !== 'desktop-template' });
  if (command === 'handoff') {
    const destination = resolve(required('--output'));
    // Each schema-3 executor receives exactly the cases of the host on its own computer.
    if (policy.schema_version === 3) required('--host');
    assert.ok(!existsSync(destination), 'handoff_destination_exists');
    mkdirSync(destination, { recursive: true });
    writeNew(join(destination, 'candidate.json'), candidate);
    writeNew(join(destination, 'required-cases.json'), requiredReleaseCases(policy, policy.schema_version >= 2 ? options['--host'] : 'claude'));
    if (policy.schema_version === 3) {
      writeNew(join(destination, host === 'codex' ? 'MACOS_TEST.md' : 'WINDOWS_TEST.md'), cliHandoff(candidate, host));
      return { result: 'prepared', destination, candidate_id: candidate.candidate_id, qualification: 'pending', authorizes: false };
    }
    writeNew(join(destination, 'WINDOWS_TEST.md'), policy.schema_version === 2 ? `# Desktop release evidence\n\nCandidate: ${candidate.candidate_id}\n\nRecover original session, upgrade and recovery evidence first. Both Codex Desktop and Windows Claude Desktop are required; Codex Desktop OS remains unknown until observed. Do not borrow CLI tuples or relabel old candidates. Capture the actual Desktop app/model/session and loaded identity in a safe host-supported isolated scope. Templates are unverified. Each session needs installation/consent/discovery/dispatch/invalid-input/skill/cleanup primary observations and an app capture. Claude Desktop calls keep the unmodified lines of that Desktop session transcript; a CLI stream cannot replace them.Upgrade/recovery require the actually released 0.14.5 baseline and fresh effective candidate. Return redacted records and hashed contained primary references with a locked tuple/bundle review; credentials stay on the executor. Missing facts remain explicit blockers. No blanket retest, remote control, approval or publication is authorized.\n` : `# Claude Code Windows qualification\n\nCandidate: ${candidate.candidate_id}\nVersion: ${candidate.version}\nClean source commit: ${candidate.source_revision.commit}\n\nUse a clean checkout of that commit with complete history and lockfile dependencies. Run npm run build:prepare, then install the MCP package dependencies. Recompute and validate the candidate content before execution. Keep authentication on this computer. Never change a completed record to fit another version.\n\n1. Capture preflight for cli with the actual available model and for desktop-code with the actual app version plus native version evidence. Freeze each tuple.\n2. Run npm run native:claude-e2e with --candidate, --tuple, --model and each --scenario dispatch, failure_case, skill_continuation, upgrade, recovery.\n3. Use a safely isolated Desktop Code test environment. Create desktop-template records for session, upgrade and recovery. Capture a fresh coding session after each transition, the loaded plugin/runtime diagnostics, actual AGDF access and cleanup; add native JSON/log and image references. Generic Desktop chat and CLI calls are insufficient. Leave unsupported observations unverified.\n4. Return only redacted release-records.json, desktop-session/upgrade/recovery.json and their hashed native references, the frozen tuples and candidate.json. Do not return credentials, whole profiles or unrelated transcripts.\n5. A reviewer must check primary observations and prepare the exact candidate/bundle/tuple review record before import. Missing results remain open; this handoff grants no gate approval or publication.\n`);
    return { result: 'prepared', destination, candidate_id: candidate.candidate_id, qualification: 'pending', authorizes: false };
  }
  if (command === 'preflight') {
    if (host === 'claude') assert.equal(process.platform, 'win32', 'claude_preflight_requires_native_windows');
    const surface = required('--surface'); assert.ok(['cli','desktop-code'].includes(surface));
    if (host === 'codex' && policy.schema_version < 3) assert.equal(surface, 'desktop-code', 'codex_cli_uses_pinned_probe_preflight');
    if (host === 'codex' && surface === 'cli') assert.equal(process.platform, 'darwin', 'codex_cli_preflight_requires_macos');
    let version, desktopEnvironment;
    if (surface === 'cli') {
      // Same executable and version token as the native harness of that host.
      const result = spawnHostSync(host === 'codex' ? process.env.CODEX_BIN || 'codex' : 'claude', ['--version'], { encoding: 'utf8', timeout: 15000 });
      assert.equal(result.status, 0, `${host}_cli_unavailable`);
      const parts = result.stdout.trim().split(/\s+/u); version = host === 'codex' ? parts.at(-1) : parts[0];
    } else {
      version = required('--version');
      const bytes = readFileSync(resolve(required('--version-evidence')));
      assert.ok(bytes.length > 0 && bytes.length <= 1024 * 1024, 'desktop_version_evidence_missing');
      if (policy.schema_version >= 2) {
        desktopEnvironment = JSON.parse(bytes); assertTuple(desktopEnvironment);
        assert.equal(desktopEnvironment.host, host); assert.equal(desktopEnvironment.surface, surface);
        assert.equal(desktopEnvironment.os, process.platform, 'desktop_preflight_os_mismatch');
        assert.equal(desktopEnvironment.version, version, 'desktop_version_capture_mismatch');
        assert.equal(desktopEnvironment.model, required('--model'), 'desktop_model_capture_mismatch');
      }
    }
    // A helper process's Node/architecture is not proof of the Desktop runtime tuple.
    const environment = desktopEnvironment ?? { host, surface, os: process.platform, arch: process.arch, version, node: process.version, model: required('--model') };
    assertTuple(environment);
    const tuple = { schema_version: 1, candidate_id: candidate.candidate_id, environment, tuple_digest: jsonDigest(environment),
      ...(surface === 'desktop-code' ? { version_evidence_digest: sha(readFileSync(resolve(options['--version-evidence']))) } : {}) };
    writeNew(resolve(required('--output')), tuple); return tuple;
  }
  if (command === 'desktop-template') {
    const tuple = JSON.parse(readFileSync(resolve(required('--tuple')), 'utf8'));
    assert.equal(tuple.candidate_id, candidate.candidate_id); assertTuple(tuple.environment);
    assert.equal(tuple.environment.surface, 'desktop-code');
    const scenario = options['--scenario'] ?? 'session'; assert.ok(['session','upgrade','recovery'].includes(scenario));
    const record = { schema_version: policy.schema_version >= 2 ? 3 : 2, ...(policy.schema_version >= 2 ? { kind: 'qualified_desktop' } : {}), id: `${tuple.environment.host}-desktop-${scenario}`, recorded_at: new Date().toISOString(), environment: tuple.environment,
      tuple_digest: tuple.tuple_digest, candidate_id: candidate.candidate_id, policy_digest: candidate.policy_digest, source: actual.source_revision,
      scenario, result: 'unverified', assurance: 'operator_observed', session_id: '', loaded_identity: null,
      ...(['upgrade','recovery'].includes(scenario) ? { transition: { baseline: { version: '0.14.5', integrity: null, source_digest: null },
        preserved_foreign_state: false, permission_preserved: false, ...(scenario === 'recovery' ? { repair: null } : {}) } } : {}),
      observations: { coding_surface: false, fresh_session: false, candidate_loaded: false, agdf_access: false, cleanup: false }, references: [] };
    writeNew(resolve(required('--output')), record); return { result: 'unverified', authorizes: false };
  }
  if (command === 'import') return importNativeEvidence(root, { candidate, host, surface: options['--surface'], bundle: resolve(required('--bundle')), review: JSON.parse(readFileSync(resolve(required('--review')), 'utf8')) });
  if (command === 'review-template') {
    const rows = releaseRecords(resolve(required('--bundle')));
    const tuples = [...new Map(rows.map(({ record }) => [record.tuple_digest, record.environment])).values()];
    const review = { schema_version: 1, reviewed: false, reviewer: '', candidate_id: candidate.candidate_id, bundle_digest: bundleDigest(rows), tuples };
    writeNew(resolve(required('--output')), review);
    return { result: 'review_required', observations: rows.length, authorizes: false };
  }
  const directory = resolve(required('--directory'));
  const commit = actual.source_revision.commit;
  if (process.env.GITHUB_SHA) assert.equal(process.env.GITHUB_SHA, commit, 'release_checkout_sha_mismatch');
  if (command === 'validate-cli') return { ...assertHostReleaseEvidence(releaseRecords(directory), { candidate, policy, host: 'codex', scope: 'optional-cli', commit }), scope: 'optional_cli_diagnostic', qualification: 'unqualified' };
  if (policy.schema_version >= 2) {
    const scopedBundle = target => {
      const review = JSON.parse(readFileSync(containedFile(directory, `${target.host}/${target.surface}/review.json`), 'utf8'));
      const scoped = releaseRecords(join(directory, target.host, target.surface));
      assertBundleReview(review, scoped, candidate);
      assertReviewScope(review, target.host, target.surface);
      assert.ok(scoped.every(({record}) => record.environment.host === target.host && record.environment.surface === target.surface), 'native_bundle_scope_mismatch');
      return { rows: scoped, tuples: review.tuples };
    };
    // Publication always evaluates every required target, including the default command route.
    const rows = []; const lockedTuples = [];
    for (const target of policy.required_targets) {
      const scoped = scopedBundle(target); rows.push(...scoped.rows); lockedTuples.push(...scoped.tuples);
    }
    const result = assertHostReleaseEvidence(rows, { candidate, policy, commit, lockedTuples });
    if (policy.schema_version === 2) return result;
    // Reported Desktop surfaces never gate publication; a supplied set must still be complete and strictly valid.
    const optionalDesktop = [];
    for (const target of policy.reported_desktop) {
      if (!existsSync(join(directory, target.host, target.surface))) continue;
      const scoped = scopedBundle(target);
      assertHostReleaseEvidence(scoped.rows, { candidate, policy, host: target.host, scope: 'optional-desktop', commit, lockedTuples: scoped.tuples });
      optionalDesktop.push(target.host);
    }
    return { ...result, optional_desktop: optionalDesktop };
  }
  const codex = releaseRecords(directory);
  const imported = join(root, 'evals/host-compatibility/native', candidate.candidate_id, 'claude');
  let review, claude = [];
  if (options['--all-hosts']) {
    const reviewPath = containedFile(root, `evals/host-compatibility/native/${candidate.candidate_id}/claude/review.json`);
    review = JSON.parse(readFileSync(reviewPath, 'utf8'));
    claude = releaseRecords(imported);
    assertBundleReview(review, claude, candidate);
  }
  const rows = options['--all-hosts'] ? [...codex, ...claude] : codex;
  return assertHostReleaseEvidence(rows, { candidate, policy, host: options['--all-hosts'] ? undefined : 'codex', commit, lockedTuples: review?.tuples });
}
