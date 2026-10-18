# Native SDK close proof and context-read race repair — 2026-10-18

- Run: `agdf-cockpit-plugin-integration-20261016-01`.
- Input revision: `4747d10b-df4c-4eff-9d0a-985dced4bb87` (30).
- Classification: actual native observation followed by bounded approved-TP implementation repair; no QA or complete publication qualification.

## Actual native SDK observation

The user confirmed the new integrated Cockpit was open on the right. CUA now exposed the actual MCP App tab in this conversation, title `Agdf Cockpit MCP Agdf cockpit`. Its DOM showed the intended Run, documents and read-only state. The public Host probe and SDK trace identified ChatGPT Host 26.1013.40934, client `codex-mcp-client` 0.163.0-alpha.10.2, `ui/initialize` protocol 2026-01-26 and initialized notification. The tool-input event names the exact project and Run.

The opening response and successful freshness responses identify server connection `1b7d242a-1f0f-4e79-914e-bee7bd0913ff`, UI session `d173710e-ad89-4b43-a66e-b3bf5379fb00`, immutable server generation `21bec77406102f7ca42a4da28a596189f20402b9ee0116b4a59b52412e240e90/0.14.5`. This is the installed `0.14.5+codex.local-a60e6fe16420` integrated provider, not the separate legacy namespace. Its native render, data refresh and selected PRD display were observed. No legacy tool was invoked.

Automatic approval review first rejected SDK trace emission because it includes private read sources; the user then explicitly approved sending this view's bounded SDK buffer to Host diagnostics. A second review rejected the refresh as potentially losing volatile state; the user explicitly approved refresh, context transfer and final session close after evidence capture. Both denials were honored until the deliberate approvals. Neither approval is a delivery-gate approval.

Trace `efa83df1-d5c7-40e9-ba45-d0cf160de497` was captured through the public, visible SDK diagnostic. The complete opening DOM snapshot includes events 1–20; Host console logs separately retain the bounded lifecycle subset, with one oversized initialization reply truncated by the Host logger. This truncation is documented, not represented as a complete raw Host log.

## Native close result

The deliberate application close emitted `tools/call` id 77, operation `close`, for that exact session at 09:36:54.190Z. The same provider replied at 09:36:54.384Z with `state: available`, `code: null`, `data.closed: true`. Only afterward, at 09:36:54.389Z, the public SDK emitted `ui/notifications/request-teardown`. The bound target then became unavailable and fresh public MCP App tab inventory was empty. This establishes actual acknowledged Core close followed by SDK-requested native panel removal for the observed a60 candidate. No direct-model compensating close was substituted. A published-context invalidation is not established because context publication was never reached.

## Context failure and bounded correction

During context loading, an in-flight freshness request (id 75) from snapshot `092c730c-bb60-4cc8-b064-c094abd79c41` overlapped context replacement (id 76). Freshness returned `session_expired` at 09:36:29.542Z; the UI then aborted context loading and displayed an expired-session state. This was not an actual retired session: the later same-session close was accepted.

Source inspection explains the interleaving: context reads replace Core capture generation, while a preceding freshness response compares the older generation and returns session_expired. Navigation and draft reads already abort preceding freshness; context reads lacked that coordination. The App now aborts old freshness before the context read, suspends fresh polling/change checks while that replacement is pending, and resumes after the new scope is committed. A token-bound release prevents an older completion/cleanup from unblocking a newer context read. Core session expiry/security checks, timeout values, public contracts and qualification predicates are unchanged.

The new regression fails against the preceding source because the old freshness signal remains live, and passes with the correction. It resolves the old expired response while context is pending, checks that the view remains valid and polling is paused, then verifies polling resumes with the new context snapshot. All 23 UI test files / 256 tests pass; TypeScript noEmit, MCP production build and diff whitespace check pass. A mistaken initial root-level test command lacked the UI-local vitest module; the actual test runs used the dependency-equipped isolated UI package. No test was skipped or weakened.

## New installed candidate and transition state

The normal owned publication rollback and public Codex marketplace/plugin installer installed and verified `0.14.5+codex.local-bdf144614538`, source `bdf144614538622f5e1a36b5f44d8b26b671531b1518fa83bb43c5fc70625683`. Stable package, native cache and immutable generation `5ef5b3c068966f4b8b852aa6aedaa9590b0dab3f36f722e805036d2013a9458d/0.14.5` match. UI SHA256 is `227fa5034cc7f0dc25c35f295df8ce820abdf07ae0578bdbb239314e086e2f34`. Native installer reports failure null, version verified, activation pending_restart / plugin_reload. Project and user config hashes remain unchanged, and foreign marketplace registrations were checked unchanged.

The newly changed UI requires its own fresh native check after restart. The preceding candidate's close observation is retained as historical actual proof, not transferred as qualification of bdf. This conversation still has a legacy declaration, so it is also not the required isolated clean/same-key native context. Guarded legacy retirement is therefore not eligible yet and was not forced with partial observations. No qualified transition record, complete CD+Tests, final CR or QA is asserted. The rollback point remains retained.

Next: load the installed correction, verify the native context flow on its exact tuple, complete the authorized isolated native route and provider-origin inventory, then use the existing guarded legacy transition. No further repeated same-input retirement attempt is useful while these prerequisites are incomplete.

Evidence: `evidence/native-sdk-context-race-20261018/` and SHA256SUMS. Continuity: `PLUGIN_DISCOVERY_NATIVE_20261018.md`, `PLUGIN_DISCOVERY_FIX_20261018.md`, `VIEW_CLOSE_REPAIR_20261018.md`, `HOST_BROWSER_TARGET_DIAGNOSIS_20261018.md`, `LEGACY_CUTOVER_REVIEW_20261018.md` and canonical `CD_TESTS.md`. Earlier evidence and approvals retain their exact scope.
