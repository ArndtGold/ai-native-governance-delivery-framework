import { McpServer, ProtocolError, ProtocolErrorCode, fromJsonSchema } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { AjvJsonSchemaValidator } from '@modelcontextprotocol/server/validators/ajv';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DispatchExecutionError, createWorkerDispatchExecutor } from "./worker.js";
import { loadCockpitResource } from './cockpit-resource.js';
import { requestDeclaresMcpAppUi, requestMcpClientInfo, requestMcpClientCapabilities, requiresMcpAppUi,
  missingMcpAppUi, capabilityTransport, modernToolUiDenial } from "./ui-capability.js";

export const SERVER_NAME = "agdf-mcp";

function toolResult(runtime, name, input, result, serialize = runtime.serialize, provider, peer, facts) {
  // A generation must supply its own descriptor. Never reinterpret old results
  // with the facade's current runtime. Local owners project after postprocessing.
  const emit = value => {
    const projected = Object.hasOwn(value._meta ?? {}, 'agdf/tool-result') || runtime.requiresProjectedResult ? value
      : runtime.projectToolResult(name, input, value, facts);
    const { domain, metadata, descriptor } = runtime.consumeToolResult(name, projected);
    const text = serialize(domain);
    const response = {
      content: [{ type: 'text', text: domain.presentation_delivery?.text ?? text },
        ...(descriptor.failed ? [{ type: 'text', text: descriptor.message }] : [])],
      structuredContent: JSON.parse(text),
      ...(descriptor.failed ? { isError: true } : {}),
      ...(Object.keys(metadata).length || provider ? { _meta: { ...metadata,
        ...(provider ? { 'agdf/provider': provider, 'agdf/peer': peer } : {}) } } : {}),
    };
    return response;
  };
  let response = emit(result);
  if (runtime.responseLimit && Buffer.byteLength(JSON.stringify(response), 'utf8') > runtime.responseLimit) {
    // The fallback itself is projected, checked and measured; no recursive call.
    const limitFacts = { code: 'resource_limit', dispatch: 'unknown' };
    const failure = runtime.projectToolResult(name, input, runtime.failure('resource_limit', name, input, limitFacts), limitFacts);
    response = emit(failure);
    if (Buffer.byteLength(JSON.stringify(response), 'utf8') > runtime.responseLimit) throw Error('tool_result_invalid');
  }
  return response;
}

