# Responsive Cockpit follow-up evidence
Date: 2026-10-08. Run: cockpit-active-backlog-core-ui-20261008-01. Requested by the user: compact preview of at most three entries, responsive use of width/height, and a scrollable full list in the large view.

## Implemented behavior
- Compact renders the first three Core matches after searching all readable active entries. Titles and stored statuses lead; the full next step stays in source disclosure. All-matches expansion preserves query. Inline list height follows content and has no internal scroll.
- Expanded overview exposes all matches in one keyboard-focusable scroll region. Header, area selection, search and counts remain outside that region. Grid rows reserve actual controls height and at least 120px for the list; size containment prevents the entire list's intrinsic height from determining the viewport. Very short windows retain outer main scrolling so controls remain reachable.
- Actual container width determines one or two entry columns (1000px) and stacked or adjacent area/search controls (720px). No width/height polling, extra snapshots, persistent UI store or duplicate Core policy was added.
- Compact diagnostics use the existing Core-selected active-area diagnostics. Unreadable Planned/Archive no longer produces a blanket Active warning.
- Stored ordering, exact run keys, source disclosure, query/focus recovery, and human decision authority retain their existing owners. No pinned row reorders the source.

## Verification
- Typecheck, production browser build and MCP build: pass. 130 component tests and 7 HTTP service tests: pass. Final full browser run: 20/20 pass against frozen assets /private/tmp/agdf-cockpit-responsive-ui-07.
- Browser checks cover 320/560/800/1280px light/dark wrapping, three-row counts, full-corpus search, exact expansion/return, keyboard End scrolling, unchanged search position/window scroll, full source suffix at the list end, 560px panel in a 1600px browser, and 360/600/1000px heights without footer overlap.
- Final prepared package passed both actual stdio suites under both supported protocols (2025-11-25 and 2026-07-28), including exact served HTML digest and read-only fixture path/byte equality.
- The unchanged Core implementation retains its earlier 63 passing cases in EVIDENCE_CORE.md; these were not redundantly rerun for presentation-only changes.
- Screenshots were visually inspected; representative captures and raw logs are in evidence/. Test/API activity uses disposable fixtures. No app-only live native no-write observation is claimed for this new build.

## Corrections during verification
A fixed minimum of the outer results area initially allowed the footer to overlap overflowing controls. Intrinsic grid sizing plus a contained list viewport corrects the production cause; the browser now asserts non-overlap at three heights. Per-control scroll clearance inside the list no longer reserves space for an unrelated outer sticky header. An existing component event test raced subscription setup; it now waits for the actual listener before delivering its change event.

## Scope and identity
The user requested a three-entry preview after the previous five-entry implementation; this is an explicitly requested presentation refinement within AC-004's at-most-five ceiling. The numerical five-row examples in the previously approved sources remain historical and were not silently edited or re-approved. Shared Core membership/order/search and accepted read-only authority are unchanged. Layout refinement follows existing T-003/005; packaging and native qualification remain T-006/007. No two-pane run-reader architecture was introduced.

UI: 1054755 bytes, sha256:3981da30280eec00e65bbb45bc545f30a4b277d0d359f52988b1e1e390dfcfad. Server digest: 910ab0bffc28582a75b0109dbceec678944588a99ff7ef428a435bbf68a0454c. Owned profile: codex-cockpit-responsive-20261008-07. Existing project connection agdf-cockpit-local points to this prepared profile; other config text is retained. activated=false remains truthful: the running host has not reconnected.

## Limits and next step
Earlier native observations remain historical evidence of the earlier resource, not acceptance of this build. TPR-001 remains evidence_gap / evidence_obligation / open. Complete fresh actual compact/expanded rendering, width/display result and app-only canonical path/byte qualification after reconnect. QA remains revise; no QA/UAT approval or delivery readiness is claimed.
