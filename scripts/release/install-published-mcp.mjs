import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npmInvocation } from '../../packages/cli/lib/npm-invocation.js';

// Replace only the checkout-local create-agdf locator. The reviewed SDK closure,
// including Zod's exact version and integrity, remains unchanged for npm ci.
export function publishedMcpLock(lock, metadata, version) {
  if (metadata.name !== 'create-agdf' || metadata.version !== version
      || lock.packages?.['']?.dependencies?.['create-agdf'] !== version
      || lock.packages?.['node_modules/create-agdf']?.version !== version
      || metadata.dist?.tarball !== `https://registry.npmjs.org/create-agdf/-/create-agdf-${version}.tgz`
      || !/^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(metadata.dist?.integrity ?? '')
      || Object.keys(metadata.dependencies ?? {}).length) throw Error('AGDF_PUBLISHED_DEPENDENCY_INVALID');
  const result = structuredClone(lock);
  result.packages['node_modules/create-agdf'] = {
    ...result.packages['node_modules/create-agdf'],
    resolved: metadata.dist.tarball,
    integrity: metadata.dist.integrity,
  };
  return result;
}

export function installPublishedMcp({ repository = process.cwd(), execute = execFileSync } = {}) {
  const cwd = join(repository, 'packages/mcp-server');
  const path = join(cwd, 'package-lock.json');
  const original = readFileSync(path);
  const version = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8')).dependencies['create-agdf'];
  const npm = args => {
    const invocation = npmInvocation(args);
    return execute(invocation.executable, invocation.args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  };
  const reply = JSON.parse(npm(['view', `create-agdf@${version}`, '--json']));
  const metadata = Array.isArray(reply) && reply.length === 1 ? reply[0] : reply;
  const locked = publishedMcpLock(JSON.parse(original), metadata, version);
  try {
    writeFileSync(path, JSON.stringify(locked, null, 2) + '\n');
    console.log(npm(['ci', '--ignore-scripts', '--no-audit', '--no-fund']));
    const installed = JSON.parse(readFileSync(join(cwd, 'node_modules/create-agdf/package.json'), 'utf8'));
    if (installed.name !== 'create-agdf' || installed.version !== version) throw Error('AGDF_PUBLISHED_DEPENDENCY_INVALID');
    console.log(`Published create-agdf@${version}; all SDK dependencies retain their reviewed lock.`);
  } finally {
    writeFileSync(path, original);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) installPublishedMcp();
