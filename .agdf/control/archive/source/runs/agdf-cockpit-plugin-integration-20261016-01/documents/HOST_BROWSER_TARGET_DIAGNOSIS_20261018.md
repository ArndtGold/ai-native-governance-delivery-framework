# Native browser-target access diagnosis — 2026-10-18

- Run: `agdf-cockpit-plugin-integration-20261016-01`
- Input revision: `04f4b4f3-74fc-4c0c-8e45-a6890ba236d0` (27).
- Classification: actual access failure and source diagnosis; not a qualification, CR, QA, or source waiver.
- User intent: continue native proof and legacy transition; then “fix it” after the access failure.

## Actual result

The user explicitly confirmed the new Cockpit card was open on the right in the previously authorized projectless test chat `01a14a53-1091-7fa1-9145-287353b8dac1`. Its supported CUA inventory still returned `apps:[]` and both MCP Apps and IAB `tabs:[]`. The metadata correctly bound the browser to that test chat. Repeating the inventory after supported `navigate_to_codex_page` foregrounded that same chat yielded the same result, at 08:09:46.859Z. The human visual observation is not contradicted: the automation interface did not expose a target for that view.

The original conversation's CUA exposed its separate Legacy tab. Its DOM module SHA256 `08da0cf3f858df7495f0a656d8d70d8a93bfbf4890a623274526e7a6bd20a79c` matches the retained legacy runtime and differs from the installed plugin module `b5101a968897fb3f837c29735787057ff79518ce6a4a32d9272915440c2649dd`. It was not substituted for the new plugin proof. The native clean-chat tool and resource inventory independently showed the plugin render/read pair without the legacy server; one exact-target/exact-Run opening call and resources/read succeeded. This proves those available operations, not loaded DOM/SDK identity or teardown.

After the user's confirmation, the new card was not reopened, no context was published, no close button was invoked, no direct close or compensating action was sent, and no expired session was asserted. The test chat verified its seven selected configuration/Run/TP paths unchanged. Original project and user config hashes remain respectively `20b1eec99e1540fdf118b046c6a132507f9ab5c4cfa6dafc2e0851a8149b89a8` and `0155a9c155fecdba26b1c9a5e595832c3ee0175fdfbb7aed569182d5c5d52b17`.

## Located Host boundary

Read-only inspection of installed Codex Host 26.1013.40934, build 20770, locates the native browser boundary:

- The Host's `mce` registration creates a browser target for the sandbox, owner web contents, init ID and mapped conversation. It can return null when the matching live guest is absent.
- Its `_ce` listing returns only sandbox targets whose owner, conversation and live guest match.
- Its MCP Apps backend `getPages` resolves the task's window/conversation route, then calls that listing. The list is obtained dynamically, rather than being a stale SDK trace buffer in AGDF.
- The Host widget's `Xs` effect requests this registration only with its feature flag, panel-tab binding, conversation and Host sandbox bridge. That bridge and route are Host-owned.

This bounds the failure to target registration or route/guest matching in the Host. It does **not** prove which internal value failed, a live registration race, or a general Codex regression. The relevant source excerpts, module digests and offsets are retained. They were only read; no private Host RPC, CDP workaround, hidden SDK state, shell GUI action, bundle edit, feature-flag change or permission bypass was used.

The available public Cockpit SDK/CUA operations do not provide an operation to register or repair this missing Host browser target. Reading the documented browser troubleshooting guidance provided no supported alternate access to an unlisted view. Official OpenAI documentation was searched and the official changelog opened; its general browser/right-pane fixes do not establish a remedy for this exact observation. No unsupported workaround was inferred from them. A separate bounded CLI origin probe returned unavailable; that is neither a native observation nor proof of a specific Host or permission defect.

## Repair and continuation status

The application-owned context/session-close correction remains installed at `0.14.5+codex.local-a861cbf8a2a8`, with its successful automated evidence in `VIEW_CLOSE_REPAIR_20261018.md`. No new AGDF production-code defect was demonstrated by this access diagnosis. Altering the Cockpit or repeatedly reinstalling it would not be a demonstrated repair of Host registration. The remaining access problem was **not fixed** in this session.

Native DOM/initialize/context/close proof remains unexecuted for this new attempt. Complete provider/origin coverage is also not established by the configuration-only inventory. No qualified transition record was created. The actual legacy section stays enabled, the pending publication and rollback point remain retained, and CD+Tests remains revise. Repeating the already-rejected retirement with the same missing qualification would add no valid evidence, so the guarded operation was not repeated. The approved criteria, historical reports and validators were not weakened to force progress. Final CR/QA remain pending.

Next supported recovery requires an exposed native browser target or a Host-side correction that restores registration/routing; it is not another request for the user to repeatedly open or close the same card. After such access exists, capture the new tuple and required native interactions, then use the normal guarded legacy owner and final normal-context checks.

Evidence: `evidence/host-browser-target-20261018/`, with SHA256SUMS. Continuity: `VIEW_CLOSE_REPAIR_20261018.md`, `NATIVE_PUBLIC_SDK_TEARDOWN_RESULT_20261018.md`, `CLI_LIFECYCLE_EVIDENCE_20261018.md`, and `LEGACY_CUTOVER_REVIEW_20261018.md`. No earlier success is transferred to this attempt.
