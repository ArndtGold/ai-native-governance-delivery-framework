# Host Feasibility — T-006

- Status: unqualified; current connection cannot render.
- Date: 2026-10-05
- Host: Codex desktop on macOS; exact build/version not captured.
- Connection: agdf-cockpit-local, project-local, explicit target /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework.
- Registered command/arguments/cwd read back successfully with codex mcp get agdf-cockpit-local --json. Enabled=true.
- Resource: ui://agdf/cockpit/v1.html; 613427 bytes; sha256:f27559b7b057552331572d46e679adfc61da2e808ecce3b3043d2ca2043ec163.
- Runtime identity: server d24b084e223998e3ace427d02ec1d8be7691b7ee1c57bd130a378af099c06d2f; dispatcher 869727f0703b980c812c26ae987f98998f0dad25881a3f06664820e452d47b1c; SDK 02e7212cc00a844c08ac190c572b98dd9aa52671936cb4900808460d44c543d9.
- Actual host tool handles became available for agdf_cockpit and agdf_cockpit_read.
- Two actual native agdf_cockpit calls following the scoped runtime reconnection both failed: tool call failed for agdf-cockpit-local/agdf_cockpit; caused by Transport closed. No session/bootstrap result or rendered app was obtained.
- A stale current-turn MCP client after the named process replacement is a plausible explanation, not a verified cause. Fresh independent stdio clients passed; this does not prove native UI operation.
- Unknown: host bridge protocol/capabilities/display modes; App initialization and host version; actual resource load and larger surface usability; updateModelContext and separately deliberate sendMessage outcome. No screenshot or native success evidence exists.
- Synthetic bounded neutral probes are implemented for a deliberate interactive feasibility test. They have not been executed in Codex and do not qualify production packet semantics.
- Next: establish a fresh host MCP connection (reload/reopen as supported), invoke agdf_cockpit, observe resource load and display modes, then deliberately run labelled context and neutral question probes. Capture exact capabilities/version/responses/rendered observations. Reload is an attempted recovery, not a guaranteed fix.
- Approved TP requires stopping dependent T-007 onward feature work while this checkpoint is unqualified. Browser/mock/stdio success cannot bypass it. No QA or UAT readiness.

## 2026-10-06 update

Actual native render and larger panel/read path succeeded before the entry refresh. Context and question remain unqualified because the test control was obscured by the old sidebar; the attempted click was rejected without execution. The sidebar defect is corrected in source and the newly prepared resource. After refresh, native render again returned Transport closed. Full T-006 is not passed. See ENTRY_CARD_FIX.md for separate pre-update native and post-update layout/protocol evidence and exact final identity.
