import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { publishedMcpLock, installPublishedMcp } from './install-published-mcp.mjs';
import { registryPackage, publishMissing, samePayload, RELEASE_SOURCE } from './resume-0200.mjs';

const metadata = { name: 'create-agdf', version: '0.20.0', gitHead: RELEASE_SOURCE,
  dist: { tarball: 'https://registry.npmjs.org/create-agdf/-/create-agdf-0.20.0.tgz', integrity: 'sha512-Ynl0ZXM=' } };
const lock = JSON.parse(readFileSync(new URL('../../packages/mcp-server/package-lock.json', import.meta.url)));

test('published preparation substitutes only create-agdf and preserves the exact reviewed SDK closure', () => {
  const before = structuredClone(lock), result = publishedMcpLock(lock, metadata, '0.20.0');
  assert.deepEqual(lock, before);
  assert.equal(result.packages['node_modules/create-agdf'].resolved, metadata.dist.tarball);
  assert.equal(result.packages['node_modules/create-agdf'].integrity, metadata.dist.integrity);
  delete before.packages['node_modules/create-agdf'];
  delete result.packages['node_modules/create-agdf'];
  assert.deepEqual(result, before);
  for (const invalid of [{ ...metadata, version: '0.14.5' }, { ...metadata, name: 'foreign' },
    { ...metadata, dependencies: { foreign: '1' } }, { ...metadata, dist: { ...metadata.dist, tarball: 'https://foreign.invalid/a.tgz' } }]) {
    assert.throws(() => publishedMcpLock(lock, invalid, '0.20.0'), /INVALID/);
  }
});

