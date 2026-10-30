import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startControlServer as startProductionControlServer } from '../../server/service.mjs';

// Qualify a fixed build without replacing assets used by another browser or host.
// The production server retains its asset containment and integrity checks.
export const startControlServer = options => startProductionControlServer({
  ...options, ...(process.env.AGDF_COCKPIT_TEST_DIST ? { dist: process.env.AGDF_COCKPIT_TEST_DIST } : {}),
});

// A candidate can retain its own evidence without overwriting prior runs.
// Existing invocations keep their established platform-specific location.
export const evidencePath = name => join(process.env.AGDF_COCKPIT_TEST_EVIDENCE_DIR
  ?? (process.platform === 'darwin' ? '/private/tmp' : tmpdir()), name);
