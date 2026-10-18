# Native inline-size correction failed visual verification — 2026-10-18

- Run: `agdf-cockpit-plugin-integration-20261016-01`.
- Input revision: `85ef7d39-7efa-448f-9a25-c6ba8f573cfb` (35).
- Result: native retained-card visual check failed; no new code repair or installation.

The new b674393 candidate was actually opened in the right panel. SDK trace `8040a13c-11e4-4c6f-a347-793498ba7121` identifies connection `fa0bc5a2-b4f9-43d5-b8cb-0acc666c2c2b`, session `101d7c43-dcb7-4f5a-bb5b-ea1109aac116` and immutable server generation `62d746e778cd0da199d309ed0fc55167a7b267da33601f83dcdc10d25fa3ff40/0.14.5`. The intended PRD loaded; an initial automation wait timed out during the asynchronous document replacement, but a fresh DOM snapshot confirmed successful loading. No duplicate navigation was sent. Context then loaded, publication was visibly confirmed by the Host, and the deliberately authorized close path ran. Fresh public CUA panel inventory became empty. The bounded Host trace is retained, with oversized console rows potentially truncated rather than treated as a complete trace.

Asked specifically about the just-closed new card, the user answered that it remains large or flickering, and subsequently clarified that the last closing still flickers. Therefore the terminal-layout commit/inline-size correction does not establish a native fix. The passing synthetic tests and successful SDK cleanup do not override this human observation. The next supported action is diagnosis of the actual closed inline geometry/Host transition, not another speculative source patch or repeated installation.

The invalid-selection context notification from the MCP App is non-authorizing data consistent with deliberate invalidation. It grants no continuation, qualification, gate approval or authority to retire the legacy provider. The legacy route stays enabled; complete native qualification, guarded transition and final CR/QA remain pending. No current source change, new install, configuration mutation or retirement was performed in response to this failed visual check.

Evidence: `evidence/inline-size-native-failure-20261018/` and SHA256SUMS. Continuity: `INLINE_TERMINAL_SIZE_REPAIR_20261018.md`, `SDK_RESIZE_NATIVE_COUNTEREVIDENCE_20261018.md`, `SDK_RESIZE_CLEANUP_REPAIR_20261018.md`, `LEGACY_CUTOVER_REVIEW_20261018.md` and canonical CD_TESTS.md. Earlier reports remain unchanged and retain their exact candidate/test scope.
