import { CLIENT_CAPABILITIES_META_KEY } from "@modelcontextprotocol/server";

// Extension id under which MCP Apps hosts declare UI support (@modelcontextprotocol/ext-apps EXTENSION_ID).
export const MCP_APP_UI_EXTENSION = "io.modelcontextprotocol/ui";

export function declaresMcpAppUi(capabilities, mimeType) {
  const mimeTypes = capabilities?.extensions?.[MCP_APP_UI_EXTENSION]?.mimeTypes;
  return Array.isArray(mimeTypes) && mimeTypes.includes(mimeType);
}

// 2026-07-28 requests carry the capabilities in their envelope; 2025-era connections declare them once
// in initialize. The SDK does not expose envelope capabilities through getClientCapabilities() here.
export function requestDeclaresMcpAppUi(server, context, mimeType) {
  return declaresMcpAppUi(context?.mcpReq?.envelope?.[CLIENT_CAPABILITIES_META_KEY] ?? server.getClientCapabilities(), mimeType);
}
