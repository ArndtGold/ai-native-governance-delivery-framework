# Document reading surface, symmetry and Pages colors

Status: scoped source/browser/protocol and named-runtime update verified; new native reconnect/display pending. Run: agdf-cockpit-mcp-app-20261005-01; pre-bookkeeping revision 82 (213f5689-973f-4924-a70a-cc38412e81fa). Human request: fix it, following the explicit symmetry/background assessment.

## Result

The expanded document reader now groups title, observation/read feedback, authored orientation, saved/Core status, provenance, exact original and context access on one neutral Pages surface. It is centered with a maximum width of 80ch including shared-token padding. The text blocks and context action share an inner edge; the wider brand header is unchanged. Breadcrumb and footer widths follow the reading surface. The context entry is a 44px accessible text action inside the surface; opening its existing graph/handoff UI uses the existing owner and guards. Original documents, including the compact document reader, no longer add a nested frame or shadow. No new palette, font, status, control rule, wire DTO, persistent summary store or approval source was added.

## Qualification

All 92 UI tests, typecheck, browser/MCP builds, generated Pages-token and diff checks pass. Eleven unique browser cases passed across the qualified batch and targeted replays. Real-Run document checks compare saved approved facts with unchanged draft/open source metadata, equal gutters and inner edges within 1px, no horizontal overflow, both Pages themes at 320/560/800/1280px, passive original/source disclosure and exact return focus. Pages reference checks verify the reading-surface recipe, context action brand color and >=4.5 text contrast. The embedded-card browser entry also opens the same actual Run/source and captures settled light/dark previews at 845px; these are browser previews, not native screenshots.

Retained failed attempts are explicit in DOCUMENT_SURFACE_VERIFICATION-08.json: early full runs rejected asset fingerprint reads before UI, and a later real-Run navigation capture needed an explicit Details-state wait. The direct stat diagnostic did not reproduce the file mismatch; its external cause is unconfirmed. Targeted checks pass without weakening file guards, security policy, assertions or timeout limits. The named package was independently assembled and qualified for both stdio eras before replacement.

The existing opt-in preparation and owned retirement services refreshed only the named project-local runtime under the continued prior local activation authorization. Exactly two freshly verified same-profile processes were retired; project configuration is byte-identical. Fresh registered-entrypoint readback in both eras verifies package markers, exact resource bytes/hash, the bound actual Run and unchanged canonical bytes. Server e8dc4ebc8535e7ec53a5197cc47be5c4f0583cc3571035daf7e5e8e75f3d8539; UI sha256:7d55ed54cf1eaf8994441bf6511f1c2de535ad0db3417c38c365e67d20618f7a (1,031,985 bytes). Agent performed no VCS action; externally changed HEAD/index were preserved. Approved sources are unchanged.

## Current host boundary

One named native opening after refresh returned Transport closed. Restart/reopen Codex to load the changed resource in a fresh native view. HOST_DOCUMENT_ORIENTATION-07 qualifies its preceding document build only; it does not prove this changed layout. No packet or question was sent and no host-context erasure is claimed. CD+Tests stays in_progress; new native display/recovery/rollback, task fulfilment/CR/QA/UAT/OR remain open.
