import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { npmInvocation } from '../../packages/cli/lib/npm-invocation.js';

// This recovery completes the two missing packages from the already published
// candidate. It never moves its tag or rebuilds from the repair commit.
export const RELEASE_SOURCE = '21149673016c731fcf678c748f54ddbd8ffd9149';
export const RELEASE_TAG = 'agdf-v0.20.0';
export const RELEASE_VERSION = '0.20.0';
const directories = {
  'create-agdf': 'create-agdf',
  '@agdf/mcp-server': 'agdf-mcp-server',
  '@agdf/cli': 'agdf',
};

export function assertReleaseSource(repository) {
  const git = args => execFileSync('git', args, { cwd: repository, encoding: 'utf8' }).trim();
  if (git(['rev-parse', 'HEAD']) !== RELEASE_SOURCE
      || git(['rev-parse', `${RELEASE_TAG}^{commit}`]) !== RELEASE_SOURCE
      || git(['status', '--porcelain', '--untracked-files=no'])) throw Error('AGDF_RELEASE_SOURCE_MISMATCH');
}

export async function registryPackage(name, { fetchMetadata = fetch, selector = RELEASE_VERSION } = {}) {
  const response = await fetchMetadata(`https://registry.npmjs.org/${encodeURIComponent(name)}/${selector}`,
    { signal: AbortSignal.timeout(20000) });
  if (response.status === 404 && selector === RELEASE_VERSION) return null;
  if (!response.ok) throw Error(`AGDF_RELEASE_REGISTRY_UNKNOWN: ${name} HTTP ${response.status}`);
  const metadata = await response.json();
  if (selector === 'latest' && metadata.name === name && metadata.version !== RELEASE_VERSION) return null;
  if (metadata.name !== name || metadata.version !== RELEASE_VERSION || metadata.gitHead !== RELEASE_SOURCE
      || !/^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(metadata.dist?.integrity ?? '')) {
    throw Error(`AGDF_RELEASE_REGISTRY_MISMATCH: ${name}`);
  }
  return metadata;
}

function npm(args, cwd, stdio = 'pipe') {
  const invocation = npmInvocation(args);
  return execFileSync(invocation.executable, invocation.args, { cwd, stdio, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
}

const sha512 = bytes => `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
const tarDigest = bytes => createHash('sha256').update(gunzipSync(bytes, { maxOutputLength: 64 * 1024 * 1024 })).digest('hex');

// gzip encoding can differ across Node/zlib versions. Verify npm's compressed
// integrity, then compare every uncompressed tar byte (including paths/modes).
export async function samePayload(metadata, payload, fetchArchive = fetch) {
  if (metadata.dist.integrity === payload.integrity) return true;
  const url = new URL(metadata.dist.tarball);
  if (url.protocol !== 'https:' || url.hostname !== 'registry.npmjs.org') throw Error('AGDF_RELEASE_ARCHIVE_INVALID');
  const response = await fetchArchive(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw Error('AGDF_RELEASE_ARCHIVE_UNAVAILABLE');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 16 * 1024 * 1024 || sha512(bytes) !== metadata.dist.integrity) throw Error('AGDF_RELEASE_ARCHIVE_INTEGRITY_INVALID');
  return tarDigest(bytes) === payload.tarDigest;
}

function packedPayload(repository, name) {
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-release-pack-'));
  try {
    const cwd = join(repository, 'dist/npm', directories[name]);
    const manifest = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
    if (manifest.name !== name || manifest.version !== RELEASE_VERSION) throw Error('AGDF_RELEASE_PAYLOAD_MISMATCH');
    const reply = JSON.parse(npm(['pack', '--json', '--ignore-scripts', '--pack-destination', temporary], cwd));
    const packed = Array.isArray(reply) && reply.length === 1 ? reply[0] : reply[name] ?? reply;
    if (packed.name !== name || packed.version !== RELEASE_VERSION
        || typeof packed.filename !== 'string' || /[\\/]/u.test(packed.filename)) throw Error('AGDF_RELEASE_PAYLOAD_MISMATCH');
    const bytes = readFileSync(join(temporary, packed.filename));
    const integrity = sha512(bytes);
    if (packed.integrity !== integrity) throw Error('AGDF_RELEASE_PAYLOAD_MISMATCH');
    return { integrity, tarDigest: tarDigest(bytes) };
  } finally { rmSync(temporary, { recursive: true, force: true }); }
}

export async function publishMissing(name, { inspect = registryPackage, integrity,
  matches = async current => current.dist.integrity === integrity, publish } = {}) {
  if (!['@agdf/mcp-server', '@agdf/cli'].includes(name)) throw Error('AGDF_RELEASE_PACKAGE_NOT_ALLOWED');
  const current = await inspect(name);
  if (current) {
    if (!await matches(current)) throw Error(`AGDF_RELEASE_PAYLOAD_MISMATCH: ${name}`);
    console.log(`${name}@${RELEASE_VERSION} already published with identical bytes; no upload.`);
    return;
  }
  await publish();
}

async function waitForPackage(name, payload, selector = RELEASE_VERSION) {
  for (let attempt = 1; attempt <= 20; attempt++) {
    const current = await registryPackage(name, { selector });
    if (current) {
      if (!await samePayload(current, payload)) throw Error(`AGDF_RELEASE_PAYLOAD_MISMATCH: ${name}`);
      console.log(`${name}@${RELEASE_VERSION}: published, exact source and integrity verified.`);
      return;
    }
    if (attempt < 20) await new Promise(done => setTimeout(done, 15000));
  }
  throw Error(`AGDF_RELEASE_REGISTRY_TIMEOUT: ${name}`);
}

async function main(mode, repository) {
  if (!['verify', 'publish-mcp', 'publish-wrapper', 'complete'].includes(mode)) throw Error('Invalid recovery operation');
  assertReleaseSource(repository);
  const create = await registryPackage('create-agdf');
  if (!create) throw Error('AGDF_RELEASE_CREATE_AGDF_MISSING');
  if (mode === 'complete') {
    for (const name of Object.keys(directories)) if (!await registryPackage(name)) throw Error(`AGDF_RELEASE_INCOMPLETE: ${name}`);
    const cli = await registryPackage('@agdf/cli');
    await waitForPackage('@agdf/cli', { integrity: cli.dist.integrity }, 'latest');
    console.log('All three exact package versions and @agdf/cli@latest verified against the immutable release source.');
    return;
  }
  if (!await samePayload(create, packedPayload(repository, 'create-agdf'))) throw Error('AGDF_RELEASE_CREATE_AGDF_BYTES_DIFFER');
  if (mode === 'verify') {
    console.log('Rebuilt create-agdf bytes exactly match the already published candidate. No upload.');
    return;
  }
  const name = mode === 'publish-mcp' ? '@agdf/mcp-server' : '@agdf/cli';
  if (mode === 'publish-wrapper' && !await registryPackage('@agdf/mcp-server')) throw Error('AGDF_RELEASE_MCP_MISSING');
  const payload = packedPayload(repository, name);
  await publishMissing(name, { matches: current => samePayload(current, payload), publish: () => npm(['publish', '--provenance', '--access', 'public'],
    join(repository, 'dist/npm', directories[name]), 'inherit') });
  await waitForPackage(name, payload);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main(process.argv[2], resolve(process.argv[3] ?? '.'));
}
