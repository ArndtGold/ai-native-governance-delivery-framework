import { McpServer, fromJsonSchema } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { DispatchExecutionError, createWorkerDispatchExecutor } from "./worker.js";
import { loadCockpitResource } from './cockpit-resource.js';

export const SERVER_NAME = "agdf-mcp";

function toolResult(runtime, result, serialize = runtime.serialize) {
  const { _meta, ...publicResult } = result;
  const text = serialize(_meta ? publicResult : result);
  const response = {
    content: [{ type: "text", text }],
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
    { capabilities: { tools: {}, ...(runtime.mode === 'cockpit' ? { resources: {} } : {}) } },
  );
  for (const { name, definition, serialize } of tools) {
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
        try {
          const result = await dispatchExecutor.execute(argumentsValue, { signal: context.signal, toolName: name });
          return toolResult(runtime, result, serialize ?? runtime.serialize);
        } catch (error) {
          const code = error instanceof DispatchExecutionError ? error.code : "dispatch_worker_failed";
          return toolResult(runtime, runtime.failure(code, name), serialize ?? runtime.serialize);
        }
      },
    );
  }
  if (runtime.mode === 'cockpit') {
    const resource = loadCockpitResource(runtime.ui);
    server.registerResource('AGDF Cockpit', resource.uri, { mimeType: resource.mimeType, _meta: resource._meta },
      async () => ({ contents: [resource] }));
  }
  return Object.assign(server, {
    closeAgdfRuntime: () => dispatchExecutor.close(),
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
    ...options,
  });
}