test('a failed locked install restores the original checkout lock byte-for-byte', () => {
  const root = mkdtempSync(join(tmpdir(), 'agdf-published-deps-'));
  const path = join(root, 'packages/mcp-server');
  mkdirSync(path, { recursive: true });
  const original = JSON.stringify(lock, null, 4) + '\n';
  writeFileSync(join(path, 'package-lock.json'), original);
  writeFileSync(join(path, 'package.json'), JSON.stringify({ dependencies: { 'create-agdf': '0.20.0' } }));
  try {
    assert.throws(() => installPublishedMcp({ repository: root, execute: (_file, args) => {
      if (args.includes('view')) return JSON.stringify([metadata]);
      assert.deepEqual(args.slice(-4), ['ci', '--ignore-scripts', '--no-audit', '--no-fund']);
      const temporary = JSON.parse(readFileSync(join(path, 'package-lock.json'), 'utf8'));
      assert.equal(temporary.packages['node_modules/zod'].version, lock.packages['node_modules/zod'].version);
      throw Error('intentional install failure');
    } }), /intentional install failure/);
    assert.equal(readFileSync(join(path, 'package-lock.json'), 'utf8'), original);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('recovery distinguishes absent versions from unknown responses and rejects foreign published sources', async () => {
  const response = (status, value) => async () => ({ status, ok: status === 200, json: async () => value });
  assert.equal(await registryPackage('create-agdf', { fetchMetadata: response(404) }), null);
  for (const status of [401, 403, 429, 500]) await assert.rejects(registryPackage('create-agdf', { fetchMetadata: response(status) }), /UNKNOWN/);
  assert.deepEqual(await registryPackage('create-agdf', { fetchMetadata: response(200, metadata) }), metadata);
  await assert.rejects(registryPackage('create-agdf', { fetchMetadata: response(200, { ...metadata, gitHead: 'foreign' }) }), /MISMATCH/);
  await assert.rejects(registryPackage('@agdf/cli', { selector: 'latest', fetchMetadata: response(404) }), /UNKNOWN/);
  assert.equal(await registryPackage('@agdf/cli', { selector: 'latest', fetchMetadata: response(200, { name: '@agdf/cli', version: '0.14.5' }) }), null);
});

test('recovery never uploads an existing version and fails closed for a byte mismatch', async () => {
  let uploads = 0;
  const options = { inspect: async () => metadata, integrity: metadata.dist.integrity, publish: async () => uploads++ };
  await publishMissing('@agdf/mcp-server', options);
  assert.equal(uploads, 0);
  await assert.rejects(publishMissing('@agdf/mcp-server', { ...options, integrity: 'sha512-foreign' }), /MISMATCH/);
  await assert.rejects(publishMissing('create-agdf', options), /NOT_ALLOWED/);
  await publishMissing('@agdf/cli', { ...options, inspect: async () => null });
  assert.equal(uploads, 1);
});

test('archive comparison accepts recompression only, while verifying registry integrity and every tar byte', async () => {
  const tar = Buffer.from('fixture archive bytes including file metadata');
  const compressed = gzipSync(tar, { level: 1 });
  const integrity = 'sha512-' + createHash('sha512').update(compressed).digest('base64');
  const digest = createHash('sha256').update(tar).digest('hex');
  const record = { ...metadata, dist: { ...metadata.dist, integrity } };
  const fetchArchive = async () => ({ ok: true, arrayBuffer: async () => compressed });
  assert.equal(await samePayload(record, { integrity: 'different gzip encoding', tarDigest: digest }, fetchArchive), true);
  assert.equal(await samePayload(record, { integrity: 'different gzip encoding', tarDigest: 'different tar bytes' }, fetchArchive), false);
  await assert.rejects(samePayload(metadata, { integrity: 'different encoding', tarDigest: digest }, fetchArchive), /INTEGRITY_INVALID/);
});

test('recovery workflow preserves all verification, source binding, provenance and bootstrap dependencies', () => {
  const workflow = parse(readFileSync(new URL('../../.github/workflows/resume-agdf-0.20.0.yml', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(workflow.on), ['workflow_dispatch'], 'completed publication recovery is now manual-only');
  assert.equal(workflow.jobs.verify.strategy['fail-fast'], false);
  assert.equal(workflow.jobs['publish-mcp'].needs, 'verify');
  assert.equal(workflow.jobs['publish-wrapper'].needs, 'publish-mcp');
  assert.equal(workflow.jobs.bootstrap.needs, 'publish-wrapper');
  for (const job of Object.values(workflow.jobs)) {
    assert.ok(job['timeout-minutes'] <= 10);
    assert.ok(!job['continue-on-error']);
    for (const step of job.steps) {
      if (step.uses) assert.match(step.uses, /^actions\/[\w-]+@[a-f0-9]{40}$/);
      if (step.with?.path === 'source') assert.equal(step.with.ref, 'agdf-v0.20.0');
      if (step.uses?.startsWith('actions/checkout')) assert.equal(step.with['persist-credentials'], false);
    }
  }
  const mcp = workflow.jobs['publish-mcp'];
  const ci = mcp.steps.findIndex(s => s.name === 'Require green CI for the repair commit');
  assert.ok(ci >= 0 && ci < mcp.steps.findIndex(s => /Publish only/.test(s.name ?? '')));
  const prepare = mcp.steps.findIndex(s => /npm run build/.test(s.run ?? ''));
  const dependencies = mcp.steps.findIndex(s => s.run === 'node ../tooling/scripts/release/install-published-mcp.mjs');
  const smoke = mcp.steps.findIndex(s => s.run === 'npm --prefix packages/mcp-server run test:package');
  assert.ok(prepare >= 0 && prepare < dependencies && dependencies < smoke,
    'packed stdio smoke requires locked MCP client and SDK dependencies after assembly');
  for (const id of ['publish-mcp', 'publish-wrapper']) assert.equal(workflow.jobs[id].permissions['id-token'], 'write');
  assert.equal(workflow.jobs.bootstrap.permissions?.['id-token'], undefined);
  assert.ok(workflow.jobs.bootstrap.steps.some(s => /release-bootstrap-smoke-test/.test(s.run ?? '')));
});

test('published-release verification reuses exact completed source checks and has no upload permission or command', () => {
  const text = readFileSync(new URL('../../.github/workflows/verify-published-agdf-0.20.0.yml', import.meta.url), 'utf8');
  const workflow = parse(text);
  assert.deepEqual(workflow.permissions, { contents: 'read', actions: 'read' });
  assert.doesNotMatch(text, /NPM_TOKEN|npm publish|id-token: write|continue-on-error/);
  assert.match(text, /f5a263e510caa1ee03ae8724042b14fa3ef5140d/);
  assert.match(text, /40113774802/);
  assert.match(text, /40113774739/);
  const steps = workflow.jobs.verify.steps;
  assert.ok(steps.findIndex(s => s.name?.includes('completed source CI')) < steps.findIndex(s => s.run?.includes('resume-0200.mjs complete')));
  assert.ok(steps.some(s => s.with?.ref === 'agdf-v0.20.0'));
  assert.equal(workflow.jobs.verify['timeout-minutes'], 10);
  for (const step of steps) if (step.uses) assert.match(step.uses, /^actions\/[\w-]+@[a-f0-9]{40}$/);
});
