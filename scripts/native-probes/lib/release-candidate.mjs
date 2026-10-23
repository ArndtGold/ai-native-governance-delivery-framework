import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { isUtf8 } from 'node:buffer';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { canonical } from '../../host-compatibility/contract.mjs';
import { releasePolicy } from './release-policy.mjs';
import { digestNormalizedPluginSource, digestPluginMcpDispatcherSource } from '../../../packages/core/lib/runtime/plugin-provenance.js';

export const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export const jsonDigest = value => sha(canonical(value));
export const normalizedBytes = bytes => bytes.includes(0) || !isUtf8(bytes) ? bytes : Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'));
export const SOURCE_ROOTS = Object.freeze(['plugins/agdf', 'packages/core', 'packages/cli', 'packages/mcp-server', 'packages/control-ui', 'scripts', 'evals', '.github/workflows']);
export const SOURCE_FILES = Object.freeze(['package.json', 'package-lock.json', '.gitattributes', '.gitignore']);
export const PAYLOAD_ROOTS = Object.freeze(['packages/cli/generated/plugins/agdf', 'packages/cli/generated/plugins/copilot/agdf', 'dist/npm/create-agdf', 'dist/npm/agdf-mcp-server', 'dist/npm/agdf']);
const OUTPUT_PARTS = new Set(['node_modules', 'generated', 'dist', 'dist-mcp', 'coverage', 'test-results', 'playwright-report', '.vite', '.git']);
const evidenceOutput = path => path === 'plugins/agdf/runtime' || path === 'packages/cli/runtime' || path.startsWith('evals/host-compatibility/observations/') || path.startsWith('evals/host-compatibility/native/')
  || path.startsWith('scripts/native-probes/evidence/') || path.endsWith('.tsbuildinfo');

