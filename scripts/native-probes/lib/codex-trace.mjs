import { createHash } from 'node:crypto';
const TOOL = 'agdf_dispatch', SERVER = 'agdf';
function resultText(result) {
  if (typeof result === 'string') return result;
  const structured = result?.structured_content ?? result?.structuredContent;
  if (structured && typeof structured === 'object') return JSON.stringify(structured);
  const parts = Array.isArray(result?.content) ? result.content.map(part => part.text ?? '') : [];
  // Error replies also contain a human diagnostic after the machine report. Joining
  // those blocks makes valid native invalid_input results impossible to decode.
  for (const part of parts) {
    try { const value = JSON.parse(part); if (value?.schema_version && value?.outcome) return part; } catch {}
  }
  return parts.join('');
}
export function mcpCalls(texts, redact = value => String(value)) {
  const calls = [];
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    const item = node.item ?? node.payload?.item;
    if (item && ["mcp_tool_call", "McpToolCall"].includes(item.type)) {
      const call = item.invocation ?? item;
      if (call.tool === TOOL && (!call.server || call.server === SERVER)) {
        const result = item.result ?? item.output ?? null;
        const text = resultText(result);
        const error = item.error?.message ?? (typeof item.error === "string" ? item.error : null);
        calls.push({ id: item.id ?? null, status: item.status ?? null, pluginId: item.pluginId ?? call.pluginId ?? null, text, error });
      }
    }
  };
  for (const text of texts) for (const line of text.split("\n")) { try { visit(JSON.parse(line)); } catch {} }
  // The same call can appear as started and completed and in exec output and rollout: keep the last per id.
  const byId = new Map();
  for (const call of calls) byId.set(call.id ?? `${byId.size}`, call);
  return [...byId.values()].map((call) => {
    let parsed = null;
    try { parsed = JSON.parse(call.text); } catch {}
    const contracts = parsed?.continuation?.runtime_contracts;
    return { status: call.status, plugin_id: call.pluginId, outcome: parsed?.outcome ?? null, terminal: parsed?.terminal ?? null, authorizes: parsed?.authorizes ?? null,
      contract_modules: Array.isArray(contracts) ? contracts.map(c => c.module) : [],
      contracts_verified: Array.isArray(contracts) && contracts.length > 0 && contracts.every(c => typeof c.content === "string" && c.content.length > 0 && createHash("sha256").update(c.content).digest("hex") === c.sha256),
      runtime_digest: parsed?.runtime?.runtime_digest ?? null,
      host_action: redact(parsed?.host_action?.text ?? call.error ?? call.text).slice(0, 160),
      approval_blocked: /requires approval/i.test(`${call.error ?? ""} ${call.text}`) };
  });
}

