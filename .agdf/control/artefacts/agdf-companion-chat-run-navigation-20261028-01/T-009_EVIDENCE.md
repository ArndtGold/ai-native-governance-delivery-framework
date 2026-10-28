# T-009 Live Check: Chat-Run Navigation in the Claude Desktop App

- run_id: `agdf-companion-chat-run-navigation-20261028-01`
- date: 2026-10-28, 11:08 to 11:11
- host: Claude desktop app on Windows (Code tab), engine 2.1.308; this session in its own pop-out window (1143 × 884)
- vehicle: the final working tree copied into this session's dev-mods folder as `agdf-companion-probe` (own pane, command and state file, switched on by default), loaded by the host's mod reload; removed after the check
- installed build: this branch's build installed into the real Claude (`probe-results/f9i`, `result: success`); the 13 installed companion files are byte-identical to the generated ones, so a new session runs the same code
- project: this repository's worktree with 57 open runs

| Scenario | Observation | Screenshot |
|---|---|---|
| SCN-016 (narrow) | The list of 57 open runs fills the pane and ends with "+ 49 weitere"; the framed footer meets the pane's bottom margin, no scrollbar | `live/10-t009-list-footer-narrow.png` |
| SCN-022, SCN-013 | My final answer named `repository-control-compatibility-20260930-01`; during the next turn the panel showed that run with "Im Chat genannt" and "wartet auf Freigabe" (not "läuft"), the stepping buttons under it | `live/11-t009-named-waiting-during-turn.png` |
| SCN-010 | "Nächster Run" showed `mcp-zielarchitektur-doku-…` with "Von dir ausgewählt" and the plain button "Zurück zum Chat-Run" below the stepping buttons | `live/12-t009-browsing-return-button.png` |
| SCN-010 (menu) | The open menu listed "Zurück zum Chat-Run" first, after the neutral entry "AGDF Companion"; the menu was closed through the neutral entry | `live/13-t009-menu-return-entry.png` |
| SCN-008 | The next main-loop turn showed the chat's run again with "Im Chat genannt" | `live/14-t009-auto-return.png` |
| SCN-016 (widened) | Widened through the pane's control: the full gate bar, the footer at the bottom margin, no scrollbar; narrowed again afterwards | `live/15-t009-footer-wide.png` |
| SCN-013 (question) | A capture timed for an open question landed just after the owner answered, still within the same running turn: the panel showed "wartet auf Freigabe" | `live/16-t009-after-question-same-turn.png` |
| SCN-020 | SHA-256 of all 150 `RUN_STATE.md` files before and after the check are identical | `live/t009-hashes-before.txt`, `live/t009-hashes-after.txt` |

Notes:

- The waiting rule depends on the turn being active, not on the kind of question; SCN-013 is shown by two captures during running turns (`live/11`, `live/16`).
- The status line of the probe is folded behind "+1" in the footer of the desktop window, because the installed companion's entry stands first; status line and toasts while browsing are covered by the adapter suite (SCN-011).
