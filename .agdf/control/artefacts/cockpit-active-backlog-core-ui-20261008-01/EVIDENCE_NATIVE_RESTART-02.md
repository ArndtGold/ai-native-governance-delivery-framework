# Native qualification after Codex restart

Date: 2026-10-08. Status: partial; T-007 and TPR-001 remain open. Run: cockpit-active-backlog-core-ui-20261008-01. Scope: SCN-010/014/024 and AC-004/005/008. This updates the earlier absence-of-access observation in EVIDENCE_NATIVE.md; it does not approve a gate.

## Actual application and identity

After the user's Codex restart, the bound tool invocation used the established run_id and returned the correct repository target and authorizes:false. The native MCP App became accessible in the task's side panel. Alle Vorhaben deliberately opened its overview. It shows 58 Active entries, the current Core/UI undertaking first, stored-field search and the new section/match counters. Planned diagnostics do not falsely qualify Active's complete count.

The host diagnostic self-reports name chatgpt, version 26.1002.52244 and display fullscreen. These are reported host facts inside Codex, not inferred branding. The inspected side-panel viewport is 493 by 1262 CSS pixels and uses the expanded overview, not .compact-cockpit. The displayed capability object has no displayModes entry. An application-requested expansion outcome is not inferred from the container's current display.

Prepared profile codex-cockpit-core-ui-20261008-02 has UI bytes 1052651 and digest sha256:551cf9bf88c24df33618e634eb1e3474cc344fecf1191d20ddf54dd3080a59a1; prepared server digest 32125f11a55c4f701a640fe0e89c3326f1a8f43b3161ac73e761efeb49b49954. The complete native DOM module (666046 characters) and application stylesheet (386026 characters), read in bounded chunks to avoid string truncation, match the prepared resource byte for byte. Two additional host style elements are not claimed as application bytes. Raw chunks and digests: evidence/native-payload-chunks03.json and evidence/NATIVE_IDENTITY-03.json.

The MCP resource helper truncates full HTML. Its truncated response is not hashed as the full resource. The digest above describes the prepared resource; identical native module/style payloads independently establish which UI is rendered. A separately observed full served-HTML digest remains absent under the literal T-007 requirement.

## Actual reading journeys

1. Expanded Active list: 58 stored rows; newest stored undertaking first.
2. Search Separate Solution Design: one result, outside the initial five rows, titled Separate Solution Design authoring from gate-check.
3. Source disclosure exposes original key sd-definition-separation-20261004-01, MASTER_BACKLOG.md path/digest, stored title, supplementary UR heading/path/digest and complete next step. No work or approval action is invoked.
4. Selection opens that exact Run. Alle Vorhaben returns to the same query and focuses data-focus-id=sd-definition-separation-20261004-01. No different Run is silently substituted.
5. Neu laden completes with the query and single result retained, source disclosure closed, and focus on Aktive Vorhaben. The displayed timestamp advances to 17:59:12 local time. Capture/DOM: evidence/native-reload04.png and .txt.
6. Search Remove three false-confidence shows a stored Completed entry still in Active membership. The complete long title wraps in a 419 by 110 CSS-pixel button; document clientWidth and scrollWidth are both 493. Capture/DOM: evidence/native-long04.png and .txt. This is expanded native-width evidence, not a compact measurement.

The user separately tested the requested inline journey and answered Ja, beides funktioniert to whether at most five active entries appear initially and searching Separate Solution Design finds the undertaking. This is direct user-reported native evidence for those two outcomes. It is not Approval: QA or Approval: UAT. It does not supply a compact-width capture or expansion result.

## App-only canonical path and byte comparisons

The following windows contain no artefact persistence or governance bookkeeping:

| window | local time Europe/Berlin | actions | result |
|---|---|---|---|
| 03 | 17:53:24–17:56:31 | Bound invocation, overview, host diagnostic, payload reading, search and interrupted capture | All 3831 pre-existing control-file paths, sizes and SHA-256 bytes identical |
| 04 | 17:57:21–18:00:26 | Disclosure, exact selection/return, deliberate reload, long-title search/capture | All 3831 pre-existing control-file paths, sizes and SHA-256 bytes identical |

Raw manifests: evidence/native-before-03.json, native-after-03.json, native-before-04.json and native-after-04.json. Summary: evidence/NATIVE_FILE_COMPARISON-03-04.json. No changes are subtracted or excused as bookkeeping. The comparison covers these windows, not the user's separate uninstrumented inline journey. Observed reading actions send no model work request or gate approval; file hashes alone are not used to prove that authority boundary.

## Remaining obligation

Obtain an actual compact width/render capture and recorded application expansion result with query retention (or explicit refusal), and complete literal served-resource identity qualification. The App browser exposes side-panel tabs only; inline content cannot be inspected through this backend. Some combined capture calls timed out; later separated capture/save calls succeeded. Automation timeouts are not classified as product defects without evidence.

T-007 stays partially_done; TPR-001 retains evidence_gap / evidence_obligation / open. The approved product scope and approvals are unchanged. The existing sealed QA_REPORT.md is the earlier review snapshot; QA_NATIVE_ADDENDUM-02.md records the current assessment without replacing that canonical report.
