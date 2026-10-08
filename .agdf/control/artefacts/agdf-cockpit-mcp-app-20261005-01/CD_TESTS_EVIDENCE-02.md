# Renewed initial Run opening and compact card verification

- Status: in_progress; minimal T-004/T-005 work implemented and verified, current native SCN-045/T-006 open.
- Source: newly approved SD/TP and BROWNFIELD_ANALYSIS-02.md, baseline IMPLEMENTATION_BASELINE-02.json.
- Scope: optional strict run_id flows through existing Core contract/parser, runtime/session and scoped initial_run_id bootstrap to the shared React initial route. Core ordinary snapshot membership/run read validates focus; render does not capture inventory. Empty input preserves overview. Missing/unavailable identity stays visible and no alternate is selected.
- Lifetime: scoped render_generation rejects old bootstrap; new session remounts/cancels reader and clears document registrations. Delayed old-session transport results are rejected. Ordinary display-mode changes preserve instance/selection. Unmounted entry ignores later render callbacks. Existing read generations also check cancellation before issuing dependent reads.
- Authority: opening has no context/message/approval/dispatch side effect; strict malformed/extra/foreign inputs are rejected. Actual fixture byte invariance passes. Initial routing adds no URL/storage persistence, graph store or evaluator copy.
- Owners: cockpit-contract.js, cockpit-session.js, mcp-dispatch-runtime.js, shared App/reducer/transport. EmbeddedEntry.tsx and bootstrap.ts extract the existing entry lifecycle for scoped validation and direct behavioral tests; main.tsx remains only mounting/CSS. Test owners are Core session, real stdio and private React suites. README describes empty/named input and fresh descriptor requirement.

## Checks and their evidence classes

INITIAL_RUN_VERIFICATION.json records final results and exact prepared tuple. Seven Core-session, five Core-projection, 27 UI, five loopback-service and three real browser journey tests pass without skips. Type checking, browser and MCP builds, complete existing MCP-server suite, named-config preservation test, package-contents and payload-budget checks pass. An intermediate UI rerun exposed readiness races in existing tests; they now await enabled selection/effect flush, without weakened behavior assertions. Final 27-test suite passes.

MCP_PROTOCOL_EVIDENCE-02.json records fresh actual stdio discovery/read/no-write/strict schema/session supersession/default-mode parity for 2025-11-25 and 2026-07-28. This verifies the production updated runtime, not native host UI. Prepared UI 983715 bytes (sha256:08e8923bac3ceb79d3bbd15c9f36aee6052956181dfab2ab6082dab7a82f4454) remains below 4 MiB; server cb81b9820ff7b21761d7aa453d7caefb30d4f99302234377270946af9c609521.

ADAPTIVE_LAYOUT_OBSERVATIONS-02.json records real browser card geometry: 320/560/800/1280px viewports have identical scrollWidth, cards 304/528/768/1068px, stack narrow and use 426/284 and 606/404 columns wide. Original Pages logo/background/fonts/tokens remain the shared owner. Earlier full source/detail geometry and current three real browser journeys support reading and keyboard navigation; native widths are separate.

HOST_FEASIBILITY-02.md and NATIVE_PROBE_RECORD-02.json record actual pre-refresh native context acknowledgement and deliberate neutral question accepted by the host, with 2,899 unchanged canonical control files. These synthetic probes are not the final production source packet/question or a checked model answer.

## Scoped review and remaining obligations

Cooperative implementation inspection confirms one wire owner, no eager/duplicate render capture, scoped selector generation, ordinary read validation, and explicit unavailable identity. This is a partial source review, not formal CR, QA or completion of all 46 TP scenarios. T-001 is renewed; T-004 initial focus and retained compact layout have current tests; T-005 prepared output is ready. Native direct opening SCN-045 remains unqualified because the current transport closed after replacement and the cached tool descriptor is old. The actual synthetic capability observations reduce the previous context/message gap but cannot qualify a newly loaded native resource.

Keep CD+Tests in_progress and full T-006 partial. Do not start extensive graph/packet/handoff work before a fresh native descriptor/resource/read/display checkpoint. Full mapped compatibility (including complete Copilot profile), graph knowledge reconciliation, final no-write/source-question journey, formal CR/QA/UAT/OR remain open. No VCS/release action performed.
