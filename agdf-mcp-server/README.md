# @agdf/mcp-server

Local STDIO MCP adapter for the canonical AGDF `agdf_dispatch` function.

The server requires Node.js 20 or later, exposes no generic shell, filesystem or network operation,
and never grants AGDF approval or delivery authority. Use the `create-agdf` lifecycle command to
prepare and register the exact version-matched server for a delivered host adapter. Host support
remains unverified until direct registration, discovery, invocation, failure and removal evidence exists.
