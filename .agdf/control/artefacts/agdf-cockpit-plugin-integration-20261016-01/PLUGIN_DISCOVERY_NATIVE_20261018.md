# Native plugin discovery after restart — 2026-10-18

- Run: `agdf-cockpit-plugin-integration-20261016-01`.
- Input revision: `db9a8475-0339-49bd-b85d-9e79e63304e7`.
- Scope: actual native tool discovery and invocation; not full rendering/teardown qualification.

Following the user-confirmed restart, the current native conversation exposes `mcp__agdf_cockpit__agdf_cockpit` and `mcp__agdf_cockpit__agdf_cockpit_read`, both attributed to the AI Governance & Delivery Framework plugin. The render schema requires explicit primary_target, working_directory and target_source. The legacy namespace is also still present; it was not invoked or substituted.

The integrated render tool was invoked with the established target `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`, target_source `continued_target`, same working directory and exact Run. It returned successfully with schema_version 1, authorizes false and target_id `sha256:a5c1daee7886f81d27b2b7718718fa7a3822b27a4bc1d057f99af01be7688a19`. The model-facing response contains only target metadata, so no server-instance or UI-session identity is inferred from that response.

Public MCP resource listing for server `agdf-cockpit` now returns `ui://agdf/cockpit/v1.html`, MIME `text/html;profile=mcp-app`, with the bounded UI CSP. This was empty in the previous missing-discovery state.

The supported CUA inventory after the call reports native apps empty and no tabs in the MCP Apps browser belonging to this conversation. Thus successful discovery/invocation is established, but an accessible native DOM, initialize trace, interaction and teardown are not yet established. This is not a failed integrated invocation and not a substitute for the full native TP evidence. The installed skill and dispatcher bindings point to `0.14.5+codex.local-a60e6fe16420`.

No configuration changes, legacy retirement or publication qualification were performed. Continue with the new integrated view when available through the public UI surface. The normal guarded legacy transition remains dependent on the complete native evidence.

Continuity: `PLUGIN_DISCOVERY_FIX_20261018.md` and its exact candidate, installed tuple, regression tests and unchanged config evidence; `HOST_BROWSER_TARGET_DIAGNOSIS_20261018.md` and preceding linked native lifecycle evidence. No historical observations are transferred as qualification of the current candidate.
