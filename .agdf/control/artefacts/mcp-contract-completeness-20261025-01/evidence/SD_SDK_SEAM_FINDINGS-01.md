# SDK seam findings for Solution Design

Date: 2026-10-25
Source: c327c50deae6e5b4fd8071c9e03b1ef2803df6ae
SDK: @modelcontextprotocol/server 2.0.0, installed locked dependency
Evidence class: source/API inspection and nonshipping in-memory API probes

McpServer.server is a readonly public Server reference; the high-level tool registration/validation methods and registered-tool maps are private in the SDK declarations. They are not suitable interception points. The high-level tools/call handler catches handler ProtocolErrors and converts them to isError except for URL elicitation. Merely throwing MissingRequiredClientCapabilityError inside the current callback will not implement the approved modern wire behavior.

McpServer.connect(transport) and the Transport interface are public. serveStdio calls its factory with an era, detects a McpServer subclass through instanceof, sets the underlying SDK protocol era, creates its connection channel and invokes product.connect(channel). An adapter subclass can override only public connect to decorate that channel, leaving the SDK's registered handlers and framing/negotiation owners intact. Forward start/send/close, callbacks, options and optional transport properties; do not replace private maps, handler internals or the SDK channel.

The SDK's exported classifyInboundRequest accepts a transport-neutral parsed body with httpMethod POST and no HTTP protocol headers. In-memory probes returned modern for a correctly declared body and envelope rejection -32602 for the same body missing clientCapabilities. This design uses that function only as a conservative eligibility check: every rejection/legacy/unrecognized case is forwarded unchanged to the SDK. No HTTP headers or rejection statuses are manufactured for STDIO.

For a candidate tools/call denial, reuse the same fromJsonSchema/AjvJsonSchemaValidator Standard Schema instance registered with McpServer. It returns synchronously for the installed JSON-schema provider. An empty input was rejected. Invalid tool arguments must pass through to the original SDK handler rather than become a capability error. This preserves validation precedence without implementing another validator. The gate checks only known enabled UI-dependent registrations and sends no other result or command.

The public MissingRequiredClientCapabilityError constructor accepted requiredCapabilities.extensions['io.modelcontextprotocol/ui'].mimeTypes=['text/html;profile=mcp-app'] and produced code -32021 with that data. A denied request is answered through the existing channel.send with its original id. The SDK's channel tracks unanswered ids and settles them in send for error/result responses, so the wrapper must not bypass that send path. It must forward transport lifecycle/errors once and preserve cancellation/subscription traffic. Actual STDIO ordering, drain, shutdown and per-request capability alternation remain TP verification obligations.

resources/read already has a protocol-error channel outside the high-level tool catch. Its registered callback can throw the typed SDK error after normal SDK request/resource validation, selecting the existing legacy error when not serving a valid modern request. Tool and resource checks share the same pure UI requirement/predicate; the transport gate is not a policy or authorization store.

Official API context: https://ts.sdk.modelcontextprotocol.io/v2/serving/stdio.html and https://ts.sdk.modelcontextprotocol.io/v2/servers/errors. Local inspection used dist/stdio.d.mts, dist/stdio.mjs and the public declarations in dist/createMcpHandler-CLhGwQTn.d.mts; implementation observations used the installed bundled McpServer code. No production SDK, server or contract source was edited, no host was installed and no governance command was executed by these probes.
