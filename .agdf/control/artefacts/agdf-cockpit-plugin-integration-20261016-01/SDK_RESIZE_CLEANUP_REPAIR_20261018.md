# Retained-card SDK resize lifecycle repair — 2026-10-18

- Run: `agdf-cockpit-plugin-integration-20261016-01`.
- Input revision: `641e88e1-6bf4-4712-a01f-887d6d045fa2` (32).
- Scope: continued approved-TP implementation defect; no source waiver or qualification claim.

## Native result and counterevidence

The actual native 8c449 candidate was observed in the right panel. SDK trace `e1978ebc-f2e2-4076-88c5-a63e0b036e56`, connection `4faad589-7add-4a01-befe-74c6351a73d3`, session `edd54e85-b52c-48f4-9088-10e88d17d8c0` identifies immutable generation `70a6742b2b6f71551f58da162a1f11eb031e1197f20cfd619b43d059fb20201f/0.14.5`. Its intended PRD/context loaded and the Host confirmed context publication. The same provider then confirmed invalidation token `63f1b5a4-fa14-43ea-9011-0ac9b8d7ce60`, the Host acknowledged current:false, Core completed invalidation, and Core close returned closed:true. Public request-teardown followed at sequence43. Fresh CUA tab inventory was empty.

This proves the native cleanup chain, not inline visual stability. Asked specifically about the retained Chat card, the user answered that it still flickers. Therefore the preceding diagnostic-unmount correction did NOT resolve the observed flicker. Its earlier bounded test result is not presented as a native pass. The inline Chat card is outside supported CUA observation; the human observation remains authoritative for this symptom.

## Additional application lifecycle defect

The Cockpit constructed its public MCP SDK App with autoResize:true. SDK connect installs a ResizeObserver for html/body and emits size-changed. The SDK's public setupSizeChangedNotifications method returns a cleanup function; automatic connect setup does not give EmbeddedEntry that disposer. Closing only removed React source/diagnostic views, so this independent SDK observer continued reacting to Host viewport/layout changes while the closed card was retained. SDK source confirms measurement temporarily changes html height to max-content, measures and restores it. This establishes the missing lifecycle cleanup and a plausible sizing feedback path, not native proof of the exact visual oscillator.

The Cockpit entry now explicitly selects autoResize:false and owns the public setupSizeChangedNotifications lifecycle. While ready/open, it starts the SDK observer. Leaving open disconnects it through layout-effect cleanup. Once closed, the application sends one measured content size through public sendSizeChanged; subsequent Host display-mode changes do not restart the observer or repeat that terminal size update. There is no vendor SDK patch, hidden API, Host RPC, new resize protocol, or alteration to cleanup/close authority. The shared bridge retains autoResize:true by default, including Gate Decision; only Cockpit opts into manual ownership.

The retained-card test now verifies observer disposal, a single final size report, no observer restart across inline/fullscreen/inline Host changes, no resumed reading, one Core close and one SDK teardown request. All 35 targeted tests pass; all 23 UI suites / 257 tests pass, TypeScript noEmit and MCP build pass. Native stability of the changed tuple remains unverified until loaded and observed.

## Installation boundary

Normal prepared candidate: `0.14.5+codex.local-759725390db7`, source `759725390db7e2bf662266675e71b483e37176a26a741228a597a4d3be9dad95`, Cockpit UI `sha256:fc7b127f5d864dd1e6e342283ca165d5b16b1825127100f7e6609a7db95f99e4`. The guarded owner restores its original verified rollback point before the normal public CLI registration/update; exact installation readback is retained with this note. A plugin reload is required for activation; no older native observation is transferred as qualification of these new bytes.

Actual legacy configuration is retained. Since the user reports unresolved native instability and the changed tuple has no fresh native proof, no qualified transition or guarded retirement is asserted. Complete origin/provider inventory, clean route evidence and later final CR/QA remain separate requirements. This is a source repair plus installation result, not completed Cockpit integration.

Evidence: `evidence/resize-cleanup-20261018/` and SHA256SUMS. Continuity: `CLOSED_CARD_FLICKER_REPAIR_20261018.md`, `NATIVE_SDK_CONTEXT_RACE_REPAIR_20261018.md`, `PLUGIN_DISCOVERY_FIX_20261018.md`, `LEGACY_CUTOVER_REVIEW_20261018.md` and canonical CD_TESTS.md. The earlier SDK diagnostic and explicit closure approvals remain scoped to this continued test; no gate approval is inferred.
