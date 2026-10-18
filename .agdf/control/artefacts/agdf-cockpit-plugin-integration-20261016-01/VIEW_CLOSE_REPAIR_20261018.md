# Cockpit application-owned close repair — 2026-10-18

- Run: `agdf-cockpit-plugin-integration-20261016-01`
- Input revision: `29a50a2f-5591-4a70-a99c-b7cf14f8dd59` (26)
- Classification: implementation and test evidence; not native qualification, CR, QA or approval.
- User instruction: “Fix it” after the recorded public SDK close result.

## Cause and bounded repair

The public SDK `App.requestTeardown()` is a notification. In the preceding actual native attempt the Host returned the panel to inline; it did not end the Core view. The Cockpit had depended on a later `ui/resource-teardown` callback to release context and close the session. Native Host warning output also reached its 50-message cap before the close action. See `NATIVE_PUBLIC_SDK_TEARDOWN_RESULT_20261018.md` for the actual observation, independent compensation and guarded legacy refusal. Its results remain unchanged.

The explicit Cockpit close action now waits for the existing handoff controller's confirmed context invalidation, then sends one close operation bound to the original session and verifies the target-bound Core acknowledgement. Only after this confirmation does it send the public SDK teardown notification. The working App is removed while closing, stopping its reads and interactions. Failure leaves a blocked view with no automatic close retry or Host close request. A Host callback joins the same close operation, avoiding duplicate retirement. A forced Host teardown retains existing Core owner-loss quarantine behavior when release is uncertain. An immediate callback before React renders a newly delivered session binds directly to that session; no empty or old binding is retired instead.

This reuses the existing handoff and Core owners; it adds no Core write, session registry, private Host RPC or approval authority. Approved SD context ownership and confirmed release requirements are preserved. The Host may still display a terminal card after cleanup. Actual `ui/resource-teardown` and resource disposal remain separate observations and are not claimed by the new close action.

Console output now selects initialization, context lifecycle and close packets with correlated replies. Polling no longer consumes the Host's warning allowance. The existing bounded full trace and public SDK log retain the full captured stream. Host persistence and completeness remain unproven until observed.

## Checks

- Component suite: 254 tests / 23 files passed before the final immediate-teardown guard.
- Final focused tests: 32 passed; final initial-run suite: 25 passed, including the new before-render callback case.
- Final TypeScript check and UI builds: passed.
- Built final UI + actual SDK + actual Core, synthetic Host: three passed cases — Host accepts teardown; Host ignores teardown; Host rejects context release. Positive cases confirm context completion before Core close, Core close before Host notification, one retirement, and subsequent `session_expired`. The rejected case sends neither Core close nor Host teardown notification. These are not native evidence.
- Nine browser regressions for scoped reading, changes and Run documents passed.
- `git diff --check`: passed.
- Source inspection covered immutable session binding, target validation, shared normal/forced close, uncertain-result handling, SDK-only Host interaction, and diagnostic limits. This is preparation, not the mandatory final CR.

## Installation

Installed `0.14.5+codex.local-a861cbf8a2a8` through the regular installer, after the existing owner rolled back the unqualified a37 publication. The original fb1 recovery point remains owned. Foreign marketplace registrations and project/user MCP configuration hashes were checked unchanged.

- Plugin source: `a861cbf8a2a85cf0a5eb226d67a3fcb562c25e8b29ed4ff6cb302fa0b4e2d2ff`
- Cockpit HTML: `sha256:f168f2af970a9606b9390c09222f301bc91491ff5bb3cbf2d40d7f62b8c1c005`
- UI source: `sha256:2d749b0748ea396ad85d6ebf6fd909755a1057b53c30c898da09c35b254f6c13`
- Marketplace and cache provenance: matched.
- Published runtime: matched; generation `f281d2ad82e552ab07a6bc1ac2e3a3a72107bc6c8125adf4044cfdfea8ba6364`.
- Installer outcome: structured partial, failure null, version verified, activation `pending_restart`.

The currently connected MCP still reported the a37 generation after installation. No claim is made that the running Desktop loaded this fix. A new Desktop connection after restart is required for actual proof.

## Continuation and preserved limits

Evidence directory: `evidence/view-close-fix-20261018/`, including candidate/installed identities, hashes, transaction result, test summary and real SDK/Core synthetic-host traces. Earlier evidence remains linked through `NATIVE_PUBLIC_SDK_TEARDOWN_RESULT_20261018.md`, `PUBLIC_SDK_TEARDOWN_PREPARATION_20261018.md`, `CLI_LIFECYCLE_EVIDENCE_20261018.md`, `CODE_REVIEW_SOURCE_20261018.md` and `LEGACY_CUTOVER_REVIEW_20261018.md`.

After activation: verify the newly loaded native provider/build tuple; capture initialization, deliberate context publication and acknowledgement, invalidation/completion, Core close and expired-session result; separately report actual Host teardown behavior. Complete the native provider/origin inventory. Submit only truthful complete evidence to the existing guarded legacy retirement owner. Until then `agdf-cockpit-local` remains enabled, CD+Tests remains revise, and mandatory CR/QA remain pending. No qualification flag, sealed historical report or approval was altered to pass the migration guard.
