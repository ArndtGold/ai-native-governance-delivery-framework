import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, lstatSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { spawnHostSync } from '../../../packages/cli/lib/host-command.js';
import { digestNormalizedPluginSource } from '../../../packages/core/lib/runtime/plugin-provenance.js';

// Only the released package is a baseline. Never use the same-version development checkout.
export async function releasedBaseline(destination, { fetchImpl = fetch } = {}) {
  assert.ok(!existsSync(destination), 'baseline_destination_exists');
  const meta = await fetchImpl('https://registry.npmjs.org/create-agdf/0.14.5');
  assert.ok(meta.ok, 'released_baseline_unavailable');
  const pkg = await meta.json();
  assert.equal(pkg.name, 'create-agdf'); assert.equal(pkg.version, '0.14.5');
  assert.match(pkg.dist?.tarball ?? '', /^https:\/\/registry\.npmjs\.org\/create-agdf\/-\//u);
  assert.match(pkg.dist?.integrity ?? '', /^sha512-[A-Za-z0-9+/=]+$/u);
  const response = await fetchImpl(pkg.dist.tarball);
  assert.ok(response.ok, 'baseline_download_failed');
  const archive = Buffer.from(await response.arrayBuffer());
  assert.ok(archive.length <= 32 * 1024 * 1024, 'baseline_archive_too_large');
  assert.equal(`sha512-${createHash('sha512').update(archive).digest('base64')}`, pkg.dist.integrity, 'baseline_integrity_mismatch');
  extractBaseline(archive, destination);
  const manifest = JSON.parse(readFileSync(join(destination, 'package/package.json'), 'utf8'));
  assert.equal(manifest.name, 'create-agdf'); assert.equal(manifest.version, '0.14.5');
  return { version: '0.14.5', integrity: pkg.dist.integrity, cli: join(destination, 'package/bin/create-agdf.js') };
}
export function extractBaseline(archive, destination) {
  const tar = gunzipSync(archive, { maxOutputLength: 128 * 1024 * 1024 });
  const entries = [];
  for (let at = 0; at + 512 <= tar.length;) {
    const header = tar.subarray(at, at + 512);
    if (header.every(byte => byte === 0)) break;
    const text = (start, length) => header.subarray(start, start + length).toString('utf8').split('\0')[0];
    const stored = parseInt(text(148, 8).trim(), 8);
    const checksum = header.reduce((sum, byte, i) => sum + (i >= 148 && i < 156 ? 32 : byte), 0);
    assert.equal(stored, checksum, 'baseline_tar_checksum');
    const prefix = text(345, 155), name = `${prefix ? `${prefix}/` : ''}${text(0, 100)}`.replace(/\/$/u, '');
    assert.ok((name === 'package' || name.startsWith('package/')) && !name.includes('\\') && name.split('/').every(p => p && p !== '.' && p !== '..'), 'unsafe_baseline_path');
    const type = text(156, 1), sizeText = text(124, 12).trim();
    assert.ok(['', '0', '5'].includes(type) && /^[0-7]+$/u.test(sizeText), 'unsupported_baseline_entry');
    assert.ok(name !== 'package' || type === '5', 'baseline_root_not_directory');
    const size = parseInt(sizeText, 8);
    assert.ok(size <= 16 * 1024 * 1024 && at + 512 + size <= tar.length && entries.length < 20000, 'baseline_tar_bounds');
    assert.ok(!entries.some(entry => entry.name === name), 'duplicate_baseline_entry');
    entries.push({ name, type, content: tar.subarray(at + 512, at + 512 + size) });
    at += 512 + Math.ceil(size / 512) * 512;
  }
  assert.ok(entries.length, 'baseline_empty');
  assert.ok(!existsSync(destination), 'baseline_destination_exists');
  // Validate the complete archive before creating any files; no link/special entry is accepted.
  for (const entry of entries) {
    const path = join(destination, entry.name);
    if (entry.type === '5') mkdirSync(path, { recursive: true });
    else { mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, entry.content, { flag: 'wx', mode: 0o600 }); }
  }
}
export function installedIdentity(root, version) {
  const marker = JSON.parse(readFileSync(join(root, '.agdf-installation.json'), 'utf8'));
  assert.equal(marker.canonical_version, version, 'installed_version_mismatch');
  assert.equal(marker.owner, 'create-agdf', 'installation_owner_unknown');
  assert.equal(digestNormalizedPluginSource(root, version), marker.source_digest, 'installed_source_mismatch');
  const manifest = JSON.parse(readFileSync(join(root, 'runtime/runtime-manifest.json'), 'utf8'));
  assert.equal(manifest.digest, marker.runtime_digest, 'installed_runtime_mismatch');
  return { version, source_digest: marker.source_digest, runtime_digest: marker.runtime_digest };
}
export function installationRoots(home) {
  const found = [];
  function visit(path, depth = 0) {
    if (!existsSync(path) || depth > 8) return;
    for (const name of readdirSync(path)) {
      const target = join(path, name), stat = lstatSync(target);
      if (stat.isSymbolicLink()) continue;
      if (name === '.agdf-installation.json') found.push(path);
      else if (stat.isDirectory() && !['node_modules', 'runtime', 'data'].includes(name)) visit(target, depth + 1);
    }
  }
  visit(home); return found;
}
export function rootForVersion(home, version) {
  const roots = installationRoots(home).filter(root => JSON.parse(readFileSync(join(root, '.agdf-installation.json'), 'utf8')).canonical_version === version);
  assert.ok(roots.length, 'installed_identity_missing');
  return roots.find(root => !root.replaceAll('\\', '/').includes('/cache/')) ?? roots[0];
}
export function installBaseline(cli, host, env, { cwd } = {}) {
  const result = spawnHostSync(process.execPath, [cli, host, '--json'], { env, ...(cwd ? { cwd } : {}), encoding: 'utf8', timeout: 180000, maxBuffer: 16 * 1024 * 1024 });
  let report; try { report = JSON.parse(result.stdout); } catch {}
  assert.ok(result.status === 0 && ['success', 'healthy'].includes(report?.result), 'baseline_install_failed');
  return report;
}
// Corrupt only an owned manifest after verifying its complete provenance. The production
// installer must either repair the known owned state or fail; unknown ownership is never rewritten.
export function makeOwnedStale(root, version) {
  const identity = installedIdentity(root, version);
  const marker = JSON.parse(readFileSync(join(root, '.agdf-installation.json'), 'utf8'));
  assert.equal(marker.owner, 'create-agdf', 'installation_owner_unknown');
  const path = join(root, 'runtime/runtime-manifest.json');
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  writeFileSync(path, `${JSON.stringify({ ...manifest, digest: '0'.repeat(64) }, null, 2)}\n`);
  return identity;
}
