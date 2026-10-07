import { startControlServer as startProductionControlServer } from '../../server/service.mjs';

// Qualify a fixed build without replacing assets used by another browser or host.
// The production server retains its asset containment and integrity checks.
export const startControlServer = options => startProductionControlServer({
  ...options, ...(process.env.AGDF_COCKPIT_TEST_DIST ? { dist: process.env.AGDF_COCKPIT_TEST_DIST } : {}),
});
