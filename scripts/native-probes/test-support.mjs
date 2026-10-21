import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { SOURCE_ROOTS, SOURCE_FILES, PAYLOAD_ROOTS, candidateManifest } from './lib/release-candidate.mjs';
import { MCP_DISPATCHER_RUNTIME_ENTRIES } from '../../packages/core/lib/runtime/plugin-provenance.js';

export function candidateFixture() {
  const root = mkdtempSync(join(tmpdir(), 'agdf-release-'));
  const put = (path, content) => { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), content); };
  for (const path of [...SOURCE_ROOTS, ...PAYLOAD_ROOTS]) put(`${path}/input.txt`, 'fixture\n');
  for (const path of SOURCE_FILES) put(path, path.endsWith('.json') ? '{}' : 'fixture\n');
  put('.gitattributes', readFileSync(new URL('../../.gitattributes', import.meta.url)));
  put('.gitignore', 'dist/\npackages/cli/generated/\n.release-candidate.json\nprobe-results/\n');
  const definition = JSON.parse(readFileSync(new URL('../../plugins/agdf/meta/agdf-plugin.definition.json', import.meta.url), 'utf8'));
  put('plugins/agdf/meta/agdf-plugin.definition.json', JSON.stringify(definition));
  put('evals/host-compatibility/manifest.json', JSON.stringify({ schema_version: 1, native_sources: [], native_targets: [], public_evidence: [], inputs: ['fixture'] }));
  put('packages/cli/generated/plugins/agdf/runtime/runtime-manifest.json', JSON.stringify({ digest: 'b'.repeat(64) }));
  // The candidate binds the MCP dispatcher projection; directory entries get one fixture file.
  for (const entry of MCP_DISPATCHER_RUNTIME_ENTRIES) put(`packages/cli/generated/plugins/agdf/runtime/create-agdf/${entry}${/\.js(?:on)?$/u.test(entry) ? '' : '/fixture.txt'}`, 'fixture\n');
  const git = (...args) => execFileSync('git', ['-c','user.name=Fixture','-c','user.email=fixture@example.invalid',...args], { cwd: root, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
  git('init', '-q'); git('add', '.'); git('commit', '-qm', 'fixture');
  return { root, put, git, candidate: candidateManifest(root) };
}
