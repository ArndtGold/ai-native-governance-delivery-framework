import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/u;
let cached;

// No environment override, caller-selected executable, shell or public tool
// input. Unsupported hosts retain the conservative predecessor boundary.
export function readSystemBootId() {
  if (cached !== undefined) return cached;
  try {
    const value = (process.platform === 'darwin'
      ? execFileSync('/usr/sbin/sysctl', ['-n', 'kern.bootsessionuuid'], { encoding: 'utf8', timeout: 1000, maxBuffer: 256, stdio: ['ignore', 'pipe', 'ignore'] })
      : process.platform === 'linux' ? readFileSync('/proc/sys/kernel/random/boot_id', 'utf8') : '').trim().toLowerCase();
    return cached = uuid.test(value) ? value : null;
  } catch { return cached = null; }
}
