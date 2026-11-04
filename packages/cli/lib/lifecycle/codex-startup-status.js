import { observeCodexOrigins } from '../mcp-lifecycle/adapters/codex-origin-probe.js';
import { CODEX_MCP_STARTUP_ARGS } from '../host-adapters/codex/mcp-startup.js';

// Transient host observations. Installation, registration and actual catalog
// readiness remain separate facts; this function grants no authority.
export async function inspectCodexStartup({ target, native = false, env = process.env },
  { observe = observeCodexOrigins, now = Date.now } = {}) {
  const deadline = now() + 45000;
  const configuration = await observe({ target, mode: 'configuration', env, timeoutMs: 15000 });
  let catalog = { status: 'not_observed', reason: 'native_not_requested', providers: [] };
  if (native) {
    const remaining = deadline - now();
    const result = remaining > 0 ? await observe({ target, mode: 'catalog', all: true, env, timeoutMs: remaining })
      : { status: 'unavailable', reason: 'timeout' };
    const providers = (result.providers ?? []).filter(row => row.server_id === 'agdf' && row.plugin_id === 'agdf@agdf');
    const ready = result.status === 'observed' && providers.length === 1
      && ['agdf_inspect', 'agdf_project'].every(name => providers[0].tools.includes(name))
      && !['failed', 'starting', 'connecting'].includes(providers[0].runtime_status);
    catalog = { status: ready ? 'discovered_ready' : 'unavailable',
      reason: ready ? null : result.reason ?? 'owned_required_tools_unavailable',
      requested: true, invocation_override: [...CODEX_MCP_STARTUP_ARGS], providers,
      teardown: result.status === 'observed' ? 'confirmed' : 'unconfirmed' };
  }
  return { schema_version: 1, authorizes: false, configuration, catalog,
    next_action: catalog.status === 'discovered_ready'
      ? 'Inspect project-state for the confirmed Git root; initialize only with deliberate setup intent.'
      : native ? 'Inspect the reported Codex startup cause and supported MCP registration status. Preserve configuration and original operation identity.'
        : 'Registration is not catalog readiness. Use status --surface codex --dir ABSOLUTE --native --json for an explicit bounded catalog observation.' };
}
