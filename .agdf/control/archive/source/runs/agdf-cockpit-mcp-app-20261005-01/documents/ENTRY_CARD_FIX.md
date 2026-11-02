# Compact Entry Fix — 2026-10-06

Status: implemented and locally prepared; post-update native host confirmation pending.
User request: fix the sparse embedded entry; subsequent sidebar question addressed by removing duplicate navigation from the embedded surface only.

## Changes

- The existing React App reading controller is shared by compact and full presentation. Inventory is read as soon as the bridge is ready; explicit run selection is required.
- Compact view shows actual target name, inventory counts, selected run, Core gate, labelled persisted working state, missing evidence, next allowed step and recorded approved gates. No guessed active run or invented approval.
- Selection survives the display-mode transition because the App instance and reading state are retained. No URL/browser storage assignment.
- Previous source content remains explicitly stale after failures; current-run expansion stays disabled until a successful refresh. Registered documents stay in the existing detail reader.
- The MCP-only stylesheet hides the sidebar and resets workspace offsets. Browser navigation remains intact. This also removes the overlay that obscured the synthetic test button.
- Initial and changed host theme/style variables are applied through the pinned SDK helpers.
- Full graph/production context handoff is outside this bounded entry correction and remains unqualified.

## Verification

- TypeScript check passed.
- React suites: 10 tests passed (existing 8 plus 2 meaningful entry tests for explicit selection/shared-state expansion and stale reload safety).
- Single HTML resource build passed: 621676 bytes, sha256:bab764e51af355f6dd2b5a82411c3c42fc2861e3ad16caa9a5232a60c3f372d8.
- Owned final-runtime MCP stdio test passed for 2025-11-25 and 2026-07-28: expected tools/resource, bounded reads, selectors, no fixture writes, session replacement and unchanged default inventory.
- Final server digest: 1f55ffd0fc6460793ca846fa75f2fee8399fee2c4cf3082fdc36bc87e9889736; dispatcher: 869727f0703b980c812c26ae987f98998f0dad25881a3f06664820e452d47b1c; SDK: 02e7212cc00a844c08ac190c572b98dd9aa52671936cb4900808460d44c543d9.
- Targeted canonical Codex asset sync passed. No Copilot baseline increase or full cross-host success claim.
- Existing owned local runtime preparation and provenance writer used. Matching named processes were stopped; original project configuration preserved byte-for-byte. codex mcp get confirmed the named configuration.
- git diff --check passed. Approved UR/PRD/SD/TP hashes unchanged.
- ENTRY_CARD_PREVIEW.png is a browser layout observation of the actual CompactCockpit renderer and captured real local Core DTOs, not a native MCP/bridge qualification. ENTRY_CARD_PREVIEW.html is the passive snapshot; its controls do not execute actions.

## Host observation and outstanding action

Before runtime refresh, actual Codex native render succeeded, the user expanded the app, and an agent-observed panel read inventory (112 runs/45 active) and this run's actual detail/revision 4d372b0f-be9c-44d1-9401-c5645fa476cb. Opening Host-Prüfung revealed that the fixed rail obscured Testkontext übergeben. A click was rejected as obscured; neither context nor question was sent.

The user explicitly requested that the agent perform both labelled synthetic test actions. That request remains pending. Following the final owned refresh, the tool handles returned but native agdf_cockpit returned Transport closed. This is connection evidence, not a finding that Codex lacks the bridge methods. Post-update native render, layout, display transition, exact host version/capabilities and both method outcomes remain unverified. A fresh host connection is required before the one deliberate context action and separate question action can be executed. No automatic resend on uncertain delivery.

T-006 remains unqualified overall; CD+Tests remains in_progress. No CR/QA/UAT/OR completion or VCS action.
