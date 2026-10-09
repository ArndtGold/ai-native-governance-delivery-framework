import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startControlServer as startProductionControlServer } from '../../server/service.mjs';

// Qualify a fixed build without replacing assets used by another browser or host.
// The production server retains its asset containment and integrity checks.
export const startControlServer = options => startProductionControlServer({
  ...options, ...(process.env.AGDF_COCKPIT_TEST_DIST ? { dist: process.env.AGDF_COCKPIT_TEST_DIST } : {}),
});

// Visual evidence keeps its established macOS location; other hosts use their own temp directory.
export const evidencePath = name => join(process.platform === 'darwin' ? '/private/tmp' : tmpdir(), name);
