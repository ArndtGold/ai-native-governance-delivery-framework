# Shared Pages surface alignment — light and dark

- Run: agdf-cockpit-mcp-app-20261005-01
- Bound source revision: 54 / ff7b1de7-6c3b-4cc1-a85f-ca78aa920bb4
- Status: bounded implementation and verification passed; current native UI remains unconfirmed
- Exact source/output hashes and startup tuple: PAGES_SURFACE_VERIFICATION-03.json

## Correction

Pages owns one shared surfaces.css recipe for ordinary and controlled surfaces and source links. The Cockpit imports it directly. Neutral MCP host palette variables no longer replace the brand palette; the host still selects the theme. Shared controlled surface specificity preserves the work-step emphasis in both compact and expanded views. Source buttons retain semibold weight and Pages normal/hover colors. New Run navigation starts in Summary; an explicitly chosen Details mode survives same-Run refresh and document return. Sticky header, transparent refresh, labelled sliding selector, document exclusion and narrow summary fallback remain intact.

## Verification

68 UI tests pass. The seven existing browser journeys pass, including the 32 view/theme/viewport combinations. The eighth new theme journey passes separately, checking ten computed surface observations against the canonical Pages recipes with hostile neutral host colors: backgrounds, borders, radii and shadows match; Run source links are semibold, their normal and hover colors match, hover remains transparent and checked text/link contrast is at least 4.5:1. Summary entry and document return pass. The interrupted full attempt and failed hover-state test are retained separately; they are not a completed all-eight suite and no assertions were skipped. UI test expectations and document journeys now explicitly select Details where full sources are required.

Typecheck, browser/MCP builds, Pages build and landing regression, public document/route tests, generated token check and diff whitespace check pass. Both fresh actual stdio protocol eras pass with unchanged inventory and no control writes. Approved UR/PRD/SD/TP and project configuration remain hash-identical. Logs, observations and all ten theme test images are copied under context-evidence/pages-surfaces-03-*.

The real repository Run was opened through the Codex browser and visually inspected in light and dark. PAGES_REAL_RUN-03-light.png and PAGES_REAL_RUN-03-dark.png capture source revision 54. Dark uses an HTML-only data-theme fixture over byte-identical production CSS/JS/fonts; this is browser evidence, not native host theme evidence.

## Boundary

Owned MCP preparation is updated to UI sha256:b13a0b01a2c53d3cd815c46c6d40a242b22aad7797158d1bb5cdea7ac9246872 (1017392 bytes). The single exact-Run native opening returned Transport closed. Current native visual/loading identity, remaining host recovery/rollback and answer quality, full reviews and canonical QA/UAT/closeout remain open. CD+Tests stays in_progress; no approval, message resend, VCS action or lifecycle completion is inferred.
