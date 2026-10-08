# Remembered Follow-up: Read Sessions per Cockpit View

Date: 2026-10-06. Source Run: agdf-cockpit-mcp-app-20261005-01. User asked to retain this proposal while requesting closure.

## Desired outcome

One running MCP server per connection should support an independent bounded, ephemeral read session for each cockpit view. Opening another card should preserve existing visible cards. Separate server, UI and session lifetimes; ordinary Run/document navigation and gate refresh should not restart the server.

## Verified current state

The current canonical packages/core/lib/control-inspect/cockpit-session.js retains one current session; render retires it. Session expiry (30-minute idle/eight-hour lifetime) and explicit close release its worker and registered document state. Core remains the read owner; explicit Run-ID binding, snapshot freshness and no write/approval/message on opening remain invariants. Current transient-error retry keeps the requested route. New render remounts the reader after expiry.

## Future scope and evidence

A separately scoped follow-up would define view/session ownership, bounded simultaneous workers and total retained bytes, independent per-view close/expiry, isolation, restart/disconnect recovery and stale-result rejection. Tests must cover two active views, opening and closing either without invalidating the other, exact Run/document isolation and limits. Current multi-session support is not implemented. No new Run or implementation approval is created by this note.

Evidence: [Scoped defect corrections](CODE_REVIEW_FIX_EVIDENCE-01.md), [verification](CODE_REVIEW_FIX_VERIFICATION-01.json), and canonical [MCP adapter context](../../CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter).
