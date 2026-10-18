# Retained inline card flicker correction — 2026-10-18

- Run: `agdf-cockpit-plugin-integration-20261016-01`.
- Input revision: `945b1eb3-5b01-4189-960f-adda17e77851` (31).
- Scope: approved-TP defect repair; no altered acceptance, gate authority or qualification waiver.

## Native result before this correction

The integrated bdf candidate was actually opened in the native right panel. SDK trace `283c44c1-6da7-4102-b6c7-a67fd1071980` identifies connection `539a34d6-d435-4d25-a36f-99620205476b`, session `1f201b9f-8c20-4c59-8b6f-19fd3ce40ab2` and the exact immutable generation `5ef5b3c068966f4b8b852aa6aedaa9590b0dab3f36f722e805036d2013a9458d/0.14.5`. The visible intended PRD and its context loaded without the preceding false-expiry failure. `prepare_context` and `validate_context` succeeded; `ui/update-model-context` id26 received Host updateId `9ec160ab-581d-43d9-add9-9a458f5d9515`. The UI displayed the Host-confirmed context state. No question/message was sent.

On deliberate close, invalidate_context id38 returned invalidated:true, host_publication_required:true, token `cf45b9f9-be06-493b-ba7e-8c70c8252996`; ui/update-model-context id39 published current:false and received updateId `7afc5929-c77d-4a9d-bc8c-70fa92726d57`; complete_context_invalidation id40 returned completed:true; close id41 returned closed:true. The same provider answered throughout. Only then SDK notification request-teardown was sent (sequence67). Public CUA panel inventory became empty. This is actual published-context cleanup and native panel removal for bdf, without a compensating model close. Host console retains a bounded lifecycle subset with three oversized log rows truncated; retained raw lines and parsed events state that limit rather than claiming a complete trace.

The user then reported flickering of the retained inline card and supplied its screenshot. It shows the closed-state message plus a diagnostic overlay. Panel removal is not proof of removal or stable layout of the inline card.

## Located application trigger and correction

EmbeddedEntry rendered HostProbe whenever the Host reported expanded mode, including after closeState had left open. Thus subsequent Host display-mode updates could remount the live diagnostic and its growing SDK trace in a closed card. This is a demonstrated application lifecycle defect and plausible contributor to the reported flicker; no native frame-timing or general Host defect is asserted.

HostProbe now mounts only while closeState is open and expanded. As closing begins, its subscription and diagnostic DOM are removed; the closed card contains only its stable close status. SDK instrumentation at the bridge remains active for the already-authorized lifecycle capture. This does not alter context invalidation, Core close acknowledgements, public SDK teardown or Host control of whether the inline card remains visible.

The regression drives explicit application close, retains the component as the Host does, and alternates inline/fullscreen/inline. It verifies no diagnostic remount, no resumed source reads, exactly one Core close and exactly one SDK teardown request. All 35 tests across initial-run, host-probe and view-close pass; TypeScript noEmit, MCP production build and diff whitespace checks pass. These are source/synthetic tests, not a native no-flicker claim.

## Installation and remaining qualification

The normal installer candidate is `0.14.5+codex.local-8c449837ef88`, source `8c449837ef888436840ef3d4304f794128dea0b70f1f18dbb3c14878a6e70378`, UI `sha256:d35318c874e5f631125100a273e61f966a7932a7502d6ae36e0d7ae98785349a`. Exact installer/cache/runtime readback is retained alongside this note. Activation requires the Host to reload the plugin; a new native observation must verify stable retained-card behavior. The bdf result remains historical actual evidence and is not transferred as qualification of the changed UI.

Legacy configuration remains unchanged and enabled. No qualified publication, clean-context/origin-completeness claim, legacy retirement, final CR or QA is asserted. The guarded transition remains dependent on matching final-tuple native observations and complete provider inventory, not merely a passing synthetic test.

Evidence: `evidence/closed-card-fix-20261018/` and SHA256SUMS. Continuity: `NATIVE_SDK_CONTEXT_RACE_REPAIR_20261018.md`, `PLUGIN_DISCOVERY_NATIVE_20261018.md`, `PLUGIN_DISCOVERY_FIX_20261018.md`, `LEGACY_CUTOVER_REVIEW_20261018.md` and canonical CD_TESTS.md. User authorization for SDK-buffer diagnostic transmission and explicit test close remains the same scoped test authorization, not a gate approval.
