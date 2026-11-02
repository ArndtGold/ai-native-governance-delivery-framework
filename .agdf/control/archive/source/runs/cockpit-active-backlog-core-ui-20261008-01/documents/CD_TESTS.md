# CD+Tests
Decision: done (implementation and automated-test status only)
Date: 2026-10-08
Run: cockpit-active-backlog-core-ui-20261008-01
Based on: exact approved TP.md, sha256:b3cd38526653d1fcb4d056f9da17dd83271140ef3717f5d438a622d102f91b87.

The bounded Core/UI implementation is complete: one pure Core policy for area membership, reverse stored order, per-field stored search, title provenance, counts/completeness and identity; passive shared wrapping rows; active-only compact first-five preview; App-owned query/navigation/focus and deliberate stale overview reload. Private projection exclusions and focused documentation are updated. Raw DTO order, opaque selectors, read-only transport and authority boundaries are retained.

Verification: 63 Core, 7 service, 129 component checks pass; the final full browser rerun passes all 20 cases. Typecheck, browser/MCP builds, canonical projection/exclusions, runtime integrity, payload/variant/config tests and both fresh stdio protocol suites pass. See EVIDENCE_CORE.md, EVIDENCE_UI.md, EVIDENCE_BUILD.md, EVIDENCE_REGRESSION.md and EVIDENCE_RENDERED.md for commands, corrections and limits.

T-007 is partially done: new owned local package prepared and project connection configured, but fresh actual Codex rendering and app-only canonical-byte evidence remain open (EVIDENCE_NATIVE.md). This status does not mark every TP task done or grant QA/UAT/release. Required next step: review final diff/task coverage and hand the native evidence gap to QA.
