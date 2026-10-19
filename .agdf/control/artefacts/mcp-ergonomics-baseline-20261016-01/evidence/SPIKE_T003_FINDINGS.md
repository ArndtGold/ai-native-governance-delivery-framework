# T-003 Spike Findings and Owner Decisions

Run: mcp-ergonomics-baseline-20261016-01 · Date: 2026-10-16 · Evidence: `SPIKE_T003.json` (redacted)

## Findings

1. Installing AGDF into an isolated Claude home from this session is refused by design: the session
   runs inside the Claude Desktop packaged app (`Claude_pzs8sxrjxfjjc`), and the installer's
   packaged-app preflight (claude-install-hardening, AC-001) stops before any change. The native layer
   must therefore run from an ordinary terminal outside Claude Desktop. The TP already assigns the
   native scenarios SCN-011 to SCN-013 to the owner.
2. Claude Code 2.1.268 reports `unrecognized_model` for `claude-sonnet-5-5` (and by the same rule for
   `claude-opus-5-5`); the session still runs, but the reported cost is not reliable. The aliases
   `sonnet`/`opus` resolve to the 5 generation (`claude-sonnet-5`).
3. A trivial Sonnet 5 session creates about 46,600 cached system-context tokens and costs about
   0.19 USD (Claude Code list-price figure). With AGDF context and Opus, 48 sessions will likely exceed
   the 25 USD cap.
4. Stream-json fields needed by SDD-008 are present: `result.total_cost_usd`, `result.usage`
   (`input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`),
   `result.modelUsage`, `result.duration_ms`, `result.num_turns`, `init.tools`, `init.mcp_servers`,
   `init.skills`, `init.slash_commands`, `init.plugins`; tool results carry `is_error`.
5. Claude Code loads MCP tools deferred (`ToolSearch`); tool definitions enter the context only after a
   search. The `mcp_only` flags (`--disable-slash-commands`, `disableAllHooks`) could not yet be verified
   against an installed AGDF plugin because of finding 1.

## Owner decisions (2026-10-16)

- The owner updates Claude Code before the native run so that Opus 5.5 and Sonnet 5.5 are recognized;
  the approved models stay unchanged.
- The 25 USD cap stays; an incomplete run is accepted and reported as such (PRD AC-015, TP risk).
- The native layer, including the remaining MCP-only verification, runs from an external terminal by
  the owner.

These decisions keep the approved UR, PRD, SD and TP unchanged.
