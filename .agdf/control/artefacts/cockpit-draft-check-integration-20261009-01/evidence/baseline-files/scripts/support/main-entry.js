import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// Node resolves imported modules through real paths; argv may retain an alias such as /var on macOS.
export function isMainEntry(moduleURL, entry = process.argv[1]) {
  return Boolean(entry && existsSync(entry) && realpathSync(entry) === realpathSync(fileURLToPath(moduleURL)));
}
