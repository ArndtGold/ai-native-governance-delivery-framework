// Child process for the concurrent runtime replacement test: one plugin-local launcher preparing its runtime.
// Usage: node plugin-mcp-ensure-worker.js <plugin-root> <data-root>
import { ensurePluginMcpRuntime } from "../../lib/mcp-lifecycle/plugin-runtime.js";
import { offlineNpm } from "../../../../scripts/support/plugin-mcp-fixture.js";
import { writeFileSync } from 'node:fs';

const [pluginRoot, dataRoot, holdingMarker] = process.argv.slice(2);
try {
  const runtime = ensurePluginMcpRuntime({ pluginRoot, dataRoot, exec: (...args) => {
    if (holdingMarker) {
      writeFileSync(holdingMarker, 'publication owner is inside SDK acquisition');
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
    }
    return offlineNpm(...args);
  } });
  process.stdout.write(JSON.stringify({ status: runtime.status, changed: runtime.changed }));
} catch (error) {
  process.stdout.write(JSON.stringify({ error: error.message }));
}
