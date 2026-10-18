# Public SDK teardown: implementation, verification and installed checkpoint

Date: 2026-10-18
Run: agdf-cockpit-plugin-integration-20261016-01
Observed revision: c1262fc2-1d99-4191-8ec9-91b53c51f70c (24)
Authorizes: false
Native qualification: pending

The user explicitly requested a native teardown test through the public SDK call followed by legacy migration, under the existing TP approval. This supplement records the bounded necessary diagnostic implementation and normal installation. It changes no approved source, gate permission, migration predicate or context/session ownership.

## Bounded implementation

The existing HostProbe exposes “Beenden beim Host anfordern” only with the trace diagnostic and enables it after deliberate recording. One click calls the public App.requestTeardown(), sending ui/notifications/request-teardown. Sending, sent and failure states do not claim Host acceptance or completed closure. The action remains disabled after its attempt and never retries automatically. It does not itself invalidate context, call Core close, send a question or invoke a private Host API. The existing onteardown handler remains the sole application cleanup path.

Opt-in bounded trace output now uses console.warn so that the native Host warning log can retain the packets if it removes the view. App.sendLog remains unchanged. Durable native capture must still be observed, not inferred from that level. Before deliberate recording only initialization is retained in memory; no new external logging destination or control writer is added. The architecture document explains these limits.

## Verification

- 248 component tests passed, including two new tests for one-shot public teardown and send failure without false acceptance. The focused probe/handoff/trace selection passed 26 tests. Typecheck passed.
- MCP build passed in both the isolated verification copy and normal installer source with matching final resources. The final Cockpit HTML has 1239590 bytes, SHA256 3524697a2bf6157279c6c6aa670c8c5395e0155e557bd8d4ccfb622e397b4c11, UI source digest 18fb1da2c0213f1a4825007170e3511a4da09b34061d6188fce9dfd0de0356b0. Decision HTML remains SHA256 6d7e10586a1fc46eacd56b990e37e1774e1607147a4bd6a81ba066f7c61ecaef.
- The selected 27 browser regressions passed. After strengthening the public-call test to publish context first, its final rerun passed (1 test, 7.0 seconds). It clicks the actual diagnostic button, observes the public notification, a synthetic Host teardown request, two acknowledged model-context updates, Core invalidation completion before session closure, teardown reply and rejection of another read with session_expired. Provider correlation and unchanged fixture control bytes are checked. This is real built UI/SDK/Core under a synthetic Host, never native Desktop qualification.
- The final warning-level resource was loaded by the SDK case in the regression run and the strengthened final SDK rerun. Unrelated journey cases passed unchanged. No test assertion, timeout, source owner, server or migration validator was weakened. A fresh 26-stage repository-wide canonical run was not repeated for this bounded UI diagnostic increment; prior broader source evidence remains historical and is not transferred as fresh qualification of the changed candidate.

## Normal installation and retained migration state

The tested candidate was prepared with the normal snapshot and marketplace owners. The pending dc02 publication was rolled back through settleCodexCockpitPublication(action=rollback), restoring the exact owned fb1 source before the new publication. The existing public Codex CLI refreshed only the registered local AGDF marketplace; foreign marketplace rows were unchanged. The regular local Codex installer then installed version 0.14.5+codex.local-a37fccf9eb2b.

Source digest: a37fccf9eb2b8cf303a43a69e3b2bc279e114bd4bf588bc4ad98c9e550264022.
Core runtime digest: 7c746260ba2447d1d5322072c4ef40a2dce360ff264bc473f4302547009029b2.
Server digest: 20f14b7fec228c7f98b77bb0994fdabc410aa97dc63aad8519ab0e29e23dbeb2.
Dispatcher digest: 41c93fd4a43388e873187c6f5364e7b570503b03921b4cd30352e82e5c090edc.
SDK digest: b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb.
Immutable runtime generation: 4ade72c5c11601d9e6835d985b0c689ff885aff16e4c63ac85855a5a654cdbcd/0.14.5 under the normal codex-plugin MCP data directory.

Marketplace, native plugin cache and prepared immutable runtime identities match the candidate and final UI. Installer exit 1 means structured result partial, failure null, installed version verified and activation pending_restart. It does not mean native activation or migration completed. Project and user configurations are byte-identical to the before hashes, including the actual agdf-cockpit-local registration. The new qualification-pending publication and original owned rollback backup remain retained.

## Exact native blocker and next action

An opening call was attempted after installation. Supported MCP-App inventory still exposed the prior tab 4, whose Core session had already been explicitly closed in NATIVE_TEARDOWN_DIAGNOSIS_20261018.md. No fresh diagnostic view or native public SDK request was observed. The installer requires a Desktop restart; the available supported tools cannot restart the native Codex app or operate its shell. An installed file comparison cannot activate the new provider or replace native protocol evidence.

After native activation, open a fresh exact-target/exact-Run Cockpit instance, verify its actual loaded module and provider against this tuple, enable recording, publish/read the selected context, invoke the public teardown button and collect the resulting native Host packets and Core outcome before any compensation. The public notification may be ignored; sending it alone never qualifies teardown. If the Host keeps the view, retain its trace. If it removes the view, collect the exact observed trace/App/init IDs from its bounded warning-log subset. Do not reuse prior candidate success as proof.

Only a valid exact-candidate transition record with complete provider/origin inventory may retire the real legacy registration through its normal owner. CPI-E01, CD+Tests revise and the remaining native scenarios stay open. No legacy retirement, final publication settlement, mandatory final CR, QA, UAT, OR, VCS commit, push or release is asserted.

Evidence: evidence/public-sdk-teardown-20261018/ (source snapshot, final synthetic packets, verification summary, candidate/installed tuple, installation steps/results, config hashes, rollback receipt and checksums). Previous diagnosis and source-only review remain linked through NATIVE_TEARDOWN_DIAGNOSIS_20261018.md and LEGACY_CUTOVER_REVIEW_20261018.md. Earlier successful native observations apply only to their exact old tuple.
