import { CLIENT_CAPABILITIES_META_KEY, CLIENT_INFO_META_KEY, MissingRequiredClientCapabilityError, classifyInboundRequest } from "@modelcontextprotocol/server";

// Extension id under which MCP Apps hosts declare UI support (@modelcontextprotocol/ext-apps EXTENSION_ID).
export const MCP_APP_UI_EXTENSION = "io.modelcontextprotocol/ui";
export const requiresMcpAppUi = (runtime, tool) => runtime.mode === 'cockpit' && runtime.uiCapabilityRequired === true || tool?.requiresUi === true;
export const missingMcpAppUi = mimeType => new MissingRequiredClientCapabilityError({
  requiredCapabilities: { extensions: { [MCP_APP_UI_EXTENSION]: { mimeTypes: [mimeType] } } },
}, 'resource_denied');

// One narrow Transport decorator; framing, request dispatch, validation and
// pending-id/drain accounting remain with the original SDK connection.
export function capabilityTransport(transport, denial) {
  const wrapped = {
    onmessage: transport.onmessage,
    onerror: transport.onerror,
    onclose: transport.onclose,
    start: () => transport.start(),
    send: (message, options) => transport.send(message, options),
    close: () => transport.close(),
    get sessionId() { return transport.sessionId; },
    set sessionId(value) { transport.sessionId = value; },
    get hasPerRequestStream() { return transport.hasPerRequestStream; },
  };
  for (const method of ['setProtocolVersion', 'setSupportedProtocolVersions']) {
    if (transport[method]) wrapped[method] = (...args) => transport[method](...args);
  }
  transport.onerror = error => wrapped.onerror?.(error);
  transport.onclose = () => wrapped.onclose?.();
  transport.onmessage = (message, extra) => {
    const error = denial(message);
    if (!error) { wrapped.onmessage?.(message, extra); return; }
    // Sending through the original channel settles its pending request id.
    Promise.resolve().then(() => transport.send({ jsonrpc: '2.0', id: message.id,
      error: { code: error.code, message: error.message, data: error.data } }))
      .catch(cause => wrapped.onerror?.(cause));
  };
  return wrapped;
}

export function modernToolUiDenial(message, { era, runtime, registrations }) {
  if (era !== 'modern' || message?.method !== 'tools/call') return null;
  const classified = classifyInboundRequest({ httpMethod: 'POST', body: message });
  if (classified.kind !== 'modern' || classified.messageKind !== 'request') return null;
  const entry = registrations.get(message.params?.name);
  if (!entry?.registered.enabled || !requiresMcpAppUi(runtime, entry.tool)
      || declaresMcpAppUi(message.params?._meta?.[CLIENT_CAPABILITIES_META_KEY], runtime.ui.mimeType)) return null;
  const checked = entry.schema['~standard'].validate(message.params.arguments ?? {});
  // The pinned fromJsonSchema provider is synchronous. Never treat an unknown
  // asynchronous provider as proof that arguments passed validation.
  if (checked?.then || checked.issues?.length) return null;
  return missingMcpAppUi(runtime.ui.mimeType);
}
export const requestMcpClientInfo = (server, context) => context?.mcpReq?.envelope?.[CLIENT_INFO_META_KEY] ?? server.getClientVersion();
export const requestMcpClientCapabilities = (server, context) => context?.mcpReq?.envelope?.[CLIENT_CAPABILITIES_META_KEY] ?? server.getClientCapabilities();

export function declaresMcpAppUi(capabilities, mimeType) {
  const mimeTypes = capabilities?.extensions?.[MCP_APP_UI_EXTENSION]?.mimeTypes;
  return Array.isArray(mimeTypes) && mimeTypes.includes(mimeType);
}

// 2026-07-28 requests carry the capabilities in their envelope; 2025-era connections declare them once
// in initialize. The SDK does not expose envelope capabilities through getClientCapabilities() here.
export function requestDeclaresMcpAppUi(server, context, mimeType) {
  return declaresMcpAppUi(requestMcpClientCapabilities(server, context), mimeType);
}