export function containedOutput(root, path) {
  assert.equal(typeof path, 'string');
  assert.ok(path && !isAbsolute(path) && !path.includes('\\') && !path.includes('\0') && !/^[A-Za-z]:/u.test(path), 'unsafe_evidence_path');
  assert.ok(path.split('/').every(p => p && p !== '.' && p !== '..'), 'unsafe_evidence_path');
  let cursor = realpathSync(root);
  for (const part of path.split('/')) {
    cursor = join(cursor, part);
    if (existsSync(cursor)) assert.ok(!lstatSync(cursor).isSymbolicLink(), 'symlink_forbidden');
  }
  return cursor;
}
export function containedFile(root, path, { limit = 16 * 1024 * 1024 } = {}) {
  const cursor = containedOutput(root, path);
  const stat = lstatSync(cursor);
  assert.ok(stat.isFile() && stat.size <= limit, 'evidence_file_invalid');
  return cursor;
}
function inventory(root, base, { source = false } = {}) {
  const rows = [];
  function visit(path) {
    const absolute = join(root, path);
    const stat = lstatSync(absolute);
    assert.ok(!stat.isSymbolicLink(), `candidate_symlink:${path}`);
    if (stat.isDirectory()) {
      for (const name of readdirSync(absolute).sort()) {
        const next = `${path}/${name}`;
        if (source && (OUTPUT_PARTS.has(name) || evidenceOutput(next))) continue;
        visit(next);
      }
    } else {
      assert.ok(stat.isFile(), `candidate_file_invalid:${path}`);
      let bytes = normalizedBytes(readFileSync(absolute));
      if (source && path === 'evals/host-compatibility/manifest.json') {
        const { native_sources, native_targets, public_evidence, reported_sources, ...inputs } = JSON.parse(bytes);
        bytes = Buffer.from(canonical(inputs));
      }
      rows.push({ path, executable: Boolean(stat.mode & 0o111), bytes: bytes.length, digest: sha(bytes) });
    }
  }
  visit(base);
  // Git text files carry different executable bits on Windows. Release inputs bind bytes/paths;
  // archive integrity checks separately verify executable package entrypoints.
  return rows.map(({ executable, ...row }) => row);
}
export function sourceIdentity(root) {
  const source = SOURCE_ROOTS.flatMap(path => inventory(root, path, { source: true }));
  for (const path of SOURCE_FILES) {
    const bytes = normalizedBytes(readFileSync(containedFile(root, path)));
    source.push({ path, bytes: bytes.length, digest: sha(bytes) });
  }
  return source.sort((a, b) => a.path.localeCompare(b.path, 'en'));
}
export function gitIdentity(root) {
  const git = args => execFileSync('git', ['-c', 'core.fsmonitor=false', ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  return { commit: git(['rev-parse', 'HEAD']), dirty: Boolean(git(['status', '--porcelain'])) };
}
export function candidateManifest(root) {
  root = realpathSync(root);
  const policy = releasePolicy(root);
  const source = sourceIdentity(root);
  const payloads = Object.fromEntries(PAYLOAD_ROOTS.map(path => {
    assert.ok(existsSync(join(root, path)), `candidate_payload_missing:${path}`);
    return [path, inventory(root, path)];
  }));
  const pluginRoot = join(root, PAYLOAD_ROOTS[0]);
  // Native calls run the MCP generation's projection of this dispatcher and report its digest,
  // not the plugin runtime manifest digest.
  const identities = { agdf: { version: policy.version, source_digest: digestNormalizedPluginSource(pluginRoot, policy.version),
    runtime_digest: JSON.parse(readFileSync(join(pluginRoot, 'runtime/runtime-manifest.json'), 'utf8')).digest },
    mcp_dispatcher: { digest: digestPluginMcpDispatcherSource(join(pluginRoot, 'runtime/create-agdf'), policy.version) } };
  const identity = { schema_version: 1, version: policy.version, policy_digest: jsonDigest(policy), source, payloads, identities };
  return { ...identity, candidate_id: jsonDigest(identity), source_revision: gitIdentity(root) };
}
export function validateCandidate(root, expected, { requireClean = false } = {}) {
  const actual = candidateManifest(root);
  assert.equal(expected.schema_version, 1, 'candidate_schema');
  assert.equal(expected.candidate_id, actual.candidate_id, 'candidate_content_mismatch');
  const { candidate_id, source_revision, ...identity } = expected;
  assert.equal(jsonDigest(identity), candidate_id, 'candidate_manifest_modified');
  assert.match(source_revision?.commit ?? '', /^[a-f0-9]{40}$/u, 'candidate_commit_missing');
  if (requireClean) {
    assert.equal(actual.source_revision.dirty, false, 'candidate_source_dirty');
    assert.equal(source_revision.dirty, false, 'candidate_origin_dirty');
  }
  return actual;
}
export function readCandidate(path) { return JSON.parse(readFileSync(resolve(path), 'utf8')); }
const MANIFEST = 'evals/host-compatibility/manifest.json';
const manifestInputs = text => { const { native_sources, native_targets, public_evidence, reported_sources, ...inputs } = JSON.parse(text); return canonical(inputs); };
// Mirrors inventory(): whether a repository path belongs to the candidate source identity.
export function isCandidateSource(path) {
  if (SOURCE_FILES.includes(path)) return true;
  const base = SOURCE_ROOTS.find(root => path.startsWith(`${root}/`));
  if (!base) return false;
  let next = base;
  for (const name of path.slice(base.length + 1).split('/')) {
    next = `${next}/${name}`;
    if (OUTPUT_PARTS.has(name) || evidenceOutput(next)) return false;
  }
  return true;
}
// Proves an earlier commit carried the candidate source of `head` without trusting the candidate file's
// commit field: it must be an ancestor whose later changes touch only evidence outputs.
export function assertEvidenceOnlyDescendant(root, ancestor, head) {
  assert.match(ancestor ?? '', /^[a-f0-9]{40}$/u, 'candidate_ancestor_invalid');
  assert.match(head ?? '', /^[a-f0-9]{40}$/u, 'candidate_ancestor_invalid');
  if (ancestor === head) return;
  const git = args => spawnSync('git', ['-c', 'core.fsmonitor=false', ...args], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  assert.equal(git(['merge-base', '--is-ancestor', ancestor, head]).status, 0, 'candidate_ancestor_not_in_history');
  const diff = git(['diff', '--no-renames', '--name-only', '-z', ancestor, head]);
  assert.equal(diff.status, 0, 'candidate_ancestor_diff_failed');
  for (const path of diff.stdout.split('\0').filter(Boolean)) {
    if (path === MANIFEST) {
      const show = commit => git(['show', `${commit}:${MANIFEST}`]);
      const [before, after] = [show(ancestor), show(head)];
      assert.ok(before.status === 0 && after.status === 0 && manifestInputs(before.stdout) === manifestInputs(after.stdout), `candidate_ancestor_source_changed:${path}`);
      continue;
    }
    assert.ok(!isCandidateSource(path), `candidate_ancestor_source_changed:${path}`);
  }
}
