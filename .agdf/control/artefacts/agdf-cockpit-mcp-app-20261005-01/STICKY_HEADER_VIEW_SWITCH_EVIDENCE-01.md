# Sticky header and sliding view selector

Run: agdf-cockpit-mcp-app-20261005-01. Source revision: 50 / 41c9e3c2-1505-46b5-9788-719468adcc24. CD+Tests remains in_progress. Approved UR/PRD/SD/TP bytes are unchanged.

## Delivered behavior

The existing shared BrandHeader sticks inside the app document across card, Run, overview and registered document views. Logo, subtle background, Run context and refresh remain visible with an opaque Pages surface. ResizeObserver measures its height for focused-element scroll clearance. Sticky positioning cannot control the outer Codex chat container.

The two labelled view buttons share one sliding selection surface. Existing group/pressed-state and keyboard semantics remain; no host display-mode request occurs. It appears from 720px workspace width, never on documents. Narrowing returns to summary without resetting selection or captured reads, and widening retains that summary until deliberate selection. Reduced-motion suppresses sliding animation.

## Verification

66 UI tests, six browser journeys, 32 view/theme/width combinations, typecheck, browser/MCP builds, project config test and both actual stdio protocol eras pass. The new browser journey verifies card/document header position after scrolling, opaque cover, refresh availability, slider transforms, Space-key selection, document exclusion, narrow fallback, widening retention, reduced motion and source-return focus below the header. It preserves all fixture control bytes and makes no remote requests. Evidence logs and three screenshots are copied under context-evidence/sticky-* and context-evidence/sliding-summary.png; exact source/approved/runtime hashes are in STICKY_HEADER_VIEW_SWITCH_VERIFICATION-01.json.

The protocol test was repeated after owned preparation so its observed UI digest matches the current resource. The guarded refresh stopped only the named owned server and retained the project configuration byte-for-byte. Current exact-Run native opening returns Transport closed; this supersedes the prior work-step opening result for these latest bytes, without discarding that dated earlier evidence. Final native visual identity and remaining T-011/T-012, CR, QA/UAT and regular closeout obligations remain open. No context/question was sent and no approval or VCS action is inferred.

## Actual repository browser observation

The exact Run is selected in the local production build at http://127.0.0.1:53362/card.html. Summary selection preserves that Run, and the header has top 0 / height 96 / position sticky after scrolling, with Run title and refresh present. context-evidence/sticky-real.png and sticky-real-scrolled.png preserve the visible result. This is browser proof, not the unqualified native host.

The old preview had captured earlier build assets at startup. Restarting against the workspace output encountered asset_boundary_invalid twice; reading existing synchronized numbered HTML copies changed their ctime while content/mtime stayed unchanged. No synchronized copies or foreign files were removed and the service integrity checks were retained. The replacement preview uses a temporary six-file snapshot of the exact current HTML and referenced assets, verified byte-identical and hash-recorded. This preview preparation does not change production source or qualify the unrelated synchronization condition as repaired.
