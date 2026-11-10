# Codex Desktop Cockpit session expiry

The open Cockpit card displayed **Sitzung abgelaufen** after its automatic
background check received `session_expired`. The previous Run data remained
visible and the refresh button was disabled. The card stayed open throughout the
check.

| Test identity | Observed value |
|---|---|
| Date and time | 9 November 2026, 11:01 CET |
| Host | Codex Desktop on macOS, build `26.1103.41825` |
| Installed AGDF plugin | `0.31.0+codex.local-3a9440a2225f` |
| Candidate source | `6e4517b0f40b8341863bbda0214a45d731254b18` plus the three-file Cockpit fix and regression test |
| Installed Cockpit bundle SHA-256 | `aed2d0c45ca887e3d983031ed11354999d37c4ad0240a8199861db756cb05933` |
| Synthetic Run | `run-52165c51-1cc7-42a6-b83e-279b98b4b536` (`Independent work`) |
| AGDF delivery Run | `run-334e35f4-6b3a-4cfd-9145-cafb4e7c4b02` |

## Observed sequence

1. Opened a new card for the synthetic Run after restarting Codex Desktop with
   the local plugin installed. The expanded card displayed the Run as
   **Verfügbar**, with an observation time of 10:59:39 CET.
2. Sent `close` for the card's bound read session. The service returned
   `closed: true`. No second card or manual refresh was involved in this check.
3. At 11:01:37 CET the Desktop log recorded `session_expired` for the same card's
   automatic read. At 11:01:41 CET a direct inspection of the open card showed
   **Sitzung abgelaufen**, a disabled refresh button and **Vorheriger Datenstand
   bleibt sichtbar**. The Run heading and registered source reference remained
   visible.

An earlier attempt confirmed the service response but could not read the card
afterwards. The sequence above uses the later, directly observed card.

## Scope of evidence

This observation covers the expired-session recovery state in the installed
macOS Desktop build. It uses explicit session retirement to exercise the real
background read path. Elapsed timeout timing, other hosts and release
qualification are outside this observation. The [automated regression test](../../../packages/control-ui/test/mcp-changes.test.tsx)
also covers the generic read failure and its retry action.
