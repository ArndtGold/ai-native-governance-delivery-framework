// Bounded subprocess fixture. The parent supplies an isolated npm implementation and config root.
import { installOpenCodeGlobalPlugin, installOpenCodeGlobalSurface } from "../../../lib/installers/opencode.js";
if (process.env.NODE_ENV !== "test" || !process.env.AGDF_TEST_NPM_CLI_PATH || !process.env.HAC_FIXTURE_ROOT) throw new Error("fixture environment required");
try {
  const installed = installOpenCodeGlobalPlugin(process.env.HAC_FIXTURE_ROOT);
  installOpenCodeGlobalSurface(process.env.HAC_FIXTURE_ROOT);
  console.log(JSON.stringify({ installed }));
} catch (error) {
  console.log(JSON.stringify({ error: { message: error.message, phase: error.phase, evidence: error.evidence } }));
  process.exitCode = 1;
}
