# Per-view session source-impact assessment

User request: one running server per connection, bounded independent read sessions per view.

Current evidence: cockpit-session.js keeps one current session; render retires it. SD section 4.2 and TP SCN-022/042 explicitly require this behavior. This is a design revision, not a production defect correction within the old TP.

Earliest changed approved source: SD. UR/PRD preserve their local embedded reading/checked-question journey and delegate concrete capacities/lifetimes to SD. Exact upstream hashes and retained analytical applicability are bound in .agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/SESSION_REVISION_PROPOSAL-8c3a58a6-3484-44d9-a4f2-0b8146812e47.json. SD and TP must receive new deliberate approvals; preparation, CD+Tests and CR fulfillment reset. Existing implementation/test evidence remains historical.

Reviewed direction: four ephemeral sessions maximum, no replacement of existing views on render, per-view close/expiry and resource identities, per-view capped capture/worker ownership and one publication owner per connection until confirmed host invalidation. Resource exhaustion must not silently evict another view. Unknown host invalidation blocks further handoff but does not disable independent reads. Browser/default MCP ownership remains unchanged.

Source owner reuse: Core cockpit session/contract/read worker, existing focused frontend handoff/bridge/reducer and owned assembly/test paths. No canonical writer, new public connection, persistence store, host adapter or dispatcher.

Protocol source checked 2026-10-06: https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx, ui/update-model-context. Host updates/acknowledgements do not prove a current answer; multiple-view context behavior must be observed. The conservative exclusive publication owner avoids assuming a shared global UI queue or reliable overwrite scoping across separate iframes.

This assessment grants no approval or implementation permission.
