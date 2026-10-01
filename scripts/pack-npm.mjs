import { npmInvocation } from '../packages/cli/lib/npm-invocation.js';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { assembleNpm } from './assemble-npm.mjs';
import { repoRoot } from './core-projection.mjs';
const destination = join(repoRoot, 'dist', 'tarballs'); mkdirSync(destination, { recursive: true });
for (const item of assembleNpm()) {
  const invocation = npmInvocation(['pack', '--json', '--pack-destination', destination]);
  const text = execFileSync(invocation.executable, invocation.args, { cwd: item.output, encoding: 'utf8', shell: false });
  console.log(text.trim());
}
