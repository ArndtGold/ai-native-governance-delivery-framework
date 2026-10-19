// tools/list capture and per-tool definition metrics (METRICS.md, protocol layer).
import { byteLength, normalizeJson } from "./normalize.js";

export function toolDefinitionMetrics(tool, roots = []) {
  const properties = tool?.inputSchema?.properties && typeof tool.inputSchema.properties === "object" ? tool.inputSchema.properties : {};
  const names = Object.keys(properties);
  const documented = names.filter(name => typeof properties[name]?.description === "string" && properties[name].description.trim()).length;
  return {
    tool: tool.name,
    definition_bytes: byteLength(normalizeJson(tool, roots)),
    params_total: names.length,
    params_documented: documented,
    documented_share: names.length ? Math.round((documented / names.length) * 1000) / 1000 : null,
    description_chars: String(tool.description ?? "").length,
    has_output_schema: Boolean(tool.outputSchema),
    has_title: typeof tool.title === "string" && tool.title.length > 0,
    annotations: tool.annotations ?? null,
  };
}

// The canonical capture: names in server order plus the normalized definition text of each tool.
export function captureToolList(tools, roots = []) {
  return {
    names: tools.map(tool => tool.name),
    definitions: Object.fromEntries(tools.map(tool => [tool.name, normalizeJson(tool, roots)])),
    metrics: tools.map(tool => toolDefinitionMetrics(tool, roots)),
    total_definition_bytes: tools.reduce((sum, tool) => sum + byteLength(normalizeJson(tool, roots)), 0),
  };
}

export async function listAllTools(client) {
  const tools = [];
  let cursor;
  do {
    const page = await client.listTools(cursor ? { cursor } : undefined);
    tools.push(...page.tools);
    cursor = page.nextCursor;
  } while (cursor);
  return tools;
}
