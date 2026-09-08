# @agdf/mcp-server

Local STDIO MCP adapter for the canonical AGDF `agdf_dispatch` function.

The server requires Node.js 20 or later, exposes no generic shell, filesystem or network operation,
and never grants AGDF approval or delivery authority. Use the `create-agdf` lifecycle command to
prepare and register the exact version-matched server for a delivered host adapter. Host support
remains unverified until direct registration, discovery, invocation, failure and removal evidence exists.

`agdf_dispatch` requires `presentation_language` as one well-formed BCP 47 tag. The host selects it
from the latest natural-language request: an explicit response-language instruction wins, otherwise
the dominant language is used, with `en` for mixed or ambiguous input. Missing or invalid input is
rejected by the MCP schema before governance evaluation. A valid unsupported tag is accepted and
renders through the complete English locale pack. The production tests exercise this contract
separately for protocol versions `2025-11-25` and `2026-07-28`.
