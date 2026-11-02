// Child process for the concurrent runtime replacement test: one plugin-local launcher preparing its runtime.
// Usage: node plugin-mcp-ensure-worker.js <plugin-root> <data-root>
import { ensurePluginMcpRuntime } from "../../lib/mcp-lifecycle/plugin-runtime.js";
import { offlineNpm } from "../../../../scripts/support/plugin-mcp-fixture.js";

const [pluginRoot, dataRoot] = process.argv.slice(2);
try {
  const runtime = ensurePluginMcpRuntime({ pluginRoot, dataRoot, exec: offlineNpm });
  process.stdout.write(JSON.stringify({ status: runtime.status, changed: runtime.changed }));
} catch (error) {
  process.stdout.write(JSON.stringify({ error: error.message }));
}
