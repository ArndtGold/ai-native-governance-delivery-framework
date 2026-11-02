import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const paths = execFileSync('git', ['ls-files', '-z', '--', '*.sh'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
for (const path of paths) execFileSync('bash', ['-n', path], { cwd: root, stdio: 'inherit' });
console.log(`Shell syntax passed (${paths.length} tracked scripts).`);
