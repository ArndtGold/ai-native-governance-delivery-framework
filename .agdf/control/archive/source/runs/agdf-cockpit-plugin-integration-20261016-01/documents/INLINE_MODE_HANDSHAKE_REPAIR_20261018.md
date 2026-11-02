# Confirm inline mode before closed-card teardown — 2026-10-18

- Run: `agdf-cockpit-plugin-integration-20261016-01`.
- Input revision: `89c8f8aa-3e6c-4d5d-ad5c-e8b59e1e3809` (36).
- Scope: explicitly requested fix of unresolved retained-card presentation; existing TP, no new source authority or qualification claim.

## Defect and correction

The latest native b674393 attempt still flickered according to the user. Its successful cleanup is retained separately in INLINE_SIZE_NATIVE_FAILURE_20261018.md. The closed inline frame remains outside CUA access; neither a measured closed-frame height nor an exact Host-internal oscillator is claimed.

The previous path measured terminal content in fullscreen, requested teardown immediately and depended on a later Host display-mode callback to size the inline card. Teardown may deactivate that callback (the actual onteardown handler marks its view no longer alive), so that later adjustment was not a reliable transition. More observer changes or another post-teardown callback cannot establish a confirmed inline viewport.

The repaired close path reuses the existing public SDK and Core owners: confirm own publication invalidation and Core close; synchronously commit the terminal DOM; if the Host advertises inline mode, requestDisplayMode inline with a bounded timeout and require its returned mode to be inline; commit compact presentation; measure and await one terminal size notification; only then request teardown. Hosts without advertised inline capability retain the bounded original close path. An advertised-but-rejected or failed inline/size step shows an explicit presentation-failure message and sends no subsequent teardown or automatic retry; the already confirmed Core cleanup is not misrepresented as failed.

The two competing terminal-size layout effects and their per-session mode callback guard were removed. The SDK observer remains owned by the existing open-view layout effect and is disconnected on closing. The final measurement now has one sequencing owner in closeFromApp; repeated host mode updates neither restart reading/observation nor repeat final sizing/teardown. Gate Decision defaults are unchanged. No private Host API, custom Host protocol, source waiver or vendor patch was added.

## Verification

The retained-card regression requires order `close -> inline request/ack -> final size -> teardown`. Its fixture gives fullscreen geometry 518x900 and confirmed inline geometry 736x112, and asserts that the emitted final size is 736x112. The rejected-mode case permits only close/inline and checks the visible error with no size or teardown. Both cases verify exactly one retirement attempt and no observer restart/resumed reads after further mode changes. All 23 UI files / 259 tests pass. The strengthened final initial-run suite separately passes all 27 tests. TypeScript noEmit, MCP build and diff whitespace check pass. These are actual source/synthetic checks, not native proof that flickering has stopped.

The already authorized SDK diagnostic now retains public display-mode requests/correlated replies and at most one size notification after the first inline request in its bounded lifecycle console. A regression sends 100 extra size notifications and verifies the console does not accumulate them. The full bounded per-view trace behavior remains unchanged. This allows the next native attempt to distinguish unconfirmed inline transition from an incorrect emitted size without another speculative repair.

## Installed candidate and remaining work

Candidate `0.14.5+codex.local-7fe0f005673c`, source `7fe0f005673c559b4b0b1ad2be045d523cc7a6dbd8d72fe98043a912a6bfe5bd`, UI `sha256:5dc9be9ff8e28ca6235f10b06faa2e3590a17011f489368746af9aca8688547e`. Normal owned rollback, public marketplace/plugin install and exact stable/cache/runtime readback are retained in evidence. Activation requires plugin reload. A fresh native test must verify the inline acknowledgement, actual terminal size notification, teardown and human observation of the just-closed card; preceding attempts do not qualify changed UI bytes.

Legacy remains enabled, configuration unchanged, and the pending publication rollback point retained. No no-flicker claim, qualified transition, retirement, complete CD+Tests, final CR or QA is asserted. The complete provider-origin/clean-native requirements remain separate from repair of this particular presentation defect.

Evidence: `evidence/inline-mode-handshake-20261018/` and SHA256SUMS. Continuity: `INLINE_SIZE_NATIVE_FAILURE_20261018.md`, `INLINE_TERMINAL_SIZE_REPAIR_20261018.md`, `SDK_RESIZE_NATIVE_COUNTEREVIDENCE_20261018.md`, `LEGACY_CUTOVER_REVIEW_20261018.md` and canonical CD_TESTS.md. All prior observations and approvals remain bounded to their exact scope and candidate.
