# Native panel evidence — 2026-10-18

Status: partial
Gate effect: CD+Tests remains revise; no QA, migration or completion authority.

## Actual native observations

The user opened the actual Cockpit on the right. Current-chat CUA inventory exposed tab 3, title `Agdf Cockpit MCP Agdf cockpit`. The native DOM and screenshots show the explicitly bound Run and its registered documents. This supersedes the earlier inaccessible-view observation for this particular panel; it does not rewrite its historical record.

- Actual SDK `ui/initialize` request/reply and `ui/notifications/initialized` are captured. Host reports `chatgpt` 26.1013.40934, protocol 2026-01-26; MCP peer reports `codex-mcp-client` 0.163.0-alpha.10.2 with io.modelcontextprotocol/ui MIME types.
- Trace ID: `4cf918be-c39d-4efd-8b42-9a987b22ac07`; Core view session `4032a7d7-5f13-4e6f-bda4-9c59398c3f22`.
- Actual opening metadata and all captured provider-bearing read responses correlate to SDK server instance `57360ba7-af0f-4266-a923-fd8bd40316c8`, version 0.14.5, immutable installed generation `511e28ab67dc4d925b967a272ce4fe4cf79a14d72ebbdb8aaeede5b880f361a2`. This is server-issued instance attribution, not a host-assigned connection ID.
- Native document interaction returned the complete approved TP through the view-bound reader. Its SHA-256 `f9c6449def46da1b2dd05b46dad738e19718c47fb40edf7baa484c9c39b2166d` matches the local exact approved source. Trace request 21 / response 24.
- Native prepare_context and validate_context succeeded. Host context publication request 49 / reply 52 contains actual updateId `b15eb493-29af-42b0-b2e0-dd1c5f381a18`; DOM confirms the host acknowledged context. No question/message was sent.
- Closing the document caused actual invalidate_context, publication of invalid selection and complete_context_invalidation. Host update request 76 / reply 81 has updateId `d543683c-7e4b-410a-8391-3a42e65b58fb`; Core completion request 82 / response 83 confirms invalidation completed. This clears selected context, not the view session.
- The actual Neu laden button produced a new native snapshot, request 113 / reply 116, then returned to the available Run view.
- Saved trace has 128 events and truncated:false. Raw DOM snapshots, PNGs and full trace snapshots are retained under evidence/native-panel-20261018; trace-analysis.json is derived, non-authorizing analysis. Source/config readback matches previously recorded hashes; no complete filesystem before/after inventory was captured for this newly available view.

## Remaining obligations

- Native ui/resource-teardown request/reply and Core session close are NOT observed. The view remains open. Document close/context invalidation is not native view teardown. Available MCP-App tab API exposes no supported close action. Bounded host-log collection found no matching trace lines; durable logging export is not established.
- This is the existing project chat that still offers the legacy provider. It does not complete the separate clean-context scenario or the unsupported isolated same-key/disposable lifecycle scenarios.
- N-CLEAN, N-LEGACY, N-SAMEKEY, N-LIFECYCLE and native regular Decision/Cockpit coexistence are not marked complete. CPI-E01 remains open with these narrower missing observations; actual rendering/read/context proof is now present.
- The approved TP requires matching complete native proof before legacy retirement. No retirement, journal settlement, later-gate CR completion or source approval was performed. Existing TP approval remains valid.

## Next permissible action

Capture actual native view teardown and session closure through a supported host observation/export path; then complete the remaining isolated/disposable native scenarios before the guarded legacy transition. Preserve the current working legacy configuration while proof remains incomplete. No synthetic host or CLI result substitutes native proof.
