import { McpServer, ProtocolError, ProtocolErrorCode, fromJsonSchema } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { DispatchExecutionError, createWorkerDispatchExecutor } from "./worker.js";
import { loadCockpitResource } from './cockpit-resource.js';
import { requestDeclaresMcpAppUi, requestMcpClientInfo } from "./ui-capability.js";

export const SERVER_NAME = "agdf-mcp";

function toolResult(runtime, result, serialize = runtime.serialize) {
  const { _meta, ...publicResult } = result;
  const text = serialize(_meta ? publicResult : result);
  const response = {
    content: [{ type: "text", text: result.presentation_delivery?.text ?? text }],
    structuredContent: JSON.parse(text),
    ...(_meta ? { _meta } : {}),
  };
  if (runtime.mode === 'cockpit' && Buffer.byteLength(JSON.stringify(response), 'utf8') > runtime.responseLimit) {
    const failure = runtime.failure('resource_limit');
    return { content: [{ type: 'text', text: runtime.serialize(failure) }], structuredContent: failure };
  }
  return response;
}

export function buildAgdfServer({ runtime, executor } = {}) {
  if (!runtime?.definition || typeof runtime.serialize !== "function") {
    throw new TypeError("AGDF MCP runtime is required");
  }
  if (runtime.trustedContext?.provenanceStatus !== "matched") {
    throw new TypeError("AGDF MCP owned runtime is required");
  }
  const tools = runtime.tools ?? [{ name: runtime.definition.name, definition: runtime.definition, parse: runtime.parse, execute: runtime.execute }];
  const dispatchExecutor = executor ?? {
    execute: async (argumentsValue, { toolName, signal } = {}) => {
      const tool = tools.find((entry) => entry.name === (toolName ?? runtime.definition.name));
      if (!tool) throw new DispatchExecutionError("dispatch_worker_failed");
      return tool.execute(tool.parse(argumentsValue), signal);
    },
    close: async () => runtime.close?.(),
  };
  const server = new McpServer(
    { name: SERVER_NAME, version: runtime.trustedContext.expectedVersion },
    { capabilities: { tools: {}, ...(runtime.ui ? { resources: {} } : {}) } },
  );
  // A UI-gated cockpit is offered only to clients that declare MCP app UI support for its resource type.
  const gated = runtime.mode === 'cockpit' && runtime.uiCapabilityRequired === true;
  const uiAllowed = (context) => !gated || requestDeclaresMcpAppUi(server.server, context, runtime.ui.mimeType);
  const supportsUi = context => !!runtime.ui && requestDeclaresMcpAppUi(server.server, context, runtime.ui.mimeType);
  for (const tool of tools) {
    const { name, definition, serialize } = tool;
    server.registerTool(
      name,
      {
        description: definition.description,
        annotations: definition.annotations,
        inputSchema: fromJsonSchema(definition.inputSchema),
        ...(definition.outputSchema ? { outputSchema: fromJsonSchema(definition.outputSchema) } : {}),
        ...(definition._meta ? { _meta: definition._meta } : {}),
      },
      async (argumentsValue, context) => {
        if (!uiAllowed(context)) return toolResult(runtime, runtime.failure("resource_denied", name), serialize ?? runtime.serialize);
        if (tool.requiresUi && !supportsUi(context)) return toolResult(runtime, runtime.failure('host_ui_unsupported', name, argumentsValue, { dispatch: 'not_dispatched' }), serialize ?? runtime.serialize);
        try {
          let result = tool.parentOwned ? await tool.execute(tool.parse(argumentsValue), context.signal,
            { client: requestMcpClientInfo(server.server, context), uiSupported: supportsUi(context) })
            : await dispatchExecutor.execute(argumentsValue, { signal: context.signal, toolName: name });
          if (runtime.postprocessToolResult) result = await runtime.postprocessToolResult(name, argumentsValue, result,
            { uiSupported: supportsUi(context), client: requestMcpClientInfo(server.server, context) });
          return toolResult(runtime, result, serialize ?? runtime.serialize);
        } catch (error) {
          const code = error instanceof DispatchExecutionError ? error.code : "dispatch_worker_failed";
          return toolResult(runtime, runtime.failure(code, name, argumentsValue, { dispatch: error.dispatch ?? 'unknown' }), serialize ?? runtime.serialize);
        }
      },
    );
  }
  if (runtime.ui) {
    const resource = loadCockpitResource(runtime.ui);
    server.registerResource(runtime.mode === 'decision' ? 'AGDF Gate Decision' : 'AGDF Cockpit', resource.uri, { mimeType: resource.mimeType, _meta: resource._meta },
      async (_uri, context) => {
        if (!uiAllowed(context) || runtime.mode === 'decision' && !supportsUi(context)) throw new ProtocolError(ProtocolErrorCode.InvalidParams, "resource_denied");
        return { contents: [resource] };
      });
    if (gated || runtime.mode === 'decision') {
      // McpServer's list handlers ignore the request context, so the gated surface lists per request.
      const listedTools = tools.map(({ name, definition }) => ({
        name, description: definition.description, inputSchema: server.toolInputSchemaJson(name),
        annotations: definition.annotations, ...(definition._meta ? { _meta: definition._meta } : {}),
        ...(definition.outputSchema ? { outputSchema: definition.outputSchema } : {}),
      }));
      const listedResource = { uri: resource.uri, name: 'AGDF Cockpit', mimeType: resource.mimeType, _meta: resource._meta };
      server.server.removeRequestHandler("tools/list");
      server.server.setRequestHandler("tools/list", (_request, context) => ({ tools: !uiAllowed(context) ? [] : runtime.mode === 'decision' && !supportsUi(context)
        ? listedTools.filter(tool => !tools.find(entry => entry.name === tool.name)?.requiresUi) : listedTools }));
      server.server.removeRequestHandler("resources/list");
      server.server.setRequestHandler("resources/list", (_request, context) => ({ resources: uiAllowed(context) && (runtime.mode !== 'decision' || supportsUi(context)) ? [listedResource] : [] }));
    }
  }
  return Object.assign(server, {
    closeAgdfRuntime: async () => { await dispatchExecutor.close(); await runtime.close?.(); },
  });
}

export function serveAgdfStdio({ runtime, executor, onerror } = {}) {
  const instances = new Set();
  const handle = serveStdio(() => {
    const server = buildAgdfServer({ runtime, executor });
    instances.add(server);
    return server;
  }, {
    legacy: "serve",
    onerror: () => onerror?.("AGDF_MCP_TRANSPORT_ERROR"),
  });
  return Object.freeze({
    async close() {
      await Promise.allSettled([...instances].map((server) => server.closeAgdfRuntime()));
      await handle.close();
    },
  });
}

export function createAgdfWorkerExecutor(runtime, options = {}) {
  return createWorkerDispatchExecutor({
    surface: runtime.trustedContext.surface,
    expectedVersion: runtime.trustedContext.expectedVersion,
    commandGroups: runtime.trustedContext.commandGroups,
    ...options,
  });
}
