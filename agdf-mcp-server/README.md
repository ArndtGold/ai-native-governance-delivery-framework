# @agdf/mcp-server

Local STDIO MCP adapter for the canonical AGDF `agdf_dispatch` function.

> [!IMPORTANT]
> This package is an unreleased development component for the next AGDF version. AGDF 0.14.5 does not include MCP support.
> Installing AGDF 0.14.5 therefore does not install this server, register
> `agdf_dispatch` or provide the guided `--with-mcp` setup described below.

The server requires Node.js 20 or later, exposes no generic shell, filesystem or network operation,
and never grants AGDF approval or delivery authority. Use the `create-agdf` lifecycle command to
prepare and register the exact version-matched server for a delivered host adapter. Host support
remains unverified until direct registration, discovery, invocation, failure and removal evidence exists.

The guided `codex`, `claude`, `copilot` and `opencode` installers can call that same lifecycle after
the user explicitly chooses complete setup. In non-interactive use this requires `--with-mcp` and
an entered absolute `--dir`; otherwise installation remains plugin-only. The plugin transaction and
MCP transaction retain separate results and recovery. A verified plugin is never rolled back only
because MCP setup fails. Marketplace-only installation has no CLI callback and therefore remains
plugin-only.

`agdf_dispatch` requires `presentation_language` as one well-formed BCP 47 tag. The host selects it
from the latest natural-language request: an explicit response-language instruction wins, otherwise
the dominant language is used, with `en` for mixed or ambiguous input. Missing or invalid input is
rejected by the MCP schema before governance evaluation. A valid unsupported tag is accepted and
renders through the complete English locale pack. The production tests exercise this contract
separately for protocol versions `2025-11-25` and `2026-07-28`.
