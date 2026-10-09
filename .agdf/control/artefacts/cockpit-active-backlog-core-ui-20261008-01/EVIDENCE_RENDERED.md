# Rendered browser evidence
Date: 2026-10-08. Scope: T-005; SCN-008/009/011/012/013/020.

The existing Playwright service harness rendered the real compact App at 320, 560, 800 and 1290 px in light and dark. Eight evidence/cockpit-core-ui-compact-{theme}-{width}.png captures were generated and visually inspected. Titles wrap without horizontal list overflow or line clamping; stored status is secondary and visible focus surrounds the title action. Five rows remain a row-count limit, not a pixel-height promise; pathological long titles yield a tall, readable card.

Assertions measure document scroll width, every row action/disclosure >=44 px, no row target horizontal overflow, normal title whitespace and no title clamp. Opening source disclosure exposes the original scope-tagged title and full next-step suffix ENTSCHEIDENDER SCHLUSS. Search finds fixture-a outside the initial five, expansion retains query and shows all eight when cleared, Enter opens exactly fixture-a and return restores query/focus. Native select is absent. Fixture .agdf/control paths and bytes are equal after this browser-only journey.

The browser matrix case passed in the full browser run. It is rendered browser evidence, not actual Codex width, host expansion or native app-only byte evidence.
