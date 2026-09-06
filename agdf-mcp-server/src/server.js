import { McpServer, fromJsonSchema } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { DispatchExecutionError, createWorkerDispatchExecutor } from "./worker.js";

export const SERVER_NAME = "agdf-mcp";

function toolResult(runtime, result) {
  const text = runtime.serialize(result);
  return {
    content: [{ type: "text", text }],
    structuredContent: JSON.parse(text),
  };
}

export function buildAgdfServer({ runtime, executor } = {}) {
  if (!runtime?.definition || typeof runtime.serialize !== "function") {
    throw new TypeError("AGDF MCP runtime is required");
  }
  if (runtime.trustedContext?.provenanceStatus !== "matched") {
    throw new TypeError("AGDF MCP owned runtime is required");
  }
  const definition = runtime.definition;
  const dispatchExecutor = executor ?? {
    execute: async (argumentsValue) => runtime.execute(runtime.parse(argumentsValue)),
    close: async () => {},
  };
  const server = new McpServer(
    { name: SERVER_NAME, version: runtime.trustedContext.expectedVersion },
    { capabilities: { tools: {} } },
  );
  server.registerTool(
    definition.name,
    {
      description: definition.description,
      annotations: definition.annotations,
      inputSchema: fromJsonSchema(definition.inputSchema),
      outputSchema: fromJsonSchema(definition.outputSchema),
    },
    async (argumentsValue, context) => {
      try {
        const result = await dispatchExecutor.execute(argumentsValue, { signal: context.signal });
        return toolResult(runtime, result);
      } catch (error) {
        const code = error instanceof DispatchExecutionError ? error.code : "dispatch_worker_failed";
        return toolResult(runtime, runtime.failure(code));
      }
    },
  );
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