export function buildAgdfServer({ runtime, executor, era } = {}) {
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
      let parsed;
      try { parsed = tool.parse(argumentsValue); }
      catch (error) { const facts = runtime.normalizeFailure(error, { phase: 'parse' }); throw new DispatchExecutionError(facts.code, facts.dispatch, facts.field); }
      return tool.execute(parsed, signal);
    },
    close: async () => runtime.close?.(),
  };
  const registrations = new Map();
  class AgdfServer extends McpServer {
    async connect(transport) {
      return super.connect(capabilityTransport(transport, message => modernToolUiDenial(message,
        { era: era ?? (this.server.getNegotiatedProtocolVersion() === '2026-07-28' ? 'modern' : 'legacy'), runtime, registrations })));
    }
  }
  const server = new AgdfServer(
    { name: SERVER_NAME, version: runtime.trustedContext.expectedVersion },
    { capabilities: { tools: {}, ...(runtime.ui ? { resources: {} } : {}) } },
  );
  // Capability checks guard execution and resource access. Codex must first
  // discover the plugin tool metadata before selecting its UI-capable route.
  const gated = runtime.mode === 'cockpit' && runtime.uiCapabilityRequired === true;
  const discoverBeforeUi = gated && runtime.trustedContext.surface === 'codex';
  // serveStdio pins one SDK server instance for the connection's lifetime.
  // This is a server-issued observation, never a guessed host namespace or approval.
  const provider = gated && runtime.trustedContext.surface === 'codex' ? Object.freeze({
    schema_version: 1, authorizes: false, identity_scope: 'sdk_server_instance',
    connection_id: randomUUID(), server_module: fileURLToPath(import.meta.url),
    version: runtime.trustedContext.expectedVersion,
  }) : undefined;
  const respond = (name, input, result, serialize, context, facts) => toolResult(runtime, name, input, result, serialize, provider, provider ? {
    client_info: requestMcpClientInfo(server.server, context), capabilities: requestMcpClientCapabilities(server.server, context),
  } : undefined, facts);
  const uiAllowed = (context) => !gated || requestDeclaresMcpAppUi(server.server, context, runtime.ui.mimeType);
  const supportsUi = context => !!runtime.ui && requestDeclaresMcpAppUi(server.server, context, runtime.ui.mimeType);
  // Discovery needs the exact schemas, but does not execute any tool. Compile
  // each validator on its first validation, using the same SDK provider/options.
  // Input validation still precedes execution; successful output is still checked.
  const schemaProvider = new AjvJsonSchemaValidator();
  const deferredSchemas = { getValidator(schema) {
    let validate;
    return value => (validate ??= schemaProvider.getValidator(schema))(value);
  } };
  for (const tool of tools) {
    const { name, definition, serialize } = tool;
    const schema = fromJsonSchema(definition.inputSchema, deferredSchemas);
    const registered = server.registerTool(
      name,
      {
        description: definition.description,
        annotations: definition.annotations,
        inputSchema: schema,
        ...(definition.outputSchema ? { outputSchema: fromJsonSchema(definition.outputSchema, deferredSchemas) } : {}),
        ...(definition._meta ? { _meta: definition._meta } : {}),
      },
      async (argumentsValue, context) => {
        const denied = !uiAllowed(context) ? runtime.unsupportedUiCode ?? 'resource_denied'
          : tool.requiresUi && !supportsUi(context) ? 'host_ui_unsupported' : null;
        if (denied) {
          const facts = { code: denied, dispatch: 'not_dispatched' };
          const failure = runtime.projectToolResult(name, argumentsValue, runtime.failure(denied, name, argumentsValue, facts), facts);
          return respond(name, argumentsValue, failure, serialize ?? runtime.serialize, context, facts);
        }
        let phase = tool.parentOwned ? 'parse' : 'execute';
        try {
          let result;
          if (tool.parentOwned) {
            const parsed = tool.parse(argumentsValue); phase = 'execute';
            result = await tool.execute(parsed, context.signal,
              { client: requestMcpClientInfo(server.server, context), uiSupported: supportsUi(context) });
          } else result = await dispatchExecutor.execute(argumentsValue, { signal: context.signal, toolName: name });
          if (runtime.postprocessToolResult) result = await runtime.postprocessToolResult(name, argumentsValue, result,
            { uiSupported: supportsUi(context), client: requestMcpClientInfo(server.server, context) });
          return respond(name, argumentsValue, result, serialize ?? runtime.serialize, context);
        } catch (error) {
          const facts = runtime.normalizeFailure(error, { phase });
          const failure = runtime.failure(facts.code, name, argumentsValue, facts);
          // A local execution/delivery failure is owned here, including malformed
          // producer output. It never causes re-execution or a second write.
          const projected = runtime.projectToolResult(name, argumentsValue, failure, facts);
          return respond(name, argumentsValue, projected, serialize ?? runtime.serialize, context, facts);
        }
      },
    );
    registrations.set(name, { tool, schema, registered });
  }
  if (runtime.ui) {
    const resource = loadCockpitResource(runtime.ui);
    server.registerResource(runtime.mode === 'decision' ? 'AGDF Gate Decision' : runtime.ui.label ?? 'AGDF Cockpit', resource.uri, { mimeType: resource.mimeType, _meta: resource._meta },
      async (_uri, context) => {
        if (requiresMcpAppUi(runtime, { requiresUi: runtime.mode === 'decision' }) && !supportsUi(context)) {
          if ((era ?? (server.server.getNegotiatedProtocolVersion() === '2026-07-28' ? 'modern' : 'legacy')) === 'modern') throw missingMcpAppUi(runtime.ui.mimeType);
          throw new ProtocolError(ProtocolErrorCode.InvalidParams, "resource_denied");
        }
        return { contents: [resource] };
      });
    if (gated || runtime.mode === 'decision') {
      // McpServer's list handlers ignore the request context, so the gated surface lists per request.
      const listedTools = tools.map(({ name, definition }) => ({
        name, description: definition.description, inputSchema: server.toolInputSchemaJson(name),
        annotations: definition.annotations, ...(definition._meta ? { _meta: definition._meta } : {}),
        ...(definition.outputSchema ? { outputSchema: definition.outputSchema } : {}),
      }));
      const listedResource = { uri: resource.uri, name: runtime.ui.label ?? 'AGDF Cockpit', mimeType: resource.mimeType, _meta: resource._meta };
      server.server.removeRequestHandler("tools/list");
      server.server.setRequestHandler("tools/list", (_request, context) => ({ tools: !discoverBeforeUi && !uiAllowed(context) ? [] : runtime.mode === 'decision' && !supportsUi(context)
        ? listedTools.filter(tool => !tools.find(entry => entry.name === tool.name)?.requiresUi) : listedTools }));
      server.server.removeRequestHandler("resources/list");
      server.server.setRequestHandler("resources/list", (_request, context) => ({ resources: uiAllowed(context) && (runtime.mode !== 'decision' || supportsUi(context)) ? [listedResource] : [] }));
    }
  }
  return Object.assign(server, {
    closeAgdfRuntime: async () => { await dispatchExecutor.close(); return runtime.close?.(); },
  });
}

export function serveAgdfStdio({ runtime, executor, onerror } = {}) {
  const instances = new Set();
  const handle = serveStdio(({ era }) => {
    const server = buildAgdfServer({ runtime, executor, era });
    instances.add(server);
    return server;
  }, {
    legacy: "serve",
    onerror: () => onerror?.("AGDF_MCP_TRANSPORT_ERROR"),
  });
  return Object.freeze({
    async close() {
      // The generation facade is prepared before a client initializes. A host
      // may cancel that connection without creating any SDK server instance;
      // its already-owned executor/runtime must still close and prove exit.
      const owners = instances.size ? [...instances].map(server => () => server.closeAgdfRuntime())
        : [async () => { await executor?.close(); return runtime.close?.(); }];
      const results = await Promise.allSettled(owners.map(close => close()));
      await handle.close();
      return { confirmed: results.length > 0 && results.every(result => result.status === 'fulfilled' && result.value?.occupancy === 0) };
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
