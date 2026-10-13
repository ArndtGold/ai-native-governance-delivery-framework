// Exercise the same owner and assertions for the other approved structured mode.
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
execFileSync(process.execPath, [fileURLToPath(new URL('./run-closeout-command-test.js', import.meta.url))], {
  env: { ...process.env, AGDF_TEST_STRUCTURED_ROUTE: 'structured_slice' }, stdio: 'inherit',
});
